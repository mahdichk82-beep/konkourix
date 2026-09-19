# Konkourix Curriculum Import and Maintenance Rules

## Purpose

These rules govern how canonical curriculum data is imported, published, referenced, and changed in Konkourix. They are storage-technology neutral and do not assume a current database structure.

## Domain authority and access

Curriculum is a controlled domain entity, not user-authored content.

- Students and counselors are read-only consumers of published curriculum versions.
- Only explicitly authorized curriculum-admin roles may create, edit, classify, version, publish, deprecate, merge, move, or delete curriculum data.
- “Super admin” access mentioned in the source must still be enforced as an explicit authorized role; possession of a general account is insufficient.
- Imports run as an authorized administrative operation and produce an auditable report. An import must never publish itself implicitly.
- Draft review and publication are separate actions. Prefer two-person approval for publication when organizational policy permits.
- Every administrative change records actor, time, reason, source/provenance, old value, new value, and target curriculum version.

## Version model

A curriculum release is an immutable, publishable snapshot of the complete owning tree and its relationships.

- All edits occur in a draft derived from a published version or created as a new initial draft.
- Publishing assigns a unique immutable `curriculum_version_id` and freezes that snapshot.
- Any change to content, order, parentage, status, or relationship after publication requires a new version.
- Historical student progress remains linked to the old curriculum version and node. It is never repointed automatically to the newest release.
- Future versions may add mappings to earlier versions, but those mappings do not rewrite historical facts.
- Existing versions remain resolvable even when every node they contain is deprecated in later versions.
- Version labels are metadata, not identity. Effective dates, edition labels, and publication status must not be encoded into Node IDs.

Recommended lifecycle: `draft` → `in_review` → `published` → `superseded`. A published or superseded release is immutable. Withdrawal, if required for an operational mistake, changes availability metadata without deleting the snapshot.

## Import contract

### Accepted source and scope

`cori.docx` is the canonical educational source for the initial architecture. `CANONICAL_CURRICULUM.md` is its reviewed structural transcription and interpretation boundary. Imports must identify the exact source artifact, checksum, import time, importer, and target draft version.

The import must process the whole source, not just recognized subjects. It must emit counts and diagnostics for accepted, unchanged, ambiguous, rejected, and deprecated records.

### Validation before acceptance

For every candidate node, validate:

- a supported node type;
- an exact source display name;
- one canonical parent for the target version, except the root;
- sibling order;
- a stable Node ID match or an explicit new-node decision;
- source provenance;
- absence of a parent cycle;
- uniqueness of Node ID globally and uniqueness of `(version, node_id)` in a snapshot;
- parent/child type compatibility, while allowing explicitly source-omitted intermediate levels;
- administrative disposition of any ambiguity.

Do not use normalized names alone to match existing nodes. A proposed match should use the stable import registry and may use provenance, prior parent, neighboring nodes, and an administrator-approved reconciliation. Similar labels are candidates for review, not proof of identity.

### Exactness and normalization

- Preserve source labels exactly in `display_name`.
- Normalize Unicode to NFC for consistent storage, while retaining the original imported text/provenance for audit.
- Store search normalization separately.
- Preserve source ordering.
- Do not autocorrect spelling, Persian/Arabic characters, punctuation, diacritics, stars, or joined source paragraphs.
- Do not invent missing subjects, chapters, topics, concepts, sub-concepts, parents, or intermediate placeholder nodes.
- Quarantine ambiguous material and block publication when ambiguity affects ownership or identity.

### Idempotency

Re-importing the same source into the same draft must create no duplicate nodes and no new IDs. Reconciliation uses an import registry from approved source records to stable Node IDs. Source paragraph number or path may be recorded as a locator but must not be the identity key because source reformatting can change it.

## Immutable identifier strategy

Use opaque UUIDv7-based IDs generated once at first acceptance, with the prefixes defined in `CANONICAL_CURRICULUM.md`. IDs are never generated from titles or paths.

Every durable reference contains both:

1. `curriculum_version_id`, selecting the immutable published snapshot; and
2. `curriculum_node_id`, selecting the logical node within that snapshot.

If internal storage uses node-revision IDs, expose and retain the stable logical Node ID as well. A path is a query result, not a foreign key. Renaming or moving a node must not break a reference.

## Node operation rules

### Creating nodes

- Create only in a draft version and only from an authorized source or approved administrative decision.
- Require type, exact display name, canonical parent, sibling order, provenance, and change reason.
- Allocate a new immutable Node ID; never recycle a deleted or deprecated ID.
- Reject accidental duplicates after contextual review. Same-name nodes under different contexts may be valid.
- Do not publish a node whose parent assignment is unresolved.

### Updating nodes

- Update only a draft. A change to a published node is represented in a new version.
- Retain the Node ID for spelling corrections, metadata corrections, ordering changes, and clarifications that preserve educational identity.
- Create a new node when the learning meaning or identity changes materially, and link it to the prior node with explicit lineage.
- Record before/after values and the reason.

### Moving nodes

- A move changes the version-scoped parent edge and is allowed only in a draft.
- Retain the Node ID only when the educational identity is unchanged.
- If the move changes meaning, scope, grade, or subject identity, create a replacement Node ID and lineage instead.
- Validate type compatibility and cycles.
- Never rewrite the parentage in a published historical version.

### Deprecating nodes

- Deprecation is the normal removal mechanism for published content.
- Mark the node deprecated in a new version, with reason, effective version, and optional replacement Node ID(s).
- Keep the old node readable in all versions where it was published.
- Prevent new authoring against deprecated nodes by default, while allowing historical reads.

### Merging nodes

- Never collapse historical records or repoint their references.
- When two or more educational identities become one, create a new Node ID for the merged node in the new version.
- Deprecate the source nodes in that version and record `merged_into` / `supersedes` lineage.
- If review proves that records were duplicates of one identity rather than a genuine curricular merge, select one survivor only through an audited reconciliation; retain aliases and the full decision trail.

### Deleting nodes

- Never hard-delete a node that has appeared in a published version or is referenced by any domain record.
- A published node is removed from future use by deprecation, not deletion.
- Hard deletion is permitted only for an unpublished draft node with no references, audit dependencies, descendants, or published history, and requires an authorized reason.
- IDs from deleted drafts remain tombstoned and must not be reused.

## References from application domains

All domain objects reference the most specific curriculum node justified by their content and always pin the published curriculum version. They may additionally reference ancestors for convenience, but ancestor values are derived and must not be treated as independent truth.

| Domain object | Required curriculum reference behavior |
|---|---|
| Tasks | Pin `(curriculum_version_id, curriculum_node_id)`. A task may target a subject, chapter, topic, concept, or sub-concept. Multiple targets use explicit associations; designate a primary target when needed. |
| Questions | Pin the version and at least one most-specific assessable node. Additional classification nodes are explicit many-to-many associations. Question content revisions do not mutate curriculum nodes. |
| Study Plans | Pin the curriculum version used to construct the plan. Each planned item pins its target node. A plan is not silently upgraded when a new curriculum is published. |
| Assessments | Pin one curriculum version for the assessment blueprint and pin node targets for sections/items. Cross-version assessments require an explicit mapping and must not mix versions accidentally. |
| Progress Tracking | Record progress against the exact version and node that generated the learning event. Progress is append-only historical evidence; later curriculum changes do not rewrite it. Rollups to ancestors use the historical version’s tree. |

Names, slugs, positions, and materialized paths may be cached for display or search, but they are not authoritative references. Cache invalidation must not affect historical resolution.

## Cross-version mappings

Mappings are explicit, directional, versioned records with an authorized decision and confidence/status. Supported semantics should be limited to clear cases such as `same_as`, `renamed_to`, `moved_to`, `split_into`, `merged_into`, and `replaced_by`.

- A mapping never changes either endpoint.
- One-to-many and many-to-one mappings are allowed.
- Do not infer equivalence from identical names.
- Automated progress transfer is prohibited unless a separately approved policy defines how evidence is apportioned; by default, expose old progress alongside the mapping.
- Mappings must not allow a deleted/deprecated node’s ID to be reused.

## Migration principles

1. Inventory all existing curriculum-like records and all inbound references before changing data.
2. Preserve original values and provenance in a recoverable snapshot.
3. Create the initial version and stable IDs without relying on names as permanent keys.
4. Build a reviewed mapping from existing records to `(curriculum_version_id, curriculum_node_id)`.
5. Quarantine unmatched or ambiguous records; do not guess.
6. Backfill references in resumable, idempotent batches and record reconciliation results.
7. Validate referential integrity, hierarchy integrity, counts, sample paths, source order, and historical reads before cutover.
8. Use dual-read or compatibility resolution during transition if the current application requires it; do not remove legacy resolution until verification is complete.
9. Cut over new writes only after all writers pin a curriculum version and node.
10. Retain rollback capability and the original mapping. A rollback must restore references without losing events created during migration.
11. After cutover, prohibit unversioned curriculum writes and monitor for orphaned or latest-version-only references.
12. Never rewrite historical student progress merely to make it fit the new canonical tree.

## Publication gates

A draft may be published only when:

- the import report and source checksum are retained;
- every accepted node has a stable ID, parent or root status, order, and provenance;
- there are no cycles, orphaned nodes, duplicate IDs, or invalid references;
- all blocking ambiguities are resolved or explicitly excluded with an authorized decision;
- cross-version lineage is complete for moves, replacements, splits, and merges;
- historical versions and their domain references still resolve;
- an authorized reviewer approves the release.

## Current source-specific blockers

Before the detailed source can be imported strictly, authorized curriculum owners must resolve the ambiguity list in `CANONICAL_CURRICULUM.md`, especially the missing biology subject boundaries, the status of thematic curricula, the joined Arabic paragraph, the ownership of shared chemistry and bridging-skills material, and the meaning of `⭐`. These are data-governance decisions, not importer heuristics.
