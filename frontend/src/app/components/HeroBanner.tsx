"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

interface HeroAnime {
    slug: string;
    title: string;
    cover_url: string | null;
    description?: string | null;
    genres?: string[];
    badge?: string; // "Update Terbaru" | "Popular" | "Rekomendasi"
}

export default function HeroBanner({ slides }: { slides: HeroAnime[] }) {
    const [current, setCurrent] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [transitioning, setTransitioning] = useState(false);

    const goTo = useCallback((idx: number) => {
        if (idx === current || transitioning) return;
        setTransitioning(true);
        setTimeout(() => {
            setCurrent(idx);
            setTransitioning(false);
        }, 300);
    }, [current, transitioning]);

    const next = useCallback(() => {
        goTo((current + 1) % slides.length);
    }, [current, slides.length, goTo]);

    const prev = useCallback(() => {
        goTo((current - 1 + slides.length) % slides.length);
    }, [current, slides.length, goTo]);

    // Auto-play
    useEffect(() => {
        if (!isPlaying) return;
        const timer = setInterval(next, 6000);
        return () => clearInterval(timer);
    }, [isPlaying, next]);

    if (!slides || slides.length === 0) return null;

    const slide = slides[current];
    const displayGenres = (slide.genres ?? []).filter(g => g !== "Update Terbaru" && g !== "Popular").slice(0, 3);

    const badgeColors: Record<string, string> = {
        "Update Terbaru": "var(--accent)",
        "Popular": "#d97706",
        "Rekomendasi": "#7c3aed",
    };
    const badgeColor = badgeColors[slide.badge ?? ""] ?? "var(--accent)";

    return (
        <>
            <style>{`
            .hero-content-flex { display: flex; gap: 1.75rem; align-items: center; }
            .hero-text-box { max-width: 480px; min-width: 0; overflow: hidden; }
            .hero-title { color: #fff; font-size: clamp(1.3rem, 3vw, 1.9rem); font-weight: 900; margin: 0 0 0.6rem; line-height: 1.2; text-shadow: 0 2px 12px rgba(0,0,0,0.9); word-break: break-word; overflow-wrap: break-word; }
            .hero-desc { color: rgba(255,255,255,0.6); font-size: 0.83rem; line-height: 1.7; margin: 0 0 1.25rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
            .hero-poster { flex-shrink: 0; width: clamp(90px, 12vw, 150px); aspect-ratio: 2/3; border-radius: 10px; overflow: hidden; position: relative; border: 2px solid rgba(255,255,255,0.12); box-shadow: 0 8px 32px rgba(0,0,0,0.6); }
            @media (max-width: 480px) {
                .hero-title { font-size: clamp(1rem, 5vw, 1.4rem) !important; }
                .hero-desc { font-size: 0.75rem; -webkit-line-clamp: 2; }
                .hero-content-flex { gap: 0.9rem; }
                .hero-poster { width: clamp(75px, 22vw, 110px); }
                .hero-text-box { max-width: calc(100vw - clamp(75px, 22vw, 110px) - 4rem); }
            }
        `}</style>
            <div
                style={{ position: "relative", width: "100%", height: "clamp(340px, 50vw, 480px)", overflow: "hidden", marginBottom: "2.5rem" }}
                onMouseEnter={() => setIsPlaying(false)}
                onMouseLeave={() => setIsPlaying(true)}
            >
                {/* Background image */}
                {slide.cover_url && (
                    <Image
                        key={slide.slug}
                        src={slide.cover_url}
                        alt={slide.title}
                        fill
                        style={{
                            objectFit: "cover",
                            objectPosition: "center top",
                            filter: "blur(3px) brightness(0.35)",
                            transform: "scale(1.08)",
                            transition: "opacity 0.5s ease",
                            opacity: transitioning ? 0 : 1,
                        }}
                        unoptimized
                        priority
                    />
                )}

                {/* Gradient overlays */}
                <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to right, rgba(7,7,13,0.97) 30%, rgba(7,7,13,0.5) 65%, rgba(7,7,13,0.1) 100%)",
                }} />
                <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, height: "55%",
                    background: "linear-gradient(to top, rgba(7,7,13,1) 0%, transparent 100%)",
                }} />

                {/* Content */}
                <div style={{
                    position: "relative", zIndex: 10,
                    maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem",
                    height: "100%", display: "flex", alignItems: "center",
                    opacity: transitioning ? 0 : 1,
                    transition: "opacity 0.3s ease",
                }}>
                    <div className="hero-content-flex">
                        {/* Poster */}
                        <div className="hero-poster">
                            {slide.cover_url && (
                                <Image src={slide.cover_url} alt={slide.title} fill style={{ objectFit: "cover" }} unoptimized />
                            )}
                        </div>
                        {/* Text */}
                        <div className="hero-text-box">
                            <span style={{
                                background: badgeColor, color: "#fff",
                                fontSize: "0.58rem", fontWeight: 800, padding: "3px 10px",
                                borderRadius: "4px", letterSpacing: "0.12em", textTransform: "uppercase",
                                marginBottom: "0.75rem", display: "inline-block"
                            }}>{slide.badge ?? "Featured"}</span>

                            <h2 className="hero-title">{slide.title}</h2>

                            {displayGenres.length > 0 && (
                                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.8rem" }}>
                                    {displayGenres.map(g => (
                                        <span key={g} style={{
                                            background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)",
                                            fontSize: "0.62rem", fontWeight: 600, padding: "2px 8px", borderRadius: "4px"
                                        }}>{g}</span>
                                    ))}
                                </div>
                            )}

                            {slide.description && (
                                <p className="hero-desc">{slide.description}</p>
                            )}

                            <Link href={`/anime/${slide.slug}`} style={{
                                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                                background: "var(--accent)", color: "#fff",
                                padding: "0.6rem 1.4rem", borderRadius: "8px",
                                fontWeight: 800, fontSize: "0.85rem", textDecoration: "none",
                            }}>▶ Tonton Sekarang</Link>
                        </div>
                    </div>
                </div>

                {/* Arrow buttons */}
                <button
                    onClick={prev}
                    aria-label="Previous slide"
                    style={{
                        position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)",
                        zIndex: 20, background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.15)",
                        color: "#fff", borderRadius: "50%", width: "38px", height: "38px",
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1rem", transition: "background 0.2s"
                    }}
                >‹</button>
                <button
                    onClick={next}
                    aria-label="Next slide"
                    style={{
                        position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)",
                        zIndex: 20, background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.15)",
                        color: "#fff", borderRadius: "50%", width: "38px", height: "38px",
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1rem", transition: "background 0.2s"
                    }}
                >›</button>

                {/* Dot indicators */}
                <div style={{
                    position: "absolute", bottom: "1.25rem", left: "50%", transform: "translateX(-50%)",
                    zIndex: 20, display: "flex", gap: "7px", alignItems: "center"
                }}>
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            aria-label={`Go to slide ${i + 1}`}
                            style={{
                                width: i === current ? "22px" : "7px",
                                height: "7px",
                                borderRadius: "4px",
                                background: i === current ? "var(--accent)" : "rgba(255,255,255,0.35)",
                                border: "none", cursor: "pointer",
                                transition: "all 0.3s ease",
                                padding: 0,
                            }}
                        />
                    ))}
                </div>

                {/* Progress bar */}
                {isPlaying && (
                    <div style={{
                        position: "absolute", bottom: 0, left: 0, height: "3px",
                        background: "var(--accent)", zIndex: 20,
                        animation: "progress-bar 6s linear infinite",
                        transformOrigin: "left"
                    }} />
                )}
            </div>
        </>
    );
}
