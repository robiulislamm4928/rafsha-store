import { Helmet } from "react-helmet-async";
import TopBar from "@/components/store/TopBar";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "অর্ডার করতে কি একাউন্ট থাকতে হবে?",
    a: "না, একাউন্ট ছাড়াও অর্ডার করা যায়। তবে একাউন্ট থাকলে অর্ডার হিস্ট্রি দেখতে ও দ্রুত চেকআউট করতে পারবেন।",
  },
  {
    q: "ডেলিভারিতে কত দিন সময় লাগে?",
    a: "ঢাকার ভেতরে সাধারণত ১-৩ কার্যদিবস এবং ঢাকার বাইরে ৩-৫ কার্যদিবস সময় লাগে। তবে বিশেষ পরিস্থিতিতে সামান্য বিলম্ব হতে পারে।",
  },
  {
    q: "ডেলিভারি চার্জ কত?",
    a: "ডেলিভারি চার্জ আপনার জেলার উপর নির্ভর করে। চেকআউট পেজে জেলা সিলেক্ট করলে ডেলিভারি চার্জ স্বয়ংক্রিয়ভাবে দেখানো হবে।",
  },
  {
    q: "কোন কোন পেমেন্ট মেথড গ্রহণযোগ্য?",
    a: "আমরা ক্যাশ অন ডেলিভারি (COD), বিকাশ এবং নগদ পেমেন্ট গ্রহণ করি।",
  },
  {
    q: "পণ্য রিটার্ন করতে চাইলে কী করব?",
    a: "পণ্য প্রাপ্তির ৩ দিনের মধ্যে আমাদের কাস্টমার সার্ভিসে যোগাযোগ করুন। বিস্তারিত জানতে আমাদের রিটার্ন পলিসি পেজ দেখুন।",
  },
  {
    q: "পণ্যের গুণগত মান কেমন?",
    a: "আমরা সকল পণ্যের গুণগত মান নিশ্চিত করি। কোনো সমস্যা হলে আমাদের সাথে যোগাযোগ করুন, আমরা দ্রুত সমাধান করব।",
  },
  {
    q: "পাসওয়ার্ড ভুলে গেলে কী করব?",
    a: "লগইন পেজে 'পাসওয়ার্ড ভুলে গেছেন?' লিংকে ক্লিক করুন। আপনার ইমেইলে একটি রিসেট লিংক পাঠানো হবে।",
  },
  {
    q: "স্টক শেষ পণ্য কি আবার পাওয়া যাবে?",
    a: "হ্যাঁ, বেশিরভাগ পণ্য পুনরায় স্টকে আসে। আপডেটের জন্য আমাদের সোশ্যাল মিডিয়া পেজ ফলো করুন।",
  },
];

const FAQ = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>সাধারণ জিজ্ঞাসা (FAQ) | রাফছা স্টোর</title>
      <meta name="description" content="রাফছা স্টোর সম্পর্কে সাধারণ প্রশ্ন ও উত্তর — অর্ডার, ডেলিভারি, পেমেন্ট, রিটার্ন এবং আরও অনেক কিছু।" />
      <meta property="og:title" content="সাধারণ জিজ্ঞাসা (FAQ) | রাফছা স্টোর" />
      <meta property="og:description" content="রাফছা স্টোর সম্পর্কে সাধারণ প্রশ্ন ও উত্তর — অর্ডার, ডেলিভারি, পেমেন্ট, রিটার্ন।" />
      <meta property="og:url" content="https://rafsha-store.lovable.app/faq" />
      <meta property="og:type" content="website" />
      <link rel="canonical" href="https://rafsha-store.lovable.app/faq" />
      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a }
        }))
      })}</script>
    </Helmet>
    <TopBar /><Header />
    <main className="container max-w-3xl mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <HelpCircle className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">সাধারণ জিজ্ঞাসা</h1>
      </div>

      <div className="bg-card rounded-xl border border-border p-4 sm:p-6 md:p-8">
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-lg px-4 data-[state=open]:bg-primary/5">
              <AccordionTrigger className="text-sm sm:text-base font-medium text-foreground hover:no-underline py-4 text-left">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="mt-8 bg-primary/5 rounded-xl border border-border p-6 text-center">
        <p className="text-foreground font-medium mb-1">আপনার প্রশ্নের উত্তর খুঁজে পাননি?</p>
        <p className="text-sm text-muted-foreground">আমাদের চ্যাট উইজেট ব্যবহার করুন অথবা সরাসরি যোগাযোগ করুন।</p>
      </div>
    </main>
    <Footer />
  </div>
);

export default FAQ;
