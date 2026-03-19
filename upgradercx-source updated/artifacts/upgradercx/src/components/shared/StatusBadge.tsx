import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  error: 'bg-destructive/10 text-destructive border-destructive/20',
  info: 'bg-info/10 text-info border-info/20',
  neutral: 'bg-secondary text-secondary-foreground border-border',
};

const autoVariant = (status: string): StatusVariant => {
  const s = status.toLowerCase();
  if (['active', 'completed', 'approved', 'connected', 'operational', 'success', 'published', 'credited'].includes(s)) return 'success';
  if (['pending', 'in_review', 'processing', 'queued', 'scheduled', 'limited', 'degraded', 'pending_review'].includes(s)) return 'warning';
  if (['failed', 'rejected', 'cancelled', 'error', 'disconnected', 'outage', 'flagged', 'out_of_stock', 'refunded'].includes(s)) return 'error';
  if (['draft', 'archived', 'closed', 'unchecked', 'skipped'].includes(s)) return 'neutral';
  return 'info';
};

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  const v = variant || autoVariant(status);
  return (
    <Badge variant="outline" className={cn(variantStyles[v], className)}>
      {status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
    </Badge>
  );
}
