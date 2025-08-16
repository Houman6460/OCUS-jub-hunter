export const onRequestGet = async () => {
  // Demo auth settings
  const authSettings = {
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

  return new Response(JSON.stringify(authSettings), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
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
