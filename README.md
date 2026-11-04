<<<<<<< HEAD
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
=======
# Loop Eco – Smart Waste Management & Recycling Platform

A full-stack B2B waste management platform that connects companies, waste collectors, and administrators to streamline recycling operations. Companies subscribe to waste collection packages, collectors handle scheduled pickups, and administrators manage and approve collection requests.

## Features

- **Company Dashboard:** Track collected waste, recycling points, monthly targets, and membership levels (Bronze, Silver, Gold).
- **Collector Dashboard:** View daily collection schedules and optimized routes based on geographic location.
- **QR Code Scanning:** Identify companies during scheduled collection visits using QR codes.
- **Waste Collection:** Record waste weights and upload scale images as collection evidence.
- **Admin Dashboard:** Manage collectors, companies, subscription packages, and collection approvals.
- **Collector Verification:** Review and approve collector applications and uploaded documents.
- **Geolocation Validation:** Verify collector proximity to company locations when reporting unsuccessful visits.
- **Authentication & Authorization:** Secure login, registration, JWT authentication, and role-based access control.

## Tech stack

- [Next.js](https://nextjs.org/) (App Router) + React
- [Tailwind CSS](https://tailwindcss.com/) v4
- [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/) v5
- [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/)
- [Zod](https://zod.dev/) for request validation
- JWT for authentication and authorization
- [Docker](https://www.docker.com/) + Docker Compose
- [GitHub Actions](https://github.com/features/actions) for CI

## Getting started

### Prerequisites

- Node.js 22 or later
- Docker Desktop and Docker Compose

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/hamsahusama-25/bekia-website.git
cd loop-eco

# 2. Configure environment variables
cp .env.example .env

# 3. Start the application
docker compose up -d --build

# 4. Seed the database with demo data
docker compose exec backend npm run seed
```

Open [http://localhost:3000](http://localhost:3000).

The backend API runs at [http://localhost:5000](http://localhost:5000).

## Project structure

```text
loop-eco/
├── .github/
│   ├── workflows/          # GitHub Actions CI
│   └── pull_request_template.md
├── backend/
│   ├── src/
│   │   ├── config.js       # Application configuration
│   │   ├── middleware/     # Authentication, uploads, error handling
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API endpoints
│   │   ├── lib/            # Shared utilities
│   │   ├── schemas.js      # Request validation schemas
│   │   ├── app.js          # Express application
│   │   ├── server.js       # API server
│   │   ├── migrate.js      # Database migration
│   │   └── seed.js         # Demo data
│   └── test/               # Backend tests
├── frontend/
│   ├── app/
│   │   ├── admin/          # Admin dashboard
│   │   ├── collector/      # Collector dashboard
│   │   ├── company/        # Company dashboard
│   │   ├── register/       # Registration page
│   │   └── login/          # Login page
│   ├── components/         # Reusable UI components
│   ├── lib/                # API, geolocation and route guards
│   └── public/             # Static assets
├── docs/                   # Technical documentation
│   ├── adr/                # Architecture Decision Records
│   ├── 01-context-diagram.md
│   ├── 02-system-architecture.md
│   ├── 03-erd.md
│   ├── 06-api.md
│   └── ...
├── docker-compose.yml
├── .env.example
├── .gitignore
├── CONTRIBUTING.md
└── README.md
```

## Main user flows

1. **Company:** Register → Login → View dashboard → Track recycling activity, points, and monthly targets.
2. **Collector:** Register → Submit documents → Wait for admin approval → View daily route → Scan company QR code → Record waste weights and upload scale evidence.
3. **Admin:** Review collector applications → Manage companies and packages → Schedule collection visits → Approve completed pickups.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start frontend development server |
| `npm run build` | Build frontend for production |
| `npm run start` | Start frontend production server |
| `npm run dev` | Start backend in development mode |
| `npm start` | Start backend server |
| `npm test` | Run backend tests |
| `npm run seed` | Seed database with demo data |
| `npm run migrate` | Run database migrations |

*Run frontend scripts inside `frontend/` and backend scripts inside `backend/`.*

## Documentation

Technical documentation is available in the `docs/` directory, including:

- System architecture and context diagrams
- Entity Relationship Diagram (ERD)
- API documentation
- Main user journey and sequence diagrams
- Security and trust boundaries
- Deployment architecture
- Testing strategy
- Architecture Decision Records (ADRs)

## Status

MVP in development. Core company, collector, and admin workflows are implemented, with additional features and improvements planned.
>>>>>>> f0caceabb0b079ef7c3def6c84bccc91d2d00589
