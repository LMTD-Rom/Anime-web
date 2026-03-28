"use client";
import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "sukinime_watchlist";

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
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) setWatchlist(JSON.parse(stored));
        } catch { }
    }, []);

    const save = useCallback((items: WatchlistItem[]) => {
        setWatchlist(items);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { }
    }, []);

    const add = useCallback((anime: Omit<WatchlistItem, "added_at">) => {
        setWatchlist(prev => {
            if (prev.find(i => i.slug === anime.slug)) return prev;
            const next = [{ ...anime, added_at: new Date().toISOString() }, ...prev];
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { }
            return next;
        });
    }, []);

    const remove = useCallback((slug: string) => {
        setWatchlist(prev => {
            const next = prev.filter(i => i.slug !== slug);
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { }
            return next;
        });
    }, []);

    const isInWatchlist = useCallback((slug: string) => {
        return watchlist.some(i => i.slug === slug);
    }, [watchlist]);

    const toggle = useCallback((anime: Omit<WatchlistItem, "added_at">) => {
        if (isInWatchlist(anime.slug)) remove(anime.slug);
        else add(anime);
    }, [isInWatchlist, add, remove]);

    return { watchlist, add, remove, toggle, isInWatchlist, mounted, save };
}
