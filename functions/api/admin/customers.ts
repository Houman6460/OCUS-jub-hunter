import { UserStorage } from '../../lib/user-storage';

export const onRequestGet = async ({ env }: any) => {
  try {
    const userStorage = new UserStorage(env.DB);
    await userStorage.initializeUsers();
    
    const customers = await userStorage.getAllCustomers();
    
    return new Response(JSON.stringify({
      success: true,
      customers
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('Failed to get customers:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to load customers'
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
