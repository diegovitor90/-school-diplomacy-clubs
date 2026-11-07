import { readFileSync } from 'node:fs';
import vm from 'node:vm';
for (const path of ['src/Portal.html', 'demo/index.html']) {
  const html = readFileSync(path, 'utf8');
  for (const [, js] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(js, { filename: path });
  if (/AKfycb|iema\.edu\.ma\.gov\.br|1_ynarq/.test(html)) throw new Error('Institutional identifier in ' + path);
}
console.log('JavaScript syntax and institutional identifier checks passed.');
