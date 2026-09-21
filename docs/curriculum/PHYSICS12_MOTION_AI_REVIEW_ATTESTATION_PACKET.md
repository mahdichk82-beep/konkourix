# Physics 12 Motion — Human Attestation Packet for AI Review

> **AI-assisted review is advisory evidence and does not satisfy the required qualified-human educational review.**

> No human triage decision or final human outcome has occurred. All human decision fields below are intentionally blank.

## Exact package revision

- Package ID: `pkg-bf55e8f2-2699-4ee2-8ccb-54420216069e`
- Revision ID: `pkg-rev-0e3a9555-3268-4c1a-a283-b04b22f93f09`
- Revision: `1`
- Payload SHA-256: `ce20fc14fa67af9b2eedc5fbd23ccb9b5aa2d496b94f5670c7342c42b8db337a`
- Package SHA-256: `30d145724f684eb8d7b8e850e66bad87c5d04a613c9c4fd6924d7ea963e54341`
- Structural scope: `mathematics.g12.physics3.chapter.4278`
- Provisional Curriculum snapshot: `konkourix-theoretical-structural-freeze-candidate-v1`

## AI review evidence

- Reviewer provenance: `AI_ASSISTED`
- Review session ID: `review-session-e53fe0c7-aadb-4d00-80f1-6d67c688cc77`
- AI outcome: `CHANGES_REQUESTED`
- Source evidence SHA-256: `97ddcafefa3fd8f80be4e0cb693a7912b95895433140d586584f15de77b57390`
- Canonical review-evidence SHA-256: `0dd9a1fc01e6369e005c30ed03b17a96274934e0c7c2233e129ed8096182e8c1`
- Finding count: `9`

## Mandatory review dimensions

| Dimension | Label | AI disposition | AI note | Human disposition | Human note |
| --- | --- | --- | --- | --- | --- |
| `TERMINOLOGY` | Terminology | `CHANGES_REQUIRED` | Most motion terminology is scientifically appropriate, but the instantaneous-velocity Question Pattern says velocity can be extracted from 'position' itself. A single position is not a sufficient source; the label must identify a position-time relation/function or the tangent slope of a position-time graph. |  |  |
| `TAXONOMY_HIERARCHY` | Taxonomy hierarchy | `ACCEPTED_AS_IS` | The Topic -> Subtopic -> Concept -> Skill -> Question Pattern parentage is educationally coherent for one-dimensional motion. All 12 mappings point to an appropriate Concept or Skill within the stated chapter scope. |  |  |
| `FORMULA_CORRECTNESS` | Formula correctness | `ACCEPTED_AS_IS` | Every represented relation is correct: Δx = x_f − x_i, v_avg = Δx / Δt, a_avg = Δv / Δt, slope of x-t gives velocity, slope of v-t gives acceleration, and signed area under v-t gives displacement. The example computations (7 − 2 = 5, (10 − 4)/3 = 2, v = at = 6, and Δx = at²/2 = 9) are numerically correct under the stated-or-implied positive-axis assumptions. |  |  |
| `SIGN_CONVENTIONS` | Sign conventions | `CHANGES_REQUIRED` | The definitions correctly distinguish signed displacement and signed graph area, but the acceleration examples use unsigned-looking velocity/acceleration values without declaring an axis or direction. The results are only determinate as signed velocity and displacement when those assumptions are explicit. |  |  |
| `UNITS` | Units | `ACCEPTED_AS_IS` | All stated units are dimensionally correct: metre for position/displacement, metre per second for velocity, second for time, and metre per second squared for acceleration. |  |  |
| `EXAMPLE_WORDING` | Example wording | `CHANGES_REQUIRED` | The arithmetic is usable, but the positive displacement notation '۵+ متر' is directionally and typographically fragile in right-to-left text, and the constant-acceleration example does not state the motion axis/direction needed for its signed conclusions. |  |  |
| `PERSIAN_LANGUAGE_QUALITY` | Persian language quality | `CHANGES_REQUIRED` | The Persian is generally clear and grade-appropriate. Two definitions omit 'با' in the construction 'برابر با نسبت ...', and the positive-number wording should be made robust for right-to-left reading. |  |  |
| `TAXONOMY_GRANULARITY` | Taxonomy granularity | `ACCEPTED_AS_IS` | The eight Concepts are appropriately sized for this pilot. Pairing distance with displacement, average speed with average velocity, and average with instantaneous acceleration supports direct comparison and is not excessively broad for the reviewed chapter. |  |  |
| `SKILL_WORDING` | Skill wording | `CHANGES_REQUIRED` | The Skill records generally express observable student capabilities. The instantaneous-velocity Skill uses the vague word 'relation' without naming position as a function of time, and the acceleration Skill omits the time interval/rate-of-change requirement. |  |  |
| `QUESTION_PATTERN_BOUNDARIES` | Question Pattern classification boundaries | `CHANGES_REQUIRED` | All eight records remain classification labels and contain no actual stem, answer, scoring, or difficulty metadata. However, 'average quantity in a time interval' is broader than its parent Skill and does not distinguish average speed from average velocity, so it is not a reliable classification boundary. |  |  |
| `CONTENT_CORRECTNESS` | Content correctness | `CHANGES_REQUIRED` | All 12 Content Items were reviewed individually. content-97490dd8-868b-4d5a-a664-d67869bee06a is scientifically correct; content-87c60818-99ee-44f9-9acd-79c1774e315b has the correct displacement definition and formula; content-310f953c-4922-4299-b1d4-07057ebc0a63 correctly distinguishes distance and displacement; content-309b3e7e-2781-455d-aa71-4f921b7cb892 has the correct +5 m result but requires clearer positive-direction wording; content-0bbd42bf-c2d7-4788-b695-81c2fc16917d has the correct average-velocity relation but a Persian grammatical omission; content-e54cf98a-95f0-4b44-aed9-09f3442c5aa8 correctly describes instantaneous velocity; content-3ccbe558-ddcc-4851-af0d-7e6e77594949 has the correct average-acceleration relation but the same grammatical omission; content-766116e9-6139-4f96-9cc3-115da6545be8 has the correct numerical result only after signed velocities/direction are made explicit; content-f65003d4-1d76-4df5-acc0-d2badd976eaa correctly relates x-t slope to velocity; content-d0dd1d39-0cf3-429d-bec1-5d1219335740 correctly relates v-t slope and signed area to acceleration and displacement; content-7e913551-b590-4047-a6ff-a62f2b6561b2 correctly characterizes constant acceleration; content-4fbdf016-9fdf-49f2-b3a2-e1b428de9bf4 has correct magnitudes but must declare direction/sign before asserting signed velocity and displacement. Because the exact revision contains these unresolved ambiguities, the dimension requires changes. |  |  |
| `PROVENANCE_APPROPRIATENESS` | Source and provenance appropriateness | `ACCEPTED_AS_IS` | The taxonomy and Content Items are accurately presented as KonkourX manual pilot material through manual source names/URIs, a pilot creator identity, and UNVERIFIED status. No textbook, ministry, external publisher, reviewed-content, or authoritative-source claim is made. This package review does not change Content verification. |  |  |

## AI findings and blank human triage

| Finding ID | Dimension | Severity | Target | AI note | AI required action | Human CONFIRM / REJECT / MODIFY | Human severity | Human replacement action | Human rationale |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `review-finding-4e4d396f-9ba8-40a2-b1c4-ac3c434f4fd8` | `TERMINOLOGY` | `BLOCKING` | `TAXONOMY_NODE:tax-e343abef-ad99-44e7-8d98-70b810ffafd7` | The label 'الگوی استخراج سرعت لحظه‌ای از مکان یا نمودار' implies that instantaneous velocity can be obtained from a position value. Position alone does not determine velocity; a position-time function/relation or the local slope of its graph is required. This can teach an incorrect dependency. | Revise this existing Question Pattern label so it explicitly refers to deriving instantaneous velocity from the position-time function/relation or from the tangent slope of a position-time graph; do not imply derivation from position alone. |  |  |  |  |
| `review-finding-ad7ce17e-0ce7-45ec-8170-16338615e7c5` | `SIGN_CONVENTIONS` | `BLOCKING` | `CONTENT_ITEM:content-766116e9-6139-4f96-9cc3-115da6545be8` | The average-acceleration example calls 4 m/s and 10 m/s velocities but gives neither a positive direction nor explicit plus signs. Its +2 m/s² result is a signed result only if both velocities are along the selected positive axis. Without that convention, direction-sensitive interpretation is ambiguous. | State the selected positive direction and write the initial and final velocities as signed quantities (for example +4 m/s and +10 m/s), then state the signed average acceleration; alternatively rewrite consistently in terms of speed and acceleration magnitude if direction is intentionally excluded. |  |  |  |  |
| `review-finding-d543f993-a1a1-4874-b752-8a28718c5da9` | `EXAMPLE_WORDING` | `ADVISORY` | `CONTENT_ITEM:content-309b3e7e-2781-455d-aa71-4f921b7cb892` | The computation is correct, but '۵+ متر' is fragile and potentially confusing in bidirectional Persian text. A learner should not need to infer whether the plus sign is a prefix or punctuation. | Express the result unambiguously as 5 metres in the positive direction of the axis, using robust right-to-left mathematical formatting or explicit Persian directional wording. |  |  |  |  |
| `review-finding-6cbdfedf-bf2d-434b-893b-8309b344975c` | `PERSIAN_LANGUAGE_QUALITY` | `ADVISORY` | `CONTENT_ITEM:content-0bbd42bf-c2d7-4788-b695-81c2fc16917d` | The sentence 'سرعت متوسط برابر نسبت ... است' omits the preposition 'با'. The omission is grammatically defective and reduces the polish of a definition intended for instruction. | Correct the construction to 'سرعت متوسط برابر با نسبت جابه‌جایی به بازهٔ زمانی است' while retaining the existing correct formula. |  |  |  |  |
| `review-finding-f86dab08-320b-4ef9-970c-27d57433d891` | `PERSIAN_LANGUAGE_QUALITY` | `ADVISORY` | `CONTENT_ITEM:content-3ccbe558-ddcc-4851-af0d-7e6e77594949` | The sentence 'شتاب متوسط برابر نسبت ... است' likewise omits 'با'. This is a grammatical defect in a core definition. | Correct the construction to 'شتاب متوسط برابر با نسبت تغییر سرعت به بازهٔ زمانی است' while retaining the existing correct formula. |  |  |  |  |
| `review-finding-6ec81e97-a5ca-48a5-ad67-070e84cd05f8` | `SKILL_WORDING` | `BLOCKING` | `TAXONOMY_NODE:tax-a48e4abd-9aeb-44f0-b32d-0142e6b1145d` | The Skill 'محاسبهٔ شتاب از تغییر سرعت' omits the time interval or rate-of-change condition. Change in velocity by itself is not acceleration, so the capability wording risks reinforcing a dimensional and conceptual misconception. | Revise the Skill wording to require calculating average acceleration from change in velocity over a time interval and, if instantaneous acceleration is intended, state the instantaneous rate/graphical interpretation explicitly. |  |  |  |  |
| `review-finding-6366dd69-17c2-4b5b-b930-a351a1352f24` | `SKILL_WORDING` | `ADVISORY` | `TAXONOMY_NODE:tax-a36874bb-817c-4b19-ba2f-abee17b8595f` | The phrase 'از رابطه یا نمودار مکان ـ زمان' leaves 'رابطه' without an object and is less precise than a student-capability statement should be. | Clarify that the learner determines instantaneous velocity from a position-time relation/function or from the tangent slope of the position-time graph. |  |  |  |  |
| `review-finding-32010e56-9c3e-4c9c-b101-1ed3a542c5b4` | `QUESTION_PATTERN_BOUNDARIES` | `BLOCKING` | `TAXONOMY_NODE:tax-8d3a2ca8-1c0c-440b-916c-4ea7da0e0af1` | The label 'الگوی محاسبهٔ کمیت متوسط در بازهٔ زمانی' is broader than its parent Skill for average speed and average velocity. It could also classify average acceleration or any unrelated average quantity, so it does not form a useful or stable question-pattern boundary. | Narrow the existing label to the classification of average speed and/or average velocity over a time interval, explicitly preserving the distance-versus-displacement distinction. |  |  |  |  |
| `review-finding-b89fce67-16f8-4349-a2a7-30ae487f7c18` | `CONTENT_CORRECTNESS` | `BLOCKING` | `CONTENT_ITEM:content-4fbdf016-9fdf-49f2-b3a2-e1b428de9bf4` | The magnitudes 6 m/s and 9 m are correct for motion from rest with acceleration magnitude 2 m/s² for 3 s. As written, however, the item calls them velocity and displacement without defining the acceleration direction or a positive axis; those vector quantities could instead be negative in the selected coordinate system. | Declare a positive axis and acceleration +2 m/s² (or state motion in the positive direction), then give signed velocity +6 m/s and displacement +9 m; alternatively describe only speed and distance/magnitudes with wording consistent with scalar quantities. |  |  |  |  |

## Blank human final outcome

- Qualified human reviewer: ____________________
- Started at: ____________________
- Reviewed at: ____________________
- Final outcome (`ACCEPTED` or `CHANGES_REQUESTED`): ____________________
- Human attestation ID: ____________________

A rejected AI finding remains immutable historical evidence but does not block the human outcome. A confirmed blocking finding prevents `ACCEPTED`. A modified finding preserves the AI original while the human replacement severity, action, and rationale become the governed correction requirement.

> This packet does not create Revision 2, change package lifecycle, verify Content Items, authorize persistence, or publish Curriculum.
