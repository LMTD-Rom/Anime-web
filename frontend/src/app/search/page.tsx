import { createClient } from "@/lib/supabase/server";
import AnimeCard from "@/app/components/AnimeCard";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const resolvedParams = await searchParams;
    const q = resolvedParams.q || "";
    return {
        title: `Sukinime — Pencarian: ${q}`,
        description: `Hasil pencarian untuk ${q}`,
    };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const supabase = await createClient();
    const resolvedParams = await searchParams;
    const q = resolvedParams.q || "";

    // Perform flexible search
    let data = null;
    if (q.trim()) {
        let query = supabase.from("animes").select("*");

        // Split the query into individual words and chain .ilike() for each word.
        // This makes the search engine flexible across variations of the title.
        const terms = q.trim().split(" ").filter((t: string) => t.length > 0);
        terms.forEach((term: string) => {
            query = query.ilike("title", `%${term}%`);
        });

        const { data: results } = await query.order("updated_at", { ascending: false }).limit(50);
        data = results;
    }

    return (
        <div style={{ minHeight: "100vh", padding: "2.5rem 0 4rem" }}>
            <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem" }}>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                    <div className="section-label" style={{ marginBottom: 0 }}>
                        <span>Hasil Pencarian: &quot;{q}&quot;</span>
                    </div>
                </div>

                {!data || data.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "5rem 0" }}>
                        <p style={{ color: "var(--text-dim)", fontSize: "0.9rem" }}>
                            {q ? "Tidak ada anime yang ditemukan." : "Ketik judul anime untuk mulai mencari."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {data.map((anime) => (
                            <AnimeCard key={anime.id} anime={anime} />
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
