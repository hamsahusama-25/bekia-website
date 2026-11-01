# 05 — Sequence Diagram: حالات الفشل

> **Owner:** Seat 4 & Seat 6 & Seat 8 · يغطي محاولات التلاعب وأخطاء الإدخال.

## أ) "الشركة مغلقة / لا استجابة" والتحقق بالـ GPS

```mermaid
sequenceDiagram
    autonumber
    actor Collector
    participant UI as Collector PWA
    participant API as Express API
    participant DB as MongoDB

    Collector->>UI: taps "Company closed / no response"
    UI->>UI: navigator.geolocation.getCurrentPosition()
    UI->>API: POST /api/pickups/:id/no-show {lng, lat}
    API->>API: requireAuth(collector) + approved collector
    API->>DB: find pickup owned by this collector (status SCHEDULED)
    API->>DB: load company.location
    API->>API: distance = haversine(reported, company) in meters

    alt distance greater than 500 m
        API-->>UI: 400 GPS_VERIFICATION_FAILED {distanceMeters, maxMeters}
        UI-->>Collector: "You are too far from the company"
    else distance 500 m or less
        API->>DB: findOneAndUpdate SCHEDULED to NO_SHOW (time, coordinates, distance)
        API-->>UI: 200 {status: NO_SHOW}
        Note over API,DB: visible in the admin pickups list (filter NO_SHOW)
    end
```

## ب) استلام مرفوض (Negative Cases للـ `complete`)

```mermaid
flowchart TD
    A["POST /api/pickups/:id/complete"] --> B{"Valid token and role = collector?"}
    B -- "no token / bad token" --> E401["401 UNAUTHORIZED / INVALID_TOKEN"]
    B -- "other role" --> E403["403 FORBIDDEN_ROLE"]
    B -- yes --> C{"Collector approved by admin?"}
    C -- no --> E403b["403 COLLECTOR_NOT_APPROVED"]
    C -- yes --> D{"items JSON valid? trash type, weight above 0"}
    D -- no --> E400a["400 INVALID_ITEMS / VALIDATION_ERROR"]
    D -- yes --> F{"scalePhoto attached?"}
    F -- no --> E400b["400 MISSING_SCALE_PHOTO"]
    F -- yes --> G{"Pickup belongs to this collector?"}
    G -- no --> E404["404 PICKUP_NOT_FOUND"]
    G -- yes --> H{"status = SCHEDULED?"}
    H -- no --> E409["409 PICKUP_NOT_SCHEDULED"]
    H -- yes --> I{"qrToken matches?"}
    I -- no --> E400c["400 INVALID_QR_HANDSHAKE"]
    I -- yes --> J{"Real JPEG / PNG / WebP by magic bytes?"}
    J -- no --> E400d["400 INVALID_IMAGE"]
    J -- yes --> K{"Atomic update succeeded?"}
    K -- "lost a race" --> E409
    K -- yes --> OK["200 PENDING_REVIEW"]
```

في كل حالات الرفض: حالة الشحنة تفضل `SCHEDULED` ولا يتغير أي وزن أو نقاط.
