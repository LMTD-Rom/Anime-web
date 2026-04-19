"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface AdminDashboardProps {
    user: any;
}

type Tab = "overview" | "users";

export default function AdminDashboard({ user }: AdminDashboardProps) {
    const [stats, setStats] = useState({ animes: 0, episodes: 0, users: 0, broken: 0 });
    const [animes, setAnimes] = useState<any[]>([]);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [queue, setQueue] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<Tab>("overview");
    const [loadingAnimes, setLoadingAnimes] = useState(true);
    const [scrapeUrl, setScrapeUrl] = useState("");
    const [scrapeTitle, setScrapeTitle] = useState("");
    const [scraping, setScraping] = useState(false);
    const [message, setMessage] = useState("");
    const [maintenance, setMaintenance] = useState(false);
    const [systemNotifMessage, setSystemNotifMessage] = useState("");
    const [systemNotifLoading, setSystemNotifLoading] = useState(false);

    // Modal Edit State
    const [editingAnime, setEditingAnime] = useState<any>(null);
    const [isToolsSidebarOpen, setIsToolsSidebarOpen] = useState(false);

    const supabase = createClient();

    const fetchData = async () => {
        // Stats
        const { count: animeCount } = await supabase.from("animes").select("*", { count: "exact", head: true });
        const { count: epCount } = await supabase.from("episodes").select("*", { count: "exact", head: true });
        const { count: profileCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
        const { count: brokenCount } = await supabase.from("video_sources").select("*", { count: "exact", head: true }).eq("is_broken", true);

        setStats({
            animes: animeCount || 0,
            episodes: epCount || 0,
            users: profileCount || 0,
            broken: brokenCount || 0
        });

        // Maintenance Mode
        const { data: maintData } = await supabase.from("site_settings").select("value").eq("key", "maintenance_mode").single();
        setMaintenance(maintData?.value === "true");

        // Anime List
        const { data: animeData } = await supabase.from("animes").select("*").order("updated_at", { ascending: false }).limit(50);
        setAnimes(animeData || []);

        // Profiles List (User Management)
        const { data: profileData } = await supabase.from("profiles").select("*").order("updated_at", { ascending: false });
        setProfiles(profileData || []);

        // Queue Monitor
        const { data: queueData } = await supabase.from("scraper_queue").select("*").order("created_at", { ascending: false }).limit(5);
        setQueue(queueData || []);

        setLoadingAnimes(false);
    };

    useEffect(() => {
        fetchData();
        // Poll queue every 10 seconds
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [supabase]);

    const handleScrape = async (e: React.FormEvent) => {
        e.preventDefault();
        setScraping(true);
        setMessage("");

        const { error } = await supabase.from("scraper_queue").insert({
            title: scrapeTitle,
            url: scrapeUrl,
            status: "pending"
        });

        if (error) {
            setMessage("Gagal: " + error.message);
        } else {
            setMessage("Sukses! Request masuk antrean.");
            setScrapeTitle("");
            setScrapeUrl("");
            fetchData();
        }
        setScraping(false);
    };

    const toggleMaintenance = async () => {
        const newValue = !maintenance;
        const { error } = await supabase.from("site_settings").upsert({ key: "maintenance_mode", value: String(newValue) });
        if (!error) setMaintenance(newValue);
    };

    const handleSetSystemNotif = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!systemNotifMessage.trim()) return;
        setSystemNotifLoading(true);
        const payload = {
            message: systemNotifMessage,
            id: Date.now().toString(),
            expires_at: Date.now() + 24 * 60 * 60 * 1000
        };
        const { error } = await supabase.from("site_settings").upsert({ 
            key: "system_notification", 
            value: JSON.stringify(payload) 
        });
        if (!error) {
            alert("System Notification Set for 24 hours!");
            setSystemNotifMessage("");
        } else {
            alert("Gagal set notif: " + error.message);
        }
        setSystemNotifLoading(false);
    };

    const handleUpdateAnime = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.from("animes").update({
            title: editingAnime.title,
            status: editingAnime.status,
            rating: editingAnime.rating
        }).eq("id", editingAnime.id);

        if (!error) {
            setEditingAnime(null);
            fetchData();
        }
    };

    const toggleAdminStatus = async (profileId: string, currentStatus: boolean) => {
        const { error } = await supabase.from("profiles").update({ is_admin: !currentStatus }).eq("id", profileId);
        if (!error) fetchData();
    };

    const deleteProfile = async (profileId: string) => {
        if (!confirm("Hapus profile ini? User tetap bisa login tapi data profile (watchlist dll) bakal ilang.")) return;
        const { error } = await supabase.from("profiles").delete().eq("id", profileId);
        if (!error) fetchData();
    };

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-4 sm:p-8 overflow-x-hidden">
            <div style={{ maxWidth: "1280px", margin: "0 auto", width: "100%" }}>

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 md:mb-12">
                    <div>
                        <h1 style={{ fontSize: "1.8rem", fontWeight: 900, margin: 0, letterSpacing: "-0.02em" }}>Dev Dashboard <span style={{ color: "var(--accent)" }}>V2</span></h1>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>Control Center — {user.email}</p>
                    </div>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                        {/* Maintenance Switch */}
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "var(--surface)", padding: "8px 16px", borderRadius: "12px", border: "1px solid var(--border)" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: 700 }}>MAINTENANCE</span>
                            <div
                                onClick={toggleMaintenance}
                                style={{
                                    width: "44px", height: "22px", borderRadius: "11px",
                                    background: maintenance ? "var(--accent)" : "#333",
                                    position: "relative", cursor: "pointer", transition: "0.3s"
                                }}
                            >
                                <div style={{
                                    width: "18px", height: "18px", borderRadius: "50%", background: "#fff",
                                    position: "absolute", top: "2px", left: maintenance ? "24px" : "2px", transition: "0.3s"
                                }} />
                            </div>
                        </div>
                        <button onClick={() => supabase.auth.signOut()} style={{ padding: "0.6rem 1.2rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", borderRadius: "10px", color: "#fff", cursor: "pointer" }}>Sign Out</button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "2rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
                    {([
                        { id: "overview", label: "Overview", icon: "📊" },
                        { id: "users", label: "User Management", icon: "👤" }
                    ] as const).map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "12px", border: "none", cursor: "pointer",
                                background: activeTab === tab.id ? "var(--accent)" : "rgba(255,255,255,0.03)",
                                color: activeTab === tab.id ? "#fff" : "var(--text-muted)",
                                fontWeight: 700, transition: "0.2s"
                            }}
                        >
                            <span>{tab.icon}</span> {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === "overview" ? (
                    <>
                        {/* OVERVIEW CONTENT */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
                            {[
                                { label: "Animes", value: stats.animes, icon: "🎬", color: "var(--accent)" },
                                { label: "Episodes", value: stats.episodes, icon: "🎞️", color: "#6366f1" },
                                { label: "Users", value: stats.users, icon: "👤", color: "#10b981" },
                                { label: "Broken Links", value: stats.broken, icon: "⚠️", color: "#f59e0b" },
                            ].map(s => (
                                <div key={s.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "20px", padding: "1.5rem", position: "relative", overflow: "hidden" }}>
                                    <div style={{ position: "absolute", right: "-10px", bottom: "-10px", fontSize: "4rem", opacity: 0.05 }}>{s.icon}</div>
                                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.5rem" }}>{s.label}</div>
                                    <div style={{ fontSize: "2rem", fontWeight: 900 }}>{s.value.toLocaleString()}</div>
                                </div>
                            ))}
                        </div>

                        {/* Mobile Sidebar Toggle */}
                        <div className="flex lg:hidden justify-between items-center mb-6 bg-[var(--surface)] border border-[var(--border)] rounded-[20px] p-4">
                            <div>
                                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800 }}>Admin Tools</h3>
                                <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)" }}>Scraper & Link Checker</p>
                            </div>
                            <button onClick={() => setIsToolsSidebarOpen(true)} style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: "10px", padding: "0.6rem 1rem", fontWeight: 800, cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}>
                                🛠️ Open Tools
                            </button>
                        </div>

                        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_400px] gap-8">
                            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                                {/* Queue Monitor */}
                                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "24px", padding: "1.5rem" }}>
                                    <h3 style={{ margin: "0 0 1.25rem", fontSize: "1rem", fontWeight: 800 }}>Live Scraper Queue</h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                        {queue.length > 0 ? queue.map(q => (
                                            <div key={q.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", padding: "12px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ fontWeight: 700, fontSize: "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{q.title}</div>
                                                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{new Date(q.created_at).toLocaleTimeString()}</div>
                                                </div>
                                                <span style={{
                                                    fontSize: "0.65rem", padding: "4px 10px", borderRadius: "20px", fontWeight: 700, textTransform: "uppercase",
                                                    background: q.status === 'completed' ? 'rgba(16,185,129,0.1)' : q.status === 'processing' ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.05)',
                                                    color: q.status === 'completed' ? '#10b981' : q.status === 'processing' ? '#6366f1' : 'var(--text-muted)'
                                                }}>
                                                    {q.status}
                                                </span>
                                            </div>
                                        )) : <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No active tasks.</p>}
                                    </div>
                                </div>

                                {/* Anime List */}
                                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "24px", padding: "1.5rem" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                                        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800 }}>Database Anime</h3>
                                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Menampilkan 50 terbaru</span>
                                    </div>
                                    <div style={{ overflowX: "auto" }}>
                                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                                            <thead>
                                                <tr style={{ color: "var(--text-muted)", fontSize: "0.7rem", textTransform: "uppercase" }}>
                                                    <th style={{ textAlign: "left", padding: "12px" }}>Judul</th>
                                                    <th style={{ textAlign: "left", padding: "12px" }}>Status</th>
                                                    <th style={{ textAlign: "left", padding: "12px" }}>Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {animes.map(a => (
                                                    <tr key={a.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                                        <td style={{ padding: "12px", fontWeight: 600 }}>{a.title}</td>
                                                        <td style={{ padding: "12px" }}>
                                                            <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: "100px", background: a.status === 'Ongoing' ? '#16a34a' : 'rgba(255,255,255,0.05)' }}>{a.status}</span>
                                                        </td>
                                                        <td style={{ padding: "12px" }}>
                                                            <button onClick={() => setEditingAnime(a)} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontWeight: 700 }}>EDIT</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Overlay */}
                            {isToolsSidebarOpen && (
                                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsToolsSidebarOpen(false)} />
                            )}

                            {/* Right Column / Sidebar */}
                            <div className={`fixed inset-y-0 right-0 z-50 w-[85vw] max-w-[360px] bg-[var(--surface)] p-6 overflow-y-auto transform transition-transform duration-300 lg:relative lg:transform-none lg:w-auto lg:p-0 lg:bg-transparent lg:z-auto ${isToolsSidebarOpen ? "translate-x-0 border-l border-[var(--border)] shadow-2xl" : "translate-x-full lg:translate-x-0"}`}>
                                <div className="flex justify-between items-center mb-6 lg:hidden">
                                    <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 900 }}>Admin Tools</h2>
                                    <button onClick={() => setIsToolsSidebarOpen(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.8rem", cursor: "pointer", lineHeight: 1 }}>&times;</button>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                                    {/* Manual Scraper */}
                                    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "24px", padding: "1.5rem" }}>
                                        <h3 style={{ margin: "0 0 1.5rem", fontSize: "1rem", fontWeight: 800 }}>Request Scrape Manual</h3>
                                        <form onSubmit={handleScrape} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                                <label style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 800 }}>JUDUL</label>
                                                <input type="text" required value={scrapeTitle} onChange={e => setScrapeTitle(e.target.value)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", borderRadius: "10px", padding: "0.85rem", color: "#fff" }} placeholder="Contoh: Demon Slayer S3" />
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                                <label style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 800 }}>URL ANOBOY</label>
                                                <input type="url" required value={scrapeUrl} onChange={e => setScrapeUrl(e.target.value)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", borderRadius: "10px", padding: "0.85rem", color: "#fff" }} placeholder="https://anoboy7.com/anime/..." />
                                            </div>
                                            {message && <div style={{ padding: "10px", borderRadius: "8px", background: message.startsWith("Gagal") ? "rgba(230,57,80,0.1)" : "rgba(16,185,129,0.1)", color: message.startsWith("Gagal") ? "var(--accent)" : "#10b981", fontSize: "0.8rem" }}>{message}</div>}
                                            <button type="submit" disabled={scraping} style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: "10px", padding: "1rem", fontWeight: 800, cursor: scraping ? "not-allowed" : "pointer" }}>{scraping ? "Processing..." : "Submit Task"}</button>
                                        </form>
                                    </div>
                                    {/* System Notification Setup */}
                                    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "24px", padding: "1.5rem" }}>
                                        <h3 style={{ margin: "0 0 1.5rem", fontSize: "1rem", fontWeight: 800 }}>Global Pop Up Pesan</h3>
                                        <form onSubmit={handleSetSystemNotif} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                                <label style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 800 }}>PESAN (Tampil 24 Jam)</label>
                                                <textarea required value={systemNotifMessage} onChange={e => setSystemNotifMessage(e.target.value)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", borderRadius: "10px", padding: "0.85rem", color: "#fff", resize: "vertical", minHeight: "80px" }} placeholder="Misal: Ada perbaikan server bentar bang..." />
                                            </div>
                                            <button type="submit" disabled={systemNotifLoading} style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: "10px", padding: "1rem", fontWeight: 800, cursor: systemNotifLoading ? "not-allowed" : "pointer" }}>{systemNotifLoading ? "Processing..." : "Set Notif"}</button>
                                        </form>
                                    </div>
                                    {/* Broken Link Status */}
                                    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "24px", padding: "1.5rem" }}>
                                        <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 800 }}>Broken Link Status</h3>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
                                            <div style={{ flex: 1, height: "8px", background: "#333", borderRadius: "4px", overflow: "hidden" }}>
                                                <div style={{ width: `${(stats.broken / (stats.episodes || 1)) * 100}%`, height: "100%", background: "var(--accent)" }} />
                                            </div>
                                            <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>{stats.broken} issues</span>
                                        </div>
                                        <button style={{ width: "100%", padding: "0.85rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "#fff", borderRadius: "10px", fontSize: "0.85rem", cursor: "pointer" }}>Run Deep Scanner</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    /* USER MANAGEMENT TAB */
                    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "24px", padding: "2rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                            <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 900 }}>User Management</h2>
                            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Total: {profiles.length} users</span>
                        </div>
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase" }}>
                                        <th style={{ padding: "1rem" }}>Display Name</th>
                                        <th style={{ padding: "1rem" }}>Email</th>
                                        <th style={{ padding: "1rem", textAlign: "center" }}>Role</th>
                                        <th style={{ padding: "1rem", textAlign: "right" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {profiles.map(p => (
                                        <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                                            <td style={{ padding: "1rem", fontWeight: 700 }}>{p.display_name || "Guest"}</td>
                                            <td style={{ padding: "1rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>{p.email || "—"}</td>
                                            <td style={{ padding: "1rem", textAlign: "center" }}>
                                                <button
                                                    onClick={() => toggleAdminStatus(p.id, p.is_admin)}
                                                    style={{
                                                        padding: "6px 12px", borderRadius: "20px", border: "1px solid var(--border)", cursor: "pointer", fontSize: "0.7rem", fontWeight: 800,
                                                        background: p.is_admin ? "rgba(230,57,80,0.1)" : "rgba(255,255,255,0.05)",
                                                        color: p.is_admin ? "var(--accent)" : "var(--text-muted)"
                                                    }}
                                                >
                                                    {p.is_admin ? "ADMIN" : "USER"}
                                                </button>
                                            </td>
                                            <td style={{ padding: "1rem", textAlign: "right" }}>
                                                <button
                                                    onClick={() => deleteProfile(p.id)}
                                                    disabled={p.id === user.id}
                                                    style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: p.id === user.id ? "not-allowed" : "pointer", fontSize: "0.75rem", fontWeight: 700 }}
                                                >
                                                    {p.id === user.id ? "" : "DELETE"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>

            {/* EDIT MODAL ANIME */}
            {editingAnime && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "2rem" }}>
                    <div style={{ width: "100%", maxWidth: "450px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "24px", padding: "2rem" }}>
                        <h3 style={{ margin: "0 0 1.5rem", fontSize: "1.2rem", fontWeight: 800 }}>Edit Anime Info</h3>
                        <form onSubmit={handleUpdateAnime} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                <label style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 800 }}>TITLE</label>
                                <input type="text" value={editingAnime.title} onChange={e => setEditingAnime({ ...editingAnime, title: e.target.value })} style={{ background: "#222", border: "1px solid var(--border)", borderRadius: "10px", padding: "0.75rem", color: "#fff" }} />
                            </div>
                            <div style={{ gridTemplateColumns: "1fr 1fr", display: "grid", gap: "1rem" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                    <label style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 800 }}>STATUS</label>
                                    <select value={editingAnime.status} onChange={e => setEditingAnime({ ...editingAnime, status: e.target.value })} style={{ background: "#222", border: "1px solid var(--border)", borderRadius: "10px", padding: "0.75rem", color: "#fff" }}>
                                        <option value="Ongoing">Ongoing</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                    <label style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 800 }}>RATING</label>
                                    <input type="text" value={editingAnime.rating || ""} onChange={e => setEditingAnime({ ...editingAnime, rating: e.target.value })} style={{ background: "#222", border: "1px solid var(--border)", borderRadius: "10px", padding: "0.75rem", color: "#fff" }} />
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                                <button type="submit" style={{ flex: 1, background: "var(--accent)", color: "#fff", border: "none", borderRadius: "10px", padding: "0.85rem", fontWeight: 800, cursor: "pointer" }}>Save Changes</button>
                                <button onClick={() => setEditingAnime(null)} type="button" style={{ flex: 1, background: "#333", color: "#fff", border: "none", borderRadius: "10px", padding: "0.85rem", fontWeight: 800, cursor: "pointer" }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
