import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({
  path: fileURLToPath(new URL('../../../../.env', import.meta.url)),
});

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  HOST: z.string().default('127.0.0.1'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),

  POSTGRES_HOST: z.string().default('127.0.0.1'),
  POSTGRES_PORT: z.coerce.number().int().min(1).max(65535).default(5432),
  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),
  BETTER_AUTH_URL: z.string().url().default('http://127.0.0.1:4000'),
  FRONTEND_URL: z.string().url().default('http://127.0.0.1:3000'),
  POSTGRES_DB: z.string().default('moilekha'),
  POSTGRES_USER: z.string().default('moilekha'),
  POSTGRES_PASSWORD: z.string().min(1, 'POSTGRES_PASSWORD is required'),

  REDIS_URL: z.string().url().default('redis://127.0.0.1:6379'),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('Invalid environment configuration:', result.error.flatten().fieldErrors);
  throw new Error('Environment validation failed');
}

export const env = result.data;
if (env.NODE_ENV === 'test' && env.POSTGRES_DB !== 'moilekha_test') {
  throw new Error(
    'Tests must use the isolated moilekha_test database.',
  );
}
