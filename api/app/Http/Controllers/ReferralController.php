<?php

namespace App\Http\Controllers;

use App\Models\Referral;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReferralController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Load the relationship and alias it to 'referred_user' if needed, 
        // or just rely on the model. Assuming the model has a 'referred_user' relationship.
        // We will just rename the output in a map if the relationship is named 'referred'
        $referrals = Referral::with('referred')
            ->where('referrer_id', auth()->id())
            ->latest()
            ->paginate($request->per_page ?? 15);

        // Map the relationship so frontend sees 'referred_user'
        $referrals->getCollection()->transform(function ($ref) {
            $ref->referred_user = $ref->referred;
            return $ref;
        });

        // The frontend expects the array in 'data', which paginate() provides as 'data'.
        // However, if we just return $referrals, it will be the paginator.
        // Wait, frontend listRes?.data might expect the plain array or paginated data.
        // In Referrals.tsx: listRes?.data || [];
        // If it's paginated, Axios response.data is the JSON body, which will have response.data.data.
        // So let's return just the array for now if frontend isn't handling pagination properly,
        // or return the paginated response and let frontend handle it.
        // Actually, returning response()->json(['data' => $referrals->items()]) is safer for the `listRes?.data || []` pattern.
        return response()->json(['data' => $referrals->items()]);
    }

    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Fetch commission rate from settings (default to 10 if not set)
        $commissionRate = \App\Models\AdminSetting::where('key', 'referral_commission_rate')->value('value') ?? 10;

        $stats = [
            'referral_code'   => $user->referral_code,
            'referral_url'    => url('/register?ref=' . $user->referral_code),
            'total_referrals' => Referral::where('referrer_id', $user->id)->count(),
            'total_earned'    => Referral::where('referrer_id', $user->id)->sum('commission'),
            'commission_rate' => (float) $commissionRate,
        ];

        return response()->json(['data' => $stats]);
    }
}
