import { useEffect } from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const REVIEWS = [
  { date: 'Feb 18, 2026', text: 'i didnt got the product', rating: 1, verified: true },
  { date: 'Feb 14, 2026', text: 'Fast and Easy, +rep', rating: 5, verified: true },
  { date: 'Dec 31, 2025', text: 'amazing service as always!', rating: 5, verified: true },
  { date: 'Sep 7, 2025', text: 'Very flexible and good service', rating: 5, verified: true },
  { date: 'Jul 28, 2025', text: 'top top', rating: 5, verified: true },
  { date: 'Jul 23, 2025', text: 'Works really well + Instant delivery', rating: 5, verified: true },
];

const avgRating = REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length;

export default function Feedback() {
  useEffect(() => {
    document.title = 'Feedback — UpgraderCX';
  }, []);

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
          <span className="text-sm font-bold text-foreground">{avgRating.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">({REVIEWS.length} reviews)</span>
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-3">
        {REVIEWS.map((review, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className={`h-3.5 w-3.5 ${j < review.rating ? 'text-warning fill-warning' : 'text-muted-foreground/30'}`} />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{review.date}</span>
              </div>
              <p className="text-sm text-foreground">{review.text}</p>
              {review.verified && (
                <div className="mt-2 flex items-center gap-1 text-[11px] text-success font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verified Purchase
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
