# Konkourix UX Principles

**Status:** Current UX philosophy
**Last synchronized:** 2026-09-17

Konkourix should feel calm, motivating, simple, and progress-oriented. It must not feel like Todoist, a CRM, an administrative dashboard, or data-entry software.

## Product Experience

- Konkourix must look and behave like a specialized Konkur ecosystem, not Todoist, a generic calendar, or a CRM.
- Lead with the student's next meaningful educational action.
- Show progress and evidence in language students and counselors understand.
- Ask only for information needed at that moment.
- Prefer progressive disclosure over dense dashboards and long forms.
- Keep planning, studying, and assessment visually and verbally distinct.
- Treat errors and recovery as normal, calm states rather than punishment.
- Preserve accessible Persian/RTL behavior in both web applications.

## Experience Goals by Role

The student experience should feel motivating, alive, and progress-oriented. Motion, feedback, and visual energy should clarify momentum without becoming distracting, competitive, or manipulative. The interface should continually answer: what should I do now, what did I actually do, and what should improve next?

The counselor experience should emphasize control, fast planning, monitoring, and analysis. It should make student context, published-plan state, exceptions, and evidence legible without resembling a generic administrative dashboard.

## Visual Identity

- Use a blue-based visual foundation appropriate to trust, focus, and educational energy.
- Aim for a modern, premium, comfortable interface rather than a dense enterprise console.
- Glass UI elements may be used selectively for hierarchy, overlays, and focus surfaces; readability, contrast, and performance take priority over decoration.
- Energy should come from purposeful color, spacing, motion, and progress feedback, not visual noise.
- Light and dark themes must retain accessible contrast and consistent semantic colors.
- Visual styling never substitutes for clear domain language, loading/error states, or backend authorization.

## Student Principle: Minimum Data Entry

Students should spend the minimum practical time entering data. Prefer contextual actions with sensible, server-safe defaults over abstract record creation.

Avoid a generic workflow such as:

```text
Create Task
Title
Description
Deadline
Category
Priority
```

Prefer an educational context such as:

```text
Today
10:00–11:00
Biology
Chapter 2
Start Study
```

The student should understand what to do, start quickly, recover safely from stale execution, and add optional feedback without completing a long administrative form. Assessment entry should likewise capture only the facts needed for the current workflow.

### Learning Result, Not Checkbox Completion

Completing a learning task should capture whether the intended unit was completed and how well the student learned it. The target feedback is:

- completion: completed or incomplete;
- learning quality: 1 Very weak, 2 Weak, 3 Average, 4 Good, 5 Excellent;
- optional student note;
- optional difficulty or problem description.

```text
Study Infinite Functions
Completed: Yes
Quality: 2/5
Note: Concept understood but exercises are difficult
```

This task-level quality is not the same as the existing quality rating for one `StudySession`. The UI must label them clearly and must not derive one from the other.

## Counselor Principle: Paper-Speed Planning

Counselor planning should feel like a digital version of professional handwritten exam planning: fast, spatially understandable, and optimized for repeated daily/weekly work rather than repeated form completion.

Preferred future workflow:

```text
Curriculum
    |
Topic selection
    |
Time blocks
    |
Publish plan
    |
Student execution
```

The interface should favor rapid repetition, keyboard-efficient entry, clear student context, and review before publishing. Monitoring should surface useful exceptions and evidence instead of forcing counselors through every record.

Example day:

```text
08:00–13:00  School
14:00–16:00  Rest
16:00–17:30  Mathematics — Function
17:30–18:30  Biology
```

The target planning experience lets a counselor:

- create daily time blocks quickly;
- repeat blocks across a week;
- copy schedules between appropriate days or plans;
- assign canonical curriculum items with minimal search and typing;
- distinguish availability/context blocks such as school or rest from learning tasks.
- revise future blocks and publish a new plan version without changing historical execution.

Avoid long forms, excessive typing, one-record-at-a-time friction, and generic priority/category fields that do not help exam preparation.

School/rest blocks express schedule context, not learning tasks. Their future persistence model is not defined by this UX direction and must not be fabricated as `DailyTask` behavior today.

## Personal Learning Tasks

Students may create their own learning tasks, for example “Review chapter 2 biology.” Authorized counselors should see that the task was created by the student and see its completion, task-level learning quality, and notes when those feedback capabilities exist.

Student-created and counselor-created tasks must remain visibly distinguishable. Personal task creation must still reference the canonical curriculum rather than creating a private subject/topic tree.

## Domain Language in the Interface

- Use **plan/task** for intended educational work.
- Use **study session** for actual study time.
- Use **assessment attempt** for a completed test, quiz, or exam result.
- Use **practice** for learning exercises without an exam lifecycle.
- Distinguish **external exam report** from a future **Konkourix online exam**.
- Never present an assessment attempt as recorded study time.
- Never imply that finishing a timer automatically completes the educational intention.

## Measurement and Motivation

Raw evidence should be understandable before advanced interpretation is added. Current ratings and attempt counts are facts, not diagnoses, ranks, or AI conclusions. Future insights should explain their basis and support improvement rather than shame, overload, or manipulate the student.

## Scope Boundary

These principles guide future UI/UX review. They do not assert that the current interfaces already meet the target experience and do not authorize UI changes in this documentation synchronization. Exact component styling, animation, glass treatment, and design tokens require a later UI specification and accessibility review.
