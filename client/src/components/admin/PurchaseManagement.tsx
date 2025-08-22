import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ShoppingCart, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Download, 
  Eye, 
  RefreshCw, 
  Search,
  Calendar,
  CreditCard,
  Star,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Order {
  id: number;
  customer_id: number;
  customer_email: string;
  customer_name: string;
  product_id: string;
  original_amount: string;
  final_amount: string;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  download_token?: string;
  download_count: number;
  max_downloads: number;
  activation_code?: string;
  created_at: string;
  completed_at?: string;
}

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  completedOrders: number;
  pendingOrders: number;
}

export function PurchaseManagement() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch orders and statistics
  const { data: ordersData, isLoading, error } = useQuery({
    queryKey: ['/api/admin/orders'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      return response.json();
    }
  });

  const orders: Order[] = ordersData?.orders || [];
  const stats: OrderStats = ordersData?.stats || {
    totalOrders: 0,
    totalRevenue: 0,
    completedOrders: 0,
    pendingOrders: 0
  };

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Update order status mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const response = await apiRequest('PUT', `/api/admin/orders/${orderId}`, { status });
      if (!response.ok) {
        throw new Error('Failed to update order');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      toast({ title: "Success", description: "Order status updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">✓ Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">⏳ Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-200">✗ Failed</Badge>;
      case 'refunded':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">↩ Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedOrders} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From {stats.completedOrders} sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedOrders}</div>
            <p className="text-xs text-muted-foreground">
              Active premium accounts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Purchase Management</CardTitle>
              <CardDescription>
                Manage customer orders, track payments, and handle premium activations
              </CardDescription>
            </div>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by email, name, or order ID..."
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
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders List */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-gray-600">Loading orders...</p>
            </div>
          ) : error ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Failed to load orders. Please try again later.
              </AlertDescription>
            </Alert>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' ? 'No orders match your filters' : 'No orders found'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">Order #{order.id}</h3>
                      <p className="text-sm text-gray-600">
                        {order.customer_name} ({order.customer_email})
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(order.status)}
                      <p className="text-lg font-bold text-primary mt-1">
                        {order.currency.toUpperCase()} {parseFloat(order.final_amount).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Created</p>
                        <p className="text-sm font-medium">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Payment</p>
                        <p className="text-sm font-medium capitalize">{order.payment_method}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Downloads</p>
                        <p className="text-sm font-medium">{order.download_count} / {order.max_downloads}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Product</p>
                        <p className="text-sm font-medium">Premium Extension</p>
                      </div>
                    </div>
                  </div>

                  {/* Show version type instead of activation code */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-700">
                      <strong>Version:</strong> {order.product_id === 'trial' ? 'Trial Version' : 'Premium Version'}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Order #{order.id} Details</DialogTitle>
                          <DialogDescription>
                            Complete order information and management options
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-2">Customer Information</h4>
                              <p className="text-sm"><strong>Name:</strong> {order.customer_name}</p>
                              <p className="text-sm"><strong>Email:</strong> {order.customer_email}</p>
                              <p className="text-sm"><strong>Customer ID:</strong> {order.customer_id}</p>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Order Information</h4>
                              <p className="text-sm"><strong>Product:</strong> {order.product_id}</p>
                              <p className="text-sm"><strong>Amount:</strong> {order.currency.toUpperCase()} {order.final_amount}</p>
                              <p className="text-sm"><strong>Payment:</strong> {order.payment_method}</p>
                            </div>
                          </div>
                          
                          {order.status !== 'completed' && (
                            <div className="border-t pt-4">
                              <h4 className="font-medium mb-2">Actions</h4>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => updateOrderMutation.mutate({ 
                                    orderId: order.id, 
                                    status: 'completed' 
                                  })}
                                  disabled={updateOrderMutation.isPending}
                                >
                                  Mark as Completed
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateOrderMutation.mutate({ 
                                    orderId: order.id, 
                                    status: 'failed' 
                                  })}
                                  disabled={updateOrderMutation.isPending}
                                >
                                  Mark as Failed
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>

                    {order.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderMutation.mutate({ 
                          orderId: order.id, 
                          status: 'completed' 
                        })}
                        disabled={updateOrderMutation.isPending}
                      >
                        Complete Order
                      </Button>
                    )}
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
