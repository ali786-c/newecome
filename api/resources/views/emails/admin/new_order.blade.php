@extends('layouts.email', ['subject' => "🎉 New Order Received! #{$order->order_number}"])

@section('content')
<h2 style="margin:0; color:#1f4d39; text-align:center;">New Order Received! 🛍️</h2>
<p style="color:#666; font-size:16px; margin-top:15px; line-height:1.6; text-align:center;">
    Congratulations! A new order has been placed on the platform.
</p>

<div style="background:#f7faf9; border-radius:14px; padding:25px; margin-top:30px; border:1px solid #e0ede8;">
    <h3 style="margin:0 0 15px; color:#1f4d39; font-size:16px; text-align:center;">Order Details</h3>
    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td style="padding:10px 0; border-bottom:1px solid #c8d9d2; font-size:14px; color:#777;">Order Number</td>
            <td style="padding:10px 0; border-bottom:1px solid #c8d9d2; text-align:right; font-size:14px; color:#1f4d39; font-weight:bold;">#{{ $order->order_number }}</td>
        </tr>
        <tr>
            <td style="padding:10px 0; border-bottom:1px solid #c8d9d2; font-size:14px; color:#777;">Customer</td>
            <td style="padding:10px 0; border-bottom:1px solid #c8d9d2; text-align:right; font-size:14px; color:#444;">{{ $order->user->name }}</td>
        </tr>
        <tr>
            <td style="padding:10px 0; border-bottom:1px solid #c8d9d2; font-size:14px; color:#777;">Total Amount</td>
            <td style="padding:10px 0; border-bottom:1px solid #c8d9d2; text-align:right; font-size:14px; color:#1f4d39; font-weight:bold;">{{ '€' . number_format($order->total, 2) }}</td>
        </tr>
        <tr>
            <td style="padding:10px 0; border-bottom:1px solid #c8d9d2; font-size:14px; color:#777;">Payment Method</td>
            <td style="padding:10px 0; border-bottom:1px solid #c8d9d2; text-align:right; font-size:14px; color:#444; text-transform:capitalize;">{{ $order->payment_method }}</td>
        </tr>
    </table>
</div>

<div style="text-align:center; margin-top:35px;">
    <a href="{{ config('app.frontend_url', 'https://upgradercx.com/admin/orders/') . $order->id }}" style="background:linear-gradient(135deg,#1f4d39,#2e7d5b); color:#ffffff; padding:14px 35px; text-decoration:none; border-radius:40px; font-weight:600; display:inline-block; box-shadow:0 5px 15px rgba(31,77,57,0.3);">
        View Order in Admin
    </a>
</div>

<p style="color:#888; font-size:13px; margin-top:30px; text-align:center;">
    This is an automated notification from your shop.
</p>
@endsection
