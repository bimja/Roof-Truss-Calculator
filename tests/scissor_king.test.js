const p=require('puppeteer-core');(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox'],headless:'new'});const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
const U='http://localhost:8765/index.html';const ok=(n,c,x)=>console.log((c?'PASS ':'FAIL ')+n+(x?' -> '+x:''));
const rows=()=>pg.evaluate(()=>[...document.querySelectorAll('#check tr')].filter(t=>t.className).map(t=>t.cells[0].innerText.replace(/\s+/g,' ')+'='+t.className+' ['+t.innerText.replace(/\s+/g,' ').slice(0,90)+']'));
const sizes=()=>pg.evaluate(()=>$('size').value+'/'+$('bsize').value);
await pg.goto(U);await pg.evaluate(()=>localStorage.clear());await pg.reload();
ok('fresh fink default 2x4/2x4',(await sizes())==='2x4/2x4',await sizes());
await pg.select('#ttype','scissor');ok('switch to scissor -> 2x6/2x6',(await sizes())==='2x6/2x6',await sizes());
for(const r of await rows())console.log('  scissor rigid ceiling:',r);
await pg.select('#bcBrace','clr');for(const r of await rows())console.log('  scissor CLR 6ft:',r);
const nf=r=>r.filter(x=>/=fail/.test(x)).length;
await pg.select('#bcBrace','ceiling');ok('scissor default (ceiling) no NG',nf(await rows())===0);
await pg.select('#bcBrace','clr');ok('scissor default (CLR 6 ft) no NG',nf(await rows())===0);
// explicit user choice respected
await pg.reload();await pg.evaluate(()=>{localStorage.clear()});await pg.goto(U+'?ttype=fink');await pg.select('#size','2x8');ok('BC follows TC',(await sizes())==='2x8/2x8');
await pg.select('#ttype','scissor');ok('user explicit 2x8 not overridden on scissor switch',(await sizes())==='2x8/2x8',await sizes());
// saved design values respected
await pg.evaluate(()=>{const st=getState();st.inputs.ttype='scissor';st.inputs.size='2x4';st.inputs.bsize='2x4';setState(st)});ok('saved scissor 2x4 kept',(await sizes())==='2x4/2x4');
await pg.evaluate(()=>{const st=getState();delete st.inputs.bsize;st.inputs.size='2x8';setState(st)});ok('legacy design w/o bsize -> BC=TC',(await sizes())==='2x8/2x8');
await pg.goto(U+'?ttype=scissor&bpitch=3');ok('URL scissor new design -> 2x6/2x6',(await sizes())==='2x6/2x6');
await pg.goto(U+'?ttype=king');const km=await pg.evaluate(()=>document.body.innerText.includes('Panel too long for king post at this span — use Fink or Queen post.'));ok('king post long panel note',km);
await pg.goto(U+'?ttype=king&span=20');ok('king 20 ft span no note',!(await pg.evaluate(()=>document.body.innerText.includes('Panel too long'))));
ok('no JS errors',errs.length===0,errs.join(';'));
await pg.goto(U+'?ttype=scissor&bpitch=3&bcBrace=clr&proj=Scissor%20defaults');await pg.setViewport({width:1250,height:3600});await pg.screenshot({path:'/workspace/truss-calculator/preview.png'});
await b.close()})();
