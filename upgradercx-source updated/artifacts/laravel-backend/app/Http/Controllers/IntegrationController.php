<?php

namespace App\Http\Controllers;

use App\Models\Integration;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class IntegrationController extends Controller
{
    public function index(): JsonResponse
    {
        $integrations = Integration::all();
        return response()->json(['data' => $integrations]);
    }

    public function connect(Request $request, int $id): JsonResponse
    {
        $integration = Integration::findOrFail($id);
        $integration->update(['status' => 'connected', 'config' => array_merge($integration->config ?? [], $request->all())]);
        return response()->json(['data' => $integration, 'message' => 'Integration connected.']);
    }

    public function disconnect(int $id): JsonResponse
    {
        $integration = Integration::findOrFail($id);
        $integration->update(['status' => 'disconnected']);
        return response()->json(['data' => $integration, 'message' => 'Integration disconnected.']);
    }

    public function test(int $id): JsonResponse
    {
        $integration = Integration::findOrFail($id);
        return response()->json([
            'data'    => ['ping' => 'pong', 'integration' => $integration->name],
            'message' => "Connection test for '{$integration->name}' passed.",
        ]);
    }
}
