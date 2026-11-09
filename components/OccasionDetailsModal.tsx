import React, { useState, useEffect } from 'react';
import { Occasion, GiftSuggestion, GiftCategory } from '../types';
import { RELATIONSHIP_ICONS, getCategoryStyle, getReminderOption, isOccasionDueForReminder } from '../constants';
import { generateGiftSuggestions } from '../services/geminiService';
import { useScrollLock } from '../hooks/useScrollLock';

interface OccasionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  occasion: Occasion | null;
  onGenerateCongratulation: (occasion: Occasion) => void;
  onEdit: (occasion: Occasion) => void;
  onDelete: (id: string) => void;
}

export const OccasionDetailsModal: React.FC<OccasionDetailsModalProps> = ({
  isOpen,
  onClose,
  occasion,
  onGenerateCongratulation,
  onEdit,
  onDelete,
}) => {
  const [giftSuggestions, setGiftSuggestions] = useState<GiftSuggestion[]>([]);
  const [isGeneratingGifts, setIsGeneratingGifts] = useState(false);
  const [hasGeneratedGifts, setHasGeneratedGifts] = useState(false);
  const [copiedGiftId, setCopiedGiftId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('جميع');

  useScrollLock(isOpen);

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

  // إعادة ضبط حالة الهدايا عند تغيير المناسبة
  useEffect(() => {
    if (isOpen && occasion) {
      setGiftSuggestions([]);
      setHasGeneratedGifts(false);
      setFilterCategory('جميع');
      setCopiedGiftId(null);
    }
  }, [isOpen, occasion?.id]);

  if (!isOpen || !occasion) return null;

  const reminderStatus = isOccasionDueForReminder(occasion);
  const reminderOpt = getReminderOption(occasion.reminderTiming);
  const categoryStyle = getCategoryStyle(occasion.category);

  const formattedDate = new Date(occasion.date).toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // توليد اقتراحات الهدايا الذكية عبر الذكاء الاصطناعي
  const handleFetchGifts = async () => {
    if (!occasion) return;
    setIsGeneratingGifts(true);
    try {
      const res = await generateGiftSuggestions(occasion);
      setGiftSuggestions(res.suggestions);
      setHasGeneratedGifts(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingGifts(false);
    }
  };

  const handleCopyGift = (gift: GiftSuggestion) => {
    const text = `فكرة هدية لـ ${occasion.personName} بمناسبة ${occasion.occasionType}:\n🎁 ${gift.title}\n📝 ${gift.description}\n💡 سبب الاختيار: ${gift.whySuitable}\n💰 التكلفة المقدرة: ${gift.priceEstimate}`;
    navigator.clipboard.writeText(text);
    setCopiedGiftId(gift.id);
    setTimeout(() => setCopiedGiftId(null), 2000);
  };

  const handleSearchGift = (gift: GiftSuggestion) => {
    const query = encodeURIComponent(`شراء هدية ${gift.title}`);
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
  };

  const displayedGifts = filterCategory === 'جميع'
    ? giftSuggestions
    : giftSuggestions.filter(g => g.category === filterCategory);

  return (
    <div
      className="fixed inset-0 z-[130] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="occasion-details-title"
    >
      <div
        className="bg-white rounded-[2.5rem] max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative text-right animate-in zoom-in-95 duration-200 border border-slate-100 max-h-[92vh] overflow-y-auto select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 p-2 rounded-2xl hover:bg-slate-100 transition-all"
          title="إغلاق"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* رأس تفاصيل المناسبة */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-3xl shadow-sm flex-shrink-0">
            {RELATIONSHIP_ICONS[occasion.relationship] || '✨'}
          </div>
          <div className="flex-1 pr-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-xl font-bold border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${categoryStyle.dot}`} />
                <span>{occasion.category}</span>
              </span>
              <span className="text-xs px-2.5 py-1 rounded-xl font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {occasion.occasionType}
              </span>
              {reminderStatus.isDue && (
                <span className={`text-xs px-2.5 py-1 rounded-xl font-bold ${reminderStatus.statusBadge.bg} ${reminderStatus.statusBadge.textColor} shadow-sm animate-pulse`}>
                  {reminderStatus.statusBadge.text}
                </span>
              )}
            </div>
            <h2 id="occasion-details-title" className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">
              {occasion.title}
            </h2>
            <p className="text-xs text-indigo-600 font-bold mt-1">
              المحتفى به: {occasion.personName} <span className="text-slate-400 font-normal">({occasion.relationship})</span>
            </p>
          </div>
        </div>

        {/* شبكة تفاصيل المناسبة */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 block mb-1">📅 موعد المناسبة</span>
            <span className="text-xs font-bold text-slate-800">{formattedDate}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {reminderStatus.isToday ? 'اليوم! 🎉' : reminderStatus.isTomorrow ? 'غداً! 🔔' : reminderStatus.daysRemaining > 0 ? `متبقي ${reminderStatus.daysRemaining} يوم` : `مضت قبل ${Math.abs(reminderStatus.daysRemaining)} يوم`}
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 block mb-1">🔔 توقيت التنبيه المسبق</span>
            <span className="text-xs font-bold text-indigo-700 flex items-center gap-1">
              <span>{reminderOpt.icon}</span>
              <span>{reminderOpt.label}</span>
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {reminderStatus.isDue ? '⚡ التنبيه نشط الآن' : `يتم التنبيه قبل ${reminderOpt.shortLabel}`}
            </span>
          </div>
        </div>

        {occasion.notes && (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
            <span className="text-xs font-bold text-slate-500 block mb-1.5">📝 ملاحظات خاصة:</span>
            <p className="text-xs text-slate-700 leading-relaxed italic">{occasion.notes}</p>
          </div>
        )}

        {/* قسم اقتراحات الهدايا الذكية بالذكاء الاصطناعي (الميزة المطلوبة بدقة) */}
        <div className="mb-6 bg-gradient-to-br from-amber-50/70 via-rose-50/40 to-indigo-50/50 p-5 rounded-3xl border border-amber-200/80 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🎁</span>
                <h3 className="text-base font-black text-slate-800">
                  اقتراحات هدايا ذكية بالذكاء الاصطناعي
                </h3>
                <span className="text-[10px] bg-amber-500/15 text-amber-800 font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                  مخصصة حسب الصلة والحدث
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                أفكار هدايا مبتكرة تناسب <b className="text-slate-700">{occasion.personName}</b> بناءً على صلة القرابة (<b className="text-slate-700">{occasion.relationship}</b>) ومناسبة (<b className="text-slate-700">{occasion.occasionType}</b>).
              </p>
            </div>

            {hasGeneratedGifts && (
              <button
                type="button"
                onClick={handleFetchGifts}
                disabled={isGeneratingGifts}
                className="text-xs font-bold text-amber-800 hover:text-amber-900 bg-white hover:bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 transition-all flex items-center gap-1 shadow-sm disabled:opacity-50 whitespace-nowrap"
              >
                <span>🔄</span>
                <span>أفكار أخرى</span>
              </button>
            )}
          </div>

          {!hasGeneratedGifts && !isGeneratingGifts && (
            <div className="bg-white/90 p-5 rounded-2xl border border-amber-200/70 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 text-2xl flex items-center justify-center mx-auto shadow-sm">
                💡
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  محتار في اختيار الهدية المناسبة؟
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                  يقوم الذكاء الاصطناعي بتحليل صلة القرابة ({occasion.relationship}) ونوع المناسبة ({occasion.occasionType}) ليقترح عليك 4 إلى 5 أفكار واقعية تناسب مختلف الميزانيات.
                </p>
              </div>
              <button
                type="button"
                onClick={handleFetchGifts}
                className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-xs sm:text-sm py-2.5 px-6 rounded-2xl shadow-md shadow-amber-200 transition-all active:scale-95 inline-flex items-center gap-2"
              >
                <span>✨</span>
                <span>توليد اقتراحات هدايا لـ {occasion.personName}</span>
              </button>
            </div>
          )}

          {isGeneratingGifts && (
            <div className="py-8 bg-white/80 rounded-2xl border border-amber-200/60 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-700 animate-pulse">
                جاري ابتكار أفكار هدايا مناسبة لـ {occasion.personName} ({occasion.relationship} في {occasion.occasionType})...
              </p>
            </div>
          )}

          {hasGeneratedGifts && !isGeneratingGifts && (
            <div className="space-y-3">
              {/* تصفية فئات الهدايا */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['جميع', 'عاطفية وتذكارية', 'عملية ومفيدة', 'فاخرة وتجربة خاصة', 'رمزية ومبتكرة'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFilterCategory(cat)}
                    className={`text-[11px] px-2.5 py-1 rounded-xl font-bold transition-all ${
                      filterCategory === cat
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* بطاقات اقتراحات الهدايا */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {displayedGifts.map((gift) => {
                  const isCopied = copiedGiftId === gift.id;
                  return (
                    <div
                      key={gift.id}
                      className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl p-1.5 rounded-xl bg-amber-50 border border-amber-100 flex-shrink-0">
                              {gift.icon || '🎁'}
                            </span>
                            <div>
                              <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 group-hover:text-amber-800 transition-colors">
                                {gift.title}
                              </h4>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                  {gift.category}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60">
                                  {gift.priceEstimate}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed mb-2 font-normal">
                          {gift.description}
                        </p>

                        <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100 text-[11px] text-amber-900 mb-3 flex items-start gap-1.5">
                          <span className="text-amber-600 flex-shrink-0">💡</span>
                          <span className="leading-relaxed">
                            <b>سبب الملاءمة:</b> {gift.whySuitable}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleCopyGift(gift)}
                          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                            isCopied
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          <span>{isCopied ? '✓' : '📋'}</span>
                          <span>{isCopied ? 'تم النسخ' : 'نسخ الفكرة'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSearchGift(gift)}
                          className="py-1.5 px-3 rounded-xl text-xs font-bold bg-amber-100/70 hover:bg-amber-100 text-amber-900 transition-all flex items-center justify-center gap-1"
                          title="البحث عن أسعار وتوافر الهدية في المتاجر"
                        >
                          <span>🔍</span>
                          <span>بحث</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* بطاقة توليد التهنئة بالذكاء الاصطناعي */}
        <div className="mb-6 p-4 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-700 text-white shadow-xl shadow-indigo-100 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-base font-extrabold mb-1">هل تود إرسال تهنئة لـ {occasion.personName}؟</h3>
            <p className="text-xs text-indigo-100 mb-4 opacity-90">
              يقوم الذكاء الاصطناعي بصياغة بطاقة تهنئة وقوالب تصميم جاهزة مبنية على اسمه ({occasion.personName}) ونوع مناسبته ({occasion.occasionType}).
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onGenerateCongratulation(occasion);
              }}
              className="w-full bg-white text-indigo-700 hover:bg-indigo-50 font-black py-3 px-6 rounded-2xl text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <span>✨</span>
              <span>فتح مصمم بطاقات التهنئة</span>
            </button>
          </div>
        </div>

        {/* أزرار الإجراءات السفلية: تعديل، حذف، إغلاق */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(occasion);
            }}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>تعديل</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onDelete(occasion.id);
            }}
            className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center gap-1.5"
          >
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>حذف</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-2.5 px-4 rounded-xl text-xs transition-all"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
