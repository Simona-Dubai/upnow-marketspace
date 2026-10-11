/* UpNow site content and settings: brand, header, footer, currencies, languages and translations.
   Everything brand-specific the shared components show comes from here.
   Load after data/listings.js — the navigation and footer read the marketplace categories. */
(function () {
  const { VERTICALS, areaName } = UP;
  const HREF = PATHS.href;
  const search = qs => HREF.search + qs;

  window.SITE = {
    name: 'UpNow',
    logoMark: 'U',
    storageKey: 'upnow',            // prefix for everything kept in localStorage
    // the provider plans: who each is for and what it includes — one list for onboarding (js/pages/join.js) and the
    // provider dashboard (Settings › Plan & billing, pages/provider-dashboard/pw/os.js); prices and limits are the admin's
    planFor: { launch: 'Getting started', basic: 'Owners and freelancers', pro: 'Agencies, clinics, operators', business: 'Large portfolios and multi-branch' },
    planIncl: {
      launch: ['Leads by call, WhatsApp, SMS and email from your listings', 'Verified badge on your profile and listings', 'Leads, calendar and messages in one place', 'Views and leads for each listing'],
      basic: ['Connect your WhatsApp Business and email inbox', 'Enquiry form for your own website', 'Up to 3 team members', 'Reply templates for WhatsApp and email', 'Weekly performance report by email'],
      pro: ['Leads from Bayut, Property Finder, Dubizzle, Instagram and Facebook', 'A tracked phone number for each listing', 'Up to 15 team members, with roles', 'New leads shared out to your team automatically', 'Demand: what customers search for in your areas', '2 featured listings (Boost) a month'],
      business: ['Several branches and legal entities', 'Unlimited team members', 'Upload many listings at once', '10 featured listings (Boost) a month', 'A named UpNow account manager']
    },
    chat: false,                    // in-app chat and the account's Messages are on hold — true brings both back
    // the one mobile number for the UpNow team: signing in with it (normal sign-in, any 6-digit code in the prototype)
    // opens the admin dashboard (pages/admin/) instead of a customer account
    admin: { dial: '+971', phone: '500000001' },

    /* display currencies: code → [rate from base, label, flag]; prices are stored in the first one (AED) */
    currencies: { AED: [1, 'AED', '🇦🇪'], USD: [.2723, 'USD', '🇺🇸'], EUR: [.2512, 'EUR', '🇪🇺'], GBP: [.2105, 'GBP', '🇬🇧'], SAR: [1.021, 'SAR', '🇸🇦'], OMR: [.1048, 'OMR', '🇴🇲'], QAR: [.991, 'QAR', '🇶🇦'], INR: [22.7, 'INR', '🇮🇳'] },
    languages: [['en', 'EN'], ['ar', 'عربي']],
    rtl: ['ar'],
    i18n: {
      ar: {
        'Rent': 'إيجار', 'Residential': 'سكني', 'Commercial': 'تجاري', 'Industrial': 'صناعي', 'Land': 'أراضٍ', 'Mixed-use': 'متعدد الاستخدامات', 'Holiday homes': 'بيوت العطلات', 'Venues': 'قاعات', 'Sports courts': 'ملاعب', 'Yachts': 'يخوت',
        'Saved': 'المحفوظات', 'Enquiries': 'استفساراتي', 'Sign in': 'تسجيل الدخول', 'Become a provider': 'انضم كمزوّد', 'Search': 'بحث', 'Location': 'الموقع', 'More filters': 'فلاتر إضافية', 'All filters': 'كل الفلاتر',
        'Call': 'اتصال', 'WhatsApp': 'واتساب', 'Save search': 'حفظ البحث', 'See all': 'عرض الكل', 'Popular areas': 'مناطق شائعة', 'How UpNow works': 'كيف يعمل أب ناو', 'Verified': 'موثّق', 'Featured': 'مميّز',
        'Explore spaces': 'استكشف المساحات', 'Recently viewed': 'شوهدت مؤخرًا', 'results': 'نتيجة', 'Grid': 'شبكة', 'Map': 'خريطة'
      }
    },

    header: {
      // first `visible` items show in the bar, the rest go under "More" (with icon + one-line description)
      nav: [['spaces', 'Find a Space'], ['services', 'Book a Service'], ['experiences', 'Experiences'], ['memberships', 'Memberships'], ['programs', 'Programs'], ['health', 'Health'], ['insurance', 'Protection']]
        .map(([id, label]) => ({ id, label, href: search('?v=' + id), icon: VERTICALS[id].icon, blurb: VERTICALS[id].blurb })),
      visible: 3,
      currency: true, language: true,   // currency + language selects
      saved: true, enquiries: true,     // icon buttons with counters (need js/marketplace/state.js)
      signIn: true,
      cta: { label: 'Become a provider', icon: 'brief', href: HREF.join }
    },

    /* "Can't find it?" card on the search results: the team shortlists options on WhatsApp.
       whatsapp: the team's number in international format without + (e.g. '9715XXXXXXXX'); empty = the button only confirms. */
    concierge: {
      whatsapp: '',
      title: "Can't find it?",
      text: "Our team will shortlist options for you on WhatsApp.",
      label: 'Chat with UpNow'
    },

    footer: {
      cta: {
        id: 'provider-cta', kicker: 'FOR OWNERS, AGENTS & OPERATORS', title: 'List your space.<br>Get leads in 42 minutes.',
        text: 'Homes, offices, warehouses, plots, holiday homes, venues, courts and yachts — customers reach you directly by call, WhatsApp or request. Manage every lead in the UpNow provider workspace.',
        buttons: [{ label: 'Become a provider', icon: 'brief', href: HREF.join, style: 'light' }, { label: 'See how leads arrive', href: HREF.join, style: 'outline' }],
        stats: [['12,000+', 'active listings'], ['850+', 'verified providers'], ['42 min', 'avg. first reply'], [String(VERTICALS.spaces.offers.length), 'kinds of space']]
      },
      about: 'Find verified spaces across Dubai and talk to the owner, agent or operator directly.',
      columns: [
        { title: 'Spaces', links: VERTICALS.spaces.offers.map(o => [o.label, search('?v=spaces&o=' + o.id)]) },
        { title: 'Popular areas', links: ['dubai-marina', 'downtown', 'business-bay', 'jvc', 'al-quoz', 'palm-jumeirah', 'dip'].map(a => [areaName(a), search('?v=spaces&o=' + (['al-quoz', 'dip'].includes(a) ? 'industrial' : 'residential') + '&loc=' + a)]) },
        { title: 'UpNow', links: [['About', '#'], ['Help centre', '#'], ['Report a listing', '#'], ['Provider information', HREF.join], ['Terms', '#'], ['Privacy', '#']] }
      ],
      legal: ['© 2026 UpNow Technologies FZ-LLC · Dubai, UAE', 'Listings show DLD, DTCM or trade-licence numbers where applicable.']
    }
  };
})();
