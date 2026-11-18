import {test} from 'node:test';
import assert from 'node:assert/strict';
import {server} from '../scripts/serve.mjs';

const address=await new Promise((resolve,reject)=>{
  server.once('error',reject);
  server.listen(0,'127.0.0.1',()=>resolve(server.address()));
});
const base=`http://127.0.0.1:${address.port}`;
test.after(()=>new Promise(resolve=>server.close(resolve)));

test('root serves HTML',async()=>{const r=await fetch(base+'/');assert.equal(r.status,200);assert.match(r.headers.get('content-type'),/text\/html/);assert.match(await r.text(),/GhostFlow/);});
test('application module serves JavaScript',async()=>{const r=await fetch(base+'/app.mjs');assert.equal(r.status,200);assert.match(r.headers.get('content-type'),/javascript/);assert.match(await r.text(),/simulateRequest/);});
test('stylesheet serves correct MIME',async()=>{const r=await fetch(base+'/styles.css');assert.equal(r.status,200);assert.match(r.headers.get('content-type'),/text\/css/);});
test('unknown asset returns 404',async()=>assert.equal((await fetch(base+'/missing.js')).status,404));
test('POST denied on read-only server',async()=>assert.equal((await fetch(base+'/',{method:'POST'})).status,405));
test('server explicitly prevents parent-path traversal',async()=>{const r=await fetch(base+'/%2e%2e%2fpackage.json');assert.ok([403,404].includes(r.status));});
