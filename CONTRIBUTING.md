# Contributing Guidelines

Welcome to the **Smart Waste Management Project!**

This document defines the development workflow, contribution rules, and code quality standards that all team members must follow.

## 1. Branch Naming Convention

All developers must create a separate branch for each task.

| Prefix | Purpose |
|---|---|
| `feat/` | New features |
| `fix/` | Bug fixes |
| `docs/` | Documentation |
| `test/` | Tests |
| `refactor/` | Code improvements |

### Examples

```bash
feat/user-registration
feat/collection-request
fix/weight-validation
docs/api-contract
test/weight-validation
refactor/auth-service
```

## 2. Commit Message Convention

Use the following format:

```text
type(scope): description
```

### Examples

```text
feat(auth): add subscription registration
feat(collection): create waste request
fix(weight): correct variance calculation
docs(api): update API contract
test(weight): add validation test cases
refactor(auth): improve authentication service
```

**Guidelines:**
- Use clear and meaningful commit messages.
- Keep commits small and focused on a single task.
- Use the appropriate type and scope.
- Write descriptions in the imperative form.

## 3. Pull Request Rules

All contributions must follow this workflow:

1. Create a feature branch from `main`.
2. Implement and test your changes.
3. Push your branch to GitHub.
4. Open a Pull Request (PR) targeting `main`.
5. Provide a clear description of your changes.
6. Link the related User Story or task ID.
7. Request at least one team member to review the code.
8. Merge only after approval and successful checks.

**Important:** Do not merge your Pull Request before completing the required review and checks.

## 4. Code Review Rules

Reviewers should verify the following:

- Code correctness and readability.
- Compliance with the project architecture.
- Proper input validation and error handling.
- Authentication and authorization where required.
- No exposed credentials or sensitive information.
- Appropriate implementation of the related User Story.

## 5. Testing Requirements

Before opening a Pull Request:

- Run the relevant tests.
- Include positive and negative test cases.
- Verify API responses and database operations.
- Check that the implemented functionality works as expected.
- Fix failing tests before merging.
- Ensure that existing functionality is not broken.

## 6. General Rules

- Do not push directly to `main`.
- Create a separate branch for each task.
- Keep commits small and meaningful.
- Avoid committing `.env` files or secrets.
- Keep documentation updated when necessary.
- Follow the agreed project architecture and coding standards.
- Communicate blockers and dependencies with the team.
- Coordinate with team members before making changes that affect shared components.

## 7. Contribution Workflow

```text
main
 |
 |-- Create task branch
 |
 |-- Implement changes
 |
 |-- Run tests
 |
 |-- Commit changes
 |
 |-- Push branch to GitHub
 |
 |-- Open Pull Request
 |
 |-- Code Review
 |
 |-- Approval & Successful Checks
 |
 |-- Merge into main
```

**Thank you for contributing to the Smart Waste Management Project!**



# CONTRIBUTING — دليل الفريق

دليل تشغيل المشروع وقواعد العمل عليه. الهدف: أي عضو جديد يشغّل المشروع كله في أقل من 10 دقائق.

## 1. التشغيل من الصفر

المطلوب: **Git** و **Docker** (مع Docker Compose v2). مش لازم تنزّل Node أو MongoDB على جهازك.

```bash
git clone <repo-url> loop-eco && cd loop-eco

cp .env.example .env            # ثم غيّر JWT_SECRET لقيمة عشوائية
docker compose up -d --build    # يبني ويشغّل MongoDB + Backend + Frontend
docker compose exec backend npm run seed   # بيانات تجريبية + حساب الأدمن
```

بعد التشغيل:

| الخدمة | العنوان |
|---|---|
| الواجهة (Web + PWA) | http://localhost:3000 |
| الـ API | http://localhost:5000/api |
| فحص الصحة | http://localhost:5000/api/health |

حسابات التجربة (كلمة المرور من `SEED_PASSWORD`، الافتراضي `EcoLoop@2026`):

| الدور | بيانات الدخول |
|---|---|
| أدمن | `ecoloop_admin` |
| شركة | `company1@ecoloop.test` (وكمان `company2` و `company3`) |
| مندوب (معتمد) | `collector1@ecoloop.test` |

> الأدمن ملوش شاشة تسجيل. بيتضاف فقط من الـ seed (قرار مقصود، موثق في `docs/07-trust-boundaries.md`).

أوامر مفيدة:

```bash
docker compose logs -f backend                 # لوجات الـ API
docker compose exec backend npm run migrate    # يتأكد إن كل الـ indexes موجودة (منها 2dsphere)
docker compose exec backend npm run seed       # يمسح كل البيانات ويعيد التعبئة (للتطوير فقط)
docker compose down                            # إيقاف
docker compose down -v                         # إيقاف + مسح قاعدة البيانات والملفات المرفوعة
```

## 2. تشغيل الاختبارات

```bash
# داخل Docker (بيستخدم قاعدة بيانات منفصلة اسمها ecoloop_test، مش بيانات التطوير)
docker compose exec backend npm test

# بدون Docker (Node 22+)
cd backend && npm ci
npm run test:unit    # unit + أمان الـ API: مش محتاج قاعدة بيانات
npm test             # كل حاجة بما فيها integration (بينزّل mongod مؤقت أول مرة،
                     # أو حدد MONGO_TEST_URI=mongodb://localhost:27017/ecoloop_test)
```

تفاصيل الاختبارات في `docs/09-testing.md`.

## 3. التأكد إن المشروع بيشتغل عند عضو تاني (Verification Checklist)

عضو غير اللي كتب الكود ينفذ الخطوات دي على جهازه ويكتب النتيجة في الـ PR:

- [ ] `git clone` ثم `cp .env.example .env` ثم `docker compose up -d --build` بدون أخطاء
- [ ] `docker compose ps` يظهر الثلاث حاويات `healthy` / `running`
- [ ] `docker compose exec backend npm run seed` ينتهي بـ `seed complete`
- [ ] `curl http://localhost:5000/api/health` يرجع `200` و `"status":"UP"`
- [ ] http://localhost:3000 يفتح صفحة الدخول بالعربي من اليمين لليسار
- [ ] دخول بـ `ecoloop_admin` يفتح لوحة الإدارة وتظهر الإحصائيات
- [ ] دخول بـ `collector1@ecoloop.test` يظهر "مسار اليوم" بثلاث شركات (محتاج إذن الموقع في المتصفح)
- [ ] دخول بـ `company1@ecoloop.test` يظهر كود QR للزيارة القادمة
- [ ] `docker compose exec backend npm test` كله `pass`
- [ ] `docker compose down -v && docker compose up -d --build` يرجع كل حاجة تشتغل من جديد

## 4. استراتيجية الفروع (Branching Strategy)

نستخدم **GitHub Flow**:

- `main`: دايمًا شغال وقابل للتسليم. **محمي**: ممنوع الـ push المباشر.
- كل عضو يعمل فرع قصير العمر من `main` لمهمة واحدة، بالصيغة:

  ```
  <type>/seat<N>-<short-description>
  ```

  `type` واحد من: `feat` · `fix` · `docs` · `test` · `chore`.
  أمثلة: `feat/seat5-geonear-route` · `fix/seat8-rbac-validation` · `docs/seat2-api-contract` · `chore/seat9-docker-compose`.
- الرسائل (commits) قصيرة وواضحة بصيغة الأمر: `Add no-show GPS check`، مش `done` أو `update`.
- بعد الدمج يتمسح الفرع.

إعدادات حماية `main` في GitHub (Settings → Branches → Branch protection rule):
`Require a pull request before merging` · `Require approvals: 1` · `Require status checks to pass` (اختار `backend` و `frontend` من الـ CI) · `Do not allow bypassing the above settings`.

## 5. قواعد الـ Pull Request

1. ممنوع push مباشر على `main`. كل تغيير بـ Pull Request.
2. لازم **موافقة مراجع واحد على الأقل من مقعد تاني** (Peer Review). الاقتراح: Seat 5 ⇄ Seat 6 · Seat 3 ⇄ Seat 4 · Seat 7 ⇄ Seat 8 · Seat 9 ⇄ Seat 10.
3. الـ CI لازم يكون أخضر (اختبارات الـ backend بنجاحها وفشلها + build الـ frontend).
4. تغيير في الـ API = تعديل `docs/06-api.md` في نفس الـ PR. تغيير معماري = ADR جديد أو محدّث في `docs/adr/`.
5. ممنوع أي أسرار أو كلمات مرور أو توكنز أو بيانات حقيقية في الكود أو الاختبارات أو اللوجات.
6. الـ PR صغير ومركز (مهمة واحدة). الـ template في `.github/pull_request_template.md` بيتملأ تلقائيًا.
7. اللي كتب الـ PR هو اللي يدمجه بعد الموافقة (Squash and merge).

## 6. توزيع المقاعد (Seats) على المخرجات

| المقعد | الدور | يملك في المشروع |
|---|---|---|
| 1 | Product Owner | `docs/00-first-user-journey.md`، معايير القبول، مراجعة التصميم |
| 2 | Delivery Facilitator | عقد الـ API (`docs/06-api.md`)، الـ Blockers والـ Dependencies |
| 3 | Frontend Dev 1 | صفحات التسجيل ولوحة الشركة وشاشة المندوب (`frontend/app`) |
| 4 | Frontend Dev 2 | التنقل وحالات Loading/Empty/Error وربط الواجهة بالـ API (`frontend/lib`, `components`) |
| 5 | Backend Dev 1 | الـ Models والـ Endpoints والـ Seed والـ Migration (`backend/src/models`, `routes`, `seed.js`) |
| 6 | Backend Dev 2 | الهوية والصلاحيات والـ Validation (`middleware/auth.js`, `schemas.js`) واختبارات الرفض |
| 7 | Functional Tester | اختبار الرحلة الكاملة من الـ UI للـ API لقاعدة البيانات وتسجيل الـ Bugs |
| 8 | Quality & Security Tester | اختبار الصلاحيات والـ Negative Cases واختبار لوحة المفاتيح |
| 9 | Build & Release Ops | `docker-compose.yml` والـ Dockerfiles وتوثيق الأوامر (هذا الملف) |
| 10 | Reliability Ops | `/api/health` والـ Request ID والـ Safe Logs واختبار Reset قاعدة البيانات |

## 7. إعادة ضبط قاعدة البيانات (Reset & Reseed)

```bash
docker compose exec backend npm run seed
```

الأمر بيمسح كل الـ collections ثم يبني الـ indexes ثم يضيف البيانات التجريبية. بيرفض يشتغل لو `NODE_ENV=production` إلا بـ `--force`.
