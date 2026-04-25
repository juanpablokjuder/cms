import { z } from 'zod';

// ─── Validation schema ────────────────────────────────────────────────────────
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default('0.0.0.0'),

  // Database
  DB_HOST: z.string().min(1, 'DB_HOST is required'),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_NAME: z.string().min(1, 'DB_NAME is required'),
  DB_USER: z.string().min(1, 'DB_USER is required'),
  DB_PASSWORD: z.string(),
  DB_CONNECTION_LIMIT: z.coerce.number().int().positive().default(10),

  // JWT
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters for HS256 security'),
  JWT_EXPIRES_IN: z.string().default('15m'),

  // Security
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),

  // API
  API_PREFIX: z.string().default('/api/v1'),
});
console.log("ENV: ", process.env); // Debug: log raw environment variables
const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error(
    '❌  Invalid environment configuration:\n',
    JSON.stringify(result.error.flatten().fieldErrors, null, 2),
  );
  process.exit(1);
}

export const env = result.data;
export type Env = typeof env;
