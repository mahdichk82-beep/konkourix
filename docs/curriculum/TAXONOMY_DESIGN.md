# Curriculum Knowledge Taxonomy Design

## Status and scope

This document defines the domain boundary, types, registry, and validation rules for curriculum knowledge expansion. The only populated knowledge data is the two isolated manual pilots: [Physics 12 Motion](PILOT_PHYSICS12_MOTION.md) and [Arabic 10 Lesson 1](PILOT_ARABIC10_LESSON1.md). No broader taxonomy, question, weight, planning, scheduling, recommendation, or analytics data exists.

No database import or publication has occurred. The registry contains two `DRAFT` pilot entries tied provisionally to the frozen candidate snapshot.

## Structural curriculum versus knowledge taxonomy

The canonical structural curriculum remains the immutable source-bound owning tree:

```text
Curriculum
└── Scope
    └── Grade
        └── Subject
            └── Chapter/Section
                └── Explicit structural lesson
```

Existing curriculum nodes are not recreated in the knowledge layer. In particular, the existing Curriculum Node Type code `TOPIC` is currently used for source-explicit `درس`/`Lesson` structural records. It does not mean a generated semantic knowledge topic.

The future knowledge taxonomy is a separate graph anchored to an exact existing structural node:

```text
CURRICULUM_NODE (existing structural anchor)
└── TOPIC
    └── SUBTOPIC
        └── CONCEPT
            └── SKILL
                └── QUESTION_PATTERN
```

`TOPIC`, `SUBTOPIC`, `CONCEPT`, `SKILL`, and `QUESTION_PATTERN` in this document are knowledge-taxonomy kinds, not additional structural Curriculum Node Type codes. This separation preserves published structural versions and prevents Subject, Chapter, or Lesson duplication.

## Domain model

### Taxonomy Registry Entry

Each future subject taxonomy has one registry entry per Curriculum Version:

```json
{
  "subjectId": "<existing structural subject node ID>",
  "curriculumVersionId": "<exact curriculum version ID>",
  "curriculumNodeId": "<same structural subject node ID>",
  "taxonomyStatus": "EMPTY | DRAFT | REVIEWED | APPROVED"
}
```

The registry contains only the Physics 12 Motion and Arabic 10 Lesson 1 pilots. Because no database Curriculum Version or stable database node IDs have been produced, their version reference is explicitly the frozen candidate snapshot and must be rebound before persistence. It must not be presented as a database UUID.

Lifecycle meanings:

- `EMPTY`: no knowledge nodes may exist for the subject/version.
- `DRAFT`: source-bound authoring is underway and remains editable by authorized taxonomy authors.
- `REVIEWED`: a qualified reviewer has reviewed the current taxonomy revision; publication approval is still absent.
- `APPROVED`: the exact reviewed taxonomy revision is approved for downstream use. Later changes require a new revision/version rather than silent mutation.

### Knowledge Taxonomy Node

Every future node contains:

- opaque stable `taxonomyKey`;
- one controlled taxonomy kind;
- exact `curriculumVersionId`;
- one owning structural `subjectId`;
- one existing structural `curriculumNodeId` anchor;
- optional taxonomy parent according to the hierarchy;
- source-preserved label;
- provenance containing source artifact, stable source-record key, locator, and raw text.

A Question Pattern is only a future taxonomy classification. It is not a Question Bank item, exam item, answer, or test definition.

## Ownership and validation rules

Validation rejects:

- a Topic without an existing structural curriculum-node anchor;
- a taxonomy node without a registry for the same subject and Curriculum Version;
- any nodes under an `EMPTY` registry;
- a Concept without a Topic or Subtopic parent;
- a Subtopic whose parent is not a Topic;
- a Skill whose parent is not a Concept;
- a Question Pattern whose parent is not a Skill;
- duplicate or empty taxonomy keys;
- a structural anchor owned by another subject;
- taxonomy parent/child records crossing subjects or Curriculum Versions;
- missing structural subjects, labels, version pins, or provenance.

Topic anchors may be a Subject, Chapter, or explicit structural Lesson, but the anchor must resolve through the existing structural tree to the same subject. Taxonomy parentage never changes canonical structural ownership.

## Future source-bound import process

1. Supply a reviewed knowledge source artifact for a specific published or governed draft Curriculum Version.
2. Select an existing structural subject and exact structural anchor nodes. Name matching alone is insufficient.
3. Author opaque taxonomy keys, exact raw labels, hierarchy, and provenance without generating missing educational meaning.
4. Run structural-anchor, ownership, hierarchy, duplicate-key, and provenance validation.
5. Import only into a `DRAFT` taxonomy registry revision with an authorized taxonomy author.
6. Produce ambiguity and exclusion reports. Unclear rows remain quarantined.
7. A qualified educational reviewer moves the exact revision to `REVIEWED` or requests corrections.
8. A separately authorized approver may mark that revision `APPROVED` for consumers.

Database persistence, authorization capabilities, revision storage, and APIs require a later approved milestone and ADR before implementation.

## Why concepts are not generated automatically

The current Persian source describes curriculum structure but does not reliably define a canonical knowledge decomposition. Automatically treating every unlabeled branch, phrase, star marker, or nearby paragraph as a Topic or Concept would invent educational meaning, create unstable identities, and risk cross-subject misclassification.

Concept generation therefore requires explicit source evidence, educational authorship, provenance, ambiguity handling, and human review. AI may assist future authoring only as a proposal mechanism; it cannot create approved canonical knowledge nodes automatically.

## Current invariants

- Structural catalog checksum remains unchanged.
- Structural Subjects, Chapters, and Lessons are not duplicated.
- Taxonomy registry contains two isolated `DRAFT` entries.
- Knowledge taxonomy contains 57 pilot nodes: 30 anchored to Physics 12 Motion and 27 anchored to shared Arabic 10 Lesson 1.
- The [scaling architecture](SCALING_ARCHITECTURE.md) wraps each pilot in a validation-only `DRAFT` package; it does not alter the taxonomy records or approve them.
- Curriculum audit remains authoritative and passing.
- No schema, migration, database, API, question, analytics, scheduling, or frontend change is part of this milestone.
