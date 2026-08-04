import React, { useState } from 'react';
import { Camera, Upload, X, Loader2, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { NidScanResult } from '../types';

interface NidScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAutoFill: (result: NidScanResult) => void;
}

export const NidScannerModal: React.FC<NidScannerModalProps> = ({ isOpen, onClose, onAutoFill }) => {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'info' | 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (side === 'front') setFrontImage(base64);
      else setBackImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleScan = async () => {
    if (!frontImage) {
      setStatusMsg({ type: 'error', text: 'অনুগ্রহ করে NID-এর সামনের পৃষ্ঠার ছবি নির্বাচন করুন।' });
      return;
    }

    setLoading(true);
    setStatusMsg({ type: 'info', text: 'Gemini AI Vision ছবি পর্যবেক্ষণ ও বাংলা লেখা বিশ্লেষণ করিতেছে...' });

    try {
      const response = await fetch('/api/certificate/scan-nid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frontImageBase64: frontImage,
          backImageBase64: backImage || undefined
        })
      });

      const resData = await response.json();

      if (resData.success && resData.data) {
        setStatusMsg({ type: 'success', text: '✅ NID তথ্য সফলভাবে পাওয়া গিয়াছে! ফর্ম পূরণ করা হইল।' });
        setTimeout(() => {
          onAutoFill(resData.data);
          onClose();
        }, 800);
      } else {
        setStatusMsg({ type: 'error', text: resData.error || 'NID স্ক্যান ব্যর্থ হইয়াছে। অনুগ্রহ করে ঝাপসা ছবি পরিবর্তন করিয়া চেষ্টা করুন।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'সার্ভার সংযোগে ত্রুটি: ' + (err?.message || 'চেষ্টা করুন') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-emerald-100">
        {/* Header */}
        <div className="bg-emerald-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-lg">📸 NID / স্মার্টকার্ড এআই স্ক্যানার</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-emerald-200 hover:text-white p-1 rounded-full hover:bg-emerald-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100 leading-relaxed">
            জাতীয় পরিচয়পত্র (NID) এর সামনের ও পিছনের পৃষ্ঠার ছবি আপলোড করিলে Gemini Vision AI স্বয়ংক্রিয়ভাবে নাম, পিতা/মাতার নাম ও ঠিকানা এক্সট্র্যাক্ট করিয়া ফর্মে বসাইয়া দিবে।
          </p>

          <div className="grid grid-cols-2 gap-3">
            {/* Front Side */}
            <div className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-xl p-3 text-center bg-slate-50 transition flex flex-col items-center justify-center min-h-[140px] relative">
              {frontImage ? (
                <div className="relative w-full h-full">
                  <img src={frontImage} alt="Front NID" className="w-full h-28 object-cover rounded-lg" />
                  <button 
                    onClick={() => setFrontImage(null)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow hover:bg-red-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-1.5 py-4">
                  <Camera className="w-7 h-7 text-emerald-700" />
                  <span className="text-xs font-semibold text-slate-700">সামনের পৃষ্ঠা (আবশ্যক)</span>
                  <span className="text-[10px] text-slate-400">ছবি বাছাই করুন</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileChange(e, 'front')} 
                    className="hidden" 
                  />
                </label>
              )}
            </div>

            {/* Back Side */}
            <div className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-xl p-3 text-center bg-slate-50 transition flex flex-col items-center justify-center min-h-[140px] relative">
              {backImage ? (
                <div className="relative w-full h-full">
                  <img src={backImage} alt="Back NID" className="w-full h-28 object-cover rounded-lg" />
                  <button 
                    onClick={() => setBackImage(null)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow hover:bg-red-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-1.5 py-4">
                  <Upload className="w-7 h-7 text-emerald-700" />
                  <span className="text-xs font-semibold text-slate-700">পিছনের পৃষ্ঠা (ঐচ্ছিক)</span>
                  <span className="text-[10px] text-slate-400">ঠিকানার পৃষ্ঠা</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileChange(e, 'back')} 
                    className="hidden" 
                  />
                </label>
              )}
            </div>
          </div>

          {/* Status Message */}
          {statusMsg && (
            <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
              statusMsg.type === 'error' 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : statusMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              {statusMsg.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />}
              {statusMsg.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />}
              {statusMsg.type === 'info' && <Loader2 className="w-4 h-4 shrink-0 animate-spin text-blue-600" />}
              <span>{statusMsg.text}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition cursor-pointer"
          >
            বাতিল
          </button>
          <button
            onClick={handleScan}
            disabled={loading || !frontImage}
            className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-md transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>পড়া হইতেছে...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>এআই দিয়ে তথ্য পড়ুন</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
