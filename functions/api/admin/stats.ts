export const onRequestGet = async () => {
  // Demo admin statistics
  const stats = {
    totalUsers: 1247,
    activeUsers: 892,
    newUsersToday: 23,
    totalTickets: 156,
    openTickets: 34,
    resolvedTickets: 122,
    revenue: {
      monthly: 15420,
      yearly: 184500,
      growth: 12.5
    },
    userGrowth: [
      { month: 'Jan', users: 1100 },
      { month: 'Feb', users: 1180 },
      { month: 'Mar', users: 1247 }
    ],
    ticketStats: [
      { category: 'Technical', count: 45 },
      { category: 'Billing', count: 32 },
      { category: 'Feature Request', count: 28 },
      { category: 'General', count: 51 }
    ],
    recentActivity: [
      { time: '2 min ago', action: 'New user registration: john@example.com' },
      { time: '5 min ago', action: 'Ticket #156 resolved by support team' },
      { time: '12 min ago', action: 'Payment received: $49.99 from user #1234' }
    ]
  };

  return new Response(JSON.stringify(stats), {
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
