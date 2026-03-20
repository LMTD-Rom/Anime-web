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
            <div className="episode-card-inner">
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
