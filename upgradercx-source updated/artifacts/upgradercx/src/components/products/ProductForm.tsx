import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productFormSchema, type ProductFormValues } from '@/lib/schemas/product.schema';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Loader2, Sparkles } from 'lucide-react';

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const MOCK_CATEGORIES = [
  { id: 1, name: 'Software Licenses' },
  { id: 2, name: 'Account Upgrades' },
  { id: 3, name: 'Digital Tools' },
];

export function ProductForm({ product, onSubmit, onCancel, isSubmitting }: ProductFormProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product
      ? {
        name: product.name,
        slug: product.slug,
        short_description: product.short_description || '',
        description: product.description,
        category_id: product.category_id,
        tags: Array.isArray(product.tags) ? product.tags.join(', ') : (product.tags || ''),
        price: product.price,
        compare_price: product.compare_price || 0,
        discount_label: product.discount_label || '',
        status: product.status,
        stock_status: product.stock_status,
        image_url: product.image_url || '',
        telegram_enabled: product.telegram_enabled,
        discord_enabled: product.discord_enabled,
        random_post_eligible: product.random_post_eligible,
        compliance_status: product.compliance_status,
        internal_notes: product.internal_notes || '',
      }
      : {
        name: '',
        slug: '',
        short_description: '',
        description: '',
        category_id: 0,
        tags: '',
        price: 0,
        compare_price: 0,
        discount_label: '',
        status: 'draft',
        stock_status: 'in_stock',
        image_url: '',
        telegram_enabled: false,
        discord_enabled: false,
        random_post_eligible: false,
        compliance_status: 'pending_review',
        internal_notes: '',
      },
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch } = form;
  const [generating, setGenerating] = useState(false);

  const generateDescription = async () => {
    const name = watch('name');
    if (!name) return;
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1200));
    const generated = `${name} gives you premium digital access with instant credential delivery. Enjoy full-featured access at up to 80% off retail price through PPP-adjusted pricing. All credentials are verified, dedicated, and backed by our 30-day satisfaction guarantee. Perfect for students, professionals, and power users looking for affordable premium software seats.`;
    setValue('description', generated, { shouldValidate: true });
    setGenerating(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      {/* Basic Info */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground">Basic Information</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input id="name" {...register('name')} placeholder="e.g. Office 365 Business" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" {...register('slug')} placeholder="auto-generated if empty" />
            {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="short_description">Short Description</Label>
          <Input id="short_description" {...register('short_description')} placeholder="Brief tagline" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="description">Full Description *</Label>
            <Button type="button" size="sm" variant="ghost" className="h-6 gap-1 text-xs text-muted-foreground hover:text-primary" onClick={generateDescription} disabled={generating}>
              {generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              {generating ? 'Generating…' : 'AI Generate'}
            </Button>
          </div>
          <Textarea id="description" {...register('description')} rows={4} placeholder="Detailed product description..." />
          {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select
              value={String(watch('category_id') || '')}
              onValueChange={(v) => setValue('category_id', Number(v), { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && <p className="text-xs text-destructive">{errors.category_id.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input id="tags" {...register('tags')} placeholder="premium, popular, new" />
            <p className="text-[10px] text-muted-foreground">Comma-separated</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image_url">Image URL</Label>
          <Input id="image_url" {...register('image_url')} placeholder="https://..." />
          {errors.image_url && <p className="text-xs text-destructive">{errors.image_url.message}</p>}
        </div>
      </fieldset>

      <Separator />

      {/* Pricing */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground">Pricing & Stock</legend>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="price">Base Price ($) *</Label>
            <Input id="price" type="number" step="0.01" {...register('price')} />
            {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="compare_price">Compare Price ($)</Label>
            <Input id="compare_price" type="number" step="0.01" {...register('compare_price')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount_label">Discount Label</Label>
            <Input id="discount_label" {...register('discount_label')} placeholder="e.g. 20% OFF" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock_count">Seats in Stock</Label>
            <Input id="stock_count" type="number" step="1" min="0" placeholder="e.g. 25" defaultValue={0} />
            <p className="text-[10px] text-muted-foreground">Total available credential slots (for depletion tracking)</p>
          </div>
        </div>
      </fieldset>

      <Separator />

      {/* Status */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground">Status & Compliance</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Product Status</Label>
            <Select value={watch('status')} onValueChange={(v: any) => setValue('status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Stock Status</Label>
            <Select value={watch('stock_status')} onValueChange={(v: any) => setValue('stock_status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                <SelectItem value="limited">Limited</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Compliance</Label>
            <Select value={watch('compliance_status')} onValueChange={(v: any) => setValue('compliance_status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </fieldset>

      <Separator />

      {/* Channel Sync */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground">Channel Sync</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center justify-between rounded-md border p-3">
            <Label htmlFor="telegram" className="cursor-pointer">Telegram</Label>
            <Switch id="telegram" checked={watch('telegram_enabled')} onCheckedChange={(v) => setValue('telegram_enabled', v)} />
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <Label htmlFor="discord" className="cursor-pointer">Discord</Label>
            <Switch id="discord" checked={watch('discord_enabled')} onCheckedChange={(v) => setValue('discord_enabled', v)} />
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <Label htmlFor="random_post" className="cursor-pointer">Random Post</Label>
            <Switch id="random_post" checked={watch('random_post_eligible')} onCheckedChange={(v) => setValue('random_post_eligible', v)} />
          </div>
        </div>
      </fieldset>

      <Separator />

      {/* Notes */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground">Internal</legend>
        <div className="space-y-2">
          <Label htmlFor="internal_notes">Internal Notes</Label>
          <Textarea id="internal_notes" {...register('internal_notes')} rows={3} placeholder="Admin-only notes..." />
        </div>
      </fieldset>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}
