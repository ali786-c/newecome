@extends('layouts.email', ['subject' => "Your Order #{$order->order_number} has been delivered!"])

@section('content')
<h2 style="margin:0; color:#1f4d39; text-align:center;">Order Delivered! 🎁</h2>
<p style="color:#666; font-size:16px; margin-top:15px; line-height:1.6; text-align:center;">
    Good news! Your digital products for order <strong>#{{ $order->order_number }}</strong> are ready and fulfilled.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:25px; border:1px solid #f0f0f0; border-radius:12px; overflow:hidden;">
    <thead>
        <tr style="background:#f7faf9;">
            <th style="padding:15px; text-align:left; color:#1f4d39; font-size:14px; width:40%;">Product</th>
            <th style="padding:15px; text-align:left; color:#1f4d39; font-size:14px; width:60%;">Content / PIN</th>
        </tr>
    </thead>
    <tbody>
        @foreach($order->items as $item)
        <tr>
            <td style="padding:15px; border-bottom:1px solid #f0f0f0; font-size:14px; vertical-align:top;"><strong>{{ $item->product->name }}</strong></td>
            <td style="padding:15px; border-bottom:1px solid #f0f0f0; font-size:14px; vertical-align:top;">
                @if($item->credentials)
                    @foreach($item->credentials as $card)
                        <div style="background:#f8f9fa; border:1px solid #ddd; padding:10px; font-family:monospace; margin-bottom:10px; border-radius:4px; word-break:break-all;">
                            {{ $card['code'] ?? $card['cardNumber'] ?? 'N/A' }}
                            @if(!empty($card['pinCode'] || !empty($card['pin'])))
                                <div style="margin-top:5px; border-top:1px dashed #ccc; padding-top:5px; font-weight:bold; color:#1f4d39;">PIN: {{ $card['pinCode'] ?? $card['pin'] }}</div>
                            @endif
                        </div>
                        @if(!empty($card['redemptionInstruction']))
                            <div style="font-size:11px; color:#777; margin-bottom:5px;">💡 Guidelines: {{ $card['redemptionInstruction'] }}</div>
                        @endif
                        @if(!empty($card['redemptionUrl']))
                            <div style="font-size:11px; margin-bottom:10px;"><a href="{{ $card['redemptionUrl'] }}" style="color:#2e7d5b; font-weight:bold;">Redeem Here</a></div>
                        @endif
                    @endforeach
                @else
                    <em style="color:#888;">Manual Fulfillment Required</em>
                @endif
            </td>
        </tr>
        @endforeach
    </tbody>
</table>

<div style="text-align:center; margin-top:35px;">
    <a href="{{ config('app.frontend_url', 'https://upgradercx.com') . '/orders' }}" style="background:linear-gradient(135deg,#1f4d39,#2e7d5b); color:#ffffff; padding:14px 35px; text-decoration:none; border-radius:40px; font-weight:600; display:inline-block; box-shadow:0 5px 15px rgba(31,77,57,0.3);">
        View My Products
    </a>
</div>

<p style="color:#888; font-size:13px; margin-top:30px; text-align:center;">
    If you have any issues, please reply to this email or contact support.
</p>
@endsection
