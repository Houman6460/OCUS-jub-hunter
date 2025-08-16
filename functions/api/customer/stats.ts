export const onRequestGet = async () => {
  // Demo customer statistics
  const stats = {
    totalApplications: 47,
    successfulApplications: 12,
    pendingApplications: 8,
    rejectedApplications: 27,
    successRate: 25.5,
    averageResponseTime: '3.2 days',
    monthlyApplications: [
      { month: 'Jan', applications: 15, success: 4 },
      { month: 'Feb', applications: 12, success: 3 },
      { month: 'Mar', applications: 20, success: 5 }
    ],
    recentActivity: [
      { date: '2024-03-15', action: 'Applied to Software Engineer at TechCorp', status: 'pending' },
      { date: '2024-03-14', action: 'Interview scheduled with StartupXYZ', status: 'success' },
      { date: '2024-03-13', action: 'Application rejected by BigTech Inc', status: 'rejected' }
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
