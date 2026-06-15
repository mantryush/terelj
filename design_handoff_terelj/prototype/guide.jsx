/* ============================================================
   GUIDE — how to book & use the site (guest + staff)
   ============================================================ */
function GuideStep({ n, title, body, color }){
  return (
    <div className="row" style={{gap:18, alignItems:'flex-start'}}>
      <div className="row" style={{justifyContent:'center', width:46, height:46, flex:'none', borderRadius:'50%',
        background:color||'var(--rust)', color:'#FFFDF8'}}>
        <span className="serif" style={{fontSize:22, fontWeight:700}}>{n}</span>
      </div>
      <div className="col" style={{gap:5, paddingTop:3}}>
        <h3 style={{fontSize:18, fontWeight:800}}>{title}</h3>
        <p className="muted" style={{fontSize:14.5, lineHeight:1.55}}>{body}</p>
      </div>
    </div>
  );
}

function Guide({ lang, t, go }){
  const EN = lang==='en';
  const steps = [
    [EN?'Pick your dates':'Огноогоо сонго', EN?'On the booking page, set check-in and check-out. The map instantly shows which gers are free for those nights.':'Захиалгын хуудсанд ирэх, гарах огноогоо оруул. Тухайн өдрүүдэд аль гэр сул болохыг газрын зураг шууд харуулна.'],
    [EN?'Tap a free ger':'Сул гэр дээр дар', EN?'Green = available. Tap any green ger to see real photos, a video and what’s inside.':'Ногоон = сул. Аль ч ногоон гэр дээр дарж бодит зураг, бичлэг, тоноглолыг хар.'],
    [EN?'Hold for 30 minutes':'30 минут барь', EN?'Tap “Hold & continue” and the ger is yours for 30 minutes — it turns amber for everyone else so no one can double-book it.':'“30 минут барих” дээр дармагц гэр 30 минут таных болно — бусдад шар өнгөөр харагдаж, давхар захиалах боломжгүй болно.'],
    [EN?'Pay by QPay or bank':'QPay эсвэл банкаар төл', EN?'Scan the QPay QR in your banking app, or transfer to our account using your booking code as the note.':'Банкны аппаараа QPay QR уншуул, эсвэл захиалгын кодоо гүйлгээний утга болгон манай данс руу шилжүүл.'],
    [EN?'Show your code':'Кодоо үзүүл', EN?'You get a booking code (e.g. TJ-04217). Show it at reception on arrival — that’s your check-in.':'Та захиалгын код авна (ж: TJ-04217). Ирэхдээ ресепшнд үзүүл — энэ нь таны check-in.'],
  ];
  return (
    <div className="wrap-narrow" style={{padding:'40px 28px 80px'}}>
      <div className="center col" style={{gap:12, alignItems:'center', marginBottom:36}}>
        <span className="eyebrow">{EN?'GUIDE':'ЗААВАР'}</span>
        <h1 className="serif" style={{fontSize:46, fontWeight:700}}>{EN?'How to book':'Хэрхэн захиалах вэ'}</h1>
        <KheeDivider w={150}/>
      </div>

      {/* steps */}
      <div className="card" style={{padding:'34px 32px', marginBottom:26}}>
        <div className="col" style={{gap:26}}>
          {steps.map((s,i)=><GuideStep key={i} n={i+1} title={s[0]} body={s[1]} color={i===2?'var(--gold)':'var(--rust)'}/>)}
        </div>
      </div>

      {/* color key */}
      <div className="card" style={{padding:'28px 30px', marginBottom:26}}>
        <h2 className="serif" style={{fontSize:24, fontWeight:700, marginBottom:16}}>{EN?'What the colors mean':'Өнгөнүүдийн утга'}</h2>
        <div className="col" style={{gap:12}}>
          {[['free',EN?'You can book it right now.':'Та яг одоо захиалж болно.'],
            ['hold',EN?'Someone is paying for it — wait or pick another.':'Хэн нэгэн төлбөр төлж байна — хүлээ эсвэл өөрийг сонго.'],
            ['web',EN?'Already booked online for those dates.':'Тэр өдрүүдэд онлайнаар захиалагдсан.'],
            ['walkin',EN?'Booked at reception.':'Ресепшнээс захиалагдсан.'],
            ['stay',EN?'A guest is currently staying.':'Зочин амарч байгаа.']].map(([k,desc])=>(
            <div key={k} className="row" style={{gap:12, alignItems:'center'}}>
              <span style={{width:30, height:30, borderRadius:8, flex:'none', background:`var(--st-${k})`}}></span>
              <div className="row" style={{gap:8, flexWrap:'wrap', alignItems:'baseline'}}>
                <b style={{fontSize:14.5}}>{EN?STATUS_META[k].en:STATUS_META[k].mn}</b>
                <span className="muted" style={{fontSize:14}}>— {desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* hold + checkin info */}
      <div className="guide-info-grid" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:26}}>
        <div className="card" style={{padding:'24px 26px'}}>
          <div className="row gap-2" style={{marginBottom:10, color:'var(--gold-deep)'}}><Icons.clock size={22}/><h3 className="serif" style={{fontSize:20, fontWeight:700, color:'var(--ink)'}}>{EN?'The 30-minute hold':'30 минутын барьцаа'}</h3></div>
          <p className="muted" style={{fontSize:14, lineHeight:1.55}}>{EN?'When you reserve, we lock the ger for 30 minutes while you pay. Reception sees the lock live and cannot book it to a walk-in guest. If you don’t pay in time, it frees automatically.':'Та сонгоход бид 30 минутын турш гэрийг түгжинэ. Ресепшн энэ түгжээг амьдаар хараад, биечлэн ирсэн зочинд өгөхгүй. Хугацаандаа төлөхгүй бол автоматаар суларна.'}</p>
        </div>
        <div className="card" style={{padding:'24px 26px'}}>
          <div className="row gap-2" style={{marginBottom:10, color:'var(--rust)'}}><Icons.cal size={22}/><h3 className="serif" style={{fontSize:20, fontWeight:700, color:'var(--ink)'}}>{EN?'Check-in / Check-out':'Check-in / Check-out'}</h3></div>
          <ul className="muted" style={{fontSize:14, lineHeight:1.7, margin:0, paddingLeft:18}}>
            <li>{EN?'Check-in from 14:00':'Check-in: 14:00 цагаас'}</li>
            <li>{EN?'Check-out by 12:00':'Check-out: 12:00 цагт'}</li>
            <li>{EN?'Show booking code at reception':'Ресепшнд кодоо үзүүлнэ'}</li>
            <li>{EN?'Free parking & firewood':'Зогсоол, түлээ үнэгүй'}</li>
          </ul>
        </div>
      </div>

      {/* staff note */}
      <div className="card" style={{padding:'24px 26px', background:'var(--ink)', color:'var(--paper)', marginBottom:30}}>
        <div className="row gap-2" style={{marginBottom:8}}><Icons.bolt size={20} color="var(--gold)"/><h3 className="serif" style={{fontSize:20, fontWeight:700, color:'#FFFDF8'}}>{EN?'For reception staff':'Ресепшний ажилтнуудад'}</h3></div>
        <p style={{fontSize:14, lineHeight:1.55, color:'rgba(241,231,210,0.85)'}}>{EN?'Open the Reception board to book walk-ins, check guests in and out. Amber (held) gers are being paid for online right now — never overwrite them. Everything syncs with the website the instant it changes.':'Ресепшн самбарыг нээж биечлэн захиалга бүртгэх, зочдыг check-in/out хийнэ. Шар (барьцаатай) гэрүүд яг одоо онлайнаар төлөгдөж байгаа тул бүү дар. Бүх өөрчлөлт вебтэй шууд синк болно.'}</p>
        <button className="btn btn-gold btn-sm" style={{marginTop:14}} onClick={()=>go('reception')}><Icons.arrow size={16}/> {EN?'Open reception':'Ресепшн нээх'}</button>
      </div>

      <div className="center">
        <button className="btn btn-primary btn-lg" onClick={()=>go('book')}><Icons.map size={19}/> {EN?'Start booking':'Захиалж эхлэх'}</button>
      </div>
    </div>
  );
}

window.Guide = Guide;
