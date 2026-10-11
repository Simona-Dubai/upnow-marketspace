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

  const CHANNELS = [['upnow', window.SITE && SITE.chat ? 'UpNow chat & calls' : 'UpNow calls & messages', 'Built in', 1], ['wa', 'WhatsApp Business', '+971 4 555 0198', 1], ['email', 'Email', 'leasing@greenstone.ae', 1], ['phone', 'Tracked phone', '+971 4 555 0100', 1], ['ig', 'Instagram DMs', '@greenstone.ae', 1], ['bayut', 'Bayut lead import', 'Connected via email parser', 1], ['pf', 'Property Finder import', 'Connected via API', 1], ['dubizzle', 'Dubizzle lead import', 'Not connected', 0], ['google', 'Google Business messages', 'Not connected', 0]];

  const QUICK = {
    spaces: ['Share viewing slots', 'Send location pin', 'Request Emirates ID & visa', 'Payment plan options', 'Send brochure'],
    services: ['Share available slots', 'Send quote', 'Confirm arrival window', 'Ask for photos of the unit', 'Send service checklist']
  };

  // what each sample listing says, in the listing form's own fields (data/listings.js defs) — so its page reads like a
  // real provider's: description, details, amenities, more photos and the building (pw/embed.js, fromSample)
  const CONTENT = {
    S1: { building: 'Avenue Residence', permit: '7120458391', img: ['img/apt2.jpg', 'img/apt3.jpg', 'img/apt4.jpg', 'img/office1.jpg'],
      desc: 'Bright two-bedroom apartment on a high floor with full marina views from the living room and the master bedroom. Open kitchen, two full bathrooms and a balcony along the living area. Chiller-free, with covered parking for one car. Available on a yearly lease in 2 or 4 cheques.',
      a: { terms: 'yearly', ptype: ['apartment'], beds: ['2'], baths: '2', sqft: 1280, furnishing: 'unfurnished', cheques: '4', amenities: ['Balcony', 'Shared pool', 'Gym', 'Covered parking', 'Built-in wardrobes', 'Central A/C', '24h security', 'Sea view'], chiller: true } },
    S2: { building: 'Marina Gate 2', permit: '7120461177', img: ['img/apt2.jpg', 'img/apt4.jpg'],
      desc: 'Fully furnished one-bedroom in Marina Gate with a walk-in wardrobe, a second guest bathroom and a balcony over the marina walk. Ready to move in; the building has a pool, gym and direct access to the marina.',
      a: { terms: 'yearly', ptype: ['apartment'], beds: ['1'], baths: '2', sqft: 860, furnishing: 'furnished', cheques: '4', amenities: ['Balcony', 'Shared pool', 'Gym', 'Covered parking', 'Concierge', '24h security'] } },
    S3: { building: 'Frond G', permit: '9002318845', img: ['img/villa3.jpg', 'img/hotel2.jpg', 'img/apt4.jpg', 'img/villa1.jpg'],
      desc: 'Five-bedroom beach villa on the Palm with a private pool and direct beach access. Sleeps ten, with a full kitchen, a large garden and parking for three cars. Self check-in; minimum stay of three nights.',
      a: { maxGuests: '10', ptype: 'villa', beds: '5', amenities: ['Private pool', 'Beach access', 'Fast Wi-Fi', 'Full kitchen', 'Free parking', 'Sea view', 'Self check-in', 'Washer'], minNights: '3', cancellation: 'moderate' } },
    S4: { building: 'Burj Royale', permit: '9002320413', img: ['img/hotel2.jpg', 'img/apt3.jpg'],
      desc: 'Compact studio in Downtown with a direct view of Burj Khalifa and the fountain. Queen bed, kitchenette and a work desk; the building has a pool and gym. A short walk to Dubai Mall and the metro.',
      a: { maxGuests: '2', ptype: 'studio', beds: '0', amenities: ['Fast Wi-Fi', 'Self check-in', 'Washer'], minNights: '2', cancellation: 'free' } },
    S5: { building: 'Marina Rooftop, Level 42', img: ['img/venue2.jpg', 'img/venue1.jpg'],
      desc: 'Open-air rooftop on the 42nd floor with views over the marina and the Palm. Up to 120 guests standing, with an in-house catering team, a sound system and a screen for presentations. Valet parking at the entrance.',
      a: { eventType: ['corporate', 'birthday', 'launch'], capacity: '100', slots: 'evening', venueType: 'rooftop', setting: 'outdoor', catering: 'inhouse', equipment: ['AV & screen', 'Sound system', 'Lighting rig', 'Wi-Fi'], parking: 'valet' } },
    S6: { building: 'Al Quoz Industrial 3', permit: '6104472210', img: ['img/padel2.jpg', 'img/padel1.jpg'],
      desc: 'Indoor, air-conditioned panoramic padel courts in Al Quoz. Rackets and balls to rent at reception, changing rooms with showers, and coaching on request. Book by the hour, mornings to late evening.',
      a: { sport: ['padel'], slots: 'evening', setting: 'indoor', courts: '4', amenities: ['Racket / ball rental', 'Changing rooms', 'Showers', 'Coaching', 'Café', 'Parking'] } },
    S7: { building: 'Dubai Harbour Marina', img: [],
      desc: '55 ft Azimut for private charters from Dubai Harbour, with a captain and crew. Up to 18 guests, a sun deck and a swimming stop off the Palm. Soft drinks included; BBQ on board on request.',
      a: { minHours: '3', capacity: '20', length: '60', ytype: 'motor', crew: 'full', food: ['Soft drinks', 'BBQ onboard'], activities: ['Swimming stop', 'Fishing'], cancellation: 'moderate' } },
    S8: { building: 'Bay Square', permit: '7120470026', img: ['img/office2.jpg', 'img/office3.jpg'],
      desc: 'Furnished one-bedroom loft in Business Bay with double-height windows and a mezzanine bedroom. Monthly rent includes DEWA and Wi-Fi. A short walk to the Business Bay metro.',
      a: { terms: 'monthly', ptype: ['apartment'], beds: ['1'], baths: '1', sqft: 920, furnishing: 'furnished', amenities: ['Gym', 'Covered parking', 'Built-in wardrobes', 'Central A/C', 'Pets allowed'] } },
    V1: { img: ['img/clean2.jpg', 'img/clean1.jpg'],
      desc: 'Top-to-bottom deep clean for apartments and villas: kitchen degreasing, bathrooms descaled, windows, inside cupboards and the balcony. A team of two brings all supplies and equipment.',
      a: { service: 'Deep clean', frequency: 'once', ptype: 'Villa', maxBeds: '5', materials: true, team: '2', minHours: '4' } },
    V2: { img: ['img/clean1.jpg'],
      desc: 'Regular home cleaning by the hour, weekly or every two weeks, with the same cleaner each visit. Dusting, floors, kitchen and bathrooms; ironing on request.',
      a: { service: 'Regular clean', frequency: 'weekly', ptype: 'Apartment', maxBeds: '3', materials: false, team: '1', minHours: '2' } },
    V3: { img: ['img/ac2.jpg'],
      desc: 'AC servicing for split and ducted units: filters and coils cleaned, drain line flushed and gas topped up where needed. Same-day visits across Dubai when booked before noon.',
      a: { model: 'once', property: 'Apartment', maxUnits: '6', acType: ['Split', 'Ducted / central'], emergency: true, parts: 'extra', sla: '24' } },
    V4: { img: ['img/ac1.jpg'],
      desc: 'Annual AC maintenance contract with four scheduled visits a year and priority call-outs between them. Parts are included up to the contract limit.',
      a: { model: 'annual', property: 'Villa', maxUnits: '10', acType: ['Split', 'Ducted / central'], emergency: true, visits: '4', parts: 'included', sla: '4' } },
    V5: { img: ['img/salon2.jpg'],
      desc: 'Cuts and styling for women and men at our JLT salon, with three stylists. Wash, cut and blow-dry in about 45 minutes; colour by appointment.',
      a: { treatment: "Women's cut & style", slots: 'afternoon', setting: 'salon', duration: '45' } },
    V6: { img: ['img/dental2.jpg'],
      desc: 'Routine dental check-up with scaling and polishing at our Al Barsha clinic. Most major insurers accepted, with direct billing.',
      a: { treatment: 'Check-up & cleaning', slots: 'morning', clinic: 'family', insurance: ['Daman', 'AXA', 'Bupa', 'Direct billing'], language: ['English', 'Arabic', 'Hindi'] } }
  };

  return { SOURCES, V, LISTINGS, LEADS, MSGS, EVENTS, ETYPE, TEAM, DEALS, CHANNELS, QUICK, CONTENT };
})();
