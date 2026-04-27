// Single Project Overview — replaces projects list when a project is opened
const { useState: uSPO, useMemo: uMPO } = React;

function POBack({ onBack }) {
  return (
    <button onClick={onBack} className="btn-ghost" style={{
      display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--fg-muted)',
    }}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M7.5 2.5L4 6l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      All projects
    </button>
  );
}

function POAvatar({ member, size=22 }) {
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

function POStat({ label, value, unit, foot, footColor, accent }) {
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

function POMilestone({ m }) {
  const dot = {
    'done':'var(--moss-500)',
    'in-progress':'var(--blue-500)',
    'todo':'var(--ink-400)',
  }[m.status];
  const bg = {
    'done':'var(--moss-100)',
    'in-progress':'var(--blue-100)',
    'todo':'transparent',
  }[m.status];
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderBottom:'1px solid var(--border)' }}>
      <div style={{ width:20, height:20, borderRadius:'50%', background:bg, border:`1.5px solid ${dot}`, display:'flex', alignItems:'center', justifyContent:'center', flex:'none' }}>
        {m.status==='done' && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke={dot} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        {m.status==='in-progress' && <div style={{ width:6, height:6, borderRadius:'50%', background:dot }}/>}
      </div>
      <div style={{ flex:1, minWidth:0, fontSize:13, fontWeight: m.status==='done'?400:500, color: m.status==='done'?'var(--fg-muted)':'var(--fg)', textDecoration: m.status==='done'?'line-through':'none' }}>
        {m.name}
      </div>
      <div className="meta" style={{ fontSize:11 }}>{m.due}</div>
    </div>
  );
}

function POProgressBar({ value, max, over }) {
  const pct = max > 0 ? Math.min((value/max)*100, 100) : 0;
  return (
    <div style={{ height:4, background:'var(--sand-200)', borderRadius:2, overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${pct}%`, background: over ? 'var(--rust-500)' : pct > 85 ? 'var(--ochre-500)' : 'var(--teal-500)' }}/>
    </div>
  );
}

function POTaskRow({ task, onOpen }) {
  const assignee = TEAM.find(t => t.id === task.assignee);
  const meta = TASK_STATUS[task.status];
  const loeOver = task.actualLOE > task.estLOE;
  return (
    <tr onClick={onOpen} style={{ cursor:'pointer' }}>
      <td style={{ paddingLeft:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span className={`chip chip-${meta.chip}`} style={{ flex:'none' }}>
            <span className="chip-dot" style={{ background:meta.dot }}/>{meta.label}
          </span>
          <div style={{ fontSize:13, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:380 }}>{task.title}</div>
        </div>
      </td>
      <td>
        {assignee && (
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <POAvatar member={assignee} size={18}/>
            <span style={{ fontSize:12 }}>{assignee.name.split(' ')[0]}</span>
          </div>
        )}
      </td>
      <td>
        <span className="chip chip-ink" style={{ textTransform:'capitalize' }}>{ROLES[task.role].label}</span>
      </td>
      <td>
        <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
          <span className="num mono" style={{ fontSize:12, fontWeight:500, color: loeOver?'var(--rust-600)':'var(--fg)' }}>{task.actualLOE}</span>
          <span className="meta" style={{ fontSize:10 }}>/ {task.estLOE}h</span>
        </div>
      </td>
      <td>
        <div style={{ fontSize:12, color: task.priority==='high'?'var(--rust-600)':task.priority==='med'?'var(--ochre-600)':'var(--fg-muted)', textTransform:'capitalize' }}>
          ● {task.priority === 'med' ? 'Medium' : task.priority}
        </div>
      </td>
      <td>
        <div style={{ fontSize:12 }}>{task.due}</div>
      </td>
      <td>
        <button className="btn-ghost" style={{ width:22, height:22, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--fg-muted)' }} onClick={e=>e.stopPropagation()}>
          <I.More size={12}/>
        </button>
      </td>
    </tr>
  );
}

function POBurnChart({ project }) {
  // Synthesize a burn-down line relative to budget
  const budget = project.budget > 0 ? project.budget : 100;
  const total = project.total;
  const billable = project.billable;
  const weeks = 10;
  // Ideal vs actual
  const ideal = Array.from({length:weeks}, (_,i) => (budget * (i+1) / weeks));
  // Actual ramps up more steeply at the end
  const actualPct = Math.min(total / budget, 1.1);
  const actual = Array.from({length:weeks}, (_,i) => {
    const t = (i+1)/weeks;
    const curve = Math.pow(t, 1.35);
    return budget * actualPct * curve;
  });

  const w = 520, h = 160, pad = { top:12, right:12, bottom:24, left:36 };
  const maxY = Math.max(budget * 1.1, Math.max(...actual));
  const x = (i) => pad.left + (i / (weeks-1)) * (w - pad.left - pad.right);
  const y = (v) => pad.top + (1 - v/maxY) * (h - pad.top - pad.bottom);

  const idealPath = ideal.map((v,i) => `${i===0?'M':'L'}${x(i)},${y(v)}`).join(' ');
  const actualPath = actual.map((v,i) => `${i===0?'M':'L'}${x(i)},${y(v)}`).join(' ');
  const actualArea = `${actualPath} L${x(weeks-1)},${h-pad.bottom} L${x(0)},${h-pad.bottom} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width:'100%', height:'auto', display:'block' }}>
      <defs>
        <linearGradient id="poBurnFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--teal-500)" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="var(--teal-500)" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* Horizontal grid */}
      {[0, 0.25, 0.5, 0.75, 1].map(t => (
        <g key={t}>
          <line x1={pad.left} x2={w-pad.right} y1={y(maxY*t)} y2={y(maxY*t)} stroke="var(--border)" strokeWidth="1" strokeDasharray={t===0?'':'2,3'}/>
          <text x={pad.left-6} y={y(maxY*t)+3} textAnchor="end" fontSize="9" fill="var(--fg-muted)" fontFamily="var(--font-mono)">{Math.round(maxY*t)}</text>
        </g>
      ))}
      {/* Budget line */}
      <line x1={pad.left} x2={w-pad.right} y1={y(budget)} y2={y(budget)} stroke="var(--rust-500)" strokeWidth="1" strokeDasharray="4,3"/>
      <text x={w-pad.right} y={y(budget)-4} textAnchor="end" fontSize="9" fill="var(--rust-600)" fontFamily="var(--font-mono)">Budget {budget}h</text>
      {/* Ideal */}
      <path d={idealPath} fill="none" stroke="var(--ink-400)" strokeWidth="1.25" strokeDasharray="3,3"/>
      {/* Actual area + line */}
      <path d={actualArea} fill="url(#poBurnFill)"/>
      <path d={actualPath} fill="none" stroke="var(--teal-600)" strokeWidth="1.75"/>
      {actual.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r={i===weeks-1?3:2} fill="var(--teal-600)" stroke="var(--bg-raised)" strokeWidth="1.5"/>
      ))}
      {/* X axis labels */}
      {Array.from({length:5}).map((_,i) => {
        const wk = Math.round((i/4)*(weeks-1));
        return <text key={i} x={x(wk)} y={h-8} textAnchor="middle" fontSize="9" fill="var(--fg-muted)" fontFamily="var(--font-mono)">W{wk+1}</text>;
      })}
    </svg>
  );
}

function PORiskRow({ r }) {
  const color = r.level==='high' ? 'var(--rust-600)' : r.level==='med' ? 'var(--ochre-600)' : 'var(--ink-500)';
  const bg = r.level==='high' ? 'var(--rust-50)' : r.level==='med' ? 'var(--ochre-50)' : 'var(--sand-100)';
  return (
    <div style={{ display:'flex', gap:10, padding:'10px 12px', background:bg, border:`1px solid var(--border)`, borderLeft:`3px solid ${color}`, borderRadius:4 }}>
      <I.Warn size={14} style={{ color, flex:'none', marginTop:1 }}/>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:11, color, textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600, marginBottom:2 }}>{r.level} risk</div>
        <div style={{ fontSize:12, lineHeight:1.5 }}>{r.text}</div>
      </div>
    </div>
  );
}

function ProjectOverviewScreen({ projectId, onBack, onOpenTask }) {
  const [tab, setTab] = uSPO('overview');
  const project = PROJECTS.find(p => p.id === projectId);
  const detail = PROJECT_DETAIL[projectId] || PROJECT_DETAIL_DEFAULT;

  if (!project) return <div style={{ padding:24 }}>Project not found</div>;

  const tasks = uMPO(() => TASKS.filter(t => t.project === projectId), [projectId]);
  const client = CLIENTS.find(c => c.id === project.clientId);
  const creator = TEAM.find(t => t.id === project.createdBy);
  const billing = CLIENT_BILLING[project.clientId];
  const projectInvoices = INVOICES.filter(inv => inv.projects.includes(projectId));
  const outstandingAmt = projectInvoices.filter(i=>i.status!=='paid' && i.status!=='void').reduce((s,i)=>s+(i.total-i.paid), 0);

  const over = project.budget < 0 || (project.budget > 0 && project.total > project.budget);
  const burnPct = project.budget > 0 ? (project.total / project.budget) * 100 : 0;
  const productivity = project.total > 0 ? Math.round((project.billable / project.total) * 100) : 0;
  const statusCounts = tasks.reduce((acc, t) => { acc[t.status] = (acc[t.status]||0)+1; return acc; }, {});
  const tasksDone = statusCounts['done'] || 0;
  const tasksTotal = tasks.length;

  const statusMeta = STATUS_META[project.status];

  return (
    <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
      {/* Breadcrumb row */}
      <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'var(--fg-muted)', flexWrap:'wrap' }}>
        <POBack onBack={onBack}/>
        <span style={{ color:'var(--fg-subtle)' }}>·</span>
        <span style={{ whiteSpace:'nowrap' }}>{project.client}</span>
        <span style={{ color:'var(--fg-subtle)' }}>·</span>
        <span style={{ color:'var(--fg)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{project.name}</span>
      </div>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
        <div style={{ display:'flex', gap:14, alignItems:'flex-start', flex:'1 1 420px', minWidth:0 }}>
          <div style={{
            width:52, height:52, borderRadius:8,
            background:'var(--bg-raised)', border:'1px solid var(--border)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'var(--font-mono)', fontSize:13, fontWeight:600, color:'var(--teal-700)',
            flex:'none',
          }}>{project.code}</div>
          <div style={{ minWidth:0, flex:1 }}>
            <h1 style={{ margin:0, fontSize:24, fontFamily:'var(--font-display)', fontWeight:600, letterSpacing:'-0.02em', lineHeight:1.15 }}>
              {project.name}
            </h1>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:8, flexWrap:'wrap' }}>
              <span className={`chip chip-${statusMeta.chip}`}><span className="chip-dot"/>{statusMeta.label}</span>
              {project.priority === 'high' && <span className="chip chip-rust"><span className="chip-dot"/>High priority</span>}
              <span className="meta" style={{ fontSize:11, whiteSpace:'nowrap' }}>Recurring {project.recurring.toLowerCase()}ly</span>
              <span style={{ width:3, height:3, background:'var(--fg-muted)', borderRadius:'50%' }}/>
              <span className="mono meta" style={{ fontSize:11, whiteSpace:'nowrap' }}>{project.slug}</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:6, flexWrap:'wrap' }}>
              <span className="meta" style={{ fontSize:11, whiteSpace:'nowrap' }}>Started {project.created}</span>
              {creator && <>
                <span style={{ width:3, height:3, background:'var(--fg-muted)', borderRadius:'50%' }}/>
                <span className="meta" style={{ fontSize:11, whiteSpace:'nowrap' }}>by {creator.name}</span>
              </>}
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center', flex:'none' }}>
          <button className="btn btn-sm"><I.Send size={12}/> Share</button>
          <button className="btn btn-sm"><I.Download size={12}/> Export</button>
          <button className="btn btn-sm"><I.Edit size={12}/> Edit</button>
          <button className="btn btn-accent btn-sm"><I.Plus size={12}/> Log time</button>
          <button className="btn btn-ghost btn-sm"><I.More size={12}/></button>
        </div>
      </div>

      {/* Summary callout + stakeholders */}
      <div style={{ background:'var(--bg-raised)', border:'1px solid var(--border)', borderRadius:8, padding:16, display:'grid', gridTemplateColumns:'1fr 240px', gap:16 }}>
        <div>
          <div style={{ fontSize:10, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:500, marginBottom:6 }}>Summary</div>
          <div style={{ fontSize:13, lineHeight:1.55, color:'var(--fg)' }}>{detail.summary}</div>
          <div style={{ display:'flex', gap:20, marginTop:12, fontSize:11, color:'var(--fg-muted)' }}>
            <div><span style={{ fontFamily:'var(--font-mono)' }}>{detail.phase}</span></div>
            <div>Start · <span style={{ color:'var(--fg)' }}>{detail.startDate}</span></div>
            <div>Target · <span style={{ color:'var(--fg)' }}>{detail.targetDate}</span></div>
          </div>
        </div>
        <div style={{ borderLeft:'1px solid var(--border)', paddingLeft:16 }}>
          <div style={{ fontSize:10, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:500, marginBottom:8 }}>Team</div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {detail.stakeholders.slice(0,4).map((s, i) => {
              const m = TEAM.find(t=>t.id===s.who);
              return (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <POAvatar member={m} size={20}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{m?m.name:'—'}</div>
                    <div style={{ fontSize:10, color:'var(--fg-muted)' }}>{s.role}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stat strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:1, background:'var(--border)', border:'1px solid var(--border)', borderRadius:8, overflow:'hidden' }}>
        <POStat label="Budget" value={project.budget > 0 ? project.budget : '—'} unit="hrs" foot={project.budget<0 ? 'Over-ran last cycle' : `${Math.round(burnPct)}% burned`} footColor={over?'var(--rust-600)':undefined}/>
        <POStat label="Logged" value={project.total.toFixed(0)} unit="hrs" foot={`Billable ${project.billable.toFixed(0)} · Internal ${(project.total-project.billable).toFixed(0)}`}/>
        <POStat label="Billable %" value={productivity} unit="%" foot="Target 75%" footColor={productivity<70?'var(--rust-600)':'var(--moss-600)'}/>
        <POStat label="Tasks" value={`${tasksDone}/${tasksTotal}`} unit="" foot={`${tasksTotal-tasksDone} open`}/>
        <POStat label="Outstanding" value={outstandingAmt > 0 ? CURRENCIES[billing.currency].fmt(outstandingAmt).replace(/\.\d+/,'') : '—'} unit="" foot={`${projectInvoices.length} invoices issued`} footColor={outstandingAmt>0?'var(--rust-600)':'var(--moss-600)'}/>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:2, borderBottom:'1px solid var(--border)' }}>
        {[
          { k:'overview', label:'Overview', count:null },
          { k:'tasks',    label:'Tasks',    count:tasksTotal },
          { k:'worklogs', label:'Worklogs', count:null },
          { k:'invoices', label:'Invoices', count:projectInvoices.length },
          { k:'files',    label:'Files',    count:null },
          { k:'activity', label:'Activity', count:null },
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
            {/* Burn chart */}
            <section style={{ background:'var(--bg-raised)', border:'1px solid var(--border)', borderRadius:8, padding:16 }}>
              <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:12 }}>
                <div>
                  <div style={{ fontSize:10, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:500 }}>Hours burn</div>
                  <div style={{ display:'flex', alignItems:'baseline', gap:6, marginTop:2 }}>
                    <span className="num" style={{ fontSize:22, fontWeight:600, fontFamily:'var(--font-display)', letterSpacing:'-0.02em' }}>{project.total.toFixed(0)}</span>
                    <span style={{ fontSize:12, color:'var(--fg-muted)' }}>of {project.budget>0?project.budget:'—'} hrs</span>
                  </div>
                </div>
                <div style={{ display:'flex', gap:12, fontSize:11 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}><span style={{ width:12, height:2, background:'var(--teal-600)' }}/><span className="meta">Actual</span></div>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}><span style={{ width:12, height:2, background:'var(--ink-400)', borderTop:'1px dashed' }}/><span className="meta">Ideal</span></div>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}><span style={{ width:12, height:2, background:'var(--rust-500)', borderTop:'1px dashed' }}/><span className="meta">Budget</span></div>
                </div>
              </div>
              <POBurnChart project={project}/>
            </section>

            {/* Milestones */}
            {detail.milestones.length > 0 && (
              <section style={{ background:'var(--bg-raised)', border:'1px solid var(--border)', borderRadius:8, overflow:'hidden' }}>
                <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:500 }}>Milestones</div>
                  <button className="btn-ghost" style={{ fontSize:11, color:'var(--fg-muted)' }}><I.Plus size={11}/> Add</button>
                </div>
                <div>
                  {detail.milestones.map((m, i) => <POMilestone key={i} m={m}/>)}
                </div>
              </section>
            )}

            {/* Task status breakdown */}
            <section style={{ background:'var(--bg-raised)', border:'1px solid var(--border)', borderRadius:8, padding:16 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:500 }}>Task status</div>
                <button className="btn-ghost" style={{ fontSize:11, color:'var(--teal-700)' }} onClick={()=>setTab('tasks')}>View all →</button>
              </div>
              <div style={{ display:'flex', height:8, borderRadius:4, overflow:'hidden', marginBottom:12 }}>
                {Object.keys(TASK_STATUS).map(s => {
                  const n = statusCounts[s] || 0;
                  if (n === 0) return null;
                  return <div key={s} style={{ flex:n, background: TASK_STATUS[s].dot }} title={`${TASK_STATUS[s].label}: ${n}`}/>;
                })}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:12 }}>
                {Object.keys(TASK_STATUS).map(s => {
                  const n = statusCounts[s] || 0;
                  return (
                    <div key={s}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                        <span style={{ width:6, height:6, borderRadius:'50%', background: TASK_STATUS[s].dot }}/>
                        <span style={{ fontSize:10, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.04em' }}>{TASK_STATUS[s].label}</span>
                      </div>
                      <div className="num" style={{ fontSize:18, fontWeight:600, fontFamily:'var(--font-display)' }}>{n}</div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right column */}
          <div style={{ display:'flex', flexDirection:'column', gap:16, minWidth:0 }}>
            {/* Budget ring */}
            <section style={{ background:'var(--bg-raised)', border:'1px solid var(--border)', borderRadius:8, padding:16 }}>
              <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:500, marginBottom:12 }}>Budget health</div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'12px 0' }}>
                <svg viewBox="0 0 120 120" width="140" height="140">
                  <circle cx="60" cy="60" r="48" fill="none" stroke="var(--sand-200)" strokeWidth="10"/>
                  <circle cx="60" cy="60" r="48" fill="none"
                    stroke={over?'var(--rust-500)':burnPct>85?'var(--ochre-500)':'var(--teal-500)'}
                    strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${Math.min(burnPct,100)/100 * 2*Math.PI*48} ${2*Math.PI*48}`}
                    transform="rotate(-90 60 60)"/>
                  <text x="60" y="58" textAnchor="middle" fontSize="22" fontWeight="600" fontFamily="var(--font-display)" fill="var(--fg)">{Math.round(burnPct)}%</text>
                  <text x="60" y="74" textAnchor="middle" fontSize="9" fill="var(--fg-muted)" letterSpacing="0.08em">BURN RATE</text>
                </svg>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, paddingTop:8, borderTop:'1px solid var(--border)' }}>
                <div><div className="meta">Used</div><div className="num mono" style={{ fontWeight:500 }}>{project.total.toFixed(0)}h</div></div>
                <div><div className="meta" style={{ textAlign:'right' }}>Remaining</div><div className="num mono" style={{ fontWeight:500, textAlign:'right', color: over?'var(--rust-600)':'var(--fg)' }}>{over?`-${(project.total-project.budget).toFixed(0)}`:(project.budget-project.total).toFixed(0)}h</div></div>
              </div>
            </section>

            {/* Risks */}
            {detail.risks.length > 0 && (
              <section style={{ background:'var(--bg-raised)', border:'1px solid var(--border)', borderRadius:8, padding:16 }}>
                <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:500, marginBottom:10 }}>Risks & blockers</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {detail.risks.map((r, i) => <PORiskRow key={i} r={r}/>)}
                </div>
              </section>
            )}

            {/* Client card */}
            <section style={{ background:'var(--bg-raised)', border:'1px solid var(--border)', borderRadius:8, padding:16 }}>
              <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:500, marginBottom:10 }}>Client</div>
              <div style={{ fontSize:14, fontWeight:600, marginBottom:2 }}>{project.client}</div>
              <div className="meta" style={{ fontSize:11, marginBottom:10 }}>{client?`${client.projects} projects · ${client.hours}h logged`:''}</div>
              {billing && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, paddingTop:10, borderTop:'1px solid var(--border)' }}>
                  <div><div className="meta" style={{ fontSize:10 }}>Currency</div><div className="mono" style={{ fontSize:12 }}>{billing.currency}</div></div>
                  <div><div className="meta" style={{ fontSize:10 }}>Rate</div><div className="mono" style={{ fontSize:12 }}>{CURRENCIES[billing.currency].symbol}{billing.defaultRate}/hr</div></div>
                  <div><div className="meta" style={{ fontSize:10 }}>Terms</div><div style={{ fontSize:12 }}>{billing.terms}</div></div>
                  <div><div className="meta" style={{ fontSize:10 }}>Contact</div><div style={{ fontSize:12, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{billing.contactName.split(' ')[0]}</div></div>
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      {/* === Tasks tab === */}
      {tab === 'tasks' && (
        <div style={{ background:'var(--bg-raised)', border:'1px solid var(--border)', borderRadius:8, overflow:'hidden' }}>
          <div style={{ padding:'10px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ position:'relative', width:260 }}>
              <I.Search size={12} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--fg-muted)' }}/>
              <input className="input" placeholder="Filter tasks…" style={{ width:'100%', paddingLeft:28 }}/>
            </div>
            <div style={{ flex:1 }}/>
            <button className="btn btn-sm"><I.Filter size={12}/> Status</button>
            <button className="btn btn-sm"><I.Filter size={12}/> Assignee</button>
            <button className="btn btn-accent btn-sm"><I.Plus size={12}/> New task</button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th style={{ paddingLeft:16 }}>Task</th>
                <th>Assignee</th>
                <th>Role</th>
                <th>Effort</th>
                <th>Priority</th>
                <th>Due</th>
                <th style={{ width:40 }}></th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(t => <POTaskRow key={t.id} task={t} onOpen={()=>onOpenTask && onOpenTask(t.id)}/>)}
            </tbody>
          </table>
        </div>
      )}

      {/* === Worklogs tab === */}
      {tab === 'worklogs' && (
        <div style={{ background:'var(--bg-raised)', border:'1px solid var(--border)', borderRadius:8, padding:16 }}>
          {(() => {
            const taskIds = tasks.map(t => t.id);
            const logs = WORKLOGS.filter(w => taskIds.includes(w.task));
            if (logs.length === 0) return <div className="meta">No worklogs yet on this project.</div>;
            const byDate = {};
            logs.forEach(l => { (byDate[l.date] = byDate[l.date] || []).push(l); });
            return Object.keys(byDate).sort().reverse().map(date => {
              const dayLogs = byDate[date];
              const dayTotal = dayLogs.reduce((s,l)=>s+l.hours, 0);
              return (
                <div key={date} style={{ marginBottom:16 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', padding:'6px 0', borderBottom:'1px solid var(--border)', marginBottom:6 }}>
                    <div style={{ fontSize:12, fontWeight:600 }}>{date}</div>
                    <div className="num mono" style={{ fontSize:11, color:'var(--fg-muted)' }}>{dayTotal.toFixed(1)}h</div>
                  </div>
                  {dayLogs.map(l => {
                    const t = TASKS.find(x=>x.id===l.task);
                    const m = TEAM.find(x=>x.id===l.assignee);
                    return (
                      <div key={l.id} style={{ display:'flex', gap:10, alignItems:'center', padding:'6px 0' }}>
                        <POAvatar member={m} size={18}/>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:12, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{t?t.title:'—'}</div>
                          <div className="meta" style={{ fontSize:10 }}>{l.note}</div>
                        </div>
                        {l.billable && <span className="chip chip-teal" style={{ fontSize:9 }}><span className="chip-dot"/>Billable</span>}
                        <div className="num mono" style={{ fontSize:12, fontWeight:500, width:50, textAlign:'right' }}>{l.hours.toFixed(1)}h</div>
                      </div>
                    );
                  })}
                </div>
              );
            });
          })()}
        </div>
      )}

      {/* === Invoices tab === */}
      {tab === 'invoices' && (
        <div style={{ background:'var(--bg-raised)', border:'1px solid var(--border)', borderRadius:8, overflow:'hidden' }}>
          {projectInvoices.length === 0 ? (
            <div style={{ padding:20, textAlign:'center' }} className="meta">No invoices issued for this project yet.</div>
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
                {projectInvoices.map(inv => {
                  const s = INVOICE_STATUS[inv.status];
                  const out = inv.total - inv.paid;
                  return (
                    <tr key={inv.id}>
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
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* === Files tab === */}
      {tab === 'files' && (
        <div style={{ background:'var(--bg-raised)', border:'1px solid var(--border)', borderRadius:8, padding:20, textAlign:'center' }}>
          <I.FileText size={24} style={{ color:'var(--fg-muted)', marginBottom:8 }}/>
          <div style={{ fontSize:13, fontWeight:500, marginBottom:4 }}>No files shared yet</div>
          <div className="meta" style={{ fontSize:11, marginBottom:12 }}>Upload specs, wireframes, or client assets for this project.</div>
          <button className="btn btn-sm"><I.Plus size={12}/> Upload file</button>
        </div>
      )}

      {/* === Activity tab === */}
      {tab === 'activity' && (
        <div style={{ background:'var(--bg-raised)', border:'1px solid var(--border)', borderRadius:8, padding:16 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {ACTIVITY.filter(a => a.project === projectId).map((a, i) => {
              const m = TEAM.find(t=>t.id===a.who);
              return (
                <div key={i} style={{ display:'flex', gap:10, alignItems:'center' }}>
                  <POAvatar member={m} size={22}/>
                  <div style={{ flex:1, fontSize:12 }}>
                    <span style={{ fontWeight:600 }}>{m?m.name:'—'}</span>{' '}
                    <span className="meta">{a.action}</span>{' '}
                    <span style={{ color:'var(--teal-700)' }}>{a.target}</span>
                  </div>
                  <span className="meta" style={{ fontSize:11 }}>{a.time}</span>
                </div>
              );
            })}
            {ACTIVITY.filter(a => a.project === projectId).length === 0 && <div className="meta">No recent activity.</div>}
          </div>
        </div>
      )}
    </div>
  );
}

window.ProjectOverviewScreen = ProjectOverviewScreen;
