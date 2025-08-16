export const onRequestPost = async ({ request }: any) => {
  try {
    const formData = await request.formData();
    const subject = formData.get('subject');
    const message = formData.get('message');
    const priority = formData.get('priority') || 'medium';
    const category = formData.get('category') || 'general';
    const attachments = formData.getAll('attachments');
    
    // Demo ticket creation - replace with real database logic
    const ticket = {
      id: Date.now(),
      subject,
      message,
      priority,
      category,
      status: 'open',
      createdAt: new Date().toISOString(),
      userId: 'demo-user',
      attachments: attachments.map((file: any) => ({
        name: file.name,
        size: file.size,
        type: file.type
      }))
    };
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Ticket submitted successfully',
      ticket
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to submit ticket'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

export const onRequestGet = async () => {
  // Demo tickets list
  const tickets = [
    {
      id: 1,
      subject: 'Demo Support Ticket',
      message: 'This is a demo support ticket for testing purposes.',
      priority: 'medium',
      category: 'general',
      status: 'open',
      createdAt: new Date().toISOString(),
      userId: 'demo-user',
      attachments: []
    }
  ];

  return new Response(JSON.stringify(tickets), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
};

export const onRequestOptions = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
