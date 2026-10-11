/* Site header and footer, rendered from the SITE config (data/site.js).
   header(activeNavId, { nav: false, tabs: false }) → logo, navigation (nav: false leaves it out, e.g. where the page has its own category tabs) (with "More" dropdown), currency / language selects, saved / enquiries counters,
   sign-in and a call-to-action button — each part can be switched off in SITE.header.
   On phones the header is joined by a bottom tab bar (Explore · Search · Saved · Enquiries · Log in/Me); tabs: false leaves it out
   (e.g. the listing page, where a sticky action bar takes its place). It is hidden on wider screens by CSS.
   footer({ cta: false }) → optional CTA band (cta: false leaves it out), about text, link columns and legal lines. */
(function () {
  const U = window.UPUI = window.UPUI || {};
  const { ico, esc, t, prefs, store, CUR } = U;
  const HREF = PATHS.href;

  // phone bottom tab bar
  const tabOn = name => ({ search: /search\.html/, home: /(index\.html|\/)$/ })[name].test(location.pathname);
  function meTab() {
    const u = U.auth && U.auth.user();
    return u ? `<button type="button" data-me-tab data-account-tab>${(d => d && d.photo ? `<span class="mobile-tabs-avatar has-photo"><img src="${d.photo}" alt=""></span>` : `<span class="mobile-tabs-avatar">${esc(U.auth.initialsOf(u))}</span>`)(U.store && U.store.get('dash'))}${esc(t('Me'))}</button>`
      : `<button type="button" data-me-tab data-open="signin">${ico('user')}${esc(t('Log in'))}</button>`;
  }
  const mTabs = () => `<nav class="mobile-tabs" aria-label="Main">
      <a href="${SITE.homeHref || HREF.home}" class="${tabOn('home') ? 'is-active' : ''}">${ico('home')}${esc(t('Explore'))}</a>
      <a href="${HREF.search}" class="${tabOn('search') ? 'is-active' : ''}">${ico('search')}${esc(t('Search'))}</a>
      <button type="button" data-open="saved" class="has-saved-state">${ico('heart')}${esc(t('Saved'))}<em id="mtFav" hidden></em></button>
      <button type="button" data-open="enq">${ico('msg')}${esc(t('Enquiries'))}<em id="mtLead" hidden></em></button>
      ${meTab()}</nav>`;
  // sign-in / sign-out changes the last tab
  document.addEventListener('upnow:auth', () => { const m = document.querySelector('.mobile-tabs [data-me-tab]'); if (m) m.outerHTML = meTab(); });
  // "Me" opens the header account menu (a bottom sheet on phones)
  document.addEventListener('click', e => {
    if (!e.target.closest('[data-account-tab]')) return;
    // the phone home screen hides the site header, so "Me" goes straight to the account there
    const m = [...document.querySelectorAll('.site-header .account-menu')].find(x => x.getClientRects().length);
    e.stopImmediatePropagation();
    if (m) m.classList.toggle("is-open"); else location.href = PATHS.href.account;
  }, true);

  // "Become a provider" → "Provider dashboard" once this account has sent its provider application (js/pages/join.js)
  function providerCta(cta) {
    if (!HREF.dashboard || cta.href !== HREF.join || !PATHS.providerApp || !PATHS.providerApp()) return cta;
    return Object.assign({}, cta, { label: 'Provider dashboard', href: HREF.dashboard });
  }
  const ctaHtml = c => `<a class="btn btn-primary btn-sm" href="${c.href}" data-header-cta>${c.icon ? ico(c.icon) : ''}${t(c.label)}</a>`;
  // signing in or out swaps it too (a customer never keeps a provider's "Provider dashboard")
  document.addEventListener('upnow:auth', () => { const b = document.querySelector('.header-actions [data-header-cta]'); if (b && SITE.header.cta) b.outerHTML = ctaHtml(providerCta(SITE.header.cta)); });
  function header(active, { nav = true, tabs = true } = {}) {
    const H = SITE.header, main = H.nav.slice(0, H.visible), rest = H.nav.slice(H.visible), cur = rest.find(x => x.id === active);
    const link = x => `<a href="${x.href}" data-nav="${x.id}" class="${active === x.id ? 'is-active' : ''}">`;
    return `<header class="site-header"><div class="wrap">
      <a class="logo" href="${SITE.homeHref || HREF.home}"><b>${esc(SITE.logoMark)}</b><span>${esc(SITE.name)}</span></a>
      ${nav ? `<nav class="nav">${main.map(x => `${link(x)}${esc(t(x.label))}</a>`).join('')}
        ${rest.length ? `<div class="nav-more"><button class="${cur ? 'is-active' : ''}" type="button">${cur ? esc(t(cur.label)) : 'More'}${ico('chev')}</button>
          <div class="nav-dropdown">${rest.map(x => `${link(x)}${ico(x.icon)}<span><b>${esc(t(x.label))}</b><small>${esc(x.blurb)}</small></span></a>`).join('')}</div></div>` : ''}</nav>` : ''}
      <span class="spacer"></span>
      <div class="header-actions">
        ${H.currency ? `<label class="header-select"><select id="hCur">${Object.keys(CUR).map(k => `<option value="${k}" ${prefs.cur === k ? 'selected' : ''}>${CUR[k][2]} ${k}</option>`).join('')}</select>${ico('chev')}</label>` : ''}
        ${H.language ? `<label class="header-select is-subtle"><select id="hLang">${SITE.languages.map(([k, l]) => `<option value="${k}" ${prefs.lang === k ? 'selected' : ''}>${l}</option>`).join('')}</select>${ico('chev')}</label>` : ''}
        ${regionHtml(H)}
        ${H.saved ? `<button class="icon-btn header-saved" data-open="saved" title="${t('Saved')}" aria-label="${t('Saved')}">${ico('heart')}<em id="hdrFav" hidden></em></button>` : ''}
        ${H.enquiries ? `<button class="icon-btn" data-open="enq" title="${t('Enquiries & replies')}" aria-label="${t('Enquiries & replies')}">${ico('msg')}<em id="hdrLead" hidden></em></button>` : ''}
        ${H.signIn ? (U.accountButton ? U.accountButton() : `<button class="btn btn-outline btn-sm" data-open="signin">${ico('user')}${t('Sign in')}</button>`) : ''}
        ${H.cta ? ctaHtml(providerCta(H.cta)) : ''}
      </div></div></header>${tabs ? mTabs() : ''}`;
  }
  /* currency + language in one compact button — shown where the header has no room for the two selects (≤1180px),
     so every screen size can still change them */
  const LANG_NAME = { en: 'English', ar: 'العربية' };
  function regionHtml(H) {
    if (!H.currency && !H.language) return '';
    const lang = SITE.languages.find(x => x[0] === prefs.lang) || SITE.languages[0];
    return `<div class="header-region"><button type="button" class="header-region-btn" aria-haspopup="dialog" aria-expanded="false" aria-label="Currency and language">
        ${H.currency ? `<span>${CUR[prefs.cur] ? CUR[prefs.cur][2] + ' ' : ''}${esc(prefs.cur)}</span>` : ''}${H.currency && H.language ? '<i aria-hidden="true">·</i>' : ''}${H.language ? `<span>${esc(lang[1])}</span>` : ''}${ico('chev')}</button>
      <div class="header-region-pop" role="dialog" aria-label="Currency and language">
        ${H.currency ? `<p>Currency</p><div class="header-region-grid">${Object.keys(CUR).map(k => `<button type="button" data-region-cur="${k}" class="${prefs.cur === k ? 'is-on' : ''}" aria-pressed="${prefs.cur === k}">${CUR[k][2]} ${k}</button>`).join('')}</div>` : ''}
        ${H.language ? `<p>Language</p><div class="header-region-grid is-lang">${SITE.languages.map(([k, l]) => `<button type="button" data-region-lang="${k}" class="${prefs.lang === k ? 'is-on' : ''}" aria-pressed="${prefs.lang === k}" lang="${k}">${esc(LANG_NAME[k] || l)}</button>`).join('')}</div>` : ''}
      </div></div>`;
  }
  document.addEventListener('click', e => {
    const rb = e.target.closest('.header-region-btn'), rc = e.target.closest('[data-region-cur]'), rl = e.target.closest('[data-region-lang]');
    if (rc) { prefs.cur = rc.dataset.regionCur; store.set('prefs', prefs); location.reload(); return; }
    if (rl) { prefs.lang = rl.dataset.regionLang; store.set('prefs', prefs); location.reload(); return; }
    document.querySelectorAll('.header-region').forEach(x => { if (!(rb && x === rb.parentNode) && !e.target.closest('.header-region-pop')) { x.classList.remove('is-open'); x.firstElementChild.setAttribute('aria-expanded', 'false'); } });
    if (rb) { const on = rb.parentNode.classList.toggle('is-open'); rb.setAttribute('aria-expanded', on); return; }
    const m = e.target.closest('.nav-more > button'); document.querySelectorAll('.nav-more').forEach(x => { if (!m || x !== m.parentNode) x.classList.remove('is-open'); });
    if (m) m.parentNode.classList.toggle('is-open');
  });
  function bindHeader() {
    const L = document.getElementById('hLang'), C = document.getElementById('hCur');
    if (L) L.onchange = () => { prefs.lang = L.value; store.set('prefs', prefs); location.reload(); };
    if (C) C.onchange = () => { prefs.cur = C.value; store.set('prefs', prefs); location.reload(); };
    updateHdrCounts();
  }
  /* header icons: the heart is filled when you have saved listings (no number — nothing to act on);
     the chat icon shows only unread replies — the same number as Messages in the account (it keeps it
     in the 'inbox' record as it works them out), and nothing when there are none */
  function updateHdrCounts() {
    const saved = U.favs ? U.favs.size : 0, unread = ((U.store && U.store.get('inbox')) || {}).unread || 0;
    document.querySelectorAll('.header-saved, .mobile-tabs .has-saved-state').forEach(b => b.classList.toggle('is-filled', saved > 0));
    ['hdrFav', 'mtFav'].forEach(id => { const el = document.getElementById(id); if (el) el.hidden = true; });
    ['hdrLead', 'mtLead'].forEach(id => { const el = document.getElementById(id); if (el) { el.textContent = unread; el.hidden = !unread; } });
    const lead = document.querySelector('.header-actions [data-open="enq"]');
    if (lead) lead.title = unread ? `${unread} unread ${unread === 1 ? 'reply' : 'replies'}` : t('Enquiries & replies');
  }
  const BTN = { light: 'background:#fff;color:var(--color-primary-darkest)', outline: 'border:1.5px solid rgba(255,255,255,.4)' };
  function footer({ cta = true } = {}) {
    const F = SITE.footer, C = cta && F.cta;
    return `${C ? `<div class="wrap"><section class="cta"${C.id ? ` id="${C.id}"` : ''}><div><div class="cta-kicker">${esc(C.kicker)}</div>
      <h2>${C.title}</h2><p style="margin:16px 0 22px">${esc(C.text)}</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap">${C.buttons.map(b => `<a class="btn" style="${BTN[b.style] || ''}" href="${b.href}">${b.icon ? ico(b.icon) : ''}${esc(b.label)}</a>`).join('')}</div></div>
      <div class="stats">${C.stats.map(([b, s]) => `<div><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join('')}</div></section></div>` : ''}
      <footer class="site-footer"><div class="wrap footer-grid">
        <div><a class="logo" href="${SITE.homeHref || HREF.home}"><b>${esc(SITE.logoMark)}</b>${esc(SITE.name)}</a><p>${esc(F.about)}</p></div>
        ${F.columns.map(c => `<div><h5>${esc(c.title)}</h5>${c.links.map(([l, h]) => `<a href="${h}">${esc(l)}</a>`).join('')}</div>`).join('\n        ')}
      </div><div class="wrap footer-bottom">${F.legal.map(x => `<span>${esc(x)}</span>`).join('')}</div></footer>`;
  }

  Object.assign(U, { header, bindHeader, updateHdrCounts, footer });
})();
