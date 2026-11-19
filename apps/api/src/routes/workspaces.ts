
import { randomUUID } from 'node:crypto';

import { fromNodeHeaders } from 'better-auth/node';
import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';

import { auth } from '../infrastructure/auth.js';
import { db } from '../infrastructure/database.js';
import { memberships, organizations } from '../db/schema/index.js';

const createWorkspaceSchema = z.object({
  name: z.string().trim().min(1).max(120),
});

const updateWorkspaceSchema = z.object({
  name: z.string().trim().min(1).max(120),
});

const workspaceParamsSchema = z.object({
  workspaceId: z.string().uuid(),
});

type AuthenticatedUser = {
  id: string;
};

async function getAuthenticatedUser(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<AuthenticatedUser | null> {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  });

  if (!session) {
    await reply.code(401).send({
      error: 'Authentication required',
      code: 'UNAUTHORIZED',
    });

    return null;
  }

  return {
    id: session.user.id,
  };
}

function createWorkspaceSlug(name: string): string {
  const baseSlug =
    name
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50) || 'workspace';

  return `${baseSlug}-${randomUUID().slice(0, 8)}`;
}

export const workspaceRoutes: FastifyPluginAsync = async (app) => {
  // List workspaces belonging to the authenticated user.
  app.get('/workspaces', async (request, reply) => {
    const user = await getAuthenticatedUser(request, reply);

    if (!user) {
      return;
    }

    const workspaces = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
        createdAt: organizations.createdAt,
        updatedAt: organizations.updatedAt,
        role: memberships.role,
      })
      .from(memberships)
      .innerJoin(
        organizations,
        eq(memberships.organizationId, organizations.id),
      )
      .where(eq(memberships.userId, user.id))
      .orderBy(desc(organizations.createdAt));

    return {
      workspaces,
    };
  });

  // Create a workspace and assign its creator the owner role.
  app.post('/workspaces', async (request, reply) => {
    const user = await getAuthenticatedUser(request, reply);

    if (!user) {
      return;
    }

    const parsed = createWorkspaceSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        error: 'Invalid workspace data',
        code: 'VALIDATION_ERROR',
        details: z.treeifyError(parsed.error),
      });
    }

    const { name } = parsed.data;

    const workspace = await db.transaction(async (tx) => {
      const [createdWorkspace] = await tx
        .insert(organizations)
        .values({
          name,
          slug: createWorkspaceSlug(name),
          createdByUserId: user.id,
        })
        .returning({
          id: organizations.id,
          name: organizations.name,
          slug: organizations.slug,
          createdAt: organizations.createdAt,
          updatedAt: organizations.updatedAt,
        });

      if (!createdWorkspace) {
        throw new Error('Workspace creation failed.');
      }

      const [membership] = await tx
        .insert(memberships)
        .values({
          organizationId: createdWorkspace.id,
          userId: user.id,
          role: 'owner',
        })
        .returning({
          role: memberships.role,
        });

      if (!membership) {
        throw new Error('Workspace membership creation failed.');
      }

      return {
        ...createdWorkspace,
        role: membership.role,
      };
    });

    return reply.code(201).send({
      workspace,
    });
  });

  // Retrieve a workspace only if the authenticated user is a member.
  app.get<{ Params: { workspaceId: string } }>(
    '/workspaces/:workspaceId',
    async (request, reply) => {
      const user = await getAuthenticatedUser(request, reply);

      if (!user) {
        return;
      }

      const params = workspaceParamsSchema.safeParse(request.params);

      if (!params.success) {
        return reply.code(400).send({
          error: 'Invalid workspace ID',
          code: 'VALIDATION_ERROR',
        });
      }

      const [workspace] = await db
        .select({
          id: organizations.id,
          name: organizations.name,
          slug: organizations.slug,
          createdAt: organizations.createdAt,
          updatedAt: organizations.updatedAt,
          role: memberships.role,
        })
        .from(memberships)
        .innerJoin(
          organizations,
          eq(memberships.organizationId, organizations.id),
        )
        .where(
          and(
            eq(organizations.id, params.data.workspaceId),
            eq(memberships.userId, user.id),
          ),
        )
        .limit(1);

      if (!workspace) {
        return reply.code(404).send({
          error: 'Workspace not found',
          code: 'WORKSPACE_NOT_FOUND',
        });
      }

      return {
        workspace,
      };
    },
  );

  // Update workspace settings. Only owners and admins can update them.
  app.patch<{ Params: { workspaceId: string } }>(
    '/workspaces/:workspaceId',
    async (request, reply) => {
      const user = await getAuthenticatedUser(request, reply);

      if (!user) {
        return;
      }

      const params = workspaceParamsSchema.safeParse(request.params);

      if (!params.success) {
        return reply.code(400).send({
          error: 'Invalid workspace ID',
          code: 'VALIDATION_ERROR',
        });
      }

      const parsed = updateWorkspaceSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.code(400).send({
          error: 'Invalid workspace data',
          code: 'VALIDATION_ERROR',
          details: z.treeifyError(parsed.error),
        });
      }

      const [membership] = await db
        .select({
          role: memberships.role,
        })
        .from(memberships)
        .where(
          and(
            eq(memberships.organizationId, params.data.workspaceId),
            eq(memberships.userId, user.id),
          ),
        )
        .limit(1);

      if (!membership) {
        return reply.code(404).send({
          error: 'Workspace not found',
          code: 'WORKSPACE_NOT_FOUND',
        });
      }

      if (membership.role !== 'owner' && membership.role !== 'admin') {
        return reply.code(403).send({
          error: 'You do not have permission to update this workspace',
          code: 'FORBIDDEN',
        });
      }

      const [updatedWorkspace] = await db
        .update(organizations)
        .set({
          name: parsed.data.name,
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, params.data.workspaceId))
        .returning({
          id: organizations.id,
          name: organizations.name,
          slug: organizations.slug,
          createdAt: organizations.createdAt,
          updatedAt: organizations.updatedAt,
        });

      if (!updatedWorkspace) {
        return reply.code(404).send({
          error: 'Workspace not found',
          code: 'WORKSPACE_NOT_FOUND',
        });
      }

      return {
        workspace: {
          ...updatedWorkspace,
          role: membership.role,
        },
      };
    },
  );
};
