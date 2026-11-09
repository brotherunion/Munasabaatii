import React, { useEffect } from 'react';
import { useScrollLock } from '../hooks/useScrollLock';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  variant = 'warning',
  onConfirm,
  onCancel,
}) => {
  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: '⚠️',
          iconBg: 'bg-red-100 text-red-600',
          btnConfirm: 'bg-red-600 hover:bg-red-700 text-white shadow-red-200',
        };
      case 'warning':
        return {
          icon: '⚠️',
          iconBg: 'bg-amber-100 text-amber-600',
          btnConfirm: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200',
        };
      case 'info':
      default:
        return {
          icon: 'ℹ️',
          iconBg: 'bg-indigo-100 text-indigo-600',
          btnConfirm: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200',
        };
    }
  };

  const { icon, iconBg, btnConfirm } = getVariantStyles();

  return (
    <div
      className="fixed inset-0 z-[200] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 select-none"
      onClick={(e) => {
        // إذا ضغط المستخدم على الخلفية، يتم إلغاء الحوار والتراجع
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl text-right animate-in zoom-in-95 duration-200 border border-slate-100 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm ${iconBg}`}>
            {icon}
          </div>
          <div className="flex-1">
            <h3 id="confirm-dialog-title" className="text-lg font-black text-slate-800 leading-snug">
              {title}
            </h3>
            <p id="confirm-dialog-desc" className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 ${btnConfirm}`}
          >
            {confirmText}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all active:scale-95"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};
