import assert from 'node:assert/strict';
import {readFileSync, mkdtempSync, rmSync, existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync, spawn} from 'node:child_process';
import {Script} from 'node:vm';

const root=fileURLToPath(new URL('../',import.meta.url));
const map=JSON.parse(readFileSync(join(root,'course-map.json'),'utf8'));
const asset=map.chapters.flatMap(c=>c.lessons).flatMap(l=>l.assets).find(a=>a.id==='agent-architecture-composer');
const project=resolve(root,asset.path), dist=join(project,'dist');
const temp=mkdtempSync(join(tmpdir(),'course-kit-smoke-'));
const run=(file,args,options={})=>{
 const result=spawnSync(file,args,{encoding:'utf8',...options});
 assert.equal(result.status,0,result.stderr||result.stdout||String(result.error));
 return result.stdout;
};
let server;
try{
 const html=readFileSync(join(dist,'index.html'),'utf8');
 const script=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).join('\n');
 assert.ok(script.includes('BUNDLED_SKILL'),'Embedded Skill download missing');
 new Script(script);
 assert.ok(!/<(?:script|link|img)\b[^>]*(?:src|href)=["']https?:/i.test(html),'Offline page has remote asset dependencies');
 run('python3',['-m','zipfile','-e',join(dist,'agent-architecture-composer-skill.zip'),temp]);
 const source=join(project,'skill/scripts/composer.mjs');
 const bundled=join(temp,'agent-architecture-composer/scripts/composer.mjs');
 const input=join(project,'examples/dataagent.json');
 for(const args of [['template','data'],['questions','--input',input],['recommend','--input',input]]){
  assert.deepEqual(JSON.parse(run(process.execPath,[source,...args])),JSON.parse(run(process.execPath,[bundled,...args])));
 }
 for(const [name,cli] of [['source',source],['bundled',bundled]]){
  const output=join(temp,name);
  run(process.execPath,[cli,'recommend','--input',input,'--out-dir',output]);
  for(const file of ['report.md','adr.md','architecture.mmd','session.json','decision.json'])assert.ok(existsSync(join(output,file)));
  const before=readFileSync(join(output,'report.md'),'utf8');
  const repeat=spawnSync(process.execPath,[cli,'recommend','--input',input,'--out-dir',output],{encoding:'utf8'});
  assert.equal(repeat.status,2,'CLI must refuse to overwrite reports');
  assert.equal(readFileSync(join(output,'report.md'),'utf8'),before);
 }
 server=spawn(process.execPath,[join(project,'scripts/serve.mjs')],{env:{...process.env,COMPOSER_PORT:'0'},stdio:['ignore','pipe','pipe']});
 const port=await new Promise((accept,reject)=>{
  const timeout=setTimeout(()=>reject(new Error('Preview server did not start')),10000);
  server.once('error',error=>{clearTimeout(timeout);reject(error);});
  server.once('exit',code=>{clearTimeout(timeout);reject(new Error('Preview server exited: '+code));});
  let text='';server.stdout.on('data',data=>{text+=data;const match=text.match(/http:\/\/127\.0\.0\.1:(\d+)/);if(match){clearTimeout(timeout);accept(match[1]);}});
 });
 const response=await fetch(`http://127.0.0.1:${port}/`);
 assert.equal(response.status,200);assert.equal(await response.text(),html);
 assert.equal((await fetch(`http://127.0.0.1:${port}/missing`)).status,404);
 console.log('Offline bundle, extracted Skill, source CLI and preview server: passed');
}finally{
 if(server){server.kill();await new Promise(resolve=>server.exitCode!==null?resolve():server.once('exit',resolve));}
 rmSync(temp,{recursive:true,force:true});
}
