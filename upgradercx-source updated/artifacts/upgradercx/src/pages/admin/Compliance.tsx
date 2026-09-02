import { useState } from 'react';
import { PageScaffold } from '@/components/PageScaffold';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Shield, FileCheck, AlertTriangle, Eye, CheckCircle, XCircle, Clock, Flag, MessageSquare } from 'lucide-react';

/* ── Mock data ── */
const stats = {
  pendingReview: 5,
  flagged: 3,
  approved: 42,
  rejected: 2,
};

interface ReviewItem {
  id: string;
  type: 'product' | 'blog';
  title: string;
  author: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  submittedAt: string;
  notes: string;
  reason?: string;
}

const mockItems: ReviewItem[] = [
  { id: '1', type: 'product', title: 'Netflix Premium 1 Month', author: 'Admin', status: 'pending', submittedAt: '2025-03-12', notes: '' },
  { id: '2', type: 'product', title: 'Spotify Family Plan', author: 'Admin', status: 'approved', submittedAt: '2025-03-10', notes: 'Verified supplier.' },
  { id: '3', type: 'blog', title: 'How to Upgrade Your Streaming', author: 'Content Team', status: 'pending', submittedAt: '2025-03-13', notes: '' },
  { id: '4', type: 'product', title: 'VPN Lifetime Deal', author: 'Admin', status: 'flagged', submittedAt: '2025-03-11', notes: '', reason: 'Misleading "lifetime" claim — needs legal review.' },
  { id: '5', type: 'blog', title: 'Best Deals March 2025', author: 'Content Team', status: 'flagged', submittedAt: '2025-03-09', notes: '', reason: 'Contains unverified pricing claims.' },
  { id: '6', type: 'product', title: 'Adobe Creative Cloud', author: 'Admin', status: 'pending', submittedAt: '2025-03-14', notes: '' },
  { id: '7', type: 'blog', title: 'Why Digital Subscriptions Save Money', author: 'Content Team', status: 'approved', submittedAt: '2025-03-08', notes: 'Reviewed and cleared.' },
  { id: '8', type: 'product', title: 'Cracked Software Bundle', author: 'Admin', status: 'rejected', submittedAt: '2025-03-07', notes: 'Violates AUP — pirated content.', reason: 'Copyright violation.' },
];

const statusBadge = (status: ReviewItem['status']) => {
  const map = {
    pending: { variant: 'secondary' as const, icon: Clock, label: 'Pending Review' },
    approved: { variant: 'default' as const, icon: CheckCircle, label: 'Approved' },
    rejected: { variant: 'destructive' as const, icon: XCircle, label: 'Rejected' },
    flagged: { variant: 'secondary' as const, icon: Flag, label: 'Flagged' },
  };
  const cfg = map[status];
  return (
    <Badge variant={cfg.variant} className={status === 'flagged' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' : ''}>
      <cfg.icon className="h-3 w-3 mr-1" /> {cfg.label}
    </Badge>
  );
};

export default function Compliance() {
  const [items] = useState(mockItems);
  const [selected, setSelected] = useState<ReviewItem | null>(null);
  const [moderationNote, setModerationNote] = useState('');

  const pending = items.filter((i) => i.status === 'pending');
  const flagged = items.filter((i) => i.status === 'flagged');
  const products = items.filter((i) => i.type === 'product');
  const blogs = items.filter((i) => i.type === 'blog');

  const ReviewTable = ({ data }: { data: ReviewItem[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Author</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No items in this view.</TableCell></TableRow>
        ) : data.map((item) => (
          <TableRow key={item.id}>
            <TableCell><Badge variant="outline" className="text-xs capitalize">{item.type}</Badge></TableCell>
            <TableCell className="font-medium text-foreground">{item.title}</TableCell>
            <TableCell className="text-muted-foreground">{item.author}</TableCell>
            <TableCell className="text-muted-foreground">{item.submittedAt}</TableCell>
            <TableCell>{statusBadge(item.status)}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm" onClick={() => { setSelected(item); setModerationNote(item.notes); }}>
                <Eye className="h-4 w-4 mr-1" /> Review
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <PageScaffold title="Compliance & Moderation" description="Review content, manage flagged items, and enforce platform policies.">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        {[
          { label: 'Pending Review', value: stats.pendingReview, icon: Clock, color: 'text-yellow-500' },
          { label: 'Flagged', value: stats.flagged, icon: Flag, color: 'text-orange-500' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-destructive' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6 flex items-center gap-4">
              <s.icon className={`h-8 w-8 ${s.color}`} />
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="queue">
        <TabsList className="mb-4">
          <TabsTrigger value="queue">Review Queue ({pending.length})</TabsTrigger>
          <TabsTrigger value="flagged">Flagged ({flagged.length})</TabsTrigger>
          <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
          <TabsTrigger value="blog">Blog ({blogs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="queue">
          <Card><CardContent className="pt-0"><ReviewTable data={pending} /></CardContent></Card>
        </TabsContent>
        <TabsContent value="flagged">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-yellow-500" /> Flagged Content</CardTitle></CardHeader>
            <CardContent className="pt-0"><ReviewTable data={flagged} /></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="products">
          <Card><CardContent className="pt-0"><ReviewTable data={products} /></CardContent></Card>
        </TabsContent>
        <TabsContent value="blog">
          <Card><CardContent className="pt-0"><ReviewTable data={blogs} /></CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" /> Review: {selected?.title}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Type:</span> <span className="capitalize text-foreground">{selected.type}</span></div>
                <div><span className="text-muted-foreground">Author:</span> <span className="text-foreground">{selected.author}</span></div>
                <div><span className="text-muted-foreground">Submitted:</span> <span className="text-foreground">{selected.submittedAt}</span></div>
                <div><span className="text-muted-foreground">Status:</span> {statusBadge(selected.status)}</div>
              </div>

              {selected.reason && (
                <Card className="border-yellow-500/20 bg-yellow-500/5">
                  <CardContent className="pt-4">
                    <p className="text-sm font-medium text-foreground flex items-center gap-1"><Flag className="h-4 w-4 text-yellow-500" /> Flag Reason</p>
                    <p className="text-sm text-muted-foreground mt-1">{selected.reason}</p>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <Label>Moderation Notes</Label>
                <Textarea value={moderationNote} onChange={(e) => setModerationNote(e.target.value)} placeholder="Add compliance review notes..." rows={3} />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="destructive" onClick={() => setSelected(null)}><XCircle className="h-4 w-4 mr-1" /> Reject</Button>
            <Button variant="default" onClick={() => setSelected(null)}><CheckCircle className="h-4 w-4 mr-1" /> Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageScaffold>
  );
}
