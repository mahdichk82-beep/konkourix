# Curriculum Freeze and Audit

## Status

The complete theoretical curriculum catalog now has an offline audit and a deterministic freeze-candidate manifest. The audit passes for the currently accepted structural records. The curriculum is **not frozen, imported, reviewed, or published in the database**.

The checked-in candidate is [CURRICULUM_FREEZE_MANIFEST.json](CURRICULUM_FREEZE_MANIFEST.json). The corresponding deterministic audit output is [CURRICULUM_AUDIT_REPORT.json](CURRICULUM_AUDIT_REPORT.json).

## Structural boundary

This layer represents source-explicit structure only:

- canonical root, scopes, grades, and subjects;
- explicit `فصل`/`بخش` chapter or section headings;
- explicit `درس`/`Lesson` records represented using the existing structural `TOPIC` code;
- shared-subject applicability relationships.

The 285 existing `TOPIC` records are structural lesson labels, not a semantic topic taxonomy. No educational topic decomposition, concept, sub-concept, skill, question pattern, weight, study-plan data, recommendation, or analytic metadata is included.

## Current audited snapshot

| Measure | Count |
| --- | ---: |
| Total structural nodes | 535 |
| Scopes | 4 |
| Grades | 12 |
| Subjects | 56 |
| Shared subjects | 12 |
| Scope-specific subjects | 44 |
| Chapters/sections | 177 |
| Explicit structural lessons | 285 |
| Shared applicability relationships | 36 |
| Hard audit issues | 0 |
| Manual-review items | 12 |

The catalog checksum for this candidate is pinned in the freeze manifest. A catalog, relationship, or review-item change produces a different checksum and requires a new candidate rather than silently changing this one.

## Audit guarantees

The audit fails when it detects:

- duplicate catalog references or source-record keys;
- missing provenance or unsupported source locators;
- missing parents, invalid parent types, cycles, or multiple/missing root structure;
- subjects that do not resolve to exactly one Grade and Scope owner;
- incomplete scope/grade matrices or inconsistent grade labels;
- branch records escaping Human Sciences, Mathematics & Physics, or Experimental Sciences ownership;
- a shared subject cloned into a branch instead of linked through applicability;
- missing, duplicate, invalid, or cross-grade applicability relationships;
- inconsistent explicit numeric chapter ordering;
- `CHAPTER` or structural `TOPIC` records without an explicit supported source label;
- unsupported node types, including prematurely introduced Concept or Subconcept nodes.

Name equality alone is not used to merge ordinary branch subjects. The protected shared-subject matrix is enforced by grade, owner, and applicability.

## Unresolved review items

The freeze candidate retains twelve manual-review items. They include:

- incomplete lower-priority source detail;
- missing official curriculum release and edition identity;
- unresolved Biology 1/2/3 parent boundaries;
- mixed or omitted structural levels;
- unresolved cross-grade thematic trees;
- unclear Chemistry linked-skills ownership and Mathematics/Experimental applicability;
- alternate informal scope headings;
- a combined Arabic source paragraph;
- undefined star markers;
- undefined educational metadata such as weights, prerequisites, and hours;
- absent detailed Geology structure.

These are review facts, not importable inferred nodes. A hard audit can pass while review items remain visible, but an authorized Publisher must decide which items block a particular release.

## Running the audit

Print the deterministic summary without database access:

```powershell
pnpm --filter api curriculum:audit-theoretical
```

Write the complete report and a generated candidate manifest to a local directory:

```powershell
pnpm --filter api curriculum:audit-theoretical --report-dir ..\..\.local-reports\curriculum-freeze
```

The command reads only checked-in catalogs. It does not initialize Prisma, connect to PostgreSQL, create a Curriculum Version, import nodes, review, freeze, or publish.

## Approval and freeze process

1. A Curriculum Admin reconciles the reviewed original `cori.docx` with the canonical transcription and resolves or explicitly accepts every release-relevant review item.
2. The source artifact and transcription SHA-256 values are calculated and replace the candidate placeholders.
3. The audit is rerun. Any hard issue blocks the release.
4. The updated report, subject list, counts, relationships, checksum, and unresolved decisions receive curriculum review approval under ADR-034 and ADR-044.
5. An authorized operator imports the exact source-bound catalogs into a draft Curriculum Version using the existing field import commands.
6. Database validation and review must reference the exact draft revision. Importing does not publish or freeze it.
7. The database Curriculum Version identifier is recorded in the release manifest only after the reviewed draft matches this candidate.
8. An authorized Publisher publishes the immutable version through the separate governance workflow. Published content is never edited in place; later changes create a new version and freeze candidate.

The checked-in manifest remains `CANDIDATE_NOT_FROZEN` with null source checksums and Curriculum Version identifier until those operational steps occur.
