<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\WalletTransaction;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['items.product', 'user'])
            ->when(!auth()->user()->isAdmin(), fn ($q) => $q->where('user_id', auth()->id()))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->search, fn ($q) => $q->where('id', 'like', "%{$request->search}%"))
            ->orderBy($request->sort_by ?? 'created_at', $request->sort_dir ?? 'desc');

        return response()->json($query->paginate($request->per_page ?? 15));
    }

    public function show(int $id): JsonResponse
    {
        $order = Order::with(['items.product', 'user'])->findOrFail($id);

        if (!auth()->user()->isAdmin() && $order->user_id !== auth()->id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json(['data' => $order]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'items'           => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
            'payment_method'  => 'nullable|string',
        ]);

        return DB::transaction(function () use ($request) {
            $total = 0;
            $items = [];

            foreach ($request->items as $item) {
                $product = Product::findOrFail($item['product_id']);
                $subtotal = $product->price * $item['quantity'];
                $total += $subtotal;
                $items[] = ['product' => $product, 'quantity' => $item['quantity'], 'unit_price' => $product->price];
            }

            $order = Order::create([
                'user_id'        => auth()->id(),
                'total'          => $total,
                'status'         => 'pending',
                'payment_method' => $request->payment_method ?? 'wallet',
            ]);

            foreach ($items as $item) {
                OrderItem::create([
                    'order_id'   => $order->id,
                    'product_id' => $item['product']->id,
                    'quantity'   => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal'   => $item['unit_price'] * $item['quantity'],
                ]);
            }

            AuditLog::record('order_created', $order, auth()->user());

            return response()->json(['data' => $order->load(['items.product']), 'message' => 'Order placed.'], 201);
        });
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate(['status' => 'required|in:pending,processing,completed,cancelled,refunded']);

        $order = Order::findOrFail($id);
        $old   = $order->status;
        $order->update(['status' => $request->status]);

        AuditLog::record('order_status_changed', $order, auth()->user(), ['old_status' => $old, 'new_status' => $request->status]);

        return response()->json(['data' => $order, 'message' => 'Order status updated.']);
    }
}
