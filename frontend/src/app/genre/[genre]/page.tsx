import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AnimeCard from "@/app/components/AnimeCard";

export async function generateMetadata({ params }: { params: Promise<{ genre: string }> }) {
    const { genre } = await params;
    const label = decodeURIComponent(genre);
    return { title: `${label} — Sukinime`, description: `Anime genre ${label} subtitle Indonesia.` };
}

export default async function GenrePage({ params }: { params: Promise<{ genre: string }> }) {
    const { genre } = await params;
    const label = decodeURIComponent(genre);

    const supabase = await createClient();
    // Filter by genre (case-insensitive using ilike pattern inside array)
    const { data: animes } = await supabase
        .from("animes")
        .select("*")
        .contains("genres", [label])
        .order("title", { ascending: true });

    if (animes === null) return notFound();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div style={{ borderLeft: "4px solid #FF0000", paddingLeft: "1rem", marginBottom: "2rem" }}>
                <p style={{ color: "#FF0000", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px" }}>Genre</p>
                <h1 style={{ color: "#fff", fontSize: "1.6rem", fontWeight: 900, margin: 0 }}>{label}</h1>
                <p style={{ color: "#555", fontSize: "0.85rem", marginTop: "4px" }}>{animes?.length ?? 0} anime</p>
            </div>
            {animes && animes.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {animes.map((anime) => <AnimeCard key={anime.id} anime={anime} />)}
                </div>
            ) : (
                <p style={{ color: "#555" }}>Tidak ada anime untuk genre ini.</p>
            )}
        </div>
    );
}
