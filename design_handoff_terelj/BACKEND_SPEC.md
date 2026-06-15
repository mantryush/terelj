# BACKEND_SPEC — Тэрэлж Ger Resort

Энэ баримт нь прототипийн `store.jsx`-ийн логикийг **бодит backend** болгох заавар.
Прототип localStorage дээр ажилладаг; production-д доорхийг хэрэгжүүлнэ.

---

## 1. Гол шийдэх асуудал: давхцлаас сэргийлэх (concurrency)

**Тулгамдсан кейс:** яг нэг агшинд нэг хэрэглэгч вебээс гэр захиалж байх үед өөр хүн reception дээр очиж мөн тэр гэрийг захилах гэж байна. Хоёулаа нэг гэрт орох ёсгүй.

**Шийдэл — DB түвшний атомик баталгаа:**

1. Гэр + огнооны давхцлыг **DB constraint**-ээр хорино. PostgreSQL дээр `tstzrange` + **exclusion constraint** ашиглавал хоёр идэвхтэй захиалга огноогоор давхцаж **боломжгүй** болно:
   ```sql
   CREATE EXTENSION IF NOT EXISTS btree_gist;
   ALTER TABLE bookings ADD CONSTRAINT no_overlap
     EXCLUDE USING gist (
       ger_id WITH =,
       daterange(check_in, check_out, '[)') WITH &&
     ) WHERE (status IN ('hold','web','walkin','stay'));
   ```
   → Хоёр хүн зэрэг INSERT хийвэл нэг нь амжилттай, нөгөө нь алдаа авна. Энэ нь race condition-г **үндсээр нь** шийднэ. Аппын логик дээр найдахгүй.

2. **Hold** мөн адил мөрөөр орох тул барьцаа байгаа гэрийг reception давхар бүртгэж чадахгүй.

3. Хугацаа дууссан hold-ийг **cron/background job** (эсвэл lazy: уншихад шалгах) — `status='hold' AND hold_until < now()` мөрүүдийг `expired` болгож, constraint-аас гаргана.

> Хэрэв Supabase/Postgres ашиглах боломжгүй бол: захиалга үүсгэх API-г **serializable transaction** дотор "давхцал байгаа эсэхийг шалгаад INSERT" хий. Гэхдээ exclusion constraint хамгийн найдвартай.

---

## 2. Өгөгдлийн загвар (Prisma schema жишээ)

```prisma
model GerType {
  id        String  @id            // "energiin" | "family" | "vip" | "luxe" | "cabin"
  nameMn    String
  nameEn    String
  capacity  Int
  price     Int                    // ₮ / шөнө
  color     String
  amenities Json                   // [["wifi","Wi-Fi"], ...]
  gers      Ger[]
}

model Ger {
  id       String  @id             // "L1","E3" ...
  name     String                  // "Сэлэнгэ"
  typeId   String
  type     GerType @relation(fields:[typeId], references:[id])
  x        Float                   // газрын зураг дээрх % байрлал
  y        Float
  photos   Media[]
  bookings Booking[]
}

model Booking {
  id          String   @id @default(cuid())
  code        String   @unique          // "TJ-04217"
  gerId       String
  ger         Ger      @relation(fields:[gerId], references:[id])
  checkIn     DateTime @db.Date
  checkOut    DateTime @db.Date
  channel     String                     // "web" | "reception"
  status      String                     // hold|web|walkin|stay|done|expired|cancelled
  holdUntil   DateTime?                   // hold төлөвт л утгатай
  guestName   String?
  guestPhone  String?
  guestCount  Int      @default(1)
  services    Json     @default("[]")    // service id-ийн жагсаалт
  payment     Json?                       // {method, paid, amount, txnId}
  createdAt   DateTime @default(now())
  confirmedAt DateTime?
  checkedInAt DateTime?
  checkedOutAt DateTime?
}

model Media {
  id     String @id @default(cuid())
  gerId  String?
  slotId String                         // "ger-L1-main", "hero-photo" ...
  url    String                         // CDN URL
  kind   String                         // "image" | "video"
  ger    Ger?   @relation(fields:[gerId], references:[id])
}

model StaffUser {                        // reception / admin
  id           String @id @default(cuid())
  email        String @unique
  passwordHash String
  role         String                    // "reception" | "admin"
  name         String
}
```

**Төлвийн утга (`status`):** прототипийн `STATUS_META`-той ижил —
`free` (захиалга байхгүй гэсэн тооцоолсон төлөв, DB-д хадгалахгүй), `hold`, `web`, `walkin`, `stay`, `done`.

**Гэр + үнэ:** прототипийн `GERS` (20 нэгж) ба `GER_TYPES` (5 төрөл)-ийг seed болгож оруул. Үнэ/багтаамжийг админ засна.

---

## 3. API (REST жишээ — Next.js route handlers / Express)

| Method | Зам | Үйлдэл | Эрх |
|--------|-----|--------|-----|
| `GET`  | `/api/gers` | бүх гэр + төрөл | нийтэд |
| `GET`  | `/api/availability?checkIn=&checkOut=` | гэр бүрийн төлөв тухайн мужид | нийтэд |
| `POST` | `/api/holds` | 30-мин hold үүсгэх `{gerId,checkIn,checkOut,guestCount}` → `{booking}` эсвэл `409 {error:'taken'}` | нийтэд |
| `POST` | `/api/bookings/:id/confirm` | төлбөр баталгаажуулаад `web` болгох `{guest,payment,services}` | нийтэд (hold эзэмшигч) |
| `DELETE`| `/api/holds/:id` | hold цуцлах | эзэмшигч |
| `POST` | `/api/reception/walkin` | биечлэн захиалга `{gerId,...}` → constraint шалгана | **reception** |
| `POST` | `/api/bookings/:id/checkin` | `stay` болгох | **reception** |
| `POST` | `/api/bookings/:id/checkout` | `done` болгох | **reception** |
| `GET`  | `/api/admin/bookings` | бүх захиалга (шүүлттэй) | **admin** |
| `PATCH`| `/api/admin/ger-types/:id` | үнэ/багтаамж засах | **admin** |
| `POST` | `/api/admin/media` | зураг/бичлэг upload (S3 presigned) | **admin** |

**`availability` тооцоолол** прототипийн `TJ.statusForRange`-тэй ижил эрэмбэ: `stay > web > walkin > hold > free`.

**Booking code:** прототип `bookingCode(id)` ашигладаг. Production-д үүсгэхдээ `TJ-` + 5 оронтой давтагдашгүй тоо (`@unique`).

---

## 4. Real-time синк (web ↔ reception)

Прототип `BroadcastChannel`-аар нэг browser доторх табуудыг синк хийдэг. Production-д **сервер дамжуулсан** real-time хэрэгтэй:

- **Supabase Realtime** (хамгийн хялбар): `bookings` хүснэгтийн өөрчлөлтийг postgres replication-аар subscribe хий. Reception, web хоёр ижил channel сонсоно.
- эсвэл **WebSocket (Socket.IO)**: захиалга үүсэх/өөрчлөгдөх бүрт `booking:changed` event broadcast. Клиент тухайн огнооны availability-г дахин татна (эсвэл patch).
- эсвэл хамгийн энгийн: **SSE / polling** (3–5с тутам availability дахин татах) — MVP-д хангалттай.

**Чухал:** hold үүсмэгц reception дэлгэц дээр тэр гэр **тэр даруй шар (hold)** болж харагдах ёстой. Энэ нь давхар захиалгаас сэргийлэх визуал баталгаа.

---

## 5. 30-минутын Hold логик

1. Хэрэглэгч сул гэр сонгож "30 мин барих" дарна → `POST /api/holds`.
2. Сервер constraint-тай INSERT хийнэ (`status='hold'`, `hold_until = now() + 30min`). Амжилтгүй бол `409` → frontend "Энэ гэрийг дөнгөж сонгочихлоо" toast.
3. Frontend countdown харуулна (`HoldTimer`). Дуусахаас өмнө төлбөр төлж `confirm` хийвэл `web` болно.
4. Хугацаа дуусвал background job `expired` болгож, гэр дахин сул болно.
5. Reception тал hold-той гэрийг **блоклоно** (§1).

> Анхааруулга: hold_until-г сервер цагаар тооцоол, клиентийн цагт бүү найд.

---

## 6. Төлбөр

### QPay (Монгол)
- QPay merchant аккаунт + API key хэрэгтэй. Урсгал:
  1. `confirm` дуудахын өмнө сервер `POST https://merchant.qpay.mn/v2/invoice` — invoice үүсгэж QR авна.
  2. Frontend QR харуулна (прототипийн `QRPlaceholder`-г бодит QR зургаар солино).
  3. QPay **callback/webhook**-аар төлбөр баталгаажихыг хүлээнэ (эсвэл `GET /v2/payment/check`-ээр polling).
  4. Төлөгдсөн дохио ирмэгц захиалгыг `web` болгож `payment.paid=true` тэмдэглэнэ.
- ⚠ Прототипийн "Төлсөн · баталгаажуулах" товч нь **симуляц** (1.5с). Production-д жинхэнэ QPay баталгаажуулалт ирэхээс нааш захиалгыг битгий баталгаажуул.

### Дансаар шилжүүлэг
- Банк, данс, нэр, дүн, **гүйлгээний утга = захиалгын код** харуулна.
- Энэ нь гар баталгаажуулалт: захиалга `pending` хэвээр, ажилтан мөнгө орсныг шалгаад reception/admin-аас баталгаажуулна. (Эсвэл банкны statement API-тай бол автомат.)

---

## 7. Нэвтрэлт (Auth)

- **Зочин:** заавал биш. Захиалгын код + утсаар захиалгаа хайх боломж нэмж болно.
- **Reception / Admin:** заавал. `/reception`, `/admin` route-уудыг middleware-ээр хамгаална. Role-based: reception нь захиалга харах/check-in хийх; admin нэмж үнэ засах/устгах/контент.
- NextAuth (credentials) эсвэл Lucia. Нууц үг bcrypt/argon2.

---

## 8. i18n (MN / EN)

Прототип `store.jsx`-ийн `STR` объект + `useLang` hook ашигладаг. Production-д `next-intl` эсвэл ижил key-value бүтэц. MN үндсэн, EN сонголт. Сонголт localStorage/cookie-д хадгал.

---

## 9. Орчуулах хүснэгт: прототип → production

| Прототип | Production |
|----------|-----------|
| `TJ` store (localStorage) | Backend API + DB |
| `BroadcastChannel` | Supabase Realtime / WebSocket / SSE |
| `TJ.hold()` | `POST /api/holds` + DB exclusion constraint |
| `TJ.statusForRange()` | `GET /api/availability` |
| `TJ.confirm()` | `POST /api/bookings/:id/confirm` + QPay webhook |
| `TJ.walkIn()` | `POST /api/reception/walkin` (auth) |
| `TJ.checkIn/checkOut()` | `POST /api/bookings/:id/checkin|checkout` (auth) |
| `QRPlaceholder` | QPay-аас ирсэн бодит QR |
| `<image-slot>` | S3/CDN дээрх бодит зураг/бичлэг |
| hold expiry (lazy filter) | cron job эсвэл DB TTL |
| seed() демо өгөгдөл | DB seed script |

---

## 10. Аюулгүй байдал / нэмэлт

- Бүх mutation API rate-limit + validation (огноо логик, hold эзэмшил).
- `confirm`-ыг зөвхөн hold-ийн эзэн (session/token) дуудах.
- Үнэ серверээс тооцоол — клиентийн ирүүлсэн дүнд бүү найд.
- Reception/admin үйлдлийг audit log-д бич.
- Огноо timezone: Монгол (`Asia/Ulaanbaatar`, UTC+8). check-in 14:00, check-out 12:00.
