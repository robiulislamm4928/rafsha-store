import {
  LayoutDashboard, ShoppingCart, Package, FolderTree, Users, Star,
  Truck, Settings, BarChart3, Shield, Image, Megaphone, MessageCircle, Tag, Sparkles, AlertTriangle, HelpCircle, ChevronLeft,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import logo from "@/assets/logo.png";

const menuItems = [
  { title: "ড্যাশবোর্ড", url: "/admin", icon: LayoutDashboard },
  { title: "অর্ডার", url: "/admin/orders", icon: ShoppingCart },
  { title: "পণ্য", url: "/admin/products", icon: Package },
  { title: "ক্যাটাগরি", url: "/admin/categories", icon: FolderTree },
  { title: "ব্যানার", url: "/admin/banners", icon: Image },
  { title: "অ্যানাউন্সমেন্ট", url: "/admin/announcements", icon: Megaphone },
  { title: "কুপন", url: "/admin/coupons", icon: Tag },
  { title: "কী পয়েন্টস", url: "/admin/key-points", icon: Sparkles },
  { title: "গ্রাহক", url: "/admin/customers", icon: Users },
  { title: "রিভিউ", url: "/admin/reviews", icon: Star },
  { title: "লাইভ চ্যাট", url: "/admin/chat", icon: MessageCircle },
  { title: "শিপিং জোন", url: "/admin/shipping", icon: Truck },
  { title: "সাইট সেটিংস", url: "/admin/settings", icon: Settings },
  { title: "অ্যানালিটিক্স", url: "/admin/analytics", icon: BarChart3 },
  { title: "অসম্পূর্ণ অর্ডার", url: "/admin/incomplete-orders", icon: AlertTriangle },
  { title: "প্রশ্ন-উত্তর", url: "/admin/qa", icon: HelpCircle },
  { title: "টিম", url: "/admin/team", icon: Shield },
];

const AdminSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r-0 bg-[hsl(230,25%,18%)] [&>div]:bg-[hsl(230,25%,18%)]">
      <SidebarContent className="bg-[hsl(230,25%,18%)]">
        {!collapsed && (
          <div className="p-5 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white p-1.5 shadow-lg shadow-white/10">
                <img src={logo} alt="রাফছা স্টোর" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="text-white font-bold text-base tracking-tight">রাফছা স্টোর</h2>
                <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold">Admin Panel</p>
              </div>
            </div>
          </div>
        )}
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/30 text-[10px] uppercase tracking-[0.15em] font-bold px-5 pt-4 pb-1">
            ✦ নেভিগেশন
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = item.url === "/admin"
                  ? location.pathname === "/admin"
                  : location.pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/admin"}
                        className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white shadow-lg shadow-blue-500/10"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                        }`}
                        activeClassName=""
                      >
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-500 rounded-r-full" />
                        )}
                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
                          isActive
                            ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md shadow-blue-500/30"
                            : "bg-white/5 text-white/50 group-hover:bg-white/10 group-hover:text-white/80"
                        }`}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
