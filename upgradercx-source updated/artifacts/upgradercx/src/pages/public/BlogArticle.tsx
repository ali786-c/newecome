import { useParams, Link } from 'react-router-dom';
import { PageScaffold } from '@/components/PageScaffold';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function BlogArticle() {
  const { slug } = useParams();

  return (
    <div className="container max-w-3xl py-12">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/blog"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog</Link>
      </Button>
      <PageScaffold title={slug?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Article'}>
        <div className="prose max-w-none text-muted-foreground">
          <p>This article content will be fetched from the Laravel API using the slug parameter.</p>
          <p>The blog system supports rich text, images, categories, and SEO metadata — all managed from the admin panel.</p>
        </div>
      </PageScaffold>
    </div>
  );
}
