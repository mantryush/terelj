# CODEX_INSTRUCTIONS — Codex-д өгөх заавар

Энэ бол **Codex (эсвэл Claude Code г.м кодлогч агент)-д шууд хуулж өгөх** prompt-уудын дараалал.
Эхлээд бүх багцыг (`README.md`, `BACKEND_SPEC.md`, `prototype/` фолдер) Codex-ийн ажиллах хавтсанд хийнэ.

---

## ⚙️ Бэлтгэл

1. Энэ `design_handoff_terelj/` фолдерийг бүхэлд нь татаж аваад Codex-ийн repo-д хий.
2. Codex эхлэхдээ `prototype/index.html`-ийг browser-т нээж, бүх 3 role-г (Зочин / Reception / Админ) туршиж үзэхийг хэл — энэ нь зорилтот зан төлвийг ойлгуулна.

---

## 📋 PROMPT 0 — Контекст өгөх (хамгийн эхэнд)

```
Чи Тэрэлж гэр амралтын газрын онлайн захиалгын вебсайтыг production-д
бүтээх гэж байна. design_handoff_terelj/ фолдерт бүрэн дизайн прототип
(prototype/), дизайн спек (README.md), backend спек (BACKEND_SPEC.md) бий.

Эхлээд README.md болон BACKEND_SPEC.md-ийг бүрэн уншиж, prototype/ доторх
бүх .jsx, styles.css-ийг судал. Дараа нь надад:
1) Технологийн стек санал (надад Next.js 14 + TS + Postgres/Prisma + Supabase
   Realtime + Tailwind-ийг харгалзаж үз),
2) Хэрэгжүүлэх дарааллын төлөвлөгөө
гаргаж өг. Код бүү бич — эхлээд төлөвлөгөө батлуулъя.
```

---

## 📋 PROMPT 1 — Төсөл + дизайн систем

```
Next.js 14 (App Router, TypeScript) төсөл үүсгэ. Tailwind тохируул.
prototype/styles.css-ийн :root токенуудыг (өнгө, фонт, радиус, сүүдэр)
Tailwind theme / CSS хувьсагч болгон яг хөрвүүл — өнгө, утгыг бүү өөрчил.
Энэ бол ДУЛААН МОНГОЛ загвар: үндсэн дэвсгэр #F1E7D2, primary #B8472A,
фонт Cormorant Garamond (гарчиг) + Manrope (текст), Google Fonts-оос
cyrillic subset-тэй ачаал.

Дараа нь shared давхарга үүсгэ:
- Icons (prototype/components.jsx доторх бүх SVG-г React компонент болгон)
- Logo, StatusBadge, HoldTimer, Stepper, DateField, Modal, KheeDivider, toast
- статусын өнгөний map (free/hold/web/walkin/stay) — README §5-аас яг ав
```

---

## 📋 PROMPT 2 — Өгөгдлийн сан + seed

```
BACKEND_SPEC.md §2-ийн Prisma schema-г үүсгэ (GerType, Ger, Booking, Media,
StaffUser). Postgres exclusion constraint-ийг (§1) migration-д нэм —
ger_id + daterange давхцлыг идэвхтэй төлвүүдэд хорино.

Seed script бич: prototype/store.jsx доторх GER_TYPES (5 төрөл, үнэ/багтаамж/
amenities) ба GERS (20 нэгж, x/y байрлал, нэр)-ийг яг оруул. Мөн SERVICES
(6 нэмэлт үйлчилгээ)-г seed хий.
```

---

## 📋 PROMPT 3 — API + давхцал хамгаалалт (ХАМГИЙН ЧУХАЛ)

```
BACKEND_SPEC.md §3-ийн API-уудыг хэрэгжүүл. Онцгой анхаар:

- POST /api/holds: exclusion constraint-тай атомик INSERT. Давхцвал 409
  буцаа. status='hold', hold_until = now()+30min.
- GET /api/availability: README §4.2 ба статус эрэмбэ (stay>web>walkin>hold)
  ёсоор гэр бүрийн төлөв буцаа.
- POST /api/reception/walkin: ижил constraint — hold/booked гэрийг
  давхар бүртгэхийг СЕРВЕР татгалзана.
- Hold expiry: cron job эсвэл lazy шалгалт (hold_until < now() → expired).

Энэ концепцийг тест бич: 2 хүсэлт нэг гэрт зэрэг ирэхэд зөвхөн нэг нь
амжилттай болохыг батал.
```

---

## 📋 PROMPT 4 — Real-time

```
BACKEND_SPEC.md §4 ёсоор web ↔ reception хооронд бодит цагийн синк нэм.
Supabase Realtime ашиглавал bookings хүснэгтийн өөрчлөлтийг subscribe хий.
Hold үүсмэгц reception дэлгэц дээр тэр гэр ШУУД шар (hold) болж харагдах
ёстой. Polling (3-5с) fallback бэлд.
```

---

## 📋 PROMPT 5 — Frontend дэлгэцүүд

Дэлгэц бүрийг тусад нь өг (README §4-ийн дагуу). Жишээ:

```
README §4.2-ийн Захиалгын дэлгэцийг бүтээ. prototype/booking.jsx-ийг
pixel-perfect дахин бүтээ:
- sticky filter bar (огноо, зочид, сул тоо, төрлийн chip-ууд)
- 2 хувилбар зураглал (map = дээрээс харсан газрын зураг GerMarker-уудтай,
  grid = кино суудал). README §4.2 яг үз.
- гэр дээр дарахад баруун талд GerDetail sticky панел (зураг, тоноглол,
  үнэ×хоног, "30 минут барих" товч)
- "30 минут барих" → POST /api/holds → амжилттай бол /checkout руу,
  409 бол toast анхааруулга
Бодит availability-г API-аас ав, real-time-аар шинэчил.
```

Үлдсэн дэлгэцүүд: `landing.jsx` (§4.1), `checkout.jsx` (§4.3), `reception.jsx` (§4.4), `admin.jsx` (§4.5), `guide.jsx` (§4.6). Тус бүрийг README-ийн холбогдох хэсэгт зааж өг.

---

## 📋 PROMPT 6 — Төлбөр

```
BACKEND_SPEC.md §6 ёсоор төлбөр хэрэгжүүл:
- QPay: merchant API-аар invoice+QR үүсгэ, webhook-аар баталгаажуулалт хүлээ.
  Прототипийн QRPlaceholder-г бодит QR зургаар солино. Webhook ирэхээс нааш
  захиалга баталгаажуулахгүй.
- Дансаар: банк/данс/дүн/гүйлгээний утга(=захиалгын код) харуул, гар
  баталгаажуулалт (reception/admin шалгаад баталгаажуулна).
QPay түлхүүрийг env-д хадгал.
```

---

## 📋 PROMPT 7 — Auth + контент

```
- reception/admin route-уудыг auth-аар хамгаал (NextAuth credentials,
  role: reception | admin). BACKEND_SPEC.md §7.
- Админ → Контент: зураг/бичлэгийг S3/R2 руу presigned upload, Media
  хүснэгтэд slotId-аар хадгал. Нийтийн сайт <image-slot>-ийн оронд эдгээр
  бодит зургийг харуулна (slot ID-ууд README §6-д).
```

---

## ✅ Хүлээн авах шалгуур (Codex дуусахад шалга)

- [ ] 2 хэрэглэгч нэг гэрийг нэг огноонд зэрэг захиалж **чадахгүй** (constraint).
- [ ] Web дээр hold хиймэгц reception дэлгэцэнд тэр гэр **шууд** шар болно.
- [ ] 30 мин дараа hold автоматаар суларна.
- [ ] QPay webhook ирэхээс нааш захиалга баталгаажихгүй.
- [ ] reception/admin нэвтрэлтгүй хандалт хаагдсан.
- [ ] MN/EN солигдоно, үнэ серверээс тооцоологдоно.
- [ ] Дизайн прототиптэй pixel-perfect таарна (өнгө, фонт, зай).
- [ ] Мобайл responsive (768px breakpoint).

---

## 💡 Зөвлөмж

- Codex-д нэг дор бүгдийг бүү өг — PROMPT дарааллаар, тус бүрийг батлаад ахь.
- Хамгийн эрсдэлтэй хэсэг бол **давхцал хамгаалалт (PROMPT 3)** — үүнийг эхэнд, тесттэй хий.
- Дизайн эргэлзвэл `prototype/`-ийг browser-т нээж лав. Прототип бол эцсийн харагдах байдлын эх сурвалж.
