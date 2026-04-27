// Task Detail Drawer — slides in from the right, overlays any screen
const { useState: uSTD, useEffect: uETD } = React;

const TASK_TODAY = new Date('2026-04-24');
const parseShortDate = (s) => {
  // Handle "Apr 22" format
  if (/^[A-Z][a-z]{2} \d{1,2}$/.test(s)) return new Date(`${s} 2026`);
  return new Date(s);
};
const dueDaysBetween = (s) => {
  const d = parseShortDate(s);
  return Math.round((d - TASK_TODAY) / 86400000);
};

function TDAvatar({ member, size=20 }) {
  if (!member) return null;
  const initials = member.name.split(' ').map(n=>n[0]).slice(0,2).join('');
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%',
      background: member.color, color:'#fff',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize: size <= 20 ? 9 : 10, fontWeight:600, fontFamily:'var(--font-mono)',
      flex:'none',
    }}>{initials}</div>
  );
}

function TDAvatarStack({ ids, max=4 }) {
  const visible = ids.slice(0, max);
  const extra = ids.length - max;
  return (
    <div style={{ display:'flex' }}>
      {visible.map((id, i) => {
        const m = TEAM.find(t => t.id === id);
        return (
          <div key={id} style={{ marginLeft: i===0?0:-6, border:'2px solid var(--bg-raised)', borderRadius:'50%' }}>
            <TDAvatar member={m} size={22}/>
          </div>
        );
      })}
      {extra > 0 && (
        <div style={{
          marginLeft:-6, width:22, height:22, borderRadius:'50%',
          background:'var(--sand-200)', color:'var(--ink-700)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:9, fontWeight:600, fontFamily:'var(--font-mono)',
          border:'2px solid var(--bg-raised)',
        }}>+{extra}</div>
      )}
    </div>
  );
}

function TDStatusChip({ status }) {
  const m = TASK_STATUS[status];
  return (
    <span className={`chip chip-${m.chip}`}>
      <span className="chip-dot" style={{ background:m.dot }}/>{m.label}
    </span>
  );
}

function TDField({ label, children, align='center' }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'82px minmax(0, 1fr)', alignItems:align, gap:10, fontSize:12, minHeight:24 }}>
      <div className="meta" style={{ fontSize:11, whiteSpace:'nowrap' }}>{label}</div>
      <div style={{ minWidth:0, overflow:'hidden' }}>{children}</div>
    </div>
  );
}

function TDSubtask({ s, onToggle }) {
  const person = TEAM.find(t=>t.id===s.assignee);
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 0' }}>
      <button onClick={onToggle} style={{
        width:14, height:14, borderRadius:3, flex:'none',
        border: s.done ? 'none' : '1.5px solid var(--border-strong)',
        background: s.done ? 'var(--teal-600)' : 'transparent',
        display:'flex', alignItems:'center', justifyContent:'center',
        color:'#fff',
      }}>
        {s.done && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </button>
      <div style={{ flex:1, minWidth:0, fontSize:12, textDecoration: s.done?'line-through':'none', color: s.done?'var(--fg-muted)':'var(--fg)' }}>
        {s.title}
      </div>
      {person && <TDAvatar member={person} size={18}/>}
    </div>
  );
}

function TDTabButton({ children, active, onClick, count }) {
  return (
    <button onClick={onClick}
      style={{
        padding:'10px 14px', fontSize:12, fontWeight:500,
        color: active ? 'var(--fg)' : 'var(--fg-muted)',
        borderBottom: active ? '2px solid var(--teal-600)' : '2px solid transparent',
        marginBottom:-1,
        display:'flex', alignItems:'center', gap:6,
      }}>
      {children}
      {count !== undefined && (
        <span style={{ fontSize:10, fontFamily:'var(--font-mono)', color:'var(--fg-muted)', background:'var(--sand-200)', padding:'1px 5px', borderRadius:3 }}>
          {count}
        </span>
      )}
    </button>
  );
}

function TaskDrawer({ taskId, onClose }) {
  const task = TASKS.find(t => t.id === taskId);
  const [tab, setTab] = uSTD('activity');
  const [comment, setComment] = uSTD('');
  const [subs, setSubs] = uSTD([]);

  uETD(() => {
    if (!task) return;
    const d = TASK_DETAIL[task.id] || TASK_DETAIL_DEFAULT;
    setSubs(d.subtasks.map(s => ({ ...s })));
  }, [taskId]);

  uETD(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!task) return null;

  const detail = TASK_DETAIL[task.id] || TASK_DETAIL_DEFAULT;
  const project = PROJECTS.find(p => p.id === task.project);
  const assignee = TEAM.find(t => t.id === task.assignee);
  const reporter = TEAM.find(t => t.id === detail.reporter);
  const loeOver = task.actualLOE > task.estLOE;
  const loePct = task.estLOE > 0 ? Math.min((task.actualLOE / task.estLOE)*100, 999) : 0;
  const dueDays = dueDaysBetween(task.due);
  const dueColor = dueDays < 0 ? 'var(--rust-600)' : dueDays <= 3 ? 'var(--ochre-600)' : 'var(--fg-muted)';
  const dueLabel = dueDays < 0 ? `${-dueDays}d overdue` : dueDays === 0 ? 'Due today' : `in ${dueDays}d`;

  const subsDone = subs.filter(s=>s.done).length;
  const relatedWorklogs = WORKLOGS.filter(w => w.task === task.id);
  const totalLogged = relatedWorklogs.reduce((s,w)=>s+w.hours, 0);

  return (
    <>
      {/* backdrop */}
      <div onClick={onClose} style={{
        position:'fixed', inset:0, background:'rgba(20,18,14,0.32)',
        zIndex:90, animation:'fadeIn 160ms ease',
      }}/>
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideIn { from { transform: translateX(32px); opacity:0 } to { transform: translateX(0); opacity:1 } }
      `}</style>

      {/* drawer */}
      <aside style={{
        position:'fixed', top:0, right:0, bottom:0,
        width:'min(720px, 94vw)', background:'var(--bg-raised)',
        borderLeft:'1px solid var(--border)', boxShadow:'-12px 0 40px rgba(20,18,14,0.12)',
        zIndex:91, display:'flex', flexDirection:'column',
        animation:'slideIn 180ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}>
        {/* Header */}
        <header style={{
          padding:'14px 20px', borderBottom:'1px solid var(--border)',
          display:'flex', alignItems:'center', gap:10, flex:'none',
        }}>
          <span className="code-badge">{(project||{}).code}</span>
          <div style={{ fontSize:11, color:'var(--fg-muted)', fontFamily:'var(--font-mono)' }}>·</div>
          <div style={{ fontSize:11, color:'var(--fg-muted)' }}>{(project||{}).name}</div>
          <div style={{ flex:1 }}/>
          <button className="btn-ghost" title="Copy link" style={{ padding:4, color:'var(--fg-muted)' }}><I.Link size={14}/></button>
          <button className="btn-ghost" title="Open full view" style={{ padding:4, color:'var(--fg-muted)' }}><I.ArrowRight size={14} style={{ transform:'rotate(-45deg)' }}/></button>
          <button className="btn-ghost" title="More" style={{ padding:4, color:'var(--fg-muted)' }}><I.More size={14}/></button>
          <div style={{ width:1, height:16, background:'var(--border)' }}/>
          <button className="btn-ghost" onClick={onClose} title="Close (Esc)" style={{ padding:4, color:'var(--fg-muted)' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </header>

        {/* Title block */}
        <div style={{ padding:'18px 20px 14px', borderBottom:'1px solid var(--border)', flex:'none' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, flexWrap:'wrap' }}>
            <span className="mono" style={{ fontSize:11, color:'var(--fg-muted)', whiteSpace:'nowrap' }}>{(project||{}).code}-{task.id.slice(1).padStart(3,'0')}</span>
            <span style={{ width:3, height:3, background:'var(--fg-muted)', borderRadius:'50%' }}/>
            {task.priority === 'high' && <span className="chip chip-rust" style={{ fontSize:10, whiteSpace:'nowrap' }}><span className="chip-dot"/>High priority</span>}
            {loeOver && <span className="chip chip-ochre" style={{ fontSize:10, whiteSpace:'nowrap' }}><I.Warn size={9}/>Over LOE</span>}
            {task.billable ? <span className="chip chip-teal" style={{ fontSize:10, whiteSpace:'nowrap' }}><span className="chip-dot"/>Billable</span> : <span className="chip chip-ink" style={{ fontSize:10, whiteSpace:'nowrap' }}><span className="chip-dot"/>Non-billable</span>}
          </div>
          <h1 style={{ margin:'4px 0 10px', fontSize:20, fontFamily:'var(--font-display)', fontWeight:600, letterSpacing:'-0.01em', lineHeight:1.25, textWrap:'balance' }}>
            {task.title}
          </h1>
          <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
            <TDStatusChip status={task.status}/>
            <button className="btn btn-sm" style={{ height:26 }}>
              <I.ArrowRight size={11}/> Move status
            </button>
            <button className="btn btn-accent btn-sm" style={{ height:26 }}>
              <I.Clock size={11}/> Log time
            </button>
            <button className="btn btn-sm" style={{ height:26 }}>
              Request LOE bump
            </button>
          </div>
        </div>

        {/* Fields + body scroll */}
        <div style={{ flex:1, overflowY:'auto', display:'grid', gridTemplateColumns:'1fr 260px' }}>
          {/* Main column */}
          <div style={{ padding:'16px 20px', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', gap:18, minWidth:0 }}>
            {/* Description */}
            <section>
              <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8, fontWeight:500 }}>Description</div>
              <div style={{ fontSize:13, lineHeight:1.55, color:'var(--fg)' }}>{detail.description}</div>
            </section>

            {/* Subtasks */}
            {subs.length > 0 && (
              <section>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                  <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:500 }}>
                    Subtasks <span style={{ fontFamily:'var(--font-mono)', marginLeft:4 }}>{subsDone}/{subs.length}</span>
                  </div>
                  <button className="btn-ghost" style={{ fontSize:11, color:'var(--fg-muted)' }}><I.Plus size={11}/> Add</button>
                </div>
                <div style={{ height:4, background:'var(--sand-200)', borderRadius:2, overflow:'hidden', marginBottom:10 }}>
                  <div style={{ height:'100%', width:`${subs.length?(subsDone/subs.length*100):0}%`, background:'var(--teal-500)', transition:'200ms' }}/>
                </div>
                {subs.map((s, i) => (
                  <TDSubtask key={s.id} s={s} onToggle={() => setSubs(subs.map((x,j)=>j===i?{...x,done:!x.done}:x))}/>
                ))}
              </section>
            )}

            {/* Attachments */}
            {detail.attachments.length > 0 && (
              <section>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                  <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:500 }}>Attachments</div>
                  <button className="btn-ghost" style={{ fontSize:11, color:'var(--fg-muted)' }}><I.Plus size={11}/> Upload</button>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {detail.attachments.map((a, i) => {
                    const m = TEAM.find(t=>t.id===a.by);
                    return (
                      <div key={i} style={{
                        display:'flex', alignItems:'center', gap:10,
                        padding:'8px 10px', background:'var(--bg-sunken)',
                        border:'1px solid var(--border)', borderRadius:6,
                      }}>
                        <div style={{ width:24, height:24, borderRadius:4, background:'var(--sand-200)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <I.FileText size={12}/>
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:12, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{a.name}</div>
                          <div className="meta" style={{ fontSize:10 }}>{a.size} · {m?m.name.split(' ')[0]:''} · {a.at}</div>
                        </div>
                        <button className="btn-ghost" style={{ padding:4, color:'var(--fg-muted)' }}><I.Download size={12}/></button>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Tabs — Activity / Comments / History */}
            <section>
              <div style={{ display:'flex', gap:2, borderBottom:'1px solid var(--border)', marginBottom:12 }}>
                <TDTabButton active={tab==='activity'} onClick={()=>setTab('activity')}>Activity</TDTabButton>
                <TDTabButton active={tab==='comments'} onClick={()=>setTab('comments')} count={detail.comments.length}>Comments</TDTabButton>
                <TDTabButton active={tab==='worklogs'} onClick={()=>setTab('worklogs')} count={relatedWorklogs.length}>Worklogs</TDTabButton>
                <TDTabButton active={tab==='history'} onClick={()=>setTab('history')}>History</TDTabButton>
              </div>

              {tab === 'activity' && (
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {[...detail.comments, ...detail.history.map(h=>({ history:true, ...h }))].slice(0, 8).map((item, i) => {
                    if (item.history) {
                      const m = TEAM.find(t=>t.id===item.who);
                      return (
                        <div key={'h'+i} style={{ display:'flex', gap:10, alignItems:'center', fontSize:12 }}>
                          <TDAvatar member={m} size={18}/>
                          <div className="meta" style={{ flex:1, minWidth:0 }}>
                            <span style={{ color:'var(--fg)' }}>{m?m.name.split(' ')[0]:'Someone'}</span> {item.action}
                          </div>
                          <div className="meta" style={{ fontSize:11, flex:'none', whiteSpace:'nowrap' }}>{item.at}</div>
                        </div>
                      );
                    }
                    const m = TEAM.find(t=>t.id===item.by);
                    return (
                      <div key={'c'+i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                        <TDAvatar member={m} size={22}/>
                        <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:4 }}>
                          <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
                            <span style={{ fontSize:12, fontWeight:600 }}>{m?m.name:'—'}</span>
                            <span className="meta" style={{ fontSize:11 }}>{item.at}</span>
                          </div>
                          <div style={{ fontSize:12, lineHeight:1.55 }}>{item.body}</div>
                          {item.attached && (
                            <div style={{ marginTop:2, display:'inline-flex', alignItems:'center', gap:6, padding:'4px 8px', background:'var(--bg-sunken)', border:'1px solid var(--border)', borderRadius:4, fontSize:11, alignSelf:'flex-start' }}>
                              <I.FileText size={10}/> {item.attached}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {tab === 'comments' && (
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {detail.comments.map((c, i) => {
                    const m = TEAM.find(t=>t.id===c.by);
                    return (
                      <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                        <TDAvatar member={m} size={24}/>
                        <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:4 }}>
                          <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
                            <span style={{ fontSize:12, fontWeight:600 }}>{m?m.name:'—'}</span>
                            <span className="meta" style={{ fontSize:11 }}>{c.at}</span>
                          </div>
                          <div style={{ fontSize:12, lineHeight:1.55 }}>{c.body}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {tab === 'worklogs' && (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {relatedWorklogs.length === 0 && <div className="meta">No time logged on this task yet.</div>}
                  {relatedWorklogs.map(w => {
                    const m = TEAM.find(t=>t.id===w.assignee);
                    return (
                      <div key={w.id} style={{ display:'flex', gap:10, alignItems:'center', padding:'8px 10px', background:'var(--bg-sunken)', border:'1px solid var(--border)', borderRadius:6 }}>
                        <TDAvatar member={m} size={20}/>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:12, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{w.note}</div>
                          <div className="meta" style={{ fontSize:10 }}>{m?m.name.split(' ')[0]:''} · {w.date}</div>
                        </div>
                        <div className="num mono" style={{ fontSize:12, fontWeight:600, flex:'none' }}>{w.hours.toFixed(1)}h</div>
                        {w.billable && <span className="chip chip-teal" style={{ fontSize:9 }}><span className="chip-dot"/>Billable</span>}
                      </div>
                    );
                  })}
                  {relatedWorklogs.length > 0 && (
                    <div style={{ display:'flex', justifyContent:'space-between', paddingTop:8, borderTop:'1px solid var(--border)', fontSize:12, fontWeight:600 }}>
                      <span>Total logged</span>
                      <span className="num mono">{totalLogged.toFixed(1)}h</span>
                    </div>
                  )}
                </div>
              )}

              {tab === 'history' && (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {detail.history.map((h, i) => {
                    const m = TEAM.find(t=>t.id===h.who);
                    return (
                      <div key={i} style={{ display:'flex', gap:10, alignItems:'center', fontSize:12 }}>
                        <TDAvatar member={m} size={18}/>
                        <div style={{ flex:1 }}>
                          <span style={{ fontWeight:500 }}>{m?m.name.split(' ')[0]:'—'}</span>{' '}
                          <span className="meta">{h.action}</span>
                        </div>
                        <div className="meta" style={{ fontSize:11 }}>{h.at}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Comment composer */}
            <div style={{ position:'sticky', bottom:0, background:'var(--bg-raised)', paddingTop:12, marginTop:'auto', borderTop:'1px solid var(--border)', marginLeft:-20, marginRight:-20, marginBottom:-16, padding:'12px 20px' }}>
              <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                <TDAvatar member={TEAM.find(t=>t.id==='fh')} size={22}/>
                <div style={{ flex:1 }}>
                  <textarea
                    value={comment} onChange={e=>setComment(e.target.value)}
                    placeholder="Add a comment… use @ to mention"
                    style={{
                      width:'100%', minHeight:60, padding:10, resize:'vertical',
                      border:'1px solid var(--border-strong)', borderRadius:6,
                      background:'var(--bg-sunken)', fontSize:12, fontFamily:'inherit',
                      color:'var(--fg)',
                    }}
                  />
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:6 }}>
                    <button className="btn-ghost" style={{ padding:4, color:'var(--fg-muted)' }} title="Attach"><I.FileText size={13}/></button>
                    <button className="btn-ghost" style={{ padding:4, color:'var(--fg-muted)' }} title="Mention">@</button>
                    <div style={{ flex:1 }}/>
                    <button className="btn btn-sm">Cancel</button>
                    <button className="btn btn-accent btn-sm" disabled={!comment.trim()} style={{ opacity: comment.trim()?1:0.5 }}>Comment</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side column — fields */}
          <aside style={{ padding:'16px 18px', display:'flex', flexDirection:'column', gap:14, background:'var(--bg-sunken)' }}>
            <section style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <TDField label="Status"><TDStatusChip status={task.status}/></TDField>
              <TDField label="Assignee">
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <TDAvatar member={assignee} size={18}/>
                  <span style={{ fontSize:12 }}>{assignee?assignee.name:'—'}</span>
                </div>
              </TDField>
              <TDField label="Reporter">
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <TDAvatar member={reporter} size={18}/>
                  <span style={{ fontSize:12 }}>{reporter?reporter.name:'—'}</span>
                </div>
              </TDField>
              <TDField label="Priority">
                <span style={{ fontSize:12, textTransform:'capitalize', color: task.priority==='high'?'var(--rust-600)':task.priority==='med'?'var(--ochre-600)':'var(--fg)' }}>
                  ● {task.priority === 'med' ? 'Medium' : task.priority.charAt(0).toUpperCase()+task.priority.slice(1)}
                </span>
              </TDField>
              <TDField label="Due" align="flex-start">
                <div style={{ display:'flex', flexDirection:'column' }}>
                  <span style={{ fontSize:12, whiteSpace:'nowrap' }}>{task.due}</span>
                  <span style={{ fontSize:10, color:dueColor, whiteSpace:'nowrap' }}>{dueLabel}</span>
                </div>
              </TDField>
              <TDField label="Watchers">
                <TDAvatarStack ids={detail.watchers}/>
              </TDField>
            </section>

            <div style={{ height:1, background:'var(--border)' }}/>

            <section>
              <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8, fontWeight:500 }}>Effort</div>
              <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:6, flexWrap:'wrap' }}>
                <span className="num mono" style={{ fontSize:18, fontWeight:600, fontFamily:'var(--font-display)' }}>{task.actualLOE}h</span>
                <span style={{ fontSize:11, color:'var(--fg-muted)', whiteSpace:'nowrap' }}>/ {task.estLOE}h est.</span>
              </div>
              <div style={{ height:4, background:'var(--sand-200)', borderRadius:2, overflow:'hidden', marginBottom:4 }}>
                <div style={{ height:'100%', width:`${Math.min(loePct, 100)}%`, background: loeOver?'var(--rust-500)':loePct>85?'var(--ochre-500)':'var(--teal-500)' }}/>
              </div>
              <div className="meta" style={{ fontSize:10 }}>
                {loeOver ? <span style={{ color:'var(--rust-600)' }}>{Math.round(loePct-100)}% over est.</span> : `${Math.round(loePct)}% used`}
              </div>
            </section>

            <div style={{ height:1, background:'var(--border)' }}/>

            <section style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {detail.epic && <TDField label="Epic"><span style={{ fontSize:12, color:'var(--teal-700)' }}>{detail.epic}</span></TDField>}
              <TDField label="Sprint"><span style={{ fontSize:12 }}>{detail.sprint}</span></TDField>
              <TDField label="Role">
                <span className="chip chip-ink" style={{ textTransform:'capitalize' }}>{ROLES[task.role].label}</span>
              </TDField>
            </section>

            <div style={{ height:1, background:'var(--border)' }}/>

            <section>
              <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8, fontWeight:500 }}>Linked</div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                <a style={{ fontSize:11, color:'var(--teal-700)', display:'flex', alignItems:'center', gap:4, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  <I.Link size={10} style={{ flex:'none' }}/>
                  <span style={{ color:'var(--fg-muted)' }}>Blocked by</span>
                  <span className="mono" style={{ color:'var(--teal-700)' }}>{project?project.code:''}-T{String(Math.max(1,(+task.id.slice(1))-1)).padStart(3,'0')}</span>
                </a>
                <a style={{ fontSize:11, color:'var(--teal-700)', display:'flex', alignItems:'center', gap:4, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  <I.Link size={10} style={{ flex:'none' }}/>
                  <span style={{ color:'var(--fg-muted)' }}>Related</span>
                  <span className="mono" style={{ color:'var(--teal-700)' }}>{project?project.code:''}-T{String((+task.id.slice(1))+2).padStart(3,'0')}</span>
                </a>
              </div>
            </section>
          </aside>
        </div>
      </aside>
    </>
  );
}

window.TaskDrawer = TaskDrawer;
