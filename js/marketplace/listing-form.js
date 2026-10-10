/* The listing form — shared by onboarding's step 4 "Your first listing" (js/pages/join.js) and the Create listing page
   for every listing after that (js/pages/listing-new.js). Exposed as window.UPLF.
   The provider's application ('upnow.join') gives the vertical, the categories, the business type, the licences and the
   public profile, so nothing is asked twice: a listing asks only what belongs to it. Its fields come from the category's
   own definition in data/listings.js (search buckets such as "2+" become exact numbers), and the values are kept in the
   shape the category's title, card and detail code expect — so the real search card draws a listing as it is typed.
   Submitting never publishes: a listing waits for its category licence ("Add later" in onboarding), then for the
   provider's verification, then the team reviews it (Live · Changes requested · Not approved).
   Every control carries a data-ln-* attribute so it never collides with the host page's own handlers. */
(function () {
  const { VERTICALS, offerOf, areaName, AREAS } = UP;
  const U = UPUI, { ico, esc, toast, auth, store } = U;

  /* ---------- the provider's application (read only) ---------- */
  function app() {
    const u = auth.user(); if (!u) return null;
    try { const d = JSON.parse(localStorage.getItem('upnow.join') || 'null'); return d && (!d.owner || d.owner === (u.email || u.dial + u.phone)) ? d : null; } catch (e) { return null; }
  }
  const isBiz = a => !!a && a.role === 'company';

  /* ---------- listings (per account, store 'listings') ---------- */
  // one list per account (this site's store is shared by everyone signed in on the browser)
  const key = () => { const u = auth.user(); return 'listings' + (u ? '@' + (u.email || (u.dial || '') + u.phone) : ''); };
  const load = () => Object.assign({ items: [], verified: false }, store.get(key()) || {});
  let db = load();
  // browsers keep about 5 MB per site: a save can fail when there are many photos
  const save = () => { try { store.set(key(), db); return true; } catch (e) { return false; } };
  const byId = id => db.items.find(x => x.id === id);
  // the provider counts as verified once the team approves the application (prototype: a simulated approval); with a
  // business type (v), that type too: one added later (the application's \`more\`, js/pages/join.js) is approved on its own
  const verified = v => {
    const a = app(), main = !!(a && (a.status === 'approved' || a.status === 'verified')) || !!db.verified;
    if (!main || !v || !a || v === a.v) return main;
    const more = (a.more || []).filter(t => t.v === v);
    return !more.length || more.some(t => t.status === 'approved');
  };

  /* ---------- the category decides the form ---------- */
  const NOUN = { spaces: 'property', services: 'service', experiences: 'experience', memberships: 'plan', programs: 'program', health: 'service', insurance: 'plan' };
  const CAT_NOUN = { venue: 'venue', court: 'court', yacht: 'yacht', holiday: 'home', land: 'plot' };
  const noun = (v, c) => CAT_NOUN[c] || NOUN[v] || 'listing';
  // where the listing is: a fixed place, the areas a service covers, a meeting point, or nowhere (cover for all UAE)
  const locKind = O => O.locAll || O.id === 'credits' ? 'none' : O.coverage ? 'area' : ['safari', 'tour'].includes(O.id) ? 'meet' : 'place';
  // photos needed to submit — the minimum; listings like theirs do best with a few more (Airbnb asks 5, Bayut suggests 6–10)
  const MIN_PHOTOS = { land: 3, court: 3, photography: 6, design: 6, makeup: 6, nursery: 5, school: 5, camp: 5 };
  const minPhotos = (v, O) => O.tile ? 0 : MIN_PHOTOS[O.id] != null ? MIN_PHOTOS[O.id] : ({ spaces: 5, experiences: 5 })[v] || 3;
  const MAX_PHOTOS = 12;
  // fields that belong with the price rather than the details
  const PRICE_IDS = ['term', 'billing', 'cheques', 'minNights', 'cancellation', 'deductible', 'copay'];
  // not facts about a listing: the listing page doesn't show them (search-only time of day, derived or platform values)
  const SKIP = ['price', 'rating', 'listedBy', 'verified', 'time'];
  const OPTIONAL_IDS = ['amenities', 'equipment', 'facilities', 'food', 'activities', 'classes', 'insurance', 'meals'];
  function fieldOf(d) {
    const key = d.field || d.id;
    let probe; try { probe = d.gen ? d.gen({ amenities: [], ptype: '', beds: 1, access: 'single' }) : undefined; } catch (e) { probe = undefined; }
    if (d.type === 'range') return { d, key, kind: 'number', label: d.label, unit: d.unit === 'sqft' ? 'sqft' : '', req: true };
    if (d.type === 'toggle') return { d, key, kind: 'bool', label: d.label, req: false };
    if (d.type === 'select' && d.test && !d.many) return { d, key, kind: 'number', label: d.label, req: true };
    if (d.type === 'seg') return { d, key, kind: 'one', arr: Array.isArray(probe), label: d.label, req: true };
    const many = Array.isArray(probe) ? true : probe !== undefined ? false : d.type === 'multi' || !!d.many;
    const num = typeof (Array.isArray(probe) ? probe[0] : probe) === 'number';
    return { d, key, kind: many ? 'many' : 'one', num, label: d.label, req: !OPTIONAL_IDS.includes(d.id), max: d.k };
  }
  // dates (stored as 'avail'; the search engine turns them into lists) are asked once, as availability with the price
  const isDate = d => d.type === 'date' || d.field === 'avail';
  const fieldsOf = O => O.defs.filter(d => !SKIP.includes(d.id) && !d.get && !isDate(d)).map(fieldOf);
  const detailFields = O => fieldsOf(O).filter(f => !PRICE_IDS.includes(f.d.id));
  const priceFields = O => fieldsOf(O).filter(f => PRICE_IDS.includes(f.d.id));
  const dateDef = O => O.defs.find(d => isDate(d) && !d.noMatch);
  const priceDef = O => O.defs.find(d => d.id === 'price') || { label: 'Price' };
  // a per-listing permit: every property ad in Dubai needs a DLD permit (Trakheesi); a holiday home needs its unit permit
  const permitOf = O => O.lease ? { label: 'DLD advertising permit number', hint: 'The Trakheesi permit for this unit. Every property ad in Dubai needs one.', ok: v => /^\d{6,12}$/.test(v), msg: 'Enter the permit number — 6 to 12 digits' }
    : O.id === 'holiday' ? { label: 'Holiday home permit number', hint: 'The DET permit for this unit.', ok: v => /^[A-Za-z0-9-]{4,20}$/.test(v), msg: 'Enter the permit number from DET' } : null;
  // licences onboarding lets them add later ("those listings stay in draft"): listings in that category wait for them
  const GATE = { holiday: a => isBiz(a) ? 'hhCo' : 'hhIndiv', yacht: () => 'yacht', venue: () => 'venue', safari: () => 'safari', gym: () => 'reps' };
  const DOC_NAME = { hhCo: 'holiday homes operator licence', hhIndiv: 'holiday home licence', yacht: 'marine craft licence', venue: 'venue activity licence', safari: 'desert safari permit', reps: 'REPs trainer registration' };
  function gateOf(cat) {
    const a = app(), f = GATE[cat]; if (!a || !f) return null;
    // the licence may have come with the application or with a business type added later
    const id = f(a), d = [a.docs || {}, ...(a.more || []).map(t => t.docs || {})].map(x => x[id]).find(x => x && x.state === 'read' && x.ok) || (a.docs || {})[id];
    return d && d.state === 'read' && d.ok ? null : { id, t: DOC_NAME[id] };
  }
  const gateName = cat => { const a = app(), f = GATE[cat]; return a && f ? DOC_NAME[f(a)] : ''; };
  // availability: a date for most; for services, health and experiences also the days they work
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const HOURS = [['9-18', '9 AM – 6 PM'], ['9-22', '9 AM – 10 PM'], ['24', '24/7']];
  const weekly = v => ['services', 'health', 'experiences'].includes(v);
  const CONTACT_RX = /(\+?\d[\d\s-]{7,}\d)|(https?:\/\/|www\.)|([a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,})/i;
  const STATUS = {
    draft: ['Draft', 'is-muted'], licence: ['Waiting for licence', 'is-warning'], verify: ['Waiting for verification', 'is-warning'],
    review: ['In review', 'is-info'], changes: ['Changes requested', 'is-danger'], live: ['Live', 'is-success'], rejected: ['Not approved', 'is-danger']
  };

  /* ---------- a listing ---------- */
  // the preview before any photo is added: a quiet frame, never another listing's picture
  const NO_PHOTO = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#eef7f2"/><g fill="none" stroke="#25946a" stroke-width="6" stroke-linejoin="round"><rect x="150" y="105" width="100" height="78" rx="10"/><path d="M150 168l28-26 22 20 16-12 34 22"/></g><circle cx="226" cy="128" r="8" fill="#e0a526"/><text x="200" y="222" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="17" font-weight="600" fill="#0f4f36">Your photos appear here</text></svg>');
  function blank(v, cat, extra) {
    const a = app() || {};
    return Object.assign({ id: 'P' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), v, cat, a: {}, title: '', titled: false, desc: '', img: [], loc: '', building: '', unit: '', areas: [], meet: '',
      price: '', deposit: '', from: '', days: [...DAYS], hours: a.hours || '9-22', permit: '', status: 'draft', step: 1, created: Date.now(), updated: Date.now(), history: [] }, extra || {});
  }
  function create(v, cat, extra) { const L = blank(v, cat, extra); L.title = suggestedTitle(L); db.items.push(L); save(); return L; }
  const remove = id => { db.items = db.items.filter(x => x.id !== id); save(); };
  // the values the category's title / card / detail code expects, with empty defaults for what isn't filled in yet
  function attrs(L) {
    const O = offerOf(L.v, L.cat), a = {};
    fieldsOf(O).forEach(f => { a[f.key] = f.kind === 'many' ? [] : f.kind === 'bool' ? false : f.kind === 'number' ? 0 : ''; });
    Object.assign(a, L.a);
    if (dateDef(O)) a.avail = L.from ? Math.max(0, Math.round((Date.parse(L.from) - Date.now()) / 864e5)) : 0;
    return a;
  }
  // the price as the data keeps it: residential is stored per year (a monthly rent shows per month again), gyms per month
  const termOf = L => [].concat(L.a.terms || L.a.term || [])[0] || '';
  function storedPrice(L) {
    const p = +L.price || 0;
    if (L.cat === 'residential' && termOf(L) === 'monthly') return Math.round(p * 12 / 1.3);
    if (L.cat === 'gym' && L.a.billing === 'annual') return Math.round(p / 10);
    return p;
  }
  const viewState = L => ({ o: L.cat, f: { term: termOf(L), billing: L.a.billing } });
  function ctxOf(L) { const O = offerOf(L.v, L.cat), a = app() || {}, d = a.d || {}; return { def: id => O.def ? O.def(id) : O.defs.find(x => x.id === id), areaN: areaName(L.loc || L.areas[0] || ''), name: d.display || d.trade || a.name || '' }; }
  // the title the category would give it — only once the details it needs are there
  function suggestedTitle(L) {
    const O = offerOf(L.v, L.cat);
    try { const t = O.title(attrs(L), ctxOf(L)); return /undefined|NaN|null/.test(t) || /^\s*[·-]/.test(t) ? '' : t.replace(/\s+/g, ' ').trim(); } catch (e) { return ''; }
  }
  // the listing in the marketplace's own shape, so the real search card and detail code draw it
  function asListing(L) {
    const a = app() || {}, d = a.d || {};
    return { id: L.id, v: L.v, cat: L.cat, loc: L.loc || L.areas[0] || '', building: L.building, a: attrs(L), title: L.title || suggestedTitle(L) || 'Your listing title',
      price: storedPrice(L), img: L.img.length || offerOf(L.v, L.cat).tile ? L.img : [NO_PHOTO], rating: 0, reviews: 0, posted: 0, coverage: L.areas.length ? L.areas : null, featured: false,
      provider: { name: d.display || a.name || 'You', org: isBiz(a) ? d.trade || d.legal || d.display : '', phone: a.phone || '', reply: 10, langs: d.langs || [], since: new Date().getFullYear() },
      ref: 'Draft', permit: L.permit || null };
  }
  function cardOf(L) {
    try { return U.card(asListing(L), viewState(L)); }
    catch (e) { return `<div class="card listing-card-fallback"><div class="photo">${L.img[0] ? `<img src="${L.img[0]}" alt="">` : ''}</div><div class="body"><b>${esc(L.title || 'Your listing title')}</b></div></div>`; }
  }
  function factsOf(L) { const O = offerOf(L.v, L.cat); try { return (O.meta(attrs(L), asListing(L), ctxOf(L)) || []).map(m => m[1]).filter(x => x && !/undefined|NaN/.test(x) && !/^0\b/.test(String(x).trim())); } catch (e) { return []; } }
  const whereOf = L => { const k = locKind(offerOf(L.v, L.cat)); return k === 'area' ? L.areas.map(areaName).join(', ') : k === 'none' ? 'All UAE' : [L.building, L.loc && areaName(L.loc)].filter(Boolean).join(', '); };
  const titleOf = L => L.title || suggestedTitle(L) || 'Untitled ' + offerOf(L.v, L.cat).label.toLowerCase();
  // "Holiday home permit" → "holiday home permit", but "DLD permit" stays
  const lowerFirst = x => /^[A-Z][a-z]/.test(x) ? x.charAt(0).toLowerCase() + x.slice(1) : x;
  const optLabel = (f, v) => ((f.d.options || []).find(o => o.v === String(v)) || {}).l || v;
  const niceDate = iso => iso ? new Date(iso + 'T00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  // has the provider started it? (an untouched first listing in onboarding can simply be skipped)
  const started = L => !!(Object.keys(L.a).length || L.img.length || L.desc || L.price || L.loc || L.areas.length);

  /* ---------- status ---------- */
  // where a submitted listing goes: its licence first, then the provider's verification, then the team
  const nextStatus = L => gateOf(L.cat) ? 'licence' : !verified(L.v) ? 'verify' : 'review';
  function setStatus(L, st, reason) { L.status = st; L.reason = reason || ''; L.updated = Date.now(); L.history.push({ t: Date.now(), st }); }
  function submit(L) { setStatus(L, nextStatus(L)); save(); }
  // listings waiting on something that has since happened move on by themselves
  function settle() {
    let moved = false;
    db.items.forEach(L => { if ((L.status === 'licence' || L.status === 'verify') && nextStatus(L) !== L.status) { setStatus(L, nextStatus(L)); moved = true; } });
    if (moved) save();
  }

  /* ---------- icons the site set lacks ---------- */
  const SV = { minus: '<path d="M5 12h14"/>', trash: '<path d="M4 7h16M10 11v6M14 11v6"/><path d="M6 7l1 13h10l1-13M9 7V4h6v3"/>', alert: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>', img: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="15.5" cy="9.5" r="1.5"/><path d="M3 16l5-5 5 5 3-3 5 5"/>', chevD: '<path d="M6 9l6 6 6-6"/>' };
  const icon = n => SV[n] ? `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${SV[n]}</svg>` : ico(n);
  // a help line under a field: muted, error, warning or ok
  const help = (text, tone = '', ic = '') => `<p class="listing-help ${tone ? 'is-' + tone : ''}">${ic ? icon(ic) : ''}<span>${text}</span></p>`;
  const SQM = 10.7639;
  // the most a size can sensibly be, by category (sqft) — past it, it's almost always a typo
  const MAX_SQFT = { residential: 40000, holiday: 40000, commercial: 500000, mixed: 2000000, industrial: 5000000, land: 20000000 };
  // a home bigger than this per bedroom is worth a second look (not an error)
  const roomy = L => { const b = +[].concat(L.a.beds || [])[0] || 1, sq = +L.a.sqft || 0; return ['residential', 'holiday'].includes(L.cat) && sq > Math.max(1, b) * 2500 && sq <= (MAX_SQFT[L.cat] || Infinity); };
  const fmtN = n => n === '' || n == null || isNaN(n) ? '' : Number(n).toLocaleString('en-US');
  const today = () => new Date().toISOString().slice(0, 10);
  let openExtras = false; // optional extras start folded: they take room most providers skip

  /* ---------- builders (onboarding's classes) ---------- */
  let E = {};
  const err = k => E[k] ? `<span class="onboarding-error">${icon('alert')}${esc(E[k])}</span>` : '';
  const tip = text => ` <span class="onboarding-tip" tabindex="0" role="button" aria-label="More info"><i>${ico('spark')}</i><span role="tooltip"><b>${ico('spark')}Good to know</b>${esc(text)}</span></span>`;
  const field = (k, label, input, hint = '') => `<div class="field onboarding-field ${E[k] ? 'has-error' : ''}" data-f="${k}"><label for="ln-${k}">${label}</label>${input}${hint && !E[k] ? `<small class="onboarding-hint">${esc(hint)}</small>` : ''}${err(k)}</div>`;
  // the host's section builder (it handles the reveal motion), or a plain one
  let SEC = (id, title, body, aside = '') => `<section class="onboarding-section" data-sec="${id}">${title || aside ? `<div class="onboarding-section-header"><h2>${title}</h2>${aside}</div>` : ''}${body}</section>`;
  const SECX = (id, title, sub, body, aside = '') => SEC(id, title + (sub ? ` <small class="listing-sub-inline">${sub}</small>` : ''), body, aside);
  const use = ctx => { E = (ctx && ctx.errors) || {}; if (ctx && ctx.sec) SEC = ctx.sec; };

  // one field. Choices are chips (the onboarding's "What do you offer?" style); counts get − / + ; sizes an inline unit.
  // titled: the field sits in its own section whose heading is the label, so it isn't repeated
  // a small picture inside the chips a provider answers first
  const OPT_ICON = {
    ptype: { apartment: 'building', villa: 'villa', townhouse: 'townhouse', penthouse: 'penthouse', duplex: 'duplex', 'hotel-apt': 'key', studio: 'bed' },
    ctype: { office: 'office', retail: 'shop', showroom: 'tag', coworking: 'users', bcentre: 'brief', fnb: 'cup', clinic: 'medic' },
    itype: { warehouse: 'warehouse', factory: 'factory', workshop: 'wrench', cold: 'snow', staff: 'bed', yard: 'plot', storage: 'box' },
    mtype: { 'resi-retail': 'building', 'office-retail': 'office', whole: 'home', 'hotel-retail': 'key' },
    furnishing: { furnished: 'sofa', semi: 'seat', unfurnished: 'box' },
    fitting: { fitted: 'tool', semi: 'wrench', shell: 'layers', furnished: 'sofa' }
  };

  // one field. Choices are chips (the onboarding's "What do you offer?" style), short counts (Studio · 1 · 2 …) small
  // number pills; counts get − / + ; sizes an inline unit.
  // titled: the field sits in its own section whose heading is the label, so it isn't repeated
  function control(L, f, titled) {
    const v = L.a[f.key], k = 'a_' + f.key, label = esc(f.label);
    if (f.kind === 'number') {
      if (f.unit === 'sqft') {
        const unit = L.sizeUnit === 'sqm' ? 'sqm' : 'sqft', shown = v === undefined || v === '' ? '' : unit === 'sqm' ? Math.round(v / SQM) : v;
        const toggle = `<span class="listing-unit-switch" role="radiogroup">${['sqft', 'sqm'].map(u => `<button type="button" class="${unit === u ? 'is-active' : ''}" data-ln-unit="${u}" aria-pressed="${unit === u}">${u}</button>`).join('')}</span>`;
        return `<div class="field onboarding-field ${E[k] ? 'has-error' : ''}" data-f="${k}"><label for="ln-${k}">${label}</label><div class="listing-unit has-switch"><input id="ln-${k}" type="number" inputmode="numeric" min="0" data-ln-num="${f.key}" data-unit="${unit}" value="${esc(shown)}" placeholder="e.g. ${unit === 'sqm' ? '80' : '850'}">${toggle}</div>${err(k)}${!E[k] && roomy(L) ? help(`That's large for ${[].concat(L.a.beds || [])[0] === '0' || +[].concat(L.a.beds || [])[0] === 0 ? 'a studio' : `a ${[].concat(L.a.beds || [])[0]}-bed`} — worth a quick double-check.`, 'warn', 'info') : ''}</div>`;
      }
      const val = v === undefined || v === '' ? '' : esc(v), input = `<input id="ln-${k}" type="number" inputmode="numeric" min="0" data-ln-num="${f.key}" value="${val}" placeholder="${f.d.type === 'range' ? 'e.g. 1,200' : '0'}">`;
      return field(k, label, f.d.type === 'range' ? `<div class="listing-unit">${input}</div>`
        : `<div class="listing-stepper"><button type="button" data-ln-step="${f.key}" data-d="-1" aria-label="Fewer ${label}" ${+v > 0 ? '' : 'disabled'}>${icon('minus')}</button>${input}<button type="button" data-ln-step="${f.key}" data-d="1" aria-label="More ${label}">${ico('plus')}</button></div>`);
    }
    if (f.kind === 'bool') return `<button type="button" class="listing-switch ${v ? 'is-on' : ''}" role="switch" aria-checked="${!!v}" data-ln-tog="${f.key}"><span>${label}</span><i></i></button>`;
    const opts = f.d.options || [], one = f.kind === 'one', icons = OPT_ICON[f.key] || {};
    const cur = one ? [String(f.arr ? [].concat(v || [])[0] : v)] : [].concat(v || []).map(String);
    const on = o => cur.includes(o.v) && v !== '' && v !== undefined ? 'is-active' : '';
    const attr = o => `data-ln-${one ? 'one' : 'many'}="${f.key}" data-v="${esc(o.v)}" aria-pressed="${on(o) ? 'true' : 'false'}"`;
    const counts = one && opts.length && opts.every(o => String(o.l).length <= 6);
    const chips = counts
      ? `<div class="listing-counts ${E[k] ? 'has-error' : ''}" role="radiogroup">${opts.map(o => `<button type="button" class="${on(o)}" ${attr(o)}>${esc(o.l)}</button>`).join('')}</div>${err(k)}`
      : `<div class="onboarding-categories listing-chips ${E[k] ? 'has-error' : ''}" ${one ? 'role="radiogroup"' : ''}>${opts.map(o => `<button type="button" class="onboarding-chip ${on(o)}" ${attr(o)}>${icons[o.v] ? ico(icons[o.v]) : ''}<span>${esc(o.l)}</span><span class="onboarding-tick">${ico('check')}</span></button>`).join('')}${own(L, f)}</div>${err(k)}${E['own_' + f.key] ? help(esc(E['own_' + f.key]), 'error', 'alert') : ''}`;
    return titled ? chips : `<div class="listing-q" data-f="${k}"><span>${label}${f.req ? '' : ' <small>optional</small>'}</span>${chips}</div>`;
  }
  // optional lists also take the provider's own (a garden, a smart home…): shown on the listing, not a search filter
  const MAX_OWN = 10;
  function own(L, f) {
    if (f.kind !== 'many' || f.req) return '';
    const known = (f.d.options || []).map(o => o.v), mine = [].concat(L.a[f.key] || []).filter(x => !known.includes(String(x)));
    return `${mine.map(x => `<button type="button" class="onboarding-chip is-active is-own" data-ln-many="${f.key}" data-v="${esc(x)}" aria-pressed="true" title="Tap to remove"><span>${esc(x)}</span><span class="onboarding-tick">${ico('check')}</span></button>`).join('')}
      ${mine.length < MAX_OWN ? `<span class="listing-own"><input data-ln-own="${f.key}" maxlength="30" placeholder="Add your own" aria-label="Add your own ${esc(f.label.toLowerCase())}"><button type="button" data-ln-ownadd="${f.key}" aria-label="Add">${ico('plus')}</button></span>` : ''}`;
  }
  function location(L) {
    const O = offerOf(L.v, L.cat), kind = locKind(O), n = noun(L.v, L.cat);
    if (kind === 'none') return '';
    const areas = O.locs ? AREAS.filter(x => O.locs.includes(x.id)) : AREAS;
    const areaSel = (k, label) => field(k, label, `<div class="listing-select">${ico('pin')}<select id="ln-${k}" data-ln-loc><option value="">Choose…</option>${areas.map(x => `<option value="${x.id}" ${L.loc === x.id ? 'selected' : ''}>${esc(x.n)}</option>`).join('')}</select>${icon('chevD')}</div>`);
    const city = ((app() || {}).d || {}).city;
    const outside = city && !/dubai/i.test(city) ? help(`Listings cover Dubai areas for now — ${esc(city)} is coming.`, '', 'info') : '';
    if (kind === 'area') return SECX('ln-where', 'Areas you cover', 'Customers in these areas see your listing — pick the ones you can reach on time.', `<div class="onboarding-categories listing-chips ${E.areas ? 'has-error' : ''}" data-f="areas">${AREAS.map(x => `<button type="button" class="onboarding-chip ${L.areas.includes(x.id) ? 'is-active' : ''}" data-ln-area="${x.id}"><span>${esc(x.n)}</span><span class="onboarding-tick">${ico('check')}</span></button>`).join('')}</div>${err('areas')}${outside}`, `<small class="listing-aside">${L.areas.length ? L.areas.length + ' chosen' : ''}</small>`);
    if (kind === 'meet') return SECX('ln-where', 'Where customers meet you', '', `<div class="listing-grid">${areaSel('loc', 'Area')}${field('meet', 'Meeting or pickup point <small>optional</small>', `<input id="ln-meet" data-ln-k="meet" value="${esc(L.meet)}" placeholder="e.g. Hotel lobby pickups">`)}</div>${outside}`);
    const lease = O.lease || O.id === 'holiday';
    // building names we already know in that area: suggestions while typing
    const known = [...new Set(UP.LISTINGS.filter(x => x.loc === L.loc && x.building).map(x => x.building))];
    const b = L.building.trim(), bHelp = E.building ? '' : !b ? '' : known.includes(b) ? help(`Matched in ${esc(areaName(L.loc))}`, 'ok', 'check') : help("Not on our list — we'll check the name during review.", '', 'info');
    return SECX('ln-where', 'Location', lease ? 'Customers see the building and area. Your unit number stays private.' : 'Customers see the area and the name of the place.', `<div class="listing-grid">${areaSel('loc', O.locLabel || 'Area')}
        <div class="field onboarding-field ${E.building ? 'has-error' : ''}" data-f="building"><label for="ln-building">${lease ? 'Building or community' : 'Building or venue'}</label><input id="ln-building" data-ln-k="building" list="ln-buildings" value="${esc(L.building)}" placeholder="Start typing…" autocomplete="off"><datalist id="ln-buildings">${known.map(x => `<option value="${esc(x)}">`).join('')}</datalist>${err('building')}${bHelp}</div>
        ${lease ? `<div class="field onboarding-field" data-f="unit"><label for="ln-unit">Unit number <small class="listing-private">${ico('lock')}private</small></label><input id="ln-unit" data-ln-k="unit" value="${esc(L.unit)}" placeholder="e.g. 1204">${help('Only shared with customers you choose.')}</div>` : ''}</div>${outside}`);
  }
  // the category's own questions, then where it is, then the optional extras
  const ROOMS = ['beds'];
  function details(L, ctx) {
    use(ctx);
    const O = offerOf(L.v, L.cat), F = detailFields(O);
    const choices = F.filter(f => f.req && (f.kind === 'one' || f.kind === 'many') && !ROOMS.includes(f.key)), rooms = F.filter(f => f.req && ROOMS.includes(f.key)),
      nums = F.filter(f => f.req && f.kind === 'number'), extra = F.filter(f => !f.req);
    const numTitle = L.v === 'spaces' ? (rooms.length ? 'Rooms and size' : 'Size and capacity') : 'Key numbers';
    const picked = extra.reduce((n, f) => n + (f.kind === 'bool' ? (L.a[f.key] ? 1 : 0) : [].concat(L.a[f.key] || []).length), 0); // every item picked, their own included
    const extraTitle = extra.some(f => f.key === 'amenities') ? 'Amenities' : 'Extras';
    const about = choices.map(f => `<div class="listing-q" data-f="a_${f.key}"><span>${esc(f.label)}${f.kind === 'many' ? ' <small class="listing-hint">choose all that apply</small>' : ''}</span>${control(L, f, true)}</div>`).join('');
    return `${choices.length ? SECX('ln-about', `About the ${esc(noun(L.v, L.cat))}`, 'What customers filter by first — pick what fits.', `<div class="listing-qs">${about}</div>`) : ''}
      ${rooms.length || nums.length ? SECX('ln-nums', numTitle, L.v === 'spaces' ? 'Exact numbers — they show on your listing.' : 'The numbers customers compare.', `<div class="listing-rooms">${rooms.map(f => `<div class="field onboarding-field listing-rooms-chips" data-f="a_${f.key}"><label>${esc(f.label)}</label>${control(L, f, true)}</div>`).join('')}${nums.map(f => control(L, f)).join('')}</div>`) : ''}
      ${location(L)}
      ${extra.length ? SECX('ln-extra', `${extraTitle} <small class="listing-hint">· optional</small>`, openExtras ? 'Extras customers often search for.' : '', openExtras ? `<div class="listing-extras-body">${extra.filter(f => f.kind === 'many').map(f => control(L, f, f.key === 'amenities')).join('')}${extra.some(f => f.kind === 'bool') ? `<div class="listing-switches">${extra.filter(f => f.kind === 'bool').map(f => control(L, f)).join('')}</div>` : ''}</div>` : '',
        `<button type="button" class="listing-showhide" data-ln-act="extras" aria-expanded="${openExtras}">${picked ? `<span>${picked} selected ·</span>` : ''}${openExtras ? 'Hide' : 'Show'}${icon('chevD')}</button>`) : ''}`;
  }
  const photoTarget = L => minPhotos(L.v, offerOf(L.v, L.cat)) + 3;
  // what to photograph, per kind of listing — shown as a short list so providers know what to upload
  const SHOTS = {
    lease: ['Living room', 'Bedrooms', 'Kitchen', 'Bathroom', 'View or balcony', 'Building & entrance'],
    office: ['Main space', 'Meeting rooms', 'Reception', 'Kitchen / pantry', 'Building & entrance'],
    industrial: ['Main floor', 'Loading area', 'Office', 'Outside & access'],
    land: ['The plot', 'Road access', 'Surroundings'],
    holiday: ['Living room', 'Bedrooms', 'Kitchen', 'Bathroom', 'Pool & amenities', 'View'],
    venue: ['Main space', 'Set up for an event', 'Entrance', 'Facilities'],
    court: ['Courts', 'Changing rooms', 'Entrance & parking'],
    yacht: ['Exterior', 'Deck', 'Cabin', 'Guests on board'],
    services: ['Finished work', 'Before & after', 'Team at work', 'Equipment'],
    experiences: ['The activity', 'Guests enjoying it', 'The place', 'The details'],
    memberships: ['Main floor', 'Equipment', 'A class in action', 'Changing rooms'],
    programs: ['Classrooms', 'Facilities', 'Activities', 'Entrance'],
    health: ['Reception', 'Treatment room', 'Equipment', 'Your team']
  };
  const shotsFor = L => SHOTS[{ residential: 'lease', commercial: 'office', mixed: 'office', industrial: 'industrial', land: 'land', holiday: 'holiday', venue: 'venue', court: 'court', yacht: 'yacht' }[L.cat] || L.v] || [];
  function photos(L, ctx) {
    use(ctx);
    const O = offerOf(L.v, L.cat), min = minPhotos(L.v, O), target = photoTarget(L), count = L.img.length;
    if (O.tile) return `<p class="onboarding-business-only">${ico('shield')}<span>Cover listings show your logo instead of photos — nothing to add here.</span></p>`;
    const input = `<input type="file" accept="image/jpeg,image/png,image/webp" multiple data-ln-photos hidden>`;
    const status = count >= min ? `<span class="listing-photo-status is-ok">${ico('check')}${count} photos${count < target ? ` · ${target}+ recommended` : ''}</span>`
      : `<span class="listing-photo-status">${count} of ${min} needed</span>`;
    const shots = shotsFor(L);
    const body = !count
      // nothing yet: one large, inviting drop area
      ? `<label class="listing-photo-drop">${input}<span class="listing-photo-drop-ic">${ico('upload')}</span><b>Drag photos here or <u>browse</u></b><small>You can pick several at once · JPG or PNG · at least ${min}, up to ${MAX_PHOTOS}</small></label>`
      // then: the cover large on the left, the rest numbered around it, an add tile the size of a photo
      : `<div class="listing-photo-grid">${L.img.map((src, i) => `<figure class="listing-photo ${i === 0 ? 'is-cover' : ''}" draggable="true" data-ln-ph="${i}"><img src="${src}" alt="Photo ${i + 1}">
          ${i === 0 ? `<em>${ico('star')}Cover</em>` : `<span class="listing-photo-num">${i + 1}</span>`}
          <span class="listing-photo-actions">${i ? `<button type="button" data-ln-phcover="${i}" title="Make cover" aria-label="Make photo ${i + 1} the cover">${ico('star')}</button>` : ''}<button type="button" data-ln-phrm="${i}" title="Remove" aria-label="Remove photo ${i + 1}">${icon('trash')}</button></span></figure>`).join('')}
        ${count < MAX_PHOTOS ? `<label class="listing-photo-add" title="Add photos — you can pick several at once">${input}<span class="listing-photo-add-ic">${ico('plus')}</span><b>Add photos</b>${count < min ? `<small>${min - count} more needed</small>` : ''}</label>` : ''}</div>`;
    return SECX('ln-photos', 'Photos', count ? 'Drag to reorder — the first photo is the cover customers see in search.' : '', `<div class="listing-photos ${count ? '' : 'is-empty'} ${E.photos ? 'has-error' : ''}" data-f="photos">${body}</div>
      ${E.photos ? help(esc(E.photos), 'error', 'alert') : ''}
      ${shots.length ? `<p class="listing-shots"><span>Suggested shots</span>${shots.map(x => `<em>${esc(x)}</em>`).join('')}</p>` : ''}`, status);
  }
  // under the description: the contact details are already on the listing, from the profile — not typed in here
  function contactNote() {
    const names = { wa: 'WhatsApp', call: 'phone', email: 'email', sms: 'SMS' };
    const ch = (((app() || {}).channels) || []).map(c => names[c]).filter(Boolean);
    const how = ch.length ? `by ${ch.length > 1 ? ch.slice(0, -1).join(', ') + ' and ' + ch[ch.length - 1] : ch[0]}` : 'through the contact buttons';
    return `No need to type your phone number or links here — customers already contact you ${how}, as you set in your profile.`;
  }
  function words(L, ctx) {
    use(ctx);
    const t = L.title, d = L.desc, long = t.length > 50;
    // the title: one field, its count inside it, one line of help under it
    return `${SEC('ln-title', 'Title', `<div class="field onboarding-field ${E.title ? 'has-error' : ''}" data-f="title"><div class="listing-titlebox"><input id="ln-title" data-ln-k="title" maxlength="70" value="${esc(t)}" placeholder="A short, clear title" aria-label="Title"><span class="listing-count ${long ? 'is-warn' : ''}" data-ln-count="title">${t.length}/70</span></div></div>
        ${E.title ? help(esc(E.title), 'error', 'alert') : help(long ? 'Over 50 characters gets cut off on phones.' : L.titled ? 'Keep it short and specific.' : 'We wrote this from your details — edit it freely.', long ? 'warn' : '')}`)}
      ${SEC('ln-desc', 'Description', `<div class="listing-writer ${E.desc ? 'has-error' : ''}" data-f="desc"><textarea id="ln-desc" data-ln-k="desc" maxlength="2000" rows="4" placeholder="What makes it worth a call?">${esc(d)}</textarea>
          <div class="listing-writer-bar"><button type="button" class="listing-pill" data-ln-act="writedesc">${ico('spark')}Write it for me</button><span class="listing-count" data-ln-count="desc">${d.length}/2000</span></div></div>
        ${E.desc ? help(esc(E.desc), 'error', 'alert') : help(contactNote(), '', 'lock')}`)}`;
  }
  // price: one money box (yearly / monthly switched inside it), cheques as a single line under it, the deposit beside it;
  // availability and the permit share one panel
  function price(L, ctx) {
    use(ctx);
    const O = offerOf(L.v, L.cat), pf = priceFields(O), dd = dateDef(O), pm = permitOf(O);
    const term = termOf(L), monthly = term === 'monthly', basis = (O.unit(asListing(L), viewState(L)) || '').replace(/^\//, 'per '), pd = priceDef(O);
    const rentLike = L.cat === 'residential';
    const p = +L.price || 0, termF = pf.find(f => f.kind === 'one' && f.arr), otherOne = pf.filter(f => f.kind === 'one' && f !== termF);
    const label = termF ? 'Amount' : L.cat === 'gym' ? (L.a.billing === 'annual' ? 'Price per year' : 'Price per month') : pd.label === 'Budget' ? 'Price' : pd.label;
    const cheq = pf.find(f => f.key === 'cheques'), nums = pf.filter(f => f.kind === 'number' && f !== cheq);
    const conv = rentLike && p ? help(monthly ? `≈ AED ${fmtN(p * 12)} a year` : `≈ AED ${fmtN(Math.round(p / 12))} a month`) : '';
    // yearly / monthly sits inside the money box, like sqft / sqm in the size box
    const termSw = termF ? `<span class="listing-unit-switch" role="radiogroup" aria-label="Paid">${(termF.d.options || []).map(o => `<button type="button" class="${(term || '') === o.v ? 'is-active' : ''}" data-ln-one="${termF.key}" data-v="${esc(o.v)}" aria-pressed="${(term || '') === o.v}">${esc(o.l)}</button>`).join('')}</span>` : '';
    const money = `<div class="field onboarding-field ${E.price || (termF && E['a_' + termF.key]) ? 'has-error' : ''}" data-f="price"><label for="ln-price">${esc(label)}</label>
        <div class="listing-money ${termSw ? 'has-switch' : ''}"><span>AED</span><input id="ln-price" type="number" inputmode="numeric" min="0" data-ln-k="price" value="${esc(L.price)}" placeholder="${rentLike ? (monthly ? 'e.g. 8,500' : 'e.g. 95,000') : '0'}">${termSw || `<em>${esc(basis)}</em>`}</div>
        ${err('price')}${termF ? err('a_' + termF.key) : ''}${E.price ? '' : conv || (O.from ? help('Shown as “from” — your lowest price') : '')}</div>`;
    const n = +L.a.cheques || 0;
    const cheques = cheq && !monthly ? `<div class="listing-pr-line ${E.a_cheques ? 'has-error' : ''}" data-f="a_cheques"><span>Cheques</span><div class="listing-counts">${[1, 2, 4, 6, 12].map(c => `<button type="button" class="${n === c ? 'is-active' : ''}" data-ln-set="cheques" data-v="${c}" aria-pressed="${n === c}">${c}</button>`).join('')}</div>${p && n ? `<em>AED ${fmtN(Math.round(p / n))} each</em>` : ''}</div>${err('a_cheques')}` : '';
    const furn = L.a.furnishing, depo = O.lease && p ? Math.round((monthly ? p * 12 : p) * (furn === 'unfurnished' ? .05 : .1) / 100) * 100 : 0;
    const deposit = O.lease ? `<div class="field onboarding-field" data-f="deposit"><label for="ln-deposit">Security deposit <small>optional</small></label><div class="listing-money"><span>AED</span><input id="ln-deposit" type="number" inputmode="numeric" min="0" data-ln-k="deposit" value="${esc(L.deposit)}" placeholder="${depo ? 'e.g. ' + fmtN(depo) : 'Leave empty if none'}"></div>
      ${depo && String(depo) !== String(L.deposit) ? `<button type="button" class="listing-pr-use" data-ln-act="deposit" data-v="${depo}">${ico('spark')}Use AED ${fmtN(depo)}<small>typical${furn ? ' for ' + ({ furnished: 'furnished', semi: 'semi-furnished', unfurnished: 'unfurnished' }[furn] || '') : ''}</small></button>` : ''}</div>` : '';
    const now = L.availNow !== false && (!L.from || L.from <= today());
    const dateLabel = dd ? ({ start: 'Starts' }[dd.id] || 'Available') : '';
    const permitOk = pm && pm.ok(String(L.permit).trim());
    const avail = dd ? `<div class="listing-q" data-f="from"><span>${esc(dateLabel)}</span><div class="listing-pr-when"><div class="onboarding-segmented-control">${[['now', 'Now'], ['date', 'From a date']].map(([k, t]) => `<button type="button" class="${(k === 'now') === now ? 'is-active' : ''}" data-ln-avail="${k}" aria-pressed="${(k === 'now') === now}">${t}</button>`).join('')}</div>
        ${now ? '' : `<input type="date" class="onboarding-date listing-date ${E.from ? 'has-error' : ''}" data-ln-date value="${esc(L.from)}" min="${today()}" aria-label="${esc(dateLabel)} from">`}</div>${err('from')}</div>` : '';
    const days = weekly(L.v) ? `<div class="listing-q is-many ${E.days ? 'has-error' : ''}" data-f="days"><span>Days you work</span><div class="onboarding-categories listing-chips">${DAYS.map(x => `<button type="button" class="onboarding-chip ${L.days.includes(x) ? 'is-active' : ''}" data-ln-day="${x}"><span>${x}</span><span class="onboarding-tick">${ico('check')}</span></button>`).join('')}</div>${err('days')}</div>
          <div class="listing-q"><span>Hours</span><div class="onboarding-segmented-control">${HOURS.map(([id, t]) => `<button type="button" class="${L.hours === id ? 'is-active' : ''}" data-ln-hours="${id}">${t}</button>`).join('')}</div></div>` : '';
    const permit = pm ? `<div class="field onboarding-field ${E.permit ? 'has-error' : ''}" data-f="permit"><label for="ln-permit">${O.lease ? 'DLD advertising permit' : 'DET holiday home permit'}</label><div class="listing-unit"><input id="ln-permit" data-ln-k="permit" value="${esc(L.permit)}" placeholder="${O.lease ? 'e.g. 7123456789' : 'e.g. HH-245981'}" ${O.lease ? 'inputmode="numeric"' : ''}>${permitOk ? `<span class="is-ok">${ico('check')}Format OK</span>` : ''}</div>${E.permit ? err('permit') : help(O.lease ? 'Required for every rental ad in Dubai — we confirm it with DLD.' : 'Every holiday home needs its own — we confirm it with DET.')}</div>` : '';
    return `${SECX('ln-price', rentLike ? 'Rent' : 'Price', `Customers agree the details with you directly.`, `
        ${otherOne.map(f => control(L, f)).join('')}
        <div class="listing-pr-grid">${money}${deposit}</div>
        ${cheques}
        ${nums.length ? `<div class="listing-grid">${nums.map(f => control(L, f)).join('')}</div>` : ''}
        ${ctx && ctx.oddPrice ? `<p class="listing-notice is-amber">${ico('spark')}<span>Is AED ${esc(fmtN(p))} ${esc(basis)} right? It's far from similar listings. Continue again if it is.</span></p>` : ''}`)}
      ${avail || days || permit ? SECX('ln-when', avail || days ? (permit ? 'Availability and permit' : 'Availability') : 'Permit', '', `${avail ? `<div class="listing-pr-grid">${avail}${permit}</div>` : permit}${days}`) : ''}`;
  }
  // the provider's categories to choose from (only when they offer more than one)
  function categories(a, cur, ctx) {
    use(ctx);
    const cats = (a.cats || []).filter(c => VERTICALS[a.v].offers.some(o => o.id === c));
    if (cats.length < 2) return '';
    return `<div class="onboarding-categories ${E.cat ? 'has-error' : ''}">${cats.map(c => { const o = offerOf(a.v, c); return `<button type="button" class="onboarding-chip ${cur === c ? 'is-active' : ''}" data-ln-cat="${c}">${ico(o.icon || (window.UPF && UPF.OICO[c]) || VERTICALS[a.v].icon)}<span>${esc(o.label)}</span><span class="onboarding-tick">${ico('check')}</span></button>`; }).join('')}</div>${err('cat')}`;
  }

  /* ---------- listing strength (preview) and the review rows ---------- */
  function strength(L) {
    const O = offerOf(L.v, L.cat), target = photoTarget(L), pm = permitOf(O);
    const det = parts(L, 'details'), items = [
      { t: 'Details and location', done: det.every(Boolean) && !Object.keys(validate(L, 'details')).length, part: 1 },
      ...(O.tile ? [] : [{ t: (n => `${n} more photo${n === 1 ? '' : 's'}`)(Math.max(0, target - L.img.length)), dt: `${target}+ photos`, done: L.img.length >= target, part: 2 }]),
      { t: 'Description', done: L.desc.trim().length >= 80, part: 2 },
      { t: 'Price', done: +L.price > 0, part: 3 },
      ...(pm ? [{ t: O.lease ? 'DLD permit' : 'Holiday home permit', done: pm.ok(String(L.permit).trim()), part: 3 }] : [])
    ];
    const pct = Math.round(items.filter(x => x.done).length / items.length * 100);
    return { items, pct, word: pct === 100 ? 'Excellent' : pct >= 60 ? 'Good' : 'Getting there' };
  }
  function reviewRows(L) {
    const O = offerOf(L.v, L.cat), F = detailFields(O), a = L.a;
    // a count reads as "1 bed", "2 bathrooms"; a size as "850 sqft"
    const count = (n, label) => { const w = label.toLowerCase().replace(/^bedrooms$/, 'beds'); return `${n} ${String(n) === '1' ? w.replace(/s$/, '') : w}`; };
    const val = f => { const v = a[f.key]; if (f.kind === 'bool') return v ? f.label : ''; if (f.kind === 'many') return [].concat(v || []).map(x => optLabel(f, x)).join(', ');
      if (f.kind === 'number') return v ? (f.unit ? `${fmtN(v)} ${f.unit}` : count(fmtN(v), f.label)) : '';
      if (v === undefined || v === '') return ''; const l = optLabel(f, [].concat(v)[0]); return /^\d+\+?$/.test(l) ? count(l, f.label) : l; };
    const main = F.filter(f => f.req).map(val).filter(Boolean).join(' · '), extra = F.filter(f => !f.req).map(val).filter(Boolean).join(', ');
    const term = termOf(L), unit = O.unit(asListing(L), viewState(L)) || '', pm = permitOf(O), k = locKind(O);
    const priceLine = `AED ${fmtN(+L.price)} ${unit.replace('/', '/ ')}${a.cheques && term !== 'monthly' && priceFields(O).some(f => f.key === 'cheques') ? ` · ${a.cheques} cheque${a.cheques > 1 ? 's' : ''}` : ''}${L.deposit ? ` · Deposit AED ${fmtN(L.deposit)}` : ''}`;
    return [
      [O.label, main || '—', 1],
      ...(k !== 'none' ? [[k === 'area' ? 'Areas' : 'Location', (whereOf(L) || '—') + (L.unit ? ` · Unit ${L.unit} (private)` : ''), 1]] : []),
      ...(extra ? [['Extras', extra, 1]] : []),
      ...(O.tile ? [] : [['Photos', `${L.img.length} photos`, 2]]),
      ['Title', L.title || suggestedTitle(L), 2],
      ['Price', priceLine, 3],
      ...(dateDef(O) ? [['Available', L.availNow === false && L.from ? niceDate(L.from) : 'Now', 3]] : []),
      ...(pm ? [[O.lease ? 'DLD permit' : 'Permit', L.permit, 3]] : [])
    ];
  }
  // the first time the provider reaches the description, it starts from a template they can edit
  function prefill(L) { if (!L.desc) { L.desc = descStarter(L); save(); } }

  /* ---------- description starter ---------- */
  function descStarter(L) {
    const O = offerOf(L.v, L.cat), a = app() || {}, n = noun(L.v, L.cat), facts = factsOf(L).slice(0, 4), where = whereOf(L);
    const lead = `${L.title || suggestedTitle(L) || O.label}${where && locKind(O) !== 'none' ? (locKind(O) === 'area' ? ', covering ' : ' in ') + where : ''}.`;
    const extras = detailFields(O).filter(f => f.kind === 'bool' && L.a[f.key]).map(f => f.label.toLowerCase()).slice(0, 3);
    const who = isBiz(a) ? `We're a licensed business verified by ${SITE.name}` : `I'm verified by ${SITE.name}`;
    return `${lead}${facts.length ? ` ${facts.join(' · ')}.` : ''}${extras.length ? ` Includes ${extras.join(', ').replace(/, ([^,]*)$/, ' and $1')}.` : ''}\n\n${who} and reply quickly on WhatsApp or by phone. Send a message to ask anything about this ${n}.`;
  }

  /* ---------- validation: 'details' · 'photos' (photos, title, description) · 'price' ---------- */
  function validate(L, part) {
    const O = offerOf(L.v, L.cat), e = {}, all = part === 'all';
    if (all || part === 'details') {
      detailFields(O).filter(f => f.req).forEach(f => { const v = L.a[f.key];
        if (f.kind === 'many' ? !(v || []).length : v === undefined || v === '') e['a_' + f.key] = f.kind === 'number' ? `Add the ${f.label.toLowerCase()}` : f.kind === 'many' ? 'Choose at least one' : 'Pick one';
        else if (f.kind === 'number' && !(+v > 0) && !/^(beds|bedrooms)$/.test(f.key)) e['a_' + f.key] = `Add the ${f.label.toLowerCase()}`; });
      const max = MAX_SQFT[L.cat]; if (max && +L.a.sqft > max) e.a_sqft = `That looks too big — check the size (up to ${fmtN(max)} sqft)`;
      const k = locKind(O);
      if (k === 'area' && !L.areas.length) e.areas = 'Choose at least one area';
      if ((k === 'place' || k === 'meet') && !L.loc) e.loc = 'Choose the area';
      if (k === 'place' && (O.lease || O.id === 'holiday') && !L.building.trim()) e.building = 'Add the building or community';
    }
    if (all || part === 'photos') {
      const min = minPhotos(L.v, O);
      if (L.img.length < min) e.photos = `Add ${min - L.img.length} more ${min - L.img.length === 1 ? 'photo' : 'photos'} to continue`;
      if (L.title.trim().length < 5) e.title = 'Add a short title — at least 5 characters';
      else if (CONTACT_RX.test(L.title)) e.title = 'Remove contact details from the title';
      if (L.desc.trim().length < 80) e.desc = 'Add a little more — at least 80 characters, or tap “Write it for me”';
      else if (CONTACT_RX.test(L.desc)) e.desc = 'Remove phone numbers, emails or links from the description';
    }
    if (all || part === 'price') {
      if (!(+L.price > 0)) e.price = 'Add your price';
      priceFields(O).filter(f => !(f.key === 'cheques' && termOf(L) === 'monthly')).forEach(f => { const v = L.a[f.key]; if (v === undefined || v === '' || (f.kind === 'number' && !(+v > 0))) e['a_' + f.key] = f.kind === 'number' ? `Add the ${f.label.toLowerCase()}` : 'Pick one'; });
      if (dateDef(O) && L.availNow === false && !L.from) e.from = 'Choose the date it becomes available';
      if (weekly(L.v) && !L.days.length) e.days = 'Choose at least one day';
      const pm = permitOf(O); if (pm && !pm.ok(String(L.permit).trim())) e.permit = pm.msg;
    }
    return e;
  }
  // a price far from similar listings is asked about once, never blocked
  function priceOdd(L) {
    const same = UP.LISTINGS.filter(x => x.cat === L.cat).map(x => x.price).filter(Boolean); if (!same.length || !(+L.price > 0)) return false;
    const p = storedPrice(L); return p < Math.min(...same) / 4 || p > Math.max(...same) * 4;
  }
  // how much of each part is filled in (for progress bars)
  function parts(L, part) {
    const O = offerOf(L.v, L.cat);
    if (part === 'details') return [...detailFields(O).filter(f => f.req).map(f => { const v = L.a[f.key]; return f.kind === 'many' ? (v || []).length : v !== undefined && v !== '' && !(f.kind === 'number' && !(+v > 0)); }), locKind(O) === 'none' || (locKind(O) === 'area' ? L.areas.length : L.loc)];
    if (part === 'photos') return [L.img.length >= minPhotos(L.v, O), L.title.trim().length >= 5, L.desc.trim().length >= 80];
    return [+L.price > 0, ...priceFields(O).filter(f => !(f.key === 'cheques' && termOf(L) === 'monthly')).map(f => L.a[f.key] !== undefined && L.a[f.key] !== ''), !dateDef(O) || L.availNow !== false || L.from, !permitOf(O) || L.permit];
  }

  /* ---------- events: one binding per page ----------
     host: { get() → the listing being edited, errors() → the host's error map, commit(pop), saved(), cat(id) } */
  function bind(root, host) {
    const touch = (L, pop) => { if (!L.titled) L.title = suggestedTitle(L) || L.title; L.updated = Date.now(); if (!save()) toast('This browser is out of space — remove a photo or two'); host.commit(pop); };
    const clearErr = k => { const e = host.errors(); delete e[k]; };
    // several at once: each photo is checked, then one message says which were skipped and why
    function addPhotos(L, files) {
      const all = [...files], room = MAX_PHOTOS - L.img.length; if (room <= 0) return toast(`Up to ${MAX_PHOTOS} photos`);
      const skip = { limit: Math.max(0, all.length - room), type: 0, small: 0, read: 0, space: 0 };
      const one = f => new Promise(done => {
        if (!/^image\/(jpeg|png|webp)$/.test(f.type)) { skip.type++; return done(); }
        const img = new Image(), url = URL.createObjectURL(f);
        img.onload = () => {
          URL.revokeObjectURL(url);
          if (Math.max(img.width, img.height) < 800) { skip.small++; return done(); }
          if (skip.space) { skip.space++; return done(); }
          const k = Math.min(1, 1280 / Math.max(img.width, img.height)), c = document.createElement('canvas');
          c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          L.img.push(c.toDataURL('image/jpeg', .72));
          if (!save()) { L.img.pop(); skip.space++; return done(); }
          clearErr('photos'); touch(L); done();
        };
        img.onerror = () => { URL.revokeObjectURL(url); skip.read++; done(); };
        img.src = url;
      });
      Promise.all(all.slice(0, room).map(one)).then(() => {
        const why = [[skip.small, 'too small (use photos at least 800 px wide)'], [skip.type, 'not JPG or PNG'], [skip.read, 'couldn’t be opened'],
          [skip.space, 'this browser is out of space — remove a photo or two'], [skip.limit, `over the limit of ${MAX_PHOTOS} photos`]].filter(x => x[0]);
        if (!why.length) return;
        const n = why.reduce((t, x) => t + x[0], 0), added = all.length - n;
        const list = why.map(([c, t]) => (why.length > 1 ? `${c} ` : '') + t).join(', ');
        host.errors().photos = all.length === 1 ? `This photo wasn’t added — ${list}.`
          : added ? `${added} of ${all.length} photos added. ${n} ${n > 1 ? 'weren’t' : 'wasn’t'}: ${list}.` : `None of the ${all.length} photos were added: ${list}.`;
        host.commit();
      });
    }
    const move = (L, from, to) => { if (from === to || from < 0) return; const [x] = L.img.splice(from, 1); L.img.splice(to, 0, x); touch(L); };
    let drag = -1;
    root.addEventListener('input', e => {
      const L = host.get(), t = e.target; if (!L) return;
      const k = t.dataset.lnK, num = t.dataset.lnNum;
      if (k) { L[k] = t.value; if (k === 'title') L.titled = !!t.value.trim(); }
      else if (num) L.a[num] = t.value === '' ? '' : t.dataset.unit === 'sqm' ? Math.round(+t.value * SQM) : +t.value;
      else return;
      const ek = num ? 'a_' + num : k, errs = host.errors();
      if (errs[ek]) { delete errs[ek]; const f = t.closest('.onboarding-field, .onboarding-about'); if (f) { f.classList.remove('has-error'); const m = f.querySelector('.onboarding-error'); if (m) m.remove(); } }
      L.updated = Date.now(); save(); host.saved(k);
      const count = (n, v, min, max) => { const c = root.querySelector(`[data-ln-count="${n}"]`); if (c) { c.textContent = min && v.length < min ? `${v.length}/${min} min` : `${v.length}/${max}`; c.classList.toggle('is-ok', min ? v.trim().length >= min : !!v.length); } };
      if (k === 'desc') { count('desc', t.value, 80, 2000); fit(); }
      if (k === 'title') count('title', t.value, 0, 70);
    });
    root.addEventListener('change', e => {
      const L = host.get(), t = e.target; if (!L) return;
      if (t.matches('[data-ln-loc]')) { L.loc = t.value; clearErr('loc'); touch(L); return; }
      if (t.matches('[data-ln-bool]')) { L.a[t.dataset.lnBool] = t.checked; touch(L); return; }
      if (t.matches('[data-ln-photos]') && t.files.length) { addPhotos(L, t.files); t.value = ''; return; }
      if (t.matches('[data-ln-date]')) { L.from = t.value; clearErr('from'); touch(L); return; }
      // a size past what's possible is flagged as soon as they leave the field (not only on Continue)
      if (t.matches('[data-ln-num]')) { const errs = host.errors(), v = validate(L, 'details'); if (v.a_sqft && /too big/.test(v.a_sqft)) errs.a_sqft = v.a_sqft; else if (!v.a_sqft) delete errs.a_sqft; touch(L); }
    });
    function addOwn(L, key, input) {
      const f = fieldsOf(offerOf(L.v, L.cat)).find(y => y.key === key); if (!f || !input) return;
      const v = input.value.trim().replace(/\s+/g, ' '), errs = host.errors(), list = [].concat(L.a[key] || []);
      const known = (f.d.options || []).map(o => o.l.toLowerCase()), mine = list.filter(x => !(f.d.options || []).some(o => o.v === String(x)));
      delete errs['own_' + key];
      if (!v) return;
      if (v.length < 2) errs['own_' + key] = 'Use at least 2 characters';
      else if (CONTACT_RX.test(v)) errs['own_' + key] = 'No phone numbers or links here';
      else if (mine.length >= MAX_OWN) errs['own_' + key] = `Up to ${MAX_OWN} of your own`;
      else if (known.includes(v.toLowerCase())) { const o = f.d.options.find(o => o.l.toLowerCase() === v.toLowerCase()); if (!list.includes(o.v)) L.a[key] = [...list, o.v]; }
      else if (!list.some(x => String(x).toLowerCase() === v.toLowerCase())) L.a[key] = [...list, v.charAt(0).toUpperCase() + v.slice(1)];
      if (!errs['own_' + key]) input.value = ''; // added: the box is ready for the next one
      touch(L);
      const next = root.querySelector(`[data-ln-own="${key}"]`); if (next) next.focus();
    }
    root.addEventListener('keydown', e => {
      const t = e.target; if (e.key !== 'Enter' || !t.matches || !t.matches('[data-ln-own]')) return;
      e.preventDefault(); e.stopPropagation(); const L = host.get(); if (L) addOwn(L, t.dataset.lnOwn, t);
    }, true);
    root.addEventListener('dragstart', e => { const f = e.target.closest && e.target.closest('[data-ln-ph]'); if (f) { drag = +f.dataset.lnPh; e.dataTransfer.effectAllowed = 'move'; } });
    root.addEventListener('dragover', e => { const z = e.target.closest && e.target.closest('.listing-photos'); if (z) { e.preventDefault(); z.classList.add('is-drag'); } });
    root.addEventListener('dragleave', e => { const z = e.target.closest && e.target.closest('.listing-photos'); if (z && !z.contains(e.relatedTarget)) z.classList.remove('is-drag'); });
    root.addEventListener('drop', e => {
      const z = e.target.closest && e.target.closest('.listing-photos'), L = host.get(); if (!z || !L) return; e.preventDefault(); e.stopPropagation(); z.classList.remove('is-drag');
      if (e.dataTransfer.files.length) { addPhotos(L, e.dataTransfer.files); return; }
      const f = e.target.closest('[data-ln-ph]'); if (f && drag >= 0) move(L, drag, +f.dataset.lnPh); drag = -1;
    });
    root.addEventListener('click', e => {
      const b = sel => e.target.closest(sel); let x;
      if ((x = b('[data-ln-cat]'))) { if (host.cat) host.cat(x.dataset.lnCat); return; }
      const L = host.get(); if (!L) return;
      const fieldBy = key => fieldsOf(offerOf(L.v, L.cat)).find(y => y.key === key);
      if ((x = b('[data-ln-act]'))) {
        if (x.dataset.lnAct === 'usetitle') { L.title = suggestedTitle(L); L.titled = false; clearErr('title'); touch(L); }
        if (x.dataset.lnAct === 'resetdesc') { L.desc = descStarter(L); clearErr('desc'); touch(L); }
        if (x.dataset.lnAct === 'deposit') { L.deposit = x.dataset.v; touch(L); }
        if (x.dataset.lnAct === 'extras') { openExtras = !openExtras; touch(L); }
        if (x.dataset.lnAct === 'writedesc') { L.desc = descStarter(L); clearErr('desc'); touch(L, '.onboarding-about'); }
        return;
      }
      if ((x = b('[data-ln-one]'))) { const f = fieldBy(x.dataset.lnOne); if (!f) return; const v = f.num ? +x.dataset.v : x.dataset.v; L.a[f.key] = f.arr ? [v] : v; clearErr('a_' + f.key); touch(L, `[data-ln-one="${f.key}"][data-v="${x.dataset.v}"]`); return; }
      if ((x = b('[data-ln-many]'))) {
        const f = fieldBy(x.dataset.lnMany); if (!f) return;
        const v = f.num ? +x.dataset.v : x.dataset.v, list = [].concat(L.a[f.key] || []);
        L.a[f.key] = list.some(y => String(y) === String(v)) ? list.filter(y => String(y) !== String(v)) : [...list, v];
        clearErr('a_' + f.key); touch(L, `[data-ln-many="${f.key}"][data-v="${x.dataset.v}"]`); return;
      }
      if ((x = b('[data-ln-ownadd]'))) { addOwn(L, x.dataset.lnOwnadd, x.parentNode.querySelector('[data-ln-own]')); return; }
      if ((x = b('[data-ln-unit]'))) { L.sizeUnit = x.dataset.lnUnit; touch(L); return; }
      if ((x = b('[data-ln-set]'))) { L.a[x.dataset.lnSet] = +x.dataset.v; clearErr('a_' + x.dataset.lnSet); touch(L); return; }
      if ((x = b('[data-ln-tog]'))) { L.a[x.dataset.lnTog] = !L.a[x.dataset.lnTog]; touch(L); return; }
      if ((x = b('[data-ln-avail]'))) { const now = x.dataset.lnAvail === 'now'; L.availNow = now; L.from = now ? today() : (L.from && L.from > today() ? L.from : ''); clearErr('from'); touch(L); return; }
      if ((x = b('[data-ln-step]'))) { const key = x.dataset.lnStep; L.a[key] = Math.max(0, (+L.a[key] || 0) + +x.dataset.d); clearErr('a_' + key); touch(L); return; }
      if ((x = b('[data-ln-area]'))) { const id = x.dataset.lnArea; L.areas = L.areas.includes(id) ? L.areas.filter(y => y !== id) : [...L.areas, id]; clearErr('areas'); touch(L, `[data-ln-area="${id}"]`); return; }
      if ((x = b('[data-ln-day]'))) { const d = x.dataset.lnDay; L.days = L.days.includes(d) ? L.days.filter(y => y !== d) : DAYS.filter(y => y === d || L.days.includes(y)); clearErr('days'); touch(L, `[data-ln-day="${d}"]`); return; }
      if ((x = b('[data-ln-hours]'))) { L.hours = x.dataset.lnHours; touch(L); return; }
      if ((x = b('[data-ln-phrm]'))) { L.img.splice(+x.dataset.lnPhrm, 1); touch(L); return; }
      if ((x = b('[data-ln-phcover]'))) move(L, +x.dataset.lnPhcover, 0);
    });
  }
  // the description box grows with its text (field-sizing where supported, by hand elsewhere)
  function fit() { const b = document.getElementById('ln-desc'); if (!b || CSS.supports('field-sizing', 'content')) return; b.style.height = 'auto'; b.style.height = b.scrollHeight + 'px'; }

  window.UPLF = {
    app, isBiz, db: () => db, reload: () => { db = load(); return db; }, save, byId, create, remove, verified,
    noun, locKind, minPhotos, permitOf, dateDef, weekly, detailFields, priceFields, gateOf, gateName, GATE, DOC_NAME, STATUS, HOURS, DAYS,
    attrs, storedPrice, viewState, suggestedTitle, asListing, cardOf, factsOf, whereOf, titleOf, lowerFirst, optLabel, niceDate, started,
    nextStatus, setStatus, submit, settle,
    categories, details, photos, words, price, validate, priceOdd, parts, bind, fit, tip, strength, reviewRows, prefill
  };
})();
