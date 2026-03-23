<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; }
        .header { background: #f8f9fa; padding: 10px 20px; text-align: center; }
        .footer { font-size: 12px; color: #777; margin-top: 20px; text-align: center; }
        .button { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { text-align: left; padding: 10px; border-bottom: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Order Confirmation #{{ $order->order_number }}</h2>
        </div>
        <p>Hello {{ $order->user->name ?? 'Customer' }},</p>
        <p>Thank you for your order! We've received your payment and our systems are currently processing your digital fulfillment.</p>
        
        <h3>Order Summary:</h3>
        <table>
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Price</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items as $item)
                <tr>
                    <td>{{ $item->product->name }}</td>
                    <td>{{ '$' . number_format($item->price, 2) }}</td>
                </tr>
                @endforeach
                <tr>
                    <td><strong>Total</strong></td>
                    <td><strong>{{ '$' . number_format($order->total, 2) }}</strong></td>
                </tr>
            </tbody>
        </table>

        <p style="text-align: center; margin-top: 30px;">
            <a href="{{ config('app.frontend_url', 'https://upgradercx.com') . '/orders' }}" class="button">Track Order Status</a>
        </p>

        <p>We will send you another email as soon as your items are delivered.</p>
        
        <p>Thanks,<br>{{ config('app.name') }}</p>
        
        <div class="footer">
            &copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
        </div>
    </div>
</body>
</html>
