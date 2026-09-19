import type {
  KnowledgeTaxonomyNode,
  TaxonomyRegistryEntry,
} from '../taxonomy.js'
import {
  physics12MotionTaxonomyNodes,
  physics12MotionTaxonomyRegistry,
} from './pilot-physics12-motion.js'
import {
  arabic10Lesson1TaxonomyNodes,
  arabic10Lesson1TaxonomyRegistry,
} from './pilot-arabic10-lesson1.js'

// These isolated manual pilots reference the frozen catalog candidate snapshot,
// not a database CurriculumVersion identifier.
export const taxonomyRegistry: readonly TaxonomyRegistryEntry[] = [
  physics12MotionTaxonomyRegistry,
  arabic10Lesson1TaxonomyRegistry,
]

export const knowledgeTaxonomyNodes: readonly KnowledgeTaxonomyNode[] = [
  ...physics12MotionTaxonomyNodes,
  ...arabic10Lesson1TaxonomyNodes,
]
