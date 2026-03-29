"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface WatchEntry {
    episodeId: string;
    animeSlug: string;
    animeTitle: string;
    coverUrl: string | null;
    episodeNo: number;
    watchedAt: number;
}

export default function ContinueWatching() {
    const [history, setHistory] = useState<WatchEntry[]>([]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem("sukinime_continue");
            if (raw) setHistory(JSON.parse(raw));
        } catch { /* ignore */ }
    }, []);

    const remove = (episodeId: string) => {
        const updated = history.filter(e => e.episodeId !== episodeId);
        setHistory(updated);
        localStorage.setItem("sukinime_continue", JSON.stringify(updated));
    };

    if (history.length === 0) return null;

    return (
        <section style={{ marginBottom: "2.5rem" }}>
            <div className="section-label" style={{ marginBottom: "1.25rem" }}>
                <span>Lanjut Nonton</span>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
                {history.map(entry => (
                    <div key={entry.episodeId} style={{ flexShrink: 0, width: "120px", position: "relative" }}>
                        {/* Remove button */}
                        <button
                            onClick={() => remove(entry.episodeId)}
                            title="Hapus"
                            style={{
                                position: "absolute", top: "4px", right: "4px", zIndex: 10,
                                width: "20px", height: "20px", borderRadius: "50%",
                                background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.15)",
                                color: "#aaa", cursor: "pointer", fontSize: "0.65rem",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                lineHeight: 1,
                            }}
                        >✕</button>

                        <Link href={`/watch/${entry.episodeId}`} style={{ textDecoration: "none" }}>
                            {/* Cover */}
                            <div style={{
                                width: "120px", height: "160px", borderRadius: "8px",
                                overflow: "hidden", position: "relative",
                                background: "var(--surface2)",
                                border: "1px solid var(--border)",
                                marginBottom: "0.4rem",
                            }}>
                                {entry.coverUrl ? (
                                    <Image src={entry.coverUrl} alt={entry.animeTitle} fill style={{ objectFit: "cover" }} unoptimized />
                                ) : (
                                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-dim)", fontSize: "2rem" }}>🎬</div>
                                )}
                                {/* Play overlay */}
                                <div style={{
                                    position: "absolute", inset: 0,
                                    background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 50%)",
                                    display: "flex", alignItems: "flex-end", padding: "6px",
                                }}>
                                    <span style={{
                                        background: "var(--accent)", color: "#fff",
                                        fontSize: "0.58rem", fontWeight: 800,
                                        padding: "2px 6px", borderRadius: "3px",
                                    }}>
                                        EP {entry.episodeNo}
                                    </span>
                                </div>
                            </div>
                            {/* Title */}
                            <p style={{
                                color: "var(--text)", fontSize: "0.72rem", fontWeight: 600,
                                margin: 0, lineHeight: 1.3,
                                display: "-webkit-box", WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical" as const, overflow: "hidden",
                            }}>
                                {entry.animeTitle}
                            </p>
                        </Link>
                    </div>
                ))}
            </div>
        </section>
    );
}
