#!/usr/bin/env node
const fs=require('fs'),os=require('os'),path=require('path'),cp=require('child_process');
const root=process.cwd(),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'daily-dashboard-'));
fs.mkdirSync(path.join(tmp,'scripts'));fs.mkdirSync(path.join(tmp,'data'));
for(const f of ['validate-edition.js','publish-edition.js'])fs.copyFileSync(path.join(root,'scripts',f),path.join(tmp,'scripts',f));
const latest=JSON.parse(fs.readFileSync(path.join(root,'data/latest.json'),'utf8'));
latest.schemaVersion=1;
latest.stories=latest.stories.map((s,i)=>({...s,category:['ai','ai-infra','devops','security','endurance'][i],scores:{relevance:80,learning_value:80,source_quality:80,novelty:80,freshness:80,final_score:80}}));
fs.writeFileSync(path.join(tmp,'data','pending.json'),JSON.stringify(latest));
fs.writeFileSync(path.join(tmp,'data','archive.json'),JSON.stringify({editions:[{date:'2026-10-15',label:'15 Oktober 2026',file:'data/2026-10-15.json'}]}));
cp.execFileSync(process.execPath,['scripts/publish-edition.js','data/pending.json'],{cwd:tmp,stdio:'inherit'});
const a=JSON.parse(fs.readFileSync(path.join(tmp,'data','archive.json')));
if(!a.editions[0]?.date||!a.editions[0]?.file)throw Error('archive contract rusak');
console.log('PUBLISHER TEST OK');
