import React from 'react';
import { UserProfile, SocialAccountConnection, SocialPlatformId } from '../types';

interface SocialWelcomeBannerProps {
  user: UserProfile | null;
  connections: Record<SocialPlatformId, SocialAccountConnection>;
  onOpenSocialModal: () => void;
  onDismiss: () => void;
}

export const SocialWelcomeBanner: React.FC<SocialWelcomeBannerProps> = ({
  user,
  connections,
  onOpenSocialModal,
  onDismiss,
}) => {
  const hasConnectedAny = (Object.values(connections) as SocialAccountConnection[]).some((c) => c.isConnected);

  return (
    <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-purple-950 text-white p-4 sm:p-5 rounded-3xl mb-6 shadow-xl border border-indigo-700/50 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-300">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center gap-3.5 text-right w-full sm:w-auto relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-indigo-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-pink-500/20 flex-shrink-0">
          📱
        </div>
        <div>
          <h4 className="font-black text-sm sm:text-base text-white flex items-center gap-2">
            <span>أهلاً بك {user?.displayName ? `يا ${user.displayName}` : ''}!</span>
            <span className="text-[10px] bg-white/15 text-pink-200 px-2 py-0.5 rounded-full font-bold">
              {hasConnectedAny ? 'تزامن الأصدقاء نشط' : 'تواصل اجتماعي'}
            </span>
          </h4>
          <p className="text-xs text-indigo-200/90 mt-0.5 leading-relaxed">
            للتواصل مع الأصدقاء، اربط حسابك مع إنستغرام أو فيسبوك لمزامنة أعياد ميلادهم تلقائياً والتنبيه لها.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end relative z-10">
        <button
          onClick={onOpenSocialModal}
          className="flex-1 sm:flex-initial bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md shadow-pink-500/20 active:scale-95 whitespace-nowrap flex items-center justify-center gap-1.5"
        >
          <span>🔗</span>
          <span>{hasConnectedAny ? 'إدارة ربط الحسابات' : 'اربط إنستغرام أو فيسبوك'}</span>
        </button>

        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all text-xs"
          title="إخفاء التنبيه"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
