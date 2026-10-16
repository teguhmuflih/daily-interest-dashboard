#!/usr/bin/env node
const fs=require('fs');
const path=process.argv[2]||'data/pending.json';
function fail(m){console.error('VALIDATION FAILED: '+m);process.exit(1)}
if(!fs.existsSync(path))fail(path+' tidak ditemukan');
let d;try{d=JSON.parse(fs.readFileSync(path,'utf8'))}catch{fail('JSON tidak valid')}
if(!d.edition||!d.updatedAt||!d.priority?.title||!d.priority?.summary)fail('metadata edition/updatedAt/priority tidak lengkap');
if(!Array.isArray(d.stories)||d.stories.length!==5)fail('harus tepat 5 stories');
const cats=new Set(['AI','DevOps','Trail']), ids=new Set(), urls=new Set();
for(const [i,s] of d.stories.entries()){
 for(const k of ['id','category','tag','date','title','summary','learn','detail']) if(typeof s[k]!=='string'||!s[k].trim())fail(`story ${i+1}: ${k} kosong`);
 if(!cats.has(s.category))fail(`story ${i+1}: category tidak valid`);
 if(ids.has(s.id))fail('id duplikat: '+s.id); ids.add(s.id);
 if(!s.source?.name||!s.source?.url)fail(`story ${i+1}: source tidak lengkap`);
 let u;try{u=new URL(s.source.url)}catch{fail(`story ${i+1}: URL invalid`)}
 if(u.protocol!=='https:')fail(`story ${i+1}: source harus HTTPS`);
 const normalized=u.origin+u.pathname.replace(/\/$/,'');if(urls.has(normalized))fail('URL duplikat: '+normalized);urls.add(normalized);
}
console.log('VALIDATION OK: '+d.edition+' — 5 stories, '+ids.size+' ID unik, '+urls.size+' URL unik');
