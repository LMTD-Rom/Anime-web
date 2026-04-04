"use client";

const SAWERIA_URL = "https://saweria.co/SukiNime";


export default function SaweriaBanner() {
    return (
        <>
            <style>{`
        @keyframes sw-banner-border {
          0%,100% { border-color: rgba(230,57,80,0.25); }
          50%      { border-color: rgba(230,57,80,0.55); }
        }
        @keyframes sw-heart { 0%,100%{transform:scale(1)} 30%{transform:scale(1.3)} 60%{transform:scale(1.1)} }
        .sw-banner { animation: sw-banner-border 3s ease-in-out infinite; transition: transform 0.2s ease; }
        .sw-banner:hover { transform: translateY(-1px); }
        .sw-banner-cta { transition: filter 0.2s, transform 0.15s; }
        .sw-banner-cta:hover { filter: brightness(1.1); transform: scale(1.03); }
        .sw-heart { display:inline-block; animation: sw-heart 1.8s ease-in-out infinite; }
      `}</style>

            {/* Main banner */}
            <div
                className="sw-banner"
                style={{
                    background: "var(--surface)",
                    border: "1px solid rgba(230,57,80,0.25)",
                    borderRadius: "10px",
                    padding: "0.9rem 1.2rem",
                    marginTop: "1.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                    flexWrap: "wrap",
                }}
            >
                {/* Left */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{
                        width: "40px", height: "40px", borderRadius: "50%",
                        background: "var(--accent)", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                    }}>
                        {/* Coffee cup SVG */}
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 8h1a4 4 0 1 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" /><line x1="6" y1="2" x2="6" y2="4" /><line x1="10" y1="2" x2="10" y2="4" /><line x1="14" y1="2" x2="14" y2="4" />
                        </svg>
                    </div>
                    <div>
                        <p style={{ margin: 0, fontWeight: 800, fontSize: "0.88rem", color: "var(--text)" }}>
                            Benci iklan yang tiba-tiba pindah halaman?
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: "0.73rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                            Kami juga! Bantu Sukinime bayar server biar iklan itu bisa dihapus selamanya.
                        </p>
                    </div>
                </div>

                {/* CTA */}
                <a
                    href={SAWERIA_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sw-banner-cta"
                    style={{
                        display: "inline-flex", alignItems: "center", gap: "0.4rem",
                        background: "var(--accent)", color: "#fff",
                        fontWeight: 800, fontSize: "0.8rem",
                        padding: "0.55rem 1.2rem", borderRadius: "7px",
                        textDecoration: "none", whiteSpace: "nowrap",
                        letterSpacing: "0.02em",
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z" />
                    </svg>
                    <span>Dukung Sukinime Bebas Iklan</span>
                </a>
            </div>
        </>
    );
}
