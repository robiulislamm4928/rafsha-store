import {
  LayoutDashboard, ShoppingCart, Package, FolderTree, Users, Star,
  Truck, Settings, BarChart3, Shield, Image, Megaphone, MessageCircle, Tag, Sparkles,
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
  { title: "গ্রাহক", url: "/admin/customers", icon: Users },
  { title: "রিভিউ", url: "/admin/reviews", icon: Star },
  { title: "লাইভ চ্যাট", url: "/admin/chat", icon: MessageCircle },
  { title: "শিপিং জোন", url: "/admin/shipping", icon: Truck },
  { title: "সাইট সেটিংস", url: "/admin/settings", icon: Settings },
  { title: "অ্যানালিটিক্স", url: "/admin/analytics", icon: BarChart3 },
  { title: "টিম", url: "/admin/team", icon: Shield },
];

const AdminSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent>
        {!collapsed && (
          <div className="p-4 border-b border-border">
            <img src={logo} alt="রাফছা স্টোর" className="h-10 w-auto" />
            <p className="text-xs text-muted-foreground mt-1">অ্যাডমিন প্যানেল</p>
          </div>
        )}
        <SidebarGroup>
          <SidebarGroupLabel>মেনু</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className="hover:bg-muted/50"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
