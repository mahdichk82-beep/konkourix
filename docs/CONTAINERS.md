# Production Container, Compose, and Edge Contract

Phase 0 Milestone 2 defines the production image contracts, Milestone 4 defines their first multi-service Compose foundation, and Milestone 5 defines the future HTTP edge routing layer. Docker and Nginx are not installed on the development laptop, so these layers are statically reviewed but have not been executed by their runtimes. Local Node.js development remains Docker-independent.

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

## Edge foundation

Definitions: `infrastructure/nginx/nginx.conf` and `infrastructure/nginx/conf.d/*.conf`

- Exact host routing maps `app.konkourix.ir` to `student-web:8080`, `counselor.konkourix.ir` to `counselor-web:8080`, and `api.konkourix.ir` to `api:4000`. An unmatched host receives Nginx's connection-closing 444 response instead of a default application.
- Proxy paths are not rewritten. Nginx passes request headers and cookies normally and overwrites `Host`, `X-Real-IP`, `X-Forwarded-For`, and `X-Forwarded-Proto` from the observed request. HTTP upgrade headers are ready for a later WebSocket endpoint without changing current application behavior.
- CORS remains solely in the API. The edge does not grant origins, alter cookie attributes, or implement authentication.
- `TRUST_PROXY` remains disabled until the edge has a controlled source address or network CIDR. At integration time, the API may trust only that explicit address/CIDR, and API port 4000 must remain unreachable directly from untrusted clients.
- Frontend requests proxy to the existing static containers, whose `try_files` behavior provides SPA fallback. The edge gives `/assets/` a one-year expiry because Vite filenames are content-hashed; other frontend routes use no-cache expiry.
- The edge emits the existing baseline `nosniff`, frame-denial, and no-referrer policy consistently. Other API security headers pass through. API request bodies are limited to 2 MiB at this layer.

The committed edge has only port 80 listeners. It contains no certificate paths, TLS directives, HSTS, DNS automation, Cloudflare integration, or deployment behavior. The production hostnames express the intended routing contract only; they are not a claim that the domains are active.

No edge image or Compose service is introduced in this milestone. Later authorized integration must package or mount these files, join the controlled internal network, publish the required edge ports, configure TLS, and set a matching explicit API proxy-trust value.

## Deferred work

Compose and Nginx runtime execution, edge packaging/Compose integration, migration execution orchestration, TLS, DNS activation, deployment, backups, and runtime infrastructure validation are explicitly deferred to later authorized milestones.
