import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Award, Truck, Headphones } from "lucide-react";

interface KeyPoint {
  id: string;
  title: string;
  description: string;
  icon_url: string | null;
  display_order: number;
}

const fallbackIcons = [Award, Truck, Shield, Headphones];

const KeyPointCard = ({ icon, title, desc, index }: { icon: React.ReactNode; title: string; desc: string; index: number }) => (
  <div className="bg-card rounded-xl border border-border p-4 sm:p-5 md:p-6 text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group gradient-border-hover">
    <div className="relative mx-auto w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-2 sm:mb-3 overflow-hidden">
      <div className="absolute inset-0 brand-gradient opacity-100 group-hover:opacity-0 transition-opacity duration-300" />
      <div className="absolute inset-0 rose-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
    </div>
    <div className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 text-primary text-[10px] sm:text-xs font-bold mb-1.5 sm:mb-2">
      {index + 1}
    </div>
    <h3 className="font-semibold text-foreground text-xs sm:text-sm md:text-base leading-tight">{title}</h3>
    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 leading-snug">{desc}</p>
  </div>
);

const KeyPoints = () => {
  const [points, setPoints] = useState<KeyPoint[]>([]);

  useEffect(() => {
    supabase
      .from("key_points")
      .select("id, title, description, icon_url, display_order")
      .eq("is_active", true)
      .order("display_order")
      .then(({ data }) => {
        if (data && data.length > 0) setPoints(data);
      });
  }, []);

  if (points.length === 0) {
    const staticPoints = [
      { icon: Award, title: "অথেনটিক পণ্য", desc: "মানসম্মত ও আসল পণ্য" },
      { icon: Truck, title: "দ্রুত ডেলিভারি", desc: "সারাদেশে পৌঁছে যাবে" },
      { icon: Shield, title: "মানি-ব্যাক গ্যারান্টি", desc: "সন্তুষ্ট না হলে ফেরত" },
      { icon: Headphones, title: "সাপোর্ট", desc: "যেকোনো সময় যোগাযোগ" },
    ];
    return (
      <section className="py-10 md:py-14">
        <div className="container">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {staticPoints.map(({ icon: Icon, title, desc }, idx) => (
              <KeyPointCard key={title} icon={<Icon className="h-6 w-6 text-primary-foreground" />} title={title} desc={desc} index={idx} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 md:py-14">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {points.map((point, idx) => {
            const FallbackIcon = fallbackIcons[idx % fallbackIcons.length];
            return (
              <KeyPointCard
                key={point.id}
                icon={
                  point.icon_url
                    ? <img src={point.icon_url} alt={point.title} className="h-6 w-6 object-contain filter brightness-0 invert" />
                    : <FallbackIcon className="h-6 w-6 text-primary-foreground" />
                }
                title={point.title}
                desc={point.description}
                index={idx}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default KeyPoints;
