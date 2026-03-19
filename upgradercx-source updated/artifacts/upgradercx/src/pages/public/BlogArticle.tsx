import { useParams, Link } from 'react-router-dom';
import { PageScaffold } from '@/components/PageScaffold';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

import { useApiQuery } from '@/hooks/use-api-query';
import { blogApi } from '@/api/blog.api';
import { Skeleton } from '@/components/ui/skeleton';
import { SeoHead } from '@/components/shared/SeoHead';

export default function BlogArticle() {
  const { slug } = useParams();
  const { data: res, isLoading, error } = useApiQuery(['blog-article', slug || ''], () => blogApi.getBySlug(slug || ''));
  const post = res?.data;

  if (isLoading) {
    return (
      <div className="container max-w-3xl py-12">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-64 w-full rounded-xl mb-6" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container max-w-3xl py-12 text-center">
        <h2 className="text-xl font-semibold text-destructive">Article not found</h2>
        <Button variant="outline" size="sm" asChild className="mt-4">
          <Link to="/blog"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-12">
      <SeoHead
        title={`${post.meta_title || post.title} — UpgraderCX`}
        description={post.meta_description || post.excerpt}
        image={post.image_url}
        type="article"
      />
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/blog"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog</Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl mb-4">{post.title}</h1>
        {post.published_at && (
          <p className="text-sm text-muted-foreground">
            Published on {new Date(post.published_at).toLocaleDateString()}
          </p>
        )}
      </div>

      {post.image_url && (
        <div className="mb-8 overflow-hidden rounded-xl border">
          <img src={post.image_url} alt={post.title} className="w-full h-auto" />
        </div>
      )}

      <div
        className="prose prose-invert max-w-none text-muted-foreground blog-rich-content"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {post.tags && post.tags.length > 0 && (
        <div className="mt-12 flex flex-wrap gap-2 pt-8 border-t">
          {post.tags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
