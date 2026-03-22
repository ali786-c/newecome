import { useState } from 'react';
import { PageScaffold } from '@/components/PageScaffold';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useApiQuery, useApiMutation } from '@/hooks/use-api-query';
import { supportApi } from '@/api/support.api';
import { useToast } from '@/hooks/use-toast';
import {
  Plus, LifeBuoy, MessageSquare, Clock, CheckCircle2, Loader2,
  Package, ShoppingCart, Tag, AlertCircle,
} from 'lucide-react';
import type { TicketStatus, TicketPriority, TicketCategory } from '@/types';

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

export default function Tickets() {
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<TicketCategory>('other');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [orderRef, setOrderRef] = useState('');
  const [productRef, setProductRef] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  const { data: ticketsRes, isLoading, refetch } = useApiQuery(['my-tickets'], () => supportApi.list());
  const tickets = ticketsRes?.data || [];
  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);

  const resetForm = () => {
    setSubject(''); setMessage(''); setCategory('other');
    setPriority('medium'); setOrderRef(''); setProductRef('');
  };

  const createMutation = useApiMutation(
    () => supportApi.create({
      subject,
      message,
      category,
      priority,
      order_id: orderRef ? parseInt(orderRef) : undefined,
      product_id: productRef ? parseInt(productRef) : undefined,
    }),
    {
      onSuccess: () => {
        toast({ title: 'Ticket created', description: 'Our team will respond shortly.' });
        setCreateOpen(false);
        resetForm();
        refetch();
      },
    },
  );

  const replyMutation = useApiMutation(
    () => supportApi.reply(selectedTicketId!, replyText),
    { onSuccess: () => { toast({ title: 'Reply sent' }); setReplyText(''); refetch(); } },
  );

  const closeMutation = useApiMutation(
    (id: number) => supportApi.close(id),
    { onSuccess: () => { toast({ title: 'Ticket closed' }); refetch(); } },
  );

  const canReply = selectedTicket && ['open', 'pending', 'answered', 'waiting_customer'].includes(selectedTicket.status);

  return (
    <PageScaffold
      title="Support Tickets"
      description="Get help from our support team."
      actions={
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1" />New Ticket</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create Support Ticket</DialogTitle></DialogHeader>
            <div className="space-y-4">
              {/* Category */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as TicketCategory)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.entries(categoryLabels) as [TicketCategory, string][]).map(([val, label]) => (
                      <SelectItem key={val} value={val}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief description of your issue" maxLength={200} />
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low — General question</SelectItem>
                    <SelectItem value="medium">Medium — Need help soon</SelectItem>
                    <SelectItem value="high">High — Urgent issue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* References */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs flex items-center gap-1">
                    <ShoppingCart className="h-3 w-3" /> Order # (optional)
                  </Label>
                  <Input value={orderRef} onChange={(e) => setOrderRef(e.target.value)} placeholder="e.g. 2" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs flex items-center gap-1">
                    <Package className="h-3 w-3" /> Product ID (optional)
                  </Label>
                  <Input value={productRef} onChange={(e) => setProductRef(e.target.value)} placeholder="e.g. 5" />
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your issue in detail..." rows={5} maxLength={5000} />
                <p className="text-xs text-muted-foreground text-right">{message.length}/5000</p>
              </div>

              <Button
                className="w-full"
                disabled={!subject.trim() || !message.trim() || createMutation.isPending}
                onClick={() => createMutation.mutate(undefined)}
              >
                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Submit Ticket
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 rounded bg-muted animate-pulse" />)}</div>
        ) : tickets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12">
              <LifeBuoy className="h-12 w-12 text-muted-foreground/40" />
              <p className="text-muted-foreground mt-3">No support tickets yet</p>
              <p className="text-sm text-muted-foreground">Create a ticket if you need help</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
            {/* Ticket List */}
            <div className="space-y-2">
              {tickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  className={`cursor-pointer transition-colors ${selectedTicketId === ticket.id ? 'border-primary' : 'hover:border-primary/50'}`}
                  onClick={() => setSelectedTicketId(ticket.id)}
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate text-foreground">{ticket.subject}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">#{ticket.id}</span>
                          <Badge variant="outline" className="text-[9px] px-1.5">{categoryLabels[ticket.category as TicketCategory] || ticket.category}</Badge>
                          <span className="text-xs text-muted-foreground">{new Date(ticket.created_at).toLocaleDateString()}</span>
                        </div>
                        {/* References */}
                        {(ticket.order_number || ticket.product_name) && (
                          <div className="flex items-center gap-2 mt-1.5">
                            {ticket.order_number && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <ShoppingCart className="h-2.5 w-2.5" />{ticket.order_number}
                              </span>
                            )}
                            {ticket.product_name && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <Package className="h-2.5 w-2.5" />{ticket.product_name}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={priorityConfig[ticket.priority]?.variant || 'default'} className="text-[10px]">
                          {priorityConfig[ticket.priority]?.label || ticket.priority}
                        </Badge>
                        <Badge variant={statusConfig[ticket.status]?.variant || 'outline'} className="text-[10px]">
                          {statusConfig[ticket.status]?.label || ticket.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Ticket Detail */}
            {selectedTicket ? (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{selectedTicket.subject}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        #{selectedTicket.id} · {categoryLabels[selectedTicket.category as TicketCategory] || selectedTicket.category} · {new Date(selectedTicket.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      <Badge variant={priorityConfig[selectedTicket.priority]?.variant || 'default'}>
                        {priorityConfig[selectedTicket.priority]?.label || selectedTicket.priority}
                      </Badge>
                      <Badge variant={statusConfig[selectedTicket.status]?.variant || 'outline'}>
                        {statusConfig[selectedTicket.status]?.label || selectedTicket.status}
                      </Badge>
                    </div>
                  </div>

                  {/* References */}
                  {(selectedTicket.order_number || selectedTicket.product_name) && (
                    <div className="flex items-center gap-3 mt-2">
                      {selectedTicket.order_number && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground rounded-md bg-muted px-2 py-1">
                          <ShoppingCart className="h-3 w-3" />
                          <span>Order: {selectedTicket.order_number}</span>
                        </div>
                      )}
                      {selectedTicket.product_name && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground rounded-md bg-muted px-2 py-1">
                          <Package className="h-3 w-3" />
                          <span>{selectedTicket.product_name}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Status workflow */}
                  <div className="flex items-center gap-1 mt-3">
                    {(['open', 'pending', 'answered', 'resolved', 'closed'] as TicketStatus[]).map((s, i) => {
                      const statusOrder = ['open', 'pending', 'answered', 'resolved', 'closed'];
                      const currentIdx = statusOrder.indexOf(selectedTicket.status);
                      const thisIdx = statusOrder.indexOf(s);
                      const isActive = thisIdx <= currentIdx;
                      return (
                        <div key={s} className="flex items-center gap-1">
                          {i > 0 && <div className={`h-0.5 w-4 ${isActive ? 'bg-primary' : 'bg-muted'}`} />}
                          <div className={`text-[9px] px-1.5 py-0.5 rounded-full border ${isActive ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-muted'}`}>
                            {statusConfig[s]?.label || s}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Messages */}
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {selectedTicket.messages
                      .filter((msg) => !msg.is_internal)
                      .map((msg) => (
                        <div
                          key={msg.id}
                          className={`rounded-md p-3 text-sm ${msg.is_staff ? 'bg-primary/5 border border-primary/20' : 'bg-muted'}`}
                        >
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span className="font-medium">
                              {msg.is_staff ? '🛡️ Support Team' : (msg.user_id === 0 ? '🛡️ System' : 'You')}
                            </span>
                            <span>{new Date(msg.created_at).toLocaleString()}</span>
                          </div>
                          <p className="text-foreground whitespace-pre-wrap">{msg.message}</p>
                        </div>
                      ))}
                  </div>

                  {/* Reply area */}
                  {canReply && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <Textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a reply..."
                          rows={3}
                          maxLength={5000}
                        />
                        <div className="flex items-center justify-between">
                          <Button
                            size="sm"
                            disabled={!replyText.trim() || replyMutation.isPending}
                            onClick={() => replyMutation.mutate(undefined)}
                          >
                            {replyMutation.isPending && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}
                            <MessageSquare className="h-3.5 w-3.5 mr-1" /> Reply
                          </Button>
                          <p className="text-xs text-muted-foreground">{replyText.length}/5000</p>
                        </div>
                      </div>
                    </>
                  )}

                  {selectedTicket.status === 'resolved' && (
                    <div className="flex items-center gap-2 rounded-md bg-muted p-3 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>This ticket has been resolved. Need more help? Open a new ticket.</span>
                    </div>
                  )}
                  {selectedTicket.status === 'closed' && (
                    <div className="flex items-center gap-2 rounded-md bg-muted p-3 text-sm text-muted-foreground">
                      <AlertCircle className="h-4 w-4" />
                      <span>This ticket is closed. Open a new ticket if you need further assistance.</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center py-12">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground mt-2">Select a ticket to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </PageScaffold>
  );
}
