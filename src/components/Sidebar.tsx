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
  Globe, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Phone, 
  HelpCircle, 
  ExternalLink, 
  MapPin, 
  Megaphone, 
  Activity, 
  Lock,
  MessageSquare
} from 'lucide-react';
import { UnionParishadConfig } from '../types';
import { 
  fetchPendingCertificatesCountFromFirebase, 
  subscribePendingCertificatesCount 
} from '../firebase';
import { AdminAuthModal } from './AdminAuthModal';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  config: UnionParishadConfig;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  pendingCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  config,
  isOpenMobile,
  setIsOpenMobile,
  pendingCount: propPendingCount
}) => {
  const [pendingCount, setPendingCount] = useState<number>(propPendingCount ?? 0);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Track active developer / admin session
  const [activeAdmin, setActiveAdmin] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('bup_active_admin_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    const handleAuthChange = (e: CustomEvent) => {
      setActiveAdmin(e.detail || null);
    };
    window.addEventListener('adminAuthChanged' as any, handleAuthChange);
    return () => {
      window.removeEventListener('adminAuthChanged' as any, handleAuthChange);
    };
  }, []);

  const isDeveloper = React.useMemo(() => {
    if (!activeAdmin) return false;
    return ['developer', 'super_admin'].includes(activeAdmin.role);
  }, [activeAdmin]);

  // Language state (bn / en)
  const [lang, setLang] = useState<'bn' | 'en'>(() => {
    return (localStorage.getItem('app_lang') as 'bn' | 'en') || 'bn';
  });

  useEffect(() => {
    const handleLangChange = (e: CustomEvent) => {
      setLang(e.detail);
    };
    window.addEventListener('languageChange' as any, handleLangChange);
    return () => {
      window.removeEventListener('languageChange' as any, handleLangChange);
    };
  }, []);

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
      // silent catch
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
    const unsubscribeFirestore = subscribePendingCertificatesCount((fsCount) => {
      setPendingCount(prev => Math.max(prev, fsCount));
    });
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
    { 
      id: 'home', 
      label: lang === 'bn' ? '১. ড্যাশবোর্ড' : '1. Dashboard', 
      icon: Home,
      subItems: [
        { id: 'analytics', label: lang === 'bn' ? '📊 ৩০ দিনের ট্রেন্ড এনালাইটিক্স' : '📊 30-Day Trends Analytics', icon: BarChart2 }
      ]
    },
    { 
      id: 'pending', 
      label: lang === 'bn' ? '২. চেয়ারম্যান অনুমোদন সমুহ' : '2. Chairman Approvals', 
      icon: ShieldCheck, 
      badge: pendingCount > 0 ? (lang === 'bn' ? `${pendingCount} টি` : `${pendingCount} Items`) : undefined,
      isPendingTab: true
    },
    { 
      id: 'citizens', 
      label: lang === 'bn' ? '৩. নাগরিক একাউন্ট' : '3. Citizen Accounts', 
      icon: UserCheck, 
      badge: lang === 'bn' ? 'ওয়ার্ড ফিল্টার' : 'Ward Filter' 
    },
    { 
      id: 'create', 
      label: lang === 'bn' ? '৪. নতুন প্রত্যয়নপত্র আবেদন' : '4. New Certificate Application', 
      icon: FileText, 
      badge: lang === 'bn' ? '৮০+ ধরন' : '80+ Formats' 
    },
    { 
      id: 'logs', 
      label: lang === 'bn' ? '৫. সনদ পেজ ও রেকর্ড (সকল)' : '5. All Certificate Records', 
      icon: FileText 
    },
    { 
      id: 'verify', 
      label: lang === 'bn' ? '৬. সনদ অনলাইন যাচাই' : '6. Online Certificate Verify', 
      icon: ShieldCheck, 
      badge: lang === 'bn' ? 'QR স্ক্যান' : 'QR Scan' 
    },
    { 
      id: 'members', 
      label: lang === 'bn' ? '৭. পরিষদ সদস্য ও কর্মকর্তা' : '7. Council Members & Staff', 
      icon: Users, 
      badge: lang === 'bn' ? '২৭ জন' : '27 Officials' 
    },
    { 
      id: 'heatmap', 
      label: lang === 'bn' ? '৮. উন্নয়ন হিটম্যাপ' : '8. Development Heatmap', 
      icon: Layers, 
      badge: lang === 'bn' ? 'D3 এনালাইটিক্স' : 'D3' 
    },
    { 
      id: 'map', 
      label: lang === 'bn' ? '৯. জিআইএস ওয়ার্ড ম্যাপ' : '9. GIS Ward Map', 
      icon: MapPin, 
      badge: lang === 'bn' ? 'ওয়ার্ড ১-৯' : 'Ward 1-9' 
    },
    { 
      id: 'notice', 
      label: lang === 'bn' ? '১০. ডিজিটাল নোটিশ বোর্ড' : '10. Digital Notice Board', 
      icon: Megaphone, 
      badge: lang === 'bn' ? 'লাইভ' : 'Live' 
    },
    { 
      id: 'google_chat', 
      label: lang === 'bn' ? '১১. গুগল চ্যাট ও টিম স্পেস' : '11. Google Chat & Spaces', 
      icon: MessageSquare, 
      badge: lang === 'bn' ? 'ওয়ার্কস্পেস' : 'Workspace' 
    },
    { 
      id: 'audit_trail', 
      label: lang === 'bn' ? '১২. অ্যাক্টিভিটি অডিট ট্রেইল' : '12. Activity Audit Trail', 
      icon: Activity, 
      badge: lang === 'bn' ? 'সুপার এডমিন' : 'Super Admin' 
    },
    { 
      id: 'admin_dashboard', 
      label: lang === 'bn' ? '১৩. ইউজার ও পারমিশন রোল' : '13. Admin Users & Roles', 
      icon: ShieldCheck 
    },
    { 
      id: 'admin', 
      label: lang === 'bn' ? '১৪. মাস্টার সেটআপ' : '14. Master Setup', 
      icon: Settings 
    },
    { 
      id: 'developer_control', 
      label: lang === 'bn' ? '১৫. ডেভেলপার সিকিউরিটি অ্যান্ড কন্ট্রোল' : '15. Developer Security Control', 
      icon: Lock, 
      badge: lang === 'bn' ? 'এডমিন' : 'Admin' 
    },
    { 
      id: 'developer', 
      label: lang === 'bn' ? '১৬. ডেভেলপার প্রোফাইল' : '16. Developer Profile', 
      icon: Code2, 
      badge: lang === 'bn' ? 'পাবলিক' : 'Public' 
    }
  ];

  // Categories 11, 12, 13, 14 (audit_trail, admin_dashboard, admin, developer_control) are strictly visible ONLY to Developer
  const visibleNavItems = navItems.filter((item) => {
    if (['audit_trail', 'admin_dashboard', 'admin', 'developer_control'].includes(item.id)) {
      return isDeveloper;
    }
    return true;
  });

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* ========================================== */}
      {/* MOBILE OVERLAY & SLIDE-OUT DRAWER MENU     */}
      {/* ========================================== */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-emerald-950 text-white flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Sidebar Header */}
        <div className="p-4 bg-emerald-900 border-b border-emerald-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white p-0.5 shadow-md flex items-center justify-center shrink-0">
              <img 
                src={config?.logoUrl || '/baheratail_seal.svg'} 
                alt={config?.upName || "Logo"} 
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (target.src !== window.location.origin + '/baheratail_seal.svg') {
                    target.src = '/baheratail_seal.svg';
                  }
                }}
              />
              <Building2 className="w-6 h-6 text-emerald-900" style={{ display: 'none' }} />
            </div>
            <div className="min-w-0">
              <h2 className="font-extrabold text-sm text-amber-300 truncate leading-tight">
                {config.upName}
              </h2>
              <p className="text-[11px] text-emerald-200 truncate">
                {config.address}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpenMobile(false)}
            className="p-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-emerald-100 transition cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Quick Certificate Button */}
        <div className="p-3 bg-emerald-900/60 border-b border-emerald-800/50">
          <button
            onClick={() => handleNavClick('create')}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-black text-xs rounded-xl shadow-[0_0_15px_rgba(251,191,36,0.6)] border border-amber-200 transition active:scale-95 cursor-pointer relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <Sparkles className="w-4 h-4 fill-emerald-950 animate-bounce" />
            <span className="tracking-wide">{lang === 'bn' ? 'স্মার্ট সনদ তৈরি করুন 🟢✨' : 'Create Smart Certificate ✨'}</span>
          </button>
        </div>

        {/* Mobile Nav Links list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 no-scrollbar">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <React.Fragment key={item.id}>
                <button
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-md border-l-4 border-amber-400 font-bold'
                      : 'text-emerald-100 hover:bg-emerald-900/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-emerald-300'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-black rounded-full shrink-0 ${
                        item.isPendingTab && pendingCount > 0
                          ? 'bg-rose-500 text-white animate-bounce shadow-xs'
                          : 'bg-amber-400 text-emerald-950'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>

                {item.subItems && (
                  <div className="pl-6 space-y-1 my-1">
                    {item.subItems.map((sub) => {
                      const SubIcon = sub.icon;
                      const isSubActive = activeTab === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => handleNavClick(sub.id)}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                            isSubActive
                              ? 'bg-emerald-800/90 text-amber-300 font-bold border-l-2 border-amber-400'
                              : 'text-emerald-200 hover:bg-emerald-900/60 hover:text-white'
                          }`}
                        >
                          <SubIcon className="w-3.5 h-3.5 text-amber-300" />
                          <span>{sub.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Mobile Sidebar Footer */}
        <div className="p-3 bg-emerald-900/80 border-t border-emerald-800 text-[11px] space-y-2 shrink-0">
          {!isDeveloper ? (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full py-2 px-3 bg-gradient-to-r from-emerald-950 to-slate-900 hover:from-emerald-900 hover:to-slate-800 text-amber-300 font-black rounded-xl border border-amber-400/50 flex items-center justify-center gap-2 text-xs transition cursor-pointer shadow-md"
            >
              <Lock className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>ডেভেলপার লগইন (১১-১৪ ক্যাটাগরি)</span>
            </button>
          ) : (
            <div className="p-2 bg-emerald-950/80 rounded-xl text-[10px] text-amber-300 flex items-center justify-between border border-amber-400/40">
              <div className="flex items-center gap-1.5 min-w-0">
                <Code2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="font-extrabold text-white truncate">{activeAdmin?.name || 'ডেভেলপার'}</span>
              </div>
              <span className="text-[9px] bg-amber-400 text-emerald-950 font-black px-1.5 py-0.5 rounded shrink-0">DEV</span>
            </div>
          )}

          <button
            onClick={toggleLanguage}
            className="w-full py-1.5 px-3 bg-emerald-950 hover:bg-emerald-800 text-amber-300 font-bold rounded-lg border border-emerald-700 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-amber-300" />
            <span>{lang === 'bn' ? 'Switch to English' : 'বাংলায় রূপান্তর'}</span>
          </button>
          
          <div className="text-center text-[10px] text-emerald-300">
            <span>হেল্পলাইন: ০৯৬৩৮০০১১২২</span>
          </div>
        </div>
      </aside>

      {/* ========================================== */}
      {/* DESKTOP FIXED SIDEBAR (Left Column)        */}
      {/* ========================================== */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 bottom-0 left-0 z-30 bg-emerald-950 text-white border-r border-emerald-800/80 shadow-xl transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Desktop Sidebar Top Logo & Brand */}
        <div className={`p-4 bg-emerald-900/90 border-b border-emerald-800 flex items-center justify-between shrink-0 ${isCollapsed ? 'px-3 justify-center' : ''}`}>
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer min-w-0"
            title={config.upName}
          >
            <div className="w-10 h-10 rounded-full bg-white p-0.5 shadow-md flex items-center justify-center shrink-0">
              <img 
                src={config?.logoUrl || '/baheratail_seal.svg'} 
                alt={config?.upName || "Logo"} 
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (target.src !== window.location.origin + '/baheratail_seal.svg') {
                    target.src = '/baheratail_seal.svg';
                  }
                }}
              />
              <Building2 className="w-6 h-6 text-emerald-900" style={{ display: 'none' }} />
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <h2 className="font-black text-sm text-amber-300 truncate leading-tight">
                  {config.upName}
                </h2>
                <p className="text-[11px] text-emerald-200 truncate">
                  স্মার্ট পোর্টাল
                </p>
              </div>
            )}
          </div>

          {/* Desktop Collapse / Expand Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-emerald-200 hover:text-white transition cursor-pointer shrink-0 ${isCollapsed ? 'mt-1' : ''}`}
            title={isCollapsed ? 'সাইডবার প্রসারিত করুন' : 'সাইডবার গুটিয়ে রাখুন'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Desktop Create Certificate CTA */}
        <div className={`p-3 bg-emerald-900/40 border-b border-emerald-800/50 shrink-0 ${isCollapsed ? 'p-2' : ''}`}>
          <button
            onClick={() => handleNavClick('create')}
            className={`w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-black text-xs rounded-xl shadow-[0_0_15px_rgba(251,191,36,0.6)] border border-amber-200 transition active:scale-95 cursor-pointer relative overflow-hidden group ${
              isCollapsed ? 'px-0' : 'px-3'
            }`}
            title={lang === 'bn' ? 'স্মার্ট সনদ তৈরি করুন' : 'Create Certificate'}
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <Sparkles className="w-4 h-4 fill-emerald-950 shrink-0 animate-bounce" />
            {!isCollapsed && <span>{lang === 'bn' ? 'স্মার্ট সনদ তৈরি করুন 🟢✨' : 'Create Cert ✨'}</span>}
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 no-scrollbar">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <React.Fragment key={item.id}>
                <button
                  onClick={() => handleNavClick(item.id)}
                  title={item.label}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-md border-l-4 border-amber-400 font-bold'
                      : 'text-emerald-100 hover:bg-emerald-900/70 hover:text-white'
                  } ${isCollapsed ? 'justify-center px-2' : ''}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4.5 h-4.5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-amber-300' : 'text-emerald-300'}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!isCollapsed && item.badge && (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-black rounded-full shrink-0 ${
                        item.isPendingTab && pendingCount > 0
                          ? 'bg-rose-500 text-white animate-pulse shadow-xs'
                          : 'bg-amber-400 text-emerald-950'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Collapsed view indicator badge dot */}
                  {isCollapsed && item.isPendingTab && pendingCount > 0 && (
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping absolute right-3" />
                  )}
                </button>

                {!isCollapsed && item.subItems && (
                  <div className="pl-6 space-y-1 my-1">
                    {item.subItems.map((sub) => {
                      const SubIcon = sub.icon;
                      const isSubActive = activeTab === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => handleNavClick(sub.id)}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                            isSubActive
                              ? 'bg-emerald-800/90 text-amber-300 font-bold border-l-2 border-amber-400'
                              : 'text-emerald-200 hover:bg-emerald-900/60 hover:text-white'
                          }`}
                        >
                          <SubIcon className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                          <span className="truncate">{sub.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Desktop Sidebar Footer */}
        <div className={`p-3 bg-emerald-900/80 border-t border-emerald-800 text-xs shrink-0 ${isCollapsed ? 'p-2 text-center' : ''}`}>
          {!isCollapsed ? (
            <div className="space-y-2">
              {!isDeveloper ? (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full py-2 px-3 bg-gradient-to-r from-emerald-950 to-slate-900 hover:from-emerald-900 hover:to-slate-800 text-amber-300 font-black rounded-xl border border-amber-400/50 flex items-center justify-center gap-2 text-[11px] transition cursor-pointer shadow-md"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>ডেভেলপার লগইন (১১-১৪ ক্যাটাগরি)</span>
                </button>
              ) : (
                <div className="p-2 bg-emerald-950/80 rounded-xl text-[10px] text-amber-300 flex items-center justify-between border border-amber-400/40">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Code2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span className="font-extrabold text-white truncate">{activeAdmin?.name || 'ডেভেলপার'}</span>
                  </div>
                  <span className="text-[9px] bg-amber-400 text-emerald-950 font-black px-1.5 py-0.5 rounded shrink-0">DEV</span>
                </div>
              )}

              <button
                onClick={toggleLanguage}
                className="w-full py-1.5 px-3 bg-emerald-950 hover:bg-emerald-800 text-amber-300 font-bold rounded-lg border border-emerald-700 flex items-center justify-center gap-1.5 text-xs transition cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-amber-300" />
                <span>{lang === 'bn' ? 'English (EN)' : 'বাংলা (BN)'}</span>
              </button>

              <div className="p-2 bg-emerald-950/60 rounded-lg text-[10px] text-emerald-300 space-y-0.5">
                <p className="font-bold text-white flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>সিস্টেম স্ট্যাটাস: অনলাইন</span>
                </p>
                <p className="text-[9.5px] text-emerald-400 truncate">ডিজিটাল ইউপি সিঙ্ক এক্টিভ</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="p-2 bg-emerald-950 hover:bg-emerald-800 text-amber-300 rounded-lg border border-emerald-700 mx-auto transition cursor-pointer block"
                title="ডেভেলপার / এডমিন লগইন"
              >
                <Lock className="w-4 h-4 text-amber-300" />
              </button>
              <button
                onClick={toggleLanguage}
                className="p-2 bg-emerald-950 hover:bg-emerald-800 text-amber-300 rounded-lg border border-emerald-700 mx-auto transition cursor-pointer block"
                title={lang === 'bn' ? 'Switch to English' : 'বাংলায় রূপান্তর'}
              >
                <Globe className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Admin / Developer Authentication Modal */}
      <AdminAuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
};
