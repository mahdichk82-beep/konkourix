# Konkourix Curriculum Authoring Guide

**Status:** Phase 20.6 authoring contract
**Format identifier:** `konkourix-curriculum-authoring/v1`
**Scope:** Human preparation of reviewed curriculum source records before manifest generation
**Authority:** `cori.docx` remains the educational source of truth; this format cannot add educational content

## 1. Purpose and boundary

This guide defines the human-editable source format used by authorized Curriculum Editors and domain experts before a Curriculum Import Manifest is built.

The authoring document is an evidence-preserving worksheet. It is not:

- a published Curriculum Version;
- a replacement for `cori.docx` or its reviewed transcription;
- a source of canonical Node IDs;
- an approval or issue-resolution record;
- authority to infer a missing parent, type, label, relationship, or educational meaning;
- a way to bypass import, validation, review, or publication.

The workflow is:

```text
cori.docx + reviewed transcription
    -> human authoring document
    -> independent authoring review
    -> checksummed import manifest
    -> authorized import into a DRAFT CurriculumVersion
    -> ambiguity resolution and deterministic validation
    -> separate review
    -> separate publication command
```

Manifest creation and import never publish Curriculum. Published and superseded versions remain immutable under ADR-033. Authoring and import permissions remain separate from review and publication under ADR-034.

## 2. File format

Authoring data uses UTF-8 YAML embedded in, or extracted from, a reviewed Markdown worksheet. A working data file should use the suffix `.curriculum.yaml`. [CURRICULUM_AUTHORING_TEMPLATE.md](CURRICULUM_AUTHORING_TEMPLATE.md) is the normative copyable worksheet.

The top-level structure is:

```yaml
format_version: "konkourix-curriculum-authoring/v1"
document_key: "<opaque authoring-document key>"
status: "DRAFT"
coverage_status: "PARTIAL"

source:
  artifact_name: "cori.docx"
  artifact_sha256: null
  transcription_id: "<reviewed transcription identifier>"
  transcription_sha256: null

target:
  expected_draft_revision: 0
  idempotency_key: "<stable import attempt key>"

records: []
relationship_proposals: []
authoring_review: {}
review_history: []
```

Only the values explicitly reviewed by a human may be present. Placeholders must be removed before conversion.

### 2.1 Document control fields

| Field | Rule |
| --- | --- |
| `format_version` | Must be exactly `konkourix-curriculum-authoring/v1`. |
| `document_key` | Opaque stable key for the authoring document. It is not a Curriculum Version ID. |
| `status` | `DRAFT`, `READY_FOR_AUTHORING_REVIEW`, or `AUTHORING_REVIEWED`. It does not map to Curriculum Version lifecycle status. |
| `coverage_status` | `PARTIAL` while any source record is absent; only an authorized whole-source reconciliation may set `COMPLETE`. |
| `source.artifact_name` | Exact source filename; initially `cori.docx`. |
| `source.artifact_sha256` | Exact lowercase SHA-256 of the reviewed binary source. Never guessed or copied from another artifact. |
| `source.transcription_id` | Reviewed transcription identifier, including its approved revision/reference. |
| `source.transcription_sha256` | Exact lowercase SHA-256 of the reviewed transcription bytes. |
| `target.expected_draft_revision` | Optimistic revision expected by the import. A newly created draft starts at `0`. |
| `target.idempotency_key` | Stable key for this exact import intent. Reuse with changed content or provenance is forbidden. |

`COMPLETE` is an attestation, not a record-count guess. It requires reconciliation against the entire source, including material retained only as ambiguity or source notes.

## 3. Source record format

Every source item has one record:

```yaml
- source_record_key: "src-<opaque assigned key>"
  record_kind: "NODE_CANDIDATE"
  raw_text: |-
    <verbatim source text>
  display_label: "<exact reviewed display label>"
  source_locator: "<artifact/transcription locator>"
  source_order: 0
  proposed_node_type: null
  parent_source_record_key: null
  ambiguity_markers: []
  structural_hints: {}
  editor_notes: []
```

### 3.1 Record fields

| Field | Required behavior |
| --- | --- |
| `source_record_key` | Stable opaque registry key allocated once. Never derive it only from label, path, parent, order, or normalized text. Never renumber it when source order changes. |
| `record_kind` | `NODE_CANDIDATE`, `AMBIGUOUS_SOURCE`, or `SOURCE_NOTE`. |
| `raw_text` | Exact source/transcription content. Preserve spelling, spacing, punctuation, joining, diacritics, digits, markers, and malformed text. |
| `display_label` | Exact reviewed label proposed for display, stored in NFC. It must not silently correct the source. If no distinct label is authorized, preserve the source text. |
| `source_locator` | Recoverable artifact/transcription location. It is provenance, never identity. |
| `source_order` | Unique, zero-based, strictly increasing whole-source order. Source order determines deterministic relative ordering; alphabetical order is prohibited. |
| `proposed_node_type` | One approved type code or `null` when unresolved. |
| `parent_source_record_key` | Exactly one earlier source-record key or `null` for a root/unresolved parent. Multiple canonical parents are forbidden. |
| `ambiguity_markers` | Explicit issue codes. Any non-empty list quarantines the record during import. |
| `structural_hints` | Non-authoritative evidence for reviewers. A hint never becomes identity or resolves ambiguity automatically. |
| `editor_notes` | Author/reviewer notes kept outside source text. Notes never alter `raw_text` or `display_label`. |

The authoring document never contains `curriculum_node_id` for a new source item. Canonical identity is allocated by the controlled import/domain workflow. An existing approved registry match may be referenced only through the separately reviewed reconciliation process; equal names are insufficient.

## 4. Persian content conventions

1. Store files as UTF-8. Do not use a legacy Persian or Arabic encoding.
2. Preserve `raw_text` exactly. Do not normalize, trim, spell-check, translate, transliterate, split, merge, or retype it for style.
3. Store `display_label` in Unicode NFC while retaining the exact original in `raw_text` and provenance.
4. Do not interchange Persian and Arabic forms of letters such as `ی`/`ي` or `ک`/`ك`.
5. Do not interchange Persian, Arabic, or Latin digits.
6. Preserve half-spaces, zero-width characters, diacritics, punctuation, parentheses, colons, dashes, and source numbering.
7. Preserve labels such as `فصل ۱`, `درس ۲`, and English labels exactly when they occur.
8. Do not add Markdown emphasis, bullets, quotation marks, or numbering inside a source label unless they occur in the source.
9. Authoring metadata keys remain ASCII and left-to-right. Persian source values remain right-to-left content.
10. Search normalization, aliases, transliterations, and spelling alternatives do not belong in `display_label`; they are later derived or separately governed data.

If visible text appears wrong, retain it and add an `editor_notes` entry or ambiguity marker. An editor note is not permission to correct the source silently.

## 5. Node hierarchy rules

The only Phase 20 node type codes are:

```text
CURRICULUM_ROOT
FIELD
GRADE
SUBJECT
CHAPTER
TOPIC
CONCEPT
SUBCONCEPT
```

The source-aligned owning tree is normally:

```text
CURRICULUM_ROOT
└── FIELD
    └── GRADE
        └── SUBJECT
            └── CHAPTER
                └── TOPIC
                    └── CONCEPT
                        └── SUBCONCEPT
```

This is not a requirement to manufacture every level.

- Use only levels actually evidenced and reviewed from the source.
- An explicit source omission may skip a level when the parent/type combination has been reviewed.
- Do not create placeholder chapters, topics, concepts, grades, or subjects to make a branch look uniform.
- Every accepted node has one canonical parent within a version, except the single approved root.
- The parent record must appear earlier in `source_order` so conversion is deterministic.
- A field, grade, subject, or other heading with unclear ownership remains ambiguous rather than being attached by proximity.
- Identical or similar labels in different branches are not the same identity by default.
- Cross-grade thematic trees remain separate and quarantined until their ownership and type are authorized.
- Applicability, similarity, prerequisite, split, merge, or replacement is a non-owning relationship, never a second parent.

The source does not provide an official Curriculum root name or release metadata. The template must not invent one. Root/version metadata requires an authorized decision before an accepted root record is authored.

## 6. Concepts and sub-concepts

Use `CONCEPT` only for an explicit teachable or assessable item present beneath a subject, chapter, or topic. A concept may attach directly to a higher level only when the source explicitly skips an intermediate level and the reviewed parent is defensible.

Use `SUBCONCEPT` only when the source explicitly contains a child below a concept. Additional explicit depth may continue with `SUBCONCEPT` records, each pointing to its immediate parent.

Rules:

- do not split a compound source line into multiple concepts merely because it contains `و`, punctuation, or several phrases;
- do not merge adjacent lines into one concept because their wording is similar;
- preserve source numbering in `display_label` and store order independently;
- do not promote an example, note, exercise, or prose statement to a concept without source/domain confirmation;
- if the distinction between topic, concept, and sub-concept is unclear, set the type to `null`, add `STRUCTURAL_LEVEL_UNRESOLVED`, and quarantine the record;
- a later semantic split or merge creates new canonical identities and explicit lineage; authoring does not repoint historical references.

## 7. Ambiguity notation

Ambiguity is explicit data, not a comment to be removed before import.

```yaml
- source_record_key: "src-<opaque assigned key>"
  record_kind: "AMBIGUOUS_SOURCE"
  raw_text: |-
    <verbatim unresolved text>
  display_label: "<same unresolved label>"
  source_locator: "<exact locator>"
  source_order: 0
  proposed_node_type: null
  parent_source_record_key: null
  ambiguity_markers:
    - "CANONICAL_PARENT_UNRESOLVED"
  structural_hints:
    candidate_parent_keys: []
  editor_notes:
    - "Review required; no parent selected."
```

Any non-empty `ambiguity_markers` list causes the record to be preserved as source evidence and quarantined. It must not create or update a canonical node automatically. Children dependent on a quarantined parent must also be marked unresolved unless they have an independently reviewed parent.

Initial source issue codes include:

| Code | Use |
| --- | --- |
| `SOURCE_DETAIL_INCOMPLETE` | Detailed tree coverage is known to be narrower than the subject matrix. |
| `CURRICULUM_VERSION_METADATA_MISSING` | Official root/release metadata is absent. |
| `BIOLOGY_SUBJECT_BOUNDARIES_MISSING` | Biology sequence ownership is absent in the detailed source. |
| `STRUCTURAL_LEVEL_UNRESOLVED` | Type/depth cannot be assigned defensibly. |
| `CANONICAL_PARENT_UNRESOLVED` | No defensible single parent exists. |
| `THEMATIC_TREE_CLASSIFICATION_UNRESOLVED` | A cross-grade thematic tree lacks approved classification. |
| `BRIDGING_SKILLS_OWNERSHIP_UNRESOLVED` | `مهارت‌ها و مباحث پیوندی ⭐` lacks explicit ownership. |
| `CHEMISTRY_SHARED_OWNERSHIP_UNRESOLVED` | Shared Chemistry prose lacks an approved ownership/applicability interpretation. |
| `INFORMAL_FIELD_HEADING_UNRESOLVED` | Informal field headings lack a confirmed scope mapping. |
| `ARABIC_JOINED_PARAGRAPH` | A joined Arabic paragraph must not be split automatically. |
| `STAR_MARKER_UNRESOLVED` | `⭐` meaning is undefined. |
| `SOURCE_NOTE_NOT_EDUCATIONAL_NODE` | Source prose/note is preserved but not approved as a node. |
| `UNDEFINED_EDUCATIONAL_METADATA` | The source does not define proposed metadata such as weights or prerequisites. |

New issue codes require review and documentation; authors must not create synonymous ad hoc codes to make a report appear resolved.

An ambiguity is resolved only through the authorized issue-resolution workflow. Editing an ambiguity marker out of the authoring document is not a resolution.

## 8. Stars and notes

### 8.1 Stars (`⭐`)

When a star occurs:

- keep `⭐` in `raw_text` at the exact position;
- keep it in `display_label` unless an authorized decision says otherwise;
- add `STAR_MARKER_UNRESOLVED`;
- add any separate ownership/type ambiguity marker that also applies;
- do not convert it into importance, priority, exam weight, popularity, required/optional state, or styling metadata.

The star is currently source evidence, not interpreted product metadata.

### 8.2 Source notes

Prose or author notes that are not clearly educational nodes use `record_kind: SOURCE_NOTE`, `proposed_node_type: null`, and `SOURCE_NOTE_NOT_EDUCATIONAL_NODE`. Their text and position remain preserved. They do not become concepts or relationships automatically.

### 8.3 Editorial notes

`editor_notes` explain authoring work. They are not source content and must never be copied into `raw_text` or `display_label`. Conversion places only safe, necessary hints into manifest `structuralHints`; review commentary remains governed authoring evidence.

## 9. Multiple topics, tags, and relationships

A canonical node never gains multiple tree parents to represent multiple topics.

For an explicit cross-cutting proposal, use a typed list outside `records`:

```yaml
relationship_proposals:
  - proposal_key: "rel-<opaque assigned key>"
    type: "APPLICABILITY"
    source_record_key: "src-<source key>"
    target_record_keys:
      - "src-<target key 1>"
      - "src-<target key 2>"
    source_evidence: "<exact locator or reviewed decision reference>"
    rationale: "<review rationale>"
    ambiguity_markers: []
```

Permitted Phase 20 relationship vocabulary is `PREREQUISITE`, `APPLICABILITY`, `EQUIVALENCE`, `PREDECESSOR`, `SUCCESSOR`, `SPLIT`, `MERGE`, and `REPLACEMENT`.

Rules:

- one list entry represents one reviewed proposal; multiple targets remain explicit;
- no generic free-form tags are treated as canonical meaning;
- label equality does not create equivalence;
- relationship proposals do not change canonical parentage;
- Curriculum Import Manifest v1 has no authoritative relationship-import section. Conversion may retain proposals in report/structural-hint evidence, but must not create relationships automatically;
- approved relationships are created later through the capability-protected relationship workflow;
- downstream Question Bank multi-tagging is separate: a question links to multiple exact published `(curriculum_version_id, curriculum_node_id)` pairs. It is not authored by duplicating Curriculum nodes or adding parents here.

## 10. Conversion to Curriculum Import Manifest v1

Conversion targets [CURRICULUM_IMPORT_MANIFEST_V1.schema.json](CURRICULUM_IMPORT_MANIFEST_V1.schema.json).

### 10.1 Field mapping

| Authoring field | Manifest field/result |
| --- | --- |
| `source_record_key` | `sourceRecordKey` unchanged |
| `record_kind` | Authoring-only control. It determines whether a record may be proposed as a node or must remain quarantined; it is not copied as a canonical node attribute. |
| `raw_text` | `rawText` unchanged |
| `display_label` | `displayLabel` unchanged after NFC verification, never semantic correction |
| `source_locator` | `sourceLocator` unchanged |
| `source_order` | `sourceOrder` unchanged |
| `proposed_node_type` | `proposedNodeTypeCode`; `null` remains unresolved |
| `parent_source_record_key` | `parentSourceRecordKey`; `null` remains root/unresolved according to evidence |
| `ambiguity_markers` | `ambiguityMarkers` unchanged and de-duplicated only by rejecting duplicate input, not silently editing it |
| Safe structural evidence | `structuralHints`; hints remain non-authoritative |
| `editor_notes` | Excluded from node content; retained in the authoring/review record as policy permits |
| `relationship_proposals` | Listed in the conversion report; not imported as canonical relationships by Manifest v1 |

The converter/tooling calculates:

- each record `checksum`;
- ordered `payloadChecksum`;
- exact `sourceArtifactSha256`;
- exact `transcriptionSha256`;
- complete `manifestChecksum`;
- `manifestSchemaVersion: "1.0.0"`.

It must never calculate a canonical Node ID from authoring content.

### 10.2 Required conversion gates

Conversion fails or remains non-executable when:

- source or transcription checksums are missing or do not match the supplied files;
- `coverage_status` is not independently reconciled as `COMPLETE` for the initial whole-source import;
- placeholders remain;
- source keys or source orders are duplicated;
- records are not strictly ordered;
- an unambiguous non-root record has no reviewed parent;
- a parent appears after its child or does not exist;
- an unknown type or ambiguity code is used;
- text has been silently normalized or corrected;
- a star lacks `STAR_MARKER_UNRESOLVED`;
- an ambiguous record is presented as resolved without an authorized decision reference;
- a relationship proposal is represented as a second parent;
- source coverage/count reconciliation fails.

A valid manifest may still contain quarantined ambiguity and therefore produce a failed draft validation. “Valid manifest” means structurally safe transport, not educational approval or publication readiness.

### 10.3 Operational commands

After independent review, the Phase 20.5 tooling builds, preflights, and imports the manifest:

```powershell
pnpm --filter api curriculum:prepare-import build --draft <reviewed-records.json> --source-artifact <cori.docx> --transcription <CANONICAL_CURRICULUM.md> --out <manifest.json>

pnpm --filter api curriculum:prepare-import preflight --manifest <manifest.json> --source-artifact <cori.docx> --transcription <CANONICAL_CURRICULUM.md> --report-dir <report-directory>

pnpm --filter api curriculum:prepare-import execute --manifest <manifest.json> --source-artifact <cori.docx> --transcription <CANONICAL_CURRICULUM.md> --admin-user-id <authorized-admin-uuid> --create-draft-label <label> --reason <reason> --report-dir <report-directory>
```

The build command's reviewed input is a transport projection of this authoring document: `transcriptionId`, `expectedRevision`, `idempotencyKey`, and the mapped record fields. Source/transcription filenames and checksums are derived from the supplied files.

## 11. Review checklist

Before marking an authoring document `AUTHORING_REVIEWED`, verify:

- every value comes from the approved source, reviewed transcription, or an explicitly cited authorized decision;
- complete source coverage has been reconciled without treating omitted detail as nonexistent;
- raw Persian/Arabic/English content and ordering are preserved;
- every accepted candidate has a supported type and one defensible parent, except the approved root;
- concepts and sub-concepts were not split, merged, or synthesized;
- every star, note, joined paragraph, unclear level, and unclear owner is marked;
- relationship proposals are typed and separate from parentage;
- no names, paths, orders, or locators are used as canonical identity;
- no authoring action claims to resolve, review, or publish the Curriculum;
- the generated preflight and ambiguity reports are retained with the authoring review evidence.

## 12. Governance

Only an authorized Curriculum Editor/domain expert may prepare or amend an authoring document. An Import Operator may convert and import an independently reviewed document but cannot use tooling changes to resolve educational ambiguity. Issue resolution, review decision, and publication remain separate capability-protected actions.

Changing authoring content after review invalidates the authoring review and requires new checksums, preflight evidence, and review. Published content is never edited through this format; a published correction begins in a new draft/version and preserves the old snapshot.
