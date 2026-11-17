# 09 — خطة الاختبار والنتائج

> **Owner:** Seat 7 & Seat 8 (تنفيذ ومراجعة) · Seat 5 & Seat 6 (كتابة الاختبارات الآلية)

## 1. الحالة الحالية (اقرأها الأول)

| المجموعة | العدد | الحالة |
|---|---|---|
| Unit + أمان الـ API (`npm run test:unit`) — **لا تحتاج قاعدة بيانات** | 34 | ✅ **اتنفذت: 34 نجحت، 0 فشلت** |
| Integration على MongoDB حقيقية (`test/integration/journey.test.js`) | 20 | ⚠️ **مكتوبة، لكن لم تُنفَّذ بعد** |
| Build الـ Frontend (`next build`) + تشغيل فعلي والتأكد من عرض الصفحات والـ proxy | — | ✅ نجح |
| `docker compose up` | — | ⚠️ لم يُنفَّذ (الملف اتفحص بـ `docker compose config` فقط) |
| اختبار يدوي في متصفح حقيقي (GPS، الكاميرا، لوحة المفاتيح) | — | ⚠️ لم يُنفَّذ |

الاختبارات اللي بتحتاج MongoDB اتكتبت في بيئة ما فيهاش MongoDB ولا Docker daemon، فمتنفذتش هناك. **أول مهمة للفريق:** تشغيلها والتأكد إنها خضراء، وإصلاح أي فرق، ثم تحديث الجدول ده.

## 2. كيف تشغّل

```bash
docker compose exec backend npm test      # الكل، على قاعدة ecoloop_test المنفصلة
cd backend && npm run test:unit           # بدون قاعدة بيانات (Node 22+)
cd backend && npm test                    # الكل؛ يشغّل mongod مؤقت أول مرة (يحتاج تحميل)،
                                          # أو MONGO_TEST_URI=mongodb://localhost:27017/ecoloop_test
```

الاختبارات تمسح قاعدة بيانات الاختبار قبل وبعد التشغيل، وترفض العمل على أي قاعدة اسمها لا يحتوي `test`.

## 3. حالات الاختبار المطلوبة (Success / Negative)

| المعرف | النوع | السيناريو | النتيجة المتوقعة | أين | الحالة |
|---|---|---|---|---|---|
| **POS-01** | Success | الرحلة كاملة: تسجيل شركة ومندوب ← رفع مستندات ← قبول ← جدولة ← مسار `$geoNear` ← استلام بـ QR وصورة ← اعتماد | الشحنة `COMPLETED`، الوزن 60 كجم، **800 نقطة** (600 + 200 مكافأة)، المستوى Silver، والمحفظة تتحدث | integration | ⚠️ لم تُنفَّذ |
| **POS-02** | Success | ترتيب المسار من موقعين مختلفين | الأقرب أولًا في الحالتين | integration | ⚠️ لم تُنفَّذ |
| **POS-03** | Success | حساب المسافة والنقاط والمستويات والتواريخ | قيم صحيحة، مع الحالات الحدية | `unit/*.test.js` | ✅ نجحت |
| **NEG-01** | Negative | `POST /api/auth/register` بـ `role: "admin"` | `400 VALIDATION_ERROR` ولا يتكوّن مستخدم | `api/security`، `unit/schemas` | ✅ نجحت |
| **NEG-02** | Negative | استلام بـ QR خاطئ، أو بدون صورة ميزان، أو بملف مش صورة، أو بنوع خامة غلط | `400` بكود مناسب، والشحنة تبقى `SCHEDULED` | integration (+ `unit/lib` لفحص الصور) | ⚠️ integration لم تُنفَّذ · ✅ فحص الصور نجح |
| **NEG-03** | Negative | دخول بدور غلط على مسار دور آخر (مندوب يعتمد، شركة تدخل الأدمن…) | `403 FORBIDDEN_ROLE` | `api/security` | ✅ نجحت |
| **NEG-04** | Negative | "لا استجابة" من مكان بعيد ثم من مكان قريب | `400 GPS_VERIFICATION_FAILED` ثم `200 NO_SHOW` | integration (+ `unit/geo` للمسافة) | ⚠️ integration لم تُنفَّذ · ✅ المسافة نجحت |
| **NEG-05** | Negative | مندوب غير معتمد يطلب المسار / مندوب آخر يلمس شحنة غيره | `403 COLLECTOR_NOT_APPROVED` / `404 PICKUP_NOT_FOUND` | integration | ⚠️ لم تُنفَّذ |
| **NEG-06** | Negative | اعتماد نفس الشحنة مرتين، أو استلامها مرتين | `409 PICKUP_NOT_PENDING` / `409 PICKUP_NOT_SCHEDULED` | integration | ⚠️ لم تُنفَّذ |
| **NEG-07** | Negative | قبول مندوب قبل رفع مستنداته | `409 DOCUMENTS_INCOMPLETE` | integration | ⚠️ لم تُنفَّذ |
| **NEG-08** | Negative | تسجيل بإيميل مكرر / باقة غير موجودة | `409 DUPLICATE` / `400 INVALID_PACKAGE` | integration | ⚠️ لم تُنفَّذ |
| **SEC-01** | Security | توكن مزوّر، منتهي، `alg: none`، أو بدون توكن | `401 INVALID_TOKEN` / `401 UNAUTHORIZED` | `api/security` | ✅ نجحت |
| **SEC-02** | Security | NoSQL injection في الدخول وفي الـ ids | `400` قبل أي استعلام | `api/security`، `unit/schemas` | ✅ نجحت |
| **SEC-03** | Security | عدم ظهور كلمات المرور والـ QR والمستندات في اللوجات | `***REDACTED***`، ولا body ولا query في اللوج | `unit/lib` | ✅ نجحت |
| **SEC-04** | Security | Path Traversal على `/api/files/:name`، وفتح الصور من غير الأدمن | `404` / `403` / `401` | `unit/lib` + integration | ✅ التحقق من الاسم · ⚠️ integration لم تُنفَّذ |
| **SEC-05** | Security | Rate limit على الدخول | 30 طلب مسموح ثم `429`، وعميل آخر غير متأثر | فحص يدوي بسكريبت | ✅ اتفحص مرة (غير مدرج في الاختبارات الآلية) |
| **OPS-01** | Ops | `/api/health` | `200 UP` مع قاعدة متصلة، `503` بدونها، وكل رد يحمل `X-Request-Id` | `api/security` (503) + integration (200) | ✅ 503 · ⚠️ 200 لم تُنفَّذ |

## 4. اختبار يدوي من الواجهة (Seat 7 & Seat 8)

بعد `docker compose up` و `seed`:

1. **أدمن:** دخول `ecoloop_admin` ← تبويب "المندوبون" ← سجّل مندوبًا جديدًا من نافذة تانية، ارفع له 3 صور ثم اقبله.
2. **أدمن:** "الجدولة" ← اختر شركة ومندوبًا وتاريخ اليوم ← احفظ.
3. **شركة:** دخول `company1@ecoloop.test` ← تأكد من ظهور كود QR والموعد واسم المندوب.
4. **مندوب (موبايل أو Chrome DevTools بوضع موبايل):** دخول `collector1@ecoloop.test` ← اسمح بالموقع ← تأكد من ترتيب الشركات من الأقرب ← "استلام" ← الصق كود الشركة (أو "مسح" على متصفح يدعمها) ← أدخل أوزانًا وصورة ← تأكيد.
5. **أدمن:** "الشحنات" ← فلتر "في انتظار الاعتماد" ← افتح صورة الميزان ← اعتماد ← تأكد من رسالة النقاط.
6. **شركة:** حدّث الصفحة وتأكد من الوزن والمستوى والنقاط.
7. **فشل:** من شاشة المندوب اضغط "مغلقة / لا استجابة" وأنت بعيد عن موقع الشركة المسجل ← لازم يُرفض.
8. **لوحة المفاتيح (Seat 8):** من صفحة التسجيل والدخول، أكمل النموذج بزر `Tab` و`Space`/`Enter` فقط، وتأكد من وضوح مؤشر التركيز.
9. **صلاحيات:** وأنت داخل كشركة، افتح `/admin` يدويًا ← لازم يحوّلك لصفحتك.

## 5. حدود معروفة

- **كاميرا مسح الـ QR** تعتمد على `BarcodeDetector` (Chrome/Edge)؛ غير موجودة في Firefox و Safari، وفي الحالة دي المندوب يكتب الكود. **لم تُجرَّب على جهاز حقيقي.**
- **لا توجد اختبارات آلية للواجهة** (component/e2e) في الـ MVP؛ التغطية الحالية من الـ build والاختبار اليدوي أعلاه. إضافة Playwright خطوة مقترحة.
- **الـ rate limit** غير مغطى باختبار آلي (يتخطاه وضع الاختبار عمدًا حتى لا يعطل باقي الاختبارات).
- الـ GPS قابل للتزوير من أدوات المطور (انظر `07-trust-boundaries.md`).

## 6. Traceability: User Story ↔ automated tests

> الجدول ده بيربط كل User Story من الـ Product Backlog (النطاق الحالي) بالاختبارات الآلية الموجودة فعلًا في `backend/test/`. الربط تم من أسماء الاختبارات والـ error codes اللي بتتحقق منها، وليس من قراءة كل assertion. "Gap" معناها مفيش اختبار آلي يغطي النقطة دي.
> مش داخل هنا: User Stories الخاصة بـ OTP و HQ activation (في انتظار قرار)، ولا الواجهة (مفيش اختبارات آلية للـ frontend، انظر القسم 5).

| US | Covered by (file :: test) | Gap |
|---|---|---|
| US-01 | `integration/journey` :: registers two companies and never returns the password hash · rejects a duplicate email (409) and an unknown package (400) — `unit/schemas` :: register payloads · extra fields stripped — `api/security` :: NEG-01 | Extra fields are **stripped**, not rejected (the Backlog says "rejected") |
| US-03 | `integration/journey` :: login (401 INVALID_CREDENTIALS, phone and email) — `api/security` :: no token / garbage / expired / `alg=none` tokens · NoSQL operator payload | The 30 requests / 15 min limit is not tested (skipped in test mode) |
| US-04 | `api/security` :: NEG-01 — `unit/schemas` :: role "admin" is rejected | — |
| US-10 | `integration/journey` :: company dashboard shows contract, target, wallet · approval updates weight, level and wallet | — |
| US-12 | `integration/journey` :: admin approves the collector and assigns both companies (duplicate slot returns 409) | Scheduling with a non-approved collector (409) is not tested |
| US-13 | — | **Gap:** `PAST_DATE` (400) and `CONTRACT_EXPIRED` (409) are not tested |
| US-14 | `integration/journey` :: smart route orders stops nearest-first using $geoNear — `unit/geo` :: pipeline starts with $geoNear | Empty state (no pickups) is not tested |
| US-15 | `integration/journey` :: collector progress counts the served company | — |
| US-20 | `unit/lib` :: images by magic bytes · stored names (path traversal) — `integration/journey` :: NEG-02 fake image · non-images rejected · scale photos served to admins only | The 5 MB size limit is not tested |
| US-21 | `integration/journey` :: NEG-04 (far = 400 GPS_VERIFICATION_FAILED, near = NO_SHOW, repeat = 409) — `unit/geo` :: haversine | — |
| US-22 | `integration/journey` :: success case PENDING_REVIEW · only an admin can approve (re-approval = 409 PICKUP_NOT_PENDING) | — |
| US-23 | `unit/points` :: level and points (5 tests) — `integration/journey` :: approval with target bonus | — |
| US-24 | `unit/lib` :: business-timezone day and month keys | A shipment approved right at the month boundary is not tested end to end |
| US-25 | `integration/journey` :: second approval returns 409 PICKUP_NOT_PENDING | **Gap:** two simultaneous approvals (race) are not tested |
| US-26 | `integration/journey` :: admin stats summarize the month | — |
| US-27 | `integration/journey` :: admin changes package price and discount; a company cannot | — |
| US-28 | `api/security` :: X-Request-Id · health 503 — `integration/journey` :: health is UP — `unit/lib` :: redact (3 tests, including `otp`) | — |
| US-29 | — | **Gap:** login, sign-up and `complete` rate limits are not tested (skipped in test mode) |
| US-40 to US-43 | — | No automated frontend tests (manual only, see section 5) |
