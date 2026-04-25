/**
 * Simple sequential migration runner.
 * Reads every *.sql file from migrations/ in alphabetical order
 * and executes each one against the configured MariaDB instance.
 *
 * Usage: npm run migrate
 */

import { readdir, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from './connection.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, 'migrations');

async function run(): Promise<void> {
  console.log('🔄  Running migrations…');

  const files = (await readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith('.sql'))
    .sort(); // alphabetical = chronological by naming convention

  for (const file of files) {
    const sql = await readFile(join(MIGRATIONS_DIR, file), 'utf-8');
    console.log(`  ▶  ${file}`);
    await db.query(sql);
    console.log(`  ✅  ${file} — done`);
  }

  await db.close();
  console.log('✅  All migrations completed.');
}

run().catch((err: unknown) => {
  console.error('❌  Migration failed:', err);
  process.exit(1);
});
