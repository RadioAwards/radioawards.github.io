// Radio Awards 2026 — živá 3D soška (Shure 55) pro pozvánku.
// Stejná geometrie jako 3D/soska.html, jen bez stínů a s průhledným pozadím kvůli výkonu na mobilu.
import * as THREE from './vendor/three.module.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';
import { mergeGeometries } from './vendor/BufferGeometryUtils.js';

export function createSoska(canvas){
  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();

  // odrazy: tmavý sál, teplé reflektory shora
  { const env = new THREE.Scene(); env.background = new THREE.Color(0x060504);
    env.add(new THREE.Mesh(new THREE.BoxGeometry(40,24,40), new THREE.MeshBasicMaterial({color:0x0b0907, side:THREE.BackSide})));
    const glow=(w,h,c,i,pos,look)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(c).multiplyScalar(i),side:THREE.DoubleSide}));m.position.set(...pos);m.lookAt(...look);env.add(m);};
    for(let k=-2;k<=2;k++) glow(2.2,2.2,0xffd9a0,k===0?9:6,[k*4.5,11.5,2],[0,0,0]);
    glow(10,3,0xffe2b5,2.2,[0,6,14],[0,2,0]);
    glow(1.2,14,0xffc987,4.0,[-13,4,-8],[0,3,0]); glow(1.2,14,0xffd7a8,2.5,[13,4,-6],[0,3,0]);
    glow(30,30,0x3a2a16,1.0,[0,-11,0],[0,0,0]);
    const pm=new THREE.PMREMGenerator(renderer); scene.environment=pm.fromScene(env,0.02).texture; pm.dispose(); }

  // materiály
  const noise=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');const id=g.createImageData(256,256);let s=1;const r=()=>{s=(s*16807)%2147483647;return s/2147483647};
    for(let i=0;i<256*256;i++){const v=150+r()*80;id.data.set([v,v,v,255],i*4);}g.putImageData(id,0,0);
    const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,3);return t;})();
  const brass=new THREE.MeshPhysicalMaterial({color:0xa88748,metalness:1,roughness:.42,roughnessMap:noise,bumpMap:noise,bumpScale:.6,clearcoat:.15,clearcoatRoughness:.5});
  const brassDeep=new THREE.MeshPhysicalMaterial({color:0x4a3616,metalness:1,roughness:.62,roughnessMap:noise});
  const black=new THREE.MeshPhysicalMaterial({color:0x0d0d0e,metalness:.05,roughness:.55,clearcoat:.15,clearcoatRoughness:.6});

  const trophy=new THREE.Group(); scene.add(trophy);
  const add=(geo,mat,parent=trophy)=>{const m=new THREE.Mesh(geo,mat);parent.add(m);return m;};

  // podstavec + štítek
  const BASE_H=1.25;
  add(new RoundedBoxGeometry(4.3,BASE_H,3.3,4,.06),black).position.y=BASE_H/2;
  { // štítek: tlumená broušená mosaz, ryté písmo — čitelný, ale nekřičí
    const PL=Object.assign({c0:'#9c7c42',c1:'#cfb170',c2:'#94763e',txt:'#3a2a0e',em:.07,spot:22,met:.55,w:2.9,h:.86},window.__PLATE||{});
    const c=document.createElement('canvas');c.width=1024;c.height=300;const g=c.getContext('2d');
    const gr=g.createLinearGradient(0,0,1024,300);gr.addColorStop(0,PL.c0);gr.addColorStop(.45,PL.c1);gr.addColorStop(1,PL.c2);
    g.fillStyle=gr;g.fillRect(0,0,1024,300);
    for(let i=0;i<300;i+=2){g.fillStyle=`rgba(${i%4?255:90},${i%4?240:70},${i%4?200:30},.05)`;g.fillRect(0,i,1024,1);}   // brus
    g.strokeStyle='rgba(60,40,10,.45)';g.lineWidth=6;g.strokeRect(16,16,992,268);
    g.fillStyle=PL.txt;g.textAlign='center';g.textBaseline='middle';
    g.font='900 120px Helvetica, Arial';g.fillText('RADIO AWARDS',512,122);
    g.font='700 58px Helvetica, Arial';g.fillText('PLZEŇSKÝ KRAJ  ·  2026',512,214);
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;
    const plate=add(new THREE.BoxGeometry(PL.w,PL.h,.04),new THREE.MeshPhysicalMaterial({map:t,metalness:PL.met,roughness:.36,emissive:0xffffff,emissiveMap:t,emissiveIntensity:PL.em}));
    plate.position.set(0,BASE_H/2,1.67);
    // malé bodové světlo zepředu jen na štítek
    const pl=new THREE.SpotLight(0xffe7c4,PL.spot,30,THREE.MathUtils.degToRad(8),.8,1.4);
    pl.position.set(0,BASE_H/2+2.2,14);pl.target=plate;scene.add(pl);
  }
  // soustružená noha
  const p=[];const pt=(r,y)=>p.push(new THREE.Vector2(r,y));
  pt(0,0);pt(1.42,0);pt(1.46,.03);pt(1.46,.12);pt(1.40,.15);pt(1.30,.17);pt(1.30,.26);pt(1.24,.29);pt(1.16,.30);pt(1.16,.37);pt(1.10,.40);
  for(let i=0;i<=20;i++){const t=i/20;pt(.40+.68*Math.pow(1-t,2.3),.40+t*1.45);}
  pt(.47,1.86);pt(.50,1.90);pt(.50,1.98);pt(.44,2.01);pt(.33,2.03);pt(.33,2.22);
  for(let i=0;i<=10;i++){const a=-Math.PI/2+Math.PI*i/10;pt(.40+.20*Math.cos(a),2.33+.11*Math.sin(a));}
  pt(.31,2.46);pt(.31,2.72);pt(.37,2.74);pt(.37,2.82);pt(.29,2.84);pt(.27,3.05);pt(.30,3.08);pt(.30,3.16);pt(0,3.16);
  add(new THREE.LatheGeometry(p,72),brass).position.y=BASE_H;
  const NECK_TOP=BASE_H+3.16;
  const joint=new THREE.Group();joint.position.set(0,NECK_TOP+.28,0);trophy.add(joint);
  add(new THREE.CylinderGeometry(.24,.24,.62,32).rotateZ(Math.PI/2),brass,joint);
  for(const s of [-1,1]) add(new THREE.CylinderGeometry(.17,.17,.08,24).rotateZ(Math.PI/2),brass,joint).position.x=s*.35;
  add(new THREE.CylinderGeometry(.22,.26,.32,32),brass).position.y=NECK_TOP+.12;

  // hlava
  const head=new THREE.Group();joint.add(head);head.rotation.x=-THREE.MathUtils.degToRad(26);
  const L=3.7,A=1.08,B=.80,NE=3.2,Y0=.22;
  const prof=s=>{const u=(s-.5)/.5;return Math.pow(Math.max(0,1-Math.pow(Math.abs(u),5.5)),.42)*(1+.035*(1-u*u)+.05*(s-.5));};
  const se=(t,a,b)=>{const c=Math.cos(t),s=Math.sin(t);return [a*Math.sign(c)*Math.pow(Math.abs(c),2/NE),b*Math.sign(s)*Math.pow(Math.abs(s),2/NE)];};
  const loft=(sc,s0,s1,nS=60,nT=64)=>{const pos=[],idx=[];
    for(let i=0;i<=nS;i++){const s=s0+(s1-s0)*i/nS,k=prof(s);for(let j=0;j<=nT;j++){const [x,z]=se(j/nT*Math.PI*2,A*sc*k,B*sc*k);pos.push(x,Y0+s*L,z);}}
    for(let i=0;i<nS;i++)for(let j=0;j<nT;j++){const a=i*(nT+1)+j,b=a+nT+1;idx.push(a,b,a+1,b,b+1,a+1);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g;};
  add(loft(.96,0,1),brassDeep,head); add(loft(1,0,.115),brass,head); add(loft(1,.905,1),brass,head);
  const ribs=[];for(let i=0;i<15;i++){const s=.14+(.885-.14)*i/14,k=prof(s);const pts=[];
    for(let j=0;j<96;j++){const [x,z]=se(j/96*Math.PI*2,A*k*.975,B*k*.975);pts.push(new THREE.Vector3(x,0,z));}
    const g=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,true),120,.085,10,true);g.scale(1,.8,1);g.translate(0,Y0+s*L,0);ribs.push(g);}
  add(mergeGeometries(ribs),brass,head);
  const ridge=(xo,zs)=>{const pts=[];for(let i=0;i<=40;i++){const s=.05+.9*i/40,k=prof(s),a=A*k,b=B*k,xn=Math.min(.999,Math.abs(xo)/a);
      pts.push(new THREE.Vector3(xo,Y0+s*L,zs*(b*Math.pow(1-Math.pow(xn,NE),1/NE)+.05)));}
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),80,.07,8,false);};
  for(const side of [1,-1]){add(ridge(-.2,side),brass,head);add(ridge(.2,side),brass,head);
    const g=new THREE.BufferGeometry(),pos=[],idx=[],nS=40,nX=6;
    for(let i=0;i<=nS;i++){const s=.07+.86*i/nS,k=prof(s),a=A*k,b=B*k;for(let j=0;j<=nX;j++){const x=-.17+.34*j/nX,xn=Math.min(.999,Math.abs(x)/a);pos.push(x,Y0+s*L,side*(b*Math.pow(1-Math.pow(xn,NE),1/NE)+.075));}}
    for(let i=0;i<nS;i++)for(let j=0;j<nX;j++){const a=i*(nX+1)+j,b=a+nX+1;side>0?idx.push(a,a+1,b,b,a+1,b+1):idx.push(a,b,a+1,b,b+1,a+1);}
    g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();add(g,brass,head);}

  // přímá světla
  scene.add(new THREE.HemisphereLight(0xffe7c0,0x140d06,.25));
  const spot=(c,i,pos,tgt,ang)=>{const l=new THREE.SpotLight(c,i,40,THREE.MathUtils.degToRad(ang),.6,1.6);l.position.set(...pos);l.target.position.set(...tgt);scene.add(l,l.target);};
  spot(0xffe2b0,260,[1.5,17,5],[0,4.5,0],22); spot(0xffc27a,160,[-7,12,-7],[0,5,0],25); spot(0xffd9a8,90,[8,10,-5],[0,6,0],25);

  const cam=new THREE.PerspectiveCamera(17,.75,1,200); cam.position.set(0,4.2,37); cam.lookAt(0,4.7,0);

  // stav: yaw (°), reveal 0..1 (vynoření ze tmy + mírný sjezd)
  const st={yaw:-15,reveal:0};
  function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();}
  function draw(){trophy.rotation.y=THREE.MathUtils.degToRad(st.yaw);trophy.position.y=(1-st.reveal)*1.2;
    renderer.toneMappingExposure=.05+1.0*st.reveal;renderer.render(scene,cam);}
  resize(); window.addEventListener('resize',resize);
  return {st,draw,resize};
}
