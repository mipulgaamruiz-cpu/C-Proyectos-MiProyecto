const fs=require('fs');let s=fs.readFileSync('mk.js','utf8');
const rep=(a,b)=>{if(!s.includes(a))throw new Error('missing '+a.slice(0,60));s=s.replace(a,()=>b)};
rep("const open=S.open[g.key]||r.grp===g||r.land===g,","const open=S.open[g.key]!==undefined?S.open[g.key]:(r.grp===g||r.land===g),");
const i=s.indexOf("document.addEventListener('click',e=>{const t=e.target.closest('[data-tg]')");
const j=s.indexOf("window.addEventListener('hashchange'");
if(i<0){const k=s.indexOf("document.addEventListener('click',e=>{const a=e.target.closest('[data-go]')");if(k<0)throw new Error('no handler');}
const start=i>=0?i:s.indexOf("document.addEventListener('click',e=>{const a=e.target.closest('[data-go]')");
s=s.slice(0,start)+"document.addEventListener('click',e=>{const t=e.target.closest('[data-tg]');if(t){e.preventDefault();e.stopPropagation();const k=t.dataset.tg,r=current(),auto=(r.grp&&r.grp.key===k)||(r.land&&r.land.key===k),cur=S.open[k]!==undefined?S.open[k]:auto;S.open[k]=!cur;document.getElementById('sbNav').innerHTML=sidebarNav(r);return}const a=e.target.closest('[data-go]');if(a){e.preventDefault();go(a.dataset.go)}});\n"+s.slice(s.indexOf("window.addEventListener('hashchange'"));
fs.writeFileSync('mk.js',s);console.log('ok');
