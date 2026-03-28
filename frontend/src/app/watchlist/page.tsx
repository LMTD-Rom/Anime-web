"use client";
import { useWatchlist } from "@/app/hooks/useWatchlist";
import Link from "next/link";
import Image from "next/image";

export default function WatchlistPage() {
    const { watchlist, remove, mounted } = useWatchlist();

    if (!mounted) return (
        <div style={{ minHeight: "100vh", padding: "4rem 1.5rem", textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)" }}>Loading...</p>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", padding: "2rem 0 4rem" }}>
            <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem" }}>
                <div className="section-label" style={{ marginBottom: "2rem" }}>
                    <span>Watchlist Saya</span>
                </div>

                {watchlist.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "6rem 0" }}>
                        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>♡</div>
                        <p style={{ color: "var(--text-muted)", fontSize: "1rem", marginBottom: "1.5rem" }}>
                            Watchlist Anda kosong.
                        </p>
                        <Link href="/" style={{
                            display: "inline-block",
                            padding: "0.7rem 1.5rem",
                            background: "var(--accent)",
                            color: "#fff",
                            borderRadius: "8px",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            textDecoration: "none",
                        }}>
                            Temukan Anime
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {watchlist.map((item) => (
                            <div key={item.slug} style={{ position: "relative" }}>
                                <Link href={`/anime/${item.slug}`}>
                                    <div className="anime-card" style={{
                                        borderRadius: "8px",
                                        overflow: "hidden",
                                        background: "var(--surface)",
                                        border: "1px solid var(--border)",
                                        cursor: "pointer",
                                    }}>
                                        <div style={{ position: "relative", aspectRatio: "2/3", overflow: "hidden" }}>
                                            {item.cover_url ? (
                                                <Image
                                                    src={item.cover_url}
                                                    alt={item.title}
                                                    fill
                                                    className="anime-card-img"
                                                    style={{ objectFit: "cover" }}
                                                    unoptimized
                                                    sizes="(max-width: 640px) 50vw, 20vw"
                                                />
                                            ) : (
                                                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface2)" }}>
                                                    <span style={{ fontSize: "2rem" }}>🎬</span>
                                                </div>
                                            )}
                                            <div style={{
                                                position: "absolute", bottom: 0, left: 0, right: 0, padding: "2rem 0.65rem 0.6rem",
                                                background: "linear-gradient(to top, rgba(7,7,13,0.98) 0%, rgba(7,7,13,0.7) 50%, transparent 100%)"
                                            }}>
                                                <p style={{
                                                    color: "#fff", fontWeight: 700, fontSize: "0.8rem",
                                                    margin: 0, lineHeight: 1.3, overflow: "hidden",
                                                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
                                                    textShadow: "0 1px 4px rgba(0,0,0,0.8)"
                                                }}>{item.title}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                                <button
                                    onClick={() => remove(item.slug)}
                                    title="Hapus dari Watchlist"
                                    style={{
                                        position: "absolute", top: 7, right: 7, zIndex: 20,
                                        background: "rgba(230,57,80,0.85)",
                                        border: "none", color: "#fff",
                                        borderRadius: "50%", width: "24px", height: "24px",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "0.7rem", cursor: "pointer",
                                        fontWeight: 900, lineHeight: 1
                                    }}
                                >✕</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
