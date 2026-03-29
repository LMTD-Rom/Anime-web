"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function GuestNotif() {
    const [visible, setVisible] = useState(false);
    const [exiting, setExiting] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // Check if logged in
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            if (!data.user) {
                setExiting(false);
                // Delay slightly so it doesn't flash on first paint
                const t = setTimeout(() => setVisible(true), 900);
                return () => clearTimeout(t);
            }
        });

        // Auto-hide if user logs in
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
            if (session?.user) dismiss();
        });
        return () => subscription.unsubscribe();
    }, [pathname]); // Re-run on every route change

    const dismiss = () => {
        setExiting(true);
        setTimeout(() => setVisible(false), 350);
    };

    if (!visible) return null;

    return (
        <>
            <style>{`
                @keyframes slideDown {
                    from { transform: translateY(-100%); opacity: 0; }
                    to   { transform: translateY(0);    opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(0);    opacity: 1; }
                    to   { transform: translateY(-100%); opacity: 0; }
                }
                .guest-notif {
                    animation: slideDown 0.35s cubic-bezier(0.34, 1.2, 0.64, 1) forwards;
                }
                .guest-notif.exit {
                    animation: slideUp 0.3s ease forwards;
                }
            `}</style>
            <div
                className={`guest-notif${exiting ? " exit" : ""}`}
                style={{
                    position: "fixed",
                    top: "72px",
                    left: "4vw",
                    right: "4vw",
                    margin: "0 auto",
                    zIndex: 9000,
                    width: "min(92vw, 480px)",
                    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "12px",
                    padding: "0.85rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
                }}
            >
                {/* Icon */}
                <div style={{
                    flexShrink: 0, width: "36px", height: "36px",
                    borderRadius: "50%",
                    background: "rgba(251,191,36,0.12)",
                    border: "1px solid rgba(251,191,36,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1rem",
                }}>
                    ☁
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: "#fff", fontWeight: 700, fontSize: "0.82rem", margin: "0 0 2px" }}>
                        Mode Tamu
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.74rem", margin: 0, lineHeight: 1.4 }}>
                        Watchlist & riwayat nonton hanya tersimpan di perangkat ini.{" "}
                        <span
                            onClick={() => {
                                dismiss();
                                // Trigger Google login
                                const supabase = createClient();
                                supabase.auth.signInWithOAuth({
                                    provider: "google",
                                    options: { redirectTo: `${window.location.origin}/auth/callback` },
                                });
                            }}
                            style={{
                                color: "#fbbf24", fontWeight: 700, cursor: "pointer",
                                textDecoration: "underline", textUnderlineOffset: "2px",
                            }}
                        >
                            Login
                        </span>{" "}
                        biar tersimpan di semua perangkat.
                    </p>
                </div>

                {/* Close */}
                <button
                    onClick={dismiss}
                    style={{
                        flexShrink: 0, background: "transparent", border: "none",
                        color: "rgba(255,255,255,0.35)", cursor: "pointer",
                        fontSize: "1rem", padding: "4px", lineHeight: 1,
                        transition: "color 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
                    aria-label="Tutup"
                >
                    ✕
                </button>
            </div>
        </>
    );
}
