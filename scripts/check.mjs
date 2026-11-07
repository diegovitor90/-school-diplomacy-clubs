import { readFileSync } from 'node:fs';
import vm from 'node:vm';
for (const path of ['src/Portal.html', 'demo/index.html']) {
  const html = readFileSync(path, 'utf8');
  for (const [, js] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(js, { filename: path });
  if (/AKfycb|iema\.edu\.ma\.gov\.br|1_ynarq/.test(html)) throw new Error('Institutional identifier in ' + path);
}
console.log('JavaScript syntax and institutional identifier checks passed.');
const {readdirSync}=await import('node:fs');
const sources=readdirSync('apps-script').filter(n=>n.endsWith('.gs'));
new vm.Script(sources.map(n=>readFileSync('apps-script/'+n,'utf8')).join('\n'));
for(const dir of ['apps-script','archive/v18']) for(const name of readdirSync(dir)) {
 const text=readFileSync(dir+'/'+name,'utf8');
 if(/AKfycb|iema\.edu\.ma\.gov\.br|1_ynarq|13d4srp/.test(text)) throw new Error('Private configuration in '+name);
 if(name.endsWith('.html')) for(const [,js] of text.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(js,{filename:name});
}
const manifest=JSON.parse(readFileSync('apps-script/appsscript.json','utf8'));
if(manifest.webapp.access!=='MYSELF') throw new Error('Unexpected deployment access');
console.log('Server, archived HTML and manifest checks passed.');
