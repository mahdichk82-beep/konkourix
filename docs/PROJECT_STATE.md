# Konkourix Project State

This document is the canonical operational memory for resuming work on the Konkourix repository. It records verified repository reality through the Phase 0 completion audit and baseline re-verification on 2026-09-09, not a claim of overall product completion.

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

## Milestone 1 Baseline Git Checkpoint

- HEAD: `44ab755c4cdf30f4dd9eb5e4ec8be23535c4aef9`
- Message: `docs: record phase 0 completion audit`

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
| Development workflow | PARTIAL |
| Docker | NOT STARTED |
| Docker Compose | NOT STARTED |
| Nginx | NOT STARTED |
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

## Implemented Architecture

Konkourix is a pnpm monorepo. Current repository structure includes:

- `apps/api`: Node.js, TypeScript, Fastify 5, Prisma 7, PostgreSQL, and Zod
- `apps/student-web`: separate React, TypeScript, and Vite application
- `apps/counselor-web`: separate React, TypeScript, and Vite application
- `packages/api-client`, `packages/shared`, `packages/types`, `packages/ui`, and `packages/validation`: currently placeholder directories
- `database/prisma`: Prisma schema, generated-client configuration, and migrations
- `docs`: project documentation
- `infrastructure`: currently an empty placeholder

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

- Root scripts currently emphasize the API and do not yet provide a complete all-workspace verification gate.
- Both frontend applications have independent lint and build scripts; their build commands include TypeScript project builds.
- Local development uses API port 4000, Student Web port 5173, and Counselor Web port 5174 with explicit environment examples.
- No Node.js version pin is currently committed.
- Ordinary local development must remain Docker-independent and use Node.js processes with a locally available PostgreSQL instance.

## Infrastructure State

### Implemented configuration

- `infrastructure/` exists but is currently an empty placeholder.
- No Dockerfiles are implemented.
- No Docker Compose configuration is implemented.
- No Nginx configuration is implemented.
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

Infrastructure configuration may later be implemented and statically checked locally. Docker runtime verification must be reported separately and performed in an appropriate environment.

## Known Remaining Foundation Work

- Logging and error-handling completeness review
- Shared package strategy and implementation
- Independent student and counselor routing/authentication shells
- Production Dockerfiles
- Docker Compose topology
- Nginx routing and TLS-origin strategy
- Production environment configuration and secret handling
- Deployment and rollback scripts
- PostgreSQL and upload backup/restore procedures
- CI/CD validation foundation
- Root README and broader documentation
- Root-level scripts that comprehensively verify every workspace
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

Phase 0 Milestone 1 is complete. Any next milestone requires explicit controller authorization; this checkpoint does not begin frontend product work, Docker, Nginx, deployment, or another Phase 0 milestone.
