// Radio Awards 2026 — sdílené prvky identity (směr B Signál + reflektory)
const G='#d9b46a', G2='#f3dca4', G3='#8a6a2e', IV='#f4ecdc', RED='#e0412f', INK='#08070a';
let WAVE=[];
let _u=0; const uid=()=> 'u'+(_u++);

function starPts(cx,cy,R,ri,rot=-90){const p=[];for(let i=0;i<10;i++){const a=(rot+i*36)*Math.PI/180,r=i%2?ri:R;p.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}return p;}

// sloupce znaku: [{x,y0,y1}] ve viewBoxu 200×200
function znakBars(n=15){
  const poly=starPts(100,106,94,38);const out=[];const w=200/n;
  for(let k=0;k<n;k++){const x=w*k+w/2;const ys=[];
    for(let i=0;i<10;i++){const [x1,y1]=poly[i],[x2,y2]=poly[(i+1)%10];
      if((x1<=x&&x2>x)||(x2<=x&&x1>x))ys.push(y1+(x-x1)*(y2-y1)/(x2-x1));}
    ys.sort((a,b)=>a-b);
    for(let j=0;j+1<ys.length;j+=2){if(ys[j+1]-ys[j]<6)continue;out.push({x,y0:ys[j],y1:ys[j+1],w:w*0.6,k});}
  }
  return out;
}
// znak; p = 0..1 průběh „vyrůstání" sloupců (pro animaci), 1 = hotový
function znak(size,col=G,p=1){
  const bars=znakBars();const n=15;
  const s=bars.map(b=>{const d=Math.abs(b.k-(n-1)/2)/((n-1)/2);            // střed roste první
    const t=Math.min(1,Math.max(0,(p*1.6-d*0.6)));const e=1-Math.pow(1-t,3);
    const cy=(b.y0+b.y1)/2,h=(b.y1-b.y0)*e; if(h<0.5)return '';
    return `<rect x="${b.x-b.w/2}" y="${cy-h/2}" width="${b.w}" height="${Math.max(h,b.w)}" rx="${b.w/2}" fill="${col}"/>`;}).join('');
  return `<svg width="${size}" height="${size}" viewBox="0 0 200 200" style="display:block;overflow:visible">${s}</svg>`;
}

// přiznané reflektory: těleso nahoře + kužel. list: {x, x2, tw, w, y, o, on(0..1)}
function reflektory(W,H,list,body=true,bs=1){
  const id=uid();let d='<defs>';
  list.forEach((b,i)=>{d+=`<linearGradient id="${id}b${i}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ffe6b8" stop-opacity="${b.o}"/><stop offset=".5" stop-color="#eab86a" stop-opacity="${b.o*.4}"/>
    <stop offset="1" stop-color="#eab86a" stop-opacity="0"/></linearGradient>`});
  d+=`<filter id="${id}bl"><feGaussianBlur stdDeviation="6"/></filter></defs>`;
  let s='';
  list.forEach((b,i)=>{const on=b.on??1;if(on<=0)return;
    s+=`<path d="M${b.x-b.tw/2} ${b.top||40} L${b.x+b.tw/2} ${b.top||40} L${b.x2+b.w/2} ${b.y} L${b.x2-b.w/2} ${b.y}Z" fill="url(#${id}b${i})" opacity="${on}" filter="url(#${id}bl)"/>`;});
  if(body) list.forEach(b=>{const on=b.on??1;const ang=Math.atan2(b.x2-b.x,b.y)*180/Math.PI;
    s+=`<g transform="translate(${b.x} ${(b.top||40)-6}) rotate(${-ang}) scale(${bs})">
      <rect x="-34" y="-46" width="68" height="46" rx="7" fill="#15141a" stroke="#2a2830"/>
      <rect x="-40" y="-6" width="80" height="12" rx="5" fill="#222027"/>
      <ellipse cx="0" cy="6" rx="36" ry="7" fill="#ffe6b8" opacity="${0.15+0.8*on}"/></g>`;});
  return `<svg class="abs" style="left:0;top:0" width="${W}" height="${H}">${d}${s}</svg>`;
}
// ladicí stupnice 87,5–108 MHz; active = poloha ručičky v MHz
function stupnice(W,y,active,op=1,x0=0){let s='';for(let f=875;f<=1080;f++){const x=x0+(f-875)/(1080-875)*W;const big=f%10==0,mid=f%5==0;
   s+=`<line x1="${x}" y1="${y}" x2="${x}" y2="${y-(big?26:mid?16:9)}" stroke="${G}" stroke-opacity="${(big?.8:.35)*op}" stroke-width="${big?2:1}"/>`;
   if(big&&f%20==0)s+=`<text x="${x}" y="${y+30}" fill="${G}" fill-opacity="${.6*op}" font-family="JetBrains Mono" font-size="16" text-anchor="middle">${f/10}</text>`;}
  if(active!=null){const x=x0+(active-87.5)/(108-87.5)*W;s+=`<line x1="${x}" y1="${y+8}" x2="${x}" y2="${y-60}" stroke="${RED}" stroke-width="3"/>`;}
  return s;}
function vlna(W,H,n,col,amp=1,played=1,seed=0){let s='';const w=W/n;for(let i=0;i<n;i++){const v=WAVE[Math.floor(((i+seed)%n)/n*WAVE.length)]||.3;const h=Math.max(6,v*H*amp);
  s+=`<rect x="${i*w+w*.18}" y="${H/2-h/2}" width="${w*.64}" height="${h}" rx="${w*.32}" fill="${col}" fill-opacity="${i/n<played?1:.22}"/>`;}return s;}
const onair=(txt,size=22)=>`<span class="mono" style="font-size:${size}px;color:${G}"><span style="color:${RED}">●</span> ${txt}</span>`;
