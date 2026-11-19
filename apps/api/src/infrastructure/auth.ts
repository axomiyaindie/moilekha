
import { randomUUID } from 'node:crypto';

import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { betterAuth } from 'better-auth';
import { eq } from 'drizzle-orm';

import { env } from '../config/env.js';
import {
  accounts,
  memberships,
  organizations,
  sessions,
  users,
  verifications,
} from '../db/schema/index.js';
import { db } from './database.js';

async function ensurePersonalWorkspace(user: {
  id: string;
  name: string;
}): Promise<void> {
  const slug = `personal-${user.id}`;

  await db.transaction(async (tx) => {
    let [organization] = await tx
      .select({
        id: organizations.id,
        createdByUserId: organizations.createdByUserId,
      })
      .from(organizations)
      .where(eq(organizations.slug, slug))
      .limit(1);

    if (!organization) {
      const [createdOrganization] = await tx
        .insert(organizations)
        .values({
          name: `${user.name}'s Workspace`,
          slug,
          createdByUserId: user.id,
        })
        .onConflictDoNothing()
        .returning({
          id: organizations.id,
          createdByUserId: organizations.createdByUserId,
        });

      organization = createdOrganization;

      if (!organization) {
        [organization] = await tx
          .select({
            id: organizations.id,
            createdByUserId: organizations.createdByUserId,
          })
          .from(organizations)
          .where(eq(organizations.slug, slug))
          .limit(1);
      }
    }

    if (!organization || organization.createdByUserId !== user.id) {
      throw new Error('Failed to provision the personal workspace.');
    }

    await tx
      .insert(memberships)
      .values({
        organizationId: organization.id,
        userId: user.id,
        role: 'owner',
      })
      .onConflictDoNothing();
  });
}

export const auth = betterAuth({
  appName: 'MoiLekha',
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.FRONTEND_URL],

  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await ensurePersonalWorkspace({
            id: user.id,
            name: user.name,
          });
        },
      },
    },

    session: {
      create: {
        after: async (session) => {
          const [user] = await db
            .select({
              id: users.id,
              name: users.name,
            })
            .from(users)
            .where(eq(users.id, session.userId))
            .limit(1);

          if (user) {
            await ensurePersonalWorkspace(user);
          }
        },
      },
    },
  },

  emailAndPassword: {
    enabled: true,
  },

  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    storage: 'memory',
    customRules: {
      '/sign-in/email': {
        window: 60,
        max: 5,
      },
      '/sign-up/email': {
        window: 60,
        max: 3,
      },
    },
  },

  user: {
    fields: {
      image: 'avatarUrl',
    },
  },

  advanced: {
    disableOriginCheck: false,

    database: {
      generateId: (options) => {
        if (options.model === 'user') {
          return false;
        }

        return randomUUID();
      },
    },
  },
});
