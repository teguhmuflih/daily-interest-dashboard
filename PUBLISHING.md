# ChatGPT-native Publisher

AI inference **tidak berjalan di Vercel** dan repo ini tidak membutuhkan `OPENAI_API_KEY`.

## Kontrak publisher

1. ChatGPT/Codex menghasilkan `data/pending.json` mengikuti schema `data/latest.json`.
2. Jalankan `node scripts/validate-edition.js data/pending.json`.
3. Hanya jika lolos, jalankan `node scripts/publish-edition.js data/pending.json`.
4. Review diff: hanya `data/latest.json`, `data/YYYY-MM-DD.json`, dan `data/archive.json` yang boleh berubah.
5. Commit ke `main`. Git integration Vercel akan deploy otomatis.

Validation gate mempertahankan **last known good edition** bila payload gagal. Publisher menolak downgrade tanggal, membutuhkan tepat 5 story, kategori AI/DevOps/Trail, field lengkap, ID unik, URL HTTPS valid dan unik.

## Automation target

Codex automation yang memiliki checkout repo dapat menjalankan alur di atas setelah membuat edisi dari briefing ChatGPT. Jangan menambahkan API OpenAI ke project ini.
