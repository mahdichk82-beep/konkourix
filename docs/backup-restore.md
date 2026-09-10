# Backup and Restore Design

This is the Phase 0 design contract only. No backup script, schedule, storage account, cron job, database dump, or restore operation is implemented or executed by this milestone.

## Current data scope

- PostgreSQL is the authoritative product data store.
- Compose persists PostgreSQL in the `postgres-data` named volume. A named volume is persistence, not a backup.
- No upload or file-storage subsystem currently exists, so there is no upload dataset to back up today.
- Runtime environment files and secrets are not application data and must be recovered from a separately controlled secret-management process, never from source control.

## PostgreSQL backup design

The future backup job should:

1. Run from a controlled environment with a dedicated least-privilege backup role and secrets supplied without command-line or log exposure.
2. Use a PostgreSQL client version compatible with the production server and create a consistent logical dump, preferably PostgreSQL custom format for selective and parallel restore support.
3. Record non-secret metadata alongside the artifact: UTC creation time, PostgreSQL version, repository release/commit, applied migration state, dump format, size, and cryptographic checksum.
4. Encrypt the artifact before or during transfer and store it off-host in access-controlled storage with versioning or immutability where available.
5. Verify command success, non-zero artifact size, checksum, and remote persistence before reporting success. Partial or failed artifacts must not count as backups.
6. Alert on failure and on backup age exceeding the approved recovery point objective.

Passwords and database URLs must not appear in command arguments, filenames, manifests, alerts, or logs. A protected password file, process environment supplied by a secret manager, or equivalent mechanism should be selected during deployment design.

## Retention and lifecycle

A candidate starting lifecycle is seven daily, four weekly, and twelve monthly recovery points, with at least one encrypted copy outside the production host. This is not active policy: the product owner and operator must approve retention against legal obligations, storage cost, recovery point objective, and deletion requirements before production.

Deletion must be automatic, auditable, and applied to expired backup artifacts and keys without deleting the newest known-good restore point. Access to create backups should be distinct from permission to destroy all retained copies where the storage provider permits it.

## Restore verification

A backup is not considered usable until restored successfully. The future restore drill should:

1. Select an artifact and verify its checksum and encryption metadata.
2. Provision an isolated, non-production PostgreSQL instance with a compatible server version and no production network access.
3. Restore into an empty database using credentials created for the drill. Never use `--clean` or destructive restore options against an unidentified target.
4. Confirm the restore command completed without ignored errors.
5. Verify Prisma migration status and expected migration count without rewriting migration history.
6. Start the API against the isolated database with temporary non-production secrets and verify readiness plus representative read-only/domain integrity checks.
7. Record duration, result, artifact identifier, PostgreSQL version, application commit, reviewer, and any remediation.
8. Destroy the temporary environment and credentials through the approved disposal process after evidence is retained.

Restore drills should occur on a schedule approved before launch and after material database/version changes. The recovery point objective and recovery time objective are intentionally not invented here; they require product and operational ownership.

## Future uploaded files

If file uploads are later authorized, their bytes and database ownership metadata form one recovery unit. The design must define server-generated object keys, checksums, encryption, retention/deletion, non-executable serving, and a consistent way to correlate the database backup with the file snapshot or object-store version.

File backups must be off-host and restore-tested into an isolated location. A database restore without its matching file generation—or files without matching ownership metadata—is incomplete. No host-path upload volume or object-storage provider is selected by this milestone.

## Required evidence before production

- Approved backup owner, schedule, retention, RPO, and RTO.
- Successful encrypted off-host backup with checksum evidence.
- Successful isolated restore report and application-level verification.
- Restricted backup credentials and reviewed storage access policy.
- Failure/age alerting and periodic restore-drill schedule.

Until that evidence exists, backup and restore status remains **DESIGN ONLY; UNVERIFIED**.
