const p=require('puppeteer-core');(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox'],headless:'new'});const pg=await b.newPage();
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
const cases=['fink','howe','king','queen','attic&pitch=12&span=28','mono','scissor&bpitch=3','scissor&bpitch=3&bcBrace=clr&clrSp=10','fink&tcBrace=purlin&purlinSp=24&bcBrace=clr&clrSp=10','scissor&bpitch=3&size=2x6&tcBrace=purlin&purlinSp=48'];
for(const c of cases){await pg.goto('http://localhost:8765/index.html?ttype='+c);await new Promise(r=>setTimeout(r,200));
const r=await pg.evaluate(()=>{const rows=[...document.querySelectorAll('#check tr')].filter(t=>t.className).map(t=>t.cells[0].innerText.replace(/\s+/g,' ')+'='+t.className);const o=window._truss;return {rows,clr:document.querySelectorAll('#diagram rect[stroke="#c62828"]').length,dash:document.querySelectorAll('#diagram line[stroke-dasharray="5 3"]').length,notes:!!document.getElementById('bracing').innerText.includes('BCSI')}});
console.log(c,JSON.stringify(r));}
console.log('errors',errs);await b.close()})();
