// Projects list screen — the hero screen, based on the reference
const { useState: uS1, useMemo: uM1 } = React;

function StatusPill({ status, onClick }) {
  const meta = STATUS_META[status];
  return (
    <button onClick={onClick} className={`chip chip-${meta.chip}`} style={{ cursor:'pointer' }}>
      <span className="chip-dot"/>
      {meta.label}
    </button>
  );
}

function ProjectRow({ p, onOpen }) {
  const budgetOver = p.budget < 0 || (p.budget > 0 && p.total > p.budget);
  const burnPct = p.budget > 0 ? Math.min((p.total / p.budget) * 100, 100) : 0;
  const productivity = p.total > 0 ? Math.round((p.billable / p.total) * 100) : 0;
  const creator = TEAM.find(t=>t.id===p.createdBy);

  return (
    <tr onClick={onOpen} style={{ cursor:'pointer' }}>
      <td style={{ paddingLeft:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span className="code-badge">{p.code}</span>
          <div style={{ minWidth:0, display:'flex', flexDirection:'column', gap:2 }}>
            <div style={{ fontWeight:500, fontSize:13, lineHeight:1.25, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:260 }}>{p.name}</div>
            <div className="mono" style={{ fontSize:10, color:'var(--fg-muted)', lineHeight:1.2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:260 }}>{p.slug}</div>
          </div>
        </div>
      </td>
      <td>
        <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
          <div style={{ fontSize:12, lineHeight:1.25 }}>{p.client}</div>
          <div className="meta" style={{ lineHeight:1.2 }}>
            {creator ? <>Created by <span style={{ color:'var(--fg)' }}>{creator.name}</span></> : 'Created by —'}
          </div>
        </div>
      </td>
      <td><StatusPill status={p.status}/></td>
      <td>
        <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
          <div className="num mono" style={{ fontSize:13, fontWeight:500, lineHeight:1.25, color: p.budget < 0 ? 'var(--rust-600)':'var(--fg)' }}>
            {p.budget} <span style={{ fontFamily:'var(--font-sans)', fontWeight:400, fontSize:11, color:'var(--fg-muted)' }}>hrs</span>
          </div>
          <div className="meta" style={{ lineHeight:1.2 }}>Recurring each {p.recurring}</div>
        </div>
      </td>
      <td>
        <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
          <div className="num mono" style={{ fontSize:13, fontWeight:500, lineHeight:1.25 }}>{p.billable.toFixed(0).padStart(2,'0')} <span style={{ fontFamily:'var(--font-sans)', fontWeight:400, fontSize:11, color:'var(--fg-muted)' }}>hrs</span></div>
          <div className="meta" style={{ lineHeight:1.2, color: p.billable===0?'var(--rust-600)':'var(--fg-muted)' }}>
            {p.billable===0 ? '00hrs Non-billable' : `${(p.total-p.billable).toFixed(0)}hrs Non-billable`}
          </div>
        </div>
      </td>
      <td>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:64, display:'flex', flexDirection:'column', gap:2 }}>
            <div className="num mono" style={{ fontSize:13, fontWeight:500, lineHeight:1.25 }}>{p.total.toFixed(0).padStart(2,'0')} <span style={{ fontFamily:'var(--font-sans)', fontWeight:400, fontSize:11, color:'var(--fg-muted)' }}>hrs</span></div>
            <div className="meta" style={{ lineHeight:1.2, color: productivity<30?'var(--rust-600)':productivity<70?'var(--ochre-600)':'var(--moss-600)' }}>
              {productivity}% prod.
            </div>
          </div>
          <div style={{ flex:1, minWidth:60, display:'flex', flexDirection:'column', gap:2 }}>
            <div className={`progress ${budgetOver?'over':burnPct>85?'warn':''}`}>
              <span style={{ width: `${p.budget>0 ? Math.min(burnPct,100) : 0}%` }}/>
            </div>
            <div className="meta mono" style={{ fontSize:10, lineHeight:1.2 }}>{p.budget>0? `${Math.round(burnPct)}%`:'—'}</div>
          </div>
        </div>
      </td>
      <td>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
          <div style={{ fontSize:12, whiteSpace:'nowrap' }}>{p.created}</div>
          <button className="btn-ghost" style={{ width:24, height:24, borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--fg-muted)' }} onClick={e=>e.stopPropagation()}>
            <I.More size={14}/>
          </button>
        </div>
      </td>
    </tr>
  );
}

function ProjectsScreen({ onOpenProject }) {
  const [query, setQuery] = uS1('');
  const [statusFilter, setStatusFilter] = uS1('all');
  const [sortKey, setSortKey] = uS1('created');
  const [sortDir, setSortDir] = uS1('desc');
  const [density, setDensity] = uS1('compact');

  const filtered = uM1(()=>{
    let r = PROJECTS.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
    if (statusFilter !== 'all') r = r.filter(p => p.status === statusFilter);
    r = [...r].sort((a,b)=>{
      let av = a[sortKey], bv = b[sortKey];
      if (typeof av === 'string') return sortDir==='asc'? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir==='asc'? av-bv : bv-av;
    });
    return r;
  }, [query, statusFilter, sortKey, sortDir]);

  const summary = {
    total: PROJECTS.length,
    ongoing: PROJECTS.filter(p=>p.status==='ongoing').length,
    atRisk: PROJECTS.filter(p => (p.budget > 0 && (p.total/p.budget) > 0.85) || p.budget < 0).length,
    totalHours: PROJECTS.reduce((s,p)=>s+p.total,0),
    billableHours: PROJECTS.reduce((s,p)=>s+p.billable,0),
  };

  return (
    <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:16 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:4, flex:1, minWidth:0 }}>
          <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Projects</div>
          <h1 style={{ margin:0, fontSize:22, fontFamily:'var(--font-display)', fontWeight:600, letterSpacing:'-0.02em', lineHeight:1.15, whiteSpace:'nowrap' }}>All projects overview</h1>
          <div className="meta">
            {summary.total} projects · <span style={{ color:'var(--moss-600)' }}>{summary.ongoing} ongoing</span> · <span style={{ color:'var(--rust-600)' }}>{summary.atRisk} at risk</span>
          </div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button className="btn btn-sm"><I.Download size={12}/> Export CSV</button>
          <button className="btn btn-primary btn-sm"><I.Plus size={12}/> New project</button>
        </div>
      </div>

      {/* Stat strip */}
      <div style={{
        display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:1,
        background:'var(--border)', border:'1px solid var(--border)', borderRadius:8, overflow:'hidden',
      }}>
        {[
          { label:'Budget total', value:(PROJECTS.reduce((s,p)=>s+Math.max(p.budget,0),0)).toFixed(0), unit:'hrs', foot:'Across 11 active projects' },
          { label:'Logged this month', value:summary.totalHours.toFixed(0), unit:'hrs', foot:'+14% vs last month', footColor:'var(--moss-600)' },
          { label:'Billable', value:((summary.billableHours/summary.totalHours)*100).toFixed(0), unit:'%', foot:`${summary.billableHours.toFixed(0)} hrs billable · ${(summary.totalHours-summary.billableHours).toFixed(0)} internal`  },
          { label:'At risk', value:summary.atRisk, unit:'', foot:'Burn > 85% or over budget', footColor:'var(--rust-600)' },
        ].map((s, i) => (
          <div key={i} style={{ background:'var(--bg-raised)', padding:'14px 16px' }}>
            <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.label}</div>
            <div style={{ fontSize:26, fontWeight:600, fontFamily:'var(--font-display)', letterSpacing:'-0.02em', marginTop:4, display:'flex', alignItems:'baseline', gap:4 }}>
              <span className="num">{s.value}</span>
              {s.unit && <span style={{ fontSize:12, color:'var(--fg-muted)', fontWeight:400 }}>{s.unit}</span>}
            </div>
            <div style={{ fontSize:11, color: s.footColor || 'var(--fg-muted)', marginTop:4 }}>{s.foot}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
        <div style={{ position:'relative', width:280 }}>
          <I.Search size={12} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--fg-muted)' }}/>
          <input className="input" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Filter project name…" style={{ width:'100%', paddingLeft:28 }}/>
        </div>
        <div style={{ display:'flex', gap:2, padding:2, background:'var(--bg-sunken)', borderRadius:6, border:'1px solid var(--border)', flex:'none' }}>
          {['all','ongoing','hold','closed'].map(s => (
            <button key={s} onClick={()=>setStatusFilter(s)} style={{
              padding:'4px 12px', borderRadius:4, fontSize:11, fontWeight:500, whiteSpace:'nowrap',
              background: statusFilter===s ? 'var(--bg-raised)' : 'transparent',
              color: statusFilter===s ? 'var(--fg)' : 'var(--fg-muted)',
              textTransform:'capitalize',
              boxShadow: statusFilter===s ? 'var(--shadow-sm)':'none',
            }}>{s}</button>
          ))}
        </div>
        <div style={{ flex:1 }}/>
        <button className="btn btn-sm"><I.Filter size={12}/> Filter</button>
        <button className="btn btn-sm"><I.Sort size={12}/> Sort</button>
        <div style={{ width:1, height:18, background:'var(--border)', margin:'0 4px' }}/>
        <button className="btn btn-sm" style={{ background: 'var(--bg-raised)', fontWeight:500 }}>
          <I.Eye size={12}/> View
        </button>
      </div>

      {/* Table */}
      <div style={{ background:'var(--bg-raised)', border:'1px solid var(--border)', borderRadius:8, overflow:'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ paddingLeft:16, minWidth:280 }}>
                <button onClick={()=>{setSortKey('name'); setSortDir(d=>d==='asc'?'desc':'asc')}} style={{ display:'flex', alignItems:'center', gap:4, color:'inherit' }}>
                  Name <I.ChevronDown size={10}/>
                </button>
              </th>
              <th style={{ minWidth:160 }}>Client</th>
              <th style={{ minWidth:100 }}>Status</th>
              <th style={{ minWidth:110 }}>Budget (hrs)</th>
              <th style={{ minWidth:110 }}>Billable (hrs)</th>
              <th style={{ minWidth:170 }}>Total · Burn</th>
              <th style={{ minWidth:120 }}>Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => <ProjectRow key={p.id} p={p} onOpen={()=>onOpenProject && onOpenProject(p)}/>)}
          </tbody>
        </table>
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:11, color:'var(--fg-muted)' }}>
        <div>Showing <span className="mono">{filtered.length}</span> of <span className="mono">{PROJECTS.length}</span></div>
        <div style={{ display:'flex', gap:4 }}>
          <button className="btn btn-sm" disabled style={{ opacity:.5 }}>Previous</button>
          <button className="btn btn-sm">Next</button>
        </div>
      </div>
    </div>
  );
}

window.ProjectsScreen = ProjectsScreen;
