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

export const ARABIC10_LESSON1_PILOT = {
  subjectId: 'shared.g10.arabic',
  lessonId: 'shared.g10.arabic.lesson.186',
  applicableHumanGradeId: 'human.g10',
  curriculumVersionId: THEORETICAL_CURRICULUM_FREEZE_SNAPSHOT_ID,
} as const

export const arabic10Lesson1TaxonomyRegistry: TaxonomyRegistryEntry = {
  subjectId: ARABIC10_LESSON1_PILOT.subjectId,
  curriculumVersionId: ARABIC10_LESSON1_PILOT.curriculumVersionId,
  curriculumNodeId: ARABIC10_LESSON1_PILOT.subjectId,
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
    subjectId: ARABIC10_LESSON1_PILOT.subjectId,
    curriculumVersionId: ARABIC10_LESSON1_PILOT.curriculumVersionId,
    curriculumNodeId: ARABIC10_LESSON1_PILOT.lessonId,
    parentTaxonomyKey: input.parentTaxonomyKey,
    displayLabel: input.label,
    provenance: {
      sourceArtifactName: 'Konkourix Arabic 10 Lesson 1 manual pilot',
      sourceRecordKey: `manual-source-${input.id}`,
      sourceLocator: `manual://arabic10-lesson1/${taxonomyKey}`,
      rawText: input.label,
    },
  }
}

const keys = {
  topicText: 'tax-4bdbf43f-2e54-4bea-98b5-efd83819e132',
  topicVocabulary: 'tax-99eec0ac-f350-4641-a164-d9194279d2b1',
  topicGrammar: 'tax-9246c1ee-ccd0-4438-b7e9-099b3a9002f1',
  subReading: 'tax-402e8f9f-60d6-45b8-851f-c7740a4df529',
  subKeyVocabulary: 'tax-0e0d0780-4639-409c-9a5e-014e5df2b85d',
  subDemonstrative: 'tax-eef138b2-f685-4ddf-843a-0d16df76d34e',
  subPronouns: 'tax-4953446d-92dc-4f79-9ccb-0f8ffea39904',
  subVerbs: 'tax-673aa210-93cc-4e9e-b0a2-efc6cfdb36b1',
  conceptSentenceMeaning: 'tax-cdd8c6f6-4af1-41af-bf9e-86befa90a4e5',
  conceptWordType: 'tax-55c3a253-4bda-4baa-8f3f-b4ca394715c1',
  conceptDemonstrative: 'tax-9a2a6ddb-c5d5-4505-9826-801a32992409',
  conceptIndependentPronoun: 'tax-a95ac17a-eea4-419b-9c7e-43a58c40953b',
  conceptAttachedPronoun: 'tax-69f379c7-9c2e-4b93-8c1b-0f33812afacf',
  conceptPastVerb: 'tax-a6f02c35-c98d-46e4-a711-b8bbf91fb0c9',
  conceptConjugation: 'tax-9d261854-2350-4c6f-a9d8-4100b600699e',
  skillTranslate: 'tax-37bac179-00b5-439f-ba97-256dee2f1a01',
  skillWordType: 'tax-8135a256-471d-4e26-8602-5be9c7345509',
  skillIndependentPronoun: 'tax-4d3043c0-b3a6-428b-95cd-1a9261f24fd5',
  skillAttachedPronoun: 'tax-3d223cef-a1a1-4eac-9890-4f54933d34b1',
  skillPastVerb: 'tax-161fcbe0-0b7c-4893-966a-0d3a23602033',
  skillVerbStructure: 'tax-2b48fbe7-d8fc-4e7a-a724-3d071f1ec806',
  skillSentenceAnalysis: 'tax-cc979022-8761-41ee-b728-3d60f0fea2cb',
  patternTranslation: 'tax-6124f17a-1839-4095-9e22-4b2ee1e50d1b',
  patternVocabulary: 'tax-a214f1cb-19a4-4396-bbfa-32cc1587de8d',
  patternGrammar: 'tax-70097568-bc2a-436c-98bc-a8d4c45df13f',
  patternStructure: 'tax-f351edaa-1f0c-4e5e-a143-f14bd5f31f81',
  patternCombined: 'tax-ebc4265d-86a7-4e40-aa49-a7da47dfeb48',
} as const

const id = (taxonomyKey: string): string => taxonomyKey.slice('tax-'.length)

export const arabic10Lesson1TaxonomyNodes: readonly KnowledgeTaxonomyNode[] = [
  taxonomyNode({ id: id(keys.topicText), kind: 'TOPIC', label: 'متن و ترجمه', parentTaxonomyKey: null }),
  taxonomyNode({ id: id(keys.topicVocabulary), kind: 'TOPIC', label: 'واژگان', parentTaxonomyKey: null }),
  taxonomyNode({ id: id(keys.topicGrammar), kind: 'TOPIC', label: 'قواعد زبان عربی', parentTaxonomyKey: null }),

  taxonomyNode({ id: id(keys.subReading), kind: 'SUBTOPIC', label: 'درک متن', parentTaxonomyKey: keys.topicText }),
  taxonomyNode({ id: id(keys.subKeyVocabulary), kind: 'SUBTOPIC', label: 'واژگان کلیدی درس', parentTaxonomyKey: keys.topicVocabulary }),
  taxonomyNode({ id: id(keys.subDemonstrative), kind: 'SUBTOPIC', label: 'اسم اشاره', parentTaxonomyKey: keys.topicGrammar }),
  taxonomyNode({ id: id(keys.subPronouns), kind: 'SUBTOPIC', label: 'ضمایر', parentTaxonomyKey: keys.topicGrammar }),
  taxonomyNode({ id: id(keys.subVerbs), kind: 'SUBTOPIC', label: 'افعال و صیغه‌ها', parentTaxonomyKey: keys.topicGrammar }),

  taxonomyNode({ id: id(keys.conceptSentenceMeaning), kind: 'CONCEPT', label: 'معنای جمله در بافت', parentTaxonomyKey: keys.subReading }),
  taxonomyNode({ id: id(keys.conceptWordType), kind: 'CONCEPT', label: 'نوع و معنای واژه در بافت', parentTaxonomyKey: keys.subKeyVocabulary }),
  taxonomyNode({ id: id(keys.conceptDemonstrative), kind: 'CONCEPT', label: 'اسم اشاره', parentTaxonomyKey: keys.subDemonstrative }),
  taxonomyNode({ id: id(keys.conceptIndependentPronoun), kind: 'CONCEPT', label: 'ضمیر منفصل', parentTaxonomyKey: keys.subPronouns }),
  taxonomyNode({ id: id(keys.conceptAttachedPronoun), kind: 'CONCEPT', label: 'ضمیر متصل', parentTaxonomyKey: keys.subPronouns }),
  taxonomyNode({ id: id(keys.conceptPastVerb), kind: 'CONCEPT', label: 'فعل ماضی', parentTaxonomyKey: keys.subVerbs }),
  taxonomyNode({ id: id(keys.conceptConjugation), kind: 'CONCEPT', label: 'صیغهٔ فعل', parentTaxonomyKey: keys.subVerbs }),

  taxonomyNode({ id: id(keys.skillTranslate), kind: 'SKILL', label: 'ترجمهٔ جملهٔ عربی به فارسی', parentTaxonomyKey: keys.conceptSentenceMeaning }),
  taxonomyNode({ id: id(keys.skillWordType), kind: 'SKILL', label: 'تشخیص نوع کلمه', parentTaxonomyKey: keys.conceptWordType }),
  taxonomyNode({ id: id(keys.skillIndependentPronoun), kind: 'SKILL', label: 'تشخیص ضمیر منفصل', parentTaxonomyKey: keys.conceptIndependentPronoun }),
  taxonomyNode({ id: id(keys.skillAttachedPronoun), kind: 'SKILL', label: 'تشخیص ضمیر متصل', parentTaxonomyKey: keys.conceptAttachedPronoun }),
  taxonomyNode({ id: id(keys.skillPastVerb), kind: 'SKILL', label: 'تشخیص فعل ماضی', parentTaxonomyKey: keys.conceptPastVerb }),
  taxonomyNode({ id: id(keys.skillVerbStructure), kind: 'SKILL', label: 'تشخیص ساختار و صیغهٔ فعل', parentTaxonomyKey: keys.conceptConjugation }),
  taxonomyNode({ id: id(keys.skillSentenceAnalysis), kind: 'SKILL', label: 'تحلیل ساختار جمله', parentTaxonomyKey: keys.conceptDemonstrative }),

  taxonomyNode({ id: id(keys.patternTranslation), kind: 'QUESTION_PATTERN', label: 'ترجمه‌ای', parentTaxonomyKey: keys.skillTranslate }),
  taxonomyNode({ id: id(keys.patternVocabulary), kind: 'QUESTION_PATTERN', label: 'واژگان', parentTaxonomyKey: keys.skillWordType }),
  taxonomyNode({ id: id(keys.patternGrammar), kind: 'QUESTION_PATTERN', label: 'قواعدی', parentTaxonomyKey: keys.skillIndependentPronoun }),
  taxonomyNode({ id: id(keys.patternStructure), kind: 'QUESTION_PATTERN', label: 'تشخیص ساختار', parentTaxonomyKey: keys.skillVerbStructure }),
  taxonomyNode({ id: id(keys.patternCombined), kind: 'QUESTION_PATTERN', label: 'ترکیبی', parentTaxonomyKey: keys.skillSentenceAnalysis }),
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
    sourceReference: `manual://arabic10-lesson1/content-${input.id}`,
    createdBy: 'konkourix-curriculum-pilot',
    createdAt: '2026-09-18T13:00:00.000Z',
    verificationStatus: 'UNVERIFIED',
    reviewedBy: null,
    reviewedAt: null,
  },
})

export const arabic10Lesson1ContentItems: readonly EducationalContentItem[] = [
  content({ id: 'c5333b8d-1f9f-41b5-96c4-bad59fa917b7', kind: 'DEFINITION', title: 'اسم اشاره', body: 'اسم اشاره واژه‌ای است که برای اشاره به شخص یا چیز به کار می‌رود و صورت آن با نزدیکی یا دوری و ویژگی‌های مرجع ارتباط دارد.' }),
  content({ id: 'ae1fbcb2-cbe6-4231-9888-55b2ccfd7eb8', kind: 'EXPLANATION', title: 'هذا و ذاکَ', body: 'در کاربرد پایه، «هذا» برای اشاره به مفرد مذکر نزدیک و «ذاکَ» برای اشاره به مفرد مذکر دور به کار می‌رود.' }),
  content({ id: '6d95da8d-d7a0-4b59-aa6a-a82824860a97', kind: 'DEFINITION', title: 'ضمیر منفصل', body: 'ضمیر منفصل به‌صورت واژه‌ای مستقل نوشته می‌شود؛ مانند «هُوَ» که به مفرد مذکر غایب اشاره می‌کند.' }),
  content({ id: '5464da86-0b28-496d-a096-2fd70cd73f78', kind: 'DEFINITION', title: 'ضمیر متصل', body: 'ضمیر متصل به واژه‌ای دیگر می‌پیوندد و نقش و ترجمهٔ آن با واژهٔ میزبان و جایگاهش در جمله مشخص می‌شود.' }),
  content({ id: '862f49e3-e3be-43c0-8be2-ccdaad004aa0', kind: 'DEFINITION', title: 'فعل ماضی', body: 'فعل ماضی در کاربرد پایه بر انجام کار یا رخداد در زمان گذشته دلالت می‌کند.' }),
  content({ id: '84c7e34b-c457-4142-8040-0a9f6343a106', kind: 'EXPLANATION', title: 'صیغهٔ فعل', body: 'صیغهٔ فعل اطلاعاتی مانند شخص، شمار و در برخی صورت‌ها جنس دستوری فاعل را در ساخت فعل نشان می‌دهد.' }),
  content({ id: '43934e7e-0bd9-444e-8f4e-7ae54832ef03', kind: 'EXPLANATION', title: 'ترجمه در بافت', body: 'برای ترجمهٔ درست، معنای واژه‌ها باید همراه با نقش آن‌ها، ترتیب جمله و بافت عبارت بررسی شود؛ جایگزینی واژه‌به‌واژه همیشه ترجمهٔ طبیعی نمی‌سازد.' }),
  content({ id: 'd3538413-bce9-4131-aaea-34fdc7ad480e', kind: 'EXAMPLE', title: 'ترجمهٔ عبارت درس', body: 'عبارت «ذاکَ هُوَ الله» را می‌توان در فارسی روان به‌صورت «آن، همان خداست» برگرداند.' }),
  content({ id: '86882867-727d-4375-b7a1-776692935a9b', kind: 'EXAMPLE', title: 'نمونهٔ ضمیر منفصل', body: 'در عبارت «هُوَ طالِبٌ»، واژهٔ «هُوَ» ضمیر منفصل مفرد مذکر غایب است.' }),
  content({ id: '973d6048-d287-4be4-be4d-4c06141b9c0b', kind: 'EXAMPLE', title: 'نمونهٔ ضمیر متصل', body: 'در واژهٔ «کِتابُهُ»، جزء «ـهُ» ضمیر متصل است و ترکیب می‌تواند «کتاب او» ترجمه شود.' }),
  content({ id: '4af64d3f-fb03-4217-a78d-279113e99041', kind: 'EXAMPLE', title: 'نمونهٔ فعل ماضی جمع', body: '«کَتَبوا» صورت ماضی جمع مذکر غایب است و در فارسی «آنان نوشتند» ترجمه می‌شود.' }),
  content({ id: '21998411-d010-4994-93cf-7868072a8334', kind: 'NOTE', title: 'نقش حرکت‌گذاری', body: 'حرکت‌گذاری می‌تواند به خواندن و تشخیص ساخت کمک کند، اما تحلیل نهایی باید با نقش واژه و بافت کامل جمله سازگار باشد.' }),
]

const mappingIds = [
  '6b799141-72cf-4dab-bce5-3fc4ec24e681',
  'ffde0896-6cd0-4b04-ad89-de4a6a7dce31',
  '6214f62d-71ca-47b0-a491-0333e3cd3e55',
  '85c2d701-8c6e-4d58-96fc-70f387b855e2',
  '60cb762b-43d5-404b-aa10-09f32c9f5c1b',
  'b915fe4c-d138-4d80-863c-9b40aa68aa22',
  '287ff89b-aa72-47a2-bd64-285d7e366f38',
  'c7e35d2b-3e9a-42d3-a098-8c868cd6891b',
  '55739629-89f4-4f06-b151-26a80a055326',
  'ff332bf8-49cf-4215-a8f4-8fbe22b6cb1f',
  '3180b260-0d98-4184-8927-7ab39c6a0be3',
  'ac19d2de-b54d-4b47-b523-e1bfdc33159d',
] as const

const mappingTaxonomyKeys = [
  keys.conceptDemonstrative,
  keys.conceptDemonstrative,
  keys.conceptIndependentPronoun,
  keys.conceptAttachedPronoun,
  keys.conceptPastVerb,
  keys.conceptConjugation,
  keys.conceptSentenceMeaning,
  keys.skillTranslate,
  keys.skillIndependentPronoun,
  keys.skillAttachedPronoun,
  keys.skillPastVerb,
  keys.conceptWordType,
] as const

export const arabic10Lesson1ContentMappings: readonly ContentCurriculumMapping[] =
  arabic10Lesson1ContentItems.map((item, index) => ({
    mappingKey: `mapping-${mappingIds[index]!}`,
    contentKey: item.contentKey,
    curriculumVersionId: ARABIC10_LESSON1_PILOT.curriculumVersionId,
    curriculumNodeId: ARABIC10_LESSON1_PILOT.lessonId,
    taxonomyKey: mappingTaxonomyKeys[index]!,
  }))
