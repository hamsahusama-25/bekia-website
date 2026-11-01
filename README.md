# Loop Eco

منصة ويب B2B لإدارة المخلفات وإعادة التدوير (بلاستيك، ورق، زجاج، معادن/كانزات). الشركة تشترك في باقة، مندوب يمر عليها بجدول، يمسح كود QR الخاص بالشركة ويسجل الوزن بصورة الميزان، والأدمن يعتمد الشحنة فتتحدث نقاط الشركة وتارجتها الشهري.

## أول رحلة مستخدم (المنفذة في الـ MVP)

```
أدمن يقبل المندوب ──► أدمن يجدول زيارة (ينشأ كود QR) ──► المندوب يفتح مسار اليوم (الأقرب أولًا)
   ──► يمسح QR الشركة + يدخل الأوزان + يرفع صورة الميزان ──► أدمن يعتمد الشحنة
   ──► الشركة ترى الوزن الجديد ومستواها (Bronze/Silver/Gold) ونقاط محفظتها
```

وحالة الفشل: المندوب يضغط "مغلقة / لا استجابة" فيتحقق السيرفر بالـ GPS إنه فعلًا قريب (≤ 500 م) من الشركة.

## التقنيات

| الطبقة | التقنية |
|---|---|
| الواجهة | Next.js (App Router) + Tailwind، عربي RTL، شاشة المندوب Mobile-first بملف PWA manifest |
| الـ API | Node.js 22 + Express 5 + Zod + JWT (RBAC) |
| قاعدة البيانات | MongoDB 7 + Mongoose، فهرس `2dsphere` و `$geoNear` لترتيب المسار (بدون أي خدمة خرائط مدفوعة) |
| التشغيل | Docker Compose (3 حاويات) |

## ابدأ بسرعة

```bash
cp .env.example .env     # غيّر JWT_SECRET
docker compose up -d --build
docker compose exec backend npm run seed
```

ثم افتح http://localhost:3000. التفاصيل الكاملة وقواعد العمل في **[CONTRIBUTING.md](CONTRIBUTING.md)**.

## الوثائق

| الملف | المحتوى |
|---|---|
| [docs/00-first-user-journey.md](docs/00-first-user-journey.md) | أول User Journey وقواعد العمل ونطاق الـ MVP |
| [docs/01-context-diagram.md](docs/01-context-diagram.md) | Context Diagram |
| [docs/02-system-architecture.md](docs/02-system-architecture.md) | System Architecture Diagram |
| [docs/03-erd.md](docs/03-erd.md) | ERD / Entity Model |
| [docs/04-sequence-main.md](docs/04-sequence-main.md) | Sequence Diagram: الرحلة الأساسية |
| [docs/05-sequence-failure.md](docs/05-sequence-failure.md) | Sequence Diagram: حالات الفشل |
| [docs/06-api.md](docs/06-api.md) | API Contract والتوثيق |
| [docs/07-trust-boundaries.md](docs/07-trust-boundaries.md) | Trust Boundaries |
| [docs/08-deployment.md](docs/08-deployment.md) | Deployment Diagram |
| [docs/adr/ADR-002-architecture-style.md](docs/adr/ADR-002-architecture-style.md) | ADR-002: نمط المعمارية |
| [docs/adr/ADR-003-free-geo-routing-and-qr.md](docs/adr/ADR-003-free-geo-routing-and-qr.md) | ADR-003: التوجيه الجغرافي المجاني وبروتوكول QR |
| [docs/09-testing.md](docs/09-testing.md) | خطة الاختبار والنتائج والحدود المعروفة |

الدياجرامز مكتوبة بـ [Mermaid](https://mermaid.js.org)، بتتعرض تلقائيًا على GitHub وفي VS Code (إضافة Mermaid).

## هيكل المشروع

```
backend/    Express API  (src/routes, middleware, models, lib) + test/
frontend/   Next.js      (app/ للصفحات، components/، lib/)
docs/       الوثائق الهندسية و ADRs
.github/    CI و PR template
```

## خارج نطاق الـ MVP (مقصود)

الشكاوى والاقتراحات، استبدال النقاط بخصم فعلي، خريطة الأدمن (Leaflet)، التحقق الحقيقي من بصمة الوجه، الإشعارات، التخزين السحابي للصور، والعمل بدون إنترنت (Service Worker). كلها مذكورة بتفاصيلها في `docs/00-first-user-journey.md`.
