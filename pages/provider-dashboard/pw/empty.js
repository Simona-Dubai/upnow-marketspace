/* Empty states — a provider with a real account (an application on this browser, js/pages/join.js) has no leads,
   bookings or messages yet, so Demand, Leads, Calendar and Communications say so instead of showing made-up numbers,
   like the customer account's empty states (js/pages/account.js). Each page:
     a card    — where they are (a chip), what will appear here, the 3 steps that get it there (a track that fills up to
                 the current one), the one next step for where they are, and an illustration that plays it out on a loop
     get ready — three practical tips for that page, each with a link to where it's done
     a preview — the page as it will look, with nothing in it yet (Demand, Leads)
   The next step follows the account: in review → see the application · approved, nothing live → add a listing ·
   live → connect WhatsApp (Demand, Communications), add a lead yourself (Leads), add to calendar (Calendar).
   "Explore with sample data" switches the whole dashboard to the sample business (per account, remembered); a banner
   under the top bar keeps saying it's sample data, with "Hide sample data" to come back.
   A demo visit (no application) keeps the sample data, as before. Loaded after pw/new-provider.js and pw/portfolio.js. */
(function () {
  const P = window.PWA; if (!P || !window.PW) return;
  const { ico, esc, S } = P;
  const read = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  const user = read('upnow.user'), app = read('upnow.join');
  const owner = user && (user.email || (user.dial || '') + user.phone);
  if (!app || !owner || (app.owner && app.owner !== owner) || !app.status || app.status === 'draft') return;

  const KEY = 'upnow.pw.sample@' + owner;
  let sample = false; try { sample = localStorage.getItem(KEY) === '1'; } catch (e) {}
  const items = () => ((read('upnow.listings@' + owner) || {}).items || []);
  const approved = () => app.status === 'approved' || !!(read('upnow.listings@' + owner) || {}).verified;
  const live = () => items().some(x => x.status === 'live');
  const stage = () => !approved() ? 'review' : live() ? 'live' : 'approved'; // approval first: the sidebar says "In review" until then
  const DATA = ['demand', 'leads', 'calendar', 'inbox'];

  P.acts.sampleOn = () => { try { localStorage.setItem(KEY, '1'); } catch (e) {} location.reload(); };
  P.acts.sampleOff = () => { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); };

  if (!sample) {
    // no sample leads or bookings anywhere: the sidebar counts, search and the pages all start at zero
    // (bookings they add themselves stay — S.extraEvents)
    PW.LEADS = [];
    PW.EVENTS = [];
  }

  const css = `<style id="pe-style">
    .pe-page{display:flex;flex-direction:column;gap:22px}
    .pe-page>*{animation:pe-up .55s cubic-bezier(.2,.7,.2,1) both}
    .pe-page>*:nth-child(2){animation-delay:.07s}.pe-page>*:nth-child(3){animation-delay:.14s}.pe-page>*:nth-child(4){animation-delay:.21s}
    @keyframes pe-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
    .pe-page .ph{margin-bottom:0}
    /* the card: a soft wash of the brand greens with a dotted corner, so it reads as a moment, not a blank page */
    .pe{position:relative;overflow:hidden;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.9fr);gap:12px 36px;align-items:center;padding:34px 38px;border-radius:24px;border:1px solid #d8efe3;
      background:radial-gradient(90% 120% at 100% 0%,#e3f4ea 0%,transparent 60%),radial-gradient(70% 90% at 0% 100%,#fdf3e1 0%,transparent 55%),#fbfdfb;box-shadow:0 18px 44px -26px rgba(11,61,42,.35)}
    .pe:before{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(19,97,66,.10) 1px,transparent 1px);background-size:18px 18px;
      mask-image:linear-gradient(115deg,transparent 45%,#000 95%);-webkit-mask-image:linear-gradient(115deg,transparent 45%,#000 95%);pointer-events:none}
    .pe>*{position:relative}
    .pe-chip{display:inline-flex;align-items:center;gap:8px;padding:5px 12px 5px 10px;border-radius:99px;background:#fff;border:1px solid #d8efe3;font-size:12px;font-weight:700;color:var(--g8);box-shadow:0 2px 8px -4px rgba(11,61,42,.2)}
    .pe-chip.is-review{color:#7a5413;border-color:#f1dfb8}
    .pe-dot{position:relative;width:8px;height:8px;border-radius:50%;background:var(--g6)}.is-review .pe-dot{background:#e0a526}
    .pe-dot:after{content:"";position:absolute;inset:-4px;border-radius:50%;border:2px solid currentColor;opacity:.5;animation:pe-ping 1.8s ease-out infinite}
    .pe-chip .pe-dot:after{border-color:var(--g6)}.pe-chip.is-review .pe-dot:after{border-color:#e0a526}
    @keyframes pe-ping{from{opacity:.8;transform:scale(.6)}to{opacity:0;transform:scale(1.9)}}
    .pe h2{margin-top:14px;font-family:var(--serif);font-weight:400;font-size:34px;line-height:1.08;letter-spacing:-.01em;color:var(--g9)}
    .pe-sub{margin:10px 0 24px;max-width:520px;font-size:14.5px;color:var(--ink2,var(--ink3));line-height:1.55}
    /* the steps on a track that fills up to where they are */
    .pe ol{position:relative;display:flex;flex-direction:column;gap:16px;margin:0;padding:0;list-style:none}
    .pe ol:before,.pe ol:after{content:"";position:absolute;left:14px;top:16px;width:2px;border-radius:2px}
    .pe ol:before{bottom:16px;background:#d8efe3}
    .pe ol:after{height:0;background:linear-gradient(180deg,var(--g6),#e0a526);animation:pe-track 1s .35s cubic-bezier(.3,.8,.2,1) forwards}
    .pe ol[data-at="1"]:after{--h:0px}.pe ol[data-at="2"]:after{--h:calc(50% - 16px)}.pe ol[data-at="3"]:after{--h:calc(100% - 32px)}
    @keyframes pe-track{to{height:var(--h)}}
    .pe ol li{position:relative;z-index:1;display:flex;gap:14px;align-items:flex-start}
    .pe ol li>i{width:30px;height:30px;flex:none;display:grid;place-items:center;border-radius:50%;background:#fff;border:2px solid #d8efe3;color:var(--g7);font-style:normal;font-weight:800;font-size:12.5px;transition:.2s}
    .pe ol li>i svg{width:14px;height:14px}
    .pe ol li.done>i{background:var(--g7);border-color:var(--g7);color:#fff}
    .pe ol li.now>i{background:#f5c26b;border-color:#f5c26b;color:#5a3a06;box-shadow:0 0 0 6px rgba(245,194,107,.25);animation:pe-now 2.2s ease-in-out infinite}
    @keyframes pe-now{50%{box-shadow:0 0 0 10px rgba(245,194,107,.08)}}
    .pe ol li b{display:block;padding-top:5px;font-size:14.5px;font-weight:700;color:var(--ink)}.pe ol li small{display:block;margin-top:2px;color:var(--ink3);font-size:12.5px;line-height:1.45}
    .pe ol li.now b{color:#8a5a14}
    .pe-acts{display:flex;gap:10px;flex-wrap:wrap;margin-top:26px}
    .pe-acts .btn-o{background:#fff}
    .pe-more{display:flex;align-items:center;gap:12px;max-width:520px;margin-top:16px;padding:11px 14px;border-radius:14px;border:1.5px dashed #f1dfb8;background:#fffaf0;color:#7a5413;font-size:13px;line-height:1.4;cursor:pointer;transition:border-color .15s,transform .15s}
    .pe-more:hover{border-color:#e0a526;transform:translateY(-1px)}
    .pe-more>i{width:28px;height:28px;flex:none;display:grid;place-items:center;border-radius:50%;background:#f5c26b;color:#5a3a06;font-style:normal;font-weight:800;font-size:13px;animation:pe-now 2.2s ease-in-out infinite}
    .pe-more>span{flex:1;min-width:0}.pe-more b{display:block;color:#5a3a06;font-size:13.5px}.pe-more .ico{width:16px;height:16px;flex:none}
    /* the steps play in one by one, the current one pulses, and the part of the track still ahead flows towards it */
    .pe ol li{opacity:0;animation:pe-step .5s cubic-bezier(.2,.7,.2,1) forwards}
    .pe ol li:nth-child(1){animation-delay:.25s}.pe ol li:nth-child(2){animation-delay:.5s}.pe ol li:nth-child(3){animation-delay:.75s}
    @keyframes pe-step{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:none}}
    .pe ol li>i{animation:pe-pin .45s cubic-bezier(.3,1.6,.5,1) both;animation-delay:inherit}
    .pe ol li.now>i{animation:pe-pin .45s cubic-bezier(.3,1.6,.5,1) both,pe-now 2.2s 1s ease-in-out infinite}
    @keyframes pe-pin{from{transform:scale(.4)}to{transform:none}}
    .pe ol:before{background:repeating-linear-gradient(180deg,#cfe2d7 0 6px,transparent 6px 12px);background-size:2px 12px;animation:pe-flow 1.2s linear infinite}
    @keyframes pe-flow{to{background-position:0 12px}}
    .pe-art{justify-self:center;width:100%;max-width:380px}.pe-art svg{display:block;width:100%;height:auto;overflow:visible}
    .pe-art svg *{transform-box:fill-box}
    /* illustrations that play the page out on a 6s loop */
    .pe-bob{transform-origin:center;animation:pe-bob 3.2s ease-in-out infinite}.pe-bob.b2{animation-delay:-1.1s}.pe-bob.b3{animation-delay:-2.2s}
    @keyframes pe-bob{50%{transform:translateY(-5px)}}
    .pe-ring{transform-origin:center;animation:pe-ring 2s ease-out infinite}
    @keyframes pe-ring{from{opacity:.7;transform:scale(.7)}to{opacity:0;transform:scale(1.9)}}
    .pe-draw{stroke-dasharray:240;stroke-dashoffset:240;animation:pe-draw 6s ease-in-out infinite}
    @keyframes pe-draw{0%,8%{stroke-dashoffset:240}45%,88%{stroke-dashoffset:0}100%{stroke-dashoffset:0;opacity:0}}
    .pe-bar{transform-origin:center bottom;animation:pe-bar 6s cubic-bezier(.3,.8,.2,1) infinite}
    .pe-bar.d1{animation-delay:.12s}.pe-bar.d2{animation-delay:.24s}.pe-bar.d3{animation-delay:.36s}.pe-bar.d4{animation-delay:.48s}
    @keyframes pe-bar{0%,6%{transform:scaleY(.08)}30%,88%{transform:scaleY(1)}100%{transform:scaleY(.08)}}
    .pe-pop{transform-origin:center;opacity:0;animation:pe-pop 6s infinite}.pe-pop.p2{animation-delay:.5s}.pe-pop.p3{animation-delay:1s}
    @keyframes pe-pop{0%,40%{opacity:0;transform:scale(.4) translateY(6px)}48%{opacity:1;transform:scale(1.12)}54%,88%{opacity:1;transform:none}100%{opacity:0}}
    .pe-drop{animation:pe-drop 6s cubic-bezier(.3,.8,.2,1) infinite}
    @keyframes pe-drop{0%,10%{opacity:0;transform:translate(0,-34px)}22%{opacity:1;transform:translate(0,3px)}26%,46%{opacity:1;transform:none}62%,88%{opacity:1;transform:translate(61px,0)}100%{opacity:0;transform:translate(61px,0)}}
    .pe-fill{opacity:0;animation:pe-fill 6s infinite}.pe-fill.f2{animation-delay:.6s}.pe-fill.f3{animation-delay:1.2s}
    @keyframes pe-fill{0%,14%{opacity:0;transform:scale(.6)}24%,88%{opacity:1;transform:none}100%{opacity:0}}
    .pe-swing{transform-origin:center top;animation:pe-swing 3s ease-in-out infinite}
    @keyframes pe-swing{0%,60%,100%{transform:rotate(0)}68%{transform:rotate(14deg)}76%{transform:rotate(-12deg)}84%{transform:rotate(6deg)}}
    .pe-msg{opacity:0;animation:pe-msg 6s infinite}.pe-msg.m2{animation-delay:1.4s}.pe-msg.m3{animation-delay:2.8s}
    @keyframes pe-msg{0%,4%{opacity:0;transform:translateY(8px)}12%,88%{opacity:1;transform:none}100%{opacity:0}}
    .pe-type{opacity:0;animation:pe-type 6s infinite}
    @keyframes pe-type{0%,16%{opacity:0}20%,36%{opacity:1}40%,100%{opacity:0}}
    .pe-type circle{animation:pe-blink 1s infinite}.pe-type circle:nth-child(2){animation-delay:.15s}.pe-type circle:nth-child(3){animation-delay:.3s}
    @keyframes pe-blink{50%{opacity:.25}}
    /* get ready: three things worth doing before the first lead */
    .pe-tips>h3,.pe-ghost>h3{display:flex;align-items:baseline;gap:10px;margin:0 0 12px;font-size:16px;letter-spacing:-.01em}
    .pe-tips>h3 small,.pe-ghost>h3 small{font-size:12.5px;font-weight:600;color:var(--ink3)}
    .pe-tipgrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
    .pe-tip{display:flex;flex-direction:column;gap:6px;padding:18px;border-radius:18px;background:#fff;border:1px solid var(--line);transition:transform .18s,box-shadow .18s,border-color .18s}
    .pe-real .att,.pe-real .kpi{cursor:default}.pe-real .att>div:hover{background:none}.pe-real .kpi:hover{border-color:var(--line)}
    .pe-real .att{animation:pe-step .5s cubic-bezier(.2,.7,.2,1) both}.pe-real .kpi .d{color:var(--ink3);font-weight:600}
    .pe-real .kpi{animation:pe-step .5s cubic-bezier(.2,.7,.2,1) both}.pe-real .kpi:nth-child(1){animation-delay:.1s}.pe-real .kpi:nth-child(2){animation-delay:.2s}.pe-real .kpi:nth-child(3){animation-delay:.3s}.pe-real .kpi:nth-child(4){animation-delay:.4s}
    .pe-tip,.pe-tile{animation:pe-step .5s cubic-bezier(.2,.7,.2,1) both}
    .pe-tip:nth-child(2),.pe-tile:nth-child(2){animation-delay:.1s}.pe-tip:nth-child(3),.pe-tile:nth-child(3){animation-delay:.2s}.pe-tile:nth-child(4){animation-delay:.3s}
    .pe-tip>i{transition:transform .2s}.pe-tip:hover>i{transform:scale(1.08) rotate(-4deg)}
    .pe-tip:hover{transform:translateY(-2px);border-color:#bfe3cf;box-shadow:0 14px 30px -20px rgba(11,61,42,.4)}
    .pe-tip>i{width:38px;height:38px;margin-bottom:6px;display:grid;place-items:center;border-radius:12px;background:var(--g1);color:var(--g7)}
    .pe-tip>i svg{width:18px;height:18px}.pe-tip.is-amber>i{background:#fbf1e2;color:#a8701a}
    .pe-tip b{font-size:14.5px}.pe-tip p{margin:0;flex:1;color:var(--ink3);font-size:13px;line-height:1.5}
    .pe-tip a{margin-top:8px;display:inline-flex;align-items:center;gap:4px;font-size:13px;font-weight:700;color:var(--g7);cursor:pointer}
    .pe-tip a .ico{width:14px;height:14px;transition:transform .18s}.pe-tip:hover a .ico{transform:translateX(3px)}
    /* the page as it will look, with a light passing over the empty places */
    .pe-tiles,.pe-cols{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
    .pe-tile,.pe-col{padding:16px 18px;border:1px dashed #cfe2d7;border-radius:16px;background:rgba(255,255,255,.7)}
    .pe-tile span{display:block;font-size:13px;color:var(--ink3);font-weight:600}
    .pe-tile em{display:block;margin-top:10px;font-style:normal;font-size:12px;color:var(--ink3)}
    .pe-sh{display:block;border-radius:8px;background:linear-gradient(90deg,#eef3f0 0,#f8fbf9 40%,#eef3f0 80%);background-size:300% 100%;animation:pe-sh 2.4s linear infinite}
    @keyframes pe-sh{from{background-position:100% 0}to{background-position:-200% 0}}
    .pe-tile .pe-sh{height:26px;width:55%;margin-top:10px}
    .pe-col{padding:12px;min-height:126px}.pe-col span{display:flex;justify-content:space-between;font-size:13px;font-weight:700;color:var(--ink3)}
    .pe-col .pe-sh{height:44px;margin-top:10px}.pe-col .pe-sh+.pe-sh{opacity:.55}
    .pe-wrap{padding:24px 28px 60px;overflow:auto;height:100%}
    /* sample data, said once under the top bar on every page */
    .pe-banner{flex:none;display:flex;align-items:center;gap:12px;padding:9px 24px;background:#fffaf0;border-bottom:1px solid #f1dfb8;font-size:13px;color:#7a5413}
    .pe-banner svg{width:16px;height:16px;flex:none}.pe-banner b{color:#5a3a06}
    .pe-banner span{flex:1;min-width:0}
    .pe-banner a{font-weight:700;color:var(--g7);cursor:pointer;white-space:nowrap}
    @media(max-width:1000px){.pe-tipgrid{grid-template-columns:1fr}}
    @media(max-width:900px){.pe{grid-template-columns:1fr;padding:26px 22px}.pe-art{grid-row:1;max-width:280px}.pe h2{font-size:28px}.pe-tiles,.pe-cols{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(prefers-reduced-motion:reduce){.pe-page *,.pe-page>*{animation-duration:.01s!important;animation-delay:0s!important;animation-iteration-count:1!important}
      .pe-pop,.pe-fill,.pe-msg,.pe-drop,.pe ol li{opacity:1}.pe-draw{stroke-dashoffset:0}.pe ol:after{height:var(--h)}}
  </style>`;
  if (!document.getElementById('pe-style')) document.head.insertAdjacentHTML('beforeend', css);

  const check = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
  // illustrations in the onboarding style (pw/new-provider.js): a pale circle, brand greens, one amber accent — each
  // plays out what the page will do: demand grows, a lead drops in and moves on, the week fills, a chat gets a reply
  const ART = {
    demand: `<svg viewBox="0 0 300 210" aria-hidden="true"><circle cx="150" cy="110" r="90" fill="#e6f4ec"/>
      <rect x="52" y="40" width="196" height="132" rx="16" fill="#fff" stroke="#d8efe3" stroke-width="2"/>
      <rect x="68" y="56" width="64" height="6" rx="3" fill="#136142"/><rect x="68" y="68" width="40" height="4" rx="2" fill="#bfd9cb"/>
      ${[[76, 30], [104, 44], [132, 38], [160, 58], [188, 72]].map(([x, h], i) => `<rect class="pe-bar d${i}" x="${x}" y="${156 - h}" width="18" height="${h}" rx="5" fill="${i === 4 ? '#25946a' : '#d8efe3'}"/>`).join('')}
      <path class="pe-draw" d="M78 128l28-14 28 6 28-20 28-14 30-16" fill="none" stroke="#136142" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="221" cy="70" r="12" fill="none" stroke="#e0a526" stroke-width="2" class="pe-ring"/><circle cx="221" cy="70" r="6" fill="#e0a526"/>
      <g class="pe-pop"><rect x="196" y="22" width="70" height="26" rx="13" fill="#136142"/><circle cx="210" cy="35" r="6" fill="#9fe3c2"/><path d="M210 32v6M207 35h6" stroke="#136142" stroke-width="1.8" stroke-linecap="round"/><rect x="221" y="31" width="34" height="5" rx="2.5" fill="#fff"/><rect x="221" y="39" width="22" height="3" rx="1.5" fill="#9fe3c2"/></g>
      <g class="pe-bob b2"><circle cx="46" cy="96" r="15" fill="#fff" stroke="#d8efe3" stroke-width="2"/><path d="M40 90h4l1.6 4-2 1.3a9 9 0 0 0 4.8 4.8l1.3-2 4 1.6v3.6a1.6 1.6 0 0 1-1.6 1.6A13.6 13.6 0 0 1 38.4 91.6 1.6 1.6 0 0 1 40 90z" fill="none" stroke="#136142" stroke-width="1.8" stroke-linejoin="round"/></g>
      <g class="pe-bob b3"><circle cx="258" cy="140" r="14" fill="#1faa59"/><path d="M251 148l1.3-4a7.4 7.4 0 1 1 2.9 2.7z" fill="none" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"/></g></svg>`,
    leads: `<svg viewBox="0 0 300 210" aria-hidden="true"><circle cx="150" cy="110" r="90" fill="#e6f4ec"/>
      ${[0, 1, 2].map(c => `<rect x="${62 + c * 61}" y="50" width="54" height="124" rx="11" fill="#fff" stroke="#d8efe3" stroke-width="2"/><rect x="${70 + c * 61}" y="60" width="${[26, 32, 22][c]}" height="5" rx="2.5" fill="${c ? '#bfd9cb' : '#136142'}"/>`).join('')}
      <rect x="131" y="112" width="38" height="24" rx="6" fill="#f3f6f4"/><rect x="192" y="76" width="38" height="24" rx="6" fill="#f3f6f4"/>
      <g class="pe-drop"><rect x="70" y="74" width="38" height="30" rx="7" fill="#136142"/><circle cx="79" cy="83" r="4" fill="#9fe3c2"/><rect x="86" y="81" width="16" height="4" rx="2" fill="#fff"/><rect x="76" y="92" width="26" height="3" rx="1.5" fill="#9fe3c2"/><rect x="76" y="98" width="16" height="3" rx="1.5" fill="#9fe3c2" opacity=".6"/></g>
      <g class="pe-bob"><circle cx="89" cy="30" r="14" fill="#fff" stroke="#d8efe3" stroke-width="2"/><circle cx="89" cy="27" r="4" fill="#136142"/><path d="M81 37c1.5-4 4.5-5.5 8-5.5s6.5 1.5 8 5.5" fill="#136142"/></g>
      <g class="pe-pop"><circle cx="108" cy="50" r="10" fill="#e0a526"/><path d="M108 45v10M103 50h10" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></g>
      <g class="pe-pop p3"><rect x="186" y="150" width="60" height="22" rx="11" fill="#fff" stroke="#136142" stroke-width="1.5"/><circle cx="198" cy="161" r="5" fill="#136142"/><path d="m195.8 161 1.6 1.6 3-3" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/><rect x="207" y="158" width="30" height="5" rx="2.5" fill="#136142"/></g></svg>`,
    calendar: `<svg viewBox="0 0 300 210" aria-hidden="true"><circle cx="150" cy="110" r="90" fill="#e6f4ec"/>
      <rect x="66" y="46" width="168" height="130" rx="16" fill="#fff" stroke="#d8efe3" stroke-width="2"/><path d="M66 62a16 16 0 0 1 16-16h136a16 16 0 0 1 16 16v12H66z" fill="#136142"/>
      <rect x="102" y="36" width="6" height="20" rx="3" fill="#25946a"/><rect x="192" y="36" width="6" height="20" rx="3" fill="#25946a"/>
      ${[0, 1, 2, 3, 4].map(c => [0, 1, 2].map(r => `<rect x="${80 + c * 29}" y="${88 + r * 26}" width="22" height="18" rx="5" fill="#f3f6f4"/>`).join('')).join('')}
      <rect class="pe-fill" x="109" y="88" width="22" height="18" rx="5" fill="#25946a"/>
      <rect class="pe-fill f2" x="167" y="114" width="22" height="18" rx="5" fill="#136142"/>
      <rect class="pe-fill f3" x="138" y="140" width="22" height="18" rx="5" fill="#e0a526"/>
      <g class="pe-pop p3"><circle cx="232" cy="150" r="14" fill="#136142"/><path d="m225.5 150 4.5 4.5 8-8.5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></g>
      <g class="pe-swing" style="transform-origin:246px 30px"><path d="M236 52v-9a10 10 0 0 1 20 0v9l3 4h-26z" fill="#e0a526"/><path d="M242 60a4 4 0 0 0 8 0" fill="none" stroke="#e0a526" stroke-width="2.4" stroke-linecap="round"/></g></svg>`,
    inbox: `<svg viewBox="0 0 300 210" aria-hidden="true"><circle cx="150" cy="110" r="90" fill="#e6f4ec"/>
      <rect x="58" y="50" width="184" height="124" rx="16" fill="#fff" stroke="#d8efe3" stroke-width="2"/>
      <g class="pe-msg"><rect x="74" y="66" width="102" height="24" rx="12" fill="#f3f6f4"/><rect x="86" y="75" width="64" height="5" rx="2.5" fill="#bfd9cb"/></g>
      <g class="pe-type"><rect x="186" y="100" width="40" height="22" rx="11" fill="#d8efe3"/><circle cx="198" cy="111" r="2.6" fill="#136142"/><circle cx="206" cy="111" r="2.6" fill="#136142"/><circle cx="214" cy="111" r="2.6" fill="#136142"/></g>
      <g class="pe-msg m2"><rect x="122" y="100" width="104" height="24" rx="12" fill="#136142"/><rect x="134" y="109" width="70" height="5" rx="2.5" fill="#9fe3c2"/></g>
      <g class="pe-msg m3"><rect x="74" y="134" width="80" height="24" rx="12" fill="#f3f6f4"/><rect x="86" y="143" width="44" height="5" rx="2.5" fill="#bfd9cb"/><circle cx="168" cy="146" r="9" fill="#e0a526"/><path d="m164.5 146 2.5 2.5 4.5-4.5" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></g>
      <g class="pe-bob"><circle cx="70" cy="44" r="14" fill="#136142"/><path d="M63 39h14v9h-8l-6 4z" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/></g>
      <g class="pe-bob b2"><circle cx="104" cy="36" r="12" fill="#1faa59"/><path d="M98 43l1.1-3.6a6.6 6.6 0 1 1 2.6 2.5z" fill="none" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></g>
      <g class="pe-bob b3"><circle cx="234" cy="46" r="12" fill="#fff" stroke="#d8efe3" stroke-width="2"/><rect x="227" y="41" width="14" height="10" rx="2" fill="none" stroke="#136142" stroke-width="1.6"/><path d="m227 42 7 5 7-5" fill="none" stroke="#136142" stroke-width="1.6"/></g></svg>`
  };

  // where they are, in one chip
  const CHIP = { review: ['is-review', 'In review · usually within 24 hours'], approved: ['', 'Approved · add your first listing'], live: ['', 'Live · waiting for your first lead'] };
  // the steps that lead to this page filling up — while in review, the first of them is the application itself
  const road = last => {
    const st = stage(), S3 = [
      [st === 'review' ? 'Application in review' : 'Application approved', st === 'review' ? 'Our team is checking it — usually within 24 hours' : 'You’re a verified provider', st === 'review' ? 'now' : 'done'],
      ['A listing is live', st === 'live' ? 'Customers can find you on UpNow' : 'It goes live once it’s checked', st === 'live' ? 'done' : st === 'approved' ? 'now' : ''],
      [...last, st === 'live' ? 'now' : '']];
    return `<ol data-at="${{ review: 1, approved: 2, live: 3 }[st]}">${S3.map(([t, s, k], i) => `<li class="${k || ''}"><i>${k === 'done' ? check : i + 1}</i><div><b>${esc(t)}</b><small>${esc(s)}</small></div></li>`).join('')}</ol>`;
  };
  const next = extra => {
    const st = stage();
    const primary = st === 'review' ? `<a class="btn btn-g" data-go="portfolio">${ico('clock')}See your application</a>`
      : st === 'approved' ? `<button class="btn btn-g" data-act="addListing">${ico('plus')}Add a listing</button>` : extra || '';
    // categories chosen when joining that have no listing yet (pw/portfolio.js) — they can be added and sent for approval now
    const todo = P.pfCatsTodo ? P.pfCatsTodo() : [], SVx = window.SITEUP && SITEUP.VERTICALS;
    const names = todo.map(x => ((SVx[x.v].offers.find(o => o.id === x.c) || {}).label || x.c).toLowerCase());
    const more = todo.length ? `<a class="pe-more" data-go="portfolio"><i>${todo.length}</i><span><b>${todo.length === 1 ? 'One more category to list' : todo.length + ' more categories to list'}</b>${esc(names.slice(0, 3).join(', '))}${names.length > 3 ? '…' : ''} — ${st === 'review' ? 'add them now, they’re sent for approval with your application' : 'add a listing for each'}</span>${ico('chevR')}</a>` : '';
    return `<div class="pe-acts">${primary}<button class="btn btn-o" data-act="sampleOn">${ico('eye')}Explore with sample data</button></div>${more}`;
  };
  // a tip: [icon, title, text, link label, link attributes, amber?]
  const tips = (title, T) => `<section class="pe-tips"><h3>${title}<small>Worth doing before your first lead</small></h3><div class="pe-tipgrid">${T.map(([i, t, p, l, a, amber]) =>
    `<div class="pe-tip ${amber ? 'is-amber' : ''}"><i>${ico(i)}</i><b>${esc(t)}</b><p>${esc(p)}</p>${l ? `<a ${a}>${esc(l)}${ico('chevR')}</a>` : ''}</div>`).join('')}</div></section>`;
  const ghost = body => `<section class="pe-ghost"><h3>What you’ll see here<small>Filled in as customers contact you</small></h3>${body}</section>`;
  const page = (h, p, art, title, sub, last, extra, tipBox, preview = '') => `<div class="pe-page">
      <div class="ph"><div><h1>${h}</h1><p>${p}</p></div></div>
      <section class="pe"><div><span class="pe-chip ${CHIP[stage()][0]}"><span class="pe-dot"></span>${CHIP[stage()][1]}</span>
        <h2>${title}</h2><p class="pe-sub">${sub}</p>${road(last)}${next(extra)}</div>
        <div class="pe-art">${ART[art]}</div></section>
      ${tipBox}${preview}</div>`;
  const first = String((user && user.first) || ((app.d || {}).display) || app.name || '').split(' ')[0];
  const hi = () => { const h = new Date().getHours(); return (h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening') + (first ? ', ' + esc(first) : ''); };
  const demandPreview = () => {
    const K = X().kpis, sub = { 0: 'Customers who contacted you', 1: 'Target 15 min', 2: 'From your leads', 3: 'Deals you closed' };
    return `<div class="pe-real"><div class="att">
        <div class="hl"><small>Waiting for first reply</small><b>0 leads</b><span>None past your 15-min target</span></div>
        <div><small>Today's ${sp() ? 'viewings & visits' : 'jobs & appointments'}</small><b>0 scheduled</b><span>Next: —</span></div>
        <div><small>Open pipeline</small><b>AED 0</b><span>0 active opportunities</span></div>
        <div><small>Listings needing attention</small><b>${items().filter(x => x.status !== 'live').length}</b><span>${items().filter(x => ['verify', 'review', 'licence'].includes(x.status)).length} waiting for approval</span></div></div>
      <div class="g4">${K.map((k, i) => `<div class="kpi"><small>${esc(k[0])}</small><b>${i === 1 ? '—' : /AED/.test(k[1]) ? 'AED 0' : '0'}</b><span class="d">${sub[i]}</span><svg class="spk" viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M0 26H100" fill="none" stroke="#cfe2d7" stroke-width="1.8" stroke-dasharray="4 4" vector-effect="non-scaling-stroke"/></svg></div>`).join('')}</div></div>`;
  };
  const tile = (t, e) => `<div class="pe-tile"><span>${t}</span><i class="pe-sh"></i><em>${e}</em></div>`;
  const CHAT = !!P.CHAT; // in-app chat is on hold site-wide while SITE.chat is false (data/site.js)
  const X = () => P.VX(), sp = () => S.v === 'spaces', visit = () => sp() ? 'viewing' : 'visit';
  const toListings = 'data-go="portfolio"', toChannels = 'data-act="setTabGo" data-arg="Channels"', toAlerts = 'data-act="setTabGo" data-arg="Notifications"';

  const EMPTY = {
    demand: () => page(hi(), 'Here’s where your demand will come from.', 'demand', 'Your demand shows up here',
      'New leads, how fast you reply, viewings and what you win — and which channels bring them — as soon as customers start contacting you.',
      ['Customers contact you', `Every call, WhatsApp${CHAT ? ', chat' : ''} and email lands here`],
      `<a class="btn btn-g" ${toChannels}>${ico('wa')}Connect WhatsApp</a>`,
      tips('Get ready for your first leads', [
        ['image', 'Make your listing easy to choose', 'Bright photos of every room, the real price and what’s included answer most questions before anyone asks.', 'Open your listings', toListings],
        ['bolt', 'Be the first to reply', 'Customers often contact a few providers at once — the one who answers first usually gets the ' + visit() + '. Aim for 15 minutes.', 'Set up alerts', toAlerts, true],
        ['link', 'Bring every channel in', 'Connect WhatsApp Business, Instagram and the portals you use, so every enquiry lands here and nothing gets missed.', 'Connect channels', toChannels]]),
      ghost(demandPreview())),
    leads: () => page('Leads', 'Every customer who contacts you, from first message to won.', 'leads', 'No leads yet',
      `When a customer calls, WhatsApps${CHAT ? ', chats' : ''} or emails you from a listing, they appear here as a card — with how they reached you and what they asked.`,
      ['Reply within 15 minutes', 'Then move them along until they’re won'],
      `<button class="btn btn-g" data-act="addLead">${ico('plus')}Add a lead yourself</button>`,
      tips('How leads work here', [
        ['kanban', 'Every lead has a stage', `${Object.values(X().stages).slice(0, 5).join(' → ')}. Drag a card along as things move, so you always know who to chase.`, '', ''],
        ['plus', 'Add the ones from elsewhere', 'Walk-ins, referrals and calls to your own number belong here too — add them by hand and track them the same way.', 'Add a lead', 'data-act="addLead"'],
        ['clock', 'Fast replies are tracked', 'Your first-response time shows on Demand. New leads waiting longer than 15 minutes are flagged in red.', 'Set up alerts', toAlerts, true]]),
      ghost(`<div class="pe-cols">${Object.values(X().stages).slice(0, 4).map(n => `<div class="pe-col"><span>${esc(n)}<em style="font-style:normal">0</em></span><i class="pe-sh"></i><i class="pe-sh"></i></div>`).join('')}</div>`)),
    calendar: () => page('Calendar', `${sp() ? 'Viewings, check-ins and handovers' : 'Jobs, appointments and site surveys'} across your team.`, 'calendar', 'Nothing booked yet',
      `When you book a ${visit()} with a lead, it appears here — with a confirmation and a reminder for the customer.`,
      [sp() ? 'Book viewings from a lead' : 'Book visits from a lead', 'They fill your week here'],
      `<button class="btn btn-g" data-act="newEvent">${ico('plus')}Add to calendar</button>`,
      tips('Make bookings easy', [
        ['cal', `Book straight from the lead`, `Move a lead to ${esc(X().stages.viewing)} and pick a time — it lands here, linked to the customer.`, 'Go to leads', 'data-go="leads"'],
        ['bell', 'Reminders go out for you', `The customer gets a confirmation and a reminder on the channel they used, so fewer ${visit()}s are missed.`, '', '', true],
        ['users', 'Share the work', 'Assign each booking to someone on your team — they see it in their own week.', 'Add to calendar', 'data-act="newEvent"']])),
    inbox: () => `<div class="pe-wrap">${page('Communications', 'Every conversation with a customer, from every channel, in one place.', 'inbox', 'No conversations yet',
      `WhatsApp, ${CHAT ? 'UpNow chat, ' : ''}email and calls from your listings come into one inbox, next to the lead they belong to.`,
      ['A customer messages you', 'Reply here — it goes back on their channel'],
      `<a class="btn btn-g" ${toChannels}>${ico('wa')}Connect WhatsApp</a>`,
      tips('Reply faster from one place', [
        ['wa', 'Connect WhatsApp Business', 'Most customers in the UAE reach out on WhatsApp. Connect it once and every conversation shows up here.', 'Connect channels', toChannels],
        ['zap', 'Quick replies', sp() ? 'Share viewing slots, a location pin or payment options in one tap — then adjust before sending.' : 'Share available slots, a location pin or a quote in one tap — then adjust before sending.', '', '', true],
        ['note', 'Notes only your team sees', 'Leave an internal note on any conversation — handy when a colleague picks it up.', '', '']]))}</div>`
  };
  // each page stays empty until there's something real on it — a booking or lead they add shows the page itself
  const has = { demand: () => P.leads().length, leads: () => P.leads().length, calendar: () => P.events().length, inbox: () => P.leads().length };
  if (!sample) DATA.forEach(k => {
    const pg = P.pages[k], after = P.after[k];
    P.pages[k] = () => has[k]() ? pg() : EMPTY[k]();
    if (after) P.after[k] = () => { if (has[k]()) after(); };
  });

  const render = P.render;
  P.render = function () {
    render.apply(this, arguments);
    // pw/new-provider.js's "this page shows sample data" notes: this module says it now, and only when it's true
    document.querySelectorAll('#view .np-note, #view .np-strip').forEach(n => n.remove());
    const old = document.querySelector('.pe-banner'); if (old) old.remove();
    if (sample) document.getElementById('view').insertAdjacentHTML('beforebegin', `<div class="pe-banner">${ico('eye')}<span><b>You’re exploring with sample data.</b> These leads, bookings and numbers are made up — yours appear here once customers contact you.</span><a data-act="sampleOff">Hide sample data</a></div>`);
  };
})();
