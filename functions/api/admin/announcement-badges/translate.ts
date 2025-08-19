import { SettingsStorage } from '../../../lib/settings-storage';
import { TranslationService } from '../../../lib/translation-service';

interface Env {
  DB: D1Database;
  OPENAI_API_KEY?: string;
}

declare global {
  interface D1Database {}
  interface PagesFunction<T = any> {
    (context: { request: Request; env: T; params: any; waitUntil: (promise: Promise<any>) => void; }): Promise<Response> | Response;
  }
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const requestData = await context.request.json();
    const { textEn, targetLanguages } = requestData;
    
    if (!textEn || !targetLanguages || !Array.isArray(targetLanguages)) {
      return new Response(JSON.stringify({ 
        error: 'textEn and targetLanguages array are required' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Get OpenAI API key from environment or settings
    let openaiApiKey = context.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      // Try to get from settings storage
      const settingsStorage = new SettingsStorage(context.env.DB);
      const apiKeySetting = await settingsStorage.getSetting('openai_api_key');
      openaiApiKey = apiKeySetting;
    }

    if (!openaiApiKey) {
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured' 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    console.log('Translating badge text:', textEn, 'to languages:', targetLanguages);

    // Translate the text
    const translations = await TranslationService.translateBadgeText(
      textEn,
      targetLanguages,
      openaiApiKey
    );

    console.log('Translation results:', translations);

    return new Response(JSON.stringify(translations), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error translating badge text:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to translate badge text',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};
