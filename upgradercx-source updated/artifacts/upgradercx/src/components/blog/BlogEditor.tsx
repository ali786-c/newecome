import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Save, Eye, Send, Image, Search, Globe, Link2, FileText, MessageSquare, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BlogPost, BlogPostCreateData, BlogPostStatus, BlogComplianceStatus } from '@/types';

interface BlogEditorProps {
  post?: BlogPost;
  onSave: (data: BlogPostCreateData) => void;
  onSubmitReview?: () => void;
  onPublish?: () => void;
  onSchedule?: (date: string) => void;
  saving?: boolean;
}

export function BlogEditor({ post, onSave, onSubmitReview, onPublish, onSchedule, saving }: BlogEditorProps) {
  const isEdit = !!post;

  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [content, setContent] = useState(post?.content || '');
  const [status, setStatus] = useState<BlogPostStatus>(post?.status || 'draft');
  const [featuredImage, setFeaturedImage] = useState(post?.featured_image || '');
  const [tags, setTags] = useState(post?.tags?.join(', ') || '');
  const [metaTitle, setMetaTitle] = useState(post?.meta_title || '');
  const [metaDesc, setMetaDesc] = useState(post?.meta_description || '');
  const [canonicalUrl, setCanonicalUrl] = useState(post?.canonical_url || '');
  const [relatedProducts, setRelatedProducts] = useState(post?.related_product_ids?.join(', ') || '');
  const [relatedCategory, setRelatedCategory] = useState(post?.related_category_id?.toString() || '');
  const [internalNotes, setInternalNotes] = useState(post?.internal_notes || '');
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(post?.scheduled_at ? new Date(post.scheduled_at) : undefined);

  const autoSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!isEdit || slug === autoSlug(post?.title || '')) setSlug(autoSlug(v));
  };

  const handleSave = () => {
    const data: BlogPostCreateData = {
      title, slug, content, excerpt, status,
      featured_image: featuredImage || undefined,
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      meta_title: metaTitle || undefined,
      meta_description: metaDesc || undefined,
      canonical_url: canonicalUrl || undefined,
      related_product_ids: relatedProducts ? relatedProducts.split(',').map((id) => parseInt(id.trim())).filter((n) => !isNaN(n)) : [],
      related_category_id: relatedCategory ? parseInt(relatedCategory) : undefined,
      internal_notes: internalNotes || undefined,
      scheduled_at: scheduleDate?.toISOString(),
    };
    onSave(data);
  };

  const complianceBadge = (s?: BlogComplianceStatus) => {
    const map: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      approved: 'default', unchecked: 'secondary', flagged: 'destructive', rejected: 'destructive',
    };
    return <Badge variant={map[s || 'unchecked'] || 'secondary'}>{s || 'unchecked'}</Badge>;
  };

  const metaTitleLen = metaTitle.length;
  const metaDescLen = metaDesc.length;

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{isEdit ? 'Editing' : 'New Post'}</Badge>
          {post && complianceBadge(post.compliance_status)}
          {post?.status && <Badge variant="secondary">{post.status}</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />}
            Save Draft
          </Button>
          {onSubmitReview && post?.status === 'draft' && (
            <Button variant="outline" size="sm" onClick={onSubmitReview}><Eye className="h-3.5 w-3.5 mr-1" />Submit for Review</Button>
          )}
          {onPublish && (post?.compliance_status === 'approved' || !isEdit) && (
            <Button size="sm" onClick={onPublish}><Send className="h-3.5 w-3.5 mr-1" />Publish</Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="content" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="content"><FileText className="h-3.5 w-3.5 mr-1" />Content</TabsTrigger>
          <TabsTrigger value="seo"><Search className="h-3.5 w-3.5 mr-1" />SEO</TabsTrigger>
          <TabsTrigger value="media"><Image className="h-3.5 w-3.5 mr-1" />Media</TabsTrigger>
          <TabsTrigger value="linking"><Link2 className="h-3.5 w-3.5 mr-1" />Linking</TabsTrigger>
          <TabsTrigger value="schedule"><CalendarIcon className="h-3.5 w-3.5 mr-1" />Schedule</TabsTrigger>
          <TabsTrigger value="distribution"><MessageSquare className="h-3.5 w-3.5 mr-1" />Distribution</TabsTrigger>
          <TabsTrigger value="internal"><Globe className="h-3.5 w-3.5 mr-1" />Internal</TabsTrigger>
        </TabsList>

        {/* Content */}
        <TabsContent value="content" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[1fr_300px]">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Article title" />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="article-slug" />
              </div>
              <div className="space-y-2">
                <Label>Summary / Excerpt</Label>
                <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Brief summary for listing pages" rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Full Content (HTML)</Label>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="<p>Write your article content...</p>" rows={14} className="font-mono text-xs" />
              </div>
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Select value={status} onValueChange={(v) => setStatus(v as BlogPostStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tag1, tag2, tag3" />
                  <p className="text-xs text-muted-foreground mt-1">Comma-separated</p>
                </CardContent>
              </Card>
              {post && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Info</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground space-y-1">
                    <p>Created: {new Date(post.created_at).toLocaleDateString()}</p>
                    <p>Updated: {new Date(post.updated_at).toLocaleDateString()}</p>
                    {post.published_at && <p>Published: {new Date(post.published_at).toLocaleDateString()}</p>}
                    {post.reviewed_by && <p>Reviewed by: {post.reviewed_by}</p>}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Search Engine Optimization</CardTitle>
              <CardDescription>Control how this article appears in search results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Meta Title <span className={cn("text-xs", metaTitleLen > 60 ? "text-destructive" : "text-muted-foreground")}>({metaTitleLen}/60)</span></Label>
                <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder={title || 'Page title for search engines'} />
              </div>
              <div className="space-y-2">
                <Label>Meta Description <span className={cn("text-xs", metaDescLen > 160 ? "text-destructive" : "text-muted-foreground")}>({metaDescLen}/160)</span></Label>
                <Textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} placeholder="Description for search engine results" rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Canonical URL</Label>
                <Input value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} placeholder="https://upgradercx.com/blog/..." />
              </div>
              {/* SERP Preview */}
              <div className="rounded-lg border p-4 bg-muted/30 space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Search Preview</p>
                <p className="text-primary text-base truncate">{metaTitle || title || 'Page Title'}</p>
                <p className="text-xs text-emerald-700 truncate">{canonicalUrl || `https://upgradercx.com/blog/${slug || 'article-slug'}`}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{metaDesc || excerpt || 'Article description will appear here.'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media */}
        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Featured Image</CardTitle>
              <CardDescription>Main image for the article and social sharing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} placeholder="https://..." />
              </div>
              {featuredImage ? (
                <div className="rounded-lg border overflow-hidden h-48 bg-muted flex items-center justify-center">
                  <img src={featuredImage} alt="Featured" className="max-h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              ) : (
                <div className="rounded-lg border h-48 bg-muted flex items-center justify-center text-muted-foreground text-sm">
                  No featured image set
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Linking */}
        <TabsContent value="linking" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Related Products</CardTitle>
                <CardDescription>Link products mentioned in this article</CardDescription>
              </CardHeader>
              <CardContent>
                <Input value={relatedProducts} onChange={(e) => setRelatedProducts(e.target.value)} placeholder="1, 2, 5 (product IDs)" />
                <p className="text-xs text-muted-foreground mt-1">Comma-separated product IDs</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Related Category</CardTitle>
                <CardDescription>Associate with a product category</CardDescription>
              </CardHeader>
              <CardContent>
                <Input value={relatedCategory} onChange={(e) => setRelatedCategory(e.target.value)} placeholder="Category ID" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Schedule */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Publish Schedule</CardTitle>
              <CardDescription>Set a future date to auto-publish this article</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end gap-3">
                <div className="space-y-2">
                  <Label>Scheduled Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal", !scheduleDate && "text-muted-foreground")}>
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {scheduleDate ? format(scheduleDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={scheduleDate} onSelect={setScheduleDate} disabled={(d) => d < new Date()} initialFocus className={cn("p-3 pointer-events-auto")} />
                    </PopoverContent>
                  </Popover>
                </div>
                {scheduleDate && onSchedule && (
                  <Button size="sm" onClick={() => onSchedule(scheduleDate.toISOString())}>
                    <CalendarIcon className="h-3.5 w-3.5 mr-1" />Schedule
                  </Button>
                )}
              </div>
              {scheduleDate && (
                <p className="text-sm text-muted-foreground">
                  This article will be automatically published on <span className="font-medium text-foreground">{format(scheduleDate, 'PPPp')}</span>
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribution */}
        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Telegram Distribution</CardTitle>
                <CardDescription>How this article will appear when shared to Telegram</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border p-4 bg-muted/30 text-sm space-y-2">
                  <p className="font-semibold">{title || 'Article Title'}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{excerpt || 'Article excerpt...'}</p>
                  <p className="text-xs text-primary">🔗 Read More</p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Auto-posted when published (if blog distribution is enabled)</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Discord Distribution</CardTitle>
                <CardDescription>Embed preview for Discord</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border-l-4 border-l-primary p-4 bg-muted/30 text-sm space-y-2">
                  <p className="font-semibold text-primary">{title || 'Article Title'}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{excerpt || 'Article excerpt...'}</p>
                  {featuredImage && <div className="h-16 w-full rounded bg-muted" />}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Shared as rich embed to configured channels</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Internal */}
        <TabsContent value="internal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Internal Notes</CardTitle>
              <CardDescription>Notes visible only to admins — not published</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} placeholder="Review notes, compliance concerns, etc." rows={4} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
