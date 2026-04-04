"use client";

const SAWERIA_URL = "https://saweria.co/SukiNime";
const MILESTONE_URL = "https://saweria.co/widgets/milestone?streamKey=d278d0f9750915182e1d2eb6e09663f6";

export default function SaweriaSupport() {
    return (
        <div style={{ marginTop: "1.5rem", marginBottom: "1.5rem" }}>
            <style>{`
                .sw-support-card {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-left: 4px solid var(--accent);
                    border-radius: 8px;
                    padding: 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    transition: border-color 0.2s ease;
                }
                .sw-support-card:hover { border-color: rgba(230,57,80,0.3); }
                
                .sw-btn-main {
                    background: var(--accent);
                    color: #fff;
                    padding: 0.6rem 1rem;
                    border-radius: 6px;
                    font-weight: 800;
                    font-size: 0.8rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    text-decoration: none;
                    transition: filter 0.2s, transform 0.1s;
                }
                .sw-btn-main:hover { filter: brightness(1.1); transform: scale(1.02); }
                .sw-btn-main:active { transform: scale(0.98); }

                .sw-btn-sub {
                    background: var(--surface2);
                    border: 1px solid var(--border);
                    color: var(--text-muted);
                    padding: 0.6rem 1rem;
                    border-radius: 6px;
                    font-weight: 700;
                    font-size: 0.75rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    text-decoration: none;
                    transition: all 0.2s;
                }
                .sw-btn-sub:hover { border-color: var(--accent); color: var(--accent); }

                @media (min-width: 768px) {
                    .sw-support-content {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 2rem;
                    }
                    .sw-support-actions {
                        display: flex;
                        gap: 0.75rem;
                        flex-shrink: 0;
                    }
                }
            `}</style>

            <div className="sw-support-card">
                <div className="sw-support-content">
                    {/* Left: Teks persuasif */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                        <div style={{
                            width: "36px", height: "36px", borderRadius: "50%",
                            background: "rgba(230,57,80,0.1)", display: "flex",
                            alignItems: "center", justifyContent: "center",
                            color: "var(--accent)", flexShrink: 0, marginTop: "2px"
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 8h1a4 4 0 1 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" /><line x1="6" y1="2" x2="6" y2="4" /><line x1="10" y1="2" x2="10" y2="4" /><line x1="14" y1="2" x2="14" y2="4" />
                            </svg>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: 800, fontSize: "0.85rem", color: "var(--text)", lineHeight: 1.4 }}>
                                Benci iklan yang tiba-tiba pindah halaman? <span style={{ color: "var(--accent)" }}>Kami juga!</span>
                            </p>
                            <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                                Bantu Sukinime bayar server biar iklan itu bisa dihapus selamanya. Dukunganmu sangat berarti.
                            </p>
                        </div>
                    </div>

                    {/* Right: Buttons */}
                    <div className="sw-support-actions" style={{ marginTop: "0.5rem" }}>
                        <a href={SAWERIA_URL} target="_blank" rel="noopener noreferrer" className="sw-btn-main" style={{ flex: 1 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z" />
                            </svg>
                            <span>Dukung Sukinime</span>
                        </a>
                        <a href={MILESTONE_URL} target="_blank" rel="noopener noreferrer" className="sw-btn-sub" style={{ flex: 1 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
                            </svg>
                            <span>Milestone</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
