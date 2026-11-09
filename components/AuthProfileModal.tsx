import React, { useState } from 'react';
import { UserProfile } from '../types';
import { useScrollLock } from '../hooks/useScrollLock';

interface AuthProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onSaveProfile: (profile: UserProfile, triggerSocialWelcome?: boolean) => void;
  initialStep?: 'choose' | 'edit_profile';
}

const AVATARS = ['🌟', '👑', '🚀', '☕', '🎯', '🦁', '🌿', '💎', '🎨', '💼'];

export const AuthProfileModal: React.FC<AuthProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveProfile,
  initialStep = 'choose',
}) => {
  useScrollLock(isOpen);

  const [step, setStep] = useState<'choose' | 'profile'>(
    currentUser?.isRegistered ? 'profile' : initialStep === 'edit_profile' ? 'profile' : 'choose'
  );
  const [selectedProvider, setSelectedProvider] = useState<'google' | 'apple' | 'guest'>(
    currentUser?.authProvider || 'google'
  );
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '🌟');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProviderSelect = (provider: 'google' | 'apple' | 'guest') => {
    setSelectedProvider(provider);
    if (!displayName) {
      if (provider === 'google') {
        setDisplayName('مستخدم جوجل');
        setUsername('@google_user');
      } else if (provider === 'apple') {
        setDisplayName('مستخدم أبل');
        setUsername('@apple_user');
      } else {
        setDisplayName('صديق جديد');
        setUsername('@guest_' + Math.floor(1000 + Math.random() * 9000));
      }
    }
    setStep('profile');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorMsg('يرجى إدخال اسمك الذي سيظهر للآخرين');
      return;
    }

    let cleanUsername = username.trim();
    if (!cleanUsername.startsWith('@')) {
      cleanUsername = '@' + cleanUsername;
    }
    if (cleanUsername.length < 3) {
      setErrorMsg('اسم المستخدم يجب أن يحتوي على حرفين على الأقل');
      return;
    }

    const updatedProfile: UserProfile = {
      id: currentUser?.id || 'usr_' + Date.now(),
      displayName: displayName.trim(),
      username: cleanUsername,
      authProvider: selectedProvider,
      avatar,
      isRegistered: true,
      email: currentUser?.email,
    };

    onSaveProfile(updatedProfile, true);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[190] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-[2.5rem] max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-right border border-slate-100 max-h-[92vh] overflow-y-auto select-text animate-in zoom-in-95 duration-200"
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

        {step === 'choose' ? (
          <div>
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-3xl mb-4 border border-indigo-100 shadow-sm mx-auto">
              👋
            </div>
            <h3 className="text-2xl font-black text-slate-800 text-center mb-1">
              تسجيل الدخول إلى مناسباتي
            </h3>
            <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
              اختر طريقة المتابعة لإنشاء اسم مستخدم مخصص وتفعيل ربط شبكات التواصل الاجتماعي.
            </p>

            {/* أزرار تسجيل الدخول */}
            <div className="space-y-3">
              {/* Google Button */}
              <button
                type="button"
                onClick={() => handleProviderSelect('google')}
                className="w-full bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200/80 hover:border-slate-300 font-bold py-3 px-4 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-3 text-sm active:scale-95"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>الاستمرار مع حساب Google</span>
              </button>

              {/* Apple ID Button */}
              <button
                type="button"
                onClick={() => handleProviderSelect('apple')}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-3 text-sm active:scale-95"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.32-6.53-9.99-11.53-21.2-15-33.63-3.48-12.43-5.22-24.32-5.22-35.68 0-14.12 3.42-26.08 10.25-35.87 6.83-9.78 15.42-14.78 25.76-15 4.58 0 9.78 1.19 15.61 3.59 5.82 2.39 9.5 3.59 11.04 3.59 1.3 0 4.99-1.25 11.09-3.75 6.1-2.5 11.19-3.69 15.26-3.59 11.3.54 20.32 4.62 27.06 12.23-9.78 5.87-14.56 14.12-14.34 24.77.22 8.37 3.42 15.37 9.62 21 6.19 5.65 13.53 8.8 22.01 9.45-2.06 6.31-4.73 12.82-8.01 19.53zm-27.48-106.87c0 6.63-2.45 12.87-7.34 17.71-4.89 4.84-10.76 7.66-17.6 8.47-.22-.87-.33-1.85-.33-2.93 0-6.41 2.5-12.71 7.5-17.89 5-5.18 10.97-8.15 17.77-8.91 0 1.2.09 2.39.09 3.55z" />
                </svg>
                <span>الاستمرار مع Apple ID</span>
              </button>

              {/* Guest option */}
              <button
                type="button"
                onClick={() => handleProviderSelect('guest')}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-2.5 px-4 rounded-2xl transition-all border border-slate-200/60 text-xs flex items-center justify-center gap-2"
              >
                <span>👤</span>
                <span>المتابعة محلياً كضيف (دون حساب سحابي)</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center text-2xl shadow-sm">
                👤
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">
                  إنشاء وتعديل اسم المستخدم
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  هذا الاسم والمعرف سيظهر أمام الناس ومن تقوم بتهنئتهم.
                </p>
              </div>
            </div>

            {/* اختيار الأفاتار */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                اختر أيقونة ملفك الشخصي:
              </label>
              <div className="flex flex-wrap gap-2 justify-center bg-slate-50 p-2.5 rounded-2xl border border-slate-150">
                {AVATARS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setAvatar(item)}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                      avatar === item
                        ? 'bg-indigo-600 text-white scale-110 shadow-md shadow-indigo-200'
                        : 'bg-white hover:bg-slate-100 border border-slate-200/60'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* الاسم الظاهر */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                الاسم الشخصي / الظاهر للآخرين <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="مثال: طه العراقي، مريم أحمد"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-sm outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-600 transition-all text-right"
              />
            </div>

            {/* اسم المستخدم (Username) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                اسم المستخدم الفريد (Username) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="@taha_iq"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-sm outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-600 transition-all font-mono text-left dir-ltr"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                سيتم تضمين اسمك في كروت ورسائل التهاني المولدة بالذكاء الاصطناعي.
              </p>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-500 font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-200 text-center">
                {errorMsg}
              </p>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-indigo-200 active:scale-95"
              >
                حفظ ومتابعة
              </button>
              {currentUser?.isRegistered && (
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all"
                >
                  إلغاء
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
