import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { HomePanel } from './components/HomePanel';
import { CertificateForm } from './components/CertificateForm';
import { CertificateView } from './components/CertificateView';
import { VerificationPortal } from './components/VerificationPortal';
import { CitizenLogs } from './components/CitizenLogs';
import { AdminSettings } from './components/AdminSettings';
import { AdminDashboard } from './components/AdminDashboard';
import { ActivityAuditTrail } from './components/ActivityAuditTrail';
import { CitizenMasterRegister } from './components/CitizenMasterRegister';
import { DeveloperProfile } from './components/DeveloperProfile';
import { DevelopmentHeatmap } from './components/DevelopmentHeatmap';
import { PendingApprovals } from './components/PendingApprovals';
import { CouncilMembers } from './components/CouncilMembers';
import { CertificateTrendDashboard } from './components/CertificateTrendDashboard';
import { UnionMapViewer } from './components/UnionMapViewer';
import { NoticeBoardTicker } from './components/NoticeBoardTicker';
import { AiCitizenAssistant } from './components/AiCitizenAssistant';
import { Dashboard } from './components/Dashboard';
import { AdminGuard } from './components/AdminGuard';
import { GoogleChatPortal } from './components/GoogleChatPortal';
import { fetchConfigFromFirebase } from './firebase';
import { CertificateRecord, UnionParishadConfig, CitizenAccountRecord } from './types';
import { DEFAULT_UP_CONFIG } from './data/villages';
import { applySecurityMetaTags } from './utils/securityHeaders';
import { Sparkles, Bot, Mic, MessageSquare, WifiOff, HardDrive } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [config, setConfig] = useState<UnionParishadConfig>(DEFAULT_UP_CONFIG);
  const [generatedCert, setGeneratedCert] = useState<CertificateRecord | null>(null);
  const [chatSharedCertificate, setChatSharedCertificate] = useState<CertificateRecord | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  // Apply Security CSP Meta Tags on Initialization & Sync Theme
  useEffect(() => {
    applySecurityMetaTags();
    const savedTheme = localStorage.getItem('app_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, []);

  // Monitor Network Connectivity for PWA Offline Mode
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch initial config from server & Firebase Firestore
  useEffect(() => {
    fetch('/api/admin/config')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data && data.config) {
          setConfig(data.config);
        }
      })
      .catch((err) => console.warn('Config fetch notice (using default configuration):', err));

    fetchConfigFromFirebase().then(fbConfig => {
      if (fbConfig) {
        setConfig(fbConfig);
      }
    }).catch(err => console.warn('Firestore config load warning:', err));
  }, []);

  const [selectedCitizenForCert, setSelectedCitizenForCert] = useState<CitizenAccountRecord | null>(null);

  const handleCertificateGenerated = (cert: CertificateRecord) => {
    setGeneratedCert(cert);
  };

  const handleNavigateTab = (tab: string) => {
    setActiveTab(tab);
    if (tab !== 'create') {
      setGeneratedCert(null);
    }
  };

  const handleApplyForCitizen = (citizen: CitizenAccountRecord) => {
    setSelectedCitizenForCert(citizen);
    setActiveTab('create');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300 selection:bg-emerald-200 selection:text-emerald-900">
      {/* Responsive Left Sidebar Navigation (Fixed Desktop + Mobile Slide-out Drawer) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleNavigateTab}
        config={config}
        isOpenMobile={isMobileSidebarOpen}
        setIsOpenMobile={setIsMobileSidebarOpen}
      />

      {/* Main Content Area Offset for Desktop Sidebar */}
      <div className="flex-1 flex flex-col lg:pl-64 transition-all duration-300 min-w-0">
        {/* Navigation Header */}
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={handleNavigateTab} 
          config={config}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* Offline PWA Service Worker Status Banner */}
        {isOffline && (
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 px-4 py-2.5 shadow-md flex items-center justify-between text-xs font-bold animate-fade-in border-b border-amber-400">
            <div className="flex items-center gap-2.5 max-w-4xl mx-auto">
              <div className="p-1.5 bg-slate-950 text-amber-400 rounded-lg shrink-0">
                <WifiOff className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <span className="font-black underline mr-1">অফলাইন মোড সক্রিয় (Service Worker Local Cache):</span>
                <span>আপনি বর্তমানে ইন্টারনেট সংযোগ ছাড়াই ডাউনলোডেড সনদপত্র, কিউআর কোড এবং পূর্বে সংরক্ষিত ড্রাফট ফরম ক্যাশ হইতে প্রদর্শন করিতে পারিতেছেন।</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Body Canvas */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 my-2">
        {activeTab === 'home' && (
          <HomePanel config={config} onNavigateTab={handleNavigateTab} />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard config={config} onNavigateTab={handleNavigateTab} />
        )}

        {activeTab === 'analytics' && (
          <CertificateTrendDashboard onNavigateTab={handleNavigateTab} />
        )}

        {activeTab === 'pending' && (
          <PendingApprovals config={config} />
        )}

        {activeTab === 'heatmap' && (
          <DevelopmentHeatmap config={config} />
        )}

        {activeTab === 'map' && (
          <UnionMapViewer config={config} />
        )}

        {activeTab === 'notice' && (
          <NoticeBoardTicker config={config} />
        )}

        {activeTab === 'create' && (
          <div>
            {generatedCert ? (
              <div className="space-y-4">
                <div className="bg-emerald-800 text-white p-4 rounded-xl shadow-md flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-amber-300">🎉 প্রত্যয়নপত্র সফলভাবে প্রস্তুত করা হইয়াছে!</h3>
                    <p className="text-xs text-emerald-100">নিচে প্রত্যয়নপত্রের পিডিএফ ভিউ, প্রিন্ট ও গুগল ডক লিংক দেওয়া হইয়াছে।</p>
                  </div>
                  <button
                    onClick={() => setGeneratedCert(null)}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs rounded-lg transition cursor-pointer"
                  >
                    + আরেকটি সনদ তৈরি করুন
                  </button>
                </div>
                <CertificateView 
                  certificate={generatedCert} 
                  config={config} 
                  onBack={() => setGeneratedCert(null)} 
                  onShareToGoogleChat={(cert) => {
                    setChatSharedCertificate(cert);
                    setActiveTab('google_chat');
                  }}
                />
              </div>
            ) : (
              <CertificateForm 
                config={config} 
                initialCitizen={selectedCitizenForCert}
                onClearInitialCitizen={() => setSelectedCitizenForCert(null)}
                onCertificateGenerated={handleCertificateGenerated} 
              />
            )}
          </div>
        )}

        {activeTab === 'google_chat' && (
          <GoogleChatPortal 
            config={config} 
            initialCertificateToShare={chatSharedCertificate} 
            onCertificateShared={() => setChatSharedCertificate(null)} 
          />
        )}

        {activeTab === 'verify' && (
          <VerificationPortal config={config} />
        )}

        {activeTab === 'logs' && (
          <CitizenLogs config={config} />
        )}

        {activeTab === 'citizens' && (
          <CitizenMasterRegister config={config} onApplyForCitizen={handleApplyForCitizen} />
        )}

        {activeTab === 'members' && (
          <CouncilMembers config={config} onUpdateConfig={setConfig} />
        )}

        {activeTab === 'developer' && (
          <DeveloperProfile config={config} onUpdateConfig={setConfig} />
        )}

        {activeTab === 'developer_control' && (
          <AdminGuard allowedRoles={['developer', 'super_admin']} title="ডেভেলপার সিকিউরিটি কন্ট্রোল সেন্টার">
            <DeveloperProfile config={config} onUpdateConfig={setConfig} />
          </AdminGuard>
        )}

        {activeTab === 'audit_trail' && (
          <AdminGuard allowedRoles={['super_admin', 'developer']} title="অ্যাক্টিভিটি অডিট ট্রেইল (Super Admin Only)">
            <ActivityAuditTrail config={config} onNavigateTab={handleNavigateTab} />
          </AdminGuard>
        )}

        {activeTab === 'admin_dashboard' && (
          <AdminGuard allowedRoles={['super_admin', 'chairman', 'secretary', 'developer', 'member']}>
            <AdminDashboard config={config} onNavigateTab={handleNavigateTab} />
          </AdminGuard>
        )}

        {activeTab === 'admin' && (
          <AdminGuard allowedRoles={['super_admin', 'chairman', 'secretary', 'developer']} title="এডমিন সেটিংস ও সিস্টেম কনফিগারেশন">
            <AdminSettings config={config} onUpdateConfig={setConfig} />
          </AdminGuard>
        )}
        </main>

        {/* Official Government Footer */}
        <footer className="bg-emerald-950 text-emerald-200 text-xs py-8 border-t border-emerald-900 mt-12 print:hidden">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-bold text-white text-sm">{config.upName}</h4>
              <p className="text-emerald-300 text-xs leading-relaxed">{config.address}</p>
              <p className="text-[11px] text-emerald-400">স্মার্ট সিটিজেন সার্ভিস ও অটোমেশন পোর্টাল</p>
            </div>

            <div className="space-y-1">
              <p className="font-bold text-white text-sm">যোগাযোগ ও সহায়তা:</p>
              <p className="text-emerald-300">চেয়ারম্যান কার্যালয়: {config.chairmanName}</p>
              <p className="text-emerald-300">প্রশাসনিক কর্মকর্তা: {config.secretaryName}</p>
              <p className="text-emerald-300">ইমেইল: baheratailunion@gmail.com</p>
            </div>

            <div className="space-y-1 text-right md:text-right">
              <p className="font-bold text-white text-sm">কারিগরি পরিচালনায়:</p>
              <p className="text-emerald-200 font-bold">MD JUBAER HOSSEN</p>
              <p className="text-emerald-300">মোবাইল: ০১৮৩৪-৩৩ ৩৩ ৩০০</p>
              <p className="text-[10px] text-emerald-400 mt-2">© ২০২৬ {config.upName}। সর্বস্বত্ব সংরক্ষিত।</p>
            </div>
          </div>
        </footer>
      </div>

      {/* Floating Gemini AI Citizen Voice Assistant Widget Button */}
      <div className="fixed bottom-6 right-6 z-40 print:hidden">
        <button
          onClick={() => setIsAiAssistantOpen(true)}
          className="group relative flex items-center gap-3 bg-gradient-to-r from-emerald-800 via-emerald-900 to-slate-900 text-white pl-4 pr-5 py-3.5 rounded-full shadow-2xl border-2 border-amber-400/80 hover:border-amber-300 hover:scale-105 transition duration-300 cursor-pointer active:scale-95"
          title="স্মার্ট ইউপি এআই সহকারী - Gemini AI"
        >
          <div className="w-9 h-9 rounded-full bg-amber-400 text-emerald-950 flex items-center justify-center font-black shadow-md group-hover:rotate-12 transition shrink-0">
            <Sparkles className="w-5 h-5 fill-emerald-950 text-emerald-950 animate-pulse" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="font-extrabold text-xs text-amber-300 leading-tight">
              স্মার্ট ইউপি এআই সহকারী
            </p>
            <p className="text-[10px] text-emerald-200">
              Gemini 3.6 Flash Voice & AI
            </p>
          </div>
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
          </span>
        </button>
      </div>

      {/* Ai Citizen Assistant Modal */}
      <AiCitizenAssistant
        config={config}
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        onNavigateTab={handleNavigateTab}
      />
    </div>
  );
}
