# Konkourix Architectural Decisions

This lightweight decision log records architectural constraints established by the repository and approved project requirements. It should be updated when an architectural decision is explicitly accepted or superseded.

## ADR-001 — Monorepo

**Decision:** Konkourix uses a monorepo with separate student, counselor, and API applications.

**Reason:** Shared domain tooling can coexist while student and counselor entry points remain independent.

**Status:** Accepted

## ADR-002 — Separate Student and Counselor Applications

**Decision:** Student and counselor panels remain separate applications and production domains. Neither application has a role switcher.

**Security implication:** Role and ownership authorization is enforced by the backend; frontend separation alone is not sufficient.

**Status:** Accepted

## ADR-003 — Fastify + TypeScript Backend

**Decision:** Preserve the existing Fastify and TypeScript backend.

**Status:** Accepted

## ADR-004 — PostgreSQL + Prisma

**Decision:** PostgreSQL is the persistent product store, and Prisma is the current ORM and migration system.

**Rule:** Do not replace the ORM or rewrite applied migration history without explicit architectural approval.

**Status:** Accepted

## ADR-005 — Production Containers Without Local Docker Requirement

**Decision:** Production architecture may use Docker and Compose, while ordinary local development must not depend on Docker.

**Context:** The development laptop has approximately an Intel Core i5 11th-generation processor and 8 GB RAM, and Docker is not installed.

**Rule:** Infrastructure configuration can be implemented and statically verified locally, but runtime Docker verification must occur later in an appropriate environment or server and be reported accurately.

**Status:** Accepted

## ADR-006 — Incremental Recovery / No Rewrite

**Decision:** Preserve and repair the existing working architecture incrementally rather than replacing or restarting it.

**Reason:** The repository is the source of truth, and significant verified foundation work already exists.

**Status:** Accepted

## ADR-007 — Backend Authorization Is Authoritative

**Decision:** Student and counselor roles, ownership, and relationship restrictions are enforced server-side.

**Security implication:** Frontend visibility, client state, routes, and client-supplied identifiers never substitute for backend authorization.

**Status:** Accepted

## ADR-008 — Durable Milestone Checkpoints

**Decision:** Each meaningful milestone ends with proportionate tests and verification followed by a focused Git checkpoint when explicitly authorized.

**Status:** Accepted

## ADR-009 — Runtime and Browser Environment Contract

**Decision:** Runtime and browser connectivity are configured through one validated API environment contract and one Vite-safe frontend variable per web application.

**Canonical variables:** The API retains the established `PORT` and `HOST` variables and adds `API_URL`, `STUDENT_APP_URL`, `COUNSELOR_APP_URL`, `CORS_ORIGINS`, `COOKIE_DOMAIN`, and `TRUST_PROXY`. Both web applications use `VITE_API_URL` from their own Vite environment. Public URL values are origins without paths, queries, or fragments, and production public URLs must use HTTPS.

**CORS and browser-origin policy:** `CORS_ORIGINS` is a normalized exact-origin allowlist. Wildcards, malformed values, empty entries, and automatic origin reflection are not permitted. Production validation requires both application origins in the allowlist. Allowed browser origins receive credential support, and browser clients must opt into credentials when calling the API; unknown browser origins are rejected. Requests without an `Origin` header remain available to non-browser clients, health checks, and tests. The same global origin check protects cookie-authenticated refresh and logout requests from untrusted browser origins.

**Refresh cookie policy:** Refresh cookies are `HttpOnly`, `SameSite=Lax`, scoped to `/v1/auth`, and `Secure` in production. `COOKIE_DOMAIN` is optional; empty or absent means a host-only API cookie and is the preferred production configuration. A domain attribute is supported only for explicit compatibility needs. Cookie clearing uses the same Domain, Path, Secure, HttpOnly, and SameSite attributes as cookie creation.

**Trusted proxy policy:** Proxy headers are not trusted by default. `TRUST_PROXY=false`, empty, or absent disables proxy trust. Enabling trust requires an explicit IP/CIDR allowlist for the controlled immediate proxy. `true` and numeric hop-count-only values are rejected because they cannot authenticate the immediate peer and can permit forwarded-header spoofing if the API is directly exposed. Even a one-proxy topology must identify the controlled ingress by IP/CIDR and must not leave the API directly reachable by untrusted clients. That topology is not implemented by this milestone.

**Development contract:** The API runs on port 4000, Student Web on 5173, and Counselor Web on 5174. Their explicit example environments keep local development Docker-independent.

**Status:** Accepted

## ADR-010 — Production Container Build Foundation

**Decision:** The API, Student Web, and Counselor Web use production-oriented multi-stage image definitions built from the monorepo root context. Dependency installation uses pnpm 11.24.0 from the root `packageManager` contract, workspace filters, and the frozen lockfile.

**Base runtime policy:** Node 24 on Debian Bookworm Slim is the API build/runtime base because it matches the verified local Node 24 runtime and avoids unnecessary Prisma/OpenSSL/native-module risk. Frontend build stages use the same Node base. Their final static runtimes use the official Nginx 1.28 Alpine image; this Nginx is an unprivileged, container-local file server only and is not the deferred public edge proxy.

**API policy:** TypeScript is compiled during image construction and production starts with `node dist/server.js` as the non-root `node` user. The committed Prisma client source is compiled into `dist`, while production dependencies are installed separately. Image construction never connects to the database or executes migrations. The existing `/health/live` endpoint is checked with Node's built-in `fetch`, avoiding an extra healthcheck package.

**Frontend policy:** Each web image requires the public `VITE_API_URL` build argument and uses the existing Vite production validation/build. Final images contain static `dist` output, run Nginx as the non-root `nginx` user on port 8080, and provide SPA history fallback. They do not run the Vite development server, terminate TLS, route public domains, or proxy API traffic.

**Secrets and operations:** Runtime secrets such as `DATABASE_URL` and `ACCESS_TOKEN_SECRET` are runtime environment inputs only and are not Docker build arguments or image defaults. Real environment files are excluded from the build context. Docker Compose, database orchestration, edge Nginx, TLS, deployment, and migration execution orchestration remain deferred. Local development remains Docker-independent, and actual image build/runtime execution is unverified until a Docker-capable environment is available.

**Status:** Accepted
