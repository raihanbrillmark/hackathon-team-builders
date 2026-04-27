// Reports, Clients, Settings, LOE Approvals
const { useState: uSR } = React;

// ============ REPORTS ============
function ReportsScreen() {
  const [range, setRange] = uSR('30d');
  return (
    <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Reports</div>
          <h1 style={{ margin:0, fontSize:22, fontFamily:'var(--font-display)', fontWeight:600, letterSpacing:'-0.02em', lineHeight:1.15 }}>Billable vs estimated</h1>
          <div className="meta">Mar 20 – Apr 19 · 11 projects · 8 people</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <div style={{ display:'flex', gap:2, padding:2, background:'var(--bg-sunken)', borderRadius:6, border:'1px solid var(--border)' }}>
            {['7d','30d','90d','custom'].map(r=>(
              <button key={r} onClick={()=>setRange(r)} style={{
                padding:'4px 10px', borderRadius:4, fontSize:11, fontWeight:500,
                background: range===r ? 'var(--bg-raised)' : 'transparent',
                color: range===r ? 'var(--fg)' : 'var(--fg-muted)',
              }}>{r}</button>
            ))}
          </div>
          <button className="btn btn-primary btn-sm"><I.Download size={12}/> Export CSV</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', padding:12, background:'var(--bg-sunken)', border:'1px solid var(--border)', borderRadius:8 }}>
        {[
          { label:'All clients', count:6, icon:I.Users },
          { label:'All projects', count:11, icon:I.Folder },
          { label:'All users', count:8, icon:I.UserCheck },
          { label:'Billable + internal', icon:I.Check },
        ].map((f, i) => (
          <button key={i} className="btn btn-sm" style={{ background:'var(--bg-raised)' }}>
            <f.icon size={12}/> {f.label} {f.count && <span className="mono" style={{ color:'var(--fg-muted)' }}>· {f.count}</span>}
            <I.ChevronDown size={10} style={{ marginLeft:4, color:'var(--fg-muted)' }}/>
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12 }}>
        {[
          { label:'Total hours',     value:'1,076', unit:'h', foot:'1,248 est · 86% accuracy' },
          { label:'Billable ratio', value:'72', unit:'%',   foot:'774h billable', positive:true },
          { label:'LOE accuracy',    value:'86', unit:'%',   foot:'+4pp vs last period', positive:true },
          { label:'At-risk projects',value:'3',   unit:'',   foot:'Burn > 85% or over', warn:true },
        ].map((k,i) => (
          <div key={i} className="card" style={{ padding:14 }}>
            <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{k.label}</div>
            <div style={{ display:'flex', alignItems:'baseline', gap:4, marginTop:4 }}>
              <span className="num" style={{ fontSize:26, fontWeight:600, fontFamily:'var(--font-display)', letterSpacing:'-0.02em' }}>{k.value}</span>
              {k.unit && <span style={{ fontSize:12, color:'var(--fg-muted)' }}>{k.unit}</span>}
            </div>
            <div style={{ fontSize:11, color: k.warn?'var(--rust-600)': k.positive?'var(--moss-600)':'var(--fg-muted)', marginTop:4 }}>{k.foot}</div>
          </div>
        ))}
      </div>

      {/* By project table */}
      <div className="card" style={{ overflow:'hidden' }}>
        <div style={{ padding:'12px 14px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:13, fontWeight:600 }}>By project</div>
            <div className="meta">Estimated vs actual LOE, billable split</div>
          </div>
          <button className="btn-ghost btn btn-sm">View: By project <I.ChevronDown size={10}/></button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th style={{ paddingLeft:16 }}>Project</th>
              <th>Client</th>
              <th>Estimated</th>
              <th>Actual</th>
              <th>Δ</th>
              <th>Billable</th>
              <th>Split</th>
              <th>Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {PROJECTS.slice(0,8).map(p => {
              const est = Math.abs(p.budget) || 100;
              const act = p.total || 0;
              const delta = act - est;
              const acc = Math.max(0, Math.round((1 - Math.abs(delta)/est)*100));
              const bill = p.billable;
              return (
                <tr key={p.id}>
                  <td style={{ paddingLeft:16 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <span className="code-badge">{p.code}</span>
                      <div style={{ fontSize:13, fontWeight:500 }}>{p.name}</div>
                    </div>
                  </td>
                  <td><div style={{ fontSize:12 }}>{p.client}</div></td>
                  <td><span className="mono num">{est.toFixed(0)}h</span></td>
                  <td><span className="mono num" style={{ fontWeight:500 }}>{act.toFixed(0)}h</span></td>
                  <td>
                    <span className="mono num" style={{ color: delta>0?'var(--rust-600)':delta<0?'var(--moss-600)':'var(--fg-muted)' }}>
                      {delta>0?'+':''}{delta.toFixed(0)}h
                    </span>
                  </td>
                  <td><span className="mono num">{bill.toFixed(0)}h</span></td>
                  <td>
                    <div style={{ display:'flex', height:6, borderRadius:3, overflow:'hidden', width:80 }}>
                      <div style={{ width:`${(bill/act||0)*100}%`, background:'var(--moss-500)' }}/>
                      <div style={{ flex:1, background:'var(--sand-300)' }}/>
                    </div>
                    <div className="meta mono" style={{ fontSize:10, marginTop:2 }}>{act>0?Math.round((bill/act)*100):0}% billable</div>
                  </td>
                  <td>
                    <span className="chip mono" style={{
                      background: acc>=85?'var(--moss-100)':acc>=70?'var(--ochre-100)':'var(--rust-100)',
                      color: acc>=85?'var(--moss-600)':acc>=70?'var(--ochre-600)':'var(--rust-600)',
                    }}>{acc}%</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============ CLIENTS ============
function ClientsScreen() {
  return (
    <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Clients</div>
          <h1 style={{ margin:0, fontSize:22, fontFamily:'var(--font-display)', fontWeight:600, letterSpacing:'-0.02em', lineHeight:1.15 }}>All clients</h1>
          <div className="meta">{CLIENTS.length} active · <span className="mono">{CLIENTS.reduce((s,c)=>s+c.hours,0)}h</span> logged this quarter</div>
        </div>
        <button className="btn btn-primary btn-sm"><I.Plus size={12}/> New client</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12 }}>
        {CLIENTS.map(c => {
          const projs = PROJECTS.filter(p=>p.clientId===c.id);
          const ongoing = projs.filter(p=>p.status==='ongoing').length;
          const hrs = projs.reduce((s,p)=>s+p.total,0);
          const budget = projs.reduce((s,p)=>s+Math.max(p.budget,0),0);
          return (
            <div key={c.id} className="card" style={{ padding:16, cursor:'pointer', transition:'border-color 120ms' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='var(--ink-400)'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                <div style={{ width:40, height:40, borderRadius:8, background:'var(--sand-200)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontSize:16, fontWeight:600 }}>
                  {c.name.split(' ').map(s=>s[0]).join('').slice(0,2)}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:600 }}>{c.name}</div>
                  <div className="meta">{projs.length} projects · {ongoing} ongoing</div>
                </div>
                <button className="btn-ghost" style={{ padding:4, color:'var(--fg-muted)' }}><I.More size={14}/></button>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, padding:'10px 0', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize:10, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Logged</div>
                  <div className="mono num" style={{ fontSize:16, fontWeight:600, fontFamily:'var(--font-display)' }}>{hrs.toFixed(0)}h</div>
                </div>
                <div>
                  <div style={{ fontSize:10, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Budget</div>
                  <div className="mono num" style={{ fontSize:16, fontWeight:600, fontFamily:'var(--font-display)' }}>{budget.toFixed(0)}h</div>
                </div>
              </div>

              <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:4 }}>
                {projs.slice(0,3).map(p => (
                  <div key={p.id} style={{ display:'flex', alignItems:'center', gap:8, fontSize:11 }}>
                    <span className="code-badge" style={{ width:20, height:20, fontSize:8 }}>{p.code}</span>
                    <span style={{ flex:1, minWidth:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.name}</span>
                    <StatusPill status={p.status}/>
                  </div>
                ))}
                {projs.length>3 && <div className="meta" style={{ marginTop:2 }}>+{projs.length-3} more</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ LOE APPROVALS ============
function LOEScreen() {
  return (
    <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>LOE Approvals</div>
          <h1 style={{ margin:0, fontSize:22, fontFamily:'var(--font-display)', fontWeight:600, letterSpacing:'-0.02em', lineHeight:1.15 }}>Pending your review</h1>
          <div className="meta"><span className="mono" style={{ color:'var(--rust-600)' }}>3 pending</span> · approve to lock the estimate and start work</div>
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {PENDING_LOE.map((l,i)=>{
          const u = TEAM.find(t=>t.id===l.by);
          return (
            <div key={i} className="card" style={{ padding:16, display:'flex', gap:16, alignItems:'center' }}>
              <div className="avatar avatar-lg" style={{ background:u.color, color:'white' }}>
                {u.name.split(' ').map(s=>s[0]).join('').slice(0,2)}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <span className="chip chip-ink mono" style={{ fontSize:10 }}>{l.project}</span>
                  <span style={{ fontSize:13, fontWeight:600 }}>{l.task}</span>
                </div>
                <div className="meta" style={{ marginBottom:8 }}>
                  Submitted by <span style={{ color:'var(--fg)' }}>{u.name}</span> · 18 min ago · <span className="chip chip-moss" style={{ fontSize:10, height:16 }}>Billable</span>
                </div>
                <div style={{ fontSize:12, lineHeight:1.5, padding:10, background:'var(--bg-sunken)', borderRadius:6, border:'1px solid var(--border)' }}>
                  {l.note}
                </div>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Estimated</div>
                <div className="num mono" style={{ fontSize:32, fontWeight:600, fontFamily:'var(--font-display)', letterSpacing:'-0.02em', lineHeight:1 }}>{l.est}<span style={{ fontSize:13, color:'var(--fg-muted)', fontWeight:400 }}>h</span></div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:6, width:110 }}>
                <button className="btn btn-sm" style={{ background:'var(--moss-600)', borderColor:'var(--moss-600)', color:'white', justifyContent:'center' }}>
                  <I.Check size={12}/> Approve & lock
                </button>
                <button className="btn btn-sm" style={{ justifyContent:'center' }}>Request revise</button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop:8 }}>
        <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Recently approved</div>
        <div className="card" style={{ overflow:'hidden' }}>
          {[
            { task:'Star rating interaction spec', project:'PRW', by:'mh', est:6, approved:'Today, 10:42' },
            { task:'A/B test: hero CTA variants', project:'WBTD', by:'ka', est:8, approved:'Yesterday' },
            { task:'Email template redesign', project:'KOR', by:'mh', est:10, approved:'Apr 17' },
          ].map((l, i) => {
            const u = TEAM.find(t=>t.id===l.by);
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderTop: i>0?'1px solid var(--border)':'none', fontSize:12 }}>
                <I.Lock size={12} style={{ color:'var(--moss-600)' }}/>
                <div className="avatar avatar-sm" style={{ background:u.color, color:'white' }}>{u.name.split(' ').map(s=>s[0]).join('').slice(0,2)}</div>
                <span className="chip chip-ink mono" style={{ fontSize:10 }}>{l.project}</span>
                <div style={{ flex:1, fontSize:12, fontWeight:500 }}>{l.task}</div>
                <div className="mono num" style={{ fontSize:12 }}>{l.est}h</div>
                <div className="meta mono" style={{ width:100, textAlign:'right' }}>{l.approved}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============ SETTINGS (Slack focus) ============
function SettingsScreen() {
  const [section, setSection] = uSR('slack');
  const sections = [
    { id:'workspace', label:'Workspace', icon:I.Settings },
    { id:'members',   label:'Members & roles', icon:I.Users },
    { id:'slack',     label:'Slack',      icon:I.Slack },
    { id:'billing',   label:'Billing',    icon:I.FileText },
    { id:'api',       label:'API & webhooks', icon:I.Settings },
  ];
  return (
    <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
        <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Settings</div>
        <h1 style={{ margin:0, fontSize:22, fontFamily:'var(--font-display)', fontWeight:600, letterSpacing:'-0.02em', lineHeight:1.15 }}>Tenant settings</h1>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'200px 1fr', gap:20 }}>
        <nav style={{ display:'flex', flexDirection:'column', gap:1 }}>
          {sections.map(s=>(
            <button key={s.id} onClick={()=>setSection(s.id)} style={{
              padding:'8px 10px', display:'flex', alignItems:'center', gap:10, borderRadius:6, fontSize:12,
              background: section===s.id ? 'var(--sand-200)' : 'transparent',
              fontWeight: section===s.id ? 600 : 500,
              color: section===s.id ? 'var(--fg)' : 'var(--fg-muted)',
            }}>
              <s.icon size={13}/> {s.label}
            </button>
          ))}
        </nav>

        {section === 'slack' && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div className="card" style={{ padding:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                <div style={{ width:40, height:40, borderRadius:8, background:'var(--sand-200)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <I.Slack size={20}/>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:600 }}>Slack integration</div>
                  <div className="meta">Connected to <span style={{ color:'var(--fg)' }}>brillmark.slack.com</span> · 14 members matched</div>
                </div>
                <span className="chip chip-moss">
                  <span className="chip-dot"/>
                  Connected
                </span>
                <button className="btn btn-sm">Disconnect</button>
              </div>

              <div style={{ borderTop:'1px solid var(--border)', paddingTop:12, display:'flex', flexDirection:'column', gap:10 }}>
                <div style={{ fontSize:12, fontWeight:600, marginBottom:4 }}>Notification channels</div>
                {[
                  { label:'Task assignment', chan:'#brillmark-worklogs', on:true },
                  { label:'LOE submission', chan:'#pm-approvals', on:true },
                  { label:'LOE approved / rejected', chan:'#pm-approvals', on:true },
                  { label:'Daily worklog digest at 9:00', chan:'#brillmark-worklogs', on:true },
                  { label:'Weekly billable summary', chan:'#leadership', on:false },
                  { label:'Project status change', chan:'#brillmark-worklogs', on:false },
                ].map((n,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 10px', background:'var(--bg-sunken)', borderRadius:6, border:'1px solid var(--border)' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:500 }}>{n.label}</div>
                      <div className="mono meta">{n.chan}</div>
                    </div>
                    <div style={{
                      width:32, height:18, borderRadius:9, padding:2,
                      background: n.on ? 'var(--moss-600)' : 'var(--sand-300)',
                      display:'flex', alignItems:'center', justifyContent: n.on?'flex-end':'flex-start',
                      cursor:'pointer', transition:'all 120ms',
                    }}>
                      <div style={{ width:14, height:14, borderRadius:'50%', background:'white', boxShadow:'0 1px 2px rgba(0,0,0,0.2)' }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding:16 }}>
              <div style={{ fontSize:12, fontWeight:600, marginBottom:8 }}>Test notification</div>
              <div style={{ padding:14, background:'var(--bg-sunken)', borderRadius:6, border:'1px solid var(--border)', fontSize:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                  <div style={{ width:24, height:24, borderRadius:4, background:'var(--ink-900)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:11 }}>t</div>
                  <div style={{ fontWeight:600 }}>Trakio <span style={{ fontWeight:400, color:'var(--fg-muted)', fontSize:11 }}>APP</span></div>
                  <span className="meta">2:17 PM</span>
                </div>
                <div style={{ paddingLeft:32 }}>
                  <div style={{ marginBottom:4 }}>🎯 <strong>LOE submitted</strong> on <em>CLS audit + remediation</em> · PSA</div>
                  <div style={{ color:'var(--fg-muted)' }}>Nabila estimated <strong style={{ color:'var(--fg)' }}>6h</strong>. Approve in Trakio →</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {section !== 'slack' && (
          <div className="card" style={{ padding:40, textAlign:'center', color:'var(--fg-muted)' }}>
            <I.Settings size={28} style={{ opacity:0.4, marginBottom:8 }}/>
            <div style={{ fontSize:13, fontWeight:500, color:'var(--fg)' }}>{sections.find(s=>s.id===section).label}</div>
            <div className="meta" style={{ marginTop:4 }}>Settings for this section (prototype)</div>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { ReportsScreen, ClientsScreen, LOEScreen, SettingsScreen });
