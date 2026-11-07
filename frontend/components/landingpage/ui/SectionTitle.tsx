export default function SectionTitle({
  title,
  subtitle,
}: {
  title: React.ReactNode; // ReactNode بدل string عشان نقدر نحط <br /> في العنوان لو احتجنا
  subtitle?: string; // الوصف اختياري
}) {
  return (
    <div>
      <div className="mb-6 h-1 w-16 rounded bg-emerald-600" />
      {/* الشرطة الخضرا فوق العنوان */}
      <h2 className="font-[family-name:var(--font-jakarta)] text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 max-w-xl text-lg text-slate-500">{subtitle}</p>
      )}
      {/* && معناها: اعرض الفقرة بس لو subtitle موجود */}
    </div>
  );
}
