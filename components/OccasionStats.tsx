import React, { useState, useMemo } from 'react';
import { Occasion, Category, Relationship, OccasionType } from '../types';
import { RELATIONSHIP_ICONS, getCategoryStyle } from '../constants';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface OccasionStatsProps {
  occasions: Occasion[];
  onAddSampleData?: () => void;
  onOpenAddForm?: () => void;
}

// ألوان مخصصة للتصاميم
const CATEGORY_COLORS: Record<Category, string> = {
  'خاصة': '#8b5cf6', // بنفسجي
  'عامة': '#10b981',  // زمردي
};

const RELATIONSHIP_COLORS: Record<Relationship, string> = {
  'عائلة': '#6366f1',   // نيلي
  'صديق': '#ec4899',   // وردي
  'زميل عمل': '#0284c7', // أزرق سماوي
  'قريب': '#f59e0b',    // برتقالي عنبري
  'عامة / رسمية': '#0d9488', // تيل
  'أخرى': '#64748b',    // رمادي
};

const TYPE_COLORS = [
  '#6366f1',
  '#ec4899',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#06b6d4',
  '#64748b'
];

const MONTH_NAMES = [
  'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

// مكوّن تولتيب مخصص ليدعم اللغة العربية وRTL بشكل رائع
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900/95 text-white px-3 py-2 rounded-xl text-xs shadow-xl border border-slate-800 backdrop-blur-md">
        <p className="font-bold text-slate-200 mb-1">{label || data.name}</p>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.fill || data.color }} />
          <span className="text-slate-300">العدد:</span>
          <span className="font-bold text-white text-sm">{data.value}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const OccasionStats: React.FC<OccasionStatsProps> = ({
  occasions,
  onAddSampleData,
  onOpenAddForm
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'categories' | 'relationships' | 'timeline'>('all');

  // إحصائيات عامة
  const totalCount = occasions.length;

  // توزيع الفئات / التصنيفات المخصصة
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    occasions.forEach(o => {
      const cat = o.category || 'غير مصنف';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key],
      percentage: totalCount > 0 ? Math.round((counts[key] / totalCount) * 100) : 0,
      color: getCategoryStyle(key).hex || '#6366f1'
    })).sort((a, b) => b.value - a.value);
  }, [occasions, totalCount]);

  // توزيع العلاقات
  const relationshipData = useMemo(() => {
    const counts: Record<Relationship, number> = {
      'عائلة': 0,
      'صديق': 0,
      'زميل عمل': 0,
      'قريب': 0,
      'عامة / رسمية': 0,
      'أخرى': 0
    };
    occasions.forEach(o => {
      if (counts[o.relationship] !== undefined) {
        counts[o.relationship]++;
      } else {
        counts['أخرى']++;
      }
    });
    return (Object.keys(counts) as Relationship[]).map(rel => ({
      name: rel,
      displayName: `${RELATIONSHIP_ICONS[rel]} ${rel}`,
      count: counts[rel],
      fill: RELATIONSHIP_COLORS[rel]
    }));
  }, [occasions]);

  // توزيع أنواع المناسبات
  const typeData = useMemo(() => {
    const counts: Record<string, number> = {};
    occasions.forEach(o => {
      const type = o.occasionType || 'أخرى';
      counts[type] = (counts[type] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count], index) => ({
        name,
        count,
        fill: TYPE_COLORS[index % TYPE_COLORS.length]
      }))
      .sort((a, b) => b.count - a.count);
  }, [occasions]);

  // التوزيع حسب شهور السنة
  const monthlyData = useMemo(() => {
    const monthCounts = Array(12).fill(0);
    occasions.forEach(o => {
      if (o.date) {
        const month = new Date(o.date).getMonth();
        if (!isNaN(month) && month >= 0 && month < 12) {
          monthCounts[month]++;
        }
      }
    });

    return MONTH_NAMES.map((monthName, idx) => ({
      name: monthName,
      shortName: monthName.slice(0, 4),
      count: monthCounts[idx]
    }));
  }, [occasions]);

  // أبرز الرؤى (Insights)
  const insights = useMemo(() => {
    if (occasions.length === 0) return null;

    // الأكثر في العلاقات
    let topRel = relationshipData[0];
    relationshipData.forEach(r => {
      if (r.count > topRel.count) topRel = r;
    });

    // الشهر الأكثر ازدحاماً
    let topMonth = monthlyData[0];
    monthlyData.forEach(m => {
      if (m.count > topMonth.count) topMonth = m;
    });

    // نسبة المناسبات الخاصة
    const privateCat = categoryData.find(c => c.name === 'خاصة');
    const privatePercent = privateCat ? privateCat.percentage : 0;

    return {
      topRelationship: topRel.count > 0 ? topRel.name : 'لا توجد بيانات كافية',
      topRelationshipCount: topRel.count,
      topMonthName: topMonth.count > 0 ? topMonth.name : 'غير محدد',
      topMonthCount: topMonth.count,
      privatePercent
    };
  }, [occasions, relationshipData, monthlyData, categoryData]);

  if (totalCount === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center my-6">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl mx-auto flex items-center justify-center text-4xl mb-4">
          📊
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">لا توجد إحصائيات لعرضها حالياً</h3>
        <p className="text-slate-500 max-w-md mx-auto mb-6 text-sm">
          أضف مناسباتك لترى رسوماً بيانية تفاعلية توضح توزيع مناسباتك حسب التصنيف وصلة القرابة والشهور.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {onOpenAddForm && (
            <button
              onClick={onOpenAddForm}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-100"
            >
              إضافة مناسبة جديدة
            </button>
          )}
          {onAddSampleData && (
            <button
              onClick={onAddSampleData}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-6 py-2.5 rounded-xl transition-all border border-indigo-200"
            >
              تحميل مناسبات تجريبية للاستكشاف ✨
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-10">
      {/* بطاقات المؤشرات الرئيسية (KPI Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* إجمالي المناسبات */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white p-5 rounded-3xl shadow-lg shadow-indigo-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-indigo-100">إجمالي المناسبات</span>
            <span className="text-xl">🎉</span>
          </div>
          <div className="text-3xl font-extrabold">{totalCount}</div>
          <p className="text-[11px] text-indigo-200 mt-1">مسجلة في دفتر ذكرياتك</p>
        </div>

        {/* التصنيف الأول */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-500">التصنيف الأعلى</span>
            <span
              className="w-2.5 h-2.5 rounded-full ring-4 ring-slate-100"
              style={{ backgroundColor: categoryData[0]?.color || '#8b5cf6' }}
            />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800 truncate max-w-[130px]">
              {categoryData[0]?.name || 'لا يوجد'}
            </span>
            {categoryData[0] && (
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {categoryData[0].value} ({categoryData[0].percentage}%)
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">أكثر التصنيفات تكراراً بمناسباتك</p>
        </div>

        {/* التصنيف الثاني أو إجمالي التصنيفات */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-500">
              {categoryData.length > 1 ? 'التصنيف الثاني' : 'عدد التصنيفات'}
            </span>
            <span
              className="w-2.5 h-2.5 rounded-full ring-4 ring-slate-100"
              style={{ backgroundColor: categoryData[1]?.color || '#10b981' }}
            />
          </div>
          <div className="flex items-baseline gap-2">
            {categoryData.length > 1 ? (
              <>
                <span className="text-2xl font-extrabold text-slate-800 truncate max-w-[130px]">
                  {categoryData[1]?.name}
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {categoryData[1]?.value} ({categoryData[1]?.percentage}%)
                </span>
              </>
            ) : (
              <>
                <span className="text-3xl font-extrabold text-slate-800">
                  {categoryData.length}
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  تصنيف نشط
                </span>
              </>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {categoryData.length > 1 ? 'ثاني أكبر نسبة مشاركة' : 'إجمالي التصنيفات المخصصة'}
          </p>
        </div>

        {/* أبرز صلة قرابة */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-500">الأكثر احتفالاً بـ</span>
            <span className="text-xl">❤️</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-800 truncate">
            {insights?.topRelationship || '-'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {insights ? `${insights.topRelationshipCount} مناسبات مسجلة` : ''}
          </p>
        </div>
      </div>

      {/* أزرار التبديل والتنقل بين الرسوم */}
      <div className="flex flex-wrap gap-2 items-center justify-between bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            📊 جميع المخططات
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'categories'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            التصنيف (خاصة / عامة)
          </button>
          <button
            onClick={() => setActiveTab('relationships')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'relationships'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            صلة القرابة والعلاقة
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'timeline'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            الشهور والأنواع
          </button>
        </div>

        <div className="text-xs text-slate-400 px-2 font-medium">
          محدث لحظياً استناداً لمناسباتك
        </div>
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* الرسم 1: توزيع المناسبات حسب التصنيف (خاصة / عامة) */}
        {(activeTab === 'all' || activeTab === 'categories') && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  توزيع المناسبات حسب التصنيف
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">مقارنة بين المناسبات الخاصة والعامة</p>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                نسبة مئوية
              </span>
            </div>

            <div className="h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-xs font-bold text-slate-700 mx-1">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* عداد مركزي داخل الدائرة المجوفة */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
                <span className="text-2xl font-black text-slate-800">{totalCount}</span>
                <span className="text-[10px] text-slate-400">مناسبة</span>
              </div>
            </div>

            {/* تفاصيل سريعة أسفل الرسم */}
            <div className="grid grid-cols-2 gap-3 mt-2 pt-4 border-t border-slate-50">
              {categoryData.map(c => (
                <div key={c.name} className="flex items-center justify-between bg-slate-50/70 p-2.5 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md" style={{ backgroundColor: c.color }} />
                    <span className="text-xs font-bold text-slate-700">{c.name}</span>
                  </div>
                  <div className="text-xs font-black text-slate-800">
                    {c.value} <span className="text-[10px] font-normal text-slate-500">({c.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* الرسم 2: توزيع المناسبات حسب صلة القرابة / العلاقة */}
        {(activeTab === 'all' || activeTab === 'relationships') && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  توزيع المناسبات حسب العلاقة
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">عائلة، أصدقاء، زملاء عمل، وأقارب</p>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                عدد الأشخاص
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={relationshipData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="displayName"
                    tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'Cairo' }}
                    interval={0}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'Cairo' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="عدد المناسبات" radius={[8, 8, 0, 0]}>
                    {relationshipData.map((entry) => (
                      <Cell key={`bar-${entry.name}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* شريط مؤشرات سريعة للعلاقات */}
            <div className="flex flex-wrap gap-2 mt-2 pt-4 border-t border-slate-50">
              {relationshipData.map(r => (
                <div key={r.name} className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl text-xs">
                  <span>{RELATIONSHIP_ICONS[r.name as Relationship]}</span>
                  <span className="text-slate-600 font-medium">{r.name}:</span>
                  <span className="font-bold text-slate-800">{r.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* الرسم 3: توزيع المناسبات حسب نوع المناسبة */}
        {(activeTab === 'all' || activeTab === 'timeline') && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                  أنواع المناسبات الأكثر تكراراً
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">أعياد ميلاد، تخرج، زواج، أعياد دينية</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={typeData}
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'Cairo' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#334155', fontWeight: 600, fontFamily: 'Cairo' }}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="العدد" radius={[0, 8, 8, 0]}>
                    {typeData.map((entry, index) => (
                      <Cell key={`type-${entry.name}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* الرسم 4: التوزيع عبر شهور السنة */}
        {(activeTab === 'all' || activeTab === 'timeline') && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  كثافة المناسبات على مدار العام
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">توزيع المناسبات عبر شهور السنة الـ 12</p>
              </div>
              {insights?.topMonthName && insights.topMonthCount > 0 && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
                  الأكثر: {insights.topMonthName}
                </span>
              )}
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="shortName"
                    tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'Cairo' }}
                    interval={0}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'Cairo' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="المناسبات"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorCount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OccasionStats;
