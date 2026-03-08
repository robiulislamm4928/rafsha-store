import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdminNotification {
  id: string;
  type: "order" | "chat";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link: string;
}

interface AdminNotificationContextType {
  notifications: AdminNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const AdminNotificationContext = createContext<AdminNotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearAll: () => {},
});

export const useAdminNotifications = () => useContext(AdminNotificationContext);

export const AdminNotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const soundUrlRef = useRef<string | null>(null);
  const initialLoadDone = useRef(false);

  // Load notification sound URL from settings
  useEffect(() => {
    const loadSound = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "notification_sound_url")
        .maybeSingle();
      if (data?.value) soundUrlRef.current = data.value;
    };
    loadSound();
  }, []);

  const playSound = useCallback(() => {
    const url = soundUrlRef.current;
    if (!url) return;
    try {
      const audio = new Audio(url);
      audio.volume = 0.7;
      audio.play().catch(() => {});
    } catch {}
  }, []);

  const addNotification = useCallback((n: Omit<AdminNotification, "id" | "read">) => {
    const notification: AdminNotification = {
      ...n,
      id: crypto.randomUUID(),
      read: false,
    };
    setNotifications((prev) => [notification, ...prev].slice(0, 50));
    playSound();
  }, [playSound]);

  // Real-time subscription for orders
  useEffect(() => {
    const channel = supabase
      .channel("admin-rt-orders")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "orders",
      }, (payload) => {
        if (!initialLoadDone.current) return;
        const order = payload.new as any;
        addNotification({
          type: "order",
          title: "নতুন অর্ডার!",
          message: `${order.customer_name} - ৳${order.total_amount} (${order.order_number})`,
          timestamp: new Date().toISOString(),
          link: "/admin/orders",
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [addNotification]);

  // Real-time subscription for chat messages (only customer messages)
  useEffect(() => {
    const channel = supabase
      .channel("admin-rt-chat")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: "sender_type=eq.customer",
      }, (payload) => {
        if (!initialLoadDone.current) return;
        const msg = payload.new as any;
        addNotification({
          type: "chat",
          title: "নতুন চ্যাট মেসেজ!",
          message: msg.message?.substring(0, 80) || "নতুন মেসেজ",
          timestamp: new Date().toISOString(),
          link: "/admin/chat",
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [addNotification]);

  // Mark initial load done after a short delay to avoid notifications for existing data
  useEffect(() => {
    const timer = setTimeout(() => { initialLoadDone.current = true; }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => setNotifications([]);

  return (
    <AdminNotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, clearAll }}>
      {children}
    </AdminNotificationContext.Provider>
  );
};
