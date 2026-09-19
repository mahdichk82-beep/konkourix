import type { CurriculumImportManifestDraft, CurriculumManifestRecordDraft } from '../types.js'

export const HUMAN_SCIENCES_TRANSCRIPTION_ID = 'CANONICAL_CURRICULUM.md#human-sciences-structural-import-v1'

export type HumanSciencesCatalogRecord = Readonly<{
  ref: string
  sourceRecordKey: string
  rawText: string
  displayLabel: string
  sourceLocator: string
  proposedNodeTypeCode: NonNullable<CurriculumManifestRecordDraft['proposedNodeTypeCode']>
  parentRef: string | null
}>

export type HumanSciencesApplicability = Readonly<{
  sourceRef: string
  targetRef: string
  type: 'APPLICABILITY'
}>

export const humanSciencesCatalog = [
  {
    "ref": "root",
    "sourceRecordKey": "src-56c61426-66ec-4e0b-abf3-7dc485071450",
    "rawText": "Curriculum",
    "displayLabel": "Curriculum",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L86",
    "proposedNodeTypeCode": "CURRICULUM_ROOT",
    "parentRef": null
  },
  {
    "ref": "shared",
    "sourceRecordKey": "src-c67bc0cc-bb2d-44c7-a5de-b52121b4e1e4",
    "rawText": "├── دروس مشترک پایه‌های دهم، یازدهم و دوازدهم",
    "displayLabel": "دروس مشترک پایه‌های دهم، یازدهم و دوازدهم",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L87",
    "proposedNodeTypeCode": "FIELD",
    "parentRef": "root"
  },
  {
    "ref": "shared.g10",
    "sourceRecordKey": "src-76fc241e-f7e7-4d80-8d19-96d698b08fd9",
    "rawText": "│   ├── دهم",
    "displayLabel": "دهم",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L88",
    "proposedNodeTypeCode": "GRADE",
    "parentRef": "shared"
  },
  {
    "ref": "shared.g10.persian",
    "sourceRecordKey": "src-851fbf8e-9691-42ea-89f2-dac235434d92",
    "rawText": "│   │   ├── فارسی ۱",
    "displayLabel": "فارسی ۱",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L89",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "shared.g10"
  },
  {
    "ref": "shared.g10.arabic",
    "sourceRecordKey": "src-7acb021c-3471-4a41-a6c5-11a32bcc3552",
    "rawText": "│   │   ├── عربی، زبان قرآن ۱",
    "displayLabel": "عربی، زبان قرآن ۱",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L91",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "shared.g10"
  },
  {
    "ref": "shared.g10.religion",
    "sourceRecordKey": "src-d7eb2ae4-b7c9-4052-b2d6-d1d7e7ad48cf",
    "rawText": "│   │   ├── دین و زندگی ۱",
    "displayLabel": "دین و زندگی ۱",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L92",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "shared.g10"
  },
  {
    "ref": "shared.g10.english",
    "sourceRecordKey": "src-e6eb9590-310f-4232-80f7-ac0e534bdc6a",
    "rawText": "│   │   ├── زبان انگلیسی ۱",
    "displayLabel": "زبان انگلیسی ۱",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L93",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "shared.g10"
  },
  {
    "ref": "shared.g11",
    "sourceRecordKey": "src-29ad8db1-7088-4b9b-9e63-be6ffee38ae3",
    "rawText": "│   ├── یازدهم",
    "displayLabel": "یازدهم",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L97",
    "proposedNodeTypeCode": "GRADE",
    "parentRef": "shared"
  },
  {
    "ref": "shared.g11.persian",
    "sourceRecordKey": "src-43bc4c27-12c5-42a4-a624-467fb8c69222",
    "rawText": "│   │   ├── فارسی ۲",
    "displayLabel": "فارسی ۲",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L98",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "shared.g11"
  },
  {
    "ref": "shared.g11.arabic",
    "sourceRecordKey": "src-0e446c32-53bc-4dab-b2d3-c2b9e7d98f9c",
    "rawText": "│   │   ├── عربی، زبان قرآن ۲",
    "displayLabel": "عربی، زبان قرآن ۲",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L100",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "shared.g11"
  },
  {
    "ref": "shared.g11.religion",
    "sourceRecordKey": "src-6bc8e80b-2da0-46f0-85a3-76ca49f73e94",
    "rawText": "│   │   ├── دین و زندگی ۲",
    "displayLabel": "دین و زندگی ۲",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L101",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "shared.g11"
  },
  {
    "ref": "shared.g11.english",
    "sourceRecordKey": "src-5fe0cc01-9715-41a5-b99e-83242c4aef0e",
    "rawText": "│   │   ├── زبان انگلیسی ۲",
    "displayLabel": "زبان انگلیسی ۲",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L102",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "shared.g11"
  },
  {
    "ref": "shared.g12",
    "sourceRecordKey": "src-a884aaee-2e87-48ec-8eaa-de153df799cd",
    "rawText": "│   └── دوازدهم",
    "displayLabel": "دوازدهم",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L104",
    "proposedNodeTypeCode": "GRADE",
    "parentRef": "shared"
  },
  {
    "ref": "shared.g12.persian",
    "sourceRecordKey": "src-0475f1ec-ec47-4126-831a-1af5597d67ee",
    "rawText": "│       ├── فارسی ۳",
    "displayLabel": "فارسی ۳",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L105",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "shared.g12"
  },
  {
    "ref": "shared.g12.arabic",
    "sourceRecordKey": "src-35bf339e-0a5a-41c6-9556-702d962b4051",
    "rawText": "│       ├── عربی، زبان قرآن ۳",
    "displayLabel": "عربی، زبان قرآن ۳",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L107",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "shared.g12"
  },
  {
    "ref": "shared.g12.religion",
    "sourceRecordKey": "src-eeb22964-4a5f-4978-b6d2-e75dbfca43f2",
    "rawText": "│       ├── دین و زندگی ۳",
    "displayLabel": "دین و زندگی ۳",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L108",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "shared.g12"
  },
  {
    "ref": "shared.g12.english",
    "sourceRecordKey": "src-bd691c76-c45c-4a1c-bdd6-2897bc5de626",
    "rawText": "│       ├── زبان انگلیسی ۳",
    "displayLabel": "زبان انگلیسی ۳",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L109",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "shared.g12"
  },
  {
    "ref": "mathematics",
    "sourceRecordKey": "src-bec928f5-36ed-4252-aca6-93fcbed558ae",
    "rawText": "├── دروس اختصاصی رشته ریاضی‌فیزیک",
    "displayLabel": "دروس اختصاصی رشته ریاضی‌فیزیک",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L112",
    "proposedNodeTypeCode": "FIELD",
    "parentRef": "root"
  },
  {
    "ref": "mathematics.g10",
    "sourceRecordKey": "src-fbc9b2fe-7a44-4e6b-95ad-5646d86f87f7",
    "rawText": "│   ├── دهم",
    "displayLabel": "دهم",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L113",
    "proposedNodeTypeCode": "GRADE",
    "parentRef": "mathematics"
  },
  {
    "ref": "mathematics.g11",
    "sourceRecordKey": "src-11729ac0-c568-4ee6-ac01-b5e693380888",
    "rawText": "│   ├── یازدهم",
    "displayLabel": "یازدهم",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L121",
    "proposedNodeTypeCode": "GRADE",
    "parentRef": "mathematics"
  },
  {
    "ref": "mathematics.g12",
    "sourceRecordKey": "src-bb19f8be-79cc-47e4-90f3-3dda2ca8dc9a",
    "rawText": "│   └── دوازدهم",
    "displayLabel": "دوازدهم",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L127",
    "proposedNodeTypeCode": "GRADE",
    "parentRef": "mathematics"
  },
  {
    "ref": "experimental",
    "sourceRecordKey": "src-2df06a9f-95c8-47d6-8c9d-d91581430cbd",
    "rawText": "├── دروس اختصاصی رشته علوم تجربی",
    "displayLabel": "دروس اختصاصی رشته علوم تجربی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L133",
    "proposedNodeTypeCode": "FIELD",
    "parentRef": "root"
  },
  {
    "ref": "experimental.g10",
    "sourceRecordKey": "src-d751d4e7-8927-4667-ae6c-c8dc170c1f83",
    "rawText": "│   ├── دهم",
    "displayLabel": "دهم",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L134",
    "proposedNodeTypeCode": "GRADE",
    "parentRef": "experimental"
  },
  {
    "ref": "experimental.g11",
    "sourceRecordKey": "src-9f78dddd-ef81-4492-8fe9-22cb2cf019d0",
    "rawText": "│   ├── یازدهم",
    "displayLabel": "یازدهم",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L142",
    "proposedNodeTypeCode": "GRADE",
    "parentRef": "experimental"
  },
  {
    "ref": "experimental.g12",
    "sourceRecordKey": "src-12763dd5-4033-46e5-89c4-3972c1e1758b",
    "rawText": "│   └── دوازدهم",
    "displayLabel": "دوازدهم",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L148",
    "proposedNodeTypeCode": "GRADE",
    "parentRef": "experimental"
  },
  {
    "ref": "human",
    "sourceRecordKey": "src-a072a637-0b5e-4c6a-a539-ea309bf52f34",
    "rawText": "└── دروس اختصاصی رشته علوم انسانی",
    "displayLabel": "دروس اختصاصی رشته علوم انسانی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L153",
    "proposedNodeTypeCode": "FIELD",
    "parentRef": "root"
  },
  {
    "ref": "human.g10",
    "sourceRecordKey": "src-ab743a9a-3a86-4064-9451-95a83f6d1912",
    "rawText": "    ├── دهم",
    "displayLabel": "دهم",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L154",
    "proposedNodeTypeCode": "GRADE",
    "parentRef": "human"
  },
  {
    "ref": "human.g10.literary",
    "sourceRecordKey": "src-2ab76906-af02-4119-8ff0-7fd370876d8b",
    "rawText": "    │   ├── علوم و فنون ادبی ۱",
    "displayLabel": "علوم و فنون ادبی ۱",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L155",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "human.g10"
  },
  {
    "ref": "human.g10.sociology",
    "sourceRecordKey": "src-c1ce90d2-9ac8-405c-bb76-9640619b9ae2",
    "rawText": "    │   ├── جامعه‌شناسی ۱",
    "displayLabel": "جامعه‌شناسی ۱",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L156",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "human.g10"
  },
  {
    "ref": "human.g10.logic",
    "sourceRecordKey": "src-7c253b1f-1ac8-4221-8f19-68aac9dd8510",
    "rawText": "    │   ├── منطق",
    "displayLabel": "منطق",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L157",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "human.g10"
  },
  {
    "ref": "human.g10.economics",
    "sourceRecordKey": "src-75cad149-9833-48e6-8837-3bbec8ab14a1",
    "rawText": "    │   ├── اقتصاد",
    "displayLabel": "اقتصاد",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L158",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "human.g10"
  },
  {
    "ref": "human.g10.mathstats",
    "sourceRecordKey": "src-c0ba30a8-f184-4ddc-805c-68f56d3ce697",
    "rawText": "    │   ├── ریاضی و آمار ۱",
    "displayLabel": "ریاضی و آمار ۱",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L159",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "human.g10"
  },
  {
    "ref": "human.g10.history",
    "sourceRecordKey": "src-e77242ab-c613-472b-96a3-57f4816c1c74",
    "rawText": "    │   ├── تاریخ ۱",
    "displayLabel": "تاریخ ۱",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L160",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "human.g10"
  },
  {
    "ref": "human.g10.geography",
    "sourceRecordKey": "src-333b245e-1840-4325-bca7-79b91ad37e26",
    "rawText": "    │   └── جغرافیای ایران",
    "displayLabel": "جغرافیای ایران",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L161",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "human.g10"
  },
  {
    "ref": "human.g11",
    "sourceRecordKey": "src-306abbf2-b327-4170-9a9b-208b9fb4291c",
    "rawText": "    ├── یازدهم",
    "displayLabel": "یازدهم",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L162",
    "proposedNodeTypeCode": "GRADE",
    "parentRef": "human"
  },
  {
    "ref": "human.g11.literary",
    "sourceRecordKey": "src-239c1d8b-6eaf-49dd-acd5-8cd4d522da7f",
    "rawText": "    │   ├── علوم و فنون ادبی ۲",
    "displayLabel": "علوم و فنون ادبی ۲",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L163",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "human.g11"
  },
  {
    "ref": "human.g11.sociology",
    "sourceRecordKey": "src-f9e1daf7-bc90-4abd-ba48-dbbd66a663de",
    "rawText": "    │   ├── جامعه‌شناسی ۲",
    "displayLabel": "جامعه‌شناسی ۲",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L164",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "human.g11"
  },
  {
    "ref": "human.g11.psychology",
    "sourceRecordKey": "src-61fa4d3d-7af0-4ea8-aaf3-5043971ba98d",
    "rawText": "    │   ├── روان‌شناسی",
    "displayLabel": "روان‌شناسی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L165",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "human.g11"
  },
  {
    "ref": "human.g11.philosophy",
    "sourceRecordKey": "src-493b4d35-7938-42f5-bf56-54ea4148c88e",
    "rawText": "    │   ├── فلسفه ۱",
    "displayLabel": "فلسفه ۱",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L166",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "human.g11"
  },
  {
    "ref": "human.g11.mathstats",
    "sourceRecordKey": "src-24a2092d-6695-4b80-8eab-665e02c20c10",
    "rawText": "    │   ├── ریاضی و آمار ۲",
    "displayLabel": "ریاضی و آمار ۲",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L167",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "human.g11"
  },
  {
    "ref": "human.g11.history",
    "sourceRecordKey": "src-42434386-5ace-4118-8b49-a15cc398ced2",
    "rawText": "    │   ├── تاریخ ۲",
    "displayLabel": "تاریخ ۲",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L168",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "human.g11"
  },
  {
    "ref": "human.g11.geography",
    "sourceRecordKey": "src-7689d235-95ba-4b8a-bd7e-b7ef1836db55",
    "rawText": "    │   └── جغرافیا ۲",
    "displayLabel": "جغرافیا ۲",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L169",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "human.g11"
  },
  {
    "ref": "human.g12",
    "sourceRecordKey": "src-f42dbe81-c921-43a5-a476-0d929bf5d5de",
    "rawText": "    └── دوازدهم",
    "displayLabel": "دوازدهم",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L170",
    "proposedNodeTypeCode": "GRADE",
    "parentRef": "human"
  },
  {
    "ref": "human.g12.literary",
    "sourceRecordKey": "src-6ce15664-8f90-406e-bd6a-3011e8e352cd",
    "rawText": "        ├── علوم و فنون ادبی ۳",
    "displayLabel": "علوم و فنون ادبی ۳",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L171",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "human.g12"
  },
  {
    "ref": "human.g12.sociology",
    "sourceRecordKey": "src-28036aff-b71f-42f0-8107-edb0ca2453a0",
    "rawText": "        ├── جامعه‌شناسی ۳",
    "displayLabel": "جامعه‌شناسی ۳",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L172",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "human.g12"
  },
  {
    "ref": "human.g12.philosophy",
    "sourceRecordKey": "src-abadd6b5-0b25-486a-96f7-04c85e56e80e",
    "rawText": "        ├── فلسفه ۲",
    "displayLabel": "فلسفه ۲",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L173",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "human.g12"
  },
  {
    "ref": "human.g12.mathstats",
    "sourceRecordKey": "src-600a17b7-cf40-4818-be87-8fe8d0f05eae",
    "rawText": "        ├── ریاضی و آمار ۳",
    "displayLabel": "ریاضی و آمار ۳",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L174",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "human.g12"
  },
  {
    "ref": "human.g12.history",
    "sourceRecordKey": "src-e3b0f351-5915-4c58-b492-b0bb6e2438e6",
    "rawText": "        ├── تاریخ ۳",
    "displayLabel": "تاریخ ۳",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L175",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "human.g12"
  },
  {
    "ref": "human.g12.geography",
    "sourceRecordKey": "src-b90a5355-fa72-462c-b263-6f940126c5ce",
    "rawText": "        └── جغرافیا ۳",
    "displayLabel": "جغرافیا ۳",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L176",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "human.g12"
  },
  {
    "ref": "shared.g10.arabic.lesson.186",
    "sourceRecordKey": "src-a0db56dc-385d-4d36-b312-a52760f48690",
    "rawText": "درس ۱ ـ ذاکَ هُوَ الله",
    "displayLabel": "درس ۱ ـ ذاکَ هُوَ الله",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L186",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.arabic"
  },
  {
    "ref": "shared.g10.arabic.lesson.212",
    "sourceRecordKey": "src-45a07364-95d6-433f-ad04-b8f8f9ba605e",
    "rawText": "درس ۲ ـ المَواعِظُ العَدَدیَّة",
    "displayLabel": "درس ۲ ـ المَواعِظُ العَدَدیَّة",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L212",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.arabic"
  },
  {
    "ref": "shared.g10.arabic.lesson.235",
    "sourceRecordKey": "src-ad29dd50-7fe8-4d99-889a-fb6100385ec9",
    "rawText": "درس ۳ ـ مَطَرُ السَّمَک",
    "displayLabel": "درس ۳ ـ مَطَرُ السَّمَک",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L235",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.arabic"
  },
  {
    "ref": "shared.g10.arabic.lesson.259",
    "sourceRecordKey": "src-b48b8f1f-92eb-46ef-8360-32c3b4f91c49",
    "rawText": "درس ۴ ـ التَّعایُشُ السِّلمی",
    "displayLabel": "درس ۴ ـ التَّعایُشُ السِّلمی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L259",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.arabic"
  },
  {
    "ref": "shared.g10.arabic.lesson.283",
    "sourceRecordKey": "src-88736221-196a-4ef8-b892-6c67109a992d",
    "rawText": "درس ۵ ـ هذا خَلقُ الله",
    "displayLabel": "درس ۵ ـ هذا خَلقُ الله",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L283",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.arabic"
  },
  {
    "ref": "shared.g10.arabic.lesson.311",
    "sourceRecordKey": "src-206a6250-5e4a-4bf8-9691-905f18798844",
    "rawText": "درس ۶ ـ ذوالقَرنَین",
    "displayLabel": "درس ۶ ـ ذوالقَرنَین",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L311",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.arabic"
  },
  {
    "ref": "shared.g10.arabic.lesson.334",
    "sourceRecordKey": "src-ee07a306-e8a6-41ed-9a7b-0571b8022007",
    "rawText": "درس ۷ ـ یا مَن فی البِحارِ عَجائِبُه",
    "displayLabel": "درس ۷ ـ یا مَن فی البِحارِ عَجائِبُه",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L334",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.arabic"
  },
  {
    "ref": "shared.g10.arabic.lesson.362",
    "sourceRecordKey": "src-ea4a2b17-2c4c-40a0-9d92-4088157ff581",
    "rawText": "درس ۸ ـ صِناعَةُ التَّلمیعِ فی الأَدَبِ الفارِسی",
    "displayLabel": "درس ۸ ـ صِناعَةُ التَّلمیعِ فی الأَدَبِ الفارِسی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L362",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.arabic"
  },
  {
    "ref": "shared.g11.arabic.lesson.389",
    "sourceRecordKey": "src-04ba8e67-9df0-4455-bd1d-ecfb19bbb262",
    "rawText": "درس ۱ ـ مِن آیاتِ الأخلاق",
    "displayLabel": "درس ۱ ـ مِن آیاتِ الأخلاق",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L389",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.arabic"
  },
  {
    "ref": "shared.g11.arabic.lesson.418",
    "sourceRecordKey": "src-55798b93-1f73-4533-9356-535e4ec1caf3",
    "rawText": "درس ۲ ـ فی مَحضَرِ المُعَلِّم",
    "displayLabel": "درس ۲ ـ فی مَحضَرِ المُعَلِّم",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L418",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.arabic"
  },
  {
    "ref": "shared.g11.arabic.lesson.444",
    "sourceRecordKey": "src-61c85125-cd4e-4e5f-8577-7b44b4249f9a",
    "rawText": "درس ۳ ـ عَجائِبُ الأشجار",
    "displayLabel": "درس ۳ ـ عَجائِبُ الأشجار",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L444",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.arabic"
  },
  {
    "ref": "shared.g11.arabic.lesson.470",
    "sourceRecordKey": "src-ce270aa6-2e56-427d-89e8-b66f3f5a2c34",
    "rawText": "درس ۴ ـ آدابُ الکَلام",
    "displayLabel": "درس ۴ ـ آدابُ الکَلام",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L470",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.arabic"
  },
  {
    "ref": "shared.g11.arabic.lesson.493",
    "sourceRecordKey": "src-10c73cd9-fa7c-422a-a1be-e91c6c013b33",
    "rawText": "درس ۵ ـ الکَذِبُ مِفتاحٌ لِکُلِّ شَرّ",
    "displayLabel": "درس ۵ ـ الکَذِبُ مِفتاحٌ لِکُلِّ شَرّ",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L493",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.arabic"
  },
  {
    "ref": "shared.g11.arabic.lesson.516",
    "sourceRecordKey": "src-21ad25e2-ed12-4bdb-b4ae-f5f09d85b379",
    "rawText": "درس ۶ ـ آنّه ماری شیمل",
    "displayLabel": "درس ۶ ـ آنّه ماری شیمل",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L516",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.arabic"
  },
  {
    "ref": "shared.g11.arabic.lesson.539",
    "sourceRecordKey": "src-6e4ecc31-34d4-4c2e-b701-958bcbfcc995",
    "rawText": "درس ۷ ـ تأثیرُ اللُّغَةِ الفارسیَّةِ عَلَی اللُّغَةِ العَرَبیَّة",
    "displayLabel": "درس ۷ ـ تأثیرُ اللُّغَةِ الفارسیَّةِ عَلَی اللُّغَةِ العَرَبیَّة",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L539",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.arabic"
  },
  {
    "ref": "shared.g12.arabic.lesson.566",
    "sourceRecordKey": "src-58cbe606-3d38-4c48-aba1-c8e762608597",
    "rawText": "درس ۱ ـ الدّینُ وَ التَّدَیُّن",
    "displayLabel": "درس ۱ ـ الدّینُ وَ التَّدَیُّن",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L566",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g12.arabic"
  },
  {
    "ref": "shared.g12.arabic.lesson.594",
    "sourceRecordKey": "src-019c07e3-86e6-4198-89c8-da8dea9bbe30",
    "rawText": "درس ۲ ـ مَکَّةُ المُکَرَّمَةُ وَ المَدینَةُ المُنَوَّرَة",
    "displayLabel": "درس ۲ ـ مَکَّةُ المُکَرَّمَةُ وَ المَدینَةُ المُنَوَّرَة",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L594",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g12.arabic"
  },
  {
    "ref": "shared.g12.arabic.lesson.619",
    "sourceRecordKey": "src-02003c01-09fe-45cd-b5e9-2c6206f0b00f",
    "rawText": "درس ۳ ـ الکُتُبُ طَعامُ الفِکر",
    "displayLabel": "درس ۳ ـ الکُتُبُ طَعامُ الفِکر",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L619",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g12.arabic"
  },
  {
    "ref": "shared.g12.arabic.lesson.646",
    "sourceRecordKey": "src-f88799e4-2a3d-4573-8949-c17e966f0656",
    "rawText": "درس ۴ ـ الفَرَزدَق",
    "displayLabel": "درس ۴ ـ الفَرَزدَق",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L646",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g12.arabic"
  },
  {
    "ref": "shared.g10.persian.chapter.1033",
    "sourceRecordKey": "src-93bb4a90-8da4-45fc-aa2c-1e8bfee30c27",
    "rawText": "فصل ۱ ـ ادبیات تعلیمی",
    "displayLabel": "فصل ۱ ـ ادبیات تعلیمی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1033",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "shared.g10.persian"
  },
  {
    "ref": "shared.g10.persian.lesson.1035",
    "sourceRecordKey": "src-67cff18f-27a7-4915-a068-052996f0e08e",
    "rawText": "├── درس ۱ ـ چشمه",
    "displayLabel": "درس ۱ ـ چشمه",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1035",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.persian.chapter.1033"
  },
  {
    "ref": "shared.g10.persian.lesson.1040",
    "sourceRecordKey": "src-19deeac7-eaed-4417-a97c-c3e3753173a5",
    "rawText": "└── درس ۲ ـ از آموختن، ننگ مدار",
    "displayLabel": "درس ۲ ـ از آموختن، ننگ مدار",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1040",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.persian.chapter.1033"
  },
  {
    "ref": "shared.g10.persian.chapter.1044",
    "sourceRecordKey": "src-8955db87-2564-4534-81ad-a9e808050dfd",
    "rawText": "فصل ۲ ـ ادبیات پایداری",
    "displayLabel": "فصل ۲ ـ ادبیات پایداری",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1044",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "shared.g10.persian"
  },
  {
    "ref": "shared.g10.persian.lesson.1046",
    "sourceRecordKey": "src-a2fd0f5c-c82f-4700-b4e7-25b452902d31",
    "rawText": "├── درس ۳ ـ پاسداری از حقیقت",
    "displayLabel": "درس ۳ ـ پاسداری از حقیقت",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1046",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.persian.chapter.1044"
  },
  {
    "ref": "shared.g10.persian.lesson.1051",
    "sourceRecordKey": "src-aadcea5c-71fa-40bd-91d8-61b385e4cef2",
    "rawText": "├── درس ۴ ـ درس آزاد: ادبیات بومی ۱",
    "displayLabel": "درس ۴ ـ درس آزاد: ادبیات بومی ۱",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1051",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.persian.chapter.1044"
  },
  {
    "ref": "shared.g10.persian.lesson.1055",
    "sourceRecordKey": "src-25bfe9e5-65a6-421a-b653-00ece7211bb6",
    "rawText": "└── درس ۵ ـ بیداد ظالمان",
    "displayLabel": "درس ۵ ـ بیداد ظالمان",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1055",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.persian.chapter.1044"
  },
  {
    "ref": "shared.g10.persian.chapter.1059",
    "sourceRecordKey": "src-5a66be16-600a-4663-8e4b-c8c7c45c537f",
    "rawText": "فصل ۳ ـ ادبیات غنایی",
    "displayLabel": "فصل ۳ ـ ادبیات غنایی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1059",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "shared.g10.persian"
  },
  {
    "ref": "shared.g10.persian.lesson.1061",
    "sourceRecordKey": "src-37e4fe85-ff64-4e82-86cc-7274fb392509",
    "rawText": "├── درس ۶ ـ مهر و وفا",
    "displayLabel": "درس ۶ ـ مهر و وفا",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1061",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.persian.chapter.1059"
  },
  {
    "ref": "shared.g10.persian.lesson.1066",
    "sourceRecordKey": "src-562be107-b1b9-4174-a723-096d0967de9f",
    "rawText": "└── درس ۷ ـ جمال و کمال",
    "displayLabel": "درس ۷ ـ جمال و کمال",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1066",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.persian.chapter.1059"
  },
  {
    "ref": "shared.g10.persian.chapter.1070",
    "sourceRecordKey": "src-88035e57-8820-40b7-8b70-546dc9f94590",
    "rawText": "فصل ۴ ـ ادبیات سفر و زندگی",
    "displayLabel": "فصل ۴ ـ ادبیات سفر و زندگی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1070",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "shared.g10.persian"
  },
  {
    "ref": "shared.g10.persian.lesson.1072",
    "sourceRecordKey": "src-cc62b5a0-4f5c-4a7d-930d-c102a5015d4a",
    "rawText": "├── درس ۸ ـ سفر به بصره",
    "displayLabel": "درس ۸ ـ سفر به بصره",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1072",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.persian.chapter.1070"
  },
  {
    "ref": "shared.g10.persian.lesson.1077",
    "sourceRecordKey": "src-ffe883d5-f912-4990-b129-671a457d0254",
    "rawText": "└── درس ۹ ـ کلاس نقاشی",
    "displayLabel": "درس ۹ ـ کلاس نقاشی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1077",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.persian.chapter.1070"
  },
  {
    "ref": "shared.g10.persian.chapter.1081",
    "sourceRecordKey": "src-69800373-004b-4e30-89f1-9deb646a8f51",
    "rawText": "فصل ۵ ـ ادبیات انقلاب اسلامی",
    "displayLabel": "فصل ۵ ـ ادبیات انقلاب اسلامی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1081",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "shared.g10.persian"
  },
  {
    "ref": "shared.g10.persian.lesson.1083",
    "sourceRecordKey": "src-a1f96601-54db-4aa6-8aa6-96ab122f72ab",
    "rawText": "├── درس ۱۰ ـ دریادلان صف‌شکن",
    "displayLabel": "درس ۱۰ ـ دریادلان صف‌شکن",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1083",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.persian.chapter.1081"
  },
  {
    "ref": "shared.g10.persian.lesson.1088",
    "sourceRecordKey": "src-545521b4-6448-4f7e-94b0-1283635cb509",
    "rawText": "└── درس ۱۱ ـ خاک آزادگان",
    "displayLabel": "درس ۱۱ ـ خاک آزادگان",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1088",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.persian.chapter.1081"
  },
  {
    "ref": "shared.g10.persian.chapter.1092",
    "sourceRecordKey": "src-14736184-a67d-4b02-9477-fbc389d46aa4",
    "rawText": "فصل ۶ ـ ادبیات حماسی",
    "displayLabel": "فصل ۶ ـ ادبیات حماسی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1092",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "shared.g10.persian"
  },
  {
    "ref": "shared.g10.persian.lesson.1094",
    "sourceRecordKey": "src-9e203f3e-51b2-4003-a49d-3fa0e9a17d83",
    "rawText": "├── درس ۱۲ ـ رستم و اشکبوس",
    "displayLabel": "درس ۱۲ ـ رستم و اشکبوس",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1094",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.persian.chapter.1092"
  },
  {
    "ref": "shared.g10.persian.lesson.1099",
    "sourceRecordKey": "src-3d74db3d-eff5-497b-8abb-bb55b0700b96",
    "rawText": "└── درس ۱۳ ـ گردآفرید",
    "displayLabel": "درس ۱۳ ـ گردآفرید",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1099",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.persian.chapter.1092"
  },
  {
    "ref": "shared.g10.persian.chapter.1103",
    "sourceRecordKey": "src-b9364658-c38f-4383-a9d8-39d3c1c1ca71",
    "rawText": "فصل ۷ ـ ادبیات داستانی",
    "displayLabel": "فصل ۷ ـ ادبیات داستانی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1103",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "shared.g10.persian"
  },
  {
    "ref": "shared.g10.persian.lesson.1105",
    "sourceRecordKey": "src-4bcc4516-d500-4ed5-a3b2-0810bbbfdcdd",
    "rawText": "├── درس ۱۴ ـ طوطی و بقال",
    "displayLabel": "درس ۱۴ ـ طوطی و بقال",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1105",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.persian.chapter.1103"
  },
  {
    "ref": "shared.g10.persian.lesson.1110",
    "sourceRecordKey": "src-99990cb6-4377-4434-8abc-8e9094c8ab8c",
    "rawText": "├── درس ۱۵ ـ درس آزاد: ادبیات بومی ۲",
    "displayLabel": "درس ۱۵ ـ درس آزاد: ادبیات بومی ۲",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1110",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.persian.chapter.1103"
  },
  {
    "ref": "shared.g10.persian.lesson.1114",
    "sourceRecordKey": "src-488e83bc-c7db-4dcb-9686-21fd9fabfa5d",
    "rawText": "└── درس ۱۶ ـ خسرو",
    "displayLabel": "درس ۱۶ ـ خسرو",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1114",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.persian.chapter.1103"
  },
  {
    "ref": "shared.g10.persian.chapter.1118",
    "sourceRecordKey": "src-bd8a4d31-d1aa-4ab3-aaf6-152cf5d3bfbe",
    "rawText": "فصل ۸ ـ ادبیات جهان",
    "displayLabel": "فصل ۸ ـ ادبیات جهان",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1118",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "shared.g10.persian"
  },
  {
    "ref": "shared.g10.persian.lesson.1120",
    "sourceRecordKey": "src-ac8dabab-6745-4e8a-a9dc-c93b936a8b39",
    "rawText": "├── درس ۱۷ ـ سپیده‌دم",
    "displayLabel": "درس ۱۷ ـ سپیده‌دم",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1120",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.persian.chapter.1118"
  },
  {
    "ref": "shared.g10.persian.lesson.1125",
    "sourceRecordKey": "src-deb48037-5de8-4b88-9c56-a1e59682c510",
    "rawText": "└── درس ۱۸ ـ عظمت نگاه",
    "displayLabel": "درس ۱۸ ـ عظمت نگاه",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1125",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.persian.chapter.1118"
  },
  {
    "ref": "shared.g11.persian.chapter.1131",
    "sourceRecordKey": "src-2869b952-eab8-4a36-ad9c-777d3734c155",
    "rawText": "فصل ۱ ـ ادبیات تعلیمی",
    "displayLabel": "فصل ۱ ـ ادبیات تعلیمی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1131",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "shared.g11.persian"
  },
  {
    "ref": "shared.g11.persian.lesson.1133",
    "sourceRecordKey": "src-b360c485-86b1-4e9f-96d1-72c581165592",
    "rawText": "├── درس ۱ ـ نیکی",
    "displayLabel": "درس ۱ ـ نیکی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1133",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.persian.chapter.1131"
  },
  {
    "ref": "shared.g11.persian.lesson.1138",
    "sourceRecordKey": "src-e4ec3a2c-262a-4370-b509-e4f729983f7a",
    "rawText": "└── درس ۲ ـ قاضی بُست",
    "displayLabel": "درس ۲ ـ قاضی بُست",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1138",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.persian.chapter.1131"
  },
  {
    "ref": "shared.g11.persian.chapter.1142",
    "sourceRecordKey": "src-baff554f-88f1-4d12-a9f9-c1e4c8a3d92a",
    "rawText": "فصل ۲ ـ ادبیات پایداری",
    "displayLabel": "فصل ۲ ـ ادبیات پایداری",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1142",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "shared.g11.persian"
  },
  {
    "ref": "shared.g11.persian.lesson.1144",
    "sourceRecordKey": "src-acea7ebe-f1a0-47eb-838a-86938f2b7275",
    "rawText": "├── درس ۳ ـ در امواج سند",
    "displayLabel": "درس ۳ ـ در امواج سند",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1144",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.persian.chapter.1142"
  },
  {
    "ref": "shared.g11.persian.lesson.1149",
    "sourceRecordKey": "src-bd2eaeec-d58d-442d-87bb-fe137152ba69",
    "rawText": "├── درس ۴ ـ درس آزاد: ادبیات بومی ۱",
    "displayLabel": "درس ۴ ـ درس آزاد: ادبیات بومی ۱",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1149",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.persian.chapter.1142"
  },
  {
    "ref": "shared.g11.persian.lesson.1153",
    "sourceRecordKey": "src-936e34b0-b611-42ee-a5ba-240795107d5c",
    "rawText": "└── درس ۵ ـ آغازگری تنها",
    "displayLabel": "درس ۵ ـ آغازگری تنها",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1153",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.persian.chapter.1142"
  },
  {
    "ref": "shared.g11.persian.chapter.1157",
    "sourceRecordKey": "src-1e6c90f6-4e08-410e-a945-927941f22618",
    "rawText": "فصل ۳ ـ ادبیات غنایی",
    "displayLabel": "فصل ۳ ـ ادبیات غنایی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1157",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "shared.g11.persian"
  },
  {
    "ref": "shared.g11.persian.lesson.1159",
    "sourceRecordKey": "src-69e75d28-9b33-4d34-9464-f0c52f189099",
    "rawText": "├── درس ۶ ـ پروردهٔ عشق",
    "displayLabel": "درس ۶ ـ پروردهٔ عشق",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1159",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.persian.chapter.1157"
  },
  {
    "ref": "shared.g11.persian.lesson.1164",
    "sourceRecordKey": "src-fb627a79-e418-4aac-afd5-d6ef797812e9",
    "rawText": "└── درس ۷ ـ باران محبت",
    "displayLabel": "درس ۷ ـ باران محبت",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1164",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.persian.chapter.1157"
  },
  {
    "ref": "shared.g11.persian.chapter.1168",
    "sourceRecordKey": "src-4db69c73-303f-4c63-9b9c-cd6e86c84925",
    "rawText": "فصل ۴ ـ ادبیات سفر و زندگی",
    "displayLabel": "فصل ۴ ـ ادبیات سفر و زندگی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1168",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "shared.g11.persian"
  },
  {
    "ref": "shared.g11.persian.lesson.1170",
    "sourceRecordKey": "src-b2a071be-0508-40df-bff2-201081fcdb88",
    "rawText": "├── درس ۸ ـ در کوی عاشقان",
    "displayLabel": "درس ۸ ـ در کوی عاشقان",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1170",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.persian.chapter.1168"
  },
  {
    "ref": "shared.g11.persian.lesson.1175",
    "sourceRecordKey": "src-b378f76b-c921-4fbf-968d-9d98f63f4009",
    "rawText": "└── درس ۹ ـ ذوق لطیف",
    "displayLabel": "درس ۹ ـ ذوق لطیف",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1175",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.persian.chapter.1168"
  },
  {
    "ref": "shared.g11.persian.chapter.1179",
    "sourceRecordKey": "src-d71eee8a-ccda-467d-9294-2af28aa56db9",
    "rawText": "فصل ۵ ـ ادبیات انقلاب اسلامی",
    "displayLabel": "فصل ۵ ـ ادبیات انقلاب اسلامی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1179",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "shared.g11.persian"
  },
  {
    "ref": "shared.g11.persian.lesson.1181",
    "sourceRecordKey": "src-52346db1-fb90-4719-8444-77485eb644be",
    "rawText": "├── درس ۱۰ ـ بانگ جرس",
    "displayLabel": "درس ۱۰ ـ بانگ جرس",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1181",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.persian.chapter.1179"
  },
  {
    "ref": "shared.g11.persian.lesson.1186",
    "sourceRecordKey": "src-37991b39-970a-414e-84f0-619d737274f0",
    "rawText": "└── درس ۱۱ ـ یاران عاشق",
    "displayLabel": "درس ۱۱ ـ یاران عاشق",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1186",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.persian.chapter.1179"
  },
  {
    "ref": "shared.g11.persian.chapter.1190",
    "sourceRecordKey": "src-cb897933-97fa-4952-9bf2-d016c11c540a",
    "rawText": "فصل ۶ ـ ادبیات حماسی",
    "displayLabel": "فصل ۶ ـ ادبیات حماسی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1190",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "shared.g11.persian"
  },
  {
    "ref": "shared.g11.persian.lesson.1192",
    "sourceRecordKey": "src-25a51a3c-3aeb-49de-8336-293631c673f2",
    "rawText": "├── درس ۱۲ ـ کاوهٔ دادخواه",
    "displayLabel": "درس ۱۲ ـ کاوهٔ دادخواه",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1192",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.persian.chapter.1190"
  },
  {
    "ref": "shared.g11.persian.lesson.1197",
    "sourceRecordKey": "src-2fe236a3-8280-4036-96e8-87cc5767be4a",
    "rawText": "├── درس ۱۳ ـ درس آزاد: ادبیات بومی ۲",
    "displayLabel": "درس ۱۳ ـ درس آزاد: ادبیات بومی ۲",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1197",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.persian.chapter.1190"
  },
  {
    "ref": "shared.g11.persian.lesson.1201",
    "sourceRecordKey": "src-206ee118-8430-4169-b4d9-e172c5506029",
    "rawText": "└── درس ۱۴ ـ حملهٔ حیدری",
    "displayLabel": "درس ۱۴ ـ حملهٔ حیدری",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1201",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.persian.chapter.1190"
  },
  {
    "ref": "shared.g11.persian.chapter.1205",
    "sourceRecordKey": "src-e1403624-3341-49ce-bb96-9e7085ff0994",
    "rawText": "فصل ۷ ـ ادبیات داستانی",
    "displayLabel": "فصل ۷ ـ ادبیات داستانی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1205",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "shared.g11.persian"
  },
  {
    "ref": "shared.g11.persian.lesson.1207",
    "sourceRecordKey": "src-01782009-0985-4bf0-945b-de12895dcf9a",
    "rawText": "├── درس ۱۵ ـ کبوتر طوق‌دار",
    "displayLabel": "درس ۱۵ ـ کبوتر طوق‌دار",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1207",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.persian.chapter.1205"
  },
  {
    "ref": "shared.g11.persian.lesson.1212",
    "sourceRecordKey": "src-e9a16093-ec56-4762-b211-fa795da95462",
    "rawText": "└── درس ۱۶ ـ قصهٔ عینکم",
    "displayLabel": "درس ۱۶ ـ قصهٔ عینکم",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1212",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.persian.chapter.1205"
  },
  {
    "ref": "shared.g11.persian.chapter.1216",
    "sourceRecordKey": "src-b54a4b2c-7280-4d19-b655-55a3024fbc7e",
    "rawText": "فصل ۸ ـ ادبیات جهان",
    "displayLabel": "فصل ۸ ـ ادبیات جهان",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1216",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "shared.g11.persian"
  },
  {
    "ref": "shared.g11.persian.lesson.1218",
    "sourceRecordKey": "src-5dfcedcf-a9c5-4cc4-aadd-79aa9277969c",
    "rawText": "├── درس ۱۷ ـ خاموشی دریا",
    "displayLabel": "درس ۱۷ ـ خاموشی دریا",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1218",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.persian.chapter.1216"
  },
  {
    "ref": "shared.g11.persian.lesson.1223",
    "sourceRecordKey": "src-1f946ea5-a2c1-4d2f-a97e-51f25000b23c",
    "rawText": "└── درس ۱۸ ـ خوان عدل",
    "displayLabel": "درس ۱۸ ـ خوان عدل",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1223",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.persian.chapter.1216"
  },
  {
    "ref": "shared.g12.persian.chapter.1228",
    "sourceRecordKey": "src-0a4c4154-d039-4e1a-a029-0342e6ace786",
    "rawText": "فصل ۱ ـ ادبیات تعلیمی",
    "displayLabel": "فصل ۱ ـ ادبیات تعلیمی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1228",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "shared.g12.persian"
  },
  {
    "ref": "shared.g12.persian.lesson.1230",
    "sourceRecordKey": "src-38bf0c11-93b4-43b9-a558-689ce9fba800",
    "rawText": "├── درس ۱ ـ شکر نعمت",
    "displayLabel": "درس ۱ ـ شکر نعمت",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1230",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g12.persian.chapter.1228"
  },
  {
    "ref": "shared.g12.persian.lesson.1235",
    "sourceRecordKey": "src-f54fbce2-716b-4fb6-b337-cf8b13777158",
    "rawText": "└── درس ۲ ـ مست و هشیار",
    "displayLabel": "درس ۲ ـ مست و هشیار",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1235",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g12.persian.chapter.1228"
  },
  {
    "ref": "shared.g12.persian.chapter.1239",
    "sourceRecordKey": "src-0f9c9869-4fd8-4a6a-9d69-8fd200a30894",
    "rawText": "فصل ۲ ـ ادبیات پایداری",
    "displayLabel": "فصل ۲ ـ ادبیات پایداری",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1239",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "shared.g12.persian"
  },
  {
    "ref": "shared.g12.persian.lesson.1241",
    "sourceRecordKey": "src-320dc6f2-51c1-463d-a975-0c0ee864e994",
    "rawText": "├── درس ۳ ـ آزادی",
    "displayLabel": "درس ۳ ـ آزادی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1241",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g12.persian.chapter.1239"
  },
  {
    "ref": "shared.g12.persian.lesson.1246",
    "sourceRecordKey": "src-e060b66d-1d3b-405b-a892-49487547b4dd",
    "rawText": "├── درس ۴ ـ درس آزاد: ادبیات بومی ۱",
    "displayLabel": "درس ۴ ـ درس آزاد: ادبیات بومی ۱",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1246",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g12.persian.chapter.1239"
  },
  {
    "ref": "shared.g12.persian.lesson.1251",
    "sourceRecordKey": "src-29a011af-0ee7-48d5-a119-52090c5be5c1",
    "rawText": "└── درس ۵ ـ دماوندیه",
    "displayLabel": "درس ۵ ـ دماوندیه",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1251",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g12.persian.chapter.1239"
  },
  {
    "ref": "shared.g12.persian.chapter.1255",
    "sourceRecordKey": "src-a65d0018-e8f9-4bc2-99dd-5910a787bf29",
    "rawText": "فصل ۳ ـ ادبیات غنایی",
    "displayLabel": "فصل ۳ ـ ادبیات غنایی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1255",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "shared.g12.persian"
  },
  {
    "ref": "shared.g12.persian.lesson.1257",
    "sourceRecordKey": "src-7f686773-5318-4a3d-83fb-f1506a6781fe",
    "rawText": "├── درس ۶ ـ نی‌نامه",
    "displayLabel": "درس ۶ ـ نی‌نامه",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1257",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g12.persian.chapter.1255"
  },
  {
    "ref": "shared.g12.persian.lesson.1262",
    "sourceRecordKey": "src-2481c4e5-4e77-42a5-a114-91c8bcd5b273",
    "rawText": "└── درس ۷ ـ در حقیقت عشق",
    "displayLabel": "درس ۷ ـ در حقیقت عشق",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1262",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g12.persian.chapter.1255"
  },
  {
    "ref": "shared.g12.persian.chapter.1266",
    "sourceRecordKey": "src-78467df6-79bc-4a67-93b1-e5d056625232",
    "rawText": "فصل ۴ ـ ادبیات سفر و زندگی",
    "displayLabel": "فصل ۴ ـ ادبیات سفر و زندگی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1266",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "shared.g12.persian"
  },
  {
    "ref": "shared.g12.persian.lesson.1268",
    "sourceRecordKey": "src-0334effb-0bd4-4a5b-8dcb-2313fa0e89d7",
    "rawText": "├── درس ۸ ـ از پاریز تا پاریس",
    "displayLabel": "درس ۸ ـ از پاریز تا پاریس",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1268",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g12.persian.chapter.1266"
  },
  {
    "ref": "shared.g12.persian.lesson.1273",
    "sourceRecordKey": "src-d7d3e6d6-275b-482e-8376-4b17a76a92e0",
    "rawText": "└── درس ۹ ـ کویر",
    "displayLabel": "درس ۹ ـ کویر",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1273",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g12.persian.chapter.1266"
  },
  {
    "ref": "shared.g12.persian.chapter.1277",
    "sourceRecordKey": "src-52e3ac37-f95c-4551-aad2-798bae930c95",
    "rawText": "فصل ۵ ـ ادبیات انقلاب اسلامی",
    "displayLabel": "فصل ۵ ـ ادبیات انقلاب اسلامی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1277",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "shared.g12.persian"
  },
  {
    "ref": "shared.g12.persian.lesson.1279",
    "sourceRecordKey": "src-257f67e3-b377-4050-8246-903b5ae9414e",
    "rawText": "├── درس ۱۰ ـ فصل شکوفایی",
    "displayLabel": "درس ۱۰ ـ فصل شکوفایی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1279",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g12.persian.chapter.1277"
  },
  {
    "ref": "shared.g12.persian.lesson.1284",
    "sourceRecordKey": "src-a7925af3-ae70-4240-af8a-35524f513abd",
    "rawText": "└── درس ۱۱ ـ آن شب عزیز",
    "displayLabel": "درس ۱۱ ـ آن شب عزیز",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1284",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g12.persian.chapter.1277"
  },
  {
    "ref": "shared.g12.persian.chapter.1288",
    "sourceRecordKey": "src-a82245ba-017f-4374-aba9-014432bd31b2",
    "rawText": "فصل ۶ ـ ادبیات حماسی",
    "displayLabel": "فصل ۶ ـ ادبیات حماسی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1288",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "shared.g12.persian"
  },
  {
    "ref": "shared.g12.persian.lesson.1290",
    "sourceRecordKey": "src-61a6ae03-2c9b-4368-a10d-b0814e408369",
    "rawText": "├── درس ۱۲ ـ گذر سیاوش از آتش",
    "displayLabel": "درس ۱۲ ـ گذر سیاوش از آتش",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1290",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g12.persian.chapter.1288"
  },
  {
    "ref": "shared.g12.persian.lesson.1295",
    "sourceRecordKey": "src-12b304ae-371e-498c-a869-3c529d16ce20",
    "rawText": "└── درس ۱۳ ـ خوان هشتم",
    "displayLabel": "درس ۱۳ ـ خوان هشتم",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1295",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g12.persian.chapter.1288"
  },
  {
    "ref": "shared.g12.persian.chapter.1299",
    "sourceRecordKey": "src-cf51da93-e0e7-45f6-8437-b60d92009cd4",
    "rawText": "فصل ۷ ـ ادبیات داستانی",
    "displayLabel": "فصل ۷ ـ ادبیات داستانی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1299",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "shared.g12.persian"
  },
  {
    "ref": "shared.g12.persian.lesson.1301",
    "sourceRecordKey": "src-ae27b456-dbb8-4284-bc05-ba7091c234c7",
    "rawText": "├── درس ۱۴ ـ سی مرغ و سیمرغ",
    "displayLabel": "درس ۱۴ ـ سی مرغ و سیمرغ",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1301",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g12.persian.chapter.1299"
  },
  {
    "ref": "shared.g12.persian.lesson.1306",
    "sourceRecordKey": "src-6adf3142-ea09-4349-8ddd-ab76d95621f2",
    "rawText": "├── درس ۱۵ ـ درس آزاد: ادبیات بومی ۲",
    "displayLabel": "درس ۱۵ ـ درس آزاد: ادبیات بومی ۲",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1306",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g12.persian.chapter.1299"
  },
  {
    "ref": "shared.g12.persian.lesson.1310",
    "sourceRecordKey": "src-8383296e-b775-4c54-ac8b-b0be8cfdd569",
    "rawText": "└── درس ۱۶ ـ کباب غاز",
    "displayLabel": "درس ۱۶ ـ کباب غاز",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1310",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g12.persian.chapter.1299"
  },
  {
    "ref": "shared.g12.persian.chapter.1314",
    "sourceRecordKey": "src-e4a6a941-87d7-4130-8451-2815ca3823ca",
    "rawText": "فصل ۸ ـ ادبیات جهان",
    "displayLabel": "فصل ۸ ـ ادبیات جهان",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1314",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "shared.g12.persian"
  },
  {
    "ref": "shared.g12.persian.lesson.1316",
    "sourceRecordKey": "src-a03d6645-29a3-4483-b977-f35c122a3a0c",
    "rawText": "├── درس ۱۷ ـ خندهٔ تو",
    "displayLabel": "درس ۱۷ ـ خندهٔ تو",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1316",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g12.persian.chapter.1314"
  },
  {
    "ref": "shared.g12.persian.lesson.1321",
    "sourceRecordKey": "src-450977df-6ad5-4ad1-b617-3cd824141121",
    "rawText": "└── درس ۱۸ ـ عشق جاودانی",
    "displayLabel": "درس ۱۸ ـ عشق جاودانی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1321",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g12.persian.chapter.1314"
  },
  {
    "ref": "shared.g10.religion.lesson.1397",
    "sourceRecordKey": "src-efe89729-ee11-4c67-b993-9176547c9d66",
    "rawText": "├── درس ۱ ـ هدف زندگی",
    "displayLabel": "درس ۱ ـ هدف زندگی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1397",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.religion"
  },
  {
    "ref": "shared.g10.religion.lesson.1403",
    "sourceRecordKey": "src-9498a5b3-0a18-4665-a414-57c0692b825b",
    "rawText": "├── درس ۲ ـ پر پرواز",
    "displayLabel": "درس ۲ ـ پر پرواز",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1403",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.religion"
  },
  {
    "ref": "shared.g10.religion.lesson.1409",
    "sourceRecordKey": "src-8b0ddcac-18fb-4056-87da-31e67927b8ff",
    "rawText": "├── درس ۳ ـ خودِ حقیقی",
    "displayLabel": "درس ۳ ـ خودِ حقیقی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1409",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.religion"
  },
  {
    "ref": "shared.g10.religion.lesson.1415",
    "sourceRecordKey": "src-7d74ff3c-e4cb-4724-a539-de45b20312ad",
    "rawText": "├── درس ۴ ـ پنجره‌ای به روشنایی",
    "displayLabel": "درس ۴ ـ پنجره‌ای به روشنایی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1415",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.religion"
  },
  {
    "ref": "shared.g10.religion.lesson.1421",
    "sourceRecordKey": "src-74208f27-c56c-4609-a82e-9b4030924361",
    "rawText": "├── درس ۵ ـ آینده روشن",
    "displayLabel": "درس ۵ ـ آینده روشن",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1421",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.religion"
  },
  {
    "ref": "shared.g10.religion.lesson.1427",
    "sourceRecordKey": "src-09f1fd0e-16f8-4614-8b3b-84a5e683b553",
    "rawText": "├── درس ۶ ـ منزلگاه بعد",
    "displayLabel": "درس ۶ ـ منزلگاه بعد",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1427",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.religion"
  },
  {
    "ref": "shared.g10.religion.lesson.1433",
    "sourceRecordKey": "src-6cdfaef1-960f-4b23-a7ac-b3e6fddb06e3",
    "rawText": "├── درس ۷ ـ واقعه بزرگ",
    "displayLabel": "درس ۷ ـ واقعه بزرگ",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1433",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.religion"
  },
  {
    "ref": "shared.g10.religion.lesson.1439",
    "sourceRecordKey": "src-564b3c9e-455d-4d51-9276-5e3d433b74c5",
    "rawText": "├── درس ۸ ـ فرجام کار",
    "displayLabel": "درس ۸ ـ فرجام کار",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1439",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.religion"
  },
  {
    "ref": "shared.g10.religion.lesson.1445",
    "sourceRecordKey": "src-bbbaa85d-d0c7-4ece-96bb-817e0e249d40",
    "rawText": "├── درس ۹ ـ آهنگ سفر",
    "displayLabel": "درس ۹ ـ آهنگ سفر",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1445",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.religion"
  },
  {
    "ref": "shared.g10.religion.lesson.1451",
    "sourceRecordKey": "src-0c5f27c4-813d-4c1a-97e9-9cdbd40c74a1",
    "rawText": "├── درس ۱۰ ـ اعتماد بر او",
    "displayLabel": "درس ۱۰ ـ اعتماد بر او",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1451",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.religion"
  },
  {
    "ref": "shared.g10.religion.lesson.1457",
    "sourceRecordKey": "src-169a83ed-875a-48ba-a6dd-ce5b451ac5af",
    "rawText": "├── درس ۱۱ ـ دوستی با خدا",
    "displayLabel": "درس ۱۱ ـ دوستی با خدا",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1457",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.religion"
  },
  {
    "ref": "shared.g10.religion.lesson.1463",
    "sourceRecordKey": "src-ed91ceb2-e7ea-4cb4-b2e7-08c084ae57e4",
    "rawText": "├── درس ۱۲ ـ یاری از نماز و روزه",
    "displayLabel": "درس ۱۲ ـ یاری از نماز و روزه",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1463",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.religion"
  },
  {
    "ref": "shared.g10.religion.lesson.1469",
    "sourceRecordKey": "src-143e2a10-19ab-4fd8-87fc-cc522be0d258",
    "rawText": "├── درس ۱۳ ـ فضیلت آراستگی",
    "displayLabel": "درس ۱۳ ـ فضیلت آراستگی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1469",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.religion"
  },
  {
    "ref": "shared.g10.religion.lesson.1475",
    "sourceRecordKey": "src-6cca1733-cc48-43d5-b5c6-6c3cd67c87c7",
    "rawText": "└── درس ۱۴ ـ زیبایی پوشیدگی",
    "displayLabel": "درس ۱۴ ـ زیبایی پوشیدگی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1475",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.religion"
  },
  {
    "ref": "shared.g11.religion.lesson.1482",
    "sourceRecordKey": "src-b950bfab-b63a-4c6d-97f8-c74902c4b676",
    "rawText": "├── درس ۱ ـ هدایت الهی",
    "displayLabel": "درس ۱ ـ هدایت الهی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1482",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.religion"
  },
  {
    "ref": "shared.g11.religion.lesson.1488",
    "sourceRecordKey": "src-86e41fc8-32e4-470e-a335-8a5c9b8dfcab",
    "rawText": "├── درس ۲ ـ تداوم هدایت",
    "displayLabel": "درس ۲ ـ تداوم هدایت",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1488",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.religion"
  },
  {
    "ref": "shared.g11.religion.lesson.1494",
    "sourceRecordKey": "src-1bec516a-a2cf-4e30-a2a6-0c6a4f6988ea",
    "rawText": "├── درس ۳ ـ معجزه جاویدان",
    "displayLabel": "درس ۳ ـ معجزه جاویدان",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1494",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.religion"
  },
  {
    "ref": "shared.g11.religion.lesson.1500",
    "sourceRecordKey": "src-9e58af5c-64ab-47a3-8b8f-cc4942530830",
    "rawText": "├── درس ۴ ـ مسئولیت‌های پیامبر",
    "displayLabel": "درس ۴ ـ مسئولیت‌های پیامبر",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1500",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.religion"
  },
  {
    "ref": "shared.g11.religion.lesson.1506",
    "sourceRecordKey": "src-503e8eec-98a2-404b-9767-9f8ad3f538b0",
    "rawText": "├── درس ۵ ـ امامت، تداوم رسالت",
    "displayLabel": "درس ۵ ـ امامت، تداوم رسالت",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1506",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.religion"
  },
  {
    "ref": "shared.g11.religion.lesson.1512",
    "sourceRecordKey": "src-ee825fb6-0315-46de-8c30-4b96460e8375",
    "rawText": "├── درس ۶ ـ پیشوایان اسوه",
    "displayLabel": "درس ۶ ـ پیشوایان اسوه",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1512",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.religion"
  },
  {
    "ref": "shared.g11.religion.lesson.1518",
    "sourceRecordKey": "src-1185b72b-cb86-47c8-80fc-d3af3aa0bb16",
    "rawText": "├── درس ۷ ـ وضعیت فرهنگی، اجتماعی و سیاسی مسلمانان پس از رحلت رسول خدا",
    "displayLabel": "درس ۷ ـ وضعیت فرهنگی، اجتماعی و سیاسی مسلمانان پس از رحلت رسول خدا",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1518",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.religion"
  },
  {
    "ref": "shared.g11.religion.lesson.1524",
    "sourceRecordKey": "src-00873a86-e384-41a0-a53e-62912d39d0bf",
    "rawText": "├── درس ۸ ـ احیای ارزش‌های راستین",
    "displayLabel": "درس ۸ ـ احیای ارزش‌های راستین",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1524",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.religion"
  },
  {
    "ref": "shared.g11.religion.lesson.1530",
    "sourceRecordKey": "src-d85a7119-2869-4cb4-9f3e-ae3d37968be0",
    "rawText": "├── درس ۹ ـ عصر غیبت",
    "displayLabel": "درس ۹ ـ عصر غیبت",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1530",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.religion"
  },
  {
    "ref": "shared.g11.religion.lesson.1536",
    "sourceRecordKey": "src-d683787f-9dc3-46ee-b5da-669dc235bc8e",
    "rawText": "├── درس ۱۰ ـ مرجعیت و ولایت فقیه",
    "displayLabel": "درس ۱۰ ـ مرجعیت و ولایت فقیه",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1536",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.religion"
  },
  {
    "ref": "shared.g11.religion.lesson.1542",
    "sourceRecordKey": "src-ba8028a1-b68b-4da1-9d70-10a713241c20",
    "rawText": "├── درس ۱۱ ـ عزت نفس",
    "displayLabel": "درس ۱۱ ـ عزت نفس",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1542",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.religion"
  },
  {
    "ref": "shared.g11.religion.lesson.1548",
    "sourceRecordKey": "src-229c6478-691c-40db-8d7c-176a98c9d28d",
    "rawText": "└── درس ۱۲ ـ پیوند مقدس",
    "displayLabel": "درس ۱۲ ـ پیوند مقدس",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1548",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.religion"
  },
  {
    "ref": "shared.g12.religion.lesson.1557",
    "sourceRecordKey": "src-b875fc03-edcf-47cf-86f0-5083ef0ab124",
    "rawText": "├── درس ۱ ـ هستی‌بخش",
    "displayLabel": "درس ۱ ـ هستی‌بخش",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1557",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g12.religion"
  },
  {
    "ref": "shared.g12.religion.lesson.1563",
    "sourceRecordKey": "src-35d6047b-143b-49f4-95cb-22bed9416e38",
    "rawText": "├── درس ۲ ـ یگانۀ بی‌همتا",
    "displayLabel": "درس ۲ ـ یگانۀ بی‌همتا",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1563",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g12.religion"
  },
  {
    "ref": "shared.g12.religion.lesson.1569",
    "sourceRecordKey": "src-c55bb370-8f7b-45d9-a077-dca36ffb3b18",
    "rawText": "├── درس ۳ ـ توحید و سبک زندگی",
    "displayLabel": "درس ۳ ـ توحید و سبک زندگی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1569",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g12.religion"
  },
  {
    "ref": "shared.g12.religion.lesson.1575",
    "sourceRecordKey": "src-3b16cfcf-3164-42b7-a297-3dbf790d011b",
    "rawText": "├── درس ۴ ـ فقط برای تو",
    "displayLabel": "درس ۴ ـ فقط برای تو",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1575",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g12.religion"
  },
  {
    "ref": "shared.g12.religion.lesson.1581",
    "sourceRecordKey": "src-404de685-b143-447e-8c68-8eaa322bcee1",
    "rawText": "├── درس ۵ ـ قدرت پرواز",
    "displayLabel": "درس ۵ ـ قدرت پرواز",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1581",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g12.religion"
  },
  {
    "ref": "shared.g12.religion.lesson.1587",
    "sourceRecordKey": "src-9c692bf2-f15a-48df-9df4-11b71e7335d7",
    "rawText": "├── درس ۶ ـ سنت‌های خداوند در زندگی",
    "displayLabel": "درس ۶ ـ سنت‌های خداوند در زندگی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1587",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g12.religion"
  },
  {
    "ref": "shared.g12.religion.lesson.1595",
    "sourceRecordKey": "src-1b1053dd-78a1-4c23-82ae-3019352dc6c9",
    "rawText": "├── درس ۷ ـ بازگشت",
    "displayLabel": "درس ۷ ـ بازگشت",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1595",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g12.religion"
  },
  {
    "ref": "shared.g12.religion.lesson.1601",
    "sourceRecordKey": "src-82c697de-316e-440b-820a-b4c9239c203e",
    "rawText": "├── درس ۸ ـ زندگی در دنیای امروز و عمل به احکام الهی",
    "displayLabel": "درس ۸ ـ زندگی در دنیای امروز و عمل به احکام الهی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1601",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g12.religion"
  },
  {
    "ref": "shared.g12.religion.lesson.1607",
    "sourceRecordKey": "src-1e5595e8-4bed-406c-a2b1-c976e7df31cd",
    "rawText": "├── درس ۹ ـ پایه‌های استوار",
    "displayLabel": "درس ۹ ـ پایه‌های استوار",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1607",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g12.religion"
  },
  {
    "ref": "shared.g12.religion.lesson.1613",
    "sourceRecordKey": "src-cadf9e31-2898-4142-ab49-6c06ada4a3d4",
    "rawText": "└── درس ۱۰ ـ تمدن جدید و مسئولیت ما",
    "displayLabel": "درس ۱۰ ـ تمدن جدید و مسئولیت ما",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1613",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g12.religion"
  },
  {
    "ref": "shared.g10.english.lesson.1619",
    "sourceRecordKey": "src-bbb93675-7075-48bc-ad86-c2931865f742",
    "rawText": "Lesson 1 ـ Saving Nature",
    "displayLabel": "Lesson 1 ـ Saving Nature",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1619",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.english"
  },
  {
    "ref": "shared.g10.english.lesson.1635",
    "sourceRecordKey": "src-de38de42-132d-4aaf-a005-235a240f071e",
    "rawText": "Lesson 2 ـ Wonders of Creation",
    "displayLabel": "Lesson 2 ـ Wonders of Creation",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1635",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.english"
  },
  {
    "ref": "shared.g10.english.lesson.1650",
    "sourceRecordKey": "src-cb9c92cb-fe00-4a5f-b8eb-359b8a1d04bf",
    "rawText": "Lesson 3 ـ The Value of Knowledge",
    "displayLabel": "Lesson 3 ـ The Value of Knowledge",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1650",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.english"
  },
  {
    "ref": "shared.g10.english.lesson.1665",
    "sourceRecordKey": "src-448ea0f5-c065-41e7-929d-2ad9ea880d35",
    "rawText": "Lesson 4 ـ Traveling the World",
    "displayLabel": "Lesson 4 ـ Traveling the World",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1665",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g10.english"
  },
  {
    "ref": "shared.g11.english.lesson.1681",
    "sourceRecordKey": "src-46369414-0896-4192-ba2a-cf371f8a36df",
    "rawText": "Lesson 1 ـ Understanding People",
    "displayLabel": "Lesson 1 ـ Understanding People",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1681",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.english"
  },
  {
    "ref": "shared.g11.english.lesson.1697",
    "sourceRecordKey": "src-21e4bec5-6901-4070-9349-3cb515a22f9b",
    "rawText": "Lesson 2 ـ A Healthy Lifestyle",
    "displayLabel": "Lesson 2 ـ A Healthy Lifestyle",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1697",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.english"
  },
  {
    "ref": "shared.g11.english.lesson.1713",
    "sourceRecordKey": "src-a7d4e92a-df6e-40b4-8325-7e8232c3e4ad",
    "rawText": "Lesson 3 ـ Art and Culture",
    "displayLabel": "Lesson 3 ـ Art and Culture",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1713",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g11.english"
  },
  {
    "ref": "shared.g12.english.lesson.1730",
    "sourceRecordKey": "src-93a81f5d-70b9-4433-b95e-167b52a773ad",
    "rawText": "Lesson 1 ـ Sense of Appreciation",
    "displayLabel": "Lesson 1 ـ Sense of Appreciation",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1730",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g12.english"
  },
  {
    "ref": "shared.g12.english.lesson.1746",
    "sourceRecordKey": "src-479c9684-5082-4a6f-8d9b-62a376fed6fb",
    "rawText": "Lesson 2 ـ Look it Up!",
    "displayLabel": "Lesson 2 ـ Look it Up!",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1746",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g12.english"
  },
  {
    "ref": "shared.g12.english.lesson.1762",
    "sourceRecordKey": "src-05768d76-b440-4da9-ba52-b01813666c2e",
    "rawText": "Lesson 3 ـ Renewable Energy",
    "displayLabel": "Lesson 3 ـ Renewable Energy",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L1762",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "shared.g12.english"
  },
  {
    "ref": "human.g10.literary.chapter.5580",
    "sourceRecordKey": "src-6067e964-86ef-4199-954d-cc333d636393",
    "rawText": "فصل ۱ ـ مبانی تحلیل متن",
    "displayLabel": "فصل ۱ ـ مبانی تحلیل متن",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5580",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g10.literary"
  },
  {
    "ref": "human.g10.literary.chapter.5597",
    "sourceRecordKey": "src-77739524-b75d-46ad-be2c-b58107e3296b",
    "rawText": "فصل ۲ ـ تاریخ ادبیات و موسیقی شعر",
    "displayLabel": "فصل ۲ ـ تاریخ ادبیات و موسیقی شعر",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5597",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g10.literary"
  },
  {
    "ref": "human.g10.literary.chapter.5614",
    "sourceRecordKey": "src-85a3e2b0-bf06-42fe-8258-d73873e9f58b",
    "rawText": "فصل ۳ ـ سبک‌شناسی و وزن شعر فارسی",
    "displayLabel": "فصل ۳ ـ سبک‌شناسی و وزن شعر فارسی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5614",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g10.literary"
  },
  {
    "ref": "human.g10.literary.chapter.5631",
    "sourceRecordKey": "src-b036405f-7163-407c-b29d-142defbbc1db",
    "rawText": "فصل ۴ ـ ادبیات فارسی در سده‌های پنجم و ششم",
    "displayLabel": "فصل ۴ ـ ادبیات فارسی در سده‌های پنجم و ششم",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5631",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g10.literary"
  },
  {
    "ref": "human.g11.literary.chapter.5650",
    "sourceRecordKey": "src-2ede0e69-4dfd-4843-adf0-c2f60e60a6e6",
    "rawText": "فصل ۱ ـ ادبیات فارسی در قرن‌های هفتم، هشتم و نهم",
    "displayLabel": "فصل ۱ ـ ادبیات فارسی در قرن‌های هفتم، هشتم و نهم",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5650",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g11.literary"
  },
  {
    "ref": "human.g11.literary.chapter.5669",
    "sourceRecordKey": "src-b76b9aff-c617-4b5b-8726-2b65b18ba4c6",
    "rawText": "فصل ۲ ـ سبک عراقی",
    "displayLabel": "فصل ۲ ـ سبک عراقی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5669",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g11.literary"
  },
  {
    "ref": "human.g11.literary.chapter.5687",
    "sourceRecordKey": "src-cc26b60a-1e01-494c-a4c1-5ec619e98a77",
    "rawText": "فصل ۳ ـ ادبیات فارسی در قرن‌های دهم و یازدهم",
    "displayLabel": "فصل ۳ ـ ادبیات فارسی در قرن‌های دهم و یازدهم",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5687",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g11.literary"
  },
  {
    "ref": "human.g11.literary.chapter.5705",
    "sourceRecordKey": "src-58fbbc0a-ffe6-409e-8eb3-9106dd072fa8",
    "rawText": "فصل ۴ ـ سبک هندی",
    "displayLabel": "فصل ۴ ـ سبک هندی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5705",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g11.literary"
  },
  {
    "ref": "human.g12.literary.chapter.5724",
    "sourceRecordKey": "src-04f57ae0-ef0c-4bd6-ad24-7fe047814463",
    "rawText": "فصل ۱ ـ دوره بازگشت و بیداری",
    "displayLabel": "فصل ۱ ـ دوره بازگشت و بیداری",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5724",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g12.literary"
  },
  {
    "ref": "human.g12.literary.chapter.5742",
    "sourceRecordKey": "src-9731404f-1e19-4dab-a35a-1e432d2373cc",
    "rawText": "فصل ۲ ـ سبک‌شناسی دوره بازگشت و بیداری",
    "displayLabel": "فصل ۲ ـ سبک‌شناسی دوره بازگشت و بیداری",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5742",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g12.literary"
  },
  {
    "ref": "human.g12.literary.chapter.5760",
    "sourceRecordKey": "src-c48ce822-14d0-43f6-8ded-312e46bf25c7",
    "rawText": "فصل ۳ ـ ادبیات معاصر و انقلاب اسلامی",
    "displayLabel": "فصل ۳ ـ ادبیات معاصر و انقلاب اسلامی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5760",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g12.literary"
  },
  {
    "ref": "human.g12.literary.chapter.5778",
    "sourceRecordKey": "src-3540d0e6-63a7-4a7b-906f-2fb831963705",
    "rawText": "فصل ۴ ـ سبک‌شناسی دوره معاصر",
    "displayLabel": "فصل ۴ ـ سبک‌شناسی دوره معاصر",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5778",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g12.literary"
  },
  {
    "ref": "human.g10.sociology.chapter.5878",
    "sourceRecordKey": "src-0d72a5cd-836d-4fdc-a980-fba8148d4e99",
    "rawText": "فصل ۱ ـ زندگی اجتماعی",
    "displayLabel": "فصل ۱ ـ زندگی اجتماعی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5878",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g10.sociology"
  },
  {
    "ref": "human.g10.sociology.lesson.5880",
    "sourceRecordKey": "src-21cace99-9a19-4c39-8cb1-fd4e02c6b541",
    "rawText": "├── درس ۱ ـ کنش‌های ما",
    "displayLabel": "درس ۱ ـ کنش‌های ما",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5880",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.sociology.chapter.5878"
  },
  {
    "ref": "human.g10.sociology.lesson.5882",
    "sourceRecordKey": "src-c0898341-9296-4816-8fc6-cd16bfd9b74b",
    "rawText": "├── درس ۲ ـ پدیده‌های اجتماعی",
    "displayLabel": "درس ۲ ـ پدیده‌های اجتماعی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5882",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.sociology.chapter.5878"
  },
  {
    "ref": "human.g10.sociology.lesson.5884",
    "sourceRecordKey": "src-7107e8ca-86ad-410e-8a21-c444faed590c",
    "rawText": "├── درس ۳ ـ جهان اجتماعی",
    "displayLabel": "درس ۳ ـ جهان اجتماعی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5884",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.sociology.chapter.5878"
  },
  {
    "ref": "human.g10.sociology.lesson.5886",
    "sourceRecordKey": "src-cfc2319e-82a5-4237-9e9d-f40fd05fd78a",
    "rawText": "├── درس ۴ ـ اجزا و لایه‌های جهان اجتماعی",
    "displayLabel": "درس ۴ ـ اجزا و لایه‌های جهان اجتماعی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5886",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.sociology.chapter.5878"
  },
  {
    "ref": "human.g10.sociology.lesson.5888",
    "sourceRecordKey": "src-e0e7db75-e3db-4a2e-a842-c0de87687848",
    "rawText": "├── درس ۵ ـ جهان‌های اجتماعی",
    "displayLabel": "درس ۵ ـ جهان‌های اجتماعی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5888",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.sociology.chapter.5878"
  },
  {
    "ref": "human.g10.sociology.lesson.5890",
    "sourceRecordKey": "src-ba061d70-e563-403d-9c18-a1e1a9b6b698",
    "rawText": "├── درس ۶ ـ پیامدهای جهان اجتماعی",
    "displayLabel": "درس ۶ ـ پیامدهای جهان اجتماعی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5890",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.sociology.chapter.5878"
  },
  {
    "ref": "human.g10.sociology.lesson.5892",
    "sourceRecordKey": "src-1bcb2029-b3bc-4e99-93c1-b682e5c6b6a9",
    "rawText": "└── درس ۷ ـ ارزیابی جهان‌های اجتماعی",
    "displayLabel": "درس ۷ ـ ارزیابی جهان‌های اجتماعی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5892",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.sociology.chapter.5878"
  },
  {
    "ref": "human.g10.sociology.chapter.5893",
    "sourceRecordKey": "src-15e220ab-9fdd-4338-a804-65d1be64d565",
    "rawText": "فصل ۲ ـ هویت",
    "displayLabel": "فصل ۲ ـ هویت",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5893",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g10.sociology"
  },
  {
    "ref": "human.g10.sociology.lesson.5895",
    "sourceRecordKey": "src-8d53c5a3-36c7-4c4d-8dfd-c51f6c80c12b",
    "rawText": "├── درس ۸ ـ هویت",
    "displayLabel": "درس ۸ ـ هویت",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5895",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.sociology.chapter.5893"
  },
  {
    "ref": "human.g10.sociology.lesson.5897",
    "sourceRecordKey": "src-2ce3b027-26f8-459d-8aaf-28b5171c55e2",
    "rawText": "├── درس ۹ ـ بازتولید هویت اجتماعی",
    "displayLabel": "درس ۹ ـ بازتولید هویت اجتماعی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5897",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.sociology.chapter.5893"
  },
  {
    "ref": "human.g10.sociology.lesson.5899",
    "sourceRecordKey": "src-30c586c4-dc4a-4d59-a3f9-b2a3886b6b96",
    "rawText": "├── درس ۱۰ ـ تغییرات هویت اجتماعی",
    "displayLabel": "درس ۱۰ ـ تغییرات هویت اجتماعی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5899",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.sociology.chapter.5893"
  },
  {
    "ref": "human.g10.sociology.lesson.5901",
    "sourceRecordKey": "src-c0a4a683-28ce-4371-96c8-37970640095b",
    "rawText": "├── درس ۱۱ ـ تحولات هویتی جهان اجتماعی (علل درونی)",
    "displayLabel": "درس ۱۱ ـ تحولات هویتی جهان اجتماعی (علل درونی)",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5901",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.sociology.chapter.5893"
  },
  {
    "ref": "human.g10.sociology.lesson.5903",
    "sourceRecordKey": "src-75d0ac05-ab52-4513-9775-7d719f1cae7c",
    "rawText": "├── درس ۱۲ ـ تحولات هویتی جهان اجتماعی (علل بیرونی)",
    "displayLabel": "درس ۱۲ ـ تحولات هویتی جهان اجتماعی (علل بیرونی)",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5903",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.sociology.chapter.5893"
  },
  {
    "ref": "human.g10.sociology.lesson.5905",
    "sourceRecordKey": "src-922f9352-4dd4-42e1-b5d6-3faf932a7db1",
    "rawText": "├── درس ۱۳ ـ هویت ایرانی (۱)",
    "displayLabel": "درس ۱۳ ـ هویت ایرانی (۱)",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5905",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.sociology.chapter.5893"
  },
  {
    "ref": "human.g10.sociology.lesson.5907",
    "sourceRecordKey": "src-4de98809-aade-4562-88af-c5ebe6c146a0",
    "rawText": "├── درس ۱۴ ـ هویت ایرانی (۲)",
    "displayLabel": "درس ۱۴ ـ هویت ایرانی (۲)",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5907",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.sociology.chapter.5893"
  },
  {
    "ref": "human.g10.sociology.lesson.5909",
    "sourceRecordKey": "src-cef10e4d-6ffe-4b06-844a-1967aff1a000",
    "rawText": "├── درس ۱۵ ـ هویت ایرانی (۳)",
    "displayLabel": "درس ۱۵ ـ هویت ایرانی (۳)",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5909",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.sociology.chapter.5893"
  },
  {
    "ref": "human.g10.sociology.lesson.5911",
    "sourceRecordKey": "src-b49d9a0f-87e3-495d-ac0e-65faa1290457",
    "rawText": "└── درس ۱۶ ـ هویت ایرانی (۴)",
    "displayLabel": "درس ۱۶ ـ هویت ایرانی (۴)",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5911",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.sociology.chapter.5893"
  },
  {
    "ref": "human.g11.sociology.chapter.5913",
    "sourceRecordKey": "src-1aad38bf-e3ce-496e-bd1c-a230bfd0d348",
    "rawText": "فصل ۱ ـ فرهنگ جهانی",
    "displayLabel": "فصل ۱ ـ فرهنگ جهانی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5913",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g11.sociology"
  },
  {
    "ref": "human.g11.sociology.lesson.5915",
    "sourceRecordKey": "src-6fb7fc6b-1cf1-499f-938c-514f7c72504a",
    "rawText": "├── درس ۱ ـ جهان فرهنگی",
    "displayLabel": "درس ۱ ـ جهان فرهنگی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5915",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.sociology.chapter.5913"
  },
  {
    "ref": "human.g11.sociology.lesson.5917",
    "sourceRecordKey": "src-153efd45-ce81-4bca-91cf-8c67a60303c1",
    "rawText": "├── درس ۲ ـ فرهنگ جهانی",
    "displayLabel": "درس ۲ ـ فرهنگ جهانی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5917",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.sociology.chapter.5913"
  },
  {
    "ref": "human.g11.sociology.lesson.5919",
    "sourceRecordKey": "src-c90ead62-9290-4d02-ba7f-80478ff435d2",
    "rawText": "├── درس ۳ ـ فرهنگ معاصر غرب",
    "displayLabel": "درس ۳ ـ فرهنگ معاصر غرب",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5919",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.sociology.chapter.5913"
  },
  {
    "ref": "human.g11.sociology.lesson.5921",
    "sourceRecordKey": "src-918f929f-db68-4bb8-9cac-cc25ee79eb90",
    "rawText": "├── درس ۴ ـ تحولات فرهنگی جهان معاصر",
    "displayLabel": "درس ۴ ـ تحولات فرهنگی جهان معاصر",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5921",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.sociology.chapter.5913"
  },
  {
    "ref": "human.g11.sociology.lesson.5923",
    "sourceRecordKey": "src-08caa530-66a7-4f80-80b5-891ba2aebafa",
    "rawText": "└── درس ۵ ـ بحران‌های جهان معاصر",
    "displayLabel": "درس ۵ ـ بحران‌های جهان معاصر",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5923",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.sociology.chapter.5913"
  },
  {
    "ref": "human.g11.sociology.chapter.5924",
    "sourceRecordKey": "src-abbaca27-31eb-448e-8b1f-8c492083ac15",
    "rawText": "فصل ۲ ـ فرهنگ و هویت",
    "displayLabel": "فصل ۲ ـ فرهنگ و هویت",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5924",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g11.sociology"
  },
  {
    "ref": "human.g11.sociology.lesson.5926",
    "sourceRecordKey": "src-2d273346-212b-425b-919f-385e8255e5ca",
    "rawText": "├── درس ۶ ـ هویت فرهنگی",
    "displayLabel": "درس ۶ ـ هویت فرهنگی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5926",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.sociology.chapter.5924"
  },
  {
    "ref": "human.g11.sociology.lesson.5928",
    "sourceRecordKey": "src-48e833a1-3367-4daa-b0c7-04d205e1ee6d",
    "rawText": "├── درس ۷ ـ بازتولید هویت فرهنگی",
    "displayLabel": "درس ۷ ـ بازتولید هویت فرهنگی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5928",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.sociology.chapter.5924"
  },
  {
    "ref": "human.g11.sociology.lesson.5930",
    "sourceRecordKey": "src-8bb00d0d-964d-4258-9f3c-0c174360cca4",
    "rawText": "├── درس ۸ ـ تحولات هویتی جهان اجتماعی",
    "displayLabel": "درس ۸ ـ تحولات هویتی جهان اجتماعی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5930",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.sociology.chapter.5924"
  },
  {
    "ref": "human.g11.sociology.lesson.5932",
    "sourceRecordKey": "src-10fb1a0e-6c5c-435e-bd66-b9569dca3469",
    "rawText": "├── درس ۹ ـ جهان فرهنگی جدید",
    "displayLabel": "درس ۹ ـ جهان فرهنگی جدید",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5932",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.sociology.chapter.5924"
  },
  {
    "ref": "human.g11.sociology.lesson.5934",
    "sourceRecordKey": "src-655a6a57-5a9a-454a-836c-130771a1b2b1",
    "rawText": "└── درس ۱۰ ـ فرهنگ و تمدن اسلامی",
    "displayLabel": "درس ۱۰ ـ فرهنگ و تمدن اسلامی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5934",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.sociology.chapter.5924"
  },
  {
    "ref": "human.g11.sociology.chapter.5935",
    "sourceRecordKey": "src-2b3b7a35-2c45-4bfd-a516-072c93849169",
    "rawText": "فصل ۳ ـ نظام اجتماعی",
    "displayLabel": "فصل ۳ ـ نظام اجتماعی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5935",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g11.sociology"
  },
  {
    "ref": "human.g11.sociology.lesson.5937",
    "sourceRecordKey": "src-8dcf0369-4cc7-4b11-9b42-3dc246e56f3b",
    "rawText": "├── درس ۱۱ ـ نظم اجتماعی",
    "displayLabel": "درس ۱۱ ـ نظم اجتماعی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5937",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.sociology.chapter.5935"
  },
  {
    "ref": "human.g11.sociology.lesson.5939",
    "sourceRecordKey": "src-a513fc51-4734-4caf-bd5b-0cffb45363d2",
    "rawText": "├── درس ۱۲ ـ کنش اجتماعی و ساختار اجتماعی",
    "displayLabel": "درس ۱۲ ـ کنش اجتماعی و ساختار اجتماعی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5939",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.sociology.chapter.5935"
  },
  {
    "ref": "human.g11.sociology.lesson.5941",
    "sourceRecordKey": "src-9c7e8a84-3931-48f5-8e1d-7d82c5053306",
    "rawText": "├── درس ۱۳ ـ تغییرات اجتماعی",
    "displayLabel": "درس ۱۳ ـ تغییرات اجتماعی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5941",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.sociology.chapter.5935"
  },
  {
    "ref": "human.g11.sociology.lesson.5943",
    "sourceRecordKey": "src-8c6f14cc-4fda-4e85-8bda-68ce4d4e7fdc",
    "rawText": "└── درس ۱۴ ـ تحولات اجتماعی",
    "displayLabel": "درس ۱۴ ـ تحولات اجتماعی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5943",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.sociology.chapter.5935"
  },
  {
    "ref": "human.g12.sociology.lesson.5945",
    "sourceRecordKey": "src-64bcb5fa-b879-4d2e-b5df-8c4e9aa18601",
    "rawText": "├── درس ۱ ـ ذخیره دانشی",
    "displayLabel": "درس ۱ ـ ذخیره دانشی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5945",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.sociology"
  },
  {
    "ref": "human.g12.sociology.lesson.5947",
    "sourceRecordKey": "src-46de4cea-b545-4d45-b5c7-43ef2d87185c",
    "rawText": "├── درس ۲ ـ علوم اجتماعی",
    "displayLabel": "درس ۲ ـ علوم اجتماعی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5947",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.sociology"
  },
  {
    "ref": "human.g12.sociology.lesson.5949",
    "sourceRecordKey": "src-2285b38b-f26e-49e9-85a9-9fd365b997bf",
    "rawText": "├── درس ۳ ـ نظم اجتماعی",
    "displayLabel": "درس ۳ ـ نظم اجتماعی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5949",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.sociology"
  },
  {
    "ref": "human.g12.sociology.lesson.5951",
    "sourceRecordKey": "src-526fded2-327f-4452-95af-a38fceba48c9",
    "rawText": "├── درس ۴ ـ کنش اجتماعی",
    "displayLabel": "درس ۴ ـ کنش اجتماعی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5951",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.sociology"
  },
  {
    "ref": "human.g12.sociology.lesson.5953",
    "sourceRecordKey": "src-d08102b5-a23b-4976-a8cf-070ef42200cd",
    "rawText": "├── درس ۵ ـ معنای زندگی",
    "displayLabel": "درس ۵ ـ معنای زندگی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5953",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.sociology"
  },
  {
    "ref": "human.g12.sociology.lesson.5955",
    "sourceRecordKey": "src-41a648c0-d094-40ae-9413-9c05a5815b6b",
    "rawText": "├── درس ۶ ـ قدرت اجتماعی",
    "displayLabel": "درس ۶ ـ قدرت اجتماعی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5955",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.sociology"
  },
  {
    "ref": "human.g12.sociology.lesson.5957",
    "sourceRecordKey": "src-3861bf51-b7f0-4725-96f8-f7ba8e340841",
    "rawText": "├── درس ۷ ـ نابرابری اجتماعی",
    "displayLabel": "درس ۷ ـ نابرابری اجتماعی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5957",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.sociology"
  },
  {
    "ref": "human.g12.sociology.lesson.5959",
    "sourceRecordKey": "src-4310f85a-080d-4dbd-b699-614a72ec9986",
    "rawText": "├── درس ۸ ـ سیاست هویت",
    "displayLabel": "درس ۸ ـ سیاست هویت",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5959",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.sociology"
  },
  {
    "ref": "human.g12.sociology.lesson.5961",
    "sourceRecordKey": "src-4600afbf-774b-4a4f-94cd-a8135b28931b",
    "rawText": "├── درس ۹ ـ پیشینه علوم اجتماعی در جهان اسلام",
    "displayLabel": "درس ۹ ـ پیشینه علوم اجتماعی در جهان اسلام",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5961",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.sociology"
  },
  {
    "ref": "human.g12.sociology.lesson.5963",
    "sourceRecordKey": "src-e80a2566-ea87-48aa-ab63-1032bfbd6b9a",
    "rawText": "└── درس ۱۰ ـ افق علوم اجتماعی در جهان اسلام",
    "displayLabel": "درس ۱۰ ـ افق علوم اجتماعی در جهان اسلام",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5963",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.sociology"
  },
  {
    "ref": "human.g10.history.chapter.5966",
    "sourceRecordKey": "src-41695503-7327-4316-bd81-682e8331fcc7",
    "rawText": "فصل ۱ ـ تاریخ‌شناسی؛ کاوش گذشته",
    "displayLabel": "فصل ۱ ـ تاریخ‌شناسی؛ کاوش گذشته",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5966",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g10.history"
  },
  {
    "ref": "human.g10.history.lesson.5968",
    "sourceRecordKey": "src-60e4ab43-6689-45df-9d52-8a86340471a5",
    "rawText": "├── درس ۱ ـ تاریخ و تاریخ‌نگاری",
    "displayLabel": "درس ۱ ـ تاریخ و تاریخ‌نگاری",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5968",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.history.chapter.5966"
  },
  {
    "ref": "human.g10.history.lesson.5970",
    "sourceRecordKey": "src-d34b3fbb-f07a-4dba-8a4c-0c3a9ee5f8f9",
    "rawText": "├── درس ۲ ـ تاریخ؛ زمان و مکان",
    "displayLabel": "درس ۲ ـ تاریخ؛ زمان و مکان",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5970",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.history.chapter.5966"
  },
  {
    "ref": "human.g10.history.lesson.5972",
    "sourceRecordKey": "src-195f0788-8d49-4801-80cf-767a57939490",
    "rawText": "└── درس ۳ ـ باستان‌شناسی؛ در جست‌وجوی میراث فرهنگی",
    "displayLabel": "درس ۳ ـ باستان‌شناسی؛ در جست‌وجوی میراث فرهنگی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5972",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.history.chapter.5966"
  },
  {
    "ref": "human.g10.history.chapter.5973",
    "sourceRecordKey": "src-3073ad52-2e4b-46f5-bb1d-55665405950e",
    "rawText": "فصل ۲ ـ جهان در عصر باستان؛ میراث بشری",
    "displayLabel": "فصل ۲ ـ جهان در عصر باستان؛ میراث بشری",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5973",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g10.history"
  },
  {
    "ref": "human.g10.history.lesson.5975",
    "sourceRecordKey": "src-5098eec6-4d7c-4d74-a476-abac32830716",
    "rawText": "├── درس ۴ ـ پیدایش تمدن؛ بین‌النهرین و مصر",
    "displayLabel": "درس ۴ ـ پیدایش تمدن؛ بین‌النهرین و مصر",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5975",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.history.chapter.5973"
  },
  {
    "ref": "human.g10.history.lesson.5977",
    "sourceRecordKey": "src-62f44bef-1643-46db-8acc-034c35579c49",
    "rawText": "├── درس ۵ ـ هند و چین",
    "displayLabel": "درس ۵ ـ هند و چین",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5977",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.history.chapter.5973"
  },
  {
    "ref": "human.g10.history.lesson.5979",
    "sourceRecordKey": "src-db467d90-3888-4dde-bd48-1002585c707f",
    "rawText": "└── درس ۶ ـ یونان و روم",
    "displayLabel": "درس ۶ ـ یونان و روم",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5979",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.history.chapter.5973"
  },
  {
    "ref": "human.g10.history.chapter.5980",
    "sourceRecordKey": "src-f9da3a6a-63cc-4bee-82b3-a0e5b2f0ce90",
    "rawText": "فصل ۳ ـ ایران در عصر باستان؛ سرآغاز هویت ایرانی",
    "displayLabel": "فصل ۳ ـ ایران در عصر باستان؛ سرآغاز هویت ایرانی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5980",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g10.history"
  },
  {
    "ref": "human.g10.history.lesson.5982",
    "sourceRecordKey": "src-7641d184-6110-4063-89b2-46d0568342da",
    "rawText": "├── درس ۷ ـ مطالعه و کاوش در گذشته‌های دور",
    "displayLabel": "درس ۷ ـ مطالعه و کاوش در گذشته‌های دور",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5982",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.history.chapter.5980"
  },
  {
    "ref": "human.g10.history.lesson.5984",
    "sourceRecordKey": "src-bf74177a-6063-44e8-a6e9-d5a0557562fb",
    "rawText": "├── درس ۸ ـ سپیده‌دم تمدن ایرانی",
    "displayLabel": "درس ۸ ـ سپیده‌دم تمدن ایرانی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5984",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.history.chapter.5980"
  },
  {
    "ref": "human.g10.history.lesson.5986",
    "sourceRecordKey": "src-f34a8547-6d36-447d-972d-04633b415314",
    "rawText": "├── درس ۹ ـ از ورود آریایی‌ها تا پایان هخامنشیان",
    "displayLabel": "درس ۹ ـ از ورود آریایی‌ها تا پایان هخامنشیان",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5986",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.history.chapter.5980"
  },
  {
    "ref": "human.g10.history.lesson.5988",
    "sourceRecordKey": "src-6234d909-ff24-481e-81c0-f631ef56d1a1",
    "rawText": "├── درس ۱۰ ـ اشکانیان و ساسانیان",
    "displayLabel": "درس ۱۰ ـ اشکانیان و ساسانیان",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5988",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.history.chapter.5980"
  },
  {
    "ref": "human.g10.history.lesson.5990",
    "sourceRecordKey": "src-70ebed16-ee76-4ae1-9418-8f456071bbaa",
    "rawText": "├── درس ۱۱ ـ آیین کشورداری",
    "displayLabel": "درس ۱۱ ـ آیین کشورداری",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5990",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.history.chapter.5980"
  },
  {
    "ref": "human.g10.history.lesson.5992",
    "sourceRecordKey": "src-bc205d8b-e49f-40cb-8c0d-2610cd9918ef",
    "rawText": "├── درس ۱۲ ـ جامعه و خانواده",
    "displayLabel": "درس ۱۲ ـ جامعه و خانواده",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5992",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.history.chapter.5980"
  },
  {
    "ref": "human.g10.history.lesson.5994",
    "sourceRecordKey": "src-885b9390-c352-4c98-aee6-e1661c3f0fa6",
    "rawText": "├── درس ۱۳ ـ اقتصاد و معیشت",
    "displayLabel": "درس ۱۳ ـ اقتصاد و معیشت",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5994",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.history.chapter.5980"
  },
  {
    "ref": "human.g10.history.lesson.5996",
    "sourceRecordKey": "src-5c2b1473-c417-46c1-9a12-e0e8c66711de",
    "rawText": "├── درس ۱۴ ـ دین و اعتقادات",
    "displayLabel": "درس ۱۴ ـ دین و اعتقادات",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5996",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.history.chapter.5980"
  },
  {
    "ref": "human.g10.history.lesson.5998",
    "sourceRecordKey": "src-b0798e7a-37ff-40ef-97f9-7598ac053edd",
    "rawText": "├── درس ۱۵ ـ زبان، علم و آموزش",
    "displayLabel": "درس ۱۵ ـ زبان، علم و آموزش",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5998",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.history.chapter.5980"
  },
  {
    "ref": "human.g10.history.lesson.6000",
    "sourceRecordKey": "src-164c6d57-8e77-44c3-8f54-2dbb0b83dd73",
    "rawText": "└── درس ۱۶ ـ هنر و معماری",
    "displayLabel": "درس ۱۶ ـ هنر و معماری",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6000",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.history.chapter.5980"
  },
  {
    "ref": "human.g11.history.chapter.6002",
    "sourceRecordKey": "src-93a15a4a-5380-47f6-8abc-ce1151f46adb",
    "rawText": "فصل ۱ ـ تاریخ‌شناسی",
    "displayLabel": "فصل ۱ ـ تاریخ‌شناسی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6002",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g11.history"
  },
  {
    "ref": "human.g11.history.lesson.6004",
    "sourceRecordKey": "src-56724e47-276e-4871-b440-6705aea49013",
    "rawText": "├── درس ۱ ـ منابع پژوهش در تاریخ اسلام و ایران دوران اسلامی",
    "displayLabel": "درس ۱ ـ منابع پژوهش در تاریخ اسلام و ایران دوران اسلامی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6004",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.history.chapter.6002"
  },
  {
    "ref": "human.g11.history.lesson.6006",
    "sourceRecordKey": "src-4c3c6a8f-d1ef-4053-910e-2b79bc768bd8",
    "rawText": "└── درس ۲ ـ روش پژوهش در تاریخ؛ بررسی و سنجش اعتبار شواهد و مدارک",
    "displayLabel": "درس ۲ ـ روش پژوهش در تاریخ؛ بررسی و سنجش اعتبار شواهد و مدارک",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6006",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.history.chapter.6002"
  },
  {
    "ref": "human.g11.history.chapter.6007",
    "sourceRecordKey": "src-8245cd51-0f55-44aa-bf43-c3c6a0370abc",
    "rawText": "فصل ۲ ـ ظهور اسلام؛ حرکتی تازه در تاریخ بشر",
    "displayLabel": "فصل ۲ ـ ظهور اسلام؛ حرکتی تازه در تاریخ بشر",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6007",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g11.history"
  },
  {
    "ref": "human.g11.history.lesson.6009",
    "sourceRecordKey": "src-b8d96317-0abd-45eb-832f-dc50dc064857",
    "rawText": "├── درس ۳ ـ اسلام در مکه",
    "displayLabel": "درس ۳ ـ اسلام در مکه",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6009",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.history.chapter.6007"
  },
  {
    "ref": "human.g11.history.lesson.6011",
    "sourceRecordKey": "src-57a746e7-343a-481e-a3ce-55ad87f01a44",
    "rawText": "├── درس ۴ ـ امت و حکومت نبوی در مدینه",
    "displayLabel": "درس ۴ ـ امت و حکومت نبوی در مدینه",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6011",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.history.chapter.6007"
  },
  {
    "ref": "human.g11.history.lesson.6013",
    "sourceRecordKey": "src-5d6de7ca-e13b-4f20-b7a9-fa0efa4fd7f9",
    "rawText": "├── درس ۵ ـ تثبیت و گسترش اسلام در دوران خلفای نخستین",
    "displayLabel": "درس ۵ ـ تثبیت و گسترش اسلام در دوران خلفای نخستین",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6013",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.history.chapter.6007"
  },
  {
    "ref": "human.g11.history.lesson.6015",
    "sourceRecordKey": "src-f1f8dfc2-6e2f-4738-b71f-bfd81938b9da",
    "rawText": "├── درس ۶ ـ امویان بر مسند قدرت",
    "displayLabel": "درس ۶ ـ امویان بر مسند قدرت",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6015",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.history.chapter.6007"
  },
  {
    "ref": "human.g11.history.lesson.6017",
    "sourceRecordKey": "src-5af1034c-21ef-402e-84d3-b50d9f73d7a4",
    "rawText": "└── درس ۷ ـ جهان اسلام در عصر خلافت عباسی",
    "displayLabel": "درس ۷ ـ جهان اسلام در عصر خلافت عباسی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6017",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.history.chapter.6007"
  },
  {
    "ref": "human.g11.history.chapter.6018",
    "sourceRecordKey": "src-f2156e4d-74fe-4308-91ff-83230816a8e1",
    "rawText": "فصل ۳ ـ ایران؛ از ورود اسلام تا پایان صفویه",
    "displayLabel": "فصل ۳ ـ ایران؛ از ورود اسلام تا پایان صفویه",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6018",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g11.history"
  },
  {
    "ref": "human.g11.history.lesson.6020",
    "sourceRecordKey": "src-5fd47c98-22ac-412c-90c8-070f7baa22df",
    "rawText": "├── درس ۸ ـ اسلام در ایران؛ زمینه‌های ظهور تمدن اسلامی ـ ایرانی",
    "displayLabel": "درس ۸ ـ اسلام در ایران؛ زمینه‌های ظهور تمدن اسلامی ـ ایرانی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6020",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.history.chapter.6018"
  },
  {
    "ref": "human.g11.history.lesson.6022",
    "sourceRecordKey": "src-e59dd2a7-1cb3-4c6b-bb8c-fed7a394444d",
    "rawText": "├── درس ۹ ـ ظهور و گسترش تمدن ایرانی ـ اسلامی",
    "displayLabel": "درس ۹ ـ ظهور و گسترش تمدن ایرانی ـ اسلامی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6022",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.history.chapter.6018"
  },
  {
    "ref": "human.g11.history.lesson.6024",
    "sourceRecordKey": "src-8958d55c-b2dd-46af-a49c-12b623846b42",
    "rawText": "├── درس ۱۰ ـ ایران در دوران غزنوی، سلجوقی و خوارزمشاهی",
    "displayLabel": "درس ۱۰ ـ ایران در دوران غزنوی، سلجوقی و خوارزمشاهی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6024",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.history.chapter.6018"
  },
  {
    "ref": "human.g11.history.lesson.6026",
    "sourceRecordKey": "src-a4b86feb-acef-41c7-b422-4c9cade26c99",
    "rawText": "├── درس ۱۱ ـ حکومت، جامعه و اقتصاد در عصر مغول ـ تیموری",
    "displayLabel": "درس ۱۱ ـ حکومت، جامعه و اقتصاد در عصر مغول ـ تیموری",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6026",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.history.chapter.6018"
  },
  {
    "ref": "human.g11.history.lesson.6028",
    "sourceRecordKey": "src-bb835d77-89a7-4b25-850d-669dc1b91cfd",
    "rawText": "├── درس ۱۲ ـ فرهنگ و هنر در عصر مغول ـ تیموری",
    "displayLabel": "درس ۱۲ ـ فرهنگ و هنر در عصر مغول ـ تیموری",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6028",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.history.chapter.6018"
  },
  {
    "ref": "human.g11.history.lesson.6030",
    "sourceRecordKey": "src-c66fb8c5-a898-4c10-9be5-a599e6f24956",
    "rawText": "├── درس ۱۳ ـ تحولات سیاسی و اقتصادی ایران در دوره صفوی",
    "displayLabel": "درس ۱۳ ـ تحولات سیاسی و اقتصادی ایران در دوره صفوی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6030",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.history.chapter.6018"
  },
  {
    "ref": "human.g11.history.lesson.6032",
    "sourceRecordKey": "src-7aba1232-ecf8-4864-afa5-3c97d819e943",
    "rawText": "└── درس ۱۴ ـ فرهنگ و تمدن در عصر صفوی",
    "displayLabel": "درس ۱۴ ـ فرهنگ و تمدن در عصر صفوی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6032",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.history.chapter.6018"
  },
  {
    "ref": "human.g11.history.chapter.6033",
    "sourceRecordKey": "src-f9f2b31f-4ead-4976-9c90-d7597be22cc0",
    "rawText": "فصل ۴ ـ اروپا در قرون وسطا و عصر جدید",
    "displayLabel": "فصل ۴ ـ اروپا در قرون وسطا و عصر جدید",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6033",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g11.history"
  },
  {
    "ref": "human.g11.history.lesson.6035",
    "sourceRecordKey": "src-292e660a-fb05-460c-9941-5828266186d7",
    "rawText": "├── درس ۱۵ ـ قرون وسطا",
    "displayLabel": "درس ۱۵ ـ قرون وسطا",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6035",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.history.chapter.6033"
  },
  {
    "ref": "human.g11.history.lesson.6037",
    "sourceRecordKey": "src-1a5fde0b-08dd-4402-aa94-fbdd08f71c0c",
    "rawText": "└── درس ۱۶ ـ رنسانس و عصر جدید",
    "displayLabel": "درس ۱۶ ـ رنسانس و عصر جدید",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6037",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.history.chapter.6033"
  },
  {
    "ref": "human.g12.history.lesson.6039",
    "sourceRecordKey": "src-23c93689-e19a-4203-9c45-11b9fe00e5d0",
    "rawText": "├── درس ۱ ـ تاریخ‌نگاری و منابع دوره معاصر",
    "displayLabel": "درس ۱ ـ تاریخ‌نگاری و منابع دوره معاصر",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6039",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.history"
  },
  {
    "ref": "human.g12.history.lesson.6041",
    "sourceRecordKey": "src-da4d231d-3ead-4e26-b02b-efc57f98fac5",
    "rawText": "├── درس ۲ ـ ایران و جهان در آستانه دوره معاصر",
    "displayLabel": "درس ۲ ـ ایران و جهان در آستانه دوره معاصر",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6041",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.history"
  },
  {
    "ref": "human.g12.history.lesson.6043",
    "sourceRecordKey": "src-d8141a52-8e27-45fb-86c1-0665f007b5d1",
    "rawText": "├── درس ۳ ـ سیاست و حکومت در عصر قاجار",
    "displayLabel": "درس ۳ ـ سیاست و حکومت در عصر قاجار",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6043",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.history"
  },
  {
    "ref": "human.g12.history.lesson.6046",
    "sourceRecordKey": "src-7b03bfb3-0aa3-43d6-8390-054a683ac662",
    "rawText": "├── درس ۴ ـ اوضاع اجتماعی، اقتصادی و فرهنگی عصر قاجار",
    "displayLabel": "درس ۴ ـ اوضاع اجتماعی، اقتصادی و فرهنگی عصر قاجار",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6046",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.history"
  },
  {
    "ref": "human.g12.history.lesson.6048",
    "sourceRecordKey": "src-625184f0-0661-4581-bad1-247c59180c7b",
    "rawText": "├── درس ۵ ـ نهضت مشروطه ایران",
    "displayLabel": "درس ۵ ـ نهضت مشروطه ایران",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6048",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.history"
  },
  {
    "ref": "human.g12.history.lesson.6050",
    "sourceRecordKey": "src-53c6ecb9-497a-49ec-85f4-ce2c956485e3",
    "rawText": "├── درس ۶ ـ جنگ جهانی اول و ایران",
    "displayLabel": "درس ۶ ـ جنگ جهانی اول و ایران",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6050",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.history"
  },
  {
    "ref": "human.g12.history.lesson.6052",
    "sourceRecordKey": "src-e3f668f4-bc90-402d-9478-37931d2024c1",
    "rawText": "├── درس ۷ ـ ایران در دوره حکومت رضاشاه",
    "displayLabel": "درس ۷ ـ ایران در دوره حکومت رضاشاه",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6052",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.history"
  },
  {
    "ref": "human.g12.history.lesson.6054",
    "sourceRecordKey": "src-d10de3a7-93ca-42e6-9398-8d7336528e59",
    "rawText": "├── درس ۸ ـ جنگ جهانی دوم و جهان پس از آن",
    "displayLabel": "درس ۸ ـ جنگ جهانی دوم و جهان پس از آن",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6054",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.history"
  },
  {
    "ref": "human.g12.history.lesson.6056",
    "sourceRecordKey": "src-fb4a0695-8a99-4f60-b66c-d6143069f3c2",
    "rawText": "├── درس ۹ ـ نهضت ملی شدن صنعت نفت ایران",
    "displayLabel": "درس ۹ ـ نهضت ملی شدن صنعت نفت ایران",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6056",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.history"
  },
  {
    "ref": "human.g12.history.lesson.6058",
    "sourceRecordKey": "src-c1b446f6-5bcb-4947-ba36-21dfcf4a8ae0",
    "rawText": "├── درس ۱۰ ـ انقلاب اسلامی",
    "displayLabel": "درس ۱۰ ـ انقلاب اسلامی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6058",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.history"
  },
  {
    "ref": "human.g12.history.lesson.6060",
    "sourceRecordKey": "src-85049b44-2f06-4942-9912-052d62cb9074",
    "rawText": "├── درس ۱۱ ـ استقرار و تثبیت نظام جمهوری اسلامی",
    "displayLabel": "درس ۱۱ ـ استقرار و تثبیت نظام جمهوری اسلامی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6060",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.history"
  },
  {
    "ref": "human.g12.history.lesson.6062",
    "sourceRecordKey": "src-e9333843-fc8f-4704-a52f-b2a783468dc4",
    "rawText": "└── درس ۱۲ ـ جنگ تحمیلی و دفاع مقدس",
    "displayLabel": "درس ۱۲ ـ جنگ تحمیلی و دفاع مقدس",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6062",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.history"
  },
  {
    "ref": "human.g10.mathstats.chapter.6064",
    "sourceRecordKey": "src-030a7286-4207-4fe9-866d-2b4a2bd074a5",
    "rawText": "فصل ۱ ـ معادله درجه دوم",
    "displayLabel": "فصل ۱ ـ معادله درجه دوم",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6064",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g10.mathstats"
  },
  {
    "ref": "human.g10.mathstats.chapter.6085",
    "sourceRecordKey": "src-a8e7e7e4-29b0-4062-8ede-fc9dd1dbda19",
    "rawText": "فصل ۲ ـ تابع",
    "displayLabel": "فصل ۲ ـ تابع",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6085",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g10.mathstats"
  },
  {
    "ref": "human.g10.mathstats.chapter.6114",
    "sourceRecordKey": "src-668597fe-55c9-454d-a935-ff5b4ad44c3c",
    "rawText": "فصل ۳ ـ کار با داده‌های آماری",
    "displayLabel": "فصل ۳ ـ کار با داده‌های آماری",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6114",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g10.mathstats"
  },
  {
    "ref": "human.g10.mathstats.chapter.6133",
    "sourceRecordKey": "src-e10afed1-32f1-4359-807c-f0dae03700e7",
    "rawText": "فصل ۴ ـ نمایش داده‌ها",
    "displayLabel": "فصل ۴ ـ نمایش داده‌ها",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6133",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g10.mathstats"
  },
  {
    "ref": "human.g11.mathstats.chapter.6147",
    "sourceRecordKey": "src-005be872-668a-4cbc-994f-7080e07dd6f1",
    "rawText": "فصل ۱ ـ آشنایی با منطق و استدلال ریاضی",
    "displayLabel": "فصل ۱ ـ آشنایی با منطق و استدلال ریاضی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6147",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g11.mathstats"
  },
  {
    "ref": "human.g11.mathstats.chapter.6169",
    "sourceRecordKey": "src-d9c60d34-90a8-4d48-873c-ca59a64f2d5a",
    "rawText": "فصل ۲ ـ تابع",
    "displayLabel": "فصل ۲ ـ تابع",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6169",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g11.mathstats"
  },
  {
    "ref": "human.g11.mathstats.chapter.6197",
    "sourceRecordKey": "src-70e55d5b-0a08-410f-9102-5679679b8658",
    "rawText": "فصل ۳ ـ آمار",
    "displayLabel": "فصل ۳ ـ آمار",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6197",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g11.mathstats"
  },
  {
    "ref": "human.g11.mathstats.chapter.6222",
    "sourceRecordKey": "src-4706ec08-3f03-45b0-acbd-6e73c9316d21",
    "rawText": "فصل ۴ ـ آمار استنباطی",
    "displayLabel": "فصل ۴ ـ آمار استنباطی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6222",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g11.mathstats"
  },
  {
    "ref": "human.g12.mathstats.chapter.6240",
    "sourceRecordKey": "src-20e8befa-8f27-46d6-a560-629460f3bb22",
    "rawText": "فصل ۱ ـ آمار و احتمال",
    "displayLabel": "فصل ۱ ـ آمار و احتمال",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6240",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g12.mathstats"
  },
  {
    "ref": "human.g12.mathstats.chapter.6263",
    "sourceRecordKey": "src-72b343b8-6213-43ca-9f1f-c0415c1295aa",
    "rawText": "فصل ۲ ـ الگوهای خطی",
    "displayLabel": "فصل ۲ ـ الگوهای خطی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6263",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g12.mathstats"
  },
  {
    "ref": "human.g12.mathstats.chapter.6278",
    "sourceRecordKey": "src-e81ba946-e5e1-44b0-9f95-eb96906fa861",
    "rawText": "فصل ۳ ـ الگوهای غیرخطی",
    "displayLabel": "فصل ۳ ـ الگوهای غیرخطی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6278",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g12.mathstats"
  },
  {
    "ref": "human.g10.geography.chapter.6299",
    "sourceRecordKey": "src-6aec62ab-ed01-42c7-9ae7-39470a544dae",
    "rawText": "فصل ۱ ـ جغرافیا چیست؟",
    "displayLabel": "فصل ۱ ـ جغرافیا چیست؟",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6299",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g10.geography"
  },
  {
    "ref": "human.g10.geography.lesson.6301",
    "sourceRecordKey": "src-13f7910d-84a1-402b-8458-1cf9cab810cd",
    "rawText": "├── درس ۱ ـ جغرافیا، علمی برای زندگی بهتر",
    "displayLabel": "درس ۱ ـ جغرافیا، علمی برای زندگی بهتر",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6301",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.geography.chapter.6299"
  },
  {
    "ref": "human.g10.geography.lesson.6306",
    "sourceRecordKey": "src-8ab7588b-78a0-40d4-8483-8cc394d322d0",
    "rawText": "└── درس ۲ ـ روش مطالعه و پژوهش در جغرافیا",
    "displayLabel": "درس ۲ ـ روش مطالعه و پژوهش در جغرافیا",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6306",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.geography.chapter.6299"
  },
  {
    "ref": "human.g10.geography.chapter.6310",
    "sourceRecordKey": "src-53d4870d-7326-49ca-887a-8fbc5a40d743",
    "rawText": "فصل ۲ ـ جغرافیای طبیعی ایران",
    "displayLabel": "فصل ۲ ـ جغرافیای طبیعی ایران",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6310",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g10.geography"
  },
  {
    "ref": "human.g10.geography.lesson.6312",
    "sourceRecordKey": "src-e1e33ebc-1116-4460-9ae8-efa6bb6e7065",
    "rawText": "├── درس ۳ ـ موقعیت جغرافیایی ایران",
    "displayLabel": "درس ۳ ـ موقعیت جغرافیایی ایران",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6312",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.geography.chapter.6310"
  },
  {
    "ref": "human.g10.geography.lesson.6316",
    "sourceRecordKey": "src-2b3d2298-5dcf-4fec-ba2e-e1859f904fc9",
    "rawText": "├── درس ۴ ـ ناهمواری‌های ایران",
    "displayLabel": "درس ۴ ـ ناهمواری‌های ایران",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6316",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.geography.chapter.6310"
  },
  {
    "ref": "human.g10.geography.lesson.6320",
    "sourceRecordKey": "src-491391d0-70f3-4997-8309-befec57f3a00",
    "rawText": "├── درس ۵ ـ آب و هوای ایران",
    "displayLabel": "درس ۵ ـ آب و هوای ایران",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6320",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.geography.chapter.6310"
  },
  {
    "ref": "human.g10.geography.lesson.6324",
    "sourceRecordKey": "src-a9804828-64c7-48cf-9c52-e6338d49af42",
    "rawText": "└── درس ۶ ـ منابع آب ایران",
    "displayLabel": "درس ۶ ـ منابع آب ایران",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6324",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.geography.chapter.6310"
  },
  {
    "ref": "human.g10.geography.chapter.6327",
    "sourceRecordKey": "src-ae3bef77-ed39-43fb-b647-f7de9108c37a",
    "rawText": "فصل ۳ ـ جغرافیای انسانی ایران",
    "displayLabel": "فصل ۳ ـ جغرافیای انسانی ایران",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6327",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g10.geography"
  },
  {
    "ref": "human.g10.geography.lesson.6329",
    "sourceRecordKey": "src-4a3200cd-9166-4cd3-8483-ad0764544aa5",
    "rawText": "├── درس ۷ ـ ویژگی‌های جمعیت ایران",
    "displayLabel": "درس ۷ ـ ویژگی‌های جمعیت ایران",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6329",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.geography.chapter.6327"
  },
  {
    "ref": "human.g10.geography.lesson.6333",
    "sourceRecordKey": "src-f697c584-8aa6-46ed-bb09-5d9e35037316",
    "rawText": "├── درس ۸ ـ تقسیمات کشوری ایران",
    "displayLabel": "درس ۸ ـ تقسیمات کشوری ایران",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6333",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.geography.chapter.6327"
  },
  {
    "ref": "human.g10.geography.lesson.6337",
    "sourceRecordKey": "src-3de7bee6-fd25-417d-b96b-cd6e7b032e27",
    "rawText": "├── درس ۹ ـ سکونتگاه‌های ایران",
    "displayLabel": "درس ۹ ـ سکونتگاه‌های ایران",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6337",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.geography.chapter.6327"
  },
  {
    "ref": "human.g10.geography.lesson.6341",
    "sourceRecordKey": "src-e94bb86a-8a16-4345-8e99-aa6ef1bd3962",
    "rawText": "└── درس ۱۰ ـ توان‌های اقتصادی ایران",
    "displayLabel": "درس ۱۰ ـ توان‌های اقتصادی ایران",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6341",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.geography.chapter.6327"
  },
  {
    "ref": "human.g11.geography.chapter.6347",
    "sourceRecordKey": "src-70c93133-a727-4113-a770-9718c83f2dab",
    "rawText": "فصل ۱ ـ ناحیه چیست؟",
    "displayLabel": "فصل ۱ ـ ناحیه چیست؟",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6347",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g11.geography"
  },
  {
    "ref": "human.g11.geography.lesson.6349",
    "sourceRecordKey": "src-41ceb770-cd44-41d7-9893-d93e6dd63488",
    "rawText": "├── درس ۱ ـ معنا و مفهوم ناحیه",
    "displayLabel": "درس ۱ ـ معنا و مفهوم ناحیه",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6349",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.geography.chapter.6347"
  },
  {
    "ref": "human.g11.geography.lesson.6354",
    "sourceRecordKey": "src-37baf825-5de4-472b-b2e4-0065494e0ddf",
    "rawText": "└── درس ۲ ـ انسان و ناحیه",
    "displayLabel": "درس ۲ ـ انسان و ناحیه",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6354",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.geography.chapter.6347"
  },
  {
    "ref": "human.g11.geography.chapter.6358",
    "sourceRecordKey": "src-9cecba42-5d96-4df0-8599-4cd29bedb2fa",
    "rawText": "فصل ۲ ـ نواحی طبیعی",
    "displayLabel": "فصل ۲ ـ نواحی طبیعی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6358",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g11.geography"
  },
  {
    "ref": "human.g11.geography.lesson.6360",
    "sourceRecordKey": "src-d3434b6d-8543-4df1-832b-8880520def5a",
    "rawText": "├── درس ۳ ـ نواحی آب و هوایی",
    "displayLabel": "درس ۳ ـ نواحی آب و هوایی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6360",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.geography.chapter.6358"
  },
  {
    "ref": "human.g11.geography.lesson.6365",
    "sourceRecordKey": "src-ac84a46d-36c6-4e3e-9560-26615d597cdc",
    "rawText": "├── درس ۴ ـ ناهمواری‌ها و اشکال زمین",
    "displayLabel": "درس ۴ ـ ناهمواری‌ها و اشکال زمین",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6365",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.geography.chapter.6358"
  },
  {
    "ref": "human.g11.geography.lesson.6370",
    "sourceRecordKey": "src-12527212-d2c8-486b-92cc-a91bc0c995d8",
    "rawText": "└── درس ۵ ـ نواحی زیستی",
    "displayLabel": "درس ۵ ـ نواحی زیستی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6370",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.geography.chapter.6358"
  },
  {
    "ref": "human.g11.geography.chapter.6374",
    "sourceRecordKey": "src-834f431b-ea71-485d-968b-832869019a80",
    "rawText": "فصل ۳ ـ نواحی انسانی",
    "displayLabel": "فصل ۳ ـ نواحی انسانی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6374",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g11.geography"
  },
  {
    "ref": "human.g11.geography.lesson.6376",
    "sourceRecordKey": "src-0cfe030c-5274-4dd5-b94e-bcd9355d54a8",
    "rawText": "├── درس ۶ ـ نواحی فرهنگی",
    "displayLabel": "درس ۶ ـ نواحی فرهنگی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6376",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.geography.chapter.6374"
  },
  {
    "ref": "human.g11.geography.lesson.6381",
    "sourceRecordKey": "src-b3351e2e-e3bc-4ca0-a0f3-4cb513e6a188",
    "rawText": "├── درس ۷ ـ نواحی اقتصادی (کشاورزی و صنعت)",
    "displayLabel": "درس ۷ ـ نواحی اقتصادی (کشاورزی و صنعت)",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6381",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.geography.chapter.6374"
  },
  {
    "ref": "human.g11.geography.lesson.6386",
    "sourceRecordKey": "src-578b3b94-a2c6-456b-a20c-708a5770a7a3",
    "rawText": "└── درس ۸ ـ نواحی اقتصادی (تجارت و اقتصاد جهانی)",
    "displayLabel": "درس ۸ ـ نواحی اقتصادی (تجارت و اقتصاد جهانی)",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6386",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.geography.chapter.6374"
  },
  {
    "ref": "human.g11.geography.chapter.6390",
    "sourceRecordKey": "src-c7dcd264-5e3a-4b3c-95da-51f6979b3172",
    "rawText": "فصل ۴ ـ نواحی سیاسی",
    "displayLabel": "فصل ۴ ـ نواحی سیاسی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6390",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g11.geography"
  },
  {
    "ref": "human.g11.geography.lesson.6392",
    "sourceRecordKey": "src-0c3fa2dd-54bb-4e37-9152-4086370dbee1",
    "rawText": "├── درس ۹ ـ معنا و مفهوم ناحیه سیاسی",
    "displayLabel": "درس ۹ ـ معنا و مفهوم ناحیه سیاسی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6392",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.geography.chapter.6390"
  },
  {
    "ref": "human.g11.geography.lesson.6397",
    "sourceRecordKey": "src-2a52c6b8-9a6f-4d96-9dd2-499bc65f0812",
    "rawText": "├── درس ۱۰ ـ کشور، یک ناحیه سیاسی",
    "displayLabel": "درس ۱۰ ـ کشور، یک ناحیه سیاسی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6397",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.geography.chapter.6390"
  },
  {
    "ref": "human.g11.geography.lesson.6402",
    "sourceRecordKey": "src-3ce65715-bfe2-4e32-b7b2-fc5805f9d4c7",
    "rawText": "└── درس ۱۱ ـ ژئوپلیتیک",
    "displayLabel": "درس ۱۱ ـ ژئوپلیتیک",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6402",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.geography.chapter.6390"
  },
  {
    "ref": "human.g12.geography.chapter.6408",
    "sourceRecordKey": "src-454791b6-abb2-423e-869a-09fb04fc6723",
    "rawText": "فصل ۱ ـ جغرافیای سکونتگاه‌ها",
    "displayLabel": "فصل ۱ ـ جغرافیای سکونتگاه‌ها",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6408",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g12.geography"
  },
  {
    "ref": "human.g12.geography.lesson.6410",
    "sourceRecordKey": "src-0bec568b-9b11-4562-a927-f2d49e71f26c",
    "rawText": "├── درس ۱ ـ شهرها و روستاها",
    "displayLabel": "درس ۱ ـ شهرها و روستاها",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6410",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.geography.chapter.6408"
  },
  {
    "ref": "human.g12.geography.lesson.6416",
    "sourceRecordKey": "src-6fe908ae-e439-4d5e-8405-36a3198ea731",
    "rawText": "└── درس ۲ ـ مدیریت شهر و روستا",
    "displayLabel": "درس ۲ ـ مدیریت شهر و روستا",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6416",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.geography.chapter.6408"
  },
  {
    "ref": "human.g12.geography.chapter.6420",
    "sourceRecordKey": "src-2f9515bb-8549-4950-adda-bfc0d94ff562",
    "rawText": "فصل ۲ ـ جغرافیای حمل و نقل",
    "displayLabel": "فصل ۲ ـ جغرافیای حمل و نقل",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6420",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g12.geography"
  },
  {
    "ref": "human.g12.geography.lesson.6422",
    "sourceRecordKey": "src-7d701516-fbf5-4fb3-a2c4-bc580bcbc5a0",
    "rawText": "├── درس ۳ ـ ویژگی‌ها و انواع شیوه‌های حمل و نقل",
    "displayLabel": "درس ۳ ـ ویژگی‌ها و انواع شیوه‌های حمل و نقل",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6422",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.geography.chapter.6420"
  },
  {
    "ref": "human.g12.geography.lesson.6428",
    "sourceRecordKey": "src-993032b3-0f05-4cc3-9004-123e379e464f",
    "rawText": "└── درس ۴ ـ مدیریت حمل و نقل",
    "displayLabel": "درس ۴ ـ مدیریت حمل و نقل",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6428",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.geography.chapter.6420"
  },
  {
    "ref": "human.g12.geography.chapter.6432",
    "sourceRecordKey": "src-e9cf75de-7386-416d-a122-6ae6f0cff552",
    "rawText": "فصل ۳ ـ مخاطرات طبیعی",
    "displayLabel": "فصل ۳ ـ مخاطرات طبیعی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6432",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g12.geography"
  },
  {
    "ref": "human.g12.geography.lesson.6434",
    "sourceRecordKey": "src-aba2d95c-365b-4cc9-987d-8324b908aa27",
    "rawText": "├── درس ۵ ـ ویژگی‌ها و انواع مخاطرات طبیعی",
    "displayLabel": "درس ۵ ـ ویژگی‌ها و انواع مخاطرات طبیعی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6434",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.geography.chapter.6432"
  },
  {
    "ref": "human.g12.geography.lesson.6439",
    "sourceRecordKey": "src-a856e62a-67b5-404f-869d-c3fa3ebab079",
    "rawText": "└── درس ۶ ـ مدیریت مخاطرات طبیعی",
    "displayLabel": "درس ۶ ـ مدیریت مخاطرات طبیعی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6439",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.geography.chapter.6432"
  },
  {
    "ref": "human.g10.logic.chapter.6444",
    "sourceRecordKey": "src-40f5fd1e-06e8-4747-9786-b3bdc252b641",
    "rawText": "بخش ۱ ـ منطق و مباحث آن",
    "displayLabel": "بخش ۱ ـ منطق و مباحث آن",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6444",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g10.logic"
  },
  {
    "ref": "human.g10.logic.lesson.6446",
    "sourceRecordKey": "src-384b98bc-4518-4671-b4a5-801422c1c817",
    "rawText": "└── درس ۱ ـ منطق، ترازوی اندیشه",
    "displayLabel": "درس ۱ ـ منطق، ترازوی اندیشه",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6446",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.logic.chapter.6444"
  },
  {
    "ref": "human.g10.logic.chapter.6450",
    "sourceRecordKey": "src-5061571f-55e5-4103-8cc6-65ec2b5c749d",
    "rawText": "بخش ۲ ـ روابط میان ذهن، زبان و خارج",
    "displayLabel": "بخش ۲ ـ روابط میان ذهن، زبان و خارج",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6450",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g10.logic"
  },
  {
    "ref": "human.g10.logic.lesson.6452",
    "sourceRecordKey": "src-34f73e0e-436d-4d60-9d8a-a58bf3a549fc",
    "rawText": "├── درس ۲ ـ لفظ و معنا",
    "displayLabel": "درس ۲ ـ لفظ و معنا",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6452",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.logic.chapter.6450"
  },
  {
    "ref": "human.g10.logic.lesson.6457",
    "sourceRecordKey": "src-d20e57ee-6746-4dd7-a396-b2194e2ae510",
    "rawText": "└── درس ۳ ـ مفهوم و مصداق",
    "displayLabel": "درس ۳ ـ مفهوم و مصداق",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6457",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.logic.chapter.6450"
  },
  {
    "ref": "human.g10.logic.chapter.6461",
    "sourceRecordKey": "src-a7e54597-b75a-4f1b-853b-3f2ab6766c25",
    "rawText": "بخش ۳ ـ تعریف",
    "displayLabel": "بخش ۳ ـ تعریف",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6461",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g10.logic"
  },
  {
    "ref": "human.g10.logic.lesson.6463",
    "sourceRecordKey": "src-f8adde2b-9340-40c4-9f6c-8acbc65844ad",
    "rawText": "└── درس ۴ ـ اقسام و شرایط تعریف",
    "displayLabel": "درس ۴ ـ اقسام و شرایط تعریف",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6463",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.logic.chapter.6461"
  },
  {
    "ref": "human.g10.logic.chapter.6467",
    "sourceRecordKey": "src-bebf758c-3da4-4950-84fb-7d0f75006591",
    "rawText": "بخش ۴ ـ استدلال استقرایی",
    "displayLabel": "بخش ۴ ـ استدلال استقرایی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6467",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g10.logic"
  },
  {
    "ref": "human.g10.logic.lesson.6469",
    "sourceRecordKey": "src-9ad43d53-54c4-434b-914b-c7e3d4c62a77",
    "rawText": "└── درس ۵ ـ اقسام استدلال استقرایی",
    "displayLabel": "درس ۵ ـ اقسام استدلال استقرایی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6469",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.logic.chapter.6467"
  },
  {
    "ref": "human.g10.logic.chapter.6473",
    "sourceRecordKey": "src-e628dc6a-bf52-4c27-b30d-ed8eced066f8",
    "rawText": "بخش ۵ ـ قضیه حملی و قیاس اقترانی",
    "displayLabel": "بخش ۵ ـ قضیه حملی و قیاس اقترانی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6473",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g10.logic"
  },
  {
    "ref": "human.g10.logic.lesson.6475",
    "sourceRecordKey": "src-8b1366ea-7bce-4113-bcb0-96a79eeb08c9",
    "rawText": "├── درس ۶ ـ قضیه حملی",
    "displayLabel": "درس ۶ ـ قضیه حملی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6475",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.logic.chapter.6473"
  },
  {
    "ref": "human.g10.logic.lesson.6480",
    "sourceRecordKey": "src-cf52d3a5-11e5-4aa5-8c1a-75de67a3a7db",
    "rawText": "├── درس ۷ ـ احکام قضایا",
    "displayLabel": "درس ۷ ـ احکام قضایا",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6480",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.logic.chapter.6473"
  },
  {
    "ref": "human.g10.logic.lesson.6485",
    "sourceRecordKey": "src-8c7c5a65-3d95-47f2-ae94-6c630a7664a9",
    "rawText": "└── درس ۸ ـ قیاس اقترانی",
    "displayLabel": "درس ۸ ـ قیاس اقترانی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6485",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.logic.chapter.6473"
  },
  {
    "ref": "human.g10.logic.chapter.6489",
    "sourceRecordKey": "src-443f6b4c-fde7-45e9-b2f1-1a9b3587a370",
    "rawText": "بخش ۶ ـ قضیه شرطی و قیاس استثنایی",
    "displayLabel": "بخش ۶ ـ قضیه شرطی و قیاس استثنایی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6489",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g10.logic"
  },
  {
    "ref": "human.g10.logic.lesson.6491",
    "sourceRecordKey": "src-1289b146-cd30-44eb-81a0-f896d395d47d",
    "rawText": "└── درس ۹ ـ قضیه شرطی و قیاس استثنایی",
    "displayLabel": "درس ۹ ـ قضیه شرطی و قیاس استثنایی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6491",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.logic.chapter.6489"
  },
  {
    "ref": "human.g10.logic.chapter.6495",
    "sourceRecordKey": "src-bd20e2af-3ffc-4fb8-883d-7efec479cf4b",
    "rawText": "بخش ۷ ـ منطق کاربردی",
    "displayLabel": "بخش ۷ ـ منطق کاربردی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6495",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g10.logic"
  },
  {
    "ref": "human.g10.logic.lesson.6497",
    "sourceRecordKey": "src-9533b022-d255-4095-8c3b-ed7fca73347a",
    "rawText": "└── درس ۱۰ ـ سنجشگری در تفکر",
    "displayLabel": "درس ۱۰ ـ سنجشگری در تفکر",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6497",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.logic.chapter.6495"
  },
  {
    "ref": "human.g10.economics.chapter.6502",
    "sourceRecordKey": "src-d7169ba4-343d-4590-b714-a2be926a34c1",
    "rawText": "فصل ۱ ـ اصول انتخاب در کسب‌وکار",
    "displayLabel": "فصل ۱ ـ اصول انتخاب در کسب‌وکار",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6502",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g10.economics"
  },
  {
    "ref": "human.g10.economics.lesson.6504",
    "sourceRecordKey": "src-fa08b5bd-0344-43bc-a2ad-e5601ad7b0a6",
    "rawText": "├── درس ۱ ـ کسب‌وکار و کارآفرینی",
    "displayLabel": "درس ۱ ـ کسب‌وکار و کارآفرینی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6504",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.economics.chapter.6502"
  },
  {
    "ref": "human.g10.economics.lesson.6509",
    "sourceRecordKey": "src-d080eeb6-07b7-4884-a8be-10aeeab2d24a",
    "rawText": "├── درس ۲ ـ انتخاب نوع کسب‌وکار",
    "displayLabel": "درس ۲ ـ انتخاب نوع کسب‌وکار",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6509",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.economics.chapter.6502"
  },
  {
    "ref": "human.g10.economics.lesson.6514",
    "sourceRecordKey": "src-accb7b29-be1d-4324-8d19-0ce79a11dcc1",
    "rawText": "├── درس ۳ ـ اصول انتخاب درست",
    "displayLabel": "درس ۳ ـ اصول انتخاب درست",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6514",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.economics.chapter.6502"
  },
  {
    "ref": "human.g10.economics.lesson.6519",
    "sourceRecordKey": "src-85a75560-303d-49c1-a623-666cea038790",
    "rawText": "└── درس ۴ ـ مرز امکانات تولید",
    "displayLabel": "درس ۴ ـ مرز امکانات تولید",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6519",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.economics.chapter.6502"
  },
  {
    "ref": "human.g10.economics.chapter.6523",
    "sourceRecordKey": "src-2057db81-6456-457e-bd61-bf9ae455134f",
    "rawText": "فصل ۲ ـ بازیگران اصلی در میدان اقتصاد",
    "displayLabel": "فصل ۲ ـ بازیگران اصلی در میدان اقتصاد",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6523",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g10.economics"
  },
  {
    "ref": "human.g10.economics.lesson.6525",
    "sourceRecordKey": "src-51d4cd1c-dd43-4ab4-9944-c75c15aeeec5",
    "rawText": "├── درس ۵ ـ بازار چیست و چگونه عمل می‌کند؟",
    "displayLabel": "درس ۵ ـ بازار چیست و چگونه عمل می‌کند؟",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6525",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.economics.chapter.6523"
  },
  {
    "ref": "human.g10.economics.lesson.6530",
    "sourceRecordKey": "src-45472d3c-d928-4b15-b4c2-388ca505f3ae",
    "rawText": "├── درس ۶ ـ نقش دولت در اقتصاد چیست؟",
    "displayLabel": "درس ۶ ـ نقش دولت در اقتصاد چیست؟",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6530",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.economics.chapter.6523"
  },
  {
    "ref": "human.g10.economics.lesson.6535",
    "sourceRecordKey": "src-b7a78a30-2335-48bd-937e-b0ef2095087a",
    "rawText": "└── درس ۷ ـ تجارت بین‌الملل",
    "displayLabel": "درس ۷ ـ تجارت بین‌الملل",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6535",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.economics.chapter.6523"
  },
  {
    "ref": "human.g10.economics.chapter.6539",
    "sourceRecordKey": "src-46f72e07-4dfa-44c4-b46e-d0d35bccd7b3",
    "rawText": "فصل ۳ ـ رشد و پیشرفت اقتصادی",
    "displayLabel": "فصل ۳ ـ رشد و پیشرفت اقتصادی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6539",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g10.economics"
  },
  {
    "ref": "human.g10.economics.lesson.6541",
    "sourceRecordKey": "src-55ddf880-fb95-47b9-97c3-80862b1f6775",
    "rawText": "├── درس ۸ ـ رکود، بیکاری و فقر",
    "displayLabel": "درس ۸ ـ رکود، بیکاری و فقر",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6541",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.economics.chapter.6539"
  },
  {
    "ref": "human.g10.economics.lesson.6546",
    "sourceRecordKey": "src-b6833a58-662d-4e00-af58-c99994556773",
    "rawText": "├── درس ۹ ـ تورم و کاهش قدرت خرید",
    "displayLabel": "درس ۹ ـ تورم و کاهش قدرت خرید",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6546",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.economics.chapter.6539"
  },
  {
    "ref": "human.g10.economics.lesson.6551",
    "sourceRecordKey": "src-e1ea7b77-f77b-42b0-bb89-8a24a1e218cb",
    "rawText": "├── درس ۱۰ ـ مقاوم‌سازی اقتصاد",
    "displayLabel": "درس ۱۰ ـ مقاوم‌سازی اقتصاد",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6551",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.economics.chapter.6539"
  },
  {
    "ref": "human.g10.economics.lesson.6556",
    "sourceRecordKey": "src-fa509cf0-d311-446e-9c5a-bf36c34d19e6",
    "rawText": "└── درس ۱۱ ـ رشد و پیشرفت اقتصادی",
    "displayLabel": "درس ۱۱ ـ رشد و پیشرفت اقتصادی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6556",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.economics.chapter.6539"
  },
  {
    "ref": "human.g10.economics.chapter.6560",
    "sourceRecordKey": "src-771dfdde-0342-4579-b10f-fa08a988b3db",
    "rawText": "فصل ۴ ـ اقتصاد در خانواده",
    "displayLabel": "فصل ۴ ـ اقتصاد در خانواده",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6560",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g10.economics"
  },
  {
    "ref": "human.g10.economics.lesson.6562",
    "sourceRecordKey": "src-33b7d5fa-51b9-4de8-9b54-5b28de9bea65",
    "rawText": "├── درس ۱۲ ـ بودجه‌بندی",
    "displayLabel": "درس ۱۲ ـ بودجه‌بندی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6562",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.economics.chapter.6560"
  },
  {
    "ref": "human.g10.economics.lesson.6567",
    "sourceRecordKey": "src-9aafe53e-2bec-46e1-8cd0-cbbf444cd642",
    "rawText": "├── درس ۱۳ ـ تصمیم‌گیری در مخارج",
    "displayLabel": "درس ۱۳ ـ تصمیم‌گیری در مخارج",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6567",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.economics.chapter.6560"
  },
  {
    "ref": "human.g10.economics.lesson.6572",
    "sourceRecordKey": "src-95694925-6273-439c-94fe-40efb5209c21",
    "rawText": "└── درس ۱۴ ـ پس‌انداز و سرمایه‌گذاری",
    "displayLabel": "درس ۱۴ ـ پس‌انداز و سرمایه‌گذاری",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6572",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g10.economics.chapter.6560"
  },
  {
    "ref": "human.g11.psychology.lesson.6577",
    "sourceRecordKey": "src-91fd6c5f-cc1f-45a4-ba4f-e2c1b12a4d53",
    "rawText": "درس ۱ ـ روان‌شناسی: تعریف و روش مورد مطالعه",
    "displayLabel": "درس ۱ ـ روان‌شناسی: تعریف و روش مورد مطالعه",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6577",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.psychology"
  },
  {
    "ref": "human.g11.psychology.lesson.6586",
    "sourceRecordKey": "src-cb57886a-9978-4246-a986-13fd9b01918e",
    "rawText": "درس ۲ ـ روان‌شناسی رشد",
    "displayLabel": "درس ۲ ـ روان‌شناسی رشد",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6586",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.psychology"
  },
  {
    "ref": "human.g11.psychology.lesson.6595",
    "sourceRecordKey": "src-d1d35c28-9dfc-4973-852a-2e94189ebe86",
    "rawText": "درس ۳ ـ احساس، توجه، ادراک",
    "displayLabel": "درس ۳ ـ احساس، توجه، ادراک",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6595",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.psychology"
  },
  {
    "ref": "human.g11.psychology.lesson.6604",
    "sourceRecordKey": "src-db07f982-60a7-4a7d-983b-12bd0ffe94fb",
    "rawText": "درس ۴ ـ حافظه و علل فراموشی",
    "displayLabel": "درس ۴ ـ حافظه و علل فراموشی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6604",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.psychology"
  },
  {
    "ref": "human.g11.psychology.lesson.6613",
    "sourceRecordKey": "src-3185b357-4717-465e-8709-0541f63836d7",
    "rawText": "درس ۵ ـ تفکر (۱): حل مسئله",
    "displayLabel": "درس ۵ ـ تفکر (۱): حل مسئله",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6613",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.psychology"
  },
  {
    "ref": "human.g11.psychology.lesson.6622",
    "sourceRecordKey": "src-3f7e992e-1ac6-4f42-81d4-fcc0fc8d4307",
    "rawText": "درس ۶ ـ تفکر (۲): تصمیم‌گیری",
    "displayLabel": "درس ۶ ـ تفکر (۲): تصمیم‌گیری",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6622",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.psychology"
  },
  {
    "ref": "human.g11.psychology.lesson.6631",
    "sourceRecordKey": "src-52181b86-6617-47f9-88fa-a492bbf70b11",
    "rawText": "درس ۷ ـ انگیزه و نگرش",
    "displayLabel": "درس ۷ ـ انگیزه و نگرش",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6631",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.psychology"
  },
  {
    "ref": "human.g11.psychology.lesson.6640",
    "sourceRecordKey": "src-73c06090-5201-48e8-b351-57e3d4784cfc",
    "rawText": "درس ۸ ـ روان‌شناسی سلامت",
    "displayLabel": "درس ۸ ـ روان‌شناسی سلامت",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6640",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.psychology"
  },
  {
    "ref": "human.g11.philosophy.chapter.6650",
    "sourceRecordKey": "src-ae1740b7-ecde-41e1-a530-44f821d872b5",
    "rawText": "فصل ۱ ـ فلسفه و ابعاد آن",
    "displayLabel": "فصل ۱ ـ فلسفه و ابعاد آن",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6650",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g11.philosophy"
  },
  {
    "ref": "human.g11.philosophy.lesson.6652",
    "sourceRecordKey": "src-195435c5-d614-4cfc-8a0e-cd3ebfe7e178",
    "rawText": "├── درس ۱ ـ چیستی فلسفه",
    "displayLabel": "درس ۱ ـ چیستی فلسفه",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6652",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.philosophy.chapter.6650"
  },
  {
    "ref": "human.g11.philosophy.lesson.6658",
    "sourceRecordKey": "src-ff51c466-90e8-4b84-98d7-71ad5d51fd87",
    "rawText": "├── درس ۲ ـ ریشه و شاخه‌های فلسفه",
    "displayLabel": "درس ۲ ـ ریشه و شاخه‌های فلسفه",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6658",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.philosophy.chapter.6650"
  },
  {
    "ref": "human.g11.philosophy.lesson.6663",
    "sourceRecordKey": "src-c67a9e89-49b2-499d-8838-fc093641b850",
    "rawText": "├── درس ۳ ـ فلسفه و زندگی",
    "displayLabel": "درس ۳ ـ فلسفه و زندگی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6663",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.philosophy.chapter.6650"
  },
  {
    "ref": "human.g11.philosophy.lesson.6668",
    "sourceRecordKey": "src-5a5f3652-ac74-43c4-95ee-febac8ac69df",
    "rawText": "├── درس ۴ ـ آغاز تاریخی فلسفه",
    "displayLabel": "درس ۴ ـ آغاز تاریخی فلسفه",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6668",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.philosophy.chapter.6650"
  },
  {
    "ref": "human.g11.philosophy.lesson.6673",
    "sourceRecordKey": "src-b7da0fe7-44cc-4a27-9796-d642076bc533",
    "rawText": "└── درس ۵ ـ زندگی بر اساس اندیشه",
    "displayLabel": "درس ۵ ـ زندگی بر اساس اندیشه",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6673",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.philosophy.chapter.6650"
  },
  {
    "ref": "human.g11.philosophy.chapter.6677",
    "sourceRecordKey": "src-c4334c65-ed9e-439a-9053-eeef34b63a98",
    "rawText": "فصل ۲ ـ معرفت و شناخت",
    "displayLabel": "فصل ۲ ـ معرفت و شناخت",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6677",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g11.philosophy"
  },
  {
    "ref": "human.g11.philosophy.lesson.6679",
    "sourceRecordKey": "src-77042349-4532-4093-9b1d-3a5fcbb19119",
    "rawText": "├── درس ۶ ـ امکان شناخت",
    "displayLabel": "درس ۶ ـ امکان شناخت",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6679",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.philosophy.chapter.6677"
  },
  {
    "ref": "human.g11.philosophy.lesson.6684",
    "sourceRecordKey": "src-9e602f4a-4cf9-4a04-a7d3-8bbbd52a314c",
    "rawText": "├── درس ۷ ـ ابزارهای شناخت",
    "displayLabel": "درس ۷ ـ ابزارهای شناخت",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6684",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.philosophy.chapter.6677"
  },
  {
    "ref": "human.g11.philosophy.lesson.6689",
    "sourceRecordKey": "src-de7c97cb-dbab-46f8-a6aa-e5074862653b",
    "rawText": "└── درس ۸ ـ نگاهی به تاریخچه معرفت",
    "displayLabel": "درس ۸ ـ نگاهی به تاریخچه معرفت",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6689",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.philosophy.chapter.6677"
  },
  {
    "ref": "human.g11.philosophy.chapter.6693",
    "sourceRecordKey": "src-ea235d45-4a70-42a7-a571-eb6bf2340d16",
    "rawText": "فصل ۳ ـ انسان",
    "displayLabel": "فصل ۳ ـ انسان",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6693",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g11.philosophy"
  },
  {
    "ref": "human.g11.philosophy.lesson.6695",
    "sourceRecordKey": "src-11d5919f-e795-4cf8-ab0c-5a4033d6fc43",
    "rawText": "├── درس ۹ ـ چیستی انسان (۱)",
    "displayLabel": "درس ۹ ـ چیستی انسان (۱)",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6695",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.philosophy.chapter.6693"
  },
  {
    "ref": "human.g11.philosophy.lesson.6700",
    "sourceRecordKey": "src-70d3b1da-b9bc-48c5-aabf-846052c45278",
    "rawText": "├── درس ۱۰ ـ چیستی انسان (۲)",
    "displayLabel": "درس ۱۰ ـ چیستی انسان (۲)",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6700",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.philosophy.chapter.6693"
  },
  {
    "ref": "human.g11.philosophy.lesson.6705",
    "sourceRecordKey": "src-b7184cf2-c1a8-406f-ab28-2b47be3e992b",
    "rawText": "└── درس ۱۱ ـ انسان، موجود اخلاق‌گرا",
    "displayLabel": "درس ۱۱ ـ انسان، موجود اخلاق‌گرا",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6705",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g11.philosophy.chapter.6693"
  },
  {
    "ref": "human.g12.philosophy.chapter.6710",
    "sourceRecordKey": "src-c59f9f2d-45e1-4bea-85e4-15909c0db1a4",
    "rawText": "بخش ۱ ـ پیرامون واقعیت و هستی",
    "displayLabel": "بخش ۱ ـ پیرامون واقعیت و هستی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6710",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g12.philosophy"
  },
  {
    "ref": "human.g12.philosophy.lesson.6712",
    "sourceRecordKey": "src-a1815571-8a05-46b9-8919-1358170e4019",
    "rawText": "├── درس ۱ ـ هستی و چیستی",
    "displayLabel": "درس ۱ ـ هستی و چیستی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6712",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.philosophy.chapter.6710"
  },
  {
    "ref": "human.g12.philosophy.lesson.6717",
    "sourceRecordKey": "src-716f52ed-c234-46c4-bf54-38c6c2eb7cfc",
    "rawText": "├── درس ۲ ـ جهان ممکنات",
    "displayLabel": "درس ۲ ـ جهان ممکنات",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6717",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.philosophy.chapter.6710"
  },
  {
    "ref": "human.g12.philosophy.lesson.6722",
    "sourceRecordKey": "src-b386d726-8634-4d9f-ade7-5f9c31980578",
    "rawText": "├── درس ۳ ـ جهان علّی و معلولی",
    "displayLabel": "درس ۳ ـ جهان علّی و معلولی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6722",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.philosophy.chapter.6710"
  },
  {
    "ref": "human.g12.philosophy.lesson.6727",
    "sourceRecordKey": "src-203f61d4-42b4-4c81-9200-62e70e0ac305",
    "rawText": "└── درس ۴ ـ کدام تصویر از جهان؟",
    "displayLabel": "درس ۴ ـ کدام تصویر از جهان؟",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6727",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.philosophy.chapter.6710"
  },
  {
    "ref": "human.g12.philosophy.chapter.6731",
    "sourceRecordKey": "src-8f608c55-ce87-448e-ac0b-426d19b07daa",
    "rawText": "بخش ۲ ـ پیرامون خدا و عقل",
    "displayLabel": "بخش ۲ ـ پیرامون خدا و عقل",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6731",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g12.philosophy"
  },
  {
    "ref": "human.g12.philosophy.lesson.6733",
    "sourceRecordKey": "src-a12f902b-b093-4413-808b-33b5980bf0c7",
    "rawText": "├── درس ۵ ـ خدا در فلسفه (۱)",
    "displayLabel": "درس ۵ ـ خدا در فلسفه (۱)",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6733",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.philosophy.chapter.6731"
  },
  {
    "ref": "human.g12.philosophy.lesson.6738",
    "sourceRecordKey": "src-807a6ae3-5cac-40e5-8170-8f86a7c44635",
    "rawText": "├── درس ۶ ـ خدا در فلسفه (۲)",
    "displayLabel": "درس ۶ ـ خدا در فلسفه (۲)",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6738",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.philosophy.chapter.6731"
  },
  {
    "ref": "human.g12.philosophy.lesson.6743",
    "sourceRecordKey": "src-01bfebc0-59ff-42ab-9bed-bde717b23af3",
    "rawText": "├── درس ۷ ـ عقل در فلسفه (۱)",
    "displayLabel": "درس ۷ ـ عقل در فلسفه (۱)",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6743",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.philosophy.chapter.6731"
  },
  {
    "ref": "human.g12.philosophy.lesson.6748",
    "sourceRecordKey": "src-6032beb1-eb9d-4de2-8d50-7228995136ff",
    "rawText": "└── درس ۸ ـ عقل در فلسفه (۲)",
    "displayLabel": "درس ۸ ـ عقل در فلسفه (۲)",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6748",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.philosophy.chapter.6731"
  },
  {
    "ref": "human.g12.philosophy.chapter.6752",
    "sourceRecordKey": "src-169ec776-8293-4123-a444-dac20568ad87",
    "rawText": "بخش ۳ ـ نگاهی اجمالی به سیر فلسفه در جهان اسلام",
    "displayLabel": "بخش ۳ ـ نگاهی اجمالی به سیر فلسفه در جهان اسلام",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6752",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "human.g12.philosophy"
  },
  {
    "ref": "human.g12.philosophy.lesson.6754",
    "sourceRecordKey": "src-4268f35b-8902-4f53-9c0c-ea3f0f4c70e5",
    "rawText": "├── درس ۹ ـ آغاز فلسفه در جهان اسلام",
    "displayLabel": "درس ۹ ـ آغاز فلسفه در جهان اسلام",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6754",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.philosophy.chapter.6752"
  },
  {
    "ref": "human.g12.philosophy.lesson.6759",
    "sourceRecordKey": "src-8367ebb5-c2d4-4576-a9db-1afaeed0ec61",
    "rawText": "├── درس ۱۰ ـ دوره میانی",
    "displayLabel": "درس ۱۰ ـ دوره میانی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6759",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.philosophy.chapter.6752"
  },
  {
    "ref": "human.g12.philosophy.lesson.6764",
    "sourceRecordKey": "src-7d6fb4bf-4296-449d-b32f-4260b428a69c",
    "rawText": "├── درس ۱۱ ـ دوران متأخر",
    "displayLabel": "درس ۱۱ ـ دوران متأخر",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6764",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.philosophy.chapter.6752"
  },
  {
    "ref": "human.g12.philosophy.lesson.6769",
    "sourceRecordKey": "src-2e39a6f8-9e32-444a-a7ec-4fd929e8f607",
    "rawText": "└── درس ۱۲ ـ حکمت معاصر",
    "displayLabel": "درس ۱۲ ـ حکمت معاصر",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L6769",
    "proposedNodeTypeCode": "TOPIC",
    "parentRef": "human.g12.philosophy.chapter.6752"
  }
] as const satisfies readonly HumanSciencesCatalogRecord[]

export const humanSciencesApplicability = [
  {
    "sourceRef": "shared.g10.persian",
    "targetRef": "mathematics.g10",
    "type": "APPLICABILITY"
  },
  {
    "sourceRef": "shared.g10.persian",
    "targetRef": "experimental.g10",
    "type": "APPLICABILITY"
  },
  {
    "sourceRef": "shared.g10.persian",
    "targetRef": "human.g10",
    "type": "APPLICABILITY"
  },
  {
    "sourceRef": "shared.g10.arabic",
    "targetRef": "mathematics.g10",
    "type": "APPLICABILITY"
  },
  {
    "sourceRef": "shared.g10.arabic",
    "targetRef": "experimental.g10",
    "type": "APPLICABILITY"
  },
  {
    "sourceRef": "shared.g10.arabic",
    "targetRef": "human.g10",
    "type": "APPLICABILITY"
  },
  {
    "sourceRef": "shared.g10.religion",
    "targetRef": "mathematics.g10",
    "type": "APPLICABILITY"
  },
  {
    "sourceRef": "shared.g10.religion",
    "targetRef": "experimental.g10",
    "type": "APPLICABILITY"
  },
  {
    "sourceRef": "shared.g10.religion",
    "targetRef": "human.g10",
    "type": "APPLICABILITY"
  },
  {
    "sourceRef": "shared.g10.english",
    "targetRef": "mathematics.g10",
    "type": "APPLICABILITY"
  },
  {
    "sourceRef": "shared.g10.english",
    "targetRef": "experimental.g10",
    "type": "APPLICABILITY"
  },
  {
    "sourceRef": "shared.g10.english",
    "targetRef": "human.g10",
    "type": "APPLICABILITY"
  },
  {
    "sourceRef": "shared.g11.persian",
    "targetRef": "mathematics.g11",
    "type": "APPLICABILITY"
  },
  {
    "sourceRef": "shared.g11.persian",
    "targetRef": "experimental.g11",
    "type": "APPLICABILITY"
  },
  {
    "sourceRef": "shared.g11.persian",
    "targetRef": "human.g11",
    "type": "APPLICABILITY"
  },
  {
    "sourceRef": "shared.g11.arabic",
    "targetRef": "mathematics.g11",
    "type": "APPLICABILITY"
  },
  {
    "sourceRef": "shared.g11.arabic",
    "targetRef": "experimental.g11",
    "type": "APPLICABILITY"
  },
  {
    "sourceRef": "shared.g11.arabic",
    "targetRef": "human.g11",
    "type": "APPLICABILITY"
  },
  {
    "sourceRef": "shared.g11.religion",
    "targetRef": "mathematics.g11",
    "type": "APPLICABILITY"
  },
  {
    "sourceRef": "shared.g11.religion",
    "targetRef": "experimental.g11",
    "type": "APPLICABILITY"
  },
  {
    "sourceRef": "shared.g11.religion",
    "targetRef": "human.g11",
    "type": "APPLICABILITY"
  },
  {
    "sourceRef": "shared.g11.english",
    "targetRef": "mathematics.g11",
    "type": "APPLICABILITY"
  },
  {
    "sourceRef": "shared.g11.english",
    "targetRef": "experimental.g11",
    "type": "APPLICABILITY"
  },
  {
    "sourceRef": "shared.g11.english",
    "targetRef": "human.g11",
    "type": "APPLICABILITY"
  },
  {
    "sourceRef": "shared.g12.persian",
    "targetRef": "mathematics.g12",
    "type": "APPLICABILITY"
  },
  {
    "sourceRef": "shared.g12.persian",
    "targetRef": "experimental.g12",
    "type": "APPLICABILITY"
  },
  {
    "sourceRef": "shared.g12.persian",
    "targetRef": "human.g12",
    "type": "APPLICABILITY"
  },
  {
    "sourceRef": "shared.g12.arabic",
    "targetRef": "mathematics.g12",
    "type": "APPLICABILITY"
  },
  {
    "sourceRef": "shared.g12.arabic",
    "targetRef": "experimental.g12",
    "type": "APPLICABILITY"
  },
  {
    "sourceRef": "shared.g12.arabic",
    "targetRef": "human.g12",
    "type": "APPLICABILITY"
  },
  {
    "sourceRef": "shared.g12.religion",
    "targetRef": "mathematics.g12",
    "type": "APPLICABILITY"
  },
  {
    "sourceRef": "shared.g12.religion",
    "targetRef": "experimental.g12",
    "type": "APPLICABILITY"
  },
  {
    "sourceRef": "shared.g12.religion",
    "targetRef": "human.g12",
    "type": "APPLICABILITY"
  },
  {
    "sourceRef": "shared.g12.english",
    "targetRef": "mathematics.g12",
    "type": "APPLICABILITY"
  },
  {
    "sourceRef": "shared.g12.english",
    "targetRef": "experimental.g12",
    "type": "APPLICABILITY"
  },
  {
    "sourceRef": "shared.g12.english",
    "targetRef": "human.g12",
    "type": "APPLICABILITY"
  }
] as const satisfies readonly HumanSciencesApplicability[]

const theoreticalBranchSkeletonRefs = new Set([
  'mathematics', 'mathematics.g10', 'mathematics.g11', 'mathematics.g12',
  'experimental', 'experimental.g10', 'experimental.g11', 'experimental.g12',
  'human', 'human.g10', 'human.g11', 'human.g12',
])

export const theoreticalCurriculumFoundationCatalog: readonly HumanSciencesCatalogRecord[] =
  humanSciencesCatalog.filter((record) =>
    record.ref === 'root'
    || record.ref === 'shared'
    || record.ref.startsWith('shared.')
    || theoreticalBranchSkeletonRefs.has(record.ref))

export const theoreticalSharedApplicability: readonly HumanSciencesApplicability[] =
  humanSciencesApplicability

export const humanSciencesStructuralCounts = {
  "shared.g10.arabic": {
    "chapters": 0,
    "lessons": 8
  },
  "shared.g11.arabic": {
    "chapters": 0,
    "lessons": 7
  },
  "shared.g12.arabic": {
    "chapters": 0,
    "lessons": 4
  },
  "shared.g10.persian": {
    "chapters": 8,
    "lessons": 18
  },
  "shared.g11.persian": {
    "chapters": 8,
    "lessons": 18
  },
  "shared.g12.persian": {
    "chapters": 8,
    "lessons": 18
  },
  "shared.g10.religion": {
    "chapters": 0,
    "lessons": 14
  },
  "shared.g11.religion": {
    "chapters": 0,
    "lessons": 12
  },
  "shared.g12.religion": {
    "chapters": 0,
    "lessons": 10
  },
  "shared.g10.english": {
    "chapters": 0,
    "lessons": 4
  },
  "shared.g11.english": {
    "chapters": 0,
    "lessons": 3
  },
  "shared.g12.english": {
    "chapters": 0,
    "lessons": 3
  },
  "human.g10.literary": {
    "chapters": 4,
    "lessons": 0
  },
  "human.g11.literary": {
    "chapters": 4,
    "lessons": 0
  },
  "human.g12.literary": {
    "chapters": 4,
    "lessons": 0
  },
  "human.g10.sociology": {
    "chapters": 2,
    "lessons": 16
  },
  "human.g11.sociology": {
    "chapters": 3,
    "lessons": 14
  },
  "human.g12.sociology": {
    "chapters": 0,
    "lessons": 10
  },
  "human.g10.history": {
    "chapters": 3,
    "lessons": 16
  },
  "human.g11.history": {
    "chapters": 4,
    "lessons": 16
  },
  "human.g12.history": {
    "chapters": 0,
    "lessons": 12
  },
  "human.g10.mathstats": {
    "chapters": 4,
    "lessons": 0
  },
  "human.g11.mathstats": {
    "chapters": 4,
    "lessons": 0
  },
  "human.g12.mathstats": {
    "chapters": 3,
    "lessons": 0
  },
  "human.g10.geography": {
    "chapters": 3,
    "lessons": 10
  },
  "human.g11.geography": {
    "chapters": 4,
    "lessons": 11
  },
  "human.g12.geography": {
    "chapters": 3,
    "lessons": 6
  },
  "human.g10.logic": {
    "chapters": 7,
    "lessons": 10
  },
  "human.g10.economics": {
    "chapters": 4,
    "lessons": 14
  },
  "human.g11.psychology": {
    "chapters": 0,
    "lessons": 8
  },
  "human.g11.philosophy": {
    "chapters": 3,
    "lessons": 11
  },
  "human.g12.philosophy": {
    "chapters": 3,
    "lessons": 12
  }
} as const

const recordByRef = new Map<string, HumanSciencesCatalogRecord>(
  humanSciencesCatalog.map((record) => [record.ref, record]),
)

export const humanSciencesRecord = (ref: string): HumanSciencesCatalogRecord => {
  const record = recordByRef.get(ref)
  if (!record) throw new Error(`Unknown Human Sciences catalog reference: ${ref}`)
  return record
}

export const assertHumanSciencesTranscription = (transcription: string): void => {
  const lines = transcription.replace(/^\uFEFF/, '').split(/\r?\n/)
  for (const record of humanSciencesCatalog) {
    const match = /:L([0-9]+)$/.exec(record.sourceLocator)
    if (!match) throw new Error(`Invalid source locator: ${record.sourceLocator}`)
    const line = Number(match[1])
    if (lines[line - 1] !== record.rawText) {
      throw new Error(`Human Sciences source drift at ${record.sourceLocator}`)
    }
  }
}

export const createHumanSciencesManifestDraft = (input: {
  expectedRevision: number
  idempotencyKey: string
  transcriptionId?: string
}): CurriculumImportManifestDraft => {
  const byRef = new Map<string, string>(
    humanSciencesCatalog.map((record) => [record.ref, record.sourceRecordKey]),
  )
  return {
    expectedRevision: input.expectedRevision,
    idempotencyKey: input.idempotencyKey,
    manifestSchemaVersion: '1.0.0',
    records: humanSciencesCatalog.map((record, sourceOrder) => ({
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
    transcriptionId: input.transcriptionId ?? HUMAN_SCIENCES_TRANSCRIPTION_ID,
  }
}
