# Curriculum Knowledge Pilot: Physics 12 — Motion in One Dimension

## Status

This is an isolated, code-only pilot for `فیزیک ۳` in the Mathematics & Physics branch, anchored to the source-bound structural chapter `فصل ۱ ـ حرکت بر خط راست`.

The pilot validates the complete in-memory pipeline:

```text
Structural Curriculum Chapter
└── Topic
    └── Subtopic
        └── Concept
            └── Skill
                └── Question Pattern
                    └── Content Mapping
```

It has not been imported into PostgreSQL, assigned a database Curriculum Version, reviewed, approved, or published. Its provisional `curriculumVersionId` is the frozen catalog candidate snapshot identifier, not a database UUID.

## Exact scope

| Item | Value |
| --- | --- |
| Branch | Mathematics & Physics |
| Subject | `فیزیک ۳` |
| Structural subject reference | `mathematics.g12.physics3` |
| Chapter | `فصل ۱ ـ حرکت بر خط راست` |
| Structural chapter reference | `mathematics.g12.physics3.chapter.4278` |
| Registry status | `DRAFT` |
| Content source | `MANUAL_ENTRY` |
| Content verification | `UNVERIFIED` |

No other subject or chapter receives taxonomy or content records.

## Pilot inventory

### Taxonomy

| Kind | Count |
| --- | ---: |
| Topic | 1 |
| Subtopic | 5 |
| Concept | 8 |
| Skill | 8 |
| Question Pattern | 8 |
| Total | 30 |

The pilot covers position/reference frame, distance and displacement, average and instantaneous velocity, acceleration, position–time and velocity–time graphs, and constant-acceleration equations.

Question Patterns are classification labels only. They contain no question stems, options, answers, scoring, or Question Bank records.

### Content

The pilot contains 12 short Persian Content Items:

- five Definitions;
- four Explanations;
- three Examples.

Every item is an original `MANUAL_ENTRY`, records the pilot author identifier and fixed creation timestamp, and remains `UNVERIFIED` with no reviewer metadata. The pilot stays below the 20-item limit and contains no Exercise content.

### Mappings

Each of the 12 Content Items has one mapping that pins:

- the frozen candidate snapshot identifier;
- the exact structural Motion chapter;
- one existing pilot Concept or Skill taxonomy node.

Mappings are non-owning. They do not change the structural tree or taxonomy hierarchy.

## Validation

Automated validation verifies:

- the exact subject and chapter exist in the frozen structural catalog;
- every pilot taxonomy node is anchored to that chapter and subject;
- the complete Topic → Subtopic → Concept → Skill → Question Pattern hierarchy is valid;
- every Concept has a Topic or Subtopic ancestor;
- every Content Item uses an allowed kind and complete manual provenance;
- every mapping resolves to existing content, structural, and taxonomy identities;
- no mapping crosses subjects or Curriculum Versions;
- registry, node, content, and mapping keys are unique;
- the structural catalog checksum remains unchanged;
- no unrelated subject receives taxonomy or content data.

## Review and future disposition

This pilot is deliberately not approved educational content. Before any database import or student-facing use:

1. A qualified Physics curriculum reviewer must verify terminology, hierarchy, formulas, signs, units, and example wording.
2. Review findings must produce explicit revisions rather than silently editing an approved artifact.
3. The frozen structural candidate must be imported and receive a real Curriculum Version ID.
4. The pilot must be rebound to exact database `(curriculum_version_id, curriculum_node_id)` identities.
5. Taxonomy and content authorization, persistence, API, and publication architecture must be approved separately.

The pilot does not authorize broader Physics ingestion, question authoring, analytics, scheduling, recommendations, or frontend work.
