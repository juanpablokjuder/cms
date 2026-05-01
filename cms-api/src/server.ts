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
import { logError } from './shared/utils/error-logger.js';

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

process.on('SIGINT',  () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

// ── Errores no capturados a nivel de proceso ──────────────────────────────────
// Estos manejadores capturan errores que escapan al error handler de Fastify:
// - Promesas rechazadas sin .catch()
// - Excepciones síncronas fuera de cualquier handler

process.on('unhandledRejection', (reason, promise) => {
  app.log.error({ reason, promise }, 'Unhandled promise rejection');
  void logError(reason instanceof Error ? reason : new Error(String(reason)), {
    level: 'error',
    context: { source: 'unhandledRejection' },
  });
});

process.on('uncaughtException', (err) => {
  app.log.error(err, 'Uncaught exception — the process may be in an unstable state');
  void logError(err, {
    level: 'error',
    context: { source: 'uncaughtException' },
  });
  // Dar tiempo al logger para escribir en BD antes de terminar
  setTimeout(() => process.exit(1), 500);
});

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
