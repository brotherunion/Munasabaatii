export type Relationship = 'عائلة' | 'صديق' | 'زميل عمل' | 'قريب' | 'عامة / رسمية' | 'أخرى';
export type Category = string;
export type OccasionType = 
  | 'عيد ميلاد' 
  | 'زواج' 
  | 'تخرج' 
  | 'مناسبة عامة'
  | 'يوم عالمي'
  | 'مناسبة عمل'
  | 'مناسبة خاصة' 
  | 'ذكرى سنوية' 
  | 'أخرى';

export type OccasionScope = 'family' | 'friends' | 'work' | 'general' | 'secret';

export type SocialPlatformId = 'instagram' | 'facebook' | 'snapchat' | 'tiktok';

export interface UserProfile {
  id: string;
  displayName: string;
  username: string; // مثال: @taha_iq
  authProvider: 'google' | 'apple' | 'guest';
  avatar: string;
  email?: string;
  isRegistered: boolean;
}

export interface SocialAccountConnection {
  platform: SocialPlatformId;
  name: string;
  icon: string;
  color: string;
  bgLight: string;
  isConnected: boolean;
  username?: string;
  importedBirthdaysCount: number;
}

export type ReminderTiming = 
  | 'same_day' 
  | '1_day_before' 
  | '2_days_before' 
  | '3_days_before' 
  | '7_days_before' 
  | '14_days_before';

export interface Occasion {
  id: string;
  title: string;
  date: string; // ISO format YYYY-MM-DD
  personName: string;
  relationship: Relationship;
  category: Category;
  occasionType: OccasionType;
  notes?: string;
  isSecret?: boolean; // هل هي مناسبة سرية مشفرة في الخزنة الخاصة المقفلة بالبصمة
  scope?: OccasionScope; // أهل، أصدقاء، عمل، عامة، خاصة
  sourcePlatform?: SocialPlatformId; // إنستغرام، فيسبوك، سناب شات، تيك توك
  senderDisplayName?: string; // اسم مرسل التهنئة
  reminderTiming?: ReminderTiming; // توقيت التنبيه المسبق: نفس اليوم، قبل يوم، قبل يومين، قبل 3 أيام، قبل أسبوع، قبل أسبوعين
}

export interface SuggestionResponse {
  message: string;
}

export type GiftCategory = 'عاطفية وتذكارية' | 'عملية ومفيدة' | 'فاخرة وتجربة خاصة' | 'رمزية ومبتكرة';
export type GiftPriceRange = 'اقتصادي (مناسب للجميع)' | 'متوسط (قيمة ممتازة)' | 'فاخر (مميز وخاص)';

export interface GiftSuggestion {
  id: string;
  title: string;
  category: GiftCategory;
  description: string;
  priceEstimate: GiftPriceRange;
  whySuitable: string; // سبب ملاءمتها للشخص ونوع المناسبة
  icon: string;
}
