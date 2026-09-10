# Production Security and Operations Contract

This document records the Phase 0 Milestone 6 security and operational baseline. It is a reviewed contract, not evidence of deployment or full production hardening. Docker, Nginx, TLS, DNS, monitoring, and restore execution remain unverified locally.

## Transport and browser boundary

- Production public origins are required to use HTTPS by API and frontend environment validation. The current edge configuration is HTTP-only; TLS termination, certificates, HSTS, DNS, and Cloudflare remain mandatory pre-production work.
- API responses set `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, a restrictive API Content-Security-Policy, and a restrictive Permissions-Policy. The edge replaces only the three shared baseline headers with the same values and preserves the other API headers.
- CORS is an exact, credentialed allowlist owned by the API. The student and counselor origins must both be configured in production. Nginx does not add CORS headers.
- Refresh cookies remain `HttpOnly`, `Secure` in production, `SameSite=Lax`, scoped to `/v1/auth`, and host-only by default. Creation and clearing use matching attributes.
- Proxy headers are ignored unless `TRUST_PROXY` names an explicit trusted IP/CIDR. When the edge is integrated, the API must trust only the controlled edge source, and API port 4000 must not be directly reachable by untrusted clients.

## Authentication, input, and secret handling

- Route inputs use strict Zod schemas and backend role/ownership checks remain authoritative.
- Passwords use salted, parameterized scrypt hashes and timing-safe comparison. Login does equivalent password-hash work for unknown accounts to reduce account-enumeration timing differences.
- Refresh tokens are random, only SHA-256 hashes are stored, and rotation/reuse handling remains active. Access-token and cookie architecture is unchanged by this milestone.
- Runtime secrets are provided through ignored runtime environment files or an equivalent secret source. They are not Docker build arguments, Compose literals, documentation values, or frontend variables.
- `VITE_API_URL` is public build configuration and must never carry credentials. Database URLs, token secrets, passwords, cookies, and private tokens must never be placed in frontend variables or image layers.

## Logging contract

The API disables Fastify's duplicate automatic request logs and emits one structured completion event with:

- log timestamp and request start time;
- HTTP method and normalized route pattern, never the raw query string;
- status code and duration in milliseconds;
- request ID;
- authenticated user ID when authentication completed successfully.

Unhandled and lifecycle errors log only a short validated error name/code plus the request ID where available. Arbitrary error messages and stacks are excluded because library/database errors can contain credentials or internal topology. Client responses remain the primary correlation point through `X-Request-Id`.

Pino redaction defensively covers authorization/cookie headers, `Set-Cookie`, passwords, tokens, secrets, and database URLs. Application code must not log request/response bodies, authorization headers, cookies, raw tokens, password hashes, environment objects, or database connection strings. Redaction is a safety net, not permission to log sensitive objects.

The edge access log contains remote address, host, timestamp, edge request ID, method, normalized `$uri` without arguments, protocol, status, response bytes, and duration. It does not log query strings, referrers, user agents, cookies, authorization headers, or request bodies. The edge replaces inbound `X-Request-Id` with its own value and forwards it to the API for correlation.

Production log access and retention must be restricted because IP addresses, user IDs, and routes are operational personal data. A retention period and deletion policy must be approved before deployment.

## Error contract

- Expected `ApiError` responses use the standard envelope and deliberately selected public messages. Error `details` may be used only for reviewed, non-sensitive client information.
- Framework validation failures return `VALIDATION_ERROR` without raw parser/schema internals.
- Unexpected failures return HTTP 500 with `INTERNAL_ERROR`, a generic message, and a request ID. Stack traces and internal exception messages are not sent to clients.
- Unknown routes return the standard `NOT_FOUND` response. Database readiness failures return a generic `DATABASE_UNAVAILABLE` response without connection details.

## Liveness and readiness

The repository has no `/ready` alias. The canonical endpoints are:

| Purpose | Unversioned | Versioned | Contract |
| --- | --- | --- | --- |
| Liveness | `/health/live` | `/v1/health/live` | Confirms the API process can answer; does not query PostgreSQL. |
| Readiness | `/health` | `/v1/health` | Runs `SELECT 1`; returns 200 only when PostgreSQL is reachable, otherwise a sanitized 503. |

Health responses expose only status, environment name, database connectivity state, and request ID. They contain no credentials, database URL, host details, or exception text. The API image defaults to liveness; Compose selects readiness for its service-health decision.

## Authentication rate limiting

The API applies a bounded, per-process, per-client-IP fixed-window limiter before these public operations:

| Route | Limit |
| --- | --- |
| `POST /v1/auth/register` | 10 attempts per 10 minutes |
| `POST /v1/auth/login` | 20 attempts per minute |
| `POST /v1/auth/refresh` | 60 attempts per minute |

All attempts count, successful or unsuccessful. Exceeded limits return HTTP 429 with the standard `RATE_LIMITED` error and `Retry-After`. Logout is deliberately not limited so a client can always end a session.

The limiter tracks at most 10,000 IP/route buckets and removes expired entries. State resets on process restart and is not shared across replicas, so it is a safe single-process baseline rather than distributed abuse protection. Before horizontal scaling, deploy a reviewed shared limiter or controlled edge policy. Correct client attribution also depends on the explicit trusted-edge proxy configuration described above.

## Upload and storage boundary

No upload endpoint or file-storage subsystem currently exists. The PostgreSQL named volume is the only current persistent application data contract.

Before uploads are introduced, the implementation must enforce application and edge size limits, inspect content rather than trust filenames or client MIME types, generate server-side names, prevent path traversal, store files outside executable/public source paths, restrict permissions, define malware scanning/quarantine, and record ownership metadata. Executable content must never be served with an executable content type. Storage and backup design must be approved before enabling uploads.

## Pre-production checklist

Every item remains incomplete until verified in the actual production environment:

- [ ] Generate unique high-entropy database and access-token secrets; store them outside Git and image layers with least-privilege access.
- [ ] Configure final HTTPS URLs, both CORS origins, host-only API cookie behavior, and explicit trusted-edge IP/CIDR.
- [ ] Install and validate TLS termination/certificates, then review redirects, HSTS, protocol versions, and cipher policy.
- [ ] Configure and verify DNS without exposing API, frontend, or database container ports directly.
- [ ] Build and run images/Compose/Nginx in a Docker-capable staging environment; run Nginx syntax checks there.
- [ ] Apply committed Prisma migrations as an explicit controlled step and verify migration status before traffic.
- [ ] Use least-privilege runtime and backup database roles; verify filesystem and named-volume permissions.
- [ ] Create an encrypted off-host database backup and complete a documented isolated restore drill.
- [ ] Approve backup retention, recovery point objective, recovery time objective, and deletion responsibilities.
- [ ] Configure restricted log collection, retention, rotation, alerting, and access review without sensitive payload capture.
- [ ] Add external monitoring for edge availability, API liveness/readiness, resource saturation, and backup freshness.
- [ ] Reassess rate limiting for real traffic, shared ingress, and any horizontal API scaling.
- [ ] Review upload/storage controls before adding any file endpoint or persistent upload volume.
- [ ] Perform production-focused dependency, authorization, abuse, and security-header review.
- [ ] Document rollback and incident-response ownership and verify recovery procedures.

Completing this checklist requires separate authorization and evidence. Nothing in this document claims production availability.
