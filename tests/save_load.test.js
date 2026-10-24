const p=require('puppeteer-core');(async()=>{
const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox'],headless:'new'});
const pg=await b.newPage();await pg.setViewport({width:1250,height:1400});
pg.on('dialog',d=>d.accept(d.type()==='prompt'?'2026-10-999 Scissor copy':undefined));
const U='http://localhost:8765/index.html';const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);
await pg.goto(U);await pg.evaluate(()=>localStorage.clear());await pg.reload();
const setv=async(id,v)=>pg.evaluate((id,v)=>{const e=document.getElementById(id);e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))},id,v);
await setv('proj','2026-10-999 Scissor test');await setv('ttype','scissor');await setv('bpitch','2.5');await setv('span','28');await setv('addr','1 Test Ln, Galveston TX');await setv('riskCat','III');await setv('expo','D');await setv('vwind','150');await setv('species','SPF');await setv('size','2x6');await setv('heel','6');
await pg.evaluate(()=>{const c=document.getElementById('windAuto');c.checked=false;c.dispatchEvent(new Event('input',{bubbles:true}))});await setv('wind','33.3');
await pg.click('#tAngle');
const st0=await pg.evaluate(()=>JSON.stringify(getState().inputs)+getState().angleMode);
const res0=await pg.evaluate(()=>document.getElementById('cards').innerText+document.getElementById('joints').innerText);
await pg.click('#save');
// refresh -> autosave
await pg.reload();
ok('autosave restores inputs on refresh',await pg.evaluate(()=>JSON.stringify(getState().inputs)+getState().angleMode)===st0);
ok('analysis rerun identical after refresh',await pg.evaluate(()=>document.getElementById('cards').innerText+document.getElementById('joints').innerText)===res0);
// save as
await pg.click('#saveAs');
const opts=await pg.evaluate(()=>[...document.querySelectorAll('#loadSel option')].map(o=>o.textContent));console.log(opts);
ok('dropdown lists 2 designs with dates',opts.length===3&&/\d{4}/.test(opts[1]));
// reset then load original
await pg.click('#reset');ok('reset changed state',await pg.evaluate(()=>document.getElementById('ttype').value)==='fink');
await pg.select('#loadSel','2026-10-999 Scissor test');await pg.click('#loadBtn');
ok('load restores exact inputs',await pg.evaluate(()=>JSON.stringify(getState().inputs)+getState().angleMode)===st0);
ok('load reruns analysis identically',await pg.evaluate(()=>document.getElementById('cards').innerText+document.getElementById('joints').innerText)===res0);
// export
const json=await pg.evaluate(()=>JSON.stringify(getState()));require('fs').writeFileSync('/tmp/pt/design.json',json);
const cdp=await pg.target().createCDPSession();await cdp.send('Page.setDownloadBehavior',{behavior:'allow',downloadPath:'/tmp/pt/dl'});
await pg.click('#exportJson');await new Promise(r=>setTimeout(r,800));const f=require('fs').readdirSync('/tmp/pt/dl');console.log('downloaded',f);
// new browser profile (like 2nd PC) -> import
const b2=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox'],headless:'new'});const q=await b2.newPage();await q.goto(U);
await q.evaluate(()=>localStorage.clear());await q.reload();
const [fc]=await Promise.all([q.waitForFileChooser(),q.click('#importJson')]);await fc.accept(['/tmp/pt/dl/'+f[0]]);await new Promise(r=>setTimeout(r,500));
ok('import (fresh browser) restores exact inputs',await q.evaluate(()=>JSON.stringify(getState().inputs)+getState().angleMode)===st0);
ok('import reruns analysis identically',await q.evaluate(()=>document.getElementById('cards').innerText+document.getElementById('joints').innerText)===res0);
// delete
pg.removeAllListeners('dialog');pg.on('dialog',d=>d.accept());await pg.select('#loadSel','2026-10-999 Scissor copy');await pg.click('#delBtn');
ok('delete removes design',await pg.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('mdiTruss.designs.v1'))).join('|'))==='2026-10-999 Scissor test');
await pg.screenshot({path:'/workspace/truss-calculator/preview.png',fullPage:false});
await b.close();await b2.close();})();
