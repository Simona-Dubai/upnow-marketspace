/* Portfolio / Service catalogue + Add listing wizard + Deals + Channels & team */
(function () {
  const { ico, esc, av, aed, st, S, save, leads, listings, listingById, VX, catLabel, toast, modal, closeModal, drawer, closeDrawer, go, render } = PWA;

  /* ============ PORTFOLIO ============ */
  PWA.pages.portfolio = () => {
    const X = VX(), LS = listings();
    const f = S.lstFilter;
    const cats = X.cats.filter(c => LS.some(l => l.cat === c.id));
    const shown = LS.filter(l => f === 'all' || l.status === f || l.cat === f);
    const tip0 = 0; const tip = l => l.status === 'draft' ? (l.units || 'Finish setup to submit') : l.status === 'pending' ? 'UpNow review · usually under 24 h' : l.quality < 80 ? 'Add 6+ photos and an Arabic title to lift quality' : l.resp > 10 ? `Avg reply ${l.resp} min — faster replies rank higher` : '';
    return `<div class="ph"><div><h1>${esc(X.catalogue)}</h1><p>${S.v === 'spaces' ? 'Everything you rent out on UpNow — apartments, stays, venues, courts and yachts.' : 'Every service you sell on UpNow — cleaning, AC, salon and clinic.'}</p></div><span class="sp"></span>
      <div class="acts"><button class="btn btn-g btn-sm" data-act="addListing">${ico('plus')}Add ${S.v === 'spaces' ? 'listing' : 'service'}</button></div></div>
      <div class="g4" style="margin-bottom:16px">${[['Live on UpNow', LS.filter(l => l.status === 'live').length, 'live'], ['In review', LS.filter(l => l.status === 'pending').length, 'pending'], ['Drafts', LS.filter(l => l.status === 'draft').length, 'draft'], ['Paused', LS.filter(l => l.status === 'paused').length, 'paused']].map(k => `<div class="kpi" data-act="lstFilter" data-arg="${k[2]}" style="${f === k[2] ? 'border-color:var(--g6);box-shadow:0 0 0 3px var(--g1)' : ''}"><small>${k[0]}</small><b>${k[1]}</b></div>`).join('')}</div>
      <div class="fbar"><button class="chip ${f === 'all' ? 'on' : ''}" data-act="lstFilter" data-arg="all">All <span class="c">${LS.length}</span></button>${cats.map(c => `<button class="chip ${f === c.id ? 'on' : ''}" data-act="lstFilter" data-arg="${c.id}">${esc(c.l)} <span class="c">${LS.filter(l => l.cat === c.id).length}</span></button>`).join('')}</div>
      <div class="lgrid">${shown.map(l => `<article class="lcard" data-act="openListing" data-arg="${l.id}"><div class="im"><img src="${l.img}" alt="">${PWA.stTag(l.status)}<span class="cat">${esc(catLabel(l.cat))}</span></div>
        <div class="bd"><b class="t">${esc(l.t)}</b><span class="hint">${ico('pin')} ${esc(l.area)} · ${esc(l.units)}</span><span class="pr">${aed(l.price)}${l.basis ? ` <span>/ ${l.basis}</span>` : ''}</span>${tip(l) ? `<span class="tip">${ico('bolt')}${esc(tip(l))}</span>` : ''}</div>
        <div class="ms"><div><small>Views</small><b>${l.views.toLocaleString()}</b></div><div><small>Leads</small><b>${l.leads}</b></div><div><small>Quality</small><b style="color:${l.quality < 80 ? 'var(--amber)' : 'var(--g7)'}">${l.quality}</b></div></div></article>`).join('')}
        <button class="addc" data-act="addListing"><i>${ico('plus')}</i>Add ${S.v === 'spaces' ? 'a listing' : 'a service'}<span class="hint" style="font-weight:500">${X.cats.map(c => c.l).join(' · ')}</span></button></div>`;
  };
  PWA.acts.lstFilter = k => { S.lstFilter = S.lstFilter === k && k !== 'all' ? 'all' : k; save(); render(); };

  PWA.openListing = id => {
    const l = listingById(id); if (!l) return;
    const LL = leads().filter(x => x.lst === id);
    const checks = [['Business verified', 1], ['Licence valid', l.status !== 'draft' || l.v === 'spaces'], ['6+ photos', l.quality > 70], ['Arabic title & description', l.quality > 85], ['Price & availability set', 1], [S.v === 'spaces' ? 'Permit / Trakheesi number' : 'Service area set', l.status !== 'draft']];
    drawer(`<div style="position:relative"><img src="${l.img}" style="width:100%;height:190px;object-fit:cover;display:block"><button class="x" style="position:absolute;top:12px;right:12px;background:#fff" data-act="closeDrawer">${ico('x')}</button></div>
      <div class="dr-h" style="border-top:0"><div style="flex:1"><div style="display:flex;gap:6px;margin-bottom:6px">${PWA.stTag(l.status)}<span class="st mute">${esc(catLabel(l.cat))}</span></div><h3>${esc(l.t)}</h3><small>${esc(l.area)} · ${l.meta.join(' · ')}</small></div><div style="text-align:right"><b style="font-size:18px">${aed(l.price)}</b>${l.basis ? `<br><small>per ${l.basis}</small>` : ''}</div></div>
      <div class="dr-b">
        <div class="kv" style="grid-template-columns:repeat(4,1fr);margin-top:0"><div><span>Views</span><b>${l.views.toLocaleString()}</b></div><div><span>Contacts</span><b>${l.contacts}</b></div><div><span>Leads</span><b>${l.leads}</b></div><div><span>Reply</span><b>${l.resp || '—'} min</b></div></div>
        <div class="sect-t">Listing quality · ${l.quality}/100</div>
        <div class="chk">${checks.map(c => `<div class="${c[1] ? '' : 'no'}">${ico(c[1] ? 'check' : 'alert')}${esc(c[0])}${c[1] ? '' : ' <a style="color:var(--g7);margin-left:auto;cursor:pointer" data-act="addListing" data-arg="${l.cat}">Fix</a>'}</div>`).join('')}</div>
        <div class="sect-t">Availability</div><p style="margin:0;font-size:13px">${esc(l.units)}</p>
        <div class="sect-t">How customers contacted you · 30 days</div>
        <div class="abk">${(PWA.CHAT ? [['wa', .38], ['call', .30], ['chat', .24], ['form', .08]] : [['wa', .44], ['call', .34], ['sms', .12], ['form', .10]]).map(([k, p]) => `<div data-act="lfAct" data-arg="${id}|${k}" style="cursor:pointer;${(PWA.S.lf || 'all') === k ? 'border-color:var(--g6);background:var(--g1)' : ''}">${ico(PWA.ACTS[k][1])}<b>${Math.round(l.contacts * p)}</b><small>${PWA.ACTS[k][0]}</small></div>`).join('')}</div>
        <div class="sect-t" style="display:flex;align-items:center">All leads · ${LL.length}<span style="flex:1"></span>${['all', 'open', 'won', 'lost'].map(f => `<button class="chip ${(PWA.S.lf || 'all') === f ? 'on' : ''}" style="height:24px;font-size:11px;padding:0 9px;margin-left:4px;text-transform:capitalize" data-act="lfAct" data-arg="${id}|${f}">${f}</button>`).join('')}</div>
        <table class="tbl" style="font-size:12.5px"><thead><tr><th>Lead</th><th>Came via</th><th>Stage</th><th>Last</th></tr></thead><tbody>
        ${LL.filter(x => { const f = PWA.S.lf || 'all'; return f === 'all' || (f === 'open' ? !['won', 'lost'].includes(x.stage) : PWA.ACTS[f] ? x.act === f : x.stage === f); }).map(x => `<tr class="ck" data-act="openLead" data-arg="${x.id}"><td><div class="li">${av(x.n, 'sm')}<div><b>${esc(x.n)}</b><small style="display:block;max-width:190px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(x.msg)}</small></div></div></td><td><span class="act ${PWA.ACTS[x.act][2]}" style="height:24px;font-size:11px;padding:0 9px">${ico(PWA.ACTS[x.act][1])}${PWA.ACTS[x.act][0]}</span><div style="margin-top:4px">${PWA.srcTag(x.src)}</div></td><td>${st(VX().stages[x.stage], x.stage === 'new' ? 'info' : x.stage === 'lost' ? 'mute' : '')}</td><td class="hint">${PWA.ago(x.ago)}</td></tr>`).join('') || '<tr><td colspan="4" class="hint">No leads match.</td></tr>'}</tbody></table>
        <p class="hint">Showing the ${LL.length} most recent of ${l.leads} leads. <a style="color:var(--g7);font-weight:700;cursor:pointer" data-go="leads">Open in pipeline →</a></p>
      </div>
      <div class="dr-f"><button class="btn btn-g btn-sm" data-act="addListing" data-arg="${l.cat}">${ico('edit')}Edit</button>
        ${l.status === 'live' ? `<button class="btn btn-o btn-sm" data-act="lstStatus" data-arg="${l.id}|paused">${ico('pause')}Pause</button>` : l.status === 'paused' ? `<button class="btn btn-o btn-sm" data-act="lstStatus" data-arg="${l.id}|live">${ico('play')}Resume</button>` : l.status === 'draft' ? `<button class="btn btn-o btn-sm" data-act="lstStatus" data-arg="${l.id}|pending">Submit for review</button>` : ''}
        <button class="btn btn-o btn-sm" data-act="preview">${ico('eye')}Preview</button><button class="btn btn-ghost btn-sm" data-act="boost">${ico('bolt')}Boost</button></div>`, 1);
  };
  PWA.acts.lfAct = a => { const [id, f] = a.split('|'); PWA.S.lf = PWA.S.lf === f ? 'all' : f; PWA.openListing(id); };
  PWA.acts.openListing = id => PWA.openListing(id);
  PWA.acts.lstStatus = a => { const [id, s] = a.split('|'); const l = listingById(id); l.status = s; const x = S.extraListings.find(z => z.id === id); if (x) x.status = s; save(); render(); PWA.openListing(id); toast({ paused: 'Listing paused — hidden from search', live: 'Listing is live again', pending: 'Submitted to UpNow for review' }[s]); };
  PWA.acts.preview = () => toast('Opening public listing preview');
  PWA.acts.boost = () => toast('Boost is free during launch mode · featured for 7 days');

  /* ============ ADD LISTING WIZARD ============ */
  const W = { step: 0, d: {} };
  const STEPS = () => S.v === 'spaces' ? ['Category', 'Location', 'Details', 'Pricing', 'Photos', 'How customers reach you', 'Review'] : ['Category', 'Service area', 'Details', 'Pricing', 'Photos', 'How customers reach you', 'Review'];
  PWA.acts.addListing = cat => { closeDrawer(); W.step = cat ? 1 : 0; W.d = { cat: cat || null, action: 'contact', basis: null, amen: [] }; wz(); };
  function wz() {
    const X = VX(), steps = STEPS(), c = X.cats.find(z => z.id === W.d.cat);
    const sp = S.v === 'spaces';
    const B = [
      () => `<div class="opts">${X.cats.map(z => `<button class="opt ${W.d.cat === z.id ? 'on' : ''}" data-act="wzSet" data-arg="cat|${z.id}"><img src="${z.img}" alt=""><b>${esc(z.l)}</b><small>Priced per ${z.basis.join(' or ')}</small></button>`).join('')}</div>
        <p class="hint" style="margin-top:14px">Same categories customers browse on the UpNow marketplace. Search filters and the customer form adapt to your choice.</p>`,
      () => sp ? `<div class="frm"><div class="fld full"><label>Search address</label><input id="w-addr" placeholder="Start typing a building or community" value="${esc(W.d.addr || '')}"></div>
          <div class="fld"><label>Community / area</label><select id="w-area">${['Dubai Marina', 'Downtown Dubai', 'Business Bay', 'Palm Jumeirah', 'JLT', 'JVC', 'Dubai Hills', 'Al Quoz', 'Dubai Harbour'].map(a => `<option ${W.d.area === a ? 'selected' : ''}>${a}</option>`).join('')}</select></div>
          <div class="fld"><label>${W.d.cat === 'yacht' ? 'Marina berth' : 'Building / property'}</label><input id="w-bld" value="${esc(W.d.bld || '')}" placeholder="${W.d.cat === 'yacht' ? 'Dubai Harbour · Berth 14' : 'Avenue Residence'}"></div>
          <div class="fld"><label>${W.d.cat === 'apartment' ? 'Unit number' : 'Unit / space name'}</label><input placeholder="A-1204"></div>
          <div class="fld"><label>${W.d.cat === 'apartment' || W.d.cat === 'holiday' ? 'Permit / Trakheesi no.' : 'Operating permit'}</label><input placeholder="Required for publication"></div></div>
          <div style="height:120px;border-radius:12px;background:linear-gradient(135deg,#dfeee6,#cfe4f0);position:relative;overflow:hidden"><span style="position:absolute;left:48%;top:40%;background:var(--g8);color:#fff;font-size:11px;font-weight:700;padding:4px 9px;border-radius:99px">${ico('pin')} Pin location</span></div>`
        : `<div class="fld"><label>Where do you serve?</label><div class="chipset" id="w-cov">${['All Dubai', 'Dubai Marina', 'JLT', 'JBR', 'Downtown Dubai', 'Business Bay', 'Palm Jumeirah', 'Al Barsha', 'JVC', 'Dubai Hills', 'Arabian Ranches', 'Mirdif'].map((a, i) => `<button class="chip ${i === 0 ? 'on' : ''}" onclick="this.classList.toggle('on')">${a}</button>`).join('')}</div></div>
          <div class="frm"><div class="fld"><label>Delivered at</label><select><option>Customer location</option><option>My branch / salon / clinic</option><option>Both</option></select></div><div class="fld"><label>Call-out fee outside area</label><input placeholder="AED 0"></div>
          <div class="fld"><label>Lead time</label><select><option>Same day</option><option>Next day</option><option>48 hours</option></select></div><div class="fld"><label>Emergency service</label><select><option>No</option><option>Yes · 24/7</option></select></div></div>`,
      () => {
        const F = {
          apartment: [['Bedrooms', ['Studio', '1', '2', '3', '4+']], ['Bathrooms', ['1', '2', '3', '4+']], ['Furnishing', ['Furnished', 'Unfurnished', 'Semi']]],
          holiday: [['Bedrooms', ['Studio', '1', '2', '3', '4', '5+']], ['Max guests', ['2', '4', '6', '8', '10+']], ['Check-in', ['Self check-in', 'Host greets']]],
          venue: [['Venue type', ['Rooftop', 'Ballroom', 'Meeting room', 'Garden', 'Studio']], ['Capacity', ['Up to 20', '50', '100', '200+']], ['Catering', ['In-house', 'External allowed', 'None']]],
          padel: [['Court type', ['Indoor', 'Outdoor', 'Panoramic']], ['Players', ['2', '4']], ['Equipment', ['Rackets included', 'Rental', 'None']]],
          yacht: [['Length', ['< 40 ft', '40–60 ft', '60–90 ft', '90 ft+']], ['Guests', ['Up to 10', '20', '40+']], ['Crew', ['Captain + crew', 'Captain only']]],
          cleaning: [['Service type', ['Regular', 'Deep clean', 'Move-in / out', 'Post-construction']], ['Team size', ['1', '2', '3', '4+']], ['Supplies', ['Included', 'Customer provides']]],
          ac: [['Service', ['Servicing', 'Gas top-up', 'Duct cleaning', 'Repair', 'Annual contract']], ['Unit types', ['Split', 'Ducted', 'Window', 'Central']], ['Warranty', ['30 days', '90 days', 'None']]],
          haircut: [['For', ['Women', 'Men', 'Kids', 'All']], ['Duration', ['30 min', '45 min', '60 min', '90 min']], ['Stylist level', ['Junior', 'Senior', 'Director']]],
          dentist: [['Treatment', ['Check-up', 'Cleaning', 'Whitening', 'Filling', 'Orthodontics']], ['Duration', ['30 min', '40 min', '60 min']], ['Insurance', ['Direct billing', 'Reimbursement', 'Self-pay only']]]
        }[W.d.cat] || [];
        const am = sp ? ['Parking', 'Pool', 'Gym', 'Balcony', 'Sea view', 'Pets allowed', 'Security', 'Wi-Fi', 'Kitchen', 'AV equipment'] : ['Eco products', 'Same-day', 'Female staff', 'Weekend slots', 'Insured', 'Card payment'];
        return `<div class="fld"><label>Title (English)</label><input id="w-t" value="${esc(W.d.t || '')}" placeholder="${sp ? '2 BR with marina view · Avenue Residence' : 'Deep cleaning for apartments & villas'}"></div>
          <div class="fld"><label>Title (Arabic)</label><input dir="rtl" placeholder="العنوان بالعربية — improves ranking"></div>
          ${F.map(([k, o]) => `<div class="fld"><label>${k}</label><div class="chipset">${o.map((x, i) => `<button class="chip ${i === 1 || (o.length < 3 && !i) ? 'on' : ''}" onclick="this.parentNode.querySelectorAll('.chip').forEach(c=>c.classList.remove('on'));this.classList.add('on')">${x}</button>`).join('')}</div></div>`).join('')}
          <div class="fld"><label>${sp ? 'Amenities' : 'Highlights'}</label><div class="chipset">${am.map(a => `<button class="chip" onclick="this.classList.toggle('on')">${a}</button>`).join('')}</div></div>
          <div class="fld"><label>Description</label><textarea placeholder="What makes it great? Mention access, rules and what's included."></textarea></div>`;
      },
      () => { const bs = c ? c.basis : ['month']; if (!W.d.basis) W.d.basis = bs[0]; return `<div class="fld"><label>Charged per</label><div class="seg">${bs.map(b => `<button class="${W.d.basis === b ? 'on' : ''}" data-act="wzSet" data-arg="basis|${b}">${b[0].toUpperCase() + b.slice(1)}</button>`).join('')}</div></div>
        <div class="frm"><div class="fld"><label>Price (AED)</label><input id="w-p" type="number" value="${W.d.price || ''}" placeholder="${W.d.cat === 'apartment' ? '120000' : W.d.cat === 'holiday' ? '850' : '250'}"></div>
        <div class="fld"><label>${sp ? 'Security deposit' : 'Minimum order'}</label><input placeholder="${sp ? '5% of annual rent' : 'AED 0'}"></div>
        ${W.d.cat === 'apartment' ? `<div class="fld"><label>Cheques accepted</label><select><option>1, 2 or 4 cheques</option><option>1 cheque only</option><option>Up to 12 cheques</option></select></div><div class="fld"><label>Available from</label><input type="date" value="2026-10-15"></div>` : `<div class="fld"><label>${sp ? 'Minimum booking' : 'Duration'}</label><input placeholder="${sp ? '2 hours' : '4 hours'}"></div><div class="fld"><label>Cancellation</label><select><option>Free until 24 h before</option><option>Free until 48 h before</option><option>Non-refundable</option></select></div>`}</div>
        <div class="tip" style="font-size:12.5px;color:#1f5a8c;background:#e8f1f9;padding:10px 12px;border-radius:10px;display:flex;gap:8px">${ico('chart')}<span>Similar ${esc(c ? c.l.toLowerCase() : '')} listings in ${esc(W.d.area || 'your area')} are priced <b>${W.d.cat === 'apartment' ? 'AED 105k–128k / year' : W.d.cat === 'holiday' ? 'AED 620–980 / night' : 'AED 180–320'}</b>.</span></div>`; },
      () => `<div class="upl">${ico('upload')}<b>Drag photos here or choose from device</b><span class="hint">Up to 20 · landscape works best · the first photo is the cover</span><div style="margin-top:12px"><button class="btn btn-o btn-sm" data-act="wzPhotos">Choose photos</button></div></div>
        ${W.d.photos ? `<div class="thumbs">${X.cats.map(z => z.img).concat([c.img]).slice(0, 5).map((s, i) => `<div class="${i === 0 ? 'cv1' : ''}"><img src="${i === 0 ? c.img : s}"></div>`).join('')}</div>` : ''}
        <div class="frm" style="margin-top:14px"><div class="fld"><label>Video tour (optional)</label><input placeholder="YouTube or Vimeo link"></div><div class="fld"><label>${sp ? 'Floor plan' : 'Price list / menu'}</label><input placeholder="PDF or image"></div></div>`,
      // channels only: UpNow has no booking or request flows — every contact is a lead
      () => `<p class="hint" style="margin:0 0 12px">Customers contact you directly on the channels you choose. Every call, message or email becomes a lead on your Leads board.</p>
        <div class="sect-t">Route new leads to</div><div class="frm"><div class="fld"><label>Owner</label><select>${PW.TEAM[S.v].map(t => `<option>${esc(t[0])}</option>`).join('')}</select></div><div class="fld"><label>Auto-reply</label><select><option>On · instant acknowledgement</option><option>Off</option></select></div></div>
        <div class="sect-t">Channels shown on listing</div><div class="chipset">${['Call', 'WhatsApp', ...(PWA.CHAT ? ['UpNow chat'] : []), 'SMS', 'Email'].map(x => `<button class="chip on" onclick="this.classList.toggle('on')">${x}</button>`).join('')}</div>`,
      () => { const t = W.d.t || (c ? c.l + ' in ' + (W.d.area || 'Dubai') : 'New listing'); return `<div class="prev"><div class="lcard" style="cursor:default"><div class="im"><img src="${c ? c.img : ''}"><span class="st warn" style="position:absolute;top:10px;left:10px;background:#fff">In review</span><span class="cat">${esc(c ? c.l : '')}</span></div><div class="bd"><b class="t">${esc(t)}</b><span class="hint">${ico('pin')} ${esc(W.d.area || 'All Dubai')}</span><span class="pr">${aed(+W.d.price || (c && c.id === 'apartment' ? 120000 : 250))} <span>/ ${W.d.basis || (c ? c.basis[0] : '')}</span></span></div></div>
        <div><div class="sect-t" style="margin-top:0">Before it goes live</div><div class="chk">${[['Business verified', 1], ['Category & location', 1], ['Price set', !!W.d.price], ['Photos added', !!W.d.photos], [sp ? 'Permit number' : 'Licence on file', sp ? 0 : 1]].map(x => `<div class="${x[1] ? '' : 'no'}">${ico(x[1] ? 'check' : 'alert')}${x[0]}${x[1] ? '' : ' <span class="hint" style="margin-left:4px">— can add later</span>'}</div>`).join('')}</div>
        <p class="hint" style="margin-top:14px">UpNow reviews every new listing, usually within 24 hours. Leads, calls and WhatsApp taps from this listing will appear in Demand and Communications.</p></div></div>`; }
    ];
    modal(`<div class="wz"><div class="side"><h3>New ${sp ? 'listing' : 'service'}</h3>${steps.map((s, i) => `<button class="${i < W.step ? 'done' : ''} ${i === W.step ? 'on' : ''}" data-act="wzGo" data-arg="${i}"><span>${i < W.step ? '✓' : i + 1}</span>${s}</button>`).join('')}</div>
      <div class="body"><div class="bh"><div style="flex:1"><div class="hint" style="font-weight:700">Step ${W.step + 1} of ${steps.length}${c ? ' · ' + esc(c.l) : ''}</div><h2>${steps[W.step]}</h2></div><button class="x" data-act="closeModal">${ico('x')}</button></div>
      <div class="bb2">${B[W.step]()}</div>
      <div class="bf"><button class="btn btn-ghost btn-sm" data-act="wzDraft">Save draft</button><span class="sp"></span>${W.step ? `<button class="btn btn-o btn-sm" data-act="wzGo" data-arg="${W.step - 1}">Back</button>` : ''}<button class="btn btn-g btn-sm" data-act="wzNext" ${!W.d.cat ? 'disabled style="opacity:.4;pointer-events:none"' : ''}>${W.step === steps.length - 1 ? 'Submit for review' : 'Continue'}</button></div></div></div>`, 'wzm');
    PWA.$('#scrim .modal').style.width = 'min(880px,100%)'; PWA.$('#scrim .modal').style.padding = '0';
  }
  const grab = () => { ['addr', 'area', 'bld', 't', 'p'].forEach(k => { const el = PWA.$('#w-' + k); if (el) W.d[k === 'p' ? 'price' : k] = el.value; }); };
  PWA.acts.wzSet = a => { grab(); const [k, v] = a.split('|'); W.d[k] = v; if (k === 'cat') { W.d.basis = null; W.step = 1; } wz(); };
  PWA.acts.wzGo = i => { grab(); if (!W.d.cat) return; W.step = +i; wz(); };
  PWA.acts.wzPhotos = () => { W.d.photos = 1; wz(); toast('5 photos added'); };
  PWA.acts.wzDraft = () => { grab(); finish('draft'); };
  PWA.acts.wzNext = () => { grab(); if (W.step < STEPS().length - 1) { W.step++; wz(); } else finish('pending'); };
  function finish(status) {
    const c = VX().cats.find(z => z.id === W.d.cat);
    const l = { id: 'U' + Date.now(), v: S.v, cat: c.id, t: W.d.t || c.l + ' · ' + (W.d.bld || W.d.area || 'Dubai'), area: W.d.area || 'All Dubai', price: +W.d.price || (c.id === 'apartment' ? 120000 : 250), basis: W.d.basis || c.basis[0], img: c.img, status, views: 0, contacts: 0, leads: 0, quality: W.d.photos ? 78 : 55, units: status === 'draft' ? 'Draft · finish setup' : 'Awaiting UpNow review', meta: [c.l], resp: 0 };
    S.extraListings.push(l); S.lstFilter = 'all'; save(); closeModal(); go('portfolio'); toast(status === 'draft' ? 'Draft saved' : 'Submitted — UpNow will review within 24 h');
  }

  /* ============ DEALS ============ */
  PWA.pages.deals = () => {
    const X = VX(), D = PW.DEALS[S.v];
    return `<div class="ph"><div><h1>${esc(X.deals)}</h1><p>${S.v === 'spaces' ? 'Leases, stays and bookings that came from your leads — from offer to handover.' : 'Jobs, appointments and contracts — from quote to payment.'}</p></div><span class="sp"></span><div class="acts"><button class="btn btn-o btn-sm" data-go="leads">${ico('kanban')}Back to leads</button></div></div>
      <div class="g4" style="margin-bottom:16px">${(S.v === 'spaces' ? [['Active leases', '103'], ['Occupancy', '92%'], ['Renewals in 60 days', '24'], ['Rent due this week', 'AED 184k']] : [['Jobs this week', '38'], ['On-time arrival', '94%'], ['Active contracts', '46'], ['Avg rating', '4.8 ★']]).map(k => `<div class="kpi"><small>${k[0]}</small><b>${k[1]}</b></div>`).join('')}</div>
      <section class="pn" style="padding:4px 0">${D.map(d => `<div class="dl" data-act="openDeal" data-arg="${d[0]}"><div><b>${d[0]}</b><small>${esc(d[3])}</small></div><div style="display:flex;gap:10px;align-items:center">${av(d[1], 'sm')}<div><b>${esc(d[1])}</b><small>${esc(d[2])}</small></div></div>
        <div><div class="trk">${d[6].map((s, i) => `<i class="${i < d[5] ? 'd' : i === d[5] ? 'c' : ''}"></i>`).join('')}</div><div class="trkl">${d[5] >= d[6].length ? 'Complete' : 'Now: ' + esc(d[6][d[5]])} · ${d[5]}/${d[6].length}</div></div><b>${esc(d[4])}</b></div>`).join('')}</section>`;
  };
  PWA.acts.openDeal = id => {
    const d = PW.DEALS[S.v].find(x => x[0] === id);
    drawer(`<div class="dr-h"><div style="flex:1"><h3>${esc(d[0])} · ${esc(d[1])}</h3><small>${esc(d[2])} · ${esc(d[4])}</small></div><button class="x" data-act="closeDrawer">${ico('x')}</button></div>
      <div class="dr-b"><div class="sect-t" style="margin-top:0">Progress</div>${d[6].map((s, i) => `<div class="ar"><span class="st ${i < d[5] ? '' : i === d[5] ? 'warn' : 'mute'}">${i < d[5] ? 'Done' : i === d[5] ? 'Current' : 'Next'}</span><div class="bd"><b>${i + 1}. ${esc(s)}</b></div></div>`).join('')}
      <div class="sect-t">Documents</div>${(S.v === 'spaces' ? ['Emirates ID & visa', 'Tenancy contract', 'Ejari registration', 'Cheques / transfer receipt'] : ['Quote', 'Service report & photos', 'Customer sign-off', 'Invoice']).map((x, i) => `<div class="ar">${ico('file')}<div class="bd"><b>${x}</b></div>${st(i < d[5] ? 'On file' : 'Pending', i < d[5] ? '' : 'mute')}</div>`).join('')}</div>
      <div class="dr-f"><button class="btn btn-g btn-sm" data-act="dealAdv" data-arg="${id}">${ico('check')}Complete current step</button><button class="btn btn-o btn-sm" data-go="inbox">${ico('msg')}Message customer</button></div>`);
  };
  PWA.acts.dealAdv = id => { const d = PW.DEALS[S.v].find(x => x[0] === id); if (d[5] < d[6].length) d[5]++; render(); PWA.acts.openDeal(id); toast('Step completed · customer notified'); };

  /* ============ SETTINGS: channels & team ============ */
  PWA.pages.settings = () => `<div class="ph"><div><h1>Channels & team</h1><p>Connect every place leads come from, and decide who answers them.</p></div></div>
    <div class="g2"><section class="pn"><div class="pn-h"><h2>Lead channels</h2><span class="sub">Everything lands in one inbox</span></div>
      ${PW.CHANNELS.map(c => { const on = c[3] || S.chOn[c[0]]; const s = PW.SOURCES[c[0]]; return `<div class="chr"><span class="sw" style="--c:${s.c}">${esc(s.s.slice(0, 2))}</span><div class="bd"><b>${esc(c[1])}</b><small>${on ? esc(c[2] === 'Not connected' ? 'Connected just now' : c[2]) : 'Not connected'}</small></div>${on ? st('Live') : `<button class="btn btn-o btn-sm" data-act="connect" data-arg="${c[0]}">Connect</button>`}</div>`; }).join('')}</section>
    <div><section class="pn"><div class="pn-h"><h2>Team</h2><span class="sp"></span><button class="btn btn-o btn-sm" data-act="invite">${ico('plus')}Invite</button></div>
      ${PW.TEAM[S.v].map(t => `<div class="chr">${av(t[0])}<div class="bd"><b>${esc(t[0])}</b><small>${esc(t[1])} · ${esc(t[2])}</small></div><span class="hint">${t[3] !== '—' ? 'Avg reply ' + t[3] : ''}</span>${st(t[4], t[4] === 'Online' ? '' : 'mute')}</div>`).join('')}</section>
    <section class="pn mt"><div class="pn-h"><h2>Response rules</h2></div>
      ${[['Instant auto-acknowledgement', 'UpNow assistant greets every new lead within seconds', 1], ['Round-robin assignment', 'Share new leads evenly across available team', 1], ['15-minute reply target', 'Escalate to owner if no human reply', 1], ['Auto-reminders for ' + (S.v === 'spaces' ? 'viewings' : 'appointments'), '24 h and 1 h before, via the lead\'s channel', 1], ['After-hours away message', 'Outside 9 AM – 9 PM', 0]].map((r, i) => `<div class="chr"><div class="bd"><b>${r[0]}</b><small>${r[1]}</small></div><span class="tog ${(S['r' + i] ?? r[2]) ? 'on' : ''}" data-act="rule" data-arg="${i}|${r[2]}" style="cursor:pointer"></span></div>`).join('')}</section></div></div>`;
  PWA.acts.connect = k => { S.chOn[k] = 1; save(); render(); toast(PW.SOURCES[k].l + ' connected'); };
  PWA.acts.rule = a => { const [i, d] = a.split('|'); const cur = S['r' + i] ?? +d; S['r' + i] = cur ? 0 : 1; save(); render(); };
  PWA.acts.invite = () => modal(`<div class="mh"><h3>Invite a team member</h3><button class="x" data-act="closeModal">${ico('x')}</button></div><div class="mb"><div class="fld"><label>Email or mobile</label><input placeholder="name@company.ae"></div><div class="fld"><label>Role</label><select><option>Agent — sees assigned leads</option><option>Manager — sees team</option><option>Field staff — calendar only</option></select></div><button class="btn btn-g" style="width:100%" data-act="invSend">Send invite</button></div>`);
  PWA.acts.invSend = () => { closeModal(); toast('Invite sent'); };
})();
