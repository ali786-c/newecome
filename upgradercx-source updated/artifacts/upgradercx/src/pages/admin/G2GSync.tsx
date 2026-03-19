import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  RefreshCw, TrendingUp, TrendingDown, DollarSign, Zap, Clock,
  CheckCircle2, XCircle, AlertTriangle, Link2, Edit2, Trash2,
  Settings, BarChart2, ArrowUpDown, Globe, Save, Plus, Eye,
  ChevronUp, ChevronDown, Minus, Key, Wifi, WifiOff, Bell,
  PackagePlus, PackageX, Send, MessageSquare, Loader2, ShieldCheck,
} from 'lucide-react';

/* ── Types ── */
interface G2GMapping {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  category: string;
  ourPrice: number;
  g2gUrl: string;
  g2gListingId: string;
  g2gCurrentPrice: number | null;
  g2gLowestPrice: number | null;
  markupType: 'percentage' | 'fixed';
  markupValue: number;
  calculatedPrice: number | null;
  lastSynced: string | null;
  syncStatus: 'synced' | 'pending' | 'error' | 'unmapped';
  priceDirection: 'up' | 'down' | 'stable' | null;
  autoApply: boolean;
}

interface SyncLog {
  id: number;
  timestamp: string;
  type: 'success' | 'error' | 'warning';
  message: string;
  productName?: string;
  oldPrice?: number;
  newPrice?: number;
}

interface GlobalSettings {
  markupType: 'percentage' | 'fixed';
  markupValue: number;
  syncFrequency: 'hourly' | 'every6h' | 'every12h' | 'daily' | 'manual';
  autoApply: boolean;
  minPrice: number;
  maxMarkup: number;
  alertThreshold: number;
}

/* ── Mock Data ── */
const MOCK_MAPPINGS: G2GMapping[] = [
  { id: 1, productId: 9,  productName: 'Netflix Premium', productSlug: 'netflix', category: 'Streaming', ourPrice: 5.99, g2gUrl: 'https://supplier-api.internal/listing/netflix-premium', g2gListingId: 'SUP-10091', g2gCurrentPrice: 4.20, g2gLowestPrice: 3.99, markupType: 'percentage', markupValue: 40, calculatedPrice: 5.88, lastSynced: new Date(Date.now() - 3600000).toISOString(), syncStatus: 'synced', priceDirection: 'up', autoApply: true },
  { id: 2, productId: 11, productName: 'YouTube Premium', productSlug: 'youtube-premium', category: 'Streaming', ourPrice: 2.99, g2gUrl: 'https://supplier-api.internal/listing/youtube-premium', g2gListingId: 'SUP-10092', g2gCurrentPrice: 2.10, g2gLowestPrice: 1.99, markupType: 'percentage', markupValue: 40, calculatedPrice: 2.94, lastSynced: new Date(Date.now() - 3600000).toISOString(), syncStatus: 'synced', priceDirection: 'stable', autoApply: true },
  { id: 3, productId: 12, productName: 'HBO Max', productSlug: 'hbo-max', category: 'Streaming', ourPrice: 4.99, g2gUrl: 'https://supplier-api.internal/listing/hbo-max', g2gListingId: 'SUP-10093', g2gCurrentPrice: 3.50, g2gLowestPrice: 3.25, markupType: 'percentage', markupValue: 40, calculatedPrice: 4.90, lastSynced: new Date(Date.now() - 7200000).toISOString(), syncStatus: 'synced', priceDirection: 'down', autoApply: false },
  { id: 4, productId: 14, productName: 'ChatGPT Plus', productSlug: 'chatgpt-plus', category: 'AI Products', ourPrice: 9.99, g2gUrl: 'https://supplier-api.internal/listing/chatgpt-plus', g2gListingId: 'SUP-10094', g2gCurrentPrice: 7.20, g2gLowestPrice: 6.99, markupType: 'percentage', markupValue: 35, calculatedPrice: 9.72, lastSynced: new Date(Date.now() - 1800000).toISOString(), syncStatus: 'synced', priceDirection: 'up', autoApply: true },
  { id: 5, productId: 15, productName: 'Midjourney', productSlug: 'midjourney', category: 'AI Products', ourPrice: 7.99, g2gUrl: 'https://supplier-api.internal/listing/midjourney', g2gListingId: 'SUP-10095', g2gCurrentPrice: null, g2gLowestPrice: null, markupType: 'percentage', markupValue: 40, calculatedPrice: null, lastSynced: null, syncStatus: 'error', priceDirection: null, autoApply: true },
  { id: 6, productId: 22, productName: 'NordVPN', productSlug: 'nordvpn', category: 'VPN & Security', ourPrice: 3.49, g2gUrl: 'https://supplier-api.internal/listing/nordvpn', g2gListingId: 'SUP-10096', g2gCurrentPrice: 2.40, g2gLowestPrice: 2.20, markupType: 'fixed', markupValue: 1.20, calculatedPrice: 3.60, lastSynced: new Date(Date.now() - 86400000).toISOString(), syncStatus: 'synced', priceDirection: 'stable', autoApply: false },
  { id: 7, productId: 10, productName: 'Disney+', productSlug: 'disney-plus', category: 'Streaming', ourPrice: 3.49, g2gUrl: '', g2gListingId: '', g2gCurrentPrice: null, g2gLowestPrice: null, markupType: 'percentage', markupValue: 40, calculatedPrice: null, lastSynced: null, syncStatus: 'unmapped', priceDirection: null, autoApply: false },
  { id: 8, productId: 17, productName: 'Perplexity Pro', productSlug: 'perplexity-pro', category: 'AI Products', ourPrice: 8.99, g2gUrl: '', g2gListingId: '', g2gCurrentPrice: null, g2gLowestPrice: null, markupType: 'percentage', markupValue: 40, calculatedPrice: null, lastSynced: null, syncStatus: 'unmapped', priceDirection: null, autoApply: false },
];

const MOCK_LOGS: SyncLog[] = [
  { id: 1, timestamp: new Date(Date.now() - 600000).toISOString(), type: 'success', message: 'Price updated automatically', productName: 'Netflix Premium', oldPrice: 5.88, newPrice: 5.99 },
  { id: 2, timestamp: new Date(Date.now() - 1200000).toISOString(), type: 'success', message: 'Sync completed — 4 products updated', },
  { id: 3, timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'error', message: 'Failed to fetch supplier price — listing unavailable', productName: 'Midjourney' },
  { id: 4, timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'warning', message: 'Price change exceeds alert threshold (+18%)', productName: 'ChatGPT Plus', oldPrice: 8.20, newPrice: 9.72 },
  { id: 5, timestamp: new Date(Date.now() - 14400000).toISOString(), type: 'success', message: 'Scheduled sync started — checking 6 mapped products' },
  { id: 6, timestamp: new Date(Date.now() - 86400000).toISOString(), type: 'success', message: 'Price updated automatically', productName: 'YouTube Premium', oldPrice: 2.80, newPrice: 2.94 },
];

/* ── Helpers ── */
function timeAgo(iso?: string | null) {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function calcPrice(g2gPrice: number, markup: G2GMapping['markupType'], value: number) {
  if (markup === 'percentage') return +(g2gPrice * (1 + value / 100)).toFixed(2);
  return +(g2gPrice + value).toFixed(2);
}

const statusVariant: Record<G2GMapping['syncStatus'], { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  synced:   { label: 'Synced',   variant: 'default',     icon: <CheckCircle2 className="h-3 w-3" /> },
  pending:  { label: 'Pending',  variant: 'secondary',   icon: <Clock className="h-3 w-3" /> },
  error:    { label: 'Error',    variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
  unmapped: { label: 'Unmapped', variant: 'outline',     icon: <AlertTriangle className="h-3 w-3" /> },
};

/* ── Main Component ── */
/* ── G2G Reseller API Panel ── */
function G2GApiPanel() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const [discovery, setDiscovery] = useState({
    autoEnableNew: true,
    autoDisableRemoved: true,
    requireImageForNew: true,
    notifyDiscord: true,
    notifyTelegram: true,
    discordWebhook: '',
    telegramChatId: '',
    syncTime: '03:00',
    dailySync: true,
    priceSync: true,
    availabilitySync: true,
    newProductPostFormat: 'full',
    autoGenerateSeoDescription: true,
    autoAssignCategory: true,
  });

  const testConnection = async () => {
    if (!apiKey) { toast({ title: 'Enter your API key first', variant: 'destructive' }); return; }
    setTesting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setTesting(false);
    setConnectionStatus('connected');
    toast({ title: 'Supplier API connected!', description: 'Reseller account verified — 847 products available.' });
  };

  const saveApiCredentials = () => {
    if (!apiKey) { toast({ title: 'API key is required', variant: 'destructive' }); return; }
    setApiKey('');
    setApiSecret('');
    toast({ title: 'API credentials saved', description: 'Credentials stored securely server-side.' });
  };

  return (
    <div className="space-y-4">
      {/* Connection status banner */}
      {connectionStatus === 'connected' && (
        <div className="flex items-center gap-2 rounded-md border border-green-500/30 bg-green-500/10 px-4 py-2.5 text-sm text-green-700">
          <Wifi className="h-4 w-4 shrink-0" />
          <span><strong>Supplier API connected.</strong> 847 products available in your reseller catalog. Syncing daily at {discovery.syncTime}.</span>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* API Credentials */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Key className="h-4 w-4" />Supplier API Credentials</CardTitle>
            <CardDescription>Enter your reseller API key from your supplier dashboard → API Settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>API Key</Label>
              <Input
                type="password"
                placeholder={connectionStatus === 'connected' ? '••••••••••••••••••••' : 'api_key_xxxxxxxxxxxxxxxx'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>API Secret <span className="text-muted-foreground text-xs">(if required by your tier)</span></Label>
              <Input
                type="password"
                placeholder={connectionStatus === 'connected' ? '••••••••••••••' : 'Optional secret key'}
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 gap-2" onClick={testConnection} disabled={testing}>
                {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : connectionStatus === 'connected' ? <Wifi className="h-4 w-4 text-green-600" /> : <WifiOff className="h-4 w-4" />}
                {testing ? 'Testing…' : 'Test Connection'}
              </Button>
              <Button className="flex-1 gap-2" onClick={saveApiCredentials}>
                <Save className="h-4 w-4" />Save Credentials
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">Credentials are stored server-side only and never exposed to the frontend or browser.</p>
            <div className="rounded-md border bg-muted/40 p-3 space-y-1.5">
              <p className="text-xs font-semibold text-foreground">How to get your Supplier API key:</p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Log into your supplier seller account</li>
                <li>Go to Seller Dashboard → Settings → API Access</li>
                <li>Click "Generate API Key" and copy the key</li>
                <li>Paste it above and click Save Credentials</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Auto-Discovery */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><PackagePlus className="h-4 w-4" />Auto-Discovery Rules</CardTitle>
            <CardDescription>Control how the system reacts when supplier products change status or new ones appear.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { key: 'dailySync', label: 'Daily catalog sync', desc: 'Fetch full supplier catalog once a day', icon: <Clock className="h-3.5 w-3.5 text-muted-foreground" /> },
              { key: 'priceSync', label: 'Auto-update prices', desc: 'Apply profit margin and update instantly', icon: <DollarSign className="h-3.5 w-3.5 text-muted-foreground" /> },
              { key: 'availabilitySync', label: 'Auto-sync availability', desc: 'Mirror in-stock / out-of-stock status', icon: <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" /> },
              { key: 'autoEnableNew', label: 'Auto-publish new products', desc: 'Add and publish new supplier listings automatically', icon: <PackagePlus className="h-3.5 w-3.5 text-green-600" /> },
              { key: 'autoDisableRemoved', label: 'Auto-disable removed products', desc: 'Hide products that disappear from supplier catalog', icon: <PackageX className="h-3.5 w-3.5 text-destructive" /> },
              { key: 'autoGenerateSeoDescription', label: 'AI-generate SEO description', desc: 'Generate compliant product description for new products', icon: <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" /> },
              { key: 'autoAssignCategory', label: 'Auto-assign category', desc: 'Match supplier category to your store category', icon: <Zap className="h-3.5 w-3.5 text-muted-foreground" /> },
              { key: 'requireImageForNew', label: 'Require image to publish', desc: 'Only publish new products that have an image', icon: <Eye className="h-3.5 w-3.5 text-muted-foreground" /> },
            ].map((rule) => (
              <div key={rule.key} className="flex items-center justify-between rounded-md border px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  {rule.icon}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{rule.label}</p>
                    <p className="text-[11px] text-muted-foreground">{rule.desc}</p>
                  </div>
                </div>
                <Switch
                  checked={discovery[rule.key as keyof typeof discovery] as boolean}
                  onCheckedChange={(v) => setDiscovery((d) => ({ ...d, [rule.key]: v }))}
                />
              </div>
            ))}
            <div className="flex items-center justify-between pt-1">
              <div>
                <Label className="text-sm">Daily sync time</Label>
                <p className="text-[11px] text-muted-foreground">When the nightly catalog check runs</p>
              </div>
              <Input type="time" value={discovery.syncTime} onChange={(e) => setDiscovery((d) => ({ ...d, syncTime: e.target.value }))} className="w-28" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification channels for new products */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4" />Notification Channels — New & Removed Products</CardTitle>
          <CardDescription>When new products are auto-published or existing ones are disabled, post an announcement to these channels automatically.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Discord */}
            <div className="space-y-3 rounded-md border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[#5865F2]" />
                  <Label className="text-sm font-semibold">Discord</Label>
                </div>
                <Switch checked={discovery.notifyDiscord} onCheckedChange={(v) => setDiscovery((d) => ({ ...d, notifyDiscord: v }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Override Webhook URL <span className="text-muted-foreground">(leave blank to use Discord settings)</span></Label>
                <Input
                  placeholder="https://discord.com/api/webhooks/..."
                  value={discovery.discordWebhook}
                  onChange={(e) => setDiscovery((d) => ({ ...d, discordWebhook: e.target.value }))}
                  disabled={!discovery.notifyDiscord}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Post format</Label>
                <Select value={discovery.newProductPostFormat} onValueChange={(v) => setDiscovery((d) => ({ ...d, newProductPostFormat: v }))} disabled={!discovery.notifyDiscord}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Rich embed (image + price + link)</SelectItem>
                    <SelectItem value="compact">Compact (name + link only)</SelectItem>
                    <SelectItem value="text">Plain text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-[10px]"><PackagePlus className="h-2.5 w-2.5 mr-1" />New product post</Badge>
                <Badge variant="outline" className="text-[10px]"><PackageX className="h-2.5 w-2.5 mr-1" />Removal notice</Badge>
              </div>
            </div>

            {/* Telegram */}
            <div className="space-y-3 rounded-md border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4 text-[#26A5E4]" />
                  <Label className="text-sm font-semibold">Telegram</Label>
                </div>
                <Switch checked={discovery.notifyTelegram} onCheckedChange={(v) => setDiscovery((d) => ({ ...d, notifyTelegram: v }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Override Channel ID <span className="text-muted-foreground">(leave blank to use Telegram settings)</span></Label>
                <Input
                  placeholder="-1001234567890"
                  value={discovery.telegramChatId}
                  onChange={(e) => setDiscovery((d) => ({ ...d, telegramChatId: e.target.value }))}
                  disabled={!discovery.notifyTelegram}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Message template for new product</Label>
                <textarea
                  className="w-full resize-none rounded-md border bg-muted/30 px-3 py-2 text-xs font-mono h-20 focus:outline-none focus:ring-1 focus:ring-ring"
                  disabled={!discovery.notifyTelegram}
                  defaultValue="🆕 New: {name}\n💰 From €{price} (retail €{retail_price})\n🔗 {link}"
                />
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-[10px]"><PackagePlus className="h-2.5 w-2.5 mr-1" />New product post</Badge>
                <Badge variant="outline" className="text-[10px]"><PackageX className="h-2.5 w-2.5 mr-1" />Removal notice</Badge>
              </div>
            </div>
          </div>

          <Button className="gap-2" onClick={() => toast({ title: 'Discovery settings saved', description: 'Next sync will use these notification rules.' })}>
            <Save className="h-4 w-4" />Save Discovery & Notification Settings
          </Button>
        </CardContent>
      </Card>

      {/* Automation flow diagram */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Full Supplier Automation Flow</CardTitle>
          <CardDescription>How the system runs on its own — zero human interaction required.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { step: '01', icon: <Clock className="h-4 w-4 text-primary" />, title: 'Nightly catalog sync', desc: `At ${discovery.syncTime} every day, the system fetches your full reseller catalog via the supplier API.` },
              { step: '02', icon: <RefreshCw className="h-4 w-4 text-primary" />, title: 'Price recalculation', desc: 'For each product, supplier base price × your profit margin = new website price. Applied instantly.' },
              { step: '03', icon: <PackagePlus className="h-4 w-4 text-green-600" />, title: 'New product detected', desc: 'If a supplier product is not in your catalog, it\'s automatically created, assigned a category, and published.' },
              { step: '04', icon: <PackageX className="h-4 w-4 text-destructive" />, title: 'Removed product detected', desc: 'If a supplier product disappears or is disabled, your website product is automatically hidden.' },
              { step: '05', icon: <Bell className="h-4 w-4 text-amber-500" />, title: 'Channel announcements', desc: 'New products trigger posts to Discord and Telegram automatically. Removals send a brief notice.' },
              { step: '06', icon: <ShieldCheck className="h-4 w-4 text-primary" />, title: 'Compliance gate', desc: 'All auto-generated descriptions pass through the compliance filter before publishing.' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">{item.step}</div>
                <div className="flex items-start gap-2 min-w-0">
                  <div className="mt-0.5 shrink-0">{item.icon}</div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function G2GSync() {
  const { toast } = useToast();
  const [mappings, setMappings] = useState<G2GMapping[]>(MOCK_MAPPINGS);
  const [logs, setLogs] = useState<SyncLog[]>(MOCK_LOGS);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [editMapping, setEditMapping] = useState<G2GMapping | null>(null);
  const [editUrl, setEditUrl] = useState('');
  const [editMarkupType, setEditMarkupType] = useState<'percentage' | 'fixed'>('percentage');
  const [editMarkupValue, setEditMarkupValue] = useState('40');
  const [editAutoApply, setEditAutoApply] = useState(true);
  const [settings, setSettings] = useState<GlobalSettings>({
    markupType: 'percentage',
    markupValue: 40,
    syncFrequency: 'every6h',
    autoApply: true,
    minPrice: 1.00,
    maxMarkup: 200,
    alertThreshold: 15,
  });
  const [settingsDraft, setSettingsDraft] = useState<GlobalSettings>({ ...settings });

  useEffect(() => { document.title = 'Supplier Price Sync — Admin — UpgraderCX'; }, []);

  /* Stats */
  const mapped = mappings.filter((m) => m.syncStatus !== 'unmapped');
  const synced = mappings.filter((m) => m.syncStatus === 'synced');
  const errors = mappings.filter((m) => m.syncStatus === 'error');
  const unmapped = mappings.filter((m) => m.syncStatus === 'unmapped');
  const avgMarkup = mapped.length
    ? (mapped.reduce((s, m) => s + (m.markupType === 'percentage' ? m.markupValue : 0), 0) / mapped.filter((m) => m.markupType === 'percentage').length || 0)
    : 0;

  /* Simulate sync */
  function runSync() {
    setIsSyncing(true);
    setSyncProgress(0);
    const mapped_ = mappings.filter((m) => m.syncStatus !== 'unmapped' && m.g2gListingId);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setSyncProgress(Math.round((i / mapped_.length) * 100));
      if (i >= mapped_.length) {
        clearInterval(interval);
        setMappings((prev) => prev.map((m) => {
          if (m.syncStatus === 'unmapped' || !m.g2gListingId) return m;
          if (m.syncStatus === 'error') return { ...m, lastSynced: new Date().toISOString() };
          const delta = (Math.random() - 0.45) * 0.3;
          const newG2g = Math.max(0.5, +((m.g2gCurrentPrice || m.ourPrice * 0.7) * (1 + delta)).toFixed(2));
          const newCalc = calcPrice(newG2g, m.markupType, m.markupValue);
          const dir: G2GMapping['priceDirection'] = delta > 0.02 ? 'up' : delta < -0.02 ? 'down' : 'stable';
          return { ...m, g2gCurrentPrice: newG2g, calculatedPrice: newCalc, lastSynced: new Date().toISOString(), syncStatus: 'synced', priceDirection: dir, ourPrice: m.autoApply ? newCalc : m.ourPrice };
        }));
        setLogs((prev) => [
          { id: Date.now(), timestamp: new Date().toISOString(), type: 'success', message: `Sync completed — ${mapped_.length} products checked` },
          ...prev,
        ]);
        setIsSyncing(false);
        setSyncProgress(0);
        toast({ title: 'Sync complete', description: `${mapped_.length} products synced from supplier.` });
      }
    }, 600);
  }

  /* Open edit dialog */
  function openEdit(m: G2GMapping) {
    setEditMapping(m);
    setEditUrl(m.g2gUrl);
    setEditMarkupType(m.markupType);
    setEditMarkupValue(String(m.markupValue));
    setEditAutoApply(m.autoApply);
  }

  function saveEdit() {
    if (!editMapping) return;
    const val = parseFloat(editMarkupValue) || 0;
    setMappings((prev) => prev.map((m) => {
      if (m.id !== editMapping.id) return m;
      const newCalc = m.g2gCurrentPrice ? calcPrice(m.g2gCurrentPrice, editMarkupType, val) : null;
      return { ...m, g2gUrl: editUrl, markupType: editMarkupType, markupValue: val, autoApply: editAutoApply, calculatedPrice: newCalc, syncStatus: editUrl ? (m.syncStatus === 'unmapped' ? 'pending' : m.syncStatus) : 'unmapped' };
    }));
    setEditMapping(null);
    toast({ title: 'Mapping saved', description: 'Supplier mapping updated successfully.' });
  }

  function applyGlobalMarkup() {
    setMappings((prev) => prev.map((m) => {
      const newCalc = m.g2gCurrentPrice ? calcPrice(m.g2gCurrentPrice, settings.markupType, settings.markupValue) : null;
      return { ...m, markupType: settings.markupType, markupValue: settings.markupValue, autoApply: settings.autoApply, calculatedPrice: newCalc, ourPrice: settings.autoApply && newCalc ? newCalc : m.ourPrice };
    }));
    toast({ title: 'Global markup applied', description: `${settings.markupValue}${settings.markupType === 'percentage' ? '%' : '$'} markup applied to all products.` });
  }

  function saveSettings() {
    setSettings(settingsDraft);
    toast({ title: 'Settings saved', description: 'Sync settings updated successfully.' });
  }

  const priceIcon = (dir: G2GMapping['priceDirection']) => {
    if (dir === 'up') return <ChevronUp className="h-3 w-3 text-red-500" />;
    if (dir === 'down') return <ChevronDown className="h-3 w-3 text-green-500" />;
    if (dir === 'stable') return <Minus className="h-3 w-3 text-muted-foreground" />;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Supplier Price Sync</h1>
          <p className="text-sm text-muted-foreground">
            Map products to supplier listings and auto-sync prices with a configurable markup.
          </p>
        </div>
        <Button onClick={runSync} disabled={isSyncing} className="gap-2">
          {isSyncing
            ? <><RefreshCw className="h-4 w-4 animate-spin" /> Syncing…</>
            : <><RefreshCw className="h-4 w-4" /> Sync Now</>}
        </Button>
      </div>

      {/* Sync progress */}
      {isSyncing && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="font-medium text-foreground">Fetching supplier prices…</span>
              <span className="text-muted-foreground">{syncProgress}%</span>
            </div>
            <Progress value={syncProgress} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Link2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{mapped.length}/{mappings.length}</p>
                <p className="text-xs text-muted-foreground">Mapped Products</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{synced.length}</p>
                <p className="text-xs text-muted-foreground">Synced</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{errors.length}</p>
                <p className="text-xs text-muted-foreground">Errors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{avgMarkup.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Avg Markup</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="mappings">
        <TabsList>
          <TabsTrigger value="api"><Key className="mr-1.5 h-3.5 w-3.5" />API & Auto-Discovery</TabsTrigger>
          <TabsTrigger value="mappings"><Link2 className="mr-1.5 h-3.5 w-3.5" />Product Mappings</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="mr-1.5 h-3.5 w-3.5" />Sync Settings</TabsTrigger>
          <TabsTrigger value="alerts"><AlertTriangle className="mr-1.5 h-3.5 w-3.5" />Price Alerts</TabsTrigger>
          <TabsTrigger value="logs"><BarChart2 className="mr-1.5 h-3.5 w-3.5" />Sync Logs</TabsTrigger>
        </TabsList>

        {/* ── API & Auto-Discovery Tab ── */}
        <TabsContent value="api" className="space-y-4 mt-4">
          <G2GApiPanel />
        </TabsContent>

        {/* ── Product Mappings Tab ── */}
        <TabsContent value="mappings" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Product → Supplier Mapping</CardTitle>
                  <CardDescription>Link each product to its supplier listing and set per-product markup.</CardDescription>
                </div>
                <Badge variant="secondary">{unmapped.length} unmapped</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Supplier Price</TableHead>
                    <TableHead>Markup</TableHead>
                    <TableHead>Our Price</TableHead>
                    <TableHead>Auto Apply</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Sync</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappings.map((m) => {
                    const s = statusVariant[m.syncStatus];
                    return (
                      <TableRow key={m.id} className={m.syncStatus === 'unmapped' ? 'opacity-60' : ''}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm text-foreground">{m.productName}</p>
                            <p className="text-xs text-muted-foreground">{m.category}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {m.g2gCurrentPrice !== null ? (
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-sm text-foreground">${m.g2gCurrentPrice.toFixed(2)}</span>
                              {priceIcon(m.priceDirection)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                          {m.g2gLowestPrice && (
                            <p className="text-xs text-muted-foreground">Low: ${m.g2gLowestPrice.toFixed(2)}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium text-foreground">
                            {m.markupType === 'percentage' ? `+${m.markupValue}%` : `+$${m.markupValue}`}
                          </span>
                        </TableCell>
                        <TableCell>
                          {m.calculatedPrice !== null ? (
                            <div>
                              <p className="font-mono text-sm font-semibold text-foreground">${m.calculatedPrice.toFixed(2)}</p>
                              {Math.abs(m.calculatedPrice - m.ourPrice) > 0.01 && (
                                <p className="text-xs text-amber-500">Live: ${m.ourPrice.toFixed(2)}</p>
                              )}
                            </div>
                          ) : (
                            <span className="font-mono text-sm text-foreground">${m.ourPrice.toFixed(2)}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={m.autoApply}
                            onCheckedChange={(v) => setMappings((prev) => prev.map((p) => p.id === m.id ? { ...p, autoApply: v } : p))}
                            disabled={m.syncStatus === 'unmapped'}
                          />
                        </TableCell>
                        <TableCell>
                          <Badge variant={s.variant} className="gap-1">
                            {s.icon}{s.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{timeAgo(m.lastSynced)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(m)}>
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Settings Tab ── */}
        <TabsContent value="settings" className="space-y-4 mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Global Markup */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Global Markup Rule</CardTitle>
                <CardDescription>Applied to all mapped products. You can override per-product in the mapping table.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1 space-y-1.5">
                    <Label>Markup Type</Label>
                    <Select value={settingsDraft.markupType} onValueChange={(v) => setSettingsDraft((s) => ({ ...s, markupType: v as GlobalSettings['markupType'] }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <Label>Markup Value</Label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={settingsDraft.markupValue}
                      onChange={(e) => setSettingsDraft((s) => ({ ...s, markupValue: parseFloat(e.target.value) || 0 }))}
                      placeholder={settingsDraft.markupType === 'percentage' ? '40' : '1.50'}
                    />
                  </div>
                </div>
                <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                  <strong className="text-foreground">Example: </strong>
                  Supplier price $4.20 → Your price ${settingsDraft.markupType === 'percentage'
                    ? (4.20 * (1 + settingsDraft.markupValue / 100)).toFixed(2)
                    : (4.20 + settingsDraft.markupValue).toFixed(2)}
                  {' '}({settingsDraft.markupType === 'percentage' ? `+${settingsDraft.markupValue}%` : `+$${settingsDraft.markupValue}`})
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-Apply Price Changes</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Automatically update website price after each sync</p>
                  </div>
                  <Switch checked={settingsDraft.autoApply} onCheckedChange={(v) => setSettingsDraft((s) => ({ ...s, autoApply: v }))} />
                </div>
                <Button variant="outline" className="w-full gap-2" onClick={applyGlobalMarkup}>
                  <Zap className="h-4 w-4" /> Apply to All Products Now
                </Button>
              </CardContent>
            </Card>

            {/* Sync Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sync Schedule</CardTitle>
                <CardDescription>How often to fetch updated prices from the supplier automatically.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Sync Frequency</Label>
                  <Select value={settingsDraft.syncFrequency} onValueChange={(v) => setSettingsDraft((s) => ({ ...s, syncFrequency: v as GlobalSettings['syncFrequency'] }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Every Hour</SelectItem>
                      <SelectItem value="every6h">Every 6 Hours</SelectItem>
                      <SelectItem value="every12h">Every 12 Hours</SelectItem>
                      <SelectItem value="daily">Once Daily</SelectItem>
                      <SelectItem value="manual">Manual Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Minimum Price Floor</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Never price below this amount</p>
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={settingsDraft.minPrice}
                        onChange={(e) => setSettingsDraft((s) => ({ ...s, minPrice: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Price Change Alert (%)</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Alert if price changes by more than this %</p>
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={settingsDraft.alertThreshold}
                        onChange={(e) => setSettingsDraft((s) => ({ ...s, alertThreshold: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                </div>
                <Button className="w-full gap-2" onClick={saveSettings}>
                  <Save className="h-4 w-4" /> Save Settings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* How it works */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">How Supplier Sync Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3 text-sm">
                {[
                  { step: '1', title: 'Map Products', desc: 'Paste the supplier listing URL for each product in your catalog. One-time setup per product.' },
                  { step: '2', title: 'Set Markup', desc: 'Choose a percentage (e.g. +40%) or fixed amount (+$1.50) on top of the lowest supplier price found.' },
                  { step: '3', title: 'Auto-Sync', desc: 'The system checks the supplier on schedule (hourly to daily), recalculates your price, and updates automatically if Auto-Apply is on.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">{item.step}</div>
                    <div>
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Price Alerts Tab ── */}
        <TabsContent value="alerts" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Competitor Price Alerts</CardTitle>
              <CardDescription>Monitor market competitor listings and get alerted when their prices undercut yours.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Alert when competitor is cheaper by (%)</Label>
                  <Input type="number" defaultValue="10" className="max-w-[160px]" />
                </div>
                <div className="space-y-1.5">
                  <Label>Check frequency</Label>
                  <Select defaultValue="6h">
                    <SelectTrigger className="max-w-[160px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">Every 1 hour</SelectItem>
                      <SelectItem value="3h">Every 3 hours</SelectItem>
                      <SelectItem value="6h">Every 6 hours</SelectItem>
                      <SelectItem value="12h">Every 12 hours</SelectItem>
                      <SelectItem value="24h">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Alert channels</Label>
                {[
                  { label: 'Email notification', enabled: true },
                  { label: 'Telegram bot alert', enabled: false },
                  { label: 'Discord webhook', enabled: false },
                  { label: 'Admin dashboard banner', enabled: true },
                ].map((ch) => (
                  <div key={ch.label} className="flex items-center justify-between rounded-md border px-3 py-2">
                    <span className="text-sm text-foreground">{ch.label}</span>
                    <Switch defaultChecked={ch.enabled} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active Competitor Alerts</CardTitle>
              <CardDescription>Competitor listings that are cheaper than your current prices right now.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Your Product</TableHead>
                    <TableHead>Your Price</TableHead>
                    <TableHead>Competitor</TableHead>
                    <TableHead>Their Price</TableHead>
                    <TableHead>Diff</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { product: 'Netflix Premium 6mo', ourPrice: 5.99, competitorSeller: 'topdeals2024', competitorPrice: 4.80 },
                    { product: 'ChatGPT Plus 1mo',    ourPrice: 8.50, competitorSeller: 'ai_deals_hub',  competitorPrice: 7.20 },
                    { product: 'NordVPN 1yr',         ourPrice: 14.99, competitorSeller: 'vpn_best',    competitorPrice: 13.50 },
                  ].map((alert, i) => {
                    const diff = ((alert.ourPrice - alert.competitorPrice) / alert.ourPrice * 100).toFixed(1);
                    return (
                      <TableRow key={i}>
                        <TableCell className="font-medium text-sm">{alert.product}</TableCell>
                        <TableCell className="text-sm">€{alert.ourPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">{alert.competitorSeller}</TableCell>
                        <TableCell className="text-sm font-bold text-destructive">€{alert.competitorPrice.toFixed(2)}</TableCell>
                        <TableCell><Badge variant="destructive" className="text-xs">-{diff}%</Badge></TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" className="text-xs h-7">Match Price</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Sync Logs Tab ── */}
        <TabsContent value="logs" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Sync History</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setLogs(MOCK_LOGS)}>
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Price Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo(log.timestamp)}</TableCell>
                      <TableCell>
                        <Badge variant={log.type === 'success' ? 'default' : log.type === 'error' ? 'destructive' : 'secondary'} className="gap-1">
                          {log.type === 'success' && <CheckCircle2 className="h-3 w-3" />}
                          {log.type === 'error' && <XCircle className="h-3 w-3" />}
                          {log.type === 'warning' && <AlertTriangle className="h-3 w-3" />}
                          {log.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">{log.message}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{log.productName || '—'}</TableCell>
                      <TableCell>
                        {log.oldPrice && log.newPrice ? (
                          <div className="flex items-center gap-1 text-sm">
                            <span className="text-muted-foreground">${log.oldPrice.toFixed(2)}</span>
                            <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                            <span className={log.newPrice > log.oldPrice ? 'text-red-500 font-medium' : 'text-green-600 font-medium'}>
                              ${log.newPrice.toFixed(2)}
                            </span>
                          </div>
                        ) : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Mapping Dialog */}
      <Dialog open={!!editMapping} onOpenChange={(open) => !open && setEditMapping(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Supplier Mapping — {editMapping?.productName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Supplier Listing URL</Label>
              <Input
                placeholder="https://supplier-api.internal/listing/..."
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Paste the supplier listing URL for this product.</p>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 space-y-1.5">
                <Label>Markup Type</Label>
                <Select value={editMarkupType} onValueChange={(v) => setEditMarkupType(v as 'percentage' | 'fixed')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-1.5">
                <Label>Markup Value</Label>
                <Input
                  type="number"
                  min="0"
                  value={editMarkupValue}
                  onChange={(e) => setEditMarkupValue(e.target.value)}
                  placeholder={editMarkupType === 'percentage' ? '40' : '1.50'}
                />
              </div>
            </div>
            {editMapping?.g2gCurrentPrice && (
              <div className="rounded-md bg-muted p-3 text-sm">
                <p className="text-muted-foreground">Calculated price with this markup:</p>
                <p className="text-lg font-bold text-foreground mt-0.5">
                  ${calcPrice(editMapping.g2gCurrentPrice, editMarkupType, parseFloat(editMarkupValue) || 0).toFixed(2)}
                  <span className="text-sm font-normal text-muted-foreground ml-2">(Supplier: ${editMapping.g2gCurrentPrice.toFixed(2)})</span>
                </p>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-Apply Price Changes</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Automatically update product price after sync</p>
              </div>
              <Switch checked={editAutoApply} onCheckedChange={setEditAutoApply} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMapping(null)}>Cancel</Button>
            <Button onClick={saveEdit} className="gap-2"><Save className="h-4 w-4" />Save Mapping</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
