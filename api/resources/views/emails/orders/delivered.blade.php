<x-mail::message>
# Order Delivered! 🎁

Hello {{ $order->user->name }},

Good news! Your order #{{ $order->order_number }} has been successfully fulfilled and your digital products are ready.

<x-mail::table>
| Product | Content / PIN |
|:--------|:--------------|
@foreach($order->items as $item)
| **{{ $item->product->name }}** | @if($item->credentials) @foreach($item->credentials as $card) `{{ $card['code'] ?? $card['cardNumber'] ?? 'N/A' }}` @if(!empty($card['pinCode'] || !empty($card['pin']))) <br> PIN: `{{ $card['pinCode'] ?? $card['pin'] }}` @endif <br> _{{ $card['instructions'] ?? '' }}_ @endforeach @else _Manual Delivery_ @endif |
@endforeach
</x-mail::table>

<x-mail::button :url="config('app.frontend_url', 'https://upgradercx.com') . '/orders'">
View Order in Dashboard
</x-mail::button>

If you have any questions, please reply to this email or contact our support team.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
