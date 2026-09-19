# Communication Architecture

**Status:** Approved target architecture; not implemented
**Last synchronized:** 2026-09-17

Communication is divided by purpose. A shared notification or inbox view may compose these capabilities, but their write models and lifecycles remain separate.

## A. General Chat

General Chat supports lightweight, conversational student-counselor communication.

- It is relationship-scoped, not attached separately to every task, plan, session, assessment, topic, or report.
- Messages are chronological conversational records with participant and authorization checks.
- Optional contextual links may point to another record without creating a new chat room for that record.
- Chat does not replace plan revision, task feedback, tickets, counselor notes, or audit history.

## B. Ticket / Thread

Tickets provide structured, resolvable discussions for:

- study problems;
- plan discussion;
- report review;
- technical issues.

A ticket has a category, subject, owner/requester, authorized participants, status, timestamps, and a threaded history. It may carry a typed contextual reference, but the referenced object does not own a chat. Ticket resolution and reopening are explicit and auditable.

## C. Suggestions

Suggestions are governed submissions for:

- curriculum changes;
- question submissions;
- product or workflow improvements.

Suggestions have intake, review, decision, and feedback states. Curriculum suggestions cannot mutate canonical curriculum directly. Question submissions enter the Question Bank moderation workflow rather than becoming published questions. Product suggestions are not support tickets unless deliberately reclassified with an audit trail.

## Boundary Rules

- Do not create entity-based chat for every object.
- Do not use chat messages as authoritative plan changes, assessment corrections, curriculum edits, or support-ticket status.
- Do not expose private counselor notes through any communication channel.
- Authorization follows active relationships and administrative roles at the backend.
- Retention, deletion, attachment, moderation, abuse-reporting, and notification rules require explicit future decisions.
- Search or unified inbox features are projections; they do not collapse the three source models.
