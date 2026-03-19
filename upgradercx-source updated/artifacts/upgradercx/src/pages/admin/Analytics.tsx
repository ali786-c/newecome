import { useState } from 'react';
import { PageScaffold } from '@/components/PageScaffold';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  TrendingUp, Users, Eye, MousePointerClick, Globe, Clock,
  Smartphone, Monitor, ArrowUp, ArrowDown, Download, RefreshCw,
} from 'lucide-react';

/* ── Mock analytics data ── */
const TRAFFIC = [
  { date: 'Mar 9',  sessions: 420, pageviews: 1180, conversions: 12, revenue: 284 },
  { date: 'Mar 10', sessions: 380, pageviews: 1050, conversions: 9,  revenue: 218 },
  { date: 'Mar 11', sessions: 510, pageviews: 1430, conversions: 15, revenue: 365 },
  { date: 'Mar 12', sessions: 470, pageviews: 1320, conversions: 11, revenue: 267 },
  { date: 'Mar 13', sessions: 630, pageviews: 1760, conversions: 19, revenue: 462 },
  { date: 'Mar 14', sessions: 720, pageviews: 2010, conversions: 23, revenue: 559 },
  { date: 'Mar 15', sessions: 680, pageviews: 1890, conversions: 21, revenue: 511 },
  { date: 'Mar 16', sessions: 840, pageviews: 2340, conversions: 27, revenue: 657 },
];

const TOP_PAGES = [
  { page: '/', title: 'Home', sessions: 2840, bounce: '38%', time: '2m 14s' },
  { page: '/products', title: 'Products', sessions: 1920, bounce: '42%', time: '3m 02s' },
  { page: '/products/chatgpt-plus', title: 'ChatGPT Plus', sessions: 890, bounce: '31%', time: '4m 17s' },
  { page: '/products/netflix', title: 'Netflix', sessions: 760, bounce: '35%', time: '3m 44s' },
  { page: '/products/spotify-premium', title: 'Spotify', sessions: 680, bounce: '33%', time: '3m 51s' },
  { page: '/checkout', title: 'Checkout', sessions: 420, bounce: '22%', time: '5m 12s' },
  { page: '/blog', title: 'Blog', sessions: 380, bounce: '55%', time: '1m 48s' },
];

const SOURCES = [
  { source: 'Organic Search', sessions: 2240, pct: 42 },
  { source: 'Direct', sessions: 1600, pct: 30 },
  { source: 'Telegram', sessions: 640, pct: 12 },
  { source: 'Discord', sessions: 320, pct: 6 },
  { source: 'Social Media', sessions: 270, pct: 5 },
  { source: 'Referral', sessions: 265, pct: 5 },
];

const COUNTRIES = [
  { country: '🇬🇧 United Kingdom', sessions: 1240, pct: 23 },
  { country: '🇺🇸 United States', sessions: 980, pct: 18 },
  { country: '🇩🇪 Germany', sessions: 760, pct: 14 },
  { country: '🇫🇷 France', sessions: 540, pct: 10 },
  { country: '🇳🇱 Netherlands', sessions: 380, pct: 7 },
  { country: '🇪🇸 Spain', sessions: 290, pct: 5 },
  { country: '🇮🇹 Italy', sessions: 270, pct: 5 },
  { country: '🌍 Other', sessions: 980, pct: 18 },
];

const DEVICES = [
  { name: 'Desktop', value: 54, color: '#1F5141' },
  { name: 'Mobile', value: 38, color: '#34a36e' },
  { name: 'Tablet', value: 8, color: '#86efac' },
];

const PRODUCT_VIEWS = [
  { name: 'ChatGPT Plus', views: 890, orders: 47, cvr: '5.3%' },
  { name: 'Netflix', views: 760, orders: 38, cvr: '5.0%' },
  { name: 'Spotify', views: 680, orders: 31, cvr: '4.6%' },
  { name: 'DataCamp', views: 540, orders: 29, cvr: '5.4%' },
  { name: 'NordVPN', views: 490, orders: 21, cvr: '4.3%' },
  { name: 'Notion Plus', views: 430, orders: 19, cvr: '4.4%' },
];

function StatCard({ icon: Icon, label, value, change, up }: { icon: any; label: string; value: string; change: string; up: boolean }) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{label}</p>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <p className="text-2xl font-bold mt-2">{value}</p>
        <div className={`flex items-center gap-1 mt-1 text-xs ${up ? 'text-green-600' : 'text-red-500'}`}>
          {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          {change} vs last week
        </div>
      </CardContent>
    </Card>
  );
}

export default function Analytics() {
  const [range, setRange] = useState('7d');

  return (
    <PageScaffold
      title="Web Analytics"
      description="Traffic, conversions, and product performance. Privacy-first — no cookie banner required."
    >
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Badge className="gap-1 bg-green-500/10 text-green-700 border-green-200">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse inline-block" /> Live
            </Badge>
            <span className="text-sm text-muted-foreground">Last updated 30 sec ago</span>
          </div>
          <div className="flex items-center gap-2">
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Today</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Users} label="Unique Visitors" value="4,640" change="+18%" up={true} />
          <StatCard icon={Eye} label="Page Views" value="12,980" change="+22%" up={true} />
          <StatCard icon={MousePointerClick} label="Conversions" value="137" change="+31%" up={true} />
          <StatCard icon={TrendingUp} label="Revenue" value="€3,323" change="+29%" up={true} />
        </div>

        <Tabs defaultValue="traffic">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="traffic">Traffic</TabsTrigger>
            <TabsTrigger value="pages">Top Pages</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="geo">Geo</TabsTrigger>
          </TabsList>

          {/* Traffic chart */}
          <TabsContent value="traffic" className="space-y-4 mt-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Sessions & Revenue</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={TRAFFIC}>
                    <defs>
                      <linearGradient id="gSessions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1F5141" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#1F5141" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34a36e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#34a36e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                    <Legend />
                    <Area type="monotone" dataKey="sessions" stroke="#1F5141" fill="url(#gSessions)" strokeWidth={2} />
                    <Area type="monotone" dataKey="revenue" stroke="#34a36e" fill="url(#gRevenue)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <div className="grid sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-sm">Device Breakdown</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <ResponsiveContainer width={120} height={120}>
                      <PieChart>
                        <Pie data={DEVICES} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value" strokeWidth={0}>
                          {DEVICES.map((d, i) => <Cell key={i} fill={d.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                      {DEVICES.map((d) => (
                        <div key={d.name} className="flex items-center gap-2 text-xs">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                          <span className="text-muted-foreground">{d.name}</span>
                          <span className="font-medium ml-auto">{d.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">Conversion Trend</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={TRAFFIC}>
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="conversions" stroke="#1F5141" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Top Pages */}
          <TabsContent value="pages" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-xs text-muted-foreground">
                        <th className="text-left p-3 font-medium">Page</th>
                        <th className="text-right p-3 font-medium">Sessions</th>
                        <th className="text-right p-3 font-medium">Bounce Rate</th>
                        <th className="text-right p-3 font-medium">Avg Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TOP_PAGES.map((p) => (
                        <tr key={p.page} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="p-3">
                            <p className="font-medium text-xs">{p.title}</p>
                            <p className="text-xs text-muted-foreground font-mono">{p.page}</p>
                          </td>
                          <td className="p-3 text-right text-xs">{p.sessions.toLocaleString()}</td>
                          <td className="p-3 text-right text-xs">{p.bounce}</td>
                          <td className="p-3 text-right text-xs">{p.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sources */}
          <TabsContent value="sources" className="mt-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Traffic Sources</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={SOURCES} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="source" type="category" tick={{ fontSize: 11 }} width={120} />
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                    <Bar dataKey="sessions" fill="#1F5141" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products */}
          <TabsContent value="products" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-xs text-muted-foreground">
                        <th className="text-left p-3 font-medium">Product</th>
                        <th className="text-right p-3 font-medium">Views</th>
                        <th className="text-right p-3 font-medium">Orders</th>
                        <th className="text-right p-3 font-medium">CVR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PRODUCT_VIEWS.map((p) => (
                        <tr key={p.name} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="p-3 text-xs font-medium">{p.name}</td>
                          <td className="p-3 text-right text-xs">{p.views}</td>
                          <td className="p-3 text-right text-xs">{p.orders}</td>
                          <td className="p-3 text-right">
                            <Badge variant="secondary" className="text-xs">{p.cvr}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Geo */}
          <TabsContent value="geo" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-xs text-muted-foreground">
                        <th className="text-left p-3 font-medium">Country</th>
                        <th className="text-right p-3 font-medium">Sessions</th>
                        <th className="p-3 font-medium">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {COUNTRIES.map((c) => (
                        <tr key={c.country} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="p-3 text-xs">{c.country}</td>
                          <td className="p-3 text-right text-xs">{c.sessions.toLocaleString()}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                                <div className="bg-primary h-full rounded-full" style={{ width: `${c.pct}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground w-8 text-right">{c.pct}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageScaffold>
  );
}
