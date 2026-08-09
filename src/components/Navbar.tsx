import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Building2,
  Bell,
  Globe,
  Menu,
  Sun,
  Moon,
  ShieldCheck,
  UserCheck,
  Lock
} from 'lucide-react';
import { UnionParishadConfig } from '../types';
import { 
  fetchPendingCertificatesCountFromFirebase, 
  subscribePendingCertificatesCount,
  auth,
  AdminUserRecord
} from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { AdminAuthModal } from './AdminAuthModal';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  config: UnionParishadConfig;
  pendingCount?: number;
  onToggleMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, config, pendingCount: propPendingCount, onToggleMobileSidebar }) => {
  const [pendingCount, setPendingCount] = useState<number>(propPendingCount ?? 0);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);
  const [currentAdminUser, setCurrentAdminUser] = useState<FirebaseUser | null>(null);
  const [adminRecord, setAdminRecord] = useState<AdminUserRecord | null>(null);

  useEffect(() => {
    const loadSavedSession = () => {
      const saved = localStorage.getItem('bup_active_admin_session');
      if (saved) {
        try {
          setAdminRecord(JSON.parse(saved));
        } catch (e) {
          setAdminRecord(null);
        }
      } else {
        setAdminRecord(null);
      }
    };

    loadSavedSession();

    const handleAuthEvent = (e: any) => {
      setAdminRecord(e.detail);
    };

    window.addEventListener('adminAuthChanged', handleAuthEvent);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentAdminUser(user);
    });

    return () => {
      window.removeEventListener('adminAuthChanged', handleAuthEvent);
      unsubscribe();
    };
  }, []);

  // Dark Mode Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('app_theme') === 'dark' || document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('app_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('app_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Language state (bn / en)
  const [lang, setLang] = useState<'bn' | 'en'>(() => {
    return (localStorage.getItem('app_lang') as 'bn' | 'en') || 'bn';
  });

  const toggleLanguage = () => {
    const nextLang = lang === 'bn' ? 'en' : 'bn';
    setLang(nextLang);
    localStorage.setItem('app_lang', nextLang);
    window.dispatchEvent(new CustomEvent('languageChange', { detail: nextLang }));
  };

  // Fetch pending count from backend API and Firestore
  const fetchPendingCount = async () => {
    let apiTotal = 0;
    try {
      const res = await fetch('/api/admin/pending');
      const data = await res.json();
      if (data.success && typeof data.total === 'number') {
        apiTotal = data.total;
      }
    } catch (err) {
      console.warn('Could not fetch pending count for navbar API:', err);
    }

    try {
      const fsTotal = await fetchPendingCertificatesCountFromFirebase();
      setPendingCount(Math.max(apiTotal, fsTotal));
    } catch (err) {
      setPendingCount(apiTotal);
    }
  };

  useEffect(() => {
    fetchPendingCount();

    // Subscribe to Firestore real-time updates for pending certificates
    const unsubscribeFirestore = subscribePendingCertificatesCount((fsCount) => {
      setPendingCount(prev => Math.max(prev, fsCount));
    });

    // Poll backend API every 8 seconds as fallback
    const interval = setInterval(fetchPendingCount, 8000);

    return () => {
      unsubscribeFirestore();
      clearInterval(interval);
    };
  }, [activeTab]);

  useEffect(() => {
    if (typeof propPendingCount === 'number') {
      setPendingCount(propPendingCount);
    }
  }, [propPendingCount]);

  return (
    <header className="bg-emerald-900 text-white shadow-lg sticky top-0 z-40 border-b border-emerald-800">
      {/* Top Govt Bar */}
      <div className="bg-emerald-950 py-1.5 px-4 text-xs font-medium text-emerald-200 border-b border-emerald-800/60">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{lang === 'bn' ? 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার - স্থানীয় সরকার বিভাগ' : 'Govt. of the People\'s Republic of Bangladesh - Local Govt. Division'}</span>
          </div>
          <div className="flex items-center gap-4 text-emerald-300">
            <span>{lang === 'bn' ? 'হেল্পলাইন: ০৯৬৩৮০০১১২২' : 'Helpline: 09638001122'}</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">{lang === 'bn' ? 'ইমেইল: baheratailunion@gmail.com' : 'Email: baheratailunion@gmail.com'}</span>
            
            {/* Top Bar Language Toggle Button */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-900 hover:bg-emerald-800 text-amber-300 text-[11px] font-bold rounded-full border border-emerald-700 transition cursor-pointer active:scale-95"
              title={lang === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
            >
              <Globe className="w-3.5 h-3.5 text-amber-300" />
              <span className={lang === 'bn' ? 'text-amber-300 font-extrabold underline' : 'text-emerald-300'}>বাংলা</span>
              <span className="text-emerald-500">|</span>
              <span className={lang === 'en' ? 'text-amber-300 font-extrabold underline' : 'text-emerald-300'}>EN</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-white p-1 flex items-center justify-center shadow-md shrink-0">
              <img 
                src={config.logoUrl} 
                alt="BD Seal" 
                className="w-9 h-9 md:w-10 md:h-10 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <Building2 className="w-8 h-8 text-emerald-800" style={{ display: 'none' }} />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold tracking-tight text-white leading-tight">
                {config.upName}
              </h1>
              <p className="text-xs md:text-sm text-emerald-200 flex items-center gap-1">
                <span>{config.address}</span>
              </p>
            </div>
          </div>

          {/* Mobile Hamburger Toggle Button */}
          {onToggleMobileSidebar && (
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-800 text-amber-300 border border-emerald-700 transition cursor-pointer active:scale-95 flex items-center gap-1.5"
              aria-label="Toggle Navigation Sidebar"
            >
              <Menu className="w-5 h-5 text-amber-300" />
              <span className="text-xs font-bold hidden sm:inline">মেনু</span>
            </button>
          )}
        </div>

        {/* Quick Action buttons & Pending Notification Badge */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Dark / Light Mode Toggle Button */}
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-950/80 hover:bg-emerald-800 text-amber-300 text-xs font-bold rounded-lg border border-emerald-700 transition cursor-pointer active:scale-95"
            title={isDarkMode ? 'লাইট মোডে পরিবর্তন করুন' : 'ডার্ক মোডে পরিবর্তন করুন'}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-300" />
                <span>লাইট মোড</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-amber-300" />
                <span>ডার্ক মোড</span>
              </>
            )}
          </button>

          {/* Language Toggle Pill in Quick Action Bar */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-950/80 hover:bg-emerald-800 text-amber-300 text-xs font-bold rounded-lg border border-emerald-700 transition cursor-pointer active:scale-95"
            title={lang === 'bn' ? 'Switch to English' : 'বাংলায় রূপান্তর করুন'}
          >
            <Globe className="w-4 h-4 text-amber-300" />
            <span>{lang === 'bn' ? 'English (EN)' : 'বাংলা (BN)'}</span>
          </button>

          {/* Chairman Pending Approval Notification Button */}
          <button
            onClick={() => setActiveTab('pending')}
            className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
              pendingCount > 0
                ? 'bg-amber-400/10 border-amber-400 text-amber-300 hover:bg-amber-400/20'
                : 'bg-emerald-950/60 border-emerald-700 text-emerald-200 hover:bg-emerald-800'
            }`}
            title={lang === 'bn' ? 'চেয়ারম্যান অনুমোদন পেন্ডিং আবেদনসমূহ' : 'Pending Chairman Approvals'}
          >
            <div className="relative">
              <Bell className={`w-4 h-4 ${pendingCount > 0 ? 'text-amber-300 animate-bounce' : 'text-emerald-300'}`} />
              {pendingCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
              )}
            </div>
            <span>{lang === 'bn' ? 'চেয়ারম্যান অনুমোদন' : 'Chairman Approval'}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                pendingCount > 0
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-emerald-800 text-emerald-200'
              }`}
            >
              {pendingCount}
            </span>
          </button>

          {/* Multi-Admin Google Firebase Auth Button */}
          <button
            onClick={() => setIsAdminAuthModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-emerald-950 text-xs font-black rounded-lg shadow-md transition-all duration-200 cursor-pointer active:scale-95 border border-amber-500/80 shrink-0"
            title="গুগল অথেন্টিকেশন ও এডমিন প্যানেল সাইন ইন"
          >
            {(currentAdminUser || adminRecord) ? (
              <>
                {(currentAdminUser?.photoURL || adminRecord?.photoUrl) ? (
                  <img 
                    src={currentAdminUser?.photoURL || adminRecord?.photoUrl} 
                    alt="Admin Avatar" 
                    className="w-5 h-5 rounded-full border border-emerald-900 object-cover"
                  />
                ) : (
                  <UserCheck className="w-4 h-4 text-emerald-950" />
                )}
                <span className="truncate max-w-[110px]">
                  {adminRecord?.name ? adminRecord.name.split(' ')[0] : (currentAdminUser?.displayName?.split(' ')[0] || currentAdminUser?.email?.split('@')[0] || 'এডমিন')}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-950" />
                <span>{lang === 'bn' ? 'এডমিন লগইন (Auth)' : 'Admin Auth Login'}</span>
              </>
            )}
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 text-sm font-semibold rounded-lg shadow transition-all duration-200 cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-emerald-950 fill-emerald-950" />
            <span>{lang === 'bn' ? 'স্মার্ট সনদ তৈরি করুন' : 'Create Smart Certificate'}</span>
          </button>
        </div>
      </div>

      {/* Admin Auth Modal Triggered via Navbar Button */}
      <AdminAuthModal 
        isOpen={isAdminAuthModalOpen} 
        onClose={() => setIsAdminAuthModalOpen(false)}
        onAdminAuthenticated={(user) => setAdminRecord(user)}
      />
    </header>
  );
};

