# ADR-038: Daily Reality Schedule Semantics

**Status:** Accepted target architecture; not implemented
**Decision date:** 2026-09-17
**Related decisions:** ADR-026, ADR-036

## Context

Educational planning needs to account for a student's real-life constraints and available time, including school, sleep, commuting, rest, and fixed commitments. These blocks are not educational Tasks, Study Sessions, counselor plan items, or proof of what the student actually did. Reusing any of those models would create false execution or educational evidence.

The student's real-world schedule may change, while a published counselor plan must retain the context against which it was prepared. The model therefore needs student ownership, privacy boundaries, and versioned consumption by counselor planning.

## Decision

Daily Reality Schedule is a student-owned availability and constraint domain. It represents the student's declared real-world context for a date or bounded date range. It does not represent curriculum work, a retrospective activity log, or counselor-authored educational intention.

A stable schedule aggregate may have editable drafts and immutable published snapshots. A snapshot contains ordered time blocks with:

- local date and start/end semantics;
- time zone context;
- a controlled block category distinguishing availability from constraints;
- an optional student-facing label or note;
- provenance and publication timestamps.

The exact category vocabulary is product-controlled and extensible; examples such as school, sleep, commute, rest, fixed commitment, and available time describe intended semantics but do not authorize an implementation enum in this ADR.

The student may edit and publish their schedule. An actively assigned counselor may read the current applicable snapshot for planning but may not silently modify it. A counselor may ask the student to update it through a separate communication workflow. When a counselor publishes a Plan Version, the plan records the exact Daily Reality Schedule snapshot used, if any. A later student schedule update does not reinterpret an already published plan.

Daily Reality blocks never create Tasks, Plan Items, Study Sessions, Practice Activities, or Task Results. If Konkourix later records retrospective actual non-study activity, that is a separate fact model and not an extension of this schedule by implication.

## Alternatives Considered

- **Represent constraints as `DailyTask` rows.** Rejected because school, rest, and availability are not learning intentions and cannot have educational completion or quality results.
- **Represent constraints as counselor Plan Blocks only.** Rejected because the underlying real-life context is student-owned and may be reused across multiple plans.
- **Infer the schedule from `StudySession` gaps.** Rejected because absence of a study record does not identify sleep, school, commute, or availability.
- **Keep one mutable calendar.** Rejected because published plans would lose the exact context used when authored.
- **Allow counselors to edit the student's schedule.** Rejected because it would erase ownership and could make a counselor assumption appear to be a student-declared fact.

## Consequences

Counselors can plan around explicit student constraints without turning those constraints into fake study work. Published plans remain reproducible against the schedule snapshot used. Students retain ownership of sensitive personal routine data.

Versioning adds storage and requires a clear publish/update interaction. Planning must handle missing, incomplete, overlapping, or stale schedule information explicitly rather than treating it as guaranteed availability. Product design must distinguish a reality-schedule block from a counselor plan block even when they appear together in a calendar projection.

## Migration Impact

This domain is introduced additively. No current `StudyPlan`, `DailyTask`, or `StudySession` row is reclassified or backfilled as Daily Reality data. Existing schedule gaps and task dates provide no safe basis for inference.

Future counselor Plan Versions may optionally reference an immutable schedule snapshot. During compatibility, planning continues to work when no snapshot exists. Adoption can be staged by student cohort and planning workflow without changing historical study or assessment records.

## Security Impact

Daily Reality data exposes routines, locations by implication, and periods of likely availability. Read access is limited to the student, their currently authorized counselor where needed for planning, and narrowly authorized administrators. It must not become generally visible to other counselors, teachers, students, or communication participants.

Authorization is evaluated server-side for every read and mutation. Counselor relationship termination removes future access unless a specific retention/legal policy requires otherwise. Exports, audit records, analytics, and notifications must minimize block detail. Free-text labels and notes are untrusted content and require normal validation and safe rendering.

## Future Constraints

- Daily Reality is context/availability, not educational intention and not retrospective execution evidence.
- A published Plan Version may reference only an immutable schedule snapshot.
- Updating a schedule cannot rewrite or silently republish a counselor plan.
- No block may be converted automatically into a Task or Study Session.
- Time-zone and local-date semantics must be explicit before persistence is implemented.
- Overlap, recurrence, exceptions, staleness, retention, and counselor suggestion workflows require explicit product policies; implementations must not guess them.
- Future integrations with device calendars require opt-in and must preserve source provenance and student control.
