import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name is too long'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
  password_confirmation: z.string().min(1, 'Please confirm your password'),
  agreeTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the Terms of Service' }),
  }),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation'],
});

export type RegisterValues = z.infer<typeof registerSchema>;
