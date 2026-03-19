import { Link } from 'react-router-dom';
import { useApiQuery } from '@/hooks/use-api-query';
import { blogApi } from '@/api/blog.api';
import { Skeleton } from '@/components/ui/skeleton';
import { PageScaffold } from '@/components/PageScaffold';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Blog() {
  const { data: postsRes, isLoading, error } = useApiQuery(['public-blog-posts'], () => blogApi.list({ status: 'published' }));
  const posts = postsRes?.data || [];

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-12">
        <PageScaffold title="Blog" description="News, guides, and updates from the UpgraderCX team.">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        </PageScaffold>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl py-12 text-center">
        <h2 className="text-xl font-semibold text-destructive">Failed to load blog posts</h2>
        <p className="text-muted-foreground mt-2">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-12">
      <PageScaffold title="Blog" description="News, guides, and updates from the UpgraderCX team.">
        <div className="space-y-6">
          {posts.map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`}>
              <Card className="transition-colors hover:border-primary/50">
                <CardHeader>
                  {post.published_at && (
                    <div className="text-xs text-muted-foreground">
                      {new Date(post.published_at).toLocaleDateString()}
                    </div>
                  )}
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {post.image_url && (
                    <div className="mb-4 overflow-hidden rounded-lg">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="aspect-video w-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                  )}
                  <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </PageScaffold>
    </div>
  );
}
