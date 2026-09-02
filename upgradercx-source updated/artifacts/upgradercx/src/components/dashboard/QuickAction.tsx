import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface QuickActionProps {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'secondary';
  className?: string;
}

export function QuickAction({ label, icon: Icon, onClick, variant = 'outline', className }: QuickActionProps) {
  return (
    <Button
      variant={variant}
      className={cn('h-auto flex-col gap-2 py-4 px-3', className)}
      onClick={onClick}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs font-medium">{label}</span>
    </Button>
  );
}
