/* Create listing (pages/listing-new.html) — every listing after the first. The first listing is part of onboarding
   (js/pages/join.js, step 4); this page is for the next ones, for drafts left for later, and for "Your listings".
   The form itself is shared: js/marketplace/listing-form.js (UPLF).
     Start      — what we already know; the category (only when they offer more than one)
     1 Details  — the category's own fields + where it is
     2 Photos   — photos (first = cover), title, description
     3 Price    — price on the category's basis, availability, the per-listing permit
     Review     — the real search card, a summary, who customers contact, then "Submit for review"
   There is no admin tool yet, so "Your listings" carries a clearly marked prototype control to simulate the review.
   Views by hash: #new · #edit=ID · #done=ID · #mine. */
(function () {
  const { VERTICALS, offerOf } = UP;
  const U = UPUI, { ico, esc, toast, initials, auth } = U;
  const F = UPLF;
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.getElementById('ob');
  const HREF = PATHS.href;
  const CHANNELS = { wa: 'WhatsApp', call: 'Calls', email: 'Email', sms: 'SMS' };
  const appState = a => !a ? 'none' : a.status === 'draft' || !a.status ? 'draft' : 'sent';

  /* ---------- view state (never saved) ---------- */
  const A = { pop: '', dir: '', saved: false, seen: new Set(), entering: true, priceOk: '', preview: '' };
  let previewOpen = false, errors = {}, pick = '';
  function sec(id, title, body, aside = '') {
    const key = route().view + ':' + id, isNew = !A.seen.has(key); A.seen.add(key);
    return `<section class="onboarding-section ${isNew && !A.entering ? 'is-enter' : ''}" data-sec="${id}">${title || aside ? `<div class="onboarding-section-header"><h2>${title}</h2>${aside}</div>` : ''}${body}</section>`;
  }
  const ctx = extra => Object.assign({ errors, sec }, extra || {});
  const ART = `<svg viewBox="0 0 160 120" aria-hidden="true"><circle cx="80" cy="62" r="50" fill="#eef7f2"/>
      <rect x="36" y="30" width="88" height="66" rx="10" fill="#fff" stroke="#d8efe3" stroke-width="2"/><rect x="44" y="38" width="72" height="34" rx="6" fill="#25946a"/>
      <path d="M48 68l14-14 10 9 8-6 16 11z" fill="#136142"/><circle cx="104" cy="47" r="5" fill="#e0a526"/>
      <rect x="44" y="78" width="44" height="5" rx="2.5" fill="#136142"/><rect x="44" y="87" width="28" height="4" rx="2" fill="#d3dad5"/>
      <g class="onboarding-illustration-star"><circle cx="128" cy="28" r="13" fill="#e0a526"/><path d="M128 21v14M121 28h14" stroke="#fff" stroke-width="3" stroke-linecap="round"/></g></svg>`;
  const hero = (title, sub) => `<div class="onboarding-hero"><div><h1 class="onboarding-title">${title}</h1><p class="onboarding-subtitle">${sub}</p></div><div class="onboarding-illustration">${ART}</div></div>`;
  const firstName = () => ((auth.user() || {}).first || (auth.user() || {}).name || '').split(' ')[0];
  const ago = t => { const m = Math.round((Date.now() - t) / 6e4); return m < 1 ? 'just now' : m < 60 ? m + ' min ago' : m < 1440 ? Math.round(m / 60) + ' h ago' : Math.round(m / 1440) + ' d ago'; };

  /* ---------- routing ---------- */
  function route() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (h === 'mine') return { view: 'mine' };
    if (h.startsWith('edit=') && F.byId(h.slice(5))) return { view: 'edit', id: h.slice(5) };
    if (h.startsWith('done=') && F.byId(h.slice(5))) return { view: 'done', id: h.slice(5) };
    return { view: 'new' };
  }
  const goHash = h => { if (location.hash === '#' + h) render(); else location.hash = h; };
  const cur = () => { const r = route(); return r.view === 'edit' ? F.byId(r.id) : null; };

  /* ---------- start: what we know, the category, what you'll need ---------- */
  function viewStart(a) {
    const cats = (a.cats || []).filter(c => VERTICALS[a.v].offers.some(o => o.id === c));
    if (!pick || !cats.includes(pick)) pick = cats.length === 1 ? cats[0] : '';
    const items = F.db().items, drafts = items.filter(x => x.status === 'draft' || x.status === 'changes').sort((x, y) => y.updated - x.updated);
    const first = !items.some(x => x.status !== 'draft');
    const O = pick && offerOf(a.v, pick), g = pick && F.gateOf(pick), n = pick ? F.noun(a.v, pick) : 'listing';
    const where = [a.d && a.d.display || a.name, VERTICALS[a.v].label, a.d && a.d.city].filter(Boolean).join(' · ');
    const need = O ? [
      [O.tile ? 'shield' : 'camera', O.tile ? 'No photos needed — your logo is shown' : `At least ${F.minPhotos(a.v, O)} photos of the ${n}`],
      ['pin', { place: `Where the ${n} is`, area: 'The areas you cover', meet: 'Where customers meet you', none: 'Nothing about location — cover applies across the UAE' }[F.locKind(O)]],
      ['tag', `Your price${O.basis ? ' (' + O.basis + ')' : ''}`],
      ...(F.permitOf(O) ? [['doc', `The ${F.lowerFirst(F.permitOf(O).label)}`]] : [])
    ] : [];
    return `${hero(first ? 'Create your first listing' : 'Create a listing', `${firstName() ? `Hi ${esc(firstName())}! ` : ''}About 10 minutes. Everything saves as you go, so you can finish later.`)}
      ${drafts.length ? sec('drafts', 'Pick up where you left off', `<div class="listing-drafts">${drafts.slice(0, 3).map(x => `<a class="listing-draft" href="#edit=${x.id}">${x.img[0] ? `<img src="${x.img[0]}" alt="">` : `<i>${ico(VERTICALS[x.v].icon)}</i>`}<span><b>${esc(F.titleOf(x))}</b><small>${x.status === 'changes' ? 'Changes requested' : `Step ${Math.min(x.step, 3)} of 3`} · saved ${ago(x.updated)}</small></span>${ico('chevR')}</a>`).join('')}</div>`) : ''}
      <div class="onboarding-known">${ico(VERTICALS[a.v].icon)}<span><b>From your application</b> · ${esc(where)}</span></div>
      ${cats.length > 1 ? sec('cat', `What is this listing for?${F.tip('You can list in the categories you applied for. To add another, update your application.')}`, F.categories(a, pick, ctx()))
        : cats.length ? `<p class="onboarding-business-only">${ico(O.icon || VERTICALS[a.v].icon)}<span>This listing is for <b>${esc(O.label)}</b> — the category from your application.</span></p>` : ''}
      ${O ? sec('need', `What you'll need`, `<ul class="listing-need">${need.map(([i, t]) => `<li>${ico(i)}<span>${esc(t)}</span></li>`).join('')}</ul>`) : ''}
      ${g ? `<p class="listing-notice is-amber">${ico('clock')}<span>You can build this listing now. To submit it, add your <b>${esc(g.t)}</b> — you chose to add it later in your application.</span></p>` : ''}
      ${!F.verified() ? `<p class="onboarding-private">${ico('shield')}<span>Your business is still being verified. You can create and submit listings now — they go to review as soon as you're approved.</span></p>` : ''}`;
  }

  /* ---------- the three steps (the shared form) ---------- */
  const viewDetails = L => `${hero(`Tell customers about your ${esc(F.noun(L.v, L.cat))}`, `Only what matters for ${esc(offerOf(L.v, L.cat).label.toLowerCase())} — the rest comes from your profile.`)}${F.details(L, ctx())}`;
  const viewPhotos = L => `${hero('Make it stand out', `Photos sell a ${esc(F.noun(L.v, L.cat))} — then say what makes it worth a call.`)}${F.photos(L, ctx())}${F.words(L, ctx())}`;
  const viewPrice = L => `${hero('Price and availability', 'Set your price — customers agree the details with you directly.')}${F.price(L, ctx({ oddPrice: A.priceOk === 'ask' }))}`;

  /* ---------- review ---------- */
  function viewReview(L) {
    const O = offerOf(L.v, L.cat), a = F.app() || {}, d = a.d || {}, g = F.gateOf(L.cat), n = F.noun(L.v, L.cat), P = F.permitOf(O), k = F.locKind(O);
    const edit = s => `<button type="button" class="text-link" data-goto="${s}">Edit</button>`;
    const filled = F.detailFields(O).filter(f => { const v = L.a[f.key]; return f.kind === 'bool' ? v : f.kind === 'many' ? (v || []).length : v !== undefined && v !== ''; });
    const val = f => { const v = L.a[f.key]; return f.kind === 'bool' ? f.label : f.kind === 'many' ? [].concat(v).map(x => F.optLabel(f, x)).join(', ') : f.kind === 'number' ? String(v) + (f.unit ? ' ' + f.unit : '') : F.optLabel(f, [].concat(v)[0]); };
    const row = (label, body, s) => `<div class="listing-review-row"><span><small>${label}</small><b>${body}</b></span>${s ? edit(s) : ''}</div>`;
    const ch = (a.channels || []).map(c => CHANNELS[c]).filter(Boolean).join(', '), hrs = (F.HOURS.find(h => h[0] === a.hours) || F.HOURS[1])[1];
    const unit = O.unit(F.asListing(L), F.viewState(L)) || '';
    const checks = [['Details', true], [O.tile ? 'Logo shown instead of photos' : `${L.img.length} photos`, true], ['Price and availability', true],
      ...(P ? [['Permit ' + L.permit, true]] : []), ...(g ? [[`Add your ${g.t} — the listing waits for it`, false]] : []),
      [F.verified() ? 'Your business is verified' : 'Your business is in review — the listing waits for it', F.verified()]];
    return `${hero('Check and submit', `This is how customers will see your ${esc(n)}. Our team reviews every listing before it goes live.`)}
      ${sec('card', 'On the search page', `<div class="listing-review-card">${F.cardOf(L)}</div>`)}
      ${sec('sum', 'Your listing', `<div class="listing-review">
        ${row('Details', esc(filled.slice(0, 6).map(val).join(' · ') || '—'), 1)}
        ${k !== 'none' ? row(k === 'area' ? 'Areas' : 'Location', esc(F.whereOf(L) || '—') + (L.unit ? ` <em>${ico('lock')}unit ${esc(L.unit)} private</em>` : ''), 1) : ''}
        ${O.tile ? '' : row('Photos', `<span class="listing-review-thumbs">${L.img.slice(0, 5).map(s => `<img src="${s}" alt="">`).join('')}${L.img.length > 5 ? `<em>+${L.img.length - 5}</em>` : ''}</span>`, 2)}
        ${row('Title and description', esc(L.title) + `<em>${esc(L.desc.slice(0, 120))}${L.desc.length > 120 ? '…' : ''}</em>`, 2)}
        ${row('Price', esc(U.priceText(F.asListing(L), F.viewState(L)).n + ' ' + unit) + (L.deposit ? ` <em>Deposit AED ${esc(L.deposit)}</em>` : ''), 3)}
        ${L.from || F.weekly(L.v) ? row('Availability', esc([L.from && 'from ' + F.niceDate(L.from), F.weekly(L.v) && (L.days.length === 7 ? 'every day' : L.days.join(', ')), F.weekly(L.v) && (F.HOURS.find(h => h[0] === L.hours) || F.HOURS[1])[1]].filter(Boolean).join(' · ')), 3) : ''}
        ${P ? row(P.label, esc(L.permit), 3) : ''}</div>`)}
      ${sec('who', 'Who customers contact', `<div class="listing-who"><span class="listing-who-avatar">${d.photo ? `<img src="${d.photo}" alt="">` : esc(initials(d.display || a.name || '?'))}</span><span><b>${esc(d.display || a.name || '')}</b><small>${esc([ch, hrs, (d.langs || []).join(', ')].filter(Boolean).join(' · '))}</small></span></div>
        <small class="onboarding-hint listing-note">${ico('user')}From your provider profile — the same on every listing.</small>`)}
      ${sec('ready', 'Before it goes live', `<ul class="listing-checks">${checks.map(([t, ok]) => `<li class="${ok ? 'is-ok' : 'is-wait'}">${ico(ok ? 'check' : 'clock')}<span>${esc(t)}</span></li>`).join('')}</ul>`)}`;
  }
  function confirmSubmit(L) {
    const n = F.noun(L.v, L.cat), a = F.app() || {};
    U.openModal(`<div class="onboarding-confirm"><button class="close-btn onboarding-confirm-close" data-close aria-label="Close">${ico('x')}</button>
      <span class="onboarding-confirm-mark">${ico('shield')}</span>
      <h3>Submit for review?</h3>
      <p class="onboarding-confirm-subtitle">Our team checks every listing before it goes live — usually within 24 hours. Nothing is published until it's approved.</p>
      <label class="onboarding-confirm-agree"><input type="checkbox" data-lnagree><span>These details are accurate, the photos are of this ${esc(n)}, and I'm allowed to advertise it.</span></label>
      <button type="button" class="btn btn-primary onboarding-confirm-submit" data-lnsubmit disabled>Submit for review</button>
      ${a.phone ? `<p class="onboarding-confirm-footer">${ico('wa')}We'll WhatsApp you when it's reviewed</p>` : a.email ? `<p class="onboarding-confirm-footer">${ico('mail')}We'll email ${esc(a.email)} when it's reviewed</p>` : ''}</div>`, 'onboarding-confirm-modal');
  }

  /* ---------- submitted ---------- */
  function viewDone(L) {
    const n = F.noun(L.v, L.cat), g = F.gateOf(L.cat), a = F.app() || {}, ok = F.verified();
    const bits = Array.from({ length: 18 }, (_, k) => { const ang = k / 18 * Math.PI * 2, r = 70 + (k % 3) * 22; return `<span style="--x:${Math.round(Math.cos(ang) * r)}px;--y:${Math.round(Math.sin(ang) * r)}px;--r:${k * 47}deg;--d:${(k % 4) * 40}ms" class="c${k % 4}"></span>`; }).join('');
    const H = { review: ['Listing sent for review', `Thanks${firstName() ? ', ' + esc(firstName()) : ''}. Our team checks it against your details — usually within 24 hours. We'll ${a.phone ? 'WhatsApp you' : 'let you know'} as soon as it's live.`],
      verify: ['Listing saved — it goes to review once you\'re verified', `Your business is still being verified. As soon as it's approved, this ${esc(n)} goes to review on its own — nothing else to do.`],
      licence: ['Almost there — add your licence to submit', `This ${esc(n)} is ready. It goes to review as soon as your ${esc(g ? g.t : 'licence')} is added to your application.`] }[L.status] || ['Listing saved', ''];
    const steps = [['is-done', 'Listing complete', 'Details, photos and price are in'],
      ...(F.GATE[L.cat] ? [[g ? 'is-now' : 'is-done', `Your ${esc(F.gateName(L.cat))}`, g ? 'Add it to your application to continue' : 'Added and checked']] : []),
      [ok ? 'is-done' : g ? '' : 'is-now', 'Your business verified', ok ? 'Approved' : 'We’re checking your application'],
      [L.status === 'review' ? 'is-now' : '', 'Listing review', 'Usually within 24 hours'],
      ['', 'Live on ' + esc(SITE.name), 'Customers can find and contact you']];
    return `<div class="onboarding-done"><div class="onboarding-done-mark">${L.status === 'review' ? `<span class="onboarding-confetti" aria-hidden="true">${bits}</span>` : ''}<span class="onboarding-done-icon ${L.status === 'review' ? '' : 'is-wait'}">${L.status === 'review' ? '<svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>' : ico('clock')}</span></div>
      <h1 class="onboarding-title">${H[0]}</h1><p class="onboarding-subtitle">${H[1]}</p>
      <ol class="onboarding-timeline">${steps.map(([st, t, sub], i) => `<li class="${st}" style="--i:${i}"><i>${st === 'is-done' ? ico('check') : i + 1}</i><span><b>${t}</b><small>${sub}</small></span></li>`).join('')}</ol>
      <div class="onboarding-done-actions"><a class="btn btn-primary" href="#new">${ico('plus')}Create another listing</a><a class="btn btn-outline" href="#mine">Your listings</a></div></div>`;
  }

  /* ---------- your listings ---------- */
  function viewMine() {
    const list = [...F.db().items].sort((x, y) => y.updated - x.updated);
    const action = L => ({ draft: [`#edit=${L.id}`, 'Continue'], changes: [`#edit=${L.id}`, 'Fix and resubmit'], licence: [HREF.join, 'Add licence'], verify: [`#done=${L.id}`, 'View'], review: [`#done=${L.id}`, 'View'], live: [`#edit=${L.id}`, 'Edit'], rejected: [`#edit=${L.id}`, 'Read why'] })[L.status];
    const note = L => { const g = F.gateOf(L.cat);
      return ({ draft: `Step ${Math.min(L.step, 3)} of 3 · saved ${ago(L.updated)}`, licence: `Add your ${g ? g.t : 'licence'} to submit this listing`, verify: 'Goes to review once your business is verified',
        review: "We're checking it — usually within 24 hours", changes: L.reason, live: 'Live since ' + new Date(L.updated).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), rejected: L.reason })[L.status] || ''; };
    // prototype only: there is no review tool yet, so these simulate the team's decisions
    const demo = L => {
      const b = (act, t) => `<button type="button" class="btn btn-outline btn-sm" data-demo="${act}" data-id="${L.id}">${t}</button>`;
      const btns = L.status === 'verify' ? b('verify', 'Approve my business') : L.status === 'review' ? b('live', 'Approve') + b('changes', 'Request changes') + b('rejected', 'Not approved') : L.status === 'live' ? b('changes', 'Request changes') : '';
      return btns ? `<details class="listing-demo"><summary>Prototype · simulate the review</summary><div>${btns}</div></details>` : '';
    };
    const rows = list.map(L => { const [href, t] = action(L), st = F.STATUS[L.status];
      return `<div class="listing-row" data-sec="row-${L.id}"><a class="listing-row-main" href="${href}">${L.img[0] ? `<img src="${L.img[0]}" alt="">` : `<i>${ico(VERTICALS[L.v].icon)}</i>`}<span><b>${esc(F.titleOf(L))}</b><small>${esc(offerOf(L.v, L.cat).label)}${F.whereOf(L) ? ' · ' + esc(F.whereOf(L)) : ''}</small>
        <span class="listing-row-status"><span class="status-pill ${st[1]}">${st[0]}</span><em>${esc(note(L))}</em></span></span></a>
        <div class="listing-row-side"><a class="btn ${['draft', 'changes', 'licence'].includes(L.status) ? 'btn-primary' : 'btn-outline'} btn-sm" href="${href}">${t}</a>${L.status === 'draft' ? `<button type="button" class="text-link" data-rmdraft="${L.id}">Delete draft</button>` : ''}</div>${demo(L)}</div>`; }).join('');
    return `<div class="listing-mine">${hero('Your listings', list.length ? `${list.filter(x => x.status === 'live').length} live · ${list.filter(x => ['licence', 'verify', 'review'].includes(x.status)).length} waiting · ${list.filter(x => ['draft', 'changes'].includes(x.status)).length} to finish` : 'Nothing here yet — create your first listing.')}
      <div class="listing-mine-top"><a class="btn btn-primary" href="#new">${ico('plus')}Create listing</a></div>
      <div class="listing-rows">${rows}</div></div>`;
  }

  /* ---------- progress ---------- */
  const STEPS = [['Details', 'details'], ['Photos', 'photos'], ['Price', 'price']];
  const fillOf = (L, n) => { const p = F.parts(L, STEPS[n - 1][1]); return p.length ? p.filter(Boolean).length / p.length : 1; };
  function progress(L) {
    const s = L.step;
    if (s > 3) return `<div class="onboarding-header"><div class="onboarding-progress"><span><b>Review</b> · last check</span><span>About 1 min left</span></div>
      <ol class="onboarding-step-bar">${STEPS.map(([t], k) => `<li class="is-done"><button type="button" data-goto="${k + 1}" title="Edit ${t}"><i><b style="width:100%"></b></i><small>${ico('check')}${t}</small></button></li>`).join('')}</ol></div>`;
    return `<div class="onboarding-header"><div class="onboarding-progress"><span><b>Step ${s} of 3</b> · ${STEPS[s - 1][0]}</span><span>About ${[6, 3, 2][s - 1]} min left</span></div>
      <ol class="onboarding-step-bar">${STEPS.map(([t], k) => { const n = k + 1, st = n < s ? 'is-done' : n === s ? 'is-now' : '', tag = n < s ? 'button' : 'span';
        return `<li class="${st}"><${tag} ${n < s ? `type="button" data-goto="${n}" title="Edit ${t}"` : ''}><i><b style="width:${n > s ? 0 : Math.round(fillOf(L, n) * 100)}%"></b></i><small>${n < s && fillOf(L, n) === 1 ? ico('check') : ''}${t}</small></${tag}></li>`; }).join('')}</ol></div>`;
  }

  /* ---------- live preview (right column) ---------- */
  function preview(L) {
    const g = L && F.gateOf(L.cat), ok = F.verified();
    const status = !L ? `${ico('eye')}Your listing appears here as you fill it in` : g ? `${ico('clock')}Waits for your ${esc(g.t)} before review` : !ok ? `${ico('shield')}Goes to review once your business is verified` : `${ico('shield')}Reviewed by our team before it goes live`;
    return `<div class="onboarding-preview"><div class="onboarding-preview-header">${ico('eye')}Live preview<span>On the search page</span></div>
      ${L ? `<div class="listing-preview-card">${F.cardOf(L)}</div>` : `<div class="listing-preview-empty">${ART}</div>`}
      <div class="onboarding-card-status ${L && (g || !ok) ? 'is-review' : ''}">${status}</div>
      <ul class="onboarding-why"><li>${ico('shield')}<span><b>Your verified profile</b>Name, contact and licence come with every listing.</span></li>
        <li>${ico('bolt')}<span><b>Direct leads</b>Customers call or WhatsApp you — no booking fees.</span></li>
        <li>${ico('check')}<span><b>Checked before it's live</b>Every listing is reviewed, usually within 24 hours.</span></li></ul></div>`;
  }

  /* ---------- in-place update (as onboarding: merge new markup, keep focus and scroll) ---------- */
  const keyOf = n => n.nodeType === 1 && (n.id || n.dataset.sec) ? n.tagName + ':' + (n.id || n.dataset.sec) + ':' + (n.className.split(' ')[0] || '') : '';
  const sameKind = (a, b) => a.nodeType === b.nodeType && (a.nodeType !== 1 || a.tagName === b.tagName);
  function morph(from, to) {
    if (from.nodeType === 3 || from.nodeType === 8) { if (from.nodeValue !== to.nodeValue) from.nodeValue = to.nodeValue; return; }
    for (const { name } of [...from.attributes]) if (!to.hasAttribute(name)) from.removeAttribute(name);
    for (const { name, value } of [...to.attributes]) if (from.getAttribute(name) !== value) from.setAttribute(name, value);
    const tag = from.tagName, focused = from === document.activeElement;
    if (tag === 'INPUT') { if (from.type === 'checkbox') from.checked = to.hasAttribute('checked'); else if (from.type !== 'file' && !focused && from.value !== (to.getAttribute('value') || '')) from.value = to.getAttribute('value') || ''; return; }
    if (tag === 'TEXTAREA') { if (!focused && from.value !== to.textContent) from.value = to.textContent; return; }
    const want = tag === 'SELECT' ? ([...to.options].find(o => o.hasAttribute('selected')) || to.options[0] || {}).value : null;
    morphKids(from, to);
    if (tag === 'SELECT' && want != null && from.value !== want) from.value = want;
  }
  function morphKids(from, to) {
    const keyed = new Map(); [...from.childNodes].forEach(k => { const key = keyOf(k); if (key) keyed.set(key, k); });
    let i = 0;
    for (const nk of [...to.childNodes]) {
      const c = from.childNodes[i], key = keyOf(nk); let match = null;
      if (key) { match = keyed.get(key) || null; keyed.delete(key); } else if (c && !keyOf(c) && sameKind(c, nk)) match = c;
      if (match) { if (match !== c) from.insertBefore(match, c || null); morph(match, nk); } else from.insertBefore(nk, c || null);
      i++;
    }
    while (from.childNodes.length > i) from.lastChild.remove();
  }
  function paint(html, whole) {
    const t = document.createElement('div'); t.innerHTML = html;
    if (whole || !root.firstElementChild || root.firstElementChild.dataset.view !== t.firstElementChild.dataset.view) root.innerHTML = html; else morphKids(root, t);
  }

  /* ---------- render ---------- */
  let lastView = '';
  function render() {
    const acc = document.querySelector('.onboarding-top [data-auth-slot]'); if (acc && U.accountButton) acc.outerHTML = U.accountButton();
    const a = F.app(), r = route();
    // signed out, no application or one not yet sent: onboarding handles all of it (sign-in, and the first listing is its
    // step 4) — so go there instead of showing a screen of our own
    if (!auth.user() || appState(a) !== 'sent') { location.replace(HREF.join); return; }
    F.settle();
    const L = r.id ? F.byId(r.id) : null;
    const whole = lastView !== r.view + (r.id || '') || !!A.dir; lastView = r.view + (r.id || '');
    if (whole) A.entering = true;
    if (r.view === 'mine' || r.view === 'done') {
      document.title = `${r.view === 'mine' ? 'Your listings' : 'Listing submitted'} | ${SITE.name}`;
      paint(`<div class="onboarding-grid is-done listing-page" data-view="${r.view}"><main class="onboarding-main"><div class="onboarding-panel is-done"><div class="onboarding-scroll"><div class="onboarding-step">${r.view === 'mine' ? viewMine() : viewDone(L)}</div></div></div></main></div>`, whole);
      return after(whole);
    }
    document.title = `Create listing | ${SITE.name}`;
    const editing = r.view === 'edit' && L, s = editing ? L.step : 0;
    const body = !editing ? viewStart(a) : [viewDetails, viewPhotos, viewPrice, viewReview][Math.min(s, 4) - 1](L);
    const banner = editing && (L.status === 'changes' || L.status === 'rejected') && L.reason ? `<p class="listing-notice is-red">${ico('x')}<span><b>${L.status === 'changes' ? 'Changes requested' : 'Not approved'}:</b> ${esc(L.reason)}</span></p>` : '';
    const pv = preview(editing ? L : null);
    const nextLabel = !editing ? 'Start listing' : s === 3 ? 'Review listing' : s > 3 ? 'Submit for review' : 'Continue';
    paint(`<div class="onboarding-grid listing-page" data-view="${r.view}${r.id || ''}"><main class="onboarding-main">
      ${editing ? progress(L) : ''}
      <div class="onboarding-panel"><div class="onboarding-scroll"><div class="onboarding-step ${A.dir ? 'is-in-' + A.dir : ''}">${banner}${body}</div></div>
        <div class="onboarding-nav">${editing ? `<button type="button" class="btn btn-ghost" data-act="back">${ico('chevL')}${s === 1 ? 'Start' : 'Back'}</button>` : `<a class="btn btn-ghost" href="#mine">Your listings</a>`}
          <span class="onboarding-save ${A.saved ? 'is-on' : ''}">${ico('check')}Draft saved</span>
          <button type="button" class="btn btn-primary onboarding-next" data-act="next">${nextLabel}${ico('chevR')}</button></div></div>
    </main>
      <aside class="onboarding-aside ${previewOpen ? 'is-open' : ''}"><button type="button" class="onboarding-preview-toggle" data-act="preview">${ico('eye')}<span>${previewOpen ? 'Hide preview' : 'Preview your listing'}</span>${ico('chev')}</button>${pv}</aside></div>`, whole);
    A.preview = pv;
    after(whole);
  }
  function after(whole) {
    if (A.pop) { const p = root.querySelector(A.pop); if (p) p.classList.add('is-pop'); }
    if (whole) window.scrollTo({ top: 0 });
    F.fit();
    A.pop = ''; A.dir = ''; A.entering = false; A.saved = false;
  }
  function flashSaved() { const s = root.querySelector('.onboarding-save'); if (!s) return; s.classList.remove('is-on'); void s.offsetWidth; s.classList.add('is-on'); }
  function refreshPreview() {
    const L = cur(), p = root.querySelector('.onboarding-preview'); if (!p || !L) return;
    const pv = preview(L); if (pv === A.preview) return;
    const t = document.createElement('div'); t.innerHTML = pv; morph(p, t.firstElementChild); A.preview = pv;
  }

  function goStep(L, n) { A.dir = n > L.step ? 'forward' : 'back'; L.step = n; errors = {}; F.save(); render(); window.scrollTo({ top: 0, behavior: calm.matches ? 'auto' : 'smooth' }); }
  function next() {
    const a = F.app(), r = route();
    if (r.view !== 'edit') {
      if (!pick) { errors.cat = 'Choose what this listing is for'; render(); const f = root.querySelector('.has-error'); if (f) f.classList.add('is-shake'); return; }
      const L = F.create(a.v, pick); errors = {}; A.dir = 'forward'; goHash('edit=' + L.id); return;
    }
    const L = F.byId(r.id);
    if (L.step > 3) return confirmSubmit(L);
    const e = F.validate(L, STEPS[L.step - 1][1]); Object.keys(errors).forEach(k => delete errors[k]); Object.assign(errors, e);
    if (L.step === 3 && !Object.keys(errors).length && F.priceOdd(L) && A.priceOk !== L.price) { A.priceOk = 'ask'; render(); A.priceOk = L.price; return; }
    if (Object.keys(errors).length) {
      render();
      const f = root.querySelector('.has-error'); if (f) { f.scrollIntoView({ block: 'center', behavior: calm.matches ? 'auto' : 'smooth' }); f.classList.add('is-shake'); }
      return;
    }
    goStep(L, L.step + 1);
  }

  /* ---------- events ---------- */
  F.bind(root, {
    get: cur, errors: () => errors,
    commit: pop => { A.pop = pop || ''; A.saved = true; render(); },
    saved: k => { if (k === 'price') A.priceOk = ''; flashSaved(); refreshPreview(); },
    cat: c => { pick = c; delete errors.cat; A.pop = `[data-ln-cat="${c}"]`; render(); }
  });
  root.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox') { e.preventDefault(); next(); } });
  root.addEventListener('animationend', e => { if (e.target.classList) e.target.classList.remove('is-pop', 'is-shake'); });
  root.addEventListener('click', e => {
    const b = sel => e.target.closest(sel); let x;
    const L = cur();
    if ((x = b('[data-act]'))) {
      const a = x.dataset.act;
      if (a === 'next') next();
      else if (a === 'back' && L) { if (L.step === 1) { A.dir = 'back'; goHash('new'); } else goStep(L, L.step - 1); }
      else if (a === 'preview') { previewOpen = !previewOpen; render(); }
      return;
    }
    if ((x = b('[data-goto]')) && L) return goStep(L, +x.dataset.goto);
    if ((x = b('[data-rmdraft]'))) { F.remove(x.dataset.rmdraft); toast('Draft deleted'); render(); return; }
    if ((x = b('[data-demo]'))) {
      const it = F.byId(x.dataset.id), act = x.dataset.demo, n = it && F.noun(it.v, it.cat);
      if (act === 'verify') { F.db().verified = true; F.save(); F.settle(); toast('Business approved (prototype)'); render(); return; }
      if (!it) return;
      if (act === 'live') F.setStatus(it, 'live');
      if (act === 'changes') { F.setStatus(it, 'changes', `Photo 1 looks like a stock image — use a real photo of this ${n}.`); it.step = 2; }
      if (act === 'rejected') F.setStatus(it, 'rejected', `We couldn't match this ${n} to your licence. Reply to our WhatsApp message to appeal.`);
      F.save(); render();
    }
  });
  // the confirm sheet lives outside the page root
  document.addEventListener('change', e => { if (e.target.matches('[data-lnagree]')) { const s = document.querySelector('[data-lnsubmit]'); if (s) s.disabled = !e.target.checked; } });
  document.addEventListener('click', e => { if (e.target.closest('[data-lnsubmit]')) { const L = cur(); U.closeModal(); if (L) { F.submit(L); goHash('done=' + L.id); } } });

  window.addEventListener('hashchange', () => { Object.keys(errors).forEach(k => delete errors[k]); A.priceOk = ''; render(); });
  document.addEventListener('upnow:auth', () => { F.reload(); render(); });
  render();
})();
