import { createClient } from "@/lib/supabase/server";
import GenreChip from "@/app/components/GenreChip";


export const metadata = {
    title: "Genre Anime — Sukinime",
    description: "Daftar genre anime di Sukinime. Pilih genre favoritmu.",
};

export default async function GenresPage() {
    const supabase = await createClient();
    const { data } = await supabase.from("animes").select("genres");

    // Flatten and count
    const genreCount: Record<string, number> = {};
    (data ?? []).forEach((row) => {
        (row.genres ?? []).forEach((g: string) => {
            if (g) genreCount[g] = (genreCount[g] ?? 0) + 1;
        });
    });

    const sorted = Object.entries(genreCount).sort((a, b) => b[1] - a[1]);

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            <div style={{ borderLeft: "4px solid #FF0000", paddingLeft: "1rem", marginBottom: "2rem" }}>
                <h1 style={{ color: "#fff", fontSize: "1.6rem", fontWeight: 900, margin: 0 }}>Genre</h1>
                <p style={{ color: "#555", fontSize: "0.85rem", marginTop: "4px" }}>
                    {sorted.length} genre tersedia
                </p>
            </div>

            {sorted.length === 0 ? (
                <p style={{ color: "#555" }}>Belum ada data genre. Jalankan scraper dahulu.</p>
            ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {sorted.map(([genre, count]) => (
                        <GenreChip key={genre} genre={genre} count={count} />
                    ))}
                </div>

            )}
        </div>
    );
}
