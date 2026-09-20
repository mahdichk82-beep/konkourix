import {
  buildProductionKnowledgePackageCandidate,
  createProductionKnowledgeReadinessReport,
  validateProductionKnowledgePackageCandidate,
} from '../knowledge-expansion-package.js'
import { physics12MotionKnowledgeExpansionManifest } from './knowledge-expansion-packages.js'
import { theoreticalCurriculumFreezeManifest } from './theoretical-curriculum-freeze.js'
import { theoreticalCurriculumCatalog } from './theoretical-curriculum.js'

export const physics12MotionProductionPackageCandidate = buildProductionKnowledgePackageCandidate({
  packageId: 'pkg-bf55e8f2-2699-4ee2-8ccb-54420216069e',
  packageRevisionId: 'pkg-rev-0e3a9555-3268-4c1a-a283-b04b22f93f09',
  packageRevision: 1,
  sourcePilotManifest: physics12MotionKnowledgeExpansionManifest,
  structuralCatalogSha256: theoreticalCurriculumFreezeManifest.catalogSha256,
})

export const physics12MotionProductionPackageValidation = validateProductionKnowledgePackageCandidate({
  structuralRecords: theoreticalCurriculumCatalog,
  expectedStructuralCatalogSha256: theoreticalCurriculumFreezeManifest.catalogSha256,
  sourcePilotManifest: physics12MotionKnowledgeExpansionManifest,
  candidate: physics12MotionProductionPackageCandidate,
})

// Deterministic repository evidence only. This does not import, review, approve, or publish the package.
export const physics12MotionProductionReadinessReport = createProductionKnowledgeReadinessReport(
  physics12MotionProductionPackageValidation,
)
