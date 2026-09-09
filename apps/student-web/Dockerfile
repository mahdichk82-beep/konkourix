FROM node:24-bookworm-slim AS build

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable && corepack prepare pnpm@11.24.0 --activate

WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/student-web/package.json apps/student-web/package.json
COPY apps/counselor-web/package.json apps/counselor-web/package.json

RUN pnpm install --frozen-lockfile --filter student-web...

COPY tsconfig.base.json ./
COPY apps/student-web apps/student-web

ARG VITE_API_URL
RUN test -n "$VITE_API_URL" || (echo "VITE_API_URL build argument is required" >&2 && exit 1)
RUN pnpm --filter student-web build

FROM nginx:1.28-alpine AS runtime

COPY infrastructure/docker/spa-nginx.conf /etc/nginx/nginx.conf
COPY --from=build /workspace/apps/student-web/dist /usr/share/nginx/html

USER nginx

EXPOSE 8080

ENTRYPOINT []
CMD ["nginx", "-g", "daemon off;"]
