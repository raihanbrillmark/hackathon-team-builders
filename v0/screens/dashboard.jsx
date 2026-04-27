// Dashboard — analytics for PM role
const { useMemo: uMd } = React;

function Sparkline({ data, color = 'var(--moss-500)', height = 32, width = 120 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  const areaPts = `0,${height} ${pts} ${width},${height}`;
  return (
    <svg width={width} height={height} style={{ display:'block' }}>
      <polygon points={areaPts} fill={color} opacity="0.12"/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"/>
      <circle cx={(data.length-1)/(data.length-1)*width} cy={height - ((data[data.length-1]-min)/range)*(height-4) - 2} r="2.5" fill={color}/>
    </svg>
  );
}

function DashboardScreen() {
  const weekData = [28, 34, 31, 42, 48, 38, 44];
  const utilData = [62, 68, 71, 74, 69, 72, 78];

  const clientHours = [
    { name:'Tooth and Nail', hours:312, color:'var(--moss-600)' },
    { name:'Hardy Party',    hours:268, color:'var(--rust-500)' },
    { name:'Wild Brands',    hours:184, color:'var(--ochre-500)' },
    { name:'Powergoat',      hours:142, color:'var(--blue-500)' },
    { name:'Koda Outdoors',  hours: 96, color:'var(--ink-600)' },
    { name:'Others',         hours: 54, color:'var(--sand-400)' },
  ];
  const totalClient = clientHours.reduce((s,c)=>s+c.hours,0);

  return (
    <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Dashboard</div>
          <h1 style={{ margin:0, fontSize:22, fontFamily:'var(--font-display)', fontWeight:600, letterSpacing:'-0.02em', lineHeight:1.15 }}>Good afternoon, Raihan</h1>
          <div className="meta">Week of April 13 – 19 · <span className="mono">W16</span></div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-sm"><I.Calendar size={12}/> This week</button>
          <button className="btn btn-sm"><I.Download size={12}/> Export</button>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12 }}>
        {[
          { label:'Hours logged',    value:'265', unit:'hrs', delta:'+14%', positive:true,  data:weekData, color:'var(--moss-500)' },
          { label:'Active tasks',    value:'42',  unit:'',    delta:'8 due this week', data:[30,32,35,38,40,41,42], color:'var(--blue-500)' },
          { label:'Pending LOE',     value:'3',   unit:'',    delta:'2 over 24h old', warn:true, data:[1,2,2,3,2,3,3], color:'var(--rust-500)' },
          { label:'Utilization',     value:'78',  unit:'%',   delta:'+6% vs last wk', positive:true, data:utilData, color:'var(--ochre-500)' },
        ].map((k,i)=>(
          <div key={i} className="card" style={{ padding:'14px 16px', display:'flex', flexDirection:'column', gap:8 }}>
            <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{k.label}</div>
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:8 }}>
              <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
                <span className="num" style={{ fontSize:28, fontWeight:600, fontFamily:'var(--font-display)', letterSpacing:'-0.02em' }}>{k.value}</span>
                {k.unit && <span style={{ fontSize:12, color:'var(--fg-muted)' }}>{k.unit}</span>}
              </div>
              <Sparkline data={k.data} color={k.color}/>
            </div>
            <div style={{ fontSize:11, color: k.warn?'var(--rust-600)': k.positive?'var(--moss-600)':'var(--fg-muted)', display:'flex', alignItems:'center', gap:4 }}>
              {k.positive && <I.ArrowUp size={10}/>}
              {k.warn && <I.Warn size={10}/>}
              {k.delta}
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:12 }}>
        {/* Hours per client */}
        <div className="card" style={{ padding:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <div>
              <div style={{ fontWeight:600, fontSize:13 }}>Hours per client</div>
              <div className="meta">Last 30 days · <span className="mono">{totalClient} hrs</span> total</div>
            </div>
            <button className="btn btn-sm"><I.ArrowRight size={12}/> Full report</button>
          </div>

          {/* Stacked bar */}
          <div style={{ height:10, borderRadius:5, overflow:'hidden', display:'flex', marginBottom:14 }}>
            {clientHours.map((c,i)=>(
              <div key={i} style={{ background:c.color, width:`${(c.hours/totalClient)*100}%` }} title={`${c.name}: ${c.hours}h`}/>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:8 }}>
            {clientHours.map((c,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 0', borderTop: i>=2?'1px solid var(--border)':'none' }}>
                <div style={{ width:8, height:8, borderRadius:2, background:c.color }}/>
                <div style={{ flex:1, fontSize:12 }}>{c.name}</div>
                <div className="num mono" style={{ fontSize:12, fontWeight:500 }}>{c.hours}h</div>
                <div className="meta mono" style={{ width:36, textAlign:'right' }}>{Math.round((c.hours/totalClient)*100)}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending LOE */}
        <div className="card" style={{ padding:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div>
              <div style={{ fontWeight:600, fontSize:13, display:'flex', alignItems:'center', gap:6 }}>
                Pending LOE
                <span className="chip chip-rust" style={{ height:16, fontSize:10 }}>3 new</span>
              </div>
              <div className="meta">Awaiting your approval</div>
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {PENDING_LOE.map((l,i)=>{
              const u = TEAM.find(t=>t.id===l.by);
              return (
                <div key={i} style={{ padding:'10px 12px', background:'var(--bg-sunken)', borderRadius:6, border:'1px solid var(--border)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, marginBottom:4 }}>
                    <div style={{ fontSize:12, fontWeight:500, lineHeight:1.3 }}>{l.task}</div>
                    <div className="num mono" style={{ fontSize:12, fontWeight:600, flex:'none' }}>{l.est}h</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                    <span className="chip chip-ink mono" style={{ fontSize:10 }}>{l.project}</span>
                    <div className="avatar avatar-sm" style={{ background:u.color, color:'white' }}>
                      {u.name.split(' ').map(s=>s[0]).join('').slice(0,2)}
                    </div>
                    <span className="meta">{u.name.split(' ')[0]}</span>
                  </div>
                  <div className="meta" style={{ marginBottom:8, lineHeight:1.4 }}>{l.note}</div>
                  <div style={{ display:'flex', gap:6 }}>
                    <button className="btn btn-sm" style={{ flex:1, borderColor:'var(--moss-500)', color:'var(--moss-600)' }}>
                      <I.Check size={11}/> Approve
                    </button>
                    <button className="btn btn-sm" style={{ flex:1 }}>Reject</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activity + Team */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {/* Team activity */}
        <div className="card" style={{ padding:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div>
              <div style={{ fontWeight:600, fontSize:13 }}>Team activity</div>
              <div className="meta">Live feed</div>
            </div>
            <span className="chip chip-moss" style={{ height:18 }}>
              <span className="chip-dot" style={{ animation:'pulse 2s infinite' }}/>
              Live
            </span>
          </div>
          <div style={{ display:'flex', flexDirection:'column' }}>
            {ACTIVITY.map((a,i)=>{
              const u = TEAM.find(t=>t.id===a.who);
              return (
                <div key={i} style={{ display:'flex', gap:10, padding:'8px 0', borderTop: i>0?'1px solid var(--border)':'none' }}>
                  <div className="avatar avatar-sm" style={{ background:u.color, color:'white' }}>
                    {u.name.split(' ').map(s=>s[0]).join('').slice(0,2)}
                  </div>
                  <div style={{ flex:1, fontSize:12, lineHeight:1.4 }}>
                    <span style={{ fontWeight:500 }}>{u.name.split(' ')[0]}</span>
                    <span style={{ color:'var(--fg-muted)' }}> {a.action} </span>
                    <span style={{ fontWeight:500 }}>{a.target}</span>
                    <span className="chip chip-ink mono" style={{ fontSize:10, marginLeft:6, height:16, padding:'0 5px' }}>{a.project.toUpperCase()}</span>
                  </div>
                  <div className="meta mono" style={{ fontSize:10, whiteSpace:'nowrap' }}>{a.time}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team capacity */}
        <div className="card" style={{ padding:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div>
              <div style={{ fontWeight:600, fontSize:13 }}>Team capacity this week</div>
              <div className="meta">40h target per person</div>
            </div>
            <div className="meta mono">M&nbsp;T&nbsp;W&nbsp;T&nbsp;F</div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {TEAM.slice(0,6).map((t,i)=>{
              const loaded = [32,38,42,26,40,35][i];
              const pct = Math.min(loaded/40*100, 110);
              const color = loaded > 40 ? 'var(--rust-500)' : loaded < 30 ? 'var(--ochre-500)' : 'var(--moss-500)';
              return (
                <div key={t.id} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div className="avatar avatar-sm" style={{ background:t.color, color:'white' }}>
                    {t.name.split(' ').map(s=>s[0]).join('').slice(0,2)}
                  </div>
                  <div style={{ width:110, fontSize:12 }}>{t.name}</div>
                  <div style={{ flex:1, position:'relative', height:6, background:'var(--sand-200)', borderRadius:3 }}>
                    <div style={{ position:'absolute', inset:0, width:`${Math.min(pct,100)}%`, background:color, borderRadius:3 }}/>
                    {pct > 100 && <div style={{ position:'absolute', left:'100%', width:`${pct-100}%`, top:0, bottom:0, background:'var(--rust-600)', borderRadius:'0 3px 3px 0' }}/>}
                  </div>
                  <div className="num mono" style={{ fontSize:11, width:48, textAlign:'right', color }}>{loaded}/40h</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

window.DashboardScreen = DashboardScreen;
