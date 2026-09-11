# Konkourix Project State

This document is the canonical operational memory for resuming work on the Konkourix repository. It records verified repository reality through Phase 2 Milestone 4, not a claim of overall product completion.

## Project

Konkourix is a multi-user educational planning platform with independent public entry points:

- Student application: `app.konkourix.ir`
- Counselor application: `counselor.konkourix.ir`
- API: `api.konkourix.ir`

## Current Phase

The project has completed **Phase 2 Milestone 4 — Counselor Student Access Foundation**.

Phase 1 is closed and complete. Phase 0 remains partially complete while explicitly authorized product work proceeds. Authentication, independent browser application shells, base account settings, student today planning, student-owned subject/topic management, optional task-topic assignment, and read-only counselor access to assigned student profiles are verified; later student and counselor product capabilities are not implied complete.

- Phase 0 completion estimate: **50%**
- Confidence: **HIGH**
- Audit and baseline re-verification date: **2026-09-11**

## Phase 1 Milestone 3 Starting Checkpoint

- HEAD: `b076541e2157ad98af9dea0bf71602cd2d40a6e1`
- Message: `feat: establish application shells and dashboard foundations`

Foundation repair checkpoint:

- Commit: `5fffa805d99e1fc870410c3b5115b2924059399f`
- Message: `fix: repair core foundation data semantics`

Study Tracking recovery checkpoint:

- Commit: `8905e381fdcf820bc058a7acd81fc794c7cbfc08`
- Message: `feat: complete student study tracking recovery`

## Phase 2 Milestone 1 Starting Checkpoint

- HEAD: `11c523d05418a6e3d57039b29f45d5b08e23012c`
- Message: `feat: complete account settings and session management`

## Phase 2 Milestone 2 Starting Checkpoint

- HEAD: `634e99083d24d4e62d941390108d0f17f476a82c`
- Message: `feat: add student today planning`

## Phase 2 Milestone 3 Starting Checkpoint

- HEAD: `1173b57823d4416714ee2736f8a9ca858767b367`
- Message: `feat: add student topic foundation`

## Phase 2 Milestone 4 Starting Checkpoint

- HEAD: `8f9092a18d1a43f70096061b0aa2780dfc31209d`
- Message: `feat: connect tasks to topics`

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
| Environment and security | HARDENED BASELINE; PRODUCTION VERIFICATION PENDING |
| Student Web | SCAFFOLDED ONLY |
| Counselor Web | SCAFFOLDED ONLY |
| Shared packages | SCAFFOLDED ONLY |
| Development workflow | HARDENED; LOCAL VALIDATION COMPLETE |
| Container image definitions | COMPLETE; RUNTIME UNVERIFIED |
| Docker Compose | FOUNDATION COMPLETE; RUNTIME UNVERIFIED |
| Edge Nginx | FOUNDATION COMPLETE; SYNTAX/RUNTIME UNVERIFIED |
| Deployment | PREPARATION COMPLETE; EXECUTION NOT STARTED |
| Backup/Restore | DESIGN COMPLETE; EXECUTION UNVERIFIED |
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
- Refresh cookies are `HttpOnly`, `SameSite=Lax`, limited to `/api/v1/auth`, `Secure` in production, and host-only by default. Logout clears them with matching attributes.
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

### Milestone 6 — Production Security & Operational Hardening

**Status: COMPLETE (LOCAL CONTRACT VERIFIED; PRODUCTION OPERATIONS PENDING)**

Completed and locally verified on 2026-09-10:

- API request completion logs now use an explicit safe schema containing request time, method, normalized route, status, duration, request ID, and authenticated user ID when available. Fastify's duplicate default request logs are disabled through its current `LogController` API.
- Pino redaction covers common credential fields. Unhandled and lifecycle error logs omit arbitrary messages/stacks and retain only validated short error names/codes plus request correlation.
- Edge access logs now use an edge-generated request ID and normalized URI without query arguments. Query strings, referrers, cookies, authorization headers, and bodies are not part of the edge log format.
- Bounded in-memory per-IP limits protect public registration, login, and refresh routes with standard 429/`Retry-After` responses. Logout remains available. The per-process/non-distributed limitation is documented for future scaling.
- Existing security headers, exact CORS allowlist, secure refresh-cookie attributes, trusted-proxy allowlist, strict input validation, authorization, scrypt password hashing, and token/session behavior were reviewed and preserved.
- The canonical liveness paths are `/health/live` and `/api/v1/health/live`; readiness paths are `/health` and `/api/v1/health`. No `/ready` alias exists. Readiness checks PostgreSQL without exposing errors or credentials.
- No upload subsystem exists. `docs/SECURITY.md` records mandatory future file validation, path, size, execution, malware, ownership, and backup controls.
- `docs/backup-restore.md` defines future encrypted off-host PostgreSQL backup, retention approval, checksum, alerting, and isolated restore-verification requirements. No backup/restore script, schedule, dump, or restore was executed.
- The production checklist explicitly leaves TLS, DNS, secrets provisioning, migrations, monitoring, backup evidence, restore drills, permissions, deployment, and incident/rollback verification incomplete.

Milestone verification:

- API tests: **63/63 PASS**
- API type-check: **PASS**
- API production build: **PASS**
- Student Web lint and production build: **PASS**
- Counselor Web lint and production build: **PASS**
- Prisma schema validation: **PASS**
- Secret/schema/migration/dependency/scope review: **PASS**
- Deployment, TLS, monitoring, backup, and restore execution: **NOT RUN; explicitly outside milestone scope**

The official Phase 0 completion estimate remains **50%** because no explicit milestone weighting rubric exists. Confidence remains **HIGH** for the reviewed and locally verified security/operational contract; production controls and recovery execution still require environment-specific evidence.

### Milestone 7 — Production Deployment Preparation

**Status: COMPLETE (DOCUMENTED; DEPLOYMENT NOT EXECUTED)**

Completed and locally verified on 2026-09-10:

- `docs/deployment.md` defines the future Ubuntu LTS VPS assumptions, protected `/opt/konkourix` layout, exact-release workflow, server-only environment handling, first-install/update sequence, health gates, and rollback decisions.
- `.env.production.example` now carries the intended Konkourix HTTPS origins and Compose inputs with secret placeholders only. The populated production file belongs at `/opt/konkourix/config/production.env` with mode `0600`, outside the checkout.
- Public mapping remains `app.konkourix.ir` to Student Web, `counselor.konkourix.ir` to Counselor Web, and `api.konkourix.ir` to the API. These are intended identities, not claims that DNS or TLS is active.
- Production migrations are manual, reviewed, backup-gated, and applied before dependent traffic. They never run from a Dockerfile, Compose startup, or application entrypoint.
- The current API runtime image does not include the Prisma CLI or migration files. A separate reviewed migration runner remains a mandatory pre-deployment gate; this milestone documents that limitation instead of adding unapproved automation.
- Application rollback selects the prior exact release. Database restore is an explicit incident decision for incompatible data changes, not an automatic down migration.
- The server checklist leaves Docker/Compose runtime validation, edge integration, firewall, DNS, TLS, monitoring, backup execution, restore evidence, and actual deployment incomplete until verified in the target environment.
- No VPS was accessed; no Docker installation, Compose execution, migration, deployment, DNS, TLS, Cloudflare, monitoring, or backup operation occurred.

Milestone verification:

- API tests: **63/63 PASS**
- API type-check: **PASS**
- API production build: **PASS**
- Student Web lint and production build: **PASS**
- Counselor Web lint and production build: **PASS**
- Prisma schema validation: **PASS**
- Environment placeholder, secret, schema, migration, dependency, and scope review: **PASS**
- VPS, Docker/Compose, Nginx, migration, deployment, DNS, and TLS execution: **NOT RUN; explicitly outside milestone scope**

The official Phase 0 completion estimate remains **50%** because no explicit milestone weighting rubric exists. Confidence remains **HIGH** for the reviewed documentation and locally validated repository; deployment/runtime claims still require target-environment evidence.

### Phase 1 Milestone 1 — Authentication Foundation

**Status: COMPLETE**

Completed and locally verified on 2026-09-10:

- Existing `User` and `AuthSession` persistence was retained without schema or migration changes. Users carry server-controlled roles/status, and sessions store hashed refresh-token representations, expiry, revocation, rotation-family, and request metadata.
- Canonical API routes are `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`, and `GET /api/v1/auth/me`.
- Student registration cannot choose a role. Counselor login uses a server-provisioned counselor identity; `ADMIN` remains available only for model and backend compatibility.
- Short-lived access JWTs are returned to the browser and held only in application memory. Opaque refresh tokens remain in an `HttpOnly`, production-`Secure`, `SameSite=Lax` cookie and are rotated against revocable server-side sessions.
- Reusable authentication and role guards protect explicit `/api/v1/student/session` and `/api/v1/counselor/session` boundaries. Cross-role access is rejected by the API.
- Student Web and Counselor Web now have independent login pages, API clients, in-memory auth state, refresh bootstrap, protected-route foundations, and logout. Neither application has a role selector or role-switching control.
- The backend remains authoritative for identity, current account status, roles, ownership, and student-counselor relationship checks.

Milestone verification:

- API tests: **69/69 PASS**
- API type-check: **PASS**
- API production build: **PASS**
- Student Web lint and production build: **PASS**
- Counselor Web lint and production build: **PASS**
- Prisma schema validation: **PASS**
- Secret, dependency, schema, migration, and scope review: **PASS**

The official Phase 0 completion estimate remains **50%**. Phase 1 Milestone 1 is **COMPLETE**, and confidence remains **HIGH**.

### Phase 1 Milestone 2 — Base Application Shells & Dashboard Foundation

**Status: COMPLETE**

Completed and locally verified on 2026-09-10:

- Student Web now has an authenticated RTL application shell with a desktop sidebar, mobile bottom navigation, page header, responsive content area, and independent routes for dashboard, planning, study, reports, and settings.
- Counselor Web has its own authenticated RTL application shell with the same structural guarantees and independent routes for dashboard, students, planning, reports, and settings.
- Both dashboards provide role-specific greeting areas, summary-card skeletons, overview empty states, and disabled quick-action placeholders. No product data, analytics, or feature operations are implemented.
- Navigation destinations outside the dashboards and basic theme setting are explicit placeholder states. Unknown routes render a user-friendly error state with a safe dashboard return action.
- Small application-local `Button`, `Card`, and loading/empty/error primitives establish reusable UI structure without activating an immature shared package or adding dependencies.
- Both shells support light and dark CSS-variable themes. Theme preferences use separate, non-sensitive browser-storage keys and do not interact with authentication state.
- Existing authentication clients, providers, refresh behavior, in-memory access-token strategy, role boundaries, and backend permissions are unchanged. Protected-route initialization now renders the reusable loading-state primitive.

Milestone verification:

- API tests: **69/69 PASS**
- API type-check: **PASS**
- API production build: **PASS**
- Student Web lint and production build: **PASS**
- Counselor Web lint and production build: **PASS**
- Prisma schema validation: **PASS**
- Diff, secret, dependency, schema, migration, infrastructure, auth-regression, and scope review: **PASS**

The official Phase 0 completion estimate remains **50%**. Phase 1 Milestone 2 is **COMPLETE**, and confidence remains **HIGH**.

### Phase 1 Milestone 3 — Account Settings & Session Management Foundation

**Status: COMPLETE**

- The existing sanitized current-user responses and role-specific profile GET/PATCH endpoints remain canonical; no duplicate account endpoint was introduced.
- Student settings edit only the existing `educationLevel` and `schoolName` profile fields. Counselor settings independently edit only the existing `bio` and `specialization` fields.
- Strict backend schemas reject user IDs, roles, status, privileges, and other unapproved fields. Profile ownership is derived from the authenticated server identity, never request input.
- Authenticated password change verifies the current password and uses the established salted scrypt hashing implementation. Password update and revocation of every refresh session for that user are atomic and require reauthentication.
- Authenticated logout-all revokes only the current user's refresh sessions and clears the current refresh cookie. Existing current-session logout, refresh rotation, token-reuse handling, and role boundaries remain active.
- Both independent Persian/RTL settings experiences provide account summaries, role-appropriate profile forms, the existing per-application light/dark theme preference, safe form states, password change, current logout, and confirmed logout-all.
- Access tokens remain memory-only. No database schema, migration, dependency, lockfile, infrastructure, or unrelated product-feature change was required.

Milestone verification:

- API tests: **75/75 PASS**
- API type-check: **PASS**
- API production build: **PASS**
- Student Web lint and production build: **PASS**
- Counselor Web lint and production build: **PASS**
- Prisma schema validation: **PASS**
- Static scope, secret, authorization, and diff review: **PASS**

The official Phase 0 completion estimate remains **50%**. Phase 1 Milestone 3 is **COMPLETE**, and confidence remains **HIGH**.

### Phase 2 Milestone 1 — Student Today Planning

**Status: COMPLETE**

- Student Web `/planning` is now a real authenticated Persian/RTL daily-planning experience while Counselor Web `/planning` remains an explicit placeholder.
- The page derives the backend `YYYY-MM-DD` date from the browser's local calendar components, avoiding UTC date-shift behavior without adding a calendar dependency or persisted timezone setting.
- Students can view today's persistent tasks, create a personal task for today, mark pending tasks completed or skipped, filter by status and subject, and load additional cursor pages without duplicating appended tasks.
- The focused task form uses only existing fields: required title plus optional subject, description, and estimated minutes. It does not accept ownership, role, creator, plan, or other server-controlled values.
- Students can create a subject inline and have it selected immediately. Archived subjects remain visible for historical filtering but are excluded from new-task selection.
- Student Web uses a separate typed planning client layered on the established authenticated request and refresh mechanism. Access tokens remain memory-only, and the existing backend continues to derive ownership from the authenticated `StudentProfile`.
- Existing subject and daily-task routes, services, schemas, Prisma models, filters, cursor pagination, and completion timestamp semantics were reused without production backend changes.
- Focused backend regression tests now cover task read/update ownership, cross-student subject and study-plan assignment rejection, archived-subject rejection, counselor denial, authenticated filter scope, Prisma ownership predicates, and completion/skip/reopen timestamp behavior.
- No dependency, lockfile, Prisma schema, migration, infrastructure, authentication, or Counselor Web change was required.

Milestone verification:

- API tests: **82/82 PASS**
- API type-check: **PASS**
- API production build: **PASS**
- Student Web lint and production build: **PASS**
- Counselor Web lint and production build: **PASS**
- Prisma schema validation: **PASS**
- Canonical `pnpm.cmd validate`: **PASS**
- Schema changed: **NO**
- Migration added or run: **NO**

Deferred Phase 2 capabilities include topics, weekly planning, drag-and-drop/manual ordering, free-text search, counselor-authored tasks/plans, and richer task lifecycle/progress data. These require separately designed milestones and are not implied complete by the daily-planning slice.

### Phase 2 Milestone 2 — Student Subject & Topic Foundation

**Status: COMPLETE**

- The existing student-owned `StudySubject` model, authenticated subject APIs, and Student Web auth client remain canonical and are reused without a parallel subject architecture.
- A minimal `Topic` model adds a required `StudySubject` relation, normalized per-subject title uniqueness, timestamps, archive metadata, an indexed subject foreign key, and cascade cleanup with its parent subject.
- The additive `20260910184152_add_student_topic_foundation` migration was applied successfully to the local development database; all 6 migrations are up to date.
- Student-only topic routes support listing and creating topics below an owned subject and getting, renaming, archiving, or restoring an owned topic. No delete route, client-selected owner, counselor mutation path, or task-topic coupling was introduced.
- Topic list/read/update Prisma predicates traverse the subject relation to the authenticated student's `StudentProfile`; parent validation also hides missing and foreign subjects behind the same not-found response.
- Student Web `/study` is now a real Persian/RTL responsive subject/topic workspace with subject list/create, subject selection, topic list/create/rename/archive/restore, and localized loading, empty, error, and success states. Student `/planning` remains intact, and Counselor Web remains unchanged.
- Focused tests cover successful topic creation and normalization, duplicate rejection, foreign-subject list/create denial, foreign-topic update denial, invalid parent subjects, empty titles, counselor denial, archive/rename behavior, and relational ownership predicates in the Prisma store.
- No dependency, lockfile, authentication, infrastructure, Counselor Web, weekly-planning, ordering, search, reporting, or richer progress feature was changed.

Milestone verification:

- API tests: **89/89 PASS**
- API type-check: **PASS**
- API production build: **PASS**
- Student Web lint and production build: **PASS**
- Counselor Web lint and production build: **PASS**
- Prisma schema validation: **PASS**
- Canonical `pnpm.cmd validate`: **PASS**
- Migration status: **PASS**; 6 migrations found and the database is up to date
- Schema changed: **YES; additive Topic model only**
- Migration added and run: **YES; local development database only**

Deferred Phase 2 capabilities include weekly planning, drag-and-drop/manual ordering, free-text search, counselor-authored tasks/plans or topics, task-topic linkage, and richer task lifecycle/progress data. They require separately authorized milestones.

### Phase 2 Milestone 3 — Task Topic Integration

**Status: COMPLETE**

- `DailyTask` now has a nullable `topicId` foreign key and optional `Topic` relation. Existing tasks remain valid with `topicId = NULL`, deleting a topic sets linked task topic IDs to null, and the indexed foreign key supports task-topic access without adding analytics fields.
- The additive `20260910220542_connect_tasks_to_topics` migration was applied successfully to the local development database; all 7 migrations are up to date.
- Existing student daily-task create and patch contracts accept optional nullable `topicId`. Task get/list/create/update responses expose the scalar `topicId`, matching the established relationship-ID response pattern without breaking existing clients.
- Backend services require any selected topic to belong to the authenticated student's profile through its subject and to match the task's effective `subjectId`. A topic cannot be supplied without its subject, and archived topics cannot be newly attached.
- Partial task updates validate the combined current and requested relationship state, so changing a subject cannot silently retain an incompatible topic. Status-only updates preserve existing completion timestamp behavior and do not revalidate unchanged historical relationships.
- Student Web `/planning` retains its existing layout and now loads active topics after a subject is selected, clears topic selection when the subject changes, permits no topic, and presents localized loading, empty, and error states. Topic management remains exclusively in `/study`.
- Focused tests cover topic-free and valid-topic task creation, same-student cross-subject mismatch rejection, cross-student topic rejection, valid topic attachment during update, invalid update rejection, route parsing/response behavior, and all existing task ownership, authorization, pagination, filtering, and completion behavior.
- No dependency, lockfile, authentication, infrastructure, Counselor Web, topic analytics, weekly-planning, ordering, search, or counselor-planning feature was changed.

Milestone verification:

- API tests: **93/93 PASS**
- API type-check: **PASS**
- API production build: **PASS**
- Student Web lint and production build: **PASS**
- Counselor Web lint and production build: **PASS**
- Prisma schema validation: **PASS**
- Canonical `pnpm.cmd validate`: **PASS**
- Migration status: **PASS**; 7 migrations found and the database is up to date
- Schema changed: **YES; nullable DailyTask topic relation only**
- Migration added and run: **YES; local development database only**

Deferred Phase 2 capabilities include weekly planning, drag-and-drop/manual ordering, free-text search, topic analytics/mastery, counselor-authored tasks/plans, and counselor planning. They require separately authorized milestones.

### Phase 2 Milestone 4 — Counselor Student Access Foundation

**Status: COMPLETE**

- The existing `StudentCounselor` relationship remains the sole assignment authority. No parallel relationship model, Prisma schema change, or migration was added.
- Read-only `GET /api/v1/counselor/students` and `GET /api/v1/counselor/students/:id` routes require an authenticated `COUNSELOR` and derive `counselorId` exclusively from the access-token identity.
- List and detail Prisma predicates require an `ACTIVE` relationship to the authenticated counselor. Missing, inactive, unassigned, and cross-counselor student detail requests share the same not-found response.
- List results use the established bounded cursor-pagination pattern. Responses select only the StudentProfile identifier, nullable display name, education level, school name, and safe account status; authentication identifiers, password hashes, sessions, tokens, and unrelated user data are never selected.
- The current schema has no student display-name field. The API therefore returns `displayName: null`, and Counselor Web presents an explicit localized fallback rather than repurposing or exposing email/phone authentication identifiers.
- Counselor Web `/students` is now a real Persian/RTL responsive list with loading, empty, error, status, and pagination states. `/students/:id` provides a read-only basic profile view and preserves the existing custom History router, shell, session flow, and light/dark themes.
- Student Web is unchanged. Counselor planning, task creation, reports, analytics, messages, and notes remain absent and unauthorized in this milestone.
- Focused tests cover authenticated counselor list isolation, cursor behavior, student/admin/anonymous denial, assigned detail access, unassigned and cross-counselor denial, sensitive-field exclusion, identity-derived service scope, and active-assignment predicates in the Prisma store.

Milestone verification:

- API tests: **99/99 PASS**
- API type-check: **PASS**
- API production build: **PASS**
- Student Web lint and production build: **PASS**
- Counselor Web lint and production build: **PASS**
- Prisma schema validation: **PASS**
- Canonical `pnpm.cmd validate`: **PASS**
- Migration status: **PASS**; 7 migrations found and the database is up to date
- Schema changed: **NO**
- Migration added or run: **NO**

Deferred counselor capabilities include planning, task creation, reports, analytics, messaging, and private notes. They require separately authorized milestones.

### Phase 2 Milestone 5B — Task Provenance Foundation

**Status: COMPLETE**

- `DailyTask.studentProfileId` remains the student ownership boundary. Required immutable provenance now records `source` as `PERSONAL` or `COUNSELOR` and `createdByUserId` as a foreign key to the creating `User` without adding a parallel task model or counselor-specific ownership field.
- The additive `20260911025617_add_task_provenance_foundation` migration first adds nullable provenance columns, backfills existing tasks as `PERSONAL` with the owning StudentProfile user's ID, aborts if any row remains unmapped, and only then makes both fields required. The migration was applied successfully to the local development database; all 8 migrations are up to date.
- Before migration, a read-only integrity query confirmed that every existing DailyTask had a valid StudentProfile/User path; the current local database contained no DailyTask rows. Post-migration inspection confirmed both required columns, the creator foreign key with restricted creator deletion, and the creator index.
- Student task creation derives `source: PERSONAL`, `createdByUserId`, and `studentProfileId` exclusively from authenticated server identity. Existing strict create/update schemas reject client-supplied provenance or ownership fields, and the update service never forwards them.
- Task list/get/create/update responses expose only the safe `source` label. Raw creator identity remains internal and is omitted from responses. The Student Web planning client accepts the additive response field without displaying a creator/source indicator, and Counselor Web is unchanged.
- Deterministic development task seeds set provenance only when rows are created; their update path cannot rewrite immutable provenance. Existing StudySession relationships and behavior are unchanged.
- Focused regression tests cover server-assigned personal provenance, authenticated creator assignment, forged source/creator/owner rejection, update immutability, creator-response redaction, seed immutability, and all prior task ownership, role, pagination, filtering, completion timestamp, and StudySession behavior.

Milestone verification:

- API tests: **101/101 PASS**
- API type-check: **PASS**
- API production build: **PASS**
- Student Web lint and production build: **PASS**
- Counselor Web lint and production build: **PASS**
- Prisma schema validation: **PASS**
- Canonical `pnpm.cmd validate`: **PASS**
- Migration status: **PASS**; 8 migrations found and the database is up to date
- Schema changed: **YES; required immutable DailyTask provenance only**
- Migration added and run: **YES; local development database only**

Counselor task creation, counselor planning, per-source task permissions, revision handling, and audit history remain deferred. This milestone provides provenance storage only and adds no counselor task route or UI.

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
- Safe normalized request-completion logging and bounded single-process abuse limits for register/login/refresh
- Users, roles, and account status foundations
- Student registration and login
- Access-token authentication
- Refresh-token sessions with rotation and reuse handling
- Current-session logout, all-session revocation, authenticated password change, and versioned `/auth/me` functionality under `/api/v1`
- Student and counselor profile APIs
- Student-counselor relationship foundation
- Counselor-only read access to actively assigned student lists and basic profiles
- Student subjects, topics, study plans, and daily tasks with optional validated topic assignment and server-owned provenance
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
- Known migrations: 8
- Migration status at this checkpoint: applied and up to date
- Task Provenance migration: `20260911025617_add_task_provenance_foundation`
- Task Provenance migration state: committed and applied locally
- Task Topic migration: `20260910220542_connect_tasks_to_topics`
- Task Topic migration state: committed and applied locally
- Student Topic migration: `20260910184152_add_student_topic_foundation`
- Student Topic migration state: committed and applied locally
- Study Tracking migration: `20260903002126_add_study_tracking`
- Study Tracking migration state: committed and applied

Never rewrite, rename, delete, or silently replace applied migration history. Use additive migrations only after inspecting schema, migration history, and application usage. Do not store database URLs or credentials in documentation or Git.

## Frontend State

### Student application

- The project exists as an independent React/Vite application.
- Its API origin is supplied by the validated build-time `VITE_API_URL` contract.
- It has an independent student login screen, credentialed auth API client, in-memory access-token state, refresh bootstrap, protected-route shell, and logout.
- It verifies authenticated access against the backend-protected student boundary before rendering protected content.
- Its authenticated shell provides responsive desktop/mobile navigation, page headers, dashboard skeletons, placeholder destinations, reusable states, and light/dark theme foundations.
- Its settings page provides current account information, the existing student profile fields, theme selection, password change, current logout, and logout-all.
- Its planning page provides persistent today-task listing and creation with optional subject/topic assignment, completion/skipping, status and subject filters, cursor pagination, and inline subject creation through the existing authenticated backend contracts.
- Its study page provides persistent student-owned subject listing/creation and topic listing/creation/rename/archive/restore through the authenticated backend contracts.
- It remains an application foundation rather than a complete student product UI.

### Counselor application

- The project exists as an independent React/Vite application.
- Its API origin is supplied by the validated build-time `VITE_API_URL` contract.
- It has an independent counselor login screen, credentialed auth API client, in-memory access-token state, refresh bootstrap, protected-route shell, and logout.
- It verifies authenticated access against the backend-protected counselor boundary before rendering protected content.
- Its authenticated shell provides responsive desktop/mobile navigation, page headers, dashboard skeletons, placeholder destinations, reusable states, and light/dark theme foundations.
- Its settings page provides current account information, the existing counselor profile fields, theme selection, password change, current logout, and logout-all.
- Its student area provides a persistent assigned-student list and read-only basic profile detail through counselor-scoped backend contracts, with localized loading, empty, error, and pagination states.
- It remains an application foundation rather than a complete counselor product UI.

Neither application shell should be described as a complete product merely because it builds.

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
- `.env.production.example` documents the intended public origins and placeholder-only Compose inputs; real runtime values remain server-only, external, and ignored.
- Compose waits for PostgreSQL health before starting the API and configures the API image's existing probe to use database-aware `/health`.
- Compose does not execute Prisma migrations; migration orchestration remains deferred.
- `infrastructure/nginx/` defines statically verified exact-host HTTP edge routing to the three application services, forwarded headers, frontend asset expiry, and baseline response headers.
- The edge is not yet packaged or attached to Compose. It has no TLS, certificate, DNS, Cloudflare, or deployment configuration.
- The frontend image's internal Nginx remains a static file server and supplies SPA history fallback; it does not proxy API traffic.
- `docs/SECURITY.md` records the reviewed production security, logging, error, health, rate-limit, upload, and launch-checklist contracts.
- `docs/backup-restore.md` defines backup/restore design and required evidence; no backup or restore automation exists.
- `docs/deployment.md` defines the future Ubuntu LTS server layout, exact-release and environment workflow, manual migration gate, update sequence, rollback decisions, and incomplete production checklist.
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

- Shared package strategy and implementation
- Docker Compose runtime verification and a reviewed migration execution mechanism
- Nginx syntax/runtime verification, Compose integration, and TLS termination strategy
- Production secret provisioning and target-environment validation
- Deployment execution and any separately authorized automation
- Backup automation and isolated restore execution; upload backup design only if uploads are introduced
- CI/CD validation foundation
- Broader product and operational documentation
- Distributed abuse protection, security monitoring, and environment-specific hardening verification

These items are not authorization to implement all remaining Phase 0 work in one task.

## Known Product Work Not Yet Implemented

- Full student product UI
- Full counselor product UI
- Advanced profile and account-recovery workflows
- Complete task/planning UX beyond the current today-planning and subject/topic slices
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

Phase 2 Milestone 5B is complete. Any next milestone requires explicit controller authorization; this checkpoint does not begin counselor planning/task creation, task permissions, revisions, audit history, reports, analytics, messaging, notes, weekly planning, drag-and-drop/manual ordering, search, richer task lifecycle/progress, later product work, TLS, deployment execution, monitoring, or backup execution.
