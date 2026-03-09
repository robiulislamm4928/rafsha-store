import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MessageCircle, X, Send, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

interface Message {
  id: string;
  sender_type: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

const ChatWidget = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const init = async () => {
      const { data } = await supabase
        .from("chat_conversations")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) setConversationId(data.id);
    };
    init();
  }, [user]);

  useEffect(() => {
    if (!conversationId) return;
    const load = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(200);
      setMessages((data as Message[]) || []);
      const unread = (data || []).filter(m => m.sender_type === "admin" && !m.is_read).length;
      setUnreadCount(unread);
    };
    load();

    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const msg = payload.new as Message;
        setMessages((prev) => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        if (msg.sender_type === "admin" && !open) {
          setUnreadCount(c => c + 1);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open && conversationId) {
      setUnreadCount(0);
      supabase
        .from("chat_messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .eq("sender_type", "admin")
        .eq("is_read", false)
        .then(() => {});
    }
  }, [open, conversationId]);

  const handleSend = async () => {
    if (!newMsg.trim() || !user) return;
    setSending(true);

    let convId = conversationId;
    if (!convId) {
      const { data, error } = await supabase
        .from("chat_conversations")
        .insert({
          user_id: user.id,
          user_name: user.user_metadata?.full_name || user.email || "",
          user_email: user.email || "",
          status: "open",
        })
        .select("id")
        .single();
      if (error || !data) { setSending(false); return; }
      convId = data.id;
      setConversationId(convId);
    }

    const msgText = newMsg.trim();
    setNewMsg("");

    const optimisticMsg: Message = {
      id: crypto.randomUUID(),
      sender_type: "customer",
      message: msgText,
      created_at: new Date().toISOString(),
      is_read: false,
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    await supabase.from("chat_messages").insert({
      conversation_id: convId,
      sender_type: "customer",
      sender_id: user.id,
      message: msgText,
    });

    setSending(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50 h-12 w-12 sm:h-14 sm:w-14 rounded-full brand-gradient text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
      >
        {open ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />}
        {!open && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-4 sm:inset-auto sm:bottom-20 sm:right-5 z-50 sm:w-[340px] sm:max-h-[480px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="brand-gradient text-primary-foreground p-4 shrink-0 flex items-center justify-between">
            <div>
              <p className="font-display font-bold text-sm">রাফছা স্টোর সাপোর্ট</p>
              <p className="text-xs opacity-80">আমরা আপনাকে সাহায্য করতে প্রস্তুত</p>
            </div>
            <button onClick={() => setOpen(false)} className="sm:hidden p-1 rounded-full hover:bg-primary-foreground/20">
              <X className="h-5 w-5" />
            </button>
          </div>

          {!user ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <LogIn className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">চ্যাট করতে আগে লগইন করুন</p>
              <Button asChild className="brand-gradient text-primary-foreground hover:opacity-90">
                <Link to="/login" onClick={() => setOpen(false)}>লগইন করুন</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px]">
                {messages.length === 0 && (
                  <p className="text-center text-muted-foreground text-xs py-8">
                    আপনার প্রশ্ন লিখুন, আমরা দ্রুত উত্তর দেব!
                  </p>
                )}
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender_type === "customer" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                      m.sender_type === "customer"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    }`}>
                      {m.message}
                      <p className={`text-[10px] mt-0.5 ${m.sender_type === "customer" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        {new Date(m.created_at).toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <div className="border-t border-border p-3 shrink-0">
                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                  <Input
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    placeholder="মেসেজ লিখুন..."
                    className="flex-1 text-sm"
                    maxLength={1000}
                  />
                  <Button type="submit" size="icon" disabled={sending || !newMsg.trim()} className="brand-gradient text-primary-foreground shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;