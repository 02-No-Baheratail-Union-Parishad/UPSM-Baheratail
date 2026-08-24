import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  Mic, 
  MicOff, 
  Send, 
  X, 
  Bot, 
  User, 
  Loader2, 
  HelpCircle, 
  FileText, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  RefreshCw,
  Zap,
  Building2,
  ChevronRight,
  Sliders
} from 'lucide-react';
import { UnionParishadConfig } from '../types';
import { sanitizeInput } from '../utils/security';

interface AiCitizenAssistantProps {
  config: UnionParishadConfig;
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  mode?: string;
  suggestedAction?: {
    label: string;
    tab: string;
  };
}

export type OperatingMode = 'ASSIST MODE' | 'DATA MODE' | 'VERIFY MODE' | 'DRAFT MODE' | 'COPY-READY MODE';

export const AiCitizenAssistant: React.FC<AiCitizenAssistantProps> = ({
  config,
  isOpen,
  onClose,
  onNavigateTab
}) => {
  const [selectedMode, setSelectedMode] = useState<OperatingMode>('DRAFT MODE');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'assistant',
      text: `আসসালামু আলাইকুম! আমি **${config.upName}**-এর অফিশিয়াল সার্ভিস অপারেটিং সিস্টেম এআই সহকারী (UPSM 2.0 Engine)। \n\nআমি আপনাকে ৪৭টি ডিজিটাল প্রত্যয়নপত্র জেনারেশন, তথ্য ভ্যালিডেশন, ওয়ারিশন টেবিল প্রস্তুত এবং অনলাইন সত্যায়নে সহায়তা করতে পারি।`,
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      mode: 'DRAFT MODE',
      suggestedAction: {
        label: 'নতুন সনদ ড্রাফট করুন',
        tab: 'create'
      }
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'bn-BD';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('আপনার ব্রাউজারে বাংলা ভয়েস রেকর্ডার সমর্থিত নয়। অনুগ্রহ করে টাইপ করুন।');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Speech recognition start failed:', e);
      }
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const cleanText = text.replace(/[*#_`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'bn-BD';
      utterance.rate = 0.95;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const rawQuery = (textToSend || inputText).trim();
    if (!rawQuery) return;
    const query = sanitizeInput(rawQuery, 1000);

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          mode: selectedMode,
          history: messages.slice(-6).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          }))
        })
      });

      const data = await response.json();

      let replyText = data.reply || 'দুঃখিত, কোনো উত্তর পাওয়া যায় নাই। পুনরায় চেষ্টা করুন।';
      let action: { label: string; tab: string } | undefined = undefined;

      const lower = query.toLowerCase();
      if (lower.includes('আবেদন') || lower.includes('সনদ বানাব') || lower.includes('তৈরি')) {
        action = { label: 'সনদ ফরম খুলুন', tab: 'create' };
      } else if (lower.includes('যাচাই') || lower.includes('কিউআর') || lower.includes('সত্যতা')) {
        action = { label: 'ভেরিফিকেশন পোর্টালে যান', tab: 'verify' };
      } else if (lower.includes('চেয়ারম্যান') || lower.includes('অনুমোদন') || lower.includes('পেন্ডিং')) {
        action = { label: 'অনুমোদন লিস্ট দেখুন', tab: 'pending' };
      } else if (lower.includes('সদস্য') || lower.includes('সচিব') || lower.includes('যোগাযোগ')) {
        action = { label: 'পরিষদ সদস্যবৃন্দ', tab: 'members' };
      }

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        mode: selectedMode,
        timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: action
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: 'Gemini AI সার্ভার সংযোগে সাময়িক সমস্যা ঘটিয়াছে। দয়া করে আপনার প্রশ্নটি আবার টাইপ করুন।',
        timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'ওয়ারিশ সনদের জন্য কী কী ফাইল লাগবে?',
    'ট্রেড লাইসেন্স ও চারিত্রিক সনদের সরকারি ফি কত?',
    'বহেড়াতৈল ইউনিয়নের ২০টি গ্রামের তালিকা',
    'অনলাইন যাচাইকরণের স্মারক নম্বর পরীক্ষা'
  ];

  const operatingModes: OperatingMode[] = [
    'ASSIST MODE',
    'DATA MODE',
    'VERIFY MODE',
    'DRAFT MODE',
    'COPY-READY MODE'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full h-[88vh] md:h-[680px] flex flex-col shadow-2xl border border-emerald-800/40 overflow-hidden relative">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-emerald-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center shadow-lg font-black shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white leading-tight">
                  UPSM 2.0 Gemini AI চালিত প্রশাসনিক সহকারী
                </h3>
                <span className="bg-emerald-800 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-700">
                  Live Engine
                </span>
              </div>
              <p className="text-[11px] text-emerald-200">
                {config.upName} (সখিপুর, টাঙ্গাইল) — ৪৭টি সনদ ও অটোমেশন চালিত
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setMessages([messages[0]]);
              }}
              title="চ্যাট রিসেট করুন"
              className="p-2 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Operating Modes Selection Bar */}
        <div className="bg-emerald-950 px-3 py-2 border-b border-emerald-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-white">
          <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1 whitespace-nowrap mr-1">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>অপারেটিং মোড:</span>
          </span>
          {operatingModes.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setSelectedMode(m)}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition whitespace-nowrap shrink-0 cursor-pointer ${
                selectedMode === m
                  ? 'bg-amber-400 text-emerald-950 border-amber-300 shadow-sm'
                  : 'bg-emerald-900/60 text-emerald-200 border-emerald-700 hover:bg-emerald-800'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Quick Prompts Bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-2.5 px-4 overflow-x-auto flex items-center gap-2 no-scrollbar shrink-0">
          <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>দ্রুত কমান্ড:</span>
          </span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              disabled={isLoading}
              className="text-[11px] font-semibold bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 px-3 py-1 rounded-full border border-slate-200 hover:border-emerald-300 transition whitespace-nowrap shrink-0 shadow-sm cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chat Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-100/60">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[88%] ${
                m.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow ${
                  m.sender === 'user'
                    ? 'bg-emerald-800 text-amber-300'
                    : 'bg-gradient-to-br from-amber-400 to-amber-500 text-emerald-950'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl space-y-2 text-xs md:text-sm leading-relaxed shadow-sm ${
                  m.sender === 'user'
                    ? 'bg-emerald-800 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                }`}
              >
                {m.mode && m.sender === 'assistant' && (
                  <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 uppercase tracking-wider mb-1">
                    {m.mode}
                  </span>
                )}

                <div className="whitespace-pre-wrap font-sans">
                  {m.text}
                </div>

                {m.sender === 'assistant' && (
                  <div className="pt-1 flex items-center justify-between border-t border-slate-100 text-[10px] text-slate-400">
                    <button
                      onClick={() => speakText(m.text)}
                      className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {isSpeaking ? <VolumeX className="w-3 h-3 text-red-500" /> : <Volume2 className="w-3 h-3" />}
                      <span>{isSpeaking ? 'থামুন' : 'বাংলায় শুনুন'}</span>
                    </button>
                    <span>{m.timestamp}</span>
                  </div>
                )}

                {m.suggestedAction && onNavigateTab && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        onNavigateTab(m.suggestedAction!.tab);
                        onClose();
                      }}
                      className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{m.suggestedAction.label}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 max-w-[80%] mr-auto items-center">
              <div className="w-8 h-8 rounded-full bg-amber-400 text-emerald-950 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white p-3 rounded-2xl border border-slate-200 text-slate-500 text-xs flex items-center gap-2 shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                <span>[{selectedMode}] তথ্য বিশ্লেষণ ও প্রমিত বাংলা ড্রাফট প্রস্তুত হইতেছে...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Voice & Text Input Footer */}
        <div className="bg-white p-3 border-t border-slate-200 shrink-0 space-y-2">
          {isListening && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-2 text-center text-xs text-amber-900 font-bold animate-pulse flex items-center justify-center gap-2">
              <Mic className="w-4 h-4 text-red-600 animate-bounce" />
              <span>আপনার কথা রেকর্ড করা হইতেছে... স্পষ্টভাবে বাংলায় বলুন।</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={toggleListening}
              disabled={isLoading}
              className={`p-3 rounded-2xl transition cursor-pointer shadow flex items-center justify-center shrink-0 ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-slate-100 hover:bg-emerald-100 text-emerald-800 border border-slate-300'
              }`}
              title={isListening ? 'রেকর্ডিং থামান' : 'বাংলা ভয়েস টাইপিং শুরু করুন'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder={`[${selectedMode}] টাইপ করুন বা কমান্ড দিন...`}
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs md:text-sm text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputText.trim()}
              className="p-3 bg-emerald-800 hover:bg-emerald-900 text-amber-300 rounded-2xl transition cursor-pointer disabled:opacity-50 shadow shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
