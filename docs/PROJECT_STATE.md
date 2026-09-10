# Konkourix Project State

This document is the canonical operational memory for resuming work on the Konkourix repository. It records verified repository reality through Phase 0 Milestone 5 and baseline re-verification, not a claim of overall product completion.

## Project

Konkourix is a multi-user educational planning platform with independent public entry points:

- Student application: `app.konkourix.ir`
- Counselor application: `counselor.konkourix.ir`
- API: `api.konkourix.ir`

## Current Phase

The project is currently completing **Phase 0 — Architecture & Infrastructure / Foundation**.

Phase 0 is not complete. Some Phase 1 and later backend foundations already exist ahead of the intended phase order, including authentication, student planning, study sessions, and goals. Their presence does not imply the corresponding product phases or browser experiences are complete.

- Phase 0 completion estimate: **50%**
- Confidence: **HIGH**
- Audit and baseline re-verification date: **2026-09-09**

## Milestone 5 Baseline Git Checkpoint

- HEAD: `e960df62a68a4046affa13625c17a8800ccb0966`
- Message: `feat: establish docker compose infrastructure foundation`

Foundation repair checkpoint:

- Commit: `5fffa805d99e1fc870410c3b5115b2924059399f`
- Message: `fix: repair core foundation data semantics`

Study Tracking recovery checkpoint:

- Commit: `8905e381fdcf820bc058a7acd81fc794c7cbfc08`
- Message: `feat: complete student study tracking recovery`

## Verified Baseline

Re-verified on 2026-09-09 after successful local dependency-state recovery:

- Working tree before this documentation update: clean
- API tests: **49/49 PASS**
- API type-check: **PASS**
- API production build: **PASS**
- Student Web lint and production build: **PASS**
- Counselor Web lint and production build: **PASS**
- Prisma schema validation: **PASS**
- PostgreSQL migration status: **PASS**; 5 migrations found and the database is up to date
- Package manifests and `pnpm-lock.yaml`: unchanged by dependency recovery

## Phase 0 Audit Status

| Area | Status |
| --- | --- |
| Backend foundation | MOSTLY COMPLETE |
| Database foundation | MOSTLY COMPLETE |
| Environment and security | PARTIAL |
| Student Web | SCAFFOLDED ONLY |
| Counselor Web | SCAFFOLDED ONLY |
| Shared packages | SCAFFOLDED ONLY |
| Development workflow | HARDENED; LOCAL VALIDATION COMPLETE |
| Container image definitions | COMPLETE; RUNTIME UNVERIFIED |
| Docker Compose | FOUNDATION COMPLETE; RUNTIME UNVERIFIED |
| Edge Nginx | FOUNDATION COMPLETE; SYNTAX/RUNTIME UNVERIFIED |
| Deployment | NOT STARTED |
| Backup/Restore | NOT STARTED |
| CI/CD | NOT STARTED |
| Documentation | PARTIAL |

## Completed Phase 0 Milestones

### Milestone 1 — Runtime & Browser Environment Contract

**Status: COMPLETE**

Completed and locally verified on 2026-09-09:

- Central API runtime validation covers public origins, the explicit CORS allowlist, optional cookie domain, and explicit trusted-proxy addresses.
- Production public origins require HTTPS, and both browser application origins must be included in production CORS configuration.
- Student Web and Counselor Web each require their own build-time `VITE_API_URL`; production builds reject non-HTTPS API origins.
- Local ports are explicit: API 4000, Student Web 5173, and Counselor Web 5174.
- Browser CORS is exact-origin and credentialed. Unknown origins are rejected, while requests without an `Origin` header preserve non-browser behavior.
- Refresh cookies are `HttpOnly`, `SameSite=Lax`, limited to `/v1/auth`, `Secure` in production, and host-only by default. Logout clears them with matching attributes.
- Proxy headers are ignored by default. Proxy trust accepts only configured IP/CIDR entries and rejects trust-all and hop-count-only values.
- Local development remains Docker-independent. No Docker, Nginx, deployment, database schema, or migration work is part of this milestone.

Intended production browser/runtime values are `API_URL=https://api.konkourix.ir`, `STUDENT_APP_URL=https://app.konkourix.ir`, `COUNSELOR_APP_URL=https://counselor.konkourix.ir`, and a `CORS_ORIGINS` list containing both application origins. Each frontend uses `VITE_API_URL=https://api.konkourix.ir`. `COOKIE_DOMAIN` should remain empty for the preferred host-only API cookie. `TRUST_PROXY` remains disabled until a controlled ingress exists, then must name that proxy by IP/CIDR.

Milestone verification:

- API tests: **61/61 PASS**
- API type-check: **PASS**
- API production build: **PASS**
- Student Web lint and production build: **PASS**
- Counselor Web lint and production build: **PASS**
- Prisma schema validation: **PASS**

The official Phase 0 completion estimate remains **50%** because the existing project state has no milestone weighting rubric from which to calculate a defensible new percentage. Confidence remains **HIGH** based on the completed validation above.

### Milestone 2 — Production Container Build Foundation

**Status: COMPLETE (STATICALLY VERIFIED; DOCKER EXECUTION PENDING)**

Completed and locally verified on 2026-09-10:

- API, Student Web, and Counselor Web have separate production-oriented multi-stage Dockerfiles using the repository-root build context.
- Image builds use Node 24, pnpm 11.24.0, workspace filters, and `pnpm-lock.yaml` with `--frozen-lockfile`.
- The API final image contains production dependencies and compiled `dist`, starts with `node dist/server.js`, runs as the non-root `node` user, and exposes port 4000.
- The committed Prisma client source is compiled with the API. Image construction neither connects to a database nor generates or executes migrations.
- The API image has a dependency-free Node healthcheck for the existing `/health/live` endpoint.
- Both frontend images require public build-time `VITE_API_URL`, run the existing Vite production build, and serve only static `dist` output through a shared container-local Nginx configuration.
- The frontend static server runs as non-root on port 8080 and provides SPA history fallback. It has no public-domain routing, TLS, API proxy, or cross-service ingress behavior.
- Real environment files, local dependency/output directories, logs, caches, and repository metadata are excluded from Docker build context without excluding workspace manifests, source, or Prisma files.
- Runtime secrets are not build arguments or image defaults. Local development remains Docker-independent.

Milestone verification:

- API tests: **61/61 PASS**
- API type-check: **PASS**
- API production build: **PASS**
- Student Web lint and production build: **PASS**
- Counselor Web lint and production build: **PASS**
- Prisma schema validation: **PASS**
- Container files and referenced paths: **STATIC REVIEW PASS**
- Docker image build/runtime execution: **NOT RUN; Docker is intentionally unavailable locally**

The official Phase 0 completion estimate remains **50%** because no explicit milestone weighting rubric exists. Confidence remains **HIGH** for the source and static container contract; actual image execution remains pending in a Docker-capable environment.

### Milestone 3 — Development Workflow & Repository Hardening

**Status: COMPLETE**

Completed and locally verified on 2026-09-10:

- Node.js 24.x is the supported local runtime, with verified version 24.19.0 recorded in `.node-version` and the root package engine contract.
- pnpm 11.24.0 remains the only package manager, declared through `packageManager` and `engines`; no dependency versions were changed.
- A root README documents installation, environment setup, local PostgreSQL assumptions, application development commands, and the Docker-independent workflow.
- Existing API-scoped root commands retain their behavior. Explicit frontend development/build commands, aggregate lint/build commands, and the canonical `pnpm validate` gate are available at the root.
- The canonical validation gate covers API tests/type-check/build, both frontend lint/build flows, and Prisma schema validation without starting services or running migrations.
- Root and per-app environment examples remain the source for ignored local configuration. No real environment file or secret was added.
- `.gitignore` now explicitly covers Vite/cache/pnpm-store directories and TypeScript build metadata while continuing to preserve source, Prisma schema/migrations, the lockfile, workspace configuration, and documentation.

Milestone verification:

- API tests: **61/61 PASS**
- API type-check: **PASS**
- API production build: **PASS**
- Student Web lint and production build: **PASS**
- Counselor Web lint and production build: **PASS**
- Prisma schema validation: **PASS**
- Canonical root validation workflow: **PASS**
- Docker required: **NO**

The official Phase 0 completion estimate remains **50%** because no explicit milestone weighting rubric exists. Confidence remains **HIGH** based on the complete local validation gate.

### Milestone 4 — Docker Compose Infrastructure Foundation

**Status: COMPLETE (STATICALLY VERIFIED; DOCKER EXECUTION PENDING)**

Completed and locally verified on 2026-09-10:

- The root `docker-compose.yml` defines API, Student Web, Counselor Web, and PostgreSQL services using the existing application Dockerfiles and the official PostgreSQL 17 Bookworm image.
- PostgreSQL data persists in the Compose-managed `postgres-data` named volume. No host path or backup behavior is imposed, and the current API has no upload-storage requirement needing a volume.
- All services join a dedicated internal bridge network. No host ports are published, including PostgreSQL 5432; a later edge-ingress milestone must deliberately provide public reachability.
- PostgreSQL credentials, `DATABASE_URL`, `ACCESS_TOKEN_SECRET`, public origins, and the public `VITE_API_URL` build input are external environment values. The committed `.env.production.example` contains placeholders only, and deployed `.env` values remain ignored.
- PostgreSQL readiness uses `pg_isready`. The API starts only after PostgreSQL reports healthy and uses its existing Node health probe against database-aware `/health` under Compose.
- Frontend services build with explicit `VITE_API_URL` and continue to serve static output only. They do not proxy the API and have no artificial startup dependency on it.
- Compose neither runs migrations nor embeds database/authentication secrets. Migration execution policy, public Nginx ingress, TLS, deployment, backups, monitoring, and CI/CD remain deferred.
- Local development remains Docker-independent. Compose and container runtime execution were not attempted because Docker is intentionally unavailable locally.

Milestone verification:

- API tests: **61/61 PASS**
- API type-check: **PASS**
- API production build: **PASS**
- Student Web lint and production build: **PASS**
- Counselor Web lint and production build: **PASS**
- Prisma schema validation: **PASS**
- Compose YAML, interpolation contract, build paths, ports, network, volume, health, and secret handling: **STATIC REVIEW PASS**
- Docker Compose runtime execution: **NOT RUN; Docker is intentionally unavailable locally**

The official Phase 0 completion estimate remains **50%** because no explicit milestone weighting rubric exists. Confidence remains **HIGH** for the validated source and static infrastructure contract; actual Compose execution remains pending in a Docker-capable environment.

### Milestone 5 — Reverse Proxy & Production Edge Foundation

**Status: COMPLETE (STATICALLY VERIFIED; NGINX EXECUTION PENDING)**

Completed and locally verified on 2026-09-10:

- `infrastructure/nginx/` defines an HTTP-only edge configuration with exact virtual hosts for `app.konkourix.ir`, `counselor.konkourix.ir`, and `api.konkourix.ir`. Unknown hosts are rejected by a default server.
- Upstreams use the existing service names and internal ports: Student Web and Counselor Web on 8080 and API on 4000. Request URIs are preserved without application-route rewrites.
- The edge overwrites `Host`, `X-Real-IP`, `X-Forwarded-For`, and `X-Forwarded-Proto` and includes harmless HTTP upgrade handling. CORS, authentication, and cookie attributes remain application responsibilities.
- The trusted-proxy contract is unchanged. When the edge is later attached to a controlled network, the API must explicitly trust only its source IP/CIDR and must not be directly exposed to untrusted clients.
- Both frontend hosts proxy all browser paths to their existing static containers, preserving the container-level SPA fallback. Only Vite's hashed `/assets/` path receives long-lived browser expiry; general routes use no-cache expiry.
- The edge provides `nosniff`, frame denial, and no-referrer headers without weakening the API's existing values. API CSP and Permissions-Policy remain untouched, and API request bodies are capped at 2 MiB at the edge.
- TLS listeners, certificates, HSTS, DNS, Cloudflare, deployment, firewall rules, and edge Compose integration are absent and explicitly deferred. The defined domains are intended routing identities, not a claim that DNS or production traffic is active.

Milestone verification:

- API tests: **61/61 PASS**
- API type-check: **PASS**
- API production build: **PASS**
- Student Web lint and production build: **PASS**
- Counselor Web lint and production build: **PASS**
- Prisma schema validation: **PASS**
- Nginx host/upstream/header/cache/SPA/security structure: **STATIC REVIEW PASS**
- Nginx syntax/runtime execution: **NOT RUN; Nginx and Docker are intentionally unavailable locally**

The official Phase 0 completion estimate remains **50%** because no explicit milestone weighting rubric exists. Confidence remains **HIGH** for the validated source and static edge contract; Nginx syntax and runtime execution remain pending in an appropriate environment.

## Implemented Architecture

Konkourix is a pnpm monorepo. Current repository structure includes:

- `apps/api`: Node.js, TypeScript, Fastify 5, Prisma 7, PostgreSQL, and Zod
- `apps/student-web`: separate React, TypeScript, and Vite application
- `apps/counselor-web`: separate React, TypeScript, and Vite application
- `packages/api-client`, `packages/shared`, `packages/types`, `packages/ui`, and `packages/validation`: currently placeholder directories
- `database/prisma`: Prisma schema, generated-client configuration, and migrations
- `docs`: project documentation
- `infrastructure/docker`: shared container-only health and static-server configuration
- `infrastructure/nginx`: future HTTP edge routing and upstream configuration

Repository reality takes precedence over aspirational directory layouts or architecture.

## Implemented Backend Capabilities

The following capabilities are present and covered by the current API baseline:

- Process liveness and database readiness endpoints
- Request IDs, a standard API response envelope, centralized error handling, structured Fastify logging, and baseline security headers
- Users, roles, and account status foundations
- Student registration and login
- Access-token authentication
- Refresh-token sessions with rotation and reuse handling
- Logout and versioned `/auth/me` functionality under `/v1`
- Student and counselor profile APIs
- Student-counselor relationship foundation
- Student subjects, study plans, and daily tasks
- Study Sessions and Student Goals
- Backend role and ownership enforcement foundations; student resources are resolved from the authenticated user's StudentProfile

Study Tracking recovery is committed in `8905e381fdcf820bc058a7acd81fc794c7cbfc08` and retained by the current checkpoint.

## Core Foundation Repairs

Commit `5fffa805d99e1fc870410c3b5115b2924059399f` records four verified repairs:

1. Development seed descendants use the persisted `StudentProfile.id`, not the student User ID.
2. The public daily-task `date` query is mapped to the internal `scheduledFor` filter.
3. Plan and task cursor pagination skips the cursor record while retaining lookahead-row semantics.
4. Student and counselor profile PATCH operations preserve omitted properties; explicit `null` remains supported where the existing schema permits it.

## Database State

- Persistent storage: PostgreSQL
- ORM and migration system: Prisma
- Known migrations: 5
- Migration status at this checkpoint: applied and up to date
- Study Tracking migration: `20260903002126_add_study_tracking`
- Study Tracking migration state: committed and applied

Never rewrite, rename, delete, or silently replace applied migration history. Use additive migrations only after inspecting schema, migration history, and application usage. Do not store database URLs or credentials in documentation or Git.

## Frontend State

### Student application

- The project exists as an independent React/Vite application.
- Its API origin is supplied by the validated build-time `VITE_API_URL` contract.
- It remains a framework starter rather than a real Konkourix product UI.
- It has no complete browser authentication, protected routing, dashboard, or API workflow.

### Counselor application

- The project exists as an independent React/Vite application.
- Its API origin is supplied by the validated build-time `VITE_API_URL` contract.
- It remains a framework starter rather than a real Konkourix product UI.
- It has no complete browser authentication, protected routing, dashboard, or API workflow.

Neither starter application should be described as an implemented product merely because it builds.

## Development Workflow State

- Existing root `dev`, `build`, `test`, and `typecheck` commands retain their API scope; explicit frontend and aggregate commands supplement them.
- `pnpm validate` is the canonical all-workspace local verification gate.
- Both frontend applications have independent lint and build scripts; their build commands include TypeScript project builds.
- Local development uses API port 4000, Student Web port 5173, and Counselor Web port 5174 with explicit environment examples.
- `.node-version` records Node.js 24.19.0, while root package metadata supports Node.js 24.x and pins pnpm 11.24.0.
- Ordinary local development must remain Docker-independent and use Node.js processes with a locally available PostgreSQL instance.

## Infrastructure State

### Implemented configuration

- Production image definitions exist for the API, Student Web, and Counselor Web.
- `infrastructure/docker/` contains the API liveness script and a shared container-local SPA static-server configuration.
- The root `.dockerignore` excludes real environment files and irrelevant local artifacts while preserving required monorepo inputs.
- The root `docker-compose.yml` defines a statically verified API/web/PostgreSQL topology on a private network with named PostgreSQL persistence and no published host ports.
- `.env.production.example` documents placeholder-only Compose inputs; real runtime values remain external and ignored.
- Compose waits for PostgreSQL health before starting the API and configures the API image's existing probe to use database-aware `/health`.
- Compose does not execute Prisma migrations; migration orchestration remains deferred.
- `infrastructure/nginx/` defines statically verified exact-host HTTP edge routing to the three application services, forwarded headers, frontend asset expiry, and baseline response headers.
- The edge is not yet packaged or attached to Compose. It has no TLS, certificate, DNS, Cloudflare, or deployment configuration.
- The frontend image's internal Nginx remains a static file server and supplies SPA history fallback; it does not proxy API traffic.
- No deployment scripts are implemented.
- No backup or restore scripts are implemented.
- No CI workflow is implemented.

### Locally runnable

- The current practical development workflow uses Node.js processes and locally available PostgreSQL through repository package scripts.
- Docker is unavailable on the development laptop.
- **Docker is intentionally not required on the development laptop.**

This local constraint does not remove the requirement to implement production-quality Docker/Compose configuration later.

### Production runtime verified

**NO.** Production infrastructure has not been runtime-verified.

The implemented container-image and Compose configuration is statically checked locally. Docker runtime verification must be reported separately and performed in an appropriate environment.

## Known Remaining Foundation Work

- Logging and error-handling completeness review
- Shared package strategy and implementation
- Independent student and counselor routing/authentication shells
- Docker Compose runtime verification and migration execution policy
- Nginx syntax/runtime verification, Compose integration, and TLS termination strategy
- Production environment configuration and secret handling
- Deployment and rollback scripts
- PostgreSQL and upload backup/restore procedures
- CI/CD validation foundation
- Broader product and operational documentation
- Security hardening, including rate limiting and production-focused review

These items are not authorization to implement all remaining Phase 0 work in one task.

## Known Product Work Not Yet Implemented

- Full student product UI
- Full counselor product UI
- Settings and light/dark theme workflows
- Topics and complete task/planning UX
- Test sessions
- Focus sessions and timer
- Habits and streaks
- Persian calendar and daily evaluations
- Reports and analytics
- Exams and comparisons
- Messaging and notifications
- File uploads and storage integration
- Subscriptions and payment readiness
- Later production hardening and operational verification

## Current Safety Rules

- Never reset or clean a working tree without first reviewing and preserving all tracked and untracked work.
- Never rewrite applied migration history.
- Never store secrets, credentials, tokens, private keys, or real environment values in Git.
- Do not make Docker a requirement for development on the current laptop.
- Backend authorization is authoritative; frontend role hiding is not security.
- Verify each feature end-to-end before marking it complete.
- Use PostgreSQL for real product persistence; mocks are limited to tests or explicit demonstrations.
- End every meaningful milestone with proportionate verification and a focused Git checkpoint.
- Do not continue automatically into another milestone without explicit authorization.

## Next Work

Phase 0 Milestones 1, 2, 3, 4, and 5 are complete. Any next milestone requires explicit controller authorization; this checkpoint does not begin TLS, deployment, or another Phase 0 milestone.
