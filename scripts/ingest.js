#!/usr/bin/env node
/*
  Fase 2 ingestion scaffold.
  Sumber publik dipantau tanpa secret. Script menyimpan kandidat mentah;
  kurasi/enrichment AI akan ditambahkan pada Fase 3.
*/
const fs=require('fs'), https=require('https');
const feeds=[
 {category:'ai',name:'Google AI',url:'https://blog.google/technology/ai/rss/'},
 {category:'devops',name:'Kubernetes',url:'https://kubernetes.io/feed.xml'},
 {category:'devops',name:'AWS',url:'https://aws.amazon.com/blogs/aws/feed/'}
];
function get(url){return new Promise((resolve,reject)=>https.get(url,{headers:{'User-Agent':'daily-interest-dashboard/1.0'}},r=>{let d='';r.on('data',x=>d+=x);r.on('end',()=>resolve(d))}).on('error',reject))}
function clean(s=''){return s.replace(/<!\[CDATA\[|\]\]>/g,'').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim()}
function items(xml,feed){return [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].slice(0,12).map((m,i)=>{let x=m[0],pick=t=>(x.match(new RegExp('<'+t+'[^>]*>([\\s\\S]*?)<\\/'+t+'>','i'))||[])[1]||'';return {id:(feed.name+'-'+clean(pick('title'))).toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,100),category:feed.category,source:feed.name,title:clean(pick('title')),url:clean(pick('link')),published:clean(pick('pubDate'))}})}
(async()=>{let all=[];for(const f of feeds){try{all.push(...items(await get(f.url),f))}catch(e){console.error(f.name,e.message)}}let seen=new Set(),unique=all.filter(x=>x.title&&x.url&&!seen.has(x.url)&&(seen.add(x.url),true));fs.mkdirSync('data',{recursive:true});fs.writeFileSync('data/candidates.json',JSON.stringify({generatedAt:new Date().toISOString(),candidates:unique},null,2));console.log('candidates',unique.length)})().catch(e=>{console.error(e);process.exit(1)});
