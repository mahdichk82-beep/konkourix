import {
  KNOWLEDGE_EXPANSION_MANIFEST_SCHEMA_VERSION,
  type KnowledgeExpansionManifest,
} from '../knowledge-expansion-package.js'
import {
  ARABIC10_LESSON1_PILOT,
  arabic10Lesson1ContentItems,
  arabic10Lesson1ContentMappings,
  arabic10Lesson1TaxonomyNodes,
} from './pilot-arabic10-lesson1.js'
import {
  PHYSICS12_MOTION_PILOT,
  physics12MotionContentItems,
  physics12MotionContentMappings,
  physics12MotionTaxonomyNodes,
} from './pilot-physics12-motion.js'

const pendingReview = {
  reviewer: null,
  reviewedAt: null,
  reviewStatus: 'PENDING',
} as const

export const physics12MotionKnowledgeExpansionManifest: KnowledgeExpansionManifest = {
  manifestSchemaVersion: KNOWLEDGE_EXPANSION_MANIFEST_SCHEMA_VERSION,
  package: {
    packageId: 'pkg-74e3634f-15c1-45f5-b813-0f8704650e99',
    packageKind: 'PILOT',
    subject: PHYSICS12_MOTION_PILOT.subjectId,
    structuralScope: PHYSICS12_MOTION_PILOT.chapterId,
    curriculumVersionId: PHYSICS12_MOTION_PILOT.curriculumVersionId,
    sourceType: 'MANUAL_ENTRY',
    status: 'DRAFT',
    review: pendingReview,
  },
  structuralAnchor: {
    subjectId: PHYSICS12_MOTION_PILOT.subjectId,
    curriculumNodeId: PHYSICS12_MOTION_PILOT.chapterId,
    curriculumVersionId: PHYSICS12_MOTION_PILOT.curriculumVersionId,
  },
  taxonomyNodes: physics12MotionTaxonomyNodes,
  contentItems: physics12MotionContentItems,
  mappings: physics12MotionContentMappings,
}

export const arabic10Lesson1KnowledgeExpansionManifest: KnowledgeExpansionManifest = {
  manifestSchemaVersion: KNOWLEDGE_EXPANSION_MANIFEST_SCHEMA_VERSION,
  package: {
    packageId: 'pkg-f425e2bf-3b24-492e-a815-e7d442f68445',
    packageKind: 'PILOT',
    subject: ARABIC10_LESSON1_PILOT.subjectId,
    structuralScope: ARABIC10_LESSON1_PILOT.lessonId,
    curriculumVersionId: ARABIC10_LESSON1_PILOT.curriculumVersionId,
    sourceType: 'MANUAL_ENTRY',
    status: 'DRAFT',
    review: pendingReview,
  },
  structuralAnchor: {
    subjectId: ARABIC10_LESSON1_PILOT.subjectId,
    curriculumNodeId: ARABIC10_LESSON1_PILOT.lessonId,
    curriculumVersionId: ARABIC10_LESSON1_PILOT.curriculumVersionId,
  },
  taxonomyNodes: arabic10Lesson1TaxonomyNodes,
  contentItems: arabic10Lesson1ContentItems,
  mappings: arabic10Lesson1ContentMappings,
}

// Registration does not import, persist, review, approve, or publish package data.
export const knowledgeExpansionManifests: readonly KnowledgeExpansionManifest[] = [
  physics12MotionKnowledgeExpansionManifest,
  arabic10Lesson1KnowledgeExpansionManifest,
]
