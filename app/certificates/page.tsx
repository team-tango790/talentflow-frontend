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
  <div style={{
    height: h,
    width: w,
    borderRadius: 6,
    background: "linear-gradient(90deg,#e8e8e0 25%,#d8d8d0 50%,#e8e8e0 75%)",
    backgroundSize: "400px 100%",
    animation: "shimmer 1.4s infinite linear"
  }} />
);

/* ════════════════════════════════════
   CERTIFICATE DETAIL MODAL - Improved Mobile
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
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(17,41,32,0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px"
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "white",
        borderRadius: 24,
        width: "100%",
        maxWidth: 560,
        maxHeight: "94vh",
        overflow: "auto",
        boxShadow: "0 30px 90px rgba(0,0,0,0.4)",
        animation: "modalIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards"
      }}>

        {/* Close Button - Better for mobile */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 20,
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.9)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            color: "#112920",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
          }}
        >
          ✕
        </button>

        {loading ? (
          <div style={{ padding: "40px 24px", textAlign: "center" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#f0f4f2", margin: "0 auto 24px" }} />
            <Skeleton h={24} w="70%"/>
            <div style={{ marginTop: 12 }}><Skeleton h={14} w="45%"/></div>
          </div>
        ) : !cert ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <p style={{ color: "#374151", fontSize: 16 }}>Could not load certificate details</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{
              background: "linear-gradient(135deg, #112920 0%, #1a4a35 60%, #2d6a4f 100%)",
              padding: "40px 28px 32px",
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{ position: "absolute", top: -50, right: -50, width: 160, height: 160, borderRadius: "50%", background: "rgba(233,189,85,0.08)" }} />
              <div style={{ position: "absolute", bottom: -40, left: -40, width: 120, height: 120, borderRadius: "50%", background: "rgba(233,189,85,0.06)" }} />

              <div style={{
                width: 78,
                height: 78,
                borderRadius: "50%",
                background: "#E9BD55",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
                fontSize: 34,
                boxShadow: "0 8px 30px rgba(233,189,85,0.45)"
              }}>
                🏆
              </div>

              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "1px" }}>
                Certificate of Completion
              </div>
              <div style={{ fontSize: "clamp(20px, 5.5vw, 26px)", fontWeight: 700, color: "white", lineHeight: 1.25 }}>
                {cert.course?.title ?? "Course"}
              </div>
              {cert.course?.track && (
                <div style={{
                  display: "inline-block",
                  marginTop: 12,
                  fontSize: 13,
                  padding: "6px 16px",
                  borderRadius: 30,
                  background: "rgba(233,189,85,0.25)",
                  color: "#E9BD55",
                  fontWeight: 600
                }}>
                  {cert.course.track} Track
                </div>
              )}
            </div>

            {/* Body */}
            <div style={{ padding: "28px 24px 32px" }}>
              {/* Awarded to */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 28,
                padding: "18px 20px",
                background: "#f9fbfa",
                borderRadius: 16,
                border: "1px solid #e8eeec"
              }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "#E9BD55",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#112920",
                  flexShrink: 0
                }}>
                  {(cert.user?.name ?? "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#9ab0aa" }}>Awarded to</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#112920", marginTop: 2 }}>{cert.user?.name ?? "—"}</div>
                  {cert.user?.internId && <div style={{ fontSize: 13, color: "#9ab0aa" }}>{cert.user.internId}</div>}
                </div>
              </div>

              {/* Details */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 14,
                marginBottom: 28
              }}>
                {[
                  { label: "Issue Date", value: issuedDate },
                  { label: "Completed", value: completedDate ?? "—" },
                  { label: "Final Grade", value: cert.enrollment?.averageGrade != null ? `${cert.enrollment.averageGrade}%` : "—" },
                  { label: "Level", value: cert.course?.level ? cert.course.level.replace("_", " ") : "—" },
                ].map((item, i) => (
                  <div key={i} style={{
                    padding: "16px 18px",
                    background: "#f9fbfa",
                    borderRadius: 14,
                    border: "1px solid #e8eeec"
                  }}>
                    <div style={{ fontSize: 12, color: "#9ab0aa", marginBottom: 6 }}>{item.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#112920" }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Description */}
              {cert.course?.description && (
                <div style={{
                  padding: "18px 20px",
                  background: "#f9fbfa",
                  borderRadius: 14,
                  border: "1px solid #e8eeec",
                  marginBottom: 28
                }}>
                  <div style={{ fontSize: 12, color: "#9ab0aa", marginBottom: 8 }}>About the course</div>
                  <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.65 }}>
                    {cert.course.description.length > 180
                      ? cert.course.description.slice(0, 180) + "…"
                      : cert.course.description}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {cert.certificateUrl ? (
                  <a
                    href={cert.certificateUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      height: 52,
                      borderRadius: 14,
                      background: "#112920",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      fontSize: 15,
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      <polyline points="7 10 12 15 17 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="12" y1="15" x2="12" y2="3" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Download Certificate
                  </a>
                ) : (
                  <div style={{
                    height: 52,
                    borderRadius: 14,
                    background: "#f5f5f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    color: "#9ab0aa"
                  }}>
                    Certificate file not available yet
                  </div>
                )}

                <button
                  onClick={handleCopyLink}
                  disabled={!cert.certificateUrl}
                  style={{
                    height: 52,
                    borderRadius: 14,
                    border: "1.5px solid #e0e8e4",
                    background: copied ? "#f0fdf4" : "white",
                    color: copied ? "#15803d" : "#112920",
                    fontSize: 14.5,
                    fontWeight: 600,
                    cursor: cert.certificateUrl ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {copied ? "✓ Link Copied!" : "Copy Shareable Link"}
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
   CERTIFICATE CARD - More Responsive
════════════════════════════════════ */
function CertificateCard({ cert, onOpenDetail }: { cert: Certificate; onOpenDetail: (id: string) => void }) {
  const issuedDate = new Date(cert.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div
      onClick={() => onOpenDetail(cert.id)}
      style={{
        background: "#fff",
        borderRadius: 18,
        overflow: "hidden",
        border: "1.5px solid #e8eeec",
        cursor: "pointer",
        boxShadow: "0 4px 16px rgba(17,41,32,0.06)",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = "0 16px 40px rgba(17,41,32,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(17,41,32,0.06)";
      }}
    >
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #112920 0%, #1a4a35 60%, #2d6a4f 100%)",
        padding: "28px 24px",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 90, height: 90, borderRadius: "50%", background: "rgba(233,189,85,0.12)" }} />

        <div style={{
          width: 54,
          height: 54,
          borderRadius: "50%",
          background: "#E9BD55",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
          fontSize: 26,
          boxShadow: "0 6px 20px rgba(233,189,85,0.4)"
        }}>
          🏆
        </div>

        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Certificate of Completion
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "white", lineHeight: 1.35 }}>
          {cert.course?.title ?? "Course"}
        </div>
        {cert.course?.track && (
          <div style={{ fontSize: 12.5, color: "#E9BD55", marginTop: 6 }}>{cert.course.track} Track</div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "#e8f4f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            fontWeight: 700,
            color: "#112920"
          }}>
            {(cert.user?.name ?? "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: "#112920" }}>{cert.user?.name ?? "—"}</div>
            {cert.user?.internId && <div style={{ fontSize: 12, color: "#9ab0aa" }}>{cert.user.internId}</div>}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
            <span style={{ color: "#9ab0aa" }}>Issued</span>
            <span style={{ color: "#374151", fontWeight: 500 }}>{issuedDate}</span>
          </div>
          {cert.enrollment?.averageGrade != null && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
              <span style={{ color: "#9ab0aa" }}>Final Grade</span>
              <span style={{ color: "#14b8a6", fontWeight: 600 }}>{cert.enrollment.averageGrade}%</span>
            </div>
          )}
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "10px 16px",
          borderRadius: 12,
          background: "#f0f4f2",
          fontSize: 13,
          color: "#112920",
          fontWeight: 500
        }}>
          Tap to view & download →
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
    <div style={{ textAlign: "center", padding: "70px 20px" }}>
      <div style={{ width: 90, height: 90, borderRadius: "50%", background: "#f0f4f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 42 }}>🏅</div>
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "#112920", marginBottom: 12 }}>No certificates yet</h3>
      <p style={{ fontSize: 15, color: "#7a9a91", lineHeight: 1.7, maxWidth: 420, margin: "0 auto" }}>
        Complete your courses to start earning certificates. Your achievements will appear here.
      </p>
    </div>
  );
}

/* ════════════════════════════════════
   MAIN PAGE - Fully Responsive
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
        @keyframes modalIn { from { opacity: 0; transform: scale(0.92) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>

      <SideBar />

      <main style={{ flex: 1, overflowY: "auto", width: "100%" }}>
        {/* Responsive Header */}
        <header style={{
          padding: "16px 20px",
          background: "white",
          borderBottom: "1px solid #e8eeec",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 10,
          gap: 12
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#f5f5f0",
            borderRadius: 10,
            padding: "10px 14px",
            border: "1px solid #e0e8e4",
            flex: 1,
            maxWidth: 460
          }}>
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="7" stroke="#9ca3af" strokeWidth="1.8" />
              <path d="M14 14l3 3" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              placeholder="Search certificates..."
              style={{ background: "none", border: "none", outline: "none", fontSize: 14, color: "#112920", width: "100%" }}
            />
          </div>

          <button style={{ background: "none", border: "none", cursor: "pointer", padding: 8 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#112920" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="12" cy="7" r="4" stroke="#112920" strokeWidth="1.8" />
            </svg>
          </button>
        </header>

        <div style={{ padding: "28px 20px 40px", maxWidth: "1280px", margin: "0 auto" }}>
          {/* Page Title */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(26px, 6vw, 32px)",
              fontWeight: 700,
              color: "#112920",
              marginBottom: 6
            }}>
              My Certificates
            </h1>
            <p style={{ color: "#7a9a91", fontSize: 15 }}>
              {loading ? "Loading your achievements…" : `${certificates.length} certificate${certificates.length !== 1 ? "s" : ""} earned`}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: "#fff2f2",
              border: "1px solid #fcd0cc",
              borderRadius: 12,
              padding: "14px 18px",
              marginBottom: 28,
              fontSize: 14,
              color: "#c0392b",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <span>⚠ {error}</span>
              <button onClick={load} style={{ background: "none", border: "none", cursor: "pointer", color: "#e74c3c", fontWeight: 600 }}>Retry</button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ background: "#fff", borderRadius: 18, overflow: "hidden", border: "1.5px solid #e8eeec" }}>
                  <div style={{ height: 160, background: "#f0f4f2" }} />
                  <div style={{ padding: "20px" }}>
                    <Skeleton h={18} w="85%" />
                    <div style={{ marginTop: 12 }}><Skeleton h={14} w="60%" /></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && certificates.length === 0 && <EmptyState />}

          {/* Certificates Grid - Responsive */}
          {!loading && certificates.length > 0 && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 24
            }}>
              {certificates.map(cert => (
                <CertificateCard key={cert.id} cert={cert} onOpenDetail={setSelectedCertId} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {selectedCertId && (
        <CertificateModal certId={selectedCertId} onClose={() => setSelectedCertId(null)} />
      )}
    </div>
  );
}