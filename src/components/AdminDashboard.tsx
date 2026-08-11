import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  LogIn, 
  LogOut, 
  User, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Users, 
  Building2, 
  Lock, 
  RefreshCw,
  Search,
  Filter,
  Download,
  PlusCircle,
  FileText,
  Clock,
  Activity,
  Trash2,
  Shield,
  Layers,
  UserCheck,
  Check,
  Calendar,
  X,
  Database,
  FileSpreadsheet,
  Sliders,
  Edit3,
  Save,
  RotateCcw,
  CheckSquare,
  Square,
  UserCog,
  Zap
} from 'lucide-react';
import { UnionParishadConfig, AuditLogRecord, AdminUserRecord, CertificateRecord, AdminPermissions } from '../types';
import { GoogleSheetsSyncModal } from './GoogleSheetsSyncModal';
import { RbacQuickActions } from './RbacQuickActions';
import { 
  auth, 
  signInWithGooglePopup, 
  logoutUserFromFirebase, 
  fetchAdminUsersFromFirebase, 
  saveAdminUserToFirebase, 
  deleteAdminUserFromFirebase,
  fetchAuditLogsFromFirebase,
  addAuditLogToFirebase,
  formatFirebaseAuthError
} from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

export const DEFAULT_ROLE_PERMISSIONS: Record<string, AdminPermissions> = {
  super_admin: {
    canApproveCertificates: true,
    canIssueCertificates: true,
    canManageAdmins: true,
    canEditConfig: true,
    canExportData: true,
    canDeleteLogs: true,
  },
  chairman: {
    canApproveCertificates: true,
    canIssueCertificates: true,
    canManageAdmins: true,
    canEditConfig: true,
    canExportData: true,
    canDeleteLogs: false,
  },
  secretary: {
    canApproveCertificates: false,
    canIssueCertificates: true,
    canManageAdmins: false,
    canEditConfig: false,
    canExportData: true,
    canDeleteLogs: false,
  },
  member: {
    canApproveCertificates: false,
    canIssueCertificates: true,
    canManageAdmins: false,
    canEditConfig: false,
    canExportData: false,
    canDeleteLogs: false,
  },
  developer: {
    canApproveCertificates: true,
    canIssueCertificates: true,
    canManageAdmins: true,
    canEditConfig: true,
    canExportData: true,
    canDeleteLogs: true,
  },
};

export function getPermissionsForAdmin(adm: AdminUserRecord): AdminPermissions {
  if (adm.permissions) {
    return {
      canApproveCertificates: adm.permissions.canApproveCertificates ?? true,
      canIssueCertificates: adm.permissions.canIssueCertificates ?? true,
      canManageAdmins: adm.permissions.canManageAdmins ?? (adm.role === 'super_admin' || adm.role === 'developer'),
      canEditConfig: adm.permissions.canEditConfig ?? (adm.role === 'super_admin' || adm.role === 'chairman' || adm.role === 'developer'),
      canExportData: adm.permissions.canExportData ?? true,
      canDeleteLogs: adm.permissions.canDeleteLogs ?? (adm.role === 'super_admin' || adm.role === 'developer'),
    };
  }
  return DEFAULT_ROLE_PERMISSIONS[adm.role] || DEFAULT_ROLE_PERMISSIONS.member;
}

interface AdminDashboardProps {
  config: UnionParishadConfig;
  onNavigateTab?: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ config, onNavigateTab }) => {
  // Auth state
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [adminRecord, setAdminRecord] = useState<AdminUserRecord | null>(null);
  const [adminsList, setAdminsList] = useState<AdminUserRecord[]>([]);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Active subtab in dashboard
  const [activeView, setActiveView] = useState<'rbac' | 'admins' | 'roles' | 'logs'>('rbac');

  // Role & Permission Management State
  const [editingAdminEmail, setEditingAdminEmail] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<AdminUserRecord['role']>('member');
  const [editingPermissions, setEditingPermissions] = useState<AdminPermissions>({
    canApproveCertificates: false,
    canIssueCertificates: true,
    canManageAdmins: false,
    canEditConfig: false,
    canExportData: false,
    canDeleteLogs: false
  });
  const [roleSearchQuery, setRoleSearchQuery] = useState<string>('');
  const [roleWardFilter, setRoleWardFilter] = useState<string>('ALL');
  const [roleRoleFilter, setRoleRoleFilter] = useState<string>('ALL');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Multi-admin form state
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesignation, setNewDesignation] = useState('ইউপি সদস্য / কর্মকর্তা');
  const [newWard, setNewWard] = useState('সকল ওয়ার্ড');
  const [newRole, setNewRole] = useState<'super_admin' | 'chairman' | 'secretary' | 'member' | 'developer'>('member');
  const [isSavingAdmin, setIsSavingAdmin] = useState(false);

  // Audit Log state
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogRecord[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);
  const [selectedActionFilter, setSelectedActionFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Google Sheets Sync Modal State
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState<boolean>(false);
  const [dashboardLogs, setDashboardLogs] = useState<CertificateRecord[]>([]);

  useEffect(() => {
    if (isSheetsModalOpen) {
      fetch('/api/admin/logs')
        .then(res => res.json())
        .then(data => {
          if (data.logs) setDashboardLogs(data.logs);
        })
        .catch(err => console.warn('Error loading logs for dashboard Sheets sync:', err));
    }
  }, [isSheetsModalOpen]);

  // Manual Log Entry Modal State
  const [isAddLogOpen, setIsAddLogOpen] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualDetails, setManualDetails] = useState('');
  const [manualActionType, setManualActionType] = useState<AuditLogRecord['action']>('OTHER');
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);

  // Load Admin Directory and Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setCurrentUser(fbUser);
      setIsLoadingAuth(true);
      setAuthError(null);

      try {
        const admins = await fetchAdminUsersFromFirebase();
        setAdminsList(admins);

        if (fbUser) {
          const matched = admins.find(a => a.email.toLowerCase() === (fbUser.email || '').toLowerCase());
          if (matched) {
            setAdminRecord(matched);
          } else {
            const tempRecord: AdminUserRecord = {
              email: fbUser.email || '',
              name: fbUser.displayName || 'অনুমোদিত এডমিন',
              role: 'member',
              designation: 'ইউপি কর্মকর্তা / অপারেটর',
              photoUrl: fbUser.photoURL || undefined,
              addedAt: new Date().toISOString(),
              status: 'active'
            };
            setAdminRecord(tempRecord);
          }
        } else {
          setAdminRecord(null);
        }
      } catch (err) {
        console.warn('Error fetching admin directory:', err);
      } finally {
        setIsLoadingAuth(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch Audit Logs from Firebase
  const loadLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const logs = await fetchAuditLogsFromFirebase();
      setAuditLogs(logs);
      setFilteredLogs(logs);
    } catch (err) {
      console.warn('Error loading audit logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // Apply filters on Audit Logs
  useEffect(() => {
    let result = [...auditLogs];

    if (selectedActionFilter !== 'ALL') {
      result = result.filter(log => log.action === selectedActionFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(log => 
        log.actionTitle.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.performedByEmail.toLowerCase().includes(q) ||
        log.performedByName.toLowerCase().includes(q) ||
        (log.checksum && log.checksum.toLowerCase().includes(q))
      );
    }

    setFilteredLogs(result);
  }, [selectedActionFilter, searchQuery, auditLogs]);

  // Handle Google OAuth Login
  const handleGoogleSignIn = async () => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const user = await signInWithGooglePopup();
      const admins = await fetchAdminUsersFromFirebase();
      setAdminsList(admins);

      const matched = admins.find(a => a.email.toLowerCase() === (user.email || '').toLowerCase());
      if (matched) {
        setAdminRecord(matched);
      }

      // Add audit log for login
      await addAuditLogToFirebase({
        action: 'ADMIN_LOGIN',
        actionTitle: 'গুগল ফায়ারবেস অথেন্টিকেশন সাইন ইন',
        details: `এডমিন ইউজার ${user.displayName || user.email} সিস্টেমে সফলভাবে সাইন ইন করিয়াছেন।`,
        performedByEmail: user.email || 'unknown',
        performedByName: user.displayName || 'এডমিন',
        performedByRole: matched ? matched.role : 'member'
      });
      loadLogs();
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.message?.includes('popup-closed-by-user')) {
        setAuthError('সাইন-ইন পপআপ উইন্ডোটি বন্ধ করা হয়েছে।');
      } else {
        console.error('Sign in error:', err);
        setAuthError(formatFirebaseAuthError(err));
      }
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleSignOut = async () => {
    if (currentUser) {
      try {
        await addAuditLogToFirebase({
          action: 'ADMIN_LOGIN',
          actionTitle: 'এডমিন সিস্টেম লগআউট',
          details: `এডমিন ইউজার ${currentUser.email} সেশন হইতে সফলভাবে লগআউট করিয়াছেন।`,
          performedByEmail: currentUser.email || '',
          performedByName: currentUser.displayName || 'এডমিন',
          performedByRole: adminRecord?.role || 'member'
        });
      } catch (e) {
        // ignore
      }
    }
    await logoutUserFromFirebase();
    setCurrentUser(null);
    setAdminRecord(null);
    loadLogs();
  };

  // Add Admin User
  const handleAddAdmin = async () => {
    if (!newEmail.trim() || !newEmail.includes('@')) {
      alert('একটি সঠিক গুগল ইমেইল প্রদান করুন।');
      return;
    }
    if (!newName.trim()) {
      alert('এডমিন ইউজারের পূর্ণ নাম লিখুন।');
      return;
    }

    setIsSavingAdmin(true);
    try {
      const newRecord: AdminUserRecord = {
        email: newEmail.trim().toLowerCase(),
        name: newName.trim(),
        designation: newDesignation.trim(),
        wardNo: newWard,
        role: newRole,
        permissions: DEFAULT_ROLE_PERMISSIONS[newRole] || DEFAULT_ROLE_PERMISSIONS.member,
        addedAt: new Date().toISOString(),
        status: 'active'
      };

      await saveAdminUserToFirebase(newRecord);

      // Audit Log
      await addAuditLogToFirebase({
        action: 'ADMIN_ADDED',
        actionTitle: 'নতুন ইউপি এডমিন ইউজার অনুমোদিত',
        details: `নতুন এডমিন ইউজার ${newName} (${newEmail}) [পদবী: ${newDesignation}, রোল: ${newRole}] ফায়ারবেস অ্যাকসেস ডিরেক্টরিতে যোগ করা হইয়াছে।`,
        performedByEmail: currentUser?.email || 'system_admin',
        performedByName: currentUser?.displayName || 'সুপার এডমিন',
        performedByRole: adminRecord?.role || 'super_admin'
      });

      const updated = await fetchAdminUsersFromFirebase();
      setAdminsList(updated);
      setNewEmail('');
      setNewName('');
      alert('নতুন এডমিন ইউজার ফায়ারবেস ডিরেক্টরিতে সফলভাবে যুক্ত করা হইয়াছে!');
      loadLogs();
    } catch (err: any) {
      alert('এডমিন যোগ করতে ব্যর্থ: ' + err.message);
    } finally {
      setIsSavingAdmin(false);
    }
  };

  // Delete Admin User
  const handleDeleteAdmin = async (email: string, name: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে '${name} (${email})' এর এডমিন অ্যাকসেস বাতিল করতে চান?`)) return;

    try {
      await deleteAdminUserFromFirebase(email);

      await addAuditLogToFirebase({
        action: 'ADMIN_REMOVED',
        actionTitle: 'এডমিন অ্যাকসেস বাতিলকরণ',
        details: `এডমিন ইউজার ${name} (${email}) এর ফায়ারবেস অথেন্টিকেশন অ্যাকসেস বাতিল করা হইয়াছে।`,
        performedByEmail: currentUser?.email || 'system_admin',
        performedByName: currentUser?.displayName || 'সুপার এডমিন',
        performedByRole: adminRecord?.role || 'super_admin'
      });

      const updated = await fetchAdminUsersFromFirebase();
      setAdminsList(updated);
      loadLogs();
    } catch (err: any) {
      alert('এডমিন মুছে ফেলতে ব্যর্থ: ' + err.message);
    }
  };

  // Update Role & Permissions for a user
  const handleSavePermissionsForUser = async (targetAdmin: AdminUserRecord) => {
    setIsSavingAdmin(true);
    try {
      const updatedAdmin: AdminUserRecord = {
        ...targetAdmin,
        role: editingRole,
        permissions: editingPermissions
      };

      await saveAdminUserToFirebase(updatedAdmin);

      await addAuditLogToFirebase({
        action: 'ADMIN_ROLE_UPDATED',
        actionTitle: 'ইউপি কর্মকর্তা/সদস্যের রোল ও পারমিশন আপডেট',
        details: `${targetAdmin.name} (${targetAdmin.email})-এর পারমিশন রোল পরিমার্জন করা হইয়াছে [নতুন রোল: ${editingRole}]।`,
        performedByEmail: currentUser?.email || 'super_admin',
        performedByName: currentUser?.displayName || 'সুপার এডমিন',
        performedByRole: adminRecord?.role || 'super_admin'
      });

      const updatedList = await fetchAdminUsersFromFirebase();
      setAdminsList(updatedList);
      setEditingAdminEmail(null);
      setSuccessToast(`${targetAdmin.name}-এর পারমিশন রোল ফায়ারবেস ক্লাউডে সফলভাবে সংরক্ষিত হয়েছে!`);
      setTimeout(() => setSuccessToast(null), 4000);
      loadLogs();
    } catch (err: any) {
      alert('পারমিশন আপডেট ব্যর্থ হয়েছে: ' + err.message);
    } finally {
      setIsSavingAdmin(false);
    }
  };

  // Add Manual Audit Log
  const handleAddManualLog = async () => {
    if (!manualTitle.trim() || !manualDetails.trim()) {
      alert('অনুগ্রহ করে অডিট লগের শিরোনাম ও বিস্তারিত লিখুন।');
      return;
    }
    setIsSubmittingLog(true);
    try {
      await addAuditLogToFirebase({
        action: manualActionType,
        actionTitle: manualTitle.trim(),
        details: manualDetails.trim(),
        performedByEmail: currentUser?.email || 'manual_entry@union.gov.bd',
        performedByName: currentUser?.displayName || 'অফিসিয়াল এডমিন নোট',
        performedByRole: adminRecord?.role || 'secretary'
      });

      setManualTitle('');
      setManualDetails('');
      setIsAddLogOpen(false);
      loadLogs();
      alert('সিস্টেম সিকিউরিটি অডিট লগ সফলভাবে লিপিবদ্ধ করা হইয়াছে!');
    } catch (err: any) {
      alert('লগ যুক্ত করতে ব্যর্থ: ' + err.message);
    } finally {
      setIsSubmittingLog(false);
    }
  };

  // Export Audit Logs to CSV
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      alert('রপ্তানি করার মতো কোনো লগ পাওয়া যায়নি।');
      return;
    }

    const headers = ['ID', 'Action', 'Title', 'Details', 'Performed By Email', 'Performed By Name', 'Role', 'Timestamp', 'Checksum'];
    const rows = filteredLogs.map(log => [
      log.id,
      log.action,
      `"${log.actionTitle.replace(/"/g, '""')}"`,
      `"${log.details.replace(/"/g, '""')}"`,
      log.performedByEmail,
      `"${log.performedByName.replace(/"/g, '""')}"`,
      log.performedByRole,
      log.timestamp,
      log.checksum || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Union_Parishad_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white p-6 md:p-8 rounded-3xl shadow-2xl border border-emerald-800/80 relative overflow-hidden">
        {/* Background Decorative Pattern */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-full text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>Google Firebase Auth & OAuth 2.0 Security Dashboard</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              ইউনিয়ন পরিষদ এডমিন ড্যাশবোর্ড ও সিকিউরিটি লগ
            </h1>

            <p className="text-xs md:text-sm text-emerald-100 max-w-2xl leading-relaxed">
              চেয়ারম্যান, সচিব, ইউপি সদস্য ও আইটি সিস্টেম এডমিনগণের জন্য কেন্দ্রীয় গুগল ফায়ারবেস অথেন্টিকেশন, একাধিক এডমিন রোল কন্ট্রোল এবং রিয়েল-টাইম সিস্টেম পরিবর্তন অডিট ট্রেইল।
            </p>
          </div>

          {/* User Auth Card Widget */}
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 shrink-0 min-w-[280px] space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-300" />
                <span>বর্তমান সেশন স্ট্যাটাস</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-200 border border-emerald-500/50">
                {currentUser ? 'লগইনকৃত (Active)' : 'গেস্ট / অফলাইন'}
              </span>
            </div>

            {currentUser ? (
              <div className="flex items-center gap-3">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="Profile" className="w-11 h-11 rounded-xl border-2 border-amber-400 object-cover shadow-md" />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-amber-400 text-emerald-950 font-black flex items-center justify-center text-lg shadow-md">
                    {currentUser.displayName ? currentUser.displayName[0] : 'A'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold text-xs text-white truncate">{currentUser.displayName || 'এডমিন ইউজার'}</p>
                  <p className="text-[11px] text-emerald-200 truncate">{currentUser.email}</p>
                  <p className="text-[10px] text-amber-300 font-bold mt-0.5">পদবী: {adminRecord?.designation || 'অনুমোদিত এডমিন'}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-emerald-100">
                এডমিন ফিচার ও অডিট রাইট অ্যাকসেসের জন্য গুগলের মাধ্যমে সাইন-ইন করুন।
              </p>
            )}

            <div className="pt-1">
              {currentUser ? (
                <button
                  onClick={handleSignOut}
                  className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>সাইন আউট (Sign Out)</span>
                </button>
              ) : (
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoadingAuth}
                  className="w-full py-2.5 px-3 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4 text-emerald-950" />
                  <span>Google দিয়ে সাইন ইন করুন</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {authError && (
        <div className="bg-rose-50 border border-rose-300 text-rose-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      {/* Google Sheets Workspace Integration Quick Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-5 rounded-2xl shadow-md border border-emerald-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-800/80 rounded-xl text-amber-300 border border-emerald-600/50">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-white">Google Sheets প্রশাসনিক রিপোর্ট ও লাইভ অটো-সিঙ্ক</h3>
              <span className="px-2 py-0.5 bg-amber-400 text-emerald-950 font-black text-[10px] rounded-full uppercase">Google Sheets API v4</span>
            </div>
            <p className="text-xs text-emerald-100 mt-0.5">
              সকল নাগরিক প্রত্যয়নপত্র রেজিস্টার গুগলের অফিশিয়াল শিটে ১-ক্লিকে সিঙ্ক করে প্রশাসনিক প্রতিবেদন প্রস্তুত করুন।
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsSheetsModalOpen(true)}
          className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-black rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-950" />
          <span>Google Sheets-এ সিঙ্ক করুন</span>
        </button>
      </div>

      {/* 2. Overview Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl font-black">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">অনুমোদিত এডমিন সংখ্যা</p>
            <h3 className="text-2xl font-black text-slate-900">{adminsList.length} জন</h3>
            <p className="text-[10px] text-emerald-700 font-bold">চেয়ারম্যান, সচিব ও সদস্যগণ</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl font-black">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">মোট সিস্টেমে অডিট রেকর্ড</p>
            <h3 className="text-2xl font-black text-slate-900">{auditLogs.length} টি</h3>
            <p className="text-[10px] text-amber-700 font-bold">ফায়ারবেস অডিট ট্রেইল</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-teal-100 text-teal-800 rounded-2xl font-black">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">সিকিউরিটি এনক্রিপশন</p>
            <h3 className="text-lg font-black text-slate-900">OAuth 2.0 / SHA256</h3>
            <p className="text-[10px] text-teal-700 font-bold">SHA256 Checksum Verified</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-800 rounded-2xl font-black">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">ফায়ারবেস সিঙ্ক স্ট্যাটাস</p>
            <h3 className="text-lg font-black text-emerald-800">Firestore Cloud</h3>
            <p className="text-[10px] text-slate-500">রিয়েল-টাইম অটো ডাটা সিঙ্ক</p>
          </div>
        </div>
      </div>

      {/* 3. Navigation Controls / View Switcher */}
      <div className="bg-slate-200/80 p-1.5 rounded-2xl flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveView('rbac')}
          className={`flex-1 min-w-[200px] py-3 px-4 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeView === 'rbac'
              ? 'bg-emerald-900 text-amber-300 shadow-md ring-2 ring-amber-400/50'
              : 'text-slate-700 hover:bg-slate-300/80'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-300" />
          <span>১. ডায়নামিক RBAC কুইক অ্যাকশন</span>
        </button>

        <button
          onClick={() => setActiveView('admins')}
          className={`flex-1 min-w-[180px] py-3 px-4 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeView === 'admins'
              ? 'bg-emerald-900 text-amber-300 shadow-md ring-2 ring-amber-400/50'
              : 'text-slate-700 hover:bg-slate-300/80'
          }`}
        >
          <Users className="w-4 h-4 text-amber-300" />
          <span>২. ইউপি এডমিন ডিরেক্টরি ({adminsList.length})</span>
        </button>

        <button
          onClick={() => setActiveView('roles')}
          className={`flex-1 min-w-[200px] py-3 px-4 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeView === 'roles'
              ? 'bg-emerald-900 text-amber-300 shadow-md ring-2 ring-amber-400/50'
              : 'text-slate-700 hover:bg-slate-300/80'
          }`}
        >
          <UserCog className="w-4 h-4 text-amber-300" />
          <span>৩. পারমিশন ম্যাট্রিক্স রোলস</span>
        </button>

        <button
          onClick={() => setActiveView('logs')}
          className={`flex-1 min-w-[180px] py-3 px-4 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeView === 'logs'
              ? 'bg-emerald-900 text-amber-300 shadow-md ring-2 ring-amber-400/50'
              : 'text-slate-700 hover:bg-slate-300/80'
          }`}
        >
          <Activity className="w-4 h-4 text-amber-300" />
          <span>৪. সিকিউর অডিট লগ ({filteredLogs.length})</span>
        </button>
      </div>

      {/* VIEW 0: DYNAMIC RBAC QUICK ACTIONS */}
      {activeView === 'rbac' && (
        <RbacQuickActions config={config} onNavigateTab={onNavigateTab} />
      )}

      {/* VIEW 1: MULTI-ADMIN USER MANAGEMENT */}
      {activeView === 'admins' && (
        <div className="space-y-6">
          {/* Add Admin Form */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-800" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  নতুন পরিষদ কর্মকর্তা / এডমিন যুক্ত করুন (Add Union Council Admin)
                </h3>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 bg-amber-100 text-emerald-950 border border-amber-300 rounded-lg">
                Firebase Firestore Multi-User
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  গুগল ইমেইল এড্রেস *
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="admin@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  এডমিনের নাম *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="যেমন: মোঃ মতিউর রহমান"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  অফিসিয়াল পদবী
                </label>
                <input
                  type="text"
                  value={newDesignation}
                  onChange={(e) => setNewDesignation(e.target.value)}
                  placeholder="যেমন: ইউপি সদস্য / সচিব"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ওয়ার্ড নম্বর
                </label>
                <select
                  value={newWard}
                  onChange={(e) => setNewWard(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:border-emerald-600 focus:outline-none"
                >
                  <option value="সকল ওয়ার্ড">সকল ওয়ার্ড (সার্বিক)</option>
                  <option value="ওয়ার্ড ১">ওয়ার্ড ১</option>
                  <option value="ওয়ার্ড ২">ওয়ার্ড ২</option>
                  <option value="ওয়ার্ড ৩">ওয়ার্ড ৩</option>
                  <option value="ওয়ার্ড ৪">ওয়ার্ড ৪</option>
                  <option value="ওয়ার্ড ৫">ওয়ার্ড ৫</option>
                  <option value="ওয়ার্ড ৬">ওয়ার্ড ৬</option>
                  <option value="ওয়ার্ড ৭">ওয়ার্ড ৭</option>
                  <option value="ওয়ার্ড ৮">ওয়ার্ড ৮</option>
                  <option value="ওয়ার্ড ৯">ওয়ার্ড ৯</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  পারমিশন রোল
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:border-emerald-600 focus:outline-none"
                >
                  <option value="super_admin">সুপার এডমিন (Super Admin)</option>
                  <option value="chairman">চেয়ারম্যান (Chairman)</option>
                  <option value="secretary">সচিব (Secretary)</option>
                  <option value="member">ইউপি সদস্য (Member)</option>
                  <option value="developer">আইটি ডেভেলপার (Developer)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-[11px] text-slate-500">
                * এডমিন ইউজারকে তার গুগল ইমেইল দিয়ে লগইন করতে হবে।
              </p>
              <button
                type="button"
                onClick={handleAddAdmin}
                disabled={isSavingAdmin}
                className="px-6 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-black text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSavingAdmin ? (
                  <span>সংরক্ষণ হচ্ছে...</span>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4 text-amber-300" />
                    <span>+ ফায়ারবেসে এডমিন অনুমোদন প্রদান করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Council Admins Grid */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-800" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  অনুমোদিত ইউনিয়ন পরিষদ কর্মকর্তা ও এডমিন ডিরেক্টরি
                </h3>
              </div>
              <button
                onClick={async () => {
                  const updated = await fetchAdminUsersFromFirebase();
                  setAdminsList(updated);
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-800" />
                <span>রিফ্রেশ</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminsList.map((adm, idx) => (
                <div 
                  key={idx}
                  className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-4 ${
                    currentUser && currentUser.email?.toLowerCase() === adm.email.toLowerCase()
                      ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/30'
                      : 'bg-slate-50 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-900 text-amber-300 font-black flex items-center justify-center text-lg shadow-md shrink-0">
                          {adm.name ? adm.name[0] : 'A'}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-slate-900 text-sm truncate">
                            {adm.name}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium truncate">
                            {adm.email}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-black px-2.5 py-1 bg-amber-100 text-emerald-950 border border-amber-300 rounded-lg shrink-0">
                        {adm.role}
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                      <p className="font-bold text-emerald-900">
                        পদবী: <span className="font-semibold text-slate-800">{adm.designation}</span>
                      </p>
                      {adm.wardNo && (
                        <p className="font-bold text-slate-600">
                          অধিক্ষেত্র: <span className="font-semibold text-slate-700">{adm.wardNo}</span>
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400">
                        অনুমೋದিত: {new Date(adm.addedAt).toLocaleDateString('bn-BD')}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Firebase Auth Active</span>
                    </span>

                    <button
                      onClick={() => handleDeleteAdmin(adm.email, adm.name)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 transition cursor-pointer"
                      title="অ্যাকসেস মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: DYNAMIC ROLE & PERMISSION MANAGEMENT */}
      {activeView === 'roles' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 rounded-3xl shadow-lg border border-emerald-800/80 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <UserCog className="w-6 h-6 text-amber-300" />
                  <h3 className="font-extrabold text-lg text-white">
                    ইউপি ডিজিটাল রোল ও পারমিশন গভর্নেন্স কন্ট্রোল (Role & Permissions Matrix)
                  </h3>
                  <span className="px-2.5 py-0.5 bg-amber-400 text-emerald-950 font-black text-[10px] rounded-full uppercase">
                    Firestore Realtime Sync
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  সুপার এডমিন ও চেয়ারম্যানের এক্সেসে ইউপি সদস্য, সচিব ও কর্মকর্তাদের ক্ষমতা ও দায়িত্ব রিয়েল-টাইমে ডায়নামিকালি পরিমার্জন করুন।
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    const updated = await fetchAdminUsersFromFirebase();
                    setAdminsList(updated);
                    setSuccessToast('ফায়ারবেস থেকে ডায়নামিক রোল ডিরেক্টরি রিলোড করা হয়েছে!');
                    setTimeout(() => setSuccessToast(null), 3000);
                  }}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-amber-300 text-xs font-bold rounded-xl border border-emerald-600 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-300" />
                  <span>লাইভ সিঙ্ক</span>
                </button>
              </div>
            </div>

            {/* Quick Success Toast */}
            {successToast && (
              <div className="p-3 bg-amber-400 text-emerald-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-md">
                <CheckCircle2 className="w-4 h-4 text-emerald-950 shrink-0" />
                <span>{successToast}</span>
              </div>
            )}
          </div>

          {/* 5 Archetype Role Cards Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-black rounded-md">Super Admin</span>
              <h4 className="font-extrabold text-xs text-slate-900 mt-1">সুপার এডমিন</h4>
              <p className="text-[11px] text-slate-500">পূর্ণ মাস্টার ক্ষমতা (এডমিন যোগ, রোল পরিবর্তন, মাস্টার কনফিগারেশন)</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-black rounded-md">Chairman</span>
              <h4 className="font-extrabold text-xs text-slate-900 mt-1">ইউপি চেয়ারম্যান</h4>
              <p className="text-[11px] text-slate-500">সনদপত্র চূড়ান্ত অনুমোদন, ডিজিটাল স্বাক্ষর, ফাইনাল সার্টিফিকেট প্রদান</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-black rounded-md">Secretary</span>
              <h4 className="font-extrabold text-xs text-slate-900 mt-1">ইউপি সচিব</h4>
              <p className="text-[11px] text-slate-500">আবেদন রিসিভ, নাগরিক ডাটা ভেরিফিকেশন, রেজিস্টার ও প্রিন্ট ইস্যু</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-900 text-[10px] font-black rounded-md">Member</span>
              <h4 className="font-extrabold text-xs text-slate-900 mt-1">ইউপি সদস্য (ওয়ার্ড ১-৯)</h4>
              <p className="text-[11px] text-slate-500">স্ব-স্ব ওয়ার্ডের নাগরিকদের সনদের প্রাথমিক সুপারিশ ও তথ্য নিশ্চিতকরণ</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="px-2 py-0.5 bg-purple-100 text-purple-900 text-[10px] font-black rounded-md">Developer</span>
              <h4 className="font-extrabold text-xs text-slate-900 mt-1">আইটি ডেভেলপার</h4>
              <p className="text-[11px] text-slate-500">এপিআই, ওয়েব হুক, ক্লাউড ব্যাকআপ, ফায়ারবেস ও টেকনিক্যাল ম্যানেজমেন্ট</p>
            </div>
          </div>

          {/* User Search & Ward Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={roleSearchQuery}
                onChange={(e) => setRoleSearchQuery(e.target.value)}
                placeholder="নাম, ইমেইল বা পদবী দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="w-4 h-4 text-slate-500 shrink-0" />
              <select
                value={roleWardFilter}
                onChange={(e) => setRoleWardFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:border-emerald-600 focus:outline-none"
              >
                <option value="ALL">সকল ওয়ার্ড</option>
                <option value="ওয়ার্ড ১">ওয়ার্ড ১</option>
                <option value="ওয়ার্ড ২">ওয়ার্ড ২</option>
                <option value="ওয়ার্ড ৩">ওয়ার্ড ৩</option>
                <option value="ওয়ার্ড ৪">ওয়ার্ড ৪</option>
                <option value="ওয়ার্ড ৫">ওয়ার্ড ৫</option>
                <option value="ওয়ার্ড ৬">ওয়ার্ড ৬</option>
                <option value="ওয়ার্ড ৭">ওয়ার্ড ৭</option>
                <option value="ওয়ার্ড ৮">ওয়ার্ড ৮</option>
                <option value="ওয়ার্ড ৯">ওয়ার্ড ৯</option>
                <option value="সকল ওয়ার্ড">সকল ওয়ার্ড (সার্বিক)</option>
              </select>

              <select
                value={roleRoleFilter}
                onChange={(e) => setRoleRoleFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:border-emerald-600 focus:outline-none"
              >
                <option value="ALL">সকল রোল</option>
                <option value="super_admin">সুপার এডমিন</option>
                <option value="chairman">চেয়ারম্যান</option>
                <option value="secretary">সচিব</option>
                <option value="member">ইউপি সদস্য</option>
                <option value="developer">আইটি ডেভেলপার</option>
              </select>
            </div>
          </div>

          {/* Members Permission Cards List */}
          <div className="space-y-4">
            {adminsList
              .filter(adm => {
                const matchSearch = 
                  adm.name.toLowerCase().includes(roleSearchQuery.toLowerCase()) ||
                  adm.email.toLowerCase().includes(roleSearchQuery.toLowerCase()) ||
                  adm.designation.toLowerCase().includes(roleSearchQuery.toLowerCase());
                const matchWard = roleWardFilter === 'ALL' || adm.wardNo === roleWardFilter;
                const matchRole = roleRoleFilter === 'ALL' || adm.role === roleRoleFilter;
                return matchSearch && matchWard && matchRole;
              })
              .map((adm) => {
                const isEditingThis = editingAdminEmail === adm.email;
                const currentPerms = isEditingThis ? editingPermissions : getPermissionsForAdmin(adm);
                const currentRole = isEditingThis ? editingRole : adm.role;

                return (
                  <div
                    key={adm.email}
                    className={`bg-white p-5 rounded-3xl border transition-all duration-200 shadow-sm space-y-4 ${
                      isEditingThis ? 'ring-2 ring-emerald-500 border-emerald-400 bg-emerald-50/20' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-900 text-amber-300 font-extrabold flex items-center justify-center text-xl shadow-md shrink-0">
                          {adm.name ? adm.name[0] : 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-extrabold text-slate-900 text-sm">{adm.name}</h4>
                            <span className="px-2.5 py-0.5 bg-amber-100 text-emerald-950 font-black text-[10px] rounded-lg border border-amber-300">
                              {adm.designation}
                            </span>
                            {adm.wardNo && (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] rounded-md border border-slate-300">
                                {adm.wardNo}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-medium">{adm.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] font-bold text-slate-400">বর্তমান রোল</p>
                          <span className="text-xs font-black text-emerald-900 uppercase">{currentRole}</span>
                        </div>

                        {!isEditingThis ? (
                          <button
                            onClick={() => {
                              setEditingAdminEmail(adm.email);
                              setEditingRole(adm.role);
                              setEditingPermissions(getPermissionsForAdmin(adm));
                            }}
                            className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-amber-300 text-xs font-extrabold rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Sliders className="w-4 h-4 text-amber-300" />
                            <span>পারমিশন টিউন করুন (Edit)</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingAdminEmail(null);
                              }}
                              className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                            >
                              বাতিল
                            </button>
                            <button
                              onClick={async () => {
                                await handleSavePermissionsForUser(adm);
                              }}
                              disabled={isSavingAdmin}
                              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <Save className="w-4 h-4 text-amber-300" />
                              <span>{isSavingAdmin ? 'সেভ হচ্ছে...' : 'ফায়ারবেসে সেভ করুন'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Permission Editor / Matrix Controls */}
                    <div className="space-y-3">
                      {isEditingThis && (
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-bold text-slate-800">রোল পরিবর্তন করুন:</label>
                            <select
                              value={editingRole}
                              onChange={(e) => {
                                const newR = e.target.value as AdminUserRecord['role'];
                                setEditingRole(newR);
                                setEditingPermissions(DEFAULT_ROLE_PERMISSIONS[newR] || DEFAULT_ROLE_PERMISSIONS.member);
                              }}
                              className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-emerald-900 focus:border-emerald-600 focus:outline-none"
                            >
                              <option value="super_admin">সুপার এডমিন (Super Admin)</option>
                              <option value="chairman">চেয়ারম্যান (Chairman)</option>
                              <option value="secretary">সচিব (Secretary)</option>
                              <option value="member">ইউপি সদস্য (Member)</option>
                              <option value="developer">আইটি ডেভেলপার (Developer)</option>
                            </select>
                          </div>

                          <button
                            onClick={() => {
                              setEditingPermissions(DEFAULT_ROLE_PERMISSIONS[editingRole] || DEFAULT_ROLE_PERMISSIONS.member);
                            }}
                            className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-emerald-950 text-xs font-bold rounded-lg border border-amber-300 transition flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-emerald-900" />
                            <span>রোল অনুযায়ী ডিফল্ট পারমিশন সেট করুন</span>
                          </button>
                        </div>
                      )}

                      {/* Toggles Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
                        <label
                          className={`p-3 rounded-2xl border transition flex items-start gap-2.5 cursor-pointer ${
                            currentPerms.canApproveCertificates ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                          onClick={() => {
                            if (!isEditingThis) return;
                            setEditingPermissions(prev => ({ ...prev, canApproveCertificates: !prev.canApproveCertificates }));
                          }}
                        >
                          <input
                            type="checkbox"
                            disabled={!isEditingThis}
                            checked={currentPerms.canApproveCertificates}
                            onChange={() => {}}
                            className="mt-0.5 accent-emerald-800 rounded"
                          />
                          <div>
                            <span className="block text-xs font-extrabold">সনদ অনুমোদন</span>
                            <span className="text-[9px] text-slate-500">Approve Certificates</span>
                          </div>
                        </label>

                        <label
                          className={`p-3 rounded-2xl border transition flex items-start gap-2.5 cursor-pointer ${
                            currentPerms.canIssueCertificates ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                          onClick={() => {
                            if (!isEditingThis) return;
                            setEditingPermissions(prev => ({ ...prev, canIssueCertificates: !prev.canIssueCertificates }));
                          }}
                        >
                          <input
                            type="checkbox"
                            disabled={!isEditingThis}
                            checked={currentPerms.canIssueCertificates}
                            onChange={() => {}}
                            className="mt-0.5 accent-emerald-800 rounded"
                          />
                          <div>
                            <span className="block text-xs font-extrabold">সনদপত্র ইস্যু</span>
                            <span className="text-[9px] text-slate-500">Direct Issue</span>
                          </div>
                        </label>

                        <label
                          className={`p-3 rounded-2xl border transition flex items-start gap-2.5 cursor-pointer ${
                            currentPerms.canManageAdmins ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                          onClick={() => {
                            if (!isEditingThis) return;
                            setEditingPermissions(prev => ({ ...prev, canManageAdmins: !prev.canManageAdmins }));
                          }}
                        >
                          <input
                            type="checkbox"
                            disabled={!isEditingThis}
                            checked={currentPerms.canManageAdmins}
                            onChange={() => {}}
                            className="mt-0.5 accent-emerald-800 rounded"
                          />
                          <div>
                            <span className="block text-xs font-extrabold">এডমিন কন্ট্রোল</span>
                            <span className="text-[9px] text-slate-500">Manage Admins</span>
                          </div>
                        </label>

                        <label
                          className={`p-3 rounded-2xl border transition flex items-start gap-2.5 cursor-pointer ${
                            currentPerms.canEditConfig ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                          onClick={() => {
                            if (!isEditingThis) return;
                            setEditingPermissions(prev => ({ ...prev, canEditConfig: !prev.canEditConfig }));
                          }}
                        >
                          <input
                            type="checkbox"
                            disabled={!isEditingThis}
                            checked={currentPerms.canEditConfig}
                            onChange={() => {}}
                            className="mt-0.5 accent-emerald-800 rounded"
                          />
                          <div>
                            <span className="block text-xs font-extrabold">মাস্টার সেটআপ</span>
                            <span className="text-[9px] text-slate-500">Edit UP Config</span>
                          </div>
                        </label>

                        <label
                          className={`p-3 rounded-2xl border transition flex items-start gap-2.5 cursor-pointer ${
                            currentPerms.canExportData ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                          onClick={() => {
                            if (!isEditingThis) return;
                            setEditingPermissions(prev => ({ ...prev, canExportData: !prev.canExportData }));
                          }}
                        >
                          <input
                            type="checkbox"
                            disabled={!isEditingThis}
                            checked={currentPerms.canExportData}
                            onChange={() => {}}
                            className="mt-0.5 accent-emerald-800 rounded"
                          />
                          <div>
                            <span className="block text-xs font-extrabold">ডাটা এক্সপোর্ট</span>
                            <span className="text-[9px] text-slate-500">Export CSV / Sheets</span>
                          </div>
                        </label>

                        <label
                          className={`p-3 rounded-2xl border transition flex items-start gap-2.5 cursor-pointer ${
                            currentPerms.canDeleteLogs ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                          onClick={() => {
                            if (!isEditingThis) return;
                            setEditingPermissions(prev => ({ ...prev, canDeleteLogs: !prev.canDeleteLogs }));
                          }}
                        >
                          <input
                            type="checkbox"
                            disabled={!isEditingThis}
                            checked={currentPerms.canDeleteLogs}
                            onChange={() => {}}
                            className="mt-0.5 accent-emerald-800 rounded"
                          />
                          <div>
                            <span className="block text-xs font-extrabold">অডিট লগ ডিলেশন</span>
                            <span className="text-[9px] text-slate-500">Audit Clearance</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* VIEW 3: SECURE SYSTEM MODIFICATION AUDIT LOGS */}
      {activeView === 'logs' && (
        <div className="space-y-6">
          {/* Controls Bar & Filters */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-800" />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    সিস্টেম পরিবর্তন অডিট লগ (Secure Modification Logs)
                  </h3>
                  <p className="text-xs text-slate-500">
                    ফায়ারবেস ক্লাউডে এনক্রিপ্ট হয়ে সংরক্ষিত পরিবর্তন ও এডমিন অ্যাক্টিভিটি
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setIsAddLogOpen(true)}
                  className="px-3.5 py-2 bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-extrabold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-amber-300" />
                  <span>+ ম্যানুয়াল নোট লগ করুন</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-950" />
                  <span>CSV অডিট রিপোর্ট ডাউনলোড</span>
                </button>

                <button
                  onClick={loadLogs}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-300 transition cursor-pointer"
                  title="রিফ্রেশ করুন"
                >
                  <RefreshCw className="w-4 h-4 text-emerald-800" />
                </button>
              </div>
            </div>

            {/* Search and Action Filter */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
              <div className="md:col-span-2 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="অডিট লগ অনুসন্ধান করুন (যেমন: নাম, ইমেইল, স্মারক নং, হ্যাশ...)"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <select
                  value={selectedActionFilter}
                  onChange={(e) => setSelectedActionFilter(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:border-emerald-600 focus:outline-none"
                >
                  <option value="ALL">সকল অ্যাকশন টাইপ (All Types)</option>
                  <option value="CERTIFICATE_ISSUED">সনদপত্র ইস্যু</option>
                  <option value="CERTIFICATE_APPROVED">সনদপত্র অনুমোদন</option>
                  <option value="ADMIN_ADDED">নতুন এডমিন অনুমোদন</option>
                  <option value="ADMIN_REMOVED">এডমিন মুছে ফেলা</option>
                  <option value="CONFIG_UPDATED">সিস্টেম কনফিগারেশন</option>
                  <option value="ADMIN_LOGIN">এডমিন সাইন ইন</option>
                  <option value="OTHER">অন্যান্য / ম্যানুয়াল নোট</option>
                </select>
              </div>
            </div>
          </div>

          {/* Audit Logs List Table / Cards */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            {isLoadingLogs ? (
              <div className="p-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-emerald-700 animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-600">ফায়ারবেস হইতে অডিট লগ লোড করা হইতেছে...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">কোনো অডিট লগ রেকর্ড পাওয়া যায় নাই</p>
                <p className="text-xs text-slate-500">অনুসন্ধান ফিল্টার পরিবর্তন করিয়া অথবা নতুন সিকিউরিটি নোট যোগ করিয়া দেখুন।</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="p-5 hover:bg-slate-50/80 transition space-y-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          log.action.includes('APPROVED') || log.action.includes('ISSUED')
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : log.action.includes('ADMIN')
                            ? 'bg-purple-100 text-purple-900 border border-purple-300'
                            : log.action.includes('CONFIG')
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-200 text-slate-800'
                        }`}>
                          {log.action}
                        </span>

                        <h4 className="font-extrabold text-slate-900 text-sm">
                          {log.actionTitle}
                        </h4>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {new Date(log.timestamp).toLocaleString('bn-BD')}
                        </span>

                        {log.checksum && (
                          <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-semibold" title="Cryptographic Integrity Checksum">
                            {log.checksum}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed pl-1">
                      {log.details}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-emerald-700" />
                        <span className="font-bold text-slate-800">{log.performedByName}</span>
                        <span>({log.performedByEmail})</span>
                        <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded text-[10px] font-bold">
                          {log.performedByRole}
                        </span>
                      </div>

                      {log.ipAddress && (
                        <span className="font-mono text-[10px] text-slate-400">
                          IP: {log.ipAddress}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Audit Log Modal */}
      {isAddLogOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden space-y-0">
            <div className="bg-emerald-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-300" />
                <h3 className="font-black text-base text-white">ম্যানুয়াল সিকিউরিটি অডিট নোট যুক্তকরণ</h3>
              </div>
              <button 
                onClick={() => setIsAddLogOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">অ্যাকশন বিভাগ (Action Type)</label>
                <select
                  value={manualActionType}
                  onChange={(e) => setManualActionType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="CONFIG_UPDATED">সিস্টেম কনফিগারেশন পরিবর্তন</option>
                  <option value="CERTIFICATE_ISSUED">সনদপত্র হাতে প্রস্তুত/ইস্যু</option>
                  <option value="ADMIN_ADDED">ইউপি সদস্য সভার নোটিশ</option>
                  <option value="OTHER">অন্যান্য অফিসিয়াল সিদ্ধান্ত</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">লগের বিষয়/শিরোনাম *</label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="যেমন: মাসিক ইউনিয়ন পরিষদ রেজুলেশন সিঙ্ক"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">বিস্তারিত বিবরণী *</label>
                <textarea
                  rows={4}
                  value={manualDetails}
                  onChange={(e) => setManualDetails(e.target.value)}
                  placeholder="অফিসিয়াল সিদ্ধান্ত, পরিবর্তন বা সিকিউরিটি আপডেটের পূর্ণাঙ্গ বিবরণ লিখুন..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsAddLogOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleAddManualLog}
                  disabled={isSubmittingLog}
                  className="px-5 py-2 bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-extrabold text-xs rounded-xl shadow cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingLog ? 'সংরক্ষণ হচ্ছে...' : 'লগ যুক্ত করুন'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Google Sheets Sync Modal */}
      <GoogleSheetsSyncModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        logs={dashboardLogs}
        config={config}
      />

    </div>
  );
};
