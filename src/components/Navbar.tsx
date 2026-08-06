import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Users, 
  Settings, 
  Home, 
  Sparkles, 
  Building2,
  Code2,
  UserCheck,
  Layers,
  Bell,
  BarChart2,
  Globe
} from 'lucide-react';
import { UnionParishadConfig } from '../types';
import { 
  fetchPendingCertificatesCountFromFirebase, 
  subscribePendingCertificatesCount 
} from '../firebase';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  config: UnionParishadConfig;
  pendingCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, config, pendingCount: propPendingCount }) => {
  const [pendingCount, setPendingCount] = useState<number>(propPendingCount ?? 0);

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

  const navItems = [
    { id: 'home', label: lang === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard', icon: Home },
    { id: 'analytics', label: lang === 'bn' ? '৩০ দিনের ট্রেন্ড' : '30-Day Trends', icon: BarChart2, badge: 'Recharts' },
    { 
      id: 'pending', 
      label: lang === 'bn' ? 'চেয়ারম্যান অনুমোদন' : 'Chairman Approval', 
      icon: ShieldCheck, 
      badge: pendingCount > 0 ? (lang === 'bn' ? `${pendingCount} টি` : `${pendingCount} Items`) : (lang === 'bn' ? '০ টি' : '0 Items'),
      isPendingTab: true
    },
    { id: 'heatmap', label: lang === 'bn' ? 'উন্নয়ন হিটম্যাপ' : 'Dev Heatmap', icon: Layers, badge: lang === 'bn' ? 'D3 এনালাইটিক্স' : 'D3 Analytics' },
    { id: 'create', label: lang === 'bn' ? 'নতুন প্রত্যয়নপত্র' : 'New Certificate', icon: FileText, badge: lang === 'bn' ? '৪০+ ধরন' : '40+ Types' },
    { id: 'logs', label: lang === 'bn' ? 'সনদ পেজ ও রেকর্ড' : 'Cert Records', icon: FileText },
    { id: 'citizens', label: lang === 'bn' ? 'নাগরিক একাউন্ট' : 'Citizen Accounts', icon: UserCheck, badge: lang === 'bn' ? 'ওয়ার্ড ফিল্টার' : 'Ward Filter' },
    { id: 'members', label: lang === 'bn' ? 'পরিষদ সদস্য ও কর্মকর্তা' : 'Council & Staff', icon: Users, badge: lang === 'bn' ? '২৭ জন' : '27 Officials' },
    { id: 'verify', label: lang === 'bn' ? 'সনদ অনলাইন যাচাই' : 'Online Verify', icon: ShieldCheck },
    { id: 'developer', label: lang === 'bn' ? 'ডেভেলপার ও ব্যাকআপ' : 'Developer & Backup', icon: Code2, badge: 'MCP Sync' },
    { id: 'admin', label: lang === 'bn' ? 'অ্যাডমিন সেটআপ' : 'Admin Setup', icon: Settings }
  ];

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
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="w-12 h-12 rounded-full bg-white p-1 flex items-center justify-center shadow-md shrink-0">
            <img 
              src={config.logoUrl} 
              alt="BD Seal" 
              className="w-10 h-10 object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <Building2 className="w-8 h-8 text-emerald-800" style={{ display: 'none' }} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white leading-tight">
              {config.upName}
            </h1>
            <p className="text-xs md:text-sm text-emerald-200 flex items-center gap-1">
              <span>{config.address}</span>
            </p>
          </div>
        </div>

        {/* Quick Action buttons & Pending Notification Badge */}
        <div className="flex items-center gap-3 flex-wrap">
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

          <button
            onClick={() => setActiveTab('create')}
            className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 text-sm font-semibold rounded-lg shadow transition-all duration-200 cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-emerald-950 fill-emerald-950" />
            <span>{lang === 'bn' ? 'স্মার্ট সনদ তৈরি করুন' : 'Create Smart Certificate'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="bg-emerald-950/80 backdrop-blur border-t border-emerald-800/80 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm font-semibold'
                    : 'text-emerald-100 hover:bg-emerald-800/60 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-emerald-300'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`ml-1 px-2 py-0.5 text-[10px] font-bold rounded-full transition-all ${
                      item.isPendingTab && pendingCount > 0
                        ? 'bg-rose-500 text-white font-black animate-pulse shadow'
                        : 'bg-amber-400 text-emerald-950'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};

