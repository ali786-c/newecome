import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * Global listener for API rate-limit events (429).
 * Mount once near the app root (e.g. in App.tsx or a layout).
 */
export function useRateLimitToast() {
  const { toast } = useToast();

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ retryAfter: number }>).detail;
      toast({
        title: 'Too many requests',
        description: `You're sending requests too fast. Please wait ${detail.retryAfter} seconds before trying again.`,
        variant: 'destructive',
      });
    };

    window.addEventListener('api:rate-limited', handler);
    return () => window.removeEventListener('api:rate-limited', handler);
  }, [toast]);
}
