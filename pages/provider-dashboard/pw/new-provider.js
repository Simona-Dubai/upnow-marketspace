/* New provider — someone who has just sent their application (pages/join.html). Until the team approves them:
     Portfolio  — the application on top (where the review is, the 4 steps), their listings (pw/portfolio.js), then how
                  leads will reach them (an animated infographic) and what to do meanwhile
     Demand     — one bar with the application's progress; the dashboard below shows sample data
     elsewhere  — a slim note that the page shows sample data until they're approved
   Also copies the account's listings ('upnow.listings@<account>', js/marketplace/listing-form.js) into the dashboard's
   own list for every provider with an application. Reads the onboarding record ('upnow.join').
   Illustrations follow the marketplace's onboarding style (js/pages/join.js): brand greens, a pale circle, one amber accent.
   Additive: wraps PWA.render after the page modules have registered (pw/portfolio.js, loaded after, wraps it again). */
(function () {
  const P = window.PWA; if (!P) return;
  const read = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  const user = read('upnow.user'), app = read('upnow.join');
  const owner = user && (user.email || (user.dial || '') + user.phone);
  if (!app || !owner || (app.owner && app.owner !== owner)) return;
  const items = ((read('upnow.listings@' + owner) || {}).items || []);
  const area = id => String(id || '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).replace(/\bJ(br|lt|vc)\b/gi, m => m.toUpperCase());
  // a listing without photos yet: a quiet frame, like the listing form's own preview
  const NO_PHOTO = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#eef7f2"/><g fill="none" stroke="#25946a" stroke-width="6" stroke-linejoin="round"><rect x="150" y="105" width="100" height="78" rx="10"/><path d="M150 168l28-26 22 20 16-12 34 22"/></g><circle cx="226" cy="128" r="8" fill="#e0a526"/></svg>');
  const LST = { draft: 'Draft — not sent yet', licence: 'Waiting for licence', verify: 'Waiting for verification', review: 'In review', live: 'Live', changes: 'Changes requested', rejected: 'Not approved' };

  // every listing on the account in Portfolio, first and up to date (the form is the source; this copy is rebuilt on each load)
  P.S.extraListings = P.S.extraListings.filter(l => !/^UP-/.test(l.id)).concat(items.map(L => ({
    id: 'UP-' + L.id, v: L.v, cat: L.cat, t: L.title || 'Untitled listing', area: area(L.loc || (L.areas || [])[0]) || 'UAE', price: +L.price || 0,
    basis: (L.a && (L.a.term || L.a.billing)) || '', img: (L.img || [])[0] || NO_PHOTO, mine: true,
    status: L.status === 'live' ? 'live' : ['licence', 'verify', 'review'].includes(L.status) ? 'pending' : 'draft',
    views: 0, contacts: 0, leads: 0, quality: 90, units: LST[L.status] || '', meta: [], resp: 0 })));
  try { P.save(); } catch (e) {}

  // the rest only while the application is sent and not yet approved
  if (app.status !== 'submitted') return;
  const { ico, esc } = P;
  const sent = items.filter(x => x.status !== 'draft');
  // the first listing counts once it was sent with the application ("Add it later" leaves none)
  const first = sent.find(x => x.id === app.listing) || sent[0] || null;
  const d = app.d || {}, name = d.display || app.name || (user && user.name) || 'there', firstName = String((user && user.first) || name).split(' ')[0];
  const VERT = { spaces: 'Spaces', services: 'Services', experiences: 'Experiences', memberships: 'Memberships', programs: 'Programs', health: 'Health', insurance: 'Protection' };
  const welcome = new URLSearchParams(location.search).get('welcome');

  const css = `<style id="np-style">
    .np-wrap{display:flex;flex-direction:column;gap:18px}
    .np-wrap.np-head{margin-bottom:22px}.np-wrap.np-foot{margin-top:22px}
    .np-wrap>*{animation:np-up .55s cubic-bezier(.2,.7,.2,1) both}
    .np-wrap>*:nth-child(2){animation-delay:.08s}.np-wrap>*:nth-child(3){animation-delay:.16s}
    @keyframes np-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
    .np-bob{transform-box:fill-box;transform-origin:center bottom;animation:np-bob 3.2s ease-in-out infinite}
    .np-spark{transform-box:fill-box;transform-origin:center;animation:np-twinkle 2.4s ease-in-out infinite}
    @keyframes np-bob{50%{transform:translateY(-4px)}}
    @keyframes np-twinkle{50%{opacity:.35;transform:scale(.8)}}
    /* hero */
    .np-hero{position:relative;overflow:hidden;border-radius:22px;padding:30px 32px 26px;color:#fff;
      background:radial-gradient(120% 140% at 100% 0%,rgba(52,190,128,.35),transparent 55%),radial-gradient(90% 120% at 0% 100%,rgba(233,180,92,.18),transparent 60%),linear-gradient(140deg,var(--g9),var(--g7) 70%,var(--g6));
      box-shadow:0 18px 50px -18px rgba(11,61,42,.55)}
    .np-hero:before{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.09) 1px,transparent 1px);background-size:18px 18px;mask-image:linear-gradient(110deg,transparent 30%,#000 90%);-webkit-mask-image:linear-gradient(110deg,transparent 30%,#000 90%);pointer-events:none}
    .np-top{position:relative;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:28px;align-items:center}
    .np-eyebrow{display:inline-flex;align-items:center;gap:8px;padding:5px 12px 5px 10px;border-radius:99px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);font-size:12px;font-weight:700;letter-spacing:.02em;backdrop-filter:blur(6px)}
    .np-dot{position:relative;width:8px;height:8px;border-radius:50%;background:#f5c26b}
    .np-dot:after{content:"";position:absolute;inset:-4px;border-radius:50%;border:2px solid #f5c26b;animation:np-ping 1.8s ease-out infinite}
    @keyframes np-ping{from{opacity:.9;transform:scale(.6)}to{opacity:0;transform:scale(1.8)}}
    .np-hero h1{margin:14px 0 0;font-family:var(--serif);font-weight:400;font-size:40px;line-height:1.05;letter-spacing:-.01em}
    .np-hero h1 em{font-style:normal;color:#9fe3c2}
    .np-hero p{margin:10px 0 0;max-width:560px;color:rgba(255,255,255,.8);font-size:14.5px;line-height:1.55}
    .np-ring{position:relative;width:132px;height:132px;flex:none}
    .np-ring svg{width:100%;height:100%;transform:rotate(-90deg)}
    .np-ring circle{fill:none;stroke-width:9;stroke-linecap:round}
    .np-ring .bg{stroke:rgba(255,255,255,.14)}.np-ring .fg{stroke:url(#np-grad);stroke-dasharray:339.3;stroke-dashoffset:339.3;animation:np-fill 1.4s .3s cubic-bezier(.3,.8,.2,1) forwards}
    @keyframes np-fill{to{stroke-dashoffset:var(--off)}}
    .np-ring div{position:absolute;inset:0;display:grid;place-content:center;text-align:center}
    .np-ring b{font-family:var(--serif);font-weight:400;font-size:34px;line-height:1}.np-ring small{font-size:11px;color:rgba(255,255,255,.72);font-weight:600;margin-top:4px}
    /* step track */
    .np-steps{position:relative;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:26px 0 0;padding:0;list-style:none}
    .np-steps:before,.np-steps:after{content:"";position:absolute;top:15px;left:16px;height:2px;border-radius:2px}
    .np-steps:before{right:16px;background:rgba(255,255,255,.16)}
    .np-steps:after{width:0;background:linear-gradient(90deg,#9fe3c2,#f5c26b);animation:np-track 1.2s .45s cubic-bezier(.3,.8,.2,1) forwards}
    @keyframes np-track{to{width:calc(25% + 6px)}}
    .np-steps li{position:relative;z-index:1;font-size:12.5px;color:rgba(255,255,255,.62);line-height:1.4}
    .np-steps li i{width:32px;height:32px;border-radius:50%;display:grid;place-items:center;margin-bottom:10px;font-style:normal;font-size:12.5px;font-weight:800;background:#174d37;color:rgba(255,255,255,.75);border:2px solid rgba(255,255,255,.2)}
    .np-steps li b{display:block;font-size:13.5px;color:#fff;margin-bottom:1px}
    .np-steps li.done i{background:#9fe3c2;border-color:#9fe3c2;color:var(--g9)}
    .np-steps li.now i{background:#f5c26b;border-color:#f5c26b;color:#5a3a06;box-shadow:0 0 0 6px rgba(245,194,107,.22)}
    .np-steps li.now b{color:#ffe1aa}
    .np-steps li i svg{width:14px;height:14px}
    /* hero motion: entrance, ambient sheen, and the live step */
    .np-hero:before{animation:np-drift 14s linear infinite}
    @keyframes np-drift{to{background-position:18px -18px}}
    .np-hero:after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(105deg,transparent 38%,rgba(255,255,255,.08) 50%,transparent 62%);transform:translateX(-100%);animation:np-sweep 8s 1.8s ease-in-out infinite}
    @keyframes np-sweep{0%{transform:translateX(-100%)}35%,100%{transform:translateX(100%)}}
    .np-top>div>*{animation:np-up .6s cubic-bezier(.2,.7,.2,1) both}
    .np-top>div>:nth-child(1){animation-delay:.08s}.np-top>div>:nth-child(2){animation-delay:.16s}.np-top>div>:nth-child(3){animation-delay:.24s}
    .np-hero h1 em{background:linear-gradient(90deg,#9fe3c2 40%,#fff 50%,#9fe3c2 60%) 100% 0/250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:np-name 6s 1.2s ease-in-out infinite}
    @keyframes np-name{0%{background-position:100% 0}30%,100%{background-position:0 0}}
    .np-ring:before{content:"";position:absolute;inset:3px;border-radius:50%;animation:np-halo 2.8s 1.7s ease-out infinite}
    @keyframes np-halo{from{box-shadow:0 0 0 0 rgba(245,194,107,.3)}to{box-shadow:0 0 0 16px rgba(245,194,107,0)}}
    .np-ring div{animation:np-zoom .6s .5s cubic-bezier(.3,1.4,.5,1) both}
    @keyframes np-zoom{from{opacity:0;transform:scale(.7)}}
    .np-steps li{animation:np-up .5s cubic-bezier(.2,.7,.2,1) both}
    .np-steps li:nth-child(1){animation-delay:.3s}.np-steps li:nth-child(2){animation-delay:.4s}.np-steps li:nth-child(3){animation-delay:.5s}.np-steps li:nth-child(4){animation-delay:.6s}
    .np-steps:after{background:linear-gradient(90deg,transparent,rgba(255,255,255,.9),transparent) -60% 0/40% 100% no-repeat,linear-gradient(90deg,#9fe3c2,#f5c26b);
      animation:np-track 1.2s .45s cubic-bezier(.3,.8,.2,1) forwards,np-shine 2.6s 1.7s ease-in-out infinite}
    @keyframes np-shine{0%{background-position:-60% 0,0 0}60%,100%{background-position:160% 0,0 0}}
    .np-steps li.done i svg path{stroke-dasharray:22;stroke-dashoffset:22;animation:np-draw .45s .9s ease-out forwards}
    @keyframes np-draw{to{stroke-dashoffset:0}}
    .np-steps li.now i{position:relative;animation:np-breathe 2.4s 1.4s ease-in-out infinite}
    @keyframes np-breathe{50%{box-shadow:0 0 0 10px rgba(245,194,107,.08)}}
    .np-steps li.now i:before{content:"";position:absolute;inset:-10px;border-radius:50%;border:1.5px dashed rgba(245,194,107,.55);animation:np-spin 9s linear infinite}
    @keyframes np-spin{to{transform:rotate(1turn)}}
    .np-steps li.now:after{content:"";position:absolute;z-index:-1;top:15px;left:16px;width:calc(100% + 12px);height:2px;opacity:0;
      background:repeating-linear-gradient(90deg,rgba(245,194,107,.7) 0 6px,transparent 6px 12px);animation:np-fade .4s 1.6s forwards,np-march .6s linear infinite}
    @keyframes np-fade{to{opacity:1}}@keyframes np-march{to{background-position:12px 0}}
    /* cards */
    .np-card{background:#fff;border:1px solid var(--line);border-radius:20px;padding:22px;box-shadow:var(--sh)}
    .np-card h2{font-size:16px;letter-spacing:-.01em;display:flex;align-items:center;gap:10px}
    .np-card h2 .sp{flex:1}.np-card h2 small{font-size:12px;color:var(--ink3);font-weight:600}
    .np-card h2 a{font-size:12.5px;font-weight:700;color:var(--g7);display:flex;align-items:center;gap:3px;cursor:pointer}.np-card h2 a .ico{width:14px;height:14px}
    /* infographic: how a customer becomes a lead — four animated scenes on one loop */
    .np-how .hd{display:flex;align-items:flex-end;gap:12px;margin-bottom:16px}.np-how .hd div{flex:1}
    .np-how .hd p{margin:4px 0 0;color:var(--ink3);font-size:12.5px}
    .np-how .hd .chip{padding:5px 11px;border-radius:99px;background:#fbf1e2;color:#8a5a14;font-size:11.5px;font-weight:800;white-space:nowrap}
    .np-flow{display:grid;grid-template-columns:1fr 36px 1fr 36px 1fr 36px 1fr;align-items:start}
    .np-sc{text-align:center}
    .np-sc svg{display:block;width:100%;height:auto;overflow:visible}
    .np-sc b{display:block;margin-top:8px;font-size:13.5px}.np-sc small{display:block;margin-top:2px;color:var(--ink3);font-size:12px;line-height:1.4;padding:0 6px}
    .np-sc .no{display:inline-grid;place-items:center;width:20px;height:20px;margin-right:6px;border-radius:50%;background:var(--g1);color:var(--g7);font-size:11px;font-weight:800;vertical-align:1px}
    .np-ar{position:relative;height:2px;margin-top:60px;background:repeating-linear-gradient(90deg,var(--g5) 0 5px,transparent 5px 10px);background-size:20px 2px;animation:np-dash 1s linear infinite;opacity:.7}
    .np-ar:after{content:"";position:absolute;right:-2px;top:-4px;border:5px solid transparent;border-left:7px solid var(--g5);border-right:0}
    @keyframes np-dash{to{background-position:20px 0}}
    .np-how svg *{transform-box:fill-box}
    .np-type{transform-origin:left center;animation:np-type 6s steps(14) infinite}
    @keyframes np-type{0%{transform:scaleX(0)}30%,85%{transform:scaleX(1)}100%{transform:scaleX(1);opacity:0}}
    .np-res{opacity:0;animation:np-res 6s infinite}.np-res.r2{animation-delay:.25s}
    @keyframes np-res{0%,32%{opacity:0;transform:translateY(4px)}40%,88%{opacity:1;transform:none}100%{opacity:0}}
    .np-pop{transform-origin:center;animation:np-pop 6s infinite}
    @keyframes np-pop{0%,38%{opacity:0;transform:scale(.4)}46%{opacity:1;transform:scale(1.15)}52%,90%{opacity:1;transform:scale(1)}100%{opacity:0}}
    .np-cur{animation:np-cur 6s infinite}
    @keyframes np-cur{0%,20%{transform:translate(30px,26px);opacity:0}30%{opacity:1}44%,60%{transform:none;opacity:1}52%{transform:scale(.85)}70%,100%{opacity:0}}
    .np-ch{transform-origin:center;animation:np-ch 6s infinite}.np-ch.c2{animation-delay:.35s}.np-ch.c3{animation-delay:.7s}
    @keyframes np-ch{0%,50%{transform:scale(1)}56%{transform:scale(1.18)}62%,100%{transform:scale(1)}}
    .np-ring2{transform-origin:center;opacity:0;animation:np-ring2 6s infinite}.np-ring2.c2{animation-delay:.35s}.np-ring2.c3{animation-delay:.7s}
    @keyframes np-ring2{0%,50%{opacity:0;transform:scale(1)}54%{opacity:.6}70%,100%{opacity:0;transform:scale(1.7)}}
    .np-drop{animation:np-drop 6s infinite}
    @keyframes np-drop{0%,62%{opacity:0;transform:translateY(-22px)}72%{opacity:1;transform:translateY(2px)}76%,94%{opacity:1;transform:none}100%{opacity:0}}
    .np-plus{transform-origin:center;opacity:0;animation:np-plus 6s infinite}
    @keyframes np-plus{0%,72%{opacity:0;transform:scale(.3)}78%{opacity:1;transform:scale(1.2)}82%,94%{opacity:1;transform:scale(1)}100%{opacity:0}}
    @media(max-width:860px){.np-flow{grid-template-columns:1fr 1fr;row-gap:22px;column-gap:16px}.np-ar{display:none}}
    /* foot: how-it-works and the checklist side by side, 60/40 */
    .np-wrap.np-foot{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:18px;align-items:stretch}
    .np-foot .np-how .hd{flex-wrap:wrap;align-items:flex-start}
    .np-foot .np-flow{grid-template-columns:1fr 18px 1fr 18px 1fr 18px 1fr}
    .np-foot .np-sc svg{height:92px;width:auto;max-width:100%;margin:0 auto}
    .np-foot .np-ar{margin-top:45px}
    .np-foot .np-sc small{padding:0 2px}
    .np-foot .np-todo{gap:6px}.np-foot .np-todo li{padding:8px 10px}
    @media(max-width:1100px){.np-wrap.np-foot{grid-template-columns:1fr}.np-foot .np-flow{grid-template-columns:1fr 36px 1fr 36px 1fr 36px 1fr}.np-foot .np-sc svg{height:auto;width:100%}.np-foot .np-ar{margin-top:60px}}
    @media(max-width:860px){.np-foot .np-flow{grid-template-columns:1fr 1fr}}
    .np-bar{height:6px;border-radius:6px;background:var(--line);margin:14px 0 6px;overflow:hidden}
    .np-bar i{display:block;height:100%;border-radius:6px;background:linear-gradient(90deg,var(--g6),var(--g5));width:0;animation:np-bar 1s .4s cubic-bezier(.3,.8,.2,1) forwards}
    @keyframes np-bar{to{width:var(--w)}}
    .np-todo{display:flex;flex-direction:column;gap:8px;margin:12px 0 0;padding:0;list-style:none}
    .np-todo li{display:flex;align-items:center;gap:12px;padding:11px 12px;border-radius:14px;border:1px solid var(--line);font-size:13.5px;font-weight:600;transition:.15s}
    .np-todo li .tk{width:30px;height:30px;flex:none;border-radius:10px;display:grid;place-items:center;background:var(--bg);color:var(--ink3)}
    .np-todo li .tk svg{width:16px;height:16px}
    .np-todo li.ok{background:linear-gradient(90deg,var(--g1),#fff 70%);border-color:var(--g2)}.np-todo li.ok .tk{background:var(--g7);color:#fff}
    .np-todo li span{flex:1}.np-todo li small{display:block;color:var(--ink3);font-size:12px;font-weight:500;margin-top:1px}
    .np-todo li[data-go]{cursor:pointer}.np-todo li[data-go]:hover{border-color:var(--g5);transform:translateX(2px)}
    .np-todo li>.ico{color:var(--ink3)}
    /* Demand: the application in one bar */
    .np-strip{position:relative;overflow:hidden;display:flex;align-items:center;gap:18px;margin:0 0 18px;padding:14px 18px;border-radius:16px;color:#fff;background:radial-gradient(80% 160% at 100% 0%,rgba(52,190,128,.35),transparent 60%),linear-gradient(120deg,var(--g9),var(--g7))}
    .np-strip .np-eyebrow{flex:none}
    .np-strip .tx{flex:1;min-width:0;font-size:13px;color:rgba(255,255,255,.78);line-height:1.4}.np-strip .tx b{display:block;color:#fff;font-size:14.5px}
    .np-strip ol{display:flex;gap:6px;margin:0;padding:0;list-style:none}
    .np-strip ol li{width:34px;height:6px;border-radius:6px;background:rgba(255,255,255,.18)}
    .np-strip ol li.done{background:#9fe3c2}.np-strip ol li.now{background:#f5c26b;animation:np-glow 1.8s ease-in-out infinite}
    @keyframes np-glow{50%{opacity:.45}}
    .np-strip .btn{flex:none;height:36px;background:#fff;color:var(--g8)}.np-strip .btn:hover{background:var(--g1)}
    @media(max-width:760px){.np-strip{flex-wrap:wrap}.np-strip ol{display:none}}
    .np-note{display:flex;align-items:center;gap:10px;margin:0 0 16px;padding:10px 14px;border-radius:12px;background:#fffaf0;border:1px solid #f1dfb8;font-size:13px;color:#7a5413}
    .np-note svg{width:16px;height:16px;flex:none}.np-note a{margin-left:auto;font-weight:700;color:var(--g7);cursor:pointer;white-space:nowrap}
        @media(max-width:640px){.np-hero{padding:24px 20px}.np-top{grid-template-columns:1fr}.np-ring{display:none}.np-hero h1{font-size:30px}
      .np-steps{grid-template-columns:1fr 1fr;row-gap:18px}.np-steps:before,.np-steps:after,.np-steps li.now:after{display:none}}
    @media(prefers-reduced-motion:reduce){.np-wrap *,.np-wrap>*{animation-duration:.01s!important;animation-delay:0s!important;animation-iteration-count:1!important;transition:none!important}
      .np-how svg *{animation:none!important}.np-res{opacity:1}
      .np-hero:before,.np-hero:after,.np-ring:before,.np-steps:after,.np-steps li.now i:before{animation:none!important}.np-steps:after{width:calc(25% + 6px)}.np-steps li.now:after{animation:none!important;opacity:1}.np-hero:after{display:none}}
  </style>`;
  if (!document.getElementById('np-style')) document.head.insertAdjacentHTML('beforeend', css);

  const check = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
  const clock = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  // infographic scenes (viewBox 200×120): search → your listing → contact → lead
  const SCENE = {
    search: `<svg viewBox="0 0 200 120" aria-hidden="true"><circle cx="100" cy="62" r="52" fill="#eef7f2"/>
      <rect x="22" y="30" width="156" height="30" rx="15" fill="#fff" stroke="#d8efe3" stroke-width="2"/>
      <rect class="np-type" x="40" y="42" width="84" height="6" rx="3" fill="#136142"/>
      <circle cx="160" cy="45" r="11" fill="#136142"/><circle cx="158.5" cy="43.5" r="4" fill="none" stroke="#fff" stroke-width="2"/><path d="m161.5 46.5 3 3" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
      <g class="np-res"><rect x="34" y="68" width="132" height="16" rx="8" fill="#fff"/><circle cx="46" cy="76" r="4" fill="#25946a"/><rect x="56" y="73" width="70" height="5" rx="2.5" fill="#bfd9cb"/></g>
      <g class="np-res r2"><rect x="34" y="88" width="132" height="16" rx="8" fill="#fff"/><circle cx="46" cy="96" r="4" fill="#e0a526"/><rect x="56" y="93" width="54" height="5" rx="2.5" fill="#bfd9cb"/></g></svg>`,
    listing: `<svg viewBox="0 0 200 120" aria-hidden="true"><circle cx="100" cy="62" r="52" fill="#eef7f2"/>
      <rect x="56" y="18" width="88" height="92" rx="12" fill="#fff" stroke="#d8efe3" stroke-width="2"/>
      <rect x="63" y="25" width="74" height="44" rx="7" fill="#d8efe3"/><path d="M63 62l18-15 12 9 10-7 34 18v2a6 6 0 0 1-6 6H69a6 6 0 0 1-6-6z" fill="#25946a"/>
      <rect x="66" y="77" width="50" height="6" rx="3" fill="#136142"/><rect x="66" y="88" width="34" height="4" rx="2" fill="#d3dad5"/><rect x="66" y="97" width="26" height="6" rx="3" fill="#d8efe3"/>
      <g class="np-pop"><rect x="98" y="30" width="44" height="16" rx="8" fill="#fff" stroke="#136142" stroke-width="1.5"/><circle cx="107" cy="38" r="4.5" fill="#136142"/><path d="m105 38 1.5 1.5 3-3" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/><rect x="114" y="36" width="22" height="4" rx="2" fill="#136142"/></g>
      <g class="np-cur"><path d="M120 72l0 22 6-6 5 10 4-2-5-10 8 0z" fill="#14201a" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></g></svg>`,
    contact: `<svg viewBox="0 0 200 120" aria-hidden="true"><circle cx="100" cy="62" r="52" fill="#eef7f2"/>
      <circle class="np-ring2" cx="56" cy="62" r="20" fill="none" stroke="#136142" stroke-width="2"/><g class="np-ch"><circle cx="56" cy="62" r="20" fill="#136142"/><path d="M49.5 55h4l1.8 4.6-2.4 1.6a11 11 0 0 0 6 6l1.6-2.4 4.6 1.8v4a2 2 0 0 1-2 2A16 16 0 0 1 47.5 57a2 2 0 0 1 2-2z" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></g>
      <circle class="np-ring2 c2" cx="100" cy="62" r="20" fill="none" stroke="#1faa59" stroke-width="2"/><g class="np-ch c2"><circle cx="100" cy="62" r="20" fill="#1faa59"/><path d="M91 72l1.6-5a9 9 0 1 1 3.6 3.4z" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></g>
      <circle class="np-ring2 c3" cx="144" cy="62" r="20" fill="none" stroke="#e0a526" stroke-width="2"/><g class="np-ch c3"><circle cx="144" cy="62" r="20" fill="#e0a526"/><path d="M135 54h18v11h-11l-7 5z" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></g>
      <rect x="44" y="94" width="112" height="6" rx="3" fill="#d8efe3"/></svg>`,
    lead: `<svg viewBox="0 0 200 120" aria-hidden="true"><circle cx="100" cy="62" r="52" fill="#eef7f2"/>
      <rect x="40" y="16" width="56" height="94" rx="10" fill="#fff" stroke="#d8efe3" stroke-width="2"/><rect x="48" y="24" width="26" height="5" rx="2.5" fill="#136142"/>
      <rect x="104" y="16" width="56" height="94" rx="10" fill="#fff" stroke="#d8efe3" stroke-width="2"/><rect x="112" y="24" width="30" height="5" rx="2.5" fill="#bfd9cb"/>
      <rect x="112" y="38" width="40" height="22" rx="5" fill="#f6f8f6"/><rect x="117" y="44" width="24" height="4" rx="2" fill="#d3dad5"/><rect x="117" y="51" width="16" height="3" rx="1.5" fill="#d3dad5"/>
      <rect x="112" y="66" width="40" height="22" rx="5" fill="#f6f8f6"/><rect x="117" y="72" width="20" height="4" rx="2" fill="#d3dad5"/><rect x="117" y="79" width="14" height="3" rx="1.5" fill="#d3dad5"/>
      <g class="np-drop"><rect x="48" y="38" width="40" height="26" rx="5" fill="#136142"/><circle cx="56" cy="47" r="4" fill="#9fe3c2"/><rect x="63" y="44" width="20" height="4" rx="2" fill="#fff"/><rect x="53" y="55" width="26" height="3" rx="1.5" fill="#9fe3c2"/></g>
      <g class="np-plus"><circle cx="90" cy="22" r="10" fill="#e0a526"/><path d="M90 17v10M85 22h10" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></g></svg>`
  };
  const todo = () => [
    [true, 'Business details', 'Sent with your application', 'brief'],
    [!!d.photo, d.photo ? 'Profile photo' : 'Add a profile photo', d.photo ? 'Customers see it on every listing' : 'Profiles with a photo get more enquiries', 'image'],
    [!!first, first ? 'First listing' : 'Add your first listing', first ? 'Sent with your application' : 'It goes live once you\'re approved', 'home'],
    [false, 'Explore your workspace', 'Try it with sample data', 'compass']
  ];
  // Portfolio, top: where the application is
  function hero() {
    const off = (339.3 * (1 - 2 / 4)).toFixed(1); // the review is step 2 of 4: half the ring
    return `<div class="np-wrap np-head"><section class="np-hero">
        <div class="np-top"><div>
          <span class="np-eyebrow"><span class="np-dot"></span>In review · ${esc(VERT[app.v] || 'Provider')}</span>
          <h1>${welcome ? 'Application sent' : 'You\'re almost there'}, <em>${esc(firstName)}</em></h1>
          <p>Our team is checking your ${app.role === 'company' ? 'licence and signatory ID' : 'ID'} — usually within 24 hours. We'll ${app.phone ? 'WhatsApp you' : 'email you'} as soon as there's a decision. Your listings below go live once you're approved.</p></div>
          <div class="np-ring" style="--off:${off}"><svg viewBox="0 0 120 120"><defs><linearGradient id="np-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9fe3c2"/><stop offset="1" stop-color="#f5c26b"/></linearGradient></defs><circle class="bg" cx="60" cy="60" r="54"/><circle class="fg" cx="60" cy="60" r="54"/></svg>
            <div><b>2<span style="opacity:.5">/4</span></b><small>Team review</small></div></div></div>
        <ol class="np-steps"><li class="done"><i>${check}</i><b>Application sent</b>Details and documents in</li>
          <li class="now"><i>2</i><b>Team review</b>Usually within 24 hours</li>
          <li><i>3</i><b>You're approved</b>Your “Verified” badge appears</li>
          <li><i>4</i><b>Live on UpNow</b>${first ? 'Your listing is checked and goes live' : 'Add listings and get leads'}</li></ol>
      </section></div>`;
  }
  // Portfolio, bottom: how leads will come, and what to do meanwhile
  function extras() {
    const T = todo(), done = T.filter(t => t[0]).length;
    return `<div class="np-wrap np-foot">
      <section class="np-card np-how"><div class="hd"><div><h2>How UpNow gets you leads</h2><p>Once you're live, this is how a customer reaches you.</p></div><span class="chip">Starts when you're approved</span></div>
        <div class="np-flow">${[['search', 'Customers search', 'By area, budget and what they need'], ['listing', 'Your listing shows up', 'With your “Verified” badge'], ['contact', 'They contact you', 'Call, WhatsApp or chat — directly'], ['lead', 'You get the lead', 'On your Leads board, ready to reply']].map(([k, t, sub], i) => `${i ? '<span class="np-ar"></span>' : ''}<div class="np-sc">${SCENE[k]}<b><span class="no">${i + 1}</span>${t}</b><small>${sub}</small></div>`).join('')}</div></section>
      <section class="np-card"><h2>While you wait<span class="sp"></span><small>${done} of ${T.length} done</small></h2>
        <div class="np-bar"><i style="--w:${Math.round(done / T.length * 100)}%"></i></div>
        <ul class="np-todo">${T.map(([ok, t, sub, ic], i) => `<li class="${ok ? 'ok' : ''}" ${i === 3 ? 'data-act="sampleOn"' : ''}><span class="tk">${ok ? check : ico(ic)}</span><span>${esc(t)}<small>${esc(sub)}</small></span>${i === 3 ? ico('chevR') : ''}</li>`).join('')}</ul></section>
    </div>`;
  }
  // Demand: the application in one bar, and that the numbers below are samples
  const strip = () => `<div class="np-strip"><span class="np-eyebrow"><span class="np-dot"></span>In review</span>
      <div class="tx"><b>Your application is with our team — step 2 of 4</b>Usually within 24 hours. Until you're approved, this dashboard shows sample data.</div>
      <ol aria-hidden="true"><li class="done"></li><li class="now"></li><li></li><li></li></ol>
      <a class="btn btn-sm" data-go="portfolio">View application${ico('chevR')}</a></div>`;
  const note = `<div class="np-note">${clock}<span>Your application is in review — this page shows sample data until you're approved.</span><a data-go="portfolio">See status</a></div>`;
  // the application lives on Portfolio now: an old link to application.html goes there
  if (window.PW_START === 'application') { location.replace('portfolio.html' + location.search); return; }

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
    if (P.S.page === 'portfolio') { view.insertAdjacentHTML('afterbegin', hero()); view.insertAdjacentHTML('beforeend', extras()); }
    else if (P.S.page === 'demand') view.insertAdjacentHTML('afterbegin', strip());
    else if (!view.classList.contains('flush')) view.insertAdjacentHTML('afterbegin', note);
  };
})();
