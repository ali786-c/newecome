import { useState, useEffect } from 'react';
import { useApiQuery, useApiMutation } from '@/hooks/use-api-query';
import { supportApi } from '@/api/support.api';
import { ticketWebhookApi } from '@/api/ticket-webhook.api';
import type { TicketWebhookConfig } from '@/api/ticket-webhook.api';
import { useToast } from '@/hooks/use-toast';
import type { TicketStatus, TicketPriority, TicketCategory } from '@/types';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  LifeBuoy, MessageSquare, Clock, CheckCircle2, Send,
  Bell, Loader2, Search, RefreshCw, XCircle, StickyNote,
  Package, ShoppingCart, UserCheck, AlertTriangle,
} from 'lucide-react';

/* ── Config maps ── */
const statusConfig: Record<TicketStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  open: { label: 'Open', variant: 'outline' },
  pending: { label: 'Pending', variant: 'secondary' },
  answered: { label: 'Answered', variant: 'default' },
  resolved: { label: 'Resolved', variant: 'default' },
  closed: { label: 'Closed', variant: 'secondary' },
};

const priorityConfig: Record<TicketPriority, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  low: { label: 'Low', variant: 'secondary' },
  medium: { label: 'Medium', variant: 'default' },
  high: { label: 'High', variant: 'destructive' },
  urgent: { label: 'Urgent', variant: 'destructive' },
};

const categoryLabels: Record<TicketCategory, string> = {
  order_issue: 'Order Issue',
  product_question: 'Product Question',
  billing: 'Billing & Refund',
  account: 'Account',
  technical: 'Technical',
  other: 'Other',
};

export default function AdminTickets() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [noteText, setNoteText] = useState('');
  const [replyMode, setReplyMode] = useState<'reply' | 'note'>('reply');

  useEffect(() => { document.title = 'Support Tickets — Admin — UpgraderCX'; }, []);

  /* ── Ticket queries ── */
  const { data: ticketsRes, isLoading, refetch } = useApiQuery(
    ['admin-tickets', statusFilter, priorityFilter, categoryFilter, searchQuery],
    () => supportApi.adminList({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      priority: priorityFilter !== 'all' ? priorityFilter : undefined,
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      search: searchQuery || undefined,
    }),
  );
  const tickets = ticketsRes?.data || [];
  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);

  /* ── Webhook config ── */
  const { data: webhookRes, refetch: refetchWebhook } = useApiQuery(
    ['ticket-webhook-config'],
    () => ticketWebhookApi.getConfig(),
  );
  const webhookConfig = webhookRes?.data;

  const { data: dispatchRes } = useApiQuery(
    ['ticket-dispatch-log'],
    () => ticketWebhookApi.getDispatchLog({ per_page: 20 }),
  );
  const dispatchLog = dispatchRes?.data || [];

  /* ── Mutations ── */
  const replyMutation = useApiMutation(
    () => supportApi.adminReply(selectedTicketId!, replyText),
    { onSuccess: () => { toast({ title: 'Reply sent to customer' }); setReplyText(''); refetch(); } },
  );
  const noteMutation = useApiMutation(
    () => supportApi.addNote(selectedTicketId!, noteText),
    { onSuccess: () => { toast({ title: 'Internal note added' }); setNoteText(''); refetch(); } },
  );
  const statusMutation = useApiMutation(
    ({ id, status }: { id: number; status: TicketStatus }) => supportApi.adminUpdateStatus(id, status),
    { onSuccess: () => { toast({ title: 'Ticket status updated' }); refetch(); } },
  );
  const closeMutation = useApiMutation(
    (id: number) => supportApi.adminUpdateStatus(id, 'closed'),
    { onSuccess: () => { toast({ title: 'Ticket closed' }); refetch(); } },
  );
  const webhookMutation = useApiMutation(
    (data: Partial<TicketWebhookConfig>) => ticketWebhookApi.updateConfig(data),
    { onSuccess: () => { toast({ title: 'Notification config updated' }); refetchWebhook(); } },
  );
  const testMutation = useApiMutation(
    (channel: 'telegram' | 'discord') => ticketWebhookApi.testNotification(channel),
    { onSuccess: (res) => toast({ title: res.data.success ? 'Test sent!' : 'Test failed', description: res.data.message }) },
  );

  /* ── Stats ── */
  const openCount = tickets.filter((t) => t.status === 'open').length;
  const pendingCount = tickets.filter((t) => t.status === 'pending').length;
  const answeredCount = tickets.filter((t) => t.status === 'answered').length;
  const highCount = tickets.filter((t) => (t.priority === 'high' || t.priority === 'urgent') && t.status !== 'closed').length;
  const canReply = selectedTicket && ['open', 'pending', 'answered', 'waiting_customer', 'resolved'].includes(selectedTicket.status);

  /* ── Time helpers ── */
  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Support Tickets</h1>
          <p className="text-sm text-muted-foreground">
            {openCount} open · {pendingCount} pending · {answeredCount} answered · {highCount} high/urgent
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-1 h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Card><CardContent className="pt-5 pb-4"><div className="flex items-center gap-3"><div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center"><AlertTriangle className="h-4 w-4 text-destructive" /></div><div><p className="text-xl font-bold">{highCount}</p><p className="text-[11px] text-muted-foreground">High / Urgent</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-5 pb-4"><div className="flex items-center gap-3"><div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center"><Clock className="h-4 w-4 text-primary" /></div><div><p className="text-xl font-bold">{openCount}</p><p className="text-[11px] text-muted-foreground">Open</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-5 pb-4"><div className="flex items-center gap-3"><div className="h-8 w-8 rounded-full bg-secondary/50 flex items-center justify-center"><MessageSquare className="h-4 w-4 text-foreground" /></div><div><p className="text-xl font-bold">{answeredCount}</p><p className="text-[11px] text-muted-foreground">Answered</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-5 pb-4"><div className="flex items-center gap-3"><div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center"><CheckCircle2 className="h-4 w-4 text-primary" /></div><div><p className="text-xl font-bold">{tickets.filter((t) => t.status === 'resolved').length}</p><p className="text-[11px] text-muted-foreground">Resolved</p></div></div></CardContent></Card>
      </div>

      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tickets"><LifeBuoy className="mr-1.5 h-3.5 w-3.5" /> All Tickets</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-1.5 h-3.5 w-3.5" /> Notification Settings</TabsTrigger>
          <TabsTrigger value="dispatch-log"><Clock className="mr-1.5 h-3.5 w-3.5" /> Dispatch Log</TabsTrigger>
        </TabsList>

        {/* ══════ TAB: Tickets ══════ */}
        <TabsContent value="tickets" className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search tickets..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="answered">Answered</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {(Object.entries(categoryLabels) as [TicketCategory, string][]).map(([val, label]) => (
                  <SelectItem key={val} value={val}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
            {/* Ticket list table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Cat.</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Age</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 6 }).map((__, j) => (
                            <TableCell key={j}><div className="h-4 w-full animate-pulse rounded bg-muted" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : tickets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">No tickets found</TableCell>
                      </TableRow>
                    ) : (
                      tickets.map((ticket) => (
                        <TableRow
                          key={ticket.id}
                          className={`cursor-pointer ${selectedTicketId === ticket.id ? 'bg-muted/50' : 'hover:bg-muted/30'}`}
                          onClick={() => { setSelectedTicketId(ticket.id); setReplyMode('reply'); }}
                        >
                          <TableCell className="font-mono text-xs">#{ticket.id}</TableCell>
                          <TableCell>
                            <div className="max-w-[160px]">
                              <p className="font-medium text-foreground text-xs truncate">{ticket.subject}</p>
                              <p className="text-[10px] text-muted-foreground">{ticket.user?.name || `User #${ticket.user_id}`}</p>
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="outline" className="text-[9px] px-1">{categoryLabels[ticket.category as TicketCategory]?.split(' ')[0] || '—'}</Badge></TableCell>
                          <TableCell><Badge variant={priorityConfig[ticket.priority]?.variant || 'default'} className="text-[10px]">{priorityConfig[ticket.priority]?.label || ticket.priority}</Badge></TableCell>
                          <TableCell><Badge variant={statusConfig[ticket.status]?.variant || 'outline'} className="text-[10px]">{statusConfig[ticket.status]?.label || ticket.status}</Badge></TableCell>
                          <TableCell className="text-[10px] text-muted-foreground">{timeAgo(ticket.created_at)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Ticket detail panel */}
            {selectedTicket ? (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{selectedTicket.subject}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        #{selectedTicket.id} · {selectedTicket.user?.name || `User #${selectedTicket.user_id}`} · {categoryLabels[selectedTicket.category as TicketCategory] || selectedTicket.category}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={priorityConfig[selectedTicket.priority]?.variant || 'default'}>{priorityConfig[selectedTicket.priority]?.label || selectedTicket.priority}</Badge>
                      <Badge variant={statusConfig[selectedTicket.status]?.variant || 'outline'}>{statusConfig[selectedTicket.status]?.label || selectedTicket.status}</Badge>
                    </div>
                  </div>

                  {/* References & assignment */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {selectedTicket.order_number && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground rounded-md bg-muted px-2 py-1">
                        <ShoppingCart className="h-3 w-3" /> {selectedTicket.order_number}
                      </div>
                    )}
                    {selectedTicket.product_name && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground rounded-md bg-muted px-2 py-1">
                        <Package className="h-3 w-3" /> {selectedTicket.product_name}
                      </div>
                    )}
                    {selectedTicket.assigned_user && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground rounded-md bg-primary/10 px-2 py-1">
                        <UserCheck className="h-3 w-3" /> {selectedTicket.assigned_user.name}
                      </div>
                    )}
                    {selectedTicket.first_response_at && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-2.5 w-2.5" /> First response: {timeAgo(selectedTicket.first_response_at)}
                      </div>
                    )}
                  </div>

                  {/* Status workflow stepper */}
                  <div className="flex items-center gap-1 mt-3">
                    {(['open', 'pending', 'answered', 'resolved', 'closed'] as TicketStatus[]).map((s, i) => {
                      const order = ['open', 'pending', 'answered', 'resolved', 'closed'];
                      const currentIdx = order.indexOf(selectedTicket.status);
                      const thisIdx = order.indexOf(s);
                      const isActive = thisIdx <= currentIdx;
                      return (
                        <div key={s} className="flex items-center gap-1">
                          {i > 0 && <div className={`h-0.5 w-3 ${isActive ? 'bg-primary' : 'bg-muted'}`} />}
                          <button
                            className={`text-[9px] px-1.5 py-0.5 rounded-full border transition-colors ${isActive
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-muted text-muted-foreground border-muted hover:border-primary/50'
                              }`}
                            onClick={() => statusMutation.mutate({ id: selectedTicket.id, status: s })}
                            disabled={statusMutation.isPending}
                          >
                            {statusConfig[s]?.label || s}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Messages thread */}
                  <div className="space-y-3 max-h-72 overflow-y-auto">
                    {selectedTicket.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`rounded-md p-3 text-sm ${msg.is_internal
                            ? 'bg-amber-500/10 border border-amber-500/20'
                            : msg.is_staff
                              ? 'bg-primary/5 border border-primary/20'
                              : 'bg-muted'
                          }`}
                      >
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span className="font-medium flex items-center gap-1">
                            {msg.is_internal && <StickyNote className="h-2.5 w-2.5 text-amber-500" />}
                            {msg.is_internal ? '📝 Internal Note' : msg.is_staff ? '🛡️ Staff' : msg.user?.name || `User #${msg.user_id}`}
                          </span>
                          <span>{new Date(msg.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-foreground whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    ))}
                  </div>

                  {/* Reply / Note actions */}
                  {canReply && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        {/* Mode toggle */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={replyMode === 'reply' ? 'default' : 'outline'}
                            onClick={() => setReplyMode('reply')}
                          >
                            <MessageSquare className="h-3 w-3 mr-1" /> Reply to Customer
                          </Button>
                          <Button
                            size="sm"
                            variant={replyMode === 'note' ? 'default' : 'outline'}
                            onClick={() => setReplyMode('note')}
                          >
                            <StickyNote className="h-3 w-3 mr-1" /> Internal Note
                          </Button>
                        </div>

                        {replyMode === 'reply' ? (
                          <div className="space-y-2">
                            <Textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Type your reply to the customer..."
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Button size="sm" disabled={!replyText.trim() || replyMutation.isPending} onClick={() => replyMutation.mutate(undefined)}>
                                {replyMutation.isPending && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}
                                <Send className="h-3.5 w-3.5 mr-1" /> Send Reply
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => closeMutation.mutate(selectedTicket.id)} disabled={closeMutation.isPending}>
                                <XCircle className="h-3.5 w-3.5 mr-1" /> Close
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-2">
                              <p className="text-xs text-amber-600 mb-2 flex items-center gap-1">
                                <StickyNote className="h-3 w-3" /> Internal notes are only visible to staff — customers cannot see them.
                              </p>
                              <Textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Add an internal note..."
                                rows={3}
                                className="border-amber-500/20"
                              />
                            </div>
                            <Button size="sm" disabled={!noteText.trim() || noteMutation.isPending} onClick={() => noteMutation.mutate(undefined)}>
                              {noteMutation.isPending && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}
                              <StickyNote className="h-3.5 w-3.5 mr-1" /> Save Note
                            </Button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <LifeBuoy className="h-12 w-12 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground mt-3">Select a ticket to view details and respond</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* ══════ TAB: Notification Settings ══════ */}
        <TabsContent value="notifications" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Telegram */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Send className="h-4 w-4" /> Telegram Notifications</CardTitle>
                <CardDescription>Send ticket alerts to a Telegram group/channel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enabled</Label>
                  <Switch checked={webhookConfig?.telegram_enabled ?? false} onCheckedChange={(v) => webhookMutation.mutate({ telegram_enabled: v })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Chat / Channel ID</Label>
                  <Input placeholder="-1001234567890" defaultValue={webhookConfig?.telegram_chat_id || ''} onBlur={(e) => webhookMutation.mutate({ telegram_chat_id: e.target.value })} />
                  <p className="text-xs text-muted-foreground">Uses the Telegram bot configured in Integrations</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => testMutation.mutate('telegram')} disabled={testMutation.isPending}>
                  <Send className="h-3.5 w-3.5 mr-1" /> Send Test
                </Button>
              </CardContent>
            </Card>

            {/* Discord */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Discord Notifications</CardTitle>
                <CardDescription>Send ticket alerts to a Discord channel via webhook</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enabled</Label>
                  <Switch checked={webhookConfig?.discord_enabled ?? false} onCheckedChange={(v) => webhookMutation.mutate({ discord_enabled: v })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Webhook URL</Label>
                  <Input
                    type="password"
                    placeholder="https://discord.com/api/webhooks/..."
                    defaultValue={webhookConfig?.discord_webhook_url_set ? '••••••••••••' : ''}
                    onBlur={(e) => {
                      if (e.target.value && !e.target.value.startsWith('•')) {
                        ticketWebhookApi.setDiscordWebhook(e.target.value).then(() => refetchWebhook());
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">Separate from the product-sync Discord webhook</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => testMutation.mutate('discord')} disabled={testMutation.isPending}>
                  <MessageSquare className="h-3.5 w-3.5 mr-1" /> Send Test
                </Button>
              </CardContent>
            </Card>

            {/* Event triggers */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4" /> Event Triggers</CardTitle>
                <CardDescription>Choose which ticket events trigger outbound notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {([
                    { key: 'notify_on_create', label: 'Ticket Created', desc: 'Customer submits a new ticket' },
                    { key: 'notify_on_reply', label: 'Customer Reply', desc: 'Customer replies to an existing ticket' },
                    { key: 'notify_on_staff_reply', label: 'Staff Reply Sent', desc: 'Staff replies visible in admin workflow' },
                    { key: 'notify_on_status_change', label: 'Status Changed', desc: 'Any status transition on a ticket' },
                    { key: 'notify_on_close', label: 'Ticket Closed', desc: 'Ticket marked as closed' },
                    { key: 'notify_high_priority_only', label: 'High Priority Only', desc: 'Only notify for high/urgent tickets' },
                    { key: 'include_message_preview', label: 'Include Preview', desc: 'Include first 200 chars of the message' },
                  ] as const).map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between rounded-md border p-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <Switch
                        checked={(webhookConfig as any)?.[key] ?? false}
                        onCheckedChange={(v) => webhookMutation.mutate({ [key]: v })}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ══════ TAB: Dispatch Log ══════ */}
        <TabsContent value="dispatch-log">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notification Dispatch Log</CardTitle>
              <CardDescription>History of outbound ticket notifications to Discord and Telegram</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dispatchLog.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">No dispatch logs yet</TableCell>
                    </TableRow>
                  ) : (
                    dispatchLog.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">{log.event.replace('ticket.', '')}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {log.channel === 'telegram' ? <Send className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
                            <span className="text-xs capitalize">{log.channel}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <span className="font-mono text-xs">#{log.ticket_id}</span>
                          <span className="ml-1.5 text-muted-foreground">{log.ticket_subject}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={log.status === 'sent' ? 'default' : 'destructive'} className="text-[10px]">
                            {log.status === 'sent' ? <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> : <XCircle className="h-2.5 w-2.5 mr-0.5" />}
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-destructive max-w-[200px] truncate">{log.error_message || '—'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
