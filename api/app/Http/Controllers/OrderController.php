<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\WalletTransaction;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Services\PayHubService;
use Illuminate\Support\Facades\Hash;

class OrderController extends Controller
{
    protected $payHubService;
    protected $fulfillmentService;

    public function __construct(PayHubService $payHubService, \App\Services\OrderFulfillmentService $fulfillmentService)
    {
        $this->payHubService = $payHubService;
        $this->fulfillmentService = $fulfillmentService;
    }

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
            'name'            => 'nullable|string|max:255',
            'email'           => 'nullable|email|max:255',
            'password'        => 'nullable|string|min:8',
        ]);

        // Try to identify user via Sanctum (if token is provided on this guest-accessible route)
        $user = auth('sanctum')->user() ?: auth()->user();
        $isTrulyAuthenticated = (bool)$user;
        $token = null;

        // Frictionless Onboarding: Create or Login user during checkout
        if (!$user) {
            if (!$request->email) {
                return response()->json(['message' => 'Email is required for checkout.'], 422);
            }

            $user = User::where('email', $request->email)->first();

            if ($user) {
                // Returning user: If password is provided, try to log them in
                if ($request->password) {
                    if (!Hash::check($request->password, $user->password)) {
                        return response()->json(['message' => 'Incorrect password for this email.'], 401);
                    }
                    $token = $user->createToken('checkout-token')->plainTextToken;
                }
            } else {
                // New user: Create account on the fly
                $user = User::create([
                    'name'     => $request->name ?? strstr($request->email, '@', true),
                    'email'    => $request->email,
                    'password' => Hash::make($request->password ?? \Illuminate\Support\Str::random(16)),
                    'role'     => 'customer',
                ]);
                $token = $user->createToken('checkout-token')->plainTextToken;
            }
        }

        return DB::transaction(function () use ($request, $user, $token, $isTrulyAuthenticated) {
            $total = 0;
            $items = [];

            foreach ($request->items as $item) {
                $product = Product::findOrFail($item['product_id']);
                $subtotal = $product->price * $item['quantity'];
                $total += $subtotal;
                $items[] = ['product' => $product, 'quantity' => $item['quantity'], 'unit_price' => $product->price];
            }

            $order = Order::create([
                'user_id'        => $user->id,
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

            AuditLog::record('order_created', $order, $user);

            // ── Payment Processing ──────────────────────────────────────────
            
            if ($request->payment_method === 'wallet') {
                // SECURITY: Wallet payments REQUIRE true authentication, not just finding user by email
                if (!$isTrulyAuthenticated) {
                    return response()->json(['message' => 'Login is required to use your wallet balance.'], 401);
                }

                if ($user->wallet_balance < $total) {
                    return response()->json(['message' => 'Insufficient wallet balance.'], 422);
                }

                $user->decrement('wallet_balance', $total);
                
                WalletTransaction::create([
                    'user_id' => $user->id,
                    'type' => 'spend',
                    'amount' => -$total,
                    'description' => "Payment for Order #{$order->id}",
                    'payment_method' => 'wallet',
                    'status' => 'completed',
                ]);

                $order->update(['status' => 'completed']);
                AuditLog::record('order_paid_via_wallet', $order, $user);

                // TRIGGER AUTOMATIC FULFILLMENT
                try {
                    $this->fulfillmentService->fulfill($order);
                } catch (\Exception $e) {
                    Log::error("Wallet fulfillment trigger failed: " . $e->getMessage());
                }

                return response()->json([
                    'data' => $order->load(['items.product', 'user']),
                    'access_token' => $token,
                    'message' => 'Order placed and paid via wallet balance.'
                ], 201);
            }

            // Default: Pay Hub Integration
            $result = $this->payHubService->createCheckout($order);

            if ($result['success']) {
                return response()->json([
                    'data' => $order->load(['items.product', 'user']),
                    'checkout_url' => $result['checkout_url'],
                    'access_token' => $token,
                    'message' => 'Order placed. Redirecting to payment...'
                ], 201);
            }

            return response()->json([
                'data' => $order->load(['items.product']),
                'access_token' => $token,
                'message' => 'Order placed but payment gateway is currently unavailable: ' . ($result['message'] ?? 'Unknown error')
            ], 201);
        });
    }

    /**
     * Handle payment confirmation from Pay Hub.
     */
    public function handlePayHubWebhook(Request $request): JsonResponse
    {
        $payload = $request->all();
        $signature = $request->header('X-PayHub-Signature') ?? $payload['signature'] ?? null;

        if (!$signature) {
            return response()->json(['message' => 'Missing signature.'], 400);
        }

        if (!$this->payHubService->verifyWebhookSignature($payload, $signature)) {
            Log::warning("Invalid Pay Hub Webhook signature for Order: " . ($payload['order_id'] ?? 'Unknown'));
            return response()->json(['message' => 'Invalid signature.'], 401);
        }

        $order = Order::findOrFail($payload['order_id']);

        if ($payload['status'] === 'paid' && $order->status !== 'completed') {
            $order->update(['status' => 'completed']);
            AuditLog::record('order_paid_via_hub', $order, null, ['hub_ref' => $payload['hub_reference'] ?? null]);

            // TRIGGER AUTOMATIC FULFILLMENT
            try {
                $this->fulfillmentService->fulfill($order);
            } catch (\Exception $e) {
                Log::error("Pay Hub fulfillment trigger failed: " . $e->getMessage());
            }
        }

        return response()->json(['success' => true]);
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

    /**
     * Get purchased product items for the authenticated customer.
     */
    public function myProducts(Request $request): JsonResponse
    {
        $user = auth()->user();

        $items = OrderItem::whereHas('order', function ($q) use ($user) {
            $q->where('user_id', $user->id)
              ->where('status', 'completed');
        })
        ->with('product.category')
        ->whereNotNull('credentials')
        ->orderBy('created_at', 'desc')
        ->paginate($request->per_page ?? 12);

        return response()->json($items);
    }
}
