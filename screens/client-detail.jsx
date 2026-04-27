// Single Client Detail — replaces clients grid when a client is opened
const { useState: uSCD, useMemo: uMCD } = React;

// --- helpers ---
function CDBack({ onBack }) {
  return (
    <button onClick={onBack} className="btn-ghost" style={{
      display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--fg-muted)',
    }}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M7.5 2.5L4 6l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      All clients
    </button>
  );
}

function CDAvatar({ member, size=22 }) {
  if (!member) return null;
  const initials = member.name.split(' ').map(n=>n[0]).slice(0,2).join('');
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%',
      background: member.color, color:'#fff',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize: size<=22?10:11, fontWeight:600, fontFamily:'var(--font-mono)',
      flex:'none',
    }}>{initials}</div>
  );
}

const HEALTH_META = {
  strong:    { label:'Strong',         dot:'var(--moss-500)',  color:'var(--moss-600)',  chip:'moss' },
  stable:    { label:'Stable',         dot:'var(--blue-500)',  color:'var(--blue-600)',  chip:'blue' },
  'at-risk': { label:'At risk',        dot:'var(--ochre-500)', color:'var(--ochre-600)', chip:'ochre' },
  'churn-risk':{ label:'Churn risk',   dot:'var(--rust-500)',  color:'var(--rust-600)',  chip:'rust' },
};

function CDStat({ label, value, unit, foot, footColor, accent }) {
  return (
    <div style={{ background:'var(--bg-raised)', padding:'14px 16px' }}>
      <div style={{ fontSize:10, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:500 }}>{label}</div>
      <div style={{ fontSize:24, fontWeight:600, fontFamily:'var(--font-display)', letterSpacing:'-0.02em', marginTop:4, display:'flex', alignItems:'baseline', gap:4, color: accent || 'var(--fg)' }}>
        <span className="num">{value}</span>
        {unit && <span style={{ fontSize:11, color:'var(--fg-muted)', fontWeight:400 }}>{unit}</span>}
      </div>
      <div style={{ fontSize:10, color: footColor || 'var(--fg-muted)', marginTop:4 }}>{foot}</div>
    </div>
  );
}

// Monogram cell for the giant client avatar at the top
function CDMonogram({ name, size=60 }) {
  const initials = name.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase();
  return (
    <div style={{
      width:size, height:size, borderRadius:8,
      background:'var(--bg-raised)', border:'1px solid var(--border)',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:'var(--font-display)', fontSize: size*0.38, fontWeight:600,
      letterSpacing:'-0.02em', color:'var(--teal-700)', flex:'none',
    }}>{initials}</div>
  );
}

// Simple sparkline (hours logged over 12 months, synthetic)
function CDSparkline({ seed=1, over=false }) {
  const w=160, h=36;
  const pts = [];
  let v = 20 + (seed*7 % 30);
  for (let i=0; i<12; i++) {
    v = Math.max(8, Math.min(90, v + ((seed*17 + i*13) % 31) - 15));
    pts.push(v);
  }
  const max = Math.max(...pts);
  const min = Math.min(...pts);
  const norm = pts.map((p,i)=>[ (i/11)*w, h - 2 - ((p-min)/(max-min || 1))*(h-6) ]);
  const d = norm.map(([x,y],i)=>`${i===0?'M':'L'}${x},${y}`).join(' ');
  const area = `${d} L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ display:'block' }}>
      <defs>
        <linearGradient id={`cdspark-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--teal-500)" stopOpacity="0.22"/>
          <stop offset="100%" stopColor="var(--teal-500)" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#cdspark-${seed})`}/>
      <path d={d} fill="none" stroke={over?'var(--rust-500)':'var(--teal-600)'} strokeWidth="1.5"/>
      <circle cx={norm[norm.length-1][0]} cy={norm[norm.length-1][1]} r="2.5" fill={over?'var(--rust-500)':'var(--teal-600)'} stroke="var(--bg-raised)" strokeWidth="1.5"/>
    </svg>
  );
}

function CDInvoiceRow({ inv }) {
  const s = INVOICE_STATUS[inv.status];
  const out = inv.total - inv.paid;
  return (
    <tr>
      <td style={{ paddingLeft:16 }}>
        <div className="mono" style={{ fontSize:12, fontWeight:500 }}>{inv.id}</div>
        <div className="meta" style={{ fontSize:10 }}>{inv.type}</div>
      </td>
      <td><span className={`chip chip-${s.chip}`}><span className="chip-dot" style={{ background:s.dot }}/>{s.label}</span></td>
      <td style={{ fontSize:12 }}>{inv.issued}</td>
      <td style={{ fontSize:12 }}>{inv.due}</td>
      <td className="num mono" style={{ fontSize:12, textAlign:'right' }}>{CURRENCIES[inv.currency].fmt(inv.total)}</td>
      <td className="num mono" style={{ fontSize:12, textAlign:'right', color: inv.paid>0?'var(--moss-600)':'var(--fg-muted)' }}>{CURRENCIES[inv.currency].fmt(inv.paid)}</td>
      <td className="num mono" style={{ fontSize:12, textAlign:'right', paddingRight:16, color: out>0?'var(--rust-600)':'var(--fg)', fontWeight: out>0?500:400 }}>{CURRENCIES[inv.currency].fmt(out)}</td>
    </tr>
  );
}

function CDProjectCard({ project, onOpen }) {
  const sm = STATUS_META[project.status];
  const over = project.budget < 0 || (project.budget > 0 && project.total > project.budget);
  const burnPct = project.budget > 0 ? Math.min((project.total/project.budget)*100, 140) : 0;
  const tasks = TASKS.filter(t=>t.project===project.id);
  const openTasks = tasks.filter(t=>t.status!=='done').length;
  return (
    <div onClick={()=>onOpen && onOpen(project.id)} className="card"
      style={{ padding:14, cursor:'pointer', display:'flex', flexDirection:'column', gap:10, transition:'border-color 120ms, transform 120ms' }}
      onMouseEnter={e=>{ e.currentTarget.style.borderColor='var(--ink-400)'; }}
      onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border)'; }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <span className="code-badge" style={{ width:28, height:28, fontSize:10 }}>{project.code}</span>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{project.name}</div>
          <div className="meta" style={{ fontSize:10 }}>Started {project.created}</div>
        </div>
        <span className={`chip chip-${sm.chip}`} style={{ flex:'none' }}><span className="chip-dot"/>{sm.label}</span>
      </div>
      <div>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:11 }}>
          <span className="meta">Burn</span>
          <span className="mono num" style={{ fontWeight:500, color: over?'var(--rust-600)':'var(--fg)' }}>
            {project.total.toFixed(0)}h {project.budget>0?`/ ${project.budget}h`:''}
          </span>
        </div>
        <div style={{ height:4, background:'var(--sand-200)', borderRadius:2, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${Math.min(burnPct,100)}%`, background: over?'var(--rust-500)':burnPct>85?'var(--ochre-500)':'var(--teal-500)' }}/>
        </div>
      </div>
      <div style={{ display:'flex', gap:14, fontSize:11, color:'var(--fg-muted)', paddingTop:8, borderTop:'1px solid var(--border)' }}>
        <span>{tasks.length} tasks</span>
        <span>·</span>
        <span>{openTasks} open</span>
        <span>·</span>
        <span style={{ textTransform:'capitalize' }}>{project.priority} priority</span>
      </div>
    </div>
  );
}

function CDContactCard({ c }) {
  return (
    <div style={{ padding:14, background:'var(--bg-raised)', border:'1px solid var(--border)', borderRadius:8, display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
        <div style={{
          width:36, height:36, borderRadius:'50%',
          background:'var(--sand-200)', color:'var(--ink-700)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:12, fontWeight:600, flex:'none', fontFamily:'var(--font-display)',
        }}>{c.name.split(' ').map(s=>s[0]).slice(0,2).join('')}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:13, fontWeight:600 }}>{c.name}</span>
            {c.primary && <span className="chip chip-teal" style={{ fontSize:9, height:16 }}>Primary</span>}
          </div>
          <div className="meta" style={{ fontSize:11 }}>{c.title}</div>
        </div>
        <button className="btn-ghost" style={{ padding:4, color:'var(--fg-muted)' }}><I.More size={12}/></button>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:4, borderTop:'1px solid var(--border)', paddingTop:8 }}>
        <a href={`mailto:${c.email}`} style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'var(--fg-muted)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
          <I.Mail size={11} style={{ flex:'none' }}/> <span style={{ color:'var(--fg)', overflow:'hidden', textOverflow:'ellipsis' }}>{c.email}</span>
        </a>
        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'var(--fg-muted)' }}>
          <I.Phone size={11} style={{ flex:'none' }}/> <span style={{ color:'var(--fg)' }} className="mono">{c.phone}</span>
        </div>
      </div>
    </div>
  );
}

function ClientDetailScreen({ clientId, onBack, onOpenProject }) {
  const [tab, setTab] = uSCD('overview');
  const client = CLIENTS.find(c => c.id === clientId);
  const detail = CLIENT_DETAIL[clientId] || CLIENT_DETAIL_DEFAULT;
  const billing = CLIENT_BILLING[clientId];

  if (!client) return <div style={{ padding:24 }}>Client not found</div>;

  const projects = uMCD(() => PROJECTS.filter(p => p.clientId === clientId), [clientId]);
  const invoices = uMCD(() => INVOICES.filter(i => i.client === clientId), [clientId]);
  const team = uMCD(() => {
    // Collect everyone ever assigned to any task on this client's projects
    const projectIds = new Set(projects.map(p=>p.id));
    const ids = new Set();
    TASKS.forEach(t => { if (projectIds.has(t.project)) ids.add(t.assignee); });
    return Array.from(ids).map(id => TEAM.find(t=>t.id===id)).filter(Boolean);
  }, [projects]);

  const owner = TEAM.find(t=>t.id===detail.owner);
  const csm = TEAM.find(t=>t.id===detail.csm);

  // Derived metrics
  const totalLogged = projects.reduce((s,p)=>s+p.total, 0);
  const totalBillable = projects.reduce((s,p)=>s+p.billable, 0);
  const billablePct = totalLogged>0 ? Math.round((totalBillable/totalLogged)*100) : 0;

  const currency = (billing && billing.currency) || 'USD';
  const fmt = (n) => CURRENCIES[currency].fmt(n);
  // Normalize invoice totals to the client's currency (they should match billing currency; fallback raw sum)
  const totalInvoiced = invoices.filter(i=>i.status!=='void').reduce((s,i)=>s+i.total, 0);
  const totalPaid = invoices.reduce((s,i)=>s+i.paid, 0);
  const outstanding = invoices.filter(i=>i.status!=='paid' && i.status!=='void').reduce((s,i)=>s+(i.total-i.paid), 0);
  const overdueCount = invoices.filter(i=>i.status==='overdue').length;

  const activity = ACTIVITY.filter(a => {
    const p = PROJECTS.find(pp=>pp.id===a.project);
    return p && p.clientId === clientId;
  });

  const health = HEALTH_META[detail.health] || HEALTH_META.stable;
  const seed = clientId.charCodeAt(0) + clientId.charCodeAt(1||0);

  return (
    <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
      {/* Breadcrumb row */}
      <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'var(--fg-muted)', flexWrap:'wrap' }}>
        <CDBack onBack={onBack}/>
        <span style={{ color:'var(--fg-subtle)' }}>·</span>
        <span style={{ color:'var(--fg)', whiteSpace:'nowrap' }}>{client.name}</span>
      </div>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
        <div style={{ display:'flex', gap:14, alignItems:'flex-start', flex:'1 1 420px', minWidth:0 }}>
          <CDMonogram name={client.name} size={60}/>
          <div style={{ minWidth:0, flex:1 }}>
            <h1 style={{ margin:0, fontSize:24, fontFamily:'var(--font-display)', fontWeight:600, letterSpacing:'-0.02em', lineHeight:1.15 }}>
              {client.name}
            </h1>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:8, flexWrap:'wrap' }}>
              <span className={`chip chip-${health.chip}`}><span className="chip-dot"/>Health · {health.label}</span>
              <span className="chip chip-ink"><span className="chip-dot"/>Tier · {detail.tier}</span>
              <span style={{ width:3, height:3, background:'var(--fg-muted)', borderRadius:'50%' }}/>
              <span className="meta" style={{ fontSize:11, whiteSpace:'nowrap' }}>{detail.industry}</span>
              <span style={{ width:3, height:3, background:'var(--fg-muted)', borderRadius:'50%' }}/>
              <span className="meta" style={{ fontSize:11 }}>{detail.size}</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:6, flexWrap:'wrap' }}>
              {detail.website && (
                <a href={`https://${detail.website}`} target="_blank" rel="noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11, color:'var(--teal-700)' }}>
                  <I.Globe size={11}/> {detail.website}
                </a>
              )}
              {detail.phone && <>
                <span style={{ width:3, height:3, background:'var(--fg-muted)', borderRadius:'50%' }}/>
                <span className="meta mono" style={{ fontSize:11 }}>{detail.phone}</span>
              </>}
              <span style={{ width:3, height:3, background:'var(--fg-muted)', borderRadius:'50%' }}/>
              <span className="meta" style={{ fontSize:11 }}>Client since {detail.since}</span>
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center', flex:'none' }}>
          <button className="btn btn-sm"><I.Send size={12}/> Email</button>
          <button className="btn btn-sm"><I.Download size={12}/> Export</button>
          <button className="btn btn-sm"><I.Edit size={12}/> Edit</button>
          <button className="btn btn-accent btn-sm"><I.Plus size={12}/> New project</button>
          <button className="btn btn-ghost btn-sm"><I.More size={12}/></button>
        </div>
      </div>

      {/* Summary callout */}
      <div style={{ background:'var(--bg-raised)', border:'1px solid var(--border)', borderRadius:8, padding:16, display:'grid', gridTemplateColumns:'1fr 240px', gap:16 }}>
        <div>
          <div style={{ fontSize:10, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:500, marginBottom:6 }}>Account summary</div>
          <div style={{ fontSize:13, lineHeight:1.55, color:'var(--fg)' }}>{detail.summary}</div>
          <div style={{ display:'flex', gap:20, marginTop:12, fontSize:11, color:'var(--fg-muted)', flexWrap:'wrap' }}>
            <div>Currency · <span className="mono" style={{ color:'var(--fg)' }}>{currency}</span></div>
            <div>Terms · <span style={{ color:'var(--fg)' }}>{billing?billing.terms:'—'}</span></div>
            <div>Default rate · <span className="mono" style={{ color:'var(--fg)' }}>{billing?CURRENCIES[currency].symbol+billing.defaultRate:'—'}/hr</span></div>
            <div>POs · <span style={{ color:'var(--fg)' }}>{billing?(billing.poRequired?'Required':'Not required'):'—'}</span></div>
            {detail.npsLast !== null && <div>Last NPS · <span className="mono" style={{ color:'var(--fg)' }}>{detail.npsLast}</span></div>}
          </div>
        </div>
        <div style={{ borderLeft:'1px solid var(--border)', paddingLeft:16, display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ fontSize:10, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:500 }}>Account team</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {owner && (
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <CDAvatar member={owner} size={22}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{owner.name}</div>
                  <div style={{ fontSize:10, color:'var(--fg-muted)' }}>Account owner</div>
                </div>
              </div>
            )}
            {csm && csm.id !== (owner && owner.id) && (
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <CDAvatar member={csm} size={22}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{csm.name}</div>
                  <div style={{ fontSize:10, color:'var(--fg-muted)' }}>CSM / day-to-day</div>
                </div>
              </div>
            )}
          </div>
          {team.length > 0 && (
            <div style={{ paddingTop:8, borderTop:'1px solid var(--border)' }}>
              <div style={{ fontSize:10, color:'var(--fg-muted)', marginBottom:6 }}>Delivery team ({team.length})</div>
              <div style={{ display:'flex' }}>
                {team.slice(0, 6).map((m, i) => (
                  <div key={m.id} style={{ marginLeft: i===0?0:-6, border:'2px solid var(--bg-raised)', borderRadius:'50%' }}>
                    <CDAvatar member={m} size={22}/>
                  </div>
                ))}
                {team.length > 6 && (
                  <div style={{ marginLeft:-6, width:22, height:22, borderRadius:'50%', background:'var(--sand-200)', color:'var(--ink-700)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:600, fontFamily:'var(--font-mono)', border:'2px solid var(--bg-raised)' }}>+{team.length-6}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stat strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:1, background:'var(--border)', border:'1px solid var(--border)', borderRadius:8, overflow:'hidden' }}>
        <CDStat
          label="Projects" value={projects.length} unit=""
          foot={`${projects.filter(p=>p.status==='ongoing').length} ongoing · ${projects.filter(p=>p.status==='hold').length} on hold`}
        />
        <CDStat
          label="Hours logged" value={totalLogged.toFixed(0)} unit="hrs"
          foot={`${totalBillable.toFixed(0)}h billable · ${billablePct}% ratio`}
        />
        <CDStat
          label="Invoiced (lifetime)" value={fmt(totalInvoiced).replace(/\.\d+/,'')} unit=""
          foot={`${invoices.length} invoices · ${fmt(totalPaid).replace(/\.\d+/,'')} paid`}
        />
        <CDStat
          label="Outstanding" value={outstanding>0 ? fmt(outstanding).replace(/\.\d+/,'') : '—'} unit=""
          foot={overdueCount>0?`${overdueCount} overdue`:'All current'}
          footColor={overdueCount>0?'var(--rust-600)':'var(--moss-600)'}
          accent={outstanding>0?'var(--rust-700)':undefined}
        />
        <CDStat
          label="Recurring MRR" value={detail.mrrUSD>0?CURRENCIES.USD.fmt(detail.mrrUSD).replace(/\.\d+/,''):'—'} unit=""
          foot={detail.mrrUSD>0?'Monthly recurring':'No active retainer'}
          footColor={detail.mrrUSD>0?'var(--moss-600)':'var(--fg-muted)'}
        />
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:2, borderBottom:'1px solid var(--border)' }}>
        {[
          { k:'overview',  label:'Overview',  count:null },
          { k:'projects',  label:'Projects',  count:projects.length },
          { k:'invoices',  label:'Invoices',  count:invoices.length },
          { k:'contacts',  label:'Contacts',  count:detail.contacts.length },
          { k:'contracts', label:'Contracts', count:detail.contracts.length },
          { k:'documents', label:'Documents', count:detail.documents.length },
          { k:'notes',     label:'Notes',     count:detail.notes.length },
        ].map(t => (
          <button key={t.k} onClick={()=>setTab(t.k)} style={{
            padding:'10px 14px', fontSize:12, fontWeight:500, whiteSpace:'nowrap',
            color: tab===t.k ? 'var(--fg)' : 'var(--fg-muted)',
            borderBottom: tab===t.k ? '2px solid var(--teal-600)' : '2px solid transparent',
            marginBottom:-1, display:'inline-flex', alignItems:'center', gap:6,
          }}>
            {t.label}
            {t.count !== null && <span style={{ fontSize:10, fontFamily:'var(--font-mono)', color:'var(--fg-muted)', background:'var(--sand-200)', padding:'1px 5px', borderRadius:3 }}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* === Overview tab === */}
      {tab === 'overview' && (
        <div style={{ display:'grid', gridTemplateColumns:'minmax(0, 1fr) 320px', gap:16 }}>
          {/* Left column */}
          <div style={{ display:'flex', flexDirection:'column', gap:16, minWidth:0 }}>
            {/* Projects snapshot */}
            <section style={{ background:'var(--bg-raised)', border:'1px solid var(--border)', borderRadius:8, overflow:'hidden' }}>
              <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:500 }}>Active engagements</div>
                <button className="btn-ghost" style={{ fontSize:11, color:'var(--teal-700)' }} onClick={()=>setTab('projects')}>View all →</button>
              </div>
              <div style={{ padding:12, display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:10 }}>
                {projects.slice(0, 4).map(p => <CDProjectCard key={p.id} project={p} onOpen={onOpenProject}/>)}
                {projects.length === 0 && (
                  <div style={{ gridColumn:'1/-1', padding:24, textAlign:'center' }} className="meta">No projects yet for this client.</div>
                )}
              </div>
            </section>

            {/* Financial health — hours sparkline + invoice summary */}
            <section style={{ background:'var(--bg-raised)', border:'1px solid var(--border)', borderRadius:8, padding:16 }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12, gap:12 }}>
                <div>
                  <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:500 }}>Hours logged (12 mo)</div>
                  <div style={{ display:'flex', alignItems:'baseline', gap:6, marginTop:2 }}>
                    <span className="num" style={{ fontSize:22, fontWeight:600, fontFamily:'var(--font-display)', letterSpacing:'-0.02em' }}>{totalLogged.toFixed(0)}</span>
                    <span style={{ fontSize:11, color:'var(--fg-muted)' }}>hrs · {billablePct}% billable</span>
                  </div>
                </div>
                <div style={{ width:220, flex:'none' }}>
                  <CDSparkline seed={seed}/>
                </div>
              </div>
              <div style={{ paddingTop:12, borderTop:'1px solid var(--border)', display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12 }}>
                {[
                  { label:'Invoiced', value:fmt(totalInvoiced).replace(/\.\d+/,'') },
                  { label:'Paid', value:fmt(totalPaid).replace(/\.\d+/,''), color:'var(--moss-600)' },
                  { label:'Outstanding', value:outstanding>0?fmt(outstanding).replace(/\.\d+/,''):'—', color:outstanding>0?'var(--rust-600)':'var(--fg-muted)' },
                  { label:'Overdue', value:overdueCount, color:overdueCount>0?'var(--rust-600)':'var(--fg-muted)' },
                ].map((s,i)=>(
                  <div key={i}>
                    <div style={{ fontSize:10, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.label}</div>
                    <div className="num mono" style={{ fontSize:15, fontWeight:600, fontFamily:'var(--font-display)', color: s.color||'var(--fg)' }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Recent activity */}
            <section style={{ background:'var(--bg-raised)', border:'1px solid var(--border)', borderRadius:8, padding:16 }}>
              <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:500, marginBottom:12 }}>Recent activity</div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {activity.length === 0 && <div className="meta">No recent activity across this client's projects.</div>}
                {activity.slice(0, 6).map((a, i) => {
                  const m = TEAM.find(t=>t.id===a.who);
                  const p = PROJECTS.find(pp=>pp.id===a.project);
                  return (
                    <div key={i} style={{ display:'flex', gap:10, alignItems:'center' }}>
                      <CDAvatar member={m} size={22}/>
                      <div style={{ flex:1, fontSize:12, minWidth:0 }}>
                        <span style={{ fontWeight:600 }}>{m?m.name.split(' ')[0]:'—'}</span>{' '}
                        <span className="meta">{a.action}</span>{' '}
                        <span style={{ color:'var(--teal-700)' }}>{a.target}</span>{' '}
                        {p && <span className="mono meta" style={{ fontSize:10 }}>· {p.code}</span>}
                      </div>
                      <span className="meta" style={{ fontSize:11, whiteSpace:'nowrap' }}>{a.time}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right column */}
          <div style={{ display:'flex', flexDirection:'column', gap:16, minWidth:0 }}>
            {/* Primary contact */}
            {detail.contacts.filter(c=>c.primary)[0] && (
              <section style={{ background:'var(--bg-raised)', border:'1px solid var(--border)', borderRadius:8, padding:16 }}>
                <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:500, marginBottom:10 }}>Primary contact</div>
                <CDContactCard c={detail.contacts.filter(c=>c.primary)[0]}/>
                {detail.contacts.length > 1 && (
                  <button className="btn-ghost" style={{ fontSize:11, color:'var(--teal-700)', marginTop:8 }} onClick={()=>setTab('contacts')}>
                    View all {detail.contacts.length} contacts →
                  </button>
                )}
              </section>
            )}

            {/* Active contracts */}
            <section style={{ background:'var(--bg-raised)', border:'1px solid var(--border)', borderRadius:8, padding:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:500 }}>Active contracts</div>
                <button className="btn-ghost" style={{ fontSize:11, color:'var(--teal-700)' }} onClick={()=>setTab('contracts')}>All →</button>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {detail.contracts.filter(c=>c.status==='active').slice(0,3).map((c,i)=>(
                  <div key={i} style={{ padding:10, background:'var(--bg-sunken)', border:'1px solid var(--border)', borderRadius:6 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:8 }}>
                      <div style={{ fontSize:12, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.name}</div>
                      <div className="mono" style={{ fontSize:11, flex:'none' }}>{c.value}</div>
                    </div>
                    <div className="meta" style={{ fontSize:10, marginTop:2 }}>Signed {c.signed} · Expires {c.expires}</div>
                  </div>
                ))}
                {detail.contracts.filter(c=>c.status==='active').length === 0 && <div className="meta" style={{ fontSize:11 }}>No active contracts.</div>}
              </div>
            </section>

            {/* Billing profile */}
            <section style={{ background:'var(--bg-raised)', border:'1px solid var(--border)', borderRadius:8, padding:16 }}>
              <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:500, marginBottom:10 }}>Billing address</div>
              {billing ? (
                <>
                  <div style={{ fontSize:12, whiteSpace:'pre-line', lineHeight:1.5 }}>{billing.address}</div>
                  <div style={{ marginTop:10, paddingTop:10, borderTop:'1px solid var(--border)', display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    <div><div className="meta" style={{ fontSize:10 }}>Tax</div><div className="mono" style={{ fontSize:12 }}>{billing.taxRate>0?`${Math.round(billing.taxRate*100)}%`:'None'}</div></div>
                    <div><div className="meta" style={{ fontSize:10 }}>Attn</div><div style={{ fontSize:12, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{billing.contactName.split(' ')[0]}</div></div>
                  </div>
                </>
              ) : <div className="meta">Billing profile not set.</div>}
            </section>
          </div>
        </div>
      )}

      {/* === Projects tab === */}
      {tab === 'projects' && (
        <div style={{ background:'var(--bg-raised)', border:'1px solid var(--border)', borderRadius:8, padding:14 }}>
          {projects.length === 0 ? (
            <div style={{ padding:24, textAlign:'center' }} className="meta">No projects yet for this client.</div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:10 }}>
              {projects.map(p => <CDProjectCard key={p.id} project={p} onOpen={onOpenProject}/>)}
            </div>
          )}
        </div>
      )}

      {/* === Invoices tab === */}
      {tab === 'invoices' && (
        <div style={{ background:'var(--bg-raised)', border:'1px solid var(--border)', borderRadius:8, overflow:'hidden' }}>
          <div style={{ padding:'10px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ display:'flex', gap:14, fontSize:11 }}>
              <div>
                <span className="meta">Invoiced · </span>
                <span className="mono" style={{ fontWeight:500 }}>{fmt(totalInvoiced)}</span>
              </div>
              <div>
                <span className="meta">Paid · </span>
                <span className="mono" style={{ fontWeight:500, color:'var(--moss-600)' }}>{fmt(totalPaid)}</span>
              </div>
              <div>
                <span className="meta">Outstanding · </span>
                <span className="mono" style={{ fontWeight:500, color: outstanding>0?'var(--rust-600)':'var(--fg)' }}>{fmt(outstanding)}</span>
              </div>
            </div>
            <div style={{ flex:1 }}/>
            <button className="btn btn-accent btn-sm"><I.Plus size={12}/> New invoice</button>
          </div>
          {invoices.length === 0 ? (
            <div style={{ padding:20, textAlign:'center' }} className="meta">No invoices issued for this client yet.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th style={{ paddingLeft:16 }}>Invoice</th>
                  <th>Status</th>
                  <th>Issued</th>
                  <th>Due</th>
                  <th style={{ textAlign:'right' }}>Total</th>
                  <th style={{ textAlign:'right' }}>Paid</th>
                  <th style={{ textAlign:'right', paddingRight:16 }}>Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => <CDInvoiceRow key={inv.id} inv={inv}/>)}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* === Contacts tab === */}
      {tab === 'contacts' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div className="meta">{detail.contacts.length} contacts on file</div>
            <button className="btn btn-sm"><I.Plus size={12}/> Add contact</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:12 }}>
            {detail.contacts.map((c, i) => <CDContactCard key={i} c={c}/>)}
            {detail.contacts.length === 0 && <div style={{ gridColumn:'1/-1', padding:24, textAlign:'center' }} className="meta">No contacts yet.</div>}
          </div>
        </div>
      )}

      {/* === Contracts tab === */}
      {tab === 'contracts' && (
        <div style={{ background:'var(--bg-raised)', border:'1px solid var(--border)', borderRadius:8, overflow:'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ paddingLeft:16 }}>Contract</th>
                <th>Status</th>
                <th>Signed</th>
                <th>Expires</th>
                <th style={{ textAlign:'right' }}>Value</th>
                <th style={{ width:40 }}></th>
              </tr>
            </thead>
            <tbody>
              {detail.contracts.map((c, i) => {
                const chipColor = c.status==='active'?'moss':c.status==='completed'?'ink':c.status==='on-hold'?'ochre':'rust';
                return (
                  <tr key={i}>
                    <td style={{ paddingLeft:16 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <I.FileText size={13} style={{ color:'var(--fg-muted)' }}/>
                        <div>
                          <div style={{ fontSize:12, fontWeight:500 }}>{c.name}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`chip chip-${chipColor}`} style={{ textTransform:'capitalize' }}><span className="chip-dot"/>{c.status.replace('-',' ')}</span></td>
                    <td style={{ fontSize:12 }}>{c.signed}</td>
                    <td style={{ fontSize:12 }}>{c.expires}</td>
                    <td className="num mono" style={{ fontSize:12, fontWeight:500, textAlign:'right' }}>{c.value}</td>
                    <td><button className="btn-ghost" style={{ padding:4, color:'var(--fg-muted)' }}><I.Download size={12}/></button></td>
                  </tr>
                );
              })}
              {detail.contracts.length === 0 && (
                <tr><td colSpan={6} style={{ padding:24, textAlign:'center' }} className="meta">No contracts on file.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* === Documents tab === */}
      {tab === 'documents' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div className="meta">{detail.documents.length} files</div>
            <button className="btn btn-sm"><I.Plus size={12}/> Upload</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:10 }}>
            {detail.documents.map((d, i) => {
              const m = TEAM.find(t=>t.id===d.by);
              return (
                <div key={i} style={{ padding:12, background:'var(--bg-raised)', border:'1px solid var(--border)', borderRadius:6, display:'flex', gap:10, alignItems:'center' }}>
                  <div style={{ width:36, height:36, borderRadius:6, background:'var(--sand-200)', display:'flex', alignItems:'center', justifyContent:'center', flex:'none' }}>
                    <I.FileText size={16}/>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{d.name}</div>
                    <div className="meta" style={{ fontSize:10 }}>{d.size} · {m?m.name.split(' ')[0]:''} · {d.at}</div>
                  </div>
                  <button className="btn-ghost" style={{ padding:4, color:'var(--fg-muted)' }}><I.Download size={12}/></button>
                </div>
              );
            })}
            {detail.documents.length === 0 && <div style={{ gridColumn:'1/-1', padding:24, textAlign:'center' }} className="meta">No documents yet.</div>}
          </div>
        </div>
      )}

      {/* === Notes tab === */}
      {tab === 'notes' && (
        <div style={{ background:'var(--bg-raised)', border:'1px solid var(--border)', borderRadius:8, padding:16 }}>
          <textarea
            placeholder="Add an account note — visible to account team only…"
            style={{
              width:'100%', minHeight:64, padding:10, resize:'vertical',
              border:'1px solid var(--border-strong)', borderRadius:6,
              background:'var(--bg-sunken)', fontSize:12, fontFamily:'inherit',
              color:'var(--fg)', marginBottom:16,
            }}/>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {detail.notes.map((n, i) => {
              const m = TEAM.find(t=>t.id===n.by);
              return (
                <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                  <CDAvatar member={m} size={24}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
                      <span style={{ fontSize:12, fontWeight:600 }}>{m?m.name:'—'}</span>
                      <span className="meta" style={{ fontSize:11 }}>{n.at}</span>
                    </div>
                    <div style={{ fontSize:12, lineHeight:1.55, marginTop:2 }}>{n.body}</div>
                  </div>
                </div>
              );
            })}
            {detail.notes.length === 0 && <div className="meta">No notes yet.</div>}
          </div>
        </div>
      )}
    </div>
  );
}

window.ClientDetailScreen = ClientDetailScreen;
