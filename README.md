# Konkourix

Konkourix is a specialized exam-preparation ecosystem built as a pnpm monorepo with a Fastify API and separate Student and Counselor React applications. Its current foundation separates planned educational intention (`DailyTask`), actual study execution (`StudySession`), and completed assessment evidence (`AssessmentAttempt`). The product interfaces and production deployment are not complete.

## Toolchain

- Node.js 24.x; `.node-version` records the verified version, 24.19.0.
- pnpm 11.24.0, declared by the root `packageManager` field.
- API tests use the Node.js test runner through `tsx`.
- Frontend linting uses Oxlint; builds use TypeScript and Vite.

Use Corepack to activate the repository's pnpm version when needed:

```sh
corepack enable
corepack prepare pnpm@11.24.0 --activate
pnpm install
```

Do not use npm or Yarn to install workspace dependencies. Keep `pnpm-lock.yaml` committed and use `pnpm install --frozen-lockfile` when verifying a clean checkout.

## Local environment

Local development uses Node.js processes and a locally reachable PostgreSQL database. Docker is not installed or required.

1. Copy the root `.env.example` to `.env`.
2. Replace the database placeholder and generate a local-only `ACCESS_TOKEN_SECRET` of at least 32 characters. Never commit `.env`.
3. Copy each frontend example to its app-local environment file:

```sh
cp apps/student-web/.env.example apps/student-web/.env.local
cp apps/counselor-web/.env.example apps/counselor-web/.env.local
```

PowerShell users can perform the same setup with `Copy-Item`. The documented local origins are API `http://localhost:4000`, Student Web `http://localhost:5173`, and Counselor Web `http://localhost:5174`. The API requires PostgreSQL through `DATABASE_URL`; no database container is required by this local workflow. A separate production-oriented Compose foundation is statically verified but has not been run locally.

## Development commands

Run each long-lived application in its own terminal:

```sh
pnpm dev
pnpm dev:student
pnpm dev:counselor
```

The root `dev`, `build`, `test`, and `typecheck` commands retain their existing API scope. Explicit frontend and aggregate commands are available as follows:

| Command | Purpose |
| --- | --- |
| `pnpm build` | Build the API |
| `pnpm build:student` | Build Student Web |
| `pnpm build:counselor` | Build Counselor Web |
| `pnpm build:all` | Build all three applications |
| `pnpm test` | Run the API test suite |
| `pnpm test:student` | Run the Student Web unit tests |
| `pnpm test:counselor` | Run the Counselor Web unit tests |
| `pnpm typecheck` | Type-check the API |
| `pnpm lint` | Lint both frontend applications |
| `pnpm db:validate` | Validate the Prisma schema without running migrations |
| `pnpm validate` | Run the complete canonical local validation gate |

Curriculum operators can preflight or execute the governed Human Sciences, Mathematics & Physics, and Experimental Sciences structural imports with `pnpm --filter api curriculum:import-human-sciences`, `pnpm --filter api curriculum:import-mathematics-physics`, and `pnpm --filter api curriculum:import-experimental-sciences`. Every command requires the original reviewed source artifact and never publishes a Curriculum Version. See the field-specific import runbooks below.

Production-mode frontend builds require a public HTTPS `VITE_API_URL`. Use a safe non-secret value for local validation:

```sh
VITE_API_URL=https://api.example.test pnpm validate
```

PowerShell:

```powershell
$env:VITE_API_URL='https://api.example.test'
pnpm validate
```

The validation command runs API and focused frontend tests, API type-check/build, frontend lint/build, and Prisma schema validation. It does not start services, run migrations, or require Docker.

## Additional documentation

- [Product vision](docs/PRODUCT_VISION.md)
- [Domain map](docs/DOMAIN_MAP.md)
- [Architecture baseline](docs/ARCHITECTURE.md)
- [Product decisions](docs/PRODUCT_DECISIONS.md)
- [UX principles](docs/UX_PRINCIPLES.md)
- [Future expansion](docs/FUTURE_EXPANSION.md)
- [Roadmap](docs/ROADMAP.md)
- [API contracts](docs/API.md)
- [Project state](docs/PROJECT_STATE.md)
- [Human Sciences curriculum import](docs/curriculum/HUMAN_SCIENCES_IMPORT.md)
- [Mathematics & Physics curriculum import](docs/curriculum/MATHEMATICS_PHYSICS_IMPORT.md)
- [Experimental Sciences curriculum import](docs/curriculum/EXPERIMENTAL_SCIENCES_IMPORT.md)
- [Curriculum freeze and audit](docs/curriculum/CURRICULUM_FREEZE.md)
- [Curriculum knowledge taxonomy design](docs/curriculum/TAXONOMY_DESIGN.md)
- [Curriculum content ingestion design](docs/curriculum/CONTENT_INGESTION_DESIGN.md)
- [Physics 12 Motion curriculum knowledge pilot](docs/curriculum/PILOT_PHYSICS12_MOTION.md)
- [Arabic 10 Lesson 1 cross-domain knowledge pilot](docs/curriculum/PILOT_ARABIC10_LESSON1.md)
- [Curriculum scaling architecture](docs/curriculum/SCALING_ARCHITECTURE.md)
- [Technical architectural decisions](docs/DECISIONS.md)
- [Production container, Compose, and edge contract](docs/CONTAINERS.md)
- [Production security and operations contract](docs/SECURITY.md)
- [Backup and restore design](docs/backup-restore.md)
- [Production deployment preparation](docs/deployment.md)
