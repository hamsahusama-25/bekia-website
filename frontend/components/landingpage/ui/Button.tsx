import Link from "next/link";
// Link هو بديل <a> في Next: بينقلك بين الصفحات من غير ما يعمل reload كامل

type Variant = "primary" | "white" | "outline";
// نوع TypeScript: الـ variant مينفعش يبقى غير واحدة من التلات قيم دي

const styles: Record<Variant, string> = {
  // object: لكل variant عندنا كلاسات Tailwind بتاعته
  primary: "bg-emerald-600 text-white hover:bg-emerald-700",
  // أخضر بخط أبيض، وعند الوقوف بالماوس (hover) بيغمق شوية
  white: "bg-white text-emerald-600 hover:bg-emerald-50",
  // خلفية بيضا وخط أخضر (زرار Register as User)
  outline: "border border-white/60 text-white hover:bg-white/10",
  // مفيش خلفية، بس إطار أبيض شفاف 60% (زرار Register as Collector)
};

export default function Button({
  href, // الرابط اللي هيروحله الزرار
  variant = "primary", // لو مبعتش variant هيبقى primary
  children, // النص اللي جوه الزرار
  className = "", // كلاسات إضافية لو عايز تعدل على زرار معين
}: {
  href: string;
  variant?: Variant; // علامة ? يعني اختياري
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-xl px-8 py-4 text-base font-semibold transition-colors ${styles[variant]} ${className}`}
      // inline-flex + items-center + justify-center: يوسّط النص جوه الزرار
      // rounded-xl: حواف مدورة
      // px-8 py-4: مسافات داخلية أفقي ورأسي
      // text-base font-semibold: حجم الخط عادي وسُمكه نص-تقيل
      // transition-colors: تغيير اللون بنعومة عند hover
      // ${styles[variant]}: بيحط كلاسات الـ variant المختار
    >
      {children}
    </Link>
  );
}