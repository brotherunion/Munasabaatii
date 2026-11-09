import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Occasion, Relationship, Category, OccasionType, OccasionScope, ReminderTiming } from '../types';
import { RELATIONSHIPS, OCCASION_TYPES, DEFAULT_CATEGORIES, getCategoryStyle, REMINDER_TIMING_OPTIONS, getReminderOption } from '../constants';
import { ConfirmDialog } from './ConfirmDialog';
import { useScrollLock } from '../hooks/useScrollLock';

interface OccasionFormProps {
  onSave: (occasion: Omit<Occasion, 'id'>) => void;
  onCancel: () => void;
  initialData?: Occasion;
  availableCategories?: string[];
  onAddCategory?: (category: string) => boolean | void;
  defaultIsSecret?: boolean;
  defaultScope?: OccasionScope;
}

export const OccasionForm: React.FC<OccasionFormProps> = ({
  onSave,
  onCancel,
  initialData,
  availableCategories = DEFAULT_CATEGORIES,
  onAddCategory,
  defaultIsSecret = false,
  defaultScope,
}) => {
  // Lock background scrolling while form modal is mounted
  useScrollLock(true);

  const initialValues = useMemo(() => {
    if (initialData) {
      return {
        title: initialData.title || '',
        date: initialData.date || '',
        personName: initialData.personName || '',
        relationship: (initialData.relationship || 'أخرى') as Relationship,
        category: (initialData.category || (initialData.isSecret ? 'خاصة جداً' : 'خاصة')) as Category,
        occasionType: (initialData.occasionType || 'عيد ميلاد') as OccasionType,
        notes: initialData.notes || '',
        isSecret: Boolean(initialData.isSecret),
        scope: initialData.scope || (initialData.isSecret ? 'secret' : 'personal'),
        reminderTiming: (initialData.reminderTiming || '3_days_before') as ReminderTiming,
      };
    }
    return {
      title: '',
      date: '',
      personName: '',
      relationship: 'أخرى' as Relationship,
      category: defaultIsSecret 
        ? 'خاصة جداً' 
        : (defaultScope === 'family' ? 'الأهل' : (defaultScope === 'friends' ? 'الأصدقاء' : (defaultScope === 'work' ? 'العمل' : 'عامة'))) as Category,
      occasionType: 'عيد ميلاد' as OccasionType,
      notes: '',
      isSecret: Boolean(defaultIsSecret),
      scope: defaultScope || (defaultIsSecret ? 'secret' : 'family'),
      reminderTiming: '3_days_before' as ReminderTiming,
    };
  }, [initialData, defaultIsSecret, defaultScope]);

  const [formData, setFormData] = useState(initialValues);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // Merge available categories with any currently selected custom category
  const allCategories = useMemo(() => {
    const list = [...availableCategories];
    if (formData.category && !list.includes(formData.category)) {
      list.push(formData.category);
    }
    return list;
  }, [availableCategories, formData.category]);

  const handleCreateInlineCategory = (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setCategoryError('يرجى كتابة اسم التصنيف');
      return;
    }
    if (onAddCategory) {
      onAddCategory(trimmed);
    }
    setFormData(prev => ({ ...prev, category: trimmed }));
    setNewCategoryName('');
    setCategoryError(null);
    setIsCreatingCategory(false);
  };

  // Check if any change has been made to the form relative to initial values
  const isDirty = useMemo(() => {
    return (
      formData.title.trim() !== initialValues.title.trim() ||
      formData.date !== initialValues.date ||
      formData.personName.trim() !== initialValues.personName.trim() ||
      formData.relationship !== initialValues.relationship ||
      formData.category !== initialValues.category ||
      formData.occasionType !== initialValues.occasionType ||
      formData.notes.trim() !== initialValues.notes.trim() ||
      formData.isSecret !== initialValues.isSecret ||
      formData.scope !== initialValues.scope ||
      formData.reminderTiming !== initialValues.reminderTiming
    );
  }, [formData, initialValues]);

  // Handle safe exit with unsaved changes verification
  const handleAttemptClose = useCallback(() => {
    if (isDirty) {
      setShowExitConfirm(true);
    } else {
      onCancel();
    }
  }, [isDirty, onCancel]);

  // Handle keyboard Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showExitConfirm) {
          setShowExitConfirm(false);
        } else {
          handleAttemptClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAttemptClose, showExitConfirm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleToggleSecret = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isSecret: checked,
      category: checked ? 'خاصة جداً' : (prev.category === 'خاصة جداً' ? 'عائلية' : prev.category),
      scope: checked ? 'secret' : 'personal'
    }));
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200 select-none"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleAttemptClose();
          }
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="occasion-form-title"
      >
        <div
          className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-2xl border border-slate-100 max-w-lg w-full relative text-right animate-in zoom-in-95 duration-200 my-auto max-h-[92vh] overflow-y-auto select-text"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={handleAttemptClose}
            className="absolute top-5 left-5 text-slate-400 hover:text-slate-600 p-2 rounded-2xl hover:bg-slate-100 transition-all"
            title="إغلاق النافذة"
            aria-label="إغلاق"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-sm border ${
              formData.isSecret
                ? 'bg-slate-900 text-emerald-400 border-emerald-500/30'
                : 'bg-indigo-50 border-indigo-100 text-indigo-600'
            }`}>
              {formData.isSecret ? '🔒' : (initialData ? '✏️' : '🎉')}
            </div>
            <div>
              <h2 id="occasion-form-title" className="text-xl sm:text-2xl font-black text-slate-800">
                {initialData ? 'تعديل المناسبة' : 'إضافة مناسبة جديدة'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {formData.isSecret ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <span>🔒 سيتم تشفير هذه المناسبة وتأمينها بالبصمة داخل الخزنة الخاصة</span>
                  </span>
                ) : isDirty ? (
                  <span className="text-amber-600 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    <span>هنالك تعديلات قيد الكتابة</span>
                  </span>
                ) : (
                  <span>أدخل تفاصيل المناسبة وسيقوم التطبيق بتذكيرك وصياغة التهاني</span>
                )}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-right">
            {/* خيار الحماية بالبصمة / الخزنة الخاصة المشفرة على طريقة واتساب */}
            <div className={`p-3.5 rounded-2xl border transition-all ${
              formData.isSecret 
                ? 'bg-slate-900 text-white border-emerald-500/40 shadow-sm' 
                : 'bg-slate-50 text-slate-800 border-slate-200/80 hover:bg-slate-100/60'
            }`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isSecret}
                  onChange={(e) => handleToggleSecret(e.target.checked)}
                  className="mt-1 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300 accent-emerald-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs sm:text-sm">
                      🔒 مناسبة خاصة جداً (مشفرة ومحمية بالبصمة)
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      formData.isSecret ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-200 text-slate-600'
                    }`}>
                      WhatsApp Style
                    </span>
                  </div>
                  <p className={`text-[11px] mt-0.5 leading-relaxed ${
                    formData.isSecret ? 'text-slate-300' : 'text-slate-500'
                  }`}>
                    عند تفعيل هذا الخيار، سيتم إخفاء المناسبة من القائمة العامة ولا تظهر إلا في تبويب "الخزنة السرية" بالبصمة، وتكون التنبيهات مبهمة بدون أسماء لحماية خصوصيتك.
                  </p>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                عنوان المناسبة <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-600 outline-none transition-all text-sm bg-slate-50/50 focus:bg-white"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="مثال: عيد الحب، حفل تخرج أحمد، ذكرى سنوية سرية"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  التاريخ <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="date"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-600 outline-none text-sm bg-slate-50/50 focus:bg-white"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  نوع المناسبة <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-600 outline-none bg-slate-50/50 focus:bg-white text-sm"
                  value={formData.occasionType}
                  onChange={(e) => setFormData({ ...formData, occasionType: e.target.value as OccasionType })}
                >
                  {OCCASION_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                اسم الشخص المحتفى به / الجهة <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-600 outline-none text-sm bg-slate-50/50 focus:bg-white"
                value={formData.personName}
                onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                placeholder="مثال: شريكة حياتي، الأهل، الصديق علي، العراق"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">صلة القرابة / العلاقة</label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-600 outline-none bg-slate-50/50 focus:bg-white text-sm"
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value as Relationship })}
                >
                  {RELATIONSHIPS.map(rel => <option key={rel} value={rel}>{rel}</option>)}
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">التصنيف (Label)</label>
                  {!isCreatingCategory && (
                    <button
                      type="button"
                      onClick={() => setIsCreatingCategory(true)}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
                    >
                      <span>➕</span>
                      <span>تصنيف جديد</span>
                    </button>
                  )}
                </div>

                {!isCreatingCategory ? (
                  <div className="space-y-1.5">
                    <select
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-600 outline-none bg-slate-50/50 focus:bg-white text-sm"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                    >
                      {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    {formData.category && (
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="text-[10px] text-slate-400">معاينة الشارة:</span>
                        {(() => {
                          const style = getCategoryStyle(formData.category);
                          return (
                            <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg border font-bold ${style.bg} ${style.text} ${style.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
                              <span>{formData.category}</span>
                            </span>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 space-y-2 animate-in fade-in duration-200">
                    <input
                      type="text"
                      autoFocus
                      value={newCategoryName}
                      onChange={(e) => {
                        setNewCategoryName(e.target.value);
                        if (categoryError) setCategoryError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCreateInlineCategory(e);
                        } else if (e.key === 'Escape') {
                          setIsCreatingCategory(false);
                          setNewCategoryName('');
                        }
                      }}
                      placeholder="اكتب اسم التصنيف الجديد..."
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-indigo-200 bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {categoryError && (
                      <p className="text-[11px] text-red-500 font-semibold">{categoryError}</p>
                    )}
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={handleCreateInlineCategory}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1 rounded-lg transition-all shadow-sm"
                      >
                        إضافة واختيار
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingCategory(false);
                          setNewCategoryName('');
                          setCategoryError(null);
                        }}
                        className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* اختيار توقيت التنبيه المسبق (الميزة المطلوبة بدقة) */}
            <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <span className="text-indigo-600">🔔</span>
                  <span>توقيت التنبيه والتذكير المسبق:</span>
                </label>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-lg">
                  {getReminderOption(formData.reminderTiming).label}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {REMINDER_TIMING_OPTIONS.map((opt) => {
                  const isSelected = formData.reminderTiming === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, reminderTiming: opt.id })}
                      className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between gap-1 active:scale-95 ${
                        isSelected
                          ? 'bg-white ring-2 ring-indigo-600 border-indigo-600 shadow-md shadow-indigo-100'
                          : 'bg-white/80 hover:bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-base">{opt.icon}</span>
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {opt.badge}
                        </span>
                      </div>
                      <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-indigo-950' : 'text-slate-800'}`}>
                        {opt.shortLabel}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed pt-1 border-t border-slate-200/60 flex items-center gap-1">
                <span className="text-indigo-500">ℹ️</span>
                <span>
                  {getReminderOption(formData.reminderTiming).description}
                </span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ملاحظات إضافية <span className="text-slate-400 font-normal">(اختياري للمساعدة في صياغة التهنئة أو حفظ تفاصيل خاصة)</span>
              </label>
              <textarea
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-600 outline-none resize-none text-sm bg-slate-50/50 focus:bg-white"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="مثال: يفضل هدية خاصة، أو تفاصيل سرية عن الموعد والمكان..."
              ></textarea>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                className={`flex-1 font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md active:scale-95 text-white ${
                  formData.isSecret
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                }`}
              >
                {initialData ? 'تحديث المناسبة' : 'حفظ المناسبة'}
              </button>
              <button
                type="button"
                onClick={handleAttemptClose}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl text-sm transition-all active:scale-95"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Exit confirmation dialog */}
      <ConfirmDialog
        isOpen={showExitConfirm}
        variant="warning"
        title="تجاهل التعديلات والخروج؟"
        message="هنالك بيانات وتعديلات تم إدخالها ولم يتم حفظها بعد. في حال الخروج الآن سيتم فقدان هذه التعديلات نهائياً."
        confirmText="تجاهل والخروج"
        cancelText="متابعة التعديل"
        onConfirm={() => {
          setShowExitConfirm(false);
          onCancel();
        }}
        onCancel={() => {
          setShowExitConfirm(false);
        }}
      />
    </>
  );
};

export default OccasionForm;
