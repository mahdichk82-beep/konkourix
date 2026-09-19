# Mathematics & Physics Curriculum Structural Import

## Status

The Mathematics & Physics structural catalog and governed draft-import command are implemented. No database import has been executed because the reviewed original `cori.docx`, an authorized Admin, and a target draft were not provided.

The command never reviews or publishes a Curriculum Version. Authorized admin APIs can inspect an imported draft; public curriculum APIs expose it only after the separate validation, review, and publication workflow.

## Imported scope

The catalog is a stable-key, provenance-bound projection of `CANONICAL_CURRICULUM.md`. It contains:

- the same architectural root, shared-course scope, theoretical branch scopes, grades, and shared course records used by the Human Sciences catalog;
- Grade 10 Mathematics & Physics subjects: `ریاضی ۱`, `هندسه ۱`, and `فیزیک ۱`;
- Grade 11 Mathematics & Physics subjects: `حسابان ۱`, `هندسه ۲`, `آمار و احتمال`, and `فیزیک ۲`;
- Grade 12 Mathematics & Physics subjects: `حسابان ۲`, `هندسه ۳`, `ریاضیات گسسته`, and `فیزیک ۳`;
- 49 explicit Mathematics & Physics `فصل`/`بخش` nodes stored as `CHAPTER`;
- the existing 12 shared grade-specific subject nodes and their explicit structural detail;
- the same 36 shared-subject `APPLICABILITY` relationships to the corresponding grades in all three theoretical branches.

The catalog intentionally reuses the exact stable source keys already assigned to the common theoretical foundation. Importing Mathematics & Physics before or after Human Sciences therefore reuses those nodes rather than matching by name or creating duplicates.

## Structural boundary

Only explicit structure is imported:

- explicit `فصل ...` and `بخش ...` labels become `CHAPTER` nodes;
- explicit `درس ...` or `Lesson ...` labels would use the existing structural `TOPIC` type;
- the Mathematics & Physics detailed source trees contain no explicit `درس`/`Lesson` labels, so this catalog creates zero field-specific lesson nodes;
- unlabeled branches below chapters are not promoted to lessons or topics;
- source labels, ordering, raw tree text, NFC display labels, and exact line provenance are preserved;
- concepts, sub-concepts, skills, question patterns, stars as weights, difficulty, planning data, analytics, recommendations, and inferred content are excluded.

Every new Mathematics & Physics record has an opaque stable source key. Import execution fails closed if any selected line no longer matches the reviewed transcription byte-for-byte.

## Shared subject ownership

Persian, Arabic/Quran Language, Religion and Life, and English remain owned once under `دروس مشترک پایه‌های دهم، یازدهم و دوازدهم`. They are not copied beneath Mathematics & Physics. Grade-specific applicability is represented only through non-owning `APPLICABILITY` relationships.

## Preconditions

1. Apply the existing Phase 20 curriculum migrations without rewriting history.
2. Supply the reviewed original `cori.docx` externally.
3. Use the repository `docs/curriculum/CANONICAL_CURRICULUM.md` transcription unchanged after catalog review.
4. Use an active Admin with effective `CURRICULUM_DRAFT_READ`, `CURRICULUM_DRAFT_EDIT`, `CURRICULUM_IMPORT_OPERATE`, and `CURRICULUM_SOURCE_READ` capabilities.
5. Choose a new draft label or an existing editable draft and its current revision.
6. Use a stable idempotency key for this exact catalog and provenance.

## Preflight

```powershell
pnpm --filter api curriculum:import-mathematics-physics preflight `
  --source-artifact C:\secure-source\cori.docx `
  --transcription ..\..\docs\curriculum\CANONICAL_CURRICULUM.md `
  --expected-revision 0 `
  --idempotency-key mathematics-physics-structure-v1 `
  --report-dir ..\..\.local-reports\mathematics-physics
```

Preflight performs source-drift, provenance, manifest, parent, ordering, duplicate-key, and ambiguity validation without database writes.

## Draft import

```powershell
pnpm --filter api curriculum:import-mathematics-physics execute `
  --source-artifact C:\secure-source\cori.docx `
  --transcription ..\..\docs\curriculum\CANONICAL_CURRICULUM.md `
  --admin-user-id <authorized-admin-uuid> `
  --create-draft-label <unique-draft-label> `
  --expected-revision 0 `
  --idempotency-key mathematics-physics-structure-v1 `
  --reason "Initial Mathematics and Physics structural import" `
  --report-dir ..\..\.local-reports\mathematics-physics
```

For an existing draft, replace `--create-draft-label` with `--target-version-id` and pass its current revision. When another field catalog has already populated the common foundation, those records and applicability relationships are reused idempotently.

The command imports through the existing governed Curriculum service, creates only missing applicability relationships, runs final draft validation, emits preflight/ambiguity/execution reports, and never publishes.

## Expected validation totals

| Type | Mathematics-specific | Complete catalog |
| --- | ---: | ---: |
| Curriculum root | 0 | 1 |
| Fields/scopes | 0 | 4 |
| Grades | 0 | 12 |
| Subjects | 11 | 23 |
| Chapters/sections | 49 | 73 |
| Explicit lessons (`TOPIC`) | 0 | 119 shared lessons |
| Total nodes | 60 | 232 |
| Shared applicability relationships | — | 36 |
| Concepts/sub-concepts | 0 | 0 |

Publication remains governed separately under ADR-033 and ADR-034.
