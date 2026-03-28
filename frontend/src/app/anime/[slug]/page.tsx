import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EpisodeCard from "@/app/components/EpisodeCard";
import WatchlistButton from "@/app/components/WatchlistButton";
import AnimeCard from "@/app/components/AnimeCard";

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

    // Get recommendations: fetch a large pool across multiple matching genres, then shuffle
    const genres: string[] = Array.isArray(anime.genres)
        ? (anime.genres as string[]).filter(g => g !== "Update Terbaru" && g !== "Popular")
        : [];

    let recommendations: typeof anime[] = [];
    if (genres.length > 0) {
        // Pick up to 3 different genres to maximize variety
        const queryGenres = genres.slice(0, 3);
        const recSets = await Promise.all(
            queryGenres.map(g =>
                supabase
                    .from("animes")
                    .select("*")
                    .neq("slug", slug)
                    .contains("genres", [g])
                    .limit(12)
            )
        );
        // Merge all results, deduplicate by slug
        const seen = new Set<string>();
        const pool: typeof anime[] = [];
        for (const { data } of recSets) {
            for (const item of data ?? []) {
                if (!seen.has(item.slug)) {
                    seen.add(item.slug);
                    pool.push(item);
                }
            }
        }
        // Shuffle (Fisher-Yates) on the server side so each page load shows different results
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        recommendations = pool.slice(0, 8);
    }

    const displayGenres = genres.slice(0, 10);
    const isOngoing = anime.status === "Ongoing";
    const releaseYear = anime.release_date ? new Date(anime.release_date).getFullYear() || anime.release_date : null;
    const episodeCount = episodes?.length ?? anime.episode_count ?? 0;

    return (
        <div style={{ minHeight: "100vh" }}>
            {/* ═══ HERO BACKDROP ═══ */}
            <div style={{ position: "relative", width: "100%", height: "320px", overflow: "hidden" }}>
                {anime.cover_url && (
                    <Image
                        src={anime.cover_url}
                        alt={anime.title}
                        fill
                        style={{ objectFit: "cover", objectPosition: "center top", filter: "blur(8px) brightness(0.3)", transform: "scale(1.1)" }}
                        unoptimized
                        priority
                    />
                )}
                <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, height: "100%",
                    background: "linear-gradient(to top, var(--bg) 0%, rgba(7,7,13,0.6) 60%, transparent 100%)"
                }} />
            </div>

            <div style={{ maxWidth: "1280px", margin: "-120px auto 0", padding: "0 1.5rem 4rem", position: "relative", zIndex: 10 }}>

                {/* ═══ HEADER INFO ═══ */}
                <div className="flex flex-col sm:flex-row gap-6 mb-10">
                    {/* Poster */}
                    <div style={{
                        flexShrink: 0, width: "180px", aspectRatio: "2/3",
                        background: "var(--surface2)", border: "1px solid var(--border)",
                        borderRadius: "12px", overflow: "hidden", position: "relative",
                        boxShadow: "0 16px 48px rgba(0,0,0,0.6)"
                    }}>
                        {anime.cover_url ? (
                            <Image src={anime.cover_url} alt={anime.title} fill style={{ objectFit: "cover" }} unoptimized />
                        ) : (
                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-dim)", fontSize: "3rem" }}>🎬</div>
                        )}
                    </div>

                    {/* Meta */}
                    <div style={{ flex: 1, paddingTop: "1rem" }}>
                        {/* Status Badge */}
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                            <span style={{
                                background: isOngoing ? "var(--accent)" : "var(--surface2)",
                                color: isOngoing ? "#fff" : "var(--text-muted)",
                                border: isOngoing ? "none" : "1px solid var(--border)",
                                fontSize: "0.62rem", fontWeight: 800, padding: "3px 10px",
                                letterSpacing: "0.12em", textTransform: "uppercase", borderRadius: "4px"
                            }}>
                                {isOngoing ? "● Ongoing" : "✓ Completed"}
                            </span>
                            {anime.schedule_day && (
                                <span style={{
                                    background: "var(--surface2)", border: "1px solid var(--border)",
                                    color: "var(--text-muted)", fontSize: "0.62rem", fontWeight: 700,
                                    padding: "3px 10px", letterSpacing: "0.06em", borderRadius: "4px"
                                }}>
                                    📅 {anime.schedule_day}
                                </span>
                            )}
                        </div>

                        <h1 style={{ color: "var(--text)", fontSize: "1.75rem", fontWeight: 900, margin: "0 0 0.5rem", lineHeight: 1.2 }}>
                            {anime.title}
                        </h1>

                        {anime.rating && (
                            <p style={{ color: "#fbbf24", fontWeight: 700, fontSize: "0.9rem", margin: "0 0 0.75rem" }}>
                                ★ {anime.rating}
                            </p>
                        )}

                        {/* Genre chips */}
                        {displayGenres.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1rem" }}>
                                {displayGenres.map((g: string) => (
                                    <Link key={g} href={`/genre/${encodeURIComponent(g)}`} style={{ textDecoration: "none" }}>
                                        <span style={{
                                            background: "var(--surface2)", border: "1px solid var(--border)",
                                            color: "var(--text-muted)", fontSize: "0.68rem", fontWeight: 600,
                                            padding: "3px 10px", borderRadius: "4px", cursor: "pointer",
                                            transition: "border-color 0.15s"
                                        }}>{g}</span>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {anime.description && (
                            <p style={{
                                color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.75,
                                maxWidth: "65ch", margin: "0 0 1.25rem"
                            }}>
                                {anime.description.substring(0, 350)}{anime.description.length > 350 && "…"}
                            </p>
                        )}

                        {/* Meta grid */}
                        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
                            <MetaItem label="Total Episode" value={String(episodeCount)} />
                            {releaseYear && <MetaItem label="Tahun Rilis" value={String(releaseYear)} />}
                            {anime.source_origin && <MetaItem label="Source" value={anime.source_origin} />}
                            {anime.studio && <MetaItem label="Studio" value={anime.studio} />}
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                            {episodes && episodes.length > 0 && (
                                <Link href={`/watch/${(episodes as Episode[])[episodes.length - 1]?.id}`} style={{
                                    display: "inline-flex", alignItems: "center", gap: "0.5rem",
                                    background: "var(--accent)", color: "#fff",
                                    padding: "0.65rem 1.5rem", borderRadius: "8px",
                                    fontWeight: 800, fontSize: "0.88rem", textDecoration: "none",
                                }}>▶ Tonton Ep. 1</Link>
                            )}
                            <WatchlistButton
                                slug={anime.slug}
                                title={anime.title}
                                cover_url={anime.cover_url}
                                genres={anime.genres ?? []}
                                episode_count={episodeCount}
                            />
                        </div>
                    </div>
                </div>

                {/* ═══ EPISODE LIST ═══ */}
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "2rem", marginBottom: "3rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                        <div className="section-label" style={{ margin: 0, flex: 1 }}>
                            <span>Daftar Episode</span>
                        </div>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{episodeCount} episode</span>
                    </div>

                    {(!episodes || episodes.length === 0) ? (
                        <p style={{ color: "var(--text-muted)" }}>Belum ada episode tersedia.</p>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                            {(episodes as Episode[]).map((ep) => (
                                <EpisodeCard key={ep.id} episode={ep} />
                            ))}
                        </div>
                    )}
                </div>

                {/* ═══ RECOMMENDATIONS ═══ */}
                {recommendations.length > 0 && (
                    <div>
                        <div className="section-label" style={{ marginBottom: "1.25rem" }}>
                            <span>Kamu Mungkin Suka</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {recommendations.map((rec) => (
                                <AnimeCard key={rec.id} anime={rec} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function MetaItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 2px" }}>{label}</p>
            <p style={{ color: "var(--text)", fontWeight: 700, fontSize: "0.9rem", margin: 0 }}>{value}</p>
        </div>
    );
}
