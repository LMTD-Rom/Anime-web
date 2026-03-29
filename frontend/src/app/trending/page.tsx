import { createClient } from "@/lib/supabase/server";
import AnimeCard from "@/app/components/AnimeCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Trending Minggu Ini — Sukinime",
    description: "Anime yang paling banyak diperbarui dan trending minggu ini di Sukinime.",
};

export default async function TrendingPage() {
    const supabase = await createClient();

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: animes } = await supabase
        .from("animes")
        .select("*")
        .gte("updated_at", sevenDaysAgo)
        .order("updated_at", { ascending: false })
        .limit(48);

    return (
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
            {/* Header */}
            <div style={{ marginBottom: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "1.5rem" }}>🔥</span>
                    <h1 style={{ color: "var(--text)", fontSize: "1.6rem", fontWeight: 900, margin: 0, letterSpacing: "-0.02em" }}>
                        Trending Minggu Ini
                    </h1>
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>
                    {animes?.length ?? 0} anime diperbarui dalam 7 hari terakhir
                </p>
            </div>

            {/* Grid */}
            {!animes || animes.length === 0 ? (
                <div style={{ textAlign: "center", paddingTop: "4rem", color: "var(--text-muted)" }}>
                    <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔍</p>
                    <p>Belum ada anime trending minggu ini.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {animes.map((anime, i) => (
                        <div key={anime.id} style={{ position: "relative" }}>
                            {/* Rank badge for top 3 */}
                            {i < 3 && (
                                <div style={{
                                    position: "absolute", top: "8px", left: "8px", zIndex: 10,
                                    width: "24px", height: "24px", borderRadius: "50%",
                                    background: i === 0 ? "#fbbf24" : i === 1 ? "#9ca3af" : "#cd7c3e",
                                    color: "#000", fontWeight: 900, fontSize: "0.7rem",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
                                }}>
                                    {i + 1}
                                </div>
                            )}
                            <AnimeCard anime={anime} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
