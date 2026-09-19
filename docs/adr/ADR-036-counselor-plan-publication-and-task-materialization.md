# ADR-036: Counselor Plan Publication and Task Materialization

**Status:** Accepted target architecture; not implemented
**Decision date:** 2026-09-17
**Related decisions:** ADR-026, ADR-033

## Context

The current system lets students own `StudyPlan` records and represents actionable work as `DailyTask`. Counselors can create counselor-attributed tasks, but the current model has no draft/review/publication boundary or immutable record of the exact schedule a student received.

The target product requires counselors to move future blocks, adjust workload, change topics, and publish revised plans while preserving the original intention behind completed or already-started work. Students need an execution-facing task list, and existing task workflows must continue during a staged migration. The architecture therefore needs an explicit relationship between immutable published plan content and operational tasks.

## Decision

A counselor plan is a versioned aggregate:

- A stable Plan identifies the student, owning counselor relationship, planning purpose, and lineage.
- A Draft Revision is the counselor's editable workspace and is not student-visible plan history.
- Publishing atomically creates an immutable Plan Version with versioned schedule blocks and planned learning items.
- Every planned learning item pins its canonical curriculum version/node pair and contains the published workload and expected-outcome snapshot.
- Later changes are authored in a new revision and published as a new version with an explicit effective boundary and supersession link.

Publication materializes each actionable learning item as an execution-facing Task bound to the exact Plan Version and planned item. A Task is a projection/snapshot for execution; the published Plan Version remains the authoritative record of counselor intention. Context or availability blocks do not materialize Tasks.

When a later version changes future, unexecuted work, it creates replacement task projections and marks replaced projections as superseded for new execution. It does not rewrite a task that has execution evidence, a student result, practice evidence, or assessment evidence. Lineage connects retained, moved, revised, replaced, and cancelled future intentions across versions.

Student personal Tasks remain independent, explicitly student-authored, and do not require a counselor Plan Version. Students may report execution against counselor tasks but cannot change counselor-authored curriculum, workload, expected outcome, provenance, or schedule intention.

## Alternatives Considered

- **Keep plans and tasks mutable.** Rejected because later edits would erase what the counselor assigned and what the student actually received.
- **Treat Tasks as the sole plan source.** Rejected because a flat execution list cannot represent draft publication, block structure, atomic weekly publication, or plan-version history reliably.
- **Execute Plan Items directly without Tasks.** Rejected because it would replace the established task execution surface in one disruptive cutover and would not support personal tasks uniformly.
- **Materialize Tasks lazily when a date begins.** Rejected because students and downstream notifications need a stable, reviewable set of published future actions, and failures could make a published plan only partially actionable.
- **Update existing future Tasks in place on republish.** Rejected because evidence may arrive concurrently and provenance would become ambiguous.

## Consequences

Students observe an atomic published schedule and can continue using task-oriented execution. Counselors can revise the future without altering historical intention. Personal and counselor-authored work remain visibly distinct. Task, session, practice, and assessment evidence can all retain exact plan provenance.

The plan snapshot and task projection duplicate selected data intentionally. Publication requires transactional materialization and idempotency. Revision logic must classify plan-item lineage and determine which task projections are still safely replaceable. Read models must avoid presenting superseded tasks as active work while retaining them for history.

## Migration Impact

Migration is additive. Existing `StudyPlan` and `DailyTask` rows are retained exactly as current operational history. Existing counselor-created tasks remain valid standalone legacy counselor tasks; the migration must not synthesize plan versions or publication events that never occurred. Existing personal tasks remain personal tasks.

Future stages add versioned counselor planning records and optional plan-version/plan-item provenance on newly materialized Tasks. Existing task APIs may continue reading a compatibility projection while plan authoring and publication move behind the new domain boundary. Legacy `StudyPlan` writes are disabled only after equivalent student workflows and historical reads are supported. No historical Study Session or Assessment Attempt is moved or deleted.

## Security Impact

Only an active, authorized counselor for the student may author or publish that student's counselor plan. Draft access, publication, supersession, exceptional cancellation, and administrative intervention require server-side authorization and audit.

Students may read their published plan and submit execution facts but must be denied mutations to counselor-owned plan content and protected task fields. Publication must validate the student-counselor relationship at commit time, not only when a draft is created. Reassignment does not silently transfer draft ownership or mutation rights.

## Future Constraints

- Published Plan Versions and their items are immutable.
- Publication and task materialization must be atomic and idempotent from the student's perspective.
- A counselor task must pin the same curriculum version/node pair as its source planned item.
- Any Task with execution or result evidence is historical and cannot be repurposed for revised intention.
- Context blocks never become Tasks or Study Sessions merely to reuse an existing table.
- Student personal Tasks must never be attached retroactively to a counselor plan in a way that changes authorship.
- The effective-boundary and concurrency policies must be explicit before implementation; silent last-write-wins publication is prohibited.
