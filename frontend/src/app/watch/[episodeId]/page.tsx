"use client";

import { use, useEffect, useState } from "react";
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
    animes?: { title: string; slug: string };
}

export default function WatchPage({ params }: { params: Promise<{ episodeId: string }> }) {
    const { episodeId } = use(params);

    const [episode, setEpisode] = useState<Episode | null>(null);
    const [sources, setSources] = useState<VideoSource[]>([]);
    const [activeSource, setActiveSource] = useState<VideoSource | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const supabase = createClient();
            const { data: ep } = await supabase
                .from("episodes")
                .select("*, animes(title, slug)")
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
                    setActiveSource(vidSources[0] as VideoSource);
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
                    <div style={{ width: "40px", height: "40px", border: "3px solid #333", borderTop: "3px solid #FF0000", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 1rem" }} />
                    <p style={{ color: "#555" }}>Memuat video...</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!episode) {
        return (
            <div style={{ textAlign: "center", paddingTop: "10rem", color: "#555" }}>
                Episode tidak ditemukan.
            </div>
        );
    }

    const anime = episode.animes;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            {/* Breadcrumb */}
            <nav style={{ marginBottom: "1rem", fontSize: "0.8rem", color: "#555" }}>
                <a href="/" style={{ color: "#FF0000", textDecoration: "none" }}>Home</a>
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
                <span style={{ color: "#FF0000" }}>Episode {episode.episode_no}</span>
            </h1>

            {/* Video Player */}
            <div
                style={{
                    width: "100%",
                    aspectRatio: "16 / 9",
                    background: "#0a0a0a",
                    border: "1px solid #222",
                    borderRadius: "4px",
                    overflow: "hidden",
                    marginBottom: "1.5rem",
                    position: "relative",
                }}
            >
                {activeSource ? (
                    <iframe
                        src={activeSource.video_url}
                        title={`${anime?.title} Episode ${episode.episode_no}`}
                        style={{ width: "100%", height: "100%", border: "none" }}
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
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
                    <div style={{ borderLeft: "4px solid #FF0000", paddingLeft: "0.75rem", marginBottom: "0.75rem" }}>
                        <p style={{ color: "#555", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>
                            Pilih Server
                        </p>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {sources.map((src, i) => {
                            const isActive = activeSource?.id === src.id;
                            return (
                                <button
                                    key={src.id}
                                    onClick={() => setActiveSource(src)}
                                    style={{
                                        background: isActive ? "#FF0000" : "#111",
                                        color: isActive ? "#fff" : "#aaa",
                                        border: `1px solid ${isActive ? "#FF0000" : "#333"}`,
                                        borderRadius: "0px",
                                        padding: "0.5rem 1.2rem",
                                        cursor: "pointer",
                                        fontWeight: 700,
                                        fontSize: "0.82rem",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.06em",
                                        transition: "all 0.15s ease",
                                    }}
                                >
                                    Server {i + 1}
                                    <span style={{ opacity: 0.6, marginLeft: "6px", fontSize: "0.7rem", fontWeight: 400 }}>
                                        {src.quality}
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
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            color: "#aaa",
                            textDecoration: "none",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            border: "1px solid #333",
                            padding: "0.6rem 1.2rem",
                            borderRadius: "4px",
                            transition: "border-color 0.15s, color 0.15s",
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.borderColor = "#FF0000";
                            (e.currentTarget as HTMLAnchorElement).style.color = "#FF0000";
                        }}
                        onMouseLeave={(e) => {
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
