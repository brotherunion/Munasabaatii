import React, { useState, useEffect } from 'react';
import { Occasion } from '../types';
import { getCategoryStyle, DEFAULT_CATEGORIES } from '../constants';
import { useScrollLock } from '../hooks/useScrollLock';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onAddCategory: (name: string) => boolean;
  onDeleteCategory: (name: string) => void;
  occasions: Occasion[];
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onDeleteCategory,
  occasions,
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [error, setError] = useState<string | null>(null);

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

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) {
      setError('يرجى كتابة اسم التصنيف');
      return;
    }
    if (categories.includes(trimmed)) {
      setError('هذا التصنيف موجود بالفعل');
      return;
    }
    const success = onAddCategory(trimmed);
    if (success !== false) {
      setNewCatName('');
      setError(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[140] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-manager-title"
    >
      <div
        className="bg-white rounded-[2rem] max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-right animate-in zoom-in-95 duration-200 border border-slate-100 max-h-[90vh] overflow-y-auto select-text"
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

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center text-xl shadow-sm">
            🏷️
          </div>
          <div>
            <h2 id="category-manager-title" className="text-xl sm:text-2xl font-black text-slate-800">
              إدارة التصنيفات (Labels)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              أنشئ تصنيفات مخصصة لتنظيم وفرز مناسباتك بالطريقة التي تناسبك
            </p>
          </div>
        </div>

        {/* نموذج إضافة تصنيف جديد */}
        <form onSubmit={handleAdd} className="mb-6">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            إضافة تصنيف جديد
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => {
                setNewCatName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="مثال: مناسبات رسمية، حفلات، أعياد سنوية..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-600 outline-none text-sm bg-slate-50/50 focus:bg-white transition-all"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md shadow-indigo-200 transition-all whitespace-nowrap active:scale-95"
            >
              ➕ إضافة
            </button>
          </div>
          {error && (
            <p className="text-red-500 text-xs font-semibold mt-1.5">{error}</p>
          )}
        </form>

        {/* قائمة التصنيفات الحالية */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            التصنيفات المتاحة ({categories.length})
          </h3>
          <div className="space-y-2">
            {categories.map((cat) => {
              const count = occasions.filter((o) => o.category === cat).length;
              const style = getCategoryStyle(cat);
              const isDefault = DEFAULT_CATEGORIES.slice(0, 2).includes(cat);

              return (
                <div
                  key={cat}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`}></span>
                    <span className={`text-xs sm:text-sm font-bold px-3 py-1 rounded-xl border ${style.bg} ${style.text} ${style.border}`}>
                      {cat}
                    </span>
                    <span className="text-xs text-slate-400">
                      ({count} {count === 1 ? 'مناسبة' : 'مناسبات'})
                    </span>
                  </div>

                  {!isDefault ? (
                    <button
                      type="button"
                      onClick={() => onDeleteCategory(cat)}
                      className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all text-xs flex items-center gap-1 font-semibold"
                      title={`حذف تصنيف "${cat}"`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>حذف</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                      أساسي
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-sm transition-all active:scale-95"
          >
            تم الحفظ وإغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
