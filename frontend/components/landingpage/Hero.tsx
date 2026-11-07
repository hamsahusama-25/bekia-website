import Image from "next/image"; // كومبوننت الصور في Next: بيصغّر الصورة ويحسّن تحميلها
import Button from "@/components/landingpage/ui/Button";

export default function Hero() {
  return (
    <section
      dir="rtl"
      className="relative isolate flex flex-row-reverse min-h-[calc(100vh-84px)] items-center overflow-hidden bg-emerald-800"
    >
      {/* relative: عشان العناصر absolute جواه تتحط بالنسبة له */}
      {/* isolate: يعزل الطبقات (z-index) جوه السكشن بس */}
      {/* min-h-[calc(100vh-84px)]: أقل ارتفاع = الشاشة كلها ناقص الـ Navbar */}
      {/* overflow-hidden: أي حاجة تطلع بره السكشن تتقص */}
      {/* bg-emerald-800: لون احتياطي لو الصورة اتأخرت */}

      <Image
        src="/images/hero.jpg" // المسار بيبدأ من فولدر public
        alt="Collector and customer using the EcoTrack app" // وصف للصورة (مهم لقارئات الشاشة)
        fill // الصورة تملا الحاوية كلها
        priority // حمّلها فورًا لأنها أول حاجة بتظهر
        className="-z-20 object-cover object-right"
        // -z-20: تروح ورا كل حاجة
        // object-cover: تملا المساحة من غير ما تتشوه
        // object-right: تثبّت الجزء اليمين من الصورة
      />

      <div className="absolute inset-0 -z-10 bg-gradient-to-l from-emerald-600/90 via-emerald-800/65 to-emerald-900/5" />
      {/* طبقة تدرج فوق الصورة: absolute inset-0 يملا السكشن */}
      {/* -z-10: فوق الصورة (-20) وتحت الكلام (0) */}
      {/* bg-gradient-to-r: تدرج من الشمال لليمين */}
      {/* from / via / to: ألوان التدرج. أخضر كامل شمال، وشفاف تقريبًا يمين عشان الصورة تظهر */}

      <div className="mx-auto w-full max-w-[1200px] px-10 py-20">
        {/* حاوية المحتوى: متوسطة، بنفس عرض الـ Navbar، و py-20 مسافة فوق وتحت */}
        <div className="max-w-3xl">
          {/* نحدد عرض الكلام عشان ميتمددش على الصورة */}

          <span className="inline-block rounded-full border border-white/30 bg-white/10 px-5 py-2 text-sm font-medium text-white">
            إداره النفايات الذكية ببساطة
            {/* الكبسولة الصغيرة: rounded-full يخليها بيضاوية، وخلفية بيضا شفافة 10% */}
          </span>

          <h1 className="mt-8  font-[family-name:var(--font-jakarta)] text-5xl font-extrabold leading-[1.4] tracking-tight text-white md:text-7xl">
            {/* mt-8: مسافة من فوق */}
            {/* text-5xl في الموبايل و md:text-7xl في الشاشات الأكبر (الخط يكبر) */}
            {/* leading-[1.05]: المسافة بين السطور ضيقة */}
            {/* tracking-tight: الحروف قريبة من بعض شوية */}
            <p> جمع نفايات أذكى </p>
            <p> لشركتك ومكتبك</p>
          </h1>

          <p className="mt-8 max-w-2xl text-xl leading-relaxed text-white/90">
            {/* الفقرة: max-w-2xl تحدد عرضها، leading-relaxed تباعد سطور مريح، و text-white/90 أبيض 90% */}
            تربط إيكو كولكت الشركات والمكاتب والمتاجر بجامعي نفايات موثوقين.
            اختر باقتك، وحدّد وتيرة الجمع، وثبّت موقع مقرك على الخريطة — ونحن
            نتولى الباقي..
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            {/* flex-wrap: الزراير تنزل سطر تاني لو الشاشة ضيقة */}
            <Button href="/login" variant="white">
              إبدأ الآن
            </Button>
            <Button href="/login" variant="outline">
              كن جامعاً
            </Button>
            {/* ?role=user بيتبعت في الرابط عشان صفحة التسجيل تعرف أنهي دور اتختار */}
          </div>
        </div>
      </div>
    </section>
  );
}
