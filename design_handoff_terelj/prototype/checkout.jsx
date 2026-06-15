/* ============================================================
   CHECKOUT — summary · services · QPay / bank · confirm
   ============================================================ */
var useState = React.useState;
var useEffect = React.useEffect;
function bookingCode(id){
  let h=0; for(const c of id) h=(h*31+c.charCodeAt(0))>>>0;
  return 'TJ-' + String(h%100000).padStart(5,'0');
}

function QRPlaceholder({ size=180 }){
  // deterministic pseudo-QR
  const n=21, cells=[];
  for(let y=0;y<n;y++) for(let x=0;x<n;x++){
    const corner = (x<7&&y<7)||(x>=n-7&&y<7)||(x<7&&y>=n-7);
    const on = corner ? ((x===0||x===6||y===0||y===6||(x>=2&&x<=4&&y>=2&&y<=4)) ? 1:0) : (((x*7+y*13+x*y)%3===0)?1:0);
    if(on) cells.push(<rect key={x+'-'+y} x={x} y={y} width="1" height="1"/>);
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${n} ${n}`} style={{background:'#fff', borderRadius:10, padding:6, boxSizing:'content-box'}}>
      <g fill="#2A2017">{cells}</g>
    </svg>
  );
}

function ServiceRow({ s, on, toggle, lang }){
  const I = Icons[s.icon] || Icons.star;
  return (
    <button onClick={toggle} className="row" style={{gap:12, width:'100%', textAlign:'left', padding:'11px 14px',
      borderRadius:'var(--r)', border:`1px solid ${on?'var(--rust)':'var(--line)'}`,
      background: on?'var(--st-web-bg)':'var(--card)', cursor:'pointer', transition:'all .12s'}}>
      <span style={{color: on?'var(--rust)':'var(--ink-3)'}}><I size={20}/></span>
      <span className="grow" style={{fontWeight:600, fontSize:14}}>{lang==='en'?s.en:s.mn}</span>
      <span className="mono faint" style={{fontSize:13}}>{money(s.price)}</span>
      <span className="row" style={{justifyContent:'center', width:22, height:22, borderRadius:6, border:`1.5px solid ${on?'var(--rust)':'var(--line-ink)'}`, background:on?'var(--rust)':'transparent', color:'#fff'}}>{on && <Icons.check size={14}/>}</span>
    </button>
  );
}

function Checkout({ lang, t, go, bookingId, showToast }){
  const tj = useBookings();
  const all = tj.all();
  const booking = all.find(b=>b.id===bookingId);
  const [name, setName] = useState(booking?.guest?.name||'');
  const [phone, setPhone] = useState(booking?.guest?.phone||'');
  const [count, setCount] = useState(booking?.guest?.count||2);
  const [services, setServices] = useState([]);
  const [method, setMethod] = useState('qpay');
  const [stage, setStage] = useState('form'); // form | pay | done
  const [paying, setPaying] = useState(false);
  const cd = useCountdown(booking?.holdUntil);

  if(!booking){
    return (
      <div className="wrap-narrow center col" style={{gap:18, padding:'90px 28px', alignItems:'center'}}>
        <Icons.clock size={46}/>
        <h2 className="serif" style={{fontSize:30, fontWeight:700}}>{lang==='en'?'This hold has expired':'Барьцаа дууссан байна'}</h2>
        <p className="muted">{lang==='en'?'No worries — pick your ger again.':'Зүгээр ээ — гэрээ дахин сонгоорой.'}</p>
        <button className="btn btn-primary" onClick={()=>go('book')}><Icons.map size={18}/> {lang==='en'?'Back to map':'Газрын зураг руу'}</button>
      </div>
    );
  }

  const g = gerById(booking.gerId);
  const m = GER_TYPES[g.type];
  const nights = nightsBetween(booking.checkIn, booking.checkOut);
  const roomTotal = m.price*nights;
  const svcTotal = services.reduce((a,id)=> a + (SERVICES.find(s=>s.id===id)?.price||0), 0)*nights;
  const total = roomTotal + svcTotal;
  const holdExpired = cd.done;

  const toggleSvc = (id)=> setServices(s=> s.includes(id)? s.filter(x=>x!==id) : [...s,id]);

  const confirmPaid = ()=>{
    setPaying(true);
    setTimeout(()=>{
      TJ.confirm(bookingId, {
        channel:'web',
        guest:{ name: name||'Веб зочин', phone, count },
        payment:{ method, paid:true, amount: total },
        services,
      });
      setPaying(false);
      setStage('done');
    }, 1500);
  };

  /* ---------- DONE ---------- */
  if(stage==='done'){
    return (
      <div className="wrap-narrow" style={{padding:'40px 28px 80px'}}>
        <div className="card rise" style={{padding:'40px 34px', textAlign:'center'}}>
          <div className="row" style={{justifyContent:'center', marginBottom:18}}>
            <div className="row" style={{justifyContent:'center', width:72, height:72, borderRadius:'50%', background:'var(--st-free-bg)', color:'var(--st-free)'}}><Icons.check size={40}/></div>
          </div>
          <h2 className="serif" style={{fontSize:34, fontWeight:700}}>{lang==='en'?'Booking confirmed!':'Захиалга баталгаажлаа!'}</h2>
          <p className="muted" style={{marginTop:6}}>{lang==='en'?'Show this code at reception on arrival.':'Ирэхдээ ресепшнд энэ кодоо үзүүлээрэй.'}</p>
          <div className="col" style={{gap:4, alignItems:'center', margin:'24px 0', padding:'20px', background:'var(--card-2)', borderRadius:'var(--r)'}}>
            <span className="faint" style={{fontSize:12, fontWeight:700, letterSpacing:'0.1em'}}>{lang==='en'?'BOOKING CODE':'ЗАХИАЛГЫН КОД'}</span>
            <span className="serif mono" style={{fontSize:40, fontWeight:700, color:'var(--rust)', letterSpacing:'0.04em'}}>{bookingCode(bookingId)}</span>
          </div>
          <div className="col" style={{gap:9, textAlign:'left', maxWidth:380, margin:'0 auto'}}>
            <Line l={gerName(booking.gerId,lang)} r={`${money(m.price)}×${nights}`}/>
            <Line l={`${fmtDate(booking.checkIn,lang)} → ${fmtDate(booking.checkOut,lang)}`} r={`${nights} ${lang==='en'?'nights':'хоног'}`}/>
            <Line l={lang==='en'?'Guest':'Зочин'} r={name||'—'}/>
            <hr className="divider-line"/>
            <Line l={lang==='en'?'Paid':'Төлсөн'} r={money(total)} bold/>
          </div>
          <div className="row" style={{gap:10, justifyContent:'center', marginTop:26}}>
            <button className="btn btn-ghost" onClick={()=>go('guide')}>{lang==='en'?'Arrival guide':'Ирэх заавар'}</button>
            <button className="btn btn-primary" onClick={()=>go('home')}>{lang==='en'?'Done':'Дуусгах'}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap checkout-layout" style={{padding:'24px 28px 70px', display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:28, alignItems:'start'}}>
      {/* LEFT */}
      <div className="col" style={{gap:20}}>
        {/* hold banner */}
        <div className="row" style={{justifyContent:'space-between', padding:'12px 18px', borderRadius:'var(--r)',
          background: holdExpired?'var(--st-web-bg)':'var(--st-hold-bg)', border:`1px solid ${holdExpired?'var(--rust)':'var(--gold)'}`}}>
          <span className="row gap-2" style={{fontWeight:700, fontSize:14}}>
            <Icons.clock size={18}/>
            {holdExpired? (lang==='en'?'Hold expired':'Барьцаа дууслаа') : (lang==='en'?'Held for you':'Танд барьж байна')}
          </span>
          {!holdExpired
            ? <HoldTimer until={booking.holdUntil} lang={lang}/>
            : <button className="btn btn-sm btn-ghost" onClick={()=>go('book')}>{lang==='en'?'Pick again':'Дахин сонгох'}</button>}
        </div>

        {stage==='form' && (
          <React.Fragment>
            {/* guest info */}
            <div className="card" style={{padding:'22px 24px'}}>
              <h3 className="serif" style={{fontSize:22, fontWeight:700, marginBottom:16}}>{lang==='en'?'Your details':'Таны мэдээлэл'}</h3>
              <div className="col" style={{gap:14}}>
                <Field label={lang==='en'?'Full name':'Овог нэр'}>
                  <input value={name} onChange={e=>setName(e.target.value)} placeholder={lang==='en'?'e.g. Bat-Erdene':'ж: Бат-Эрдэнэ'} style={inp}/>
                </Field>
                <div className="row guest-row" style={{gap:14}}>
                  <Field label={lang==='en'?'Phone':'Утас'} grow>
                    <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="9911-2233" style={inp}/>
                  </Field>
                  <Field label={t('book.guests')}>
                    <div style={{paddingTop:2}}><Stepper value={count} onChange={setCount} min={1} max={m.cap}/></div>
                  </Field>
                </div>
              </div>
            </div>

            {/* services */}
            <div className="card" style={{padding:'22px 24px'}}>
              <h3 className="serif" style={{fontSize:22, fontWeight:700, marginBottom:4}}>{lang==='en'?'Add experiences':'Нэмэлт үйлчилгээ'}</h3>
              <p className="faint" style={{fontSize:13, marginBottom:16}}>{lang==='en'?'Optional · priced per night':'Сонголтоор · хоногоор'}</p>
              <div className="services-grid" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                {SERVICES.map(s=><ServiceRow key={s.id} s={s} on={services.includes(s.id)} toggle={()=>toggleSvc(s.id)} lang={lang}/>)}
              </div>
            </div>
          </React.Fragment>
        )}

        {stage==='pay' && (
          <div className="card" style={{padding:'22px 24px'}}>
            <h3 className="serif" style={{fontSize:22, fontWeight:700, marginBottom:16}}>{lang==='en'?'Payment':'Төлбөр'}</h3>
            <div className="row" style={{gap:10, marginBottom:20}}>
              {[['qpay',Icons.qr,'QPay'],['bank',Icons.bank,lang==='en'?'Bank transfer':'Дансаар']].map(([k,I,lbl])=>(
                <button key={k} onClick={()=>setMethod(k)} className="col" style={{flex:1, gap:7, alignItems:'center', padding:'16px',
                  borderRadius:'var(--r)', cursor:'pointer', border:`2px solid ${method===k?'var(--rust)':'var(--line)'}`,
                  background: method===k?'var(--st-web-bg)':'var(--card)', color: method===k?'var(--rust)':'var(--ink-2)', fontWeight:700}}>
                  <I size={26}/> {lbl}
                </button>
              ))}
            </div>

            {method==='qpay' ? (
              <div className="col center" style={{gap:14, alignItems:'center', padding:'10px 0'}}>
                <QRPlaceholder/>
                <p className="muted center" style={{fontSize:14, maxWidth:300}}>{lang==='en'?'Open your banking app, scan the QR and pay':'Банкны аппаа нээж QR кодыг уншуулан төлнө үү'} <b className="mono">{money(total)}</b></p>
              </div>
            ) : (
              <div className="col" style={{gap:10, padding:'4px 2px'}}>
                {[[lang==='en'?'Bank':'Банк','Хаан банк'],[lang==='en'?'Account':'Данс','5004 1122 33'],[lang==='en'?'Name':'Нэр','Тэрэлж Ger Resort ХХК'],[lang==='en'?'Amount':'Дүн',money(total)],[lang==='en'?'Note':'Гүйлгээний утга',bookingCode(bookingId)]].map(([l,r],i)=>(
                  <div key={i} className="row" style={{justifyContent:'space-between', padding:'10px 14px', background:'var(--card-2)', borderRadius:10}}>
                    <span className="faint" style={{fontSize:13}}>{l}</span>
                    <span className="mono" style={{fontWeight:700}}>{r}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT — summary */}
      <div className="card checkout-summary" style={{padding:'22px 24px', position:'sticky', top:90}}>
        <image-slot id={`ger-${booking.gerId}-main`} style={{width:'100%', height:140, display:'block', borderRadius:'var(--r)', marginBottom:14}} shape="rounded" placeholder={gerName(booking.gerId,lang)}></image-slot>
        <h3 className="serif" style={{fontSize:24, fontWeight:700}}>{g.name}</h3>
        <span className="muted" style={{fontWeight:600, fontSize:14}}>{lang==='en'?m.en:m.mn}</span>
        <div className="col" style={{gap:9, margin:'16px 0'}}>
          <Line l={t('book.checkin')} r={`${WD_MN[parseYMD(booking.checkIn).getDay()]}, ${fmtDate(booking.checkIn,lang)}`}/>
          <Line l={t('book.checkout')} r={`${WD_MN[parseYMD(booking.checkOut).getDay()]}, ${fmtDate(booking.checkOut,lang)}`}/>
          <Line l={t('book.guests')} r={count}/>
        </div>
        <hr className="divider-line"/>
        <div className="col" style={{gap:9, margin:'14px 0'}}>
          <Line l={`${money(m.price)} × ${nights} ${lang==='en'?'n':'хоног'}`} r={money(roomTotal)}/>
          {services.map(id=>{ const s=SERVICES.find(x=>x.id===id); return <Line key={id} l={(lang==='en'?s.en:s.mn)+` ×${nights}`} r={money(s.price*nights)} faint/>; })}
        </div>
        <hr className="divider-line"/>
        <div className="row" style={{justifyContent:'space-between', margin:'14px 0 18px'}}>
          <span style={{fontWeight:800, fontSize:17}}>{lang==='en'?'Total':'Нийт'}</span>
          <span className="serif" style={{fontWeight:700, fontSize:28, color:'var(--rust)'}}>{money(total)}</span>
        </div>
        {stage==='form'
          ? <button className="btn btn-primary btn-block btn-lg" disabled={holdExpired} onClick={()=>setStage('pay')}>{lang==='en'?'Continue to payment':'Төлбөр рүү'} <Icons.arrow size={18}/></button>
          : <button className="btn btn-gold btn-block btn-lg" disabled={holdExpired||paying} onClick={confirmPaid}>
              {paying? <React.Fragment><span className="spin" style={{width:16,height:16,border:'2px solid rgba(0,0,0,0.3)',borderTopColor:'#2A2017',borderRadius:'50%'}}></span> {lang==='en'?'Verifying…':'Шалгаж байна…'}</React.Fragment>
                     : <React.Fragment><Icons.check size={18}/> {lang==='en'?"I've paid · confirm":'Төлсөн · баталгаажуулах'}</React.Fragment>}
            </button>}
        <p className="faint center" style={{fontSize:11.5, marginTop:10}}>{lang==='en'?'Reception sees this booking the instant you confirm.':'Баталгаажуулмагц ресепшн шууд харна.'}</p>
      </div>
    </div>
  );
}

function Line({ l, r, bold, faint }){
  return <div className="row" style={{justifyContent:'space-between', fontSize:14.5}}>
    <span className={faint?'faint':'muted'}>{l}</span>
    <span style={{fontWeight: bold?800:600, color: bold?'var(--ink)':'inherit'}}>{r}</span>
  </div>;
}
function Field({ label, children, grow }){
  return <label className="col" style={{gap:6, flex: grow?1:'none'}}>
    <span style={{fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--ink-3)'}}>{label}</span>
    {children}
  </label>;
}
const inp = { padding:'11px 14px', border:'1px solid var(--line-ink)', borderRadius:'var(--r)', background:'var(--card)', width:'100%', fontWeight:600 };

window.Checkout = Checkout;
