"use client";

import { use, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface VideoSource {
    id: string;
    provider_name: string;
    video_url: string;
    quality: string;
    is_embed: boolean;
}

interface Episode {
    id: string;
    episode_no: number;
    title: string | null;
    anime_id: string;
    animes?: { title: string; slug: string; cover_url?: string };
}

function qualityLabel(quality: string): string {
    if (!quality || quality === "auto") return "All Res";
    const q = quality.toLowerCase();
    if (q.includes("1080")) return "1080p";
    if (q.includes("720")) return "720p";
    if (q.includes("480")) return "480p";
    if (q.includes("360")) return "360p";
    return quality.toUpperCase();
}

export default function WatchPage({ params }: { params: Promise<{ episodeId: string }> }) {
    const { episodeId } = use(params);

    const [episode, setEpisode] = useState<Episode | null>(null);
    const [sources, setSources] = useState<VideoSource[]>([]);
    const [activeIdx, setActiveIdx] = useState(0);
    const [loading, setLoading] = useState(true);
    const [iframeError, setIframeError] = useState(false);

    const activeSource = sources[activeIdx] ?? null;

    const switchNext = useCallback(() => {
        setActiveIdx(prev => {
            const next = prev + 1;
            return next < sources.length ? next : prev;
        });
        setIframeError(false);
    }, [sources.length]);

    useEffect(() => {
        const load = async () => {
            const supabase = createClient();
            const { data: ep } = await supabase
                .from("episodes")
                .select("*, animes(title, slug, cover_url)")
                .eq("id", episodeId)
                .single();

            if (ep) {
                setEpisode(ep as Episode);
                const { data: vidSources } = await supabase
                    .from("video_sources")
                    .select("*")
                    .eq("episode_id", ep.id);
                if (vidSources && vidSources.length > 0) {
                    setSources(vidSources as VideoSource[]);
                    setActiveIdx(0);
                }

                // Save continue watching
                const anime = (ep as Episode).animes;
                if (anime) {
                    const entry = {
                        episodeId,
                        animeSlug: anime.slug,
                        animeTitle: anime.title,
                        coverUrl: anime.cover_url ?? null,
                        episodeNo: (ep as Episode).episode_no,
                        watchedAt: Date.now(),
                    };

                    // Always write to localStorage as fallback
                    try {
                        const key = "sukinime_continue";
                        const existing: object[] = JSON.parse(localStorage.getItem(key) ?? "[]");
                        const filtered = (existing as Array<{ episodeId: string }>).filter(
                            (x) => x.episodeId !== episodeId
                        );
                        localStorage.setItem(key, JSON.stringify([entry, ...filtered].slice(0, 12)));
                    } catch { /* ignore */ }

                    // If logged in, also save to Supabase
                    const { data: userData } = await supabase.auth.getUser();
                    if (userData.user) {
                        await supabase.from("watch_history").upsert({
                            user_id: userData.user.id,
                            episode_id: episodeId,
                            anime_slug: anime.slug,
                            anime_title: anime.title,
                            cover_url: anime.cover_url ?? null,
                            episode_no: (ep as Episode).episode_no,
                            watched_at: new Date().toISOString(),
                        }, { onConflict: "user_id,episode_id" });
                    }
                }
            }
            setLoading(false);
        };
        load();
    }, [episodeId]);

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ width: "40px", height: "40px", border: "3px solid #333", borderTop: "3px solid var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 1rem" }} />
                    <p style={{ color: "#555" }}>Memuat video...</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!episode) {
        return <div style={{ textAlign: "center", paddingTop: "10rem", color: "#555" }}>Episode tidak ditemukan.</div>;
    }

    const anime = episode.animes;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            {/* Breadcrumb */}
            <nav style={{ marginBottom: "1rem", fontSize: "0.8rem", color: "#555" }}>
                <a href="/" style={{ color: "var(--accent)", textDecoration: "none" }}>Home</a>
                <span style={{ margin: "0 0.5rem" }}>/</span>
                {anime && (
                    <>
                        <a href={`/anime/${anime.slug}`} style={{ color: "#aaa", textDecoration: "none" }}>{anime.title}</a>
                        <span style={{ margin: "0 0.5rem" }}>/</span>
                    </>
                )}
                <span>Episode {episode.episode_no}</span>
            </nav>

            {/* Title */}
            <h1 style={{ color: "#fff", fontSize: "1.3rem", fontWeight: 800, margin: "0 0 1.5rem", lineHeight: 1.3 }}>
                {anime?.title} —{" "}
                <span style={{ color: "var(--accent)" }}>Episode {episode.episode_no}</span>
            </h1>

            {/* Video Player */}
            <div style={{
                width: "100%", aspectRatio: "16 / 9",
                background: "#0a0a0a", border: "1px solid #222",
                borderRadius: "4px", overflow: "hidden",
                marginBottom: "1.5rem", position: "relative",
            }}>
                {activeSource && !iframeError ? (
                    <iframe
                        key={activeSource.id}
                        src={activeSource.video_url}
                        title={`${anime?.title} Episode ${episode.episode_no}`}
                        style={{ width: "100%", height: "100%", border: "none" }}
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        onError={() => setIframeError(true)}
                    />
                ) : iframeError && activeIdx < sources.length - 1 ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "1rem" }}>
                        <p style={{ color: "#aaa", fontSize: "0.9rem" }}>Server ini tidak dapat diputar.</p>
                        <button
                            onClick={switchNext}
                            style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: "6px", padding: "0.5rem 1.2rem", fontWeight: 700, cursor: "pointer" }}
                        >
                            Coba Server Berikutnya
                        </button>
                    </div>
                ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#333" }}>
                        <div style={{ textAlign: "center" }}>
                            <p style={{ fontSize: "3rem", margin: "0 0 0.5rem" }}>▶</p>
                            <p style={{ color: "#555", fontSize: "0.9rem" }}>Tidak ada sumber video tersedia.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Server Switcher */}
            {sources.length > 0 && (
                <div>
                    <div style={{ borderLeft: "4px solid var(--accent)", paddingLeft: "0.75rem", marginBottom: "0.75rem" }}>
                        <p style={{ color: "#555", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>
                            Pilih Server · <span style={{ color: "var(--text-muted)" }}>{sources.length} tersedia</span>
                        </p>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {sources.map((src, i) => {
                            const isActive = i === activeIdx;
                            const qlabel = qualityLabel(src.quality);
                            return (
                                <button
                                    key={src.id}
                                    onClick={() => { setActiveIdx(i); setIframeError(false); }}
                                    style={{
                                        background: isActive ? "var(--accent)" : "var(--surface2)",
                                        color: isActive ? "#fff" : "#aaa",
                                        border: `1px solid ${isActive ? "var(--accent)" : "var(--border)"}`,
                                        borderRadius: "6px",
                                        padding: "0.45rem 1rem",
                                        cursor: "pointer",
                                        fontWeight: 700,
                                        fontSize: "0.8rem",
                                        transition: "all 0.15s ease",
                                        display: "flex", alignItems: "center", gap: "0.5rem",
                                    }}
                                >
                                    <span>{src.provider_name || `Server ${i + 1}`}</span>
                                    <span style={{
                                        fontSize: "0.65rem", fontWeight: 700,
                                        background: isActive ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.07)",
                                        padding: "1px 6px", borderRadius: "3px",
                                        letterSpacing: "0.04em",
                                    }}>
                                        {qlabel}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    <p style={{ color: "#444", fontSize: "0.75rem", marginTop: "0.75rem" }}>
                        Jika video tidak bisa diputar, coba server lain.
                    </p>
                </div>
            )}

            {/* Navigation */}
            {anime && (
                <div style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid #222" }}>
                    <a
                        href={`/anime/${anime.slug}`}
                        style={{
                            display: "inline-flex", alignItems: "center", gap: "0.5rem",
                            color: "#aaa", textDecoration: "none", fontSize: "0.85rem",
                            fontWeight: 600, border: "1px solid #333",
                            padding: "0.6rem 1.2rem", borderRadius: "4px",
                            transition: "border-color 0.15s, color 0.15s",
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--accent)";
                            (e.currentTarget as HTMLAnchorElement).style.color = "var(--accent)";
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLAnchorElement).style.borderColor = "#333";
                            (e.currentTarget as HTMLAnchorElement).style.color = "#aaa";
                        }}
                    >
                        ← Kembali ke {anime.title}
                    </a>
                </div>
            )}
        </div>
    );
}
