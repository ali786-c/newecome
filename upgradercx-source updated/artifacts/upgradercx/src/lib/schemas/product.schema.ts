import { z } from 'zod';

export const productFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens'),
  short_description: z.string().max(500).optional().default(''),
  description: z.string().min(1, 'Description is required'),
  category_id: z.number({ coerce: true }).int().positive().optional().nullable(),
  tags: z.string().optional().default(''),
  price: z.number({ coerce: true }).min(0, 'Price must be >= 0'),
  compare_price: z.number({ coerce: true }).min(0).optional().nullable().default(0),
  discount_label: z.string().max(50).optional().default(''),
  status: z.enum(['active', 'draft', 'archived']).default('draft'),
  stock_status: z.enum(['in_stock', 'out_of_stock', 'limited']).default('in_stock'),
  image_url: z.string().url().optional().nullable().default(''),
  telegram_enabled: z.boolean().default(false),
  discord_enabled: z.boolean().default(false),
  random_post_eligible: z.boolean().default(false),
  compliance_status: z.enum(['approved', 'pending_review', 'flagged', 'rejected']).default('pending_review'),
  internal_notes: z.string().optional().default(''),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export function toProductPayload(values: ProductFormValues): Record<string, unknown> {
  return {
    ...values,
    tags: values.tags
      ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [],
    compare_price: values.compare_price || null,
    discount_label: values.discount_label || null,
    image_url: values.image_url || null,
    internal_notes: values.internal_notes || null,
    short_description: values.short_description || null,
  };
}
