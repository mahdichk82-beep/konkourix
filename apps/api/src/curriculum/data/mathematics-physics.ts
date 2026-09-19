import type { CurriculumImportManifestDraft } from '../types.js'
import {
  theoreticalCurriculumFoundationCatalog,
  theoreticalSharedApplicability,
  type HumanSciencesCatalogRecord,
} from './human-sciences.js'

export const MATHEMATICS_PHYSICS_TRANSCRIPTION_ID =
  'CANONICAL_CURRICULUM.md#mathematics-physics-structural-import-v1'

export const mathematicsPhysicsSpecificCatalog = [
  {
    "ref": "mathematics.g10.math1",
    "sourceRecordKey": "src-d2816d0f-34f4-4d6d-8df4-0f22bd69850c",
    "rawText": "│   │   ├── ریاضی ۱",
    "displayLabel": "ریاضی ۱",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L114",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "mathematics.g10"
  },
  {
    "ref": "mathematics.g10.geometry1",
    "sourceRecordKey": "src-35d39f43-6c99-4171-8f90-224cb466953e",
    "rawText": "│   │   ├── هندسه ۱",
    "displayLabel": "هندسه ۱",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L115",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "mathematics.g10"
  },
  {
    "ref": "mathematics.g10.physics1",
    "sourceRecordKey": "src-0101a74c-f69c-4521-8169-2303c4d8c0ca",
    "rawText": "│   │   ├── فیزیک ۱",
    "displayLabel": "فیزیک ۱",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L116",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "mathematics.g10"
  },
  {
    "ref": "mathematics.g11.calculus1",
    "sourceRecordKey": "src-b3e2ae21-7383-488e-b75f-b4d102cd23e2",
    "rawText": "│   │   ├── حسابان ۱",
    "displayLabel": "حسابان ۱",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L122",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "mathematics.g11"
  },
  {
    "ref": "mathematics.g11.geometry2",
    "sourceRecordKey": "src-d57723d1-3c93-49b2-84d9-475f0d9083aa",
    "rawText": "│   │   ├── هندسه ۲",
    "displayLabel": "هندسه ۲",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L123",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "mathematics.g11"
  },
  {
    "ref": "mathematics.g11.statistics",
    "sourceRecordKey": "src-0fe7bf27-561a-4c8c-bc3c-b117557c4c29",
    "rawText": "│   │   ├── آمار و احتمال",
    "displayLabel": "آمار و احتمال",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L124",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "mathematics.g11"
  },
  {
    "ref": "mathematics.g11.physics2",
    "sourceRecordKey": "src-6194a2c6-fb43-454f-ac8b-ca3ac5f3ab95",
    "rawText": "│   │   ├── فیزیک ۲",
    "displayLabel": "فیزیک ۲",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L125",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "mathematics.g11"
  },
  {
    "ref": "mathematics.g12.calculus2",
    "sourceRecordKey": "src-2d6376b1-38b6-4af3-a19f-5dec9bee8cad",
    "rawText": "│       ├── حسابان ۲",
    "displayLabel": "حسابان ۲",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L128",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "mathematics.g12"
  },
  {
    "ref": "mathematics.g12.geometry3",
    "sourceRecordKey": "src-ed894701-a020-4942-93d8-25032ba83ab1",
    "rawText": "│       ├── هندسه ۳",
    "displayLabel": "هندسه ۳",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L129",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "mathematics.g12"
  },
  {
    "ref": "mathematics.g12.discrete",
    "sourceRecordKey": "src-825b4fbf-0713-4da1-9d9a-18ae5505c9d7",
    "rawText": "│       ├── ریاضیات گسسته",
    "displayLabel": "ریاضیات گسسته",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L130",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "mathematics.g12"
  },
  {
    "ref": "mathematics.g12.physics3",
    "sourceRecordKey": "src-2c350da7-ba5e-4da0-a634-6669aa2ce2f1",
    "rawText": "│       ├── فیزیک ۳",
    "displayLabel": "فیزیک ۳",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L131",
    "proposedNodeTypeCode": "SUBJECT",
    "parentRef": "mathematics.g12"
  },
  {
    "ref": "mathematics.g10.physics1.chapter.3929",
    "sourceRecordKey": "src-1baf82d7-807a-4b24-b11c-5dfc8704b4dc",
    "rawText": "فصل ۱ ـ فیزیک و اندازه‌گیری",
    "displayLabel": "فصل ۱ ـ فیزیک و اندازه‌گیری",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L3929",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g10.physics1"
  },
  {
    "ref": "mathematics.g10.physics1.chapter.3954",
    "sourceRecordKey": "src-5a6a0a35-dc25-4e0e-ad6a-d5d701935c93",
    "rawText": "فصل ۲ ـ ویژگی‌های فیزیکی مواد",
    "displayLabel": "فصل ۲ ـ ویژگی‌های فیزیکی مواد",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L3954",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g10.physics1"
  },
  {
    "ref": "mathematics.g10.physics1.chapter.3985",
    "sourceRecordKey": "src-4c2ecd82-2cfc-4931-8f56-cdcc750af459",
    "rawText": "فصل ۳ ـ کار، انرژی و توان",
    "displayLabel": "فصل ۳ ـ کار، انرژی و توان",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L3985",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g10.physics1"
  },
  {
    "ref": "mathematics.g10.physics1.chapter.4019",
    "sourceRecordKey": "src-8acccb28-7fef-4c2a-b77e-e5e07b193beb",
    "rawText": "فصل ۴ ـ دما و گرما",
    "displayLabel": "فصل ۴ ـ دما و گرما",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L4019",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g10.physics1"
  },
  {
    "ref": "mathematics.g10.physics1.chapter.4057",
    "sourceRecordKey": "src-0bbea679-67b8-4a3c-a559-27e1ee2446d1",
    "rawText": "فصل ۵ ـ ترمودینامیک",
    "displayLabel": "فصل ۵ ـ ترمودینامیک",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L4057",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g10.physics1"
  },
  {
    "ref": "mathematics.g11.physics2.chapter.4095",
    "sourceRecordKey": "src-528e501a-d56f-43a6-a3f1-0bc7fd36c676",
    "rawText": "فصل ۱ ـ الکتریسیته ساکن",
    "displayLabel": "فصل ۱ ـ الکتریسیته ساکن",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L4095",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g11.physics2"
  },
  {
    "ref": "mathematics.g11.physics2.chapter.4148",
    "sourceRecordKey": "src-2b44ab82-daed-4ecc-ae30-7144824ad7e8",
    "rawText": "فصل ۲ ـ جریان الکتریکی و مدارهای جریان مستقیم",
    "displayLabel": "فصل ۲ ـ جریان الکتریکی و مدارهای جریان مستقیم",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L4148",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g11.physics2"
  },
  {
    "ref": "mathematics.g11.physics2.chapter.4197",
    "sourceRecordKey": "src-f5469a1c-e565-4bfb-9c33-e69c9f43ea2c",
    "rawText": "فصل ۳ ـ مغناطیس",
    "displayLabel": "فصل ۳ ـ مغناطیس",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L4197",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g11.physics2"
  },
  {
    "ref": "mathematics.g11.physics2.chapter.4238",
    "sourceRecordKey": "src-00e7d0f7-6d0a-4937-b7ba-620445b7432d",
    "rawText": "فصل ۴ ـ القای الکترومغناطیسی و جریان متناوب",
    "displayLabel": "فصل ۴ ـ القای الکترومغناطیسی و جریان متناوب",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L4238",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g11.physics2"
  },
  {
    "ref": "mathematics.g12.physics3.chapter.4278",
    "sourceRecordKey": "src-ccd1137f-0136-417b-96a9-a18ff341862d",
    "rawText": "فصل ۱ ـ حرکت بر خط راست",
    "displayLabel": "فصل ۱ ـ حرکت بر خط راست",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L4278",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g12.physics3"
  },
  {
    "ref": "mathematics.g12.physics3.chapter.4314",
    "sourceRecordKey": "src-2785e6bf-ce42-4ae4-92a9-33c1eac6ecc0",
    "rawText": "فصل ۲ ـ دینامیک و حرکت دایره‌ای",
    "displayLabel": "فصل ۲ ـ دینامیک و حرکت دایره‌ای",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L4314",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g12.physics3"
  },
  {
    "ref": "mathematics.g12.physics3.chapter.4357",
    "sourceRecordKey": "src-e3ed601a-219e-48f1-a8be-19ded555a2b6",
    "rawText": "فصل ۳ ـ نوسان و موج",
    "displayLabel": "فصل ۳ ـ نوسان و موج",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L4357",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g12.physics3"
  },
  {
    "ref": "mathematics.g12.physics3.chapter.4405",
    "sourceRecordKey": "src-d6c26a3c-e115-4f34-b002-02c2554a30f1",
    "rawText": "فصل ۴ ـ برهم‌کنش‌های موج",
    "displayLabel": "فصل ۴ ـ برهم‌کنش‌های موج",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L4405",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g12.physics3"
  },
  {
    "ref": "mathematics.g12.physics3.chapter.4438",
    "sourceRecordKey": "src-23dba538-e1a1-4a5a-9256-91b8cd6f70cd",
    "rawText": "فصل ۵ ـ آشنایی با فیزیک اتمی",
    "displayLabel": "فصل ۵ ـ آشنایی با فیزیک اتمی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L4438",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g12.physics3"
  },
  {
    "ref": "mathematics.g12.physics3.chapter.4477",
    "sourceRecordKey": "src-dbe06142-1914-41bf-a58c-e328f743f5a3",
    "rawText": "فصل ۶ ـ آشنایی با فیزیک هسته‌ای",
    "displayLabel": "فصل ۶ ـ آشنایی با فیزیک هسته‌ای",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L4477",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g12.physics3"
  },
  {
    "ref": "mathematics.g11.geometry2.chapter.4520",
    "sourceRecordKey": "src-324a8720-da36-44ed-81f9-3792e32cc1fb",
    "rawText": "فصل ۱ ـ دایره",
    "displayLabel": "فصل ۱ ـ دایره",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L4520",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g11.geometry2"
  },
  {
    "ref": "mathematics.g11.geometry2.chapter.4544",
    "sourceRecordKey": "src-f45211b2-9232-4f26-bfc4-e1bc7ab3ecbc",
    "rawText": "فصل ۲ ـ تبدیل‌های هندسی و کاربردها",
    "displayLabel": "فصل ۲ ـ تبدیل‌های هندسی و کاربردها",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L4544",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g11.geometry2"
  },
  {
    "ref": "mathematics.g11.geometry2.chapter.4564",
    "sourceRecordKey": "src-ad8fe957-5425-43a1-9a00-6a2750a3164f",
    "rawText": "فصل ۳ ـ روابط طولی در مثلث",
    "displayLabel": "فصل ۳ ـ روابط طولی در مثلث",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L4564",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g11.geometry2"
  },
  {
    "ref": "mathematics.g10.geometry1.chapter.4586",
    "sourceRecordKey": "src-2e9eb108-eb05-4972-9c65-54dd1f20cf51",
    "rawText": "فصل ۱ ـ ترسیم‌های هندسی و استدلال",
    "displayLabel": "فصل ۱ ـ ترسیم‌های هندسی و استدلال",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L4586",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g10.geometry1"
  },
  {
    "ref": "mathematics.g10.geometry1.chapter.4600",
    "sourceRecordKey": "src-af152025-97c1-4c59-98c9-458a9bb051d0",
    "rawText": "فصل ۲ ـ قضیه تالس، تشابه و کاربردهای آن",
    "displayLabel": "فصل ۲ ـ قضیه تالس، تشابه و کاربردهای آن",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L4600",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g10.geometry1"
  },
  {
    "ref": "mathematics.g10.geometry1.chapter.4623",
    "sourceRecordKey": "src-171a784f-0226-49da-8b08-59e6e6eeba77",
    "rawText": "فصل ۳ ـ چندضلعی‌ها",
    "displayLabel": "فصل ۳ ـ چندضلعی‌ها",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L4623",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g10.geometry1"
  },
  {
    "ref": "mathematics.g10.geometry1.chapter.4647",
    "sourceRecordKey": "src-8382d0c5-f398-4c7e-bb31-b84487ae20fd",
    "rawText": "فصل ۴ ـ تجسم فضایی",
    "displayLabel": "فصل ۴ ـ تجسم فضایی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L4647",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g10.geometry1"
  },
  {
    "ref": "mathematics.g12.geometry3.chapter.4664",
    "sourceRecordKey": "src-13d30327-6ea7-4173-8970-9fbe32e03631",
    "rawText": "فصل ۱ ـ ماتریس و کاربردها",
    "displayLabel": "فصل ۱ ـ ماتریس و کاربردها",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L4664",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g12.geometry3"
  },
  {
    "ref": "mathematics.g12.geometry3.chapter.4682",
    "sourceRecordKey": "src-bc1d9646-3c6f-4033-9cab-3184abcf55a4",
    "rawText": "فصل ۲ ـ آشنایی با مقاطع مخروطی",
    "displayLabel": "فصل ۲ ـ آشنایی با مقاطع مخروطی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L4682",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g12.geometry3"
  },
  {
    "ref": "mathematics.g12.geometry3.chapter.4703",
    "sourceRecordKey": "src-56f025fb-a19b-4a15-bb00-63650d3cc7fa",
    "rawText": "فصل ۳ ـ بردارها",
    "displayLabel": "فصل ۳ ـ بردارها",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L4703",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g12.geometry3"
  },
  {
    "ref": "mathematics.g10.math1.chapter.4728",
    "sourceRecordKey": "src-3d53b872-13ea-4d4e-903d-3ac3ce1029a1",
    "rawText": "فصل ۱ ـ مجموعه، الگو و دنباله",
    "displayLabel": "فصل ۱ ـ مجموعه، الگو و دنباله",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L4728",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g10.math1"
  },
  {
    "ref": "mathematics.g10.math1.chapter.4739",
    "sourceRecordKey": "src-0e5009bb-c834-4045-8966-d9d4ff2708ea",
    "rawText": "فصل ۲ ـ مثلثات",
    "displayLabel": "فصل ۲ ـ مثلثات",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L4739",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g10.math1"
  },
  {
    "ref": "mathematics.g10.math1.chapter.4752",
    "sourceRecordKey": "src-c73581d6-58ed-4a9a-8023-2eec3ae9c8fe",
    "rawText": "فصل ۳ ـ توان‌های گویا و عبارت‌های جبری",
    "displayLabel": "فصل ۳ ـ توان‌های گویا و عبارت‌های جبری",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L4752",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g10.math1"
  },
  {
    "ref": "mathematics.g10.math1.chapter.4762",
    "sourceRecordKey": "src-8ae8aa02-7066-4593-a9cc-6ba8c6622997",
    "rawText": "فصل ۴ ـ معادله‌ها و نامعادله‌ها",
    "displayLabel": "فصل ۴ ـ معادله‌ها و نامعادله‌ها",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L4762",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g10.math1"
  },
  {
    "ref": "mathematics.g10.math1.chapter.4774",
    "sourceRecordKey": "src-3c61d6f9-642c-4f1d-b70b-e56720f551d5",
    "rawText": "فصل ۵ ـ تابع",
    "displayLabel": "فصل ۵ ـ تابع",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L4774",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g10.math1"
  },
  {
    "ref": "mathematics.g10.math1.chapter.4786",
    "sourceRecordKey": "src-c68c87ee-95bc-4c1d-a050-a5615ed22d5e",
    "rawText": "فصل ۶ ـ شمارش، بدون شمردن",
    "displayLabel": "فصل ۶ ـ شمارش، بدون شمردن",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L4786",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g10.math1"
  },
  {
    "ref": "mathematics.g10.math1.chapter.4791",
    "sourceRecordKey": "src-2086a889-975e-4c4f-b9bb-27b01987702e",
    "rawText": "فصل ۷ ـ آمار و احتمال",
    "displayLabel": "فصل ۷ ـ آمار و احتمال",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L4791",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g10.math1"
  },
  {
    "ref": "mathematics.g11.calculus1.chapter.4803",
    "sourceRecordKey": "src-c15c5aeb-898c-4971-9eab-08191430837c",
    "rawText": "فصل ۱ ـ جبر و معادله",
    "displayLabel": "فصل ۱ ـ جبر و معادله",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L4803",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g11.calculus1"
  },
  {
    "ref": "mathematics.g11.calculus1.chapter.4853",
    "sourceRecordKey": "src-b8b4e2bb-861a-4a25-95fd-012c529e0419",
    "rawText": "فصل ۲ ـ تابع",
    "displayLabel": "فصل ۲ ـ تابع",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L4853",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g11.calculus1"
  },
  {
    "ref": "mathematics.g11.calculus1.chapter.4893",
    "sourceRecordKey": "src-c7ee0b88-58ea-4a14-b68d-13d2a3d805b1",
    "rawText": "فصل ۳ ـ توابع نمایی و لگاریتمی",
    "displayLabel": "فصل ۳ ـ توابع نمایی و لگاریتمی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L4893",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g11.calculus1"
  },
  {
    "ref": "mathematics.g11.calculus1.chapter.4921",
    "sourceRecordKey": "src-ca67411d-6897-4ac2-8b97-c822b34bc0dc",
    "rawText": "فصل ۴ ـ مثلثات",
    "displayLabel": "فصل ۴ ـ مثلثات",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L4921",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g11.calculus1"
  },
  {
    "ref": "mathematics.g11.calculus1.chapter.4956",
    "sourceRecordKey": "src-01dd73f3-47e1-486f-8af2-fb8d8770251c",
    "rawText": "فصل ۵ ـ حد و پیوستگی",
    "displayLabel": "فصل ۵ ـ حد و پیوستگی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L4956",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g11.calculus1"
  },
  {
    "ref": "mathematics.g12.calculus2.chapter.4996",
    "sourceRecordKey": "src-54edb7bb-ec6f-451d-b0f9-cffbd80d063e",
    "rawText": "فصل ۱ ـ تابع",
    "displayLabel": "فصل ۱ ـ تابع",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L4996",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g12.calculus2"
  },
  {
    "ref": "mathematics.g12.calculus2.chapter.5027",
    "sourceRecordKey": "src-cf12aba4-639a-4112-b926-c4d9f29191aa",
    "rawText": "فصل ۲ ـ مثلثات",
    "displayLabel": "فصل ۲ ـ مثلثات",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5027",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g12.calculus2"
  },
  {
    "ref": "mathematics.g12.calculus2.chapter.5051",
    "sourceRecordKey": "src-6cb1644b-9f6f-4bdb-a035-82d598a4ab7b",
    "rawText": "فصل ۳ ـ حدهای نامتناهی ـ حد در بی‌نهایت",
    "displayLabel": "فصل ۳ ـ حدهای نامتناهی ـ حد در بی‌نهایت",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5051",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g12.calculus2"
  },
  {
    "ref": "mathematics.g12.calculus2.chapter.5073",
    "sourceRecordKey": "src-32f06a17-9343-4840-b82a-03484fba7020",
    "rawText": "فصل ۴ ـ مشتق",
    "displayLabel": "فصل ۴ ـ مشتق",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5073",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g12.calculus2"
  },
  {
    "ref": "mathematics.g12.calculus2.chapter.5102",
    "sourceRecordKey": "src-28e28498-35c3-47ab-ba4c-8b08fcc4fc54",
    "rawText": "فصل ۵ ـ کاربردهای مشتق",
    "displayLabel": "فصل ۵ ـ کاربردهای مشتق",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5102",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g12.calculus2"
  },
  {
    "ref": "mathematics.g11.statistics.chapter.5135",
    "sourceRecordKey": "src-29ed0983-190d-4f6e-a8b5-bd11c61c2471",
    "rawText": "فصل ۱ ـ آشنایی با مبانی ریاضیات",
    "displayLabel": "فصل ۱ ـ آشنایی با مبانی ریاضیات",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5135",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g11.statistics"
  },
  {
    "ref": "mathematics.g11.statistics.chapter.5152",
    "sourceRecordKey": "src-5e02c34b-3768-4215-a421-131a28ee1c9a",
    "rawText": "فصل ۲ ـ احتمال",
    "displayLabel": "فصل ۲ ـ احتمال",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5152",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g11.statistics"
  },
  {
    "ref": "mathematics.g11.statistics.chapter.5178",
    "sourceRecordKey": "src-c77ac3a0-eaf0-4049-9402-1b083c08e0e6",
    "rawText": "فصل ۳ ـ آمار توصیفی",
    "displayLabel": "فصل ۳ ـ آمار توصیفی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5178",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g11.statistics"
  },
  {
    "ref": "mathematics.g11.statistics.chapter.5200",
    "sourceRecordKey": "src-b992dd75-cc24-4f39-ab7c-0e8a60d75da7",
    "rawText": "فصل ۴ ـ آمار استنباطی",
    "displayLabel": "فصل ۴ ـ آمار استنباطی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5200",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g11.statistics"
  },
  {
    "ref": "mathematics.g12.discrete.chapter.5217",
    "sourceRecordKey": "src-7bf2b1b9-8f2f-422a-b2d1-b07c7e713b93",
    "rawText": "فصل ۱ ـ آشنایی با نظریه اعداد",
    "displayLabel": "فصل ۱ ـ آشنایی با نظریه اعداد",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5217",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g12.discrete"
  },
  {
    "ref": "mathematics.g12.discrete.chapter.5244",
    "sourceRecordKey": "src-062f467f-008c-4730-a6f4-eb0e932cdb3f",
    "rawText": "فصل ۲ ـ گراف و مدلسازی",
    "displayLabel": "فصل ۲ ـ گراف و مدلسازی",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5244",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g12.discrete"
  },
  {
    "ref": "mathematics.g12.discrete.chapter.5267",
    "sourceRecordKey": "src-0b6f706f-c4e8-4d37-bbf6-8bfc002ea471",
    "rawText": "فصل ۳ ـ ترکیبیات (شمارش)",
    "displayLabel": "فصل ۳ ـ ترکیبیات (شمارش)",
    "sourceLocator": "CANONICAL_CURRICULUM.md:L5267",
    "proposedNodeTypeCode": "CHAPTER",
    "parentRef": "mathematics.g12.discrete"
  }
] as const satisfies readonly HumanSciencesCatalogRecord[]

const sourceLine = (record: HumanSciencesCatalogRecord): number => {
  const match = /:L([0-9]+)$/.exec(record.sourceLocator)
  if (!match) throw new Error(`Invalid source locator: ${record.sourceLocator}`)
  return Number(match[1])
}

export const mathematicsPhysicsCatalog: readonly HumanSciencesCatalogRecord[] = [
  ...theoreticalCurriculumFoundationCatalog,
  ...mathematicsPhysicsSpecificCatalog,
].sort((left, right) => sourceLine(left) - sourceLine(right))

export const mathematicsPhysicsApplicability = theoreticalSharedApplicability

export const mathematicsPhysicsStructuralCounts = {
  "mathematics.g10.physics1": {
    "chapters": 5,
    "lessons": 0
  },
  "mathematics.g11.physics2": {
    "chapters": 4,
    "lessons": 0
  },
  "mathematics.g12.physics3": {
    "chapters": 6,
    "lessons": 0
  },
  "mathematics.g11.geometry2": {
    "chapters": 3,
    "lessons": 0
  },
  "mathematics.g10.geometry1": {
    "chapters": 4,
    "lessons": 0
  },
  "mathematics.g12.geometry3": {
    "chapters": 3,
    "lessons": 0
  },
  "mathematics.g10.math1": {
    "chapters": 7,
    "lessons": 0
  },
  "mathematics.g11.calculus1": {
    "chapters": 5,
    "lessons": 0
  },
  "mathematics.g12.calculus2": {
    "chapters": 5,
    "lessons": 0
  },
  "mathematics.g11.statistics": {
    "chapters": 4,
    "lessons": 0
  },
  "mathematics.g12.discrete": {
    "chapters": 3,
    "lessons": 0
  }
} as const

const recordByRef = new Map<string, HumanSciencesCatalogRecord>(
  mathematicsPhysicsCatalog.map((record) => [record.ref, record]),
)

export const mathematicsPhysicsRecord = (ref: string): HumanSciencesCatalogRecord => {
  const record = recordByRef.get(ref)
  if (!record) throw new Error(`Unknown Mathematics & Physics catalog reference: ${ref}`)
  return record
}

export const assertMathematicsPhysicsTranscription = (transcription: string): void => {
  const lines = transcription.replace(/^\uFEFF/, '').split(/\r?\n/)
  for (const record of mathematicsPhysicsCatalog) {
    const line = sourceLine(record)
    if (lines[line - 1] !== record.rawText) {
      throw new Error(`Mathematics & Physics source drift at ${record.sourceLocator}`)
    }
  }
}

export const createMathematicsPhysicsManifestDraft = (input: {
  expectedRevision: number
  idempotencyKey: string
  transcriptionId?: string
}): CurriculumImportManifestDraft => {
  const byRef = new Map<string, string>(
    mathematicsPhysicsCatalog.map((record) => [record.ref, record.sourceRecordKey]),
  )
  return {
    expectedRevision: input.expectedRevision,
    idempotencyKey: input.idempotencyKey,
    manifestSchemaVersion: '1.0.0',
    records: mathematicsPhysicsCatalog.map((record, sourceOrder) => ({
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
    transcriptionId: input.transcriptionId ?? MATHEMATICS_PHYSICS_TRANSCRIPTION_ID,
  }
}
