import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const publicRoot=path.join(root,process.env.SERVE_DIST==='1'?'dist':'src');
const port=Number(process.env.PORT||4173);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.json':'application/json; charset=utf-8'};

export const server=http.createServer(async(req,res)=>{
  if(req.method!=='GET' && req.method!=='HEAD'){res.writeHead(405,{'content-type':'text/plain'});res.end('Method Not Allowed');return;}
  let pathname;
  try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end('Bad Request');return;}
  const candidate=path.resolve(publicRoot,`.${pathname==='/'?'/index.html':pathname}`);
  if(candidate!==publicRoot && !candidate.startsWith(publicRoot+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
  try{
    const stat=await fs.stat(candidate);
    if(!stat.isFile())throw Error('Not a file');
    const bytes=await fs.readFile(candidate);
    res.writeHead(200,{'content-type':mime[path.extname(candidate)]||'application/octet-stream','cache-control':'no-store','x-content-type-options':'nosniff'});
    res.end(req.method==='HEAD'?undefined:bytes);
  }catch{res.writeHead(404,{'content-type':'text/plain; charset=utf-8'});res.end('Not Found');}
});

if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  server.listen(port,'127.0.0.1',()=>console.log(`GhostFlow ready at http://localhost:${port}`));
}
