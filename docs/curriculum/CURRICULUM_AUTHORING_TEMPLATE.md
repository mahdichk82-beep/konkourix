# Konkourix Curriculum Authoring Template

> Copy this worksheet for one reviewed authoring set. Read [CURRICULUM_AUTHORING_GUIDE.md](CURRICULUM_AUTHORING_GUIDE.md) before editing. Replace every placeholder; never treat placeholder text as curriculum content.

## Authoring document

```yaml
format_version: "konkourix-curriculum-authoring/v1"

# Opaque authoring identity. Do not derive it from a title, path, or source order.
document_key: "<opaque-authoring-document-key>"

# DRAFT | READY_FOR_AUTHORING_REVIEW | AUTHORING_REVIEWED
status: "DRAFT"

# PARTIAL until a documented whole-source reconciliation is complete.
# Setting COMPLETE does not resolve ambiguities or authorize publication.
coverage_status: "PARTIAL"

source:
  artifact_name: "cori.docx"
  artifact_sha256: null
  transcription_id: "<reviewed-transcription-identifier>"
  transcription_sha256: null

target:
  # Use 0 only for a newly created draft. Otherwise use the server-provided revision.
  expected_draft_revision: 0
  idempotency_key: "<stable-key-for-this-exact-import-intent>"

records: []

# These are proposals only. Manifest v1 does not create them automatically.
relationship_proposals: []

authoring_review:
  prepared_by: "<authorized-editor-identity>"
  prepared_at: "<ISO-8601 timestamp>"
  preparation_reason: "<auditable reason>"
  reviewed_by: null
  reviewed_at: null
  review_outcome: null
  review_notes: []
  source_reconciliation_reference: null

# Append superseded authoring-review records here; never rewrite them silently.
review_history: []
```

## Copyable source-record patterns

Copy the applicable block into `records`. Keep records in strictly increasing `source_order`. Assign every `source_record_key` once and retain it across revisions.

### A. Reviewed node candidate

Use only when the label, type, and single canonical parent are supported by the source or an authorized decision.

```yaml
- source_record_key: "src-<opaque-assigned-key>"
  record_kind: "NODE_CANDIDATE"
  raw_text: |-
    <verbatim source text>
  display_label: "<exact NFC display label>"
  source_locator: "<recoverable artifact/transcription locator>"
  source_order: <unique-zero-based-integer>
  proposed_node_type: "<CURRICULUM_ROOT|FIELD|GRADE|SUBJECT|CHAPTER|TOPIC|CONCEPT|SUBCONCEPT>"
  parent_source_record_key: "src-<earlier-reviewed-parent-key>"
  ambiguity_markers: []
  structural_hints: {}
  editor_notes: []
```

For the one authorized `CURRICULUM_ROOT`, use `parent_source_record_key: null`. Do not create or name that root until the missing root/version metadata has an authorized decision.

### B. Concept

Use only for an explicit source item reviewed as a concept. The parent may be a topic, or a higher source level only when the source explicitly omitted the intermediate level and the parent was reviewed.

```yaml
- source_record_key: "src-<opaque-concept-key>"
  record_kind: "NODE_CANDIDATE"
  raw_text: |-
    <verbatim concept text>
  display_label: "<exact concept label>"
  source_locator: "<exact locator>"
  source_order: <unique-zero-based-integer>
  proposed_node_type: "CONCEPT"
  parent_source_record_key: "src-<reviewed-parent-key>"
  ambiguity_markers: []
  structural_hints:
    omitted_intermediate_level_review_reference: null
  editor_notes: []
```

### C. Sub-concept

Use only for an explicit child below a concept or another explicit sub-concept.

```yaml
- source_record_key: "src-<opaque-subconcept-key>"
  record_kind: "NODE_CANDIDATE"
  raw_text: |-
    <verbatim sub-concept text>
  display_label: "<exact sub-concept label>"
  source_locator: "<exact locator>"
  source_order: <unique-zero-based-integer>
  proposed_node_type: "SUBCONCEPT"
  parent_source_record_key: "src-<concept-or-subconcept-parent-key>"
  ambiguity_markers: []
  structural_hints: {}
  editor_notes: []
```

### D. Ambiguous type or parent

Do not select the most likely type or parent. Candidate evidence may be listed only as a non-authoritative hint.

```yaml
- source_record_key: "src-<opaque-ambiguous-key>"
  record_kind: "AMBIGUOUS_SOURCE"
  raw_text: |-
    <verbatim unresolved source text>
  display_label: "<same unresolved source label>"
  source_locator: "<exact locator>"
  source_order: <unique-zero-based-integer>
  proposed_node_type: null
  parent_source_record_key: null
  ambiguity_markers:
    - "<documented-ambiguity-code>"
  structural_hints:
    candidate_type_codes: []
    candidate_parent_keys: []
    evidence_references: []
  editor_notes:
    - "<what requires an authorized decision>"
```

### E. Source label containing `⭐`

Keep the star in both exact fields. Do not translate it into priority or weight.

```yaml
- source_record_key: "src-<opaque-starred-record-key>"
  record_kind: "AMBIGUOUS_SOURCE"
  raw_text: |-
    <verbatim source text including ⭐ in its original position>
  display_label: "<exact label including ⭐>"
  source_locator: "<exact locator>"
  source_order: <unique-zero-based-integer>
  proposed_node_type: null
  parent_source_record_key: null
  ambiguity_markers:
    - "STAR_MARKER_UNRESOLVED"
    - "<additional ownership/type marker when applicable>"
  structural_hints: {}
  editor_notes:
    - "The star is preserved without interpretation."
```

### F. Joined or malformed source paragraph

Preserve the paragraph as one record. Do not split it in the authoring worksheet.

```yaml
- source_record_key: "src-<opaque-joined-record-key>"
  record_kind: "AMBIGUOUS_SOURCE"
  raw_text: |-
    <entire joined paragraph exactly as transcribed>
  display_label: "<entire joined label unless a reviewed label is authorized>"
  source_locator: "<exact locator>"
  source_order: <unique-zero-based-integer>
  proposed_node_type: null
  parent_source_record_key: null
  ambiguity_markers:
    - "ARABIC_JOINED_PARAGRAPH"
    - "STRUCTURAL_LEVEL_UNRESOLVED"
  structural_hints: {}
  editor_notes:
    - "No automatic split is permitted."
```

### G. Source note or prose relationship statement

Preserve the evidence without turning it into a node or relationship.

```yaml
- source_record_key: "src-<opaque-source-note-key>"
  record_kind: "SOURCE_NOTE"
  raw_text: |-
    <verbatim source note or prose statement>
  display_label: "<same exact text>"
  source_locator: "<exact locator>"
  source_order: <unique-zero-based-integer>
  proposed_node_type: null
  parent_source_record_key: null
  ambiguity_markers:
    - "SOURCE_NOTE_NOT_EDUCATIONAL_NODE"
    - "<specific documented issue code when applicable>"
  structural_hints: {}
  editor_notes:
    - "Requires an authorized classification decision."
```

## Copyable relationship proposal

Use this only when source evidence or an authorized decision proposes a non-owning relationship. Do not use it to supply a second parent.

```yaml
- proposal_key: "rel-<opaque-assigned-key>"
  type: "<PREREQUISITE|APPLICABILITY|EQUIVALENCE|PREDECESSOR|SUCCESSOR|SPLIT|MERGE|REPLACEMENT>"
  source_record_key: "src-<source-key>"
  target_record_keys:
    - "src-<target-key>"
  source_evidence: "<exact source locator or authorized decision reference>"
  rationale: "<review rationale>"
  ambiguity_markers: []
```

Multiple targets remain separate list entries. Relationship proposals are retained in the conversion report and require the separate capability-protected relationship workflow after node identities exist.

## Authoring review record

Complete this only after source reconciliation and expert review. Authoring review is not Curriculum review or publication approval.

```yaml
authoring_review:
  prepared_by: "<authorized-editor-identity>"
  prepared_at: "<ISO-8601 timestamp>"
  preparation_reason: "<auditable reason>"
  reviewed_by: "<independent-authoring-reviewer-identity>"
  reviewed_at: "<ISO-8601 timestamp>"
  review_outcome: "<ACCEPTED_FOR_MANIFEST|CHANGES_REQUIRED|REJECTED>"
  review_notes:
    - "<finding or decision>"
  source_reconciliation_reference: "<whole-source reconciliation/report reference>"
```

If any record changes after this review, append the completed `authoring_review` object to `review_history`, return `status` to `DRAFT`, initialize a new current review object, and generate new checksums and reports. Never rewrite prior review evidence silently.

## Pre-conversion checklist

- [ ] No placeholder remains.
- [ ] `cori.docx` and transcription checksums were calculated from the reviewed files.
- [ ] Whole-source coverage was reconciled before setting `coverage_status: COMPLETE`.
- [ ] Source keys and source orders are unique and stable.
- [ ] Records are in increasing source order.
- [ ] Exact Persian/Arabic/English text, punctuation, digits, half-spaces, diacritics, and joined text are preserved.
- [ ] Every accepted non-root candidate has one earlier reviewed parent.
- [ ] No missing hierarchy level was synthesized.
- [ ] Concepts and sub-concepts exist explicitly in the source.
- [ ] Every `⭐` has `STAR_MARKER_UNRESOLVED` and remains visible.
- [ ] Every unresolved type, parent, ownership, joined record, and source note is quarantined.
- [ ] No relationship proposal is represented as another parent.
- [ ] No canonical Node ID was derived or assigned manually.
- [ ] Authoring review evidence is complete.
- [ ] Conversion/preflight and ambiguity reports will be retained.
- [ ] No publication action is included or implied.
