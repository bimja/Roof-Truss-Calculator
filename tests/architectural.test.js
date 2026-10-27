// Architectural (heavy timber) truss type – run: python3 -m http.server 8765 (repo root), then node tests/architectural.test.js
const p=require('puppeteer-core');(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox'],headless:'new'});const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
const U='http://localhost:8765/index.html';let nf=0;const ok=(n,c,x)=>{if(!c)nf++;console.log((c?'PASS ':'FAIL ')+n+(x!==undefined?' -> '+x:''))};const near=(a,b,t=0.002)=>Math.abs(a-b)<=t*Math.max(1,Math.abs(b));
await pg.goto(U);await pg.evaluate(()=>localStorage.clear());await pg.reload();
// NDS reference values / dressed sizes / size factors
const v=await pg.evaluate(()=>({df48:timberVals('DF','No2','4x8',false),df412:timberVals('DF','No1','4x12',false),syp48:timberVals('SYP','No2','4x8',false),syp410:timberVals('SYP','No2','4x10',false),
 df66:timberVals('DF','No1','6x6',false),df68:timberVals('DF','No1','6x8',false),df610:timberVals('DF','No1','6x10',false),df814:null,df612w:timberVals('DF','No1','6x12',true),df48w:timberVals('DF','No2','4x8',true),syp610w:timberVals('SYP','No1','6x10',true),dims:TIMBER}));
ok('4x8 dressed 3.5x7.25',v.dims['4x8'].join()==='3.5,7.25');ok('6x8 dressed 5.5x7.5',v.dims['6x8'].join()==='5.5,7.5');ok('6x12 dressed 5.5x11.5',v.dims['6x12'].join()==='5.5,11.5');
ok('DF No2 4x8 dimension Table 4A, CF 1.3/1.2/1.05',v.df48.Fb===900&&v.df48.CFb===1.3&&v.df48.CFt===1.2&&v.df48.CFc===1.05&&/Dimension/.test(v.df48.cat));
ok('DF No1 4x12 CF Fb 1.1',v.df412.CFb===1.1&&v.df412.CFt===1.0);
ok('SYP No2 4x8 Table 4B Fb 925, CF 1.1 (4" thick, >=8" wide)',v.syp48.Fb===925&&v.syp48.CFb===1.1&&v.syp48.Fc===1350);
ok('SYP No2 4x10 Fb 800',v.syp410.Fb===800);
ok('DF No1 6x6 = Posts & Timbers Fb 1200 Fc 1000',v.df66.cat==='Posts & Timbers'&&v.df66.Fb===1200&&v.df66.Fc===1000);
ok('DF No1 6x8 = Posts & Timbers (8-6 not > 2)',v.df68.cat==='Posts & Timbers');
ok('DF No1 6x10 = Beams & Stringers Fb 1350 Fc 925',v.df610.cat==='Beams & Stringers'&&v.df610.Fb===1350&&v.df610.Fc===925);
ok('timber CF=1 for d<=12',v.df610.CFb===1&&v.df612w.CFb===1);
ok('wet timbers CM Fc 0.91, Fb 1.0',v.df612w.CM.Fc===0.91&&v.df612w.CM.Fb===1);
ok('wet DF 4x8 dimension CM Fb .85 (Fb*CF=1170>1150) Fc .8 E .9',v.df48w.CM.Fb===0.85&&v.df48w.CM.Fc===0.8&&v.df48w.CM.E===0.9);
ok('SYP timbers already wet values CM=1',v.syp610w.CM.Fc===1);
// bolt yield: 5/8 bolt, 1/4 knife plate, DF 3.5 member -> Mode IIIs ~2310 lb (hand calc)
const z=await pg.evaluate(()=>boltZ(0.625,'knife',3.5,0.25,0.5));ok('knife plate 5/8" DF Z ≈ 2312 lb, mode IIIs',near(z.Z,2312,0.01)&&z.mode==='IIIs',z.Z.toFixed(0)+' '+z.mode);
const zs=await pg.evaluate(()=>boltZ(0.75,'side',5.5,0.25,0.5));ok('side plates 3/4" in 6x DF: Z>0, finite',zs.Z>1000&&isFinite(zs.Z),zs.Z.toFixed(0)+' '+zs.mode);
// UI: select arch shows box, hides 2x controls, defaults pass
await pg.select('#ttype','arch');
const vis=await pg.evaluate(()=>({box:getComputedStyle($('archBox')).display,std:[...document.querySelectorAll('.stdOnly')].every(e=>e.style.display==='none'),rows:document.querySelectorAll('#check tr').length,a:window._arch&&{maxR:_arch.maxR,maxC:_arch.maxC}}));
ok('arch box shown, 2x-only inputs hidden',vis.box==='block'&&vis.std);ok('arch check table rendered',vis.rows>5&&vis.a,JSON.stringify(vis.a));
for(const pat of ['king','kingstrut','queen','howe']){await pg.select('#archPat',pat);const r=await pg.evaluate(()=>({m:_arch.maxR,c:_arch.chk.length,eq:_truss.G.maxRes,sum:_truss.G.R[_truss.G.ia*3+1]+_truss.G.R[_truss.G.ie*3+1],ap:-_truss.G.sumFy}));
 ok(`pattern ${pat}: analysed, equilibrium`,r.c>=3&&isFinite(r.m)&&r.eq<1e-3&&near(r.sum,r.ap,1e-6),`members ${r.c}, max ${(r.m*100).toFixed(0)}%`);}
// wet toggle lowers capacity (ratio up)
await pg.evaluate(()=>{$('span').value=20;$('archBcBr').value=5;calculate()});await pg.select('#archPat','kingstrut');const dry=await pg.evaluate(()=>{$('archWet').checked=false;calculate();return _arch.maxR});const wet=await pg.evaluate(()=>{$('archWet').checked=true;calculate();return _arch.maxR});ok('wet service raises ratio',wet>dry,`${(dry*100).toFixed(1)}% -> ${(wet*100).toFixed(1)}%`);
const sl=await pg.evaluate(()=>{$('archBcBr').value=0;$('span').value=30;calculate();const r=_arch.maxR===Infinity,t=$('check').innerText;$('archBcBr').value=5;$('span').value=20;calculate();return {r,t}});ok('unbraced 30 ft BC under wind compression flagged l/d > 50 NG',sl.r&&/> 50/.test(sl.t),String(sl.r));
// wider spacing raises demand roughly in proportion
const r4=await pg.evaluate(()=>{$('archSp').value=4;calculate();return _arch.Rg}),r8=await pg.evaluate(()=>{$('archSp').value=8;calculate();return _arch.Rg}),r12=await pg.evaluate(()=>{$('archSp').value=12;calculate();return _arch.Rg});ok('reaction grows with spacing 4/8/12 ft',r4<r8&&r8<r12,[r4,r8,r12].map(x=>x.toFixed(0)).join('/'));
const w2=await pg.evaluate(()=>{$('archSp').value=2;calculate();return document.getElementById('msgs').innerText});ok('spacing outside 4–12 ft warns',/outside the typical 4–12 ft/.test(w2));
// hand check: king post truss, no webs bending: reaction = total load/2
const hk=await pg.evaluate(()=>{const st=getState();Object.assign(st.inputs,{ttype:'arch',archPat:'king',span:'20',spanU:'ft',pitch:'6',ovh:'0',archSp:'8',tcdl:'10',bcdl:'0',lr:'20',snow:'0',archPkD:'0',archPkL:'0',archPkA:'0'});setState(st);const tot=(_arch.swTC+30*8)*20+_arch.swBC*20;return {R:_arch.Rg,exp:tot/2}});ok('king post gravity reaction = wL/2 (incl. self wt)',near(hk.R,hk.exp,1e-6),hk.R.toFixed(1)+' vs '+hk.exp.toFixed(1));
// peak point load adds P/2 to each bearing
const pk=await pg.evaluate(()=>{const a=_arch.Rg;$('archPkD').value=1000;$('archPkL').value=1000;calculate();return _arch.Rg-a});ok('peak point load 2000 lb adds 1000 lb per bearing',near(pk,1000,1e-6),pk.toFixed(1));
// fewer bolts raises connection ratio; NG flagged
const c1=await pg.evaluate(()=>{$('archBolts').value=1;calculate();return {c:_arch.maxC,t:document.getElementById('msgs').innerText}});const c4=await pg.evaluate(()=>{$('archBolts').value=4;calculate();return _arch.maxC});ok('bolt group ratio scales with bolt count',near(c1.c/c4,4,1e-6));
// save/load/export roundtrip incl. arch fields
await pg.evaluate(()=>{$('proj').value='ARCH test';$('archTC').value='6x10';$('archWeb').value='6x6';$('archConn').value='side';$('archWet').checked=false;calculate()});
const s1=await pg.evaluate(()=>JSON.stringify(getState().inputs));await pg.click('#save');await pg.evaluate(()=>{$('reset').click()});
ok('reset returns to fink & arch defaults',await pg.evaluate(()=>$('ttype').value==='fink'&&$('archTC').value==='4x8'&&$('archWet').checked));
await pg.select('#loadSel','ARCH test');await pg.click('#loadBtn');const s2=await pg.evaluate(()=>JSON.stringify(getState().inputs));ok('save/load restores arch inputs exactly',s1===s2);
await pg.reload();ok('autosave restores arch design after refresh',await pg.evaluate(()=>$('ttype').value==='arch'&&$('archTC').value==='6x10'&&getComputedStyle($('archBox')).display==='block'));
// legacy design without arch fields loads with defaults
await pg.evaluate(()=>setState({inputs:{ttype:'fink',span:'30',size:'2x4'}}));ok('legacy (pre-arch) design loads, arch defaults',await pg.evaluate(()=>$('archSp').value==='8'&&$('archTC').value==='4x8'&&$('ttype').value==='fink'&&document.querySelectorAll('#check tr').length>3));
// URL prefill
await pg.goto(U+'?ttype=arch&archPat=queen&span=24&archTC=6x8&archSp=10');ok('URL prefill arch',await pg.evaluate(()=>_arch&&_arch.RV.TC.sz==='6x8'&&$('archPat').value==='queen'));
// other truss types unaffected (std controls visible again)
await pg.select('#ttype','scissor');ok('switching back shows standard inputs',await pg.evaluate(()=>[...document.querySelectorAll('.stdOnly')].every(e=>e.style.display==='')&&getComputedStyle($('archBox')).display==='none'));
ok('no JS errors',errs.length===0,errs.join(';'));
console.log(nf?`${nf} FAILED`:'ALL PASS');await b.close();process.exit(nf?1:0)})();
