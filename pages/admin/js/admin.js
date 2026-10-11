/* UpNow admin — the team's dashboard. Same look as the provider dashboard (its css/styles.css, pw/app.css, pw/site.css).
     Overview      requests in, decisions out, review speed, income — today / this week / this month
     Applications  providers asking to join: documents valid? what may they list? → Approve · Ask for changes · Reject
     Listings      listings sent for review: can this provider list it? is it done right? → Go live · Ask for changes · Not approved
     Providers     approved providers: plan, live listings, documents running out, payments
     Income        what providers pay UpNow (monthly plans) — customers never pay
     Settings      the admin number, plans and prices, review rules
   Only the admin number (SITE.admin) gets in. Decisions on the real provider in this browser are written back (js/data.js). */
(function () {
  const D = window.ADM_DATA, { DAY, NOW, VL, VI, VC, DOCS, WHO, GATE, LEASE, catLabel, areaN } = D;
  const PFX = D.PFX, KEY = PFX + '.admin.state';
  const P = { // icons (provider dashboard's set + the few admin needs)
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>', users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5M16 4.8a3.2 3.2 0 0 1 0 6.2M18 14.8c1.8.6 3 2.4 3 5.2"/>',
    file: '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>', layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.3 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5M12 6v2M12 16v2"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>', bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20a2 2 0 0 0 4 0"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>', alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    chevR: '<path d="m9 6 6 6-6 6"/>', chev: '<path d="m6 9 6 6 6-6"/>', shield: '<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6z"/><path d="m8.8 12 2.2 2.2 4.3-4.4"/>',
    wa: '<path d="M4 20l1.2-3.8A8.5 8.5 0 1 1 8 19z"/><path d="M9 9.2c.2 2.6 3 5.2 5.6 5.6l1.1-1.3-1.8-.9-.8.8c-1-.4-2.2-1.6-2.6-2.6l.8-.8-.9-1.8z"/>',
    phone: '<path d="M5 3h3.5l1.8 4.6-2.3 1.5a11 11 0 0 0 6 6l1.5-2.3L20 14.5V18a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/>', mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 17-5-5L5 20"/>', compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    out: '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H4"/>', trend: '<path d="m3 17 6-6 4 4 8-8M15 7h6v6"/>', lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    building: '<path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 9h4a1 1 0 0 1 1 1v11M3 21h18M8 8h3M8 12h3M8 16h3"/>', wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3 17.8V21h3.2l6.3-6.3a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
    badge: '<path d="m8.5 12 2.5 2.5 4.5-5"/><circle cx="12" cy="12" r="9"/>', grad: '<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11v5c3 2.5 9 2.5 12 0v-5M22 9v6"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-10.1A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    up: '<path d="M12 19V5M6 11l6-6 6 6"/>', down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
    doc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>', chevL: '<path d="m15 6-6 6 6 6"/>', send: '<path d="M4 12 20 4l-6 16-3-7z"/><path d="m11 13 9-9"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.9-3M4 13a8 8 0 0 0 14.9 3M4 4v4h4M20 20v-4h-4"/>', tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>'
  };
  const ico = (n, c = '') => `<svg class="ico ${c}" viewBox="0 0 24 24">${P[n] || P.grid}</svg>`;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const initials = n => String(n).split(/\s+/).filter(x => /^[\p{L}\d]/u.test(x)).map(x => x[0]).slice(0, 2).join('').toUpperCase();
  const av = (n, cls = '') => `<span class="av ${cls}">${esc(initials(n))}</span>`;
  const aed = n => 'AED ' + Math.round(n).toLocaleString('en-US'); // always AED: also used in texts sent to providers, who are billed in AED
  /* ---------- display currency + language: the same setting as the rest of the site ('upnow.prefs', js/core/utils.js) ----------
     Only what's on screen converts: amounts written as "AED 1,234" in the page's text become the chosen currency as they're
     drawn (count-ups too). aed() itself stays AED, so WhatsApp texts, plan prices and reminders still quote what's billed. */
  const PREFS = (() => { try { return JSON.parse(localStorage.getItem('upnow.prefs')) || {}; } catch (e) { return {}; } })();
  const CURS = (window.SITE && SITE.currencies) || { AED: [1, 'AED', '🇦🇪'] }, CUR = CURS[PREFS.cur] ? PREFS.cur : 'AED', LANG = PREFS.lang || 'en';
  const setPref = (k, v) => { PREFS[k] = v; localStorage.setItem('upnow.prefs', JSON.stringify(PREFS)); location.reload(); };
  document.documentElement.lang = LANG; document.documentElement.dir = ((window.SITE && SITE.rtl) || []).includes(LANG) ? 'rtl' : 'ltr';
  if (CUR !== 'AED') {
    const [rate, code] = CURS[CUR], RX = /AED\s?(-?\d[\d,]*(?:\.\d+)?)(\s?[kKmM])?/g;
    const conv = t => t.replace(RX, (m, n, k) => { const v = parseFloat(n.replace(/,/g, '')) * rate; return code + ' ' + (k ? (v < 10 ? v.toFixed(1) : Math.round(v)) + k.trim() : v < 100 && v % 1 ? v.toFixed(1) : Math.round(v).toLocaleString('en-US')); });
    const fixText = n => { if (n.nodeValue.includes('AED') && !(n.parentNode && n.parentNode.closest && n.parentNode.closest('textarea,script,style,[data-aed]'))) { const v = conv(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; } };
    const walk = root => { if (root.nodeType === 3) return fixText(root); if (root.nodeType !== 1) return; const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) fixText(n); };
    new MutationObserver(ms => ms.forEach(m => m.type === 'characterData' ? fixText(m.target) : m.addedNodes.forEach(walk))).observe(document.documentElement, { subtree: true, childList: true, characterData: true });
    document.addEventListener('DOMContentLoaded', () => walk(document.body));
  }
  const st = (t, k = '') => `<span class="st ${k}">${esc(t)}</span>`;
  const ago = t => { const m = Math.max(0, Math.round((NOW - t) / 6e4)); return m < 60 ? m + 'm' : m < 1440 ? Math.round(m / 60) + 'h' : Math.round(m / 1440) + 'd'; };
  const dur = ms => { const h = ms / 36e5; return h < 1 ? Math.round(h * 60) + 'm' : h < 48 ? Math.round(h) + 'h' : Math.round(h / 24) + 'd'; };
  const dateS = t => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const dateY = t => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); // documents: always with the year
  const digits = p => String(p || '').replace(/\D/g, '');
  const waHref = (phone, text) => 'https://wa.me/' + digits(phone) + '?text=' + encodeURIComponent(text);
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TYPE_L = { owner: 'Owner / landlord', broker: 'Property manager', landlord: 'Landlord company', brokerage: 'Real estate brokerage', manager: 'Property management company', holidayop: 'Holiday home operator', venueop: 'Venue operator', sportsop: 'Sports facility operator', charter: 'Yacht charter company',
    freelancer: 'Freelancer', freelanceAE: 'Freelancer', svcco: 'Service company', salon: 'Salon / beauty studio', studio: 'Studio / agency', guide: 'Licensed tour guide', host: 'Workshop host / instructor', operator: 'Tour operator', activity: 'Activity / workshop company',
    tutor: 'Private tutor', trainer: 'Freelance trainer', coach: 'Sports coach', nursery: 'Nursery', school: 'School', higher: 'University / higher education', training: 'Training institute', academy: 'Sports academy', gym: 'Gym / studio / club', aggregator: 'Credit / package provider',
    facility: 'Clinic / medical centre', homecare: 'Home healthcare provider', insurer: 'Insurance company', insbroker: 'Insurance intermediary', agency: 'Insurance agency' };

  /* ---------- state ---------- */
  let saved = D.read(KEY) || {};
  const S = Object.assign({ period: 'month', appTab: 'waiting', lstTab: 'review', provTab: 'all', vf: 'all', q: '', dec: {}, ldec: {}, checks: {}, lchecks: {}, plans: D.PLANS0, planOf: {}, paid: {}, log: [], sla: 24, warnDays: 60 }, saved);
  S.planSug = S.planSug || {};
  const save = () => D.write(KEY, S);
  const session = () => D.read(PFX + '.admin');
  const PLAN = id => S.plans.find(p => p.id === id) || S.plans[0];
  // each plan has its own metal colour everywhere (badges, donut, bars) — set here so saved plans pick it up too
  const PLAN_C = { launch: '#b3bbc3', basic: '#a0623a', pro: '#5f7189', business: '#b8860b' }; // metal tiers: grey · bronze · silver · gold
  S.plans.forEach(p => { if (PLAN_C[p.id]) p.c = PLAN_C[p.id]; });

  /* ---------- the data: sample + this browser's real provider, with the team's decisions on top ---------- */
  let APPS = [], LST = [];
  function build() {
    const s = D.sample(), real = D.realApp() || [];
    real.forEach(r => { if (!r.decided) D.stampSeen(r.owner); });
    const realL = real.length ? D.realListings(real[0].owner) : [];
    APPS = [...real, ...s.apps].map(a => { const o = S.dec[a.id]; const x = o && !a.real ? Object.assign({}, a, o) : a; if (S.planOf[a.id]) x.plan = S.planOf[a.id]; else if (!x.plan && x.req && x.status !== 'rejected') x.plan = x.req; x.need = x.need || Object.keys(x.docs); return x; });
    LST = [...realL, ...s.lst].map(l => { const o = S.ldec[l.id]; return o && !l.real ? Object.assign({}, l, o) : l; });
    // sample listings waiting for a provider the team has since approved go to review, like the real flow
    LST.forEach(l => { const a = appOf(l); if (l.sample && l.status === 'verify' && a && a.status === 'verified') { l.status = 'review'; l.t = a.decided || l.t; } });
    // …and a listing whose category licence isn't on file waits for it (listing-form.js does the same)
    LST.forEach(l => { const a = appOf(l); if (l.sample && a && ['review', 'live'].includes(l.status) && GATE[l.cat] && !a.docs[GATE[l.cat](a)]) l.status = 'licence'; });
  }
  const appOf = l => APPS.find(a => a.id === l.app);
  const listingsOf = a => LST.filter(l => l.app === a.id || (a.real && l.real));
  const mainApps = () => APPS.filter(a => !a.added);
  const isWaiting = a => a.status === 'submitted';
  const isWaitingL = l => l.status === 'review';

  /* ---------- periods ---------- */
  const startOf = p => { const d = new Date(NOW); d.setHours(0, 0, 0, 0); if (p === 'week') { const k = (d.getDay() + 6) % 7; d.setDate(d.getDate() - k); } if (p === 'month') d.setDate(1); return +d; };
  const PERIODS = [['today', 'Today'], ['week', 'This week'], ['month', 'This month']];
  const pLabel = () => PERIODS.find(x => x[0] === S.period)[1].toLowerCase();
  const inP = (t, p = S.period) => t && t >= startOf(p) && t <= NOW;

  /* ---------- checks: are the documents valid? can they list this? is the listing done right? ---------- */
  const expOf = v => { const t = Date.parse(v); return isNaN(t) ? null : t; };
  function docState(x, k) {
    const f = x.docs[k], D0 = DOCS[k]; if (!D0) return null;
    const dates = D0[2].filter(z => z[2] === 'date').map(z => expOf(x.d[z[0]])).filter(Boolean), exp = dates.length ? Math.min(...dates) : null;
    const unsure = D0[2].filter(z => x.src[z[0]] === 'check').map(z => z[1]);
    const missing = D0[2].filter(z => !x.d[z[0]] && x.src[z[0]] === 'missing').map(z => z[1]);
    let tone = 'ok', note = 'Read and confirmed by the provider';
    if (!f) { tone = 'fail'; note = 'Not uploaded'; }
    else if (!f.ok || f.state !== 'read') { tone = 'warn'; note = 'Uploaded — the provider hasn’t confirmed the details'; }
    if (f && exp && exp < NOW) { tone = 'fail'; note = 'Expired ' + dateY(exp); }
    else if (f && exp && exp < NOW + S.warnDays * DAY) { tone = tone === 'fail' ? tone : 'warn'; note = 'Runs out in ' + Math.ceil((exp - NOW) / DAY) + ' days (' + dateY(exp) + ')'; }
    const cv = (S.checks[x.id] || {})[k], ok = x.status === 'verified';
    return { k, f, D: D0, exp, tone, note, unsure, missing, checked: !!cv || ok, checkedAt: typeof cv === 'number' ? cv : ok ? x.decided || null : null };
  }
  const docsOf = x => [...new Set([...x.need, ...Object.keys(x.docs)])].filter(k => DOCS[k]).map(k => docState(x, k));
  function appChecks(x) {
    const ds = docsOf(x), out = [];
    const add = (tone, t, sub = '') => out.push({ tone, t, sub });
    add(digits(x.phone).length > 8 ? 'ok' : 'fail', 'Mobile number verified', x.phone);
    add(x.email ? 'ok' : 'warn', x.email ? 'Email added' : 'No email', x.email);
    const absent = ds.filter(d => !d.f);
    add(absent.length ? 'fail' : 'ok', absent.length ? `${absent.length} required document${absent.length > 1 ? 's' : ''} missing` : `All ${ds.length} documents uploaded`, absent.map(d => d.D[0]).join(', '));
    const expd = ds.filter(d => d.f && d.exp && d.exp < NOW), soon = ds.filter(d => d.f && d.exp && d.exp >= NOW && d.exp < NOW + S.warnDays * DAY);
    add(expd.length ? 'fail' : soon.length ? 'warn' : 'ok', expd.length ? 'A document has expired' : soon.length ? `${soon.length} document${soon.length > 1 ? 's' : ''} run out within ${S.warnDays} days` : 'Every document is in date', [...expd, ...soon].map(d => d.D[0] + ' · ' + d.note).join(' — '));
    // the name on the ID should be the person on the licence / the account
    const nm = x.role === 'company' ? x.d.sigName : x.d.fullName, short = !nm || nm.trim().split(/\s+/).length < 2 || /^[A-Z]\.\s/.test(nm.trim());
    add(short ? 'warn' : 'ok', x.role === 'company' ? (short ? 'Signatory name looks shortened' : 'Signatory named on the ID') : 'Name on the ID matches the account', x.role === 'company' ? `${nm || '—'} — check this person is on the trade licence` : nm || '');
    const uns = ds.flatMap(d => d.unsure.map(u => d.D[0] + ': ' + u));
    add(uns.length ? 'warn' : 'ok', uns.length ? `${uns.length} detail${uns.length > 1 ? 's were' : ' was'} hard to read` : 'Every detail read clearly', uns.length ? 'We couldn’t read ' + (uns.length > 1 ? 'these' : 'this') + ' clearly, so the provider typed ' + (uns.length > 1 ? 'them' : 'it') + ' in — compare with the document: ' + uns.join(', ') : '');
    // categories that need their own licence
    x.cats.filter(c => GATE[c]).forEach(c => { const need = GATE[c](x), has = x.docs[need]; add(has ? 'ok' : 'warn', has ? `Licence for ${catLabel(x.v, c)} uploaded` : `${catLabel(x.v, c)} listings wait for a licence`, has ? DOCS[need][0] : `${DOCS[need][0]} — they can add it after approval; those listings stay off the site until then`); });
    const reg = ds.filter(d => d.f), done = reg.filter(d => d.checked).length;
    add(done === reg.length && reg.length ? 'ok' : 'todo', done === reg.length ? `All ${reg.length} documents checked with the issuing authority` : `Check ${reg.length - done} more document${reg.length - done > 1 ? 's' : ''} with the issuing authority`, done === reg.length ? 'Done' : `${done} of ${reg.length} done — open each one, verify it, then mark it checked`);
    return out;
  }
  const blockers = x => appChecks(x).filter(c => c.tone === 'fail' || c.tone === 'todo');
  const scoreOf = cs => Math.round(cs.filter(c => c.tone === 'ok').length / cs.length * 100);

  // what similar listings cost on UpNow, to catch a typo in the price
  const MED = {}; try { UP.LISTINGS.forEach(l => { (MED[l.cat] = MED[l.cat] || []).push(l.price); }); Object.keys(MED).forEach(k => { const a = MED[k].sort((x, y) => x - y); MED[k] = a[Math.floor(a.length / 2)]; }); } catch (e) {}
  function listingChecks(l) {
    const a = appOf(l), out = [], add = (tone, t, sub = '') => out.push({ tone, t, sub });
    if (!a) return out;
    const allCats = [...a.cats, ...APPS.filter(x => x.added && x.owner === a.owner && x.status === 'verified').flatMap(x => x.cats)];
    add(a.status === 'verified' ? 'ok' : 'fail', a.status === 'verified' ? 'Provider is approved' : 'Provider isn’t approved yet', a.status === 'verified' ? `Since ${dateS(a.decided || a.t)}` : 'The listing waits for the provider’s approval');
    add(allCats.includes(l.cat) ? 'ok' : 'fail', allCats.includes(l.cat) ? `Approved to list ${catLabel(l.v, l.cat)}` : `Not approved for ${catLabel(l.v, l.cat)}`, allCats.includes(l.cat) ? `Their approval covers: ${a.cats.map(c => catLabel(a.v, c)).join(', ')}` : `They were approved for ${a.cats.map(c => catLabel(a.v, c)).join(', ')}`);
    if (GATE[l.cat]) { const need = GATE[l.cat](a), has = a.docs[need]; add(has ? 'ok' : 'fail', has ? 'Category licence on file' : 'Category licence missing', DOCS[need][0]); }
    const min = D.minPhotos(l.v, l.cat);
    add(l.photos >= min ? 'ok' : 'fail', `${l.photos} photo${l.photos === 1 ? '' : 's'}`, l.photos >= min ? (l.photos < 6 ? 'Enough to go live — 6 or more do better' : 'Good set') : `At least ${min} needed for ${catLabel(l.v, l.cat)}`);
    const dl = (l.desc || '').trim().length;
    add(dl >= 80 ? 'ok' : 'warn', dl >= 80 ? 'Description is complete' : 'Description is very short', dl >= 80 ? dl + ' characters' : `“${(l.desc || '').slice(0, 60)}” — ask for the details customers need`);
    const m = MED[l.cat], r = m ? l.price / m : 1;
    add(!l.price ? 'fail' : r < .3 || r > 3.5 ? 'warn' : 'ok', !l.price ? 'No price' : r < .3 || r > 3.5 ? 'Price is far from similar listings' : 'Price is in line with similar listings', l.price ? `${aed(l.price)}${l.basis ? ' / ' + l.basis : ''}${m ? ` · similar listings around ${aed(m)}` : ''}` : '');
    if (LEASE.includes(l.cat)) add(/^\d{6,12}$/.test(l.permit) ? 'ok' : 'fail', /^\d{6,12}$/.test(l.permit) ? 'DLD advertising permit (Trakheesi)' : 'DLD permit number missing', l.permit ? 'Permit ' + l.permit + ' — check it on Dubai REST' : 'Every property ad in Dubai needs one');
    if (l.cat === 'holiday') add(l.permit ? 'ok' : 'fail', l.permit ? 'Holiday home permit' : 'Holiday home permit missing', l.permit || 'The DET permit for this unit');
    // the same unit from someone else: same DLD permit, or the same title in the same building
    const dup = LST.find(o => o !== l && o.app !== l.app && ((l.permit && o.permit === l.permit) || (l.building && o.building === l.building && o.title === l.title)));
    if (dup) add('warn', 'Looks like another provider’s listing', `Same title as “${dup.title}” by ${(appOf(dup) || {}).name}`);
    const man = manualL(l), T = ticksOf(l), done = man.filter(k => T[k[0]]).length;
    add(done === man.length ? 'ok' : 'todo', done === man.length ? 'All your checks done' : `Tick ${man.length - done} more of your checks`, done === man.length ? 'Done' : `${done} of ${man.length} done — ${man.map(([k]) => ({ photos: 'photos', match: 'details', permit: 'permit', clean: 'no contact details' })[k] || k).join(', ').replace(/, ([^,]*)$/, ' and $1')}`);
    return out;
  }
  // the team's own checks on a listing; a live listing passed them when it went live
  const ticksOf = l => l.status === 'live' ? Object.fromEntries(manualL(l).map(([k]) => [k, true])) : (S.lchecks[l.id] || {});
  const manualL = l => [['photos', 'Photos are real and show this ' + (l.v === 'spaces' ? 'place' : 'service')], ['match', 'Title, details and price match the photos'], ...(LEASE.includes(l.cat) ? [['permit', 'Permit matches this unit (DLD / Dubai REST)']] : []), ['clean', 'No phone numbers, links or other sites in the text or photos']];

  /* ---------- income: every approved provider pays their plan monthly, from the day they were approved ---------- */
  const hash = s => [...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);
  function invoices() {
    const out = [];
    mainApps().filter(a => a.status === 'verified').forEach(a => {
      const p = PLAN(a.plan || 'launch'); if (!p.p) return;
      for (let t = a.decided || a.t, k = 0; t <= NOW; t += 30 * DAY, k++) {
        const id = a.id + '-' + k, age = NOW - t, late = Math.abs(hash(a.id)) % 6 === 0 && age < 30 * DAY;
        const paid = S.paid[id] || (!a.real && !late && age > 3 * DAY) ? (S.paid[id] || t + (Math.abs(hash(id)) % 3 + 1) * DAY) : 0;
        out.push({ id, a, plan: p, amt: p.p, t, due: t + 7 * DAY, paid, state: paid ? 'paid' : NOW > t + 7 * DAY ? 'overdue' : 'due' });
      }
    });
    return out.sort((x, y) => y.t - x.t);
  }
  const mrr = () => mainApps().filter(a => a.status === 'verified').reduce((s, a) => s + PLAN(a.plan || 'launch').p, 0);

  /* ---------- toast / modal / drawer ---------- */
  function toast(msg) { const t = $('#toast'); t.innerHTML = ico('check') + esc(msg); t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 2600); }
  function modal(html, cls = '') { const s = $('#scrim'); s.innerHTML = `<div class="modal ${cls}">${html}</div>`; s.classList.add('on'); }
  function closeModal() { $('#scrim').classList.remove('on'); }
  let drawerFor = null;
  // every side panel can open wide — filling the dashboard next to the sidebar — and remembers it (S.big)
  const EXP = { big: '<path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/>', small: '<path d="M4 14h6v6M20 10h-6V4M10 14l-7 7M14 10l7-7"/>' };
  const bigBtn = () => `<button type="button" class="ad-big-btn" data-act="bigDrawer" title="${S.big ? 'Back to side panel' : 'Open wide'}" aria-label="${S.big ? 'Back to side panel' : 'Open wide'}"><svg class="ico" viewBox="0 0 24 24">${S.big ? EXP.small : EXP.big}</svg><span>${S.big ? 'Side panel' : 'Open wide'}</span></button>`;
  function drawer(html, key) { drawerFor = key; const d = $('#drawer'); d.className = 'drawer wide ad-drawer on' + (S.big ? ' ad-big' : ''); d.innerHTML = html; const x = $('[data-act="close"]', d); if (x) x.insertAdjacentHTML('beforebegin', bigBtn()); $('#dscrim').classList.add('on'); thumbs(d); }
  function closeDrawer() { drawerFor = null; $('#drawer').classList.remove('on'); $('#dscrim').classList.remove('on'); }

  /* ---------- small graphics ---------- */
  const ring = (pct, label, sub, size = 132) => { const C = 339.3; return `<div class="ad-ring" style="width:${size}px;height:${size}px"><svg viewBox="0 0 120 120"><defs><linearGradient id="ad-grad" x1="0" x2="1"><stop offset="0" stop-color="#047246"/><stop offset="1" stop-color="#25946a"/></linearGradient></defs><circle class="bg" cx="60" cy="60" r="54"/><circle class="fg" cx="60" cy="60" r="54" style="--off:${(C * (1 - pct / 100)).toFixed(1)}"/></svg><div><b data-count="${pct}">${pct}</b><small>${label}</small>${sub ? `<em>${sub}</em>` : ''}</div></div>`; };
  const mini = (pct, tone = '') => { const C = 113.1; return `<span class="ad-mini ${tone}"><svg viewBox="0 0 44 44"><circle class="bg" cx="22" cy="22" r="18"/><circle class="fg" cx="22" cy="22" r="18" style="--off:${(C * (1 - pct / 100)).toFixed(1)}"/></svg><b>${pct}</b></span>`; };
  const spark = (a, c = 'var(--g6)') => { const mx = Math.max(...a, 1), w = 100, h = 30; const pts = a.map((v, i) => [i * (w / Math.max(1, a.length - 1)), h - 3 - (v / mx) * (h - 6)]); const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(''); return `<svg class="spk" viewBox="0 0 100 30" preserveAspectRatio="none"><path d="${d} L100 30 L0 30Z" fill="${c}" opacity=".1"/><path class="ad-spk" d="${d}" fill="none" stroke="${c}" stroke-width="1.8" vector-effect="non-scaling-stroke"/></svg>`; };
  // bars per day with a second series as dots on a line
  function dayChart(days, A, B, la, lb) {
    const mx = Math.max(...A, ...B, 1), W = 600, H = 250, bw = W / days.length, bar = bw * .4;
    const y = v => H - 18 - v / mx * (H - 34);
    // 7-day average of requests: the trend without the day-to-day spikes
    const avg = A.map((_, i) => { const w = A.slice(Math.max(0, i - 6), i + 1); return w.reduce((s, v) => s + v, 0) / w.length; });
    const pts = avg.map((v, i) => [i * bw + bw / 2, y(v)]);
    const curve = pts.map((p, i) => { if (!i) return `M${p[0].toFixed(1)} ${p[1].toFixed(1)}`; const q = pts[i - 1], cx = (q[0] + p[0]) / 2; return `C${cx.toFixed(1)} ${q[1].toFixed(1)} ${cx.toFixed(1)} ${p[1].toFixed(1)} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`; }).join('');
    return `<div class="ad-chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(la)} and ${esc(lb)} per day">
      ${[0.25, .5, .75, 1].map(f => `<line x1="0" x2="${W}" y1="${y(mx * f)}" y2="${y(mx * f)}" class="gl"/>`).join('')}
      ${A.map((v, i) => `<g class="day" style="--i:${i}"><rect class="hit" x="${i * bw}" y="0" width="${bw}" height="${H - 18}"/>${v ? `<rect class="bar" x="${i * bw + bw / 2 - bar - .5}" width="${bar}" y="${y(v)}" height="${H - 18 - y(v)}" rx="2.5"/>` : ''}${B[i] ? `<rect class="bar b" x="${i * bw + bw / 2 + .5}" width="${bar}" y="${y(B[i])}" height="${H - 18 - y(B[i])}" rx="2.5"/>` : ''}<title>${esc(days[i])}: ${v} ${esc(la.toLowerCase())}, ${B[i]} ${esc(lb.toLowerCase())}</title></g>`).join('')}
      <path class="avg ad-draw" d="${curve}" pathLength="1"/>
      ${days.map((d, i) => i % Math.ceil(days.length / 6) === 0 || i === days.length - 1 ? `<text x="${i * bw + bw / 2}" y="${H - 3}" text-anchor="middle">${esc(d)}</text>` : '').join('')}
      </svg><div class="ad-legend"><span><i class="sq"></i>${esc(la)}</span><span><i class="sq b"></i>${esc(lb)}</span><span><i class="dt"></i>7-day average</span><span class="sp"></span><span>Busiest day: <b>${Math.max(...A)}</b></span></div></div>`;
  }
  const hbars = rows => { const mx = Math.max(...rows.map(r => r.v), 1); return `<div class="ad-hb">${rows.map((r, i) => `<div class="r" ${r.go ? `data-go="${r.go}"` : ''}><span>${r.ico ? ico(r.ico) : ''}${esc(r.l)}</span><i style="--w:${Math.max(2, r.v / mx * 100)}%;--c:${r.c || 'var(--g6)'};--i:${i}"></i><b>${r.f ? r.f(r.v) : r.v}</b>${r.sub ? `<em>${r.sub}</em>` : ''}</div>`).join('')}</div>`; };
  function donut(parts, center, sub) {
    const tot = parts.reduce((s, p) => s + p.v, 0) || 1, C = 2 * Math.PI * 46; let acc = 0;
    return `<div class="ad-donut"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="46" class="bg"/>${parts.map((p, i) => { const len = p.v / tot * C, s = `<circle cx="60" cy="60" r="46" stroke="${p.c}" style="--len:${len.toFixed(2)};--gap:${(C - len).toFixed(2)};--off:${(-acc).toFixed(2)};--i:${i}" class="seg"/>`; acc += len; return s; }).join('')}</svg>
      <div class="ctr"><b>${center}</b><small>${sub}</small></div></div>`;
  }
  // numbers count up when a page opens
  function countUp(root) { if (calm) return; $$('[data-count]', root).forEach(el => { const to = +el.dataset.count, pre = el.dataset.pre || '', t0 = performance.now(); if (!to) return; const f = now => { const k = Math.min(1, (now - t0) / 900), e = 1 - Math.pow(1 - k, 3); el.textContent = pre + Math.round(to * e).toLocaleString('en-US'); if (k < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); }); }

  /* ---------- shell ---------- */
  const NAV = () => [['index', 'Overview', 'grid'], ['applications', 'Provider requests', 'users', mainApps().filter(isWaiting).length + APPS.filter(a => a.added && isWaiting(a)).length, 1],
    ['listings', 'Listing requests', 'layers', LST.filter(isWaitingL).length, 1], ['providers', 'Providers', 'shield', provAlerts() || ''], ['income', 'Income', 'coin'], ['settings', 'Settings', 'gear']];
  const provAlerts = () => mainApps().filter(a => a.status === 'verified' && docsOf(a).some(d => d.f && d.exp && d.exp < NOW + S.warnDays * DAY)).length;
  const PAGE = window.ADM_START || 'index';
  const go = p => { location.href = p + '.html'; };
  function shell() {
    const s = session();
    $('#sb').innerHTML = `<a class="logo" href="index.html"><b>U</b><span>UpNow</span><small class="pro ad-pro">Admin</small></a>
      <div class="biz"><span class="av">UT</span><div><b>UpNow team</b><small>Admin</small></div></div>
      <nav class="osbox" aria-label="Admin">${NAV().map(([id, l, i, n, red]) => (id === 'settings' ? '<hr class="nv-rule">' : '') + `<a class="ni os ${PAGE === id || ({ provider: (APPS.find(x => x.id === new URLSearchParams(location.search).get('id')) || {}).status === 'verified' ? 'providers' : 'applications', listing: 'listings' })[PAGE] === id ? 'on' : ''}" href="${id}.html">${ico(i)}<span>${esc(l)}</span>${n ? `<em class="n ${red ? 'r' : ''}" style="font-style:normal">${n}</em>` : ''}</a>`).join('')}</nav>
      <a class="explore" href="../../index.html">${ico('compass')}<span>Customer site</span></a>
      <div class="sp"></div>
      <button class="ad-out" type="button" data-act="signout">${ico('out')}<span>Sign out</span></button>`;
    const w = mainApps().filter(isWaiting), late = [...w, ...LST.filter(isWaitingL)].filter(x => NOW - x.t > S.sla * 36e5);
    $('#top').innerHTML = `<label class="srch">${ico('search')}<input id="gsearch" placeholder="Search providers, listings, licence numbers…" autocomplete="off"></label><span class="sp"></span>
      <span class="live hide-s">Review target · ${S.sla} hours</span>
      <label class="tsel"><select id="adCur" aria-label="Currency">${Object.keys(CURS).map(k => `<option value="${k}" ${k === CUR ? 'selected' : ''}>${CURS[k][2]} ${k}</option>`).join('')}</select>${ico('chev')}</label>
      <label class="tsel g"><select id="adLang" aria-label="Language">${((window.SITE && SITE.languages) || [['en', 'EN']]).map(([k]) => `<option value="${k}" ${k === LANG ? 'selected' : ''}>${k === 'ar' ? 'العربية' : 'English'}</option>`).join('')}</select>${ico('chev')}</label>
      ${late.length ? `<a class="ad-late" href="${late[0].app ? 'listings' : 'applications'}.html">${ico('clock')}${late.length} past ${S.sla}h</a>` : ''}
      <a class="ib" href="applications.html" title="Waiting for review">${ico('bell')}${w.length ? '<i></i>' : ''}</a>`;
    $('#adCur').onchange = e => setPref('cur', e.target.value);
    $('#adLang').onchange = e => setPref('lang', e.target.value);
    $('#gsearch').onkeydown = e => {
      if (e.key !== 'Enter') return; const q = e.target.value.trim().toLowerCase(); if (!q) return;
      const a = APPS.find(x => [x.name, x.d.display, x.d.licence, x.d.eidNo, x.d.brnNo, x.d.ornNo, x.email, x.phone].filter(Boolean).join(' ').toLowerCase().includes(q));
      if (a) return openApp(a.id);
      const l = LST.find(x => [x.title, x.permit, x.id].join(' ').toLowerCase().includes(q)); if (l) return openListing(l.id);
      toast('Nothing matches “' + e.target.value + '”');
    };
  }
  const fmtAdm = p => String(p).replace(/^(\d{2})(\d{3})(\d{4})$/, '$1 $2 $3');

  /* ---------- page head + period ---------- */
  const periodSeg = () => `<div class="seg">${PERIODS.map(([k, l]) => `<button class="${S.period === k ? 'on' : ''}" data-act="period" data-arg="${k}">${l}</button>`).join('')}</div>`;
  const head = (h, p, acts = '') => `<div class="ph ad-ph"><div><h1>${h}</h1><p>${p}</p></div><span class="sp"></span><div class="acts">${acts}</div></div>`;
  const greet = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };
  const today = new Date(NOW).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  // little pictures for the attention cards: a person's ID, a listing, a document, an invoice — each with what it waits on
  const ART = {
    users: `<svg viewBox="0 0 80 56" aria-hidden="true"><rect x="6" y="8" width="56" height="38" rx="7" fill="#fff" stroke="#d8efe3" stroke-width="2"/><circle cx="22" cy="24" r="7" fill="#d8efe3"/><path d="M12 38c2-6 6-8 10-8s8 2 10 8" fill="#d8efe3"/><rect x="36" y="18" width="18" height="4" rx="2" fill="#136142"/><rect x="36" y="26" width="13" height="3" rx="1.5" fill="#bfd9cb"/><rect x="36" y="32" width="16" height="3" rx="1.5" fill="#bfd9cb"/><g class="b"><circle cx="64" cy="40" r="11" fill="#e0a526"/><path class="hand" d="M64 34v6.5" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><circle cx="64" cy="40.5" r="1.4" fill="#fff"/></g></svg>`,
    layers: `<svg viewBox="0 0 80 56" aria-hidden="true"><rect x="8" y="6" width="50" height="42" rx="7" fill="#fff" stroke="#d8efe3" stroke-width="2"/><rect x="13" y="11" width="40" height="18" rx="4" fill="#d8efe3"/><path d="m13 27 11-9 8 6 6-4 15 9v0H13z" fill="#2f8f63"/><rect x="13" y="34" width="26" height="4" rx="2" fill="#136142"/><rect x="13" y="41" width="17" height="3" rx="1.5" fill="#bfd9cb"/><g class="b scan"><circle cx="62" cy="38" r="9" fill="#fff" fill-opacity=".6" stroke="#e0a526" stroke-width="3"/><path d="m68.5 44.5 6 6" stroke="#e0a526" stroke-width="3.4" stroke-linecap="round"/></g></svg>`,
    doc: `<svg viewBox="0 0 80 56" aria-hidden="true"><path d="M14 6h28l12 12v32a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V10a4 4 0 0 1 4-4z" fill="#fff" stroke="#d8efe3" stroke-width="2"/><path d="M42 6v10a2 2 0 0 0 2 2h10" fill="#eef7f2" stroke="#d8efe3" stroke-width="2"/><rect x="17" y="22" width="22" height="4" rx="2" fill="#136142"/><rect x="17" y="30" width="28" height="3" rx="1.5" fill="#bfd9cb"/><rect x="17" y="36" width="20" height="3" rx="1.5" fill="#bfd9cb"/><g class="b cal"><rect x="50" y="28" width="24" height="22" rx="5" fill="#e0a526"/><rect x="50" y="28" width="24" height="7" rx="3" fill="#c98a12"/><rect x="55" y="39" width="5" height="4" rx="1" fill="#fff"/><rect x="63" y="39" width="5" height="4" rx="1" fill="#fff" opacity=".6"/></g></svg>`,
    coin: `<svg viewBox="0 0 80 56" aria-hidden="true"><path d="M10 6h40v44l-5-3-5 3-5-3-5 3-5-3-5 3-5-3-5 3z" fill="#fff" stroke="#d8efe3" stroke-width="2" stroke-linejoin="round"/><rect x="16" y="14" width="20" height="4" rx="2" fill="#136142"/><rect x="16" y="23" width="28" height="3" rx="1.5" fill="#bfd9cb"/><rect x="16" y="29" width="22" height="3" rx="1.5" fill="#bfd9cb"/><rect x="30" y="36" width="14" height="4" rx="2" fill="#c2413b"/><g class="b coin"><circle cx="62" cy="36" r="12" fill="#c2413b"/><circle cx="62" cy="36" r="8" fill="none" stroke="#fff" stroke-width="1.6" opacity=".6"/><path d="M62 30v12M59 33h4.5a2 2 0 0 1 0 4H60a2 2 0 0 0 0 4h5" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></g></svg>`
  };

  /* ================= OVERVIEW ================= */
  const pages = {};
  pages.index = () => {
    const A = mainApps(), W = APPS.filter(isWaiting), WL = LST.filter(isWaitingL), inv = invoices();
    const came = APPS.filter(a => inP(a.t)), appr = APPS.filter(a => a.status === 'verified' && inP(a.decided)), back = APPS.filter(a => ['changes', 'rejected'].includes(a.status) && inP(a.decided));
    const live = LST.filter(l => l.status === 'live' && inP(l.decided)), lc = LST.filter(l => inP(l.t) && l.status !== 'verify' && l.status !== 'licence');
    const coll = inv.filter(i => i.paid && inP(i.paid)).reduce((s, i) => s + i.amt, 0);
    const decided = [...APPS, ...LST].filter(x => x.decided && inP(x.decided, 'month')), onTime = decided.length ? Math.round(decided.filter(x => x.decided - x.t <= S.sla * 36e5).length / decided.length * 100) : 100;
    const late = [...W, ...WL].filter(x => NOW - x.t > S.sla * 36e5);
    const expiring = A.filter(a => a.status === 'verified').flatMap(a => docsOf(a).filter(d => d.f && d.exp && d.exp < NOW + 30 * DAY).map(d => ({ a, d })));
    // 30 days: requests in vs approvals
    const days = [...Array(30)].map((_, i) => { const d = new Date(NOW - (29 - i) * DAY); d.setHours(0, 0, 0, 0); return +d; });
    const perDay = (arr, f) => days.map(d => arr.filter(x => { const t = f(x); return t >= d && t < d + DAY; }).length);
    const reqD = perDay(APPS, x => x.t), apprD = perDay(APPS.filter(a => a.status === 'verified'), x => x.decided);
    // this week against last (the last two points of the card's 8-week line): a count as +n, money as a percentage
    const delta = (sp, money) => { const a = sp[sp.length - 2] || 0, b = sp[sp.length - 1] || 0, d = b - a; if (!a && !b) return '';
      const txt = money ? (a ? Math.round(Math.abs(d) / a * 100) + '%' : 'new') : Math.abs(d); return `<em class="ad-delta ${d > 0 ? 'up' : d < 0 ? 'down' : ''}" title="${d ? (d > 0 ? 'Up ' : 'Down ') + txt : 'Same as'} ${d ? 'on' : ''} last week">${d ? ico(d > 0 ? 'up' : 'down') : ''}${d ? txt : '='}<small class="ad-delta-l">vs last week</small></em>`; };
    const sparkEnd = sp => { const mx = Math.max(...sp, 1); return (30 - 3 - (sp[sp.length - 1] / mx) * 24).toFixed(1); };
    const kpi = (l, v, sub, sp, go, pre = '') => `<a class="kpi ad-kpi" href="${go}.html"><small>${l}</small><span class="ad-kpi-v"><b data-count="${v}" data-pre="${pre}">${pre}${v.toLocaleString('en-US')}</b>${delta(sp, !!pre)}</span><span class="d">${sub}</span><span class="ad-spk">${spark(sp)}<i class="ad-spk-dot" style="--y:${sparkEnd(sp)}px"></i></span></a>`;
    const wk = n => [...Array(8)].map((_, i) => n(NOW - (7 - i) * 7 * DAY, NOW - (6 - i) * 7 * DAY));
    const next = [...W.map(a => ({ k: 'a', x: a, t: a.t })), ...WL.map(l => ({ k: 'l', x: l, t: l.t }))].sort((a, b) => a.t - b.t).slice(0, 5);
    const log = recent().slice(0, 6);
    const byV = Object.keys(VL).map(v => ({ v, req: came.filter(a => a.v === v).length, ok: appr.filter(a => a.v === v).length, live: LST.filter(l => l.v === v && l.status === 'live').length, w: W.filter(a => a.v === v).length + WL.filter(l => l.v === v).length }));
    const pl = (n, one, many) => `${n} ${n === 1 ? one : many}`;
    // parts: [[count, tone, label]] — what the number is made of, as one bar
    const split = parts => { const tot = parts.reduce((s, p) => s + p[0], 0); return tot ? `<span class="ad-split" title="${esc(parts.map(p => p[0] + ' ' + p[2]).join(' · '))}">${parts.filter(p => p[0]).map((p, i) => `<i class="${p[1]}" style="--w:${(p[0] / tot * 100).toFixed(1)}%;--i:${i}"></i>`).join('')}</span>` : '<span class="ad-split none"></span>'; };
    const card = (href, l, v, sub, icon, tone = '', parts) => `<a class="kpi ad-now ${tone}" href="${href}"><span class="ad-now-art">${ART[icon] || ico(icon)}</span><small>${l}</small><b data-count="${v}">${v}</b><span class="d">${sub}</span>${parts ? split(parts) : ''}</a>`;
    // last 30 days of decisions: how many were approvals, and how long a decision takes
    const d30 = APPS.filter(x => x.decided && x.decided > NOW - 30 * DAY), apRate = d30.length ? Math.round(d30.filter(x => x.status === 'verified').length / d30.length * 100) + '%' : '—';
    const avgDec = d30.length ? dur(d30.reduce((s, x) => s + x.decided - x.t, 0) / d30.length) : '—';
    return `<section class="ad-hero">
      <div class="ad-h-main">
        <span class="ad-eyebrow"><span class="ad-pdot"></span>${esc(today)}</span>
        <h1>${greet()}</h1>
        <p>${W.length + WL.length ? `<b>${pl(W.length + WL.length, 'request is', 'requests are')} waiting</b>${late.length ? ` — <span class="ad-hot">${late.length} past ${S.sla} hours</span>` : ' — all on time'}` : 'Nothing is waiting.'}</p>
        <div class="ad-hero-acts"><a class="btn btn-g" href="applications.html">${ico('users')}Review providers<em class="ad-cnt">${W.length}</em></a><a class="btn btn-o" href="listings.html">${ico('layers')}Review listings<em class="ad-cnt o">${WL.length}</em></a></div>
        <svg class="ad-h-art" viewBox="0 0 260 150" aria-hidden="true">
          <g class="qc c3"><rect x="30" y="96" width="180" height="40" rx="11" fill="#fff" stroke="#bfe3cf" stroke-width="2"/>
            <circle cx="52" cy="116" r="10" fill="#c7d8f0"/><circle cx="52" cy="112.5" r="3.2" fill="#fff" opacity=".9"/><path d="M46.5 121.5c1.5-3.6 3.6-5 5.5-5s4 1.4 5.5 5" fill="#fff" opacity=".9"/>
            <rect x="72" y="104" width="62" height="6" rx="3" fill="#136142"/><rect x="72" y="113" width="40" height="4" rx="2" fill="#bfd9cb"/>
            <rect x="72" y="123" width="90" height="3" rx="1.5" fill="#e6f2ec"/><path class="bar" d="M72 124.5h90" stroke="#25946a" stroke-width="3" stroke-linecap="round" pathLength="1"/>
            <g class="clk"><circle cx="190" cy="116" r="12" fill="#f5c26b"/><g class="hd"><circle cx="190" cy="116" r="7" fill="none"/><path d="M190 116v-6" stroke="#5a3a06" stroke-width="2.2" stroke-linecap="round"/></g><path d="M190 116h4" stroke="#5a3a06" stroke-width="2.2" stroke-linecap="round"/></g>
            <g class="ok"><circle cx="190" cy="116" r="12" fill="#25946a"/><path d="m184.5 116 3.8 3.8 7.2-7.4" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></g></g>
          <g class="qc c2"><rect x="30" y="96" width="180" height="40" rx="11" fill="#fff" stroke="#bfe3cf" stroke-width="2"/>
            <circle cx="52" cy="116" r="10" fill="#f3d9b5"/><circle cx="52" cy="112.5" r="3.2" fill="#fff" opacity=".9"/><path d="M46.5 121.5c1.5-3.6 3.6-5 5.5-5s4 1.4 5.5 5" fill="#fff" opacity=".9"/>
            <rect x="72" y="104" width="80" height="6" rx="3" fill="#136142"/><rect x="72" y="113" width="52" height="4" rx="2" fill="#bfd9cb"/>
            <rect x="72" y="123" width="90" height="3" rx="1.5" fill="#e6f2ec"/><path class="bar" d="M72 124.5h90" stroke="#25946a" stroke-width="3" stroke-linecap="round" pathLength="1"/>
            <g class="clk"><circle cx="190" cy="116" r="12" fill="#f5c26b"/><g class="hd"><circle cx="190" cy="116" r="7" fill="none"/><path d="M190 116v-6" stroke="#5a3a06" stroke-width="2.2" stroke-linecap="round"/></g><path d="M190 116h4" stroke="#5a3a06" stroke-width="2.2" stroke-linecap="round"/></g>
            <g class="ok"><circle cx="190" cy="116" r="12" fill="#25946a"/><path d="m184.5 116 3.8 3.8 7.2-7.4" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></g></g>
          <g class="qc c1"><rect x="30" y="96" width="180" height="40" rx="11" fill="#fff" stroke="#bfe3cf" stroke-width="2"/>
            <circle cx="52" cy="116" r="10" fill="#9fd5b8"/><circle cx="52" cy="112.5" r="3.2" fill="#fff" opacity=".9"/><path d="M46.5 121.5c1.5-3.6 3.6-5 5.5-5s4 1.4 5.5 5" fill="#fff" opacity=".9"/>
            <rect x="72" y="104" width="70" height="6" rx="3" fill="#136142"/><rect x="72" y="113" width="46" height="4" rx="2" fill="#bfd9cb"/>
            <rect x="72" y="123" width="90" height="3" rx="1.5" fill="#e6f2ec"/><path class="bar" d="M72 124.5h90" stroke="#25946a" stroke-width="3" stroke-linecap="round" pathLength="1"/>
            <g class="clk"><circle cx="190" cy="116" r="12" fill="#f5c26b"/><g class="hd"><circle cx="190" cy="116" r="7" fill="none"/><path d="M190 116v-6" stroke="#5a3a06" stroke-width="2.2" stroke-linecap="round"/></g><path d="M190 116h4" stroke="#5a3a06" stroke-width="2.2" stroke-linecap="round"/></g>
            <g class="ok"><circle cx="190" cy="116" r="12" fill="#25946a"/><path d="m184.5 116 3.8 3.8 7.2-7.4" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></g></g>
        </svg>
      </div>
      <div class="ad-h-side">${ring(onTime, 'on time', 'within ' + S.sla + 'h', 116)}
        <dl><div><dt>Approval rate</dt><dd>${apRate}</dd></div><div><dt>Average decision</dt><dd>${avgDec}</dd></div></dl></div>
    </section>
    <div class="g4 ad-nowrow">
      ${card('applications.html', 'Providers waiting', W.length, W.filter(a => NOW - a.t > S.sla * 36e5).length ? `<em class="ad-red-t">${W.filter(a => NOW - a.t > S.sla * 36e5).length} past ${S.sla}h</em> · oldest ${ago(Math.min(...W.map(a => a.t)))}` : W.length ? 'All on time' : 'Nothing to review', 'users', W.length ? 'amber' : '', [[W.filter(a => NOW - a.t <= S.sla * 36e5).length, 'ok', 'on time'], [W.filter(a => NOW - a.t > S.sla * 36e5).length, 'late', 'past ' + S.sla + 'h']])}
      ${card('listings.html', 'Listings waiting', WL.length, `plus ${LST.filter(l => ['verify', 'licence'].includes(l.status)).length} waiting on the provider’s approval or licence`, 'layers', WL.length ? 'amber' : '', [[WL.length, 'warn', 'waiting on the team'], [LST.filter(l => ['verify', 'licence'].includes(l.status)).length, 'mute', 'waiting on the provider']])}
      ${card('providers.html?tab=docs', 'Documents running out', expiring.length, `within 30 days · ${A.filter(a => a.status === 'verified' && docsOf(a).some(d => d.exp && d.exp < NOW)).length} expired`, 'doc', expiring.length ? 'amber' : '', [[expiring.filter(x => x.d.exp >= NOW).length, 'warn', 'running out'], [expiring.filter(x => x.d.exp < NOW).length, 'late', 'expired']])}
      ${card('income.html', 'Payments overdue', inv.filter(i => i.state === 'overdue').length, `${aed(inv.filter(i => i.state === 'overdue').reduce((s, i) => s + i.amt, 0))} to collect`, 'coin', inv.filter(i => i.state === 'overdue').length ? 'red' : '', [[inv.filter(i => i.state === 'overdue').length, 'late', 'overdue'], [inv.filter(i => i.state === 'due').length, 'mute', 'due, not late yet']])}
    </div>
    <div class="ad-bar"><h2>How UpNow is doing ${esc(pLabel())}</h2><span class="sp"></span>${periodSeg()}</div>
    <div class="g4 ad-kpis">
      ${kpi('Provider requests', came.length, (n => n ? `${n} from existing providers adding a business type` : 'All from new providers')(APPS.filter(a => inP(a.t) && a.added).length), wk((a, b) => APPS.filter(x => x.t >= a && x.t < b).length), 'applications')}
      ${kpi('Providers approved', appr.length, `${back.length} sent back or rejected · ${came.length ? Math.round(appr.length / Math.max(1, appr.length + back.length) * 100) : 0}% approval rate`, wk((a, b) => APPS.filter(x => x.status === 'verified' && x.decided >= a && x.decided < b).length), 'providers')}
      ${kpi('Listings gone live', live.length, `out of ${lc.length} sent for review`, wk((a, b) => LST.filter(x => x.status === 'live' && x.decided >= a && x.decided < b).length), 'listings')}
      ${kpi('Income collected', coll, `${aed(mrr())} a month from plans`, wk((a, b) => inv.filter(i => i.paid >= a && i.paid < b).reduce((s, i) => s + i.amt, 0)), 'income', 'AED ')}
    </div>
    <div class="gd mt">
      <section class="pn"><div class="pn-h"><h2>Requests in, approvals out</h2><span class="sub">Last 30 days</span><span class="sp"></span><a href="applications.html?tab=all">All requests ${ico('chevR')}</a></div>
        ${dayChart(days.map(d => dateS(d)), reqD, apprD, 'Provider requests', 'Approved')}
        <div class="ad-sum">${[['Requests', reqD.reduce((a, b) => a + b, 0)], ['Approved', apprD.reduce((a, b) => a + b, 0)], ['Approval rate', (() => { const d = APPS.filter(x => x.decided && x.decided > NOW - 30 * DAY); return d.length ? Math.round(d.filter(x => x.status === 'verified').length / d.length * 100) + '%' : '—'; })()], ['Average time to decide', (() => { const d = APPS.filter(x => x.decided && x.decided > NOW - 30 * DAY); return d.length ? dur(d.reduce((s, x) => s + x.decided - x.t, 0) / d.length) : '—'; })()]].map(([l, v]) => `<div><small>${l}</small><b>${v}</b></div>`).join('')}</div></section>
      <section class="pn"><div class="pn-h"><h2>Review next</h2><span class="sub">Oldest first</span></div>
        ${next.length ? `<div class="ad-q">${next.map(({ k, x }) => { const over = NOW - x.t > S.sla * 36e5, a = k === 'a' ? x : appOf(x); return `<div class="ar" data-act="${k === 'a' ? 'openApp' : 'openListing'}" data-arg="${x.id}">${k === 'a' ? av(x.name) : `<img class="ad-th" src="${esc(x.img[0])}" alt="">`}<div class="bd"><b>${esc(k === 'a' ? x.name : x.title)}${x.real ? ' <span class="ad-real">This browser</span>' : ''}</b><small>${k === 'a' ? `Wants to join · ${esc(VL[x.v])} · ${esc(TYPE_L[x.type] || x.type)}` : `Listing · ${esc(a ? a.name : '')} · ${esc(catLabel(x.v, x.cat))}`}</small><span class="ad-slab ${over ? 'late' : ''}" title="${over ? 'Past' : 'Within'} the ${S.sla}-hour target"><i style="--w:${Math.min(100, (NOW - x.t) / (S.sla * 36e5) * 100).toFixed(0)}%"></i></span></div><span class="ad-sla ${over ? 'late' : ''}">${ico('clock')}${ago(x.t)}</span></div>`; }).join('')}</div>`
          : `<div class="ad-empty">${ico('check')}<b>All caught up</b><small>New requests appear here the moment a provider sends them.</small></div>`}
      </section>
    </div>
    <div class="gd mt">
      <section class="pn"><div class="pn-h"><h2>By vertical</h2><span class="sub">${esc(pLabel())} · requests and approvals</span></div>
        <div class="ad-vt"><div class="r h"><span>Vertical</span><span>Requests</span><span>Approved</span><span>Waiting</span><span>Live listings</span></div>
        ${byV.map((r, i) => `<div class="r" style="--i:${i}"><span><i style="background:${VC[r.v]}">${ico(VI[r.v])}</i>${esc(VL[r.v])}</span><span><u style="--w:${Math.round(r.req / Math.max(1, ...byV.map(x => x.req)) * 100)}%;--c:${VC[r.v]}"></u>${r.req}</span><span>${r.ok}</span><span>${r.w ? `<b class="ad-w">${r.w}</b>` : '—'}</span><span>${r.live}</span></div>`).join('')}</div></section>
      <section class="pn"><div class="pn-h"><h2>Latest decisions</h2><span class="sub">Who was approved or sent back</span></div>
        <div class="ad-tl">${log.map(x => `<div class="ar" data-act="${x.l ? 'openListing' : 'openApp'}" data-arg="${x.id}"><span class="ad-dot ${x.tone}">${ico(x.tone === 'ok' ? 'check' : x.tone === 'risk' ? 'x' : 'edit')}</span><div class="bd"><b>${esc(x.title)}</b><small>${esc(x.sub)}</small></div><span class="hint">${ago(x.t)}</span></div>`).join('') || '<div class="ad-empty"><small>No decisions yet.</small></div>'}</div>
      </section>
    </div>`;
  };
  function recent() {
    const a = APPS.filter(x => x.decided).map(x => ({ id: x.id, t: x.decided, tone: x.status === 'verified' ? 'ok' : x.status === 'rejected' ? 'risk' : 'warn', title: `${x.name} — ${x.status === 'verified' ? 'approved' : x.status === 'rejected' ? 'rejected' : 'asked for changes'}`, sub: `${VL[x.v]} · ${x.status === 'verified' ? 'Plan: ' + PLAN(x.plan || 'launch').n : x.reason}` }));
    const l = LST.filter(x => x.decided).map(x => ({ id: x.id, l: 1, t: x.decided, tone: x.status === 'live' ? 'ok' : x.status === 'rejected' ? 'risk' : 'warn', title: `${x.title} — ${x.status === 'live' ? 'went live' : x.status === 'rejected' ? 'not approved' : 'changes requested'}`, sub: `${(appOf(x) || {}).name || ''}${x.reason ? ' · ' + x.reason : ''}` }));
    return [...a, ...l].filter(x => x.t <= NOW + 6e4).sort((x, y) => y.t - x.t);
  }

  /* ================= PROVIDER REQUESTS ================= */
  const APP_ST = { submitted: ['Waiting', 'warn'], changes: ['Changes asked', 'info'], verified: ['Approved', ''], rejected: ['Rejected', 'risk'] };
  const vChips = (list, key) => `<div class="ad-vchips"><button class="chip ${S.vf === 'all' ? 'on' : ''}" data-act="vf" data-arg="all">All verticals <span class="c">${list.length}</span></button>${Object.keys(VL).map(v => { const n = list.filter(x => x.v === v).length; return n ? `<button class="chip ${S.vf === v ? 'on' : ''}" data-act="vf" data-arg="${v}">${ico(VI[v])}${VL[v]} <span class="c">${n}</span></button>` : ''; }).join('')}</div>`;
  pages.applications = () => {
    const tabs = [['waiting', 'Waiting', a => a.status === 'submitted'], ['changes', 'Changes asked', a => a.status === 'changes'], ['approved', 'Approved', a => a.status === 'verified'], ['rejected', 'Rejected', a => a.status === 'rejected'], ['all', 'All', () => true]];
    const tab = tabs.find(t => t[0] === S.appTab) || tabs[0], inTab = APPS.filter(tab[2]).sort((a, b) => tab[0] === 'waiting' ? a.t - b.t : (b.decided || b.t) - (a.decided || a.t));
    const list = inTab.filter(a => S.vf === 'all' || a.v === S.vf).filter(a => !S.q || [a.name, a.d.display, a.type, a.email].join(' ').toLowerCase().includes(S.q));
    const W = APPS.filter(isWaiting);
    return `${head('Provider requests', `Providers asking to join UpNow. Check their documents and what they want to list, then approve or send it back — they hear from us on WhatsApp.`)}
    <div class="ad-mini-stats">
      <div><small>Waiting</small><b data-count="${W.length}">${W.length}</b><span>${W.filter(a => NOW - a.t > S.sla * 36e5).length} past ${S.sla}h</span></div>
      <div><small>Ready to approve</small><b data-count="${W.filter(a => !appChecks(a).some(c => c.tone === 'fail')).length}">${W.filter(a => !appChecks(a).some(c => c.tone === 'fail')).length}</b><span>nothing failed · only your checks left</span></div>
      <div><small>Need a closer look</small><b data-count="${W.filter(a => appChecks(a).some(c => c.tone === 'fail')).length}">${W.filter(a => appChecks(a).some(c => c.tone === 'fail')).length}</b><span>missing or expired documents</span></div>
      <div><small>Average time to decide</small><b>${(() => { const d = APPS.filter(a => a.decided && inP(a.decided, 'month')); return d.length ? dur(d.reduce((s, a) => s + a.decided - a.t, 0) / d.length) : '—'; })()}</b><span>this month</span></div>
    </div>
    <div class="tabs">${tabs.map(([k, l, f]) => `<button class="${S.appTab === k ? 'on' : ''}" data-act="appTab" data-arg="${k}">${l}<span class="c">${APPS.filter(f).length}</span></button>`).join('')}</div>
    <div class="fbar">${vChips(inTab)}<span class="sp"></span><label class="ad-find">${ico('search')}<input data-q placeholder="Find a provider" value="${esc(S.q)}"></label></div>
    ${list.length ? `<div class="pn ad-tw"><table class="tbl ad-tbl"><thead><tr><th>Provider</th><th>Wants to list</th><th>Documents</th><th>Checks</th><th>First listing</th><th>${tab[0] === 'waiting' ? 'Waiting' : 'Decided'}</th><th>Status</th><th></th></tr></thead><tbody>
      ${list.map((a, i) => { const cs = appChecks(a), ds = docsOf(a), bad = cs.filter(c => c.tone === 'fail').length, warn = cs.filter(c => c.tone === 'warn').length, L = listingsOf(a)[0], over = isWaiting(a) && NOW - a.t > S.sla * 36e5;
        return `<tr class="ck" style="--i:${i}" data-act="openApp" data-arg="${a.id}"><td><div class="li">${av(a.name)}<div><b>${esc(a.name)}${a.real ? ' <span class="ad-real">This browser</span>' : ''}${a.added ? ' <span class="ad-tag">New business type</span>' : ''}${a.prev && isWaiting(a) ? ' <span class="ad-tag">Sent again</span>' : ''}</b><small>${esc(TYPE_L[a.type] || a.type)} · ${a.role === 'company' ? 'Company' : 'Individual'}</small></div></div></td>
        <td><span class="ad-v" style="--c:${VC[a.v]}">${ico(VI[a.v])}${esc(VL[a.v])}</span><small class="ad-sm">${esc(a.cats.map(c => catLabel(a.v, c)).join(', '))}</small></td>
        <td><span class="ad-docs">${ds.map(d => `<i class="${d.tone}" title="${esc(d.D[0] + ' — ' + d.note)}"></i>`).join('')}</span><small class="ad-sm">${ds.filter(d => d.tone === 'ok').length} of ${ds.length} fine</small></td>
        <td>${mini(scoreOf(cs), bad ? 'risk' : warn ? 'warn' : '')}<small class="ad-sm">${bad ? bad + ' failed' : warn ? warn + ' to look at' : 'All clear'}</small></td>
        <td>${L ? `<span class="ad-fl"><img src="${esc(L.img[0])}" alt=""><span>${esc(L.title)}</span></span>` : '<span class="hint">Adding later</span>'}</td>
        <td><span class="ad-sla ${over ? 'late' : ''}">${ico('clock')}${isWaiting(a) ? ago(a.t) : dur(a.decided - a.t)}</span></td>
        <td>${st(...APP_ST[a.status])}</td><td>${ico('chevR')}</td></tr>`; }).join('')}
      </tbody></table></div>` : `<div class="pn ad-empty big">${ico('check')}<b>${tab[0] === 'waiting' ? 'No provider is waiting' : 'Nothing here'}</b><small>${tab[0] === 'waiting' ? 'When a provider sends their application, it lands here.' : 'Try another tab or vertical.'}</small></div>`}`;
  };

  const planBox = (a, note) => { const live = a.status === 'verified', cur = a.plan || 'launch', g = live ? sugOf(a) : null, open = g && g.state === 'open' ? g.to : '';
    return `<div class="sect-t">Plan${!live && a.req ? ` <span class="ad-asked-h">· they asked for ${esc(PLAN(a.req).n)}</span>` : ''}</div><div class="ad-plans">${S.plans.map(p => `<button class="${cur === p.id ? 'on' : ''} ${open === p.id ? 'is-sug' : ''}" data-act="${live && p.id !== cur ? 'suggestPlan' : 'setPlan'}" data-arg="${a.id}|${p.id}" ${live && p.id === cur ? 'aria-current="true"' : ''}><b>${esc(p.n)}${live && p.id === cur ? '<i class="ad-cur">Current</i>' : open === p.id ? '<i class="ad-asked">Suggested</i>' : !live && a.req === p.id ? '<i class="ad-asked">Asked for</i>' : ''}</b><small>${aed(p.p)} / month</small><em>Up to ${p.max} listings</em></button>`).join('')}</div>
      ${note ? `<p class="hint" style="margin:8px 0 0">${note}</p>` : ''}${live ? sugLine(a) || `<p class="hint" style="margin:4px 0 0">Pick another plan to suggest it — ${esc(firstName(a))} decides in their dashboard. Nothing changes unless they accept.</p>` : ''}`; };
  /* ---------- suggesting a plan change: the provider accepts or keeps their plan (pw/os.js Plan & billing) ----------
     Stored where the provider reads it: upnow.join.review.sug for the real provider, S.planSug for the sample ones.
     { from, to, reason, t, state: 'open' | 'accepted' | 'declined' | 'other', at, chose } */
  const sugOf = a => { if (a.real) { const j = D.read(PFX + '.join'); return (j && j.review && j.review.sug) || null; } return S.planSug[a.id] || null; };
  function sugLine(a) {
    const g = sugOf(a); if (!g) return ''; const to = PLAN(g.to), fn = esc(firstName(a));
    if (g.state === 'open') return `<p class="ad-sug is-open">${ico('send')}<span><b>You suggested ${esc(to.n)}</b> on ${dateS(g.t)} — waiting for ${fn} to accept.${g.reason ? ` <em>“${esc(g.reason)}”</em>` : ''}</span><button type="button" class="ad-sug-x" data-act="sugWithdraw" data-arg="${a.id}">Withdraw</button></p>`;
    if (g.state === 'accepted') return `<p class="ad-sug is-ok">${ico('check')}<span><b>${fn} accepted ${esc(to.n)}</b> on ${dateS(g.at)}.</span></p>`;
    if (g.state === 'declined') return `<p class="ad-sug is-no">${ico('x')}<span><b>${fn} kept ${esc(PLAN(g.from).n)}</b> — said no to ${esc(to.n)} on ${dateS(g.at)}.</span></p>`;
    if (g.state === 'other') return `<p class="ad-sug is-ok">${ico('check')}<span><b>${fn} chose ${esc(PLAN(g.chose).n)}</b> instead of ${esc(to.n)} on ${dateS(g.at)}.</span></p>`;
    return '';
  }
  let SUG = null;
  function suggestPlan(arg) {
    const [id, pid] = arg.split('|'), a = APPS.find(x => x.id === id); if (!a) return;
    const cur = PLAN(a.plan || 'launch'), to = PLAN(pid), up = to.p > cur.p, used = listingsOf(a).filter(l => l.status !== 'rejected').length, fn = firstName(a), diff = to.p - cur.p;
    const R = up ? [used >= Math.ceil(cur.max * .8) ? `You have ${used} listings and ${cur.n} covers ${cur.max}. ${to.n} gives you room for ${to.max}.` : `You’re growing — ${to.n} gives you room for up to ${to.max} listings.`, `${to.n} adds more team members and reports for a business your size.`]
      : [`You’re using ${used} of your ${cur.max} listings — ${to.n} covers that for ${aed(to.p)} a month.`, `${to.n} fits how you use UpNow today and costs less.`];
    const rs = (v, t, i, own) => `<label class="ad-rs ${own ? 'is-own' : ''}"><input type="radio" name="rs" value="${esc(v)}" ${i ? '' : 'checked'}><i class="ad-rs-dot"></i><span class="ad-rs-t">${esc(t)}${own ? `<textarea data-own rows="3" placeholder="Write why ${esc(fn)} should switch…"></textarea>` : ''}</span></label>`;
    const box = (k, p) => `<div class="${k === 'to' ? 'to' : ''}"><small>${k === 'to' ? 'Suggested' : 'Now'}</small><b><span class="ad-plan" data-tier="${p.id}" style="--c:${p.c}">${esc(p.n)}</span></b><span>${aed(p.p)} / month · up to ${p.max} listings</span></div>`;
    DEC = null; SUG = { id, pid };
    modal(`<div class="ad-dm-h"><span class="ad-dm-i is-ok">${ico('send')}</span><div><h3>Suggest ${esc(to.n)} to ${esc(fn)}?</h3><small>${esc(a.name)} · ${used} listing${used === 1 ? '' : 's'} on ${esc(cur.n)}</small></div><button class="x" data-act="closeModal" aria-label="Close">${ico('x')}</button></div>
      <div class="ad-dm-b ad-dec">
        <div class="ad-sug-cmp">${box('now', cur)}<span class="ad-sug-arrow">${ico('chevR')}</span>${box('to', to)}</div>
        <p class="ad-dm-lead">${diff ? `${diff > 0 ? '+' : '−'}${aed(Math.abs(diff))} a month for them. ` : ''}${up ? 'If they accept, it starts that day.' : 'If they accept, it starts from their next billing date.'} Nothing changes unless they accept. Why should they switch?</p>
        <div class="ad-reasons">${R.map((t, i) => rs(t, t, i)).join('')}${rs('', 'Write my own', 1, true)}</div>
        <div class="ad-tell"><label class="ad-switch"><input type="checkbox" data-notify checked><i></i><span><b>Tell ${esc(fn)} on WhatsApp</b><small>Opens WhatsApp with this message — you press send. It also shows in their dashboard.</small></span></label>
          <div class="ad-wa"><div class="ad-wa-b" data-aed data-sugprev></div></div></div>
      </div>
      <div class="ad-dm-f"><button class="btn btn-o" data-act="closeModal">Cancel</button><button class="btn btn-g" data-act="sugSend">${ico('send')}Send suggestion</button></div>`, 'ad-dm is-ok');
    sugPreview();
  }
  const sugText = (a, cur, to, reason) => `Hi ${firstName(a)}, this is the UpNow team. We’d suggest moving from ${cur.n} to ${to.n} (${aed(to.p)} a month, up to ${to.max} listings). ${reason ? reason.replace(/\s*$/, '').replace(/([^.!?…])$/, '$1.') : '…'} If you’d like to switch, open your UpNow dashboard › Settings › Plan & billing. Nothing changes unless you choose to.`;
  const sugReason = () => { const m = $('#scrim'), r = m && m.querySelector('input[name=rs]:checked'), own = m && m.querySelector('[data-own]'); return r ? (r.value || (own && own.value.trim()) || '') : ''; };
  function sugPreview() { const b = $('#scrim [data-sugprev]'); if (!b || !SUG) return; const a = APPS.find(x => x.id === SUG.id); b.textContent = sugText(a, PLAN(a.plan || 'launch'), PLAN(SUG.pid), sugReason()); }
  function sugSend() {
    if (!SUG) return; const a = APPS.find(x => x.id === SUG.id); if (!a) return;
    const reason = sugReason(), own = $('#scrim [data-own]'); if (!reason) { if (own) own.focus(); toast('Say why they should switch'); return; }
    const cur = PLAN(a.plan || 'launch'), to = PLAN(SUG.pid), notify = $('#scrim [data-notify]').checked;
    const rec = { from: cur.id, to: to.id, reason, t: Date.now(), state: 'open', by: 'UpNow team' };
    if (a.real) { const j = D.read(PFX + '.join'); if (j) { j.review = j.review || {}; j.review.sug = rec; D.write(PFX + '.join', j); } } else S.planSug[a.id] = rec;
    S.log.unshift({ t: Date.now(), id: a.id, kind: 'suggestPlan', reason: `${cur.n} → ${to.n}: ${reason}` }); save();
    closeModal(); SUG = null;
    if (notify) window.open(waHref(a.phone, sugText(a, cur, to, reason)), '_blank', 'noopener');
    toast(`Suggestion sent — ${firstName(a)} decides in their dashboard`); refresh();
  }
  function sugWithdraw(id) {
    const a = APPS.find(x => x.id === id); if (!a) return;
    if (a.real) { const j = D.read(PFX + '.join'); if (j && j.review) { delete j.review.sug; D.write(PFX + '.join', j); } } else delete S.planSug[id];
    save(); toast('Suggestion withdrawn'); refresh();
  }
  // before approval there's no limit in force yet — say how many they have and what the plan allows
  const planUse = a => a.status === 'verified' ? planUse0(a) : (n => `${n} listing${n === 1 ? '' : 's'} so far — ${PLAN(a.plan || 'launch').n} allows up to ${PLAN(a.plan || 'launch').max}`)(listingsOf(a).filter(l => l.status !== 'rejected').length);
  const planUse0 = a => { const n = listingsOf(a).filter(l => !['rejected'].includes(l.status)).length, max = PLAN(a.plan || 'launch').max; return `${n} of ${max} listings used${n > max ? ' — <b>over the limit</b>' : ''}`; };
  /* ---------- the review panel: progress on top, problems first, why a decision is blocked, the next request ---------- */
  const TONE_I = { ok: 'check', warn: 'alert', fail: 'x', todo: 'clock' };
  // the checks that need you, then one folded line for the ones that passed
  function checkList(cs) {
    const need = cs.filter(c => c.tone !== 'ok'), ok = cs.filter(c => c.tone === 'ok');
    const li = (c, i) => `<li class="${c.tone}" style="--i:${i}"><i>${ico(TONE_I[c.tone])}</i><span><b>${esc(c.t)}</b>${c.sub ? `<small>${esc(c.sub)}</small>` : ''}</span></li>`;
    return `<div class="sect-t">${need.length ? 'Needs you' : 'Checks'}</div>
      ${need.length ? `<ul class="ad-checks">${need.map(li).join('')}</ul>` : `<p class="ad-allok">${ico('check')}Every check passed</p>`}
      ${ok.length ? `<details class="ad-passed"><summary>${ico('check')}<span>${ok.length} ${need.length ? 'other ' : ''}check${ok.length > 1 ? 's' : ''} passed</span>${ico('chev')}</summary><ul class="ad-checks">${ok.map(li).join('')}</ul></details>` : ''}`;
  }
  // the queue a request sits in: oldest first, as the lists show it
  const queue = k => k === 'a' ? APPS.filter(isWaiting).sort((x, y) => x.t - y.t) : LST.filter(isWaitingL).sort((x, y) => x.t - y.t);
  const openOf = k => k === 'a' ? openApp : openListing;
  // stays above the scrolling panel: where this request stands, and where it sits in the queue
  function progBar(k, x, cs, done, of, what) {
    const fail = cs.filter(c => c.tone === 'fail'), warn = cs.filter(c => c.tone === 'warn'), open = k === 'a' ? isWaiting(x) : isWaitingL(x);
    if (!open) return '';
    const q = queue(k), pos = q.findIndex(z => z.id === x.id), verb = k === 'a' ? 'approve' : 'put it live';
    const [tone, say] = fail.length ? ['risk', `Can’t ${verb} yet`] : done < of ? ['todo', what === 'documents' ? `Check ${of - done} more document${of - done > 1 ? 's' : ''}` : `Tick ${of - done} more check${of - done > 1 ? 's' : ''}`] : warn.length ? ['warn', `Ready — ${warn.length} thing${warn.length > 1 ? 's' : ''} to look at`] : ['ok', k === 'a' ? 'Ready to approve' : 'Ready to go live'];
    return `<div class="ad-prog is-${tone}"><div class="ad-prog-r"><b>${say}</b><span>${ico('check')}${done} of ${of} ${what} checked</span>${fail.length + warn.length ? `<span class="${fail.length ? 'risk' : 'warn'}">${ico('alert')}${fail.length + warn.length} to look at</span>` : ''}
        <span class="sp"></span>${q.length > 1 && pos > -1 ? `<button type="button" class="ad-skip" data-act="nextReq" data-arg="${k}|${x.id}" title="Next request (→)">${pos + 1} of ${q.length}${ico('chevR')}</button>` : ''}</div>
      <div class="ad-prog-bar"><i style="--w:${of ? Math.round(done / of * 100) : 100}%"></i></div></div>`;
  }
  // under the decision buttons: why the main one is greyed out (or what's still open), with a jump to it
  function whyBlock(cs, verb) {
    const f = cs.find(c => c.tone === 'fail'), t = cs.find(c => c.tone === 'todo');
    if (f) return `<button type="button" class="ad-why risk" data-act="jumpTo" data-arg="fail">${ico('alert')}<span><b>Can’t ${verb} yet:</b> ${esc(f.t)}</span><u>Show me</u></button>`;
    if (t) return `<button type="button" class="ad-why todo" data-act="jumpTo" data-arg="todo">${ico('clock')}<span><b>Can’t ${verb} yet:</b> ${esc(t.t)}</span><u>Show me</u></button>`;
    return '';
  }
  const KEYS = verb => `<p class="ad-keys"><kbd>A</kbd>${verb}<kbd>C</kbd>ask for changes<kbd>R</kbd>${verb === 'approve' ? 'reject' : 'not approve'}<kbd>→</kbd>next request</p>`;
  function openApp(id) {
    const a = APPS.find(x => x.id === id); if (!a) return;
    const cs = appChecks(a), ds = docsOf(a), Ls = listingsOf(a), sc = scoreOf(cs), block = blockers(a), d = a.d;
    const tone = t => ({ ok: 'check', warn: 'alert', fail: 'x', todo: 'clock' })[t];
    const shown = d.display || a.name;
    drawer(`<div class="dr-h ad-dh">${av(a.name, 'ad-avl')}<div style="flex:1;min-width:0"><h3>${esc(a.name)}</h3><small>${esc(TYPE_L[a.type] || a.type)} · ${a.role === 'company' ? 'Company' : 'Individual'} · ${esc(VL[a.v])}${a.real ? ' · <b class="ad-real">This browser</b>' : ''}</small>
        <div class="ad-dh-meta">${st(...APP_ST[a.status])}<span class="ad-sla ${isWaiting(a) && NOW - a.t > S.sla * 36e5 ? 'late' : ''}">${ico('clock')}${isWaiting(a) ? 'Waiting ' + ago(a.t) : 'Decided in ' + dur(a.decided - a.t)}</span><span class="hint">Sent ${dateS(a.t)}</span></div></div><button class="x" data-act="close">${ico('x')}</button></div>
      ${progBar('a', a, cs, ds.filter(x => x.f && x.checked).length, ds.filter(x => x.f).length, 'documents')}
      <div class="dr-b ad-db">
        ${a.fixing ? `<p class="ad-note info">${ico('edit')}<span><b>The provider is fixing it now.</b> It comes back here when they send it again.</span></p>` : ''}
        ${a.prev && isWaiting(a) ? `<p class="ad-note warn">${ico('clock')}<span><b>Sent again after changes.</b> We asked: “${esc(a.prev.reason)}” — check that part first.</span></p>` : ''}
        ${a.reason && a.status !== 'verified' ? `<p class="ad-note ${a.status === 'rejected' ? 'risk' : 'info'}">${ico(a.status === 'rejected' ? 'x' : 'edit')}<span><b>${a.status === 'rejected' ? 'Rejected' : 'Changes asked'}:</b> ${esc(a.reason)}</span></p>` : ''}
        ${checkList(cs)}
        <div class="sect-t">Documents</div>
        ${isWaiting(a) ? `<p class="ad-hint">${ico('search')}Open each document, check it with the issuing authority, then mark it checked.</p>` : ''}
        ${ds.map(x => `<div class="ad-doc ${x.tone} ${x.f && !x.checked ? 'ad-unck' : ''}" data-k="${x.k}"><div class="ad-doc-h"><i>${ico(WHO.includes(x.k) ? 'user' : 'doc')}</i><div><b>${esc(x.D[0])}</b><small><span class="ad-doc-st ${x.tone}">${esc(x.note)}</span>${x.f ? ' · ' + esc(x.f.name || 'Uploaded') : ''}</small></div>
            ${x.f && isWaiting(a) ? `<label class="ad-mark ${x.checked ? 'on' : ''}"><input type="checkbox" data-doccheck="${a.id}|${x.k}" ${x.checked ? 'checked' : ''}>${ico('check')}<span>${x.checked ? 'Checked' : 'Mark checked'}</span></label>` : x.checked ? `<span class="ad-mark on static">${ico('check')}<span>Checked</span></span>` : ''}</div>
          ${x.f ? `<div class="ad-doc-b"><button type="button" class="ad-thumb" data-act="viewDoc" data-arg="${a.id}|${x.k}" data-thumb="${a.id}|${x.k}" aria-label="Open ${esc(x.D[0])}"><span class="ad-thumb-load"></span></button><dl class="ad-rows">${x.D[2].map(([k, l, ty]) => { const v = d[k], un = a.src[k] === 'check', ex = ty === 'date' && expOf(v), flag = ex && ex < NOW ? ['bad', 'Expired'] : ex && ex < NOW + S.warnDays * DAY ? ['soon', 'Runs out soon'] : un ? ['un', 'Hard to read — compare'] : null;
              return `<div class="${flag ? flag[0] : ''}"><dt>${esc(l)}</dt><dd>${esc(ty === 'date' && ex ? dateY(ex) : v || '—')}${flag ? `<em>${flag[1]}</em>` : ''}</dd></div>`; }).join('')}</dl></div>
          <p class="ad-where">${ico('search')}How to check: <b>${esc(x.D[1])}</b></p>` : ''}</div>`).join('')}
        <div class="sect-t">What they want to list</div>
        <div class="ad-can">${a.cats.map(c => { const g = GATE[c], need = g && g(a), has = !need || a.docs[need]; return `<div class="${has ? 'ok' : 'warn'}"><i>${ico(has ? 'check' : 'clock')}</i><span><b>${esc(catLabel(a.v, c))}</b><small>${has ? 'Covered by their ' + (a.role === 'company' ? 'licence' : 'documents') : 'Waits for ' + DOCS[need][0]}</small></span></div>`; }).join('')}</div>
        <p class="hint" style="margin:8px 0 0">${esc(TYPE_L[a.type] || a.type)}${a.size ? ' · business size: ' + esc(a.size) : ''}${d.activity ? ' · licence activity: “' + esc(d.activity) + '”' : ''}</p>
        <div class="sect-t">${Ls.length > 1 ? 'Their listings' : 'First listing'}</div>
        ${Ls.length ? Ls.map(l => `<div class="ad-lrow" data-act="openListing" data-arg="${l.id}"><img src="${esc(l.img[0])}" alt=""><div><b>${esc(l.title)}</b><small>${esc(catLabel(l.v, l.cat))} · ${l.price ? aed(l.price) : 'No price'} · ${l.photos} photos</small></div>${st(...L_ST[l.status])}${ico('chevR')}</div>`).join('') : '<p class="hint">They chose to add their first listing later.</p>'}
        <div class="sect-t">What customers will see</div>
        <div class="ad-prof">${av(shown, 'ad-avl')}<div><b>${esc(shown)}</b><small>${esc((d.langs || []).join(', ') || 'English')}</small>${d.bio ? `<p>${esc(d.bio)}</p>` : ''}</div></div>
        <div class="sect-t">Contact</div>
        <dl class="ad-rows"><div><dt>Mobile</dt><dd>${esc(a.phone)}</dd></div><div><dt>Email</dt><dd>${esc(a.email || '—')}</dd></div></dl>
        ${planBox(a, a.status === 'verified' ? planUse(a) : a.status === 'rejected' ? 'Not used — the application was rejected.' : 'Starts when they’re approved. You can pick it now or later. ' + planUse(a))}
      </div>
      <div class="dr-f ad-df">${isWaiting(a) ? whyBlock(cs, 'approve') : ''}${isWaiting(a) ? `<button class="btn btn-g" data-act="approveApp" data-arg="${a.id}" ${cs.some(c => c.tone === 'fail' || c.tone === 'todo') ? 'disabled title="Finish the checks first"' : ''}>${ico('check')}Approve</button>
        <button class="btn btn-o" data-act="changesApp" data-arg="${a.id}">${ico('edit')}Ask for changes</button><button class="btn btn-o ad-danger" data-act="rejectApp" data-arg="${a.id}">${ico('x')}Reject</button>` : `<span class="hint">${a.status === 'verified' ? 'Approved' : a.status === 'rejected' ? 'Rejected' : 'Changes asked'} ${a.decided ? dateS(a.decided) : ''}</span>`}
        <span class="sp" style="flex:1"></span><a class="btn btn-wa btn-sm" target="_blank" rel="noopener" href="${waHref(a.phone, `Hi ${firstName(a)}, this is the UpNow team about your application.`)}">${ico('wa')}WhatsApp</a>${isWaiting(a) ? KEYS('approve') : ''}</div>`, 'a:' + id);
  }
  const firstName = a => (a.role === 'company' ? (a.d.sigName || a.name) : (a.d.fullName || a.name)).split(' ')[0];

  // a decision: pick a plan (approve) or a reason (changes / reject), then tell them on WhatsApp
  const REASONS = {
    changes: ['The document photo is cut off or blurry — upload the full page.', 'A document has expired — upload the new one.', 'Your licence activity doesn’t cover what you want to list — upload the updated licence.', 'The name on your ID doesn’t match the licence — add the signatory’s ID.'],
    reject: ['We couldn’t confirm your licence with the issuing authority.', 'This business type can’t list on UpNow in the UAE.', 'The documents belong to a different person or company.'],
    lchanges: ['Photo 1 looks like a stock image — use real photos of this listing.', 'Add the DLD advertising permit (Trakheesi) number for this unit.', 'The price looks wrong — please check it.', 'Add more detail to the description — what’s included and where it is.', 'Remove phone numbers and links from the text — customers contact you with the buttons.'],
    lreject: ['This listing doesn’t match what you were approved to list.', 'The permit number belongs to a different unit.', 'This listing is already on UpNow from another provider.']
  };
  function decide(kind, id) {
    const isL = /L$/.test(kind), x = isL ? LST.find(l => l.id === id) : APPS.find(a => a.id === id); if (!x) return;
    const a = isL ? appOf(x) : x;
    const approve = kind === 'approveApp' || kind === 'liveL', key = { changesApp: 'changes', rejectApp: 'reject', changesL: 'lchanges', rejectL: 'lreject' }[kind];
    const title = { approveApp: `Approve ${x.name}?`, changesApp: 'Ask for changes', rejectApp: `Reject ${x.name}?`, liveL: 'Put this listing live?', changesL: 'Ask for changes', rejectL: 'Not approve this listing?' }[kind];
    const warns = (isL ? listingChecks(x) : appChecks(x)).filter(c => c.tone === 'warn' || c.tone === 'todo');
    const reject = !!key && key.includes('reject'), tone = approve ? 'ok' : reject ? 'risk' : 'warn', name = firstName(a);
    const sub = isL ? `${esc(x.title)} · ${esc(a.name)}` : `${esc(x.name)}${x.type ? ' · ' + esc(TYPE_L[x.type] || x.type) : ''}`;
    // a reason card: a round marker that lines up with the first line of text; "Write my own" opens its box in the card
    const reason = (v, t, i, own) => `<label class="ad-rs ${own ? 'is-own' : ''}"><input type="radio" name="rs" value="${esc(v)}" ${i ? '' : 'checked'}><i class="ad-rs-dot"></i>
        <span class="ad-rs-t">${esc(t)}${own ? `<textarea data-own rows="3" placeholder="Write what ${esc(name)} should change…"></textarea>` : ''}</span></label>`;
    modal(`<div class="ad-dm-h"><span class="ad-dm-i is-${tone}">${ico(approve ? 'check' : reject ? 'x' : 'edit')}</span><div><h3>${esc(title)}</h3><small>${sub}</small></div><button class="x" data-act="closeModal" aria-label="Close">${ico('x')}</button></div>
      <div class="ad-dm-b ad-dec">
      ${approve ? (isL ? `<p class="ad-dm-lead">It appears in search straight away, with ${esc(a.name)}’s Call and WhatsApp buttons. Every contact becomes a lead for them.</p>`
        : `<p class="ad-dm-lead">They get the Verified badge and their listings go to review. Pick their plan:</p><div class="ad-plans">${S.plans.map((p, i) => `<button class="${(x.plan || 'launch') === p.id ? 'on' : ''}" data-plan="${p.id}"><b>${esc(p.n)}${x.req === p.id ? '<i class="ad-asked">Asked for</i>' : ''}</b><small>${aed(p.p)} / month</small><em>Up to ${p.max} listings</em></button>`).join('')}</div>`)
        : `<p class="ad-dm-lead">${reject ? 'They can’t ' + (isL ? 'publish this listing' : 'list on UpNow') + '. Pick the reason they’ll see:' : 'They fix it and send it again. Pick what they need to change:'}</p>
        <div class="ad-reasons">${REASONS[key].map((t, i) => reason(t, t, i)).join('')}${reason('', 'Write my own', 1, true)}</div>`}
      ${approve && warns.length ? `<p class="ad-note warn">${ico('alert')}<span>${warns.length} check${warns.length > 1 ? 's' : ''} still open: ${esc(warns.map(w => w.t).join(' · '))}</span></p>` : ''}
      <div class="ad-tell"><label class="ad-switch"><input type="checkbox" data-notify checked><i></i><span><b>Tell ${esc(name)} on WhatsApp</b><small>Opens WhatsApp with this message — you press send</small></span></label>
        <div class="ad-wa"><div class="ad-wa-b" data-aed data-decprev></div></div></div>
      </div>
      <div class="ad-dm-f"><button class="btn btn-o" data-act="closeModal">Cancel</button><button class="btn ${reject ? 'btn-g ad-red' : 'btn-g'}" data-act="confirmDec" data-arg="${kind}|${id}">${approve ? ico('check') + (isL ? 'Put it live' : 'Approve') : reject ? ico('x') + 'Reject' : 'Send to provider'}</button></div>`, 'ad-dm is-' + tone);
    DEC = { kind, id }; decPreview();
  }
  // what the provider will read — the same text confirmDec opens WhatsApp with
  let DEC = null;
  function decText(kind, x, a, plan, reason) {
    const isL = /L$/.test(kind), name = firstName(a), what = isL ? `your listing “${x.title}”` : 'your application';
    const stv = { approveApp: 'verified', changesApp: 'changes', rejectApp: 'rejected', liveL: 'live', changesL: 'changes', rejectL: 'rejected' }[kind];
    return { verified: `Hi ${name}, good news — ${what} on UpNow is approved. You now have the Verified badge${plan ? ` and you're on the ${PLAN(plan).n} plan` : ''}. Your listings go to review next.`, live: `Hi ${name}, ${what} is now live on UpNow. Customers can call and WhatsApp you from it — every contact shows up as a lead in your dashboard.`,
      changes: `Hi ${name}, thanks for ${what} on UpNow. Before we can approve it, please: ${reason || '…'} Then send it again — we review within ${S.sla} hours.`, rejected: `Hi ${name}, we're sorry — we can't approve ${what} on UpNow. ${reason || '…'} Reply here if you have questions.` }[stv];
  }
  function decPreview() {
    const m = $('#scrim'), b = m && m.querySelector('[data-decprev]'); if (!b || !DEC) return;
    const isL = /L$/.test(DEC.kind), x = isL ? LST.find(l => l.id === DEC.id) : APPS.find(q => q.id === DEC.id); if (!x) return;
    const r = m.querySelector('input[name=rs]:checked'), own = m.querySelector('[data-own]'), pl = m.querySelector('[data-plan].on');
    b.textContent = decText(DEC.kind, x, isL ? appOf(x) : x, pl ? pl.dataset.plan : '', r ? (r.value || (own && own.value.trim()) || '') : '');
  }
  function confirmDec(arg) {
    const [kind, id] = arg.split('|'), isL = /L$/.test(kind), x = isL ? LST.find(l => l.id === id) : APPS.find(a => a.id === id); if (!x) return;
    const a = isL ? appOf(x) : x, m = $('#scrim');
    // where this one sat in its queue, so the one after it opens next
    // only when deciding from the side panel: on a full page (6c's listing / provider pages) the page stays put
    const q0 = queue(isL ? 'l' : 'a'), pos0 = q0.findIndex(z => z.id === id), after = q0.filter(z => z.id !== id), nextId = drawerFor && after.length ? (after[Math.max(0, pos0)] || after[0]).id : '';
    const r = m.querySelector('input[name=rs]:checked'), own = m.querySelector('[data-own]'), reason = r ? (r.value || (own && own.value.trim()) || '') : '';
    if (r && !reason) { own.focus(); toast('Write a message for the provider'); return; }
    const plan = (m.querySelector('[data-plan].on') || {}).dataset ? m.querySelector('[data-plan].on').dataset.plan : '';
    const notify = m.querySelector('[data-notify]').checked;
    const stv = { approveApp: 'verified', changesApp: 'changes', rejectApp: 'rejected', liveL: 'live', changesL: 'changes', rejectL: 'rejected' }[kind];
    const rec = { status: stv, decided: Date.now(), reason };
    if (isL) { if (x.real) D.decideListing(x.rid, a.owner, stv, reason); else S.ldec[id] = rec; }
    else { if (plan) S.planOf[id] = plan; if (x.real) D.decideApp(x, stv, reason, plan); else S.dec[id] = Object.assign(rec, plan ? { plan } : {}); }
    S.log.unshift({ t: Date.now(), id, kind, reason }); S.log = S.log.slice(0, 200); save();
    const text = decText(kind, x, a, plan, reason), drawerOpened = !!drawerFor;
    closeModal(); closeDrawer();
    if (notify) window.open(waHref(a.phone, text), '_blank', 'noopener');
    const said = { verified: `${x.name} approved`, live: 'Listing is live', changes: 'Changes requested', rejected: isL ? 'Listing not approved' : `${x.name} rejected` }[stv];
    refresh();
    const nx = nextId && (isL ? LST.find(z => z.id === nextId && isWaitingL(z)) : APPS.find(z => z.id === nextId && isWaiting(z)));
    if (nx) { openOf(isL ? 'l' : 'a')(nextId); toast(`${said} · next: ${isL ? nx.title : nx.name}`); }
    else toast(drawerOpened ? `${said} · that was the last one waiting` : said);
  }


  /* ================= DOCUMENTS: the file the provider uploaded =================
     Real providers: the file onboarding saved in this browser (js/core/files.js, docs[id].file). Sample providers have
     no files, so they get a drawn sample of the document, clearly marked. The viewer puts the document beside what
     was read from it, so the team compares the two and marks it checked. */
  const URLS = {};
  const svgUrl = svg => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  const X = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function sampleDoc(a, k) {
    const D0 = DOCS[k], d = a.d, rows = D0[2].map(([f, l]) => [l, d[f] || '—']);
    const mark = `<text x="50%" y="56%" text-anchor="middle" font-size="64" font-weight="800" fill="#c2413b" opacity=".13" transform="rotate(-18 300 300)" font-family="Arial">SAMPLE</text>`;
    if (k === 'eid' || k === 'sig') {
      const nm = k === 'sig' ? d.sigName : d.fullName;
      return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="860" height="540" viewBox="0 0 860 540" font-family="Arial"><rect width="860" height="540" rx="28" fill="#f3f7f4"/><rect width="860" height="96" rx="28" fill="#0b3d2a"/><rect y="60" width="860" height="36" fill="#0b3d2a"/>
        <text x="40" y="58" fill="#fff" font-size="26" font-weight="700">UNITED ARAB EMIRATES</text><text x="40" y="84" fill="#9fe3c2" font-size="17">RESIDENT IDENTITY CARD</text><text x="820" y="70" text-anchor="end" fill="#fff" font-size="30">الإمارات</text>
        <rect x="40" y="130" width="200" height="250" rx="14" fill="#d8efe3"/><circle cx="140" cy="220" r="52" fill="#9fb3a8"/><path d="M62 370c8-60 46-92 78-92s70 32 78 92z" fill="#9fb3a8"/>
        ${[['Name', nm], ['ID Number', d.eidNo], ['Nationality', d.nationality || '—'], ['Expiry Date', d.eidExp]].map(([l, v], i) => `<text x="280" y="${160 + i * 62}" fill="#7b877f" font-size="17">${X(l)}</text><text x="280" y="${186 + i * 62}" fill="#14201a" font-size="25" font-weight="700">${X(v)}</text>`).join('')}
        <rect x="40" y="420" width="780" height="80" rx="10" fill="#e6efe9"/><text x="60" y="455" fill="#46534c" font-size="20" font-family="Courier New">ILARE${X(String(d.eidNo || '').replace(/\D/g, ''))}&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text><text x="60" y="485" fill="#46534c" font-size="20" font-family="Courier New">${X(String(nm || '').toUpperCase().replace(/\s+/g, '<'))}&lt;&lt;&lt;&lt;</text>${mark}</svg>`);
    }
    if (k === 'passport' || k === 'sigPass') {
      return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="860" height="600" viewBox="0 0 860 600" font-family="Arial"><rect width="860" height="600" rx="18" fill="#f7f3ea"/><text x="40" y="60" fill="#5a3a06" font-size="24" font-weight="700">PASSPORT</text><text x="820" y="60" text-anchor="end" fill="#7b6a4a" font-size="18">${X(rows[1] ? rows[1][1] : '')}</text>
        <rect x="40" y="90" width="210" height="270" rx="10" fill="#e8dfcc"/><circle cx="145" cy="190" r="56" fill="#b9ab8e"/><path d="M60 350c8-64 50-98 85-98s77 34 85 98z" fill="#b9ab8e"/>
        ${[['Surname / Given names', a.role === 'company' ? d.sigName : d.fullName], ...rows].map(([l, v], i) => `<text x="290" y="${120 + i * 66}" fill="#8a7a5a" font-size="16">${X(l)}</text><text x="290" y="${146 + i * 66}" fill="#14201a" font-size="24" font-weight="700">${X(v)}</text>`).join('')}
        <rect x="0" y="470" width="860" height="130" fill="#efe7d6"/><text x="40" y="520" fill="#46534c" font-size="22" font-family="Courier New">P&lt;${X(String(rows[1] ? rows[1][1] : '').slice(0, 3).toUpperCase())}${X(String(d.fullName || d.sigName || '').toUpperCase().replace(/\s+/g, '<<'))}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text><text x="40" y="560" fill="#46534c" font-size="22" font-family="Courier New">${X(rows[0][1])}&lt;0&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>${mark}</svg>`);
    }
    // licences, permits, certificates: an A4 page
    return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="620" height="860" viewBox="0 0 620 860" font-family="Arial"><rect width="620" height="860" fill="#fff"/><rect x="18" y="18" width="584" height="824" fill="none" stroke="#d3dad5" stroke-width="2"/>
      <rect x="18" y="18" width="584" height="110" fill="#eef7f2"/><circle cx="80" cy="73" r="34" fill="#047246"/><text x="80" y="82" text-anchor="middle" fill="#fff" font-size="24" font-weight="800">${X((D0[1].match(/[A-Z]{2,}/) || ['GOV'])[0].slice(0, 4))}</text>
      <text x="130" y="66" fill="#0b3d2a" font-size="19" font-weight="700">${X(String((rows.find(r => /Issu/.test(r[0])) || [])[1] && (rows.find(r => /Issu/.test(r[0])) || [])[1] !== '—' ? rows.find(r => /Issu/.test(r[0]))[1] : D0[1].split(' — ')[0].replace(/ (licence search|register|check)$/i, '')).slice(0, 44))}</text><text x="130" y="94" fill="#46534c" font-size="15">Government of Dubai</text>
      <text x="310" y="190" text-anchor="middle" fill="#14201a" font-size="28" font-weight="800">${X(D0[0].replace(/^Your /, ''))}</text>
      ${rows.map(([l, v], i) => `<line x1="50" x2="570" y1="${238 + i * 70}" y2="${238 + i * 70}" stroke="#e4e9e5"/><text x="50" y="${268 + i * 70}" fill="#7b877f" font-size="15">${X(l)}</text><text x="50" y="${294 + i * 70}" fill="#14201a" font-size="21" font-weight="700">${X(String(v).slice(0, 44))}</text>`).join('')}
      <circle cx="490" cy="740" r="62" fill="none" stroke="#047246" stroke-width="4" opacity=".55"/><circle cx="490" cy="740" r="48" fill="none" stroke="#047246" stroke-width="2" opacity=".55"/><text x="490" y="746" text-anchor="middle" fill="#047246" font-size="15" font-weight="700" opacity=".7">APPROVED</text>
      <path d="M60 760c30-30 50 10 80-12s40 8 70-6" fill="none" stroke="#1f3b8a" stroke-width="3"/><text x="60" y="800" fill="#7b877f" font-size="14">Authorised signatory</text>${mark}</svg>`);
  }
  // → { url, type, sample } | { missing: true }
  function fileOf(a, k) {
    if (a.sample) return Promise.resolve({ url: sampleDoc(a, k), type: 'image/svg+xml', sample: true });
    const f = a.docs[k]; if (!f || !f.file || !window.UPFILES) return Promise.resolve({ missing: true });
    if (URLS[f.file]) return Promise.resolve(URLS[f.file]);
    return UPFILES.get(f.file).then(b => b ? (URLS[f.file] = { url: URL.createObjectURL(b), type: b.type || f.type || '', name: f.name }) : { missing: true });
  }
  const isPdf = o => /pdf/.test(o.type || '') || /\.pdf$/i.test(o.name || '');
  function thumbs(root) {
    $$('[data-thumb]', root).forEach(el => { const [id, k] = el.dataset.thumb.split('|'), a = APPS.find(x => x.id === id); if (!a) return;
      fileOf(a, k).then(o => { el.classList.toggle('missing', !!o.missing);
        el.innerHTML = o.missing ? `${ico('alert')}<small>File not in this browser</small>` : isPdf(o) ? `<span class="ad-pdf">PDF</span><small>Open</small>` : `<img src="${o.url}" alt="">${o.sample ? '<em>Sample</em>' : ''}<span class="ad-thumb-zoom">${ico('search')}</span>`; }); });
  }

  // the viewer: one item at a time, with what to compare beside it
  let VW = null; // { items: [{ title, sub, get: () => Promise<{url,type}>, side: () => html }], i, zoom, rot }
  function viewer(items, i) { VW = { items, i, zoom: 1, rot: 0 }; paintViewer(); }
  function paintViewer() {
    let el = $('#adv'); if (!el) { el = document.createElement('div'); el.id = 'adv'; el.className = 'adv'; document.body.appendChild(el); }
    const it = VW.items[VW.i], n = VW.items.length;
    el.innerHTML = `<div class="adv-stage"><div class="adv-bar"><div class="adv-t"><b>${esc(it.title)}</b><small>${esc(it.sub || '')}${n > 1 ? ` · ${VW.i + 1} of ${n}` : ''}</small></div><span class="sp"></span>
        <button type="button" data-vw="out" aria-label="Zoom out">−</button><button type="button" data-vw="fit">${Math.round(VW.zoom * 100)}%</button><button type="button" data-vw="in" aria-label="Zoom in">+</button>
        <button type="button" data-vw="rot" aria-label="Rotate">${ico('refresh')}</button><a data-vw-open target="_blank" rel="noopener" aria-label="Open in a new tab" title="Open in a new tab">${ico('out')}</a><button type="button" class="adv-close" data-vw="close">${ico('x')}Close</button></div>
      <div class="adv-img"><span class="ad-thumb-load"></span></div>
      ${n > 1 ? `<button type="button" class="adv-nav p" data-vw="prev" aria-label="Previous">${ico('chevL')}</button><button type="button" class="adv-nav n" data-vw="next" aria-label="Next">${ico('chevR')}</button>` : ''}</div>
      <aside class="adv-side">${it.side()}</aside>`;
    el.classList.add('on');
    it.get().then(o => { const box = $('.adv-img', el); if (!box || VW.items[VW.i] !== it) return;
      if (o.missing) { box.innerHTML = `<div class="adv-miss">${ico('alert')}<b>The file isn’t in this browser</b><small>Uploads are kept in the browser they were made in. Ask the provider to send it again, or check the original they share with you.</small></div>`; return; }
      $('[data-vw-open]', el).href = o.url;
      box.innerHTML = isPdf(o) ? `<iframe src="${o.url}" title="${esc(it.title)}"></iframe>` : `<img src="${o.url}" alt="${esc(it.title)}" style="--z:${VW.zoom};--r:${VW.rot}deg">${o.sample ? '<em class="adv-sample">Sample document — real uploads show here</em>' : ''}`; });
  }
  const closeViewer = () => { const el = $('#adv'); if (el) el.classList.remove('on'); VW = null; };
  function docItems(a) {
    return docsOf(a).filter(x => x.f).map(x => ({ title: x.D[0], sub: a.name, get: () => fileOf(a, x.k), side: () => { const y = docState(a, x.k);
      return `<div class="adv-h"><b>What we read from it</b><small><span class="ad-doc-st ${y.tone}">${esc(y.note)}</span></small></div>
        <dl class="ad-rows">${y.D[2].map(([k, l, ty]) => { const v = a.d[k], un = a.src[k] === 'check', ex = ty === 'date' && expOf(v), flag = ex && ex < NOW ? ['bad', 'Expired'] : ex && ex < NOW + S.warnDays * DAY ? ['soon', 'Runs out soon'] : un ? ['un', 'Hard to read'] : null;
          return `<div class="${flag ? flag[0] : ''}"><dt>${esc(l)}</dt><dd>${esc(ty === 'date' && ex ? dateY(ex) : v || '—')}${flag ? `<em>${flag[1]}</em>` : ''}</dd></div>`; }).join('')}</dl>
        <p class="ad-where">${ico('search')}How to check: <b>${esc(y.D[1])}</b></p>
        ${isWaiting(a) ? `<button type="button" class="ad-mark big ${y.checked ? 'on' : ''}" data-vw="check" data-arg="${a.id}|${x.k}">${ico('check')}<span>${y.checked ? 'Checked' : 'Mark checked'}</span></button>` : y.checked ? `<span class="ad-mark on static">${ico('check')}<span>Checked</span></span>` : ''}
        ${isWaiting(a) && y.checked ? nextStep(a, x.k) : ''}
        <p class="adv-keys">Use ← → to move between documents</p>`; } }));
  }
  // after a document is checked: the next one still to check, or back to the application to decide
  function nextStep(a, k) {
    const list = docsOf(a).filter(x => x.f), i = list.findIndex(x => x.k === k);
    const rest = [...list.slice(i + 1), ...list.slice(0, i)].find(x => !x.checked);
    if (rest) return `<div class="adv-next"><small>${list.filter(x => !x.checked).length} more to check</small><button type="button" class="btn btn-g" data-vw="goto" data-arg="${list.indexOf(rest)}">Next: ${esc(rest.D[0])}${ico('chevR')}</button></div>`;
    return `<div class="adv-next done"><small>${ico('check')}All ${list.length} documents checked</small><button type="button" class="btn btn-g" data-vw="done">Back to the application${ico('chevR')}</button><span>Approve, ask for changes or reject from there</span></div>`;
  }
  function photoItems(l) {
    return l.img.map((u, i) => ({ title: l.title, sub: (appOf(l) || {}).name || '', get: () => Promise.resolve({ url: u, type: 'image' }), side: () => { const tick = ticksOf(l);
      return `<div class="adv-h"><b>Is this photo right?</b><small>${esc(catLabel(l.v, l.cat))} · ${esc((appOf(l) || {}).name || '')}</small></div>
        <ul class="adv-q"><li>A real photo of this ${l.v === 'spaces' ? 'place' : 'service'} — not a stock or website image</li><li>No phone numbers, logos of other sites or watermarks</li><li>Matches the title, details and price</li></ul>
        ${isWaitingL(l) || l.status === 'live' ? `<button type="button" class="ad-mark big ${tick.photos ? 'on' : ''}" data-vw="lcheck" data-arg="${l.id}|photos">${ico('check')}<span>${tick.photos ? 'Photos checked' : 'All photos look right'}</span></button>` : ''}
        ${tick.photos && isWaitingL(l) ? `<div class="adv-next done"><small>${ico('check')}Photos checked</small><button type="button" class="btn btn-g" data-vw="done">Back to the listing${ico('chevR')}</button><span>Finish the other checks, then put it live</span></div>` : ''}
        <p class="adv-keys">Use ← → to move between photos</p>`; } }));
  }

  /* ================= LISTING REQUESTS ================= */
  const L_ST = { review: ['In review', 'warn'], verify: ['Waits for provider approval', 'mute'], licence: ['Waits for licence', 'mute'], changes: ['Changes asked', 'info'], live: ['Live', ''], rejected: ['Not approved', 'risk'], draft: ['Draft', 'mute'] };
  pages.listings = () => {
    const tabs = [['review', 'In review', l => l.status === 'review'], ['waiting', 'Waiting on provider', l => ['verify', 'licence'].includes(l.status)], ['changes', 'Changes asked', l => l.status === 'changes'], ['live', 'Live', l => l.status === 'live'], ['rejected', 'Not approved', l => l.status === 'rejected']];
    const tab = tabs.find(t => t[0] === S.lstTab) || tabs[0], inTab = LST.filter(tab[2]).sort((a, b) => tab[0] === 'review' ? a.t - b.t : (b.decided || b.t) - (a.decided || a.t));
    const list = inTab.filter(l => S.vf === 'all' || l.v === S.vf).filter(l => !S.q || [l.title, (appOf(l) || {}).name, l.permit].join(' ').toLowerCase().includes(S.q));
    const R = LST.filter(isWaitingL);
    return `${head('Listing requests', 'Listings providers sent to go live. Check the provider may list it and that it’s done right — photos, price, permit — then put it live.')}
    <div class="ad-mini-stats">
      <div><small>In review</small><b data-count="${R.length}">${R.length}</b><span>${R.filter(l => NOW - l.t > S.sla * 36e5).length} past ${S.sla}h</span></div>
      <div><small>Ready to go live</small><b data-count="${R.filter(l => !listingChecks(l).some(c => c.tone === 'fail')).length}">${R.filter(l => !listingChecks(l).some(c => c.tone === 'fail')).length}</b><span>nothing failed · only your checks left</span></div>
      <div><small>Live on UpNow</small><b data-count="${LST.filter(l => l.status === 'live').length}">${LST.filter(l => l.status === 'live').length}</b><span>${LST.filter(l => l.status === 'live' && inP(l.decided)).length} ${esc(pLabel())}</span></div>
      <div><small>Sent back</small><b>${LST.filter(l => ['changes', 'rejected'].includes(l.status) && inP(l.decided, 'month')).length}</b><span>this month</span></div>
    </div>
    <div class="tabs">${tabs.map(([k, l, f]) => `<button class="${S.lstTab === k ? 'on' : ''}" data-act="lstTab" data-arg="${k}">${l}<span class="c">${LST.filter(f).length}</span></button>`).join('')}</div>
    <div class="fbar">${vChips(inTab)}<span class="sp"></span><label class="ad-find">${ico('search')}<input data-q placeholder="Find a listing or permit" value="${esc(S.q)}"></label></div>
    ${list.length ? `<div class="lgrid ad-lgrid">${list.map((l, i) => { const cs = listingChecks(l), bad = cs.filter(c => c.tone === 'fail'), warn = cs.filter(c => c.tone === 'warn'), a = appOf(l) || {}, over = isWaitingL(l) && NOW - l.t > S.sla * 36e5;
      return `<article class="lcard ad-lc" style="--i:${i}" data-act="openListing" data-arg="${l.id}"><div class="im"><img src="${esc(l.img[0])}" alt="" loading="lazy">${st(...L_ST[l.status])}<span class="cat">${esc(catLabel(l.v, l.cat))}</span>${l.real ? '<span class="ad-real on-img">This browser</span>' : ''}</div>
        <div class="bd"><b class="t">${esc(l.title)}</b><span class="ad-by">${av(a.name || '?', 'sm')}${esc(a.name || '')}</span><span class="pr">${l.price ? aed(l.price) : 'No price'}${l.basis ? ` <span>/ ${esc(l.basis)}</span>` : ''}</span>
        ${bad.length ? `<span class="ad-flag risk">${ico('x')}${esc(bad[0].t)}${bad.length > 1 ? ` +${bad.length - 1}` : ''}</span>` : warn.length ? `<span class="ad-flag warn">${ico('alert')}${esc(warn[0].t)}</span>` : `<span class="ad-flag ok">${ico('check')}Checks passed</span>`}</div>
        <div class="ms"><div><small>Photos</small><b>${l.photos}</b></div><div><small>${l.status === 'live' ? 'Leads' : 'Checks'}</small><b>${l.status === 'live' ? l.leads : scoreOf(cs) + '%'}</b></div><div><small>${isWaitingL(l) ? 'Waiting' : 'Sent'}</small><b class="${over ? 'ad-red-t' : ''}">${isWaitingL(l) ? ago(l.t) : dateS(l.t)}</b></div></div></article>`; }).join('')}</div>`
      : `<div class="pn ad-empty big">${ico('check')}<b>${tab[0] === 'review' ? 'No listing is waiting' : 'Nothing here'}</b><small>${tab[0] === 'review' ? 'Listings arrive here once their provider is approved.' : 'Try another tab or vertical.'}</small></div>`}`;
  };
  function openListing(id) {
    const l = LST.find(x => x.id === id); if (!l) return;
    const a = appOf(l) || {}, cs = listingChecks(l), sc = scoreOf(cs), man = manualL(l), tick = ticksOf(l);
    const tone = t => ({ ok: 'check', warn: 'alert', fail: 'x', todo: 'clock' })[t];
    const can = isWaitingL(l) || l.status === 'live';
    drawer(`<div class="ad-gal">${[0, 1, 2].map(k => l.img[k % l.img.length]).map((s, i) => `<img src="${esc(s)}" alt="" class="${i ? '' : 'big'}" data-act="viewPhotos" data-arg="${l.id}|${i % l.img.length}">`).join('')}<button type="button" class="ad-gal-n" data-act="viewPhotos" data-arg="${l.id}|0">${ico('image')}See the photos</button><button class="x" data-act="close">${ico('x')}</button></div>
      <div class="dr-h ad-dh"><div style="flex:1;min-width:0"><h3>${esc(l.title)}</h3><small>${esc(catLabel(l.v, l.cat))} · ${esc(VL[l.v])}${l.loc ? ' · ' + esc(areaN(l.loc)) : ''}${l.real ? ' · <b class="ad-real">This browser</b>' : ''}</small>
        <div class="ad-dh-meta">${st(...L_ST[l.status])}<b class="ad-price">${l.price ? aed(l.price) : 'No price'}${l.basis ? ` <small>/ ${esc(l.basis)}</small>` : ''}</b><span class="ad-sla ${isWaitingL(l) && NOW - l.t > S.sla * 36e5 ? 'late' : ''}">${ico('clock')}${isWaitingL(l) ? 'Waiting ' + ago(l.t) : 'Sent ' + dateS(l.t)}</span><a class="ad-full" href="listing.html?id=${encodeURIComponent(l.id)}">Full details${ico('chevR')}</a></div></div></div>
      ${progBar('l', l, cs, man.filter(([k]) => tick[k]).length, man.length, 'checks')}
      <div class="dr-b ad-db">
        ${l.reason && ['changes', 'rejected'].includes(l.status) ? `<p class="ad-note ${l.status === 'rejected' ? 'risk' : 'info'}">${ico('edit')}<span><b>${l.status === 'rejected' ? 'Not approved' : 'Changes asked'}:</b> ${esc(l.reason)}</span></p>` : ''}
        ${checkList(cs)}
        <div class="sect-t">Your checks</div>
        <div class="ad-man ad-unck-wrap">${man.map(([k, t]) => `<label class="ad-tick wide"><input type="checkbox" data-lcheck="${l.id}|${k}" ${tick[k] ? 'checked' : ''} ${can ? '' : 'disabled'}><span>${ico('check')}</span>${esc(t)}</label>`).join('')}</div>
        <div class="sect-t">Description</div><p class="ad-desc">${esc(l.desc || 'No description')}</p>
        <dl class="ad-rows">${[['Category', catLabel(l.v, l.cat)], ['Where', [l.building, l.loc && areaN(l.loc)].filter(Boolean).join(', ') || 'Areas they cover'], ['Permit', l.permit || '—'], ['Photos', l.photos]].map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
        ${l.status === 'live' ? perfBlockL(l) : ''}
        <div class="sect-t">Provider</div>
        <div class="ad-lrow" data-act="openApp" data-arg="${a.id}">${av(a.name || '?')}<div><b>${esc(a.name || '')}</b><small>${esc(TYPE_L[a.type] || a.type || '')} · ${a.status === 'verified' ? 'Approved ' + dateS(a.decided || a.t) : 'Not approved yet'}</small></div>${st(...APP_ST[a.status || 'submitted'])}${ico('chevR')}</div>
        ${a.id ? planBox(a, (a.status === 'verified' ? '' : 'Starts when they’re approved. ') + planUse(a)) : ''}
      </div>
      <div class="dr-f ad-df">${isWaitingL(l) ? whyBlock(cs, 'put it live') : ''}${isWaitingL(l) ? `<button class="btn btn-g" data-act="liveL" data-arg="${l.id}" ${cs.some(c => c.tone === 'fail' || c.tone === 'todo') ? 'disabled title="Finish the checks first"' : ''}>${ico('check')}Put it live</button><button class="btn btn-o" data-act="changesL" data-arg="${l.id}">${ico('edit')}Ask for changes</button><button class="btn btn-o ad-danger" data-act="rejectL" data-arg="${l.id}">${ico('x')}Not approve</button>`
        : l.status === 'live' ? `<button class="btn btn-o" data-act="changesL" data-arg="${l.id}">${ico('edit')}Take down and ask for changes</button>` : `<span class="hint">${esc(L_ST[l.status][0])}${l.decided ? ' · ' + dateS(l.decided) : ''}</span>`}
        <span class="sp" style="flex:1"></span>${a.phone ? `<a class="btn btn-wa btn-sm" target="_blank" rel="noopener" href="${waHref(a.phone, `Hi ${firstName(a)}, this is the UpNow team about your listing “${l.title}”.`)}">${ico('wa')}WhatsApp</a>` : ''}${isWaitingL(l) ? KEYS('put it live') : ''}</div>`, 'l:' + id);
  }

  /* ================= PROVIDERS ================= */
  /* ================= PERFORMANCE ================= */
  // views and leads come from the data; reply time, channels and the weekly trend are worked out from the listing's id,
  // so the sample stays the same on every visit. A real provider (this browser) starts at zero until leads come in.
  const seeded = s => { let h = 2166136261; for (const c of String(s)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; }; };
  const CH = [['wa', 'WhatsApp', '#1faa59'], ['call', 'Calls', '#136142'], ['email', 'Email', '#5b8def'], ['sms', 'SMS', '#e0a526']];
  const PF = {};
  const perfL = l => {
    if (PF[l.id]) return PF[l.id];
    const r = seeded(l.id), live = l.status === 'live', views = live ? l.views || 0 : 0, leads = live ? l.leads || 0 : 0;
    const w = [.5, .28, .14, .08].map(x => x * (.6 + r() * .8)), ws = w.reduce((a, b) => a + b, 0);
    let left = leads; const ch = CH.map(([k], i) => { const n = i === CH.length - 1 ? left : Math.min(left, Math.round(leads * w[i] / ws)); left -= n; return [k, n]; });
    const reply = leads ? Math.round(3 + r() * r() * 95) : null, grow = r() - .45;
    const weeks = Array.from({ length: 8 }, (_, i) => Math.max(0, Math.round(leads / 8 * (.6 + r() * .6) * (1 + grow * (i - 3.5) / 4))));
    return PF[l.id] = { views, leads, rate: views ? leads / views * 100 : 0, reply, ch, weeks };
  };
  const perfA = a => {
    const Ls = listingsOf(a), P = Ls.map(perfL), views = P.reduce((s, p) => s + p.views, 0), leads = P.reduce((s, p) => s + p.leads, 0);
    const rep = P.filter(p => p.reply != null), reply = rep.length ? Math.round(rep.reduce((s, p) => s + p.reply * p.leads, 0) / Math.max(1, rep.reduce((s, p) => s + p.leads, 0))) : null;
    return { Ls, views, leads, rate: views ? leads / views * 100 : 0, reply, live: Ls.filter(l => l.status === 'live').length,
      ch: CH.map(([k], i) => [k, P.reduce((s, p) => s + p.ch[i][1], 0)]), weeks: Array.from({ length: 8 }, (_, i) => P.reduce((s, p) => s + p.weeks[i], 0)) };
  };
  const median = xs => { const v = xs.slice().sort((x, y) => x - y); return v.length ? v[Math.floor(v.length / 2)] : 0; };
  // the market's middle, to say whether a provider or listing is doing better or worse than most
  const bench = () => { const P = mainApps().filter(a => a.status === 'verified').map(perfA).filter(p => p.live && p.views);
    return { rate: median(P.map(p => p.rate)), reply: median(P.filter(p => p.reply != null).map(p => p.reply)), leads: median(P.map(p => p.leads)) }; };
  // how they're doing in one word: Doing well · Needs help · No leads yet · Not live
  const health = (p, B) => !p.live ? ['Not live', 'mute'] : !p.leads ? ['No leads yet', 'warn'] : (p.rate < B.rate * .6 || p.reply > 60) ? ['Needs help', 'risk'] : (p.rate >= B.rate * 1.25 && p.reply <= B.reply) ? ['Doing well', ''] : ['On track', 'info'];
  const fmtRate = x => x ? x.toFixed(1) + '%' : '—', fmtReply = m => m == null ? '—' : m < 60 ? m + ' min' : (m / 60).toFixed(1) + ' h';
  const vs = (x, b, low) => { if (!x || !b) return ''; const d = (x - b) / b; if (Math.abs(d) < .1) return '<em class="pf-vs">about average</em>'; const good = low ? d < 0 : d > 0; return `<em class="pf-vs ${good ? 'up' : 'down'}">${d >= 1 ? `${(1 + d).toFixed(1)}× ${low ? 'as long as' : 'the'} average` : `${Math.round(Math.abs(d) * 100)}% ${low ? (d < 0 ? 'faster than' : 'slower than') : (d > 0 ? 'above' : 'below')} average`}</em>`; };
  // last 4 weeks against the 4 before, as a signed percentage (null when there's nothing to compare)
  const change = wk => { const a = wk.slice(4).reduce((x, y) => x + y, 0), b = wk.slice(0, 4).reduce((x, y) => x + y, 0); return b ? Math.round((a - b) / b * 100) : null; };
  const chg = d => d == null ? '<span class="pf-tr">—</span>' : Math.abs(d) < 5 ? '<span class="pf-tr">Steady</span>' : `<span class="pf-tr ${d > 0 ? 'up' : 'down'}">${d > 0 ? '▲' : '▼'} ${Math.abs(d)}%</span>`;
  // leads per week as labelled bars, with a one-line verdict: the last 4 weeks against the 4 before
  const weekBars = wk => {
    const max = Math.max(1, ...wk), a = wk.slice(4).reduce((x, y) => x + y, 0), b = wk.slice(0, 4).reduce((x, y) => x + y, 0), d = b ? Math.round((a - b) / b * 100) : 0;
    const verdict = !a && !b ? 'No leads yet' : Math.abs(d) < 5 ? 'Steady — about the same as the 4 weeks before' : d > 0 ? `Up ${d}% on the 4 weeks before` : `Down ${-d}% on the 4 weeks before`;
    const wkStart = i => dateS(NOW - (wk.length - i) * 7 * DAY);
    return `<div class="pf-wk"><div class="pf-wk-h"><b>Leads per week</b><span class="pf-tr ${Math.abs(d) < 5 || (!a && !b) ? '' : d > 0 ? 'up' : 'down'}">${Math.abs(d) >= 5 && (a || b) ? (d > 0 ? '▲ ' : '▼ ') : ''}${verdict}</span></div>
      <div class="pf-wk-plot">${wk.map((n, i) => `<div class="pf-wk-c ${i === wk.length - 1 ? 'now' : ''}" title="Week of ${wkStart(i)}: ${n} lead${n === 1 ? '' : 's'}"><em>${n}</em><i style="--h:${(n / max * 100).toFixed(1)}%"></i><small>${i === wk.length - 1 ? 'This week' : wkStart(i)}</small></div>`).join('')}</div></div>`;
  };
  // where leads come from: one row per channel, most first
  const chList = ch => {
    const t = ch.reduce((s, c) => s + c[1], 0); if (!t) return '';
    const max = Math.max(...ch.map(c => c[1]));
    return `<div class="pf-chs"><b>Where leads come from</b>${ch.slice().sort((x, y) => y[1] - x[1]).map(([k, n]) => { const C = CH.find(c => c[0] === k);
      return `<div class="pf-chr" title="${C[1]}: ${n} leads (${Math.round(n / t * 100)}%)"><span>${C[1]}</span><i class="pf-chb"><i style="--w:${(n / max * 100).toFixed(1)}%"></i></i><b>${n}</b><small>${Math.round(n / t * 100)}%</small></div>`; }).join('')}</div>`;
  };
  // the provider drawer's Performance section
  const perfBlockA = a => {
    const p = perfA(a), B = bench(), h = health(p, B);
    if (!p.live) return `<div class="pf-box"><div class="sect-t">Performance</div><p class="hint">No live listings yet — numbers start once one goes live.</p></div>`;
    const k = (l, v, sub) => `<div class="pf-k"><small>${l}</small><b>${v}</b>${sub || ''}</div>`;
    const lst = p.Ls.filter(l => l.status === 'live').map(l => [l, perfL(l)]).sort((x, y) => y[1].leads - x[1].leads);
    return `<div class="pf-box"><div class="sect-t">Performance <span class="pf-h ${h[1]}">${h[0]}</span><small class="pf-per">Last 30 days</small></div>
      <div class="pf-ks">${k('Views', p.views.toLocaleString())}${k('Leads', p.leads, vs(p.leads, B.leads))}${k('View → lead', fmtRate(p.rate), vs(p.rate, B.rate))}${k('First reply', fmtReply(p.reply), vs(p.reply, B.reply, true))}</div>
      <div class="pf-two">${weekBars(p.weeks)}${chList(p.ch)}</div>
      <table class="tbl pf-tbl"><thead><tr><th>Listing</th><th>Views</th><th>Leads</th><th>View → lead</th><th>Reply</th></tr></thead><tbody>
        ${lst.map(([l, q]) => `<tr class="ck" data-act="openListing" data-arg="${l.id}"><td><span class="pf-l"><img src="${esc(l.img[0])}" alt=""><span><b>${esc(l.title)}</b><small>${esc(catLabel(l.v, l.cat))}</small></span></span></td><td>${q.views.toLocaleString()}</td><td><b>${q.leads}</b></td><td>${fmtRate(q.rate)}</td><td>${fmtReply(q.reply)}</td></tr>`).join('')}</tbody></table></div>`;
  };
  // the listing drawer's Performance section, against live listings in the same category
  const perfBlockL = l => {
    const q = perfL(l), same = LST.filter(x => x.status === 'live' && x.cat === l.cat && x.id !== l.id).map(perfL);
    const B = { rate: median(same.map(x => x.rate)), reply: median(same.filter(x => x.reply != null).map(x => x.reply)), leads: median(same.map(x => x.leads)) };
    const k = (lb, v, sub) => `<div class="pf-k"><small>${lb}</small><b>${v}</b>${sub || ''}</div>`;
    return `<div class="pf-box"><div class="sect-t">Performance<small class="pf-per">Last 30 days${same.length ? ' · compared with ' + same.length + ' live ' + esc(catLabel(l.v, l.cat).toLowerCase()) + ' listings' : ''}</small></div>
      <div class="pf-ks">${k('Views', q.views.toLocaleString())}${k('Leads', q.leads, vs(q.leads, B.leads))}${k('View → lead', fmtRate(q.rate), vs(q.rate, B.rate))}${k('First reply', fmtReply(q.reply), vs(q.reply, B.reply, true))}</div>
      <div class="pf-two">${weekBars(q.weeks)}${chList(q.ch)}</div></div>`;
  };

  pages.providers = () => {
    const act = mainApps().filter(a => a.status === 'verified'), inv = invoices();
    const rows = act.map(a => { const ds = docsOf(a), nx = ds.filter(d => d.exp).sort((x, y) => x.exp - y.exp)[0], Ls = listingsOf(a), mine = inv.filter(i => i.a === a), od = mine.filter(i => i.state === 'overdue');
      const pf = perfA(a);
      return { a, ds, nx, Ls, pf, live: pf.live, leads: pf.leads, od, soon: nx && nx.exp < NOW + S.warnDays * DAY }; });
    const B = bench(); rows.forEach(r => { r.h = health(r.pf, B); });
    // two views of the same providers: how they're doing (Performance) and their plan, documents and payments (Account)
    const view = S.provView === 'account' ? 'account' : 'perf';
    const tabs = view === 'perf'
      ? [['all', 'All providers', () => true], ['top', 'Doing well', r => r.h[0] === 'Doing well'], ['help', 'Needs help', r => r.h[0] === 'Needs help' || r.h[0] === 'No leads yet'], ['quiet', 'Not live', r => !r.live]]
      : [['all', 'All providers', () => true], ['docs', 'Documents running out', r => r.soon], ['pay', 'Payment overdue', r => r.od.length], ['quiet', 'No live listing', r => !r.live]];
    const SORT = { leads: ['Most leads', (x, y) => (y.live ? y.pf.leads : -1) - (x.live ? x.pf.leads : -1)], rate: ['Best view → lead', (x, y) => y.pf.rate - x.pf.rate], slow: ['Slowest to reply', (x, y) => (y.pf.reply ?? -1) - (x.pf.reply ?? -1)], low: ['Fewest leads', (x, y) => (x.live ? x.pf.leads : 1e9) - (y.live ? y.pf.leads : 1e9)], recent: ['Newest first', (x, y) => (y.a.decided || 0) - (x.a.decided || 0)] };
    const sortK = view === 'account' ? 'recent' : SORT[S.provSort] ? S.provSort : 'leads';
    const tab = tabs.find(t => t[0] === S.provTab) || tabs[0];
    const list = rows.filter(tab[2]).filter(r => S.vf === 'all' || r.a.v === S.vf).filter(r => !S.q || [r.a.name, r.a.d.display, r.a.email].join(' ').toLowerCase().includes(S.q)).sort((x, y) => tab[0] === 'docs' ? x.nx.exp - y.nx.exp : SORT[sortK][1](x, y));
    const seg = `<div class="seg pf-seg">${[['perf', 'Performance', 'trend'], ['account', 'Plan & documents', 'doc']].map(([k, l, i]) => `<button class="${view === k ? 'on' : ''}" data-act="provView" data-arg="${k}">${ico(i)}${l}</button>`).join('')}</div>`;
    const empty = `<div class="pn ad-empty big">${ico('check')}<b>Nothing here</b><small>Try another tab or vertical.</small></div>`;
    const who = r => `<div class="li">${av(r.a.name)}<div><b>${esc(r.a.name)}${r.a.real ? ' <span class="ad-real">This browser</span>' : ''}</b><small><span class="ad-v" style="--c:${VC[r.a.v]}">${ico(VI[r.a.v])}${esc(VL[r.a.v])}</span> · ${esc(TYPE_L[r.a.type] || r.a.type)}</small></div></div>`;
    let top, body;
    if (view === 'perf') {
      const liveR = rows.filter(r => r.live), tot = liveR.reduce((s, r) => s + r.pf.leads, 0), views = liveR.reduce((s, r) => s + r.pf.views, 0), help = rows.filter(r => r.h[0] === 'Needs help' || r.h[0] === 'No leads yet').length;
      const weeks = Array.from({ length: 8 }, (_, i) => liveR.reduce((s, r) => s + r.pf.weeks[i], 0));
      const k = (l, v, sub, extra = '', cls = '') => `<div class="kpi ad-kpi static ${cls}"><small>${l}</small><b>${v}</b><span class="d">${sub}</span>${extra}</div>`;
      top = `<div class="g4 ad-kpis">${k('Leads · last 30 days', tot.toLocaleString(), `from ${liveR.length} providers with live listings`, `<span class="pf-kchg">${chg(change(weeks))} <small>vs the 4 weeks before</small></span>`)}${k('View → lead', fmtRate(views ? tot / views * 100 : 0), `${views.toLocaleString()} listing views`)}${k('Typical first reply', fmtReply(B.reply), 'Half of providers reply within this time')}${k('Need help', help, help ? 'Slow replies, few or no leads' : 'Everyone is on track', '', help ? 'pf-kwarn' : '')}</div>`;
      const max = Math.max(1, ...list.map(r => r.live ? r.pf.leads : 0));
      body = list.length ? `<div class="pn pf-board"><div class="pf-row pf-rh"><span>Provider</span><span>Leads · 30 days</span><span>View → lead</span><span>First reply</span><span>Trend</span><span></span></div>
        ${list.map((r, i) => `<div class="pf-row ck" style="--i:${i}" data-act="openProv" data-arg="${r.a.id}">${who(r)}
          <span class="pf-lead">${r.live ? `<b>${r.pf.leads}</b><i class="pf-bar"><i style="--w:${(r.pf.leads / max * 100).toFixed(1)}%"></i></i>` : '<span class="hint">No live listing</span>'}</span>
          <span>${r.live ? `<b>${fmtRate(r.pf.rate)}</b><small class="ad-sm">${r.pf.views.toLocaleString()} views</small>` : '—'}</span>
          <span class="${r.pf.reply > 60 ? 'pf-slow' : ''}">${fmtReply(r.pf.reply)}</span>
          <span title="Last 4 weeks against the 4 before">${r.live && r.pf.leads ? chg(change(r.pf.weeks)) : '<span class="pf-tr">—</span>'}</span>
          <span class="pf-end"><span class="pf-h ${r.h[1]}">${r.h[0]}</span>${ico('chevR')}</span></div>`).join('')}</div>` : empty;
    } else {
      const byPlan = S.plans.map(p => ({ p, n: act.filter(a => (a.plan || 'launch') === p.id).length }));
      top = `<div class="g4 ad-kpis">${byPlan.map(({ p, n }) => `<div class="kpi ad-kpi static"><small>${esc(p.n)} plan</small><b data-count="${n}">${n}</b><span class="d">${p.p ? `${aed(p.p)} / month each · ${n ? aed(n * p.p) + ' a month in total' : 'nobody on it yet'}` : `${aed(0)} / month · ${n ? 'not billed' : 'nobody on it yet'}`}</span><div class="ad-pbar"><i style="--w:${Math.round(n / Math.max(1, act.length) * 100)}%;--c:${p.c}"></i></div></div>`).join('')}</div>`;
      body = list.length ? `<div class="pn ad-tw"><table class="tbl ad-tbl"><thead><tr><th>Provider</th><th>Plan</th><th>Listings</th><th>Next document to renew</th><th>Payments</th><th>Since</th><th></th></tr></thead><tbody>
      ${list.map((r, i) => `<tr class="ck" style="--i:${i}" data-act="openProv" data-arg="${r.a.id}"><td>${who(r)}</td>
        <td><span class="ad-plan" data-tier="${r.a.plan || 'launch'}" style="--c:${PLAN(r.a.plan || 'launch').c}">${esc(PLAN(r.a.plan || 'launch').n)}</span></td>
        <td><b>${r.live}</b> <span class="hint">live of ${r.Ls.length}</span></td>
        <td>${r.nx ? `<span class="ad-exp ${r.nx.exp < NOW ? 'risk' : r.soon ? 'warn' : ''}">${esc(r.nx.D[0])}<small>${r.nx.exp < NOW ? 'Expired ' : ''}${dateY(r.nx.exp)}${r.nx.exp >= NOW ? ' · ' + Math.ceil((r.nx.exp - NOW) / DAY) + ' days left' : ''}</small></span>` : '—'}</td>
        <td>${PLAN(r.a.plan || 'launch').p ? (r.od.length ? st(r.od.length + ' overdue', 'risk') : st('Paid up')) : st('AED 0 plan', 'mute')}</td><td>${dateS(r.a.decided || r.a.t)}</td><td>${ico('chevR')}</td></tr>`).join('')}</tbody></table></div>` : empty;
    }
    return `${head('Providers', view === 'perf' ? 'Who’s getting leads, who replies fast, and who needs a hand.' : 'Their plan, live listings, documents and payments.', seg)}
    ${top}
    <div class="tabs mt">${tabs.map(([k, l, f]) => `<button class="${tab[0] === k ? 'on' : ''}" data-act="provTab" data-arg="${k}">${l}<span class="c">${rows.filter(f).length}</span></button>`).join('')}</div>
    <div class="fbar">${vChips(rows.map(r => r.a))}<span class="sp"></span>${view === 'perf' ? `<label class="tsel pf-sort"><select data-provsort>${Object.entries(SORT).map(([k, [l]]) => `<option value="${k}" ${k === sortK ? 'selected' : ''}>${l}</option>`).join('')}</select>${ico('chev')}</label>` : ''}<label class="ad-find">${ico('search')}<input data-q placeholder="Find a provider" value="${esc(S.q)}"></label></div>
    ${body}`;
  };
  function openProv(id) {
    const a = APPS.find(x => x.id === id); if (!a) return;
    const ds = docsOf(a), Ls = listingsOf(a), inv = invoices().filter(i => i.a === a), soon = ds.filter(d => d.exp && d.exp < NOW + S.warnDays * DAY);
    drawer(`<div class="dr-h ad-dh">${av(a.name, 'ad-avl')}<div style="flex:1;min-width:0"><h3>${esc(a.name)}</h3><small>${esc(TYPE_L[a.type] || a.type)} · ${esc(VL[a.v])} · approved ${dateS(a.decided || a.t)}</small>
      <div class="ad-dh-meta"><span class="ad-plan" data-tier="${a.plan || 'launch'}" style="--c:${PLAN(a.plan || 'launch').c}">${esc(PLAN(a.plan || 'launch').n)} plan</span><span class="hint">${Ls.filter(l => l.status === 'live').length} live listings · ${Ls.reduce((s, l) => s + (l.leads || 0), 0)} leads</span></div></div><button class="x" data-act="close">${ico('x')}</button></div>
      <div class="dr-b ad-db">
        ${soon.length ? `<p class="ad-note warn">${ico('alert')}<span><b>${soon.length} document${soon.length > 1 ? 's' : ''} to renew:</b> ${esc(soon.map(d => d.D[0] + ' (' + d.note.toLowerCase() + ')').join(', '))}</span></p>` : ''}
        ${perfBlockA(a)}
        ${planBox(a, planUse(a))}
        <div class="sect-t">Documents</div>
        ${ds.map(d => `<div class="ad-lrow static"><i class="ad-dot ${d.tone === 'ok' ? 'ok' : d.tone === 'warn' ? 'warn' : 'risk'}">${ico(d.tone === 'ok' ? 'check' : 'alert')}</i><div><b>${esc(d.D[0])}</b><small>${esc(d.exp ? (d.exp < NOW ? 'Expired ' : 'Valid to ') + dateY(d.exp) : d.note)}</small></div></div>`).join('')}
        <div class="sect-t">All listings</div>
        ${Ls.map(l => `<div class="ad-lrow" data-act="openListing" data-arg="${l.id}"><img src="${esc(l.img[0])}" alt=""><div><b>${esc(l.title)}</b><small>${esc(catLabel(l.v, l.cat))} · ${l.status === 'live' ? perfL(l).leads + ' leads · ' + fmtRate(perfL(l).rate) + ' view → lead' : esc(L_ST[l.status][0])}</small></div>${st(...L_ST[l.status])}${ico('chevR')}</div>`).join('') || '<p class="hint">No listings yet.</p>'}
        <div class="sect-t">Payments</div>
        ${inv.length ? `<table class="tbl"><tbody>${inv.slice(0, 6).map(i => `<tr><td>${dateS(i.t)}</td><td>${esc(i.plan.n)}</td><td><b>${aed(i.amt)}</b></td><td>${st(...INV_ST[i.state])}</td></tr>`).join('')}</tbody></table>` : `<p class="hint">On ${esc(PLAN(a.plan || 'launch').n)} (${aed(0)} a month) — nothing is billed.</p>`}
      </div>
      <div class="dr-f ad-df"><a class="btn btn-g btn-sm ad-fullbtn" href="provider.html?id=${encodeURIComponent(a.id)}">View full details${ico('chevR')}</a>${soon.length ? `<a class="btn btn-o btn-sm" target="_blank" rel="noopener" href="${waHref(a.phone, `Hi ${firstName(a)}, your ${soon[0].D[0]} on UpNow ${soon[0].exp < NOW ? 'has expired' : 'runs out on ' + dateY(soon[0].exp)}. Please upload the renewed one so your listings stay live.`)}">${ico('doc')}Remind to renew</a>` : ''}
        <span class="sp" style="flex:1"></span><a class="btn btn-o btn-sm" href="mailto:${esc(a.email)}">${ico('mail')}Email</a><a class="btn btn-wa btn-sm" target="_blank" rel="noopener" href="${waHref(a.phone, `Hi ${firstName(a)}, this is the UpNow team.`)}">${ico('wa')}WhatsApp</a></div>`, 'p:' + id);
  }

  /* ================= FULL DETAIL PAGES (provider.html?id= · listing.html?id=) ================= */
  // everything about one provider or listing on one page: what needs attention first, then how it's doing, then the rest
  const qid = () => new URLSearchParams(location.search).get('id') || '';
  const notFound = (what, back, label) => `<div class="pn ad-empty big">${ico('search')}<b>${what} not found</b><small>It may have been removed.</small><a class="btn btn-o btn-sm" href="${back}.html">${ico('chevL')}${label}</a></div>`;
  const crumbs = (href, label, here) => `<nav class="dt-crumb"><a href="${href}">${ico('chevL')}${esc(label)}</a><span>/</span><b>${esc(here)}</b></nav>`;
  // one problem: tone, title, what it means, and the one thing to do about it
  const issue = ([tone, t, sub, btn]) => `<div class="dt-is ${tone}"><i>${ico(tone === 'risk' ? 'alert' : tone === 'warn' ? 'clock' : 'check')}</i><div><b>${t}</b><small>${sub}</small></div>${btn || ''}</div>`;
  const issuesBox = (L, okText) => `<section class="pn dt-card" id="top-iss"><div class="dt-h"><h2>What needs attention</h2>${L.length ? `<span class="pf-h ${L.some(x => x[0] === 'risk') ? 'risk' : 'warn'}">${L.length} to look at</span>` : ''}</div>
    ${L.length ? `<div class="dt-iss">${L.map(issue).join('')}</div>` : `<div class="dt-iss">${issue(['ok', 'Nothing needs attention', okText])}</div>`}</section>`;
  const waBtn = (a, text, label = 'WhatsApp them') => `<a class="btn btn-o btn-sm" target="_blank" rel="noopener" href="${waHref(a.phone, text)}">${ico('wa')}${label}</a>`;
  const kpis = (p, B) => `<div class="pf-ks dt-ks">${[['Views', p.views.toLocaleString(), ''], ['Leads', p.leads, vs(p.leads, B.leads)], ['View → lead', fmtRate(p.rate), vs(p.rate, B.rate)], ['First reply', fmtReply(p.reply), vs(p.reply, B.reply, true)]].map(([l, v, s]) => `<div class="pf-k"><small>${l}</small><b>${v}</b>${s}</div>`).join('')}</div>`;

  // a sticky bar at the bottom of a detail page with the same decisions as the review panel (same confirm, same next-request flow)
  const decBar = (why, btns) => `<div class="dt-dec">${why || ''}<div class="dt-dec-b">${btns}</div></div>`;
  const tone4 = t => ({ ok: 'check', warn: 'alert', fail: 'x', todo: 'clock' })[t];
  const checksUl = cs => `<ul class="ad-checks">${cs.map((c, i) => `<li class="${c.tone}" style="--i:${i}"><i>${ico(tone4(c.tone))}</i><span><b>${esc(c.t)}</b>${c.sub ? `<small>${esc(c.sub)}</small>` : ''}</span></li>`).join('')}</ul>`;
  // why a decision can't be made yet — on the page it scrolls to the open points at the top
  const whyLine = (cs, verb) => { const f = cs.find(c => c.tone === 'fail'), t = cs.find(c => c.tone === 'todo'); return f ? `<a class="ad-why risk" href="#top-iss">${ico('alert')}<span><b>Can’t ${verb} yet:</b> ${esc(f.t)}</span><u>Show me</u></a>` : t ? `<a class="ad-why todo" href="#top-iss">${ico('clock')}<span><b>Can’t ${verb} yet:</b> ${esc(t.t)}</span><u>Show me</u></a>` : ''; };
  const afterPaint = () => setTimeout(() => { const v = $('#view'); if (v) thumbs(v); }, 0);

  /* ---------- documents on a full page (provider.html): wide cards, two per row, a big preview ---------- */
  function docsWide(a, ds) {
    const up = ds.filter(x => x.f), chk = up.filter(x => x.checked).length, exp = up.filter(x => x.exp).sort((x, y) => x.exp - y.exp);
    const bad = up.filter(x => x.exp && x.exp < NOW), soon = up.filter(x => x.exp && x.exp >= NOW && x.exp < NOW + S.warnDays * DAY), miss = ds.filter(x => !x.f);
    const next = exp.find(x => x.exp >= NOW);
    const chip = (tone, icon, t) => `<span class="dc-chip ${tone}">${ico(icon)}${t}</span>`;
    const head = `<div class="dc-sum">${chip('', 'doc', `${up.length} document${up.length === 1 ? '' : 's'}`)}
      ${miss.length ? chip('risk', 'x', `${miss.length} missing`) : bad.length ? chip('risk', 'alert', `${bad.length} expired`) : soon.length ? chip('warn', 'clock', `${soon.length} running out`) : chip('ok', 'check', 'All in date')}
      ${next ? chip('', 'clock', `Next renewal: ${esc(next.D[0])} · ${dateY(next.exp)}`) : ''}
      ${chip(chk === up.length && up.length ? 'ok' : '', 'shield', `${chk} of ${up.length} checked by the team`)}</div>`;
    const status = x => !x.f ? ['risk', 'Not uploaded'] : x.exp && x.exp < NOW ? ['risk', 'Expired ' + dateY(x.exp)] : x.exp && x.exp < NOW + S.warnDays * DAY ? ['warn', `Runs out in ${Math.ceil((x.exp - NOW) / DAY)} days`] : x.tone === 'warn' ? ['warn', 'Not confirmed by the provider'] : x.exp ? ['ok', 'Valid to ' + dateY(x.exp)] : ['ok', 'On file'];
    const card = x => { const [tone, say] = status(x), d = a.d;
      return `<article class="dc ${x.tone} ${x.f && !x.checked ? 'ad-unck' : ''}" data-k="${x.k}">
        ${x.f ? `<button type="button" class="dc-prev ad-thumb" data-act="viewDoc" data-arg="${a.id}|${x.k}" data-thumb="${a.id}|${x.k}" aria-label="Open ${esc(x.D[0])}"><span class="ad-thumb-load"></span></button>` : `<div class="dc-prev is-none">${ico('upload')}<span>Not uploaded yet</span></div>`}
        <div class="dc-b"><div class="dc-h"><span class="dc-ic">${ico(WHO.includes(x.k) ? 'user' : 'doc')}</span><div><b>${esc(x.D[0])}</b><small>${x.f ? esc(x.f.name || 'Uploaded') : 'Waiting for the provider'}</small></div>
            <span class="dc-st ${tone}">${esc(say)}</span></div>
          ${x.f ? `<dl class="dc-kv">${x.D[2].map(([k, l, ty]) => { const v = d[k], un = a.src[k] === 'check', ex = ty === 'date' && expOf(v), fl = ex && ex < NOW ? ['bad', 'Expired'] : ex && ex < NOW + S.warnDays * DAY ? ['soon', 'Runs out soon'] : un ? ['un', 'Hard to read'] : null;
              return `<div class="${fl ? fl[0] : ''}"><dt>${esc(l)}</dt><dd>${esc(ty === 'date' && ex ? dateY(ex) : v || '—')}${fl ? `<em>${fl[1]}</em>` : ''}</dd></div>`; }).join('')}</dl>` : ''}
          <div class="dc-f"><span class="dc-where">${ico('search')}How to check: <b>${esc(x.D[1])}</b></span>
            ${x.f && isWaiting(a) ? `<label class="ad-mark ${x.checked ? 'on' : ''}"><input type="checkbox" data-doccheck="${a.id}|${x.k}" ${x.checked ? 'checked' : ''}>${ico('check')}<span>${x.checked ? 'Checked' : 'Mark checked'}</span></label>`
              : x.f ? `<span class="dc-chk ${x.checked ? 'on' : ''}">${ico(x.checked ? 'check' : 'clock')}${x.checked ? 'Checked by the team' + (x.checkedAt ? ' · ' + dateS(x.checkedAt) : '') : 'Not checked yet'}</span>` : ''}</div></div></article>`; };
    return `${head}${isWaiting(a) ? `<p class="ad-hint">${ico('search')}Open each document, check it with the issuing authority, then mark it checked.</p>` : ''}<div class="dc-grid">${ds.map(card).join('')}</div>`;
  }
  pages.provider = () => {
    const a = APPS.find(x => x.id === qid()); if (!a) return notFound('Provider', 'providers', 'Providers');
    const p = perfA(a), B = bench(), h = health(p, B), ds = docsOf(a), d = a.d, inv = invoices().filter(i => i.a === a), plan = PLAN(a.plan || 'launch');
    const used = p.Ls.filter(l => l.status !== 'rejected').length, fn = firstName(a), waiting = isWaiting(a), cs = appChecks(a);
    afterPaint();
    // the problems, worst first — for a request, the checks still to do come first
    const I = [];
    if (waiting) {
      cs.filter(c => c.tone === 'fail').forEach(c => I.push(['risk', esc(c.t), esc(c.sub || ''), '']));
      cs.filter(c => c.tone === 'warn').forEach(c => I.push(['warn', esc(c.t), esc(c.sub || ''), '']));
      const left = ds.filter(x => x.f && !x.checked).length;
      if (left) I.push(['warn', `${left} document${left > 1 ? 's' : ''} still to check`, 'Open each one below, check it with the issuing authority, then mark it checked.', `<a class="btn btn-o btn-sm" href="#dt-docs">Go to documents</a>`]);
    } else if (a.status !== 'verified') I.push(['warn', APP_ST[a.status][0], esc(a.reason || ''), '']);
    if (a.status === 'verified' && !p.live) I.push(['risk', 'No live listing', 'Customers can’t find them, so no leads come in.', waBtn(a, `Hi ${fn}, this is the UpNow team. You don’t have a live listing yet — can we help you add one?`)]);
    if (p.live && !p.leads) I.push(['risk', 'No leads in 30 days', `${p.views.toLocaleString()} people saw their listings but nobody contacted them. Photos, price or title may be the reason.`, waBtn(a, `Hi ${fn}, this is the UpNow team. Your listings got views but no enquiries this month — we have a few tips to help.`)]);
    if (p.reply != null && p.reply > 60) I.push(['risk', `Slow to reply — ${fmtReply(p.reply)} on average`, `Most providers reply in ${fmtReply(B.reply)}. Customers often go to whoever answers first.`, waBtn(a, `Hi ${fn}, this is the UpNow team. Customers are waiting about ${fmtReply(p.reply)} for a first reply — replying within 15 minutes wins far more of them.`)]);
    if (p.leads && p.rate < B.rate * .6) I.push(['warn', `Few views turn into leads — ${fmtRate(p.rate)}`, `Typical is ${fmtRate(B.rate)}. Better photos, a clear price and a fuller description usually help.`, '']);
    p.Ls.filter(l => l.status === 'live').forEach(l => { const q = perfL(l); if (q.views > 800 && q.rate < B.rate * .5) I.push(['warn', `“${esc(l.title)}” gets views but few leads`, `${q.views.toLocaleString()} views, ${q.leads} leads (${fmtRate(q.rate)}).`, `<a class="btn btn-o btn-sm" href="listing.html?id=${encodeURIComponent(l.id)}">Open listing</a>`]); });
    p.Ls.filter(l => ['changes', 'rejected'].includes(l.status)).forEach(l => I.push(['warn', `“${esc(l.title)}” — ${esc(L_ST[l.status][0].toLowerCase())}`, esc(l.reason || ''), `<a class="btn btn-o btn-sm" href="listing.html?id=${encodeURIComponent(l.id)}">Open listing</a>`]));
    if (!waiting) ds.filter(x => x.exp && x.exp < NOW + S.warnDays * DAY).forEach(x => I.push([x.exp < NOW ? 'risk' : 'warn', `${esc(x.D[0])} ${x.exp < NOW ? 'has expired' : 'runs out ' + dateY(x.exp)}`, x.exp < NOW ? 'Their listings may have to come down until it’s renewed.' : Math.ceil((x.exp - NOW) / DAY) + ' days left.', waBtn(a, `Hi ${fn}, your ${x.D[0]} on UpNow ${x.exp < NOW ? 'has expired' : 'runs out on ' + dateY(x.exp)}. Please upload the renewed one so your listings stay live.`, 'Remind')]));
    const od = inv.filter(i => i.state === 'overdue'); if (od.length) I.push(['risk', `${od.length} payment${od.length > 1 ? 's' : ''} overdue`, `${aed(od.reduce((s, i) => s + i.amt, 0))} on the ${esc(plan.n)} plan.`, `<a class="btn btn-o btn-sm" href="income.html">Open income</a>`]);
    if (used > plan.max) I.push(['warn', 'Over their plan limit', `${used} listings on ${esc(plan.n)} (up to ${plan.max}).`, '']);
    const lst = p.Ls.slice().sort((x, y) => perfL(y).leads - perfL(x).leads || (x.status === 'live' ? -1 : 1));
    const docsFull = `<section class="pn dt-card" id="dt-docs"><div class="dt-h"><h2>Documents</h2></div>${docsWide(a, ds)}</section>`;
    return `${crumbs(waiting ? 'applications.html' : 'providers.html', waiting ? 'Provider requests' : 'Providers', a.name)}
    <section class="pn dt-hero">${av(a.name, 'ad-avl dt-av')}<div class="dt-hero-t"><h1>${esc(a.name)}</h1>
        <p>${esc(TYPE_L[a.type] || a.type)} · ${a.role === 'company' ? 'Company' : 'Individual'} · <span class="ad-v" style="--c:${VC[a.v]}">${ico(VI[a.v])}${esc(VL[a.v])}</span> · ${a.status === 'verified' ? 'approved ' + dateS(a.decided || a.t) : 'sent ' + dateS(a.t)}</p>
        <div class="dt-tags">${a.status === 'verified' ? `<span class="pf-h ${h[1]}">${h[0]}</span><span class="ad-plan" data-tier="${plan.id}" style="--c:${plan.c}">${esc(plan.n)} plan</span><span class="hint">${p.live} live of ${p.Ls.length} listings</span>` : `${st(...APP_ST[a.status])}${waiting ? `<span class="ad-sla ${NOW - a.t > S.sla * 36e5 ? 'late' : ''}">${ico('clock')}Waiting ${ago(a.t)}</span>` : ''}`}</div></div>
      <div class="dt-acts"><a class="btn btn-o btn-sm" href="mailto:${esc(a.email)}">${ico('mail')}Email</a><a class="btn btn-wa btn-sm" target="_blank" rel="noopener" href="${waHref(a.phone, `Hi ${fn}, this is the UpNow team.`)}">${ico('wa')}WhatsApp</a></div></section>
    ${issuesBox(I, waiting ? 'Every check passed and every document is checked — ready to approve.' : 'Listings are live, leads are coming in and documents are in date.')}
    ${waiting ? `${docsFull}
    <section class="pn dt-card"><div class="dt-h"><h2>All checks</h2><small>${cs.filter(c => c.tone === 'ok').length} of ${cs.length} fine</small></div>${checksUl(cs)}</section>
    <div class="dt-cols">
      <section class="pn dt-card"><div class="dt-h"><h2>What they want to list</h2></div><div class="ad-can">${a.cats.map(c => { const g = GATE[c], need = g && g(a), has = !need || a.docs[need]; return `<div class="${has ? 'ok' : 'warn'}"><i>${ico(has ? 'check' : 'clock')}</i><span><b>${esc(catLabel(a.v, c))}</b><small>${has ? 'Covered by their ' + (a.role === 'company' ? 'licence' : 'documents') : 'Waits for ' + DOCS[need][0]}</small></span></div>`; }).join('')}</div>
        <p class="hint" style="margin:10px 0 0">${esc(TYPE_L[a.type] || a.type)}${a.size ? ' · business size: ' + esc(a.size) : ''}${d.activity ? ' · licence activity: “' + esc(d.activity) + '”' : ''}</p></section>
      <section class="pn dt-card"><div class="dt-h"><h2>What customers will see</h2></div><div class="ad-prof">${av(d.display || a.name, 'ad-avl')}<div><b>${esc(d.display || a.name)}</b><small>${esc((d.langs || []).join(', ') || 'English')}</small>${d.bio ? `<p>${esc(d.bio)}</p>` : ''}</div></div>
        <dl class="ad-rows" style="margin-top:12px"><div><dt>Mobile</dt><dd>${esc(a.phone)}</dd></div><div><dt>Email</dt><dd>${esc(a.email || '—')}</dd></div></dl></section>
    </div>` : ''}
    ${a.status === 'verified' ? `<section class="pn dt-card"><div class="dt-h"><h2>How they’re doing</h2><small>Last 30 days · compared with the typical provider</small></div>
      ${p.live ? `${kpis(p, B)}<div class="pf-two dt-two">${weekBars(p.weeks)}${chList(p.ch) || '<div class="pf-chs"><b>Where leads come from</b><p class="hint">No leads yet.</p></div>'}</div>` : '<p class="hint">Numbers start once a listing is live.</p>'}</section>` : ''}
    <section class="pn dt-card"><div class="dt-h"><h2>Listings</h2><small>${p.Ls.length - p.live ? `${p.live} live · ${p.Ls.length - p.live} not live yet` : `all ${p.live} live`}</small></div>
      ${lst.length ? `<table class="tbl pf-tbl dt-tbl"><thead><tr><th>Listing</th><th>Status</th><th>Views</th><th>Leads</th><th>View → lead</th><th>Reply</th><th>Trend</th><th></th></tr></thead><tbody>
        ${lst.map(l => { const q = perfL(l), live = l.status === 'live'; return `<tr class="ck" onclick="location.href='listing.html?id=${encodeURIComponent(l.id)}'"><td><span class="pf-l"><img src="${esc(l.img[0])}" alt=""><span><b>${esc(l.title)}</b><small>${esc(catLabel(l.v, l.cat))}${l.loc ? ' · ' + esc(areaN(l.loc)) : ''}</small></span></span></td><td>${st(...L_ST[l.status])}</td><td>${live ? q.views.toLocaleString() : '—'}</td><td><b>${live ? q.leads : '—'}</b></td><td>${live ? fmtRate(q.rate) : '—'}</td><td>${live ? fmtReply(q.reply) : '—'}</td><td>${live && q.leads ? chg(change(q.weeks)) : '—'}</td><td>${ico('chevR')}</td></tr>`; }).join('')}</tbody></table>` : `<p class="hint">${waiting ? 'They chose to add their first listing later.' : 'No listings yet.'}</p>`}</section>
    ${waiting ? '' : `${docsFull}
    <section class="pn dt-card"><div class="dt-h"><h2>Contact</h2></div><dl class="ad-rows"><div><dt>Mobile</dt><dd>${esc(a.phone)}</dd></div><div><dt>Email</dt><dd>${esc(a.email || '—')}</dd></div><div><dt>Shown to customers as</dt><dd>${esc(d.display || a.name)}</dd></div><div><dt>Languages</dt><dd>${esc((d.langs || []).join(', ') || 'English')}</dd></div></dl></section>`}
    <section class="pn dt-card">${planBox(a, a.status === 'verified' ? planUse(a) : 'Starts when they’re approved. You can pick it now or later. ' + planUse(a))}</section>
    ${a.status === 'verified' ? `<section class="pn dt-card" id="dt-pay"><div class="dt-h"><h2>Payments</h2></div>${inv.length ? `<table class="tbl"><tbody>${inv.slice(0, 12).map(i => `<tr><td>${dateS(i.t)}</td><td>${esc(i.plan.n)}</td><td><b>${aed(i.amt)}</b></td><td>${st(...INV_ST[i.state])}</td></tr>`).join('')}</tbody></table>` : `<p class="hint">On ${esc(PLAN(a.plan || 'launch').n)} (${aed(0)} a month) — nothing is billed.</p>`}</section>` : ''}
    ${waiting ? decBar(whyLine(cs, 'approve'), `<button class="btn btn-g" data-act="approveApp" data-arg="${a.id}" ${cs.some(c => c.tone === 'fail' || c.tone === 'todo') ? 'disabled title="Finish the checks first"' : ''}>${ico('check')}Approve</button><button class="btn btn-o" data-act="changesApp" data-arg="${a.id}">${ico('edit')}Ask for changes</button><button class="btn btn-o ad-danger" data-act="rejectApp" data-arg="${a.id}">${ico('x')}Reject</button>`) : ''}`;
  };

  pages.listing = () => {
    const l = LST.find(x => x.id === qid()); if (!l) return notFound('Listing', 'listings', 'Listing requests');
    const a = appOf(l) || {}, q = perfL(l), live = l.status === 'live', waiting = isWaitingL(l), cs = listingChecks(l), man = manualL(l), tick = ticksOf(l);
    afterPaint();
    const peers = LST.filter(x => x.status === 'live' && x.cat === l.cat), P = peers.map(perfL);
    const B = { rate: median(P.map(x => x.rate)), reply: median(P.filter(x => x.reply != null).map(x => x.reply)), leads: median(P.map(x => x.leads)), views: median(P.map(x => x.views)) };
    const rank = live ? peers.slice().sort((x, y) => perfL(y).leads - perfL(x).leads).findIndex(x => x.id === l.id) + 1 : 0, cat = catLabel(l.v, l.cat).toLowerCase();
    // every open point, worst first: failed checks, things to look at, checks still to do, then how it performs
    const I = [];
    if (l.reason && ['changes', 'rejected'].includes(l.status)) I.push(['warn', L_ST[l.status][0], esc(l.reason), '']);
    cs.filter(c => c.tone === 'fail').forEach(c => I.push(['risk', esc(c.t), esc(c.sub || ''), '']));
    cs.filter(c => c.tone === 'warn').forEach(c => I.push(['warn', esc(c.t), esc(c.sub || ''), '']));
    cs.filter(c => c.tone === 'todo').forEach(c => I.push(['warn', esc(c.t), esc(c.sub || ''), waiting ? `<a class="btn btn-o btn-sm" href="#dt-review">Tick them</a>` : '']));
    if (live && !q.leads) I.push(['risk', 'No leads in 30 days', `${q.views.toLocaleString()} views and nobody got in touch.`, '']);
    if (live && q.leads && q.rate < B.rate * .6) I.push(['warn', `Few views turn into leads — ${fmtRate(q.rate)}`, `Similar ${esc(cat)} listings get ${fmtRate(B.rate)}. Check the first photo, the price and the title.`, '']);
    if (live && q.reply != null && q.reply > 60) I.push(['risk', `Slow first reply — ${fmtReply(q.reply)}`, `Similar listings reply in ${fmtReply(B.reply)}.`, '']);
    if (l.photos < 5) I.push(['warn', `Only ${l.photos} photo${l.photos === 1 ? '' : 's'}`, 'Listings with 5 or more photos get more enquiries.', '']);
    if (!l.desc || l.desc.length < 80) I.push(['warn', 'Short description', 'A few lines about what’s included help customers decide.', '']);
    const cmp = [['Views', q.views.toLocaleString(), B.views.toLocaleString()], ['Leads', q.leads, B.leads], ['View → lead', fmtRate(q.rate), fmtRate(B.rate)], ['First reply', fmtReply(q.reply), fmtReply(B.reply)]];
    const imgs = [...new Set(l.img)];
    return `${crumbs(waiting ? 'listings.html' : a.id ? 'provider.html?id=' + encodeURIComponent(a.id) : 'listings.html', waiting ? 'Listing requests' : a.name || 'Listing requests', l.title)}
    <section class="pn dt-hero dt-lhero"><button type="button" class="dt-cover" data-act="viewPhotos" data-arg="${l.id}|0"><img src="${esc(l.img[0])}" alt=""><span>${ico('image')}${l.photos}</span></button><div class="dt-hero-t"><h1>${esc(l.title)}</h1>
        <p>${esc(catLabel(l.v, l.cat))} · ${esc(VL[l.v])}${l.loc ? ' · ' + esc(areaN(l.loc)) : ''} · by ${a.id ? `<a class="dt-link" href="provider.html?id=${encodeURIComponent(a.id)}">${esc(a.name)}</a>` : '—'}</p>
        <div class="dt-tags">${st(...L_ST[l.status])}<b class="ad-price">${l.price ? aed(l.price) : 'No price'}${l.basis ? ` <small>/ ${esc(l.basis)}</small>` : ''}</b>${waiting ? `<span class="ad-sla ${NOW - l.t > S.sla * 36e5 ? 'late' : ''}">${ico('clock')}Waiting ${ago(l.t)}</span>` : ''}${rank ? `<span class="hint">${rank === 1 ? 'Most leads' : '#' + rank + ' by leads'} of ${peers.length} live ${esc(cat)} listings</span>` : ''}</div></div></section>
    ${issuesBox(I, live ? 'Leads are coming in and the listing passes every check.' : 'Every check passed and the team has ticked theirs — ready to decide.')}
    ${waiting || live ? `<section class="pn dt-card" id="dt-review"><div class="dt-h"><h2>Your checks</h2><small>${man.filter(([k]) => tick[k]).length} of ${man.length} ticked · tick each one once you’ve looked</small></div>
      <div class="ad-man">${man.map(([k, t]) => `<label class="ad-tick wide"><input type="checkbox" data-lcheck="${l.id}|${k}" ${tick[k] ? 'checked' : ''}><span>${ico('check')}</span>${esc(t)}</label>`).join('')}</div></section>` : ''}
    <div class="dt-cols dt-cols-l">
      <section class="pn dt-card"><div class="dt-h"><h2>Photos</h2><small>${l.photos}</small><button type="button" class="ad-full" data-act="viewPhotos" data-arg="${l.id}|0">See all ${l.photos}${ico('chevR')}</button></div>
        <div class="dt-ph">${imgs.slice(0, 6).map((src, i) => `<img src="${esc(src)}" alt="" data-act="viewPhotos" data-arg="${l.id}|${i}">`).join('')}</div></section>
      <section class="pn dt-card"><div class="dt-h"><h2>What the listing says</h2></div><p class="ad-desc">${esc(l.desc || 'No description')}</p>
        <dl class="ad-rows">${[['Category', catLabel(l.v, l.cat)], ['Price', l.price ? aed(l.price) + (l.basis ? ' / ' + l.basis : '') : 'No price'], ['Where', [l.building, l.loc && areaN(l.loc)].filter(Boolean).join(', ') || 'Areas they cover'], ['Permit', l.permit || '—'], ['Photos', l.photos], ['Sent', dateS(l.t)], ...(l.decided ? [['Decided', dateS(l.decided)]] : [])].map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></section>
    </div>
    <section class="pn dt-card"><div class="dt-h"><h2>All checks</h2><small>${cs.filter(c => c.tone === 'ok').length} of ${cs.length} fine</small></div>${checksUl(cs)}</section>
    ${live ? `<section class="pn dt-card"><div class="dt-h"><h2>How it’s doing</h2><small>Last 30 days${peers.length > 1 ? ` · compared with ${peers.length - 1} other live ${esc(cat)} listings` : ''}</small></div>
      ${kpis(q, B)}<div class="pf-two dt-two">${weekBars(q.weeks)}${chList(q.ch) || '<div class="pf-chs"><b>Where leads come from</b><p class="hint">No leads yet.</p></div>'}</div>
      <table class="tbl dt-cmp"><thead><tr><th></th><th>This listing</th><th>Typical ${esc(cat)} listing</th></tr></thead><tbody>${cmp.map(([k, x, y]) => `<tr><td>${k}</td><td><b>${x}</b></td><td>${y}</td></tr>`).join('')}</tbody></table></section>` : ''}
    ${a.id ? `<section class="pn dt-card"><div class="dt-h"><h2>Provider</h2></div><a class="ad-lrow" href="provider.html?id=${encodeURIComponent(a.id)}">${av(a.name)}<div><b>${esc(a.name)}</b><small>${esc(TYPE_L[a.type] || a.type || '')} · ${esc(PLAN(a.plan || 'launch').n)} plan · ${planUse(a)}</small></div>${st(...APP_ST[a.status || 'submitted'])}${ico('chevR')}</a></section>` : ''}
    ${waiting ? decBar(whyLine(cs, 'put it live'), `<button class="btn btn-g" data-act="liveL" data-arg="${l.id}" ${cs.some(c => c.tone === 'fail' || c.tone === 'todo') ? 'disabled title="Finish the checks first"' : ''}>${ico('check')}Put it live</button><button class="btn btn-o" data-act="changesL" data-arg="${l.id}">${ico('edit')}Ask for changes</button><button class="btn btn-o ad-danger" data-act="rejectL" data-arg="${l.id}">${ico('x')}Not approve</button>`)
      : live ? decBar('', `<button class="btn btn-o" data-act="changesL" data-arg="${l.id}">${ico('edit')}Take down and ask for changes</button>`) : ''}`;
  };

  /* ================= INCOME ================= */
  const INV_ST = { paid: ['Paid', ''], due: ['Due', 'warn'], overdue: ['Overdue', 'risk'] };
  pages.income = () => {
    const inv = invoices(), act = mainApps().filter(a => a.status === 'verified');
    const coll = inv.filter(i => i.paid && inP(i.paid)), out = inv.filter(i => !i.paid), od = inv.filter(i => i.state === 'overdue');
    const paying = act.filter(a => PLAN(a.plan || 'launch').p > 0);
    const weeks = [...Array(12)].map((_, i) => { const e = NOW - (11 - i) * 7 * DAY, s = e - 7 * DAY; return { l: dateS(s), v: inv.filter(x => x.paid >= s && x.paid < e).reduce((t, x) => t + x.amt, 0) }; });
    const mxW = Math.max(...weeks.map(w => w.v), 1);
    const planMix = S.plans.filter(p => p.p).map(p => ({ c: p.c, v: act.filter(a => (a.plan || 'launch') === p.id).length * p.p, n: p.n, k: act.filter(a => (a.plan || 'launch') === p.id).length }));
    const byV = Object.keys(VL).map(v => ({ l: VL[v], ico: VI[v], c: VC[v], v: act.filter(a => a.v === v).reduce((s, a) => s + PLAN(a.plan || 'launch').p, 0), sub: act.filter(a => a.v === v).length + ' providers' })).filter(r => r.sub !== '0 providers').sort((a, b) => b.v - a.v);
    return `${head('Income', 'UpNow charges providers a monthly plan to list. Customers never pay — they contact providers directly.', periodSeg())}
    <div class="g4 ad-kpis">
      <div class="kpi ad-kpi static"><small>Monthly plans (MRR)</small><b data-count="${mrr()}" data-pre="AED ">${aed(mrr())}</b><span class="d">${paying.length} paying · ${act.length - paying.length} on Launch (${aed(0)}, not billed)</span>${spark(weeks.map(w => w.v))}</div>
      <div class="kpi ad-kpi static"><small>Collected ${esc(pLabel())}</small><b data-count="${coll.reduce((s, i) => s + i.amt, 0)}" data-pre="AED ">${aed(coll.reduce((s, i) => s + i.amt, 0))}</b><span class="d">${coll.length} payments</span>${spark(weeks.map(w => w.v))}</div>
      <div class="kpi ad-kpi static"><small>Due, not late yet</small><b data-count="${out.filter(i => i.state === 'due').reduce((s, i) => s + i.amt, 0)}" data-pre="AED ">${aed(out.filter(i => i.state === 'due').reduce((s, i) => s + i.amt, 0))}</b><span class="d" style="color:var(--amber)">${out.length - od.length} payment${out.length - od.length === 1 ? '' : 's'} due within 7 days</span></div>
      <div class="kpi ad-kpi static"><small>Overdue</small><b data-count="${od.reduce((s, i) => s + i.amt, 0)}" data-pre="AED ">${aed(od.reduce((s, i) => s + i.amt, 0))}</b><span class="d" style="color:var(--red)">${od.length} provider${od.length === 1 ? '' : 's'} more than 7 days late</span></div>
    </div>
    <div class="gd mt">
      <section class="pn"><div class="pn-h"><h2>Collected per week</h2><span class="sub">Last 12 weeks</span></div>
        <div class="ad-wk">${weeks.map((w, i) => `<div style="--i:${i}"><em>${w.v ? (w.v >= 1000 ? (w.v / 1000).toFixed(1) + 'k' : w.v) : ''}</em><i style="--h:${Math.max(2, w.v / mxW * 100)}%"></i><small>${i % 2 ? '' : esc(w.l)}</small></div>`).join('')}</div></section>
      <section class="pn"><div class="pn-h"><h2>Where it comes from</h2><span class="sub">Monthly plans</span></div>
        <div class="ad-mix">${donut(planMix, (mrr() >= 1000 ? (mrr() / 1000).toFixed(1) + 'k' : mrr()), 'AED a month')}<div class="ad-mix-l">${planMix.map(p => `<div><i style="background:${p.c}"></i><span><b>${esc(p.n)}</b><small>${p.k} providers</small></span><b>${aed(p.v)}</b></div>`).join('')}</div></div>
        <div class="sect-t">By vertical</div>${hbars(byV.map(r => Object.assign(r, { f: aed })))}</section>
    </div>
    ${payments(inv)}`;
  };
  // Payments: one row per monthly bill. Tabs by state, verticals and search like the other pages;
  // a row opens the provider's page at their payments; Remind and Mark paid say what the provider is told.
  const PAY_M = { bank: 'Bank transfer', card: 'Card', cash: 'Cash', cheque: 'Cheque' };
  const daysTxt = ms => { const n = Math.max(1, Math.round(ms / DAY)); return n + ' day' + (n === 1 ? '' : 's'); };
  const payNote = i => i.paid ? `Paid ${dateS(i.paid)}${((S.payMeta || {})[i.id] || {}).method ? ' · ' + PAY_M[S.payMeta[i.id].method] : ''}` : i.state === 'overdue' ? `${daysTxt(NOW - i.due)} late` : `Due in ${daysTxt(i.due - NOW)}`;
  const remindTxt = i => `Hi ${firstName(i.a)}, a friendly reminder from UpNow: your ${i.plan.n} plan (${aed(i.amt)}) billed on ${dateS(i.t)} ${i.state === 'overdue' ? 'is now ' + daysTxt(NOW - i.due) + ' overdue' : 'is due by ' + dateS(i.due)}. Reply here if you have any questions. Thank you!`;
  const receiptTxt = (i, m) => `Hi ${firstName(i.a)}, thank you — we’ve received your payment of ${aed(i.amt)} for your UpNow ${i.plan.n} plan (billed ${dateS(i.t)}), paid by ${PAY_M[m].toLowerCase()}. Your listings stay live.`;
  function payments(inv) {
    const T = [['overdue', 'Overdue', i => i.state === 'overdue'], ['due', 'Due soon', i => i.state === 'due'], ['paid', 'Paid', i => i.paid], ['all', 'All', () => true]];
    const tab = T.find(t => t[0] === S.payTab) || (inv.some(i => i.state === 'overdue') ? T[0] : T[3]);
    const vf = i => S.vf === 'all' || i.a.v === S.vf, qf = i => !S.q || [i.a.name, i.a.email, i.plan.n].join(' ').toLowerCase().includes(S.q);
    const list = inv.filter(tab[2]).filter(vf).filter(qf).sort((x, y) => tab[0] === 'overdue' ? x.due - y.due : tab[0] === 'due' ? x.due - y.due : (y.paid || y.t) - (x.paid || x.t)).slice(0, 60);
    const rem = S.reminded || {};
    return `<section class="pn mt" id="payments"><div class="pn-h"><h2>Payments</h2><span class="sub">Billed monthly from the day a provider is approved · due within 7 days</span></div>
      <div class="tabs">${T.map(([k, l, f]) => `<button class="${tab[0] === k ? 'on' : ''}" data-act="payTab" data-arg="${k}">${l}<span class="c">${inv.filter(f).filter(vf).length}</span></button>`).join('')}</div>
      <div class="fbar">${vChips(inv.filter(tab[2]).map(i => i.a))}<span class="sp"></span><label class="ad-find">${ico('search')}<input data-q placeholder="Find a provider" value="${esc(S.q)}"></label></div>
      ${list.length ? `<div class="ad-tw"><table class="tbl ad-tbl pay-tbl"><thead><tr><th>Provider</th><th>Plan</th><th>Billed</th><th>Amount</th><th>Status</th><th></th></tr></thead><tbody>
      ${list.map((i, k) => `<tr class="ck" style="--i:${k}" onclick="if(!event.target.closest('a,button'))location.href='provider.html?id=${encodeURIComponent(i.a.id)}#dt-pay'"><td><div class="li">${av(i.a.name, 'sm')}<div><b>${esc(i.a.name)}</b><small>${esc(VL[i.a.v])}</small></div></div></td>
        <td><span class="ad-plan" data-tier="${i.plan.id}" style="--c:${i.plan.c}">${esc(i.plan.n)}</span></td><td>${dateS(i.t)}</td><td><b>${aed(i.amt)}</b></td>
        <td>${st(...INV_ST[i.state])}<small class="ad-sm ${i.state === 'overdue' ? 'pay-late' : ''}">${esc(payNote(i))}</small>${!i.paid && rem[i.id] ? `<small class="ad-sm">Reminded ${NOW - rem[i.id] < 6e4 || Date.now() - rem[i.id] < 6e4 ? 'just now' : ago(rem[i.id]) + ' ago'}</small>` : ''}</td>
        <td><div class="pay-acts">${i.paid ? `<a class="btn btn-o btn-sm" href="provider.html?id=${encodeURIComponent(i.a.id)}#dt-pay">View provider${ico('chevR')}</a>` : `<button class="btn btn-o btn-sm" data-act="remindPay" data-arg="${i.id}">${ico('wa')}${rem[i.id] ? 'Remind again' : 'Remind'}</button><button class="btn btn-g btn-sm" data-act="markPaid" data-arg="${i.id}">${ico('check')}Mark paid</button>`}</div></td></tr>`).join('')}
      </tbody></table></div>` : `<div class="ad-empty">${ico('check')}<b>${tab[0] === 'overdue' ? 'Nobody is late' : 'Nothing here'}</b><small>${tab[0] === 'overdue' ? 'Every bill is paid or still within its 7 days.' : 'Try another tab or vertical.'}</small></div>`}</section>`;
  }

  /* ================= SETTINGS ================= */
  pages.settings = () => {
    const s = session(), adm = (window.SITE && SITE.admin) || {};
    return `${head('Settings', 'Who can get in, what providers pay and how fast the team reviews.')}
    <div class="g2">
      <section class="pn"><div class="pn-h"><h2>Admin access</h2></div>
        <div class="ad-acc"><span class="ad-acc-i">${ico('lock')}</span><div><small>The admin number</small><b>${esc(adm.dial || '')} ${esc(fmtAdm(adm.phone || ''))}</b><p class="hint">Sign in on the UpNow website with this number, like any customer. It opens this dashboard — never a customer account. Change it in <code>data/site.js</code> (SITE.admin).</p></div></div>
        <div class="kv"><div><span>Signed in</span><b>${s ? dateS(s.since) + ', ' + new Date(s.since).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—'}</b></div><div><span>On this device</span><b>Yes</b></div></div>
        <button class="btn btn-o" data-act="signout">${ico('out')}Sign out</button></section>
      <section class="pn"><div class="pn-h"><h2>Review rules</h2></div>
        <div class="fld"><label>Review target (hours)</label><input type="number" min="1" max="96" value="${S.sla}" data-set="sla"><small class="hint">Providers are told “usually within 24 hours”. Requests older than this turn red.</small></div>
        <div class="fld"><label>Warn about documents running out within (days)</label><input type="number" min="7" max="180" value="${S.warnDays}" data-set="warnDays"></div></section>
    </div>
    <section class="pn mt"><div class="pn-h"><h2>Plans and prices</h2><span class="sub">What providers pay UpNow each month · AED</span><span class="sp"></span><a data-act="resetPlans">Reset</a></div>
      <div class="ad-tw"><table class="tbl ad-tbl"><thead><tr><th>Plan</th><th>Price / month</th><th>Listings</th><th>For</th><th>Providers</th></tr></thead><tbody>
      ${S.plans.map((p, i) => `<tr><td><span class="ad-plan" data-tier="${p.id}" style="--c:${p.c}">${esc(p.n)}</span></td><td><input class="ad-in" type="number" min="0" value="${p.p}" data-plan-p="${i}"></td><td><input class="ad-in" type="number" min="1" value="${p.max}" data-plan-m="${i}"></td><td class="hint">${esc(p.note)}</td><td>${mainApps().filter(a => a.status === 'verified' && (a.plan || 'launch') === p.id).length}</td></tr>`).join('')}
      </tbody></table></div><p class="hint" style="margin:10px 0 0">These prices are placeholders — set the real ones before you start charging. Changing a price changes what the Income page expects from now on.</p></section>`;
  };

  /* ---------- sign-in (only the admin number) ---------- */
  function gate() {
    const adm = (window.SITE && SITE.admin) || { dial: '+971', phone: '' };
    document.body.classList.add('ad-gate-on');
    $('.app').innerHTML = `<div class="ad-gate"><div class="ad-gate-card"><a class="logo" href="../../index.html"><b>U</b><span>UpNow</span><small class="pro ad-pro">Admin</small></a>
      <span class="ad-gate-i">${ico('lock')}</span><h1>Team sign-in</h1><p>Only the UpNow admin number can open this dashboard.</p>
      <div class="fld"><label>Mobile number</label><div class="ad-ph-in"><span>🇦🇪 ${esc(adm.dial)}</span><input data-gphone inputmode="tel" placeholder="50 000 0001" autocomplete="tel-national"></div></div>
      <div class="fld ad-code" hidden><label>6-digit code</label><input data-gcode inputmode="numeric" maxlength="6" placeholder="••••••"><small class="hint">Prototype: any 6 digits work.</small></div>
      <p class="ad-gerr" hidden></p><button class="btn btn-g" data-act="gateGo">Send code${ico('chevR')}</button>
      <a class="text-link ad-back" href="../../index.html">Back to UpNow</a></div></div>`;
    const ph = $('[data-gphone]'); ph.focus();
    $('.app').addEventListener('keydown', e => { if (e.key === 'Enter') { const b = $('[data-act=gateGo]'); if (b) b.click(); } });
  }
  function gateGo() {
    const adm = SITE.admin, ph = digits($('[data-gphone]').value), code = $('.ad-code'), err = $('.ad-gerr');
    const fail = m => { err.textContent = m; err.hidden = false; };
    if (ph !== adm.phone) return fail('This number isn’t the UpNow admin number.');
    if (code.hidden) { code.hidden = false; err.hidden = true; $('[data-act=gateGo]').innerHTML = 'Sign in' + ico('chevR'); $('[data-gcode]').focus(); return; }
    if (!/^\d{6}$/.test($('[data-gcode]').value)) return fail('Enter all 6 digits of the code.');
    D.write(PFX + '.admin', { dial: adm.dial, phone: adm.phone, since: Date.now() }); location.reload();
  }

  /* ---------- render ---------- */
  function render() {
    build(); shell();
    const v = $('#view'); v.className = 'view ad-view pg-' + PAGE; v.innerHTML = (pages[PAGE] || pages.index)();
    // the detail pages are named after what they show
    const one = PAGE === 'provider' ? (APPS.find(x => x.id === qid()) || {}).name : PAGE === 'listing' ? (LST.find(x => x.id === qid()) || {}).title : '';
    document.title = 'UpNow Admin · ' + (one || (NAV().find(n => n[0] === PAGE) || [, PAGE === 'provider' ? 'Provider' : PAGE === 'listing' ? 'Listing' : 'Overview'])[1]);
    countUp(v);
    const ps = $('[data-provsort]', v); if (ps) ps.onchange = e => acts.provSort(e.target.value);
    const q = $('[data-q]', v); if (q) q.oninput = e => { S.q = e.target.value.toLowerCase(); clearTimeout(q._t); q._t = setTimeout(() => { const pos = e.target.selectionStart; render(); const n = $('[data-q]'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }, 200); };
  }
  // after a decision: redraw the page, and the drawer if one is open
  function refresh() { const k = drawerFor, sc = $('#view').scrollTop, db = $('#drawer .dr-b'), ds = db ? db.scrollTop : 0; render(); $('#view').scrollTop = sc; v2(k); const n = $('#drawer .dr-b'); if (n) { n.classList.add('ad-still'); n.scrollTop = ds; } }
  const v2 = k => { if (!k) return; const [t, id] = [k.slice(0, 1), k.slice(2)]; ({ a: openApp, l: openListing, p: openProv })[t](id); };
  const openFromHash = () => { const h = location.hash.slice(1); if (/^(a|l|p):/.test(h)) v2(h); };

  /* ---------- actions ---------- */
  const acts = {
    period: k => { S.period = k; save(); render(); }, appTab: k => { S.appTab = k; save(); render(); }, lstTab: k => { S.lstTab = k; save(); render(); }, provTab: k => { S.provTab = k; save(); render(); }, provSort: k => { S.provSort = k; save(); render(); }, bigDrawer: () => { S.big = !S.big; save(); const d = $('#drawer'); d.classList.toggle('ad-big', S.big); const b = $('.ad-big-btn', d); if (b) b.outerHTML = bigBtn(); }, provView: k => { S.provView = k; S.provTab = 'all'; save(); render(); },
    vf: v => { S.vf = v; save(); render(); }, close: closeDrawer, closeModal,
    openApp: id => { const a = APPS.find(x => x.id === id); if (a && a.status === 'verified' && PAGE === 'providers') openProv(id); else openApp(id); }, openListing, openProv,
    approveApp: id => decide('approveApp', id), changesApp: id => decide('changesApp', id), rejectApp: id => decide('rejectApp', id),
    liveL: id => decide('liveL', id), changesL: id => decide('changesL', id), rejectL: id => decide('rejectL', id), confirmDec,
    suggestPlan, sugSend, sugWithdraw,
    setPlan: arg => { const [id, p] = arg.split('|'), a = APPS.find(x => x.id === id); S.planOf[id] = p; save(); if (a && a.real) { const j = D.read(PFX + '.join'); if (j && j.review) { j.review.plan = p; D.write(PFX + '.join', j); } } toast(`${a ? a.name : 'Provider'} is on ${PLAN(p).n}`); refresh(); },
    viewDoc: arg => { const [id, k] = arg.split('|'), a = APPS.find(x => x.id === id); if (!a) return; const items = docItems(a), i = Math.max(0, docsOf(a).filter(x => x.f).findIndex(x => x.k === k)); viewer(items, i); },
    viewPhotos: arg => { const [id, i] = arg.split('|'), l = LST.find(x => x.id === id); if (l) viewer(photoItems(l), +i || 0); },
    nextReq: (arg, el, e, back) => { const [k, id] = arg.split('|'), q = queue(k), i = q.findIndex(z => z.id === id); if (q.length < 2) return; const z = q[(i + (back ? q.length - 1 : 1)) % q.length]; openOf(k)(z.id); },
    jumpTo: what => { const box = $('#drawer .dr-b'); if (!box) return;
      const el = what === 'fail' ? $('#drawer .ad-doc.fail') || $('#drawer .ad-checks li.fail') : $('#drawer .ad-doc.ad-unck') || $('#drawer .ad-man .ad-tick:not(:has(input:checked))') || $('#drawer .ad-checks li.todo');
      if (!el) return; box.scrollTo({ top: el.offsetTop - 12, behavior: calm ? 'auto' : 'smooth' }); el.classList.remove('ad-flash'); void el.offsetWidth; el.classList.add('ad-flash'); },
    payTab: k => { S.payTab = k; save(); render(); },
    // a reminder goes out on WhatsApp (they press send) and is remembered, so nobody chases twice
    remindPay: id => { const i = invoices().find(x => x.id === id); if (!i) return; (S.reminded = S.reminded || {})[id] = Date.now(); save(); window.open(waHref(i.a.phone, remindTxt(i)), '_blank', 'noopener'); toast('Reminder opened in WhatsApp — press send'); refresh(); },
    // mark paid: how they paid, and a receipt on WhatsApp if wanted
    markPaid: id => { const i = invoices().find(x => x.id === id); if (!i) return;
      modal(`<div class="ad-dm-h"><span class="ad-dm-i is-ok">${ico('check')}</span><div><h3>Mark as paid?</h3><small>${esc(i.a.name)} · ${esc(i.plan.n)} plan · ${aed(i.amt)} billed ${dateS(i.t)}</small></div><button class="x" data-act="closeModal" aria-label="Close">${ico('x')}</button></div>
        <div class="ad-dm-b"><p class="ad-dm-lead">How did they pay?</p><div class="pay-m">${Object.entries(PAY_M).map(([k, l], n) => `<label><input type="radio" name="paym" value="${k}" ${n ? '' : 'checked'}><span>${esc(l)}</span></label>`).join('')}</div>
          <div class="ad-tell"><label class="ad-switch"><input type="checkbox" data-payrc checked><i></i><span><b>Send ${esc(firstName(i.a))} a receipt on WhatsApp</b><small>Opens WhatsApp with this message — you press send</small></span></label>
          <div class="ad-wa"><div class="ad-wa-b" data-payprev data-aed>${esc(receiptTxt(i, 'bank'))}</div></div></div></div>
        <div class="ad-dm-f"><button class="btn btn-o" data-act="closeModal">Cancel</button><button class="btn btn-g" data-act="confirmPaid" data-arg="${i.id}">${ico('check')}Mark paid</button></div>`, 'ad-dm');
      $$('#scrim [name=paym]').forEach(r => r.onchange = () => { $('#scrim [data-payprev]').textContent = receiptTxt(i, r.value); }); },
    confirmPaid: id => { const i = invoices().find(x => x.id === id); if (!i) return; const m = ($('#scrim [name=paym]:checked') || {}).value || 'bank', send = ($('#scrim [data-payrc]') || {}).checked;
      S.paid[id] = Date.now(); (S.payMeta = S.payMeta || {})[id] = { method: m, t: Date.now(), receipt: !!send }; save(); closeModal();
      if (send) window.open(waHref(i.a.phone, receiptTxt(i, m)), '_blank', 'noopener');
      toast(`${i.a.name} marked as paid${send ? ' · receipt opened in WhatsApp' : ''}`); refresh(); },
    resetPlans: () => { S.plans = JSON.parse(JSON.stringify(D.PLANS0)); save(); render(); toast('Plans reset'); },
    signout: () => { localStorage.removeItem(PFX + '.admin'); location.href = '../../index.html'; },
    gateGo
  };
  document.addEventListener('click', e => {
    const pl = e.target.closest('[data-plan]'); if (pl) { $$('[data-plan]', pl.parentNode).forEach(b => b.classList.toggle('on', b === pl)); decPreview(); return; }
    const g = e.target.closest('[data-go]'); if (g) { go(g.dataset.go); return; }
    const a = e.target.closest('[data-act]'); if (a && !a.disabled) { const f = acts[a.dataset.act]; if (f) { e.preventDefault(); f(a.dataset.arg, a, e); } }
  });
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.name === 'rs') { const own = $('[data-own]'); if (own && !t.value) setTimeout(() => own.focus(), 0); decPreview(); sugPreview(); return; }
    if (t.dataset.doccheck) { const [id, k] = t.dataset.doccheck.split('|'); (S.checks[id] = S.checks[id] || {})[k] = t.checked ? Date.now() : false; save(); refresh(); return; }
    if (t.dataset.lcheck) { const [id, k] = t.dataset.lcheck.split('|'); (S.lchecks[id] = S.lchecks[id] || {})[k] = t.checked; save(); refresh(); return; }
    if (t.dataset.set) { const v = Math.max(+t.min, Math.min(+t.max, +t.value || 0)); S[t.dataset.set] = v; save(); render(); toast('Saved'); return; }
    if (t.dataset.planP != null) { S.plans[+t.dataset.planP].p = Math.max(0, +t.value || 0); save(); render(); toast('Price saved'); return; }
    if (t.dataset.planM != null) { S.plans[+t.dataset.planM].max = Math.max(1, +t.value || 1); save(); render(); toast('Saved'); }
  });
  document.addEventListener('input', e => { if (e.target.matches('[data-own]')) { decPreview(); sugPreview(); } });
  document.addEventListener('keydown', e => {
    if (VW) { if (e.key === 'Escape') closeViewer(); else if (e.key === 'ArrowRight' && VW.items.length > 1) { VW.i = (VW.i + 1) % VW.items.length; VW.zoom = 1; VW.rot = 0; paintViewer(); } else if (e.key === 'ArrowLeft' && VW.items.length > 1) { VW.i = (VW.i - 1 + VW.items.length) % VW.items.length; VW.zoom = 1; VW.rot = 0; paintViewer(); } return; }
    if (e.key === 'Escape') { closeModal(); closeDrawer(); return; }
    // review shortcuts: only with a request open, no dialog on top, and not while typing
    if (!drawerFor || $('#scrim').classList.contains('on') || e.metaKey || e.ctrlKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test((e.target || {}).tagName || '')) return;
    const [t, id] = [drawerFor.slice(0, 1), drawerFor.slice(2)]; if (t !== 'a' && t !== 'l') return;
    const key = e.key.toLowerCase(), btn = sel => $('#drawer ' + sel);
    if (key === 'a') { const b = btn('[data-act=approveApp], [data-act=liveL]'); if (b && !b.disabled) { e.preventDefault(); b.click(); } else if (b) { e.preventDefault(); acts.jumpTo($('#drawer .ad-checks li.fail') ? 'fail' : 'todo'); toast('Can’t ' + (t === 'a' ? 'approve' : 'put it live') + ' yet — see the highlighted item'); } }
    else if (key === 'c') { const b = btn('[data-act=changesApp], [data-act=changesL]'); if (b) { e.preventDefault(); b.click(); } }
    else if (key === 'r') { const b = btn('[data-act=rejectApp], [data-act=rejectL]'); if (b) { e.preventDefault(); b.click(); } }
    else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); acts.nextReq(t + '|' + id, null, null, e.key === 'ArrowLeft'); } });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-vw]'); if (!b || !VW) return; e.preventDefault(); e.stopPropagation();
    const k = b.dataset.vw, img = $('#adv .adv-img img');
    const setZ = z => { VW.zoom = Math.max(.25, Math.min(4, z)); if (img) img.style.setProperty('--z', VW.zoom); $('#adv [data-vw=fit]').textContent = Math.round(VW.zoom * 100) + '%'; };
    if (k === 'close') closeViewer();
    else if (k === 'in') setZ(VW.zoom * 1.25); else if (k === 'out') setZ(VW.zoom / 1.25); else if (k === 'fit') setZ(1);
    else if (k === 'rot') { VW.rot = (VW.rot + 90) % 360; if (img) img.style.setProperty('--r', VW.rot + 'deg'); }
    else if (k === 'goto') { VW.i = +b.dataset.arg; VW.zoom = 1; VW.rot = 0; paintViewer(); }
    else if (k === 'done') { closeViewer(); const btn = $('#drawer [data-act=approveApp], #drawer [data-act=liveL]'); if (btn && !btn.disabled) { btn.classList.remove('ad-nudge'); void btn.offsetWidth; btn.classList.add('ad-nudge'); btn.focus({ preventScroll: true }); } }
    else if (k === 'next' || k === 'prev') { VW.i = (VW.i + (k === 'next' ? 1 : -1) + VW.items.length) % VW.items.length; VW.zoom = 1; VW.rot = 0; paintViewer(); }
    else if (k === 'check' || k === 'lcheck') { const [id, key] = b.dataset.arg.split('|'), M = k === 'check' ? S.checks : S.lchecks; (M[id] = M[id] || {})[key] = (M[id] || {})[key] ? false : Date.now(); save(); refresh();
      // the items close over the old data: rebuild them for the same position
      const keep = VW.i; if (k === 'check') VW.items = docItems(APPS.find(x => x.id === id)); else VW.items = photoItems(LST.find(x => x.id === id)); VW.i = keep;
      $('#adv .adv-side').innerHTML = VW.items[VW.i].side(); toast(M[id][key] ? 'Marked as checked' : 'Unmarked'); }
  }, true);
  document.addEventListener('click', e => { if (VW && e.target.id === 'adv') closeViewer(); });
  $('#dscrim').onclick = e => { if (e.target.id === 'dscrim') closeDrawer(); };
  $('#scrim').onclick = e => { if (e.target.id === 'scrim') closeModal(); };
  // the provider (another tab) may send or change something: pick it up
  window.addEventListener('storage', e => { if (e.key && (e.key === PFX + '.join' || e.key.startsWith(PFX + '.listings@'))) refresh(); });

  // ?tab= deep links (from the overview strip)
  { const t = new URLSearchParams(location.search).get('tab'); if (t) { if (PAGE === 'providers') S.provTab = t; if (PAGE === 'applications') S.appTab = t; if (PAGE === 'listings') S.lstTab = t; } }
  if (!session()) gate(); else { render(); openFromHash(); }
})();
