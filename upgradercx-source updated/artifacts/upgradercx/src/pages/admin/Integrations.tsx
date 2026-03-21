import { PageScaffold } from '@/components/PageScaffold';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApiQuery } from '@/hooks/use-api-query';
import { telegramApi } from '@/api/telegram.api';
import { pinterestApi } from '@/api/pinterest.api';
import { discordApi } from '@/api/discord.api';
import { integrationApi } from '@/api/integration.api';
import { Send, MessageSquare, Layout, CreditCard, ArrowRight, CheckCircle2, XCircle, Plug, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Integrations() {
  const navigate = useNavigate();

  const { data: tgConfig } = useApiQuery(['tg-config-hub'], () => telegramApi.getConfig());
  const { data: pnConfig } = useApiQuery(['pn-config-hub'], () => pinterestApi.getConfig());
  const { data: dcConfig } = useApiQuery(['dc-config-hub'], () => discordApi.getConfig());
  const { data: integrationsRes } = useApiQuery(['integrations-list'], () => integrationApi.list());

  const tg = tgConfig?.data;
  const pn = pnConfig?.data;
  const dc = dcConfig?.data;
  const stripe = integrationsRes?.data?.find((i) => i.provider === 'stripe');

  const channels = [
    {
      name: 'Telegram',
      icon: <Send className="h-5 w-5" />,
      connected: !!tg?.bot_token_set,
      subtitle: tg?.bot_username ? `@${tg.bot_username}` : 'Bot not configured',
      autoSync: tg?.auto_sync_enabled ?? false,
      href: '/admin/integrations/telegram',
    },
    {
      name: 'Pinterest',
      icon: <Layout className="h-5 w-5" />,
      connected: !!pn?.config?.access_token_set,
      subtitle: pn?.status === 'active' ? 'Connected' : 'Not configured',
      autoSync: pn?.config?.auto_post_enabled ?? false,
      href: '/admin/integrations/pinterest',
    },
    {
      name: 'Discord',
      icon: <MessageSquare className="h-5 w-5" />,
      connected: !!dc?.webhook_url_set,
      subtitle: dc?.server_name || 'Webhook not configured',
      autoSync: dc?.auto_sync_enabled ?? false,
      href: '/admin/integrations/discord',
    },
  ];

  return (
    <PageScaffold title="Integrations" description="Connect and manage external channels and services.">
      <div className="space-y-6">
        {/* Channel Integrations */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Messaging Channels</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {channels.map((ch) => (
              <Card key={ch.name} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate(ch.href)}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">{ch.icon}</div>
                    <div>
                      <CardTitle className="text-base">{ch.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">{ch.subtitle}</p>
                    </div>
                  </div>
                  <Badge variant={ch.connected ? 'default' : 'secondary'} className="gap-1">
                    {ch.connected ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {ch.connected ? 'Connected' : 'Not Connected'}
                  </Badge>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Auto-sync: {ch.autoSync ? 'On' : 'Off'}</span>
                  <Button variant="ghost" size="sm"><ArrowRight className="h-3.5 w-3.5" /></Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Supplier Integrations */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Supplier Services</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate('/admin/supplier-import')}>
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"><Plug className="h-5 w-5" /></div>
                <div>
                  <CardTitle className="text-base">Supplier Manager</CardTitle>
                  <CardDescription className="text-xs">Manage Reloadly & G2A.COM connections</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <Badge variant="default">Connected</Badge>
                <Button variant="ghost" size="sm"><ArrowRight className="h-3.5 w-3.5" /></Button>
              </CardContent>
            </Card>
 
            <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate('/admin/supplier-sync')}>
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"><RefreshCw className="h-5 w-5" /></div>
                <div>
                  <CardTitle className="text-base">Price & Stock Sync</CardTitle>
                  <CardDescription className="text-xs">Automate margins and discovery rules</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Active rules: Auto</span>
                <Button variant="ghost" size="sm"><ArrowRight className="h-3.5 w-3.5" /></Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Other Integrations */}
      </div>
    </PageScaffold>
  );
}
