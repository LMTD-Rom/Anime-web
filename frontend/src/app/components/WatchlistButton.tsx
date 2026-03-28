"use client";
import { useWatchlist } from "@/app/hooks/useWatchlist";

interface WatchlistButtonProps {
    slug: string;
    title: string;
    cover_url: string | null;
    genres: string[];
    episode_count: number;
}

export default function WatchlistButton({ slug, title, cover_url, genres, episode_count }: WatchlistButtonProps) {
    const { toggle, isInWatchlist, mounted } = useWatchlist();
    const inList = mounted && isInWatchlist(slug);

    if (!mounted) return null;

    return (
        <button
            id={`watchlist-btn-${slug}`}
            onClick={() => toggle({ slug, title, cover_url, genres, episode_count })}
            title={inList ? "Hapus dari Watchlist" : "Tambah ke Watchlist"}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.6rem 1.2rem",
                borderRadius: "8px",
                border: inList ? "1px solid var(--accent)" : "1px solid var(--border)",
                background: inList ? "var(--accent-dim)" : "var(--surface2)",
                color: inList ? "var(--accent)" : "var(--text-muted)",
                fontWeight: 700,
                fontSize: "0.82rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
                letterSpacing: "0.02em",
            }}
        >
            <span style={{ fontSize: "1rem" }}>{inList ? "♥" : "♡"}</span>
            <span>{inList ? "Di Watchlist" : "Tambah Watchlist"}</span>
        </button>
    );
}
