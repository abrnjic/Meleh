// The published design remains light. Theme trials are URL-scoped and never saved.
(()=>{
 const root=document.documentElement;
 root.dataset.theme='light';
 try{localStorage.removeItem('meleh-theme')}catch{}
 function sync(){
  const preview=new URL(location.href).searchParams.get('theme-preview')==='adria'&&!/^\/(admin|gost)(\/|$)/.test(location.pathname);
  const active=preview||window.SITE?.branding?.theme==='adria';
  root.dataset.design=active?'adria':'classic';
  let sheet=document.getElementById('theme-preview-styles');
  if(active&&!sheet){sheet=document.createElement('link');sheet.id='theme-preview-styles';sheet.rel='stylesheet';sheet.href='/themes/adria.css';document.head.append(sheet)}
  if(!active)sheet?.remove();
  document.getElementById('theme-preview-banner')?.remove();
  if(preview&&document.body){
   const banner=document.createElement('aside');banner.id='theme-preview-banner';banner.className='theme-preview-banner';banner.setAttribute('aria-label','Pregled teme');
   const note=document.createElement('span');note.textContent='Pregled teme Adria · javna tema nije promijenjena.';
   const exit=document.createElement('a');const url=new URL(location.href);url.searchParams.delete('theme-preview');exit.href=url.pathname+url.search+url.hash;exit.textContent='Vrati postojeću temu';exit.dataset.themeExit='true';
   banner.append(note,exit);document.body.prepend(banner);
  }
 }
 window.MelehTheme={sync};
 document.addEventListener('click',event=>{
  const a=event.target.closest?.('a[href]');if(!a||a.dataset.themeExit||!new URL(location.href).searchParams.has('theme-preview'))return;
  const url=new URL(a.href,location.href);
  if(url.origin!==location.origin||/\.[a-z0-9]+$/i.test(url.pathname)||/^\/(api|admin|gost)(\/|$)/.test(url.pathname)||a.getAttribute('href').startsWith('#'))return;
  url.searchParams.set('theme-preview','adria');a.href=url.href;
 },true);
 window.addEventListener('popstate',sync);
 document.addEventListener('DOMContentLoaded',sync);
 sync();
})();
