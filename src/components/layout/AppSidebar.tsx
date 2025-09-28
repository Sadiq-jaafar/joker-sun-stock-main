import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Settings,
  ShoppingCart,
  Zap,
  TrendingUp
} from "lucide-react";
import { UserRole } from "@/types/inventory";
import { NavLink, useLocation } from "react-router-dom";

interface AppSidebarProps {
  currentUser: { name: string; role: UserRole };
  cartItemCount: number;
  onCartClick: () => void;
}

export function AppSidebar({ currentUser, cartItemCount, onCartClick }: AppSidebarProps) {
  const location = useLocation();

  const navigation = [
    { id: "dashboard", name: "Dashboard", icon: LayoutDashboard, href: "/" },
    { id: "inventory", name: "Inventory", icon: Package, href: "/inventory" },
    ...(currentUser.role === 'admin' ? [
      { id: "admin-inventory", name: "Manage Inventory", icon: Settings, href: "/admin/inventory" },
      { id: "admin-users", name: "Manage Users", icon: Users, href: "/admin/users" },
      { id: "admin-sales", name: "Sales Reports", icon: TrendingUp, href: "/admin/sales" }
    ] : [])
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-sidebar-foreground">Joker Solar</h2>
            <p className="text-xs text-sidebar-foreground/60">Electronics Store</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarMenu>
          {navigation.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton asChild>
                <NavLink 
                  to={item.href}
                  className={({ isActive }) => cn(
                    "w-full justify-start",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <div className="mt-6">
          <Button
            onClick={onCartClick}
            variant="outline"
            className="w-full justify-start"
          >
            <ShoppingCart className="h-4 w-4" />
            Cart
            {cartItemCount > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {cartItemCount}
              </Badge>
            )}
          </Button>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-sm font-medium text-primary-foreground">
              {currentUser.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {currentUser.name}
            </p>
            <p className="text-xs text-sidebar-foreground/60 capitalize">
              {currentUser.role}
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}