"use client";
import { useState, useEffect } from "react";

export default function ThemeToggle() {
    const [dark, setDark] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem("sukinime_theme");
        const isDark = saved !== "light";
        setDark(isDark);
        applyTheme(isDark);
    }, []);

    function applyTheme(isDark: boolean) {
        const root = document.documentElement;
        if (isDark) {
            root.style.setProperty("--bg", "#07070d");
            root.style.setProperty("--surface", "#0f0f1a");
            root.style.setProperty("--surface2", "#161625");
            root.style.setProperty("--border", "rgba(255,255,255,0.07)");
            root.style.setProperty("--border-hover", "rgba(255,255,255,0.15)");
            root.style.setProperty("--text", "#f0f0f8");
            root.style.setProperty("--text-muted", "#7a7a9a");
            root.style.setProperty("--text-dim", "#3a3a55");
        } else {
            root.style.setProperty("--bg", "#f4f4f8");
            root.style.setProperty("--surface", "#ffffff");
            root.style.setProperty("--surface2", "#eaeaf2");
            root.style.setProperty("--border", "rgba(0,0,0,0.1)");
            root.style.setProperty("--border-hover", "rgba(0,0,0,0.2)");
            root.style.setProperty("--text", "#111120");
            root.style.setProperty("--text-muted", "#555570");
            root.style.setProperty("--text-dim", "#aaaacc");
        }
    }

    const toggle = () => {
        const next = !dark;
        setDark(next);
        applyTheme(next);
        localStorage.setItem("sukinime_theme", next ? "dark" : "light");
    };

    if (!mounted) return <div style={{ width: "36px" }} />;

    return (
        <button
            id="theme-toggle-btn"
            onClick={toggle}
            title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            style={{
                width: "36px", height: "36px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "var(--surface2)",
                color: "var(--text-muted)",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1rem",
                transition: "all 0.2s ease",
            }}
        >
            {dark ? "☀️" : "🌙"}
        </button>
    );
}
