import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Star, Trash2, CheckCircle2, XCircle, Clock, Search,
  Loader2, Edit2, MessageSquare, User, Package
} from 'lucide-react';
import { reviewApi, type Review } from '@/api/review.api';

const statusCfg: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  pending:  { label: 'Pending',  variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
  approved: { label: 'Approved', variant: 'default',   icon: <CheckCircle2 className="h-3 w-3" /> },
  rejected: { label: 'Rejected', variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
};

export default function ReviewManagement() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editOpen, setEditOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [form, setForm] = useState({ author_name: '', rating: 5, comment: '', status: 'pending' as any });

  useEffect(() => {
    document.title = 'Review Moderation — Admin — UpgraderCX';
    fetchReviews();
  }, []);

  async function fetchReviews() {
    try {
      setLoading(true);
      const res = await reviewApi.adminList();
      setReviews(res.data || []);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to fetch reviews.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  const filtered = reviews.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    const s = search.toLowerCase();
    if (search && 
        !r.author_name.toLowerCase().includes(s) && 
        !r.comment.toLowerCase().includes(s) &&
        !(r.product?.name || '').toLowerCase().includes(s)
    ) return false;
    return true;
  });

  const pendingCount = reviews.filter((r) => r.status === 'pending').length;

  async function updateReview() {
    if (!editingReview) return;
    try {
      const res = await reviewApi.update(editingReview.id, {
        author_name: form.author_name,
        rating: form.rating,
        comment: form.comment,
        status: form.status,
      });
      setReviews((p) => p.map((r) => r.id === editingReview.id ? res.data : r));
      setEditOpen(false);
      toast({ title: 'Review updated', description: 'Changes saved successfully.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to update review.', variant: 'destructive' });
    }
  }

  async function quickAction(id: number, status: 'approved' | 'rejected') {
    try {
      const res = await reviewApi.update(id, { status });
      setReviews((p) => p.map((r) => r.id === id ? res.data : r));
      toast({ title: `Review ${status}`, description: `Review is now ${status}.` });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' });
    }
  }

  async function deleteReview(id: number) {
    if (!confirm('Are you sure you want to delete this review permanently?')) return;
    try {
      await reviewApi.delete(id);
      setReviews((p) => p.filter((r) => r.id !== id));
      toast({ title: 'Review deleted' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete review.', variant: 'destructive' });
    }
  }

  function openEdit(r: Review) {
    setEditingReview(r);
    setForm({
      author_name: r.author_name,
      rating: r.rating,
      comment: r.comment,
      status: r.status,
    });
    setEditOpen(true);
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Review Moderation</h1>
          <p className="text-sm text-muted-foreground">Approve, edit, or reject customer product reviews.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={fetchReviews}><RefreshCw className="mr-1.5 h-3.5 w-3.5" />Refresh</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Pending Approval', value: pendingCount, icon: <Clock className="h-5 w-5 text-warning" /> },
          { label: 'Total Approved', value: reviews.filter(r => r.status === 'approved').length, icon: <CheckCircle2 className="h-5 w-5 text-green-500" /> },
          { label: 'Overall Total', value: reviews.length, icon: <MessageSquare className="h-5 w-5 text-primary" /> },
        ].map((s) => (
          <Card key={s.label}><CardContent className="pt-6"><div className="flex items-center gap-3">{s.icon}<div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div></div></CardContent></Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by author, comment or product..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending Only</SelectItem>
            <SelectItem value="approved">Approved Only</SelectItem>
            <SelectItem value="rejected">Rejected Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Author</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center h-24 text-muted-foreground">No reviews found.</TableCell></TableRow>
              ) : filtered.map((r) => {
                const s = statusCfg[r.status] || statusCfg.pending;
                return (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-semibold">{r.author_name}</p>
                          {r.is_verified && <Badge variant="outline" className="text-[9px] h-3.5 px-1 uppercase">Verified</Badge>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Package className="h-3 w-3" />
                        <span className="truncate max-w-[150px]">{r.product?.name || 'Unknown Product'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="flex items-center gap-0.5 mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                           <Star key={i} className={`h-3 w-3 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`} />
                        ))}
                      </div>
                      <p className="text-sm line-clamp-2">{r.comment}</p>
                    </TableCell>
                    <TableCell><Badge variant={s.variant} className="gap-1">{s.icon}{s.label}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {r.status === 'pending' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500" onClick={() => quickAction(r.id, 'approved')} title="Approve"><CheckCircle2 className="h-4 w-4" /></Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => openEdit(r)} title="Edit"><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteReview(r.id)} title="Delete"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Review</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>Author Name</Label><Input value={form.author_name} onChange={(e) => setForm(p => ({ ...p, author_name: e.target.value }))} /></div>
              <div className="space-y-1.5">
                <Label>Rating</Label>
                <Select value={String(form.rating)} onValueChange={(v) => setForm(p => ({ ...p, rating: parseInt(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[5, 4, 3, 2, 1].map(n => <SelectItem key={n} value={String(n)}>{n} Stars</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Moderation Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm(p => ({ ...p, status: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Review Comment</Label><Textarea rows={5} value={form.comment} onChange={(e) => setForm(p => ({ ...p, comment: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={updateReview}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RefreshCw(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
  );
}
