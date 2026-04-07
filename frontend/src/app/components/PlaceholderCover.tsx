"use client";

export default function PlaceholderCover() {
    return (
        <div style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #0f0f1f 0%, #1a1a2e 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden"
        }}>
            {/* Watermark Logo/Text */}
            <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) rotate(-15deg)",
                fontSize: "3.5rem",
                fontWeight: 900,
                color: "rgba(230, 57, 80, 0.04)",
                whiteSpace: "nowrap",
                userSelect: "none",
                pointerEvents: "none",
                letterSpacing: "0.2em",
                zIndex: 1
            }}>
                SUKINIME
            </div>

            {/* Icon */}
            <div style={{
                zIndex: 2,
                color: "rgba(255,255,255,0.12)",
                marginBottom: "0.5rem"
            }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                </svg>
            </div>

            {/* Text */}
            <div style={{
                zIndex: 2,
                textAlign: "center",
                padding: "0 1rem"
            }}>
                <p style={{
                    margin: 0,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.25)",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase"
                }}>
                    No Cover
                </p>
                <div style={{
                    width: "20px",
                    height: "2px",
                    background: "var(--accent)",
                    margin: "6px auto 0",
                    opacity: 0.3,
                    borderRadius: "2px"
                }} />
            </div>
        </div>
    );
}
