"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const LS_KEY = "sukinime_watchlist";

export interface WatchlistItem {
    slug: string;
    title: string;
    cover_url: string | null;
    genres: string[];
    episode_count: number;
    added_at: string;
}

export function useWatchlist() {
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [mounted, setMounted] = useState(false);

    // Helpers
    const lsGet = (): WatchlistItem[] => {
        try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]"); } catch { return []; }
    };
    const lsSet = (items: WatchlistItem[]) => {
        try { localStorage.setItem(LS_KEY, JSON.stringify(items)); } catch { /* */ }
    };

    // Load data — from DB if logged in, else localStorage
    const loadData = useCallback(async (u: User | null) => {
        if (u) {
            const supabase = createClient();
            const { data } = await supabase
                .from("user_watchlist")
                .select("*")
                .eq("user_id", u.id)
                .order("added_at", { ascending: false });
            if (data) {
                const items: WatchlistItem[] = data.map(r => ({
                    slug: r.slug,
                    title: r.title,
                    cover_url: r.cover_url,
                    genres: r.genres ?? [],
                    episode_count: r.episode_count ?? 0,
                    added_at: r.added_at,
                }));
                setWatchlist(items);

                // Merge any localStorage items that aren't in DB yet
                const local = lsGet();
                const dbSlugs = new Set(items.map(i => i.slug));
                const toMerge = local.filter(i => !dbSlugs.has(i.slug));
                if (toMerge.length > 0) {
                    await supabase.from("user_watchlist").upsert(
                        toMerge.map(i => ({ user_id: u.id, ...i })),
                        { onConflict: "user_id,slug" }
                    );
                    localStorage.removeItem(LS_KEY);
                    setWatchlist([...toMerge, ...items]);
                }
            }
        } else {
            setWatchlist(lsGet());
        }
    }, []);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
            loadData(data.user).finally(() => setMounted(true));
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
            const u = session?.user ?? null;
            setUser(u);
            loadData(u);
        });
        return () => subscription.unsubscribe();
    }, [loadData]);

    const add = useCallback(async (anime: Omit<WatchlistItem, "added_at">) => {
        const item: WatchlistItem = { ...anime, added_at: new Date().toISOString() };
        setWatchlist(prev => {
            if (prev.find(i => i.slug === anime.slug)) return prev;
            return [item, ...prev];
        });
        if (user) {
            const supabase = createClient();
            await supabase.from("user_watchlist").upsert(
                { user_id: user.id, ...item },
                { onConflict: "user_id,slug" }
            );
        } else {
            const next = [item, ...lsGet().filter(i => i.slug !== anime.slug)];
            lsSet(next);
        }
    }, [user]);

    const remove = useCallback(async (slug: string) => {
        setWatchlist(prev => prev.filter(i => i.slug !== slug));
        if (user) {
            const supabase = createClient();
            await supabase.from("user_watchlist")
                .delete()
                .eq("user_id", user.id)
                .eq("slug", slug);
        } else {
            lsSet(lsGet().filter(i => i.slug !== slug));
        }
    }, [user]);

    const isInWatchlist = useCallback((slug: string) => {
        return watchlist.some(i => i.slug === slug);
    }, [watchlist]);

    const toggle = useCallback((anime: Omit<WatchlistItem, "added_at">) => {
        if (isInWatchlist(anime.slug)) remove(anime.slug);
        else add(anime);
    }, [isInWatchlist, add, remove]);

    return { watchlist, add, remove, toggle, isInWatchlist, mounted, user };
}
