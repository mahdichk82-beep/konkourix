# Production Container Build Contract

Phase 0 Milestone 2 defines build and runtime images only. Docker is not installed on the development laptop, so the definitions are statically reviewed but have not yet been executed by a Docker engine. Local Node.js development remains Docker-independent.

All image builds use the repository root as their build context. The repository pins pnpm 11.24.0, and each build installs from `pnpm-lock.yaml` with `--frozen-lockfile` and a workspace filter.

## API image

Build definition: `apps/api/Dockerfile`

- Node 24 on Debian Bookworm Slim is used for build and runtime compatibility with the current Node 24 development runtime and Prisma/PostgreSQL dependencies.
- TypeScript is compiled with the existing `pnpm --filter api build` command. The generated Prisma client is committed under `apps/api/src/generated/prisma` and is compiled into `dist`; image construction does not access a database or run Prisma migrations.
- Only production dependencies, `package.json`, compiled `dist`, and the liveness script enter the final image.
- The final command is `node dist/server.js`, with `NODE_ENV=production`, `HOST=0.0.0.0`, and default `PORT=4000`.
- The process runs as the base image's non-root `node` user. Application files remain root-owned and read-only to that process.
- The image health check calls the existing `/health/live` endpoint using Node's built-in `fetch`; it does not add curl or another package.
- Runtime environment values required by the Milestone 1 contract, including `DATABASE_URL` and `ACCESS_TOKEN_SECRET`, must be supplied when the container is run. They are never Docker build arguments or image environment defaults.

## Web images

Build definitions: `apps/student-web/Dockerfile` and `apps/counselor-web/Dockerfile`

- Each image performs the existing Vite production build in its own filtered workspace.
- `VITE_API_URL` is a required public Docker build argument. Existing Vite validation rejects missing or malformed values and requires HTTPS in production mode.
- The final images contain only the generated `dist` files and a shared container-local Nginx configuration.
- Nginx listens unprivileged on port 8080 as the `nginx` user and provides SPA history fallback plus `/health/live`. It does not terminate TLS, route public domains, proxy API traffic, or provide cross-service ingress.

## Deferred work

Docker Compose, database orchestration, migration execution policy, edge Nginx, public domains, TLS, deployment, and runtime container validation are explicitly deferred to later authorized milestones.
