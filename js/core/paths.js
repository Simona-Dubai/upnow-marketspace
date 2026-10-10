/* Site paths. Load this first on every page.
   The site root is worked out from this file's own URL (…/js/core/paths.js), so pages work from any folder
   (/, /pages/) and when opened straight from disk. Every link and image URL is built from here. */
(function () {
  const self = document.currentScript && document.currentScript.src;
  const root = self ? self.replace(/js\/core\/paths\.js(\?.*)?$/, '') : '';
  const page = file => root + (file === 'index.html' ? '' : 'pages/') + file;
  window.PATHS = {
    root,
    href: {
      home: page('index.html'),
      search: page('search.html'),
      listing: page('listing.html'),
      provider: page('provider.html'),
      agency: page('agency.html'),
      join: page('join.html'),
      account: page('account.html'),
      listingNew: page('listing-new.html'),
      dashboard: page('provider-dashboard/index.html'),
      portfolio: page('provider-dashboard/portfolio.html'),
      admin: page('admin/index.html')
    },
    asset: p => root + 'assets/' + p,
    // accepts 'hero.jpg', 'img/hero.jpg', 'assets/images/hero.jpg' (older saved data) or an absolute URL
    img: p => /^(https?:|file:|data:|\/)/.test(p) ? p : root + 'assets/images/' + String(p).replace(/^(\.\.\/)*(assets\/images|img)\//, '')
  };
  // the signed-in account's provider application (js/pages/join.js), once it has been sent — null for a customer,
  // a draft, or nobody signed in. The one test for "is this a provider": the header, its account menu and the dashboard
  PATHS.providerApp = () => {
    try {
      const u = JSON.parse(localStorage.getItem('upnow.user') || 'null'), a = JSON.parse(localStorage.getItem('upnow.join') || 'null');
      if (!u || !a || (a.owner && a.owner !== (u.email || (u.dial || '') + u.phone))) return null;
      // a draft isn't a provider yet — unless the team sent it back and they're fixing it (pages/admin → a.review)
      return (a.status || (a.done ? 'submitted' : 'draft')) === 'draft' && !a.review ? null : a;
    } catch (e) { return null; }
  };
  // the provider dashboard is for providers: a customer (or nobody signed in) goes to "Become a provider" instead.
  // ?demo opens it with its sample business anyway (for showing it around)
  if (/\/provider-dashboard\//.test(location.pathname) && !/[?&]demo\b/.test(location.search) && !PATHS.providerApp()) {
    location.replace(PATHS.href.join);
  }
  // ?embed=1: the page runs inside the provider dashboard (pages/provider-dashboard/pw/embed.js), which keeps its own
  // sidebar and toolbar — so the page drops its header and footer and leaves leaving to the dashboard
  if (/[?&]embed=1\b/.test(location.search) && window.parent !== window) {
    PATHS.embed = true;
    document.documentElement.classList.add('is-embed');
    // join.css sizes the form card as 100dvh − 64px (the header) − --onboarding-free; with no header or footer line,
    // −22px gives back the header, keeps the grid's 18px top padding and leaves 24px under the card (as inbox, calendar)
    document.head.insertAdjacentHTML('beforeend', '<style>.is-embed .onboarding-top,.is-embed .onboarding-footer,.is-embed #hdr,.is-embed #ftr{display:none!important}.is-embed .onboarding-body{--onboarding-free:-22px}</style>');
  }
})();
