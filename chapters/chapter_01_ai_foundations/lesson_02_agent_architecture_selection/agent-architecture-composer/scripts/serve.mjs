import {createServer} from 'node:http';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const index=fileURLToPath(new URL('../dist/index.html',import.meta.url));
if(!existsSync(index)){const r=spawnSync(process.execPath,[fileURLToPath(new URL('./build.mjs',import.meta.url))],{stdio:'inherit'});if(r.status)process.exit(r.status);}
const port=Number(process.env.COMPOSER_PORT||4173);
const server=createServer((req,res)=>{
 if(req.url==='/'||req.url==='/index.html'){res.writeHead(200,{'Content-Type':'text/html;charset=utf-8','Cache-Control':'no-store'});res.end(readFileSync(index));}
 else {res.writeHead(404);res.end('Not found');}
});
server.listen(port,'127.0.0.1',()=>console.log('Architecture Composer: http://127.0.0.1:'+server.address().port));
