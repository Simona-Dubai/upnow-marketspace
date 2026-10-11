/* UpNow admin — data.
   What the team reviews is exactly what the provider flow produces:
     application  'upnow.join' (js/pages/join.js) — status draft → submitted → verified; docs[id] { name, state, ok },
                  d (every value read off the documents and the profile), src[k] 'doc' | 'check' | 'missing', more[] (business
                  types added later, each { v, cats, docs, status })
     listings     'upnow.listings@<account>' (js/marketplace/listing-form.js) — status draft · licence · verify · review
                  → live · changes · rejected, with reason and history
   This browser holds one real provider at most, so the queue is filled with sample providers; the real one is marked
   "This browser" and every decision on it is written back, so the provider's pages react (verified badge, listings go live).
   Charging: providers pay UpNow a monthly plan (customers never pay). PLANS below are placeholders until prices are set. */
(function () {
  const DAY = 864e5, NOW = Date.now();
  const read = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
  const PFX = (window.SITE && SITE.storageKey) || 'upnow';

  /* ---------- plans (AED / month) — edit in Settings ---------- */
  const PLANS0 = [
    { id: 'launch', n: 'Launch', p: 0, max: 5, c: '#9fb3a8', note: 'Getting started' },
    { id: 'basic', n: 'Basic', p: 299, max: 10, c: '#25946a', note: 'Owners and freelancers' },
    { id: 'pro', n: 'Pro', p: 799, max: 50, c: '#047246', note: 'Agencies, clinics, operators' },
    { id: 'business', n: 'Business', p: 1999, max: 500, c: '#0b3d2a', note: 'Large portfolios and multi-branch' }
  ];

  /* ---------- verticals and their regulators (UAE, as in onboarding) ---------- */
  const VL = { spaces: 'Spaces', services: 'Services', experiences: 'Experiences', memberships: 'Memberships', programs: 'Programs', health: 'Health', insurance: 'Protection' };
  const VI = { spaces: 'building', services: 'wrench', experiences: 'compass', memberships: 'badge', programs: 'grad', health: 'heart', insurance: 'shield' };
  const VC = { spaces: '#047246', services: '#256aa5', experiences: '#b7791f', memberships: '#7b5ea7', programs: '#1faa59', health: '#c2413b', insurance: '#46534c' };
  const catLabel = (v, c) => { try { const o = UP.VERTICALS[v].offers.find(x => x.id === c); return o ? o.label : c; } catch (e) { return c; } };

  /* documents: title · where the team checks it · the fields read off it ([key, label, 'date' for expiry]) */
  const f3 = (p, a = 'Licence no.') => [[p + 'No', a], [p + 'Auth', 'Issued by'], [p + 'Exp', 'Expiry date', 'date']];
  const DOCS = {
    tl: ['Trade licence', 'DET (Dubai Economy & Tourism) licence search', [['legal', 'Legal name'], ['trade', 'Trade name'], ['licence', 'Licence no.'], ['activity', 'Business activity'], ['authority', 'Issuing authority'], ['expiry', 'Expiry date', 'date']]],
    eid: ['Emirates ID', 'ICP — match the photo and name', [['fullName', 'Full name'], ['eidNo', 'ID number'], ['nationality', 'Nationality'], ['eidExp', 'Expiry date', 'date']]],
    passport: ['Passport', 'Photo page — name and number match the ID', [['passNo', 'Passport no.'], ['passCountry', 'Issuing country'], ['passExp', 'Expiry date', 'date']]],
    visa: ['UAE residence visa', 'ICP / GDRFA', [['visaNo', 'Visa / file no.'], ['visaSponsor', 'Sponsor'], ['visaExp', 'Expiry date', 'date']]],
    sig: ['Signatory Emirates ID', 'Name must be on the trade licence', [['sigName', 'Full name'], ['eidNo', 'ID number'], ['eidExp', 'Expiry date', 'date']]],
    sigPass: ['Signatory passport', 'Photo page', [['sigPassNo', 'Passport no.'], ['sigPassCountry', 'Issuing country'], ['sigPassExp', 'Expiry date', 'date']]],
    vat: ['Tax / VAT certificate', 'FTA TRN check', [['trn', 'Tax registration no. (TRN)']]],
    orn: ['RERA office registration (ORN)', 'Dubai Land Department — DLD / Dubai REST', [['ornNo', 'ORN'], ['ornExp', 'Expiry date', 'date']]],
    brn: ['RERA card (BRN)', 'Dubai Land Department — DLD / Dubai REST', [['brnNo', 'BRN'], ['brnOffice', 'Office (ORN)'], ['brnExp', 'Expiry date', 'date']]],
    hhIndiv: ['DET holiday home licence', 'Dubai Economy & Tourism', f3('hh')],
    hhCo: ['DET holiday homes operator licence', 'Dubai Economy & Tourism', f3('hh')],
    yacht: ['DMA commercial marine craft licence', 'Dubai Maritime Authority', f3('ya')],
    venue: ['Venue / event activity on licence', 'Dubai Economy & Tourism', f3('ve', 'Permit no.')],
    dsc: ['Dubai Sports Council approval', 'Dubai Sports Council', f3('ds', 'Approval no.')],
    reps: ['REPs UAE trainer registration', 'REPs UAE', f3('re', 'Registration no.')],
    fp: ['Freelance permit', 'DET e-Trader or free zone', f3('fp', 'Permit no.')],
    beauty: ['Dubai Municipality home-service permit', 'Dubai Municipality', f3('be', 'Permit no.')],
    guide: ['DET tour guide licence', 'Dubai Economy & Tourism', f3('tg')],
    tourOp: ['DET tourism licence (tour operator)', 'Dubai Economy & Tourism', f3('to')],
    safari: ['Desert safari permit + RTA vehicle permits', 'DET / RTA', f3('sa', 'Permit no.')],
    tutor: ['Private teacher work permit (MoHRE)', 'MoHRE', f3('tu', 'Permit no.')],
    khdaTrain: ['KHDA training institute permit', 'KHDA', f3('kh', 'Permit no.')],
    khdaEcc: ['KHDA early childhood centre permit', 'KHDA', f3('kh', 'Permit no.')],
    khdaSchool: ['KHDA school permit', 'KHDA', f3('kh', 'Permit no.')],
    hedu: ['MoHESR licence / CAA accreditation', 'MoHESR', f3('he')],
    dha: ['DHA health facility licence', 'DHA Sheryan', f3('dh')],
    cbIns: ['CBUAE insurance company licence', 'Central Bank of the UAE register', f3('cb')],
    cbBroker: ['CBUAE insurance intermediary registration', 'Central Bank of the UAE register', f3('cb', 'Registration no.')],
    cbAgent: ['CBUAE insurance agent registration', 'Central Bank of the UAE register', f3('cb', 'Registration no.')],
    agencyAgr: ['Agency agreement with the insurer', 'Names the insurer', [['agInsurer', 'Insurer'], ['agExp', 'Valid until', 'date']]]
  };
  const WHO = ['eid', 'passport', 'visa', 'sig', 'sigPass'];
  // categories that wait for their own licence (listing-form.js GATE) — the same rule decides "can they list this?"
  const GATE = { holiday: a => a.role === 'company' ? 'hhCo' : 'hhIndiv', yacht: () => 'yacht', venue: () => 'venue', safari: () => 'safari', gym: () => 'reps' };
  // photos needed to submit (listing-form.js minPhotos) and the description we expect
  const MIN_PHOTOS = { land: 3, court: 3, photography: 6, design: 6, makeup: 6, nursery: 5, school: 5, camp: 5 };
  const minPhotos = (v, c) => MIN_PHOTOS[c] != null ? MIN_PHOTOS[c] : ({ spaces: 5, experiences: 5 })[v] || 3;
  const LEASE = ['residential', 'commercial', 'industrial', 'land', 'mixed'];

  /* ---------- sample providers (deterministic) ---------- */
  let seed = 4242; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const pick = a => a[Math.floor(rnd() * a.length)], between = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const fmtD = t => new Date(t).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const IMG = { residential: ['apt1', 'apt2', 'apt3', 'apt4', 'villa1', 'villa3', 'loft1'], commercial: ['office1', 'office2', 'office3'], holiday: ['villa3', 'hotel1', 'hotel2'], venue: ['venue1', 'venue2'], court: ['padel1', 'padel2'], yacht: ['yacht1', 'yacht2'],
    cleaning: ['clean1', 'clean2'], ac: ['ac1', 'ac2'], haircut: ['salon1', 'salon2'], makeup: ['salon2', 'salon1'], photography: ['workshop2', 'loft1'], safari: ['desert1', 'desert2'], tour: ['desert2', 'desert1'], workshop: ['workshop1', 'workshop2'],
    nursery: ['school1', 'school2'], course: ['school2', 'school1'], academy: ['padel1', 'fit1'], gym: ['fit1', 'fit2'], dental: ['dental1', 'dental2'], doctor: ['dental2', 'dental1'], health: ['office2'], motor: ['office3'], property: ['office1'] };
  const img = c => (IMG[c] || ['office1']).map(x => '../provider-dashboard/img/' + x + '.jpg');
  // [name, role, v, business type, cats, docs, display]
  const PEOPLE = [
    ['Greenstone Properties L.L.C', 'company', 'spaces', 'Real estate brokerage', ['residential', 'commercial'], ['tl', 'orn', 'sig', 'vat']],
    ['Aisha Al Mansoori', 'individual', 'spaces', 'Owner / landlord', ['residential'], ['eid', 'passport', 'visa']],
    ['Marina Bay Holiday Homes', 'company', 'spaces', 'Holiday home operator', ['holiday'], ['tl', 'sig', 'hhCo', 'vat']],
    ['Rahul Menon', 'individual', 'spaces', 'Property manager', ['residential'], ['brn', 'eid', 'passport']],
    ['Sparkle Home Services L.L.C', 'company', 'services', 'Service company', ['cleaning'], ['tl', 'sig', 'vat']],
    ['CoolAir Technical Services', 'company', 'services', 'Service company', ['ac', 'handyman'], ['tl', 'sig']],
    ['Desert Rose Tourism L.L.C', 'company', 'experiences', 'Tour operator', ['safari'], ['tl', 'tourOp', 'sig', 'safari']],
    ['Little Stars Nursery', 'company', 'programs', 'Nursery', ['nursery'], ['tl', 'khdaEcc', 'sig']],
    ['Smile Dental Clinic', 'company', 'health', 'Clinic / medical centre', ['dental'], ['tl', 'dha', 'sig']],
    ['FitHub Gym & Studio', 'company', 'memberships', 'Gym / studio / club', ['gym'], ['tl', 'dsc', 'sig', 'reps']],
    ['Azure Yachts Charter', 'company', 'spaces', 'Yacht charter company', ['yacht'], ['tl', 'sig', 'yacht']],
    ['Palm Events Venue', 'company', 'spaces', 'Venue operator', ['venue'], ['tl', 'sig', 'venue']],
    ['Priya Nair', 'individual', 'services', 'Freelancer', ['photography'], ['fp', 'eid', 'passport']],
    ['Omar Haddad', 'individual', 'experiences', 'Licensed tour guide', ['tour'], ['guide', 'eid', 'passport']],
    ['Bright Minds Training Institute', 'company', 'programs', 'Training institute', ['course'], ['tl', 'khdaTrain', 'sig']],
    ['Shield Insurance Brokers', 'company', 'insurance', 'Insurance intermediary', ['motor', 'health'], ['tl', 'cbBroker', 'sig']],
    ['Urban Padel Club', 'company', 'spaces', 'Sports facility operator', ['court'], ['tl', 'sig', 'dsc']],
    ['Glow Beauty Salon', 'company', 'services', 'Salon / beauty studio', ['haircut', 'makeup'], ['tl', 'sig', 'beauty']],
    ['CarePlus Home Healthcare', 'company', 'health', 'Home healthcare provider', ['homecare'], ['tl', 'dha', 'sig']],
    ['Layla Saeed', 'individual', 'spaces', 'Owner / landlord', ['residential', 'holiday'], ['eid', 'passport']],
    ['Atlas Property Management', 'company', 'spaces', 'Property management company', ['residential'], ['tl', 'orn', 'sig']],
    ['James Carter', 'individual', 'programs', 'Private tutor', ['course'], ['tutor', 'eid', 'passport']],
    ['Lens & Light Studio', 'company', 'services', 'Studio / agency', ['photography'], ['tl', 'sig']],
    ['Maria Santos', 'individual', 'services', 'Freelancer', ['makeup'], ['fp', 'eid', 'passport']],
    ['Al Noor Real Estate Brokers', 'company', 'spaces', 'Real estate brokerage', ['residential', 'commercial'], ['tl', 'orn', 'sig', 'vat']],
    ['Yousef Darwish', 'individual', 'spaces', 'Owner / landlord', ['commercial'], ['eid', 'passport', 'visa']],
    ['Oasis Coaching Academy', 'company', 'programs', 'Sports academy', ['academy'], ['tl', 'dsc', 'sig']],
    ['Elena Petrova', 'individual', 'experiences', 'Workshop host / instructor', ['workshop'], ['fp', 'eid', 'passport']],
    ['Vista Diagnostics Centre', 'company', 'health', 'Clinic / medical centre', ['diagnostics'], ['tl', 'dha', 'sig']],
    ['Harbour Point Properties', 'company', 'spaces', 'Landlord company', ['commercial'], ['tl', 'sig', 'vat']],
    ['Noor Al Hashimi', 'individual', 'spaces', 'Owner / landlord', ['residential'], ['eid', 'passport']],
    ['Swift Fix Maintenance', 'company', 'services', 'Service company', ['handyman', 'ac'], ['tl', 'sig']],
    ['Sandstorm Adventures', 'company', 'experiences', 'Tour operator', ['safari', 'tour'], ['tl', 'tourOp', 'sig', 'safari']],
    ['PulseFit Club', 'company', 'memberships', 'Gym / studio / club', ['gym'], ['tl', 'dsc', 'sig']],
    ['Daniel Okafor', 'individual', 'spaces', 'Property manager', ['residential'], ['brn', 'eid', 'passport']],
    ['Gulf Cover Insurance Agency', 'company', 'insurance', 'Insurance agency', ['motor'], ['tl', 'cbAgent', 'agencyAgr', 'sig']],
    ['Vikram Shah', 'individual', 'services', 'Freelancer', ['design'], ['fp', 'eid', 'passport']],
    ['Mirage Event Halls', 'company', 'spaces', 'Venue operator', ['venue'], ['tl', 'sig', 'venue']],
    ['Sara Ibrahim', 'individual', 'programs', 'Freelance trainer', ['course'], ['fp', 'eid', 'passport']],
    ['Crescent Holiday Lets', 'company', 'spaces', 'Holiday home operator', ['holiday'], ['tl', 'sig', 'hhCo']],
    ['Hassan Ali', 'individual', 'spaces', 'Owner / landlord', ['residential'], ['eid', 'passport', 'visa']],
    ['TrueSmile Orthodontics', 'company', 'health', 'Clinic / medical centre', ['dental'], ['tl', 'dha', 'sig']]
  ];
  const SIGS = ['Khalid Rahman', 'Ahmed Karim', 'Fatima Khan', 'Sameer Joshi', 'Reem Al Falasi', 'Tom Walker', 'Nadia Aziz', 'Rashid Al Suwaidi'];
  const AREAS_S = ['dubai-marina', 'downtown', 'business-bay', 'jvc', 'jlt', 'palm-jumeirah', 'al-barsha', 'deira', 'al-quoz', 'dubai-hills'];
  const areaN = id => { try { return UP.areaName(id); } catch (e) { return id; } };
  const TITLES = {
    residential: [b => `2 Bed apartment · ${b}`, b => `Studio with balcony · ${b}`, b => `3 Bed villa · ${b}`, b => `1 Bed, fully furnished · ${b}`],
    commercial: [b => `Fitted office, 1,450 sqft · ${b}`, b => `Retail unit on main road · ${b}`], holiday: [b => `Sea-view holiday home · ${b}`, b => `Family villa with pool · ${b}`],
    venue: [() => 'Ballroom for 300 guests', () => 'Rooftop terrace for events'], court: [() => 'Indoor padel court', () => 'Outdoor padel court with lights'], yacht: [() => '62 ft yacht for 20 guests', () => '44 ft sunset cruise yacht'],
    cleaning: [() => 'Home deep cleaning', () => 'Weekly maid service (4 hrs)'], ac: [() => 'AC service & duct cleaning', () => 'AC repair, same-day'], handyman: [() => 'Handyman by the hour'],
    haircut: [() => 'Women’s haircut & blow-dry'], makeup: [() => 'Bridal make-up at home', () => 'Party make-up'], photography: [() => 'Family photo shoot (1 hr)', () => 'Property photography'], design: [() => 'Logo & brand design'],
    safari: [() => 'Evening desert safari with BBQ', () => 'Morning dune bashing'], tour: [() => 'Old Dubai walking tour'], workshop: [() => 'Pottery workshop for beginners'],
    nursery: [() => 'Full-day nursery (FS1)'], course: [() => 'IELTS preparation course', () => 'Maths tutoring, grades 6–10'], academy: [() => 'Junior football academy'], gym: [() => 'Monthly gym membership', () => 'Annual membership with classes'],
    dental: [() => 'Teeth cleaning & check-up', () => 'Clear aligners consultation'], diagnostics: [() => 'Full body check-up'], homecare: [() => 'Nurse at home (8 hrs)'], motor: [() => 'Comprehensive car insurance'], health: [() => 'Family health plan']
  };
  const PRICE = { residential: [55000, 180000, 'year'], commercial: [90000, 400000, 'year'], holiday: [650, 2400, 'night'], venue: [9000, 45000, 'event'], court: [180, 380, 'hour'], yacht: [900, 2600, 'hour'],
    cleaning: [180, 520, 'visit'], ac: [150, 450, 'visit'], handyman: [90, 180, 'hour'], haircut: [120, 320, 'visit'], makeup: [450, 2500, 'session'], photography: [600, 2200, 'session'], design: [1500, 6000, 'project'],
    safari: [180, 450, 'person'], tour: [120, 300, 'person'], workshop: [150, 380, 'person'], nursery: [3200, 6500, 'month'], course: [1200, 4800, 'course'], academy: [600, 1400, 'month'], gym: [250, 650, 'month'],
    dental: [250, 900, 'visit'], diagnostics: [700, 2400, 'package'], homecare: [450, 900, 'shift'], motor: [1100, 3800, 'year'], health: [4200, 14000, 'year'] };

  function sample() {
    seed = 4242;
    const apps = [], lst = [];
    PEOPLE.forEach((p, i) => {
      const [name, role, v, type, cats, docIds] = p, id = 'A' + (2101 + i);
      // newest last: the last few are still waiting; older ones were decided
      const age = i < 34 ? between(3, 58) * DAY + between(0, 20) * 36e5 : between(1, 46) * 36e5;
      const t = NOW - age;
      const person = role === 'individual' ? name : pick(SIGS);
      const d = { fullName: role === 'individual' ? name : '', sigName: role === 'company' ? person : '', legal: role === 'company' ? name : '', trade: role === 'company' ? name.replace(/ L\.L\.C$/, '') : '',
        licence: String(between(1000000, 1299999)), activity: ({ holiday: 'Holiday homes rental', venue: 'Events venue & hospitality', court: 'Sports facility management', yacht: 'Yacht chartering', cleaning: 'Building cleaning services', ac: 'Air-conditioning maintenance', haircut: 'Ladies beauty salon', photography: 'Photography services', safari: 'Tour operator', nursery: 'Nursery', course: 'Training institute', academy: 'Sports academy', gym: 'Fitness centre', dental: 'Dental clinic', homecare: 'Home healthcare', diagnostics: 'Diagnostic centre', motor: 'Insurance brokerage' })[cats[0]] || { spaces: 'Leasing & management of real estate', services: 'Maintenance services', experiences: 'Tourism activities', programs: 'Training & education', health: 'Healthcare facility', memberships: 'Fitness centre', insurance: 'Insurance brokerage' }[v],
        authority: 'Department of Economy & Tourism', eidNo: '784-19' + between(70, 99) + '-' + between(1000000, 9999999) + '-' + between(1, 9), nationality: pick(['United Arab Emirates', 'India', 'United Kingdom', 'Egypt', 'Philippines', 'Pakistan', 'Jordan']),
        passNo: pick(['N', 'P', 'K', 'Z']) + between(1000000, 9999999), passCountry: pick(['United Kingdom', 'India', 'Egypt', 'Jordan', 'Philippines']), display: role === 'company' ? name.replace(/ L\.L\.C$/, '') : name,
        langs: pick([['English', 'Arabic'], ['English', 'Hindi'], ['English'], ['English', 'Arabic', 'Urdu'], ['English', 'Russian']]), trn: '1002' + between(10000000000, 99999999999) };
      const docs = {}, src = {};
      docIds.forEach((k, j) => {
        const D = DOCS[k]; docs[k] = { name: k + '-' + name.split(' ')[0].toLowerCase() + '.pdf', size: between(180, 2400) * 1000, state: 'read', ok: true };
        D[2].forEach(([fk, , ty]) => {
          if (ty === 'date') {
            // a few documents run out soon, one has already expired
            const r = rnd(), exp = i === 37 && j === 0 ? NOW - 9 * DAY : r < .05 ? NOW + between(6, 50) * DAY : NOW + between(120, 1100) * DAY;
            d[fk] = fmtD(exp);
          } else if (d[fk] == null) d[fk] = /No$/.test(fk) ? String(between(10000, 99999)) : /Auth$/.test(fk) ? D[1].split(' — ')[0] : '';
          if (rnd() < .07) src[fk] = 'check';
        });
      });
      if (d.brnNo) d.brnOffice = 'ORN ' + between(10000, 29999);
      // one company whose signatory isn't the name we'd expect (manual check), one application missing a required document
      if (i === 40) d.sigName = 'H. Ali';
      if (i === 36) delete docs[docIds[0]];
      let status = 'submitted', decided = null, reason = '';
      if (i < 34) {
        const r = rnd();
        status = r < .74 ? 'verified' : r < .86 ? 'changes' : 'rejected';
        decided = t + between(2, 30) * 36e5;
        reason = status === 'changes' ? pick(['The trade licence photo is cut off — upload the full page.', 'The passport has expired — upload the new one.', 'Your licence activity doesn’t cover property management — upload the updated licence.'])
          : status === 'rejected' ? pick(['We couldn’t confirm the licence with the issuing authority.', 'The name on the ID doesn’t match the licence signatory.']) : '';
      }
      const plan = status !== 'verified' ? '' : role === 'individual' ? pick(['launch', 'basic', 'basic', 'launch']) : pick(['pro', 'pro', 'basic', 'business', 'launch', 'pro']);
      apps.push({ id, sample: true, req: role === 'individual' ? ['launch', 'basic'][i % 2] : ['pro', 'basic', 'business', 'pro', 'launch'][i % 5], name, role, v, type, cats, docs, need: docIds.filter(k => !['vat', 'visa', 'sigPass'].includes(k)), d, src, t, status, decided, reason, plan, phone: '+971 5' + between(0, 8) + ' ' + between(100, 999) + ' ' + between(1000, 9999),
        email: name.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '') + '@' + (role === 'company' ? name.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '') + '.ae' : 'gmail.com'), size: role === 'company' ? pick(['1–5', '6–20', '21–100']) : pick(['1', '2–3']), more: [] });
      // their listings: the first one came with the application
      const n = status === 'verified' ? between(1, 4) : status === 'submitted' ? 1 : between(0, 1);
      for (let k = 0; k < n; k++) {
        const cat = k === 2 && i === 19 ? 'holiday' : pick(cats), [lo, hi, basis] = PRICE[cat] || [200, 900, 'visit'];
        const area = pick(AREAS_S), bld = pick(['Marina Gate', 'Bay Square', 'Park Heights', 'The Lofts', 'Cluster T', 'Al Badia', 'Emaar Square']);
        const created = Math.max(t + 36e5, (decided || t) + between(0, 12) * DAY), photos = between(minPhotos(v, cat) - (rnd() < .12 ? 2 : 0), 12);
        let st = status === 'submitted' ? 'verify' : status !== 'verified' ? 'verify' : 'live', ldec = null, lreason = '';
        if (status === 'verified') {
          const r = rnd();
          if (created > NOW - 2 * DAY || r < .1) st = 'review';
          else if (r < .16) { st = 'changes'; lreason = pick(['Photo 1 looks like a stock image — use a real photo.', 'Add the DLD permit number for this unit.', 'The price looks off — please check it.']); }
          else if (r < .18) { st = 'rejected'; lreason = 'We couldn’t match this listing to your licence.'; }
          if (st !== 'review') ldec = created + between(2, 30) * 36e5;
        }
        // a listing in review was sent in the last day or so — the team keeps up
        const ts = st === 'review' ? NOW - between(1, 26) * 36e5 : Math.min(created, NOW - 36e5);
        let price = between(lo, hi); if (rnd() < .06) price = Math.round(price / 9); // a typo-like price to catch
        let title = (pick(TITLES[cat] || [() => catLabel(v, cat)]))(bld + ', ' + areaN(area));
        if (lst.some(o => o.app === id && o.title === title)) title += ' · ' + areaN(area); // a second branch, not a copy
        lst.push({ id: id + '-L' + (k + 1), app: id, sample: true, v, cat, title, loc: area, building: LEASE.includes(cat) ? bld : '',
          price, basis, photos, img: img(cat), desc: rnd() < .1 ? 'Call for details.' : 'Bright, well kept and ready now. ' + 'Close to the metro, shops and schools, with parking and 24-hour security. '.repeat(between(1, 3)),
          permit: LEASE.includes(cat) ? (rnd() < .12 ? '' : '71' + between(10000000, 99999999)) : cat === 'holiday' ? 'DXB-' + between(100000, 999999) : '', t: ts, status: st, decided: ldec, reason: lreason,
          views: st === 'live' ? between(120, 3400) : 0, leads: st === 'live' ? between(2, 60) : 0 });
      }
    });
    return { apps, lst };
  }

  /* ---------- the real provider in this browser ---------- */
  const userOf = () => read(PFX + '.user');
  function realApp() {
    // a draft isn't an application — unless the team sent it back and the provider is fixing it
    const a = read(PFX + '.join'); if (!a || !a.status || (a.status === 'draft' && !a.review)) return null;
    const owner = a.owner || '', d = a.d || {};
    const docs = {}; Object.entries(a.docs || {}).forEach(([k, f]) => { if (f) docs[k] = f; });
    const name = (a.role === 'company' ? d.legal || d.trade : d.fullName) || a.name || 'New provider';
    const T = a.sent || (read(PFX + '.admin.seen') || {})[owner] || NOW - 2 * 36e5;
    const st = a.status === 'verified' || a.status === 'approved' ? 'verified' : a.review && a.review.st ? a.review.st : 'submitted';
    const out = [{ id: 'REAL', real: true, req: a.plan || '', owner, name, role: a.role || 'individual', v: a.v, type: a.sub || '', cats: a.cats || [], docs, d, src: a.src || {}, t: T, status: st,
      decided: a.review ? a.review.t : null, reason: a.review ? a.review.reason || '' : '', plan: a.review ? a.review.plan || '' : '', phone: (a.dial || '+971') + ' ' + (a.phone || ''), email: a.email || '', size: '', later: a.later || {}, more: a.more || [],
      // sent again after changes: the team's earlier note; fixing: they're changing it right now
      prev: (a.reviews || []).slice(-1)[0] || null, fixing: a.status === 'draft' }];
    // a business type added after joining is its own request
    (a.more || []).forEach((m, i) => out.push({ id: 'REAL+' + i, real: true, moreOf: i, owner, name, role: a.role || 'individual', v: m.v, type: m.sub || '', cats: m.cats || [], docs: Object.assign({}, docs, m.docs || {}), d: Object.assign({}, d, m.d || {}), src: a.src || {},
      t: m.t || T, status: m.status === 'approved' ? 'verified' : m.review && m.review.st ? m.review.st : 'submitted', decided: m.review ? m.review.t : null, reason: m.review ? m.review.reason || '' : '', plan: '', phone: (a.dial || '+971') + ' ' + (a.phone || ''), email: a.email || '', added: true, more: [] }));
    return out;
  }
  // the first time admin sees the real application, remember when (the record has no "sent at" time)
  function stampSeen(owner) { const s = read(PFX + '.admin.seen') || {}; if (!s[owner]) { s[owner] = NOW; write(PFX + '.admin.seen', s); } }
  function realListings(owner) {
    if (!owner) return [];
    const db = read(PFX + '.listings@' + owner); if (!db) return [];
    return (db.items || []).filter(L => L.status !== 'draft').map(L => ({ id: 'REAL-' + L.id, rid: L.id, app: 'REAL', real: true, v: L.v, cat: L.cat, title: L.title || 'Untitled ' + catLabel(L.v, L.cat).toLowerCase(),
      loc: L.loc || (L.areas || [])[0] || '', building: L.building || '', price: +L.price || 0, basis: (L.a && (L.a.term || L.a.billing)) || '', photos: (L.img || []).length, img: L.img && L.img.length ? L.img : img(L.cat), desc: L.desc || '',
      permit: L.permit || '', t: L.updated || L.created || NOW, status: L.status, decided: null, reason: L.reason || '', views: 0, leads: 0, raw: L }));
  }
  // write a decision back where the provider's pages read it
  function decideListing(rid, owner, st, reason) {
    const k = PFX + '.listings@' + owner, db = read(k); if (!db) return false;
    const L = (db.items || []).find(x => x.id === rid); if (!L) return false;
    L.status = st; L.reason = reason || ''; L.updated = Date.now(); (L.history = L.history || []).push({ t: Date.now(), st, by: 'UpNow team' });
    return write(k, db);
  }
  function decideApp(x, st, reason, plan) {
    const a = read(PFX + '.join'); if (!a) return false;
    const rev = { st, reason: reason || '', t: Date.now(), plan: plan || '', by: 'UpNow team' };
    if (x.moreOf != null) { const m = (a.more || [])[x.moreOf]; if (!m) return false; m.review = rev; if (st === 'verified') m.status = 'approved'; }
    else { a.review = rev; if (st === 'verified') a.status = 'verified'; }
    write(PFX + '.join', a);
    // approved: their listings waiting for verification move on — to review, or to their category licence first
    if (st === 'verified' && x.owner) {
      const k = PFX + '.listings@' + x.owner, db = read(k) || { items: [] };
      if (x.moreOf == null) db.verified = true;
      const docsAll = [a.docs || {}, ...(a.more || []).map(t => t.docs || {})];
      (db.items || []).forEach(L => {
        if (L.status !== 'verify' || (x.moreOf != null && L.v !== x.v)) return;
        const g = GATE[L.cat], need = g && g(a), has = need && docsAll.some(D => D[need] && D[need].state === 'read' && D[need].ok);
        L.status = need && !has ? 'licence' : 'review'; L.updated = Date.now(); (L.history = L.history || []).push({ t: Date.now(), st: L.status });
      });
      write(k, db);
    }
    return true;
  }

  window.ADM_DATA = { DAY, NOW, PLANS0, VL, VI, VC, DOCS, WHO, GATE, LEASE, minPhotos, catLabel, areaN, sample, realApp, realListings, stampSeen, decideListing, decideApp, userOf, read, write, PFX };
})();
