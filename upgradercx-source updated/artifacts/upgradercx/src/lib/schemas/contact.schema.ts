import { z } from 'zod';

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name is too long'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  subject: z
    .string()
    .min(1, 'Please select a subject'),
  message: z
    .string()
    .min(20, 'Message must be at least 20 characters')
    .max(5000, 'Message is too long'),
  orderId: z.string().optional(),
});

export type ContactValues = z.infer<typeof contactSchema>;
