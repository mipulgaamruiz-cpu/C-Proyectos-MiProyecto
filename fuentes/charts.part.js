/* ---- Gráficas SVG ---- */
function pieSVG(data){
 const W=334,Hh=200,cx=167,cy=100,R=100,tot=data.reduce((a,d)=>a+d.value,0);let a0=0,paths='',lbls='';
 const pt=(a,r)=>[cx+r*Math.cos(a),cy-r*Math.sin(a)];
 data.forEach((d,i)=>{const fr=d.value/tot,a1=a0+fr*2*Math.PI,[x0,y0]=pt(a0,R),[x1,y1]=pt(a1,R),large=(a1-a0)>Math.PI?1:0,col=PALETTE[i%PALETTE.length];
  paths+=data.length===1?'<circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="'+col+'" stroke="#fff"><title>'+esc(d.name)+': 100%</title></circle>':'<path stroke="#fff" fill="'+col+'" d="M '+x0+','+y0+' A '+R+','+R+',0,'+large+',0,'+x1+','+y1+' L '+cx+','+cy+' Z"><title>'+esc(d.name)+': '+pct(fr,1)+'</title></path>';
  const am=(a0+a1)/2,[lx,ly]=pt(am,R+12);lbls+='<text x="'+lx+'" y="'+ly+'" class="pie-lbl" font-size="12" font-weight="600" text-anchor="'+(Math.cos(am)>=0?'start':'end')+'" dominant-baseline="central">'+Math.round(fr*100)+'%</text>';a0=a1});
 return '<svg viewBox="0 0 '+W+' '+Hh+'" width="100%" height="200" style="overflow:visible" role="img" aria-label="Gráfico circular">'+paths+lbls+'</svg>';
}
function lineSVG(pts,series){
 const W=1100,Hh=260,m={l:56,r:16,t:14,b:28},iw=W-m.l-m.r,ih=Hh-m.t-m.b;
 let mn=Infinity,mx=-Infinity;pts.forEach(p=>series.forEach(s=>{mn=Math.min(mn,p[s.k]);mx=Math.max(mx,p[s.k])}));const pad=(mx-mn)*0.1||0.001;mn-=pad;mx+=pad;
 const X=i=>m.l+iw*i/(pts.length-1),Y=v=>m.t+ih*(1-(v-mn)/(mx-mn));
 let g='';for(let i=0;i<=4;i++){const v=mn+(mx-mn)*i/4,y=Y(v);g+='<line x1="'+m.l+'" x2="'+(W-m.r)+'" y1="'+y+'" y2="'+y+'" class="chart-grid"/><text x="'+(m.l-6)+'" y="'+(y+4)+'" text-anchor="end" class="chart-txt">'+pct(v,1)+'</text>'}
 const nt=6;for(let i=0;i<nt;i++){const idx=Math.round((pts.length-1)*i/(nt-1));g+='<text x="'+X(idx)+'" y="'+(Hh-8)+'" text-anchor="middle" class="chart-txt">'+pts[idx].d.toLocaleDateString('es-ES',{day:'2-digit',month:'short'})+'</text>'}
 const lines=series.map(s=>'<polyline fill="none" stroke="'+s.c+'" stroke-width="2.2" stroke-linejoin="round" points="'+pts.map((p,i)=>X(i).toFixed(1)+','+Y(p[s.k]).toFixed(1)).join(' ')+'"/>').join('');
 const hov=pts.map((p,i)=>'<rect x="'+(X(i)-iw/pts.length/2)+'" y="'+m.t+'" width="'+(iw/pts.length)+'" height="'+ih+'" fill="transparent"><title>'+p.d.toLocaleDateString('es-ES')+' — '+series.map(s=>s.n+': '+pct(p[s.k],2)).join(' · ')+'</title></rect>').join('');
 return '<svg viewBox="0 0 '+W+' '+Hh+'" width="100%" style="max-height:320px;display:block" role="img" aria-label="Rentabilidad acumulada">'+g+lines+hov+'</svg><div class="lg">'+series.map(s=>'<span><i style="background:'+s.c+'"></i>'+esc(s.n)+'</span>').join('')+'</div>';
}
function hbarSVG(items,keys,colors,names){
 const W=760,rowH=34,m={l:190,r:20,t:10,b:10},Hh=m.t+m.b+items.length*rowH,iw=W-m.l-m.r;
 let mx=0;items.forEach(it=>{let pos=0,neg=0;keys.forEach(k=>{const v=it[k];if(v>=0)pos+=v;else neg+=v});mx=Math.max(mx,pos,-neg)});mx=mx||0.001;
 const zero=m.l+iw/2,sc=(iw/2)/mx;let g='<line x1="'+zero+'" x2="'+zero+'" y1="'+m.t+'" y2="'+(Hh-m.b)+'" stroke="currentColor" opacity=".4"/>';
 items.forEach((it,i)=>{const y=m.t+i*rowH+6;let p=zero,n=zero;g+='<text x="'+(m.l-8)+'" y="'+(y+12)+'" text-anchor="end" class="chart-txt">'+esc(it.cat)+'</text>';
  keys.forEach((k,j)=>{const v=it[k],w=Math.abs(v)*sc;if(v>=0){g+='<rect x="'+p+'" y="'+y+'" width="'+w+'" height="16" rx="2" fill="'+colors[j]+'"><title>'+names[j]+': '+bps(v)+'</title></rect>';p+=w}else{n-=w;g+='<rect x="'+n+'" y="'+y+'" width="'+w+'" height="16" rx="2" fill="'+colors[j]+'"><title>'+names[j]+': '+bps(v)+'</title></rect>'}})});
 return '<svg viewBox="0 0 '+W+' '+Hh+'" width="100%" style="display:block" role="img" aria-label="Barras horizontales">'+g+'</svg><div class="lg">'+names.map((n,j)=>'<span><i style="background:'+colors[j]+'"></i>'+n+'</span>').join('')+'</div>';
}
function wrapT(t){const w=t.split(' '),out=[''];w.forEach(x=>{if((out[out.length-1]+' '+x).trim().length>16)out.push(x);else out[out.length-1]=(out[out.length-1]+' '+x).trim()});return out.slice(0,3)}
function waterfallSVG(comps,total,totalLabel){
 const W=1100,Hh=250,m={l:20,r:20,t:22,b:62},iw=W-m.l-m.r,ih=Hh-m.t-m.b,n=comps.length+1,bw=iw/n*0.6;
 let run=0,lo=0,hi=0;const bars=comps.map(c=>{const s=run;run+=c.v;lo=Math.min(lo,s,run);hi=Math.max(hi,s,run);return {n:c.n,s,e:run,v:c.v}});lo=Math.min(lo,0);hi=Math.max(hi,run);
 const Y=v=>m.t+ih*(1-(v-lo)/(hi-lo||1)),X=i=>m.l+iw/n*i+(iw/n-bw)/2;
 const lab=(i,t)=>'<text x="'+(X(i)+bw/2)+'" y="'+(Hh-m.b+16)+'" text-anchor="middle" class="chart-txt">'+wrapT(t).map((s,k)=>'<tspan x="'+(X(i)+bw/2)+'" dy="'+(k?12:0)+'">'+esc(s)+'</tspan>').join('')+'</text>';
 let g='<line x1="'+m.l+'" x2="'+(W-m.r)+'" y1="'+Y(0)+'" y2="'+Y(0)+'" stroke="currentColor" opacity=".4"/>';
 bars.forEach((b,i)=>{const y1=Y(Math.max(b.s,b.e)),h=Math.abs(Y(b.s)-Y(b.e))||1;g+='<rect x="'+X(i)+'" y="'+y1+'" width="'+bw+'" height="'+h+'" rx="2" fill="'+(b.v>=0?'#22c55e':'#ef4444')+'"><title>'+esc(b.n)+': '+bps(b.v)+'</title></rect><text x="'+(X(i)+bw/2)+'" y="'+(y1-5)+'" text-anchor="middle" class="chart-txt">'+bps(b.v)+'</text>'+lab(i,b.n)});
 const i=bars.length,y1=Y(Math.max(0,total)),h=Math.abs(Y(0)-Y(total))||1;g+='<rect x="'+X(i)+'" y="'+y1+'" width="'+bw+'" height="'+h+'" rx="2" fill="#6a1b9a"><title>'+totalLabel+': '+bps(total)+'</title></rect><text x="'+(X(i)+bw/2)+'" y="'+(y1-5)+'" text-anchor="middle" class="chart-txt" style="font-weight:700">'+bps(total)+'</text>'+lab(i,totalLabel);
 return '<svg viewBox="0 0 '+W+' '+Hh+'" width="100%" style="display:block" role="img" aria-label="Cascada de efectos">'+g+'</svg>';
}

