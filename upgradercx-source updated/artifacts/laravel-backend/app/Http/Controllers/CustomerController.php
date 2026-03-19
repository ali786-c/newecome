<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Order;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class CustomerController extends Controller
{
    public function adminDashboard(): JsonResponse
    {
        $stats = [
            'total_customers' => User::where('role', 'customer')->count(),
            'total_orders'    => Order::count(),
            'total_revenue'   => Order::where('status', 'completed')->sum('total'),
            'pending_orders'  => Order::where('status', 'pending')->count(),
            'active_today'    => User::whereDate('last_login_at', today())->count(),
        ];

        return response()->json(['data' => $stats]);
    }

    public function index(Request $request): JsonResponse
    {
        $query = User::where('role', 'customer')
            ->when($request->search, fn ($q) => $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('email', 'like', "%{$request->search}%"))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->orderBy($request->sort_by ?? 'created_at', $request->sort_dir ?? 'desc');

        return response()->json($query->paginate($request->per_page ?? 15));
    }

    public function show(int $id): JsonResponse
    {
        $user = User::where('role', 'customer')->findOrFail($id);
        return response()->json(['data' => $user]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::where('role', 'customer')->findOrFail($id);

        $data = $request->validate([
            'name'   => 'sometimes|string|max:255',
            'email'  => "sometimes|email|unique:users,email,{$id}",
            'status' => 'sometimes|in:active,suspended',
        ]);

        $user->update($data);

        return response()->json(['data' => $user, 'message' => 'Customer updated.']);
    }

    public function destroy(int $id): JsonResponse
    {
        User::where('role', 'customer')->findOrFail($id)->delete();
        return response()->json(['message' => 'Customer deleted.']);
    }

    public function suspend(int $id): JsonResponse
    {
        $user = User::where('role', 'customer')->findOrFail($id);
        $user->update(['status' => 'suspended']);
        return response()->json(['data' => $user, 'message' => 'Customer suspended.']);
    }

    public function activate(int $id): JsonResponse
    {
        $user = User::where('role', 'customer')->findOrFail($id);
        $user->update(['status' => 'active']);
        return response()->json(['data' => $user, 'message' => 'Customer activated.']);
    }

    public function orders(int $id): JsonResponse
    {
        $user   = User::where('role', 'customer')->findOrFail($id);
        $orders = Order::with('items.product')->where('user_id', $user->id)->latest()->paginate(15);
        return response()->json($orders);
    }

    public function wallet(int $id): JsonResponse
    {
        $user = User::where('role', 'customer')->findOrFail($id);
        $txs  = WalletTransaction::where('user_id', $user->id)->latest()->paginate(15);
        return response()->json(['data' => ['balance' => $user->wallet_balance, 'transactions' => $txs]]);
    }

    public function adjustWallet(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'amount'      => 'required|numeric',
            'description' => 'required|string',
        ]);

        return DB::transaction(function () use ($request, $id) {
            $user = User::where('role', 'customer')->findOrFail($id);

            WalletTransaction::create([
                'user_id'     => $user->id,
                'type'        => $request->amount > 0 ? 'admin_credit' : 'admin_debit',
                'amount'      => $request->amount,
                'description' => $request->description,
                'status'      => 'completed',
            ]);

            $user->increment('wallet_balance', $request->amount);

            return response()->json([
                'data'    => ['new_balance' => $user->fresh()->wallet_balance],
                'message' => 'Wallet adjusted.',
            ]);
        });
    }
}
