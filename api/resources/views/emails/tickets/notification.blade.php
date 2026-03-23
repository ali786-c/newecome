@extends('layouts.email', ['subject' => "Ticket Update #{$ticket->id}: {$ticket->subject}"])

@section('content')
<h2 style="margin:0; color:#1f4d39; text-align:center;">Support Update 💬</h2>
<p style="color:#666; font-size:16px; margin-top:15px; line-height:1.6; text-align:center;">
    There is new activity on your support ticket <strong>#{{ $ticket->id }}</strong>.
</p>

<div style="margin:25px auto; padding:20px; background:#f7faf9; border-radius:12px; border:1px solid #e0ede8; max-width:500px;">
    <p style="margin:0; font-size:14px; color:#1f4d39; font-weight:bold;">Subject: {{ $ticket->subject }}</p>
    <p style="margin:5px 0 0; font-size:13px; color:#666;">Status: <span style="color:#2e7d5b; font-weight:bold;">{{ ucfirst($ticket->status) }}</span></p>
    
    @if(isset($messagePreview))
        <div style="margin-top:15px; padding-top:15px; border-top:1px dashed #c8d9d2; font-style:italic; color:#444; font-size:14px; line-height:1.5;">
            "{{ $messagePreview }}"
        </div>
    @endif
</div>

<div style="text-align:center; margin-top:35px;">
    <a href="{{ config('app.frontend_url', 'https://upgradercx.com') . '/tickets/' . $ticket->id }}" style="background:linear-gradient(135deg,#1f4d39,#2e7d5b); color:#ffffff; padding:14px 35px; text-decoration:none; border-radius:40px; font-weight:600; display:inline-block; box-shadow:0 5px 15px rgba(31,77,57,0.3);">
        View Ticket & Reply
    </a>
</div>

<p style="color:#888; font-size:13px; margin-top:30px; text-align:center;">
    Our support team is always here to help. Simply reply to this email if you need anything else.
</p>
@endsection
