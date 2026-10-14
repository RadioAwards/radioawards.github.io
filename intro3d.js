// Radio Awards 2026 — úvod pozvánky celý ve 3D.
// Obálka leží na stole (kamera skloněná 25°), reflektor zleshora, živá vosková pečeť.
// Časová osa (t = s od klepnutí): zamáčknutí → prasklina → klopa se zvedne (horní kus pečeti jede s ní)
// → karta vyjede z obálky → přiletí ke kameře a zaplní obrazovku → předání HTML scéně se soškou.
import * as THREE from './vendor/three.module.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
import { makeSealParts } from './pecet3d.js';

const cl=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)), seg=(t,a,b)=>cl((t-a)/(b-a));
const eIn2=x=>x*x, eOutBack2=x=>{const c=1.8;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2);};
const eOut=x=>1-Math.pow(1-x,3), eInOut=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2, eOutExpo=x=>x>=1?1:1-Math.pow(2,-10*x);
const lerp=(a,b,k)=>a+(b-a)*k;

export async function createIntro3D(canvas,{name='',tilt=25}={}){
  await Promise.all([new FontFace('AK3','url(fonts/Akrobat-Black.otf)',{weight:'900'}).load().then(f=>document.fonts.add(f)),
                     new FontFace('JB3','url(fonts/JBMono-latin.woff2)').load().then(f=>document.fonts.add(f))]);
  const W=342, H=500, IN=10, AP=H*.5, SW=W*.433, NOTCH=H*.42, CW=W*.86, CH=H*.86;
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
  renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1; renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.localClippingEnabled=true;
  const scene=new THREE.Scene(); scene.background=new THREE.Color('#070605');
  const pm=new THREE.PMREMGenerator(renderer); scene.environment=pm.fromScene(new RoomEnvironment(),.04).texture; scene.environmentIntensity=.3; pm.dispose();

  // ---------- textury ----------
  function paper(w,h,draw,base){
    const s=3,c=document.createElement('canvas');c.width=w*s;c.height=h*s;const g=c.getContext('2d');
    const m=document.createElement('canvas');m.width=c.width;m.height=c.height;const gm=m.getContext('2d');
    g.fillStyle=base;g.fillRect(0,0,c.width,c.height);gm.fillStyle='#000';gm.fillRect(0,0,m.width,m.height);
    const id=g.getImageData(0,0,c.width,c.height),d=id.data;for(let i=0;i<d.length;i+=4){const n=(Math.random()-.5)*10;d[i]+=n;d[i+1]+=n;d[i+2]+=n;}g.putImageData(id,0,0);
    g.scale(s,s);gm.scale(s,s);draw(g,gm);
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;
    const mt=new THREE.CanvasTexture(m);
    const r=document.createElement('canvas');r.width=m.width;r.height=m.height;const gr=r.getContext('2d');
    gr.fillStyle='#d9d9d9';gr.fillRect(0,0,r.width,r.height);gr.globalCompositeOperation='difference';gr.globalAlpha=.62;gr.drawImage(m,0,0);
    return [t,mt,new THREE.CanvasTexture(r)];
  }
  const bc=document.createElement('canvas');bc.width=bc.height=512;{const gb=bc.getContext('2d'),bi=gb.createImageData(512,512);
    for(let i=0;i<bi.data.length;i+=4){const v=128+(Math.random()-.5)*90;bi.data[i]=bi.data[i+1]=bi.data[i+2]=v;bi.data[i+3]=255;}gb.putImageData(bi,0,0);}
  const bump=new THREE.CanvasTexture(bc);bump.wrapS=bump.wrapT=THREE.RepeatWrapping;bump.repeat.set(3,4);
  const GOLD='#d9b46a', foil=(g,gm,fn)=>{g.save();gm.save();fn(g,GOLD);fn(gm,'#fff');g.restore();gm.restore();};
  const paperMat=([map,metal,rough])=>new THREE.MeshStandardMaterial({map,metalnessMap:metal,metalness:1,roughnessMap:rough,roughness:1,bumpMap:bump,bumpScale:1.4});
  // přední kapsa se jménem (výřez pod klopou)
  const pocketTex=paper(W,H,(g,gm)=>{
    foil(g,gm,(x,c)=>{x.strokeStyle=c;x.globalAlpha=.75;x.lineWidth=.9;x.strokeRect(IN,IN,W-2*IN,H-2*IN);});
    g.textAlign='center';g.fillStyle='#b99a5c';g.font='500 9.5px JB3';g.letterSpacing='2.2px';g.fillText('OSOBNÍ POZVÁNKA PRO',W/2,AP+SW/2+38);
    foil(g,gm,(x,c)=>{x.fillStyle=c;x.font='900 40px AK3';x.textAlign='center';x.fillText(name.toUpperCase(),W/2,AP+SW/2+80);x.fillRect(W/2-30,AP+SW/2+98,60,.8);});
    g.fillStyle='#8d8676';g.font='500 9.5px JB3';g.fillText('RADIO AWARDS · 24 / 11 / 2026',W/2,AP+SW/2+124);
  },'#1c1814');
  const flapTex=paper(W,AP,(g,gm)=>{foil(g,gm,(x,c)=>{x.strokeStyle=c;x.lineWidth=1.6;x.beginPath();x.moveTo(IN,IN);x.lineTo(W/2,AP);x.lineTo(W-IN,IN);x.stroke();});},'#241f19');
  // vnitřek obálky a rub klopy: tlumený zlatý vzor hvězd z ekvalizéru
  const liner=(()=>{const c=document.createElement('canvas');c.width=c.height=136;const g=c.getContext('2d');g.fillStyle='#0f0d0a';g.fillRect(0,0,136,136);
    g.fillStyle='rgba(217,180,106,.24)';[[62,28,12,80],[42,48,12,48],[82,48,12,48],[22,60,12,20],[102,60,12,20]].forEach(([x,y,w,h])=>{g.beginPath();g.roundRect(x,y,w,h,6);g.fill();});
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(W/34,H/34);return t;})();

  // ---------- obálka ----------
  const env=new THREE.Group(); scene.add(env);
  const back=new THREE.Mesh(new THREE.BoxGeometry(W,H,.8),new THREE.MeshStandardMaterial({map:liner,roughness:.85}));
  back.position.z=.4; back.receiveShadow=true; env.add(back);
  // karta: přední strana neosvětlená (= přesně barva scény), zlatý rámeček
  const cardTex=(()=>{const s=3,c=document.createElement('canvas');c.width=CW*s;c.height=CH*s;const g=c.getContext('2d');g.scale(s,s);
    g.fillStyle='#08070a';g.fillRect(0,0,CW,CH);g.strokeStyle='rgba(217,180,106,.55)';g.lineWidth=1;g.strokeRect(8,8,CW-16,CH-16);
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;})();
  const card=new THREE.Mesh(new THREE.PlaneGeometry(CW,CH),new THREE.MeshBasicMaterial({map:cardTex,toneMapped:false}));
  const CARD0=new THREE.Vector3(0,H*.06-H/2+CH/2,1.0); card.position.copy(CARD0); env.add(card);
  // přední kapsa s výřezem
  const ps=new THREE.Shape();ps.moveTo(-W/2,-H/2);ps.lineTo(W/2,-H/2);ps.lineTo(W/2,H/2);ps.lineTo(0,H/2-NOTCH);ps.lineTo(-W/2,H/2);ps.lineTo(-W/2,-H/2);
  const pg=new THREE.ShapeGeometry(ps);{const uv=pg.attributes.uv,p=pg.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,(p.getX(i)+W/2)/W,(p.getY(i)+H/2)/H);}
  const pocket=new THREE.Mesh(pg,paperMat(pocketTex)); pocket.position.z=1.6; pocket.receiveShadow=pocket.castShadow=true; env.add(pocket);
  // klopa na pantu (horní hrana obálky)
  const hinge=new THREE.Group(); hinge.position.set(0,H/2,1.5); env.add(hinge);   // zavřená: z=2,2 · otevřená 180°: z≈0,8 (karta jede nad ní)
  const fs=new THREE.Shape();fs.moveTo(-W/2,0);fs.lineTo(W/2,0);fs.lineTo(W/2-IN,-IN);fs.lineTo(0,-AP);fs.lineTo(-W/2+IN,-IN);fs.lineTo(-W/2,0);
  const fgeo=new THREE.ShapeGeometry(fs);{const uv=fgeo.attributes.uv,p=fgeo.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,(p.getX(i)+W/2)/W,1+p.getY(i)/AP);}
  const flapOut=new THREE.Mesh(fgeo,paperMat(flapTex)); flapOut.position.z=.7; flapOut.castShadow=flapOut.receiveShadow=true; hinge.add(flapOut);
  const flapIn=new THREE.Mesh(fgeo,new THREE.MeshStandardMaterial({map:liner,roughness:.85,side:THREE.BackSide})); flapIn.position.z=.62; hinge.add(flapIn);
  // pečeť: celá + spodní kus na kapse, horní kus na klopě
  const S=makeSealParts(); const k=SW/2;
  [S.intact,S.mB].forEach(m=>{m.scale.set(k,k,k); m.position.set(0,H/2-AP,2.3); env.add(m);});
  const tPivot=new THREE.Group(); tPivot.position.set(0,-AP,.8); hinge.add(tPivot);
  S.mT.scale.set(k,k,k); tPivot.add(S.mT);
  // úlomky vosku: odletí při prasknutí a zůstanou ležet na papíře
  const chipMat=new THREE.MeshPhysicalMaterial({color:'#6b0d12',roughness:.45,clearcoat:.6});
  let sd=7; const rr=()=>{sd=(sd*16807)%2147483647;return sd/2147483647};
  const chips=[...Array(11)].map((_,i)=>{const m=new THREE.Mesh(new THREE.IcosahedronGeometry(1,0),chipMat);
    const s0=1.6+rr()*2.6; m.scale.set(s0*(.6+rr()*.8),s0*(.6+rr()*.8),s0*(.4+rr()*.5)); m.castShadow=true; m.visible=false; env.add(m);
    return {m, x:(rr()-.5)*1.2*k, vx:(rr()-.5)*160, vy:(rr()-.5)*110+20, vz:140+rr()*230, wx:rr()*14, wy:rr()*14};});
  S.intact.material.envMapIntensity=.35; S.intact.material.clearcoat=.55; S.intact.material.clearcoatRoughness=.2;
  // stůl
  const tc=document.createElement('canvas');tc.width=tc.height=256;{const g=tc.getContext('2d'),im=g.createImageData(256,256);
    for(let i=0;i<im.data.length;i+=4){const v=128+(Math.random()-.5)*60;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=255;}g.putImageData(im,0,0);}
  const tt=new THREE.CanvasTexture(tc);tt.wrapS=tt.wrapT=THREE.RepeatWrapping;tt.repeat.set(20,20);
  const table=new THREE.Mesh(new THREE.PlaneGeometry(6000,6000),new THREE.MeshStandardMaterial({color:'#0e0a08',roughness:1,bumpMap:tt,bumpScale:2.2}));
  table.receiveShadow=true; scene.add(table);

  // ---------- světla ----------
  const key=new THREE.SpotLight(0xffe2b4,3.6e5,0,THREE.MathUtils.degToRad(30),.9,2);
  key.position.set(-620,620,420); key.target.position.set(10,-20,0); key.castShadow=true; key.shadow.mapSize.set(1024,1024); key.shadow.bias=-.0001; key.shadow.radius=4;
  const stul=new THREE.SpotLight(0xffd9a0,3.2e5,0,THREE.MathUtils.degToRad(24),1,2); stul.position.set(-120,260,1300); stul.target.position.set(0,-40,0);
  const sKey=new THREE.DirectionalLight(0xfff0dc,.7); sKey.position.set(-1.4,1.6,1.8);
  const sSpot=new THREE.SpotLight(0xfff0dc,1.15e6,0,THREE.MathUtils.degToRad(8.5),.55,2); sSpot.position.set(-364,416,468); sSpot.target.position.set(0,0,0);
  const glint=new THREE.SpotLight(0xfff6e0,0,0,THREE.MathUtils.degToRad(5),.6,2);
  scene.add(key,key.target,stul,stul.target,sKey,sSpot,sSpot.target,glint,glint.target,new THREE.DirectionalLight(0xffcf9a,.35),new THREE.HemisphereLight(0x3a2c1c,0x050403,.5));

  // ---------- kamera ----------
  const cam=new THREE.PerspectiveCamera(30,1,10,8000), D=1520, a=THREE.MathUtils.degToRad(tilt);
  const CAM0=new THREE.Vector3(0,-D*Math.sin(a)-30,D*Math.cos(a)), LOOK=new THREE.Vector3(0,-30,0);
  function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();}
  resize();

  // cílová poloha karty: kolmo před kamerou, zaplní celou obrazovku
  const qCard0=new THREE.Quaternion(), tmp=new THREE.Vector3(), qCam=new THREE.Quaternion();
  function cardScreenPose(){
    const fov=THREE.MathUtils.degToRad(cam.fov), d=Math.min(CH/(2*Math.tan(fov/2))*.9, CW/(2*Math.tan(fov/2)*cam.aspect)*.9);
    const fwd=new THREE.Vector3(); cam.getWorldDirection(fwd);
    return {pos:cam.position.clone().add(fwd.multiplyScalar(d)), q:cam.quaternion.clone()};
  }
  // průmět bodu karty na obrazovku (pro HTML nápis, který na kartě „sedí")
  const proj=(v)=>{const p=v.clone().project(cam);return {x:(p.x+1)/2*canvas.clientWidth,y:(1-p.y)/2*canvas.clientHeight};};
  function cardAnchor(){
    const a=card.localToWorld(new THREE.Vector3(0,CH/2-CH*.28,0)), b=card.localToWorld(new THREE.Vector3(100,CH/2-CH*.28,0));
    const pa=proj(a),pb=proj(b); return {x:pa.x,y:pa.y,s:Math.hypot(pb.x-pa.x,pb.y-pa.y)/100};
  }

  const st={press:0};
  const CLOSE=new THREE.Vector3(0,0,0), dirCam=CAM0.clone().sub(LOOK).normalize();
  const noise=(t,f,ph)=>Math.sin(t*f+ph)*.6+Math.sin(t*f*2.3+ph*1.7)*.4;
  let idle0=null;
  function update(t,idle){
    const SNAP=.5;
    if(idle0===null) idle0=idle; const wake=Math.max(0,Math.min(1,(idle-idle0)/2.5));   // první snímek = přesně náhledový obrázek, dýchání a odlesk se rozjedou pozvolna
    // ---------- kamera ----------
    // klid: velmi pomalý nájezd + dýchání; dotek: rychlý nájezd k pečeti; prasknutí: otřes;
    // otevírání: kamera se zvedne a sleduje kartu; nakonec se s kartou potká
    const idleIn=1-.06*(1-Math.exp(-Math.max(0,idle-idle0)/6));
    const calm=(t<0?1:1-seg(t,0,.3))*wake;
    const push=eInOut(seg(t,0,.58)), rise=eInOut(seg(t,.42,2.0));   // pohyby se překrývají → kamera se nikdy nezastaví
    let dist=D*idleIn*lerp(1,.62,push), aim=new THREE.Vector3(0,lerp(-30,0,push),0);
    dist=lerp(dist,D*1.0,rise); aim.y=lerp(aim.y,H*.62,rise);
    const elev=lerp(THREE.MathUtils.degToRad(tilt),THREE.MathUtils.degToRad(tilt+9),rise);
    cam.position.set(aim.x, aim.y-dist*Math.sin(elev), dist*Math.cos(elev));
    cam.position.x+=Math.sin(idle*.5)*7*calm; cam.position.z+=Math.sin(idle*.37)*5*calm;
    const sh=t>SNAP?Math.exp(-(t-SNAP)*11):0;                                   // otřes při prasknutí
    cam.position.x+=noise(t,90,1)*3.2*sh; cam.position.y+=noise(t,77,2)*2.4*sh;
    cam.lookAt(aim); cam.updateMatrixWorld();
    const cyc=(idle+1.2)%3.6, gk=eInOut(seg(cyc,0,1.1));
    glint.position.set(lerp(-500,500,gk),300,520); glint.target.position.set(lerp(-60,60,gk),0,0); glint.intensity=(t<0?1:0)*wake*7e5*Math.sin(Math.PI*gk);
    // ---------- pečeť pod napětím → prasknutí ----------
    // .10 dotek = vlasová trhlina, .10–.50 klopa táhne: horní kus se v lomu nadzvedá,
    // .50 PRASK: kus se uvolní a jede s klopou, úlomky odletí, obálka cukne
    const press=t<0?0:t<.1?eOut(seg(t,0,.1)):1-eOut(seg(t,.1,.22));
    const zs=1-.18*press; [S.intact,S.mB].forEach(m=>m.scale.z=k*zs); S.mT.scale.z=k*zs;
    const cracked=t>=.1; S.intact.visible=!cracked; S.mB.visible=S.mT.visible=cracked;
    S.clipIntact.constant=1e6; S.clipSplit.constant=1e6;
    const tension=eIn2(seg(t,.12,SNAP));
    const release=t>SNAP?Math.exp(-(t-SNAP)*9)*Math.cos((t-SNAP)*38):1;      // po prasknutí se kus zachvěje a usadí
    tPivot.rotation.x=THREE.MathUtils.degToRad(5.5*tension*(t>SNAP?release:1));
    // klopa: pod napětím jen nepatrně, po prasknutí poskočí a pak se plynule otevře
    let fa=2.5*tension;
    if(t>SNAP) fa=2.5+12*eOutBack2(seg(t,SNAP,SNAP+.16))+165.5*eInOut(seg(t,SNAP+.1,1.5));
    hinge.rotation.x=-THREE.MathUtils.degToRad(fa);
    // obálka cukne
    const kick=t>SNAP?Math.exp(-(t-SNAP)*16)*Math.sin((t-SNAP)*70):0; env.position.set(kick*1.5,0,-Math.abs(kick)*1.2);
    // úlomky
    chips.forEach(c=>{const tt=t-SNAP; c.m.visible=tt>0; if(tt<=0) return;
      let z=2.6+.12*k+c.vz*tt-800*tt*tt; const tg=(c.vz+Math.sqrt(c.vz*c.vz+800*4*(.12*k)))/1600;   // dopad na papír
      let x=c.x+c.vx*Math.min(tt,tg), y=(Math.random,0)+c.vy*Math.min(tt,tg);
      if(tt>tg){const t2=tt-tg, v2=Math.min(80,c.vz*.25); z=2.6+Math.max(0,v2*t2-800*t2*t2); x+=c.vx*.3*Math.min(t2,.2); y+=c.vy*.3*Math.min(t2,.2);}
      c.m.position.set(x,y,Math.max(2.6,z)); c.m.rotation.set(c.wx*Math.min(tt,tg+.15),c.wy*Math.min(tt,tg+.15),0);});
    // karta: vyjede z obálky a pak přiletí ke kameře
    const out=eInOut(seg(t,1.2,2.05)), fly=eInOut(seg(t,1.95,2.9));
    const SLIDE=H/2-(CARD0.y-CH/2)+12;                                      // dráha, po které je karta celá venku
    const p0=CARD0.clone().add(new THREE.Vector3(0,SLIDE*out,0)); p0.z+=seg(out,.98,1)*4;
    const tgt=cardScreenPose(), wp=env.localToWorld(p0.clone());
    card.position.copy(env.worldToLocal(wp.lerp(tgt.pos,fly).add(new THREE.Vector3(0,0,Math.sin(Math.PI*fly)*60))));
    card.quaternion.copy(qCard0).slerp(tgt.q,fly);
    // světla potemní, když karta zakryje scénu
    const dim=1-seg(t,2.2,2.8); key.intensity=3.6e5*dim; stul.intensity=3.2e5*dim;
    renderer.render(scene,cam);
    return {anchor:cardAnchor(), fly};
  }
  return {update,resize,dispose(){renderer.dispose();renderer.forceContextLoss?.();}};
}
