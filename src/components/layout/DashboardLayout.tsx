import { useState, cloneElement } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { mockUsers } from "@/data/mockData";

interface DashboardLayoutProps {
  children: React.ReactElement;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [currentUser] = useState(mockUsers[0]); // John Admin as default user

  // Clone the child element and pass the currentUser prop
  const childWithProps = cloneElement(children, { currentUser });

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar 
          currentUser={currentUser}
        />
        <main className="flex-1">
          {childWithProps}
        </main>
      </div>
    </SidebarProvider>
  );
}