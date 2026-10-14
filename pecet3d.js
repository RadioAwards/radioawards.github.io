// Radio Awards 2026 — živá 3D vosková pečeť pro úvod pozvánky.
// Stejná výšková mapa jako 3D/pecet.html (zlacený znak), ale jako skutečný model:
//  • celá pečeť (před prasknutím) + dva kusy podél nepravidelné praskliny s tloušťkou a plochou lomu
//  • horní kus sedí na klopě a otáčí se s ní (stejná perspektiva jako CSS obálky: 1600 px)
//  • stín na papíře, odlesk = skutečné světlo, které přejede po vosku a zlatě
import * as THREE from './vendor/three.module.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

export function makeSealParts(){
  const N=512;
  // ---------------- výšková mapa (zmenšená kopie 3D/pecet.html) ----------------
  const cnv=()=>{const c=document.createElement('canvas');c.width=c.height=N;return [c,c.getContext('2d')];};
  let seed=11;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
  const [cb,gb]=cnv(); gb.fillStyle='#fff'; gb.beginPath();
  const harm=[...Array(7)].map((_,i)=>({a:(rnd()-.5)*.05/(i*.35+1),p:rnd()*6.28,k:i+2}));
  for(let i=0;i<=360;i++){const a=i/360*Math.PI*2;let r=.405;harm.forEach(h=>r+=h.a*Math.sin(a*h.k+h.p));
    const x=N/2+Math.cos(a)*r*N,y=N/2+Math.sin(a)*r*N;i?gb.lineTo(x,y):gb.moveTo(x,y);}
  gb.fill();
  for(let i=0;i<5;i++){const a=rnd()*6.28,r=.39+rnd()*.03,s=.03+rnd()*.035;gb.beginPath();gb.arc(N/2+Math.cos(a)*r*N,N/2+Math.sin(a)*r*N,s*N,0,7);gb.fill();}
  const RS=.285;
  const [cs,gs]=cnv(); gs.fillStyle='#fff'; gs.beginPath(); gs.arc(N/2,N/2,RS*N,0,7); gs.fill();
  const [ce,ge]=cnv(); ge.fillStyle='#fff'; ge.strokeStyle='#fff';
  { const bars=znakBars(), sc=N*.34/200, ox=N/2-100*sc, oy=N/2-100*sc-N*.012;
    bars.forEach(b=>{const x=ox+(b.x-b.w/2)*sc,y=oy+b.y0*sc,w=b.w*sc,h=(b.y1-b.y0)*sc;ge.beginPath();ge.roundRect(x,y,w,Math.max(h,w),w/2);ge.fill();}); }
  ge.lineWidth=N*.006; ge.beginPath(); ge.arc(N/2,N/2,RS*N*.9,0,7); ge.stroke();
  ge.font=`700 ${N*.034}px Helvetica, Arial`; ge.textAlign='center'; ge.textBaseline='middle';
  { const chars=[...'RADIO AWARDS  ·  PLZEŇSKÝ KRAJ  ·  2026  ·  '], R=RS*N*.76, step=Math.PI*2/chars.length;
    chars.forEach((ch,i)=>{const a=-Math.PI/2+i*step;ge.save();ge.translate(N/2+Math.cos(a)*R,N/2+Math.sin(a)*R);ge.rotate(a+Math.PI/2);ge.fillText(ch,0,0);ge.restore();}); }
  const [cr,gr]=cnv(); gr.strokeStyle='#fff'; gr.lineWidth=N*.035; gr.beginPath(); gr.arc(N/2,N/2,RS*N*1.08,0,7); gr.stroke();
  const fl=c=>{const d=c.getContext('2d').getImageData(0,0,N,N).data,f=new Float32Array(N*N);for(let i=0;i<N*N;i++)f[i]=d[i*4]/255;return f;};
  function blur(f,r,passes=3){let a=f,b=new Float32Array(N*N);for(let p=0;p<passes;p++){
    for(let y=0;y<N;y++){let s=0;const o=y*N;for(let x=-r;x<=r;x++)s+=a[o+Math.min(N-1,Math.max(0,x))];
      for(let x=0;x<N;x++){b[o+x]=s/(2*r+1);s+=a[o+Math.min(N-1,x+r+1)]-a[o+Math.max(0,x-r)];}}
    for(let x=0;x<N;x++){let s=0;for(let y=-r;y<=r;y++)s+=b[Math.min(N-1,Math.max(0,y))*N+x];
      for(let y=0;y<N;y++){a[y*N+x]=s/(2*r+1);s+=b[Math.min(N-1,y+r+1)*N+x]-b[Math.max(0,y-r)*N+x];}}}return a;}
  const [cn,gn]=cnv(); {const id=gn.createImageData(N,N);for(let i=0;i<N*N;i++){const v=rnd()*255;id.data.set([v,v,v,255],i*4);}gn.putImageData(id,0,0);}
  const A=fl(cb), B=blur(fl(cb),9), S=blur(fl(cs),2), E=blur(fl(ce),1,1), R=blur(fl(cr),4), NZ=blur(fl(cn),2);

  // prasklina: dělení úsečky s náhodným posunem (stejné semínko jako render)
  const CRH=(()=>{let sd=97;const r=()=>{sd=(sd*16807)%2147483647;return sd/2147483647-.5};
    let pts=[[0,N*.505],[N,N*.47]];
    for(let lvl=0,amp=N*.06;lvl<9;lvl++,amp*=.64){const nx=[];for(let k=0;k<pts.length-1;k++){const a=pts[k],b=pts[k+1];
      nx.push(a,[(a[0]+b[0])/2,(a[1]+b[1])/2+r()*amp]);}nx.push(pts[pts.length-1]);pts=nx;}
    const out=new Float32Array(N);for(let x=0;x<N;x++){let k=0;while(k<pts.length-2&&pts[k+1][0]<x)k++;
      const a=pts[k],b=pts[k+1],u=(x-a[0])/Math.max(1,b[0]-a[0]);out[x]=a[1]+(b[1]-a[1])*u;}return out;})();

  const H0=new Float32Array(N*N), H1=new Float32Array(N*N);
  const C0=new Uint8Array(N*N*4), C1=new Uint8Array(N*N*4), MM=new Uint8Array(N*N*4), R0=new Uint8Array(N*N*4), R1=new Uint8Array(N*N*4), AM=new Uint8Array(N*N*4);
  const base=new THREE.Color('#5c080d').convertLinearToSRGB(), gold=new THREE.Color('#f2d08a').convertLinearToSRGB();
  const LOMPX=N/1024*9;
  for(let i=0;i<N*N;i++){
    const x=i%N, y=(i/N)|0, inside=A[i], stamp=S[i];
    let h=Math.pow(B[i],.55); h=h*(1-stamp)+.62*stamp; h+=R[i]*.2*inside+E[i]*.12*stamp+(NZ[i]-.5)*.04;
    const d=Math.abs(y-CRH[x]), lom=inside>.5?Math.max(0,1-d/LOMPX):0;
    H0[i]=h*inside; H1[i]=h*inside*(1-.55*lom*lom);
    const gk=Math.min(1,Math.max(0,(E[i]-.3)/.35))*stamp;
    let r=base.r*(1-gk)+gold.r*gk, g=base.g*(1-gk)+gold.g*gk, b=base.b*(1-gk)+gold.b*gk;
    C0.set([255*r,255*g,255*b,255],i*4);
    const L=lom*.55; C1.set([255*(r*(1-L)+.62*L),255*(g*(1-L)+.16*L),255*(b*(1-L)+.18*L),255],i*4);
    MM.set([255*gk,255*gk,255*gk,255],i*4);
    R0.set([255*(.3-.1*gk),255*(.3-.1*gk),255*(.3-.1*gk),255],i*4);
    const rr=255*Math.min(1,(.3-.1*gk)+.5*lom); R1.set([rr,rr,rr,255],i*4);
    AM.set([255*inside,255*inside,255*inside,255],i*4);
  }
  const tex=(d,srgb)=>{const t=new THREE.DataTexture(d,N,N,THREE.RGBAFormat);t.flipY=true;if(srgb)t.colorSpace=THREE.SRGBColorSpace;t.needsUpdate=true;return t;};
  const tC0=tex(C0,1), tC1=tex(C1,1), tM=tex(MM), tR0=tex(R0), tR1=tex(R1), tA=tex(AM);

  // výška v souřadnicích roviny u,v ∈ ⟨−1,1⟩ (v nahoru)
  const hAt=(H,u,v)=>{const fx=(u+1)/2*(N-1), fy=(1-(v+1)/2)*(N-1);
    const x0=Math.max(0,Math.min(N-2,Math.floor(fx))), y0=Math.max(0,Math.min(N-2,Math.floor(fy))), tx=fx-x0, ty=fy-y0;
    return (H[y0*N+x0]*(1-tx)+H[y0*N+x0+1]*tx)*(1-ty)+(H[(y0+1)*N+x0]*(1-tx)+H[(y0+1)*N+x0+1]*tx)*ty;};
  const insideAt=(u,v)=>{const x=Math.round((u+1)/2*(N-1)), y=Math.round((1-(v+1)/2)*(N-1));return A[Math.max(0,Math.min(N-1,y))*N+Math.max(0,Math.min(N-1,x))]>.5;};
  const crackV=u=>{const fx=Math.max(0,Math.min(N-1,(u+1)/2*(N-1)));return 1-2*CRH[Math.round(fx)]/(N-1);};
  const ZS=.2, GAP=.007;

  // ---------------- geometrie ----------------
  // celá pečeť: běžná mřížka
  function gridAll(){const g=new THREE.PlaneGeometry(2,2,200,200),p=g.attributes.position;
    for(let k=0;k<p.count;k++)p.setZ(k,hAt(H0,p.getX(k),p.getY(k))*ZS);g.computeVertexNormals();return g;}
  // kus pečeti: křivočará mřížka, jejíž první řada leží přesně na lomu + stěna lomu dolů k papíru
  function piece(top){
    const COLS=170, ROWS=90, pos=[], uv=[], idx=[];
    for(let i=0;i<=COLS;i++){const u=-1+2*i/COLS, vc=crackV(u)+(top?GAP:-GAP), vEnd=top?1:-1;
      for(let j=0;j<=ROWS;j++){const k=j/ROWS, v=vc+(vEnd-vc)*Math.pow(k,1.35);
        pos.push(u,v,hAt(H1,u,v)*ZS); uv.push((u+1)/2,(v+1)/2);}}
    for(let i=0;i<COLS;i++)for(let j=0;j<ROWS;j++){const a=i*(ROWS+1)+j,b=a+ROWS+1;
      top? idx.push(a,b,a+1,b,b+1,a+1) : idx.push(a,a+1,b,b,a+1,b+1);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
    // stěna lomu: drsná, od horní hrany k papíru
    const wp=[], wi=[]; let n=0; let sd=top?5:9; const r=()=>{sd=(sd*16807)%2147483647;return sd/2147483647-.5};
    for(let i=0;i<=COLS;i++){const u=-1+2*i/COLS, v=crackV(u)+(top?GAP:-GAP);
      const h=hAt(H1,u,v)*ZS, j1=r()*.006, j2=r()*.008;
      if(!insideAt(u,v)||h<.004){n=0;continue;}
      wp.push(u,v,h, u,v+(top?1:-1)*j1,h*.5, u,v+(top?1:-1)*j2,0);
      const c=wp.length/3-3;
      if(n>0){const p=c-3; for(const [a,b,cc,d] of [[p,c,p+1,c+1],[p+1,c+1,p+2,c+2]]) top? wi.push(a,b,cc,b,d,cc) : wi.push(a,cc,b,b,cc,d);}
      n++;}
    const w=new THREE.BufferGeometry();w.setAttribute('position',new THREE.Float32BufferAttribute(wp,3));w.setIndex(wi);w.computeVertexNormals();
    return {g,w};
  }

  const clipIntact=new THREE.Plane(new THREE.Vector3(1,0,0),1e6), clipSplit=new THREE.Plane(new THREE.Vector3(-1,0,0),-1e6);
  const wax=(map,rough,clip)=>new THREE.MeshPhysicalMaterial({color:0xffffff,map,metalnessMap:tM,roughnessMap:rough,metalness:1,roughness:1,
    clearcoat:1,clearcoatRoughness:.12,sheen:.4,sheenColor:new THREE.Color('#ff6a5a'),sheenRoughness:.5,alphaMap:tA,alphaTest:.5,clippingPlanes:[clip]});
  const lomMat=new THREE.MeshPhysicalMaterial({color:new THREE.Color('#7a1c20'),roughness:.85,metalness:0,clippingPlanes:[clipSplit],side:THREE.DoubleSide});

  const intact=new THREE.Mesh(gridAll(),wax(tC0,tR0,clipIntact)); intact.castShadow=true;
  const pT=piece(true), pB=piece(false);
  const matSplit=wax(tC1,tR1,clipSplit);
  const mB=new THREE.Group(); mB.add(new THREE.Mesh(pB.g,matSplit),new THREE.Mesh(pB.w,lomMat));
  const mT=new THREE.Group(); mT.add(new THREE.Mesh(pT.g,matSplit),new THREE.Mesh(pT.w,lomMat));
  mB.children.forEach(m=>m.castShadow=true);   // horní kus na klopě stín nevrhá (dělal ostrou čáru)
  return {intact,mT,mB,clipIntact,clipSplit};
}

export function createSeal3D(canvas){
  const {intact,mT,mB,clipIntact,clipSplit}=makeSealParts();
  // ---------------- scéna ----------------
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
  renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=.85; renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.localClippingEnabled=true; renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const scene=new THREE.Scene();
  const pm=new THREE.PMREMGenerator(renderer); scene.environment=pm.fromScene(new RoomEnvironment(),0.04).texture; scene.environmentIntensity=.9; pm.dispose();

  const root=new THREE.Group(); scene.add(root);
  const sealScale=new THREE.Group(); root.add(sealScale); sealScale.add(intact,mB);
  const hinge=new THREE.Group(); root.add(hinge);               // pant klopy (horní hrana obálky)
  const onFlap=new THREE.Group(); hinge.add(onFlap); onFlap.add(mT);

  // papír chytá stín
  const shadowPlane=new THREE.Mesh(new THREE.PlaneGeometry(4000,4000),new THREE.ShadowMaterial({opacity:.45}));
  shadowPlane.receiveShadow=true; root.add(shadowPlane);

  const key=new THREE.DirectionalLight(0xfff0dc,3.2); key.castShadow=true; key.shadow.mapSize.set(1024,1024); key.shadow.bias=-.0005;
  const fill=new THREE.DirectionalLight(0xffc9a0,.5);
  const glint=new THREE.DirectionalLight(0xfff4dc,0);           // odlesk, který přejede po vosku
  scene.add(key,key.target,fill,glint,new THREE.AmbientLight(0x331010,.6));

  const cam=new THREE.PerspectiveCamera(30,1,1,6000);
  const st={sw:150, hingeY:250, press:0, crack:-1, split:false, flap:0, glint:0, glintOn:1};
  function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;
    renderer.setSize(w,h,false); cam.aspect=w/h; cam.fov=2*Math.atan(h/2/1600)*180/Math.PI;     // = CSS perspective 1600 px
    cam.position.set(0,0,1600); cam.lookAt(0,0,0); cam.updateProjectionMatrix();}
  function draw(){
    const k=st.sw/2;                                                       // 1 jednotka roviny = půl průměru pečeti v px
    sealScale.scale.set(k*(1-.03*st.press),k*(1-.03*st.press),k*(1-.22*st.press));
    hinge.position.set(0,st.hingeY,0); hinge.rotation.x=-st.flap*Math.PI/180;
    onFlap.position.set(0,-st.hingeY,.5); mT.scale.set(k,k,k*(1-.22*st.press));
    mT.visible=st.split && st.flap<96; mB.visible=st.split || st.crack>-1;
    // prasklina běží zleva doprava: vlevo už kusy, vpravo ještě celá pečeť
    const xs=st.split?1e6:(st.crack<=-1?-1e6:st.crack*k);
    clipIntact.constant=-xs; clipSplit.constant=xs; intact.visible=!st.split;
    mT.visible = mT.visible || (!st.split && st.crack>-1);
    // světla v pixelech vzhledem k pečeti
    key.position.set(-1.4*k*3,1.6*k*3,1.8*k*3); key.target.position.set(0,0,0);
    const sc=key.shadow.camera; sc.left=sc.bottom=-k*2.2; sc.right=sc.top=k*2.2; sc.near=1; sc.far=k*20; sc.updateProjectionMatrix();
    fill.position.set(1.5*k,-k,k);
    const gx=-2.4+4.8*st.glint; glint.position.set(gx*k,1.1*k,1.3*k); glint.intensity=st.glintOn*4.2*Math.sin(Math.PI*Math.max(0,Math.min(1,st.glint)));
    renderer.render(scene,cam);
  }
  resize();
  return {st,draw,resize,dispose(){renderer.dispose();renderer.forceContextLoss?.();}};
}
