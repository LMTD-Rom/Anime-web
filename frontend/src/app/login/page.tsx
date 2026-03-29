"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // If already logged in, redirect
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) router.replace("/profile");
            else setChecking(false);
        });
    }, [router]);

    const handleGoogleLogin = async () => {
        setLoading(true);
        const supabase = createClient();
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
    };

    if (checking) return null;

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            position: "relative",
            overflow: "hidden",
        }}>
            {/* Background glow effects */}
            <div style={{
                position: "absolute", width: "500px", height: "500px",
                borderRadius: "50%", top: "-100px", left: "-100px",
                background: "radial-gradient(circle, rgba(230,57,80,0.15) 0%, transparent 70%)",
                pointerEvents: "none",
            }} />
            <div style={{
                position: "absolute", width: "400px", height: "400px",
                borderRadius: "50%", bottom: "-100px", right: "-100px",
                background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)",
                pointerEvents: "none",
            }} />

            {/* Card */}
            <div style={{
                width: "min(92vw, 420px)",
                background: "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "24px",
                padding: "2.5rem 2rem",
                backdropFilter: "blur(20px)",
                boxShadow: "0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
                position: "relative",
                zIndex: 10,
            }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <div style={{ marginBottom: "1.25rem", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontWeight: 900, fontSize: "1.8rem", letterSpacing: "-0.03em", color: "#fff" }}>Suki</span>
                        <span style={{ background: "var(--accent)", color: "#fff", fontWeight: 900, fontSize: "1.4rem", padding: "2px 9px", borderRadius: "6px" }}>nime</span>
                    </div>
                    <h1 style={{ color: "#fff", fontSize: "1.25rem", fontWeight: 800, margin: "0 0 0.4rem" }}>
                        Selamat Datang
                    </h1>
                    <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.85rem", margin: 0, lineHeight: 1.5 }}>
                        Login untuk simpan watchlist & riwayat nonton di semua perangkat.
                    </p>
                </div>

                {/* Divider */}
                <div style={{ height: "1px", background: "rgba(255,255,255,0.08)", marginBottom: "2rem" }} />

                {/* Google Button */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    style={{
                        width: "100%",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem",
                        padding: "0.85rem 1.5rem",
                        background: loading ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        borderRadius: "12px",
                        color: "#fff", fontSize: "0.95rem", fontWeight: 700,
                        cursor: loading ? "not-allowed" : "pointer",
                        transition: "all 0.2s ease",
                        marginBottom: "1.25rem",
                    }}
                    onMouseEnter={e => {
                        if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.14)";
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
                    }}
                >
                    {loading ? (
                        <div style={{ width: "20px", height: "20px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                    )}
                    {loading ? "Mengalihkan..." : "Lanjutkan dengan Google"}
                </button>

                {/* Features */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {[
                        { icon: "☁", text: "Data tersinkron di semua perangkat" },
                        { icon: "♥", text: "Watchlist dan riwayat nonton tersimpan" },
                        { icon: "👤", text: "Profil dengan foto dan nama custom" },
                    ].map(f => (
                        <div key={f.text} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                            <span style={{ fontSize: "0.9rem", opacity: 0.7 }}>{f.icon}</span>
                            <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.78rem" }}>{f.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
