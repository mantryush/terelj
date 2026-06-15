# Тэрэлж Ger Resort — ажиллуулах

Энэ repo-д `design_handoff_terelj/prototype` доторх handoff prototype-ийг dependency суулгахгүйгээр serve хийх жижиг Node server нэмсэн.

```bash
npm start
```

Дараа нь:

```text
http://127.0.0.1:4173
```

Шалгалт:

```bash
npm run smoke
```

Одоогийн хувилбар нь handoff-ийн frontend prototype/MVP: MN/EN, landing, booking map/grid, checkout simulation, reception board, admin tabs, localStorage + BroadcastChannel live sync ажиллана. Production backend, Postgres exclusion constraint, auth, QPay webhook зэргийг `BACKEND_SPEC.md`-ийн дагуу дараагийн шатанд нэмнэ.
