/* ============================================================
   LANDING PAGE
   ============================================================ */
function SteppeScene({ style }){
  // stylized layered Terelj skyline — decorative backdrop
  return (
    <svg viewBox="0 0 1200 420" preserveAspectRatio="xMidYMax slice" style={style}>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7FA8BD"/><stop offset="0.55" stopColor="#A9C4CE"/><stop offset="1" stopColor="#D9C9A6"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="420" fill="url(#sky)"/>
      <circle cx="980" cy="95" r="46" fill="#F1E7D2" opacity="0.85"/>
      {/* far mountains (Тэрэлжийн хадат уул) */}
      <path d="M0 230 L120 150 L210 200 L320 120 L430 195 L560 130 L660 200 L780 140 L900 205 L1020 150 L1130 210 L1200 175 V420 H0 Z" fill="#6E7E86" opacity="0.55"/>
      <path d="M0 280 L160 215 L300 270 L470 200 L640 275 L820 215 L1000 280 L1200 230 V420 H0 Z" fill="#5C6E45" opacity="0.6"/>
      {/* hills */}
      <path d="M0 340 L260 290 L520 345 L820 295 L1200 350 V420 H0 Z" fill="#7E8A55"/>
      <path d="M0 380 L380 345 L760 385 L1200 350 V420 H0 Z" fill="#94994F" opacity="0.9"/>
      {/* gers on the meadow */}
      {[[180,360],[250,372],[330,366]].map(([x,y],i)=>(
        <g key={i} transform={`translate(${x},${y})`}>
          <path d={`M-16 0 L0 -16 L16 0 Z`} fill="#E7D9BD"/>
          <rect x="-13" y="0" width="26" height="15" rx="2" fill="#FBF6EA"/>
          <rect x="-3" y="6" width="6" height="9" fill="#B8472A"/>
        </g>
      ))}
    </svg>
  );
}

function TypeCard({ tk, type, lang, onBook }){
  const m = GER_TYPES[type];
  const count = GERS.filter(g=>g.type===type).length;
  return (
    <div className="card" style={{overflow:'hidden', display:'flex', flexDirection:'column'}}>
      <div style={{position:'relative', height:200}}>
        <image-slot id={`type-${type}`} style={{width:'100%', height:'100%', display:'block'}}
          shape="rect" placeholder={`${m.mn} — зураг`}></image-slot>
        <span className="chip" style={{position:'absolute', top:12, left:12, background:'rgba(42,32,23,0.78)', color:'var(--paper)', border:'none', backdropFilter:'blur(6px)'}}>
          {count} гэр</span>
      </div>
      <div className="col" style={{padding:'18px 20px 20px', gap:10, flex:1}}>
        <div className="row" style={{justifyContent:'space-between', alignItems:'flex-start'}}>
          <div>
            <h3 className="serif" style={{fontSize:25, fontWeight:700}}>{lang==='en'?m.en:m.mn}</h3>
            <span className="muted" style={{fontSize:13.5}}>{lang==='en'?`up to ${m.cap} guests`:`${m.cap} хүртэл зочин`}</span>
          </div>
          <div style={{width:13, height:13, borderRadius:4, background:m.color, marginTop:6}}></div>
        </div>
        <div className="grow"></div>
        <div className="row" style={{justifyContent:'space-between', alignItems:'flex-end', marginTop:4}}>
          <div className="col" style={{lineHeight:1.1}}>
            <span className="serif" style={{fontSize:24, fontWeight:700, color:'var(--rust)'}}>{money(m.price)}</span>
            <span className="faint" style={{fontSize:12}}>/ {lang==='en'?'night':'хоног'}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onBook}>{lang==='en'?'Select':'Сонгох'} <Icons.arrow size={16}/></button>
        </div>
      </div>
    </div>
  );
}

function ServiceTile({ s, lang }){
  const I = Icons[s.icon] || Icons.star;
  return (
    <div className="row" style={{gap:14, padding:'16px 18px', background:'var(--card)', border:'1px solid var(--line)', borderRadius:'var(--r)'}}>
      <div className="row" style={{justifyContent:'center', width:46, height:46, flex:'none', borderRadius:12, background:'var(--card-2)', color:'var(--rust)'}}>
        <I size={24}/>
      </div>
      <div className="col" style={{lineHeight:1.2}}>
        <span style={{fontWeight:700, fontSize:15}}>{lang==='en'?s.en:s.mn}</span>
        <span className="faint mono" style={{fontSize:13}}>{money(s.price)}</span>
      </div>
    </div>
  );
}

function Landing({ lang, t, go, variant='split' }){
  const tj = useBookings();
  const today = todayStr();
  const freeCount = GERS.filter(g=> tj.statusForRange(g.id, today, addDays(today,1))==='free').length;

  const heroText = (
    <div className="col rise" style={{gap:22, maxWidth: variant==='center'?720:520, margin: variant==='center'?'0 auto':0}}>
      <span className="eyebrow">{t('hero.eyebrow')}</span>
      <h1 className="display" style={{fontSize: variant==='center'?'clamp(44px,7vw,82px)':'clamp(40px,6vw,68px)', whiteSpace:'pre-line', color: variant==='center'?'#FFFDF8':'var(--ink)'}}>
        {t('hero.title')}
      </h1>
      <p style={{fontSize:18, lineHeight:1.55, color: variant==='center'?'rgba(255,253,248,0.9)':'var(--ink-2)', maxWidth:520, margin: variant==='center'?'0 auto':0}}>
        {t('hero.sub')}
      </p>
      <div className="row gap-3" style={{flexWrap:'wrap', justifyContent: variant==='center'?'center':'flex-start'}}>
        <button className="btn btn-primary btn-lg" onClick={()=>go('book')}><Icons.map size={19}/> {t('hero.cta')}</button>
        <button className={`btn btn-lg ${variant==='center'?'btn-gold':'btn-ghost'}`} onClick={()=>go('book')}>{t('hero.cta2')}</button>
      </div>
      <div className="row gap-3" style={{marginTop:6, justifyContent: variant==='center'?'center':'flex-start'}}>
        <span className="row gap-2" style={{fontSize:13.5, fontWeight:600, color: variant==='center'?'#FFFDF8':'var(--ink-2)'}}>
          <span className="dot dot-free pulse"></span>
          {lang==='en'? `${freeCount} gers available today` : `Өнөөдөр ${freeCount} гэр сул байна`}
        </span>
      </div>
    </div>
  );

  return (
    <div>
      {/* ===== HERO ===== */}
      {variant==='center' ? (
        <section style={{position:'relative', minHeight:620, display:'flex', alignItems:'center', overflow:'hidden'}}>
          <image-slot id="hero-banner" style={{position:'absolute', inset:0, width:'100%', height:'100%'}}
            shape="rect" placeholder=""></image-slot>
          <SteppeScene style={{position:'absolute', inset:0, width:'100%', height:'100%', zIndex:-1}}/>
          <div style={{position:'absolute', inset:0, background:'linear-gradient(180deg, rgba(42,32,23,0.15), rgba(42,32,23,0.62))'}}></div>
          <div className="wrap" style={{position:'relative', zIndex:2, padding:'90px 28px', width:'100%'}}>{heroText}</div>
        </section>
      ) : (
        <section className="wrap landing-hero-grid" style={{display:'grid', gridTemplateColumns:'1.05fr 1fr', gap:48, alignItems:'center', padding:'64px 28px 40px'}}>
          {heroText}
          <div className="rise" style={{position:'relative'}}>
            <div style={{borderRadius:'var(--r-lg)', overflow:'hidden', boxShadow:'var(--sh-lg)', border:'1px solid var(--line)', position:'relative', aspectRatio:'4/5'}}>
              <image-slot id="hero-photo" style={{position:'absolute', inset:0, width:'100%', height:'100%'}}
                shape="rect" placeholder="Голын эргийн гэр буудлын зураг"></image-slot>
              <SteppeScene style={{position:'absolute', inset:0, width:'100%', height:'100%', zIndex:-1}}/>
            </div>
            {/* floating live card */}
            <div className="card" style={{position:'absolute', bottom:-22, left:-22, padding:'14px 18px', boxShadow:'var(--sh-lg)', background:'var(--card)'}}>
              <div className="row gap-3">
                <div className="row" style={{justifyContent:'center', width:42, height:42, borderRadius:12, background:'var(--st-free-bg)', color:'var(--st-free)'}}><Icons.map size={22}/></div>
                <div className="col" style={{lineHeight:1.15}}>
                  <span style={{fontWeight:800, fontSize:20}}>{freeCount}/{GERS.length}</span>
                  <span className="faint" style={{fontSize:12}}>{lang==='en'?'free today':'өнөөдөр сул'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== stat strip ===== */}
      <section className="wrap" style={{padding:'34px 28px'}}>
        <div className="row" style={{justifyContent:'center', gap:28, marginBottom:30}}><KheeDivider w={180}/></div>
        <div className="stat-grid" style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:18}}>
          {[
            ['20', lang==='en'?'gers & cabins':'гэр & байшин'],
            ['1.5 цаг', lang==='en'?'from the city':'хотоос'],
            ['24/7', lang==='en'?'reception':'ресепшн'],
            ['<5 мин', lang==='en'?'online booking':'онлайн захиалга'],
          ].map(([n,l],i)=>(
            <div key={i} className="col center" style={{gap:4}}>
              <span className="serif" style={{fontSize:36, fontWeight:700, color:'var(--rust)'}}>{n}</span>
              <span className="muted" style={{fontSize:13.5, fontWeight:600}}>{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ger types ===== */}
      <section className="wrap" style={{padding:'46px 28px'}}>
        <div className="col center" style={{gap:10, marginBottom:30}}>
          <span className="eyebrow">{lang==='en'?'STAY':'БАЙРШИХ'}</span>
          <h2 className="serif" style={{fontSize:42, fontWeight:700}}>{lang==='en'?'Choose your ger':'Гэрээ сонго'}</h2>
          <p className="muted" style={{fontSize:16, maxWidth:560}}>{lang==='en'?'Five kinds of stay — from a classic felt ger to a riverside Luxe with a jacuzzi.':'Энгийн эсгий гэрээс эхлээд жакузитай голын эргийн Luxe хүртэл таван төрлийн байр.'}</p>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))', gap:20}}>
          {Object.keys(GER_TYPES).map(type=>(
            <TypeCard key={type} type={type} lang={lang} onBook={()=>go('book')}/>
          ))}
        </div>
      </section>

      {/* ===== map teaser ===== */}
      <section style={{background:'var(--ink)', color:'var(--paper)', padding:'62px 0', marginTop:24}}>
        <div className="wrap map-teaser-grid" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'center'}}>
          <div className="col" style={{gap:20}}>
            <span className="eyebrow" style={{color:'var(--gold)'}}>{lang==='en'?'LIVE MAP':'АМЬД ГАЗРЫН ЗУРАГ'}</span>
            <h2 className="serif" style={{fontSize:40, fontWeight:700, color:'#FFFDF8'}}>{lang==='en'?'Pick a ger like a seat in a theatre':'Кино суудал шиг гэрээ сонго'}</h2>
            <p style={{fontSize:16.5, color:'rgba(241,231,210,0.8)', lineHeight:1.6}}>
              {lang==='en'?'Set your dates, see exactly which gers are free, held or taken — in real time. Reserve, and we hold it for 30 minutes while you check out.':'Огноогоо сонгоод аль гэр сул, аль нь барьцаалагдсан, аль нь захиалагдсаныг бодит цагт хар. Сонгоход 30 минут хадгална.'}</p>
            <div className="row gap-4" style={{flexWrap:'wrap', marginTop:4}}>
              {[['free',STATUS_META.free],['hold',STATUS_META.hold],['web',STATUS_META.web],['stay',STATUS_META.stay]].map(([k,m])=>(
                <span key={k} className="row gap-2" style={{fontSize:13, fontWeight:600, color:'var(--paper)'}}>
                  <span className={`dot dot-${m.cls}`}></span>{lang==='en'?m.en:m.mn}
                </span>
              ))}
            </div>
            <button className="btn btn-gold" style={{marginTop:10, alignSelf:'flex-start'}} onClick={()=>go('book')}><Icons.map size={18}/> {lang==='en'?'Open the map':'Газрын зураг нээх'}</button>
          </div>
          <div style={{borderRadius:'var(--r-lg)', overflow:'hidden', border:'1px solid #3a2e20', aspectRatio:'4/3', background:'#1c150e'}}>
            <MiniMapPreview lang={lang}/>
          </div>
        </div>
      </section>

      {/* ===== entertainment / services ===== */}
      <section className="wrap" style={{padding:'58px 28px'}}>
        <div className="col center" style={{gap:10, marginBottom:30}}>
          <span className="eyebrow">{lang==='en'?'MORE TO DO':'НЭМЭЛТ'}</span>
          <h2 className="serif" style={{fontSize:42, fontWeight:700}}>{lang==='en'?'Food, fun & the steppe':'Хоол, зугаа, тал нутаг'}</h2>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:14}}>
          {SERVICES.map(s=><ServiceTile key={s.id} s={s} lang={lang}/>)}
        </div>
      </section>

      {/* ===== how it works ===== */}
      <section className="wrap" style={{padding:'10px 28px 64px'}}>
        <div className="card" style={{padding:'40px 36px', background:'var(--card-2)'}}>
          <div className="row" style={{justifyContent:'space-between', alignItems:'flex-end', marginBottom:28, flexWrap:'wrap', gap:14}}>
            <h2 className="serif" style={{fontSize:34, fontWeight:700}}>{lang==='en'?'Booking in 3 steps':'3 алхамд захиалах'}</h2>
            <button className="btn btn-ghost btn-sm" onClick={()=>go('guide')}>{lang==='en'?'Full guide':'Дэлгэрэнгүй заавар'} <Icons.arrow size={16}/></button>
          </div>
          <div className="how-grid" style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24}}>
            {[
              [lang==='en'?'Pick dates & ger':'Огноо & гэр сонго', lang==='en'?'Choose your nights on the live map and tap a free ger.':'Амьд газрын зураг дээр огноогоо сонгоод сул гэр дээр дар.'],
              [lang==='en'?'Hold 30 min':'30 мин барих', lang==='en'?'We reserve it for you for 30 minutes — no one else can take it.':'Бид 30 минут хадгална — өөр хэн ч авч чадахгүй.'],
              [lang==='en'?'Pay & arrive':'Төл & ирэх', lang==='en'?'Pay by QPay or transfer, then just show your code at reception.':'QPay эсвэл шилжүүлгээр төлөөд ресепшнд кодоо үзүүл.'],
            ].map(([h,b],i)=>(
              <div key={i} className="col" style={{gap:8}}>
                <span className="serif" style={{fontSize:38, fontWeight:700, color:'var(--rust)', opacity:0.5}}>0{i+1}</span>
                <h3 style={{fontSize:18, fontWeight:800}}>{h}</h3>
                <p className="muted" style={{fontSize:14.5, lineHeight:1.5}}>{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="wrap" style={{padding:'0 28px 80px'}}>
        <div className="center col" style={{gap:22, alignItems:'center', background:'var(--rust)', color:'#FFFDF8', borderRadius:'var(--r-lg)', padding:'58px 30px', boxShadow:'var(--sh-rust)'}}>
          <KheeDivider color="#F1E7D2" w={150}/>
          <h2 className="serif" style={{fontSize:'clamp(32px,4vw,52px)', fontWeight:700, color:'#FFFDF8'}}>{lang==='en'?'Rest under the eternal sky':'Мөнх тэнгэрийн дор амар'}</h2>
          <button className="btn btn-lg" style={{background:'#FFFDF8', color:'var(--rust)'}} onClick={()=>go('book')}>{t('hero.cta')} <Icons.arrow size={19}/></button>
        </div>
      </section>
    </div>
  );
}

/* tiny non-interactive map for the dark teaser */
function MiniMapPreview({ lang }){
  const tj = useBookings();
  const today = todayStr();
  return (
    <div style={{position:'relative', width:'100%', height:'100%', background:'radial-gradient(circle at 30% 30%, #25406b22, transparent 60%), #161009'}}>
      <svg viewBox="0 0 100 75" style={{position:'absolute', inset:0, width:'100%', height:'100%'}}>
        <path d="M0 26 Q30 20 55 30 T100 28" stroke="#2E6E8E" strokeWidth="3" fill="none" opacity="0.5"/>
        <path d="M0 55 Q40 60 70 52 T100 58" stroke="#3a2e20" strokeWidth="0.6" fill="none"/>
      </svg>
      {GERS.map(g=>{
        const st = tj.statusForRange(g.id, today, addDays(today,1));
        const c = {free:'#5C6E45',hold:'#C99536',web:'#B8472A',walkin:'#2E6E8E',stay:'#6E4A63'}[st];
        return <span key={g.id} style={{position:'absolute', left:`${g.x}%`, top:`${g.y}%`, width:9, height:9, marginLeft:-4, marginTop:-4, borderRadius:'50%', background:c, boxShadow:`0 0 8px ${c}`}}></span>;
      })}
    </div>
  );
}

window.Landing = Landing;
