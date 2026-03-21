import { useState, useEffect } from 'react';
import { PageScaffold } from '@/components/PageScaffold';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useApiQuery, useApiMutation } from '@/hooks/use-api-query';
import { automationApi } from '@/api/automation.api';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import {
    Brain, Sparkles, Key, Check, Plus, X, Loader2,
    Settings, Zap, Bot, History, MessageSquare, Send, RefreshCw
} from 'lucide-react';

export default function AdminAIBlog() {
    const { toast } = useToast();
    const [keywordSearch, setKeywordSearch] = useState('');
    const [generationStatus, setGenerationStatus] = useState({ active: false, message: 'Idle', percentage: 0 });

    useEffect(() => { document.title = 'AI Blog Automation — Admin — UpgraderCX'; }, []);

    /* ── AI Blog Queries ── */
    const { data: aiConfigRes, refetch: refetchAiConfig } = useApiQuery(['ai-blog-config'], () => automationApi.getAIBlogConfig());
    const aiConfig = aiConfigRes?.data;

    const { data: keywordsRes, isLoading: keywordsLoading, refetch: refetchKeywords } = useApiQuery(
        ['blog-keywords', keywordSearch],
        () => automationApi.getKeywords({ search: keywordSearch || undefined }),
    );
    const keywords = keywordsRes?.data || [];

    /* ── AI Blog Mutations ── */
    const updateAiConfigMutation = useApiMutation(
        (data: any) => automationApi.updateAIBlogConfig(data),
        { onSuccess: () => { toast({ title: 'AI Configuration updated' }); refetchAiConfig(); } },
    );
    const addKeywordMutation = useApiMutation(
        (kw: string) => automationApi.addKeyword(kw),
        { onSuccess: () => { toast({ title: 'Keyword added' }); refetchKeywords(); } },
    );
    const bulkKeywordMutation = useApiMutation(
        (kws: string[]) => automationApi.bulkAddKeywords(kws),
        { onSuccess: (res) => { toast({ title: res.message }); refetchKeywords(); } },
    );
    const deleteKeywordMutation = useApiMutation(
        (id: number) => automationApi.deleteKeyword(id),
        { onSuccess: () => { toast({ title: 'Keyword removed' }); refetchKeywords(); } },
    );
    const triggerAIBlogMutation = useApiMutation(
        () => automationApi.triggerAIBlog(),
        {
            onSuccess: (res) => {
                toast({ title: res.message });
                // Start polling immediately after trigger
                setGenerationStatus({ active: true, message: 'Starting...', percentage: 5 });
            }
        },
    );

    /* ── Telegram Queries ── */
    const { data: telegramRes, refetch: refetchTelegram } = useApiQuery(['telegram-config'], () => automationApi.getTelegramConfig());
    const telegramConfig = telegramRes?.data;

    /* ── Telegram Mutations ── */
    const updateTelegramMutation = useApiMutation(
        (data: any) => automationApi.updateTelegramConfig(data),
        { onSuccess: () => { toast({ title: 'Telegram configuration updated' }); refetchTelegram(); } },
    );

    const testTelegramMutation = useApiMutation(
        () => automationApi.testTelegram(),
        {
            onSuccess: (res) => toast({ title: res.message }),
            onError: (err: any) => toast({ 
                title: 'Test Failed', 
                description: err.response?.data?.message || err.message, 
                variant: 'destructive' 
            })
        },
    );

    /* ── Progress Polling ── */
    useEffect(() => {
        let interval: any;
        let pollCount = 0;

        // Poll when the trigger is fired
        if (triggerAIBlogMutation.isPending || triggerAIBlogMutation.isSuccess) {
            const poll = async () => {
                pollCount++;
                try {
                    const res = await automationApi.getAIBlogStatus();
                    if (res.data) {
                        setGenerationStatus(res.data);

                        // Stop if we got an inactive status after at least 10 attempts (30s)
                        // This handles the transition from pending -> active -> finished
                        if (pollCount > 10 && !res.data.active) {
                            clearInterval(interval);
                        }
                    }
                } catch (err) {
                    console.error('Failed to poll status:', err);
                }
            };

            interval = setInterval(poll, 3000);
            poll();
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [triggerAIBlogMutation.isPending, triggerAIBlogMutation.isSuccess]);

    return (
        <PageScaffold
            title="AI Blog Automation"
            description="Manage your self-thinking AI content engine (Nano Banana)."
            actions={
                <div className="flex items-center gap-2">
                    <Badge variant={aiConfig?.is_enabled ? 'default' : 'secondary'} className={aiConfig?.is_enabled ? 'bg-purple-500 hover:bg-purple-600' : ''}>
                        {aiConfig?.is_enabled ? 'Engine Active' : 'Engine Inactive'}
                    </Badge>
                </div>
            }
        >
            <div className="space-y-6">
                <Tabs defaultValue="automation" className="w-full">
                    <TabsList className="mb-4 bg-slate-100 p-1">
                        <TabsTrigger value="automation" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <Zap className="h-4 w-4 mr-2" />
                            Automation
                        </TabsTrigger>
                        <TabsTrigger value="telegram" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <Send className="h-4 w-4 mr-2" />
                            Telegram
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="automation" className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* AI Config */}
                            <Card className="border-purple-100 shadow-sm">
                                <CardHeader className="bg-purple-50/50 pb-4">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Settings className="h-4 w-4 text-purple-600" />
                                        AI Configuration
                                    </CardTitle>
                                    <CardDescription>Control how the AI generates and publishes content</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-semibold">Self-Thinking Engine</Label>
                                            <p className="text-xs text-muted-foreground">Master switch for AI blog generation</p>
                                        </div>
                                        <Switch
                                            checked={aiConfig?.is_enabled ?? false}
                                            onCheckedChange={(v) => updateAiConfigMutation.mutate({ is_enabled: v })}
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <Button
                                            className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-200"
                                            onClick={() => triggerAIBlogMutation.mutate()}
                                            disabled={triggerAIBlogMutation.isPending}
                                        >
                                            {triggerAIBlogMutation.isPending ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                                <Sparkles className="h-4 w-4 mr-2" />
                                            )}
                                            Generate AI Blog Post Now
                                        </Button>

                                        {generationStatus.active && (
                                            <div className="mt-4 space-y-3 p-4 rounded-xl bg-purple-50/50 border border-purple-200/50 animate-in fade-in slide-in-from-top-2 duration-500">
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span className="font-semibold text-purple-700 flex items-center gap-1.5">
                                                        <Sparkles className="h-3 w-3 animate-pulse" />
                                                        {generationStatus.message}
                                                    </span>
                                                    <span className="text-purple-600 font-bold">{generationStatus.percentage}%</span>
                                                </div>
                                                <Progress value={generationStatus.percentage} className="h-2 bg-purple-100" indicatorClassName="bg-gradient-to-r from-purple-500 to-indigo-500" />
                                                <p className="text-[10px] text-purple-400 text-center italic">
                                                    Please stay on this page to monitor real-time progress.
                                                </p>
                                            </div>
                                        )}

                                        <p className="text-[10px] text-muted-foreground mt-2 text-center italic">
                                            Manually start the 8-step "Nano Banana" process using a random keyword.
                                        </p>
                                    </div>

                                    <div className="grid gap-4 pt-2">
                                        <div className="space-y-2">
                                            <Label>Posting Mode</Label>
                                            <Select value={aiConfig?.mode ?? 'draft'} onValueChange={(v) => updateAiConfigMutation.mutate({ mode: v })}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="auto">Auto-Publish (Live)</SelectItem>
                                                    <SelectItem value="draft">Review Mode (Save as Draft)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Generation Frequency</Label>
                                            <Select value={String(aiConfig?.posts_per_day ?? 1)} onValueChange={(v) => updateAiConfigMutation.mutate({ posts_per_day: parseInt(v) })}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1">1 Post / Day</SelectItem>
                                                    <SelectItem value="2">2 Posts / Day</SelectItem>
                                                    <SelectItem value="3">3 Posts / Day</SelectItem>
                                                    <SelectItem value="4">4 Posts / Day</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Article Tone</Label>
                                            <Select value={aiConfig?.default_tone ?? 'professional'} onValueChange={(v) => updateAiConfigMutation.mutate({ default_tone: v })}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="professional">Professional & Insightful</SelectItem>
                                                    <SelectItem value="casual">Conversational & Friendly</SelectItem>
                                                    <SelectItem value="storytelling">Narrative & Engagement</SelectItem>
                                                    <SelectItem value="persuasive">SEO-First & Sales</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Keyword Manager */}
                            <Card className="border-slate-100 shadow-sm">
                                <CardHeader className="bg-slate-50/50 pb-4">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Key className="h-4 w-4 text-blue-600" />
                                        Keyword Portfolio
                                    </CardTitle>
                                    <CardDescription>Targets for the AI to analyze and write about</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-6">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="e.g. Best Netflix Subs 2026"
                                            id="new-keyword-input"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    addKeywordMutation.mutate((e.target as HTMLInputElement).value);
                                                    (e.target as HTMLInputElement).value = '';
                                                }
                                            }}
                                        />
                                        <Button
                                            className="bg-blue-600 hover:bg-blue-700"
                                            onClick={() => {
                                                const input = document.getElementById('new-keyword-input') as HTMLInputElement;
                                                if (input.value.trim()) {
                                                    addKeywordMutation.mutate(input.value);
                                                    input.value = '';
                                                }
                                            }}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between px-1">
                                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Keywords</span>
                                            <Badge variant="outline" className="text-[10px]">{keywords.length} total</Badge>
                                        </div>

                                        <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                                            {keywordsLoading ? (
                                                <div className="flex flex-col items-center justify-center py-10 opacity-50">
                                                    <Loader2 className="h-6 w-6 animate-spin mb-2" />
                                                    <p className="text-xs">Loading collection...</p>
                                                </div>
                                            ) : keywords.length === 0 ? (
                                                <div className="text-center py-10 border-2 border-dashed rounded-lg bg-slate-50/30">
                                                    <p className="text-xs text-muted-foreground">Your portfolio is empty.</p>
                                                </div>
                                            ) : (
                                                <div className="grid gap-2">
                                                    {keywords.map((kw: any) => (
                                                        <div key={kw.id} className="flex items-center justify-between p-3 rounded-lg border bg-white hover:border-blue-200 transition-colors group">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium">{kw.keyword}</span>
                                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                                                    <History className="h-2.5 w-2.5" />
                                                                    Used {kw.usage_count} times
                                                                </span>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={() => deleteKeywordMutation.mutate(kw.id)}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        variant="outline"
                                        className="w-full text-xs border-dashed"
                                        onClick={() => {
                                            const csv = prompt('Enter keywords separated by commas:');
                                            if (csv) {
                                                const list = csv.split(',').map(s => s.trim()).filter(Boolean);
                                                bulkKeywordMutation.mutate(list);
                                            }
                                        }}
                                    >
                                        <Plus className="h-3 w-3 mr-1" />
                                        Bulk Import Portfolio
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="telegram" className="space-y-6">
                        <TelegramTabContent 
                            config={telegramConfig} 
                            onSave={(data) => updateTelegramMutation.mutate(data)} 
                            isSaving={updateTelegramMutation.isPending}
                            onTest={() => testTelegramMutation.mutate()}
                            isTesting={testTelegramMutation.isPending}
                        />
                    </TabsContent>
                </Tabs>

                {/* Info Box */}
                <Card className="bg-slate-900 border-slate-800 text-slate-100">
                    <CardContent className="pt-6">
                        <div className="flex gap-4">
                            <div className="h-10 w-10 shrink-0 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                <Brain className="h-6 w-6 text-purple-400" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-semibold">How Nano Banana Works</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Every day, our AI engine picks a random unused keyword from your portfolio. It performs a deep search, constructs a multi-section technical review, generates custom AI visuals, and optimizes everything for SEO. You can monitor the progress in the <b>Automation History</b> or see the results live in your <b>Blog</b>.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageScaffold>
    );
}

function TelegramTabContent({ config, onSave, isSaving, onTest, isTesting }: any) {
    const [localConfig, setLocalConfig] = useState({
        enabled: false,
        token: '',
        channel_id: ''
    });

    useEffect(() => {
        if (config) {
            setLocalConfig({
                enabled: !!config.enabled,
                token: config.token || '',
                channel_id: config.channel_id || ''
            });
        }
    }, [config]);

    return (
        <Card className="border-blue-100 shadow-sm max-w-2xl">
            <CardHeader className="bg-blue-50/50 pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                    <Send className="h-4 w-4 text-blue-600" />
                    Telegram Notifications
                </CardTitle>
                <CardDescription>Automatically post new blogs to your Telegram channel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-sm font-semibold">Enable Telegram Auto-Post</Label>
                        <p className="text-xs text-muted-foreground">Share blog posts as soon as they are generated</p>
                    </div>
                    <Switch
                        checked={localConfig.enabled}
                        onCheckedChange={(v) => setLocalConfig({...localConfig, enabled: v})}
                    />
                </div>

                <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="telegram_token">Bot Token</Label>
                        <Input
                            id="telegram_token"
                            type="password"
                            placeholder="748392019:AAH-..."
                            value={localConfig.token}
                            onChange={(e) => setLocalConfig({...localConfig, token: e.target.value})}
                        />
                        <p className="text-[10px] text-muted-foreground font-medium text-blue-600 flex items-center gap-1">
                            <Zap className="h-2.5 w-2.5" />
                            Get this from @BotFather on Telegram
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="telegram_channel">Channel ID / Username</Label>
                        <Input
                            id="telegram_channel"
                            placeholder="@mychannel or -100123456789"
                            value={localConfig.channel_id}
                            onChange={(e) => setLocalConfig({...localConfig, channel_id: e.target.value})}
                        />
                        <p className="text-[10px] text-muted-foreground">Example: @your_channel_name</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t">
                    <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => onSave(localConfig)}
                        disabled={isSaving}
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                        Save Changes
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full border-blue-200 hover:bg-blue-50 text-blue-700"
                        onClick={onTest}
                        disabled={isTesting || !localConfig.token}
                    >
                        {isTesting ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4 mr-2" />
                        )}
                        Test Connection (Send Sample Message)
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

