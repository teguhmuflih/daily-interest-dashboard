#!/usr/bin/env node
const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('index.html','utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/gi)].map(x=>x[1]);
if(!scripts.length)throw Error('inline script tidak ditemukan');
for(const [i,s] of scripts.entries())new vm.Script(s,{filename:'index-inline-'+(i+1)+'.js'});
for(const required of ['data/latest.json','chatBtn','visibleCount','priority'])if(!html.includes(required))throw Error('UI contract hilang: '+required);
console.log('UI CHECK OK');
