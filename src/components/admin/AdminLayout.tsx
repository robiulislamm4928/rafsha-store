import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "./AdminSidebar";
import AdminNotificationBell from "./AdminNotificationBell";
import { AdminNotificationProvider } from "@/contexts/AdminNotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";

const AdminLayout = () => {
  const { user, signOut } = useAuth();

  return (
    <AdminNotificationProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-[hsl(220,20%,97%)]">
          <AdminSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-16 flex items-center justify-between bg-white/80 backdrop-blur-xl border-b border-black/5 px-6 shrink-0 sticky top-0 z-30">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="shrink-0 hover:bg-black/5 rounded-lg p-2 transition-colors">
                  <Menu className="h-5 w-5" />
                </SidebarTrigger>
                <div className="hidden md:block">
                  <h1 className="text-lg font-bold text-gray-800">রাফছা স্টোর</h1>
                  <p className="text-[11px] text-gray-400 -mt-0.5">অ্যাডমিন প্যানেল</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AdminNotificationBell />
                <div className="hidden sm:flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium text-gray-600 max-w-[120px] truncate">{user?.email}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </header>
            <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AdminNotificationProvider>
  );
};

export default AdminLayout;
