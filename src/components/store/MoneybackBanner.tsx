import { ShieldCheck } from "lucide-react";

const MoneybackBanner = () => (
  <section className="py-10 md:py-14">
    <div className="container">
      <div className="honey-gradient rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-6 text-primary-foreground shadow-lg">
        <div className="shrink-0">
          <div className="w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center animate-float">
            <ShieldCheck className="h-10 w-10" />
          </div>
        </div>
        <div className="text-center md:text-left">
          <h3 className="text-2xl md:text-3xl font-display font-bold">
            ১০০% সন্তুষ্টি গ্যারান্টি
          </h3>
          <p className="mt-2 opacity-90 leading-relaxed max-w-xl">
            আমাদের মধু পরীক্ষা করুন — যদি খাঁটি না হয়, সম্পূর্ণ টাকা ফেরত! কোনো প্রশ্ন করা হবে না।
            আমরা আমাদের পণ্যের মান নিয়ে এতটাই আত্মবিশ্বাসী।
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default MoneybackBanner;
