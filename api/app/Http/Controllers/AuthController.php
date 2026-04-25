<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rules;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Str;
use PragmaRX\Google2FA\Google2FA;

class AuthController extends Controller
{
    protected \App\Services\MailjetMailService $mailjetMail;
    protected Google2FA $google2fa;

    public function __construct(\App\Services\MailjetMailService $mailjetMail)
    {
        $this->mailjetMail = $mailjetMail;
        $this->google2fa = new Google2FA();
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        $user = Auth::user();

        // Check if 2FA is enabled AND confirmed
        if ($user->two_factor_secret && $user->two_factor_confirmed_at) {
            // Log out the user immediately from standard session
            Auth::logout();
            
            // Return a 202 response to signal that 2FA is required
            return response()->json([
                'message' => 'Two-factor authentication required.',
                'data'    => [
                    'two_factor_required' => true,
                    'email'              => $user->email, // Needed for the challenge
                ]
            ], 202);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'data' => [
                'access_token' => $token,
                'token_type'   => 'Bearer',
                'user'         => $user,
            ],
            'message' => 'Logged in successfully.',
        ]);
    }

    /**
     * Verify 2FA code during login challenge.
     */
    public function verify2fa(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'code'  => 'required|string|size:6',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !$user->two_factor_secret) {
            return response()->json(['message' => 'Invalid request.'], 400);
        }

        $valid = $this->google2fa->verifyKey($user->two_factor_secret, $request->code);

        if (!$valid) {
            return response()->json(['message' => 'Invalid 2FA code.'], 422);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'data' => [
                'access_token' => $token,
                'token_type'   => 'Bearer',
                'user'         => $user,
            ],
            'message' => 'Logged in successfully.',
        ]);
    }

    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'name'                  => 'required|string|max:255',
            'email'                 => 'required|string|lowercase|email|max:255|unique:users',
            'password'              => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => 'customer',
        ]);

        event(new Registered($user));

        try {
            $this->mailjetMail->sendWelcomeEmail($user);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Welcome email failed: " . $e->getMessage());
        }

        return response()->json([
            'data'    => ['user' => $user],
            'message' => 'Registration successful. Please verify your email.',
        ], 201);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function user(Request $request): JsonResponse
    {
        return response()->json(['data' => $request->user()]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink($request->only('email'));

        return response()->json([
            'message' => $status === Password::RESET_LINK_SENT
                ? 'Reset link sent to your email.'
                : 'Unable to send reset link.',
        ], $status === Password::RESET_LINK_SENT ? 200 : 422);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token'                 => 'required',
            'email'                 => 'required|email',
            'password'              => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill(['password' => Hash::make($password)])->save();
                $user->tokens()->delete();
            }
        );

        return response()->json([
            'message' => $status === Password::PASSWORD_RESET
                ? 'Password has been reset.'
                : 'Invalid token or email.',
        ], $status === Password::PASSWORD_RESET ? 200 : 422);
    }

    public function refresh(Request $request): JsonResponse
    {
        $request->validate(['refresh_token' => 'required|string']);

        return response()->json(['message' => 'Token refresh is handled via new login.'], 422);
    }

    public function verifyEmail(Request $request): JsonResponse
    {
        $request->user()->markEmailAsVerified();
        return response()->json(['message' => 'Email verified successfully.']);
    }

    /* 
    |--------------------------------------------------------------------------
    | TWO-FACTOR AUTHENTICATION (2FA) - Phase 7
    |--------------------------------------------------------------------------
    */

    public function setup2fa(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Generate a new secret if it doesn't exist
        if (!$user->two_factor_secret) {
            $user->two_factor_secret = $this->google2fa->generateSecretKey();
            $user->save();
        }

        $qrCodeUrl = $this->google2fa->getQRCodeUrl(
            config('app.name', 'UpgraderCX'),
            $user->email,
            $user->two_factor_secret
        );

        return response()->json([
            'data' => [
                'secret'       => $user->two_factor_secret,
                'qr_code_url'  => $qrCodeUrl,
                'is_confirmed' => !is_null($user->two_factor_confirmed_at),
            ]
        ]);
    }

    public function confirm2fa(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = $request->user();
        
        if (!$user->two_factor_secret) {
            return response()->json(['message' => '2FA is not set up.'], 400);
        }

        $valid = $this->google2fa->verifyKey($user->two_factor_secret, $request->code);

        if (!$valid) {
            return response()->json(['message' => 'Invalid verification code.'], 422);
        }

        $user->two_factor_confirmed_at = now();
        
        // Generate recovery codes if they don't exist
        if (!$user->two_factor_recovery_codes) {
            $codes = collect(range(1, 8))->map(fn() => Str::random(10) . '-' . Str::random(10))->toArray();
            $user->two_factor_recovery_codes = encrypt(json_encode($codes));
        }

        $user->save();

        return response()->json([
            'message' => 'Two-factor authentication enabled successfully.',
            'data'    => [
                'recovery_codes' => json_decode(decrypt($user->two_factor_recovery_codes)),
            ]
        ]);
    }

    public function disable2fa(Request $request): JsonResponse
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        $user = $request->user();

        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid password.'], 422);
        }

        $user->two_factor_secret = null;
        $user->two_factor_confirmed_at = null;
        $user->two_factor_recovery_codes = null;
        $user->save();

        return response()->json(['message' => 'Two-factor authentication disabled.']);
    }
}
