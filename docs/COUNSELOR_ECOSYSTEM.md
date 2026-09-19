# Counselor Ecosystem Specification

**Status:** Approved target architecture; not implemented beyond assigned relationships
**Last synchronized:** 2026-09-17

This specification defines how students acquire a counselor relationship and how private counselor notes are protected.

## Student-Counselor Acquisition

Students can register and use the student product without a counselor. A counselor relationship is optional until one of the approved flows completes.

### Flow 1: Free Student Registration

1. The student registers independently.
2. The student profile exists without a counselor assignment.
3. Self-owned planning, execution, and assessment capabilities remain available according to product scope.

Registration does not auto-assign or recommend a counselor.

### Flow 2: Counselor Invitation Code

1. An eligible counselor creates or receives a bounded invitation code under an approved policy.
2. The student submits the code while authenticated.
3. The server validates code status, counselor eligibility, expiry/usage rules, and relationship conflicts.
4. The student confirms the relationship before activation unless an explicitly approved enrollment policy says otherwise.

Invitation codes are not counselor identities or permanent authorization tokens.

### Flow 3: Student Requests a Counselor

1. The student submits a counselor request and relevant conditions/preferences.
2. An authorized Super Admin reviews the request and evaluates the student's stated conditions.
3. The Super Admin introduces one or more suitable counselors.
4. The student reviews the introduced options and makes the final selection.
5. The selected counselor and relationship become active through an explicit confirmation workflow.

There is no automatic matching, ranking-driven assignment, or silent placement. Software may later assist administrative review, but an authorized human introduces candidates and the student makes the final selection.

## Relationship Lifecycle

Relationships require explicit states for request, introduction, selection/confirmation, active service, and closure or rejection. Exact state names are an implementation detail. Every transition records actor, time, and reason. Ending a relationship removes future access but does not rewrite plans, execution, assessment evidence, tickets, or required audit history created while access was valid.

## Private Counselor Notes

Private Counselor Notes are a separate confidential capability for:

- observations about behavior and engagement;
- learning weaknesses or recurring difficulties;
- reminders and follow-up context.

Visibility is limited to:

- the counselor who owns the note; and
- specifically authorized administrators performing approved oversight.

Students, other counselors, teachers, and ordinary support roles cannot read private notes. A reassigned counselor does not automatically inherit previous private notes; any transfer policy requires explicit approval and audit.

Private notes are not chat, student-visible feedback, plan content, diagnostic records, or a substitute for structured progress facts. They require server-side authorization, access audit, safe retention rules, and careful handling of sensitive content. They must not be used for automatic matching or automated adverse decisions.

## Unresolved Implementation Details

- invitation issuance, expiry, revocation, and usage limits;
- relationship confirmation and counselor acceptance rules;
- data collected in a counselor request;
- Super Admin review tooling and audit retention;
- reassignment and concurrent-counselor policy;
- private-note retention, export, deletion, and exceptional transfer;
- notification and consent language.
