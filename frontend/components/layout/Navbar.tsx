import Link from "next/link";
import { Phone } from "lucide-react"; // أيقونة التليفون من المكتبة اللي نزلناها
import Button from "@/components/landingpage/ui/Button"; // @ معناها فولدر src

const links = [
  { label: "التواصل", href: "/#contact" },
  { label: "الأسعار", href: "/#subscription" }, // #services يعني ينزل لسكشن id="services"
  { label: "الخدمات", href: "/#services" },
  { label: "الرئيسيه", href: "/" },
];
// حطيناهم في array عشان نعمل لوب بدل ما نكرر الكود 3 مرات

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur">
      {/* sticky top-0: يلزق فوق وانت بتسكرول */}
      {/* z-50: يفضل فوق باقي العناصر */}
      {/* border-b: خط رفيع تحت */}
      {/* bg-white/90 backdrop-blur: خلفية بيضا شبه شفافة مع تغبيش اللي وراها */}

      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        {/* mx-auto: يوسّط الحاوية أفقيًا */}
        {/* flex + items-center + justify-between: عناصر جنب بعض، متوسطة رأسيًا، وموزعة (شمال - نص - يمين) */}
        {/* h-[84px]: ارتفاع 84 بكسل بالظبط زي التصميم */}
        {/* max-w-[1360px]: أقصى عرض للمحتوى */}
        {/* px-6: مسافة على الجنبين */}
        <div className="flex items-center gap-4">
          <a
            href="tel:+14155550134"
            className="hidden items-center gap-2 font-semibold text-slate-700 lg:flex"
          >
            {/* tel: يخلي الضغطة تتصل بالرقم من الموبايل */}
            {/* hidden lg:flex: يظهر بس في الشاشات الكبيرة */}
            <Phone className="h-5 w-5 text-emerald-600" />
            (415) 555-0134
          </a>
          <Button href="/register" className="!px-6 !py-3">
            التسجيل
          </Button>
          {/* علامة ! قبل الكلاس تفرض الكلاس يتغلب على الافتراضي، عشان الزرار يبقى أصغر هنا */}
        </div>

        <nav className="hidden gap-10 md:flex">
          {/* hidden: مخفي في الموبايل. md:flex: يظهر من الشاشات المتوسطة وطالع */}
          {links.map((l) => (
            // map: بيعدي على كل لينك ويعمله <Link>
            <Link
              key={l.label}
              href={l.href}
              className="text-slate-600 hover:text-emerald-600"
            >
              {/* key لازم في أي لوب عشان React يفرق بين العناصر */}
              {l.label}
            </Link>
          ))}
        </nav>

        <Link href="/" className="flex items-center gap-3">
          {/* اللوجو: بيرجعك للرئيسية. gap-3 مسافة بين الحرف والاسم */}
          <span className="font-[family-name:var(--font-jakarta)] text-2xl font-bold">
            Bekia
          </span>
          {/* font-[family-name:...]: بنستخدم خط Jakarta اللي هنعرفه في layout.tsx */}
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-600 text-lg font-bold text-white">
            B{/* مربع أخضر 44x44 والحرف E في نصه (grid + place-items-center) */}
          </span>
        </Link>
      </div>
    </header>
  );
}
