<?php

namespace App\Http\Controllers;

use App\Models\Referral;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReferralController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $referrals = Referral::with('referred')
            ->where('referrer_id', auth()->id())
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json($referrals);
    }

    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        $stats = [
            'referral_code'  => $user->referral_code,
            'referral_link'  => url('/register?ref=' . $user->referral_code),
            'total_referred' => Referral::where('referrer_id', $user->id)->count(),
            'total_earned'   => Referral::where('referrer_id', $user->id)->sum('commission'),
        ];

        return response()->json(['data' => $stats]);
    }
}
