import { useState } from 'react';
import { PageScaffold } from '@/components/PageScaffold';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Search, Globe, Link2, TrendingUp, FileText, CheckCircle2,
  AlertTriangle, XCircle, RefreshCw, Plus, Trash2, Download,
  ExternalLink, BarChart2, Star, ArrowUp,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

/* ── Mock SEO data ── */
const SEO_SCORE = 78;

const SEO_CHECKS = [
  { label: 'Meta title (all pages)', status: 'ok', desc: 'All 47 pages have unique titles' },
  { label: 'Meta descriptions', status: 'ok', desc: 'All pages have 120–160 char descriptions' },
  { label: 'Open Graph / Social tags', status: 'ok', desc: 'OG image, title, description set' },
  { label: 'Structured data (JSON-LD)', status: 'warning', desc: 'Product schema missing on 3 pages' },
  { label: 'Sitemap.xml', status: 'ok', desc: 'Auto-generated at /sitemap.xml' },
  { label: 'Robots.txt', status: 'ok', desc: 'Allows all, disallows /admin' },
  { label: 'Core Web Vitals', status: 'ok', desc: 'LCP: 1.8s · FID: 42ms · CLS: 0.04' },
  { label: 'HTTPS / SSL', status: 'ok', desc: 'Valid certificate, HSTS enabled' },
  { label: 'Mobile responsive', status: 'ok', desc: 'Passes Google mobile-friendly test' },
  { label: 'Image alt text', status: 'warning', desc: '14 product images missing alt attributes' },
  { label: 'Internal links', status: 'ok', desc: 'Good link structure across pages' },
  { label: 'Page speed (mobile)', status: 'warning', desc: 'Score: 74/100 — compress images' },
];

const KEYWORDS = [
  { kw: 'buy chatgpt plus cheap', pos: 8, vol: 2400, diff: 42, trend: 'up' },
  { kw: 'netflix shared plan', pos: 12, vol: 5800, diff: 55, trend: 'up' },
  { kw: 'spotify premium discount', pos: 6, vol: 4100, diff: 38, trend: 'stable' },
  { kw: 'cheap subscription services', pos: 19, vol: 3200, diff: 61, trend: 'up' },
  { kw: 'upgradercx', pos: 1, vol: 210, diff: 5, trend: 'stable' },
  { kw: 'nordvpn cheap', pos: 14, vol: 1900, diff: 48, trend: 'up' },
  { kw: 'adobe cc discount', pos: 22, vol: 2700, diff: 57, trend: 'down' },
  { kw: 'duolingo plus cheap', pos: 9, vol: 1600, diff: 35, trend: 'up' },
];

const BACKLINKS = [
  { domain: 'reddit.com', url: 'https://reddit.com/r/frugal', anchor: 'UpgraderCX subscriptions', dr: 91, status: 'live' },
  { domain: 'producthunt.com', url: 'https://producthunt.com', anchor: 'UpgraderCX', dr: 88, status: 'live' },
  { domain: 'lifehacker.com', url: 'https://lifehacker.com', anchor: 'cheap subscriptions', dr: 84, status: 'live' },
  { domain: 'alternativeto.net', url: 'https://alternativeto.net', anchor: 'digital upgrades', dr: 76, status: 'live' },
  { domain: 'g2.com', url: 'https://g2.com', anchor: 'UpgraderCX review', dr: 89, status: 'pending' },
  { domain: 'techradar.com', url: 'https://techradar.com', anchor: 'subscription deals', dr: 87, status: 'pending' },
];

const CONTENT_IDEAS = [
  'Top 10 Ways to Save on Netflix in 2026',
  'ChatGPT Plus vs Claude Pro: Which AI is Worth It?',
  'Is Spotify Premium Worth It? (Alternatives Compared)',
  'Best Cheap VPN Services Ranked for 2026',
  'How to Get Adobe Creative Cloud at a Discount',
  'Xbox Game Pass vs PlayStation Plus: 2026 Comparison',
  'Best Productivity Apps Under €10/Month',
  'NordVPN Review: Is It Still the Best VPN?',
];

export default function SEO() {
  const [autoSitemap, setAutoSitemap] = useState(true);
  const [autoSchema, setAutoSchema] = useState(true);
  const [newKw, setNewKw] = useState('');
  const [metaTitle, setMetaTitle] = useState('UpgraderCX — Premium Subscriptions at Wholesale Prices');
  const [metaDesc, setMetaDesc] = useState('Buy authorized shared family plans for Netflix, Spotify, ChatGPT, Adobe CC and 40+ premium services. Save up to 80%. Instant delivery, 24/7 support.');

  const statusIcon = (s: string) =>
    s === 'ok' ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> :
    s === 'warning' ? <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> :
    <XCircle className="h-3.5 w-3.5 text-red-500" />;

  return (
    <PageScaffold
      title="SEO & Backlinks"
      description="Search rankings, technical SEO, backlink outreach, and content strategy."
    >
      <Tabs defaultValue="overview">
        <TabsList className="w-full justify-start overflow-x-auto mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="backlinks">Backlinks</TabsTrigger>
          <TabsTrigger value="content">Content AI</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid sm:grid-cols-4 gap-4">
            <Card className="col-span-1">
              <CardContent className="pt-4 flex flex-col items-center justify-center text-center">
                <div className="relative h-24 w-24">
                  <svg viewBox="0 0 36 36" className="h-24 w-24 -rotate-90">
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-muted" strokeWidth="3" />
                    <circle cx="18" cy="18" r="16" fill="none" stroke="#1F5141" strokeWidth="3"
                      strokeDasharray={`${(SEO_SCORE / 100) * 100.53} 100.53`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{SEO_SCORE}</span>
                  </div>
                </div>
                <p className="text-sm font-medium mt-2">SEO Score</p>
                <Badge className="mt-1 bg-amber-500/10 text-amber-700 border-amber-200">Good</Badge>
              </CardContent>
            </Card>
            <div className="col-span-3 grid grid-cols-3 gap-4">
              {[
                { label: 'Indexed Pages', value: '47', icon: FileText, change: '+3 this week' },
                { label: 'Ranking Keywords', value: '128', icon: Search, change: '+12 this month' },
                { label: 'Total Backlinks', value: '284', icon: Link2, change: '+18 this month' },
              ].map((s) => (
                <Card key={s.label}>
                  <CardContent className="pt-4">
                    <s.icon className="h-4 w-4 text-muted-foreground mb-2" />
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                    <p className="text-xs text-green-600 mt-1">{s.change}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-sm">Technical SEO Checklist</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {SEO_CHECKS.map((c) => (
                <div key={c.label} className="flex items-center gap-3 p-2 rounded hover:bg-muted/30">
                  {statusIcon(c.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{c.label}</p>
                    <p className="text-xs text-muted-foreground">{c.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Keywords */}
        <TabsContent value="keywords" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Keyword Rankings</CardTitle>
                <div className="flex gap-2">
                  <Input
                    value={newKw}
                    onChange={(e) => setNewKw(e.target.value)}
                    placeholder="Add keyword to track…"
                    className="h-7 text-xs w-48"
                  />
                  <Button size="sm" className="h-7 text-xs gap-1.5" onClick={() => { toast({ title: 'Keyword added' }); setNewKw(''); }}>
                    <Plus className="h-3.5 w-3.5" /> Track
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="text-left p-3 font-medium">Keyword</th>
                      <th className="text-right p-3 font-medium">Position</th>
                      <th className="text-right p-3 font-medium">Volume</th>
                      <th className="text-right p-3 font-medium">Difficulty</th>
                      <th className="text-right p-3 font-medium">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {KEYWORDS.map((k) => (
                      <tr key={k.kw} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-3 text-xs font-mono">{k.kw}</td>
                        <td className="p-3 text-right">
                          <Badge variant={k.pos <= 10 ? 'default' : 'secondary'} className="text-xs">#{k.pos}</Badge>
                        </td>
                        <td className="p-3 text-right text-xs">{k.vol.toLocaleString()}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Progress value={k.diff} className="w-14 h-1.5" />
                            <span className="text-xs">{k.diff}</span>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <span className={`text-xs ${k.trend === 'up' ? 'text-green-600' : k.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'}`}>
                            {k.trend === 'up' ? '↑' : k.trend === 'down' ? '↓' : '→'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backlinks */}
        <TabsContent value="backlinks" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">284 total · 184 live · 100 pending</p>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5">
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="text-left p-3 font-medium">Domain</th>
                      <th className="text-left p-3 font-medium">Anchor Text</th>
                      <th className="text-right p-3 font-medium">DR</th>
                      <th className="text-right p-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BACKLINKS.map((b) => (
                      <tr key={b.domain} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-3">
                          <a href={b.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                            {b.domain} <ExternalLink className="h-3 w-3" />
                          </a>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">{b.anchor}</td>
                        <td className="p-3 text-right">
                          <Badge variant="secondary" className="text-xs">{b.dr}</Badge>
                        </td>
                        <td className="p-3 text-right">
                          {b.status === 'live' ? (
                            <Badge className="text-xs bg-green-500/10 text-green-700 border-green-200">Live</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">Pending</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Auto Backlink Builder</CardTitle>
              <CardDescription className="text-xs">System auto-submits to directories, forums, and review sites every week.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { target: 'Product Hunt listing', status: 'submitted', score: 88 },
                { target: 'AlternativeTo listing', status: 'live', score: 76 },
                { target: 'Trustpilot profile', status: 'live', score: 72 },
                { target: 'G2.com listing', status: 'pending', score: 89 },
                { target: 'Capterra listing', status: 'pending', score: 81 },
                { target: 'Reddit (r/frugal, r/deals)', status: 'live', score: 91 },
              ].map((item) => (
                <div key={item.target} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.status === 'live' ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> :
                     item.status === 'submitted' ? <RefreshCw className="h-3.5 w-3.5 text-amber-500" /> :
                     <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />}
                    <span className="text-xs">{item.target}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">DR {item.score}</span>
                    <Badge variant={item.status === 'live' ? 'default' : 'secondary'} className="text-xs capitalize">{item.status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content AI */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">AI Blog Generator</CardTitle>
              <CardDescription>Auto-generate SEO-optimised articles daily. Posts go live after admin review.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Auto-generate 1 article/day</p>
                  <p className="text-xs text-muted-foreground">Based on trending keywords and product launches</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Auto-publish after AI review</p>
                  <p className="text-xs text-muted-foreground">Articles are scored and auto-published if quality &gt; 80</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div>
                <Label className="text-xs mb-2 block">Suggested article ideas (based on keyword gaps)</Label>
                <div className="space-y-2">
                  {CONTENT_IDEAS.map((idea, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <p className="text-xs">{idea}</p>
                      <Button size="sm" variant="ghost" className="h-6 text-xs gap-1">
                        <Plus className="h-3 w-3" /> Generate
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Global SEO Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs">Default Meta Title</Label>
                <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="mt-1 text-xs" />
                <p className={`text-xs mt-1 ${metaTitle.length > 60 ? 'text-amber-500' : 'text-muted-foreground'}`}>{metaTitle.length}/60 chars</p>
              </div>
              <div>
                <Label className="text-xs">Default Meta Description</Label>
                <Textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} rows={3} className="mt-1 text-xs" />
                <p className={`text-xs mt-1 ${metaDesc.length > 160 ? 'text-amber-500' : 'text-muted-foreground'}`}>{metaDesc.length}/160 chars</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Auto-generate sitemap</p>
                    <p className="text-xs text-muted-foreground">Updates on every page/product change</p>
                  </div>
                  <Switch checked={autoSitemap} onCheckedChange={setAutoSitemap} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Auto-inject schema.org</p>
                    <p className="text-xs text-muted-foreground">Product + FAQ + BreadcrumbList markup</p>
                  </div>
                  <Switch checked={autoSchema} onCheckedChange={setAutoSchema} />
                </div>
              </div>
              <Button onClick={() => toast({ title: 'SEO settings saved' })}>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageScaffold>
  );
}
