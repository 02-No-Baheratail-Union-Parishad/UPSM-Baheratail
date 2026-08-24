import { CertificateTypeConfig } from '../types';

/**
 * 47 Authorized Official Certificate Catalog of 02 No. Baheratail Union Parishad
 * Structured into 5 Administrative Categories & Governance Fees
 */
export const CERTIFICATE_TYPES: CertificateTypeConfig[] = [
  // ==========================================
  // ক্যাটাগরি ১: ব্যবসা, বাণিজ্য ও কর (১-৫)
  // ==========================================
  {
    key: 'holding_tax',
    label: 'হোল্ডিং ট্যাক্স সনদ',
    category: 'ব্যবসা, বাণিজ্য ও কর',
    promptInstruction: 'উক্ত নাগরিক ০২নং বহেড়াতৈল ইউনিয়ন পরিষদের নিয়মিত হোল্ডিং কর পরিশোধকারী এবং তাহার কোনো কর বকেয়া নাই।',
    simpleFields: [
      { key: 'holdingNo', label: 'হোল্ডিং নম্বর', placeholder: 'যেমন: এইচ-১০৪', required: true },
      { key: 'assessedTax', label: 'ধার্যকৃত বাৎসরিক কর (টাকায়)', placeholder: 'যেমন: ২০০/-' }
    ]
  },
  {
    key: 'trade_license',
    label: 'ট্রেড লাইসেন্স',
    category: 'ব্যবসা, বাণিজ্য ও কর',
    promptInstruction: 'উক্ত প্রতিষ্ঠানটিকে ০২নং বহেড়াতৈল ইউনিয়ন পরিষদ সীমানার মধ্যে বৈধভাবে ব্যবসা পরিচালনার জন্য এই ই-ট্রেড লাইসেন্স প্রদান করা হইল।',
    simpleFields: [
      { key: 'businessName', label: 'ব্যবসা প্রতিষ্ঠানের নাম', placeholder: 'যেমন: মেসার্স রহিম ট্রেডার্স', required: true },
      { key: 'businessType', label: 'ব্যবসার ধরন / প্রকৃতি', placeholder: 'যেমন: মুদি ও জেনারেল স্টোর', required: true },
      { key: 'capital', label: 'পরিশোধিত মূলধন (টাকায়)', placeholder: 'যেমন: ১,০০,০০০/-' }
    ]
  },
  {
    key: 'electricity_connection',
    label: 'নতুন বিদ্যুৎ সংযোগের প্রত্যয়ন',
    category: 'ব্যবসা, বাণিজ্য ও কর',
    promptInstruction: 'উক্ত নাগরিকের বসতবাড়ি/প্রতিষ্ঠানে নতুন বিদ্যুৎ মিটার সংযোগ প্রদান করিলে ইউনিয়ন পরিষদের কোনো আপত্তি নাই।',
    simpleFields: [
      { key: 'dagKhatian', label: 'দাগ ও খতিয়ান নম্বর', placeholder: 'যেমন: দাগ নং ৭৭, খতিয়ান ৪৫', required: true }
    ]
  },
  {
    key: 'premises_license',
    label: 'প্রিমিসেস লাইসেন্স',
    category: 'ব্যবসা, বাণিজ্য ও কর',
    promptInstruction: 'উক্ত বাণিজ্যিক স্থান/প্রিমিসেস ব্যবসায়িক উদ্দেশ্যে ব্যবহারের জন্য উপযুক্ত ও আইনানুগ অনুমোদনপ্রাপ্ত।',
    simpleFields: [
      { key: 'premisesName', label: 'প্রতিষ্ঠানের নাম', required: true },
      { key: 'location', label: 'প্রিমিসেস অবস্থান / বাজার', placeholder: 'যেমন: বহেড়াতৈল বাজার' }
    ]
  },
  {
    key: 'vehicle_license',
    label: 'যানবাহন লাইসেন্স',
    category: 'ব্যবসা, বাণিজ্য ও কর',
    promptInstruction: 'উক্ত অটোরিকশা/ভ্যান/যানবাহনটি ০২নং বহেড়াতৈল ইউনিয়ন পরিষদ সীমানায় চলাচলের জন্য নিবন্ধিত।',
    simpleFields: [
      { key: 'vehicleType', label: 'যানবাহনের ধরন', placeholder: 'যেমন: ইজি বাইক / মিশুক / ভ্যান', required: true },
      { key: 'chassisNo', label: 'প্লেট / ইঞ্জিন নং', placeholder: 'ঐচ্ছিক' }
    ]
  },

  // ==========================================
  // ক্যাটাগরি ২: উত্তরাধিকার ও পরিবার (৬-২০)
  // ==========================================
  {
    key: 'warish',
    label: 'ওয়ারিশ সনদ',
    category: 'উত্তরাধিকার ও পরিবার',
    promptInstruction: 'উক্ত মৃত ব্যক্তির মৃত্যুর সময় নিম্নলিখিত ওয়ারিশগণ জীবিত রহিয়াছেন। তাহারা ব্যতীত অন্য কোনো জৈবিক বা আইনি ওয়ারিশ নাই।',
    simpleFields: [
      { key: 'deceasedName', label: 'মৃত ব্যক্তির নাম', required: true },
      { key: 'deathDate', label: 'মৃত্যুর তারিখ', placeholder: 'যেমন: ১২/০৫/২০২৫' },
      { key: 'relationWithApplicant', label: 'আবেদনকারীর সাথে সম্পর্ক', placeholder: 'যেমন: পুত্র' }
    ],
    tables: [
      {
        key: 'warish_list',
        title: 'ওয়ারিশগণের বিবরণী (৫-কলাম বিশিষ্ট টেবিল)',
        headers: ['ক্রমিক', 'নাম', 'জন্ম তারিখ', 'বয়স', 'সম্পর্ক', 'অবস্থা']
      }
    ]
  },
  {
    key: 'inheritance',
    label: 'উত্তরাধিকার সনদ',
    category: 'উত্তরাধিকার ও পরিবার',
    promptInstruction: 'মৃত ব্যক্তির বৈধ আইনি উত্তরাধিকার হিসেবে নিম্নলিখিত ব্যক্তিবর্গ যৌথভাবে স্থাবর-অস্থাবর সম্পত্তির স্বত্বাধিকারী।',
    simpleFields: [
      { key: 'deceasedName', label: 'মৃত ব্যক্তির নাম', required: true }
    ],
    tables: [
      {
        key: 'inheritance_list',
        title: 'আইনি উত্তরাধিকারীদের বিবরণী',
        headers: ['ক্রমিক', 'নাম', 'জন্ম তারিখ', 'বয়স', 'সম্পর্ক', 'অবস্থা']
      }
    ]
  },
  {
    key: 'family_certificate',
    label: 'পারিবারিক সনদ',
    category: 'উত্তরাধিকার ও পরিবার',
    promptInstruction: 'আবেদনকারীর পরিবারে নিম্নলিখিত সদস্যগণ একত্রে বসবাস করিয়া আসিতেছেন।',
    simpleFields: [
      { key: 'headOfFamily', label: 'পরিবার প্রধানের নাম', required: true }
    ],
    tables: [
      {
        key: 'family_list',
        title: 'পরিবারের সদস্যদের তালিকা',
        headers: ['ক্রমিক', 'নাম', 'জন্ম তারিখ', 'বয়স', 'সম্পর্ক', 'অবস্থা']
      }
    ]
  },
  {
    key: 'death_cert',
    label: 'মৃত্যু প্রত্যয়ন',
    category: 'উত্তরাধিকার ও পরিবার',
    promptInstruction: 'উক্ত ব্যক্তি উক্ত স্থানে বার্ধক্যজনিত বা স্বাভাবিক কারণে মৃত্যুবরণ করিয়াছেন।',
    simpleFields: [
      { key: 'deceasedName', label: 'মৃত ব্যক্তির নাম', required: true },
      { key: 'deathDate', label: 'মৃত্যুর তারিখ', required: true },
      { key: 'causeOfDeath', label: 'মৃত্যুর কারণ', placeholder: 'যেমন: বার্ধক্যজনিত' }
    ]
  },
  {
    key: 'single_death',
    label: 'অবিবাহিত অবস্থায় মৃত্যু সনদ',
    category: 'উত্তরাধিকার ও পরিবার',
    promptInstruction: 'উক্ত ব্যক্তি তাহার জীবদ্দশায় অদ্যবধি কোনো বিবাহ বন্ধনে আবদ্ধ না হইয়া অবিবাহিত অবস্থায় মৃত্যুবরণ করিয়াছেন।',
    simpleFields: [
      { key: 'deceasedName', label: 'মৃত ব্যক্তির নাম', required: true },
      { key: 'deathDate', label: 'মৃত্যুর তারিখ', required: true }
    ]
  },
  {
    key: 'alive_cert',
    label: 'জীবিত ব্যক্তির প্রত্যয়ন',
    category: 'উত্তরাধিকার ও পরিবার',
    promptInstruction: 'উক্ত নাগরিক বর্তমানে শারীরিক ও মানসিকভাবে জীবিত ও সুস্থ আছেন।',
    simpleFields: [
      { key: 'purpose', label: 'ব্যবহারের উদ্দেশ্য', placeholder: 'যেমন: পেনশন / ব্যাংক হিসাব' }
    ]
  },
  {
    key: 'unmarried',
    label: 'অবিবাহিত সনদ',
    category: 'উত্তরাধিকার ও পরিবার',
    promptInstruction: 'উক্ত ব্যক্তি অদ্যবধি বিবাহ বন্ধনে আবদ্ধ হন নাই। তিনি সম্পূর্ণ অবিবাহিত।',
    simpleFields: [
      { key: 'purpose', label: 'ব্যবহারের কারণ', placeholder: 'যেমন: চাকরির জন্য / বিদেশে গমন' }
    ]
  },
  {
    key: 'married',
    label: 'বিবাহিত প্রত্যয়ন',
    category: 'উত্তরাধিকার ও পরিবার',
    promptInstruction: 'উক্ত ব্যক্তি আইনগত ও ইসলামী শরীয়ত মোতাবেক বিবাহ বন্ধনে আবদ্ধ হইয়া শান্তিতে সংসার করিতেছেন।',
    simpleFields: [
      { key: 'spouseName', label: 'স্বামী/স্ত্রীর নাম', required: true },
      { key: 'marriageDate', label: 'বিবাহের তারিখ' }
    ]
  },
  {
    key: 'remarriage',
    label: 'পুনর্বিবাহ সনদ',
    category: 'উত্তরাধিকার ও পরিবার',
    promptInstruction: 'উক্ত ব্যক্তি প্রথম স্বামী/স্ত্রীর বিচ্ছেদের বা মৃত্যুর পর আইনানুভাবে দ্বিতীয় বিবাহ বন্ধনে আবদ্ধ হইয়াছেন।',
    simpleFields: [
      { key: 'currentSpouse', label: 'বর্তমান স্বামী/স্ত্রীর নাম', required: true }
    ]
  },
  {
    key: 'no_remarriage',
    label: 'পুনর্বিবাহ না হওয়ার প্রত্যয়ন',
    category: 'উত্তরাধিকার ও পরিবার',
    promptInstruction: 'উক্ত স্বামীহারা/স্ত্রীহারা ব্যক্তি স্বামী/স্ত্রীর মৃত্যুর পর অদ্যবধি দ্বিতীয় কোনো বিবাহ বন্ধনে আবদ্ধ হন নাই।',
    simpleFields: [
      { key: 'lateSpouseName', label: 'মৃত স্বামী/স্ত্রীর নাম', required: true }
    ]
  },
  {
    key: 'dowry_free_marriage',
    label: 'যৌতুক বিহীন বিবাহ প্রত্যয়ন',
    category: 'উত্তরাধিকার ও পরিবার',
    promptInstruction: 'উক্ত শুভ বিবাহ কোনো প্রকার যৌতুক আদান-প্রদান ব্যতীত সম্পূর্ণ যৌতুকমুক্ত ও আইনসম্মত পরিবেশে সম্পন্ন হইয়াছে।',
    simpleFields: [
      { key: 'brideName', label: 'কনের নাম', required: true },
      { key: 'groomName', label: 'বরের নাম', required: true }
    ]
  },
  {
    key: 'widow',
    label: 'বিধবা প্রত্যয়ন',
    category: 'উত্তরাধিকার ও পরিবার',
    promptInstruction: 'উক্ত মহিলার স্বামী মৃত্যুবরণ করায় তিনি একজন সহায়-সম্বলহীন বিধবা নারী।',
    simpleFields: [
      { key: 'lateHusbandName', label: 'মৃত স্বামীর নাম', required: true },
      { key: 'deathDate', label: 'মৃত্যুর তারিখ' }
    ]
  },
  {
    key: 'orphan',
    label: 'এতিম সনদ',
    category: 'উত্তরাধিকার ও পরিবার',
    promptInstruction: 'উক্ত শিশুর পিতা মৃত্যুবরণ করায় সে একজন পিতৃহীন এতিম শিশু।',
    simpleFields: [
      { key: 'orphanageName', label: 'এতিমখানার নাম (যদি থাকে)', placeholder: 'ঐচ্ছিক' }
    ]
  },
  {
    key: 'childless',
    label: 'নিঃসন্তান প্রত্যয়ন',
    category: 'উত্তরাধিকার ও পরিবার',
    promptInstruction: 'উক্ত দম্পতির অদ্যবধি কোনো জৈবিক বা দত্তক সন্তানাদি নাই। তাহারা সম্পূর্ণ নিঃসন্তান।',
    simpleFields: [
      { key: 'coupleDetails', label: 'দম্পতির বিবরণ' }
    ]
  },
  {
    key: 'guardian_consent',
    label: 'অভিভাবক সম্মতি সনদ',
    category: 'উত্তরাধিকার ও পরিবার',
    promptInstruction: 'আইনানুগ অভিভাবক হিসেবে উক্ত নাবালকের শিক্ষা/চিকিৎসা/পাসপোর্ট আবেদনে পিতা/মাতার পূর্ণ সম্মতি রহিয়াছে।',
    simpleFields: [
      { key: 'wardName', label: 'নাবালকের নাম', required: true },
      { key: 'relation', label: 'অভিভাবকের সম্পর্ক', required: true }
    ]
  },

  // ==========================================
  // ক্যাটাগরি ৩: নাগরিকত্ব ও পরিচয় (২১-৩১)
  // ==========================================
  {
    key: 'citizenship',
    label: 'নাগরিকত্ব সনদ',
    category: 'নাগরিকত্ব ও পরিচয়',
    promptInstruction: 'উক্ত নাগরিক বাংলাদেশের জন্মসূত্রে একজন স্থায়ী নাগরিক এবং সুনামের সহিত বসবাস করিয়া আসিতেছেন।',
    simpleFields: [
      { key: 'voterNo', label: 'ভোটার নম্বর (যদি থাকে)', placeholder: 'ঐচ্ছিক' }
    ]
  },
  {
    key: 'nationality',
    label: 'জাতীয়তা সনদ',
    category: 'নাগরিকত্ব ও পরিচয়',
    promptInstruction: 'তিনি জন্মসূত্রে গণপ্রজাতন্ত্রী বাংলাদেশের একজন আইনানুগ নাগরিক।',
  },
  {
    key: 'permanent_resident',
    label: 'স্থায়ী বাসিন্দা সনদ',
    category: 'নাগরিকত্ব ও পরিচয়',
    promptInstruction: 'উক্ত ব্যক্তি ০২নং বহেড়াতৈল ইউনিয়ন পরিষদের সংশ্লিষ্ট গ্রামে দীর্ঘদিন যাবৎ স্থায়ীভাবে পরিবার পরিজনসহ বসবাস করিয়া আসিতেছেন।',
  },
  {
    key: 'same_person',
    label: 'একই ব্যক্তির প্রত্যয়ন',
    category: 'নাগরিকত্ব ও পরিচয়',
    promptInstruction: 'আবেদনকারীর বিভিন্ন দাপ্তরিক কাগজপত্রে নামের ভিন্নতা বা বানান গরমিল থাকিলেও উভয় নামধারী ব্যক্তি মূলত একই ব্যক্তি।',
    simpleFields: [
      { key: 'nameInNid', label: 'এনআইডি অনুযায়ী নাম', placeholder: 'যেমন: মোঃ আব্দুর রহিম', required: true },
      { key: 'nameInCert', label: 'সনদ/দলিলে নাম', placeholder: 'যেমন: আব্দুর রহিম', required: true }
    ]
  },
  {
    key: 'nid_correction',
    label: 'জাতীয় পরিচয় তথ্য সংশোধন প্রত্যয়ন',
    category: 'নাগরিকত্ব ও পরিচয়',
    promptInstruction: 'এনআইডি কার্ডে ভুলবশত তথ্য ভুল আসায় ইউনিয়ন পরিষদের মাস্টার রেকর্ড অনুযায়ী সঠিক তথ্য প্রত্যয়ন করা হইল।',
    simpleFields: [
      { key: 'incorrectInfo', label: 'এনআইডির বর্তমান ভুল তথ্য', required: true },
      { key: 'correctInfo', label: 'সঠিক তথ্য (যা হবে)', required: true }
    ],
    tables: [
      {
        key: 'correction_matrix',
        title: 'তথ্য সংশোধন তুলনামূলক ছক (৩-কলাম)',
        headers: ['ধরণ / ফিল্ড', 'পূর্বের ভুল তথ্য', 'সুপারিশকৃত সঠিক তথ্য']
      }
    ]
  },
  {
    key: 'new_voter',
    label: 'নতুন ভোটার প্রত্যয়ন',
    category: 'নাগরিকত্ব ও পরিচয়',
    promptInstruction: 'উক্ত ব্যক্তি ১৮ বছর বয়স পূর্ণ করায় নতুন ভোটার তালিকায় নাম অন্তর্ভুক্তির জন্য উপযুক্ত।',
    simpleFields: [
      { key: 'formNo', label: 'ভোটার নিবন্ধন ফরম নং', placeholder: 'যেমন: ফরম নম্বর ১০২৪৫' }
    ]
  },
  {
    key: 'voter_verification',
    label: 'ভোটার তথ্য যাচাই-বাছাই প্রত্যয়ন',
    category: 'নাগরিকত্ব ও পরিচয়',
    promptInstruction: 'ভোটার তালিকার তথ্যাবলীর সঠিকতা দাপ্তরিক অনুসন্ধানে সত্যায়িত করা হইল।',
  },
  {
    key: 'voter_area_transfer',
    label: 'ভোটার এলাকা স্থানান্তর প্রত্যয়ন',
    category: 'নাগরিকত্ব ও পরিচয়',
    promptInstruction: 'উক্ত নাগরিক স্থায়ীভাবে বসবাস শুরু করায় তাহার ভোটার এলাকা এই ইউনিয়নে স্থানান্তরের অনাপত্তি প্রদান করা হইল।',
    simpleFields: [
      { key: 'prevVoterArea', label: 'পূর্বের ভোটার এলাকা / উপজেলা', required: true }
    ]
  },
  {
    key: 'voter_omission_inclusion',
    label: 'ভোটার তালিকায় বাদ পড়ায় অন্তর্ভুক্তির প্রত্যয়ন',
    category: 'নাগরিকত্ব ও পরিচয়',
    promptInstruction: 'পূর্বের ভোটার তালিকায় ভুলবশত নাম বাদ পড়ায় পুনরায় অন্তর্ভুক্তির সুপারিশ করা হইল।',
  },
  {
    key: 'not_rohingya',
    label: 'রোহিঙ্গা নয় প্রত্যয়ন',
    category: 'নাগরিকত্ব ও পরিচয়',
    promptInstruction: 'উক্ত নাগরিক কোনো অবস্থাতেই মিয়ানমারের বাস্তুচ্যুত রোহিঙ্গা নাগরিক নহেন; তিনি বাংলাদেশের স্থায়ী নাগরিক।',
  },
  {
    key: 'passport_attestation',
    label: 'পাসপোর্ট প্রদানের প্রত্যয়ন',
    category: 'নাগরিকত্ব ও পরিচয়',
    promptInstruction: 'নতুন আন্তর্জাতিক পাসপোর্ট বা নবায়নের জন্য নাগরিকের চরিত্র ও পরিচয় সত্যায়ন করা হইল।',
    simpleFields: [
      { key: 'passportPurpose', label: 'পাসপোর্টের ধরন', placeholder: 'নতুন / নবায়ন' }
    ]
  },

  // ==========================================
  // ক্যাটাগরি ৪: চারিত্রিক ও সাধারণ প্রত্যয়ন (৩২-৪১)
  // ==========================================
  {
    key: 'character',
    label: 'চারিত্রিক সনদ',
    category: 'চারিত্রিক ও সাধারণ প্রত্যয়ন',
    promptInstruction: 'উক্ত ব্যক্তি সৎ, চরিত্রবান ও শান্ত স্বভাবের লোক। তাহার বিরুদ্ধে রাষ্ট্র ও সমাজবিরোধী কোনো মামলার রেকর্ড নাই।',
    simpleFields: [
      { key: 'purpose', label: 'সনদের উদ্দেশ্য', placeholder: 'যেমন: চাকরির আবেদনের জন্য' }
    ]
  },
  {
    key: 'professional',
    label: 'পেশাগত সনদ',
    category: 'চারিত্রিক ও সাধারণ প্রত্যয়ন',
    promptInstruction: 'উক্ত ব্যক্তি অত্র এলাকায় অত্যন্ত সুনামের সহিত তাহার নির্দিষ্ট পেশা পরিচালনা করিতেছেন।',
    simpleFields: [
      { key: 'professionName', label: 'পেশার বিবরণ', placeholder: 'যেমন: শিক্ষকতা / দর্জি / মেকানিক', required: true }
    ]
  },
  {
    key: 'unemployed',
    label: 'বেকারত্ব সনদ',
    category: 'চারিত্রিক ও সাধারণ প্রত্যয়ন',
    promptInstruction: 'উক্ত ব্যক্তি শিক্ষাগত যোগ্যতা সম্পন্ন হইয়াও বর্তমানে কোনো স্থায়ী সরকারি বা বেসরকারি কর্মসংস্থানে নিযুক্ত নাই।',
    simpleFields: [
      { key: 'qualification', label: 'সর্বোচ্চ ডিগ্রি', placeholder: 'যেমন: এইচএসসি / ডিগ্রি' }
    ]
  },
  {
    key: 'community',
    label: 'সম্প্রদায় সনদ',
    category: 'চারিত্রিক ও সাধারণ প্রত্যয়ন',
    promptInstruction: 'উক্ত নাগরিক স্থানীয় সম্প্রদায়ের একজন শান্তিপ্রিয় সম্মানিত সদস্য।',
  },
  {
    key: 'ethnic_minority',
    label: 'উপজাতি সনদ',
    category: 'চারিত্রিক ও সাধারণ প্রত্যয়ন',
    promptInstruction: 'উক্ত ব্যক্তি স্থানীয় ক্ষুদ্র নৃ-গোষ্ঠী / উপজাতি সম্প্রদায়ের অন্তর্ভুক্ত নাগরিক।',
    simpleFields: [
      { key: 'ethnicGroup', label: 'উপজাতি / জাতিগোষ্ঠীর নাম', placeholder: 'যেমন: গারো / বর্মণ', required: true }
    ]
  },
  {
    key: 'freedom_fighter',
    label: 'মুক্তিযোদ্ধা প্রত্যয়ন',
    category: 'চারিত্রিক ও সাধারণ প্রত্যয়ন',
    promptInstruction: 'উক্ত ব্যক্তি বাংলাদেশের মহান স্বাধীনতা যুদ্ধের তালিকাভুক্ত বীর মুক্তিযোদ্ধা / বীর মুক্তিযোদ্ধার সন্তান।',
    simpleFields: [
      { key: 'ffName', label: 'বীর মুক্তিযোদ্ধার নাম', required: true },
      { key: 'gazetteNo', label: 'গেজেট / সনদ নম্বর', required: true }
    ]
  },
  {
    key: 'farmer',
    label: 'কৃষি প্রত্যয়ন',
    category: 'চারিত্রিক ও সাধারণ প্রত্যয়ন',
    promptInstruction: 'উক্ত ব্যক্তি একজন প্রকৃত কৃষক এবং সরাসরি কৃষি কাজের সহিত জড়িত।',
    simpleFields: [
      { key: 'cropType', label: 'প্রধান ফসল', placeholder: 'যেমন: ধান, সরিষা' },
      { key: 'landAmount', label: 'কৃষি জমির পরিমাণ (শতক)', placeholder: 'যেমন: ৫০ শতক' }
    ]
  },
  {
    key: 'noc',
    label: 'অনাপত্তি সনদ (NOC)',
    category: 'চারিত্রিক ও সাধারণ প্রত্যয়ন',
    promptInstruction: 'উক্ত বিষয়ে ০২নং বহেড়াতৈল ইউনিয়ন পরিষদের কোনো প্রকার অনাপত্তি বা বাধা নাই।',
    simpleFields: [
      { key: 'nocSubject', label: 'অনাপত্তির বিষয়', placeholder: 'যেমন: অবকাঠামো নির্মাণ / পুকুর খনন', required: true }
    ]
  },
  {
    key: 'power_of_attorney',
    label: 'ক্ষমতা অর্পণ প্রত্যয়ন',
    category: 'চারিত্রিক ও সাধারণ প্রত্যয়ন',
    promptInstruction: 'আবেদনকারী স্বীয় সুস্থ মস্তিষ্কে দাপ্তরিক কার্য সম্পাদনের জন্য আইনানুগ প্রতিনিধিকে ক্ষমতা অর্পণ করিয়াছেন।',
    simpleFields: [
      { key: 'representativeName', label: 'মনোনীত প্রতিনিধির নাম', required: true }
    ]
  },
  {
    key: 'miscellaneous',
    label: 'বিবিধ সনদ',
    category: 'চারিত্রিক ও সাধারণ প্রত্যয়ন',
    promptInstruction: 'নাগরিকের বিশেষ আবেদনের প্রেক্ষিতে অনুসন্ধানের ভিত্তিতে এই বিবিধ প্রত্যয়নপত্র প্রদান করা হইল।',
    simpleFields: [
      { key: 'subject', label: 'প্রত্যয়নের বিষয়', required: true },
      { key: 'details', label: 'বিশেষ বিবরণ' }
    ]
  },

  // ==========================================
  // ক্যাটাগরি ৫: আর্থিক ও সমাজকল্যাণ (৪২-৪৭)
  // ==========================================
  {
    key: 'annual_income',
    label: 'বার্ষিক আয়ের সনদ',
    category: 'আর্থিক ও সমাজকল্যাণ',
    promptInstruction: 'উক্ত ব্যক্তির সকল বৈধ উৎস হতে বাৎসরিক আনুমানিক আয় উল্লেখপূর্বক এই আয়ের সনদ প্রদান করা হইতেছে।',
    simpleFields: [
      { key: 'annualIncome', label: 'বাৎসরিক আয় (টাকায়)', placeholder: 'যেমন: ১,২০,০০০/-', required: true },
      { key: 'sourceOfIncome', label: 'আয়ের প্রধান উৎস', placeholder: 'যেমন: কৃষি ও ক্ষুদ্র ব্যবসা' }
    ]
  },
  {
    key: 'monthly_income',
    label: 'মাসিক আয়ের সনদ',
    category: 'আর্থিক ও সমাজকল্যাণ',
    promptInstruction: 'উক্ত ব্যক্তির মাসিক আনুমানিক আয় উল্লেখপূর্বক সনদ প্রদান করা হইল।',
    simpleFields: [
      { key: 'monthlyIncome', label: 'মাসিক আয় (টাকায়)', placeholder: 'যেমন: ১০,০০০/-', required: true }
    ]
  },
  {
    key: 'financial_solvency',
    label: 'আর্থিক সচ্ছলতার সনদ',
    category: 'আর্থিক ও সমাজকল্যাণ',
    promptInstruction: 'উক্ত নাগরিক আর্থিক ও সামাজিকভাবে অত্যন্ত সচ্ছল ও মর্যাদাবান পরিবারের সদস্য।',
    simpleFields: [
      { key: 'propertyDetails', label: 'আর্থিক সংস্থানের বিবরণ' }
    ]
  },
  {
    key: 'financial_insolvency',
    label: 'আর্থিক অসচ্ছলতার সনদ',
    category: 'আর্থিক ও সমাজকল্যাণ',
    promptInstruction: 'উক্ত ব্যক্তি একজন অত্যন্ত দরিদ্র, অসচ্ছল ও দুস্থ নাগরিক।',
    simpleFields: [
      { key: 'familyCount', label: 'পরিবারের সদস্য সংখ্যা' }
    ]
  },
  {
    key: 'landless',
    label: 'ভূমিহীন সনদ',
    category: 'আর্থিক ও সমাজকল্যাণ',
    promptInstruction: 'উক্ত ব্যক্তির নিজস্ব কোনো বসতভিটা বা কৃষি জমি নাই। তিনি সম্পূর্ণ ভূমিহীন ও দুস্থ।',
    simpleFields: [
      { key: 'livingStatus', label: 'বর্তমান থাকার স্থান', placeholder: 'যেমন: ভাড়া বাসা / খাস জমিতে' }
    ]
  },
  {
    key: 'disability',
    label: 'প্রতিবন্ধী সনদ',
    category: 'আর্থিক ও সমাজকল্যাণ',
    promptInstruction: 'উক্ত ব্যক্তি শারীরিকভাবে প্রতিবন্ধী এবং সরকারি ভাতা ও বিশেষ সহায়তার জন্য উপযুক্ত।',
    simpleFields: [
      { key: 'disabilityType', label: 'প্রতিবন্ধিতার ধরন', placeholder: 'যেমন: শারীরিক / দৃষ্টি / শ্রবণ', required: true }
    ]
  }
];

export const CERTIFICATE_CATEGORIES = [
  'সব ধরন',
  'ব্যবসা, বাণিজ্য ও কর',
  'উত্তরাধিকার ও পরিবার',
  'নাগরিকত্ব ও পরিচয়',
  'চারিত্রিক ও সাধারণ প্রত্যয়ন',
  'আর্থিক ও সমাজকল্যাণ'
];
