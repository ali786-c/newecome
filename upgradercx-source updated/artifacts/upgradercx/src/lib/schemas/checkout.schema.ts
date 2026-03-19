import { z } from 'zod';

export const checkoutSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  paymentMethod: z.enum(['card', 'crypto', 'wallet'], {
    errorMap: () => ({ message: 'Please select a payment method' }),
  }),
});

export type CheckoutValues = z.infer<typeof checkoutSchema>;
