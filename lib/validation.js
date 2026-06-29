import { z } from 'zod';

// FLAW #2 FIX: Centralized server-side validation for feedback input.
export const feedbackSchema = z.object({
  name: z
    .string({ required_error: 'name is required' })
    .trim()
    .min(1, 'name is required')
    .max(100, 'name must be at most 100 characters'),
  text: z
    .string({ required_error: 'text is required' })
    .trim()
    .min(1, 'text is required')
    .max(2000, 'text must be at most 2000 characters'),
});
