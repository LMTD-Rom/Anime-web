"use client";

import Link from "next/link";

interface Episode {
    id: string;
    episode_no: number;
    title: string | null;
}

export default function EpisodeCard({ episode }: { episode: Episode }) {
    return (
        <Link href={`/watch/${episode.id}`} style={{ textDecoration: "none" }}>
            <div
                style={{
                    background: "#111",
                    border: "1px solid #222",
                    borderRadius: "4px",
                    padding: "0.75rem",
                    textAlign: "center",
                    transition: "border-color 0.15s, background 0.15s",
                }}
                onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "#FF0000";
                    (e.currentTarget as HTMLDivElement).style.background = "#1a0000";
                }}
                onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "#222";
                    (e.currentTarget as HTMLDivElement).style.background = "#111";
                }}
            >
                <p style={{ color: "#aaa", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 2px" }}>
                    Episode
                </p>
                <p style={{ color: "#fff", fontWeight: 900, fontSize: "1.1rem", margin: 0 }}>
                    {episode.episode_no}
                </p>
            </div>
        </Link>
    );
}
