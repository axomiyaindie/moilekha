
import { randomUUID } from 'node:crypto';

import { afterEach, describe, expect, it } from 'vitest';

import { env } from '../src/config/env.js';
import { pool } from '../src/infrastructure/database.js';
import { buildApp } from '../src/app.js';

describe('Website integration', () => {
  const ownerEmail = `website-owner-${randomUUID()}@example.com`;
  const memberEmail = `website-member-${randomUUID()}@example.com`;
  const password = 'TestPassword!2026';
  const origin = env.FRONTEND_URL;

  const app = buildApp();

  afterEach(async () => {
    await app.close();

    await pool.query(
      `DELETE FROM organizations
       WHERE created_by_user_id IN (
         SELECT id FROM users WHERE email = ANY($1::text[])
       )`,
      [[ownerEmail, memberEmail]],
    );

    await pool.query(
      'DELETE FROM users WHERE email = ANY($1::text[])',
      [[ownerEmail, memberEmail]],
    );
  });

  it('enforces workspace, website, and website membership permissions', async () => {
    // Unauthenticated users cannot access website endpoints.
    const unauthenticatedList = await app.inject({
      method: 'GET',
      url: `/workspaces/${randomUUID()}/websites`,
    });

    expect(unauthenticatedList.statusCode).toBe(401);

    const unauthenticatedMembers = await app.inject({
      method: 'GET',
      url: `/websites/${randomUUID()}/members`,
    });

    expect(unauthenticatedMembers.statusCode).toBe(401);

    // Register and authenticate the workspace owner.
    const ownerRegistration = await app.inject({
      method: 'POST',
      url: '/api/auth/sign-up/email',
      headers: { origin },
      payload: {
        name: 'Website Owner',
        email: ownerEmail,
        password,
      },
    });

    expect(ownerRegistration.statusCode).toBe(200);

    const ownerId = ownerRegistration.json().user.id as string;

    const ownerSignIn = await app.inject({
      method: 'POST',
      url: '/api/auth/sign-in/email',
      headers: { origin },
      payload: {
        email: ownerEmail,
        password,
      },
    });

    expect(ownerSignIn.statusCode).toBe(200);

    const ownerSetCookie = ownerSignIn.headers['set-cookie'];
    const ownerCookies = Array.isArray(ownerSetCookie)
      ? ownerSetCookie
      : ownerSetCookie
        ? [ownerSetCookie]
        : [];

    const ownerSessionCookie = ownerCookies
      .map((cookie) => cookie.split(';')[0])
      .join('; ');

    expect(ownerSessionCookie).toContain('better-auth.session_token=');

    const ownerHeaders = {
      cookie: ownerSessionCookie,
      origin,
    };

    // Find the owner's automatically provisioned personal workspace.
    const workspaceResult = await pool.query<{ organization_id: string }>(
      `SELECT organization_id
       FROM memberships
       WHERE user_id = $1
         AND role = 'owner'
       LIMIT 1`,
      [ownerId],
    );

    const workspaceId = workspaceResult.rows[0]?.organization_id;

    expect(workspaceId).toBeDefined();

    // Create the first website.
    const firstCreation = await app.inject({
      method: 'POST',
      url: `/workspaces/${workspaceId}/websites`,
      headers: ownerHeaders,
      payload: {
        name: 'Science Publication',
        description: 'Science and research articles.',
      },
    });

    expect(firstCreation.statusCode).toBe(201);

    const firstWebsite = firstCreation.json().website as {
      id: string;
      organizationId: string;
      name: string;
      slug: string;
      description: string | null;
      status: string;
      websiteRole: string;
    };

    expect(firstWebsite).toMatchObject({
      organizationId: workspaceId,
      name: 'Science Publication',
      description: 'Science and research articles.',
      status: 'draft',
      websiteRole: 'administrator',
    });

    expect(firstWebsite.slug).toMatch(
      /^science-publication-[a-f0-9-]{8}$/,
    );

    // Create a second website.
    const secondCreation = await app.inject({
      method: 'POST',
      url: `/workspaces/${workspaceId}/websites`,
      headers: ownerHeaders,
      payload: {
        name: 'Crypto Publication',
      },
    });

    expect(secondCreation.statusCode).toBe(201);

    const secondWebsite = secondCreation.json().website as {
      id: string;
      name: string;
    };

    expect(secondWebsite.name).toBe('Crypto Publication');

    // Verify creator received website administrator membership.
    const creatorMembership = await pool.query(
      `SELECT role
       FROM website_memberships
       WHERE website_id = $1
         AND user_id = $2`,
      [firstWebsite.id, ownerId],
    );

    expect(creatorMembership.rowCount).toBe(1);
    expect(creatorMembership.rows[0]?.role).toBe('administrator');

    // Workspace owner can see every website.
    const ownerListing = await app.inject({
      method: 'GET',
      url: `/workspaces/${workspaceId}/websites`,
      headers: ownerHeaders,
    });

    expect(ownerListing.statusCode).toBe(200);
    expect(ownerListing.json().websites).toHaveLength(2);

    // Workspace owner can retrieve and update a website.
    const ownerDetails = await app.inject({
      method: 'GET',
      url: `/websites/${firstWebsite.id}`,
      headers: ownerHeaders,
    });

    expect(ownerDetails.statusCode).toBe(200);
    expect(ownerDetails.json().website).toMatchObject({
      id: firstWebsite.id,
      workspaceRole: 'owner',
      websiteRole: null,
    });

    const ownerUpdate = await app.inject({
      method: 'PATCH',
      url: `/websites/${firstWebsite.id}`,
      headers: ownerHeaders,
      payload: {
        name: 'Science and Research',
        status: 'published',
      },
    });

    expect(ownerUpdate.statusCode).toBe(200);
    expect(ownerUpdate.json().website).toMatchObject({
      id: firstWebsite.id,
      name: 'Science and Research',
      status: 'published',
    });

    // Register and authenticate a regular workspace member.
    const memberRegistration = await app.inject({
      method: 'POST',
      url: '/api/auth/sign-up/email',
      headers: { origin },
      payload: {
        name: 'Website Member',
        email: memberEmail,
        password,
      },
    });

    expect(memberRegistration.statusCode).toBe(200);

    const memberId = memberRegistration.json().user.id as string;

    const memberSignIn = await app.inject({
      method: 'POST',
      url: '/api/auth/sign-in/email',
      headers: { origin },
      payload: {
        email: memberEmail,
        password,
      },
    });

    expect(memberSignIn.statusCode).toBe(200);

    const memberSetCookie = memberSignIn.headers['set-cookie'];
    const memberCookies = Array.isArray(memberSetCookie)
      ? memberSetCookie
      : memberSetCookie
        ? [memberSetCookie]
        : [];

    const memberSessionCookie = memberCookies
      .map((cookie) => cookie.split(';')[0])
      .join('; ');

    expect(memberSessionCookie).toContain('better-auth.session_token=');

    const memberHeaders = {
      cookie: memberSessionCookie,
      origin,
    };

    // Add the regular user to the owner's workspace.
    await pool.query(
      `INSERT INTO memberships (organization_id, user_id, role)
       VALUES ($1, $2, 'member')`,
      [workspaceId, memberId],
    );

    // Regular workspace members cannot create websites.
    const memberCreation = await app.inject({
      method: 'POST',
      url: `/workspaces/${workspaceId}/websites`,
      headers: memberHeaders,
      payload: {
        name: 'Unauthorized Website',
      },
    });

    expect(memberCreation.statusCode).toBe(403);

    // Regular members initially see no websites.
    const unassignedListing = await app.inject({
      method: 'GET',
      url: `/workspaces/${workspaceId}/websites`,
      headers: memberHeaders,
    });

    expect(unassignedListing.statusCode).toBe(200);
    expect(unassignedListing.json().websites).toHaveLength(0);

    // Unassigned members cannot retrieve a website.
    const unassignedDetails = await app.inject({
      method: 'GET',
      url: `/websites/${firstWebsite.id}`,
      headers: memberHeaders,
    });

    expect(unassignedDetails.statusCode).toBe(404);

    // Workspace members cannot view the website team.
    const forbiddenMemberList = await app.inject({
      method: 'GET',
      url: `/websites/${firstWebsite.id}/members`,
      headers: memberHeaders,
    });

    expect(forbiddenMemberList.statusCode).toBe(403);

    // Workspace members cannot assign website members.
    const forbiddenAssignment = await app.inject({
      method: 'POST',
      url: `/websites/${firstWebsite.id}/members`,
      headers: memberHeaders,
      payload: {
        userId: ownerId,
        role: 'editor',
      },
    });

    expect(forbiddenAssignment.statusCode).toBe(403);

    // A workspace owner can view the explicit website team.
    const initialMembers = await app.inject({
      method: 'GET',
      url: `/websites/${firstWebsite.id}/members`,
      headers: ownerHeaders,
    });

    expect(initialMembers.statusCode).toBe(200);
    expect(initialMembers.json().members).toHaveLength(1);
    expect(initialMembers.json().members[0]).toMatchObject({
      userId: ownerId,
      role: 'administrator',
    });

    // A user outside the workspace cannot be assigned.
    const nonWorkspaceAssignment = await app.inject({
      method: 'POST',
      url: `/websites/${firstWebsite.id}/members`,
      headers: ownerHeaders,
      payload: {
        userId: randomUUID(),
        role: 'editor',
      },
    });

    expect(nonWorkspaceAssignment.statusCode).toBe(404);
    expect(nonWorkspaceAssignment.json().code).toBe(
      'WORKSPACE_MEMBER_NOT_FOUND',
    );

    // Assign the regular workspace member as an editor through the API.
    const assignment = await app.inject({
      method: 'POST',
      url: `/websites/${firstWebsite.id}/members`,
      headers: ownerHeaders,
      payload: {
        userId: memberId,
        role: 'editor',
      },
    });

    expect(assignment.statusCode).toBe(201);
    expect(assignment.json().member).toMatchObject({
      userId: memberId,
      role: 'editor',
    });

    // Duplicate assignments must be rejected.
    const duplicateAssignment = await app.inject({
      method: 'POST',
      url: `/websites/${firstWebsite.id}/members`,
      headers: ownerHeaders,
      payload: {
        userId: memberId,
        role: 'viewer',
      },
    });

    expect(duplicateAssignment.statusCode).toBe(409);
    expect(duplicateAssignment.json().code).toBe(
      'MEMBERSHIP_ALREADY_EXISTS',
    );

    // The creator cannot be assigned a lower role.
    const creatorAssignmentDowngrade = await app.inject({
      method: 'POST',
      url: `/websites/${firstWebsite.id}/members`,
      headers: ownerHeaders,
      payload: {
        userId: ownerId,
        role: 'viewer',
      },
    });

    expect(creatorAssignmentDowngrade.statusCode).toBe(409);
    expect(creatorAssignmentDowngrade.json().code).toBe(
      'CREATOR_ROLE_PROTECTED',
    );

    // The creator cannot be demoted.
    const creatorDowngrade = await app.inject({
      method: 'PATCH',
      url: `/websites/${firstWebsite.id}/members/${ownerId}`,
      headers: ownerHeaders,
      payload: {
        role: 'viewer',
      },
    });

    expect(creatorDowngrade.statusCode).toBe(409);
    expect(creatorDowngrade.json().code).toBe(
      'CREATOR_ROLE_PROTECTED',
    );

    // The creator cannot be removed.
    const creatorRemoval = await app.inject({
      method: 'DELETE',
      url: `/websites/${firstWebsite.id}/members/${ownerId}`,
      headers: ownerHeaders,
    });

    expect(creatorRemoval.statusCode).toBe(409);
    expect(creatorRemoval.json().code).toBe(
      'CREATOR_MEMBERSHIP_PROTECTED',
    );

    // Verify the assigned team contains both users.
    const assignedMembers = await app.inject({
      method: 'GET',
      url: `/websites/${firstWebsite.id}/members`,
      headers: ownerHeaders,
    });

    expect(assignedMembers.statusCode).toBe(200);
    expect(assignedMembers.json().members).toHaveLength(2);

    const assignedMember = assignedMembers.json().members.find(
      (item: { userId: string }) => item.userId === memberId,
    );

    expect(assignedMember).toMatchObject({
      userId: memberId,
      name: 'Website Member',
      email: memberEmail,
      role: 'editor',
    });

    // Regular members see only explicitly assigned websites.
    const memberListing = await app.inject({
      method: 'GET',
      url: `/workspaces/${workspaceId}/websites`,
      headers: memberHeaders,
    });

    expect(memberListing.statusCode).toBe(200);

    const memberWebsites = memberListing.json().websites as Array<{
      id: string;
      websiteRole: string;
    }>;

    expect(memberWebsites).toHaveLength(1);
    expect(memberWebsites[0]).toMatchObject({
      id: firstWebsite.id,
      websiteRole: 'editor',
    });

    // Assigned members can retrieve their website.
    const memberDetails = await app.inject({
      method: 'GET',
      url: `/websites/${firstWebsite.id}`,
      headers: memberHeaders,
    });

    expect(memberDetails.statusCode).toBe(200);
    expect(memberDetails.json().website).toMatchObject({
      id: firstWebsite.id,
      workspaceRole: 'member',
      websiteRole: 'editor',
    });

    // Editors cannot update website settings.
    const editorUpdate = await app.inject({
      method: 'PATCH',
      url: `/websites/${firstWebsite.id}`,
      headers: memberHeaders,
      payload: {
        name: 'Editor Unauthorized Rename',
      },
    });

    expect(editorUpdate.statusCode).toBe(403);

    // Workspace members cannot change website team roles.
    const forbiddenRoleUpdate = await app.inject({
      method: 'PATCH',
      url: `/websites/${firstWebsite.id}/members/${memberId}`,
      headers: memberHeaders,
      payload: {
        role: 'administrator',
      },
    });

    expect(forbiddenRoleUpdate.statusCode).toBe(403);

    // Promote the member to website administrator through the API.
    const promotion = await app.inject({
      method: 'PATCH',
      url: `/websites/${firstWebsite.id}/members/${memberId}`,
      headers: ownerHeaders,
      payload: {
        role: 'administrator',
      },
    });

    expect(promotion.statusCode).toBe(200);
    expect(promotion.json().member).toMatchObject({
      userId: memberId,
      role: 'administrator',
    });

    // Website administrators can manage website settings.
    const administratorUpdate = await app.inject({
      method: 'PATCH',
      url: `/websites/${firstWebsite.id}`,
      headers: memberHeaders,
      payload: {
        name: 'Administrator Updated Website',
      },
    });

    expect(administratorUpdate.statusCode).toBe(200);
    expect(administratorUpdate.json().website).toMatchObject({
      id: firstWebsite.id,
      name: 'Administrator Updated Website',
    });

    // Website administrators still cannot manage the team.
    const administratorMemberList = await app.inject({
      method: 'GET',
      url: `/websites/${firstWebsite.id}/members`,
      headers: memberHeaders,
    });

    expect(administratorMemberList.statusCode).toBe(403);

    // Workspace owner removes the assigned member.
    const removal = await app.inject({
      method: 'DELETE',
      url: `/websites/${firstWebsite.id}/members/${memberId}`,
      headers: ownerHeaders,
    });

    expect(removal.statusCode).toBe(200);
    expect(removal.json()).toMatchObject({
      success: true,
      userId: memberId,
    });

    // Removed members immediately lose website access.
    const revokedDetails = await app.inject({
      method: 'GET',
      url: `/websites/${firstWebsite.id}`,
      headers: memberHeaders,
    });

    expect(revokedDetails.statusCode).toBe(404);

    // Removed members no longer see the website in their listing.
    const revokedListing = await app.inject({
      method: 'GET',
      url: `/workspaces/${workspaceId}/websites`,
      headers: memberHeaders,
    });

    expect(revokedListing.statusCode).toBe(200);
    expect(revokedListing.json().websites).toHaveLength(0);

    // Removing an already removed membership returns 404.
    const repeatedRemoval = await app.inject({
      method: 'DELETE',
      url: `/websites/${firstWebsite.id}/members/${memberId}`,
      headers: ownerHeaders,
    });

    expect(repeatedRemoval.statusCode).toBe(404);
    expect(repeatedRemoval.json().code).toBe(
      'WEBSITE_MEMBERSHIP_NOT_FOUND',
    );
  });
});
