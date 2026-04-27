// Invoices — full invoice management module
// Sub-views: list | detail | create | payments | reminders | recurring | billing
const { useState: uSI, useMemo: uMI, useEffect: uEI } = React;

const TODAY = new Date('2026-04-19');
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
const fmtMoney = (n, cur='USD') => CURRENCIES[cur] ? CURRENCIES[cur].fmt(n) : '$'+n.toFixed(2);
const fmtDate = (s) => s ? new Date(s).toLocaleDateString('en-US',{month:'short',day:'2-digit',year:'numeric'}) : '—';
const clientName = (id) => (CLIENTS.find(c=>c.id===id)||{}).name || id;
const projectName = (id) => (PROJECTS.find(p=>p.id===id)||{}).name || id;
const projectCode = (id) => (PROJECTS.find(p=>p.id===id)||{}).code || id;

function StatusChip({ status }) {
  const m = INVOICE_STATUS[status] || INVOICE_STATUS.draft;
  return (
    <span className={`chip chip-${m.chip}`}>
      <span className="chip-dot" style={{ background:m.dot }}/>
      {m.label}
    </span>
  );
}

function dueState(inv) {
  if (inv.status === 'paid' || inv.status === 'void') return null;
  const d = daysBetween(TODAY, inv.due);
  if (d < 0) return { label:`${-d}d overdue`, tone:'rust' };
  if (d <= 7) return { label:`Due in ${d}d`, tone:'ochre' };
  return { label:`Due in ${d}d`, tone:'ink' };
}

// ——————————————————————————————————————————————
// Stat card
// ——————————————————————————————————————————————
function StatCard({ label, value, sub, tone='ink', icon:Ic }) {
  const toneColor = {
    ink:'var(--ink-900)', rust:'var(--rust-600)', moss:'var(--moss-600)',
    teal:'var(--teal-700)', ochre:'var(--ochre-600)',
  }[tone];
  return (
    <div style={{ padding:'14px 16px', background:'var(--bg-raised)', border:'1px solid var(--border)', borderRadius:8, flex:1, minWidth:0 }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>
        {Ic && <Ic size={11}/>}
        {label}
      </div>
      <div style={{ fontSize:24, fontFamily:'var(--font-display)', fontWeight:600, letterSpacing:'-0.02em', color:toneColor, lineHeight:1.1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize:11, color:'var(--fg-muted)', marginTop:4 }}>{sub}</div>}
    </div>
  );
}

// ——————————————————————————————————————————————
// Summary stats row
// ——————————————————————————————————————————————
function InvoiceStats() {
  const stats = uMI(() => {
    const usd = (inv) => {
      // fake normalize to USD for hero stat
      const rate = { USD:1, GBP:1.26, EUR:1.08, CAD:0.73, AUD:0.66 };
      return (inv.total - inv.paid) * (rate[inv.currency]||1);
    };
    const outstanding = INVOICES.filter(i=>['sent','viewed','partial','overdue'].includes(i.status)).reduce((s,i)=>s+usd(i),0);
    const overdue = INVOICES.filter(i=>i.status==='overdue').reduce((s,i)=>s+usd(i),0);
    const paidThisMonth = PAYMENTS.filter(p=>p.status==='reconciled' && p.date.startsWith('2026-04')).reduce((s,p)=>s+(p.amount*({USD:1,GBP:1.26,EUR:1.08,CAD:0.73}[p.currency]||1)),0);
    return { outstanding, overdue, paidThisMonth, avgDays: 27 };
  }, []);
  return (
    <div style={{ display:'flex', gap:12 }}>
      <StatCard label="Outstanding" value={'$'+Math.round(stats.outstanding).toLocaleString()} sub="5 open invoices · normalized USD" icon={I.FileText}/>
      <StatCard label="Overdue" value={'$'+Math.round(stats.overdue).toLocaleString()} sub="2 invoices · oldest 50 days" tone="rust" icon={I.Warn}/>
      <StatCard label="Paid this month" value={'$'+Math.round(stats.paidThisMonth).toLocaleString()} sub="3 payments reconciled" tone="moss" icon={I.CreditCard}/>
      <StatCard label="Avg collection" value={stats.avgDays + ' days'} sub="Target 30 · trending down" tone="teal" icon={I.Clock}/>
    </div>
  );
}

// ——————————————————————————————————————————————
// Invoices list
// ——————————————————————————————————————————————
function InvoicesList({ onOpen, onCreate, view, setView }) {
  const [tab, setTab] = uSI('all');
  const [groupBy, setGroupBy] = uSI('none'); // none | client | project
  const [query, setQuery] = uSI('');

  const filtered = uMI(() => {
    let xs = INVOICES;
    if (tab !== 'all') xs = xs.filter(i => i.status === tab);
    if (query) {
      const q = query.toLowerCase();
      xs = xs.filter(i => i.id.toLowerCase().includes(q) || clientName(i.client).toLowerCase().includes(q));
    }
    return xs;
  }, [tab, query]);

  const counts = uMI(() => {
    const base = { all: INVOICES.length };
    Object.keys(INVOICE_STATUS).forEach(k => { base[k] = INVOICES.filter(i=>i.status===k).length; });
    return base;
  }, []);

  const tabs = [
    ['all','All'], ['draft','Draft'], ['sent','Sent'], ['viewed','Viewed'],
    ['partial','Partial'], ['paid','Paid'], ['overdue','Overdue'],
  ];

  const grouped = uMI(() => {
    if (groupBy === 'none') return [{ key:null, label:null, items:filtered }];
    if (groupBy === 'client') {
      const m = {};
      filtered.forEach(i => { (m[i.client] = m[i.client] || []).push(i); });
      return Object.entries(m).map(([k,items]) => ({ key:k, label:clientName(k), items }));
    }
    // project
    const m = {};
    filtered.forEach(i => {
      const key = i.projects[0] || '—';
      (m[key] = m[key] || []).push(i);
    });
    return Object.entries(m).map(([k,items]) => ({ key:k, label: k==='—' ? '— No project' : `${projectCode(k)} · ${projectName(k)}`, items }));
  }, [filtered, groupBy]);

  return (
    <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', gap:16 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:4, flex:1, minWidth:0 }}>
          <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Invoices</div>
          <h1 style={{ margin:0, fontSize:22, fontFamily:'var(--font-display)', fontWeight:600, letterSpacing:'-0.02em', lineHeight:1.15, whiteSpace:'nowrap' }}>Billing & collections</h1>
          <div style={{ fontSize:12, color:'var(--fg-muted)' }}>8 invoices · 2 overdue · $18,423 outstanding</div>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          <button className="btn btn-sm" onClick={()=>setView('payments')}><I.CreditCard size={12}/> Payments</button>
          <button className="btn btn-sm" onClick={()=>setView('reminders')}><I.Mail size={12}/> Reminders</button>
          <button className="btn btn-sm" onClick={()=>setView('recurring')}><I.Refresh size={12}/> Recurring</button>
          <button className="btn btn-sm" onClick={()=>setView('billing')}><I.Settings size={12}/> Client billing</button>
          <button className="btn btn-accent btn-sm" onClick={onCreate}><I.Plus size={12}/> New invoice</button>
        </div>
      </div>

      <InvoiceStats/>

      {/* View segmented (list / timeline) */}
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ display:'flex', gap:0, border:'1px solid var(--border-strong)', borderRadius:6, padding:2, background:'var(--bg-raised)' }}>
          {[['list','List'],['timeline','Timeline']].map(([k,l])=>(
            <button key={k} onClick={()=>setView(k==='timeline'?'timeline':'list-view')}
              style={{
                padding:'4px 10px', fontSize:11, fontWeight:500, borderRadius:4,
                background: (k==='list'||(view==='list-view'&&k==='list'))?'var(--sand-200)':'transparent',
                color: (k==='list')?'var(--fg)':'var(--fg-muted)',
              }}>{l}</button>
          ))}
        </div>
        <div style={{ flex:1 }}/>
        <div style={{ position:'relative' }}>
          <I.Search size={12} style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', color:'var(--fg-muted)' }}/>
          <input className="input" placeholder="Search invoice # or client…" value={query} onChange={e=>setQuery(e.target.value)} style={{ paddingLeft:26, width:260 }}/>
        </div>
        <select className="input" value={groupBy} onChange={e=>setGroupBy(e.target.value)} style={{ fontSize:11 }}>
          <option value="none">No grouping</option>
          <option value="client">Group by client</option>
          <option value="project">Group by project</option>
        </select>
        <button className="btn btn-sm"><I.Download size={12}/> Export CSV</button>
      </div>

      {/* Status tabs */}
      <div style={{ display:'flex', gap:2, borderBottom:'1px solid var(--border)' }}>
        {tabs.map(([k,l]) => (
          <button key={k} onClick={()=>setTab(k)}
            style={{
              padding:'8px 14px', fontSize:12, fontWeight:500,
              color: tab===k ? 'var(--fg)' : 'var(--fg-muted)',
              borderBottom: tab===k ? '2px solid var(--teal-600)' : '2px solid transparent',
              marginBottom:-1,
              display:'flex', alignItems:'center', gap:6,
            }}>
            {l}
            <span style={{ fontSize:10, fontFamily:'var(--font-mono)', color:'var(--fg-muted)', background:'var(--sand-200)', padding:'1px 5px', borderRadius:3 }}>
              {counts[k] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ overflow:'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width:130 }}>Invoice</th>
              <th>Client · Project</th>
              <th style={{ width:100 }}>Status</th>
              <th style={{ width:100 }}>Issued</th>
              <th style={{ width:130 }}>Due</th>
              <th style={{ width:90 }}>Type</th>
              <th style={{ width:140, textAlign:'right' }}>Total</th>
              <th style={{ width:140, textAlign:'right' }}>Balance</th>
              <th style={{ width:32 }}/>
            </tr>
          </thead>
          <tbody>
            {grouped.map(grp => (
              <React.Fragment key={grp.key ?? 'all'}>
                {grp.label && (
                  <tr>
                    <td colSpan={9} style={{ background:'var(--bg-sunken)', padding:'6px 12px', fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:500 }}>
                      {grp.label} <span style={{ opacity:0.6 }}>· {grp.items.length}</span>
                    </td>
                  </tr>
                )}
                {grp.items.map(inv => {
                  const du = dueState(inv);
                  const balance = inv.total - inv.paid;
                  return (
                    <tr key={inv.id} onClick={()=>onOpen(inv.id)} style={{ cursor:'pointer' }}>
                      <td>
                        <div className="mono" style={{ fontSize:12, fontWeight:500 }}>{inv.id}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight:500 }}>{clientName(inv.client)}</div>
                        <div className="meta">{inv.projects.map(projectCode).join(' · ')}</div>
                      </td>
                      <td><StatusChip status={inv.status}/></td>
                      <td className="meta">{fmtDate(inv.issued)}</td>
                      <td>
                        <div>{fmtDate(inv.due)}</div>
                        {du && (
                          <div style={{ fontSize:10, color: du.tone==='rust'?'var(--rust-600)': du.tone==='ochre'?'var(--ochre-600)':'var(--fg-muted)' }}>{du.label}</div>
                        )}
                      </td>
                      <td>
                        <span className="chip chip-ink" style={{ textTransform:'capitalize' }}>{inv.type}</span>
                      </td>
                      <td style={{ textAlign:'right' }} className="num mono">
                        {fmtMoney(inv.total, inv.currency)}
                      </td>
                      <td style={{ textAlign:'right' }} className="num mono">
                        <div style={{ fontWeight: balance>0?600:400, color: balance>0?'var(--fg)':'var(--fg-muted)' }}>
                          {fmtMoney(balance, inv.currency)}
                        </div>
                        {inv.paid > 0 && inv.paid < inv.total && (
                          <div style={{ fontSize:10, color:'var(--fg-muted)' }}>{fmtMoney(inv.paid, inv.currency)} paid</div>
                        )}
                      </td>
                      <td><button className="btn-ghost" style={{ padding:4, color:'var(--fg-muted)' }} onClick={e=>e.stopPropagation()}><I.More size={14}/></button></td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ——————————————————————————————————————————————
// Timeline view
// ——————————————————————————————————————————————
function InvoicesTimeline({ onOpen, setView }) {
  // Render a simple calendar-ish timeline for April & May 2026
  const months = [
    { label:'April 2026', days:30, start:new Date('2026-04-01') },
    { label:'May 2026',   days:31, start:new Date('2026-05-01') },
  ];
  const events = INVOICES.map(i => ({
    id: i.id,
    issued: new Date(i.issued),
    due: new Date(i.due),
    status: i.status,
    client: clientName(i.client),
    total: fmtMoney(i.total, i.currency),
    inv: i,
  }));

  const dayIdx = (d, monthStart, len) => {
    const diff = Math.floor((d - monthStart) / 86400000);
    return (diff >= 0 && diff < len) ? diff : null;
  };

  return (
    <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <button className="btn-ghost" onClick={()=>setView('list')} style={{ color:'var(--fg-muted)', fontSize:12, padding:'4px 6px', display:'flex', alignItems:'center', gap:4 }}>
          <I.ArrowRight size={12} style={{ transform:'rotate(180deg)' }}/> Invoices
        </button>
        <h1 style={{ margin:0, fontSize:22, fontFamily:'var(--font-display)', fontWeight:600, letterSpacing:'-0.02em', lineHeight:1.15, whiteSpace:'nowrap' }}>Timeline</h1>
        <div style={{ flex:1 }}/>
        <div style={{ display:'flex', gap:12, fontSize:11, color:'var(--fg-muted)' }}>
          <span style={{ display:'flex', alignItems:'center', gap:4 }}><span style={{ width:8, height:8, background:'var(--teal-500)', borderRadius:2 }}/>Issued</span>
          <span style={{ display:'flex', alignItems:'center', gap:4 }}><span style={{ width:8, height:8, background:'var(--ochre-500)', borderRadius:2 }}/>Due</span>
          <span style={{ display:'flex', alignItems:'center', gap:4 }}><span style={{ width:8, height:8, background:'var(--rust-500)', borderRadius:2 }}/>Overdue</span>
        </div>
      </div>

      {months.map(m => (
        <div key={m.label} className="card" style={{ padding:16 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <div style={{ fontWeight:600, fontSize:13 }}>{m.label}</div>
            <div className="meta">{events.filter(e => e.issued.getMonth() === m.start.getMonth() || e.due.getMonth() === m.start.getMonth()).length} events</div>
          </div>
          {/* day scale */}
          <div style={{ display:'grid', gridTemplateColumns:`repeat(${m.days}, 1fr)`, gap:1, marginBottom:4 }}>
            {Array.from({length:m.days}).map((_,i)=>(
              <div key={i} style={{ fontSize:9, color:'var(--fg-muted)', textAlign:'center', fontFamily:'var(--font-mono)' }}>
                {i+1}
              </div>
            ))}
          </div>
          <div style={{ position:'relative', display:'grid', gridTemplateColumns:`repeat(${m.days}, 1fr)`, rowGap:6, columnGap:1 }}>
            {events.map((e, idx) => {
              const si = dayIdx(e.issued, m.start, m.days);
              const di = dayIdx(e.due, m.start, m.days);
              if (si === null && di === null) return null;
              const start = si !== null ? si : 0;
              const end = di !== null ? di : m.days-1;
              const width = Math.max(1, end - start + 1);
              const overdue = e.status === 'overdue';
              const paid = e.status === 'paid';
              return (
                <div key={e.id+m.label} onClick={()=>onOpen(e.id)}
                  style={{
                    gridColumn: `${start+1} / span ${width}`,
                    gridRow: idx+1,
                    height:22, borderRadius:4,
                    background: paid ? 'var(--moss-100)' : overdue ? 'var(--rust-100)' : 'var(--teal-50)',
                    border: `1px solid ${paid?'var(--moss-500)':overdue?'var(--rust-500)':'var(--teal-500)'}`,
                    display:'flex', alignItems:'center', padding:'0 6px',
                    fontSize:10, fontWeight:500, color: paid?'var(--moss-600)':overdue?'var(--rust-600)':'var(--teal-700)',
                    cursor:'pointer', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                    position:'relative',
                  }}>
                  <span style={{ overflow:'hidden', textOverflow:'ellipsis' }}>{e.inv.id.split('-').slice(-1)[0]} · {e.client} · {e.total}</span>
                  {si !== null && <span style={{ position:'absolute', left:-3, top:'50%', transform:'translateY(-50%)', width:6, height:6, borderRadius:'50%', background:'var(--teal-500)' }}/>}
                  {di !== null && <span style={{ position:'absolute', right:-3, top:'50%', transform:'translateY(-50%)', width:6, height:6, borderRadius:'50%', background: overdue?'var(--rust-500)':'var(--ochre-500)' }}/>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ——————————————————————————————————————————————
// Invoice detail — classic professional, print-ready
// ——————————————————————————————————————————————
function InvoiceDetail({ invoiceId, onBack }) {
  const inv = INVOICES.find(i => i.id === invoiceId) || INVOICES[0];
  const billing = CLIENT_BILLING[inv.client] || {};
  const clientObj = CLIENTS.find(c => c.id === inv.client) || {};
  const balance = inv.total - inv.paid;

  return (
    <div style={{ padding:'20px 24px', display:'grid', gridTemplateColumns:'minmax(0,1fr) 320px', gap:16 }}>
      <div>
        {/* action bar */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <button className="btn btn-sm" onClick={onBack}><I.ArrowRight size={12} style={{ transform:'rotate(180deg)' }}/> All invoices</button>
          <div style={{ flex:1 }}/>
          <button className="btn btn-sm"><I.Print size={12}/> Print</button>
          <button className="btn btn-sm"><I.Download size={12}/> PDF</button>
          <button className="btn btn-sm"><I.Copy size={12}/> Duplicate</button>
          <button className="btn btn-sm"><I.Link size={12}/> Payment link</button>
          <button className="btn btn-accent btn-sm"><I.Send size={12}/> Send invoice</button>
        </div>

        {/* classic document */}
        <div style={{
          background:'#fff', color:'#1a1915',
          border:'1px solid var(--border)', borderRadius:8,
          padding:'48px 56px', boxShadow:'var(--shadow-sm)',
          fontFamily:'var(--font-sans)',
        }}>
          {/* letterhead */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:24, borderBottom:'2px solid var(--teal-600)', paddingBottom:20, marginBottom:28 }}>
            <div style={{ display:'flex', gap:12, alignItems:'center' }}>
              <div style={{
                width:42, height:42, borderRadius:8,
                background:'var(--teal-600)', color:'#fff',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily:'var(--font-display)', fontWeight:700, fontSize:18, letterSpacing:'-0.02em',
              }}>B</div>
              <div>
                <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:18, letterSpacing:'-0.02em' }}>Brillmark LLC</div>
                <div style={{ fontSize:11, color:'#5a5749' }}>CRO Agency · brillmark.com</div>
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:11, color:'#5a5749', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Invoice</div>
              <div className="mono" style={{ fontSize:18, fontWeight:600, letterSpacing:'0.02em', whiteSpace:'nowrap' }}>{inv.id}</div>
              <div style={{ marginTop:8 }}><StatusChip status={inv.status}/></div>
            </div>
          </div>

          {/* addresses + meta */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:24, marginBottom:32 }}>
            <div>
              <div style={{ fontSize:10, color:'#807b69', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>From</div>
              <div style={{ fontSize:12, lineHeight:1.5 }}>
                <div style={{ fontWeight:600 }}>Brillmark LLC</div>
                <div>2140 Market Street, Suite 320</div>
                <div>San Francisco, CA 94114</div>
                <div>United States</div>
                <div style={{ marginTop:4, color:'#5a5749' }}>EIN 87-1234567</div>
                <div style={{ color:'#5a5749' }}>billing@brillmark.com</div>
              </div>
            </div>
            <div>
              <div style={{ fontSize:10, color:'#807b69', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Bill to</div>
              <div style={{ fontSize:12, lineHeight:1.5 }}>
                <div style={{ fontWeight:600 }}>{clientObj.name}</div>
                {billing.contactName && <div>Attn: {billing.contactName}</div>}
                {billing.address && billing.address.split('\n').map((l,i)=><div key={i}>{l}</div>)}
                {billing.contactEmail && <div style={{ marginTop:4, color:'#5a5749' }}>{billing.contactEmail}</div>}
              </div>
            </div>
            <div>
              <div style={{ fontSize:10, color:'#807b69', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Details</div>
              <div style={{ fontSize:12, display:'grid', gridTemplateColumns:'auto 1fr', gap:'4px 10px' }}>
                <span style={{ color:'#5a5749' }}>Issued</span><span>{fmtDate(inv.issued)}</span>
                <span style={{ color:'#5a5749' }}>Due</span><span style={{ fontWeight:600 }}>{fmtDate(inv.due)}</span>
                <span style={{ color:'#5a5749' }}>Terms</span><span>{billing.terms}</span>
                <span style={{ color:'#5a5749' }}>Currency</span><span className="mono">{inv.currency}</span>
                <span style={{ color:'#5a5749' }}>Project</span><span>{inv.projects.map(projectCode).join(', ')}</span>
                {billing.poRequired && (<><span style={{ color:'#5a5749' }}>PO #</span><span className="mono">PO-{inv.id.split('-').slice(-1)[0]}</span></>)}
              </div>
            </div>
          </div>

          {/* line items */}
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
            <thead>
              <tr style={{ borderBottom:'1px solid #ddd5c5', background:'#faf8f4' }}>
                <th style={{ textAlign:'left', padding:'10px 12px', fontSize:10, textTransform:'uppercase', letterSpacing:'0.08em', color:'#5a5749', fontWeight:500 }}>Description</th>
                <th style={{ textAlign:'right', padding:'10px 8px', fontSize:10, textTransform:'uppercase', letterSpacing:'0.08em', color:'#5a5749', fontWeight:500, width:70 }}>Qty</th>
                <th style={{ textAlign:'right', padding:'10px 8px', fontSize:10, textTransform:'uppercase', letterSpacing:'0.08em', color:'#5a5749', fontWeight:500, width:100 }}>Rate</th>
                <th style={{ textAlign:'right', padding:'10px 12px', fontSize:10, textTransform:'uppercase', letterSpacing:'0.08em', color:'#5a5749', fontWeight:500, width:120 }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {inv.lines.map((l,i) => (
                <tr key={i} style={{ borderBottom:'1px solid #f4f1ea' }}>
                  <td style={{ padding:'12px' }}>{l.desc}</td>
                  <td className="num mono" style={{ textAlign:'right', padding:'12px 8px' }}>{l.qty % 1 === 0 ? l.qty : l.qty.toFixed(2)}</td>
                  <td className="num mono" style={{ textAlign:'right', padding:'12px 8px' }}>{fmtMoney(l.unit, inv.currency)}</td>
                  <td className="num mono" style={{ textAlign:'right', padding:'12px', fontWeight:500 }}>{fmtMoney(l.amount, inv.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* totals */}
          <div style={{ display:'flex', justifyContent:'flex-end', marginTop:20 }}>
            <div style={{ width:320 }}>
              <div style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize:12 }}>
                <span style={{ color:'#5a5749' }}>Subtotal</span>
                <span className="num mono">{fmtMoney(inv.subtotal, inv.currency)}</span>
              </div>
              {inv.tax > 0 && (
                <div style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize:12 }}>
                  <span style={{ color:'#5a5749' }}>Tax ({Math.round((billing.taxRate||0)*100)}%)</span>
                  <span className="num mono">{fmtMoney(inv.tax, inv.currency)}</span>
                </div>
              )}
              <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderTop:'1px solid #ddd5c5', borderBottom:'2px solid #1a1915', marginTop:4 }}>
                <span style={{ fontWeight:600 }}>Total</span>
                <span className="num mono" style={{ fontSize:16, fontWeight:700 }}>{fmtMoney(inv.total, inv.currency)}</span>
              </div>
              {inv.paid > 0 && (
                <>
                  <div style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize:12, color:'var(--moss-600)' }}>
                    <span>Paid</span>
                    <span className="num mono">−{fmtMoney(inv.paid, inv.currency)}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', background:'var(--teal-50)', borderRadius:4, padding:'10px 12px', marginTop:6 }}>
                    <span style={{ fontWeight:600, color:'var(--teal-700)' }}>Balance due</span>
                    <span className="num mono" style={{ fontSize:14, fontWeight:700, color:'var(--teal-700)' }}>{fmtMoney(balance, inv.currency)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* notes / banking */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginTop:40, paddingTop:24, borderTop:'1px solid #ece7dc' }}>
            <div>
              <div style={{ fontSize:10, color:'#807b69', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Notes</div>
              <div style={{ fontSize:11, lineHeight:1.6, color:'#3d3b33' }}>{inv.notes}</div>
            </div>
            <div>
              <div style={{ fontSize:10, color:'#807b69', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Payment methods</div>
              <div style={{ fontSize:11, lineHeight:1.6, color:'#3d3b33' }}>
                <div><strong>Wire / ACH</strong> — Routing 121000248 · Account 4812-559-221</div>
                <div><strong>Online</strong> — <span style={{ color:'var(--teal-700)', textDecoration:'underline' }}>pay.brillmark.com/{inv.id.toLowerCase()}</span></div>
                <div style={{ marginTop:6, color:'#807b69' }}>Late payments incur 1.5% monthly finance charge after 30 days.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right rail — activity / actions */}
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        <div className="card" style={{ padding:16 }}>
          <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Status</div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12, gap:8, flexWrap:'wrap' }}>
            <StatusChip status={inv.status}/>
            {inv.status === 'overdue' && <span style={{ fontSize:11, color:'var(--rust-600)', fontWeight:500, whiteSpace:'nowrap' }}>{-daysBetween(TODAY,inv.due)} days late</span>}
          </div>
          <div style={{ fontSize:24, fontFamily:'var(--font-display)', fontWeight:600, letterSpacing:'-0.02em' }} className="num">
            {fmtMoney(balance, inv.currency)}
          </div>
          <div style={{ fontSize:11, color:'var(--fg-muted)' }}>balance of {fmtMoney(inv.total, inv.currency)}</div>
          {balance > 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:12 }}>
              <button className="btn btn-accent btn-sm" style={{ justifyContent:'center' }}><I.Dollar size={12}/> Record payment</button>
              <button className="btn btn-sm" style={{ justifyContent:'center' }}><I.Mail size={12}/> Send reminder</button>
            </div>
          )}
        </div>

        <div className="card" style={{ padding:16 }}>
          <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Activity</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[
              inv.status==='overdue' && { t:'Overdue', d: fmtDate(inv.due), tone:'rust', icon:I.Warn },
              inv.viewed && { t:'Client viewed', d:fmtDate(inv.viewed), tone:'teal', icon:I.Eye },
              inv.sent && { t:'Sent via email', d:fmtDate(inv.sent), tone:'ink', icon:I.Send },
              inv.paid>0 && { t:`Received ${fmtMoney(inv.paid, inv.currency)}`, d:fmtDate('2026-03-28'), tone:'moss', icon:I.Dollar },
              { t:'Invoice created', d:fmtDate(inv.issued), tone:'ink', icon:I.FileText },
            ].filter(Boolean).map((a,i)=>{
              const Ic = a.icon;
              const color = { rust:'var(--rust-600)', moss:'var(--moss-600)', teal:'var(--teal-700)', ink:'var(--fg-muted)' }[a.tone];
              return (
                <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                  <div style={{ width:22, height:22, borderRadius:'50%', background:'var(--bg-sunken)', display:'flex', alignItems:'center', justifyContent:'center', color, flex:'none' }}>
                    <Ic size={11}/>
                  </div>
                  <div style={{ minWidth:0, flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:500 }}>{a.t}</div>
                    <div className="meta" style={{ fontSize:10 }}>{a.d}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card" style={{ padding:16 }}>
          <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Reminders</div>
          {REMINDERS.filter(r=>r.invoice===inv.id).length === 0 ? (
            <div className="meta">No reminders scheduled.</div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {REMINDERS.filter(r=>r.invoice===inv.id).map(r => (
                <div key={r.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:12, gap:10 }}>
                  <div style={{ minWidth:0, flex:1 }}>
                    <div style={{ fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{r.step}</div>
                    <div className="meta" style={{ fontSize:10, textTransform:'capitalize' }}>{r.tone} · {r.status}</div>
                  </div>
                  <div className="meta" style={{ fontSize:11, whiteSpace:'nowrap', flex:'none' }}>{fmtDate(r.sendAt)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ——————————————————————————————————————————————
// Create invoice from worklogs
// ——————————————————————————————————————————————
function CreateInvoice({ onBack, onCreated }) {
  const [client, setClient] = uSI('pg');
  const [period, setPeriod] = uSI({ from:'2026-04-01', to:'2026-04-19' });
  const [template, setTemplate] = uSI('worklog');
  const [selected, setSelected] = uSI({}); // worklog ids -> bool
  const [manual, setManual] = uSI([
    { desc:'Fixed-fee: Phase 2 PDP kit', qty:1, unit:11040 },
  ]);
  const [issued, setIssued] = uSI('2026-04-19');
  const [dueDays, setDueDays] = uSI(30);
  const [notes, setNotes] = uSI('');

  const billing = CLIENT_BILLING[client];

  // synthesize eligible worklog lines from TASKS+WORKLOGS+PROJECTS for this client
  const eligibleLines = uMI(() => {
    const clientProjects = PROJECTS.filter(p => p.clientId === client).map(p=>p.id);
    const pTasks = TASKS.filter(t => clientProjects.includes(t.project) && t.billable);
    // Aggregate by task + assignee
    return pTasks.map(t => {
      const person = TEAM.find(m=>m.id===t.assignee) || { name:'—' };
      const proj = projectCode(t.project);
      return {
        id: t.id,
        desc: `${proj} · ${t.title} — ${person.name}`,
        qty: t.actualLOE || 0,
        unit: billing.defaultRate,
        amount: (t.actualLOE||0) * billing.defaultRate,
        date: t.due, // pretend
      };
    }).filter(l => l.qty > 0);
  }, [client, billing]);

  // init all selected when client changes
  uEI(() => {
    const next = {};
    eligibleLines.forEach(l => { next[l.id] = true; });
    setSelected(next);
  }, [client]);

  const pickedLines = eligibleLines.filter(l => selected[l.id]);
  const worklogSubtotal = pickedLines.reduce((s,l)=>s+l.amount, 0);
  const manualSubtotal = manual.reduce((s,l)=>s + (l.qty*l.unit), 0);
  const subtotal = (template==='retainer' ? 0 : worklogSubtotal) + manualSubtotal;
  const tax = subtotal * (billing.taxRate || 0);
  const total = subtotal + tax;

  const addManualLine = () => setManual([...manual, { desc:'', qty:1, unit:0 }]);
  const updateManual = (i, patch) => setManual(manual.map((l,j)=>j===i?{...l,...patch}:l));
  const removeManual = (i) => setManual(manual.filter((_,j)=>j!==i));

  return (
    <div style={{ padding:'20px 24px', display:'grid', gridTemplateColumns:'minmax(0,1fr) 320px', gap:16 }}>
      <div style={{ display:'flex', flexDirection:'column', gap:16, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button className="btn btn-sm" onClick={onBack}><I.ArrowRight size={12} style={{ transform:'rotate(180deg)' }}/> All invoices</button>
          <h1 style={{ margin:0, fontSize:22, fontFamily:'var(--font-display)', fontWeight:600, letterSpacing:'-0.02em', lineHeight:1.15, whiteSpace:'nowrap' }}>Create invoice</h1>
        </div>

        {/* template picker */}
        <div className="card" style={{ padding:16 }}>
          <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Source</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
            {[
              { k:'worklog', title:'From worklogs', sub:'Auto-generated lines from billable tasks', icon:I.Clock },
              { k:'mixed',   title:'Worklog + manual', sub:'Add fixed-fee or expense line items',  icon:I.Edit },
              { k:'retainer',title:'Retainer / fixed fee', sub:'Single amount, no worklog lines',    icon:I.Refresh },
            ].map(opt => {
              const Ic = opt.icon;
              const active = template === opt.k;
              return (
                <button key={opt.k} onClick={()=>setTemplate(opt.k)}
                  style={{
                    padding:14, textAlign:'left',
                    border: active ? '1.5px solid var(--teal-600)' : '1px solid var(--border)',
                    borderRadius:8,
                    background: active ? 'var(--teal-50)' : 'var(--bg-raised)',
                  }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                    <div style={{ width:24, height:24, borderRadius:6, background: active?'var(--teal-600)':'var(--sand-200)', color: active?'#fff':'var(--ink-700)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Ic size={13}/>
                    </div>
                    <div style={{ fontSize:13, fontWeight:600 }}>{opt.title}</div>
                  </div>
                  <div style={{ fontSize:11, color:'var(--fg-muted)' }}>{opt.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* bill-to + period */}
        <div className="card" style={{ padding:16 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:12 }}>
            <div>
              <label style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:4 }}>Client</label>
              <select className="input" value={client} onChange={e=>setClient(e.target.value)} style={{ width:'100%', height:30 }}>
                {CLIENTS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:4 }}>Period from</label>
              <input className="input" type="date" value={period.from} onChange={e=>setPeriod({...period, from:e.target.value})} style={{ width:'100%', height:30 }}/>
            </div>
            <div>
              <label style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:4 }}>Period to</label>
              <input className="input" type="date" value={period.to} onChange={e=>setPeriod({...period, to:e.target.value})} style={{ width:'100%', height:30 }}/>
            </div>
            <div>
              <label style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:4 }}>Terms</label>
              <select className="input" value={dueDays} onChange={e=>setDueDays(+e.target.value)} style={{ width:'100%', height:30 }}>
                <option value={15}>Net 15</option>
                <option value={30}>Net 30</option>
                <option value={45}>Net 45</option>
                <option value={60}>Net 60</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop:10, fontSize:11, color:'var(--fg-muted)', display:'flex', gap:16 }}>
            <span>Currency: <strong className="mono" style={{ color:'var(--fg)' }}>{billing.currency}</strong></span>
            <span>Default rate: <strong className="num mono" style={{ color:'var(--fg)' }}>{fmtMoney(billing.defaultRate, billing.currency)}/hr</strong></span>
            <span>Tax: <strong style={{ color:'var(--fg)' }}>{(billing.taxRate*100).toFixed(0)}%</strong></span>
            {billing.poRequired && <span style={{ color:'var(--ochre-600)' }}>⚠ PO required</span>}
          </div>
        </div>

        {/* worklog lines */}
        {template !== 'retainer' && (
          <div className="card" style={{ overflow:'hidden' }}>
            <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--bg-sunken)' }}>
              <div style={{ fontSize:12, fontWeight:600 }}>Billable worklogs · {period.from} → {period.to}</div>
              <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                <span className="meta">{pickedLines.length} of {eligibleLines.length} selected</span>
                <button className="btn btn-sm" onClick={()=>{
                  const all = {}; eligibleLines.forEach(l => all[l.id] = true); setSelected(all);
                }}>Select all</button>
                <button className="btn btn-sm" onClick={()=>setSelected({})}>Clear</button>
              </div>
            </div>
            <table className="table" style={{ fontSize:12 }}>
              <thead>
                <tr>
                  <th style={{ width:32 }}></th>
                  <th>Line item</th>
                  <th style={{ width:70, textAlign:'right' }}>Hours</th>
                  <th style={{ width:100, textAlign:'right' }}>Rate</th>
                  <th style={{ width:120, textAlign:'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {eligibleLines.map(l => (
                  <tr key={l.id} style={{ opacity: selected[l.id]?1:0.45 }}>
                    <td>
                      <input type="checkbox" checked={!!selected[l.id]} onChange={e=>setSelected({...selected, [l.id]:e.target.checked})}/>
                    </td>
                    <td>{l.desc}</td>
                    <td className="num mono" style={{ textAlign:'right' }}>{l.qty}</td>
                    <td className="num mono" style={{ textAlign:'right' }}>{fmtMoney(l.unit, billing.currency)}</td>
                    <td className="num mono" style={{ textAlign:'right', fontWeight:500 }}>{fmtMoney(l.amount, billing.currency)}</td>
                  </tr>
                ))}
                {eligibleLines.length === 0 && (
                  <tr><td colSpan={5} style={{ padding:24, textAlign:'center', color:'var(--fg-muted)' }}>No billable worklogs in this period.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* manual lines */}
        {template !== 'worklog' && (
          <div className="card" style={{ overflow:'hidden' }}>
            <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--bg-sunken)' }}>
              <div style={{ fontSize:12, fontWeight:600 }}>{template==='retainer' ? 'Retainer / fixed-fee lines' : 'Manual line items'}</div>
              <button className="btn btn-sm" onClick={addManualLine}><I.Plus size={12}/> Add line</button>
            </div>
            <table className="table" style={{ fontSize:12 }}>
              <thead>
                <tr>
                  <th>Description</th>
                  <th style={{ width:70 }}>Qty</th>
                  <th style={{ width:110 }}>Rate</th>
                  <th style={{ width:120, textAlign:'right' }}>Amount</th>
                  <th style={{ width:32 }}/>
                </tr>
              </thead>
              <tbody>
                {manual.map((l,i)=>(
                  <tr key={i}>
                    <td><input className="input" value={l.desc} onChange={e=>updateManual(i,{desc:e.target.value})} style={{ height:26, width:'100%' }}/></td>
                    <td><input className="input num mono" type="number" step="0.5" value={l.qty} onChange={e=>updateManual(i,{qty:+e.target.value})} style={{ height:26, width:'100%' }}/></td>
                    <td><input className="input num mono" type="number" value={l.unit} onChange={e=>updateManual(i,{unit:+e.target.value})} style={{ height:26, width:'100%' }}/></td>
                    <td className="num mono" style={{ textAlign:'right', fontWeight:500 }}>{fmtMoney(l.qty*l.unit, billing.currency)}</td>
                    <td><button className="btn-ghost" onClick={()=>removeManual(i)} style={{ padding:4, color:'var(--fg-muted)' }}><I.Trash size={13}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="card" style={{ padding:16 }}>
          <label style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:6 }}>Notes to client (appears on invoice)</label>
          <textarea className="input" rows={3} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Thank you for your business. Wire transfers preferred for amounts over $5,000." style={{ width:'100%', padding:10, resize:'vertical', height:'auto' }}/>
        </div>
      </div>

      {/* Summary rail */}
      <div style={{ position:'sticky', top:16, display:'flex', flexDirection:'column', gap:12, alignSelf:'flex-start' }}>
        <div className="card" style={{ padding:16 }}>
          <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Summary</div>
          <div style={{ display:'flex', flexDirection:'column', gap:6, fontSize:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span className="meta">Client</span><span style={{ fontWeight:500 }}>{clientName(client)}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span className="meta">Issued</span><span>{fmtDate(issued)}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span className="meta">Due</span>
              <span>{fmtDate(new Date(new Date(issued).getTime() + dueDays*86400000).toISOString().slice(0,10))}</span>
            </div>
          </div>
          <div style={{ height:1, background:'var(--border)', margin:'12px 0' }}/>
          <div style={{ display:'flex', flexDirection:'column', gap:6, fontSize:12 }}>
            {template!=='retainer' && (
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span className="meta">Worklog lines ({pickedLines.length})</span>
                <span className="num mono">{fmtMoney(worklogSubtotal, billing.currency)}</span>
              </div>
            )}
            {template!=='worklog' && (
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span className="meta">Manual lines ({manual.length})</span>
                <span className="num mono">{fmtMoney(manualSubtotal, billing.currency)}</span>
              </div>
            )}
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span className="meta">Subtotal</span>
              <span className="num mono">{fmtMoney(subtotal, billing.currency)}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span className="meta">Tax ({(billing.taxRate*100).toFixed(0)}%)</span>
              <span className="num mono">{fmtMoney(tax, billing.currency)}</span>
            </div>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginTop:12, paddingTop:12, borderTop:'2px solid var(--ink-900)' }}>
            <span style={{ fontWeight:600 }}>Total</span>
            <span className="num mono" style={{ fontSize:18, fontWeight:700 }}>{fmtMoney(total, billing.currency)}</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:14 }}>
            <button className="btn btn-accent" style={{ justifyContent:'center', height:32 }} onClick={onCreated}><I.Send size={12}/> Save & send</button>
            <button className="btn" style={{ justifyContent:'center', height:30 }} onClick={onCreated}><I.FileText size={12}/> Save as draft</button>
            <button className="btn-ghost" style={{ color:'var(--fg-muted)', fontSize:11, padding:'6px 0' }}>
              <I.Refresh size={11}/> Make this recurring…
            </button>
          </div>
        </div>

        <div className="card" style={{ padding:14, background:'var(--teal-50)', border:'1px solid var(--teal-100)' }}>
          <div style={{ fontSize:11, color:'var(--teal-700)', fontWeight:600, marginBottom:4, display:'flex', alignItems:'center', gap:6 }}>
            <I.Sparkle size={11}/> Auto-detected
          </div>
          <div style={{ fontSize:11, color:'var(--ink-700)', lineHeight:1.5 }}>
            {pickedLines.length} tasks with {pickedLines.reduce((s,l)=>s+l.qty,0).toFixed(1)}h of billable time from {PROJECTS.filter(p=>p.clientId===client).length} projects matched your filters.
          </div>
        </div>
      </div>
    </div>
  );
}

// ——————————————————————————————————————————————
// Payments log / reconciliation
// ——————————————————————————————————————————————
function PaymentsLog({ onBack }) {
  const totalReceived = PAYMENTS.filter(p=>p.status==='reconciled').reduce((s,p)=>s + p.amount * ({USD:1,GBP:1.26,EUR:1.08,CAD:0.73}[p.currency]||1), 0);
  const unmatched = PAYMENTS.filter(p=>p.status==='unmatched').length;
  const disputed = PAYMENTS.filter(p=>p.status==='disputed').length;

  return (
    <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <button className="btn btn-sm" onClick={onBack}><I.ArrowRight size={12} style={{ transform:'rotate(180deg)' }}/> All invoices</button>
        <h1 style={{ margin:0, fontSize:22, fontFamily:'var(--font-display)', fontWeight:600, letterSpacing:'-0.02em', lineHeight:1.15, whiteSpace:'nowrap' }}>Payments</h1>
        <div style={{ flex:1 }}/>
        <button className="btn btn-sm"><I.Download size={12}/> Export</button>
        <button className="btn btn-accent btn-sm"><I.Plus size={12}/> Record payment</button>
      </div>

      <div style={{ display:'flex', gap:12 }}>
        <StatCard label="Received (normalized USD)" value={'$'+Math.round(totalReceived).toLocaleString()} sub="last 30 days · 3 reconciled" tone="moss" icon={I.Dollar}/>
        <StatCard label="Unmatched" value={unmatched} sub="need manual matching" tone="ochre" icon={I.Warn}/>
        <StatCard label="Disputed" value={disputed} sub="Stripe chargeback pending" tone="rust" icon={I.Warn}/>
        <StatCard label="Stripe balance" value="$4,812.50" sub="next payout Apr 21" tone="teal" icon={I.CreditCard}/>
      </div>

      {unmatched > 0 && (
        <div style={{ padding:'12px 14px', background:'var(--ochre-50)', border:'1px solid var(--ochre-100)', borderRadius:8, display:'flex', alignItems:'center', gap:10 }}>
          <I.Warn size={14} style={{ color:'var(--ochre-600)', flex:'none' }}/>
          <div style={{ fontSize:12, flex:1 }}>
            <strong>1 unmatched payment</strong> — $1,250 from "MK Limited" on Apr 15. No invoice reference was included in the Stripe metadata.
          </div>
          <button className="btn btn-sm">Match to invoice…</button>
        </div>
      )}

      <div className="card" style={{ overflow:'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width:110 }}>Date</th>
              <th style={{ width:150 }}>Invoice</th>
              <th>Client</th>
              <th style={{ width:100 }}>Method</th>
              <th style={{ width:180 }}>Reference</th>
              <th style={{ width:140, textAlign:'right' }}>Amount</th>
              <th style={{ width:120 }}>Status</th>
              <th style={{ width:32 }}/>
            </tr>
          </thead>
          <tbody>
            {PAYMENTS.map(p => {
              const inv = INVOICES.find(i=>i.id===p.invoice);
              const tone = { reconciled:'moss', unmatched:'ochre', disputed:'rust' }[p.status];
              return (
                <tr key={p.id}>
                  <td className="meta">{fmtDate(p.date)}</td>
                  <td className="mono" style={{ fontSize:12 }}>
                    {p.invoice ? p.invoice : <span style={{ color:'var(--ochre-600)' }}>— unmatched —</span>}
                  </td>
                  <td>{inv ? clientName(inv.client) : <span className="meta">MK Limited (?)</span>}</td>
                  <td>
                    <span className="chip chip-ink"><I.CreditCard size={10}/>{p.method}</span>
                  </td>
                  <td className="mono meta" style={{ fontSize:11 }}>{p.ref}</td>
                  <td className="num mono" style={{ textAlign:'right', fontWeight:500 }}>{fmtMoney(p.amount, p.currency)}</td>
                  <td>
                    <span className={`chip chip-${tone}`} style={{ textTransform:'capitalize' }}>
                      <span className="chip-dot"/>{p.status}
                    </span>
                  </td>
                  <td><button className="btn-ghost" style={{ padding:4, color:'var(--fg-muted)' }}><I.More size={14}/></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ——————————————————————————————————————————————
// Reminders / dunning
// ——————————————————————————————————————————————
function RemindersView({ onBack }) {
  const sequence = [
    { step:'Gentle nudge',   offset:'+3d', tone:'friendly', subject:'A friendly note on invoice {{id}}', enabled:true },
    { step:'1st reminder',   offset:'+7d', tone:'friendly', subject:'Invoice {{id}} is now {{daysLate}} days overdue', enabled:true },
    { step:'2nd reminder',   offset:'+14d',tone:'firm',     subject:'2nd notice: invoice {{id}}', enabled:true },
    { step:'3rd reminder',   offset:'+30d',tone:'firm',     subject:'Action required on invoice {{id}}', enabled:true },
    { step:'Final notice',   offset:'+45d',tone:'legal',    subject:'Final notice — collections escalation', enabled:false },
  ];

  return (
    <div style={{ padding:'20px 24px', display:'grid', gridTemplateColumns:'minmax(0,1fr) 360px', gap:16 }}>
      <div style={{ display:'flex', flexDirection:'column', gap:16, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button className="btn btn-sm" onClick={onBack}><I.ArrowRight size={12} style={{ transform:'rotate(180deg)' }}/> All invoices</button>
          <h1 style={{ margin:0, fontSize:22, fontFamily:'var(--font-display)', fontWeight:600, letterSpacing:'-0.02em', lineHeight:1.15, whiteSpace:'nowrap' }}>Reminders & dunning</h1>
          <div style={{ flex:1 }}/>
          <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--fg-muted)' }}>
            <input type="checkbox" defaultChecked/> Auto-send enabled
          </label>
        </div>

        <div className="card" style={{ padding:16 }}>
          <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Automation sequence</div>
          <div style={{ display:'flex', flexDirection:'column' }}>
            {sequence.map((s, i) => (
              <div key={i} style={{
                display:'grid', gridTemplateColumns:'24px 120px 1fr 80px 60px',
                alignItems:'center', padding:'12px 0',
                borderBottom: i<sequence.length-1 ? '1px solid var(--border)' : 'none',
                opacity: s.enabled ? 1 : 0.45,
              }}>
                <div style={{
                  width:24, height:24, borderRadius:'50%',
                  background: s.enabled ? 'var(--teal-600)' : 'var(--sand-200)',
                  color: s.enabled ? '#fff' : 'var(--ink-500)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontFamily:'var(--font-mono)', fontSize:10, fontWeight:600,
                }}>{i+1}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{s.step}</div>
                  <div className="meta" style={{ fontSize:11 }}>After due date <span className="mono">{s.offset}</span></div>
                </div>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.subject}</div>
                  <div className="meta" style={{ fontSize:11, textTransform:'capitalize' }}>
                    <span style={{ color: s.tone==='legal'?'var(--rust-600)':s.tone==='firm'?'var(--ochre-600)':'var(--teal-700)' }}>● </span>
                    {s.tone} tone
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <button className="btn-ghost" style={{ fontSize:11, color:'var(--fg-muted)' }}>Edit</button>
                </div>
                <div style={{ textAlign:'right' }}>
                  <label className="switch" style={{ position:'relative', display:'inline-block', width:32, height:18 }}>
                    <input type="checkbox" defaultChecked={s.enabled} style={{ opacity:0, width:0, height:0 }}/>
                    <span style={{ position:'absolute', inset:0, background: s.enabled?'var(--teal-600)':'var(--sand-300)', borderRadius:10, transition:'120ms' }}>
                      <span style={{ position:'absolute', top:2, left: s.enabled?16:2, width:14, height:14, background:'#fff', borderRadius:'50%', transition:'120ms' }}/>
                    </span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ overflow:'hidden' }}>
          <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', background:'var(--bg-sunken)', fontSize:12, fontWeight:600 }}>
            Scheduled & recent
          </div>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width:120 }}>Invoice</th>
                <th>Client</th>
                <th style={{ width:130 }}>Step</th>
                <th style={{ width:90 }}>Tone</th>
                <th style={{ width:110 }}>When</th>
                <th style={{ width:110 }}>Status</th>
                <th style={{ width:100, textAlign:'right' }}/>
              </tr>
            </thead>
            <tbody>
              {REMINDERS.map(r => {
                const inv = INVOICES.find(i=>i.id===r.invoice);
                const statusChip = { sent:'moss', queued:'ochre', scheduled:'blue' }[r.status];
                return (
                  <tr key={r.id}>
                    <td className="mono" style={{ fontSize:12 }}>{r.invoice}</td>
                    <td>{inv && clientName(inv.client)}</td>
                    <td>{r.step}</td>
                    <td style={{ textTransform:'capitalize' }}>{r.tone}</td>
                    <td className="meta">{fmtDate(r.sendAt)}</td>
                    <td><span className={`chip chip-${statusChip}`} style={{ textTransform:'capitalize' }}><span className="chip-dot"/>{r.status}</span></td>
                    <td style={{ textAlign:'right' }}>
                      {r.status !== 'sent' && <button className="btn btn-sm">Send now</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right — email preview */}
      <div style={{ position:'sticky', top:16, alignSelf:'flex-start' }}>
        <div className="card" style={{ overflow:'hidden' }}>
          <div style={{ padding:'10px 14px', background:'var(--bg-sunken)', borderBottom:'1px solid var(--border)', fontSize:11, fontWeight:600 }}>
            Email preview · 2nd reminder
          </div>
          <div style={{ padding:20, fontSize:12, lineHeight:1.6, background:'#fff' }}>
            <div style={{ fontSize:11, color:'#807b69', marginBottom:14 }}>
              <div><strong style={{ color:'#1a1915' }}>To:</strong> ap@wildbrands.co</div>
              <div><strong style={{ color:'#1a1915' }}>From:</strong> billing@brillmark.com</div>
              <div><strong style={{ color:'#1a1915' }}>Subject:</strong> 2nd notice: invoice INV-2026-0042</div>
            </div>
            <div style={{ height:1, background:'#ece7dc', margin:'12px 0' }}/>
            <div style={{ color:'#1a1915' }}>
              <p>Hi Marcus,</p>
              <p>Invoice <strong>INV-2026-0042</strong> for <strong>$10,890.00</strong> was due on March 15 and is now <strong style={{ color:'var(--rust-600)' }}>35 days overdue</strong>.</p>
              <p>Could you confirm when we can expect payment? If there's a blocker on your end, please let me know — happy to discuss a revised schedule.</p>
              <div style={{ padding:14, background:'var(--teal-50)', border:'1px solid var(--teal-100)', borderRadius:6, textAlign:'center', margin:'14px 0' }}>
                <div style={{ fontSize:11, color:'var(--teal-700)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Pay online</div>
                <div style={{ fontSize:13, fontWeight:600 }}>pay.brillmark.com/inv-2026-0042</div>
              </div>
              <p>Thanks,<br/>Fahim · Brillmark Billing</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ——————————————————————————————————————————————
// Recurring schedules
// ——————————————————————————————————————————————
function RecurringView({ onBack }) {
  return (
    <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <button className="btn btn-sm" onClick={onBack}><I.ArrowRight size={12} style={{ transform:'rotate(180deg)' }}/> All invoices</button>
        <h1 style={{ margin:0, fontSize:22, fontFamily:'var(--font-display)', fontWeight:600, letterSpacing:'-0.02em', lineHeight:1.15, whiteSpace:'nowrap' }}>Recurring schedules</h1>
        <div style={{ flex:1 }}/>
        <button className="btn btn-accent btn-sm"><I.Plus size={12}/> New schedule</button>
      </div>

      <div style={{ display:'flex', gap:12 }}>
        <StatCard label="Active schedules" value={RECURRING.filter(r=>r.active).length} sub="generating invoices automatically" tone="teal" icon={I.Refresh}/>
        <StatCard label="MRR (normalized USD)" value="$26,400" sub="from 3 active retainers" tone="moss" icon={I.Dollar}/>
        <StatCard label="Next 30 days" value="4 invoices" sub="will auto-generate" icon={I.Calendar}/>
      </div>

      <div className="card" style={{ overflow:'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Schedule</th>
              <th style={{ width:140 }}>Client</th>
              <th style={{ width:110 }}>Cadence</th>
              <th style={{ width:110 }}>Next run</th>
              <th style={{ width:140, textAlign:'right' }}>Amount</th>
              <th style={{ width:90 }}>Status</th>
              <th style={{ width:32 }}/>
            </tr>
          </thead>
          <tbody>
            {RECURRING.map(r => (
              <tr key={r.id}>
                <td>
                  <div style={{ fontWeight:500 }}>{r.name}</div>
                  <div className="meta" style={{ fontSize:11 }}>
                    Day {r.dayOfMonth} · template: {r.template}{r.createdFrom && <span> · cloned from <span className="mono">{r.createdFrom}</span></span>}
                  </div>
                </td>
                <td>{clientName(r.client)}</td>
                <td>{r.cadence}</td>
                <td>{fmtDate(r.next)}</td>
                <td className="num mono" style={{ textAlign:'right', fontWeight:500 }}>{fmtMoney(r.amount, r.currency)}</td>
                <td>
                  {r.active ? <span className="chip chip-moss"><span className="chip-dot"/>Active</span> : <span className="chip chip-ink"><span className="chip-dot"/>Paused</span>}
                </td>
                <td><button className="btn-ghost" style={{ padding:4, color:'var(--fg-muted)' }}><I.More size={14}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ——————————————————————————————————————————————
// Client billing profiles
// ——————————————————————————————————————————————
function ClientBillingView({ onBack }) {
  const [selected, setSelected] = uSI('hp');
  const b = CLIENT_BILLING[selected];
  const clientObj = CLIENTS.find(c=>c.id===selected);
  const invoicesForClient = INVOICES.filter(i=>i.client===selected);
  const lifetimeValue = invoicesForClient.reduce((s,i)=>s + i.total * ({USD:1,GBP:1.26,EUR:1.08,CAD:0.73}[i.currency]||1), 0);

  return (
    <div style={{ padding:'20px 24px', display:'grid', gridTemplateColumns:'260px minmax(0,1fr)', gap:16 }}>
      <div>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
          <button className="btn btn-sm" onClick={onBack}><I.ArrowRight size={12} style={{ transform:'rotate(180deg)' }}/> Back</button>
        </div>
        <div className="card" style={{ overflow:'hidden' }}>
          <div style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)', background:'var(--bg-sunken)', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--fg-muted)' }}>
            Clients
          </div>
          {CLIENTS.map(c => (
            <button key={c.id} onClick={()=>setSelected(c.id)}
              style={{
                width:'100%', padding:'10px 14px', display:'flex', alignItems:'center', gap:10,
                borderBottom:'1px solid var(--border)',
                background: selected===c.id ? 'var(--teal-50)' : 'var(--bg-raised)',
                textAlign:'left',
              }}>
              <div style={{
                width:28, height:28, borderRadius:6,
                background:'var(--sand-200)', color:'var(--ink-700)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily:'var(--font-mono)', fontSize:10, fontWeight:600,
              }}>{c.name.split(' ').map(s=>s[0]).join('').slice(0,2)}</div>
              <div style={{ minWidth:0, flex:1 }}>
                <div style={{ fontSize:12, fontWeight: selected===c.id?600:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.name}</div>
                <div className="meta" style={{ fontSize:10 }}>{(CLIENT_BILLING[c.id]||{}).currency} · {(CLIENT_BILLING[c.id]||{}).terms}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:16 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Billing profile</div>
            <h1 style={{ margin:'4px 0 0', fontSize:22, fontFamily:'var(--font-display)', fontWeight:600, letterSpacing:'-0.02em', lineHeight:1.15, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{clientObj.name}</h1>
            <div style={{ fontSize:12, color:'var(--fg-muted)', marginTop:4 }}>{clientObj.projects} projects · {clientObj.hours}h logged · LTV ~${Math.round(lifetimeValue/1000)}k USD</div>
          </div>
          <button className="btn btn-accent btn-sm"><I.Edit size={12}/> Edit profile</button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div className="card" style={{ padding:16 }}>
            <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>Billing terms</div>
            <div style={{ display:'grid', gridTemplateColumns:'120px 1fr', rowGap:8, fontSize:12 }}>
              <span className="meta">Currency</span><span className="mono" style={{ fontWeight:500 }}>{b.currency} · {CURRENCIES[b.currency].symbol}</span>
              <span className="meta">Default rate</span><span className="num mono" style={{ fontWeight:500 }}>{fmtMoney(b.defaultRate, b.currency)}/hr</span>
              <span className="meta">Tax rate</span><span>{(b.taxRate*100).toFixed(0)}% {b.taxRate>0 && <span className="meta">(applied to subtotal)</span>}</span>
              <span className="meta">Payment terms</span><span>{b.terms}</span>
              <span className="meta">PO required</span><span>{b.poRequired ? <span className="chip chip-ochre">Yes — before sending</span> : <span className="meta">Not required</span>}</span>
              <span className="meta">Late fee</span><span>1.5% monthly after 30 days</span>
            </div>
          </div>
          <div className="card" style={{ padding:16 }}>
            <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>Billing contact</div>
            <div style={{ display:'grid', gridTemplateColumns:'120px 1fr', rowGap:8, fontSize:12 }}>
              <span className="meta">Contact</span><span>{b.contactName}</span>
              <span className="meta">Email</span><span style={{ color:'var(--teal-700)' }}>{b.contactEmail}</span>
              <span className="meta">Billing address</span>
              <span style={{ whiteSpace:'pre-line' }}>{b.address}</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ overflow:'hidden' }}>
          <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', background:'var(--bg-sunken)', display:'flex', justifyContent:'space-between' }}>
            <div style={{ fontSize:12, fontWeight:600, whiteSpace:'nowrap' }}>Invoice history</div>
            <span className="meta" style={{ whiteSpace:'nowrap' }}>{invoicesForClient.length} invoices · {fmtMoney(invoicesForClient.reduce((s,i)=>s+i.total,0), b.currency)} lifetime</span>
          </div>
          {invoicesForClient.length === 0 ? (
            <div style={{ padding:24, textAlign:'center', color:'var(--fg-muted)' }}>No invoices yet.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width:130 }}>Invoice</th>
                  <th style={{ width:110 }}>Issued</th>
                  <th style={{ width:110 }}>Due</th>
                  <th style={{ width:110 }}>Status</th>
                  <th style={{ textAlign:'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoicesForClient.map(i => (
                  <tr key={i.id}>
                    <td className="mono" style={{ fontSize:12 }}>{i.id}</td>
                    <td className="meta">{fmtDate(i.issued)}</td>
                    <td className="meta">{fmtDate(i.due)}</td>
                    <td><StatusChip status={i.status}/></td>
                    <td className="num mono" style={{ textAlign:'right', fontWeight:500 }}>{fmtMoney(i.total, i.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ——————————————————————————————————————————————
// Top-level router within module
// ——————————————————————————————————————————————
function InvoicesScreen() {
  const [view, setView] = uSI(() => {
    try { return localStorage.getItem('trakio.invview') || 'list'; } catch { return 'list'; }
  });
  const [invoiceId, setInvoiceId] = uSI(() => {
    try { return localStorage.getItem('trakio.invid') || INVOICES[0].id; } catch { return INVOICES[0].id; }
  });
  uEI(() => { try { localStorage.setItem('trakio.invview', view); localStorage.setItem('trakio.invid', invoiceId); } catch {} }, [view, invoiceId]);

  if (view === 'detail')   return <InvoiceDetail invoiceId={invoiceId} onBack={()=>setView('list')}/>;
  if (view === 'create')   return <CreateInvoice onBack={()=>setView('list')} onCreated={()=>setView('list')}/>;
  if (view === 'payments') return <PaymentsLog onBack={()=>setView('list')}/>;
  if (view === 'reminders')return <RemindersView onBack={()=>setView('list')}/>;
  if (view === 'recurring')return <RecurringView onBack={()=>setView('list')}/>;
  if (view === 'billing')  return <ClientBillingView onBack={()=>setView('list')}/>;
  if (view === 'timeline') return <InvoicesTimeline onOpen={(id)=>{ setInvoiceId(id); setView('detail'); }} setView={setView}/>;
  return <InvoicesList
    onOpen={(id)=>{ setInvoiceId(id); setView('detail'); }}
    onCreate={()=>setView('create')}
    view={view}
    setView={setView}
  />;
}

window.InvoicesScreen = InvoicesScreen;
