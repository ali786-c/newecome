import { Order } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Package, Key, Copy } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { toast } from 'sonner';
import { statusConfig } from '@/config/order-status';

interface OrderDetailViewProps {
  order: Order;
}

export function OrderDetailView({ order }: OrderDetailViewProps) {
  const { formatPrice } = useSettings();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Customer</p>
          <p className="font-semibold text-foreground">{order.user?.name || `User #${order.user_id}`}</p>
          <p className="text-xs text-muted-foreground">{order.user?.email}</p>
        </div>
        <div>
          <p className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Status</p>
          <Badge variant={statusConfig[order.status].variant}>{statusConfig[order.status].label}</Badge>
        </div>
        <div>
          <p className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Payment Method</p>
          <p className="font-semibold text-foreground capitalize">{order.payment_method || '—'}</p>
        </div>
        <div>
          <p className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Date</p>
          <p className="font-semibold text-foreground">{new Date(order.created_at).toLocaleString()}</p>
        </div>

        {/* Billing Details */}
        {(order.card_last4 || order.card_brand || order.card_holder_name || order.paid_at) && (
          <div className="col-span-2 rounded-lg bg-muted/40 border p-3 mt-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-2">Detailed Billing Info</p>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
              {order.card_holder_name && (
                <div>
                  <span className="text-muted-foreground block text-[9px] uppercase">Cardholder</span>
                  <p className="font-medium text-foreground">{order.card_holder_name}</p>
                </div>
              )}
              {(order.card_brand || order.card_last4) && (
                <div>
                  <span className="text-muted-foreground block text-[9px] uppercase">Payment Source</span>
                  <p className="font-medium text-foreground capitalize">
                    {order.card_brand || 'Card'} {order.card_last4 ? `**** ${order.card_last4}` : ''}
                  </p>
                </div>
              )}
              {order.paid_at && (
                <div className="col-span-2">
                  <span className="text-muted-foreground block text-[9px] uppercase">Gateway Confirmation Date</span>
                  <p className="font-medium text-foreground">{new Date(order.paid_at).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Separator />
      <div>
        <p className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Package className="h-4 w-4" /> Ordered Items
        </p>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-lg border bg-card p-3 text-sm shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-bold text-foreground leading-tight flex items-center gap-1.5 flex-wrap">
                    <span>{item.product?.name || `Product #${item.product_id}`}</span>
                    {item.variant_label && (
                      <Badge variant="secondary" className="text-[10px] font-semibold px-1.5 py-0 h-4">
                        {item.variant_label}
                      </Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">Quantity: {item.quantity}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="font-bold text-foreground text-sm">{formatPrice(item.total)}</span>
                {item.credentials && (
                  <Badge variant="outline" className="text-[10px] h-5 bg-emerald-50 text-emerald-700 border-emerald-200">
                    Code Ready
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {order.items.some(i => i.credentials) && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/30 p-4">
          <p className="text-xs font-bold text-emerald-800 mb-3 flex items-center gap-2 uppercase tracking-tight">
            <Key className="h-4 w-4 text-emerald-600" /> Digital Content / Access Codes
          </p>
          <div className="space-y-3">
            {order.items.filter(i => i.credentials).map(item => (
              <div key={item.id} className="bg-white p-3 border rounded-lg shadow-sm">
                <p className="text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-wider border-b pb-1">
                  Item: {item.product?.name || `Product #${item.product_id}`} {item.variant_label ? `(${item.variant_label})` : ''}
                </p>
                {Array.isArray(item.credentials) ? item.credentials.map((c: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0 font-mono text-sm group">
                    <span className="text-foreground font-medium select-all">{c.code}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" 
                      onClick={() => copyToClipboard(c.code)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )) : (
                  <div className="p-2 bg-muted rounded text-xs font-mono break-all whitespace-pre-wrap">
                    {typeof item.credentials === 'string' ? item.credentials : JSON.stringify(item.credentials, null, 2)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <Separator />
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground font-medium">Order Total</span>
        <span className="text-xl font-bold bg-primary/5 text-primary px-3 py-1 rounded-md border border-primary/10">
          {formatPrice(order.total)}
        </span>
      </div>
      {order.notes && (
        <div className="rounded-lg bg-yellow-50/50 border border-yellow-100 p-4 text-sm mt-4">
          <p className="text-[10px] font-bold text-yellow-800 mb-1 uppercase tracking-wider">Internal Order Notes</p>
          <p className="text-foreground leading-relaxed">{order.notes}</p>
        </div>
      )}
    </div>
  );
}
