@extends('layouts.email', ['subject' => "Wallet Top-Up Confirmed! 💰"])

@section('content')
<h2 style="margin:0; color:#1f4d39; text-align:center;">Deposit Confirmed! 🤑</h2>
<p style="color:#666; font-size:16px; margin-top:15px; line-height:1.6; text-align:center;">
    Your wallet has been successfully topped up. You're now ready to purchase more premium subscriptions!
</p>

<div style="background:#f7faf9; border-radius:14px; padding:30px; margin-top:30px; border:1px solid #e0ede8; text-align:center;">
    <p style="margin:0; color:#666; font-size:14px;">Amount Deposited</p>
    <div style="font-size:36px; color:#1f4d39; font-weight:bold; margin-top:5px;">{{ '€' . number_format($tx->amount, 2) }}</div>
    
    <div style="margin-top:20px; padding-top:20px; border-top:1px dashed #c8d9d2; font-size:13px; color:#777;">
        <strong>Method:</strong> {{ $tx->payment_method }}<br>
        <strong>Reference:</strong> {{ $tx->payment_ref ?? 'N/A' }}
    </div>
</div>

<div style="text-align:center; margin-top:35px;">
    <a href="{{ config('app.frontend_url', 'https://upgradercx.com/shop') }}" style="background:linear-gradient(135deg,#1f4d39,#2e7d5b); color:#ffffff; padding:14px 35px; text-decoration:none; border-radius:40px; font-weight:600; display:inline-block; box-shadow:0 5px 15px rgba(31,77,57,0.3);">
        Shop Now
    </a>
</div>

<p style="color:#888; font-size:13px; margin-top:30px; text-align:center;">
    Your updated wallet balance is now available in your dashboard.
</p>
@endsection
