#!/usr/bin/env node
/*
 Fase 3 ranker. Memilih kandidat menggunakan GPT-6 Astra + Structured Outputs.
 Jalankan hanya jika OPENAI_API_KEY tersedia. Output tetap harus direview sebelum
 dijadikan latest.json sampai pipeline publishing Fase berikutnya diaktifkan.
*/
const fs=require('fs');
(async()=>{
 const input=JSON.parse(fs.readFileSync('data/candidates.json','utf8')).candidates||[];
 if(!process.env.OPENAI_API_KEY) throw Error('OPENAI_API_KEY belum tersedia');
 const schema={type:'object',additionalProperties:false,properties:{selected:{type:'array',items:{type:'object',additionalProperties:false,properties:{id:{type:'string'},score:{type:'integer'},reason:{type:'string'}},required:['id','score','reason']}}},required:['selected']};
 const prompt='Pilih tepat 5 berita paling bermakna untuk DevOps Engineer yang belajar AI Platform Engineering dan trail endurance. Utamakan perkembangan substansial, sumber berkualitas, keberagaman kategori, dan hindari topik duplikat. Kandidat: '+JSON.stringify(input.slice(0,60));
 const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-6-astra',input:prompt,reasoning:{effort:'medium'},text:{format:{type:'json_schema',name:'ranked_news',strict:true,schema}}})});
 const j=await r.json();if(!r.ok)throw Error(j?.error?.message||'API error');
 const txt=(j.output||[]).flatMap(x=>x.content||[]).find(x=>x.type==='output_text')?.text;
 fs.writeFileSync('data/ranked.json',JSON.stringify({generatedAt:new Date().toISOString(),...JSON.parse(txt)},null,2));
 console.log('ranked 5 stories');
})().catch(e=>{console.error(e.message);process.exit(1)});
