FROM node:24-bookworm-slim AS pnpm

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable && corepack prepare pnpm@11.24.0 --activate

WORKDIR /workspace

FROM pnpm AS build

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/student-web/package.json apps/student-web/package.json
COPY apps/counselor-web/package.json apps/counselor-web/package.json

RUN pnpm install --frozen-lockfile --filter api...

COPY tsconfig.base.json ./
COPY apps/api apps/api

RUN pnpm --filter api build

FROM pnpm AS production-dependencies

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/student-web/package.json apps/student-web/package.json
COPY apps/counselor-web/package.json apps/counselor-web/package.json

RUN pnpm install --frozen-lockfile --prod --filter api...

FROM node:24-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4000

WORKDIR /app/apps/api

COPY --from=production-dependencies /workspace/node_modules /app/node_modules
COPY --from=production-dependencies /workspace/apps/api/node_modules ./node_modules
COPY --from=production-dependencies /workspace/apps/api/package.json ./package.json
COPY --from=build /workspace/apps/api/dist ./dist
COPY infrastructure/docker/api-healthcheck.mjs /app/api-healthcheck.mjs

USER node

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["node", "/app/api-healthcheck.mjs"]

CMD ["node", "dist/server.js"]
