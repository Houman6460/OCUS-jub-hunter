import { useState, useEffect } from "react";
import { Bell, X, CheckCircle, AlertTriangle, Info, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'promotion';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
}

interface NotificationSystemProps {
  customerId?: string;
  customerData?: any;
}

export default function NotificationSystem({ customerId, customerData }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  // Generate smart notifications based on user status
  useEffect(() => {
    if (!customerData) return;

    const smartNotifications: Notification[] = [];

    // Extension activation notifications
    if (!customerData.extensionActivated && customerData.totalSpent === 0) {
      smartNotifications.push({
        id: 'welcome-trial',
        type: 'info',
        title: 'Welcome to OCUS Job Hunter!',
        message: 'You have 3 free job scans to try our extension. Upgrade to premium for unlimited access.',
        timestamp: new Date(),
        read: false,
        actionUrl: '/checkout',
        actionText: 'Upgrade Now'
      });
    }

    // Payment completion notification
    if (customerData.totalSpent > 0 && !customerData.activationKeyRevealed) {
      smartNotifications.push({
        id: 'payment-success',
        type: 'success',
        title: 'Payment Successful!',
        message: 'Your payment has been processed. Scratch your lottery card to reveal your activation key!',
        timestamp: new Date(),
        read: false,
        actionUrl: '/dashboard#activation',
        actionText: 'Reveal Key'
      });
    }

    // Extension activated notification
    if (customerData.extensionActivated && customerData.activationKeyRevealed) {
      smartNotifications.push({
        id: 'extension-active',
        type: 'success',
        title: 'Extension Activated!',
        message: 'Your OCUS Job Hunter extension is now active. Start monitoring profitable delivery jobs!',
        timestamp: new Date(),
        read: false,
        actionUrl: '/dashboard#extension',
        actionText: 'Download Extension'
      });
    }

    // Special promotions
    if (customerData.totalOrders === 0) {
      smartNotifications.push({
        id: 'first-time-discount',
        type: 'promotion',
        title: 'Limited Time Offer!',
        message: 'Get 40% off your first purchase with code WELCOME40. Valid for 24 hours only!',
        timestamp: new Date(),
        read: false,
        actionUrl: '/checkout?code=WELCOME40',
        actionText: 'Claim Discount'
      });
    }

    // Usage optimization tips
    if (customerData.extensionUsageCount > 10 && customerData.extensionSuccessfulJobs < 3) {
      smartNotifications.push({
        id: 'optimization-tip',
        type: 'warning',
        title: 'Optimize Your Job Selection',
        message: 'Your success rate is low. Try adjusting your area settings or minimum order value for better results.',
        timestamp: new Date(),
        read: false,
        actionUrl: '/dashboard#settings',
        actionText: 'Update Settings'
      });
    }

    setNotifications(smartNotifications);
    setUnreadCount(smartNotifications.filter(n => !n.read).length);
  }, [customerData]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleAction = (notification: Notification) => {
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    markAsRead(notification.id);
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'promotion': return Gift;
      default: return Info;
    }
  };

  const getIconColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'promotion': return 'text-purple-600';
      default: return 'text-blue-600';
    }
  };

  const getBadgeVariant = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'default';
      case 'warning': return 'secondary';
      case 'promotion': return 'destructive';
      default: return 'outline';
    }
  };

  if (!customerId) return null;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = getIcon(notification.type);
                return (
                  <Card key={notification.id} className={`m-2 ${!notification.read ? 'bg-blue-50 border-blue-200' : ''}`}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <Icon className={`h-5 w-5 mt-0.5 ${getIconColor(notification.type)}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm text-gray-900 truncate">
                              {notification.title}
                            </h4>
                            <Badge variant={getBadgeVariant(notification.type)} className="text-xs">
                              {notification.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                              {notification.timestamp.toLocaleTimeString()}
                            </span>
                            <div className="flex gap-1">
                              {notification.actionUrl && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-6"
                                  onClick={() => handleAction(notification)}
                                >
                                  {notification.actionText || 'View'}
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs h-6"
                                onClick={() => dismissNotification(notification.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-100">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-sm"
                onClick={() => {
                  setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                  setUnreadCount(0);
                }}
              >
                Mark all as read
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}