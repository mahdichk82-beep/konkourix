import {
  auditCurriculumCatalog,
  createCurriculumFreezeManifest,
} from '../catalog-audit.js'
import {
  theoreticalCurriculumApplicability,
  theoreticalCurriculumCatalog,
  theoreticalCurriculumCatalogChecksum,
  theoreticalCurriculumReviewItems,
} from './theoretical-curriculum.js'

export const THEORETICAL_CURRICULUM_FREEZE_SNAPSHOT_ID =
  'konkourix-theoretical-structural-freeze-candidate-v1'

export const theoreticalCurriculumAuditReport = auditCurriculumCatalog({
  applicability: theoreticalCurriculumApplicability,
  records: theoreticalCurriculumCatalog,
  unresolvedReviewItems: theoreticalCurriculumReviewItems,
})

export const theoreticalCurriculumFreezeManifest = createCurriculumFreezeManifest({
  audit: theoreticalCurriculumAuditReport,
  catalogSha256: theoreticalCurriculumCatalogChecksum,
  curriculumVersionIdentifier: null,
  snapshotId: THEORETICAL_CURRICULUM_FREEZE_SNAPSHOT_ID,
  sourceArtifactSha256: null,
  transcriptionId: 'CANONICAL_CURRICULUM.md#complete-theoretical-structural-freeze-v1',
  transcriptionSha256: null,
})
