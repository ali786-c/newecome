<?php

namespace App\Http\Controllers;

use App\Models\ComplianceReview;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ComplianceController extends Controller
{
    public function queue(Request $request): JsonResponse
    {
        $query = ComplianceReview::with(['reviewable', 'reviewer'])
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->orderBy('created_at', 'asc');

        return response()->json($query->paginate($request->per_page ?? 15));
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(['data' => ComplianceReview::with(['reviewable', 'reviewer'])->findOrFail($id)]);
    }

    public function approve(int $id): JsonResponse
    {
        $review = ComplianceReview::findOrFail($id);
        $review->update(['status' => 'approved', 'reviewer_id' => auth()->id(), 'reviewed_at' => now()]);
        return response()->json(['data' => $review, 'message' => 'Approved.']);
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $request->validate(['reason' => 'required|string']);
        $review = ComplianceReview::findOrFail($id);
        $review->update(['status' => 'rejected', 'reviewer_id' => auth()->id(), 'reviewed_at' => now(), 'notes' => $request->reason]);
        return response()->json(['data' => $review, 'message' => 'Rejected.']);
    }

    public function flag(Request $request, int $id): JsonResponse
    {
        $request->validate(['reason' => 'required|string']);
        $review = ComplianceReview::findOrFail($id);
        $review->update(['status' => 'flagged', 'notes' => $request->reason]);
        return response()->json(['data' => $review, 'message' => 'Flagged for review.']);
    }
}
