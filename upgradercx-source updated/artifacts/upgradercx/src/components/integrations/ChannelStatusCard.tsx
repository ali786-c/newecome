import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertTriangle, Loader2, Settings } from 'lucide-react';
import type { IntegrationStatus } from '@/types';

interface ChannelStatusCardProps {
  name: string;
  icon: React.ReactNode;
  status: IntegrationStatus;
  subtitle?: string;
  lastSync?: string;
  autoSync?: boolean;
  errorCount?: number;
  onSettings?: () => void;
  onTest?: () => void;
  testing?: boolean;
}

const statusConfig: Record<IntegrationStatus, { label: string; variant: 'default' | 'secondary' | 'destructive'; icon: React.ReactNode }> = {
  connected: { label: 'Connected', variant: 'default', icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" /> },
  disconnected: { label: 'Not Connected', variant: 'secondary', icon: <XCircle className="h-4 w-4 text-muted-foreground" /> },
  error: { label: 'Error', variant: 'destructive', icon: <AlertTriangle className="h-4 w-4 text-destructive" /> },
};

export function ChannelStatusCard({ name, icon, status, subtitle, lastSync, autoSync, errorCount, onSettings, onTest, testing }: ChannelStatusCardProps) {
  const cfg = statusConfig[status];

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">{icon}</div>
          <div>
            <CardTitle className="text-base">{name}</CardTitle>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <Badge variant={cfg.variant} className="gap-1">{cfg.icon}{cfg.label}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {lastSync && <span>Last sync: {new Date(lastSync).toLocaleString()}</span>}
          {autoSync !== undefined && <span>Auto-sync: {autoSync ? 'On' : 'Off'}</span>}
          {!!errorCount && <span className="text-destructive">{errorCount} error{errorCount > 1 ? 's' : ''}</span>}
        </div>
        <div className="flex gap-2">
          {onSettings && <Button variant="outline" size="sm" onClick={onSettings}><Settings className="h-3.5 w-3.5 mr-1" />Settings</Button>}
          {onTest && <Button variant="ghost" size="sm" onClick={onTest} disabled={testing}>{testing && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}Test Connection</Button>}
        </div>
      </CardContent>
    </Card>
  );
}
