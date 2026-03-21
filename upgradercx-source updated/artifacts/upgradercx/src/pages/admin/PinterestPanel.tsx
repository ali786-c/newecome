import { useState, useEffect } from 'react';
import { PageScaffold } from '@/components/PageScaffold';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useApiQuery, useApiMutation } from '@/hooks/use-api-query';
import { pinterestApi } from '@/api/pinterest.api';
import { ChannelStatusCard } from '@/components/integrations';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  Send, Loader2, ArrowLeft, RefreshCw,
  CheckCircle, XCircle, Settings, Layout, ExternalLink,
} from 'lucide-react';

export default function PinterestPanel() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [manualAccessToken, setManualAccessToken] = useState('');
  const [manualRefreshToken, setManualRefreshToken] = useState('');

  useEffect(() => { document.title = 'Pinterest Integration — Admin — UpgraderCX'; }, []);

  /* ── Queries ── */
  const { data: configRes, refetch: refetchConfig } = useApiQuery(
    ['pinterest-config'], () => pinterestApi.getConfig(),
  );
  const config = configRes?.data;

  const { data: boardsRes, refetch: refetchBoards, isLoading: boardsLoading } = useApiQuery(
    ['pinterest-boards'], () => pinterestApi.getBoards(),
    { enabled: !!config?.config?.access_token_set }
  );
  const boards = boardsRes?.data || [];

  /* ── Mutations ── */
  const testMutation = useApiMutation(() => pinterestApi.testConnection(), {
    onSuccess: (res) => toast({ title: res.success ? 'Connection OK' : 'Connection failed', description: res.message }),
  });

  const configMutation = useApiMutation((data: any) => pinterestApi.updateConfig(data), {
    onSuccess: () => { toast({ title: 'Settings updated' }); refetchConfig(); },
  });

  const authUrlMutation = useApiMutation(() => pinterestApi.getAuthUrl(), {
    onSuccess: (res) => { window.location.href = res.url; },
  });

  const manualTokenMutation = useApiMutation((data: any) => pinterestApi.saveManualToken(data), {
    onSuccess: () => { 
      toast({ title: 'Manual tokens saved' }); 
      refetchConfig(); 
      setManualAccessToken('');
      setManualRefreshToken('');
    },
  });

  const connectionStatus = config?.status === 'active' ? 'connected' : (config?.status === 'error' ? 'error' : 'disconnected');

  return (
    <PageScaffold
      title="Pinterest Integration"
      description="Connect your Pinterest account to automate Pin creation for your blog posts."
      actions={
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/integrations')}>
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />Back
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Status */}
        <ChannelStatusCard
          name="Pinterest Account"
          icon={<Layout className="h-5 w-5" />}
          status={connectionStatus}
          subtitle={config?.config?.access_token_set ? 'Connected via OAuth2' : 'Authorization Required'}
          autoSync={config?.config?.auto_post_enabled}
          onTest={() => testMutation.mutate(undefined)}
          testing={testMutation.isPending}
        />

        <Tabs defaultValue="settings" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="settings"><Settings className="mr-1 h-3.5 w-3.5" /> Settings</TabsTrigger>
            <TabsTrigger value="boards"><Layout className="mr-1 h-3.5 w-3.5" /> Boards</TabsTrigger>
            {/* Activity tab can be added later if we implement a log table */}
          </TabsList>

          {/* ═══════════════ TAB: Settings ═══════════════ */}
          <TabsContent value="settings" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">API Credentials & OAuth</CardTitle>
                  <CardDescription>Enter your Pinterest App credentials or connect via OAuth</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Client ID</Label>
                    <Input
                      placeholder={config?.config?.client_id || 'Enter Client ID'}
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      autoComplete="off"
                      name="pinterest_client_id_new"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Client Secret</Label>
                    <Input
                      type="password"
                      placeholder={config?.config?.client_secret_set ? '••••••••••••••' : 'Enter Client Secret'}
                      value={clientSecret}
                      onChange={(e) => setClientSecret(e.target.value)}
                      autoComplete="new-password"
                      name="pinterest_client_secret_new"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      disabled={(!clientId && !clientSecret) || configMutation.isPending} 
                      onClick={() => {
                        configMutation.mutate({ client_id: clientId || undefined, client_secret: clientSecret || undefined });
                        setClientId('');
                        setClientSecret('');
                      }}
                    >
                      {configMutation.isPending && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}
                      Save Credentials
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      disabled={!config?.config?.client_id || authUrlMutation.isPending}
                      onClick={() => authUrlMutation.mutate()}
                    >
                      {authUrlMutation.isPending && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      Connect Pinterest
                    </Button>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="space-y-4 bg-muted/30 p-3 rounded-md border border-dashed">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold flex items-center gap-1">
                        <Settings className="h-3 w-3" /> Manual Token Fallback
                      </h4>
                      <Badge variant="outline" className="text-[9px] uppercase">Optional</Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-[11px]">Access Token (Manual)</Label>
                      <Input
                        className="h-8 text-xs font-mono"
                        placeholder={config?.config?.access_token_set ? 'Tokens are already set' : 'Paste Access Token'}
                        onChange={(e) => setManualAccessToken(e.target.value)}
                        value={manualAccessToken}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-[11px]">Refresh Token (Manual)</Label>
                      <Input
                        className="h-8 text-xs font-mono"
                        placeholder={config?.config?.access_token_set ? 'Tokens are already set' : 'Paste Refresh Token'}
                        onChange={(e) => setManualRefreshToken(e.target.value)}
                        value={manualRefreshToken}
                      />
                    </div>

                    <Button 
                      size="sm" 
                      variant="secondary"
                      className="w-full h-8 text-xs"
                      disabled={(!manualAccessToken && !manualRefreshToken) || manualTokenMutation.isPending}
                      onClick={() => {
                        manualTokenMutation.mutate({ 
                          access_token: manualAccessToken || undefined, 
                          refresh_token: manualRefreshToken || undefined
                        });
                      }}
                    >
                      {manualTokenMutation.isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                      Save Tokens Manually
                    </Button>
                  </div>

                  <p className="text-[10px] text-muted-foreground">Redirect URI for Pinterest App: <code className="bg-muted px-1 rounded">https://upgradercx.com/api/admin/pinterest/callback</code></p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Automation Settings</CardTitle>
                  <CardDescription>Control how and when Pins are created</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Auto-post new blog articles</Label>
                    <Switch 
                      checked={config?.config?.auto_post_enabled ?? false} 
                      onCheckedChange={(v) => configMutation.mutate({ auto_post_enabled: v })} 
                    />
                  </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Select 
                          value={config?.config?.board_id || ''} 
                          onValueChange={(v) => configMutation.mutate({ board_id: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={boardsLoading ? 'Loading boards...' : 'Select a board'} />
                          </SelectTrigger>
                          <SelectContent>
                            {boards.map((board) => (
                              <SelectItem key={board.id} value={board.id}>{board.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-9 w-9 p-0" 
                        onClick={() => refetchBoards()}
                        disabled={boardsLoading || !config?.config?.access_token_set}
                        title="Refresh Board List"
                      >
                        <RefreshCw className={`h-4 w-4 ${boardsLoading ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground uppercase">Or Enter Board ID Manually</Label>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="e.g. 1234567890" 
                          className="h-8 text-xs font-mono"
                          defaultValue={config?.config?.board_id || ''}
                          onBlur={(e) => {
                            if (e.target.value && e.target.value !== config?.config?.board_id) {
                              configMutation.mutate({ board_id: e.target.value });
                            }
                          }}
                        />
                      </div>
                      <p className="text-[9px] text-muted-foreground italic">You can find the Board ID in your Pinterest board URL.</p>
                    </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ═══════════════ TAB: Boards ═══════════════ */}
          <TabsContent value="boards" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Available Boards</CardTitle>
                <CardDescription>Your current Pinterest boards</CardDescription>
              </CardHeader>
              <CardContent>
                {boards.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    {config?.config?.access_token_set ? 'No boards found or not fetched yet.' : 'Please connect your account first.'}
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-3">
                    {boards.map((board) => (
                      <div key={board.id} className="p-4 border rounded-md relative flex flex-col gap-2">
                        <h4 className="font-medium text-sm">{board.name}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">{board.description || 'No description'}</p>
                        <div className="mt-auto pt-2 border-t text-[10px] text-muted-foreground">ID: {board.id}</div>
                        {config?.config?.board_id === board.id && (
                          <Badge className="absolute top-2 right-2 text-[8px] h-4">Selected</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageScaffold>
  );
}
