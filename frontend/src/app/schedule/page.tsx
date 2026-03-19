import { createClient } from "@/lib/supabase/server";
import AnimeCard from "@/app/components/AnimeCard";

export const metadata = {
    title: "Jadwal Anime — AnimeX",
    description: "Anime ongoing berdasarkan hari tayang.",
};

const DAYS_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTHS_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function wibNow() {
    return new Date(Date.now() + 7 * 3600 * 1000);
}

export default async function SchedulePage() {
    const supabase = await createClient();
    const now = wibNow();
    const todayName = DAYS_ID[now.getUTCDay()];
    const todayDateStr = `${now.getUTCDate()} ${MONTHS_ID[now.getUTCMonth()]} ${now.getUTCFullYear()}`;

    // Only show anime that have a real schedule_day assigned
    const { data: scheduledAnimes } = await supabase
        .from("animes")
        .select("*")
        .not("schedule_day", "is", null)
        .eq("status", "Ongoing")
        .order("title", { ascending: true });

    // Group by day
    const byDay: Record<string, typeof scheduledAnimes> = {};
    DAYS_ID.forEach((d) => { byDay[d] = []; });
    (scheduledAnimes ?? []).forEach((a) => {
        if (a.schedule_day && byDay[a.schedule_day]) {
            byDay[a.schedule_day]!.push(a);
        }
    });

    const hasData = (scheduledAnimes ?? []).length > 0;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div style={{ borderLeft: "4px solid #FF0000", paddingLeft: "1rem", marginBottom: "2.5rem" }}>
                <h1 style={{ color: "#fff", fontSize: "1.6rem", fontWeight: 900, margin: 0 }}>Jadwal Tayang</h1>
                <p style={{ color: "#555", fontSize: "0.85rem", marginTop: "4px" }}>
                    Hari ini: <span style={{ color: "#fff" }}>{todayName}, {todayDateStr}</span>
                </p>
            </div>

            {!hasData ? (
                <div style={{ textAlign: "center", padding: "4rem 0" }}>
                    <p style={{ color: "#444", fontSize: "0.95rem", marginBottom: "0.5rem" }}>
                        Data jadwal belum tersedia.
                    </p>
                    <p style={{ color: "#333", fontSize: "0.82rem" }}>
                        Jadwal tayang akan otomatis terisi saat scraper berhasil mendapatkan data hari tayang dari sumber.
                    </p>
                </div>
            ) : (
                DAYS_ID.map((day) => {
                    const animes = byDay[day] ?? [];
                    if (animes.length === 0) return null;
                    const isToday = day === todayName;
                    return (
                        <section key={day} style={{ marginBottom: "3rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", paddingBottom: "0.6rem", borderBottom: "1px solid #1a1a1a" }}>
                                {isToday && (
                                    <span style={{ background: "#FF0000", color: "#fff", fontSize: "0.6rem", fontWeight: 800, padding: "2px 7px", letterSpacing: "0.08em" }}>
                                        HARI INI
                                    </span>
                                )}
                                <h2 style={{ color: isToday ? "#fff" : "#aaa", fontWeight: 800, fontSize: "1rem", margin: 0 }}>
                                    {day}
                                </h2>
                                <span style={{ color: "#444", fontSize: "0.78rem" }}>{animes.length} anime</span>
                                <div style={{ flex: 1, height: "1px", background: "#1a1a1a" }} />
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {animes.map((anime) => <AnimeCard key={anime.id} anime={anime} />)}
                            </div>
                        </section>
                    );
                })
            )}
        </div>
    );
}
