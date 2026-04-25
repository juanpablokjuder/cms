import { z } from 'zod';

/**
 * All fields are optional — supports partial PATCH semantics.
 * At least one field must be present (validated in the service layer).
 */
export const updateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters.')
    .max(150, 'Name cannot exceed 150 characters.')
    .optional(),

  email: z
    .string()
    .email('Must be a valid email address.')
    .toLowerCase()
    .trim()
    .optional(),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(72, 'Password cannot exceed 72 characters (bcrypt limit).')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d])/,
      'Password must include uppercase, lowercase, a number, and a special character.',
    )
    .optional(),

  role: z
    .enum(['admin', 'editor', 'viewer'], {
      errorMap: () => ({ message: "Role must be 'admin', 'editor', or 'viewer'." }),
    })
    .optional(),

  is_active: z.boolean().optional(),
});

export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
