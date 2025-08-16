export const onRequestGet = async () => {
  return new Response(JSON.stringify({
    status: 'ok',
    timestamp: Date.now(),
    message: 'OCUS Job Hunter API is running'
  }), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
};
