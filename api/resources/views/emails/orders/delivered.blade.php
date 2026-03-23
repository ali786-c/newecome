<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; }
        .header { background: #28a745; color: white; padding: 10px 20px; text-align: center; }
        .footer { font-size: 12px; color: #777; margin-top: 20px; text-align: center; }
        .button { background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { text-align: left; padding: 10px; border-bottom: 1px solid #eee; }
        .code-box { background: #f8f9fa; border: 1px solid #ddd; padding: 10px; font-family: monospace; display: block; margin: 5px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Order Delivered! 🎁</h2>
        </div>
        <p>Hello {{ $order->user->name }},</p>
        <p>Good news! Your order <strong>#{{ $order->order_number }}</strong> has been successfully fulfilled and your digital products are ready.</p>
        
        <table>
            <thead>
                <tr>
                    <th style="width: 30%;">Product</th>
                    <th style="width: 70%;">Content / PIN</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items as $item)
                <tr>
                    <td><strong>{{ $item->product->name }}</strong></td>
                    <td>
                        @if($item->credentials)
                            @foreach($item->credentials as $card)
                                <div class="code-box">
                                    {{ $card['code'] ?? $card['cardNumber'] ?? 'N/A' }}
                                    @if(!empty($card['pinCode'] || !empty($card['pin'])))
                                        <br>PIN: {{ $card['pinCode'] ?? $card['pin'] }}
                                    @endif
                                </div>
                                @if(!empty($card['redemptionInstruction']))
                                    <div style="font-size: 11px; color: #666;">Guidelines: {{ $card['redemptionInstruction'] }}</div>
                                @endif
                                @if(!empty($card['redemptionUrl']))
                                    <div style="font-size: 11px;"><a href="{{ $card['redemptionUrl'] }}">Redeem Here</a></div>
                                @endif
                            @endforeach
                        @else
                            <em>Manual Delivery / Pending</em>
                        @endif
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <p style="text-align: center; margin-top: 30px;">
            <a href="{{ config('app.frontend_url', 'https://upgradercx.com') . '/orders' }}" class="button">View Order in Dashboard</a>
        </p>

        <p>If you have any questions, please reply to this email or contact our support team.</p>
        
        <p>Thanks,<br>{{ config('app.name') }}</p>
        
        <div class="footer">
            &copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
        </div>
    </div>
</body>
</html>
