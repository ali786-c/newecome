<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Review;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class ReviewController extends Controller
{
    /**
     * List approved reviews for a specific product.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => 'required_without:product_slug|exists:products,id',
            'product_slug' => 'required_without:product_id|exists:products,slug',
        ]);

        $query = Review::where('is_approved', true)
            ->where('status', 'approved');

        if ($request->product_id) {
            $query->where('product_id', $request->product_id);
        } else {
            $product = Product::where('slug', $request->product_slug)->first();
            $query->where('product_id', $product->id);
        }

        return response()->json($query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 10));
    }

    /**
     * Submit a new review (pending approval).
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id'  => 'required|exists:products,id',
            'author_name' => 'required|string|max:255',
            'rating'      => 'required|integer|min:1|max:5',
            'comment'     => 'required|string|max:1000',
        ]);

        $user = auth('sanctum')->user();
        $data['user_id'] = $user?->id;
        $data['is_approved'] = false;
        $data['status'] = 'pending';

        // Optional: Check if user actually bought the product to set is_verified
        if ($user) {
            $hasBought = \App\Models\Order::where('user_id', $user->id)
                ->where('status', 'completed')
                ->whereHas('items', function ($q) use ($data) {
                    $q->where('product_id', $data['product_id']);
                })
                ->exists();
            $data['is_verified'] = $hasBought;
        }

        $review = Review::create($data);

        return response()->json([
            'data' => $review,
            'message' => 'Thank you! Your review has been submitted and is pending admin approval.'
        ], 201);
    }

    /**
     * Admin: List all reviews for moderation.
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $query = Review::with('product')
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->product_id, fn ($q) => $q->where('product_id', $request->product_id))
            ->orderBy('created_at', 'desc');

        return response()->json($query->paginate($request->per_page ?? 20));
    }

    /**
     * Admin: Update/Approve/Reject a review.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $review = Review::findOrFail($id);

        $data = $request->validate([
            'author_name' => 'sometimes|string|max:255',
            'rating'      => 'sometimes|integer|min:1|max:5',
            'comment'     => 'sometimes|string|max:1000',
            'status'      => 'sometimes|in:pending,approved,rejected',
            'is_approved' => 'sometimes|boolean',
        ]);

        if (isset($data['status'])) {
            $data['is_approved'] = ($data['status'] === 'approved');
        }

        $review->update($data);

        return response()->json(['data' => $review, 'message' => 'Review updated successfully.']);
    }

    /**
     * Admin: Delete a review.
     */
    public function destroy(int $id): JsonResponse
    {
        $review = Review::findOrFail($id);
        $review->delete();

        return response()->json(['message' => 'Review deleted.']);
    }
}
