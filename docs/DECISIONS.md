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
