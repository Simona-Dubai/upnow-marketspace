/* UpNow Provider Workspace — sample data (Spaces + Services). Subcategories mirror the marketplace (Home.html). */
window.PW = (function () {
  const SOURCES = {
    upnow: { l: 'UpNow marketplace', s: 'UpNow', c: '#136142' },
    wa: { l: 'WhatsApp Business', s: 'WhatsApp', c: '#1faa59' },
    ig: { l: 'Instagram', s: 'Instagram', c: '#b0417e' },
    email: { l: 'Email', s: 'Email', c: '#256aa5' },
    phone: { l: 'Tracked phone', s: 'Phone', c: '#b7791f' },
    bayut: { l: 'Bayut (import)', s: 'Bayut', c: '#4f7f6e' },
    pf: { l: 'Property Finder (import)', s: 'Prop. Finder', c: '#c2413b' },
    dubizzle: { l: 'Dubizzle (import)', s: 'Dubizzle', c: '#7a5a2e' },
    google: { l: 'Google Business', s: 'Google', c: '#4a6fd1' },
    referral: { l: 'Referral', s: 'Referral', c: '#6b7a72' }
  };

  const V = {
    spaces: {
      label: 'Spaces', catalogue: 'Portfolio', deals: 'Deals & bookings', unit: 'listing',
      cats: [
        { id: 'apartment', l: 'Apartment', basis: ['year', 'month'], img: 'img/apt1.jpg' },
        { id: 'holiday', l: 'Holiday stay', basis: ['night'], img: 'img/hotel1.jpg' },
        { id: 'venue', l: 'Venue', basis: ['hour', 'day'], img: 'img/venue1.jpg' },
        { id: 'padel', l: 'Padel court', basis: ['hour'], img: 'img/padel1.jpg' },
        { id: 'yacht', l: 'Yacht', basis: ['hour', 'day'], img: 'img/yacht1.jpg' }
      ],
      stages: { new: 'New', contacted: 'Contacted', viewing: 'Viewing', negotiation: 'Offer', won: 'Won', lost: 'Lost' },
      meet: 'viewing',
      funnel: [['Search impressions', 48210], ['Listing views', 6842], ['Contact actions', 714], ['Leads', 129], ['Viewings', 34], ['Won', 17]],
      kpis: [['New leads', '129', '+18%', 'up', [8, 11, 9, 14, 12, 16, 19]], ['First response', '8 min', 'Target 15', 'up', [22, 18, 16, 14, 11, 9, 8]], ['Viewings booked', '34', '+6', 'up', [3, 4, 6, 4, 5, 6, 6]], ['Won value', 'AED 486k', '17 deals', 'up', [40, 52, 48, 61, 70, 66, 84]]]
    },
    services: {
      label: 'Services', catalogue: 'Service catalogue', deals: 'Jobs', unit: 'service',
      cats: [
        { id: 'cleaning', l: 'Cleaning', basis: ['visit', 'contract'], img: 'img/clean1.jpg' },
        { id: 'ac', l: 'AC maintenance', basis: ['visit', 'year'], img: 'img/ac1.jpg' },
        { id: 'haircut', l: 'Haircut', basis: ['appointment'], img: 'img/salon1.jpg' },
        { id: 'dentist', l: 'Dentist', basis: ['consultation'], img: 'img/dental1.jpg' }
      ],
      stages: { new: 'New', contacted: 'Quoted', viewing: 'Scheduled', negotiation: 'In progress', won: 'Completed', lost: 'Lost' },
      meet: 'job',
      funnel: [['Search impressions', 31480], ['Listing views', 4120], ['Contact actions', 902], ['Requests', 214], ['Jobs scheduled', 131], ['Completed', 118]],
      kpis: [['New requests', '214', '+11%', 'up', [22, 25, 28, 26, 31, 34, 36]], ['First response', '6 min', 'Target 10', 'up', [14, 12, 11, 9, 8, 7, 6]], ['Jobs scheduled', '131', '61% of requests', 'up', [12, 15, 17, 18, 20, 22, 27]], ['Revenue', 'AED 92.4k', '118 completed', 'up', [9, 10, 12, 11, 14, 16, 20]]]
    }
  };

  const LISTINGS = [
    { id: 'S1', v: 'spaces', cat: 'apartment', t: 'Avenue Residence · 2 BR with marina view', area: 'Dubai Marina', price: 120000, basis: 'year', img: 'img/apt1.jpg', status: 'live', views: 2418, contacts: 272, leads: 61, quality: 94, units: '4 of 68 available', meta: ['2 bed', '2 bath', '1,280 sq ft'], resp: 7 },
    { id: 'S2', v: 'spaces', cat: 'apartment', t: 'Marina Gate · 1 BR furnished', area: 'Dubai Marina', price: 95000, basis: 'year', img: 'img/apt3.jpg', status: 'live', views: 1906, contacts: 210, leads: 42, quality: 81, units: '2 available', meta: ['1 bed', '2 bath', '860 sq ft'], resp: 11 },
    { id: 'S3', v: 'spaces', cat: 'holiday', t: 'Palm Jumeirah beach villa', area: 'Palm Jumeirah', price: 2400, basis: 'night', img: 'img/villa1.jpg', status: 'live', views: 1330, contacts: 96, leads: 19, quality: 88, units: '71% booked Oct', meta: ['5 bed', '10 guests', 'Private pool'], resp: 9 },
    { id: 'S4', v: 'spaces', cat: 'holiday', t: 'Downtown studio · Burj view', area: 'Downtown Dubai', price: 650, basis: 'night', img: 'img/hotel1.jpg', status: 'live', views: 988, contacts: 71, leads: 14, quality: 76, units: '84% booked Oct', meta: ['Studio', '2 guests', 'Gym + pool'], resp: 14 },
    { id: 'S5', v: 'spaces', cat: 'venue', t: 'Marina rooftop event venue', area: 'Dubai Marina', price: 1800, basis: 'hour', img: 'img/venue1.jpg', status: 'pending', views: 412, contacts: 38, leads: 7, quality: 69, units: 'Change under review', meta: ['120 guests', 'Catering', 'AV'], resp: 18 },
    { id: 'S6', v: 'spaces', cat: 'padel', t: 'Al Quoz indoor padel court', area: 'Al Quoz', price: 220, basis: 'hour', img: 'img/padel1.jpg', status: 'live', views: 764, contacts: 102, leads: 31, quality: 90, units: '62% utilised', meta: ['Indoor', 'Panoramic', 'Rackets'], resp: 5 },
    { id: 'S7', v: 'spaces', cat: 'yacht', t: '55 ft Azimut · crewed charter', area: 'Dubai Harbour', price: 1200, basis: 'hour', img: 'img/yacht1.jpg', status: 'draft', views: 0, contacts: 0, leads: 0, quality: 48, units: 'Photos missing', meta: ['55 ft', '18 guests', 'Crew'], resp: 0 },
    { id: 'S8', v: 'spaces', cat: 'apartment', t: 'Business Bay loft · monthly', area: 'Business Bay', price: 11500, basis: 'month', img: 'img/loft1.jpg', status: 'paused', views: 540, contacts: 44, leads: 9, quality: 72, units: 'Under restoration', meta: ['1 bed', 'Loft', 'Furnished'], resp: 16 },
    { id: 'V1', v: 'services', cat: 'cleaning', t: 'Deep cleaning · apartments & villas', area: 'All Dubai', price: 450, basis: 'visit', img: 'img/clean1.jpg', status: 'live', views: 1640, contacts: 318, leads: 88, quality: 93, units: '3 teams · 24 slots/wk', meta: ['4–6 hrs', '2 cleaners', 'Supplies incl.'], resp: 4 },
    { id: 'V2', v: 'services', cat: 'cleaning', t: 'Regular home cleaning', area: 'Marina · JLT · JBR', price: 45, basis: 'hour', img: 'img/clean2.jpg', status: 'live', views: 1210, contacts: 204, leads: 51, quality: 85, units: 'Weekly · bi-weekly', meta: ['From 2 hrs', '1 cleaner'], resp: 6 },
    { id: 'V3', v: 'services', cat: 'ac', t: 'AC servicing & gas top-up', area: 'All Dubai', price: 149, basis: 'visit', img: 'img/ac1.jpg', status: 'live', views: 980, contacts: 176, leads: 42, quality: 89, units: '2 technicians', meta: ['Split & ducted', 'Same day'], resp: 7 },
    { id: 'V4', v: 'services', cat: 'ac', t: 'AC annual maintenance contract', area: 'All Dubai', price: 899, basis: 'year', img: 'img/ac2.jpg', status: 'pending', views: 120, contacts: 18, leads: 4, quality: 74, units: 'Change under review', meta: ['4 visits', 'Priority call-out'], resp: 12 },
    { id: 'V5', v: 'services', cat: 'haircut', t: 'Salon cut & styling', area: 'JLT', price: 120, basis: 'appointment', img: 'img/salon1.jpg', status: 'live', views: 612, contacts: 131, leads: 22, quality: 82, units: '3 stylists', meta: ['45 min', 'Women & men'], resp: 9 },
    { id: 'V6', v: 'services', cat: 'dentist', t: 'Dental check-up & cleaning', area: 'Al Barsha', price: 350, basis: 'consultation', img: 'img/dental1.jpg', status: 'draft', views: 0, contacts: 0, leads: 0, quality: 52, units: 'Licence upload needed', meta: ['40 min', 'Insurance'], resp: 0 }
  ];

  const LEADS = [
    { id: 'L1', v: 'spaces', n: 'Aisha Al Mansoori', src: 'upnow', lst: 'S1', stage: 'viewing', ago: 12, msg: 'Viewing requested for Tuesday 10 AM. Moving from Abu Dhabi.', val: 120000, heat: 'hot', owner: 'Ahmed', budget: 'AED 110–125k / yr', when: 'Move-in 1 Nov', phone: '+971 50 118 2204' },
    { id: 'L2', v: 'spaces', n: 'Nadia Khan', src: 'ig', lst: 'S2', stage: 'new', ago: 22, msg: 'Is the one-bedroom still available? Can I see it this week?', val: 95000, heat: 'hot', owner: '—', budget: 'AED 90–100k / yr', when: 'Move-in ASAP', phone: '+971 55 402 8811' },
    { id: 'L3', v: 'spaces', n: 'Omar Hassan', src: 'wa', lst: 'S1', stage: 'negotiation', ago: 64, msg: 'Can we do 4 cheques instead of 2? Happy to sign this week.', val: 118000, heat: 'hot', owner: 'Ahmed', budget: 'AED 118k offer', when: 'Move-in 15 Oct', phone: '+971 52 771 0930' },
    { id: 'L4', v: 'spaces', n: 'James Porter', src: 'bayut', lst: 'S3', stage: 'new', ago: 18, msg: 'Dates 12–16 Oct for 6 guests. Is early check-in possible?', val: 9600, heat: 'warm', owner: '—', budget: '4 nights', when: '12–16 Oct', phone: '+44 7700 900441' },
    { id: 'L5', v: 'spaces', n: 'Priya Menon', src: 'pf', lst: 'S8', stage: 'contacted', ago: 190, msg: 'Interested in 3 months from November. Is parking included?', val: 34500, heat: 'warm', owner: 'Sara', budget: 'AED 11–12k / mo', when: 'From 1 Nov', phone: '+971 50 993 1204' },
    { id: 'L6', v: 'spaces', n: 'Hassan Ali', src: 'email', lst: 'S5', stage: 'contacted', ago: 260, msg: 'Corporate dinner for 80 guests on 22 Oct, 7–11 PM. Please send a quote.', val: 7200, heat: 'warm', owner: 'Sara', budget: 'AED 8k', when: '22 Oct', phone: '+971 4 330 1180' },
    { id: 'L7', v: 'spaces', n: 'Khalfan Saeed', src: 'dubizzle', lst: 'S1', stage: 'new', ago: 4, msg: 'Family of four — is a 2 BR on a high floor available?', val: 120000, heat: 'warm', owner: '—', budget: 'AED 120k / yr', when: 'Move-in Dec', phone: '+971 56 200 4417' },
    { id: 'L8', v: 'spaces', n: 'Fatima Noor', src: 'upnow', lst: 'S2', stage: 'viewing', ago: 320, msg: 'Confirmed viewing Tuesday 11:30.', val: 95000, heat: 'warm', owner: 'Ahmed', budget: 'AED 95k / yr', when: 'Move-in 1 Nov', phone: '+971 50 661 2290' },
    { id: 'L9', v: 'spaces', n: 'Layla Rahman', src: 'phone', lst: 'S2', stage: 'negotiation', ago: 1440, msg: 'Viewing done. Sending documents tonight.', val: 95000, heat: 'hot', owner: 'Ahmed', budget: 'AED 95k / yr', when: 'Move-in 10 Oct', phone: '+971 55 118 7702' },
    { id: 'L10', v: 'spaces', n: 'Sofia Rossi', src: 'upnow', lst: 'S4', stage: 'won', ago: 2880, msg: 'Booking confirmed · 29 Sep – 3 Oct.', val: 2600, heat: 'cold', owner: 'Sara', budget: '4 nights', when: 'Check-in today', phone: '+39 347 111 2020' },
    { id: 'L11', v: 'spaces', n: 'Mei Lin', src: 'upnow', lst: 'S6', stage: 'won', ago: 1600, msg: 'Weekly Saturday court 6–8 PM for 3 months.', val: 5280, heat: 'cold', owner: 'Sara', budget: 'Recurring', when: 'Saturdays', phone: '+971 58 440 9921' },
    { id: 'L12', v: 'spaces', n: 'Daniel Brooks', src: 'wa', lst: 'S7', stage: 'lost', ago: 4300, msg: 'Went with another charter — price.', val: 4800, heat: 'cold', owner: 'Sara', budget: '4 hrs', when: '—', phone: '+971 50 333 1180', lost: 'Price' },
    { id: 'L13', v: 'services', n: 'Rania Haddad', src: 'upnow', lst: 'V1', stage: 'new', ago: 9, msg: 'Move-out deep clean for a 2 BR on Friday morning.', val: 650, heat: 'hot', owner: '—', budget: '2 BR · move-out', when: 'Fri 2 Oct', phone: '+971 50 220 1893' },
    { id: 'L14', v: 'services', n: 'Arjun Patel', src: 'upnow', lst: 'V4', stage: 'new', ago: 26, msg: 'Need an annual contract for a 4 BR villa, 6 split units.', val: 1800, heat: 'hot', owner: '—', budget: '6 units', when: 'Start Oct', phone: '+971 52 118 4402' },
    { id: 'L15', v: 'services', n: 'Tom Evans', src: 'wa', lst: 'V3', stage: 'contacted', ago: 95, msg: 'Quote received — can the technician come after 5 PM?', val: 447, heat: 'warm', owner: 'Rashid', budget: '3 units', when: 'This week', phone: '+971 55 710 3300' },
    { id: 'L16', v: 'services', n: 'Grace Kim', src: 'email', lst: 'V2', stage: 'contacted', ago: 300, msg: 'Weekly cleaning, 3 hours, Wednesdays.', val: 540, heat: 'warm', owner: 'Maria', budget: '3 hrs / wk', when: 'Weekly', phone: '+971 50 882 0021' },
    { id: 'L17', v: 'services', n: 'Mariam Khoury', src: 'google', lst: 'V5', stage: 'viewing', ago: 700, msg: 'Booked Wednesday 1 PM with Lina.', val: 120, heat: 'warm', owner: 'Lina', budget: 'Cut & blow-dry', when: 'Wed 1 PM', phone: '+971 56 771 0022' },
    { id: 'L18', v: 'services', n: 'Elena Petrova', src: 'ig', lst: 'V5', stage: 'viewing', ago: 820, msg: 'Thursday 4 PM please.', val: 180, heat: 'cold', owner: 'Lina', budget: 'Colour + cut', when: 'Thu 4 PM', phone: '+971 58 110 2203' },
    { id: 'L19', v: 'services', n: 'Hamdan Villa', src: 'referral', lst: 'V1', stage: 'negotiation', ago: 180, msg: 'Team on site — deep clean in progress.', val: 900, heat: 'warm', owner: 'Maria', budget: '5 BR villa', when: 'Today', phone: '+971 50 400 1188' },
    { id: 'L20', v: 'services', n: 'Yousef Darwish', src: 'phone', lst: 'V3', stage: 'won', ago: 1500, msg: 'Service completed. 5-star review left.', val: 298, heat: 'cold', owner: 'Rashid', budget: '2 units', when: 'Done', phone: '+971 52 221 7781' },
    { id: 'L21', v: 'services', n: 'Ahmed Salem', src: 'referral', lst: 'V3', stage: 'lost', ago: 3000, msg: 'Chose a cheaper provider.', val: 149, heat: 'cold', owner: 'Rashid', budget: '1 unit', when: '—', phone: '+971 50 118 1100', lost: 'Price' }
  ];

  const MSGS = {
    L1: [['in', 'Hi, I saw Avenue Residence on UpNow. Is the 2 BR with marina view still available?', '09:41'], ['out', 'Hi Aisha — yes, 4 units are available. Floors 12, 18, 22 and 31.', '09:46'], ['in', 'Could I view on Tuesday at 10 AM? Moving from Abu Dhabi.', '09:52'], ['sys', 'Viewing booked · Tue 29 Sep, 10:00 · Ahmed assigned', '09:55']],
    L2: [['in', 'Is the one-bedroom still available? Can I see it this week?', '10:14']],
    L3: [['in', 'We viewed on Saturday and love it.', 'Yesterday'], ['out', 'Great to hear, Omar. The asking rent is AED 120k in 2 cheques.', 'Yesterday'], ['in', 'Can we do 4 cheques instead of 2? Happy to sign this week.', '09:22']],
    L4: [['in', 'Dates 12–16 Oct for 6 guests. Is early check-in possible?', '10:18']],
    L13: [['in', 'Move-out deep clean for a 2 BR on Friday morning. How long does it take?', '10:27']],
    L14: [['in', 'Need an annual contract for a 4 BR villa, 6 split units. What is included?', '10:10']],
    L15: [['out', 'Quote: 3 split units · AED 447 incl. VAT.', '08:30'], ['in', 'Quote received — can the technician come after 5 PM?', '08:55']]
  };

  // week of Mon 28 Sep 2026 — day 0..6, today = 1 (Tue 29)
  const EVENTS = [
    { id: 'E1', v: 'spaces', d: 1, s: 10, e: 11, type: 'viewing', t: 'Viewing · Aisha Al Mansoori', where: 'Avenue Residence · A-1204', who: 'Ahmed', lead: 'L1' },
    { id: 'E2', v: 'spaces', d: 1, s: 11.5, e: 12.25, type: 'viewing', t: 'Viewing · Fatima Noor', where: 'Marina Gate · 1807', who: 'Ahmed', lead: 'L8' },
    { id: 'E3', v: 'spaces', d: 1, s: 14, e: 15, type: 'inspection', t: 'Move-out inspection', where: 'Avenue Residence · B-0602', who: 'Sara' },
    { id: 'E4', v: 'spaces', d: 1, s: 16, e: 16.5, type: 'call', t: 'Call · Omar Hassan · cheques', where: 'Phone', who: 'Ahmed', lead: 'L3' },
    { id: 'E5', v: 'spaces', d: 1, s: 15, e: 16, type: 'checkin', t: 'Check-in · Sofia Rossi', where: 'Downtown studio', who: 'Self check-in', lead: 'L10' },
    { id: 'E6', v: 'spaces', d: 0, s: 9.5, e: 10.5, type: 'inspection', t: 'Quarterly inspection', where: 'Avenue Warehouse', who: 'Sara' },
    { id: 'E7', v: 'spaces', d: 2, s: 9, e: 10, type: 'handover', t: 'Key handover · Layla Rahman', where: 'Marina Gate · 1807', who: 'Ahmed', lead: 'L9' },
    { id: 'E8', v: 'spaces', d: 2, s: 13, e: 14, type: 'viewing', t: 'Site visit · Hassan Ali', where: 'Marina rooftop venue', who: 'Sara', lead: 'L6' },
    { id: 'E9', v: 'spaces', d: 3, s: 11, e: 12, type: 'viewing', t: 'Viewing · open slot', where: 'Marina Gate', who: 'Ahmed' },
    { id: 'E10', v: 'spaces', d: 3, s: 15, e: 17, type: 'inspection', t: 'AC maintenance · vendor', where: 'Avenue Residence · A-0803', who: 'CoolTech' },
    { id: 'E11', v: 'spaces', d: 4, s: 10, e: 12, type: 'handover', t: 'Photo shoot · beach villa', where: 'Palm Jumeirah', who: 'Sara' },
    { id: 'E12', v: 'spaces', d: 5, s: 18, e: 20, type: 'checkin', t: 'Court booking · Mei Lin', where: 'Al Quoz padel', who: 'Recurring' , lead: 'L11'},
    { id: 'E13', v: 'spaces', d: 5, s: 11, e: 12, type: 'viewing', t: 'Open house', where: 'Avenue Residence', who: 'Ahmed + Sara' },
    { id: 'E14', v: 'spaces', d: 3, s: 12, e: 13, type: 'checkout', t: 'Check-out · Sofia Rossi', where: 'Downtown studio', who: 'Housekeeping', lead: 'L10' },
    { id: 'J1', v: 'services', d: 1, s: 9, e: 13, type: 'job', t: 'Deep clean · Hamdan Villa', where: 'Arabian Ranches', who: 'Team A · Maria', lead: 'L19' },
    { id: 'J2', v: 'services', d: 1, s: 14, e: 15, type: 'job', t: 'AC service · 2 units', where: 'JLT Cluster V', who: 'Rashid' },
    { id: 'J3', v: 'services', d: 1, s: 17, e: 18.5, type: 'job', t: 'AC service · Tom Evans', where: 'Dubai Marina', who: 'Rashid', lead: 'L15' },
    { id: 'J4', v: 'services', d: 2, s: 13, e: 14, type: 'appt', t: 'Cut & blow-dry · Mariam', where: 'JLT salon', who: 'Lina', lead: 'L17' },
    { id: 'J5', v: 'services', d: 2, s: 8, e: 11, type: 'job', t: 'Regular clean · weekly', where: 'JBR · Sadaf 4', who: 'Team B' },
    { id: 'J6', v: 'services', d: 3, s: 16, e: 17.5, type: 'appt', t: 'Colour + cut · Elena', where: 'JLT salon', who: 'Lina', lead: 'L18' },
    { id: 'J7', v: 'services', d: 4, s: 9, e: 13, type: 'job', t: 'Move-out deep clean (hold)', where: 'Dubai Marina', who: 'Team A', lead: 'L13' },
    { id: 'J8', v: 'services', d: 0, s: 10, e: 11, type: 'inspection', t: 'AMC site survey', where: 'Mirdif villa', who: 'Rashid' },
    { id: 'J9', v: 'services', d: 3, s: 10, e: 12, type: 'job', t: 'AC duct cleaning', where: 'Business Bay office', who: 'Rashid + 1' },
    { id: 'J10', v: 'services', d: 5, s: 10, e: 14, type: 'job', t: 'Deep clean · 3 BR', where: 'Dubai Hills', who: 'Team A' }
  ];
  const ETYPE = {
    viewing: ['Viewing', '#136142', '#e2f2e9'], inspection: ['Inspection', '#9a6515', '#f8eedb'], handover: ['Handover', '#256aa5', '#e3eef8'],
    call: ['Call', '#46534c', '#eceeed'], checkin: ['Check-in / booking', '#7d4a9e', '#f1e8f6'], checkout: ['Check-out', '#7d4a9e', '#f1e8f6'],
    job: ['On-site job', '#136142', '#e2f2e9'], appt: ['Appointment', '#256aa5', '#e3eef8']
  };

  const TEAM = {
    spaces: [['Khalid Baalfalasi', 'Owner', 'All', '—', 'Online'], ['Ahmed Karim', 'Leasing manager', 'Marina · Downtown', '7 min', 'On viewing'], ['Sara Idris', 'Operations', 'Stays · venues', '11 min', 'Online'], ['CoolTech LLC', 'Vendor · AC', 'Avenue Residence', '—', 'Contract']],
    services: [['Khalid Baalfalasi', 'Owner', 'All', '—', 'Online'], ['Maria Santos', 'Cleaning lead · Team A', 'Marina · Ranches', '5 min', 'On job'], ['Rashid Omar', 'AC technician', 'All Dubai', '8 min', 'On job'], ['Lina Farah', 'Senior stylist', 'JLT salon', '9 min', 'Online']]
  };

  const DEALS = {
    spaces: [['AGR-2091', 'Aisha Al Mansoori', 'Avenue Residence · A-1204', 'Lease', 'AED 120,000 / yr', 3, ['Viewing', 'Application', 'KYC', 'Offer', 'Contract', 'Payment', 'Handover']], ['AGR-2084', 'Layla Rahman', 'Marina Gate · 1807', 'Lease', 'AED 95,000 / yr', 5, ['Viewing', 'Application', 'KYC', 'Offer', 'Contract', 'Payment', 'Handover']], ['BKG-7710', 'Sofia Rossi', 'Downtown studio', 'Stay', 'AED 2,600', 3, ['Reserved', 'Paid', 'Check-in', 'Stay', 'Check-out']], ['BKG-7702', 'Mei Lin', 'Al Quoz padel court', 'Recurring booking', 'AED 5,280', 2, ['Booked', 'Paid', 'Active', 'Completed']], ['QTE-0311', 'Hassan Ali', 'Marina rooftop venue', 'Event quote', 'AED 7,200', 0, ['Quote', 'Deposit', 'Preparation', 'Event', 'Settlement']]],
    services: [['JOB-5521', 'Hamdan Villa', 'Deep cleaning · 5 BR', 'One-time', 'AED 900', 3, ['Request', 'Quote', 'Scheduled', 'On site', 'Report', 'Paid']], ['JOB-5519', 'Tom Evans', 'AC servicing · 3 units', 'One-time', 'AED 447', 1, ['Request', 'Quote', 'Scheduled', 'On site', 'Report', 'Paid']], ['AMC-0092', 'Arjun Patel', 'AC annual contract', 'Contract', 'AED 1,800 / yr', 0, ['Survey', 'Quote', 'Signed', 'Visit 1', 'Visit 2', 'Renewal']], ['APT-3301', 'Mariam Khoury', 'Salon cut & styling', 'Appointment', 'AED 120', 2, ['Booked', 'Reminded', 'Arrived', 'Paid']], ['JOB-5490', 'Yousef Darwish', 'AC servicing · 2 units', 'One-time', 'AED 298', 5, ['Request', 'Quote', 'Scheduled', 'On site', 'Report', 'Paid']]]
  };

  const CHANNELS = [['upnow', 'UpNow chat & calls', 'Built in', 1], ['wa', 'WhatsApp Business', '+971 4 555 0198', 1], ['email', 'Email', 'leasing@greenstone.ae', 1], ['phone', 'Tracked phone', '+971 4 555 0100', 1], ['ig', 'Instagram DMs', '@greenstone.ae', 1], ['bayut', 'Bayut lead import', 'Connected via email parser', 1], ['pf', 'Property Finder import', 'Connected via API', 1], ['dubizzle', 'Dubizzle lead import', 'Not connected', 0], ['google', 'Google Business messages', 'Not connected', 0]];

  const QUICK = {
    spaces: ['Share viewing slots', 'Send location pin', 'Request Emirates ID & visa', 'Payment plan options', 'Send brochure'],
    services: ['Share available slots', 'Send quote', 'Confirm arrival window', 'Ask for photos of the unit', 'Send service checklist']
  };

  return { SOURCES, V, LISTINGS, LEADS, MSGS, EVENTS, ETYPE, TEAM, DEALS, CHANNELS, QUICK };
})();
