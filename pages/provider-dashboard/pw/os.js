/* Shared UpNow OS (Finance, Business, Settings + channel activation) and vertical packs (all 7) */
(function () {
  const { ico, esc, av, aed, st, S, save, toast, modal, closeModal, drawer, go, render, pop, closePop, PK, PKL, PKI, packNav } = PWA;
  const tbl = (h, rows, ck) => `<table class="tbl"><thead><tr>${h.map(x => `<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr ${ck ? `class="ck" data-act="${ck}"` : ''}>${r.map((c, i) => `<td>${String(c).startsWith('§') ? (([t, k]) => st(t, k))(c.slice(1).split('|')) : i === 0 ? `<b>${c}</b>` : c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  const head = (t, p, acts = '') => `<div class="ph"><div><div class="hint" style="font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--g7);font-size:11px">${S.page && ['overview', 'portfolio', 'deals', 'ops', 'perf', 'cases', 'reports'].includes(S.page) ? esc(PKL(S.pack)) + ' pack' : 'Shared UpNow OS'}</div><h1>${t}</h1>${p ? `<p>${p}</p>` : ''}</div><span class="sp"></span><div class="acts">${acts}</div></div>`;
  const tabsUI = (list, cur, act) => `<div class="tabs">${list.map(x => `<button class="${x === cur ? 'on' : ''}" data-act="${act}" data-arg="${esc(x)}">${esc(x)}</button>`).join('')}</div>`;
  PWA.tbl = tbl; PWA.head = head;

  /* ============ PACK SWITCHER ============ */
  const VDESC = { spaces: 'Homes, stays, venues, courts, yachts', services: 'Cleaning, AC, salons, clinics', experiences: 'Safaris, workshops, tours', memberships: 'Gyms, clubs, credit packages', programs: 'Schools, courses, camps, academies', health: 'Clinics, practitioners, diagnostics', insurance: 'Motor, health, property cover' };
  PWA.acts.packMenu = (a, el) => {
    const r = el.getBoundingClientRect();
    const all = Object.keys(PK);
    pop(`<div class="pkm"><div class="h">Active packs</div>${all.filter(v => S.active.includes(v)).map(v => `<button class="r ${S.pack === v ? 'on' : ''}" data-v="${v}"><span class="ic">${ico(PKI[v])}</span><span class="bd"><b>${PKL(v)}</b><small>${VDESC[v]}</small></span>${S.pack === v ? ico('check') : ''}</button>`).join('')}
      <div class="h" style="margin-top:6px">Add a vertical</div>${all.filter(v => !S.active.includes(v)).map(v => `<button class="r" data-act="activatePack" data-arg="${v}"><span class="ic off">${ico(PKI[v])}</span><span class="bd"><b>${PKL(v)}</b><small>${VDESC[v]}</small></span><span class="st mute">Activate</span></button>`).join('') || '<p class="hint" style="padding:0 10px">All verticals active.</p>'}
      <p class="hint" style="padding:8px 10px 4px;margin:0;border-top:1px solid var(--line)">The shared OS is paid once. Each pack adds its own catalogue, records, licences and rules.</p></div>`, r.right + 8, r.top - 40);
    PWA.$('#pop').style.width = '340px'; PWA.$('#pop').style.padding = '0';
  };
  PWA.acts.activatePack = v => {
    closePop();
    const docs = { spaces: 'RERA / DTCM permit', services: 'Trade licence activity', experiences: 'DET tour operator licence', memberships: 'Facility / sports licence', programs: 'KHDA approval', health: 'DHA facility licence', insurance: 'CBUAE broker licence' }[v];
    modal(`<div class="mh"><span class="ic" style="width:40px;height:40px;border-radius:11px;background:var(--g1);color:var(--g7);display:grid;place-items:center">${ico(PKI[v])}</span><div style="flex:1"><h3>Activate ${PKL(v)} pack</h3><small class="hint">${VDESC[v]}</small></div><button class="x" data-act="closeModal">${ico('x')}</button></div><div class="mb">
      <div class="sect-t" style="margin-top:0">What you get</div><div class="chipset">${(PACKS.nav[PK[v]] || []).slice(1).map(x => `<span class="chip" style="height:28px;font-size:12px">${esc(x)}</span>`).join('')}</div>
      <div class="sect-t">Choose categories</div><div class="chipset">${(UP.VERTICALS[v] ? UP.VERTICALS[v].offers.map(o => o.label) : []).map((x, i) => `<button class="chip ${i === 0 ? 'on' : ''}" onclick="this.classList.toggle('on')">${esc(x)}</button>`).join('')}</div>
      <div class="sect-t">Required before publishing</div>
      <div class="ar">${ico('shield')}<div class="bd"><b>Business verification</b><small>Already verified for Greenstone</small></div>${st('Done')}</div>
      <div class="ar">${ico('file')}<div class="bd"><b>${docs}</b><small>Upload now or later — you can set up the pack while it is reviewed</small></div><button class="btn btn-o btn-sm" onclick="this.outerHTML='<span class=\\'st warn\\'>Uploaded</span>'">Upload</button></div>
      <button class="btn btn-g" style="width:100%;margin-top:14px" data-act="packOn" data-arg="${v}">Activate ${PKL(v)}</button></div>`);
  };
  PWA.acts.packOn = v => { if (!S.active.includes(v)) S.active.push(v); S.pack = v; if (PW.V[v]) S.v = v; S.page = 'overview'; save(); closeModal(); render(); toast(PKL(v) + ' pack activated'); };

  /* ============ FINANCE ============ */
  PWA.pages.finance = () => { const t = S.finTab || 'Overview'; const tabs = ['Overview', 'Money in', 'Money out', 'UpNow charges', 'Refunds', 'Deposits', 'Invoices', 'Ledger'];
    const led = [['27 Sep', 'PAY-8901', 'Aisha → Greenstone', 'Rent payment', 'AED 30,000', '§Received'], ['27 Sep', 'VND-441', 'Greenstone → CoolTech', 'Maintenance', 'AED 1,850', '§Approval|warn'], ['26 Sep', 'UPN-0926', 'Greenstone → UpNow', 'OS + marketplace', 'AED 1,500', '§Credit applied'], ['25 Sep', 'REF-104', 'Greenstone → Customer', 'Deposit refund', 'AED 6,000', '§Paid'], ['24 Sep', 'JOB-5490', 'Yousef → Greenstone', 'AC service', 'AED 298', '§Received'], ['23 Sep', 'PAY-8870', 'Omar → Greenstone', 'Cheque 2 of 4', 'AED 29,500', '§Bounced|risk']];
    const f = { 'Money in': r => r[2].endsWith('Greenstone'), 'Money out': r => r[2].startsWith('Greenstone') && !r[2].includes('UpNow'), 'UpNow charges': r => r[2].includes('UpNow'), Refunds: r => /refund/i.test(r[3]), Deposits: r => /deposit/i.test(r[3]) }[t] || (() => 1);
    return head('Finance', 'Receivables, payouts, supplier payables, UpNow charges, refunds and held deposits.', `<button class="btn btn-o btn-sm" data-act="toastX" data-arg="Statement exported">Export</button><button class="btn btn-g btn-sm" data-act="toastX" data-arg="New payment record opened">${ico('plus')}New record</button>`) + tabsUI(tabs, t, 'finTab') +
      (t === 'Overview' ? `<div class="mcards">${[['Customers owe you', 'AED 369,380', 'Receivables', '17 overdue payments'], ['UpNow will pay you', 'AED 184,600', 'Next payout', 'Settlement due 30 Sep'], ['You owe suppliers', 'AED 64,250', 'Provider payables', 'Maintenance and AMC vendors'], ['You owe UpNow', 'AED 1,500', 'Platform charges', 'Launch credit applied: AED 4,850'], ['Refunds to customers', 'AED 8,200', 'Pending refunds', '3 approvals required'], ['Customer deposits held', 'AED 520,000', 'Protected liabilities', '103 active relationships']].map(m => `<div class="mc"><small>${m[0]}</small><strong>${m[1]}</strong><b>${m[2]}</b><div>${m[3]}</div></div>`).join('')}</div>` : '') +
      `<section class="pn mt"><div class="pn-h"><h2>${t === 'Overview' ? 'Recent ledger' : t}</h2></div>${tbl(['Date', 'Reference', 'From → To', 'Type', 'Amount', 'Status'], led.filter(f))}</section>`; };
  PWA.acts.finTab = t => { S.finTab = t; save(); render(); };
  PWA.acts.toastX = m => toast(m);

  /* ============ BUSINESS ============ */
  PWA.pages.business = () => { const t = S.bizTab || 'Entities & Branches'; const tabs = ['Entities & Branches', 'Vendors & Contracts', 'Purchases & Payables', 'People', 'Assets & Expenses', 'P&L'];
    const B = {
      'Entities & Branches': `<div class="g4">${[['Provider account', 'Greenstone Group', 'Owner: Khalid'], ['Legal entities', '2', 'UAE · Oman'], ['Operating branches', '3', 'Dubai · Abu Dhabi · Muscat'], ['Countries', '2', 'AED · OMR']].map(k => `<div class="kpi"><small>${k[0]}</small><b style="font-size:20px">${k[1]}</b><span class="d" style="color:var(--ink3)">${k[2]}</span></div>`).join('')}</div>
        <section class="pn mt"><div class="pn-h"><h2>Account structure</h2><span class="sp"></span><button class="btn btn-g btn-sm" data-act="toastX" data-arg="Entity form opened">${ico('plus')}Add entity or branch</button></div><div class="wf">${['UpNow account', 'Legal entity', 'Branch / location', 'Vertical pack', 'Offerings'].map(x => `<div class="d">${x}</div>`).join('')}</div>
        ${tbl(['Legal entity', 'Branch / service area', 'Country', 'Verticals', 'Tax & currency', 'Status'], [['Greenstone Services LLC', 'Dubai · group head office', 'UAE', 'Spaces · Services', 'VAT 5% · AED', '§Live'], ['Greenstone Services LLC', 'Abu Dhabi branch', 'UAE', 'Spaces', 'VAT 5% · AED', '§Setup|warn'], ['Greenstone Oman SPC', 'Muscat service area', 'Oman', 'Services', 'VAT 5% · OMR', '§Draft|mute']])}</section>`,
      'Vendors & Contracts': `<section class="pn">${tbl(['Vendor', 'Category', 'Contract', 'Renewal', 'SLA', 'Status'], [['CoolTech LLC', 'AC maintenance', 'AMC · AED 48k / yr', '12 Jan 2027', '89%', '§Below SLA|warn'], ['Sparkle Facilities', 'Cleaning', 'Per job', '—', '96%', '§Active'], ['KeyMaster', 'Locksmith', 'On call', '—', '98%', '§Active'], ['Dubai Pest Control', 'Pest control', 'Quarterly · AED 6k', '3 Mar 2027', '100%', '§Active']])}</section>`,
      'Purchases & Payables': `<section class="pn">${tbl(['PO', 'Vendor', 'For', 'Amount', 'Due', 'Status'], [['PO-2211', 'CoolTech LLC', 'Avenue Residence · A-0803', 'AED 1,850', '30 Sep', '§Approval|warn'], ['PO-2208', 'Sparkle Facilities', 'Move-out clean · B-0602', 'AED 650', '2 Oct', '§Approved'], ['PO-2201', 'Dubai Pest Control', 'Quarterly visit', 'AED 1,500', 'Paid', '§Paid']])}</section>`,
      People: `<section class="pn">${tbl(['Person', 'Role', 'Branch', 'Work mode', 'Capacity', 'Status'], [...PW.TEAM.spaces, ...PW.TEAM.services.slice(1)].map(t => [t[0], t[1], t[2], /tech|lead|stylist/i.test(t[1]) ? 'On-ground' : 'Remote + on-ground', '38h / 40h', '§' + t[4]]))}</section>`,
      'Assets & Expenses': `<section class="pn">${tbl(['Asset / expense', 'Type', 'Branch', 'Monthly cost', 'Status'], [['Service van · D 48213', 'Vehicle', 'Dubai', 'AED 3,200', '§Active'], ['Cleaning equipment set ×3', 'Equipment', 'Dubai', 'AED 400', '§Active'], ['Office · Business Bay', 'Rent', 'Dubai', 'AED 14,000', '§Active'], ['Software & phones', 'Overhead', 'All', 'AED 1,100', '§Active']])}</section>`,
      'P&L': `<section class="pn">${tbl(['Line', 'This month', 'Last month', 'Change'], [['Revenue', 'AED 578,400', 'AED 531,200', '+8.9%'], ['Direct costs', 'AED 212,600', 'AED 198,300', '+7.2%'], ['Gross margin', 'AED 365,800', 'AED 332,900', '+9.9%'], ['Overheads', 'AED 124,100', 'AED 121,800', '+1.9%'], ['UpNow charges', 'AED 0', 'AED 0', 'Launch credit'], ['Operating profit', 'AED 241,700', 'AED 211,100', '+14.5%']])}</section>`
    };
    return head('Business', 'Entities, branches, vendors, people, assets and P&L.') + tabsUI(tabs, t, 'bizTab') + B[t]; };
  PWA.acts.bizTab = t => { S.bizTab = t; save(); render(); };

  /* ============ SETTINGS ============ */
  const SGROUPS = () => [
    ['Business', [['Account & KYC', 'Legal identity, authorized signatory and verification documents', 'shield'], ['Plan & billing', 'Your UpNow plan, what each plan includes, and payments', 'star'], ['Entities & Branches', 'Legal entities, branches, countries and currencies', 'building'], ['Team & Permissions', 'Who can see and do what', 'users']]],
    ['Customers', [['Channels', 'Where leads come from and how they connect to your inbox', 'link'], ['Notifications', 'Who gets alerted, how, and when it escalates', 'bell'], ['Language', 'Workspace, listing and template languages', 'globe']]],
  ];
  const STABS = () => ['Overview', ...SGROUPS().flatMap(g => g[1].map(x => x[0]))];
  const fld = (l, v = '', ph = '', type = 'input', opts) => `<div class="fld"><label>${l}</label>${type === 'sel' ? `<select>${(opts || [v]).map(o => `<option>${o}</option>`).join('')}</select>` : `<input ${type === 'date' ? 'type="date"' : ''} value="${esc(v)}" placeholder="${esc(ph)}">`}</div>`;
  const pn = (t, act, body, sub = '') => `<section class="pn"><div class="pn-h"><h2>${t}</h2>${sub ? `<span class="sub">${sub}</span>` : ''}<span class="sp"></span>${act}</div>${body}</section>`;
  const saveB = m => `<button class="btn btn-o btn-sm" data-act="toastX" data-arg="${m}">Save</button>`;

  const CH = [
    ['upnow', PWA.CHAT ? 'UpNow chat & calls' : 'UpNow calls & messages', 'Built in', `Leads from your UpNow listings: calls, WhatsApp${PWA.CHAT ? ', chat' : ''}, SMS and email.`, 'on', ['Built in — nothing to connect']],
    ['wa', 'WhatsApp Business', '+971 4 555 0198', 'Replies, templates and click-to-WhatsApp from listings.', 'on', ['Connect Meta Business account', 'Verify business number by OTP', 'Choose message templates', 'Route to team']],
    ['email', 'Email', 'leasing@greenstone.ae', 'Shared inbox. Enquiries are matched to leads automatically.', 'on', ['Connect Google or Microsoft 365 — or forward to your UpNow address', 'Pick inboxes to sync', 'Route to team']],
    ['phone', 'Tracked phone', '+971 4 555 0100', 'Tracked numbers per listing; calls are logged and recorded.', 'on', ['Choose a tracked number', 'Forward to your mobiles', 'Route to team']],
    ['ig', 'Instagram', '@greenstone.ae', 'DMs and ad lead forms with source attribution.', 'on', ['Log in with Meta', 'Pick the Instagram account', 'Route to team']],
    ['bayut', 'Bayut', 'Email parser', 'Import leads from your Bayut listings.', 'on', ['Enter your Bayut agent ID', 'Forward lead emails to your UpNow address', 'Map listings', 'Route to team']],
    ['pf', 'Property Finder', 'API', 'Import leads and calls from Property Finder.', 'on', ['Paste your Property Finder API key', 'Map listings', 'Route to team']],
    ['dubizzle', 'Dubizzle', '', 'Import chats and calls from your Dubizzle ads.', 'off', ['Enter your Dubizzle Pro account email', 'Forward lead emails to your UpNow address', 'Map listings', 'Route to team']],
    ['google', 'Google Business Profile', '', 'Messages and calls from Google Maps and Search.', 'off', ['Sign in with Google', 'Choose the business location', 'Route to team']],
    ['fb', 'Facebook', '', 'Page inbox and lead-ad forms.', 'off', ['Log in with Meta', 'Pick the page and lead forms', 'Route to team']],
    ['web', 'Website form', '', 'Embed an UpNow enquiry form on your website.', 'off', ['Choose form fields', 'Copy the embed code', 'Route to team']],
    ['sms', 'SMS', '', 'Two-way SMS for reminders and replies.', 'off', ['Choose a sender ID', 'Register with the TRA', 'Route to team']]
  ];
  PW.SOURCES.fb = PW.SOURCES.fb || { l: 'Facebook', s: 'Facebook', c: '#3b5bab' };
  PW.SOURCES.web = PW.SOURCES.web || { l: 'Website form', s: 'Website', c: '#46534c' };
  PW.SOURCES.sms = PW.SOURCES.sms || { l: 'SMS', s: 'SMS', c: '#7b877f' };
  const chOn = c => c[4] === 'on' || S.chOn[c[0]];

  // team table: each member with their initials
  const memRows = rows => rows.map(r => [`<span class="st-mem">${av(r[0])}<span>${r[0]}</span></span>`, ...r.slice(1)]);
  const SB = {
    'Account & KYC': () => `<div class="g2" style="grid-template-columns:1.4fr 1fr">${pn('Provider identity', saveB('Provider identity saved'), `<div class="frm">${fld('Provider type', 'Company', '', 'sel', ['Company', 'Individual owner'])}${fld('Legal name', 'Greenstone Services LLC')}${fld('Registration / licence number', 'CN-2081142')}${fld('Tax registration number', '100384726100003')}${fld('Registered address', 'Business Bay, Dubai')}${fld('Legal-notices address', 'PO Box 118822, Dubai')}</div>`)}
      ${pn('Authorized signatory', `<button class="btn btn-o btn-sm" data-act="toastX" data-arg="Signatory invited">Invite</button>`, `<div class="frm">${fld('Name', 'Khalid Baalfalasi')}${fld('Email and phone', 'khalid@greenstone.ae')}${fld('Authority', '', '', 'sel', ['Authorized signatory', 'Power of attorney', 'Manager'])}${fld('Expiry', '2027-06-30', '', 'date')}</div>`)}</div>
      <div class="mt">${pn('Verification documents', '', tbl(['Document', 'Applies to', 'Expiry', 'Status', 'Action'], ['Trade licence / company registration', 'Owner or signatory identity', 'Passport and visa where required', 'VAT registration certificate', 'Power of attorney / signing authority', PKL(S.pack) + ' regulatory licence'].map((x, i) => [x, i === 5 ? PKL(S.pack) + ' / jurisdiction' : 'Provider account', i === 1 ? '—' : `<span style="white-space:nowrap">${i === 5 ? '14 Oct 2026' : '15 Dec 2026'}</span>`, i === 5 ? '§Renewal due|warn' : '§Verified', `<button class="btn btn-o btn-sm" data-act="toastX" data-arg="Document manager opened">View / replace</button>`])), 'Business once · vertical licences only when required')}</div>`,
    'Entities & Branches': () => pn('Legal entities and operating branches', `<button class="btn btn-g btn-sm" data-act="toastX" data-arg="Entity or branch form opened">${ico('plus')}Add</button>`, tbl(['Entity / branch', 'Country', 'Currency & tax', 'Verticals', 'Listings & operations', 'Status'], [['Greenstone Services LLC<br><small class="hint">Legal entity</small>', 'UAE', 'AED · UAE VAT', 'Spaces · Services', 'Dubai and Abu Dhabi', '§Active'], ['Dubai Marina branch<br><small class="hint">Operating branch</small>', 'UAE', 'Inherited', 'Spaces', '9 properties · 113 units', '§Active'], ['Greenstone Oman SPC<br><small class="hint">Legal entity</small>', 'Oman', 'OMR · Oman VAT', 'Services', 'Muscat', '§Draft|mute']])),
    'Team & Permissions': () => pn('Team access', `<button class="btn btn-g btn-sm" data-act="invite">${ico('plus')}Invite member</button>`, tbl(['Member', 'Role', 'Branch / portfolio', 'Work modes', 'Sensitive access', 'Status'], memRows([['Khalid Baalfalasi', 'Owner', 'All', 'Remote', 'Everything', '§Active'], ['Ahmed Karim', 'Leasing manager', 'Dubai Marina', 'Remote + on-ground', 'Customer records · operations', '§Active'], ['Sara Idris', 'Operations', 'Stays · venues', 'Remote + on-ground', 'Customer records', '§Active'], ['Finance controller', 'Finance', 'All UAE', 'Remote', 'Pay, cost, margin · banking', '§Active'], ['Rashid Omar', 'Technician', 'All Dubai', 'On-ground', 'Assigned work only', '§Active']]))
      + `<p class="hint" style="margin:14px 0 0"><b>Permission boundary:</b> workers see assigned work. Managers see team delivery. Only owners and finance roles see pay, cost, banking and margin.</p>`),
    Channels: () => { const on = CH.filter(chOn), off = CH.filter(c => !chOn(c));
      const card = c => { const o = chOn(c), s = PW.SOURCES[c[0]]; const n = PWA.leads().filter(l => l.src === c[0]).length; return `<div class="chc ${o ? '' : 'off'}"><div class="t"><span class="sw" style="width:34px;height:34px;border-radius:10px;display:grid;place-items:center;color:#fff;font-weight:800;font-size:12px;background:${o ? s.c : 'var(--line2)'}">${esc(s.s.slice(0, 2))}</span><b>${esc(c[1])}</b>${o ? st('Live') : st('Off', 'mute')}</div><small>${esc(c[3])}</small>
        ${o ? `<div class="m"><span>${esc(S.chOn[c[0]] ? 'Connected just now' : c[2])}</span><span>${n} leads · 30d</span></div><button class="btn btn-o btn-sm" data-act="chManage" data-arg="${c[0]}">Manage</button>` : `<button class="btn btn-o btn-sm" data-act="chConnect" data-arg="${c[0]}">${ico('link')}Connect</button>`}</div>`; };
      return `<section class="pn"><div class="pn-h"><h2>Connected</h2><span class="sub">${on.length} channels · every lead lands in one inbox</span></div><div class="chg">${on.map(card).join('')}</div></section>
      ${off.length ? `<section class="pn mt"><div class="pn-h"><h2>Add more channels</h2><span class="sub">${off.length} available · connect one in a few steps</span></div><div class="chg">${off.map(card).join('')}</div></section>` : ''}
      <section class="pn mt"><div class="pn-h"><h2>Notices and automation</h2><span class="sub">One audited communication timeline</span></div><div class="chipset">${['Conversation', 'Notification', 'Reminder', 'Announcement', 'Formal notice', 'Warning', 'Consent request', 'Emergency alert', 'Delivery status', 'Customer acknowledgement'].map(x => `<span class="chip" style="height:28px;font-size:12px">${x}</span>`).join('')}</div></section>`; },
    Notifications: () => pn('Notification rules', saveB('Notification rules saved'), tbl(['Event', 'Owner', 'Channels', 'Escalation'], [['New lead or customer reply', 'Demand owner', 'In-app · email · WhatsApp', 'Manager after 15 min'], ['Viewing / appointment in 1 hour', 'Assignee', 'Push · WhatsApp', '—'], ['Payment due, failed or unmatched', 'Finance', 'In-app · email', 'Owner'], ['Work late or evidence missing', 'Accountable owner', 'Push · in-app', 'Operations lead'], ['Licence, agreement or AMC expiry', 'Compliance owner', 'Email · in-app', 'Provider owner']])),
    Language: () => pn('Languages and translated content', `<button class="btn btn-g btn-sm" data-act="toastX" data-arg="Language picker opened">${ico('plus')}Add language</button>`, tbl(['Language', 'Direction', 'Workspace', 'Listings', 'Templates', 'Status'], [['English', 'LTR', 'Complete', 'Required', 'Approved', '§Live'], ['العربية', 'RTL', 'Complete', 'Required', 'Approved', '§Live'], ['Русский', 'LTR', '—', 'Optional', '4 of 12', '§Draft|mute']])),
  };
  /* plan & billing: the UpNow plan the provider is on, what each plan includes, changing plan, and the monthly payments.
     The admin portal owns the plans (pages/admin → upnow.admin.state.plans: price and listing limit) and sets each
     provider's plan (upnow.join.review.plan, and planOf.REAL in the admin state). Payments follow pages/admin/js/admin.js
     invoices(): every 30 days from approval, due within 7 days, marked paid by the team (admin state paid['REAL-<n>']).
     PLANS is the same list as pages/admin/js/data.js PLANS0; INCL is what each plan includes. */
  const PLANS = [{ id: 'launch', n: 'Launch', p: 0, max: 5 }, { id: 'basic', n: 'Basic', p: 299, max: 10 }, { id: 'pro', n: 'Pro', p: 799, max: 50 }, { id: 'business', n: 'Business', p: 1999, max: 500 }];
  // what each plan adds on top of the one before; built on what the dashboard has (Channels, Team & Permissions,
  // Demand, Boost on a listing, Entities & Branches)
  // what each plan includes and who it's for — one list with onboarding (js/pages/join.js), kept in data/site.js
  const SITEP = window.SITE || {};
  const INCL = SITEP.planIncl || {};
  const FOR = SITEP.planFor || {};
  const DAY = 864e5;
  const readLS = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  const writeLS = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const plans = () => { const a = readLS('upnow.admin.state'); return a && Array.isArray(a.plans) && a.plans.length ? a.plans : PLANS; };
  const dt = t => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const aedP = n => 'AED ' + Number(n).toLocaleString();
  const MY = () => {
    const u = readLS('upnow.user'), app = readLS('upnow.join'), who = u && (u.email || (u.dial || '') + u.phone), adm = readLS('upnow.admin.state') || {};
    const P = plans(), find = id => P.find(p => p.id === id) || P[0];
    // ?demo (no application of their own): the sample business, on Pro for about three months
    if (!app || !who || (app.owner && app.owner !== who)) {
      const d = S.demoPlan || {}, since = Date.now() - 95 * DAY;
      if (d.next && d.next.from <= Date.now()) { (d.hist = d.hist || [{ id: d.id || 'pro', from: since }]).push({ id: d.next.id, from: d.next.from }); d.id = d.next.id; delete d.next; save(); }
      return { demo: true, plan: find(d.id || 'pro'), next: d.next ? { plan: find(d.next.id), from: d.next.from } : null, used: PW.LISTINGS.length + S.extraListings.length, since, hist: d.hist || [], find, paid: () => true };
    }
    const used = ((readLS('upnow.listings@' + who) || {}).items || []).filter(l => l.status !== 'rejected').length;
    // in review: the admin can pick the plan before approving (pages/admin planBox → admin state planOf.REAL); it starts on approval
    if (!(app.status === 'verified' || app.status === 'approved')) return { plan: null, used, pending: find((adm.planOf && adm.planOf.REAL) || app.plan || 'launch'), chosen: !!(adm.planOf && adm.planOf.REAL && adm.planOf.REAL !== app.plan), asked: !!app.plan };
    const r = app.review || {}, now = Date.now();
    // a smaller plan chosen earlier starts on its date
    if (r.next && r.next.from <= now) { (r.hist = r.hist || [{ id: r.plan || 'launch', from: r.t || now }]).push({ id: r.next.id, from: r.next.from }); r.plan = r.next.id; delete r.next; app.review = r; writeLS('upnow.join', app); if (adm.planOf) { adm.planOf.REAL = r.plan; writeLS('upnow.admin.state', adm); } }
    const id = (adm.planOf && adm.planOf.REAL) || r.plan || 'launch';
    return { plan: find(id), next: r.next ? { plan: find(r.next.id), from: r.next.from } : null, used, since: r.t || app.sent || now, hist: r.hist || [], find, paid: k => !!(adm.paid && adm.paid['REAL-' + k]) };
  };
  // each month is billed at the plan in effect on its date (hist: [{ id, from }], written when the plan changes)
  const planAt = (m, t) => { const h = (m.hist || []).filter(x => x.from <= t + 1).pop(); return h ? m.find(h.id) : m.hist && m.hist.length ? m.find(m.hist[0].id) : m.plan; };
  const bills = m => {
    if (!m.plan) return [];
    const out = [], now = Date.now();
    for (let t = m.since, k = 0; t <= now; t += 30 * DAY, k++) { const p = planAt(m, t); if (!p.p) continue; const paid = m.paid(k) && (!m.demo || now - t > 3 * DAY); out.push({ k, t, p, amt: p.p, due: t + 7 * DAY, state: paid ? 'paid' : now > t + 7 * DAY ? 'overdue' : 'due' }); }
    return out.reverse();
  };
  const nextBill = m => { let t = m.since; while (t <= Date.now()) t += 30 * DAY; return t; };
  const incl = x => x.f || INCL[x.id] || [];
  const PL_ICO = { launch: 'bolt', basic: 'star', pro: 'chart', business: 'building' };
  const PL_C = { launch: '#8a96a3', basic: '#a0623a', pro: '#5f7189', business: '#b8860b' }; // metal tiers, the same as the admin: grey · bronze · silver · gold
  const plC = x => PL_C[x.id] || x.c || '#047246';
  const PL_CSS = `
    .pl-root{container-type:inline-size;display:grid;grid-template-columns:minmax(0,1fr);gap:18px}.pl-root>*{min-width:0}
    .btn:disabled{opacity:.45;cursor:not-allowed}
    .pl-hero{position:relative;overflow:hidden;border-radius:20px;color:#fff;padding:26px 28px;display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:24px;align-items:stretch;
      background:radial-gradient(110% 140% at 100% 0%,rgba(52,190,128,.32),transparent 55%),radial-gradient(80% 120% at 0% 100%,rgba(233,180,92,.14),transparent 60%),linear-gradient(135deg,var(--g9),var(--g7))}
    .pl-eyebrow{display:inline-flex;align-items:center;gap:7px;font-size:11.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#bfe6d2}
    .pl-eyebrow .ico{width:15px;height:15px}
    .pl-hero-name{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:10px 0 4px}
    .pl-hero-name h2{font-family:var(--serif);font-weight:400;font-size:44px;line-height:1;letter-spacing:-.01em;color:#fff}
    .pl-chip{display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 11px;border-radius:99px;font-size:12px;font-weight:800;background:rgba(255,255,255,.16);color:#fff}
    .pl-chip::before{content:'';width:7px;height:7px;border-radius:50%;background:#5fe0a1}.pl-chip.rv::before{background:#ffd27a}
    .pl-hero-sub{font-size:15px;font-weight:600;color:#e3f4ea;margin:0}
    .pl-hero-note{font-size:13px;line-height:1.55;color:#bfdccc;margin:12px 0 0;max-width:460px}
    .pl-hero-acts{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}
    .pl-hero-acts .btn{height:38px;padding:0 16px;border-radius:11px;font-weight:700}
    .pl-btn-light{background:#fff;color:var(--g9)}.pl-btn-light:hover{background:#eef8f2}
    .pl-btn-ghost{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.35)}.pl-btn-ghost:hover{background:rgba(255,255,255,.1)}
    .pl-hero-side{display:grid;gap:12px;align-content:center}
    .pl-stat{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);border-radius:14px;padding:14px 16px}
    .pl-stat small{display:block;font-size:12px;color:#bfdccc;font-weight:600}
    .pl-stat b{display:block;font-size:24px;font-weight:800;letter-spacing:-.02em;margin-top:2px}.pl-stat b span{font-size:14px;font-weight:600;color:#bfdccc}
    .pl-stat em{display:block;font-style:normal;font-size:12px;color:#bfdccc;margin-top:6px}
    .pl-meter{height:7px;border-radius:99px;background:rgba(255,255,255,.16);overflow:hidden;margin-top:10px}.pl-meter i{display:block;height:100%;border-radius:99px;background:#5fe0a1}.pl-meter.over i{background:#ffc35c}
    .pl-alerts{display:grid;gap:10px}
    .pl-alert{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:14px;border:1px solid var(--line);background:#fff}
    .pl-alert .pl-ai{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;flex:none;background:var(--g1);color:var(--g7)}.pl-alert .pl-ai .ico{width:17px;height:17px}
    .pl-alert.warn .pl-ai{background:#fbf0dc;color:#8a5a14}.pl-alert.risk .pl-ai{background:#f9e3e1;color:#9a2f2a}
    .pl-alert div{flex:1;min-width:0}.pl-alert b{display:block;font-size:13.5px}.pl-alert small{display:block;font-size:12.5px;color:var(--ink3);margin-top:1px}
    .pl-sec-h{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin:6px 2px 12px}
    .pl-sec-h h2{font-family:var(--serif);font-weight:400;font-size:26px;color:var(--g9);line-height:1.1}.pl-sec-h p{color:var(--ink3);font-size:13px;margin:4px 0 0}
    .pl-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;padding-top:12px}
    @container (max-width:980px){.pl-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.pl-hero{grid-template-columns:minmax(0,1fr)}.pl-hero-side{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @container (max-width:560px){.pl-grid{grid-template-columns:minmax(0,1fr)}.pl-hero{padding:22px 18px;border-radius:18px}.pl-hero-side{grid-template-columns:minmax(0,1fr)}.pl-hero-name h2{font-size:36px}.pl-hero-acts .btn{flex:1;justify-content:center}
      .pl-alert{flex-wrap:wrap}.pl-alert>.btn,.pl-alert>.st{margin-left:46px}.pl-bill{padding:4px 10px 8px}.pl-bill .tbl th,.pl-bill .tbl td{padding-left:6px;padding-right:6px}.pl-bill .tbl th:nth-child(2),.pl-bill .tbl td:nth-child(2){display:none}}
    .pl-bill .tbl td{white-space:nowrap}
    .pl-card{position:relative;display:flex;flex-direction:column;background:#fff;border:1px solid var(--line);border-radius:18px;padding:20px 18px 18px;transition:box-shadow .2s,transform .2s}
    .pl-card::before{content:'';position:absolute;inset:0 0 auto;height:4px;border-radius:18px 18px 0 0;background:var(--c)}
    .pl-card:hover{box-shadow:0 14px 34px -22px rgba(11,61,42,.45);transform:translateY(-2px)}
    .pl-card.is-cur{border:2px solid var(--g7);box-shadow:0 18px 40px -26px rgba(4,114,70,.55);padding:19px 17px 17px}
    .pl-tag{position:absolute;top:-12px;left:16px;height:24px;padding:0 10px;border-radius:99px;display:inline-flex;align-items:center;gap:5px;font-size:11.5px;font-weight:800;background:var(--g7);color:#fff;box-shadow:0 4px 10px -4px rgba(4,114,70,.6)}
    .pl-tag .ico{width:13px;height:13px}.pl-tag.pend{background:#1f5a8c;box-shadow:0 4px 10px -4px rgba(31,90,140,.6)}
    .pl-card-h{display:flex;align-items:flex-start;gap:11px;min-height:58px}
    .pl-ic{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;flex:none;color:var(--c);background:color-mix(in srgb,var(--c) 12%,#fff)}.pl-ic .ico{width:20px;height:20px}
    .pl-card-h h3{font-size:17px;letter-spacing:-.01em}.pl-card-h small{display:block;color:var(--ink3);font-size:12px;margin-top:1px;line-height:1.3}
    .pl-price{display:flex;align-items:baseline;gap:5px;margin:18px 0 10px}.pl-price b{font-size:30px;font-weight:800;letter-spacing:-.03em;color:var(--ink)}.pl-price span{font-size:13px;color:var(--ink3);font-weight:600}
    .pl-limit{display:inline-flex;align-self:flex-start;align-items:center;gap:7px;height:30px;padding:0 12px;border-radius:9px;font-size:13px;font-weight:700;color:var(--c);background:color-mix(in srgb,var(--c) 10%,#fff)}.pl-limit .ico{width:15px;height:15px}
    .pl-feats{border-top:1px dashed var(--line);margin-top:16px;padding-top:14px;flex:1}
    .pl-plus{display:block;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--ink3);margin-bottom:10px}
    .pl-feats ul{list-style:none;margin:0;padding:0;display:grid;gap:9px}
    .pl-feats li{display:flex;gap:9px;align-items:flex-start;font-size:13px;line-height:1.45;color:var(--ink2)}
    .pl-feats li i{width:18px;height:18px;border-radius:50%;display:grid;place-items:center;flex:none;margin-top:1px;background:var(--g1);color:var(--g7)}.pl-feats li i .ico{width:11px;height:11px;stroke-width:3}
    .pl-cta{margin-top:18px}.pl-cta .btn{width:100%;justify-content:center;height:40px;border-radius:11px;font-weight:700}
    .pl-cur-note{display:flex;align-items:center;justify-content:center;gap:6px;height:40px;border-radius:11px;background:var(--g1);color:var(--g8);font-size:13px;font-weight:700}.pl-cur-note .ico{width:15px;height:15px}
    .pl-bill{background:#fff;border:1px solid var(--line);border-radius:18px;padding:6px 18px 10px;overflow-x:auto}
    .pl-bill .tbl td,.pl-bill .tbl th{padding-top:12px;padding-bottom:12px}
    .pl-empty{display:flex;align-items:center;gap:12px;padding:16px 0;color:var(--ink3);font-size:13px}.pl-empty .pl-ai{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;background:var(--g1);color:var(--g7)}
    .pl-note{font-size:13px;line-height:1.5;margin:0 0 12px;padding:10px 12px;border-radius:10px;background:var(--g1)}
    .pl-sum{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin-bottom:6px}
    .pl-sum div{background:var(--g1);border-radius:12px;padding:12px 14px}.pl-sum small{display:block;color:var(--ink3);font-size:12px}.pl-sum b{font-size:15px}
    /* metal tiers — Launch grey · Basic bronze · Pro silver · Business gold (the same as the admin) */
    .pl-card[data-tier="launch"]{--m1:#f3f5f7;--m2:#dfe4e9;--m3:#c3cad1;--mi:#5f6b77}
    .pl-card[data-tier="basic"],.pl-hero[data-tier="basic"]{--m1:#fbefe6;--m2:#e7c3a6;--m3:#c98d63;--mi:#6b3a17}
    .pl-card[data-tier="pro"],.pl-hero[data-tier="pro"]{--m1:#ffffff;--m2:#dfe5ec;--m3:#a9b6c5;--mi:#34445a}
    .pl-card[data-tier="business"],.pl-hero[data-tier="business"]{--m1:#fff6d9;--m2:#f1d27a;--m3:#d4a332;--mi:#6b4a00}
    .pl-hero[data-tier="launch"]{--m1:#f3f5f7;--m2:#dfe4e9;--m3:#c3cad1;--mi:#5f6b77}
    .pl-card::before{display:none}
    .pl-ic{background:linear-gradient(135deg,var(--m1),var(--m2) 55%,var(--m1) 70%,var(--m3));color:var(--mi);box-shadow:inset 0 1px 0 rgba(255,255,255,.8),0 0 0 1px color-mix(in srgb,var(--m3) 60%,transparent)}
    .pl-card[data-tier="launch"] .pl-ic{background:var(--m1);box-shadow:0 0 0 1px var(--m2)}
    .pl-limit{color:var(--mi);background:color-mix(in srgb,var(--m2) 45%,#fff);box-shadow:0 0 0 1px color-mix(in srgb,var(--m3) 45%,transparent)}
    .pl-card.is-cur{border-color:var(--m3)}
    /* the "Your plan" / "Starts when approved" tag wears its plan's metal, not brand green or blue */
    .pl-card[data-tier] .pl-tag,.pl-card[data-tier] .pl-tag.pend{background:linear-gradient(135deg,var(--m1),var(--m2) 50%,var(--m3));color:var(--mi);box-shadow:0 0 0 1px color-mix(in srgb,var(--m3) 70%,#000 10%) inset,0 4px 10px -6px rgba(0,0,0,.35)}
    .pl-card[data-tier="launch"] .pl-tag{background:var(--m2)}
    .pl-cur-note{height:auto;min-height:40px;padding:8px 12px;text-align:center;line-height:1.3}
    .pl-tag{left:50%;transform:translateX(-50%);white-space:nowrap}
    .pl-medal{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;flex:none;color:var(--mi);background:radial-gradient(circle at 32% 28%,var(--m1) 0 20%,var(--m2) 55%,var(--m3) 100%);box-shadow:0 0 0 3px rgba(255,255,255,.18),inset 0 -3px 6px rgba(0,0,0,.12)}.pl-medal .ico{width:22px;height:22px}`;
  const plCss = () => { const s = document.getElementById('pl-css') || document.head.appendChild(Object.assign(document.createElement('style'), { id: 'pl-css' })); if (s.textContent !== PL_CSS) s.textContent = PL_CSS; };
  // cur: the plan they're on (with change buttons); pend: the plan that starts when they're approved (no buttons)
  const planCards = (cur, pend) => { const P = plans();
    return `<div class="pl-grid">${P.map((x, i) => { const on = cur && x.id === cur.id, pd = pend && x.id === pend.id, prev = P[i - 1];
      return `<div class="pl-card ${on || pd ? 'is-cur' : ''}" data-tier="${x.id}" style="--c:${plC(x)}">
        ${on ? `<span class="pl-tag">${ico('check')}Your plan</span>` : pd ? `<span class="pl-tag pend">${ico('clock')}Starts when approved</span>` : ''}
        <div class="pl-card-h"><span class="pl-ic">${ico(PL_ICO[x.id] || 'star')}</span><div><h3>${esc(x.n)}</h3><small>${esc(FOR[x.id] || x.note || '')}</small></div></div>
        <div class="pl-price"><b>${aedP(x.p)}</b><span>/ month</span></div>
        <span class="pl-limit">${ico('layers')}Up to ${x.max} listings</span>
        <div class="pl-feats"><span class="pl-plus">${prev ? 'Everything in ' + esc(prev.n) + ', plus' : 'Includes'}</span><ul>${incl(x).map(f => `<li><i>${ico('check')}</i><span>${esc(f)}</span></li>`).join('')}</ul></div>
        ${cur ? `<div class="pl-cta">${on ? `<div class="pl-cur-note">${ico('check')}Your current plan</div>` : `<button class="btn ${x.p > cur.p ? 'btn-g' : 'btn-o'}" data-act="planAsk" data-arg="${x.id}">${x.p > cur.p ? 'Upgrade to ' : 'Switch to '}${esc(x.n)}</button>`}</div>`
          : pend ? `<div class="pl-cta">${pd ? `<div class="pl-cur-note">${ico('clock')}Starts once approved</div>` : `<button class="btn btn-o" data-act="planChoose" data-arg="${x.id}">Choose ${esc(x.n)} instead</button>`}</div>` : ''}</div>`; }).join('')}</div>`; };
  const PL_SUG_CSS = '.pl-alert.info{background:#eef5fb;border-color:#cfe0f0}.pl-alert.info .pl-ai{background:#dcebf7;color:#1f5a8c}.pl-sug-acts{display:flex;gap:8px;flex-wrap:wrap;flex:none}';
  if (!document.getElementById('pl-sug-css')) { const st2 = document.createElement('style'); st2.id = 'pl-sug-css'; st2.textContent = PL_SUG_CSS; document.head.appendChild(st2); }
  const plAlert = (tone, icon, title, text, act = '') => `<div class="pl-alert ${tone}"><span class="pl-ai">${ico(icon)}</span><div><b>${title}</b><small>${text}</small></div>${act}</div>`;
  const plHero = (x, o) => `<section class="pl-hero" data-tier="${x.id}" style="--c:${plC(x)}"><div>
      <span class="pl-eyebrow">${ico(PL_ICO[x.id] || 'star')}Your UpNow plan</span>
      <div class="pl-hero-name"><span class="pl-medal">${ico(PL_ICO[x.id] || 'star')}</span><h2>${esc(x.n)}</h2><span class="pl-chip ${o.review ? 'rv' : ''}">${o.review ? 'In review' : 'Active'}</span></div>
      <p class="pl-hero-sub">${aedP(x.p)} a month · up to ${x.max} listings</p>
      <p class="pl-hero-note">${o.note}</p>
      <div class="pl-hero-acts"><button class="btn pl-btn-light" data-act="planCompare">${ico('layers')}Compare plans</button>${o.up ? `<button class="btn pl-btn-ghost" data-act="planAsk" data-arg="${o.up.id}">${ico('arrow')}Upgrade to ${esc(o.up.n)}</button>` : ''}</div></div>
    <div class="pl-hero-side">
      <div class="pl-stat"><small>Listings used</small><b>${o.used}<span> of ${x.max}</span></b><div class="pl-meter ${o.used > x.max ? 'over' : ''}"><i style="width:${Math.min(100, Math.round(o.used / x.max * 100))}%"></i></div><em>${o.used > x.max ? (o.used - x.max) + ' over your limit' : (x.max - o.used) + ' left on this plan'}</em></div>
      <div class="pl-stat"><small>${o.k}</small><b>${o.v}</b><em>${o.vs}</em></div></div></section>`;
  const plSec = (id, title, sub, body) => `<section ${id ? `id="${id}"` : ''}><div class="pl-sec-h"><div><h2>${title}</h2>${sub ? `<p>${sub}</p>` : ''}</div></div>${body}</section>`;
  const COMPARE_SUB = 'Every plan includes leads by call, WhatsApp, SMS and email, and the verified badge.';
  PWA.acts.planCompare = () => { const s = document.getElementById('pl-compare'); if (s) s.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  // the UpNow team can suggest another plan (pages/admin → upnow.join.review.sug); nothing changes until the provider accepts
  const sugOf = () => { const app = readLS('upnow.join'), r = app && app.review, g = r && r.sug; return g && g.state === 'open' ? g : null; };
  const setSug = (state, extra) => { const app = readLS('upnow.join'); if (!app || !app.review || !app.review.sug) return; Object.assign(app.review.sug, { state, at: Date.now() }, extra || {}); writeLS('upnow.join', app); };
  SB['Plan & billing'] = () => { plCss(); const m = MY(), p = m.plan, P = plans();
    if (!p) { const q = m.pending;
      return `<div class="pl-root">${plHero(q, { review: true, used: m.used, k: 'Starts', v: 'When approved', vs: 'Billing begins the day UpNow approves you',
          note: (m.chosen ? `Picked by the UpNow team for your application. It starts the day you're approved.` : m.asked ? `You chose ${esc(q.n)}. Our team confirms it when they approve you, and it starts that day — until then you can pick another plan below, nothing is billed.` : `You start on ${esc(q.n)}. The UpNow team may suggest another plan when they approve you.`) + ' After that you can change it here.' })}
        ${plSec('pl-compare', 'Compare plans', COMPARE_SUB, planCards(null, q))}</div>`; }
    const over = m.used > p.max, B = bills(m), open = B.filter(b => b.state !== 'paid'), nO = open.filter(b => b.state === 'overdue').length, nD = open.length - nO;
    const up = P.find(x => x.p > p.p);
    const g = !m.demo && sugOf(), gp = g && P.find(x => x.id === g.to);
    const alerts = [
      gp && gp.id !== p.id ? plAlert('info', 'star', `The UpNow team suggests ${esc(gp.n)} · ${aedP(gp.p)} / month`, `${g.reason ? esc(g.reason.trim().replace(/[.!?]?$/, '.')) + ' ' : ''}${esc(gp.n)} includes up to ${gp.max} listings. Nothing changes unless you switch.`, `<span class="pl-sug-acts"><button class="btn btn-g btn-sm" data-act="planAsk" data-arg="${gp.id}">Switch to ${esc(gp.n)}</button><button class="btn btn-o btn-sm" data-act="planSugNo">Keep ${esc(p.n)}</button></span>`) : '',
      over ? plAlert('warn', 'alert', 'Over your listing limit', `You have ${m.used} listings and ${esc(p.n)} includes ${p.max}. Pick a bigger plan to keep adding.`, up ? `<button class="btn btn-g btn-sm" data-act="planAsk" data-arg="${up.id}">Upgrade</button>` : '') : '',
      m.next ? plAlert('', 'clock', `Changing to ${esc(m.next.plan.n)} on ${dt(m.next.from)}`, `You keep ${esc(p.n)} and its ${p.max} listings until then.`, `<button class="btn btn-o btn-sm" data-act="planKeep">Keep ${esc(p.n)}</button>`) : '',
      open.length ? plAlert(nO ? 'risk' : 'warn', 'coin', [nO ? nO + (nO > 1 ? ' payments' : ' payment') + ' overdue' : '', nD ? nD + (nD > 1 ? ' payments' : ' payment') + ' due' : ''].filter(Boolean).join(' · '), `${aedP(open.reduce((s, b) => s + b.amt, 0))} in total. Questions about a payment? Contact the UpNow team.`, st(nO ? 'Overdue' : 'Due', nO ? 'risk' : 'warn')) : ''
    ].filter(Boolean);
    return `<div class="pl-root">${plHero(p, { used: m.used, up, k: p.p ? 'Next payment' : 'On this plan since', v: p.p ? dt(nextBill(m)) : dt(m.since), vs: p.p ? aedP((m.next && m.next.from <= nextBill(m) ? m.next.plan : p).p) + ' · billed monthly' : 'Change your plan any time',
        note: m.next ? `Changing to ${esc(m.next.plan.n)} on ${dt(m.next.from)}.` : up ? `Need more room? ${esc(up.n)} gives you up to ${up.max} listings.` : `You're on our biggest plan.` })}
      ${alerts.length ? `<div class="pl-alerts">${alerts.join('')}</div>` : ''}
      ${plSec('pl-compare', 'Compare plans', COMPARE_SUB, planCards(p))}
      ${plSec('', 'Billing history', B.length ? 'Monthly, from the day you were approved' : '', `<div class="pl-bill">${B.length ? tbl(['Date', 'Plan', 'Amount', 'Status'], B.map(b => [dt(b.t), esc(b.p.n), aedP(b.amt), b.state === 'paid' ? '§Paid' : b.state === 'due' ? '§Due ' + dt(b.due) + '|warn' : '§Overdue|risk'])) : `<div class="pl-empty"><span class="pl-ai">${ico('coin')}</span>No payments yet.</div>`}</div>`)}</div>`; };
  // before approval: change the plan they're asking for — nothing is billed until approval, and the team sees the new choice
  PWA.acts.planChoose = id => { const app = readLS('upnow.join'), to = plans().find(x => x.id === id); if (!app || !to) return;
    app.plan = id; writeLS('upnow.join', app);
    const adm = readLS('upnow.admin.state'); if (adm && adm.planOf && adm.planOf.REAL) { delete adm.planOf.REAL; writeLS('upnow.admin.state', adm); }
    render(); toast(`${to.n} it is — it starts when you’re approved`); };
  PWA.acts.planAsk = id => { const m = MY(), cur = m.plan, to = plans().find(x => x.id === id); if (!cur || !to) return;
    const up = to.p > cur.p, diff = to.p - cur.p, nb = nextBill(m);
    const block = to.max < m.used;
    modal(`<div class="mh"><h3>${up ? 'Upgrade' : 'Switch'} to ${esc(to.n)}</h3><button class="x" data-act="closeModal">${ico('x')}</button></div><div class="mb">
      <div class="pl-sum"><div><small>Now</small><b>${esc(cur.n)}</b><small>${aedP(cur.p)} / month · ${cur.max} listings</small></div><div><small>New</small><b>${esc(to.n)}</b><small>${aedP(to.p)} / month · ${to.max} listings</small></div></div>
      <p class="pl-note">${diff ? `${diff > 0 ? '+' : '−'}${aedP(Math.abs(diff))} a month. ` : ''}${up ? `Starts today: your next payment on ${dt(nb)} is ${aedP(to.p)}.` : `Starts on ${dt(nb)}, your next billing date. You keep ${esc(cur.n)} until then.`}</p>
      ${block ? `<p class="pl-note" style="background:#fbf0dc"><b>${esc(to.n)} includes ${to.max} listings and you have ${m.used}.</b> Remove ${m.used - to.max} listing${m.used - to.max > 1 ? 's' : ''} first, or pick a bigger plan.</p>` : ''}
      <button class="btn btn-g" style="width:100%" data-act="planDo" data-arg="${to.id}" ${block ? 'disabled' : ''}>${up ? 'Upgrade' : 'Switch'} to ${esc(to.n)}</button></div>`); };
  PWA.acts.planDo = id => { const m = MY(), to = plans().find(x => x.id === id); if (!m.plan || !to || to.max < m.used) return;
    const up = to.p > m.plan.p, from = nextBill(m);
    const now = Date.now(), hist = (m.hist && m.hist.length ? m.hist : [{ id: m.plan.id, from: m.since }]).concat(up ? [{ id, from: now }] : []);
    if (m.demo) { S.demoPlan = up ? { id, hist } : { id: m.plan.id, hist, next: { id, from } }; }
    else {
      const app = readLS('upnow.join'), adm = readLS('upnow.admin.state'); app.review = app.review || {};
      app.review.hist = hist;
      if (up) { app.review.plan = id; delete app.review.next; if (adm) { adm.planOf = adm.planOf || {}; adm.planOf.REAL = id; writeLS('upnow.admin.state', adm); } }
      else app.review.next = { id, from };
      writeLS('upnow.join', app);
    }
    if (!m.demo) { const g = sugOf(); if (g) setSug(g.to === id ? 'accepted' : 'other', { chose: id }); }
    save(); closeModal(); render(); toast(up ? `You're on ${to.n} now` : `${to.n} starts on ${dt(from)}`); };
  PWA.acts.planSugNo = () => { const m = MY(); setSug('declined'); render(); toast(`You're staying on ${m.plan.n} — we've let the UpNow team know`); };
  PWA.acts.planKeep = () => { const m = MY(); if (m.demo) { if (S.demoPlan) delete S.demoPlan.next; } else { const app = readLS('upnow.join'); if (app.review) delete app.review.next; writeLS('upnow.join', app); } save(); render(); toast(`You're staying on ${m.plan.n}`); };

  const ATTN = () => [
    ...((g => { const gp = g && plans().find(x => x.id === g.to); return gp ? [['Plan & billing', 'info', `The UpNow team suggests the ${gp.n} plan`, 'Review']] : []; })(sugOf())),
    ['Account & KYC', 'warn', PKL(S.pack) + ' regulatory licence renews 14 Oct', 'Renew'],
    ...((m => m.plan && m.used > m.plan.max ? [['Plan & billing', 'warn', `${m.used} listings — your ${m.plan.n} plan includes ${m.plan.max}`, 'Upgrade']] : [])(MY())),
    ...((m => bills(m).some(b => b.state === 'overdue') ? [['Plan & billing', 'risk', 'A payment to UpNow is overdue', 'Review']] : [])(MY())),
    ['Channels', 'info', CH.filter(c => !chOn(c)).length + ' lead channels not connected', 'Connect'],
    ['Entities & Branches', 'mute', 'Greenstone Oman SPC is still a draft', 'Finish'],
    ['Language', 'mute', 'Russian templates 4 of 12 translated', 'Review']
  ].filter(a => !(a[0] === 'Channels' && !CH.some(c => !chOn(c))));
  const SUMM = { 'Account & KYC': '5 of 6 documents verified', 'Plan & billing': () => { const m = MY(); return m.plan ? m.plan.n + ' · ' + m.used + ' of ' + m.plan.max + ' listings' : m.pending.n + ' · starts when you\'re approved'; }, 'Entities & Branches': '2 entities · 3 branches', 'Team & Permissions': '5 members · 4 roles', Channels: () => CH.filter(chOn).length + ' of ' + CH.length + ' connected', Notifications: '5 rules active', Language: 'English · العربية' };
  const summ = n => { const v = SUMM[n]; return typeof v === 'function' ? v() : v || 'Configured'; };
  const sOverview = () => { const A = ATTN(); return `
    <section class="pn st-att"><div class="pn-h"><h2>Needs your attention</h2><span class="st-count">${A.length}</span></div>
      ${A.map(a => `<div class="ar"><span class="st-ai ${a[1]}">${ico({ 'Account & KYC': 'shield', 'Plan & billing': 'star', Channels: 'link', 'Entities & Branches': 'building', Language: 'globe' }[a[0]] || 'alert')}</span><div class="bd"><b>${esc(a[2])}</b><small>${esc(a[0])}</small></div><button class="btn btn-o btn-sm" data-act="setTab" data-arg="${esc(a[0])}">${a[3]}</button></div>`).join('')}</section>
    ${SGROUPS().map(([g, items]) => `<div class="sect-t" style="margin-top:22px">${g}</div><div class="sov">${items.map(([n, d, i]) => { const w = A.find(a => a[0] === n); return `<button class="soc" data-act="setTab" data-arg="${esc(n)}"><span class="ic">${ico(i)}</span><span class="bd"><b>${esc(n)}</b><small>${esc(d)}</small><em>${w ? `<span class="st ${w[1]}">${esc(w[3])} needed</span>` : `<span class="ok">${ico('check')}${esc(summ(n))}</span>`}</em></span>${ico('chevR')}</button>`; }).join('')}</div>`).join('')}`; };
  /* settings page look: scoped to .pg-settings so the rest of the dashboard is untouched */
  const ST_CSS = `
    .pg-settings .st-top{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;flex-wrap:wrap;margin:4px 0 24px}
    .pg-settings .st-top h1{font-family:var(--serif);font-weight:400;font-size:40px;line-height:1;color:var(--g9);letter-spacing:-.01em}
    .pg-settings .st-top p{color:var(--ink3);font-size:14.5px;margin:8px 0 0}
    .pg-settings .st-id{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid var(--line);border-radius:16px;padding:10px 10px 10px 12px;box-shadow:0 10px 30px -24px rgba(11,61,42,.5)}
    .pg-settings .st-av{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;color:#fff;font-weight:800;font-size:14px;background:linear-gradient(135deg,var(--g9),var(--g7))}
    .pg-settings .st-id b{display:block;font-size:14.5px}.pg-settings .st-id>div{min-width:0}.pg-settings .st-id b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pg-settings .st-id small{white-space:nowrap;display:flex;align-items:center;gap:5px;font-size:12px;color:var(--g7);font-weight:700}.pg-settings .st-id small .ico{width:13px;height:13px}
    .pg-settings .st-id small.rv{color:#8a5a14}
    .pg-settings .st-plan{white-space:nowrap;flex:none;display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 12px;margin-left:6px;border-radius:10px;background:var(--g1);color:var(--g8);font-weight:800;font-size:12.5px;cursor:pointer}
    .pg-settings .st-plan:hover{background:#d9efe3}.pg-settings .st-plan .ico{width:14px;height:14px}
    .pg-settings .st-plan[data-tier]{color:#33404c;background:linear-gradient(135deg,#f3f5f7,#dfe4e9);box-shadow:0 0 0 1px #c3cad1 inset}
    .pg-settings .st-plan[data-tier="basic"]{color:#6b3a17;background:linear-gradient(135deg,#fbefe6 0%,#e7c3a6 45%,#f8e8dc 60%,#d6a47f 100%);box-shadow:0 0 0 1px #c08a62 inset}
    .pg-settings .st-plan[data-tier="pro"]{color:#34445a;background:linear-gradient(135deg,#fff 0%,#dfe5ec 45%,#f7f9fb 60%,#c8d2dd 100%);box-shadow:0 0 0 1px #9fadbd inset}
    .pg-settings .st-plan[data-tier="business"]{color:#6b4a00;background:linear-gradient(135deg,#fff6d9 0%,#f1d27a 45%,#fff3c4 60%,#e2b444 100%);box-shadow:0 0 0 1px #c99a2e inset}
    .pg-settings .st-plan[data-tier]:hover{filter:brightness(1.04)}
    .pg-settings .setg{grid-template-columns:264px minmax(0,1fr);gap:28px}
    .pg-settings .snav{top:8px;border-radius:18px;padding:12px;box-shadow:0 12px 32px -28px rgba(11,61,42,.55)}
    .pg-settings .ssrch{display:flex;align-items:center;gap:8px;height:40px;padding:0 12px;border-radius:11px;background:var(--bg);border:1px solid transparent;margin-bottom:8px}
    .pg-settings .ssrch:focus-within{background:#fff;border-color:var(--g5);box-shadow:0 0 0 3px var(--g1)}
    .pg-settings .ssrch input{border:0;background:none;outline:0;flex:1;font:inherit;font-size:13.5px;min-width:0}.pg-settings .ssrch .ico{width:16px;height:16px;color:var(--ink3)}
    .pg-settings .sgl{font-size:10.5px;font-weight:800;letter-spacing:.09em;color:var(--ink3);padding:14px 10px 6px}
    .pg-settings .si{position:relative;display:flex;align-items:center;gap:11px;height:44px;padding:0 10px 0 8px;border-radius:12px;color:var(--ink2);font-weight:600;font-size:14px;cursor:pointer;transition:background .15s,color .15s}
    .pg-settings .si:hover{background:var(--bg);color:var(--ink)}
    .pg-settings .si .si-ic{width:30px;height:30px;border-radius:9px;display:grid;place-items:center;flex:none;background:var(--bg);color:var(--ink3);transition:inherit}.pg-settings .si .si-ic .ico{width:16px;height:16px}
    .pg-settings .si .si-t{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .pg-settings .si.on{background:var(--g1);color:var(--g9);font-weight:800}
    .pg-settings .si.on .si-ic{background:var(--g7);color:#fff}
    .pg-settings .si.on::before{content:'';position:absolute;left:-12px;top:10px;bottom:10px;width:4px;border-radius:0 4px 4px 0;background:var(--g7)}
    .pg-settings .si em{font-style:normal;min-width:22px;height:22px;padding:0 6px;border-radius:99px;display:grid;place-items:center;font-size:11.5px;font-weight:800;background:#f6e3c4;color:#8a5a14}
    .pg-settings .si i.dot{width:8px;height:8px;border-radius:50%;background:#d9902f;box-shadow:0 0 0 3px #fbf0dc}
    .pg-settings .si i.dot.info{background:#3d82c4;box-shadow:0 0 0 3px #e3eef8}.pg-settings .si i.dot.mute{background:#aab5af;box-shadow:0 0 0 3px #eef0ef}
    .pg-settings .shd{align-items:center;gap:16px;margin:2px 0 22px}.pg-settings .shd>div{min-width:0}.pg-settings .shd h2{overflow-wrap:anywhere}
    .pg-settings .shd .ic{width:54px;height:54px;border-radius:16px;color:#fff;background:linear-gradient(135deg,var(--g9),var(--g7));box-shadow:0 10px 22px -14px rgba(4,114,70,.8)}.pg-settings .shd .ic .ico{width:24px;height:24px}
    .pg-settings .shd .crumb{font-size:12.5px;color:var(--ink3);font-weight:600}.pg-settings .shd .crumb a{color:var(--g7);cursor:pointer}
    .pg-settings .shd h2{font-family:var(--serif);font-weight:400;font-size:32px;line-height:1.05;color:var(--g9);margin-top:2px}
    .pg-settings .shd p{font-size:14px;margin-top:4px}
    .pg-settings .smain .pn{border-radius:18px;padding:20px 22px;box-shadow:0 12px 32px -30px rgba(11,61,42,.6)}
    .pg-settings .smain .pn-h{margin-bottom:16px;flex-wrap:wrap}.pg-settings .smain .pn-h h2{white-space:normal;min-width:0}.pg-settings .smain .pn-h h2{font-size:16.5px}
    .pg-settings .smain .tbl th{background:var(--bg);padding-top:10px;padding-bottom:10px}
    .pg-settings .smain .tbl th:first-child{border-radius:10px 0 0 10px}.pg-settings .smain .tbl th:last-child{border-radius:0 10px 10px 0}
    .pg-settings .smain .tbl th{border-bottom:0}.pg-settings .smain .tbl td{padding-top:13px;padding-bottom:13px}
    .pg-settings .smain .tbl tbody tr:hover td{background:#fafcfb}
    .pg-settings .smain .fld label{font-size:12.5px;font-weight:700;color:var(--ink2)}
    .pg-settings .smain .fld input,.pg-settings .smain .fld select{border-radius:11px;border-color:var(--line);background:#fff;transition:border-color .15s,box-shadow .15s}
    .pg-settings .smain .fld input:focus,.pg-settings .smain .fld select:focus{border-color:var(--g5);box-shadow:0 0 0 3px var(--g1);outline:0}
    .pg-settings .st-att .ar{padding:12px 0;gap:12px}
    .pg-settings .st-ai{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;flex:none;background:var(--g1);color:var(--g7)}.pg-settings .st-ai .ico{width:16px;height:16px}
    .pg-settings .st-ai.warn{background:#fbf0dc;color:#8a5a14}.pg-settings .st-ai.risk{background:#f9e3e1;color:#9a2f2a}.pg-settings .st-ai.info{background:#e3eef8;color:#1f5a8c}.pg-settings .st-ai.mute{background:#eef0ef;color:var(--ink2)}
    .pg-settings .st-count{min-width:24px;height:24px;padding:0 7px;border-radius:99px;display:inline-grid;place-items:center;font-size:12px;font-weight:800;background:#f6e3c4;color:#8a5a14}
    .pg-settings .sect-t{font-size:11px;font-weight:800;letter-spacing:.09em;color:var(--ink3)}
    .pg-settings .sov{grid-template-columns:repeat(auto-fill,minmax(min(280px,100%),1fr));gap:14px}
    .pg-settings .soc{border-radius:18px;padding:18px;gap:14px;box-shadow:0 12px 32px -30px rgba(11,61,42,.6);transition:box-shadow .2s,transform .2s,border-color .2s}
    .pg-settings .soc:hover{transform:translateY(-2px);border-color:#bfe0cf;box-shadow:0 18px 36px -24px rgba(11,61,42,.45)}
    .pg-settings .soc .ic{width:46px;height:46px;border-radius:14px}
    .pg-settings .soc b{font-size:15.5px}
    .pg-settings .st-sub{display:flex;align-items:center;gap:10px;margin:22px 2px 12px}.pg-settings .st-sub h3{font-size:14px}.pg-settings .st-sub span{color:var(--ink3);font-size:12.5px}
    .pg-settings .chg{grid-template-columns:repeat(auto-fill,minmax(min(250px,100%),1fr));gap:14px}
    .pg-settings .chc{border-radius:16px;padding:16px;gap:10px;transition:box-shadow .2s,transform .2s}
    .pg-settings .chc:hover{transform:translateY(-2px);box-shadow:0 16px 32px -26px rgba(11,61,42,.5)}
    .pg-settings .chc .t .sw{border-radius:11px!important;width:38px!important;height:38px!important}
    .pg-settings .chc small{min-height:34px;line-height:1.45}
    .pg-settings .chc.off{background:#fff;border-style:solid}
    .pg-settings .chc .btn{height:36px;border-radius:10px}
    .pg-settings .st-mem{display:flex;align-items:center;gap:10px}.pg-settings .st-mem .av{width:34px;height:34px;border-radius:10px;font-size:12px;flex:none}
    @media (max-width:1100px){
      .pg-settings .setg{grid-template-columns:minmax(0,1fr);gap:18px}
      .pg-settings .snav{position:static;display:flex;gap:8px;overflow-x:auto;padding:8px;scrollbar-width:none}.pg-settings .snav::-webkit-scrollbar{display:none}
      .pg-settings .snav .ssrch,.pg-settings .snav .sgl,.pg-settings .snav .snone{display:none!important}
      .pg-settings .snav .sg{display:contents!important}
      .pg-settings .si{flex:none;height:40px;padding:0 12px 0 6px;background:var(--bg)}.pg-settings .si .si-ic{width:28px;height:28px;background:#fff}
      .pg-settings .si.on::before{display:none}
    }
    @media (max-width:640px){.pg-settings .st-top h1{font-size:34px}.pg-settings .st-id{width:100%;flex-wrap:wrap}.pg-settings .st-plan{margin-left:54px}
      .pg-settings .smain .g2{grid-template-columns:minmax(0,1fr)!important}.pg-settings .smain .frm{grid-template-columns:minmax(0,1fr)!important}.pg-settings .smain .pn{overflow-x:auto}.pg-settings .shd h2{font-size:26px}.pg-settings .shd .ic{width:46px;height:46px}.pg-settings .sov{grid-template-columns:minmax(0,1fr)}.pg-settings .smain .pn{padding:16px}}`;
  const stCss = () => { const s = document.getElementById('st-css') || document.head.appendChild(Object.assign(document.createElement('style'), { id: 'st-css' })); if (s.textContent !== ST_CSS) s.textContent = ST_CSS; };
  PWA.pages.settings = () => { let t = S.setTab; const tabs = STABS(); if (!tabs.includes(t)) t = 'Overview';
    const A = ATTN(); let meta = null, grp = '';
    SGROUPS().forEach(([g, items]) => items.forEach(x => { if (x[0] === t) { meta = x; grp = g; } }));
    stCss();
    const nav = `<aside class="snav"><label class="ssrch">${ico('search')}<input id="sSearch" placeholder="Search settings"></label>
      <a class="si ${t === 'Overview' ? 'on' : ''}" data-act="setTab" data-arg="Overview" data-k="overview"><span class="si-ic">${ico('grid')}</span><span class="si-t">Overview</span>${A.length ? `<em>${A.length}</em>` : ''}</a>
      ${SGROUPS().map(([g, items]) => `<div class="sg"><div class="sgl">${g.toUpperCase()}</div>${items.map(([n, d, i]) => { const w = A.find(a => a[0] === n); return `<a class="si ${t === n ? 'on' : ''}" data-act="setTab" data-arg="${esc(n)}" data-k="${esc((n + ' ' + d).toLowerCase())}"><span class="si-ic">${ico(i)}</span><span class="si-t">${esc(n)}</span>${w && w[1] !== 'mute' ? `<i class="dot ${w[1] === 'info' ? 'info' : ''}"></i>` : ''}</a>`; }).join('')}</div>`).join('')}
      <p class="hint snone" style="display:none;padding:8px 10px">No settings match.</p></aside>`;
    const body = t === 'Overview' ? sOverview() : `<div class="shd"><span class="ic">${ico(meta[2])}</span><div><div class="crumb"><a data-act="setTab" data-arg="Overview">Settings</a> / ${esc(grp)}</div><h2>${esc(t)}</h2><p>${esc(meta[1])}</p></div></div>${SB[t]()}`;
    const app = readLS('upnow.join'), d = (app && app.d) || {}, biz = d.display || d.trade || d.legal || (app && app.name) || 'Greenstone', m = MY();
    const ok = !app || app.status === 'verified' || app.status === 'approved', pl = m.plan || m.pending;
    const top = `<header class="st-top"><div><h1>Settings</h1><p>Your business, plan, team and the ways customers reach you.</p></div>
      <div class="st-id"><span class="st-av">${esc(biz.split(/\s+/).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase())}</span><div><b>${esc(biz)}</b><small class="${ok ? '' : 'rv'}">${ico(ok ? 'shield' : 'clock')}${ok ? 'Verified provider' : 'Application in review'}</small></div>
        ${pl ? `<button class="st-plan" data-tier="${pl.id}" data-act="setTab" data-arg="Plan &amp; billing">${ico(PL_ICO[pl.id] || 'star')}${esc(pl.n)} plan</button>` : ''}</div></header>`;
    return top + `<div class="setg">${nav}<div class="smain">${body}</div></div>`; };
  PWA.after.settings = () => { const Q = s => [...document.querySelectorAll(s)]; const i = document.getElementById('sSearch'); if (!i) return; i.oninput = () => { const q = i.value.trim().toLowerCase(); let n = 0; Q('.snav .si').forEach(a => { const m = !q || a.dataset.k.includes(q); a.style.display = m ? '' : 'none'; if (m) n++; }); Q('.snav .sg').forEach(g => g.style.display = [...g.querySelectorAll('.si')].some(a => a.style.display !== 'none') ? '' : 'none'); document.querySelector('.snone').style.display = n ? 'none' : ''; }; };
  PWA.acts.setTab = t => { S.setTab = t; save(); render(); };
  PWA.openChannels = () => { S.setTab = 'Channels'; save(); go('settings'); };

  /* ---- channel activation wizard ---- */
  const CW = { k: null, step: 0 };
  PWA.acts.chConnect = k => { CW.k = k; CW.step = 0; chw(); };
  PWA.acts.chManage = k => { const c = CH.find(x => x[0] === k); const s = PW.SOURCES[k]; modal(`<div class="mh"><h3>${esc(c[1])}</h3><button class="x" data-act="closeModal">${ico('x')}</button></div><div class="mb">
    <div class="kv" style="margin-top:0"><div><span>Account</span><b>${esc(c[2] || 'Connected')}</b></div><div><span>Status</span><b style="color:var(--g7)">Healthy · synced 2 min ago</b></div><div><span>Leads (30 days)</span><b>${PWA.leads().filter(l => l.src === k).length * 10}</b></div><div><span>Routed to</span><b>Round-robin · Leasing team</b></div></div>
    <div class="chr"><div class="bd"><b>Auto-acknowledge new messages</b><small>Instant reply in the lead's language</small></div><span class="tog on" onclick="this.classList.toggle('on')" style="cursor:pointer"></span></div>
    <div class="chr"><div class="bd"><b>Create a lead from every new contact</b><small>Matched by phone / email first</small></div><span class="tog on" onclick="this.classList.toggle('on')" style="cursor:pointer"></span></div>
    <div style="display:flex;gap:8px;margin-top:14px"><button class="btn btn-o btn-sm" data-act="toastX" data-arg="Test message sent">Send test</button><span style="flex:1"></span>${c[4] !== 'on' || k !== 'upnow' ? `<button class="btn btn-ghost btn-sm" style="color:var(--red)" data-act="chOff" data-arg="${k}">Disconnect</button>` : ''}</div></div>`); };
  PWA.acts.chOff = k => { const c = CH.find(x => x[0] === k); if (k === 'upnow') return; c[4] = 'off'; delete S.chOn[k]; save(); closeModal(); render(); toast(c[1] + ' disconnected'); };
  function chw() {
    const c = CH.find(x => x[0] === CW.k), s = PW.SOURCES[CW.k], steps = c[5].concat(['Done']);
    const k = CW.k, i = CW.step, last = i === steps.length - 1;
    const addr = 'leads+greenstone@in.upnow.ae';
    const body = (() => {
      if (last) return `<div style="text-align:center;padding:20px 0"><div style="width:56px;height:56px;border-radius:50%;background:var(--g1);color:var(--g7);display:grid;place-items:center;margin:0 auto 12px">${ico('check')}</div><h3 style="font-family:var(--serif);font-weight:400;font-size:24px;color:var(--g9)">${esc(c[1])} is live</h3><p class="hint">New ${esc(s.s)} leads will appear in Leads and Communications, tagged with their source.</p></div>`;
      const t = steps[i];
      if (/Route/.test(t)) return `${fld('Assign new leads to', '', '', 'sel', ['Round-robin · whole team', 'Ahmed Karim', 'Sara Idris', 'Khalid Baalfalasi'])}${fld('Reply target', '', '', 'sel', ['15 minutes', '5 minutes', '30 minutes', '1 hour'])}<div class="chr"><div class="bd"><b>Instant auto-acknowledgement</b><small>“Thanks — a Greenstone agent will reply shortly.”</small></div><span class="tog on" onclick="this.classList.toggle('on')" style="cursor:pointer"></span></div>`;
      if (/Map listings/.test(t)) return `<p class="hint" style="margin-top:0">We found 6 listings on ${esc(s.s)}. Match them to UpNow listings so every lead knows which property it's about.</p>${PWA.listings().slice(0, 4).map((l, j) => `<div class="ar"><img src="${l.img}" style="width:44px;height:34px;border-radius:7px;object-fit:cover"><div class="bd"><b>${esc(s.s)} ref ${['BY-4411', 'BY-4502', 'BY-4618', 'BY-4720'][j]}</b><small>→ ${esc(l.t)}</small></div>${st(j < 3 ? 'Auto-matched' : 'Check', j < 3 ? '' : 'warn')}</div>`).join('')}`;
      if (/OTP/.test(t)) return `${fld('Business number', '+971 4 555 0198')}<p class="hint">We sent a 6-digit code by SMS to this number.</p><div style="display:flex;gap:8px">${[4, 8, 1, 9, 2, 6].map(n => `<input value="${n}" style="width:44px;height:48px;text-align:center;font-size:18px;font-weight:800;border:1.5px solid var(--line2);border-radius:10px">`).join('')}</div>`;
      if (/API key/.test(t)) return `${fld('API key', 'pf_live_•••••••••••••3a9c')}<p class="hint">Find it in Property Finder Pro → Settings → Integrations.</p>`;
      if (/forward/i.test(t)) return `<p class="hint" style="margin-top:0">Add this forwarding address in your ${esc(s.s)} account. Every lead email is turned into an UpNow lead within seconds.</p><div style="display:flex;gap:8px;align-items:center;background:var(--bg);border:1px dashed var(--line2);border-radius:10px;padding:12px"><b style="flex:1;font-family:monospace;font-size:13px">${addr}</b><button class="btn btn-o btn-sm" data-act="toastX" data-arg="Address copied">Copy</button></div>${k === 'email' ? `<div class="sect-t">Or connect directly</div><div style="display:flex;gap:8px"><button class="btn btn-o btn-sm" data-act="chNext">Google Workspace</button><button class="btn btn-o btn-sm" data-act="chNext">Microsoft 365</button></div>` : ''}`;
      if (/embed/.test(t)) return `<pre style="background:var(--g9);color:#d8efe3;padding:14px;border-radius:12px;font-size:12px;white-space:pre-wrap">&lt;script src="https://forms.upnow.ae/embed.js"\n  data-provider="greenstone" data-lang="auto"&gt;&lt;/script&gt;</pre><button class="btn btn-o btn-sm" data-act="toastX" data-arg="Embed code copied">Copy code</button>`;
      if (/tracked number|sender ID/i.test(t)) return `<div class="opts" style="grid-template-columns:1fr 1fr">${['+971 4 555 0100', '+971 4 555 0142', '+971 800 GREEN'].map((n, j) => `<button class="opt txt ${j === 0 ? 'on' : ''}" onclick="this.parentNode.querySelectorAll('.opt').forEach(o=>o.classList.remove('on'));this.classList.add('on')"><b>${n}</b><small>${j === 2 ? 'Toll-free' : 'Dubai landline'}</small></button>`).join('')}</div>`;
      if (/Log in|Sign in|Connect Meta|Connect Google/.test(t)) return `<div style="text-align:center;padding:14px 0"><div style="width:56px;height:56px;border-radius:14px;background:${s.c};color:#fff;display:grid;place-items:center;margin:0 auto 12px;font-weight:800">${esc(s.s.slice(0, 2))}</div><p class="hint">A secure ${esc(s.s)} window opens. Approve UpNow to read and reply to messages and lead forms.</p><button class="btn btn-g" data-act="chNext">${ico('lock')}Continue with ${/Google/.test(t) ? 'Google' : 'Meta'}</button></div>`;
      if (/Pick|Choose/.test(t)) return `<div class="opts" style="grid-template-columns:1fr">${['Greenstone Properties', 'Greenstone Services'].map((n, j) => `<button class="opt txt ${j === 0 ? 'on' : ''}" onclick="this.parentNode.querySelectorAll('.opt').forEach(o=>o.classList.remove('on'));this.classList.add('on')"><b>${n}</b><small>${j ? '1.2k followers' : '8.4k followers · verified'}</small></button>`).join('')}</div>`;
      if (/agent ID|account email/.test(t)) return fld(t.replace('Enter your ', '').replace(/^./, m => m.toUpperCase()), '', k === 'bayut' ? 'e.g. 118204' : 'you@greenstone.ae');
      if (/templates/.test(t)) return `<div class="chipset">${['Viewing confirmation', 'Reminder 24 h', 'Document request', 'Payment reminder', 'Welcome'].map(x => `<button class="chip on" onclick="this.classList.toggle('on')">${x}</button>`).join('')}</div><p class="hint">Templates are submitted to Meta for approval (usually minutes).</p>`;
      return `<p class="hint">${esc(t)}</p>`;
    })();
    modal(`<div class="mh"><span class="sw" style="width:38px;height:38px;border-radius:10px;display:grid;place-items:center;color:#fff;font-weight:800;font-size:12px;background:${s.c}">${esc(s.s.slice(0, 2))}</span><div style="flex:1"><h3>Connect ${esc(c[1])}</h3><small class="hint">Step ${Math.min(i + 1, steps.length - 1)} of ${steps.length - 1}${last ? '' : ' · ' + esc(steps[i])}</small></div><button class="x" data-act="closeModal">${ico('x')}</button></div>
      <div class="mb"><div class="flow4">${steps.slice(0, -1).map((_, j) => `<span class="${j <= i ? 'on' : ''}"></span>`).join('')}</div>${last ? '' : `<h4 style="margin:0 0 12px;font-size:15px">${esc(steps[i])}</h4>`}${body}
      <div style="display:flex;gap:8px;margin-top:18px">${i && !last ? `<button class="btn btn-o btn-sm" data-act="chBack">Back</button>` : ''}<span style="flex:1"></span><button class="btn btn-g btn-sm" data-act="${last ? 'chDone' : 'chNext'}">${last ? 'Go to inbox' : i === steps.length - 2 ? 'Activate channel' : 'Continue'}</button></div></div>`, 'lg');
  }
  PWA.acts.chNext = () => { const c = CH.find(x => x[0] === CW.k); CW.step = Math.min(CW.step + 1, c[5].length); if (CW.step === c[5].length) { S.chOn[CW.k] = 1; save(); render(); } chw(); };
  PWA.acts.chBack = () => { CW.step = Math.max(0, CW.step - 1); chw(); };
  PWA.acts.chDone = () => { closeModal(); S.inboxCh = CW.k; S.thread = null; save(); go('inbox'); toast(PW.SOURCES[CW.k].l + ' connected'); };
  PWA.acts.connect = k => PWA.acts.chConnect(k);

  /* ============ VERTICAL PACK PAGES ============ */
  const secs = name => ((PACKS.sec[PK[S.pack]] || {})[name]) || [];
  const offersOf = () => Object.entries((PACKS.offers[PK[S.pack]] || {}).offers || {});
  const modsGrid = name => `<div class="mods">${secs(name).map((m, i) => `<div class="md" data-act="toastX" data-arg="${esc(m)} opened"><span class="ic">${ico(['grid', 'layers', 'file', 'wrench', 'chart', 'alert', 'users', 'cal'][i % 8])}</span><div><b>${esc(m)}</b><small>${[12, 4, 28, 7, 3, 16, 9, 21, 5, 2, 11, 6][i % 12]} records · ${i % 3 ? 'up to date' : 'needs review'}</small></div></div>`).join('')}</div>`;
  const pnav = () => packNav();
  const nm = id => (pnav().find(x => x[0] === id) || [, id])[1];
  const isCore = () => ['spaces', 'services'].includes(S.pack);

  PWA.pages.overview = () => {
    const sp = S.pack === 'spaces', core = isCore();
    const s = sp ? [['Live marketplace', '8 listings', '1 awaiting approval'], ['Demand', '11 active leads', '3 require response'], ['Portfolio', '113 units', '92% occupied'], ['Exceptions', '9 open', '5 maintenance · 4 cases']] : [['Live marketplace', offersOf().length + ' offerings', 'All catalogue connected'], ['Demand', '12 active requests', '3 require response'], ["Today's delivery", '18 tasks', '15 within SLA'], ['Exceptions', '4 open', '1 escalated']];
    const [o0, of] = offersOf()[0] || ['', { flow: [] }];
    return head(`${PKL(S.pack)} command centre`, `Demand, operations, people and performance for your ${PKL(S.pack).toLowerCase()} business.`, `<button class="btn btn-g btn-sm" data-go="portfolio">${ico('plus')}${esc(nm('portfolio'))}</button>`) +
      `<div class="g4">${s.map(k => `<div class="kpi" data-go="${/Demand/.test(k[0]) ? 'leads' : /Exceptions/.test(k[0]) ? 'cases' : 'portfolio'}"><small>${k[0]}</small><b style="font-size:22px">${k[1]}</b><span class="d" style="color:var(--ink3)">${k[2]}</span></div>`).join('')}</div>
      <div class="g2 mt"><section class="pn"><div class="pn-h"><h2>Requires attention</h2><span class="sub">Across marketplace and operations</span></div>
        ${[['Respond to new ' + o0 + ' request', 'Marketplace lead · response SLA due soon', '12 min', 'leads'], ['Approve completed customer documents', 'Remote review · assigned to Operations Manager', 'Today', 'deals'], ['Resolve failed payment', 'Customer informed automatically · finance approval required', 'Overdue', 'finance'], ['Review on-ground completion', 'Technician uploaded evidence and customer sign-off', '2:30 PM', 'ops']].map(t => `<div class="ar" style="cursor:pointer" data-go="${t[3]}"><span class="st ${/Overdue|12/.test(t[2]) ? 'warn' : ''}" style="width:8px;padding:0;height:8px"></span><div class="bd"><b>${t[0]}</b><small>${t[1]}</small></div><span class="tmr ${/Overdue/.test(t[2]) ? '' : 'ok'}">${t[2]}</span></div>`).join('')}</section>
      <section class="pn"><div class="pn-h"><h2>Delivery today</h2><span class="sub">How work is being executed</span></div>${tbl(['Mode', 'Work', 'Within SLA', 'Exceptions'], [['Agentic', '32', '97%', '1'], ['Remote', '14', '93%', '2'], ['On-ground', '9', '89%', '2'], ['Hybrid', '6', '92%', '1']])}</section></div>
      <section class="pn mt"><div class="pn-h"><h2>Active workflow</h2><span class="sub">${esc(o0)} · one connected record</span></div><div class="wf">${of.flow.map((f, i) => `<div class="${i < 2 ? 'd' : i === 2 ? 'c' : ''}">${esc(f)}<small>${i < 2 ? 'Done' : i === 2 ? 'Current' : ''}</small></div>`).join('')}</div></section>
      <section class="pn mt"><div class="pn-h"><h2>Business performance</h2><span class="sub">Provider → branch → offering → transaction → task</span></div>${tbl(['Measure', 'Current', 'Target', 'Action'], [['Lead response', '8 min', 'Under 10 min', '§On track'], ['Task SLA', '92%', '95%', '§Improve|warn'], ['Capacity used', '78%', '75–85%', '§Healthy'], ['Rework', '3.8%', 'Below 3%', '§Review|warn'], ['Contribution margin', '41%', '40%', '§On track']])}</section>`;
  };

  // catalogue + transactions for non-core packs
  const basePortfolio = PWA.pages.portfolio, baseDeals = PWA.pages.deals;
  PWA.pages.portfolio = () => {
    if (isCore()) return basePortfolio();
    const n = nm('portfolio'), V = UP.VERTICALS[S.pack];
    return head(esc(n), `Offerings you publish on the UpNow marketplace.`, `<button class="btn btn-g btn-sm" data-act="toastX" data-arg="New offering wizard opened">${ico('plus')}Add offering</button>`) +
      `<div class="lgrid">${offersOf().map(([k, o], i) => { const vo = V && V.offers[i]; const img = vo && (vo.img[0] || vo.hero); return `<article class="lcard" data-act="toastX" data-arg="${esc(k)} opened"><div class="im">${img ? `<img src="${img}" alt="">` : `<div class="tile" style="--h:${150 + i * 40}"><b>${ico(PKI[S.pack])}</b><span>${esc(k)}</span></div>`}${st(i === 2 ? 'Draft' : 'Live', i === 2 ? 'mute' : '')}<span class="cat">${esc(k)}</span></div><div class="bd"><b class="t">${esc(k)} · Greenstone</b><span class="pr">${esc(o.basis)}</span><span class="hint">Customer action: <b>${esc(o.cta)}</b></span></div><div class="ms"><div><small>Views</small><b>${[1240, 860, 0, 420][i % 4]}</b></div><div><small>Leads</small><b>${[42, 28, 0, 11][i % 4]}</b></div><div><small>Quality</small><b>${[91, 84, 50, 77][i % 4]}</b></div></div></article>`; }).join('')}<button class="addc" data-act="toastX" data-arg="New offering wizard opened"><i>${ico('plus')}</i>Add offering</button></div>
      <div class="sect-t" style="margin-top:24px">${esc(n)} modules</div>${modsGrid(n)}`;
  };
  PWA.pages.deals = () => {
    if (isCore()) return baseDeals();
    const n = nm('deals'); const [o0, of] = offersOf()[0] || ['', { flow: [] }];
    return head(esc(n), `Customer records for ${PKL(S.pack).toLowerCase()} — from request to completion.`) + `<section class="pn"><div class="pn-h"><h2>Customer workflow</h2><span class="sub">${esc(o0)}</span></div><div class="wf">${of.flow.map((f, i) => `<div class="${i < 2 ? 'd' : i === 2 ? 'c' : ''}">${esc(f)}</div>`).join('')}</div></section><div class="sect-t" style="margin-top:20px">Modules</div>${modsGrid(n)}`;
  };
  PWA.pages.ops = () => { const n = nm('ops'); return head(esc(n), `${PKL(S.pack)} delivery — assignments, work orders, vendors and evidence.`) + `<div class="g4" style="margin-bottom:16px">${[['My work', '7 tasks', '2 on-ground'], ['Work orders', '14 open', '3 overdue'], ['Vendors', '18 active', '5 annual contracts'], ['SLA', '92%', 'Target 95%']].map(k => `<div class="kpi"><small>${k[0]}</small><b style="font-size:22px">${k[1]}</b><span class="d" style="color:var(--ink3)">${k[2]}</span></div>`).join('')}</div>` + modsGrid(n); };
  PWA.pages.perf = () => { const t = S.perfTab || 'Team'; return head('Performance & Economics', 'Expected versus delivered across people, agents and vendors.') + `<div class="g4" style="margin-bottom:16px">${[['Completed', '324'], ['Within SLA', '92%'], ['Revenue', 'AED 486k'], ['Contribution', '41%']].map(k => `<div class="kpi"><small>${k[0]}</small><b style="font-size:22px">${k[1]}</b></div>`).join('')}</div>` + tabsUI(['My Work', 'Team', 'Economics', 'Exceptions'], t, 'perfTab') +
    `<section class="pn">${t === 'Economics' ? tbl(['Task', 'Plan / actual', 'Labour', 'Vendor & materials', 'Revenue', 'Margin'], [['Customer qualification', '15m / 18m', 'AED 24', '—', 'AED 80', '70%'], [S.pack === 'spaces' ? 'Viewing & inspection' : 'Deliver service', '2h / 2h 20m', 'AED 180', 'AED 130', 'AED 520', '§40%|warn'], ['Quality verification', '10m / 12m', 'AED 16', '—', 'AED 50', '68%']])
      : t === 'Exceptions' ? [['Vendor Team A missed 3 requests', '89% SLA · 2 late arrivals · 1 rework', 'Reassign'], ['Ahmed above task-time standard', 'Viewing time is 17% above plan', 'Coach'], ['UpNow agent healthy', '145 of 148 actions completed · 3 exceptions routed', '98%']].map(x => `<div class="ar"><div class="bd"><b>${x[0]}</b><small>${x[1]}</small></div><button class="btn btn-o btn-sm" data-act="toastX" data-arg="${x[2]}">${x[2]}</button></div>`).join('')
      : tbl(['Person / executor', 'Expected', 'Capacity', 'Completed', 'SLA', 'Quality', 'Cost', 'Outcome'], [['Ahmed · Manager', '30 tasks · 95% SLA', '38h / 40h', '28', '94%', '4.8', 'AED 18.4k', '§On target'], ['Sara · Operations', '25 tasks · 95% SLA', '34h / 40h', '26', '97%', '4.7', 'AED 12.8k', '§On target'], ['Vendor Team A', '22 tasks · 92% SLA', 'Full', '19', '89%', '4.4', 'AED 9.2k', '§Below SLA|warn'], ['UpNow agent', '120 tasks', 'Unlimited', '118', '99%', '—', 'AED 0.6k', '§Ahead']].slice(t === 'My Work' ? 0 : 0, t === 'My Work' ? 1 : 4))}</section>`; };
  PWA.acts.perfTab = t => { S.perfTab = t; save(); render(); };
  PWA.pages.cases = () => { const n = nm('cases'), sp = S.pack === 'spaces'; return head(esc(n), '') + `<section class="pn"><div class="pn-h"><h2>Case stages</h2></div><div class="wf">${(sp ? ['Reminder', 'Warning', 'Formal notice', 'Case filed', 'Decision / settlement', 'Closed'] : ['Reported', 'Investigated', 'Action', 'Customer response', 'Resolution', 'Closed']).map((x, i) => `<div class="${i < 1 ? 'd' : i === 1 ? 'c' : ''}">${x}</div>`).join('')}</div></section>
    <section class="pn mt">${tbl(['Case', 'Customer', 'Related record', 'Owner', 'Stage', 'Next action'], [['CASE-241', 'Aisha Al Mansoori', 'AGR-2091 · active', 'Operations Manager', 'Warning', '§Customer acknowledgement|warn'], ['CASE-238', 'Omar Hassan', 'Bounced cheque 2 of 4', 'Finance Manager', 'Formal notice', '§Approve escalation|risk']])}</section><div class="sect-t" style="margin-top:20px">Case types</div>${modsGrid(n)}`; };
  PWA.pages.reports = () => { const t = S.repTab || 'Sales & conversion'; return head('Reports', `Shared reports plus ${PKL(S.pack).toLowerCase()}-specific operational reports.`, `<button class="btn btn-o btn-sm" data-act="toastX" data-arg="Report exported">Export report</button>`) + `<div class="fbar">${['Sales & conversion', 'Operations & SLA', 'Capacity & utilization', 'Performance & economics', 'Quality & rework', 'Customers', 'Cases'].map(x => `<button class="chip ${x === t ? 'on' : ''}" data-act="repTab" data-arg="${x}">${x}</button>`).join('')}</div>
    <section class="pn"><div class="pn-h"><h2>${esc(PKL(S.pack))} · ${esc(t)}</h2><span class="sub">Last 12 months</span></div><div class="g4">${[['Orders', '96', '+12%'], ['Revenue', 'AED 486k', '+9%'], ['SLA', '92%', 'Target 95%'], ['Margin', '41%', 'Target 40%']].map(k => `<div class="kpi"><small>${k[0]}</small><b style="font-size:22px">${k[1]}</b><span class="d">${k[2]}</span></div>`).join('')}</div>
    <div class="bars">${[40, 55, 48, 62, 70, 66, 78, 84, 80, 92, 88, 96].map(h => `<div style="height:${h}%"></div>`).join('')}</div><div style="display:flex;gap:10px;font-size:11px;color:var(--ink3);margin-top:6px">${['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map(m => `<span style="flex:1;text-align:center">${m}</span>`).join('')}</div></section>`; };
  const baseAdd = PWA.acts.addListing;
  PWA.acts.addListing = a => { if (isCore()) { if (S.v !== S.pack) S.v = S.pack; return baseAdd(a); } toast('New ' + PKL(S.pack).toLowerCase() + ' offering wizard opened'); go('portfolio'); };
  PWA.acts.repTab = t => { S.repTab = t; save(); render(); };
})();
