"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AdminLogin from "@/app/sukinime_dev/AdminLogin";
import AdminDashboard from "@/app/sukinime_dev/AdminDashboard";

export default function SukinimeDevPage() {
    const [user, setUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Fetch profile to check admin status
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("is_admin")
                    .eq("id", user.id)
                    .single();

                setIsAdmin(profile?.is_admin || false);
                setUser(user);
            } else {
                setUser(null);
                setIsAdmin(false);
            }
            setLoading(false);
        };

        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                checkUser();
            } else {
                setUser(null);
                setIsAdmin(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
                <div style={{ width: "40px", height: "40px", border: "4px solid rgba(255,255,255,0.1)", borderTop: "4px solid var(--accent)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!user) {
        return <AdminLogin />;
    }

    if (isAdmin === false) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--bg)",
                color: "var(--text)",
                padding: "2rem",
                textAlign: "center"
            }}>
                <div style={{
                    background: "var(--surface)",
                    padding: "3rem",
                    borderRadius: "32px",
                    border: "1px solid var(--border)",
                    backdropFilter: "blur(20px)",
                    maxWidth: "500px"
                }}>
                    <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>🚫</div>
                    <h1 style={{ fontSize: "1.8rem", fontWeight: 900, marginBottom: "1rem" }}>Access Denied</h1>
                    <p style={{ color: "var(--text-muted)", lineHeight: "1.6", marginBottom: "2rem" }}>
                        Maaf bro, akun lu ({user.email}) terdaftar sebagai user biasa. Dashboard ini cuma buat admin/developer Sukinime aja.
                    </p>
                    <button onClick={() => supabase.auth.signOut()} style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: "10px", padding: "0.85rem 1.5rem", fontWeight: 800, cursor: "pointer" }}>Back to Login</button>
                </div>
            </div>
        );
    }

    return <AdminDashboard user={user} />;
}
