import { useEffect } from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useApiQuery } from '@/hooks/use-api-query';
import { reviewApi } from '@/api/review.api';
import { Skeleton } from '@/components/ui/skeleton';

export default function Feedback() {
  useEffect(() => {
    document.title = 'Feedback — UpgraderCX';
  }, []);

  const { data: reviewsData, isLoading } = useApiQuery(['all-reviews'], () =>
    reviewApi.list({ per_page: 100 })
  );

  const reviews = reviewsData?.data || [];
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="container py-6 sm:py-8 max-w-2xl">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Customer Feedback</h1>
        <div className="mt-2 flex items-center justify-center gap-2">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < Math.round(avgRating) ? 'text-warning fill-warning' : 'text-muted-foreground/30'}`} />
            ))}
          </div>
          <span className="text-sm font-bold text-foreground">{Number(avgRating || 0).toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
             <Skeleton key={i} className="h-24 w-full" />
          ))
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/30">
            <p className="text-sm text-muted-foreground">No feedback yet.</p>
          </div>
        ) : (
          reviews.map((review, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className={`h-3.5 w-3.5 ${j < review.rating ? 'text-warning fill-warning' : 'text-muted-foreground/30'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-foreground">{review.comment}</p>
                {review.is_verified && (
                  <div className="mt-2 flex items-center gap-1 text-[11px] text-success font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verified Purchase
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
