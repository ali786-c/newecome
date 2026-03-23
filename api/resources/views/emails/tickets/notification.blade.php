<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; }
        .header { background: #007bff; color: white; padding: 10px 20px; text-align: center; }
        .footer { font-size: 12px; color: #777; margin-top: 20px; text-align: center; }
        .button { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
        .content { margin-top: 20px; }
        .preview { background: #f8f9fa; padding: 10px; border-left: 4px solid #007bff; margin: 15px 0; font-style: italic; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Ticket Activity Updated</h2>
        </div>
        <div class="content">
            <p>Hello {{ $user->name }},</p>
            <p>There is new activity on your support ticket <strong>#{{ $ticket->id }}</strong>.</p>
            
            <p><strong>Subject:</strong> {{ $ticket->subject }}<br>
            <strong>Status:</strong> {{ ucfirst($ticket->status) }}</p>

            @if(isset($messagePreview))
            <p><strong>Latest Message:</strong></p>
            <div class="preview">
                {{ $messagePreview }}
            </div>
            @endif

            <p style="text-align: center; margin-top: 30px;">
                <a href="{{ config('app.frontend_url', 'https://upgradercx.com') . '/tickets/' . $ticket->id }}" class="button">View Ticket & Reply</a>
            </p>

            <p>If you have any questions, please reply to this email.</p>
            
            <p>Thanks,<br>{{ config('app.name') }} Support</p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
        </div>
    </div>
</body>
</html>
