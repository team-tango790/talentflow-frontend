// app/discussions/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import SideBar from "@/components/sidebar";
import { BASE_URL, getHeaders, safeJson } from "@/lib/api";

/* ════════════════════════════════════
   TYPES
════════════════════════════════════ */
interface Author {
  id: string;
  name: string;
  role: string;
  profilePhoto?: string | null;
  internId?: string;
}

interface Reply {
  id: string;
  body: string;
  createdAt: string;
  isInstructor: boolean;
  author: Author;
}

interface Discussion {
  id: string;
  type: "COURSE" | "TEAM" | "DIRECT";
  title?: string | null;
  body: string;
  category?: string;
  isPinned?: boolean;
  courseId?: string | null;
  teamId?: string | null;
  recipientId?: string | null;
  createdAt: string;
  author: Author;
  recipient?: Author | null;
  course?: { id: string; title: string } | null;
  team?: { id: string; name: string } | null;
  replies?: Reply[];
  _count?: { replies: number };
}

/* ════════════════════════════════════
   API FUNCTIONS
════════════════════════════════════ */
async function fetchDiscussionById(id: string): Promise<Discussion> {
  const res = await fetch(`${BASE_URL}/api/discussions/${id}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Failed to load discussion (${res.status})`);
  const data = await res.json();
  return data.data ?? data;
}

async function postDiscussion(payload: {
  type: "COURSE" | "TEAM" | "DIRECT";
  body: string;
  title?: string;
  courseId?: string;
  teamId?: string;
  recipientId?: string;
}): Promise<Discussion> {
  const res = await fetch(`${BASE_URL}/api/discussions`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await safeJson<{ message?: string }>(res);
    throw new Error(err?.message ?? `Failed to create discussion (${res.status})`);
  }
  const data = await res.json();
  return data.data ?? data;
}

async function postReply(discussionId: string, body: string): Promise<Reply> {
  const res = await fetch(`${BASE_URL}/api/discussions/${discussionId}/replies`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ body }),
  });
  if (!res.ok) {
    const err = await safeJson<{ message?: string }>(res);
    throw new Error(err?.message ?? `Failed to send reply (${res.status})`);
  }
  const data = await res.json();
  return data.data ?? data;
}

async function deleteReply(discussionId: string, replyId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/discussions/${discussionId}/replies/${replyId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete reply (${res.status})`);
}

/* ════════════════════════════════════
   HELPERS
════════════════════════════════════ */
function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getTypeLabel(d: Discussion) {
  if (d.type === "COURSE") return d.course?.title ?? "Course";
  if (d.type === "TEAM") return d.team?.name ?? "Team";
  if (d.type === "DIRECT") return d.recipient?.name ?? "Direct";
  return d.type;
}

function getTypeBadgeColor(type: string) {
  if (type === "COURSE") return { bg: "#e8f4f0", color: "#14b8a6" };
  if (type === "TEAM") return { bg: "#eff6ff", color: "#2563eb" };
  if (type === "DIRECT") return { bg: "#fef3c7", color: "#d97706" };
  return { bg: "#f3f4f6", color: "#6b7280" };
}

function getCurrentUserId(): string {
  try {
    const user = JSON.parse(localStorage.getItem("user") ?? "{}");
    return user?.id ?? "";
  } catch { return ""; }
}

/* ════════════════════════════════════
   AVATAR
════════════════════════════════════ */
function Avatar({ name, size = 38, photo }: { name: string; size?: number; photo?: string | null }) {
  const colors = ["#d1fae5", "#dbeafe", "#fde8d8", "#f3e8ff", "#fef3c7"];
  const textColors = ["#065f46", "#1e40af", "#92400e", "#6b21a8", "#92400e"];
  const idx = name.charCodeAt(0) % colors.length;
  if (photo) return (
    <img src={photo} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
  );
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: colors[idx], color: textColors[idx], display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, flexShrink: 0 }}>
      {getInitials(name)}
    </div>
  );
}

/* ════════════════════════════════════
   NEW DISCUSSION MODAL
════════════════════════════════════ */
function NewDiscussionModal({
  onClose,
  onCreated,
  courseId,
}: {
  onClose: () => void;
  onCreated: (d: Discussion) => void;
  courseId?: string;
}) {
  const [type, setType] = useState<"COURSE" | "TEAM" | "DIRECT">("COURSE");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [contextId, setContextId] = useState(courseId ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!body.trim()) { setError("Message is required."); return; }
    if (!contextId.trim()) { setError(`${type === "COURSE" ? "Course" : type === "TEAM" ? "Team" : "Recipient"} ID is required.`); return; }
    setSubmitting(true);
    setError(null);
    try {
      const payload: Parameters<typeof postDiscussion>[0] = { type, body: body.trim(), title: title.trim() || undefined };
      if (type === "COURSE") payload.courseId = contextId.trim();
      else if (type === "TEAM") payload.teamId = contextId.trim();
      else payload.recipientId = contextId.trim();
      const newDiscussion = await postDiscussion(payload);
      onCreated(newDiscussion);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create discussion");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(17,41,32,0.6)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ background: "white", borderRadius: 20, padding: "32px", width: "100%", maxWidth: 480, boxShadow: "0 24px 80px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#112920" }}>New Discussion</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#9ca3af", lineHeight: 1 }}>×</button>
        </div>

        {error && (
          <div style={{ background: "#fff2f2", border: "1px solid #fcd0cc", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#c0392b" }}>
            {error}
          </div>
        )}

        {/* Type selector */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {(["COURSE", "TEAM", "DIRECT"] as const).map((t) => {
            const badge = getTypeBadgeColor(t);
            return (
              <button key={t} onClick={() => setType(t)} style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${type === t ? badge.color : "#e0e8e4"}`, background: type === t ? badge.bg : "white", color: type === t ? badge.color : "#7a9a91", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
                {t === "COURSE" ? "📚 Course" : t === "TEAM" ? "👥 Team" : "💬 Direct"}
              </button>
            );
          })}
        </div>

        {/* Context ID */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
            {type === "COURSE" ? "Course ID" : type === "TEAM" ? "Team ID" : "Recipient User ID"}
          </label>
          <input
            value={contextId}
            onChange={(e) => setContextId(e.target.value)}
            placeholder={`Paste the ${type === "COURSE" ? "course" : type === "TEAM" ? "team" : "user"} ID here`}
            style={{ width: "100%", height: 42, border: "1.5px solid #dce6e2", borderRadius: 8, padding: "0 12px", fontSize: 13, outline: "none", color: "#112920", background: "#f9fbfa" }}
          />
        </div>

        {/* Title (optional) */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
            Title <span style={{ fontWeight: 400, color: "#9ca3af" }}>(optional)</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Question about Module 2"
            style={{ width: "100%", height: 42, border: "1.5px solid #dce6e2", borderRadius: 8, padding: "0 12px", fontSize: 13, outline: "none", color: "#112920", background: "#f9fbfa" }}
          />
        </div>

        {/* Body */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Message</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your message or question here..."
            rows={4}
            style={{ width: "100%", border: "1.5px solid #dce6e2", borderRadius: 8, padding: "10px 12px", fontSize: 13, outline: "none", color: "#112920", background: "#f9fbfa", resize: "vertical", lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}
          />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, height: 44, borderRadius: 10, border: "1.5px solid #e0e8e4", background: "white", color: "#112920", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} style={{ flex: 2, height: 44, borderRadius: 10, border: "none", background: submitting ? "#3d6b58" : "#112920", color: "white", fontSize: 14, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {submitting ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />Sending…</> : "Post Discussion"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   CHAT PANEL
════════════════════════════════════ */
function ChatPanel({
  discussion,
  onReplyAdded,
  onReplyDeleted,
}: {
  discussion: Discussion;
  onReplyAdded: (reply: Reply) => void;
  onReplyDeleted: (replyId: string) => void;
}) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const currentUserId = typeof window !== "undefined" ? getCurrentUserId() : "";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [discussion.replies?.length]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setSending(true);
    setSendError(null);
    try {
      const reply = await postReply(discussion.id, trimmed);
      setInput("");
      onReplyAdded(reply);
    } catch (e: unknown) {
      setSendError(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (replyId: string) => {
    if (!confirm("Delete this reply?")) return;
    try {
      await deleteReply(discussion.id, replyId);
      onReplyDeleted(replyId);
    } catch { /* ignore */ }
  };

  const badge = getTypeBadgeColor(discussion.type);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #E8E5DF", background: "#FAFAF8" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <Avatar name={discussion.author.name} size={40} photo={discussion.author.profilePhoto} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: "#2C2C2A" }}>{discussion.author.name}</span>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: badge.bg, color: badge.color, fontWeight: 600 }}>
                {getTypeLabel(discussion)}
              </span>
              {discussion.isPinned && (
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#fef3c7", color: "#d97706", fontWeight: 600 }}>📌 Pinned</span>
              )}
            </div>
            {discussion.title && (
              <p style={{ fontSize: 13, fontWeight: 600, color: "#112920", marginBottom: 2 }}>{discussion.title}</p>
            )}
            <p style={{ fontSize: 12, color: "#888780" }}>
              {timeAgo(discussion.createdAt)} · {discussion._count?.replies ?? discussion.replies?.length ?? 0} replies
            </p>
          </div>
        </div>

        {/* Original message */}
        <div style={{ marginTop: 12, background: "#EAF3FB", borderRadius: 12, padding: "12px 16px", fontSize: 14, color: "#2C2C2A", lineHeight: 1.6 }}>
          {discussion.body}
        </div>
      </div>

      {/* Replies */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {(!discussion.replies || discussion.replies.length === 0) && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#B4B2A9", fontSize: 14 }}>
            No replies yet. Be the first to respond!
          </div>
        )}
        {discussion.replies?.map((reply) => {
          const isSelf = reply.author.id === currentUserId;
          return (
            <div key={reply.id} style={{ display: "flex", flexDirection: isSelf ? "row-reverse" : "row", gap: 10, alignItems: "flex-start" }}>
              <Avatar name={reply.author.name} size={34} photo={reply.author.profilePhoto} />
              <div style={{ maxWidth: "70%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexDirection: isSelf ? "row-reverse" : "row" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#2C2C2A" }}>{isSelf ? "You" : reply.author.name}</span>
                  {reply.isInstructor && <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 10, background: "#e8f4f0", color: "#14b8a6", fontWeight: 600 }}>Mentor</span>}
                  <span style={{ fontSize: 11, color: "#B4B2A9" }}>{timeAgo(reply.createdAt)}</span>
                </div>
                <div style={{
                  background: isSelf ? "white" : "#EAF3FB",
                  border: isSelf ? "1px solid #DDD9D0" : "none",
                  borderRadius: isSelf ? "12px 2px 12px 12px" : "2px 12px 12px 12px",
                  padding: "10px 14px",
                  fontSize: 14, color: "#2C2C2A", lineHeight: 1.6,
                }}>
                  {reply.body}
                </div>
                {isSelf && (
                  <button onClick={() => handleDelete(reply.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#c0392b", marginTop: 4, float: "right" }}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {sendError && (
        <div style={{ padding: "8px 20px", fontSize: 12, color: "#c0392b", background: "#fff2f2" }}>
          ⚠ {sendError}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid #E8E5DF" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #DDD9D0", borderRadius: 12, padding: "8px 12px", background: "white" }}>
          <input
            type="text"
            placeholder="Send a reply..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            disabled={sending}
            style={{ flex: 1, fontSize: 14, color: "#2C2C2A", outline: "none", background: "transparent", border: "none" }}
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            style={{ width: 36, height: 36, borderRadius: 10, background: sending || !input.trim() ? "#9ca3af" : "#E8A020", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: sending || !input.trim() ? "not-allowed" : "pointer" }}
          >
            {sending ? (
              <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" fill="white" stroke="white" strokeWidth="1.5" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   DISCUSSION LIST ITEM
════════════════════════════════════ */
function DiscussionItem({
  discussion,
  isActive,
  onClick,
}: {
  discussion: Discussion;
  isActive: boolean;
  onClick: () => void;
}) {
  const badge = getTypeBadgeColor(discussion.type);
  return (
    <button onClick={onClick} style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", borderRadius: 10, background: isActive ? "#F0EDE6" : "transparent", border: "none", cursor: "pointer", textAlign: "left", transition: "background 0.15s" }}
      onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "#F5F3EE"; }}
      onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
      <Avatar name={discussion.author.name} size={40} photo={discussion.author.profilePhoto} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#2C2C2A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {discussion.title ?? discussion.author.name}
          </span>
          <span style={{ fontSize: 10, color: "#B4B2A9", flexShrink: 0 }}>{timeAgo(discussion.createdAt)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
          <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 10, background: badge.bg, color: badge.color, fontWeight: 600, flexShrink: 0 }}>
            {getTypeLabel(discussion)}
          </span>
          <p style={{ fontSize: 12, color: "#888780", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {discussion.body}
          </p>
        </div>
        {(discussion._count?.replies ?? 0) > 0 && (
          <span style={{ marginTop: 4, display: "inline-block", fontSize: 10, color: "#14b8a6", fontWeight: 500 }}>
            {discussion._count?.replies} {discussion._count?.replies === 1 ? "reply" : "replies"}
          </span>
        )}
      </div>
    </button>
  );
}

/* ════════════════════════════════════
   MAIN DISCUSSIONS PAGE
════════════════════════════════════ */
export default function Discussions() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [activeDiscussion, setActiveDiscussion] = useState<Discussion | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "COURSE" | "TEAM" | "DIRECT">("ALL");

  // ── Load a single discussion with replies ──
  const loadDiscussion = useCallback(async (id: string) => {
    setLoadingDetail(true);
    try {
      const d = await fetchDiscussionById(id);
      setActiveDiscussion(d);
      // Update in list
      setDiscussions(prev => prev.map(x => x.id === id ? { ...x, ...d } : x));
    } catch {
      // keep previous
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const handleSelectDiscussion = (d: Discussion) => {
    setActiveDiscussion(d);
    loadDiscussion(d.id);
  };

  const handleDiscussionCreated = (d: Discussion) => {
    setDiscussions(prev => [d, ...prev]);
    setActiveDiscussion(d);
    setShowNewModal(false);
  };

  const handleReplyAdded = (reply: Reply) => {
    setActiveDiscussion(prev => {
      if (!prev) return prev;
      const updated = { ...prev, replies: [...(prev.replies ?? []), reply], _count: { replies: (prev._count?.replies ?? 0) + 1 } };
      setDiscussions(ds => ds.map(d => d.id === prev.id ? { ...d, _count: updated._count } : d));
      return updated;
    });
  };

  const handleReplyDeleted = (replyId: string) => {
    setActiveDiscussion(prev => {
      if (!prev) return prev;
      const updated = { ...prev, replies: (prev.replies ?? []).filter(r => r.id !== replyId), _count: { replies: Math.max(0, (prev._count?.replies ?? 1) - 1) } };
      setDiscussions(ds => ds.map(d => d.id === prev.id ? { ...d, _count: updated._count } : d));
      return updated;
    });
  };

  // ── Filter & search ──
  const filtered = discussions.filter(d => {
    if (filterType !== "ALL" && d.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return d.body.toLowerCase().includes(q) || (d.title ?? "").toLowerCase().includes(q) || d.author.name.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F5F3EE", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        .filter-pill { padding: 5px 14px; border-radius: 20px; border: 1px solid #DDD9D0; background: white; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; color: #888780; }
        .filter-pill.active { background: #112920; color: white; border-color: #112920; }
        .filter-pill:not(.active):hover { border-color: #112920; color: #112920; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #c8d8d2; border-radius: 10px; }
      `}</style>

      <SideBar />

      <main style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: "100vh" }}>
        <div style={{ display: "flex", flex: 1, gap: 16, padding: 20, overflow: "hidden" }}>

          {/* ── Chat Panel (left) ── */}
          <div style={{ flex: 1, minWidth: 0, background: "white", borderRadius: 16, border: "1px solid #E8E5DF", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {loadingDetail && (
              <div style={{ position: "absolute", top: 16, right: 16, width: 20, height: 20, border: "2.5px solid #d8e8e2", borderTopColor: "#112920", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            )}
            {activeDiscussion ? (
              <ChatPanel
                discussion={activeDiscussion}
                onReplyAdded={handleReplyAdded}
                onReplyDeleted={handleReplyDeleted}
              />
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#112920", marginBottom: 8 }}>No discussion selected</h3>
                <p style={{ color: "#888780", fontSize: 14, lineHeight: 1.6, maxWidth: 300 }}>
                  Select a discussion from the list or start a new one to begin a conversation.
                </p>
                <button onClick={() => setShowNewModal(true)} style={{ marginTop: 20, padding: "10px 24px", borderRadius: 10, background: "#112920", color: "white", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500 }}>
                  Start a Discussion
                </button>
              </div>
            )}
          </div>

          {/* ── Conversation List (right) ── */}
          <div style={{ width: 360, flexShrink: 0, background: "white", borderRadius: 16, border: "1px solid #E8E5DF", overflow: "hidden", display: "flex", flexDirection: "column" }}>

            {/* Search + New */}
            <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid #E8E5DF" }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "#F5F3EE", border: "1px solid #DDD9D0", borderRadius: 10, padding: "8px 12px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B4B2A9" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  <input type="text" placeholder="Search discussions" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ flex: 1, fontSize: 13, color: "#2C2C2A", outline: "none", background: "transparent", border: "none" }} />
                </div>
                <button onClick={() => setShowNewModal(true)} style={{ width: 38, height: 38, borderRadius: 10, background: "#112920", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }} title="New discussion">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </button>
              </div>

              {/* Type filters */}
              <div style={{ display: "flex", gap: 6 }}>
                {(["ALL", "COURSE", "TEAM", "DIRECT"] as const).map((t) => (
                  <button key={t} className={`filter-pill${filterType === t ? " active" : ""}`} onClick={() => setFilterType(t)}>
                    {t === "ALL" ? "All" : t === "COURSE" ? "📚" : t === "TEAM" ? "👥" : "💬"}
                    {t !== "ALL" && ` ${t.charAt(0) + t.slice(1).toLowerCase()}`}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
              {loading && (
                <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{ display: "flex", gap: 10, padding: "12px" }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(90deg,#e8e8e0 25%,#d8d8d0 50%,#e8e8e0 75%)", backgroundSize: "400px 100%", animation: "shimmer 1.4s infinite linear", flexShrink: 0 }} />
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ height: 13, width: "70%", borderRadius: 4, background: "linear-gradient(90deg,#e8e8e0 25%,#d8d8d0 50%,#e8e8e0 75%)", backgroundSize: "400px 100%", animation: "shimmer 1.4s infinite linear" }} />
                        <div style={{ height: 11, borderRadius: 4, background: "linear-gradient(90deg,#e8e8e0 25%,#d8d8d0 50%,#e8e8e0 75%)", backgroundSize: "400px 100%", animation: "shimmer 1.4s infinite linear" }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && filtered.length === 0 && (
                <div style={{ padding: "40px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🗨️</div>
                  <p style={{ color: "#888780", fontSize: 13, lineHeight: 1.6 }}>
                    {searchQuery ? "No discussions match your search." : "No discussions yet. Start one!"}
                  </p>
                  {!searchQuery && (
                    <button onClick={() => setShowNewModal(true)} style={{ marginTop: 14, padding: "8px 20px", borderRadius: 8, background: "#112920", color: "white", border: "none", cursor: "pointer", fontSize: 13 }}>
                      New Discussion
                    </button>
                  )}
                </div>
              )}

              {filtered.map((d) => (
                <DiscussionItem
                  key={d.id}
                  discussion={d}
                  isActive={activeDiscussion?.id === d.id}
                  onClick={() => handleSelectDiscussion(d)}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      {showNewModal && (
        <NewDiscussionModal
          onClose={() => setShowNewModal(false)}
          onCreated={handleDiscussionCreated}
        />
      )}
    </div>
  );
}
