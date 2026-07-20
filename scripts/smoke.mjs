import { readFileSync } from 'node:fs';

const files = [
  'design_handoff_terelj/README.md',
  'design_handoff_terelj/BACKEND_SPEC.md',
  'design_handoff_terelj/prototype/index.html',
  'design_handoff_terelj/prototype/store.jsx',
  'design_handoff_terelj/prototype/app.jsx',
  'design_handoff_terelj/prototype/landing.jsx',
  'design_handoff_terelj/prototype/booking.jsx',
  'design_handoff_terelj/prototype/checkout.jsx',
  'design_handoff_terelj/prototype/reception.jsx',
  'design_handoff_terelj/prototype/admin.jsx',
  'design_handoff_terelj/prototype/guide.jsx',
  'design_handoff_terelj/prototype/styles.css'
];

for (const file of files) {
  const text = readFileSync(file, 'utf8');
  if (!text.trim()) throw new Error(`${file} is empty`);
}

const css = readFileSync('design_handoff_terelj/prototype/styles.css', 'utf8');
for (const token of ['--paper:      #F7F2E7', '--rust:       #0B2A50', '--st-hold-bg: #F3E2B5', '@media (max-width: 980px)', '.quick-search']) {
  if (!css.includes(token)) throw new Error(`Missing CSS token/check: ${token}`);
}

const store = readFileSync('design_handoff_terelj/prototype/store.jsx', 'utf8');
for (const check of ['const GERS = [', 'const SERVICES = [', 'statusForRange', 'walkIn']) {
  if (!store.includes(check)) throw new Error(`Missing store check: ${check}`);
}
const coupleCount = (store.match(/\{ id:'E\d', type:'couple'/g) || []).length;
const fourBedCount = (store.match(/\{ id:'E\d', type:'fourbed'/g) || []).length;
if (coupleCount !== 4 || fourBedCount !== 4) throw new Error(`Expected 4 couple and 4 four-bed gers, found ${coupleCount}/${fourBedCount}`);
for (const asset of ['ger-couple-interior.webp','ger-four-bed-interior.webp','ger-door-view.webp','camp-night-terrace.webp','camp-main-terrace.webp','terelj-cover.webp']) {
  readFileSync(`design_handoff_terelj/prototype/assets/${asset}`);
}

const components = readFileSync('design_handoff_terelj/prototype/components.jsx', 'utf8');
for (const check of ['assets/tenger-eleven-mark.png', 'function RangeDatePicker', 'ReactDOM.createPortal', 'range-popover', 'ХОНОГЛОХ ӨДРҮҮД', 'flexibleRanges', 'Даваа–Ням', 'Бүх гэр захиалгатай']) {
  if (!components.includes(check)) throw new Error(`Missing brand/calendar check: ${check}`);
}
for (const check of ["free:   { cls:'free'", "booked: { cls:'booked'", "function displayStatus"]) {
  if (!components.includes(check)) throw new Error(`Missing two-state availability check: ${check}`);
}

const booking = readFileSync('design_handoff_terelj/prototype/booking.jsx', 'utf8');
for (const check of ['<RangeDatePicker', 'ger-hover-card']) {
  if (!booking.includes(check)) throw new Error(`Booking experience is missing: ${check}`);
}

const landing = readFileSync('design_handoff_terelj/prototype/landing.jsx', 'utf8');
for (const check of ['function InlineBookingExplorer', 'id="availability"', '<PlanMap', '<GerDetail']) {
  if (!landing.includes(check)) throw new Error(`Inline booking experience is missing: ${check}`);
}

console.log('Smoke checks passed');
