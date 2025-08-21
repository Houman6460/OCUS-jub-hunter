export async function onRequestGet(context: any) {
  const { env } = context;
  
  try {
    // Fetch the current product pricing from D1 database
    const selectQuery = `SELECT * FROM products WHERE id = 1 AND isActive = 1`;
    const result = await env.DB.prepare(selectQuery).first();

    if (!result) {
      // Return default pricing if no product found
      return new Response(JSON.stringify({
        id: 1,
        name: "OCUS Job Hunter Extension",
        price: "250.00",
        beforePrice: null
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    // Return the product pricing
    return new Response(JSON.stringify({
      id: result.id,
      name: result.name,
      price: result.price.toString(),
      beforePrice: result.beforePrice ? result.beforePrice.toString() : null
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
    console.error("Error fetching pricing:", error);
    return new Response(JSON.stringify({ 
      message: "Error fetching pricing: " + error.message 
    }), {
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
