# Konkourix Target Database Design

**Status:** Approved-architecture logical design; not implemented
**Last synchronized:** 2026-09-17
**Target baseline:** M19 (`76bc4d7`)
**Scope:** PostgreSQL logical model for the future modular monolith

This document describes the target persistence model derived from the approved architecture decisions. It is not Prisma schema, SQL, a migration plan authorization, or an API contract. Entity and field names are proposed logical names and may be adapted mechanically during implementation, but their domain meaning and invariants may not be weakened.

## Decision Authority

The primary sources are:

- ADR-024 through ADR-032 in [DECISIONS.md](../DECISIONS.md);
- [ADR-033](../adr/ADR-033-curriculum-persistence-and-composite-references.md): curriculum persistence and composite references;
- [ADR-034](../adr/ADR-034-curriculum-governance-and-administrative-permissions.md): curriculum governance and administrative permissions;
- [ADR-036](../adr/ADR-036-counselor-plan-publication-and-task-materialization.md): plan publication and task materialization;
- [ADR-037](../adr/ADR-037-task-result-and-learning-quality.md): task results and five-level learning quality;
- [ADR-038](../adr/ADR-038-daily-reality-schedule-semantics.md): Daily Reality Schedule;
- [ADR-039](../adr/ADR-039-practice-activity-lifecycle.md): Practice Activity;
- [ADR-041](../adr/ADR-041-question-bank-moderation-versioning-and-rights.md): Question Bank governance;
- [ADR-043](../adr/ADR-043-internal-online-exam-lifecycle-and-scoring.md): Internal Online Exams;
- the approved curriculum, planning, assessment, communication, and counselor specifications in `docs/`.

ADR-035, ADR-040, and ADR-042 remain reserved. This design does not infer approval for them. Curriculum legacy mapping/cutover/reconciliation/rollback remains a separate unresolved policy gate. Where unresolved decisions would govern classification, automated mastery, legacy assessment interpretation, or external-provider contracts, this document preserves a decision gate.

## Design Conventions and Invariants

### Identity and Time

- Durable entity identities use opaque UUIDs. Curriculum logical nodes follow the approved stable-ID rules and are never keyed by labels or paths.
- Server-owned event times use timezone-aware timestamps. Student calendar dates remain explicit dates with an associated time-zone context where day boundaries matter.
- Created/updated timestamps are operational metadata, not substitutes for lifecycle events or immutable versions.
- Human-readable version labels, titles, slugs, and source locators are never primary identity.

### Version-Pinned Curriculum Reference

Every durable curriculum reference stores both:

```text
curriculum_version_id
curriculum_node_id
```

The pair must resolve to a unique node representation in that version. A composite foreign-key equivalent should target `curriculum_node_revisions(curriculum_version_id, curriculum_node_id)`. A consumer must never resolve a historical node against “latest curriculum.”

### Ownership, Immutability, and Deletion

- Ownership identifies who may author or control a record; it does not grant permission to mutate immutable history.
- Published curriculum, published plan versions, recorded evidence revisions, published question/exam versions, submitted answers, and finalized evaluations are immutable.
- Historical records use restrictive foreign-key behavior. A user, relationship, curriculum node, question, or plan referenced by history is not cascade-deleted.
- Cancellation, invalidation, withdrawal, retirement, and supersession retain the original row and provenance.
- Domain audit/event records are append-only and cannot be replaced by chat messages or application logs.

### Write-Model Separation

- Planning intention, execution time, Task Result, Practice, External Exam evidence, and Internal Exam delivery are different write models.
- No assessment or session automatically completes a Task.
- Reporting reads source facts; it does not become their owner or rewrite them.
- General Chat, Tickets, Suggestions, private counselor notes, and audit logs remain separate.

## Current M19 Compatibility Baseline

| Current model | M19 meaning | Target treatment |
| --- | --- | --- |
| `StudySubject` | Student-owned subject label | Transitional legacy curriculum data; retained with reviewed canonical mappings |
| `Topic` | Student-owned topic under a `StudySubject` | Transitional legacy curriculum data; retained without name-only matching |
| `StudyPlan` | Student-owned dated plan container | Retained compatibility model; not converted into a counselor publication history |
| `DailyTask` | Personal or counselor-created planned learning intention | Evolved additively; existing rows remain valid standalone legacy tasks |
| `StudySession` | Actual live/finished/cancelled study interval | Retained and extended only through nullable, version-pinned provenance during transition |
| `AssessmentAttempt` | Completed aggregate counts and timing | Preserved as generic legacy assessment evidence; not reclassified by inference |
| `StudentGoal` | Student goal optionally linked to legacy subject | Preserved; canonical evolution requires a separate approved scope |
| `StudentCounselor` | Active/inactive relationship foundation | Reused as the authorization/provenance anchor for plans and communication |

No applied migration is rewritten. No current row is deleted merely because a target entity exists.

In every entity catalog below, “purpose and main fields,” “relations and ownership,” “lifecycle and immutable fields,” and “M19 migration impact” are mandatory design dimensions. A field list is intentionally logical rather than exhaustive DDL; standard primary keys, timestamps, indexes, checks, and foreign-key names are finalized only in a separately approved physical-schema review.

## 1. Curriculum Domain

Curriculum is controlled master data. Students, counselors, Tasks, plans, questions, exams, progress, and analytics consume it but cannot mutate it.

### Entity Design

| Entity | Purpose and main fields | Relations and ownership | Lifecycle and immutable fields | M19 migration impact |
| --- | --- | --- | --- | --- |
| `curriculum_versions` | Complete curriculum snapshot. Fields: `id`, `version_label`, `status`, `based_on_version_id`, `effective_from`, `reviewed_at/by`, `published_at/by`, `superseded_at`, `source_summary`, timestamps. | Self-reference to the version from which a draft was derived. Owned by Curriculum administrators. Referenced by every curriculum consumer. | `draft -> in_review -> published -> superseded`; published/superseded snapshots and publication metadata are immutable. | New additive table. Initial version is built from the governed import process, not from destructive conversion of `StudySubject`/`Topic` rows. |
| `curriculum_node_types` | Controlled structural vocabulary. Fields: `id`, stable `code`, display metadata, `is_active`, allowed-parent policy metadata. | Referenced by node revisions; administered only inside Curriculum. | Codes are stable after use. Deactivation prevents new assignment but retains history. | New. It does not convert current subject/topic labels into node types automatically. |
| `curriculum_nodes` | Stable logical identity across compatible editorial changes. Fields: `id`, `created_at`, `tombstoned_at`, optional identity note. | Has many version-scoped revisions and mappings. Curriculum-owned. | `id` is permanently immutable and never reused. Published use prevents hard deletion. | New. Legacy UUIDs do not become canonical node IDs merely because labels match. |
| `curriculum_node_revisions` | Representation of one logical node in one curriculum version. Fields: `curriculum_version_id`, `curriculum_node_id`, `node_type_id`, `parent_node_id`, `display_name`, `source_display_name`, `search_name`, `sibling_position`, `availability_status`, deprecation reason, timestamps. | Composite key/unique pair `(version_id,node_id)`; parent resolves within the same version; belongs to one Node and Node Type. | Editable only while its version is draft/reviewable. All fields freeze at publication. Published removal is represented by later-version deprecation/retirement. | New. Provides composite targets for gradually added canonical references. No M19 row is overwritten. |
| `curriculum_node_relationships` | Non-owning semantics such as prerequisite, applicability, equivalence, predecessor/successor, split, merge, or replacement. Fields: version, source node, target version/node, relationship type, status, rationale, approved_by/at. | Both endpoints are version-pinned node pairs. Curriculum administrators own approval. Does not create a second canonical parent. | Frozen with the governing published version or as an immutable approved mapping record. Changes create a later record/version. | New. No relationships are inferred from similar names or current subject/topic nesting. |
| `curriculum_imports` | One idempotent administrative import run. Fields: `id`, `target_version_id`, source artifact name/checksum, importer, idempotency key, status, started/completed times, accepted/unchanged/ambiguous/rejected counts, report location. | Belongs to a draft Curriculum Version; owns source records and import issues. Curriculum-admin only. | `created -> validating -> completed/failed`; completed input identity, counts, and report are immutable. Imports never publish. | New. Initial source import is independent of the legacy mapping process. |
| `curriculum_source_records` | Exact provenance for every parsed source item. Fields: `id`, `import_id`, stable source-record key, exact raw label/text, source locator, source order, structural hints, checksum, disposition, matched node ID. | Belongs to an import; may map to one accepted logical Node only after review. | Raw source text, checksum, locator, and import identity are immutable. Administrative disposition is audited. | New. Preserves `cori.docx` labels and ambiguity without forcing them into `StudySubject` or `Topic`. |
| `curriculum_import_issues` | Quarantined ambiguity or validation finding. Fields: `id`, `import_id`, optional source-record ID, issue code, severity, details, status, resolution, resolved_by/at. | Owned by Curriculum review; may block publication. | Finding identity/input is immutable; resolution is an audited transition. | New. Missing parents, shared content, joined records, and special markers remain unresolved until authorized review. |
| `curriculum_node_mappings` | Explicit directional mappings across canonical versions: `same_as`, `moved_to`, `split_into`, `merged_into`, `replaced_by`. Fields: from/to version-node pairs, type, confidence/status, rationale, approved_by/at. | Both endpoints are canonical pairs; many-to-many is allowed. Curriculum-owned. | Approved mappings are immutable; correction creates a superseding mapping record. They never rewrite endpoints. | New. Used for interpretation, not automatic migration of old facts or mastery. |
| `legacy_curriculum_mappings` | Compatibility registry from M19 `StudySubject` or `Topic` to a canonical version/node pair. Fields: legacy kind/ID, canonical pair, mapping status (`unmapped`, `proposed`, `confirmed`, `ambiguous`, `legacy_only`), rationale, reviewer, timestamps. | References exactly one existing legacy row and zero/one confirmed canonical pair; maintained by authorized reviewers. | Confirmed decisions and prior states are auditable. A revised decision supersedes rather than erases history. | New bridge table. It preserves legacy identity and permits dual reads without modifying current rows. |
| `curriculum_audit_logs` | Append-only governance trail. Fields: `id`, actor, action, target version/node/import/mapping, reason, before/after payload, source/provenance, occurred_at. | Curriculum-owned; readable only to authorized auditors/admins. | Append-only from creation. | New. It does not replace import reports or application security logs. |

### Curriculum Constraints

- `(curriculum_version_id, curriculum_node_id)` is unique in node revisions.
- Parent and child belong to the same version; roots have no parent.
- Sibling position is deterministic within `(version,parent)`; the implementation must support source order without making order identity.
- Publication rejects cycles, orphan nodes, invalid type relationships, unresolved blockers, duplicate logical IDs, and broken mappings.
- Normalized names may support search but never satisfy identity or idempotency alone.

## 2. Student Progress Domain

Student Progress is a student-specific overlay. It does not alter curriculum and is independent from Tasks. Automatic mastery calculation remains gated by the reserved ADR-035.

### Entity Design

| Entity | Purpose and main fields | Relations and ownership | Lifecycle and immutable fields | M19 migration impact |
| --- | --- | --- | --- | --- |
| `student_node_progress` | Current student state for one exact curriculum node. Fields: `id`, `student_profile_id`, curriculum pair, `learning_status`, nullable `mastery_level` (1–5 when known), note, strengths, weaknesses, `last_activity_at`, `next_review_on`, `current_event_id`, timestamps. | Unique per `(student,version,node)`. Owned as student learning state; mutation authority must follow the later progress policy. | Current state may evolve through explicit events. Student ID and curriculum pair never change. A new curriculum version creates a different overlay row. | New. No progress is inferred from `DailyTask.status`, session ratings, legacy topic existence, or `AssessmentAttempt` counts. |
| `student_progress_events` | Append-only history of progress changes. Fields: `id`, progress ID, actor, event type, previous/new status and mastery, note/reason, occurred_at, provenance kind. | Belongs to one progress row; optionally connected to explicit evidence through an evidence link. | Append-only. Historical curriculum pair and before/after values are immutable. | New. Enables history preservation without rewriting prior progress when curriculum changes. |
| `student_progress_evidence_links` | Typed association from a progress event to evidence such as a Task Result, Practice revision, External Report result, or Internal Exam evaluation. Fields: event ID, evidence type, exactly one typed target ID, contribution metadata. | Progress owns the association but not the evidence. Each link validates student and curriculum compatibility. | Immutable after acceptance; removal is an audited invalidation. Presence does not authorize automatic mastery calculation. | New and deferred until each source domain exists. No link is manufactured for M19 records without approved classification. |

### Progress Constraints

- `mastery_level`, when present, is an integer from 1 through 5. Absence means unknown, not zero or “very weak.”
- Approved learning-status codes correspond to not started, learning, needs review, mastered, and weak; localized labels are presentation data.
- Task learning quality, `StudySession.studyQualityRating`, and Progress mastery are distinct values.
- Cross-version rollup or transfer uses reviewed mappings but never rewrites the original progress row. The transfer/calculation policy requires ADR-035.

## 3. Counselor Planning Domain

Counselor planning has mutable drafts and immutable published versions. Publication atomically materializes execution-facing Tasks while retaining the Plan Version as the authoritative counselor intention.

### Entity Design

| Entity | Purpose and main fields | Relations and ownership | Lifecycle and immutable fields | M19 migration impact |
| --- | --- | --- | --- | --- |
| `counselor_plans` | Stable aggregate for one student/counselor relationship and planning purpose. Fields: `id`, `student_profile_id`, `student_counselor_relationship_id`, title, planning horizon, status, created_by, timestamps. | Belongs to student and the relationship authorizing the counselor. Owns drafts, versions, and lineage identities. | Identity, student, and originating relationship are immutable. Closure stops future publication but retains history. | New. Existing `StudyPlan` rows are not converted because they do not prove counselor publication. |
| `counselor_plan_revisions` | Editable counselor workspace. Fields: `id`, plan ID, revision number, base version ID, status, author, lock/version token, draft metadata, created/abandoned times. | Belongs to Plan; owns draft blocks/items; references the immutable version used as its base. | `draft -> published/abandoned`. Draft content is mutable with optimistic concurrency; publication/abandonment freezes the revision metadata. | New. Does not replace existing student-owned `StudyPlan` during compatibility. |
| `plan_block_lineages` | Stable identity for recognizing the same schedule block across revisions/versions. Fields: `id`, plan ID, created_at, ended_at, replacement reason. | Owned by one Plan; referenced by draft and published blocks. | Identity is immutable; lineage may be ended, never reused. | New. No lineage is fabricated for legacy tasks. |
| `plan_item_lineages` | Stable identity for retained/moved/revised planned learning intention. Fields parallel block lineage. | Owned by one Plan; referenced by draft/version items and materialized Tasks. | Identity is immutable; semantic replacement starts a new lineage. | New. Existing tasks remain standalone unless created by the new publication process. |
| `counselor_plan_draft_blocks` | Editable time/context blocks in a draft. Fields: revision ID, block lineage ID, block kind, local date/time, time zone, order, title/notes. | Belongs to Draft Revision; contains zero/many draft items. Counselor-owned. | Mutable only in an active draft; copied into immutable version blocks at publication. | New. Current task dates are not reverse-engineered into blocks. |
| `counselor_plan_draft_items` | Editable planned learning units. Fields: draft block, item lineage, curriculum pair, activity type, planned minutes/questions, expected outcome, order. | Belongs to a learning block and active draft; curriculum pair must be eligible for new use. | Mutable only in active draft. | New. Current `DailyTask` values are not treated as unpublished drafts. |
| `counselor_plan_versions` | Atomic student-visible publication snapshot. Fields: `id`, plan ID, version number, source revision ID, supersedes version ID, effective range/boundary, optional reality-schedule-version ID, published_by/at, superseded_at. | Belongs to Plan; owns immutable version blocks/items; may pin the Daily Reality snapshot used. | Published at creation and immutable. Supersession metadata is append-only and cannot alter content. | New. Historical M19 behavior continues without a synthetic version. |
| `counselor_plan_version_blocks` | Immutable schedule-block snapshot. Fields: version ID, block lineage ID, kind, local date/time, time zone, order, title/notes. | Belongs to one Plan Version; contains version items. | All snapshot fields immutable. | New. |
| `counselor_plan_version_items` | Immutable published learning-unit snapshot. Fields: version block, item lineage, curriculum pair, activity type, planned minutes/questions, expected outcome, order. | Belongs to one Version Block; materializes exactly one execution Task when actionable. | All fields immutable. | New. New counselor Tasks reference these items; legacy tasks remain unbound. |
| `counselor_plan_audit_logs` | Plan governance and material-change trail. Fields: actor, action, plan/revision/version/block/item IDs, reason, before/after payload, occurred_at. | Plan-owned; accessible to authorized student/counselor/admin views as policy allows. | Append-only. | New. Does not derive audit history from `updatedAt`. |

### Publication Transaction

One transaction must validate relationship authority, base-version concurrency, curriculum eligibility, block constraints, effective boundary, and workload invariants; create the Plan Version snapshot; materialize its actionable Tasks; and make the version visible. Failure leaves neither a visible partial version nor partial Tasks.

## 4. Daily Reality Schedule

Daily Reality is student-declared context and availability, not educational planning or execution evidence.

### Entity Design

| Entity | Purpose and main fields | Relations and ownership | Lifecycle and immutable fields | M19 migration impact |
| --- | --- | --- | --- | --- |
| `daily_reality_schedules` | Stable student-owned schedule aggregate. Fields: `id`, `student_profile_id`, title, covered date range, status, timestamps. | Belongs to one student; owns schedule versions. | Identity and owner are immutable. Archive stops new use without deleting snapshots. | New. No schedule is inferred from gaps in sessions or tasks. |
| `daily_reality_schedule_versions` | Editable draft or immutable published snapshot. Fields: `id`, schedule ID, version number, status, time zone, based_on_version_id, published_at, timestamps. | Belongs to Schedule; owns blocks; may be pinned by Plan Versions. | Draft is editable. Published versions and time-zone/date semantics are immutable. | New. Planning remains valid when no schedule exists. |
| `daily_reality_blocks` | One declared availability/constraint interval. Fields: schedule version ID, local date, start/end local time, controlled category, optional label/note, order. | Belongs to one Schedule Version; student-authored. | Frozen when version publishes. It never owns Tasks or sessions. | New. Existing `DailyTask`/`StudySession` rows are not reclassified. |

Category vocabulary, recurrence, overlap, exception, and staleness policies remain product-decision gates. The database must not encode the example categories from ADR-038 as a closed enum until approved.

## 5. Task Evolution

`DailyTask` remains planned educational intention. It evolves additively and supports personal tasks plus Tasks materialized from published counselor Plan Items.

### Entity Design

| Entity | Purpose and main fields | Relations and ownership | Lifecycle and immutable fields | M19 migration impact |
| --- | --- | --- | --- | --- |
| `daily_tasks` (evolved) | Execution-facing learning intention. Existing fields remain; target additions include canonical curriculum pair, activity type, expected outcome, planned duration/questions, `plan_version_item_id`, supersession/cancellation provenance, compatibility flags. | Belongs to student; created by student for `PERSONAL` or atomically from counselor Plan Item for `COUNSELOR`. Has sessions, results, and optional practice/assessment evidence. | Owner, creator, source, curriculum pair, plan provenance, and published intention fields become immutable once created. A revised counselor plan creates replacement/superseding Tasks. | Modify additively with nullable target fields first. Preserve `subjectId`, `topicId`, status, timestamps, and every existing row. New canonical fields become required only for new workflows after mapping/cutover. |
| `task_curriculum_targets` | Optional explicit additional curriculum targets when one Task legitimately covers multiple nodes. Fields: Task ID, curriculum pair, role/order. | Belongs to Task; all pairs normally share the Task's pinned curriculum version. | Immutable once the Task has execution/result evidence. | New, if multi-target Tasks are approved for implementation. Existing subject/topic links are not expanded by guesswork. |
| `task_results` | Stable result aggregate for one Task. Fields: `id`, `task_id`, `student_profile_id`, `current_revision_id`, created/submitted timestamps. | One per Task; owned as student self-report. Has immutable revisions. | Task/owner link is immutable. Effective revision pointer changes only through audited correction. | New alongside existing `DailyTask.status`. Legacy task state remains readable during dual-read compatibility. |
| `task_result_revisions` | Recorded result/correction. Fields: result ID, revision number, outcome (`COMPLETED`, `INCOMPLETE`, `SKIPPED`), nullable learning quality 1–5, skip reason, note, difficulty/problem details, actor, reason, recorded_at, supersedes revision. | Belongs to Task Result. Student submits ordinary revisions; exceptional admin correction is separately authorized. | Each revision is append-only. Completed/incomplete require a five-level quality for new writes; skipped normally has none. | New. Legacy completed rows carry “quality unknown”; no rating is inferred from `StudySession`. Legacy skip facts retain existing fields. |

Task operational status may remain as a compatibility projection during migration. The final status vocabulary and whether it is stored or derived must avoid contradictory authority between `daily_tasks` and `task_results`.

## 6. Study Sessions

Study Sessions remain actual study intervals and never become Task completion, Practice, or exam records.

### Entity Design

| Entity | Purpose and main fields | Relations and ownership | Lifecycle and immutable fields | M19 migration impact |
| --- | --- | --- | --- | --- |
| `study_sessions` (evolved) | Actual interval. Existing fields remain; target additions are nullable curriculum pair and optional immutable plan-version/item provenance when derived from a counselor Task. | Belongs to student; may reference one Task. A standalone session may pin curriculum directly. It does not own Task Result or assessment evidence. | `active -> finished` or `active -> cancelled`. Student/Task/curriculum/start provenance is immutable after start; finished/cancelled timing and feedback require explicit correction policy before mutation. | Add nullable references only. Preserve all current session rows, active/finished/cancelled semantics, ratings, notes, and legacy `subjectId`. Do not backfill canonical links unless mapping is confirmed. |

`focusRating` and `studyQualityRating` remain session feedback. They are not copied to Task learning quality or Progress mastery. No new session is created to support Practice, External Exams, or Internal Exams.

## 7. Practice Activity

Practice records daily question solving or exercises without acquiring an exam-delivery lifecycle.

### Entity Design

| Entity | Purpose and main fields | Relations and ownership | Lifecycle and immutable fields | M19 migration impact |
| --- | --- | --- | --- | --- |
| `practice_activities` | Stable aggregate for one student's practice fact. Fields: `id`, `student_profile_id`, optional Task/Study Session IDs, status, current revision ID, created_at. | Student-owned. Task and Session links are optional explicit provenance, not prerequisites. Owns revisions and curriculum targets. | `draft -> recorded -> corrected/invalidated`. Student and accepted provenance links are immutable after recording. | New after canonical curriculum. Existing `AssessmentAttempt` rows are not converted based on title, counts, Task, Subject, Topic, or timing. |
| `practice_activity_revisions` | Immutable recorded facts. Fields: activity ID, revision number, source type/details, started/ended time or duration when known, answered/correct/incorrect/blank counts, feedback/note, actor, correction reason, recorded_at, supersedes revision. | Belongs to Practice Activity; may own exact Question responses. | Draft payload may change; each recorded/correction revision is immutable. Invalidation retains all revisions. | New. Does not copy or rewrite M19 session and assessment fields. |
| `practice_curriculum_targets` | One or more reviewed curriculum classifications. Fields: practice revision ID, curriculum pair, role/order. | Belongs to an immutable Practice revision. | Immutable with the revision. At least one target is required for new recorded activities. | New. Legacy subject/topic may be shown through compatibility until a confirmed mapping exists. |
| `practice_question_responses` | Optional item-level answer evidence for governed Question Bank content. Fields: practice revision ID, exact question version ID, presented option/order snapshot where needed, submitted answer, correctness outcome, answered_at. | Belongs to Practice revision and published Question Version. | Immutable after the Practice revision is recorded. | New only after Question Bank availability. Aggregate practice remains valid without synthetic item rows. |

Count constraints require non-negative values and a documented formula. Item-level response totals must reconcile with aggregate fields when both are present. Recording Practice never changes Task Result or Progress automatically.

## 8. Question Bank

Question Bank is moderated, versioned content with explicit attribution, rights, and many-to-many curriculum classification.

### Entity Design

| Entity | Purpose and main fields | Relations and ownership | Lifecycle and immutable fields | M19 migration impact |
| --- | --- | --- | --- | --- |
| `questions` | Stable logical identity across content revisions. Fields: `id`, owning organization/creator provenance, created_at, retired_at. | Owns Question Versions. Governed by Question Bank administrators, not individual student/counselor curriculum ownership. | Logical ID is immutable and never reused. Retirement does not delete versions. | New; M19 has no question entities to convert. |
| `question_versions` | One reviewable/publishable content version. Fields: `id`, question ID, version number, status, format, stem/content, solution/explanation, language, submitted_by/at, approved_by/at, published_by/at, withdrawn/retired metadata. | Belongs to Question; owns options, attribution, rights, curriculum tags, and moderation events. Internal Exam Items pin this exact ID. | `draft -> submitted -> in_review -> approved -> published`, with changes-requested/rejected/withdrawn/retired paths. Published content is immutable. | New. Imported or partner content must enter this workflow rather than being inserted as published. |
| `question_options` | Ordered answer choices or answer components for formats that need them. Fields: question version ID, stable within-version key, content, display order, correctness/scoring metadata. | Belongs to one Question Version. Correctness data is restricted. | Frozen when the version is published. | New. Exact format-specific structures remain an implementation decision. |
| `question_attributions` | Structured author/source provenance. Fields: question version ID, attribution type, author/contributor, source type, publication/provider, bibliographic detail, submitting account, organization, verification state, display-credit policy. | Belongs to Question Version; reviewed by moderators. | Original provenance is immutable; corrections create additional/superseding attribution records with audit. | New. No attribution is inferred from an M19 user or free-text title. |
| `question_rights` | Publication eligibility and copyright/license basis. Fields: question version ID, rights owner, basis/license, allowed uses/channels, attribution requirement, territory/time restrictions, evidence reference, status, reviewer, expiry/dispute/takedown metadata. | Belongs to Question Version; restricted to rights reviewers/admins. | Reviewed rights decisions are immutable records. State may move to expired/disputed/revoked through an audited event. | New. Unknown rights block publication and new selection. |
| `question_curriculum_tags` | Explicit many-to-many classification. Fields: question version ID, curriculum pair, `is_primary`, review metadata. | Belongs to one Question Version and one version-pinned node. Exactly one primary tag per published version. | Frozen at publication; a classification correction creates a new Question Version. | New. Ancestors are derived from the pinned curriculum snapshot, not copied as authoritative tags. |
| `question_moderation_events` | Append-only workflow and review trail. Fields: question version ID, stage/action, actor, decision, reason, occurred_at, review dimension. | Belongs to a Question Version; written by authorized reviewers/publishers. | Append-only. | New. Submission never implies approval or publication. |

Question media requires controlled object storage, malware scanning, and rights enforcement, but ADR-041 leaves the media persistence architecture unresolved. This design therefore records media references only after a separate asset-storage decision rather than inventing a blob table here.

## 9. External Exams

External providers own the exam, questions, delivery, scoring, and ranking. Konkourix stores submitted report evidence and structured interpretation only. Because ADR-042 is reserved, provider-specific ingestion, score normalization, and classification of legacy attempts remain decision gates.

### Entity Design

| Entity | Purpose and main fields | Relations and ownership | Lifecycle and immutable fields | M19 migration impact |
| --- | --- | --- | --- | --- |
| `external_exam_providers` | Controlled identity for providers such as Ghalamchi, Maz, or Gaj. Fields: `id`, stable code, exact display name, status, optional provider metadata. | Referenced by reports; maintained by authorized admins. It does not own Konkourix users. | Stable code/identity is immutable after use; retirement blocks new reports but retains history. | New. Free-text M19 titles do not create provider identities automatically. |
| `external_exam_reports` | Stable student report aggregate. Fields: `id`, student, provider, external exam identity/title/date, optional Task ID, status, current revision ID, created_at, invalidated_at. | Student-owned evidence; counselors may review through active relationship. Does not reference Internal Exam definitions. | `draft -> recorded -> corrected/invalidated`; student, provider, and external exam identity are immutable after recording. A mistaken identity is invalidated and replaced rather than rewritten; revisions correct report facts. | New. Existing `AssessmentAttempt` remains legacy evidence unless a separately approved process proves its classification. |
| `external_exam_report_revisions` | Immutable report submission/correction. Fields: report ID, revision number, raw totals/percentages/rank fields when supplied, student note, source method, actor, reason, recorded_at, supersedes revision. | Belongs to External Report; owns section results/evidence metadata. | Each recorded revision is immutable. | New. No score or percentage is invented from incomplete M19 counts. |
| `external_exam_section_results` | Optional structured result for a provider section or curriculum area. Fields: report revision ID, provider section label, curriculum pair when reviewed, correct/incorrect/blank/total/percentage/score fields as supplied, order. | Belongs to one report revision. Canonical link is optional until confirmed and must pin a pair. | Immutable with revision. | New. Legacy Topic links are not treated as provider sections or canonical mappings automatically. |
| `external_exam_evidence_files` | Metadata for uploaded report images/documents. Fields: report revision ID, storage reference, checksum, media type/size, uploaded_by/at, scan status, retention state. | Belongs to a report revision; binary content lives in an approved secure object store. | Original checksum, uploader, and revision relation are immutable. Quarantine/deletion state follows security/retention policy. | New after secure upload architecture. M19 has no report files. |
| `external_exam_reviews` | Counselor review/feedback without changing student evidence. Fields: report ID/revision, counselor relationship ID, reviewer, review text/structured observations, created_at, supersedes review ID. | Owned by authorized counselor within the relationship that permitted review. | Submitted reviews are immutable; correction creates a superseding review. | New. It does not become a private counselor note or Task Result. |

Provider adapters may populate the same report boundary later, but each import retains provider provenance. They must not depend on or write Internal Exam entities.

## 10. Internal Online Exams

Internal Online Exams are authored, published, delivered, and evaluated by Konkourix. Exact Question and Exam Versions make results reproducible.

### Authoring Entities

| Entity | Purpose and main fields | Relations and ownership | Lifecycle and immutable fields | M19 migration impact |
| --- | --- | --- | --- | --- |
| `internal_exams` | Stable logical exam definition. Fields: `id`, title, purpose/type, owner organization, created_by, status, created_at. | Owns Exam Versions; authored by authorized exam staff. | Identity/owner are immutable. Archive/retire blocks future versions without deleting history. | New. `AssessmentAttempt.title` does not define an Internal Exam. |
| `internal_exam_versions` | Publishable exam snapshot. Fields: `id`, exam ID, version number, status, curriculum version ID, instructions, availability window, duration/timing policy, attempt policy, result-release policy, scoring-specification version/payload, approved/published metadata. | Belongs to Exam; owns Sections and Items. Every item uses the same deliberate curriculum-version context unless an explicitly reviewed cross-version policy applies. | Draft/review/published lifecycle; published content and policies are immutable. | New after Curriculum and Question Bank. No M19 attempt is attached to a synthetic version. |
| `internal_exam_sections` | Ordered section/blueprint snapshot. Fields: exam version ID, title, order, timing/weight settings, optional curriculum pair. | Belongs to one Exam Version; owns Items. | Frozen at publication. | New. |
| `internal_exam_items` | Exact selected question and exam-specific scoring/presentation settings. Fields: section ID, exact question version ID, order/pool position, points/penalty/weight, required flag, curriculum classification reference where needed. | Belongs to Section and published Question Version. | Frozen at publication. Question withdrawal affects future selection, not this historical item. | New. |
| `internal_exam_eligibilities` | Explicit permission for a student/cohort to attempt an Exam Version. Fields: exam version ID, student ID, grant source/actor, available from/to, attempt allowance, accommodation-policy reference, revoked_at/reason. | Belongs to Exam Version and student; managed by authorized exam staff. | Grant identity and original terms are immutable; revocation is append-only state. | New. Exact cohort/accommodation policy remains a later decision. |

### Delivery and Evaluation Entities

| Entity | Purpose and main fields | Relations and ownership | Lifecycle and immutable fields | M19 migration impact |
| --- | --- | --- | --- | --- |
| `internal_exam_attempts` | Server-authoritative delivery instance. Fields: `id`, student, exam version, eligibility, state, attempt number, server started/deadline/submitted/evaluated/expired/terminated/invalidated timestamps, termination reason. | Belongs to student and exact Exam Version; owns delivered items, answers, events, evaluations. | `created -> in_progress -> submitted -> evaluating -> evaluated`; exceptional terminal states are expired/terminated/invalidated. Student/exam/version/timing policy are immutable after creation. | New. Existing `AssessmentAttempt` never becomes a live Attempt. |
| `internal_exam_attempt_items` | Realized delivery snapshot after selection/randomization. Fields: attempt ID, exam item ID, exact question version ID, presented order, option-order snapshot, presentation metadata. | Belongs to one Attempt and immutable Exam Item/Question Version. | Fixed at attempt start; immutable thereafter. | New. Required to reproduce randomized delivery. |
| `internal_exam_answers` | Student answer currently accepted for one delivered item. Fields: attempt item ID, answer payload, first/last answered time, revision counter, frozen_at. | One per Attempt Item; student-owned input under server state validation. | May change only during eligible `in_progress`; freezes on submission/deadline. | New. No answer data exists in M19 aggregates. |
| `internal_exam_attempt_events` | Security/lifecycle audit. Fields: attempt ID, event type, server time, actor/session context, reason, metadata. | Belongs to Attempt; server-authored for authoritative transitions. | Append-only. | New. |
| `internal_exam_evaluations` | One immutable scoring run/revision. Fields: attempt ID, evaluation revision, scoring spec identity, status, computed totals, evaluator/system actor, started/completed times, correction reason, supersedes evaluation ID. | Belongs to submitted Attempt; owns item evaluations and produces one Result revision. | `pending -> automatic/manual_review -> finalized`; finalized evaluation is immutable. Correction creates another evaluation revision. | New. M19 totals are not imported as evaluations without exact exam/question/scoring provenance. |
| `internal_exam_item_evaluations` | Per-delivered-item outcome. Fields: evaluation ID, attempt item ID, outcome, awarded/penalty points, manual-review status, reviewer/note. | Belongs to Evaluation and Attempt Item. | Frozen when Evaluation finalizes. | New. |
| `internal_exam_results` | Published result of one finalized evaluation. Fields: attempt ID, evaluation ID, raw/final score, correct/incorrect/blank counts, result status, released_at, superseded_by_result_id. | One per finalized Evaluation; visible according to release policy. | Result values are immutable. Re-evaluation produces a new Result and supersedes the prior effective result without deletion. | New. Unified history is a reporting projection, not conversion of `AssessmentAttempt`. |

Server time and server state are authoritative. Published Exam Versions, delivered snapshots, submitted answers, and finalized evaluations cannot be edited in place. Internal Exam completion never creates a Study Session or Task Result automatically.

## 11. Communication

General Chat, Tickets, and Suggestions have separate write lifecycles. Context links do not create a chat room for every Task, plan, report, or exam.

### General Chat Entities

| Entity | Purpose and main fields | Relations and ownership | Lifecycle and immutable fields | M19 migration impact |
| --- | --- | --- | --- | --- |
| `chat_conversations` | Lightweight relationship-scoped conversation. Fields: `id`, student-counselor relationship ID, status, created_at, closed_at. | Owned by the authorized relationship, not by a Task/entity. Participants derive from relationship plus explicit admin policy. | Relationship identity is immutable. Close/archive preserves messages. | New. No current entity is converted to chat. |
| `chat_messages` | Chronological message. Fields: conversation ID, sender user ID, body/content type, sent_at, edited/withdrawn metadata, reply-to ID. | Belongs to Conversation; sender must be authorized at send time. May have an optional contextual link. | Original sender/conversation/time are immutable. Edit/withdraw policy must retain audit history. | New. Messages never update plan, curriculum, assessment, or Task state. |
| `communication_context_links` | Optional typed pointer from a message, ticket, or suggestion to another domain record. Fields: communication source kind/ID, target domain/type/ID, label, created_at. | Owned by communication record; target remains owned by its source domain. | Link provenance is immutable; removal is audited. | New. Physical referential-integrity strategy requires an implementation decision; a generic pointer must not bypass authorization. |

### Ticket Entities

| Entity | Purpose and main fields | Relations and ownership | Lifecycle and immutable fields | M19 migration impact |
| --- | --- | --- | --- | --- |
| `tickets` | Structured issue thread. Fields: `id`, requester, student/relationship scope where applicable, category, subject, status, priority if approved, assigned user/team, opened/resolved/closed/reopened times. | Requester owns the issue; authorized support/counselor participants manage it. Context link is optional. | Explicit open/in-progress/resolved/closed/reopened lifecycle. Requester and original category/subject remain historically auditable. | New. No Task or chat row is reclassified as a ticket. |
| `ticket_participants` | Explicit access/participation membership. Fields: ticket ID, user ID, role, added/removed by/at. | Belongs to Ticket; authorization remains server-enforced. | Membership events are retained; removal ends future access rather than deleting history. | New. |
| `ticket_messages` | Threaded ticket discussion. Fields: ticket ID, sender, body, reply-to, visibility class, created/edited/withdrawn metadata. | Belongs to Ticket; does not control Ticket status. | Sender/time immutable; edits preserve history under future retention policy. | New. |
| `ticket_status_events` | Auditable workflow transitions. Fields: ticket ID, from/to status, actor, reason, occurred_at. | Ticket-owned. | Append-only and authoritative for transition history. | New. |

### Suggestion Entities

| Entity | Purpose and main fields | Relations and ownership | Lifecycle and immutable fields | M19 migration impact |
| --- | --- | --- | --- | --- |
| `suggestions` | Governed curriculum, question, or product-improvement submission. Fields: `id`, submitter, suggestion type, title/body, status, submitted_at, decided_at, decision summary. | Owned by submitter for creation and authorized reviewers for workflow. May link to Curriculum or Question submission intake without mutating it directly. | Intake/review/decision/feedback lifecycle; original submission is immutable after intake, with amendments recorded separately. | New. |
| `suggestion_events` | Review, reclassification, decision, and feedback trail. Fields: suggestion ID, event/action, actor, reason/comment, occurred_at, optional resulting-domain reference. | Belongs to Suggestion. | Append-only. | New. Product suggestion to Ticket or question submission to moderation must be explicit and auditable. |

### Confidential Adjacent Entities

Private counselor notes are not a communication channel, but their approved persistence boundary is included because they share counselor authorization concerns.

| Entity | Purpose and main fields | Relations and ownership | Lifecycle and immutable fields | M19 migration impact |
| --- | --- | --- | --- | --- |
| `counselor_private_notes` | Confidential behavior observations, weaknesses, and reminders. Fields: `id`, student, owning counselor, relationship ID, note content/category, created_at, archived_at, supersedes note ID. | Visible only to owning counselor and specifically authorized admins. Reassignment does not transfer ownership. | Submitted note content is immutable; correction creates a superseding note. Archive retains it. | New. Never populated from chat, progress, or inferred analytics. |
| `counselor_private_note_access_logs` | Audit of read, export, exceptional admin access, and transfer actions. Fields: note ID, actor, action, reason, occurred_at. | Security-owned; access more restricted than ordinary application audit. | Append-only. | New. Retention/export/deletion rules remain a required policy decision. |

Attachment, message edit/delete, abuse moderation, retention, and notification policies are not yet approved. No attachment table or destructive retention behavior is authorized by this design.

## 12. Reporting

Reporting is a read/composition boundary. It must not become a generic write model that copies and then owns Planning, Progress, Practice, Exam, or Communication facts.

### Read Models and Operational Metadata

| Entity/read model | Purpose and main fields | Relations and ownership | Lifecycle and immutable fields | M19 migration impact |
| --- | --- | --- | --- | --- |
| `student_learning_timeline` (view/projection) | Chronological read model over Tasks, Task Results, Sessions, Practice, legacy attempts, External Reports, and Internal Exam Results. Fields include source kind/ID, occurred time, student, pinned curriculum pair, summary metrics. | References source IDs; each source domain remains authoritative. Reporting owns only projection freshness. | Rebuildable. Source facts are never edited through the view. | Initially includes M19 Tasks/Sessions/AssessmentAttempts with explicit legacy source kinds. |
| `student_curriculum_progress_report` (view/projection) | Progress and evidence grouped by exact curriculum version/node with optional lineage-aware rollups. | Reads Progress and evidence domains plus Curriculum. | Rebuildable; cross-version rollup policy must be explicit and may not overwrite source Progress. | Starts empty for target progress; legacy topic activity may be displayed separately, not converted to mastery. |
| `counselor_plan_execution_report` (view/projection) | Compares immutable planned items with Task Results, Sessions, Practice, and assessment evidence. | Reads Plan Version/Item and explicit provenance links. | Rebuildable. Never mutates the Plan or evidence. | Only new published plans have exact comparison. Legacy counselor Tasks are labelled standalone rather than assigned to a fabricated plan. |
| `assessment_evidence_timeline` (view/projection) | Unified read over legacy `AssessmentAttempt`, Practice, External Reports, and Internal Exam Results while preserving source type. | Reads separate assessment domains. | Rebuildable; no unified write lifecycle. | Keeps all M19 attempts visible as `legacy_assessment` until an approved classification says otherwise. |
| `report_projection_checkpoints` | Operational cursor/freshness metadata if asynchronous projections are adopted. Fields: projection name/version, last source position/time, status, error/rebuild metadata. | Reporting infrastructure-owned; no educational authority. | Mutable operational state; reset/rebuild does not alter source facts. | Optional new table only if synchronous views are insufficient. |

Materialized metrics must retain source identity, curriculum version, and calculation version. Cached display names and ancestor paths are denormalized conveniences and are never authoritative curriculum references.

## Cross-Domain Relationship Summary

```text
CurriculumVersion + CurriculumNode
          |
          +--> StudentNodeProgress --> StudentProgressEvent
          +--> PlanVersionItem --> materialized DailyTask --> TaskResult
          |                              |
          |                              +--> StudySession
          |                              `--> PracticeActivity
          +--> QuestionVersion <--> QuestionCurriculumTag
          |          |
          |          `--> InternalExamItem --> Attempt --> Evaluation --> Result
          +--> ExternalExamSectionResult
          `--> Reporting projections (read only)

DailyRealityScheduleVersion --> CounselorPlanVersion (context snapshot)

General Chat     Ticket/Thread     Suggestion     Private Counselor Note
     \                |               /                    |
      separate lifecycles and authorization boundaries; no entity-based chat
```

## Database Evolution Sequence

The target dependencies require an additive, reversible sequence:

1. **Preservation baseline:** inventory M19 rows/inbound references, record counts, and freeze the rule that applied migrations are not rewritten.
2. **Curriculum foundation:** add versions, stable nodes/revisions, imports, provenance, audit, and mappings; publish an approved initial version.
3. **Legacy compatibility:** review `StudySubject`/`Topic` mappings; add compatibility reads without disabling current writes.
4. **Version-pinned consumers:** add nullable composite references to evolved Tasks and Study Sessions; validate new canonical paths before making them mandatory for new workflows.
5. **Student Progress:** add overlay/history without inferring mastery; automated calculation waits for ADR-035.
6. **Daily Reality and counselor planning:** add student schedule snapshots, plan drafts/versions/lineage, and atomic Task materialization.
7. **Task Results and Practice:** move new result/practice writes to their separate models; retain current Task status and `AssessmentAttempt` compatibility reads.
8. **Question Bank:** add moderation, rights, exact versions, and curriculum tags.
9. **External Reports:** add provider/report evidence only after ADR-042 resolves provider and legacy-classification policy.
10. **Internal Exams:** add immutable exam versions, delivery snapshots, attempts, answers, evaluation, and results after Question Bank readiness.
11. **Communication:** add General Chat, Tickets, Suggestions, and separately protected private notes after retention/access decisions needed by each capability.
12. **Reporting and cutover:** build source-preserving projections, compare results, disable legacy writes one workflow at a time, and continue historical reads indefinitely where required.

At no stage may a backfill invent curriculum identity, learning quality, mastery, question responses, provider classification, plan publication, or exam delivery history.

## Deprecation and Retention Plan

| Current M19 entity/field | Target status |
| --- | --- |
| `StudySubject`, `Topic` | Deprecated only after canonical read/write cutover; retained for historical resolution and mapping provenance |
| `StudyPlan` | Transitional student-planning model; retained until an approved personal-planning replacement and historical adapter exist |
| `DailyTask.subjectId`, `topicId` | Legacy provenance retained; canonical pair becomes authoritative for new canonical workflows after cutover |
| `DailyTask.status/completedAt/skip*` | Compatibility result fields retained during Task Result transition; no destructive cleanup until all readers migrate |
| `StudySession.subjectId` | Legacy provenance retained alongside confirmed canonical reference where available |
| `AssessmentAttempt` | Preserved indefinitely as generic legacy completed evidence unless ADR-040 approves a narrower classification/cutover |
| `StudentGoal.subjectId` | Preserved; future canonical Goal design is outside this document's approved scope |

“Deprecated” means no longer used for new writes after a verified cutover. It does not mean dropped, nulled, or detached from historical records.

## Required Constraints Before Implementation

The following are architecture gates, not implementation details to guess:

- Curriculum migration policy gate: exact legacy curriculum mapping/cutover, reconciliation, and rollback contract;
- ADR-035: Progress evidence acceptance, actor authority, mastery calculation, and cross-version continuity;
- ADR-040: classification and long-term role of existing `AssessmentAttempt` rows;
- ADR-042: External Exam provider identity, score normalization, correction/import, and legacy compatibility;
- Daily Reality category/recurrence/overlap and retention rules;
- counselor plan future-edit lock boundary and reassignment/concurrency behavior;
- final stored-versus-derived Task operational status during Task Result cutover;
- communication attachments, message editing/deletion, moderation, retention, and notification policy;
- secure object-storage architecture for Question media and External Report evidence;
- Internal Exam retakes, accommodations, appeals, proctoring, offline behavior, manual marking, and scoring formulas;
- reporting calculation/versioning, freshness, retention, and access policy.

Implementation work must begin with a schema-specific design review that maps these logical entities to Prisma/PostgreSQL constraints and indexes. That review may refine physical names and normalization but must preserve the ownership, lifecycle, immutability, provenance, and compatibility rules in this document.
