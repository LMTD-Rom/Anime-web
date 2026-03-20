import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EpisodeCard from "@/app/components/EpisodeCard";

interface Episode {
    id: string;
    anime_id: string;
    episode_no: number;
    title: string | null;
    created_at: string;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createClient();
    const { data: anime } = await supabase.from("animes").select("title, description").eq("slug", slug).single();
    return {
        title: anime ? `${anime.title} — Sukinime` : "Sukinime",
        description: anime?.description?.substring(0, 160) ?? "Nonton anime subtitle Indonesia.",
    };
}

export default async function AnimePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: anime, error } = await supabase.from("animes").select("*").eq("slug", slug).single();
    if (error || !anime) return notFound();

    const { data: episodes } = await supabase
        .from("episodes")
        .select("*")
        .eq("anime_id", anime.id)
        .order("episode_no", { ascending: false });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <nav style={{ marginBottom: "1.5rem", fontSize: "0.78rem", color: "#555" }}>
                <Link href="/" style={{ color: "#FF0000", textDecoration: "none" }}>Home</Link>
                <span style={{ margin: "0 0.5rem" }}>/</span>
                <span style={{ color: "#666" }}>{anime.title}</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-6 mb-10">
                {/* Poster */}
                <div style={{ flexShrink: 0, width: "180px", aspectRatio: "2/3", background: "#1a1a1a", border: "1px solid #222", borderRadius: "4px", overflow: "hidden", position: "relative" }}>
                    {anime.cover_url ? (
                        <Image src={anime.cover_url} alt={anime.title} fill style={{ objectFit: "cover" }} unoptimized />
                    ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#333", fontSize: "3rem" }}>🎬</div>
                    )}
                </div>

                {/* Meta */}
                <div style={{ flex: 1 }}>
                    {/* Status + Schedule */}
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                        <span style={{ background: anime.status === "Ongoing" ? "#FF0000" : "#333", color: "#fff", fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                            {anime.status}
                        </span>
                        {anime.schedule_day && (
                            <span style={{ background: "#1a1a1a", border: "1px solid #333", color: "#aaa", fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px", letterSpacing: "0.06em" }}>
                                📅 {anime.schedule_day}
                            </span>
                        )}
                    </div>

                    <h1 style={{ color: "#fff", fontSize: "1.75rem", fontWeight: 900, margin: "0 0 0.5rem", lineHeight: 1.2 }}>
                        {anime.title}
                    </h1>

                    {anime.rating && (
                        <p style={{ color: "#FF0000", fontWeight: 700, fontSize: "0.9rem", margin: "0 0 0.75rem" }}>★ {anime.rating}</p>
                    )}

                    {/* Genre chips */}
                    {anime.genres && anime.genres.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1rem" }}>
                            {anime.genres.map((g: string) => (
                                <Link key={g} href={`/genre/${encodeURIComponent(g)}`} style={{ textDecoration: "none" }}>
                                    <span style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#888", fontSize: "0.68rem", fontWeight: 600, padding: "3px 8px", cursor: "pointer" }}>
                                        {g}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}

                    {anime.description && (
                        <p style={{ color: "#777", fontSize: "0.88rem", lineHeight: 1.75, maxWidth: "65ch", margin: "0 0 1rem" }}>
                            {anime.description.substring(0, 300)}{anime.description.length > 300 && "…"}
                        </p>
                    )}

                    <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                        <MetaItem label="Total Episode" value={String(episodes?.length ?? anime.episode_count ?? 0)} />
                        <MetaItem label="Source" value={anime.source_origin ?? "—"} />
                    </div>
                </div>
            </div>

            {/* Episode List */}
            <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                    <div style={{ borderLeft: "4px solid #FF0000", paddingLeft: "1rem" }}>
                        <h2 style={{ color: "#fff", fontSize: "1rem", fontWeight: 800, margin: 0 }}>
                            Daftar Episode
                        </h2>
                    </div>
                    <span style={{ color: "#444", fontSize: "0.8rem" }}>{episodes?.length ?? 0} episode</span>
                </div>

                {(!episodes || episodes.length === 0) ? (
                    <p style={{ color: "#555" }}>Belum ada episode tersedia.</p>
                ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                        {(episodes as Episode[]).map((ep) => (
                            <EpisodeCard key={ep.id} episode={ep} />
                        ))}
                    </div>
                )}
            </div>

            {/* Back */}
            <div style={{ marginTop: "2.5rem" }}>
                <Link href="/" style={{ color: "#555", textDecoration: "none", fontSize: "0.82rem", fontWeight: 600, border: "1px solid #222", padding: "0.5rem 1rem", display: "inline-block" }}>
                    ← Kembali
                </Link>
            </div>
        </div>
    );
}

function MetaItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p style={{ color: "#444", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 2px" }}>{label}</p>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem", margin: 0 }}>{value}</p>
        </div>
    );
}
