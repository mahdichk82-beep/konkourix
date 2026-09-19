import { createHash } from 'node:crypto'
import {
  humanSciencesCatalog,
  humanSciencesApplicability,
  theoreticalCurriculumFoundationCatalog,
  type HumanSciencesCatalogRecord,
} from './human-sciences.js'
import { mathematicsPhysicsSpecificCatalog } from './mathematics-physics.js'
import { experimentalSciencesSpecificCatalog } from './experimental-sciences.js'

export type CurriculumReviewItem = Readonly<{
  code: string
  sourceLocator: string
  detail: string
}>

const sourceLine = (record: HumanSciencesCatalogRecord): number => {
  const match = /:L([0-9]+)$/.exec(record.sourceLocator)
  if (!match) throw new Error(`Invalid source locator: ${record.sourceLocator}`)
  return Number(match[1])
}

const foundationRefs = new Set(theoreticalCurriculumFoundationCatalog.map((record) => record.ref))

export const humanSciencesSpecificCatalog: readonly HumanSciencesCatalogRecord[] =
  humanSciencesCatalog.filter((record) => !foundationRefs.has(record.ref))

export const theoreticalCurriculumCatalog: readonly HumanSciencesCatalogRecord[] = [
  ...theoreticalCurriculumFoundationCatalog,
  ...humanSciencesSpecificCatalog,
  ...mathematicsPhysicsSpecificCatalog,
  ...experimentalSciencesSpecificCatalog,
].sort((left, right) => sourceLine(left) - sourceLine(right))

export const theoreticalCurriculumApplicability = humanSciencesApplicability

export const theoreticalCurriculumFieldCatalogs = {
  experimental: experimentalSciencesSpecificCatalog,
  human: humanSciencesSpecificCatalog,
  mathematics: mathematicsPhysicsSpecificCatalog,
} as const

export const theoreticalCurriculumReviewItems: readonly CurriculumReviewItem[] = [
  {
    code: 'SOURCE_DETAIL_INCOMPLETE',
    sourceLocator: 'CANONICAL_CURRICULUM.md:L6780',
    detail: 'The source says some lower-priority lessons were not written out; absent detail cannot be treated as proof that structure does not exist.',
  },
  {
    code: 'CURRICULUM_RELEASE_IDENTITY_MISSING',
    sourceLocator: 'CANONICAL_CURRICULUM.md:L6781',
    detail: 'The source provides no official curriculum name, academic year, edition, publication date, or effective date.',
  },
  {
    code: 'BIOLOGY_GRADE_PARENT_UNRESOLVED',
    sourceLocator: 'CANONICAL_CURRICULUM.md:L1813-L2281;L6782',
    detail: 'Three biology chapter sequences lack explicit Biology 1/2/3 boundary headings and remain unattached.',
  },
  {
    code: 'STRUCTURAL_TYPE_MAPPING_REVIEW',
    sourceLocator: 'CANONICAL_CURRICULUM.md:L6783',
    detail: 'Several areas omit intermediate levels or mix structural labels; unapproved semantic mappings remain excluded.',
  },
  {
    code: 'CROSS_GRADE_THEMATIC_TREES_UNRESOLVED',
    sourceLocator: 'CANONICAL_CURRICULUM.md:L6784',
    detail: 'Cross-grade Arabic, Persian, English, Experimental Mathematics, and Literary Sciences trees require an ownership or mapping decision.',
  },
  {
    code: 'CHEMISTRY_LINKED_SKILLS_OWNERSHIP_UNRESOLVED',
    sourceLocator: 'CANONICAL_CURRICULUM.md:L6785',
    detail: 'The starred linked-skills section following Chemistry has no explicit owner.',
  },
  {
    code: 'CHEMISTRY_CROSS_SCOPE_RELATIONSHIP_UNRESOLVED',
    sourceLocator: 'CANONICAL_CURRICULUM.md:L5577;L6786',
    detail: 'The prose statement that Chemistry is shared by Experimental Sciences and Mathematics & Physics requires an ownership/applicability decision.',
  },
  {
    code: 'ALTERNATE_SCOPE_HEADING_MAPPING_UNRESOLVED',
    sourceLocator: 'CANONICAL_CURRICULUM.md:L6787',
    detail: 'Standalone informal Mathematics & Physics and Human Sciences headings need confirmed mappings to canonical scopes.',
  },
  {
    code: 'ARABIC_COMBINED_SOURCE_PARAGRAPH',
    sourceLocator: 'CANONICAL_CURRICULUM.md:L6788',
    detail: 'One Arabic paragraph appears to combine two entries and cannot be split without authorization.',
  },
  {
    code: 'STAR_MARKER_MEANING_UNRESOLVED',
    sourceLocator: 'CANONICAL_CURRICULUM.md:L6789',
    detail: 'The meaning of source star markers is undefined; no weight or other metadata may be inferred.',
  },
  {
    code: 'EDUCATIONAL_METADATA_NOT_DEFINED',
    sourceLocator: 'CANONICAL_CURRICULUM.md:L6790',
    detail: 'Prerequisites, objectives, hours, difficulty, weights, aliases, equivalence, and source-issued stable identifiers are not defined.',
  },
  {
    code: 'GEOLOGY_DETAIL_ABSENT',
    sourceLocator: 'CANONICAL_CURRICULUM.md:L147',
    detail: 'The source identifies Grade 11 Geology but contains no detailed Geology tree.',
  },
] as const

export const theoreticalCurriculumCatalogChecksum = createHash('sha256')
  .update(JSON.stringify({
    applicability: theoreticalCurriculumApplicability,
    records: theoreticalCurriculumCatalog,
    reviewItems: theoreticalCurriculumReviewItems,
  }))
  .digest('hex')
