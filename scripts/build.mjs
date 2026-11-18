import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=path.join(root,'src');const output=path.join(root,'dist');
await fs.rm(output,{recursive:true,force:true});await fs.mkdir(output,{recursive:true});
for(const name of ['index.html','styles.css','app.mjs','model.mjs','favicon.svg']) {
  await fs.copyFile(path.join(source,name),path.join(output,name));
}
console.log('Built static site into dist/ with relative asset URLs.');
