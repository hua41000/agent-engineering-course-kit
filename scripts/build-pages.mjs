import {cpSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
const map=JSON.parse(readFileSync(join(root,'course-map.json'),'utf8'));
const composer=map.chapters.flatMap(c=>c.lessons).flatMap(l=>l.assets).find(a=>a.id==='agent-architecture-composer');
const output=join(root,'work/pages');
rmSync(output,{recursive:true,force:true});
const destination=join(output,composer.id);
mkdirSync(destination,{recursive:true});
for(const file of ['index.html','agent-architecture-composer-skill.zip','ICON-LICENSE.txt']){
 cpSync(join(root,composer.path,'dist',file),join(destination,file));
}
writeFileSync(join(output,'.nojekyll'),'');
writeFileSync(join(output,'index.html'),`<!doctype html>
<html lang="zh-CN">
<head>
 <meta charset="utf-8">
 <meta name="viewport" content="width=device-width, initial-scale=1">
 <meta http-equiv="refresh" content="0; url=./agent-architecture-composer/">
 <title>Agent Architecture Composer</title>
</head>
<body><a href="./agent-architecture-composer/">打开 Agent Architecture Composer</a></body>
</html>
`);
console.log('GitHub Pages artifact: '+output);
