# 04 — Sequence Diagram: الرحلة الأساسية (Success Path)

> **Owner:** Seat 3 & Seat 5 & Seat 7 · يغطي الخطوات 2 إلى 7 من `00-first-user-journey.md`.

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    actor Company
    actor Collector
    participant API as Express API
    participant DB as MongoDB
    participant FS as Uploads volume

    Admin->>API: POST /api/admin/pickups {companyId, collectorId, date, slot}
    API->>DB: check collector approved, contract valid
    API->>DB: insert Pickup (SCHEDULED, random qrToken)
    API-->>Admin: 201 {id, status}

    Company->>API: GET /api/company/dashboard
    API->>DB: company + package + month weight + next pickup
    API-->>Company: 200 {contract, target, pointsWallet, nextPickup.qrToken}
    Note over Company: shows nextPickup.qrToken as a QR code

    Collector->>API: GET /api/collector/smartroute?lng&lat
    API->>DB: today's SCHEDULED pickups of this collector
    API->>DB: aggregate $geoNear on companies (2dsphere)
    API-->>Collector: 200 {stops sorted nearest first, progress}

    Collector->>Company: scans the QR on the company screen
    Collector->>API: POST /api/pickups/:id/complete (multipart: qrToken, items, scalePhoto)
    API->>API: validate input, owner, status = SCHEDULED, qrToken matches
    API->>API: check image magic bytes
    API->>FS: store scale photo (random file name)
    API->>DB: findOneAndUpdate status SCHEDULED to PENDING_REVIEW
    API-->>Collector: 200 {status: PENDING_REVIEW, totalWeightKg}

    Admin->>API: GET /api/admin/pickups?status=PENDING_REVIEW
    Admin->>API: GET /api/files/:scalePhoto (with admin token)
    API-->>Admin: image
    Admin->>API: POST /api/admin/pickups/:id/approve
    API->>DB: month weight before (COMPLETED in this month)
    API->>DB: findOneAndUpdate PENDING_REVIEW to COMPLETED (approvedMonth, pointsAwarded)
    API->>DB: $inc company.pointsWallet
    API-->>Admin: 200 {pointsAwarded, bonusPoints, monthCollectedKg, targetLevel}

    Company->>API: GET /api/company/dashboard
    API-->>Company: updated weight, level and points
```

## ملاحظات

- الخطوة `validate ... qrToken matches` تحصل **قبل** حفظ الصورة، فمحاولات الفشل ما بتملأش الـ volume.
- الاعتماد بيحسب النقاط من وزن الشهر **قبل** الشحنة، فالمكافأة بتتمنح مرة واحدة فقط (عند عبور التارجت).
- الوزن ما بيدخلش في تارجت الشركة إلا بعد خطوة اعتماد الأدمن.
