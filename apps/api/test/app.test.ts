import { afterEach, describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.js';

describe('API application', () => {
  let app: ReturnType<typeof buildApp> | undefined;

  afterEach(async () => {
    await app?.close();
    app = undefined;
  });

  it('returns a successful health response', async () => {
    app = buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: 'ok',
      service: 'moilekha-api',
    });
  });

  it('returns ready when PostgreSQL and Redis are available', async () => {
    app = buildApp({
      database: async () => {},
      redis: async () => {},
    });

    const response = await app.inject({
      method: 'GET',
      url: '/ready',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: 'ready',
      dependencies: {
        postgres: 'ok',
        redis: 'ok',
      },
    });
  });

  it('returns 503 when a dependency is unavailable', async () => {
    app = buildApp({
      database: async () => {
        throw new Error('Database unavailable');
      },
      redis: async () => {},
    });

    const response = await app.inject({
      method: 'GET',
      url: '/ready',
    });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      status: 'not_ready',
      dependencies: {
        postgres: 'unavailable',
        redis: 'ok',
      },
    });
  });
});
