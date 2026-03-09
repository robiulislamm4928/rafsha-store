import { Helmet } from "react-helmet-async";
import TopBar from "@/components/store/TopBar";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import { Shield } from "lucide-react";

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>প্রাইভেসি পলিসি | রাফছা স্টোর</title>
      <meta name="description" content="রাফছা স্টোরের প্রাইভেসি পলিসি — আপনার তথ্যের নিরাপত্তা আমাদের অগ্রাধিকার।" />
    </Helmet>
    <TopBar /><Header />
    <main className="container max-w-3xl mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">প্রাইভেসি পলিসি</h1>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 md:p-8 space-y-6 text-sm md:text-base text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">আমরা কী তথ্য সংগ্রহ করি?</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>নাম, ইমেইল, ফোন নম্বর (অ্যাকাউন্ট তৈরি ও অর্ডারের জন্য)</li>
            <li>ডেলিভারি ঠিকানা (পণ্য পৌঁছানোর জন্য)</li>
            <li>পেমেন্ট তথ্য (লেনদেন সম্পন্ন করার জন্য)</li>
            <li>ব্রাউজার ও ডিভাইস তথ্য (ওয়েবসাইট উন্নত করার জন্য)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">তথ্য কীভাবে ব্যবহার করা হয়?</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>অর্ডার প্রসেস ও ডেলিভারি সম্পন্ন করতে</li>
            <li>কাস্টমার সার্ভিস প্রদান করতে</li>
            <li>অ্যাকাউন্ট পরিচালনা ও নিরাপত্তা নিশ্চিত করতে</li>
            <li>ওয়েবসাইটের অভিজ্ঞতা উন্নত করতে</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">তথ্যের নিরাপত্তা</h2>
          <p>আপনার ব্যক্তিগত তথ্য সুরক্ষিত রাখতে আমরা আধুনিক নিরাপত্তা ব্যবস্থা ব্যবহার করি। আপনার তথ্য কোনো তৃতীয় পক্ষের কাছে বিক্রি বা ভাড়া দেওয়া হয় না।</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">তৃতীয় পক্ষের সেবা</h2>
          <p>পেমেন্ট প্রসেসিং ও ডেলিভারি সেবার জন্য আমরা বিশ্বস্ত তৃতীয় পক্ষের সাথে কাজ করি। তারা শুধুমাত্র সেবা প্রদানের জন্য প্রয়োজনীয় তথ্য পায়।</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">কুকি ব্যবহার</h2>
          <p>আমাদের ওয়েবসাইট আপনার ব্রাউজিং অভিজ্ঞতা উন্নত করতে কুকি ব্যবহার করে। আপনি ব্রাউজার সেটিংস থেকে কুকি নিয়ন্ত্রণ করতে পারেন।</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">আপনার অধিকার</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>আপনার তথ্য দেখা, সংশোধন বা মুছে ফেলার অনুরোধ করতে পারেন</li>
            <li>যেকোনো সময় আপনার অ্যাকাউন্ট বন্ধ করতে পারেন</li>
            <li>প্রাইভেসি সংক্রান্ত প্রশ্নে আমাদের সাথে যোগাযোগ করতে পারেন</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">পলিসি পরিবর্তন</h2>
          <p>এই প্রাইভেসি পলিসি যেকোনো সময় আপডেট হতে পারে। পরিবর্তনগুলো ওয়েবসাইটে প্রকাশের সাথে সাথে কার্যকর হবে।</p>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default PrivacyPolicy;
