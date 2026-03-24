import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircleQuestion, Send, ChevronDown, ChevronUp } from "lucide-react";

interface Question {
  id: string;
  question_text: string;
  answer_text: string | null;
  asked_by_name: string;
  is_answered: boolean;
  created_at: string;
}

const ProductQA = ({ productId }: { productId: string }) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    supabase
      .from("product_questions")
      .select("id, question_text, answer_text, asked_by_name, is_answered, created_at")
      .eq("product_id", productId)
      .eq("is_visible", true)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setQuestions((data as Question[]) || []);
        setLoading(false);
      });
  }, [productId]);

  useEffect(() => {
    if (user) {
      supabase.from("users").select("full_name").eq("id", user.id).single().then(({ data }) => {
        if (data?.full_name) setName(data.full_name);
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !questionText.trim()) { toast.error("নাম এবং প্রশ্ন লিখুন"); return; }
    setSubmitting(true);
    const { error } = await supabase.from("product_questions").insert({
      product_id: productId,
      user_id: user?.id || null,
      asked_by_name: name.trim(),
      question_text: questionText.trim(),
    });
    setSubmitting(false);
    if (error) { toast.error("প্রশ্ন জমা দিতে সমস্যা হয়েছে"); return; }
    toast.success("আপনার প্রশ্ন জমা হয়েছে!");
    setQuestionText("");
    setShowForm(false);
  };

  const displayed = showAll ? questions : questions.slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
          <MessageCircleQuestion className="h-5 w-5 text-primary" /> প্রশ্ন ও উত্তর ({questions.length})
        </h3>
        <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
          প্রশ্ন করুন
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-secondary/30 rounded-lg p-4 space-y-3 border border-border">
          <Input placeholder="আপনার নাম" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
          <Textarea placeholder="আপনার প্রশ্ন লিখুন..." value={questionText} onChange={(e) => setQuestionText(e.target.value)} maxLength={500} rows={3} />
          <Button type="submit" size="sm" disabled={submitting} className="brand-gradient text-primary-foreground">
            <Send className="h-4 w-4 mr-1" /> {submitting ? "জমা হচ্ছে..." : "প্রশ্ন পাঠান"}
          </Button>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-16 bg-secondary/30 rounded-lg animate-pulse" />)}</div>
      ) : questions.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">এখনো কোনো প্রশ্ন নেই। প্রথম প্রশ্ন করুন!</p>
      ) : (
        <div className="space-y-3">
          {displayed.map((q) => (
            <div key={q.id} className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold text-sm shrink-0">প্রশ্ন:</span>
                <div className="min-w-0">
                  <p className="text-sm text-foreground">{q.question_text}</p>
                  <p className="text-xs text-muted-foreground mt-1">— {q.asked_by_name}</p>
                </div>
              </div>
              {q.is_answered && q.answer_text && (
                <div className="flex items-start gap-2 mt-3 pt-3 border-t border-border">
                  <span className="text-green-600 font-bold text-sm shrink-0">উত্তর:</span>
                  <p className="text-sm text-foreground">{q.answer_text}</p>
                </div>
              )}
            </div>
          ))}
          {questions.length > 3 && (
            <Button variant="ghost" size="sm" onClick={() => setShowAll(!showAll)} className="w-full">
              {showAll ? <><ChevronUp className="h-4 w-4 mr-1" /> কম দেখুন</> : <><ChevronDown className="h-4 w-4 mr-1" /> সব দেখুন ({questions.length})</>}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductQA;
