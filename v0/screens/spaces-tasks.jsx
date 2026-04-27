// My Spaces, My Tasks, Worklogs, Employee Worklogs screens
const { useState: uSS, useMemo: uMS } = React;

// ============ MY SPACES ============
function MySpacesScreen() {
  const [expanded, setExpanded] = uSS(['wb','hp','pg']);
  const toggle = (id) => setExpanded(x => x.includes(id) ? x.filter(i=>i!==id) : [...x, id]);
  const myProjects = ['wbtd','psa','prw','ulp','kor'];

  return (
    <div style={{ display:'flex', height:'100%' }}>
      {/* Inner client sidebar */}
      <aside style={{ width:240, borderRight:'1px solid var(--border)', background:'var(--bg-sunken)', padding:'16px 12px', overflowY:'auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 8px 8px' }}>
          <div style={{ fontSize:11, color:'var(--fg-subtle)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Clients</div>
          <button className="btn-ghost" style={{ padding:2 }}><I.Plus size={12}/></button>
        </div>
        {CLIENTS.map(c => {
          const projs = PROJECTS.filter(p => p.clientId === c.id && myProjects.includes(p.id));
          const isOpen = expanded.includes(c.id);
          return (
            <div key={c.id} style={{ marginBottom:2 }}>
              <button onClick={()=>toggle(c.id)} style={{
                width:'100%', padding:'6px 8px', display:'flex', alignItems:'center', gap:8,
                borderRadius:6, fontSize:12, fontWeight:500,
              }}
                onMouseEnter={e=>e.currentTarget.style.background='var(--sand-200)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <I.Chevron size={10} style={{ transform: isOpen?'rotate(90deg)':'none', transition:'transform 120ms', color:'var(--fg-muted)' }}/>
                <span style={{ flex:1, textAlign:'left' }}>{c.name}</span>
                <span className="mono" style={{ fontSize:10, color:'var(--fg-muted)' }}>{projs.length}</span>
              </button>
              {isOpen && projs.map(p=>(
                <button key={p.id} style={{
                  width:'100%', padding:'5px 8px 5px 30px', display:'flex', alignItems:'center', gap:8,
                  borderRadius:6, fontSize:12, color:'var(--fg-muted)',
                }}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--sand-200)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <span className="code-badge" style={{ width:18, height:18, fontSize:8 }}>{p.code}</span>
                  <span style={{ flex:1, textAlign:'left', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.name}</span>
                </button>
              ))}
            </div>
          );
        })}
      </aside>

      {/* Main */}
      <div style={{ flex:1, overflowY:'auto' }}>
        <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
            <div style={{ display:'flex', flexDirection:'column', gap:4, minWidth:0, flex:1 }}>
              <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>My Spaces</div>
              <h1 style={{ margin:0, fontSize:22, fontFamily:'var(--font-display)', fontWeight:600, letterSpacing:'-0.02em', lineHeight:1.15 }}>Work across your clients</h1>
              <div className="meta">5 assigned projects · 11 open tasks</div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-sm"><I.Download size={12}/> Import from Trello</button>
              <button className="btn btn-primary btn-sm"><I.Plus size={12}/> New task</button>
            </div>
          </div>

          {CLIENTS.filter(c => PROJECTS.some(p => p.clientId===c.id && myProjects.includes(p.id))).slice(0,3).map(c => {
            const projs = PROJECTS.filter(p => p.clientId===c.id && myProjects.includes(p.id));
            return (
              <div key={c.id} style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, paddingTop:4 }}>
                  <div style={{ width:4, height:16, background:'var(--ink-900)', borderRadius:2 }}/>
                  <div style={{ fontWeight:600, fontSize:14 }}>{c.name}</div>
                  <div className="meta">· {projs.length} {projs.length===1?'project':'projects'}</div>
                </div>

                {projs.map(p => {
                  const tasks = TASKS.filter(t => t.project === p.id);
                  return (
                    <div key={p.id} className="card" style={{ overflow:'hidden' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderBottom:'1px solid var(--border)', background:'var(--bg-sunken)' }}>
                        <span className="code-badge">{p.code}</span>
                        <div style={{ fontWeight:500, fontSize:13 }}>{p.name}</div>
                        <StatusPill status={p.status}/>
                        <div style={{ flex:1 }}/>
                        <div className="meta mono">{p.billable}h / {p.budget}h</div>
                        <button className="btn-ghost" style={{ padding:2 }}><I.More size={14}/></button>
                      </div>
                      {tasks.length === 0 ? (
                        <div style={{ padding:20, textAlign:'center', color:'var(--fg-muted)', fontSize:12 }}>
                          No tasks yet. <button style={{ color:'var(--ink-900)', fontWeight:500 }}>Add one →</button>
                        </div>
                      ) : (
                        <div>
                          {tasks.map((t, i) => {
                            const u = TEAM.find(x => x.id === t.assignee);
                            const ts = TASK_STATUS[t.status];
                            const role = ROLES[t.role];
                            return (
                              <div key={t.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 14px', borderTop: i>0?'1px solid var(--border)':'none', fontSize:12 }}>
                                <button style={{
                                  width:14, height:14, borderRadius:'50%', border:`1.5px solid ${ts.dot}`,
                                  background: t.status==='done' ? ts.dot : 'transparent',
                                  display:'flex', alignItems:'center', justifyContent:'center', flex:'none',
                                }}>
                                  {t.status==='done' && <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>}
                                </button>
                                <div style={{ flex:1, minWidth:0 }}>
                                  <div style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{t.title}</div>
                                </div>
                                <span className={`chip chip-${role.color}`} style={{ height:18, fontSize:10 }}>{role.label}</span>
                                <span className="chip chip-ink" style={{ height:18, fontSize:10 }}>{t.priority}</span>
                                <div className="num mono" style={{ fontSize:11, width:80, textAlign:'right' }}>
                                  <span style={{ color: t.actualLOE > t.estLOE ? 'var(--rust-600)' : 'var(--fg)' }}>{t.actualLOE}h</span>
                                  <span style={{ color:'var(--fg-muted)' }}> / {t.estLOE}h</span>
                                </div>
                                <span className={`chip chip-${ts.chip}`} style={{ height:18, fontSize:10 }}>{ts.label}</span>
                                <div className="avatar avatar-sm" style={{ background:u.color, color:'white' }}>
                                  {u.name.split(' ').map(s=>s[0]).join('').slice(0,2)}
                                </div>
                                <div className="meta mono" style={{ width:46, textAlign:'right' }}>{t.due}</div>
                              </div>
                            );
                          })}
                          <button style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px', fontSize:11, color:'var(--fg-muted)', width:'100%', borderTop:'1px solid var(--border)' }}>
                            <I.Plus size={11}/> Add task
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============ MY TASKS ============
function MyTasksScreen() {
  const [view, setView] = uSS('list');
  const [filter, setFilter] = uSS('open');

  const myTasks = TASKS.filter(t => ['na','sm','ti','ka','mh'].includes(t.assignee));
  const shown = filter==='open' ? myTasks.filter(t=>t.status!=='done') : myTasks;

  return (
    <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>My Tasks</div>
          <h1 style={{ margin:0, fontSize:22, fontFamily:'var(--font-display)', fontWeight:600, letterSpacing:'-0.02em', lineHeight:1.15 }}>What's on your plate</h1>
          <div className="meta">{myTasks.filter(t=>t.status!=='done').length} open · {myTasks.filter(t=>t.status==='done').length} done this week</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <div style={{ display:'flex', gap:2, padding:2, background:'var(--bg-sunken)', borderRadius:6, border:'1px solid var(--border)' }}>
            {['list','board'].map(v=>(
              <button key={v} onClick={()=>setView(v)} style={{
                padding:'4px 10px', borderRadius:4, fontSize:11, fontWeight:500, textTransform:'capitalize',
                background: view===v ? 'var(--bg-raised)' : 'transparent',
                color: view===v ? 'var(--fg)' : 'var(--fg-muted)',
              }}>{v}</button>
            ))}
          </div>
          <button className="btn btn-sm"><I.Filter size={12}/> Filter</button>
          <button className="btn btn-primary btn-sm"><I.Plus size={12}/> New task</button>
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ display:'flex', gap:6, alignItems:'center' }}>
        {['open','due-this-week','loe-pending','billable','all'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} className="chip" style={{
            height:24, fontSize:11, textTransform:'capitalize', cursor:'pointer',
            background: filter===f ? 'var(--ink-900)':'var(--sand-200)',
            color: filter===f ? 'var(--fg-inverse)':'var(--ink-700)',
          }}>{f.replace(/-/g,' ')}</button>
        ))}
      </div>

      {view === 'list' ? (
        <div className="card" style={{ overflow:'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width:24 }}></th>
                <th style={{ width:'32%' }}>Task</th>
                <th style={{ width:'14%' }}>Project</th>
                <th>Status</th>
                <th>Priority</th>
                <th>My LOE / Est</th>
                <th>Due</th>
                <th style={{ width:40 }}></th>
              </tr>
            </thead>
            <tbody>
              {shown.map(t => {
                const p = PROJECTS.find(x => x.id === t.project);
                const ts = TASK_STATUS[t.status];
                const u = TEAM.find(x=>x.id===t.assignee);
                const over = t.actualLOE > t.estLOE;
                return (
                  <tr key={t.id}>
                    <td style={{ paddingLeft:16 }}>
                      <button style={{
                        width:14, height:14, borderRadius:'50%', border:`1.5px solid ${ts.dot}`,
                        background: t.status==='done' ? ts.dot : 'transparent',
                      }}/>
                    </td>
                    <td>
                      <div style={{ fontSize:13, fontWeight:500 }}>{t.title}</div>
                      {t.billable && <span className="meta" style={{ fontSize:10 }}>Billable</span>}
                      {!t.billable && <span className="meta" style={{ fontSize:10 }}>Internal</span>}
                    </td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <span className="code-badge" style={{ width:22, height:22, fontSize:8 }}>{p.code}</span>
                        <div style={{ fontSize:12 }}>{p.client}</div>
                      </div>
                    </td>
                    <td><span className={`chip chip-${ts.chip}`}><span className="chip-dot"/>{ts.label}</span></td>
                    <td>
                      <span className={`chip chip-${t.priority==='high'?'rust':t.priority==='med'?'ochre':'ink'}`} style={{ textTransform:'capitalize' }}>
                        {t.priority}
                      </span>
                    </td>
                    <td>
                      <div className="mono num" style={{ fontSize:12 }}>
                        <span style={{ color: over ? 'var(--rust-600)' : 'var(--fg)', fontWeight:500 }}>{t.actualLOE}h</span>
                        <span style={{ color:'var(--fg-muted)' }}> / {t.estLOE}h</span>
                      </div>
                      <div className="progress" style={{ marginTop:3, width:60 }}>
                        <span style={{ width: `${Math.min((t.actualLOE/t.estLOE)*100,100)}%`, background: over?'var(--rust-500)':'var(--moss-500)' }}/>
                      </div>
                    </td>
                    <td><span className="mono" style={{ fontSize:12 }}>{t.due}</span></td>
                    <td><button className="btn-ghost" style={{ padding:4, color:'var(--fg-muted)' }}><I.Play size={12}/></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12 }}>
          {['todo','in-progress','review','done'].map(col => {
            const items = shown.filter(t=>t.status===col);
            return (
              <div key={col} style={{ background:'var(--bg-sunken)', borderRadius:8, border:'1px solid var(--border)', padding:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 4px 10px' }}>
                  <span className="chip-dot" style={{ background: TASK_STATUS[col].dot, width:8, height:8, borderRadius:4 }}/>
                  <div style={{ fontSize:12, fontWeight:600 }}>{TASK_STATUS[col].label}</div>
                  <div className="meta mono">{items.length}</div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {items.map(t=>{
                    const p = PROJECTS.find(x=>x.id===t.project);
                    const u = TEAM.find(x=>x.id===t.assignee);
                    return (
                      <div key={t.id} className="card" style={{ padding:10, cursor:'grab' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                          <span className="code-badge" style={{ width:22, height:22, fontSize:8 }}>{p.code}</span>
                          <span className={`chip chip-${t.priority==='high'?'rust':t.priority==='med'?'ochre':'ink'}`} style={{ fontSize:10, height:16 }}>{t.priority}</span>
                        </div>
                        <div style={{ fontSize:12, fontWeight:500, marginBottom:8, lineHeight:1.3 }}>{t.title}</div>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <div className="avatar avatar-sm" style={{ background:u.color, color:'white' }}>{u.name.split(' ').map(s=>s[0]).join('').slice(0,2)}</div>
                          <div className="mono num" style={{ fontSize:10, color:'var(--fg-muted)' }}>{t.actualLOE}/{t.estLOE}h</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { MySpacesScreen, MyTasksScreen });
