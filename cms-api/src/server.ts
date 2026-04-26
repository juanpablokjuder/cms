/**
 * Application entry point.
 *
 * Responsibilities:
 *  1. Load environment variables (dotenv in dev / host env in prod)
 *  2. Build the Fastify app
 *  3. Bind to the configured port
 *  4. Handle graceful shutdown on SIGINT / SIGTERM
 */

import { buildApp } from './app.js';
import { env } from './config/env.js';
import { db } from './database/connection.js';

const app = await buildApp();

// ── Graceful shutdown ─────────────────────────────────────────────────────────

async function shutdown(signal: string): Promise<void> {
  app.log.info(`Received ${signal}. Shutting down gracefully…`);
  try {
    await app.close();
    await db.close();
    app.log.info('Server closed. Goodbye.');
    process.exit(0);
  } catch (err) {
    app.log.error(err, 'Error during shutdown.');
    process.exit(1);
  }
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

// ── Start ─────────────────────────────────────────────────────────────────────

try {
  await app.listen({ port: env.PORT, host: env.HOST });
  app.log.info(
    `🚀  CMS API listening on http://${env.HOST}:${env.PORT}${env.API_PREFIX}`,
  );
} catch (err) {
  app.log.error(err, 'Failed to start server');
  process.exit(1);
}
