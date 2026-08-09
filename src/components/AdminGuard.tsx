import React, { useState, useEffect } from 'react';
import { ShieldAlert, Lock, LogIn, Sparkles, ShieldCheck } from 'lucide-react';
import { AdminAuthModal } from './AdminAuthModal';
import { AdminPermissions } from '../types';

export interface AdminGuardProps {
  children: React.ReactNode;
  allowedRoles?: Array<'super_admin' | 'chairman' | 'secretary' | 'member' | 'developer'>;
  title?: string;
  description?: string;
  fallback?: React.ReactNode;
}

interface ActiveAdminSession {
  email: string;
  name: string;
  role: 'super_admin' | 'chairman' | 'secretary' | 'member' | 'developer';
  designation?: string;
  photoUrl?: string;
}

/**
 * AdminGuard Component
 * Restricts visibility of sensitive UI views (e.g. Admin Settings, Backups, Master Registries)
 * strictly to authenticated Admin / Developer accounts.
 */
export const AdminGuard: React.FC<AdminGuardProps> = ({
  children,
  allowedRoles,
  title = 'সুরক্ষিত এডমিন ও ডেভেলপার প্যানেল',
  description = 'এই মডিউলটি সিকিউরিটি ও প্রাইভেসি পলিসি অনুযায়ী কেবল অনুমোদিত চেয়ারম্যান, সচিব ও সিস্টেম এডমিনদের ব্যবহারের জন্য সংরক্ষিত।',
  fallback
}) => {
  const [activeAdmin, setActiveAdmin] = useState<ActiveAdminSession | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const checkSession = () => {
    const saved = localStorage.getItem('bup_active_admin_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setActiveAdmin(parsed);
      } catch (e) {
        setActiveAdmin(null);
      }
    } else {
      setActiveAdmin(null);
    }
  };

  useEffect(() => {
    checkSession();

    const handleAuthChange = (e: CustomEvent<ActiveAdminSession | null>) => {
      setActiveAdmin(e.detail || null);
    };

    window.addEventListener('adminAuthChanged' as any, handleAuthChange);
    return () => {
      window.removeEventListener('adminAuthChanged' as any, handleAuthChange);
    };
  }, []);

  const isAuthorized = React.useMemo(() => {
    if (!activeAdmin) return false;
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return allowedRoles.includes(activeAdmin.role);
  }, [activeAdmin, allowedRoles]);

  if (isAuthorized) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="max-w-2xl mx-auto my-12 p-6 md:p-8 bg-white rounded-2xl shadow-xl border-2 border-red-200 text-center space-y-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-amber-500 to-red-600" />

      <div className="w-16 h-16 mx-auto bg-red-100 rounded-2xl flex items-center justify-center text-red-700 shadow-inner border border-red-200 animate-pulse">
        <Lock className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-black text-slate-900 flex items-center justify-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-600" />
          <span>{title}</span>
        </h3>
        <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-2">
        <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>সুরক্ষা নিশ্চিতকরণ ব্যবস্থা (Security & Access Control):</span>
        </div>
        <ul className="text-[11px] text-slate-600 space-y-1 pl-6 list-disc">
          <li>সিস্টেম কনফিগারেশন, API Key এবং ডাটাবেস ব্যাকআপ কেবল এডমিন একাউন্টে অ্যাক্সেসযোগ্য।</li>
          <li>Google Firebase Authenticated সেশন বা এডমিন পাসকোড যাচাই বাধ্যতামূলক।</li>
          <li>সাধারণ নাগরিক বা পাবলিক ভিজিটরদের জন্য এই পেজটি সম্পূর্ণ দৃশ্যমান রাখা বন্ধ রাখা হয়েছে।</li>
        </ul>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="px-6 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-emerald-900/20 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogIn className="w-4 h-4 text-amber-300" />
          <span>এডমিন হিসেবে সাইন-ইন / লগইন করুন</span>
        </button>
      </div>

      <AdminAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAdminAuthenticated={(user) => {
          if (user) {
            setActiveAdmin(user as any);
            setIsAuthModalOpen(false);
          }
        }}
      />
    </div>
  );
};

/**
 * Higher-Order Component (HOC): withAdminGuard
 * Wraps any React Component with the AdminGuard visibility restrictor.
 * 
 * Usage:
 * export const ProtectedAdminSettings = withAdminGuard(AdminSettings, ['super_admin', 'chairman', 'secretary', 'developer']);
 */
export function withAdminGuard<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles?: Array<'super_admin' | 'chairman' | 'secretary' | 'member' | 'developer'>,
  guardOptions?: { title?: string; description?: string }
) {
  const WrappedComponent: React.FC<P> = (props) => {
    return (
      <AdminGuard
        allowedRoles={allowedRoles}
        title={guardOptions?.title}
        description={guardOptions?.description}
      >
        <Component {...props} />
      </AdminGuard>
    );
  };

  WrappedComponent.displayName = `withAdminGuard(${Component.displayName || Component.name || 'Component'})`;
  return WrappedComponent;
}
