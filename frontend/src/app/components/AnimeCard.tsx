import Link from "next/link";
import Image from "next/image";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function AnimeCard({ anime }: { anime: any }) {
    const genres: string[] = Array.isArray(anime.genres) ? anime.genres : [];
    const epCount = anime.episode_count ?? 0;

    const isMovie = genres.some(g => g.toLowerCase() === "movie" || g.toLowerCase() === "movies");
    const typeLabel = isMovie ? "MOVIE" : "TV";

    // Determine if updated recently (within 48 hours)
    const updatedAt = anime.updated_at ? new Date(anime.updated_at).getTime() : 0;
    const now = new Date().getTime();
    const isNew = (now - updatedAt) < (2 * 24 * 60 * 60 * 1000);

    return (
        <Link href={`/anime/${anime.slug}`}>
            <div className="anime-card" style={{
                position: "relative",
                borderRadius: "8px",
                overflow: "hidden",
                background: "var(--surface)",
                cursor: "pointer",
                border: "1px solid var(--border)",
            }}>
                {/* Cover */}
                <div style={{ position: "relative", aspectRatio: "2/3", width: "100%", background: "#0f0f1f", overflow: "hidden" }}>
                    {anime.cover_url ? (
                        <Image
                            src={anime.cover_url}
                            alt={anime.title}
                            fill
                            style={{ objectFit: "cover" }}
                            className="anime-card-img"
                            unoptimized
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        />
                    ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ color: "var(--text-dim)", fontSize: "2rem" }}>?</span>
                        </div>
                    )}

                    {/* Play Button Overlay (Hover) */}
                    <div className="play-overlay">
                        <div className="play-icon">▶</div>
                    </div>

                    {/* Top Left: Type Badge */}
                    <div style={{ position: "absolute", top: 7, left: 7, zIndex: 10 }}>
                        <span style={{
                            background: isMovie ? "rgba(230,57,80,0.9)" : "rgba(30,30,40,0.9)",
                            color: "#fff", fontSize: "0.58rem", fontWeight: 800,
                            padding: "2px 6px", borderRadius: "4px", letterSpacing: "0.05em",
                            border: "1px solid rgba(255,255,255,0.15)"
                        }}>
                            {typeLabel}
                        </span>
                    </div>

                    {/* Top Right: Episode count & NEW label */}
                    <div style={{ position: "absolute", top: 7, right: 7, display: "flex", gap: "4px", zIndex: 10 }}>
                        {isNew && (
                            <div style={{ background: "var(--accent)", borderRadius: "4px", padding: "2px 6px", display: "flex", alignItems: "center" }}>
                                <span style={{ color: "#fff", fontSize: "0.55rem", fontWeight: 800, letterSpacing: "0.05em" }}>NEW</span>
                            </div>
                        )}
                        {epCount > 0 && (
                            <div style={{ background: "#3b4a9e", borderRadius: "4px", padding: "2px 6px", minWidth: "22px", textAlign: "center" }}>
                                <span style={{ color: "#fff", fontSize: "0.7rem", fontWeight: 800 }}>{epCount}</span>
                            </div>
                        )}
                    </div>

                    {/* Bottom Title Overlay (Premium Gradient) */}
                    <div style={{
                        position: "absolute", bottom: 0, left: 0, right: 0, padding: "2.5rem 0.65rem 0.6rem",
                        background: "linear-gradient(to top, rgba(7,7,13,0.98) 0%, rgba(7,7,13,0.8) 40%, transparent 100%)",
                        zIndex: 10
                    }}>
                        <p style={{
                            color: "#fff", fontWeight: 700, fontSize: "0.8rem",
                            margin: 0, lineHeight: 1.3,
                            overflow: "hidden", display: "-webkit-box",
                            WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
                            textShadow: "0 2px 4px rgba(0,0,0,0.8)"
                        }}>{anime.title}</p>
                        {genres.length > 0 && (
                            <p style={{ color: "var(--text-muted)", fontSize: "0.66rem", margin: "3px 0 0" }}>
                                {genres.filter(g => g !== "Update Terbaru" && g !== "Popular").slice(0, 2).join(" · ")}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
