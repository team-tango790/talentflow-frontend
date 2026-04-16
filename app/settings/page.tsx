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
    BACKEND: "Backend Development",
    FRONTEND: "Frontend Development",
    UI_UX: "UI/UX Design",
    SOCIAL_MEDIA: "Social Media Management",
    GRAPHIC_DESIGN: "Graphic Design",
    PROJECT_MANAGEMENT: "Project Management",
};

const Skel = ({ h = 16, w = "100%" }: { h?: number; w?: string | number }) => (
    <div style={{
        height: h,
        width: w,
        borderRadius: 6,
        background: "linear-gradient(90deg,#e8e8e0 25%,#d8d8d0 50%,#e8e8e0 75%)",
        backgroundSize: "400px 100%",
        animation: "shimmer 1.4s infinite linear"
    }} />
);

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
    return (
        <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            padding: "13px 0",
            borderBottom: "1px solid #f0f0e8",
            gap: 12,
            flexWrap: "wrap"
        }}>
            <span style={{ fontSize: 13.5, color: "#9ab0aa", fontWeight: 500, flexShrink: 0 }}>{label}</span>
            <span style={{
                fontSize: 14.5,
                color: "#112920",
                fontWeight: 500,
                textAlign: "right",
                flex: 1,
                minWidth: 120,
                wordBreak: "break-word"
            }}>
                {value ?? "—"}
            </span>
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
        setLoading(true);
        setError(null);
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
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadProfile(); }, [loadProfile]);

    const startEdit = () => {
        if (!profile) return;
        setEditName(profile.name ?? "");
        setEditBio(profile.bio ?? "");
        setEditTrack(profile.track ?? "");
        setSaveError(null);
        setSaveSuccess(false);
        setEditing(true);
    };

    const saveProfile = async () => {
        setSaving(true);
        setSaveError(null);
        setSaveSuccess(false);
        try {
            const res = await fetch(`${BASE_URL}/api/users/me`, {
                method: "PUT",
                headers: getHeaders(),
                body: JSON.stringify({
                    name: editName.trim() || undefined,
                    bio: editBio.trim() || undefined,
                    track: editTrack || undefined
                }),
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
            setSaveSuccess(true);
            setEditing(false);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (e: unknown) {
            setSaveError(e instanceof Error ? e.message : "Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    const inputStyle = {
        width: "100%",
        minHeight: 52,
        border: "1.5px solid #dce6e2",
        borderRadius: 12,
        padding: "0 16px",
        fontSize: 15.5,
        color: "#112920",
        background: "#f9fbfa",
        outline: "none",
        fontFamily: "'DM Sans', sans-serif"
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f0", fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;700&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
                @keyframes spin { to { transform: rotate(360deg); } }
                .si:focus {
                    border-color: #112920 !important;
                    background: white !important;
                    box-shadow: 0 0 0 4px rgba(17,41,32,0.08) !important;
                }
                @media (max-width: 640px) {
                    .settings-grid {
                        grid-template-columns: 1fr !important;
                        gap: 28px !important;
                    }
                    .profile-header {
                        padding: 28px 20px 24px !important;
                    }
                }
            `}</style>

            <SideBar />

            <main style={{ flex: 1, overflowY: "auto", width: "100%" }}>
                {/* Mobile-Optimized Header */}
                <header style={{
                    padding: "14px 16px",
                    background: "white",
                    borderBottom: "1px solid #e8eeec",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    gap: 10
                }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        background: "#f5f5f0",
                        borderRadius: 12,
                        padding: "10px 14px",
                        border: "1px solid #e0e8e4",
                        flex: 1,
                        maxWidth: "520px"
                    }}>
                        <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                            <circle cx="9" cy="9" r="7" stroke="#9ca3af" strokeWidth="1.8" />
                            <path d="M14 14l3 3" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        <input
                            placeholder="Search settings..."
                            style={{
                                background: "none",
                                border: "none",
                                outline: "none",
                                fontSize: 14.5,
                                color: "#112920",
                                width: "100%"
                            }}
                        />
                    </div>

                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <button style={{ background: "none", border: "none", cursor: "pointer", padding: 8 }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#112920" strokeWidth="1.8" strokeLinecap="round" />
                                <circle cx="12" cy="7" r="4" stroke="#112920" strokeWidth="1.8" />
                            </svg>
                        </button>
                    </div>
                </header>

                <div style={{ padding: "24px 16px 40px", maxWidth: "1080px", margin: "0 auto" }}>
                    {/* Page Title */}
                    <div style={{ marginBottom: 32 }}>
                        <h1 style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "clamp(24px, 7vw, 32px)",
                            fontWeight: 700,
                            color: "#112920",
                            marginBottom: 8
                        }}>
                            Settings
                        </h1>
                        <p style={{ color: "#7a9a91", fontSize: 15 }}>
                            Manage your profile and account information
                        </p>
                    </div>

                    {saveSuccess && (
                        <div style={{
                            background: "#f0fdf4",
                            border: "1px solid #a8dfc0",
                            borderRadius: 12,
                            padding: "14px 18px",
                            marginBottom: 24,
                            fontSize: 14.5,
                            color: "#1a6b3c",
                            display: "flex",
                            alignItems: "center",
                            gap: 10
                        }}>
                            Profile updated successfully!
                        </div>
                    )}

                    {error && (
                        <div style={{
                            background: "#fff2f2",
                            border: "1px solid #fcd0cc",
                            borderRadius: 12,
                            padding: "14px 18px",
                            marginBottom: 24,
                            fontSize: 14,
                            color: "#c0392b",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            <span>⚠ {error}</span>
                            <button onClick={loadProfile} style={{ background: "none", border: "none", cursor: "pointer", color: "#e74c3c", fontWeight: 600 }}>Retry</button>
                        </div>
                    )}

                    {/* Main Responsive Grid */}
                    <div className="settings-grid" style={{
                        display: "grid",
                        gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.35fr)",
                        gap: 28
                    }}>

                        {/* Profile Overview Card */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                            <div style={{
                                background: "white",
                                borderRadius: 20,
                                border: "1.5px solid #e8eeec",
                                overflow: "hidden"
                            }}>
                                <div className="profile-header" style={{
                                    background: "linear-gradient(135deg, #112920 0%, #1a4a35 100%)",
                                    padding: "36px 24px 28px",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center"
                                }}>
                                    {loading ? (
                                        <div style={{ width: 92, height: 92, borderRadius: "50%", background: "rgba(255,255,255,0.18)" }} />
                                    ) : profile?.profilePhoto ? (
                                        <img
                                            src={profile.profilePhoto}
                                            alt={profile.name}
                                            style={{ width: 92, height: 92, borderRadius: "50%", objectFit: "cover", border: "5px solid rgba(255,255,255,0.25)" }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: 92,
                                            height: 92,
                                            borderRadius: "50%",
                                            background: "#E9BD55",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 42,
                                            fontWeight: 700,
                                            color: "#112920",
                                            border: "5px solid rgba(255,255,255,0.3)"
                                        }}>
                                            {(profile?.name ?? "U").charAt(0).toUpperCase()}
                                        </div>
                                    )}

                                    <div style={{ marginTop: 20, textAlign: "center", width: "100%" }}>
                                        {loading ? (
                                            <><Skel h={24} w={180} /><div style={{ marginTop: 10 }}><Skel h={15} w={110} /></div></>
                                        ) : (
                                            <>
                                                <p style={{ fontSize: 21, fontWeight: 700, color: "white" }}>{profile?.name ?? "—"}</p>
                                                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", marginTop: 6 }}>
                                                    {profile?.role ? profile.role.charAt(0) + profile.role.slice(1).toLowerCase() : "—"}
                                                </p>
                                                {profile?.internId && (
                                                    <p style={{ fontSize: 13, color: "#E9BD55", marginTop: 10, fontWeight: 600 }}>{profile.internId}</p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div style={{ padding: "24px 24px 20px" }}>
                                    {loading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "13px 0", borderBottom: "1px solid #f0f0e8" }}>
                                                <Skel h={15} w="40%" />
                                                <Skel h={15} w="45%" />
                                            </div>
                                        ))
                                    ) : (
                                        <>
                                            <InfoRow label="Email" value={profile?.email} />
                                            <InfoRow label="Track" value={profile?.track ? TRACK_LABELS[profile.track] ?? profile.track : null} />
                                            <InfoRow label="Cohort" value={profile?.cohort?.name} />
                                            <InfoRow label="Stage" value={profile?.currentStage} />
                                            <InfoRow label="Member since" value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : null} />
                                        </>
                                    )}
                                </div>
                            </div>

                            {!loading && profile?.bio && (
                                <div style={{
                                    background: "white",
                                    borderRadius: 20,
                                    border: "1.5px solid #e8eeec",
                                    padding: "24px"
                                }}>
                                    <p style={{ fontSize: 15, fontWeight: 600, color: "#112920", marginBottom: 12 }}>Bio</p>
                                    <p style={{ fontSize: 14.5, color: "#7a9a91", lineHeight: 1.75 }}>{profile.bio}</p>
                                </div>
                            )}
                        </div>

                        {/* Edit & Account Section */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                            <div style={{
                                background: "white",
                                borderRadius: 20,
                                border: "1.5px solid #e8eeec",
                                overflow: "hidden"
                            }}>
                                <div style={{
                                    padding: "22px 24px",
                                    borderBottom: "1px solid #f0f0e8",
                                    display: "flex",
                                    flexWrap: "wrap",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: 12
                                }}>
                                    <div>
                                        <p style={{ fontSize: 16.5, fontWeight: 700, color: "#112920" }}>Profile Information</p>
                                        <p style={{ fontSize: 13.5, color: "#9ab0aa" }}>Update your name, bio and track</p>
                                    </div>
                                    {!editing && !loading && (
                                        <button
                                            onClick={startEdit}
                                            style={{
                                                padding: "11px 22px",
                                                borderRadius: 12,
                                                border: "1.5px solid #e0e8e4",
                                                background: "white",
                                                color: "#112920",
                                                fontSize: 14.5,
                                                fontWeight: 500,
                                                cursor: "pointer",
                                                whiteSpace: "nowrap"
                                            }}
                                        >
                                            ✏️ Edit Profile
                                        </button>
                                    )}
                                </div>

                                <div style={{ padding: "28px 24px" }}>
                                    {loading ? (
                                        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
                                            {[1, 2, 3].map(i => (
                                                <div key={i}>
                                                    <Skel h={16} w="38%" />
                                                    <div style={{ marginTop: 10 }}><Skel h={54} /></div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : editing ? (
                                        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                                            {saveError && (
                                                <div style={{ background: "#fff2f2", border: "1px solid #fcd0cc", borderRadius: 12, padding: "14px 18px", color: "#c0392b", fontSize: 14.5 }}>
                                                    {saveError}
                                                </div>
                                            )}

                                            <div>
                                                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 9 }}>Full Name</label>
                                                <input className="si" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Your full name" style={inputStyle} />
                                            </div>

                                            <div>
                                                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 9 }}>Learning Track</label>
                                                <select className="si" value={editTrack} onChange={(e) => setEditTrack(e.target.value)} style={{ ...inputStyle, cursor: "pointer", height: 52 }}>
                                                    <option value="">Select a track</option>
                                                    {TRACK_OPTIONS.map(t => <option key={t} value={t}>{TRACK_LABELS[t] ?? t}</option>)}
                                                </select>
                                            </div>

                                            <div>
                                                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 9 }}>
                                                    Bio <span style={{ fontWeight: 400, color: "#9ab0aa" }}>(optional)</span>
                                                </label>
                                                <textarea
                                                    className="si"
                                                    value={editBio}
                                                    onChange={(e) => setEditBio(e.target.value)}
                                                    placeholder="Tell your cohort about yourself..."
                                                    rows={5}
                                                    style={{
                                                        ...inputStyle,
                                                        height: "auto",
                                                        padding: "14px 16px",
                                                        resize: "vertical",
                                                        lineHeight: 1.7
                                                    }}
                                                />
                                            </div>

                                            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                                                <button
                                                    onClick={() => setEditing(false)}
                                                    style={{
                                                        flex: 1,
                                                        height: 54,
                                                        borderRadius: 12,
                                                        border: "1.5px solid #e0e8e4",
                                                        background: "white",
                                                        color: "#112920",
                                                        fontSize: 15,
                                                        fontWeight: 500,
                                                        cursor: "pointer"
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={saveProfile}
                                                    disabled={saving}
                                                    style={{
                                                        flex: 2,
                                                        height: 54,
                                                        borderRadius: 12,
                                                        border: "none",
                                                        background: saving ? "#3d6b58" : "#112920",
                                                        color: "white",
                                                        fontSize: 15.5,
                                                        fontWeight: 600,
                                                        cursor: saving ? "not-allowed" : "pointer",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        gap: 10
                                                    }}
                                                >
                                                    {saving ? (
                                                        <>
                                                            <span style={{ width: 18, height: 18, border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                                                            Saving...
                                                        </>
                                                    ) : "Save Changes"}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                            <InfoRow label="Full Name" value={profile?.name} />
                                            <InfoRow label="Email" value={profile?.email} />
                                            <InfoRow label="Learning Track" value={profile?.track ? TRACK_LABELS[profile.track] ?? profile.track : null} />
                                            <InfoRow label="Bio" value={profile?.bio || "No bio added yet"} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Account Details */}
                            <div style={{
                                background: "white",
                                borderRadius: 20,
                                border: "1.5px solid #e8eeec",
                                padding: "24px"
                            }}>
                                <p style={{ fontSize: 16.5, fontWeight: 700, color: "#112920", marginBottom: 18 }}>Account Details</p>
                                {loading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "13px 0", borderBottom: "1px solid #f0f0e8" }}>
                                            <Skel h={15} w="35%" />
                                            <Skel h={15} w="40%" />
                                        </div>
                                    ))
                                ) : (
                                    <>
                                        <InfoRow label="Role" value={profile?.role ? profile.role.charAt(0) + profile.role.slice(1).toLowerCase() : null} />
                                        <InfoRow label="Intern ID" value={profile?.internId} />
                                        <InfoRow label="Onboarding" value={profile?.onboardingCompleted ? "Completed ✓" : "Pending"} />
                                    </>
                                )}
                            </div>

                            {/* Security */}
                            <div style={{
                                background: "white",
                                borderRadius: 20,
                                border: "1.5px solid #e8eeec",
                                padding: "24px"
                            }}>
                                <p style={{ fontSize: 16.5, fontWeight: 700, color: "#112920", marginBottom: 8 }}>Security</p>
                                <p style={{ fontSize: 13.5, color: "#9ab0aa", marginBottom: 20 }}>Manage your password and account security</p>
                                <a
                                    href="/forgotten-password"
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 10,
                                        padding: "14px 24px",
                                        borderRadius: 12,
                                        border: "1.5px solid #e0e8e4",
                                        background: "white",
                                        color: "#112920",
                                        fontSize: 14.5,
                                        fontWeight: 500,
                                        textDecoration: "none"
                                    }}
                                >
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