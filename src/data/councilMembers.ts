import { CouncilMember, UnionParishadConfig } from '../types';

export const DEFAULT_COUNCIL_MEMBERS: CouncilMember[] = [
  // 1. চেয়ারম্যান (1 Person)
  {
    id: 'm_chairman',
    category: 'chairman',
    name: 'মোশারফ হোসেন (হিরো মিয়া)',
    designation: 'ইউপি চেয়ারম্যান',
    mobile: '০১৭৯৯-১১২২৩৩',
    wardNo: 'সমগ্র ইউনিয়ন',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    isAutoSynced: true
  },

  // 2. ৩ জন মহিলা সংরক্ষিত ওয়ার্ড মেম্বার (3 Persons)
  {
    id: 'm_res_female_1',
    category: 'reserved_female',
    name: 'মোসাম্মাৎ রশিদা বেগম',
    designation: 'সংরক্ষিত মহিলা ইউপি সদস্য',
    wardNo: 'ওয়ার্ড নং ০১, ০২, ০৩',
    mobile: '০১৭২০-১১২২৩৪',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'm_res_female_2',
    category: 'reserved_female',
    name: 'মোছাঃ পারভীন আক্তার',
    designation: 'সংরক্ষিত মহিলা ইউপি সদস্য',
    wardNo: 'ওয়ার্ড নং ০৪, ০৫, ০৬',
    mobile: '০১৭২১-২২৩৪৫৬',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'm_res_female_3',
    category: 'reserved_female',
    name: 'মোছাঃ সাহিদা খাতুন',
    designation: 'সংরক্ষিত মহিলা ইউপি সদস্য',
    wardNo: 'ওয়ার্ড নং ০৭, ০৮, ০৯',
    mobile: '০১৭২২-৩৩৪৪৫৭',
    photoUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=300'
  },

  // 3. ৯ জন সাধারণ মেম্বার/সদস্য (9 Persons)
  {
    id: 'm_gen_1',
    category: 'general_member',
    name: 'মোঃ আব্দুল হেকিম',
    designation: 'ইউপি সদস্য (সাধারণ ওয়ার্ড)',
    wardNo: 'ওয়ার্ড নং ০১',
    mobile: '০১৭৩০-১১২২৩৩',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'm_gen_2',
    category: 'general_member',
    name: 'মোঃ রফিকুল ইসলাম',
    designation: 'ইউপি সদস্য (সাধারণ ওয়ার্ড)',
    wardNo: 'ওয়ার্ড নং ০২',
    mobile: '০১৭৩১-২২৩৪৪৫',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'm_gen_3',
    category: 'general_member',
    name: 'মোঃ মজনু মিয়া',
    designation: 'ইউপি সদস্য (সাধারণ ওয়ার্ড)',
    wardNo: 'ওয়ার্ড নং ০৩',
    mobile: '০১৭৩২-৩৩৪৪৫৬',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'm_gen_4',
    category: 'general_member',
    name: 'মোঃ জালাল উদ্দিন',
    designation: 'ইউপি সদস্য (সাধারণ ওয়ার্ড)',
    wardNo: 'ওয়ার্ড নং ০৪',
    mobile: '০১৭৩৩-৪৪৫৫৬৬',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'm_gen_5',
    category: 'general_member',
    name: 'মোঃ শাহজাহান আলী',
    designation: 'ইউপি সদস্য (সাধারণ ওয়ার্ড)',
    wardNo: 'ওয়ার্ড নং ০৫',
    mobile: '০১৭৩৪-৫৫৬৬Nz',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'm_gen_6',
    category: 'general_member',
    name: 'মোঃ ফজলুল হক',
    designation: 'ইউপি সদস্য (সাধারণ ওয়ার্ড)',
    wardNo: 'ওয়ার্ড নং ০৬',
    mobile: '০১৭৩৫-৬৬Nz88',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'm_gen_7',
    category: 'general_member',
    name: 'মোঃ সিরাজুল ইসলাম',
    designation: 'ইউপি সদস্য (সাধারণ ওয়ার্ড)',
    wardNo: 'ওয়ার্ড নং ০৭',
    mobile: '০১৭৩৬-৭৭Nz99',
    photoUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'm_gen_8',
    category: 'general_member',
    name: 'মোঃ আমজাদ হোসেন',
    designation: 'ইউপি সদস্য (সাধারণ ওয়ার্ড)',
    wardNo: 'ওয়ার্ড নং ০৮',
    mobile: '০১৭৩৭-৮৮Nz00',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'm_gen_9',
    category: 'general_member',
    name: 'মোঃ আনোয়ার হোসেন',
    designation: 'ইউপি সদস্য (সাধারণ ওয়ার্ড)',
    wardNo: 'ওয়ার্ড নং ০৯',
    mobile: '০১৭৩৮-৯৯Nz11',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300'
  },

  // 4. ১ জন সচিব/প্রশাসনিক কর্মকর্তা (1 Person)
  {
    id: 'm_secretary',
    category: 'officer',
    name: 'মোঃ সাইদুজ্জামান',
    designation: 'ইউনিয়ন পরিষদ প্রশাসনিক কর্মকর্তা (সচিব)',
    mobile: '০১৮১২-৪৪৫৫৬৬',
    wardNo: 'ইউপি কার্যালয়',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300',
    isAutoSynced: true
  },

  // 5. ১ জন হিসাব সহকারী (1 Person)
  {
    id: 'm_accounts',
    category: 'officer',
    name: 'মোঃ খোরশেদ আলম',
    designation: 'হিসাব সহকারী কাম কম্পিউটার অপারেটর',
    mobile: '০১৮১৫-৯৯৮৮Nz',
    wardNo: 'ইউপি কার্যালয়',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
  },

  // 6. ২ জন উদ্যোক্তা/UDC (2 Persons)
  {
    id: 'm_udc_1',
    category: 'udc',
    name: 'মোঃ তানভীর আহমেদ',
    designation: 'ইউডিজি উদ্যোক্তা (পুরুষ)',
    mobile: '০১৭৯০-১২৩৪৫৬',
    wardNo: 'ডিজিটাল সেন্টার (ইউডিজি)',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'm_udc_2',
    category: 'udc',
    name: 'মোছাঃ শারমীন আক্তার',
    designation: 'ইউডিজি উদ্যোক্তা (নারী)',
    mobile: '০১৭৯১-২৩৪৫৬৭',
    wardNo: 'ডিজিটাল সেন্টার (ইউডিজি)',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300'
  },

  // 7. ১ জন দফাদার (1 Person) - Gram Police Head
  {
    id: 'm_dafadar',
    category: 'dafadar',
    name: 'মোঃ আলতাফ হোসেন (দফাদার)',
    designation: 'দফাদার (গ্রাম পুলিশ প্রধান)',
    mobile: '০১৭৮০-১১২২৩৩',
    wardNo: 'সমগ্র ইউনিয়ন (ওয়ার্ড ০১-০৯)',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300'
  },

  // 8. ০৯ জন গ্রাম পুলিশ (9 Persons)
  {
    id: 'm_gp_1',
    category: 'gram_police',
    name: 'মোঃ জলিল মিয়া',
    designation: 'গ্রাম পুলিশ / মহল্লাদার',
    wardNo: 'ওয়ার্ড নং ০১',
    mobile: '০১৭৮১-২২৩৪৪৫',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'm_gp_2',
    category: 'gram_police',
    name: 'মোঃ শফিকুল ইসলাম',
    designation: 'গ্রাম পুলিশ / মহল্লাদার',
    wardNo: 'ওয়ার্ড নং ০২',
    mobile: '০১৭৮২-৩৩৪৪৫৬',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'm_gp_3',
    category: 'gram_police',
    name: 'মোঃ হেলাল উদ্দিন',
    designation: 'গ্রাম পুলিশ / মহল্লাদার',
    wardNo: 'ওয়ার্ড নং ০৩',
    mobile: '০১৭৮৩-৪৪৫৫৬৬',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'm_gp_4',
    category: 'gram_police',
    name: 'মোঃ কফিল উদ্দিন',
    designation: 'গ্রাম পুলিশ / মহল্লাদার',
    wardNo: 'ওয়ার্ড নং ০৪',
    mobile: '০১৭৮৪-৫৫৬৬Nz',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'm_gp_5',
    category: 'gram_police',
    name: 'মোঃ সোবহান আলী',
    designation: 'গ্রাম পুলিশ / মহল্লাদার',
    wardNo: 'ওয়ার্ড নং ০৫',
    mobile: '০১৭৮৫-৬৬Nz88',
    photoUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'm_gp_6',
    category: 'gram_police',
    name: 'মোঃ রুবেল মিয়া',
    designation: 'গ্রাম পুলিশ / মহল্লাদার',
    wardNo: 'ওয়ার্ড নং ০৬',
    mobile: '০১৭৮৬-৭৭Nz99',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'm_gp_7',
    category: 'gram_police',
    name: 'মোঃ বাচ্চু মিয়া',
    designation: 'গ্রাম পুলিশ / মহল্লাদার',
    wardNo: 'ওয়ার্ড নং ০৭',
    mobile: '০১৭৮৭-৮৮Nz00',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'm_gp_8',
    category: 'gram_police',
    name: 'মোঃ আজহারুল ইসলাম',
    designation: 'গ্রাম পুলিশ / মহল্লাদার',
    wardNo: 'ওয়ার্ড নং ০৮',
    mobile: '০১৭৮৮-৯৯Nz11',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'm_gp_9',
    category: 'gram_police',
    name: 'মোঃ সুলতান আহমেদ',
    designation: 'গ্রাম পুলিশ / মহল্লাদার',
    wardNo: 'ওয়ার্ড নং ০৯',
    mobile: '০১৭৮৯-০০Nz22',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300'
  }
];

/**
 * Returns council members list with Chairman and Secretary auto-synced from UnionParishadConfig.
 */
export function getSyncedCouncilMembers(
  config: UnionParishadConfig,
  customList?: CouncilMember[]
): CouncilMember[] {
  const baseList = (customList && customList.length > 0)
    ? customList
    : (config.councilMembers && config.councilMembers.length > 0)
      ? config.councilMembers
      : DEFAULT_COUNCIL_MEMBERS;

  return baseList.map(member => {
    if (member.id === 'm_chairman' || member.category === 'chairman') {
      return {
        ...member,
        name: config.chairmanName || member.name,
        mobile: config.chairmanPhone || member.mobile,
        designation: config.chairmanTitle || member.designation,
        isAutoSynced: true
      };
    }

    if (member.id === 'm_secretary' || (member.category === 'officer' && member.designation.includes('সচিব'))) {
      return {
        ...member,
        name: config.secretaryName || member.name,
        mobile: config.secretaryPhone || member.mobile,
        designation: config.secretaryTitle || member.designation,
        isAutoSynced: true
      };
    }

    return member;
  });
}
