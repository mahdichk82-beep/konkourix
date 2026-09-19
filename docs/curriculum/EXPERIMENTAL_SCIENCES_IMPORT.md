# Experimental Sciences Curriculum Structural Import

## Status

The Experimental Sciences structural catalog and governed draft-import command are implemented. No database import or publication has been executed. Execution requires a reviewed original source artifact, an authorized Admin UUID, and a draft Curriculum Version.

The command never reviews or publishes a Curriculum Version. Authorized curriculum administrators must complete those workflows separately.

## Imported scope

The catalog is a stable-key, provenance-bound projection of `CANONICAL_CURRICULUM.md`. It contains:

- the same canonical root, shared-course scope, theoretical branch/grade skeletons, and shared subject records used by the Human Sciences and Mathematics & Physics catalogs;
- Grade 10 subjects: `ریاضی ۱`, `فیزیک ۱`, `شیمی ۱`, and `زیست‌شناسی ۱`;
- Grade 11 subjects: `ریاضی ۲`, `فیزیک ۲`, `شیمی ۲`, `زیست‌شناسی ۲`, and `زمین‌شناسی`;
- Grade 12 subjects: `ریاضی ۳`, `فیزیک ۳`, `شیمی ۳`, and `زیست‌شناسی ۳`;
- 42 source-explicit chapter nodes: 10 Chemistry, 11 Physics, and 21 Mathematics chapters;
- the existing 12 shared grade-specific subjects and their explicit structural detail;
- the same 36 shared-subject `APPLICABILITY` relationships to the corresponding grades in all three theoretical branches.

The catalog reuses the exact stable source keys assigned to the common theoretical foundation. Import order therefore does not clone root, scope, grade, shared subject, or shared lesson records.

## Structural boundary and unresolved source material

Only reviewed, explicit source structure is importable:

- explicit subject labels in the source's Experimental Sciences grade tree become `SUBJECT` nodes;
- explicit grade-book `فصل ...` labels become `CHAPTER` nodes;
- explicit `درس ...` or `Lesson ...` nodes would use structural `TOPIC`;
- no field-specific explicit lesson nodes are accepted by this catalog, so no Experimental Sciences `TOPIC` nodes are created;
- unlabeled branches are not promoted to lessons, topics, concepts, or skills;
- source labels, ordering, raw text, NFC display labels, and exact line provenance are preserved.

The following source material remains deliberately excluded:

1. Biology chapters at `CANONICAL_CURRICULUM.md:L1813-L2281`. The source contains three chapter-number sequences but no explicit `زیست‌شناسی ۱`, `زیست‌شناسی ۲`, or `زیست‌شناسی ۳` headings at the sequence boundaries. Assigning them to grades would infer parentage.
2. Detailed Geology structure. The source identifies the Grade 11 subject but supplies no detailed Geology tree.
3. The cross-grade tree headed `ریاضی تجربی ـ کوریکولوم موضوعی` at lines 3604–3927. Its relationship to the three grade-specific Mathematics subjects is unresolved.

These exclusions are recorded in the catalog as source ambiguities for administrator review; they are not represented as importable ambiguous records. Consequently, the generated manifest is valid and contains only accepted structure.

## Shared subject ownership

Persian, Arabic/Quran Language, Religion and Life, and English remain owned once under the source-defined shared scope. They are not copied beneath Experimental Sciences. Grade applicability is represented only through non-owning `APPLICABILITY` relationships.

## Preconditions

1. Apply the existing Phase 20 curriculum migrations without rewriting migration history.
2. Supply the reviewed original `cori.docx` source artifact externally.
3. Use the repository `docs/curriculum/CANONICAL_CURRICULUM.md` transcription unchanged after catalog review.
4. Use an active Admin with effective `CURRICULUM_DRAFT_READ`, `CURRICULUM_DRAFT_EDIT`, `CURRICULUM_IMPORT_OPERATE`, and `CURRICULUM_SOURCE_READ` capabilities.
5. Choose a new draft label or an existing editable draft and its current revision.
6. Use a stable idempotency key for this catalog and provenance pair.

## Preflight

```powershell
pnpm --filter api curriculum:import-experimental-sciences preflight `
  --source-artifact C:\secure-source\cori.docx `
  --transcription ..\..\docs\curriculum\CANONICAL_CURRICULUM.md `
  --expected-revision 0 `
  --idempotency-key experimental-sciences-structure-v1 `
  --report-dir ..\..\.local-reports\experimental-sciences
```

Preflight performs source-drift, provenance, manifest, parent, ordering, duplicate-key, and ambiguity validation without database writes.

## Draft import

```powershell
pnpm --filter api curriculum:import-experimental-sciences execute `
  --source-artifact C:\secure-source\cori.docx `
  --transcription ..\..\docs\curriculum\CANONICAL_CURRICULUM.md `
  --admin-user-id <authorized-admin-uuid> `
  --target-version-id <draft-curriculum-version-uuid> `
  --expected-revision <current-draft-revision> `
  --idempotency-key experimental-sciences-structure-v1 `
  --reason "Initial Experimental Sciences structural import" `
  --report-dir ..\..\.local-reports\experimental-sciences
```

The command imports through the existing governed Curriculum service, reuses stable source-key matches, creates only missing applicability relationships, emits reports, and never publishes.

## Expected validation totals

| Type | Experimental-specific | Complete catalog |
| --- | ---: | ---: |
| Curriculum root | 0 | 1 |
| Fields/scopes | 0 | 4 |
| Grades | 0 | 12 |
| Subjects | 13 | 25 |
| Chapters | 42 | 66 |
| Explicit lessons (`TOPIC`) | 0 | 119 shared lessons |
| Total nodes | 55 | 227 |
| Shared applicability relationships | — | 36 |
| Concepts/sub-concepts | 0 | 0 |

Publication remains governed separately under ADR-033 and ADR-034.
