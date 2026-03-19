import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  pulse?: boolean;
  className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
  success: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  error: 'bg-red-500/10 text-red-600 border-red-500/20',
  info: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  neutral: 'bg-muted text-muted-foreground border-border',
};

export function StatusBadge({ label, variant = 'neutral', pulse, className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn('gap-1.5 font-medium', variantStyles[variant], className)}>
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={cn(
            'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
            variant === 'success' && 'bg-emerald-400',
            variant === 'warning' && 'bg-amber-400',
            variant === 'error' && 'bg-red-400',
            variant === 'info' && 'bg-blue-400',
          )} />
          <span className={cn(
            'relative inline-flex h-2 w-2 rounded-full',
            variant === 'success' && 'bg-emerald-500',
            variant === 'warning' && 'bg-amber-500',
            variant === 'error' && 'bg-red-500',
            variant === 'info' && 'bg-blue-500',
            variant === 'neutral' && 'bg-muted-foreground',
          )} />
        </span>
      )}
      {label}
    </Badge>
  );
}
