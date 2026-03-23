@extends('layouts.email', ['subject' => "Welcome to UpgraderCX! 🚀"])

@section('content')
<h2 style="margin:0; color:#1f4d39; text-align:center;">Welcome to the Family! 💎</h2>
<p style="color:#666; font-size:16px; margin-top:15px; line-height:1.6; text-align:center;">
    Hello {{ $user->name }}, we're thrilled to have you on board! You've just unlocked access to premium subscriptions at the best prices on the market.
</p>

<div style="padding:25px; background:#f7faf9; border-radius:12px; margin-top:25px; border:1px solid #e0ede8;">
    <h3 style="margin:0; color:#1f4d39; font-size:16px;">What can you do now?</h3>
    <ul style="margin:15px 0 0; padding:0; list-style:none; color:#555; font-size:14px;">
        <li style="margin-bottom:10px;">✅ <strong>Explore Deals</strong>: Browse our catalog of AI tools and streaming services.</li>
        <li style="margin-bottom:10px;">✅ <strong>Wallet Top-up</strong>: Add funds to your wallet for instant checkout.</li>
        <li style="margin-bottom:10px;">✅ <strong>Instant Delivery</strong>: Receive your credentials within minutes of purchase.</li>
    </ul>
</div>

<div style="text-align:center; margin-top:35px;">
    <a href="{{ config('app.frontend_url', 'https://upgradercx.com') }}" style="background:linear-gradient(135deg,#1f4d39,#2e7d5b); color:#ffffff; padding:14px 35px; text-decoration:none; border-radius:40px; font-weight:600; display:inline-block; box-shadow:0 5px 15px rgba(31,77,57,0.3);">
        Start Exploring
    </a>
</div>

<p style="color:#888; font-size:13px; margin-top:30px; text-align:center;">
    If you have any questions, our support team is just a click away.
</p>
@endsection
