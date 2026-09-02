@extends('layouts.email', ['subject' => "🎟️ New Support Ticket: {$ticket->subject}"])

@section('content')
<h2 style="margin:0; color:#1f4d39; text-align:center;">New Ticket Received! 📨</h2>
<p style="color:#666; font-size:16px; margin-top:15px; line-height:1.6; text-align:center;">
    A customer has just opened a new support ticket.
</p>

<div style="background:#f7faf9; border-radius:14px; padding:25px; margin-top:30px; border:1px solid #e0ede8;">
    <h3 style="margin:0 0 15px; color:#1f4d39; font-size:16px; text-align:center;">Ticket Highlights</h3>
    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td style="padding:10px 0; border-bottom:1px solid #c8d9d2; font-size:14px; color:#777;">Subject</td>
            <td style="padding:10px 0; border-bottom:1px solid #c8d9d2; text-align:right; font-size:14px; color:#444; font-weight:bold;">{{ $ticket->subject }}</td>
        </tr>
        <tr>
            <td style="padding:10px 0; border-bottom:1px solid #c8d9d2; font-size:14px; color:#777;">Priority</td>
            <td style="padding:10px 0; border-bottom:1px solid #c8d9d2; text-align:right; font-size:12px; color:#ffffff; font-weight:bold; background:{{ $ticket->priority === 'high' ? '#d9534f' : ($ticket->priority === 'medium' ? '#f0ad4e' : '#5bc0de') }}; border-radius:12px; padding:4px 10px; display:inline-block; margin-top:5px; text-transform:uppercase;">
                {{ $ticket->priority }}
            </td>
        </tr>
        <tr>
            <td style="padding:10px 0; border-bottom:1px solid #c8d9d2; font-size:14px; color:#777;">Customer</td>
            <td style="padding:10px 0; border-bottom:1px solid #c8d9d2; text-align:right; font-size:14px; color:#444;">{{ $ticket->user->name }}</td>
        </tr>
    </table>
    
    <div style="margin-top:20px; padding:15px; background:#ffffff; border:1px solid #ddd; border-radius:8px; font-size:13px; color:#555; line-height:1.6;">
        <strong>Message Preview:</strong><br>
        {{ Str::limit($ticket->messages->first()->message ?? 'No content', 180) }}
    </div>
</div>

<div style="text-align:center; margin-top:35px;">
    <a href="{{ config('app.frontend_url', 'https://upgradercx.com/admin/tickets/') . $ticket->id }}" style="background:linear-gradient(135deg,#1f4d39,#2e7d5b); color:#ffffff; padding:14px 35px; text-decoration:none; border-radius:40px; font-weight:600; display:inline-block; box-shadow:0 5px 15px rgba(31,77,57,0.3);">
        Reply to Ticket
    </a>
</div>

<p style="color:#888; font-size:13px; margin-top:30px; text-align:center;">
    Reply promptly to maintain high customer satisfaction.
</p>
@endsection
