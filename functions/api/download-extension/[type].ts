interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { params, request } = context;
    const downloadType = params.type as string; // 'premium' or 'trial'
    
    // Get user info from request headers or query params
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || '1'; // Default for demo
    
    if (!['premium', 'trial'].includes(downloadType)) {
      return new Response(JSON.stringify({ error: 'Invalid download type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if user has premium access for premium downloads
    if (downloadType === 'premium') {
      const userQuery = `SELECT is_premium FROM users WHERE id = ?`;
      const userResult = await context.env.DB.prepare(userQuery).bind(userId).first();
      
      if (!userResult?.is_premium) {
        return new Response(JSON.stringify({ error: 'Premium access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Log the download
    const downloadLogQuery = `
      INSERT INTO user_downloads (user_id, download_type, version, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const clientIP = request.headers.get('CF-Connecting-IP') || 
                    request.headers.get('X-Forwarded-For') || 
                    'unknown';
    const userAgent = request.headers.get('User-Agent') || 'unknown';
    
    await context.env.DB.prepare(downloadLogQuery)
      .bind(userId, downloadType, 'v2.1.9', clientIP, userAgent)
      .run();

    // Create a mock file response (in production, this would serve actual files)
    const fileName = downloadType === 'premium' 
      ? 'ocus-job-hunter-premium-v2.1.9-STABLE.zip'
      : 'ocus-job-hunter-trial-v2.1.9-STABLE.zip';
      
    const mockFileContent = `Mock ${downloadType} extension file content for ${fileName}`;
    
    return new Response(mockFileContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error handling extension download:', error);
    return new Response(JSON.stringify({ error: 'Download failed' }), {
      status: 500,
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
