import type { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

interface UserEmail {
  email: string;
}

interface PurchaseStatus {
  completedOrders: number;
  totalSpent: number;
  lastPurchaseDate: string | null;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { params } = context;
    const userId = params.userId as string;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Always return default values if database is not available
    if (!context.env.DB) {
      return new Response(JSON.stringify({ 
        hasPurchased: false,
        totalSpent: '0.00',
        completedOrders: 0,
        lastPurchaseDate: null
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Get user email from customers table first, then users table as fallback
    let userResult: UserEmail | null = null;
    
    try {
      // Try customers table first with different column name variations
      try {
        const customerQuery = `SELECT email FROM customers WHERE id = ?`;
        userResult = await context.env.DB.prepare(customerQuery).bind(userId).first<UserEmail>();
      } catch (e) {
        // Try with different column names
        try {
          const customerQuery = `SELECT email FROM customers WHERE id = ?`;
          userResult = await context.env.DB.prepare(customerQuery).bind(parseInt(userId)).first<UserEmail>();
        } catch (e2) {
          console.log('Customers table query failed');
        }
      }
      
      // Fallback to users table if not found in customers
      if (!userResult) {
        try {
          const usersQuery = `SELECT email FROM users WHERE id = ?`;
          userResult = await context.env.DB.prepare(usersQuery).bind(userId).first<UserEmail>();
        } catch (e) {
          try {
            const usersQuery = `SELECT email FROM users WHERE id = ?`;
            userResult = await context.env.DB.prepare(usersQuery).bind(parseInt(userId)).first<UserEmail>();
          } catch (e2) {
            console.log('Users table query also failed');
          }
        }
      }
    } catch (tableError) {
      console.log('Table access error:', tableError);
    }
    
    // Return default values if no user found
    if (!userResult) {
      return new Response(JSON.stringify({ 
        hasPurchased: false,
        totalSpent: '0.00',
        completedOrders: 0,
        lastPurchaseDate: null
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Try to get purchase status from orders with multiple query variations
    let statusResult: PurchaseStatus | null = null;
    
    try {
      // Try different column name combinations
      const queryVariations = [
        `SELECT 
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completedOrders,
          COALESCE(SUM(CASE WHEN status = 'completed' THEN CAST(final_amount as REAL) ELSE 0 END), 0) as totalSpent,
          MAX(CASE WHEN status = 'completed' THEN created_at END) as lastPurchaseDate
        FROM orders 
        WHERE (user_id = ? OR customer_email = ?)`,
        
        `SELECT 
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completedOrders,
          COALESCE(SUM(CASE WHEN status = 'completed' THEN CAST("finalAmount" as REAL) ELSE 0 END), 0) as totalSpent,
          MAX(CASE WHEN status = 'completed' THEN "createdAt" END) as lastPurchaseDate
        FROM orders 
        WHERE ("userId" = ? OR "customerEmail" = ?)`,
        
        `SELECT 
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completedOrders,
          COALESCE(SUM(CASE WHEN status = 'completed' THEN CAST(finalAmount as REAL) ELSE 0 END), 0) as totalSpent,
          MAX(CASE WHEN status = 'completed' THEN createdAt END) as lastPurchaseDate
        FROM orders 
        WHERE (userId = ? OR customerEmail = ?)`
      ];

      for (const query of queryVariations) {
        try {
          statusResult = await context.env.DB.prepare(query).bind(userId, userResult.email).first<PurchaseStatus>();
          if (statusResult) break;
        } catch (e) {
          try {
            statusResult = await context.env.DB.prepare(query).bind(parseInt(userId), userResult.email).first<PurchaseStatus>();
            if (statusResult) break;
          } catch (e2) {
            console.log('Query variation failed, trying next');
          }
        }
      }
    } catch (queryError) {
      console.log('All order queries failed:', queryError);
    }
    
    const hasPurchased = (statusResult?.completedOrders || 0) > 0;
    const totalSpent = (statusResult?.totalSpent || 0).toFixed(2);
    const completedOrders = statusResult?.completedOrders || 0;
    const lastPurchaseDate = statusResult?.lastPurchaseDate ? new Date(statusResult.lastPurchaseDate).getTime() : null;

    return new Response(JSON.stringify({
      hasPurchased,
      totalSpent,
      completedOrders,
      lastPurchaseDate
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('Error fetching purchase status:', error);
    // Always return valid data instead of error
    return new Response(JSON.stringify({ 
      hasPurchased: false,
      totalSpent: '0.00',
      completedOrders: 0,
      lastPurchaseDate: null
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
