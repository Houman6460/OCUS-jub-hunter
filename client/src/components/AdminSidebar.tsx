import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  BarChart3,
  Users,
  Ticket,
  MessageSquare,
  Bell,
  CreditCard,
  Shield,
  Settings,
  Bot,
  User,
  ChevronLeft,
  ChevronRight,
  Globe,
  ShoppingCart
} from "lucide-react";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export default function AdminSidebar({ 
  activeTab, 
  onTabChange, 
  collapsed, 
  onToggleCollapsed 
}: AdminSidebarProps) {
  const { t } = useLanguage();

  const navigationItems = [
    {
      id: "analytics",
      label: t.analytics,
      icon: BarChart3,
      description: "Revenue, sales & performance"
    },
    {
      id: "users",
      label: "Users & Customers",
      icon: Users,
      description: "User management, lifecycle & customer data"
    },
    {
      id: "affiliates",
      label: "Affiliates",
      icon: Users,
      description: "Affiliate program management"
    },
    {
      id: "purchases",
      label: "Purchase Management",
      icon: ShoppingCart,
      description: "Order tracking & premium activations"
    },
    {
      id: "tickets",
      label: t.support,
      icon: Ticket,
      description: "Support tickets & help desk"
    },
    {
      id: "banners",
      label: "Banners",
      icon: MessageSquare,
      description: "Countdown banners & promotions"
    },
    {
      id: "badges",
      label: "Badges", 
      icon: Bell,
      description: "Announcement badges"
    },
    {
      id: "payments",
      label: "Payments",
      icon: CreditCard,
      description: "Payment settings & processing"
    },
    {
      id: "auth",
      label: "Authentication",
      icon: Shield,
      description: "Login & social auth settings"
    },
    {
      id: "chatbot",
      label: "AI Assistant",
      icon: Bot,
      description: "Chatbot configuration"
    },
    {
      id: "account",
      label: "Account",
      icon: User,
      description: "Change username & password"
    },
    {
      id: "dashboard-features",
      label: "Dashboard Features",
      icon: Settings,
      description: "Control user dashboard sections visibility"
    },
    {
      id: "seo",
      label: "SEO & Social",
      icon: Globe,
      description: "Social media preview & SEO settings"
    },
  ];

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
      // Mobile: Fixed positioning and z-index for overlay
      "fixed lg:relative inset-y-0 left-0 z-50",
      // Mobile: Hide when collapsed, show when expanded
      "lg:translate-x-0",
      collapsed ? "w-16 -translate-x-full lg:translate-x-0" : "w-64 translate-x-0",
      // Mobile backdrop
      !collapsed && "lg:shadow-none shadow-xl"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!collapsed && (
          <h2 className="font-semibold text-gray-900">Admin Panel</h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapsed}
          className="p-2"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full justify-start h-auto p-3 transition-all duration-200 group",
                collapsed ? "px-3" : "px-3",
                isActive && "bg-primary text-white shadow-sm",
                !isActive && "hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
              )}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0", collapsed ? "" : "mr-3")} />
              {!collapsed && (
                <div className="text-left flex-1 min-w-0">
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className={cn(
                    "text-xs opacity-75 truncate group-hover:opacity-90",
                    isActive ? "text-white/90" : "text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                  )}>
                    {item.description}
                  </div>
                </div>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            OCUS Admin Dashboard
          </div>
        </div>
      )}
    </div>
  );
}