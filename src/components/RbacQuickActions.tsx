import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Search, 
  PlusCircle, 
  Settings, 
  Code2, 
  Activity, 
  Scan, 
  Send, 
  CheckSquare, 
  XSquare, 
  Sparkles, 
  Key, 
  Users, 
  Building2, 
  ShieldAlert, 
  FileSpreadsheet, 
  Zap, 
  CreditCard, 
  LogIn, 
  ArrowRight,
  Database,
  Lock,
  User,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { UnionParishadConfig, AdminUserRecord } from '../types';
import { auth } from '../firebase';

interface RbacQuickActionsProps {
  config: UnionParishadConfig;
  onNavigateTab: (tab: string) => void;
  onOpenOcrModal?: () => void;
}

export type RbacRole = 'citizen' | 'udc' | 'secretary' | 'chairman' | 'super_admin' | 'developer';

export interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  targetTab?: string;
  actionType?: 'navigate' | 'modal' | 'custom';
  color: string;
  badge?: string;
  badgeColor?: string;
  permissionRequired?: string;
}

export const RbacQuickActions: React.FC<RbacQuickActionsProps> = ({ 
  config, 
  onNavigateTab,
  onOpenOcrModal
}) => {
  const [activeAdmin, setActiveAdmin] = useState<AdminUserRecord | null>(null);
  const [selectedRole, setSelectedRole] = useState<RbacRole>('citizen');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load session from localStorage or Firebase
  const checkSession = () => {
    const saved = localStorage.getItem('bup_active_admin_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setActiveAdmin(parsed);
        if (parsed.role) {
          if (parsed.role === 'member') {
            setSelectedRole('udc');
          } else {
            setSelectedRole(parsed.role as RbacRole);
          }
        }
      } catch (e) {
        setActiveAdmin(null);
      }
    } else if (auth.currentUser) {
      const email = auth.currentUser.email?.toLowerCase() || '';
      let role: RbacRole = 'secretary';
      if (email === 'baheratailunion@gmail.com') role = 'developer';
      
      const adminObj: AdminUserRecord = {
        email,
        name: auth.currentUser.displayName || 'অফিসিয়াল ইউজার',
        role: role === 'developer' ? 'developer' : 'secretary',
        designation: role === 'developer' ? 'সিস্টেম ডেভেলপার' : 'ইউনিয়ন কর্মকর্তা',
        addedAt: new Date().toISOString(),
        status: 'active'
      };
      setActiveAdmin(adminObj);
      setSelectedRole(role);
    } else {
      setActiveAdmin(null);
      setSelectedRole('citizen');
    }
  };

  useEffect(() => {
    checkSession();

    const handleAuthChange = (e: CustomEvent<AdminUserRecord | null>) => {
      if (e.detail) {
        setActiveAdmin(e.detail);
        if (e.detail.role) {
          setSelectedRole(e.detail.role as RbacRole);
        }
      } else {
        checkSession();
      }
    };

    window.addEventListener('adminAuthChanged' as any, handleAuthChange);
    return () => {
      window.removeEventListener('adminAuthChanged' as any, handleAuthChange);
    };
  }, []);

  // Defined Quick Actions per Role
  const roleActionsMap: Record<RbacRole, { title: string; subtitle: string; icon: React.ElementType; actions: QuickActionItem[] }> = {
    citizen: {
      title: 'সাধারণ নাগরিক সার্ভিস হাব (Citizen Portal)',
      subtitle: 'নাগরিকদের জন্য সরাসরি অনলাইন আবেদন, সনদপত্র ডাউনলোড ও যাচাইকরণ সুবিধা',
      icon: User,
      actions: [
        {
          id: 'cit_apply',
          title: 'অনলাইন নাগরিক আবেদন',
          description: '৪০+ ধরনের ডিজিটাল প্রত্যয়নপত্র ও সনদের জন্য সরাসরি ই-আবেদন করুন',
          icon: PlusCircle,
          targetTab: 'generator',
          color: 'from-emerald-600 to-teal-700',
          badge: 'সরাসরি আবেদন',
          badgeColor: 'bg-emerald-100 text-emerald-800'
        },
        {
          id: 'cit_verify',
          title: 'সনদপত্র কিউআর (QR) যাচাই',
          description: 'ইস্যুকৃত যেকোনো ডিজিটাল সনদের কিউআর কোড স্ক্যান করে সত্যতা যাচাই করুন',
          icon: Scan,
          targetTab: 'verify',
          color: 'from-blue-600 to-indigo-700',
          badge: 'ইনস্ট্যান্ট ভেরিফিকেশন',
          badgeColor: 'bg-blue-100 text-blue-800'
        },
        {
          id: 'cit_status',
          title: 'আবেদনের বর্তমান অবস্থা',
          description: 'আপনার জমাকৃত আবেদনের ট্র্যাকিং আইডি দিয়ে বর্তমান স্ট্যাটাস চেক করুন',
          icon: Clock,
          targetTab: 'logs',
          color: 'from-amber-600 to-orange-700',
          badge: 'লাইভ ট্র্যাকিং',
          badgeColor: 'bg-amber-100 text-amber-800'
        },
        {
          id: 'cit_members',
          title: 'পরিষদ সদস্য ও প্রতিনিধি তথ্য',
          description: 'ইউপি চেয়ারম্যান, মেম্বার ও সচিবের সরাসরি যোগাযোগের নম্বর ও পরিচিতি',
          icon: Users,
          targetTab: 'members',
          color: 'from-purple-600 to-violet-700',
          badge: '২৭ জন প্রতিনিধি',
          badgeColor: 'bg-purple-100 text-purple-800'
        }
      ]
    },
    udc: {
      title: 'ইউডিজি ডিজিটাল সেন্টার অপারেটর হাব (UDC Dashboard)',
      subtitle: 'আবেদন এন্ট্রি, NID OCR স্ক্যানিং, ফি সংগ্রহ ও নাগরিক আইডি কার্ড তৈরির টুলস',
      icon: Building2,
      actions: [
        {
          id: 'udc_new_app',
          title: 'নতুন আবেদন এন্ট্রি',
          description: 'ডিজিটাল সেন্টারে আগত নাগরিকদের জন্য দ্রুত আবেদন ও ডাটা ফরম তৈরি করুন',
          icon: PlusCircle,
          targetTab: 'generator',
          color: 'from-emerald-700 to-emerald-900',
          badge: 'আবেদন সাবমিশন',
          badgeColor: 'bg-emerald-100 text-emerald-800'
        },
        {
          id: 'udc_ocr_scan',
          title: 'NID / জন্ম সনদ OCR স্ক্যান',
          description: 'স্মার্ট NID কার্ডের ছবি আপলোড করে অটোমেটিক তথ্য ফরম পূরণ করুন',
          icon: Zap,
          actionType: 'modal',
          color: 'from-amber-600 to-amber-800',
          badge: 'এআই অটোমেশন',
          badgeColor: 'bg-amber-100 text-amber-800'
        },
        {
          id: 'udc_master_db',
          title: 'নাগরিক মাস্টার ডাটাবেজ',
          description: 'ইউনিয়ন পরিষদের স্থায়ী বাসিন্দাদের বায়োডাটা রেজিস্ট্রি ও তালিকা পরিদর্শন',
          icon: Database,
          targetTab: 'citizens',
          color: 'from-blue-700 to-indigo-900',
          badge: 'মাষ্টার রেজিস্ট্রি',
          badgeColor: 'bg-blue-100 text-blue-800'
        },
        {
          id: 'udc_fee_entry',
          title: 'আবেদন ফি পেমেন্ট ও ড্রাফট',
          description: 'নগদ/বিকাশ ফি গ্রহণ এবং ৭ দিনের এডিটেবল ড্রাফট রেকর্ড আপডেট',
          icon: CreditCard,
          targetTab: 'logs',
          color: 'from-purple-700 to-violet-900',
          badge: 'ফি রেজিস্টার',
          badgeColor: 'bg-purple-100 text-purple-800'
        }
      ]
    },
    secretary: {
      title: 'ইউপি প্রশাসনিক কর্মকর্তা / সচিব প্যানেল (Secretary RBAC)',
      subtitle: 'কাগজপত্র যাচাই, ফিল্ড ভেরিফিকেশন, আবেদন অনুমোদন সুপারিশ ও অনলাইন ট্র্যাকিং',
      icon: ShieldCheck,
      actions: [
        {
          id: 'sec_verify_list',
          title: 'অপেক্ষমাণ আবেদনপত্র যাচাই',
          description: 'ইউডিজি ও নাগরিকদের নতুন আবেদনের কাগজপত্র পরীক্ষা ও ভেরিফাই করুন',
          icon: CheckSquare,
          targetTab: 'logs',
          color: 'from-cyan-700 to-blue-900',
          badge: 'ভেরিফিকেশন পেন্ডিং',
          badgeColor: 'bg-cyan-100 text-cyan-800'
        },
        {
          id: 'sec_forward_chairman',
          title: 'চেয়ারম্যান অনুমোদন সুপারিশ',
          description: 'যাচাইকৃত সঠিক আবেদনসমূহ চেয়ারম্যান মহোদয়ের অনুমোদনের জন্য প্রেরণ করুন',
          icon: Send,
          targetTab: 'logs',
          color: 'from-emerald-700 to-teal-900',
          badge: 'সুপারিশ ফরোয়ার্ড',
          badgeColor: 'bg-emerald-100 text-emerald-800'
        },
        {
          id: 'sec_citizen_lookup',
          title: 'নাগরিক পরিচয়পত্র ও রেজিস্ট্রি',
          description: 'আবেদনকারীর NID, মোবাইল ও হোল্ডিং নম্বর যাচাই পূর্বক রেকর্ড নিশ্চিত করুন',
          icon: FileSpreadsheet,
          targetTab: 'citizens',
          color: 'from-indigo-700 to-purple-900',
          badge: 'নাগরিক রেকর্ড',
          badgeColor: 'bg-indigo-100 text-indigo-800'
        },
        {
          id: 'sec_admin_dash',
          title: 'ইউজার ও রিপোর্ট কন্ট্রোল',
          description: 'ইউপি কর্মকর্তা তালিকা, ওয়ার্ড মেম্বার ও দৈনিক আবেদন রিপোর্ট পরিদর্শন',
          icon: Settings,
          targetTab: 'admin_dashboard',
          color: 'from-slate-700 to-slate-900',
          badge: 'এডমিন ড্যাশবোর্ড',
          badgeColor: 'bg-slate-100 text-slate-800'
        }
      ]
    },
    chairman: {
      title: 'ইউপি চেয়ারম্যান অনুমোদন হাব (Chairman Authority Suite)',
      subtitle: 'চুড়ান্ত সনদপত্র অনুমোদন, ডিজিটাল স্বাক্ষর প্রয়োগ, বাতিলকরণ ও প্রশাসনিক সিদ্ধান্ত',
      icon: UserCheck,
      actions: [
        {
          id: 'chm_approve',
          title: 'সনদপত্র চুড়ান্ত অনুমোদন',
          description: 'সচিব কর্তৃক সুপারিশকৃত সকল ডিজিটাল আবেদনের চূড়ান্ত অনুমোদন প্রদান করুন',
          icon: CheckCircle2,
          targetTab: 'logs',
          color: 'from-emerald-800 to-emerald-950',
          badge: 'চুড়ান্ত অনুমোদন',
          badgeColor: 'bg-emerald-100 text-emerald-900'
        },
        {
          id: 'chm_seal_sign',
          title: 'ডিজিটাল সিল ও স্বাক্ষর সেটিংস',
          description: 'অনলাইন সনদে অফিশিয়াল অটো-স্বাক্ষর ও গোল সিল এনাবল/ডিজেবল করুন',
          icon: Key,
          targetTab: 'admin',
          color: 'from-amber-700 to-amber-900',
          badge: 'ডিজিটাল সিগনেচার',
          badgeColor: 'bg-amber-100 text-amber-900'
        },
        {
          id: 'chm_audit',
          title: 'অ্যাক্টিভিটি অডিট লগ',
          description: 'পরিষদের প্রশাসনিক সিদ্ধান্ত, তথ্য পরিবর্তন ও ইউজারের অনলাইন কার্যক্রম ট্রেইল',
          icon: Activity,
          targetTab: 'audit_trail',
          color: 'from-purple-800 to-purple-950',
          badge: 'সিকিউরিটি ট্রেইল',
          badgeColor: 'bg-purple-100 text-purple-900'
        },
        {
          id: 'chm_members_edit',
          title: 'পরিষদ সদস্য ও কর্মকর্তা টিউন',
          description: 'ওয়ার্ড মেম্বার, সংরক্ষিত সদস্য ও গ্রাম পুলিশদের তথ্য আপডেট করুন',
          icon: Users,
          targetTab: 'members',
          color: 'from-blue-800 to-indigo-950',
          badge: 'জনপ্রতিনিধি ম্যানেজমেন্ট',
          badgeColor: 'bg-blue-100 text-blue-900'
        }
      ]
    },
    super_admin: {
      title: 'সুপার এডমিন মাস্টার কন্ট্রোল (Super Admin Suite)',
      subtitle: 'সম্পূর্ণ সিস্টেম কনফিগারেশন, ইউজার রোল ব্যবস্থাপনা ও সিকিউরিটি ওভারসাইট',
      icon: ShieldAlert,
      actions: [
        {
          id: 'sa_rbac',
          title: 'ইউজার রোল ও পারমিশন (RBAC)',
          description: 'চেয়ারম্যান, সচিব, ইউডিজি ও মেম্বারদের নির্দিষ্ট অ্যাকসেস পারমিশন ম্যাট্রিক্স সেটআপ',
          icon: ShieldCheck,
          targetTab: 'admin_dashboard',
          color: 'from-emerald-900 to-slate-950',
          badge: 'RBAC সিকিউরিটি',
          badgeColor: 'bg-emerald-100 text-emerald-900'
        },
        {
          id: 'sa_master_config',
          title: 'ইউপি মাস্টার কনফিগারেশন',
          description: 'Google Sheets ID, Drive Target Folder, MFS পেমেন্ট নম্বর ও সিল ফরম্যাট টিউন',
          icon: Settings,
          targetTab: 'admin',
          color: 'from-amber-800 to-orange-950',
          badge: 'মাস্টার সেটআপ',
          badgeColor: 'bg-amber-100 text-amber-900'
        },
        {
          id: 'sa_audit',
          title: 'ক্লাউড অডিট ও লক সেশন',
          description: 'ফায়ারবেস রিয়েল-টাইম অডিট ট্রেইল এবং সিস্টেম লগের এনক্রিপ্টেড রেকর্ড',
          icon: Activity,
          targetTab: 'audit_trail',
          color: 'from-red-900 to-slate-950',
          badge: 'রিয়েল-টাইম ট্রেইল',
          badgeColor: 'bg-red-100 text-red-900'
        },
        {
          id: 'sa_backups',
          title: 'ডেভেলপার ও ব্যাকআপ রিস্টোর',
          description: 'Google Apps Script কোড জেনারেটর, ডাটাবেজ ড্রাইভ স্ন্যাপশট ও MCP সিঙ্ক',
          icon: Code2,
          targetTab: 'developer',
          color: 'from-blue-900 to-slate-950',
          badge: 'গুগল ড্রাইভ সিঙ্ক',
          badgeColor: 'bg-blue-100 text-blue-900'
        }
      ]
    },
    developer: {
      title: 'ডেভেলপার ও সিস্টেম আর্কিটেক্ট কন্ট্রোল (Developer Console)',
      subtitle: 'গুগল অ্যাপস স্ক্রিপ্ট অটোমেশন, জেমিনাই এআই মডেল, ব্যাকআপ ইঞ্জিনিয়ারিং ও এপিআই সিঙ্ক',
      icon: Code2,
      actions: [
        {
          id: 'dev_mcp',
          title: 'GAS Studio & Apps Script Generator',
          description: 'Code.gs, Gemini.gs ও Index.html স্ক্রিপ্ট সিঙ্ক্রোনাইজেশন ও ওয়েব অ্যাপ ডিপ্লয়মেন্ট',
          icon: Code2,
          targetTab: 'developer',
          color: 'from-purple-900 to-slate-950',
          badge: 'GAS Auto-Sync',
          badgeColor: 'bg-purple-100 text-purple-900'
        },
        {
          id: 'dev_audit',
          title: 'সিকিউরিটি এনক্রিপ্টেড অডিট ল্যাব',
          description: 'SHA-256 চেকমাস্ক ও আইপি লগসহ যেকোনো প্রশাসনিক অ্যাকশনের ক্লাউড ডাটাবেজ ইন্সেপশন',
          icon: Activity,
          targetTab: 'audit_trail',
          color: 'from-slate-900 to-black',
          badge: 'Full Oversight',
          badgeColor: 'bg-slate-100 text-slate-900'
        },
        {
          id: 'dev_config',
          title: 'এপিআই ও ক্লাউড স্টোরেজ কি (R2/Drive)',
          description: 'Cloudflare R2, Gemini 3.6 API key, Webhook Secret এবং Google Drive ইন্টিগ্রেশন',
          icon: Settings,
          targetTab: 'admin',
          color: 'from-indigo-900 to-slate-950',
          badge: 'APIs & Drive',
          badgeColor: 'bg-indigo-100 text-indigo-900'
        },
        {
          id: 'dev_rbac_manage',
          title: 'সিস্টেম অ্যাকাউন্ট ও RBAC মাস্টার',
          description: 'নতুন প্রশাসনিক এডমিন সৃষ্টি, ইউজার অ্যাকাউন্ট সাসপেনশন ও পাসওয়ার্ড এনফোর্সমেন্ট',
          icon: Users,
          targetTab: 'admin_dashboard',
          color: 'from-emerald-900 to-black',
          badge: 'Account Management',
          badgeColor: 'bg-emerald-100 text-emerald-900'
        }
      ]
    }
  };

  const currentRoleConfig = roleActionsMap[selectedRole] || roleActionsMap.citizen;

  const handleActionClick = (item: QuickActionItem) => {
    if (item.actionType === 'modal' && item.id.includes('ocr')) {
      if (onOpenOcrModal) {
        onOpenOcrModal();
      } else {
        onNavigateTab('generator');
      }
      return;
    }

    if (item.targetTab) {
      onNavigateTab(item.targetTab);
      setToastMessage(`'${item.title}' মোডে নেভিগেট করা হচ্ছে...`);
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in my-4 print:hidden">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-amber-300 px-4 py-2.5 rounded-2xl shadow-2xl border border-amber-400/50 flex items-center gap-2 text-xs font-bold animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Widget */}
      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-emerald-900/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-amber-400/20 text-amber-300 rounded-2xl border border-amber-400/30">
                  <ShieldCheck className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-amber-300 tracking-tight flex items-center gap-2">
                    <span>ডাইনামিক RBAC কুইক অ্যাকশন প্যানেল</span>
                    <span className="px-2.5 py-0.5 bg-emerald-800 text-emerald-200 rounded-md text-[10px] font-extrabold border border-emerald-700 uppercase tracking-wider">
                      Role-Based Control
                    </span>
                  </h3>
                  <p className="text-xs text-emerald-200">
                    লগইনকৃত ইউজারের রোল (Citizen, UDC, Secretary, Chairman, Developer) অনুযায়ী ডায়নামিক কুইক অ্যাকশন টুলস
                  </p>
                </div>
              </div>
            </div>

            {/* Active User Status Badge */}
            <div className="flex items-center gap-2 bg-slate-900/90 px-3.5 py-2 rounded-2xl border border-slate-800 text-xs shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">বর্তমান একাউন্ট সেশন:</span>
                <span className="font-extrabold text-white">
                  {activeAdmin ? `${activeAdmin.name} (${activeAdmin.role})` : 'সাধারণ নাগরিক (Citizen Guest)'}
                </span>
              </div>
            </div>
          </div>

          {/* Role Switcher Filter Tabs */}
          <div className="pt-2 border-t border-emerald-900/80">
            <span className="text-[11px] font-bold text-amber-200/80 block mb-2">
              রোল অনুযায়ী কুইক অ্যাকশন উইজেট ফিল্টার টেস্ট করুন:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'citizen', label: '👤 নাগরিক (Citizen)', roleName: 'citizen' },
                { id: 'udc', label: '💻 ইউডিজি অপারেটর (UDC)', roleName: 'udc' },
                { id: 'secretary', label: '📋 ইউপি সচিব (Secretary)', roleName: 'secretary' },
                { id: 'chairman', label: '✒️ চেয়ারম্যান (Chairman)', roleName: 'chairman' },
                { id: 'super_admin', label: '🔒 সুপার এডমিন (Super Admin)', roleName: 'super_admin' },
                { id: 'developer', label: '🛠️ ডেভেলপার (Developer)', roleName: 'developer' }
              ].map(r => {
                const isActive = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRole(r.id as RbacRole)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-amber-400 text-emerald-950 shadow-lg scale-105'
                        : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    <span>{r.label}</span>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-950" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Role Context & Actions Grid */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200">
              <currentRoleConfig.icon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-base tracking-tight">
                {currentRoleConfig.title}
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                {currentRoleConfig.subtitle}
              </p>
            </div>
          </div>

          <span className="hidden sm:inline-flex px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-extrabold uppercase tracking-wider border border-slate-200">
            {selectedRole} Role Actions
          </span>
        </div>

        {/* Dynamic Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentRoleConfig.actions.map((act) => (
            <div
              key={act.id}
              onClick={() => handleActionClick(act)}
              className="group bg-slate-50 hover:bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500/60 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${act.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition duration-300`}>
                    <act.icon className="w-5 h-5" />
                  </div>

                  {act.badge && (
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tight ${act.badgeColor}`}>
                      {act.badge}
                    </span>
                  )}
                </div>

                <div>
                  <h5 className="font-black text-slate-900 text-sm group-hover:text-emerald-800 transition">
                    {act.title}
                  </h5>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                    {act.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-emerald-800 group-hover:translate-x-1 transition duration-200">
                <span>চালু করুন</span>
                <ArrowRight className="w-4 h-4 text-emerald-700" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
