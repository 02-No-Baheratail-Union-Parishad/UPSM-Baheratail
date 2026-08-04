import { CertificateTypeConfig } from '../types';

export const CERTIFICATE_TYPES: CertificateTypeConfig[] = [
  // ১. নাগরিকত্ব ও সাধারণ চারিত্রিক (1-5)
  {
    key: 'citizenship',
    label: 'নাগরিকত্ব সনদপত্র',
    category: 'নাগরিকত্ব ও পরিচয়',
    promptInstruction: 'উক্ত নাগরিক বাংলাদেশের জন্মসূত্রে একজন স্থায়ী নাগরিক এবং সুনামের সহিত বসবাস করিয়া আসিতেছেন।',
    simpleFields: [
      { key: 'voterNo', label: 'ভোটার নম্বর (যদি থাকে)', placeholder: 'ঐচ্ছিক' }
    ]
  },
  {
    key: 'character',
    label: 'চারিত্রিক সনদপত্র',
    category: 'নাগরিকত্ব ও পরিচয়',
    promptInstruction: 'উক্ত ব্যক্তি সৎ, চরিত্রবান ও শান্ত স্বভাবের লোক। তাহার বিরুদ্ধে রাষ্ট্র ও সমাজবিরোধী কোনো কার্যকলাপের রেকর্ড নাই।',
    simpleFields: [
      { key: 'purpose', label: 'সনদের উদ্দেশ্য', placeholder: 'যেমন: চাকরির আবেদনের জন্য' }
    ]
  },
  {
    key: 'provisional_id',
    label: 'সাময়িক পরিচিতি সনদপত্র',
    category: 'নাগরিকত্ব ও পরিচয়',
    promptInstruction: 'এনআইডি বা জন্ম সনদ প্রক্রিয়াধীন থাকায় তাহার সাময়িক পরিচিতি নিশ্চিত করা হইতেছে।',
    simpleFields: [
      { key: 'regNo', label: 'স্মারক / ভোটার ফরম নম্বর', placeholder: 'যেমন: ১০২৪৫' }
    ]
  },
  {
    key: 'permanent_resident',
    label: 'স্থায়ী বাসিন্দা সনদপত্র',
    category: 'নাগরিকত্ব ও পরিচয়',
    promptInstruction: 'উক্ত ব্যক্তি উক্ত গ্রামে দীর্ঘদিন যাবৎ স্থায়ীভাবে পরিবার পরিজনসহ বসবাস করিয়া আসিতেছেন।',
  },
  {
    key: 'same_person',
    label: 'একই ব্যক্তি প্রত্যয়নপত্র',
    category: 'নাগরিকত্ব ও পরিচয়',
    promptInstruction: 'আবেদনকারীর দলিল, এনআইডি ও শিক্ষাগত যোগ্যতার সনদে নামের ভিন্নতা থাকিলেও উভয়ে একই ব্যক্তি।',
    simpleFields: [
      { key: 'nameInNid', label: 'এনআইডি অনুযায়ী নাম', placeholder: 'যেমন: মোঃ আব্দুর রহিম' },
      { key: 'nameInCert', label: 'সনদ/দলিলে নাম', placeholder: 'যেমন: আব্দুর রহিম' }
    ]
  },

  // ২. পরিবার ও উত্তরাধিকার (6-10)
  {
    key: 'warish',
    label: 'ওয়ারিশান / উত্তরাধিকার সনদপত্র',
    category: 'উত্তরাধিকার ও পরিবার',
    promptInstruction: 'উক্ত মৃত ব্যক্তির মৃত্যুর সময় নিম্নলিখিত ওয়ারিশগণ জীবিত রহিয়াছেন। তাহারা ব্যতীত অন্য কোনো ওয়ারিশ নাই।',
    simpleFields: [
      { key: 'deceasedName', label: 'মৃত ব্যক্তির নাম', required: true },
      { key: 'deathDate', label: 'মৃত্যুর তারিখ', placeholder: 'যেমন: ১২/০৫/২০২৩' },
      { key: 'relationWithApplicant', label: 'আবেদনকারীর সাথে সম্পর্ক', placeholder: 'যেমন: পুত্র' }
    ],
    tables: [
      {
        key: 'warish_list',
        title: 'ওয়ারিশগণের তালিকা',
        headers: ['ক্রমিক', 'ওয়ারিশের নাম', 'সম্পর্ক', 'বয়স', 'জাতীয় পরিচয়পত্র / জন্ম সনদ নম্বর']
      }
    ]
  },
  {
    key: 'family_certificate',
    label: 'পারিবারিক সনদপত্র',
    category: 'উত্তরাধিকার ও পরিবার',
    promptInstruction: 'আবেদনকারীর পরিবারে নিম্নলিখিত সদস্যগণ একত্রে বসবাস করিয়া আসিতেছেন।',
    simpleFields: [
      { key: 'headOfFamily', label: 'পরিবার প্রধানের নাম' }
    ],
    tables: [
      {
        key: 'family_list',
        title: 'পরিবারের সদস্যদের তালিকা',
        headers: ['ক্রমিক', 'সদস্যের নাম', 'সম্পর্ক', 'বয়স', 'পেশা']
      }
    ]
  },
  {
    key: 'deceased_warish',
    label: 'মৃত ব্যক্তির ওয়ারিশ সনদ',
    category: 'উত্তরাধিকার ও পরিবার',
    promptInstruction: 'উক্ত মৃত ব্যক্তি তাহার মৃত্যুর সময় নিম্নলিখিত প্রকৃত আইনি ওয়ারিশগণকে রাখিয়া মৃত্যুবরণ করিয়াছেন।',
    simpleFields: [
      { key: 'deceasedName', label: 'মৃত ব্যক্তির নাম', required: true },
      { key: 'deathPlace', label: 'মৃত্যুর স্থান', placeholder: 'যেমন: নিজ গৃহ' }
    ],
    tables: [
      {
        key: 'deceased_warish_list',
        title: 'জীবিত ওয়ারিশগণের বিবরণ',
        headers: ['ক্রমিক', 'ওয়ারিশের নাম', 'সম্পর্ক', 'বয়স', 'মন্তব্য']
      }
    ]
  },
  {
    key: 'guardianship',
    label: 'অভিভাবকত্ব সনদপত্র',
    category: 'উত্তরাধিকার ও পরিবার',
    promptInstruction: 'আবেদনকারী তাহার পিতা/মাতার অনুপস্থিতিতে পরিবার ও নাবালকদের আইনানুগ অভিভাবক হিসেবে দায়িত্ব পালন করিতেছেন।',
    simpleFields: [
      { key: 'wardName', label: 'যার অভিভাবক (নাম)', placeholder: 'নাবালকের নাম' },
      { key: 'relation', label: 'সম্পর্ক', placeholder: 'যেমন: চাচা / জ্যেষ্ঠ ভ্রাতা' }
    ]
  },
  {
    key: 'heirship_proof',
    label: 'জমি সংক্রান্ত উত্তরাধিকার প্রত্যয়ন',
    category: 'উত্তরাধিকার ও পরিবার',
    promptInstruction: 'উক্ত জমির মালিকের মৃত্যুর পর তাহার বৈধ ওয়ারিশগণ যৌথ মালিকানা লাভ করিয়াছেন।',
    simpleFields: [
      { key: 'landOwner', label: 'মূল জমির মালিকের নাম' },
      { key: 'khatianNo', label: 'খতিয়ান/দাগ নং (যদি থাকে)', placeholder: 'যেমন: খতিয়ান ১২৩, দাগ ৪৫৬' }
    ]
  },

  // ৩. বৈবাহিক ও বৈবাহিক অবস্থা (11-16)
  {
    key: 'unmarried',
    label: 'অবিবাহিত সনদপত্র',
    category: 'বৈবাহিক অবস্থা',
    promptInstruction: 'উক্ত ব্যক্তি অদ্যবধি বিবাহ বন্ধনে আবদ্ধ হন নাই। তিনি সম্পূর্ণ অবিবাহিত।',
    simpleFields: [
      { key: 'purpose', label: 'ব্যবহারের কারণ', placeholder: 'যেমন: চাকরির জন্য / বিদেশে গমন' }
    ]
  },
  {
    key: 'married',
    label: 'বিবাহিত সনদপত্র',
    category: 'বৈবাহিক অবস্থা',
    promptInstruction: 'উক্ত ব্যক্তি আইনগত ও ইসলামী শরীয়ত মোতাবেক বিবাহ বন্ধনে আবদ্ধ হইয়া শান্তিতে সংসার করিতেছেন।',
    simpleFields: [
      { key: 'marriageDate', label: 'বিবাহের তারিখ', placeholder: 'যেমন: ১০/০১/২০২০' },
      { key: 'spouseNid', label: 'স্বামী/স্ত্রীর এনআইডি/জন্ম সনদ' }
    ]
  },
  {
    key: 'no_remarriage',
    label: 'পুনঃবিবাহ না হওয়ার সনদপত্র',
    category: 'বৈবাহিক অবস্থা',
    promptInstruction: 'উক্ত স্বামীহারা/স্ত্রীহারা ব্যক্তি স্বামী/স্ত্রীর মৃত্যুর পর অদ্যবধি দ্বিতীয় বিবাহে আবদ্ধ হন নাই।',
    simpleFields: [
      { key: 'lateSpouseName', label: 'মৃত স্বামী/স্ত্রীর নাম', required: true },
      { key: 'deathYear', label: 'মৃত্যুর বছর' }
    ]
  },
  {
    key: 'widow',
    label: 'বিধবা / স্বামীহীন সনদপত্র',
    category: 'বৈবাহিক অবস্থা',
    promptInstruction: 'উক্ত মহিলার স্বামী মৃত্যুবরণ করায় তিনি একজন অসহায় বিধবা নারী।',
    simpleFields: [
      { key: 'lateHusbandName', label: 'মৃত স্বামীর নাম', required: true },
      { key: 'husbandDeathDate', label: 'মৃত্যুর তারিখ' }
    ]
  },
  {
    key: 'divorced',
    label: 'তালাকপ্রাপ্তা / স্বামী পরিত্যক্তা সনদ',
    category: 'বৈবাহিক অবস্থা',
    promptInstruction: 'উক্ত নারী আইনগতভাবে তালাকপ্রাপ্তা এবং স্বামী কর্তৃক পরিত্যক্তা হইয়া পিতার গৃহে অবস্থান করিতেছেন।',
    simpleFields: [
      { key: 'exHusbandName', label: 'সাবেক স্বামীর নাম' },
      { key: 'divorceDate', label: 'তালাকের তারিখ' }
    ]
  },
  {
    key: 'single_mother',
    label: 'একক অভিভাবক / মাতৃত্ব সনদ',
    category: 'বৈবাহিক অবস্থা',
    promptInstruction: 'উক্ত মাতা তাহার সন্তানকে এককভাবে লালন পালন করিয়া আসিতেছেন।',
    simpleFields: [
      { key: 'childName', label: 'সন্তানের নাম' }
    ]
  },

  // ৪. অর্থনৈতিক, পেশা ও আর্থিক অবস্থা (17-23)
  {
    key: 'annual_income',
    label: 'বার্ষিক আয় সনদপত্র',
    category: 'অর্থনৈতিক ও পেশা',
    promptInstruction: 'উক্ত ব্যক্তির সকল বৈধ উৎস হতে বাৎসরিক আনুমানিক আয় উল্লেখপূর্বক সনদ প্রদান করা হইতেছে।',
    simpleFields: [
      { key: 'amountInTaka', label: 'বাৎসরিক আয় (টাকায়)', placeholder: 'যেমন: ১,২০,০০০/-', required: true },
      { key: 'sourceOfIncome', label: 'আয়ের উৎস', placeholder: 'যেমন: কৃষি ও ক্ষুদ্র ব্যবসা' }
    ]
  },
  {
    key: 'landless',
    label: 'ভূমিহীন সনদপত্র',
    category: 'অর্থনৈতিক ও পেশা',
    promptInstruction: 'উক্ত ব্যক্তির নিজস্ব কোনো বসতভিটা বা কৃষি জমি নাই। তিনি সম্পূর্ণ ভূমিহীন ও দুস্থ।',
    simpleFields: [
      { key: 'currentLivingStatus', label: 'বর্তমান আবাসনের ধরন', placeholder: 'যেমন: সরকারি খাস জমিতে / ভাড়া' }
    ]
  },
  {
    key: 'river_erosion',
    label: 'নদী ভাঙন এলাকা সনদ',
    category: 'অর্থনৈতিক ও পেশা',
    promptInstruction: 'উক্ত নাগরিকের বসতভিটা নদী ভাঙনে বিলীন হওয়ায় তিনি ক্ষতিগ্রস্ত হইয়াছেন।',
    simpleFields: [
      { key: 'riverName', label: 'নদীর নাম / এলাকা', placeholder: 'যেমন: বংশী নদী অববাহিকা' }
    ]
  },
  {
    key: 'farmer_cert',
    label: 'কৃষক প্রত্যয়নপত্র',
    category: 'অর্থনৈতিক ও পেশা',
    promptInstruction: 'উক্ত ব্যক্তি একজন প্রকৃত কৃষক এবং তিনি সরাসরি কৃষি কাজের সহিত জড়িত।',
    simpleFields: [
      { key: 'cropType', label: 'প্রধান উৎপাদিত ফসল', placeholder: 'যেমন: ধান, সরিষা, শাকসবজি' },
      { key: 'landAmount', label: 'কৃষি জমির পরিমাণ (শতক)', placeholder: 'যেমন: ৫০ শতক' }
    ]
  },
  {
    key: 'indigent',
    label: 'অসচ্ছল / দুস্থ সনদপত্র',
    category: 'অর্থনৈতিক ও পেশা',
    promptInstruction: 'উক্ত ব্যক্তি অতি দরিদ্র ও আর্থিক অভাব-অনটনে দিনাতিপাত করিতেছেন।',
    simpleFields: [
      { key: 'familyMembersCount', label: 'পরিবারের সদস্য সংখ্যা' }
    ]
  },
  {
    key: 'pre_business_noc',
    label: 'ব্যবসা অনাপত্তি সনদ (NOC)',
    category: 'অর্থনৈতিক ও পেশা',
    promptInstruction: 'উক্ত স্থানে ব্যবসা প্রতিষ্ঠান পরিচালনায় ইউনিয়ন পরিষদের কোনো প্রকার আপত্তি নাই।',
    simpleFields: [
      { key: 'businessName', label: 'ব্যবসা প্রতিষ্ঠানের নাম', required: true },
      { key: 'businessType', label: 'ব্যবসার ধরন', placeholder: 'যেমন: মুদি দোকান / রাইস মিল' }
    ]
  },
  {
    key: 'unemployed',
    label: 'বেকারত্ব সনদপত্র',
    category: 'অর্থনৈতিক ও পেশা',
    promptInstruction: 'উক্ত ব্যক্তি শিক্ষাগত যোগ্যতা সম্পন্ন হইয়াও বর্তমানে কোনো স্থায়ী কর্মসংস্থানে নিযুক্ত নাই।',
    simpleFields: [
      { key: 'educationalQualification', label: 'সর্বোচ্চ শিক্ষাগত যোগ্যতা', placeholder: 'যেমন: বিএ (অনার্স)' }
    ]
  },

  // ৫. বিশেষ সুবিধা, সামাজিক ও সংশোধন (24-32)
  {
    key: 'disability',
    label: 'প্রতিবন্ধী প্রত্যয়নপত্র',
    category: 'বিশেষ ক্যাটাগরি',
    promptInstruction: 'উক্ত ব্যক্তি শারীরিকভাবে প্রতিবন্ধী এবং ভাতা/সহযোগিতার জন্য উপযুক্ত।',
    simpleFields: [
      { key: 'disabilityType', label: 'প্রতিবন্ধিতার ধরন', placeholder: 'যেমন: দৃষ্টি / শারীরিক / মানসিক' }
    ]
  },
  {
    key: 'orphan',
    label: 'এতিম সনদপত্র',
    category: 'বিশেষ ক্যাটাগরি',
    promptInstruction: 'উক্ত শিশুর পিতা মৃত্যুবরণ করায় সে একজন পিতৃহীন এতিম শিশু।',
    simpleFields: [
      { key: 'orphanageName', label: 'এতিমখানার নাম (যদি থাকে)', placeholder: 'ঐচ্ছিক' }
    ]
  },
  {
    key: 'religious_minority',
    label: 'ধর্মীয় / সংখ্যালঘু পরিচয় সনদ',
    category: 'বিশেষ ক্যাটাগরি',
    promptInstruction: 'উক্ত ব্যক্তি হিন্দু/খ্রিস্টান/বৌদ্ধ ধর্মীয় সম্প্রদায়ের একজন শান্তিপ্রিয় নাগরিক।',
    simpleFields: [
      { key: 'religion', label: 'ধর্ম', placeholder: 'যেমন: সনাতন (হিন্দু)' }
    ]
  },
  {
    key: 'nid_correction',
    label: 'এনআইডি তথ্য সংশোধন প্রত্যয়ন',
    category: 'সংশোধন ও দাপ্তরিক',
    promptInstruction: 'এনআইডি কার্ডে ভুলবশত তথ্য ভুল আসায় ইউনিয়ন পরিষদের রেকর্ড অনুযায়ী সঠিক তথ্য প্রত্যয়ন করা হইল।',
    simpleFields: [
      { key: 'incorrectInfo', label: 'এনআইডির বর্তমান ভুল তথ্য', required: true },
      { key: 'correctInfo', label: 'সঠিক তথ্য (যা হবে)', required: true }
    ]
  },
  {
    key: 'birth_cert_correction',
    label: 'জন্ম সনদ তথ্য সংশোধন প্রত্যয়ন',
    category: 'সংশোধন ও দাপ্তরিক',
    promptInstruction: 'জন্ম সনদের নাম/পিতার নাম/তারিখ সংশোধনের উদ্দেশ্যে সঠিক ইউনিয়ন তথ্য নিশ্চিত করা হইল।',
    simpleFields: [
      { key: 'birthCertNo', label: 'জন্ম নম্বর (১৭ ডিজিট)', required: true },
      { key: 'correctionDetails', label: 'সংশোধনের বিবরণ' }
    ]
  },
  {
    key: 'passport_endorsement',
    label: 'পাসপোর্ট প্রত্যয়নপত্র',
    category: 'সংশোধন ও দাপ্তরিক',
    promptInstruction: 'পাসপোর্ট আবেদনের নিমিত্তে নাগরিকের পরিচয় ও চারিত্রিক তথ্য সত্যায়ন করা হইল।',
    simpleFields: [
      { key: 'passportPurpose', label: 'পাসপোর্টের ধরন', placeholder: 'নতুন পাসপোর্ট / নবায়ন' }
    ]
  },
  {
    key: 'electricity_noc',
    label: 'বিদ্যুৎ সংযোগের অনাপত্তি সনদ',
    category: 'সংশোধন ও দাপ্তরিক',
    promptInstruction: 'উক্ত বসতবাড়ি/প্রতিষ্ঠানে নতুন বিদ্যুৎ মিটার সংযোগ প্রদান করিলে ইউনিয়ন পরিষদের কোনো আপত্তি নাই।',
    simpleFields: [
      { key: 'dagKhatian', label: 'দাগ ও খতিয়ান নম্বর', placeholder: 'যেমন: দাগ নং ৭৭, খতিয়ান ৪৫' }
    ]
  },
  {
    key: 'freedom_fighter_descendant',
    label: 'বীর মুক্তিযোদ্ধা উত্তরাধিকার প্রত্যয়ন',
    category: 'বিশেষ ক্যাটাগরি',
    promptInstruction: 'উক্ত ব্যক্তি তালিকাভুক্ত বীর মুক্তিযোদ্ধার সন্তান/নাতনি।',
    simpleFields: [
      { key: 'ffName', label: 'বীর মুক্তিযোদ্ধার নাম', required: true },
      { key: 'ffGazetteNo', label: 'গেজেট/সনদ নম্বর', required: true },
      { key: 'relationWithFF', label: 'সম্পর্ক', placeholder: 'যেমন: সন্তান / নাতি' }
    ]
  },
  {
    key: 'non_residential',
    label: 'অনাবাসিক / প্রাতিষ্ঠানিক প্রত্যয়ন',
    category: 'সংশোধন ও দাপ্তরিক',
    promptInstruction: 'উক্ত প্রতিষ্ঠানটি ইউনিয়ন পরিষদ সীমানার মধ্যে অবস্থিত।',
    simpleFields: [
      { key: 'instName', label: 'প্রতিষ্ঠানের নাম' }
    ]
  },

  // ৬. বিবিধ ও অন্যান্য (33-40)
  {
    key: 'caste_ethnicity',
    label: 'ক্ষুদ্র নৃ-গোষ্ঠী / ক্ষুদ্র জাতিগোষ্ঠী সনদ',
    category: 'বিশেষ ক্যাটাগরি',
    promptInstruction: 'উক্ত ব্যক্তি স্থানীয় ক্ষুদ্র নৃ-গোষ্ঠী সম্প্রদায়ের অন্তর্ভুক্ত।',
    simpleFields: [
      { key: 'ethnicGroup', label: 'জাতিগোষ্ঠীর নাম', placeholder: 'যেমন: গারো / বর্মণ / সাঁওতাল' }
    ]
  },
  {
    key: 'death_certificate_attestation',
    label: 'স্থানীয় মৃত্যু সত্যায়ন প্রত্যয়ন',
    category: 'উত্তরাধিকার ও পরিবার',
    promptInstruction: 'উক্ত ব্যক্তি উক্ত তারিখ ও স্থানে স্বাভাবিক/বার্ধক্যজনিত কারণে মৃত্যুবরণ করিয়াছেন।',
    simpleFields: [
      { key: 'deceasedName', label: 'মৃতের নাম', required: true },
      { key: 'deathDate', label: 'মৃত্যুর তারিখ', required: true },
      { key: 'causeOfDeath', label: 'মৃত্যুর কারণ', placeholder: 'যেমন: বার্ধক্যজনিত' }
    ]
  },
  {
    key: 'migration_resident',
    label: 'স্থানান্তর / নতুন বাসিন্দা প্রত্যয়ন',
    category: 'নাগরিকত্ব ও পরিচয়',
    promptInstruction: 'উক্ত ব্যক্তি পূর্বে অন্য এলাকায় বসবাস করিলেও বর্তমানে এই ইউনিয়নে স্থায়ীভাবে বসতি স্থাপন করিয়াছেন।',
    simpleFields: [
      { key: 'previousAddress', label: 'পূর্বের ঠিকানা' }
    ]
  },
  {
    key: 'student_attestation',
    label: 'শিক্ষার্থী পরিচয় প্রত্যয়নপত্র',
    category: 'নাগরিকত্ব ও পরিচয়',
    promptInstruction: 'উক্ত শিক্ষার্থী একজন নিয়মিত অধ্যায়নরত মেধাবী ছাত্র/ছাত্রী।',
    simpleFields: [
      { key: 'institutionName', label: 'শিক্ষা প্রতিষ্ঠানের নাম' },
      { key: 'classOrDegree', label: 'শ্রেণী / বিভাগ' }
    ]
  },
  {
    key: 'bank_account_noc',
    label: 'ব্যাংক হিসাব খোলার প্রত্যয়ন',
    category: 'অর্থনৈতিক ও পেশা',
    promptInstruction: 'উক্ত ব্যক্তির অনুকূলে ব্যাংকে চলতি/সঞ্চয়ী হিসাব পরিচালনায় কোনো আইনগত বাধা নাই।',
    simpleFields: [
      { key: 'bankName', label: 'ব্যাংকের নাম (যদি নির্দিষ্ট থাকে)', placeholder: 'যেমন: সোনালী ব্যাংক' }
    ]
  },
  {
    key: 'social_safety_net',
    label: 'সামাজিক নিরাপত্তা সুবিধা পাওয়ার যোগ্যতা প্রত্যয়ন',
    category: 'বিশেষ ক্যাটাগরি',
    promptInstruction: 'উক্ত দুস্থ নাগরিক সরকারি ভাতা ও সামাজিক সাহায্য পাওয়ার জন্য সম্পূর্ণ উপযুক্ত।',
    simpleFields: [
      { key: 'schemeName', label: 'ভাতার ধরন', placeholder: 'যেমন: বয়স্ক ভাতা / বিধবা ভাতা' }
    ]
  },
  {
    key: 'house_ownership',
    label: 'গৃহ মালিকানা প্রত্যয়নপত্র',
    category: 'অর্থনৈতিক ও পেশা',
    promptInstruction: 'উক্ত বসতবাড়ির স্বত্বাধিকারী ও মালিক হিসেবে নাগরিকের তথ্য নিশ্চিত করা হইল।',
    simpleFields: [
      { key: 'holdingNo', label: 'হোল্ডিং নম্বর (যদি থাকে)' }
    ]
  },
  {
    key: 'miscellaneous',
    label: 'বিবিধ বিশেষ প্রত্যয়নপত্র',
    category: 'অন্যান্য',
    promptInstruction: 'নাগরিকের আবেদনের প্রেক্ষিতে দাপ্তরিক অনুসন্ধানের ভিত্তিতে এই বিবিধ প্রত্যয়নপত্র প্রদান করা হইল।',
    simpleFields: [
      { key: 'customSubject', label: 'প্রত্যয়নের বিষয়', required: true, placeholder: 'যেমন: পুকুর খনন অনাপত্তি' },
      { key: 'customNote', label: 'বিশেষ বিবরণ', placeholder: 'প্রয়োজনীয় তথ্য লিখুন' }
    ]
  }
];

export const CERTIFICATE_CATEGORIES = [
  'সব ধরন',
  'নাগরিকত্ব ও পরিচয়',
  'উত্তরাধিকার ও পরিবার',
  'বৈবাহিক অবস্থা',
  'অর্থনৈতিক ও পেশা',
  'বিশেষ ক্যাটাগরি',
  'সংশোধন ও দাপ্তরিক',
  'অন্যান্য'
];
