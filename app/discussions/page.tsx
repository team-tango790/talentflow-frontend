"use client";

import { useState } from "react";
import SideBar from "@/components/sidebar";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  sender: string;
  role?: string;
  content: string;
  time: string;
  isSelf?: boolean;
  avatar: string;
}

interface Conversation {
  id: string;
  name: string;
  lastSender: string;
  preview: string;
  time: string;
  unread?: number;
  avatars: string[];
  isGroup?: boolean;
  isOnline?: boolean;
  members?: string;
  messages: Message[];
}

// ─── Avatar placeholder component ────────────────────────────────────────────

function Avatar({
  src,
  size = 40,
  initials,
}: {
  src?: string;
  size?: number;
  initials?: string;
}) {
  return (
    <div
      className="rounded-full bg-[#D9D4C7] flex items-center justify-center overflow-hidden flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {src ? (
        <img src={src} alt="" className="w-full h-full object-cover" />
      ) : (
        <span className="font-medium text-[#5F5E5A]">{initials}</span>
      )}
    </div>
  );
}

function GroupAvatars({ count = 3, size = 40 }: { count?: number; size?: number }) {
  const positions =
    count === 2
      ? [
          { top: 0, left: 0 },
          { top: size * 0.3, left: size * 0.3 },
        ]
      : [
          { top: 0, left: size * 0.15 },
          { top: size * 0.3, left: 0 },
          { top: size * 0.3, left: size * 0.3 },
        ];

  const small = size * 0.55;

  return (
    <div className="relative flex-shrink-0" style={{ width: size * 0.85, height: size * 0.85 }}>
      {positions.map((pos, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-[#C5BFB0] border-2 border-[#F5F3EE] overflow-hidden"
          style={{
            width: small,
            height: small,
            top: pos.top,
            left: pos.left,
          }}
        />
      ))}
    </div>
  );
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const groupConversations: Conversation[] = [
  {
    id: "g1",
    name: "Team Tango",
    lastSender: "Tom Jones",
    preview: "Hi Nana, i have just completed my task ...",
    time: "Today 2:30pm",
    unread: 4,
    avatars: [],
    isGroup: true,
    members: "Tom Jones (UI), Lai Salam (BE), Nana Bez (FE), John Doe (SM), Babs Sol (GD)......",
    messages: [
      {
        id: "m1",
        sender: "Tom Jones (UI)",
        content: "Hello everyone, i have just completed my assigned task, kindly check it out",
        time: "2:30pm",
        avatar: "",
      },
      {
        id: "m2",
        sender: "Nana Bez (FE)",
        content: "Thank you Tom, i appreciate your swift response to the work.",
        time: "",
        isSelf: true,
        avatar: "",
      },
      {
        id: "m3",
        sender: "Nana Bez (FE)",
        content: "I will have a look at it and begin work from my end.",
        time: "6:00pm",
        isSelf: true,
        avatar: "",
      },
    ],
  },
  ...Array(7)
    .fill(null)
    .map((_, i) => ({
      id: `g${i + 2}`,
      name: "Team Tango",
      lastSender: i < 4 ? "Tom Jones" : i < 6 ? "Yes" : "You",
      preview: "Hi Nana, i have just completed my task ...",
      time: "Today 2:30pm",
      unread: i === 5 ? 2 : 4,
      avatars: [],
      isGroup: true,
      members: "Tom Jones (UI), Lai Salam (BE), Nana Bez (FE), John Doe (SM), Babs Sol (GD)......",
      messages: [],
    })),
];

const dmConversations: Conversation[] = [
  {
    id: "d1",
    name: "John Doe",
    lastSender: "John Doe",
    preview: "Hi Farida, i have just graded your assignments....",
    time: "Today 2:30pm",
    unread: 4,
    avatars: [],
    isOnline: true,
    messages: [
      {
        id: "dm1",
        sender: "John Doe",
        content:
          "Hi Farida, i have just graded your assignments and let you some feedbacks, please pay close attention to the highlighted feedbacks.",
        time: "2:30pm",
        avatar: "",
      },
      {
        id: "dm2",
        sender: "Farida",
        content: "Thank you John, i appreciate your constructive criticism.",
        time: "",
        isSelf: true,
        avatar: "",
      },
      {
        id: "dm3",
        sender: "Farida",
        content:
          "I will work on the corrections and revert. Is it okay to follow up this conversation with you via a mail?",
        time: "6:00pm",
        isSelf: true,
        avatar: "",
      },
    ],
  },
  {
    id: "d2",
    name: "Sharon Opeyemi",
    lastSender: "Sharon Opeyemi",
    preview: "Hi Farida, i have just graded your assignments....",
    time: "Yesterday",
    unread: 2,
    avatars: [],
    messages: [],
  },
  ...["Eli Elyms", "Jones Cole", "Jones Cole", "Jones Cole", "Jones Cole", "Jones Cole", "Jones Cole", "Jones Cole", "Jones Cole"].map(
    (name, i) => ({
      id: `d${i + 3}`,
      name,
      lastSender: i >= 3 ? "You" : name,
      preview:
        i >= 3
          ? "Thanks for your response, i will look at it"
          : "Hi Farida, i have just graded your assignments....",
      time: "09/04/2026",
      unread: i < 3 ? 4 : undefined,
      avatars: [],
      messages: [],
    })
  ),
];

// ─── Chat panel ───────────────────────────────────────────────────────────────

function ChatPanel({
  conversation,
  isGroup,
}: {
  conversation: Conversation | null;
  isGroup: boolean;
}) {
  if (!conversation) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 border-b border-[#E8E5DF]">
        {isGroup ? (
          <GroupAvatars size={44} />
        ) : (
          <Avatar size={44} initials={conversation.name.slice(0, 2).toUpperCase()} />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[15px] text-[#2C2C2A]">{conversation.name}</p>
          <p className="text-[12px] text-[#888780] truncate flex items-center gap-1">
            {isGroup ? (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-[#3B6D11] flex-shrink-0" />
                {conversation.members}
              </>
            ) : (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-[#3B6D11] flex-shrink-0" />
                Online
              </>
            )}
          </p>
        </div>
        <button className="text-[#888780] hover:text-[#2C2C2A] mt-1">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="3" r="1.5" fill="currentColor" />
            <circle cx="9" cy="9" r="1.5" fill="currentColor" />
            <circle cx="9" cy="15" r="1.5" fill="currentColor" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-white">
        {conversation.messages.map((msg) => {
          if (!msg.isSelf) {
            return (
              <div key={msg.id}>
                <div className="flex items-start gap-2 mb-1">
                  <Avatar size={36} initials={msg.sender.slice(0, 2).toUpperCase()} />
                  <div>
                    <p className="text-[13px] font-semibold text-[#2C2C2A] mb-1">{msg.sender}</p>
                    <div className="bg-[#EAF3FB] text-[#2C2C2A] text-[14px] px-4 py-2.5 rounded-2xl rounded-tl-sm max-w-[340px] leading-relaxed">
                      {msg.content}
                    </div>
                  </div>
                </div>
                {msg.time && (
                  <p className="text-[11px] text-[#B4B2A9] ml-11">{msg.time}</p>
                )}
              </div>
            );
          } else {
            return (
              <div key={msg.id} className="flex flex-col items-end">
                <div className="flex items-end gap-2">
                  <div className="bg-white border border-[#DDD9D0] text-[#2C2C2A] text-[14px] px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[340px] leading-relaxed">
                    {msg.content}
                  </div>
                  <Avatar size={36} initials={msg.sender.slice(0, 2).toUpperCase()} />
                </div>
                {msg.time && (
                  <p className="text-[11px] text-[#B4B2A9] mt-1 mr-11">{msg.time}</p>
                )}
                {!msg.time && (
                  <p className="text-[11px] text-[#B4B2A9] mt-1 mr-11">
                    {isGroup ? "Nana Bez (FE)" : ""}
                  </p>
                )}
              </div>
            );
          }
        })}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#E8E5DF]">
        <div className="flex items-center gap-2 border border-[#DDD9D0] rounded-xl px-4 py-2.5 bg-white">
          <input
            type="text"
            placeholder="Send message"
            className="flex-1 text-[14px] text-[#2C2C2A] placeholder-[#B4B2A9] outline-none bg-transparent"
          />
          <div className="flex items-center gap-2 text-[#888780]">
            <button className="hover:text-[#2C2C2A]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </button>
            <button className="hover:text-[#2C2C2A]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="12" x2="15" y2="12" />
                <line x1="12" y1="9" x2="12" y2="15" />
              </svg>
            </button>
            <button className="w-9 h-9 rounded-xl bg-[#E8A020] flex items-center justify-center hover:bg-[#D08010]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" fill="white" stroke="white" strokeWidth="1.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Conversation list item ───────────────────────────────────────────────────

function ConvoItem({
  convo,
  isGroup,
  isActive,
  onClick,
}: {
  convo: Conversation;
  isGroup: boolean;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
        isActive ? "bg-[#F0EDE6]" : "hover:bg-[#F5F3EE]"
      }`}
    >
      {isGroup ? (
        <GroupAvatars size={42} />
      ) : (
        <Avatar size={42} initials={convo.name.slice(0, 2).toUpperCase()} />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-[13px] text-[#2C2C2A] truncate">{convo.name}</p>
          <span className="text-[11px] text-[#B4B2A9] flex-shrink-0">{convo.time}</span>
        </div>
        <p className="text-[12px] text-[#888780] truncate mt-0.5">
          <span className="text-[#5F5E5A] font-medium">{convo.lastSender}:</span>{" "}
          {convo.preview}
        </p>
      </div>
      {convo.unread ? (
        <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-[#E8A020] text-white text-[10px] font-semibold flex items-center justify-center">
          {convo.unread}
        </span>
      ) : null}
    </button>
  );
}

// ─── Main Discussions page ────────────────────────────────────────────────────

export default function Discussions() {
  const [activeTab, setActiveTab] = useState<"dms" | "groups">("groups");
  const [filterTab, setFilterTab] = useState<"all" | "unread">("unread");
  const [activeConvoId, setActiveConvoId] = useState<string>("g1");

  const conversations = activeTab === "groups" ? groupConversations : dmConversations;
  const activeConvo = conversations.find((c) => c.id === activeConvoId) ?? conversations[0];

  const filtered =
    filterTab === "unread"
      ? conversations.filter((c) => c.unread)
      : conversations;

  return (
    <div className="flex w-full min-h-screen bg-[#F5F3EE]">
      {/* Sidebar */}
      <SideBar />

      {/* Main content */}
      <main className="flex flex-1 min-h-screen overflow-hidden">
        <div className="flex flex-1 gap-5 p-6 overflow-hidden">

          {/* ── Left: Chat panel ── */}
          <div
            className="flex-1 min-w-0 bg-white rounded-2xl border border-[#E8E5DF] overflow-hidden flex flex-col"
            style={{ minHeight: 640 }}
          >
            <ChatPanel conversation={activeConvo} isGroup={activeTab === "groups"} />
          </div>

          {/* ── Right: Conversation list ── */}
          <div
            className="w-[400px] flex-shrink-0 bg-white rounded-2xl border border-[#E8E5DF] overflow-hidden flex flex-col"
            style={{ minHeight: 640 }}
          >
            {/* Search + tabs */}
            <div className="px-4 pt-4 pb-3 border-b border-[#E8E5DF] space-y-3">
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="flex-1 flex items-center gap-2 bg-white border border-[#DDD9D0] rounded-xl px-3 py-2">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#B4B2A9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search"
                    className="flex-1 text-[13px] text-[#2C2C2A] placeholder-[#B4B2A9] outline-none bg-transparent"
                  />
                </div>

                {/* DMs tab */}
                <button
                  onClick={() => { setActiveTab("dms"); setActiveConvoId("d1"); }}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                    activeTab === "dms" ? "text-[#E8A020]" : "text-[#888780] hover:text-[#2C2C2A]"
                  }`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span className="text-[11px] font-medium">DMs</span>
                </button>

                {/* Groups tab */}
                <button
                  onClick={() => { setActiveTab("groups"); setActiveConvoId("g1"); }}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                    activeTab === "groups" ? "text-[#E8A020]" : "text-[#888780] hover:text-[#2C2C2A]"
                  }`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span className="text-[11px] font-medium">Groups</span>
                </button>
              </div>

              {/* All / Unread filter */}
              <div className="flex gap-4">
                <button
                  onClick={() => setFilterTab("all")}
                  className={`text-[13px] font-medium pb-1.5 border-b-2 transition-colors ${
                    filterTab === "all"
                      ? "border-[#2C2C2A] text-[#2C2C2A]"
                      : "border-transparent text-[#888780] hover:text-[#2C2C2A]"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterTab("unread")}
                  className={`flex items-center gap-1.5 text-[13px] font-medium pb-1.5 border-b-2 transition-colors ${
                    filterTab === "unread"
                      ? "border-[#2C2C2A] text-[#2C2C2A]"
                      : "border-transparent text-[#888780] hover:text-[#2C2C2A]"
                  }`}
                >
                  Unread
                  <span className="w-4 h-4 rounded-full bg-[#2C2C2A] text-white text-[9px] flex items-center justify-center font-semibold">
                    {conversations.filter((c) => c.unread).length}
                  </span>
                </button>
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
              {filtered.map((convo) => (
                <ConvoItem
                  key={convo.id}
                  convo={convo}
                  isGroup={activeTab === "groups"}
                  isActive={convo.id === activeConvoId}
                  onClick={() => setActiveConvoId(convo.id)}
                />
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}