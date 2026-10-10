/* UpNow — Vertical → Offering → (search fields, price basis, filters, lead action, next steps).
   Every offering declares its own filter defs; the search bar, pills, drawer, matching engine,
   listing facts and mock data generator all read from the same declarations. */
(function () {
  let seed = 23;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const pick = a => a[Math.floor(rnd() * a.length)];
  const pickN = (a, n) => { const c = [...a], o = []; while (o.length < n && c.length) o.push(c.splice(Math.floor(rnd() * c.length), 1)[0]); return o; };
  const between = (a, b, step = 1) => Math.round((a + rnd() * (b - a)) / step) * step;
  const chance = p => rnd() < p;

  const AREAS = [
    { id: 'dubai-marina', n: 'Dubai Marina', x: 16, y: 64 }, { id: 'jbr', n: 'JBR', x: 10, y: 58 }, { id: 'jlt', n: 'JLT', x: 22, y: 74 },
    { id: 'palm-jumeirah', n: 'Palm Jumeirah', x: 18, y: 36 }, { id: 'al-barsha', n: 'Al Barsha', x: 34, y: 60 }, { id: 'jvc', n: 'JVC', x: 32, y: 84 },
    { id: 'dubai-hills', n: 'Dubai Hills', x: 46, y: 70 }, { id: 'arabian-ranches', n: 'Arabian Ranches', x: 48, y: 90 }, { id: 'al-quoz', n: 'Al Quoz', x: 46, y: 50 },
    { id: 'business-bay', n: 'Business Bay', x: 62, y: 46 }, { id: 'downtown', n: 'Downtown Dubai', x: 60, y: 38 }, { id: 'difc', n: 'DIFC', x: 66, y: 32 },
    { id: 'jumeirah', n: 'Jumeirah', x: 50, y: 24 }, { id: 'creek-harbour', n: 'Dubai Creek Harbour', x: 76, y: 34 }, { id: 'deira', n: 'Deira', x: 82, y: 18 },
    { id: 'mirdif', n: 'Mirdif', x: 92, y: 42 }, { id: 'silicon-oasis', n: 'Dubai Silicon Oasis', x: 86, y: 70 }
  ];
  const areaById = Object.fromEntries(AREAS.map(a => [a.id, a]));
  const areaName = id => (areaById[id] || {}).n || id;
  const BLD = {
    'dubai-marina': ['Marina Gate', 'Cayan Tower', 'Sparkle Towers'], jbr: ['Rimal 3', 'Sadaf 5'], jlt: ['Cluster D', 'Lake Terrace'], 'palm-jumeirah': ['Shoreline', 'Oceana', 'Tiara Residences'],
    'al-barsha': ['Grand Horizon'], jvc: ['Belgravia', 'Bloom Towers'], 'dubai-hills': ['Park Heights', 'Golf Place', 'Sidra'], 'arabian-ranches': ['Mirador', 'Saheel'], 'al-quoz': ['Al Khail Gate'],
    'business-bay': ['Executive Towers', 'Paramount'], downtown: ['Burj Vista', 'Boulevard Point', 'Act One'], difc: ['Index Tower', 'Sky Gardens'], jumeirah: ['City Walk', 'La Mer'],
    'creek-harbour': ['Creek Rise', 'Harbour Views'], deira: ['Al Rigga'], mirdif: ['Uptown Mirdif'], 'silicon-oasis': ['Binghatti Stars']
  };
  const MARINAS = ['dubai-marina', 'dubai-marina', 'palm-jumeirah', 'jbr', 'creek-harbour'];
  const phone = () => '+9715' + pick(['0', '2', '5', '6', '8']) + between(1000000, 9999999);
  const PEOPLE = ['Tariq Hassan', 'Aisha Khan', 'Omar Nasser', 'Priya Sharma', 'Daniel Petrov', 'Fatima Al Mansoori', 'Rahul Mehta', 'Layla Haddad', 'Marco Rossi', 'Sara Farouk'];

  /* ---------- def builders ---------- */
  const o = arr => arr.map(x => Array.isArray(x) ? { v: String(x[0]), l: x[1] } : { v: String(x), l: String(x) });
  const sel = (id, label, opts, x = {}) => ({ id, type: 'select', label, options: o(opts), ...x });
  const mul = (id, label, opts, x = {}) => ({ id, type: 'multi', label, options: o(opts), ...x });
  const tog = (id, label, x = {}) => ({ id, type: 'toggle', label, ...x });
  const date = (id, label, x = {}) => ({ id, type: 'date', label, field: 'avail', ...x });
  const gte = (id, label, opts, gen, x = {}) => sel(id, label, opts, { test: (lv, v) => lv >= +v, gen, ...x });
  const lte = (id, label, opts, gen, x = {}) => sel(id, label, opts, { test: (lv, v) => lv <= +v, gen, ...x });
  const price = (label, presets) => ({ id: 'price', type: 'range', label, unit: 'AED', presets: typeof presets === 'function' ? presets : () => presets });
  const rating = () => sel('rating', 'Rating', [['4.5', '4.5★ & up'], ['4', '4★ & up']], { get: l => l.rating, test: (lv, v) => lv >= +v, nogen: 1 });
  const TIME = [['morning', 'Morning'], ['afternoon', 'Afternoon'], ['evening', 'Evening']];
  const LANGS = ['English', 'Arabic', 'Hindi', 'Russian', 'French'];
  const lab = (def, v) => ((def.options || []).find(x => x.v === String(v)) || {}).l || v;

  /* ---------- VERTICALS & OFFERINGS ---------- */
  const V = {};

  V.spaces = { id: 'spaces', label: 'Spaces', icon: 'building', blurb: 'Homes, holiday stays, venues, courts and yachts.', offers: [
    { id: 'apartment', label: 'Apartment', h1: 'Apartments for rent', basis: 'AED / year or month', img: ['img/apt1.jpg', 'img/apt2.jpg', 'img/apt3.jpg', 'img/apt4.jpg', 'img/loft1.jpg'], n: 16,
      action: 'Request a viewing', flow: ['Enquiry', 'Viewing', 'Application', 'Contract', 'Handover'], people: 1, org: ['Skyline Realty', 'Palmview Properties', 'Harbour & Co.', 'Private owner'],
      fields: ['loc', 'term', 'beds', 'price'], defaults: { term: 'yearly' },
      defs: [
        { id: 'term', type: 'seg', label: 'Lease term', options: o([['yearly', 'Yearly'], ['monthly', 'Monthly']]), required: 1, gen: () => chance(.4) ? ['yearly', 'monthly'] : ['yearly'], field: 'terms' },
        sel('beds', 'Bedrooms', [[0, 'Studio'], [1, '1 Bed'], [2, '2 Beds'], [3, '3 Beds'], [4, '4+ Beds']], { multi: 1, gen: () => pick([0, 1, 1, 2, 2, 2, 3, 4]), test: (lv, v) => v.some(x => +x === 4 ? lv >= 4 : lv === +x), type: 'multi' }),
        price('Budget', S => S.f.term === 'monthly' ? [[null, 8000], [8000, 15000], [15000, null]] : [[null, 80000], [80000, 150000], [150000, 250000], [250000, null]]),
        sel('ptype', 'Property type', [['apartment', 'Apartment'], ['penthouse', 'Penthouse'], ['duplex', 'Duplex'], ['hotel-apt', 'Hotel apartment']], { gen: () => pick(['apartment', 'apartment', 'apartment', 'penthouse', 'duplex', 'hotel-apt']) }),
        sel('furnishing', 'Furnished', [['furnished', 'Furnished'], ['semi', 'Semi-furnished'], ['unfurnished', 'Unfurnished']]),
        date('movein', 'Move-in date'),
        mul('amenities', 'Amenities', ['Balcony', 'Pool', 'Gym', 'Covered parking', 'Sea view', 'Pets allowed', "Maid's room", 'Chiller free'], { all: 1, k: 5 }),
        lte('deposit', 'Deposit', [['5', '5% or less'], ['10', '10% or less']], () => pick([5, 5, 10, 10, 15]), { fmt: v => v + '% of annual rent' }),
        tog('verified', 'RERA-verified only', { p: .8 })
      ],
      post: (a, c) => { a.baths = Math.max(1, Math.min(a.beds + (chance(.5) ? 1 : 0), 5)); a.sqft = a.beds === 0 ? between(400, 560, 10) : between(700, 950, 10) * a.beds; },
      price: a => Math.round(([52000, 85000, 130000, 190000, 280000][Math.min(a.beds, 4)] * (a.ptype === 'penthouse' ? 1.9 : 1) * (0.8 + rnd() * 0.5)) / 1000) * 1000,
      priceOf: (l, S) => S && S.f.term === 'monthly' ? Math.round(l.price * 1.3 / 12 / 100) * 100 : l.price,
      unit: (l, S) => S && S.f.term === 'monthly' ? '/month' : '/year',
      title: (a, c) => `${a.beds === 0 ? 'Studio' : a.beds + '-Bed'} ${lab(c.def('ptype'), a.ptype)} ${a.amenities.includes('Sea view') ? 'with Sea View' : a.furnishing === 'furnished' ? '· Fully Furnished' : a.amenities.includes('Pool') ? 'with Pool Access' : '· Ready to Move'}`,
      meta: a => [['bed', a.beds === 0 ? 'Studio' : a.beds + ' Beds'], ['bath', a.baths + ' Baths'], ['area', a.sqft.toLocaleString() + ' sqft']],
      h1fn: S => Array.isArray(S.f.beds) && S.f.beds.length === 1 ? (S.f.beds[0] === '0' ? 'Studio apartments for rent' : S.f.beds[0] + '-bedroom apartments for rent') : null },

    { id: 'holiday', label: 'Holiday stay', h1: 'Holiday stays', basis: 'AED / night', img: ['img/hotel1.jpg', 'img/hotel2.jpg', 'img/apt2.jpg', 'img/villa1.jpg'], n: 10,
      action: 'Check availability', flow: ['Enquiry', 'Reservation', 'Payment to host', 'Check-in', 'Review'], org: ['Silkhaus', 'Frank Porter', 'Nomad Homes', 'Private host'],
      fields: ['loc', 'checkin', 'checkout', 'guests'], locLabel: 'Destination',
      defs: [
        date('checkin', 'Check-in'), date('checkout', 'Check-out', { noMatch: 1 }),
        gte('guests', 'Guests', [['2', '1–2 guests'], ['4', '3–4 guests'], ['6', '5–6 guests'], ['8', '7+ guests']], () => pick([2, 4, 4, 6, 8, 10]), { field: 'maxGuests', fmt: v => 'Up to ' + v }),
        sel('ptype', 'Property type', [['apartment', 'Apartment'], ['studio', 'Studio'], ['villa', 'Villa'], ['penthouse', 'Penthouse']]),
        sel('beds', 'Bedrooms', [['0', 'Studio'], ['1', '1'], ['2', '2'], ['3', '3+']], { gen: a => a.ptype === 'studio' ? '0' : a.ptype === 'villa' ? '3' : pick(['1', '1', '2', '3']) }),
        mul('amenities', 'Amenities', ['Pool', 'Beach access', 'Fast Wi-Fi', 'Full kitchen', 'Free parking', 'Sea view', 'Self check-in'], { all: 1, k: 5 }),
        sel('cancellation', 'Cancellation', [['free', 'Free cancellation'], ['moderate', 'Moderate'], ['strict', 'Strict']]),
        rating(), price('Price per night', [[null, 400], [400, 800], [800, null]]), tog('verified', 'Verified hosts only', { p: .8 })
      ],
      price: a => between(260, 480, 10) * (a.ptype === 'villa' ? 3 : a.ptype === 'penthouse' ? 2.2 : 1) * (+a.beds || 1) / (+a.beds > 1 ? 1.4 : 1),
      unit: () => '/night',
      title: (a, c) => `${pick(['Cosy', 'Stylish', 'Bright', 'Luxury', 'Designer'])} ${lab(c.def('ptype'), a.ptype)} ${a.amenities.includes('Sea view') ? 'with Sea View' : a.amenities.includes('Beach access') ? 'by the Beach' : 'in ' + c.areaN}`,
      meta: (a, l) => [['bed', a.beds === '0' ? 'Studio' : a.beds + ' BR'], ['users', 'Up to ' + a.maxGuests], ['star', l.rating + ' (' + l.reviews + ')']] },

    { id: 'venue', label: 'Venue', h1: 'Event venues', basis: 'AED / hour or day', img: ['img/venue1.jpg', 'img/venue2.jpg', 'img/office1.jpg'], n: 9,
      action: 'Request a quote', flow: ['Enquiry', 'Site visit', 'Deposit', 'Preparation', 'Event day'], org: ['Venue team'], names: ['The Grand Ballroom', 'Skyline Rooftop', 'Marina Terrace', 'The Loft Studio', 'Palm Garden Lawn', 'Boardroom 21', 'Sunset Deck', 'Atelier Hall'],
      fields: ['loc', 'date', 'time', 'guests'],
      defs: [
        date('date', 'Date'), sel('time', 'Time', [...TIME, ['fullday', 'Full day']], { many: 1, field: 'slots' }),
        gte('guests', 'Guests', [['20', 'Up to 20'], ['50', '21–50'], ['100', '51–100'], ['200', '100+']], () => pick([20, 40, 60, 120, 250, 400]), { field: 'capacity', fmt: v => v + ' guests' }),
        sel('venueType', 'Venue type', [['ballroom', 'Ballroom'], ['rooftop', 'Rooftop'], ['meeting', 'Meeting room'], ['garden', 'Garden & outdoor'], ['studio', 'Studio / loft']]),
        sel('catering', 'Catering', [['inhouse', 'In-house catering'], ['outside', 'Outside catering allowed'], ['none', 'No catering']]),
        mul('equipment', 'Equipment', ['AV & screen', 'Sound system', 'Stage', 'Lighting rig', 'Wi-Fi'], { all: 1, k: 4 }),
        sel('parking', 'Parking', [['valet', 'Valet'], ['free', 'Free parking'], ['paid', 'Paid nearby']]),
        price('Price per hour', [[null, 800], [800, 2000], [2000, null]]), tog('verified', 'Verified venues only', { p: .85 })
      ],
      price: a => Math.round(a.capacity * between(9, 16) / 50) * 50 + 300, unit: () => '/hour',
      title: (a, c) => c.name + ' · ' + lab(c.def('venueType'), a.venueType),
      meta: a => [['users', 'Up to ' + a.capacity], ['clock', a.slots.length + ' slots'], ['tool', { inhouse: 'Catering', outside: 'Outside catering', none: 'Dry hire' }[a.catering]]] },

    { id: 'padel', label: 'Padel court', h1: 'Padel courts', basis: 'AED / hour', img: ['img/padel1.jpg', 'img/padel2.jpg'], n: 9,
      action: 'Check slot availability', flow: ['Enquiry', 'Slot confirmed', 'Pay at venue', 'Play', 'Review'], org: ['Court operator'], names: ['Padel Pro Club', 'Just Padel', 'The Padel Lab', 'Smash Arena', 'Palm Padel', 'Vamos Padel'],
      fields: ['loc', 'date', 'time', 'players'],
      defs: [
        date('date', 'Date'), sel('time', 'Time', [...TIME, ['late', 'Late night']], { many: 1, field: 'slots' }),
        sel('players', 'Players', [['2', '2 players (singles)'], ['4', '4 players (doubles)']], { many: 1, gen: () => chance(.3) ? ['2', '4'] : ['4'] }),
        sel('setting', 'Indoor / outdoor', [['indoor', 'Indoor (A/C)'], ['outdoor', 'Outdoor']]),
        sel('court', 'Court type', [['panoramic', 'Panoramic'], ['standard', 'Standard glass']]),
        mul('equipment', 'Equipment', ['Racket rental', 'Balls included', 'Changing rooms', 'Coaching available'], { all: 1, k: 4 }),
        rating(), price('Price per hour', [[null, 250], [250, 400], [400, null]]), tog('verified', 'Verified clubs only', { p: .85 })
      ],
      price: a => between(180, 320, 10) + (a.setting === 'indoor' ? 80 : 0) + (a.court === 'panoramic' ? 50 : 0), unit: () => '/hour',
      title: (a, c) => `${c.name} · ${a.setting === 'indoor' ? 'Indoor' : 'Outdoor'} ${a.court === 'panoramic' ? 'Panoramic' : ''} Court`,
      meta: (a, l) => [['pin', a.setting === 'indoor' ? 'Indoor · A/C' : 'Outdoor'], ['users', a.players.includes('2') ? 'Singles & doubles' : 'Doubles'], ['star', l.rating + ' (' + l.reviews + ')']] },

    { id: 'yacht', label: 'Yacht', h1: 'Yacht charters', basis: 'AED / hour or day', img: ['img/yacht1.jpg', 'img/yacht2.jpg'], n: 9, locs: MARINAS,
      action: 'Check availability', flow: ['Enquiry', 'Deposit to operator', 'Guest details', 'Trip', 'Settlement'], org: ['Charter operator'], names: ['Xclusive Yachts', 'Marina Charters', 'Blue Lagoon Yachting', 'Seven Seas'],
      fields: ['loc', 'date', 'duration', 'guests'], locLabel: 'Marina',
      defs: [
        date('date', 'Date'),
        lte('duration', 'Duration', [['2', '2 hours'], ['3', '3 hours'], ['4', '4 hours'], ['8', 'Full day']], () => pick([2, 2, 3, 4]), { field: 'minHours', fmt: v => v + ' hr minimum' }),
        gte('guests', 'Guests', [['6', 'Up to 6'], ['12', '7–12'], ['20', '13–20'], ['35', '20+']], null, { field: 'capacity', fmt: v => 'Up to ' + v }),
        gte('size', 'Yacht size', [['40', '40 ft+'], ['60', '60 ft+'], ['80', '80 ft+']], () => pick([36, 42, 50, 56, 65, 75, 88, 101]), { field: 'length', fmt: v => v + ' ft' }),
        sel('crew', 'Crew', [['captain', 'Captain only'], ['full', 'Captain, crew & host']]),
        mul('food', 'Food', ['Soft drinks', 'BBQ onboard', 'Catering', 'Cake & décor'], { all: 1 }),
        mul('activities', 'Activities', ['Swimming stop', 'Fishing', 'Jet ski add-on', 'Water toys'], { all: 1 }),
        sel('cancellation', 'Cancellation', [['free', 'Free up to 48h'], ['moderate', '50% refund'], ['strict', 'Non-refundable']]),
        price('Price per hour', [[null, 700], [700, 1200], [1200, null]]), tog('verified', 'Licensed operators only', { p: .9 })
      ],
      post: a => { a.capacity = Math.round(a.length / 2.8); }, price: a => Math.round(a.length * between(11, 16) / 50) * 50, unit: () => '/hour',
      title: (a, c) => `${a.length} ft ${pick(['Majesty', 'Azimut', 'Sunseeker', 'Princess', 'Gulf Craft'])} · ${c.name}`,
      meta: a => [['ruler', a.length + ' ft'], ['users', 'Up to ' + a.capacity], ['clock', 'Min ' + a.minHours + ' hrs']] }
  ] };

  V.services = { id: 'services', label: 'Services', icon: 'wrench', blurb: 'Cleaning, AC, salons and clinics.', offers: [
    { id: 'cleaning', label: 'Cleaning', h1: 'Cleaning services', basis: 'AED / visit or contract', img: ['img/clean1.jpg', 'img/clean2.jpg'], n: 10, coverage: 1, from: 1,
      action: 'Request a booking', flow: ['Enquiry', 'Slot confirmed', 'Visit', 'Photo evidence', 'Pay the provider'], org: ['DED-licensed company'], names: ['Sparkle Home Cleaning', 'Maids on Call', 'Fresh Nest', 'Shine & Co.', 'Neat Freaks DXB'],
      fields: ['service', 'loc', 'date', 'frequency'], locLabel: 'Location',
      defs: [
        sel('service', 'Service', ['Regular clean', 'Deep clean', 'Move-in / move-out', 'Sofa & carpet'], { many: 1 }), date('date', 'Date'),
        sel('frequency', 'Frequency', [['once', 'One-time'], ['weekly', 'Weekly'], ['biweekly', 'Every 2 weeks'], ['contract', 'Monthly contract']], { many: 1 }),
        sel('ptype', 'Property type', ['Apartment', 'Villa', 'Office'], { many: 1 }),
        gte('bedrooms', 'Bedrooms', [['1', 'Studio / 1'], ['2', '2'], ['3', '3'], ['5', '4–5+']], () => pick([3, 4, 5, 6]), { field: 'maxBeds', fmt: v => 'Up to ' + v + ' BR' }),
        tog('materials', 'Materials included'),
        gte('cleaners', 'Cleaners', [['1', '1 cleaner'], ['2', '2 cleaners'], ['3', 'Team of 3+']], () => pick([1, 2, 3, 4]), { field: 'team', fmt: v => 'Up to ' + v }),
        lte('duration', 'Duration', [['2', '2 hr minimum'], ['3', '3 hr minimum'], ['4', '4 hr minimum']], () => pick([2, 3, 4]), { field: 'minHours', fmt: v => v + ' hrs min' }),
        price('Price per hour', [[null, 40], [40, 55], [55, null]]), tog('verified', 'ID-verified only', { p: .85 })
      ],
      price: () => between(32, 65), unit: () => '/hour',
      title: (a, c) => `${a.service[0]} · ${c.name}`,
      meta: (a, l) => [['star', l.rating + ' (' + l.reviews + ')'], ['users', 'Team of ' + a.team], ['clock', a.minHours + ' hrs min']] },

    { id: 'ac', label: 'AC maintenance', h1: 'AC maintenance', basis: 'One-time or AED / year', img: ['img/ac1.jpg', 'img/ac2.jpg'], n: 9, coverage: 1, from: 1,
      action: 'Request a quote', flow: ['Enquiry', 'Assessment', 'Quote', 'Work order', 'Completion'], org: ['DED-licensed company'], names: ['CoolFix Technical', 'Polar AC', 'Breeze HVAC', 'Chill Masters'],
      fields: ['model', 'property', 'units', 'date'],
      defs: [
        sel('model', 'Service model', [['once', 'One-time service'], ['annual', 'Annual contract (AMC)']], { many: 1 }),
        sel('property', 'Property', ['Apartment', 'Villa', 'Office'], { many: 1 }),
        gte('units', 'Units', [['1', '1 unit'], ['3', '2–3 units'], ['6', '4–6 units'], ['10', '7+ units']], () => pick([4, 6, 10, 20]), { field: 'maxUnits', fmt: v => 'Up to ' + v }),
        date('date', 'Preferred date'),
        mul('acType', 'AC type', ['Split', 'Ducted / central', 'Window', 'Cassette'], { k: 4 }),
        tog('emergency', '24/7 emergency'),
        gte('visits', 'Visits included', [['2', '2+ per year'], ['3', '3+ per year'], ['4', '4+ per year']], () => pick([2, 3, 4]), { fmt: v => v + ' visits / year' }),
        sel('parts', 'Parts', [['included', 'Parts included'], ['extra', 'Parts charged extra']]),
        lte('sla', 'Response SLA', [['4', 'Within 4 hrs'], ['24', 'Within 24 hrs'], ['48', 'Within 48 hrs']], () => pick([4, 24, 24, 48]), { fmt: v => v + ' hrs' }),
        price('Starting price', [[null, 150], [150, 300], [300, null]]), tog('verified', 'Licensed only', { p: .85 })
      ],
      price: () => between(99, 380, 10), unit: (l, S) => S && S.f.model === 'annual' ? '/unit / year' : '/unit',
      priceOf: (l, S) => S && S.f.model === 'annual' ? l.price * 3 : l.price,
      title: (a, c) => `AC ${a.model.includes('annual') ? 'annual contract' : 'servicing & repair'} · ${c.name}`,
      meta: a => [['clock', a.sla + 'h response'], ['tool', a.acType.slice(0, 2).join(', ')], ['check', a.visits + ' visits/yr']] },

    { id: 'haircut', label: 'Haircut', h1: 'Haircuts & salons', basis: 'AED / appointment', img: ['img/salon1.jpg', 'img/salon2.jpg'], n: 9, from: 1,
      action: 'Request an appointment', flow: ['Enquiry', 'Confirmation', 'Appointment', 'Pay at salon', 'Review'], org: ['Salon'], names: ['Tips & Toes', 'The Barber Shop', 'Blow Bar', 'Ivy Salon', 'Gents Grooming'],
      fields: ['treatment', 'loc', 'date', 'time'],
      defs: [
        sel('treatment', 'Treatment', ["Men's cut", "Women's cut & style", 'Colour', 'Blow-dry', 'Kids cut', 'Beard trim'], { many: 1 }),
        date('date', 'Date'), sel('time', 'Time', TIME, { many: 1, field: 'slots' }),
        sel('setting', 'At home / salon', [['salon', 'In salon'], ['home', 'At home']], { many: 1 }),
        sel('pro', 'Professional', [['male', 'Male stylist'], ['female', 'Female stylist']], { many: 1 }),
        lte('duration', 'Duration', [['30', 'Up to 30 min'], ['45', 'Up to 45 min'], ['60', 'Up to 60 min']], () => pick([30, 45, 60, 90]), { fmt: v => v + ' min' }),
        rating(), price('Price', [[null, 100], [100, 200], [200, null]]), tog('verified', 'Verified only', { p: .85 })
      ],
      price: () => between(60, 260, 5), unit: () => '/appointment',
      title: (a, c) => `${a.treatment[0]} · ${c.name}`,
      meta: (a, l) => [['clock', a.duration + ' min'], ['pin', a.setting.includes('home') ? 'Home visit' : 'In salon'], ['star', l.rating + ' (' + l.reviews + ')']] },

    { id: 'dentist', label: 'Dentist', h1: 'Dentists', basis: 'AED / consultation', img: ['img/dental1.jpg', 'img/dental2.jpg'], n: 9, from: 1,
      action: 'Request an appointment', flow: ['Enquiry', 'Appointment', 'Patient form', 'Consultation', 'Treatment plan'], org: ['DHA-licensed clinic'], names: ['Bright Smile Dental', 'Versailles Dental', 'Dr. Michael\'s', 'Seven Dental', 'Smile Studio'],
      fields: ['treatment', 'loc', 'date', 'time'], locLabel: 'Area',
      defs: [
        sel('treatment', 'Treatment', ['Check-up & cleaning', 'Whitening', 'Aligners & braces', 'Implants', 'Root canal', 'Kids dentistry'], { many: 1, k: 4 }),
        date('date', 'Date'), sel('time', 'Time', TIME, { many: 1, field: 'slots' }),
        sel('clinic', 'Clinic', [['specialist', 'Specialist centre'], ['family', 'Family clinic'], ['hospital', 'Hospital department']]),
        mul('insurance', 'Insurance', ['Daman', 'AXA', 'Bupa', 'MetLife', 'Cigna', 'Direct billing'], { k: 4 }),
        mul('language', 'Language', LANGS, { gen: () => ['English', ...pickN(LANGS.slice(1), between(1, 2))] }),
        sel('specialist', 'Specialist', ['Orthodontist', 'Endodontist', 'Periodontist', 'Paediatric dentist'], { many: 1 }),
        rating(), price('Consultation fee', [[null, 200], [200, 350], [350, null]]), tog('verified', 'DHA-licensed only', { p: .95 })
      ],
      price: () => between(150, 450, 10), unit: () => '/consultation',
      title: (a, c) => `${c.name} · ${a.specialist[0]}`,
      meta: (a, l) => [['shield', a.insurance.length + ' insurers'], ['users', a.language.slice(0, 2).join(', ')], ['star', l.rating + ' (' + l.reviews + ')']] }
  ] };

  V.experiences = { id: 'experiences', label: 'Experiences', icon: 'compass', blurb: 'Safaris, workshops and tours.', offers: [
    { id: 'safari', label: 'Desert safari', h1: 'Desert safaris', basis: 'AED / person / day', img: ['img/desert1.jpg', 'img/desert2.jpg'], n: 9, coverage: 1,
      action: 'Check availability', flow: ['Enquiry', 'Guest details', 'Pay operator', 'Pickup', 'Review'], org: ['DTCM-licensed operator'], names: ['Arabian Adventures', 'Platinum Heritage', 'Desert Rose Tours', 'Gulf Ventures'],
      fields: ['date', 'guests', 'loc', 'session'], locLabel: 'Pickup area',
      defs: [
        date('date', 'Date'),
        gte('guests', 'Guests', [['2', '1–2'], ['4', '3–4'], ['8', '5–8'], ['15', '9+']], () => pick([6, 10, 20, 40]), { field: 'groupMax', fmt: v => 'Groups up to ' + v }),
        sel('session', 'Session', [['morning', 'Morning'], ['evening', 'Evening'], ['overnight', 'Overnight']], { many: 1 }),
        sel('format', 'Private / shared', [['shared', 'Shared group'], ['private', 'Private']]),
        mul('language', 'Language', LANGS, { gen: () => ['English', ...pickN(LANGS.slice(1), between(0, 2))] }),
        mul('meals', 'Meals', ['BBQ dinner', 'Breakfast', 'Unlimited drinks'], { all: 1 }),
        sel('transport', 'Transport', [['4x4', '4x4 hotel pickup'], ['own', 'Meet at camp']], { many: 1 }),
        lte('age', 'Age', [['3', 'Kids 3+'], ['8', 'Kids 8+'], ['16', 'Teens & adults']], () => pick([3, 3, 5, 8, 16]), { field: 'minAge', fmt: v => v + '+' }),
        price('Price per person', [[null, 150], [150, 300], [300, null]]), tog('verified', 'DTCM-licensed only', { p: .9 })
      ],
      price: a => between(110, 280, 5) * (a.format === 'private' ? 2.2 : 1), unit: () => '/person',
      title: a => `${a.session.includes('overnight') ? 'Overnight Desert Camp' : a.session[0] === 'morning' ? 'Morning Dune Bashing & Sandboarding' : 'Evening Red Dunes Safari'}${a.meals.includes('BBQ dinner') ? ' with BBQ' : ''}${a.format === 'private' ? ' (Private)' : ''}`,
      meta: (a, l) => [['users', a.format === 'private' ? 'Private' : 'Up to ' + a.groupMax], ['car', a.transport.includes('4x4') ? 'Hotel pickup' : 'Meet at camp'], ['star', l.rating + ' (' + l.reviews.toLocaleString() + ')']] },

    { id: 'workshop', label: 'Workshop', h1: 'Workshops', basis: 'AED / session', img: ['img/workshop1.jpg', 'img/workshop2.jpg'], n: 9,
      action: 'Check availability', flow: ['Enquiry', 'Seat confirmed', 'Reminder', 'Attend', 'Certificate'], org: ['Studio'], names: ['Clay Studio DXB', 'The Artsy Room', 'Kitchen Lab', 'Scent Atelier', 'Frame & Focus'],
      fields: ['topic', 'date', 'session', 'participants'],
      defs: [
        sel('topic', 'Topic', ['Pottery', 'Painting', 'Cooking', 'Perfume making', 'Photography', 'Calligraphy']),
        date('date', 'Date'), sel('session', 'Session', TIME, { many: 1 }),
        gte('participants', 'Participants', [['1', 'Just me'], ['2', '2'], ['6', '3–6'], ['12', '7+ (team)']], () => pick([6, 8, 12, 20]), { field: 'groupMax', fmt: v => 'Up to ' + v }),
        sel('level', 'Level', ['Beginner', 'Intermediate', 'Advanced'], { many: 1 }),
        mul('language', 'Language', LANGS.slice(0, 3), { gen: () => ['English', ...pickN(['Arabic', 'Hindi'], between(0, 1))] }),
        tog('materials', 'Materials included', { p: .7 }),
        lte('age', 'Age', [['6', 'Kids 6+'], ['12', '12+'], ['18', 'Adults']], () => pick([6, 12, 12, 18]), { field: 'minAge', fmt: v => v + '+' }),
        price('Price per session', [[null, 200], [200, 400], [400, null]]), tog('verified', 'Verified studios only', { p: .85 })
      ],
      price: () => between(120, 480, 10), unit: () => '/session',
      title: (a, c) => `${a.topic} ${pick(['Workshop', 'Masterclass', 'Taster Session'])} · ${c.name}`,
      meta: (a, l) => [['clock', pick(['2 hrs', '2.5 hrs', '3 hrs'])], ['users', 'Up to ' + a.groupMax], ['star', l.rating + ' (' + l.reviews + ')']] },

    { id: 'tour', label: 'Tour', h1: 'Tours', basis: 'AED / person / day', img: ['img/apt3.jpg', 'img/desert2.jpg', 'img/yacht2.jpg'], n: 9,
      action: 'Check availability', flow: ['Enquiry', 'Confirmation', 'Meet guide', 'Tour', 'Review'], org: ['DTCM-licensed guide'], names: ['Wanderlust DXB', 'Old Dubai Walks', 'Frying Pan Adventures', 'City Sightseeing'],
      fields: ['loc', 'date', 'guests', 'language'],
      defs: [
        date('date', 'Date'),
        gte('guests', 'Guests', [['2', '1–2'], ['4', '3–4'], ['8', '5–8'], ['15', '9+']], () => pick([8, 12, 20, 40]), { field: 'groupMax', fmt: v => 'Up to ' + v }),
        mul('language', 'Language', LANGS, { gen: () => ['English', ...pickN(LANGS.slice(1), between(1, 3))] }),
        sel('duration', 'Duration', [['short', 'Under 3 hrs'], ['half', 'Half day'], ['full', 'Full day']]),
        sel('format', 'Private / shared', [['shared', 'Shared group'], ['private', 'Private']]),
        sel('transport', 'Transport', [['pickup', 'Hotel pickup'], ['walk', 'Walking tour'], ['coach', 'Coach']]),
        tog('accessible', 'Wheelchair accessible', { p: .35 }),
        price('Price per person', [[null, 150], [150, 300], [300, null]]), tog('verified', 'Licensed guides only', { p: .9 })
      ],
      price: a => between(90, 260, 5) * (a.format === 'private' ? 2 : 1) * (a.duration === 'full' ? 1.6 : 1), unit: () => '/person',
      title: a => pick(['Old Dubai & Souks', 'Street Food Night', 'Abu Dhabi Grand Mosque Day Trip', 'Architecture & Skyline', 'Creek & Al Fahidi Heritage', 'Hatta Mountain Escape']) + (a.format === 'private' ? ' (Private)' : ' Tour'),
      meta: (a, l) => [['clock', { short: 'Under 3 hrs', half: 'Half day', full: 'Full day' }[a.duration]], ['users', a.language.slice(0, 2).join(', ')], ['star', l.rating + ' (' + l.reviews + ')']] }
  ] };

  V.memberships = { id: 'memberships', label: 'Memberships', icon: 'badge', blurb: 'Gyms and credit packages.', offers: [
    { id: 'gym', label: 'Gym plan', h1: 'Gym memberships', basis: 'AED / month or year', img: ['img/fit2.jpg', 'img/fit1.jpg'], n: 10, from: 1,
      action: 'Book a free visit', flow: ['Enquiry', 'Free visit', 'Sign terms', 'Access card', 'Renewal'], org: ['Fitness club'], names: ['GymNation', 'Fitness First', 'Warehouse Gym', 'Barry\'s', 'Train Station', 'Commit Fitness'],
      fields: ['loc', 'access', 'billing', 'start'], defaults: { billing: 'monthly' },
      defs: [
        sel('access', 'Access level', [['single', 'Single club'], ['multi', 'Multi-club'], ['all', 'All-access']]),
        { id: 'billing', type: 'seg', label: 'Billing period', options: o([['monthly', 'Monthly'], ['annual', 'Annual']]), required: 1, noMatch: 1 },
        date('start', 'Start date'),
        gte('branches', 'Branches', [['1', '1+'], ['3', '3+'], ['10', '10+']], a => a.access === 'single' ? 1 : a.access === 'multi' ? pick([3, 5, 8]) : pick([10, 18, 30]), { fmt: v => v + ' branches' }),
        mul('classes', 'Classes', ['Yoga', 'HIIT', 'Spin', 'Pilates', 'Pool'], { all: 1, k: 4 }),
        sel('visits', 'Visits', [['unlimited', 'Unlimited'], ['12', '12 / month'], ['8', '8 / month']]),
        tog('freeze', 'Freeze allowed'), tog('noJoin', 'No joining fee'),
        price('Budget', S => S.f.billing === 'annual' ? [[null, 3000], [3000, 6000], [6000, null]] : [[null, 250], [250, 500], [500, null]]),
        tog('verified', 'Verified clubs only', { p: .85 })
      ],
      price: a => between(120, 420, 10) * (a.access === 'all' ? 1.6 : 1), priceOf: (l, S) => S && S.f.billing === 'annual' ? l.price * 10 : l.price,
      unit: (l, S) => S && S.f.billing === 'annual' ? '/year' : '/month',
      title: (a, c) => `${c.name} · ${lab(c.def('access'), a.access)}`,
      meta: a => [['pin', a.branches + ' branch' + (a.branches > 1 ? 'es' : '')], ['check', lab({ options: o([['unlimited', 'Unlimited'], ['12', '12 visits'], ['8', '8 visits']]) }, a.visits)], ['spark', a.classes.length + ' class types']] },

    { id: 'credits', label: 'Credit package', h1: 'Credit packages', basis: 'AED / package', img: ['img/fit1.jpg', 'img/padel2.jpg'], n: 8, from: 1,
      action: 'Enquire about package', flow: ['Enquiry', 'Purchase', 'Credits issued', 'Book sessions', 'Expiry'], org: ['Activity network'], names: ['Privilee', 'ClassPass', 'Urban Pass', 'Kaizen Credits', 'Playtomic Plus'],
      fields: ['activity', 'loc', 'credits', 'start'],
      defs: [
        sel('activity', 'Activity', ['Fitness classes', 'Padel', 'Swimming', 'Spa & wellness', 'Yoga'], { many: 1 }),
        gte('credits', 'Credits', [['10', '10 credits'], ['20', '20 credits'], ['50', '50 credits'], ['100', '100 credits']], () => pick([20, 50, 100]), { field: 'maxCredits', fmt: v => 'Packs up to ' + v }),
        date('start', 'Start date'),
        gte('validity', 'Validity', [['1', '1 month+'], ['3', '3 months+'], ['6', '6 months+'], ['12', '12 months']], () => pick([1, 3, 6, 12]), { fmt: v => v + ' months' }),
        gte('locations', 'Locations', [['5', '5+ partners'], ['20', '20+ partners'], ['50', '50+ partners']], () => pick([6, 15, 30, 80]), { fmt: v => v + ' partners' }),
        tog('guest', 'Guest access'),
        lte('cancellation', 'Cancellation', [['12', 'Free up to 12h before'], ['24', 'Free up to 24h before']], () => pick([6, 12, 24]), { fmt: v => 'Free up to ' + v + 'h before' }),
        price('Package price', [[null, 500], [500, 1500], [1500, null]]), tog('verified', 'Verified only', { p: .85 })
      ],
      price: a => between(15, 32) * a.maxCredits / 2, unit: () => '/package',
      title: (a, c) => `${c.name} · ${a.activity.slice(0, 2).join(' & ')} Pack`,
      meta: a => [['tag', a.maxCredits + ' credits'], ['cal', a.validity + ' mo validity'], ['pin', a.locations + ' partners']] }
  ] };

  V.programs = { id: 'programs', label: 'Programs', icon: 'grad', blurb: 'Schools, courses, camps and academies.', offers: [
    { id: 'school', label: 'School', h1: 'Schools', basis: 'AED / term or year', img: ['img/school1.jpg', 'img/school2.jpg'], n: 10, from: 1,
      action: 'Enquire about admission', flow: ['Enquiry', 'School tour', 'Assessment', 'Offer', 'Enrolment'], org: ['KHDA-registered school'], names: ['Dubai British School', 'GEMS Wellington', 'Repton', 'American Academy', 'Kings\' School', 'Lycée Français', 'Delhi Private School'],
      fields: ['year', 'curriculum', 'loc', 'intake'],
      defs: [
        sel('year', 'Year level', ['FS / KG', 'Primary', 'Secondary', 'Sixth form / IB'], { many: 1, k: 4 }),
        sel('curriculum', 'Curriculum', ['British', 'American', 'IB', 'Indian (CBSE)', 'French', 'UAE MoE']),
        sel('intake', 'Intake', ['Sep 2026', 'Jan 2027', 'Apr 2027'], { many: 1 }),
        sel('gender', 'Gender', [['coed', 'Co-ed'], ['girls', 'Girls only'], ['boys', 'Boys only']], { gen: () => pick(['coed', 'coed', 'coed', 'girls', 'boys']) }),
        price('Annual fees', [[null, 40000], [40000, 70000], [70000, null]]),
        tog('transport', 'School transport'),
        mul('facilities', 'Facilities', ['Swimming pool', 'Sports hall', 'Theatre', 'Science labs', 'Football pitch'], { all: 1, k: 5 }),
        sel('admissions', 'Admissions', [['open', 'Places available'], ['waitlist', 'Waitlist']]),
        sel('khda', 'KHDA rating', [['1', 'Outstanding'], ['2', 'Very good & up'], ['3', 'Good & up']], { test: (lv, v) => lv <= +v, gen: () => pick([1, 2, 2, 3, 3, 4]), fmt: v => ['', 'Outstanding', 'Very good', 'Good', 'Acceptable'][v] }),
        tog('verified', 'KHDA-verified only', { p: .95 })
      ],
      price: a => between(28000, 95000, 500) * (a.khda === 1 ? 1.3 : 1), unit: () => '/year',
      title: (a, c) => `${c.name} · ${a.curriculum} curriculum`,
      meta: a => [['grad', a.year.join(', ')], ['star', ['', 'Outstanding', 'Very good', 'Good', 'Acceptable'][a.khda]], ['users', { coed: 'Co-ed', girls: 'Girls', boys: 'Boys' }[a.gender]]] },

    { id: 'course', label: 'Course', h1: 'Courses', basis: 'AED / course', img: ['img/office2.jpg', 'img/school1.jpg', 'img/office3.jpg'], n: 9,
      action: 'Enquire to enrol', flow: ['Enquiry', 'Enrolment', 'Pay provider', 'Timetable', 'Certificate'], org: ['KHDA-approved centre'], names: ['Le Wagon', 'Berlitz', 'Eton Institute', 'Coding Minds', 'MSB Academy'],
      fields: ['subject', 'level', 'start', 'mode'],
      defs: [
        sel('subject', 'Subject', ['Coding', 'UX Design', 'Data & AI', 'Arabic', 'English / IELTS', 'Business']),
        sel('level', 'Level', ['Beginner', 'Intermediate', 'Advanced'], { many: 1 }),
        date('start', 'Start date'),
        sel('mode', 'Mode', [['in-person', 'In-person'], ['online', 'Online'], ['hybrid', 'Hybrid']], { many: 1 }),
        lte('duration', 'Duration', [['4', 'Up to 4 weeks'], ['8', 'Up to 8 weeks'], ['12', 'Up to 12 weeks']], () => pick([2, 4, 6, 8, 12, 24]), { field: 'weeks', fmt: v => v + ' weeks' }),
        sel('schedule', 'Schedule', [['weekday-am', 'Weekday mornings'], ['weekday-pm', 'Weekday evenings'], ['weekend', 'Weekends']], { many: 1 }),
        tog('certificate', 'Certificate included', { p: .7 }),
        mul('language', 'Language', ['English', 'Arabic'], { gen: () => chance(.3) ? ['English', 'Arabic'] : ['English'] }),
        sel('provider', 'Provider', [['university', 'University'], ['institute', 'Institute'], ['tutor', 'Independent tutor']]),
        price('Course fee', [[null, 1500], [1500, 5000], [5000, null]]), tog('verified', 'Approved providers only', { p: .85 })
      ],
      price: a => between(80, 260, 10) * a.weeks * (a.provider === 'university' ? 1.5 : 1), unit: () => '/course',
      title: (a, c) => `${a.subject} ${pick(['Bootcamp', 'Course', 'Programme', 'Certificate'])} · ${c.name}`,
      meta: a => [['clock', a.weeks + ' weeks'], ['pin', a.mode.map(m => ({ 'in-person': 'In-person', online: 'Online', hybrid: 'Hybrid' }[m])).join(' / ')], ['check', a.certificate ? 'Certificate' : 'No certificate']] },

    { id: 'camp', label: 'Camp', h1: 'Kids camps', basis: 'AED / day or package', img: ['img/fit1.jpg', 'img/school2.jpg', 'img/workshop1.jpg'], n: 9, from: 1,
      action: 'Enquire to enrol', flow: ['Enquiry', 'Consent form', 'Pay provider', 'Drop-off', 'Completion'], org: ['KHDA-approved centre'], names: ['Camp Beaver', 'Kids Active', 'Little Explorers', 'Sports Village', 'Young Engineers'],
      fields: ['activity', 'age', 'date', 'loc'],
      defs: [
        sel('activity', 'Activity', ['Sports', 'Arts & crafts', 'STEM & robotics', 'Multi-activity', 'Swimming']),
        sel('age', 'Age', [['4-7', '4–7 yrs'], ['8-12', '8–12 yrs'], ['13-16', '13–16 yrs']], { many: 1 }),
        date('date', 'Date'),
        sel('duration', 'Duration', [['day', 'Daily drop-in'], ['week', '1 week'], ['multi', '2+ weeks']], { many: 1 }),
        tog('meals', 'Meals included'), tog('transport', 'Transport available', { p: .4 }),
        lte('group', 'Group size', [['8', 'Up to 8'], ['12', 'Up to 12'], ['20', 'Up to 20']], () => pick([8, 10, 12, 16, 20, 25]), { field: 'groupMax', fmt: v => 'Max ' + v + ' kids' }),
        tog('equipment', 'Equipment provided', { p: .7 }),
        price('Price per day', [[null, 200], [200, 350], [350, null]]), tog('verified', 'Approved only', { p: .9 })
      ],
      price: () => between(140, 420, 10), unit: () => '/day',
      title: (a, c) => `${a.activity} Camp · ${c.name}`,
      meta: a => [['users', a.age.map(x => x.replace('-', '–')).join(', ') + ' yrs'], ['cal', a.duration.map(d => ({ day: 'Drop-in', week: '1 wk', multi: '2+ wks' }[d])).join(' / ')], ['users', 'Max ' + a.groupMax]] },

    { id: 'academy', label: 'Academy', h1: 'Sports academies', basis: 'AED / term', img: ['img/padel1.jpg', 'img/fit2.jpg'], n: 9, from: 1,
      action: 'Book an assessment', flow: ['Enquiry', 'Assessment', 'Placement', 'Term', 'Progress report'], org: ['Sports academy'], names: ['Elite Football Academy', 'Hamilton Aquatics', 'Tennis 360', 'Dubai Stars Basketball', 'Legacy BJJ'],
      fields: ['sport', 'age', 'level', 'term'],
      defs: [
        sel('sport', 'Sport', ['Football', 'Swimming', 'Tennis', 'Basketball', 'Martial arts', 'Gymnastics']),
        sel('age', 'Age', [['4-7', '4–7 yrs'], ['8-12', '8–12 yrs'], ['13-17', '13–17 yrs'], ['adult', 'Adults']], { many: 1 }),
        sel('level', 'Level', ['Beginner', 'Intermediate', 'Advanced'], { many: 1 }),
        sel('term', 'Term', ['Autumn 2026', 'Spring 2027', 'Summer 2027'], { many: 1 }),
        sel('schedule', 'Schedule', [['weekday-pm', 'Weekday evenings'], ['weekend', 'Weekends']], { many: 1 }),
        sel('coach', 'Coach', [['licensed', 'Licensed coaches'], ['pro', 'Ex-professional coaches']], { many: 1 }),
        tog('assessment', 'Free assessment', { p: .6 }), tog('uniform', 'Uniform included'),
        price('Price per term', [[null, 1500], [1500, 3000], [3000, null]]), tog('verified', 'Verified academies only', { p: .9 })
      ],
      price: () => between(900, 4200, 50), unit: () => '/term',
      title: (a, c) => `${a.sport} · ${c.name}`,
      meta: a => [['users', a.age.map(x => x === 'adult' ? 'Adults' : x.replace('-', '–')).join(', ')], ['cal', a.schedule.map(s => s === 'weekend' ? 'Weekends' : 'Weekdays').join(' & ')], ['check', a.assessment ? 'Free assessment' : a.level.join(', ')]] }
  ] };

  V.insurance = { id: 'insurance', label: 'Insurance', icon: 'shield', blurb: 'Motor, health and property cover.', offers: [
    { id: 'motor', label: 'Motor', h1: 'Motor insurance', basis: 'Quoted annual premium', img: [], tile: 1, n: 8, from: 1, locAll: 1,
      action: 'Get a quote', flow: ['Quote request', 'Eligibility check', 'Comparison', 'Application', 'Policy issued'], org: ['CBUAE-licensed insurer'], names: ['AXA Gulf', 'Oman Insurance', 'Tokio Marine', 'RSA', 'Orient', 'Sukoon'],
      fields: ['vehicle', 'regYear', 'driverAge', 'coverage'],
      defs: [
        sel('vehicle', 'Vehicle', ['Sedan', 'SUV', 'Sports car', 'Luxury', 'Electric'], { many: 1, k: 4 }),
        sel('regYear', 'Registration year', [['2024', '2024 or newer'], ['2020', '2020–2023'], ['older', 'Before 2020']], { many: 1 }),
        sel('driverAge', 'Driver age', [['18', '18–24'], ['25', '25–39'], ['40', '40–59'], ['60', '60+']], { many: 1, k: 4 }),
        sel('coverage', 'Coverage', [['comprehensive', 'Comprehensive'], ['tpl', 'Third-party only']]),
        tog('agency', 'Agency repair'), tog('roadside', 'Roadside assistance', { p: .7 }),
        lte('deductible', 'Deductible', [['250', 'AED 250 or less'], ['500', 'AED 500 or less'], ['1000', 'AED 1,000 or less']], () => pick([0, 250, 350, 500, 1000]), { fmt: v => 'AED ' + v }),
        price('Premium', [[null, 1500], [1500, 3000], [3000, null]]), tog('verified', 'Licensed insurers only', { p: 1 })
      ],
      price: a => a.coverage === 'tpl' ? between(650, 1200, 10) : between(1400, 4800, 50), unit: () => '/year',
      title: (a, c) => `${c.name} ${a.coverage === 'tpl' ? 'Third-Party' : 'Comprehensive'} ${a.agency ? '+ Agency Repair' : 'Cover'}`,
      meta: a => [['shield', a.coverage === 'tpl' ? 'Third-party' : 'Comprehensive'], ['tool', a.agency ? 'Agency repair' : 'Garage repair'], ['tag', 'AED ' + a.deductible + ' excess']] },

    { id: 'health', label: 'Health', h1: 'Health insurance', basis: 'Quoted annual premium', img: [], tile: 1, n: 8, from: 1, locAll: 1,
      action: 'Get a quote', flow: ['Quote request', 'Health details', 'Comparison', 'Application', 'Policy issued'], org: ['CBUAE-licensed insurer'], names: ['Daman', 'Bupa Global', 'Cigna', 'MetLife', 'AXA', 'Allianz Care'],
      fields: ['customer', 'ageBand', 'area', 'network'],
      defs: [
        sel('customer', 'Customer type', [['individual', 'Individual'], ['family', 'Family'], ['sme', 'Employer / SME'], ['domestic', 'Domestic worker']], { many: 1, k: 3 }),
        sel('ageBand', 'Age band', [['18', '18–30'], ['31', '31–45'], ['46', '46–60'], ['61', '60+']], { many: 1, k: 4 }),
        sel('area', 'Coverage area', [['uae', 'UAE only'], ['ww-us', 'Worldwide excl. US'], ['ww', 'Worldwide']]),
        sel('network', 'Network', [['basic', 'Basic'], ['enhanced', 'Enhanced'], ['premium', 'Premium']]),
        tog('outpatient', 'Outpatient', { p: .8 }), tog('dental', 'Dental'), tog('maternity', 'Maternity'),
        lte('copay', 'Co-pay', [['0', 'No co-pay'], ['10', 'Up to 10%'], ['20', 'Up to 20%']], () => pick([0, 10, 20]), { fmt: v => v + '%' }),
        price('Premium', [[null, 3000], [3000, 8000], [8000, null]]), tog('verified', 'Licensed insurers only', { p: 1 })
      ],
      price: a => between(900, 3000, 50) * ({ basic: 1, enhanced: 2.2, premium: 4 }[a.network]) * (a.area === 'ww' ? 1.8 : 1), unit: () => '/year',
      title: (a, c) => `${c.name} ${lab(c.def('network'), a.network)} · ${lab(c.def('area'), a.area)}`,
      meta: a => [['shield', { basic: 'Basic', enhanced: 'Enhanced', premium: 'Premium' }[a.network] + ' network'], ['check', [a.outpatient && 'OP', a.dental && 'Dental', a.maternity && 'Maternity'].filter(Boolean).join(' · ') || 'Inpatient'], ['tag', a.copay + '% co-pay']] },

    { id: 'property', label: 'Property', h1: 'Property insurance', basis: 'Quoted annual premium', img: [], tile: 1, n: 7, from: 1, locAll: 1,
      action: 'Get a quote', flow: ['Quote request', 'Risk details', 'Comparison', 'Application', 'Policy issued'], org: ['CBUAE-licensed insurer'], names: ['Sukoon', 'RSA', 'AXA Gulf', 'Zurich', 'Salama'],
      fields: ['ptype', 'loc', 'value', 'occupancy'],
      defs: [
        sel('ptype', 'Property type', ['Apartment', 'Villa', 'Office', 'Warehouse'], { many: 1, k: 3 }),
        gte('value', 'Value', [['1', 'Up to AED 1M'], ['3', 'AED 1M–3M'], ['10', 'AED 3M+']], () => pick([2, 5, 10, 25]), { field: 'maxValue', fmt: v => 'Up to AED ' + v + 'M' }),
        sel('occupancy', 'Occupancy', [['owner', 'Owner-occupier'], ['tenant', 'Tenant'], ['landlord', 'Landlord']], { many: 1 }),
        tog('building', 'Building cover'), tog('contents', 'Contents cover', { p: .8 }), tog('liability', 'Liability cover', { p: .7 }),
        lte('deductible', 'Deductible', [['500', 'AED 500 or less'], ['1000', 'AED 1,000 or less']], () => pick([250, 500, 1000, 2500]), { fmt: v => 'AED ' + v }),
        price('Premium', [[null, 800], [800, 2000], [2000, null]]), tog('verified', 'Licensed insurers only', { p: 1 })
      ],
      price: () => between(350, 3200, 25), unit: () => '/year',
      title: (a, c) => `${c.name} ${a.occupancy.includes('tenant') ? 'Home Contents' : 'Home & Building'} Cover`,
      meta: a => [['home', a.ptype.join(', ')], ['check', [a.building && 'Building', a.contents && 'Contents', a.liability && 'Liability'].filter(Boolean).join(' · ') || 'Basic'], ['tag', 'AED ' + a.deductible + ' excess']] }
  ] };

  const VORDER = ['spaces', 'services', 'experiences', 'memberships', 'programs', 'insurance'];

  /* ---------- generate listings ---------- */
  const LISTINGS = [];
  VORDER.forEach(vid => V[vid].offers.forEach(off => {
    off.v = vid;
    const defMap = Object.fromEntries(off.defs.map(d => [d.id, d]));
    for (let i = 0; i < off.n; i++) {
      const a = {};
      off.defs.forEach(d => {
        const key = d.field || d.id;
        if (d.nogen || d.type === 'range' || a[key] !== undefined) return;
        if (d.gen) { a[key] = d.gen(a); return; }
        if (d.type === 'select' || d.type === 'seg') a[key] = d.many ? pickN(d.options, between(1, Math.min(d.k || 3, d.options.length))).map(x => x.v) : pick(d.options).v;
        else if (d.type === 'multi') a[key] = pickN(d.options, between(1, Math.min(d.k || 3, d.options.length))).map(x => x.v);
        else if (d.type === 'toggle') a[key] = chance(d.p != null ? d.p : .55);
        else if (d.type === 'date') a[key] = pick([0, 0, 1, 1, 2, 3, 5, 10]);
      });
      if (!a.capacity && defMap.guests && defMap.guests.field === 'capacity' && !defMap.guests.gen) a.capacity = 10;
      if (off.post) off.post(a);
      const loc = off.locs ? pick(off.locs) : pick(AREAS).id;
      const name = off.names ? pick(off.names) : null;
      const ctx = { def: id => defMap[id], areaN: areaName(loc), name };
      const bld = off.id === 'apartment' ? pick(BLD[loc]) : null;
      const pr = off.price ? off.price(a) : 100;
      const person = off.people ? pick(PEOPLE) : name || pick(PEOPLE);
      LISTINGS.push({
        v: vid, cat: off.id, loc, building: bld, a, title: off.title(a, ctx), price: Math.round(pr / (pr > 5000 ? 500 : pr > 1000 ? 50 : 5)) * (pr > 5000 ? 500 : pr > 1000 ? 50 : 5),
        img: off.img.length ? [...off.img.slice(i % off.img.length), ...off.img.slice(0, i % off.img.length)] : [],
        coverage: off.coverage ? [loc, ...pickN(AREAS.filter(x => x.id !== loc), between(4, 10)).map(x => x.id)] : null,
        rating: +(4 + rnd() * .95).toFixed(1), reviews: between(6, 900), posted: between(0, 40),
        provider: { name: person, org: off.people ? pick(off.org) : off.org[0], phone: phone(), reply: pick([5, 10, 15, 30, 60]) },
        ref: 'UN-' + between(100000, 999999), permit: off.id === 'apartment' ? '71' + between(10000000, 99999999) : null
      });
    }
  }));
  LISTINGS.forEach((l, i) => { l.id = 'L' + (1000 + i); l.featured = rnd() < .16; });

  const offerOf = (v, c) => (V[v].offers.find(x => x.id === c) || V[v].offers[0]);
  window.UP = { AREAS, areaById, areaName, LISTINGS, VERTICALS: V, VORDER, offerOf, K: n => n >= 1e6 ? (n / 1e6).toFixed(n % 1e6 ? 1 : 0) + 'M' : n >= 1000 ? Math.round(n / 1000) + 'K' : String(n) };
})();
