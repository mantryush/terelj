/* ============================================================
   RECEPTION — live board, walk-in booking, check-in/out
   Demonstrates conflict-prevention with web in real time.
   ============================================================ */
var useState = React.useState;
function StatCard({ label, value, color, sub }){
  return (
    <div className="card" style={{padding:'14px 18px', flex:1, minWidth:120}}>
      <div className="col" style={{gap:2}}>
        <span className="faint" style={{fontSize:12, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase'}}>{label}</span>
        <span className="serif" style={{fontSize:32, fontWeight:700, color:color||'var(--ink)', lineHeight:1}}>{value}</span>
        {sub && <span className="faint" style={{fontSize:12}}>{sub}</span>}
      </div>
    </div>
  );
}

function ReceptionBoard({ date, statusOf, selected, onSelect, lang }){
  return (
    <div className="col" style={{gap:18}}>
      {Object.keys(GER_TYPES).map(type=>{
        const list = GERS.filter(g=>g.type===type);
        const m = GER_TYPES[type];
        return (
          <div key={type} className="col" style={{gap:8}}>
            <span style={{fontWeight:800, fontSize:13, color:'var(--ink-2)'}}>
              <span style={{display:'inline-block', width:10, height:10, borderRadius:3, background:m.color, marginRight:7}}></span>
              {lang==='en'?m.en:m.mn}
            </span>
            <div className="row" style={{gap:9, flexWrap:'wrap'}}>
              {list.map(g=>{
                const st = statusOf(g.id);
                const c = st==='free'?'var(--st-free)':'var(--st-web)';
                const sel = selected===g.id;
                return (
                  <button key={g.id} onClick={()=>onSelect(g.id)}
                    style={{width:62, height:54, borderRadius:10, cursor:'pointer',
                      border: sel?'2px solid var(--ink)':'1px solid rgba(0,0,0,0.1)',
                      background: st==='free'?'var(--st-free-bg)':c, color: st==='free'?'var(--st-free)':'#FFFDF8',
                      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:1,
                      fontWeight:800, fontSize:12.5, transition:'all .12s', boxShadow: sel?'var(--sh)':'none',
                      transform: sel?'translateY(-2px)':'none'}}>
                    <span>{g.id}</span>
                    <span style={{fontSize:8.5, fontWeight:700, opacity:0.85, textTransform:'uppercase', letterSpacing:'0.04em'}}>
                      {displayStatus(st)==='free'?(lang==='en'?'free':'сул'):(lang==='en'?'booked':'захиалсан')}
                    </span>
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

/* action panel for a selected ger */
function ReceptionAction({ gerId, date, lang, showToast, onClose }){
  const tj = useBookings();
  const checkIn = date, checkOut = addDays(date,1);
  const status = tj.statusForRange(gerId, checkIn, checkOut);
  const booking = tj.bookingFor(gerId, checkIn, checkOut);
  const g = gerById(gerId); const m = GER_TYPES[g.type];

  const [name, setName] = useState(''); const [phone, setPhone] = useState('');
  const [count, setCount] = useState(2); const [nights, setNights] = useState(1);
  const [pay, setPay] = useState('cash');

  const doWalkIn = ()=>{
    const res = TJ.walkIn({ gerId, checkIn, checkOut: addDays(checkIn,nights),
      guest:{ name: name||(lang==='en'?'Walk-in guest':'Биечлэн зочин'), phone: phone||'—', count },
      payment:{ method:pay, paid:true, amount: m.price*nights } });
    if(res.error){
      showToast(res.error==='hold'
        ? (lang==='en'?'⚠ A web guest is holding this ger right now':'⚠ Энэ гэрийг яг одоо веб зочин барьж байна')
        : (lang==='en'?'Not available':'Сул биш байна'), 'warn');
      return;
    }
    showToast(lang==='en'?'Walk-in booked ✓':'Биечлэн захиалга бүртгэгдлээ ✓');
    onClose();
  };

  return (
    <div className="col" style={{gap:16}}>
      <div className="row" style={{justifyContent:'space-between', alignItems:'flex-start'}}>
        <div>
          <h3 className="serif" style={{fontSize:26, fontWeight:700}}>{g.name} <span className="faint" style={{fontSize:16}}>· {gerId}</span></h3>
          <span className="muted" style={{fontWeight:600}}>{lang==='en'?m.en:m.mn} · {money(m.price)}</span>
        </div>
        <button onClick={onClose} className="row" style={{width:32, height:32, justifyContent:'center', borderRadius:'50%', border:'1px solid var(--line)', background:'var(--card)'}}><Icons.x size={17}/></button>
      </div>
      <StatusBadge status={status} lang={lang}/>

      {/* FREE → walk-in form */}
      {status==='free' && (
        <div className="col" style={{gap:13}}>
          <p className="muted" style={{fontSize:13.5}}>{lang==='en'?'Book this ger for a guest at the desk:':'Газар дээр ирсэн зочинд бүртгэх:'}</p>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder={lang==='en'?'Guest name':'Зочны нэр'} style={inp}/>
          <div className="row" style={{gap:10}}>
            <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder={lang==='en'?'Phone':'Утас'} style={{...inp, flex:1}}/>
            <div className="col" style={{gap:4}}><span className="faint" style={{fontSize:11, fontWeight:700}}>{lang==='en'?'Guests':'Хүн'}</span><Stepper value={count} onChange={setCount} min={1} max={m.cap}/></div>
            <div className="col" style={{gap:4}}><span className="faint" style={{fontSize:11, fontWeight:700}}>{lang==='en'?'Nights':'Хоног'}</span><Stepper value={nights} onChange={setNights} min={1} max={14}/></div>
          </div>
          <div className="row" style={{gap:8}}>
            {[['cash',lang==='en'?'Cash':'Бэлэн'],['card',lang==='en'?'Card':'Карт'],['qpay','QPay']].map(([k,l])=>(
              <button key={k} onClick={()=>setPay(k)} className="chip" style={{flex:1, justifyContent:'center', cursor:'pointer', padding:'9px',
                background: pay===k?'var(--ink)':'var(--card-2)', color: pay===k?'var(--paper)':'var(--ink-2)', borderColor: pay===k?'var(--ink)':'var(--line)'}}>{l}</button>
            ))}
          </div>
          <div className="row" style={{justifyContent:'space-between', padding:'8px 2px'}}>
            <span className="muted">{money(m.price)} × {nights}</span>
            <span className="serif" style={{fontWeight:700, fontSize:22, color:'var(--rust)'}}>{money(m.price*nights)}</span>
          </div>
          <button className="btn btn-primary btn-block" onClick={doWalkIn}><Icons.plus size={18}/> {lang==='en'?'Book walk-in':'Биечлэн захиалах'}</button>
        </div>
      )}

      {/* HOLD → blocked */}
      {status==='hold' && booking && (
        <div className="col" style={{gap:12, background:'var(--st-hold-bg)', borderRadius:'var(--r)', padding:'16px'}}>
          <span className="row gap-2" style={{fontWeight:800}}><Icons.bell size={18}/>{lang==='en'?'Held online — do not double-book':'Онлайн барьцаалагдсан — давхар бүү бүртгэ'}</span>
          <p className="muted" style={{fontSize:13.5}}>{lang==='en'?'A guest reserved this ger on the website. It frees automatically if they don’t pay.':'Зочин вебээс энэ гэрийг сонгосон. Төлбөр төлөхгүй бол автоматаар суларна.'}</p>
          <div className="row gap-2"><span className="faint">{lang==='en'?'Frees in':'Сулрах хүртэл'}:</span><HoldTimer until={booking.holdUntil} lang={lang}/></div>
        </div>
      )}

      {/* WEB / WALKIN booked → check-in */}
      {(status==='web'||status==='walkin') && booking && (
        <div className="col" style={{gap:12}}>
          <GuestCard booking={booking} lang={lang}/>
          <button className="btn btn-dark btn-block" onClick={()=>{ TJ.checkIn(booking.id); showToast(lang==='en'?'Checked in ✓':'Check-in хийгдлээ ✓'); onClose(); }}>
            <Icons.check size={18}/> {lang==='en'?'Check in':'Check-in хийх'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={()=>{ TJ.cancel(booking.id); showToast(lang==='en'?'Booking cancelled':'Захиалга цуцлагдлаа','warn'); onClose(); }}>{lang==='en'?'Cancel booking':'Захиалга цуцлах'}</button>
        </div>
      )}

      {/* STAY → check-out */}
      {status==='stay' && booking && (
        <div className="col" style={{gap:12}}>
          <GuestCard booking={booking} lang={lang}/>
          <button className="btn btn-gold btn-block" onClick={()=>{ TJ.checkOut(booking.id); showToast(lang==='en'?'Checked out ✓':'Check-out хийгдлээ ✓'); onClose(); }}>
            <Icons.arrow size={18}/> {lang==='en'?'Check out':'Check-out хийх'}
          </button>
        </div>
      )}
    </div>
  );
}

function GuestCard({ booking, lang }){
  const m = gerMeta(booking.gerId);
  const nights = nightsBetween(booking.checkIn, booking.checkOut);
  return (
    <div className="col" style={{gap:7, background:'var(--card-2)', borderRadius:'var(--r)', padding:'14px 16px'}}>
      <div className="row" style={{justifyContent:'space-between'}}>
        <span style={{fontWeight:800, fontSize:15}}>{booking.guest?.name||'—'}</span>
        <span className="chip" style={{background: booking.channel==='reception'?'var(--st-walkin-bg)':'var(--st-web-bg)', borderColor:'transparent', fontSize:11}}>
          {booking.channel==='reception'?(lang==='en'?'Walk-in':'Биечлэн'):(lang==='en'?'Web':'Веб')}
        </span>
      </div>
      <span className="row gap-2 muted" style={{fontSize:13}}><Icons.phone size={14}/>{booking.guest?.phone||'—'}</span>
      <span className="row gap-2 muted" style={{fontSize:13}}><Icons.users size={14}/>{booking.guest?.count||'—'} {lang==='en'?'guests':'хүн'} · {nights} {lang==='en'?'n':'хоног'}</span>
      <span className="row gap-2 muted" style={{fontSize:13}}><Icons.cal size={14}/>{fmtDate(booking.checkIn,lang)} → {fmtDate(booking.checkOut,lang)}</span>
      {booking.payment && <span className="row gap-2" style={{fontSize:13, fontWeight:700, color:'var(--st-free)'}}><Icons.check size={14}/>{money(booking.payment.amount||0)} · {booking.payment.method?.toUpperCase()}</span>}
    </div>
  );
}

/* ---------- live feed ---------- */
function LiveFeed({ lang }){
  const tj = useBookings();
  const events = tj.all().slice().sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)).slice(0,8);
  return (
    <div className="card" style={{padding:'18px 20px'}}>
      <div className="row gap-2" style={{marginBottom:14}}>
        <span className="dot dot-free pulse"></span>
        <h3 style={{fontSize:15, fontWeight:800}}>{lang==='en'?'Live activity':'Амьд урсгал'}</h3>
      </div>
      <div className="col" style={{gap:12}}>
        {events.map(b=>{
          const map = {hold:['var(--gold)',lang==='en'?'web hold':'веб барьцаа'],web:['var(--rust)',lang==='en'?'web booking':'веб захиалга'],walkin:['var(--sky)',lang==='en'?'walk-in':'биечлэн'],stay:['var(--plum)',lang==='en'?'checked in':'check-in'],done:['var(--ink-3)',lang==='en'?'checked out':'check-out']};
          const [c,lbl] = map[b.status]||['var(--ink-3)','—'];
          return (
            <div key={b.id} className="row" style={{gap:11, alignItems:'flex-start'}}>
              <span style={{width:9, height:9, borderRadius:'50%', background:c, marginTop:6, flex:'none'}}></span>
              <div className="col" style={{lineHeight:1.3, flex:1}}>
                <span style={{fontSize:13.5, fontWeight:600}}>{b.guest?.name||'—'} · <b>{b.gerId}</b></span>
                <span className="faint" style={{fontSize:11.5}}>{lbl} · {fmtDate(b.checkIn,lang)}</span>
              </div>
              {b.status==='hold' && <HoldTimer until={b.holdUntil} lang={lang}/>}
            </div>
          );
        })}
        {events.length===0 && <span className="faint" style={{fontSize:13}}>{lang==='en'?'No activity yet':'Урсгал алга'}</span>}
      </div>
    </div>
  );
}

function Reception({ lang, t, showToast }){
  const tj = useBookings();
  const [date, setDate] = useState(todayStr());
  const [sel, setSel] = useState(null);
  const checkIn=date, checkOut=addDays(date,1);
  const statusOf = (id)=> tj.statusForRange(id, checkIn, checkOut);
  const counts = GERS.reduce((a,g)=>{ const s=statusOf(g.id); a[s]=(a[s]||0)+1; return a; }, {});
  const revenue = tj.all().filter(b=>b.payment?.paid && overlaps(checkIn,checkOut,b.checkIn,b.checkOut)).reduce((a,b)=>a+(b.payment.amount||0),0);

  return (
    <div style={{background:'var(--paper-2)', minHeight:'100vh'}}>
      <div className="wrap" style={{padding:'24px 28px 60px'}}>
        {/* header */}
        <div className="row" style={{justifyContent:'space-between', flexWrap:'wrap', gap:14, marginBottom:18}}>
          <div className="col">
            <h1 className="serif" style={{fontSize:34, fontWeight:700}}>{lang==='en'?'Reception':'Ресепшн'}</h1>
            <span className="row gap-2 muted" style={{fontSize:14}}><span className="dot dot-free pulse"></span>{lang==='en'?'Live — synced with website':'Амьд — вебтэй холбоотой'}</span>
          </div>
          <DateField label={lang==='en'?'Day':'Өдөр'} value={date} onChange={setDate}/>
        </div>

        {/* stats */}
        <div className="row" style={{gap:12, flexWrap:'wrap', marginBottom:22}}>
          <StatCard label={lang==='en'?'Available':'Сул'} value={counts.free||0} color="var(--st-free)"/>
          <StatCard label={lang==='en'?'Booked':'Захиалагдсан'} value={GERS.length-(counts.free||0)} color="var(--rust)"/>
          <StatCard label={lang==='en'?'Revenue':'Орлого'} value={money(revenue)} color="var(--ink)"/>
        </div>

        <div className="reception-layout" style={{display:'grid', gridTemplateColumns: sel?'1.5fr 1fr':'1.7fr 1fr', gap:24, alignItems:'start'}}>
          {/* board */}
          <div className="card" style={{padding:'22px 24px'}}>
            <div className="row" style={{justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:10}}>
              <h2 className="serif" style={{fontSize:22, fontWeight:700}}>{lang==='en'?'Ger board':'Гэрийн самбар'}</h2>
              <Legend lang={lang}/>
            </div>
            <ReceptionBoard date={date} statusOf={statusOf} selected={sel} onSelect={setSel} lang={lang}/>
          </div>

          {/* right column */}
          <div className="col" style={{gap:18}}>
            {sel
              ? <div className="card rise" style={{padding:'20px 22px'}}><ReceptionAction gerId={sel} date={date} lang={lang} showToast={showToast} onClose={()=>setSel(null)}/></div>
              : <div className="card" style={{padding:'22px', textAlign:'center'}}>
                  <div className="row" style={{justifyContent:'center', marginBottom:10, color:'var(--ink-faint)'}}><Icons.pin size={32}/></div>
                  <p className="muted" style={{fontSize:14}}>{lang==='en'?'Tap a ger to book a walk-in, check in or check out.':'Гэр дээр дарж биечлэн захиалах, check-in/out хийнэ.'}</p>
                </div>}
            <LiveFeed lang={lang}/>
          </div>
        </div>
      </div>
    </div>
  );
}

window.Reception = Reception;
