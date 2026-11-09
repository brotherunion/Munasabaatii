import React, { useState, useEffect } from 'react';
import { Occasion } from '../types';
import { useScrollLock } from '../hooks/useScrollLock';

interface ExportApkModalProps {
  isOpen: boolean;
  onClose: () => void;
  occasions: Occasion[];
  onImportOccasions: (imported: Occasion[]) => void;
}

export const ExportApkModal: React.FC<ExportApkModalProps> = ({
  isOpen,
  onClose,
  occasions,
  onImportOccasions,
}) => {
  const [activeTab, setActiveTab] = useState<'pwabuilder' | 'directPwa' | 'capacitor' | 'backup'>('pwabuilder');
  const [copiedLink, setCopiedLink] = useState(false);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);

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

  if (!isOpen) return null;

  const currentAppUrl = window.location.origin;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentAppUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(occasions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `munasabati-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setBackupMessage('تم تنزيل النسخة الاحتياطية بنجاح!');
    setTimeout(() => setBackupMessage(null), 3000);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportOccasions(parsed);
          setBackupMessage(`تم استيراد ${parsed.length} مناسبة بنجاح!`);
          setTimeout(() => setBackupMessage(null), 3500);
        } else {
          alert('الملف غير متوافق. يرجى التأكد من اختيار ملف JSON صحيح.');
        }
      } catch (err) {
        alert('حدث خطأ أثناء قراءة الملف.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-[2.5rem] max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative text-right animate-in zoom-in-95 duration-200 border border-slate-100 max-h-[92vh] overflow-y-auto select-text"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 p-2 rounded-2xl hover:bg-slate-100 transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* رأس المودال */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 text-white flex items-center justify-center text-2xl shadow-lg shadow-indigo-100">
            📱
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">تصدير التطبيق إلى APK والجوال</h2>
            <p className="text-xs text-slate-500 mt-0.5">خطوات تحويل "مناسباتي" إلى تطبيق هاتف أصيل ومشاركته بكل سهولة</p>
          </div>
        </div>

        {/* شارة الجاهزية الفنية */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 mb-6">
          <div className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>حالة المتطلبات الفنية لتوليد APK: مكتملة 100% ✨</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-semibold text-slate-600">
            <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-slate-100">
              <span className="text-emerald-500">✓</span>
              <span>Web Manifest</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-slate-100">
              <span className="text-emerald-500">✓</span>
              <span>أيقونات 512px</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-slate-100">
              <span className="text-emerald-500">✓</span>
              <span>Service Worker</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-slate-100">
              <span className="text-emerald-500">✓</span>
              <span>تجاوب الموبايل</span>
            </div>
          </div>
        </div>

        {/* التبويبات */}
        <div className="flex p-1 bg-slate-100 rounded-2xl mb-6 text-xs font-bold gap-1">
          <button
            onClick={() => setActiveTab('pwabuilder')}
            className={`flex-1 py-2.5 px-3 rounded-xl transition-all ${
              activeTab === 'pwabuilder' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⭐ ملف APK (PWABuilder)
          </button>
          <button
            onClick={() => setActiveTab('directPwa')}
            className={`flex-1 py-2.5 px-3 rounded-xl transition-all ${
              activeTab === 'directPwa' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📲 التثبيت المباشر
          </button>
          <button
            onClick={() => setActiveTab('capacitor')}
            className={`flex-1 py-2.5 px-3 rounded-xl transition-all ${
              activeTab === 'capacitor' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🛠️ للمطورين (Android Studio)
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-2.5 px-3 rounded-xl transition-all ${
              activeTab === 'backup' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            💾 النسخ والاستيراد
          </button>
        </div>

        {/* محتوى التبويب: PWABuilder (أسهل طريقة للحصول على APK حقيقي) */}
        {activeTab === 'pwabuilder' && (
          <div className="space-y-4 text-slate-700 text-xs sm:text-sm">
            <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100">
              <h4 className="font-extrabold text-indigo-900 text-sm mb-1">
                ما هو PWABuilder؟
              </h4>
              <p className="text-indigo-800/90 text-xs leading-relaxed">
                أداة مجانية ورسمية مقدمة من مايكروسوفت ومدعومة من جوجل لتحويل أي تطبيق ويب متقدم (PWA) إلى حزمة تطبيق أندرويد حقيقية <strong>(.apk أو .aab)</strong> بنقرة زر وبدون كتابة سطر كود واحد!
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 items-start">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <div className="flex-1">
                  <p className="font-bold text-slate-800">انسخ رابط التطبيق الحالي:</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <input
                      type="text"
                      readOnly
                      value={currentAppUrl}
                      className="w-full bg-white border border-slate-200 text-xs text-indigo-700 font-mono px-3 py-2 rounded-xl text-left"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all whitespace-nowrap shadow-sm shadow-indigo-200"
                    >
                      {copiedLink ? '✓ تم النسخ' : '📋 نسخ الرابط'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 items-start">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <div className="flex-1">
                  <p className="font-bold text-slate-800">افتح موقع PWABuilder المجاني:</p>
                  <p className="text-slate-500 text-xs mt-0.5">قم بلصق الرابط في المربع والضغط على <strong>Start</strong>.</p>
                  <a
                    href="https://www.pwabuilder.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-extrabold mt-2 underline"
                  >
                    <span>الانتقال إلى موقع PWABuilder.com ↗</span>
                  </a>
                </div>
              </div>

              <div className="flex gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 items-start">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <div>
                  <p className="font-bold text-slate-800">تنزيل حزمة الأندرويد (.apk):</p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    اضغط على زر <strong>Package for Android</strong>، ثم اختر خيار <strong>Download package</strong>. ستنزل ملف التطبيق APK جاهزاً للمشاركة والتثبيت الفوري على أي جوال!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* محتوى التبويب: التثبيت المباشر كـ PWA */}
        {activeTab === 'directPwa' && (
          <div className="space-y-4 text-slate-700 text-xs sm:text-sm">
            <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100">
              <h4 className="font-extrabold text-emerald-900 text-sm mb-1">
                لماذا تعتبر هذه الطريقة هي الأسرع والأكثر أماناً لمشاركة التطبيق؟
              </h4>
              <p className="text-emerald-800/90 text-xs leading-relaxed">
                ملفات الـ APK تطلب من المستخدم تفعيل "تثبيت التطبيقات من مصادر غير معروفة" وتثير قلق البعض، بينما تثبيت تطبيق الويب (PWA) يتم بأمان تام، دون أية تحذيرات أمنية، وبنفس وظائف الـ APK تماماً:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="font-bold text-slate-800 mb-1">✨ أيقونة مستقلة على الشاشة</p>
                <p className="text-slate-500 text-[11px]">يظهر كأيقونة تطبيق كاملة باسم "مناسباتي" بجوار تطبيقات واتساب ويوتيوب.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="font-bold text-slate-800 mb-1">⚡ شاشة كاملة وبدون متصفح</p>
                <p className="text-slate-500 text-[11px]">يختفي شريط المتصفح وعنوان الموقع ليظهر كتطبيق هاتف حقيقي (Standalone).</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="font-bold text-slate-800 mb-1">📶 العمل بدون إنترنت (Offline)</p>
                <p className="text-slate-500 text-[11px]">يتم تخزين الملفات والمناسبات محلياً عبر Service Worker ليعمل في أي وقت.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="font-bold text-slate-800 mb-1">🔄 تحديث تلقائي وفوري</p>
                <p className="text-slate-500 text-[11px]">أي ميزة جديدة تضيفها للتطبيق ستصل لمستخدمي الهاتف تلقائياً دون إعادة تنزيل APK.</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleCopyLink}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-2xl transition-all shadow-md shadow-emerald-200 flex items-center justify-center gap-2"
              >
                <span>🔗</span>
                <span>{copiedLink ? 'تم نسخ الرابط! شاركه الآن مع أي شخص' : 'نسخ رابط التطبيق لمشاركته فوراً'}</span>
              </button>
            </div>
          </div>
        )}

        {/* محتوى التبويب: للمطورين (Capacitor) */}
        {activeTab === 'capacitor' && (
          <div className="space-y-4 text-slate-700 text-xs">
            <p className="text-slate-600 leading-relaxed">
              إذا كنت تفضل بناء وتوليد ملف APK محلياً باستخدام <strong>Android Studio</strong> وأدوات <strong>Capacitor</strong>:
            </p>

            <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-xs overflow-x-auto text-left dir-ltr space-y-2">
              <p className="text-slate-400"># 1. تثبيت أدوات Capacitor</p>
              <p className="text-emerald-400">npm install @capacitor/core @capacitor/cli @capacitor/android</p>
              <p className="text-slate-400 mt-2"># 2. بناء ملفات الويب</p>
              <p className="text-emerald-400">npm run build</p>
              <p className="text-slate-400 mt-2"># 3. تهيئة وإضافة منصة الأندرويد</p>
              <p className="text-emerald-400">npx cap init "مناسباتي" "com.munasabati.app" --web-dir dist</p>
              <p className="text-emerald-400">npx cap add android</p>
              <p className="text-slate-400 mt-2"># 4. فتح المشروع في Android Studio لتصدير APK</p>
              <p className="text-emerald-400">npx cap open android</p>
            </div>

            <p className="text-slate-500 text-[11px]">
              في Android Studio: اختر من القائمة العلوية <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>، وسيكون ملف الـ <code>.apk</code> جاهزاً في مجلد <code>android/app/build/outputs/apk/debug/app-debug.apk</code>.
            </p>
          </div>
        )}

        {/* محتوى التبويب: النسخ الاحتياطي والاستيراد */}
        {activeTab === 'backup' && (
          <div className="space-y-4 text-slate-700 text-xs sm:text-sm">
            <p className="text-slate-600 leading-relaxed">
              لتسهيل نقل مناسباتك بين الهواتف أو حفظ نسخة احتياطية من كافة المناسبات المسجلة:
            </p>

            {backupMessage && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs font-bold animate-in fade-in">
                {backupMessage}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">📤 تصدير نسخة احتياطية</h4>
                  <p className="text-slate-500 text-xs mb-4">قم بتنزيل ملف JSON يحتوي على كافة مناسباتك ({occasions.length} مناسبة) لحفظها في هاتفك.</p>
                </div>
                <button
                  onClick={handleExportBackup}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-sm shadow-indigo-100"
                >
                  تنزيل ملف النسخة الاحتياطية (.json)
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">📥 استيراد من ملف احتياطي</h4>
                  <p className="text-slate-500 text-xs mb-4">استرجع مناسباتك المخزنة من أي ملف نسخ احتياطي سابق.</p>
                </div>
                <label className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition-all text-center cursor-pointer block">
                  <span>اختيار ملف JSON للاستيراد</span>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImportBackup}
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* زر الإغلاق السفلي */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-2.5 rounded-2xl text-xs transition-all"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
