import { Helmet } from "react-helmet-async";
import TopBar from "@/components/store/TopBar";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import { RotateCcw } from "lucide-react";

const ReturnPolicy = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>রিটার্ন পলিসি | রাফছা স্টোর</title>
      <meta name="description" content="রাফছা স্টোরের রিটার্ন ও রিফান্ড পলিসি সম্পর্কে জানুন।" />
    </Helmet>
    <TopBar /><Header />
    <main className="container max-w-3xl mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <RotateCcw className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">রিটার্ন পলিসি</h1>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 md:p-8 space-y-6 text-sm md:text-base text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">রিটার্ন / এক্সচেঞ্জ নীতি</h2>
          <p>পণ্য ডেলিভারির সময় চেক করে নিন। ডেলিভারি ম্যানের সামনে পণ্য চেক না করলে পরবর্তীতে রিটার্ন বা এক্সচেঞ্জ গ্রহণযোগ্য নাও হতে পারে।</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">কখন রিটার্ন গ্রহণযোগ্য?</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>ভুল পণ্য ডেলিভারি হলে</li>
            <li>পণ্য ভাঙা বা ক্ষতিগ্রস্ত অবস্থায় পৌঁছালে</li>
            <li>পণ্যের সাইজ বা কালার অর্ডারের সাথে না মিললে</li>
            <li>পণ্যের গুণগত মান নিম্নমানের হলে</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">রিটার্ন সময়সীমা</h2>
          <p>পণ্য প্রাপ্তির <strong className="text-foreground">৩ দিনের</strong> মধ্যে রিটার্ন রিকোয়েস্ট করতে হবে। এরপর রিটার্ন গ্রহণ করা হবে না।</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">রিফান্ড প্রক্রিয়া</h2>
          <p>রিটার্ন অনুমোদিত হলে পণ্যের মূল্য আপনার পেমেন্ট মাধ্যমে <strong className="text-foreground">৫-৭ কার্যদিবসের</strong> মধ্যে ফেরত দেওয়া হবে। ডেলিভারি চার্জ রিফান্ডযোগ্য নয় (যদি না আমাদের ভুলে ভুল পণ্য পাঠানো হয়)।</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">যোগাযোগ</h2>
          <p>রিটার্ন বা রিফান্ড সম্পর্কিত যেকোনো সমস্যায় আমাদের কাস্টমার সার্ভিসে যোগাযোগ করুন।</p>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default ReturnPolicy;
