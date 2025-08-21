export async function onRequestPut(context: any) {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    const { price, beforePrice } = body;

    if (!price || price <= 0) {
      return new Response(JSON.stringify({ message: "Valid price is required" }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    if (beforePrice && beforePrice <= price) {
      return new Response(JSON.stringify({ message: "Before price must be higher than current price" }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    // Update or create product pricing in D1 database
    const updateQuery = `
      INSERT OR REPLACE INTO products (id, name, price, beforePrice, updatedAt)
      VALUES (1, 'OCUS Job Hunter Extension', ?, ?, datetime('now'))
    `;

    await env.DB.prepare(updateQuery)
      .bind(price, beforePrice || null)
      .run();

    // Fetch the updated product
    const selectQuery = `SELECT * FROM products WHERE id = 1`;
    const result = await env.DB.prepare(selectQuery).first();

    return new Response(JSON.stringify({ 
      success: true, 
      product: result,
      message: "Pricing updated successfully" 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });

  } catch (error: any) {
    console.error("Error updating pricing:", error);
    return new Response(JSON.stringify({ message: "Error updating pricing: " + error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }
}

export async function onRequestOptions(context: any) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
