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
    da: 'Danish',
    no: 'Norwegian',
    fi: 'Finnish',
    tr: 'Turkish',
    pl: 'Polish',
    ru: 'Russian'
  };

  static async translateBadgeText(
    text: string,
    targetLanguages: string[],
    openaiApiKey?: string
  ): Promise<TranslationResult> {
    // Return empty map if no API key provided
    if (!openaiApiKey) {
      console.warn('OpenAI API key not provided - returning empty translation map');
      return {};
    }

    // Filter out invalid languages
    const validLanguages = targetLanguages.filter(lang => 
      lang in this.supportedLanguages && lang !== 'en'
    );

    if (validLanguages.length === 0) {
      return {};
    }

    const languageNames = validLanguages.map(code => 
      `${code}: ${this.supportedLanguages[code as keyof typeof this.supportedLanguages]}`
    ).join(', ');

    const prompt = `Translate the following announcement badge text into multiple languages.

Original text (English): "${text}"
Context: Announcement badge for a Chrome extension product website
Target languages: ${languageNames}
Tone: Marketing/promotional tone

Requirements:
- Maintain the marketing/promotional tone
- Keep the same emotional impact as the original
- Adapt cultural nuances appropriately for each target market
- Keep translations concise and impactful for badge display
- Ensure translations sound natural to native speakers

Respond with a JSON object where keys are language codes (${validLanguages.join(', ')}) and values are the translated text.

Example format:
{
  "de": "German translation here",
  "fr": "French translation here"
}`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
          temperature: 0.3,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const translationText = data.choices[0]?.message?.content;
      
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

  static getSupportedLanguages(): typeof TranslationService.supportedLanguages {
    return this.supportedLanguages;
  }
}
