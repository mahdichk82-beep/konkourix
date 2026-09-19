import type {
  ContentCurriculumMapping,
  EducationalContentItem,
} from '../content-ingestion.js'
import {
  physics12MotionContentItems,
  physics12MotionContentMappings,
} from './pilot-physics12-motion.js'
import {
  arabic10Lesson1ContentItems,
  arabic10Lesson1ContentMappings,
} from './pilot-arabic10-lesson1.js'

// Only isolated, unverified manual pilots are registered.
export const educationalContentItems: readonly EducationalContentItem[] = [
  ...physics12MotionContentItems,
  ...arabic10Lesson1ContentItems,
]

export const contentCurriculumMappings: readonly ContentCurriculumMapping[] = [
  ...physics12MotionContentMappings,
  ...arabic10Lesson1ContentMappings,
]
