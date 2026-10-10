/* Communications (unified inbox) + Calendar */
(function () {
  const { ico, esc, av, aed, ago, hm, st, S, save, leads, listingById, events, VX, catLabel, toast, modal, closeModal, go, render, pop, closePop } = PWA;
  const SRC = PW.SOURCES;
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  /* ============ INBOX ============ */
  const threadsFor = () => leads().filter(l => S.inboxCh === 'all' || l.src === S.inboxCh || (S.inboxCh === 'unread' && l.stage === 'new' && !S.read[l.id]) || (S.inboxCh === 'mine' && l.owner === 'Khalid'))
    .filter(l => S.inboxFilter === 'all' || (S.inboxFilter === 'open' ? !['won', 'lost'].includes(l.stage) : ['won', 'lost'].includes(l.stage)))
    .sort((a, b) => lastAgo(a) - lastAgo(b));
  const lastAgo = l => (S.sent[l.id] && S.sent[l.id].length) ? 0 : l.ago;
  const msgsOf = l => (PW.MSGS[l.id] || [['in', l.msg, ago(l.ago) + ' ago']]).concat(S.sent[l.id] || []);

  PWA.pages.inbox = () => {
    const L = leads();
    const chs = ['upnow', 'wa', 'email', 'phone', 'ig', 'bayut', 'pf', 'dubizzle', 'google', 'referral'].filter(k => L.some(l => l.src === k));
    const T = threadsFor();
    if (!S.thread || !L.find(l => l.id === S.thread)) S.thread = (T[0] || L[0]).id;
    const l = L.find(x => x.id === S.thread);
    const li = listingById(l.lst);
    const X = VX();
    return `<div class="ibx">
      <aside class="ich"><h1>Inbox</h1>
        ${[['all', 'All conversations', L.length], ['unread', 'Awaiting reply', L.filter(l => l.stage === 'new' && !S.read[l.id]).length], ['mine', 'Assigned to me', L.filter(l => l.owner === 'Khalid').length]].map(([k, n, c]) => `<a class="${S.inboxCh === k ? 'on' : ''}" data-act="inboxCh" data-arg="${k}">${ico(k === 'all' ? 'inbox' : k === 'unread' ? 'clock' : 'users')}${n}<span class="n">${c}</span></a>`).join('')}
        <div class="gl">Channels</div>
        ${chs.map(k => `<a class="${S.inboxCh === k ? 'on' : ''}" data-act="inboxCh" data-arg="${k}"><i style="--c:${SRC[k].c}"></i>${esc(SRC[k].s)}<span class="n">${L.filter(l => l.src === k).length}</span></a>`).join('')}
        <div class="gl">Not connected</div>
        ${PW.CHANNELS.filter(c => !c[3] && !S.chOn[c[0]]).map(c => `<a data-act="chConnect" data-arg="${c[0]}" style="color:var(--ink3)"><i style="--c:var(--line2)"></i>${esc(SRC[c[0]].s)}<span class="n" style="color:var(--g7)">Connect</span></a>`).join('')}
      </aside>
      <section class="ith"><div class="hd"><div class="seg" style="width:100%">${[['open', 'Open'], ['closed', 'Closed'], ['all', 'All']].map(([k, n]) => `<button style="flex:1;justify-content:center" class="${S.inboxFilter === k ? 'on' : ''}" data-act="inboxFilter" data-arg="${k}">${n}</button>`).join('')}</div></div>
        <div class="ls">${T.map(t => { const m = msgsOf(t); const last = m[m.length - 1]; const un = t.stage === 'new' && !S.read[t.id]; const late = un && t.ago > 15; const tli = listingById(t.lst); return `<div class="th ${t.id === S.thread ? 'on' : ''} ${un ? 'un' : ''}" data-act="thread" data-arg="${t.id}">${av(t.n)}<div class="bd"><div class="r1"><b>${esc(t.n)}</b><time>${lastAgo(t) ? ago(t.ago) : 'now'}</time></div><small>${PWA.srcTag(t.src)} · ${esc(tli ? tli.t : '')}</small><p>${last[0] === 'out' ? 'You: ' : ''}${esc(last[1])}</p>${late ? `<span class="sla">⏱ ${ago(t.ago)} — past 15-min target</span>` : ''}</div></div>`; }).join('') || '<div class="empty">No conversations</div>'}</div></section>
      <section class="cv"><div class="hd">${av(l.n)}<div><b>${esc(l.n)}</b><small>${PWA.srcTag(l.src)} · ${esc(l.phone)}</small></div><span class="sp"></span>
          ${st(X.stages[l.stage], l.stage === 'new' ? 'info' : '')}
          <button class="btn btn-o btn-sm" data-act="call" data-arg="${l.id}">${ico('phone')}Call</button><button class="btn btn-o btn-sm" data-act="newEvent" data-arg="${l.id}">${ico('cal')}Schedule</button><button class="btn btn-o btn-sm" data-act="openLead" data-arg="${l.id}">Lead</button></div>
        <div class="msgs" id="msgs">${msgsOf(l).map(m => `<div class="bb ${m[0]}">${m[0] === 'note' ? '<b style="font-size:11px">Internal note · </b>' : ''}${esc(m[1])}<small>${esc(m[2])}${m[0] === 'out' ? ' · via ' + SRC[l.src].s : ''}</small></div>`).join('')}</div>
        <div class="qr">${PW.QUICK[S.v].map(q => `<button data-act="quick" data-arg="${esc(q)}">${esc(q)}</button>`).join('')}<button data-act="aiDraft" style="border-color:var(--g5);color:var(--g8)">${ico('zap')} Draft reply</button></div>
        <div class="cmp"><div class="mode"><button class="${S.cmode !== 'note' ? 'on' : ''}" data-act="cmode" data-arg="reply">Reply via ${esc(SRC[l.src].s)}</button><button class="note ${S.cmode === 'note' ? 'on' : ''}" data-act="cmode" data-arg="note">Internal note</button></div>
          <div class="box"><textarea id="cmpt" placeholder="${S.cmode === 'note' ? 'Only your team sees this…' : 'Write a reply… (Enter to send)'}"></textarea><button class="btn btn-g" data-act="send" data-arg="${l.id}">${ico('send')}Send</button></div></div>
      </section>
      <aside class="ctx"><div class="pn-h" style="margin-bottom:6px"><h2>Lead details</h2></div>
        <div class="kv" style="grid-template-columns:1fr;margin-top:6px"><div><span>Budget</span><b>${esc(l.budget)}</b></div><div><span>Timing</span><b>${esc(l.when)}</b></div><div><span>Owner</span><b>${esc(l.owner)}</b></div><div><span>Value</span><b>${aed(l.val)}</b></div></div>
        ${li ? `<div class="sect-t">Enquired about</div><div class="lp" data-act="openListing" data-arg="${li.id}" style="cursor:pointer"><img src="${li.img}" alt=""><div><b>${esc(li.t)}</b><small>${esc(catLabel(li.cat))} · ${aed(li.price)} / ${li.basis}</small></div></div>` : ''}
        <div class="sect-t">Move to stage</div><div class="chipset">${['contacted', 'viewing', 'negotiation', 'won'].map(k => `<button class="chip ${l.stage === k ? 'on' : ''}" style="height:30px;font-size:12px" data-act="stageI" data-arg="${l.id}|${k}">${esc(X.stages[k])}</button>`).join('')}</div>
      </aside></div>`;
  };
  PWA.after.inbox = () => { const m = PWA.$('#msgs'); if (m) m.scrollTop = m.scrollHeight; const t = PWA.$('#cmpt'); if (t) t.onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); PWA.acts.send(S.thread); } }; };
  PWA.acts.inboxCh = k => { S.inboxCh = k; S.thread = null; save(); render(); };
  PWA.acts.inboxFilter = k => { S.inboxFilter = k; S.thread = null; save(); render(); };
  PWA.acts.thread = id => { S.thread = id; S.read[id] = 1; save(); render(); };
  PWA.acts.cmode = k => { S.cmode = k; save(); render(); };
  PWA.acts.quick = q => { const t = PWA.$('#cmpt'); const l = leads().find(x => x.id === S.thread); const first = l.n.split(' ')[0];
    const map = { 'Share viewing slots': `Hi ${first}, I can show you the unit Tue 4 PM, Wed 11 AM or Thu 6 PM. Which works best?`, 'Send location pin': `Here is the building location: maps.upnow.ae/greenstone-avenue — parking is at B1 visitor bays.`, 'Request Emirates ID & visa': `To prepare your application, please upload your Emirates ID, passport and visa via your UpNow account.`, 'Payment plan options': `We can offer 1, 2 or 4 cheques. 4 cheques adds 3% to the annual rent.`, 'Send brochure': `Sharing the brochure with floor plans and amenities now.`, 'Share available slots': `Hi ${first}, we have Thu 9 AM, Fri 9 AM or Sat 2 PM available. Which suits you?`, 'Send quote': `Your quote: ${aed(l.val)} incl. VAT. Materials and supplies included.`, 'Confirm arrival window': `Our team will arrive between 9:00 and 9:30 AM. We will message when on the way.`, 'Ask for photos of the unit': `Could you share a photo of the units/area? It helps us bring the right equipment.`, 'Send service checklist': `Sharing our service checklist so you know exactly what is covered.` };
    t.value = map[q] || q; t.focus(); };
  PWA.acts.aiDraft = async () => { const t = PWA.$('#cmpt'); const l = leads().find(x => x.id === S.thread); const li = listingById(l.lst); t.value = 'Drafting…';
    try { const r = await window.genspark.complete(`You are a friendly Dubai ${S.v === 'spaces' ? 'leasing agent' : 'service coordinator'} at Greenstone. Write a short WhatsApp-style reply (max 45 words, no emojis, no sign-off) to ${l.n} who wrote: "${msgsOf(l).filter(m => m[0] === 'in').pop()[1]}". Listing: ${li.t}, ${aed(li.price)} per ${li.basis}. Offer a concrete next step.`); t.value = r.trim(); }
    catch (e) { t.value = `Hi ${l.n.split(' ')[0]}, thanks for reaching out about ${li.t}. It's available — would you like to ${S.v === 'spaces' ? 'view it this week' : 'book a slot this week'}? I can share times now.`; } };
  PWA.acts.send = id => { const t = PWA.$('#cmpt'); const v = t.value.trim(); if (!v) return; const now = new Date(); const tm = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
    (S.sent[id] = S.sent[id] || []).push([S.cmode === 'note' ? 'note' : 'out', v, tm]); S.read[id] = 1;
    const l = PW.LEADS.find(x => x.id === id); if (S.cmode !== 'note' && (S.stages[id] || l.stage) === 'new') S.stages[id] = 'contacted';
    save(); render(); toast(S.cmode === 'note' ? 'Note added' : 'Sent via ' + SRC[l.src].s); };
  PWA.acts.stageI = a => { const [id, k] = a.split('|'); S.stages[id] = k; save(); render(); toast('Stage → ' + VX().stages[k]); if (k === 'viewing') setTimeout(() => PWA.acts.newEvent(id), 250); };

  /* ============ CALENDAR ============ */
  const H0 = 8, H1 = 21, RH = 52;
  PWA.pages.calendar = () => {
    const E = events().filter(e => !S.calOff.includes(e.type));
    const types = [...new Set(events().map(e => e.type))];
    const today = events().filter(e => e.d === 1).sort((a, b) => a.s - b.s);
    const upcoming = events().filter(e => e.d >= 1).sort((a, b) => a.d - b.d || a.s - b.s);
    const head = `<div class="ph"><div><h1>Calendar</h1><p>${S.v === 'spaces' ? 'Viewings, check-ins, handovers and inspections' : 'Jobs, appointments and site surveys'} across your team.</p></div><span class="sp"></span>
      <div class="acts"><button class="btn btn-o btn-sm" data-act="calToday">Today</button><div class="seg">${[['week', 'Week'], ['agenda', 'Agenda']].map(([k, n]) => `<button class="${S.calView === k ? 'on' : ''}" data-act="calView" data-arg="${k}">${n}</button>`).join('')}</div><button class="btn btn-g btn-sm" data-act="newEvent">${ico('plus')}New ${VX().meet}</button></div></div>
      <div class="fbar"><b style="font-size:14px">28 Sep – 4 Oct 2026</b><span class="sp"></span><div class="lg">${types.map(t => `<span class="${S.calOff.includes(t) ? 'off' : ''}" data-act="calType" data-arg="${t}"><i style="--c:${PW.ETYPE[t][1]}"></i>${PW.ETYPE[t][0]} <span style="color:var(--ink3)">${events().filter(e => e.type === t).length}</span></span>`).join('')}</div></div>`;
    const side = `<aside><section class="pn"><div class="pn-h"><h2>September 2026</h2></div><div class="mcal">${DAYS.map(d => `<span class="h">${d[0]}</span>`).join('')}${Array.from({ length: 35 }, (_, i) => { const d = i - 0; const n = d + 1; const inM = n >= 1 && n <= 30; const lab = inM ? n : n - 30; const wk = n >= 28 && n <= 34; const td = n === 29; const hasE = [28, 29, 30, 31, 32, 33].includes(n); return `<span class="${inM || n > 30 ? '' : 'o'} ${n > 30 ? 'o' : ''} ${wk && !td ? 'wk' : ''} ${td ? 'td' : ''} ${hasE ? 'e' : ''}">${lab}</span>`; }).join('')}</div></section>
      <section class="pn mt"><div class="pn-h"><h2>Up next</h2><span class="sub">Today</span></div><div class="nx">${today.map(e => `<div class="r" style="grid-template-columns:52px 4px 1fr" data-act="openEvent" data-arg="${e.id}"><div class="tm">${hm(e.s)}</div><i class="bar" style="--c:${PW.ETYPE[e.type][1]}"></i><div><b>${esc(e.t)}</b><small>${esc(e.who)}</small></div></div>`).join('')}</div></section>
      <section class="pn mt"><div class="pn-h"><h2>Team load today</h2></div>${PW.TEAM[S.v].slice(1).map(t => { const n = today.filter(e => e.who.includes(t[0].split(' ')[0])).length; return `<div class="ar">${av(t[0], 'sm')}<div class="bd"><b>${esc(t[0])}</b><small>${esc(t[1])}</small></div><b>${n}</b></div>`; }).join('')}</section></aside>`;
    if (S.calView === 'agenda') return head + `<div class="calg"><section class="pn agenda">${[1, 2, 3, 4, 5, 6].map(d => { const es = upcoming.filter(e => e.d === d && !S.calOff.includes(e.type)); return es.length ? `<div class="dg">${DAYS[d]} ${28 + d > 30 ? (28 + d - 30) + ' Oct' : (28 + d) + ' Sep'}${d === 1 ? ' · Today' : ''}</div><div class="nx">${es.map(e => `<div class="r" data-act="openEvent" data-arg="${e.id}"><div class="tm">${hm(e.s)}<small>${hm(e.e)}</small></div><i class="bar" style="--c:${PW.ETYPE[e.type][1]}"></i><div><b>${esc(e.t)}</b><small>${esc(e.where)} · ${esc(e.who)}</small></div>${st(PW.ETYPE[e.type][0], 'mute')}</div>`).join('')}</div>` : ''; }).join('')}</section>${side}</div>`;
    const hrs = Array.from({ length: H1 - H0 }, (_, i) => `<div>${hm(H0 + i)}</div>`).join('');
    const nowY = (10.6 - H0) * RH;
    return head + `<div class="calg"><div class="calw" style="max-height:calc(100vh - 250px);overflow:auto;display:grid"><div class="dh" style="border-left:0"></div>${DAYS.map((d, i) => `<div class="dh ${i === 1 ? 'td' : ''}"><small>${d}</small><b>${28 + i > 30 ? 28 + i - 30 : 28 + i}</b></div>`).join('')}
      <div class="hrs" style="height:${(H1 - H0) * RH}px">${hrs}</div>
      ${DAYS.map((d, i) => `<div class="col ${i === 1 ? 'td' : ''}" data-day="${i}" style="height:${(H1 - H0) * RH}px">${i === 1 ? `<div class="nowl" style="top:${nowY}px"></div>` : ''}${E.filter(e => e.d === i).map(e => { const T = PW.ETYPE[e.type]; const top = (e.s - H0) * RH, h = Math.max(24, (e.e - e.s) * RH - 3); return `<div class="ev" data-ev="${e.id}" style="top:${top}px;height:${h}px;--c:${T[1]};--b:${T[2]}"><b>${esc(e.t)}</b>${h > 36 ? `<small>${hm(e.s)} · ${esc(e.where)}</small>` : ''}</div>`; }).join('')}</div>`).join('')}
      </div>${side}</div>`;
  };
  PWA.after.calendar = () => {
    PWA.$$('.ev').forEach(el => el.onclick = e => { e.stopPropagation(); openEvent(el.dataset.ev, e.clientX, e.clientY); });
    PWA.$$('.col').forEach(c => c.ondblclick = e => { const r = c.getBoundingClientRect(); const h = H0 + Math.floor((e.clientY - r.top) / RH * 2) / 2; PWA.acts.newEvent(null, null, null, { d: +c.dataset.day, s: h }); });
    const cw = PWA.$('.calw'); if (cw) cw.scrollTop = 60;
  };
  function openEvent(id, x, y) {
    const e = events().find(z => z.id === id); if (!e) return; const T = PW.ETYPE[e.type];
    const l = e.lead && leads().find(z => z.id === e.lead);
    if (x == null) { const r = document.body.getBoundingClientRect(); x = innerWidth / 2 - 150; y = innerHeight / 2 - 120; }
    pop(`<div style="display:flex;gap:8px;align-items:center"><span class="st" style="background:${T[2]};color:${T[1]}">${T[0]}</span><span style="flex:1"></span><button class="x" style="width:26px;height:26px" data-act="closePop">${ico('x')}</button></div>
      <h4 style="margin-top:10px">${esc(e.t)}</h4>
      <div class="rw">${ico('clock')}${DAYS[e.d]} ${28 + e.d > 30 ? (28 + e.d - 30) + ' Oct' : (28 + e.d) + ' Sep'} · ${hm(e.s)} – ${hm(e.e)}</div>
      <div class="rw">${ico('pin')}${esc(e.where)}</div><div class="rw">${ico('users')}${esc(e.who)}</div>
      ${l ? `<div class="rw">${ico('phone')}${esc(l.n)} · ${esc(l.phone)}</div>` : ''}
      <div class="ac">${l ? `<button class="btn btn-g btn-sm" data-act="reply" data-arg="${l.id}">${ico('msg')}Message</button><button class="btn btn-o btn-sm" data-act="openLead" data-arg="${l.id}">Open lead</button>` : ''}<button class="btn btn-o btn-sm" data-act="evDone" data-arg="${e.id}">${ico('check')}Mark done</button><button class="btn btn-ghost btn-sm" data-act="evMove" data-arg="${e.id}">Reschedule</button></div>`, x + 10, y - 20);
  }
  PWA.openEvent = openEvent;
  PWA.acts.openEvent = (id, el, ev) => { if (S.page !== 'calendar' || !ev) openEvent(id, ev ? ev.clientX : null, ev ? ev.clientY : null); else openEvent(id, ev.clientX, ev.clientY); };
  PWA.acts.closePop = () => closePop();
  PWA.acts.evDone = id => { closePop(); toast('Marked complete · outcome requested from assignee'); };
  PWA.acts.evMove = id => { closePop(); const e = events().find(z => z.id === id); PWA.acts.newEvent(e.lead, null, null, { d: e.d, s: e.s, move: id }); };
  PWA.acts.calView = k => { S.calView = k; save(); render(); };
  PWA.acts.calToday = () => { S.calView = 'week'; save(); render(); toast('Showing this week'); };
  PWA.acts.calType = t => { S.calOff = S.calOff.includes(t) ? S.calOff.filter(x => x !== t) : [...S.calOff, t]; save(); render(); };

  PWA.acts.newEvent = (leadId, el, ev, pre = {}) => {
    const L = leads(); const l = leadId && L.find(x => x.id === leadId);
    const types = S.v === 'spaces' ? ['viewing', 'inspection', 'handover', 'checkin', 'call'] : ['job', 'appt', 'inspection', 'call'];
    const team = PW.TEAM[S.v].slice(1);
    modal(`<div class="mh"><h3>${pre.move ? 'Reschedule' : 'Schedule ' + (l ? 'with ' + esc(l.n) : 'an appointment')}</h3><button class="x" data-act="closeModal">${ico('x')}</button></div><div class="mb">
      <div class="fld"><label>Type</label><div class="chipset" id="ne-t">${types.map((t, i) => `<button class="chip ${i === 0 ? 'on' : ''}" data-t="${t}" onclick="this.parentNode.querySelectorAll('.chip').forEach(c=>c.classList.remove('on'));this.classList.add('on')">${PW.ETYPE[t][0]}</button>`).join('')}</div></div>
      <div class="fld"><label>Customer / lead</label><select id="ne-l"><option value="">— none —</option>${L.filter(x => !['lost'].includes(x.stage)).map(x => `<option value="${x.id}" ${l && l.id === x.id ? 'selected' : ''}>${esc(x.n)}</option>`).join('')}</select></div>
      <div class="frm"><div class="fld"><label>Day</label><select id="ne-d">${DAYS.map((d, i) => `<option value="${i}" ${(pre.d ?? 2) === i ? 'selected' : ''}>${d} ${28 + i > 30 ? (28 + i - 30) + ' Oct' : (28 + i) + ' Sep'}</option>`).join('')}</select></div>
      <div class="fld"><label>Start</label><select id="ne-s">${Array.from({ length: 24 }, (_, i) => H0 + i / 2).map(h => `<option value="${h}" ${(pre.s ?? 16) === h ? 'selected' : ''}>${hm(h)}</option>`).join('')}</select></div></div>
      <div class="fld"><label>Assign to</label><select id="ne-w">${team.map(t => `<option>${esc(t[0].split(' ')[0])}</option>`).join('')}</select></div>
      <div class="fld"><label>Location</label><input id="ne-p" value="${l ? esc(listingById(l.lst).t) : ''}" placeholder="Listing or address"></div>
      <label style="display:flex;gap:8px;align-items:center;font-size:13px;font-weight:600;margin:4px 0 14px"><input type="checkbox" checked> Send confirmation & reminder to customer via ${l ? esc(PW.SOURCES[l.src].s) : 'WhatsApp'}</label>
      <button class="btn btn-g" style="width:100%" data-act="saveEvent" data-arg="${pre.move || ''}">${pre.move ? 'Move' : 'Confirm & notify'}</button></div>`);
  };
  PWA.acts.saveEvent = move => {
    const t = PWA.$('#ne-t .chip.on').dataset.t, lid = PWA.$('#ne-l').value, d = +PWA.$('#ne-d').value, s = +PWA.$('#ne-s').value, w = PWA.$('#ne-w').value, p = PWA.$('#ne-p').value || 'On site';
    const l = lid && PW.LEADS.find(x => x.id === lid);
    const dur = t === 'call' ? .5 : t === 'job' ? 2 : 1;
    if (move) { const e = [...PW.EVENTS, ...S.extraEvents].find(z => z.id === move); e.d = d; e.s = s; e.e = s + (e.e - e.s); }
    else S.extraEvents.push({ id: 'X' + Date.now(), v: S.v, d, s, e: s + dur, type: t, t: PW.ETYPE[t][0] + (l ? ' · ' + l.n : ''), where: p, who: w, lead: lid || undefined });
    if (l && ['new', 'contacted'].includes(S.stages[lid] || l.stage) && ['viewing', 'job', 'appt'].includes(t)) S.stages[lid] = 'viewing';
    save(); closeModal(); render(); toast((move ? 'Rescheduled' : 'Scheduled') + ` · ${DAYS[d]} ${hm(s)}${l ? ' · ' + l.n.split(' ')[0] + ' notified' : ''}`);
  };
})();
