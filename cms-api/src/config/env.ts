import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

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

  // URL pública de la API (usada para construir URLs absolutas en las respuestas JSON)
  // Ejemplo: http://192.168.0.20:3000
  PUBLIC_API_URL: z
    .string()
    .url('PUBLIC_API_URL must be a valid URL (e.g. http://192.168.0.20:3000)')
    .default('http://localhost:3000'),

  // File uploads
  UPLOADS_DIR: z.string().default('uploads'),

  // Web API — token estático para autenticar el frontend público
  // Generar con: openssl rand -hex 32
  WEB_API_TOKEN: z
    .string()
    .min(32, 'WEB_API_TOKEN must be at least 32 characters'),
});
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
