#!/usr/bin/env node
const fs=require('fs');const cp=require('child_process');
const pending=process.argv[2]||'data/pending.json';
cp.execFileSync(process.execPath,['scripts/validate-edition.js',pending],{stdio:'inherit'});
const d=JSON.parse(fs.readFileSync(pending,'utf8'));const edition=d.edition;
if(!/^\d{4}-\d{2}-\d{2}$/.test(edition)){console.error('edition harus YYYY-MM-DD');process.exit(1)}
const latest='data/latest.json', archiveFile='data/archive.json', dated=`data/${edition}.json`;
let archive=[];if(fs.existsSync(archiveFile)){const x=JSON.parse(fs.readFileSync(archiveFile,'utf8'));archive=Array.isArray(x)?x:(x.editions||[])}
const latestEdition=fs.existsSync(latest)?JSON.parse(fs.readFileSync(latest,'utf8')).edition:null;
if(latestEdition&&edition<latestEdition){console.error(`Refuse downgrade: ${edition} < ${latestEdition}`);process.exit(1)}
fs.writeFileSync(dated,JSON.stringify(d,null,2)+'\n');fs.writeFileSync(latest,JSON.stringify(d,null,2)+'\n');
archive=[...new Set([edition,...archive])].sort().reverse();fs.writeFileSync(archiveFile,JSON.stringify({editions:archive},null,2)+'\n');
console.log(`PUBLISHED ${edition}: latest + archive snapshot updated`);
