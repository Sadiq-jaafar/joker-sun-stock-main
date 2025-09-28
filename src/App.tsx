import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import Index from "./pages/Index";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { InventoryPage } from "./pages/Inventory";
import { AdminInventory } from "./pages/admin/AdminInventory";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminSales } from "./pages/admin/AdminSales";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardLayout><Index currentUser={{ name: "", role: "user" }} /></DashboardLayout>} />
          <Route path="/inventory" element={<DashboardLayout><InventoryPage /></DashboardLayout>} />
          <Route path="/admin/inventory" element={<DashboardLayout><AdminInventory /></DashboardLayout>} />
          <Route path="/admin/users" element={<DashboardLayout><AdminUsers /></DashboardLayout>} />
          <Route path="/admin/sales" element={<DashboardLayout><AdminSales /></DashboardLayout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;