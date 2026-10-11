/* Provider Workspace — core: icons, state, shell, drawer/modal/toast helpers */
(function () {
  const P = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    building: '<path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 9h4a1 1 0 0 1 1 1v11M3 21h18M8 8h3M8 12h3M8 16h3"/>',
    wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3 17.8V21h3.2l6.3-6.3a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5M16 4.8a3.2 3.2 0 0 1 0 6.2M18 14.8c1.8.6 3 2.4 3 5.2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    shield: '<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6z"/><path d="m8.8 12 2.2 2.2 4.3-4.4"/>',
    phone: '<path d="M5 3h3.5l1.8 4.6-2.3 1.5a11 11 0 0 0 6 6l1.5-2.3L20 14.5V18a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
    wa: '<path d="M4 20l1.2-3.8A8.5 8.5 0 1 1 8 19z"/><path d="M9 9.2c.2 2.6 3 5.2 5.6 5.6l1.1-1.3-1.8-.9-.8.8c-1-.4-2.2-1.6-2.6-2.6l.8-.8-.9-1.8z"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    chev: '<path d="m6 9 6 6 6-6"/>', chevR: '<path d="m9 6 6 6-6 6"/>', chevL: '<path d="m15 6-6 6 6 6"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20a2 2 0 0 0 4 0"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    inbox: '<path d="M3 13h5l1.5 3h5l1.5-3h5M5 5h14l2 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z"/>',
    msg: '<path d="M4 5h16v11H9l-5 4z"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    trend: '<path d="m3 17 6-6 4 4 8-8M15 7h6v6"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    kanban: '<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="10" rx="1.5"/><rect x="17" y="4" width="4" height="13" rx="1.5"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    file: '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    play: '<path d="M7 4v16l13-8z"/>',
    send: '<path d="M4 12 20 4l-6 16-3-7z"/><path d="m11 13 9-9"/>',
    note: '<path d="M5 4h14v11l-5 5H5z"/><path d="M14 20v-5h5"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 17-5-5L5 20"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M4 16v4h16v-4"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
    dots: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3M15 8l2 2"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    brief: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18"/>',
    alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.3 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5M12 6v2M12 16v2"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    badge: '<path d="m8.5 12 2.5 2.5 4.5-5"/><circle cx="12" cy="12" r="9"/>',
    grad: '<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11v5c3 2.5 9 2.5 12 0v-5M22 9v6"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-10.1A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.9-3M4 13a8 8 0 0 0 14.9 3M4 4v4h4M20 20v-4h-4"/>'
  };
  const ico = (n, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24">${P[n] || P.grid}</svg>`;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const initials = n => n.split(/\s+/).map(x => x[0]).slice(0, 2).join('').toUpperCase();
  const av = (n, cls = '') => `<span class="av ${cls}">${esc(initials(n))}</span>`;
  const aed = n => 'AED ' + Math.round(n).toLocaleString();
  const ago = m => m < 60 ? m + 'm' : m < 1440 ? Math.round(m / 60) + 'h' : Math.round(m / 1440) + 'd';
  const hm = h => { const H = Math.floor(h), M = Math.round((h - H) * 60); const hh = H % 12 || 12; return hh + (M ? ':' + String(M).padStart(2, '0') : '') + (H < 12 ? ' AM' : ' PM'); };
  const spark = (a, c = 'var(--g6)') => { const mx = Math.max(...a), mn = Math.min(...a), w = 100, h = 30; const pts = a.map((v, i) => [i * (w / (a.length - 1)), h - 3 - ((v - mn) / (mx - mn || 1)) * (h - 6)]); const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(''); return `<svg class="spk" viewBox="0 0 100 30" preserveAspectRatio="none"><path d="${d} L100 30 L0 30Z" fill="${c}" opacity=".1"/><path d="${d}" fill="none" stroke="${c}" stroke-width="1.8" vector-effect="non-scaling-stroke"/></svg>`; };
  const st = (t, k = '') => `<span class="st ${k}">${esc(t)}</span>`;

  /* ---------- state (persisted) ---------- */
  const KEY = 'upnow.pw.v1';
  let saved = {}; try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
  const S = Object.assign({ v: 'spaces', page: 'demand', leadView: 'board', calView: 'week', inboxCh: 'all', inboxFilter: 'open', thread: null, stages: {}, extraListings: [], extraEvents: [], sent: {}, read: {}, chOn: {}, calOff: [], lstFilter: 'all', pack: null, active: ['spaces', 'services'], cc: 'AE', lang: 'en', setTab: 'Overview' }, saved);
  if (!S.pack) S.pack = S.v;
  if (window.PW_START) S.page = window.PW_START === 'business' ? 'finance' : window.PW_START;
  { const q = new URLSearchParams(location.search); if (q.get('pack')) { S.pack = q.get('pack'); if (!S.active.includes(S.pack)) S.active.push(S.pack); if (['spaces', 'services'].includes(S.pack)) S.v = S.pack; } }
  const save = () => localStorage.setItem(KEY, JSON.stringify(S));

  /* derived collections */
  // how a customer reached the provider: channels only — UpNow has no booking or request flows, every contact is a lead
  // the in-app chat follows the website's switch (data/site.js SITE.chat — on hold while false)
  const CHAT = !!(window.SITE && SITE.chat);
  const ACTS = { call: ['Call', 'phone', 'call'], wa: ['WhatsApp', 'wa', 'wa'], ...(CHAT ? { chat: ['UpNow chat', 'msg', 'chat'] } : {}), sms: ['SMS', 'msg', 'chat'], form: ['Email', 'mail', 'form'] };
  const actOf = l => { if (l.src === 'wa' || l.src === 'ig') return 'wa'; if (l.src === 'phone') return 'call'; if (l.src !== 'upnow') return 'form'; const n = +l.id.replace(/\D/g, '') || 0; return (CHAT ? ['chat', 'call', 'wa', 'sms'] : ['call', 'wa', 'sms', 'wa'])[n % 4]; };
  const leads = () => PW.LEADS.filter(l => l.v === S.v).map(l => ({ ...l, stage: S.stages[l.id] || l.stage, act: actOf(l) }));
  // the provider's own listings (pw/new-provider.js) first, then the sample ones
  const listings = () => [...S.extraListings.filter(l => l.mine), ...PW.LISTINGS, ...S.extraListings.filter(l => !l.mine)].filter(l => l.v === S.v);
  const listingById = id => [...PW.LISTINGS, ...S.extraListings].find(l => l.id === id);
  const events = () => [...PW.EVENTS, ...S.extraEvents].filter(e => e.v === S.v);
  const VX = () => PW.V[S.v];
  const catLabel = id => { for (const k in PW.V) { const c = PW.V[k].cats.find(c => c.id === id); if (c) return c.l; } return id; };
  const unread = () => leads().filter(l => !S.read[l.id] && ['new'].includes(l.stage)).length;

  /* ---------- country / currency / language ---------- */
  const COUNTRIES = { AE: ['🇦🇪', 'UAE', 'AED', 1], OM: ['🇴🇲', 'Oman', 'OMR', .1048], SA: ['🇸🇦', 'Saudi Arabia', 'SAR', 1.021], QA: ['🇶🇦', 'Qatar', 'QAR', .991], US: ['🇺🇸', 'USD view', 'USD', .2723], GB: ['🇬🇧', 'GBP view', 'GBP', .2105], EU: ['🇪🇺', 'EUR view', 'EUR', .2512], IN: ['🇮🇳', 'INR view', 'INR', 22.7] };
  // the site-wide setting ('upnow.prefs': {lang, cur}, js/core/utils.js): the dashboard follows it and writes it back, so the
  // customer site, this dashboard and the team's admin always show the same language and currency
  const SITEPREFS = (() => { try { return JSON.parse(localStorage.getItem('upnow.prefs')) || {}; } catch (e) { return {}; } })();
  if (SITEPREFS.lang) S.lang = SITEPREFS.lang;
  if (SITEPREFS.cur && COUNTRIES[S.cc] && COUNTRIES[S.cc][2] !== SITEPREFS.cur) { const k = Object.keys(COUNTRIES).find(c => COUNTRIES[c][2] === SITEPREFS.cur); if (k) S.cc = k; }
  const sharePrefs = () => { SITEPREFS.lang = S.lang; SITEPREFS.cur = (COUNTRIES[S.cc] || COUNTRIES.AE)[2]; localStorage.setItem('upnow.prefs', JSON.stringify(SITEPREFS)); };
  const fx = html => { const C = COUNTRIES[S.cc] || COUNTRIES.AE; if (C[2] === 'AED') return html; return html.replace(/AED\s?([\d][\d,]*(?:\.\d+)?)(k)?/g, (m, n, k) => { const v = parseFloat(n.replace(/,/g, '')) * C[3]; return C[2] + ' ' + (k ? (v < 10 ? v.toFixed(1) : Math.round(v)) + 'k' : (v < 100 ? v.toFixed(v < 10 ? 2 : 1) : Math.round(v).toLocaleString())); }); };

  /* ---------- toast / modal / drawer ---------- */
  function toast(msg) { const t = $('#toast'); t.innerHTML = ico('check') + esc(msg); t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 2400); }
  function modal(html, cls = '') { const s = $('#scrim'); s.innerHTML = fx(`<div class="modal ${cls}">${html}</div>`); s.classList.add('on'); }
  function closeModal() { $('#scrim').classList.remove('on'); }
  function drawer(html, wide) { $('#drawer').classList.toggle('wide', !!wide); $('#drawer').innerHTML = fx(html); $('#drawer').classList.add('on'); $('#dscrim').classList.add('on'); }
  function closeDrawer() { $('#drawer').classList.remove('on'); $('#dscrim').classList.remove('on'); }
  function pop(html, x, y) { const p = $('#pop'); p.innerHTML = fx(html); p.classList.add('on'); const w = 300, h = p.offsetHeight; p.style.left = Math.min(x, innerWidth - w - 12) + 'px'; p.style.top = Math.min(y, innerHeight - h - 12) + 'px'; }
  function closePop() { $('#pop').classList.remove('on'); }

  /* ---------- navigation ---------- */
  const PK = { spaces: 'Spaces', services: 'Services', experiences: 'Experiences', memberships: 'Memberships', programs: 'Programs', health: 'Health', insurance: 'Insurance' };
  const PKL = v => v === 'insurance' ? 'Protection' : PK[v];
  const PKI = { spaces: 'building', services: 'wrench', experiences: 'compass', memberships: 'badge', programs: 'grad', health: 'heart', insurance: 'shield' };
  const PICO = ['grid', 'layers', 'brief', 'wrench', 'chart', 'alert', 'file'];
  const packNav = () => (PACKS.nav[PK[S.pack]] || []).map((n, i) => [i === 0 ? 'overview' : i === 1 ? 'portfolio' : i === 2 ? 'deals' : /Performance/.test(n) ? 'perf' : /Case|Compliance/.test(n) ? 'cases' : /Reports/.test(n) ? 'reports' : 'ops', n, PICO[i] || 'grid']);
  const pageName = id => { if (id === 'portfolio') return 'Portfolio'; const x = (PWA.navExtra || []).find(n => n[0] === id); if (x) return x[1]; const s = SHARED().find(x => x[0] === id); if (s) return s[1]; const p = packNav().find(x => x[0] === id); return p ? p[1] : 'Workspace'; };
  const SHARED = () => [['demand', 'Demand', 'trend'], ['leads', 'Leads', 'kanban', leads().filter(l => l.stage === 'new').length, 1], ['calendar', 'Calendar', 'cal', events().filter(e => e.d === 1).length], ['inbox', 'Communications', 'inbox', unread()], ['settings', 'Settings', 'gear']];
  // one list: Portfolio first (every listing, every business type — pw/portfolio.js), then pages other modules add
  // (PWA.navExtra — pw/new-provider.js adds "Application" while it's in review), then the shared tools.
  // Money and the per-vertical pack pages (overview, transactions, operations, performance, cases, reports) are hidden.
  const NAV = () => { const sh = SHARED(); return [['', [['portfolio', 'Portfolio', 'layers'], ...(PWA.navExtra || []), ...sh]]]; };
  const HIDDEN = ['finance', 'overview', 'deals', 'ops', 'perf', 'cases', 'reports'];
  function go(page) { if (window.PW_MULTI && page !== window.PW_START) { S.page = page; save(); location.href = page + '.html' + location.search; return; } S.page = page; save(); closeDrawer(); closePop(); render(); }
  function setV(v) { if (!S.active.includes(v)) { PWA.acts.activatePack(v); return; } S.pack = v; if (PW.V[v]) { S.v = v; S.thread = null; } else if (!['overview', 'portfolio', 'deals', 'ops', 'perf', 'cases', 'reports'].includes(S.page)) S.page = 'overview'; save(); closePop(); render(); toast('Switched to ' + PKL(v) + ' pack'); }

  function shell() {
    const [sh, pk] = NAV();
    const item = ([id, l, i, n, red], cls) => `<a class="ni ${cls} ${S.page === id ? 'on' : ''}" data-go="${id}">${ico(i)}<span>${esc(l)}</span>${n ? `<em class="n ${red ? 'r' : ''}" style="font-style:normal">${n}</em>` : ''}</a>`;
    $('#sb').innerHTML = `<a class="logo" data-go="demand" style="cursor:pointer"><b>U</b><span>UpNow</span><small class="pro">Provider</small></a>
      <div class="biz" data-act="setTabGo" data-arg="Account &amp; KYC"><span class="av">GS</span><div><b>Greenstone</b><small>Verified provider · ${COUNTRIES[S.cc][1]}</small></div></div>
      <nav class="osbox" aria-label="Provider dashboard">${sh[1].map(x => (x[0] === 'settings' ? '<hr class="nv-rule">' : '') + item(x, 'os')).join('')}</nav>
      <a class="explore" href="../../index.html">${ico('compass')}<span>Customer site</span></a>
      <div class="sp"></div>`;
  }
  function topbar() {
    const C = COUNTRIES[S.cc];
    $('#top').innerHTML = `<label class="srch">${ico('search')}<input id="gsearch" placeholder="Search leads, listings, customers…"></label><span class="sp"></span>
      <button class="btn btn-g btn-sm" data-act="addListing">${ico('plus')}Add listing</button>
      <label class="tsel"><select id="ccSel">${Object.entries(COUNTRIES).map(([k, x]) => `<option value="${k}" ${k === S.cc ? 'selected' : ''}>${x[0]} ${x[1]} · ${x[2]}</option>`).join('')}</select>${ico('chev')}</label>
      <label class="tsel g"><select id="lgSel"><option value="en" ${S.lang === 'en' ? 'selected' : ''}>English</option><option value="ar" ${S.lang === 'ar' ? 'selected' : ''}>العربية</option></select>${ico('chev')}</label>
      <button class="ib" data-go="inbox" title="Notifications">${ico('bell')}<i></i></button>`;
    $('#ccSel').onchange = e => { S.cc = e.target.value; save(); sharePrefs(); render(); toast('Showing amounts in ' + COUNTRIES[S.cc][2]); };
    $('#lgSel').onchange = e => { S.lang = e.target.value; save(); sharePrefs(); applyLang(); toast(S.lang === 'ar' ? 'تم التبديل إلى العربية' : 'Switched to English'); };
    $('#gsearch').onkeydown = e => { if (e.key === 'Enter') { const q = e.target.value.toLowerCase(); const l = leads().find(x => x.n.toLowerCase().includes(q)); if (l) PWA.openLead(l.id); else { const li = listings().find(x => x.t.toLowerCase().includes(q)); if (li) PWA.openListing(li.id); else toast('No match for "' + e.target.value + '"'); } } };
  }

  function applyLang() { document.documentElement.lang = S.lang; document.documentElement.dir = S.lang === 'ar' ? 'rtl' : 'ltr'; }
  function render() {
    // modules keep their own copy of this function, so a re-render they ask for would skip the add-ons that wrap
    // PWA.render (new top bar, the provider's own name, empty states): send those through the whole chain.
    // PWA._busy is set by the outermost wrapper (pw/topbar.js), so the chain itself still lands here.
    if (!PWA._busy && PWA.render !== render) return PWA.render();
    // a hidden page opened by its old link goes to Portfolio
    if (HIDDEN.includes(S.page)) { S.page = 'portfolio'; if (window.PW_MULTI && window.PW_START !== 'portfolio') { save(); location.replace('portfolio.html' + location.search); return; } }
    applyLang();
    shell(); topbar();
    const view = $('#view');
    const pg = PWA.pages[S.page] || PWA.pages.demand;
    view.className = 'view pg-' + S.page + (S.page === 'inbox' ? ' flush' : '');
    view.innerHTML = fx(pg());
    view.scrollTop = 0;
    if (PWA.after[S.page]) PWA.after[S.page]();
    document.title = 'UpNow Provider · ' + pageName(S.page);
  }

  /* global delegated clicks */
  document.addEventListener('click', e => {
    const g = e.target.closest('[data-go]'); if (g) { e.preventDefault(); go(g.dataset.go); return; }
    const v = e.target.closest('[data-v]'); if (v) { setV(v.dataset.v); return; }
    const a = e.target.closest('[data-act]'); if (a) { const f = PWA.acts[a.dataset.act]; if (f) f(a.dataset.arg, a, e); return; }
    if (!e.target.closest('#pop') && !e.target.closest('.ev')) closePop();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeDrawer(); closePop(); } });

  window.PWA = { CHAT, ACTS, COUNTRIES, PK, PKL, PKI, packNav, pageName, ico, esc, $, $$, av, aed, ago, hm, spark, st, S, save, leads, listings, listingById, events, VX, catLabel, toast, modal, closeModal, drawer, closeDrawer, pop, closePop, go, render, pages: {}, after: {}, acts: {} };
})();
