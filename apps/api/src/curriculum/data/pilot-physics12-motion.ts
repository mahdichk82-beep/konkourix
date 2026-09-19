import type {
  ContentCurriculumMapping,
  EducationalContentItem,
} from '../content-ingestion.js'
import type {
  KnowledgeTaxonomyKind,
  KnowledgeTaxonomyNode,
  TaxonomyRegistryEntry,
} from '../taxonomy.js'
import { THEORETICAL_CURRICULUM_FREEZE_SNAPSHOT_ID } from './theoretical-curriculum-freeze.js'

export const PHYSICS12_MOTION_PILOT = {
  subjectId: 'mathematics.g12.physics3',
  chapterId: 'mathematics.g12.physics3.chapter.4278',
  curriculumVersionId: THEORETICAL_CURRICULUM_FREEZE_SNAPSHOT_ID,
} as const

export const physics12MotionTaxonomyRegistry: TaxonomyRegistryEntry = {
  subjectId: PHYSICS12_MOTION_PILOT.subjectId,
  curriculumVersionId: PHYSICS12_MOTION_PILOT.curriculumVersionId,
  curriculumNodeId: PHYSICS12_MOTION_PILOT.subjectId,
  taxonomyStatus: 'DRAFT',
}

const taxonomyNode = (input: {
  id: string
  kind: KnowledgeTaxonomyKind
  label: string
  parentTaxonomyKey: string | null
}): KnowledgeTaxonomyNode => {
  const taxonomyKey = `tax-${input.id}`
  return {
    taxonomyKey,
    kind: input.kind,
    subjectId: PHYSICS12_MOTION_PILOT.subjectId,
    curriculumVersionId: PHYSICS12_MOTION_PILOT.curriculumVersionId,
    curriculumNodeId: PHYSICS12_MOTION_PILOT.chapterId,
    parentTaxonomyKey: input.parentTaxonomyKey,
    displayLabel: input.label,
    provenance: {
      sourceArtifactName: 'Konkourix Physics 12 Motion manual pilot',
      sourceRecordKey: `manual-source-${input.id}`,
      sourceLocator: `manual://physics12-motion/${taxonomyKey}`,
      rawText: input.label,
    },
  }
}

const keys = {
  topic: 'tax-425c4e34-8288-42e3-9e59-bfce2b15bc8c',
  subPosition: 'tax-47ca360e-b172-441c-8af3-3401a7c09787',
  subVelocity: 'tax-90da4722-0dcb-4bc4-ae1b-fd8e4e50510a',
  subAcceleration: 'tax-c9fb4387-2ab2-46b5-907d-18304c538505',
  subGraphs: 'tax-bd06b47e-4fd4-46c5-824a-8206f75cca19',
  subConstant: 'tax-abc5e3ca-69b1-4d68-b655-a622a9c7d3c3',
  conceptReference: 'tax-604f3ff1-059e-4ea2-9047-93347aae7555',
  conceptDisplacement: 'tax-ec9efb0f-d547-42e8-8b24-018d9b002449',
  conceptAverageVelocity: 'tax-fa838d78-b269-43af-81ae-1985d69398dd',
  conceptInstantVelocity: 'tax-5f3a4fbf-7015-4e06-b5c2-7b37991b3cda',
  conceptAcceleration: 'tax-6273ca48-29b5-402e-91de-fcaa710976d7',
  conceptPositionGraph: 'tax-e42c96d5-e75c-430f-841e-ed33c8697326',
  conceptVelocityGraph: 'tax-df7f5743-5dff-49b3-9514-aa5961e6c454',
  conceptEquations: 'tax-eaf06c8e-4afa-4c95-b72e-32c82c288fb9',
  skillPosition: 'tax-f2d85f44-cfae-4cd5-8262-e4608f6cb03b',
  skillDisplacement: 'tax-c9d112f1-3fd7-423c-8766-09fff5130f87',
  skillAverageVelocity: 'tax-5ad27f46-2404-4d84-b625-71d0bf808fee',
  skillInstantVelocity: 'tax-a36874bb-817c-4b19-ba2f-abee17b8595f',
  skillAcceleration: 'tax-a48e4abd-9aeb-44f0-b32d-0142e6b1145d',
  skillPositionGraph: 'tax-bc464d64-7fda-454f-a484-b80dca9a87d5',
  skillVelocityGraph: 'tax-f932a72b-1814-471e-aeed-af585d765478',
  skillEquations: 'tax-f918555c-ecfe-4cb8-941b-7fcb6d9c9871',
  patternPosition: 'tax-c18df3ea-f76b-4aa0-a50c-49ae2ced7ef2',
  patternDisplacement: 'tax-644e3cc3-ff41-4656-b95e-b30980e8b953',
  patternAverageVelocity: 'tax-8d3a2ca8-1c0c-440b-916c-4ea7da0e0af1',
  patternInstantVelocity: 'tax-e343abef-ad99-44e7-8d98-70b810ffafd7',
  patternAcceleration: 'tax-fb138db6-6f0a-4140-82c4-50efa18ead7f',
  patternPositionGraph: 'tax-ba1666c6-8a4c-47eb-99e6-f39042553650',
  patternVelocityGraph: 'tax-cd955eb6-5054-4f97-9e1f-5b86ec724783',
  patternEquations: 'tax-244edf03-01ff-454c-9e88-05f6fb0bcac1',
} as const

const id = (taxonomyKey: string): string => taxonomyKey.slice('tax-'.length)

export const physics12MotionTaxonomyNodes: readonly KnowledgeTaxonomyNode[] = [
  taxonomyNode({ id: id(keys.topic), kind: 'TOPIC', label: 'حرکت بر خط راست', parentTaxonomyKey: null }),
  taxonomyNode({ id: id(keys.subPosition), kind: 'SUBTOPIC', label: 'موقعیت، مسافت و جابه‌جایی', parentTaxonomyKey: keys.topic }),
  taxonomyNode({ id: id(keys.subVelocity), kind: 'SUBTOPIC', label: 'تندی و سرعت', parentTaxonomyKey: keys.topic }),
  taxonomyNode({ id: id(keys.subAcceleration), kind: 'SUBTOPIC', label: 'شتاب', parentTaxonomyKey: keys.topic }),
  taxonomyNode({ id: id(keys.subGraphs), kind: 'SUBTOPIC', label: 'نمودارهای حرکت', parentTaxonomyKey: keys.topic }),
  taxonomyNode({ id: id(keys.subConstant), kind: 'SUBTOPIC', label: 'حرکت با شتاب ثابت', parentTaxonomyKey: keys.topic }),

  taxonomyNode({ id: id(keys.conceptReference), kind: 'CONCEPT', label: 'دستگاه مرجع و موقعیت', parentTaxonomyKey: keys.subPosition }),
  taxonomyNode({ id: id(keys.conceptDisplacement), kind: 'CONCEPT', label: 'مسافت و جابه‌جایی', parentTaxonomyKey: keys.subPosition }),
  taxonomyNode({ id: id(keys.conceptAverageVelocity), kind: 'CONCEPT', label: 'تندی متوسط و سرعت متوسط', parentTaxonomyKey: keys.subVelocity }),
  taxonomyNode({ id: id(keys.conceptInstantVelocity), kind: 'CONCEPT', label: 'سرعت لحظه‌ای', parentTaxonomyKey: keys.subVelocity }),
  taxonomyNode({ id: id(keys.conceptAcceleration), kind: 'CONCEPT', label: 'شتاب متوسط و شتاب لحظه‌ای', parentTaxonomyKey: keys.subAcceleration }),
  taxonomyNode({ id: id(keys.conceptPositionGraph), kind: 'CONCEPT', label: 'نمودار مکان ـ زمان', parentTaxonomyKey: keys.subGraphs }),
  taxonomyNode({ id: id(keys.conceptVelocityGraph), kind: 'CONCEPT', label: 'نمودار سرعت ـ زمان', parentTaxonomyKey: keys.subGraphs }),
  taxonomyNode({ id: id(keys.conceptEquations), kind: 'CONCEPT', label: 'معادله‌های حرکت با شتاب ثابت', parentTaxonomyKey: keys.subConstant }),

  taxonomyNode({ id: id(keys.skillPosition), kind: 'SKILL', label: 'تعیین موقعیت جسم نسبت به مبدأ و جهت مثبت', parentTaxonomyKey: keys.conceptReference }),
  taxonomyNode({ id: id(keys.skillDisplacement), kind: 'SKILL', label: 'محاسبه و مقایسهٔ مسافت و جابه‌جایی', parentTaxonomyKey: keys.conceptDisplacement }),
  taxonomyNode({ id: id(keys.skillAverageVelocity), kind: 'SKILL', label: 'محاسبهٔ تندی متوسط و سرعت متوسط', parentTaxonomyKey: keys.conceptAverageVelocity }),
  taxonomyNode({ id: id(keys.skillInstantVelocity), kind: 'SKILL', label: 'تعیین سرعت لحظه‌ای از رابطه یا نمودار مکان ـ زمان', parentTaxonomyKey: keys.conceptInstantVelocity }),
  taxonomyNode({ id: id(keys.skillAcceleration), kind: 'SKILL', label: 'محاسبهٔ شتاب از تغییر سرعت', parentTaxonomyKey: keys.conceptAcceleration }),
  taxonomyNode({ id: id(keys.skillPositionGraph), kind: 'SKILL', label: 'تفسیر شیب و روند نمودار مکان ـ زمان', parentTaxonomyKey: keys.conceptPositionGraph }),
  taxonomyNode({ id: id(keys.skillVelocityGraph), kind: 'SKILL', label: 'تفسیر شیب و مساحت نمودار سرعت ـ زمان', parentTaxonomyKey: keys.conceptVelocityGraph }),
  taxonomyNode({ id: id(keys.skillEquations), kind: 'SKILL', label: 'حل موقعیت و سرعت در حرکت با شتاب ثابت', parentTaxonomyKey: keys.conceptEquations }),

  taxonomyNode({ id: id(keys.patternPosition), kind: 'QUESTION_PATTERN', label: 'الگوی تعیین موقعیت در دستگاه مختصات یک‌بعدی', parentTaxonomyKey: keys.skillPosition }),
  taxonomyNode({ id: id(keys.patternDisplacement), kind: 'QUESTION_PATTERN', label: 'الگوی محاسبهٔ مسافت و جابه‌جایی از مسیر حرکت', parentTaxonomyKey: keys.skillDisplacement }),
  taxonomyNode({ id: id(keys.patternAverageVelocity), kind: 'QUESTION_PATTERN', label: 'الگوی محاسبهٔ کمیت متوسط در بازهٔ زمانی', parentTaxonomyKey: keys.skillAverageVelocity }),
  taxonomyNode({ id: id(keys.patternInstantVelocity), kind: 'QUESTION_PATTERN', label: 'الگوی استخراج سرعت لحظه‌ای از مکان یا نمودار', parentTaxonomyKey: keys.skillInstantVelocity }),
  taxonomyNode({ id: id(keys.patternAcceleration), kind: 'QUESTION_PATTERN', label: 'الگوی تعیین شتاب از تغییرات سرعت', parentTaxonomyKey: keys.skillAcceleration }),
  taxonomyNode({ id: id(keys.patternPositionGraph), kind: 'QUESTION_PATTERN', label: 'الگوی تحلیل نمودار مکان ـ زمان', parentTaxonomyKey: keys.skillPositionGraph }),
  taxonomyNode({ id: id(keys.patternVelocityGraph), kind: 'QUESTION_PATTERN', label: 'الگوی تحلیل نمودار سرعت ـ زمان', parentTaxonomyKey: keys.skillVelocityGraph }),
  taxonomyNode({ id: id(keys.patternEquations), kind: 'QUESTION_PATTERN', label: 'الگوی حل حرکت یک‌بعدی با شتاب ثابت', parentTaxonomyKey: keys.skillEquations }),
]

const content = (input: {
  id: string
  kind: EducationalContentItem['kind']
  title: string
  body: string
}): EducationalContentItem => ({
  contentKey: `content-${input.id}`,
  kind: input.kind,
  title: input.title,
  body: input.body,
  provenance: {
    sourceType: 'MANUAL_ENTRY',
    sourceReference: `manual://physics12-motion/content-${input.id}`,
    createdBy: 'konkourix-curriculum-pilot',
    createdAt: '2026-09-18T12:00:00.000Z',
    verificationStatus: 'UNVERIFIED',
    reviewedBy: null,
    reviewedAt: null,
  },
})

export const physics12MotionContentItems: readonly EducationalContentItem[] = [
  content({ id: '97490dd8-868b-4d5a-a664-d67869bee06a', kind: 'DEFINITION', title: 'موقعیت', body: 'موقعیت یک جسم روی خط راست با مختصهٔ آن نسبت به مبدأ و جهت مثبت انتخاب‌شده بیان می‌شود.' }),
  content({ id: '87c60818-99ee-44f9-9acd-79c1774e315b', kind: 'DEFINITION', title: 'جابه‌جایی', body: 'جابه‌جایی تغییر موقعیت جسم است و در حرکت یک‌بعدی از رابطهٔ Δx = x_f − x_i به دست می‌آید.' }),
  content({ id: '310f953c-4922-4299-b1d4-07057ebc0a63', kind: 'EXPLANATION', title: 'تفاوت مسافت و جابه‌جایی', body: 'مسافت طول کل مسیر طی‌شده و کمیتی نرده‌ای است؛ جابه‌جایی اختلاف موقعیت پایانی و آغازین است و علامت آن جهت تغییر موقعیت را نشان می‌دهد.' }),
  content({ id: '309b3e7e-2781-455d-aa71-4f921b7cb892', kind: 'EXAMPLE', title: 'نمونهٔ محاسبهٔ جابه‌جایی', body: 'اگر جسم از موقعیت ۲ متر به موقعیت ۷ متر برسد، جابه‌جایی آن برابر با ۵+ متر است.' }),
  content({ id: '0bbd42bf-c2d7-4788-b695-81c2fc16917d', kind: 'DEFINITION', title: 'سرعت متوسط', body: 'سرعت متوسط برابر نسبت جابه‌جایی به بازهٔ زمانی است: v_avg = Δx / Δt.' }),
  content({ id: 'e54cf98a-95f0-4b44-aed9-09f3442c5aa8', kind: 'EXPLANATION', title: 'سرعت لحظه‌ای', body: 'سرعت لحظه‌ای نرخ تغییر موقعیت در یک لحظه است و از شیب خط مماس بر نمودار مکان ـ زمان در همان لحظه به دست می‌آید.' }),
  content({ id: '3ccbe558-ddcc-4851-af0d-7e6e77594949', kind: 'DEFINITION', title: 'شتاب متوسط', body: 'شتاب متوسط برابر نسبت تغییر سرعت به بازهٔ زمانی است: a_avg = Δv / Δt.' }),
  content({ id: '766116e9-6139-4f96-9cc3-115da6545be8', kind: 'EXAMPLE', title: 'نمونهٔ محاسبهٔ شتاب متوسط', body: 'اگر سرعت جسم در ۳ ثانیه از ۴ متر بر ثانیه به ۱۰ متر بر ثانیه برسد، شتاب متوسط آن ۲ متر بر مجذور ثانیه است.' }),
  content({ id: 'f65003d4-1d76-4df5-acc0-d2badd976eaa', kind: 'EXPLANATION', title: 'شیب نمودار مکان ـ زمان', body: 'شیب نمودار مکان ـ زمان سرعت را نشان می‌دهد؛ شیب مثبت نشان‌دهندهٔ سرعت مثبت و شیب منفی نشان‌دهندهٔ سرعت منفی است.' }),
  content({ id: 'd0dd1d39-0cf3-429d-bec1-5d1219335740', kind: 'EXPLANATION', title: 'اطلاعات نمودار سرعت ـ زمان', body: 'شیب نمودار سرعت ـ زمان شتاب را نشان می‌دهد و مساحت علامت‌دار زیر نمودار در یک بازه برابر جابه‌جایی در همان بازه است.' }),
  content({ id: '7e913551-b590-4047-a6ff-a62f2b6561b2', kind: 'DEFINITION', title: 'حرکت با شتاب ثابت', body: 'در حرکت با شتاب ثابت، سرعت در بازه‌های زمانی مساوی به اندازه‌های مساوی تغییر می‌کند.' }),
  content({ id: '4fbdf016-9fdf-49f2-b3a2-e1b428de9bf4', kind: 'EXAMPLE', title: 'نمونهٔ حرکت با شتاب ثابت', body: 'جسمی که از سکون با شتاب ثابت ۲ متر بر مجذور ثانیه حرکت کند، پس از ۳ ثانیه سرعت ۶ متر بر ثانیه و جابه‌جایی ۹ متر دارد.' }),
]

const mappingIds = [
  'a789ea13-216f-4993-94db-1c1f597e024d',
  '03a9e90e-9100-4cfa-ab0a-2e5b237efd7b',
  '1baa323a-d45e-402e-9b6b-748892a1d03a',
  '33dfe53c-0e62-4d7b-86fc-d277673dd7e1',
  '52750054-cac9-4d69-a0bd-49ffe03dece2',
  '07b3f7f5-edf1-4be9-ad57-ec1a9ac7a13c',
  '0824af38-cf2c-43db-b00f-12d0f629a5d6',
  '52638afa-2caf-4b08-b5a3-6fd4e690e828',
  '4a6d5c33-677c-4e45-945a-f47bf36754b4',
  '38c1ee88-c0e4-4250-82b0-f57f77313d7c',
  'e661815f-4181-4009-83c4-9f1a3c3f541d',
  '7ffdafe9-6530-496b-913b-8d1614239b27',
] as const

const mappingTaxonomyKeys = [
  keys.conceptReference,
  keys.conceptDisplacement,
  keys.conceptDisplacement,
  keys.skillDisplacement,
  keys.conceptAverageVelocity,
  keys.conceptInstantVelocity,
  keys.conceptAcceleration,
  keys.skillAcceleration,
  keys.conceptPositionGraph,
  keys.conceptVelocityGraph,
  keys.conceptEquations,
  keys.skillEquations,
] as const

export const physics12MotionContentMappings: readonly ContentCurriculumMapping[] =
  physics12MotionContentItems.map((item, index) => ({
    mappingKey: `mapping-${mappingIds[index]}`,
    contentKey: item.contentKey,
    curriculumVersionId: PHYSICS12_MOTION_PILOT.curriculumVersionId,
    curriculumNodeId: PHYSICS12_MOTION_PILOT.chapterId,
    taxonomyKey: mappingTaxonomyKeys[index]!,
  }))
