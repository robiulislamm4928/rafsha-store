import { Check, X } from "lucide-react";
import logo from "@/assets/logo.png";

const rows = [
  { feature: "অথেনটিক পণ্য", ours: true, others: false },
  { feature: "মান যাচাইকৃত", ours: true, others: false },
  { feature: "দ্রুত ডেলিভারি", ours: true, others: false },
  { feature: "মানি-ব্যাক গ্যারান্টি", ours: true, others: false },
  { feature: "কাস্টমার সাপোর্ট", ours: true, others: false },
  { feature: "সেরা মূল্য", ours: true, others: false },
];

const ComparisonTable = () => (
  <section className="py-10 md:py-14">
    <div className="container max-w-2xl">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
          কেন আমরা আলাদা?
        </h2>
      </div>
      <div className="rounded-xl border border-border overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="brand-gradient text-primary-foreground">
              <th className="text-left p-4 text-sm font-semibold">বৈশিষ্ট্য</th>
              <th className="text-center p-4 text-sm font-semibold">
                <img src={logo} alt="রাফছা স্টোর" className="h-6 w-auto mx-auto brightness-0 invert" />
              </th>
              <th className="text-center p-4 text-sm font-semibold">অন্যান্য</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.feature} className={i % 2 === 0 ? "bg-card" : "bg-secondary/30"}>
                <td className="p-4 text-sm text-foreground font-medium">{row.feature}</td>
                <td className="p-4 text-center">
                  {row.ours ? (
                    <Check className="h-5 w-5 text-success mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-destructive mx-auto" />
                  )}
                </td>
                <td className="p-4 text-center">
                  {row.others ? (
                    <Check className="h-5 w-5 text-success mx-auto" />
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