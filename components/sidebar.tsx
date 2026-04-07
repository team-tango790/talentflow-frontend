"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navSections = [
  {
    label: "Learn",
    items: [
      { icon: "fa-solid fa-house", label: "Dashboard", href: "/dashboard" },
      { icon: "fa-brands fa-youtube", label: "Course 0verview", href: "/course_overview" },
      { icon: "fa-solid fa-book-open", label: "Assignments", href: "/assignments" },
      { icon: "fa-regular fa-comments", label: "Discussions", href: "/discussions" },
    ],
  },
  {
    label: "Progress",
    items: [
      { icon: "fa-solid fa-chart-line", label: "Analytics", href: "/analytics" },
      { icon: "fa-solid fa-certificate", label: "Certificates", href: "/certificates" },
    ],
  },
  {
    label: "Account",
    items: [
      { icon: "fa-solid fa-gear", label: "Settings", href: "/settings" },
    ],
  },
];

export default function SideBar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-[#112920] text-[#E9BD55] shadow-lg border border-[#1e3d2f]"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sidebar"
      >
        <i className={`fa-solid ${isOpen ? "fa-xmark" : "fa-bars"} text-sm`}></i>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen
          w-[260px] bg-[#112920]
          flex flex-col
          border-r border-[#1a3328]
          shadow-[4px_0_30px_rgba(0,0,0,0.4)]
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:z-auto md:h-auto md:min-h-screen
        `}
      >
        <div className="px-6 py-6 border-b border-[#1e3d2f]">
            <h1 className="text-[#F3F7F5] text-xl font-bold text-center tracking-tight">
              Talent<span className="text-[#E9BD55]">Flow</span>
            </h1>
        </div>

      
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-thin">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="text-[#F1F9F6] text-[10px] font-semibold tracking-[0.15em] uppercase mb-2 px-3">
                {section.label}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`
                          group flex items-center gap-3 px-3 py-2.5 rounded-xl
                          text-sm font-medium transition-all duration-200 text-[#F1F9F6]
                          ${
                            isActive
                              ? "bg-[#E9BD55] text-[#0d2218] shadow-[0_0_16px_rgba(233,189,85,0.25)]"
                              : "text-[#8ab5a0] hover:bg-[#1a3328] hover:text-[#F3F7F5]"
                          }
                        `}
                      >
                        <span
                          className={`
                            w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0
                            transition-all duration-200
                            ${
                              isActive
                                ? "bg-[#c99d3a]/30 text-[#0d2218]"
                                : "bg-[#1e3d2f] text-[#6aa085] group-hover:bg-[#243d32] group-hover:text-[#E9BD55]"
                            }
                          `}
                        >
                          <i className={item.icon}></i>
                        </span>
                        {item.label}
                        {isActive && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#0d2218]/50" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}