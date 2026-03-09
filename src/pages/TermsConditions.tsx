import { Helmet } from "react-helmet-async";
import TopBar from "@/components/store/TopBar";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import { FileText } from "lucide-react";

const TermsConditions = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>শর্তাবলী | রাফছা স্টোর</title>
      <meta name="description" content="রাফছা স্টোরের ব্যবহারের শর্তাবলী সম্পর্কে জানুন।" />
    </Helmet>
    <TopBar /><Header />
    <main className="container max-w-3xl mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">শর্তাবলী</h1>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 md:p-8 space-y-6 text-sm md:text-base text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">সাধারণ শর্তাবলী</h2>
          <p>আমাদের ওয়েবসাইট ব্যবহার করার মাধ্যমে আপনি এই শর্তাবলী মেনে নিচ্ছেন। অনুগ্রহ করে সম্পূর্ণ শর্তাবলী মনোযোগ সহকারে পড়ুন।</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">অ্যাকাউন্ট</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>আপনি সঠিক ও আপ-টু-ডেট তথ্য প্রদান করতে বাধ্য</li>
            <li>আপনার অ্যাকাউন্টের নিরাপত্তা আপনার দায়িত্ব</li>
            <li>অন্যের অ্যাকাউন্ট ব্যবহার করা নিষিদ্ধ</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">অর্ডার ও পেমেন্ট</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>পণ্যের মূল্য যেকোনো সময় পরিবর্তন হতে পারে</li>
            <li>অর্ডার কনফার্ম হওয়ার পর আমরা পণ্য প্রস্তুত ও শিপ করি</li>
            <li>স্টক শেষ হলে অর্ডার বাতিল ও রিফান্ড করা হবে</li>
            <li>ক্যাশ অন ডেলিভারি (COD) ও অনলাইন পেমেন্ট গ্রহণযোগ্য</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">ডেলিভারি</h2>
          <p>সারাদেশে ডেলিভারি দেওয়া হয়। ঢাকার ভেতরে সাধারণত <strong className="text-foreground">১-৩ দিন</strong> এবং ঢাকার বাইরে <strong className="text-foreground">৩-৫ দিন</strong> সময় লাগে। প্রাকৃতিক দুর্যোগ বা অন্যান্য অনিয়ন্ত্রিত কারণে ডেলিভারি বিলম্ব হতে পারে।</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">দায়বদ্ধতার সীমাবদ্ধতা</h2>
          <p>আমরা পণ্যের গুণগত মান নিশ্চিত করার সর্বোচ্চ চেষ্টা করি। তবে ওয়েবসাইটে প্রদর্শিত ছবি ও প্রকৃত পণ্যের মধ্যে সামান্য পার্থক্য থাকতে পারে।</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">পরিবর্তন</h2>
          <p>আমরা যেকোনো সময় এই শর্তাবলী পরিবর্তন করার অধিকার রাখি। পরিবর্তিত শর্তাবলী ওয়েবসাইটে প্রকাশের পর থেকে কার্যকর হবে।</p>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default TermsConditions;
