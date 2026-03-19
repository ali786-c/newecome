<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\TicketMessage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TicketController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Ticket::with(['user', 'messages'])
            ->when(!auth()->user()->isAdmin(), fn ($q) => $q->where('user_id', auth()->id()))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->orderBy('updated_at', 'desc');

        return response()->json($query->paginate($request->per_page ?? 15));
    }

    public function show(int $id): JsonResponse
    {
        $ticket = Ticket::with(['user', 'messages.user'])->findOrFail($id);

        if (!auth()->user()->isAdmin() && $ticket->user_id !== auth()->id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json(['data' => $ticket]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'subject'  => 'required|string|max:255',
            'message'  => 'required|string',
            'priority' => 'nullable|in:low,medium,high',
            'category' => 'nullable|string|max:100',
        ]);

        $ticket = Ticket::create([
            'user_id'  => auth()->id(),
            'subject'  => $request->subject,
            'status'   => 'open',
            'priority' => $request->priority ?? 'medium',
            'category' => $request->category ?? 'general',
        ]);

        TicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id'   => auth()->id(),
            'message'   => $request->message,
            'is_admin'  => false,
        ]);

        return response()->json(['data' => $ticket->load(['messages.user']), 'message' => 'Ticket created.'], 201);
    }

    public function reply(Request $request, int $id): JsonResponse
    {
        $request->validate(['message' => 'required|string']);

        $ticket = Ticket::findOrFail($id);

        if (!auth()->user()->isAdmin() && $ticket->user_id !== auth()->id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $message = TicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id'   => auth()->id(),
            'message'   => $request->message,
            'is_admin'  => auth()->user()->isAdmin(),
        ]);

        if (auth()->user()->isAdmin()) {
            $ticket->update(['status' => 'waiting_customer']);
        } else {
            $ticket->update(['status' => 'open']);
        }

        return response()->json(['data' => $message->load('user'), 'message' => 'Reply sent.']);
    }

    public function close(int $id): JsonResponse
    {
        $ticket = Ticket::findOrFail($id);
        $ticket->update(['status' => 'closed', 'closed_at' => now()]);
        return response()->json(['data' => $ticket, 'message' => 'Ticket closed.']);
    }

    public function reopen(int $id): JsonResponse
    {
        $ticket = Ticket::findOrFail($id);
        $ticket->update(['status' => 'open', 'closed_at' => null]);
        return response()->json(['data' => $ticket, 'message' => 'Ticket reopened.']);
    }
}
