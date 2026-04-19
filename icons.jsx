// Icons — hand-tuned 16px strokes, consistent 1.5 stroke weight
// Each icon accepts { size, className, style }

const Icon = ({ path, size = 16, className, style, fill = 'none', stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" className={className} style={style}
    fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {path}
  </svg>
);

const I = {
  Dashboard: (p) => <Icon {...p} path={<>
    <rect x="2" y="2" width="5.5" height="5.5" rx="1"/>
    <rect x="8.5" y="2" width="5.5" height="5.5" rx="1"/>
    <rect x="2" y="8.5" width="5.5" height="5.5" rx="1"/>
    <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1"/>
  </>}/>,
  Check: (p) => <Icon {...p} path={<>
    <path d="M2.5 5.5h7M2.5 8.5h4M2.5 11.5h9"/>
    <path d="M11 5.5l1.5 1.5L15 4.5" stroke="currentColor"/>
  </>}/>,
  Clock: (p) => <Icon {...p} path={<>
    <circle cx="8" cy="8" r="6"/>
    <path d="M8 4.5V8l2.5 1.5"/>
  </>}/>,
  Layers: (p) => <Icon {...p} path={<>
    <path d="M8 2L2 5l6 3 6-3-6-3z"/>
    <path d="M2 8l6 3 6-3"/>
    <path d="M2 11l6 3 6-3"/>
  </>}/>,
  Folder: (p) => <Icon {...p} path={<>
    <path d="M2 4.5a1 1 0 011-1h3l1.5 1.5H13a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1v-7.5z"/>
  </>}/>,
  Users: (p) => <Icon {...p} path={<>
    <circle cx="6" cy="6" r="2.5"/>
    <path d="M2 13c0-2.2 1.8-4 4-4s4 1.8 4 4"/>
    <circle cx="11" cy="5.5" r="2"/>
    <path d="M10 9.5c2 0 4 1.3 4 3.5"/>
  </>}/>,
  UserCheck: (p) => <Icon {...p} path={<>
    <circle cx="6" cy="5.5" r="2.5"/>
    <path d="M2 13c0-2.2 1.8-4 4-4s4 1.8 4 4"/>
    <path d="M10.5 9l1.5 1.5L15 7"/>
  </>}/>,
  Settings: (p) => <Icon {...p} path={<>
    <circle cx="8" cy="8" r="2"/>
    <path d="M13 8a5 5 0 00-.08-.9l1.3-1-1.3-2.2-1.5.5a5 5 0 00-1.5-.9L9.7 2h-2.4l-.2 1.5a5 5 0 00-1.5.9l-1.5-.5-1.3 2.2 1.3 1A5 5 0 003 8c0 .3 0 .6.08.9l-1.3 1 1.3 2.2 1.5-.5a5 5 0 001.5.9l.2 1.5h2.4l.2-1.5a5 5 0 001.5-.9l1.5.5 1.3-2.2-1.3-1A5 5 0 0013 8z"/>
  </>}/>,
  Chart: (p) => <Icon {...p} path={<>
    <path d="M2 13.5V2.5M2 13.5h11.5"/>
    <path d="M5 11V8M8 11V5M11 11V9"/>
  </>}/>,
  Bell: (p) => <Icon {...p} path={<>
    <path d="M4 10V7a4 4 0 018 0v3l1 1.5H3L4 10z"/>
    <path d="M6.5 13a1.5 1.5 0 003 0"/>
  </>}/>,
  Search: (p) => <Icon {...p} path={<>
    <circle cx="7" cy="7" r="4.5"/>
    <path d="M10.5 10.5L14 14"/>
  </>}/>,
  Plus: (p) => <Icon {...p} path={<>
    <path d="M8 3v10M3 8h10"/>
  </>}/>,
  Chevron: (p) => <Icon {...p} path={<>
    <path d="M5 3l4 5-4 5"/>
  </>}/>,
  ChevronDown: (p) => <Icon {...p} path={<>
    <path d="M3 5l5 4 5-4"/>
  </>}/>,
  ChevronUp: (p) => <Icon {...p} path={<>
    <path d="M3 11l5-4 5 4"/>
  </>}/>,
  ArrowRight: (p) => <Icon {...p} path={<>
    <path d="M3 8h10M9 4l4 4-4 4"/>
  </>}/>,
  Filter: (p) => <Icon {...p} path={<>
    <path d="M2 3.5h12L10 9v4l-4-2V9L2 3.5z"/>
  </>}/>,
  Sort: (p) => <Icon {...p} path={<>
    <path d="M4 3v10M4 3l-2 2M4 3l2 2M12 13V3M12 13l-2-2M12 13l2-2"/>
  </>}/>,
  More: (p) => <Icon {...p} path={<>
    <circle cx="3.5" cy="8" r="1" fill="currentColor"/>
    <circle cx="8" cy="8" r="1" fill="currentColor"/>
    <circle cx="12.5" cy="8" r="1" fill="currentColor"/>
  </>}/>,
  Play: (p) => <Icon {...p} path={<>
    <path d="M4 3v10l9-5-9-5z" fill="currentColor"/>
  </>}/>,
  Pause: (p) => <Icon {...p} path={<>
    <rect x="4" y="3" width="3" height="10" fill="currentColor"/>
    <rect x="9" y="3" width="3" height="10" fill="currentColor"/>
  </>}/>,
  Slack: (p) => <Icon {...p} path={<>
    <rect x="2" y="7" width="4" height="2" rx="1"/>
    <rect x="10" y="7" width="4" height="2" rx="1"/>
    <rect x="7" y="2" width="2" height="4" rx="1"/>
    <rect x="7" y="10" width="2" height="4" rx="1"/>
    <rect x="6" y="6" width="4" height="4"/>
  </>}/>,
  Edit: (p) => <Icon {...p} path={<>
    <path d="M11 2l3 3-8 8H3v-3l8-8z"/>
  </>}/>,
  Trash: (p) => <Icon {...p} path={<>
    <path d="M3 4.5h10M6 4.5V3a1 1 0 011-1h2a1 1 0 011 1v1.5M4 4.5L5 14h6l1-9.5"/>
  </>}/>,
  Calendar: (p) => <Icon {...p} path={<>
    <rect x="2.5" y="3.5" width="11" height="10" rx="1"/>
    <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3"/>
  </>}/>,
  Download: (p) => <Icon {...p} path={<>
    <path d="M8 2v8M4.5 7L8 10.5 11.5 7M3 13h10"/>
  </>}/>,
  Lock: (p) => <Icon {...p} path={<>
    <rect x="3" y="7" width="10" height="7" rx="1"/>
    <path d="M5 7V5a3 3 0 016 0v2"/>
  </>}/>,
  Circle: (p) => <Icon {...p} path={<>
    <circle cx="8" cy="8" r="5"/>
  </>}/>,
  Dot: (p) => <Icon {...p} path={<>
    <circle cx="8" cy="8" r="3" fill="currentColor" stroke="none"/>
  </>}/>,
  Sidebar: (p) => <Icon {...p} path={<>
    <rect x="2" y="3" width="12" height="10" rx="1"/>
    <path d="M6 3v10"/>
  </>}/>,
  Eye: (p) => <Icon {...p} path={<>
    <path d="M1.5 8s2.5-5 6.5-5 6.5 5 6.5 5-2.5 5-6.5 5-6.5-5-6.5-5z"/>
    <circle cx="8" cy="8" r="2"/>
  </>}/>,
  FileText: (p) => <Icon {...p} path={<>
    <path d="M3 2.5h6l4 4V13a1 1 0 01-1 1H3a1 1 0 01-1-1V3.5a1 1 0 011-1z"/>
    <path d="M9 2.5v4h4M5 9h6M5 11.5h4"/>
  </>}/>,
  Warn: (p) => <Icon {...p} path={<>
    <path d="M8 2l7 12H1L8 2z"/>
    <path d="M8 6v4M8 12.5v.1" stroke="currentColor"/>
  </>}/>,
  ArrowUp: (p) => <Icon {...p} path={<>
    <path d="M8 13V3M4 7l4-4 4 4"/>
  </>}/>,
  ArrowDown: (p) => <Icon {...p} path={<>
    <path d="M8 3v10M4 9l4 4 4-4"/>
  </>}/>,
  Target: (p) => <Icon {...p} path={<>
    <circle cx="8" cy="8" r="6"/>
    <circle cx="8" cy="8" r="3"/>
    <circle cx="8" cy="8" r="0.5" fill="currentColor"/>
  </>}/>,
  Close: (p) => <Icon {...p} path={<>
    <path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/>
  </>}/>,
  Sparkle: (p) => <Icon {...p} path={<>
    <path d="M8 2l1.5 4.5L14 8l-4.5 1.5L8 14l-1.5-4.5L2 8l4.5-1.5L8 2z"/>
  </>}/>,
  Receipt: (p) => <Icon {...p} path={<>
    <path d="M3 2v12l2-1 2 1 2-1 2 1 2-1V2z"/>
    <path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3"/>
  </>}/>,
  CreditCard: (p) => <Icon {...p} path={<>
    <rect x="1.5" y="3.5" width="13" height="9" rx="1.5"/>
    <path d="M1.5 6.5h13M3.5 10h2"/>
  </>}/>,
  Send: (p) => <Icon {...p} path={<>
    <path d="M14 2L2 7l5 2 2 5 5-12z"/>
    <path d="M7 9l3-3"/>
  </>}/>,
  Refresh: (p) => <Icon {...p} path={<>
    <path d="M13.5 8a5.5 5.5 0 11-1.6-3.9"/>
    <path d="M13.5 2.5v3h-3"/>
  </>}/>,
  Mail: (p) => <Icon {...p} path={<>
    <rect x="2" y="3.5" width="12" height="9" rx="1"/>
    <path d="M2.5 4.5l5.5 4 5.5-4"/>
  </>}/>,
  Link: (p) => <Icon {...p} path={<>
    <path d="M7 9l-2 2a2.5 2.5 0 01-3.5-3.5l2-2a2.5 2.5 0 013.5 0"/>
    <path d="M9 7l2-2a2.5 2.5 0 013.5 3.5l-2 2a2.5 2.5 0 01-3.5 0"/>
  </>}/>,
  Dollar: (p) => <Icon {...p} path={<>
    <path d="M8 2v12M11 5H6.5a2 2 0 000 4h3a2 2 0 010 4H5"/>
  </>}/>,
  Copy: (p) => <Icon {...p} path={<>
    <rect x="4" y="4" width="9" height="9" rx="1"/>
    <path d="M4 11H3a1 1 0 01-1-1V3a1 1 0 011-1h7a1 1 0 011 1v1"/>
  </>}/>,
  Print: (p) => <Icon {...p} path={<>
    <path d="M4 6V2.5h8V6"/>
    <rect x="2" y="6" width="12" height="6" rx="1"/>
    <rect x="4" y="10" width="8" height="3.5"/>
  </>}/>,
  Globe: (p) => <Icon {...p} path={<>
    <circle cx="8" cy="8" r="6"/>
    <path d="M2 8h12M8 2c2 2 2.5 4 2.5 6s-.5 4-2.5 6c-2-2-2.5-4-2.5-6S6 4 8 2z"/>
  </>}/>,
};

window.I = I;
