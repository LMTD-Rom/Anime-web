import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import AnimeCard from "@/app/components/AnimeCard";

export const metadata = {
  title: "Sukinime — Stream Anime Sub Indo",
  description: "Nonton streaming anime subtitle Indonesia terlengkap.",
};

export default async function HomePage() {
  const supabase = await createClient();

  // 1. Get "Update Terbaru" (excluding Popular)
  const { data: terbaru } = await supabase
    .from("animes")
    .select("*")
    .eq("status", "Ongoing")
    .not("genres", "cs", '{"Popular"}')
    .order("updated_at", { ascending: false })
    .limit(20);

  // 2. Get "Popular" 
  const { data: popular } = await supabase
    .from("animes")
    .select("*")
    .contains("genres", ["Popular"])
    .order("updated_at", { ascending: false })
    .limit(10);

  // If DB is totally empty, fallback to just any latest anime
  const fallback = (!terbaru || terbaru.length === 0) && (!popular || popular.length === 0);
  const { data: latestFallback } = fallback ? await supabase.from("animes").select("*").order("updated_at", { ascending: false }).limit(30) : { data: null };
  const mainData = fallback ? latestFallback?.slice(0, 20) : terbaru;
  const popularData = fallback ? latestFallback?.slice(20, 30) : popular;

  return (
    <div style={{ minHeight: "100vh", padding: "2.5rem 0 4rem" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem" }}>

        {(!mainData || mainData.length === 0) ? (
          <div style={{ textAlign: "center", padding: "5rem 0" }}>
            <p style={{ color: "var(--text-dim)", fontSize: "0.9rem" }}>
              Belum ada data. Jalankan scraper <code>python main.py</code> terlebih dahulu.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "2rem", flexDirection: "column" }} className="lg:flex-row">

            {/* ═══ LEFT: UPDATE TERBARU ═══ */}
            <div style={{ flex: "1 1 auto" }}>
              <div style={{ marginBottom: "1.25rem" }}>
                <Link href="/terbaru" className="section-label" style={{ marginBottom: 0, display: "flex", justifyContent: "space-between", alignItems: "center", textDecoration: "none" }}>
                  <span>Update Terbaru</span>
                  <span style={{ fontSize: "0.8rem", color: "var(--accent)", fontWeight: 600 }}>Lihat Semua →</span>
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {mainData?.map((anime) => (
                  <AnimeCard key={anime.id} anime={anime} />
                ))}
              </div>
            </div>

            {/* ═══ RIGHT: POPULAR SIDEBAR ═══ */}
            <aside style={{ width: "100%", maxWidth: "100%" }} className="lg:max-w-[320px] shrink-0">
              <Link href="/popular" className="section-label" style={{ marginBottom: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", textDecoration: "none" }}>
                <span>Popular</span>
                <span style={{ fontSize: "0.8rem", color: "var(--accent)", fontWeight: 600 }}>Lihat Semua →</span>
              </Link>

              <div style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem"
              }}>
                {popularData && popularData.length > 0 ? popularData.map((anime, idx) => (
                  <Link key={anime.id} href={`/anime/${anime.slug}`} style={{ display: "flex", gap: "12px", alignItems: "center" }} className="group">
                    <div style={{
                      width: "60px", height: "80px",
                      position: "relative", borderRadius: "6px", overflow: "hidden", flexShrink: 0,
                      border: "1px solid var(--border)"
                    }}>
                      {anime.cover_url ? (
                        <Image src={anime.cover_url} alt={anime.title} fill style={{ objectFit: "cover" }} className="group-hover:scale-110 transition-transform duration-300" unoptimized />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: "var(--surface2)" }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{
                        color: "#fff", fontSize: "0.85rem", fontWeight: 700, margin: "0 0 4px",
                        overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical"
                      }} className="group-hover:text-accent transition-colors">
                        {anime.title}
                      </h4>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.7rem", display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {Array.isArray(anime.genres) && anime.genres.filter((g: any) => g !== 'Popular' && g !== 'Update Terbaru').slice(0, 2).join(', ')}
                      </div>
                    </div>
                  </Link>
                )) : (
                  <p style={{ color: "var(--text-dim)", fontSize: "0.8rem", textAlign: "center", padding: "1rem 0" }}>Belum ada data popular.</p>
                )}
              </div>
            </aside>

          </div>
        )}
      </div>
    </div>
  );
}
