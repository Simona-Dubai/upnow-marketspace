/* New provider — someone who has just sent their application (pages/join.html) lands here. Until the team approves them,
   home is "Application sent for approval": where the review is, their first listing and what happens to it, and what
   they can do meanwhile. Every other page carries a slim note that it shows sample data until they're approved.
   Reads the onboarding record ('upnow.join') and the first listing ('upnow.listings@<account>', js/marketplace/listing-form.js).
   Additive: wraps PWA.render after the page modules have registered; nothing here changes for an approved provider. */
(function () {
  const P = window.PWA; if (!P) return;
  const read = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  const user = read('upnow.user'), app = read('upnow.join');
  const owner = user && (user.email || (user.dial || '') + user.phone);
  // only a provider whose application is sent and not yet approved
  if (!app || app.status !== 'submitted' || (app.owner && owner && app.owner !== owner)) return;
  const { ico, esc, st } = P;
  const items = ((read('upnow.listings@' + owner) || {}).items || []);
  // the first listing counts once it was sent with the application ("Add it later" leaves none)
  const first = items.find(x => x.id === app.listing && x.status !== 'draft') || items.find(x => x.status !== 'draft') || null;
  const d = app.d || {}, name = d.display || app.name || (user && user.name) || 'there', firstName = String((user && user.first) || name).split(' ')[0];
  const VERT = { spaces: 'Spaces', services: 'Services', experiences: 'Experiences', memberships: 'Memberships', programs: 'Programs', health: 'Health', insurance: 'Protection' };
  const area = id => String(id || '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).replace(/\bJ(br|lt|vc)\b/gi, m => m.toUpperCase());
  const ST = { verify: ['Waiting for your approval', 'warn', 'Goes to review as soon as your business is approved.'], licence: ['Waiting for licence', 'warn', 'Goes to review once your licence is added.'],
    review: ['In review', 'info', 'Our team is checking it — usually within 24 hours.'], live: ['Live', '', 'Customers can find and contact you.'], changes: ['Changes requested', 'risk', ''], draft: ['Draft', 'mute', 'Not sent yet.'] };
  const welcome = new URLSearchParams(location.search).get('welcome');

  // the first listing in Portfolio too, as "In review" (the dashboard's own word for it)
  if (first && !P.S.extraListings.some(l => l.id === 'UP-' + first.id) && P.S.v === first.v) {
    P.S.extraListings.push({ id: 'UP-' + first.id, v: first.v, cat: first.cat, t: first.title, area: area(first.loc || (first.areas || [])[0]), price: +first.price || 0, basis: '', img: (first.img || [])[0] || '',
      status: 'pending', views: 0, contacts: 0, leads: 0, quality: 90, units: 1, meta: [], resp: 0 });
    try { P.save(); } catch (e) {}
  }

  const css = `<style id="np-style">
    .np-wrap{max-width:980px}
    .np-hero{display:flex;align-items:flex-start;gap:16px;padding:22px 24px;border-radius:16px;background:linear-gradient(135deg,#eef7f2,#fff);border:1px solid var(--line)}
    .np-hero .np-ic{width:52px;height:52px;flex:none;border-radius:50%;display:grid;place-items:center;background:#fbf0dc;color:#8a5a14}
    .np-hero .np-ic svg{width:26px;height:26px}
    .np-hero h1{margin:0;font-size:22px}.np-hero p{margin:4px 0 0;color:var(--ink2);font-size:14px;line-height:1.5}
    .np-steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:18px 0 0;padding:0;list-style:none}
    .np-steps li{position:relative;padding:12px 12px 12px 40px;border:1px solid var(--line);border-radius:12px;background:#fff;font-size:12.5px;color:var(--ink2)}
    .np-steps li b{display:block;font-size:13px;color:var(--ink)}
    .np-steps li i{position:absolute;left:12px;top:12px;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;font-style:normal;font-size:11px;font-weight:800;background:#eef0ef;color:var(--ink2)}
    .np-steps li.done i{background:var(--g7);color:#fff}.np-steps li.now{border-color:#e9c98f;background:#fffaf0}.np-steps li.now i{background:#fbf0dc;color:#8a5a14}
    .np-steps li i svg{width:12px;height:12px}
    .np-lst{display:flex;gap:14px;align-items:center}
    .np-lst img,.np-lst .np-ph{width:120px;height:84px;flex:none;border-radius:10px;object-fit:cover;background:var(--g1);display:grid;place-items:center;color:var(--g7)}
    .np-lst b{display:block;font-size:15px}.np-lst small{display:block;color:var(--ink3);font-size:12.5px;margin-top:2px}
    .np-lst .np-st{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;margin-top:8px;font-size:12.5px;color:var(--ink2)}
    .np-todo{display:flex;flex-direction:column;gap:2px;margin:0;padding:0;list-style:none}
    .np-todo li{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--line);font-size:13.5px}
    .np-todo li:last-child{border-bottom:0}.np-todo li>svg{width:20px;height:20px;flex:none;padding:3px;border-radius:50%;background:#eef0ef;color:var(--ink3)}
    .np-todo li.ok>svg{background:var(--g1);color:var(--g7)}.np-todo li span{flex:1}.np-todo li small{display:block;color:var(--ink3);font-size:12px}
    .np-note{display:flex;align-items:center;gap:10px;margin:0 0 16px;padding:10px 14px;border-radius:12px;background:#fffaf0;border:1px solid #f1dfb8;font-size:13px;color:#7a5413}
    .np-note svg{width:16px;height:16px;flex:none}.np-note a{margin-left:auto;font-weight:700;color:var(--g7);cursor:pointer;white-space:nowrap}
    @media(max-width:760px){.np-steps{grid-template-columns:1fr 1fr}.np-lst{align-items:flex-start}.np-lst img,.np-lst .np-ph{width:88px;height:66px}}
  </style>`;
  if (!document.getElementById('np-style')) document.head.insertAdjacentHTML('beforeend', css);

  const check = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
  const clock = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  function home() {
    const s = first && (ST[first.status] || ST.verify);
    const lst = first ? `<div class="np-lst">${(first.img || [])[0] ? `<img src="${first.img[0]}" alt="">` : `<span class="np-ph">${ico('home')}</span>`}<div><b>${esc(first.title || 'Your first listing')}</b>
        <small>${esc([VERT[first.v], area(first.loc || (first.areas || [])[0])].filter(Boolean).join(' · '))}${first.price ? ' · AED ' + Number(first.price).toLocaleString() : ''}</small>
        <div class="np-st">${st(s[0], s[1])}<span>${esc(s[2])}</span></div></div></div>`
      : `<p class="hint" style="margin:0">You chose to add it later. Listings you add now go to review as soon as you're approved.</p>
        <button class="btn btn-g btn-sm" style="margin-top:12px" data-act="addListing">${ico('plus')}Add your first listing</button>`;
    const todo = [
      [true, 'Business details', 'Sent with your application'],
      [!!d.photo, d.photo ? 'Profile photo' : 'Add a profile photo', d.photo ? 'Customers see it on every listing' : 'Profiles with a photo get more enquiries'],
      [!!first, first ? 'First listing' : 'Add your first listing', first ? 'Sent with your application' : 'It goes live once you\'re approved'],
      [false, 'Explore your workspace', 'Leads, inbox and calendar — shown with sample data until you\'re live']
    ];
    return `<div class="np-wrap">
      <div class="np-hero"><span class="np-ic">${clock}</span><div><h1>${welcome ? 'Application sent' : 'Your application is in review'}, ${esc(firstName)}</h1>
        <p>Our team is checking your ${app.role === 'company' ? 'licence and signatory ID' : 'ID'} — usually within 24 hours. We'll ${app.phone ? 'WhatsApp you' : 'email you'} as soon as there's a decision. Nothing goes live until you're approved.</p></div></div>
      <ol class="np-steps"><li class="done"><i>${check}</i><b>Application sent</b>Details and documents in</li>
        <li class="now"><i>2</i><b>Team review</b>Usually within 24 hours</li>
        <li><i>3</i><b>You're approved</b>Your “Verified” badge appears</li>
        <li><i>4</i><b>Live on UpNow</b>${first ? 'Your listing is checked and goes live' : 'Add listings and get leads'}</li></ol>
      <div class="gd mt">
        <section class="pn"><div class="pn-h"><h2>Your first listing</h2></div>${lst}</section>
        <section class="pn"><div class="pn-h"><h2>While you wait</h2></div><ul class="np-todo">${todo.map(([ok, t, sub], i) => `<li class="${ok ? 'ok' : ''}" ${i === 3 ? 'data-go="leads" style="cursor:pointer"' : ''}>${ok ? check : clock}<span>${esc(t)}<small>${esc(sub)}</small></span>${i === 3 ? ico('chevR') : ''}</li>`).join('')}</ul></section>
      </div></div>`;
  }
  const note = `<div class="np-note">${clock}<span>Your application is in review — this page shows sample data until you're approved.</span><a data-go="demand">See status</a></div>`;

  const render = P.render;
  P.render = function () {
    render.apply(this, arguments);
    // the sidebar shows who they are, not the sample business
    const biz = document.querySelector('#sb .biz');
    const ini = name.split(/\s+/).map(x => x[0]).slice(0, 2).join('').toUpperCase();
    const me = document.querySelector('#sb .me');
    if (me) me.innerHTML = `<span class="av sm">${esc(ini)}</span><div><b style="font-size:13px">${esc(name)}</b><small>${app.role === 'company' ? 'Owner' : 'Provider'}</small></div>`;
    if (biz) biz.innerHTML = `<span class="av">${esc(ini)}</span><div><b>${esc(name)}</b><small>In review · ${esc(VERT[app.v] || '')}</small></div>`;
    const view = document.getElementById('view'); if (!view) return;
    if (P.S.page === 'demand') { view.innerHTML = home(); document.title = 'UpNow Provider · Application in review'; }
    else if (!view.classList.contains('flush')) view.insertAdjacentHTML('afterbegin', note);
  };
})();
