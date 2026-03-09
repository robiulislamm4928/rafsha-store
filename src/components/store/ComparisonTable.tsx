import { Check, X, Minus } from "lucide-react";
import logo from "@/assets/logo.png";

type Status = true | false | "partial";

interface ComparisonRow {
  feature: string;
  description: string;
  ours: Status;
  others: Status;
}

const rows: ComparisonRow[] = [
  {
    feature: "১০০% অথেনটিক পণ্য",
    description: "প্রতিটি পণ্য সরাসরি নির্ভরযোগ্য সোর্স থেকে সংগ্রহ করা হয়",
    ours: true,
    others: false,
  },
  {
    feature: "কঠোর মান যাচাই",
    description: "ডেলিভারির আগে প্রতিটি পণ্য পরীক্ষা ও যাচাই করা হয়",
    ours: true,
    others: false,
  },
  {
    feature: "দ্রুত ডেলিভারি (২৪-৭২ ঘণ্টা)",
    description: "ঢাকায় ২৪ ঘণ্টা এবং ঢাকার বাইরে ৪৮-৭২ ঘণ্টায় ডেলিভারি",
    ours: true,
    others: "partial",
  },
  {
    feature: "মানি-ব্যাক গ্যারান্টি",
    description: "পণ্যে সমস্যা হলে সম্পূর্ণ টাকা ফেরত দেওয়া হয়",
    ours: true,
    others: false,
  },
  {
    feature: "২৪/৭ কাস্টমার সাপোর্ট",
    description: "যেকোনো সমস্যায় সব সময় লাইভ চ্যাট ও ফোন সাপোর্ট পাবেন",
    ours: true,
    others: "partial",
  },
  {
    feature: "সেরা মূল্যের নিশ্চয়তা",
    description: "বাজারের সবচেয়ে প্রতিযোগিতামূলক দামে পণ্য পাচ্ছেন",
    ours: true,
    others: false,
  },
  {
    feature: "ক্যাশ অন ডেলিভারি",
    description: "পণ্য হাতে পেয়ে মূল্য পরিশোধের সুবিধা",
    ours: true,
    others: "partial",
  },
  {
    feature: "নিরাপদ অনলাইন পেমেন্ট",
    description: "বিকাশ, নগদ ও অন্যান্য নিরাপদ পেমেন্ট মাধ্যম",
    ours: true,
    others: "partial",
  },
  {
    feature: "সারাদেশে ডেলিভারি",
    description: "বাংলাদেশের যেকোনো জেলায় পণ্য পৌঁছে দেওয়া হয়",
    ours: true,
    others: "partial",
  },
  {
    feature: "অর্ডার ট্র্যাকিং",
    description: "রিয়েল-টাইমে আপনার অর্ডারের অবস্থা জানতে পারবেন",
    ours: true,
    others: false,
  },
];

const StatusIcon = ({ status }: { status: Status }) => {
  if (status === true) return <Check className="h-5 w-5 text-green-500 mx-auto" />;
  if (status === "partial") return <Minus className="h-5 w-5 text-amber-500 mx-auto" />;
  return <X className="h-5 w-5 text-destructive mx-auto" />;
};

const ComparisonTable = () => (
  <section className="py-6 sm:py-10 md:py-16 bg-secondary/20">
    <div className="container">
      <div className="text-center mb-5 sm:mb-8 md:mb-10">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-foreground">
          কেন আমরা আলাদা?
        </h2>
        <p className="text-muted-foreground mt-1.5 sm:mt-2 max-w-xl mx-auto text-xs sm:text-sm md:text-base">
          রাফছা স্টোর এবং অন্যান্য অনলাইন শপের মধ্যে পার্থক্য দেখুন
        </p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-xl border border-border overflow-hidden shadow-sm bg-card">
        <table className="w-full">
          <thead>
            <tr className="brand-gradient text-primary-foreground">
              <th className="text-left p-4 lg:p-5 text-sm font-semibold w-[50%]">বৈশিষ্ট্য</th>
              <th className="text-center p-4 lg:p-5 text-sm font-semibold w-[25%]">
                <img src={logo} alt="রাফছা স্টোর" className="h-7 w-auto mx-auto brightness-0 invert" />
              </th>
              <th className="text-center p-4 lg:p-5 text-sm font-semibold w-[25%]">অন্যান্য শপ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.feature} className={`${i % 2 === 0 ? "bg-card" : "bg-secondary/30"} hover:bg-secondary/50 transition-colors`}>
                <td className="p-4 lg:p-5">
                  <span className="text-sm font-medium text-foreground block">{row.feature}</span>
                  <span className="text-xs text-muted-foreground mt-0.5 block">{row.description}</span>
                </td>
                <td className="p-4 lg:p-5 text-center">
                  <StatusIcon status={row.ours} />
                </td>
                <td className="p-4 lg:p-5 text-center">
                  <StatusIcon status={row.others} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-2 sm:space-y-3">
        <div className="flex items-center justify-between text-[10px] sm:text-xs font-semibold text-muted-foreground px-2 mb-1">
          <span>বৈশিষ্ট্য</span>
          <div className="flex gap-6 sm:gap-8">
            <span className="text-primary">রাফছা</span>
            <span>অন্যান্য</span>
          </div>
        </div>
        {rows.map((row, i) => (
          <div
            key={row.feature}
            className={`rounded-lg border border-border p-2.5 sm:p-3.5 ${i % 2 === 0 ? "bg-card" : "bg-secondary/30"}`}
          >
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="flex-1 min-w-0">
                <span className="text-xs sm:text-sm font-medium text-foreground block">{row.feature}</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 block leading-snug">{row.description}</span>
              </div>
              <div className="flex items-center gap-4 sm:gap-6 shrink-0 pt-0.5">
                <StatusIcon status={row.ours} />
                <StatusIcon status={row.others} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 mt-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-green-500" /> সম্পূর্ণ</span>
        <span className="flex items-center gap-1.5"><Minus className="h-3.5 w-3.5 text-amber-500" /> আংশিক</span>
        <span className="flex items-center gap-1.5"><X className="h-3.5 w-3.5 text-destructive" /> নেই</span>
      </div>
    </div>
  </section>
);

export default ComparisonTable;
