
import { randomUUID } from 'node:crypto';

import { afterEach, describe, expect, it } from 'vitest';

import { env } from '../src/config/env.js';
import { pool } from '../src/infrastructure/database.js';
import { buildApp } from '../src/app.js';

describe('Authentication integration', () => {
  const email = `auth-test-${randomUUID()}@example.com`;
  const password = 'TestPassword!2026';
  const name = 'MoiLekha Test User';

  const app = buildApp();

  afterEach(async () => {
    await app.close();

    await pool.query(
      `DELETE FROM organizations
       WHERE created_by_user_id = (
         SELECT id FROM users WHERE email = $1
       )`,
      [email],
    );

    await pool.query('DELETE FROM users WHERE email = $1', [email]);
  });

  it('completes registration, workspace provisioning, sign-in, session, and sign-out', async () => {
    const origin = env.FRONTEND_URL;

    // An unauthenticated request must not return a session.
    const unauthenticatedSession = await app.inject({
      method: 'GET',
      url: '/api/auth/get-session',
    });

    expect(unauthenticatedSession.statusCode).toBe(200);
    expect(unauthenticatedSession.json()).toBeNull();

    // Reject registration with an invalid email address.
    const invalidRegistration = await app.inject({
      method: 'POST',
      url: '/api/auth/sign-up/email',
      headers: { origin },
      payload: {
        name,
        email: 'not-an-email',
        password,
      },
    });

    expect(invalidRegistration.statusCode).toBe(400);

    // Register a new user.
    const registration = await app.inject({
      method: 'POST',
      url: '/api/auth/sign-up/email',
      headers: { origin },
      payload: {
        name,
        email,
        password,
      },
    });

    expect(registration.statusCode).toBe(200);
    expect(registration.json()).toMatchObject({
      user: {
        email,
        name,
      },
    });

    const registeredUserId = registration.json().user.id;

    // Verify that registration provisioned exactly one personal workspace.
    const workspaceResult = await pool.query(
      `SELECT
         o.id,
         o.name,
         o.slug,
         o.created_by_user_id,
         m.role
       FROM organizations o
       INNER JOIN memberships m
         ON m.organization_id = o.id
       WHERE o.created_by_user_id = $1
         AND m.user_id = $1`,
      [registeredUserId],
    );

    expect(workspaceResult.rowCount).toBe(1);
    expect(workspaceResult.rows[0]).toMatchObject({
      name: `${name}'s Workspace`,
      slug: `personal-${registeredUserId}`,
      created_by_user_id: registeredUserId,
      role: 'owner',
    });

    // Reject duplicate registration.
    const duplicateRegistration = await app.inject({
      method: 'POST',
      url: '/api/auth/sign-up/email',
      headers: { origin },
      payload: {
        name,
        email,
        password,
      },
    });

    expect(duplicateRegistration.statusCode).not.toBe(200);

    // Reject an incorrect password.
    const incorrectPasswordSignIn = await app.inject({
      method: 'POST',
      url: '/api/auth/sign-in/email',
      headers: { origin },
      payload: {
        email,
        password: 'WrongPassword!2026',
      },
    });

    expect(incorrectPasswordSignIn.statusCode).toBe(401);

    // Sign in with the registered credentials.
    const signIn = await app.inject({
      method: 'POST',
      url: '/api/auth/sign-in/email',
      headers: { origin },
      payload: {
        email,
        password,
      },
    });

    expect(signIn.statusCode).toBe(200);
    expect(signIn.json()).toMatchObject({
      user: { email },
    });

    // Session creation must not provision another personal workspace.
    const workspaceCountAfterSignIn = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM organizations
       WHERE created_by_user_id = $1`,
      [registeredUserId],
    );

    expect(workspaceCountAfterSignIn.rows[0].count).toBe(1);

    // Extract the session cookie.
    const setCookie = signIn.headers['set-cookie'];

    const cookies = Array.isArray(setCookie)
      ? setCookie
      : setCookie
        ? [setCookie]
        : [];

    const sessionCookie = cookies
      .map((cookie) => cookie.split(';')[0])
      .join('; ');

    expect(sessionCookie).toContain('better-auth.session_token=');

    // Retrieve the authenticated session.
    const session = await app.inject({
      method: 'GET',
      url: '/api/auth/get-session',
      headers: {
        cookie: sessionCookie,
      },
    });

    expect(session.statusCode).toBe(200);
    expect(session.json()).toMatchObject({
      user: { email },
    });

    // Reject sign-out requests from an untrusted origin.
    const untrustedOriginSignOut = await app.inject({
      method: 'POST',
      url: '/api/auth/sign-out',
      headers: {
        origin: 'https://untrusted.example',
        cookie: sessionCookie,
      },
    });

    expect(untrustedOriginSignOut.statusCode).toBe(403);

    // The rejected request must not invalidate the session.
    const sessionAfterRejectedSignOut = await app.inject({
      method: 'GET',
      url: '/api/auth/get-session',
      headers: {
        cookie: sessionCookie,
      },
    });

    expect(sessionAfterRejectedSignOut.statusCode).toBe(200);
    expect(sessionAfterRejectedSignOut.json()).toMatchObject({
      user: { email },
    });

    // Sign out using the trusted origin.
    const signOut = await app.inject({
      method: 'POST',
      url: '/api/auth/sign-out',
      headers: {
        origin,
        cookie: sessionCookie,
      },
    });

    expect(signOut.statusCode).toBe(200);

    // Verify that the previous session is no longer valid.
    const sessionAfterSignOut = await app.inject({
      method: 'GET',
      url: '/api/auth/get-session',
      headers: {
        cookie: sessionCookie,
      },
    });

    expect(sessionAfterSignOut.statusCode).toBe(200);
    expect(sessionAfterSignOut.json()).toBeNull();
  });
});
