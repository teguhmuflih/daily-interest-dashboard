#!/usr/bin/env node
const fs=require('fs');
const path=process.argv[2]||'data/pending.json';
const CATS=new Set(['ai','ai-infra','devops','security','markets','endurance']);
function fail(m){console.error('VALIDATION FAILED: '+m);process.exit(1)}
if(!fs.existsSync(path))fail(path+' tidak ditemukan');
let d;try{d=JSON.parse(fs.readFileSync(path,'utf8'))}catch{fail('JSON tidak valid')}
if(d.schemaVersion!==1)fail('schemaVersion harus 1');
if(!/^\d{4}-\d{2}-\d{2}$/.test(d.edition||''))fail('edition harus YYYY-MM-DD');
if(!Number.isFinite(Date.parse(d.updatedAt)))fail('updatedAt harus ISO date valid');
if(!d.priority?.title||!d.priority?.summary)fail('priority tidak lengkap');
if(!Array.isArray(d.stories)||d.stories.length!==5)fail('harus tepat 5 stories');
const ids=new Set(),urls=new Set(),cats=new Map();
for(const [i,s] of d.stories.entries()){
 for(const k of ['id','category','tag','date','title','summary','learn','detail']) if(typeof s[k]!=='string'||!s[k].trim())fail(`story ${i+1}: ${k} kosong`);
 if(!CATS.has(s.category))fail(`story ${i+1}: category tidak valid: ${s.category}`);
 cats.set(s.category,(cats.get(s.category)||0)+1);
 if(ids.has(s.id))fail('id duplikat: '+s.id);ids.add(s.id);
 if(!s.source?.name||!s.source?.url)fail(`story ${i+1}: source tidak lengkap`);
 let u;try{u=new URL(s.source.url)}catch{fail(`story ${i+1}: URL invalid`)}
 if(u.protocol!=='https:')fail(`story ${i+1}: source harus HTTPS`);
 const normalized=(u.hostname.replace(/^www\./,'')+u.pathname.replace(/\/$/,'')).toLowerCase();
 if(urls.has(normalized))fail('URL duplikat: '+normalized);urls.add(normalized);
 const sc=s.scores;if(!sc)fail(`story ${i+1}: scores kosong`);
 for(const k of ['relevance','learning_value','source_quality','novelty','freshness','final_score']) if(typeof sc[k]!=='number'||sc[k]<0||sc[k]>100)fail(`story ${i+1}: score ${k} harus 0-100`);
 const expected=sc.relevance*.35+sc.learning_value*.25+sc.source_quality*.20+sc.novelty*.15+sc.freshness*.05;
 if(Math.abs(expected-sc.final_score)>0.11)fail(`story ${i+1}: final_score tidak sesuai formula`);
}
if(cats.size<3)fail('minimal 3 kategori berbeda');
for(const [c,n] of cats)if(n>2)fail('maksimal 2 story per kategori: '+c);
console.log('VALIDATION OK: '+d.edition+' — 5 stories, '+cats.size+' kategori');
