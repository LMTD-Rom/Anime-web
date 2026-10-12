<div align="center">

  # Sukinime

  <p align="center">
    <strong>Streaming anime subtitle Indonesia — nonton terbaru, terpopuler, dan terlengkap.</strong>
  </p>

  <p align="center">
    <a href="https://sukinime.netlify.app/">
      <img src="https://img.shields.io/badge/live-sukinime.netlify.app-2563EB?style=for-the-badge" alt="Live" />
    </a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/Python-Scraper-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python" />
    <img src="https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  </p>

  ---

  <p align="center">
    <a href="#ikhtisar">Ikhtisar</a> •
    <a href="#fitur">Fitur</a> •
    <a href="#halaman">Halaman</a> •
    <a href="#arsitektur">Arsitektur</a> •
    <a href="#memulai-lokal">Instalasi</a>
  </p>

</div>

<br />

## Ikhtisar

Sukinime adalah web streaming anime subtitle Indonesia berbasis Next.js 16 App Router dengan database Supabase. Data anime dan episode dikumpulkan otomatis via scraper Python dari sumber-sumber populer, lalu disajikan dengan UI modern lengkap sistem watchlist, jadwal tayang, dan pencarian.

Live: [https://sukinime.netlify.app/](https://sukinime.netlify.app/)

## Fitur

- **Streaming multi-source** — embed player dari berbagai provider, pilih kualitas 720p/1080p.
- **Update otomatis** — scraper Python berjalan periodik, data langsung masuk Supabase tanpa deploy ulang.
- **Watchlist** — simpan dan lanjutkan tontonan, tersinkronisasi via Supabase Auth.
- **Continue watching** — lanjut episode dari sesi terakhir per user.
- **Jadwal tayang** — tampilan per hari dari Senin–Minggu, langsung dari database.
- **Genre browser** — filter anime per genre, halaman khusus tiap genre.
- **Search** — pencarian judul realtime dari seluruh database.
- **Hero banner** — slideshow otomatis gabungan anime terbaru, populer, dan rekomendasi.
- **Dark/light mode** — toggle tema persisten.
- **Auth** — login via Supabase, profil user, dan proteksi halaman tertentu.

## Halaman

| Route | Deskripsi |
| :--- | :--- |
| `/` | Beranda — update terbaru, popular, hero banner |
| `/anime/[slug]` | Detail anime — sinopsis, episode list, info |
| `/watch/[episodeId]` | Player streaming episode |
| `/terbaru` | Semua anime ongoing terbaru |
| `/popular` | Daftar anime populer |
| `/movie` | Koleksi anime film |
| `/genres` | Semua genre tersedia |
| `/genre/[genre]` | Daftar anime per genre |
| `/jadwal` | Jadwal tayang mingguan |
| `/search` | Pencarian judul anime |
| `/watchlist` | Daftar simpan user (auth required) |
| `/profile` | Profil & pengaturan akun |
| `/login` | Autentikasi Supabase |

## Arsitektur

```text
Anime-web/
├── frontend/               # Next.js 16 App Router (TypeScript)
│   ├── src/app/            # Halaman & routing
│   │   ├── components/     # UI components (Navbar, HeroBanner, AnimeCard, dll.)
│   │   └── [...pages]      # Tiap route punya page.tsx sendiri
│   ├── src/lib/supabase/   # Client & server Supabase helper
│   └── public/             # Aset statis & jadwal.json
├── scraper/                # Python scraper
│   ├── scrapers/           # Parser per sumber (anoboy, samehadaku)
│   ├── main.py             # Entry point scraping
│   ├── db.py               # Koneksi & insert Supabase
│   └── requirements.txt
└── schema.sql              # Struktur database PostgreSQL (Supabase)
```

**Database (Supabase PostgreSQL)**

| Tabel | Isi |
| :--- | :--- |
| `animes` | Judul, slug, cover, genre, status, rating, jadwal |
| `episodes` | Nomor episode per anime |
| `video_sources` | URL streaming per episode, provider, kualitas |

## Memulai Lokal

**Frontend:**

```bash
cd frontend
npm install
cp .env.local.example .env.local   # isi NEXT_PUBLIC_SUPABASE_URL & ANON_KEY
npm run dev
```

**Scraper:**

```bash
cd scraper
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # isi SUPABASE_URL & SERVICE_ROLE_KEY
python main.py
```

Buka [http://localhost:3000](http://localhost:3000).

---

<div align="center">
  <sub>© 2026 Sukinime. All rights reserved.</sub>
</div>
