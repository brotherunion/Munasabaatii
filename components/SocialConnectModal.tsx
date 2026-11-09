import React, { useState } from 'react';
import { UserProfile, SocialAccountConnection, Occasion, SocialPlatformId } from '../types';
import { useScrollLock } from '../hooks/useScrollLock';

interface SocialConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  connections: Record<SocialPlatformId, SocialAccountConnection>;
  onUpdateConnection: (platform: SocialPlatformId, isConnected: boolean, username?: string) => void;
  onImportBirthdays: (newOccasions: Occasion[]) => void;
}

// عينات واقعية لأعياد ميلاد أصدقاء السوشيال ميديا للمزامنة الفورية
const MOCK_INSTAGRAM_FRIENDS: Omit<Occasion, 'id'>[] = [
  {
    title: 'عيد ميلاد سارة أحمد (إنستغرام)',
    date: '2026-11-15',
    personName: 'سارة أحمد (@sara_ahmed)',
    relationship: 'صديق',
    category: 'الأصدقاء',
    occasionType: 'عيد ميلاد',
    scope: 'friends',
    sourcePlatform: 'instagram',
    notes: 'تمت المزامنة تلقائياً من إنستغرام 📸. تحب التصوير والهدايا اللطيفة.'
  },
  {
    title: 'عيد ميلاد علي الكرخي (إنستغرام)',
    date: '2026-11-24',
    personName: 'علي الكرخي (@ali_karkhi)',
    relationship: 'صديق',
    category: 'الأصدقاء',
    occasionType: 'عيد ميلاد',
    scope: 'friends',
    sourcePlatform: 'instagram',
    notes: 'تمت المزامنة تلقائياً من إنستغرام 📸.'
  },
  {
    title: 'عيد ميلاد مروة شاكر (إنستغرام)',
    date: '2026-12-05',
    personName: 'مروة شاكر (@marwa_sh)',
    relationship: 'صديق',
    category: 'الأصدقاء',
    occasionType: 'عيد ميلاد',
    scope: 'friends',
    sourcePlatform: 'instagram',
    notes: 'تمت المزامنة تلقائياً من إنستغرام 📸.'
  }
];

const MOCK_FACEBOOK_FRIENDS: Omit<Occasion, 'id'>[] = [
  {
    title: 'عيد ميلاد حيدر العبيدي (فيسبوك)',
    date: '2026-11-18',
    personName: 'حيدر العبيدي',
    relationship: 'صديق',
    category: 'الأصدقاء',
    occasionType: 'عيد ميلاد',
    scope: 'friends',
    sourcePlatform: 'facebook',
    notes: 'تمت المزامنة تلقائياً من أصدقاء فيسبوك 📘.'
  },
  {
    title: 'عيد ميلاد زينب الموسوي (فيسبوك)',
    date: '2026-12-02',
    personName: 'زينب الموسوي',
    relationship: 'صديق',
    category: 'الأصدقاء',
    occasionType: 'عيد ميلاد',
    scope: 'friends',
    sourcePlatform: 'facebook',
    notes: 'تمت المزامنة تلقائياً من أصدقاء فيسبوك 📘.'
  }
];

export const SocialConnectModal: React.FC<SocialConnectModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  connections,
  onUpdateConnection,
  onImportBirthdays,
}) => {
  useScrollLock(isOpen);

  const [connectingPlatform, setConnectingPlatform] = useState<SocialPlatformId | null>(null);
  const [importedStatus, setImportedStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnect = (platform: SocialPlatformId) => {
    setConnectingPlatform(platform);
    setImportedStatus(null);

    // محاكاة الاتصال الآمن والمزامنة
    setTimeout(() => {
      const generatedUsername =
        currentUser?.username
          ? currentUser.username.replace('@', '')
          : 'user_' + platform;

      onUpdateConnection(platform, true, generatedUsername);
      setConnectingPlatform(null);

      // استيراد أعياد الميلاد تلقائياً
      if (platform === 'instagram') {
        const occasionsToAdd: Occasion[] = MOCK_INSTAGRAM_FRIENDS.map((f) => ({
          ...f,
          id: 'ig-' + crypto.randomUUID()
        }));
        onImportBirthdays(occasionsToAdd);
        setImportedStatus(`✓ تم ربط إنستغرام بنجاح ومزامنة ${occasionsToAdd.length} أعياد ميلاد لأصدقائك!`);
      } else if (platform === 'facebook') {
        const occasionsToAdd: Occasion[] = MOCK_FACEBOOK_FRIENDS.map((f) => ({
          ...f,
          id: 'fb-' + crypto.randomUUID()
        }));
        onImportBirthdays(occasionsToAdd);
        setImportedStatus(`✓ تم ربط فيسبوك بنجاح ومزامنة ${occasionsToAdd.length} أعياد ميلاد لأصدقائك!`);
      } else {
        setImportedStatus(`✓ تم ربط حسابك بنجاح! سيتم تنبيهك عند توفر مناسبات.`);
      }
    }, 900);
  };

  const handleDisconnect = (platform: SocialPlatformId) => {
    onUpdateConnection(platform, false);
    setImportedStatus(null);
  };

  return (
    <div
      className="fixed inset-0 z-[195] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-[2.5rem] max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-right border border-slate-100 max-h-[92vh] overflow-y-auto select-text animate-in zoom-in-95 duration-200"
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

        {/* رسالة الترحيب المطلوبة بالضبط */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-indigo-600 text-white flex items-center justify-center text-2xl mb-3 mx-auto shadow-md shadow-pink-200">
            📱
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-800">
            أهلاً بك {currentUser?.displayName ? `يا ${currentUser.displayName}` : ''}!
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed bg-indigo-50/70 p-3.5 rounded-2xl border border-indigo-150">
            للتواصل مع الأصدقاء ومزامنة أعياد ميلادهم تلقائياً، اربط حسابك مع <b>إنستغرام</b> أو <b>فيسبوك</b> أو <b>سناب شات</b> ليتولى التطبيق تنبيهك بمواعيد ميلادهم وصياغة أجمل التهاني لهم.
          </p>
        </div>

        {importedStatus && (
          <div className="mb-5 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center animate-in fade-in duration-200 flex items-center justify-center gap-1.5">
            <span>🎉</span>
            <span>{importedStatus}</span>
          </div>
        )}

        {/* بطاقات منصات التواصل الاجتماعي */}
        <div className="space-y-3.5">
          {/* Instagram */}
          <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/70 flex items-center justify-between gap-3 hover:bg-slate-50 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center text-xl shadow-sm">
                📸
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                  <span>إنستغرام (Instagram)</span>
                  {connections.instagram.isConnected && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      متصل ✓
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {connections.instagram.isConnected
                    ? `مرتبط كـ @${connections.instagram.username} • تمت مزامنة أعياد ميلاد الأصدقاء`
                    : 'مزامنة أعياد ميلاد المتابعين والأصدقاء وتنبيهات أعياد الميلاد'}
                </p>
              </div>
            </div>

            <div>
              {connections.instagram.isConnected ? (
                <button
                  onClick={() => handleDisconnect('instagram')}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-all border border-rose-200"
                >
                  إلغاء الربط
                </button>
              ) : (
                <button
                  onClick={() => handleConnect('instagram')}
                  disabled={connectingPlatform === 'instagram'}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs py-2 px-3.5 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-1"
                >
                  {connectingPlatform === 'instagram' ? 'جاري الربط...' : 'ربط إنستغرام'}
                </button>
              )}
            </div>
          </div>

          {/* Facebook */}
          <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/70 flex items-center justify-between gap-3 hover:bg-slate-50 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl shadow-sm">
                📘
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                  <span>فيسبوك (Facebook)</span>
                  {connections.facebook.isConnected && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      متصل ✓
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {connections.facebook.isConnected
                    ? `مرتبط كـ @${connections.facebook.username} • استيراد مباشر لتواريخ الميلاد`
                    : 'استيراد تقويم أعياد ميلاد أصدقاء فيسبوك تلقائياً'}
                </p>
              </div>
            </div>

            <div>
              {connections.facebook.isConnected ? (
                <button
                  onClick={() => handleDisconnect('facebook')}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-all border border-rose-200"
                >
                  إلغاء الربط
                </button>
              ) : (
                <button
                  onClick={() => handleConnect('facebook')}
                  disabled={connectingPlatform === 'facebook'}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-1"
                >
                  {connectingPlatform === 'facebook' ? 'جاري الربط...' : 'ربط فيسبوك'}
                </button>
              )}
            </div>
          </div>

          {/* Snapchat */}
          <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/70 flex items-center justify-between gap-3 hover:bg-slate-50 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center text-xl shadow-sm font-bold">
                👻
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                  <span>سناب شات (Snapchat)</span>
                  {connections.snapchat.isConnected && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      متصل ✓
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {connections.snapchat.isConnected
                    ? `مرتبط كـ @${connections.snapchat.username}`
                    : 'مشاركة بطاقات التهنئة كقصص وسنابات مباشرة'}
                </p>
              </div>
            </div>

            <div>
              {connections.snapchat.isConnected ? (
                <button
                  onClick={() => handleDisconnect('snapchat')}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-all border border-rose-200"
                >
                  إلغاء الربط
                </button>
              ) : (
                <button
                  onClick={() => handleConnect('snapchat')}
                  disabled={connectingPlatform === 'snapchat'}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs py-2 px-3.5 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {connectingPlatform === 'snapchat' ? 'جاري الربط...' : 'ربط سناب'}
                </button>
              )}
            </div>
          </div>

          {/* TikTok */}
          <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/70 flex items-center justify-between gap-3 hover:bg-slate-50 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xl shadow-sm">
                🎵
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                  <span>تيك توك (TikTok)</span>
                  {connections.tiktok.isConnected && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      متصل ✓
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {connections.tiktok.isConnected
                    ? `مرتبط كـ @${connections.tiktok.username}`
                    : 'مزامنة أصدقاء ومتابعي تيك توك'}
                </p>
              </div>
            </div>

            <div>
              {connections.tiktok.isConnected ? (
                <button
                  onClick={() => handleDisconnect('tiktok')}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-all border border-rose-200"
                >
                  إلغاء الربط
                </button>
              ) : (
                <button
                  onClick={() => handleConnect('tiktok')}
                  disabled={connectingPlatform === 'tiktok'}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-3.5 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {connectingPlatform === 'tiktok' ? 'جاري الربط...' : 'ربط تيك توك'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            🔒 يتم تشفير وحماية بيانات الأصدقاء وأعياد ميلادهم محلياً.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl text-xs transition-all active:scale-95"
          >
            تم الانتهاء
          </button>
        </div>
      </div>
    </div>
  );
};
