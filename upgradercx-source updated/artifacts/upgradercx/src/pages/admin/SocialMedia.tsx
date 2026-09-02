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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Twitter, Instagram, Facebook, Linkedin, Youtube,
  Calendar, Clock, Zap, CheckCircle2, XCircle,
  Plus, Trash2, Send, BarChart2, RefreshCw, Eye,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const PLATFORMS = [
  { id: 'twitter', name: 'X (Twitter)', icon: Twitter, color: 'text-[#1DA1F2]', bg: 'bg-[#1DA1F2]/10', connected: true, handle: '@UpgraderCX', followers: '2.4K' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-[#E1306C]', bg: 'bg-[#E1306C]/10', connected: true, handle: '@upgradercx', followers: '1.8K' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-[#1877F2]', bg: 'bg-[#1877F2]/10', connected: false, handle: '', followers: '' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-[#0A66C2]', bg: 'bg-[#0A66C2]/10', connected: false, handle: '', followers: '' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-[#FF0000]', bg: 'bg-[#FF0000]/10', connected: false, handle: '', followers: '' },
];

const POST_TEMPLATES = [
  { id: 'deal', label: '🔥 Deal of the Day', text: '🔥 DEAL OF THE DAY: {product_name} for just €{price}/mo!\n\nSave {savings}% vs retail price.\n✅ Instant delivery\n✅ Official authorized plan\n✅ 24/7 support\n\n🛒 Order now: upgradercx.com/products/{slug}\n\n#digitalsubs #deals #{category}' },
  { id: 'promo', label: '📣 Promotional', text: '📣 Get {product_name} Premium at wholesale price!\n\n💰 Only €{price}/mo (retail: €{retail}/mo)\n🚀 Instant activation\n💬 Join 200+ happy customers\n\n👉 upgradercx.com\n\n#premium #subscriptions #savings' },
  { id: 'blog', label: '📖 Blog Share', text: '📖 New blog post: {title}\n\n{excerpt}\n\n🔗 Read more: upgradercx.com/blog/{slug}\n\n#{tag1} #{tag2} #digitaltips' },
  { id: 'custom', label: '✏️ Custom', text: '' },
];

const SCHEDULE = [
  { id: 1, platform: 'twitter', content: '🔥 ChatGPT Plus for just €9.99/mo — 50% off retail price!', scheduled: '2026-03-17 09:00', status: 'scheduled' },
  { id: 2, platform: 'instagram', content: 'Netflix Premium shared plan at €5.99/mo ✅ Instant delivery #streaming', scheduled: '2026-03-17 12:00', status: 'scheduled' },
  { id: 3, platform: 'twitter', content: 'New blog: "Top 5 Ways to Save on Premium Subscriptions in 2026"', scheduled: '2026-03-17 18:00', status: 'scheduled' },
  { id: 4, platform: 'twitter', content: 'Spotify Premium for €3.99/mo 🎵', scheduled: '2026-03-16 09:00', status: 'published' },
  { id: 5, platform: 'instagram', content: 'DataCamp subscription at €4.99/mo 📚', scheduled: '2026-03-16 12:00', status: 'published' },
];

const STATS = [
  { platform: 'twitter', posts: 84, reach: '12.4K', engagement: '3.2%', clicks: 286 },
  { platform: 'instagram', posts: 62, reach: '8.7K', engagement: '5.1%', clicks: 144 },
];

export default function SocialMedia() {
  const [autoEnabled, setAutoEnabled] = useState(true);
  const [postsPerDay, setPostsPerDay] = useState('3');
  const [selectedTemplate, setSelectedTemplate] = useState('deal');
  const [postContent, setPostContent] = useState(POST_TEMPLATES[0].text);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['twitter', 'instagram']);

  const togglePlatform = (id: string) =>
    setSelectedPlatforms((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);

  const getPlatform = (id: string) => PLATFORMS.find((p) => p.id === id);

  return (
    <PageScaffold
      title="Social Media"
      description="Auto-post deals, blog articles, and promotions across all platforms daily."
    >
      <Tabs defaultValue="scheduler">
        <TabsList className="w-full justify-start overflow-x-auto mb-6">
          <TabsTrigger value="scheduler">Auto-Scheduler</TabsTrigger>
          <TabsTrigger value="compose">Compose Post</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="stats">Analytics</TabsTrigger>
        </TabsList>

        {/* Auto-Scheduler */}
        <TabsContent value="scheduler" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Auto-Posting Engine</CardTitle>
                  <CardDescription>Automatically post deals and blog articles every day.</CardDescription>
                </div>
                <Switch checked={autoEnabled} onCheckedChange={setAutoEnabled} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs">Posts per day</Label>
                  <Select value={postsPerDay} onValueChange={setPostsPerDay}>
                    <SelectTrigger className="mt-1 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['1','2','3','4','5','6'].map((n) => <SelectItem key={n} value={n}>{n} posts</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Post type mix</Label>
                  <Select defaultValue="deals-blog">
                    <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deals-only">Deals only</SelectItem>
                      <SelectItem value="deals-blog">Deals + Blog (70/30)</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Posting timezone</Label>
                  <Select defaultValue="utc">
                    <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc">UTC+0</SelectItem>
                      <SelectItem value="europe">Europe/London (UTC+1)</SelectItem>
                      <SelectItem value="cet">CET (UTC+2)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs mb-2 block">Active platforms</Label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.filter((p) => p.connected).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => togglePlatform(p.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        selectedPlatforms.includes(p.id)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted text-muted-foreground border-border'
                      }`}
                    >
                      <p.icon className="h-3 w-3" /> {p.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => toast({ title: 'Settings saved', description: 'Auto-posting will run daily at the scheduled times.' })}>
                  Save Schedule
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5" /> Run Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming queue */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Posting Queue
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {SCHEDULE.map((post) => {
                  const plat = getPlatform(post.platform);
                  if (!plat) return null;
                  const Icon = plat.icon;
                  return (
                    <div key={post.id} className="flex items-start gap-3 p-3 hover:bg-muted/30">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${plat.bg} shrink-0`}>
                        <Icon className={`h-4 w-4 ${plat.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs line-clamp-2">{post.content}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{post.scheduled}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {post.status === 'published' ? (
                          <Badge className="text-xs bg-green-500/10 text-green-700 border-green-200">Published</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Scheduled</Badge>
                        )}
                        {post.status === 'scheduled' && (
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compose */}
        <TabsContent value="compose" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Compose Post</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs">Template</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {POST_TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setSelectedTemplate(t.id); if (t.text) setPostContent(t.text); }}
                      className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${selectedTemplate === t.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-border'}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs">Post Content</Label>
                <Textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  rows={6}
                  className="mt-1 text-xs font-mono"
                  placeholder="Write your post… use {product_name}, {price}, {slug} as placeholders."
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">{postContent.length}/280</p>
              </div>
              <div>
                <Label className="text-xs mb-2 block">Post to platforms</Label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => p.connected && togglePlatform(p.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        !p.connected ? 'opacity-40 cursor-not-allowed bg-muted border-border text-muted-foreground' :
                        selectedPlatforms.includes(p.id)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted text-muted-foreground border-border hover:border-primary/50'
                      }`}
                    >
                      <p.icon className="h-3 w-3" /> {p.name} {!p.connected && '(not connected)'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="gap-1.5" onClick={() => toast({ title: 'Post published!', description: 'Your post was sent to selected platforms.' })}>
                  <Send className="h-3.5 w-3.5" /> Post Now
                </Button>
                <Button variant="outline" className="gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Schedule
                </Button>
                <Button variant="ghost" className="gap-1.5">
                  <Eye className="h-3.5 w-3.5" /> Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accounts */}
        <TabsContent value="accounts" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {PLATFORMS.map((p) => {
              const Icon = p.icon;
              return (
                <Card key={p.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${p.bg}`}>
                          <Icon className={`h-5 w-5 ${p.color}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{p.name}</p>
                          {p.connected ? (
                            <p className="text-xs text-muted-foreground">{p.handle} · {p.followers} followers</p>
                          ) : (
                            <p className="text-xs text-muted-foreground">Not connected</p>
                          )}
                        </div>
                      </div>
                      {p.connected ? (
                        <Badge className="gap-1 bg-green-500/10 text-green-700 border-green-200">
                          <CheckCircle2 className="h-3 w-3" /> Connected
                        </Badge>
                      ) : (
                        <Button size="sm" variant="outline" className="h-7 text-xs">Connect</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Stats */}
        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {STATS.map((s) => {
              const plat = getPlatform(s.platform);
              if (!plat) return null;
              const Icon = plat.icon;
              return (
                <Card key={s.platform}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${plat.color}`} />
                      <CardTitle className="text-sm">{plat.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <div><p className="text-xs text-muted-foreground">Posts (30d)</p><p className="text-xl font-bold">{s.posts}</p></div>
                      <div><p className="text-xs text-muted-foreground">Reach</p><p className="text-xl font-bold">{s.reach}</p></div>
                      <div><p className="text-xs text-muted-foreground">Engagement</p><p className="text-xl font-bold">{s.engagement}</p></div>
                      <div><p className="text-xs text-muted-foreground">Link Clicks</p><p className="text-xl font-bold">{s.clicks}</p></div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </PageScaffold>
  );
}
