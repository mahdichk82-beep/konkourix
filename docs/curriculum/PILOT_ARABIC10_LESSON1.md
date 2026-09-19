# Cross-Domain Curriculum Knowledge Pilot: Arabic 10 — Lesson 1

## Status

This is an isolated, code-only `DRAFT` pilot for Grade 10 Arabic as applicable to the Human Sciences branch. It validates the Knowledge Taxonomy and Content Ingestion architecture with a language subject rather than a mathematical/scientific subject.

The pilot is `UNVERIFIED`, has not been imported into PostgreSQL, and is not published or student-facing.

## Pilot scope and canonical ownership

| Item | Canonical value |
| --- | --- |
| Applicable branch | Human Sciences |
| Grade | Grade 10 |
| Canonical subject | `عربی، زبان قرآن ۱` |
| Structural subject reference | `shared.g10.arabic` |
| Lesson | `درس ۱ ـ ذاکَ هُوَ الله` |
| Structural lesson reference | `shared.g10.arabic.lesson.186` |
| Human Sciences applicability target | `human.g10` |
| Registry state | `DRAFT` |
| Content source/status | `MANUAL_ENTRY` / `UNVERIFIED` |

Arabic remains owned once under the shared curriculum scope. The existing `APPLICABILITY` relationship connects it to Human Sciences Grade 10. The pilot does not create `human.g10.arabic`, duplicate the subject, or duplicate Lesson 1.

The provisional `curriculumVersionId` is the frozen catalog candidate snapshot identifier. It is not a database Curriculum Version UUID and must be rebound before persistence.

## Taxonomy design

The entire pilot is anchored to the existing structural Lesson 1 node.

| Kind | Count |
| --- | ---: |
| Topics | 3 |
| Subtopics | 5 |
| Concepts | 7 |
| Skills | 7 |
| Question Pattern classifications | 5 |
| Total | 27 |

Top-level Topics:

- `متن و ترجمه`
- `واژگان`
- `قواعد زبان عربی`

Subtopics cover reading comprehension, key vocabulary, demonstratives, pronouns, and verbs/conjugations. Concepts include contextual sentence meaning, word type, demonstratives, independent and attached pronouns, past tense, and verb form. Skills cover translation, word classification, pronoun recognition, verb analysis, and sentence analysis.

Question Pattern labels are limited to `ترجمه‌ای`, `واژگان`, `قواعدی`, `تشخیص ساختار`, and `ترکیبی`. They are classification metadata only; no Question, option, answer, scoring, or difficulty record exists.

## Content lifecycle

The pilot contains 12 short Persian Content Items:

| Kind | Count |
| --- | ---: |
| Definitions | 4 |
| Explanations | 3 |
| Examples | 4 |
| Notes | 1 |

Every item:

- uses `MANUAL_ENTRY`;
- has a stable opaque key and manual source reference;
- records the pilot creator and fixed timestamp;
- begins as `UNVERIFIED`;
- has no reviewer metadata until an actual review occurs.

The items are original pilot explanations and examples. They are not copied textbook passages and do not constitute a textbook import.

## Mapping strategy

Each Content Item has one non-owning mapping to:

1. the frozen candidate snapshot;
2. the existing structural Lesson 1 node;
3. one existing Arabic pilot Concept or Skill.

All 12 mappings resolve within `shared.g10.arabic`. The Human Sciences relationship remains applicability at the structural layer; mappings do not change subject ownership or add a second parent.

## Validation

Automated checks verify:

- exact subject, lesson, and Human Sciences applicability identities;
- absence of any Human-specific Arabic clone;
- complete taxonomy parent integrity;
- lesson, subject, and candidate-version isolation;
- manual provenance and `UNVERIFIED` lifecycle state;
- the 20-item content limit and allowed Content kinds;
- all mapping targets exist;
- no cross-subject ownership conflict;
- global key uniqueness across Arabic and Physics pilots;
- unchanged Physics pilot records;
- unchanged structural curriculum checksum.

## Lessons learned compared with the Physics pilot

- **Shared ownership matters.** Physics 12 is scope-owned by Mathematics & Physics; Arabic 10 is shared and reaches Human Sciences through applicability. The same taxonomy model supports both without cloning structural data.
- **The anchor depth can differ.** Physics taxonomy is anchored to a Chapter, while Arabic taxonomy is anchored to an explicit structural Lesson.
- **A language lesson benefits from multiple top-level Topics.** Text/translation, vocabulary, and grammar coexist, whereas the Physics pilot uses one chapter-wide Topic with several Subtopics.
- **The hierarchy remains stable across domains.** Concepts still own Skills, Skills still own Question Pattern classifications, and content mappings remain non-owning.
- **Manual content still requires review.** Linguistic examples and translations need qualified Arabic review just as formulas and examples in Physics need subject review.

## Explicit exclusions

This pilot adds no Question Bank, questions, answers, options, difficulty, analytics, scheduling, study planning, frontend, Prisma migration, database import, or publication. It does not authorize the rest of Arabic 1 or any other language lesson.
