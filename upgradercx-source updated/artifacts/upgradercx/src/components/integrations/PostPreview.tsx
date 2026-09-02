import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SyncChannel } from '@/types';

interface PostPreviewProps {
  channel: SyncChannel;
  productName: string;
  previewText: string;
  price: number;
  comparePrice?: number;
  imageUrl?: string;
}

export function PostPreview({ channel, productName, previewText, price, comparePrice, imageUrl }: PostPreviewProps) {
  const isTelegram = channel === 'telegram';

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Post Preview</CardTitle>
          <Badge variant="outline">{isTelegram ? 'Telegram' : 'Discord'}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`rounded-lg border p-4 text-sm ${isTelegram ? 'bg-[hsl(var(--muted)/0.5)]' : 'bg-[hsl(var(--muted)/0.3)]'}`}>
          {imageUrl && (
            <div className="mb-3 h-32 rounded-md bg-muted flex items-center justify-center text-muted-foreground text-xs">
              [Product Image]
            </div>
          )}
          <p className="font-semibold mb-1">{productName}</p>
          <pre className="whitespace-pre-wrap font-sans text-muted-foreground text-xs leading-relaxed">{previewText}</pre>
          <div className="mt-3 flex items-center gap-2">
            <span className="font-bold text-foreground">${price.toFixed(2)}</span>
            {comparePrice && <span className="text-muted-foreground line-through text-xs">${comparePrice.toFixed(2)}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
