import { useState, useEffect } from 'react';

export type Language = 'bn' | 'en';

export const translations = {
  bn: {
    govtTitle: 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার - স্থানীয় সরকার বিভাগ',
    helpline: 'হেল্পলাইন: ০৯৬৩৮০০১১২২',
    email: 'ইমেইল: baheratailunion@gmail.com',
    createCertificate: 'স্মার্ট সনদ তৈরি করুন',
    chairmanApproval: 'চেয়ারম্যান অনুমোদন',
    adminAuthLogin: 'এডমিন লগইন (Auth)',
    lightMode: 'লাইট মোড',
    darkMode: 'ডার্ক মোড',
    menu: 'মেনু',
    bnLang: 'বাংলা',
    enLang: 'English',
    languageToggleTitle: 'বাংলা / English রূপান্তর করুন',
    home: 'হোম ও একনজরে',
    newApplication: 'নতুন আবেদন ও সনদ ইস্যু',
    masterRegister: 'নাগরিক মাস্টার রেজিস্ট্রার',
    searchCertificate: 'অনলাইন সনদ যাচাইকরণ',
    warishCalculator: 'ওয়ারিশ বন্টন ও ক্যালকুলেটর',
    councilMembers: 'পরিষদ সদস্য ও কর্মকর্তা',
    noticeBoard: 'ডিজিটাল নোটিশ বোর্ড',
    citizenLogs: 'নাগরিক ফি ব্যাকলগ',
    heatmap: 'ইউনিয়ন উন্নয়ন ম্যাপ',
    pendingApprovals: 'চেয়ারম্যান পেন্ডিং অনুমোদন',
    auditTrail: 'অ্যাক্টিভিটি অডিট ট্রেইল',
    userRoles: 'ইউজার ও পারমিশন রোল',
    masterSetup: 'মাস্টার সেটআপ',
    developerControl: 'ডেভেলপার সিকিউরিটি অ্যান্ড কন্ট্রোল',
    developerProfile: 'ডেভেলপার প্রোফাইল',
    welcomeHeading: 'স্মার্ট ইউনিয়ন পরিষদ সেবা পোর্টাল',
    searchPlaceholder: 'সনদ ট্র্যাকিং নম্বর / NID টাইপ করুন...',
    verifyButton: 'যাচাই করুন',
    downloadPdf: 'পিডিএফ ডাউনলোড',
    printCertificate: 'প্রিন্ট প্রাকদর্শন',
    saveDraft: 'খসড়া সংরক্ষণ',
    submitApplication: 'আবেদন জমা দিন',
    success: 'সফলভাবে সম্পন্ন হয়েছে!',
    error: 'একটি ত্রুটি ঘটেছে। আবার চেষ্টা করুন।'
  },
  en: {
    govtTitle: 'Govt. of the People\'s Republic of Bangladesh - Local Govt. Division',
    helpline: 'Helpline: 09638001122',
    email: 'Email: baheratailunion@gmail.com',
    createCertificate: 'Create Smart Certificate',
    chairmanApproval: 'Chairman Approval',
    adminAuthLogin: 'Admin Auth Login',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    menu: 'Menu',
    bnLang: 'বাংলা',
    enLang: 'English',
    languageToggleTitle: 'Switch Language (Bengali / English)',
    home: 'Home & Overview',
    newApplication: 'New Application & Issue Certificate',
    masterRegister: 'Citizen Master Register',
    searchCertificate: 'Online Certificate Verification',
    warishCalculator: 'Inheritance (Warish) Calculator',
    councilMembers: 'Council Members & Staff',
    noticeBoard: 'Digital Notice Board',
    citizenLogs: 'Citizen Fee Backlog',
    heatmap: 'Union Development Map',
    pendingApprovals: 'Chairman Pending Approvals',
    auditTrail: 'Activity Audit Trail',
    userRoles: 'User & Permission Roles',
    masterSetup: 'Master Setup',
    developerControl: 'Developer Security & Control',
    developerProfile: 'Developer Profile',
    welcomeHeading: 'Smart Union Parishad Service Portal',
    searchPlaceholder: 'Type Certificate Tracking No. / NID...',
    verifyButton: 'Verify Now',
    downloadPdf: 'Download PDF',
    printCertificate: 'Print Preview',
    saveDraft: 'Save Draft',
    submitApplication: 'Submit Application',
    success: 'Successfully Completed!',
    error: 'An error occurred. Please try again.'
  }
};

export function getLanguage(): Language {
  if (typeof window === 'undefined') return 'bn';
  return (localStorage.getItem('app_lang') as Language) || 'bn';
}

export function setLanguage(lang: Language): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('app_lang', lang);
  window.dispatchEvent(new CustomEvent('languageChange', { detail: lang }));
}

export function t(key: keyof typeof translations.bn, currentLang?: Language): string {
  const lang = currentLang || getLanguage();
  return translations[lang]?.[key] || translations.bn[key] || key;
}

export function useTranslation() {
  const [lang, setLangState] = useState<Language>(getLanguage);

  useEffect(() => {
    const handleLangChange = (e: CustomEvent<Language>) => {
      if (e.detail && (e.detail === 'bn' || e.detail === 'en')) {
        setLangState(e.detail);
      }
    };

    window.addEventListener('languageChange' as any, handleLangChange);
    return () => {
      window.removeEventListener('languageChange' as any, handleLangChange);
    };
  }, []);

  const toggleLang = () => {
    const nextLang: Language = lang === 'bn' ? 'en' : 'bn';
    setLanguage(nextLang);
  };

  return {
    lang,
    setLanguage: setLanguage,
    toggleLanguage: toggleLang,
    t: (key: keyof typeof translations.bn) => t(key, lang)
  };
}
