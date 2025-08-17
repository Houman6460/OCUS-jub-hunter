import { UserStorage } from '../../lib/user-storage';

export const onRequestPost = async ({ request, env }: any) => {
  try {
    const { email, password, name, recaptchaToken } = await request.json();
    
    if (email && password && name) {
      const userStorage = new UserStorage(env.DB);
      await userStorage.initializeUsers();
      
      try {
        const user = await userStorage.createUser(email, password, name);
        return new Response(JSON.stringify({
          success: true,
          message: 'Registration successful',
          user
        }), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } catch (error: any) {
        if (error.message?.includes('UNIQUE constraint failed')) {
          return new Response(JSON.stringify({
            success: false,
            message: 'Email already exists'
          }), {
            status: 400,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
        throw error;
      }
    }
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Missing required fields'
    }), {
      status: 400,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Registration failed'
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
