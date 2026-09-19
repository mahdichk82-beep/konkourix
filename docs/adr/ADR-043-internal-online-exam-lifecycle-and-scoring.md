# ADR-043: Internal Online Exam Lifecycle and Scoring

**Status:** Accepted target architecture; not implemented
**Decision date:** 2026-09-17
**Related decisions:** ADR-027, ADR-033, ADR-041

## Context

Current `AssessmentAttempt` stores an already completed bundle of correct, incorrect, and blank counts. It is not an online delivery engine and cannot represent exam authoring, publication, exact question selection, eligibility, a server-authoritative attempt, responses, evaluation, or reproducible scoring.

Internal Online Exams are authored and delivered by Konkourix. They must remain separate from daily Practice and provider-owned External Exam Reports. Because questions and scoring rules may change, every result must be reproducible against immutable versions of the exam and questions actually delivered.

## Decision

An Internal Exam has a stable logical definition and immutable published Exam Versions. An Exam Version contains its sections, ordered or randomized item-selection snapshot, exact published Question Versions, curriculum context, availability/eligibility policy, attempt policy, timing policy, release policy, and a versioned scoring specification.

Publishing validates the complete Exam Version atomically. Once published, its contents and scoring specification cannot change. A correction requires a new Exam Version for future attempts; it does not reinterpret completed attempts.

An Exam Attempt uses this server-owned lifecycle:

```text
Created -> In Progress -> Submitted -> Evaluating -> Evaluated
```

Exceptional terminal states include `Expired`, `Terminated`, and `Invalidated`. Transitions are explicit, authorized, and audited. The server controls start time, deadline, attempt allowance, terminal state, and accepted answer window. Reconnection resumes the same eligible in-progress Attempt using server state; a client timer is display-only.

At attempt creation/start, the delivery snapshot fixes item identity, order, option order where randomized, and the exact Exam and Question Versions. Answers may be revised only while the Attempt is in progress and within policy. Submission freezes the answer set. Objective evaluation applies the scoring specification embedded in the Exam Version. Item types requiring human judgment enter an explicit manual-review step before final evaluation.

An Evaluation records per-item outcome and computed components. An Exam Result is produced from a completed Evaluation. Re-evaluation or correction creates a new Evaluation revision with actor, reason, and prior result retained; it never mutates the published scoring specification or erases the original evaluation.

Internal Exam completion does not automatically create a Study Session, complete a Task, or set Student Progress mastery. Those domains may consume explicit evidence through separately governed rules.

## Alternatives Considered

- **Extend `AssessmentAttempt` into the delivery engine.** Rejected because its completed aggregate shape lacks versioned authoring, item delivery, answer, state, and scoring boundaries, and legacy rows are not safely reclassifiable.
- **Store only final result totals.** Rejected because scoring cannot be reproduced or corrected transparently without the delivered item and answer evidence.
- **Allow edits to a published Exam.** Rejected because students could take materially different exams under one identity and result interpretation would drift.
- **Use the browser timer and submission state as authority.** Rejected because clients are untrusted, clocks drift, and reconnect behavior would be inconsistent.
- **Reuse Practice lifecycle.** Rejected because Practice has no eligibility, secure timed delivery, frozen submission, or authoritative scoring contract.
- **Reference logical Questions without versions.** Rejected because later question or answer-key changes would alter historical evaluation.

## Consequences

Attempts and results are reproducible, secure, and resilient to later content changes. Timing, randomization, scoring, manual review, and corrections have explicit owners. Practice, external evidence, and internal delivery remain cleanly separated.

The domain requires more storage, transactional state transitions, background evaluation, idempotent submission, clock handling, and operational monitoring. Randomized delivery must persist its realized snapshot. Reporting must distinguish an original evaluation from a later correction without double counting.

## Migration Impact

Internal Online Exam storage is introduced additively after Canonical Curriculum and the moderated Question Bank are operational. No current `AssessmentAttempt` is converted into an Internal Exam Attempt, and no historical Study Session or Assessment Attempt is deleted or rewritten.

Existing completed-attempt APIs and reports continue through their compatibility path while new Internal Exam endpoints and projections are introduced. If a unified student history is later desired, it is a read projection over legacy assessment evidence and Internal Exam Results, not a shared write table. Cutover does not occur until authorization, delivery recovery, scoring reproducibility, and result reads are proven.

## Security Impact

Exam authoring, review, publication, eligibility management, delivery, manual evaluation, result correction, and invalidation require distinct server-enforced permissions. Students may access only eligible Exam Versions and their own Attempts. Answer keys and solutions remain inaccessible until the Exam Version's release policy permits disclosure.

The server validates attempt ownership and state on every answer and submission. Security controls must address replay, duplicate submission, request tampering, unauthorized item enumeration, leaked answer material, abuse/rate limits, audit integrity, and secure handling of rich question media. Randomization is not a substitute for authorization or content protection.

## Future Constraints

- Published Exam Versions, delivered item snapshots, submitted answers, and finalized evaluation revisions are immutable.
- Every delivered item pins an exact published Question Version and every exam curriculum reference pins a curriculum version/node pair.
- Scoring is versioned with the Exam Version; no global formula may retroactively rescore history.
- Server time and server state are authoritative for attempt lifecycle and deadlines.
- Rights withdrawal prevents new delivery but does not silently delete evidence required to reproduce lawful historical results.
- Retakes, accommodations, appeals, proctoring, offline delivery, partial manual marking, result release, and negative-marking formulas require explicit policy before implementation.
- Internal Exam evidence cannot automatically mutate Tasks, Study Sessions, or Student Progress without a separately approved integration rule.
