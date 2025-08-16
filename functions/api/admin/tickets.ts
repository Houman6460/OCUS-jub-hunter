export const onRequestGet = async () => {
  // Demo admin tickets list with more details
  const tickets = [
    {
      id: 1,
      subject: 'Login Issues',
      message: 'Unable to login with correct credentials',
      priority: 'high',
      category: 'technical',
      status: 'open',
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      userId: 'demo-user-1',
      userEmail: 'user1@example.com',
      attachments: []
    },
    {
      id: 2,
      subject: 'Feature Request',
      message: 'Would like to see dark mode option',
      priority: 'low',
      category: 'feature',
      status: 'in-progress',
      createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      userId: 'demo-user-2',
      userEmail: 'user2@example.com',
      attachments: []
    },
    {
      id: 3,
      subject: 'Billing Question',
      message: 'Question about subscription charges',
      priority: 'medium',
      category: 'billing',
      status: 'resolved',
      createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      userId: 'demo-user-3',
      userEmail: 'user3@example.com',
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
