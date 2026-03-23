import Link from "next/link";
import Image from "next/image";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function AnimeCard({ anime }: { anime: any }) {
    const genres: string[] = Array.isArray(anime.genres) ? anime.genres : [];
    const epCount = anime.episode_count ?? 0;
    const isOngoing = typeof anime.status === "string" && anime.status.trim().toLowerCase() === "ongoing";

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
                <div style={{ position: "relative", aspectRatio: "2/3", width: "100%", background: "#0f0f1f" }}>
                    {anime.cover_url ? (
                        <Image
                            src={anime.cover_url}
                            alt={anime.title}
                            fill
                            style={{ objectFit: "cover" }}
                            unoptimized
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        />
                    ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ color: "var(--text-dim)", fontSize: "2rem" }}>?</span>
                        </div>
                    )}

                    {/* Bottom gradient */}
                    <div style={{
                        position: "absolute", bottom: 0, left: 0, right: 0, height: "60%",
                        background: "linear-gradient(to top, rgba(7,7,13,0.95) 0%, transparent 100%)",
                    }} />

                    {/* Episode count - top right as in screenshot */}
                    {epCount > 0 && (
                        <div style={{ position: "absolute", top: 7, right: 7, background: "#3b4a9e", borderRadius: "4px", padding: "2px 6px", minWidth: "22px", textAlign: "center" }}>
                            <span style={{ color: "#fff", fontSize: "0.7rem", fontWeight: 800 }}>{epCount}</span>
                        </div>
                    )}

                    {/* Title overlay */}
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0.6rem 0.65rem" }}>
                        <p style={{
                            color: "#fff", fontWeight: 700, fontSize: "0.8rem",
                            margin: 0, lineHeight: 1.3,
                            overflow: "hidden", display: "-webkit-box",
                            WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
                        }}>{anime.title}</p>
                        {genres.length > 0 && (
                            <p style={{ color: "var(--text-muted)", fontSize: "0.66rem", margin: "3px 0 0" }}>
                                {genres.slice(0, 2).join(" · ")}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
