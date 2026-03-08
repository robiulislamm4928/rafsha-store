import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminNotifications } from "@/contexts/AdminNotificationContext";
import { Bell, ShoppingCart, MessageCircle, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const AdminNotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useAdminNotifications();
  const navigate = useNavigate();

  const handleClick = (id: string, link: string) => {
    markAsRead(id);
    navigate(link);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-lg">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-2">
          <p className="font-semibold text-sm text-foreground">নোটিফিকেশন</p>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllAsRead}>
                <Check className="h-3 w-3 mr-1" /> সব পঠিত
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={clearAll}>
                <Trash2 className="h-3 w-3 mr-1" /> মুছুন
              </Button>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="py-8 text-center">
            <Bell className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">কোনো নোটিফিকেশন নেই</p>
          </div>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem
              key={n.id}
              onClick={() => handleClick(n.id, n.link)}
              className={`flex items-start gap-3 px-3 py-2.5 cursor-pointer ${!n.read ? "bg-primary/5" : ""}`}
            >
              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                n.type === "order" ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
              }`}>
                {n.type === "order" ? <ShoppingCart className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{n.title}</p>
                <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {new Date(n.timestamp).toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {!n.read && <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AdminNotificationBell;
