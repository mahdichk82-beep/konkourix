# Human Sciences Curriculum Structural Import

## Status

The Human Sciences structural catalog and governed draft-import command are implemented. No database import has been executed from this repository state because the required original `cori.docx` source artifact is not present in the workspace.

The command never reviews or publishes a Curriculum Version. Public curriculum APIs expose only a separately reviewed and published version; authorized admin APIs can inspect the resulting draft.

## Imported scope

The catalog is a fixed, stable-key projection of the reviewed `CANONICAL_CURRICULUM.md` transcription:

- one architectural Curriculum root;
- four source-defined scopes: shared courses, Mathematics-Physics, Experimental Sciences, and Human Sciences;
- Grade 10, 11, and 12 under each scope;
- 20 Human Sciences-specific subjects under their exact source grades;
- 12 grade-specific shared subject nodes: Persian, Arabic/Quran Language, Religion and Life, and English for each grade;
- 86 explicit `فصل` or `بخش` nodes stored as `CHAPTER`;
- 285 explicit `درس` or `Lesson` nodes stored at the existing `TOPIC` structural level;
- 36 `APPLICABILITY` relationships from the 12 shared subjects to the corresponding grade in each theoretical branch.

The shared course nodes are owned exactly once under `دروس مشترک پایه‌های دهم، یازدهم و دوازدهم`. Applicability relationships do not create additional parents or cloned subjects. The Mathematics-Physics and Experimental Sciences scopes contain only the field/grade skeleton required as applicability endpoints; this milestone imports none of their field-specific subjects.

The exact canonical source label `جغرافیای ایران` is retained for Grade 10 rather than replacing it with the shorthand `جغرافیا ۱`.

## Structural boundary

This import selects only explicit structural labels:

- `فصل ...` and `بخش ...` become chapters;
- `درس ...` and `Lesson ...` become lesson-level nodes using the architecture's existing `TOPIC` code;
- lessons attach directly to their subject when the source contains no explicit chapter;
- unlabeled branches beneath chapters or lessons are not promoted, merged, split, or imported;
- concepts, sub-concepts, thematic alternate trees, weights, stars as metadata, questions, planning, analytics, and recommendations remain out of scope.

The catalog retains exact `rawText`, including tree connectors and source Unicode. Display labels use NFC as required by the import contract. Every record has an assigned opaque source key and an exact transcription line locator. Import execution refuses to continue if any catalogued source line no longer matches the transcription byte-for-byte.

## Explicit exclusions

This milestone does not import:

- `نگارش ۱`, `نگارش ۲`, or `نگارش ۳`;
- `آمادگی دفاعی`;
- `هویت اجتماعی`;
- `سلامت و بهداشت`;
- any lower topic/concept detail;
- any cross-grade thematic tree.

## Preconditions

Before execution:

1. Apply the existing Phase 20 curriculum migrations without rewriting migration history.
2. Supply the original reviewed `cori.docx` file externally.
3. Use the repository `docs/curriculum/CANONICAL_CURRICULUM.md` transcription without modification after catalog review.
4. Use an active Admin with effective `CURRICULUM_DRAFT_READ`, `CURRICULUM_DRAFT_EDIT`, `CURRICULUM_IMPORT_OPERATE`, and `CURRICULUM_SOURCE_READ` capabilities.
5. Choose either a new draft label or an existing editable draft.
6. Use a stable idempotency key for the exact import intent.

## Preflight

Preflight validates source/transcription checksums, exact catalog line fidelity, manifest structure, stable parents, ordering, and ambiguity counts without database writes:

```powershell
pnpm --filter api curriculum:import-human-sciences preflight `
  --source-artifact C:\secure-source\cori.docx `
  --transcription ..\..\docs\curriculum\CANONICAL_CURRICULUM.md `
  --expected-revision 0 `
  --idempotency-key human-sciences-structure-v1 `
  --report-dir ..\..\.local-reports\human-sciences
```

## Draft import

Create a new draft:

```powershell
pnpm --filter api curriculum:import-human-sciences execute `
  --source-artifact C:\secure-source\cori.docx `
  --transcription ..\..\docs\curriculum\CANONICAL_CURRICULUM.md `
  --admin-user-id <authorized-admin-uuid> `
  --create-draft-label <unique-draft-label> `
  --expected-revision 0 `
  --idempotency-key human-sciences-structure-v1 `
  --reason "Initial Human Sciences structural import" `
  --report-dir ..\..\.local-reports\human-sciences
```

For an existing draft, replace `--create-draft-label` with `--target-version-id` and pass that draft's current revision.

The command imports the manifest through the existing governed service, reuses prior node matches with the same stable source keys, creates only missing applicability relationships, runs final draft validation, and writes preflight, ambiguity, and execution reports. It has no publication command.

## Expected validation totals

| Type | Count |
| --- | ---: |
| Curriculum root | 1 |
| Fields/scopes | 4 |
| Grades | 12 |
| Subjects | 32 |
| Chapters/sections | 86 |
| Explicit lessons | 285 |
| Total nodes | 420 |
| Shared applicability relationships | 36 |
| Concepts/sub-concepts | 0 |

Publication remains a separate authorization, deterministic validation, Curriculum Review, and Publisher workflow under ADR-033 and ADR-034.
