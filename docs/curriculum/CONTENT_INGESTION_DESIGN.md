# Curriculum Content Ingestion Design

## Status and scope

This document defines a persistence-neutral foundation for educational content ingestion. It includes controlled domain types, provenance and lifecycle validation, and two isolated pilots: [Physics 12 Motion](PILOT_PHYSICS12_MOTION.md) and [Arabic 10 Lesson 1](PILOT_ARABIC10_LESSON1.md).

It imports no textbook, teacher material, official guide, exercise, or question. The pilots contain only short manual Definitions, Explanations, Examples, and one Arabic Note. It performs no OCR and changes no database, API, frontend, scheduling, recommendation, or analytics behavior.

## Curriculum structure versus educational content

Canonical Curriculum answers where learning material belongs: Scope, Grade, Subject, Chapter/Section, and explicit structural Lesson. The Knowledge Taxonomy will eventually describe reviewed Topic, Subtopic, Concept, Skill, and Question Pattern classifications.

Educational Content is separate. A Content Item is a reusable artifact such as:

- explanation;
- example;
- exercise;
- note;
- definition.

A Content Item never becomes a Subject, Chapter, Lesson, Topic, or Concept. Content mapping adds non-owning references to an existing structural Curriculum node and a separately reviewed taxonomy node. It cannot change either hierarchy.

## Source types and ownership

The controlled source vocabulary is:

- `TEXTBOOK`
- `OFFICIAL_GUIDE`
- `TEACHER_CONTENT`
- `QUESTION_BANK`
- `MANUAL_ENTRY`

`QUESTION_BANK` describes a possible future source of explanatory or exercise content; this milestone creates no questions or Question Bank records.

Every future Content Item must retain:

- `sourceType` — controlled source classification;
- `sourceReference` — exact external reference, locator, or governed source key;
- `createdBy` — accountable ingestion author/operator;
- `createdAt` — creation timestamp;
- `verificationStatus`;
- reviewer identity and timestamp when reviewed or approved.

`createdBy` records who created the Konkourix artifact. It does not transfer copyright or imply that person authored the external source. Copyright, license, publisher, edition, and permitted-use metadata must be designed before ingesting protected material.

## Verification lifecycle

```text
UNVERIFIED → REVIEWED → APPROVED
```

- `UNVERIFIED`: captured but not educationally reviewed; reviewer metadata is forbidden.
- `REVIEWED`: checked by an accountable reviewer; reviewer identity and timestamp are required.
- `APPROVED`: approved for authorized downstream use; reviewer evidence remains mandatory.

Skipping review, reversing state, or silently changing approved content is not allowed. Future persistence must use revisions so corrections do not rewrite approved historical artifacts.

## Mapping foundation

A future mapping contains:

```json
{
  "mappingKey": "<opaque stable key>",
  "contentKey": "<existing content key>",
  "curriculumVersionId": "<exact curriculum version>",
  "curriculumNodeId": "<existing structural node>",
  "taxonomyKey": "<existing reviewed taxonomy node>"
}
```

Validation requires both targets to exist, pins the same Curriculum Version as the taxonomy node, and confirms the structural and taxonomy targets resolve to the same subject. Name matching is not identity.

The mapping registry contains 24 unverified mappings across the two pilots. No content has been authorized for student-facing use.

## Validation rules

The current validator rejects:

- content without provenance;
- missing source reference, creator, or valid creation timestamp;
- reviewed or approved content without reviewer identity and timestamp;
- reviewer metadata on unverified content;
- duplicate or empty content and mapping keys;
- empty content bodies;
- mappings to missing content, structural nodes, or taxonomy nodes;
- Curriculum Version mismatch between mapping and taxonomy;
- structural and taxonomy targets owned by different subjects.

## Future import pipeline

1. Register an authorized source artifact and its ownership, copyright, edition, checksum, and permitted-use metadata.
2. Extract candidate units without altering source text. OCR, if later approved, remains a capture mechanism and never proves correctness.
3. Assign opaque stable content keys and complete provenance.
4. Quarantine ambiguous, incomplete, or unsupported candidates.
5. Validate content shape, provenance, lifecycle state, and duplicate keys.
6. Map candidates only to exact existing structural and reviewed taxonomy identities.
7. An authorized content reviewer accepts, rejects, or requests corrections.
8. A separate approver advances an exact reviewed revision to `APPROVED`.
9. Downstream consumers use only policy-authorized statuses and immutable version pins.

Database persistence, revision tables, copyright metadata, authorization capabilities, import manifests, APIs, and administration UX require separately approved architecture before implementation.

## Current invariants

- Educational Content Items: 24 isolated manual pilot items, 12 per pilot.
- Content mappings: 24, anchored only to the Physics chapter or Arabic lesson and their respective taxonomy nodes.
- Taxonomy registry: two `DRAFT` pilots; taxonomy nodes: 57.
- The [scaling architecture](SCALING_ARCHITECTURE.md) packages these exact items and mappings for read-only validation; it does not import or approve them.
- Structural curriculum checksum is unchanged.
- No educational meaning is inferred from the structural source.
- No Prisma schema, migration, database, API, frontend, OCR, question, scheduling, or analytics change is included.
