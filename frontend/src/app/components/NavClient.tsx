"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const LINKS = [
    { href: "/", label: "Home" },
    { href: "/popular", label: "Popular" },
    { href: "/movie", label: "Movie" },
    { href: "/genres", label: "Genre" },
];

export default function NavClient() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setIsOpen(false);
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    // Close menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Prevent scrolling when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const overlay = isOpen && mounted ? createPortal(
        <div
            className="md:hidden"
            style={{
                position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: "rgba(0,0,0,0.6)",
                zIndex: 9999,
                backdropFilter: "blur(4px)"
            }}
            onClick={() => setIsOpen(false)}
        >
            <div
                style={{
                    position: "absolute",
                    top: 0, right: 0, bottom: 0,
                    width: "280px",
                    backgroundColor: "var(--surface)",
                    borderLeft: "1px solid var(--border)",
                    padding: "1.5rem",
                    display: "flex", flexDirection: "column", gap: "1.5rem",
                    animation: "slideIn 0.2s ease-out forwards"
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                    <button
                        onClick={() => setIsOpen(false)}
                        style={{ color: "var(--text-muted)", padding: "0.5rem" }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <div style={{ padding: "0 10px 10px", borderBottom: "1px solid var(--border)", marginBottom: "10px" }}>
                        <span style={{ fontWeight: 900, fontSize: "1.35rem", color: "#fff", letterSpacing: "-0.03em", marginRight: "6px" }}>Suki</span>
                        <span style={{ background: "var(--accent)", color: "#fff", fontWeight: 900, fontSize: "1rem", padding: "1px 7px", borderRadius: "4px" }}>nime</span>
                    </div>

                    <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px", marginBottom: "0.5rem" }}>
                        <input
                            type="text"
                            placeholder="Cari anime..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                flex: 1,
                                padding: "10px 14px",
                                borderRadius: "8px",
                                border: "1px solid var(--border)",
                                background: "var(--surface)",
                                color: "#fff",
                                fontSize: "0.95rem",
                                outline: "none",
                            }}
                        />
                        <button type="submit" style={{
                            padding: "0 14px",
                            background: "var(--accent)",
                            color: "#fff",
                            borderRadius: "8px",
                            fontWeight: 600,
                            display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </button>
                    </form>

                    {LINKS.map(({ href, label }) => {
                        const active = pathname === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                style={{
                                    padding: "12px 14px",
                                    borderRadius: "8px",
                                    fontSize: "1rem",
                                    fontWeight: active ? 700 : 500,
                                    color: active ? "#fff" : "var(--text-muted)",
                                    background: active ? "var(--accent-dim)" : "transparent",
                                    transition: "all 0.15s ease",
                                }}
                                onClick={() => setIsOpen(false)}
                            >
                                {label}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <>
            {/* DESKTOP NAV */}
            <div className="hidden md:flex" style={{ alignItems: "center", gap: "0.25rem" }}>
                {LINKS.map(({ href, label }) => {
                    const active = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            style={{
                                padding: "6px 14px",
                                borderRadius: "6px",
                                fontSize: "0.82rem",
                                fontWeight: active ? 700 : 500,
                                color: active ? "#fff" : "var(--text-muted)",
                                background: active ? "var(--accent-dim)" : "transparent",
                                border: active ? "1px solid var(--accent-glow)" : "1px solid transparent",
                                transition: "all 0.15s ease",
                                letterSpacing: "0.02em",
                            }}
                        >
                            {label}
                        </Link>
                    );
                })}

                <form onSubmit={handleSearch} style={{ display: "flex", alignItems: "center", marginLeft: "1rem" }}>
                    <div style={{ position: "relative" }}>
                        <input
                            type="text"
                            placeholder="Cari anime..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                padding: "6px 14px 6px 36px",
                                borderRadius: "6px",
                                border: "1px solid var(--border)",
                                background: "var(--surface)",
                                color: "#fff",
                                fontSize: "0.82rem",
                                outline: "none",
                                width: "200px",
                                transition: "all 0.2s ease"
                            }}
                            className="focus:border-[var(--accent)]"
                        />
                        <svg style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </div>
                </form>
            </div>

            {/* MOBILE HAMBURGER BUTTON */}
            <button
                className="md:hidden flex items-center justify-center"
                style={{ width: "40px", height: "40px", color: "#fff" }}
                onClick={() => setIsOpen(true)}
                aria-label="Open Menu"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            </button>

            {/* RENDER PORTAL */}
            {overlay}
        </>
    );
}
