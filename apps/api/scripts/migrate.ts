import { migrate } from 'drizzle-orm/node-postgres/migrator';

import { db, pool } from '../src/infrastructure/database.js';

async function main(): Promise<void> {
  try {
    await migrate(db, {
      migrationsFolder: './drizzle',
    });

    console.info('MoiLekha database migrations completed successfully.');
  } finally {
    await pool.end();
  }
}

void main().catch((error: unknown) => {
  console.error('MoiLekha database migration failed:', error);
  process.exitCode = 1;
});