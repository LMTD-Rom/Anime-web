"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SystemNotif() {
    const [visible, setVisible] = useState(false);
    const [exiting, setExiting] = useState(false);
    const [message, setMessage] = useState("");
    const [notifId, setNotifId] = useState("");

    const supabase = createClient();

    useEffect(() => {
        const fetchSystemNotif = async () => {
            const { data } = await supabase.from("site_settings").select("value").eq("key", "system_notification").single();
            if (data?.value) {
                try {
                    const parsed = JSON.parse(data.value);
                    if (parsed.message && parsed.expires_at && parsed.id) {
                        const now = Date.now();
                        // Check if expired
                        if (now > parsed.expires_at) return;
                        
                        // Check if dismissed
                        const dismissed = localStorage.getItem("closed_notif_" + parsed.id);
                        if (dismissed) return;

                        // Valid & Not Dismissed
                        setMessage(parsed.message);
                        setNotifId(parsed.id);
                        
                        // Delay slighty for aesthetics
                        setTimeout(() => {
                            setVisible(true);
                            // Auto dismiss after 10 seconds
                            setTimeout(() => {
                                dismiss(parsed.id);
                            }, 10000);
                        }, 600);
                    }
                } catch (e) {
                    console.error("Failed to parse system notification.");
                }
            }
        };

        fetchSystemNotif();
    }, []);

    const dismiss = (idToDismiss: string) => {
        if (!idToDismiss) return;
        localStorage.setItem("closed_notif_" + idToDismiss, "true");
        setExiting(true);
        setTimeout(() => setVisible(false), 350);
    };

    if (!visible) return null;

    return (
        <>
            <style>{`
                @keyframes slideLeftIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to   { transform: translateX(0);    opacity: 1; }
                }
                @keyframes slideRightOut {
                    from { transform: translateX(0);    opacity: 1; }
                    to   { transform: translateX(100%); opacity: 0; }
                }
                .system-notif {
                    animation: slideLeftIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
                .system-notif.exit {
                    animation: slideRightOut 0.3s ease-in forwards;
                }
            `}</style>
            <div
                className={`system-notif${exiting ? " exit" : ""}`}
                style={{
                    position: "fixed",
                    top: "24px",
                    right: "4vw",
                    zIndex: 9999,
                    width: "min(92vw, 400px)",
                    background: "rgba(10, 10, 20, 0.95)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px solid rgba(230, 57, 80, 0.3)",
                    borderLeft: "4px solid #e63950",
                    borderRadius: "12px",
                    padding: "1rem 1.2rem",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.02)",
                }}
            >
                {/* Icon */}
                <div style={{
                    flexShrink: 0,
                    width: "28px", height: "28px",
                    borderRadius: "50%",
                    background: "rgba(230, 57, 80, 0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#e63950", fontSize: "1.1rem", border: "1px solid rgba(230,57,80,0.4)"
                }}>
                    !
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0, paddingTop: "2px" }}>
                    <p style={{ color: "#fff", fontWeight: 800, fontSize: "0.85rem", margin: "0 0 4px", letterSpacing: "0.02em" }}>
                        Pesan Sistem
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.78rem", margin: 0, lineHeight: 1.5, wordWrap: "break-word" }}>
                        {message}
                    </p>
                </div>

                {/* Close */}
                <button
                    onClick={() => dismiss(notifId)}
                    style={{
                        flexShrink: 0, background: "transparent", border: "none",
                        color: "rgba(255,255,255,0.4)", cursor: "pointer",
                        fontSize: "1.2rem", padding: "0 4px", lineHeight: 1,
                        transition: "color 0.2s, transform 0.2s",
                        marginTop: "2px"
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.color = "#fff";
                        e.currentTarget.style.transform = "scale(1.1)";
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.color = "rgba(255,255,255,0.4)";
                        e.currentTarget.style.transform = "scale(1)";
                    }}
                    aria-label="Tutup pesan"
                >
                    &times;
                </button>
            </div>
        </>
    );
}
