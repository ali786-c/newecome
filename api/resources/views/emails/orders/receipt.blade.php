@extends('layouts.email', ['subject' => "Order Confirmation #{$order->order_number}"])

@section('content')
<h2 style="margin:0; color:#1f4d39; text-align:center;">Order Confirmation 💎</h2>
<p style="color:#666; font-size:16px; margin-top:15px; line-height:1.6; text-align:center;">
    Thank you for choosing <strong>UpgraderCX</strong>. We've received your payment and are processing your digital products.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:25px; border:1px solid #f0f0f0; border-radius:12px; overflow:hidden;">
    <thead>
        <tr style="background:#f7faf9;">
            <th style="padding:15px; text-align:left; color:#1f4d39; font-size:14px;">Product</th>
            <th style="padding:15px; text-align:right; color:#1f4d39; font-size:14px;">Price</th>
        </tr>
    </thead>
    <tbody>
        @foreach($order->items as $item)
        <tr>
            <td style="padding:15px; border-bottom:1px solid #f0f0f0; font-size:14px;">{{ $item->product->name }}</td>
            <td style="padding:15px; border-bottom:1px solid #f0f0f0; text-align:right; font-size:14px;">{{ '€' . number_format($item->price, 2) }}</td>
        </tr>
        @endforeach
        <tr style="background:#fcfcfc;">
            <td style="padding:15px; font-weight:bold; color:#1f4d39;">Total</td>
            <td style="padding:15px; text-align:right; font-weight:bold; color:#1f4d39; font-size:16px;">{{ '€' . number_format($order->total, 2) }}</td>
        </tr>
    </tbody>
</table>

<div style="text-align:center; margin-top:35px;">
    <a href="{{ config('app.frontend_url', 'https://upgradercx.com') . '/orders' }}" style="background:linear-gradient(135deg,#1f4d39,#2e7d5b); color:#ffffff; padding:14px 35px; text-decoration:none; border-radius:40px; font-weight:600; display:inline-block; box-shadow:0 5px 15px rgba(31,77,57,0.3);">
        Track Order Status
    </a>
</div>

<p style="color:#888; font-size:13px; margin-top:30px; text-align:center;">
    We will send you another email as soon as your items are delivered.
</p>
@endsection
