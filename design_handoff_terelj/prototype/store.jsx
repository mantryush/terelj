/* ============================================================
   STORE — ger data, live booking sync, i18n
   Exposed on window: TJ (store), useBookings, useLang, T, GERS, fmt...
   ============================================================ */

/* ---------- date helpers ---------- */
function pad(n){ return String(n).padStart(2,'0'); }
function ymd(d){ return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function parseYMD(s){ const [y,m,d]=s.split('-').map(Number); return new Date(y,m-1,d); }
function addDays(s, n){ const d = parseYMD(s); d.setDate(d.getDate()+n); return ymd(d); }
function todayStr(){ return ymd(new Date()); }
function nightsBetween(a,b){ return Math.round((parseYMD(b)-parseYMD(a))/86400000); }
function overlaps(aIn,aOut,bIn,bOut){ return aIn < bOut && bIn < aOut; }
const WD_MN = ['Ням','Даваа','Мягмар','Лхагва','Пүрэв','Баасан','Бямба'];
const WD_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MO_MN = ['1-р сар','2-р сар','3-р сар','4-р сар','5-р сар','6-р сар','7-р сар','8-р сар','9-р сар','10-р сар','11-р сар','12-р сар'];
function fmtDate(s, lang){
  const d = parseYMD(s);
  if(lang==='en') return `${MO_EN[d.getMonth()]} ${d.getDate()}`;
  return `${d.getMonth()+1}-р сарын ${d.getDate()}`;
}
const MO_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function money(n){ return '₮' + n.toLocaleString('en-US'); }

/* ============================================================
   GER / BUILDING CATALOG  (20 units on the resort map)
   x,y = percent position on the grounds map
   ============================================================ */
const GER_TYPES = {
  energiin: { mn:'Энгийн гэр',     en:'Classic Ger',  cap:4, price:120000, color:'#C99536' },
  family:   { mn:'Гэр бүлийн гэр', en:'Family Ger',   cap:6, price:180000, color:'#B8472A' },
  vip:      { mn:'VIP гэр',        en:'VIP Ger',      cap:4, price:260000, color:'#6E4A63' },
  luxe:     { mn:'Luxe гэр',       en:'Luxe Ger',     cap:2, price:340000, color:'#2E6E8E' },
  cabin:    { mn:'Модон байшин',   en:'Wood Cabin',   cap:8, price:480000, color:'#5C6E45' },
};

const GERS = [
  // ---- riverside luxe row ----
  { id:'L1', type:'luxe',     name:'Сэлэнгэ', x:18, y:20 },
  { id:'L2', type:'luxe',     name:'Хөвсгөл', x:30, y:16 },
  { id:'L3', type:'luxe',     name:'Орхон',   x:43, y:18 },
  // ---- cabins on the hill ----
  { id:'C1', type:'cabin',    name:'Хан гэр', x:64, y:14 },
  { id:'C2', type:'cabin',    name:'Тэрэлж',  x:78, y:19 },
  // ---- VIP cluster ----
  { id:'V1', type:'vip',      name:'Бүргэд',  x:14, y:42 },
  { id:'V2', type:'vip',      name:'Шонхор',  x:26, y:46 },
  { id:'V3', type:'vip',      name:'Тас',     x:38, y:43 },
  { id:'V4', type:'vip',      name:'Харцага', x:50, y:47 },
  // ---- family gers ----
  { id:'F1', type:'family',   name:'Алтай',   x:66, y:40 },
  { id:'F2', type:'family',   name:'Хангай',  x:78, y:45 },
  { id:'F3', type:'family',   name:'Говь',    x:88, y:38 },
  // ---- classic gers (camp circle) ----
  { id:'E1', type:'energiin', name:'Цагаан',  x:20, y:70 },
  { id:'E2', type:'energiin', name:'Шарга',   x:31, y:74 },
  { id:'E3', type:'energiin', name:'Хээр',    x:42, y:71 },
  { id:'E4', type:'energiin', name:'Зээрд',   x:53, y:75 },
  { id:'E5', type:'energiin', name:'Хонгор',  x:64, y:72 },
  { id:'E6', type:'energiin', name:'Бор',     x:74, y:76 },
  { id:'E7', type:'energiin', name:'Халтар',  x:84, y:70 },
  { id:'E8', type:'energiin', name:'Сартай',  x:90, y:60 },
];

function gerById(id){ return GERS.find(g=>g.id===id); }
function gerMeta(id){ const g=gerById(id); return g ? GER_TYPES[g.type] : null; }
function gerPrice(id){ return gerMeta(id).price; }
function gerName(id, lang){
  const g = gerById(id); if(!g) return id;
  return lang==='en' ? `${g.name} ${GER_TYPES[g.type].en}` : `${g.name} (${GER_TYPES[g.type].mn})`;
}

/* amenities per type */
const AMEN = {
  energiin: [['stove','Зуух / Stove'],['bed','4 ор / 4 beds'],['wifi','Wi-Fi'],['fire','Гадаа гал / Fire pit']],
  family:   [['stove','Зуух'],['bed','6 ор'],['wifi','Wi-Fi'],['fire','Гадаа гал'],['table','Хоолны майхан']],
  vip:      [['bath','Угаалгын өрөө'],['bed','Зочны өрөө'],['wifi','Wi-Fi'],['heat','Дулаан шал'],['view','Голын манзай']],
  luxe:     [['bath','Жакузи / Jacuzzi'],['bed','King ор'],['wifi','Хурдан Wi-Fi'],['heat','Дулаан шал'],['view','Панорам цонх'],['bar','Mini bar']],
  cabin:    [['bath','2 угаалгын өрөө'],['bed','8 ор / 4 өрөө'],['kitchen','Тоног бүхий гал тогоо'],['wifi','Wi-Fi'],['fire','Цахилгаан зуух'],['deck','Модон тагт']],
};

/* extra services */
const SERVICES = [
  { id:'food',     mn:'Хоол (3 удаа)',        en:'Full board (3 meals)', price:45000, icon:'food' },
  { id:'horse',    mn:'Морь унах (1 цаг)',    en:'Horse riding (1h)',    price:35000, icon:'horse' },
  { id:'karaoke',  mn:'Караоке (1 цаг)',      en:'Karaoke (1h)',         price:40000, icon:'mic' },
  { id:'billiard', mn:'Биллиард (1 цаг)',     en:'Billiards (1h)',       price:25000, icon:'ball' },
  { id:'sauna',    mn:'Финланд сауна',        en:'Finnish sauna',        price:60000, icon:'sauna' },
  { id:'bbq',      mn:'Хорхог / BBQ багц',    en:'Khorkhog / BBQ set',   price:90000, icon:'fire' },
];

/* ============================================================
   BOOKING STORE — localStorage + BroadcastChannel live sync
   ============================================================ */
const LS_KEY = 'terelj.bookings.v1';
const HOLD_MIN = 30;
window.HOLD_MIN = HOLD_MIN;

const TJ = (function(){
  let listeners = [];
  let bc = null;
  try { bc = new BroadcastChannel('terelj'); } catch(e){}

  function read(){
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
    catch(e){ return []; }
  }
  function write(list){
    localStorage.setItem(LS_KEY, JSON.stringify(list));
    notify();
    if(bc) bc.postMessage({t:'update'});
  }
  function notify(){ listeners.forEach(fn=>fn()); }

  if(bc) bc.onmessage = ()=> notify();
  window.addEventListener('storage', (e)=>{ if(e.key===LS_KEY) notify(); });

  /* expire stale holds lazily */
  function live(){
    const now = Date.now();
    let list = read();
    let changed = false;
    list = list.filter(b=>{
      if(b.status==='hold' && b.holdUntil && b.holdUntil < now){ changed = true; return false; }
      return true;
    });
    if(changed) localStorage.setItem(LS_KEY, JSON.stringify(list));
    return list;
  }

  return {
    HOLD_MIN,
    subscribe(fn){ listeners.push(fn); return ()=>{ listeners = listeners.filter(l=>l!==fn); }; },
    all(){ return live(); },
    forGer(gerId){ return live().filter(b=>b.gerId===gerId); },
    notify,

    /* status of a ger for a date range */
    statusForRange(gerId, checkIn, checkOut){
      const bs = live().filter(b=>b.gerId===gerId && overlaps(checkIn,checkOut,b.checkIn,b.checkOut));
      if(bs.length===0) return 'free';
      // priority: stay > web/walkin booked > hold
      if(bs.some(b=>b.status==='stay')) return 'stay';
      if(bs.some(b=>b.status==='web')) return 'web';
      if(bs.some(b=>b.status==='walkin')) return 'walkin';
      if(bs.some(b=>b.status==='hold')) return 'hold';
      return 'free';
    },
    bookingFor(gerId, checkIn, checkOut){
      return live().find(b=>b.gerId===gerId && overlaps(checkIn,checkOut,b.checkIn,b.checkOut));
    },

    /* create a 30-min hold (returns booking) */
    hold({gerId, checkIn, checkOut, channel='web', guest}){
      const list = live();
      // guard: someone else may hold/book in the meantime
      const st = this.statusForRange(gerId, checkIn, checkOut);
      if(st!=='free') return { error: st };
      const b = {
        id: 'B'+Date.now()+Math.floor(Math.random()*99),
        gerId, checkIn, checkOut, channel,
        guest: guest||null,
        status: 'hold',
        holdUntil: Date.now() + HOLD_MIN*60000,
        createdAt: Date.now(),
        services: [],
        payment: null,
      };
      list.push(b); write(list);
      return { booking: b };
    },

    update(id, patch){
      const list = live();
      const i = list.findIndex(b=>b.id===id);
      if(i<0) return null;
      list[i] = { ...list[i], ...patch };
      write(list);
      return list[i];
    },

    confirm(id, {channel, guest, payment, services}){
      return this.update(id, {
        status: channel==='reception' ? 'walkin' : 'web',
        holdUntil: null,
        guest: guest || undefined,
        payment: payment || undefined,
        services: services || undefined,
        confirmedAt: Date.now(),
      });
    },

    checkIn(id){ return this.update(id, { status:'stay', checkedInAt: Date.now() }); },
    checkOut(id){ return this.update(id, { status:'done', checkedOutAt: Date.now() }); },

    /* reception direct walk-in booking */
    walkIn({gerId, checkIn, checkOut, guest, payment}){
      const st = this.statusForRange(gerId, checkIn, checkOut);
      if(st!=='free') return { error: st };
      const list = live();
      const b = {
        id:'B'+Date.now()+Math.floor(Math.random()*99),
        gerId, checkIn, checkOut, channel:'reception',
        guest, status:'walkin', holdUntil:null,
        createdAt: Date.now(), confirmedAt: Date.now(),
        services: [], payment: payment||{method:'cash', paid:true},
      };
      list.push(b); write(list);
      return { booking:b };
    },

    cancel(id){
      const list = live().filter(b=>b.id!==id);
      write(list);
    },

    raw: read,
    _write: write,
    seed,
  };
})();

/* ---------- seed demo data so the place looks alive ---------- */
function seed(force){
  if(!force && localStorage.getItem(LS_KEY)) return;
  const t = todayStr();
  const demo = [
    { gerId:'L1', off:0,  n:2, status:'stay',   name:'Б. Ариунаа',  phone:'9911-2233', count:2, ch:'web' },
    { gerId:'E2', off:0,  n:1, status:'stay',   name:'Г. Тэмүүлэн', phone:'8800-5521', count:4, ch:'reception' },
    { gerId:'V1', off:0,  n:3, status:'web',    name:'D. Saruul',   phone:'9090-1010', count:3, ch:'web' },
    { gerId:'F1', off:1,  n:2, status:'web',    name:'Б. Энхжин',   phone:'9511-7788', count:5, ch:'web' },
    { gerId:'C1', off:2,  n:2, status:'web',    name:'M. Bold',     phone:'9919-0303', count:7, ch:'web' },
    { gerId:'E5', off:0,  n:1, status:'walkin', name:'Зочин',       phone:'—',         count:3, ch:'reception' },
    { gerId:'V3', off:0,  n:1, status:'hold',   name:'Веб зочин',   phone:'…',         count:2, ch:'web' },
  ];
  const list = demo.map((d,i)=>({
    id:'SEED'+i,
    gerId:d.gerId,
    checkIn: addDays(t, d.off),
    checkOut: addDays(t, d.off+d.n),
    channel:d.ch,
    status:d.status,
    holdUntil: d.status==='hold' ? Date.now()+18*60000 : null,
    guest:{ name:d.name, phone:d.phone, count:d.count },
    createdAt: Date.now()-i*3600000,
    services: [],
    payment: d.status==='hold' ? null : { method: d.ch==='reception'?'cash':'qpay', paid:true, amount: gerPrice(d.gerId)*d.n },
  }));
  TJ._write(list);
}

/* ============================================================
   React hooks
   ============================================================ */
function useBookings(){
  const [, force] = React.useReducer(x=>x+1, 0);
  React.useEffect(()=> TJ.subscribe(force), []);
  // tick every 15s so hold timers / statuses refresh
  React.useEffect(()=>{ const i=setInterval(force, 15000); return ()=>clearInterval(i); }, []);
  return TJ;
}

/* ---------- i18n ---------- */
const STR = {
  // nav
  'nav.home':       ['Нүүр','Home'],
  'nav.book':       ['Захиалга','Book'],
  'nav.guide':      ['Заавар','Guide'],
  'nav.reception':  ['Reception','Reception'],
  'nav.admin':      ['Админ','Admin'],
  'nav.bookNow':    ['Захиалах','Book now'],
  // landing
  'hero.eyebrow':   ['ТЭРЭЛЖ · ХАН ХЭНТИЙ','TERELJ · KHAN KHENTII'],
  'hero.title':     ['Тэнгэрийн\nдор амар','Rest under\nthe eternal sky'],
  'hero.sub':       ['Горхи-Тэрэлжийн зүрхэнд, голын эрэг дээр байрлах 20 гэр, модон байшин. Бодит цагийн захиалга — хүссэн гэрээ газрын зураг дээрээс сонго.','20 gers and wood cabins on the riverbank in the heart of Gorkhi-Terelj. Live booking — pick your ger right on the map.'],
  'hero.cta':       ['Гэр сонгох','Choose a ger'],
  'hero.cta2':      ['Үнэ & багц','Prices'],
  // generic
  'book.checkin':   ['Ирэх','Check-in'],
  'book.checkout':  ['Гарах','Check-out'],
  'book.guests':    ['Зочид','Guests'],
  'book.nights':    ['хоног','nights'],
  'status.free':    ['Сул','Available'],
  'status.hold':    ['Түр барьсан','On hold'],
  'status.web':     ['Захиалагдсан','Booked'],
  'status.walkin':  ['Reception','Walk-in'],
  'status.stay':    ['Амарч буй','Checked-in'],
};
function tr(key, lang){ const e = STR[key]; if(!e) return key; return e[lang==='en'?1:0]; }

function useLang(){
  const [lang, setLangState] = React.useState(()=> localStorage.getItem('terelj.lang') || 'mn');
  const setLang = (l)=>{ localStorage.setItem('terelj.lang', l); setLangState(l); };
  const t = (k)=>tr(k, lang);
  return [lang, setLang, t];
}

/* ---------- editable type config (admin price/name overrides) ---------- */
(function loadCfg(){
  try { const o = JSON.parse(localStorage.getItem('terelj.types')||'{}');
    Object.keys(o).forEach(k=>{ if(GER_TYPES[k]) Object.assign(GER_TYPES[k], o[k]); }); } catch(e){}
})();
function saveType(type, patch){
  Object.assign(GER_TYPES[type], patch);
  const o = JSON.parse(localStorage.getItem('terelj.types')||'{}');
  o[type] = { ...(o[type]||{}), ...patch };
  localStorage.setItem('terelj.types', JSON.stringify(o));
  TJ.notify();
}

/* expose */
Object.assign(window, {
  TJ, GERS, GER_TYPES, AMEN, SERVICES, saveType,
  useBookings, useLang, tr,
  gerById, gerMeta, gerPrice, gerName,
  ymd, parseYMD, addDays, todayStr, nightsBetween, overlaps, fmtDate, money,
  WD_MN, WD_EN, MO_MN, MO_EN, HOLD_MIN,
});
