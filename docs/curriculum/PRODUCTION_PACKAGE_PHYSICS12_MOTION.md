# Production Knowledge Package Candidate: Physics 12 Motion

## Status and boundary

This is the first `PRODUCTION_PACKAGE_CANDIDATE` built from the existing [Physics 12 Motion pilot](PILOT_PHYSICS12_MOTION.md). It is a governed, persistence-neutral package revision, not approved educational content.

The candidate remains:

- lifecycle status: `DRAFT`;
- review status: `PENDING`;
- reviewer: `null`;
- reviewed at: `null`;
- publication: `NOT_AUTHORIZED`.

It creates no PostgreSQL rows, database Curriculum Version, Question Bank record, analytics, mastery calculation, recommendation, or study-planning behavior.

## Identity and revision

| Field | Value |
| --- | --- |
| Package kind | `PRODUCTION_PACKAGE_CANDIDATE` |
| Stable package ID | `pkg-bf55e8f2-2699-4ee2-8ccb-54420216069e` |
| Revision ID | `pkg-rev-0e3a9555-3268-4c1a-a283-b04b22f93f09` |
| Revision | `1` |
| Source pilot package | `pkg-74e3634f-15c1-45f5-b813-0f8704650e99` |
| Payload SHA-256 | `ce20fc14fa67af9b2eedc5fbd23ccb9b5aa2d496b94f5670c7342c42b8db337a` |
| Package-revision SHA-256 | `30d145724f684eb8d7b8e850e66bad87c5d04a613c9c4fd6924d7ea963e54341` |

The stable package ID identifies this package across future corrections. A correction must receive a new opaque revision ID and incremented revision number; it must not mutate a reviewed or approved revision. The payload checksum covers the ordered taxonomy, Content Item, and mapping arrays. The package checksum covers the complete candidate revision except its own checksum field. Canonical key ordering makes both checksums deterministic; timestamps, filesystem paths, random values, and runtime state are absent from checksum inputs.

## Structural anchor and payload

| Field | Value |
| --- | --- |
| Subject | `mathematics.g12.physics3` (`فیزیک ۳`) |
| Structural scope | `mathematics.g12.physics3.chapter.4278` (`فصل ۱ ـ حرکت بر خط راست`) |
| Provisional snapshot | `konkourix-theoretical-structural-freeze-candidate-v1` |
| Structural catalog SHA-256 | `ef04a21c556dbc716137d8291c44e933f73fc8fd3c538dc3dfd59a1f560164be` |

The candidate references the exact existing pilot arrays rather than copying them:

| Payload | Count | State |
| --- | ---: | --- |
| Taxonomy nodes | 30 | `DRAFT` package evidence |
| Content Items | 12 | all `UNVERIFIED` |
| Mappings | 12 | non-owning and resolvable |

No taxonomy node, label, content body, provenance record, or mapping was added or rewritten for this candidate.

## Readiness result

| Dimension | Result |
| --- | --- |
| Machine structure | `PASS` |
| Educational review | `PENDING` |
| Package lifecycle | `DRAFT` |
| Persistence | `BLOCKED_PENDING_CURRICULUM_VERSION_REBIND` |
| Publication | `NOT_AUTHORIZED` |

Machine validation confirms package structure and referential integrity only. It does not establish educational correctness or approval.

The provisional snapshot identifier is not a database Curriculum Version UUID. The package explicitly records `REQUIRES_CURRICULUM_VERSION_REBIND_BEFORE_PERSISTENCE`, keeps `databaseCurriculumVersionId: null`, and must be rebound to exact retained database identities in a separately authorized milestone before persistence.

## Deterministic validation

The production-candidate validator composes the existing Draft Package, Knowledge Taxonomy, and Content Ingestion validators, then additionally verifies:

- exact Physics pilot payload reference and checksum equality;
- exact subject, chapter, ownership, and frozen-snapshot identity;
- opaque package and revision identities and positive revision number;
- collision-free taxonomy, content, mapping, package, and revision keys;
- `DRAFT` / `PENDING` lifecycle with no invented reviewer evidence;
- complete pilot provenance and `UNVERIFIED` Content state;
- resolvable mappings within the exact subject, scope, and provisional version;
- absence of a claimed database Curriculum Version UUID;
- mandatory future Curriculum Version rebind;
- payload and complete package-revision checksum integrity.

Validation is read-only and cannot advance lifecycle or review state.

## Physics human review checklist

No item below is answered or accepted by this milestone. A qualified human reviewer must assess the exact revision for:

- [ ] terminology;
- [ ] taxonomy hierarchy;
- [ ] formula correctness;
- [ ] sign conventions;
- [ ] units;
- [ ] example wording;
- [ ] Persian language quality;
- [ ] taxonomy granularity;
- [ ] skill wording;
- [ ] Question Pattern classification boundaries;
- [ ] Content correctness;
- [ ] source and provenance appropriateness.

Review findings must create an explicit corrected revision. Machine validation must not mark any checklist item complete.

## Available governed review workflow

The persistence-neutral workflow is defined in [KNOWLEDGE_PACKAGE_REVIEW.md](KNOWLEDGE_PACKAGE_REVIEW.md). A qualified reviewer can use the deterministic [review packet](PHYSICS12_MOTION_REVIEW_PACKET.md) and [blank JSON input template](PHYSICS12_MOTION_REVIEW_INPUT.template.json) to record a review session bound to this exact revision and its two checksums.

No packet field is a review decision. No review session or reviewer identity is committed for this candidate. The real package remains `DRAFT` / `PENDING`; an accepted future review would establish eligibility for a separate explicit `REVIEWED` transition only. It would not approve, publish, persist, rebind, or change Content verification automatically.

## Future educational authoring requirements

This candidate intentionally contains only the existing pilot payload. Any additional Concepts, Skills, Question Pattern classifications, explanations, examples, exercises, or source material required for educational completeness remain future human-authoring and review requirements. They must not be generated merely to make this candidate appear complete.
