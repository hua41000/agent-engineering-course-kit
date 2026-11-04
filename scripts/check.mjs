import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve, sep} from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
const map=JSON.parse(readFileSync(new URL('../course-map.json',import.meta.url),'utf8'));
const lessonNumbers=new Set();
const assetIds=new Set();
const checkPath=(path)=>{
 const absolute=resolve(root,path);
 assert.ok(absolute.startsWith(root.endsWith(sep)?root:root+sep),'Path outside repository: '+path);
 assert.ok(existsSync(absolute),'Missing path: '+path);
};
for(const chapter of map.chapters){
 checkPath(chapter.path+'/README.md');
 for(const lesson of chapter.lessons){
  assert.ok(!lessonNumbers.has(lesson.number),'Duplicate lesson: '+lesson.number);
  lessonNumbers.add(lesson.number);
  assert.ok(lesson.path.startsWith(chapter.path+'/'),'Lesson outside chapter');
  checkPath(lesson.path+'/README.md');
  for(const asset of lesson.assets){
   assert.ok(!assetIds.has(asset.id),'Duplicate asset: '+asset.id);
   assetIds.add(asset.id);
   assert.ok(asset.path.startsWith(lesson.path+'/'),'Asset outside lesson');
   checkPath(asset.path+'/README.md');checkPath(asset.path+'/manifest.yml');
  }
 }
}
const numbers=[...lessonNumbers].sort((a,b)=>a-b);
assert.deepEqual(numbers,Array.from({length:numbers.length},(_,i)=>i+1),'Lesson numbering must be continuous');
console.log(`${map.chapters.length} chapters / ${numbers.length} lessons / ${assetIds.size} assets: navigation valid`);
