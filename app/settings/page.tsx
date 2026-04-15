// app/settings/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import SideBar from "@/components/sidebar";
import { BASE_URL, getHeaders, safeJson } from "@/lib/api";

interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: string;
    track?: string | null;
    bio?: string | null;
    internId?: string | null;
    profilePhoto?: string | null;
    currentStage?: string | null;
    cohort?: { name: string } | null;
    onboardingCompleted?: boolean;
    createdAt?: string;
}

const TRACK_OPTIONS = ["BACKEND", "FRONTEND", "UI_UX", "SOCIAL_MEDIA", "GRAPHIC_DESIGN", "PROJECT_MANAGEMENT"];
const TRACK_LABELS: Record<string, string> = {
    BACKEND: "Backend Development", FRONTEND: "Frontend Development", UI_UX: "UI/UX Design",
    SOCIAL_MEDIA: "Social Media Management", GRAPHIC_DESIGN: "Graphic Design", PROJECT_MANAGEMENT: "Project Management",
};

const Skel = ({ h = 16, w = "100%" }: { h?: number; w?: string | number }) => (
    <div style={{ height: h, width: w, borderRadius: 6, background: "linear-gradient(90deg,#e8e8e0 25%,#d8d8d0 50%,#e8e8e0 75%)", backgroundSize: "400px 100%", animation: "shimmer 1.4s infinite linear" }} />
);

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #f0f0e8" }}>
            <span style={{ fontSize: 13, color: "#9ab0aa", fontWeight: 500 }}>{label}</span>
            <span style={{ fontSize: 14, color: "#112920", fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>{value ?? "—"}</span>
        </div>
    );
}

export default function Settings() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [editName, setEditName] = useState("");
    const [editBio, setEditBio] = useState("");
    const [editTrack, setEditTrack] = useState("");

    const loadProfile = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const res = await fetch(`${BASE_URL}/api/users/me`, { headers: getHeaders() });
            if (!res.ok) throw new Error(`Failed to load profile (${res.status})`);
            const data = await res.json();
            const user: UserProfile = data.data ?? data;
            setProfile(user);
            try {
                const stored = JSON.parse(localStorage.getItem("user") ?? "{}");
                localStorage.setItem("user", JSON.stringify({ ...stored, name: user.name, track: user.track, role: user.role }));
            } catch { /* ignore */ }
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Failed to load profile");
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadProfile(); }, [loadProfile]);

    const startEdit = () => {
        if (!profile) return;
        setEditName(profile.name ?? "");
        setEditBio(profile.bio ?? "");
        setEditTrack(profile.track ?? "");
        setSaveError(null); setSaveSuccess(false); setEditing(true);
    };

    const saveProfile = async () => {
        setSaving(true); setSaveError(null); setSaveSuccess(false);
        try {
            const res = await fetch(`${BASE_URL}/api/users/me`, {
                method: "PUT", headers: getHeaders(),
                body: JSON.stringify({ name: editName.trim() || undefined, bio: editBio.trim() || undefined, track: editTrack || undefined }),
            });
            if (!res.ok) {
                const err = await safeJson<{ message?: string }>(res);
                throw new Error(err?.message ?? `Update failed (${res.status})`);
            }
            const data = await res.json();
            const updated: UserProfile = data.data ?? data;
            setProfile(updated);
            try {
                const stored = JSON.parse(localStorage.getItem("user") ?? "{}");
                localStorage.setItem("user", JSON.stringify({ ...stored, name: updated.name, track: updated.track }));
            } catch { /* ignore */ }
            setSaveSuccess(true); setEditing(false);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (e: unknown) {
            setSaveError(e instanceof Error ? e.message : "Failed to save changes");
        } finally { setSaving(false); }
    };

    const inputStyle = { width: "100%", height: 48, border: "1.5px solid #dce6e2", borderRadius: 10, padding: "0 14px", fontSize: 14, color: "#112920", background: "#f9fbfa", outline: "none", fontFamily: "'DM Sans', sans-serif" };

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f0", fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .si:focus{border-color:#112920!important;background:white!important;box-shadow:0 0 0 4px rgba(17,41,32,0.07)!important}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#c8d8d2;border-radius:10px}
      `}</style>

            <SideBar />

            <main style={{ flex: 1, overflowY: "auto" }}>
                <header style={{ padding: "16px 32px", background: "white", borderBottom: "1px solid #e8eeec", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f5f5f0", borderRadius: 8, padding: "8px 14px", border: "1px solid #e0e8e4", width: 300 }}>
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="7" stroke="#9ca3af" strokeWidth="1.8" /><path d="M14 14l3 3" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" /></svg>
                        <input placeholder="Search courses, lessons, projects" style={{ background: "none", border: "none", outline: "none", fontSize: 13, color: "#112920", width: "100%" }} />
                    </div>
                    <div style={{ display: "flex", gap: 16 }}>
                        <button style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#112920" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="7" r="4" stroke="#112920" strokeWidth="1.8" /></svg>
                        </button>
                        <button style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="#112920" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </button>
                    </div>
                </header>

                <div style={{ padding: "32px 36px", maxWidth: 960 }}>
                    <div style={{ marginBottom: 28 }}>
                        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#112920", marginBottom: 4 }}>Settings</h1>
                        <p style={{ color: "#7a9a91", fontSize: 14 }}>Manage your profile and account information</p>
                    </div>

                    {saveSuccess && (
                        <div style={{ background: "#f0fdf4", border: "1px solid #a8dfc0", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#1a6b3c", display: "flex", alignItems: "center", gap: 8 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            Profile updated successfully!
                        </div>
                    )}

                    {error && (
                        <div style={{ background: "#fff2f2", border: "1px solid #fcd0cc", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#c0392b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span>⚠ {error}</span>
                            <button onClick={loadProfile} style={{ background: "none", border: "none", cursor: "pointer", color: "#e74c3c", fontWeight: 600, fontSize: 13 }}>Retry</button>
                        </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 20 }}>

                        {/* Left — profile card */}
                        <div>
                            <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #e8eeec", overflow: "hidden" }}>
                                <div style={{ background: "linear-gradient(135deg, #112920 0%, #1a4a35 100%)", padding: "32px 24px 24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    {loading ? (
                                        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
                                    ) : profile?.profilePhoto ? (
                                        <img src={profile.profilePhoto} alt={profile.name} style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }} />
                                    ) : (
                                        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#E9BD55", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700, color: "#112920" }}>
                                            {(profile?.name ?? "U").charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div style={{ marginTop: 14, textAlign: "center" }}>
                                        {loading ? (
                                            <><Skel h={18} w={120} /><div style={{ marginTop: 8 }}><Skel h={13} w={80} /></div></>
                                        ) : (
                                            <>
                                                <p style={{ fontSize: 18, fontWeight: 700, color: "white" }}>{profile?.name ?? "—"}</p>
                                                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>
                                                    {profile?.role ? profile.role.charAt(0) + profile.role.slice(1).toLowerCase() : "—"}
                                                </p>
                                                {profile?.internId && <p style={{ fontSize: 11, color: "#E9BD55", marginTop: 6, fontWeight: 600, letterSpacing: "0.04em" }}>{profile.internId}</p>}
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div style={{ padding: "0 24px 20px" }}>
                                    {loading ? (
                                        <div style={{ paddingTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                                            {[1, 2, 3, 4].map(i => <div key={i} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 12, borderBottom: "1px solid #f0f0e8" }}><Skel h={13} w="40%" /><Skel h={13} w="40%" /></div>)}
                                        </div>
                                    ) : (
                                        <>
                                            <InfoRow label="Email" value={profile?.email} />
                                            <InfoRow label="Track" value={profile?.track ? TRACK_LABELS[profile.track] ?? profile.track : null} />
                                            <InfoRow label="Cohort" value={profile?.cohort?.name} />
                                            <InfoRow label="Stage" value={profile?.currentStage ?? null} />
                                            <InfoRow label="Member since" value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : null} />
                                        </>
                                    )}
                                </div>
                            </div>

                            {!loading && profile?.bio && (
                                <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #e8eeec", padding: "20px 24px", marginTop: 16 }}>
                                    <p style={{ fontSize: 13, fontWeight: 600, color: "#112920", marginBottom: 10 }}>Bio</p>
                                    <p style={{ fontSize: 13, color: "#7a9a91", lineHeight: 1.7 }}>{profile.bio}</p>
                                </div>
                            )}
                        </div>

                        {/* Right — edit panel */}
                        <div>
                            <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #e8eeec", overflow: "hidden" }}>
                                <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0e8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <p style={{ fontSize: 15, fontWeight: 700, color: "#112920" }}>Profile Information</p>
                                        <p style={{ fontSize: 12, color: "#9ab0aa", marginTop: 2 }}>Update your name, bio and learning track</p>
                                    </div>
                                    {!editing && !loading && (
                                        <button onClick={startEdit} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: "1.5px solid #e0e8e4", background: "white", color: "#112920", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                                            Edit
                                        </button>
                                    )}
                                </div>

                                <div style={{ padding: "24px" }}>
                                    {loading ? (
                                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                                            {[1, 2, 3].map(i => <div key={i}><Skel h={13} w="30%" /><div style={{ marginTop: 8 }}><Skel h={48} /></div></div>)}
                                        </div>
                                    ) : editing ? (
                                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                                            {saveError && <div style={{ background: "#fff2f2", border: "1px solid #fcd0cc", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#c0392b" }}>✕ {saveError}</div>}
                                            <div>
                                                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Full Name</label>
                                                <input className="si" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Your full name" style={inputStyle} />
                                            </div>
                                            <div>
                                                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Learning Track</label>
                                                <select className="si" value={editTrack} onChange={(e) => setEditTrack(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                                                    <option value="">Select a track</option>
                                                    {TRACK_OPTIONS.map(t => <option key={t} value={t}>{TRACK_LABELS[t] ?? t}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Bio <span style={{ fontWeight: 400, color: "#9ab0aa" }}>(optional)</span></label>
                                                <textarea className="si" value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="Tell your cohort about yourself..." rows={4}
                                                    style={{ ...inputStyle, height: "auto", padding: "12px 14px", resize: "vertical", lineHeight: 1.6 }} />
                                            </div>
                                            <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
                                                <button onClick={() => setEditing(false)} style={{ flex: 1, height: 46, borderRadius: 10, border: "1.5px solid #e0e8e4", background: "white", color: "#112920", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
                                                <button onClick={saveProfile} disabled={saving} style={{ flex: 2, height: 46, borderRadius: 10, border: "none", background: saving ? "#3d6b58" : "#112920", color: "white", fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                                                    {saving ? (<><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />Saving…</>) : "Save Changes"}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <InfoRow label="Full Name" value={profile?.name} />
                                            <InfoRow label="Email" value={profile?.email} />
                                            <InfoRow label="Learning Track" value={profile?.track ? TRACK_LABELS[profile.track] ?? profile.track : null} />
                                            <InfoRow label="Bio" value={profile?.bio || "No bio added yet"} />
                                            <p style={{ fontSize: 12, color: "#9ab0aa", lineHeight: 1.6, marginTop: 20 }}>
                                                Click <strong style={{ color: "#112920" }}>Edit</strong> to update your name, track, or bio. Your email and role can only be changed by an admin.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Account details */}
                            <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #e8eeec", padding: "20px 24px", marginTop: 16 }}>
                                <p style={{ fontSize: 15, fontWeight: 700, color: "#112920", marginBottom: 16 }}>Account Details</p>
                                {loading ? <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{[1, 2, 3].map(i => <div key={i} style={{ display: "flex", justifyContent: "space-between" }}><Skel h={13} w="35%" /><Skel h={13} w="40%" /></div>)}</div> : (
                                    <>
                                        <InfoRow label="Role" value={profile?.role ? profile.role.charAt(0) + profile.role.slice(1).toLowerCase() : null} />
                                        <InfoRow label="Intern ID" value={profile?.internId} />
                                        <InfoRow label="Onboarding" value={profile?.onboardingCompleted ? "Completed ✓" : "Pending"} />
                                    </>
                                )}
                            </div>

                            {/* Security */}
                            <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #e8eeec", padding: "20px 24px", marginTop: 16 }}>
                                <p style={{ fontSize: 15, fontWeight: 700, color: "#112920", marginBottom: 4 }}>Security</p>
                                <p style={{ fontSize: 12, color: "#9ab0aa", marginBottom: 16 }}>Manage your password and account security</p>
                                <a href="/forgotten-password" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 8, border: "1.5px solid #e0e8e4", background: "white", color: "#112920", fontSize: 13, fontWeight: 500, textDecoration: "none" }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                                    Change Password
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
