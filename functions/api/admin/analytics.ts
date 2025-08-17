import { UserStorage } from '../../lib/user-storage';

export const onRequestGet = async ({ env }: any) => {
  try {
    if (!env.DB) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Database not available'
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const userStorage = new UserStorage(env.DB);
    await userStorage.initializeUsers();
    
    // Get all customers for analytics
    const customers = await userStorage.getAllCustomers();
    
    // Calculate analytics
    const totalCustomers = customers.length;
    const premiumCustomers = customers.filter((c: any) => c.role === 'premium').length;
    const freeCustomers = customers.filter((c: any) => c.role === 'free').length;
    
    // Mock revenue calculation (would be based on actual payment data)
    const avgRevenuePerPremium = 500; // €500 per premium customer
    const totalRevenue = premiumCustomers * avgRevenuePerPremium;
    
    const analytics = {
      totalRevenue,
      totalSales: premiumCustomers, // Premium subscriptions as sales
      activeCustomers: totalCustomers,
      avgRating: 4.9 // Static for now, would come from reviews
    };
    
    return new Response(JSON.stringify({
      success: true,
      ...analytics
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('Failed to get analytics:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to load analytics'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};
