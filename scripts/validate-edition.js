#!/usr/bin/env node
const fs=require('fs');
const path=process.argv[2]||'data/pending.json';
function fail(m){console.error('VALIDATION FAILED: '+m);process.exit(1)}
if(!fs.existsSync(path))fail(path+' tidak ditemukan');
let d;try{d=JSON.parse(fs.readFileSync(path,'utf8'))}catch{fail('JSON tidak valid')}
if(d.schemaVersion!==1)fail('schemaVersion harus 1');
if(!d.edition||!d.updatedAt||!d.priority?.title||!d.priority?.summary)fail('metadata edition/updatedAt/priority tidak lengkap');
if(!/^\d{4}-\d{2}-\d{2}$/.test(d.edition))fail('edition harus YYYY-MM-DD');
if(Number.isNaN(Date.parse(d.updatedAt)))fail('updatedAt harus ISO-8601 valid');
if(!Array.isArray(d.stories)||d.stories.length!==5)fail('harus tepat 5 stories');
const cats=new Set(['ai','ai-infra','devops','security','markets','endurance']),ids=new Set(),urls=new Set(),counts={};
for(const [i,s] of d.stories.entries()){
 for(const k of ['id','category','tag','date','title','summary','learn','detail']) if(typeof s[k]!=='string'||!s[k].trim())fail(`story ${i+1}: ${k} kosong`);
 if(!cats.has(s.category))fail(`story ${i+1}: category tidak valid`);
 counts[s.category]=(counts[s.category]||0)+1;if(counts[s.category]>2)fail('maksimal 2 story per kategori');
 if(ids.has(s.id))fail('id duplikat: '+s.id);ids.add(s.id);
 if(!s.source?.name||!s.source?.url)fail(`story ${i+1}: source tidak lengkap`);
 let u;try{u=new URL(s.source.url)}catch{fail(`story ${i+1}: URL invalid`)}
 if(u.protocol!=='https:')fail(`story ${i+1}: source harus HTTPS`);
 const normalized=u.origin+u.pathname.replace(/\/$/,'');if(urls.has(normalized))fail('URL duplikat: '+normalized);urls.add(normalized);
 const sc=s.scores;if(!sc)fail(`story ${i+1}: scores kosong`);
 for(const k of ['relevance','learning_value','source_quality','novelty','freshness','final_score']) if(typeof sc[k]!=='number'||sc[k]<0||sc[k]>100)fail(`story ${i+1}: score ${k} harus 0-100`);
 const expected=sc.relevance*.35+sc.learning_value*.25+sc.source_quality*.20+sc.novelty*.15+sc.freshness*.05;
 if(Math.abs(sc.final_score-expected)>0.11)fail(`story ${i+1}: final_score tidak sesuai formula`);
}
if(Object.keys(counts).length<3)fail('minimal 3 kategori berbeda');
console.log('VALIDATION OK: '+d.edition+' — 5 stories, '+Object.keys(counts).length+' kategori');
