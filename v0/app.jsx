// Trakio main app shell
const { useState: uSA, useEffect: uEA, useMemo: uMA } = React;

function App() {
  const [screen, setScreen] = uSA(() => {
    try { return localStorage.getItem('trakio.screen') || 'projects'; } catch { return 'projects'; }
  });
  uEA(() => { try { localStorage.setItem('trakio.screen', screen); } catch {} }, [screen]);

  const [role, setRole] = uSA('pm');
  const [tweaksOpen, setTweaksOpen] = uSA(false);
  const [tweaks, setTweaks] = uSA(() => ({ ...TWEAK_DEFAULTS }));

  uEA(() => {
    document.documentElement.setAttribute('data-theme', tweaks.theme);
    document.documentElement.setAttribute('data-font', tweaks.font);
  }, [tweaks.theme, tweaks.font]);

  uEA(() => {
    const onMsg = (e) => {
      if (e.data?.type === '__activate_edit_mode') setTweaksOpen(true);
      if (e.data?.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type:'__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const sidebarCollapsed = tweaks.sidebar === 'collapsed';
  const sidebarHidden = tweaks.sidebar === 'hidden';

  const screens = {
    dashboard:     { comp: DashboardScreen,        crumbs:['Dashboard'] },
    tasks:         { comp: MyTasksScreen,          crumbs:['My Tasks'] },
    worklogs:      { comp: WorklogsScreen,         crumbs:['Worklogs'] },
    spaces:        { comp: MySpacesScreen,         crumbs:['My Spaces'] },
    projects:      { comp: ProjectsScreen,         crumbs:['Projects'] },
    invoices:      { comp: InvoicesScreen,          crumbs:['Invoices'] },
    clients:       { comp: ClientsScreen,          crumbs:['Clients'] },
    'emp-worklogs':{ comp: EmployeeWorklogsScreen, crumbs:['Manage','Employee Worklogs'] },
    reports:       { comp: ReportsScreen,          crumbs:['Manage','Reports'] },
    loe:           { comp: LOEScreen,              crumbs:['Manage','LOE Approvals'] },
    settings:      { comp: SettingsScreen,         crumbs:['Settings'] },
  };

  const Current = screens[screen]?.comp || ProjectsScreen;
  const crumbs = screens[screen]?.crumbs || ['Projects'];

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }} data-screen-label={`01 ${crumbs.join(' / ')}`}>
      {!sidebarHidden && (
        <Sidebar
          current={screen}
          setScreen={setScreen}
          collapsed={sidebarCollapsed}
          role={role}
          setRole={setRole}
        />
      )}
      <main style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:'var(--bg)' }}>
        <TopBar
          current={screen}
          collapsed={sidebarCollapsed}
          setCollapsed={() => setTweaks(t => ({ ...t, sidebar: t.sidebar==='expanded'?'collapsed': t.sidebar==='collapsed'?'hidden':'expanded' }))}
          role={role}
          setRole={setRole}
          onOpenTweaks={() => setTweaksOpen(o=>!o)}
          breadcrumbs={crumbs}
        />
        <div style={{ flex:1, overflowY:'auto' }}>
          <Current/>
        </div>
      </main>
      <TweaksPanel open={tweaksOpen} onClose={()=>setTweaksOpen(false)} tweaks={tweaks} setTweaks={setTweaks}/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
