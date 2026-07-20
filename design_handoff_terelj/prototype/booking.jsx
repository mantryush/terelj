/* ============================================================
   BOOKING — live plan map + date filter + ger detail + 30-min hold
   ============================================================ */
var useState = React.useState;
var useEffect = React.useEffect;
function GerMarker({ g, status, selected, onClick, onHover, onLeave, lang }){
  const c = {free:'var(--st-free)',hold:'var(--st-hold)',web:'var(--st-web)',walkin:'var(--st-walkin)',stay:'var(--st-stay)'}[status];
  const isFree = status==='free';
  return (
    <button className="ger-marker" onClick={onClick} onMouseEnter={onHover} onMouseLeave={onLeave} onFocus={onHover} onBlur={onLeave} title={gerName(g.id,lang)}
      style={{position:'absolute', left:`${g.x}%`, top:`${g.y}%`, transform:'translate(-50%,-50%)',
        border:'none', background:'transparent', cursor:'pointer', zIndex: selected?6:3, padding:0}}>
      <div className="row" style={{position:'relative', justifyContent:'center', flexDirection:'column', alignItems:'center', gap:3}}>
        <div className={`ger-marker-dot ${status==='hold'?'pulse':''}`} style={{
          width: selected?40:32, height: selected?40:32, borderRadius:'50%',
          background: c, display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow: selected? `0 0 0 4px var(--paper), 0 0 0 6px ${c}, 0 6px 16px rgba(0,0,0,0.3)` : '0 3px 8px rgba(0,0,0,0.28)',
          transition:'all .15s ease', color:'#FFFDF8'}}>
          {/* tiny ger glyph */}
          <svg width={selected?20:16} height={selected?20:16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
            <path d="M5 11 L12 5 L19 11"/><rect x="7" y="11" width="10" height="7" rx="1"/>
          </svg>
        </div>
        <span style={{fontSize:10.5, fontWeight:800, color:'var(--ink)', background:'rgba(251,246,234,0.85)', padding:'0px 5px', borderRadius:4, whiteSpace:'nowrap'}}>{g.id}</span>
      </div>
    </button>
  );
}

/* ---------- grounds map background ---------- */
function GroundsBg(){
  return (
    <svg viewBox="0 0 100 75" preserveAspectRatio="none" style={{position:'absolute', inset:0, width:'100%', height:'100%'}}>
      {/* compact meadow below Turtle Rock — eight nearby gers */}
      <defs>
        <linearGradient id="hill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#405B4D"/><stop offset="1" stopColor="#68815A"/></linearGradient>
      </defs>
      <path d="M0 22 L10 11 L18 19 L29 8 L40 20 L53 13 L64 22 L77 10 L87 19 L100 9 V31 H0Z" fill="url(#hill)" opacity=".9"/>
      <path d="M9 67 H91 M9 71 H91 M14 63 V74 M27 63 V74 M40 63 V74 M53 63 V74 M66 63 V74 M79 63 V74" stroke="#263C38" strokeWidth=".55" opacity=".55"/>
      <path d="M18 48 Q50 40 82 48 M22 60 Q50 52 78 60" stroke="#E8D7B7" strokeWidth="1.15" fill="none" strokeDasharray="2 1.5" opacity=".85"/>
      {[[8,33],[91,31],[12,57],[88,56]].map(([x,y],i)=>(
        <g key={i} opacity="0.5">
          {[0,1,2].map(j=><circle key={j} cx={x+j*2.2-2} cy={y+(j%2)} r="2.4" fill="#5C6E45"/>)}
        </g>
      ))}
    </svg>
  );
}

/* ---------- the interactive plan ---------- */
function PlanMap({ statusOf, selected, onSelect, lang }){
  const [hovered, setHovered] = useState(null);
  const hg = hovered ? gerById(hovered) : null;
  return (
    <div className="plan-map" style={{position:'relative', width:'100%', aspectRatio:'16/9', borderRadius:'var(--r-lg)', overflow:'hidden',
      border:'1px solid var(--line)', boxShadow:'var(--sh)',
      background:'linear-gradient(160deg, #B9C48E 0%, #A7B57A 45%, #C7BD8E 100%)'}}>
      <GroundsBg/>
      {/* zone labels */}
      <span style={zoneLbl(50,4)}>{lang==='en'?'★ Turtle Rock view':'★ Мэлхий хадны харагдац'}</span>
      <span style={zoneLbl(50,90)}>{lang==='en'?'Terrace & dining':'Террас & хоолны хэсэг'}</span>
      {GERS.map(g=>(
        <GerMarker key={g.id} g={g} status={statusOf(g.id)} selected={selected===g.id}
          onClick={()=>onSelect(g.id)} onHover={()=>setHovered(g.id)} onLeave={()=>setHovered(null)} lang={lang}/>
      ))}
      {hg && hovered!==selected && (
        <div className="ger-hover-card" style={{left:`${Math.min(78,Math.max(22,hg.x))}%`, top:`${hg.y<35?hg.y+10:hg.y-20}%`}}>
          <image-slot id={`ger-${hg.id}-main`} style={{width:72,height:62,display:'block',borderRadius:10}} shape="rounded" placeholder="зураг"></image-slot>
          <div><strong>{hg.name}</strong><span>{lang==='en'?GER_TYPES[hg.type].en:GER_TYPES[hg.type].mn} · {GER_TYPES[hg.type].cap} {lang==='en'?'guests':'хүн'}</span><b>{money(GER_TYPES[hg.type].price)} / {lang==='en'?'night':'хоног'}</b></div>
        </div>
      )}
    </div>
  );
}
const zoneLbl = (x,y)=>({position:'absolute', left:`${x}%`, top:`${y}%`, transform:'translate(-50%,-50%)',
  fontSize:11, fontWeight:800, letterSpacing:'0.08em', color:'rgba(42,32,23,0.55)', textTransform:'uppercase', whiteSpace:'nowrap'});

/* ---------- grid / cinema-seat plan ---------- */
function PlanGrid({ statusOf, selected, onSelect, lang }){
  const groups = Object.keys(GER_TYPES);
  return (
    <div className="col" style={{gap:22, padding:'8px 4px'}}>
      <div className="center" style={{padding:'10px', background:'var(--ink)', color:'var(--paper)', borderRadius:'var(--r)', fontWeight:700, letterSpacing:'0.1em', fontSize:13}}>
        ★ {lang==='en'?'TUUL RIVER — riverside view':'ТУУЛ ГОЛ — голын манзай'} ★
      </div>
      {groups.map(type=>{
        const list = GERS.filter(g=>g.type===type);
        const m = GER_TYPES[type];
        return (
          <div key={type} className="col" style={{gap:8}}>
            <div className="row" style={{gap:8, alignItems:'center'}}>
              <span style={{width:11, height:11, borderRadius:3, background:m.color}}></span>
              <span style={{fontWeight:800, fontSize:14}}>{lang==='en'?m.en:m.mn}</span>
              <span className="faint" style={{fontSize:12.5}}>· {money(m.price)}</span>
            </div>
            <div className="row" style={{gap:10, flexWrap:'wrap'}}>
              {list.map(g=>{
                const st = statusOf(g.id);
                const c = {free:'var(--st-free)',hold:'var(--st-hold)',web:'var(--st-web)',walkin:'var(--st-walkin)',stay:'var(--st-stay)'}[st];
                const sel = selected===g.id;
                return (
                  <button key={g.id} onClick={()=>onSelect(g.id)} title={gerName(g.id,lang)}
                    className={st==='hold'?'pulse':''}
                    style={{width:54, height:48, borderRadius:10, border: sel?'2px solid var(--ink)':'1px solid rgba(0,0,0,0.12)',
                      background: st==='free'? 'var(--st-free-bg)' : c, color: st==='free'?'var(--st-free)':'#FFFDF8',
                      cursor:'pointer', fontWeight:800, fontSize:12, display:'flex', flexDirection:'column',
                      alignItems:'center', justifyContent:'center', gap:2, transition:'all .12s ease',
                      transform: sel?'translateY(-2px)':'none', boxShadow: sel?'var(--sh)':'none'}}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 11 L12 5 L19 11"/><rect x="7" y="11" width="10" height="7" rx="1"/></svg>
                    {g.id}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- legend ---------- */
function Legend({ lang, counts }){
  const items = [['free',STATUS_META.free],['hold',STATUS_META.hold],['web',STATUS_META.web],['walkin',STATUS_META.walkin],['stay',STATUS_META.stay]];
  return (
    <div className="row" style={{gap:16, flexWrap:'wrap'}}>
      {items.map(([k,m])=>(
        <span key={k} className="row gap-2" style={{fontSize:13, fontWeight:600, color:'var(--ink-2)'}}>
          <span className={`dot dot-${m.cls}`}></span>{lang==='en'?m.en:m.mn}
          {counts && <span className="faint mono">({counts[k]||0})</span>}
        </span>
      ))}
    </div>
  );
}

/* ---------- ger detail panel ---------- */
function GerDetail({ gerId, status, checkIn, checkOut, guests, lang, onHold, onClose }){
  const g = gerById(gerId);
  const m = GER_TYPES[g.type];
  const nights = Math.max(1, nightsBetween(checkIn, checkOut));
  const amen = AMEN[g.type] || [];
  const booking = (status!=='free') ? TJ.bookingFor(gerId, checkIn, checkOut) : null;
  const tooSmall = guests > m.cap;
  const blocked = status!=='free';

  return (
    <div className="col" style={{gap:0}}>
      {/* gallery */}
      <div style={{position:'relative'}}>
        <image-slot id={`ger-${gerId}-main`} style={{width:'100%', height:230, display:'block'}} shape="rect" placeholder={`${gerName(gerId,lang)} — гол зураг`}></image-slot>
        <button onClick={onClose} className="row" style={{position:'absolute', top:12, right:12, width:34, height:34, justifyContent:'center', borderRadius:'50%', border:'none', background:'rgba(42,32,23,0.7)', color:'var(--paper)'}}><Icons.x size={18}/></button>
        <div style={{position:'absolute', top:12, left:12}}><StatusBadge status={status} lang={lang}/></div>
      </div>
      <div className="row" style={{gap:8, padding:'10px 0'}}>
        <image-slot id={`ger-${gerId}-2`} style={{width:'33%', height:64, display:'block', borderRadius:8}} shape="rounded" placeholder="зураг"></image-slot>
        <image-slot id={`ger-${gerId}-3`} style={{width:'33%', height:64, display:'block', borderRadius:8}} shape="rounded" placeholder="зураг"></image-slot>
        <div style={{position:'relative', width:'34%', height:64}}>
          <image-slot id={`ger-${gerId}-vid`} style={{width:'100%', height:64, display:'block', borderRadius:8}} shape="rounded" placeholder="бичлэг"></image-slot>
          <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none'}}>
            <span className="row" style={{width:30, height:30, justifyContent:'center', borderRadius:'50%', background:'rgba(42,32,23,0.6)', color:'#fff'}}><Icons.play size={15}/></span>
          </div>
        </div>
      </div>

      <div className="col" style={{gap:14, paddingTop:6}}>
        <div className="row" style={{justifyContent:'space-between', alignItems:'flex-start'}}>
          <div>
            <h2 className="serif" style={{fontSize:30, fontWeight:700}}>{g.name}</h2>
            <span className="muted" style={{fontWeight:600}}>{lang==='en'?m.en:m.mn} · {lang==='en'?`${m.cap} guests`:`${m.cap} хүн`}</span>
          </div>
          <div className="col" style={{alignItems:'flex-end', lineHeight:1.1}}>
            <span className="serif" style={{fontSize:28, fontWeight:700, color:'var(--rust)'}}>{money(m.price)}</span>
            <span className="faint" style={{fontSize:12.5}}>/ {lang==='en'?'night':'хоног'}</span>
          </div>
        </div>

        {/* amenities */}
        <div className="amenity-grid" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
          {amen.map(([k,label],i)=>{
            const AI = Icons[k] || Icons.check;
            return <span key={i} className="row gap-2" style={{fontSize:13.5, color:'var(--ink-2)'}}><span style={{color:'var(--rust)'}}><AI size={17}/></span>{label}</span>;
          })}
        </div>

        <hr className="divider-line"/>

        {/* booking summary or blocked notice */}
        {blocked ? (
          <div className="col" style={{gap:8, background:'var(--card-2)', borderRadius:'var(--r)', padding:'14px 16px'}}>
            <span className="row gap-2" style={{fontWeight:800, fontSize:14}}>
              {status==='hold'? <Icons.clock size={18}/> : <Icons.x size={18}/>}
              {status==='hold'
                ? (lang==='en'?'Held by another guest':'Өөр зочин түр барьсан')
                : (lang==='en'?'Not available for these dates':'Энэ өдрүүдэд сул биш')}
            </span>
            {status==='hold' && booking?.holdUntil && (
              <div className="row gap-2" style={{fontSize:13}}><span className="muted">{lang==='en'?'Frees in':'Сулрах хүртэл'}:</span><HoldTimer until={booking.holdUntil} lang={lang}/></div>
            )}
            <span className="faint" style={{fontSize:13}}>{lang==='en'?'Pick other dates or another ger.':'Өөр огноо эсвэл өөр гэр сонгоно уу.'}</span>
          </div>
        ) : (
          <div className="col" style={{gap:12}}>
            <div className="row" style={{justifyContent:'space-between'}}>
              <span className="muted">{money(m.price)} × {nights} {lang==='en'?'nights':'хоног'}</span>
              <span style={{fontWeight:700}}>{money(m.price*nights)}</span>
            </div>
            {tooSmall && <span className="row gap-2" style={{fontSize:13, color:'var(--rust)', fontWeight:600}}><Icons.bell size={15}/>{lang==='en'?`Max ${m.cap} guests for this ger`:`Энэ гэр ${m.cap} хүртэл хүн`}</span>}
            <button className="btn btn-primary btn-block" disabled={tooSmall} onClick={()=>onHold(gerId)}>
              <Icons.clock size={18}/> {lang==='en'?'Hold for 30 min & continue':'30 минут барьж үргэлжлүүлэх'}
            </button>
            <span className="faint center" style={{fontSize:12}}>{lang==='en'?'No charge yet — we reserve it while you check out.':'Одоохондоо төлбөргүй — захиалга баталгаажтал хадгална.'}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   Booking page
   ============================================================ */
function Booking({ lang, t, go, planVariant='map', showToast, initialSearch={} }){
  const tj = useBookings();
  const today = todayStr();
  const [checkIn, setCheckIn] = useState(initialSearch.checkIn||today);
  const [checkOut, setCheckOut] = useState(initialSearch.checkOut||addDays(today,1));
  const [guests, setGuests] = useState(initialSearch.guests||2);
  const [filterType, setFilterType] = useState('all');
  const [selected, setSelected] = useState(null);

  // keep checkout > checkin
  useEffect(()=>{ if(nightsBetween(checkIn,checkOut) < 1) setCheckOut(addDays(checkIn,1)); }, [checkIn]);

  const statusOf = (id)=>{
    const g = gerById(id);
    if(filterType!=='all' && g.type!==filterType) return 'free'; // still show but we grey via opacity? keep simple
    return tj.statusForRange(id, checkIn, checkOut);
  };
  const counts = GERS.reduce((a,g)=>{ const s=tj.statusForRange(g.id,checkIn,checkOut); a[s]=(a[s]||0)+1; return a; }, {});
  const freeCount = counts.free||0;

  const doHold = (gerId)=>{
    const res = TJ.hold({ gerId, checkIn, checkOut, channel:'web', guest:{count:guests} });
    if(res.error){
      showToast(lang==='en'?'Just taken by someone else — try another':'Энэ гэрийг дөнгөж сонгочихлоо — өөрийг сонгоно уу', 'warn');
      setSelected(null);
      return;
    }
    go('checkout', { bookingId: res.booking.id });
  };

  return (
    <div className="wrap" style={{padding:'26px 28px 60px'}}>
      {/* filter bar */}
      <div className="card" style={{padding:'16px 18px', marginBottom:20, position:'sticky', top:74, zIndex:20, boxShadow:'var(--sh)'}}>
        <div className="row" style={{gap:16, flexWrap:'wrap', alignItems:'flex-end'}}>
          <RangeDatePicker checkIn={checkIn} checkOut={checkOut} onCheckIn={setCheckIn} onCheckOut={setCheckOut} min={today} lang={lang}/>
          <div className="col" style={{gap:5}}>
            <span style={{fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)'}}>{t('book.guests')}</span>
            <Stepper value={guests} onChange={setGuests} min={1} max={10}/>
          </div>
          <div className="grow"></div>
          <div className="col center" style={{gap:2}}>
            <span className="serif" style={{fontSize:30, fontWeight:700, color:'var(--st-free)', lineHeight:1}}>{freeCount}</span>
            <span className="faint" style={{fontSize:11.5, fontWeight:700}}>{lang==='en'?'free · '+nightsBetween(checkIn,checkOut)+'n':'сул · '+nightsBetween(checkIn,checkOut)+' хоног'}</span>
          </div>
        </div>
        <div className="row" style={{gap:8, marginTop:14, flexWrap:'wrap'}}>
          {['all',...Object.keys(GER_TYPES)].map(ty=>(
            <button key={ty} onClick={()=>setFilterType(ty)}
              className="chip" style={{cursor:'pointer',
                background: filterType===ty?'var(--ink)':'var(--card-2)',
                color: filterType===ty?'var(--paper)':'var(--ink-2)',
                borderColor: filterType===ty?'var(--ink)':'var(--line)'}}>
              {ty==='all'?(lang==='en'?'All':'Бүгд'):(lang==='en'?GER_TYPES[ty].en:GER_TYPES[ty].mn)}
            </button>
          ))}
        </div>
      </div>

      <div className="booking-layout" style={{display:'grid', gridTemplateColumns: selected?'1.5fr 1fr':'1fr', gap:24, alignItems:'start'}}>
        {/* plan */}
        <div className="col" style={{gap:14}}>
          <div className="row" style={{justifyContent:'space-between', flexWrap:'wrap', gap:10}}>
            <h2 className="serif" style={{fontSize:24, fontWeight:700}}>{lang==='en'?'Resort map':'Амралтын газрын зураг'}</h2>
            <Legend lang={lang} counts={counts}/>
          </div>
          {planVariant==='grid'
            ? <PlanGrid statusOf={statusOf} selected={selected} onSelect={setSelected} lang={lang}/>
            : <PlanMap statusOf={statusOf} selected={selected} onSelect={setSelected} lang={lang}/>}
          <p className="faint center" style={{fontSize:13}}>{lang==='en'?'Tap a ger to see photos, video and book.':'Зураг, бичлэг үзэх, захиалахын тулд гэр дээр дар.'}</p>
        </div>

        {/* detail */}
        {selected && (
          <div className="card rise detail-card" style={{padding:18, position:'sticky', top:230, maxHeight:'calc(100vh - 250px)', overflow:'auto'}}>
            <GerDetail gerId={selected} status={tj.statusForRange(selected,checkIn,checkOut)}
              checkIn={checkIn} checkOut={checkOut} guests={guests} lang={lang}
              onHold={doHold} onClose={()=>setSelected(null)}/>
          </div>
        )}
      </div>
    </div>
  );
}

window.Booking = Booking;
