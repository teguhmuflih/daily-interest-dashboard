# Dashboard Wawasan Harian

## Fase 2 — Data Pipeline
- `data/latest.json`: edisi aktif yang dibaca UI.
- `data/YYYY-MM-DD.json`: arsip immutable per edisi.
- `data/archive.json`: indeks arsip.
- `scripts/ingest.js`: mengambil kandidat dari feed publik dan melakukan deduplikasi URL.
- GitHub Actions menjalankan ingestion setiap hari pukul 07:15 WIB (00:15 UTC).
- Vercel otomatis deploy setiap commit ke `main`.

Pipeline saat ini: **Sumber → kandidat → deduplikasi → dataset edisi → UI**.
Kurasi/ranking semantik dan ringkasan GPT sengaja dipisahkan untuk Fase 3.

Tidak ada API key yang disimpan di repository.
