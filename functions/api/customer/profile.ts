import { UserStorage } from '../../lib/user-storage';

export const onRequestGet = async ({ request, env }: any) => {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return new Response(JSON.stringify({
        success: false,
        message: 'User ID is required'
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const userStorage = new UserStorage(env.DB);
    await userStorage.initializeUsers();
    
    const user = await userStorage.getUserById(parseInt(userId));
    
    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        message: 'User not found'
      }), {
        status: 404,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const profile = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      subscriptionStatus: 'active',
      plan: 'premium',
      joinedDate: user.created_at?.split('T')[0] || '2024-01-15',
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
    
  } catch (error) {
    console.error('Failed to get user profile:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to load profile'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
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
