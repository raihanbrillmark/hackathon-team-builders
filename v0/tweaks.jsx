// Tweaks panel — theme, font, sidebar style
const { useState: uST, useEffect: uET } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "font": "grotesk",
  "sidebar": "expanded",
  "density": "compact"
}/*EDITMODE-END*/;

function TweaksPanel({ open, onClose, tweaks, setTweaks }) {
  if (!open) return null;

  const set = (k, v) => {
    const next = { ...tweaks, [k]: v };
    setTweaks(next);
    window.parent.postMessage({ type:'__edit_mode_set_keys', edits:{ [k]:v } }, '*');
  };

  return (
    <div style={{
      position:'fixed', bottom:16, right:16, width:280,
      background:'var(--bg-raised)', border:'1px solid var(--border)',
      borderRadius:10, boxShadow:'var(--shadow-lg)',
      zIndex:100, overflow:'hidden',
    }}>
      <div style={{ padding:'10px 12px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid var(--border)', background:'var(--bg-sunken)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:600 }}>
          <I.Sparkle size={12}/> Tweaks
        </div>
        <button className="btn-ghost" onClick={onClose} style={{ padding:2, color:'var(--fg-muted)' }}><I.Close size={12}/></button>
      </div>

      <div style={{ padding:12, display:'flex', flexDirection:'column', gap:14 }}>
        <div>
          <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Theme</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:4 }}>
            {[
              { k:'light', label:'Light', bg:'#faf8f4', fg:'#1a1915' },
              { k:'dark', label:'Dark', bg:'#15140f', fg:'#f4f1ea' },
              { k:'sepia', label:'Sepia', bg:'#f2e8d5', fg:'#2e2415' },
            ].map(t=>(
              <button key={t.k} onClick={()=>set('theme',t.k)} style={{
                padding:8, borderRadius:6,
                border: tweaks.theme===t.k ? '1.5px solid var(--ink-900)' : '1px solid var(--border)',
                background:'var(--bg-sunken)',
              }}>
                <div style={{ height:28, borderRadius:4, background:t.bg, border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', color:t.fg, fontSize:10, fontWeight:600 }}>Aa</div>
                <div style={{ fontSize:10, marginTop:4 }}>{t.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Font pairing</div>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {[
              { k:'grotesk', label:'Inter Tight + JetBrains', sub:'Default grotesk' },
              { k:'serif', label:'Fraunces + JetBrains', sub:'Editorial serif' },
              { k:'mono-first', label:'IBM Plex Sans + Mono', sub:'Technical' },
            ].map(f=>(
              <button key={f.k} onClick={()=>set('font',f.k)} style={{
                padding:'8px 10px', borderRadius:6, textAlign:'left',
                border: tweaks.font===f.k ? '1.5px solid var(--ink-900)' : '1px solid var(--border)',
                background:'var(--bg-sunken)',
              }}>
                <div style={{ fontSize:12, fontWeight:500 }}>{f.label}</div>
                <div className="meta" style={{ fontSize:10 }}>{f.sub}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Sidebar</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:4 }}>
            {[
              { k:'expanded', label:'Full' },
              { k:'collapsed', label:'Icons' },
              { k:'hidden', label:'Hidden' },
            ].map(s=>(
              <button key={s.k} onClick={()=>set('sidebar', s.k)} style={{
                padding:'6px 8px', borderRadius:6, fontSize:11, fontWeight:500,
                border: tweaks.sidebar===s.k ? '1.5px solid var(--ink-900)' : '1px solid var(--border)',
                background:'var(--bg-sunken)',
              }}>{s.label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.TweaksPanel = TweaksPanel;
window.TWEAK_DEFAULTS = TWEAK_DEFAULTS;
