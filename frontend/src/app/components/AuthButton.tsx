"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import Image from "next/image";

export default function AuthButton() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
            setLoading(false);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleLogin = async () => {
        const supabase = createClient();
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
    };

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        setMenuOpen(false);
    };

    if (loading) return <div style={{ width: "32px", height: "32px" }} />;

    if (!user) {
        return (
            <button
                onClick={handleLogin}
                style={{
                    display: "inline-flex", alignItems: "center", gap: "0.4rem",
                    padding: "5px 14px", borderRadius: "6px",
                    background: "var(--accent)", color: "#fff",
                    fontWeight: 700, fontSize: "0.8rem",
                    border: "none", cursor: "pointer",
                    transition: "opacity 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                </svg>
                Login
            </button>
        );
    }

    const avatar = user.user_metadata?.avatar_url;
    const name = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User";

    return (
        <div style={{ position: "relative" }}>
            <button
                onClick={() => setMenuOpen(o => !o)}
                style={{
                    display: "inline-flex", alignItems: "center", gap: "0.5rem",
                    background: "transparent", border: "1px solid var(--border)",
                    borderRadius: "20px", padding: "3px 10px 3px 3px",
                    cursor: "pointer", color: "var(--text)", transition: "border-color 0.15s",
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-hover)")}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)")}
            >
                {avatar ? (
                    <Image
                        src={avatar} alt={name} width={26} height={26}
                        style={{ borderRadius: "50%", objectFit: "cover" }}
                        unoptimized
                    />
                ) : (
                    <div style={{
                        width: "26px", height: "26px", borderRadius: "50%",
                        background: "var(--accent)", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        color: "#fff", fontWeight: 800, fontSize: "0.75rem",
                    }}>
                        {name[0].toUpperCase()}
                    </div>
                )}
                <span style={{ fontSize: "0.78rem", fontWeight: 600, maxWidth: "80px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {name.split(" ")[0]}
                </span>
                <svg width="10" height="10" viewBox="0 0 10 6" fill="none" style={{ opacity: 0.5, transform: menuOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </button>

            {menuOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        style={{ position: "fixed", inset: 0, zIndex: 49 }}
                        onClick={() => setMenuOpen(false)}
                    />
                    {/* Dropdown */}
                    <div style={{
                        position: "absolute", top: "calc(100% + 8px)", right: 0,
                        minWidth: "180px", zIndex: 50,
                        background: "var(--surface)", border: "1px solid var(--border)",
                        borderRadius: "10px", padding: "0.5rem",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                        animation: "fadeIn 0.15s ease",
                    }}>
                        <div style={{ padding: "0.5rem 0.75rem 0.75rem", borderBottom: "1px solid var(--border)", marginBottom: "0.4rem" }}>
                            <p style={{ color: "var(--text)", fontWeight: 700, fontSize: "0.85rem", margin: "0 0 2px" }}>{name}</p>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.72rem", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            style={{
                                width: "100%", padding: "0.5rem 0.75rem",
                                background: "transparent", border: "none",
                                color: "var(--text-muted)", fontSize: "0.82rem",
                                fontWeight: 600, cursor: "pointer", textAlign: "left",
                                borderRadius: "6px", display: "flex", alignItems: "center", gap: "0.5rem",
                                transition: "background 0.15s, color 0.15s",
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = "rgba(230,57,80,0.1)";
                                (e.currentTarget as HTMLButtonElement).style.color = "var(--accent)";
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </>
            )}

            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
}
