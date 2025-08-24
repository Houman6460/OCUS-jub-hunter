import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Plus, MessageSquare, Clock, User, AlertCircle, Paperclip, X, Image, FileText, Trash2, Send, ArrowLeft } from 'lucide-react';
import { useLocation } from "wouter";

interface Ticket {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  customer_email: string;
  customer_name: string;
  assigned_to_user_id?: number;
  assigned_to_name?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

interface TicketMessage {
  id: number;
  ticket_id: number;
  message: string;
  is_from_customer: boolean;
  sender_name: string;
  sender_email?: string;
  created_at: string;
  attachments?: TicketAttachment[];
}

interface TicketAttachment {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
}

export default function Support() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  // Robust date formatting helpers to avoid 'Invalid Date'
  const formatDate = (value: any) => {
    if (!value) return '';
    // Support ISO strings, timestamps (ms or s), and Date objects
    let d: Date | null = null;
    if (value instanceof Date) {
      d = value;
    } else if (typeof value === 'number') {
      // If seconds, convert to ms
      d = new Date(value < 1e12 ? value * 1000 : value);
    } else if (typeof value === 'string') {
      const num = Number(value);
      if (!Number.isNaN(num) && value.trim() !== '') {
        d = new Date(num < 1e12 ? num * 1000 : num);
      } else {
        d = new Date(value);
      }
    }
    return d && !isNaN(d.getTime()) ? d.toLocaleString() : '';
  };

  const formatDateShort = (value: any) => {
    const s = formatDate(value);
    if (!s) return '';
    // Return only date part for compact list rows when possible
    try {
      const d = new Date(s);
      return !isNaN(d.getTime()) ? d.toLocaleDateString() : s;
    } catch {
      return s;
    }
  };

  // Check authentication using localStorage like the dashboard does
  useEffect(() => {
    const token = localStorage.getItem('customer_token');
    const data = localStorage.getItem('customer_data');
    
    // Also check admin token for admin users
    const adminToken = localStorage.getItem('admin_token');
    const adminData = localStorage.getItem('admin_data');
    
    console.log('Support page auth check:', { 
      customerToken: !!token, 
      customerData: !!data,
      adminToken: !!adminToken,
      adminData: !!adminData
    });
    
    // Check admin auth first
    if (adminToken && adminData) {
      try {
        const admin = JSON.parse(adminData);
        console.log('Admin data parsed:', admin);
        setUser({
          id: admin.id,
          email: admin.email,
          name: admin.name || admin.email,
          isAdmin: true
        });
        return;
      } catch (error) {
        console.error('Error parsing admin data:', error instanceof Error ? error.message : error);
      }
    }
    
    // Check customer auth
    if (token && data) {
      try {
        const customerData = JSON.parse(data);
        console.log('Customer data parsed:', customerData);
        setUser({
          id: customerData.id,
          email: customerData.email,
          name: customerData.name,
          isAdmin: customerData.isAdmin || false
        });
      } catch (error) {
        console.error('Error parsing customer data:', error instanceof Error ? error.message : error);
        setUser(null);
      }
    } else {
      // For testing purposes, set demo user if no auth found
      setUser({
        id: 1,
        email: 'demo@example.com',
        name: 'Demo User',
        isAdmin: false
      });
    }
  }, []);

  // Fetch tickets
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['/api/tickets'],
    queryFn: async () => {
      if (!user) return [];
      // Server derives identity from session; do not send client params
      const response = await apiRequest('GET', `/api/tickets`);
      const data = response.json ? await response.json() : response;
      // Normalize fields to snake_case expected by this page
      return Array.isArray(data)
        ? data.map((t: any) => ({
            ...t,
            created_at: t.created_at ?? t.createdAt ?? t.created,
            updated_at: t.updated_at ?? t.updatedAt ?? t.updated,
            resolved_at: t.resolved_at ?? t.resolvedAt,
            customer_name: t.customer_name ?? t.customerName ?? t.userName,
            customer_email: t.customer_email ?? t.customerEmail ?? t.userEmail,
          }))
        : [];
    },
    enabled: !!user
  });

  // Fetch ticket messages
  const { data: messages = [] } = useQuery({
    queryKey: ['/api/tickets', selectedTicket?.id, 'messages'],
    queryFn: async () => {
      if (!user) {
        console.error('No user available for fetching messages');
        return [];
      }
      console.log('Fetching messages for ticket:', selectedTicket?.id, 'user:', user);
      // Server derives role/email from session; call without client-provided flags
      let data: any = [];
      try {
        const response = await apiRequest('GET', `/api/tickets/${selectedTicket!.id}/messages`);
        data = response.json ? await response.json() : response;
      } catch (err: any) {
        // Treat 404 (no messages yet or store reset) as empty list
        if (typeof err?.message === 'string' && err.message.startsWith('404:')) {
          return [];
        }
        throw err;
      }
      // Normalize message fields for rendering
      return Array.isArray(data)
        ? data.map((m: any) => ({
            ...m,
            message: m.message ?? m.content,
            created_at: m.created_at ?? m.createdAt,
            is_from_customer: m.is_from_customer ?? (typeof m.isAdmin === 'boolean' ? !m.isAdmin : m.is_from_customer),
            sender_name: m.sender_name ?? m.authorName ?? m.sender,
          }))
        : [];
    },
    enabled: !!selectedTicket && !!user
  });

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/tickets', {
        ...data,
        customerEmail: user.email,
        customerName: user.name
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
      setNewTicketOpen(false);
      toast({
        title: t.ticketCreated,
        description: "Your support ticket has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create ticket. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Send message mutation with file attachments
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { ticketId: number; content: string; attachments?: File[] }) => {
      if (!user) {
        throw new Error('User not available');
      }
      
      console.log('Sending message with user data:', { email: user.email, name: user.name, isAdmin: user.isAdmin });
      
      // Send both keys to be compatible with either backend expectation
      const requestData = { content: data.content, message: data.content };
      const response = await apiRequest('POST', `/api/tickets/${data.ticketId}/messages`, requestData);
      return response.json ? await response.json() : response;
    },
    onSuccess: () => {
      setNewMessage('');
      setAttachments([]);
      queryClient.invalidateQueries({ queryKey: ['/api/tickets', selectedTicket?.id, 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
      toast({ title: "Message sent successfully" });
    },
    onError: () => {
      toast({ title: "Failed to send message", variant: "destructive" });
    }
  });

  // Delete ticket mutation
  const deleteTicketMutation = useMutation({
    mutationFn: async (ticketId: number) => {
      // Server validates ownership by session email
      const response = await apiRequest('DELETE', `/api/tickets/${ticketId}`);
      return response.json ? await response.json() : response;
    },
    onSuccess: () => {
      setSelectedTicket(null);
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
      toast({ title: "Ticket deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete ticket", variant: "destructive" });
    }
  });

  // Update ticket mutation (admin only)
  const updateTicketMutation = useMutation({
    mutationFn: async ({ ticketId, updates }: { ticketId: number; updates: any }) => {
      return apiRequest('PATCH', `/api/tickets/${ticketId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
      toast({
        title: t.ticketUpdated,
        description: "Ticket has been updated successfully.",
      });
    }
  });

  const handleSubmitTicket = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      priority: formData.get('priority') as string,
    };
    createTicketMutation.mutate(data);
  };

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
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Redirect to login if not authenticated (like dashboard does)
  if (!user) {
    navigate('/login');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Support</h1>
          <p className="text-gray-600 mt-2">Manage your support tickets and get help</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t.viewTickets}</CardTitle>
                <Button onClick={() => setNewTicketOpen(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  {t.createTicket}
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500">Loading tickets...</div>
                ) : !Array.isArray(tickets) || tickets.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">{t.noTicketsYet}</div>
                ) : (
                  <div className="space-y-2 p-4">
                    {Array.isArray(tickets) && tickets.map((ticket: Ticket) => (
                      <div
                        key={ticket.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedTicket?.id === ticket.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-sm line-clamp-2">{ticket.title}</h3>
                          <Badge className={`ml-2 text-xs ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                          <span>{ticket.category}</span>
                          <span>•</span>
                          <span>{formatDateShort(ticket.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Ticket Details */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{selectedTicket.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {t.createdOn}: {formatDate(selectedTicket.created_at)}
                        {selectedTicket.assigned_to_name && (
                          <span className="ml-4">
                            {t.assignedTo}: {selectedTicket.assigned_to_name}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(selectedTicket.status)}>
                        {(t as unknown as Record<string, string>)[selectedTicket.status] ?? selectedTicket.status}
                      </Badge>
                      <Badge className={getPriorityColor(selectedTicket.priority)}>
                        {(t as unknown as Record<string, string>)[selectedTicket.priority] ?? selectedTicket.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Original Message */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{selectedTicket.customer_name}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(selectedTicket.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{selectedTicket.description}</p>
                    </div>

                    <Separator />

                    {/* Messages */}
                    <div className="space-y-4">
                      <h3 className="font-medium flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        {t.replies}
                      </h3>
                      {messages.map((message: TicketMessage) => (
                        <div
                          key={message.id}
                          className={`p-4 rounded-lg ${
                            message.is_from_customer ? 'bg-blue-50 ml-8' : 'bg-green-50 mr-8'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{message.sender_name}</span>
                            <Badge variant="outline" className="text-xs">
                              {message.is_from_customer ? 'Customer' : 'Support'}
                            </Badge>
                            <span className="text-sm text-gray-500">{formatDate(message.created_at)}</span>
                          </div>
                          <p className="text-gray-700">{message.message}</p>
                        </div>
                      ))}
                    </div>

                    {/* Add Reply */}
                    {selectedTicket.status !== 'closed' && (
                      <div className="space-y-4">
                        <Textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your reply..."
                          required
                          className="min-h-[100px]"
                        />
                        <Button 
                          onClick={handleSendMessage} 
                          disabled={sendMessageMutation.isPending}
                        >
                          {sendMessageMutation.isPending ? 'Sending...' : 'Send Reply'}
                        </Button>
                      </div>
                    )}

                    {/* Admin Actions */}
                    {user.isAdmin && (
                      <div className="pt-4 border-t space-y-4">
                        <div className="flex gap-2">
                          {selectedTicket.status === 'open' && (
                            <Button
                              variant="outline"
                              onClick={() => updateTicketMutation.mutate({
                                ticketId: selectedTicket.id,
                                updates: { status: 'in-progress' }
                              })}
                            >
                              Start Working
                            </Button>
                          )}
                          {(selectedTicket.status === 'open' || selectedTicket.status === 'in-progress') && (
                            <Button
                              variant="outline"
                              onClick={() => updateTicketMutation.mutate({
                                ticketId: selectedTicket.id,
                                updates: { status: 'resolved' }
                              })}
                            >
                              {t.markAsResolved}
                            </Button>
                          )}
                          {selectedTicket.status === 'resolved' && (
                            <Button
                              variant="outline"
                              onClick={() => updateTicketMutation.mutate({
                                ticketId: selectedTicket.id,
                                updates: { status: 'open' }
                              })}
                            >
                              {t.reopenTicket}
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t.ticketDetails}</h3>
                  <p className="text-gray-500">Select a ticket to view details and messages</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* New Ticket Modal */}
        {newTicketOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <CardTitle>{t.createTicket}</CardTitle>
                <CardDescription>
                  Describe your issue and we'll help you resolve it
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">{t.ticketSubject}</label>
                    <Input name="title" required placeholder="Brief description of your issue" />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">{t.ticketCategory}</label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">{t.technical}</SelectItem>
                        <SelectItem value="billing">{t.billing}</SelectItem>
                        <SelectItem value="feature-request">{t.featureRequest}</SelectItem>
                        <SelectItem value="bug-report">{t.bugReport}</SelectItem>
                        <SelectItem value="general">{t.general}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">{t.ticketPriority}</label>
                    <Select name="priority" defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">{t.low}</SelectItem>
                        <SelectItem value="medium">{t.medium}</SelectItem>
                        <SelectItem value="high">{t.high}</SelectItem>
                        <SelectItem value="urgent">{t.urgent}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">{t.ticketDescription}</label>
                    <Textarea
                      name="description"
                      required
                      placeholder="Please provide detailed information about your issue..."
                      className="min-h-[120px]"
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setNewTicketOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createTicketMutation.isPending}>
                      {createTicketMutation.isPending ? 'Creating...' : t.createTicket}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}