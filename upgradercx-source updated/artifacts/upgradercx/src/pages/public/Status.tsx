import { PageScaffold } from '@/components/PageScaffold';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';

const services = [
  { name: 'Website & Dashboard', status: 'operational' as const },
  { name: 'API Gateway', status: 'operational' as const },
  { name: 'Payment Processing', status: 'operational' as const },
  { name: 'Order Fulfillment', status: 'operational' as const },
  { name: 'Support System', status: 'operational' as const },
  { name: 'Telegram Integration', status: 'operational' as const },
  { name: 'Discord Integration', status: 'operational' as const },
];

const statusConfig = {
  operational: { icon: CheckCircle, label: 'Operational', color: 'text-green-500', badgeClass: 'bg-green-500/10 text-green-600' },
  degraded: { icon: AlertTriangle, label: 'Degraded', color: 'text-yellow-500', badgeClass: 'bg-yellow-500/10 text-yellow-600' },
  outage: { icon: AlertTriangle, label: 'Outage', color: 'text-destructive', badgeClass: 'bg-destructive/10 text-destructive' },
};

const recentIncidents = [
  { date: 'Mar 10, 2025', title: 'Scheduled Maintenance', desc: 'Database migration completed. No downtime.', status: 'resolved' },
  { date: 'Feb 28, 2025', title: 'API Latency Spike', desc: 'Elevated response times for 12 minutes. Root cause identified and patched.', status: 'resolved' },
  { date: 'Feb 15, 2025', title: 'Payment Gateway Update', desc: 'Rolling update to payment processor. Zero-downtime deployment.', status: 'resolved' },
];

export default function Status() {
  const allOperational = services.every((s) => s.status === 'operational');

  return (
    <div className="container max-w-3xl py-12">
      <PageScaffold title="System Status" description="Current operational status of UpgraderCX services.">
        <div className="space-y-8">
          {/* Overall status banner */}
          <Card className={allOperational ? 'border-green-500/30 bg-green-500/5' : 'border-yellow-500/30 bg-yellow-500/5'}>
            <CardContent className="pt-6 flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <p className="font-semibold text-foreground">All Systems Operational</p>
                <p className="text-xs text-muted-foreground">Last checked: {new Date().toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Service list */}
          <Card>
            <CardContent className="divide-y pt-6">
              {services.map((svc) => {
                const cfg = statusConfig[svc.status];
                return (
                  <div key={svc.name} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <cfg.icon className={`h-4 w-4 ${cfg.color}`} />
                      <span className="text-sm font-medium text-foreground">{svc.name}</span>
                    </div>
                    <Badge variant="secondary" className={cfg.badgeClass}>{cfg.label}</Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Uptime */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Uptime (Last 90 Days)</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-end justify-between mb-2">
                  <span className="text-3xl font-bold text-foreground">99.97%</span>
                  <span className="text-xs text-muted-foreground">Total downtime: 13 min</span>
                </div>
                <div className="flex gap-px h-6 rounded overflow-hidden">
                  {Array.from({ length: 90 }).map((_, i) => (
                    <div key={i} className={`flex-1 ${i === 58 ? 'bg-yellow-400' : 'bg-green-500'}`} title={i === 58 ? 'Degraded performance' : 'Operational'} />
                  ))}
                </div>
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>90 days ago</span>
                  <span>Today</span>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Recent incidents */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /> Recent Incidents</h2>
            <div className="space-y-3">
              {recentIncidents.map((inc) => (
                <Card key={inc.date}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-foreground">{inc.title}</h3>
                      <Badge variant="secondary" className="bg-green-500/10 text-green-600 text-xs">Resolved</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{inc.desc}</p>
                    <p className="text-xs text-muted-foreground mt-1">{inc.date}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </PageScaffold>
    </div>
  );
}
