import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle2, XCircle, Clock, SkipForward } from 'lucide-react';
import type { ChannelPost, ChannelPostStatus } from '@/types';

const statusConfig: Record<ChannelPostStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  sent: { label: 'Sent', variant: 'default', icon: <CheckCircle2 className="h-3 w-3" /> },
  failed: { label: 'Failed', variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
  pending: { label: 'Pending', variant: 'outline', icon: <Clock className="h-3 w-3" /> },
  skipped: { label: 'Skipped', variant: 'secondary', icon: <SkipForward className="h-3 w-3" /> },
};

interface SyncActivityFeedProps {
  posts: ChannelPost[];
  loading?: boolean;
  onRetry?: (postId: number) => void;
  title?: string;
}

export function SyncActivityFeed({ posts, loading, onRetry, title = 'Recent Activity' }: SyncActivityFeedProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-12 rounded bg-muted animate-pulse" />)}
          </div>
        ) : posts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No activity yet</p>
        ) : (
          <div className="space-y-2">
            {posts.map((post) => {
              const cfg = statusConfig[post.status];
              return (
                <div key={post.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{post.product_name}</span>
                      <Badge variant="outline" className="text-[10px] shrink-0">{post.action}</Badge>
                    </div>
                    {post.error_message && <p className="text-xs text-destructive mt-0.5 truncate">{post.error_message}</p>}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {post.posted_at ? new Date(post.posted_at).toLocaleString() : new Date(post.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <Badge variant={cfg.variant} className="gap-1 text-[10px]">{cfg.icon}{cfg.label}</Badge>
                    {post.status === 'failed' && onRetry && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRetry(post.id)}>
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
