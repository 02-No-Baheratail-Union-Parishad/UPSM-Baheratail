import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomePanel } from './components/HomePanel';
import { CertificateForm } from './components/CertificateForm';
import { CertificateView } from './components/CertificateView';
import { VerificationPortal } from './components/VerificationPortal';
import { CitizenLogs } from './components/CitizenLogs';
import { AdminSettings } from './components/AdminSettings';
import { CitizenMasterRegister } from './components/CitizenMasterRegister';
import { DeveloperProfile } from './components/DeveloperProfile';
import { DevelopmentHeatmap } from './components/DevelopmentHeatmap';
import { PendingApprovals } from './components/PendingApprovals';
import { CouncilMembers } from './components/CouncilMembers';
import { fetchConfigFromFirebase } from './firebase';
import { CertificateRecord, UnionParishadConfig, CitizenAccountRecord } from './types';
import { DEFAULT_UP_CONFIG } from './data/villages';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [config, setConfig] = useState<UnionParishadConfig>(DEFAULT_UP_CONFIG);
  const [generatedCert, setGeneratedCert] = useState<CertificateRecord | null>(null);

  // Fetch initial config from server & Firebase Firestore
  useEffect(() => {
    fetch('/api/admin/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.config) {
          setConfig(data.config);
        }
      })
      .catch((err) => console.error('Error loading config:', err));

    fetchConfigFromFirebase().then(fbConfig => {
      if (fbConfig) {
        setConfig(fbConfig);
      }
    }).catch(err => console.warn('Firestore config load warning:', err));
  }, []);

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
    setActiveTab('create');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-emerald-200 selection:text-emerald-900">
      {/* Navigation Header */}
      <Navbar activeTab={activeTab} setActiveTab={handleNavigateTab} config={config} />

      {/* Main Body Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 my-2">
        {activeTab === 'home' && (
          <HomePanel config={config} onNavigateTab={handleNavigateTab} />
        )}

        {activeTab === 'pending' && (
          <PendingApprovals config={config} />
        )}

        {activeTab === 'heatmap' && (
          <DevelopmentHeatmap config={config} />
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
                />
              </div>
            ) : (
              <CertificateForm config={config} onCertificateGenerated={handleCertificateGenerated} />
            )}
          </div>
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

        {activeTab === 'admin' && (
          <AdminSettings config={config} onUpdateConfig={setConfig} />
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
  );
}
