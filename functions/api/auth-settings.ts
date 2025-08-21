import { PagesFunctionEnv } from '../lib/context';

export const onRequestGet: PagesFunction<PagesFunctionEnv> = async ({ env }) => {
  try {
    const dbQuery = `
      SELECT 
        google_enabled,
        facebook_enabled,
        github_enabled,
        recaptcha_enabled,
        recaptcha_customer_enabled,
        recaptcha_admin_enabled,
        recaptcha_site_key,
        google_client_id,
        facebook_app_id,
        github_client_id
      FROM auth_settings 
      WHERE id = 1
    `;
    const dbSettings = await env.DB.prepare(dbQuery).first();

    const authSettings = {
      googleEnabled: !!dbSettings?.google_enabled,
      facebookEnabled: !!dbSettings?.facebook_enabled,
      githubEnabled: !!dbSettings?.github_enabled,
      recaptchaEnabled: !!dbSettings?.recaptcha_enabled,
      recaptchaCustomerEnabled: !!dbSettings?.recaptcha_customer_enabled,
      recaptchaAdminEnabled: !!dbSettings?.recaptcha_admin_enabled,
      recaptchaSiteKey: dbSettings?.recaptcha_site_key || '',
      googleClientId: dbSettings?.google_client_id || '',
      facebookAppId: dbSettings?.facebook_app_id || '',
      githubClientId: dbSettings?.github_client_id || '',
    };
    
    return new Response(JSON.stringify(authSettings), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Failed to fetch auth settings:', error);
    const defaultSettings = {
      googleEnabled: false,
      facebookEnabled: false,
      githubEnabled: false,
      recaptchaEnabled: false,
      recaptchaCustomerEnabled: false,
      recaptchaAdminEnabled: false,
      recaptchaSiteKey: '',
      googleClientId: '',
      facebookAppId: '',
      githubClientId: ''
    };
    return new Response(JSON.stringify(defaultSettings), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

export const onRequestOptions = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
