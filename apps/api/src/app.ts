
import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { fromNodeHeaders } from 'better-auth/node';

import { env } from './config/env.js';
import { auth } from './infrastructure/auth.js';
import { checkDatabaseConnection } from './infrastructure/database.js';
import { checkRedisConnection } from './infrastructure/redis.js';
import { workspaceRoutes } from './routes/workspaces.js';
import { websiteRoutes } from './routes/websites.js';

type InfrastructureChecks = {
  database: () => Promise<void>;
  redis: () => Promise<void>;
};

const defaultChecks: InfrastructureChecks = {
  database: checkDatabaseConnection,
  redis: checkRedisConnection,
};

export function buildApp(checks: InfrastructureChecks = defaultChecks) {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
    },
  });

  app.register(fastifyCors, {
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    maxAge: 86400,
  });

  app.register(workspaceRoutes);
  app.register(websiteRoutes);

  app.route({
    method: ['GET', 'POST'],
    url: '/api/auth/*',
    async handler(request, reply) {
      try {
        const url = new URL(request.url, env.BETTER_AUTH_URL);
        const headers = fromNodeHeaders(request.headers);

        const authRequest = new Request(url, {
          method: request.method,
          headers,
          ...(request.body !== undefined
            ? { body: JSON.stringify(request.body) }
            : {}),
        });

        const response = await auth.handler(authRequest);

        reply.status(response.status);

        response.headers.forEach((value, key) => {
          if (key.toLowerCase() !== 'set-cookie') {
            reply.header(key, value);
          }
        });

        const cookies = response.headers.getSetCookie();

        if (cookies.length > 0) {
          reply.header('set-cookie', cookies);
        }

        return reply.send(response.body ? await response.text() : null);
      } catch (error) {
        request.log.error({ err: error }, 'Better Auth request failed');

        return reply.status(500).send({
          error: 'Internal authentication error',
          code: 'AUTH_FAILURE',
        });
      }
    },
  });

  app.get('/health', async () => ({
    status: 'ok',
    service: 'moilekha-api',
  }));

  app.get('/ready', async (_request, reply) => {
    const [databaseResult, redisResult] = await Promise.allSettled([
      checks.database(),
      checks.redis(),
    ]);

    const dependencies = {
      postgres: databaseResult.status === 'fulfilled' ? 'ok' : 'unavailable',
      redis: redisResult.status === 'fulfilled' ? 'ok' : 'unavailable',
    };

    const ready = Object.values(dependencies).every((status) => status === 'ok');

    if (!ready) {
      reply.code(503);
    }

    return {
      status: ready ? 'ready' : 'not_ready',
      dependencies,
    };
  });

  return app;
}
