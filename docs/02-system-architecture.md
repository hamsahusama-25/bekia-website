# 02 — System Architecture Diagram

> **Owner:** Seat 5 & Seat 9 · النمط: **Modular Monolith** للـ API + واجهة Next.js واحدة (انظر `adr/ADR-002-architecture-style.md`).

```mermaid
flowchart TB
    subgraph Clients["Browsers"]
        CW["Company dashboard<br/>/company"]
        CP["Collector PWA<br/>/collector"]
        AD["Admin center<br/>/admin"]
    end

    subgraph FE["Frontend container: Next.js 16"]
        Pages["App Router pages + Tailwind (RTL)"]
        Rewrite["Rewrite /api/* to backend<br/>(same origin, no CORS)"]
    end

    subgraph BE["Backend container: Express 5"]
        direction TB
        MW["Middleware chain<br/>helmet, request id + access log,<br/>JSON parser 100 kb"]
        Auth["requireAuth(roles)<br/>JWT HS256 + RBAC"]
        Val["Zod validation<br/>+ multer (5 MB, memory)"]
        subgraph Mods["Route modules"]
            R1["auth / packages"]
            R2["company"]
            R3["collector<br/>(smart route, documents)"]
            R4["pickups<br/>(complete, no-show)"]
            R5["admin<br/>(approve, schedule, stats)"]
            R6["files (admin only)"]
        end
        Lib["lib: geo, points, dates,<br/>files (magic-byte check), logger (redaction)"]
        EH["Error handler<br/>uniform JSON envelope"]
    end

    subgraph DB["MongoDB 7"]
        Cols[("users, companies, collectors,<br/>packages, pickups")]
        Geo["2dsphere index<br/>companies.location"]
    end

    Vol[("uploads volume<br/>generated file names")]

    CW --> Pages
    CP --> Pages
    AD --> Pages
    Pages --> Rewrite --> MW --> Auth --> Val --> Mods
    Mods --> Lib
    Mods --> Cols
    R3 -. "$geoNear" .-> Geo
    R3 --> Vol
    R4 --> Vol
    R6 --> Vol
    Mods --> EH
```

## الطبقات

| الطبقة | المسؤولية | أين |
|---|---|---|
| **Frontend** | الشاشات، حالات Loading/Empty/Error، تخزين الجلسة، تحويل الأخطاء لرسائل عربي | `frontend/app`, `components`, `lib` |
| **API** | قواعد العمل والصلاحيات والتحقق | `backend/src/routes`, `middleware`, `schemas.js` |
| **Domain helpers** | دوال نقية قابلة للاختبار: المسافة، النقاط، التواريخ، فحص الصور | `backend/src/lib` |
| **Data** | collections وفهارس وقيود التفرد | `backend/src/models` |

## قرارات تصميم مهمة

- **نفس الـ origin:** المتصفح يكلم `/api/...` على بورت الواجهة، و Next يحوّل الطلب للـ backend. مفيش CORS ولا عنوان backend في كود المتصفح.
- **شكل رد موحد:** `{ success, requestId, data }` أو `{ success: false, requestId, error: { code, message } }`.
- **الـ Express app مفصول عن الاتصال بقاعدة البيانات** (`app.js` مقابل `server.js`) فاختبارات الأمان تشتغل بدون Mongo.
- **تحديثات الحالة ذرية:** `findOneAndUpdate` بشرط الحالة، فلو ضغط المندوب مرتين أو اعتمد أدمنان في نفس اللحظة، واحد بس ينجح والتاني يأخذ `409`.
- **الوزن الشهري محسوب مش مخزن** (من `approvedMonth`)، فمفيش عدادات تتصفّر أو تتأخر.
