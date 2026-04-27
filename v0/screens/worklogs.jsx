// Worklogs and Employee Worklogs screens + Reports + Clients + Settings + LOE Approvals
const { useState: uSW } = React;

// Date strip
function DateStrip({ selected, onSelect }) {
  const dates = [];
  const base = new Date('2026-04-19');
  for (let i = -9; i <= 2; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    dates.push(d);
  }
  const fmt = (d, f) => {
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    if (f==='day') return days[d.getDay()];
    if (f==='num') return d.getDate();
    if (f==='month') return months[d.getMonth()];
    return '';
  };
  const today = new Date('2026-04-19');
  const isSame = (a,b) => a.toDateString() === b.toDateString();
  return (
    <div style={{ display:'flex', gap:4, padding:8, background:'var(--bg-raised)', border:'1px solid var(--border)', borderRadius:8, overflowX:'auto' }}>
      <button className="btn-ghost" style={{ width:28, height:48, borderRadius:6, color:'var(--fg-muted)', flex:'none' }}><I.Chevron size={14} style={{ transform:'rotate(180deg)' }}/></button>
      {dates.map((d, i) => {
        const active = selected && isSame(new Date(selected), d);
        const isToday = isSame(d, today);
        const isFuture = d > today;
        const hrs = isFuture ? null : [6.5, 7.5, 4, 8, 5.5, 0, 0, 7, 8.25, 6][i] ?? 5;
        return (
          <button key={i} onClick={()=>onSelect(d.toISOString().slice(0,10))} style={{
            flex:'none', width:58, height:56, padding:6, borderRadius:6,
            border: active ? '1px solid var(--ink-900)' : '1px solid transparent',
            background: active ? 'var(--ink-900)' : isToday ? 'var(--sand-100)' : 'transparent',
            color: active ? 'var(--fg-inverse)' : 'var(--fg)',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2,
          }}
            onMouseEnter={e=>{ if(!active) e.currentTarget.style.background='var(--sand-200)'; }}
            onMouseLeave={e=>{ if(!active) e.currentTarget.style.background= isToday ? 'var(--sand-100)' : 'transparent'; }}>
            <div style={{ fontSize:10, opacity:0.7, textTransform:'uppercase', letterSpacing:'0.05em' }}>{fmt(d,'day')}</div>
            <div className="num" style={{ fontSize:18, fontWeight:600, fontFamily:'var(--font-display)', letterSpacing:'-0.02em' }}>{fmt(d,'num')}</div>
            {hrs != null ? (
              <div className="mono num" style={{ fontSize:9, opacity:0.7 }}>{hrs}h</div>
            ) : <div style={{ height:10 }}/>}
          </button>
        );
      })}
      <button className="btn-ghost" style={{ width:28, height:48, borderRadius:6, color:'var(--fg-muted)', flex:'none' }}><I.Chevron size={14}/></button>
    </div>
  );
}

function Timer({ running, onToggle, seconds }) {
  const h = Math.floor(seconds/3600);
  const m = Math.floor((seconds%3600)/60);
  const s = seconds%60;
  const pad = n=>String(n).padStart(2,'0');
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:10, padding:'8px 12px',
      background: running ? 'var(--moss-50)' : 'var(--bg-sunken)',
      border:'1px solid', borderColor: running ? 'var(--moss-500)' : 'var(--border)',
      borderRadius:8, transition:'all 200ms',
    }}>
      <button onClick={onToggle} style={{
        width:32, height:32, borderRadius:'50%',
        background: running ? 'var(--moss-600)' : 'var(--ink-900)',
        color:'white', display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        {running ? <I.Pause size={12}/> : <I.Play size={12}/>}
      </button>
      <div>
        <div className="mono num" style={{ fontSize:18, fontWeight:600, letterSpacing:'0.02em', lineHeight:1 }}>
          {pad(h)}:{pad(m)}:{pad(s)}
        </div>
        <div className="meta" style={{ marginTop:2 }}>
          {running ? 'Tracking — Build review card grid (PRW)' : 'Press Space to start · S to switch task'}
        </div>
      </div>
    </div>
  );
}

function WorklogsScreen() {
  const [date, setDate] = uSW('2026-04-19');
  const [running, setRunning] = uSW(false);
  const [seconds, setSeconds] = uSW(5847);
  React.useEffect(()=>{
    if (!running) return;
    const t = setInterval(()=>setSeconds(s=>s+1), 1000);
    return ()=>clearInterval(t);
  }, [running]);

  const entries = WORKLOGS.filter(w => w.date === date);
  const total = entries.reduce((s,e)=>s+e.hours,0);
  const billable = entries.filter(e=>e.billable).reduce((s,e)=>s+e.hours,0);

  return (
    <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Worklogs</div>
          <h1 style={{ margin:0, fontSize:22, fontFamily:'var(--font-display)', fontWeight:600, letterSpacing:'-0.02em', lineHeight:1.15 }}>Log your time</h1>
          <div className="meta">Weekly goal <span className="mono">40h</span> · logged <span className="mono" style={{ color:'var(--moss-600)' }}>27.5h</span> · remaining <span className="mono">12.5h</span></div>
        </div>
        <button className="btn btn-primary btn-sm"><I.Plus size={12}/> Log time</button>
      </div>

      <DateStrip selected={date} onSelect={setDate}/>

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:12 }}>
        {/* Entries */}
        <div className="card" style={{ overflow:'hidden' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderBottom:'1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600 }}>Sunday, April 19, 2026</div>
              <div className="meta">
                <span className="mono">{total.toFixed(2)}h</span> total · <span className="mono" style={{ color:'var(--moss-600)' }}>{billable.toFixed(2)}h billable</span> · <span className="mono">{(total-billable).toFixed(2)}h internal</span>
              </div>
            </div>
            <div style={{ width:200, display:'flex', alignItems:'center', gap:6 }}>
              <div className="progress" style={{ flex:1 }}>
                <span style={{ width:`${(total/8)*100}%`, background:'var(--moss-500)' }}/>
              </div>
              <div className="mono" style={{ fontSize:10, color:'var(--fg-muted)', width:40 }}>{Math.round((total/8)*100)}% of 8h</div>
            </div>
          </div>
          {entries.length===0 ? (
            <div style={{ padding:40, textAlign:'center', color:'var(--fg-muted)' }}>
              <I.Clock size={28} style={{ opacity:0.4, marginBottom:8 }}/>
              <div style={{ fontSize:13, fontWeight:500, color:'var(--fg)' }}>No time logged yet</div>
              <div className="meta" style={{ marginTop:4 }}>Start a timer or log time manually</div>
            </div>
          ) : (
            entries.map((e, i) => {
              const t = TASKS.find(x=>x.id===e.task);
              const p = PROJECTS.find(x=>x.id===t?.project);
              return (
                <div key={e.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderTop: i>0?'1px solid var(--border)':'none' }}>
                  <span className="code-badge">{p.code}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:500 }}>{t.title}</div>
                    <div className="meta">{p.client} · {e.note}</div>
                  </div>
                  <span className={`chip chip-${e.billable?'moss':'ink'}`} style={{ fontSize:10, height:18 }}>
                    {e.billable?'Billable':'Internal'}
                  </span>
                  <div className="mono num" style={{ fontSize:15, fontWeight:600, width:54, textAlign:'right' }}>{e.hours.toFixed(2)}h</div>
                  <div style={{ display:'flex', gap:4 }}>
                    <button className="btn-ghost" style={{ padding:4, color:'var(--fg-muted)' }}><I.Edit size={12}/></button>
                    <button className="btn-ghost" style={{ padding:4, color:'var(--fg-muted)' }}><I.Trash size={12}/></button>
                  </div>
                </div>
              );
            })
          )}
          <div style={{ padding:10, borderTop:'1px solid var(--border)', background:'var(--bg-sunken)' }}>
            <button style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'var(--fg-muted)', width:'100%', padding:6 }}>
              <I.Plus size={12}/> Quick add (type task, hours, ⏎)
              <span style={{ marginLeft:'auto' }}><span className="kbd">N</span></span>
            </button>
          </div>
        </div>

        {/* Timer + shortcuts */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div className="card" style={{ padding:14 }}>
            <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Active timer</div>
            <Timer running={running} onToggle={()=>setRunning(r=>!r)} seconds={seconds}/>
          </div>

          <div className="card" style={{ padding:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <div style={{ fontSize:13, fontWeight:600 }}>Recent tasks</div>
              <span className="meta">One-click start</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              {TASKS.filter(t=>t.assignee==='na').slice(0,5).map(t=>{
                const p = PROJECTS.find(x=>x.id===t.project);
                return (
                  <button key={t.id} style={{
                    display:'flex', alignItems:'center', gap:8, padding:'8px 8px', borderRadius:6,
                    fontSize:12, textAlign:'left',
                  }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--sand-100)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <span className="code-badge" style={{ width:22, height:22, fontSize:8 }}>{p.code}</span>
                    <div style={{ flex:1, minWidth:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{t.title}</div>
                    <I.Play size={11} style={{ color:'var(--fg-muted)' }}/>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card" style={{ padding:14 }}>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:10 }}>Shortcuts</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6, fontSize:11 }}>
              {[
                ['N', 'New entry'],
                ['Space', 'Start / pause'],
                ['S', 'Switch task'],
                ['← →', 'Prev / next day'],
                ['⌘⏎', 'Submit day'],
              ].map(([k,l])=>(
                <div key={k} style={{ display:'flex', justifyContent:'space-between' }}>
                  <span className="meta">{l}</span>
                  <span className="kbd">{k}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ EMPLOYEE WORKLOGS ============
function EmployeeWorklogsScreen() {
  const [date, setDate] = uSW('2026-04-19');
  const [query, setQuery] = uSW('');
  const employees = TEAM.filter(t => t.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Employee Worklogs</div>
          <h1 style={{ margin:0, fontSize:22, fontFamily:'var(--font-display)', fontWeight:600, letterSpacing:'-0.02em', lineHeight:1.15 }}>Team time by day</h1>
          <div className="meta">8 members · <span className="mono" style={{ color:'var(--moss-600)' }}>6 active</span> · <span className="mono" style={{ color:'var(--rust-600)' }}>2 below target</span></div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-sm"><I.Filter size={12}/> Role</button>
          <button className="btn btn-sm"><I.Download size={12}/> Export</button>
        </div>
      </div>

      <DateStrip selected={date} onSelect={setDate}/>

      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
        <div style={{ position:'relative', width:260 }}>
          <I.Search size={12} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--fg-muted)' }}/>
          <input className="input" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search employee…" style={{ width:'100%', paddingLeft:28 }}/>
        </div>
      </div>

      <div className="card" style={{ overflow:'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ paddingLeft:16, width:'24%' }}>Employee</th>
              <th>Role</th>
              <th>Status today</th>
              <th>Today</th>
              <th>Week · LOE Est/Actual</th>
              <th>Accuracy</th>
              <th style={{ width:40 }}></th>
            </tr>
          </thead>
          <tbody>
            {employees.map((t, i) => {
              const today = [7.25, 6.5, 8, 4.5, 7, 0, 6.75, 5.5][i] ?? 6;
              const weekEst = [38,42,40,32,38,24,36,30][i] ?? 36;
              const weekAct = [35,44,38,28,42,12,34,27][i] ?? 34;
              const accuracy = Math.round((1 - Math.abs(weekEst-weekAct)/weekEst)*100);
              const status = today>=7 ? 'active' : today>0 ? 'light' : 'away';
              return (
                <tr key={t.id}>
                  <td style={{ paddingLeft:16 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div className="avatar" style={{ background:t.color, color:'white' }}>
                        {t.name.split(' ').map(s=>s[0]).join('').slice(0,2)}
                      </div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:500 }}>{t.name}</div>
                        <div className="meta">{t.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`chip chip-${ROLES[t.role].color}`}>{ROLES[t.role].label}</span></td>
                  <td>
                    <span className={`chip chip-${status==='active'?'moss':status==='light'?'ochre':'ink'}`}>
                      <span className="chip-dot"/>
                      {status==='active'?'Active':status==='light'?'Light day':'Away'}
                    </span>
                  </td>
                  <td>
                    <div className="mono num" style={{ fontSize:13, fontWeight:500 }}>{today.toFixed(2)}h</div>
                    <div className="progress" style={{ width:60, marginTop:3 }}>
                      <span style={{ width:`${Math.min((today/8)*100,100)}%`, background:today>=7?'var(--moss-500)':today>=4?'var(--ochre-500)':'var(--rust-500)' }}/>
                    </div>
                  </td>
                  <td>
                    <div className="mono num" style={{ fontSize:12 }}>
                      <span style={{ color: weekAct>weekEst ? 'var(--rust-600)' : 'var(--fg)', fontWeight:500 }}>{weekAct}h</span>
                      <span style={{ color:'var(--fg-muted)' }}> / {weekEst}h</span>
                    </div>
                    <div className="meta">{weekEst-weekAct>=0?`${weekEst-weekAct}h under`:`${weekAct-weekEst}h over`}</div>
                  </td>
                  <td>
                    <div className="mono num" style={{ fontSize:13, fontWeight:500, color: accuracy>=85?'var(--moss-600)':accuracy>=70?'var(--ochre-600)':'var(--rust-600)' }}>{accuracy}%</div>
                  </td>
                  <td><button className="btn-ghost" style={{ padding:4, color:'var(--fg-muted)' }}><I.Chevron size={14}/></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

Object.assign(window, { WorklogsScreen, EmployeeWorklogsScreen, DateStrip, Timer });
