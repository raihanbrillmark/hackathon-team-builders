// Mock data for Trakio
const TEAM = [
  { id: 'fh', name: 'Fahim Al Huq', email: 'fahim@brillmark.com', role: 'pm', color: '#b8583b' },
  { id: 'ar', name: 'Andalib Rahman', email: 'andalib@brillmark.com', role: 'pm', color: '#4a6b3e' },
  { id: 'rs', name: 'Raihan Sharif', email: 'raihan@brillmark.com', role: 'admin', color: '#3b5a7a' },
  { id: 'na', name: 'Nabila Ahmed', email: 'nabila@brillmark.com', role: 'dev', color: '#9a7a1f' },
  { id: 'sm', name: 'Samir Mahmud', email: 'samir@brillmark.com', role: 'dev', color: '#5c4a7a' },
  { id: 'ti', name: 'Tasnim Islam', email: 'tasnim@brillmark.com', role: 'qa', color: '#7a5c4a' },
  { id: 'ka', name: 'Karim Akbar', email: 'karim@brillmark.com', role: 'dev', color: '#4a7a6b' },
  { id: 'mh', name: 'Maya Hasan', email: 'maya@brillmark.com', role: 'designer', color: '#7a4a5c' },
];

const CLIENTS = [
  { id: 'wb', name: 'Wild Brands', projects: 3, hours: 340 },
  { id: 'hp', name: 'Hardy Party', projects: 4, hours: 612 },
  { id: 'pg', name: 'Powergoat', projects: 2, hours: 188 },
  { id: 'tn', name: 'Tooth and Nail', projects: 5, hours: 890 },
  { id: 'ko', name: 'Koda Outdoors', projects: 2, hours: 245 },
  { id: 'fv', name: 'Fieldview Co.', projects: 1, hours: 52 },
];

const PROJECTS = [
  { id:'wbtd', code:'WBTD', name:'Wild Brands Test Development', slug:'wild-brands-test-development', client:'Wild Brands', clientId:'wb', createdBy:'fh', status:'ongoing', budget:120, billable:78.5, total:98, recurring:'Year', created:'Jan 16, 2025', priority:'high' },
  { id:'psa',  code:'PSA',  name:'Page Speed Audit', slug:'page-speed-audit', client:'Hardy Party', clientId:'hp', createdBy:'ar', status:'ongoing', budget:500, billable:312, total:340, recurring:'Month', created:'Jan 17, 2025', priority:'med' },
  { id:'ce',   code:'CE',   name:'Checkout Extensibility', slug:'checkout-extensibility', client:'Hardy Party', clientId:'hp', createdBy:'ar', status:'closed', budget:-10, billable:240, total:250, recurring:'Year', created:'Jan 17, 2025', priority:'low' },
  { id:'spr',  code:'SPR',  name:'Smart Product Recommendations', slug:'smart-product-recommendations', client:'Hardy Party', clientId:'hp', createdBy:'ar', status:'ongoing', budget:0, billable:0, total:0, recurring:'Month', created:'Jan 17, 2025', priority:'med' },
  { id:'pdt',  code:'PDT',  name:'Pre-Deploy Theme', slug:'pre-deploy-theme', client:'Powergoat', clientId:'pg', createdBy:'rs', status:'hold', budget:999, billable:112, total:145, recurring:'Year', created:'Jan 17, 2025', priority:'low' },
  { id:'prw',  code:'PRW',  name:'PDP Review Widget', slug:'pdp-review-widget', client:'Powergoat', clientId:'pg', createdBy:'fh', status:'ongoing', budget:725.25, billable:488, total:552, recurring:'Month', created:'Jan 17, 2025', priority:'high' },
  { id:'uhn',  code:'UHN',  name:'Update HomePage Navigation', slug:'update-homepage-navigation', client:'Tooth and Nail', clientId:'tn', createdBy:'rs', status:'closed', budget:545.22, billable:544, total:548, recurring:'Year', created:'Jan 17, 2025', priority:'low' },
  { id:'ulp',  code:'ULP',  name:'Update Login Portal', slug:'update-login-portal', client:'Tooth and Nail', clientId:'tn', createdBy:'ar', status:'ongoing', budget:499, billable:388, total:412, recurring:'Year', created:'Jan 17, 2025', priority:'med' },
  { id:'crm',  code:'CRM',  name:'Headless CMS Migration', slug:'headless-cms-migration', client:'Tooth and Nail', clientId:'tn', createdBy:'fh', status:'ongoing', budget:1200, billable:420, total:460, recurring:'Year', created:'Feb 02, 2025', priority:'high' },
  { id:'kor',  code:'KOR',  name:'Koda Retention Loop', slug:'koda-retention-loop', client:'Koda Outdoors', clientId:'ko', createdBy:'ar', status:'ongoing', budget:320, billable:142, total:168, recurring:'Month', created:'Feb 05, 2025', priority:'med' },
  { id:'fvx',  code:'FVX',  name:'Fieldview B2B Onboarding', slug:'fieldview-b2b-onboarding', client:'Fieldview Co.', clientId:'fv', createdBy:'rs', status:'hold', budget:180, billable:28, total:52, recurring:'Year', created:'Feb 10, 2025', priority:'low' },
];

const TASKS = [
  { id:'t1', project:'prw', title:'Build review card grid layout', assignee:'na', estLOE:12, actualLOE:8.5, status:'in-progress', priority:'high', role:'dev', billable:true, due:'Apr 22' },
  { id:'t2', project:'prw', title:'Star rating interaction spec', assignee:'mh', estLOE:6, actualLOE:6, status:'done', priority:'med', role:'designer', billable:true, due:'Apr 18' },
  { id:'t3', project:'prw', title:'Schema markup for reviews', assignee:'sm', estLOE:4, actualLOE:2, status:'in-progress', priority:'med', role:'dev', billable:true, due:'Apr 25' },
  { id:'t4', project:'prw', title:'QA across 3 themes', assignee:'ti', estLOE:8, actualLOE:0, status:'todo', priority:'med', role:'qa', billable:true, due:'Apr 28' },
  { id:'t5', project:'psa', title:'LCP optimization pass', assignee:'sm', estLOE:10, actualLOE:11.5, status:'review', priority:'high', role:'dev', billable:true, due:'Apr 21' },
  { id:'t6', project:'psa', title:'Image CDN migration', assignee:'ka', estLOE:16, actualLOE:9, status:'in-progress', priority:'high', role:'dev', billable:true, due:'Apr 30' },
  { id:'t7', project:'psa', title:'CLS audit + remediation', assignee:'na', estLOE:6, actualLOE:0, status:'loe-pending', priority:'med', role:'dev', billable:true, due:'May 02' },
  { id:'t8', project:'ulp', title:'Passwordless flow', assignee:'sm', estLOE:14, actualLOE:6, status:'in-progress', priority:'high', role:'dev', billable:true, due:'Apr 24' },
  { id:'t9', project:'ulp', title:'Session timeout copy', assignee:'mh', estLOE:2, actualLOE:1.5, status:'done', priority:'low', role:'designer', billable:false, due:'Apr 19' },
  { id:'t10', project:'wbtd', title:'A/B test: hero CTA variants', assignee:'ka', estLOE:8, actualLOE:3, status:'in-progress', priority:'med', role:'dev', billable:true, due:'Apr 26' },
  { id:'t11', project:'wbtd', title:'Analytics event audit', assignee:'na', estLOE:5, actualLOE:5, status:'done', priority:'low', role:'dev', billable:false, due:'Apr 17' },
  { id:'t12', project:'crm', title:'Content model draft', assignee:'ar', estLOE:12, actualLOE:4, status:'in-progress', priority:'high', role:'pm', billable:true, due:'Apr 29' },
  { id:'t13', project:'kor', title:'Email template redesign', assignee:'mh', estLOE:10, actualLOE:7, status:'in-progress', priority:'med', role:'designer', billable:true, due:'Apr 25' },
  { id:'t14', project:'fvx', title:'Pricing page wireframes', assignee:'mh', estLOE:8, actualLOE:4, status:'loe-pending', priority:'med', role:'designer', billable:true, due:'May 01' },
];

// Worklog entries for the date strip
const WORKLOGS = [
  { id:'w1', date:'2026-04-17', task:'t11', assignee:'na', hours:2.5, billable:false, note:'GA4 audit spreadsheet' },
  { id:'w2', date:'2026-04-17', task:'t1',  assignee:'na', hours:3,   billable:true,  note:'Card grid CSS + responsive' },
  { id:'w3', date:'2026-04-17', task:'t7',  assignee:'na', hours:1.5, billable:true,  note:'CLS measurement setup' },
  { id:'w4', date:'2026-04-18', task:'t1',  assignee:'na', hours:4,   billable:true,  note:'Hover + focus states' },
  { id:'w5', date:'2026-04-18', task:'t10', assignee:'na', hours:2,   billable:true,  note:'A/B test variant 2' },
  { id:'w6', date:'2026-04-19', task:'t1',  assignee:'na', hours:1.5, billable:true,  note:'Review spec revisions' },
];

// Activity
const ACTIVITY = [
  { who:'sm', action:'submitted LOE for', target:'Passwordless flow', project:'ulp', time:'12m ago' },
  { who:'ar', action:'approved LOE on',   target:'Content model draft', project:'crm', time:'38m ago' },
  { who:'na', action:'logged 3h on',      target:'Build review card grid', project:'prw', time:'1h ago' },
  { who:'ka', action:'marked done',        target:'Analytics event audit', project:'wbtd', time:'2h ago' },
  { who:'fh', action:'created project',    target:'Headless CMS Migration', project:'crm', time:'3h ago' },
  { who:'ti', action:'moved to review',    target:'LCP optimization pass', project:'psa', time:'5h ago' },
  { who:'mh', action:'commented on',       target:'Email template redesign', project:'kor', time:'6h ago' },
];

const PENDING_LOE = [
  { task:'CLS audit + remediation', project:'PSA', by:'na', est:6, note:'Includes 2 competitor benchmarks' },
  { task:'Pricing page wireframes', project:'FVX', by:'mh', est:8, note:'3 layout variations' },
  { task:'Saved filters backend',   project:'CRM', by:'sm', est:10, note:'Redis-backed, per-user' },
];

const ROLES = {
  admin:    { label:'Tenant Admin', color:'rust'  },
  pm:       { label:'Project Manager', color:'moss' },
  dev:      { label:'Developer',    color:'blue'  },
  qa:       { label:'QA',           color:'ochre' },
  designer: { label:'Designer',     color:'ink'   },
};

const STATUS_META = {
  ongoing: { label:'Ongoing', chip:'moss' },
  closed:  { label:'Closed',  chip:'rust' },
  hold:    { label:'On Hold', chip:'ochre' },
  draft:   { label:'Draft',   chip:'ink' },
};

const TASK_STATUS = {
  'todo':        { label:'To Do',       chip:'ink',   dot:'var(--ink-500)'  },
  'in-progress': { label:'In Progress', chip:'blue',  dot:'var(--blue-500)' },
  'review':      { label:'Review',      chip:'ochre', dot:'var(--ochre-500)'},
  'done':        { label:'Done',        chip:'moss',  dot:'var(--moss-500)' },
  'loe-pending': { label:'LOE Pending', chip:'rust',  dot:'var(--rust-500)' },
};

// Invoicing
const CURRENCIES = {
  USD: { symbol:'$',  code:'USD', fmt:(n)=>'$'+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}) },
  EUR: { symbol:'€',  code:'EUR', fmt:(n)=>'€'+n.toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2}) },
  GBP: { symbol:'£',  code:'GBP', fmt:(n)=>'£'+n.toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2}) },
  AUD: { symbol:'A$', code:'AUD', fmt:(n)=>'A$'+n.toLocaleString('en-AU',{minimumFractionDigits:2,maximumFractionDigits:2}) },
  CAD: { symbol:'C$', code:'CAD', fmt:(n)=>'C$'+n.toLocaleString('en-CA',{minimumFractionDigits:2,maximumFractionDigits:2}) },
};

const CLIENT_BILLING = {
  wb: { currency:'USD', taxRate:0,    terms:'Net 30', defaultRate:145, poRequired:false, contactName:'Marcus Reeves', contactEmail:'ap@wildbrands.co', address:'2140 Sawmill Rd\nPortland, OR 97214\nUSA' },
  hp: { currency:'USD', taxRate:0,    terms:'Net 15', defaultRate:165, poRequired:true,  contactName:'Elena Park', contactEmail:'finance@hardyparty.com', address:'88 Kent Ave, Suite 4\nBrooklyn, NY 11211\nUSA' },
  pg: { currency:'GBP', taxRate:0.20, terms:'Net 30', defaultRate:120, poRequired:false, contactName:'Sam Hollis', contactEmail:'sam@powergoat.co.uk', address:'12 Clerkenwell Rd\nLondon EC1M 5PA\nUK' },
  tn: { currency:'USD', taxRate:0,    terms:'Net 45', defaultRate:155, poRequired:true,  contactName:'Jordan Reyes', contactEmail:'billing@toothandnail.com', address:'601 N Lamar Blvd\nAustin, TX 78703\nUSA' },
  ko: { currency:'CAD', taxRate:0.13, terms:'Net 30', defaultRate:135, poRequired:false, contactName:'Priya Shah', contactEmail:'accounts@kodaoutdoors.ca', address:'4260 Still Creek Dr\nBurnaby, BC V5C 6C6\nCanada' },
  fv: { currency:'EUR', taxRate:0.19, terms:'Net 30', defaultRate:140, poRequired:false, contactName:'Tomas Keller', contactEmail:'tk@fieldview.eu', address:'Torstraße 44\n10119 Berlin\nGermany' },
};

const INVOICE_STATUS = {
  draft:    { label:'Draft',    chip:'ink',   dot:'var(--ink-500)' },
  sent:     { label:'Sent',     chip:'blue',  dot:'var(--blue-500)' },
  viewed:   { label:'Viewed',   chip:'teal',  dot:'var(--teal-500)' },
  partial:  { label:'Partial',  chip:'ochre', dot:'var(--ochre-500)' },
  paid:     { label:'Paid',     chip:'moss',  dot:'var(--moss-500)' },
  overdue:  { label:'Overdue',  chip:'rust',  dot:'var(--rust-500)' },
  void:     { label:'Void',     chip:'ink',   dot:'var(--ink-400)' },
};

// Invoices — mix of worklog-generated, manual line items, and retainer/fixed-fee
// Dates are around "today" = 2026-04-19 so overdues look natural.
const INVOICES = [
  { id:'INV-2026-0042', client:'hp', projects:['psa'],       type:'worklog',   currency:'USD', status:'overdue', issued:'2026-02-28', due:'2026-03-15', sent:'2026-02-28', viewed:'2026-03-02',
    subtotal:10890, tax:0, total:10890, paid:0,
    lines:[
      { desc:'LCP optimization pass — Samir M.',  qty:11.5, unit:165, amount:1897.50 },
      { desc:'Image CDN migration — Karim A.',    qty:9,    unit:165, amount:1485.00 },
      { desc:'CLS audit + remediation — Nabila A.', qty:6,  unit:165, amount:990.00 },
      { desc:'GA4 audit & reporting — Nabila A.', qty:2.5,  unit:165, amount:412.50 },
      { desc:'Project management — Andalib R.',   qty:8,    unit:185, amount:1480.00 },
      { desc:'Retainer — Feb strategy block',     qty:1,    unit:4625, amount:4625.00 },
    ], notes:'Thank you for your business. Wire transfers preferred for USD amounts over $5,000.',
  },
  { id:'INV-2026-0043', client:'tn', projects:['uhn','ulp','crm'], type:'mixed', currency:'USD', status:'overdue', issued:'2026-03-05', due:'2026-04-19', sent:'2026-03-05', viewed:'2026-03-06',
    subtotal:22450, tax:0, total:22450, paid:10000,
    lines:[
      { desc:'Update HomePage Navigation — Apr sprint', qty:1, unit:6200, amount:6200 },
      { desc:'Passwordless flow — Samir M.', qty:14, unit:155, amount:2170 },
      { desc:'Headless CMS Migration — content model', qty:24, unit:155, amount:3720 },
      { desc:'QA across 3 themes — Tasnim I.', qty:8, unit:135, amount:1080 },
      { desc:'Retainer — Q2 advisory (Apr)', qty:1, unit:9280, amount:9280 },
    ], notes:'Partial payment received Mar 28 — balance due.',
  },
  { id:'INV-2026-0044', client:'pg', projects:['prw'], type:'worklog', currency:'GBP', status:'sent', issued:'2026-04-01', due:'2026-05-01', sent:'2026-04-01', viewed:null,
    subtotal:14640, tax:2928, total:17568, paid:0,
    lines:[
      { desc:'Build review card grid — Nabila A.',   qty:8.5, unit:120, amount:1020 },
      { desc:'Star rating interaction spec — Maya H.', qty:6,  unit:110, amount:660 },
      { desc:'Schema markup for reviews — Samir M.', qty:2,   unit:120, amount:240 },
      { desc:'PRW strategy & PM — Fahim H.',         qty:12,  unit:140, amount:1680 },
      { desc:'Fixed-fee: Phase 2 PDP kit',           qty:1,   unit:11040, amount:11040 },
    ], notes:'VAT @ 20% applied. Bank details on page 2.',
  },
  { id:'INV-2026-0045', client:'wb', projects:['wbtd'], type:'retainer', currency:'USD', status:'viewed', issued:'2026-04-05', due:'2026-05-05', sent:'2026-04-05', viewed:'2026-04-17',
    subtotal:8500, tax:0, total:8500, paid:0,
    lines:[
      { desc:'Monthly CRO retainer — April 2026', qty:1, unit:8500, amount:8500 },
    ], notes:'Recurring monthly retainer — auto-invoiced on the 5th.',
  },
  { id:'INV-2026-0046', client:'ko', projects:['kor'], type:'worklog', currency:'CAD', status:'viewed', issued:'2026-04-08', due:'2026-05-08', sent:'2026-04-08', viewed:'2026-04-10',
    subtotal:3240, tax:421.20, total:3661.20, paid:0,
    lines:[
      { desc:'Email template redesign — Maya H.', qty:7, unit:135, amount:945 },
      { desc:'Retention loop strategy — Andalib R.', qty:6, unit:185, amount:1110 },
      { desc:'Fixed-fee: lifecycle audit',        qty:1, unit:1185, amount:1185 },
    ], notes:'HST @ 13% applied (Ontario registration).',
  },
  { id:'INV-2026-0047', client:'hp', projects:['ce'], type:'worklog', currency:'USD', status:'paid', issued:'2026-03-12', due:'2026-03-27', sent:'2026-03-12', viewed:'2026-03-12',
    subtotal:12800, tax:0, total:12800, paid:12800,
    lines:[
      { desc:'Checkout Extensibility — final delivery', qty:1, unit:12800, amount:12800 },
    ], notes:'Paid via ACH Mar 25. Thank you!',
  },
  { id:'INV-2026-0048', client:'fv', projects:['fvx'], type:'mixed', currency:'EUR', status:'draft', issued:'2026-04-19', due:'2026-05-19', sent:null, viewed:null,
    subtotal:5820, tax:1105.80, total:6925.80, paid:0,
    lines:[
      { desc:'Pricing page wireframes — Maya H.', qty:4, unit:140, amount:560 },
      { desc:'B2B onboarding PM — Raihan S.', qty:8, unit:185, amount:1480 },
      { desc:'Fixed-fee: onboarding flow kit', qty:1, unit:3780, amount:3780 },
    ], notes:'VAT @ 19% applied (German registration required).',
  },
  { id:'INV-2026-0049', client:'tn', projects:['crm'], type:'retainer', currency:'USD', status:'sent', issued:'2026-04-15', due:'2026-05-15', sent:'2026-04-15', viewed:null,
    subtotal:9280, tax:0, total:9280, paid:0,
    lines:[
      { desc:'Monthly advisory retainer — May 2026', qty:1, unit:9280, amount:9280 },
    ], notes:'Recurring monthly retainer — auto-invoiced on the 15th.',
  },
];

const PAYMENTS = [
  { id:'p1', invoice:'INV-2026-0047', date:'2026-03-25', method:'ACH',    amount:12800,   currency:'USD', ref:'Plaid-txn-88421', status:'reconciled' },
  { id:'p2', invoice:'INV-2026-0043', date:'2026-03-28', method:'Wire',   amount:10000,   currency:'USD', ref:'WT-20260328-001', status:'reconciled' },
  { id:'p3', invoice:'INV-2026-0042', date:'2026-04-02', method:'Stripe', amount:5445,    currency:'USD', ref:'pi_3Nxy8H2eZvKYlo2C', status:'disputed' },
  { id:'p4', invoice:null,            date:'2026-04-15', method:'Stripe', amount:1250,    currency:'USD', ref:'pi_3Nzy9K2eZvKYlo2C', status:'unmatched' },
  { id:'p5', invoice:'INV-2026-0046', date:'2026-04-18', method:'Stripe', amount:500,     currency:'CAD', ref:'pi_3Nww2P2eZvKYlo2C', status:'reconciled' },
];

const REMINDERS = [
  { id:'r1', invoice:'INV-2026-0042', step:'3rd reminder',  status:'queued',  sendAt:'2026-04-20', tone:'firm'     },
  { id:'r2', invoice:'INV-2026-0043', step:'2nd reminder',  status:'queued',  sendAt:'2026-04-22', tone:'friendly' },
  { id:'r3', invoice:'INV-2026-0044', step:'1st reminder',  status:'scheduled',sendAt:'2026-04-28', tone:'friendly' },
  { id:'r4', invoice:'INV-2026-0042', step:'2nd reminder',  status:'sent',    sendAt:'2026-04-05', tone:'friendly' },
  { id:'r5', invoice:'INV-2026-0042', step:'1st reminder',  status:'sent',    sendAt:'2026-03-22', tone:'friendly' },
];

const RECURRING = [
  { id:'rc1', name:'Wild Brands — Monthly CRO retainer', client:'wb', amount:8500,  currency:'USD', cadence:'Monthly', dayOfMonth:5,  next:'2026-05-05', template:'retainer', active:true,  createdFrom:'INV-2026-0045' },
  { id:'rc2', name:'Tooth and Nail — Advisory retainer', client:'tn', amount:9280,  currency:'USD', cadence:'Monthly', dayOfMonth:15, next:'2026-05-15', template:'retainer', active:true,  createdFrom:'INV-2026-0049' },
  { id:'rc3', name:'Powergoat — PDP phase fees',         client:'pg', amount:11040, currency:'GBP', cadence:'Quarterly', dayOfMonth:1, next:'2026-07-01', template:'fixed',  active:true,  createdFrom:null },
  { id:'rc4', name:'Hardy Party — Q2 strategy block',    client:'hp', amount:4625,  currency:'USD', cadence:'Monthly', dayOfMonth:28, next:'2026-04-28', template:'retainer', active:false, createdFrom:null },
];

Object.assign(window, { TEAM, CLIENTS, PROJECTS, TASKS, WORKLOGS, ACTIVITY, PENDING_LOE, ROLES, STATUS_META, TASK_STATUS, CURRENCIES, CLIENT_BILLING, INVOICE_STATUS, INVOICES, PAYMENTS, REMINDERS, RECURRING });
