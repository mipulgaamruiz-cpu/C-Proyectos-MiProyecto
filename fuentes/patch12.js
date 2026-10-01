const fs=require('fs');let s=fs.readFileSync('mk.js','utf8');
const rep=(a,b)=>{if(!s.includes(a))throw new Error('missing: '+a.slice(0,80));s=s.replace(a,()=>b)};
// botón de tema junto a País
rep("<span class=\"mk-country__chev\">'+ic('chevron')+'</span></span></span></header>'","<span class=\"mk-country__chev\">'+ic('chevron')+'</span></span></span><button class=\"mk-bell\" id=\"theme\" type=\"button\" style=\"margin-left:12px\"></button></header>'");
rep("$('#pais').addEventListener('change',e=>applyCountry(e.target.value));","$('#pais').addEventListener('change',e=>applyCountry(e.target.value));\n $('#theme').addEventListener('click',()=>{const d=document.documentElement.classList.toggle('dark');try{localStorage.setItem('mkTheme',d?'dark':'light')}catch(x){}themeIcon()});themeIcon();");
rep("function landing(view,g){","function themeIcon(){const d=document.documentElement.classList.contains('dark'),b=$('#theme');if(!b)return;b.innerHTML=ic(d?'sun':'moon');b.setAttribute('data-tip',d?'Cambiar a tema claro':'Cambiar a tema oscuro');b.setAttribute('aria-label',d?'Cambiar a tema claro':'Cambiar a tema oscuro')}\nfunction landing(view,g){");
rep("route();\n})();","try{if(localStorage.getItem('mkTheme')==='dark')document.documentElement.classList.add('dark')}catch(e){}\nroute();\n})();");
fs.writeFileSync('mk.js',s);console.log('ok');
