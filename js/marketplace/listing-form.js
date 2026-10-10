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
  const load = () => Object.assign({ items: [], verified: false }, store.get('listings') || {});
  let db = load();
  // browsers keep about 5 MB per site: a save can fail when there are many photos
  const save = () => { try { store.set('listings', db); return true; } catch (e) { return false; } };
  const byId = id => db.items.find(x => x.id === id);
  // the provider counts as verified once the team approves the application (prototype: a simulated approval)
  const verified = () => { const a = app(); return !!(a && (a.status === 'approved' || a.status === 'verified')) || !!db.verified; };

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
  const SKIP = ['price', 'rating', 'listedBy', 'verified'];
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
    const id = f(a), d = (a.docs || {})[id];
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
    return Object.assign({ id: 'P' + Date.now().toString(36), v, cat, a: {}, title: '', titled: false, desc: '', img: [], loc: '', building: '', unit: '', areas: [], meet: '',
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
  function factsOf(L) { const O = offerOf(L.v, L.cat); try { return (O.meta(attrs(L), asListing(L), ctxOf(L)) || []).map(m => m[1]).filter(x => x && !/undefined|NaN/.test(x)); } catch (e) { return []; } }
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
  const nextStatus = L => gateOf(L.cat) ? 'licence' : !verified() ? 'verify' : 'review';
  function setStatus(L, st, reason) { L.status = st; L.reason = reason || ''; L.updated = Date.now(); L.history.push({ t: Date.now(), st }); }
  function submit(L) { setStatus(L, nextStatus(L)); save(); }
  // listings waiting on something that has since happened move on by themselves
  function settle() {
    let moved = false;
    db.items.forEach(L => { if ((L.status === 'licence' || L.status === 'verify') && nextStatus(L) !== L.status) { setStatus(L, nextStatus(L)); moved = true; } });
    if (moved) save();
  }

  /* ---------- builders (onboarding's classes) ---------- */
  let E = {};
  const err = k => E[k] ? `<span class="onboarding-error">${ico('x')}${esc(E[k])}</span>` : '';
  const tip = text => ` <span class="onboarding-tip" tabindex="0" role="button" aria-label="More info"><i>${ico('spark')}</i><span role="tooltip"><b>${ico('spark')}Good to know</b>${esc(text)}</span></span>`;
  const field = (k, label, input, hint = '') => `<div class="field onboarding-field ${E[k] ? 'has-error' : ''}" data-f="${k}"><label for="ln-${k}">${label}</label>${input}${hint && !E[k] ? `<small class="onboarding-hint">${esc(hint)}</small>` : ''}${err(k)}</div>`;
  // the host's section builder (it handles the reveal motion), or a plain one
  let SEC = (id, title, body, aside = '') => `<section class="onboarding-section" data-sec="${id}">${title || aside ? `<div class="onboarding-section-header"><h2>${title}</h2>${aside}</div>` : ''}${body}</section>`;
  const use = ctx => { E = (ctx && ctx.errors) || {}; if (ctx && ctx.sec) SEC = ctx.sec; };

  function control(L, f) {
    const v = L.a[f.key], k = 'a_' + f.key;
    if (f.kind === 'number') return field(k, esc(f.label) + (f.unit ? ` <small>(${f.unit})</small>` : ''), `<input id="ln-${k}" type="number" inputmode="numeric" min="0" data-ln-num="${f.key}" value="${v === undefined || v === '' ? '' : esc(v)}" placeholder="0">`);
    if (f.kind === 'bool') return `<label class="toggle listing-toggle"><span><b>${esc(f.label)}</b></span><input type="checkbox" data-ln-bool="${f.key}" ${v ? 'checked' : ''}><i></i></label>`;
    const opts = f.d.options || [];
    if (f.kind === 'one') {
      const cur = f.arr ? [].concat(v || [])[0] : v;
      const inner = opts.map(o => `<button type="button" class="${String(cur) === o.v && cur !== '' && cur !== undefined ? 'is-active' : ''}" data-ln-one="${f.key}" data-v="${esc(o.v)}">${esc(o.l)}</button>`).join('');
      return `<div class="listing-q ${E[k] ? 'has-error' : ''}" data-f="${k}"><span>${esc(f.label)}</span><div class="onboarding-segmented-control">${inner}</div>${err(k)}</div>`;
    }
    const cur = [].concat(v || []).map(String);
    return `<div class="listing-q is-many ${E[k] ? 'has-error' : ''}" data-f="${k}"><span>${esc(f.label)}${f.req ? '' : ' <small>optional</small>'}</span><div class="onboarding-categories listing-chips">${opts.map(o => `<button type="button" class="onboarding-chip ${cur.includes(o.v) ? 'is-active' : ''}" data-ln-many="${f.key}" data-v="${esc(o.v)}"><span>${esc(o.l)}</span><span class="onboarding-tick">${ico('check')}</span></button>`).join('')}</div>${err(k)}</div>`;
  }
  function location(L) {
    const O = offerOf(L.v, L.cat), kind = locKind(O), n = noun(L.v, L.cat);
    if (kind === 'none') return '';
    const areas = O.locs ? AREAS.filter(x => O.locs.includes(x.id)) : AREAS;
    const areaSel = (k, label) => field(k, label, `<select id="ln-${k}" data-ln-loc><option value="">Choose…</option>${areas.map(x => `<option value="${x.id}" ${L.loc === x.id ? 'selected' : ''}>${esc(x.n)}</option>`).join('')}</select>`);
    const city = ((app() || {}).d || {}).city;
    const outside = city && !/dubai/i.test(city) ? `<small class="onboarding-hint listing-note">${ico('pin')}Listings cover Dubai areas for now — ${esc(city)} is coming.</small>` : '';
    if (kind === 'area') return SEC('ln-where', `Areas you cover${tip('Customers in these areas see your listing. Pick the areas you can reach on time.')}`, `<div class="onboarding-categories listing-chips ${E.areas ? 'has-error' : ''}" data-f="areas">${AREAS.map(x => `<button type="button" class="onboarding-chip ${L.areas.includes(x.id) ? 'is-active' : ''}" data-ln-area="${x.id}"><span>${esc(x.n)}</span><span class="onboarding-tick">${ico('check')}</span></button>`).join('')}</div>${err('areas')}${outside}`, `<small>${L.areas.length ? L.areas.length + ' chosen' : 'Choose all that apply'}</small>`);
    if (kind === 'meet') return SEC('ln-where', 'Where customers meet you', `<div class="form-grid listing-grid">${areaSel('loc', 'Area')}${field('meet', 'Meeting or pickup point <small>optional</small>', `<input id="ln-meet" data-ln-k="meet" value="${esc(L.meet)}" placeholder="e.g. Hotel lobby pickups across Dubai">`)}</div>${outside}`);
    const lease = O.lease || O.id === 'holiday';
    return SEC('ln-where', L.v === 'spaces' ? `Where is the ${esc(n)}?` : 'Where customers find you', `<div class="form-grid listing-grid">${areaSel('loc', O.locLabel || 'Area')}
        ${field('building', lease ? 'Building or community' : 'Building or venue name', `<input id="ln-building" data-ln-k="building" value="${esc(L.building)}" placeholder="${lease ? 'e.g. Marina Gate 1' : 'e.g. Al Serkal Avenue'}">`, lease ? "Can't find it? Type the name — we check it during review." : '')}
        ${lease ? field('unit', `Unit number <small>${ico('lock')}private</small>`, `<input id="ln-unit" data-ln-k="unit" value="${esc(L.unit)}" placeholder="e.g. 1204">`, 'Never shown on the listing — only shared when you choose') : ''}</div>${outside}`);
  }
  // the category's own questions, then where it is, then the optional extras
  function details(L, ctx) {
    use(ctx);
    const O = offerOf(L.v, L.cat), F = detailFields(O);
    const main = F.filter(f => f.req && f.kind !== 'many'), lists = F.filter(f => f.req && f.kind === 'many'), extra = F.filter(f => !f.req);
    return `${main.length ? SEC('ln-basics', 'The basics', `<div class="listing-basics">${main.filter(f => f.kind !== 'number').map(f => control(L, f)).join('')}</div>${main.some(f => f.kind === 'number') ? `<div class="form-grid listing-grid">${main.filter(f => f.kind === 'number').map(f => control(L, f)).join('')}</div>` : ''}`) : ''}
      ${lists.map(f => SEC('ln-m_' + f.key, '', control(L, f))).join('')}
      ${location(L)}
      ${extra.length ? SEC('ln-extra', 'Extras', `${extra.filter(f => f.kind === 'many').map(f => control(L, f)).join('')}${extra.some(f => f.kind === 'bool') ? `<div class="listing-toggles">${extra.filter(f => f.kind === 'bool').map(f => control(L, f)).join('')}</div>` : ''}`, '<small>Optional — they help customers choose</small>') : ''}`;
  }
  function photos(L, ctx) {
    use(ctx);
    const O = offerOf(L.v, L.cat), min = minPhotos(L.v, O), count = L.img.length, ok = count >= min;
    const tips = { spaces: 'Bright photos of every room, the view and the building', services: 'Your finished work — real jobs, not stock photos', experiences: 'People enjoying it, the place, the details', memberships: 'The space, the equipment, a class in action', programs: 'Classrooms, facilities and activities — no children’s faces', health: 'Your facility and team — never patients', insurance: '' }[L.v];
    if (O.tile) return `<p class="onboarding-business-only">${ico('shield')}<span>Cover listings show your logo instead of photos — nothing to add here.</span></p>`;
    return SEC('ln-photos', `Photos${tip('JPG or PNG, at least 1024 px wide. No collages, watermarks or contact details in the photo.')}`, `<div class="listing-photos ${E.photos ? 'has-error' : ''}" data-f="photos">
        ${L.img.map((src, i) => `<figure class="listing-photo" draggable="true" data-ln-ph="${i}"><img src="${src}" alt="Photo ${i + 1}">${i === 0 ? '<em>Cover</em>' : `<button type="button" class="listing-photo-cover" data-ln-phcover="${i}">Make cover</button>`}<button type="button" class="listing-photo-remove" data-ln-phrm="${i}" aria-label="Remove photo ${i + 1}">${ico('x')}</button></figure>`).join('')}
        ${count < MAX_PHOTOS ? `<label class="onboarding-dropzone listing-photo-add"><input type="file" accept="image/jpeg,image/png,image/webp" multiple data-ln-photos hidden><span class="onboarding-dropzone-empty">${ico('upload')}<span><b>${count ? 'Add more' : 'Drag photos here or <u>browse</u>'}</b><small>${esc(tips)}</small></span></span></label>` : ''}
      </div>${err('photos')}<p class="listing-photo-count ${ok ? 'is-ok' : ''}">${ok ? `${ico('check')}${count} photos${count < min + 3 ? ` · listings like yours do best with ${min + 3} or more` : ''}` : `${count} of at least ${min}`}${count > 1 ? ' · drag to reorder' : ''}</p>`, `<small>The first one is the cover</small>`);
  }
  function words(L, ctx) {
    use(ctx);
    const sug = suggestedTitle(L), t = L.title, d = L.desc;
    return `${SEC('ln-title', 'Title', `${field('title', 'Title', `<input id="ln-title" data-ln-k="title" maxlength="70" value="${esc(t)}" placeholder="${esc(sug || 'A short, clear title')}">`, 'Keep it short — under 50 characters shows in full on phones')}
        <div class="listing-title-footer">${sug && sug !== t ? `<button type="button" class="onboarding-magic-write" data-ln-act="usetitle">${ico('spark')}Use “${esc(sug)}”</button>` : '<span></span>'}<span class="onboarding-count ${t.length && t.length <= 70 ? 'is-ok' : ''}" data-ln-count="title">${t.length}/70</span></div>`)}
      ${SEC('ln-desc', 'Description', `<div class="onboarding-field onboarding-about ${E.desc ? 'has-error' : ''}" data-f="desc">
          <textarea id="ln-desc" data-ln-k="desc" maxlength="2000" placeholder="What's included, what's nearby, who it suits…">${esc(d)}</textarea>
          <div class="onboarding-about-footer"><button type="button" class="onboarding-magic-write" data-ln-act="writedesc">${ico('spark')}${d ? 'Rewrite it for me' : 'Write it for me'}</button><span class="onboarding-count ${d.trim().length >= 80 ? 'is-ok' : ''}" data-ln-count="desc">${d.length < 80 ? `${d.length}/80 min` : `${d.length}/2000`}</span></div>${err('desc')}</div>
        <small class="onboarding-hint listing-note">${ico('lock')}Don't add phone numbers or links — customers contact you through ${esc(SITE.name)}.</small>`)}`;
  }
  function price(L, ctx) {
    use(ctx);
    const O = offerOf(L.v, L.cat), pf = priceFields(O), dd = dateDef(O), pm = permitOf(O), a = app() || {}, d = a.d || {};
    const term = termOf(L), basis = (O.unit(asListing(L), viewState(L)) || '').replace(/^\//, 'per '), pd = priceDef(O);
    const label = L.cat === 'residential' ? (term === 'monthly' ? 'Monthly rent' : 'Yearly rent') : L.cat === 'gym' ? (L.a.billing === 'annual' ? 'Price per year' : 'Price per month') : pd.label === 'Budget' ? 'Price' : pd.label;
    const lic = isBiz(a) ? [d.trade || d.legal, d.licence && 'licence ' + d.licence].filter(Boolean).join(' · ') : [d.fullName || a.name, d.brnNo && 'BRN ' + d.brnNo].filter(Boolean).join(' · ');
    const dateLabel = dd ? ({ movein: 'Available from', checkin: 'Available from', date: 'Available from', start: 'Starts from' }[dd.id] || dd.label) : '';
    return `${SEC('ln-price', 'Price', `${pf.filter(f => f.kind === 'one').map(f => control(L, f)).join('')}
        <div class="form-grid listing-grid">${field('price', esc(label) + ' <small>(AED)</small>', `<div class="listing-money"><span>AED</span><input id="ln-price" type="number" inputmode="numeric" min="0" data-ln-k="price" value="${esc(L.price)}" placeholder="0"><em>${esc(basis)}</em></div>`, O.from ? 'Shown as “from” — your lowest price' : '')}
          ${pf.filter(f => f.kind === 'number').map(f => control(L, f)).join('')}
          ${O.lease ? field('deposit', 'Security deposit <small>(AED, optional)</small>', `<input id="ln-deposit" type="number" inputmode="numeric" min="0" data-ln-k="deposit" value="${esc(L.deposit)}" placeholder="0">`) : ''}</div>
        ${ctx && ctx.oddPrice ? `<p class="listing-notice is-amber">${ico('spark')}<span>Is AED ${esc((+L.price).toLocaleString())} ${esc(basis)} right? It's far from similar listings. Continue again if it is.</span></p>` : ''}`)}
      ${dd || weekly(L.v) ? SEC('ln-when', 'Availability', `${dd ? `<div class="form-grid listing-grid">${field('from', dateLabel, `<input id="ln-from" type="date" class="onboarding-date" data-ln-date value="${esc(L.from)}" min="${new Date().toISOString().slice(0, 10)}">`)}</div>` : ''}
        ${weekly(L.v) ? `<div class="listing-q is-many ${E.days ? 'has-error' : ''}" data-f="days"><span>Days you work</span><div class="onboarding-categories listing-chips">${DAYS.map(x => `<button type="button" class="onboarding-chip ${L.days.includes(x) ? 'is-active' : ''}" data-ln-day="${x}"><span>${x}</span><span class="onboarding-tick">${ico('check')}</span></button>`).join('')}</div>${err('days')}</div>
          <div class="onboarding-hours"><span>${ico('clock')}Hours</span><div class="onboarding-segmented-control">${HOURS.map(([id, t]) => `<button type="button" class="${L.hours === id ? 'is-active' : ''}" data-ln-hours="${id}">${t}</button>`).join('')}</div></div>` : ''}`) : ''}
      ${pm ? SEC('ln-permit', `Permit${tip(pm.hint)}`, `<div class="form-grid listing-grid">${field('permit', esc(pm.label), `<input id="ln-permit" data-ln-k="permit" value="${esc(L.permit)}" placeholder="${O.lease ? 'e.g. 7123456789' : 'e.g. HH-245981'}">`, 'We check it with the issuer before the listing goes live')}</div>`) : ''}
      ${lic ? `<p class="onboarding-private">${ico('shield')}<span>Your verified licence is attached automatically: <b>${esc(lic)}</b>.</span></p>` : ''}`;
  }
  // the provider's categories to choose from (only when they offer more than one)
  function categories(a, cur, ctx) {
    use(ctx);
    const cats = (a.cats || []).filter(c => VERTICALS[a.v].offers.some(o => o.id === c));
    if (cats.length < 2) return '';
    return `<div class="onboarding-categories ${E.cat ? 'has-error' : ''}">${cats.map(c => { const o = offerOf(a.v, c); return `<button type="button" class="onboarding-chip ${cur === c ? 'is-active' : ''}" data-ln-cat="${c}">${ico(o.icon || (window.UPF && UPF.OICO[c]) || VERTICALS[a.v].icon)}<span>${esc(o.label)}</span><span class="onboarding-tick">${ico('check')}</span></button>`; }).join('')}</div>${err('cat')}`;
  }

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
      priceFields(O).forEach(f => { const v = L.a[f.key]; if (v === undefined || v === '' || (f.kind === 'number' && !(+v > 0))) e['a_' + f.key] = f.kind === 'number' ? `Add the ${f.label.toLowerCase()}` : 'Pick one'; });
      if (dateDef(O) && !L.from) e.from = 'Choose a date';
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
    return [+L.price > 0, ...priceFields(O).map(f => L.a[f.key] !== undefined && L.a[f.key] !== ''), !dateDef(O) || L.from, !permitOf(O) || L.permit];
  }

  /* ---------- events: one binding per page ----------
     host: { get() → the listing being edited, errors() → the host's error map, commit(pop), saved(), cat(id) } */
  function bind(root, host) {
    const touch = (L, pop) => { if (!L.titled) L.title = suggestedTitle(L) || L.title; L.updated = Date.now(); if (!save()) toast('This browser is out of space — remove a photo or two'); host.commit(pop); };
    const clearErr = k => { const e = host.errors(); delete e[k]; };
    function addPhotos(L, files) {
      const room = MAX_PHOTOS - L.img.length; if (room <= 0) return toast(`Up to ${MAX_PHOTOS} photos`);
      [...files].slice(0, room).forEach(f => {
        if (!/^image\/(jpeg|png|webp)$/.test(f.type)) { toast('Use JPG or PNG photos'); return; }
        const img = new Image(), url = URL.createObjectURL(f);
        img.onload = () => {
          URL.revokeObjectURL(url);
          if (Math.max(img.width, img.height) < 1024) { host.errors().photos = 'This photo is too small. Use one at least 1024 px wide.'; host.commit(); return; }
          const k = Math.min(1, 1280 / Math.max(img.width, img.height)), c = document.createElement('canvas');
          c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          L.img.push(c.toDataURL('image/jpeg', .72)); clearErr('photos');
          if (!save()) { L.img.pop(); toast('This browser is out of space — remove a photo or two'); return; }
          touch(L);
        };
        img.onerror = () => { URL.revokeObjectURL(url); toast('We couldn’t read that photo — use JPG or PNG'); };
        img.src = url;
      });
    }
    const move = (L, from, to) => { if (from === to || from < 0) return; const [x] = L.img.splice(from, 1); L.img.splice(to, 0, x); touch(L); };
    let drag = -1;
    root.addEventListener('input', e => {
      const L = host.get(), t = e.target; if (!L) return;
      const k = t.dataset.lnK, num = t.dataset.lnNum;
      if (k) { L[k] = t.value; if (k === 'title') L.titled = !!t.value.trim(); }
      else if (num) L.a[num] = t.value === '' ? '' : +t.value;
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
      if (t.matches('[data-ln-num]')) touch(L); // the suggested title follows the numbers too
    });
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
    categories, details, photos, words, price, validate, priceOdd, parts, bind, fit, tip
  };
})();
