import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2, Send, Eye, EyeOff } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Question {
  id: string;
  product_id: string;
  question_text: string;
  answer_text: string | null;
  asked_by_name: string;
  is_answered: boolean;
  is_visible: boolean;
  created_at: string;
  product_name?: string;
}

const AdminQA = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const fetchQuestions = async () => {
    const { data } = await supabase
      .from("product_questions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (data) {
      const prodIds = [...new Set(data.map((q: any) => q.product_id))];
      const { data: prods } = await supabase.from("products").select("id, name").in("id", prodIds);
      const nameMap: Record<string, string> = {};
      prods?.forEach((p: any) => { nameMap[p.id] = p.name; });
      setQuestions(data.map((q: any) => ({ ...q, product_name: nameMap[q.product_id] || "অজানা" })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchQuestions(); }, []);

  const submitAnswer = async (id: string) => {
    const answer = answers[id]?.trim();
    if (!answer) { toast.error("উত্তর লিখুন"); return; }
    const { error } = await supabase.from("product_questions").update({ answer_text: answer, is_answered: true, answered_at: new Date().toISOString() }).eq("id", id);
    if (error) { toast.error("সমস্যা হয়েছে"); return; }
    toast.success("উত্তর দেওয়া হয়েছে");
    setAnswers((p) => ({ ...p, [id]: "" }));
    fetchQuestions();
  };

  const toggleVisibility = async (id: string, visible: boolean) => {
    await supabase.from("product_questions").update({ is_visible: !visible }).eq("id", id);
    fetchQuestions();
  };

  const deleteQuestion = async (id: string) => {
    await supabase.from("product_questions").delete().eq("id", id);
    toast.success("মুছে ফেলা হয়েছে");
    fetchQuestions();
  };

  if (loading) return <div className="space-y-4"><div className="h-8 w-48 bg-secondary animate-pulse rounded" />{[1,2,3].map(i=><div key={i} className="h-24 bg-secondary animate-pulse rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">প্রশ্ন ও উত্তর</h1>
      {questions.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">কোনো প্রশ্ন নেই</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <Card key={q.id} className={!q.is_visible ? "opacity-50" : ""}>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{q.question_text}</p>
                    <p className="text-xs text-muted-foreground mt-1">— {q.asked_by_name} • {q.product_name}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {q.is_answered ? <Badge className="bg-green-100 text-green-700 border-green-200">উত্তর দেওয়া</Badge> : <Badge variant="secondary">অপেক্ষমান</Badge>}
                  </div>
                </div>

                {q.is_answered && q.answer_text && (
                  <div className="bg-secondary/30 rounded-lg p-3">
                    <p className="text-sm text-foreground">{q.answer_text}</p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Textarea
                    placeholder="উত্তর লিখুন..."
                    value={answers[q.id] || q.answer_text || ""}
                    onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                    rows={2}
                    className="text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => submitAnswer(q.id)}><Send className="h-3 w-3 mr-1" /> উত্তর দিন</Button>
                  <Button size="sm" variant="outline" onClick={() => toggleVisibility(q.id, q.is_visible)}>
                    {q.is_visible ? <><EyeOff className="h-3 w-3 mr-1" /> লুকান</> : <><Eye className="h-3 w-3 mr-1" /> দেখান</>}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button size="sm" variant="destructive"><Trash2 className="h-3 w-3" /></Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>মুছে ফেলবেন?</AlertDialogTitle><AlertDialogDescription>এই প্রশ্ন স্থায়ীভাবে মুছে যাবে।</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>বাতিল</AlertDialogCancel><AlertDialogAction onClick={() => deleteQuestion(q.id)}>মুছুন</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminQA;
