/* Customer activity — what the admin's Customers page shows (pages/admin/js/customers.js).
   Load last on every customer page. It only watches: it hooks the site's own state (saved listings, enquiries, saved
   searches, follows — js/core/utils.js store.set) and the sign-in event (upnow:auth), and adds visits, where the visitor
   came from, page views and searches. Nothing on the page changes.

   A visitor is a random id kept in this browser; a visit ends after 30 minutes without activity. Someone without an
   account stays anonymous. Country: the account's phone code when signed in, otherwise the device's time zone (then
   its language) — never GPS. Prototype: events are kept in this browser ('upnow.track'); in production they go to the
   server, which can also add the city from the network address.

   Event: { t, vid, sid, uid, k, … }   k: visit · page · search · view · prov · save · unsave · alert · follow ·
   contact (ch: call | wa | email | sms | chat) · signup · login · logout */
(function () {
  const U = window.UPUI, S0 = window.SITE; if (!U || !U.store || !S0) return;
  const P = S0.storageKey || 'upnow', KEY = P + '.track', MAX = 3000, IDLE = 30 * 60000;
  const read = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const rid = () => Math.random().toString(36).slice(2, 10).toUpperCase();

  // who: this browser, this visit, and the account if signed in
  let vid = localStorage.getItem(P + '.vid'); if (!vid) { vid = 'V' + rid(); localStorage.setItem(P + '.vid', vid); }
  const user = () => read(P + '.user');
  const uidOf = u => u ? (u.phone ? (u.dial || '') + u.phone : String(u.email || '').toLowerCase()) : '';

  // where: the account's phone country, else the time zone, else the browser language
  const TZ = { 'Asia/Dubai': 'AE', 'Asia/Riyadh': 'SA', 'Asia/Qatar': 'QA', 'Asia/Muscat': 'OM', 'Asia/Kuwait': 'KW', 'Asia/Bahrain': 'BH', 'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN',
    'Asia/Karachi': 'PK', 'Asia/Dhaka': 'BD', 'Asia/Colombo': 'LK', 'Asia/Kathmandu': 'NP', 'Asia/Manila': 'PH', 'Africa/Cairo': 'EG', 'Asia/Amman': 'JO', 'Asia/Beirut': 'LB',
    'Europe/London': 'GB', 'Europe/Dublin': 'IE', 'Europe/Paris': 'FR', 'Europe/Berlin': 'DE', 'Europe/Moscow': 'RU', 'Europe/Istanbul': 'TR', 'Australia/Sydney': 'AU',
    'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US', 'America/Los_Angeles': 'US', 'America/Toronto': 'CA', 'Asia/Singapore': 'SG', 'Asia/Shanghai': 'CN' };
  function where() {
    const u = user(); if (u && u.iso) return { cc: u.iso, by: 'phone' };
    let tz = ''; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    if (TZ[tz]) return { cc: TZ[tz], by: 'timezone', tz };
    const m = String(navigator.language || '').match(/-([A-Z]{2})$/i); return m ? { cc: m[1].toUpperCase(), by: 'language' } : { cc: '', by: '' };
  }
  // how they arrived: a campaign tag, the referring site, or typed / bookmarked
  function source() {
    const q = new URLSearchParams(location.search), utm = q.get('utm_source'); if (utm) return utm.toLowerCase();
    let host = ''; try { host = document.referrer ? new URL(document.referrer).hostname : ''; } catch (e) {}
    if (!host || host === location.hostname) return 'direct';
    const M = [['google', 'google'], ['bing', 'bing'], ['instagram', 'instagram'], ['facebook', 'facebook'], ['fb.', 'facebook'], ['tiktok', 'tiktok'], ['whatsapp', 'whatsapp'], ['wa.me', 'whatsapp'], ['t.co', 'x'], ['twitter', 'x'], ['linkedin', 'linkedin'], ['youtube', 'youtube']];
    const hit = M.find(([k]) => host.includes(k)); return hit ? hit[1] : host.replace(/^www\./, '');
  }
  const device = () => /iPad|Tablet/i.test(navigator.userAgent) ? 'tablet' : /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop';

  // a visit: new after 30 minutes without activity (shared across tabs)
  let sess = read(P + '.sess');
  const now = Date.now(), fresh = !sess || now - sess.last > IDLE;
  if (fresh) sess = { id: 'S' + rid(), last: now, n: ((read(P + '.sess') || {}).n || 0) + 1 };
  const touch = () => { sess.last = Date.now(); write(P + '.sess', sess); };

  function log(k, data) {
    const u = user(), e = Object.assign({ t: Date.now(), vid, sid: sess.id, k }, data || {});
    if (u) { e.uid = uidOf(u); if (u.name) e.name = u.name; }
    const all = read(KEY) || []; all.push(e); if (all.length > MAX) all.splice(0, all.length - MAX); write(KEY, all); touch();
  }

  // what page, and what it's about
  const file = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '') || 'index';
  const PAGE = { index: 'home', search: 'search', listing: 'listing', provider: 'provider', agency: 'agency', account: 'account' }[file] || file;
  const qs = new URLSearchParams(location.search);
  if (fresh) { const w = where(); log('visit', { src: source(), dev: device(), cc: w.cc, ccBy: w.by, tz: w.tz || '', lang: (U.prefs || {}).lang || '', cur: (U.prefs || {}).cur || '', land: PAGE, n: sess.n }); }
  log('page', { p: PAGE });
  const searchOf = q => ({ v: q.get('v') || '', o: q.get('o') || '', loc: (q.get('loc') || '').split(',').filter(Boolean), q: q.get('q') || '' });
  let lastSearch = '';
  const logSearch = q => { const s = searchOf(q), key = JSON.stringify(s); if (key === lastSearch || (!s.v && !s.q)) return; lastSearch = key; log('search', s); };
  if (PAGE === 'search') logSearch(qs);
  if (PAGE === 'listing' && qs.get('id') && qs.get('preview') !== '1') { const l = U.byId && U.byId(qs.get('id')); log('view', { lid: qs.get('id'), v: l ? l.v : '', cat: l ? l.cat : '', loc: l ? l.loc : '', provider: l ? l.provider.name : '', price: l ? l.price : 0 }); }
  if (PAGE === 'provider' && qs.get('p')) log('prov', { n: qs.get('p'), kind: 'agent' });
  if (PAGE === 'agency' && qs.get('a')) log('prov', { n: qs.get('a'), kind: 'agency' });
  // the search page keeps its filters in the address bar: follow them as they change
  if (PAGE === 'search') ['pushState', 'replaceState'].forEach(m => { const o = history[m]; history[m] = function () { const r = o.apply(this, arguments); clearTimeout(logSearch._t); logSearch._t = setTimeout(() => logSearch(new URLSearchParams(location.search)), 1200); return r; }; });

  // the site's own state: a new enquiry, a saved listing, a saved search, a follow
  const set0 = U.store.set;
  U.store.set = function (k, v) {
    let before = null; try { before = U.store.get(k); } catch (e) {}
    const r = set0.apply(this, arguments);
    try {
      if (k === 'leads' && Array.isArray(v)) {
        const had = new Set((before || []).map(x => x.id)), add = v.filter(x => !had.has(x.id));
        // a bulk add is the account page's "preview with sample activity", not someone contacting anyone
        if (add.length && add.length <= 2) add.forEach(x => log('contact', { ch: x.type === 'whatsapp' ? 'wa' : x.type, lid: x.lid, provider: x.provider, org: x.org, v: (U.byId && U.byId(x.lid) || {}).v || '', cat: x.cat, title: x.title }));
      }
      if (k === 'favs' && Array.isArray(v)) {
        const b = new Set(before || []), a = new Set(v);
        if (v.length - b.size <= 2) { v.filter(id => !b.has(id)).forEach(id => { const l = U.byId && U.byId(id); log('save', { lid: id, v: l ? l.v : '', cat: l ? l.cat : '', provider: l ? l.provider.name : '' }); });
          [...b].filter(id => !a.has(id)).forEach(id => log('unsave', { lid: id })); }
      }
      if (k === 'alerts' && Array.isArray(v) && v.length === (before || []).length + 1) { const s = v[0] || {}; log('alert', { label: s.label || s.title || '', v: s.v || '' }); }
      if (k === 'follows' && Array.isArray(v) && v.length === (before || []).length + 1) { const f = v[0] || {}; log('follow', { n: f.n, kind: f.k }); }
    } catch (e) {}
    return r;
  };
  // signing in, creating an account, signing out
  document.addEventListener('upnow:auth', e => {
    const u = e.detail;
    if (!u) return log('logout');
    let how = 'login'; try { how = U.store.get('session') === 'signup' ? 'signup' : 'login'; } catch (er) {}
    log(how, { name: u.name || '', cc: u.iso || '', via: u.via || '' });
  });
})();
