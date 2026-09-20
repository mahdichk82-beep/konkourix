# Curriculum Scaling Architecture

## Status and boundary

This document defines the persistence-neutral tooling used to prepare small, reviewable Curriculum Knowledge expansion units. It packages the existing taxonomy and content-ingestion foundations without importing data into PostgreSQL, changing the structural curriculum, or publishing educational content.

The Physics 12 Motion and shared Arabic 10 Lesson 1 pilots are the only registered packages. Both remain `DRAFT`, use `MANUAL_ENTRY`, and reference the frozen structural candidate provisionally. The frozen candidate identifier is not a database Curriculum Version UUID and must be rebound through a separately approved persistence workflow before any future database import.

The scaling layer does not implement bulk import, OCR, AI generation, Question Bank records, analytics, scheduling, study planning, APIs, or frontend workflows.

## Lessons from the pilots

The two pilots established the invariants that must survive expansion:

- knowledge taxonomy is separate from structural Subject, Chapter, and explicit Lesson nodes;
- every package pins one exact Curriculum Version, structural subject, and structural scope;
- mathematical and language taxonomies can use the same controlled hierarchy without forcing the same decomposition;
- shared subjects remain owned once. Arabic 10 is anchored to `shared.g10.arabic` and reaches Human Sciences through structural applicability, not duplicated ownership;
- Question Pattern nodes are classification labels only and are not Question Bank records;
- content remains independent from taxonomy and is connected through explicit, resolvable mappings;
- validation must not modify package status, review status, source data, or the frozen structural checksum.

The pilot layer remains the evidence fixture. The scaling layer wraps those exact arrays; it does not copy or reinterpret them.

## Draft import package model

A Draft Knowledge Import Package is the governance envelope for one source-bound expansion unit:

```json
{
  "packageId": "<stable opaque package key>",
  "subject": "<existing structural subject ref>",
  "structuralScope": "<existing chapter or lesson ref>",
  "curriculumVersionId": "<exact version or governed candidate identifier>",
  "sourceType": "MANUAL_ENTRY",
  "status": "DRAFT",
  "review": {
    "reviewer": null,
    "reviewedAt": null,
    "reviewStatus": "PENDING"
  }
}
```

`subject` is the canonical owner. `structuralScope` is the smallest existing structural node covered by the package. A package does not create or rename structural nodes.

Controlled package statuses are:

```text
DRAFT → VALIDATED → REVIEWED → APPROVED
```

- `DRAFT`: editable authoring material; validation or review may not be complete.
- `VALIDATED`: the exact manifest passed machine validation. This state is not educational approval.
- `REVIEWED`: an accountable human reviewer accepted the exact package revision.
- `APPROVED`: a separately governed decision accepted the reviewed package for a future downstream process. It does not publish or import the package.

The validator reports validity and never changes status. Status changes must be explicit actions in a future authorized workflow. Direct `DRAFT → APPROVED` and rollback from `APPROVED` are forbidden. Corrections after an approved package require a new governed revision rather than mutation.

## Knowledge expansion manifest

Manifest schema version `1.0.0` contains:

```json
{
  "manifestSchemaVersion": "1.0.0",
  "package": "<Draft Knowledge Import Package>",
  "structuralAnchor": {
    "subjectId": "<existing subject ref>",
    "curriculumNodeId": "<existing structural scope ref>",
    "curriculumVersionId": "<exact version pin>"
  },
  "taxonomyNodes": [],
  "contentItems": [],
  "mappings": []
}
```

The explicit anchor intentionally repeats the package identity at the payload boundary. Validation rejects disagreement between the envelope and payload, preventing a reviewed payload from being attached to a different subject, structural scope, or Curriculum Version.

Each current manifest is an in-repository TypeScript data object. This milestone does not add a file-upload parser, database writer, command that imports packages, or external serialization contract. A durable interchange encoding and checksum/signature envelope require a later decision before external package intake.

## Draft validation pipeline

Validation is read-only and runs in this order:

1. Validate manifest version, stable package identity, Curriculum Version pin, and non-empty payload sections.
2. Resolve the package subject and structural scope against the audited structural catalog.
3. Confirm that the scope is owned by the package subject and that the explicit anchor exactly matches the package envelope.
4. Confirm all taxonomy nodes stay within that subject, scope, and Curriculum Version.
5. Reuse the Knowledge Taxonomy validator for hierarchy, taxonomy provenance, duplicate keys, registry compatibility, and cross-subject ownership.
6. Confirm Content Item source types match the package source type.
7. Reuse the Content Ingestion validator for provenance, content lifecycle, mapping resolution, version consistency, and ownership.
8. Validate package review metadata without advancing lifecycle state.
9. For a set of packages, reject duplicate package IDs and taxonomy, content, or mapping key collisions across package boundaries.

A report contains package counts, the original nested taxonomy/content reports, and normalized package-level issues. Validation failure quarantines the candidate for author correction; it does not partially accept records.

## Review workflow foundation

Review metadata is part of the package envelope:

- `reviewer`: accountable reviewer identity, or `null` before assignment;
- `reviewedAt`: completion timestamp, or `null` while review is pending/in progress;
- `reviewStatus`: `PENDING`, `IN_REVIEW`, `CHANGES_REQUESTED`, or `ACCEPTED`.

Rules:

- `PENDING` forbids reviewer identity and completion time.
- `IN_REVIEW` requires an assigned reviewer and forbids a completion time.
- `CHANGES_REQUESTED` and `ACCEPTED` require reviewer identity and a valid completion timestamp.
- Package status `REVIEWED` or `APPROVED` requires `reviewStatus: ACCEPTED`.
- A `DRAFT` package cannot claim an accepted review.

The current Physics and Arabic manifests use `PENDING` with no reviewer metadata. No review or approval is implied by their successful validation.

## Manual review points

Human judgment remains mandatory for:

- selecting the exact structural anchor and confirming subject ownership;
- deciding whether a proposed Topic/Subtopic/Concept/Skill/Question Pattern expresses supported educational meaning;
- evaluating Persian and Arabic labels, definitions, examples, and source fidelity;
- resolving ambiguous or conflicting source material;
- verifying copyright, licensing, source authority, and permitted use before protected content ingestion;
- accepting corrections after validation;
- approving a reviewed package for any future persistence or consumer use.

Machine validation proves referential and lifecycle consistency. It does not prove educational correctness, source authority, legal permission, or publication readiness.

## Future automation boundaries

Future tooling may automate deterministic work such as schema parsing, checksum calculation, duplicate detection, structural lookup by stable ID, validation report generation, and review queues.

Automation must not:

- infer concepts from structural headings;
- silently resolve ambiguity;
- match structural ownership only by normalized names;
- generate approved taxonomy or content;
- skip reviewer identity or timestamps;
- advance a package to `REVIEWED` or `APPROVED` merely because validation passed;
- import or publish package data without a separately authorized workflow;
- rewrite historical structural, taxonomy, content, or consumer references.

AI-assisted proposals, OCR, bulk ingestion, persistence, authorization, revision storage, and publication each require separately approved architecture and tests. Any future implementation must preserve provenance and treat generated output as unverified draft material.

## Current registered package inventory

| Package | Structural scope | Taxonomy nodes | Content items | Mappings | Status |
|---|---|---:|---:|---:|---|
| Physics 12 Motion | Mathematics & Physics, Physics 3, Chapter 1 | 30 | 12 | 12 | `DRAFT` |
| Arabic 10 Lesson 1 | Shared Arabic 1, Lesson 1; applicable to Human Sciences Grade 10 | 27 | 12 | 12 | `DRAFT` |

The package set therefore contains 2 packages, 57 taxonomy nodes, 24 Content Items, and 24 mappings. The structural catalog remains unchanged and authoritative.

## Production package candidate revision layer

The first production package candidate wraps the existing Physics 12 Motion pilot without replacing it. `packageKind` distinguishes the original `PILOT` evidence envelope from `PRODUCTION_PACKAGE_CANDIDATE`. The candidate holds a stable opaque package ID, an opaque revision ID, a positive revision number, an exact source-pilot reference, deterministic payload and package-revision checksums, and the same structural anchor and payload arrays as the pilot.

The payload checksum covers the ordered taxonomy, Content Item, and mapping arrays. The package checksum covers the complete candidate revision except its own checksum field. Both use canonical JSON key ordering and contain no runtime timestamp, random value, filesystem path, or environment-specific input. A future correction keeps the stable package identity and creates a new revision identity and number; it does not mutate a reviewed or approved revision.

Production-candidate validation composes the existing draft validation pipeline and additionally requires exact pilot reuse, opaque identities, collision-free package/revision and payload keys, `DRAFT` / `PENDING` state, wholly `UNVERIFIED` Content, the audited frozen structural checksum, and an explicit `REQUIRES_CURRICULUM_VERSION_REBIND_BEFORE_PERSISTENCE` state with no database Curriculum Version UUID. Its deterministic readiness report separates machine structure, educational review, persistence, and publication status.

The current Physics candidate is machine-valid but remains educationally pending, persistence-blocked pending an exact Curriculum Version rebind, and not authorized for publication. Details and the uncompleted human-review specification are in [PRODUCTION_PACKAGE_PHYSICS12_MOTION.md](PRODUCTION_PACKAGE_PHYSICS12_MOTION.md).

The governed human-review evidence model, checksum binding, stale-review rejection, review history, deterministic packet, and change-request revision flow are defined in [KNOWLEDGE_PACKAGE_REVIEW.md](KNOWLEDGE_PACKAGE_REVIEW.md). Review evidence remains external to the immutable package revision and cannot automatically change package or Content lifecycle.

## Exit boundary

This foundation is complete when draft packages can be validated independently and as a collision-safe set, both pilots remain compatible, and the frozen structural checksum remains unchanged. It does not authorize importing, reviewing, approving, persisting, or publishing any package.
