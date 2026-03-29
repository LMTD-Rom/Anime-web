"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

const GENRES = [
    "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror",
    "Mystery", "Romance", "Sci-Fi", "Slice of Life", "Sports",
    "Supernatural", "Thriller", "Isekai", "Shounen", "Seinen",
];

export default function FilterBar() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const sort = searchParams.get("sort") ?? "terbaru";
    const status = searchParams.get("status") ?? "all";
    const genre = searchParams.get("genre") ?? "";

    const update = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === "all" || value === "terbaru" || value === "") {
            params.delete(key);
        } else {
            params.set(key, value);
        }
        params.delete("page"); // reset to page 1
        router.push(`${pathname}?${params.toString()}`);
    }, [searchParams, pathname, router]);

    const btnStyle = (active: boolean) => ({
        padding: "5px 14px",
        borderRadius: "20px",
        border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
        background: active ? "var(--accent-dim)" : "transparent",
        color: active ? "var(--accent)" : "var(--text-muted)",
        fontSize: "0.78rem",
        fontWeight: active ? 700 : 500,
        cursor: "pointer",
        transition: "all 0.15s ease",
        whiteSpace: "nowrap" as const,
    });

    return (
        <div style={{ marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {/* Sort + Status row */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", alignItems: "center" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 700, marginRight: "0.25rem" }}>Sort:</span>
                {[
                    { label: "Terbaru", value: "terbaru" },
                    { label: "A–Z", value: "az" },
                    { label: "Z–A", value: "za" },
                ].map(opt => (
                    <button key={opt.value} onClick={() => update("sort", opt.value)} style={btnStyle(sort === opt.value)}>
                        {opt.label}
                    </button>
                ))}

                <span style={{ color: "var(--border)", margin: "0 0.25rem" }}>|</span>

                <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 700, marginRight: "0.25rem" }}>Status:</span>
                {[
                    { label: "Semua", value: "all" },
                    { label: "Ongoing", value: "Ongoing" },
                    { label: "Completed", value: "Completed" },
                ].map(opt => (
                    <button key={opt.value} onClick={() => update("status", opt.value)} style={btnStyle(status === opt.value)}>
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Genre row */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", alignItems: "center" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 700, marginRight: "0.25rem" }}>Genre:</span>
                <button onClick={() => update("genre", "")} style={btnStyle(!genre)}>Semua</button>
                {GENRES.map(g => (
                    <button key={g} onClick={() => update("genre", g)} style={btnStyle(genre === g)}>
                        {g}
                    </button>
                ))}
            </div>
        </div>
    );
}
