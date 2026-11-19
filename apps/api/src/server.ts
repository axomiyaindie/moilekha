import { buildApp } from './app.js';
import { env } from './config/env.js';
import { checkDatabaseConnection, closeDatabaseConnection } from './infrastructure/database.js';
import {
  checkRedisConnection,
  closeRedisConnection,
  connectRedis,
} from './infrastructure/redis.js';

async function closeInfrastructure(): Promise<void> {
  const results = await Promise.allSettled([closeDatabaseConnection(), closeRedisConnection()]);

  const failures = results.filter(
    (result): result is PromiseRejectedResult => result.status === 'rejected',
  );

  if (failures.length > 0) {
    throw new AggregateError(
      failures.map((failure) => failure.reason),
      'One or more infrastructure connections failed to close',
    );
  }
}

async function start(): Promise<void> {
  const app = buildApp();

  try {
    await connectRedis();
    await checkDatabaseConnection();
    await checkRedisConnection();

    const address = await app.listen({
      host: env.HOST,
      port: env.PORT,
    });

    app.log.info({ address }, 'MoiLekha API started');
  } catch (error) {
    app.log.error(error, 'Failed to start API');

    await app.close().catch((closeError) => {
      app.log.error(closeError, 'Failed to close API after startup failure');
    });

    await closeInfrastructure().catch((closeError) => {
      app.log.error(closeError, 'Failed to close infrastructure after startup failure');
    });

    process.exitCode = 1;
    return;
  }

  let shuttingDown = false;

  const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    app.log.info({ signal }, 'Shutting down API');

    try {
      await app.close();
      await closeInfrastructure();
      app.log.info('API and infrastructure connections closed');
    } catch (error) {
      app.log.error(error, 'API shutdown failed');
      process.exitCode = 1;
    }
  };

  process.once('SIGINT', () => void shutdown('SIGINT'));
  process.once('SIGTERM', () => void shutdown('SIGTERM'));
}

void start();
