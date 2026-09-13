# Konkourix API

All application routes use the `/api/v1` prefix and the standard success/error envelope. Authentication and authorization are server-owned; browser-supplied roles, owners, and creator identities are never authoritative.

## Counselor batch task creation

`POST /api/v1/counselor/students/:studentProfileId/tasks/batch`

Creates between 1 and 50 ordinary `DailyTask` records for one actively assigned student. The caller must be an active authenticated counselor with a `CounselorProfile` and an active `StudentCounselor` assignment to the URL student.

Request body:

```json
{
  "tasks": [
    {
      "title": "مطالعه زیست فصل ۳",
      "subjectId": "40000000-0000-4000-8000-000000000001",
      "topicId": "50000000-0000-4000-8000-000000000001",
      "scheduledFor": "2026-09-15",
      "plannedMinutes": 90,
      "plannedTestCount": 0,
      "description": ""
    }
  ]
}
```

- `title` and a real `YYYY-MM-DD` `scheduledFor` date are required.
- `plannedMinutes` is a non-negative integer up to 1440 and maps to the existing `DailyTask.estimatedMinutes` field. It defaults to `0` when omitted.
- `plannedTestCount` is a non-negative integer persisted on `DailyTask` and defaults to `0`.
- `subjectId`, `topicId`, and `description` are optional. A topic requires a subject and must be an active topic belonging to that active student-owned subject.
- The strict request schema rejects `studentProfileId`, `createdByUserId`, `source`, status/lifecycle timestamps, and all other unknown fields.

The server assigns the URL student after authorization, uses the authenticated user as creator, and sets every task to `source: "COUNSELOR"` and `status: "PENDING"` with empty completion/skip metadata. It validates the full batch before one transactional bulk insert, so a rejected or failed item creates no tasks.

Successful response (`201`):

```json
{
  "success": true,
  "data": {
    "created": 1,
    "tasks": [
      {
        "id": "60000000-0000-4000-8000-000000000001",
        "title": "مطالعه زیست فصل ۳",
        "source": "COUNSELOR",
        "status": "PENDING",
        "estimatedMinutes": 90,
        "plannedTestCount": 0
      }
    ]
  },
  "requestId": "request-id"
}
```

The real `tasks` array contains the created creator-safe `DailyTask` representations. Standard errors include authentication/role failures, `STUDENT_NOT_FOUND`, subject/topic validation errors, `TASK_DATE_INVALID`, and `VALIDATION_ERROR`.

## Student task execution

Task execution keeps planning and actual work separate: `DailyTask` remains planned work and each execution is a normal `StudySession`. Starting or finishing a session never changes the task lifecycle automatically.

### Start a task

`POST /api/v1/student/tasks/:id/start`

The endpoint accepts an empty strict JSON object. It requires an active authenticated student and an owned `PENDING` task. The server derives the student profile, task relation, optional subject relation, and `startedAt`; ownership or timestamps cannot be supplied by the client.

Successful response (`201`) returns an active `StudySession` whose `endedAt` and `durationMinutes` are `null`. Foreign or missing tasks return `TASK_NOT_FOUND`; non-pending tasks return `TASK_NOT_EXECUTABLE`.

If that task is already the student's active task, a retried start safely returns the existing session. If a different task is active, the endpoint returns HTTP `409` with `ACTIVE_STUDY_SESSION_EXISTS`; it never creates a second live session. Start is serialized by locking the authenticated student's stable `StudentProfile` row inside the database transaction.

### Read the active session

`GET /api/v1/student/study-sessions/active`

Returns the authenticated student's single current session whose `endedAt` is `null`, or `null` when no live session exists. The route accepts no user or profile identifier. It is registered before the parameterized `/student/study-sessions/:id` route.

### Switch tasks atomically

`POST /api/v1/student/tasks/:id/switch`

The endpoint accepts an empty strict JSON object and applies the same owned, `PENDING`, executable-task checks as start. In one student-row-locked transaction it uses one server transition timestamp to finish a different active session and create a new active `StudySession` for the target. It returns:

```json
{
  "finishedSession": {},
  "activeSession": {}
}
```

When no session is active, switch safely starts the target. When the target is already active, it returns the existing session with `finishedSession: null` and creates nothing. Returning to a previously studied task always creates a new continuous interval after the intervening session is closed; completed history is never resumed or collapsed.

### Finish a study session

`PATCH /api/v1/student/study-sessions/:id/finish`

Optional request body:

```json
{
  "notes": "مرور فصل سوم"
}
```

The server resolves session ownership, assigns the finish time, and calculates `durationMinutes`. Only an owned active session can be finished. Foreign sessions return `SESSION_NOT_FOUND`, repeated finishes return `SESSION_ALREADY_FINISHED`, and a server finish time that is not after the start is rejected as `SESSION_TIME_INVALID`.

The existing completed-session creation routes remain available for compatibility. A task may have zero, one, or multiple sessions; no one-to-one constraint or new execution entity was introduced.

Manual/generic StudySession creation still requires both client timestamps and may record only a completed historical interval with `startedAt < endedAt`; it cannot create an open live session. Generic updates cannot edit an active session or reopen a finished session. Live start and finish timestamps remain exclusive to the server-backed start, switch, and finish operations.

Changing a linked `DailyTask` to `COMPLETED` or `SKIPPED` returns HTTP `409` with `TASK_ACTIVE_SESSION_EXISTS` while that task has an active session. The student must finish execution first and then choose the task outcome separately. No execution endpoint changes `DailyTask.status`.
