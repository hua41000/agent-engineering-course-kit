#!/usr/bin/env node
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';
const bundled=new URL('../lib/',import.meta.url);
const base=existsSync(new URL('core.mjs',bundled))?bundled:new URL('../../src/',import.meta.url);
const {normalize,scenarioSession,nextQuestions,recommend}=await import(new URL('core.mjs',base));
const {QUESTIONS,PATTERNS,FRAMEWORKS,SCENARIOS}=await import(new URL('knowledge.mjs',base));
const {reportMarkdown,adrMarkdown,mermaid}=await import(new URL('report.mjs',base));
const args=process.argv.slice(2),command=args[0]||'help';
const value=(flag)=>{const i=args.indexOf(flag);if(i<0)return null;if(!args[i+1]||args[i+1].startsWith('--'))throw new Error(flag+' 需要参数。');return args[i+1];};
try {
 if(command==='help'||command==='--help'){
  console.log('Architecture Composer\n\nNode.js 20+，无需 npm 依赖。\n\n  template [scenario]              输出 Session 模板\n  questions --input session.json   查看待澄清问题\n  recommend --input session.json [--out-dir output]\n  guide                            查看模式与框架速查\n\n场景：'+SCENARIOS.map(s=>s.id+' ('+s.name+')').join(', '));
 }else if(command==='template'){
  const id=args[1];if(id&&!SCENARIOS.some(s=>s.id===id))throw new Error('未知场景；运行 help 查看可用值。');
  console.log(JSON.stringify(id?scenarioSession(id):normalize({}),null,2));
 }else if(command==='guide'){
  console.log(JSON.stringify({questions:QUESTIONS,patterns:PATTERNS,frameworks:FRAMEWORKS},null,2));
 }else if(command==='questions'||command==='recommend'){
  const input=value('--input');if(!input)throw new Error('请通过 --input 指定 Session JSON。');
  const raw=readFileSync(resolve(input),'utf8');if(Buffer.byteLength(raw)>1024*1024)throw new Error('Session 文件不能超过 1 MB。');
  const s=normalize(JSON.parse(raw));
  if(command==='questions')console.log(JSON.stringify(nextQuestions(s),null,2));
  else {
   const d=recommend(s),out=value('--out-dir');
   if(!out)console.log(JSON.stringify(d,null,2));
   else {
    const dir=resolve(out);
    const files={'report.md':reportMarkdown(d),'adr.md':adrMarkdown(d),'architecture.mmd':mermaid(d),'session.json':JSON.stringify(s,null,2)+'\n','decision.json':JSON.stringify(d,null,2)+'\n'};
    for(const name of Object.keys(files))if(existsSync(join(dir,name)))throw new Error('输出文件已存在，请选择新目录：'+join(dir,name));
    mkdirSync(dir,{recursive:true});for(const [name,body] of Object.entries(files))writeFileSync(join(dir,name),body,{flag:'wx'});
    console.log(d.architecture.name+' · '+d.status+'\n报告：'+join(dir,'report.md'));
   }
  }
 }else throw new Error('未知命令：'+command+'。运行 help 查看用法。');
}catch(error){console.error('Composer: '+error.message);process.exitCode=2;}
