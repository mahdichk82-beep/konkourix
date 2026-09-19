# Konkourix Roadmap

**Status:** Product-direction baseline
**Last synchronized:** 2026-09-17

This roadmap distinguishes verified foundations from future direction. The dependency sequence below is approved, but no listed future item has an implied date, milestone scope, or implementation authorization.

## Completed Foundations

| Milestone | Foundation | Status |
| --- | --- | --- |
| M13 | Counselor planning foundation | Complete |
| M14 | Study execution foundation | Complete |
| M15 | Active execution and timer foundation | Complete |
| M16 | Study-session recovery and cancellation | Complete |
| M17 | Study-session feedback | Complete |
| M19 | `AssessmentAttempt` foundation | Complete |

Milestone identifiers are historical and are not renumbered to hide gaps. This baseline does not assign or infer an M18 scope.

## Completed Architecture Specifications

The following target designs are approved as documentation only and remain unimplemented:

- canonical curriculum identity, hierarchy, releases, governance, and non-destructive legacy compatibility;
- versioned counselor plans, future revisions, immutable published intention, and audit requirements;
- separate practice, external-exam-report, and internal-exam domains;
- moderated versioned Question Bank with many-to-many curriculum linkage;
- separated General Chat, Ticket/Thread, and Suggestions capabilities;
- free registration, invitation-code, and human-reviewed counselor acquisition flows;
- private counselor-note authorization boundaries;
- role-specific product experience and visual direction.

These specifications do not authorize schema, migration, API, UI, or infrastructure work.

## Ordered Architecture Phases

Advanced reports and analytics must not precede the curriculum foundation they need. The approved dependency order is:

1. Canonical curriculum management
2. Student progress tracking
3. Question bank foundation
4. Online exam engine
5. Advanced analytics

Each phase still requires separately approved product scope, data design, APIs, UX, and migration strategy. Listing the order does not authorize implementation.

Improved planning UX is a continuing product stream, beginning with fast canonical-curriculum assignment and professional daily/weekly block planning backed by versioned publication and revision semantics. Communication, counselor acquisition, private notes, content platform, subscriptions, schools/organizations, and external-exam reporting remain later directions without assigned phase numbers.

## Curriculum Direction

Curriculum is strategic infrastructure for planning, study tracking, assessment, questions, online exams, content, and analytics. The accepted design is one centrally managed deep tree supporting تجربی, ریاضی, انسانی, and future tracks. Domain experts curate it; students, counselors, schools, and AI cannot modify it.

The current student-owned subject/topic implementation is transitional. [CANONICAL_CURRICULUM_SPECIFICATION.md](CANONICAL_CURRICULUM_SPECIFICATION.md) now defines the required non-destructive compatibility stages, but it does not prescribe SQL or authorize execution.

## Explicitly Deferred — Not Current

- AI analysis
- analytics platform and advanced reporting
- ranking
- question bank
- online exams and live assessment execution
- live classes
- school management
- payment system
- counselor marketplace
- post-exam ecosystem

Other deferred product extensions include recorded educational content, provider-specific external-exam ingestion, subscriptions/billing, and advanced counselor acquisition workflows.

## Delivery Guardrail

Future milestones must preserve the official separation:

```text
DailyTask          = planned educational intention
StudySession       = actual study interval
AssessmentAttempt  = completed assessment submission
```

No roadmap item is permission to merge these models, manufacture study sessions for tests, or make task outcomes automatic.

Practice/exercises, external-exam reporting, and internal online-exam delivery also remain separate. Questions and student progress reference canonical nodes rather than user-created curriculum.

Published counselor plan versions and historical execution remain immutable. Future schedule changes occur through reviewed revisions. General chat, tickets, suggestions, private counselor notes, and audit history remain separate capabilities, and counselor-request flow never uses automatic matching.
