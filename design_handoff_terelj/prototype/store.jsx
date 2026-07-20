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
   TENGER ELEVEN GER CAMP — 8 compact gers
   x,y = percent position on the grounds map
   ============================================================ */
const GER_TYPES = {
  couple: { mn:'Хосын ортой гэр', en:'Couple Ger', cap:2, price:120000, color:'#F29A1F' },
  fourbed: { mn:'4 ортой гэр', en:'Four-bed Ger', cap:4, price:120000, color:'#4FA6C4' },
};

const GERS = [
  { id:'E1', type:'couple', name:'Гэр 1', x:25, y:39 },
  { id:'E2', type:'couple', name:'Гэр 2', x:39, y:35 },
  { id:'E3', type:'couple', name:'Гэр 3', x:53, y:38 },
  { id:'E4', type:'couple', name:'Гэр 4', x:67, y:35 },
  { id:'E5', type:'fourbed', name:'Гэр 5', x:32, y:58 },
  { id:'E6', type:'fourbed', name:'Гэр 6', x:46, y:55 },
  { id:'E7', type:'fourbed', name:'Гэр 7', x:60, y:58 },
  { id:'E8', type:'fourbed', name:'Гэр 8', x:74, y:54 },
];

const GER_MEDIA = {
  couple: [
    'assets/ger-couple-interior.webp',
    'assets/ger-door-view.webp',
    'assets/camp-night-terrace.webp',
    'assets/camp-main-terrace.webp',
  ],
  fourbed: [
    'assets/ger-four-bed-interior.webp',
    'assets/ger-door-view.webp',
    'assets/camp-main-terrace.webp',
    'assets/camp-night-terrace.webp',
  ],
};
function gerMedia(id){ const g=gerById(id); return g ? GER_MEDIA[g.type] : []; }

function gerById(id){ return GERS.find(g=>g.id===id); }
function gerMeta(id){ const g=gerById(id); return g ? GER_TYPES[g.type] : null; }
function gerPrice(id){ return gerMeta(id).price; }
function gerName(id, lang){
  const g = gerById(id); if(!g) return id;
  return lang==='en' ? `${g.name} ${GER_TYPES[g.type].en}` : `${g.name} (${GER_TYPES[g.type].mn})`;
}

/* amenities per type */
const AMEN = {
  couple: [['stove','Зуух / Stove'],['bed','Хосын ор / Queen bed'],['wifi','Wi-Fi'],['fire','Гадаа гал / Fire pit']],
  fourbed: [['stove','Зуух / Stove'],['bed','4 тусдаа ор / 4 beds'],['wifi','Wi-Fi'],['fire','Гадаа гал / Fire pit']],
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
const LS_KEY = 'tenger-eleven.bookings.v2';
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
    { gerId:'E1', off:0, n:2, status:'stay', name:'Б. Ариунаа', phone:'9911-2233', count:2, ch:'web' },
    { gerId:'E3', off:0, n:3, status:'web',  name:'D. Saruul',  phone:'9090-1010', count:3, ch:'web' },
    { gerId:'E4', off:1, n:2, status:'web',  name:'Б. Энхжин',  phone:'9511-7788', count:4, ch:'web' },
    { gerId:'E6', off:0, n:1, status:'hold', name:'Веб зочин',  phone:'…',         count:2, ch:'web' },
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
  'hero.eyebrow':   ['TENGER ELEVEN · МЭЛХИЙ ХАД','TENGER ELEVEN · TURTLE ROCK'],
  'hero.title':     ['Тэнгэрийн\nдор амар','Rest under\nthe eternal sky'],
  'hero.sub':       ['Тэрэлжийн үзэсгэлэнт Мэлхий хадны ойролцоо байрлах манай гэр кемпэд байгальтайгаа ойр амраарай. Сул гэрээ огноогоор шалгаж, газрын зураг дээрээс шууд сонгоно.','Stay close to nature at our ger camp near beautiful Turtle Rock in Terelj. Check live availability and choose your ger right on the map.'],
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
  TJ, GERS, GER_TYPES, GER_MEDIA, AMEN, SERVICES, saveType,
  useBookings, useLang, tr,
  gerById, gerMeta, gerPrice, gerName, gerMedia,
  ymd, parseYMD, addDays, todayStr, nightsBetween, overlaps, fmtDate, money,
  WD_MN, WD_EN, MO_MN, MO_EN, HOLD_MIN,
});
