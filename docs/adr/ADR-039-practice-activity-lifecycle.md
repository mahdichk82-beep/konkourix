# ADR-039: Practice Activity Lifecycle

**Status:** Accepted target architecture; not implemented
**Decision date:** 2026-09-17
**Related decisions:** ADR-027, ADR-033, ADR-037

## Context

Konkourix must distinguish daily question solving and exercises from external exam reporting and internal online exam delivery. Current `AssessmentAttempt` records contain completed count bundles, but they do not establish whether the work was ordinary practice, an external provider result, or another legacy assessment event.

Practice may be connected to a Task or Study Session, may use approved Question Bank items, or may be recorded independently from a textbook or other source. Giving Practice an exam publication, delivery, submission, timer, or scoring lifecycle would merge domains that have different ownership and evidence.

## Decision

Practice Activity is a student learning/execution fact with its own lifecycle:

```text
Draft -> Recorded -> Corrected (new revision) or Invalidated
```

A Draft is editable and is not reporting evidence. Recording validates and freezes a Practice Activity revision. A correction creates a new revision linked to the prior recorded revision and retains actor, time, and reason. Invalidation makes the record ineligible for active reporting without deleting it.

Each recorded Practice Activity:

- belongs to one student;
- pins at least one curriculum version/node pair describing the practiced material;
- records source type and source attribution sufficient to distinguish personal/external material from governed Question Bank content;
- may record actual counts such as answered, correct, incorrect, and blank when those facts are known;
- may record actual start/end or duration when known, without creating a server-enforced exam timer;
- may reference one Task and/or one Study Session when the student explicitly establishes that relationship;
- may contain per-question responses only when each response pins the exact governed Question Version used.

A Practice Activity may exist without a Task or Study Session. The system must not manufacture either relationship. Recording practice does not automatically complete a Task, change Student Progress mastery, create an External Exam Report, or create an Internal Exam Attempt.

## Alternatives Considered

- **Extend `AssessmentAttempt` for all practice.** Rejected because legacy rows are not safely classifiable and a generic attempt would continue conflating separate domains.
- **Store practice only as a `StudySession`.** Rejected because time spent and questions solved are independent facts, and practice may occur without a timed session.
- **Store practice only as Task completion.** Rejected because a Task describes intention and may contain several forms of execution evidence.
- **Use the Internal Exam attempt engine.** Rejected because ordinary practice has no exam publication, eligibility, secure delivery, authoritative timer, or submission lifecycle.
- **Infer Practice from question-count fields.** Rejected because counts alone do not prove the activity type or source.

## Consequences

Daily practice can be reported and analyzed without acquiring false exam semantics. Task, time, question, source, and curriculum evidence can be connected explicitly while remaining independently owned. Corrections and invalidation preserve trustworthy historical reporting.

The system must support incomplete source detail and aggregate-only practice in addition to Question Bank-backed practice. Reports need clear provenance and cannot compare all practice records as though they have item-level answer data. Curriculum links and count invariants require validation.

## Migration Impact

Practice storage is added only after canonical curriculum references are available. Existing `AssessmentAttempt` rows remain untouched and continue through a legacy compatibility path. No current attempt is converted to Practice solely from its title, counts, Task link, Subject, Topic, or timing.

New workflows write Practice Activities to the new domain. A later separately approved classification process may map an existing attempt only when provenance is unambiguous and must retain the legacy identifier and original row. Existing `StudySession` and `DailyTask` rows are never created, deleted, or rewritten as part of Practice adoption.

## Security Impact

Students may create and correct their own Practice Activities within policy. Counselors may read practice for actively assigned students but cannot alter student-reported facts. Administrative correction or invalidation requires narrow permission, a reason, and audit.

Question Bank content and answer keys retain their own publication and rights controls when referenced by Practice. A Practice response must not expose unpublished questions, solutions, or other students' data. Free-form source labels and notes require safe handling, and client-supplied counts, ownership, timestamps, and curriculum pairs require server validation.

## Future Constraints

- Practice must never gain Internal Exam publication, eligibility, proctoring, or authoritative delivery semantics.
- Recorded revisions are immutable; corrections and invalidations preserve history.
- Count fields must be non-negative and internally consistent under an explicitly documented formula.
- Item-level responses must pin exact Question Versions; aggregate practice may not pretend to have item-level provenance.
- Practice evidence does not automatically determine Task Result or Student Progress mastery.
- External provider exam results must use the External Exam domain even when a student informally calls them “tests.”
- Offline capture, bulk import, shared practice sets, and automated mastery evidence require later policies.
