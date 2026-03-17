<?php

namespace App\Http\Controllers;

use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class WalletController extends Controller
{
    public function balance(Request $request): JsonResponse
    {
        $user = $request->user();
        return response()->json([
            'data' => [
                'balance'  => $user->wallet_balance,
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
            'payment_ref'    => 'nullable|string',
        ]);

        return DB::transaction(function () use ($request) {
            $user = auth()->user();

            $tx = WalletTransaction::create([
                'user_id'        => $user->id,
                'type'           => 'top_up',
                'amount'         => $request->amount,
                'description'    => "Top-up via {$request->payment_method}",
                'payment_method' => $request->payment_method,
                'payment_ref'    => $request->payment_ref,
                'status'         => 'completed',
            ]);

            $user->increment('wallet_balance', $request->amount);

            return response()->json([
                'data'    => ['transaction' => $tx, 'new_balance' => $user->fresh()->wallet_balance],
                'message' => 'Wallet topped up successfully.',
            ]);
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
                'type'        => 'spend',
                'amount'      => -$request->amount,
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
