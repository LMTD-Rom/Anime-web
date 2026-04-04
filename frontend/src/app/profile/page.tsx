"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { User } from "@supabase/supabase-js";
import SaweriaMilestone from "../components/SaweriaMilestone";

interface Profile {
    display_name: string | null;
    avatar_url: string | null;
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile>({ display_name: null, avatar_url: null });
    const [displayName, setDisplayName] = useState("");
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
    const [stats, setStats] = useState({ watchlist: 0, history: 0 });
    const fileRef = useRef<HTMLInputElement>(null);

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(async ({ data }) => {
            if (!data.user) { router.replace("/login"); return; }
            setUser(data.user);

            // Load profile
            const { data: prof } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
            if (prof) {
                setProfile(prof);
                setDisplayName(prof.display_name ?? data.user.user_metadata?.full_name ?? "");
                setAvatarPreview(prof.avatar_url);
            } else {
                setDisplayName(data.user.user_metadata?.full_name ?? "");
                setAvatarPreview(data.user.user_metadata?.avatar_url ?? null);
            }

            // Load stats
            const [wl, wh] = await Promise.all([
                supabase.from("user_watchlist").select("id", { count: "exact", head: true }).eq("user_id", data.user.id),
                supabase.from("watch_history").select("id", { count: "exact", head: true }).eq("user_id", data.user.id),
            ]);
            setStats({ watchlist: wl.count ?? 0, history: wh.count ?? 0 });

            setLoading(false);
        });
    }, [router]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { showToast("File terlalu besar (maks 5 MB)", "error"); return; }
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        const supabase = createClient();
        let avatarUrl = profile.avatar_url;

        // Upload avatar if new file selected
        if (avatarFile) {
            setUploadProgress(true);
            const ext = avatarFile.name.split(".").pop();
            const path = `${user.id}/avatar.${ext}`;
            const { error: uploadErr } = await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: true });
            if (uploadErr) { showToast("Gagal upload foto: " + uploadErr.message, "error"); setSaving(false); setUploadProgress(false); return; }
            const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
            avatarUrl = urlData.publicUrl + `?t=${Date.now()}`; // bust cache
            setUploadProgress(false);
        }

        // Upsert profile
        const { error } = await supabase.from("profiles").upsert({
            id: user.id,
            display_name: displayName.trim() || null,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
        }, { onConflict: "id" });

        if (error) {
            showToast("Gagal menyimpan: " + error.message, "error");
        } else {
            setProfile({ display_name: displayName.trim() || null, avatar_url: avatarUrl });
            setAvatarFile(null);
            showToast("Profil berhasil disimpan! ✓");
        }
        setSaving(false);
    };

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/");
    };

    if (loading) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "36px", height: "36px", border: "3px solid rgba(255,255,255,0.1)", borderTop: "3px solid var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    const currentAvatar = avatarPreview ?? user?.user_metadata?.avatar_url ?? null;
    const currentName = (displayName || user?.user_metadata?.full_name || user?.email?.split("@")[0]) ?? "User";


    return (
        <div style={{ minHeight: "100vh", padding: "3rem 1.5rem 5rem", maxWidth: "640px", margin: "0 auto" }}>

            {/* Toast */}
            {toast && (
                <div style={{
                    position: "fixed", top: "80px", left: "50%", transform: "translateX(-50%)",
                    zIndex: 9999, padding: "0.75rem 1.25rem", borderRadius: "10px",
                    background: toast.type === "success" ? "rgba(34,197,94,0.15)" : "rgba(230,57,80,0.15)",
                    border: `1px solid ${toast.type === "success" ? "rgba(34,197,94,0.4)" : "rgba(230,57,80,0.4)"}`,
                    color: toast.type === "success" ? "#4ade80" : "#f87171",
                    fontWeight: 700, fontSize: "0.85rem", whiteSpace: "nowrap",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                }}>
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div style={{ marginBottom: "2.5rem" }}>
                <h1 style={{ color: "var(--text)", fontSize: "1.5rem", fontWeight: 900, margin: "0 0 0.25rem" }}>Profil Saya</h1>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>{user?.email}</p>
            </div>

            {/* Avatar Section */}
            <div style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: "16px", padding: "1.75rem",
                marginBottom: "1.25rem",
                display: "flex", alignItems: "center", gap: "1.5rem",
            }}>
                {/* Avatar */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{
                        width: "88px", height: "88px", borderRadius: "50%",
                        overflow: "hidden", background: "var(--surface2)",
                        border: "3px solid var(--border)",
                        position: "relative",
                    }}>
                        {currentAvatar ? (
                            <Image src={currentAvatar} alt="Avatar" fill style={{ objectFit: "cover" }} unoptimized />
                        ) : (
                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--accent)", color: "#fff", fontSize: "2rem", fontWeight: 900 }}>
                                {currentName[0].toUpperCase()}
                            </div>
                        )}
                    </div>
                    {/* Edit overlay */}
                    <button
                        onClick={() => fileRef.current?.click()}
                        style={{
                            position: "absolute", bottom: 0, right: 0,
                            width: "28px", height: "28px", borderRadius: "50%",
                            background: "var(--accent)", border: "2px solid var(--bg)",
                            color: "#fff", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "0.7rem",
                        }}
                        title="Ganti foto profil"
                    >
                        ✎
                    </button>
                    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: "none" }} onChange={handleAvatarChange} />
                </div>

                {/* Name & trigger */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: "var(--text)", fontWeight: 800, fontSize: "1.1rem", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {currentName}
                    </p>
                    <button
                        onClick={() => fileRef.current?.click()}
                        style={{
                            background: "transparent", border: "1px solid var(--border)",
                            color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600,
                            padding: "4px 12px", borderRadius: "6px", cursor: "pointer",
                            transition: "all 0.15s",
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
                            (e.currentTarget as HTMLButtonElement).style.color = "var(--accent)";
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                            (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
                        }}
                    >
                        {uploadProgress ? "Mengupload..." : "Ganti Foto"}
                    </button>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.68rem", margin: "6px 0 0", opacity: 0.6 }}>JPG, PNG, WebP · Maks 5 MB</p>
                </div>
            </div>

            {/* Display Name */}
            <div style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: "16px", padding: "1.75rem",
                marginBottom: "1.25rem",
            }}>
                <label style={{ color: "var(--text-muted)", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "0.65rem" }}>
                    Nama Tampilan
                </label>
                <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Masukkan nama kamu..."
                    maxLength={40}
                    style={{
                        width: "100%", padding: "0.75rem 1rem",
                        background: "var(--surface2)", border: "1px solid var(--border)",
                        borderRadius: "10px", color: "var(--text)", fontSize: "0.95rem",
                        outline: "none", boxSizing: "border-box",
                        transition: "border-color 0.15s",
                    }}
                    onFocus={e => (e.target.style.borderColor = "var(--accent)")}
                    onBlur={e => (e.target.style.borderColor = "var(--border)")}
                />
                <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", margin: "0.4rem 0 0", opacity: 0.5, textAlign: "right" }}>
                    {displayName.length}/40
                </p>
            </div>

            {/* Stats */}
            <div style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: "16px", padding: "1.5rem",
                marginBottom: "1.75rem",
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem",
            }}>
                {[
                    { label: "Watchlist", value: stats.watchlist, icon: "♥", href: "/watchlist" },
                    { label: "Riwayat Nonton", value: stats.history, icon: "▶", href: "/" },
                ].map(s => (
                    <a key={s.label} href={s.href} style={{ textDecoration: "none" }}>
                        <div style={{
                            background: "var(--surface2)", borderRadius: "12px",
                            padding: "1rem", textAlign: "center",
                            border: "1px solid var(--border)", transition: "border-color 0.15s",
                            cursor: "pointer",
                        }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent)")}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                        >
                            <span style={{ fontSize: "1.2rem" }}>{s.icon}</span>
                            <p style={{ color: "var(--text)", fontWeight: 900, fontSize: "1.5rem", margin: "0.25rem 0 2px" }}>{s.value}</p>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.72rem", margin: 0 }}>{s.label}</p>
                        </div>
                    </a>
                ))}
            </div>

            {/* Saweria Milestone */}
            <SaweriaMilestone />

            {/* Action Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1.75rem" }}>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        width: "100%", padding: "0.85rem",
                        background: saving ? "rgba(230,57,80,0.5)" : "var(--accent)",
                        color: "#fff", border: "none", borderRadius: "12px",
                        fontWeight: 800, fontSize: "0.95rem", cursor: saving ? "not-allowed" : "pointer",
                        transition: "opacity 0.15s",
                    }}
                >
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
                <button
                    onClick={handleLogout}
                    style={{
                        width: "100%", padding: "0.85rem",
                        background: "transparent",
                        color: "var(--text-muted)", border: "1px solid var(--border)",
                        borderRadius: "12px", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer",
                        transition: "all 0.15s",
                    }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
                        (e.currentTarget as HTMLButtonElement).style.color = "var(--accent)";
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                        (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
                    }}
                >
                    Logout
                </button>
            </div>

            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}
