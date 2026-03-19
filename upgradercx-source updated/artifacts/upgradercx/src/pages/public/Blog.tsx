import { Link } from 'react-router-dom';
import { PageScaffold } from '@/components/PageScaffold';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const posts = [
  { slug: 'getting-started', title: 'Getting Started with UpgraderCX', excerpt: 'Learn how to set up your account and make your first purchase.', date: '2025-03-10' },
  { slug: 'security-update', title: 'Our Security Commitment', excerpt: 'How we protect your data and transactions at every step.', date: '2025-03-05' },
  { slug: 'new-products', title: 'New Products Launch', excerpt: 'Exciting new digital services now available in our catalog.', date: '2025-02-28' },
];

export default function Blog() {
  return (
    <div className="container max-w-4xl py-12">
      <PageScaffold title="Blog" description="News, guides, and updates from the UpgraderCX team.">
        <div className="space-y-6">
          {posts.map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`}>
              <Card className="transition-colors hover:border-primary/50">
                <CardHeader>
                  <div className="text-xs text-muted-foreground">{post.date}</div>
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{post.excerpt}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </PageScaffold>
    </div>
  );
}
