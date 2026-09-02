<?php

namespace App\Http\Controllers;

use App\Models\PricingRule;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PricingRuleController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => PricingRule::orderBy('name')->get()]);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(['data' => PricingRule::findOrFail($id)]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'type'        => 'required|in:percentage,fixed,bulk',
            'value'       => 'required|numeric|min:0',
            'applies_to'  => 'nullable|in:all,category,product',
            'target_ids'  => 'nullable|array',
            'valid_from'  => 'nullable|date',
            'valid_until' => 'nullable|date|after:valid_from',
            'is_active'   => 'nullable|boolean',
        ]);

        $rule = PricingRule::create($data);
        return response()->json(['data' => $rule, 'message' => 'Pricing rule created.'], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $rule = PricingRule::findOrFail($id);

        $data = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'type'        => 'sometimes|in:percentage,fixed,bulk',
            'value'       => 'sometimes|numeric|min:0',
            'applies_to'  => 'nullable|in:all,category,product',
            'target_ids'  => 'nullable|array',
            'valid_from'  => 'nullable|date',
            'valid_until' => 'nullable|date',
            'is_active'   => 'nullable|boolean',
        ]);

        $rule->update($data);
        return response()->json(['data' => $rule, 'message' => 'Pricing rule updated.']);
    }

    public function destroy(int $id): JsonResponse
    {
        PricingRule::findOrFail($id)->delete();
        return response()->json(['message' => 'Pricing rule deleted.']);
    }
}
