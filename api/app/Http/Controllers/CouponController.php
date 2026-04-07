<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class CouponController extends Controller
{
    /**
     * Admin: Index all coupons.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Coupon::query();

        if ($request->search) {
            $query->where('code', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%");
        }

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $coupons = $query->orderBy('created_at', 'desc')->get();

        return response()->json($coupons);
    }

    /**
     * Admin: Create a new coupon.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'nullable|string|unique:coupons,code|max:50',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'min_order_value' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'expires_at' => 'nullable|date',
            'first_order_only' => 'nullable|boolean',
            'description' => 'nullable|string|max:255',
        ]);

        if (empty($validated['code'])) {
            $validated['code'] = strtoupper(Str::random(8));
        } else {
            $validated['code'] = strtoupper($validated['code']);
        }

        $coupon = Coupon::create($validated);

        return response()->json([
            'message' => 'Coupon created successfully.',
            'data' => $coupon
        ], 201);
    }

    /**
     * Admin: Bulk Generate Coupons.
     */
    public function bulkGenerate(Request $request): JsonResponse
    {
        $request->validate([
            'count' => 'required|integer|min:1|max:1000',
            'prefix' => 'nullable|string|max:10',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'expires_at' => 'nullable|date',
            'first_order_only' => 'nullable|boolean',
        ]);

        $count = $request->count;
        $prefix = $request->prefix ? strtoupper($request->prefix) . '-' : '';
        $coupons = [];

        for ($i = 0; $i < $count; $i++) {
            $code = $prefix . strtoupper(Str::random(8));
            
            // Ensure unique
            while (Coupon::where('code', $code)->exists()) {
                $code = $prefix . strtoupper(Str::random(8));
            }

            $coupons[] = Coupon::create([
                'code' => $code,
                'type' => $request->type,
                'value' => $request->value,
                'expires_at' => $request->expires_at,
                'first_order_only' => $request->first_order_only ?? false,
                'description' => 'Bulk generated coupon',
                'status' => 'active',
            ]);
        }

        return response()->json([
            'message' => "Successfully generated {$count} coupons.",
            'data' => $coupons
        ], 201);
    }

    /**
     * Public/Customer: Validate a coupon code.
     */
    public function validateCode(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string',
            'total' => 'required|numeric|min:0',
        ]);

        $coupon = Coupon::where('code', strtoupper($request->code))->first();

        if (!$coupon) {
            return response()->json(['valid' => false, 'message' => 'Invalid coupon code.'], 404);
        }

        $user = auth('sanctum')->user();
        $validation = $coupon->isValid($user, $request->total);

        if (!$validation['valid']) {
            return response()->json($validation, 422);
        }

        return response()->json([
            'valid' => true,
            'coupon' => $coupon,
            'discount' => $coupon->calculateDiscount($request->total)
        ]);
    }

    /**
     * Admin: Update coupon status.
     */
    public function updateStatus(Request $request, Coupon $coupon): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:active,disabled',
        ]);

        $coupon->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Coupon status updated.',
            'data' => $coupon
        ]);
    }

    /**
     * Admin: Delete a coupon.
     */
    public function destroy(Coupon $coupon): JsonResponse
    {
        $coupon->delete();
        return response()->json(['message' => 'Coupon deleted successfully.']);
    }
}
