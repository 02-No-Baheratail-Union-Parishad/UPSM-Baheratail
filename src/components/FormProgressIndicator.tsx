import React from 'react';
import { User, FileText, CheckCircle2, Check, Sparkles } from 'lucide-react';

export interface FormProgressIndicatorProps {
  personalCompleted: boolean;
  detailsCompleted: boolean;
  declarationCompleted: boolean;
  onStepClick?: (stepId: 'personal' | 'details' | 'declaration') => void;
  selectedTypeLabel?: string;
}

export const FormProgressIndicator: React.FC<FormProgressIndicatorProps> = ({
  personalCompleted,
  detailsCompleted,
  declarationCompleted,
  onStepClick,
  selectedTypeLabel
}) => {
  const steps = [
    {
      id: 'personal' as const,
      title: '১. ব্যক্তিগত তথ্যাবলী',
      subtitle: 'নাম, পিতা-মাতা, ঠিকানা ও NID',
      icon: User,
      isCompleted: personalCompleted
    },
    {
      id: 'details' as const,
      title: '২. সনদের বিবরণী',
      subtitle: selectedTypeLabel ? `${selectedTypeLabel}` : 'সনদের ধরণ ও অতিরিক্ত ফিল্ড',
      icon: FileText,
      isCompleted: detailsCompleted
    },
    {
      id: 'declaration' as const,
      title: '৩. ঘোষণা ও ফি',
      subtitle: 'MFS পেমেন্ট, ইস্যু ও চূড়ান্ত জমা',
      icon: CheckCircle2,
      isCompleted: declarationCompleted
    }
  ];

  const completedCount = [personalCompleted, detailsCompleted, declarationCompleted].filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 3) * 100);

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-4 sm:p-5 space-y-4">
      {/* Top Title & Percentage */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-100 text-emerald-900 rounded-xl shrink-0">
            <Sparkles className="w-5 h-5 text-emerald-800" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>ফরম পূরণের অগ্রগতি</span>
              <span className="text-[11px] font-medium text-slate-500">(Section Tracker)</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              সনদ তৈরির জন্য প্রতিটি ধাপের প্রয়োজনীয় তথ্য প্রদান করুন
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-extrabold text-emerald-900 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
            {completedCount} / ৩ ধাপ সম্পন্ন ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* Progress Bar Line */}
      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
        <div 
          className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 h-full transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progressPercent === 0 ? 4 : progressPercent}%` }}
        />
      </div>

      {/* Step Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepClick && onStepClick(step.id)}
              className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-start gap-3 relative overflow-hidden group ${
                step.isCompleted
                  ? 'bg-emerald-50/70 border-emerald-300 hover:border-emerald-500'
                  : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Step Icon Badge */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold transition-all ${
                  step.isCompleted
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300'
                }`}
              >
                {step.isCompleted ? (
                  <Check className="w-5 h-5 text-amber-300" />
                ) : (
                  <Icon className="w-4.5 h-4.5" />
                )}
              </div>

              {/* Step Text Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h4
                    className={`text-xs font-extrabold truncate ${
                      step.isCompleted ? 'text-emerald-950' : 'text-slate-800'
                    }`}
                  >
                    {step.title}
                  </h4>
                  {step.isCompleted && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                      সম্পন্ন
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {step.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
