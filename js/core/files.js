/* Uploaded files kept in this browser (IndexedDB — localStorage is too small for documents and PDFs).
   Onboarding (js/pages/join.js) saves each ID / licence the provider uploads here and keeps only its key on the
   application (docs[id].file); the admin dashboard (pages/admin) reads it back to show the document to the team.
   Prototype: no server, so the file lives only in the browser it was uploaded in.

   UPFILES.put(key, file) → Promise<boolean>     UPFILES.get(key) → Promise<Blob | null>     UPFILES.del(key) */
(function () {
  const DB = 'upnow-files', STORE = 'files';
  let open = null;
  const db = () => open || (open = new Promise((ok, no) => {
    if (!window.indexedDB) return no(new Error('no IndexedDB'));
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error);
  }));
  const run = (mode, fn) => db().then(d => new Promise((ok, no) => { const t = d.transaction(STORE, mode), q = fn(t.objectStore(STORE)); t.oncomplete = () => ok(q && q.result); t.onerror = () => no(t.error); }));
  window.UPFILES = {
    put: (key, file) => run('readwrite', s => s.put(file, key)).then(() => true, () => false),
    get: key => key ? run('readonly', s => s.get(key)).then(b => b || null, () => null) : Promise.resolve(null),
    del: key => run('readwrite', s => s.delete(key)).catch(() => {})
  };
})();
