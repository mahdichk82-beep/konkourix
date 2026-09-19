# ADR-037: Task Result and Five-Level Learning Quality

**Status:** Accepted target architecture; not implemented
**Decision date:** 2026-09-17
**Related decisions:** ADR-024, ADR-026, ADR-036

## Context

`DailyTask` currently combines planned intention with a small operational status (`PENDING`, `COMPLETED`, or `SKIPPED`) and completion/skip fields. `StudySession` separately records actual time intervals and optional focus and study-quality ratings. The target educational model needs richer student feedback without turning a planned Task into a mutable execution record or treating completion as a generic checkbox.

Task-level learning quality, session-level study quality, and Student Progress mastery answer different questions. They must remain separate facts and must not be inferred from one another.

## Decision

Planned Task content and Task Result are separate domain records. A Task describes the assigned or personal learning intention. A Task Result records the student's report of what happened against that intention.

The result outcome distinguishes:

- `COMPLETED`: the student reports that the intended learning unit was completed;
- `INCOMPLETE`: the student attempted or evaluated the unit but did not complete the intended outcome;
- `SKIPPED`: the student reports non-execution, with an approved reason where required.

A student-submitted `COMPLETED` or `INCOMPLETE` result requires learning quality on this fixed five-level ordinal scale:

1. Very weak
2. Weak
3. Average
4. Good
5. Excellent

Learning quality is absent for pending work and normally absent for `SKIPPED`, because no learning outcome is being rated. Optional result feedback may include a student note, perceived difficulty, and problem description. Labels may be localized, but stored semantics and ordinal values remain stable.

Corrections do not overwrite audit history. The current effective result may be revised through an explicit correction action that retains actor, time, prior values, and reason. Task Result creation or correction does not automatically create a Study Session, update Student Progress mastery, or infer Practice or Assessment evidence.

## Alternatives Considered

- **Continue storing result state directly on `DailyTask`.** Rejected because plan intention and reported reality have different ownership, mutability, and audit requirements.
- **Use a completed boolean.** Rejected because it cannot represent incomplete effort or intentional non-execution.
- **Use free-form or ten-point quality ratings.** Rejected because the approved product feedback model is a consistent five-level scale.
- **Reuse `StudySession.studyQualityRating`.** Rejected because one interval's quality is not the result of an entire planned learning unit, and a task may have zero or multiple sessions.
- **Derive mastery directly from the result.** Rejected because Student Progress aggregates independently governed evidence and may require a different review policy.

## Consequences

Planning remains an immutable statement of intention while students can report educational reality in a richer, consistent form. Analytics can distinguish non-execution, incomplete effort, completion, perceived learning quality, interval quality, and mastery.

The separation adds a join and a correction/audit lifecycle. User interfaces must avoid showing two contradictory “statuses” without explaining operational task state versus submitted result. Reporting must handle legacy completed tasks whose learning quality is unknown rather than treating missing quality as a low rating.

## Migration Impact

Migration is additive. Existing `DailyTask` fields remain readable during compatibility. Future Task Result storage is introduced alongside them, and new result writes move to the new boundary by workflow.

Legacy `COMPLETED` tasks may be represented as completed with an explicit legacy-unknown quality state; no five-level value may be invented. Legacy `SKIPPED` tasks retain their existing skip time and reason. Pending tasks remain without a result. Existing `StudySession.studyQualityRating` values stay unchanged and are not copied into Task Results. Dual-read projections may bridge the transition, but dual-write behavior requires explicit failure and reconciliation rules before use.

## Security Impact

Only the owning student may submit ordinary self-reported results for their Tasks. Counselors may read results for students within an active authorized relationship but cannot impersonate the student or silently change student feedback. Exceptional administrative corrections require narrowly scoped permission, a reason, and audit.

APIs must allowlist result fields so a result submission cannot mutate Task authorship, counselor plan provenance, curriculum references, workload, schedule, or Student Progress. Notes and problem descriptions are student educational data and inherit relationship-scoped access and retention controls.

## Future Constraints

- The learning-quality scale remains exactly five ordered levels; wording may be localized without changing stored meaning.
- Missing legacy quality is “unknown,” never zero and never inferred.
- Task Result, Study Session ratings, Practice outcomes, Assessment scores, and Progress mastery remain separate write models.
- Result corrections must retain prior state and audit context.
- A result cannot rewrite its Task's plan version, curriculum pair, author, or published intention.
- Automated analytics may propose Progress evidence later but may not silently convert self-reported learning quality into canonical mastery.
