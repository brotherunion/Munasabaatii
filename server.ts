import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API Endpoint for generating custom congratulations
app.post('/api/generate-congratulation', async (req, res) => {
  try {
    const { occasion, tone = 'warm' } = req.body;

    if (!occasion || !occasion.personName || !occasion.occasionType) {
      return res.status(400).json({ error: 'Missing required occasion details' });
    }

    const toneDescriptions: Record<string, string> = {
      warm: 'دافئة ومحبة وصادقة، مليئة بالمشاعر الطيبة والدعوات القلبية وتناسب القلوب القريبة',
      formal: 'راقية ورسمية واحترافية ومحترمة، مناسبة لزملاء العمل والعلاقات الرسمية',
      funny: 'مرحة ولطيفة وخفيفة الظل وتبث الفرح والابتسامة',
      poetic: 'أدبية بليغة وذات طابع شاعري فصيح وعميق الأثر',
      short: 'موجزة ومكثفة مناسبة لرسائل WhatsApp أو SMS السريعة مع بقاء رونقها'
    };

    const selectedToneDesc = toneDescriptions[tone] || toneDescriptions.warm;

    const ai = getGeminiClient();

    let generatedText: string | null = null;
    let isAi = false;

    if (ai) {
      try {
        const prompt = `
اكتب رسالة تهنئة باللغة العربية متقنة وبليغة ومخصصة جداً:
- نوع المناسبة: ${occasion.occasionType}
- عنوان المناسبة: ${occasion.title || occasion.occasionType}
- اسم الشخص المحتفى به: ${occasion.personName}
- صلة القرابة / العلاقة: ${occasion.relationship || 'صديق'}
- أسلوب النبرة المطلوب: ${selectedToneDesc}
- تفاصيل أو ملاحظات إضافية خاصة: ${occasion.notes ? occasion.notes : 'لا يوجد'}

الشروط والتعليمات:
1. خاطب ${occasion.personName} مباشرة بأسلوب لبق ومحبب.
2. اجعل الكلمات تنبض بالصدق والبهجة وتناسب نوع المناسبة (${occasion.occasionType}) والصلة (${occasion.relationship}).
3. أضف دعاءً جميلاً بالبركة والتوفيق والسعادة الدائمة.
4. ضمّن بعض الإيموجيز المعبرة والجميلة المناسبة للحدث.
5. لا تكتب أي مقدمات أو شروحات إضافية، أعطني نص الرسالة فقط ليكون جاهزاً للنسخ والإرسال فوراً.
        `.trim();

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: 'أنت خبير محترف ومبدع في كتابة وتأليف أجمل رسائل التهنئة والمباركات الاجتماعية العربية الأصيلة.',
          },
        });

        if (response.text?.trim()) {
          generatedText = response.text.trim();
          isAi = true;
        }
      } catch (geminiError: any) {
        console.warn('Gemini API call warning (using smart fallback):', geminiError.message || geminiError);
      }
    }

    if (generatedText) {
      return res.json({ congratulation: generatedText, isAiGenerated: isAi });
    }


    // Contextual fallback when Gemini API key is not configured or server is in local offline test
    const fallbackGreetings: Record<string, string> = {
      'عيد ميلاد': `كل عام وأنت بألف خير وسعادة يا ${occasion.personName}! 🎉🎂 أتمنى لك عاماً جديداً مليئاً بالصحة والنجاح وتحقيق كل ما تتمنى. عسى أيامك كلها أفراح وبركة.`,
      'زواج': `بارك الله لكما وبارك عليكما وجمع بينكما في خير يا ${occasion.personName}! 💍💐 ألف مبروك الزواج الميمون، ودامت بيوتكم عامرة بالمودة والرحمة والسكينة.`,
      'تخرج': `ألف ألف مبروك التخرج والتفوق يا ${occasion.personName}! 🎓✨ فخورون بك وبإنجازك الرائع، ونتمنى لك مستقبلاً مشرقاً وحياة عملية حافلة بالنجاحات.`,
      'عيد ديني': `تقبل الله طاعاتكم وصالح أعمالكم يا ${occasion.personName}، وكل عام وأنتم والأهل بأتم الصحة والعافية والمسرات. 🌙✨`,
      'عيد وطني': `دام عز الوطن ورفعته، وكل عام وبلادنا الغالية وأهلها الكرام بخير وأمن وازدهار. 🇸🇦✨`,
      'ذكرى سنوية': `ذكرى سنوية سعيدة ومباركة لك يا ${occasion.personName}، دامت أيامكم عامرة بالمحبة والوفاء وراحة البال. 🥂❤️`
    };

    const defaultFallback = fallbackGreetings[occasion.occasionType] ||
      `أجمل التهاني وأصدق التبريكات لك يا ${occasion.personName} بمناسبة ${occasion.title || occasion.occasionType}! 🎊 نسأل الله لك دوام التوفيق والتميز ودوام الأفراح والمسرات.`;

    return res.json({
      congratulation: defaultFallback,
      isAiGenerated: false
    });

  } catch (err: any) {
    console.error('Error in /api/generate-congratulation:', err);
    res.status(500).json({
      error: 'فشل توليد التهنئة، يرجى المحاولة لاحقاً',
      details: err.message
    });
  }
});

// API Endpoint for generating intelligent tailored gift suggestions
app.post('/api/generate-gift-suggestions', async (req, res) => {
  try {
    const { occasion } = req.body;

    if (!occasion || !occasion.personName || !occasion.occasionType) {
      return res.status(400).json({ error: 'Missing required occasion details' });
    }

    const ai = getGeminiClient();
    let suggestions: any[] | null = null;
    let isAi = false;

    if (ai) {
      try {
        const prompt = `
أنت مستشار هدايا ذكي وخبير في الذوق الاجتماعي بالشرق الأوسط والعالم العربي.
اقترح قائمة من 4 إلى 5 أفكار هدايا ذكية ومميزة ومبتكرة تناسب تماماً هذه المناسبة:
- اسم الشخص المحتفى به: ${occasion.personName}
- صلة القرابة / العلاقة: ${occasion.relationship || 'صديق'}
- نوع المناسبة: ${occasion.occasionType}
- عنوان المناسبة: ${occasion.title}
- ملاحظات واهتمامات خاصة: ${occasion.notes || 'لا توجد ملاحظات إضافية'}

المطلوب: إرجاع الرد حصراً بصيغة JSON Array بدون أي مقدمات أو نصوص خارج الأقواس، مع مراعاة تنوع الفئات والأسعار:
[
  {
    "id": "1",
    "title": "اسم فكرة الهدية (مثال: محفظة جلدية منقوشة بالاسم)",
    "category": "عاطفية وتذكارية" | "عملية ومفيدة" | "فاخرة وتجربة خاصة" | "رمزية ومبتكرة",
    "description": "وصف جذاب ومختصر للهدية وكيفية تقديمها",
    "priceEstimate": "اقتصادي (مناسب للجميع)" | "متوسط (قيمة ممتازة)" | "فاخر (مميز وخاص)",
    "whySuitable": "شرح مقنع وموجز لسبب ملاءمة هذه الهدية للشخص (${occasion.personName}) ونوع المناسبة (${occasion.occasionType}) والصلة (${occasion.relationship})",
    "icon": "رمز إيموجي ملائم للهدية مثل ⌚ أو 📚 أو ☕ أو 💐"
  }
]
        `.trim();

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: 'أنت مستشار هدايا محترف يقترح هدايا واقعية وراقية تناسب الثقافة العربية وصلات القرابة المختلفة وتدخل السرور على قلب المتلقي.',
            responseMimeType: 'application/json',
          },
        });

        if (response.text?.trim()) {
          const parsed = JSON.parse(response.text.trim());
          if (Array.isArray(parsed) && parsed.length > 0) {
            suggestions = parsed;
            isAi = true;
          }
        }
      } catch (geminiError: any) {
        console.warn('Gemini Gift suggestions warning (using contextual fallback):', geminiError.message || geminiError);
      }
    }

    if (suggestions && suggestions.length > 0) {
      return res.json({ suggestions, isAiGenerated: isAi });
    }

    // Contextual smart fallback based on relationship & occasion type
    const personLower = (occasion.personName || '').toLowerCase();
    const isFather = occasion.relationship === 'عائلة' && (personLower.includes('أب') || personLower.includes('والد') || personLower.includes('بابا') || occasion.title.includes('أب'));
    const isMother = occasion.relationship === 'عائلة' && (personLower.includes('أم') || personLower.includes('والدة') || personLower.includes('ماما') || occasion.title.includes('أم'));
    const isSpouse = occasion.relationship === 'عائلة' && (occasion.occasionType === 'زواج' || occasion.occasionType === 'ذكرى سنوية' || personLower.includes('شريك') || personLower.includes('زوج'));
    const isWork = occasion.relationship === 'زميل عمل' || occasion.occasionType === 'مناسبة عمل';
    const isGraduation = occasion.occasionType === 'تخرج';

    let fallbackGifts: any[] = [];

    if (isFather) {
      fallbackGifts = [
        {
          id: 'fb-1',
          title: 'عطر عربي شرقي فاخر (عود وعنبر)',
          category: 'فاخرة وتجربة خاصة',
          description: 'زجاجة عطر راقية بعبير العود الملكي الممزوج بالعنبر الهادئ، في صندوق هدايا مخملي فاخر.',
          priceEstimate: 'متوسط (قيمة ممتازة)',
          whySuitable: 'العطور الشرقية الأصيلة تليق بوقار الأب ومكانته العزيزة وتترك أثراً طيباً في كل مجلس.',
          icon: '👑'
        },
        {
          id: 'fb-2',
          title: 'قلم حبر كلاسيكي أنيق محفور عليه اسمه',
          category: 'عاطفية وتذكارية',
          description: 'قلم معدني ثقيل بتصميم كلاسيكي، مع نقش اسم الوالد بالليزر ليبقى تذكاراً دائماً.',
          priceEstimate: 'اقتصادي (مناسب للجميع)',
          whySuitable: 'هدية شخصية تذكارية تحمل لمسة وفاء واعتزاز يدوم لسنوات.',
          icon: '✒️'
        },
        {
          id: 'fb-3',
          title: 'مسبحة فاخرة من الكهرمان أو خشب الصندل',
          category: 'عاطفية وتذكارية',
          description: 'مسبحة روحانية أنيقة مصنوعة يدوياً من أحجار الكهرمان الطبيعي برائحة زكية ولمس مريح.',
          priceEstimate: 'متوسط (قيمة ممتازة)',
          whySuitable: 'هدية محببة جداً للآباء في كل الأوقات والأذكار، تعبر عن البر والمحبة.',
          icon: '📿'
        },
        {
          id: 'fb-4',
          title: 'جهاز مساج كهربائي لراحة الرقبة والظهر',
          category: 'عملية ومفيدة',
          description: 'وسادة تدليك حرارية مريحة للاستخدام في المنزل أو السيارة لتخفيف إجهاد العضلات والظهر.',
          priceEstimate: 'متوسط (قيمة ممتازة)',
          whySuitable: 'تعكس اهتمامك المباشر بصحة وراحة الوالد بعد يوم شاق أو أثناء الاسترخاء.',
          icon: '💆‍♂️'
        }
      ];
    } else if (isMother) {
      fallbackGifts = [
        {
          id: 'fb-m1',
          title: 'باقة زهور طبيعية مع شوكولاتة فاخرة',
          category: 'عاطفية وتذكارية',
          description: 'تنسيق ورد جوري وأوركيد بألوان دافئة مع صندوق شوكولاتة بلجيكية مختارة.',
          priceEstimate: 'متوسط (قيمة ممتازة)',
          whySuitable: 'الورد والشوكولاتة يدخلان البهجة الفورية على قلب الأم ويعبران عن أصدق مشاعر الامتنان.',
          icon: '💐'
        },
        {
          id: 'fb-m2',
          title: 'سوار أو قلادة ذهبية رقيقة',
          category: 'فاخرة وتجربة خاصة',
          description: 'قطعة مجوهرات ناعمة من الذهب عيار 18 أو 21 مصممة بتفاصيل دقيقة وأنيقة.',
          priceEstimate: 'فاخر (مميز وخاص)',
          whySuitable: 'هدية خالدة تحتفظ بها الأم كرمز محبة لا يتغير مع مرور السنوات.',
          icon: '✨'
        },
        {
          id: 'fb-m3',
          title: 'طقم شال صوف أو حرير طبيعي راقٍ',
          category: 'عملية ومفيدة',
          description: 'شال شتوي فاخر أو وشاح حريري ناعم بتطريز يدوي أنيق يناسب إطلالتها في الزيارات.',
          priceEstimate: 'اقتصادي (مناسب للجميع)',
          whySuitable: 'هدية ملموسة ودافئة تعكس رقة المشاعر وتناسب المناسبات العائلية.',
          icon: '🧣'
        },
        {
          id: 'fb-m4',
          title: 'طقم مبخرة كريستالية مع بخور موروكي معتق',
          category: 'عاطفية وتذكارية',
          description: 'مبخرة عصرية بتصميم رخامي أو كريستالي مع توليفة بخور فاخرة لأجواء البيت المباركة.',
          priceEstimate: 'متوسط (قيمة ممتازة)',
          whySuitable: 'الأمهات يعشقن رائحة الطيب وتعطير البيت، مما يضفي سكينة وألفة.',
          icon: '🏺'
        }
      ];
    } else if (isSpouse) {
      fallbackGifts = [
        {
          id: 'fb-s1',
          title: 'عشاء رومانسي خاص في مطعم راقٍ',
          category: 'فاخرة وتجربة خاصة',
          description: 'حجز طاولة خاصة مع ورود وإضاءة هادئة للاحتفال بهذه الذكرى الثمينة واستعادة أجمل اللحظات.',
          priceEstimate: 'متوسط (قيمة ممتازة)',
          whySuitable: 'قضاء وقت هادئ معاً يبني ذكريات مشتركة أجمل بكثير من الهدايا المادية.',
          icon: '🥂'
        },
        {
          id: 'fb-s2',
          title: 'ألبوم صور مخصص لأجمل الذكريات المشتركة',
          category: 'عاطفية وتذكارية',
          description: 'ألبوم فاخر بطباعة حرارية يوثق المحطات الأجمل في رحلتكما مع نصوص ورسائل محبة.',
          priceEstimate: 'اقتصادي (مناسب للجميع)',
          whySuitable: 'هدية عاطفية حميمة تظهر كم تهتم بتفاصيل رحلتكما معاً.',
          icon: '📸'
        },
        {
          id: 'fb-s3',
          title: 'ساعة يد كلاسيكية مطعمة بالكريستال أو الفولاذ المصقول',
          category: 'فاخرة وتجربة خاصة',
          description: 'ساعة سويسرية أو يابانية أنيقة بتصميم ملفت وعلبة فاخرة.',
          priceEstimate: 'فاخر (مميز وخاص)',
          whySuitable: 'رمز للأوقات السعيدة ولحظات العمر الجميلة التي تمضيانها سوياً.',
          icon: '⌚'
        }
      ];
    } else if (isGraduation) {
      fallbackGifts = [
        {
          id: 'fb-g1',
          title: 'حقيبة لابتوب جلدية أنيقة لبدء المسيرة المهنية',
          category: 'عملية ومفيدة',
          description: 'حقيبة عمل عملية وعصرية لحمل اللابتوب والملفات أثناء مقابلات العمل والوظيفة الجديدة.',
          priceEstimate: 'متوسط (قيمة ممتازة)',
          whySuitable: 'تهيئة الخريج لمرحلة العمل بطريقة عملية وأنيقة تمنحه الثقة.',
          icon: '💼'
        },
        {
          id: 'fb-g2',
          title: 'سماعات رأس لاسلكية مانعة للضوضاء',
          category: 'عملية ومفيدة',
          description: 'سماعات حديثة تساعده في التركيز أثناء العمل، الدراسة، أو السفر.',
          priceEstimate: 'متوسط (قيمة ممتازة)',
          whySuitable: 'مفيدة جداً للجيل الشاب في الدراسة والعمل والاستماع الهادئ.',
          icon: '🎧'
        },
        {
          id: 'fb-g3',
          title: 'باقة هدايا نقدية مع درع تخرج تذكاري',
          category: 'رمزية ومبتكرة',
          description: 'تقديم مبلغ مالي في بطاقة تهنئة أنيقة مع درع مصغر لتخليد سنة التخرج والتفوق.',
          priceEstimate: 'اقتصادي (مناسب للجميع)',
          whySuitable: 'تتيح للخريج حرية اختيار ما ينقصه في مستهل حياته الجديدة.',
          icon: '🎓'
        }
      ];
    } else if (isWork) {
      fallbackGifts = [
        {
          id: 'fb-w1',
          title: 'مجموعة تنظيم المكتب الجلدية الفاخرة',
          category: 'عملية ومفيدة',
          description: 'طقم مكتبي متكامل يشمل قاعدة ماوس جلدية، حامل أقلام، ومسند بطاقات.',
          priceEstimate: 'متوسط (قيمة ممتازة)',
          whySuitable: 'هدية مكتبية مهنية راقية تترك انطباعاً إيجابياً وتناسب أجواء العمل.',
          icon: '🖥️'
        },
        {
          id: 'fb-w2',
          title: 'كوب حراري ذكي يحافظ على حرارة القهوة',
          category: 'عملية ومفيدة',
          description: 'كوب ستانلس ستيل عازل مع مؤشر رقمي لدرجة الحرارة ملائم لساعات الدوام الطويلة.',
          priceEstimate: 'اقتصادي (مناسب للجميع)',
          whySuitable: 'هدية يومية مفيدة ومحبوبة لدى جميع زملاء العمل والمدراء.',
          icon: '☕'
        },
        {
          id: 'fb-w3',
          title: 'بطاقة هدايا مكتبية أو متجر إلكتروني',
          category: 'رمزية ومبتكرة',
          description: 'بطاقة شحن رصيد تمنحه حرية اختيار الكتب أو المستلزمات التي يفضلها.',
          priceEstimate: 'متوسط (قيمة ممتازة)',
          whySuitable: 'آمنة ومثالية للعلاقات الرسمية دون حرج أو مبالغة.',
          icon: '💳'
        }
      ];
    } else {
      // General Friend or Birthday Fallback
      fallbackGifts = [
        {
          id: 'fb-gen1',
          title: 'صندوق هدايا مخصص (عطر، محفظة، شوكولاتة)',
          category: 'فاخرة وتجربة خاصة',
          description: 'توليفة متناسقة من الإكسسوارات الأنيقة مع شوكولاتة فاخرة ورسالة إهداء.',
          priceEstimate: 'متوسط (قيمة ممتازة)',
          whySuitable: `هدية شاملة وجميلة تناسب احتفال ${occasion.personName} في ${occasion.occasionType}.`,
          icon: '🎁'
        },
        {
          id: 'fb-gen2',
          title: 'باور بانك وشاحن لاسلكي سريع عالي السعة',
          category: 'عملية ومفيدة',
          description: 'شاحن متنقل متطور وخفيف الوزن يدعم الشحن فائق السرعة لجميع الأجهزة الذكية.',
          priceEstimate: 'اقتصادي (مناسب للجميع)',
          whySuitable: 'هدية عصرية يحتاجها كل شخص في حياته اليومية وتنقلاته المستمرة.',
          icon: '🔋'
        },
        {
          id: 'fb-gen3',
          title: 'كتاب ملهم أو رواية عالمية ذات طبعة فاخرة',
          category: 'عاطفية وتذكارية',
          description: 'كتاب مميز في تطوير الذات أو الأدب في تجليد مقوى مع فاصل كتب جلدي.',
          priceEstimate: 'اقتصادي (مناسب للجميع)',
          whySuitable: 'هدية راقية تعبر عن عمق الصداقة وتقدير الفكر والاهتمام المشترك.',
          icon: '📖'
        },
        {
          id: 'fb-gen4',
          title: 'نبتة مكتبية خضراء في أصيص فخاري أنيق',
          category: 'رمزية ومبتكرة',
          description: 'نبتة داخلية سهلة العناية (مثل زاميا أو بيلسان) تضفي طاقة إيجابية وجمالاً على المكان.',
          priceEstimate: 'اقتصادي (مناسب للجميع)',
          whySuitable: 'رمز للنمو والبهجة الدائمة وتذكار حي يستمر لسنوات طويلة.',
          icon: '🌿'
        }
      ];
    }

    return res.json({
      suggestions: fallbackGifts,
      isAiGenerated: false
    });

  } catch (err: any) {
    console.error('Error in /api/generate-gift-suggestions:', err);
    res.status(500).json({
      error: 'فشل اقتراح الهدايا، يرجى المحاولة لاحقاً',
      details: err.message
    });
  }
});

// Setup Vite dev middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: port,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.use((_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`);
  });
}

startServer();
