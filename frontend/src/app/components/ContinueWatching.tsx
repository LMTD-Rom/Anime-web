"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const LS_KEY = "sukinime_continue";

interface WatchEntry {
    episodeId: string;
    animeSlug: string;
    animeTitle: string;
    coverUrl: string | null;
    episodeNo: number;
    watchedAt: number;
}

function lsGet(): WatchEntry[] {
    try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]"); } catch { return []; }
}

export default function ContinueWatching() {
    const [history, setHistory] = useState<WatchEntry[]>([]);
    const [user, setUser] = useState<User | null>(null);

    const loadFromDB = useCallback(async (u: User) => {
        const supabase = createClient();
        const { data } = await supabase
            .from("watch_history")
            .select("*")
            .eq("user_id", u.id)
            .order("watched_at", { ascending: false })
            .limit(12);
        if (data) {
            const items: WatchEntry[] = data.map(r => ({
                episodeId: r.episode_id,
                animeSlug: r.anime_slug,
                animeTitle: r.anime_title,
                coverUrl: r.cover_url,
                episodeNo: r.episode_no,
                watchedAt: new Date(r.watched_at).getTime(),
            }));
            setHistory(items);

            // Merge localStorage items to DB
            const local = lsGet();
            const dbIds = new Set(items.map(i => i.episodeId));
            const toMerge = local.filter(i => !dbIds.has(i.episodeId));
            if (toMerge.length > 0) {
                await supabase.from("watch_history").upsert(
                    toMerge.map(i => ({
                        user_id: u.id,
                        episode_id: i.episodeId,
                        anime_slug: i.animeSlug,
                        anime_title: i.animeTitle,
                        cover_url: i.coverUrl,
                        episode_no: i.episodeNo,
                        watched_at: new Date(i.watchedAt).toISOString(),
                    })),
                    { onConflict: "user_id,episode_id" }
                );
                localStorage.removeItem(LS_KEY);
                // Merge into UI, sorted by watchedAt desc
                const merged = [...toMerge, ...items]
                    .sort((a, b) => b.watchedAt - a.watchedAt)
                    .slice(0, 12);
                setHistory(merged);
            }
        }
    }, []);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            const u = data.user;
            setUser(u);
            if (u) {
                loadFromDB(u);
            } else {
                setHistory(lsGet());
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
            const u = session?.user ?? null;
            setUser(u);
            if (u) loadFromDB(u);
            else setHistory(lsGet());
        });
        return () => subscription.unsubscribe();
    }, [loadFromDB]);

    const remove = useCallback(async (episodeId: string) => {
        const updated = history.filter(e => e.episodeId !== episodeId);
        setHistory(updated);
        if (user) {
            const supabase = createClient();
            await supabase.from("watch_history")
                .delete()
                .eq("user_id", user.id)
                .eq("episode_id", episodeId);
        } else {
            localStorage.setItem(LS_KEY, JSON.stringify(updated));
        }
    }, [history, user]);

    if (history.length === 0) return null;

    return (
        <section style={{ marginBottom: "2.5rem" }}>
            <div className="section-label" style={{ marginBottom: "1.25rem" }}>
                <span>Lanjut Nonton</span>
                {user && (
                    <span style={{ marginLeft: "auto", fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 500, textTransform: "none" }}>
                        ☁ Tersimpan di akun
                    </span>
                )}
            </div>
            <div style={{ display: "flex", gap: "0.75rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
                {history.map(entry => (
                    <div key={entry.episodeId} style={{ flexShrink: 0, width: "120px", position: "relative" }}>
                        <button
                            onClick={() => remove(entry.episodeId)}
                            title="Hapus"
                            style={{
                                position: "absolute", top: "4px", right: "4px", zIndex: 10,
                                width: "20px", height: "20px", borderRadius: "50%",
                                background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.15)",
                                color: "#aaa", cursor: "pointer", fontSize: "0.65rem",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                        >✕</button>

                        <Link href={`/watch/${entry.episodeId}`} style={{ textDecoration: "none" }}>
                            <div style={{
                                width: "120px", height: "160px", borderRadius: "8px",
                                overflow: "hidden", position: "relative",
                                background: "var(--surface2)", border: "1px solid var(--border)",
                                marginBottom: "0.4rem",
                            }}>
                                {entry.coverUrl ? (
                                    <Image src={entry.coverUrl} alt={entry.animeTitle} fill style={{ objectFit: "cover" }} unoptimized />
                                ) : (
                                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-dim)", fontSize: "2rem" }}>🎬</div>
                                )}
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
