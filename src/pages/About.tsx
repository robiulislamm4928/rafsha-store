import TopBar from "@/components/store/TopBar";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import { Helmet } from "react-helmet-async";

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Us | Rafsha Store</title>
        <meta name="description" content="Learn about Rafsha Store - your trusted online marketplace for quality products." />
      </Helmet>
      <TopBar />
      <Header />
      
      <main className="min-h-screen">
        <div className="container py-16">
          {/* Header Section */}
          <div className="max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">আমাদের সম্পর্কে</h1>
            <p className="text-lg text-muted-foreground">রাফছা স্টোরে আপনাকে স্বাগতম — আপনার পছন্দের পণ্যের জন্য বিশ্বস্ত অনলাইন মার্কেটপ্লেস।</p>
          </div>

          {/* About Content */}
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Mission */}
            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4">আমাদের মিশন</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                আমরা বিশ্বাস করি যে গুণমানের পণ্য এবং নির্ভরযোগ্য সেবা সবার জন্য সহজলভ্য হওয়া উচিত। রাফছা স্টোর প্রতিষ্ঠা করা হয়েছে আপনার কেনাকাটার অভিজ্ঞতা আরও সহজ এবং আনন্দদায়ক করার জন্য।
              </p>
            </section>

            {/* Vision */}
            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4">আমাদের দৃষ্টিভঙ্গি</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                আমরা সারাদেশে সেরা মূল্যে সর্বোত্তম মানের পণ্য সরবরাহ করতে প্রতিশ্রুতিবদ্ধ। দ্রুত ডেলিভারি, নিরাপদ পেমেন্ট এবং চমৎকার কাস্টমার সাপোর্ট আমাদের প্রতিশ্রুতি।
              </p>
            </section>

            {/* Why Choose Us */}
            <section>
              <h2 className="text-3xl font-bold text-foreground mb-6">কেন আমাদের বেছে নেবেন?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-secondary/50 rounded-lg border border-border">
                  <h3 className="text-xl font-semibold text-foreground mb-2">গুণমান নিশ্চিত</h3>
                  <p className="text-sm text-muted-foreground">সকল পণ্য সযত্নে নির্বাচিত এবং পরীক্ষিত।</p>
                </div>
                <div className="p-6 bg-secondary/50 rounded-lg border border-border">
                  <h3 className="text-xl font-semibold text-foreground mb-2">দ্রুত ডেলিভারি</h3>
                  <p className="text-sm text-muted-foreground">সারাদেশে নির্ভরযোগ্য ডেলিভারি সেবা।</p>
                </div>
                <div className="p-6 bg-secondary/50 rounded-lg border border-border">
                  <h3 className="text-xl font-semibold text-foreground mb-2">নিরাপদ পেমেন্ট</h3>
                  <p className="text-sm text-muted-foreground">সর্বোচ্চ নিরাপত্তার সাথে একাধিক পেমেন্ট অপশন।</p>
                </div>
                <div className="p-6 bg-secondary/50 rounded-lg border border-border">
                  <h3 className="text-xl font-semibold text-foreground mb-2">২৪/৭ সাপোর্ট</h3>
                  <p className="text-sm text-muted-foreground">সর্বদা আপনার সেবায় নিয়োজিত কাস্টমার টিম।</p>
                </div>
              </div>
            </section>

            {/* Contact CTA */}
            <section className="bg-primary/10 border border-primary/20 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">আমাদের সাথে যোগাযোগ করুন</h2>
              <p className="text-muted-foreground mb-4">আপনার যেকোনো প্রশ্ন বা পরামর্শের জন্য আমাদের সাথে যোগাযোগ করতে দ্বিধা করবেন না।</p>
              <a href="#" className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                যোগাযোগ করুন
              </a>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default About;
