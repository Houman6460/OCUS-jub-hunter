import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, ShieldOff, Key, Download, Clock, Users, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Customer {
  id: string;
  name: string;
  email: string;
  isBlocked: boolean;
  blockedReason: string | null;
  blockedAt: Date | null;
  extensionActivated: boolean;
  extensionTrialJobsUsed: number;
  extensionTrialLimit: number;
  activationKey: string | null;
  extensionLastUsed: Date | null;
  createdAt: Date;
}

interface ExtensionDownload {
  id: number;
  downloadToken: string;
  downloadCount: number;
  downloadType: string;
  createdAt: Date;
}

export function CustomerManager() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Fetch all customers
  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ['/api/admin/extension/customers'],
  });

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Generate activation key mutation
  const generateKeyMutation = useMutation({
    mutationFn: (customerId: string) => 
      apiRequest(`/api/admin/extension/generate-key/${customerId}`, 'POST'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/extension/customers'] });
      toast({
        title: 'Success',
        description: 'Activation key generated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to generate activation key',
        variant: 'destructive',
      });
    },
  });

  // Block customer mutation
  const blockMutation = useMutation({
    mutationFn: ({ customerId, reason }: { customerId: string; reason: string }) => 
      apiRequest(`/api/admin/extension/block/${customerId}`, 'POST', { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/extension/customers'] });
      setBlockReason('');
      toast({
        title: 'Success',
        description: 'Customer blocked successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to block customer',
        variant: 'destructive',
      });
    },
  });

  // Unblock customer mutation
  const unblockMutation = useMutation({
    mutationFn: (customerId: string) => 
      apiRequest(`/api/admin/extension/unblock/${customerId}`, 'POST'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/extension/customers'] });
      toast({
        title: 'Success',
        description: 'Customer unblocked successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to unblock customer',
        variant: 'destructive',
      });
    },
  });

  const handleGenerateKey = (customerId: string) => {
    generateKeyMutation.mutate(customerId);
  };

  const handleBlockCustomer = (customerId: string) => {
    if (!blockReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for blocking',
        variant: 'destructive',
      });
      return;
    }
    blockMutation.mutate({ customerId, reason: blockReason });
  };

  const handleUnblockCustomer = (customerId: string) => {
    unblockMutation.mutate(customerId);
  };

  const getStatusBadge = (customer: Customer) => {
    if (customer.isBlocked) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <Shield className="w-3 h-3" />
        Blocked
      </Badge>;
    }
    if (customer.extensionActivated) {
      return <Badge variant="default" className="flex items-center gap-1">
        <Key className="w-3 h-3" />
        Activated
      </Badge>;
    }
    return <Badge variant="secondary" className="flex items-center gap-1">
      <Clock className="w-3 h-3" />
      Trial ({customer.extensionTrialJobsUsed}/{customer.extensionTrialLimit})
    </Badge>;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading customers...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Customer Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Stats */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Total: {customers.length}</span>
              <span>Activated: {customers.filter(c => c.extensionActivated).length}</span>
              <span>Blocked: {customers.filter(c => c.isBlocked).length}</span>
            </div>
          </div>

          {/* Customers Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Trial Usage</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Activation Key</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">{customer.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(customer)}
                      {customer.isBlocked && customer.blockedReason && (
                        <div className="text-xs text-red-600 mt-1">
                          {customer.blockedReason}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {customer.extensionTrialJobsUsed} / {customer.extensionTrialLimit} jobs
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {customer.extensionLastUsed 
                          ? new Date(customer.extensionLastUsed).toLocaleDateString()
                          : 'Never'
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-mono">
                        {customer.activationKey || 'Not generated'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {!customer.extensionActivated && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleGenerateKey(customer.id)}
                            disabled={generateKeyMutation.isPending}
                          >
                            <Key className="w-4 h-4 mr-1" />
                            Generate Key
                          </Button>
                        )}
                        
                        {customer.isBlocked ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUnblockCustomer(customer.id)}
                            disabled={unblockMutation.isPending}
                          >
                            <ShieldOff className="w-4 h-4 mr-1" />
                            Unblock
                          </Button>
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedCustomer(customer)}
                              >
                                <Shield className="w-4 h-4 mr-1" />
                                Block
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Block Customer</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <p>Block {customer.name} ({customer.email})?</p>
                                <Textarea
                                  placeholder="Reason for blocking..."
                                  value={blockReason}
                                  onChange={(e) => setBlockReason(e.target.value)}
                                />
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    variant="outline"
                                    onClick={() => setBlockReason('')}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleBlockCustomer(customer.id)}
                                    disabled={blockMutation.isPending}
                                  >
                                    <Shield className="w-4 h-4 mr-1" />
                                    Block Customer
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No customers found matching your search.' : 'No customers found.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}