<?php

namespace App\Http\Controllers;

use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class WalletController extends Controller
{
    protected \App\Services\BrevoMailService $brevoMail;

    public function __construct(\App\Services\BrevoMailService $brevoMail)
    {
        $this->brevoMail = $brevoMail;
    }

    public function balance(Request $request): JsonResponse
    {
        $user = $request->user();
        return response()->json([
            'data' => [
                'balance'  => (float) $user->wallet_balance,
                'currency' => 'EUR',
                'user_id'  => $user->id,
            ],
        ]);
    }

    public function transactions(Request $request): JsonResponse
    {
        $query = WalletTransaction::where('user_id', auth()->id())
            ->when($request->type, fn ($q) => $q->where('type', $request->type))
            ->orderBy('created_at', 'desc');

        return response()->json($query->paginate($request->per_page ?? 15));
    }

    public function topUp(Request $request): JsonResponse
    {
        $request->validate([
            'amount'         => 'required|numeric|min:1|max:10000',
            'payment_method' => 'required|string',
        ]);

        $user = auth()->user();
        $amount = $request->amount;
        
        // Calculate Bonus (matching frontend logic)
        $bonus = 0;
        if ($amount >= 100) $bonus = 5;
        elseif ($amount >= 50) $bonus = 2;

        $totalToCredit = $amount + $bonus;

        return DB::transaction(function () use ($user, $amount, $bonus, $totalToCredit, $request) {
            $tx = WalletTransaction::create([
                'user_id'        => $user->id,
                'type'           => 'credit',
                'amount'         => $totalToCredit, // Store the final amount to be added
                'description'    => "Top-up via PayHub (€{$amount}" . ($bonus > 0 ? " + €{$bonus} bonus" : "") . ")",
                'payment_method' => $request->payment_method,
                'status'         => 'pending',
            ]);

            $payHub = app(\App\Services\PayHubService::class);
            $checkout = $payHub->createGenericCheckout(
                "W-{$tx->id}",
                (float)$amount,
                $user->email,
                config('services.payhub.success_url') . "?topup_id={$tx->id}",
                config('services.payhub.cancel_url') . "?topup_id={$tx->id}"
            );

            if ($checkout['success']) {
                $tx->update(['payment_ref' => $checkout['invoice_id'] ?? null]);
                
                return response()->json([
                    'checkout_url' => $checkout['checkout_url'],
                    'message'      => 'Redirecting to payment gateway...',
                ]);
            }

            return response()->json(['message' => 'Payment gateway error: ' . ($checkout['message'] ?? 'Unknown')], 422);
        });
    }

    public function spend(Request $request): JsonResponse
    {
        $request->validate([
            'amount'      => 'required|numeric|min:0.01',
            'description' => 'required|string',
        ]);

        return DB::transaction(function () use ($request) {
            $user = auth()->user();

            if ($user->wallet_balance < $request->amount) {
                return response()->json(['message' => 'Insufficient wallet balance.'], 422);
            }

            $tx = WalletTransaction::create([
                'user_id'     => $user->id,
                'type'        => 'debit',
                'amount'      => $request->amount,
                'description' => $request->description,
                'status'      => 'completed',
            ]);

            $user->decrement('wallet_balance', $request->amount);

            return response()->json([
                'data'    => ['transaction' => $tx, 'new_balance' => $user->fresh()->wallet_balance],
                'message' => 'Wallet charged successfully.',
            ]);
        });
    }
}
