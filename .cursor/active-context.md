> **BrainSync Context Pumper** 🧠
> Dynamically loaded for active file: `api\app\Services\DiscordService.php` (Domain: **Generic Logic**)

### 📐 Generic Logic Conventions & Fixes
- **[what-changed] what-changed in DiscordService.php**: -                                 'value' => '**$' . number_format($product->price, 2) . '**' . ($product->compare_price ? ' ~~$' . number_format($product->compare_price, 2) . '~~' : ''),
+                                 'value' => '**€' . number_format($product->price, 2) . '**' . ($product->compare_price ? ' ~~€' . number_format($product->compare_price, 2) . '~~' : ''),
- **[what-changed] what-changed in low_balance.blade.php**: -         <div style="font-size:32px; color:#d9534f; font-weight:bold; margin-top:5px;">{{ '$' . number_format($supplier->balance, 2) }}</div>
+         <div style="font-size:32px; color:#d9534f; font-weight:bold; margin-top:5px;">{{ '€' . number_format($supplier->balance, 2) }}</div>
- **[what-changed] what-changed in new_order.blade.php**: -             <td style="padding:10px 0; border-bottom:1px solid #c8d9d2; text-align:right; font-size:14px; color:#1f4d39; font-weight:bold;">{{ '$' . number_format($order->total, 2) }}</td>
+             <td style="padding:10px 0; border-bottom:1px solid #c8d9d2; text-align:right; font-size:14px; color:#1f4d39; font-weight:bold;">{{ '€' . number_format($order->total, 2) }}</td>
- **[what-changed] what-changed in confirmation.blade.php**: -             <td style="padding:10px 0; border-bottom:1px solid #c8d9d2; text-align:right; font-size:14px; color:#444;">{{ '$' . number_format($item->subtotal, 2) }}</td>
+             <td style="padding:10px 0; border-bottom:1px solid #c8d9d2; text-align:right; font-size:14px; color:#444;">{{ '€' . number_format($item->subtotal, 2) }}</td>
-             <td style="padding:15px 0 0; text-align:right; font-weight:bold; color:#1f4d39; font-size:18px;">{{ '$' . number_format($order->total, 2) }}</td>
+             <td style="padding:15px 0 0; text-align:right; font-weight:bold; color:#1f4d39; font-size:18px;">{{ '€' . number_format($order->total, 2) }}</td>
- **[what-changed] what-changed in receipt.blade.php**: -             <td style="padding:15px; border-bottom:1px solid #f0f0f0; text-align:right; font-size:14px;">{{ '$' . number_format($item->price, 2) }}</td>
+             <td style="padding:15px; border-bottom:1px solid #f0f0f0; text-align:right; font-size:14px;">{{ '€' . number_format($item->price, 2) }}</td>
-             <td style="padding:15px; text-align:right; font-weight:bold; color:#1f4d39; font-size:16px;">{{ '$' . number_format($order->total, 2) }}</td>
+             <td style="padding:15px; text-align:right; font-weight:bold; color:#1f4d39; font-size:16px;">{{ '€' . number_format($order->total, 2) }}</td>
