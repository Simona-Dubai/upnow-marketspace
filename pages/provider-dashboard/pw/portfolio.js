/* Portfolio — the provider's own listings across every business type, and the two ways to grow it:
     Add listing        — a category they are approved for → the marketplace's listing editor
                          (pages/listing-new.html#new=<vertical>:<category>, the same form as onboarding's step 4)
     Add a business type — another vertical → onboarding's add mode (pages/join.html?add=<vertical>): the same
                          business and licence checks as joining, then team review
   Reads the application ('upnow.join', js/pages/join.js; business types added later are app.more) and the account's
   listings ('upnow.listings@<account>', js/marketplace/listing-form.js). Categories and icons are the marketplace's
   (data/listings.js and components/icons.js, loaded before this dashboard's own data as SITEUP / UPUI).
   With no application on this browser (a demo visit) the sample portfolio stays. Loaded after pw/os.js. */
(function () {
  const P = window.PWA, SV = window.SITEUP && SITEUP.VERTICALS; if (!P || !SV) return;
  const { esc, st, S, toast } = P;
  const read = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  const user = read('upnow.user'), app = read('upnow.join');
  const owner = user && (user.email || (user.dial || '') + user.phone);
  if (!app || !owner || (app.owner && app.owner !== owner) || !app.status || app.status === 'draft') return;

  const ORDER = ['spaces', 'services', 'experiences', 'memberships', 'programs', 'health', 'insurance'];
  const ROOT = '../../';
  const editor = h => ROOT + 'pages/listing-new.html#' + h;
  const addType = v => ROOT + 'pages/join.html?add=' + encodeURIComponent(v);
  // the marketplace's icons in this dashboard's icon class
  const IC = (window.UPUI && UPUI.ICONS) || {};
  const ico = n => IC[n] ? `<svg class="ico" viewBox="0 0 24 24">${IC[n]}</svg>` : P.ico(n);
  const offer = (v, c) => (SV[v] && SV[v].offers.find(o => o.id === c)) || null;
  const items = () => ((read('upnow.listings@' + owner) || {}).items || []);
  const approved = () => app.status === 'approved' || !!(read('upnow.listings@' + owner) || {}).verified;

  // every business type on the account: the one from onboarding, then any added since (in review until approved)
  function types() {
    const main = { v: app.v, cats: (app.cats || []).filter(c => offer(app.v, c)), status: approved() ? 'approved' : 'review', main: true };
    const out = [main];
    (app.more || []).filter(t => SV[t.v]).forEach(t => {
      const status = t.status === 'approved' ? 'approved' : t.review && ['changes', 'rejected'].includes(t.review.st) ? t.review.st : 'review', same = out.find(x => x.v === t.v && (x.status === status || (status === 'approved' && x.main)));
      if (same && (status === 'approved' || !same.main)) same.cats = [...new Set([...same.cats, ...(t.cats || [])])];
      else out.push({ v: t.v, cats: (t.cats || []).filter(c => offer(t.v, c)), status });
    });
    return out;
  }
  // listings may be started in every business type straight away — in one still in review they wait for its approval
  // (js/marketplace/listing-form.js nextStatus: 'verify' until that type is approved)

  // the marketplace's status pills (css/components.css .status-pill)
  const STATUS = { draft: ['Draft', 'is-muted'], licence: ['Waiting for licence', 'is-warning'], verify: ['Waiting for approval', 'is-warning'], review: ['In review', 'is-info'], live: ['Live', 'is-success'], changes: ['Changes requested', 'is-danger'], rejected: ['Not approved', 'is-danger'] };
  const pill = (t, k) => `<span class="pf-pill ${k}">${esc(t)}</span>`;
  const NEXT = { draft: ['edit', 'Continue'], changes: ['edit', 'Fix and resubmit'], licence: ['edit', 'Add licence'], verify: ['done', 'View'], review: ['done', 'View'], live: ['edit', 'Edit'], rejected: ['edit', 'Fix and resubmit'] };
  const GROUPS = [['all', 'All'], ['live', 'Live', ['live']], ['waiting', 'In review', ['verify', 'review', 'licence']], ['back', 'Sent back', ['changes', 'rejected']], ['todo', 'To finish', ['draft']]];
  // applications the team sent back: the main one (app.review) and business types added later (app.more[i].review)
  const sentApps = () => { const out = [], back = r => r && ['changes', 'rejected'].includes(r.st);
    if (back(app.review) && app.status !== 'verified' && app.status !== 'approved') out.push({ v: app.v, main: true, r: app.review, href: ROOT + 'pages/join.html?fix=1' });
    (app.more || []).forEach(t => { if (SV[t.v] && t.status !== 'approved' && back(t.review)) out.push({ v: t.v, cats: t.cats || [], r: t.review, href: addType(t.v) }); });
    return out; };
  const appRow = x => { const V = SV[x.v], no = x.r.st === 'rejected', cats = (x.cats || []).map(c => (offer(x.v, c) || {}).label).filter(Boolean).join(', ');
    return `<a class="pf-row is-app" href="${x.href}"><span class="pf-ph">${ico(V.icon)}</span>
      <span class="m"><b>${x.main ? 'Your provider application' : esc(V.label) + ' — business type'}</b><span class="s">${esc(x.main ? V.label : cats || V.label)}${x.r.t ? ' · ' + new Date(x.r.t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''}</span>${pill(no ? 'Not approved' : 'Changes requested', 'is-danger')}${x.r.reason ? `<span class="s pf-why">${esc(x.r.reason)}</span>` : ''}</span>
      <span class="btn btn-g btn-sm">Fix and resend</span></a>`; };
  const area = id => String(id || '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).replace(/\bJ(br|lt|vc)\b/gi, m => m.toUpperCase());
  const money = L => +L.price ? 'AED ' + Number(L.price).toLocaleString() + ({ yearly: ' / year', monthly: ' / month' }[[].concat((L.a || {}).term || [])[0]] || '') : '';
  const NO_PHOTO = v => `<span class="pf-ph">${ico(SV[v].icon)}</span>`;

  const css = `<style id="pf-style">
    .pf-types{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 16px}
    .pf-type{display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 14px;border-radius:10px;border:1px solid var(--line2);background:#fff;font:inherit;font-size:13.5px;font-weight:600;color:var(--ink);cursor:pointer;box-shadow:0 1px 2px rgba(15,40,28,.05);transition:.15s}
    .pf-type .ico{width:17px;height:17px;color:var(--g7)}
    .pf-type:hover{border-color:var(--g7);color:var(--g7)}
    .pf-type.on{border-color:var(--g7);background:var(--g7);color:#fff;font-weight:700}
    .pf-type.on .ico{color:#fff}.pf-type.on .pf-pill{background:rgba(255,255,255,.2);color:#fff}
    .pf-type.add{border:1.5px dashed var(--g7);color:var(--g7);box-shadow:none;font-weight:700}
    .pf-pill{display:inline-block;font-size:11px;font-weight:800;padding:3px 8px;border-radius:99px;white-space:nowrap}
    .pf-pill.is-info{background:#e3eef8;color:#1f5a8c}.pf-pill.is-warning{background:#f8eedb;color:#8a5a12}
    .pf-pill.is-success{background:var(--g1);color:var(--g8)}.pf-pill.is-muted{background:#f2f4f2;color:var(--ink3)}
    .pf-pill.is-danger{background:#fbe4e2;color:#a33a34}
    .pf-row .pf-pill{margin-top:8px}
    .pf-tabs{display:flex;gap:4px;border-bottom:1px solid var(--line);margin-bottom:16px}
    .pf-tabs button{height:38px;padding:0 12px;border:0;background:none;font:inherit;font-size:13.5px;font-weight:700;color:var(--ink3);border-bottom:2px solid transparent;margin-bottom:-1px;cursor:pointer}
    .pf-tabs button em{font-style:normal;font-size:11px;margin-left:6px;padding:1px 7px;border-radius:99px;background:#eef0ef;color:var(--ink2)}
    .pf-tabs button.on{color:var(--g8);border-bottom-color:var(--g7)}.pf-tabs button.on em{background:var(--g1);color:var(--g7)}
    /* the categories chosen when joining: which already have a listing, and the ones still to add */
    .pf-cats{margin:0 0 18px;padding:18px 20px;border:1px solid #d8efe3;border-radius:18px;background:linear-gradient(180deg,#f4faf6,#fff 70%)}
    .pf-cats-h{display:flex;align-items:flex-start;gap:14px;margin-bottom:14px}.pf-cats-h>div{flex:1;min-width:0}
    .pf-cats-h b{display:block;font-size:15.5px}.pf-cats-h small{display:block;margin-top:3px;font-size:13px;color:var(--ink3);line-height:1.45}
    .pf-cats-n{flex:none;font-size:12.5px;font-weight:800;color:var(--g7);white-space:nowrap}
    .pf-cats-bar{height:6px;margin:-4px 0 14px;border-radius:99px;background:#e3efe8;overflow:hidden}.pf-cats-bar i{display:block;height:100%;width:var(--w);border-radius:99px;background:var(--g6);transition:width .6s}
    .pf-cats-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px}
    .pf-cat{display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid var(--line);border-radius:14px;background:#fff;color:var(--ink);transition:.15s}
    .pf-cat:hover{border-color:var(--g5);box-shadow:var(--sh)}
    .pf-cat>i{width:36px;height:36px;flex:none;display:grid;place-items:center;border-radius:10px;background:var(--g1);color:var(--g7)}.pf-cat>i .ico{width:18px;height:18px}
    .pf-cat>span{flex:1;min-width:0}.pf-cat b{display:block;font-size:14px}.pf-cat small{display:block;margin-top:2px;font-size:12.5px;color:var(--ink3)}
    .pf-cat.todo{border:1.5px dashed #bfe3cf;background:#fbfdfb}.pf-cat.todo>i{background:#fbf1e2;color:#a8701a}
    .pf-cat .go{flex:none;font-size:12.5px;font-weight:800;color:var(--g7);white-space:nowrap}
    .pf-addcat{margin-top:12px;padding-top:12px;border-top:1px dashed var(--line)}.pf-addcat small{display:block;margin-bottom:8px;font-size:12.5px;color:var(--ink3);line-height:1.45}
    .pf-chip.is-add{border-style:dashed;color:var(--g7);background:#fbfdfb}.pf-chip.is-add .ico{width:14px;height:14px}
    .pf-chip-new{margin-left:4px;padding:2px 7px;border-radius:99px;background:#fbf1e2;color:#a8701a;font-style:normal;font-size:10.5px;font-weight:800;white-space:nowrap}
    .pf-list{display:flex;flex-direction:column;gap:10px}
    .pf-row{display:flex;align-items:center;gap:14px;padding:12px;border:1px solid var(--line);border-radius:16px;background:#fff;transition:.15s}
    .pf-row:hover{border-color:var(--g5);box-shadow:var(--sh)}
    .pf-row img,.pf-ph{width:96px;height:72px;flex:none;border-radius:10px;object-fit:cover;background:var(--g1);display:grid;place-items:center;color:var(--g7)}
    .pf-ph .ico{width:26px;height:26px}
    .pf-row .m{flex:1;min-width:0}
    .pf-row b{display:block;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .pf-row .s{display:block;font-size:12.5px;color:var(--ink3);margin-top:2px}
    .pf-row .st{margin-top:8px}
    .pf-row .pf-why{color:#8a2a25;background:#fbeceb;border-radius:8px;padding:5px 9px;margin-top:6px;white-space:normal;line-height:1.4}
    .pf-row.is-app{border-color:#efc4c0}.pf-row.is-app .pf-ph{background:#fbeceb;color:#c2413b}
    .pf-backnote{display:flex;gap:8px;align-items:flex-start;margin:-4px 0 14px;font-size:13px;color:var(--ink2)}.pf-backnote .ico{width:15px;height:15px;flex:none;margin-top:2px;color:#c2413b}
    .pf-row .pr{font-weight:800;font-size:13.5px;color:var(--ink);white-space:nowrap}
    .pf-empty{display:flex;flex-direction:column;align-items:center;text-align:center;gap:6px;padding:40px 20px;border:1px dashed var(--line2);border-radius:18px;background:#fff}
    .pf-empty .ico{width:34px;height:34px;color:var(--g7);padding:8px;border-radius:50%;background:var(--g1);box-sizing:content-box}
    .pf-empty b{font-size:16px}.pf-empty span{color:var(--ink3);font-size:13.5px;max-width:420px}
    .pf-sheet>p:first-child{margin:0 0 6px;color:var(--ink3);font-size:13.5px}
    .pf-block{padding:14px 0;border-top:1px solid var(--line)}
    .pf-block-h{display:flex;align-items:center;gap:10px;margin-bottom:10px}
    .pf-block-h>span{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;background:var(--g1);color:var(--g7)}
    .pf-block-h>span .ico{width:18px;height:18px}
    .pf-block-h b{display:block;font-size:14.5px}.pf-block-h small{font-size:12px;color:var(--ink3)}
    .pf-chips{display:flex;flex-wrap:wrap;gap:8px}
    .pf-chip{display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 14px;border-radius:10px;border:1px solid var(--line2);background:#fff;font-size:13.5px;font-weight:600;color:var(--ink);text-decoration:none;box-shadow:0 1px 2px rgba(15,40,28,.05);transition:.15s}
    .pf-chip .ico{width:16px;height:16px;color:var(--g7)}
    .pf-chip:hover{border-color:var(--g7);color:var(--g7)}
    .pf-chip.off{color:var(--ink3);pointer-events:none;background:#f6f8f6}
    .pf-more{display:flex;align-items:center;gap:8px;margin-top:10px;font-size:12.5px;color:var(--ink3)}
    .pf-more a{font-weight:700;color:var(--g7);cursor:pointer}
    .pf-steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:16px 0 0;padding:0;list-style:none;counter-reset:pf}
    .pf-steps li{position:relative;padding:10px 10px 10px 36px;border-radius:12px;background:#f6f8f6;font-size:12px;color:var(--ink3);counter-increment:pf}
    .pf-steps li:before{content:counter(pf);position:absolute;left:10px;top:10px;width:18px;height:18px;border-radius:50%;display:grid;place-items:center;background:var(--g7);color:#fff;font-size:10.5px;font-weight:800}
    .pf-steps li b{display:block;font-size:12.5px;color:var(--ink)}
    .modal.pf-at{width:min(760px,100%);overflow:auto}
    .pf-at-head{position:relative;display:flex;align-items:center;gap:16px;padding:24px 24px 22px;background:linear-gradient(135deg,var(--g1),#fff 80%);border-bottom:1px solid var(--line)}
    .pf-at-head>div{flex:1;min-width:0;padding-right:8px}
    .pf-at-head h3{font-family:var(--serif);font-weight:400;font-size:28px;line-height:1.1;color:var(--g9)}
    .pf-at-head p{margin:6px 0 0;max-width:430px;color:var(--ink2);font-size:13.5px;line-height:1.5}
    .pf-at-art{width:150px;flex:none;margin:-8px 28px -10px 0}.pf-at-art svg{display:block;width:100%;height:auto;overflow:visible}
    .pf-at-head .x{position:absolute;top:14px;right:14px;background:#fff}
    .pf-bob{transform-box:fill-box;transform-origin:center bottom;animation:pf-bob 3.2s ease-in-out infinite}
    .pf-spark{transform-box:fill-box;transform-origin:center;animation:pf-twinkle 2.4s ease-in-out infinite}
    @keyframes pf-bob{50%{transform:translateY(-4px)}}@keyframes pf-twinkle{50%{opacity:.35;transform:scale(.8)}}
    .pf-at-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .pf-at-card{display:flex;align-items:flex-start;gap:12px;padding:14px;border:1.5px solid var(--line);border-radius:16px;background:#fff;color:inherit;text-decoration:none;transition:.18s}
    .pf-at-card:hover{border-color:var(--g6);background:linear-gradient(135deg,var(--g1),#fff 70%);transform:translateY(-2px);box-shadow:0 12px 26px -14px rgba(15,79,54,.35)}
    .pf-at-ic{width:44px;height:44px;flex:none;border-radius:13px;display:grid;place-items:center;background:var(--g1);color:var(--g7);transition:.18s}
    .pf-at-ic .ico{width:22px;height:22px}
    .pf-at-card:hover .pf-at-ic{background:var(--g7);color:#fff}
    .pf-at-tx{flex:1;min-width:0}.pf-at-tx b{display:block;font-size:15px}
    .pf-at-tx small{display:block;margin-top:2px;color:var(--ink3);font-size:12.5px;line-height:1.4}
    .pf-at-cats{display:flex;flex-wrap:wrap;gap:4px;margin-top:8px}
    .pf-at-cats i{font-style:normal;font-size:11px;font-weight:700;padding:2px 8px;border-radius:99px;background:#f6f8f6;border:1px solid var(--line);color:var(--ink2)}
    .pf-at-cats i.n{background:var(--g1);border-color:var(--g2);color:var(--g7)}
    .pf-at-go{align-self:center;color:var(--ink3);transition:.18s}.pf-at-card:hover .pf-at-go{color:var(--g7);transform:translateX(3px)}
    .pf-at-steps{position:relative;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:20px 0 0;padding:16px 0 0;list-style:none;border-top:1px solid var(--line)}
    .pf-at-steps:before{content:"";position:absolute;top:29px;left:14px;right:14px;height:2px;background:var(--line)}
    .pf-at-steps li{position:relative;display:flex;flex-direction:column;gap:8px;font-size:12px;color:var(--ink3);line-height:1.35}
    .pf-at-steps i{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-style:normal;font-size:12px;font-weight:800;background:#fff;border:2px solid var(--line2);color:var(--ink3)}
    .pf-at-steps li.on i{background:var(--g7);border-color:var(--g7);color:#fff;box-shadow:0 0 0 5px var(--g1)}
    .pf-at-steps b{display:block;font-size:12.5px;color:var(--ink)}
    .pf-at-have{display:flex;align-items:center;gap:8px;margin:16px 0 0;padding:10px 12px;border-radius:12px;background:#f6f8f6;font-size:12.5px;color:var(--ink2)}
    .pf-at-have .ico{width:15px;height:15px;color:var(--g7)}
    @media(max-width:640px){.pf-at-grid{grid-template-columns:1fr}.pf-at-art{display:none}.pf-at-steps{grid-template-columns:1fr 1fr;row-gap:14px}.pf-at-steps:before{display:none}}
    @media(prefers-reduced-motion:reduce){.pf-bob,.pf-spark{animation:none}}
    @media(max-width:760px){.pf-row{flex-wrap:wrap}.pf-row img,.pf-ph{width:72px;height:56px}.pf-row .pr{order:3}.pf-steps{grid-template-columns:1fr 1fr}}
  </style>`;
  if (!document.getElementById('pf-style')) document.head.insertAdjacentHTML('beforeend', css);

  /* ---------- the page ---------- */
  const F = { v: 'all', g: 'all' };
  // the categories they chose when joining (and when adding a business type), each with its listings so far
  const catList = () => { const all = items(), out = []; types().filter(t => !['rejected', 'changes'].includes(t.status)).forEach(t => t.cats.forEach(c => { if (!out.some(x => x.v === t.v && x.c === c)) out.push({ v: t.v, c, t, L: all.filter(L => L.v === t.v && L.cat === c) }); })); return out; };
  P.pfCatsTodo = () => catList().filter(x => !x.L.length);
  const catsCard = () => {
    const C = catList(); if (C.length < 2) return '';
    const done = C.filter(x => x.L.length).length; if (done === C.length) return '';
    const inReview = !approved();
    const row = x => { const O = offer(x.v, x.c), V = SV[x.v];
      if (!x.L.length) return `<a class="pf-cat todo" href="${editor('new=' + x.v + ':' + x.c)}"><i>${ico(O.icon || V.icon)}</i><span><b>${esc(O.label)}</b><small>Not listed yet</small></span><span class="go">Add listing</span></a>`;
      const live = x.L.filter(L => L.status === 'live').length, wait = x.L.filter(L => ['verify', 'review', 'licence'].includes(L.status)).length, draft = x.L.length - live - wait;
      return `<a class="pf-cat" href="${editor('new=' + x.v + ':' + x.c)}"><i>${ico(O.icon || V.icon)}</i><span><b>${esc(O.label)}</b><small>${[live && live + ' live', wait && wait + ' waiting for approval', draft && draft + ' to finish'].filter(Boolean).join(' · ')}</small></span>${P.ico('check')}</a>`; };
    return `<section class="pf-cats"><div class="pf-cats-h"><div><b>${C.length - done === 1 ? '1 category still to list' : C.length - done + ' categories still to list'}</b>
        <small>You chose ${C.length} categories when you joined. Add a listing for each one${inReview ? ' — you can do it now: it’s saved and sent for approval with your application, and goes live once you’re approved.' : ' — it goes live after we check it, usually within 24 hours.'}</small></div>
        <span class="pf-cats-n">${done} of ${C.length} listed</span></div>
      <div class="pf-cats-bar"><i style="--w:${Math.round(done / C.length * 100)}%"></i></div>
      <div class="pf-cats-g">${C.map(row).join('')}</div></section>`;
  };
  P.pages.portfolio = () => {
    const ts = types(), all = items().slice().sort((x, y) => (y.updated || 0) - (x.updated || 0));
    if (F.v !== 'all' && !ts.some(t => t.v === F.v) && !all.some(L => L.v === F.v)) F.v = 'all';
    const byV = all.filter(L => F.v === 'all' || L.v === F.v);
    const g = GROUPS.find(x => x[0] === F.g) || GROUPS[0];
    const list = g[2] ? byV.filter(L => g[2].includes(L.status)) : byV;
    const SA = sentApps().filter(x => F.v === 'all' || x.v === F.v);
    const count = k => { const x = GROUPS.find(y => y[0] === k); return (x[2] ? byV.filter(L => x[2].includes(L.status)).length : byV.length) + (k === 'back' || k === 'all' ? SA.length : 0); };
    const live = all.filter(L => L.status === 'live').length;
    const typeChips = `<div class="pf-types">${ts.length > 1 ? `<button class="pf-type ${F.v === 'all' ? 'on' : ''}" data-act="pfV" data-arg="all">All types</button>` : ''}${ts.map(t => `<button class="pf-type ${F.v === t.v || ts.length === 1 ? 'on' : ''}" data-act="pfV" data-arg="${t.v}">${ico(SV[t.v].icon)}${esc(SV[t.v].label)}${t.status === 'approved' ? '' : t.status === 'rejected' ? pill('Not approved', 'is-danger') : t.status === 'changes' ? pill('Changes requested', 'is-danger') : pill('In review', 'is-warning')}</button>`).join('')}</div>`;
    const rows = list.map(L => {
      const s = STATUS[L.status] || STATUS.draft, [view, label] = NEXT[L.status] || NEXT.draft, O = offer(L.v, L.cat);
      const where = [O ? O.label : SV[L.v].label, area(L.loc || (L.areas || [])[0])].filter(Boolean).join(' · ');
      return `<a class="pf-row" href="${editor(view + '=' + L.id)}">${(L.img || [])[0] ? `<img src="${L.img[0]}" alt="">` : NO_PHOTO(L.v)}
        <span class="m"><b>${esc(L.title || 'Untitled listing')}</b><span class="s">${esc(where)}</span>${pill(s[0], s[1])}${['changes', 'rejected'].includes(L.status) && L.reason ? `<span class="s pf-why">${esc(L.reason)}</span>` : ''}</span>
        ${money(L) ? `<span class="pr">${esc(money(L))}</span>` : ''}<span class="btn ${['draft', 'changes', 'rejected', 'licence'].includes(L.status) ? 'btn-g' : 'btn-o'} btn-sm">${label}</span></a>`;
    }).join('');
    const appRows = F.g === 'back' || F.g === 'all' ? SA.map(appRow).join('') : '';
    const backNote = F.g === 'back' && (SA.length || list.length) ? `<p class="pf-backnote">${ico('edit')}<span>Our team sent these back with a reason. Fix what they asked and send it again — we review it within 24 hours.</span></p>` : '';
    const body = !all.length && !SA.length
      ? `<div class="pf-empty">${ico('plus')}<b>No listings yet</b><span>Add your first listing — it goes live after we check it, usually within 24 hours.</span><button class="btn btn-g btn-sm" data-act="addListing">${P.ico('plus')}Add listing</button></div>`
      : `<div class="pf-tabs">${GROUPS.map(([k, l]) => `<button class="${F.g === k ? 'on' : ''}" data-act="pfG" data-arg="${k}">${l}<em>${count(k)}</em></button>`).join('')}</div>
        ${backNote}${list.length || appRows ? `<div class="pf-list">${appRows}${rows}</div>` : `<div class="pf-empty"><b>${F.g === 'back' ? 'Nothing sent back' : 'Nothing here'}</b><span>${F.g === 'back' ? 'When our team asks for a change or can’t approve something, it shows here with the reason.' : 'No listings match this filter.'}</span></div>`}`;
    return `<div class="ph"><div><h1>Portfolio</h1><p>${all.length ? `${live} live · ${all.length - live} more` : 'Everything you list on UpNow, in one place.'}</p></div><span class="sp"></span>
      <div class="acts"><button class="btn btn-o btn-sm" data-act="pfAddType">${P.ico('brief')}Add a business type</button><button class="btn btn-g btn-sm" data-act="addListing">${P.ico('plus')}Add listing</button></div></div>${catsCard()}${typeChips}${body}`;
  };
  P.acts.pfV = v => { F.v = v; P.render(); };
  P.acts.pfG = k => { F.g = k; P.render(); };

  /* ---------- add listing: approved categories, grouped by business type ---------- */
  P.acts.addListing = () => {
    P.closeDrawer();
    const ts = types();
    const block = t => {
      const V = SV[t.v], mine = V.offers.filter(o => t.cats.includes(o.id)), rest = V.offers.filter(o => !t.cats.includes(o.id));
      return `<div class="pf-block"><div class="pf-block-h"><span>${ico(V.icon)}</span><div><b>${esc(V.label)}</b><small>${t.status === 'approved' ? 'Approved' : t.main ? 'Your application is in review — listings wait for it' : 'In review — start listings now, they go live once it\'s approved'}</small></div></div>
        <div class="pf-chips">${mine.map(o => `<a class="pf-chip" href="${editor('new=' + t.v + ':' + o.id)}">${ico(o.icon || V.icon)}${esc(o.label)}${items().some(L => L.v === t.v && L.cat === o.id) ? '' : '<em class="pf-chip-new">Not listed yet</em>'}</a>`).join('')}</div>
        ${(more => more.length ? `<div class="pf-addcat"><small>${t.status === 'approved' ? 'Also offer something else? Add a category — we check any licence it needs, usually within 24 hours.' : `${esc(V.label)} is in review — you can still add another category now. It’s sent for approval with any licence it needs.`}</small>
          <div class="pf-chips">${more.map(o => `<a class="pf-chip is-add" href="${addType(t.v)}&cat=${encodeURIComponent(o.id)}">${P.ico('plus')}${esc(o.label)}</a>`).join('')}</div></div>` : '')(t === ts.filter(x => x.v === t.v).slice(-1)[0] ? V.offers.filter(o => !ts.some(x => x.v === t.v && x.cats.includes(o.id))) : [])}</div>`;
    };
    P.modal(`<div class="mh"><h3 style="flex:1">Add listing</h3><button class="x" data-act="closeModal">${P.ico('x')}</button></div>
      <div class="mb pf-sheet"><p>Pick what you're listing — it opens the listing editor and saves as you go.</p>${ts.map(block).join('')}
        <p class="pf-more">Listing something else? <a data-act="pfAddType">Add a business type</a></p></div>`);
  };

  /* ---------- add a business type: the same checks as onboarding ---------- */
  // the join page's "business" illustration (js/pages/join.js): pale circle, brand greens, the amber pin that bobs
  const AT_ART = `<svg viewBox="0 0 160 120" aria-hidden="true"><circle cx="86" cy="62" r="50" fill="#fff" opacity=".7"/>
      <rect x="44" y="52" width="26" height="50" rx="4" fill="#d8efe3"/><rect x="74" y="34" width="32" height="68" rx="4" fill="#136142"/><rect x="110" y="60" width="22" height="42" rx="4" fill="#25946a"/>
      <g fill="#fff" opacity=".85"><rect x="80" y="42" width="7" height="7" rx="1.5"/><rect x="93" y="42" width="7" height="7" rx="1.5"/><rect x="80" y="55" width="7" height="7" rx="1.5"/><rect x="93" y="55" width="7" height="7" rx="1.5"/><rect x="80" y="68" width="7" height="7" rx="1.5"/><rect x="93" y="68" width="7" height="7" rx="1.5"/><rect x="115" y="68" width="5" height="5" rx="1"/><rect x="123" y="68" width="5" height="5" rx="1"/><rect x="115" y="78" width="5" height="5" rx="1"/><rect x="123" y="78" width="5" height="5" rx="1"/></g>
      <g fill="#136142" opacity=".55"><rect x="50" y="60" width="5" height="5" rx="1"/><rect x="59" y="60" width="5" height="5" rx="1"/><rect x="50" y="70" width="5" height="5" rx="1"/><rect x="59" y="70" width="5" height="5" rx="1"/></g>
      <rect x="86" y="88" width="10" height="14" rx="2" fill="#fff"/><path d="M30 102h112" stroke="#bfd9cb" stroke-width="2" stroke-linecap="round"/>
      <g class="pf-bob"><path d="M128 14c-9 0-15 7-15 15 0 11 15 24 15 24s15-13 15-24c0-8-6-15-15-15z" fill="#e0a526"/><circle cx="128" cy="29" r="5.5" fill="#fff"/></g>
      <path class="pf-spark" d="M24 30v8M20 34h8M146 92v6M143 95h6" stroke="#25946a" stroke-width="2" stroke-linecap="round"/></svg>`;
  P.acts.pfAddType = () => {
    const ts = types(), have = new Set(ts.map(t => t.v)), rest = ORDER.filter(v => SV[v] && !have.has(v));
    const card = v => { const V = SV[v], o = V.offers.map(x => x.label);
      return `<a class="pf-at-card" href="${addType(v)}"><span class="pf-at-ic">${ico(V.icon)}</span>
        <span class="pf-at-tx"><b>${esc(V.label)}</b>${V.blurb ? `<small>${esc(V.blurb)}</small>` : ''}
          <span class="pf-at-cats">${o.slice(0, 3).map(l => `<i>${esc(l)}</i>`).join('')}${o.length > 3 ? `<i class="n">+${o.length - 3}</i>` : ''}</span></span>
        <span class="pf-at-go">${P.ico('chevR')}</span></a>`; };
    P.modal(`<div class="pf-at-head"><div><h3>Add a business type</h3><p>Offer something new on UpNow. Pick it, add the licence it needs and we'll review it — your profile and ID carry over.</p></div>
        <span class="pf-at-art">${AT_ART}</span><button class="x" data-act="closeModal">${P.ico('x')}</button></div>
      <div class="mb">
        ${rest.length ? `<div class="pf-at-grid">${rest.map(card).join('')}</div>` : `<div class="pf-empty"><b>You offer every business type</b><span>Add more categories from Add listing.</span></div>`}
        <ol class="pf-at-steps"><li class="on"><i>1</i><span><b>Pick a type</b>and its categories</span></li><li><i>2</i><span><b>Add the licence</b>we read it for you</span></li><li><i>3</i><span><b>Team review</b>usually within 24 h</span></li><li><i>4</i><span><b>Start listing</b>right here</span></li></ol>
        <p class="pf-at-have">${P.ico('check')}<span>On your account: ${ts.map(t => `<b>${esc(SV[t.v].label)}</b>${t.status === 'approved' ? '' : ' (in review)'}`).join(', ')}</span></p>
      </div>`, 'pf-at');
  };

  // Portfolio shows the account's real listings: no "sample data" note here (pw/new-provider.js adds it to other pages)
  const render = P.render;
  P.render = function () { render.apply(this, arguments); if (S.page === 'portfolio') document.querySelectorAll('#view .np-note').forEach(n => n.remove()); };

  // back from adding a business type (join.html?add= sends the dashboard ?added=<vertical>)
  const added = new URLSearchParams(location.search).get('added');
  if (added && SV[added]) setTimeout(() => toast(SV[added].label + ' sent for approval'), 300);
})();
