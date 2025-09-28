import { useState, cloneElement } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { mockUsers } from "@/data/mockData";
import { CartItem } from "@/types/inventory";

interface DashboardLayoutProps {
  children: React.ReactElement;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [currentUser] = useState(mockUsers[0]); // John Admin as default user
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const getCartItemCount = () => {
    return cartItems.reduce((count, cartItem) => count + cartItem.quantity, 0);
  };

  const handleCartClick = () => {
    // This will be handled by the individual pages
  };

  // Clone the child element and pass the currentUser prop
  const childWithProps = cloneElement(children, { currentUser });

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar 
          currentUser={currentUser}
          cartItemCount={getCartItemCount()}
          onCartClick={handleCartClick}
        />
        <main className="flex-1">
          {childWithProps}
        </main>
      </div>
    </SidebarProvider>
  );
}