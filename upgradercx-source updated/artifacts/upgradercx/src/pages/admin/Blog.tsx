import { useState } from 'react';
import { PageScaffold } from '@/components/PageScaffold';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useApiQuery, useApiMutation } from '@/hooks/use-api-query';
import { blogApi } from '@/api/blog.api';
import { automationApi } from '@/api/automation.api';
import { BlogEditor } from '@/components/blog/BlogEditor';
import { useToast } from '@/hooks/use-toast';
import {
  Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Send, CheckCircle2,
  FileText, Clock, AlertTriangle, XCircle, CalendarIcon, Layout, MessageSquare
} from 'lucide-react';
import type { BlogPost, BlogPostStatus, BlogPostCreateData, BlogComplianceStatus } from '@/types';

const statusTabs: { value: string; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'All', icon: <FileText className="h-3.5 w-3.5" /> },
  { value: 'draft', label: 'Drafts', icon: <Edit className="h-3.5 w-3.5" /> },
  { value: 'in_review', label: 'In Review', icon: <Eye className="h-3.5 w-3.5" /> },
  { value: 'scheduled', label: 'Scheduled', icon: <CalendarIcon className="h-3.5 w-3.5" /> },
  { value: 'published', label: 'Published', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
];

const statusBadge = (s: BlogPostStatus) => {
  const map: Record<BlogPostStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    published: 'default', draft: 'secondary', in_review: 'outline', scheduled: 'outline', archived: 'secondary',
  };
  return <Badge variant={map[s]}>{s.replace('_', ' ')}</Badge>;
};

const complianceBadge = (s: BlogComplianceStatus) => {
  const map: Record<BlogComplianceStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    approved: 'default', unchecked: 'secondary', flagged: 'destructive', rejected: 'destructive',
  };
  return <Badge variant={map[s]} className="text-[10px]">{s}</Badge>;
};

export default function AdminBlog() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | undefined>();

  const params: Record<string, unknown> = { search: search || undefined };
  if (statusFilter !== 'all') params.status = statusFilter;

  const { data: postsRes, isLoading, refetch } = useApiQuery(
    ['admin-blog', search, statusFilter], () => blogApi.list(params)
  );

  const createMutation = useApiMutation(
    (data: BlogPostCreateData) => blogApi.create(data),
    { onSuccess: () => { toast({ title: 'Post created' }); setEditorOpen(false); refetch(); } }
  );
  const updateMutation = useApiMutation(
    ({ id, data }: { id: number; data: BlogPostCreateData }) => blogApi.update(id, data),
    { onSuccess: () => { toast({ title: 'Post updated' }); setEditorOpen(false); refetch(); } }
  );
  const deleteMutation = useApiMutation(
    (id: number) => blogApi.delete(id),
    { onSuccess: () => { toast({ title: 'Post deleted' }); refetch(); } }
  );
  const reviewMutation = useApiMutation(
    (id: number) => blogApi.submitForReview(id),
    { onSuccess: () => { toast({ title: 'Submitted for review' }); refetch(); } }
  );
  const publishMutation = useApiMutation(
    (id: number) => blogApi.publish(id),
    { onSuccess: () => { toast({ title: 'Post published' }); setEditorOpen(false); refetch(); } }
  );
  const scheduleMutation = useApiMutation(
    ({ id, date }: { id: number; date: string }) => blogApi.schedule(id, date),
    { onSuccess: () => { toast({ title: 'Post scheduled' }); setEditorOpen(false); refetch(); } }
  );
  const approveMutation = useApiMutation(
    (id: number) => blogApi.approve(id),
    { onSuccess: () => { toast({ title: 'Post approved' }); refetch(); } }
  );
  const sendToTelegramMutation = useApiMutation(
    (id: number) => automationApi.sendPostToTelegram(id),
    { 
      onSuccess: () => toast({ title: 'Sent to Telegram!' }),
      onError: (err: any) => toast({ 
        title: 'Telegram Error', 
        description: err.response?.data?.message || err.message, 
        variant: 'destructive' 
      })
    }
  );

  const sendToPinterestMutation = useApiMutation(
    (id: number) => automationApi.sendPostToPinterest(id) ?? Promise.reject('Not implemented'),
    { 
      onSuccess: () => toast({ title: 'Shared on Pinterest!' }),
      onError: (err: any) => toast({ 
        title: 'Pinterest Error', 
        description: err.response?.data?.message || err.message, 
        variant: 'destructive' 
      })
    }
  );

  const sendToDiscordMutation = useApiMutation(
    (id: number) => automationApi.sendPostToDiscord(id),
    { 
      onSuccess: () => toast({ title: 'Sent to Discord!' }),
      onError: (err: any) => toast({ 
        title: 'Discord Error', 
        description: err.response?.data?.message || err.message, 
        variant: 'destructive' 
      })
    }
  );

  const openEditor = (post?: BlogPost) => {
    setEditingPost(post);
    setEditorOpen(true);
  };

  const handleSave = (data: BlogPostCreateData) => {
    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const posts = postsRes?.data || [];
  const counts = {
    all: posts.length,
    draft: posts.filter((p) => p.status === 'draft').length,
    in_review: posts.filter((p) => p.status === 'in_review').length,
    scheduled: posts.filter((p) => p.status === 'scheduled').length,
    published: posts.filter((p) => p.status === 'published').length,
  };

  return (
    <PageScaffold
      title="Blog Management"
      description="Create, review, and publish blog content."
      actions={<Button size="sm" onClick={() => openEditor()}><Plus className="h-3.5 w-3.5 mr-1" />New Post</Button>}
    >
      <div className="space-y-4">
        {/* Search + Tabs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search articles..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="flex-wrap h-auto gap-1">
            {statusTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5">
                {tab.icon}
                {tab.label}
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                  {counts[tab.value as keyof typeof counts] ?? 0}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Shared table for all tabs */}
          <TabsContent value={statusFilter} className="mt-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Compliance</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-[50px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
                    ) : posts.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No articles found</TableCell></TableRow>
                    ) : posts.map((post) => (
                      <TableRow key={post.id} className="cursor-pointer" onClick={() => openEditor(post)}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{post.title}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[300px]">{post.excerpt}</p>
                          </div>
                        </TableCell>
                        <TableCell>{statusBadge(post.status)}</TableCell>
                        <TableCell>{complianceBadge(post.compliance_status)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {post.tags?.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {post.published_at ? new Date(post.published_at).toLocaleDateString() :
                           post.scheduled_at ? `Sched: ${new Date(post.scheduled_at).toLocaleDateString()}` :
                           new Date(post.updated_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditor(post)}><Edit className="h-3.5 w-3.5 mr-2" />Edit</DropdownMenuItem>
                              {post.status === 'draft' && (
                                <DropdownMenuItem onClick={() => reviewMutation.mutate(post.id)}><Eye className="h-3.5 w-3.5 mr-2" />Submit for Review</DropdownMenuItem>
                              )}
                              {post.status === 'in_review' && (
                                <DropdownMenuItem onClick={() => approveMutation.mutate(post.id)}><CheckCircle2 className="h-3.5 w-3.5 mr-2" />Approve</DropdownMenuItem>
                              )}
                                {post.compliance_status === 'approved' && post.status !== 'published' && (
                                  <DropdownMenuItem onClick={() => publishMutation.mutate(post.id)}><Send className="h-3.5 w-3.5 mr-2" />Publish</DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => sendToTelegramMutation.mutate(post.id)} disabled={sendToTelegramMutation.isPending}>
                                  <Send className="h-3.5 w-3.5 mr-2 text-blue-600" />
                                  Send to Telegram
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => sendToPinterestMutation.mutate(post.id)} disabled={sendToPinterestMutation.isPending}>
                                  <Layout className="h-3.5 w-3.5 mr-2 text-red-600" />
                                  Send to Pinterest
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => sendToDiscordMutation.mutate(post.id)} disabled={sendToDiscordMutation.isPending}>
                                  <MessageSquare className="h-3.5 w-3.5 mr-2 text-indigo-600" />
                                  Send to Discord
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                    <Trash2 className="h-3.5 w-3.5 mr-2" />Delete
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete "{post.title}"?</AlertDialogTitle>
                                    <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteMutation.mutate(post.id)}>Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Editor Dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? 'Edit Article' : 'New Article'}</DialogTitle>
          </DialogHeader>
          <BlogEditor
            post={editingPost}
            onSave={handleSave}
            saving={createMutation.isPending || updateMutation.isPending}
            onSubmitReview={editingPost ? () => reviewMutation.mutate(editingPost.id) : undefined}
            onPublish={editingPost ? () => publishMutation.mutate(editingPost.id) : undefined}
            onSchedule={editingPost ? (date) => scheduleMutation.mutate({ id: editingPost.id, date }) : undefined}
          />
        </DialogContent>
      </Dialog>
    </PageScaffold>
  );
}
