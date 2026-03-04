import { Check, X } from "lucide-react";

const rows = [
  { feature: "১০০% খাঁটি", ours: true, others: false },
  { feature: "ল্যাব টেস্ট রিপোর্ট", ours: true, others: false },
  { feature: "সুন্দরবন থেকে সংগ্রহ", ours: true, others: false },
  { feature: "ফ্রি ডেলিভারি", ours: true, others: false },
  { feature: "মানি-ব্যাক গ্যারান্টি", ours: true, others: false },
  { feature: "কেমিক্যাল মুক্ত", ours: true, others: false },
];

const ComparisonTable = () => (
  <section className="py-10 md:py-14">
    <div className="container max-w-2xl">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
          কেন আমাদের মধু আলাদা?
        </h2>
      </div>
      <div className="rounded-xl border border-border overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="honey-gradient text-primary-foreground">
              <th className="text-left p-4 text-sm font-semibold">বৈশিষ্ট্য</th>
              <th className="text-center p-4 text-sm font-semibold">🍯 মধুঘর</th>
              <th className="text-center p-4 text-sm font-semibold">অন্যান্য</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.feature} className={i % 2 === 0 ? "bg-card" : "bg-secondary/30"}>
                <td className="p-4 text-sm text-foreground font-medium">{row.feature}</td>
                <td className="p-4 text-center">
                  {row.ours ? (
                    <Check className="h-5 w-5 text-primary mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-destructive mx-auto" />
                  )}
                </td>
                <td className="p-4 text-center">
                  {row.others ? (
                    <Check className="h-5 w-5 text-primary mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-destructive mx-auto" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);

export default ComparisonTable;
