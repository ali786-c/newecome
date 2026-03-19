import { AlertTriangle, Info, AlertCircle, CheckCircle, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type AlertSeverity = 'critical' | 'warning' | 'info' | 'success';

interface AlertItemProps {
  title: string;
  description?: string;
  severity: AlertSeverity;
  timestamp?: string;
  action?: React.ReactNode;
}

const severityConfig: Record<AlertSeverity, { icon: LucideIcon; bg: string; text: string; border: string }> = {
  critical: { icon: AlertCircle, bg: 'bg-red-500/5', text: 'text-red-600', border: 'border-red-500/20' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-500/5', text: 'text-amber-600', border: 'border-amber-500/20' },
  info: { icon: Info, bg: 'bg-blue-500/5', text: 'text-blue-600', border: 'border-blue-500/20' },
  success: { icon: CheckCircle, bg: 'bg-emerald-500/5', text: 'text-emerald-600', border: 'border-emerald-500/20' },
};

export function AlertItem({ title, description, severity, timestamp, action }: AlertItemProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <div className={cn('flex items-start gap-3 rounded-lg border p-3', config.bg, config.border)}>
      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', config.text)} />
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', config.text)}>{title}</p>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        {timestamp && <p className="mt-1 text-[10px] text-muted-foreground">{timestamp}</p>}
      </div>
      {action}
    </div>
  );
}
