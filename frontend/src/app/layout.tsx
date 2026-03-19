import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import NavClient from "./components/NavClient";

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

        {/* Page content (offset for fixed nav) */}
        <div className="page-content">
          {children}
        </div>

        {/* ═══ FOOTER ═══ */}
        <footer style={{
          marginTop: "4rem",
          padding: "2rem 1.5rem",
          borderTop: "1px solid var(--border)",
          textAlign: "center",
          color: "var(--text-dim)",
          fontSize: "0.75rem",
        }}>
          © 2026 Sukinime · Streaming Anime Sub Indonesia
        </footer>
      </body>
    </html>
  );
}
