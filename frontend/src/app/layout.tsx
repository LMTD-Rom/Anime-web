import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import NavClient from "./components/NavClient";
import GuestNotif from "./components/GuestNotif";
import SaweriaFloat from "./components/SaweriaFloat";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Sukinime — Stream Anime Sub Indo",
  description: "Nonton streaming anime subtitle Indonesia terlengkap, gratis.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        {/* ═══ NAVIGATION ═══ */}
        <nav style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          height: "var(--nav-h)",
          background: "rgba(7,7,13,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
        }}>
          <div style={{
            maxWidth: "1280px", margin: "0 auto",
            height: "100%",
            padding: "0 1.5rem",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            {/* Logo */}
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{
                fontWeight: 900, fontSize: "1.35rem", letterSpacing: "-0.03em",
                color: "#fff",
              }}>
                Suki
              </span>
              <span style={{
                background: "var(--accent)",
                color: "#fff",
                fontWeight: 900,
                fontSize: "1rem",
                padding: "1px 7px",
                borderRadius: "4px",
                letterSpacing: "0",
              }}>nime</span>
            </Link>

            {/* Nav links */}
            <NavClient />
          </div>
        </nav>

        {/* Guest notification toast */}
        <GuestNotif />

        {/* Page content (offset for fixed nav) */}
        <div className="page-content">
          {children}
        </div>

        {/* ═══ FOOTER ═══ */}
        <footer style={{
          marginTop: "4rem",
          borderTop: "1px solid var(--border)",
          background: "linear-gradient(180deg, rgba(7,7,13,0) 0%, rgba(7,7,13,0.98) 100%)",
        }}>
          {/* Main footer content */}
          <div style={{
            maxWidth: "1280px", margin: "0 auto",
            padding: "3.5rem 1.5rem 2.5rem",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem",
          }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontWeight: 900, fontSize: "1.5rem", letterSpacing: "-0.03em", color: "#fff" }}>Suki</span>
              <span style={{
                background: "var(--accent)", color: "#fff", fontWeight: 900,
                fontSize: "1.1rem", padding: "1px 8px", borderRadius: "4px",
              }}>nime</span>
            </div>

            {/* Divider */}
            <div style={{ width: "48px", height: "2px", background: "var(--accent)", borderRadius: "2px", opacity: 0.7 }} />

            {/* About Us */}
            <div style={{ textAlign: "center", maxWidth: "480px" }}>
              <p style={{
                fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em",
                textTransform: "uppercase", color: "var(--accent)", marginBottom: "0.75rem",
              }}>About Us</p>
              <p style={{
                color: "rgba(255,255,255,0.55)", fontSize: "0.88rem",
                lineHeight: 1.8, margin: 0,
              }}>
                Sukinime adalah platform streaming anime subtitle Indonesia — gratis, cepat, dan terus diperbarui. Dari judul terbaru hingga koleksi klasik, semua tersedia di satu tempat.
              </p>
            </div>

            {/* Social */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem" }}>
              <p style={{
                fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: 0,
              }}>Ikuti Kami</p>
              <a
                href="https://www.instagram.com/khasbi_for.one"
                target="_blank"
                rel="noopener noreferrer"
                className="ig-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                @khasbi_for.one
              </a>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "1rem 1.5rem",
            textAlign: "center",
            color: "rgba(255,255,255,0.22)",
            fontSize: "0.72rem",
          }}>
            © 2026 Sukinime · Streaming Anime Sub Indonesia · All Rights Reserved
          </div>
        </footer>

        {/* ═══ SAWERIA FLOATING DONATION ═══ */}
        <SaweriaFloat />

        {/* ═══ IKLAN: ADSTERRA POP-UNDER ═══ */}
        {/* Memakai lazyOnload agar script iklan tidak menghalangi kecepatan web untuk user */}
        <Script
          src="https://pl28959331.profitablecpmratenetwork.com/9b/c8/cb/9bc8cbaa877c6c32dc86b9d53d57691e.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
