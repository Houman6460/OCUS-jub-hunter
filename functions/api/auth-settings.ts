import { Env } from '../lib/context';

// Type for the data fetched from the database
interface DbAuthSettings {
  google_enabled: number;
  facebook_enabled: number;
  github_enabled: number;
  recaptcha_enabled: number;
  recaptcha_customer_enabled: number;
  recaptcha_admin_enabled: number;
  recaptcha_site_key: string | null;
  google_client_id: string | null;
  facebook_app_id: string | null;
  github_client_id: string | null;
}

// Type for the JSON response sent to the client
interface ApiAuthSettings {
  googleEnabled: boolean;
  facebookEnabled: boolean;
  githubEnabled: boolean;
  recaptchaEnabled: boolean;
  recaptchaCustomerEnabled: boolean;
  recaptchaAdminEnabled: boolean;
  recaptchaSiteKey: string;
  googleClientId: string;
  facebookAppId: string;
  githubClientId: string;
}

const defaultSettings: ApiAuthSettings = {
  googleEnabled: false,
  facebookEnabled: false,
  githubEnabled: false,
  recaptchaEnabled: false,
  recaptchaCustomerEnabled: false,
  recaptchaAdminEnabled: false,
  recaptchaSiteKey: '',
  googleClientId: '',
  facebookAppId: '',
  githubClientId: '',
};

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const dbQuery = 'SELECT * FROM auth_settings WHERE id = 1';
    const dbSettings = await env.DB.prepare(dbQuery).first<DbAuthSettings>();

    const apiSettings: ApiAuthSettings = {
      ...defaultSettings,
      ...(dbSettings && {
        googleEnabled: !!dbSettings.google_enabled,
        facebookEnabled: !!dbSettings.facebook_enabled,
        githubEnabled: !!dbSettings.github_enabled,
        recaptchaEnabled: !!dbSettings.recaptcha_enabled,
        recaptchaCustomerEnabled: !!dbSettings.recaptcha_customer_enabled,
        recaptchaAdminEnabled: !!dbSettings.recaptcha_admin_enabled,
        recaptchaSiteKey: dbSettings.recaptcha_site_key || '',
        googleClientId: dbSettings.google_client_id || '',
        facebookAppId: dbSettings.facebook_app_id || '',
        githubClientId: dbSettings.github_client_id || '',
      }),
    };

    return new Response(JSON.stringify(apiSettings), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Failed to fetch auth settings:', error);
    return new Response(JSON.stringify(defaultSettings), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
