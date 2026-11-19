
import { randomUUID } from 'node:crypto';

import { fromNodeHeaders } from 'better-auth/node';
import type {
  FastifyPluginAsync,
  FastifyRequest,
  FastifyReply,
} from 'fastify';
import { and, asc, desc, eq } from 'drizzle-orm';
import { z } from 'zod';

import { auth } from '../infrastructure/auth.js';
import { db } from '../infrastructure/database.js';
import {
  memberships,
  users,
  websiteMemberships,
  websites,
} from '../db/schema/index.js';

const createWebsiteSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).nullable().optional(),
});

const updateWebsiteSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().max(500).nullable().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided.',
  });

const workspaceParamsSchema = z.object({
  workspaceId: z.string().uuid(),
});

const websiteParamsSchema = z.object({
  websiteId: z.string().uuid(),
});

const websiteMemberParamsSchema = z.object({
  websiteId: z.string().uuid(),
  userId: z.string().uuid(),
});

const createWebsiteMemberSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum([
    'administrator',
    'editor',
    'author',
    'contributor',
    'viewer',
  ]),
});

const updateWebsiteMemberSchema = z.object({
  role: z.enum([
    'administrator',
    'editor',
    'author',
    'contributor',
    'viewer',
  ]),
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

function createWebsiteSlug(name: string): string {
  const baseSlug =
    name
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50) || 'website';

  return `${baseSlug}-${randomUUID().slice(0, 8)}`;
}

async function getWorkspaceMembership(
  workspaceId: string,
  userId: string,
) {
  const [membership] = await db
    .select({
      role: memberships.role,
    })
    .from(memberships)
    .where(
      and(
        eq(memberships.organizationId, workspaceId),
        eq(memberships.userId, userId),
      ),
    )
    .limit(1);

  return membership ?? null;
}

async function getWebsiteMembership(
  websiteId: string,
  userId: string,
) {
  const [membership] = await db
    .select({
      role: websiteMemberships.role,
    })
    .from(websiteMemberships)
    .where(
      and(
        eq(websiteMemberships.websiteId, websiteId),
        eq(websiteMemberships.userId, userId),
      ),
    )
    .limit(1);

  return membership ?? null;
}

function canManageWorkspace(role: string): boolean {
  return role === 'owner' || role === 'admin';
}

export const websiteRoutes: FastifyPluginAsync = async (app) => {
  // POST /workspaces/:workspaceId/websites
  // Only workspace owners and admins can create websites.
  app.post<{ Params: { workspaceId: string } }>(
    '/workspaces/:workspaceId/websites',
    async (request, reply) => {
      const user = await getAuthenticatedUser(request, reply);
      if (!user) return;

      const params = workspaceParamsSchema.safeParse(request.params);

      if (!params.success) {
        return reply.code(400).send({
          error: 'Invalid workspace ID',
          code: 'VALIDATION_ERROR',
        });
      }

      const parsed = createWebsiteSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.code(400).send({
          error: 'Invalid website data',
          code: 'VALIDATION_ERROR',
          details: z.treeifyError(parsed.error),
        });
      }

      const workspaceMembership = await getWorkspaceMembership(
        params.data.workspaceId,
        user.id,
      );

      if (!workspaceMembership) {
        return reply.code(404).send({
          error: 'Workspace not found',
          code: 'WORKSPACE_NOT_FOUND',
        });
      }

      if (!canManageWorkspace(workspaceMembership.role)) {
        return reply.code(403).send({
          error: 'You do not have permission to create websites',
          code: 'FORBIDDEN',
        });
      }

      const website = await db.transaction(async (tx) => {
        const [createdWebsite] = await tx
          .insert(websites)
          .values({
            organizationId: params.data.workspaceId,
            createdByUserId: user.id,
            name: parsed.data.name,
            slug: createWebsiteSlug(parsed.data.name),
            description: parsed.data.description ?? null,
          })
          .returning({
            id: websites.id,
            organizationId: websites.organizationId,
            name: websites.name,
            slug: websites.slug,
            description: websites.description,
            status: websites.status,
            createdAt: websites.createdAt,
            updatedAt: websites.updatedAt,
          });

        if (!createdWebsite) {
          throw new Error('Website creation failed.');
        }

        const [createdMembership] = await tx
          .insert(websiteMemberships)
          .values({
            websiteId: createdWebsite.id,
            userId: user.id,
            role: 'administrator',
          })
          .returning({
            role: websiteMemberships.role,
          });

        if (!createdMembership) {
          throw new Error('Website membership creation failed.');
        }

        return {
          ...createdWebsite,
          websiteRole: createdMembership.role,
        };
      });

      return reply.code(201).send({ website });
    },
  );

  // GET /workspaces/:workspaceId/websites
  // Workspace owners/admins see all websites.
  // Regular members see only websites assigned to them.
  app.get<{ Params: { workspaceId: string } }>(
    '/workspaces/:workspaceId/websites',
    async (request, reply) => {
      const user = await getAuthenticatedUser(request, reply);
      if (!user) return;

      const params = workspaceParamsSchema.safeParse(request.params);

      if (!params.success) {
        return reply.code(400).send({
          error: 'Invalid workspace ID',
          code: 'VALIDATION_ERROR',
        });
      }

      const workspaceMembership = await getWorkspaceMembership(
        params.data.workspaceId,
        user.id,
      );

      if (!workspaceMembership) {
        return reply.code(404).send({
          error: 'Workspace not found',
          code: 'WORKSPACE_NOT_FOUND',
        });
      }

      if (canManageWorkspace(workspaceMembership.role)) {
        const results = await db
          .select({
            id: websites.id,
            organizationId: websites.organizationId,
            name: websites.name,
            slug: websites.slug,
            description: websites.description,
            status: websites.status,
            createdAt: websites.createdAt,
            updatedAt: websites.updatedAt,
          })
          .from(websites)
          .where(eq(websites.organizationId, params.data.workspaceId))
          .orderBy(desc(websites.createdAt));

        return {
          websites: results.map((website) => ({
            ...website,
            workspaceRole: workspaceMembership.role,
          })),
        };
      }

      const results = await db
        .select({
          id: websites.id,
          organizationId: websites.organizationId,
          name: websites.name,
          slug: websites.slug,
          description: websites.description,
          status: websites.status,
          createdAt: websites.createdAt,
          updatedAt: websites.updatedAt,
          websiteRole: websiteMemberships.role,
        })
        .from(websiteMemberships)
        .innerJoin(
          websites,
          eq(websiteMemberships.websiteId, websites.id),
        )
        .where(
          and(
            eq(websites.organizationId, params.data.workspaceId),
            eq(websiteMemberships.userId, user.id),
          ),
        )
        .orderBy(desc(websites.createdAt));

      return { websites: results };
    },
  );

  // GET /websites/:websiteId
  // A workspace owner/admin or an assigned website member can access it.
  app.get<{ Params: { websiteId: string } }>(
    '/websites/:websiteId',
    async (request, reply) => {
      const user = await getAuthenticatedUser(request, reply);
      if (!user) return;

      const params = websiteParamsSchema.safeParse(request.params);

      if (!params.success) {
        return reply.code(400).send({
          error: 'Invalid website ID',
          code: 'VALIDATION_ERROR',
        });
      }

      const [website] = await db
        .select({
          id: websites.id,
          organizationId: websites.organizationId,
          name: websites.name,
          slug: websites.slug,
          description: websites.description,
          status: websites.status,
          createdAt: websites.createdAt,
          updatedAt: websites.updatedAt,
        })
        .from(websites)
        .where(eq(websites.id, params.data.websiteId))
        .limit(1);

      if (!website) {
        return reply.code(404).send({
          error: 'Website not found',
          code: 'WEBSITE_NOT_FOUND',
        });
      }

      const workspaceMembership = await getWorkspaceMembership(
        website.organizationId,
        user.id,
      );

      if (!workspaceMembership) {
        return reply.code(404).send({
          error: 'Website not found',
          code: 'WEBSITE_NOT_FOUND',
        });
      }

      if (canManageWorkspace(workspaceMembership.role)) {
        return {
          website: {
            ...website,
            workspaceRole: workspaceMembership.role,
            websiteRole: null,
          },
        };
      }

      const websiteMembership = await getWebsiteMembership(
        website.id,
        user.id,
      );

      if (!websiteMembership) {
        return reply.code(404).send({
          error: 'Website not found',
          code: 'WEBSITE_NOT_FOUND',
        });
      }

      return {
        website: {
          ...website,
          workspaceRole: workspaceMembership.role,
          websiteRole: websiteMembership.role,
        },
      };
    },
  );

  // PATCH /websites/:websiteId
  // Workspace owners/admins and website administrators can manage settings.
  app.patch<{ Params: { websiteId: string } }>(
    '/websites/:websiteId',
    async (request, reply) => {
      const user = await getAuthenticatedUser(request, reply);
      if (!user) return;

      const params = websiteParamsSchema.safeParse(request.params);

      if (!params.success) {
        return reply.code(400).send({
          error: 'Invalid website ID',
          code: 'VALIDATION_ERROR',
        });
      }

      const parsed = updateWebsiteSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.code(400).send({
          error: 'Invalid website data',
          code: 'VALIDATION_ERROR',
          details: z.treeifyError(parsed.error),
        });
      }

      const [website] = await db
        .select({
          id: websites.id,
          organizationId: websites.organizationId,
        })
        .from(websites)
        .where(eq(websites.id, params.data.websiteId))
        .limit(1);

      if (!website) {
        return reply.code(404).send({
          error: 'Website not found',
          code: 'WEBSITE_NOT_FOUND',
        });
      }

      const workspaceMembership = await getWorkspaceMembership(
        website.organizationId,
        user.id,
      );

      if (!workspaceMembership) {
        return reply.code(404).send({
          error: 'Website not found',
          code: 'WEBSITE_NOT_FOUND',
        });
      }

      if (!canManageWorkspace(workspaceMembership.role)) {
        const websiteMembership = await getWebsiteMembership(
          website.id,
          user.id,
        );

        if (!websiteMembership) {
          return reply.code(404).send({
            error: 'Website not found',
            code: 'WEBSITE_NOT_FOUND',
          });
        }

        if (websiteMembership.role !== 'administrator') {
          return reply.code(403).send({
            error: 'You do not have permission to update this website',
            code: 'FORBIDDEN',
          });
        }
      }

      const [updatedWebsite] = await db
        .update(websites)
        .set({
          ...parsed.data,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(websites.id, website.id),
            eq(websites.organizationId, website.organizationId),
          ),
        )
        .returning({
          id: websites.id,
          organizationId: websites.organizationId,
          name: websites.name,
          slug: websites.slug,
          description: websites.description,
          status: websites.status,
          createdAt: websites.createdAt,
          updatedAt: websites.updatedAt,
        });

      if (!updatedWebsite) {
        return reply.code(404).send({
          error: 'Website not found',
          code: 'WEBSITE_NOT_FOUND',
        });
      }

      return {
        website: updatedWebsite,
      };
    },
  );

  // GET /websites/:websiteId/members
  // Only workspace owners and admins can view the website member list.
  app.get<{ Params: { websiteId: string } }>(
    '/websites/:websiteId/members',
    async (request, reply) => {
      const user = await getAuthenticatedUser(request, reply);
      if (!user) return;

      const params = websiteParamsSchema.safeParse(request.params);

      if (!params.success) {
        return reply.code(400).send({
          error: 'Invalid website ID',
          code: 'VALIDATION_ERROR',
        });
      }

      const [website] = await db
        .select({
          id: websites.id,
          organizationId: websites.organizationId,
        })
        .from(websites)
        .where(eq(websites.id, params.data.websiteId))
        .limit(1);

      if (!website) {
        return reply.code(404).send({
          error: 'Website not found',
          code: 'WEBSITE_NOT_FOUND',
        });
      }

      const workspaceMembership = await getWorkspaceMembership(
        website.organizationId,
        user.id,
      );

      if (!workspaceMembership) {
        return reply.code(404).send({
          error: 'Website not found',
          code: 'WEBSITE_NOT_FOUND',
        });
      }

      if (!canManageWorkspace(workspaceMembership.role)) {
        return reply.code(403).send({
          error: 'You do not have permission to view website members',
          code: 'FORBIDDEN',
        });
      }

      const members = await db
        .select({
          userId: users.id,
          name: users.name,
          email: users.email,
          avatarUrl: users.avatarUrl,
          role: websiteMemberships.role,
          createdAt: websiteMemberships.createdAt,
        })
        .from(websiteMemberships)
        .innerJoin(users, eq(websiteMemberships.userId, users.id))
        .where(eq(websiteMemberships.websiteId, website.id))
        .orderBy(asc(users.name));

      return { members };
    },
  );

  // POST /websites/:websiteId/members
  // Assign an existing workspace member to a website.
  app.post<{ Params: { websiteId: string } }>(
    '/websites/:websiteId/members',
    async (request, reply) => {
      const user = await getAuthenticatedUser(request, reply);
      if (!user) return;

      const params = websiteParamsSchema.safeParse(request.params);

      if (!params.success) {
        return reply.code(400).send({
          error: 'Invalid website ID',
          code: 'VALIDATION_ERROR',
        });
      }

      const parsed = createWebsiteMemberSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.code(400).send({
          error: 'Invalid website member data',
          code: 'VALIDATION_ERROR',
          details: z.treeifyError(parsed.error),
        });
      }

      const [website] = await db
        .select({
          id: websites.id,
          organizationId: websites.organizationId,
          createdByUserId: websites.createdByUserId,
        })
        .from(websites)
        .where(eq(websites.id, params.data.websiteId))
        .limit(1);

      if (!website) {
        return reply.code(404).send({
          error: 'Website not found',
          code: 'WEBSITE_NOT_FOUND',
        });
      }

      const workspaceMembership = await getWorkspaceMembership(
        website.organizationId,
        user.id,
      );

      if (!workspaceMembership) {
        return reply.code(404).send({
          error: 'Website not found',
          code: 'WEBSITE_NOT_FOUND',
        });
      }

      if (!canManageWorkspace(workspaceMembership.role)) {
        return reply.code(403).send({
          error: 'You do not have permission to manage website members',
          code: 'FORBIDDEN',
        });
      }

      const targetWorkspaceMembership = await getWorkspaceMembership(
        website.organizationId,
        parsed.data.userId,
      );

      if (!targetWorkspaceMembership) {
        return reply.code(404).send({
          error: 'Workspace member not found',
          code: 'WORKSPACE_MEMBER_NOT_FOUND',
        });
      }

      if (
        parsed.data.userId === website.createdByUserId &&
        parsed.data.role !== 'administrator'
      ) {
        return reply.code(409).send({
          error: 'The website creator must remain an administrator',
          code: 'CREATOR_ROLE_PROTECTED',
        });
      }

      const existingMembership = await getWebsiteMembership(
        website.id,
        parsed.data.userId,
      );

      if (existingMembership) {
        return reply.code(409).send({
          error: 'User is already assigned to this website',
          code: 'MEMBERSHIP_ALREADY_EXISTS',
        });
      }

      const [createdMembership] = await db
        .insert(websiteMemberships)
        .values({
          websiteId: website.id,
          userId: parsed.data.userId,
          role: parsed.data.role,
        })
        .returning({
          userId: websiteMemberships.userId,
          role: websiteMemberships.role,
          createdAt: websiteMemberships.createdAt,
        });

      if (!createdMembership) {
        throw new Error('Website membership creation failed.');
      }

      return reply.code(201).send({
        member: createdMembership,
      });
    },
  );

  // PATCH /websites/:websiteId/members/:userId
  // Change an assigned member's website role.
  app.patch<{
    Params: { websiteId: string; userId: string };
  }>(
    '/websites/:websiteId/members/:userId',
    async (request, reply) => {
      const user = await getAuthenticatedUser(request, reply);
      if (!user) return;

      const params = websiteMemberParamsSchema.safeParse(request.params);

      if (!params.success) {
        return reply.code(400).send({
          error: 'Invalid website or user ID',
          code: 'VALIDATION_ERROR',
        });
      }

      const parsed = updateWebsiteMemberSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.code(400).send({
          error: 'Invalid website member role',
          code: 'VALIDATION_ERROR',
          details: z.treeifyError(parsed.error),
        });
      }

      const [website] = await db
        .select({
          id: websites.id,
          organizationId: websites.organizationId,
          createdByUserId: websites.createdByUserId,
        })
        .from(websites)
        .where(eq(websites.id, params.data.websiteId))
        .limit(1);

      if (!website) {
        return reply.code(404).send({
          error: 'Website not found',
          code: 'WEBSITE_NOT_FOUND',
        });
      }

      const workspaceMembership = await getWorkspaceMembership(
        website.organizationId,
        user.id,
      );

      if (!workspaceMembership) {
        return reply.code(404).send({
          error: 'Website not found',
          code: 'WEBSITE_NOT_FOUND',
        });
      }

      if (!canManageWorkspace(workspaceMembership.role)) {
        return reply.code(403).send({
          error: 'You do not have permission to manage website members',
          code: 'FORBIDDEN',
        });
      }

      const targetWorkspaceMembership = await getWorkspaceMembership(
        website.organizationId,
        params.data.userId,
      );

      if (!targetWorkspaceMembership) {
        return reply.code(404).send({
          error: 'Workspace member not found',
          code: 'WORKSPACE_MEMBER_NOT_FOUND',
        });
      }

      if (
        params.data.userId === website.createdByUserId &&
        parsed.data.role !== 'administrator'
      ) {
        return reply.code(409).send({
          error: 'The website creator must remain an administrator',
          code: 'CREATOR_ROLE_PROTECTED',
        });
      }

      const [updatedMembership] = await db
        .update(websiteMemberships)
        .set({
          role: parsed.data.role,
        })
        .where(
          and(
            eq(websiteMemberships.websiteId, website.id),
            eq(websiteMemberships.userId, params.data.userId),
          ),
        )
        .returning({
          userId: websiteMemberships.userId,
          role: websiteMemberships.role,
          createdAt: websiteMemberships.createdAt,
        });

      if (!updatedMembership) {
        return reply.code(404).send({
          error: 'Website membership not found',
          code: 'WEBSITE_MEMBERSHIP_NOT_FOUND',
        });
      }

      return {
        member: updatedMembership,
      };
    },
  );

  // DELETE /websites/:websiteId/members/:userId
  // Remove an assigned member's website access.
  app.delete<{
    Params: { websiteId: string; userId: string };
  }>(
    '/websites/:websiteId/members/:userId',
    async (request, reply) => {
      const user = await getAuthenticatedUser(request, reply);
      if (!user) return;

      const params = websiteMemberParamsSchema.safeParse(request.params);

      if (!params.success) {
        return reply.code(400).send({
          error: 'Invalid website or user ID',
          code: 'VALIDATION_ERROR',
        });
      }

      const [website] = await db
        .select({
          id: websites.id,
          organizationId: websites.organizationId,
          createdByUserId: websites.createdByUserId,
        })
        .from(websites)
        .where(eq(websites.id, params.data.websiteId))
        .limit(1);

      if (!website) {
        return reply.code(404).send({
          error: 'Website not found',
          code: 'WEBSITE_NOT_FOUND',
        });
      }

      const workspaceMembership = await getWorkspaceMembership(
        website.organizationId,
        user.id,
      );

      if (!workspaceMembership) {
        return reply.code(404).send({
          error: 'Website not found',
          code: 'WEBSITE_NOT_FOUND',
        });
      }

      if (!canManageWorkspace(workspaceMembership.role)) {
        return reply.code(403).send({
          error: 'You do not have permission to manage website members',
          code: 'FORBIDDEN',
        });
      }

      if (params.data.userId === website.createdByUserId) {
        return reply.code(409).send({
          error: 'The website creator cannot be removed from the website',
          code: 'CREATOR_MEMBERSHIP_PROTECTED',
        });
      }

      const [deletedMembership] = await db
        .delete(websiteMemberships)
        .where(
          and(
            eq(websiteMemberships.websiteId, website.id),
            eq(websiteMemberships.userId, params.data.userId),
          ),
        )
        .returning({
          userId: websiteMemberships.userId,
        });

      if (!deletedMembership) {
        return reply.code(404).send({
          error: 'Website membership not found',
          code: 'WEBSITE_MEMBERSHIP_NOT_FOUND',
        });
      }

      return {
        success: true,
        userId: deletedMembership.userId,
      };
    },
  );
};
