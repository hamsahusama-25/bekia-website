# 03 — ERD / Entity Model

> **Owner:** Seat 5 (Backend Dev 1) · مطابق لـ `backend/src/models/*.js`.

```mermaid
erDiagram
    USER ||--o| COMPANY : "role=company has"
    USER ||--o| COLLECTOR : "role=collector has"
    PACKAGE ||--o{ COMPANY : "subscribed by"
    COMPANY ||--o{ PICKUP : "is visited in"
    COLLECTOR ||--o{ PICKUP : "performs"
    USER ||--o{ PICKUP : "approves (admin)"

    USER {
        ObjectId _id PK
        string fullname
        string username "admin only, unique sparse"
        string email "unique sparse"
        string phone "unique"
        number age "min 18"
        string address
        string passwordHash "bcrypt, never returned"
        string role "admin | company | collector"
    }
    PACKAGE {
        ObjectId _id PK
        string name
        number durationMonths "3 | 6 | 12, unique"
        number priceEGP
        number discountPercent "0-100"
        boolean isActive
    }
    COMPANY {
        ObjectId _id PK
        ObjectId userId FK "unique"
        string companyName
        string category
        string address
        ObjectId packageId FK
        string visitFrequency "twice_weekly | weekly | biweekly | monthly"
        date contractStartDate
        date contractEndDate
        GeoJSON location "Point [lng, lat], 2dsphere index"
        number monthlyTargetKg "default 200"
        number pointsWallet "default 0"
    }
    COLLECTOR {
        ObjectId _id PK
        ObjectId userId FK "unique"
        string documents_nationalId "stored file name"
        string documents_criminalRecord "stored file name"
        string documents_faceId "stored file name"
        boolean isApprovedByAdmin "default false"
        date approvedAt
        number monthlyCompanyTarget "default 30"
    }
    PICKUP {
        ObjectId _id PK
        ObjectId companyId FK
        ObjectId collectorId FK
        string scheduledDate "YYYY-MM-DD, Cairo day"
        string timeSlot "HH:mm"
        string qrToken "unique, random 128-bit"
        string status "SCHEDULED | PENDING_REVIEW | COMPLETED | NO_SHOW"
        array items "trashType + weightKg"
        number totalWeightKg
        string scalePhoto "stored file name"
        date completedAt
        object noShow "at, coordinates, distanceMeters"
        date approvedAt
        ObjectId approvedBy FK
        string approvedMonth "YYYY-MM, Cairo time"
        number pointsAwarded
    }
```

## الفهارس والقيود

| Collection | Index / قيد | الغرض |
|---|---|---|
| `users` | `email` unique sparse · `username` unique sparse · `phone` unique | الدخول بأي واحد منهم، والأدمن مالوش إيميل |
| `users` | `role` مقيدة بـ enum، والتسجيل العام لا يقبل `admin` | منع إنشاء أدمن |
| `companies` | `userId` unique | شركة واحدة لكل مستخدم |
| `companies` | `location` **2dsphere** | `$geoNear` للمسار الذكي |
| `collectors` | `userId` unique | |
| `packages` | `durationMonths` unique (3/6/12) | باقة واحدة لكل مدة |
| `pickups` | `qrToken` unique | كل زيارة لها QR خاص |
| `pickups` | (`companyId`, `scheduledDate`, `timeSlot`) unique | منع حجز نفس الشركة مرتين في نفس الموعد |
| `pickups` | `status`، `approvedMonth`، `companyId`، `collectorId` | استعلامات اللوحات والإحصائيات |

## ملاحظات

- **أنواع الخامات** المسموحة: `plastic` · `paper` · `glass` · `metal`.
- **Migration:** MongoDB مفيهاش schema جدول يتعدل، فالـ migration هنا = `npm run migrate` الذي يتأكد من وجود كل الفهارس (`syncIndexes`) وبيتشغل تلقائيًا قبل الـ seed.
- **الصور** لا تُخزن في قاعدة البيانات؛ فقط أسماء ملفات عشوائية (32 hex + امتداد) داخل volume.
- مفيش `Complaints` collection لأن الشكاوى خارج نطاق الـ MVP (`00-first-user-journey.md`).
