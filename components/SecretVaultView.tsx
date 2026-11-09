import React, { useState } from 'react';
import { Occasion } from '../types';
import OccasionCard from './OccasionCard';
import { BiometricAuthModal } from './BiometricAuthModal';

interface SecretVaultViewProps {
  isUnlocked: boolean;
  onUnlock: () => void;
  onLock: () => void;
  secretOccasions: Occasion[];
  onAddOccasion: () => void;
  onEditOccasion: (occ: Occasion) => void;
  onDeleteOccasion: (id: string) => void;
  onViewDetails: (occ: Occasion) => void;
  onGenerateCongratulation: (occ: Occasion) => void;
}

export const SecretVaultView: React.FC<SecretVaultViewProps> = ({
  isUnlocked,
  onUnlock,
  onLock,
  secretOccasions,
  onAddOccasion,
  onEditOccasion,
  onDeleteOccasion,
  onViewDetails,
  onGenerateCongratulation,
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);

  const filteredSecretOccasions = secretOccasions.filter((o) => {
    return (
      o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.personName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.notes && o.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.trim().length >= 4) {
      localStorage.setItem('munasabati_vault_pin', newPin.trim());
      setPinChangeSuccess(true);
      setTimeout(() => {
        setPinChangeSuccess(false);
        setShowChangePinModal(false);
        setNewPin('');
      }, 1500);
    }
  };

  // 1. حالة القفل (LOCKED STATE - WhatsApp Locked Chats Style)
  if (!isUnlocked) {
    return (
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-[2.5rem] p-8 sm:p-12 border border-slate-800 shadow-2xl relative overflow-hidden mb-12">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-4 py-1.5 rounded-full text-xs font-bold mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>الدردشات والمناسبات المقفلة (WhatsApp Security)</span>
          </div>

          {/* Fingerprint Interactive Graphic */}
          <div className="relative my-6 flex justify-center">
            <div
              onClick={() => setShowAuthModal(true)}
              className="w-28 h-28 rounded-full bg-slate-800/90 border-2 border-emerald-500/40 hover:border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:scale-105 active:scale-95 transition-all cursor-pointer group"
              title="اضغط لفتح القفل بالبصمة"
            >
              <svg
                className="w-14 h-14 text-emerald-400 group-hover:text-emerald-300 transition-colors"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
                <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
                <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
                <path d="M2 12a10 10 0 0 1 18-6" />
                <path d="M2 16h.01" />
                <path d="M21.8 16c.2-2 .131-5.354 0-6" />
                <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
                <path d="M8.65 22c.21-.66.45-1.32.57-2" />
                <path d="M9 6.8a6 6 0 0 1 9 5.2v2" />
              </svg>
            </div>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">
            المناسبات الخاصة جداً مقفلة
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            تم تشفير هذا القسم وتأمينه تماماً. لا يتم إظهار الأسماء أو الملاحظات في القوائم العادية، وتظهر التنبيهات بصيغة مشفرة لحماية خصوصيتك حتى يتم الفتح بالبصمة.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-8 py-3.5 rounded-2xl text-sm transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2"
            >
              <span>👆</span>
              <span>فتح القفل بالبصمة أو الرمز</span>
            </button>
          </div>

          {/* Quick Counter Indicator */}
          <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-center gap-2">
            <span>🛡️</span>
            <span>
              لديك <b className="text-emerald-400">{secretOccasions.length}</b> مناسبات سرية مشفرة داخل هذه الخزنة
            </span>
          </div>
        </div>

        {/* Auth Modal */}
        <BiometricAuthModal
          isOpen={showAuthModal}
          onSuccess={() => {
            setShowAuthModal(false);
            onUnlock();
          }}
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    );
  }

  // 2. حالة الفتح (UNLOCKED STATE)
  return (
    <div className="space-y-6 mb-12">
      {/* Vault Status Header */}
      <div className="bg-slate-900 border border-emerald-500/40 text-white p-5 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            🔓
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-base">الخزنة السرية مفتوحة</h3>
              <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                مشفرة ونشطة
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              يمكنك الآن استعراض وتعديل وإضافة مناسباتك الخاصة جداً بأمان تام.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowChangePinModal(true)}
            className="text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 px-3.5 py-2 rounded-xl transition-all border border-slate-700 flex items-center gap-1.5"
            title="تغيير رمز PIN السري"
          >
            <span>🔑</span>
            <span>تغيير الرمز</span>
          </button>

          <button
            onClick={onAddOccasion}
            className="text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-95 flex items-center gap-1.5"
          >
            <span>➕</span>
            <span>إضافة مناسبة سرية</span>
          </button>

          <button
            onClick={onLock}
            className="text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5"
            title="قفل الخزنة فوراً لحماية الخصوصية"
          >
            <span>🔒</span>
            <span>قفل الخزنة</span>
          </button>
        </div>
      </div>

      {/* Search Bar for Secret Occasions */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex-1 min-w-[240px] relative">
          <input
            type="text"
            placeholder="بحث داخل المناسبات الخاصة جداً..."
            className="w-full pr-11 pl-4 py-2.5 rounded-2xl border border-slate-150 bg-slate-50/70 text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all text-right"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute right-4 top-3 text-slate-400 text-sm">🔍</span>
        </div>
        <div className="text-xs text-slate-500 font-bold px-2">
          المناسبات المحمية: <b className="text-emerald-600">{filteredSecretOccasions.length}</b>
        </div>
      </div>

      {/* Secret Occasions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSecretOccasions.length > 0 ? (
          filteredSecretOccasions.map((occ) => (
            <div key={occ.id} className="relative group/secret">
              {/* Privacy Ribbon */}
              <div className="absolute -top-2.5 right-6 z-10 bg-slate-900 text-emerald-400 text-[10px] font-bold px-3 py-0.5 rounded-full border border-emerald-500/40 shadow-sm flex items-center gap-1">
                <span>🔒</span>
                <span>خاصة جداً ومشفرة</span>
              </div>
              <OccasionCard
                occasion={occ}
                onEdit={onEditOccasion}
                onDelete={onDeleteOccasion}
                isUpcoming={false}
                onViewDetails={onViewDetails}
                onGenerateCongratulation={onGenerateCongratulation}
              />
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-100 p-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 text-3xl flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
              ✨
            </div>
            <h4 className="text-lg font-bold text-slate-800 mb-1">
              {searchTerm ? 'لا توجد نتائج مطابقة لبحثك' : 'لا توجد مناسبات سرية مسجلة بعد'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">
              أضف مناسباتك الأكثر خصوصية (أعياد زواج سرية، مفاجآت، خطط شخصية) لحمايتها بالبصمة داخل هذه الخزنة.
            </p>
            <button
              onClick={onAddOccasion}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-2xl text-xs transition-all shadow-md shadow-emerald-200"
            >
              إضافة أول مناسبة سرية
            </button>
          </div>
        )}
      </div>

      {/* Change PIN Modal */}
      {showChangePinModal && (
        <div
          className="fixed inset-0 z-[210] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowChangePinModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 text-right shadow-2xl relative border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-lg font-bold text-slate-800 mb-1">تعيين رمز PIN جديد</h4>
            <p className="text-xs text-slate-500 mb-4">
              أدخل رمزاً مكوناً من 4 أرقام أو أكثر للفتح السريع في حال عدم استخدام البصمة.
            </p>

            <form onSubmit={handleChangePin} className="space-y-4">
              <input
                type="password"
                maxLength={6}
                autoFocus
                required
                placeholder="أدخل الرمز الجديد (مثال: 5678)"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                className="w-full text-center tracking-widest text-lg font-bold px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500"
              />

              {pinChangeSuccess && (
                <p className="text-xs text-emerald-600 font-bold text-center">
                  ✓ تم تحديث الرمز السري بنجاح!
                </p>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md"
                >
                  حفظ الرمز
                </button>
                <button
                  type="button"
                  onClick={() => setShowChangePinModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-xs transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
