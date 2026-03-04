import { Shield, Award, Truck, Headphones } from "lucide-react";

const points = [
  { icon: Award, title: "অথেনটিক পণ্য", desc: "মানসম্মত ও আসল পণ্য" },
  { icon: Truck, title: "দ্রুত ডেলিভারি", desc: "সারাদেশে পৌঁছে যাবে" },
  { icon: Shield, title: "মানি-ব্যাক গ্যারান্টি", desc: "সন্তুষ্ট না হলে ফেরত" },
  { icon: Headphones, title: "সাপোর্ট", desc: "যেকোনো সময় যোগাযোগ" },
];

const KeyPoints = () => (
  <section className="py-10 md:py-14">
    <div className="container">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {points.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="bg-card rounded-xl border border-border p-5 md:p-6 text-center shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="mx-auto w-12 h-12 rounded-full brand-gradient flex items-center justify-center mb-3 group-hover:animate-float">
              <Icon className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="font-semibold text-foreground text-sm md:text-base">{title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default KeyPoints;