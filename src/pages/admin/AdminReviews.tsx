import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Star, Check, X, Trash2, MessageSquare } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Review { id: string; reviewer_name: string; reviewer_location: string | null; rating: number; review_text: string | null; is_approved: boolean; created_at: string; product_id: string; }

const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  const fetchData = async () => {
    const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false }).limit(500);
    setReviews((data as Review[]) || []);
  };
  useEffect(() => { fetchData(); }, []);

  const approve = async (id: string, val: boolean) => {
    await supabase.from("reviews").update({ is_approved: val }).eq("id", id);
    toast.success(val ? "অনুমোদিত হয়েছে" : "প্রত্যাখ্যাত হয়েছে"); fetchData();
  };

  const del = async (id: string) => {
    await supabase.from("reviews").delete().eq("id", id);
    toast.success("রিভিউ মুছে ফেলা হয়েছে"); fetchData();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display font-bold text-foreground">রিভিউ ম্যানেজমেন্ট</h1>
      <div className="grid gap-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">কোনো রিভিউ নেই</p>
          </div>
        ) : reviews.map((r) => (
          <div key={r.id} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex gap-1 mb-1">{[...Array(5)].map((_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "text-honey-gold fill-honey-gold" : "text-border"}`} />)}</div>
                {r.review_text && <p className="text-sm text-foreground/80 mb-2">"{r.review_text}"</p>}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{r.reviewer_name}</span>
                  {r.reviewer_location && <span>{r.reviewer_location}</span>}
                  <span>{new Date(r.created_at).toLocaleDateString("bn-BD")}</span>
                  <span className={`px-2 py-0.5 rounded-full ${r.is_approved ? "bg-success/10 text-success" : "bg-honey-gold/20 text-honey-deep"}`}>{r.is_approved ? "অনুমোদিত" : "পেন্ডিং"}</span>
                </div>
              </div>
              <div className="flex gap-1 shrink-0 ml-3">
                {!r.is_approved && <Button variant="ghost" size="icon" className="h-7 w-7 text-success" onClick={() => approve(r.id, true)}><Check className="h-3.5 w-3.5" /></Button>}
                {r.is_approved && <Button variant="ghost" size="icon" className="h-7 w-7 text-honey-deep" onClick={() => approve(r.id, false)}><X className="h-3.5 w-3.5" /></Button>}
                <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button></AlertDialogTrigger>
                  <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>মুছে ফেলতে চান?</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>বাতিল</AlertDialogCancel><AlertDialogAction onClick={() => del(r.id)} className="bg-destructive text-destructive-foreground">মুছুন</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminReviews;
