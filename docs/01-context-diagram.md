# 01 — Context Diagram

> **Owner:** Seat 1 & Seat 5 · يوضح حدود النظام ومن يتفاعل معه من الخارج.

```mermaid
flowchart LR
    Company["Company representative<br/>(web dashboard)"]
    Collector["Collector<br/>(mobile PWA)"]
    Admin["System admin<br/>(web control center)"]

    subgraph LoopEco["Loop Eco platform (system boundary)"]
        System["Next.js web app<br/>+ Express API<br/>+ MongoDB"]
    end

    Files[("Private image storage<br/>ID documents, scale photos")]
    Browser["Browser device services<br/>GPS, camera"]

    Company -->|"register, choose package, view target / points / QR"| System
    Collector -->|"documents, smart route, scan QR, weights, no-show"| System
    Admin -->|"approve collectors, schedule, approve pickups, stats, prices"| System
    System -->|"contract, schedule, QR, points"| Company
    System -->|"today's route, results"| Collector
    System -->|"queues, KPIs, private images"| Admin
    System <-->|"store / read images"| Files
    Collector -.->|"location, camera"| Browser
    Browser -.->|"coordinates, QR frames"| Collector
```

## الأطراف

| الطرف | بيعمل إيه | بيتواصل عن طريق |
|---|---|---|
| الشركة | تشترك في باقة، تتابع التارجت والنقاط، تعرض QR للمندوب | متصفح (Desktop/Tablet) |
| المندوب | يرفع مستنداته، ينفذ المسار، يمسح QR، يسجل الوزن وعدم الاستجابة | متصفح موبايل (PWA) |
| الأدمن | يعتمد المندوبين والشحنات، يجدول، يراجع الإحصائيات ويعدل الباقات | متصفح (Desktop) |
| تخزين الصور | يحفظ صور البطاقة والفيش والوجه وصور الميزان بأسماء عشوائية | داخلي، مش متاح للعامة |
| خدمات الجهاز | الـ GPS والكاميرا من المتصفح | Geolocation API / MediaDevices |

**لا توجد أي خدمة خارجية مدفوعة** (خرائط أو دفع أو رسائل) في الـ MVP. ده قرار موثق في `adr/ADR-003-free-geo-routing-and-qr.md`.
