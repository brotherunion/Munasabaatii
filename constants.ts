import { Relationship, OccasionType, Category, Occasion, ReminderTiming } from './types';

export const RELATIONSHIPS: Relationship[] = [
  'عائلة',
  'صديق',
  'زميل عمل',
  'قريب',
  'عامة / رسمية',
  'أخرى'
];

export const OCCASION_TYPES: OccasionType[] = [
  'عيد ميلاد',
  'زواج',
  'تخرج',
  'مناسبة عامة',
  'يوم عالمي',
  'مناسبة عمل',
  'مناسبة خاصة',
  'ذكرى سنوية',
  'أخرى'
];

export const DEFAULT_CATEGORIES: string[] = [
  'الأهل',
  'الأصدقاء',
  'العمل',
  'عامة',
  'خاصة جداً'
];

export const CATEGORIES: string[] = DEFAULT_CATEGORIES;

// خيارات توقيت التنبيه المسبق
export interface ReminderTimingOption {
  id: ReminderTiming;
  days: number;
  label: string;
  shortLabel: string;
  badge: string;
  icon: string;
  description: string;
}

export const REMINDER_TIMING_OPTIONS: ReminderTimingOption[] = [
  {
    id: 'same_day',
    days: 0,
    label: 'في نفس اليوم (عند حلول الموعد)',
    shortLabel: 'في نفس اليوم',
    badge: 'يوم الموعد',
    icon: '🎯',
    description: 'تنبيه في يوم المناسبة نفسه صباحاً.'
  },
  {
    id: '1_day_before',
    days: 1,
    label: 'قبل يوم واحد (24 ساعة)',
    shortLabel: 'قبل يوم',
    badge: 'قبل يوم',
    icon: '⏱️',
    description: 'تنبيه قبل موعد المناسبة بيوم واحد للتحضير السريع.'
  },
  {
    id: '2_days_before',
    days: 2,
    label: 'قبل يومين (48 ساعة)',
    shortLabel: 'قبل يومين',
    badge: 'قبل يومين',
    icon: '📅',
    description: 'تنبيه قبل يومين لتأكيد المواعيد والترتيبات.'
  },
  {
    id: '3_days_before',
    days: 3,
    label: 'قبل 3 أيام (موصى به للتحضير وشراء الهدايا)',
    shortLabel: 'قبل 3 أيام',
    badge: 'قبل 3 أيام',
    icon: '🔔',
    description: 'تنبيه مبكر قبل 3 أيام يكفي لتجهيز الهدية وصياغة التهنئة.'
  },
  {
    id: '7_days_before',
    days: 7,
    label: 'قبل أسبوع (7 أيام)',
    shortLabel: 'قبل أسبوع',
    badge: 'قبل أسبوع',
    icon: '🗓️',
    description: 'تنبيه استباقي قبل أسبوع للمناسبات الكبيرة والحجوزات.'
  },
  {
    id: '14_days_before',
    days: 14,
    label: 'قبل أسبوعين (14 يوماً)',
    shortLabel: 'قبل أسبوعين',
    badge: 'قبل أسبوعين',
    icon: '⏳',
    description: 'تنبيه مسبق واسع للمناسبات الضخمة كالأعراس والسفر.'
  }
];

export function getReminderOption(timing?: ReminderTiming): ReminderTimingOption {
  const found = REMINDER_TIMING_OPTIONS.find(o => o.id === timing);
  return found || REMINDER_TIMING_OPTIONS[3]; // الافتراضي قبل 3 أيام
}

export function getDaysUntilOccasion(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export interface OccasionReminderStatus {
  isDue: boolean;
  daysRemaining: number;
  isToday: boolean;
  isTomorrow: boolean;
  isPast: boolean;
  timingOption: ReminderTimingOption;
  statusBadge: {
    text: string;
    bg: string;
    textColor: string;
    border: string;
  };
}

export function isOccasionDueForReminder(occasion: Occasion): OccasionReminderStatus {
  const days = getDaysUntilOccasion(occasion.date);
  const option = getReminderOption(occasion.reminderTiming);
  const isToday = days === 0;
  const isTomorrow = days === 1;
  const isPast = days < 0;
  // التنبيه مستحق إذا لم تمر المناسبة، وكان عدد الأيام المتبقية أقل من أو يساوي أيام التنبيه المحددة
  const isDue = !isPast && days <= option.days;

  let statusBadge = {
    text: `متبقي ${days} يوم`,
    bg: 'bg-slate-50',
    textColor: 'text-slate-700',
    border: 'border-slate-200'
  };

  if (isToday) {
    statusBadge = {
      text: 'اليوم! 🎉',
      bg: 'bg-rose-500',
      textColor: 'text-white',
      border: 'border-rose-400'
    };
  } else if (isTomorrow) {
    statusBadge = {
      text: 'غداً! 🔔',
      bg: 'bg-orange-500',
      textColor: 'text-white',
      border: 'border-orange-400'
    };
  } else if (isDue) {
    statusBadge = {
      text: `تنبيه: متبقي ${days} أيام (${option.shortLabel})`,
      bg: 'bg-amber-500',
      textColor: 'text-white',
      border: 'border-amber-400'
    };
  } else if (isPast) {
    statusBadge = {
      text: `مضت قبل ${Math.abs(days)} يوم`,
      bg: 'bg-slate-100',
      textColor: 'text-slate-500',
      border: 'border-slate-200'
    };
  }

  return {
    isDue,
    daysRemaining: days,
    isToday,
    isTomorrow,
    isPast,
    timingOption: option,
    statusBadge
  };
}

export const CATEGORY_BADGE_STYLES: Record<string, { bg: string; text: string; border: string; dot: string; hex: string }> = {
  'الأهل': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500', hex: '#f43f5e' },
  'الأصدقاء': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', hex: '#f59e0b' },
  'العمل': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', dot: 'bg-sky-500', hex: '#0284c7' },
  'عامة': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', hex: '#10b981' },
  'خاصة جداً': { bg: 'bg-slate-900', text: 'text-emerald-400', border: 'border-emerald-500/40', dot: 'bg-emerald-400', hex: '#10b981' },
  'عائلية': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500', hex: '#f43f5e' },
  'أصدقاء': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', hex: '#f59e0b' },
  'عمل': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', dot: 'bg-sky-500', hex: '#0284c7' },
  'خاصة': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500', hex: '#8b5cf6' },
};

const CATEGORY_PALETTE = [
  { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500', hex: '#6366f1' },
  { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', dot: 'bg-teal-500', hex: '#14b8a6' },
  { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', dot: 'bg-cyan-500', hex: '#06b6d4' },
  { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200', dot: 'bg-fuchsia-500', hex: '#d946ef' },
  { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500', hex: '#f97316' },
  { bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-200', dot: 'bg-lime-500', hex: '#84cc16' },
];

export function getCategoryStyle(category: string) {
  if (CATEGORY_BADGE_STYLES[category]) {
    return CATEGORY_BADGE_STYLES[category];
  }
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % CATEGORY_PALETTE.length;
  return CATEGORY_PALETTE[index];
}

export const RELATIONSHIP_ICONS: Record<Relationship, string> = {
  'عائلة': '🏠',
  'صديق': '🤝',
  'زميل عمل': '💼',
  'قريب': '🌳',
  'عامة / رسمية': '🌐',
  'أخرى': '✨'
};

// المناسبات العامة المتبقية فقط: رأس السنة، عيد الحب، وعيد الأم مع خيارات التنبيه المسبق
export const INITIAL_PUBLIC_OCCASIONS: Occasion[] = [
  {
    id: 'pub-1',
    title: 'عيد رأس السنة الميلادية الجديدة',
    date: '2027-01-01',
    personName: 'الجميع',
    relationship: 'عامة / رسمية',
    category: 'عامة',
    occasionType: 'مناسبة عامة',
    scope: 'general',
    notes: 'استقبال العام الجديد بأجمل الأمنيات بالخير والتوفيق والنجاح.',
    reminderTiming: '7_days_before'
  },
  {
    id: 'pub-2',
    title: 'عيد الحب العالمي',
    date: '2027-02-14',
    personName: 'شريك الحياة والأحباب',
    relationship: 'أخرى',
    category: 'عامة',
    occasionType: 'مناسبة عامة',
    scope: 'general',
    notes: 'يوم التعبير عن المحبة والوفاء والمشاعر الصادقة وتقديم الهدايا.',
    reminderTiming: '3_days_before'
  },
  {
    id: 'pub-3',
    title: 'عيد الأم السنوي',
    date: '2027-03-21',
    personName: 'أمي الحبيبة (ست الحبايب)',
    relationship: 'عائلة',
    category: 'الأهل',
    occasionType: 'مناسبة عامة',
    scope: 'family',
    notes: 'أعظم مناسبة سنوية لتكريم نبع الحنان وبر الوالدين وإدخال السرور على قلبها.',
    reminderTiming: '7_days_before'
  }
];

// المناسبات الخاصة جداً المحمية بالبصمة (الخزنة السرية)
export const INITIAL_SECRET_OCCASIONS: Occasion[] = [
  {
    id: 'secret-1',
    title: 'ذكرى سنوية خاصة جداً 💍',
    date: '2026-11-10',
    personName: 'شريكة حياتي',
    relationship: 'عائلة',
    category: 'خاصة جداً',
    occasionType: 'ذكرى سنوية',
    isSecret: true,
    scope: 'secret',
    notes: 'عشاء هادئ ومفاجأة خاصة، تم حفظها في الخزنة السرية المقفلة بالبصمة.',
    reminderTiming: '3_days_before'
  }
];

// دمج المناسبات الافتراضية
export const INITIAL_OCCASIONS: Occasion[] = [
  ...INITIAL_PUBLIC_OCCASIONS,
  ...INITIAL_SECRET_OCCASIONS
];
