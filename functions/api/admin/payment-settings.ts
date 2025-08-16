export const onRequestGet = async () => {
  // Demo payment settings
  const settings = {
    stripeEnabled: true,
    paypalEnabled: true,
    stripePublishableKey: 'pk_test_demo_key',
    paypalClientId: 'demo_paypal_client_id',
    currency: 'USD',
    taxRate: 0.08,
    plans: [
      { id: 'basic', name: 'Basic Plan', price: 29.99, interval: 'monthly' },
      { id: 'premium', name: 'Premium Plan', price: 49.99, interval: 'monthly' },
      { id: 'enterprise', name: 'Enterprise Plan', price: 99.99, interval: 'monthly' }
    ]
  };

  return new Response(JSON.stringify(settings), {
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
      message: 'Payment settings updated successfully',
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
      message: 'Failed to update payment settings'
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
