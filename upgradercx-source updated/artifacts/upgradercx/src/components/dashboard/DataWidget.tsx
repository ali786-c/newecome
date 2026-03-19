import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataWidgetProps {
  title: string;
  action?: React.ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  children?: React.ReactNode;
  className?: string;
}

export function DataWidget({ title, action, isLoading, isEmpty, emptyMessage, children, className }: DataWidgetProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold text-foreground">{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileX className="h-8 w-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">{emptyMessage || 'No data'}</p>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
