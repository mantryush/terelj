/* ============================================================
   ADMIN — overview, bookings, gers & prices, media
   ============================================================ */
var useState = React.useState;
function AdminNav({ tab, setTab, lang }){
  const items = [
    ['overview', Icons.grid, lang==='en'?'Overview':'Тойм'],
    ['bookings', Icons.list, lang==='en'?'Bookings':'Захиалга'],
    ['gers',     Icons.pin,  lang==='en'?'Gers & prices':'Гэр & үнэ'],
    ['media',    Icons.play, lang==='en'?'Media':'Контент'],
  ];
  return (
    <div className="col" style={{gap:4, width:210, flex:'none'}}>
      {items.map(([k,I,l])=>(
        <button key={k} onClick={()=>setTab(k)} className="row" style={{gap:11, padding:'11px 14px', borderRadius:'var(--r)',
          border:'none', cursor:'pointer', textAlign:'left', fontWeight:700, fontSize:14.5,
          background: tab===k?'var(--ink)':'transparent', color: tab===k?'var(--paper)':'var(--ink-2)'}}>
          <I size={19}/> {l}
        </button>
      ))}
    </div>
  );
}

function Bar({ h, label, value, color }){
  return (
    <div className="col" style={{alignItems:'center', gap:6, flex:1}}>
      <span className="faint mono" style={{fontSize:11}}>{value}</span>
      <div style={{width:'100%', maxWidth:38, height:120, background:'var(--card-2)', borderRadius:6, display:'flex', alignItems:'flex-end', overflow:'hidden'}}>
        <div style={{width:'100%', height:`${h}%`, background:color, borderRadius:6, transition:'height .4s'}}></div>
      </div>
      <span className="faint" style={{fontSize:11, fontWeight:700}}>{label}</span>
    </div>
  );
}

function AdminOverview({ lang }){
  const tj = useBookings();
  const today = todayStr();
  const all = tj.all();
  const revenue = all.filter(b=>b.payment?.paid).reduce((a,b)=>a+(b.payment.amount||0),0);
  const occToday = GERS.filter(g=>['web','walkin','stay'].includes(tj.statusForRange(g.id,today,addDays(today,1)))).length;
  const holds = all.filter(b=>b.status==='hold').length;

  // 7-day occupancy
  const days = Array.from({length:7}, (_,i)=>addDays(today,i));
  const occ = days.map(d=> GERS.filter(g=>['web','walkin','stay'].includes(tj.statusForRange(g.id,d,addDays(d,1)))).length);
  const maxOcc = Math.max(GERS.length,1);

  return (
    <div className="col" style={{gap:22}}>
      <div className="row" style={{gap:14, flexWrap:'wrap'}}>
        <StatCard label={lang==='en'?'Occupancy today':'Өнөөдрийн дүүргэлт'} value={`${occToday}/${GERS.length}`} color="var(--rust)" sub={`${Math.round(occToday/GERS.length*100)}%`}/>
        <StatCard label={lang==='en'?'Total revenue':'Нийт орлого'} value={money(revenue)} color="var(--st-free)"/>
        <StatCard label={lang==='en'?'Active bookings':'Идэвхтэй захиалга'} value={all.filter(b=>b.status!=='done').length} color="var(--ink)"/>
        <StatCard label={lang==='en'?'Live holds':'Идэвхтэй барьцаа'} value={holds} color="var(--gold-deep)"/>
      </div>

      <div className="card" style={{padding:'24px 26px'}}>
        <h3 className="serif" style={{fontSize:22, fontWeight:700, marginBottom:18}}>{lang==='en'?'Next 7 days — occupancy':'Дараагийн 7 хоног — дүүргэлт'}</h3>
        <div className="row" style={{gap:10, alignItems:'flex-end'}}>
          {occ.map((v,i)=>(
            <Bar key={i} h={v/maxOcc*100} value={v} color={i===0?'var(--rust)':'var(--gold)'}
              label={WD_MN[parseYMD(days[i]).getDay()].slice(0,2)}/>
          ))}
        </div>
      </div>

      <div className="card" style={{padding:'24px 26px'}}>
        <h3 className="serif" style={{fontSize:22, fontWeight:700, marginBottom:16}}>{lang==='en'?'Channel split':'Сувгийн харьцаа'}</h3>
        {(()=>{ const web=all.filter(b=>b.channel==='web').length, rec=all.filter(b=>b.channel==='reception').length, tot=Math.max(web+rec,1);
          return (
            <div className="col" style={{gap:12}}>
              <div className="row" style={{height:16, borderRadius:8, overflow:'hidden', border:'1px solid var(--line)'}}>
                <div style={{width:`${web/tot*100}%`, background:'var(--rust)'}}></div>
                <div style={{width:`${rec/tot*100}%`, background:'var(--sky)'}}></div>
              </div>
              <div className="row" style={{gap:20}}>
                <span className="row gap-2" style={{fontSize:13.5, fontWeight:600}}><span className="dot dot-web"></span>{lang==='en'?'Web':'Веб'} · {web}</span>
                <span className="row gap-2" style={{fontSize:13.5, fontWeight:600}}><span className="dot dot-walkin"></span>{lang==='en'?'Reception':'Ресепшн'} · {rec}</span>
              </div>
            </div>
          ); })()}
      </div>
    </div>
  );
}

function AdminBookings({ lang, showToast }){
  const tj = useBookings();
  const [filter, setFilter] = useState('all');
  let rows = tj.all().slice().sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  if(filter!=='all') rows = rows.filter(b=>b.status===filter);
  return (
    <div className="card" style={{padding:'22px 24px'}}>
      <div className="row" style={{justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:16}}>
        <h3 className="serif" style={{fontSize:22, fontWeight:700}}>{lang==='en'?'All bookings':'Бүх захиалга'} <span className="faint">({rows.length})</span></h3>
        <div className="row" style={{gap:6, flexWrap:'wrap'}}>
          {['all','hold','web','walkin','stay','done'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} className="chip" style={{cursor:'pointer', fontSize:12,
              background: filter===f?'var(--ink)':'var(--card-2)', color: filter===f?'var(--paper)':'var(--ink-2)', borderColor:filter===f?'var(--ink)':'var(--line)'}}>
              {f==='all'?(lang==='en'?'All':'Бүгд'):(STATUS_META[f]?STATUS_META[f][lang==='en'?'en':'mn']:f)}
            </button>
          ))}
        </div>
      </div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:13.5}}>
          <thead>
            <tr style={{textAlign:'left', color:'var(--ink-3)', fontSize:11.5, textTransform:'uppercase', letterSpacing:'0.06em'}}>
              {['#','Гэр',(lang==='en'?'Guest':'Зочин'),(lang==='en'?'Dates':'Огноо'),(lang==='en'?'Channel':'Суваг'),(lang==='en'?'Status':'Төлөв'),(lang==='en'?'Amount':'Дүн'),''].map((h,i)=>(
                <th key={i} style={{padding:'8px 10px', borderBottom:'2px solid var(--line)', fontWeight:700}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(b=>(
              <tr key={b.id} style={{borderBottom:'1px solid var(--line-soft)'}}>
                <td style={td} className="mono faint">{bookingCode(b.id).slice(3)}</td>
                <td style={td}><b>{b.gerId}</b> <span className="faint">{gerById(b.gerId)?.name}</span></td>
                <td style={td}>{b.guest?.name||'—'}<br/><span className="faint" style={{fontSize:12}}>{b.guest?.phone||''}</span></td>
                <td style={td} className="mono">{fmtDate(b.checkIn,lang)}→{fmtDate(b.checkOut,lang)}</td>
                <td style={td}>{b.channel==='reception'?(lang==='en'?'Reception':'Ресепшн'):(lang==='en'?'Web':'Веб')}</td>
                <td style={td}><StatusBadge status={b.status} lang={lang}/></td>
                <td style={td} className="mono">{b.payment?.amount?money(b.payment.amount):'—'}</td>
                <td style={td}>
                  <button onClick={()=>{ TJ.cancel(b.id); showToast(lang==='en'?'Deleted':'Устгалаа','warn'); }} className="row" style={{width:30,height:30,justifyContent:'center',border:'1px solid var(--line)',borderRadius:8,background:'var(--card)',color:'var(--rust)'}}><Icons.trash size={15}/></button>
                </td>
              </tr>
            ))}
            {rows.length===0 && <tr><td colSpan="8" style={{padding:'30px', textAlign:'center', color:'var(--ink-3)'}}>{lang==='en'?'No bookings':'Захиалга алга'}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
const td = { padding:'12px 10px', verticalAlign:'top' };

function AdminGers({ lang, showToast }){
  const tj = useBookings();
  const [, force] = React.useReducer(x=>x+1,0);
  return (
    <div className="col" style={{gap:18}}>
      <p className="muted" style={{fontSize:14}}>{lang==='en'?'Edit nightly price and capacity per ger type. Changes apply instantly across the site & reception.':'Гэрийн төрөл бүрийн хоногийн үнэ, багтаамжийг засна. Өөрчлөлт веб болон ресепшнд шууд тусна.'}</p>
      {Object.keys(GER_TYPES).map(type=>{
        const m = GER_TYPES[type];
        const list = GERS.filter(g=>g.type===type);
        return (
          <div key={type} className="card" style={{padding:'20px 22px'}}>
            <div className="row" style={{justifyContent:'space-between', flexWrap:'wrap', gap:14, alignItems:'center'}}>
              <div className="row gap-3" style={{alignItems:'center'}}>
                <span style={{width:14, height:14, borderRadius:4, background:m.color}}></span>
                <div className="col" style={{lineHeight:1.2}}>
                  <span className="serif" style={{fontSize:21, fontWeight:700}}>{lang==='en'?m.en:m.mn}</span>
                  <span className="faint" style={{fontSize:12.5}}>{list.length} {lang==='en'?'units':'нэгж'} · {list.map(g=>g.id).join(', ')}</span>
                </div>
              </div>
              <div className="row admin-price-row" style={{gap:18, alignItems:'flex-end'}}>
                <label className="col" style={{gap:4}}>
                  <span className="faint" style={{fontSize:11, fontWeight:700, textTransform:'uppercase'}}>{lang==='en'?'Price / night':'Үнэ / хоног'}</span>
                  <div className="row" style={{gap:6, alignItems:'center'}}>
                    <span style={{fontWeight:700}}>₮</span>
                    <input type="number" defaultValue={m.price} step="10000"
                      onBlur={e=>{ saveType(type,{price:Number(e.target.value)||m.price}); force(); showToast(lang==='en'?'Price updated':'Үнэ шинэчлэгдлээ'); }}
                      style={{...inp, width:130}} className="mono"/>
                  </div>
                </label>
                <label className="col" style={{gap:4}}>
                  <span className="faint" style={{fontSize:11, fontWeight:700, textTransform:'uppercase'}}>{lang==='en'?'Capacity':'Багтаамж'}</span>
                  <input type="number" defaultValue={m.cap} min="1"
                    onBlur={e=>{ saveType(type,{cap:Number(e.target.value)||m.cap}); force(); }}
                    style={{...inp, width:80}} className="mono"/>
                </label>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AdminMedia({ lang }){
  const groups = [
    { title: lang==='en'?'Landing':'Нүүр хуудас', slots:[['hero-photo','Hero (split)'],['hero-banner','Hero (banner)']] },
    { title: lang==='en'?'Ger types':'Гэрийн төрлүүд', slots: Object.keys(GER_TYPES).map(t=>[`type-${t}`, GER_TYPES[t][lang==='en'?'en':'mn']]) },
    { title: lang==='en'?'Per-ger photos':'Гэр тус бүрийн зураг', slots: GERS.map(g=>[`ger-${g.id}-main`, `${g.id} ${g.name}`]) },
  ];
  return (
    <div className="col" style={{gap:24}}>
      <p className="muted" style={{fontSize:14}}>{lang==='en'?'Drag a photo or video onto any slot — it appears on the public site immediately.':'Аль ч хэсэгт зураг/бичлэг чирч оруулбал нийтийн веб дээр шууд гарна.'}</p>
      {groups.map(grp=>(
        <div key={grp.title} className="col" style={{gap:12}}>
          <h3 className="serif" style={{fontSize:20, fontWeight:700}}>{grp.title}</h3>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:12}}>
            {grp.slots.map(([id,label])=>(
              <div key={id} className="col" style={{gap:5}}>
                <image-slot id={id} style={{width:'100%', height:100, display:'block', borderRadius:10}} shape="rounded" placeholder="+ зураг"></image-slot>
                <span className="faint" style={{fontSize:11.5, fontWeight:600}}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Admin({ lang, t, showToast }){
  const [tab, setTab] = useState('overview');
  return (
    <div style={{background:'var(--paper-2)', minHeight:'100vh'}}>
      <div className="wrap" style={{padding:'26px 28px 60px'}}>
        <div className="row" style={{justifyContent:'space-between', marginBottom:22, flexWrap:'wrap', gap:12}}>
          <div className="col">
            <h1 className="serif" style={{fontSize:34, fontWeight:700}}>{lang==='en'?'Admin':'Админ удирдлага'}</h1>
            <span className="muted" style={{fontSize:14}}>Tenger Eleven Ger Camp · {lang==='en'?'control center':'удирдлагын төв'}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={()=>{ if(confirm(lang==='en'?'Reset all demo data?':'Бүх демо өгөгдлийг шинэчлэх үү?')){ localStorage.removeItem('tenger-eleven.bookings.v2'); TJ.seed(true); showToast('Reset ✓'); } }}>
            <Icons.bolt size={15}/> {lang==='en'?'Reset demo':'Демо шинэчлэх'}
          </button>
        </div>
        <div className="row admin-layout" style={{gap:28, alignItems:'flex-start'}}>
          <AdminNav tab={tab} setTab={setTab} lang={lang}/>
          <div className="grow" style={{minWidth:0}}>
            {tab==='overview' && <AdminOverview lang={lang}/>}
            {tab==='bookings' && <AdminBookings lang={lang} showToast={showToast}/>}
            {tab==='gers' && <AdminGers lang={lang} showToast={showToast}/>}
            {tab==='media' && <AdminMedia lang={lang}/>}
          </div>
        </div>
      </div>
    </div>
  );
}

window.Admin = Admin;
