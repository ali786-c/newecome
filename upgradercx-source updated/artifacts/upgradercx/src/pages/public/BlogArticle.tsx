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
        description={post.meta_description || post.excerpt || ''}
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
        className="prose max-w-none text-foreground/90 blog-rich-content"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Tailwind Safelist for Backend-Generated Blog Content */}
      <div className="hidden">
        <div className="text-slate-800 leading-relaxed space-y-12 mb-16 relative mb-8 absolute -left-4 top-0 w-1 h-full bg-primary/20 rounded-full text-2xl font-semibold text-primary italic leading-snug pl-4 text-lg text-slate-600 first-letter:text-6xl first-letter:font-black first-letter:text-primary first-letter:mr-4 first-letter:float-left first-letter:mt-1 drop-cap mb-12 bg-slate-50 border border-slate-200 rounded-3xl p-8 my-12 shadow-sm right-0 w-32 h-32 bg-primary/5 -mr-16 -mt-16 text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 w-6 h-6 space-y-4 list-none p-0 items-start gap-3 group flex-shrink-0 w-8 h-8 bg-primary/10 mt-0.5 group-hover:bg-primary group-hover:text-white transition-colors text-slate-700 py-6 text-3xl tracking-tight border-b border-slate-100 pb-3 prose prose-slate max-w-none my-16 p-10 w-2 last:mb-0 hover:border-slate-100 hover:bg-slate-50/50 mb-3 group-hover:text-primary font-black pl-11 text-center my-20 shadow-2xl opacity-10 text-white/80 mb-10 max-w-2xl mx-auto inline-flex justify-center px-12 py-5 bg-white text-[#1f5141] rounded-full shadow-[0_10px_40px_rgba(255,255,255,0.2)] hover:scale-105 hover:bg-white/95 transition-all ml-2 group-hover:translate-x-1 transition-transform" />
      </div>

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
