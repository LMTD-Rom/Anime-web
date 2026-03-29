import { createClient } from "@/lib/supabase/server";
import AnimeCard from "@/app/components/AnimeCard";
import FilterBar from "@/app/components/FilterBar";
import { Suspense } from "react";

export const metadata = {
    title: "Anime Popular — Sukinime",
    description: "Daftar anime paling populer di Sukinime.",
};

export default async function PopularPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const supabase = await createClient();
    const resolvedParams = await searchParams;

    const sort = resolvedParams.sort ? String(resolvedParams.sort) : "terbaru";
    const genre = resolvedParams.genre ? String(resolvedParams.genre) : "";

    let query = supabase.from("animes").select("*").contains("genres", ["Popular"]);
    if (genre) query = query.contains("genres", [genre]);
    if (sort === "az") query = query.order("title", { ascending: true });
    else if (sort === "za") query = query.order("title", { ascending: false });
    else query = query.order("updated_at", { ascending: false });

    const { data: animes } = await query;

    return (
        <div style={{ minHeight: "100vh", padding: "2.5rem 0 4rem" }}>
            <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                    <div className="section-label" style={{ marginBottom: 0 }}>
                        <span>Anime Popular</span>
                    </div>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{animes?.length ?? 0} anime</span>
                </div>

                <Suspense>
                    <FilterBar />
                </Suspense>

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
