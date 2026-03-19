import { createClient } from "@/lib/supabase/server";
import AnimeCard from "@/app/components/AnimeCard";

export const metadata = {
    title: "Anime Popular — Sukinime",
    description: "Daftar anime paling populer di Sukinime.",
};

export default async function PopularPage() {
    const supabase = await createClient();

    const { data: animes } = await supabase
        .from("animes")
        .select("*")
        .contains("genres", ["Popular"])
        .order("updated_at", { ascending: false });

    return (
        <div style={{ minHeight: "100vh", padding: "2.5rem 0 4rem" }}>
            <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem" }}>
                <div className="section-label" style={{ marginBottom: "1.5rem" }}>
                    <span>Anime Popular</span>
                </div>

                {(!animes || animes.length === 0) ? (
                    <div style={{ textAlign: "center", padding: "5rem 0" }}>
                        <p style={{ color: "var(--text-dim)", fontSize: "0.9rem" }}>Belum ada data popular.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                        {animes.map((anime) => (
                            <AnimeCard key={anime.id} anime={anime} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
