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

const components = readFileSync('design_handoff_terelj/prototype/components.jsx', 'utf8');
for (const check of ['assets/tenger-eleven-mark.png', 'function RangeDatePicker', 'range-popover', 'ХОНОГЛОХ ӨДРҮҮД', 'flexibleRanges', 'Даваа–Ням', 'Бүх байр захиалгатай']) {
  if (!components.includes(check)) throw new Error(`Missing brand/calendar check: ${check}`);
}

const booking = readFileSync('design_handoff_terelj/prototype/booking.jsx', 'utf8');
if (!booking.includes('<RangeDatePicker')) throw new Error('Booking page is missing the range date picker');

console.log('Smoke checks passed');
