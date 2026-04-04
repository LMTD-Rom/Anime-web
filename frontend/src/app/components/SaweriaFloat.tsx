"use client";

import { useState, useEffect } from "react";

const SAWERIA_URL = "https://saweria.co/SukiNime";
const REAPPEAR_MS = 5 * 60 * 1000;

export default function SaweriaFloat() {
    const [visible, setVisible] = useState(false);
    const [show, setShow] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => {
            setVisible(true);
            setTimeout(() => setShow(true), 30);
        }, 3000);
        return () => clearTimeout(t);
    }, []);

    const handleClose = () => {
        setShow(false);
        setTimeout(() => {
            setVisible(false);
            setTimeout(() => {
                setVisible(true);
                setTimeout(() => setShow(true), 30);
            }, REAPPEAR_MS);
        }, 380);
    };

    if (!visible) return null;

    return (
        <>
            <style>{`
        @keyframes sw-slide-in  { from { opacity:0; transform:translateX(110px); } to { opacity:1; transform:translateX(0); } }
        @keyframes sw-slide-out { from { opacity:1; transform:translateX(0); }     to { opacity:0; transform:translateX(110px); } }
        @keyframes sw-coffee   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes sw-pulse-btn{
          0%,100%{box-shadow:0 0 0 0 rgba(230,57,80,0.45);}
          50%    {box-shadow:0 0 0 8px rgba(230,57,80,0);}
        }
        .sw-float { animation: sw-slide-in 0.45s cubic-bezier(.22,1,.36,1) forwards; }
        .sw-float.out { animation: sw-slide-out 0.35s ease-in forwards; }
        .sw-coffee { animation: sw-coffee 2.2s ease-in-out infinite; }
        .sw-main-btn { animation: sw-pulse-btn 2.4s ease-in-out infinite; }
        .sw-close-btn:hover { color: var(--text) !important; }
        .sw-main-btn:hover { filter: brightness(1.1); }
      `}</style>

            <div
                className={`sw-float${!show ? " out" : ""}`}
                style={{
                    position: "fixed",
                    bottom: "1.5rem",
                    right: "1.5rem",
                    zIndex: 9999,
                }}
            >
                <div
                    style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border-hover)",
                        borderRadius: "14px",
                        padding: "1.1rem 1.2rem 1rem",
                        maxWidth: "230px",
                        boxShadow: "0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(230,57,80,0.15)",
                        position: "relative",
                    }}
                >
                    {/* Red accent top strip */}
                    <div style={{
                        position: "absolute", top: 0, left: "1.2rem", right: "1.2rem",
                        height: "2px", background: "var(--accent)",
                        borderRadius: "0 0 2px 2px", opacity: 0.8,
                    }} />

                    {/* Close */}
                    <button
                        onClick={handleClose}
                        className="sw-close-btn"
                        style={{
                            position: "absolute", top: "0.65rem", right: "0.7rem",
                            background: "none", border: "none",
                            color: "var(--text-muted)", cursor: "pointer",
                            padding: "4px", borderRadius: "50%",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all 0.15s",
                        }}
                        title="Tutup"
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>

                    {/* Icon + headline */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem", paddingRight: "1rem" }}>
                        <svg className="sw-coffee" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <path d="M17 8h1a4 4 0 1 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" /><line x1="6" y1="2" x2="6" y2="4" /><line x1="10" y1="2" x2="10" y2="4" /><line x1="14" y1="2" x2="14" y2="4" />
                        </svg>
                        <div>
                            <p style={{ margin: 0, fontWeight: 800, fontSize: "0.82rem", color: "var(--text)", lineHeight: 1.3 }}>
                                Sukinime Butuh Dukungan Kamu!
                            </p>
                            <p style={{ margin: "3px 0 0", fontSize: "0.67rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                                Kami ingin hapus iklan pindah halaman, tapi butuh biaya server 😢
                            </p>
                        </div>
                    </div>

                    {/* CTA */}
                    <a
                        href={SAWERIA_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sw-main-btn"
                        style={{
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem",
                            background: "var(--accent)",
                            color: "#fff", fontWeight: 800, fontSize: "0.8rem",
                            padding: "0.55rem 1rem", borderRadius: "8px",
                            textDecoration: "none", width: "100%", boxSizing: "border-box",
                            letterSpacing: "0.02em",
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z" />
                        </svg>
                        <span>Dukung via Saweria</span>
                    </a>

                    <p style={{ margin: "0.5rem 0 0", fontSize: "0.6rem", color: "var(--text-dim)", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                        Donasimu = iklan ganggu berkurang!
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.8 }}>
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z" />
                        </svg>
                    </p>
                </div>
            </div>
        </>
    );
}
