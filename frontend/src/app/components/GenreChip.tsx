"use client";

import Link from "next/link";

export default function GenreChip({ genre, count }: { genre: string; count: number }) {
    return (
        <Link href={`/genre/${encodeURIComponent(genre.toLowerCase())}`} style={{ textDecoration: "none" }}>
            <div
                style={{
                    background: "#111",
                    border: "1px solid #222",
                    borderRadius: "2px",
                    padding: "0.45rem 0.9rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    transition: "border-color 0.15s",
                    cursor: "pointer",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "#FF0000")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "#222")}
            >
                <span style={{ color: "#fff", fontSize: "0.82rem", fontWeight: 600 }}>{genre}</span>
                <span style={{ color: "#555", fontSize: "0.72rem" }}>({count})</span>
            </div>
        </Link>
    );
}
