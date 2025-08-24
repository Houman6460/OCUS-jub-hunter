export async function onRequestPut(context: any) {
  const { request, env, params } = context;
  const orderId = params.orderId;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { status } = await request.json();

    if (!status || !['pending', 'completed', 'failed', 'refunded'].includes(status)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid status. Must be one of: pending, completed, failed, refunded' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Update order status
    const updateQuery = `
      UPDATE orders 
      SET status = ?, completedAt = ?
      WHERE id = ?
    `;
    
    const completedAt = status === 'completed' ? new Date().toISOString() : null;
    
    const updateResult = await env.DB.prepare(updateQuery)
      .bind(status, completedAt, orderId)
      .run();

    if (!updateResult.success) {
      throw new Error('Failed to update order status');
    }

    // If order is completed, update user premium status
    if (status === 'completed') {
      // Get order details to update user
      const orderQuery = `
        SELECT customerEmail, finalAmount 
        FROM orders 
        WHERE id = ?
      `;
      
      const orderResult = await env.DB.prepare(orderQuery).bind(orderId).first();
      
      if (orderResult) {
        // Update user premium status and stats
        const userUpdateQuery = `
          UPDATE users 
          SET 
            isPremium = 1
          WHERE email = ?
        `;
        
        await env.DB.prepare(userUpdateQuery)
          .bind(orderResult.customerEmail)
          .run();
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Order status updated successfully' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Error updating order:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to update order status' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}
