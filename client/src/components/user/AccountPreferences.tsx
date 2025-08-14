import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Shield, 
  Key, 
  Trash2, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  CheckCircle2,
  Lock,
  UserX,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and numbers'),
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type PasswordChangeForm = z.infer<typeof passwordChangeSchema>;

interface Customer {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  extensionActivated: boolean;
  totalSpent: string | number;
  totalOrders: number;
}

interface AccountPreferencesProps {
  customer: Customer;
}

export function AccountPreferences({ customer }: AccountPreferencesProps) {
  const [, navigate] = useLocation();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const passwordForm = useForm<PasswordChangeForm>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  // Change Password Mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordChangeForm) => {
      const response = await apiRequest('POST', `/api/customer/${customer.id || customer.email}/change-password`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Password Changed Successfully',
        description: 'Your password has been updated. Please use your new password for future logins.',
      });
      passwordForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Password Change Failed',
        description: error.message || 'Failed to change password. Please check your current password.',
        variant: 'destructive',
      });
    }
  });

  // Delete Account Mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', `/api/customer/${customer.id || customer.email}/delete-account`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Account Deleted',
        description: 'Your account has been permanently deleted. You will be redirected to the homepage.',
      });
      // Clear localStorage and redirect
      localStorage.removeItem('customer_token');
      localStorage.removeItem('customer_data');
      localStorage.removeItem('first-visit-guide-completed');
      setTimeout(() => {
        navigate('/');
      }, 3000);
    },
    onError: (error: any) => {
      toast({
        title: 'Account Deletion Failed',
        description: error.message || 'Failed to delete account. Please try again.',
        variant: 'destructive',
      });
    }
  });

  const onPasswordSubmit = (data: PasswordChangeForm) => {
    changePasswordMutation.mutate(data);
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText.toLowerCase() !== 'delete my account') {
      toast({
        title: 'Confirmation Required',
        description: 'Please type "delete my account" to confirm account deletion.',
        variant: 'destructive',
      });
      return;
    }
    deleteAccountMutation.mutate();
    setIsDeleteDialogOpen(false);
  };

  const canDeleteAccount = parseFloat(customer.totalSpent?.toString() || '0') === 0;

  return (
    <div className="space-y-6">
      {/* Account Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Account Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Account Email</Label>
              <p className="font-medium">{customer.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Account Status</Label>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={customer.extensionActivated ? "default" : "secondary"}>
                  {customer.extensionActivated ? "Premium" : "Trial"}
                </Badge>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">Verified</span>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Member Since</Label>
              <p className="font-medium">{new Date(customer.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Total Orders</Label>
              <p className="font-medium">{customer.totalOrders || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  {...passwordForm.register('currentPassword')}
                  placeholder="Enter your current password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-sm text-red-600">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  {...passwordForm.register('newPassword')}
                  placeholder="Enter your new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {passwordForm.formState.errors.newPassword && (
                <p className="text-sm text-red-600">{passwordForm.formState.errors.newPassword.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters with uppercase, lowercase, and numbers
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...passwordForm.register('confirmPassword')}
                  placeholder="Confirm your new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-sm text-red-600">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={changePasswordMutation.isPending}
              className="flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              {changePasswordMutation.isPending ? 'Changing Password...' : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone - Account Deletion */}
      <Card className="border-red-200 bg-red-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Warning:</strong> Account deletion is permanent and cannot be undone. 
              All your data, downloads, and purchase history will be permanently removed.
            </AlertDescription>
          </Alert>

          {!canDeleteAccount && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Account Deletion Restricted:</strong> You cannot delete your account because you have made purchases (Total spent: €{customer.totalSpent}). 
                This protects your purchase history and activation keys. Please contact support for assistance.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <h4 className="font-medium text-red-800">What happens when you delete your account:</h4>
            <ul className="text-sm text-red-700 space-y-1 ml-4">
              <li>• Your account and profile will be permanently deleted</li>
              <li>• All extension downloads and activation keys will be revoked</li>
              <li>• Your purchase history and invoices will be removed</li>
              <li>• Any support tickets will be closed</li>
              <li>• You will not be able to recover your account or data</li>
            </ul>
          </div>

          <Separator />

          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="destructive" 
                disabled={!canDeleteAccount || deleteAccountMutation.isPending}
                className="flex items-center gap-2"
              >
                <UserX className="w-4 h-4" />
                Delete My Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  Confirm Account Deletion
                </DialogTitle>
                <DialogDescription className="text-left space-y-2">
                  <p className="font-semibold text-red-800">
                    This action cannot be undone!
                  </p>
                  <p>
                    Please type <strong>"delete my account"</strong> to confirm that you want to 
                    permanently delete your account and all associated data.
                  </p>
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deleteConfirm">Type "delete my account" to confirm</Label>
                  <Input
                    id="deleteConfirm"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="delete my account"
                    className="border-red-200 focus:border-red-400"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsDeleteDialogOpen(false);
                    setDeleteConfirmText('');
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={deleteAccountMutation.isPending || deleteConfirmText.toLowerCase() !== 'delete my account'}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleteAccountMutation.isPending ? 'Deleting...' : 'Delete Account'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}