import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Search, Users, Activity, CreditCard, Ticket, Key, BarChart3, TrendingUp, Calendar } from "lucide-react";

interface Customer {
  id: string;
  email: string;
  name: string;
  isActivated: boolean;
  extensionActivated: boolean;
  extensionLastUsed: string | null;
  extensionUsageCount: number;
  extensionSuccessfulJobs: number;
  subscriptionStatus: string;
  totalSpent: string;
  totalOrders: number;
  lastOrderDate: string | null;
  activationKey: string | null;
  createdAt: string;
}

interface UsageStats {
  id: number;
  usageDate: string;
  jobsFound: number;
  jobsApplied: number;
  successfulJobs: number;
  sessionDuration: number;
  platform: string;
  location: string;
}

interface Payment {
  id: number;
  amount: string;
  currency: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
  processedAt: string | null;
}

interface CustomerDetails {
  customer: Customer;
  usageStats: UsageStats[];
  payments: Payment[];
  tickets: any[];
}

interface GlobalStats {
  statDate: string;
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  totalJobsFound: number;
  totalJobsApplied: number;
  totalSuccessfulJobs: number;
  avgSessionDuration: number;
}

interface DashboardAnalytics {
  revenue: {
    total: number;
    sales: number;
    recentOrders: any[];
  };
  customers: {
    total: number;
    active: number;
  };
  extension: {
    todaySessions: number;
    todayJobsFound: number;
    todayJobsApplied: number;
    todaySuccessfulJobs: number;
    activeToday: number;
  };
  support: {
    openTickets: number;
    totalTickets: number;
  };
}

export default function CustomerManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  // Fetch all customers
  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['/api/admin/customers'],
  });

  // Fetch dashboard analytics
  const { data: dashboardData } = useQuery<DashboardAnalytics>({
    queryKey: ['/api/admin/analytics/dashboard'],
  });

  // Fetch global usage statistics
  const { data: globalStats = [] } = useQuery<GlobalStats[]>({
    queryKey: ['/api/admin/usage/global'],
  });

  // Fetch customer details when selected
  const { data: customerDetails, isLoading: detailsLoading } = useQuery<CustomerDetails>({
    queryKey: ['/api/admin/customers', selectedCustomer],
    enabled: !!selectedCustomer,
  });

  // Generate activation key mutation
  const generateKeyMutation = useMutation({
    mutationFn: async (customerId: string) => {
      return await apiRequest('POST', `/api/admin/customers/${customerId}/activate`, {});
    },
    onSuccess: (data: any) => {
      toast({
        title: "Activation Key Generated",
        description: `New activation key: ${data.activationKey}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/customers'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate activation key",
        variant: "destructive",
      });
    },
  });

  const filteredCustomers = (customers as Customer[]).filter((customer: Customer) =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      case 'expired': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  if (customersLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Customer Management</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Customer Management</h1>
      </div>

      {/* Dashboard Overview Cards */}
      {dashboardData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.customers.total}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.customers.active} active extensions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Activity</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.extension.todaySessions}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.extension.activeToday} active users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jobs Success</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.extension.todaySuccessfulJobs}</div>
              <p className="text-xs text-muted-foreground">
                of {dashboardData.extension.todayJobsApplied} applied
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.support.openTickets}</div>
              <p className="text-xs text-muted-foreground">
                of {dashboardData.support.totalTickets} total
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="usage">Usage Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Customers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Customer List</CardTitle>
              <CardDescription>Manage customer accounts and extension access</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Extension</TableHead>
                    <TableHead>Usage Stats</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer: Customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">{customer.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(customer.subscriptionStatus)}>
                          {customer.subscriptionStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant={customer.extensionActivated ? "default" : "secondary"}>
                            {customer.extensionActivated ? "Active" : "Inactive"}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            Used: {customer.extensionUsageCount} times
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{customer.extensionSuccessfulJobs} successful jobs</div>
                          <div className="text-muted-foreground">
                            Last used: {formatDate(customer.extensionLastUsed)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{formatCurrency(customer.totalSpent)}</div>
                          <div className="text-sm text-muted-foreground">
                            {customer.totalOrders} orders
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedCustomer(customer.id)}
                              >
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Customer Details: {customer.name}</DialogTitle>
                              </DialogHeader>
                              {selectedCustomer === customer.id && customerDetails && (
                                <div className="space-y-6">
                                  {/* Customer Info */}
                                  <div className="grid grid-cols-2 gap-4">
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-sm">Account Information</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-2">
                                        <div><strong>Email:</strong> {customerDetails.customer.email}</div>
                                        <div><strong>Created:</strong> {formatDate(customerDetails.customer.createdAt)}</div>
                                        <div><strong>Subscription:</strong> {customerDetails.customer.subscriptionStatus}</div>
                                        <div><strong>Activation Key:</strong> {customerDetails.customer.activationKey || 'None'}</div>
                                      </CardContent>
                                    </Card>
                                    
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-sm">Extension Usage</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-2">
                                        <div><strong>Total Usage:</strong> {customerDetails.customer.extensionUsageCount}</div>
                                        <div><strong>Successful Jobs:</strong> {customerDetails.customer.extensionSuccessfulJobs}</div>
                                        <div><strong>Last Used:</strong> {formatDate(customerDetails.customer.extensionLastUsed)}</div>
                                      </CardContent>
                                    </Card>
                                  </div>

                                  {/* Recent Usage */}
                                  {customerDetails.usageStats.length > 0 && (
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-sm">Recent Usage Activity</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead>Date</TableHead>
                                              <TableHead>Platform</TableHead>
                                              <TableHead>Jobs Found</TableHead>
                                              <TableHead>Applied</TableHead>
                                              <TableHead>Successful</TableHead>
                                              <TableHead>Duration</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {customerDetails.usageStats.slice(0, 10).map((stat) => (
                                              <TableRow key={stat.id}>
                                                <TableCell>{formatDate(stat.usageDate)}</TableCell>
                                                <TableCell>{stat.platform}</TableCell>
                                                <TableCell>{stat.jobsFound}</TableCell>
                                                <TableCell>{stat.jobsApplied}</TableCell>
                                                <TableCell>{stat.successfulJobs}</TableCell>
                                                <TableCell>{stat.sessionDuration}m</TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </CardContent>
                                    </Card>
                                  )}

                                  {/* Payment History */}
                                  {customerDetails.payments.length > 0 && (
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-sm">Payment History</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead>Date</TableHead>
                                              <TableHead>Amount</TableHead>
                                              <TableHead>Method</TableHead>
                                              <TableHead>Status</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {customerDetails.payments.map((payment) => (
                                              <TableRow key={payment.id}>
                                                <TableCell>{formatDate(payment.createdAt)}</TableCell>
                                                <TableCell>{formatCurrency(payment.amount)}</TableCell>
                                                <TableCell>{payment.paymentMethod}</TableCell>
                                                <TableCell>
                                                  <Badge className={payment.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}>
                                                    {payment.status}
                                                  </Badge>
                                                </TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </CardContent>
                                    </Card>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateKeyMutation.mutate(customer.id)}
                            disabled={generateKeyMutation.isPending}
                          >
                            <Key className="h-3 w-3 mr-1" />
                            Generate Key
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData && (
                  <div className="space-y-4">
                    <div className="text-3xl font-bold">
                      {formatCurrency(dashboardData.revenue.total.toString())}
                    </div>
                    <div className="text-muted-foreground">
                      Total Revenue from {dashboardData.revenue.sales} sales
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Extension Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Today's Sessions:</span>
                      <span className="font-medium">{dashboardData.extension.todaySessions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Jobs Found:</span>
                      <span className="font-medium">{dashboardData.extension.todayJobsFound}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Applications:</span>
                      <span className="font-medium">{dashboardData.extension.todayJobsApplied}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate:</span>
                      <span className="font-medium">
                        {dashboardData.extension.todayJobsApplied > 0 
                          ? Math.round((dashboardData.extension.todaySuccessfulJobs / dashboardData.extension.todayJobsApplied) * 100)
                          : 0
                        }%
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Global Usage Statistics (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {globalStats.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Active Users</TableHead>
                      <TableHead>Sessions</TableHead>
                      <TableHead>Jobs Found</TableHead>
                      <TableHead>Applications</TableHead>
                      <TableHead>Successful</TableHead>
                      <TableHead>Avg Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {globalStats.map((stat) => (
                      <TableRow key={stat.statDate}>
                        <TableCell>{stat.statDate}</TableCell>
                        <TableCell>{stat.activeUsers}</TableCell>
                        <TableCell>{stat.totalSessions}</TableCell>
                        <TableCell>{stat.totalJobsFound}</TableCell>
                        <TableCell>{stat.totalJobsApplied}</TableCell>
                        <TableCell>{stat.totalSuccessfulJobs}</TableCell>
                        <TableCell>{Math.round(stat.avgSessionDuration)}m</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No usage statistics available yet. Statistics will appear once customers start using the extension.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}