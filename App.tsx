import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Occasion, OccasionScope, UserProfile, SocialAccountConnection, SocialPlatformId } from './types';
import OccasionForm from './components/OccasionForm';
import OccasionCard from './components/OccasionCard';
import OccasionStats from './components/OccasionStats';
import { SecretVaultView } from './components/SecretVaultView';
import { BiometricAuthModal } from './components/BiometricAuthModal';
import { AuthProfileModal } from './components/AuthProfileModal';
import { SocialConnectModal } from './components/SocialConnectModal';
import { SocialWelcomeBanner } from './components/SocialWelcomeBanner';
import { PWAInstallButton } from './components/PWAInstallButton';
import { ExportApkModal } from './components/ExportApkModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { OccasionDetailsModal } from './components/OccasionDetailsModal';
import { CongratulationModal } from './components/CongratulationModal';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import {
  INITIAL_OCCASIONS,
  DEFAULT_CATEGORIES,
  getCategoryStyle,
  isOccasionDueForReminder,
  getReminderOption
} from './constants';

export type MainTab = 'family' | 'friends' | 'work' | 'general' | 'secret' | 'all' | 'stats';

const DEFAULT_USER: UserProfile = {
  id: 'usr_me',
  displayName: 'طه العراقي',
  username: '@taha_iq',
  authProvider: 'google',
  avatar: '🌟',
  isRegistered: true,
};

const DEFAULT_CONNECTIONS: Record<SocialPlatformId, SocialAccountConnection> = {
  instagram: { platform: 'instagram', name: 'إنستغرام', icon: '📸', color: '#E1306C', bgLight: 'bg-pink-50', isConnected: false, importedBirthdaysCount: 0 },
  facebook: { platform: 'facebook', name: 'فيسبوك', icon: '📘', color: '#1877F2', bgLight: 'bg-blue-50', isConnected: false, importedBirthdaysCount: 0 },
  snapchat: { platform: 'snapchat', name: 'سناب شات', icon: '👻', color: '#FFFC00', bgLight: 'bg-amber-50', isConnected: false, importedBirthdaysCount: 0 },
  tiktok: { platform: 'tiktok', name: 'تيك توك', icon: '🎵', color: '#000000', bgLight: 'bg-slate-50', isConnected: false, importedBirthdaysCount: 0 },
};

const App: React.FC = () => {
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('munasabati_categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to load local categories', e);
      }
    }
    return DEFAULT_CATEGORIES;
  });

  // الملف الشخصي واسم المستخدم الذي يظهر أمام الناس
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('munasabati_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_USER;
  });

  // اتصالات السوشيال ميديا (إنستغرام، فيسبوك، سناب، تيك توك)
  const [socialConnections, setSocialConnections] = useState<Record<SocialPlatformId, SocialAccountConnection>>(() => {
    const saved = localStorage.getItem('munasabati_social_connections');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_CONNECTIONS;
  });

  const [activeTab, setActiveTab] = useState<MainTab>('family');
  const [showForm, setShowForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingOccasion, setEditingOccasion] = useState<Occasion | undefined>();
  const [deletingOccasionId, setDeletingOccasionId] = useState<string | null>(null);
  const [viewingOccasion, setViewingOccasion] = useState<Occasion | null>(null);
  const [congratulationOccasion, setCongratulationOccasion] = useState<Occasion | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('جميع');
  const [showExportApk, setShowExportApk] = useState(false);

  // الخزنة السرية للمناسبات الخاصة جداً المحمية بالبصمة
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [showQuickBiometricModal, setShowQuickBiometricModal] = useState(false);

  // مودالات تسجيل الدخول وربط السوشيال ميديا
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [showSocialWelcomeBanner, setShowSocialWelcomeBanner] = useState(true);

  const isOnline = useOnlineStatus();
  const notifiedIds = useRef<Set<string>>(new Set());

  // تحميل المناسبات الصافية (رأس السنة، عيد الحب، عيد الأم، والخزنة)
  useEffect(() => {
    const saved = localStorage.getItem('munasabati_events');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hasLegacy = Array.isArray(parsed) && parsed.some(p => 
          String(p.id).startsWith('demo-') ||
          String(p.id).startsWith('iraq-') ||
          String(p.id).startsWith('global-')
        );
        if (Array.isArray(parsed) && parsed.length > 0 && !hasLegacy) {
          setOccasions(parsed);
          return;
        }
      } catch (e) {
        console.error('Failed to load local occasions', e);
      }
    }
    setOccasions(INITIAL_OCCASIONS);
    localStorage.setItem('munasabati_events', JSON.stringify(INITIAL_OCCASIONS));
  }, []);

  // حفظ التعديلات في التخزين المحلي
  useEffect(() => {
    if (occasions.length > 0) {
      localStorage.setItem('munasabati_events', JSON.stringify(occasions));
    }
  }, [occasions]);

  // حفظ واسترجاع التصنيفات المخصصة
  useEffect(() => {
    localStorage.setItem('munasabati_categories', JSON.stringify(categories));
  }, [categories]);

  // حفظ المستخدم
  useEffect(() => {
    localStorage.setItem('munasabati_user_profile', JSON.stringify(currentUser));
  }, [currentUser]);

  // حفظ اتصالات السوشيال ميديا
  useEffect(() => {
    localStorage.setItem('munasabati_social_connections', JSON.stringify(socialConnections));
  }, [socialConnections]);

  // دمج أي تصنيفات جديدة بالمناسبات
  useEffect(() => {
    if (occasions.length > 0) {
      setCategories(prev => {
        const set = new Set(prev);
        let updated = false;
        occasions.forEach(o => {
          if (o.category && !set.has(o.category)) {
            set.add(o.category);
            updated = true;
          }
        });
        return updated ? Array.from(set) : prev;
      });
    }
  }, [occasions]);

  const handleAddCategory = (newCat: string) => {
    const trimmed = newCat.trim();
    if (!trimmed) return false;
    if (categories.includes(trimmed)) return false;
    setCategories(prev => [...prev, trimmed]);
    return true;
  };

  const handleDeleteCategory = (catToDelete: string) => {
    if (DEFAULT_CATEGORIES.slice(0, 4).includes(catToDelete)) {
      alert('لا يمكن حذف التصنيفات الأساسية (الأهل، الأصدقاء، العمل، عامة).');
      return;
    }
    setCategories(prev => prev.filter(c => c !== catToDelete));
    if (filterCategory === catToDelete) {
      setFilterCategory('جميع');
    }
  };

  // حساب التنبيهات المستحقة وفقاً لتوقيت التنبيه المسبق المحدد لكل مناسبة
  const upcomingPublicReminders = useMemo(() => {
    return occasions.filter(o => !o.isSecret && isOccasionDueForReminder(o).isDue);
  }, [occasions]);

  const upcomingSecretReminders = useMemo(() => {
    return occasions.filter(o => o.isSecret && isOccasionDueForReminder(o).isDue);
  }, [occasions]);

  // إرسال إشعارات المتصفح بناءً على توقيت التنبيه المسبق
  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      try {
        if (Notification.permission === 'default') {
          Notification.requestPermission().catch(() => {});
        }
      } catch (e) {}
    }

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      upcomingPublicReminders.forEach(occasion => {
        const reminderStatus = isOccasionDueForReminder(occasion);
        if (!notifiedIds.current.has(occasion.id)) {
          try {
            const timeDesc = reminderStatus.isToday
              ? 'اليوم موعد المناسبة!'
              : reminderStatus.isTomorrow
              ? 'غداً موعد المناسبة!'
              : `موعد المناسبة يقترب (متبقي ${reminderStatus.daysRemaining} أيام)!`;

            new Notification(`تذكير مناسبة: ${occasion.title}`, {
              body: `${timeDesc} ${occasion.occasionType} لـ ${occasion.personName}. هل قمت بتجهيز التهنئة والهدية؟`,
              icon: '/icon.svg',
              dir: 'rtl'
            });
            notifiedIds.current.add(occasion.id);
          } catch (e) {}
        }
      });

      if (upcomingSecretReminders.length > 0) {
        const secretId = 'secret-alert-' + upcomingSecretReminders.length;
        if (!notifiedIds.current.has(secretId)) {
          try {
            new Notification('مناسباتي - تنبيه خاص مشفر 🔒', {
              body: 'هناك مناسبة خاصة جداً قادمة قريباً ومحددة بتوقيت تنبيه مسبق. افتح الخزنة بالبصمة للاطلاع على التفاصيل.',
              icon: '/icon.svg',
              dir: 'rtl'
            });
            notifiedIds.current.add(secretId);
          } catch (e) {}
        }
      }
    }
  }, [upcomingPublicReminders, upcomingSecretReminders]);

  const handleSaveOccasion = (data: Omit<Occasion, 'id'>) => {
    if (editingOccasion) {
      setOccasions(prev => prev.map(o => o.id === editingOccasion.id ? { ...data, id: o.id } : o));
    } else {
      const newOccasion: Occasion = { ...data, id: 'user-' + crypto.randomUUID() };
      setOccasions(prev => [...prev, newOccasion]);
    }
    setShowForm(false);
    setEditingOccasion(undefined);
  };

  const handleEdit = (occasion: Occasion) => {
    setEditingOccasion(occasion);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setDeletingOccasionId(id);
  };

  // تصفية المناسبات حسب التبويب النشط
  const displayedOccasions = useMemo(() => {
    let list: Occasion[] = [];

    if (activeTab === 'family') {
      list = occasions.filter(o => !o.isSecret && (o.category === 'الأهل' || o.category === 'عائلية' || o.relationship === 'عائلة' || o.scope === 'family'));
    } else if (activeTab === 'friends') {
      list = occasions.filter(o => !o.isSecret && (o.category === 'الأصدقاء' || o.category === 'أصدقاء' || o.relationship === 'صديق' || o.scope === 'friends'));
    } else if (activeTab === 'work') {
      list = occasions.filter(o => !o.isSecret && (o.category === 'العمل' || o.category === 'عمل' || o.relationship === 'زميل عمل' || o.scope === 'work'));
    } else if (activeTab === 'general') {
      list = occasions.filter(o => !o.isSecret && (o.category === 'عامة' || o.scope === 'general'));
    } else if (activeTab === 'all') {
      list = occasions.filter(o => !o.isSecret);
    } else {
      list = occasions;
    }

    return list
      .filter(o => {
        const matchesSearch =
          o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.personName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (o.notes && o.notes.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = filterCategory === 'جميع' || o.category === filterCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [occasions, activeTab, searchTerm, filterCategory]);

  const secretOccasionsList = useMemo(() => {
    return occasions.filter(o => o.isSecret || o.category === 'خاصة جداً');
  }, [occasions]);

  // إحصائيات سريعة للتبويبات
  const familyCount = useMemo(() => occasions.filter(o => !o.isSecret && (o.category === 'الأهل' || o.category === 'عائلية' || o.relationship === 'عائلة' || o.scope === 'family')).length, [occasions]);
  const friendsCount = useMemo(() => occasions.filter(o => !o.isSecret && (o.category === 'الأصدقاء' || o.category === 'أصدقاء' || o.relationship === 'صديق' || o.scope === 'friends')).length, [occasions]);
  const workCount = useMemo(() => occasions.filter(o => !o.isSecret && (o.category === 'العمل' || o.category === 'عمل' || o.relationship === 'زميل عمل' || o.scope === 'work')).length, [occasions]);
  const generalCount = useMemo(() => occasions.filter(o => !o.isSecret && (o.category === 'عامة' || o.scope === 'general')).length, [occasions]);
  const secretCount = useMemo(() => occasions.filter(o => o.isSecret || o.category === 'خاصة جداً').length, [occasions]);
  const publicCount = useMemo(() => occasions.filter(o => !o.isSecret).length, [occasions]);

  // تحديث حالة ربط منصة اجتماعية
  const handleUpdateSocialConnection = (platform: SocialPlatformId, isConnected: boolean, username?: string) => {
    setSocialConnections(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        isConnected,
        username: username || prev[platform].username
      }
    }));
  };

  // استيراد أعياد ميلاد الأصدقاء من إنستغرام أو فيسبوك
  const handleImportBirthdays = (newOccasions: Occasion[]) => {
    setOccasions(prev => {
      // تفادي التكرار
      const existingTitles = new Set(prev.map(p => p.title));
      const filtered = newOccasions.filter(no => !existingTitles.has(no.title));
      return [...prev, ...filtered];
    });
    // الانتقال تلقائياً لتبويب مناسبات الأصدقاء لعرضها للمستخدم فوراً
    setActiveTab('friends');
  };

  return (
    <div className="min-h-screen pb-24 bg-slate-50 text-slate-900 font-sans">
      {!isOnline && (
        <div className="bg-amber-500 text-white text-xs font-bold px-4 py-2 text-center sticky top-0 z-[150] shadow-md flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
          <span>وضع عدم الاتصال — بياناتك ومناسباتك مخزنة ومحمية بالكامل على جهازك.</span>
        </div>
      )}

      {/* الهيدر الأنيق والنظيف */}
      <header className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-900 text-white pt-8 pb-28 px-6 rounded-b-[4rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/20 rounded-full -ml-20 -mb-20 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start relative z-10 gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2 flex-wrap">
              <span className="text-3xl">✨</span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">مناسباتي</h1>
              
              {/* بطاقة المستخدم المسجل (Google / Apple ID) */}
              <button
                onClick={() => setShowAuthModal(true)}
                className="text-xs font-bold bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                title="تعديل اسمك ومعرفك الظاهر للناس"
              >
                <span>{currentUser.avatar}</span>
                <span>{currentUser.displayName}</span>
                <span className="text-indigo-200 font-mono text-[11px]">({currentUser.username})</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded">
                  {currentUser.authProvider === 'apple' ? '🍏 Apple' : '🔴 Google'}
                </span>
              </button>
            </div>
            
            <p className="text-indigo-100/90 text-sm sm:text-base leading-relaxed max-w-lg">
              تنظيم وتتبع مناسبات الأهل والأصدقاء والعمل، وتوثيق أسعد اللحظات مع خزنة سرية مؤمنة بالبصمة.
            </p>

            {/* أزرار الإجراءات السريعة في الهيدر */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <PWAInstallButton />
              
              {/* زر ربط وسائل التواصل الاجتماعي */}
              <button
                onClick={() => setShowSocialModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-gradient-to-r from-pink-500/80 to-purple-500/80 hover:from-pink-500 hover:to-purple-500 text-white border border-pink-300/30 transition-all hover:scale-105 active:scale-95 shadow-sm backdrop-blur-md"
                title="ربط إنستغرام وفيسبوك وسناب شات ومزامنة أعياد ميلاد الأصدقاء"
              >
                <span>📸</span>
                <span>ربط السوشيال ميديا</span>
              </button>

              <button
                onClick={() => setShowExportApk(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all hover:scale-105 active:scale-95 shadow-sm backdrop-blur-md"
                title="تصدير التطبيق إلى ملف APK أو تثبيته على الجوال"
              >
                <span>📦</span>
                <span>تصدير إلى APK</span>
              </button>

              <button
                onClick={() => {
                  setOccasions(INITIAL_OCCASIONS);
                  localStorage.setItem('munasabati_events', JSON.stringify(INITIAL_OCCASIONS));
                }}
                className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-2xl font-bold transition-all border border-white/15 flex items-center gap-1"
                title="استعادة المناسبات الافتراضية"
              >
                <span>🔄</span>
                <span>إعادة ضبط</span>
              </button>
            </div>
          </div>

          {/* زر الخزنة السرية السريع ورصيد المناسبات */}
          <div className="flex flex-col sm:flex-row md:flex-col items-end gap-3 w-full md:w-auto">
            {/* بطاقة الخزنة السرية المصغرة */}
            <button
              onClick={() => {
                setActiveTab('secret');
                if (!isVaultUnlocked) {
                  setShowQuickBiometricModal(true);
                }
              }}
              className={`w-full sm:w-auto p-3.5 rounded-3xl border transition-all text-right flex items-center justify-between sm:justify-start gap-4 cursor-pointer backdrop-blur-md shadow-lg ${
                isVaultUnlocked
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                  : 'bg-slate-900/60 hover:bg-slate-900/80 border-slate-700/80 text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${
                  isVaultUnlocked ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-emerald-400'
                }`}>
                  {isVaultUnlocked ? '🔓' : '🔒'}
                </div>
                <div>
                  <span className="text-[11px] block text-slate-300">الخزنة السرية (بصمة)</span>
                  <span className="text-xs font-black text-emerald-300">
                    {isVaultUnlocked ? 'مفتوحة الآن' : `${secretCount} مناسبة خاصة`}
                  </span>
                </div>
              </div>
              <span className="text-[11px] bg-white/15 px-2.5 py-1 rounded-xl font-bold">
                {isVaultUnlocked ? 'عرض' : 'فتح 👆'}
              </span>
            </button>

            {/* زر الانتقال للإحصائيات */}
            <button
              onClick={() => setActiveTab(activeTab === 'stats' ? 'family' : 'stats')}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 transition-all p-3 rounded-2xl border border-white/20 backdrop-blur-md text-right flex items-center justify-between gap-3 text-xs font-bold"
            >
              <span>📊 الرسوم البيانية والإحصائيات</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[11px]">{occasions.length}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 -mt-16 relative z-20">
        {/* رسالة الترحيب وربط وسائل التواصل الاجتماعي (إنستغرام وفيسبوك) */}
        {showSocialWelcomeBanner && (
          <SocialWelcomeBanner
            user={currentUser}
            connections={socialConnections}
            onOpenSocialModal={() => setShowSocialModal(true)}
            onDismiss={() => setShowSocialWelcomeBanner(false)}
          />
        )}

        {/* شريط التبويبات الرئيسي: الأهل، الأصدقاء، العمل، عامة، خاصة جداً (الخزنة)، الإحصائيات */}
        <div className="bg-white/95 backdrop-blur-md p-2 rounded-3xl shadow-xl border border-slate-100 mb-6 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* تبويب مناسبات الأهل */}
            <button
              onClick={() => setActiveTab('family')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'family'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>👨‍👩‍👧‍👦</span>
              <span>مناسبات الأهل</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                activeTab === 'family' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {familyCount}
              </span>
            </button>

            {/* تبويب مناسبات الأصدقاء */}
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'friends'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>🤝</span>
              <span>مناسبات الأصدقاء</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                activeTab === 'friends' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {friendsCount}
              </span>
            </button>

            {/* تبويب مناسبات العمل */}
            <button
              onClick={() => setActiveTab('work')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'work'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>💼</span>
              <span>مناسبات العمل</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                activeTab === 'work' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {workCount}
              </span>
            </button>

            {/* تبويب المناسبات العامة (رأس السنة، عيد الحب، عيد الأم) */}
            <button
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'general'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>🌟</span>
              <span>مناسبات عامة</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                activeTab === 'general' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {generalCount}
              </span>
            </button>

            {/* تبويب المناسبات الخاصة جداً (الخزنة المقفلة بالبصمة) */}
            <button
              onClick={() => {
                setActiveTab('secret');
                if (!isVaultUnlocked) {
                  setShowQuickBiometricModal(true);
                }
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'secret'
                  ? 'bg-slate-900 text-emerald-400 shadow-md border border-emerald-500/30'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-emerald-50/70 border border-emerald-200/60'
              }`}
            >
              <span>{isVaultUnlocked ? '🔓' : '🔒'}</span>
              <span>مناسبات خاصة (الخزنة)</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === 'secret' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {secretCount}
              </span>
            </button>

            {/* تبويب كل المناسبات */}
            <button
              onClick={() => setActiveTab('all')}
              className={`hidden md:flex items-center gap-1 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>✨</span>
              <span>الكل ({publicCount})</span>
            </button>

            {/* تبويب الإحصائيات */}
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-1 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'stats'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>📊</span>
              <span className="hidden sm:inline">الإحصائيات</span>
            </button>
          </div>

          {/* زر إضافة مناسبة */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingOccasion(undefined);
                setShowForm(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-2xl transition-all shadow-md shadow-indigo-200 flex items-center gap-1.5 active:scale-95"
            >
              <span>➕</span>
              <span>
                {activeTab === 'secret' ? 'إضافة مناسبة سرية' : 'إضافة مناسبة'}
              </span>
            </button>
          </div>
        </div>

        {/* التنبيه المشفر السري للخزنة الخاصة */}
        {upcomingSecretReminders.length > 0 && (
          <div className="bg-slate-900 border-2 border-emerald-500/40 text-white p-5 rounded-3xl mb-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-3.5 text-right w-full sm:w-auto">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex-shrink-0 animate-pulse">
                🔒
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-black text-sm sm:text-base text-white">
                    تنبيه أمني مشفر: هناك مناسبة خاصة جداً قادمة!
                  </h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/40">
                    محمية بالبصمة
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  تم حجب الأسماء والملاحظات لحماية خصوصيتك (على غرار محادثات واتساب المشفرة). افتح بالبصمة للاطلاع.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveTab('secret');
                setShowQuickBiometricModal(true);
              }}
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/25 whitespace-nowrap active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>👆</span>
              <span>فتح وعرض التفاصيل بالبصمة</span>
            </button>
          </div>
        )}

        {/* تنبيه المناسبات العامة والعائلية القادمة بناءً على توقيت التنبيه المسبق */}
        {upcomingPublicReminders.length > 0 && (
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 backdrop-blur-md border-2 border-amber-300/80 p-5 rounded-3xl mb-6 shadow-lg">
            <div className="flex items-start gap-3.5 mb-3">
              <div className="bg-amber-500 text-white p-2.5 rounded-2xl shadow-md shadow-amber-200 text-xl flex-shrink-0 animate-bounce">
                🔔
              </div>
              <div className="flex-1 text-right">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-black text-slate-800 text-sm sm:text-base">
                    تنبيهات المناسبات القادمة ({upcomingPublicReminders.length} مناسبة ضمن وقت التنبيه المحدد):
                  </h3>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                    تذكير مسبق تلقائي
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  تم تفعيل هذه التنبيهات بناءً على خيار التوقيت المسبق الذي حددته لكل مناسبة:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {upcomingPublicReminders.map((occ) => {
                const status = isOccasionDueForReminder(occ);
                const opt = getReminderOption(occ.reminderTiming);
                return (
                  <div
                    key={occ.id}
                    className="bg-white/90 p-3 rounded-2xl border border-amber-200/70 shadow-sm flex items-center justify-between gap-3 text-right"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {occ.title}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${status.statusBadge.bg} ${status.statusBadge.textColor}`}>
                          {status.statusBadge.text}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        لـ <span className="font-bold text-slate-700">{occ.personName}</span> ({occ.occasionType}) • ضبط التنبيه: {opt.shortLabel}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setCongratulationOccasion(occ)}
                        className="p-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all shadow-sm"
                        title="تجهيز التهنئة الآن"
                      >
                        <span>✨ تهنئة</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewingOccasion(occ)}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                        title="عرض التفاصيل"
                      >
                        <span>👁️</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* محتوى التبويب النشط */}
        {activeTab === 'stats' ? (
          <OccasionStats
            occasions={occasions}
            onAddSampleData={() => {
              setOccasions(INITIAL_OCCASIONS);
              localStorage.setItem('munasabati_events', JSON.stringify(INITIAL_OCCASIONS));
            }}
            onOpenAddForm={() => {
              setEditingOccasion(undefined);
              setShowForm(true);
            }}
          />
        ) : activeTab === 'secret' ? (
          <SecretVaultView
            isUnlocked={isVaultUnlocked}
            onUnlock={() => setIsVaultUnlocked(true)}
            onLock={() => setIsVaultUnlocked(false)}
            secretOccasions={secretOccasionsList}
            onAddOccasion={() => {
              setEditingOccasion(undefined);
              setShowForm(true);
            }}
            onEditOccasion={handleEdit}
            onDeleteOccasion={handleDelete}
            onViewDetails={(occ) => setViewingOccasion(occ)}
            onGenerateCongratulation={(occ) => setCongratulationOccasion(occ)}
          />
        ) : (
          <>
            <div className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    {activeTab === 'family' && <span>👨‍👩‍👧‍👦 مناسبات الأهل والعائلة</span>}
                    {activeTab === 'friends' && <span>🤝 مناسبات الأصدقاء (مرتبطة بإنستغرام وفيسبوك)</span>}
                    {activeTab === 'work' && <span>💼 مناسبات العمل والزملاء</span>}
                    {activeTab === 'general' && <span>🌟 المناسبات العامة (رأس السنة، عيد الحب، عيد الأم)</span>}
                    {activeTab === 'all' && <span>✨ جميع المناسبات المحفوظة</span>}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeTab === 'family' && 'أعياد ميلاد، تخرج، ذكرى زواج، ومناسبات الأهل والوالدين والأقارب.'}
                    {activeTab === 'friends' && 'أعياد ميلاد الأصدقاء وتواريخ ميلادهم المستوردة تلقائياً من إنستغرام وفيسبوك.'}
                    {activeTab === 'work' && 'ترقيات، إنجازات، ومناسبات زملاء وبيئة العمل.'}
                    {activeTab === 'general' && 'المناسبات العامة المشتركة: عيد رأس السنة الميلادية، عيد الحب، وعيد الأم.'}
                    {activeTab === 'all' && 'استعراض شامل لكافة المناسبات المسجلة.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {activeTab === 'friends' && (
                    <button
                      onClick={() => setShowSocialModal(true)}
                      className="text-xs font-bold text-pink-700 bg-pink-50 hover:bg-pink-100 px-3.5 py-2 rounded-xl border border-pink-200 transition-all flex items-center gap-1.5"
                    >
                      <span>📸</span>
                      <span>مزامنة الأصدقاء</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowCategoryManager(true)}
                    className="text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 transition-all flex items-center gap-1.5"
                  >
                    <span>🏷️</span>
                    <span>التصنيفات ({categories.length})</span>
                  </button>
                </div>
              </div>

              {/* حقل البحث */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث بالاسم أو عنوان المناسبة..."
                  className="w-full pr-12 pl-4 py-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all text-sm text-right"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="absolute right-4 top-3.5 text-slate-400">🔍</span>
              </div>

              {/* أزرار التصفية السريعة للتصنيفات */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
                <span className="text-slate-400 text-xs whitespace-nowrap pl-1">
                  تصفية:
                </span>
                <button
                  onClick={() => setFilterCategory('جميع')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                    filterCategory === 'جميع'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  الكل ({displayedOccasions.length})
                </button>
                {categories.map((cat) => {
                  const isSelected = filterCategory === cat;
                  const count = displayedOccasions.filter((o) => o.category === cat).length;
                  const style = getCategoryStyle(cat);

                  return (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                        isSelected
                          ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                          : `${style.bg} ${style.text} ${style.border} hover:opacity-85`
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : style.dot}`} />
                      <span>{cat}</span>
                      <span className="text-[10px] opacity-75">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* شبكة بطاقات المناسبات */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayedOccasions.length > 0 ? (
                displayedOccasions.map(occasion => (
                  <OccasionCard
                    key={occasion.id}
                    occasion={occasion}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isUpcoming={isOccasionDueForReminder(occasion).isDue}
                    onViewDetails={(occ) => setViewingOccasion(occ)}
                    onGenerateCongratulation={(occ) => setCongratulationOccasion(occ)}
                  />
                ))
              ) : (
                <div className="col-span-full py-28 text-center bg-white rounded-3xl border border-slate-100 p-6">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-xl font-bold text-slate-800">لا توجد مناسبات مسجلة في هذا التبويب</h3>
                  <p className="text-slate-500 text-xs mt-1 mb-6">
                    {activeTab === 'friends'
                      ? 'اربط حساب إنستغرام أو فيسبوك لاستيراد أعياد ميلاد أصدقائك بضغطة واحدة، أو أضف يدوياً.'
                      : 'أضف مناسبة جديدة لهذا القسم ليتولى التطبيق تذكيرك وصياغة التهاني.'}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    {activeTab === 'friends' && (
                      <button
                        onClick={() => setShowSocialModal(true)}
                        className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold px-5 py-2.5 rounded-2xl shadow-md text-xs transition-all"
                      >
                        مزامنة أصدقاء إنستغرام وفيسبوك
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingOccasion(undefined);
                        setShowForm(true);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-2xl shadow-md shadow-indigo-200 transition-all text-xs"
                    >
                      إضافة مناسبة جديدة
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* زر عائم سفلي لإضافة مناسبة */}
      <button
        onClick={() => {
          setEditingOccasion(undefined);
          setShowForm(true);
        }}
        className="fixed bottom-8 left-8 bg-indigo-600 hover:bg-indigo-500 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transform transition-all hover:scale-110 active:scale-95 z-50 group border-2 border-white/20"
        title="إضافة مناسبة جديدة"
      >
        <svg className="w-8 h-8 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* نافذة التحقق السريعة بالبصمة */}
      <BiometricAuthModal
        isOpen={showQuickBiometricModal}
        onSuccess={() => {
          setShowQuickBiometricModal(false);
          setIsVaultUnlocked(true);
          setActiveTab('secret');
        }}
        onClose={() => setShowQuickBiometricModal(false)}
      />

      {/* نافذة تسجيل الدخول وتعديل اسم المستخدم (Google / Apple ID) */}
      <AuthProfileModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        currentUser={currentUser}
        onSaveProfile={(updatedProfile, triggerSocial) => {
          setCurrentUser(updatedProfile);
          if (triggerSocial) {
            setShowSocialModal(true);
          }
        }}
      />

      {/* نافذة ربط شبكات التواصل الاجتماعي (إنستغرام، فيسبوك، سناب، تيك توك) ومزامنة أعياد الميلاد */}
      <SocialConnectModal
        isOpen={showSocialModal}
        onClose={() => setShowSocialModal(false)}
        currentUser={currentUser}
        connections={socialConnections}
        onUpdateConnection={handleUpdateSocialConnection}
        onImportBirthdays={handleImportBirthdays}
      />

      {/* نموذج إضافة وتعديل المناسبة */}
      {showForm && (
        <OccasionForm
          initialData={editingOccasion}
          availableCategories={categories}
          onAddCategory={handleAddCategory}
          defaultIsSecret={activeTab === 'secret'}
          defaultScope={
            activeTab === 'family' 
              ? 'family' 
              : (activeTab === 'friends' 
                  ? 'friends' 
                  : (activeTab === 'work' 
                      ? 'work' 
                      : (activeTab === 'general' ? 'general' : undefined)))
          }
          onSave={handleSaveOccasion}
          onCancel={() => {
            setShowForm(false);
            setEditingOccasion(undefined);
          }}
        />
      )}

      {/* نافذة إدارة التصنيفات */}
      <CategoryManagerModal
        isOpen={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        occasions={occasions}
      />

      {/* نافذة تأكيد حذف المناسبة */}
      <ConfirmDialog
        isOpen={Boolean(deletingOccasionId)}
        variant="danger"
        title="تأكيد حذف المناسبة"
        message="هل أنت متأكد من رغبتك في حذف هذه المناسبة؟ سيتم إزالتها نهائياً ولن تتمكن من استرجاعها."
        confirmText="نعم، حذف المناسبة"
        cancelText="تراجع وإلغاء"
        onConfirm={() => {
          if (deletingOccasionId) {
            setOccasions(prev => prev.filter(o => o.id !== deletingOccasionId));
            setDeletingOccasionId(null);
          }
        }}
        onCancel={() => setDeletingOccasionId(null)}
      />

      {/* نافذة تصدير APK والنسخ الاحتياطي للجوال */}
      <ExportApkModal
        isOpen={showExportApk}
        onClose={() => setShowExportApk(false)}
        occasions={occasions}
        onImportOccasions={(imported) => {
          setOccasions(imported);
          localStorage.setItem('munasabati_events', JSON.stringify(imported));
        }}
      />

      {/* نافذة استعراض تفاصيل المناسبة */}
      <OccasionDetailsModal
        isOpen={Boolean(viewingOccasion)}
        occasion={viewingOccasion}
        onClose={() => setViewingOccasion(null)}
        onGenerateCongratulation={(occ) => {
          setViewingOccasion(null);
          setCongratulationOccasion(occ);
        }}
        onEdit={(occ) => {
          setViewingOccasion(null);
          handleEdit(occ);
        }}
        onDelete={(id) => {
          setViewingOccasion(null);
          handleDelete(id);
        }}
      />

      {/* نافذة توليد التهنئة بالذكاء الاصطناعي مع توقيع اسم المستخدم ومشاركتها */}
      <CongratulationModal
        isOpen={Boolean(congratulationOccasion)}
        occasion={congratulationOccasion}
        currentUser={currentUser}
        onClose={() => setCongratulationOccasion(null)}
      />

      <footer className="mt-20 text-center text-slate-400 text-xs pb-10">
        <p>© 2026 مناسباتي - رفيقك لكل احتفال ومناسبة</p>
      </footer>
    </div>
  );
};

export default App;
