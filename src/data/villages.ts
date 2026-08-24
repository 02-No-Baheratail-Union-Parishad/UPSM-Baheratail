import { UnionParishadConfig } from '../types';

/**
 * Approved 20 Villages of 02 No. Baheratail Union Parishad
 */
export const KNOWN_VILLAGES = [
  'ডাবাইল',
  'কামারঙ্গ',
  'গোহাইলবাড়ী',
  'যোগীর কোফা',
  'ঘাটেশ্বরী',
  'বহেড়াতৈল',
  'নয়াপড়া',
  'ভুগলীচালা',
  'নেরগীছ চালা',
  'ধোপার চালা',
  'আমতৈল',
  'শালগ্রামপুর',
  'বগাপ্রতিমা',
  'ছাতিয়াচালা',
  'আন্দি',
  'বেতুয়া',
  'কালিয়ান'
];

/**
 * Ward-to-Approved-Villages & Post Office Mapping Schema
 */
export const WARD_VILLAGE_MAP: Record<string, { villages: string[]; defaultPostOffice: string; postCode: string }> = {
  '০১': { villages: ['ডাবাইল', 'কামারঙ্গ', 'গোহাইলবাড়ী'], defaultPostOffice: 'নাগবাড়ী', postCode: '১৯৭২' },
  '০২': { villages: ['গোহাইলবাড়ী', 'যোগীর কোফা', 'যোগীরকোফা'], defaultPostOffice: 'নাগবাড়ী', postCode: '১৯৭২' },
  '০৩': { villages: ['ঘাটেশ্বরী'], defaultPostOffice: 'বহেড়াতৈল', postCode: '১৯৫০' },
  '০৪': { villages: ['বহেড়াতৈল', 'নয়াপড়া', 'ভুগলীচালা', 'নেরগীছ চালা', 'ধোপার চালা'], defaultPostOffice: 'বহেড়াতৈল', postCode: '১৯৫০' },
  '০৫': { villages: ['আমতৈল', 'শালগ্রামপুর'], defaultPostOffice: 'বেতুয়া', postCode: '১৯৫০' },
  '০৬': { villages: ['বগাপ্রতিমা', 'ছাতিয়াচালা', 'আন্দি'], defaultPostOffice: 'বহেড়াতৈল', postCode: '১৯৫০' },
  '০৭': { villages: ['বেতুয়া'], defaultPostOffice: 'বেতুয়া', postCode: '১৯৫০' },
  '০৮': { villages: ['কালিয়ান', 'বেতুয়া'], defaultPostOffice: 'বেতুয়া', postCode: '১৯৫০' },
  '০৯': { villages: ['কালিয়ান'], defaultPostOffice: 'বেতুয়া', postCode: '১৯৫০' }
};

export const KNOWN_POST_OFFICES = [
  { name: 'বহেড়াতৈল', code: '১৯৫০' },
  { name: 'নাগবাড়ী', code: '১৯৭২' },
  { name: 'বেতুয়া', code: '১৯৫০' },
  { name: 'ছিলিমপুর', code: '১৯৫০' }
];

export const WARDS = ['০১', '০২', '০৩', '০৪', '০৫', '০৬', '০৭', '০৮', '০৯'];

/**
 * Validates citizen address against 20 authorized villages & 9 wards.
 * Emits ⚠️ ADDRESS MISMATCH warning if invalid.
 */
export function validateVillageWard(village: string, wardNo: string): { isValid: boolean; warning?: string } {
  const normWard = wardNo.padStart(2, '০');
  const wardConfig = WARD_VILLAGE_MAP[normWard] || WARD_VILLAGE_MAP[wardNo];

  if (!wardConfig) {
    return {
      isValid: false,
      warning: `⚠️ ADDRESS MISMATCH: প্রদত্ত ওয়ার্ড নম্বর '${wardNo}' ০২নং বহেড়াতৈল ইউনিয়ন পরিষদের অনুমোদিত ১-৯ ওয়ার্ডের বাইরে!`
    };
  }

  const isApprovedVillage = KNOWN_VILLAGES.some(v => v.trim() === village.trim() || village.includes(v));
  if (!isApprovedVillage) {
    return {
      isValid: false,
      warning: `⚠️ ADDRESS MISMATCH: '${village}' গ্রামটি ০২নং বহেড়াতৈল ইউনিয়ন পরিষদের ২০টি অনুমোদিত গ্রামের তালিকায় নেই!`
    };
  }

  const isMatchingWard = wardConfig.villages.some(v => v.trim() === village.trim() || village.includes(v));
  if (!isMatchingWard) {
    return {
      isValid: false,
      warning: `⚠️ ADDRESS MISMATCH: '${village}' গ্রামটি ওয়ার্ড নম্বর ${wardNo}-এর সাথে মেলেনি (অনুমোদিত গ্রাম: ${wardConfig.villages.join(', ')})!`
    };
  }

  return { isValid: true };
}

export const DEFAULT_UP_CONFIG: UnionParishadConfig = {
  upName: '০২নং বহেড়াতৈল ইউনিয়ন পরিষদ',
  upNameEn: '02 No. Baheratail Union Parishad',
  upazila: 'সখিপুর',
  district: 'টাঙ্গাইল',
  address: 'ডাকঘর: বহেড়াতৈল - ১৯৫০, উপজেলা: সখিপুর, জেলা: টাঙ্গাইল।',
  phone: '০১৮৩৪-৩৩ ৩৩ ৩০',
  hotline: '০১৭১৩-৮৯৫২০৭',
  email: 'baheratailunion@gmail.com',
  chairmanName: 'মোঃ মাসুদুর রহমান',
  chairmanTitle: 'ইউপি প্রশাসক / চেয়ারম্যান',
  chairmanPhone: '০১৭১৩-৮৯৫২০৭',
  chairmanSignatureUrl: '',
  secretaryName: 'মোঃ সাইদুজ্জামান',
  secretaryTitle: 'ইউনিয়ন সচিব',
  secretaryPhone: '০১৮৩৪-৩৩৩৩৩০',
  secretarySignatureUrl: '',
  enableDigitalSignature: true,
  showSecretarySignature: true,
  logoUrl: '/baheratail_seal.svg',
  sealText: '০২নং বহেড়াতৈল ইউনিয়ন পরিষদ * সখিপুর, টাঙ্গাইল',
  defaultPromptPrefix: 'তুমি ০২নং বহেড়াতৈল ইউনিয়ন পরিষদ, সখিপুর, টাঙ্গাইল-এর একজন দক্ষ ও পেশাদার প্রশাসনিক লেখক। সরকারি গাম্ভীর্য বজায় রেখে প্রত্যয়নপত্রের বিবরণী তৈরি করো।',
  enableHeaderInPrint: true,
  watermarkOpacity: 0.08,
  certificateFeeDefault: 50,
  categoryFees: {
    'ব্যবসা, বাণিজ্য ও কর': 100,
    'উত্তরাধিকার ও পরিবার': 100,
    'নাগরিকত্ব ও পরিচয়': 50,
    'চারিত্রিক ও সাধারণ প্রত্যয়ন': 50,
    'আর্থিক ও সমাজকল্যাণ': 50
  },
  typeFeeOverrides: {
    'trade_license': 500,
    'premises_license': 300,
    'holding_tax': 100,
    'warish': 100,
    'inheritance': 100,
    'family_certificate': 100,
    'noc': 100,
    'power_of_attorney': 100,
    'financial_solvency': 100
  },
  paymentBkashNumber: '01834-333330',
  paymentNagadNumber: '01713-895207',
  paymentRocketNumber: '01834-333330',
  paymentInstructions: 'বিকাশ, নগদ বা রকেটের নম্বরে সনদের ফি প্রদান করে ট্রানজেকশন আইডি (TrxID) ইনপুট দিন।',
  templateHeaderStyle: 'tri-column',
  bodyFontSize: 16,
  borderStyle: 'double-green-red',
  blankSealSize: 96,
  qrCodePosition: 'left-bottom',
  qrColorScheme: 'govt-emerald',
  qrEmbedLogo: true,
  qrLogoShape: 'circle',
  qrFrameStyle: 'clean',
  qrSize: 72,
  templateDocId: '1Lmgu0_tQFH56N_iHwik1MqVRCYc4P0jxg8zocdhnIug',
  targetFolderId: '1w17bDG4sDI9dwiZAHxoBqeYOU_eIOgiw',
  sheetId: '1XeMvActPKzCBDLw-vTc3-dUOwNJOWE4nGJLNvh4ngE',
  appsScriptUrl: 'https://script.google.com/macros/s/AKfycbwa7PHYGGucLgz4V9aKcIw3pO8zkoYafvHLgAG7MI1OW-ca0txcRGj8q8YsOl9o9r67Jw/exec',
  r2AccountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID || '',
  r2AccessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
  r2SecretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  r2Endpoint: process.env.CLOUDFLARE_R2_S3_ENDPOINT || 'https://8145fd7882d729f182b85e7c18c1a5f0.r2.cloudflarestorage.com',
  r2BucketName: process.env.CLOUDFLARE_R2_BUCKET || 'certificates-storage',
  developerName: 'MD. JUBAER HOSSEN / XOBAER',
  developerTitle: 'কম্পিউটার ও ডাটা অপারেটর / সিস্টেম আর্কিটেক্ট',
  developerPhotoUrl: '',
  developerBio: '০২নং বহেড়াতৈল ইউনিয়ন পরিষদের ডিজিটাল অটোমেশন সিস্টেম, মাস্টার ডাটাবেজ এবং Gemini AI চালিত স্মার্ট প্রত্যয়নপত্র ইঞ্জিন প্রস্তুতকারক।',
  developerEmail: 'xobaer1994@gmail.com',
  developerPhone: '০১৮৩৪-৩৩৩৩৩০',
  developerWhatsappNumber: '+8801834333330',
  developerWhatsappUsername: 'Xobaer6090',
  developerWhatsappUrl: 'https://wa.me/message/7PMRKZ6ZMPT2G1',
  developerFacebookUrl: 'https://facebook.com/xobaer6090',
  developerLinkedinUrl: 'https://linkedin.com/in/xobaer6090',
  developerTiktokUrl: 'https://www.tiktok.com/@xobaer6090',
  developerInstagramUrl: 'https://www.instagram.com/xobaer6090',
  developerGithubProfileUrl: 'https://github.com/02-No-Baheratail-Union-Parishad',
  developerTwitterUrl: 'https://x.com/Xobaer6090',
  developerWordpressUrl: 'https://xobaer.wordpress.com',
  githubRepoUrl: 'https://github.com/02-No-Baheratail-Union-Parishad/UPSM-Baheratail',
  githubBranch: 'main',
  googleDriveBackupUrl: 'https://drive.google.com/drive/folders/1w17bDG4sDI9dwiZAHxoBqeYOU_eIOgiw',
  mcpEndpointUrl: 'https://upsm-baheratail.vercel.app/api/v1/mcp',
  webhookUrl: 'https://upsm-baheratail.vercel.app/api/v1/webhook',
  webhookSecret: 'whsec_up_baheratail_2026_secret_key',
  lastBackupDate: '2026-08-04 11:15 AM',
  pluginsConfig: {
    smsNotification: true,
    gdriveAutoSync: true,
    geminiOcrVision: true,
    auditTrailLog: true,
    webhookIntegration: false,
    mcpProtocolAgent: true
  }
};
