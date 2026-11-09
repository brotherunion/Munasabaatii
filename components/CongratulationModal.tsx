import React, { useState, useEffect, useRef } from 'react';
import { Occasion, UserProfile } from '../types';
import { generateCongratulation, GreetingTone } from '../services/geminiService';
import { useScrollLock } from '../hooks/useScrollLock';

interface CongratulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  occasion: Occasion | null;
  currentUser?: UserProfile | null;
}

export type CardTemplateId = 'classic' | 'playful' | 'formal' | 'royal' | 'floral';

interface CardTemplate {
  id: CardTemplateId;
  name: string;
  icon: string;
  badgeLabel: string;
  containerBg: string;
  borderStyle: string;
  textColor: string;
  badgeStyle: string;
  signatureStyle: string;
  accentColor: string;
  cornerIcon: string;
}

const TEMPLATES: Record<CardTemplateId, CardTemplate> = {
  classic: {
    id: 'classic',
    name: 'كلاسيكي',
    icon: '📜',
    badgeLabel: 'طابع كلاسيكي أصيل',
    containerBg: 'bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50',
    borderStyle: 'border-2 border-amber-300 shadow-amber-900/10',
    textColor: 'text-stone-900',
    badgeStyle: 'bg-amber-100 text-amber-900 border border-amber-300',
    signatureStyle: 'text-amber-800 border-amber-200/80',
    accentColor: '#d97706',
    cornerIcon: '⚜️'
  },
  playful: {
    id: 'playful',
    name: 'مرح واحتفالي',
    icon: '🎈',
    badgeLabel: 'تصميم مبهج وملون',
    containerBg: 'bg-gradient-to-br from-pink-500 via-rose-500 to-amber-400',
    borderStyle: 'border-2 border-white/40 shadow-pink-500/25',
    textColor: 'text-white',
    badgeStyle: 'bg-white/20 text-white border border-white/30 backdrop-blur-sm',
    signatureStyle: 'text-white/95 border-white/20',
    accentColor: '#ec4899',
    cornerIcon: '🎉'
  },
  formal: {
    id: 'formal',
    name: 'رسمي ووقور',
    icon: '👔',
    badgeLabel: 'أسلوب رسمي واحترافي',
    containerBg: 'bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950',
    borderStyle: 'border-2 border-slate-600/60 shadow-slate-900/30',
    textColor: 'text-slate-100',
    badgeStyle: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
    signatureStyle: 'text-indigo-300 border-slate-700',
    accentColor: '#6366f1',
    cornerIcon: '💼'
  },
  royal: {
    id: 'royal',
    name: 'ملكي فاخر',
    icon: '👑',
    badgeLabel: 'فخامة ملكية مذهبة',
    containerBg: 'bg-gradient-to-br from-neutral-950 via-zinc-900 to-neutral-900',
    borderStyle: 'border-2 border-amber-400/90 shadow-amber-500/20',
    textColor: 'text-amber-50',
    badgeStyle: 'bg-amber-400/15 text-amber-300 border border-amber-400/40',
    signatureStyle: 'text-amber-300 border-amber-400/20',
    accentColor: '#f59e0b',
    cornerIcon: '✨'
  },
  floral: {
    id: 'floral',
    name: 'زهري رقيق',
    icon: '🌸',
    badgeLabel: 'طابع زهري رومانسي',
    containerBg: 'bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50',
    borderStyle: 'border-2 border-rose-200/90 shadow-rose-500/10',
    textColor: 'text-rose-950',
    badgeStyle: 'bg-rose-100 text-rose-800 border border-rose-200',
    signatureStyle: 'text-rose-700 border-rose-200/60',
    accentColor: '#f43f5e',
    cornerIcon: '💐'
  }
};

const TONES: { id: GreetingTone; label: string; icon: string }[] = [
  { id: 'warm', label: 'دافئة ومحبة', icon: '❤️' },
  { id: 'formal', label: 'رسمية ووقورة', icon: '👔' },
  { id: 'funny', label: 'مرحة ولطيفة', icon: '😄' },
  { id: 'poetic', label: 'شعرية بليغة', icon: '✨' },
  { id: 'short', label: 'سريعة وموجزة', icon: '⚡' },
];

export const CongratulationModal: React.FC<CongratulationModalProps> = ({
  isOpen,
  onClose,
  occasion,
  currentUser,
}) => {
  const [congratulation, setCongratulation] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<GreetingTone>('warm');
  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplateId>('classic');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState<boolean>(true);
  const cardRef = useRef<HTMLDivElement>(null);

  useScrollLock(isOpen);

  // توليد التهنئة عند فتح المودال لأول مرة
  useEffect(() => {
    if (isOpen && occasion) {
      setCopied(false);
      handleGenerate(selectedTone);
    }
  }, [isOpen, occasion?.id]);

  // إغلاق المودال بزر Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleGenerate = async (toneToUse: GreetingTone = selectedTone) => {
    if (!occasion) return;
    setIsLoading(true);
    setCopied(false);
    try {
      const result = await generateCongratulation(occasion, toneToUse);
      setCongratulation(result.text);
      setIsAiGenerated(result.isAiGenerated ?? true);
    } catch (e) {
      console.error(e);
      setCongratulation(
        `ألف مبارك يا ${occasion.personName} بمناسبة ${occasion.occasionType}! نسأل الله لك دوام التوفيق والنجاح والأفراح الدائمة. 🎉`
      );
      setIsAiGenerated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const currentTpl = TEMPLATES[selectedTemplate];

  const getFullMessageWithSignature = () => {
    if (!congratulation) return '';
    const templateName = currentTpl.name;
    const signature = currentUser?.displayName
      ? `— أصدق التهاني من: ${currentUser.displayName} (${currentUser.username})`
      : '';
    return `[بطاقة تهنئة بنمط ${templateName}]\n\n${congratulation}\n\n${signature}`.trim();
  };

  const handleCopy = () => {
    const textToCopy = getFullMessageWithSignature();
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    const textToShare = getFullMessageWithSignature();
    if (!textToShare || !occasion) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `بطاقة تهنئة ${occasion.title}`,
          text: textToShare,
        });
        return;
      } catch (err) {
        // User cancelled or share not supported
      }
    }
    handleWhatsAppShare();
  };

  const handleWhatsAppShare = () => {
    const textToShare = getFullMessageWithSignature();
    if (!textToShare) return;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(textToShare)}`;
    window.open(url, '_blank');
  };

  const handleInstagramShare = () => {
    handleCopy();
    window.open('https://www.instagram.com/direct/inbox/', '_blank');
  };

  const handleFacebookShare = () => {
    const textToShare = getFullMessageWithSignature();
    const url = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(textToShare)}`;
    window.open(url, '_blank');
  };

  // تصدير وتحميل بطاقة التهنئة كصورة ملونة عالية الدقة فوراً
  const handleDownloadCardImage = () => {
    if (!congratulation || !occasion) return;

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. رسم خلفية القالب
    const bgGradients: Record<CardTemplateId, [string, string]> = {
      classic: ['#fffbeb', '#fef3c7'],
      playful: ['#ec4899', '#f59e0b'],
      formal: ['#0f172a', '#1e1b4b'],
      royal: ['#0a0a0a', '#1c1917'],
      floral: ['#fff1f2', '#fce7f3'],
    };

    const [c1, c2] = bgGradients[selectedTemplate];
    const grad = ctx.createLinearGradient(0, 0, 800, 600);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 600);

    // 2. إطار مزخرف
    ctx.strokeStyle = selectedTemplate === 'royal' ? '#fbbf24' : selectedTemplate === 'playful' ? '#ffffff' : '#d97706';
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, 740, 540);

    ctx.strokeStyle = selectedTemplate === 'royal' ? 'rgba(251, 191, 36, 0.4)' : 'rgba(217, 119, 6, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(42, 42, 716, 516);

    // 3. كتابة النصوص باللغة العربية
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';

    // عنوان المناسبة
    ctx.fillStyle = selectedTemplate === 'formal' || selectedTemplate === 'royal' || selectedTemplate === 'playful' ? '#ffffff' : '#451a03';
    ctx.font = 'bold 32px Cairo, sans-serif';
    ctx.fillText(`${occasion.title}`, 400, 110);

    // نوع المناسبة والشخص
    ctx.font = 'bold 22px Cairo, sans-serif';
    ctx.fillStyle = selectedTemplate === 'royal' ? '#fcd34d' : selectedTemplate === 'playful' ? '#fef08a' : '#b45309';
    ctx.fillText(`إلى العزيز: ${occasion.personName}`, 400, 155);

    // نص التهنئة (تقسيم الأسطر)
    ctx.fillStyle = selectedTemplate === 'formal' || selectedTemplate === 'royal' || selectedTemplate === 'playful' ? '#ffffff' : '#1c1917';
    ctx.font = '24px Cairo, sans-serif';

    const words = congratulation.split(' ');
    let line = '';
    let y = 230;
    const maxWidth = 640;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, 400, y);
        line = words[n] + ' ';
        y += 40;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 400, y);

    // توقيع المرسل
    if (currentUser?.displayName) {
      ctx.font = 'bold 20px Cairo, sans-serif';
      ctx.fillStyle = selectedTemplate === 'royal' ? '#fbbf24' : selectedTemplate === 'playful' ? '#ffffff' : '#92400e';
      ctx.fillText(`مع خالص المحبة والتقدير: ${currentUser.displayName} (${currentUser.username})`, 400, 520);
    }

    // تنزيل الصورة
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `بطاقة_تهنئة_${occasion.personName}.png`;
    a.click();
  };

  if (!isOpen || !occasion) return null;

  return (
    <div
      className="fixed inset-0 z-[150] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="congratulation-modal-title"
    >
      <div
        className="bg-white rounded-[2.5rem] max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative text-right animate-in zoom-in-95 duration-200 border border-slate-100 max-h-[92vh] overflow-y-auto select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 p-2 rounded-2xl hover:bg-slate-100 transition-all"
          title="إغلاق النافذة"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* رأس المودال مع تفاصيل المناسبة */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-2xl shadow-lg shadow-indigo-100">
            ✨
          </div>
          <div>
            <h2 id="congratulation-modal-title" className="text-xl sm:text-2xl font-black text-slate-800">
              بطاقة تهنئة ذكية وقوالب تصميم جاهزة
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              اختر نمط التصميم المفضل لديك (كلاسيكي، مرح، رسمي، ملكي) لصياغة بطاقة أنيقة قبل مشاركتها.
            </p>
          </div>
        </div>

        {/* 1. اختيار نمط وقالب التصميم (الميزة المطلوبة: كلاسيكي، مرح، رسمي...) */}
        <div className="mb-5 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <span>🎨</span>
              <span>اختر قالب التصميم المرئي للبطاقة:</span>
            </label>
            <span className="text-[11px] font-bold text-indigo-600">
              {currentTpl.name} ({currentTpl.icon})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {(Object.values(TEMPLATES) as CardTemplate[]).map((tpl) => {
              const isSelected = selectedTemplate === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplate(tpl.id)}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 active:scale-95 ${
                    isSelected
                      ? 'bg-white ring-2 ring-indigo-600 border-indigo-600 shadow-md shadow-indigo-100 scale-102'
                      : 'bg-white/80 hover:bg-white border-slate-200/80 hover:border-slate-300 opacity-80 hover:opacity-100'
                  }`}
                >
                  <span className="text-xl">{tpl.icon}</span>
                  <span className="text-xs font-bold text-slate-800">{tpl.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. محدد نبرة التهنئة بالذكاء الاصطناعي */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
              <span>🎭</span>
              <span>نبرة وأسلوب الكلمات:</span>
            </label>
            <button
              onClick={() => handleGenerate(selectedTone)}
              disabled={isLoading}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline flex items-center gap-1"
            >
              <span>🔄</span>
              <span>إعادة صياغة الكلمات</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {TONES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setSelectedTone(t.id);
                  handleGenerate(t.id);
                }}
                disabled={isLoading}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                  selectedTone === t.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. بطاقة التهنئة المرئية بالقالب المختار (Live Interactive Card Preview) */}
        <div className="relative mb-6">
          <div
            ref={cardRef}
            className={`p-6 sm:p-8 rounded-[2rem] ${currentTpl.containerBg} ${currentTpl.borderStyle} ${currentTpl.textColor} transition-all duration-300 relative overflow-hidden shadow-lg`}
          >
            {/* زخارف الزوايا */}
            <div className="absolute top-4 right-4 text-xl opacity-60">
              {currentTpl.cornerIcon}
            </div>
            <div className="absolute bottom-4 left-4 text-xl opacity-60">
              {currentTpl.cornerIcon}
            </div>

            {/* رأس البطاقة */}
            <div className="flex items-center justify-between mb-4 border-b pb-3 border-current/15">
              <span className={`text-[11px] font-black px-3 py-1 rounded-full ${currentTpl.badgeStyle}`}>
                {currentTpl.badgeLabel}
              </span>
              <span className="text-xs font-bold opacity-80">
                مناسبة: {occasion.occasionType}
              </span>
            </div>

            {/* نص التهنئة المحور الرئيسي */}
            {isLoading ? (
              <div className="py-10 flex flex-col items-center justify-center text-center gap-3">
                <div className="w-10 h-10 border-4 border-current border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold animate-pulse">
                  جاري صياغة التهنئة بنمط {currentTpl.name} لـ {occasion.personName}...
                </p>
              </div>
            ) : (
              <div className="py-2">
                <div className="text-base sm:text-xl leading-relaxed whitespace-pre-line font-bold text-center">
                  "{congratulation}"
                </div>

                {/* توقيع المرسل الظاهر أمام الناس */}
                {currentUser?.displayName && (
                  <div className={`mt-6 pt-3 border-t text-xs font-bold flex items-center justify-between ${currentTpl.signatureStyle}`}>
                    <span className="opacity-75">إلى العزيز/ة: {occasion.personName}</span>
                    <span className="dir-ltr text-left">
                      — مع تحيات: {currentUser.displayName} ({currentUser.username})
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 4. أزرار الإجراءات الرئيسية والمشاركة */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* زر نسخ التهنئة بالكامل */}
            <button
              type="button"
              onClick={handleCopy}
              disabled={isLoading || !congratulation}
              className={`flex-1 py-3 px-5 rounded-2xl font-black text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 ${
                copied
                  ? 'bg-emerald-600 text-white shadow-emerald-200'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>تم نسخ التهنئة المنسقة بنجاح!</span>
                </>
              ) : (
                <>
                  <span>📋</span>
                  <span>نسخ التهنئة مع القالب</span>
                </>
              )}
            </button>

            {/* زر تحميل كصورة بطاقة جاهزة */}
            <button
              type="button"
              onClick={handleDownloadCardImage}
              disabled={isLoading || !congratulation}
              className="bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm py-3 px-5 rounded-2xl transition-all shadow-md shadow-amber-200 flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap"
              title="تحميل البطاقة بصيغة صورة عالية الدقة لمشاركتها كستوري أو صورة"
            >
              <span>🖼️</span>
              <span>تحميل كصورة بطاقة</span>
            </button>
          </div>

          {/* منصات التواصل الاجتماعي للمشاركة الفورية */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              disabled={isLoading || !congratulation}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span>💬</span>
              <span>واتساب</span>
            </button>

            <button
              type="button"
              onClick={handleInstagramShare}
              disabled={isLoading || !congratulation}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span>📸</span>
              <span>إنستغرام</span>
            </button>

            <button
              type="button"
              onClick={handleFacebookShare}
              disabled={isLoading || !congratulation}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span>📘</span>
              <span>فيسبوك</span>
            </button>

            <button
              type="button"
              onClick={handleNativeShare}
              disabled={isLoading || !congratulation}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span>📲</span>
              <span>مشاركة بالجوال</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
