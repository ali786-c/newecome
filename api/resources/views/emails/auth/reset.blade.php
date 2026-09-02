@extends('layouts.email', ['subject' => "Reset Your UpgraderCX Password 🔐"])

@section('content')
<h2 style="margin:0; color:#1f4d39; text-align:center;">Password Reset Request 🔐</h2>
<p style="color:#666; font-size:16px; margin-top:15px; line-height:1.6; text-align:center;">
    Hello {{ $user->name }}, we received a request to reset your password for your UpgraderCX account. 
    If you didn't make this request, you can safely ignore this email.
</p>

<div style="padding:25px; background:#f7faf9; border-radius:12px; margin-top:25px; border:1px solid #e0ede8; text-align:center;">
    <p style="margin:0 0 20px; color:#555; font-size:14px;">
        Click the button below to choose a new password. This link will expire in 60 minutes for your security.
    </p>
    
    <a href="{{ $url }}" style="background:linear-gradient(135deg,#1f4d39,#2e7d5b); color:#ffffff; padding:14px 35px; text-decoration:none; border-radius:40px; font-weight:600; display:inline-block; box-shadow:0 5px 15px rgba(31,77,57,0.3);">
        Reset Password
    </a>
</div>

<p style="color:#888; font-size:12px; margin-top:30px; text-align:center; line-height:1.4;">
    Trouble clicking the button? Copy and paste the URL below into your web browser:<br>
    <span style="color:#2e7d5b; word-break:break-all;">{{ $url }}</span>
</p>

<p style="color:#888; font-size:13px; margin-top:30px; text-align:center;">
    If you have any questions, our support team is ready to help.
</p>
@endsection
