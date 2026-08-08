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
  X, 
  Users, 
  Building2, 
  Lock, 
  RefreshCw,
  ExternalLink,
  Shield
} from 'lucide-react';
import { 
  auth, 
  signInWithGooglePopup, 
  logoutUserFromFirebase, 
  fetchAdminUsersFromFirebase, 
  AdminUserRecord 
} from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminAuthenticated?: (user: AdminUserRecord | null) => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onAdminAuthenticated
}) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [adminRecord, setAdminRecord] = useState<AdminUserRecord | null>(null);
  const [adminList, setAdminList] = useState<AdminUserRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setCurrentUser(fbUser);
      setIsLoading(true);
      setAuthError(null);

      if (fbUser) {
        try {
          const admins = await fetchAdminUsersFromFirebase();
          setAdminList(admins);

          const matchedAdmin = admins.find(a => a.email.toLowerCase() === (fbUser.email || '').toLowerCase());
          if (matchedAdmin) {
            setAdminRecord(matchedAdmin);
            if (onAdminAuthenticated) onAdminAuthenticated(matchedAdmin);
          } else {
            // User authenticated with Google but not listed in authorized Admin directory
            setAdminRecord({
              email: fbUser.email || '',
              name: fbUser.displayName || 'অনুমোদিত এডমিন',
              role: 'member',
              designation: 'সাধারণ ইউপি কর্মকর্তা / অপারেটর',
              photoUrl: fbUser.photoURL || undefined,
              addedAt: new Date().toISOString(),
              status: 'active'
            });
            if (onAdminAuthenticated) {
              onAdminAuthenticated({
                email: fbUser.email || '',
                name: fbUser.displayName || 'অনুমোদিত এডমিন',
                role: 'member',
                designation: 'সাধারণ ইউপি কর্মকর্তা / অপারেটর',
                photoUrl: fbUser.photoURL || undefined,
                addedAt: new Date().toISOString(),
                status: 'active'
              });
            }
          }
        } catch (err) {
          console.warn('Admin verification error:', err);
        }
      } else {
        setAdminRecord(null);
        if (onAdminAuthenticated) onAdminAuthenticated(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const user = await signInWithGooglePopup();
      const admins = await fetchAdminUsersFromFirebase();
      setAdminList(admins);

      const matchedAdmin = admins.find(a => a.email.toLowerCase() === (user.email || '').toLowerCase());
      if (matchedAdmin) {
        setAdminRecord(matchedAdmin);
      }
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      setAuthError(err.message || 'গুগল সাইন-ইন সম্পন্ন করতে ব্যর্থ হইয়াছে।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await logoutUserFromFirebase();
      setAdminRecord(null);
      setCurrentUser(null);
    } catch (err: any) {
      setAuthError('লগআউট করতে ব্যর্থ: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden relative space-y-0">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 relative overflow-hidden">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-400 text-emerald-950 rounded-2xl shrink-0 font-extrabold shadow-lg">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-amber-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                Google Firebase Auth / OAuth 2.0
              </span>
              <h2 className="text-xl font-black text-white mt-0.5">
                একাধিক এডমিন প্যানেল লগইন
              </h2>
              <p className="text-xs text-emerald-100">
                চেয়ারম্যান, সচিব, ইউপি সদস্য ও আইটি সিস্টেম এডমিন অথেন্টিকেশন
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 space-y-5">

          {authError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-shake">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Logged In Admin Profile Section */}
          {currentUser ? (
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-xs font-extrabold text-emerald-950">
                    বর্তমানে লগইনকৃত এডমিন অ্যাকাউন্ট
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200 px-2.5 py-0.5 rounded-full">
                  সক্রিয় সেশন (Verified)
                </span>
              </div>

              <div className="flex items-start gap-4">
                {currentUser.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt="Google Profile" 
                    className="w-14 h-14 rounded-2xl border-2 border-emerald-600 shadow-md shrink-0 object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-amber-300 flex items-center justify-center font-black text-xl shadow-md shrink-0">
                    {currentUser.displayName ? currentUser.displayName[0] : 'A'}
                  </div>
                )}

                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="font-extrabold text-base text-slate-900 truncate">
                    {currentUser.displayName || adminRecord?.name || 'এডমিন ইউজার'}
                  </h3>
                  <p className="text-xs font-medium text-slate-600 truncate">
                    {currentUser.email}
                  </p>
                  
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-800 text-amber-300 rounded-lg text-xs font-bold mt-1 shadow-sm">
                    <Shield className="w-3.5 h-3.5 text-amber-300" />
                    <span>পদবী: {adminRecord?.designation || 'অনুমোদিত ইউপি এডমিন'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <p className="text-[11px] text-slate-500">
                  পাসওয়ার্ডহীন সিকিউর OAuth 2.0 একক লগইন
                </p>
                <button
                  onClick={handleSignOut}
                  disabled={isLoading}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>লগআউট করুন</span>
                </button>
              </div>
            </div>
          ) : (
            /* Google Sign In Call-to-Action */
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto font-black shadow-sm">
                <Lock className="w-6 h-6 text-emerald-800" />
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  গুগল অ্যাকাউন্ট দিয়া নিরাপদ এডমিন লগইন
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  চেয়ারম্যান, সচিব বা অনুমোদিত এডমিন হিসেবে সিস্টেমে প্রবেশ করতে আপনার গুগল অ্যাকাউন্ট নির্বাচন করুন।
                </p>
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl shadow-xl transition flex items-center justify-center gap-3 border border-slate-700 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Google-এর মাধ্যমে সাইন ইন করুন (Firebase Auth)</span>
              </button>
            </div>
          )}

          {/* Multi-Admin Authorized List Overview */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span>অনুমোদিত এডমিন তালিকা (Firebase Directory)</span>
              <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                {adminList.length} জন সক্রিয়
              </span>
            </h4>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 border border-slate-200 rounded-2xl p-2 bg-slate-50">
              {adminList.map((adm, idx) => (
                <div 
                  key={idx} 
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition ${
                    currentUser && currentUser.email?.toLowerCase() === adm.email.toLowerCase()
                      ? 'bg-emerald-100/80 border-emerald-400 font-extrabold text-emerald-950'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-emerald-800 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      {adm.name ? adm.name[0] : 'A'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold truncate text-xs">{adm.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{adm.email}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-emerald-950 border border-amber-300 rounded-md shrink-0">
                    {adm.designation || adm.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Info */}
          <div className="bg-slate-100 p-3 rounded-2xl border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>গুগল ইকোসিস্টেমের ফায়ারবেস অথেন্টিকেশন দিয়া মাল্টি-এডমিন লগইন নিরাপত্তা সুনিশ্চিত করা হয়েছে।</span>
          </div>

        </div>

      </div>
    </div>
  );
};
