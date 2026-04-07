"use client";
import React from "react";

export default function MaintenancePage() {
    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--bg)",
            color: "var(--text)",
            textAlign: "center",
            padding: "2rem",
            position: "relative",
            overflow: "hidden",
        }}>
            {/* Background elements to match Sukinime theme */}
            <div style={{
                position: "absolute", width: "600px", height: "600px",
                borderRadius: "50%", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                background: "radial-gradient(circle, rgba(230,57,80,0.08) 0%, transparent 70%)",
                pointerEvents: "none",
            }} />

            <div style={{
                zIndex: 10,
                background: "rgba(15, 15, 26, 0.4)",
                padding: "3rem",
                borderRadius: "32px",
                border: "1px solid var(--border)",
                backdropFilter: "blur(20px)",
                maxWidth: "500px"
            }}>
                <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>🚧</div>
                <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "1rem", letterSpacing: "-0.02em" }}>
                    Sukinime Lagi <span style={{ color: "var(--accent)" }}>Maintenance</span>
                </h1>
                <p style={{ color: "var(--text-muted)", lineHeight: "1.6", marginBottom: "2rem" }}>
                    Halo bro! Kita lagi update database atau beresin fitur-fitur baru nih biar pengalaman nonton lu makin premium. Sabar ya, kita bakal balik lagi secepatnya!
                </p>
                <div style={{ display: "inline-flex", gap: "12px", alignItems: "center", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent)", animation: "pulse 1.5s infinite" }} />
                    ESTIMASI: SEGERA
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 0.5; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
