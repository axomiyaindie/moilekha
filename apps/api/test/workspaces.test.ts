
import { randomUUID } from 'node:crypto';

import { afterEach, describe, expect, it } from 'vitest';

import { env } from '../src/config/env.js';
import { pool } from '../src/infrastructure/database.js';
import { buildApp } from '../src/app.js';

describe('Workspace integration', () => {
  const ownerEmail = `workspace-owner-${randomUUID()}@example.com`;
  const outsiderEmail = `workspace-outsider-${randomUUID()}@example.com`;
  const password = 'TestPassword!2026';
  const name = 'Workspace Test User';
  const origin = env.FRONTEND_URL;

  const app = buildApp();

  afterEach(async () => {
    await app.close();

    await pool.query(
      `DELETE FROM organizations
       WHERE created_by_user_id IN (
         SELECT id FROM users WHERE email = ANY($1::text[])
       )`,
      [[ownerEmail, outsiderEmail]],
    );

    await pool.query(
      'DELETE FROM users WHERE email = ANY($1::text[])',
      [[ownerEmail, outsiderEmail]],
    );
  });

  it('enforces authentication, workspace isolation, creation, and role-based updates', async () => {
    // Unauthenticated users cannot list or create workspaces.
    const unauthenticatedList = await app.inject({
      method: 'GET',
      url: '/workspaces',
    });

    expect(unauthenticatedList.statusCode).toBe(401);

    const unauthenticatedCreate = await app.inject({
      method: 'POST',
      url: '/workspaces',
      payload: { name: 'Unauthorized Workspace' },
    });

    expect(unauthenticatedCreate.statusCode).toBe(401);

    // Register the workspace owner.
    const registration = await app.inject({
      method: 'POST',
      url: '/api/auth/sign-up/email',
      headers: { origin },
      payload: {
        name,
        email: ownerEmail,
        password,
      },
    });

    expect(registration.statusCode).toBe(200);

    // Sign in and obtain the authenticated session cookie.
    const signIn = await app.inject({
      method: 'POST',
      url: '/api/auth/sign-in/email',
      headers: { origin },
      payload: {
        email: ownerEmail,
        password,
      },
    });

    expect(signIn.statusCode).toBe(200);

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

    const authenticatedHeaders = {
      cookie: sessionCookie,
      origin,
    };

    const invalidCreation = await app.inject({
      method: 'POST',
      url: '/workspaces',
      headers: authenticatedHeaders,
      payload: {
      name: '   ',
    },
     });

expect(invalidCreation.statusCode).toBe(400);

    // Create a separate user's workspace directly in PostgreSQL.
    // This workspace must never appear in the authenticated user's list.
    const outsiderResult = await pool.query<{ id: string }>(
      `INSERT INTO users (name, email)
       VALUES ($1, $2)
       RETURNING id`,
      ['Outsider User', outsiderEmail],
    );

    const outsiderId = outsiderResult.rows[0]?.id;

    expect(outsiderId).toBeDefined();

    const outsiderWorkspaceResult = await pool.query<{ id: string }>(
      `INSERT INTO organizations (name, slug, created_by_user_id)
       VALUES ($1, $2, $3)
       RETURNING id`,
      ['Outsider Workspace', `outsider-${randomUUID()}`, outsiderId],
    );

    const outsiderWorkspaceId = outsiderWorkspaceResult.rows[0]?.id;

    expect(outsiderWorkspaceId).toBeDefined();

    // Create a workspace through the API.
    const creation = await app.inject({
      method: 'POST',
      url: '/workspaces',
      headers: authenticatedHeaders,
      payload: {
        name: 'Science Publication',
      },
    });

    expect(creation.statusCode).toBe(201);

    const createdWorkspace = creation.json().workspace as {
      id: string;
      name: string;
      slug: string;
      role: string;
    };

    expect(createdWorkspace).toMatchObject({
      name: 'Science Publication',
      role: 'owner',
    });

    expect(createdWorkspace.slug).toMatch(
      /^science-publication-[a-f0-9-]{8}$/,
    );

    // Verify workspace creation and owner membership were atomic.
    const membershipResult = await pool.query(
      `SELECT
         o.id,
         o.created_by_user_id,
         m.user_id,
         m.role
       FROM organizations o
       INNER JOIN memberships m
         ON m.organization_id = o.id
       WHERE o.id = $1`,
      [createdWorkspace.id],
    );

    expect(membershipResult.rowCount).toBe(1);
    expect(membershipResult.rows[0]).toMatchObject({
      id: createdWorkspace.id,
      user_id: registration.json().user.id,
      created_by_user_id: registration.json().user.id,
      role: 'owner',
    });

    // List workspaces: personal and created workspaces are visible.
    const listing = await app.inject({
      method: 'GET',
      url: '/workspaces',
      headers: authenticatedHeaders,
    });

    expect(listing.statusCode).toBe(200);

    const listedWorkspaces = listing.json().workspaces as Array<{
      id: string;
      name: string;
      role: string;
    }>;

    expect(listedWorkspaces).toHaveLength(2);
    expect(listedWorkspaces.map((workspace) => workspace.id)).toContain(
      createdWorkspace.id,
    );

    expect(
      listedWorkspaces.some(
        (workspace) => workspace.id === outsiderWorkspaceId,
      ),
    ).toBe(false);

    // Retrieve the created workspace.
    const details = await app.inject({
      method: 'GET',
      url: `/workspaces/${createdWorkspace.id}`,
      headers: authenticatedHeaders,
    });

    expect(details.statusCode).toBe(200);
    expect(details.json().workspace).toMatchObject({
      id: createdWorkspace.id,
      name: 'Science Publication',
      role: 'owner',
    });

    // Invalid workspace IDs must be rejected.
    const invalidId = await app.inject({
      method: 'GET',
      url: '/workspaces/not-a-uuid',
      headers: authenticatedHeaders,
    });

    expect(invalidId.statusCode).toBe(400);

    // A non-member cannot retrieve another user's workspace.
    const outsiderDetails = await app.inject({
      method: 'GET',
      url: `/workspaces/${outsiderWorkspaceId}`,
      headers: authenticatedHeaders,
    });

    expect(outsiderDetails.statusCode).toBe(404);

    // A non-member cannot update another user's workspace.
    const outsiderUpdate = await app.inject({
      method: 'PATCH',
      url: `/workspaces/${outsiderWorkspaceId}`,
      headers: authenticatedHeaders,
      payload: {
        name: 'Unauthorized Rename',
      },
    });

    expect(outsiderUpdate.statusCode).toBe(404);

    // Invalid update data must be rejected.
    const invalidUpdate = await app.inject({
      method: 'PATCH',
      url: `/workspaces/${createdWorkspace.id}`,
      headers: authenticatedHeaders,
      payload: {
        name: '',
      },
    });

    expect(invalidUpdate.statusCode).toBe(400);

    // Owners can update workspace details.
    const ownerUpdate = await app.inject({
      method: 'PATCH',
      url: `/workspaces/${createdWorkspace.id}`,
      headers: authenticatedHeaders,
      payload: {
        name: 'Science and Research',
      },
    });

    expect(ownerUpdate.statusCode).toBe(200);
    expect(ownerUpdate.json().workspace).toMatchObject({
      id: createdWorkspace.id,
      name: 'Science and Research',
      role: 'owner',
    });

    // A regular member cannot update workspace details.
    await pool.query(
      `UPDATE memberships
       SET role = 'member'
       WHERE organization_id = $1
         AND user_id = $2`,
      [createdWorkspace.id, registration.json().user.id],
    );

    const memberUpdate = await app.inject({
      method: 'PATCH',
      url: `/workspaces/${createdWorkspace.id}`,
      headers: authenticatedHeaders,
      payload: {
        name: 'Member Unauthorized Rename',
      },
    });

    expect(memberUpdate.statusCode).toBe(403);

    // Admins can update workspace details.
    await pool.query(
      `UPDATE memberships
       SET role = 'admin'
       WHERE organization_id = $1
         AND user_id = $2`,
      [createdWorkspace.id, registration.json().user.id],
    );

    const adminUpdate = await app.inject({
      method: 'PATCH',
      url: `/workspaces/${createdWorkspace.id}`,
      headers: authenticatedHeaders,
      payload: {
        name: 'Admin Updated Workspace',
      },
    });

    expect(adminUpdate.statusCode).toBe(200);
    expect(adminUpdate.json().workspace).toMatchObject({
      id: createdWorkspace.id,
      name: 'Admin Updated Workspace',
      role: 'admin',
    });
  });
});
