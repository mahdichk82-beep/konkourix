# Production Container and Compose Contract

Phase 0 Milestone 2 defines the production image contracts, and Milestone 4 defines their first multi-service Compose foundation. Docker is not installed on the development laptop, so both layers are statically reviewed but have not been executed by a Docker engine. Local Node.js development remains Docker-independent.

All image builds use the repository root as their build context. The repository pins pnpm 11.24.0, and each build installs from `pnpm-lock.yaml` with `--frozen-lockfile` and a workspace filter.

## API image

Build definition: `apps/api/Dockerfile`

- Node 24 on Debian Bookworm Slim is used for build and runtime compatibility with the current Node 24 development runtime and Prisma/PostgreSQL dependencies.
- TypeScript is compiled with the existing `pnpm --filter api build` command. The generated Prisma client is committed under `apps/api/src/generated/prisma` and is compiled into `dist`; image construction does not access a database or run Prisma migrations.
- Only production dependencies, `package.json`, compiled `dist`, and the liveness script enter the final image.
- The final command is `node dist/server.js`, with `NODE_ENV=production`, `HOST=0.0.0.0`, and default `PORT=4000`.
- The process runs as the base image's non-root `node` user. Application files remain root-owned and read-only to that process.
- The image health check calls the existing `/health/live` endpoint by default using Node's built-in `fetch`; it does not add curl or another package. Compose selects the existing database-aware `/health` endpoint through `HEALTHCHECK_PATH`.
- Runtime environment values required by the Milestone 1 contract, including `DATABASE_URL` and `ACCESS_TOKEN_SECRET`, must be supplied when the container is run. They are never Docker build arguments or image environment defaults.

## Web images

Build definitions: `apps/student-web/Dockerfile` and `apps/counselor-web/Dockerfile`

- Each image performs the existing Vite production build in its own filtered workspace.
- `VITE_API_URL` is a required public Docker build argument. Existing Vite validation rejects missing or malformed values and requires HTTPS in production mode.
- The final images contain only the generated `dist` files and a shared container-local Nginx configuration.
- Nginx listens unprivileged on port 8080 as the `nginx` user and provides SPA history fallback plus `/health/live`. It does not terminate TLS, route public domains, proxy API traffic, or provide cross-service ingress.

## Compose foundation

Definition: `docker-compose.yml`

- `api`, `student-web`, and `counselor-web` build from the repository root with their existing Dockerfiles. Both frontend builds receive the same required public `VITE_API_URL`; it is not a secret.
- `postgres` uses the official PostgreSQL 17 Bookworm image. `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` are required external inputs, and data is stored in the `postgres-data` named volume.
- The API receives its Milestone 1 runtime values externally. `DATABASE_URL` must use the Compose service name `postgres` as its host and must contain URL-encoded credentials when needed. Compose does not construct the URL from password fields because that would mishandle reserved characters.
- PostgreSQL is checked with `pg_isready`. The API has a health-based dependency on PostgreSQL and uses `/health` for its own Compose health status, while the image's standalone default remains `/health/live`.
- All four services join `konkourix-internal`, a Compose-managed bridge network with external routing disabled. The services declare only their internal ports (API 4000, web 8080, PostgreSQL 5432); no host ports are published.
- Frontend services do not depend on API container startup because the generated browser applications call the external URL embedded as `VITE_API_URL`, not an internal container URL.
- Compose does not run Prisma migrations. An operator or later authorized orchestration layer must apply the committed migrations before serving product traffic.

`.env.production.example` documents all Compose inputs using reserved example domains and explicit non-secret placeholders. In a Docker-capable environment, actual values may be supplied through an ignored `.env` or an equivalent environment mechanism. Never commit that runtime file.

The absence of published ports is intentional: this foundation is not directly public. A future edge service may join the internal network and publish only approved entry points, but that routing is not part of this milestone.

## Deferred work

Compose runtime execution, migration execution orchestration, edge Nginx, public-domain routing, TLS, deployment, backups, and runtime infrastructure validation are explicitly deferred to later authorized milestones.
