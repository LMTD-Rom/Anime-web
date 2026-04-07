"use client";
import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            background: "var(--bg)",
            position: "relative",
            overflow: "hidden",
        }}>
            <div style={{
                position: "absolute", width: "500px", height: "500px",
                borderRadius: "50%", top: "-100px", left: "-100px",
                background: "radial-gradient(circle, rgba(230,57,80,0.1) 0%, transparent 70%)",
                pointerEvents: "none",
            }} />

            <div style={{
                width: "min(92vw, 400px)",
                background: "rgba(15, 15, 26, 0.8)",
                border: "1px solid var(--border)",
                borderRadius: "24px",
                padding: "2.5rem 2rem",
                backdropFilter: "blur(20px)",
                boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
                zIndex: 10,
            }}>
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <div style={{ marginBottom: "1rem", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontWeight: 900, fontSize: "1.5rem", color: "#fff" }}>Sukinime</span>
                        <span style={{ background: "var(--accent)", color: "#fff", fontWeight: 800, fontSize: "1.1rem", padding: "1px 6px", borderRadius: "4px" }}>DEV</span>
                    </div>
                    <h1 style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 700, margin: "0" }}>Admin Dashboard</h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>Login khusus pengembang Sukinime</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>EMAIL</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid var(--border)",
                                borderRadius: "8px",
                                padding: "0.75rem",
                                color: "#fff",
                                fontSize: "0.9rem",
                            }}
                        />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>PASSWORD</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid var(--border)",
                                borderRadius: "8px",
                                padding: "0.75rem",
                                color: "#fff",
                                fontSize: "0.9rem",
                            }}
                        />
                    </div>

                    {error && <p style={{ color: "var(--accent)", fontSize: "0.8rem", margin: "0" }}>{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: "1rem",
                            background: "var(--accent)",
                            border: "none",
                            borderRadius: "8px",
                            padding: "0.85rem",
                            color: "#fff",
                            fontWeight: 700,
                            cursor: loading ? "not-allowed" : "pointer",
                            transition: "opacity 0.2s",
                        }}
                    >
                        {loading ? "Logging in..." : "Login Ke Dashboard"}
                    </button>
                </form>
            </div>
        </div>
    );
}
