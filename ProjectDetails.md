# MoiLekha --- Project Details & Product Architecture

> **Product name:** MoiLekha\
> **Tagline:** Create. Publish. Grow. Earn.\
> **Product category:** AI-powered creator and digital business
> platform\
> **Document status:** Foundational product specification --- living
> document\
> **Version:** 1.0\
> **Last updated:** 19 November 2026

------------------------------------------------------------------------

## 1. Executive Summary

MoiLekha is an AI-powered, open-source creator and digital business
platform that helps individuals, creators, publishers, teams and
businesses build their digital presence and grow it from one workspace.

It combines:

1.  AI-powered website creation.
2.  Visual website editing and customization.
3.  Content management and publishing.
4.  AI-assisted research and content production.
5.  Social media management and distribution.
6.  Audience development, newsletters and memberships.
7.  Monetization tools and business analytics.
8.  Multi-site and multi-brand management.

The central product journey is:

**Create with AI → Build a website → Publish content → Manage social
media → Grow an audience → Earn money.**

MoiLekha is not simply an AI writing tool, blogging platform, website
builder, social scheduler or traditional CMS. It is intended to connect
these workflows into one coherent platform.

The product will be developed as an open-source self-hostable platform,
with the same codebase also supporting a managed hosted SaaS offering.

### Product promise

Give people one place to create their digital presence, publish their
work, reach an audience and build sustainable digital businesses.

### Product principles

-   Useful before impressive: prioritize working customer journeys over
    feature counts.
-   AI-assisted, human-controlled: AI proposes and creates; users
    review, edit and approve.
-   Structured and editable: generated websites and content must remain
    understandable and customizable.
-   Multi-tenant by design: multiple organizations and websites must be
    isolated correctly.
-   Open and portable: avoid unnecessary proprietary infrastructure
    dependencies.
-   Performance-first: public websites must be fast, crawlable and
    accessible.
-   Secure by default: tenant isolation, secrets, permissions and
    publishing workflows are foundational.
-   Incremental delivery: implement a complete vertical slice before
    expanding the architecture.
-   No artificial complexity: do not create microservices, packages or
    abstractions without a real need.

------------------------------------------------------------------------

## 2. Brand and Identity

### 2.1 Brand

**MoiLekha**

The name combines Assamese-inspired words:

-   **Moi (মই):** I.
-   **Lekha (লেখা):** writing or written work.

It evokes personal expression, writing and publishing, while the product
itself is broader than writing.

This cultural association can give the brand a distinctive origin
without restricting its global product ambitions.

### 2.2 Tagline

**Create. Publish. Grow. Earn.**

### 2.3 Positioning statement

MoiLekha is an AI-powered platform for building websites, publishing
content, managing social media, growing audiences and creating digital
businesses.

### 2.4 Brand principles

-   Distinctive and memorable.
-   Friendly but professional.
-   Modern, clean and trustworthy.
-   Global product usability with an authentic identity.
-   Avoid making the brand sound like only an AI article generator or
    blogging application.

### 2.5 Naming and legal status

MoiLekha is the selected working product name. Domain, company-name,
trademark, social-handle and package-name availability have not been
legally cleared.

Before commercial launch:

-   Check relevant Indian trademark classes and registries.
-   Check target international trademark jurisdictions.
-   Check domains and social handles.
-   Check GitHub organization, npm package and other software namespace
    conflicts.
-   Obtain appropriate legal advice before registration and public
    commercial use.

Do not claim the name is legally available until these checks are
completed.

------------------------------------------------------------------------

## 3. Product Vision and Users

### 3.1 Primary users

1.  **Individual creators:** people who want a personal website, blog,
    portfolio, newsletter or digital business.
2.  **Independent publishers:** editorial brands publishing articles,
    explainers, research and news.
3.  **Businesses:** companies needing a website, content marketing,
    social distribution and audience tools.
4.  **Agencies and studios:** teams managing multiple brands and client
    websites.
5.  **Teams:** editors, writers, researchers, marketers and
    administrators collaborating on websites.
6.  **Developers and self-hosters:** people who want to deploy and
    customize an open-source publishing platform.

### 3.2 Core use cases

-   Generate a complete website from a natural-language description.
-   Visually edit the generated website without writing code.
-   Create pages, articles, landing pages and portfolios.
-   Research a subject and create evidence-grounded content.
-   Manage multiple websites and brands from one workspace.
-   Publish articles and distribute them to connected social platforms.
-   Build an audience through newsletters and memberships.
-   Analyze traffic, engagement and revenue.
-   Monetize through subscriptions, memberships, digital products,
    affiliate links and integrations.

### 3.3 Multi-brand operating scenario

The initial internal use case includes three separate publication brands
managed from one central MoiLekha workspace:

1.  **Science publication:** discoveries, space, physics, biology,
    technology, research and explainers.
2.  **Cryptocurrency publication:** Bitcoin, Ethereum, blockchain, DeFi,
    regulation, security and analysis.
3.  **Online business publication:** freelancing, affiliate marketing,
    SaaS, creator economy, online business, tools and documented case
    studies.

These are independent publications, not the MoiLekha platform brand.

Each website should have its own:

-   Domain and identity.
-   Logo, colors, fonts and theme.
-   Pages, articles, authors and editorial settings.
-   Navigation and website configuration.
-   Social accounts and publishing destinations.
-   Newsletter and audience.
-   Analytics and monetization configuration.

A single authorized user should be able to switch between websites
without mixing their data.

------------------------------------------------------------------------

## 4. Product Scope

### 4.1 Core product modules

  -----------------------------------------------------------------------
  Module                              Responsibility
  ----------------------------------- -----------------------------------
  Workspace                           Organizations, teams, memberships
                                      and website switching

  Website management                  Create, configure and manage
                                      multiple websites

  AI Website Studio                   Generate complete website
                                      structures and designs

  Visual Builder                      Edit generated websites using
                                      structured blocks

  Website Runtime                     Render public websites by hostname

  CMS                                 Manage articles, pages, authors,
                                      categories and tags

  Publishing                          Draft, review, schedule and publish
                                      content

  AI Research Studio                  Discover sources, collect evidence
                                      and prepare research

  AI Writing Studio                   Generate and edit content grounded
                                      in selected research

  Social Studio                       Manage social accounts, posts,
                                      scheduling and distribution

  Media Library                       Upload, organize, transform and
                                      reuse assets

  Audience                            Newsletters, subscribers,
                                      memberships and community
                                      integrations

  Analytics                           Website, content, social and
                                      business performance

  Monetization                        Paid memberships, subscriptions,
                                      digital products and revenue
                                      integrations

  Integrations                        External providers, APIs, webhooks
                                      and extensions

  Administration                      Platform settings, usage, plans,
                                      security and audit records
  -----------------------------------------------------------------------

### 4.2 Website creation: two supported website families

MoiLekha must support both:

**A. Media and publication websites** - Homepage and article feeds. -
Article detail pages. - Categories and tags. - Author pages. - Search
and archives. - Editorial navigation. - Newsletter subscription areas. -
Publication identity and metadata.

**B. General websites** - Business websites. - Creator and portfolio
websites. - Agency websites. - Product and SaaS marketing websites. -
Landing pages. - Documentation and resource websites. - Personal
websites.

The generator should infer an appropriate starting structure from the
user's prompt and allow the user to change it.

### 4.3 Product priorities

**Foundational:** identity, organizations, websites, permissions, tenant
isolation, website rendering, structured pages, publishing and
auditability.

**Core differentiator:** AI Website Studio with an editable visual
builder.

**Expansion:** AI research, social distribution, newsletters, audience
and analytics.

**Commercial expansion:** monetization, plans, usage metering, billing
and extension ecosystem.

------------------------------------------------------------------------

## 5. Architecture Decisions

### 5.1 Primary architecture

Use a **modular monolith** initially.

The application should have clear internal modules and boundaries, but
deploy as a small number of understandable applications. Do not turn
every module into a separate network service.

A modular monolith provides:

-   Easier local development.
-   Simpler transactions.
-   Lower infrastructure cost.
-   Easier debugging and testing.
-   Fewer deployment dependencies.
-   A clear path to service extraction if evidence justifies it.

### 5.2 Multi-tenant architecture

One platform serves multiple organizations. Each organization can own
multiple websites.

Conceptual hierarchy:

``` text
MoiLekha Platform
└── Organization
    ├── Organization Members
    ├── Roles and Permissions
    ├── Website A
    │   ├── Domains
    │   ├── Theme and Design
    │   ├── Pages and Articles
    │   ├── Media
    │   ├── Social Accounts
    │   └── Analytics and Monetization
    ├── Website B
    └── Website N
```

Users may belong to multiple organizations. A user may have different
roles in different organizations or websites.

Self-hosted installations may initially be operated by one organization,
but the schema and authorization model should remain compatible with
multiple organizations.

### 5.3 Public website runtime

Use a shared public website runtime capable of serving many websites by
hostname. Do not deploy an entirely separate application for every
customer website by default.

Request flow:

1.  Receive HTTP request.
2.  Normalize and validate the hostname.
3.  Resolve the hostname to a verified, active domain record.
4.  Resolve the owning website.
5.  Load published website configuration, theme and content.
6.  Render through trusted components and templates.
7.  Apply website-aware caching.
8.  Return SEO-friendly HTML and optimized assets.

Domain rules:

-   Domain ownership must be verified before activation.
-   Support platform subdomains first, then custom domains.
-   Normalize hostnames consistently.
-   Reject unknown, unverified or inactive domains.
-   Avoid host-header trust vulnerabilities.
-   Cache keys must include website identity and relevant
    content/version information.
-   Cache invalidation must be scoped to the affected website.
-   Never use a cache key based only on a path shared by multiple
    websites.

Published websites must continue working if AI or social providers are
unavailable.

### 5.4 Deployment boundaries

Initial applications:

-   Admin application.
-   Public website runtime.
-   API.
-   Background worker.
-   Documentation site.

These may be deployed independently when operationally useful, but they
should share a coherent codebase and contracts.

### 5.5 Go decision

Go is **not** the primary backend language for the first release.

The primary backend will use TypeScript and Fastify. Go may be
introduced later for a specialized, measured infrastructure workload,
such as a high-throughput gateway or a CPU/network-intensive component.

Do not introduce Go merely for theoretical performance. A second
language creates additional build, test, deployment and maintenance
responsibilities.

------------------------------------------------------------------------

## 6. Technology Stack --- Locked Baseline

  -----------------------------------------------------------------------
  Layer                   Selected technology     Purpose
  ----------------------- ----------------------- -----------------------
  Language                TypeScript              Primary application
                                                  language

  Package manager         pnpm                    Workspace and
                                                  dependency management

  Monorepo                Turborepo               Task orchestration and
                                                  caching

  Admin frontend          Next.js + React         Workspace and
                                                  management interface

  Public runtime          Next.js + React         Multi-domain website
                                                  rendering

  Backend API             Fastify                 Main application API
                                                  and business logic

  API validation          Zod                     Runtime validation and
                                                  shared schemas

  Database                PostgreSQL              Primary relational data
                                                  store

  ORM and migrations      Drizzle ORM             Typed queries and
                                                  schema migrations

  Authentication          Better Auth (planned    Sessions and
                          selection)              authentication

  Authorization           Application permission  Organization and
                          layer                   website access control

  Editor                  Tiptap                  Rich-text editing

  Visual builder          React + structured      Website customization
                          block system            

  Background queue        BullMQ                  Durable asynchronous
                                                  work

  Cache and queue storage Redis                   Cache, queue
                                                  coordination and
                                                  ephemeral state

  Media storage           S3-compatible object    Images, files and media
                          storage, Cloudflare     
                          R2-compatible for       
                          hosted deployment       

  Search initially        PostgreSQL full-text    Content and website
                          search                  search

  Unit/integration tests  Vitest                  Application tests

  End-to-end tests        Playwright              Browser workflows

  Local infrastructure    Docker Compose          Reproducible
                                                  development and
                                                  self-hosting

  Monitoring              Structured logs and     Operations and
                          error monitoring        diagnostics

  CI                      GitHub Actions          Automated quality
                                                  checks
  -----------------------------------------------------------------------

### 6.1 Why TypeScript + Fastify

TypeScript is the primary choice because the product has a substantial
shared web and integration ecosystem:

-   Next.js and React.
-   Visual website editor and block registry.
-   AI provider SDKs and structured outputs.
-   Social network APIs and OAuth.
-   CMS and content tooling.
-   Shared validation and contracts.
-   Background jobs and webhooks.

Fastify provides a focused, performant HTTP server with a plugin model
and a good TypeScript ecosystem. It keeps the backend independent from
the frontend framework.

### 6.2 Why PostgreSQL

PostgreSQL is the system of record for:

-   Organizations and users.
-   Websites and domains.
-   Pages and articles.
-   Themes and structured layouts.
-   Revisions and editorial workflows.
-   Social account metadata and publishing records.
-   Billing, usage and audit logs.
-   Research projects and evidence records.

Use appropriate indexes, constraints and transactions. Do not add a
separate database until a demonstrated requirement exists.

### 6.3 Why Redis and BullMQ

Use background jobs for:

-   AI website generation.
-   AI research and content generation.
-   Social publishing.
-   Scheduled articles.
-   Media processing.
-   Email delivery.
-   Analytics aggregation.
-   Webhooks and retryable integrations.

Jobs must be idempotent where possible, observable, retryable and safe
against duplicate execution.

### 6.4 Authentication and authorization

Better Auth is the current preferred authentication candidate, subject
to an implementation spike and security review.

Authentication answers who the user is. Authorization answers what that
user can do within a particular organization and website.

Never rely on hidden UI controls as authorization. Every protected API
operation must enforce permissions server-side.

------------------------------------------------------------------------

## 7. Monorepo Structure

Use lowercase directory names. Conventional filenames such as
`README.md`, `LICENSE`, `CONTRIBUTING.md`, `AGENTS.md` and
`ProjectDetails.md` may use their conventional capitalization.

Proposed initial structure:

``` text
moilekha/
├── apps/
│   ├── admin/
│   ├── web/
│   ├── api/
│   ├── worker/
│   └── docs/
├── packages/
│   ├── database/
│   ├── auth/
│   ├── api-contracts/
│   ├── api-client/
│   ├── permissions/
│   ├── config/
│   └── design-system/
├── docs/
│   ├── architecture/
│   ├── decisions/
│   ├── security/
│   ├── development/
│   └── self-hosting/
├── tooling/
│   └── scripts/
├── docker-compose.yml
├── pnpm-workspace.yaml
├── turbo.json
├── package.json
├── README.md
├── CONTRIBUTING.md
├── LICENSE
└── ProjectDetails.md
```

This is the intended direction, not an instruction to create every
possible package immediately.

Add feature packages only when code boundaries and reuse justify them.
Candidate future packages include:

-   `publishing`
-   `editor`
-   `website-builder`
-   `website-renderer`
-   `website-generator`
-   `block-registry`
-   `theme-engine`
-   `media`
-   `ai`
-   `research`
-   `social`
-   `email`
-   `analytics`
-   `billing`

Do not create empty packages simply to match a diagram.

------------------------------------------------------------------------

## 8. Core Data Model

The database schema will evolve through reviewed, versioned migrations.

### 8.1 Identity and workspace

-   `users`
-   `sessions`
-   `accounts`
-   `organizations`
-   `organization_memberships`
-   `invitations`
-   `roles`
-   `permissions` or an equivalent permission representation

### 8.2 Websites and domains

-   `websites`
-   `website_memberships`
-   `domains`
-   `website_settings`
-   `website_publication_settings`
-   `website_secrets` or secure references to external secrets

### 8.3 Design and website structure

-   `themes`
-   `theme_settings`
-   `pages`
-   `page_revisions`
-   `page_layouts`
-   `navigation_menus`
-   `navigation_items`
-   `block_definitions` or versioned block registry metadata
-   `website_revisions`

### 8.4 Content management

-   `articles`
-   `article_revisions`
-   `authors`
-   `categories`
-   `tags`
-   `article_categories`
-   `article_tags`
-   `editorial_tasks`
-   `approvals`
-   `corrections`

### 8.5 Media

-   `media_assets`
-   `media_folders`
-   `media_variants`
-   `media_usage` where useful

### 8.6 AI research and writing

-   `research_projects`
-   `research_sources`
-   `research_extractions`
-   `research_claims`
-   `research_evidence`
-   `research_briefs`
-   `ai_generation_jobs`
-   `ai_generation_results`

### 8.7 Social media

-   `social_accounts`
-   `social_account_assignments`
-   `social_posts`
-   `social_post_variants`
-   `social_publications`
-   `social_schedules`
-   `social_delivery_attempts`

### 8.8 Audience and monetization

Future entities may include:

-   `subscribers`
-   `newsletter_campaigns`
-   `newsletter_deliveries`
-   `memberships`
-   `products`
-   `orders`
-   `subscriptions`
-   `payment_customers`
-   `payment_transactions`
-   `plans`
-   `usage_records`

Payment and subscription design requires careful provider-specific
review before implementation.

### 8.9 Operations and platform administration

-   `scheduled_jobs` where application-level scheduling records are
    needed
-   `job_attempts` where useful beyond queue internals
-   `webhook_endpoints`
-   `webhook_deliveries`
-   `audit_logs`
-   `api_keys`
-   `platform_settings`

Do not duplicate queue internals in PostgreSQL without a clear
operational reason.

### 8.10 Tenant ownership rules

-   Organization-owned records carry an `organization_id`.
-   Website-owned records carry a `website_id`.
-   Where both are stored, database constraints or application
    invariants must ensure the website belongs to the organization.
-   Use composite uniqueness and foreign-key constraints where
    appropriate.
-   Resolve tenant scope from authenticated membership and server-side
    records, not from untrusted browser-supplied IDs.
-   PostgreSQL Row-Level Security may be added where it improves defense
    in depth, but it does not replace application authorization.
-   Test cross-tenant access explicitly.

------------------------------------------------------------------------

## 9. AI Website Studio

This is one of MoiLekha's primary differentiators.

### 9.1 User journey

1.  User creates a website.
2.  User describes the website in natural language.
3.  User provides optional brand details, audience, industry, examples
    and preferences.
4.  AI plans the website structure.
5.  AI proposes pages, navigation, design tokens and content structure.
6.  AI generates a structured website specification.
7.  The system validates it against versioned schemas and supported
    blocks.
8.  The trusted renderer produces a preview.
9.  User edits the result visually.
10. User saves revisions and previews responsive layouts.
11. User publishes to a platform subdomain or verified custom domain.
12. User continues managing the site through MoiLekha.

### 9.2 Generated website capabilities

The generator should be able to create:

-   Homepage.
-   About page.
-   Contact page.
-   Service or product pages.
-   Article index and article templates.
-   Category and tag pages.
-   Portfolio and case-study pages.
-   Landing pages.
-   Navigation and footer.
-   Calls to action.
-   Responsive layout choices.
-   Typography and color systems.
-   SEO defaults.
-   Social sharing metadata.
-   Appropriate placeholder content and media guidance.

The generated result must be editable and maintainable.

### 9.3 Structured generation, not arbitrary code

AI must not be allowed to execute arbitrary generated React, JavaScript,
HTML or server code.

Instead:

1.  Define a versioned website schema.
2.  Define a trusted block/component registry.
3.  Ask the AI to return a structured specification.
4.  Validate the output using Zod or equivalent schemas.
5.  Validate block properties, nesting, limits and references.
6.  Render only trusted, registered components.
7.  Save the specification and revisions in PostgreSQL.
8.  Store media assets in object storage.

Example conceptual structure:

``` json
{
  "schemaVersion": 1,
  "website": {
    "name": "Example Studio",
    "theme": {
      "colors": {},
      "typography": {},
      "spacing": {}
    },
    "pages": [
      {
        "slug": "/",
        "title": "Home",
        "blocks": [
          {
            "type": "hero",
            "version": 1,
            "props": {}
          }
        ]
      }
    ]
  }
}
```

This is illustrative, not the final schema.

### 9.4 Visual builder capabilities

The editor should support:

-   Select and edit blocks.
-   Add, remove, duplicate and reorder sections.
-   Edit text and links.
-   Replace images and logos.
-   Change colors, fonts and design tokens.
-   Configure layouts and spacing.
-   Add and configure navigation.
-   Preview desktop, tablet and mobile.
-   Undo and redo.
-   Save drafts and revisions.
-   Restore an earlier revision.
-   Preview unpublished changes.
-   Ask AI to modify a selected section or page.

### 9.5 Editor scope

Do not attempt to reproduce every capability of Wix's unrestricted
editor immediately.

Start with a high-quality structured block editor. Use a controlled
layout system with reliable responsive behavior.

The user should be able to make meaningful changes without code, while
generated websites remain predictable and safe.

### 9.6 Revision and publishing model

-   Draft changes must not silently overwrite the live site.
-   Preview should show the intended draft revision.
-   Publishing should create a clear published version.
-   Revisions should be recoverable.
-   AI edits should be reviewable and reversible.
-   Cache invalidation should occur after successful publication.

------------------------------------------------------------------------

## 10. Website Renderer and Themes

The renderer turns validated website specifications into public pages.

### Requirements

-   Trusted block registry.
-   Versioned block schemas.
-   Theme tokens.
-   Responsive rendering.
-   Server-rendered, crawlable content.
-   Correct canonical URLs.
-   Metadata and social previews.
-   Structured data where appropriate.
-   Sitemap and robots support.
-   Accessible semantic HTML.
-   Optimized images and fonts.
-   Minimal unnecessary client-side JavaScript.
-   Safe URL and link handling.
-   Per-website caching and invalidation.

Themes should use design tokens rather than arbitrary generated CSS as
the default mechanism.

The theme system should support:

-   Colors.
-   Typography.
-   Font families and weights.
-   Spacing.
-   Width and container settings.
-   Border radius.
-   Shadows.
-   Button styles.
-   Layout variants.
-   Light/dark preferences where appropriate.

A theme should be reusable, versioned and independently configurable per
website.

------------------------------------------------------------------------

## 11. CMS and Publishing Studio

### 11.1 Content types

-   Articles.
-   Static pages.
-   Landing pages.
-   Authors.
-   Categories.
-   Tags.
-   Media and embeds.
-   Future custom content types, if justified.

### 11.2 Article fields

An article may include:

-   Title.
-   Slug.
-   Excerpt.
-   Rich-text body.
-   Featured image.
-   Author.
-   Categories and tags.
-   SEO title and description.
-   Canonical URL.
-   Social preview.
-   Status.
-   Scheduled publication time.
-   Published timestamp.
-   Revision history.

### 11.3 Editorial workflow

Initial statuses:

-   Draft.
-   In review.
-   Changes requested.
-   Approved.
-   Scheduled.
-   Published.
-   Archived.

The system should support autosave, revision history, preview, approval
and scheduling.

Permissions must control who can create, edit, approve, publish and
delete content.

### 11.4 Publishing reliability

-   Scheduled publication must be handled by background jobs.
-   Use idempotency and safe retries.
-   Record publication outcomes.
-   Avoid duplicate publishing.
-   Preserve a clear audit trail.
-   Do not claim content is published merely because a job was queued.

------------------------------------------------------------------------

## 12. AI Research Studio

AI research should be an evidence-oriented workspace, not merely a
prompt box that generates articles.

### 12.1 Workflow

1.  User starts a research project with a topic, question, announcement
    or URL.
2.  The system discovers relevant sources through permitted search and
    integrations.
3.  It records source metadata and original URLs.
4.  It extracts useful passages, dates, figures and claims.
5.  It associates claims with supporting, contradicting, uncertain or
    missing evidence.
6.  It creates a research brief.
7.  The user reviews and selects evidence.
8.  AI prepares an outline or draft grounded in the selected material.
9.  Human editorial review occurs before publication.

### 12.2 Provenance requirements

-   Preserve source URLs.
-   Record source title, publisher and publication date when available.
-   Distinguish direct evidence from AI inference.
-   Keep quotations exact and traceable.
-   Never fabricate citations, quotations, figures or source details.
-   Do not treat model confidence as proof.
-   Make uncertainty visible.
-   Respect copyright and source terms.
-   Keep a record of which sources informed generated content.

### 12.3 Publication-specific editorial safeguards

**Science** - Distinguish peer-reviewed research from preprints. -
Preserve study limitations and uncertainty. - Avoid overstating
causality. - Identify original research and institutional sources.

**Cryptocurrency** - Prefer primary protocol documentation, regulatory
sources and transparent on-chain evidence where relevant. - Disclose
conflicts of interest. - Distinguish analysis, speculation and confirmed
facts. - Treat security incidents and financial claims carefully.

**Online business** - Verify product features and pricing. - Distinguish
tested results from claims. - Do not invent income figures, testimonials
or case studies. - Disclose affiliate relationships and commercial
incentives.

------------------------------------------------------------------------

## 13. Social Media Studio

Social management is a full product area, not only an article-sharing
button.

### 13.1 Capabilities

-   Connect social accounts using supported OAuth flows.
-   Assign accounts to organizations and websites.
-   Create standalone social posts.
-   Generate platform-specific post variants.
-   Turn articles into social content.
-   Edit copy and media for each platform.
-   Preview platform-specific formatting.
-   Schedule posts.
-   Publish immediately.
-   Manage a content calendar.
-   Track delivery status and errors.
-   View available engagement and performance metrics.
-   Reuse content responsibly.

Potential platforms include Facebook, Instagram, X, LinkedIn, YouTube,
Pinterest and Telegram. Actual capabilities differ by provider, account
type, permissions, region and API policy.

### 13.2 Provider adapter design

Each provider adapter should define:

-   OAuth and token lifecycle.
-   Supported account types.
-   Supported post formats.
-   Text and media limits.
-   Media upload requirements.
-   Scheduling capabilities.
-   Rate limits.
-   Retry rules.
-   Error classification.
-   Publication status lookup.
-   Available analytics.

Do not assume all platforms permit the same publishing operations.

### 13.3 Reliability and security

-   Encrypt access and refresh tokens.
-   Keep tokens out of client-side code and logs.
-   Support revocation and reconnection.
-   Use idempotency keys.
-   Implement safe retries and rate limits.
-   Store external post IDs.
-   Track attempts and delivery status.
-   Respect provider terms and user permissions.
-   Never display a successful-publication state until the provider
    confirms it.

------------------------------------------------------------------------

## 14. Audience, Newsletters and Monetization

This area is part of the long-term product vision. Implement it after
the core website, CMS and publishing journeys work reliably.

### 14.1 Audience

Potential capabilities:

-   Subscriber collection.
-   Newsletter signup forms.
-   Audience segmentation.
-   Newsletter campaigns.
-   Subscriber preferences and unsubscribe.
-   Import/export with consent safeguards.
-   Membership and community integrations.

### 14.2 Monetization

Potential revenue models:

-   Paid memberships.
-   Recurring subscriptions.
-   Premium articles and content.
-   Digital downloads and products.
-   Courses and resources.
-   Affiliate links.
-   Sponsorship and advertising integrations.
-   Donations and tips.
-   External commerce integrations.

### 14.3 Payment architecture

Do not hardwire the product to one payment provider.

Use provider adapters and a clear internal accounting model.

Requirements:

-   Record amounts, currency and payment state accurately.
-   Maintain auditable transaction records.
-   Handle webhooks idempotently.
-   Verify webhook signatures.
-   Handle refunds, disputes and subscription changes.
-   Avoid storing raw payment-card details.
-   Respect regional payment availability and applicable regulations.

Do not promise automatic income. MoiLekha provides tools that help users
create and monetize; actual earnings depend on the user's business,
audience and execution.

### 14.4 SaaS billing

The hosted MoiLekha service may eventually provide:

-   Free and paid plans.
-   Usage metering.
-   Website and member limits.
-   AI usage allowances.
-   Storage and publishing limits.
-   Subscription billing.
-   Invoices and payment history.
-   Plan upgrades and downgrades.

Keep platform billing separate from the monetization tools users operate
on their own websites.

------------------------------------------------------------------------

## 15. Analytics

Build analytics incrementally.

Possible measurements:

**Website** - Visits and page views. - Referrers. - Landing pages. -
Device and geography at an appropriately aggregated level. - Search and
content performance.

**Content** - Published articles. - Views by article. - Engagement. -
Newsletter conversions. - Content performance over time.

**Social** - Publication success/failure. - Available reach and
engagement metrics. - Account-level performance where providers permit.

**Business** - Subscriber growth. - Membership conversion. - Revenue and
refunds. - Product sales. - Campaign performance.

Privacy, consent, retention and applicable legal requirements must be
considered before collecting visitor data.

Avoid building a complex analytics warehouse in the initial release.
Start with reliable event definitions and useful reporting.

------------------------------------------------------------------------

## 16. Security and Trust

Security is foundational because the platform handles many
organizations, websites, domains, user accounts, media files, AI
integrations and social credentials.

### 16.1 Tenant isolation

-   Enforce organization and website permissions server-side.
-   Derive scope from authenticated membership.
-   Never trust tenant IDs supplied by a browser.
-   Use database constraints to prevent inconsistent ownership.
-   Consider PostgreSQL Row-Level Security as defense in depth.
-   Include tenant identity in cache keys and storage access policies.
-   Test cross-tenant reads, writes, exports and background jobs.

### 16.2 Authentication and sessions

-   Secure session handling.
-   Appropriate CSRF protections.
-   Secure cookies.
-   Rate limits for authentication endpoints.
-   Account recovery safeguards.
-   Optional MFA when supported.
-   Session revocation and device/session management.

### 16.3 Secrets

-   Encrypt OAuth and provider credentials at rest.
-   Keep secrets out of client bundles and logs.
-   Use environment variables or a secret manager appropriate to
    deployment.
-   Rotate credentials where supported.
-   Scope API keys and support revocation.

### 16.4 AI and research security

-   Treat retrieved web pages and uploaded documents as untrusted data.
-   Defend against prompt injection.
-   Do not let source content override system policies or permissions.
-   Restrict tool access and outbound requests.
-   Validate all AI-generated structured data.
-   Prevent generated content from executing arbitrary code.
-   Add controls against SSRF in URL fetching and media imports.

### 16.5 Uploads and media

-   Validate file type and content.
-   Apply file-size limits.
-   Generate safe storage names.
-   Scan or isolate risky uploads as appropriate.
-   Prevent path traversal.
-   Use signed URLs or controlled access for private assets.
-   Process images safely and limit decompression/resource abuse.

### 16.6 Operational security

-   Audit sensitive actions.
-   Back up PostgreSQL and object storage.
-   Test restoration.
-   Version migrations.
-   Keep dependencies updated.
-   Add rate limiting and abuse controls.
-   Monitor background job failures.
-   Maintain a security disclosure process before public launch.

------------------------------------------------------------------------

## 17. Performance, SEO and Accessibility

Public websites are a central product output. They must not inherit the
complexity of the admin application.

### 17.1 Performance

-   Server-render public content where appropriate.
-   Keep client JavaScript minimal.
-   Optimize and resize media.
-   Use CDN delivery.
-   Cache by website and content revision.
-   Avoid unnecessary runtime API calls for static published content.
-   Use efficient database indexes and query patterns.
-   Monitor Core Web Vitals and real-user performance where feasible.

### 17.2 SEO and discoverability

Each public website should support:

-   Unique titles and descriptions.
-   Canonical URLs.
-   Open Graph metadata.
-   Social preview images.
-   JSON-LD structured data where appropriate.
-   XML sitemap.
-   Robots directives.
-   Semantic headings and links.
-   Crawlable article and page content.
-   RSS or Atom feeds for publication sites.
-   Redirect management.
-   Custom domain support.

The platform should also expose appropriate documentation and product
metadata for search engines and AI answer systems without making
unsupported claims.

### 17.3 Accessibility

-   Semantic HTML.
-   Keyboard navigation.
-   Visible focus states.
-   Appropriate color contrast.
-   Accessible forms and validation.
-   Editor accessibility.
-   Responsive layouts.
-   Respect reduced-motion preferences.

------------------------------------------------------------------------

## 18. Open Source and Hosted SaaS

Both distribution models should use the same core codebase.

### 18.1 Self-hosted edition

Users should be able to operate MoiLekha on their own infrastructure.

Expected configuration:

-   PostgreSQL.
-   Redis.
-   Object storage or S3-compatible service.
-   Application services.
-   Worker.
-   Environment-based provider configuration.
-   Docker Compose deployment.
-   Backup and restore documentation.
-   Upgrade and migration instructions.

Self-hosted users may supply their own AI and social provider
credentials.

### 18.2 Hosted SaaS

The managed edition may provide:

-   Managed application hosting.
-   Managed database and storage.
-   Backups and monitoring.
-   Custom-domain assistance.
-   Usage limits and billing.
-   Optional managed AI credits.
-   Team collaboration.
-   Support and operational services.

SaaS-specific services must not make the core self-hosted product
unusable.

### 18.3 Licensing

License has not yet been selected.

Evaluate MIT, Apache-2.0 and AGPL-3.0 based on the project's goals,
contributor model, SaaS strategy and legal advice.

Do not publish a license choice until it is deliberately approved.

------------------------------------------------------------------------

## 19. Testing and Quality Strategy

Testing must protect the most important product invariants.

### 19.1 Unit tests

-   Domain and business rules.
-   Permissions.
-   Schema validation.
-   Website block validation.
-   Theme token validation.
-   Publishing state transitions.
-   Provider adapter logic.
-   Job idempotency.

### 19.2 Integration tests

-   Database operations.
-   Authentication and authorization.
-   Organization and website membership.
-   Tenant-scoped queries.
-   Domain resolution.
-   Publishing and scheduling.
-   Object storage integration.
-   Webhook verification.
-   Background job retries.

### 19.3 End-to-end tests

-   Sign up and sign in.
-   Create organization.
-   Create website.
-   Generate website.
-   Edit website visually.
-   Preview and publish.
-   Add an article.
-   Review and schedule an article.
-   Resolve platform and custom domains.
-   Connect a social account in a controlled test environment.
-   Publish and verify status.

### 19.4 Critical isolation tests

At minimum, test:

-   Organization A cannot read Organization B's data.
-   Website A cannot access Website B's private records.
-   Unauthorized members cannot publish.
-   A background job cannot cross tenant boundaries.
-   Cached public pages cannot leak between websites.
-   Domain ownership cannot be bypassed.
-   Revoked social credentials cannot be reused.

### 19.5 Quality gates

Before merging meaningful changes:

-   Type checking passes.
-   Linting passes.
-   Relevant unit and integration tests pass.
-   Migrations are reviewed.
-   No secrets are committed.
-   User-facing flows are checked.
-   Relevant accessibility and performance issues are addressed.

Do not claim a test passed unless it was actually run and its output
inspected.

------------------------------------------------------------------------

## 20. Implementation Roadmap

Build in vertical slices. Each phase must produce a working, testable
result.

### Phase 0 --- Repository and engineering foundation

-   Create repository.
-   Configure pnpm workspace and Turborepo.
-   Establish TypeScript conventions.
-   Add linting, formatting and type checking.
-   Add initial CI.
-   Add Docker Compose for local PostgreSQL and Redis.
-   Document environment variables.
-   Create architecture decision records.
-   Establish local development workflow.

**Exit criteria:** A clean clone can install dependencies, start
required infrastructure and run checks using documented commands.

### Phase 1 --- Identity, organizations and tenant isolation

-   Authentication.
-   Users and sessions.
-   Organization creation.
-   Organization memberships.
-   Roles and permissions.
-   Website records.
-   Website membership and access.
-   Audit logs.
-   Basic admin shell and workspace switcher.

**Exit criteria:** Two separate organizations can manage their own
websites without cross-tenant access. Critical isolation tests pass.

### Phase 2 --- Website foundation and renderer

-   Website settings.
-   Platform subdomains.
-   Domain records and verification design.
-   Theme tokens.
-   Versioned block registry.
-   Trusted renderer.
-   Pages and navigation.
-   Draft and published versions.
-   Public hostname resolution.
-   Preview.
-   Website-aware caching.

**Exit criteria:** Users can create a basic website, preview it and
publish it through the shared runtime.

### Phase 3 --- AI Website Studio and visual builder

-   Website prompt intake.
-   AI provider abstraction.
-   Structured website specification.
-   Versioned schemas.
-   AI planning and generation jobs.
-   Homepage and page generation.
-   Theme generation.
-   Trusted rendering and preview.
-   Visual block editor.
-   Logo, image, text, color and font editing.
-   Section insertion, removal and reordering.
-   Responsive preview.
-   Undo/redo and revision restore.
-   AI-assisted section edits.

**Exit criteria:** A user can generate an editable website from a
prompt, customize it visually, save revisions, preview and publish it.

### Phase 4 --- CMS and publishing

-   Article and page management.
-   Tiptap integration.
-   Authors, categories and tags.
-   Autosave.
-   Revision history.
-   SEO fields.
-   Editorial statuses.
-   Approval and review.
-   Scheduling.
-   Publication worker.
-   RSS or Atom feeds.

**Exit criteria:** A user can operate and publish a content website
without developer assistance.

### Phase 5 --- Initial publication brands

-   Set up the science publication.
-   Set up the cryptocurrency publication.
-   Set up the online business publication.
-   Configure independent identities and domains.
-   Establish editorial workflows.
-   Test centralized management.
-   Validate separation of content, media, social accounts and
    analytics.

**Exit criteria:** Three independent publication websites operate from
one MoiLekha workspace without data or brand mixing.

### Phase 6 --- AI Research Studio

-   Research projects.
-   Source discovery integrations.
-   Source metadata and provenance.
-   Claim and evidence records.
-   Research briefs.
-   Outlines and grounded drafts.
-   Editorial review.
-   Source attribution and uncertainty controls.

**Exit criteria:** A user can research a topic, inspect supporting
evidence and create a reviewable draft with traceable sources.

### Phase 7 --- Social Media Studio

-   Social account connections.
-   OAuth and secure token storage.
-   Provider adapter contracts.
-   Standalone social posts.
-   Article distribution.
-   Platform-specific variants.
-   Calendar and scheduling.
-   Publishing jobs.
-   Delivery attempts and error handling.
-   Supported analytics.

**Exit criteria:** Users can connect supported accounts, prepare content
and reliably publish or schedule supported post formats.

### Phase 8 --- Audience, analytics and monetization

-   Subscriber management.
-   Newsletter workflows.
-   Audience segmentation.
-   Website and content analytics.
-   Social performance.
-   Memberships.
-   Digital products.
-   Payment adapters.
-   Subscription and usage metering.
-   SaaS plans and billing.

**Exit criteria:** A user can understand audience and content
performance and operate at least one supported monetization journey.

### Phase 9 --- Open-source and hosted launch

-   License decision.
-   Security review.
-   Documentation.
-   Self-hosting guide.
-   Docker Compose release.
-   Upgrade and backup procedures.
-   Environment examples.
-   Contribution guide.
-   Issue templates.
-   Release process.
-   Hosted SaaS operational readiness.

**Exit criteria:** An external developer can deploy, configure, operate,
upgrade and contribute to MoiLekha using public documentation.

------------------------------------------------------------------------

## 21. MVP Definition

The MVP is not every feature listed in this document.

The first meaningful customer journey is:

1.  User signs up.
2.  User creates an organization.
3.  User creates a website.
4.  User describes the desired website to AI.
5.  AI generates a structured, editable website.
6.  User customizes logo, text, images, colors and sections.
7.  User previews desktop and mobile layouts.
8.  User publishes to a platform subdomain.
9.  User creates and publishes an article.
10. User returns to edit the website and content.

The initial release must prioritize a reliable website-generation,
editing and publishing experience.

Social automation, advanced research, billing and monetization are
important parts of the broader vision but should not delay the first
complete website journey.

------------------------------------------------------------------------

## 22. Explicit Non-Goals for the Initial Release

Do not attempt these prematurely:

-   Recreating every feature of Wix's unrestricted freeform editor.
-   Executing arbitrary AI-generated React or JavaScript.
-   Building a foundation model.
-   Supporting hundreds of social networks.
-   Building a full video editor.
-   Building an advertising exchange or ad network.
-   Launching a plugin marketplace before stable extension contracts
    exist.
-   Deploying one application instance per customer website by default.
-   Introducing Kubernetes without an operational need.
-   Splitting every module into a microservice.
-   Building a complex analytics warehouse before defining useful
    metrics.
-   Implementing every payment provider at once.
-   Supporting every possible custom content type before core CMS
    workflows work.

------------------------------------------------------------------------

## 23. Engineering Working Agreements

These rules apply throughout development.

### 23.1 Incremental implementation

-   Work on one coherent step at a time.
-   Inspect the current repository before changing it.
-   Avoid replacing working code without understanding it.
-   Run relevant checks after each meaningful change.
-   Inspect actual output before claiming success.
-   Keep changes small enough to review and debug.

### 23.2 File and folder naming

-   Use lowercase names for directories and new file names wherever
    practical.
-   Preserve conventional names such as `README.md`, `LICENSE`,
    `CONTRIBUTING.md`, `AGENTS.md` and this `ProjectDetails.md`.
-   Use consistent naming within each module.

### 23.3 Windows development workflow

The initial development environment is Windows with PowerShell.

-   Provide PowerShell commands for filesystem inspection and
    operations.
-   Provide exact target paths for source files.
-   Provide source code separately for manual editing where requested.
-   Do not use `Set-Content` to inject large source files.
-   Do not assume Unix shell commands are available in PowerShell.
-   Keep commands copy-paste-ready.
-   Avoid destructive operations unless explicitly explained and
    approved.

### 23.4 Dependency discipline

-   Prefer stable, maintained libraries.
-   Check compatibility before installing.
-   Avoid redundant dependencies.
-   Avoid adding a package for a trivial helper.
-   Keep dependency versions and lockfiles consistent.
-   Document meaningful infrastructure dependencies.

### 23.5 Documentation

Keep this document as the product-level source of truth.

Create focused supporting documents when needed:

-   Architecture decision records in `docs/decisions/`.
-   Database design in `docs/architecture/`.
-   Threat model in `docs/security/`.
-   Local setup in `docs/development/`.
-   Deployment and upgrades in `docs/self-hosting/`.

When an important product or technology decision changes, update this
document and record the rationale in an ADR.

### 23.6 No false completion

A feature is not complete because:

-   A directory exists.
-   A component renders a placeholder.
-   An API route returns a hardcoded response.
-   A job was queued.
-   A provider account was selected.
-   A migration file was created but not tested.

Completion requires the intended behavior, authorization, error
handling, tests and documentation appropriate to the scope.

------------------------------------------------------------------------

## 24. Open Decisions to Resolve Deliberately

These are not silently assumed to be finalized.

1.  Final trademark and domain clearance for MoiLekha.
2.  Open-source license.
3.  Final authentication configuration and MFA policy.
4.  Initial AI provider selection and user-supplied versus managed keys.
5.  Exact website block registry and schema versioning strategy.
6.  Custom-domain verification and certificate automation.
7.  Initial object-storage deployment configuration.
8.  Initial email delivery provider.
9.  First social platforms and required API permissions.
10. First payment providers and supported countries/currencies.
11. Privacy and analytics defaults.
12. SaaS plans, quotas and billing model.
13. Backup retention and disaster-recovery objectives.
14. Hosted infrastructure and deployment topology.

Resolve each decision when its implementation phase approaches. Do not
prematurely build speculative infrastructure around unresolved choices.

------------------------------------------------------------------------

## 25. Long-Term Success Criteria

MoiLekha should eventually allow a creator, publisher or business to
operate most of its digital presence from one platform.

A successful platform should enable users to:

-   Create a professional website without coding.
-   Keep the website editable after AI generation.
-   Publish and manage content independently.
-   Research and produce better-supported content.
-   Distribute content and standalone posts across supported social
    networks.
-   Build a direct audience.
-   Understand performance.
-   Monetize their work through supported revenue models.
-   Manage several brands and websites from one workspace.
-   Export and back up their data.
-   Self-host the platform or choose the managed SaaS offering.

### Product north star

**Help people turn ideas into owned digital properties, owned audiences
and sustainable digital businesses.**

------------------------------------------------------------------------

## 26. Immediate Next Steps

Do not start by implementing every module.

The immediate engineering sequence is:

1.  Confirm the repository directory and whether an existing project or
    specification file is present.
2.  Create or inspect the Git repository.
3.  Initialize pnpm workspace and Turborepo.
4.  Establish root TypeScript, lint and formatting configuration.
5.  Add Docker Compose for PostgreSQL and Redis.
6.  Create the first minimal applications: `admin`, `web`, `api` and
    `worker`.
7.  Add CI and verify a clean build.
8.  Record the architecture decision for TypeScript + Fastify +
    PostgreSQL + Redis.
9.  Begin Phase 1 with authentication, organizations and tenant
    isolation.

The first milestone is a clean, reproducible development
environment---not a large set of empty feature packages.

------------------------------------------------------------------------

## 27. Change Log

### Version 1.0 --- 19 November 2026

-   Established MoiLekha as the working product name.
-   Defined the product as an AI-powered creator and digital business
    platform.
-   Adopted the tagline "Create. Publish. Grow. Earn."
-   Confirmed support for publication websites and general
    business/creator websites.
-   Confirmed AI website generation and visual editing as core
    capabilities.
-   Confirmed full social media management as a product area.
-   Confirmed open-source self-hosted and hosted SaaS directions.
-   Selected a multi-tenant modular monolith as the initial
    architecture.
-   Selected TypeScript + Fastify as the primary backend.
-   Selected Next.js + React for frontend and public runtime.
-   Selected PostgreSQL + Drizzle, Redis + BullMQ, pnpm + Turborepo.
-   Deferred Go to specialized workloads only if justified.
-   Defined the research, CMS, social, audience, analytics and
    monetization roadmaps.
-   Established security, testing and engineering working agreements.

------------------------------------------------------------------------

**End of document.**
