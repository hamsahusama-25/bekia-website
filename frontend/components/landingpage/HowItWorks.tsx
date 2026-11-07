import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { steps } from "@/data/steps";
export default function HowItWorks() {
  return (
    <section dir="rtl" className="bg-[#f7f9fc] px-6 py-20 md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="mb-16">
          <span className="mb-3 block text-sm font-semibold text-emerald-600">
            كيف تعمل إيكو تراك
          </span>

          <h2 className="text-3xl font-extrabold text-slate-900 md:text-4xl">
            خطوات بسيطة لبدء رحلتك معنا
          </h2>

          <p className=" mt-4 max-w-xl text-sm leading-7 text-slate-500">
            من التسجيل وحتى الحصول على الخدمة، نوفر لك تجربة سهلة وموثوقة لإدارة
            النفايات.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-16 md:space-y-20">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex flex-col items-center gap-8 md:gap-12 ${
                index % 2 === 0 ? "md:flex-row-reverse" : "md:flex-row"
              }`}
            >
              {/* Image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl shadow-md md:w-1/2">
                <Image
                  src={step.image}
                  alt={step.imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="w-full md:w-1/2">
                <div className="mb-3 h-0.5 w-5 bg-emerald-500" />

                <span className="text-lg font-semibold text-emerald-600">
                  الخطوة {step.id}
                </span>

                <h3 className="mt-2 text-3xl font-bold text-slate-900">
                  {step.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-slate-500">
                  {step.description}
                </p>

                {/* Features */}
                <ul className="mt-5 space-y-3">
                  {step.points.map((point, pointIndex) => (
                    <li
                      key={pointIndex}
                      className="flex items-center gap-2 text-sm text-slate-700"
                    >
                      <CheckCircle2
                        size={17}
                        className="shrink-0 text-emerald-500"
                      />

                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
