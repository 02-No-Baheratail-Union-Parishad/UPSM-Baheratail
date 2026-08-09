import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Fingerprint,
  Key,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  Sparkles,
  Smartphone,
  Check,
  RotateCcw,
  ShieldAlert,
  Loader2,
  Laptop
} from 'lucide-react';
import {
  isWebAuthnSupported,
  isPlatformBiometricAvailable,
  getStoredPasskeys,
  registerWebAuthnPasskey,
  verifyWebAuthnPasskey,
  verifySecurityPin
} from '../utils/webauthn';
import { WebAuthnPasskeyCredential } from '../types';

interface BiometricAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (verification: {
    authType: 'WebAuthn Passkey' | 'Platform Biometrics' | 'Biometric PIN' | 'Security Passkey';
    timestamp: string;
    verifiedBy: string;
  }) => void;
  adminUser?: {
    name: string;
    email: string;
    role: string;
    designation: string;
    photoUrl?: string;
  } | null;
  actionTitle?: string;
  actionDetails?: string;
}

export const BiometricAuthModal: React.FC<BiometricAuthModalProps> = ({
  isOpen,
  onClose,
  onVerified,
  adminUser,
  actionTitle = 'অফিশিয়াল সেবা সুরক্ষায় বায়োমেট্রিক ও প্যাসকি সিকিউরিটি যাচাই',
  actionDetails = 'অফিশিয়াল সনদ বা প্রশাসনিক অনুমোদন সম্পূর্ণ করার পূর্বে ডিজিটাল সিস্টেমের সুরক্ষায় আপনার ডিভাইসের বায়োমেট্রিক ফিঙ্গারপ্রিন্ট বা প্যাসকি যাচাই করুন।'
}) => {
  const [activeTab, setActiveTab] = useState<'biometric' | 'register' | 'pin'>('biometric');
  const [isPlatformSupported, setIsPlatformSupported] = useState<boolean>(false);
  const [passkeys, setPasskeys] = useState<WebAuthnPasskeyCredential[]>([]);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState<string>('');
  const [isVerifiedSuccess, setIsVerifiedSuccess] = useState<boolean>(false);

  const adminEmail = adminUser?.email || 'admin@up.gov.bd';
  const adminName = adminUser?.name || 'ইউপি কর্মকর্তা';

  useEffect(() => {
    if (isOpen) {
      setIsVerifiedSuccess(false);
      setAuthError(null);
      setStatusMessage(null);
      setPinInput('');

      // Check device platform biometrics support
      isPlatformBiometricAvailable().then(avail => setIsPlatformSupported(avail));

      // Load registered passkeys for current admin
      const stored = getStoredPasskeys(adminEmail);
      setPasskeys(stored);

      if (stored.length === 0) {
        setActiveTab('biometric');
      }
    }
  }, [isOpen, adminEmail]);

  if (!isOpen) return null;

  // Handle Biometric / Passkey Verification
  const handleTriggerBiometric = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    setStatusMessage('ডিভাইসের বায়োমেট্রিক ফিঙ্গারপ্রিন্ট / Touch ID / Face ID বা প্যাসকি স্পর্শ করুন...');

    try {
      const res = await verifyWebAuthnPasskey(adminEmail);
      if (res.success) {
        setIsVerifiedSuccess(true);
        setStatusMessage(res.message);

        setTimeout(() => {
          onVerified({
            authType: res.authType,
            timestamp: new Date().toISOString(),
            verifiedBy: adminEmail
          });
          onClose();
        }, 1200);
      } else {
        setAuthError(res.message);
      }
    } catch (err: any) {
      setAuthError('বায়োমেট্রিক স্ক্যানকালে ত্রুটি ঘটিয়াছে: ' + (err.message || 'অজানা সমস্যা'));
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle New Passkey Registration
  const handleRegisterPasskey = async () => {
    setIsRegistering(true);
    setAuthError(null);
    setStatusMessage('ডিভাইস স্ক্যানার স্পর্শ করে প্যাসকি যুক্ত করুন...');

    try {
      const res = await registerWebAuthnPasskey(adminEmail, adminName);
      if (res.success) {
        const updated = getStoredPasskeys(adminEmail);
        setPasskeys(updated);
        setStatusMessage(res.message);
        setActiveTab('biometric');
      } else {
        setAuthError(res.message);
      }
    } catch (err: any) {
      setAuthError('প্যাসকি নিবন্ধনে ত্রুটি: ' + err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  // Handle Security PIN Verification Fallback
  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    // Verified against default official PIN or custom chairman PIN
    if (verifySecurityPin(pinInput, '786021') || verifySecurityPin(pinInput, '123456')) {
      setIsVerifiedSuccess(true);
      setStatusMessage('✓ সিকিউরিটি মাস্টার পিন যাচাইকরণ সফল হইয়াছে!');

      setTimeout(() => {
        onVerified({
          authType: 'Biometric PIN',
          timestamp: new Date().toISOString(),
          verifiedBy: adminEmail
        });
        onClose();
      }, 1000);
    } else {
      setAuthError('⚠️ ভুল সিকিউরিটি পিন নম্বর প্রদান করা হইয়াছে। আবার চেষ্টা করুন।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden relative space-y-0">

        {/* Modal Top Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white p-6 relative overflow-hidden">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-400 text-slate-950 rounded-2xl shrink-0 font-extrabold shadow-lg">
              <Fingerprint className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-900/80 border border-emerald-700/60 text-amber-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3 text-amber-300" />
                <span>WebAuthn Biometric & Passkey Protection</span>
              </div>
              <h3 className="text-lg font-black text-white mt-1 leading-tight">
                {actionTitle}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">
                {actionDetails}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Admin Profile Strip */}
        <div className="bg-slate-100/90 px-6 py-3 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            {adminUser?.photoUrl ? (
              <img
                src={adminUser.photoUrl}
                alt={adminName}
                className="w-7 h-7 rounded-full border border-emerald-600 object-cover shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-emerald-900 text-amber-300 font-black flex items-center justify-center text-xs shrink-0">
                {adminName[0]}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-extrabold text-slate-900 truncate text-xs">{adminName}</p>
              <p className="text-[10px] text-slate-500 truncate">{adminUser?.designation || adminEmail}</p>
            </div>
          </div>

          <span className="text-[10px] font-black px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg shrink-0">
            {adminUser?.role ? `রোল: ${adminUser.role}` : 'এডমিন যাচাই'}
          </span>
        </div>

        {/* Modal Main Body */}
        <div className="p-6 space-y-5">

          {/* Alert / Status Toast */}
          {authError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-shake">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {statusMessage && !authError && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Success Animated State */}
          {isVerifiedSuccess ? (
            <div className="py-8 text-center space-y-3 animate-bounce">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-500 shadow-xl">
                <Check className="w-10 h-10 stroke-[3]" />
              </div>
              <h4 className="text-lg font-black text-slate-900">
                বায়োমেট্রিক অ্যাক্সেস ভেরিফাইড!
              </h4>
              <p className="text-xs text-slate-600 font-medium">
                অফিশিয়াল আদেশটি উচ্চতর নিরাপত্তার সাথে বাস্তবায়িত হইতেছে...
              </p>
            </div>
          ) : (
            <>
              {/* Security Option Tabs */}
              <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('biometric')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'biometric'
                      ? 'bg-white text-emerald-900 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Fingerprint className="w-4 h-4 text-emerald-700" />
                  <span>বায়োমেট্রিক প্যাসকি</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'register'
                      ? 'bg-white text-emerald-900 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-amber-600" />
                  <span>প্যাসকি নিবন্ধন ({passkeys.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('pin')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'pin'
                      ? 'bg-white text-emerald-900 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Key className="w-4 h-4 text-slate-700" />
                  <span>মাস্টার পিন</span>
                </button>
              </div>

              {/* TAB 1: Biometric Verification */}
              {activeTab === 'biometric' && (
                <div className="space-y-4 py-2">
                  <div className="text-center space-y-3">
                    {/* Fingerprint Visual Animation Box */}
                    <div className="relative inline-block my-2">
                      <div className="w-24 h-24 rounded-full bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center mx-auto relative overflow-hidden group">
                        <Fingerprint className={`w-14 h-14 text-emerald-800 transition-transform ${isAuthenticating ? 'animate-pulse scale-110 text-amber-500' : 'group-hover:scale-105'}`} />
                        {isAuthenticating && (
                          <div className="absolute inset-0 bg-amber-400/20 animate-ping rounded-full" />
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        ডিভাইসের বায়োমেট্রিক ফিঙ্গারপ্রিন্ট বা Touch ID স্পর্শ করুন
                      </h4>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 font-medium">
                        Windows Hello, Apple Touch ID/Face ID বা আপনার স্মার্টফোনের প্যাসকি বা বায়োমেট্রিক সেন্সর ব্যবহার করুন।
                      </p>
                    </div>
                  </div>

                  {/* Device Compatibility Status Badge */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Laptop className="w-4 h-4 text-emerald-700" />
                      <span className="font-bold text-slate-700">ডিভাইস ফিঙ্গারপ্রিন্ট সাপোর্ট:</span>
                    </div>
                    {isPlatformSupported ? (
                      <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                        ✅ বায়োমেট্রিক প্রস্তুত
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full">
                        প্যাসকি / মাস্টার পিন সক্রিয়
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleTriggerBiometric}
                    disabled={isAuthenticating}
                    className="w-full py-3.5 bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-extrabold text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
                  >
                    {isAuthenticating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                        <span>বায়োমেট্রিক স্ক্যান প্রক্রিয়াধীন...</span>
                      </>
                    ) : (
                      <>
                        <Fingerprint className="w-5 h-5 text-amber-300" />
                        <span>বায়োমেট্রিক স্পর্শ/স্ক্যান শুরু করুন</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* TAB 2: Register Passkey */}
              {activeTab === 'register' && (
                <div className="space-y-4 py-2">
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs space-y-2">
                    <div className="flex items-center gap-2 font-black text-amber-900">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>প্যাসকি (Passkey) সুবিধা কী?</span>
                    </div>
                    <p className="text-amber-800 leading-relaxed font-medium">
                      প্যাসকি নিবন্ধনের ফলে পরবর্তীতে কোনো পাসওয়ার্ড ছাড়াই কেবল ডিভাইসের ফিঙ্গারপ্রিন্ট বা ফেস আইডি স্পর্শ করেই অফিশিয়াল সনদ তৈরি ও অনুমোদন করতে পারবেন।
                    </p>
                  </div>

                  {/* List of Existing Passkeys */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-700">
                      নিবন্ধিত প্যাসকি তালিকা ({passkeys.length}):
                    </p>
                    {passkeys.length === 0 ? (
                      <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center text-xs text-slate-500">
                        এখনো কোনো ডিভাইস প্যাসকি যুক্ত করা হয় নাই। নিচের বাটনে ক্লিক করে যুক্ত করুন।
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                        {passkeys.map(pk => (
                          <div
                            key={pk.id}
                            className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2.5">
                              <Laptop className="w-4 h-4 text-emerald-800 shrink-0" />
                              <div>
                                <p className="font-extrabold text-slate-900">{pk.deviceName}</p>
                                <p className="text-[10px] text-slate-500">
                                  যুক্ত: {new Date(pk.registeredAt).toLocaleDateString('bn-BD')}
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                              সক্রিয়
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleRegisterPasskey}
                    disabled={isRegistering}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isRegistering ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>প্যাসকি তৈরি হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Smartphone className="w-4 h-4 text-slate-950" />
                        <span>নতুন বায়োমেট্রিক প্যাসকি রেজিস্টার করুন</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* TAB 3: Master PIN Security */}
              {activeTab === 'pin' && (
                <form onSubmit={handleVerifyPin} className="space-y-4 py-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-800">
                      চেয়ারম্যান/সচিব অফিশিয়াল সিকিউরিটি পিন (Master Security PIN)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      বায়োমেট্রিক হার্ডওয়্যার উপস্থিত না থাকিলে অফিশিয়াল সিকিউরিটি পিন প্রদান করুন।
                    </p>
                  </div>

                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      maxLength={8}
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      placeholder="যেমন: 786021"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono tracking-widest text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-amber-300 font-extrabold text-xs rounded-2xl shadow transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-300" />
                    <span>সিকিউরিটি পিন যাচাই করুন</span>
                  </button>
                </form>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};
