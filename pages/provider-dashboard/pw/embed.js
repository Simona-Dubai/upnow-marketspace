/* In-dashboard editors — adding or editing a listing (pages/listing-new.html) and adding a business type
   (pages/join.html?add=<vertical>) happen inside the dashboard: the sidebar and top bar stay, the page fills the
   main area under a slim toolbar, loaded with ?embed=1 so it drops its own header and footer (js/core/paths.js).
   Any link to those pages is caught here (Portfolio's Add listing sheet, its rows, Add a business type…), so the
   modules that build the links don't need to know. When the embedded page leaves its form — a listing sent, an
   application sent, "Your listings" — the dashboard takes over and goes where it was heading. */
(function () {
  const P = window.PWA; if (!P) return;
  const { ico, esc } = P;
  const FORMS = /\/pages\/(listing-new|join)\.html$/;
  const caught = href => {
    let u; try { u = new URL(href, location.href); } catch (e) { return null; }
    if (u.origin !== location.origin || !FORMS.test(u.pathname)) return null;
    if (/join\.html$/.test(u.pathname) && !u.searchParams.get('add')) return null; // joining itself stays a full page
    return u;
  };
  const LABEL = { spaces: 'Spaces', services: 'Services', experiences: 'Experiences', memberships: 'Memberships', programs: 'Programs', health: 'Health', insurance: 'Protection' };
  const titleOf = u => {
    if (/join\.html$/.test(u.pathname)) return ['Add a business type', LABEL[u.searchParams.get('add')] || ''];
    const h = u.hash;
    return /^#edit=|^#done=/.test(h) ? ['Your listing', ''] : ['New listing', ''];
  };

  const css = `<style id="em-style">
    .view.em{display:flex;flex-direction:column;padding:0;overflow:hidden}
    .em-bar{flex:none;display:flex;align-items:center;gap:12px;padding:10px 20px;background:#fff;border-bottom:1px solid var(--line)}
    .em-bar .em-back{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 12px 0 8px;border-radius:99px;border:1px solid var(--line2);background:#fff;font-weight:700;font-size:13px;color:var(--ink2);cursor:pointer}
    .em-bar .em-back:hover{border-color:var(--g6);color:var(--g8)}
    .em-bar .em-back .ico{width:15px;height:15px}
    .em-crumb{display:flex;align-items:center;gap:6px;min-width:0;font-size:13.5px;color:var(--ink3)}
    .em-crumb b{color:var(--ink);font-size:14.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .em-crumb .ico{width:13px;height:13px;flex:none}
    .em-crumb em{font-style:normal;font-size:11.5px;font-weight:800;padding:2px 9px;border-radius:99px;background:var(--g1);color:var(--g7)}
    .em-bar .sp{flex:1}
    .em-bar .em-save{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--ink3)}.em-bar .em-save .ico{width:14px;height:14px;color:var(--g6)}
    .em-bar .em-help{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 12px;border-radius:99px;font-weight:700;font-size:13px;color:var(--g7)}
    .em-bar .em-help:hover{background:var(--g1)}
    .em-body{position:relative;flex:1;min-height:0;background:var(--bg)}
    .em-body iframe{display:block;width:100%;height:100%;border:0;background:transparent;opacity:0;transition:opacity .25s}
    .em-body.ready iframe{opacity:1}
    .em-load{position:absolute;inset:0;display:grid;place-content:center;justify-items:center;gap:12px;color:var(--ink3);font-size:13px;transition:opacity .2s}
    .em-body.ready .em-load{opacity:0;pointer-events:none}
    .em-load i{width:30px;height:30px;border-radius:50%;border:3px solid var(--g2);border-top-color:var(--g7);animation:em-spin .8s linear infinite}
    @keyframes em-spin{to{transform:rotate(360deg)}}
    @media(max-width:640px){.em-bar{padding:8px 12px}.em-bar .em-save,.em-bar .em-help span{display:none}}
  </style>`;
  if (!document.getElementById('em-style')) document.head.insertAdjacentHTML('beforeend', css);

  let open = null; // the URL being shown, while an editor is open
  function show(u) {
    P.closeModal(); P.closeDrawer();
    const src = new URL(u.href); src.searchParams.set('embed', '1');
    const [title, sub] = titleOf(u);
    const view = document.getElementById('view');
    view.className = 'view em';
    view.innerHTML = `<div class="em-bar"><button class="em-back" type="button" data-em="back">${ico('chevL')}Portfolio</button>
        <span class="em-crumb">${ico('chevR')}<b>${esc(title)}</b>${sub ? `<em>${esc(sub)}</em>` : ''}</span><span class="sp"></span>
        <span class="em-save">${ico('check')}Saves as you go</span>
        <a class="em-help" href="https://wa.me/97140000000?text=${encodeURIComponent('Hi UpNow, I need help with ' + title.toLowerCase())}" target="_blank" rel="noopener">${ico('wa')}<span>Need help?</span></a></div>
      <div class="em-body"><div class="em-load"><i></i>Opening ${esc(title.toLowerCase())}…</div><iframe title="${esc(title)}" src="${esc(src.href)}"></iframe></div>`;
    // the sidebar shows where this belongs
    document.querySelectorAll('#sb .ni').forEach(a => a.classList.toggle('on', a.dataset.go === 'portfolio'));
    open = u.href;
    const fr = view.querySelector('iframe'), body = view.querySelector('.em-body');
    fr.addEventListener('load', () => {
      let w; try { w = fr.contentWindow; w.location.href; } catch (e) { return; }
      // left the form (sent, "Your listings", back to the dashboard…): the dashboard takes over
      if (!FORMS.test(w.location.pathname)) { leave(w.location.href); return; }
      body.classList.add('ready');
      // the listing editor moves between #new, #edit=… and #done=… without reloading: keep the toolbar title in step
      const crumb = () => { const b = view.querySelector('.em-crumb b'); if (b) b.textContent = titleOf(new URL(w.location.href))[0]; };
      w.addEventListener('hashchange', () => { crumb(); if (/^#done=/.test(w.location.hash)) P.toast('Listing sent for review'); });
      crumb();
    });
  }
  function close() { open = null; P.render(); }
  // where the embedded page was heading: a dashboard page opens here (top level), anything else replaces the dashboard
  function leave(href) {
    const u = new URL(href);
    // back to Portfolio from Portfolio ("Your listings"): just close; anything else (?added=…, another page) opens for real
    if (/\/provider-dashboard\/portfolio\.html$/.test(u.pathname) && !u.search && P.S.page === 'portfolio') { close(); return; }
    open = null;
    location.href = u.href;
  }

  /* ---------- a listing, for its provider: where it is, what's missing, and how customers will see it ----------
     Reads the account's listings ('upnow.listings@<account>', js/marketplace/listing-form.js); the customer view below is
     the marketplace's own listing page in preview mode (pages/listing.html?id=…&preview=1, js/pages/listing.js). */
  const read = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  const own = id => { const u = read('upnow.user'), who = u && (u.email || (u.dial || '') + u.phone); return who ? ((read('upnow.listings@' + who) || {}).items || []).find(x => x.id === id) : null; };
  const offerOf = L => { const V = window.SITEUP && SITEUP.VERTICALS && SITEUP.VERTICALS[L.v]; return V && V.offers.find(o => o.id === L.cat); };
  const area = id => String(id || '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).replace(/\bJ(br|lt|vc)\b/gi, m => m.toUpperCase());
  const ST = { draft: ['Draft', 'mute', 'Not sent yet — finish it and submit when you\'re ready.'], licence: ['Waiting for licence', 'warn', 'Add the licence it needs and it goes to review.'],
    verify: ['Waiting for approval', 'warn', 'It goes to review as soon as your business is approved — usually within 24 hours.'], review: ['In review', 'info', 'Our team is checking it against your details — usually within 24 hours.'],
    live: ['Live', 'ok', 'Customers can find it and contact you.'], changes: ['Changes requested', 'risk', 'Our team asked for changes — open it, fix and resubmit.'], rejected: ['Not approved', 'risk', 'This listing wasn\'t approved.'] };
  const day = t => t ? new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '';
  const tick = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
  // the marketplace's icons (components/icons.js, loaded as UPUI.ICONS) for listing facts; the dashboard's own otherwise
  const MI = n => window.UPUI && UPUI.ICONS && UPUI.ICONS[n] ? `<svg class="ico" viewBox="0 0 24 24">${UPUI.ICONS[n]}</svg>` : ico(n);
  const SKIP = ['price', 'rating', 'listedBy', 'verified', 'time', 'term'];
  const LISTY = ['amenities', 'equipment', 'facilities', 'food', 'activities', 'classes', 'insurance', 'meals'];
  const empty = v => v == null || v === '' || v === false || v === 0 || (Array.isArray(v) && !v.length) || (typeof v === 'number' && isNaN(v));
  // what the listing says, in the category's own words (data/listings.js defs): facts, and lists like amenities
  function factsOf(L, O) {
    const facts = [], lists = [], A = L.a || {};
    (O ? O.defs : []).forEach(d => {
      if (SKIP.includes(d.id)) return;
      const v = A[d.field || d.id] ?? A[d.id]; if (empty(v)) return;
      const lab = x => ((d.options || []).find(o => String(o.v) === String(x)) || {}).l || x;
      if (LISTY.includes(d.id) && Array.isArray(v)) { lists.push([d.label, v.map(lab)]); return; }
      let txt;
      if (d.type === 'toggle') txt = 'Yes';
      else if (d.type === 'date' || d.field === 'avail') { const t = Date.parse([].concat(v)[0]); txt = isNaN(t) ? String(v) : new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
      else if (Array.isArray(v)) txt = v.map(lab).join(', ');
      else { const x = String(lab(v)).replace(/\+$/, ''); txt = (/^\d{4,}$/.test(x) ? Number(x).toLocaleString() : x) + (d.unit && d.unit !== 'AED' ? ' ' + d.unit : ''); }
      if (!/undefined|NaN|null/.test(txt)) facts.push([d.label.replace(/ \(.*\)$/, ''), txt]);
    });
    return { facts, lists };
  }
  const keyFacts = (L, O) => { try { return (O.meta(L.a || {}, { a: L.a || {}, v: L.v, cat: L.cat, loc: L.loc }, { def: id => O.def ? O.def(id) : O.defs.find(x => x.id === id) }) || []).filter(m => m[1] && !/undefined|NaN|null/.test(m[1]) && !/^0\b/.test(String(m[1]))); } catch (e) { return []; } };

  const lvCss = `<style id="lv-style">
    .lv-scroll{flex:1;min-height:0;overflow:auto}
    .lv{max-width:1240px;margin:0 auto;padding:22px 24px 60px;display:flex;flex-direction:column;gap:18px;animation:lv-in .4s cubic-bezier(.2,.7,.2,1) both}
    @keyframes lv-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
    .lv-card{background:#fff;border:1px solid var(--line);border-radius:20px;padding:22px;box-shadow:var(--sh)}
    .lv-card h2{font-size:15.5px;display:flex;align-items:center;gap:8px;margin:0 0 14px}.lv-card h2 small{margin-left:auto;font-size:12px;color:var(--ink3);font-weight:600}
    .lv-card h2 a{margin-left:auto;font-size:12.5px;font-weight:700;color:var(--g7);display:inline-flex;align-items:center;gap:4px}.lv-card h2 a .ico{width:13px;height:13px}
    /* top: photos and the essentials */
    .lv-top{display:grid;grid-template-columns:150px minmax(0,1fr);gap:18px;align-items:start;background:#fff;border:1px solid var(--line);border-radius:20px;padding:16px 18px;box-shadow:var(--sh)}
    .lv-top .lv-info{padding:0;border:0;box-shadow:none;border-radius:0;min-width:0}
    .lv-hd{display:flex;align-items:flex-start;gap:16px}.lv-hd>div:first-child{flex:1;min-width:0}
    .lv-top .lv-acts{flex:none;flex-wrap:wrap;justify-content:flex-end;max-width:330px;margin:0;padding:0}
    .lv-top .lv-meta{flex-basis:100%;text-align:right;margin-top:2px}
    .lv-top .lv-info h1{margin-top:8px;font-size:26px}.lv-top .lv-loc{margin-top:4px}
    .lv-line{display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;margin-top:10px}
    .lv-top .lv-price{margin:0;font-size:22px}.lv-top .lv-keys{margin:0;gap:6px}.lv-top .lv-keys span{padding:5px 10px;font-size:12.5px;border-radius:10px}
    .lv-top .lv-note{margin-top:10px;padding:8px 12px;font-size:12.5px}
    .lv-thumb{position:relative;display:block;width:100%;aspect-ratio:4/3;border-radius:14px;overflow:hidden;background:var(--g1);cursor:pointer;padding:0;border:0}
    .lv-thumb img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .3s}.lv-thumb:hover img{transform:scale(1.04)}
    .lv-thumb .cnt{position:absolute;left:8px;bottom:8px;display:inline-flex;align-items:center;gap:5px;padding:4px 9px;border-radius:99px;background:rgba(255,255,255,.92);font-size:12px;font-weight:700;color:var(--ink)}.lv-thumb .cnt .ico{width:13px;height:13px}
    .lv-thumb.none{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;border:1.5px dashed var(--g2);color:var(--g7);font-size:12.5px;font-weight:700;text-decoration:none}.lv-thumb.none .ico{width:26px;height:26px}
    .lv-glance{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;align-items:stretch}.lv-glance.one{grid-template-columns:1fr}
    .lv-kpis{grid-column:1 / -1;display:flex;align-items:center;gap:8px;margin-top:-4px;padding-top:12px;border-top:1px solid var(--line)}
    .lv-kpis .lbl{flex:none;margin-right:auto;padding-right:12px;font-size:12px;color:var(--ink3);line-height:1.3}.lv-kpis .lbl b{display:block;font-size:13.5px;color:var(--ink)}
    .lv-kpis .k{flex:1;max-width:170px;display:flex;align-items:center;gap:8px;padding:7px 12px;border-radius:12px;background:var(--bg)}
    .lv-kpis .k .ico{width:15px;height:15px;color:var(--ink3);flex:none}
    .lv-kpis .k b{font-size:17px;line-height:1;color:var(--ink3)}.lv-kpis.on .k b{color:var(--ink)}.lv-kpis .k small{font-size:12px;color:var(--ink3);font-weight:600}
    .lv-gal{position:relative;display:grid;grid-template-columns:minmax(0,3fr) minmax(0,1fr);grid-template-rows:repeat(2,minmax(0,1fr));gap:6px;height:300px;border-radius:14px;overflow:hidden;background:var(--g1)}
    .lv-gal img{width:100%;height:100%;min-height:0;object-fit:cover;display:block}.lv-gal>*{min-width:0;min-height:0}
    .lv-gal>img:first-child{grid-row:1 / 3}
    .lv-gal.one{grid-template-columns:1fr;grid-template-rows:minmax(0,1fr)}.lv-gal.two{grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:minmax(0,1fr)}.lv-gal.two>img:first-child{grid-row:auto}
    .lv-gal .more{position:relative;overflow:hidden}.lv-gal .more b{position:absolute;inset:0;display:grid;place-items:center;background:rgba(8,32,22,.55);color:#fff;font-size:14px}
    .lv-gal .cnt{position:absolute;left:12px;bottom:12px;display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:99px;background:rgba(255,255,255,.92);font-size:12px;font-weight:700;color:var(--ink)}.lv-gal .cnt .ico{width:14px;height:14px}
    .lv-nophoto{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;border:1.5px dashed var(--g2);color:var(--g7);text-align:center;text-decoration:none}
    .lv-nophoto>.ico{width:34px;height:34px}.lv-nophoto b{font-size:15px;color:var(--ink)}.lv-nophoto span{font-size:12.5px;color:var(--ink3)}.lv-nophoto em{font-style:normal;margin-top:8px}
    .lv-info{display:flex;flex-direction:column}
    .lv-pill{align-self:flex-start;display:inline-flex;align-items:center;gap:8px;padding:5px 12px 5px 10px;border-radius:99px;font-size:12px;font-weight:800;background:#fbf1e2;color:#8a5a14}
    .lv-pill i{position:relative;width:8px;height:8px;border-radius:50%;background:#e0a526}
    .lv-pill i:after{content:"";position:absolute;inset:-4px;border-radius:50%;border:2px solid currentColor;opacity:.5;animation:lv-ping 1.8s ease-out infinite}
    @keyframes lv-ping{from{transform:scale(.6);opacity:.8}to{transform:scale(1.8);opacity:0}}
    .lv-pill.info{background:var(--g1);color:var(--g8)}.lv-pill.info i{background:var(--g6)}
    .lv-pill.ok{background:#e6f6ec;color:#16723f}.lv-pill.ok i{background:#1faa59}
    .lv-pill.risk{background:#fdf0ef;color:#8f2f2a}.lv-pill.risk i{background:var(--red)}
    .lv-pill.mute{background:#f1f3f2;color:var(--ink2)}.lv-pill.mute i{background:var(--ink3)}.lv-pill.mute i:after{display:none}
    .lv-info h1{margin:12px 0 0;font-family:var(--serif);font-weight:400;font-size:30px;line-height:1.12;color:var(--g9)}
    .lv-loc{display:flex;align-items:center;gap:6px;margin-top:6px;color:var(--ink3);font-size:13px}.lv-loc .ico{width:14px;height:14px;flex:none}
    .lv-price{margin-top:14px;font-size:26px;font-weight:800;letter-spacing:-.01em}.lv-price small{font-size:13px;font-weight:600;color:var(--ink3)}
    .lv-keys{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
    .lv-keys span{display:inline-flex;align-items:center;gap:7px;padding:7px 12px;border-radius:12px;background:var(--bg);font-size:13px;font-weight:600}.lv-keys .ico{width:16px;height:16px;color:var(--g7)}
    .lv-note{margin-top:14px;padding:12px 14px;border-radius:12px;background:#fff8ea;border:1px solid #f3dfb5;font-size:13px;color:#7a5413;line-height:1.45}
    .lv-note.info{background:var(--g1);border-color:var(--g2);color:var(--g8)}.lv-note.ok{background:#e6f6ec;border-color:#c9ecd6;color:#16723f}.lv-note.risk{background:#fdf0ef;border-color:#f3cfcc;color:#8f2f2a}.lv-note.mute{background:var(--bg);border-color:var(--line);color:var(--ink2)}
    .lv-acts{display:flex;flex-wrap:wrap;gap:8px;margin-top:auto;padding-top:18px}
    .lv-meta{margin-top:12px;font-size:12px;color:var(--ink3)}
    /* body: what the listing says (left) · where it stands (right) */
    .lv-main{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:18px;align-items:start}
    .lv-col{display:flex;flex-direction:column;gap:18px;min-width:0}
    .lv-about{margin:0;font-size:14px;line-height:1.65;color:var(--ink2);white-space:pre-line}
    .lv-missing{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:12px;border:1.5px dashed var(--line2);font-size:13px;color:var(--ink3)}.lv-missing a{margin-left:auto;font-weight:700;color:var(--g7)}
    .lv-facts{display:grid;grid-template-columns:1fr 1fr;column-gap:28px}
    .lv-facts div{display:flex;justify-content:space-between;gap:12px;padding:11px 0;border-bottom:1px solid var(--line);font-size:13.5px}
    .lv-facts span{color:var(--ink3)}.lv-facts b{text-align:right}
    .lv-list+.lv-list{margin-top:16px}.lv-list small{display:block;margin-bottom:8px;font-size:12px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.04em}
    .lv-chips{display:flex;flex-wrap:wrap;gap:8px}
    .lv-chips span{display:inline-flex;align-items:center;gap:7px;padding:8px 12px;border-radius:12px;border:1px solid var(--line);font-size:13px;font-weight:600}.lv-chips .ico{width:14px;height:14px;color:var(--g7)}
    .lv-place{display:grid;grid-template-columns:150px minmax(0,1fr);gap:16px;align-items:center}
    .lv-place svg{width:100%;height:auto;display:block;border-radius:14px}
    .lv-place b{display:block;font-size:15px}.lv-place span{display:block;margin-top:2px;font-size:13px;color:var(--ink3)}
    .lv-permit{display:flex;align-items:center;gap:12px;margin-top:16px;padding:12px 14px;border-radius:14px;background:var(--g1);font-size:13px;color:var(--g8)}
    .lv-permit .ico{width:20px;height:20px;flex:none}.lv-permit b{display:block;color:var(--g9);font-size:13.5px}
    .lv-permit.no{background:#fff8ea;color:#7a5413}.lv-permit.no b{color:#6a4508}
    .lv-way{list-style:none;margin:0;padding:0;position:relative}
    .lv-way:before{content:"";position:absolute;left:11px;top:12px;bottom:12px;width:2px;background:var(--line)}
    .lv-way li{position:relative;display:flex;gap:12px;padding:0 0 14px;font-size:12.5px;color:var(--ink3)}.lv-way li:last-child{padding-bottom:0}
    .lv-way li i{position:relative;z-index:1;width:24px;height:24px;flex:none;border-radius:50%;display:grid;place-items:center;background:#fff;border:2px solid var(--line2)}
    .lv-way li i svg{width:12px;height:12px}
    .lv-way li b{display:block;font-size:13.5px;color:var(--ink)}
    .lv-way li.done i{background:var(--g7);border-color:var(--g7);color:#fff}
    .lv-way li.now i{background:#e0a526;border-color:#e0a526;box-shadow:0 0 0 5px #fbf1e2}.lv-way li.now i:after{content:"";width:8px;height:8px;border-radius:50%;background:#fff}
    .lv-way li.now b{color:#8a5a14}.lv-way li.risk i{background:var(--red);border-color:var(--red)}
    .lv-q{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
    .lv-q li{display:flex;align-items:center;gap:10px;font-size:13px}
    .lv-q li i{width:22px;height:22px;flex:none;border-radius:50%;display:grid;place-items:center;background:#fbf1e2;color:#8a5a14;font-style:normal;font-weight:800;font-size:12px}
    .lv-q li.ok i{background:var(--g1);color:var(--g7)}.lv-q li i svg{width:12px;height:12px}
    .lv-q li span{flex:1}.lv-q li small{color:var(--ink3);font-size:12px;text-align:right}
    .lv-score{display:flex;align-items:center;gap:12px;margin-bottom:14px}
    .lv-score svg{width:54px;height:54px;transform:rotate(-90deg)}.lv-score circle{fill:none;stroke-width:7}
    .lv-score .bg{stroke:var(--line)}.lv-score .fg{stroke:var(--g6);stroke-linecap:round;stroke-dasharray:138.2;stroke-dashoffset:138.2;animation:lv-fill 1s .2s cubic-bezier(.3,.8,.2,1) forwards}
    @keyframes lv-fill{to{stroke-dashoffset:var(--off)}}
    .lv-score b{font-size:20px}.lv-score small{display:block;font-size:12px;color:var(--ink3)}
    /* customer preview: the real listing page in a window of its own (one scroll, desktop or phone width) */
    .lv-pv{position:fixed;inset:0;z-index:200;display:flex;flex-direction:column;background:rgba(10,30,20,.55);backdrop-filter:blur(3px);animation:lv-fade .2s both}
    @keyframes lv-fade{from{opacity:0}}
    .lv-pv-bar{flex:none;display:flex;align-items:center;gap:12px;padding:12px 18px;background:#fff;border-bottom:1px solid var(--line)}
    .lv-pv-bar b{font-size:14.5px}.lv-pv-bar small{color:var(--ink3);font-size:12.5px}
    .lv-pv-bar .sp{flex:1}
    .lv-seg{display:inline-flex;padding:3px;border-radius:99px;background:var(--bg);border:1px solid var(--line)}
    .lv-seg button{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border-radius:99px;font-size:12.5px;font-weight:700;color:var(--ink3)}.lv-seg button .ico{width:14px;height:14px}
    .lv-seg button.on{background:#fff;color:var(--g8);box-shadow:var(--sh)}
    .lv-pv-x{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;border:1px solid var(--line)}
    .lv-pv-body{flex:1;min-height:0;display:flex;justify-content:center;padding:18px}
    .lv-pv-body iframe{width:100%;max-width:1280px;height:100%;border:0;border-radius:14px;background:#fff;box-shadow:0 20px 60px rgba(0,0,0,.3);transition:max-width .3s}
    .lv-pv.phone .lv-pv-body iframe{max-width:390px;border-radius:28px;border:10px solid #14201a}
    @media(max-width:1100px){.lv-main{grid-template-columns:1fr}}
    @media(max-width:860px){.lv-top{grid-template-columns:1fr}.lv-hd{flex-direction:column}.lv-top .lv-acts{justify-content:flex-start;max-width:none}.lv-top .lv-meta{text-align:left}.lv-thumb{aspect-ratio:16/9}.lv-gal{height:240px}.lv-glance{grid-template-columns:1fr}.lv-kpis{flex-wrap:wrap}.lv-kpis .lbl{flex-basis:100%}.lv-kpis .k{max-width:none;flex-basis:calc(50% - 4px)}.lv{padding:16px 14px 40px}.lv-facts{grid-template-columns:1fr}.lv-place{grid-template-columns:1fr}}
    @media(prefers-reduced-motion:reduce){.lv,.lv-pv{animation:none}.lv-pill i:after{animation:none}.lv-score .fg{animation:none;stroke-dashoffset:var(--off)}}
  </style>`;
  // a small map of where it is, in the dashboard's greens (not a real map — the area name says where)
  const MAP = `<svg viewBox="0 0 150 100" aria-hidden="true"><rect width="150" height="100" fill="#eef7f2"/><path d="M0 62h150M0 30h150M44 0v100M104 0v100" stroke="#fff" stroke-width="6"/><path d="M0 84 150 50" stroke="#fff" stroke-width="3"/><rect x="108" y="6" width="40" height="20" rx="3" fill="#d8efe3"/><rect x="2" y="66" width="38" height="30" rx="3" fill="#d8efe3"/><path d="M75 22c-8 0-14 6-14 14 0 10 14 22 14 22s14-12 14-22c0-8-6-14-14-14z" fill="#136142"/><circle cx="75" cy="36" r="5" fill="#fff"/></svg>`;
  function showListing(id) {
    const L = own(id); if (!L) return false;
    P.closeModal(); P.closeDrawer();
    if (!document.getElementById('lv-style')) document.head.insertAdjacentHTML('beforeend', lvCss);
    const O = offerOf(L), s = ST[L.status] || ST.draft, tier = s[1];
    const where = L.areas && L.areas.length && !L.loc ? L.areas.map(area).join(', ') : [L.building, area(L.loc)].filter(Boolean).join(', ');
    const term = ({ yearly: 'year', monthly: 'month' })[[].concat((L.a || {}).term || (L.a || {}).terms || [])[0]] || '';
    const imgs = (L.img || []).filter(Boolean), minP = ({ spaces: 5, experiences: 5 })[L.v] || 3;
    const editHref = '../listing-new.html#edit=' + encodeURIComponent(L.id);
    const gal = imgs.length ? `<div class="lv-gal ${imgs.length === 1 ? 'one' : imgs.length === 2 ? 'two' : ''}">${imgs.slice(0, 3).map((src, i) => i === 2 && imgs.length > 3 ? `<span class="more"><img src="${src}" alt=""><b>+${imgs.length - 3}</b></span>` : `<img src="${src}" alt="">`).join('')}<span class="cnt">${ico('image')}${imgs.length} photo${imgs.length === 1 ? '' : 's'}</span></div>`
      : `<a class="lv-gal one lv-nophoto" href="${editHref}">${ico('image')}<b>No photos yet</b><span>Listings with ${minP}+ photos get more enquiries</span><em class="btn btn-o btn-sm">${ico('plus')}Add photos</em></a>`;
    const thumb = imgs.length ? `<button class="lv-thumb" type="button" data-lv="photos"><img src="${imgs[0]}" alt=""><span class="cnt">${ico('image')}${imgs.length}</span></button>`
      : `<a class="lv-thumb none" href="${editHref}">${ico('image')}<span>Add photos</span></a>`;
    const { facts, lists } = factsOf(L, O), keys = O ? keyFacts(L, O) : [];
    // the way to live: sent → business approved → listing checked → live (and when each happened, from its history)
    const at = { draft: 0, licence: 1, verify: 1, review: 2, changes: 2, rejected: 2, live: 4 }[L.status] ?? 0;
    const when = st => { const h = (L.history || []).filter(x => x.st === st).pop(); return h ? day(h.t) : ''; };
    const sentAt = ((L.history || []).find(x => x.st !== 'draft') || {}).t;
    const way = [['Sent', sentAt ? day(sentAt) : 'Not sent yet'], ['Business approved', at > 1 ? when('review') : L.status === 'licence' ? 'Waits for the licence' : 'Usually within 24 hours'],
      ['Listing checked', at > 2 ? when('live') : at === 2 && tier === 'risk' ? s[0] : 'Our team checks it'], ['Live on UpNow', at > 3 ? when('live') : 'Customers can find you']];
    const Q = [[imgs.length >= minP, `${imgs.length} photo${imgs.length === 1 ? '' : 's'}`, imgs.length >= minP ? 'Good' : `Add ${minP - imgs.length} more`],
      [(L.desc || '').length >= 120, 'Description', (L.desc || '').length >= 120 ? 'Clear and complete' : 'Tell customers more'],
      [!!+L.price, 'Price', +L.price ? 'Set' : 'Add a price'],
      [!!(L.loc || (L.areas || []).length), 'Location', L.loc || (L.areas || []).length ? 'Set' : 'Add where it is'],
      ...(L.v === 'spaces' ? [[!!L.permit, 'Permit number', L.permit ? 'Added' : 'Needed to go live']] : [])];
    const ok = Q.filter(q => q[0]).length, off = (138.2 * (1 - ok / Q.length)).toFixed(1), live = L.status === 'live';
    const view = document.getElementById('view');
    view.className = 'view em';
    view.innerHTML = `<div class="em-bar"><button class="em-back" type="button" data-em="back">${ico('chevL')}Portfolio</button>
        <span class="em-crumb">${ico('chevR')}<b>${esc(L.title || 'Your listing')}</b></span><span class="sp"></span>
        <button class="btn btn-o btn-sm" type="button" data-lv="preview">${ico('eye')}Customer preview</button><a class="btn btn-g btn-sm" href="${editHref}">${ico('edit')}Edit listing</a></div>
      <div class="lv-scroll"><div class="lv">
        <div class="lv-top">${thumb}
          <section class="lv-card lv-info"><div class="lv-hd"><div><span class="lv-pill ${tier}"><i></i>${esc(s[0])}</span>
            <h1>${esc(L.title || 'Your listing')}</h1>
            <span class="lv-loc">${ico('pin')}${esc([where, O && O.label].filter(Boolean).join(' · '))}</span></div>
            <div class="lv-acts"><a class="btn btn-g btn-sm" href="${editHref}">${ico('edit')}${L.status === 'draft' ? 'Continue' : L.status === 'changes' ? 'Fix and resubmit' : 'Edit listing'}</a>
              <button class="btn btn-o btn-sm" type="button" data-lv="preview">${ico('eye')}See it as a customer</button>
              <span class="lv-meta">Ref ${esc(L.id)}${L.updated ? ' · Updated ' + esc(day(L.updated)) : ''}</span></div></div>
            <div class="lv-line">${+L.price ? `<div class="lv-price">AED ${Number(L.price).toLocaleString()}${term ? `<small> / ${term}</small>` : ''}</div>` : ''}
            ${keys.length ? `<div class="lv-keys">${keys.slice(0, 4).map(([i, t]) => `<span>${MI(i)}${esc(t)}</span>`).join('')}</div>` : ''}</div>
            <p class="lv-note ${tier === 'warn' ? '' : tier}">${esc(L.status === 'changes' && L.reason ? L.reason : s[2])}</p></section>
          <div class="lv-kpis ${live ? 'on' : ''}"><span class="lbl"><b>Performance</b>${live ? 'Last 30 days' : 'Starts when it\'s live'}</span>${[['eye', 'Views'], ['phone', 'Contacts'], ['kanban', 'Leads'], ['heart', 'Saved']].map(([i, t]) => `<span class="k">${ico(i)}<b>${live ? '0' : '—'}</b><small>${t}</small></span>`).join('')}</div></div>
        <div class="lv-glance ${live ? 'one' : ''}">${live ? '' : `<section class="lv-card"><h2>On its way to live</h2><ol class="lv-way">${way.map(([t, sub], i) => `<li class="${i < at ? 'done' : i === at ? (tier === 'risk' ? 'risk' : 'now') : ''}"><i>${i < at ? tick : ''}</i><span><b>${t}</b>${esc(sub)}</span></li>`).join('')}</ol></section>`}
            <section class="lv-card"><h2>Listing quality</h2>
              <div class="lv-score"><svg viewBox="0 0 54 54"><circle class="bg" cx="27" cy="27" r="22"/><circle class="fg" cx="27" cy="27" r="22" style="--off:${off}"/></svg><div><b>${ok} of ${Q.length}</b><small>${ok === Q.length ? 'Ready to do well' : 'A few things to improve'}</small></div></div>
              <ul class="lv-q">${Q.map(([y, t, sub]) => `<li class="${y ? 'ok' : ''}"><i>${y ? tick : '!'}</i><span>${esc(t)}</span><small>${esc(sub)}</small></li>`).join('')}</ul></section></div>
        <div class="lv-main">
          <div class="lv-col">
            <section class="lv-card"><h2>About<a href="${editHref}">${ico('edit')}Edit</a></h2>${L.desc ? `<p class="lv-about">${esc(L.desc)}</p>` : `<div class="lv-missing">${ico('edit')}No description yet — a few lines help customers decide.<a href="${editHref}">Add</a></div>`}</section>
            ${facts.length ? `<section class="lv-card"><h2>Details</h2><div class="lv-facts">${facts.map(([k, v]) => `<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div></section>` : ''}
            ${lists.length ? `<section class="lv-card"><h2>${esc(lists.length === 1 ? lists[0][0] : 'Features')}</h2>${lists.map(([k, vs]) => `<div class="lv-list">${lists.length > 1 ? `<small>${esc(k)}</small>` : ''}<div class="lv-chips">${vs.map(x => `<span>${ico('check')}${esc(x)}</span>`).join('')}</div></div>`).join('')}</section>` : ''}
          </div>
          <div class="lv-col">
            <section class="lv-card" id="lv-photos"><h2>Photos<a href="${editHref}">${ico('edit')}Edit</a></h2>${gal}</section>
            <section class="lv-card"><h2>Location</h2><div class="lv-place">${MAP}<div><b>${esc(where || 'Not set yet')}</b><span>${esc(L.unit ? 'Unit ' + L.unit + ' · ' : '')}${esc(L.v === 'spaces' ? 'Customers see the area; the exact address is shared when they contact you' : 'Where customers find you')}</span></div></div>
              ${L.v === 'spaces' ? (L.permit ? `<div class="lv-permit">${ico('shield')}<span><b>DLD permit ${esc(L.permit)}</b>Checked by our team before the listing goes live</span></div>` : `<div class="lv-permit no">${ico('alert')}<span><b>No permit number yet</b>Every property ad in Dubai needs a Trakheesi permit</span></div>`) : ''}</section>
          </div>
        </div>
      </div></div>`;
    document.querySelectorAll('#sb .ni').forEach(a => a.classList.toggle('on', a.dataset.go === 'portfolio'));
    open = 'listing:' + L.id;
    return true;
  }
  // the customer preview window
  function preview(id, phone) {
    closePreview();
    document.body.insertAdjacentHTML('beforeend', `<div class="lv-pv ${phone ? 'phone' : ''}" id="lv-pv"><div class="lv-pv-bar"><div><b>Customer preview</b><br><small>Exactly how it looks on UpNow — contact buttons are off in preview</small></div><span class="sp"></span>
      <span class="lv-seg"><button type="button" data-lv="desk" class="${phone ? '' : 'on'}">${ico('grid')}Desktop</button><button type="button" data-lv="phone" class="${phone ? 'on' : ''}">${ico('phone')}Phone</button></span>
      <button type="button" class="lv-pv-x" data-lv="close" aria-label="Close preview">${ico('x')}</button></div>
      <div class="lv-pv-body"><iframe title="Customer preview" src="../listing.html?id=${encodeURIComponent(id)}&amp;preview=1&amp;embed=1"></iframe></div></div>`);
  }
  const closePreview = () => { const x = document.getElementById('lv-pv'); if (x) x.remove(); };
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePreview(); });

  // capture phase: before the dashboard's own handlers, for every link to an editor
  document.addEventListener('click', e => {
    if (e.target.closest('[data-em="back"]')) { e.preventDefault(); close(); return; }
    const lv = e.target.closest('[data-lv]');
    if (lv) { const k = lv.dataset.lv, id = (open || '').replace(/^listing:/, '');
      if (k === 'preview' || k === 'desk') preview(id, false); else if (k === 'phone') preview(id, true); else if (k === 'close') closePreview(); else if (k === 'photos') { const ph = document.getElementById('lv-photos'); if (ph) ph.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      return; }
    if (e.target.classList && e.target.classList.contains('lv-pv')) { closePreview(); return; }
    const a = e.target.closest('a[href]'); if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const u = caught(a.getAttribute('href')); if (!u) return;
    e.preventDefault(); e.stopPropagation();
    // "View" on a sent listing opens its page here; everything else opens the editor
    const done = /listing-new\.html$/.test(u.pathname) && /^#done=(.+)$/.exec(u.hash);
    if (done && showListing(decodeURIComponent(done[1]))) return;
    show(u);
  }, true);
  // Escape-free: a re-render while an editor is open (a toast, a timer) must not wipe it
  const render = P.render;
  P.render = function () { if (open) return; return render.apply(this, arguments); };
  P.openEditor = href => { const u = caught(href); if (u) show(u); };
})();
