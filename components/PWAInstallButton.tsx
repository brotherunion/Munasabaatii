import React, { useState, useEffect } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useScrollLock } from '../hooks/useScrollLock';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useScrollLock(showGuide);

  useEffect(() => {
    if (!showGuide) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowGuide(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showGuide]);

  // If already running as an installed PWA / APK, hide the install button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      await install();
      setIsInstalling(false);
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        disabled={isInstalling}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95 ${
          variant === 'header'
            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-900/20'
            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-200'
        }`}
        title="تثبيت التطبيق مباشرة على الهاتف ليفتح كتطبيق أصيل"
      >
        <span className="text-sm">📱</span>
        <span>{isInstalling ? 'جاري التثبيت...' : 'تثبيت على الجوال'}</span>
      </button>

      {/* مودال إرشادات التثبيت على الهاتف في حال لم يكن الزر التلقائي مدعوماً */}
      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 select-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowGuide(false);
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl text-right animate-in zoom-in-95 duration-200 select-text"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📲</span>
                <h3 className="text-lg font-bold text-slate-900">
                  {isIOS ? 'تثبيت التطبيق على آيفون (iOS)' : 'تثبيت التطبيق على أندرويد'}
                </h3>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-3 text-sm text-slate-700">
                <p className="text-slate-600">
                  لتثبيت التطبيق على جهازك بدون الحاجة إلى متجر التطبيقات:
                </p>
                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">١</span>
                  <span>اضغط على أيقونة <strong>المشاركة (Share)</strong> في شريط متصفح Safari بالأسفل.</span>
                </div>
                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">٢</span>
                  <span>مرر للأسفل واضغط على <strong>إضافة إلى الشاشة الرئيسية (Add to Home Screen)</strong>.</span>
                </div>
                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">٣</span>
                  <span>اضغط على <strong>إضافة (Add)</strong> في الزاوية العلوية، وستظهر أيقونة التطبيق على شاشة هاتفك فوراً!</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm text-slate-700">
                <p className="text-slate-600">
                  يمكنك تشغيل هذا التطبيق كتطبيق أصيل على هاتفك الأندرويد:
                </p>
                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="bg-emerald-100 text-emerald-700 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">١</span>
                  <span>اضغط على قائمة الثلاث نقاط (<strong>⋮</strong>) في متصفح Chrome أو متصفح جهازك.</span>
                </div>
                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="bg-emerald-100 text-emerald-700 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">٢</span>
                  <span>اختر <strong>تثبيت التطبيق (Install App)</strong> أو <strong>الإضافة إلى الشاشة الرئيسية</strong>.</span>
                </div>
                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="bg-emerald-100 text-emerald-700 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">٣</span>
                  <span>سيتم تنزيل التطبيق وفتحه كبرنامج مستقل وسريع بدون شريط المتصفح وبأيقونة مميزة.</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuide(false)}
              className="mt-6 w-full rounded-2xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition"
            >
              فهمت ذلك
            </button>
          </div>
        </div>
      )}
    </>
  );
};
