import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
// Lazy OpenAI initialization to prevent startup failures
function getOpenAI(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }
  return new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY 
  });
}

interface TranslationRequest {
  text: string;
  targetLanguages: string[];
  context?: string;
  maxLength?: number;
  tone?: 'marketing' | 'professional' | 'casual' | 'urgent';
}

interface TranslationResult {
  [language: string]: string;
}

export class TranslationService {
  private static readonly supportedLanguages = {
    en: 'English',
    de: 'German', 
    fr: 'French',
    es: 'Spanish',
    it: 'Italian',
    pt: 'Portuguese',
    nl: 'Dutch',
    pl: 'Polish',
    ru: 'Russian',
    ja: 'Japanese',
    ko: 'Korean',
    zh: 'Chinese (Simplified)'
  };

  static async translateText(request: TranslationRequest): Promise<TranslationResult>;
  static async translateText(text: string, targetLanguages: string[]): Promise<TranslationResult>;
  static async translateText(requestOrText: TranslationRequest | string, targetLanguages?: string[]): Promise<TranslationResult> {
    // Return empty map if OpenAI API key is missing instead of throwing
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured - returning empty translation map');
      return {};
    }

    // Handle different method signatures
    let request: TranslationRequest;
    if (typeof requestOrText === 'string') {
      request = {
        text: requestOrText,
        targetLanguages: targetLanguages || [],
        context: 'General text translation',
        tone: 'marketing'
      };
    } else {
      request = requestOrText;
    }

    const { text, targetLanguages: langs, context = '', maxLength, tone = 'marketing' } = request;
    
    // Filter out invalid languages
    const validLanguages = langs.filter(lang => 
      lang in this.supportedLanguages && lang !== 'en'
    );

    if (validLanguages.length === 0) {
      return {};
    }

    const languageNames = validLanguages.map(code => 
      `${code}: ${this.supportedLanguages[code as keyof typeof this.supportedLanguages]}`
    ).join(', ');

    const lengthConstraint = maxLength ? 
      `Keep translations under ${maxLength} characters. ` : '';
    
    const toneDescription = {
      marketing: 'marketing/promotional tone',
      professional: 'professional business tone', 
      casual: 'casual friendly tone',
      urgent: 'urgent/time-sensitive tone'
    }[tone];

    const prompt = `Translate the following text into multiple languages.

Original text (English): "${text}"
Context: ${context || 'Marketing content for a Chrome extension product'}
Target languages: ${languageNames}
Tone: ${toneDescription}
${lengthConstraint}

Requirements:
- Maintain the ${toneDescription}
- Keep the same emotional impact and urgency as the original
- Adapt cultural nuances appropriately for each target market
- Preserve any promotional messaging intent
- ${lengthConstraint}Ensure translations sound natural to native speakers

Respond with a JSON object where keys are language codes (${validLanguages.join(', ')}) and values are the translated text.

Example format:
{
  "de": "German translation here",
  "fr": "French translation here"
}`;

    try {
      const openai = getOpenAI();
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a professional translator specializing in marketing and e-commerce content. Provide accurate, culturally appropriate translations that maintain the marketing impact of the original text."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3, // Lower temperature for more consistent translations
        max_tokens: 1000
      });

      const translationText = response.choices[0].message.content;
      if (!translationText) {
        throw new Error('No translation received from OpenAI');
      }

      const translations = JSON.parse(translationText);
      
      // Validate translations
      const result: TranslationResult = {};
      for (const lang of validLanguages) {
        if (translations[lang] && typeof translations[lang] === 'string') {
          result[lang] = translations[lang].trim();
        }
      }

      return result;
    } catch (error) {
      console.error('Translation service error:', error);
      throw new Error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async translateBannerContent(
    titleEn: string, 
    subtitleEn: string, 
    targetLanguages: string[]
  ): Promise<{ titles: TranslationResult; subtitles: TranslationResult }> {
    try {
      // Return empty maps if OpenAI is not available
      if (!process.env.OPENAI_API_KEY) {
        console.warn('OpenAI API key not configured - returning empty translation maps');
        return {
          titles: {},
          subtitles: {}
        };
      }

      const [titleTranslations, subtitleTranslations] = await Promise.all([
        this.translateText({
          text: titleEn,
          targetLanguages,
          context: 'Countdown banner title for limited-time promotion',
          maxLength: 100,
          tone: 'urgent'
        }),
        this.translateText({
          text: subtitleEn,
          targetLanguages, 
          context: 'Countdown banner subtitle describing promotional offer',
          maxLength: 200,
          tone: 'marketing'
        })
      ]);

      return {
        titles: titleTranslations,
        subtitles: subtitleTranslations
      };
    } catch (error) {
      console.error('Banner translation error:', error);
      throw error;
    }
  }

  static getSupportedLanguages(): typeof TranslationService.supportedLanguages {
    return this.supportedLanguages;
  }
}