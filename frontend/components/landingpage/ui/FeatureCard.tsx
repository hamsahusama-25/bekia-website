type Props = {
  icon: string; // إيموجي
  title: string;
  description: string;
  featured?: boolean; // لو true الكارت يبقى أخضر
  className?: string; // عشان نحدد عرض الكارت في الـ grid من بره
};

export default function FeatureCard({
  icon,
  title,
  description,
  featured = false,
  className = "",
}: Props) {
  return (
    <article
      className={`rounded-3xl border p-9 ${
        featured
          ? "border-emerald-600 bg-emerald-600 text-white shadow-xl shadow-emerald-600/20"
          : "border-slate-200 bg-white text-slate-900"
      } ${className}`}
      // rounded-3xl: حواف مدورة كتير
      // p-9: مسافة داخلية
      // featured ? ... : ...  = شرط: لو مميز خلفية خضرا، وإلا بيضا بإطار رفيع
    >
      <div
        className={`mb-6 grid h-[70px] w-[70px] place-items-center rounded-2xl text-3xl ${
          featured ? "bg-white/20" : "bg-emerald-50"
        }`}
        // المربع الصغير اللي فيه الإيموجي، وإيموجي في نصه (grid + place-items-center)
      >
        {icon}
      </div>
      <h3 className="font-[family-name:var(--font-jakarta)] text-2xl font-bold tracking-tight">
        {title}
      </h3>
      <p
        className={`mt-4 text-lg leading-relaxed ${featured ? "text-white/90" : "text-slate-500"}`}
      >
        {description}
      </p>
    </article>
  );
}
