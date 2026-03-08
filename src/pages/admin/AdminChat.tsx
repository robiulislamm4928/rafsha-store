import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Send, MessageCircle, User, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Conversation {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_type: string;
  sender_id: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

const AdminChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    const { data } = await supabase
      .from("chat_conversations")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(100);
    setConversations((data as Conversation[]) || []);
  };

  useEffect(() => { fetchConversations(); }, []);

  // Realtime for new conversations
  useEffect(() => {
    const channel = supabase
      .channel("admin-convos")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_conversations" }, () => {
        fetchConversations();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Load messages when conversation selected
  useEffect(() => {
    if (!selected) return;
    const load = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", selected.id)
        .order("created_at", { ascending: true })
        .limit(500);
      setMessages((data as Message[]) || []);

      // Mark customer messages as read
      await supabase
        .from("chat_messages")
        .update({ is_read: true })
        .eq("conversation_id", selected.id)
        .eq("sender_type", "customer")
        .eq("is_read", false);
    };
    load();

    // Realtime for messages
    const channel = supabase
      .channel(`admin-chat-${selected.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `conversation_id=eq.${selected.id}`,
      }, (payload) => {
        const msg = payload.new as Message;
        setMessages((prev) => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMsg.trim() || !selected || !user) return;
    setSending(true);
    const msgText = newMsg.trim();
    setNewMsg("");

    // Optimistic update
    const optimisticMsg: Message = {
      id: crypto.randomUUID(),
      conversation_id: selected.id,
      sender_type: "admin",
      sender_id: user.id,
      message: msgText,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    await supabase.from("chat_messages").insert({
      conversation_id: selected.id,
      sender_type: "admin",
      sender_id: user.id,
      message: msgText,
    });
    await supabase.from("chat_conversations").update({ updated_at: new Date().toISOString() }).eq("id", selected.id);
    setSending(false);
  };

  const closeConvo = async (id: string) => {
    await supabase.from("chat_conversations").update({ status: "closed" }).eq("id", id);
    fetchConversations();
    if (selected?.id === id) { setSelected(null); setMessages([]); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display font-bold text-foreground">লাইভ চ্যাট</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-12rem)]">
        {/* Conversation list */}
        <div className="bg-card rounded-xl border border-border overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-muted-foreground text-sm">কোনো চ্যাট নেই</p>
            </div>
          ) : conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelected(c)}
              className={`p-3 border-b border-border cursor-pointer hover:bg-muted/30 transition-colors ${
                selected?.id === c.id ? "bg-primary/5 border-l-2 border-l-primary" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{c.user_name || c.user_email}</p>
                  <p className="text-xs text-muted-foreground">{c.user_email}</p>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${
                  c.status === "open" ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground"
                }`}>
                  {c.status === "open" ? "সক্রিয়" : "বন্ধ"}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {new Date(c.updated_at).toLocaleString("bn-BD")}
              </p>
            </div>
          ))}
        </div>

        {/* Chat area */}
        <div className="md:col-span-2 bg-card rounded-xl border border-border flex flex-col">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/20 mb-3" />
                <p className="text-muted-foreground">একটি চ্যাট নির্বাচন করুন</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="p-3 border-b border-border flex items-center justify-between shrink-0">
                <div>
                  <p className="font-medium text-sm text-foreground">{selected.user_name || selected.user_email}</p>
                  <p className="text-xs text-muted-foreground">{selected.user_email}</p>
                </div>
                {selected.status === "open" && (
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => closeConvo(selected.id)}>
                    চ্যাট বন্ধ করুন
                  </Button>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender_type === "admin" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-xl px-3 py-2 text-sm ${
                      m.sender_type === "admin"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    }`}>
                      {m.message}
                      <p className={`text-[10px] mt-0.5 ${m.sender_type === "admin" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        {new Date(m.created_at).toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              {selected.status === "open" && (
                <div className="border-t border-border p-3 shrink-0">
                  <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                    <Input
                      value={newMsg}
                      onChange={(e) => setNewMsg(e.target.value)}
                      placeholder="রিপ্লাই লিখুন..."
                      className="flex-1"
                      maxLength={2000}
                    />
                    <Button type="submit" size="icon" disabled={sending || !newMsg.trim()} className="brand-gradient text-primary-foreground">
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
