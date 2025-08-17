import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  User,
  ShoppingCart,
  Download,
  Key,
  Ticket,
  Settings,
  CreditCard,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  HelpCircle,
  BookOpen,
  Users,
  DollarSign,
  FileText,
  Target,
  Chrome
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface UserSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export function UserSidebar({ activeTab, onTabChange, collapsed, onToggleCollapsed }: UserSidebarProps) {
  const { t } = useLanguage();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  // Fetch dashboard features settings
  const { data: dashboardFeatures } = useQuery({
    queryKey: ['/api/admin/dashboard-features'],
    queryFn: async () => {
      const response = await fetch('/api/admin/dashboard-features');
      if (!response.ok) return [];
      return response.json();
    }
  });

  // Helper function to check if a feature is enabled
  const isFeatureEnabled = (featureName: string) => {
    if (!dashboardFeatures || !Array.isArray(dashboardFeatures)) return true;
    const feature = dashboardFeatures.find(f => f.id === featureName || f.featureName === featureName);
    return feature ? feature.isEnabled : true;
  };

  const allNavigationItems = [
    {
      id: "profile",
      label: t.profile,
      icon: User,
      description: "Personal information & settings"
    },
    {
      id: "orders", 
      label: t.orders,
      icon: ShoppingCart,
      description: "Purchase history & tracking"
    },
    {
      id: "downloads",
      label: t.downloads,
      icon: Download,
      description: "Extension files & updates"
    },
    {
      id: "affiliate",
      label: "Affiliate Program",
      icon: Users,
      description: "Earn commissions by referring customers",
      featureCheck: "affiliate-program"
    },
    {
      id: "invoices",
      label: "Invoices & Receipts",
      icon: FileText,
      description: "Download your purchase documents"
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: DollarSign,
      description: "Job performance & earnings analytics",
      featureCheck: "analytics"
    },
    {
      id: "support",
      label: t.support,
      icon: Ticket,
      description: "Submit and track support tickets"
    },
    {
      id: "user-manual",
      label: "User Manual",
      icon: BookOpen,
      description: "Installation & usage guide"
    },
    {
      id: "billing",
      label: "Billing",
      icon: CreditCard,
      description: "Payment methods & invoices",
      featureCheck: "billing"
    },
    {
      id: "preferences",
      label: "Preferences",
      icon: Settings,
      description: "Account & notification settings"
    }
  ];

  // Filter navigation items based on admin settings
  const navigationItems = allNavigationItems.filter(item => {
    if (!item.featureCheck) return true; // Always show items without feature check
    return isFeatureEnabled(item.featureCheck);
  });

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const toggleSubmenu = (itemId: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

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
          <h2 className="font-semibold text-gray-900">Dashboard</h2>
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
          const isExpanded = expandedMenus[item.id];
          const hasActiveSubmenu = false;
          
          return (
            <div key={item.id}>
              {/* Main Menu Item */}
              <Button
                variant={isActive || hasActiveSubmenu ? "default" : "ghost"}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full justify-start h-auto p-3 transition-all duration-200 group",
                  collapsed ? "px-3" : "px-3",
                  (isActive || hasActiveSubmenu) && "bg-primary text-white shadow-sm",
                  !(isActive || hasActiveSubmenu) && "hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                )}
              >
                <Icon className={cn("h-5 w-5 flex-shrink-0", collapsed ? "" : "mr-3")} />
                {!collapsed && (
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className={cn(
                      "text-xs opacity-75 truncate group-hover:opacity-90",
                      (isActive || hasActiveSubmenu) ? "text-white/90" : "text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                    )}>
                      {item.description}
                    </div>
                  </div>
                )}

              </Button>


            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start h-auto p-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400",
            collapsed ? "px-3" : "px-3"
          )}
        >
          <LogOut className={cn("h-5 w-5 flex-shrink-0", collapsed ? "" : "mr-3")} />
          {!collapsed && (
            <div className="text-left flex-1 min-w-0">
              <div className="font-medium text-sm">Logout</div>
              <div className="text-xs opacity-75 truncate">
                Sign out of account
              </div>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}