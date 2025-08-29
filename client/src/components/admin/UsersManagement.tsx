import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  UserCheck, 
  Clock, 
  Star,
  Search,
  Calendar,
  Download,
  CreditCard,
  Mail,
  RefreshCw,
  FileText,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  created_at: string;
  is_premium: boolean;
  premium_activated_at?: string;
  total_spent: number;
  total_orders: number;
  extension_activated: boolean;
  trial_downloads: number;
  purchase_count: number;
  last_download?: string;
  last_purchase?: string;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
}

export function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);

  // Add error logging
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('UsersManagement Error:', event.error);
      setError(event.error?.message || 'Unknown error occurred');
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Fetch users data
  const { data, isLoading, refetch, error: queryError } = useQuery<{ users: User[], stats: UserStats }>({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      try {
        // Use development server port in development mode
        const baseUrl = import.meta.env.DEV ? 'http://localhost:5001' : '';
        const response = await fetch(`${baseUrl}/api/admin/users`, {
          credentials: 'include', // Include cookies for session auth
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        console.log('Users API response:', result);
        return result;
      } catch (err) {
        console.error('Error fetching users:', err);
        throw err;
      }
    },
    retry: 1,
    staleTime: 30000,
  });

  // Fetch user invoices
  const { data: userInvoices, error: invoicesError } = useQuery({
    queryKey: ['/api/admin/invoices'],
    queryFn: async () => {
      try {
        // Use development server port in development mode
        const baseUrl = import.meta.env.DEV ? 'http://localhost:5001' : '';
        const response = await fetch(`${baseUrl}/api/admin/invoices`, {
          credentials: 'include', // Include cookies for session auth
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          console.warn('Invoices API failed, continuing without invoices');
          return [];
        }
        const result = await response.json();
        console.log('Invoices API response:', result);
        return result;
      } catch (err) {
        console.warn('Error fetching invoices:', err);
        return []; // Return empty array instead of throwing
      }
    },
    retry: 1,
    staleTime: 30000,
  });

  const users = data?.users || [];
  const stats = data?.stats || { totalUsers: 0, activeUsers: 0, premiumUsers: 0 };

  // Filter users based on search and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    switch (statusFilter) {
      case 'premium':
        return user.is_premium;
      case 'trial':
        return user.trial_downloads > 0 && !user.is_premium;
      case 'inactive':
        return user.trial_downloads === 0 && !user.is_premium;
      default:
        return true;
    }
  });

  const getUserStatusBadge = (user: User) => {
    if (user.is_premium) {
      return <Badge className="bg-yellow-100 text-yellow-800">Premium</Badge>;
    } else if (user.trial_downloads > 0) {
      return <Badge className="bg-blue-100 text-blue-800">Trial User</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800">Registered</Badge>;
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  // Get user's invoices
  const getUserInvoices = (userId: number) => {
    if (!Array.isArray(userInvoices)) return [];
    return userInvoices.filter((invoice: any) => invoice.customer_id === userId) || [];
  };

  // Download invoice PDF
  const downloadInvoicePDF = async (userId: number, userName: string, userEmail: string) => {
    const invoices = getUserInvoices(userId);
    if (invoices.length === 0) {
      alert('No invoices found for this user');
      return;
    }

    // Use the most recent invoice
    const latestInvoice = invoices[0];
    
    try {
      const { downloadInvoicePDF } = await import('@/lib/invoiceGenerator');
      
      const success = await downloadInvoicePDF({
        invoiceNumber: latestInvoice.invoice_number.toString(),
        customerName: userName,
        customerEmail: userEmail,
        amount: parseFloat(latestInvoice.amount),
        currency: latestInvoice.currency,
        invoiceDate: latestInvoice.invoice_date,
        dueDate: latestInvoice.due_date,
        productId: latestInvoice.product_id,
        paymentMethod: latestInvoice.payment_method || 'Credit Card',
        orderId: latestInvoice.order_id,
        status: latestInvoice.status,
        paidAt: latestInvoice.paid_at
      });

      if (!success) {
        throw new Error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error generating invoice PDF:', error instanceof Error ? error.message : error);
      alert('Failed to generate invoice PDF');
    }
  };

  // Show error state
  if (error || queryError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Users</h3>
          <p className="text-gray-600 mb-4">{error || queryError?.message || 'Unknown error'}</p>
          <Button onClick={() => {
            setError(null);
            refetch();
          }} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Users & Customers Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage all registered users, customer data, trial usage, and account status</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activated Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Downloaded trial or purchased
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trials</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers - stats.premiumUsers}</div>
            <p className="text-xs text-muted-foreground">
              Trial users (non-premium)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users Management */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            View and manage registered users, their trial usage, and purchase history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="premium">Premium Users</SelectItem>
                <SelectItem value="trial">Trial Users</SelectItem>
                <SelectItem value="inactive">Inactive Users</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users List */}
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' ? 'No users match your filters' : 'No users found'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </p>
                    </div>
                    <div className="text-right">
                      {getUserStatusBadge(user)}
                      {user.is_premium && (
                        <p className="text-sm font-bold text-green-600 mt-1">
                          €{user.total_spent?.toFixed(2) || '0.00'} spent
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Registered</p>
                        <p className="text-sm font-medium">
                          {format(new Date(user.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Trial Downloads</p>
                        <p className="text-sm font-medium">{user.trial_downloads}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Purchases</p>
                        <p className="text-sm font-medium">{user.purchase_count}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Invoices</p>
                        <p className="text-sm font-medium">{getUserInvoices(user.id).length}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <p className="text-sm font-medium">
                          {user.extension_activated ? 'Activated' : 'Not Activated'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* User Actions and Invoice Info */}
                  <div className="mt-4 pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {user.last_download && (
                          <span>Last activity: {format(new Date(user.last_download), 'MMM dd, yyyy HH:mm')}</span>
                        )}
                        {getUserInvoices(user.id).length > 0 && (
                          <span className="ml-4">
                            Latest invoice: {format(new Date(getUserInvoices(user.id)[0]?.invoice_date), 'MMM dd, yyyy')}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {getUserInvoices(user.id).length > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadInvoicePDF(user.id, user.name, user.email)}
                            className="text-xs"
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            Download Invoice
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/dashboard?userId=${user.id}`, '_blank')}
                          className="text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
