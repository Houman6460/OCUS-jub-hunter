export const onRequestPost = async ({ request, params }: any) => {
  try {
    const ticketId = params.id;
    const formData = await request.formData();
    const message = formData.get('message');
    const attachments = formData.getAll('attachments');
    
    // Demo message creation - replace with real database logic
    const newMessage = {
      id: Date.now(),
      ticketId,
      message,
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
      message: 'Message added successfully',
      data: newMessage
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to add message'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

export const onRequestGet = async ({ params }: any) => {
  const ticketId = params.id;
  
  // Demo messages for ticket
  const messages = [
    {
      id: 1,
      ticketId,
      message: 'Initial support request message',
      createdAt: new Date().toISOString(),
      userId: 'demo-user',
      attachments: []
    }
  ];

  return new Response(JSON.stringify(messages), {
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
