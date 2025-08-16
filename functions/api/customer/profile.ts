export const onRequestGet = async () => {
  // Demo customer profile
  const profile = {
    id: 1,
    email: 'demo@example.com',
    name: 'Demo User',
    role: 'customer',
    subscriptionStatus: 'active',
    plan: 'premium',
    joinedDate: '2024-01-15',
    lastLogin: new Date().toISOString(),
    settings: {
      notifications: true,
      emailUpdates: true,
      theme: 'light'
    }
  };

  return new Response(JSON.stringify(profile), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
};

export const onRequestPut = async ({ request }: any) => {
  try {
    const updates = await request.json();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        ...updates,
        updatedAt: new Date().toISOString()
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
      message: 'Failed to update profile'
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
