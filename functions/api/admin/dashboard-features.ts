export const onRequestGet = async () => {
  // Dashboard features configuration
  const features = [
    {
      id: 'affiliate-program',
      name: 'Affiliate Program',
      description: 'Controls visibility of referral system and commission tracking',
      isEnabled: true,
      category: 'monetization'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      description: 'Controls visibility of usage statistics and performance metrics',
      isEnabled: true,
      category: 'insights'
    },
    {
      id: 'billing',
      name: 'Billing',
      description: 'Controls visibility of payment history and subscription management',
      isEnabled: true,
      category: 'payments'
    }
  ];

  return new Response(JSON.stringify(features), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
};

export const onRequestPut = async ({ request }: any) => {
  try {
    const url = new URL(request.url);
    const featureName = url.pathname.split('/').pop();
    const { isEnabled, description } = await request.json();
    
    // Demo response - in real implementation, save to database
    return new Response(JSON.stringify({
      success: true,
      message: `Feature ${featureName} updated successfully`,
      feature: {
        name: featureName,
        isEnabled,
        description
      }
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to update feature'
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
