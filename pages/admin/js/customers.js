/* UpNow admin — Customers: who visits UpNow, where from, what they look at and who they contact.
   Customers never pay and never book: every contact (call, WhatsApp, email, SMS) is a lead for a provider, so this
   page follows the journey up to that contact — visits, searches, listings and providers viewed, saves, follows,
   saved searches, sign-ups and logins.
   Data: this browser's real activity (js/core/track.js → 'upnow.track', marked "This browser") plus a sample customer
   base built from the marketplace's own listings and providers (data/listings.js), like the rest of the admin samples.
   Country = the account's phone code, or the device's time zone; the sample's cities stand for what the server adds from
   the network address in production.
   Plugs into pages/admin/js/admin.js: it registers ADM_CUST before admin.js runs, admin.js calls init(api) and routes
   the "Customers" page and the c:<visitor> drawer here. */
(function () {
  let A = null; // the admin's helpers (init)
  const DAY = 864e5, NOW = Date.now();
  const read = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };

  /* ---------- reference ---------- */
  const CN = { AE: 'United Arab Emirates', SA: 'Saudi Arabia', QA: 'Qatar', OM: 'Oman', KW: 'Kuwait', BH: 'Bahrain', IN: 'India', PK: 'Pakistan', BD: 'Bangladesh', LK: 'Sri Lanka', NP: 'Nepal', PH: 'Philippines',
    EG: 'Egypt', JO: 'Jordan', LB: 'Lebanon', GB: 'United Kingdom', IE: 'Ireland', FR: 'France', DE: 'Germany', RU: 'Russia', TR: 'Türkiye', US: 'United States', CA: 'Canada', AU: 'Australia', SG: 'Singapore', CN: 'China' };
  const flag = cc => cc && cc.length === 2 ? String.fromCodePoint(...[...cc.toUpperCase()].map(c => 127397 + c.charCodeAt(0))) : '🌐';
  const cname = cc => CN[cc] || cc || 'Unknown';
  const SRC = { google: ['Google search', '#4285f4'], instagram: ['Instagram', '#d6249f'], facebook: ['Facebook', '#1877f2'], tiktok: ['TikTok', '#111'], whatsapp: ['Shared on WhatsApp', '#1faa59'],
    direct: ['Direct visit', '#5f7189'], bing: ['Bing search', '#008373'], linkedin: ['LinkedIn', '#0a66c2'], x: ['X (Twitter)', '#333'] };
  const srcName = s => (SRC[s] || [s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Unknown'])[0];
  const CH = { wa: ['WhatsApp', 'wa', '#1faa59'], call: ['Call', 'phone', '#b7791f'], email: ['Email', 'mail', '#256aa5'], sms: ['SMS', 'msg', '#7b5ea7'], chat: ['Chat', 'msg', '#136142'] };
  const DEV = { mobile: 'Phone', desktop: 'Computer', tablet: 'Tablet' };
  const VL = { spaces: 'Spaces', services: 'Services', experiences: 'Experiences', memberships: 'Memberships', programs: 'Programs', health: 'Health', insurance: 'Protection' };
  const VC = { spaces: '#047246', services: '#256aa5', experiences: '#b7791f', memberships: '#7b5ea7', programs: '#1faa59', health: '#c2413b', insurance: '#46534c' };
  const unitOf = l => { try { return UP.VERTICALS[l.v].offers.find(o => o.id === l.cat).unit(l) || ''; } catch (e) { return ''; } };
  const catOr = (v, c) => c ? cat(v, c) : VL[v] || v || '';
  const cat = (v, c) => { try { const o = UP.VERTICALS[v].offers.find(x => x.id === c); return o ? o.label : c; } catch (e) { return c; } };
  const area = id => { try { return UP.areaName(id); } catch (e) { return id; } };
  const byId = id => (window.UP && UP.LISTINGS.find(l => l.id === id)) || null;
  const SITE_ROOT = '../../';
  const lHref = id => SITE_ROOT + 'pages/listing.html?id=' + encodeURIComponent(id);
  const pHref = (n, kind) => SITE_ROOT + (kind === 'agency' ? 'pages/agency.html?a=' : 'pages/provider.html?p=') + encodeURIComponent(n);

  /* ---------- the sample customer base (same every time) ---------- */
  let seed = 9173; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const pick = a => a[Math.floor(rnd() * a.length)], wpick = W => { const tot = W.reduce((s, x) => s + x[1], 0); let r = rnd() * tot; for (const x of W) { if ((r -= x[1]) < 0) return x[0]; } return W[0][0]; };
  const CW = [['AE', 50], ['IN', 11], ['GB', 7], ['SA', 6], ['PK', 4], ['EG', 3], ['PH', 3], ['RU', 3], ['US', 3], ['DE', 2], ['OM', 2], ['QA', 2], ['LB', 1], ['JO', 1], ['FR', 1], ['CA', 1]];
  const CITY = { AE: [['Dubai', 70], ['Abu Dhabi', 14], ['Sharjah', 12], ['Ajman', 4]], IN: [['Mumbai', 3], ['Delhi', 3], ['Bengaluru', 2], ['Kochi', 2], ['Hyderabad', 1]], GB: [['London', 5], ['Manchester', 1], ['Birmingham', 1]],
    SA: [['Riyadh', 3], ['Jeddah', 2]], PK: [['Karachi', 2], ['Lahore', 2]], EG: [['Cairo', 1]], PH: [['Manila', 1]], RU: [['Moscow', 1]], US: [['New York', 1], ['Houston', 1]], DE: [['Berlin', 1]], OM: [['Muscat', 1]],
    QA: [['Doha', 1]], LB: [['Beirut', 1]], JO: [['Amman', 1]], FR: [['Paris', 1]], CA: [['Toronto', 1]] };
  const CUR = { AE: 'AED', IN: 'INR', GB: 'GBP', SA: 'SAR', US: 'USD', CA: 'USD', DE: 'EUR', FR: 'EUR', OM: 'OMR', QA: 'QAR' };
  const DIAL = { AE: '+971', IN: '+91', GB: '+44', SA: '+966', PK: '+92', EG: '+20', PH: '+63', RU: '+7', US: '+1', DE: '+49', OM: '+968', QA: '+974', LB: '+961', JO: '+962', FR: '+33', CA: '+1' };
  const AR = { AE: .3, SA: .7, EG: .7, OM: .6, QA: .6, JO: .6, LB: .5 };
  const NAMES = { AE: ['Mariam Al Hammadi', 'Omar Al Suwaidi', 'Fatima Al Ketbi', 'Rashid Al Mazrouei', 'Hessa Al Nuaimi', 'Khalid Al Falasi', 'Noura Al Shamsi', 'Saeed Al Mehairi', 'Ahmed Rahman', 'Lina Haddad', 'Sanjay Pillai', 'Joanna Reyes', 'Tom Hughes', 'Anita Kapoor', 'Yusuf Demir', 'Elena Sokolova'],
    IN: ['Rohan Mehta', 'Priya Sharma', 'Arjun Nair', 'Kavya Iyer', 'Vikram Singh', 'Sneha Reddy', 'Aditya Rao', 'Meera Joseph'], GB: ['Oliver Bennett', 'Emily Clarke', 'James Wright', 'Sophie Turner', 'Harry Collins'],
    SA: ['Abdullah Al Qahtani', 'Reem Al Otaibi', 'Faisal Al Harbi', 'Sara Al Dosari'], PK: ['Hamza Qureshi', 'Ayesha Malik', 'Bilal Khan'], EG: ['Mostafa Hassan', 'Nour El Din'], PH: ['Maria Santos', 'Joseph Cruz'],
    RU: ['Dmitry Volkov', 'Anna Petrova'], US: ['Michael Johnson', 'Ashley Brown'], DE: ['Lukas Schneider', 'Hannah Weber'], OM: ['Salim Al Balushi'], QA: ['Tamim Al Kuwari'], LB: ['Karim Nassar'], JO: ['Dana Haddad'], FR: ['Camille Martin'], CA: ['Ryan Thompson'] };
  const VW = [['spaces', 45], ['services', 18], ['experiences', 12], ['memberships', 8], ['programs', 8], ['health', 6], ['insurance', 3]];
  const VW_ABROAD = [['spaces', 58], ['experiences', 22], ['services', 6], ['programs', 6], ['health', 5], ['memberships', 3]];
  const SRC_FIRST = [['google', 38], ['instagram', 18], ['direct', 14], ['whatsapp', 10], ['facebook', 8], ['tiktok', 7], ['bing', 3], ['linkedin', 2]];
  const SRC_BACK = [['direct', 55], ['google', 18], ['whatsapp', 15], ['instagram', 12]];
  const CHW = [['wa', 46], ['call', 30], ['email', 14], ['sms', 10]];

  function sample() {
    seed = 9173; const E = [], V = [];
    const L = (window.UP && UP.LISTINGS) || []; if (!L.length) return { E, V };
    const offersOf = v => ((UP.VERTICALS[v] || {}).offers || []).filter(o => L.some(l => l.v === v && l.cat === o.id));
    const AREAS = (UP.AREAS || []).map(a => a.id);
    for (let i = 0; i < 520; i++) {
      const cc = wpick(CW), vid = 'V' + (100000 + Math.floor(rnd() * 899999)).toString(36).toUpperCase(), abroad = cc !== 'AE';
      const city = wpick(CITY[cc] || [['', 1]]), dev = wpick([['mobile', 68], ['desktop', 27], ['tablet', 5]]), lang = rnd() < (AR[cc] || 0) ? 'ar' : 'en', cur = CUR[cc] || 'AED';
      const reg = rnd() < .36, name = reg ? pick(NAMES[cc] || NAMES.AE) : '', uid = reg ? (DIAL[cc] || '+971') + (5 + Math.floor(rnd() * 4)) + String(Math.floor(rnd() * 1e8)).padStart(8, '0') : '';
      const live = i >= 511; // the newest few are on the site right now
      const first = live ? NOW - (2 + Math.floor(rnd() * 20)) * 60000 - Math.floor(rnd() * 3) * 7 * DAY * (rnd() < .5 ? 1 : 0) : NOW - Math.pow(rnd(), 2.1) * 365 * DAY;
      const n = live ? 1 + Math.floor(rnd() * 3) : wpick([[1, 48], [2, 20], [3, 13], [4, 8], [5, 5], [7, 4], [9, 2]]);
      const interest = wpick(abroad ? VW_ABROAD : VW), signupAt = reg ? Math.floor(rnd() * n) : -1;
      let t = first;
      const times = [first]; for (let k = 1; k < n; k++) { t += (rnd() < .4 ? 10 + rnd() * 70 : 0.3 + rnd() * 9) * DAY; /* some come back within days, others weeks or months later */ if (t > NOW - 3600000) break; times.push(t); }
      if (live && times.length > 1) times[times.length - 1] = NOW - (1 + Math.floor(rnd() * 14)) * 60000;
      else if (live) times[0] = NOW - (1 + Math.floor(rnd() * 14)) * 60000;
      times.sort((a, b) => a - b);
      times.forEach((t0, k) => {
        const sid = vid + '-' + k; let at = t0; const step = () => (at += (15 + rnd() * 200) * 1000);
        const ev = (kk, d) => E.push(Object.assign({ t: at, vid, sid, k: kk, sample: true }, d || {}, reg && k >= signupAt ? { uid, name } : {}));
        const land = rnd() < .55 ? 'home' : 'search';
        ev('visit', { src: k ? wpick(SRC_BACK) : wpick(SRC_FIRST), dev, cc, city, lang, cur, land, n: k + 1, ccBy: reg && k >= signupAt ? 'phone' : 'network' });
        if (reg && k > signupAt && rnd() < .65) { step(); ev('login', { name, cc }); }
        step(); ev('page', { p: land });
        if (!live && rnd() < (k ? .1 : .2)) return; // left after one page
        const v = rnd() < .78 ? interest : wpick(VW), offs = offersOf(v); if (!offs.length) return;
        const o = pick(offs), searched = land === 'search' || rnd() < .55, locs = searched && v === 'spaces' && rnd() < .6 ? [pick(AREAS), ...(rnd() < .3 ? [pick(AREAS)] : [])] : [];
        if (searched) { step(); ev('search', { v, o: o.id, loc: [...new Set(locs)], q: '' }); }
        if (searched && !live && rnd() < .12) return; // searched, opened nothing
        const pool = L.filter(l => l.v === v && l.cat === o.id && (!locs.length || locs.includes(l.loc))), pool2 = pool.length ? pool : L.filter(l => l.v === v && l.cat === o.id);
        const nv = 1 + Math.floor(rnd() * (k ? 4 : 6)), seen = [];
        for (let j = 0; j < nv; j++) { const l = pick(pool2); if (!l) break; seen.push(l); step(); ev('page', { p: 'listing' }); ev('view', { lid: l.id, v: l.v, cat: l.cat, loc: l.loc, provider: l.provider.name, price: l.price }); }
        if (k === signupAt) { step(); ev('signup', { name, cc }); }
        const last = seen[seen.length - 1];
        if (last && rnd() < .3) { step(); ev('page', { p: 'provider' }); ev('prov', { n: last.provider.name, kind: 'agent' }); }
        if (last && rnd() < .24) { const l = pick(seen); step(); ev('save', { lid: l.id, v: l.v, cat: l.cat, provider: l.provider.name }); }
        if (reg && k >= signupAt && last && rnd() < .05) { step(); ev('follow', { n: last.provider.name, kind: 'agent' }); }
        if (rnd() < .05) { step(); ev('alert', { label: cat(v, o.id) + (locs.length ? ' in ' + area(locs[0]) : ''), v }); }
        if (last && rnd() < (reg ? .36 : .14) + (k ? .08 : 0)) { const l = pick(seen); step(); ev('contact', { ch: wpick(CHW), lid: l.id, provider: l.provider.name, org: l.provider.org, v: l.v, cat: l.cat, title: l.title }); }
      });
      V.push(vid);
    }
    return { E: E.filter(e => e.t <= NOW), V };
  }

  /* ---------- everyone, with their journey ---------- */
  let C = null;
  function build() {
    const s = sample(), real = (read('upnow.track') || []).filter(e => e && e.vid && e.k).map(e => Object.assign({ real: true }, e));
    const E = [...s.E, ...real].sort((a, b) => a.t - b.t), M = {};
    E.forEach(e => {
      const c = M[e.vid] || (M[e.vid] = { vid: e.vid, real: !!e.real, events: [], sessions: {}, cc: '', city: '', dev: '', lang: '', cur: '', ccBy: '', first: e.t, last: e.t, name: '', uid: '' });
      c.events.push(e); c.last = e.t; if (e.uid) { c.uid = e.uid; if (e.name) c.name = e.name; }
      const S = c.sessions[e.sid] || (c.sessions[e.sid] = { sid: e.sid, t0: e.t, t1: e.t, events: [], src: '', dev: '' }); S.events.push(e); S.t1 = e.t;
      if (e.k === 'visit') { S.src = e.src; S.dev = e.dev; c.dev = e.dev || c.dev; c.lang = e.lang || c.lang; c.cur = e.cur || c.cur; if (e.cc) { c.cc = e.cc; c.ccBy = e.ccBy || ''; } if (e.city) c.city = e.city; }
      if ((e.k === 'login' || e.k === 'signup') && e.cc) { c.cc = e.cc; c.ccBy = 'phone'; }
    });
    const list = Object.values(M).map(c => {
      const ss = Object.values(c.sessions).sort((a, b) => a.t0 - b.t0); ss.forEach((x, i) => { x.n = i + 1; if (!x.src) x.src = 'direct'; });
      const n = k => c.events.filter(e => e.k === k).length;
      const signedUp = c.events.find(e => e.k === 'signup'), interest = tally(c.events.filter(e => e.v && (e.k === 'view' || e.k === 'search')), e => e.v)[0];
      return Object.assign(c, { sessions: ss, visits: ss.length, views: n('view'), saves: n('save'), contacts: n('contact'), searches: n('search'), signedUp: signedUp ? signedUp.t : 0,
        account: !!c.uid, interest: interest ? interest[0] : '', src: ss[0] ? ss[0].src : 'direct', label: c.name || 'Visitor ' + c.vid.slice(-4) });
    });
    C = { E, list, byVid: Object.fromEntries(list.map(c => [c.vid, c])) };
    return C;
  }
  const tally = (arr, key) => { const m = {}; arr.forEach(x => { const k = key(x); if (k) m[k] = (m[k] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]); };
  const pct = (a, b) => b ? Math.round(a / b * 100) : 0;

  /* ---------- icons this page needs on top of the admin's ---------- */
  const PX = { cal: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>', globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>', msg: '<path d="M4 5h16v11H9l-5 4z"/>', bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20a2 2 0 0 0 4 0"/>',
    login: '<path d="M10 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M14 17l5-5-5-5M19 12H9"/>', plus: '<path d="M12 5v14M5 12h14"/>', star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
    device: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>', desktop: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>', pulse: '<path d="M3 12h4l3-7 4 14 3-7h4"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>', heartFill: '<path d="M12 20s-7.5-4.6-7.5-10.1A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" fill="currentColor"/>', link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    bars: '<path d="M4 20h16"/><rect x="5.5" y="11" width="3" height="6" rx="1"/><rect x="10.5" y="6" width="3" height="11" rx="1"/><rect x="15.5" y="9" width="3" height="8" rx="1"/>',
    funnel: '<path d="M3.5 5h17l-6.5 8v6l-4 1.5V13z"/>', plane: '<path d="M10.5 13.5 3 11l1.5-1.5 8 .5 4.5-4.5a2 2 0 0 1 3 3L15.5 13l.5 8-1.5 1.5-2.5-7.5-3 3V21l-1.5 1L6 18l-4-1.5L3 15h3z"/>',
    bolt: '<path d="M13 3 5 13.5h6L10 21l8-10.5h-6z"/>', store: '<path d="M4 9.5 5.5 4h13L20 9.5M4 9.5V20h16V9.5M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0M10 20v-5h4v5"/>',
    userPlus: '<circle cx="10" cy="8" r="4"/><path d="M3 20c.8-3.7 3.6-6 7-6s6.2 2.3 7 6M19 8v6M16 11h6"/>', users: '<circle cx="9" cy="8" r="3.6"/><path d="M2.5 20c.7-3.5 3.3-5.6 6.5-5.6s5.8 2.1 6.5 5.6M15.5 4.6a3.6 3.6 0 0 1 0 6.8M18 14.6c2 .7 3.2 2.6 3.6 5.4"/>',
    chat: '<path d="M4 5.5h16v10.5H10l-4.5 3.5V16H4z"/><path d="M8.5 9.5h7M8.5 12.5h4.5"/>', open: '<rect x="4" y="3.5" width="16" height="17" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    cursor: '<path d="m5 3 14 7.5-6 1.5-2.5 6.5z"/><path d="m13.5 13.5 5 5"/>', home: '<path d="M3.5 11 12 4l8.5 7M6 9.5V20h12V9.5"/>',
    google: '<path d="M20 12.2h-8v3.3h4.6a5 5 0 1 1-1.4-5.8l2.4-2.4A8.4 8.4 0 1 0 20.4 12c0-.3 0-.6-.1-.9" />', instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".9" fill="currentColor"/>',
    facebook: '<path d="M14 21v-7.5h2.6l.4-3H14V8.7c0-.9.3-1.5 1.6-1.5H17V4.5c-.3 0-1.2-.1-2.3-.1-2.3 0-3.7 1.4-3.7 3.9v2.2H8.5v3H11V21"/>', tiktok: '<path d="M13.5 3.5v11.8a3.3 3.3 0 1 1-3.3-3.3M13.5 3.5c.4 2.6 2.2 4.3 4.8 4.5"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>' };
  // how each source looks: icon + colour (brands keep their own colour)
  const SRC_I = { google: 'google', instagram: 'instagram', facebook: 'facebook', tiktok: 'tiktok', whatsapp: 'wa', direct: 'cursor', bing: 'search', linkedin: 'link', x: 'link' };
  const ic = n => PX[n] ? `<svg class="ico" viewBox="0 0 24 24">${PX[n]}</svg>` : A.ico(n);

  /* ---------- what each event says, in plain words ---------- */
  function say(e) {
    const l = e.lid ? byId(e.lid) : null, lt = l ? l.title : e.title || 'a listing', loc = Array.isArray(e.loc) ? e.loc.map(area).join(', ') : '';
    switch (e.k) {
      case 'visit': return [ic('pulse'), `Came to UpNow from <b>${A.esc(srcName(e.src))}</b>`, [DEV[e.dev], e.land === 'search' ? 'landed on search' : 'landed on the home page'].filter(Boolean).join(' · ')];
      case 'search': return [A.ico('search'), `Searched <b>${A.esc(cat(e.v, e.o) || VL[e.v] || e.q || 'everything')}</b>${loc ? ` in <b>${A.esc(loc)}</b>` : ''}`, VL[e.v] || ''];
      case 'view': return [A.ico('eye'), `Opened <a href="${lHref(e.lid)}" target="_blank" rel="noopener">${A.esc(lt)}</a>`, [cat(e.v, e.cat), e.loc && area(e.loc), e.provider].filter(Boolean).join(' · ')];
      case 'prov': return [A.ico('user'), `Looked at <a href="${pHref(e.n, e.kind)}" target="_blank" rel="noopener">${A.esc(e.n)}</a>’s profile`, e.kind === 'agency' ? 'Agency' : 'Provider'];
      case 'save': return [ic('heartFill'), `Saved <a href="${lHref(e.lid)}" target="_blank" rel="noopener">${A.esc(lt)}</a>`, e.provider || ''];
      case 'unsave': return [A.ico('x'), `Removed ${A.esc(lt)} from their shortlist`, ''];
      case 'alert': return [ic('bell'), `Saved a search: <b>${A.esc(e.label || VL[e.v] || 'search')}</b>`, 'Gets new matches'];
      case 'follow': return [ic('star'), `Followed <b>${A.esc(e.n)}</b>`, e.kind === 'agency' ? 'Agency' : 'Provider'];
      case 'contact': { const c = CH[e.ch] || [e.ch, 'msg']; return [(PX[c[1]] ? ic(c[1]) : A.ico(c[1])).replace('class="ico', `class="ico cu-ch-${e.ch}`), `Contacted <b>${A.esc(e.provider || 'a provider')}</b> by <b>${A.esc(c[0])}</b>`, `About <a href="${lHref(e.lid)}" target="_blank" rel="noopener">${A.esc(lt)}</a> — a lead for the provider`]; }
      case 'signup': return [ic('plus'), '<b>Created an account</b>', e.cc ? `${flag(e.cc)} ${A.esc(cname(e.cc))} mobile` : ''];
      case 'login': return [ic('login'), '<b>Logged in</b>', 'Came back to their account'];
      case 'logout': return [A.ico('out'), 'Signed out', ''];
      default: return null;
    }
  }
  const KIND_TONE = { contact: 'ok', signup: 'info', save: 'pink', follow: 'pink', alert: 'info', login: 'info', search: 'blue', view: 'violet', prov: 'violet', visit: 'mute' };

  /* ---------- the page: a vertical filter, then Overview · People · Contacts · Activity (the first page's look) ---------- */
  const VIEWS = [['summary', 'Overview'], ['wants', 'What they want'], ['where', 'Where they come from'], ['people', 'People'], ['contacts', 'Contacts'], ['activity', 'Activity']];
  const VORD = ['spaces', 'services', 'experiences', 'memberships', 'programs', 'health', 'insurance'];
  const store = (k, v) => { try { if (v === undefined) return localStorage.getItem('upnow.admin.' + k); localStorage.setItem('upnow.admin.' + k, v); } catch (e) {} return null; };
  let TAB = 'all', Q = '', VIEW = ['wants', 'where', 'people', 'contacts', 'activity'].includes(store('cuView')) ? store('cuView') : 'summary', VERT = store('cuVert') || 'all', CF = 'all', AF = 'all';
  // pages of the long lists, and "focus": a group of people picked from an insight card (shown on People)
  let PG = { people: 0, contacts: 0, activity: 0 }, FOC = null, FOCI = {};
  // "Visitors and contacts" can show the dates, the time of day, or the day of the week
  let TRV = ['date', 'hour', 'week'].includes(store('cuTrv')) ? store('cuTrv') : 'date';
  // rows per page: each list remembers its own choice
  const PER_OPT = [10, 20, 50, 100], PER = { people: 10, contacts: 10, activity: 20 };
  Object.keys(PER).forEach(k => { const v = +store('per_' + k); if (PER_OPT.includes(v)) PER[k] = v; });
  const resetPg = () => { PG = { people: 0, contacts: 0, activity: 0 }; };
  // "Showing 21–40 of 125" and page buttons: first, last, and the pages around this one
  function pager(n, key) {
    if (n <= PER_OPT[0]) return '';
    const per = PER[key], pages = Math.ceil(n / per), p = Math.min(PG[key], pages - 1), nums = [...new Set([0, p - 1, p, p + 1, pages - 1])].filter(x => x >= 0 && x < pages).sort((a, b) => a - b);
    const btn = (x, l, dis, on) => `<button class="cu-pg-b ${on ? 'on' : ''}" ${dis ? 'disabled' : ''} data-act="cuPg" data-arg="${key}:${x}" ${on ? 'aria-current="page"' : ''}>${l}</button>`;
    const pick = `<label class="cu-pg-per">Rows per page <span><select data-cuper="${key}" aria-label="Rows per page">${PER_OPT.map(o => `<option value="${o}" ${o === per ? 'selected' : ''}>${o}</option>`).join('')}</select>${A.ico('chev')}</span></label>`;
    return `<nav class="cu-pg" aria-label="Pages"><span>Showing <b>${p * per + 1}–${Math.min(n, (p + 1) * per)}</b> of <b>${n.toLocaleString('en-US')}</b></span>${pick}<span class="sp"></span>${pages > 1 ? `<span class="cu-pg-n">${btn(p - 1, A.ico('chevL'), p === 0)}${nums.map((x, i) => (i && x - nums[i - 1] > 1 ? '<em>…</em>' : '') + btn(x, x + 1, false, x === p)).join('')}${btn(p + 1, A.ico('chevR'), p >= pages - 1)}</span>` : ''}</nav>`;
  }

  const pageOf = (arr, key) => { const pages = Math.max(1, Math.ceil(arr.length / PER[key])); PG[key] = Math.min(PG[key], pages - 1); return arr.slice(PG[key] * PER[key], (PG[key] + 1) * PER[key]); };
  // who counts for a vertical: anyone who searched, opened, saved or contacted something in it
  const vids = (E, v) => new Set(E.filter(e => e.v === v).map(e => e.vid));
  const scope = (E, v) => { if (v === 'all') return { E, vis: new Set(E.filter(e => e.k === 'visit').map(e => e.vid)) }; const vis = vids(E, v); return { E: E.filter(e => vis.has(e.vid) && (!e.v || e.v === v)), vis }; };
  const uniq = (E, k) => new Set(E.filter(e => e.k === k).map(e => e.vid)).size, cnt = (E, k) => E.filter(e => e.k === k).length;
  /* periods: Today / This week / This month like the rest of admin, plus Custom: any dates, or a quick pick (last 7 days … last 12 months) */
  const CPS = [['today', 'Today'], ['week', 'This week'], ['month', 'This month']];
  const QP = [['7', 'Last 7 days'], ['30', 'Last 30 days'], ['90', 'Last 90 days'], ['180', 'Last 6 months'], ['ytd', 'This year'], ['365', 'Last 12 months']];
  const day0 = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); return +d; }, dayEnd = t => day0(t) + DAY - 1;
  const ymd = t => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const quick = k => ({ k, a: k === 'ytd' ? +new Date(new Date(NOW).getFullYear(), 0, 1) : day0(NOW) - (k - 1) * DAY, b: dayEnd(NOW) });
  let CP = store('cuPeriod'), CR = (() => { try { return JSON.parse(store('cuRange')); } catch (e) { return null; } })(), CAL = false;
  // a quick pick is kept by name so it moves with the calendar: "last 30 days" always ends today
  if (CR && QP.some(x => x[0] === CR.k)) CR = quick(CR.k); else if (!(CR && CR.a > 0 && CR.b >= CR.a)) CR = null;
  if (!(CPS.some(x => x[0] === CP) || (CP === 'custom' && CR))) CP = 'month';
  const startC = () => { if (CP === 'custom') return CR.a; const d = new Date(day0(NOW)); if (CP === 'week') d.setDate(d.getDate() - (d.getDay() + 6) % 7); if (CP === 'month') d.setDate(1); return +d; };
  const endC = () => CP === 'custom' ? Math.min(CR.b, NOW) : NOW;
  const inC = t => t && t >= startC() && t <= endC();
  const rangeL = () => { if (CR.k) return QP.find(x => x[0] === CR.k)[1]; const yr = new Date(CR.a).getFullYear() !== new Date(NOW).getFullYear() || new Date(CR.b).getFullYear() !== new Date(NOW).getFullYear();
    const f = t => new Date(t).toLocaleDateString('en-GB', Object.assign({ day: 'numeric', month: 'short' }, yr ? { year: 'numeric' } : {})); return day0(CR.a) === day0(CR.b) ? f(CR.a) : f(CR.a) + ' – ' + f(CR.b); };
  const labelC = () => CP === 'custom' ? (CR.k ? rangeL().toLowerCase() : rangeL()) : (CPS.find(x => x[0] === CP) || CPS[2])[1].toLowerCase();
  const firstT = () => C.E.reduce((m, e) => Math.min(m, e.t), NOW);
  const segC = () => { const on = CP === 'custom', r = on ? CR : quick('30');
    return `<div class="cu-per"><div class="seg">${CPS.map(([k, l]) => `<button class="${CP === k ? 'on' : ''}" data-act="cuPeriod" data-arg="${k}">${l}</button>`).join('')}<button class="cu-cust ${on ? 'on' : ''}" data-act="cuCal" aria-expanded="${CAL}">${ic('cal')}<span>${on ? A.esc(rangeL()) : 'Custom'}</span>${A.ico('chev')}</button></div>
      <div class="cu-cal ${CAL ? 'on' : ''}" role="dialog" aria-label="Choose dates">
        <b class="cu-cal-t">Quick picks</b>
        <div class="cu-cal-q">${QP.map(([k, l]) => `<button class="chip ${on && CR.k === k ? 'on' : ''}" data-act="cuQuick" data-arg="${k}">${l}</button>`).join('')}</div>
        <b class="cu-cal-t">Or choose dates</b>
        <div class="cu-cal-d"><label><span>From</span><input type="date" id="cuFrom" min="${ymd(firstT())}" max="${ymd(NOW)}" value="${ymd(r.a)}"></label><label><span>To</span><input type="date" id="cuTo" min="${ymd(firstT())}" max="${ymd(NOW)}" value="${ymd(r.b)}"></label></div>
        <p class="hint cu-cal-n">Records start ${new Date(firstT()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}.</p>
        <div class="cu-cal-f"><button class="btn btn-sm" data-act="cuCal">Cancel</button><button class="btn btn-g btn-sm" data-act="cuApply">Show these dates</button></div>
      </div></div>`; };
  // came back: visited again in this period after their first ever visit (someone can be new and come back in the same period)
  const cameBack = c => c.events.some(e => e.k === 'visit' && e.t > c.first && inC(e.t));
  const prevOf = () => { const t0 = startC(), span = endC() - t0 + 1; return C.E.filter(e => e.t >= t0 - span && e.t < t0); };
  // the chart's buckets for the period: hours today, days this week / month, weeks over 3 months, months this year
  function buckets() {
    // the bar size follows the length: up to 2 days by hour, up to 2 months by day, up to ~6 months by week, longer by month
    const out = [], s0 = startC(), e0 = endC(), span = e0 - s0, yrs = new Date(s0).getFullYear() !== new Date(e0).getFullYear(), mk = (a, b, l, t) => out.push({ a, b, l, t });
    if (span <= 2 * DAY) { for (let a = s0; a <= e0; a += 36e5) mk(a, a + 36e5, (span > DAY && new Date(a).getHours() === 0 ? A.dateS(a) + ' ' : '') + String(new Date(a).getHours()).padStart(2, '0') + ':00', 'By hour'); }
    else if (span <= 62 * DAY) { for (let a = s0; a <= e0; a += DAY) mk(a, a + DAY, A.dateS(a), 'By day'); }
    else if (span <= 200 * DAY) { for (let a = s0; a <= e0; a += 7 * DAY) mk(a, Math.min(a + 7 * DAY, e0 + 1), A.dateS(a), 'By week'); }
    else { const d = new Date(s0); d.setDate(1); while (+d <= e0) { const a = Math.max(+d, s0); d.setMonth(d.getMonth() + 1); mk(a, Math.min(+d, e0 + 1), new Date(a).toLocaleDateString('en-GB', Object.assign({ month: 'short' }, yrs ? { year: '2-digit' } : {})), 'By month'); } }
    return out;
  }
  // no comparison when the previous period starts before any records exist (e.g. this year vs a year with no data)
  const delta = (a, b) => { if (startC() - (endC() - startC()) < firstT()) return ''; if (!b) return a ? 'new' : ''; const d = Math.round((a - b) / b * 100); return (d > 0 ? '↑ ' : d < 0 ? '↓ ' : '') + Math.abs(d) + '%'; };
  const bar = (rows, f) => A.hbars(rows.map(r => Object.assign({ f: f || (x => x.toLocaleString('en-US')) }, r)));
  // each section has its own icon and tint, so the page reads as separate topics at a glance
  const TINT = { pin: '#256aa5', pulse: '#256aa5', open: '#7b5ea7', user: '#5f7189', bars: '#136142', funnel: '#b7791f', layers: '#5f7189', globe: '#256aa5', search: '#a0623a', store: '#7b5ea7', heartFill: '#c2416b', chat: '#1a7a53', compass: '#256aa5', plane: '#0e7c86', bolt: '#c2413b' };
  const sh = (icon, title, sub = '', right = '') => `<div class="pn-h cu-h"><h2>${title}</h2>${sub ? `<span class="sub">${sub}</span>` : ''}${right ? `<span class="sp"></span>${right}` : ''}</div>`;
  // hover info for every graphic: the first line is the title, the rest are details (shown by the tip in init)
  const tip = (...lines) => `data-tip="${A.esc(lines.filter(x => x !== '' && x != null).join('\n'))}"`;
  // one plain sentence that says what the panel means
  const take = t => t ? `<p class="cu-take">${ic('bulb')}<span>${t}</span></p>` : '';
  // rows with a coloured icon tile, a bar and the share: {l, ico, c, v}
  const rowsI = (rows, tot) => { const mx = Math.max(...rows.map(r => r.v), 1); tot = tot || rows.reduce((s, r) => s + r.v, 0) || 1;
    return `<div class="cu-rws">${rows.map((r, i) => `<div class="cu-rw" style="--c:${r.c};--i:${i}" ${tip(r.l, `${r.v.toLocaleString('en-US')} · ${pct(r.v, tot)}% of the total`)}><span class="cu-ti">${r.ico ? ic(r.ico) : ''}</span><span class="cu-rw-l">${A.esc(r.l)}</span><i style="--w:${Math.max(2, r.v / mx * 100)}%"></i><b>${r.v.toLocaleString('en-US')}</b><em>${pct(r.v, tot)}%</em></div>`).join('')}</div>`; };
  // share of a whole as one bar split into parts (2px gaps between parts)
  const shareBar = (rows, tot) => `<div class="cu-share" role="img" aria-label="${A.esc(rows.map(r => `${r.l} ${pct(r.v, tot)}%`).join(', '))}">${rows.map(r => `<i style="flex:${r.v};--c:${r.c}" ${tip(r.l, `${pct(r.v, tot)}% · ${r.v.toLocaleString('en-US')}`)}></i>`).join('')}</div>`;
  // ring chart: parts of a whole with the total in the middle
  function donut(rows, mid, midL) {
    const tot = rows.reduce((s, r) => s + r.v, 0) || 1, R = 42, C = 2 * Math.PI * R, gap = rows.length > 1 ? 1.6 : 0; let off = 0;
    const segs = rows.map(r => { const len = r.v / tot * C, s = `<circle r="${R}" cx="55" cy="55" stroke="${r.c}" stroke-dasharray="${Math.max(0, len - gap).toFixed(2)} ${C.toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" ${tip(r.l, `${r.v} · ${pct(r.v, tot)}%`)}></circle>`; off += len; return s; }).join('');
    return `<div class="cu-dn"><div class="cu-dn-c"><svg viewBox="0 0 110 110" role="img" aria-label="${A.esc(rows.map(r => `${r.l} ${r.v}`).join(', '))}"><circle r="${R}" cx="55" cy="55" class="bg"/><g transform="rotate(-90 55 55)">${segs}</g></svg><span><b>${mid}</b><small>${midL}</small></span></div>
      <div class="cu-dn-l">${rows.map(r => `<div style="--c:${r.c}"><span class="cu-ti">${ic(r.ico)}</span><span>${A.esc(r.l)}</span><b>${r.v}</b><em>${pct(r.v, tot)}%</em></div>`).join('')}</div></div>`;
  }
  // the steps from visiting to contacting, drawn as a funnel that narrows as people drop off
  function funnelV(F) {
    // one step per row: icon · name · number · share, a left-aligned bar under it, and what happened before the next step
    const IC = ['users', 'open', 'heartFill', 'chat'], CL = ['#7fc9a0', '#3fa673', '#1a7a53', '#0f4f36'], top = F[0][1] || 1;
    const WHAT = ['Came to UpNow in this period', 'Opened at least one listing', 'Saved a listing, followed a provider or saved a search', 'Called, WhatsApped, emailed or messaged a provider'];
    return `<div class="cu-fv">${F.map(([l, n], i) => { const was = i ? F[i - 1][1] : 0;
      return `${i ? `<div class="cu-fv-d"><span>${!was ? '—' : n > was ? `<b class="up">+${(n - was).toLocaleString('en-US')}</b> contacted without saving first` : `<b>${(was - n).toLocaleString('en-US')} stopped here</b> · ${pct(n, was)}% went on`}</span></div>` : ''}
        <div class="cu-fv-r" style="--c:${CL[i]};--i:${i}" ${tip(l, `${n.toLocaleString('en-US')} people · ${i ? pct(n, top) + '% of visitors' : 'everyone who visited'}`, WHAT[i])}>
          <span class="cu-ti">${ic(IC[i])}</span><span class="cu-fv-l">${l}</span><b data-count="${n}">${n.toLocaleString('en-US')}</b><em>${pct(n, top)}%</em>
          <span class="cu-fv-t"><i style="width:${Math.max(n ? 2 : 0, n / top * 100)}%"></i></span></div>`; }).join('')}</div>`;
  }


  const areasOf = E => tally([...E.filter(e => e.k === 'search').flatMap(e => (e.loc || []).map(loc => ({ loc }))), ...E.filter(e => e.k === 'view' && e.loc)], e => e.loc);

  function page() {
    const { esc, head } = A, inP = inC; build(); if (VERT !== 'all' && !VL[VERT]) VERT = 'all';
    const P0 = C.E.filter(e => inP(e.t)), cur = scope(P0, VERT), prev = scope(prevOf(), VERT), people = C.list.filter(c => cur.vis.has(c.vid));
    const liveNow = C.list.filter(c => NOW - c.last < 15 * 60000 && (VERT === 'all' || c.events.some(e => e.v === VERT)));
    const allVis = new Set(P0.filter(e => e.k === 'visit').map(e => e.vid)).size;
    const chips = `<div class="ad-vchips cu-verts">${[['all', 'All verticals', allVis], ...VORD.filter(v => VL[v]).map(v => [v, VL[v], vids(P0, v).size])]
      .map(([k, l, n]) => `<button type="button" class="chip ${VERT === k ? 'on' : ''}" data-act="cuVert" data-arg="${k}">${k === 'all' ? '' : A.ico(A.VI[k])}${esc(l)} <span class="c">${n}</span></button>`).join('')}</div>`;
    const tabs = `<div class="tabs cu-tabs">${VIEWS.map(([k, l]) => `<button class="${VIEW === k ? 'on' : ''}" data-act="cuView" data-arg="${k}">${l}${k === 'people' ? `<span class="c">${people.length}</span>` : k === 'contacts' ? `<span class="c">${cnt(cur.E, 'contact')}</span>` : ''}</button>`).join('')}</div>`;
    const ctx = { P: cur.E, PV: prev.E, vis: cur.vis, pvis: prev.vis, people, P0 };
    return `${head('Customers', `Who visits UpNow, what they look for and which providers they contact — every contact is a lead.`,
      `${liveNow.length ? `<span class="cu-live"><i></i>${liveNow.length} on UpNow now</span>` : ''}${segC()}`)}
      ${tabs}${chips}${(({ people: peopleView, contacts: contactsView, activity: activityView, wants: c => summary(c, 'wants'), where: c => summary(c, 'where') })[VIEW] || summary)(ctx)}`;
  }

  /* "Worth a look": the 3 strongest findings for this period — one big number, one line, one button.
     Every rule needs enough people behind it, so one odd visit never becomes a card. */
  function insights({ P, vis, pvis, people, contacts, byVertRows }) {
    const { esc } = A, out = [], all = VERT === 'all', L = (window.UP && UP.LISTINGS) || [];
    FOCI = {};
    const evs = {}; P.forEach(e => (evs[e.vid] = evs[e.vid] || []).push(e));
    const did = (vid, ks) => (evs[vid] || []).some(e => ks.includes(e.k));
    const rate = set => pct([...set].filter(v => did(v, ['contact'])).length, set.size), overall = rate(vis);
    const see = (key, label, set, l = 'See them') => { FOCI[key] = { l: label, vids: [...set] }; return [l, 'cuFocus', key]; };
    const add = (score, icon, lead, rest, act) => out.push({ score, icon, lead, rest, act });

    // demand ahead of supply: many people want a category in an area that has few listings
    const dem = {}; P.forEach(e => { const c = e.cat || e.o; if (!e.v || !c) return; (e.k === 'search' ? e.loc || [] : e.k === 'view' && e.loc ? [e.loc] : []).forEach(loc => { const k = e.v + '|' + c + '|' + loc; (dem[k] = dem[k] || new Set()).add(e.vid); }); });
    const gap = Object.entries(dem).map(([k, set]) => { const [v, c, loc] = k.split('|'); return { v, c, loc, set, sup: L.filter(l => l.v === v && l.cat === c && l.loc === loc).length }; })
      .filter(x => x.set.size >= 3 && x.sup <= 2).sort((a, b) => b.set.size / (b.sup + 1) - a.set.size / (a.sup + 1))[0];
    if (gap) add(90, 'pin', `${gap.set.size} people`, `want ${esc(cat(gap.v, gap.c).toLowerCase())} in ${esc(area(gap.loc))}, but there ${gap.sup === 1 ? 'is only 1 listing' : gap.sup ? `are only ${gap.sup} listings` : 'are no listings'} there`, see('gap', `Wanted ${cat(gap.v, gap.c)} in ${area(gap.loc)}`, gap.set));

    // saved but never contacted: they know what they want
    const warm = new Set(people.filter(c => did(c.vid, ['save', 'follow', 'alert']) && !c.contacts).map(c => c.vid));
    if (warm.size >= 2) add(80, 'heartFill', `${warm.size} people`, 'saved listings but didn’t contact anyone', see('warm', 'Saved but didn’t contact', warm));

    // a provider people look at but never contact
    const pv = {}; P.forEach(e => { const n = e.k === 'view' ? e.provider : e.k === 'prov' ? e.n : null; if (n) (pv[n] = pv[n] || new Set()).add(e.vid); });
    const pc0 = {}; contacts.forEach(e => { pc0[e.provider] = (pc0[e.provider] || 0) + 1; });
    const cold = Object.entries(pv).filter(([n, set]) => set.size >= 5 && !pc0[n]).sort((a, b) => b[1].size - a[1].size)[0];
    if (cold) add(70, 'eye', `${cold[1].size} people`, `looked at ${esc(cold[0])}, but nobody contacted them`, see('cold', `Looked at ${cold[0]}`, cold[1], 'See who looked'));

    // left without opening anything
    const none = new Set([...vis].filter(v => !did(v, ['view', 'prov'])));
    if (vis.size >= 10 && none.size / vis.size >= .15) add(60, 'out', `${none.size} visitors`, 'left without opening a single listing', see('none', 'Left without opening a listing', none));

    // a vertical with interest but few contacts
    const weak = all && byVertRows.filter(r => r.n >= 8).sort((a, b) => a.rate - b.rate)[0];
    if (weak && weak.rate < overall * .75) add(55, 'funnel', `Only ${weak.rate}%`, `of people interested in ${esc(VL[weak.v].toLowerCase())} contacted a provider (${overall}% across UpNow)`, ['Show ' + VL[weak.v], 'cuVert', weak.v]);

    // a country that is growing (only when the period before has records to compare with)
    if (startC() - (endC() - startC()) >= firstT()) {
      const now = Object.fromEntries(tally(people, c => c.cc)), before = Object.fromEntries(tally([...pvis].map(v => C.byVid[v]).filter(Boolean), c => c.cc));
      const up = Object.entries(now).filter(([cc, n]) => n >= 4 && n >= (before[cc] || 0) * 1.5 && n - (before[cc] || 0) >= 3).sort((a, b) => (b[1] - (before[b[0]] || 0)) - (a[1] - (before[a[0]] || 0)))[0];
      if (up) add(50, 'plane', `${up[1] - (before[up[0]] || 0)} more visitors`, `from ${esc(cname(up[0]))} than the period before`, see('cc', `From ${cname(up[0])}`, new Set(people.filter(c => c.cc === up[0]).map(c => c.vid))));
    }

    // the source whose visitors contact the most
    const bySrc = {}; [...vis].forEach(v => { const f = (evs[v] || []).find(e => e.k === 'visit'); const s0 = f ? f.src : 'direct'; (bySrc[s0] = bySrc[s0] || new Set()).add(v); });
    const best = Object.entries(bySrc).filter(([, set]) => set.size >= 8).map(([k, set]) => [k, set, rate(set)]).sort((a, b) => b[2] - a[2])[0];
    if (best && best[2] >= overall * 1.3 && best[2] - overall >= 5) add(45, 'compass', `${best[2]}% of ${esc(best[0] === 'direct' ? 'direct' : srcName(best[0]))} visitors`, `contact a provider, against ${overall}% overall`, see('src', `Came from ${srcName(best[0])}`, best[1]));

    // the provider getting the most leads
    const top = Object.entries(pc0).sort((a, b) => b[1] - a[1])[0];
    if (top && top[1] >= 3) add(40, 'star', `${top[1]} leads`, `went to ${esc(top[0])}, more than any other provider`, see('top', `Contacted ${top[0]}`, new Set(contacts.filter(e => e.provider === top[0]).map(e => e.vid)), 'See who contacted'));

    const LBL = { pin: 'Wanted, few listings', heartFill: 'Saved, didn’t contact', eye: 'Looked, nobody contacted', out: 'Left without opening', funnel: 'Interest, few contacts', plane: 'Growing country', compass: 'Best source', star: 'Most leads' };
    return out.sort((a, b) => b.score - a.score).slice(0, 4).map((c, i) => `<div class="${i === 0 ? 'hl' : ''}" data-act="${c.act[1]}" data-arg="${esc(c.act[2])}" ${tip(LBL[c.icon] || 'Worth a look', c.act[0])}><small>${LBL[c.icon] || 'Worth a look'}</small><b>${c.lead}</b><span>${c.rest}</span><span class="cu-att-a">${esc(c.act[0])}${A.ico('chevR')}</span></div>`);
  }

  /* Overview */
  function summary({ P, PV, vis, pvis, people, P0 }, part = 'overview') {
    const { esc } = A, inP = inC, all = VERT === 'all', vn = all ? '' : VL[VERT];
    const fresh = people.filter(c => inP(c.first)).length, back = people.filter(cameBack).length;
    const contacts = P.filter(e => e.k === 'contact'), saves = P.filter(e => e.k === 'save');
    const everV = all ? null : vids(C.E, VERT);
    const inV = e => all || e.v === VERT || ((e.k === 'signup' || e.k === 'login' || e.k === 'visit') && everV.has(e.vid));
    const wk = k => buckets().map(({ a, b }) => { const E = C.E.filter(e => e.t >= a && e.t < b); return k === 'visit' ? (all ? uniq(E, 'visit') : vids(E, VERT).size) : E.filter(e => e.k === k && inV(e)).length; });
    const BK = buckets();
    const kpi = (l, v, sub, sp, d, go, icon, c) => `<a class="kpi ad-kpi cu-kpi" ${go ? `data-act="${go[0]}" data-arg="${go[1]}"` : ''}><small>${l}</small><span class="ad-kpi-v"><b data-count="${v}">${v.toLocaleString('en-US')}</b>${pill(d)}</span><span class="d">${sub}</span><span class="cu-spk">${A.spark(sp)}<span class="cu-spk-h">${BK.map((b, i) => `<i ${tip(b.l, `${(sp[i] || 0).toLocaleString('en-US')} ${({ users: (sp[i] === 1 ? 'visitor' : 'visitors'), userPlus: (sp[i] === 1 ? 'new account' : 'new accounts'), chat: (sp[i] === 1 ? 'contact' : 'contacts'), heartFill: (sp[i] === 1 ? 'listing saved' : 'listings saved') })[icon] || ''}`)}></i>`).join('')}</span></span></a>`;
    const did = k => new Set(P.filter(e => k.includes(e.k)).map(e => e.vid)).size;
    const F = [['Visited UpNow', vis.size], ['Opened a listing', did(['view'])], ['Saved or followed', did(['save', 'follow', 'alert'])], ['Contacted a provider', did(['contact'])]];
    // where most people stop: the step with the biggest share lost
    const dropI = [1, 2, 3].filter(i => F[i - 1][1] && F[i][1] < F[i - 1][1]).sort((x, y) => (F[y - 1][1] - F[y][1]) / F[y - 1][1] - (F[x - 1][1] - F[x][1]) / F[x - 1][1])[0];
    const dropAt = dropI ? ['', 'before opening a listing', 'after opening a listing, without saving it', 'after saving, before contacting'][dropI] : '';
    const perDay = k => BK.map(b => { const E = C.E.filter(e => e.t >= b.a && e.t < b.b); return k === 'visit' ? (all ? uniq(E, 'visit') : vids(E, VERT).size) : E.filter(e => e.k === k && inV(e)).length; });
    const byCc = tally(people, c => c.cc || '??'), abroad = people.filter(c => c.cc && c.cc !== 'AE'), uaeCities = tally(people.filter(c => c.cc === 'AE' && c.city), c => c.city);
    const look = P.filter(e => e.k === 'view' || e.k === 'search'), byV = tally(look, e => e.v), byCat = tally(look.filter(e => e.v && (e.cat || e.o)), e => e.v + '|' + (e.cat || e.o)), byArea = areasOf(P);
    const provSeen = tally(P.filter(e => (e.k === 'view' && e.provider) || e.k === 'prov'), e => e.provider || e.n).slice(0, 6), provCont = Object.fromEntries(tally(contacts, e => e.provider));
    const liked = tally(saves, e => e.lid).slice(0, 5), byCh = tally(contacts, e => e.ch);
    const visits = C.E.filter(e => e.k === 'visit' && inP(e.t) && vis.has(e.vid)), bySrc = tally(visits, e => e.src);
    // top 5 sources, the rest folded into "Other"
    const srcTop = bySrc.slice(0, 5).map(([k, n]) => ({ l: k === 'direct' ? 'Direct visit' : srcName(k), ico: SRC_I[k] || 'link', c: (SRC[k] || [0, '#5f7189'])[1], v: n }));
    if (bySrc.length > 5) srcTop.push({ l: 'Other', ico: 'link', c: '#9aa6a0', v: bySrc.slice(5).reduce((t, x) => t + x[1], 0) });
    // one country: flag · name and what they're after (UAE: its cities) · short bar (green UAE, blue abroad) · share and people
    const ccLook = cc => { const who = new Set(people.filter(c => c.cc === cc).map(c => c.vid)), t = tally(P.filter(e => who.has(e.vid) && e.v && (e.cat || e.o)), e => e.v + '|' + (e.cat || e.o))[0]; return t ? 'Mostly ' + cat(...t[0].split('|')).toLowerCase() : 'Just looking around'; };
    const flagRow = ([cc, n], i, tot) => { const ae = cc === 'AE', sub = ae && uaeCities.length ? uaeCities.slice(0, 3).map(([c, k]) => `${c} ${k}`).join(' · ') : ccLook(cc);
      return `<div class="cu-cc ${ae ? 'ae' : 'ab'}" style="--i:${i}" ${tip(cname(cc), `${n} ${n === 1 ? 'person' : 'people'} · ${pct(n, tot)}% of ${all ? 'visitors' : 'them'}`, sub)}><span class="cu-flag">${flag(cc)}</span><span class="cu-cc-n"><b>${esc(cname(cc))}</b><small>${esc(sub)}</small></span><i style="--w:${pct(n, byCc[0][1])}%"></i><span class="cu-cc-v"><b>${pct(n, tot)}%</b><small>${n} ${n === 1 ? 'person' : 'people'}</small></span></div>`; };

    // all verticals side by side (only on "All verticals")
    let byVertRows = [];
    const byVert = !all ? '' : (() => { const PV0 = prevOf(), rows = byVertRows = VORD.filter(v => VL[v]).map(v => { const Ev = P0.filter(e => e.v === v), who = vids(P0, v), con = Ev.filter(e => e.k === 'contact');
        const tc = tally(Ev.filter(e => e.cat || e.o), e => e.cat || e.o)[0], ta = areasOf(Ev)[0];
        return { v, n: who.size, d: delta(who.size, vids(PV0, v).size), con: con.length, rate: pct(new Set(con.map(e => e.vid)).size, who.size), tc: tc ? cat(v, tc[0]) : '—', ta: ta ? area(ta[0]) : '—' }; }), mx = Math.max(...rows.map(r => r.n), 1);
      // one card per vertical: interested visitors, change, contact-rate ring, top category and area — click to see only that vertical
      const mini = r => { const R = 19, C = 2 * Math.PI * R, len = r.rate / 100 * C; return `<span class="cu-vc-ring" ${tip('Contact rate', `${r.rate}% of interested visitors contacted a provider`, `${r.con} contact${r.con === 1 ? '' : 's'}`)}><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="${R}" class="bg"/><circle cx="24" cy="24" r="${R}" transform="rotate(-90 24 24)" stroke="${VC[r.v]}" stroke-dasharray="${len.toFixed(2)} ${C.toFixed(2)}" style="--len:${len.toFixed(2)};--c:${C.toFixed(2)};--i:0"/></svg><b>${r.rate}%</b></span>`; };
      return `<section class="mt0">${sh('layers', 'By vertical', esc(labelC()) + ' · click one to see only its customers')}
        <div class="cu-vcs">${rows.map((r, i) => `<button type="button" class="cu-vc" style="--c:${VC[r.v]};--i:${i}" data-act="cuVert" data-arg="${r.v}">
          <span class="cu-vc-h"><span class="cu-ti">${A.ico(A.VI[r.v])}</span><b>${esc(VL[r.v])}</b></span>
          <span class="cu-vc-m"><span><b data-count="${r.n}">${r.n}</b><small>${r.d ? `<em class="cu-dl ${r.d[0] === '↓' ? 'down' : ''}" ${tip('Compared with the period before', r.d)}>${r.d}</em>` : ''}interested</small></span>${mini(r)}</span>
          <span class="cu-vc-f" ${tip('Most wanted in ' + VL[r.v], r.tc, r.ta)}><span>${ic('search')}${esc(r.tc)}</span><span>${A.ico('pin')}${esc(r.ta)}</span></span></button>`).join('')}</div></section>`; })();

    // where people outside the UAE come from, and what they are after here
    const abroadRows = tally(abroad, c => c.cc).slice(0, 6).map(([cc, n]) => { const who = new Set(abroad.filter(c => c.cc === cc).map(c => c.vid)), E = P.filter(e => who.has(e.vid));
      return { cc, n, tc: tally(E.filter(e => e.cat || e.o), e => e.v + '|' + (e.cat || e.o)).slice(0, 2), ta: areasOf(E).slice(0, 2), co: E.filter(e => e.k === 'contact').length }; });

    const vnote = !all ? `<p class="cu-vnote"><span class="ad-v" style="--c:${VC[VERT]}">${A.ico(A.VI[VERT])}${esc(vn)}</span> Only customers who searched, opened, saved or contacted something in ${esc(vn.toLowerCase())}. <a data-act="cuVert" data-arg="all">Show all verticals</a></p>` : '';
    const split = people.length ? `<div class="cu-split"><span style="flex:${people.length - abroad.length || .001}"><b>${flag('AE')} In the UAE</b><em>${100 - pct(abroad.length, people.length)}%</em></span><span style="flex:${abroad.length || .001}"><b>${ic('plane')} From abroad</b><em>${pct(abroad.length, people.length)}%</em></span></div>` : '';
    const chRows = byCh.map(([c, n]) => ({ l: (CH[c] || [c])[0], ico: (CH[c] || [c, 'msg'])[1], c: (CH[c] || [0, 0, '#5f7189'])[2], v: n }));
    const vRows = all ? byV.map(([v, n]) => ({ l: VL[v] || v, ico: A.VI[v], c: VC[v], v: n })) : byCat.slice(0, 7).map(([k, n]) => ({ l: cat(VERT, k.split('|')[1]), ico: A.VI[VERT], c: VC[VERT], v: n }));

    /* ---- the two detail tabs: the same panels as before, grouped by question ---- */
    if (part === 'wants') {
      // ranked lists: rank · (icon) · name · bar · count · share
      const rank = (rows, tot, one) => `<div class="cu-rks">${rows.map((r, i) => `<div class="cu-rk" style="--c:${r.c};--i:${i}" ${tip(r.l, `${r.v.toLocaleString('en-US')} ${one} · ${pct(r.v, tot)}%`, r.sub)}><span class="cu-rk-n">${i + 1}</span>${r.ico ? `<span class="cu-ti">${A.ico(r.ico)}</span>` : ''}<span class="cu-rk-l">${esc(r.l)}${r.sub ? `<small>${esc(r.sub)}</small>` : ''}</span><span class="cu-rk-t"><i style="width:${Math.max(3, r.v / rows[0].v * 100)}%"></i></span><b>${r.v.toLocaleString('en-US')}</b><em>${pct(r.v, tot)}%</em></div>`).join('')}</div>`;
      const catTot = byCat.reduce((t, x) => t + x[1], 0), cats8 = byCat.slice(0, 8).map(([k, n]) => { const [v, c] = k.split('|'); return { l: cat(v, c), v: n, c: VC[v], ico: all ? A.VI[v] : '', sub: all ? VL[v] : '' }; });
      const areaTot = byArea.reduce((t, x) => t + x[1], 0), areas8 = byArea.slice(0, 8).map(([a2, n]) => ({ l: area(a2), v: n, c: '#256aa5' }));
      const provV = tally(P.filter(e => (e.k === 'view' && e.provider) || e.k === 'prov'), e => e.provider || e.n).slice(0, 6), liked6 = tally(saves, e => e.lid).slice(0, 6).map(([id, n]) => [byId(id), n]).filter(x => x[0]);
      return `${vnote}${byVert}
    <div class="g2 mt cu-eq">
      <section class="pn">${sh('search', 'What they look for', 'Categories searched and opened')}
        ${cats8.length ? rank(cats8, catTot, 'searches and listings opened') : '<p class="cu-empty">Nothing searched yet in this period.</p>'}
        ${take(cats8[0] ? `<b>${esc(cats8[0].l)}</b>${cats8[1] ? ` and <b>${esc(cats8[1].l)}</b> are` : ' is'} the most wanted right now.` : '')}</section>
      <section class="pn">${sh('pin', 'Where they want it', 'Areas searched and opened')}
        ${areas8.length ? rank(areas8, areaTot, 'searches and listings opened') : '<p class="cu-empty">No area chosen yet in this period.</p>'}
        ${take(areas8[0] ? `<b>${esc(areas8[0].l)}</b> is the most wanted area — ${pct(areas8[0].v, areaTot)}% of searches and listings opened with an area.` : '')}</section>
    </div>
    <div class="g2 mt cu-eq">
      <section class="pn">${sh('store', 'Providers they look at', 'Most viewed, and how many contacted them')}
        <div class="cu-pv">${provV.map(([n, k], i) => { const co = provCont[n] || 0; return `<div class="cu-pv-r" style="--i:${i}" ${tip(n, `${k} views · ${co} contact${co === 1 ? '' : 's'}`, co ? `${pct(co, k)}% of views became a contact` : 'Nobody contacted them yet')}><span class="cu-rk-n">${i + 1}</span>${A.av(n, 'sm')}<span class="cu-pv-l"><b>${esc(n)}</b><span class="cu-pv-t"><i style="width:${Math.max(4, k / provV[0][1] * 100)}%"></i>${co ? `<i class="c" style="width:${Math.max(3, co / provV[0][1] * 100)}%"></i>` : ''}</span></span><span class="cu-pv-n"><b>${k}</b><small>views</small></span><span class="cu-pv-n ${co ? 'ok' : 'no'}"><b>${co}</b><small>contacts</small></span></div>`; }).join('') || '<p class="cu-empty">No provider viewed in this period.</p>'}</div></section>
      <section class="pn">${sh('heartFill', 'What they liked', 'Saved most')}
        <div class="cu-lk">${liked6.map(([l, n], i) => { const u = unitOf(l); return `<a class="cu-lk-r" style="--i:${i}" href="${lHref(l.id)}" target="_blank" rel="noopener" ${tip(l.title, `${n} saved · ${catOr(l.v, l.cat)}`, `${area(l.loc)} · ${A.aed(l.price)}${u ? ' ' + u : ''}`)}><span class="cu-rk-n">${i + 1}</span><img src="${esc(l.img[0])}" alt=""><span class="cu-lk-l"><b>${esc(l.title)}</b><small>${esc(catOr(l.v, l.cat))} · ${esc(area(l.loc))}</small></span><span class="cu-lk-p">${A.aed(l.price)}${u ? `<small>${esc(u)}</small>` : ''}</span><em class="cu-pill pink">${A.ico('heart')}${n}</em></a>`; }).join('') || '<p class="cu-empty">Nothing saved in this period.</p>'}</div></section>
    </div>`;
    }

    if (part === 'where') return `${vnote}
    <div class="gd">
      <section class="pn">${sh('globe', 'Where they are', `${people.length} people · ${pct(abroad.length, people.length)}% from outside the UAE`)}
        ${split}
        <div class="cu-ccs">${byCc.slice(0, 8).map((r, i) => flagRow(r, i, people.length)).join('') || '<p class="hint">Nobody yet.</p>'}</div>
        <p class="hint cu-how">${ic('globe')}From their phone code when signed in, otherwise from the device’s time zone — never GPS.</p></section>
      <section class="pn">${sh('compass', 'How they found UpNow', 'Where each visit came from')}
        ${visits.length ? `${shareBar(srcTop, visits.length)}${rowsI(srcTop, visits.length)}` : '<p class="cu-empty">No visits in this period.</p>'}
        ${take(bySrc[0] ? `Most visits come from <b>${esc(bySrc[0][0] === 'direct' ? 'people typing the address or using a bookmark' : srcName(bySrc[0][0]))}</b> (${pct(bySrc[0][1], visits.length)}%).` : '')}</section>
    </div>
    <div class="gd mt">
      <section class="pn">${sh('plane', 'From abroad — what they look for in the UAE', `${abroad.length} of ${people.length} people`)}
        ${abroadRows.map((r, i) => `<div class="cu-abr" style="--i:${i}"><span class="cu-flag">${flag(r.cc)}</span><span class="cu-abr-n"><b>${esc(cname(r.cc))}</b><small>${r.n} ${r.n === 1 ? 'person' : 'people'}${r.co ? ` · <span class="cu-ok">${r.co} contacted</span>` : ''}</small></span>
          <span class="cu-abr-t">${r.tc.map(([k]) => { const [v, c] = k.split('|'); return `<span class="cu-chip"><i class="cu-vdot" style="background:${VC[v]}"></i>${esc(cat(v, c))}</span>`; }).join('')}${r.ta.length ? `<small>${A.ico('pin')}${r.ta.map(([a]) => esc(area(a))).join(', ')}</small>` : ''}</span></div>`).join('') || '<p class="cu-empty">Nobody from abroad in this period.</p>'}</section>
      <section class="pn">${sh('chat', 'How they reach providers', 'Each contact is a lead for the provider')}
        ${byCh.length ? donut(chRows, contacts.length.toLocaleString('en-US'), contacts.length === 1 ? 'contact' : 'contacts') : '<p class="cu-empty">No contacts in this period.</p>'}
        ${take(byCh[0] ? `<b>${esc((CH[byCh[0][0]] || [byCh[0][0]])[0])}</b> is how most customers reach out (${pct(byCh[0][1], contacts.length)}%).` : '')}</section>
    </div>`;

    /* ---- Overview: the numbers, what is worth acting on, the trend, and doors into the detail tabs ---- */
    const cards = insights({ P, PV, vis, pvis, people, P0, contacts, F, byVertRows });
    // a ring for the doors: parts of a whole (or one share), drawn in, with the key figure in the middle
    const ring = (parts, mid, midL) => { const R = 34, C = 2 * Math.PI * R, tot = parts.reduce((t, p) => t + p.v, 0) || 1, gap = parts.length > 1 ? 2 : 0; let off = 0;
      return `<span class="cu-ring"><svg viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="${R}" class="bg"/><g transform="rotate(-90 42 42)">${parts.map((p, i) => { const len = Math.max(0, p.v / tot * C - gap), el = `<circle cx="42" cy="42" r="${R}" stroke="${p.c}" style="--len:${len.toFixed(2)};--c:${C.toFixed(2)};--i:${i}" ${p.l ? tip(p.l, `${pct(p.v, tot)}% · ${p.v.toLocaleString('en-US')}${p.u ? ' ' + p.u : ''}`) : ''} stroke-dasharray="${len.toFixed(2)} ${C.toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}"/>`; off += p.v / tot * C; return el; }).join('')}</g></svg><span><b>${mid}</b><small>${midL}</small></span></span>`; };
    // doors into the detail tabs: a ring and one plain answer, the top 3 with a thin bar, and what is inside
    const door = (view, icon, title, answer, rows, foot, rg) => `<button type="button" class="cu-door" style="--c:${TINT[icon]}" data-act="cuView" data-arg="${view}"><span class="cu-door-h"><b>${title}</b>${A.ico('chevR')}</span>
      <span class="cu-door-top">${rg || ''}<span class="cu-door-a">${answer}</span></span>${rows.length ? `<span class="cu-door-r">${rows.map((r, i) => `<span class="cu-mr" style="--c:${r.c};--i:${i}" ${tip(r.l, r.tip || r.v)}>${r.lead}<span class="cu-mr-l">${esc(r.l)}</span><i><i style="width:${Math.max(4, r.w)}%"></i></i><b>${r.v}</b></span>`).join('')}</span>` : '<span class="hint">Nothing yet in this period</span>'}
      <span class="cu-door-f">${foot}${A.ico('chevR')}</span></button>`;
    const vTot = vRows.reduce((t, r) => t + r.v, 0), byProv = tally(contacts, e => e.provider), cTop = byCh[0];
    return `${vnote}
    ${cards.length ? `<div class="att cu-att" style="grid-template-columns:repeat(${cards.length}, minmax(0, 1fr))">${cards.join('')}</div>` : ''}
    <div class="g4 ad-kpis">
      ${kpi(all ? 'Visitors' : 'Interested visitors', vis.size, `${fresh} new · ${back} came back`, wk('visit'), delta(vis.size, pvis.size), ['cuGo', 'all'], 'users', '#136142')}
      ${kpi('New accounts', cnt(P, 'signup'), `${cnt(P, 'login')} logins by people coming back`, wk('signup'), delta(cnt(P, 'signup'), cnt(PV, 'signup')), ['cuGo', 'account'], 'userPlus', '#256aa5')}
      ${kpi('Contacts to providers', contacts.length, `${uniq(P, 'contact')} people · ${pct(uniq(P, 'contact'), vis.size)}% of ${all ? 'visitors' : 'them'}`, wk('contact'), delta(contacts.length, cnt(PV, 'contact')), ['cuView', 'contacts'], 'chat', '#1faa59')}
      ${kpi('Listings saved', saves.length, `${uniq(P, 'save')} people saved something`, wk('save'), delta(saves.length, cnt(PV, 'save')), ['cuAct', 'save'], 'heartFill', '#c2416b')}
    </div>
    <div class="gd mt">
      <section class="pn">${traffic(BK, perDay('visit'), perDay('contact'), vn, P)}</section>
      <section class="pn">${sh('funnel', 'From visit to contact', esc(labelC()))}
        ${funnelV(F)}
        ${take(!F[0][1] ? '' : !F[3][1] ? 'Nobody contacted a provider in this period yet.' : `About <b>1 in ${Math.max(1, Math.round(F[0][1] / F[3][1]))}</b> visitors contacted a provider${dropAt ? `. Most people stop ${dropAt}` : ''}.`)}</section>
    </div>
    <div class="g3 mt cu-doors">
      ${door('wants', 'search', 'What they want', vRows[0] ? `<b>${esc(vRows[0].l)}</b> get the most interest${vRows[1] ? `, then ${esc(vRows[1].l.toLowerCase())}` : ''}` : 'Nothing searched yet',
        vRows.slice(0, 3).map(r => ({ lead: `<span class="cu-ti">${ic(r.ico)}</span>`, l: r.l, v: pct(r.v, vTot) + '%', w: r.v / vRows[0].v * 100, c: r.c })),
        `${all ? 'Verticals, ' : ''}categories, areas, providers and saved listings`, vRows.length ? ring([...vRows.slice(0, 5).map(r => Object.assign({ u: 'searches and listings opened' }, r)), ...(vRows.length > 5 ? [{ l: 'Others', u: 'searches and listings opened', v: vRows.slice(5).reduce((t, r) => t + r.v, 0), c: '#c8d2cc' }] : [])], pct(vRows[0].v, vTot) + '%', esc(vRows[0].l)) : '')}
      ${door('where', 'globe', 'Where they come from', people.length ? `People from <b>${byCc.length} ${byCc.length === 1 ? 'country' : 'countries'}</b>${abroad.length ? `, most from abroad in ${esc(cname(tally(abroad, x => x.cc)[0][0]))}` : ''}` : 'Nobody yet',
        byCc.slice(0, 3).map(([cc, n]) => ({ lead: `<span class="cu-mr-f">${flag(cc)}</span>`, l: cc === 'AE' ? 'UAE' : cname(cc), v: pct(n, people.length) + '%', w: n / byCc[0][1] * 100, c: '#256aa5' })),
        `Countries, visitors from abroad${bySrc[0] ? ` · most found UpNow on ${esc(bySrc[0][0] === 'direct' ? 'a direct visit' : srcName(bySrc[0][0]))}` : ''}`,
        people.length ? ring([{ l: 'In the UAE', u: 'people', v: people.length - abroad.length, c: '#136142' }, { l: 'From abroad', u: 'people', v: abroad.length, c: '#5b9bd5' }], pct(abroad.length, people.length) + '%', 'abroad') : '')}
      ${door('contacts', 'chat', 'Who they contact', contacts.length ? `<b>${contacts.length} contacts</b> went to ${byProv.length} provider${byProv.length === 1 ? '' : 's'}` : 'No contacts yet',
        byProv.slice(0, 3).map(([n, k]) => ({ lead: A.av(n, 'sm'), l: n, v: k, w: k / byProv[0][1] * 100, c: '#1a7a53' })),
        cTop ? `Every contact · mostly by ${esc((CH[cTop[0]] || [cTop[0]])[0])} (${pct(cTop[1], contacts.length)}%)` : 'Every contact — each one a lead for a provider',
        vis.size ? ring([{ l: 'Contacted a provider', u: 'people', v: uniq(P, 'contact'), c: '#1faa59' }, { l: 'Didn’t contact anyone', u: 'people', v: Math.max(0, vis.size - uniq(P, 'contact')), c: 'transparent' }], pct(uniq(P, 'contact'), vis.size) + '%', 'of visitors') : '')}
    </div>`;
  }
  /* Visitors and contacts over the period, kept short: busiest day, the usual level (average line), today against it,
     and a click on any day opens what happened that day in Activity. */
  function traffic(BK, V0, C0, vn, P) {
    const { esc } = A;
    const stat = (l, v, sub, cls = '') => `<div class="cu-tr-s ${cls}"><small>${l}</small><b>${v}</b><span>${sub}</span></div>`;
    const seg = `<div class="seg cu-tr-seg">${[['date', 'Dates'], ['hour', 'Time of day'], ['week', 'Day of week']].map(([k, l]) => `<button class="${TRV === k ? 'on' : ''}" data-act="cuTrv" data-arg="${k}">${l}</button>`).join('')}</div>`;
    const head = `<div class="pn-h cu-h"><h2>Visitors and contacts</h2><span class="sub">${esc(labelC())}${vn ? ' · ' + esc(vn) : ''}</span><span class="sp"></span>${seg}</div>`;
    // cols: [{l, v, c, arg, cls}] — arg makes the bar clickable (opens that day in Activity)
    const chart = (cols, avg, xl, hint) => { const mx = Math.max(...cols.map(c => c.v), 1);
      return `<div class="cu-tr"><div class="cu-tr-p">${avg ? `<span class="cu-tr-avg" style="bottom:${(avg / mx * 100).toFixed(1)}%"><em>usual ${avg >= 10 ? Math.round(avg) : Math.round(avg * 10) / 10}</em></span>` : ''}
        ${cols.map((c, i) => `<${c.arg ? 'button type="button"' : 'div'} class="cu-tr-d ${c.cls || ''} ${c.arg ? '' : 'ro'}" style="--i:${Math.min(i, 30)}" ${c.arg ? `data-act="cuDay" data-arg="${c.arg}"` : ''} ${tip(...c.t.split('\n'))}><i class="v" style="height:${(c.v / mx * 100).toFixed(1)}%"></i><i class="c" style="height:${(c.c / mx * 100).toFixed(1)}%"></i></${c.arg ? 'button' : 'div'}>`).join('')}</div>
        <div class="cu-tr-x ${cols.some(c => c.arg) ? 'dates' : ''}">${cols.map((c, i) => `<span>${xl(c, i)}</span>`).join('')}</div>
        <div class="cu-tr-f"><span class="cu-lgd"><i></i>Visitors</span><span class="cu-lgd b"><i></i>Contacts</span>${hint ? `<span class="cu-tr-hint">${hint}</span>` : ''}</div></div>`; };
    const visits = P.filter(e => e.k === 'visit' && inC(e.t)), cons = P.filter(e => e.k === 'contact' && inC(e.t));

    /* time of day: when people visit and contact, summed over the period */
    if (TRV === 'hour') {
      const H = Array(24).fill(0), HC = Array(24).fill(0); visits.forEach(e => H[new Date(e.t).getHours()]++); cons.forEach(e => HC[new Date(e.t).getHours()]++);
      const hr = h => (h % 12 || 12) + (h < 12 || h === 24 ? ' am' : ' pm'), win = (A2, w, best) => { let k = 0, v = best ? -1 : 1e9; for (let h = 0; h < 24; h++) { let t = 0; for (let j = 0; j < w; j++) t += A2[(h + j) % 24]; if (best ? t > v : t < v) { v = t; k = h; } } return [k, v]; };
      const [vb, vbn] = win(H, 2, 1), [cb, cbn] = win(HC, 2, 1), [qb] = win(H, 3, 0), tot = visits.length, ctot = cons.length;
      const rng = (h, w) => `${hr(h)} – ${hr((h + w) % 24 || 24)}`;
      return `${head}<div class="cu-tr-st">${stat('Busiest time', rng(vb, 2), `${pct(vbn, tot)}% of visits`)}${stat('Most contacts', ctot ? rng(cb, 2) : '—', ctot ? `${pct(cbn, ctot)}% of contacts` : 'no contacts yet', ctot ? 'up' : '')}${stat('Quietest', rng(qb, 3), 'fewest visits')}</div>
        ${chart(H.map((v, h) => ({ v, c: HC[h], t: `${rng(h, 1)}\n${v} visits\n${HC[h]} contacts`, cls: h >= cb && h < cb + 2 && ctot ? 'top' : '' })), tot / 24, (c, h) => h % 3 === 0 ? hr(h) : '', 'All days in the period added together.')}
        ${take(!tot ? 'No visits in this period yet.' : ctot ? `Most contacts come between <b>${rng(cb, 2)}</b>. Providers who reply quickly then are the ones who win these leads.` : `Most people visit between <b>${rng(vb, 2)}</b>.`)}`;
    }

    /* day of week: average per day, so a period with three Fridays isn't unfair to the others */
    if (TRV === 'week') {
      const occ = Array(7).fill(0); for (let t = day0(startC()); t <= endC(); t += DAY) occ[new Date(t).getDay()]++;
      if (occ.filter(Boolean).length < 7) return `${head}<div class="cu-tr-empty">${ic('cal')}<span><b>Pick a longer period to compare days.</b> This period doesn’t include every day of the week yet.</span><button class="btn btn-sm btn-g" data-act="cuQuick" data-arg="30">Show last 30 days</button></div>`;
      const W = Array(7).fill(0), WC = Array(7).fill(0); visits.forEach(e => W[new Date(e.t).getDay()]++); cons.forEach(e => WC[new Date(e.t).getDay()]++);
      const ORD = [1, 2, 3, 4, 5, 6, 0], NM = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const av = ORD.map(d => ({ d, v: W[d] / occ[d], c: WC[d] / occ[d] })), best = av.reduce((a, b) => b.v > a.v ? b : a), low = av.reduce((a, b) => b.v < a.v ? b : a), cBest = av.reduce((a, b) => b.c > a.c ? b : a);
      const wk = av.filter(x => x.d === 0 || x.d === 6), wd = av.filter(x => x.d > 0 && x.d < 6), m = a2 => a2.reduce((t, x) => t + x.v, 0) / a2.length, wkd = m(wd) ? Math.round((m(wk) - m(wd)) / m(wd) * 100) : 0;
      const r1 = x => Math.round(x * 10) / 10, mean = m(av);
      return `${head}<div class="cu-tr-st">${stat('Busiest day', NM[best.d], `${r1(best.v)} visitors a day`, 'up')}${stat('Quietest day', NM[low.d], `${r1(low.v)} visitors a day`, 'down')}${(Math.abs(wkd) < 5 ? stat('Weekends', 'Same', 'as weekdays') : stat('Weekends', (wkd > 0 ? '+' : '') + wkd + '%', wkd > 0 ? 'busier than weekdays' : 'quieter than weekdays'))}</div>
        ${chart(av.map(x => ({ v: x.v, c: x.c, t: `${NM[x.d]}s\n${r1(x.v)} visitors a day\n${r1(x.c)} contacts a day`, cls: x === best ? 'top' : '' })), mean, (c, i) => NM[av[i].d].slice(0, 3), 'Average per day, so every day is compared fairly.')}
        ${take(`<b>${NM[best.d]}s</b> bring the most visitors${cBest.c ? ` and <b>${NM[cBest.d]}s</b> the most contacts` : ''}. A good day for providers to post new listings and be quick to reply.`)}`;
    }

    /* dates: busiest day, the usual level, today against it; click a day for its activity */
    const BKs = BK, V = V0, Cn = C0, n = BKs.length; if (!n) return head;
    const unit = { 'By hour': 'hour', 'By day': 'day', 'By week': 'week', 'By month': 'month' }[BKs[0].t] || 'day', byDay = unit === 'day';
    const tot = V.reduce((t, x) => t + x, 0), avg = tot / n, bi = V.indexOf(Math.max(...V)), last = V[n - 1];
    const lastL = byDay ? 'Today' : unit === 'hour' ? 'This hour' : 'This ' + unit, times = avg ? last / avg : 0;
    const vs = !avg ? '' : times >= 1.15 ? `${times.toFixed(1)}× usual` : times <= .85 ? 'below usual' : 'about usual';
    const tk = !tot ? 'No visitors in this period yet.' : times >= 1.5 ? `${lastL} is busier than usual: <b>${last} visitors</b>, ${times.toFixed(1)}× a normal ${unit}.` : `Busiest ${unit} was <b>${esc(BKs[bi].l)}</b> with ${V[bi]} visitors.`;
    const every = Math.max(1, Math.ceil(n / 7)), j = bi === n - 1 && n > 1 ? V.slice(0, -1).indexOf(Math.max(...V.slice(0, -1))) : bi;
    return `${head}<div class="cu-tr-st">${stat(j === bi ? 'Busiest ' + unit : 'Best before ' + (byDay ? 'today' : 'now'), V[j], esc(BKs[j].l))}${stat('Usual ' + unit, Math.round(avg), 'visitors on average')}${stat(lastL, last, vs || '—', times >= 1.15 ? 'up' : times && times <= .85 ? 'down' : '')}</div>
      ${chart(BKs.map((b, i) => ({ v: V[i], c: Cn[i], arg: `${b.a}-${b.b}`, t: `${b.l}\n${V[i]} visitors · ${Cn[i]} contacts\n${avg ? (V[i] >= avg ? `${(V[i] / avg).toFixed(1)}× a usual ${unit}` : `${Math.round(V[i] / avg * 100)}% of a usual ${unit}`) : ''}\nClick to see what happened`, cls: (i === n - 1 ? 'now ' : '') + (i === bi ? 'top' : '') })), avg,
        (c, i) => (i % every === 0 && n - 1 - i >= Math.max(2, every * .6)) || i === n - 1 ? esc(i === n - 1 && byDay ? 'Today' : BKs[i].l) : '', 'Click a bar to see that ' + unit + '.')}
      ${take(tk)}`;
  }
  // visitors (light) and contacts (dark) per day
  function bars(BK, A1, B1) {
    const mx = Math.max(...A1, 1), n = BK.length, top = v => (100 - v / mx * 100).toFixed(2), every = Math.max(1, Math.ceil(n / 7));
    return `<div class="cu-bars"><div class="cu-bars-y"><span>${mx}</span><span>${Math.round(mx / 2)}</span><span>0</span></div>
      <div class="cu-bars-p"><svg viewBox="0 0 ${n * 10} 100" preserveAspectRatio="none" role="img" aria-label="Visitors and contacts"><line x1="0" x2="${n * 10}" y1="50" y2="50" class="gl"/><line x1="0" x2="${n * 10}" y1="0.5" y2="0.5" class="gl"/>
        ${BK.map((b, i) => `<g style="--i:${Math.min(i, 30)}"><title>${b.l}: ${A1[i]} visitors, ${B1[i]} contacts</title>${A1[i] ? `<rect class="v" x="${i * 10 + 1.4}" y="${top(A1[i])}" width="3.4" height="${(A1[i] / mx * 100).toFixed(2)}"/>` : ''}${B1[i] ? `<rect class="c" x="${i * 10 + 5.2}" y="${top(B1[i])}" width="3.4" height="${(B1[i] / mx * 100).toFixed(2)}"/>` : ''}</g>`).join('')}</svg>
        <div class="cu-bars-x">${BK.map((b, i) => i % every === 0 || i === n - 1 ? `<span style="left:${((i + .5) / n * 100).toFixed(2)}%">${esc2(b.l)}</span>` : '').join('')}</div></div></div>`;
  }
  const esc2 = x => A.esc(x);
  /* Contacts: every time someone contacted a provider — who, which provider, about what, how, from where */
  // the change pill used on every number box: "↑ 150% vs last month"
  const vsL = () => CP === 'today' ? 'vs yesterday' : CP === 'week' ? 'vs last week' : CP === 'month' ? 'vs last month' : 'vs period before';
  const pill = d => !d ? '' : `<em class="ad-delta ${d[0] === '↓' ? 'down' : d === 'new' || d[0] === '↑' ? 'up' : ''}">${d[0] === '↑' ? A.ico('up') : d[0] === '↓' ? A.ico('down') : ''}${d.replace(/^[↑↓] /, '')}<small class="ad-delta-l">${vsL()}</small></em>`;
  function contactsView({ P, PV, vis }) {
    const { esc } = A;
    const all = P.filter(e => e.k === 'contact').slice().reverse(), chs = tally(all, e => e.ch), list = all.filter(e => CF === 'all' || e.ch === CF);
    const prev = PV.filter(e => e.k === 'contact'), BK = buckets(), who = new Set(all.map(e => e.vid)), provs = tally(all, e => e.provider);
    // per bar of the period: contacts, people who contacted, providers reached
    const per = f => BK.map(b => f(all.filter(e => e.t >= b.a && e.t < b.b)));
    const box = (l, v, d, sub, sp, unit) => `<div class="kpi ad-kpi static cu-kpi"><small>${l}</small><span class="ad-kpi-v"><b data-count="${v}">${v.toLocaleString('en-US')}</b>${pill(d)}</span><span class="d">${sub}</span>
      <span class="cu-spk">${A.spark(sp)}<span class="cu-spk-h">${BK.map((b, i) => `<i ${tip(b.l, `${sp[i]} ${sp[i] === 1 ? unit[0] : unit[1]}`)}></i>`).join('')}</span></span></div>`;
    const chBox = `<div class="kpi ad-kpi static cu-kpi cu-chk"><small>How they reach out</small>${chs.length ? `<span class="ad-kpi-v"><b>${esc((CH[chs[0][0]] || [chs[0][0]])[0])}</b><em class="cu-chk-p">${pct(chs[0][1], all.length)}%</em></span>
      <span class="cu-chk-r">${chs.map(([k, n]) => { const c = CH[k] || [k, 'msg', '#5f7189']; return `<span style="--c:${c[2]}" ${tip(c[0], `${n} contact${n === 1 ? '' : 's'} · ${pct(n, all.length)}%`)}>${PX[c[1]] ? ic(c[1]) : A.ico(c[1])}<b>${pct(n, all.length)}%</b></span>`; }).join('')}</span>` : '<span class="ad-kpi-v"><b>—</b></span><span class="d">No contacts yet</span>'}</div>`;
    return `<div class="g4 ad-kpis">
        ${box('Contacts', all.length, delta(all.length, prev.length), 'each one a lead for a provider', per(E => E.length), ['contact', 'contacts'])}
        ${box('People who contacted', who.size, delta(who.size, new Set(prev.map(e => e.vid)).size), `${pct(who.size, vis.size)}% of visitors`, per(E => new Set(E.map(e => e.vid)).size), ['person', 'people'])}
        ${box('Providers reached', provs.length, delta(provs.length, new Set(prev.map(e => e.provider)).size), provs[0] ? `most: ${esc(provs[0][0])} (${provs[0][1]})` : 'got at least one lead', per(E => new Set(E.map(e => e.provider)).size), ['provider', 'providers'])}
        ${chBox}
      </div>
      <section class="pn mt"><div class="pn-h"><h2>Every contact</h2><span class="sub">${esc(labelC())}</span><span class="sp"></span>
          <div class="cu-fchips"><button class="chip ${CF === 'all' ? 'on' : ''}" data-act="cuCF" data-arg="all">All <span class="c">${all.length}</span></button>${chs.map(([k, n]) => `<button class="chip ${CF === k ? 'on' : ''}" data-act="cuCF" data-arg="${k}">${esc((CH[k] || [k])[0])} <span class="c">${n}</span></button>`).join('')}</div></div>
        ${list.length ? `<div class="ad-tw cu-list"><table class="tbl ad-tbl cu-ctbl"><thead><tr><th>When</th><th>Customer</th><th>Contacted</th><th>About</th><th>Vertical</th><th>Via</th></tr></thead><tbody>
          ${pageOf(list, 'contacts').map((e, i) => { const c = C.byVid[e.vid] || {}, l = byId(e.lid); return `<tr class="ck" style="--i:${i}" data-act="cuOpen" data-arg="${e.vid}">
            <td><b>${A.ago(e.t)} ago</b><small class="ad-sm">${new Date(e.t).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</small></td>
            <td><div class="li">${c.account ? A.av(c.label, 'sm') : `<span class="av sm cu-anon">${ic('device')}</span>`}<div><b>${esc(c.label || '')}</b><small>${flag(c.cc)} ${esc(c.city || cname(c.cc))}</small></div></div></td>
            <td><b>${esc(e.provider || '')}</b>${e.org && e.org !== e.provider ? `<small class="ad-sm">${esc(e.org)}</small>` : ''}</td>
            <td>${l ? `<a class="cu-li cu-li-t" href="${lHref(e.lid)}" target="_blank" rel="noopener"><img src="${esc(l.img[0])}" alt=""><span><b>${esc(l.title)}</b><small>${esc(area(l.loc))} · ${A.aed(l.price)}</small></span></a>` : esc(e.title || '')}</td>
            <td>${e.v ? `<span class="ad-v" style="--c:${VC[e.v]}">${A.ico(A.VI[e.v])}${esc(cat(e.v, e.cat) || VL[e.v])}</span>` : ''}</td>
            <td>${A.st((CH[e.ch] || [e.ch])[0], e.ch === 'wa' ? '' : e.ch === 'call' ? 'warn' : 'info')}</td></tr>`; }).join('')}</tbody></table></div>${pager(list.length, 'contacts')}`
          : `<div class="ad-empty big">${A.ico('wa')}<b>No contacts yet</b><small>Try a longer period.</small></div>`}</section>`;
  }

  /* Activity: everything that happened, newest first, grouped by day */
  function activityView({ P }) {
    const { esc } = A;
    const G = { all: ['Everything', () => true], visit: ['Visits', e => e.k === 'visit'], search: ['Searches', e => e.k === 'search'], view: ['Listings opened', e => e.k === 'view' || e.k === 'prov'], save: ['Saves & follows', e => ['save', 'follow', 'alert'].includes(e.k)], contact: ['Contacts', e => e.k === 'contact'], account: ['Sign-ups & logins', e => ['signup', 'login', 'logout'].includes(e.k)] };
    const base = P.filter(e => e.k !== 'page' && e.k !== 'unsave'), af = G[AF] ? AF : 'all', full = base.filter(G[af][1]).slice().reverse(), list = pageOf(full, 'activity');
    const byDay = []; list.forEach(e => { const d = new Date(e.t).toDateString(), g = byDay[byDay.length - 1]; if (g && g.d === d) g.e.push(e); else byDay.push({ d, t: e.t, e: [e] }); });
    const dayName = t => { const d = new Date(t), td = new Date(NOW); if (d.toDateString() === td.toDateString()) return 'Today'; td.setDate(td.getDate() - 1); if (d.toDateString() === td.toDateString()) return 'Yesterday'; return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' }); };
    return `<section class="pn cu-list"><div class="pn-h"><h2>Everything that happened</h2><span class="sub">${esc(labelC())} · newest first</span></div>
        <div class="cu-fchips" style="margin-bottom:14px">${Object.entries(G).map(([k, [l, f]]) => `<button class="chip ${af === k ? 'on' : ''}" data-act="cuAF" data-arg="${k}">${l} <span class="c">${base.filter(f).length}</span></button>`).join('')}</div>
        ${byDay.map(g => { const k = tally(g.e, e => e.k === 'prov' ? 'view' : ['follow', 'alert'].includes(e.k) ? 'save' : e.k), KL = { contact: ['contact', 'contacts'], save: ['save', 'saves'], search: ['search', 'searches'], view: ['listing opened', 'listings opened'], visit: ['visit', 'visits'], signup: ['sign-up', 'sign-ups'] };
          return `<div class="cu-tl-d"><b>${esc(dayName(g.t))}</b><span>${g.e.length} ${g.e.length === 1 ? 'action' : 'actions'}${k.filter(([x]) => KL[x]).slice(0, 3).map(([x, n]) => ` · ${n} ${KL[x][n === 1 ? 0 : 1]}`).join('')}</span></div>
          <ol class="cu-tl">${g.e.map((e, i) => { const c = C.byVid[e.vid] || {}, w = say(e); if (!w) return ''; const l = e.lid && byId(e.lid), strip = x => x.replace(/<a [^>]*>|<\/a>/g, '');
            return `<li class="${KIND_TONE[e.k] || ''} ${e.k === 'contact' ? 'lead' : ''}" style="--i:${Math.min(i, 12)}"><button type="button" data-act="cuOpen" data-arg="${e.vid}" ${tip(c.label || 'Visitor', 'Click to see their journey')}>
              <time>${new Date(e.t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</time><i>${w[0]}</i>
              <span class="cu-tl-b"><span class="cu-tl-w">${c.account ? A.av(c.label, 'sm') : `<span class="av sm cu-anon">${ic(c.dev === 'desktop' ? 'desktop' : 'device')}</span>`}<b>${esc(c.label || '')}</b><em>${flag(c.cc)} ${esc(c.city || cname(c.cc))}</em>${e.k === 'contact' ? `<span class="cu-tl-lead">${ic('chat')}Lead</span>` : ''}</span>
                <span class="cu-tl-t">${strip(w[1])}</span>${w[2] ? `<small>${strip(w[2])}</small>` : ''}</span>
              ${l ? `<img class="cu-tl-im" src="${esc(l.img[0])}" alt="" loading="lazy">` : ''}</button></li>`; }).join('')}</ol>`; }).join('') || `<div class="ad-empty big">${A.ico('search')}<b>Nothing here</b><small>Try another filter or a longer period.</small></div>`}
        ${pager(full.length, 'activity')}</section>`;
  }

  /* People: who, and their journey (as on the first page) */
  function peopleView({ people: inPeriod }) {
    const { esc } = A, inP = inC;
    // a group picked from a "Worth a look" card replaces everyone in the period
    const people = FOC ? FOC.vids.map(v => C.byVid[v]).filter(Boolean) : inPeriod;
    const tabs = [['all', 'Everyone', () => true], ['new', 'New', c => inP(c.first)], ['back', 'Came back', cameBack], ['account', 'Have an account', c => c.account], ['contacted', 'Contacted a provider', c => c.contacts > 0], ['anon', 'No account yet', c => !c.account]];
    const tab = tabs.find(t => t[0] === TAB) || tabs[0];
    const rows = people.filter(tab[2]).filter(c => !Q || [c.label, c.name, cname(c.cc), c.city, srcName(c.src), VL[c.interest]].join(' ').toLowerCase().includes(Q)).sort((a, b) => b.last - a.last);
    const status = c => c.account ? (inP(c.signedUp) ? ['New account', 'info'] : ['Has an account', '']) : c.visits > 1 ? ['Came back', 'warn'] : ['First visit', 'mute'];
    return `<section class="pn"><div class="pn-h"><h2>People</h2><span class="sub">${rows.length} ${FOC ? '' : esc(labelC()) + ' '}· click anyone to see their journey</span><span class="sp"></span><label class="ad-find">${A.ico('search')}<input data-cuq placeholder="Name, country, interest" value="${esc(Q)}"></label></div>
      ${FOC ? `<div class="cu-foc">${ic('funnel')}<span>Showing <b>${esc(FOC.l)}</b> · ${people.length} ${people.length === 1 ? 'person' : 'people'}</span><button type="button" class="btn btn-sm" data-act="cuUnfocus">${A.ico('x')}Show everyone</button></div>` : ''}
      <div class="cu-fchips cu-pf">${tabs.map(([k, l, f]) => `<button class="chip ${TAB === k ? 'on' : ''}" data-act="cuTab" data-arg="${k}">${l} <span class="c">${people.filter(f).length}</span></button>`).join('')}</div>
      ${rows.length ? `<div class="ad-tw cu-list"><table class="tbl ad-tbl cu-tbl"><thead><tr><th>Person</th><th>From</th><th>Found UpNow via</th><th>Interested in</th><th>Visits</th><th>Opened</th><th>Saved</th><th>Contacts</th><th>Last seen</th></tr></thead><tbody>
        ${pageOf(rows, 'people').map((c, i) => { const s2 = status(c); return `<tr class="ck" style="--i:${i}" data-act="cuOpen" data-arg="${c.vid}"><td><div class="li">${c.account ? A.av(c.label) : `<span class="av cu-anon">${ic(c.dev === 'desktop' ? 'desktop' : 'device')}</span>`}<div><b>${esc(c.label)}${c.real ? ' <span class="ad-real">This browser</span>' : ''}</b><small>${A.st(...s2)}</small></div></div></td>
          <td><span class="cu-from">${flag(c.cc)} ${esc(c.city || cname(c.cc))}</span></td><td>${esc(srcName(c.src))}</td><td>${c.interest ? `<span class="ad-v" style="--c:${VC[c.interest]}">${A.ico(A.VI[c.interest])}${esc(VL[c.interest])}</span>` : '—'}</td>
          <td>${c.visits}</td><td>${c.views}</td><td>${c.saves || '—'}</td><td>${c.contacts ? `<b class="cu-ok">${c.contacts}</b>` : '—'}</td><td>${NOW - c.last < 15 * 60000 ? '<span class="cu-now">Now</span>' : A.ago(c.last) + ' ago'}</td></tr>`; }).join('')}</tbody></table></div>${pager(rows.length, 'people')}`
        : `<div class="ad-empty big">${A.ico('user')}<b>Nobody here</b><small>Try another tab or a longer period.</small></div>`}</section>`;
  }

  /* ---------- one person: the full journey ---------- */
  function open(vid) {
    const { esc, ico } = A; if (!C) build(); const c = C.byVid[vid]; if (!c) return;
    const views = c.events.filter(e => e.k === 'view');
    // prices compare like for like only: the category they opened most, with its unit (/person, /year …)
    const pTop = tally(views.filter(e => e.price && e.cat), e => e.v + '|' + e.cat)[0], pK = pTop ? pTop[0] : '';
    const prices = views.filter(e => e.price && e.v + '|' + e.cat === pK).map(e => e.price).sort((a, b) => a - b);
    const pL = pK ? byId((views.find(e => e.v + '|' + e.cat === pK) || {}).lid) : null, pU = pL ? unitOf(pL) : '', pCat = pK ? catOr(...pK.split('|')) : '';
    const cats = tally(c.events.filter(e => (e.k === 'view' || e.k === 'search') && e.v), e => e.v + '|' + (e.cat || e.o || '')).slice(0, 4);
    const areas = tally([...c.events.filter(e => e.k === 'search').flatMap(e => (e.loc || []).map(loc => ({ loc }))), ...views.filter(e => e.loc)], e => e.loc).slice(0, 6);
    const contacts = c.events.filter(e => e.k === 'contact').reverse();
    const status = c.account ? (c.signedUp ? 'Account since ' + A.dateS(c.signedUp) : 'Has an account') : c.visits > 1 ? 'Came back · no account yet' : 'First visit · no account yet';
    const sess = c.sessions.slice().reverse();
    A.drawer(`<div class="dr-h ad-dh">${c.account ? A.av(c.label, 'ad-avl') : `<span class="av ad-avl cu-anon">${ic(c.dev === 'desktop' ? 'desktop' : 'device')}</span>`}<div style="flex:1;min-width:0"><h3>${esc(c.label)}${c.real ? ' <span class="ad-real">This browser</span>' : ''}</h3>
        <small>${flag(c.cc)} ${esc([c.city, cname(c.cc)].filter(Boolean).join(', '))} · ${esc(DEV[c.dev] || 'Device')}${c.lang ? ' · ' + (c.lang === 'ar' ? 'Arabic' : 'English') : ''}${c.cur ? ' · prices in ' + esc(c.cur) : ''}</small>
        <div class="ad-dh-meta">${A.st(status, c.account ? 'info' : 'mute')}<span class="hint">First seen ${A.dateS(c.first)} via ${esc(srcName(c.src))} · last seen ${NOW - c.last < 15 * 60000 ? 'now' : A.ago(c.last) + ' ago'}</span></div></div><button class="x" data-act="close">${ico('x')}</button></div>
      <div class="dr-b ad-db cu-pd">${body()}
      </div>`, 'c:' + vid);
    function body() {
      // in short: what they want, and how far they got
      const k0 = cats[0] && cats[0][0].split('|'), want = k0 ? `Interested in <b>${esc(catOr(k0[0], k0[1]))}</b>${areas[0] ? ` around <b>${esc(area(areas[0][0]))}</b>` : ''}${prices.length && pK === k0.join('|') ? `, opening ones at ${prices[0] === prices[prices.length - 1] ? A.aed(prices[0]) : `${A.aed(prices[0])} – ${A.aed(prices[prices.length - 1])}`}${pU ? ' ' + esc(pU) : ''}` : ''}.` : 'Hasn’t shown interest in anything yet.';
      const saved = c.events.filter(e => ['save', 'follow', 'alert'].includes(e.k)).length, provs = [...new Set(contacts.map(e => e.provider))];
      const far = `${c.views ? `Opened ${c.views} listing${c.views === 1 ? '' : 's'}` : 'Didn’t open a listing'} on ${c.visits === 1 ? 'their first visit' : c.visits + ' visits'}${c.contacts ? `, then contacted <b>${provs.slice(0, 2).map(esc).join(' and ')}</b>${provs.length > 2 ? ` and ${provs.length - 2} more` : ''}.` : saved ? `, saved ${saved === 1 ? 'one' : saved} but hasn’t contacted anyone yet.` : c.views ? ', but hasn’t saved or contacted anyone yet.' : '.'}`;
      // how far they got: four steps, the ones they reached are filled
      const steps = [['users', 'Visited', `${c.visits} visit${c.visits === 1 ? '' : 's'}${c.searches ? ` · ${c.searches} search${c.searches === 1 ? '' : 'es'}` : ''}`, true], ['open', 'Opened a listing', c.views ? `${c.views} listing${c.views === 1 ? '' : 's'}` : 'not yet', c.views > 0],
        ['heartFill', 'Saved', saved ? `${saved} saved` : 'not yet', saved > 0], ['chat', 'Contacted', c.contacts ? `${c.contacts} contact${c.contacts === 1 ? '' : 's'}` : 'not yet', c.contacts > 0]];
      // listings they looked at, newest first, with what they did on each
      const seen = []; c.events.slice().reverse().forEach(e => { if (e.lid && ['view', 'save', 'contact'].includes(e.k) && !seen.includes(e.lid)) seen.push(e.lid); });
      const did = (lid, k) => c.events.some(e => e.lid === lid && e.k === k);
      const lcards = seen.map(byId).filter(Boolean).slice(0, 6);
      const rows = [c.account && c.uid ? ['Mobile', esc(c.uid.startsWith('+') ? c.uid.replace(/^(\+\d{1,3})(\d{2})(\d{3})(\d+)$/, '$1 $2 $3 $4') : c.uid)] : null,
        ['From', `${flag(c.cc)} ${esc([c.city, cname(c.cc)].filter(Boolean).join(', '))}${c.ccBy ? `<small>Worked out from the ${c.ccBy === 'phone' ? 'phone code' : c.ccBy === 'timezone' ? 'device time zone' : c.ccBy === 'network' ? 'network location' : 'browser language'}</small>` : ''}`],
        ['Found UpNow', esc(srcName(c.src))], ['Device', esc(DEV[c.dev] || 'Device')], c.lang ? ['Language', c.lang === 'ar' ? 'Arabic' : 'English'] : null, c.cur ? ['Sees prices in', esc(c.cur)] : null,
        ['First seen', A.dateS(c.first)], ['Account', c.account ? (c.signedUp ? 'Since ' + A.dateS(c.signedUp) : 'Yes') : 'Not yet']].filter(Boolean);
      // the price range they looked at: each listing a dot, the usual price marked
      const pr = (() => { if (!prices.length) return ''; const lo = prices[0], hi = prices[prices.length - 1], mid = prices[Math.floor(prices.length / 2)], span = hi - lo || 1, x = p => lo === hi ? 50 : 6 + (p - lo) / span * 88, u = pU ? ' ' + esc(pU) : '';
        const others = views.filter(e => e.price && e.v + '|' + e.cat !== pK).length;
        return `<div class="sect-t">Prices of ${esc(pCat.toLowerCase())} they opened</div><div class="cu-pg2"><div class="cu-pg2-t"><i style="left:${x(lo)}%;right:${100 - x(hi)}%"></i>${prices.map(p => `<b style="left:${x(p)}%" title="${A.aed(p)}${u}"></b>`).join('')}<em style="left:${x(mid)}%">${A.aed(mid)}${u}</em></div>
          <div class="cu-pg2-x"><span>${A.aed(lo)}</span>${lo !== hi ? `<span>${A.aed(hi)}</span>` : ''}</div></div>
          <p class="hint" style="margin:6px 0 0">${prices.length === 1 ? 'One listing opened.' : `Usually around <b>${A.aed(mid)}${u}</b> across ${prices.length} listings.`} This is the price on the listings they opened, not a budget they gave us${others ? ` — other categories are left out so prices compare like for like` : ''}.</p>`; })();
      const card = (icon, title, inner, extra = '') => `<section class="cu-pd-c ${extra}"><div class="cu-pd-ch"><span class="cu-hi" style="--c:${TINT[icon] || '#136142'}">${ic(icon)}</span><h4>${title}</h4></div>${inner}</section>`;
      const interest = cats.map(([k, n]) => { const [v, cc] = k.split('|'); return { l: catOr(v, cc), ico: A.VI[v], c: VC[v], v: n }; });
      const journey = `<div class="cu-jr">${sess.map(s => { const evs = s.events.filter(e => e.k !== 'page'), mins = Math.max(1, Math.round((s.t1 - s.t0) / 60000));
          return `<details class="cu-s" ${s === sess[0] ? 'open' : ''}><summary><span class="cu-s-n">Visit ${s.n}</span><span class="cu-s-t">${new Date(s.t0).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}, ${new Date(s.t0).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
              <span class="cu-s-m">${esc(srcName(s.src))} · ${mins} min · ${evs.length} action${evs.length === 1 ? '' : 's'}</span>${evs.some(e => e.k === 'contact') ? '<span class="cu-s-c">Contacted</span>' : ''}${A.ico('chev')}</summary>
            <ol>${evs.map(e => { const w = say(e); return w ? `<li class="${KIND_TONE[e.k] || ''}"><i>${w[0]}</i><span>${w[1]}${w[2] ? `<small>${w[2]}</small>` : ''}</span><time>${new Date(e.t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</time></li>` : ''; }).join('')}</ol></details>`; }).join('')}</div>
        <p class="hint cu-how" style="margin-top:12px">${ic('globe')}${c.account ? 'Signed in, so this is one person across devices they log in on.' : 'No account, so this is one browser — the same person on another device shows as someone else until they log in.'}</p>`;
      return `<div class="cu-pd-hero">
          <div class="cu-pd-sum">${ic('bulb')}<div><small>In short</small><p>${want} ${far}</p></div></div>
          <div class="cu-pd-steps">${steps.map(([icn, l, sub, on], i) => `<div class="${on ? 'on' : ''} ${steps[i + 1] && steps[i + 1][3] ? 'nx' : ''}"><span>${ic(icn)}</span><b>${l}</b><small>${sub}</small></div>`).join('')}</div>
        </div>
        <div class="cu-pd-2"><div class="cu-pd-col">
          ${card('search', 'What they’re after', `${interest.length ? rowsI(interest) : '<p class="hint">Nothing searched or opened yet.</p>'}
            ${areas.length ? `<div class="sect-t">Areas</div><div class="cu-chips">${areas.map(([a, n]) => `<span class="cu-chip">${A.ico('pin')}${esc(area(a))}<em>${n}</em></span>`).join('')}</div>` : ''}${pr}`)}
          ${lcards.length ? card('open', `Listings they looked at <span class="hint">· ${seen.length}</span>`, `<div class="lgrid ad-lgrid cu-pd-ls">${lcards.map((l, i) => { const n = c.events.filter(e => e.k === 'view' && e.lid === l.id).length, ce = c.events.find(e => e.k === 'contact' && e.lid === l.id), sv = did(l.id, 'save'), u = unitOf(l);
            return `<a class="lcard ad-lc" style="--i:${i}" href="${lHref(l.id)}" target="_blank" rel="noopener" title="Open the listing on UpNow"><div class="im"><img src="${esc(l.img[0])}" alt="" loading="lazy">${ce ? A.st('Contacted', 'ok') : sv ? A.st('Saved', 'info') : ''}<span class="cat">${esc(catOr(l.v, l.cat))}</span></div>
              <div class="bd"><b class="t">${esc(l.title)}</b><span class="ad-by">${A.av(l.provider.name, 'sm')}${esc(l.provider.name)}</span><span class="pr">${A.aed(l.price)}${u ? ` <span>${esc(u)}</span>` : ''}</span></div>
              <div class="ms"><div><small>Opened</small><b>${n || 1}×</b></div><div><small>Saved</small><b class="${sv ? 'cu-ok' : 'cu-no'}">${sv ? 'Yes' : '—'}</b></div><div><small>Contacted</small><b class="${ce ? 'cu-ok' : 'cu-no'}">${ce ? esc((CH[ce.ch] || [ce.ch])[0]) : '—'}</b></div></div></a>`; }).join('')}</div>${seen.length > lcards.length ? `<p class="hint" style="margin:10px 0 0">Showing the latest ${lcards.length} of ${seen.length}. Their journey lists them all.</p>` : ''}`) : ''}
          ${contacts.length ? card('chat', 'Providers they contacted', contacts.map(e => { const l = byId(e.lid), ch = CH[e.ch] || [e.ch, 'msg']; return `<div class="ad-lrow static cu-ct">${l ? `<img src="${esc(l.img[0])}" alt="">` : ''}<div><b>${esc(e.provider || '')}</b><small>${esc(l ? l.title : e.title || '')} · ${A.dateS(e.t)}</small></div><span class="cu-chb cu-ch-${e.ch}">${esc(ch[0])}</span></div>`; }).join('')) : ''}
          </div><div class="cu-pd-col">
          ${card('pulse', 'Their journey <span class="hint">· newest visit first</span>', journey)}
          ${card('user', 'Details', `<dl class="ad-rows cu-pd-dl">${rows.map(([t, d]) => `<div><dt>${t}</dt><dd>${d}</dd></div>`).join('')}</dl>`)}
        </div></div>`;
    }

  }

  window.ADM_CUST = {
    init(api) {
      A = api;
      const top = () => { const v = document.getElementById('view'); if (v) v.scrollTop = 0; };
      A.addActs({
        cuTab: k => { TAB = k; resetPg(); A.render(); },
        cuView: k => { VIEW = k; FOC = null; resetPg(); store('cuView', k); A.render(); top(); },
        cuGo: k => { TAB = k; FOC = null; resetPg(); VIEW = 'people'; store('cuView', 'people'); A.render(); top(); },
        cuFocus: k => { if (!FOCI[k]) return; FOC = FOCI[k]; TAB = 'all'; Q = ''; resetPg(); VIEW = 'people'; store('cuView', 'people'); A.render(); top(); },
        cuUnfocus: () => { FOC = null; resetPg(); A.render(); },
        cuPg: a => { const [k, n] = a.split(':'); PG[k] = Math.max(0, +n || 0); A.render(); const el = document.querySelector('.cu-list'); if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' }); },
        cuVert: k => { VERT = VL[k] ? k : 'all'; FOC = null; resetPg(); store('cuVert', VERT); A.render(); },
        cuPeriod: k => { CP = k; CAL = false; FOC = null; resetPg(); store('cuPeriod', k); A.render(); },
        cuCal: () => { CAL = !CAL; const el = document.querySelector('.cu-cal'); if (el) el.classList.toggle('on', CAL); const b = document.querySelector('.cu-cust'); if (b) b.setAttribute('aria-expanded', CAL); },
        cuQuick: k => { CR = quick(k); CP = 'custom'; FOC = null; resetPg(); CAL = false; store('cuRange', JSON.stringify({ k })); store('cuPeriod', 'custom'); A.render(); },
        cuApply: () => { const v = id => (document.getElementById(id) || {}).value, f = v('cuFrom'), t = v('cuTo'); if (!f || !t) return;
          let a = +new Date(f + 'T00:00'), b = +new Date(t + 'T00:00'); if (a > b) [a, b] = [b, a]; // dates the wrong way round: swap, don't complain
          CR = { a: day0(a), b: dayEnd(b) }; CP = 'custom'; FOC = null; resetPg(); CAL = false; store('cuRange', JSON.stringify(CR)); store('cuPeriod', 'custom'); A.render(); },
        cuCF: k => { CF = k; resetPg(); A.render(); },
        cuTrv: k => { TRV = k; store('cuTrv', k); A.render(); },
        // a bar in "Visitors and contacts": show that day (or hour/week) in Activity
        cuDay: a => { const [x, y] = a.split('-').map(Number); if (!x) return; CR = { a: x, b: Math.min(y - 1, NOW) }; CP = 'custom'; CAL = false; FOC = null; AF = 'all'; resetPg(); store('cuRange', JSON.stringify(CR)); store('cuPeriod', 'custom'); VIEW = 'activity'; store('cuView', 'activity'); A.render(); top(); },
        cuAF: k => { AF = k; resetPg(); A.render(); },
        // a number box that opens Activity already filtered (e.g. Listings saved → Saves & follows)
        cuAct: k => { AF = k; FOC = null; resetPg(); VIEW = 'activity'; store('cuView', 'activity'); A.render(); top(); },
        cuOpen: vid => open(vid)
      });
      // hover info: one tip that follows the mouse over anything with data-tip on this page or in the drawer
      const tipEl = document.createElement('div'); tipEl.className = 'cu-tip'; tipEl.setAttribute('role', 'tooltip'); document.body.appendChild(tipEl); let tipOn = null;
      document.addEventListener('mousemove', e => { const t = e.target.closest && e.target.closest('[data-tip]'); if (!t || !(t.closest('.pg-customers') || t.closest('#drawer'))) { if (tipOn) { tipEl.classList.remove('on'); tipOn = null; } return; }
        if (t !== tipOn) { tipOn = t; const [h, ...rest] = t.dataset.tip.split('\n'); tipEl.innerHTML = `<b>${A.esc(h)}</b>${rest.map(x => `<span>${A.esc(x)}</span>`).join('')}`; tipEl.classList.add('on'); }
        const r = tipEl.getBoundingClientRect(), x = Math.min(e.clientX + 14, innerWidth - r.width - 8), y = e.clientY - r.height - 12 < 8 ? e.clientY + 18 : e.clientY - r.height - 12; tipEl.style.transform = `translate(${x}px, ${y}px)`; });
      document.addEventListener('scroll', () => { if (tipOn) { tipEl.classList.remove('on'); tipOn = null; } }, true);
      // the date picker closes on a click outside it or Esc
      const shut = () => { if (!CAL) return; CAL = false; const el = document.querySelector('.cu-cal'); if (el) el.classList.remove('on'); };
      document.addEventListener('click', e => { if (CAL && !e.target.closest('.cu-per')) shut(); });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') shut(); });
      // rows per page: keep the first row on screen in view, go back to the page that holds it
      document.addEventListener('change', e => { const k = e.target.dataset && e.target.dataset.cuper; if (!k || !PER[k]) return; const first = PG[k] * PER[k]; PER[k] = +e.target.value; PG[k] = Math.floor(first / PER[k]); store('per_' + k, PER[k]); A.render(); const el = document.querySelector('.cu-list'); if (el) el.scrollIntoView({ block: 'start' }); });
      document.addEventListener('input', e => { if (!e.target.matches('[data-cuq]')) return; Q = e.target.value.toLowerCase(); PG.people = 0; clearTimeout(e.target._t); e.target._t = setTimeout(() => { const pos = e.target.selectionStart; A.render(); const n = document.querySelector('[data-cuq]'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }, 220); });
      // a visit in another tab of this browser shows up straight away
      window.addEventListener('storage', e => { if (e.key === 'upnow.track' && A.page() === 'customers') A.refresh(); });
    },
    page, open,
    liveCount: () => { if (!C) build(); return C.list.filter(c => NOW - c.last < 15 * 60000).length; }
  };
})();
