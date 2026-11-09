import { Occasion, GiftSuggestion } from "../types";

export type GreetingTone = 'warm' | 'formal' | 'funny' | 'poetic' | 'short';

export interface GenerateGreetingResult {
  text: string;
  isAiGenerated?: boolean;
}

export interface GenerateGiftSuggestionsResult {
  suggestions: GiftSuggestion[];
  isAiGenerated?: boolean;
}

export const generateCongratulation = async (
  occasion: Occasion,
  tone: GreetingTone = 'warm'
): Promise<GenerateGreetingResult> => {
  try {
    const response = await fetch('/api/generate-congratulation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ occasion, tone }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error: ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data.congratulation || 'مبارك لكم هذه المناسبة الطيبة وسعادة دائمة بإذن الله!',
      isAiGenerated: data.isAiGenerated ?? true,
    };
  } catch (error) {
    console.error('Failed to generate congratulation via server API:', error);
    // Graceful client fallback in case network error occurs
    return {
      text: `ألف مبارك يا ${occasion.personName} بمناسبة ${occasion.occasionType}! أتمنى لك دوام التوفيق والبهجة والسرور. 🎉`,
      isAiGenerated: false,
    };
  }
};

export const generateGiftSuggestions = async (
  occasion: Occasion
): Promise<GenerateGiftSuggestionsResult> => {
  try {
    const response = await fetch('/api/generate-gift-suggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ occasion }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error: ${response.status}`);
    }

    const data = await response.json();
    return {
      suggestions: data.suggestions || [],
      isAiGenerated: data.isAiGenerated ?? true,
    };
  } catch (error) {
    console.error('Failed to generate gift suggestions via server API:', error);
    return {
      suggestions: [
        {
          id: 'client-fb-1',
          title: 'عطر فاخر مع بطاقة تهنئة خاصة',
          category: 'فاخرة وتجربة خاصة',
          description: 'عطر راقٍ يناسب ذوق المحتفى به مع إهداء مكتوب باليد.',
          priceEstimate: 'متوسط (قيمة ممتازة)',
          whySuitable: `هدية مميزة وكلاسيكية تليق بـ ${occasion.personName} في ${occasion.occasionType}.`,
          icon: '🎁'
        },
        {
          id: 'client-fb-2',
          title: 'هدية رمزية مخصصة بالاسم',
          category: 'عاطفية وتذكارية',
          description: 'قطعة تذكارية مخصصة محفور عليها اسم المحتفى به وتاريخ المناسبة.',
          priceEstimate: 'اقتصادي (مناسب للجميع)',
          whySuitable: 'تترك ذكرى دائمة وأثراً طيباً في النفس.',
          icon: '✨'
        }
      ],
      isAiGenerated: false,
    };
  }
};
