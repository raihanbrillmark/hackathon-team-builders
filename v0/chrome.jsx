// Sidebar with collapse / expand / hidden modes, and top bar
const { useState } = React;

function Logo({ collapsed }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <div style={{
        width:26, height:26, borderRadius:6,
        background:'var(--ink-900)', color:'var(--fg-inverse)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontFamily:'var(--font-display)', fontWeight:700, fontSize:14,
        position:'relative',
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 3.5h10M7 3.5V11M5 11h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          <circle cx="11" cy="11" r="1.2" fill="var(--teal-500)"/>
        </svg>
      </div>
      {!collapsed && (
        <div style={{ lineHeight:1.1 }}>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:14, letterSpacing:'-0.01em' }}>trakio</div>
          <div style={{ fontSize:10, color:'var(--fg-muted)', fontFamily:'var(--font-mono)' }}>brillmark.trakio.app</div>
        </div>
      )}
    </div>
  );
}

function TenantSwitcher({ collapsed }) {
  return (
    <button className="btn-ghost" style={{
      width:'100%', padding: collapsed ? '6px' : '8px', borderRadius:8,
      display:'flex', alignItems:'center', gap:10, justifyContent: collapsed ? 'center' : 'space-between',
      border:'1px solid var(--border)', background:'var(--bg-raised)',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
        <div style={{
          width:28, height:28, flex:'none', borderRadius:6,
          background:'linear-gradient(135deg, var(--ink-800), var(--ink-900))',
          color:'var(--fg-inverse)', display:'flex', alignItems:'center', justifyContent:'center',
          fontWeight:700, fontSize:11,
        }}>BM</div>
        {!collapsed && (
          <div style={{ minWidth:0, textAlign:'left' }}>
            <div style={{ fontSize:12, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>Brillmark LLC</div>
            <div style={{ fontSize:10, color:'var(--fg-muted)' }}>CRO Agency · 14 seats</div>
          </div>
        )}
      </div>
      {!collapsed && <I.ChevronDown size={12} style={{ color:'var(--fg-muted)' }} />}
    </button>
  );
}

function NavItem({ icon:Ic, label, count, active, collapsed, onClick, kbd }) {
  return (
    <button onClick={onClick}
      className="tt" data-tip={collapsed ? label : undefined}
      style={{
        width:'100%', height:30, padding: collapsed ? 0 : '0 10px',
        display:'flex', alignItems:'center', gap:10, justifyContent: collapsed ? 'center' : 'flex-start',
        borderRadius:6,
        background: active ? 'var(--sand-200)' : 'transparent',
        color: active ? 'var(--ink-900)' : 'var(--ink-600)',
        fontSize:12, fontWeight: active ? 600 : 500,
        position:'relative',
      }}
      onMouseEnter={e=>{ if(!active) e.currentTarget.style.background='var(--sand-100)'; }}
      onMouseLeave={e=>{ if(!active) e.currentTarget.style.background='transparent'; }}>
      <Ic size={14}/>
      {!collapsed && <span style={{ flex:1, textAlign:'left' }}>{label}</span>}
      {!collapsed && count != null && (
        <span style={{
          fontSize:10, fontFamily:'var(--font-mono)',
          color:'var(--fg-muted)', background:'var(--sand-200)',
          padding:'1px 5px', borderRadius:3,
        }}>{count}</span>
      )}
      {!collapsed && kbd && (
        <span className="kbd">{kbd}</span>
      )}
      {active && <span style={{ position:'absolute', left:-12, top:6, bottom:6, width:2, background:'var(--ink-900)', borderRadius:1 }}/>}
    </button>
  );
}

function Sidebar({ current, setScreen, collapsed, role, setRole }) {
  const user = TEAM.find(t=>t.role===role) || TEAM[0];
  return (
    <aside style={{
      width: collapsed ? 'var(--sidebar-w-collapsed)' : 'var(--sidebar-w)',
      flex:'none',
      background:'var(--bg-sidebar)',
      borderRight:'1px solid var(--border)',
      padding:'12px',
      display:'flex', flexDirection:'column', gap:12,
      transition:'width 180ms',
      height:'100vh',
    }}>
      <TenantSwitcher collapsed={collapsed}/>

      <nav style={{ display:'flex', flexDirection:'column', gap:1 }}>
        {!collapsed && <div style={{ fontSize:10, color:'var(--fg-subtle)', textTransform:'uppercase', letterSpacing:'0.08em', padding:'8px 10px 4px' }}>Platform</div>}
        <NavItem icon={I.Dashboard} label="Dashboard"     active={current==='dashboard'} onClick={()=>setScreen('dashboard')} collapsed={collapsed} kbd="D"/>
        <NavItem icon={I.Check}     label="My Tasks"      count={6} active={current==='tasks'} onClick={()=>setScreen('tasks')} collapsed={collapsed} kbd="T"/>
        <NavItem icon={I.Clock}     label="Worklogs"      active={current==='worklogs'} onClick={()=>setScreen('worklogs')} collapsed={collapsed} kbd="W"/>
        <NavItem icon={I.Layers}    label="My Spaces"     count={4} active={current==='spaces'} onClick={()=>setScreen('spaces')} collapsed={collapsed} kbd="S"/>
        <NavItem icon={I.Folder}    label="Projects"      count={11} active={current==='projects'} onClick={()=>setScreen('projects')} collapsed={collapsed} kbd="P"/>
        <NavItem icon={I.Receipt}   label="Invoices"      count={8} active={current==='invoices'} onClick={()=>setScreen('invoices')} collapsed={collapsed} kbd="I"/>
        <NavItem icon={I.Users}     label="Clients"       active={current==='clients'} onClick={()=>setScreen('clients')} collapsed={collapsed}/>

        {!collapsed && <div style={{ fontSize:10, color:'var(--fg-subtle)', textTransform:'uppercase', letterSpacing:'0.08em', padding:'12px 10px 4px' }}>Manage</div>}
        <NavItem icon={I.UserCheck} label="Employee Worklogs" active={current==='emp-worklogs'} onClick={()=>setScreen('emp-worklogs')} collapsed={collapsed}/>
        <NavItem icon={I.Chart}     label="Reports"       active={current==='reports'} onClick={()=>setScreen('reports')} collapsed={collapsed}/>
        <NavItem icon={I.Target}    label="LOE Approvals" count={3} active={current==='loe'} onClick={()=>setScreen('loe')} collapsed={collapsed}/>
        <NavItem icon={I.Settings}  label="Settings"      active={current==='settings'} onClick={()=>setScreen('settings')} collapsed={collapsed}/>
      </nav>

      <div style={{ flex:1 }}/>

      {!collapsed && (
        <div style={{
          padding:'10px 12px', borderRadius:8, background:'var(--bg-raised)',
          border:'1px solid var(--border)', fontSize:11,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, color:'var(--fg-muted)', marginBottom:6 }}>
            <I.Slack size={12}/> Slack connected
          </div>
          <div style={{ fontWeight:500 }}>#brillmark-worklogs</div>
          <div style={{ color:'var(--fg-muted)', marginTop:2 }}>Daily digest at 9:00</div>
        </div>
      )}

      <button className="btn-ghost" style={{
        padding: collapsed ? 4 : 8, borderRadius:8, display:'flex', alignItems:'center', gap:10,
        border:'1px solid var(--border)', width:'100%',
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <div className="avatar" style={{ background:user.color, color:'white' }}>
          {user.name.split(' ').map(s=>s[0]).join('').slice(0,2)}
        </div>
        {!collapsed && (
          <div style={{ minWidth:0, flex:1, textAlign:'left' }}>
            <div style={{ fontSize:12, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user.name}</div>
            <div style={{ fontSize:10, color:'var(--fg-muted)' }}>{ROLES[user.role].label}</div>
          </div>
        )}
        {!collapsed && <I.ChevronUp size={12} style={{ color:'var(--fg-muted)' }}/>}
      </button>
    </aside>
  );
}

function TopBar({ current, setCollapsed, collapsed, role, setRole, onOpenTweaks, breadcrumbs }) {
  return (
    <header style={{
      height:48, flex:'none',
      borderBottom:'1px solid var(--border)',
      background:'var(--bg)',
      display:'flex', alignItems:'center',
      padding:'0 16px', gap:12,
      position:'sticky', top:0, zIndex:10,
    }}>
      <button className="btn-ghost" onClick={()=>setCollapsed(c=>!c)} style={{ width:28, height:28, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <I.Sidebar size={15}/>
      </button>
      <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--fg-muted)' }}>
        {breadcrumbs.map((b, i) => (
          <React.Fragment key={i}>
            <span style={{ color: i === breadcrumbs.length-1 ? 'var(--fg)' : 'var(--fg-muted)', fontWeight: i === breadcrumbs.length-1 ? 500 : 400 }}>{b}</span>
            {i < breadcrumbs.length-1 && <I.Chevron size={10}/>}
          </React.Fragment>
        ))}
      </div>
      <div style={{ flex:1 }}/>

      <div style={{ position:'relative', width:280 }}>
        <I.Search size={12} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--fg-muted)' }}/>
        <input className="input" placeholder="Search or jump to…" style={{ width:'100%', paddingLeft:28 }}/>
        <span className="kbd" style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)' }}>⌘K</span>
      </div>

      <select value={role} onChange={e=>setRole(e.target.value)} className="input"
        title="Switch role (prototype)"
        style={{ width:130, fontFamily:'var(--font-mono)', fontSize:11 }}>
        <option value="admin">as Admin</option>
        <option value="pm">as PM</option>
        <option value="dev">as Developer</option>
        <option value="qa">as QA</option>
        <option value="designer">as Designer</option>
      </select>

      <button className="btn-ghost" style={{ width:28, height:28, borderRadius:6, position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <I.Bell size={15}/>
        <span style={{ position:'absolute', top:5, right:5, width:6, height:6, background:'var(--rust-500)', borderRadius:'50%', border:'2px solid var(--bg)' }}/>
      </button>

      <button className="btn-ghost" onClick={onOpenTweaks} style={{ width:28, height:28, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <I.Sparkle size={15}/>
      </button>

      <button className="btn btn-primary btn-sm">
        <I.Plus size={12}/> New
      </button>
    </header>
  );
}

Object.assign(window, { Sidebar, TopBar });
