import fs from "fs";
import path from "path";
import React from 'react';

// Force dynamic so the JSON isn't cached permanently at build time
export const dynamic = "force-dynamic";

export const metadata = {
    title: "Jadwal Rilis Anime - Sukinime",
    description: "Cek jadwal rilis anime sub indo terbaru setiap harinya.",
};

type AnimeSchedule = {
    title: string;
    time: string;
    cover_url: string;
};

type ScheduleData = {
    [day: string]: AnimeSchedule[];
};

export default function JadwalPage() {
    let scheduleData: ScheduleData = {};

    try {
        const filePath = path.join(process.cwd(), "public", "jadwal.json");
        if (fs.existsSync(filePath)) {
            const fileContents = fs.readFileSync(filePath, "utf8");
            scheduleData = JSON.parse(fileContents);
        }
    } catch (error) {
        console.error("Failed to read jadwal.json", error);
    }

    const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

    return (
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "6rem 1.5rem 2rem", minHeight: "80vh" }}>
            <div style={{ marginBottom: "3rem", textAlign: "center" }}>
                <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>
                    Jadwal <span style={{ color: "var(--accent)" }}>Rilis</span>
                </h1>
                <p style={{ color: "var(--text-muted)" }}>
                    Jadwal tayang rutin anime yang sedang on-going.
                </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
                {days.map((day) => {
                    const animes = scheduleData[day];
                    if (!animes || animes.length === 0) return null;

                    return (
                        <div key={day}>
                            <h2 style={{
                                fontSize: "1.5rem",
                                fontWeight: 800,
                                marginBottom: "1.5rem",
                                paddingBottom: "0.75rem",
                                borderBottom: "1px dashed var(--border)",
                                color: "var(--text)",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem"
                            }}>
                                <span style={{ color: "var(--accent)" }}>■</span> {day}
                            </h2>

                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                                gap: "1rem"
                            }}>
                                {animes.map((anime, idx) => (
                                    <div key={idx} style={{
                                        display: "flex",
                                        gap: "1rem",
                                        background: "rgba(30, 30, 38, 0.4)",
                                        padding: "1rem",
                                        borderRadius: "12px",
                                        border: "1px solid var(--border)",
                                        alignItems: "center",
                                        transition: "all 0.2s ease"
                                    }}
                                        className="hover:border-[var(--accent)] hover:bg-[rgba(40,40,50,0.6)]"
                                    >
                                        <div style={{
                                            width: "65px",
                                            height: "90px",
                                            flexShrink: 0,
                                            borderRadius: "8px",
                                            overflow: "hidden",
                                            position: "relative",
                                            background: "var(--surface)"
                                        }}>
                                            {anime.cover_url ? (
                                                <img
                                                    src={anime.cover_url}
                                                    alt={anime.title}
                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                    loading="lazy"
                                                />
                                            ) : null}
                                        </div>

                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flex: 1 }}>
                                            <h3 style={{
                                                fontSize: "0.95rem",
                                                fontWeight: 700,
                                                color: "#fff",
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden",
                                                lineHeight: "1.4"
                                            }} title={anime.title}>
                                                {anime.title}
                                            </h3>
                                            <div style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "4px",
                                                background: "var(--accent-dim)",
                                                color: "var(--accent)",
                                                padding: "4px 8px",
                                                borderRadius: "6px",
                                                fontSize: "0.75rem",
                                                fontWeight: 700,
                                                alignSelf: "flex-start"
                                            }}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                                {anime.time}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
