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
