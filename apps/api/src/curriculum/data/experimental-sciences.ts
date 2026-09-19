import type { CurriculumImportManifestDraft } from '../types.js'
import {
  theoreticalCurriculumFoundationCatalog,
  theoreticalSharedApplicability,
  type HumanSciencesCatalogRecord,
} from './human-sciences.js'

export const EXPERIMENTAL_SCIENCES_TRANSCRIPTION_ID =
  'CANONICAL_CURRICULUM.md#experimental-sciences-structural-import-v1'

type CatalogSeed = {
  ref: string
  sourceRecordKey: string
  rawText: string
  displayLabel: string
  line: number
  proposedNodeTypeCode: HumanSciencesCatalogRecord['proposedNodeTypeCode']
  parentRef: string
}

const seed = (value: CatalogSeed): HumanSciencesCatalogRecord => ({
  ref: value.ref,
  sourceRecordKey: value.sourceRecordKey,
  rawText: value.rawText,
  displayLabel: value.displayLabel.normalize('NFC'),
  sourceLocator: `CANONICAL_CURRICULUM.md:L${value.line}`,
  proposedNodeTypeCode: value.proposedNodeTypeCode,
  parentRef: value.parentRef,
})

export const experimentalSciencesSpecificCatalog = [
  seed({ ref: 'experimental.g10.math1', sourceRecordKey: 'src-b3c48d87-84e3-413f-9f71-8ba563d928cb', rawText: '│   │   ├── ریاضی ۱', displayLabel: 'ریاضی ۱', line: 135, proposedNodeTypeCode: 'SUBJECT', parentRef: 'experimental.g10' }),
  seed({ ref: 'experimental.g10.physics1', sourceRecordKey: 'src-7454552d-a13d-4000-8689-42455a830029', rawText: '│   │   ├── فیزیک ۱', displayLabel: 'فیزیک ۱', line: 136, proposedNodeTypeCode: 'SUBJECT', parentRef: 'experimental.g10' }),
  seed({ ref: 'experimental.g10.chemistry1', sourceRecordKey: 'src-c0044875-c4c0-406f-80da-b5e2b5281d16', rawText: '│   │   ├── شیمی ۱', displayLabel: 'شیمی ۱', line: 137, proposedNodeTypeCode: 'SUBJECT', parentRef: 'experimental.g10' }),
  seed({ ref: 'experimental.g10.biology1', sourceRecordKey: 'src-bafbe0d4-e5f1-4a5c-b90c-a70660b0881a', rawText: '│   │   ├── زیست‌شناسی ۱', displayLabel: 'زیست‌شناسی ۱', line: 138, proposedNodeTypeCode: 'SUBJECT', parentRef: 'experimental.g10' }),
  seed({ ref: 'experimental.g11.math2', sourceRecordKey: 'src-3f2f90ee-fd9c-400e-a739-32a8ca77d99d', rawText: '│   │   ├── ریاضی ۲', displayLabel: 'ریاضی ۲', line: 143, proposedNodeTypeCode: 'SUBJECT', parentRef: 'experimental.g11' }),
  seed({ ref: 'experimental.g11.physics2', sourceRecordKey: 'src-921d8b5a-131a-4770-9cdd-6cee18f4a2da', rawText: '│   │   ├── فیزیک ۲', displayLabel: 'فیزیک ۲', line: 144, proposedNodeTypeCode: 'SUBJECT', parentRef: 'experimental.g11' }),
  seed({ ref: 'experimental.g11.chemistry2', sourceRecordKey: 'src-bebd8e2e-0090-4f0b-8756-207fef73dcec', rawText: '│   │   ├── شیمی ۲', displayLabel: 'شیمی ۲', line: 145, proposedNodeTypeCode: 'SUBJECT', parentRef: 'experimental.g11' }),
  seed({ ref: 'experimental.g11.biology2', sourceRecordKey: 'src-d334776c-f61c-4f75-8dbe-bba38753cd5f', rawText: '│   │   ├── زیست‌شناسی ۲', displayLabel: 'زیست‌شناسی ۲', line: 146, proposedNodeTypeCode: 'SUBJECT', parentRef: 'experimental.g11' }),
  seed({ ref: 'experimental.g11.geology', sourceRecordKey: 'src-1a5b2bc2-b89e-4d2f-bfe9-38e2a2a83f2c', rawText: '│   │   └── زمین‌شناسی', displayLabel: 'زمین‌شناسی', line: 147, proposedNodeTypeCode: 'SUBJECT', parentRef: 'experimental.g11' }),
  seed({ ref: 'experimental.g12.math3', sourceRecordKey: 'src-fc3db6fa-56fd-4097-9d79-5cddd5df2b8c', rawText: '│       ├── ریاضی ۳', displayLabel: 'ریاضی ۳', line: 149, proposedNodeTypeCode: 'SUBJECT', parentRef: 'experimental.g12' }),
  seed({ ref: 'experimental.g12.physics3', sourceRecordKey: 'src-300e2a4b-3f7e-49b3-9534-3dfe8580a17e', rawText: '│       ├── فیزیک ۳', displayLabel: 'فیزیک ۳', line: 150, proposedNodeTypeCode: 'SUBJECT', parentRef: 'experimental.g12' }),
  seed({ ref: 'experimental.g12.chemistry3', sourceRecordKey: 'src-22a68b33-493a-4c58-b5e0-c232329c6b57', rawText: '│       ├── شیمی ۳', displayLabel: 'شیمی ۳', line: 151, proposedNodeTypeCode: 'SUBJECT', parentRef: 'experimental.g12' }),
  seed({ ref: 'experimental.g12.biology3', sourceRecordKey: 'src-e9b3a0da-91dd-4063-81e3-9b41fecd3eea', rawText: '│       └── زیست‌شناسی ۳', displayLabel: 'زیست‌شناسی ۳', line: 152, proposedNodeTypeCode: 'SUBJECT', parentRef: 'experimental.g12' }),

  seed({ ref: 'experimental.g10.chemistry1.chapter.2283', sourceRecordKey: 'src-430855f0-237a-4ddf-8f1c-706984f80578', rawText: 'فصل ۱ ـ کیهان؛ زادگاه عناصر', displayLabel: 'فصل ۱ ـ کیهان؛ زادگاه عناصر', line: 2283, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g10.chemistry1' }),
  seed({ ref: 'experimental.g10.chemistry1.chapter.2306', sourceRecordKey: 'src-ea1f3449-0390-48cf-b80a-d629aa4c183b', rawText: 'فصل ۲ ـ ردپای گازها در زندگی', displayLabel: 'فصل ۲ ـ ردپای گازها در زندگی', line: 2306, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g10.chemistry1' }),
  seed({ ref: 'experimental.g10.chemistry1.chapter.2329', sourceRecordKey: 'src-71b96ad6-7270-4feb-8f85-bcecdb7ade37', rawText: 'فصل ۳ ـ آب؛ آهنگ زندگی', displayLabel: 'فصل ۳ ـ آب؛ آهنگ زندگی', line: 2329, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g10.chemistry1' }),
  seed({ ref: 'experimental.g11.chemistry2.chapter.2355', sourceRecordKey: 'src-e722c04e-d13c-4ef2-b5a9-b58dae21d438', rawText: 'فصل ۱ ـ قدر هدایای زمینی را بدانیم', displayLabel: 'فصل ۱ ـ قدر هدایای زمینی را بدانیم', line: 2355, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g11.chemistry2' }),
  seed({ ref: 'experimental.g11.chemistry2.chapter.2379', sourceRecordKey: 'src-bcf633b2-b648-4e64-be3a-71964e6c8557', rawText: 'فصل ۲ ـ در پی غذای سالم', displayLabel: 'فصل ۲ ـ در پی غذای سالم', line: 2379, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g11.chemistry2' }),
  seed({ ref: 'experimental.g11.chemistry2.chapter.2402', sourceRecordKey: 'src-67673103-1ea5-4f0d-8ad3-408a8290e86d', rawText: 'فصل ۳ ـ پوشاک، نیازی پایان‌ناپذیر', displayLabel: 'فصل ۳ ـ پوشاک، نیازی پایان‌ناپذیر', line: 2402, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g11.chemistry2' }),
  seed({ ref: 'experimental.g12.chemistry3.chapter.2426', sourceRecordKey: 'src-bc60cc4e-82bf-4093-8429-49ae10280887', rawText: 'فصل ۱ ـ مولکول‌ها در خدمت تندرستی', displayLabel: 'فصل ۱ ـ مولکول‌ها در خدمت تندرستی', line: 2426, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g12.chemistry3' }),
  seed({ ref: 'experimental.g12.chemistry3.chapter.2462', sourceRecordKey: 'src-93af678c-89e3-4805-aaf0-88b692b3997a', rawText: 'فصل ۲ ـ آسایش و رفاه در سایه شیمی', displayLabel: 'فصل ۲ ـ آسایش و رفاه در سایه شیمی', line: 2462, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g12.chemistry3' }),
  seed({ ref: 'experimental.g12.chemistry3.chapter.2500', sourceRecordKey: 'src-29f10895-cf6d-444f-b2b2-2a8d37a3d360', rawText: 'فصل ۳ ـ شیمی جلوه‌ای از هنر، زیبایی و ماندگاری', displayLabel: 'فصل ۳ ـ شیمی جلوه‌ای از هنر، زیبایی و ماندگاری', line: 2500, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g12.chemistry3' }),
  seed({ ref: 'experimental.g12.chemistry3.chapter.2532', sourceRecordKey: 'src-9c1f1edc-13da-4cd8-b077-5bd4561ca1c1', rawText: 'فصل ۴ ـ شیمی، راهی به سوی آینده‌ای روشن‌تر', displayLabel: 'فصل ۴ ـ شیمی، راهی به سوی آینده‌ای روشن‌تر', line: 2532, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g12.chemistry3' }),

  seed({ ref: 'experimental.g10.physics1.chapter.2653', sourceRecordKey: 'src-6d0f9f15-061f-4a36-8dbf-7bfde0b4ab12', rawText: 'فصل ۱ ـ فیزیک و اندازه‌گیری', displayLabel: 'فصل ۱ ـ فیزیک و اندازه‌گیری', line: 2653, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g10.physics1' }),
  seed({ ref: 'experimental.g10.physics1.chapter.2690', sourceRecordKey: 'src-0c8eeee9-5da5-4a35-a653-32c7ea07de11', rawText: 'فصل ۲ ـ ویژگی‌های فیزیکی مواد', displayLabel: 'فصل ۲ ـ ویژگی‌های فیزیکی مواد', line: 2690, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g10.physics1' }),
  seed({ ref: 'experimental.g10.physics1.chapter.2727', sourceRecordKey: 'src-4da404d5-021d-4716-8658-464941d194ed', rawText: 'فصل ۳ ـ کار، انرژی و توان', displayLabel: 'فصل ۳ ـ کار، انرژی و توان', line: 2727, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g10.physics1' }),
  seed({ ref: 'experimental.g10.physics1.chapter.2773', sourceRecordKey: 'src-24e507cf-252b-4a36-bc4a-43e68369cfbd', rawText: 'فصل ۴ ـ دما و گرما', displayLabel: 'فصل ۴ ـ دما و گرما', line: 2773, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g10.physics1' }),
  seed({ ref: 'experimental.g11.physics2.chapter.2814', sourceRecordKey: 'src-7361c203-a2ed-4fdb-a591-28084b0e2b0d', rawText: 'فصل ۱ ـ الکتریسیته ساکن', displayLabel: 'فصل ۱ ـ الکتریسیته ساکن', line: 2814, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g11.physics2' }),
  seed({ ref: 'experimental.g11.physics2.chapter.2877', sourceRecordKey: 'src-e2442816-1e92-4f80-8dfb-7d466b900020', rawText: 'فصل ۲ ـ جریان الکتریکی و مدارهای جریان مستقیم', displayLabel: 'فصل ۲ ـ جریان الکتریکی و مدارهای جریان مستقیم', line: 2877, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g11.physics2' }),
  seed({ ref: 'experimental.g11.physics2.chapter.2926', sourceRecordKey: 'src-a57e3a9a-3922-446c-8e53-3e7fa4797608', rawText: 'فصل ۳ ـ مغناطیس و القای الکترومغناطیسی', displayLabel: 'فصل ۳ ـ مغناطیس و القای الکترومغناطیسی', line: 2926, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g11.physics2' }),
  seed({ ref: 'experimental.g12.physics3.chapter.2998', sourceRecordKey: 'src-4308c49a-8fc9-4c09-a958-b7166d20b4c9', rawText: 'فصل ۱ ـ حرکت بر خط راست', displayLabel: 'فصل ۱ ـ حرکت بر خط راست', line: 2998, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g12.physics3' }),
  seed({ ref: 'experimental.g12.physics3.chapter.3034', sourceRecordKey: 'src-c0160c30-082d-4a78-b86d-15a771477852', rawText: 'فصل ۲ ـ دینامیک', displayLabel: 'فصل ۲ ـ دینامیک', line: 3034, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g12.physics3' }),
  seed({ ref: 'experimental.g12.physics3.chapter.3081', sourceRecordKey: 'src-7a5fd930-bc02-4ca8-ae80-1f2533f99ce5', rawText: 'فصل ۳ ـ نوسان و امواج', displayLabel: 'فصل ۳ ـ نوسان و امواج', line: 3081, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g12.physics3' }),
  seed({ ref: 'experimental.g12.physics3.chapter.3152', sourceRecordKey: 'src-6d26f83d-c458-4840-b2f9-e3b945f8636d', rawText: 'فصل ۴ ـ آشنایی با فیزیک اتمی و هسته‌ای', displayLabel: 'فصل ۴ ـ آشنایی با فیزیک اتمی و هسته‌ای', line: 3152, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g12.physics3' }),

  seed({ ref: 'experimental.g10.math1.chapter.3210', sourceRecordKey: 'src-8f34e28c-88eb-4557-b3eb-3abecfd5d3c0', rawText: 'فصل ۱ ـ مجموعه، الگو و دنباله', displayLabel: 'فصل ۱ ـ مجموعه، الگو و دنباله', line: 3210, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g10.math1' }),
  seed({ ref: 'experimental.g10.math1.chapter.3231', sourceRecordKey: 'src-a21fff62-c511-4ecb-a99b-a425b0e1c077', rawText: 'فصل ۲ ـ مثلثات', displayLabel: 'فصل ۲ ـ مثلثات', line: 3231, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g10.math1' }),
  seed({ ref: 'experimental.g10.math1.chapter.3250', sourceRecordKey: 'src-77e82a0a-ed25-4d6d-976d-dc5dbe89e974', rawText: 'فصل ۳ ـ توان‌های گویا و عبارت‌های جبری', displayLabel: 'فصل ۳ ـ توان‌های گویا و عبارت‌های جبری', line: 3250, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g10.math1' }),
  seed({ ref: 'experimental.g10.math1.chapter.3272', sourceRecordKey: 'src-5c483ac7-6cdc-4145-b68f-5a528edb04ae', rawText: 'فصل ۴ ـ معادله‌ها و نامعادله‌ها', displayLabel: 'فصل ۴ ـ معادله‌ها و نامعادله‌ها', line: 3272, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g10.math1' }),
  seed({ ref: 'experimental.g10.math1.chapter.3292', sourceRecordKey: 'src-38949195-3ad5-4483-a7af-d5bbc7047f4f', rawText: 'فصل ۵ ـ تابع', displayLabel: 'فصل ۵ ـ تابع', line: 3292, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g10.math1' }),
  seed({ ref: 'experimental.g10.math1.chapter.3313', sourceRecordKey: 'src-f565f6e9-0e8d-418b-bc34-3ff9a84fd5e4', rawText: 'فصل ۶ ـ شمارش، بدون شمردن', displayLabel: 'فصل ۶ ـ شمارش، بدون شمردن', line: 3313, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g10.math1' }),
  seed({ ref: 'experimental.g10.math1.chapter.3331', sourceRecordKey: 'src-9bed5e10-428a-41df-956e-595b07cb974a', rawText: 'فصل ۷ ـ آمار و احتمال', displayLabel: 'فصل ۷ ـ آمار و احتمال', line: 3331, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g10.math1' }),
  seed({ ref: 'experimental.g11.math2.chapter.3353', sourceRecordKey: 'src-3377c7c5-56f0-419b-97f8-d0ce9677d33b', rawText: 'فصل ۱ ـ هندسه تحلیلی و جبر', displayLabel: 'فصل ۱ ـ هندسه تحلیلی و جبر', line: 3353, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g11.math2' }),
  seed({ ref: 'experimental.g11.math2.chapter.3374', sourceRecordKey: 'src-f2f5ab2d-722c-4c34-9a1d-2e2426117208', rawText: 'فصل ۲ ـ هندسه', displayLabel: 'فصل ۲ ـ هندسه', line: 3374, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g11.math2' }),
  seed({ ref: 'experimental.g11.math2.chapter.3393', sourceRecordKey: 'src-cb6a33a5-f854-46f0-9877-034d88b8a07a', rawText: 'فصل ۳ ـ تابع', displayLabel: 'فصل ۳ ـ تابع', line: 3393, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g11.math2' }),
  seed({ ref: 'experimental.g11.math2.chapter.3414', sourceRecordKey: 'src-7bba44b0-321d-4f07-b0db-71bb4bb5cfda', rawText: 'فصل ۴ ـ مثلثات', displayLabel: 'فصل ۴ ـ مثلثات', line: 3414, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g11.math2' }),
  seed({ ref: 'experimental.g11.math2.chapter.3434', sourceRecordKey: 'src-5c8e6b9f-8135-4aae-a625-f9803595360d', rawText: 'فصل ۵ ـ توابع نمایی و لگاریتمی', displayLabel: 'فصل ۵ ـ توابع نمایی و لگاریتمی', line: 3434, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g11.math2' }),
  seed({ ref: 'experimental.g11.math2.chapter.3454', sourceRecordKey: 'src-05513381-666b-4eec-8538-b4291c4df49b', rawText: 'فصل ۶ ـ حد و پیوستگی', displayLabel: 'فصل ۶ ـ حد و پیوستگی', line: 3454, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g11.math2' }),
  seed({ ref: 'experimental.g11.math2.chapter.3473', sourceRecordKey: 'src-3c05d792-876f-4f8a-b192-fe4b5be63f79', rawText: 'فصل ۷ ـ آمار و احتمال', displayLabel: 'فصل ۷ ـ آمار و احتمال', line: 3473, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g11.math2' }),
  seed({ ref: 'experimental.g12.math3.chapter.3487', sourceRecordKey: 'src-5c34e4f1-2cb3-401a-b670-2dc2dc596763', rawText: 'فصل ۱ ـ تابع', displayLabel: 'فصل ۱ ـ تابع', line: 3487, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g12.math3' }),
  seed({ ref: 'experimental.g12.math3.chapter.3511', sourceRecordKey: 'src-6b0f9feb-b2a2-43dd-a231-4db6a99019c5', rawText: 'فصل ۲ ـ مثلثات', displayLabel: 'فصل ۲ ـ مثلثات', line: 3511, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g12.math3' }),
  seed({ ref: 'experimental.g12.math3.chapter.3530', sourceRecordKey: 'src-fe499d3e-d38a-41e2-b9a7-6d24704e6afb', rawText: 'فصل ۳ ـ حد بی‌نهایت و حد در بی‌نهایت', displayLabel: 'فصل ۳ ـ حد بی‌نهایت و حد در بی‌نهایت', line: 3530, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g12.math3' }),
  seed({ ref: 'experimental.g12.math3.chapter.3543', sourceRecordKey: 'src-001fc2b7-2c87-483a-bc4c-74eb67e88ffb', rawText: 'فصل ۴ ـ مشتق', displayLabel: 'فصل ۴ ـ مشتق', line: 3543, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g12.math3' }),
  seed({ ref: 'experimental.g12.math3.chapter.3563', sourceRecordKey: 'src-e030eb35-646c-463d-b75d-9be17ac679f6', rawText: 'فصل ۵ ـ کاربرد مشتق', displayLabel: 'فصل ۵ ـ کاربرد مشتق', line: 3563, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g12.math3' }),
  seed({ ref: 'experimental.g12.math3.chapter.3578', sourceRecordKey: 'src-de3c7930-48a6-4915-a5be-9373be8a67bf', rawText: 'فصل ۶ ـ هندسه', displayLabel: 'فصل ۶ ـ هندسه', line: 3578, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g12.math3' }),
  seed({ ref: 'experimental.g12.math3.chapter.3596', sourceRecordKey: 'src-e66d5619-afde-4b2a-97a3-260a58d6087e', rawText: 'فصل ۷ ـ احتمال', displayLabel: 'فصل ۷ ـ احتمال', line: 3596, proposedNodeTypeCode: 'CHAPTER', parentRef: 'experimental.g12.math3' }),
] as const

const sourceLine = (record: HumanSciencesCatalogRecord): number => {
  const match = /:L([0-9]+)$/.exec(record.sourceLocator)
  if (!match) throw new Error(`Invalid source locator: ${record.sourceLocator}`)
  return Number(match[1])
}

export const experimentalSciencesCatalog: readonly HumanSciencesCatalogRecord[] = [
  ...theoreticalCurriculumFoundationCatalog,
  ...experimentalSciencesSpecificCatalog,
].sort((left, right) => sourceLine(left) - sourceLine(right))

export const experimentalSciencesApplicability = theoreticalSharedApplicability

export const experimentalSciencesStructuralCounts = {
  'experimental.g10.biology1': { chapters: 0, lessons: 0 },
  'experimental.g11.biology2': { chapters: 0, lessons: 0 },
  'experimental.g12.biology3': { chapters: 0, lessons: 0 },
  'experimental.g10.chemistry1': { chapters: 3, lessons: 0 },
  'experimental.g11.chemistry2': { chapters: 3, lessons: 0 },
  'experimental.g12.chemistry3': { chapters: 4, lessons: 0 },
  'experimental.g10.physics1': { chapters: 4, lessons: 0 },
  'experimental.g11.physics2': { chapters: 3, lessons: 0 },
  'experimental.g12.physics3': { chapters: 4, lessons: 0 },
  'experimental.g10.math1': { chapters: 7, lessons: 0 },
  'experimental.g11.math2': { chapters: 7, lessons: 0 },
  'experimental.g12.math3': { chapters: 7, lessons: 0 },
  'experimental.g11.geology': { chapters: 0, lessons: 0 },
} as const

export const experimentalSciencesSourceAmbiguities = [
  {
    code: 'BIOLOGY_GRADE_PARENT_UNRESOLVED',
    sourceRange: 'CANONICAL_CURRICULUM.md:L1813-L2281',
    detail: 'Three biology chapter-number sequences have no explicit biology book or grade headings; they are excluded until reviewed ownership is supplied.',
  },
  {
    code: 'GEOLOGY_DETAIL_ABSENT',
    sourceRange: 'CANONICAL_CURRICULUM.md:L147',
    detail: 'The source identifies the Grade 11 geology subject but provides no detailed geology tree.',
  },
  {
    code: 'EXPERIMENTAL_MATH_THEMATIC_TREE_UNRESOLVED',
    sourceRange: 'CANONICAL_CURRICULUM.md:L3604-L3927',
    detail: 'The cross-grade thematic mathematics tree is not attached to grade-specific subjects without an explicit ownership decision.',
  },
] as const

const recordByRef = new Map<string, HumanSciencesCatalogRecord>(
  experimentalSciencesCatalog.map((record) => [record.ref, record]),
)

export const experimentalSciencesRecord = (ref: string): HumanSciencesCatalogRecord => {
  const record = recordByRef.get(ref)
  if (!record) throw new Error(`Unknown Experimental Sciences catalog reference: ${ref}`)
  return record
}

export const assertExperimentalSciencesTranscription = (transcription: string): void => {
  const lines = transcription.replace(/^\uFEFF/, '').split(/\r?\n/)
  for (const record of experimentalSciencesCatalog) {
    const line = sourceLine(record)
    if (lines[line - 1] !== record.rawText) {
      throw new Error(`Experimental Sciences source drift at ${record.sourceLocator}`)
    }
  }
}

export const createExperimentalSciencesManifestDraft = (input: {
  expectedRevision: number
  idempotencyKey: string
  transcriptionId?: string
}): CurriculumImportManifestDraft => {
  const byRef = new Map<string, string>(
    experimentalSciencesCatalog.map((record) => [record.ref, record.sourceRecordKey]),
  )
  return {
    expectedRevision: input.expectedRevision,
    idempotencyKey: input.idempotencyKey,
    manifestSchemaVersion: '1.0.0',
    records: experimentalSciencesCatalog.map((record, sourceOrder) => ({
      ambiguityMarkers: [],
      displayLabel: record.displayLabel,
      parentSourceRecordKey: record.parentRef ? byRef.get(record.parentRef) : null,
      proposedNodeTypeCode: record.proposedNodeTypeCode,
      rawText: record.rawText,
      sourceLocator: record.sourceLocator,
      sourceOrder,
      structuralHints: {},
      sourceRecordKey: record.sourceRecordKey,
    })),
    transcriptionId: input.transcriptionId ?? EXPERIMENTAL_SCIENCES_TRANSCRIPTION_ID,
  }
}
