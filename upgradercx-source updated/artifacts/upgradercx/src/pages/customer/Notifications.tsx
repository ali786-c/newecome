import { PageScaffold } from '@/components/PageScaffold';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, ShoppingCart, Wallet, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import type { AppNotification } from '@/types';

// Mock notifications (will come from API)
const MOCK_NOTIFICATIONS: AppNotification[] = [
  { id: 1, type: 'order', title: 'Order Completed', body: 'Your order ORD-00001 has been delivered successfully.', read_at: '2025-03-11T12:00:00Z', created_at: '2025-03-11T10:00:00Z' },
  { id: 2, type: 'wallet', title: 'Top-up Successful', body: 'Your wallet has been credited with $55.49.', read_at: null as unknown as string, created_at: '2025-03-05T12:00:00Z' },
  { id: 3, type: 'system', title: 'Welcome to UpgraderCX', body: 'Thanks for signing up! Browse our products to get started.', read_at: '2025-03-01T00:00:00Z', created_at: '2025-02-01T00:00:00Z' },
  { id: 4, type: 'alert', title: 'Price Drop Alert', body: 'Office 365 Business is now $22.99 — down from $29.99!', read_at: null as unknown as string, created_at: '2025-03-12T09:00:00Z' },
];

const typeIcon = (type: string) => {
  switch (type) {
    case 'order': return <ShoppingCart className="h-4 w-4" />;
    case 'wallet': return <Wallet className="h-4 w-4" />;
    case 'alert': return <AlertTriangle className="h-4 w-4" />;
    default: return <Info className="h-4 w-4" />;
  }
};

export default function Notifications() {
  const notifications = MOCK_NOTIFICATIONS;
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <PageScaffold
      title="Notifications"
      description="Stay up to date with your account activity."
      actions={unreadCount > 0 ? <Button variant="outline" size="sm"><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Mark all read</Button> : undefined}
    >
      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-muted-foreground mt-3">You're all caught up!</p>
            <p className="text-sm text-muted-foreground">No new notifications</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card key={notification.id} className={!notification.read_at ? 'border-primary/30 bg-primary/5' : ''}>
              <CardContent className="flex items-start gap-3 pt-4 pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted shrink-0">
                  {typeIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{notification.title}</p>
                    {!notification.read_at && <Badge variant="default" className="text-[10px] h-4">New</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{notification.body}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(notification.created_at).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageScaffold>
  );
}
