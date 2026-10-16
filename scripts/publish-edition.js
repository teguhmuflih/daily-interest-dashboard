#!/usr/bin/env node
const fs=require('fs'),cp=require('child_process');
const pending=process.argv[2]||'data/pending.json';
cp.execFileSync(process.execPath,['scripts/validate-edition.js',pending],{stdio:'inherit'});
const d=JSON.parse(fs.readFileSync(pending,'utf8')),edition=d.edition;
const latest='data/latest.json',archiveFile='data/archive.json',dated=`data/${edition}.json`;
let archive={editions:[]};
if(fs.existsSync(archiveFile)){try{archive=JSON.parse(fs.readFileSync(archiveFile,'utf8'))}catch{}}
if(!Array.isArray(archive.editions))archive.editions=[];
const latestEdition=fs.existsSync(latest)?JSON.parse(fs.readFileSync(latest,'utf8')).edition:null;
if(latestEdition&&edition<latestEdition){console.error(`Refuse downgrade: ${edition} < ${latestEdition}`);process.exit(1)}
fs.mkdirSync('data',{recursive:true});
fs.writeFileSync(dated,JSON.stringify(d,null,2)+'\n');
fs.writeFileSync(latest,JSON.stringify(d,null,2)+'\n');
const entry={date:edition,label:new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Jakarta'}).format(new Date(edition+'T12:00:00+07:00')),file:dated};
archive.editions=[entry,...archive.editions.filter(x=>(typeof x==='string'?x:x?.date)!==edition)]
 .map(x=>typeof x==='string'?{date:x,label:x,file:`data/${x}.json`}:x)
 .sort((a,b)=>b.date.localeCompare(a.date));
fs.writeFileSync(archiveFile,JSON.stringify(archive,null,2)+'\n');
console.log(`PUBLISHED ${edition}: latest + dated snapshot + archive index`);
