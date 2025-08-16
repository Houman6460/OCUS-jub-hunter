export const onRequestGet = async () => {
  // Demo auth settings for admin
  const authSettings = {
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

  return new Response(JSON.stringify(authSettings), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
};

export const onRequestPut = async ({ request }: any) => {
  try {
    const settings = await request.json();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Authentication settings updated successfully',
      settings
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to update authentication settings'
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
