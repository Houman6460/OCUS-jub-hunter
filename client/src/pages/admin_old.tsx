import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Star,
  Settings,
  Download,
  Mail,
  Upload,
  TrendingUp,
  Calendar,
  Percent,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";

interface Analytics {
  totalRevenue: number;
  totalSales: number;
  activeCustomers: number;
  avgRating: number;
  recentOrders: Order[];
}

interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  amount: string;
  status: string;
  createdAt: string;
  paymentMethod: string;
}

interface Coupon {
  id: number;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: string;
  isActive: boolean;
  usageLimit: number | null;
  usageCount: number;
  expiresAt: string | null;
  createdAt: string;
}

// Coupon Form Component
function CouponForm({ editingCoupon, onSave, onCancel }: {
  editingCoupon?: Coupon;
  onSave: () => void;
  onCancel: () => void;
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    code: editingCoupon?.code || '',
    discountType: editingCoupon?.discountType || 'percentage',
    discountValue: editingCoupon?.discountValue || '',
    usageLimit: editingCoupon?.usageLimit?.toString() || '',
    expiresAt: editingCoupon?.expiresAt ? new Date(editingCoupon.expiresAt).toISOString().split('T')[0] : '',
  });

  const createCouponMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/coupons', data);
      if (!response.ok) throw new Error('Failed to create coupon');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Coupon created successfully" });
      onSave();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      discountValue: parseFloat(formData.discountValue),
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
    };
    createCouponMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="code">Coupon Code</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            placeholder="SAVE20"
            required
          />
        </div>
        <div>
          <Label htmlFor="discountType">Discount Type</Label>
          <select
            id="discountType"
            value={formData.discountType}
            onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount ($)</option>
          </select>
        </div>
        <div>
          <Label htmlFor="discountValue">
            Discount Value {formData.discountType === 'percentage' ? '(%)' : '($)'}
          </Label>
          <Input
            id="discountValue"
            type="number"
            step="0.01"
            value={formData.discountValue}
            onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
            placeholder={formData.discountType === 'percentage' ? '20' : '100'}
            required
          />
        </div>
        <div>
          <Label htmlFor="usageLimit">Usage Limit (Optional)</Label>
          <Input
            id="usageLimit"
            type="number"
            value={formData.usageLimit}
            onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
            placeholder="100"
          />
        </div>
        <div>
          <Label htmlFor="expiresAt">Expires At (Optional)</Label>
          <Input
            id="expiresAt"
            type="date"
            value={formData.expiresAt}
            onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={createCouponMutation.isPending}>
          {createCouponMutation.isPending ? 'Creating...' : editingCoupon ? 'Update' : 'Create'} Coupon
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// Coupon List Component
function CouponList({ onEdit, onDelete }: {
  onEdit: (coupon: Coupon) => void;
  onDelete: () => void;
}) {
  const { toast } = useToast();
  
  const { data: coupons, isLoading } = useQuery<Coupon[]>({
    queryKey: ['/api/coupons'],
  });

  const deleteCouponMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/coupons/${id}`);
      if (!response.ok) throw new Error('Failed to delete coupon');
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Coupon deleted successfully" });
      onDelete();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  if (isLoading) {
    return <div className="text-center py-4">Loading coupons...</div>;
  }

  if (!coupons || coupons.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <Percent className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No coupons created yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {coupons.map((coupon) => (
        <div key={coupon.id} className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="font-mono font-bold text-lg bg-slate-100 px-3 py-1 rounded">
                {coupon.code}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={coupon.isActive ? 'default' : 'secondary'}>
                  {coupon.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <span className="text-sm text-slate-600">
                  {coupon.discountType === 'percentage' 
                    ? `${coupon.discountValue}% off` 
                    : `$${coupon.discountValue} off`}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(coupon)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this coupon?')) {
                    deleteCouponMutation.mutate(coupon.id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="mt-2 text-sm text-slate-500 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="font-medium">Used:</span> {coupon.usageCount}
              {coupon.usageLimit && ` / ${coupon.usageLimit}`}
            </div>
            <div>
              <span className="font-medium">Created:</span> {new Date(coupon.createdAt).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Expires:</span> {
                coupon.expiresAt 
                  ? new Date(coupon.expiresAt).toLocaleDateString()
                  : 'Never'
              }
            </div>
            <div>
              <span className="font-medium">Status:</span> {
                coupon.expiresAt && new Date() > new Date(coupon.expiresAt)
                  ? 'Expired'
                  : coupon.usageLimit && coupon.usageCount >= coupon.usageLimit
                  ? 'Limit Reached'
                  : 'Available'
              }
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [newPrice, setNewPrice] = useState('');

  // Check admin access
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Access Denied</h1>
            <p className="text-slate-600 mb-6">You don't have permission to access the admin dashboard.</p>
            <Button onClick={() => {
              const password = prompt('Enter admin password:');
              if (password === 'admin123') {
                localStorage.setItem('isAdmin', 'true');
                window.location.reload();
              } else {
                alert('Invalid password');
              }
            }}>
              Admin Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading } = useQuery<Analytics>({
    queryKey: ['/api/admin/analytics'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery<{ orders: Order[], total: number }>({
    queryKey: ['/api/admin/orders'],
  });

  // Fetch coupons
  const couponQuery = useQuery<Coupon[]>({
    queryKey: ['/api/coupons'],
  });

  // Update price mutation
  const updatePriceMutation = useMutation({
    mutationFn: async (price: string) => {
      const response = await apiRequest('PUT', '/api/settings/product_price', { value: price });
      if (!response.ok) throw new Error('Failed to update price');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Price updated successfully" });
      setNewPrice('');
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiRequest('POST', '/api/admin/upload', formData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Extension file uploaded successfully!",
      });
      setUploadFile(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload file: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = () => {
    if (uploadFile) {
      uploadMutation.mutate(uploadFile);
    }
  };

  if (analyticsLoading || ordersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-slate-300 mt-2">Manage your OCUS Job Hunter sales and analytics</p>
            </div>
            <Button variant="outline" onClick={() => {
              localStorage.removeItem('isAdmin');
              window.location.href = '/';
            }}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Cards */}
        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary/20 text-primary rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6" />
                </div>
                <Badge variant="secondary" className="text-accent">+12.5%</Badge>
              </div>
              <h3 className="text-2xl font-bold">${analytics?.totalRevenue.toLocaleString() || '0'}</h3>
              <p className="text-slate-600">Total Revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-accent/20 text-accent rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6" />
                </div>
                <Badge variant="secondary" className="text-accent">+8.2%</Badge>
              </div>
              <h3 className="text-2xl font-bold">{analytics?.totalSales.toLocaleString() || '0'}</h3>
              <p className="text-slate-600">Total Sales</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-secondary/20 text-secondary rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
                <Badge variant="secondary" className="text-accent">+15.3%</Badge>
              </div>
              <h3 className="text-2xl font-bold">{analytics?.activeCustomers.toLocaleString() || '0'}</h3>
              <p className="text-slate-600">Active Customers</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-500/20 text-yellow-500 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6" />
                </div>
                <Badge variant="secondary" className="text-accent">+0.1</Badge>
              </div>
              <h3 className="text-2xl font-bold">{analytics?.avgRating || '4.9'}</h3>
              <p className="text-slate-600">Avg Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Admin Tabs */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="payments">Payment Settings</TabsTrigger>
            <TabsTrigger value="chatbot">Chat Assistant</TabsTrigger>
            <TabsTrigger value="coupons">Coupons</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            {/* Pricing Management */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing Management
                </CardTitle>
              </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="productPrice">Product Price (USD)</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="productPrice"
                    type="number"
                    placeholder="500"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                  />
                  <Button 
                    onClick={() => {
                      if (newPrice && parseFloat(newPrice) > 0) {
                        updatePriceMutation.mutate(newPrice);
                      }
                    }}
                    disabled={updatePriceMutation.isPending}
                  >
                    {updatePriceMutation.isPending ? 'Updating...' : 'Update'}
                  </Button>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  Current price: $500
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Pricing Tips</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Higher prices = higher perceived value</li>
                  <li>• Test different price points</li>
                  <li>• Use coupons for promotions</li>
                  <li>• Monitor conversion rates</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coupon Management */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Coupon Management
              </CardTitle>
              <Button 
                onClick={() => setShowCouponForm(!showCouponForm)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Coupon
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showCouponForm && (
              <div className="bg-slate-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold mb-4">
                  {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                </h3>
                <CouponForm 
                  editingCoupon={editingCoupon}
                  onSave={() => {
                    setShowCouponForm(false);
                    setEditingCoupon(null);
                    couponQuery.refetch();
                  }}
                  onCancel={() => {
                    setShowCouponForm(false);
                    setEditingCoupon(null);
                  }}
                />
              </div>
            )}
            
            <CouponList 
              onEdit={(coupon) => {
                setEditingCoupon(coupon);
                setShowCouponForm(true);
              }}
              onDelete={() => couponQuery.refetch()}
            />
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Extension File
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file">Select Extension File (.crx)</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".crx,.zip"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  />
                </div>
                {uploadFile && (
                  <div className="text-sm text-slate-600">
                    Selected: {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
                <Button 
                  onClick={handleFileUpload}
                  disabled={!uploadFile || uploadMutation.isPending}
                  className="w-full"
                >
                  {uploadMutation.isPending ? 'Uploading...' : 'Upload File'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {analytics?.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                        <Download className="text-white text-sm h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Extension Purchase</h4>
                        <p className="text-sm text-slate-600">{order.customerEmail}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-accent">${order.amount}</div>
                      <div className="text-xs text-slate-400">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Payment Settings Tab */}
      <TabsContent value="payments">
        <PaymentSettingsTab />
      </TabsContent>

      {/* Chat Assistant Tab */}
      <TabsContent value="chatbot">
        <ChatAssistantTab />
      </TabsContent>

      {/* Coupons Tab */}
      <TabsContent value="coupons">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  Coupon Management
                </CardTitle>
                <Button 
                  onClick={() => setShowCouponForm(!showCouponForm)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Coupon
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showCouponForm && (
                <div className="bg-slate-50 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold mb-4">
                    {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                  </h3>
                  <CouponForm 
                    editingCoupon={editingCoupon}
                    onSave={() => {
                      setShowCouponForm(false);
                      setEditingCoupon(null);
                      couponQuery.refetch();
                    }}
                    onCancel={() => {
                      setShowCouponForm(false);
                      setEditingCoupon(null);
                    }}
                  />
                </div>
              )}
              
              <CouponList 
                onEdit={(coupon) => {
                  setEditingCoupon(coupon);
                  setShowCouponForm(true);
                }}
                onDelete={() => couponQuery.refetch()}
              />
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Settings Tab */}
      <TabsContent value="settings">
        <GeneralSettingsTab />
      </TabsContent>
    </Tabs>
  </div>
</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Analytics Chart */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Revenue Analytics
              </CardTitle>
              <select className="bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-sm">
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>Last year</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {/* Simple revenue chart mockup */}
            <div className="h-64 bg-slate-100 rounded-lg flex items-end justify-between p-4 space-x-2">
              {[16, 24, 20, 32, 28, 40, 36, 48, 44, 52, 56, 60].map((height, i) => (
                <div key={i} className="bg-primary rounded-t" style={{ width: '24px', height: `${height * 3}px` }}></div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-slate-400 mt-4">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => (
                <span key={month}>{month}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Customer Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Customer Management</CardTitle>
              <Button variant="outline">
                Export Customer List
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold">Customer</th>
                    <th className="text-left py-3 px-4 font-semibold">Purchase Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  {ordersData?.orders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-semibold text-slate-900">{order.customerName}</div>
                          <div className="text-sm text-slate-500">{order.customerEmail}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-accent">${order.amount}</td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={order.status === 'completed' ? 'default' : 'secondary'}
                          className={order.status === 'completed' ? 'bg-accent text-white' : ''}
                        >
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
