@extends('layouts.email', ['subject' => "⚠️ ALERT: Low Supplier Balance!"])

@section('content')
<h2 style="margin:0; color:#d9534f; text-align:center;">Low Balance Alert! ⚠️</h2>
<p style="color:#666; font-size:16px; margin-top:15px; line-height:1.6; text-align:center;">
    Action required! One of your supplier connections has dropped below the minimum balance threshold.
</p>

<div style="background:#fff5f5; border-radius:14px; padding:30px; margin-top:30px; border:1px solid #fbdada; text-align:center;">
    <p style="margin:0; color:#d9534f; font-weight:bold; font-size:14px;">Supplier Name</p>
    <div style="font-size:24px; color:#1f4d39; margin-top:5px;">{{ $supplier->name }}</div>
    
    <div style="margin-top:20px; padding-top:20px; border-top:1px dashed #fbdada;">
        <p style="margin:0; color:#666; font-size:14px;">Current Balance</p>
        <div style="font-size:32px; color:#d9534f; font-weight:bold; margin-top:5px;">{{ '€' . number_format($supplier->balance, 2) }}</div>
    </div>
</div>

<div style="text-align:center; margin-top:35px;">
    <a href="{{ config('app.frontend_url', 'https://upgradercx.com/admin/connections') }}" style="background:linear-gradient(135deg,#c9302c,#d9534f); color:#ffffff; padding:14px 35px; text-decoration:none; border-radius:40px; font-weight:600; display:inline-block; box-shadow:0 5px 15px rgba(217,83,79,0.3);">
        Top Up Now
    </a>
</div>

<p style="color:#888; font-size:13px; margin-top:30px; text-align:center;">
    Automated fulfillment may fail if the balance reaches zero.
</p>
@endsection
