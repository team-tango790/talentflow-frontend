// app/certificates/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import SideBar from "@/components/sidebar";
import { getMyCertificates, getCertificateById } from "@/lib/api";

/* ════════════════════════════════════
   TYPES
════════════════════════════════════ */
interface Certificate {
  id: string;
  issuedAt: string;
  certificateUrl?: string | null;
  user?: { id: string; name: string; email: string; internId?: string; profilePhoto?: string | null };
  course?: { id: string; title: string; track?: string; level?: string; description?: string };
  enrollment?: { completedAt?: string | null; averageGrade?: number | null; progress?: number };
}

/* ════════════════════════════════════
   SKELETON
════════════════════════════════════ */
const Skeleton = ({ h = 16, w = "100%" }: { h?: number; w?: string | number }) => (
  <div style={{ height: h, width: w, borderRadius: 6, background: "linear-gradient(90deg,#e8e8e0 25%,#d8d8d0 50%,#e8e8e0 75%)", backgroundSize: "400px 100%", animation: "shimmer 1.4s infinite linear" }} />
);

/* ════════════════════════════════════
   CERTIFICATE DETAIL MODAL
════════════════════════════════════ */
function CertificateModal({ certId, onClose }: { certId: string; onClose: () => void }) {
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getCertificateById(certId)
      .then(res => setCert(res?.data ?? res))
      .catch(() => setCert(null))
      .finally(() => setLoading(false));
  }, [certId]);

  const handleCopyLink = () => {
    if (cert?.certificateUrl) {
      navigator.clipboard.writeText(cert.certificateUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const issuedDate = cert ? new Date(cert.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";
  const completedDate = cert?.enrollment?.completedAt
    ? new Date(cert.enrollment.completedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(17,41,32,0.7)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "white", borderRadius: 24, width: "100%", maxWidth: 540, boxShadow: "0 32px 100px rgba(0,0,0,0.35)", overflow: "hidden", animation: "modalIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards" }}>

        {/* Close button */}
        <div style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 18, lineHeight: 1 }}>×</button>
        </div>

        {loading ? (
          <div style={{ padding: 40 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#f0f4f2", margin: "0 auto 20px" }} />
            <Skeleton h={22} w="60%" /><div style={{ marginTop: 10 }}><Skeleton h={14} w="40%" /></div>
            <div style={{ marginTop: 24 }}><Skeleton h={14} /><div style={{ marginTop: 8 }}><Skeleton h={14} /></div><div style={{ marginTop: 8 }}><Skeleton h={14} /></div></div>
          </div>
        ) : !cert ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <p style={{ color: "#374151", fontSize: 15 }}>Could not load certificate details</p>
          </div>
        ) : (
          <>
            {/* Header — dark gradient */}
            <div style={{ background: "linear-gradient(135deg, #112920 0%, #1a4a35 60%, #2d6a4f 100%)", padding: "36px 36px 28px", position: "relative", overflow: "hidden" }}>
              {/* Decorative orbs */}
              <div style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: "50%", background: "rgba(233,189,85,0.08)" }} />
              <div style={{ position: "absolute", bottom: -30, left: -30, width: 100, height: 100, borderRadius: "50%", background: "rgba(233,189,85,0.06)" }} />
              <div style={{ position: "absolute", top: 20, right: 60, width: 60, height: 60, borderRadius: "50%", background: "rgba(233,189,85,0.05)" }} />

              {/* Badge */}
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#E9BD55", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, fontSize: 30, boxShadow: "0 6px 24px rgba(233,189,85,0.4)" }}>
                🏆
              </div>

              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Certificate of Completion
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "white", lineHeight: 1.3, marginBottom: 8 }}>
                {cert.course?.title ?? "Course"}
              </div>
              {cert.course?.track && (
                <span style={{ fontSize: 12, padding: "3px 12px", borderRadius: 20, background: "rgba(233,189,85,0.2)", color: "#E9BD55", fontWeight: 600 }}>
                  {cert.course.track} Track
                </span>
              )}
            </div>

            {/* Body */}
            <div style={{ padding: "28px 36px 32px" }}>
              {/* Awarded to */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, padding: "16px 20px", background: "#f9fbfa", borderRadius: 14, border: "1px solid #e8eeec" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#E9BD55", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#112920", flexShrink: 0 }}>
                  {(cert.user?.name ?? "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#9ab0aa", marginBottom: 2 }}>Awarded to</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#112920" }}>{cert.user?.name ?? "—"}</div>
                  {cert.user?.internId && (
                    <div style={{ fontSize: 11, color: "#9ab0aa", marginTop: 1 }}>{cert.user.internId}</div>
                  )}
                </div>
              </div>

              {/* Details grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
                {[
                  { label: "Issue Date", value: issuedDate },
                  { label: "Completed", value: completedDate ?? "—" },
                  { label: "Final Grade", value: cert.enrollment?.averageGrade != null ? `${cert.enrollment.averageGrade}%` : "—" },
                  { label: "Level", value: cert.course?.level ? cert.course.level.replace("_", " ") : "—" },
                ].map((item, i) => (
                  <div key={i} style={{ padding: "14px 16px", background: "#f9fbfa", borderRadius: 12, border: "1px solid #e8eeec" }}>
                    <div style={{ fontSize: 11, color: "#9ab0aa", marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#112920" }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Course description snippet */}
              {cert.course?.description && (
                <div style={{ padding: "14px 16px", background: "#f9fbfa", borderRadius: 12, border: "1px solid #e8eeec", marginBottom: 24 }}>
                  <div style={{ fontSize: 11, color: "#9ab0aa", marginBottom: 4 }}>About the course</div>
                  <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
                    {cert.course.description.length > 160 ? cert.course.description.slice(0, 160) + "…" : cert.course.description}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 10 }}>
                {cert.certificateUrl ? (
                  <a
                    href={cert.certificateUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      flex: 2, height: 46, borderRadius: 12, background: "#112920", color: "white",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      fontSize: 14, fontWeight: 600, textDecoration: "none",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#1a3d2e"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#112920"; }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" /><polyline points="7 10 12 15 17 10" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><line x1="12" y1="15" x2="12" y2="3" stroke="white" strokeWidth="1.8" strokeLinecap="round" /></svg>
                    Download Certificate
                  </a>
                ) : (
                  <div style={{ flex: 2, height: 46, borderRadius: 12, background: "#f5f5f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#9ab0aa" }}>
                    No file attached yet
                  </div>
                )}

                <button
                  onClick={handleCopyLink}
                  disabled={!cert.certificateUrl}
                  style={{
                    flex: 1, height: 46, borderRadius: 12,
                    border: "1.5px solid #e0e8e4", background: copied ? "#f0fdf4" : "white",
                    color: copied ? "#15803d" : "#112920",
                    fontSize: 13, fontWeight: 500, cursor: cert.certificateUrl ? "pointer" : "not-allowed",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    transition: "all 0.2s",
                  }}
                >
                  {copied ? "✓ Copied!" : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                      Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   CERTIFICATE CARD
════════════════════════════════════ */
function CertificateCard({ cert, onOpenDetail }: { cert: Certificate; onOpenDetail: (id: string) => void }) {
  const issuedDate = new Date(cert.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div
      onClick={() => onOpenDetail(cert.id)}
      style={{
        background: "#fff", borderRadius: 16, overflow: "hidden",
        border: "1.5px solid #e8eeec", cursor: "pointer",
        boxShadow: "0 2px 12px rgba(17,41,32,0.06)",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 10px 32px rgba(17,41,32,0.13)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(17,41,32,0.06)"; }}
    >
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #112920 0%, #1a4a35 60%, #2d6a4f 100%)",
        padding: "24px 22px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -24, right: -24, width: 80, height: 80, borderRadius: "50%", background: "rgba(233,189,85,0.1)" }} />
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#E9BD55", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, fontSize: 22, boxShadow: "0 4px 14px rgba(233,189,85,0.4)" }}>
          🏆
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Certificate of Completion
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "white", lineHeight: 1.3 }}>
          {cert.course?.title ?? "Course"}
        </div>
        {cert.course?.track && (
          <div style={{ fontSize: 11, color: "#E9BD55", marginTop: 5 }}>{cert.course.track} Track</div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#e8f4f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#112920", flexShrink: 0 }}>
            {(cert.user?.name ?? "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#112920" }}>{cert.user?.name ?? "—"}</div>
            {cert.user?.internId && <div style={{ fontSize: 11, color: "#9ab0aa" }}>{cert.user.internId}</div>}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
            <span style={{ color: "#9ab0aa" }}>Issued on</span>
            <span style={{ color: "#374151", fontWeight: 500 }}>{issuedDate}</span>
          </div>
          {cert.enrollment?.averageGrade != null && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: "#9ab0aa" }}>Final grade</span>
              <span style={{ color: "#14b8a6", fontWeight: 600 }}>{cert.enrollment.averageGrade}%</span>
            </div>
          )}
        </div>

        {/* Click to view hint */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 14px", borderRadius: 10, background: "#f0f4f2", fontSize: 12, color: "#112920", fontWeight: 500 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          View details & download
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   EMPTY STATE
════════════════════════════════════ */
function EmptyState() {
  return (
    <div style={{ textAlign: "center", padding: "80px 24px" }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#f0f4f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 36 }}>🏅</div>
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#112920", marginBottom: 10 }}>No certificates yet</h3>
      <p style={{ fontSize: 14, color: "#7a9a91", lineHeight: 1.7, maxWidth: 400, margin: "0 auto" }}>
        Complete a course to earn your first certificate. Keep learning and making progress!
      </p>
      <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, maxWidth: 560, margin: "32px auto 0" }}>
        {[
          { icon: "📚", step: "01", title: "Complete all lessons" },
          { icon: "📝", step: "02", title: "Submit assignments" },
          { icon: "✅", step: "03", title: "Get graded" },
          { icon: "🏆", step: "04", title: "Earn certificate" },
        ].map((item, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
            <div style={{ fontSize: 10, color: "#14b8a6", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 4 }}>STEP {item.step}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#112920" }}>{item.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   MAIN PAGE
════════════════════════════════════ */
export default function Certificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCertId, setSelectedCertId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyCertificates();
      const certs = res?.data ?? [];
      setCertificates(Array.isArray(certs) ? certs : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load certificates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f0", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.9) translateY(16px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #c8d8d2; border-radius: 10px; }
      `}</style>

      <SideBar />

      <main style={{ flex: 1, overflowY: "auto" }}>
        {/* Header */}
        <header style={{ padding: "16px 32px", background: "white", borderBottom: "1px solid #e8eeec", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f5f5f0", borderRadius: 8, padding: "8px 14px", border: "1px solid #e0e8e4", width: 300 }}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="7" stroke="#9ca3af" strokeWidth="1.8" /><path d="M14 14l3 3" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" /></svg>
            <input placeholder="Search courses, lessons, projects" style={{ background: "none", border: "none", outline: "none", fontSize: 13, color: "#112920", width: "100%" }} />
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#112920" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="7" r="4" stroke="#112920" strokeWidth="1.8" /></svg>
            </button>
          </div>
        </header>

        <div style={{ padding: "32px 36px" }}>
          {/* Page title */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#112920", marginBottom: 4 }}>My Certificates</h1>
              <p style={{ color: "#7a9a91", fontSize: 14 }}>
                {loading ? "Loading…" : `${certificates.length} certificate${certificates.length !== 1 ? "s" : ""} earned`}
              </p>
            </div>
            {!loading && certificates.length > 0 && (
              <div style={{ background: "linear-gradient(135deg, #112920, #1a4a35)", color: "white", padding: "8px 20px", borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                🏆 {certificates.length} earned
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: "#fff2f2", border: "1px solid #fcd0cc", borderRadius: 10, padding: "12px 16px", marginBottom: 24, fontSize: 13, color: "#c0392b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>⚠ {error}</span>
              <button onClick={load} style={{ background: "none", border: "none", cursor: "pointer", color: "#e74c3c", fontWeight: 600, fontSize: 13 }}>Retry</button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: "1.5px solid #e8eeec" }}>
                  <div style={{ padding: "24px 22px", background: "#f0f4f2" }}>
                    <Skeleton h={48} w={48} /><div style={{ marginTop: 12 }}><Skeleton h={15} w="70%" /></div>
                    <div style={{ marginTop: 6 }}><Skeleton h={12} w="50%" /></div>
                  </div>
                  <div style={{ padding: "18px 22px" }}>
                    {[1, 2].map(j => <div key={j} style={{ marginBottom: 8 }}><Skeleton h={12} /></div>)}
                    <div style={{ marginTop: 12 }}><Skeleton h={36} /></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && certificates.length === 0 && <EmptyState />}

          {/* Grid */}
          {!loading && certificates.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {certificates.map(cert => (
                <CertificateCard key={cert.id} cert={cert} onOpenDetail={setSelectedCertId} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {selectedCertId && (
        <CertificateModal certId={selectedCertId} onClose={() => setSelectedCertId(null)} />
      )}
    </div>
  );
}
