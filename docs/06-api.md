# 06 — API Documentation & Contract

> **Owner:** Seat 2 (اعتماد العقد) · Seat 4 & Seat 5 (التنفيذ) · الأصل الفعلي للعقد هو الكود في `backend/src/routes` و `backend/src/schemas.js`؛ لو اختلفوا، الكود هو الصح وتصحيح الملف ده واجب في نفس الـ PR.

## 1. اتفاق الفريق (API Contract Agreement)

1. **Base path:** `/api`. الواجهة تناديه من نفس الـ origin (Next يحوله للـ backend).
2. **كل الردود JSON** بالشكل الموحد التالي، وكل رد يحمل `requestId` ويتكرر في الهيدر `X-Request-Id`.
3. **الأخطاء** لها `code` ثابت (`UPPER_SNAKE`) تعتمد عليه الواجهة، و`message` للقراءة فقط.
4. **المصادقة:** `Authorization: Bearer <JWT>`. الـ JWT فيه `sub` (معرف المستخدم) و`role`.
5. **تغيير الـ contract** (حقل جديد مطلوب، تغيير كود خطأ، حذف حقل) = PR فيه تعديل هذا الملف + موافقة Seat 2 + إخطار الـ Frontend.
6. الحقول الجديدة **الاختيارية** في الرد لا تُعتبر تغييرًا كاسرًا.

```jsonc
// نجاح
{ "success": true, "requestId": "3f1c…", "data": { /* … */ } }

// فشل
{ "success": false, "requestId": "3f1c…",
  "error": { "code": "VALIDATION_ERROR", "message": "Invalid request data",
             "details": [{ "path": "age", "message": "…" }] } }
```

## 2. الـ Endpoints

| Method + Path | الصلاحية | الطلب | نجاح | أخطاء محتملة |
|---|---|---|---|---|
| `GET /api/health` | عام | — | `200` `{status:"UP", db:"connected"}` | `503 DB_UNAVAILABLE` |
| `GET /api/packages` | عام | — | `200` قائمة `{id, name, durationMonths, priceEGP, discountPercent, finalPriceEGP}` | |
| `POST /api/auth/register` | عام | JSON، انظر 3.1 | `201` `{token, user}` | `400 VALIDATION_ERROR` (منها `role: admin`) · `400 INVALID_PACKAGE` · `409 DUPLICATE` · `429` |
| `POST /api/auth/login` | عام | `{identifier, password}` (إيميل / هاتف / username) | `200` `{token, user}` | `400` · `401 INVALID_CREDENTIALS` · `429` |
| `GET /api/company/dashboard` | company | — | `200` انظر 3.2 | `401` · `403` |
| `GET /api/collector/me` | collector | — | `200` `{isApprovedByAdmin, documentsComplete}` | `401` · `403` |
| `POST /api/collector/documents` | collector | `multipart`: `nationalId`, `criminalRecord`, `faceId` (صور) | `200` `{nationalId, criminalRecord, faceId, complete}` | `400 NO_FILES` · `400 INVALID_IMAGE` · `409 ALREADY_APPROVED` · `413 FILE_TOO_LARGE` |
| `GET /api/collector/smartroute?lng=&lat=&date=` | collector معتمد | query (`date` اختياري `YYYY-MM-DD`، الافتراضي اليوم بتوقيت القاهرة) | `200` `{stops[], progress}` انظر 3.3 | `400 VALIDATION_ERROR` · `403 COLLECTOR_NOT_APPROVED` |
| `POST /api/pickups/:id/complete` | collector معتمد | `multipart`: `qrToken`, `items` (JSON string), `scalePhoto` (صورة) | `200` `{pickupId, status:"PENDING_REVIEW", totalWeightKg}` | `400 INVALID_ITEMS` · `400 VALIDATION_ERROR` · `400 MISSING_SCALE_PHOTO` · `400 INVALID_QR_HANDSHAKE` · `400 INVALID_IMAGE` · `404 PICKUP_NOT_FOUND` · `409 PICKUP_NOT_SCHEDULED` |
| `POST /api/pickups/:id/no-show` | collector معتمد | `{lng, lat}` | `200` `{pickupId, status:"NO_SHOW"}` | `400 GPS_VERIFICATION_FAILED` (`details: {distanceMeters, maxMeters}`) · `404` · `409 PICKUP_NOT_SCHEDULED` |
| `GET /api/admin/stats?month=YYYY-MM` | admin | — | `200` `{companiesServed, completedPickups, totalWeightKg, weightByType, activeOrders, pendingCollectors, noShows, month}` | |
| `GET /api/admin/collectors?status=pending\|approved` | admin | — | `200` قائمة بالبيانات وأسماء ملفات المستندات | |
| `PATCH /api/admin/collectors/:id/approve` | admin | `{monthlyCompanyTarget?}` | `200` `{id, isApprovedByAdmin:true}` | `404` · `409 DOCUMENTS_INCOMPLETE` |
| `GET /api/admin/companies` | admin | — | `200` قائمة الشركات ومواقعها | |
| `POST /api/admin/pickups` | admin | `{companyId, collectorId, scheduledDate, timeSlot}` | `201` `{id, status:"SCHEDULED"}` | `400 PAST_DATE` · `404` · `409 COLLECTOR_NOT_APPROVED` · `409 CONTRACT_EXPIRED` · `409 DUPLICATE` |
| `GET /api/admin/pickups?status=` | admin | — | `200` آخر 100 زيارة (بدون `qrToken`) | |
| `POST /api/admin/pickups/:id/approve` | admin | — | `200` `{pointsAwarded, bonusPoints, monthCollectedKg, targetLevel, pointsWallet, …}` | `404` · `409 PICKUP_NOT_PENDING` |
| `PUT /api/admin/packages/:id` | admin | `{priceEGP?, discountPercent?, isActive?}` | `200` الباقة بعد التعديل | `400` · `404` |
| `GET /api/files/:name` | admin | — | الصورة نفسها | `404 FILE_NOT_FOUND` |

أكواد مشتركة لكل الـ endpoints المحمية: `401 UNAUTHORIZED` (لا يوجد توكن) · `401 INVALID_TOKEN` (توكن غلط/منتهي) · `403 FORBIDDEN_ROLE` (الدور غير مسموح) · `404 ROUTE_NOT_FOUND` · `500 INTERNAL_ERROR`.

أكواد عامة تظهر حسب الحالة: `400 INVALID_JSON` (body مش JSON صالح) · `400 UPLOAD_ERROR` (رفع ملفات غير صالح) · `403 COLLECTOR_PROFILE_MISSING` · `404 COMPANY_NOT_FOUND` / `COLLECTOR_NOT_FOUND` / `PACKAGE_NOT_FOUND` · `429 TOO_MANY_REQUESTS`.

## 3. أمثلة

### 3.1 التسجيل

```jsonc
// POST /api/auth/register  (شركة)
{
  "role": "company",
  "fullname": "Ahmed Sami", "email": "a@example.com", "phone": "+201011111111",
  "age": 35, "address": "Suez", "password": "at-least-8-chars",
  "companyName": "Gulf Factory", "category": "factory", "companyAddress": "Industrial Zone, Suez",
  "packageId": "<id من GET /api/packages>", "visitFrequency": "weekly",
  "location": { "lng": 32.5498, "lat": 29.9668 }
}
// المندوب: نفس الحقول المشتركة + "role": "collector" فقط
```

القيم: `visitFrequency` ∈ `twice_weekly | weekly | biweekly | monthly` · `age` ≥ 18 · `password` 8 إلى 72 حرف.

### 3.2 لوحة الشركة

```jsonc
{
  "companyName": "Gulf Factory",
  "contract": { "packageName": "Half-year", "durationMonths": 6, "visitFrequency": "weekly",
                "startDate": "2026-11-01T…", "endDate": "2027-05-01T…", "daysRemaining": 181 },
  "target": { "month": "2026-11", "collectedKg": 60, "targetKg": 250, "level": "Bronze" },
  "pointsWallet": 600,
  "nextPickup": { "pickupId": "…", "scheduledDate": "2026-11-08", "timeSlot": "09:00",
                  "collectorName": "…", "qrToken": "9f2c…(32 hex)" }   // أو null
}
```

### 3.3 المسار الذكي

```jsonc
{
  "stops": [
    { "pickupId": "…", "companyName": "Gulf Factory", "category": "factory", "address": "…",
      "timeSlot": "09:00", "distanceMeters": 420, "location": { "lng": 32.5498, "lat": 29.9668 } }
  ],
  "progress": { "completedCompaniesThisMonth": 4, "monthlyCompanyTarget": 30 }
}
```

### 3.4 استلام شحنة (`multipart/form-data`)

```
qrToken   = 9f2c…
items     = [{"trashType":"plastic","weightKg":45},{"trashType":"metal","weightKg":15}]
scalePhoto= <ملف صورة JPEG/PNG/WebP حتى 5 MB>
```

`trashType` ∈ `plastic | paper | glass | metal` (نوع واحد مرة واحدة في كل شحنة، بحد أقصى 4 أصناف).

## 4. قيود عامة

| الحد | القيمة |
|---|---|
| حجم JSON | 100 KB |
| حجم الصورة | 5 MB، وجودة النوع بفحص الـ magic bytes (مش بالـ mimetype) |
| Rate limit | 30 محاولة لكل 15 دقيقة على `register` و `login` (لكل IP) |
| مدة الـ JWT | 8 ساعات (`JWT_EXPIRES_IN`) |
