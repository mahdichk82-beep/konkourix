# Governed Knowledge Package Educational Review

## Status and boundary

This document defines the persistence-neutral human review workflow for a `PRODUCTION_PACKAGE_CANDIDATE`. It records evidence supplied by a qualified human reviewer; it does not decide educational correctness, mutate package payloads, verify individual Content Items, approve a package, publish Curriculum, or persist data.

The current Physics 12 Motion candidate has no review session or decision. It remains `DRAFT` with package review `PENDING`, reviewer `null`, and `reviewedAt: null`.

Reviewer provenance is controlled as `HUMAN` or `AI_ASSISTED` at evidence intake and is never inferred from a display name. Only valid evidence explicitly classified `HUMAN` can satisfy the qualified-human review gate or authorize a later correction revision. AI evidence and its required human-triage workflow are documented in [KNOWLEDGE_PACKAGE_AI_REVIEW_TRIAGE.md](KNOWLEDGE_PACKAGE_AI_REVIEW_TRIAGE.md).

## Exact review subject

Review schema `konkourix-knowledge-package-review/v1` binds every session to:

- stable package ID;
- package revision ID and revision number;
- payload SHA-256 and package-revision SHA-256;
- structural subject and scope;
- provisional Curriculum snapshot reference.

These fields identify the immutable review subject. Validation rejects any mismatch. A Revision 1 decision cannot be applied to Revision 2, even when the stable package ID is unchanged.

## Controlled dimensions

Every accepted review requires one explicit human disposition for each stable dimension code:

- `TERMINOLOGY`
- `TAXONOMY_HIERARCHY`
- `FORMULA_CORRECTNESS`
- `SIGN_CONVENTIONS`
- `UNITS`
- `EXAMPLE_WORDING`
- `PERSIAN_LANGUAGE_QUALITY`
- `TAXONOMY_GRANULARITY`
- `SKILL_WORDING`
- `QUESTION_PATTERN_BOUNDARIES`
- `CONTENT_CORRECTNESS`
- `PROVENANCE_APPROPRIATENESS`

Human-facing labels are presentation only. The stable codes are review identity. Machine validation checks completeness, not the educational merits of a decision.

Dimension dispositions are `ACCEPTED_AS_IS`, `CHANGES_REQUIRED`, and `NOT_APPLICABLE`. An `ACCEPTED` session cannot retain `CHANGES_REQUIRED`.

## Session lifecycle

The workflow reuses the package review status vocabulary:

- `PENDING`: no reviewer, timestamps, decisions, or findings;
- `IN_REVIEW`: reviewer and valid `startedAt` required; `reviewedAt` forbidden;
- `CHANGES_REQUESTED`: reviewer, `startedAt`, and `reviewedAt` required, with at least one open actionable finding;
- `ACCEPTED`: reviewer, `startedAt`, and `reviewedAt` required, every mandatory dimension explicitly disposed, and no open blocking finding.

A valid `ACCEPTED` session is only evidence that the exact revision is eligible for a later explicit package transition to `REVIEWED`. Validation never performs that transition. `REVIEWED`, `APPROVED`, and published Curriculum remain separate governed states, and direct `DRAFT → APPROVED` is forbidden.

## Finding model

Each finding has an opaque finding ID, owning review-session ID, controlled dimension, `ADVISORY` or `BLOCKING` severity, status, exact target kind/key, reviewer note, required action where open, and human-supplied creation identity/time.

Allowed targets are existing `PACKAGE`, `TAXONOMY_NODE`, `CONTENT_ITEM`, or `MAPPING` identities. Validation rejects missing targets and duplicate finding IDs. Finding statuses are `OPEN`, `RESOLVED`, `ACCEPTED_AS_IS`, and `NOT_APPLICABLE`; they do not replace package review status.

## Stale-review protection and history

Applying review evidence recalculates no identity and changes no payload. Validation compares the evidence with the current candidate and rejects stale package ID, revision ID, revision number, payload checksum, package checksum, subject, scope, or snapshot.

Review history retains sessions against their original revisions. A historical Revision 1 session remains evidence for Revision 1 after Revision 2 is authored, but becomes stale if presented as evidence for Revision 2.

## Review packet and input template

The deterministic [Physics review packet](PHYSICS12_MOTION_REVIEW_PACKET.md) contains exact identities, checksums, structural binding, rebind warning, all taxonomy/content/mapping inventories, mandatory dimensions, and blank decision/finding sections. It contains no reviewer answer.

The source-control-friendly [review input template](PHYSICS12_MOTION_REVIEW_INPUT.template.json) is a valid blank `PENDING` shape after a human replaces `<review-session-id>` with a stable opaque session ID. A reviewer advances the status and supplies only their own identity, timestamps, decisions, and findings. The template contains no credentials or invented review evidence.

The packet generator and checked-in packet are tested for deterministic equivalence. Runtime timestamps and reviewer data are never generated automatically.

## Change request and new revision

When Revision 1 receives qualified-human `CHANGES_REQUESTED`, Revision 1 and its review session remain immutable history. AI-assisted `CHANGES_REQUESTED` alone cannot authorize a correction. Later authorized authoring creates Revision 2 with:

- the same stable package ID;
- a new opaque revision ID;
- revision number incremented by one;
- `supersedesRevisionId` and an exact predecessor checksum reference;
- recalculated payload and package checksums;
- lifecycle reset to `DRAFT`;
- review reset to `PENDING`, reviewer `null`, and `reviewedAt: null`.

Only the mechanism is implemented here. No real Revision 2 or educational correction is committed.

## Independent Content verification

Package review does not change Content verification. The current 12 Physics Content Items remain `UNVERIFIED`; any `UNVERIFIED → REVIEWED` transition requires separate Content evidence under [CONTENT_INGESTION_DESIGN.md](CONTENT_INGESTION_DESIGN.md).

Question Pattern review concerns taxonomy classification boundaries only. It creates no question stem, option, answer, score, difficulty, or Question Bank entity.

## Readiness boundary

Readiness reports expose machine structure, educational review outcome, package lifecycle, persistence, and publication separately. Even valid synthetic `ACCEPTED` evidence leaves persistence `BLOCKED_PENDING_CURRICULUM_VERSION_REBIND` and publication `NOT_AUTHORIZED` while the provisional structural snapshot has not been rebound to a real database Curriculum Version.
