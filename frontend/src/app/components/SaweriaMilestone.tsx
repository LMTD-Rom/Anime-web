"use client";

const MILESTONE_URL =
    "https://saweria.co/widgets/milestone?streamKey=d278d0f9750915182e1d2eb6e09663f6";

export default function SaweriaMilestone() {
    return (
        <>
            <style>{`
        @keyframes sw-ms-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(230,57,80,0); }
          50%      { box-shadow: 0 0 14px 3px rgba(230,57,80,0.25); }
        }
        .sw-ms-btn {
          animation: sw-ms-pulse 3s ease-in-out infinite;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
        }
        .sw-ms-btn:hover {
          background: rgba(230,57,80,0.12) !important;
          border-color: var(--accent) !important;
          color: var(--accent) !important;
          transform: translateY(-1px);
        }
      `}</style>

            <a
                href={MILESTONE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="sw-ms-btn"
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.75rem",
                    marginTop: "1rem",
                    padding: "0.75rem 1.1rem",
                    background: "var(--surface2)",
                    border: "1px solid rgba(230,57,80,0.3)",
                    borderRadius: "10px",
                    color: "var(--text-muted)",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    textDecoration: "none",
                    letterSpacing: "0.01em",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    {/* Target icon */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
                    </svg>
                    <div>
                        <p style={{ margin: 0, color: "var(--text)", fontWeight: 800, fontSize: "0.8rem" }}>
                            Milestone Sukinime Bebas Iklan
                        </p>
                        <p style={{ margin: "1px 0 0", fontSize: "0.66rem", color: "var(--text-muted)", fontWeight: 600 }}>
                            Klik untuk lihat progress donasi
                        </p>
                    </div>
                </div>
                {/* External link arrow */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4, flexShrink: 0 }}>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                </svg>
            </a>
        </>
    );
}
