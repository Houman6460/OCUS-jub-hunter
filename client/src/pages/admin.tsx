import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import CustomerManagement from "./customer-management";
import AdminSidebar from "@/components/AdminSidebar";
import { CustomerManager } from "@/components/admin/CustomerManager";
import AdminAffiliates from "./admin-affiliates";
import { InvoiceManagement } from "@/components/admin/InvoiceManagement";
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
  EyeOff,
  CreditCard,
  MessageCircle,
  Bot,
  Key,
  Save,
  Shield,
  Github,
  Chrome,
  Facebook,
  Ticket,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Send,
  Paperclip,
  X,
  Image,
  FileText,
  ToggleLeft,
  ToggleRight,
  Globe
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

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  userId: number;
  userName?: string;
  userEmail?: string;
  createdAt: string;
  updatedAt: string;
  messages?: TicketMessage[];
}

interface TicketMessage {
  id: number;
  ticketId: number;
  content: string;
  isAdmin: boolean;
  authorName: string;
  createdAt: string;
  attachments?: TicketAttachment[];
}

interface TicketAttachment {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
}

// Ticket Management Tab Component
function TicketManagementTab() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all tickets
  const { data: tickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ['/api/admin/tickets'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/tickets');
      const data = await response.json();
      // Normalize to admin UI expectations (camelCase, status values)
      return Array.isArray(data)
        ? data.map((t: any) => ({
            ...t,
            createdAt: t.createdAt ?? t.created_at ?? t.created,
            updatedAt: t.updatedAt ?? t.updated_at ?? t.updated,
            userName: t.userName ?? t.customerName ?? t.customer_name,
            userEmail: t.userEmail ?? t.customerEmail ?? t.customer_email,
            // Convert 'in-progress' to 'in_progress' if needed
            status: t.status === 'in-progress' ? 'in_progress' : t.status,
          }))
        : [];
    }
  });

  // Fetch messages for selected ticket
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: [`/api/tickets/${selectedTicket?.id}/messages`],
    queryFn: async () => {
      if (!selectedTicket) return [];
      let data: any = [];
      try {
        const response = await apiRequest('GET', `/api/tickets/${selectedTicket.id}/messages`);
        data = await response.json();
      } catch (err: any) {
        if (typeof err?.message === 'string' && err.message.startsWith('404:')) {
          return [];
        }
        throw err;
      }
      // Normalize message fields for admin UI
      return Array.isArray(data)
        ? data.map((m: any) => ({
            ...m,
            content: m.content ?? m.message,
            isAdmin: typeof m.isAdmin === 'boolean'
              ? m.isAdmin
              : (typeof m.isFromCustomer === 'boolean'
                ? !m.isFromCustomer
                : (typeof m.is_from_customer === 'boolean' ? !m.is_from_customer : false)),
            authorName: m.authorName ?? m.senderName ?? m.sender_name ?? m.sender,
            createdAt: m.createdAt ?? m.created_at,
          }))
        : [];
    },
    enabled: !!selectedTicket
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { ticketId: number; content: string; attachments?: File[] }) => {
      const hasAttachments = !!(data.attachments && data.attachments.length > 0);
      // Prefer JSON for Express compatibility when there are no attachments
      if (!hasAttachments) {
        const response = await apiRequest('POST', `/api/tickets/${data.ticketId}/messages`, {
          content: data.content,
          isAdmin: true,
        });
        const json = await response.json();
        if (json && json.success === false) {
          throw new Error(json.message || 'Failed to send message');
        }
        return json;
      }

      // Fall back to multipart only when attachments are present (Cloudflare-compatible)
      const formData = new FormData();
      formData.append('content', data.content);
      formData.append('isAdmin', 'true');
      data.attachments?.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });
      const response = await apiRequest('POST', `/api/tickets/${data.ticketId}/messages`, formData);
      const json = await response.json();
      if (json && json.success === false) {
        throw new Error(json.message || 'Failed to send message');
      }
      return json;
    },
    onSuccess: () => {
      setNewMessage('');
      setAttachments([]);
      queryClient.invalidateQueries({ queryKey: [`/api/tickets/${selectedTicket?.id}/messages`] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tickets'] });
      toast({ title: "Message sent successfully" });
    },
    onError: (error: any) => {
      const msg = typeof error?.message === 'string' ? error.message : '';
      if (msg.startsWith('404:')) {
        toast({ title: "Conversation unavailable", description: "This ticket no longer exists on the server. Reloading your tickets.", variant: "destructive" });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/tickets'] });
        if (selectedTicket?.id) {
          queryClient.invalidateQueries({ queryKey: [`/api/tickets/${selectedTicket.id}/messages`] });
        }
        return;
      }
      toast({ title: "Failed to send message", description: msg || undefined, variant: "destructive" });
    }
  });

  // Update ticket status mutation
  const updateTicketMutation = useMutation({
    mutationFn: async (data: { ticketId: number; status: string }) => {
      const response = await apiRequest('PUT', `/api/tickets/${data.ticketId}/status`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tickets'] });
      toast({ title: "Ticket status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update ticket", variant: "destructive" });
    }
  });

  // Delete ticket mutation
  const deleteTicketMutation = useMutation({
    mutationFn: async (ticketId: number) => {
      const response = await apiRequest('DELETE', `/api/tickets/${ticketId}`);
      return response.json();
    },
    onSuccess: () => {
      setSelectedTicket(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tickets'] });
      toast({ title: "Ticket deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete ticket", variant: "destructive" });
    }
  });

  const handleSendMessage = () => {
    if (!selectedTicket || (!newMessage.trim() && attachments.length === 0)) return;
    
    sendMessageMutation.mutate({
      ticketId: selectedTicket.id,
      content: newMessage,
      attachments: attachments.length > 0 ? attachments : undefined
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ['image/', 'application/pdf', 'text/', 'application/msword', 'application/vnd.openxmlformats'];
      
      if (file.size > maxSize) {
        toast({ title: `File ${file.name} is too large (max 10MB)`, variant: "destructive" });
        return false;
      }
      
      const isValidType = allowedTypes.some(type => file.type.startsWith(type));
      if (!isValidType) {
        toast({ title: `File ${file.name} is not supported`, variant: "destructive" });
        return false;
      }
      
      return true;
    });
    
    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return <Image className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
      {/* Tickets List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Support Tickets ({tickets?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-y-auto">
            {ticketsLoading ? (
              <div className="p-4 text-center text-slate-500">Loading tickets...</div>
            ) : tickets?.length === 0 ? (
              <div className="p-4 text-center text-slate-500">No tickets found</div>
            ) : (
              tickets?.map((ticket: Ticket) => (
                <div
                  key={ticket.id}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedTicket?.id === ticket.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm truncate">{ticket.title}</h3>
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(ticket.priority)}`} />
                  </div>
                  <p className="text-xs text-slate-600 mb-2 line-clamp-2">{ticket.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge className={`text-xs ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {ticket.userName || ticket.userEmail || `User ${ticket.userId}`}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ticket Details & Chat */}
      <Card className="lg:col-span-2">
        {selectedTicket ? (
          <>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{selectedTicket.title}</CardTitle>
                  <p className="text-sm text-slate-600">
                    From: {selectedTicket.userName || selectedTicket.userEmail || `User ${selectedTicket.userId}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedTicket.status}
                    onValueChange={(value) => updateTicketMutation.mutate({
                      ticketId: selectedTicket.id,
                      status: value
                    })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge className={`${getPriorityColor(selectedTicket.priority)} text-white`}>
                    {selectedTicket.priority} priority
                  </Badge>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
                        deleteTicketMutation.mutate(selectedTicket.id);
                      }
                    }}
                    disabled={deleteTicketMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex flex-col h-[400px]">
              {/* Original ticket description */}
              <div className="bg-slate-50 p-3 rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" />
                  <span className="font-semibold text-sm">Original Request</span>
                  <span className="text-xs text-slate-500">
                    {new Date(selectedTicket.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm">{selectedTicket.description}</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                {messagesLoading ? (
                  <div className="text-center text-slate-500">Loading messages...</div>
                ) : messages?.length === 0 ? (
                  <div className="text-center text-slate-500 py-8">
                    No messages yet. Send the first response!
                  </div>
                ) : (
                  messages?.map((message: TicketMessage) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                          message.isAdmin
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {message.isAdmin ? (
                            <Shield className="h-3 w-3" />
                          ) : (
                            <User className="h-3 w-3" />
                          )}
                          <span className="text-xs font-medium">
                            {message.authorName} {message.isAdmin && '(Admin)'}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                        
                        {/* Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.attachments.map((attachment) => (
                              <div key={attachment.id} className="flex items-center gap-2 text-xs opacity-90">
                                {getFileIcon(attachment.fileName)}
                                <a 
                                  href={attachment.fileUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="hover:underline"
                                >
                                  {attachment.fileName}
                                </a>
                                <span>({formatFileSize(attachment.fileSize)})</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <p className="text-xs opacity-75 mt-1">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Reply input */}
              <div className="border-t pt-4">
                {/* Attachments preview */}
                {attachments.length > 0 && (
                  <div className="mb-3 space-y-2">
                    <Label className="text-sm font-medium" htmlFor="attachment-input">Attachments ({attachments.length})</Label>
                    <div className="space-y-1">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded border">
                          <div className="flex items-center gap-2 text-sm">
                            {getFileIcon(file.name)}
                            <span>{file.name}</span>
                            <span className="text-slate-500">({formatFileSize(file.size)})</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Textarea
                      placeholder="Type your response..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="min-h-[80px]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx,.txt"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="attachment-input"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('attachment-input')?.click()}
                      title="Attach files"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={handleSendMessage}
                      disabled={(!newMessage.trim() && attachments.length === 0) || sendMessageMutation.isPending}
                      className="self-end"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Press Enter to send, Shift+Enter for new line. Supports images, PDFs, and documents up to 10MB.
                </p>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center text-slate-500">
              <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a ticket to view details and respond</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// Authentication Settings Tab Component
function AuthenticationSettingsTab() {
  const [authSettings, setAuthSettings] = useState({
    googleEnabled: false,
    googleClientId: '',
    googleClientSecret: '',
    googleRedirectUri: '',
    facebookEnabled: false,
    facebookAppId: '',
    facebookAppSecret: '',
    githubEnabled: false,
    githubClientId: '',
    githubClientSecret: '',
    recaptchaEnabled: false,
    recaptchaSiteKey: '',
    recaptchaSecretKey: '',
    recaptchaMode: 'v2',
    recaptchaCustomerEnabled: false,
    recaptchaAdminEnabled: true
  });
  const [showKeys, setShowKeys] = useState({
    googleSecret: false,
    facebookSecret: false,
    githubSecret: false,
    recaptchaSecret: false
  });
  const { toast } = useToast();

  // Fetch current auth settings (admin endpoint with all data)
  const authSettingsQuery = useQuery({
    queryKey: ['/api/admin/auth-settings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/auth-settings');
      if (!response.ok) {
        throw new Error('Failed to fetch auth settings');
      }
      const data = await response.json();
      setAuthSettings(prev => ({ ...prev, ...data }));
      return data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false
  });

  const queryClient = useQueryClient();

  const saveAuthSettings = useMutation({
    mutationFn: async (settings: any) => {
      const response = await apiRequest('PUT', '/api/admin/auth-settings', settings);
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to save auth settings: ${errorData}`);
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Update local state with saved data
      setAuthSettings(prev => ({ ...prev, ...data }));
      // Invalidate and refetch auth settings
      queryClient.invalidateQueries({ queryKey: ['/api/admin/auth-settings'] });
      toast({ title: "Success", description: "Authentication settings saved successfully" });
    },
    onError: (error: any) => {
      console.error('Save auth settings error:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const uploadGoogleCredentials = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('credentials', file);
      
      const response = await fetch('/api/admin/upload-google-credentials', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload credentials');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Update local state with uploaded credentials info
      console.log('Upload successful:', data);
      
      // Refresh auth settings to show uploaded credentials
      queryClient.invalidateQueries({ queryKey: ['/api/admin/auth-settings'] });
      
      // Force refetch immediately
      authSettingsQuery.refetch();
      
      toast({ 
        title: "Success", 
        description: `Google credentials uploaded successfully! Client ID: ${data.googleClientId}`
      });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleGoogleCredentialsUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.json')) {
      toast({ 
        title: "Error", 
        description: "Please upload a valid JSON file", 
        variant: "destructive" 
      });
      return;
    }
    
    uploadGoogleCredentials.mutate(file, {
      onSuccess: () => {
        // Clear the file input after successful upload
        event.target.value = '';
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Social Login Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Social Login Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google OAuth */}
          <div className="border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-500 text-white rounded-lg flex items-center justify-center">
                  <Chrome className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Google OAuth</h3>
                  <p className="text-sm text-slate-600">Customer login with Google accounts</p>
                </div>
              </div>
              <Switch 
                checked={authSettings.googleEnabled}
                onCheckedChange={(checked) => 
                  setAuthSettings(prev => ({ ...prev, googleEnabled: checked }))
                }
              />
            </div>
            
            {authSettings.googleEnabled && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Client ID</Label>
                    <Input
                      value={authSettings.googleClientId}
                      onChange={(e) => setAuthSettings(prev => ({ ...prev, googleClientId: e.target.value }))}
                      placeholder="Google OAuth Client ID"
                    />
                  </div>
                  <div>
                    <Label>Client Secret</Label>
                    <div className="flex">
                      <Input
                        type={showKeys.googleSecret ? 'text' : 'password'}
                        value={authSettings.googleClientSecret}
                        onChange={(e) => setAuthSettings(prev => ({ ...prev, googleClientSecret: e.target.value }))}
                        placeholder="Google OAuth Client Secret"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="ml-2"
                        onClick={() => setShowKeys(prev => ({ ...prev, googleSecret: !prev.googleSecret }))}
                      >
                        {showKeys.googleSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium" htmlFor="google-credentials-input">Upload Google Credentials JSON</Label>
                  <div className="mt-2">
                    <input
                      id="google-credentials-input"
                      type="file"
                      accept=".json"
                      onChange={handleGoogleCredentialsUpload}
                      disabled={uploadGoogleCredentials.isPending}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                      title="Upload your Google OAuth credentials JSON file"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Upload your Google OAuth credentials JSON file to auto-fill the above fields
                    </p>
                    {uploadGoogleCredentials.isPending && (
                      <p className="text-sm text-blue-600 mt-1">Uploading and configuring...</p>
                    )}
                  </div>
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-amber-800">
                        <p className="font-medium mb-1">Security Best Practice</p>
                        <p className="mb-2">For production deployments, use environment variables instead of uploading credential files:</p>
                        <ul className="list-disc ml-4 space-y-1">
                          <li>Set <code className="bg-amber-100 px-1 rounded">GOOGLE_CLIENT_ID</code> environment variable</li>
                          <li>Set <code className="bg-amber-100 px-1 rounded">GOOGLE_CLIENT_SECRET</code> environment variable</li>
                          <li>The system will automatically use these as secure fallbacks</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label>Redirect URI</Label>
                  <Input
                    value="/api/auth/google/callback"
                    readOnly
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Add this URL to your Google OAuth console's authorized redirect URIs
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Facebook OAuth */}
          <div className="border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                  <Facebook className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Facebook Login</h3>
                  <p className="text-sm text-slate-600">Customer login with Facebook accounts</p>
                </div>
              </div>
              <Switch 
                checked={authSettings.facebookEnabled}
                onCheckedChange={(checked) => 
                  setAuthSettings(prev => ({ ...prev, facebookEnabled: checked }))
                }
              />
            </div>
            
            {authSettings.facebookEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label>App ID</Label>
                  <Input
                    value={authSettings.facebookAppId}
                    onChange={(e) => setAuthSettings(prev => ({ ...prev, facebookAppId: e.target.value }))}
                    placeholder="Facebook App ID"
                  />
                </div>
                <div>
                  <Label>App Secret</Label>
                  <div className="flex">
                    <Input
                      type={showKeys.facebookSecret ? 'text' : 'password'}
                      value={authSettings.facebookAppSecret}
                      onChange={(e) => setAuthSettings(prev => ({ ...prev, facebookAppSecret: e.target.value }))}
                      placeholder="Facebook App Secret"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      onClick={() => setShowKeys(prev => ({ ...prev, facebookSecret: !prev.facebookSecret }))}
                    >
                      {showKeys.facebookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* GitHub OAuth */}
          <div className="border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-900 text-white rounded-lg flex items-center justify-center">
                  <Github className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">GitHub OAuth</h3>
                  <p className="text-sm text-slate-600">Customer login with GitHub accounts</p>
                </div>
              </div>
              <Switch 
                checked={authSettings.githubEnabled}
                onCheckedChange={(checked) => 
                  setAuthSettings(prev => ({ ...prev, githubEnabled: checked }))
                }
              />
            </div>
            
            {authSettings.githubEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label>Client ID</Label>
                  <Input
                    value={authSettings.githubClientId}
                    onChange={(e) => setAuthSettings(prev => ({ ...prev, githubClientId: e.target.value }))}
                    placeholder="GitHub OAuth Client ID"
                  />
                </div>
                <div>
                  <Label>Client Secret</Label>
                  <div className="flex">
                    <Input
                      type={showKeys.githubSecret ? 'text' : 'password'}
                      value={authSettings.githubClientSecret}
                      onChange={(e) => setAuthSettings(prev => ({ ...prev, githubClientSecret: e.target.value }))}
                      placeholder="GitHub OAuth Client Secret"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      onClick={() => setShowKeys(prev => ({ ...prev, githubSecret: !prev.githubSecret }))}
                    >
                      {showKeys.githubSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* reCAPTCHA Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            reCAPTCHA Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Enable reCAPTCHA</h3>
              <p className="text-sm text-slate-600">Protect login forms from spam and bots</p>
            </div>
            <Switch 
              checked={authSettings.recaptchaEnabled}
              onCheckedChange={(checked) => 
                setAuthSettings(prev => ({ ...prev, recaptchaEnabled: checked }))
              }
            />
          </div>

          {authSettings.recaptchaEnabled && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Site Key</Label>
                  <Input
                    value={authSettings.recaptchaSiteKey}
                    onChange={(e) => setAuthSettings(prev => ({ ...prev, recaptchaSiteKey: e.target.value }))}
                    placeholder="reCAPTCHA Site Key"
                  />
                </div>
                <div>
                  <Label>Secret Key</Label>
                  <div className="flex">
                    <Input
                      type={showKeys.recaptchaSecret ? 'text' : 'password'}
                      value={authSettings.recaptchaSecretKey}
                      onChange={(e) => setAuthSettings(prev => ({ ...prev, recaptchaSecretKey: e.target.value }))}
                      placeholder="reCAPTCHA Secret Key"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      onClick={() => setShowKeys(prev => ({ ...prev, recaptchaSecret: !prev.recaptchaSecret }))}
                    >
                      {showKeys.recaptchaSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label>reCAPTCHA Version</Label>
                <Select
                  value={authSettings.recaptchaMode}
                  onValueChange={(value) => setAuthSettings(prev => ({ ...prev, recaptchaMode: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="v2">reCAPTCHA v2 (Checkbox)</SelectItem>
                    <SelectItem value="v3">reCAPTCHA v3 (Score-based)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Customer Login reCAPTCHA</Label>
                    <p className="text-sm text-slate-600">Enable reCAPTCHA for customer login forms</p>
                  </div>
                  <Switch 
                    checked={authSettings.recaptchaCustomerEnabled}
                    onCheckedChange={(checked) => 
                      setAuthSettings(prev => ({ ...prev, recaptchaCustomerEnabled: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Admin Login reCAPTCHA</Label>
                    <p className="text-sm text-slate-600">Enable reCAPTCHA for admin login forms</p>
                  </div>
                  <Switch 
                    checked={authSettings.recaptchaAdminEnabled}
                    onCheckedChange={(checked) => 
                      setAuthSettings(prev => ({ ...prev, recaptchaAdminEnabled: checked }))
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={() => saveAuthSettings.mutate(authSettings)}
          disabled={saveAuthSettings.isPending}
          size="lg"
        >
          <Save className="h-4 w-4 mr-2" />
          {saveAuthSettings.isPending ? 'Saving...' : 'Save Authentication Settings'}
        </Button>
      </div>
    </div>
  );
}

// Payment Settings Tab Component
function PaymentSettingsTab() {
  const [paymentSettings, setPaymentSettings] = useState({
    stripeEnabled: false,
    paypalEnabled: false,
    stripePublicKey: '',
    stripeSecretKey: '',
    paypalClientId: '',
    paypalClientSecret: '',
    defaultPaymentMethod: 'stripe'
  });
  const [showKeys, setShowKeys] = useState({
    stripeSecret: false,
    paypalSecret: false
  });
  const { toast } = useToast();

  // Load existing payment settings
  const { data: existingSettings, isLoading } = useQuery({
    queryKey: ['/api/admin/payment-settings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/payment-settings');
      if (!response.ok) throw new Error('Failed to load payment settings');
      return response.json();
    }
  });

  // Update state when settings are loaded
  useEffect(() => {
    if (existingSettings) {
      setPaymentSettings(existingSettings);
    }
  }, [existingSettings]);

  const savePaymentSettings = useMutation({
    mutationFn: async (settings: any) => {
      const response = await apiRequest('PUT', '/api/admin/payment-settings', settings);
      if (!response.ok) throw new Error('Failed to save payment settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-settings'] });
      toast({ title: "Success", description: "Payment settings saved successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stripe Configuration */}
          <div className="border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-lg flex items-center justify-center">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Stripe</h3>
                  <p className="text-sm text-slate-600">Credit card processing</p>
                </div>
              </div>
              <Switch 
                checked={paymentSettings.stripeEnabled}
                onCheckedChange={(checked) => 
                  setPaymentSettings(prev => ({ ...prev, stripeEnabled: checked }))
                }
              />
            </div>
            
            {paymentSettings.stripeEnabled && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="stripePublicKey">Stripe Public Key</Label>
                  <Input
                    id="stripePublicKey"
                    value={paymentSettings.stripePublicKey}
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, stripePublicKey: e.target.value }))}
                    placeholder="pk_..."
                  />
                </div>
                <div>
                  <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
                  <div className="relative">
                    <Input
                      id="stripeSecretKey"
                      type={showKeys.stripeSecret ? "text" : "password"}
                      value={paymentSettings.stripeSecretKey}
                      onChange={(e) => setPaymentSettings(prev => ({ ...prev, stripeSecretKey: e.target.value }))}
                      placeholder="sk_..."
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowKeys(prev => ({ ...prev, stripeSecret: !prev.stripeSecret }))}
                    >
                      {showKeys.stripeSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PayPal Configuration */}
          <div className="border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">PayPal</h3>
                  <p className="text-sm text-slate-600">Alternative payment method</p>
                </div>
              </div>
              <Switch 
                checked={paymentSettings.paypalEnabled}
                onCheckedChange={(checked) => 
                  setPaymentSettings(prev => ({ ...prev, paypalEnabled: checked }))
                }
              />
            </div>
            
            {paymentSettings.paypalEnabled && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="paypalClientId">PayPal Client ID</Label>
                  <Input
                    id="paypalClientId"
                    value={paymentSettings.paypalClientId}
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, paypalClientId: e.target.value }))}
                    placeholder="Your PayPal Client ID"
                  />
                </div>
                <div>
                  <Label htmlFor="paypalClientSecret">PayPal Client Secret</Label>
                  <div className="relative">
                    <Input
                      id="paypalClientSecret"
                      type={showKeys.paypalSecret ? "text" : "password"}
                      value={paymentSettings.paypalClientSecret}
                      onChange={(e) => setPaymentSettings(prev => ({ ...prev, paypalClientSecret: e.target.value }))}
                      placeholder="Your PayPal Client Secret"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowKeys(prev => ({ ...prev, paypalSecret: !prev.paypalSecret }))}
                    >
                      {showKeys.paypalSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Default Payment Method */}
          <div>
            <Label htmlFor="defaultPayment">Default Payment Method</Label>
            <Select 
              value={paymentSettings.defaultPaymentMethod}
              onValueChange={(value) => setPaymentSettings(prev => ({ ...prev, defaultPaymentMethod: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select default payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={() => savePaymentSettings.mutate(paymentSettings)}
            disabled={savePaymentSettings.isPending}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {savePaymentSettings.isPending ? 'Saving...' : 'Save Payment Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Chat Assistant Tab Component
// Account Settings Tab Component
function AccountSettingsTab() {
  const [accountSettings, setAccountSettings] = useState({
    currentEmail: 'info@logoland.se',
    newEmail: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const { toast } = useToast();

  const updateCredentials = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/admin/update-credentials', data);
      if (!response.ok) throw new Error('Failed to update credentials');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Admin credentials updated successfully. Please log in again." });
      // Clear form
      setAccountSettings(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        newEmail: ''
      }));
      // Logout after updating credentials
      setTimeout(() => {
        localStorage.removeItem('admin_authenticated');
        localStorage.removeItem('admin_user');
        window.location.href = '/login';
      }, 2000);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleSubmit = () => {
    // Validation
    if (!accountSettings.currentPassword) {
      toast({ title: "Error", description: "Current password is required", variant: "destructive" });
      return;
    }

    if (accountSettings.newPassword && accountSettings.newPassword !== accountSettings.confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match", variant: "destructive" });
      return;
    }

    if (accountSettings.newPassword && accountSettings.newPassword.length < 6) {
      toast({ title: "Error", description: "New password must be at least 6 characters long", variant: "destructive" });
      return;
    }

    const updateData: any = {
      currentEmail: accountSettings.currentEmail,
      currentPassword: accountSettings.currentPassword
    };

    if (accountSettings.newEmail && accountSettings.newEmail !== accountSettings.currentEmail) {
      updateData.newEmail = accountSettings.newEmail;
    }

    if (accountSettings.newPassword) {
      updateData.newPassword = accountSettings.newPassword;
    }

    updateCredentials.mutate(updateData);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Email Display */}
          <div>
            <Label>Current Email</Label>
            <Input
              value={accountSettings.currentEmail}
              disabled
              className="bg-gray-50"
            />
          </div>

          {/* New Email */}
          <div>
            <Label htmlFor="new-email">New Email (optional)</Label>
            <Input
              id="new-email"
              type="email"
              value={accountSettings.newEmail}
              onChange={(e) => setAccountSettings(prev => ({ ...prev, newEmail: e.target.value }))}
              placeholder="Leave empty to keep current email"
            />
          </div>

          {/* Current Password */}
          <div>
            <Label htmlFor="current-password">Current Password *</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showPasswords ? "text" : "password"}
                value={accountSettings.currentPassword}
                onChange={(e) => setAccountSettings(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Enter your current password"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPasswords(!showPasswords)}
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <Label htmlFor="new-password">New Password (optional)</Label>
            <Input
              id="new-password"
              type={showPasswords ? "text" : "password"}
              value={accountSettings.newPassword}
              onChange={(e) => setAccountSettings(prev => ({ ...prev, newPassword: e.target.value }))}
              placeholder="Leave empty to keep current password"
            />
          </div>

          {/* Confirm New Password */}
          {accountSettings.newPassword && (
            <div>
              <Label htmlFor="confirm-password">Confirm New Password *</Label>
              <Input
                id="confirm-password"
                type={showPasswords ? "text" : "password"}
                value={accountSettings.confirmPassword}
                onChange={(e) => setAccountSettings(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm your new password"
                required
              />
            </div>
          )}

          {/* Security Notice */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Security Notice</p>
                <p className="text-yellow-700 mt-1">
                  After updating your credentials, you will be automatically logged out and need to sign in again with your new details.
                </p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSubmit}
            disabled={updateCredentials.isPending || !accountSettings.currentPassword}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {updateCredentials.isPending ? 'Updating...' : 'Update Account Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ChatAssistantTab() {
  const [chatSettings, setChatSettings] = useState({
    enabled: true,
    openaiApiKey: '',
    assistantId: '',
    welcomeMessage: 'Hello! I\'m here to help you with any questions about the OCUS Job Hunter Chrome Extension. How can I assist you today?',
    systemPrompt: 'You are a helpful customer support assistant for the OCUS Job Hunter Chrome Extension. Provide accurate information about installation, features, and troubleshooting.',
    maxTokens: 150,
    temperature: 0.7
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current chat settings from server
  const { data: serverSettings } = useQuery({
    queryKey: ['/api/admin/chat-settings'],
    queryFn: async () => {
      const response = await fetch('/api/admin/chat-settings');
      if (!response.ok) throw new Error('Failed to fetch chat settings');
      return response.json();
    }
  });

  // Update local state when server data is loaded
  useEffect(() => {
    if (serverSettings) {
      setChatSettings(prev => ({
        ...prev,
        openaiApiKey: serverSettings.openaiApiKey || '',
        assistantId: serverSettings.assistantId || '',
        systemPrompt: serverSettings.systemPrompt || prev.systemPrompt
      }));
    }
  }, [serverSettings]);

  const saveChatSettings = useMutation({
    mutationFn: async (settings: any) => {
      const response = await apiRequest('PUT', '/api/admin/chat-settings', {
        openaiApiKey: settings.openaiApiKey,
        assistantId: settings.assistantId,
        chatModel: 'gpt-4o',
        systemPrompt: settings.systemPrompt
      });
      if (!response.ok) throw new Error('Failed to save chat settings');
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch the settings to ensure UI shows latest data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chat-settings'] });
      toast({ title: "Success", description: "Chat assistant settings saved successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const testChatBot = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/chat', {
        message: 'Hello, this is a test message',
        history: []
      });
      if (!response.ok) throw new Error('Chat bot test failed');
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: "Success", description: `Chat bot test successful: ${data.response}` });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Live Chat Assistant Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Chat */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Enable Live Chat</h3>
              <p className="text-sm text-slate-600">Allow customers to chat with AI assistant</p>
            </div>
            <Switch 
              checked={chatSettings.enabled}
              onCheckedChange={(checked) => 
                setChatSettings(prev => ({ ...prev, enabled: checked }))
              }
            />
          </div>

          {chatSettings.enabled && (
            <>
              {/* OpenAI Configuration */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="openaiApiKey">OpenAI API Key</Label>
                  <div className="relative">
                    <Input
                      id="openaiApiKey"
                      type={showApiKey ? "text" : "password"}
                      value={chatSettings.openaiApiKey}
                      onChange={(e) => setChatSettings(prev => ({ ...prev, openaiApiKey: e.target.value }))}
                      placeholder="sk-..."
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="assistantId">OpenAI Assistant ID (Optional)</Label>
                  <Input
                    id="assistantId"
                    value={chatSettings.assistantId}
                    onChange={(e) => setChatSettings(prev => ({ ...prev, assistantId: e.target.value }))}
                    placeholder="asst_..."
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Leave empty to use the default chat completion
                  </p>
                </div>

                <div>
                  <Label htmlFor="welcomeMessage">Welcome Message</Label>
                  <Textarea
                    id="welcomeMessage"
                    value={chatSettings.welcomeMessage}
                    onChange={(e) => setChatSettings(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="systemPrompt">System Prompt</Label>
                  <Textarea
                    id="systemPrompt"
                    value={chatSettings.systemPrompt}
                    onChange={(e) => setChatSettings(prev => ({ ...prev, systemPrompt: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxTokens">Max Tokens</Label>
                    <Input
                      id="maxTokens"
                      type="number"
                      min="50"
                      max="500"
                      value={chatSettings.maxTokens}
                      onChange={(e) => setChatSettings(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="temperature">Temperature</Label>
                    <Input
                      id="temperature"
                      type="number"
                      min="0"
                      max="2"
                      step="0.1"
                      value={chatSettings.temperature}
                      onChange={(e) => setChatSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    />
                  </div>
                </div>
              </div>

              {/* Test Chat Bot */}
              <div className="border-t pt-4">
                <Button 
                  variant="outline"
                  onClick={() => testChatBot.mutate()}
                  disabled={testChatBot.isPending || !chatSettings.openaiApiKey}
                  className="mr-4"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {testChatBot.isPending ? 'Testing...' : 'Test Chat Bot'}
                </Button>
              </div>
            </>
          )}

          <Button 
            onClick={() => saveChatSettings.mutate(chatSettings)}
            disabled={saveChatSettings.isPending}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {saveChatSettings.isPending ? 'Saving...' : 'Save Chat Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Dashboard Features Tab Component
function DashboardFeaturesTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: features, isLoading, error } = useQuery({
    queryKey: ['/api/admin/dashboard-features'],
    queryFn: async () => {
      const response = await fetch('/api/admin/dashboard-features');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Raw API response:', data);
      return data;
    }
  });

  const updateFeatureMutation = useMutation({
    mutationFn: async ({ featureName, isEnabled, description }: { featureName: string; isEnabled: boolean; description?: string }) => {
      const response = await apiRequest('PUT', `/api/admin/dashboard-features/${featureName}`, { isEnabled, description });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard-features'] });
      toast({
        title: "Success",
        description: "Dashboard feature updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to update dashboard feature: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleFeatureToggle = (featureName: string, isEnabled: boolean) => {
    console.log('Toggling feature:', featureName, 'to', isEnabled);
    updateFeatureMutation.mutate({ featureName, isEnabled });
  };

  // Debug log
  console.log('Dashboard features data:', features);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ToggleLeft className="h-5 w-5" />
            Dashboard Features Control
          </CardTitle>
          <p className="text-sm text-gray-600">
            Control which sections are visible to users in their dashboard
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Array.isArray(features) && features.map((feature: any) => (
              <div key={feature.featureName} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <h3 className="font-medium text-lg capitalize">
                      {feature.featureName.replace('_', ' ')}
                    </h3>
                    <Badge variant={feature.isEnabled ? "default" : "secondary"}>
                      {feature.isEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 ml-6">
                    {feature.description || `Controls visibility of ${feature.featureName.replace('_', ' ')} section`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={feature.isEnabled}
                    onCheckedChange={(checked) => handleFeatureToggle(feature.featureName, checked)}
                    disabled={updateFeatureMutation.isPending}
                  />
                  {feature.isEnabled ? (
                    <ToggleRight className="h-5 w-5 text-green-500" />
                  ) : (
                    <ToggleLeft className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
            ))}
            
            {(!features || !Array.isArray(features) || features.length === 0) && (
              <div className="text-center py-8">
                <p className="text-gray-500">No dashboard features configured yet.</p>
              </div>
            )}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">How it works</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Affiliate Program:</strong> Controls visibility of referral system and commission tracking</li>
              <li>• <strong>Analytics:</strong> Controls visibility of usage statistics and performance metrics</li>
              <li>• <strong>Billing:</strong> Controls visibility of payment history and subscription management</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// SEO Settings Management Component
function SeoSettingsTab() {
  const { toast } = useToast();
  const [seoSettings, setSeoSettings] = useState({
    siteTitle: "OCUS Job Hunter - Premium Chrome Extension",
    siteDescription: "Boost your photography career with OCUS Job Hunter Chrome Extension. Automated mission detection, smart acceptance, and unlimited job opportunities for OCUS photographers.",
    siteKeywords: "OCUS extension, photography jobs, Chrome extension, job hunter, photographer tools, mission automation",
    siteAuthor: "OCUS Job Hunter",
    ogTitle: "",
    ogDescription: "",
    ogImage: "/og-image.svg",
    ogImageAlt: "OCUS Job Hunter Chrome Extension",
    ogSiteName: "OCUS Job Hunter",
    ogType: "website",
    ogUrl: "https://jobhunter.one/",
    twitterCard: "summary_large_image",
    twitterTitle: "",
    twitterDescription: "",
    twitterImage: "/og-image.svg",
    twitterSite: "",
    twitterCreator: "",
    metaRobots: "index, follow",
    canonicalUrl: "",
    themeColor: "#2563eb",
    customLogo: "",
    customFavicon: "",
    customOgImage: ""
  });
  const [selectedCoverImage, setSelectedCoverImage] = useState<File | null>(null);
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [selectedFavicon, setSelectedFavicon] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch SEO settings
  const { data: fetchedSettings, isLoading } = useQuery({
    queryKey: ['/api/admin/seo-settings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/seo-settings');
      return await response.json();
    }
  });

  // Update local state when settings are fetched
  useEffect(() => {
    if (fetchedSettings) {
      setSeoSettings(prev => ({ ...prev, ...fetchedSettings }));
    }
  }, [fetchedSettings]);

  const handleImageChange = (type: 'cover' | 'logo' | 'favicon', e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSize = type === 'favicon' ? 1 * 1024 * 1024 : 5 * 1024 * 1024; // 1MB for favicon, 5MB for others
      
      if (file.size > maxSize) {
        toast({ 
          title: `Image too large. Please use an image under ${maxSize === 1048576 ? '1MB' : '5MB'}.`, 
          variant: "destructive" 
        });
        return;
      }

      // Validate image types
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast({ title: "Please select a valid image file (JPG, PNG, GIF, or WebP).", variant: "destructive" });
        return;
      }

      switch (type) {
        case 'cover':
          setSelectedCoverImage(file);
          break;
        case 'logo':
          setSelectedLogo(file);
          break;
        case 'favicon':
          setSelectedFavicon(file);
          break;
      }
    }
  };

  const handleSeoSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const hasFiles = selectedCoverImage || selectedLogo || selectedFavicon;
      
      console.log('SEO Settings Submit - Files detected:', {
        coverImage: !!selectedCoverImage,
        logo: !!selectedLogo, 
        favicon: !!selectedFavicon,
        hasFiles
      });

      let response;
      
      if (hasFiles) {
        // Use FormData for file uploads
        const formData = new FormData();
        Object.entries(seoSettings).forEach(([key, value]) => {
          formData.append(key, value || '');
        });
        
        if (selectedCoverImage) formData.append('customOgImage', selectedCoverImage);
        if (selectedLogo) formData.append('customLogo', selectedLogo);
        if (selectedFavicon) formData.append('customFavicon', selectedFavicon);

        console.log('Using FormData for file upload');
        response = await apiRequest('PUT', '/api/admin/seo-settings', formData);
      } else {
        // Use JSON for text-only updates
        // Build a sanitized object without empty values to satisfy TypeScript without string indexing
        const updateData = Object.fromEntries(
          Object.entries(seoSettings).filter(([_, v]) => v !== undefined && v !== '')
        );

        console.log('Using JSON for text-only update:', updateData);
        response = await apiRequest('PATCH', '/api/admin/seo-settings', updateData);
      }

      if (response.ok) {
        const updatedSettings = await response.json();
        console.log('Server response:', updatedSettings);
        
        // Update local state with server response
        setSeoSettings(prev => ({ ...prev, ...updatedSettings }));
        
        // Clear selected files only after successful server response
        setSelectedCoverImage(null);
        setSelectedLogo(null);
        setSelectedFavicon(null);
        
        toast({ title: "SEO settings updated successfully!" });
        
        // Force a fresh query to get updated data
        setTimeout(() => window.location.reload(), 500);
      } else {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Failed to update settings: ${response.status}`);
      }
    } catch (error) {
      toast({ title: "Failed to update SEO settings", variant: "destructive" });
      console.error('SEO settings error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading SEO settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">SEO & Social Media Settings</h2>
        <p className="text-slate-600">Configure how your website appears when shared on social media platforms and search engines.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Social Media Preview Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSeoSettingsSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="siteTitle">Site Title</Label>
                  <Input
                    id="siteTitle"
                    value={seoSettings.siteTitle}
                    onChange={(e) => setSeoSettings(prev => ({...prev, siteTitle: e.target.value}))}
                    placeholder="OCUS Job Hunter - Premium Chrome Extension"
                  />
                </div>

                <div>
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={seoSettings.siteDescription}
                    onChange={(e) => setSeoSettings(prev => ({...prev, siteDescription: e.target.value}))}
                    placeholder="Brief description of your website"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="siteKeywords">Keywords</Label>
                  <Input
                    id="siteKeywords"
                    value={seoSettings.siteKeywords}
                    onChange={(e) => setSeoSettings(prev => ({...prev, siteKeywords: e.target.value}))}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>

                <div>
                  <Label htmlFor="ogUrl">Website URL</Label>
                  <Input
                    id="ogUrl"
                    value={seoSettings.ogUrl}
                    onChange={(e) => setSeoSettings(prev => ({...prev, ogUrl: e.target.value}))}
                    placeholder="https://jobhunter.one/"
                  />
                </div>

                <div>
                  <Label htmlFor="themeColor">Theme Color</Label>
                  <Input
                    id="themeColor"
                    type="color"
                    value={seoSettings.themeColor}
                    onChange={(e) => setSeoSettings(prev => ({...prev, themeColor: e.target.value}))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="coverImage">Social Media Cover Picture</Label>
                  <div className="mt-2">
                    {seoSettings.customOgImage && !selectedCoverImage && (
                      <div className="mb-3">
                        <img
                          src="/api/seo/custom-image/og"
                          alt="Current cover"
                          className="w-full max-w-sm h-32 object-cover rounded border"
                        />
                        <p className="text-sm text-slate-500 mt-1">Current cover image</p>
                      </div>
                    )}
                    
                    {selectedCoverImage && (
                      <div className="mb-3">
                        <img
                          src={URL.createObjectURL(selectedCoverImage)}
                          alt="Preview"
                          className="w-full max-w-sm h-32 object-cover rounded border"
                        />
                        <p className="text-sm text-slate-500 mt-1">New cover image</p>
                      </div>
                    )}
                    
                    <Input
                      id="coverImage"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange('cover', e)}
                      className="cursor-pointer"
                    />
                    <p className="text-sm text-slate-500 mt-1">
                      Recommended: 1200x630px, max 5MB. This image appears when sharing your website on social media.
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="customLogo">Custom Logo</Label>
                  <div className="mt-2">
                    {seoSettings.customLogo && !selectedLogo && (
                      <div className="mb-3">
                        <img
                          src={seoSettings.customLogo}
                          alt="Current logo"
                          className="w-20 h-20 object-contain rounded border"
                        />
                        <p className="text-sm text-slate-500 mt-1">Current logo</p>
                      </div>
                    )}
                    
                    {selectedLogo && (
                      <div className="mb-3">
                        <img
                          src={URL.createObjectURL(selectedLogo)}
                          alt="Preview logo"
                          className="w-20 h-20 object-contain rounded border"
                        />
                        <p className="text-sm text-slate-500 mt-1">New logo</p>
                      </div>
                    )}
                    
                    <Input
                      id="customLogo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange('logo', e)}
                      className="cursor-pointer"
                    />
                    <p className="text-sm text-slate-500 mt-1">Max 5MB. Square images work best.</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="customFavicon">Custom Favicon</Label>
                  <div className="mt-2">
                    {seoSettings.customFavicon && !selectedFavicon && (
                      <div className="mb-3">
                        <img
                          src={seoSettings.customFavicon}
                          alt="Current favicon"
                          className="w-8 h-8 object-contain rounded border"
                        />
                        <p className="text-sm text-slate-500 mt-1">Current favicon</p>
                      </div>
                    )}
                    
                    {selectedFavicon && (
                      <div className="mb-3">
                        <img
                          src={URL.createObjectURL(selectedFavicon)}
                          alt="Preview favicon"
                          className="w-8 h-8 object-contain rounded border"
                        />
                        <p className="text-sm text-slate-500 mt-1">New favicon</p>
                      </div>
                    )}
                    
                    <Input
                      id="customFavicon"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange('favicon', e)}
                      className="cursor-pointer"
                    />
                    <p className="text-sm text-slate-500 mt-1">Max 1MB. 32x32px or 16x16px recommended.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isUploading}
                className="flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Update SEO Settings
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 max-w-md">
            <div className="relative">
              {/* Always show an image - either uploaded, custom, or default */}
              <img
                src={
                  selectedCoverImage 
                    ? URL.createObjectURL(selectedCoverImage) 
                    : seoSettings.customOgImage 
                      ? '/api/seo/custom-image/og' 
                      : '/og-image.svg'
                }
                alt="Social Media Preview"
                className="w-full h-32 object-cover rounded mb-3"
                onError={(e) => {
                  // Fallback to default SVG if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = '/og-image.svg';
                }}
              />
              {!seoSettings.customOgImage && !selectedCoverImage && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded mb-3 flex items-center justify-center">
                  <div className="text-white text-xs text-center px-2">
                    <p className="font-medium">Default Image</p>
                    <p>Upload custom image above</p>
                  </div>
                </div>
              )}
            </div>

            <h3 className="font-semibold text-lg mb-1">{seoSettings.siteTitle || seoSettings.ogSiteName}</h3>
            <p className="text-slate-600 text-sm mb-2 line-clamp-2">{seoSettings.siteDescription}</p>
            <p className="text-slate-400 text-xs">{seoSettings.ogUrl || seoSettings.canonicalUrl}</p>
          </div>
          <p className="text-sm text-slate-500 mt-3">
            This is how your website will appear when shared on Facebook, Twitter, LinkedIn, and other social platforms.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState('analytics');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [beforePrice, setBeforePrice] = useState('');

  // Check admin access
  const isAdminAuthenticated = localStorage.getItem('admin_authenticated') === 'true';
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Access Denied</h1>
            <p className="text-slate-600 mb-6">Please log in through the unified login page to access the admin dashboard.</p>
            <Button onClick={() => window.location.href = '/login'}>
              Go to Login
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

  // Fetch current product pricing
  const { data: currentProduct } = useQuery({
    queryKey: ['/api/products/pricing'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/products/pricing');
      return await response.json();
    }
  });

  // Effect to set pricing data when query succeeds
  useEffect(() => {
    if (currentProduct) {
      setNewPrice(currentProduct.price || '');
      setBeforePrice(currentProduct.beforePrice || '');
    }
  }, [currentProduct]);

  // Update dual price mutation
  const updateDualPriceMutation = useMutation({
    mutationFn: async (priceData: { price: number; beforePrice: number | null }) => {
      const response = await apiRequest('PUT', '/api/admin/pricing', priceData);
      if (!response.ok) throw new Error('Failed to update pricing');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Pricing updated successfully" });
      setNewPrice('');
      setBeforePrice('');
      // Invalidate all pricing-related queries to sync across the app
      queryClient.invalidateQueries({ queryKey: ['/api/products/pricing'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
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

  const handlePriceUpdate = () => {
    if (!newPrice || parseFloat(newPrice) <= 0) return;
    
    const priceData = {
      price: parseFloat(newPrice),
      beforePrice: beforePrice && parseFloat(beforePrice) > 0 ? parseFloat(beforePrice) : null
    };
    
    updateDualPriceMutation.mutate(priceData);
  };

  if (analyticsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Backdrop Overlay */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
      
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="lg:hidden p-2"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
              <div>
                <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-1 text-sm lg:text-base">Manage your OCUS Job Hunter platform</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => {
              localStorage.removeItem('admin_authenticated');
              localStorage.removeItem('admin_user');
              window.location.href = '/';
            }}>
              Logout
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          {/* Analytics Overview Cards - Show on Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
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
          )}

          {/* Tab Content based on activeTab */}
          {activeTab === 'customers' && <CustomerManagement />}
          
          {activeTab === 'extension' && <CustomerManager />}
          
          {activeTab === 'users' && <UserManagementTab />}
          
          {activeTab === 'affiliates' && <AdminAffiliates />}
          
          {activeTab === 'invoices' && <InvoiceManagement />}
          
          {activeTab === 'banners' && <CountdownBannerManagementTab />}
          
          {activeTab === 'badges' && <AnnouncementBadgeManagementTab />}
          
          {activeTab === 'dashboard-features' && <DashboardFeaturesTab />}
          
          {activeTab === 'seo' && <SeoSettingsTab />}
          
          {activeTab === 'tickets' && <TicketManagementTab />}
          
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
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

              {/* Pricing Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Pricing Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="beforePrice">Before Price (EUR) - Optional</Label>
                      <Input
                        id="beforePrice"
                        type="number"
                        step="0.01"
                        placeholder="1200.00"
                        value={beforePrice}
                        onChange={(e) => setBeforePrice(e.target.value)}
                        className="mt-2"
                      />
                      <p className="text-sm text-slate-500 mt-1">
                        Original price (will be shown with strikethrough)
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="currentPrice">Current Price (EUR) - Required</Label>
                      <Input
                        id="currentPrice"
                        type="number"
                        step="0.01"
                        placeholder="500.00"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        className="mt-2"
                      />
                      <p className="text-sm text-slate-500 mt-1">
                        Active selling price
                      </p>
                    </div>

                    <div className="border-t pt-4">
                      <Label className="text-sm font-medium mb-2 block">Price Preview</Label>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          {beforePrice && parseFloat(beforePrice) > 0 && (
                            <span className="text-sm text-slate-500 line-through">
                              €{parseFloat(beforePrice).toFixed(2)}
                            </span>
                          )}
                          <span className="text-xl font-bold text-slate-900">
                            €{newPrice ? parseFloat(newPrice).toFixed(2) : '500.00'}
                          </span>
                          {beforePrice && parseFloat(beforePrice) > 0 && newPrice && (
                            <span className="text-sm text-green-600 font-medium">
                              Save €{(parseFloat(beforePrice) - parseFloat(newPrice)).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={handlePriceUpdate}
                      disabled={!newPrice || parseFloat(newPrice) <= 0 || updateDualPriceMutation.isPending}
                      className="w-full"
                    >
                      {updateDualPriceMutation.isPending ? 'Updating Prices...' : 'Update Pricing'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}



          {/* Payment Settings Tab */}
          {activeTab === 'payments' && <PaymentSettingsTab />}

          {/* Authentication Settings Tab */}
          {activeTab === 'auth' && <AuthenticationSettingsTab />}

          {/* Chat Assistant Tab */}
          {activeTab === 'chatbot' && <ChatAssistantTab />}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-500">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>General settings configuration coming soon</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Settings Tab */}
          {activeTab === 'account' && <AccountSettingsTab />}
        </div>
      </div>
    </div>
  );
}

// User Management Component for trial/activation system
function UserManagementTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users with lifecycle data
  const usersQuery = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/users');
      return await response.json();
    },
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  // Note: Activation code system has been deprecated

  // Block user mutation
  const blockUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const response = await apiRequest('POST', `/api/admin/users/${userId}/block`, { reason });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User blocked successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to block user",
        variant: "destructive",
      });
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest('DELETE', `/api/admin/users/${userId}`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  });

  const users = usersQuery.data || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Lifecycle Management
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage extension users, trial usage, and activation codes
          </p>
        </CardHeader>
        <CardContent>
          {usersQuery.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">User ID</th>
                    <th className="text-left p-3 font-medium">Email</th>
                    <th className="text-left p-3 font-medium">Trial Status</th>
                    <th className="text-left p-3 font-medium">Activation Code</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Created</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: any) => (
                    <tr key={user.user_id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {user.user_id?.slice(0, 8)}...
                        </div>
                      </td>
                      <td className="p-3">
                        {user.email || user.order_email || 'Not provided'}
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          <div>Remaining: <span className="font-medium">{user.trial_uses_remaining || 0}</span></div>
                          <div>Used: <span className="text-gray-600">{user.trial_uses_total || 0}/3</span></div>
                        </div>
                      </td>
                      <td className="p-3">
                        {user.activation_code ? (
                          <div className="font-mono text-xs bg-blue-100 px-2 py-1 rounded max-w-[120px] truncate">
                            {user.activation_code}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">None</span>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge variant={user.is_activated ? "default" : "secondary"}>
                          {user.is_activated ? "Activated" : "Trial"}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          {/* Regenerate code button removed - activation system deprecated */}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => blockUserMutation.mutate({ 
                              userId: user.user_id, 
                              reason: "Blocked by admin" 
                            })}
                            disabled={blockUserMutation.isPending}
                          >
                            <Shield className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                                deleteUserMutation.mutate(user.user_id);
                              }
                            }}
                            disabled={deleteUserMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{users.length}</h3>
                <p className="text-gray-600">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">
                  {users.filter((u: any) => u.is_activated).length}
                </h3>
                <p className="text-gray-600">Activated Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">
                  {users.filter((u: any) => !u.is_activated && (u.trial_uses_remaining > 0)).length}
                </h3>
                <p className="text-gray-600">Active Trials</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Countdown Banner Management Component
function CountdownBannerManagementTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [newBanner, setNewBanner] = useState({
    titleEn: '',
    subtitleEn: '',
    targetPrice: '',
    originalPrice: '',
    endDateTime: '',
    backgroundColor: 'gradient-primary',
    textColor: 'white',
    priority: 1,
    targetLanguages: ['de', 'fr', 'es', 'it', 'pt', 'nl', 'da', 'no', 'fi', 'tr', 'pl', 'ru']
  });

  // Fetch banners
  const bannersQuery = useQuery({
    queryKey: ['/api/admin/countdown-banners'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/countdown-banners');
      if (!response.ok) throw new Error('Failed to fetch banners');
      return response.json();
    }
  });

  // Create banner mutation
  const createBannerMutation = useMutation({
    mutationFn: async (bannerData: any) => {
      const response = await apiRequest('POST', '/api/admin/countdown-banners', bannerData);
      if (!response.ok) throw new Error('Failed to create banner');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Countdown banner created successfully" });
      setNewBanner({
        titleEn: '',
        subtitleEn: '',
        targetPrice: '',
        originalPrice: '',
        endDateTime: '',
        backgroundColor: 'gradient-primary',
        textColor: 'white',
        priority: 1,
        targetLanguages: ['de', 'fr', 'es', 'it', 'pt', 'nl', 'da', 'no', 'fi', 'tr', 'pl', 'ru']
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/countdown-banners'] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Update banner mutation
  const updateBannerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const response = await apiRequest('PUT', `/api/admin/countdown-banners/${id}`, data);
      if (!response.ok) throw new Error('Failed to update banner');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Countdown banner updated successfully" });
      setEditingBanner(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/countdown-banners'] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Delete banner mutation
  const deleteBannerMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/admin/countdown-banners/${id}`);
      if (!response.ok) throw new Error('Failed to delete banner');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Countdown banner deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/countdown-banners'] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleCreateBanner = () => {
    if (!newBanner.titleEn || !newBanner.subtitleEn || !newBanner.targetPrice || !newBanner.endDateTime) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    
    const bannerData = {
      ...newBanner,
      isEnabled: true,
      targetLanguages: ['de', 'fr', 'es', 'it', 'pt', 'nl', 'da', 'no', 'fi', 'tr', 'pl', 'ru'] // Auto-translate to all supported languages
    };
    
    createBannerMutation.mutate(bannerData);
  };

  const handleUpdateBanner = () => {
    if (!editingBanner) return;
    updateBannerMutation.mutate({ id: editingBanner.id, data: editingBanner });
  };

  return (
    <div className="space-y-6">
      {/* Create New Banner Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Countdown Banner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="titleEn">Title (English) *</Label>
              <Input
                id="titleEn"
                value={newBanner.titleEn}
                onChange={(e) => setNewBanner(prev => ({ ...prev, titleEn: e.target.value }))}
                placeholder="🔥 Limited Time Offer! 🔥"
              />
            </div>
            <div>
              <Label htmlFor="subtitleEn">Subtitle (English) *</Label>
              <Input
                id="subtitleEn"
                value={newBanner.subtitleEn}
                onChange={(e) => setNewBanner(prev => ({ ...prev, subtitleEn: e.target.value }))}
                placeholder="Get 50% off now!"
              />
            </div>
            <div>
              <Label htmlFor="targetPrice">Target Price (€) *</Label>
              <Input
                id="targetPrice"
                type="number"
                value={newBanner.targetPrice}
                onChange={(e) => setNewBanner(prev => ({ ...prev, targetPrice: e.target.value }))}
                placeholder="250"
              />
            </div>
            <div>
              <Label htmlFor="originalPrice">Original Price (€)</Label>
              <Input
                id="originalPrice"
                type="number"
                value={newBanner.originalPrice}
                onChange={(e) => setNewBanner(prev => ({ ...prev, originalPrice: e.target.value }))}
                placeholder="500"
              />
            </div>
            <div>
              <Label htmlFor="endDateTime">End Date & Time *</Label>
              <Input
                id="endDateTime"
                type="datetime-local"
                value={newBanner.endDateTime}
                onChange={(e) => setNewBanner(prev => ({ ...prev, endDateTime: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
                type="number"
                value={newBanner.priority}
                onChange={(e) => setNewBanner(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                placeholder="1"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="backgroundColor">Background Color</Label>
              <Select value={newBanner.backgroundColor} onValueChange={(value) => setNewBanner(prev => ({ ...prev, backgroundColor: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gradient-primary">Gradient Primary</SelectItem>
                  <SelectItem value="gradient-secondary">Gradient Secondary</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="textColor">Text Color</Label>
              <Select value={newBanner.textColor} onValueChange={(value) => setNewBanner(prev => ({ ...prev, textColor: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="white">White</SelectItem>
                  <SelectItem value="black">Black</SelectItem>
                  <SelectItem value="gray">Gray</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleCreateBanner}
            disabled={createBannerMutation.isPending}
            className="w-full"
          >
            {createBannerMutation.isPending ? 'Creating...' : 'Create Banner with AI Translations'}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Banners */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Existing Countdown Banners
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bannersQuery.isLoading ? (
            <div className="text-center py-8">Loading banners...</div>
          ) : bannersQuery.error ? (
            <div className="text-center py-8 text-red-500">Error loading banners</div>
          ) : bannersQuery.data?.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No countdown banners found</div>
          ) : (
            <div className="space-y-4">
              {bannersQuery.data?.map((banner: any) => (
                <div key={banner.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{banner.titleEn}</h3>
                      <p className="text-sm text-slate-600">{banner.subtitleEn}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span>€{banner.targetPrice}</span>
                        {banner.originalPrice && (
                          <span className="line-through text-slate-500">€{banner.originalPrice}</span>
                        )}
                        <span className="text-slate-500">
                          Ends: {new Date(banner.endDateTime).toLocaleString()}
                        </span>
                        <Badge variant={banner.isEnabled ? "default" : "secondary"}>
                          {banner.isEnabled ? "Active" : "Disabled"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingBanner(banner)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteBannerMutation.mutate(banner.id)}
                        disabled={deleteBannerMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Show translations */}
                  {banner.titleTranslations && Object.keys(banner.titleTranslations).length > 0 && (
                    <div className="border-t pt-3">
                      <h4 className="text-sm font-medium mb-2">Translations:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        {Object.entries(banner.titleTranslations).map(([lang, title]: [string, any]) => (
                          <div key={lang} className="p-2 bg-slate-50 rounded">
                            <div className="font-medium text-xs text-slate-500 uppercase">{lang}</div>
                            <div>{title}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Banner Dialog */}
      {editingBanner && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Countdown Banner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editTitleEn">Title (English)</Label>
                <Input
                  id="editTitleEn"
                  value={editingBanner.titleEn}
                  onChange={(e) => setEditingBanner((prev: any) => ({ ...prev, titleEn: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="editSubtitleEn">Subtitle (English)</Label>
                <Input
                  id="editSubtitleEn"
                  value={editingBanner.subtitleEn}
                  onChange={(e) => setEditingBanner((prev: any) => ({ ...prev, subtitleEn: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="editTargetPrice">Target Price (€)</Label>
                <Input
                  id="editTargetPrice"
                  type="number"
                  value={editingBanner.targetPrice}
                  onChange={(e) => setEditingBanner((prev: any) => ({ ...prev, targetPrice: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="editOriginalPrice">Original Price (€)</Label>
                <Input
                  id="editOriginalPrice"
                  type="number"
                  value={editingBanner.originalPrice}
                  onChange={(e) => setEditingBanner((prev: any) => ({ ...prev, originalPrice: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="editEndDateTime">End Date & Time</Label>
                <Input
                  id="editEndDateTime"
                  type="datetime-local"
                  value={editingBanner.endDateTime?.slice(0, 16)}
                  onChange={(e) => setEditingBanner((prev: any) => ({ ...prev, endDateTime: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingBanner.isEnabled}
                    onCheckedChange={(checked) => setEditingBanner((prev: any) => ({ ...prev, isEnabled: checked }))}
                  />
                  <Label>Enabled</Label>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleUpdateBanner} disabled={updateBannerMutation.isPending}>
                {updateBannerMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => setEditingBanner(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Announcement Badge Management Component
function AnnouncementBadgeManagementTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [editingBadge, setEditingBadge] = useState<any>(null);
  const [newBadge, setNewBadge] = useState({
    textEn: '',
    backgroundColor: '#3b82f6',
    textColor: '#ffffff',
    priority: 1,
    targetLanguages: ['de', 'fr', 'es', 'it', 'pt', 'nl', 'da', 'no', 'fi', 'tr', 'pl', 'ru']
  });

  // Fetch badges
  const badgesQuery = useQuery({
    queryKey: ['/api/admin/announcement-badges'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/announcement-badges');
      if (!response.ok) throw new Error('Failed to fetch badges');
      return response.json();
    }
  });

  // Create badge mutation
  const createBadgeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/admin/announcement-badges', data);
      if (!response.ok) throw new Error('Failed to create badge');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Announcement badge created successfully" });
      setNewBadge({
        textEn: '',
        backgroundColor: '#3b82f6',
        textColor: '#ffffff',
        priority: 1,
        targetLanguages: ['de', 'fr', 'es', 'it', 'pt', 'nl', 'da', 'no', 'fi', 'tr', 'pl', 'ru']
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/announcement-badges'] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Update badge mutation
  const updateBadgeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const response = await apiRequest('PUT', `/api/admin/announcement-badges/${id}`, data);
      if (!response.ok) throw new Error('Failed to update badge');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Announcement badge updated successfully" });
      setEditingBadge(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/announcement-badges'] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Delete badge mutation
  const deleteBadgeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/admin/announcement-badges/${id}`);
      if (!response.ok) throw new Error('Failed to delete badge');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Announcement badge deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/announcement-badges'] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleCreateBadge = async () => {
    if (!newBadge.textEn.trim()) {
      toast({ title: "Error", description: "Text is required", variant: "destructive" });
      return;
    }

    const badgeData = {
      ...newBadge,
      isEnabled: true,
      targetLanguages: ['de', 'fr', 'es', 'it', 'pt', 'nl', 'da', 'no', 'fi', 'tr', 'pl', 'ru'] // Auto-translate to all supported languages
    };

    createBadgeMutation.mutate(badgeData);
  };

  const handleUpdateBadge = async () => {
    if (!editingBadge?.textEn?.trim()) {
      toast({ title: "Error", description: "Text is required", variant: "destructive" });
      return;
    }

    updateBadgeMutation.mutate({
      id: editingBadge.id,
      data: editingBadge
    });
  };

  const handleTranslateBadge = async (badgeId: number, textEn: string) => {
    try {
      const response = await apiRequest('POST', `/api/admin/announcement-badges/translate`, {
        textEn,
        targetLanguages: ['de', 'fr', 'es', 'it', 'pt', 'nl', 'da', 'no', 'fi', 'tr', 'pl', 'ru'] // Translate to all languages
      });
      
      if (!response.ok) throw new Error('Failed to translate badge');
      
      const translations = await response.json();
      
      // Update the badge with translations
      await updateBadgeMutation.mutateAsync({
        id: badgeId,
        data: { textTranslations: translations }
      });
      
      toast({ title: "Success", description: "Badge translated successfully to all supported languages" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Announcement Badge Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="textEn">Badge Text (English)</Label>
                <Input
                  id="textEn"
                  value={newBadge.textEn}
                  onChange={(e) => setNewBadge(prev => ({ ...prev, textEn: e.target.value }))}
                  placeholder="Enter badge text..."
                />
              </div>
              <div>
                <Label htmlFor="backgroundColor">Background Color</Label>
                <Input
                  id="backgroundColor"
                  type="color"
                  value={newBadge.backgroundColor}
                  onChange={(e) => setNewBadge(prev => ({ ...prev, backgroundColor: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="textColor">Text Color</Label>
                <Input
                  id="textColor"
                  type="color"
                  value={newBadge.textColor}
                  onChange={(e) => setNewBadge(prev => ({ ...prev, textColor: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  value={newBadge.priority}
                  onChange={(e) => setNewBadge(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            
            <Button onClick={handleCreateBadge} disabled={createBadgeMutation.isPending}>
              {createBadgeMutation.isPending ? 'Creating...' : 'Create Badge'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Announcement Badges</CardTitle>
        </CardHeader>
        <CardContent>
          {badgesQuery.isLoading ? (
            <div className="text-center py-4">Loading badges...</div>
          ) : badgesQuery.data?.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No announcement badges created yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {badgesQuery.data?.map((badge: any) => (
                <div key={badge.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div 
                        className="px-3 py-2 rounded-md text-sm font-medium"
                        style={{ 
                          backgroundColor: badge.backgroundColor, 
                          color: badge.textColor 
                        }}
                      >
                        {badge.textEn}
                      </div>
                      <div className="text-sm text-slate-500">
                        Priority: {badge.priority} | {badge.isEnabled ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTranslateBadge(badge.id, badge.textEn)}
                        disabled={updateBadgeMutation.isPending}
                      >
                        Translate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingBadge(badge)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteBadgeMutation.mutate(badge.id)}
                        disabled={deleteBadgeMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Badge Modal */}
      {editingBadge && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Announcement Badge
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editTextEn">Badge Text (English)</Label>
                <Input
                  id="editTextEn"
                  value={editingBadge.textEn}
                  onChange={(e) => setEditingBadge((prev: any) => ({ ...prev, textEn: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="editBackgroundColor">Background Color</Label>
                <Input
                  id="editBackgroundColor"
                  type="color"
                  value={editingBadge.backgroundColor}
                  onChange={(e) => setEditingBadge((prev: any) => ({ ...prev, backgroundColor: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="editTextColor">Text Color</Label>
                <Input
                  id="editTextColor"
                  type="color"
                  value={editingBadge.textColor}
                  onChange={(e) => setEditingBadge((prev: any) => ({ ...prev, textColor: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingBadge.isEnabled}
                    onCheckedChange={(checked) => setEditingBadge((prev: any) => ({ ...prev, isEnabled: checked }))}
                  />
                  <Label>Enabled</Label>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleUpdateBadge} disabled={updateBadgeMutation.isPending}>
                {updateBadgeMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => setEditingBadge(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}