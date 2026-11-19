
import { afterAll, beforeAll } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.POSTGRES_DB = 'moilekha_test';

beforeAll(async () => {
  const { pool } = await import('../src/infrastructure/database.js');

  const result = await pool.query(
    'SELECT current_database() AS database',
  );

  const database = result.rows[0]?.database;

  if (database !== 'moilekha_test') {
    throw new Error(
      `Unsafe test database: expected moilekha_test, connected to ${String(database)}`,
    );
  }

  console.info('Test database verified: moilekha_test');
});

afterAll(async () => {
  const { closeDatabaseConnection } = await import(
    '../src/infrastructure/database.js'
  );
  const { closeRedisConnection } = await import(
    '../src/infrastructure/redis.js'
  );

  await Promise.all([
    closeDatabaseConnection(),
    closeRedisConnection(),
  ]);
});
