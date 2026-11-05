const V='muslim-v1';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k.startsWith('muslim-')).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin===location.origin){
    // ملفات البرنامج: من الذاكرة فورًا، وتتحدّث في الخلفية لما يبقى فيه إنترنت
    e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>{
      const net=fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res})
        .catch(()=>hit||(r.mode==='navigate'?caches.match('./index.html'):Response.error()));
      return hit||net;
    }));
  }else if(/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
    e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put(r,cp));return res})));
  }
  // باقي الطلبات (القرآن والتفاسير والصوت) بتتخزن جوه البرنامج نفسه وبتتحمّل من قسم التحميل
});
