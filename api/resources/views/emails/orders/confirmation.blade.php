@extends('layouts.email', ['subject' => "Payment Success! Order #{$order->order_number} 💎"])

@section('content')
<h2 style="margin:0; color:#1f4d39; text-align:center;">Payment Received! 🎁</h2>
<p style="color:#666; font-size:16px; margin-top:15px; line-height:1.6; text-align:center;">
    Thank you for your order! Your payment for <strong>#{{ $order->order_number }}</strong> has been successfully processed. 
</p>

<div style="background:#f7faf9; border-radius:14px; padding:25px; margin-top:30px; border:1px solid #e0ede8;">
    <h3 style="margin:0 0 15px; color:#1f4d39; font-size:16px; text-align:center;">Order Summary</h3>
    <table width="100%" cellpadding="0" cellspacing="0">
        @foreach($order->items as $item)
        <tr>
            <td style="padding:10px 0; border-bottom:1px solid #c8d9d2; font-size:14px; color:#444;">{{ $item->product->name }} (x{{ $item->quantity }})</td>
            <td style="padding:10px 0; border-bottom:1px solid #c8d9d2; text-align:right; font-size:14px; color:#444;">{{ '€' . number_format($item->subtotal, 2) }}</td>
        </tr>
        @endforeach
        <tr>
            <td style="padding:15px 0 0; font-weight:bold; color:#1f4d39; font-size:15px;">Total Paid</td>
            <td style="padding:15px 0 0; text-align:right; font-weight:bold; color:#1f4d39; font-size:18px;">{{ '€' . number_format($order->total, 2) }}</td>
        </tr>
    </table>
</div>

<p style="color:#666; font-size:14px; margin-top:25px; text-align:center;">
    Our automated fulfillment engine is now preparing your digital credentials. <strong>You will receive another email shortly</strong> with your product details.
</p>

<div style="text-align:center; margin-top:35px;">
    <a href="{{ config('app.frontend_url', 'https://upgradercx.com/orders') }}" style="background:linear-gradient(135deg,#1f4d39,#2e7d5b); color:#ffffff; padding:14px 35px; text-decoration:none; border-radius:40px; font-weight:600; display:inline-block; box-shadow:0 5px 15px rgba(31,77,57,0.3);">
        View Order Details
    </a>
</div>

<p style="color:#888; font-size:13px; margin-top:30px; text-align:center;">
    If you have any questions, please reply to this email.
</p>
@endsection
