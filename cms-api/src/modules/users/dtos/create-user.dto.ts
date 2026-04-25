import { z } from 'zod';

export const createUserSchema = z.object({
  name: z
    .string({ required_error: 'Name is required.' })
    .trim()
    .min(2, 'Name must be at least 2 characters.')
    .max(150, 'Name cannot exceed 150 characters.'),

  email: z
    .string({ required_error: 'Email is required.' })
    .email('Must be a valid email address.')
    .toLowerCase()
    .trim(),

  password: z
    .string({ required_error: 'Password is required.' })
    .min(8, 'Password must be at least 8 characters.')
    .max(72, 'Password cannot exceed 72 characters (bcrypt limit).')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d])/,
      'Password must include uppercase, lowercase, a number, and a special character.',
    ),

  role: z
    .enum(['admin', 'editor', 'viewer'], {
      errorMap: () => ({ message: "Role must be 'admin', 'editor', or 'viewer'." }),
    })
    .default('viewer'),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
