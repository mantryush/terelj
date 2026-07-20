/* ============================================================
   APP — header, routing, role switch, tweaks
   ============================================================ */
var useState = React.useState;
var useEffect = React.useEffect;
const ACCENTS = {
  tenger:     { rust:'#0B2A50', deep:'#061B35', sh:'rgba(11,42,80,0.28)',  label:'Tenger Eleven' },
  terracotta: { rust:'#B8472A', deep:'#8F3219', sh:'rgba(184,71,42,0.30)', label:'Шавар улаан' },
  pine:       { rust:'#5C6E45', deep:'#44542F', sh:'rgba(92,110,69,0.30)',  label:'Тал ногоон' },
  sky:        { rust:'#2E6E8E', deep:'#1F5066', sh:'rgba(46,110,142,0.30)', label:'Тэнгэр хөх' },
  plum:       { rust:'#7A3F52', deep:'#592C3B', sh:'rgba(122,63,82,0.30)',  label:'Бөөрөлзгөнө' },
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "landingVariant": "center",
  "planVariant": "map",
  "accent": "tenger"
}/*EDITMODE-END*/;

function Header({ lang, setLang, t, route, go }){
  const guestNav = [['home','nav.home'],['book','nav.book'],['guide','nav.guide']];
  const isStaff = route==='reception' || route==='admin';
  const openBooking = ()=>{ go('home'); setTimeout(()=>document.getElementById('availability')?.scrollIntoView({behavior:'smooth',block:'start'}),40); };
  return (
    <header style={{position:'sticky', top:0, zIndex:50, background:'rgba(247,242,231,0.90)',
      backdropFilter:'blur(16px)', borderBottom:'1px solid var(--line)'}}>
        <div className="wrap row app-header-inner" style={{height:66, justifyContent:'space-between', gap:18}}>
        <button onClick={()=>go('home')} aria-label="Tenger Eleven Ger Camp" style={{background:'none', border:'none', padding:0}}><Logo size={50}/></button>

        {!isStaff && (
          <nav className="row guest-nav" style={{gap:4}}>
            {guestNav.map(([v,k])=>(
              <button key={v} onClick={()=>v==='book'?openBooking():go(v)} style={{background: route===v?'var(--card)':'transparent',
                border:'none', padding:'8px 16px', borderRadius:'var(--r-pill)', fontWeight:700, fontSize:14.5,
                color: route===v?'var(--ink)':'var(--ink-2)', cursor:'pointer',
                boxShadow: route===v?'var(--sh-sm)':'none'}}>{t(k)}</button>
            ))}
          </nav>
        )}
        {isStaff && (
          <span className="serif" style={{fontSize:20, fontWeight:700, color:'var(--ink-2)'}}>
            {route==='reception'?(lang==='en'?'Reception desk':'Ресепшн'):(lang==='en'?'Admin control':'Админ удирдлага')}
          </span>
        )}

        <div className="row" style={{gap:10}}>
          <LangToggle lang={lang} setLang={setLang}/>
          {/* role switch */}
          <div className="row role-switch" style={{gap:2, background:'var(--card-2)', borderRadius:'var(--r-pill)', padding:3, border:'1px solid var(--line)'}}>
            {[['home',Icons.users,lang==='en'?'Guest':'Зочин'],['reception',Icons.bell,'Reception'],['admin',Icons.grid,lang==='en'?'Admin':'Админ']].map(([v,I,lbl])=>{
              const active = v==='home' ? !isStaff : route===v;
              return (
                <button key={v} onClick={()=>go(v)} title={lbl} className="row" style={{gap:6, padding:'7px 12px', borderRadius:'var(--r-pill)',
                  border:'none', cursor:'pointer', fontWeight:700, fontSize:12.5,
                  background: active?'var(--ink)':'transparent', color: active?'var(--paper)':'var(--ink-3)'}}>
                  <I size={15}/> <span className="role-label">{lbl}</span>
                </button>
              );
            })}
          </div>
          {!isStaff && <button className="btn btn-primary btn-sm" onClick={openBooking}>{t('nav.bookNow')}</button>}
        </div>
      </div>
    </header>
  );
}

function Footer({ lang, go }){
  const openBooking = ()=>{ go('home'); setTimeout(()=>document.getElementById('availability')?.scrollIntoView({behavior:'smooth',block:'start'}),40); };
  return (
    <footer style={{background:'var(--ink)', color:'var(--paper)', padding:'48px 0 30px'}}>
      <div className="wrap">
        <div className="row" style={{justifyContent:'space-between', flexWrap:'wrap', gap:28, marginBottom:28}}>
          <div className="col" style={{gap:12, maxWidth:300}}>
            <Logo size={56} inverted/>
            <p style={{fontSize:13.5, color:'rgba(241,231,210,0.7)', lineHeight:1.5}}>{lang==='en'?'A peaceful ger camp near Turtle Rock in beautiful Gorkhi-Terelj National Park.':'Үзэсгэлэнт Горхи-Тэрэлжийн Мэлхий хадны ойролцоох тав тухтай гэр кемп.'}</p>
          </div>
          <div className="row" style={{gap:46, flexWrap:'wrap'}}>
            <div className="col" style={{gap:9}}>
              <span style={{fontWeight:800, fontSize:13, color:'var(--gold)', textTransform:'uppercase', letterSpacing:'0.08em'}}>{lang==='en'?'Book':'Захиалга'}</span>
              {[['book',lang==='en'?'Live map':'Газрын зураг'],['guide',lang==='en'?'Guide':'Заавар']].map(([v,l])=>(
                <button key={v} onClick={()=>v==='book'?openBooking():go(v)} style={{background:'none', border:'none', color:'rgba(241,231,210,0.8)', textAlign:'left', cursor:'pointer', fontSize:14, padding:0}}>{l}</button>
              ))}
            </div>
            <div className="col" style={{gap:9}}>
              <span style={{fontWeight:800, fontSize:13, color:'var(--gold)', textTransform:'uppercase', letterSpacing:'0.08em'}}>{lang==='en'?'Contact':'Холбоо барих'}</span>
              <span style={{fontSize:14, color:'rgba(241,231,210,0.8)'}}>+976 9911-2233</span>
              <span style={{fontSize:14, color:'rgba(241,231,210,0.8)'}}>hello@tengereleven.mn</span>
            </div>
          </div>
        </div>
        <div className="row" style={{justifyContent:'space-between', paddingTop:20, borderTop:'1px solid #3a2e20', flexWrap:'wrap', gap:10}}>
          <span style={{fontSize:12.5, color:'rgba(241,231,210,0.55)'}}>© 2026 Tenger Eleven Ger Camp · {lang==='en'?'Terelj, Mongolia':'Тэрэлж, Монгол'}</span>
          <span style={{fontSize:12.5, color:'rgba(241,231,210,0.55)'}}>{lang==='en'?'Made with care · 🇲🇳':'Хайраар бүтээв · 🇲🇳'}</span>
        </div>
      </div>
    </footer>
  );
}

function App(){
  const [lang, setLang, t] = useLang();
  const [tw, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = useState(()=> (location.hash.replace('#','')||'home').split('?')[0] || 'home');
  const [params, setParams] = useState({});
  const [toastNode, showToast] = useToast();

  const go = (view, p={})=>{ setRoute(view); setParams(p); location.hash = view; window.scrollTo(0,0); };

  useEffect(()=>{ TJ.seed(); }, []);

  // follow hash changes (back/forward, external nav)
  useEffect(()=>{
    const onHash = ()=>{ const v=(location.hash.replace('#','')||'home').split('?')[0]; setRoute(r=> r===v ? r : v); };
    window.addEventListener('hashchange', onHash);
    return ()=>window.removeEventListener('hashchange', onHash);
  }, []);

  // apply accent
  useEffect(()=>{
    const a = ACCENTS[tw.accent] || ACCENTS.tenger;
    const r = document.documentElement.style;
    r.setProperty('--rust', a.rust);
    r.setProperty('--rust-deep', a.deep);
    r.setProperty('--sh-rust', `0 8px 22px ${a.sh}`);
  }, [tw.accent]);

  const isStaff = route==='reception'||route==='admin';

  return (
    <div>
      <Header lang={lang} setLang={setLang} t={t} route={route} go={go}/>
      <main>
        {route==='home'      && <Landing lang={lang} t={t} go={go} variant={tw.landingVariant} showToast={showToast}/>}
        {route==='book'      && <Booking lang={lang} t={t} go={go} planVariant={tw.planVariant} showToast={showToast} initialSearch={params}/>}
        {route==='checkout'  && <Checkout lang={lang} t={t} go={go} bookingId={params.bookingId} showToast={showToast}/>}
        {route==='guide'     && <Guide lang={lang} t={t} go={go}/>}
        {route==='reception' && <Reception lang={lang} t={t} showToast={showToast}/>}
        {route==='admin'     && <Admin lang={lang} t={t} showToast={showToast}/>}
      </main>
      {!isStaff && <Footer lang={lang} go={go}/>}

      {/* Tweaks */}
      <TweaksPanel>
        <TweakSection label={lang==='en'?'Landing layout':'Нүүр хуудасны загвар'}/>
        <TweakRadio label={lang==='en'?'Hero':'Толгой'} value={tw.landingVariant}
          options={['split','center']} onChange={v=>setTweak('landingVariant',v)}/>
        <TweakSection label={lang==='en'?'Booking plan':'Захиалгын зураглал'}/>
        <TweakRadio label={lang==='en'?'Plan style':'Хэлбэр'} value={tw.planVariant}
          options={['map','grid']} onChange={v=>setTweak('planVariant',v)}/>
        <TweakSection label={lang==='en'?'Accent color':'Үндсэн өнгө'}/>
        <TweakColor label={lang==='en'?'Accent':'Өнгө'} value={ACCENTS[tw.accent].rust}
          options={Object.values(ACCENTS).map(a=>a.rust)}
          onChange={v=>{ const key=Object.keys(ACCENTS).find(k=>ACCENTS[k].rust===v)||'tenger'; setTweak('accent',key); }}/>
      </TweaksPanel>

      {toastNode}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
