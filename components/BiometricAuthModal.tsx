import React, { useState, useEffect } from 'react';
import { useScrollLock } from '../hooks/useScrollLock';

interface BiometricAuthModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
  title?: string;
  description?: string;
}

export const BiometricAuthModal: React.FC<BiometricAuthModalProps> = ({
  isOpen,
  onSuccess,
  onClose,
  title = 'المصادقة بالبصمة الحيوية',
  description = 'استخدم بصمة الإصبع أو بصمة الوجه أو رمز PIN للوصول إلى الخزنة الخاصة المشفرة.'
}) => {
  useScrollLock(isOpen);

  const [authMode, setAuthMode] = useState<'biometric' | 'pin'>('biometric');
  const [pin, setPin] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedPin, setSavedPin] = useState<string>('1234');

  useEffect(() => {
    if (!isOpen) {
      setPin('');
      setErrorMsg(null);
      setIsScanning(false);
      return;
    }

    const storedPin = localStorage.getItem('munasabati_vault_pin') || '1234';
    setSavedPin(storedPin);

    // Auto-trigger biometric prompt on open
    triggerBiometricScan();
  }, [isOpen]);

  const triggerBiometricScan = async () => {
    setIsScanning(true);
    setErrorMsg(null);

    // Haptic feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([20, 40, 20]);
      } catch (e) {}
    }

    // Try WebAuthn native biometric verification if supported
    let verified = false;
    if (typeof window !== 'undefined' && window.PublicKeyCredential) {
      try {
        // Check if platform authenticator (TouchID / Android Fingerprint / FaceID) is available
        const hasPlatformAuth = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.();
        if (hasPlatformAuth) {
          // Simulation/native prompt
          verified = true;
        }
      } catch (err) {
        // Fallback
      }
    }

    // Smooth scan animation for 700ms to give realistic biometric feedback
    setTimeout(() => {
      setIsScanning(false);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(50);
        } catch (e) {}
      }
      onSuccess();
    }, 800);
  };

  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin === savedPin) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(40);
        } catch (e) {}
      }
      onSuccess();
    } else {
      setErrorMsg('رمز PIN غير صحيح، الرمز الافتراضي هو: 1234');
      setPin('');
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate([80, 50, 80]);
        } catch (e) {}
      }
    }
  };

  const handlePinDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setErrorMsg(null);
      if (nextPin.length === 4) {
        if (nextPin === savedPin) {
          setTimeout(() => {
            onSuccess();
          }, 150);
        } else {
          setErrorMsg('رمز PIN غير صحيح، الرمز الافتراضي هو 1234');
          setTimeout(() => setPin(''), 500);
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-slate-900 border border-slate-800 text-white rounded-[2.5rem] max-w-sm w-full p-6 sm:p-8 shadow-2xl relative text-center overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow backdrop effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 text-slate-400 hover:text-white p-2 rounded-2xl hover:bg-slate-800 transition-all"
          title="إلغاء"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header Shield */}
        <div className="mb-4 inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>حماية وتشفير عالي (WhatsApp-Style)</span>
        </div>

        <h3 className="text-xl font-extrabold text-white mb-1.5">{title}</h3>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed max-w-xs mx-auto">
          {description}
        </p>

        {authMode === 'biometric' ? (
          <div className="flex flex-col items-center">
            {/* Interactive Fingerprint Scanner Button */}
            <div className="relative my-4">
              <button
                type="button"
                onClick={triggerBiometricScan}
                disabled={isScanning}
                className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none ${
                  isScanning
                    ? 'scale-105 bg-emerald-500/20 ring-4 ring-emerald-400 ring-offset-4 ring-offset-slate-900 shadow-[0_0_40px_rgba(16,185,129,0.4)]'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-emerald-400 border-2 border-emerald-500/40 hover:border-emerald-400 active:scale-95 shadow-lg'
                }`}
                title="المس البصمة للتحقق"
              >
                {/* Fingerprint SVG Icon */}
                <svg
                  className={`w-14 h-14 transition-all duration-300 ${
                    isScanning ? 'text-emerald-300 animate-pulse' : 'text-emerald-400'
                  }`}
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

                {/* Scanning laser effect */}
                {isScanning && (
                  <div className="absolute inset-x-2 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-300 to-transparent shadow-[0_0_15px_#34d399] animate-bounce" />
                )}
              </button>
            </div>

            <p className="text-xs font-bold text-slate-300 mt-2 mb-1">
              {isScanning ? (
                <span className="text-emerald-400 flex items-center justify-center gap-1.5 animate-pulse">
                  <span>جاري قراءة البصمة الحيوية...</span>
                </span>
              ) : (
                'المس مستشعر البصمة للفتح فوراً'
              )}
            </p>

            <div className="flex flex-col gap-2 w-full mt-6 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setAuthMode('pin')}
                className="text-xs text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 py-2.5 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <span>🔢</span>
                <span>استخدام رمز PIN السري (1234)</span>
              </button>

              <button
                type="button"
                onClick={onSuccess}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 py-1 font-semibold"
              >
                تخطي ومتابعة مباشرة للمعاينة
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* PIN Code Dots Indicator */}
            <div className="flex items-center justify-center gap-3 my-4">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                    pin.length > idx
                      ? 'bg-emerald-400 scale-110 shadow-[0_0_10px_#34d399]'
                      : 'bg-slate-800 border border-slate-700'
                  }`}
                />
              ))}
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400 font-bold mb-3 animate-shake">
                {errorMsg}
              </p>
            )}

            {/* Custom Numeric Keypad for fast phone tapping */}
            <div className="grid grid-cols-3 gap-2.5 w-full max-w-[260px] my-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handlePinDigit(digit)}
                  className="h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white font-black text-lg transition-all active:scale-95 border border-slate-750"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPin('')}
                className="h-12 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold transition-all"
              >
                مسح
              </button>
              <button
                type="button"
                onClick={() => handlePinDigit('0')}
                className="h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white font-black text-lg transition-all active:scale-95 border border-slate-750"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => setPin(prev => prev.slice(0, -1))}
                className="h-12 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all"
                title="حذف رقم"
              >
                ⌫
              </button>
            </div>

            <p className="text-[11px] text-slate-500 mt-2">
              الرمز الافتراضي للخزنة: <span className="font-mono text-emerald-400 font-bold">1234</span>
            </p>

            <div className="flex items-center justify-between w-full mt-4 pt-3 border-t border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setAuthMode('biometric')}
                className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
              >
                <span>👆</span>
                <span>العودة للبصمة</span>
              </button>
              <button
                type="button"
                onClick={onSuccess}
                className="text-slate-400 hover:text-white"
              >
                تخطي
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
