export const onRequestGet = async (context: any) => {
  const { env } = context;
  
  try {
    // Fetch auth settings from D1 database
    const selectQuery = `SELECT * FROM auth_settings WHERE id = 1`;
    const result = await env.DB.prepare(selectQuery).first();

    if (!result) {
      // Return default settings if no record found
      const defaultSettings = {
        googleEnabled: false,
        facebookEnabled: false,
        githubEnabled: false,
        recaptchaEnabled: false,
        recaptchaCustomerEnabled: false,
        recaptchaAdminEnabled: false,
        recaptchaSiteKey: '',
        googleClientId: '',
        googleClientSecret: '',
        facebookAppId: '',
        facebookAppSecret: '',
        githubClientId: '',
        githubClientSecret: '',
        jwtSecret: 'demo-jwt-secret',
        sessionTimeout: 3600
      };

      return new Response(JSON.stringify(defaultSettings), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Map database fields to frontend format
    const authSettings = {
      googleEnabled: Boolean(result.google_enabled),
      facebookEnabled: Boolean(result.facebook_enabled),
      githubEnabled: Boolean(result.github_enabled),
      recaptchaEnabled: Boolean(result.recaptcha_enabled),
      recaptchaCustomerEnabled: Boolean(result.recaptcha_customer_enabled),
      recaptchaAdminEnabled: Boolean(result.recaptcha_admin_enabled),
      recaptchaSiteKey: result.recaptcha_site_key || '',
      googleClientId: result.google_client_id || '',
      googleClientSecret: result.google_client_secret || '',
      facebookAppId: result.facebook_app_id || '',
      facebookAppSecret: result.facebook_app_secret || '',
      githubClientId: result.github_client_id || '',
      githubClientSecret: result.github_client_secret || '',
      jwtSecret: result.jwt_secret || 'demo-jwt-secret',
      sessionTimeout: result.session_timeout || 3600
    };

    return new Response(JSON.stringify(authSettings), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error: any) {
    console.error("Error fetching auth settings:", error);
    return new Response(JSON.stringify({ 
      message: "Error fetching auth settings: " + error.message 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

export const onRequestPut = async (context: any) => {
  const { request, env } = context;
  
  try {
    const settings = await request.json();
    
    // Map frontend fields to database format
    const updateData = {
      google_enabled: settings.googleEnabled ? 1 : 0,
      google_client_id: settings.googleClientId || null,
      google_client_secret: settings.googleClientSecret || null,
      facebook_enabled: settings.facebookEnabled ? 1 : 0,
      facebook_app_id: settings.facebookAppId || null,
      facebook_app_secret: settings.facebookAppSecret || null,
      github_enabled: settings.githubEnabled ? 1 : 0,
      github_client_id: settings.githubClientId || null,
      github_client_secret: settings.githubClientSecret || null,
      recaptcha_enabled: settings.recaptchaEnabled ? 1 : 0,
      recaptcha_site_key: settings.recaptchaSiteKey || null,
      recaptcha_secret_key: settings.recaptchaSecretKey || null,
      recaptcha_mode: settings.recaptchaMode || 'v2',
      recaptcha_customer_enabled: settings.recaptchaCustomerEnabled ? 1 : 0,
      recaptcha_admin_enabled: settings.recaptchaAdminEnabled ? 1 : 0,
      jwt_secret: settings.jwtSecret || 'demo-jwt-secret',
      session_timeout: settings.sessionTimeout || 3600,
      stripe_enabled: settings.stripeEnabled ? 1 : 0,
      stripe_public_key: settings.stripePublicKey || null,
      stripe_secret_key: settings.stripeSecretKey || null,
      updated_at: new Date().toISOString()
    };

    // Update auth settings in D1 database
    const updateQuery = `
      UPDATE auth_settings 
      SET google_enabled = ?, google_client_id = ?, google_client_secret = ?,
          facebook_enabled = ?, facebook_app_id = ?, facebook_app_secret = ?,
          github_enabled = ?, github_client_id = ?, github_client_secret = ?,
          recaptcha_enabled = ?, recaptcha_site_key = ?, recaptcha_secret_key = ?,
          recaptcha_mode = ?, recaptcha_customer_enabled = ?, recaptcha_admin_enabled = ?,
          jwt_secret = ?, session_timeout = ?, stripe_enabled = ?, stripe_public_key = ?, 
          stripe_secret_key = ?, updated_at = ?
      WHERE id = 1
    `;

    await env.DB.prepare(updateQuery)
      .bind(
        updateData.google_enabled, updateData.google_client_id, updateData.google_client_secret,
        updateData.facebook_enabled, updateData.facebook_app_id, updateData.facebook_app_secret,
        updateData.github_enabled, updateData.github_client_id, updateData.github_client_secret,
        updateData.recaptcha_enabled, updateData.recaptcha_site_key, updateData.recaptcha_secret_key,
        updateData.recaptcha_mode, updateData.recaptcha_customer_enabled, updateData.recaptcha_admin_enabled,
        updateData.jwt_secret, updateData.session_timeout, updateData.stripe_enabled, 
        updateData.stripe_public_key, updateData.stripe_secret_key, updateData.updated_at
      )
      .run();

    // Fetch the updated settings to return
    const selectQuery = `SELECT * FROM auth_settings WHERE id = 1`;
    const result = await env.DB.prepare(selectQuery).first();

    // Map back to frontend format for response
    const updatedSettings = {
      googleEnabled: Boolean(result.google_enabled),
      facebookEnabled: Boolean(result.facebook_enabled),
      githubEnabled: Boolean(result.github_enabled),
      recaptchaEnabled: Boolean(result.recaptcha_enabled),
      recaptchaCustomerEnabled: Boolean(result.recaptcha_customer_enabled),
      recaptchaAdminEnabled: Boolean(result.recaptcha_admin_enabled),
      recaptchaSiteKey: result.recaptcha_site_key || '',
      googleClientId: result.google_client_id || '',
      facebookAppId: result.facebook_app_id || '',
      githubClientId: result.github_client_id || ''
    };
    
    return new Response(JSON.stringify(updatedSettings), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error: any) {
    console.error("Error updating auth settings:", error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to update authentication settings: ' + error.message
    }), {
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
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
