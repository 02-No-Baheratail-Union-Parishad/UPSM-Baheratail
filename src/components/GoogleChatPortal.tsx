import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Users, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Building2, 
  Radio, 
  FileText, 
  Hash, 
  Lock, 
  Globe, 
  User as UserIcon, 
  Calendar, 
  Check, 
  X, 
  Share2, 
  Info,
  ShieldCheck,
  ChevronRight,
  Search,
  Megaphone,
  BellRing,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { 
  GoogleChatSpace, 
  GoogleChatMessage, 
  GoogleChatMembership, 
  UnionParishadConfig, 
  CertificateRecord 
} from '../types';
import { 
  fetchGoogleChatSpaces, 
  fetchSpaceMessages, 
  sendChatMessageToSpace, 
  createGoogleChatSpace, 
  fetchSpaceMemberships,
  formatCertificateChatNotification
} from '../services/googleChatService';
import { 
  auth, 
  signInWithGooglePopupForWorkspace, 
  getGoogleAccessToken, 
  setGoogleAccessToken,
  logoutUserFromFirebase,
  formatFirebaseAuthError
} from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface GoogleChatPortalProps {
  config: UnionParishadConfig;
  initialCertificateToShare?: CertificateRecord | null;
  onCertificateShared?: () => void;
}

export function GoogleChatPortal({ config, initialCertificateToShare, onCertificateShared }: GoogleChatPortalProps) {
  // Auth state
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [accessToken, setAccessToken] = useState<string | null>(getGoogleAccessToken());
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Chat state
  const [spaces, setSpaces] = useState<GoogleChatSpace[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<GoogleChatSpace | null>(null);
  const [messages, setMessages] = useState<GoogleChatMessage[]>([]);
  const [members, setMembers] = useState<GoogleChatMembership[]>([]);
  
  // Loading & Filter states
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Modals & Confirmation dialogs
  const [isCreateSpaceModalOpen, setIsCreateSpaceModalOpen] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceDescription, setNewSpaceDescription] = useState('');
  const [isCreatingSpace, setIsCreatingSpace] = useState(false);

  // User Confirmation Modal for Mutating Actions (Workspace Integration Mandatory Rule)
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    details: React.ReactNode;
    confirmText: string;
    confirmAction: () => Promise<void>;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    title: '',
    description: '',
    details: null,
    confirmText: 'নিশ্চিত করুন',
    confirmAction: async () => {},
  });

  const [isConfirmingAction, setIsConfirmingAction] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  // Auto-scroll messages container
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      const token = getGoogleAccessToken();
      setAccessToken(token);
    });
    return () => unsubscribe();
  }, []);

  // Initial spaces fetch once authenticated
  useEffect(() => {
    if (accessToken) {
      loadSpaces();
    }
  }, [accessToken]);

  // Load messages when space changes
  useEffect(() => {
    if (selectedSpace && accessToken) {
      loadMessages(selectedSpace.name);
      loadMembers(selectedSpace.name);
    }
  }, [selectedSpace, accessToken]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Prepopulate certificate share text if provided via props
  useEffect(() => {
    if (initialCertificateToShare) {
      const template = formatCertificateChatNotification(initialCertificateToShare, config);
      setMessageInput(template);
    }
  }, [initialCertificateToShare, config]);

  const showNotification = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  // Google Sign-In with Chat Scopes
  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const { user, accessToken: token } = await signInWithGooglePopupForWorkspace();
      setCurrentUser(user);
      setAccessToken(token);
      setGoogleAccessToken(token);
      showNotification('গুগল চ্যাট সফলভাবে সংযুক্ত হয়েছে!', 'success');
    } catch (err: any) {
      console.error('Chat Google Auth Error:', err);
      setAuthError(formatFirebaseAuthError(err));
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    await logoutUserFromFirebase();
    setAccessToken(null);
    setGoogleAccessToken(null);
    setCurrentUser(null);
    setSpaces([]);
    setSelectedSpace(null);
    setMessages([]);
    showNotification('গুগল অ্যাকাউন্ট সাইন-আউট করা হয়েছে।', 'info');
  };

  // Load spaces
  const loadSpaces = async () => {
    setIsLoadingSpaces(true);
    try {
      const fetchedSpaces = await fetchGoogleChatSpaces();
      setSpaces(fetchedSpaces);
      if (fetchedSpaces.length > 0 && !selectedSpace) {
        setSelectedSpace(fetchedSpaces[0]);
      }
    } catch (err: any) {
      console.warn('Notice loading chat spaces:', err);
      showNotification(err.message || 'চ্যাট স্পেস লোড করতে সমস্যা হয়েছে', 'error');
    } finally {
      setIsLoadingSpaces(false);
    }
  };

  // Load messages
  const loadMessages = async (spaceName: string) => {
    setIsLoadingMessages(true);
    try {
      const msgs = await fetchSpaceMessages(spaceName);
      setMessages(msgs);
    } catch (err: any) {
      console.warn('Notice loading messages:', err);
      showNotification(err.message || 'বার্তা লোড করা যায়নি', 'error');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Load members
  const loadMembers = async (spaceName: string) => {
    setIsLoadingMembers(true);
    try {
      const mems = await fetchSpaceMemberships(spaceName);
      setMembers(mems);
    } catch (err: any) {
      console.warn('Notice loading members:', err);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  // Request user confirmation before sending a message (MANDATORY per Workspace rules)
  const handleInitiateSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !selectedSpace) return;

    const targetSpaceName = selectedSpace.displayName || selectedSpace.name;
    const textToSend = messageInput.trim();

    setConfirmationModal({
      isOpen: true,
      title: 'গুগল চ্যাট বার্তা প্রেরণ নিশ্চিতকরণ',
      description: `আপনি কি "${targetSpaceName}" চ্যাট স্পেসে নিচের অফিসিয়াল বার্তাটি প্রেরণ করতে সম্মত আছেন?`,
      details: (
        <div className="space-y-3 text-left">
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs">
            <div className="flex items-center gap-2 mb-2 font-bold text-emerald-800 dark:text-emerald-400">
              <Building2 className="w-4 h-4" />
              <span>গন্তব্য স্পেস: {targetSpaceName}</span>
            </div>
            <div className="flex items-center gap-2 mb-2 text-slate-600 dark:text-slate-400">
              <UserIcon className="w-4 h-4" />
              <span>প্রেরক: {currentUser?.displayName || 'ইউপি কর্মকর্তা'} ({currentUser?.email})</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">বার্তার বিষয়বস্তু:</p>
              <pre className="whitespace-pre-wrap font-sans text-xs bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 max-h-48 overflow-y-auto">
                {textToSend}
              </pre>
            </div>
          </div>
          <p className="text-[11px] text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>গুগল ওয়ার্কস্পেস নীতিমালা অনুযায়ী ব্যবহারকারীর সম্মতি ছাড়া কোনো বার্তা প্রেরণ করা হয় না।</span>
          </p>
        </div>
      ),
      confirmText: 'হ্যাঁ, চ্যাটে বার্তা পাঠান',
      confirmAction: async () => {
        try {
          await sendChatMessageToSpace(selectedSpace.name, textToSend);
          setMessageInput('');
          showNotification('বার্তা সফলভাবে গুগল চ্যাট স্পেসে প্রেরিত হয়েছে!', 'success');
          if (onCertificateShared && initialCertificateToShare) {
            onCertificateShared();
          }
          await loadMessages(selectedSpace.name);
        } catch (err: any) {
          showNotification(err.message || 'বার্তা প্রেরণে ব্যর্থ হয়েছে', 'error');
        }
      }
    });
  };

  // Request user confirmation before creating a new Space
  const handleInitiateCreateSpace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpaceName.trim()) return;

    const spaceName = newSpaceName.trim();
    const description = newSpaceDescription.trim();

    setConfirmationModal({
      isOpen: true,
      title: 'নতুন গুগল চ্যাট স্পেস খোলার অনুমতি',
      description: `আপনার গুগল অ্যাকাউন্টের অধীনে "${spaceName}" নামে একটি নতুন চ্যাট স্পেস তৈরি করা হবে।`,
      details: (
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs space-y-2">
          <p><strong>স্পেসের নাম:</strong> {spaceName}</p>
          {description && <p><strong>বিবরণ:</strong> {description}</p>}
          <p><strong>অ্যাকাউন্ট:</strong> {currentUser?.email}</p>
        </div>
      ),
      confirmText: 'স্পেস তৈরি করুন',
      confirmAction: async () => {
        setIsCreatingSpace(true);
        try {
          const created = await createGoogleChatSpace(spaceName, description);
          showNotification(`"${spaceName}" চ্যাট স্পেস সফলভাবে তৈরি হয়েছে!`, 'success');
          setIsCreateSpaceModalOpen(false);
          setNewSpaceName('');
          setNewSpaceDescription('');
          await loadSpaces();
          if (created && created.name) {
            setSelectedSpace(created);
          }
        } catch (err: any) {
          showNotification(err.message || 'স্পেস তৈরিতে সমস্যা হয়েছে', 'error');
        } finally {
          setIsCreatingSpace(false);
        }
      }
    });
  };

  // Filtered spaces list
  const filteredSpaces = spaces.filter(sp => {
    const name = sp.displayName || sp.name;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Quick preset templates for Union Parishad administration
  const quickTemplates = [
    {
      label: '🏛️ ইউপি মাসিক সাধারণ সভা বিজ্ঞপ্তি',
      text: `📢 *০২নং বহেড়াতৈল ইউনিয়ন পরিষদ — মাসিক সাধারণ সভা আহ্বান*
━━━━━━━━━━━━━━━━━━━━
সম্মানিত সকল ইউপি সদস্য ও কর্মকর্তাবৃন্দ,
আগামী রবিবার বেলা ১১:০০ ঘটিকায় ইউনিয়ন পরিষদ সভাকক্ষে মাসিক সমন্বয় সভা অনুষ্ঠিত হইবে। সকল সম্মানিত সদস্যগণকে যথাসময়ে উপস্থিত থাকিবার জন্য অনুরোধ করা হইল।

আদেশক্রমে:
চেয়ারম্যান, ০২নং বহেড়াতৈল ইউনিয়ন পরিষদ।`
    },
    {
      label: '🌾 ভিজিডি ও সামাজিক নিরাপত্তা তালিকা',
      text: `🌾 *জরুরি বিজ্ঞপ্তি: সামাজিক নিরাপত্তা ও খাদ্যবান্ধব কর্মসূচির উপকারভোগী তালিকা হালনাগাদ*
━━━━━━━━━━━━━━━━━━━━
সকল ওয়ার্ডের সম্মানিত ইউপি সদস্যগণকে নিজ নিজ ওয়ার্ডের নতুন বিধবা, বয়স্ক ও প্রতিবন্ধী ভাতার খসড়া তালিকা আগামী ৩ কর্মদিবসের মধ্যে সচিব কার্যালয়ে জমাদানের জন্য অবহিত করা যাইতেছে।`
    },
    {
      label: '🚨 দুর্যোগ প্রস্তুতি ও হেল্পলাইন বিজ্ঞপ্তি',
      text: `🚨 *জরুরি সতর্কতা ও ইউনিয়ন কন্ট্রোল রুম তথ্য*
━━━━━━━━━━━━━━━━━━━━
প্রাকৃতিক দুর্যোগ ও জরুরি নাগরিক সহায়তার জন্য ইউনিয়ন পরিষদ কন্ট্রোল রুম ২৪ ঘণ্টা চালু রহিয়াছে।
📞 জরুরি হটলাইন: ${config.hotline || '০১৮৩৪-৩৩৩৩০০'}
📍 অফিস: ${config.upName}, ${config.address}`
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 md:p-6 border-b border-emerald-800/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-emerald-950 p-2.5 flex items-center justify-center shadow-lg shadow-emerald-950/40">
              <MessageSquare className="w-7 h-7 fill-emerald-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
                  গুগল চ্যাট ও ইউপি টিম স্পেস
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Google Workspace
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                {config.upName} এর সকল ইউপি সদস্য, সচিব ও কর্মকর্তাদের অভ্যন্তরীণ যোগাযোগ এবং নোটিফিকেশন সিস্টেম
              </p>
            </div>
          </div>

          {/* User Auth Action Pill */}
          <div className="flex items-center gap-2.5">
            {currentUser && accessToken ? (
              <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-700/60 rounded-xl px-3 py-1.5 shadow-inner">
                {currentUser.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt={currentUser.displayName || 'User'} 
                    className="w-7 h-7 rounded-full border border-emerald-400" 
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center text-xs font-bold text-white">
                    {currentUser.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="text-left">
                  <p className="text-xs font-bold text-emerald-100 leading-tight">
                    {currentUser.displayName || 'ইউপি কর্মকর্তা'}
                  </p>
                  <p className="text-[10px] text-emerald-300/80 truncate max-w-[140px]">
                    {currentUser.email}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 px-2 py-1 text-[10px] font-semibold text-rose-300 hover:text-rose-100 hover:bg-rose-900/40 rounded transition cursor-pointer"
                  title="সাইন-আউট করুন"
                >
                  লগআউট
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                disabled={isAuthenticating}
                className="gsi-material-button flex items-center gap-2 bg-white text-slate-800 font-bold px-4 py-2 rounded-xl text-xs shadow-lg hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span>{isAuthenticating ? 'সংযোগ হচ্ছে...' : 'Sign in with Google'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Alert Notification Toast */}
        {statusMessage && (
          <div className={`mt-4 p-3 rounded-xl text-xs font-semibold flex items-center justify-between animate-fade-in ${
            statusMessage.type === 'success' ? 'bg-emerald-800/90 text-emerald-100 border border-emerald-500' :
            statusMessage.type === 'error' ? 'bg-rose-900/90 text-rose-100 border border-rose-500' :
            'bg-sky-900/90 text-sky-100 border border-sky-500'
          }`}>
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <AlertCircle className="w-4 h-4 text-rose-300" />}
              <span>{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-white/60 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Container */}
      {!currentUser || !accessToken ? (
        /* Sign-in Required View */
        <div className="p-8 md:p-14 text-center max-w-2xl mx-auto space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-800 dark:text-emerald-400 shadow-xl shadow-emerald-900/10">
            <Radio className="w-10 h-10 animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">
              গুগল চ্যাট ওয়ার্কস্পেস সক্রিয়করণ
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              ০২নং বহেড়াতৈল ইউনিয়ন পরিষদের অফিশিয়াল গুগল চ্যাট স্পেসে যুক্ত হতে, মিটিং বিজ্ঞপ্তি ও নাগরিক প্রত্যয়নপত্র সরাসরি টিম স্পেসে শেয়ার করতে আপনার অনুমোদিত গুগল অ্যাকাউন্ট দিয়ে সাইন-ইন করুন।
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 text-left text-xs text-amber-900 dark:text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-950 dark:text-amber-100">
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>ওয়ার্কস্পেস অনুমতি ও গোপনীয়তা নিরাপত্তা:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-amber-800 dark:text-amber-300 pl-1">
              <li>গুগল চ্যাট স্পেস দেখা ও পরিচালনা করার অনুমতি (Chat API Scopes)।</li>
              <li>দাপ্তরিক বার্তা বা নোটিফিকেশন পাঠানোর পূর্বে সর্বদাই স্পষ্ট পপআপে আপনার নিশ্চিতকরণ নেয়া হইবে।</li>
            </ul>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              onClick={handleGoogleSignIn}
              disabled={isAuthenticating}
              className="gsi-material-button flex items-center gap-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-2xl shadow-xl hover:shadow-emerald-900/30 transition duration-200 cursor-pointer disabled:opacity-60 text-sm"
            >
              <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span>{isAuthenticating ? 'গুগল সংযোগ যাচাই হচ্ছে...' : 'গুগল অ্যাকাউন্ট দিয়ে সাইন-ইন করুন'}</span>
            </button>
          </div>

          {authError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-900">
              {authError}
            </div>
          )}
        </div>
      ) : (
        /* Two-Column Chat Workspace Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
          {/* Left Sidebar: Spaces & Rooms (4 Cols) */}
          <div className="lg:col-span-4 border-r border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex flex-col">
            {/* Spaces Search & Actions */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>চ্যাট স্পেস ও চ্যানেলসমূহ</span>
                </h3>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={loadSpaces}
                    disabled={isLoadingSpaces}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="রিলোড করুন"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingSpaces ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => setIsCreateSpaceModalOpen(true)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
                    title="নতুন স্পেস তৈরি করুন"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>নতুন স্পেস</span>
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="স্পেস বা গ্রুপ খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Spaces List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 max-h-[480px]">
              {isLoadingSpaces ? (
                <div className="p-6 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                  <span>গুগল চ্যাট স্পেস ফেচ করা হচ্ছে...</span>
                </div>
              ) : filteredSpaces.length === 0 ? (
                <div className="p-6 text-center text-slate-500 dark:text-slate-400 space-y-3">
                  <MessageSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="text-xs">কোনো চ্যাট স্পেস পাওয়া যায়নি।</p>
                  <button
                    onClick={() => setIsCreateSpaceModalOpen(true)}
                    className="px-3 py-1.5 bg-emerald-800 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
                  >
                    + প্রথম ইউপি স্পেস তৈরি করুন
                  </button>
                </div>
              ) : (
                filteredSpaces.map((space) => {
                  const isSelected = selectedSpace?.name === space.name;
                  const displayName = space.displayName || space.name.replace('spaces/', 'স্পেস #');
                  return (
                    <button
                      key={space.name}
                      onClick={() => setSelectedSpace(space)}
                      className={`w-full text-left p-3 rounded-xl transition flex items-center justify-between cursor-pointer ${
                        isSelected 
                          ? 'bg-emerald-800 text-white shadow-md' 
                          : 'bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/70 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected 
                            ? 'bg-emerald-950 text-emerald-300' 
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400'
                        }`}>
                          <Hash className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-xs truncate">{displayName}</p>
                          <p className={`text-[10px] truncate ${isSelected ? 'text-emerald-200' : 'text-slate-500 dark:text-slate-400'}`}>
                            {space.spaceDetails?.description || 'ইউপি অফিশিয়াল স্পেস'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    </button>
                  );
                })
              )}
            </div>

            {/* UP Quick Broadcast Preset Banner */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-950/20">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-300">
                <Megaphone className="w-4 h-4 text-emerald-700" />
                <span>দ্রুত ঘোষণা প্রিসেট:</span>
              </div>
              <div className="mt-2 grid grid-cols-1 gap-1">
                {quickTemplates.map((t, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMessageInput(t.text)}
                    className="text-left text-[11px] px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900 rounded-lg hover:border-emerald-500 text-slate-700 dark:text-slate-300 truncate transition cursor-pointer"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Main Chat Window (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col bg-white dark:bg-slate-900">
            {selectedSpace ? (
              <>
                {/* Active Space Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/40 dark:bg-slate-950/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 flex items-center justify-center font-black">
                      <Hash className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <span>{selectedSpace.displayName || selectedSpace.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400">
                          {selectedSpace.spaceType || 'SPACE'}
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {selectedSpace.spaceDetails?.description || '০২নং বহেড়াতৈল ইউনিয়ন পরিষদ ডিজিটাল কমিউনিকেশন'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsMembersModalOpen(true)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition cursor-pointer"
                      title="সদস্য তালিকা দেখুন"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>সদস্য ({members.length})</span>
                    </button>
                    <button
                      onClick={() => selectedSpace && loadMessages(selectedSpace.name)}
                      disabled={isLoadingMessages}
                      className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                      title="বার্তা রিফ্রেশ করুন"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoadingMessages ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 max-h-[420px] bg-slate-50/30 dark:bg-slate-950/20">
                  {isLoadingMessages ? (
                    <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                      <span>গুগল চ্যাট বার্তা লোড করা হচ্ছে...</span>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 space-y-2">
                      <MessageSquare className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
                      <p className="text-xs font-semibold">এই স্পেসে এখনো কোনো বার্তা পাঠানো হয়নি।</p>
                      <p className="text-[11px] text-slate-400">নিচের বক্স থেকে প্রথম অফিশিয়াল বার্তা বা প্রত্যয়নপত্র শেয়ার করুন।</p>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isMe = msg.sender?.email === currentUser?.email || msg.sender?.displayName === currentUser?.displayName;
                      const senderName = msg.sender?.displayName || 'ইউপি কর্মকর্তা';
                      const formattedTime = msg.createTime 
                        ? new Date(msg.createTime).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
                        : '';
                      
                      return (
                        <div 
                          key={msg.name || index}
                          className={`flex gap-3 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                        >
                          {/* Sender Avatar */}
                          {msg.sender?.avatarUrl ? (
                            <img 
                              src={msg.sender.avatarUrl} 
                              alt={senderName} 
                              className="w-8 h-8 rounded-full shadow-sm shrink-0 mt-1" 
                            />
                          ) : (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-sm ${
                              isMe ? 'bg-emerald-800 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                            }`}>
                              {senderName.charAt(0)}
                            </div>
                          )}

                          {/* Message Bubble */}
                          <div className={`rounded-2xl p-3.5 shadow-sm text-xs leading-relaxed ${
                            isMe 
                              ? 'bg-emerald-800 text-white rounded-tr-none' 
                              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none'
                          }`}>
                            <div className="flex items-center justify-between gap-4 mb-1.5 pb-1 border-b border-black/10 dark:border-white/10 text-[10px]">
                              <span className="font-extrabold">{senderName}</span>
                              <span className="opacity-75">{formattedTime}</span>
                            </div>
                            <div className="whitespace-pre-wrap font-sans">
                              {msg.text || msg.formattedText}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Composer */}
                <form onSubmit={handleInitiateSendMessage} className="p-3 md:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder={`"${selectedSpace.displayName || 'চ্যাট স্পেস'}"-এ দাপ্তরিক বার্তা বা প্রত্যয়নপত্র নোটিফিকেশন লিখুন...`}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                    />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>প্রেরণের পূর্বে কনফার্মেশন পপআপ আসবে</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {messageInput && (
                          <button
                            type="button"
                            onClick={() => setMessageInput('')}
                            className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer"
                          >
                            মুছে ফেলুন
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={!messageInput.trim()}
                          className="flex items-center gap-2 px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>বার্তা পাঠান</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">একটি স্পেস সিলেক্ট করুন</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  বামপাশের তালিকা থেকে যেকোনো চ্যাট স্পেস বেছে নিন অথবা নতুন ইউপি পরিষদ স্পেস তৈরি করুন।
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MANDATORY USER CONFIRMATION MODAL (Workspace Integration Policy) */}
      {/* ============================================================ */}
      {confirmationModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-emerald-800 dark:text-emerald-400">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                  {confirmationModal.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  গুগল ওয়ার্কস্পেস ব্যবহারকারী সম্মতি ডায়ালগ
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {confirmationModal.description}
            </p>

            {confirmationModal.details}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
                disabled={isConfirmingAction}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                বাতিল
              </button>
              <button
                onClick={async () => {
                  setIsConfirmingAction(true);
                  try {
                    await confirmationModal.confirmAction();
                    setConfirmationModal({ ...confirmationModal, isOpen: false });
                  } finally {
                    setIsConfirmingAction(false);
                  }
                }}
                disabled={isConfirmingAction}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg transition cursor-pointer disabled:opacity-50"
              >
                {isConfirmingAction ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>প্রক্রিয়াধীন...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{confirmationModal.confirmText}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* CREATE NEW SPACE MODAL */}
      {/* ============================================================ */}
      {isCreateSpaceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-800 dark:text-emerald-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    নতুন গুগল চ্যাট স্পেস তৈরি
                  </h3>
                  <p className="text-[11px] text-slate-500">ইউপি কর্মকর্তা ও টিম চ্যানেল</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCreateSpaceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInitiateCreateSpace} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  স্পেসের নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ০২নং বহেড়াতৈল ইউপি সাধারণ পরিষদ"
                  value={newSpaceName}
                  onChange={(e) => setNewSpaceName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  বিবরণ (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: মাসিক সভা, বাজেট ও নাগরিক সেবা সমন্বয় রুম"
                  value={newSpaceDescription}
                  onChange={(e) => setNewSpaceDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* 1-Click Quick Presets */}
              <div>
                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">দ্রুত সাজেস্টেড স্পেস টাইটেল:</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '০২নং বহেড়াতৈল ইউপি সাধারণ পরিষদ সভা',
                    'ইউপি চেয়ারম্যান ও সচিবালয় টিম',
                    'জরুরি নাগরিক সেবা ও নোটিশ রুম',
                    'ইউপি সদস্য (মেম্বার) সমন্বয় রুম'
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setNewSpaceName(preset);
                        setNewSpaceDescription(`${config.upName} এর অফিশিয়াল দাপ্তরিক সমন্বয়`);
                      }}
                      className="text-[10px] px-2 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 transition cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateSpaceModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={!newSpaceName.trim() || isCreatingSpace}
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  {isCreatingSpace ? 'তৈরি হচ্ছে...' : 'স্পেস তৈরি করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MEMBERS LIST MODAL */}
      {/* ============================================================ */}
      {isMembersModalOpen && selectedSpace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-700" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                  স্পেস সদস্যবৃন্দ ({selectedSpace.displayName || selectedSpace.name})
                </h3>
              </div>
              <button 
                onClick={() => setIsMembersModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {isLoadingMembers ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  <RefreshCw className="w-4 h-4 animate-spin mx-auto text-emerald-600 mb-1" />
                  <span>সদস্য তালিকা লোড হচ্ছে...</span>
                </div>
              ) : members.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  কোনো সদস্য তালিকা পাওয়া যায়নি।
                </div>
              ) : (
                members.map((mem, idx) => (
                  <div key={mem.name || idx} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-[11px]">
                        {mem.member?.displayName?.charAt(0) || 'M'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{mem.member?.displayName || 'সদস্য'}</p>
                        <p className="text-[10px] text-slate-500">{mem.role === 'ROLE_MANAGER' ? 'স্পেস ম্যানেজার / এডমিন' : 'সদস্য'}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400">
                      {mem.role || 'MEMBER'}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setIsMembersModalOpen(false)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
