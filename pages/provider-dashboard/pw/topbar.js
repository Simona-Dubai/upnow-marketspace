/* The top bar in the website's header style (components/layout.js + css/components.css .site-header):
   64px white bar, search on the left; on the right Add listing, a link back to the site, language, notifications
   and the account button — the signed-in person's avatar and first name, with the same menu as on the customer site
   (My account, Customer site, Settings, Sign out). No fees or currency here: UpNow is leads only.
   Replaces what pw/core.js puts in #top after every render. Loaded after pw/empty.js on every dashboard page. */
(function () {
  const P = window.PWA; if (!P) return;
  const { ico, esc, S } = P;
  const read = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  const user = () => read('upnow.user');
  const initials = u => ((((u.first || '')[0] || '') + ((u.last || '')[0] || '')) || (u.email || '?')[0]).toUpperCase();

  const css = `<style id="tb-style">
    .top.tb{height:64px;gap:10px;padding:0 24px}
    .tb .srch{height:40px;background:#f6f8f6;border-color:transparent;transition:border-color .15s,background .15s}
    .tb .srch:focus-within{background:#fff;border-color:var(--g5)}
    .tb .tb-site{display:inline-flex;align-items:center;gap:6px;height:38px;padding:0 12px;border-radius:10px;font-size:13px;font-weight:700;color:var(--ink2);white-space:nowrap}
    .tb .tb-site:hover{background:var(--g1);color:var(--g7)}.tb .tb-site .ico{width:16px;height:16px}
    .tb .ib{color:var(--ink2)}.tb .ib:hover{border-color:var(--g5);color:var(--g7)}
    .tb-acc{position:relative}
    .tb-btn{display:flex;align-items:center;gap:8px;height:38px;padding:0 10px 0 4px;border:1px solid var(--line2);border-radius:99px;background:#fff;font-weight:700;font-size:13.5px;cursor:pointer}
    .tb-btn>.ico{width:14px;height:14px;color:var(--ink3);transition:transform .2s}.tb-acc.open .tb-btn>.ico{transform:rotate(180deg)}
    .tb-av{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;overflow:hidden;background:var(--g7);color:#fff;font-size:12px;font-weight:800}.tb-av img{width:100%;height:100%;object-fit:cover}
    .tb-drop{position:absolute;right:0;top:calc(100% + 8px);width:260px;padding:6px;background:#fff;border:1px solid var(--line);border-radius:14px;box-shadow:0 18px 40px -16px rgba(11,61,42,.3);z-index:90;
      opacity:0;visibility:hidden;transform:translateY(-6px) scale(.98);transform-origin:top right;transition:opacity .18s,transform .18s,visibility 0s linear .18s}
    .tb-acc.open .tb-drop{opacity:1;visibility:visible;transform:none;transition-delay:0s}
    .tb-who{padding:10px 12px 12px;margin-bottom:4px;border-bottom:1px solid var(--line)}.tb-who b{display:block}.tb-who small{color:var(--ink3)}
    .tb-drop a,.tb-drop button{display:flex;align-items:center;gap:10px;width:100%;padding:10px 12px;border-radius:9px;font-size:13.5px;font-weight:600;text-align:left;cursor:pointer;color:var(--ink)}
    .tb-drop a:hover,.tb-drop button:hover{background:var(--g1)}.tb-drop .ico{width:16px;height:16px;color:var(--ink3)}
    .tb-drop hr{height:1px;margin:6px 4px;border:0;background:var(--line)}
    [dir=rtl] .tb-drop{right:auto;left:0;transform-origin:top left}[dir=rtl] .tb-drop a,[dir=rtl] .tb-drop button{text-align:right}
    @media(max-width:900px){.tb .tb-site span,.tb-btn .tb-name{display:none}.top.tb{padding:0 14px}}
  </style>`;
  if (!document.getElementById('tb-style')) document.head.insertAdjacentHTML('beforeend', css);

  const account = () => {
    const u = user();
    if (!u) return `<a class="btn btn-o btn-sm" href="../join.html">Log in</a>`;
    const who = u.phone ? (u.dial || '') + u.phone : String(u.email || '').toLowerCase(), photo = (read('upnow.dash@' + who) || read('upnow.dash') || {}).photo;
    return `<div class="tb-acc"><button class="tb-btn" type="button" data-tb="acc" aria-label="Account menu"><span class="tb-av">${photo ? `<img src="${esc(photo)}" alt="">` : esc(initials(u))}</span><span class="tb-name">${esc(u.first || 'Account')}</span>${ico('chev')}</button>
      <div class="tb-drop"><div class="tb-who"><b>${esc(u.name || u.email || 'Your account')}</b><small>${esc(u.phone ? (u.dial || '') + ' ' + u.phone : u.email || '')}</small></div>
        <a href="../account.html">${ico('home')}My account</a>
        <a href="../../index.html">${ico('compass')}Customer site</a>
        <a data-act="setTabGo" data-arg="Overview">${ico('gear')}Settings</a>
        <hr><button type="button" data-tb="out">${ico('x')}Sign out</button></div></div>`;
  };

  const render = P.render;
  P.render = function () {
    render.apply(this, arguments);
    const top = document.getElementById('top'); if (!top) return;
    // keep the search box (pw/core.js binds it) and swap the rest
    const srch = top.querySelector('.srch');
    top.classList.add('tb');
    top.innerHTML = '';
    if (srch) top.appendChild(srch);
    top.insertAdjacentHTML('beforeend', `<span class="sp"></span>
      <button class="btn btn-g btn-sm" data-act="addListing">${ico('plus')}Add listing</button>
      <a class="tb-site" href="../../index.html" title="Customer site">${ico('compass')}<span>View site</span></a>
      <label class="tsel g"><select id="lgSel"><option value="en" ${S.lang === 'en' ? 'selected' : ''}>English</option><option value="ar" ${S.lang === 'ar' ? 'selected' : ''}>العربية</option></select>${ico('chev')}</label>
      <button class="ib" data-go="inbox" title="Notifications">${ico('bell')}<i></i></button>
      ${account()}`);
    top.querySelector('#lgSel').onchange = e => {
      S.lang = e.target.value; P.save();
      document.documentElement.lang = S.lang; document.documentElement.dir = S.lang === 'ar' ? 'rtl' : 'ltr';
      P.toast(S.lang === 'ar' ? 'تم التبديل إلى العربية' : 'Switched to English');
    };
  };

  document.addEventListener('click', e => {
    const acc = e.target.closest('[data-tb="acc"]');
    document.querySelectorAll('.tb-acc').forEach(m => { if (!acc || m !== acc.parentNode) m.classList.remove('open'); });
    if (acc) acc.parentNode.classList.toggle('open');
    if (e.target.closest('[data-tb="out"]')) { try { localStorage.setItem('upnow.user', 'null'); } catch (x) {} location.href = '../../index.html'; }
    if (e.target.closest('.tb-drop a')) document.querySelectorAll('.tb-acc').forEach(m => m.classList.remove('open'));
  });
})();
