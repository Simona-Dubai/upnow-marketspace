/* Demand dashboard + Leads pipeline + Lead drawer */
(function () {
  const { ico, esc, av, aed, ago, spark, st, S, save, leads, listings, listingById, VX, catLabel, toast, drawer, closeDrawer, go, render, modal, closeModal } = PWA;
  const SRC = PW.SOURCES;
  const srcTag = k => `<span class="src" style="--c:${SRC[k].c}"><i></i>${esc(SRC[k].s)}</span>`;
  const SLA = 15;

  /* ============ DEMAND ============ */
  PWA.pages.demand = () => {
    const X = VX(), L = leads(), LS = listings();
    const needReply = L.filter(l => l.stage === 'new');
    const over = needReply.filter(l => l.ago > SLA);
    const todayEv = PWA.events().filter(e => e.d === 1).sort((a, b) => a.s - b.s);
    const pipeVal = L.filter(l => !['won', 'lost'].includes(l.stage)).reduce((s, l) => s + l.val, 0);
    const weak = LS.filter(l => l.status === 'live' && l.quality < 85);
    // source split
    const bySrc = {}; L.forEach(l => { bySrc[l.src] = bySrc[l.src] || { n: 0, w: 0, v: 0 }; bySrc[l.src].n++; if (l.stage === 'won') { bySrc[l.src].w++; bySrc[l.src].v += l.val; } });
    const mult = S.v === 'spaces' ? 10.75 : 10.2; // scale sample to monthly volume
    const srcRows = Object.entries(bySrc).sort((a, b) => b[1].n - a[1].n);
    const tot = srcRows.reduce((s, [, x]) => s + x.n, 0);
    const fmax = X.funnel[0][1];
    return `<div class="ph"><div><h1>Good morning, Khalid</h1><p>Tuesday 29 September · here is where your ${X.label.toLowerCase()} demand is coming from.</p></div><span class="sp"></span>
      <div class="acts"><div class="seg" id="rng">${['7 days', '30 days', '90 days'].map((x, i) => `<button class="${i === 1 ? 'on' : ''}" data-act="range" data-arg="${x}">${x}</button>`).join('')}</div></div></div>
    <div class="att">
      <div data-go="leads" class="hl"><small>Waiting for first reply</small><b>${needReply.length} leads</b><span>${over.length} past your ${SLA}-min target</span></div>
      <div data-go="calendar"><small>Today's ${S.v === 'spaces' ? 'viewings & visits' : 'jobs & appointments'}</small><b>${todayEv.length} scheduled</b><span>Next: ${todayEv[0] ? PWA.hm(todayEv[0].s) + ' · ' + esc(todayEv[0].t.split('·')[0]) : '—'}</span></div>
      <div data-go="leads"><small>Open pipeline</small><b>${aed(pipeVal)}</b><span>${L.filter(l => !['won', 'lost'].includes(l.stage)).length} active opportunities</span></div>
      <div data-go="portfolio"><small>Listings needing attention</small><b>${weak.length + LS.filter(l => l.status !== 'live').length}</b><span>${weak.length} low quality · ${LS.filter(l => l.status === 'pending').length} in review</span></div>
    </div>
    <div class="g4">${X.kpis.map(k => `<div class="kpi" data-go="leads"><small>${k[0]}</small><b>${k[1]}</b><span class="d">${k[2]}</span>${spark(k[4])}</div>`).join('')}</div>
    <div class="gd mt">
      <section class="pn"><div class="pn-h"><h2>Where your leads come from</h2><span class="sub">Last 30 days</span><span class="sp"></span><a data-act="openCh">Manage channels ${ico('chevR')}</a></div>
        <div class="srcbar">${srcRows.map(([k, x]) => `<i style="width:${x.n / tot * 100}%;background:${SRC[k].c}" title="${SRC[k].l}"></i>`).join('')}</div>
        <div class="srcl"><div class="r h"><span></span><span>Channel</span><span style="text-align:right">Leads</span><span style="text-align:right">Share</span><span style="text-align:right">Won</span></div>
        ${srcRows.map(([k, x]) => `<div class="r"><i class="dot" style="background:${SRC[k].c}"></i><span><b style="text-align:left;font-size:13px">${esc(SRC[k].l)}</b></span><b>${Math.round(x.n * mult)}</b><span class="n">${Math.round(x.n / tot * 100)}%</span><span class="n">${Math.round(x.w * mult) || '—'}</span></div>`).join('')}</div>
      </section>
      <section class="pn"><div class="pn-h"><h2>Marketplace funnel</h2><span class="sub">UpNow listings</span></div>
        <div class="fun">${X.funnel.map((f, i) => `<div class="r"><span>${f[0]}</span><i style="--w:${Math.max(6, Math.pow(f[1] / fmax, 0.35) * 100)}%"></i><b>${f[1].toLocaleString()}${i ? `<em>${(f[1] / X.funnel[i - 1][1] * 100).toFixed(i < 3 ? 1 : 0)}%</em>` : ''}</b></div>`).join('')}</div>
        <p class="hint" style="margin:14px 0 0">Contact actions = calls, WhatsApp taps, chat and request forms from your UpNow listings.</p>
      </section>
    </div>
    <div class="gd mt">
      <section class="pn"><div class="pn-h"><h2>Reply next</h2><span class="sub">Sorted by response-time risk</span><span class="sp"></span><a data-go="inbox">Open inbox ${ico('chevR')}</a></div>
        ${needReply.concat(L.filter(l => l.stage === 'contacted')).sort((a, b) => b.ago - a.ago).slice(0, 5).map(l => { const li = listingById(l.lst); const late = l.stage === 'new' && l.ago > SLA; return `<div class="ar">${av(l.n)}<div class="bd"><b>${esc(l.n)} <span class="heat ${l.heat}">${l.heat}</span></b><small>${srcTag(l.src)} · ${esc(li ? li.t : '')} — “${esc(l.msg)}”</small></div><span class="tmr ${late ? '' : 'ok'}">${l.stage === 'new' ? (late ? ago(l.ago) + ' waiting' : ago(l.ago) + ' ago') : 'Follow up'}</span><button class="btn btn-g btn-sm" data-act="reply" data-arg="${l.id}">${ico('msg')}Reply</button></div>`; }).join('')}
      </section>
      <section class="pn"><div class="pn-h"><h2>Today</h2><span class="sub">${esc(S.v === 'spaces' ? 'Viewings, check-ins & inspections' : 'Jobs & appointments')}</span><span class="sp"></span><a data-go="calendar">Calendar ${ico('chevR')}</a></div>
        <div class="nx">${todayEv.map(e => { const T = PW.ETYPE[e.type]; return `<div class="r" data-act="openEvent" data-arg="${e.id}"><div class="tm">${PWA.hm(e.s)}<small>${Math.round((e.e - e.s) * 60)} min</small></div><i class="bar" style="--c:${T[1]}"></i><div><b>${esc(e.t)}</b><small>${esc(e.where)} · ${esc(e.who)}</small></div>${ico('chevR')}</div>`; }).join('') || '<div class="empty">Nothing scheduled today</div>'}</div>
      </section>
    </div>
    <section class="pn mt"><div class="pn-h"><h2>Listing performance</h2><span class="sub">Which listings turn views into leads</span><span class="sp"></span><a data-go="portfolio">All ${esc(VX().catalogue.toLowerCase())} ${ico('chevR')}</a></div>
      <table class="tbl"><thead><tr><th>${S.v === 'spaces' ? 'Listing' : 'Service'}</th><th>Status</th><th>Views</th><th>Contacts</th><th>Leads</th><th>View → lead</th><th>Avg reply</th><th>Listing quality</th><th></th></tr></thead><tbody>
      ${listings().filter(l => l.views).sort((a, b) => b.leads - a.leads).map(l => `<tr class="ck" data-act="openListing" data-arg="${l.id}"><td><div class="li"><img src="${l.img}" alt=""><div><b>${esc(l.t)}</b><small>${esc(catLabel(l.cat))} · ${esc(l.area)}</small></div></div></td><td>${stTag(l.status)}</td><td>${l.views.toLocaleString()}</td><td>${l.contacts}</td><td><b>${l.leads}</b></td><td>${(l.leads / l.views * 100).toFixed(1)}%</td><td>${l.resp} min</td><td><div class="qbar"><i style="--w:${l.quality}%;--c:${l.quality < 80 ? 'var(--amber)' : 'var(--g6)'}"></i><b style="font-size:12px">${l.quality}</b></div></td><td>${ico('chevR')}</td></tr>`).join('')}
      </tbody></table></section>`;
  };
  const stTag = s => ({ live: st('Live'), pending: st('In review', 'warn'), draft: st('Draft', 'mute'), paused: st('Paused', 'mute') }[s]);
  PWA.stTag = stTag; PWA.srcTag = srcTag;
  PWA.acts.openCh = () => PWA.openChannels();
  PWA.acts.range = (x, el) => { PWA.$$('#rng button').forEach(b => b.classList.toggle('on', b === el)); toast('Showing last ' + x); };

  /* ============ LEADS ============ */
  const ORDER = ['new', 'contacted', 'viewing', 'negotiation', 'won', 'lost'];
  PWA.pages.leads = () => {
    const X = VX(), L = leads();
    const f = S.leadSrc || 'all';
    const LL = L.filter(l => f === 'all' || l.src === f);
    const srcs = [...new Set(L.map(l => l.src))];
    const head = `<div class="ph"><div><h1>Leads</h1><p>Every enquiry from UpNow, WhatsApp, portals, social and phone — one pipeline. Drag cards to move stages.</p></div><span class="sp"></span>
      <div class="acts"><div class="seg">${[['board', 'Board', 'kanban'], ['list', 'List', 'list']].map(([k, l, i]) => `<button class="${S.leadView === k ? 'on' : ''}" data-act="leadView" data-arg="${k}">${ico(i)}${l}</button>`).join('')}</div><button class="btn btn-g btn-sm" data-act="addLead">${ico('plus')}Add lead</button></div></div>
      <div class="fbar"><button class="chip ${f === 'all' ? 'on' : ''}" data-act="leadSrc" data-arg="all">All sources <span class="c">${L.length}</span></button>${srcs.map(s => `<button class="chip ${f === s ? 'on' : ''}" data-act="leadSrc" data-arg="${s}"><span class="src" style="--c:${PW.SOURCES[s].c}"><i></i></span>${PW.SOURCES[s].s} <span class="c">${L.filter(l => l.src === s).length}</span></button>`).join('')}</div>`;
    if (S.leadView === 'list') return head + `<section class="pn" style="padding:6px 8px"><table class="tbl"><thead><tr><th>Lead</th><th>Source</th><th>Interested in</th><th>Stage</th><th>Value</th><th>Owner</th><th>Last activity</th></tr></thead><tbody>
      ${LL.sort((a, b) => a.ago - b.ago).map(l => { const li = listingById(l.lst); return `<tr class="ck" data-act="openLead" data-arg="${l.id}"><td><div class="li">${av(l.n, 'sm')}<div><b>${esc(l.n)}</b><small>${esc(l.phone)}</small></div></div></td><td>${srcTag(l.src)}</td><td>${esc(li ? li.t : '')}</td><td>${st(X.stages[l.stage], l.stage === 'lost' ? 'mute' : l.stage === 'new' ? 'info' : '')}</td><td>${aed(l.val)}</td><td>${esc(l.owner)}</td><td>${ago(l.ago)} ago</td></tr>`; }).join('')}</tbody></table></section>`;
    return head + `<div class="kb">${ORDER.map(k => { const c = LL.filter(l => l.stage === k); return `<div class="kc" data-stage="${k}"><div class="kc-h">${esc(X.stages[k])}<span class="c">${c.length}</span><span class="v">${c.length ? aed(c.reduce((s, l) => s + l.val, 0)).replace('AED ', 'AED ') : ''}</span></div>
      ${c.map(l => { const li = listingById(l.lst); const late = l.stage === 'new' && l.ago > SLA; return `<div class="lc" draggable="true" data-lead="${l.id}"><div class="t">${av(l.n, 'sm')}<b>${esc(l.n)}</b><span class="heat ${l.heat}">${l.heat}</span></div><div class="lst">${ico(S.v === 'spaces' ? 'building' : 'wrench')}${esc(li ? li.t : '')}</div><p>${esc(l.msg)}</p><div class="f">${srcTag(l.src)}<span class="sp"></span>${late ? `<span class="late">${ago(l.ago)} no reply</span>` : `<span>${ago(l.ago)}</span>`}<b style="color:var(--ink)">${aed(l.val).replace('AED ', '')}</b></div></div>`; }).join('')}</div>`; }).join('')}</div>`;
  };
  PWA.after.leads = () => {
    PWA.$$('.lc').forEach(c => {
      c.onclick = () => PWA.openLead(c.dataset.lead);
      c.ondragstart = e => { e.dataTransfer.setData('text', c.dataset.lead); c.classList.add('drag'); };
      c.ondragend = () => c.classList.remove('drag');
    });
    PWA.$$('.kc').forEach(k => {
      k.ondragover = e => { e.preventDefault(); k.classList.add('over'); };
      k.ondragleave = () => k.classList.remove('over');
      k.ondrop = e => { e.preventDefault(); k.classList.remove('over'); moveLead(e.dataTransfer.getData('text'), k.dataset.stage); };
    });
  };
  function moveLead(id, stage) {
    if (!id) return; S.stages[id] = stage; save(); render();
    const l = PW.LEADS.find(x => x.id === id);
    toast(`${l.n} → ${VX().stages[stage]}`);
    if (stage === 'viewing') setTimeout(() => PWA.acts.newEvent(id), 250);
  }
  PWA.moveLead = moveLead;
  PWA.acts.leadView = k => { S.leadView = k; save(); render(); };
  PWA.acts.leadSrc = k => { S.leadSrc = k; save(); render(); };
  PWA.acts.openLead = id => PWA.openLead(id);
  PWA.acts.reply = id => { S.thread = id; S.read[id] = 1; save(); go('inbox'); };

  PWA.openLead = id => {
    const l = leads().find(x => x.id === id); if (!l) return;
    const X = VX(), li = listingById(l.lst), i = ORDER.indexOf(l.stage);
    const hist = (PW.MSGS[l.id] || [['in', l.msg, ago(l.ago) + ' ago']]).concat(S.sent[l.id] || []);
    const ev = PWA.events().filter(e => e.lead === l.id);
    drawer(`<div class="dr-h">${av(l.n, 'lg')}<div style="flex:1"><h3>${esc(l.n)}</h3><small>${srcTag(l.src)} · ${esc(l.phone)} · created ${ago(l.ago)} ago</small></div><button class="x" data-act="closeDrawer">${ico('x')}</button></div>
      <div class="dr-b">
        <div class="sect-t" style="margin-top:0">Stage</div>
        <div class="stp">${ORDER.map((k, j) => `<button class="${j < i && l.stage !== 'lost' ? 'done' : ''} ${j === i ? 'on' : ''}" data-act="stage" data-arg="${l.id}|${k}">${esc(X.stages[k])}</button>`).join('')}</div>
        ${li ? `<div class="orig"><div class="hd">Came from <span style="flex:1"></span>${srcTag(l.src)}</div><div class="row2" style="cursor:pointer" data-act="openListing" data-arg="${li.id}"><img src="${li.img}"><div style="flex:1;min-width:0"><b style="font-size:13px;display:block">${esc(li.t)}</b><span class="pp">${aed(li.price)} <span>/ ${li.basis}</span></span></div>${ico('chevR')}</div><div style="display:flex;align-items:center;gap:8px;margin-top:12px;padding-top:12px;border-top:1px solid var(--line)"><span class="hint" style="font-weight:600">Customer tapped</span><span class="act ${PWA.ACTS[l.act][2]}">${ico(PWA.ACTS[l.act][1])}${PWA.ACTS[l.act][0]}</span><span style="flex:1"></span><span class="hint">${ago(l.ago)} ago</span></div></div>` : ''}
        <div class="kv"><div><span>Budget</span><b>${esc(l.budget)}</b></div><div><span>Timing</span><b>${esc(l.when)}</b></div><div><span>Estimated value</span><b>${aed(l.val)}</b></div><div><span>Owner</span><b>${esc(l.owner)}</b></div><div><span>Source</span><b>${esc(PW.SOURCES[l.src].l)}</b></div><div><span>Intent</span><b style="text-transform:capitalize">${l.heat}</b></div></div>
        ${ev.length ? `<div class="sect-t">Scheduled</div>${ev.map(e => `<div class="ar" data-act="openEvent" data-arg="${e.id}" style="cursor:pointer">${ico('cal')}<div class="bd"><b>${esc(e.t)}</b><small>${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][e.d]} ${28 + e.d} Sep · ${PWA.hm(e.s)} · ${esc(e.where)}</small></div></div>`).join('')}` : ''}
        <div class="sect-t">Conversation</div>
        ${hist.slice(-3).map(m => `<div class="bb ${m[0]}" style="max-width:100%;margin-bottom:6px">${esc(m[1])}<small>${esc(m[2])}</small></div>`).join('')}
        <div class="sect-t">Timeline</div>
        ${[['Lead created from ' + PW.SOURCES[l.src].l, ago(l.ago) + ' ago'], ['Auto-acknowledged by UpNow assistant', ago(Math.max(0, l.ago - 1)) + ' ago'], ...(l.owner !== '—' ? [['Assigned to ' + l.owner, ago(Math.max(0, l.ago - 3)) + ' ago']] : [])].map(t => `<div class="ar">${ico('clock')}<div class="bd"><b style="font-weight:600">${esc(t[0])}</b><small>${t[1]}</small></div></div>`).join('')}
      </div>
      <div class="dr-f"><button class="btn btn-g btn-sm" data-act="reply" data-arg="${l.id}">${ico('msg')}Reply</button><button class="btn btn-wa btn-sm" data-act="wa" data-arg="${l.id}">${ico('wa')}WhatsApp</button><button class="btn btn-o btn-sm" data-act="call" data-arg="${l.id}">${ico('phone')}Call</button><button class="btn btn-o btn-sm" data-act="newEvent" data-arg="${l.id}">${ico('cal')}Schedule ${X.meet}</button><span style="flex:1"></span>${l.stage !== 'lost' ? `<button class="btn btn-ghost btn-sm" data-act="stage" data-arg="${l.id}|lost">Mark lost</button>` : ''}</div>`);
  };
  PWA.acts.stage = a => { const [id, k] = a.split('|'); S.stages[id] = k; save(); render(); PWA.openLead(id); toast('Stage → ' + VX().stages[k]); if (k === 'viewing') setTimeout(() => PWA.acts.newEvent(id), 250); };
  PWA.acts.closeDrawer = () => closeDrawer();
  PWA.acts.wa = id => { const l = PW.LEADS.find(x => x.id === id); toast('WhatsApp opened for ' + l.n + ' · logged to timeline'); };
  PWA.acts.call = id => { const l = PW.LEADS.find(x => x.id === id); modal(`<div class="mh"><h3>Calling ${esc(l.n)}</h3><button class="x" data-act="closeModal">${ico('x')}</button></div><div class="mb"><p style="margin-top:0;color:var(--ink3)">${esc(l.phone)} · via tracked line +971 4 555 0100</p>
      <div class="fld"><label>Call outcome</label><select><option>Connected — interested</option><option>Connected — not interested</option><option>No answer</option><option>Call back later</option></select></div><div class="fld"><label>Notes</label><textarea placeholder="What was discussed?"></textarea></div>
      <button class="btn btn-g" style="width:100%" data-act="logCall" data-arg="${l.id}">Log call</button></div>`); };
  PWA.acts.logCall = id => { closeModal(); if ((S.stages[id] || PW.LEADS.find(x => x.id === id).stage) === 'new') { S.stages[id] = 'contacted'; save(); render(); } toast('Call logged to timeline'); };
  PWA.acts.closeModal = () => closeModal();
  PWA.acts.addLead = () => modal(`<div class="mh"><h3>Add a lead</h3><button class="x" data-act="closeModal">${ico('x')}</button></div><div class="mb">
      <div class="fld"><label>Name</label><input id="nl-n" placeholder="Customer name"></div><div class="fld"><label>Phone</label><input placeholder="+971"></div>
      <div class="fld"><label>Source</label><select id="nl-s">${Object.entries(PW.SOURCES).map(([k, s]) => `<option value="${k}">${s.l}</option>`).join('')}</select></div>
      <div class="fld"><label>Interested in</label><select id="nl-l">${listings().map(l => `<option value="${l.id}">${esc(l.t)}</option>`).join('')}</select></div>
      <div class="fld"><label>Notes</label><textarea id="nl-m" placeholder="What are they looking for?"></textarea></div>
      <button class="btn btn-g" style="width:100%" data-act="saveLead">Add to pipeline</button></div>`);
  PWA.acts.saveLead = () => { const n = PWA.$('#nl-n').value.trim() || 'New contact'; const id = 'N' + Date.now(); const li = listingById(PWA.$('#nl-l').value); PW.LEADS.unshift({ id, v: S.v, n, src: PWA.$('#nl-s').value, lst: li.id, stage: 'new', ago: 0, msg: PWA.$('#nl-m').value || 'Manual lead', val: li.price, heat: 'warm', owner: 'Khalid', budget: '—', when: '—', phone: '+971' }); closeModal(); render(); toast(n + ' added to pipeline'); };
})();
