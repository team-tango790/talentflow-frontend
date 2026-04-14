"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_SECTIONS = [
  {
    section: "Learn",
    items: [
      { label: "Dashboard",     href: "/dashboard",      icon: "house"         },
      { label: "Course Overview",    href: "/courses",        icon: "courses"       },
      // { label: "Learning path", href: "/learning-path",  icon: "path"          },
      { label: "Assignments",   href: "/assignments",    icon: "assignments"   },
      { label: "Discussions",   href: "/discussions",    icon: "discussions"   },
    ],
  },
  {
    section: "Progress",
    items: [
      { label: "Analytics",    href: "/analytics",    icon: "analytics"    },
      { label: "Certificates", href: "/certificates", icon: "certificates" },
    ],
  },
  {
    section: "Account",
    items: [
      { label: "Settings", href: "/settings", icon: "settings" },
    ],
  },
];

function Icon({ name }: { name: string }) {
  const props = {
    width: 16, height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "house":
      return (
        <svg {...props}>
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "courses":
      return (
        <svg {...props}>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
    case "path":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "assignments":
      return (
        <svg {...props}>
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        </svg>
      );
    case "discussions":
      return (
        <svg {...props}>
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      );
    case "analytics":
      return (
        <svg {...props}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      );
    case "certificates":
      return (
        <svg {...props}>
          <rect x="3" y="4" width="18" height="14" rx="2" />
          <line x1="7" y1="9" x2="17" y2="9" />
          <line x1="7" y1="13" x2="13" y2="13" />
        </svg>
      );
    case "settings":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <style>{`
        .sidebar-nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 9px;
          text-decoration: none;
          font-size: 14px;
          color: rgba(255,255,255,0.55);
          font-weight: 400;
          background: transparent;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap;
          font-family: 'DM Sans', sans-serif;
        }
        .sidebar-nav-link:hover {
          background: rgba(255,255,255,0.07);
          color: white;
        }
        .sidebar-nav-link.active {
          background: rgba(255,255,255,0.10);
          color: white;
          font-weight: 600;
        }
        .sidebar-inner-nav::-webkit-scrollbar { width: 0; }
        .sidebar-inner-nav { scrollbar-width: none; }
      `}</style>

      <aside
        style={{
          width: 248,
          minWidth: 248,
          maxWidth: 248,
          height: "100vh",
          position: "sticky",
          top: 0,
          background: "#112920",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",        /* ← no outer overflow */
          flexShrink: 0,
          zIndex: 40,
        }}
      >
        {/* ── Logo ── */}
        <div
          style={{
            padding: "20px 24px 18px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 18,
              fontWeight: 700,
              color: "white",
              letterSpacing: "-0.01em",
            }}
          >
            Talent<span style={{ color: "#E9BD55" }}>Flow</span>
          </span>
        </div>

        {/* ── Scrollable nav ── */}
        <nav
          className="sidebar-inner-nav"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {NAV_SECTIONS.map(({ section, items }) => (
            <div key={section}>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.3)",
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  padding: "0 12px",
                  marginBottom: 4,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {section}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {items.map(({ label, href, icon }) => {
                  const active = pathname === href || pathname.startsWith(href + "/");
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`sidebar-nav-link${active ? " active" : ""}`}
                    >
                      <span style={{ flexShrink: 0, opacity: active ? 1 : 0.65 }}>
                        <Icon name={icon} />
                      </span>
                      {label}
                      {active && (
                        <span
                          style={{
                            marginLeft: "auto",
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: "#E9BD55",
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── User card (pinned bottom) ── */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "#E9BD55",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              color: "#112920",
              flexShrink: 0,
            }}
          >
            A
          </div>
          <div style={{ overflow: "hidden", minWidth: 0 }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "white",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Aisha
            </p>
            <p
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.4)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              UI/UX Learner
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}