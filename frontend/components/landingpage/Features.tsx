import SectionTitle from "@/components/landingpage/ui/SectionTitle";
import FeatureCard from "@/components/landingpage/ui/FeatureCard";
import { features } from "@/data/features";

export default function Features() {
  return (
    <section dir="rtl" id="services" className="bg-white py-24">
      {/* id="services": لينك Services في الـ Navbar ينزل هنا */}
      <div className="mx-auto max-w-[1200px] px-6">
        <SectionTitle
          title="منصة واحدة لطرفي الجميع"
          subtitle="مصممة للشركات والمكاتب والمتاجر، وللجامعين المستقلين على حد سواء."
        />

        <div className="mt-14 grid gap-7 lg:grid-cols-6">
          {/* grid بـ 6 أعمدة. الكروت بتاخد 4+2 / 2+4 / 3+3 زي التصميم */}
          {features.map((f) => (
            <FeatureCard
              key={f.title}
              icon={f.icon}
              title={f.title}
              description={f.description}
              featured={f.featured}
              className={f.span}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
