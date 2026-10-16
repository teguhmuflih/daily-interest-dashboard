export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Gunakan POST'});
  if(!process.env.OPENAI_API_KEY) return res.status(503).json({error:'AI belum diaktifkan','setup':'Tambahkan OPENAI_API_KEY di Vercel Environment Variables.'});
  const {story}=req.body||{}; if(!story?.title) return res.status(400).json({error:'Berita tidak valid'});
  const schema={type:'object',additionalProperties:false,properties:{
    why:{type:'string'},devops:{type:'string'},concepts:{type:'array',items:{type:'string'}},exercise:{type:'string'},level:{type:'string',enum:['dasar','menengah','lanjut']}
  },required:['why','devops','concepts','exercise','level']};
  const prompt=`Anda adalah mentor teknis berbahasa Indonesia untuk DevOps Engineer yang berkembang menuju AI Platform Engineering. Analisis berita berikut tanpa mengarang fakta di luar input. Jelaskan manfaat belajar secara praktis. Berita: ${JSON.stringify(story)}`;
  try{
    const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Authorization':`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-6-astra',input:prompt,reasoning:{effort:'medium'},text:{format:{type:'json_schema',name:'news_learning',strict:true,schema}}})});
    const j=await r.json(); if(!r.ok) return res.status(r.status).json({error:'OpenAI API gagal',detail:j?.error?.message||'Unknown'});
    const out=(j.output||[]).flatMap(x=>x.content||[]).find(x=>x.type==='output_text')?.text;
    return res.status(200).json(JSON.parse(out));
  }catch(e){return res.status(500).json({error:'Analisis gagal',detail:e.message})}
}