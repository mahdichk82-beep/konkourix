# AI-Assisted Knowledge Package Review Triage

## Boundary

AI-assisted educational review is advisory evidence. It may identify findings and propose correction actions, but it is not the qualified-human educational review required by the Knowledge Package lifecycle.

Reviewer provenance is a controlled value supplied by the evidence intake: `HUMAN` or `AI_ASSISTED`. It is never inferred from a reviewer display name. Only valid evidence explicitly classified `HUMAN` can affect the qualified-human review gate.

The real Physics 12 Motion package remains Revision 1, `DRAFT`, and `PENDING` for required human review. No human attestation, corrected Revision 2, payload change, Content verification, persistence, or publication is created by this workflow.

## Supplied AI evidence

The immutable supplied evidence is [PHYSICS12_MOTION_REVIEW_INPUT.completed.json](PHYSICS12_MOTION_REVIEW_INPUT.completed.json). Its controlled intake metadata is [PHYSICS12_MOTION_AI_REVIEW_INTAKE.json](PHYSICS12_MOTION_AI_REVIEW_INTAKE.json).

| Field | Value |
| --- | --- |
| Provenance | `AI_ASSISTED` |
| AI outcome | `CHANGES_REQUESTED` |
| AI review session | `review-session-e53fe0c7-aadb-4d00-80f1-6d67c688cc77` |
| Finding count | `9` |
| Source-file SHA-256 | `97ddcafefa3fd8f80be4e0cb693a7912b95895433140d586584f15de77b57390` |
| Canonical evidence SHA-256 | `0dd9a1fc01e6369e005c30ed03b17a96274934e0c7c2233e129ed8096182e8c1` |

Intake validation verifies the actual source bytes, parsed session content, package/revision/checksum identity, controlled targets, and finding structure. The AI outcome remains advisory and does not replace the real package's `PENDING` human-review state.

## Human triage

For every AI finding, a qualified human must make exactly one explicit decision:

- `CONFIRM`: retain the original AI severity and required action as a governed correction requirement;
- `REJECT`: retain the AI finding as historical evidence but exclude it from blocking the human outcome;
- `MODIFY`: preserve the original AI finding while supplying a human replacement action, optional controlled severity adjustment, and rationale.

Every decision binds the exact AI session, finding ID, package ID, revision ID, payload checksum, package checksum, and canonical AI-evidence checksum. Human rationale is mandatory. Triage never edits the original finding object.

The source-control-friendly blank input is [PHYSICS12_MOTION_AI_REVIEW_ATTESTATION.template.json](PHYSICS12_MOTION_AI_REVIEW_ATTESTATION.template.json). It contains no reviewer identity, timestamp, finding decision, dimension disposition, or final outcome.

## Final qualified-human outcome

A completed attestation requires a controlled `HUMAN` provenance, qualified-human identity, valid timestamps, an explicit disposition for all twelve mandatory review dimensions, complete triage of all nine findings, and a final `ACCEPTED` or `CHANGES_REQUESTED` outcome.

- A confirmed blocking finding prevents `ACCEPTED`.
- A modified finding blocks when its human-adjusted or inherited severity is `BLOCKING`.
- A rejected finding remains historical evidence and does not block.
- `ACCEPTED` cannot retain a `CHANGES_REQUIRED` dimension.
- `CHANGES_REQUESTED` requires at least one explicit confirmed, modified, or dimension-level correction requirement.

Only valid qualified-human evidence may affect educational-review readiness. It still does not transition the package lifecycle automatically. `REVIEWED`, `APPROVED`, Content verification, persistence, and publication remain separate governed actions.

## Attestation packet

The deterministic [human-attestation packet](PHYSICS12_MOTION_AI_REVIEW_ATTESTATION_PACKET.md) contains the exact Revision 1 identity, all twelve AI dimension decisions, all nine original AI findings, and blank human fields. It states explicitly that AI evidence does not satisfy qualified-human review.

No Revision 2 may be created from the AI `CHANGES_REQUESTED` outcome. A later correction revision requires valid qualified-human `CHANGES_REQUESTED` evidence under the existing revision workflow.
