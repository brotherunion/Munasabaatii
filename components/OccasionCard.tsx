import React, { useState } from 'react';
import { Occasion } from '../types';
import { RELATIONSHIP_ICONS, getCategoryStyle, getReminderOption, isOccasionDueForReminder } from '../constants';
import { generateCongratulation, GreetingTone } from '../services/geminiService';

interface OccasionCardProps {
  occasion: Occasion;
  onEdit: (occasion: Occasion) => void;
  onDelete: (id: string) => void;
  isUpcoming: boolean;
  onViewDetails?: (occasion: Occasion) => void;
  onGenerateCongratulation?: (occasion: Occasion) => void;
}

const TONES: { id: GreetingTone; label: string; icon: string }[] = [
  { id: 'warm', label: 'دافئة ومحبة', icon: '❤️' },
  { id: 'formal', label: 'رسمية واحترافية', icon: '👔' },
  { id: 'funny', label: 'مرحة ولطيفة', icon: '😄' },
  { id: 'poetic', label: 'شعرية بليغة', icon: '✨' },
  { id: 'short', label: 'سريعة وموجزة', icon: '⚡' },
];

const OccasionCard: React.FC<OccasionCardProps> = ({
  occasion,
  onEdit,
  onDelete,
  isUpcoming,
  onViewDetails,
  onGenerateCongratulation,
}) => {
  const [congratulation, setCongratulation] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<GreetingTone>('warm');
  const [showToneSelector, setShowToneSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const reminderStatus = isOccasionDueForReminder(occasion);
  const reminderOpt = getReminderOption(occasion.reminderTiming);
  const isAlertActive = isUpcoming || reminderStatus.isDue;

  const handleGenerateText = async (toneToUse: GreetingTone = selectedTone) => {
    setIsLoading(true);
    try {
      const result = await generateCongratulation(occasion, toneToUse);
      setCongratulation(result.text);
    } catch (e) {
      console.error(e);
      setCongratulation(`ألف مبارك يا ${occasion.personName} بمناسبة ${occasion.occasionType}! نسأل الله لك دوام التوفيق والنجاح. 🎉`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!congratulation) return;
    navigator.clipboard.writeText(congratulation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (!congratulation) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `تهنئة ${occasion.title}`,
          text: congratulation,
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fallback to whatsapp
      }
    }
    handleWhatsAppShare();
  };

  const handleWhatsAppShare = () => {
    if (!congratulation) return;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(congratulation)}`;
    window.open(url, '_blank');
  };

  const formattedDate = new Date(occasion.date).toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className={`relative bg-white p-6 rounded-3xl border transition-all duration-300 ${
      isAlertActive 
        ? 'border-amber-300 ring-4 ring-amber-50/70 shadow-lg' 
        : 'border-slate-100 shadow-sm hover:shadow-md'
    }`}>
      {/* شارة التنبيه النشط بحسب توقيت التنبيه المسبق المحدد */}
      {isAlertActive && (
        <div className={`absolute top-4 left-4 ${reminderStatus.statusBadge.bg} ${reminderStatus.statusBadge.textColor} text-xs px-3 py-1 rounded-full font-bold shadow-sm animate-pulse flex items-center gap-1.5`}>
          <span>🔔</span>
          <span>{reminderStatus.statusBadge.text}</span>
        </div>
      )}
      
      {/* Header Info - Clickable for full details */}
      <div 
        onClick={() => onViewDetails?.(occasion)}
        className="flex justify-between items-start mb-4 cursor-pointer group/header"
        title="اضغط لعرض تفاصيل المناسبة بالكامل"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl shadow-sm group-hover/header:scale-105 transition-transform">
            {RELATIONSHIP_ICONS[occasion.relationship] || '✨'}
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800 leading-tight group-hover/header:text-indigo-600 transition-colors flex items-center gap-1.5">
              <span>{occasion.title}</span>
              <span className="text-slate-300 group-hover/header:text-indigo-400 text-xs transition-colors">👁️</span>
            </h3>
            <p className="text-indigo-600 text-xs font-bold mt-0.5">
              {occasion.personName} <span className="text-slate-400 font-normal">({occasion.relationship})</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {occasion.sourcePlatform === 'instagram' && (
            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-xl font-bold bg-gradient-to-r from-purple-50 to-pink-50 text-pink-700 border border-pink-200">
              <span>📸</span>
              <span>إنستغرام</span>
            </span>
          )}
          {occasion.sourcePlatform === 'facebook' && (
            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-xl font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <span>📘</span>
              <span>فيسبوك</span>
            </span>
          )}
          {(() => {
            const style = getCategoryStyle(occasion.category);
            return (
              <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-xl font-bold border ${style.bg} ${style.text} ${style.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
                <span>{occasion.category}</span>
              </span>
            );
          })()}
        </div>
      </div>

      {/* Date & Occasion Type & Configured Reminder Timing */}
      <div className="flex flex-wrap items-center gap-2 text-slate-500 text-xs mb-4">
        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formattedDate}</span>
        </div>
        <div className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg font-semibold">
          {occasion.occasionType}
        </div>
        
        {/* شارة توقيت التنبيه المسبق المحدد لهذه المناسبة */}
        <div 
          className="flex items-center gap-1 bg-amber-50/80 text-amber-800 border border-amber-200/80 px-2.5 py-1 rounded-lg font-bold"
          title={`توقيت التنبيه المسبق المضبوط: ${reminderOpt.label}`}
        >
          <span>{reminderOpt.icon}</span>
          <span>تنبيه: {reminderOpt.shortLabel}</span>
        </div>
      </div>

      {occasion.notes && (
        <div className="text-slate-600 text-xs mb-4 bg-slate-50/80 p-3 rounded-2xl border border-slate-100 flex items-start gap-2">
          <span className="text-slate-400 text-sm">📝</span>
          <p className="leading-relaxed italic">{occasion.notes}</p>
        </div>
      )}

      {/* صندوق التهنئة المخصصة بالذكاء الاصطناعي */}
      {congratulation && (
        <div className="mb-4 p-4 bg-gradient-to-br from-indigo-50/90 via-purple-50/50 to-pink-50/40 border border-indigo-100 rounded-2xl text-xs text-slate-800 relative shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-indigo-700 font-bold">
              <span>✨</span>
              <span>تهنئة ذكية مخصصة لـ {occasion.personName}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopy}
                className="text-indigo-600 hover:text-indigo-800 bg-white px-2 py-1 rounded-lg border border-indigo-100 flex items-center gap-1 font-bold text-[11px] transition-all"
                title="نسخ التهنئة"
              >
                {copied ? '✓ تم النسخ' : '📋 نسخ'}
              </button>
              <button
                onClick={handleNativeShare}
                className="text-blue-700 hover:text-blue-900 bg-white px-2 py-1 rounded-lg border border-blue-100 flex items-center gap-1 font-bold text-[11px] transition-all"
                title="مشاركة عبر تطبيقات الهاتف (واتساب، تيليجرام، رسائل...)"
              >
                <span>📲</span>
                <span>مشاركة</span>
              </button>
              <button
                onClick={handleWhatsAppShare}
                className="text-emerald-700 hover:text-emerald-900 bg-white px-2 py-1 rounded-lg border border-emerald-100 flex items-center gap-1 font-bold text-[11px] transition-all"
                title="إرسال مباشر عبر واتساب"
              >
                <span>💬</span>
                <span>واتساب</span>
              </button>
            </div>
          </div>

          <p className="leading-relaxed text-slate-700 text-sm whitespace-pre-line py-1 font-medium">
            "{congratulation}"
          </p>

          <div className="flex justify-between items-center mt-3 pt-2 border-t border-indigo-100/60 text-[10px] text-slate-400">
            <span>نوع المناسبة: {occasion.occasionType}</span>
            <button
              onClick={() => handleGenerateText()}
              disabled={isLoading}
              className="text-indigo-600 hover:underline font-bold flex items-center gap-1"
            >
              <span>🔄</span>
              <span>توليد صياغة أخرى</span>
            </button>
          </div>
        </div>
      )}

      {/* خيارات نبرة التهنئة (إذا تم فتحها) */}
      {showToneSelector && (
        <div className="mb-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[11px] font-bold text-slate-600 mb-2">اختر نبرة التهنئة:</p>
          <div className="flex flex-wrap gap-1.5">
            {TONES.map(t => (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedTone(t.id);
                  setShowToneSelector(false);
                  handleGenerateText(t.id);
                }}
                className={`text-xs px-2.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
                  selectedTone === t.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* أزرار الإجراءات */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
        <button
          onClick={() => {
            if (onGenerateCongratulation) {
              onGenerateCongratulation(occasion);
            } else {
              handleGenerateText();
            }
          }}
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold py-2.5 px-3 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-sm shadow-indigo-100 disabled:opacity-50 active:scale-95"
          title="توليد رسالة تهنئة احترافية باستخدام الذكاء الاصطناعي"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>جاري الصياغة...</span>
            </>
          ) : (
            <>
              <span className="text-sm">✨</span>
              <span>توليد تهنئة</span>
            </>
          )}
        </button>

        {/* زر عرض تفاصيل المناسبة */}
        <button
          onClick={() => onViewDetails?.(occasion)}
          className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1 text-xs font-bold"
          title="عرض تفاصيل المناسبة بالكامل"
        >
          <span>👁️</span>
          <span className="hidden sm:inline">التفاصيل</span>
        </button>

        {/* زر ضبط النبرة */}
        <button
          onClick={() => setShowToneSelector(!showToneSelector)}
          className={`p-2.5 rounded-2xl border transition-all text-xs font-bold flex items-center gap-1 ${
            showToneSelector ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-600'
          }`}
          title="تغيير أسلوب ونبرة التهنئة"
        >
          <span>🎭</span>
          <span className="hidden sm:inline">نبرة</span>
        </button>

        {/* تعديل */}
        <button
          onClick={() => onEdit(occasion)}
          className="p-2.5 rounded-2xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          title="تعديل المناسبة"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        {/* حذف */}
        <button
          onClick={() => onDelete(occasion.id)}
          className="p-2.5 rounded-2xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="حذف المناسبة"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default OccasionCard;
