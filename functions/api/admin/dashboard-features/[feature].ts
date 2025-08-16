export const onRequestPut = async ({ request, params }: any) => {
  try {
    const featureName = params.feature;
    const { isEnabled, description } = await request.json();
    
    // Demo response - in real implementation, save to database
    return new Response(JSON.stringify({
      success: true,
      message: `Feature ${featureName} updated successfully`,
      feature: {
        id: featureName,
        name: featureName.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        isEnabled,
        description: description || `${featureName} feature`
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
      message: 'Failed to update feature'
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
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
