/* ============================================================
   SHARED COMPONENTS
   ============================================================ */
var useState = React.useState;
var useEffect = React.useEffect;
var useRef = React.useRef;

/* ---------- Logo: ger silhouette + soyombo-ish flame ---------- */
function Logo({ size=34, mark=false }){
  return (
    <div className="row gap-3" style={{alignItems:'center'}}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="23" fill="#2A2017"/>
        {/* ger roof */}
        <path d="M10 27 L24 13 L38 27 Z" fill="none" stroke="#C99536" strokeWidth="2.2" strokeLinejoin="round"/>
        <rect x="14" y="27" width="20" height="11" rx="1.5" fill="none" stroke="#C99536" strokeWidth="2.2"/>
        {/* door */}
        <rect x="21" y="31" width="6" height="7" rx="1" fill="#B8472A"/>
        {/* toono lines */}
        <path d="M24 13 V8 M19 16 L17 11 M29 16 L31 11" stroke="#B8472A" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
      {!mark && (
        <div className="col" style={{lineHeight:1}}>
          <span className="serif" style={{fontSize:size*0.62, fontWeight:700, letterSpacing:'-0.01em', color:'var(--ink)'}}>Тэрэлж</span>
          <span style={{fontSize:size*0.24, fontWeight:700, letterSpacing:'0.24em', color:'var(--rust)', textTransform:'uppercase', marginTop:2}}>Ger Resort</span>
        </div>
      )}
    </div>
  );
}

/* ---------- minimal stroked icons (24x24, 2px) ---------- */
const Icon = ({ d, size=22, sw=2, fill='none', children, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {d ? <path d={d}/> : children}
  </svg>
);
const Icons = {
  map:    (p)=><Icon {...p} d="M9 3 L3 6 V21 L9 18 L15 21 L21 18 V3 L15 6 L9 3 V18"/>,
  cal:    (p)=><Icon {...p}><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></Icon>,
  users:  (p)=><Icon {...p}><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5"/><path d="M16 5.5a3 3 0 0 1 0 5.5M21 20c0-2.5-1.3-4-3.5-4.6"/></Icon>,
  clock:  (p)=><Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>,
  check:  (p)=><Icon {...p} d="M4 12l5 5L20 6"/>,
  x:      (p)=><Icon {...p} d="M6 6l12 12M18 6L6 18"/>,
  arrow:  (p)=><Icon {...p} d="M5 12h14M13 6l6 6-6 6"/>,
  bolt:   (p)=><Icon {...p} d="M13 2 L4 14 H11 L10 22 L20 9 H13 Z"/>,
  pin:    (p)=><Icon {...p}><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z"/><circle cx="12" cy="10" r="2.4"/></Icon>,
  phone:  (p)=><Icon {...p} d="M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>,
  star:   (p)=><Icon {...p} d="M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.4l6-.8Z"/>,
  qr:     (p)=><Icon {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M20 14v0M14 20h3M20 17v4"/></Icon>,
  bank:   (p)=><Icon {...p}><path d="M3 9l9-5 9 5M4 9v10M20 9v10M3 21h18M8 9v10M12 9v10M16 9v10"/></Icon>,
  bed:    (p)=><Icon {...p}><path d="M3 8v11M3 18h18v-4a3 3 0 0 0-3-3H3M7 11V9a1 1 0 0 1 1-1h4v3"/></Icon>,
  fire:   (p)=><Icon {...p} d="M12 22a6 6 0 0 0 4-10c0 2-1 3-2 3 .5-3-1-6-4-8 0 3-1.5 4-3 6a6 6 0 0 0 5 9Z"/>,
  food:   (p)=><Icon {...p}><path d="M5 3v8a2 2 0 0 0 4 0V3M7 11v10M17 3c-1.5 0-2.5 2-2.5 5s1 4 2.5 4m0-9v18"/></Icon>,
  horse:  (p)=><Icon {...p} d="M5 21c0-5 2-8 6-9l-1-4 3 1 2-3 1 3 3 1-2 2c1 4-1 8-4 10"/>,
  mic:    (p)=><Icon {...p}><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></Icon>,
  ball:   (p)=><Icon {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></Icon>,
  sauna:  (p)=><Icon {...p} d="M5 13c0-4 3-7 7-7s7 3 7 7M4 21h16M8 13c0-1.5 1-2 1-3.5M12 13c0-1.5 1-2 1-3.5M16 13c0-1.5 1-2 1-3.5"/>,
  edit:   (p)=><Icon {...p} d="M4 20h4L18 10l-4-4L4 16v4ZM13 5l4 4"/>,
  trash:  (p)=><Icon {...p} d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>,
  plus:   (p)=><Icon {...p} d="M12 5v14M5 12h14"/>,
  grid:   (p)=><Icon {...p}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></Icon>,
  bell:   (p)=><Icon {...p} d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2 2 0 0 0 4 0"/>,
  wifi:   (p)=><Icon {...p} d="M2 8.5a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0M8.5 15.5a6 6 0 0 1 7 0M12 19h0"/>,
  play:   (p)=><Icon {...p} d="M7 4l13 8-13 8V4Z"/>,
  globe:  (p)=><Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"/></Icon>,
  list:   (p)=><Icon {...p} d="M8 6h13M8 12h13M8 18h13M3 6h0M3 12h0M3 18h0"/>,
};

/* ---------- Mongolian khee divider (endless knot) ---------- */
function KheeDivider({ color='var(--rust)', w=120 }){
  return (
    <svg width={w} height="14" viewBox="0 0 120 14" fill="none" style={{display:'block'}}>
      <path d="M2 7 H30 M90 7 H118" stroke={color} strokeWidth="1.4" opacity="0.5"/>
      <path d="M48 7 l6-6 6 6 -6 6 z M60 7 l6-6 6 6 -6 6 z" stroke={color} strokeWidth="1.4" fill="none"/>
      <path d="M36 7 h6 M78 7 h6" stroke={color} strokeWidth="1.4"/>
      <circle cx="42" cy="7" r="1.6" fill={color}/><circle cx="78" cy="7" r="1.6" fill={color}/>
    </svg>
  );
}

/* ---------- Language toggle ---------- */
function LangToggle({ lang, setLang }){
  return (
    <button className="row" onClick={()=>setLang(lang==='mn'?'en':'mn')}
      style={{gap:6, background:'transparent', border:'1px solid var(--line-ink)', borderRadius:'var(--r-pill)',
        padding:'6px 12px', fontWeight:700, fontSize:13, color:'var(--ink-2)'}}>
      <Icons.globe size={16}/>
      <span style={{color: lang==='mn'?'var(--ink)':'var(--ink-faint)'}}>МН</span>
      <span style={{opacity:0.4}}>/</span>
      <span style={{color: lang==='en'?'var(--ink)':'var(--ink-faint)'}}>EN</span>
    </button>
  );
}

/* ---------- status helpers ---------- */
const STATUS_META = {
  free:   { cls:'free',   mn:'Сул',          en:'Available' },
  hold:   { cls:'hold',   mn:'Түр барьсан',   en:'On hold' },
  web:    { cls:'web',    mn:'Захиалагдсан',  en:'Booked (web)' },
  walkin: { cls:'walkin', mn:'Reception',    en:'Walk-in' },
  stay:   { cls:'stay',   mn:'Амарч буй',     en:'Checked-in' },
};
function StatusBadge({ status, lang }){
  const m = STATUS_META[status] || STATUS_META.free;
  const bg = {free:'var(--st-free-bg)',hold:'var(--st-hold-bg)',web:'var(--st-web-bg)',walkin:'var(--st-walkin-bg)',stay:'var(--st-stay-bg)'}[status];
  const fg = {free:'var(--st-free)',hold:'var(--gold-deep)',web:'var(--rust-deep)',walkin:'var(--st-walkin)',stay:'var(--st-stay)'}[status];
  return (
    <span className="row" style={{gap:6, background:bg, color:fg, fontWeight:700, fontSize:12,
      padding:'4px 11px', borderRadius:'var(--r-pill)'}}>
      <span className={`dot dot-${m.cls} ${status==='hold'?'pulse':''}`}></span>
      {lang==='en'?m.en:m.mn}
    </span>
  );
}

/* ---------- hold countdown ---------- */
function useCountdown(until){
  const [left, setLeft] = useState(()=> Math.max(0, (until||0) - Date.now()));
  useEffect(()=>{
    if(!until) return;
    const i = setInterval(()=> setLeft(Math.max(0, until - Date.now())), 1000);
    return ()=>clearInterval(i);
  }, [until]);
  const m = Math.floor(left/60000), s = Math.floor((left%60000)/1000);
  return { left, label: `${m}:${String(s).padStart(2,'0')}`, done: left<=0 };
}
function HoldTimer({ until, lang }){
  const c = useCountdown(until);
  const danger = c.left < 5*60000;
  return (
    <span className="row mono" style={{gap:7, fontWeight:800, fontSize:14,
      color: danger?'var(--rust)':'var(--gold-deep)'}}>
      <Icons.clock size={16}/> {c.label}
    </span>
  );
}

/* ---------- modal ---------- */
function Modal({ open, onClose, children, width=560, pad=true }){
  if(!open) return null;
  return (
    <div onClick={onClose} style={{position:'fixed', inset:0, zIndex:120,
      background:'rgba(42,32,23,0.55)', backdropFilter:'blur(4px)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:20}}>
      <div onClick={e=>e.stopPropagation()} className="card rise" style={{
        width, maxWidth:'100%', maxHeight:'90vh', overflow:'auto', boxShadow:'var(--sh-lg)',
        padding: pad?28:0, background:'var(--card)'}}>
        {children}
      </div>
    </div>
  );
}

/* ---------- toast ---------- */
function useToast(){
  const [toast, setToast] = useState(null);
  const show = (msg, kind='ok')=>{ setToast({msg,kind,id:Date.now()}); };
  useEffect(()=>{ if(!toast) return; const t=setTimeout(()=>setToast(null), 3200); return ()=>clearTimeout(t); }, [toast]);
  const node = toast ? (
    <div className="row rise" style={{position:'fixed', bottom:26, left:'50%', transform:'translateX(-50%)',
      zIndex:200, gap:10, background:'var(--ink)', color:'var(--paper)', padding:'13px 20px',
      borderRadius:'var(--r-pill)', boxShadow:'var(--sh-lg)', fontWeight:600, fontSize:14}}>
      {toast.kind==='ok'? <Icons.check size={18}/> : toast.kind==='warn'? <Icons.bell size={18}/> : <Icons.x size={18}/>}
      {toast.msg}
    </div>
  ) : null;
  return [node, show];
}

/* ---------- stepper ---------- */
function Stepper({ value, onChange, min=1, max=20 }){
  return (
    <div className="row" style={{gap:0, border:'1px solid var(--line-ink)', borderRadius:'var(--r-pill)', overflow:'hidden'}}>
      <button onClick={()=>onChange(Math.max(min,value-1))} disabled={value<=min}
        style={stepBtn}>−</button>
      <span className="mono" style={{minWidth:36, textAlign:'center', fontWeight:800}}>{value}</span>
      <button onClick={()=>onChange(Math.min(max,value+1))} disabled={value>=max}
        style={stepBtn}>+</button>
    </div>
  );
}
const stepBtn = { width:34, height:34, border:'none', background:'var(--card-2)', fontSize:18, fontWeight:700, color:'var(--ink)' };

/* ---------- date field (native) ---------- */
function DateField({ value, onChange, min, label }){
  return (
    <label className="col" style={{gap:5, flex:1}}>
      {label && <span style={{fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)'}}>{label}</span>}
      <input type="date" value={value} min={min} onChange={e=>onChange(e.target.value)}
        style={{padding:'10px 13px', border:'1px solid var(--line-ink)', borderRadius:'var(--r)',
          background:'var(--card)', fontWeight:600, color:'var(--ink)', width:'100%'}}/>
    </label>
  );
}

Object.assign(window, {
  Logo, Icon, Icons, KheeDivider, LangToggle, StatusBadge, STATUS_META,
  useCountdown, HoldTimer, Modal, useToast, Stepper, DateField,
});
