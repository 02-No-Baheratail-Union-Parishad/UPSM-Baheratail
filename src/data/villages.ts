import { UnionParishadConfig } from '../types';

export const KNOWN_VILLAGES = [
  'ডাবাইল',
  'কামারঙ্গ',
  'গোহাইলবাড়ী',
  'যোগীরকোফা',
  'ঘাটেশ্বরী',
  'বহেড়াতৈল',
  'ভুগলীচালা',
  'ধোপার চালা',
  'আমতৈল',
  'শালগ্রামপুর',
  'বগাপ্রতিমা',
  'আন্দি',
  'ছাতিয়াচালা',
  'বেতুয়া',
  'কালিয়ান'
];

export const KNOWN_POST_OFFICES = [
  { name: 'বহেড়াতৈল', code: '১৯৫০' },
  { name: 'নাগবাড়ী', code: '১৯৭২' },
  { name: 'বেতুয়া', code: '১৯৫০' },
  { name: 'ছিলিমপুর', code: '১৯৫০' }
];

export const WARDS = ['০১', '০২', '০৩', '০৪', '০৫', '০৬', '০৭', '০৮', '০৯'];

export const DEFAULT_UP_CONFIG: UnionParishadConfig = {
  upName: '০২নং বহেড়াতৈল ইউনিয়ন পরিষদ',
  upNameEn: '02 No. Baheratail Union Parishad',
  upazila: 'সখিপুর',
  district: 'টাঙ্গাইল',
  address: 'ডাকঘর: বহেড়াতৈল - ১৯৫০, উপজেলা: সখিপুর, জেলা: টাঙ্গাইল।',
  chairmanName: 'মোশারফ হোসেন (হিরো মিয়া)',
  chairmanTitle: 'প্যানেল চেয়ারম্যান - ০১',
  secretaryName: 'মোঃ সাইদুজ্জামান',
  secretaryTitle: 'ইউনিয়ন পরিষদ প্রশাসনিক কর্মকর্তা',
  logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Government_Seal_of_Bangladesh.svg',
  sealText: '০২নং বহেড়াতৈল ইউনিয়ন পরিষদ * সখিপুর, টাঙ্গাইল',
  defaultPromptPrefix: 'তুমি একজন দক্ষ সরকারি দাপ্তরিক লেখক। সরকারি গাম্ভীর্য বজায় রেখে প্রত্যয়নপত্রের বিবরণী তৈরি করো।',
  enableHeaderInPrint: true,
  watermarkOpacity: 0.08,
  templateDocId: '1CZwTWGcJudWkOHNZUxZfcZRb9ITDn-oQNU__51w0nQ4',
  targetFolderId: '1-fndRmFqGTF_Qn1aZRrS6piKXmUEfqNU',
  sheetId: '1r99sXFfqgaQvzjBlaSLB26pGpn84UclL2_S7FIINn0Q'
};
