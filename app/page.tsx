import Header from "@/components/header";
import { ArrowRight, Zap, TrendingUp, CheckSquare } from "lucide-react";
// import { Twitter } from 'lucide-react';

const courses = [
  "Data Analytics",
  "Backend Development",
  "Real-world Projects",
  "Product Design Track",
  "Frontend Development",
  "UX Research",
  "Product Management",
  "Graphic Design",
];

const features = [
  {
    icon: "📊",
    title: "Live progress tracking",
    description: "Visual progress bars per course, overall program completion, and certificate milestones — always visible from your dashboard.",
    badge: "Core feature",
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: "🏆",
    title: "Certificate distribution",
    description: "Automatically unlock your certificate when you hit 100% on a module. Download, share, or add it to your portfolio instantly.",
    badge: "Core feature",
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: "👥",
    title: "Team allocation",
    description: "Get placed in a cross-functional team of 4-6 interns across different tracks. Build real products together, just like at work.",
    badge: "Core feature",
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: "🎥",
    title: "Live sessions",
    description: "Join Zoom-integrated sessions with mentors. Never miss a class with built-in calendar reminders and session recordings.",
    badge: "Coming soon",
    badgeColor: "bg-amber-100 text-amber-700",
  },
  {
    icon: "⚡",
    title: "Smart notifications",
    description: "Get alerted for due assignments, mentor feedback, new announcements, and live sessions — before you miss them.",
    badge: "Core feature",
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: "📈",
    title: "Analytics & insights",
    description: "Track study hours over time (daily, weekly, monthly), module completion rates, and average grade points across all courses.",
    badge: "Coming soon",
    badgeColor: "bg-amber-100 text-amber-700",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#1a2e1a]">
      <Header />

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 pt-16 pb-10 md:pt-24 md:pb-16 text-center">
        <div className="flex items-center gap-2 bg-[#1f3320] border border-[#2e4a2e] rounded-full px-3 py-2 md:px-4 mb-10 md:mb-14">
          <span className="w-2 h-2 rounded-full bg-green-400 inline-block shrink-0" />
          <span className="text-xs sm:text-sm text-gray-300 tracking-wide">
            Trueminds Innovations · Intern Cohort Platform
          </span>
        </div>

        <h1 className="text-white font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight max-w-4xl">
          Where interns learn,
          <br />
          build and,{" "}
          <span className="text-[#E4AE2F] relative inline-block">
            grow together
            <svg
              className="absolute -bottom-3 left-0 w-full"
              viewBox="0 0 400 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <path
                d="M0 6 Q50 0 100 6 Q150 12 200 6 Q250 0 300 6 Q350 12 400 6"
                stroke="#e8a020"
                strokeWidth="2.5"
                fill="none"
              />
            </svg>
          </span>
        </h1>

        <p className="mt-8 md:mt-10 text-gray-400 text-sm sm:text-base md:text-lg max-w-xl leading-relaxed px-2">
          TalentFlow is Trueminds Innovations' unified LMS, a single platform
          replacing fragmented tools so every intern experiences real-world
          product development.
        </p>

        <div className="mt-10 md:mt-12 flex flex-col sm:flex-row gap-3 md:gap-4 items-center w-full max-w-sm sm:max-w-none sm:w-auto">
          <button className="flex items-center gap-2 bg-[#1E4A39] hover:bg-[#3a5c3a] text-white font-semibold px-6 py-3.5 rounded-xl transition-colors duration-200 w-full sm:w-auto justify-center text-sm md:text-base">
            Start learning
            <ArrowRight size={18} />
          </button>

          <button className="flex items-center gap-2 bg-[#E9BD55] hover:bg-[#d4911a] text-[#1a1a1a] font-semibold px-6 py-3.5 rounded-xl transition-colors duration-200 w-full sm:w-auto justify-center text-sm md:text-base">
            <Zap size={18} />
            View courses
          </button>

          <button className="flex items-center gap-2 border border-[#1F8A8A] hover:border-[#6a8a6a] text-white font-semibold px-6 py-3.5 rounded-xl transition-colors duration-200 w-full sm:w-auto justify-center bg-transparent text-sm md:text-base">
            See how it works
          </button>
        </div>
      </section>

      {/* Stats Cards Section */}
      <section className="px-4 pb-16 md:pb-24 max-w-5xl mt-10 md:mt-20 mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-[#1f3320] rounded-2xl p-5 md:p-6">
            <div className="w-10 h-10 rounded-xl bg-[#2e4a2e] flex items-center justify-center mb-5">
              <TrendingUp size={20} className="text-green-400" />
            </div>
            <p className="text-white text-3xl md:text-4xl font-extrabold mb-1">68%</p>
            <p className="text-gray-400 text-sm mb-4">Avg. program progress</p>
            <div className="w-full h-1.5 bg-[#2e4a2e] rounded-full">
              <div className="h-1.5 rounded-full bg-green-400" style={{ width: "68%" }} />
            </div>
            <div className="mt-4 inline-flex items-center gap-1.5 bg-[#2e4a2e] text-green-400 text-xs font-medium px-3 py-1.5 rounded-full">
              <TrendingUp size={12} />
              On track
            </div>
          </div>

          <div className="bg-[#1f3320] rounded-2xl p-5 md:p-6 lg:mt-[-30px]">
            <div className="w-10 h-10 rounded-xl bg-[#3a3055] flex items-center justify-center mb-5">
              <Zap size={20} className="text-purple-400" />
            </div>
            <p className="text-white text-3xl md:text-4xl font-extrabold mb-1">50+</p>
            <p className="text-gray-400 text-sm mb-4">Active interns</p>
            <div className="w-full h-1.5 bg-[#3a3055] rounded-full">
              <div className="h-1.5 rounded-full bg-green-400" style={{ width: "72%" }} />
            </div>
            <div className="mt-4 inline-flex items-center gap-1.5 bg-[#3a3055] text-yellow-400 text-xs font-medium px-3 py-1.5 rounded-full">
              <Zap size={12} />
              Cross-functional
            </div>
          </div>

          <div className="bg-[#1f3320] rounded-2xl p-5 md:p-6 sm:col-span-2 lg:col-span-1">
            <div className="w-10 h-10 rounded-xl bg-[#2e4050] flex items-center justify-center mb-5">
              <CheckSquare size={20} className="text-teal-400" />
            </div>
            <p className="text-white text-3xl md:text-4xl font-extrabold mb-1">4.8</p>
            <p className="text-gray-400 text-sm mb-4">Learner satisfaction</p>
            <div className="w-full h-1.5 bg-[#2e4050] rounded-full">
              <div className="h-1.5 rounded-full bg-green-400" style={{ width: "96%" }} />
            </div>
            <div className="mt-4 inline-flex items-center gap-1.5 bg-[#2e4050] text-teal-400 text-xs font-medium px-3 py-1.5 rounded-full">
              <CheckSquare size={12} />
              Excellent
            </div>
          </div>
        </div>
      </section>

      {/* Courses Ticker Nav */}
      <nav className="w-full min-h-12 bg-[#1E4A39] overflow-x-auto flex items-center text-sm text-[#D1D5DB] px-4 md:px-6">
        <div className="flex items-center gap-0 whitespace-nowrap min-w-max mx-auto">
          {courses.map((course, index) => (
            <p key={index} className="flex items-center gap-1.5 py-3">
              {index !== 0 && <span className="text-[#E8B943] mx-1.5 md:mx-2"><strong> • </strong></span>}
              <span className="text-xs sm:text-sm">{course}</span>
            </p>
          ))}
        </div>
      </nav>

      {/* How It Works + Features Section */}
      <section className="bg-[#D9D9D9] pt-14 md:pt-20">
        <div className="flex flex-col items-center justify-center px-4">
          <span className="text-[#1F8A8A] text-lg md:text-[20px] font-semibold">How it works</span>
          <h1 className="mt-4 md:mt-5 text-2xl sm:text-3xl md:text-[40px] max-w-xl mb-6 md:mb-8 text-center text-[#112B1E] font-bold leading-tight">
            From sign-up to certificate in one unified flow
          </h1>
          <p className="text-[#6B7280] text-sm md:text-[16px] max-w-lg md:max-w-[520px] leading-7 text-center px-2">
            Eight clear steps from your first login to your final achievement no fragmented tools, no confusion.
          </p>

          {/* Steps Grid */}
          <div className="text-white py-12 md:py-16 px-4 sm:px-8 md:px-20 w-full">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {[
                  {
                    num: "01",
                    title: "Register & choose your role",
                    desc: "Sign up as a Learner, Mentor, or Admin. Verify your email and get a personalised learner card with your unique identifier.",
                  },
                  {
                    num: "02",
                    title: "Pick your learning track",
                    desc: "Choose your discipline — Product Design, Frontend Dev, UX Research, Product Management, and more — and get allocated to a cross-functional team.",
                  },
                  {
                    num: "03",
                    title: "Access your dashboard",
                    desc: "Your personal hub shows live progress, upcoming sessions, pending assignments, recent mentor feedback, and team activity at a glance.",
                  },
                  {
                    num: "04",
                    title: "Learn through structured modules",
                    desc: "Watch videos, read materials, and complete interactive modules. Resources include YouTube links, articles, and live session recordings.",
                  },
                  {
                    num: "05",
                    title: "Submit assignments",
                    desc: "Upload PDFs, DOCX files, or share Figma/Notion links. Add context notes for your mentor and track every submission in one place.",
                  },
                  {
                    num: "06",
                    title: "Collaborate & get feedback",
                    desc: "Chat privately with mentors, discuss in group channels, and receive structured grade breakdowns with rubric scores and improvement notes.",
                  },
                ].map((step, i) => (
                  <div key={i} className="group">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-4xl md:text-5xl font-bold text-[#1F8A8A]">{step.num}</span>
                      <div className="h-px w-16 md:w-20 bg-[#1F8A8A]"></div>
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold mb-3 text-[#112B1E]">{step.title}</h3>
                    <p className="text-[#6B7280] text-sm md:text-[15px] leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Platform Features Header */}
          <span className="text-[#1F8A8A] mt-8 md:mt-16 font-semibold text-lg md:text-[20px]">Platform features</span>
          <h1 className="my-4 font-bold text-2xl sm:text-3xl md:text-[40px] text-[#112B1E] text-center">Everything in one place</h1>
          <p className="text-sm md:text-[15px] text-[#6B7280] max-w-xs md:max-w-[480px] leading-7 text-center px-2">
            Built around real intern pain points, clarity, feedback, progress visibility, and cross-team collaboration
          </p>

          {/* Features Grid */}
          <div className="py-12 md:py-16 px-4 sm:px-8 md:px-20 w-full">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-3xl p-6 md:p-8 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-2xl text-2xl md:text-3xl mb-5 md:mb-6">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed flex-1 text-sm md:text-base">{feature.description}</p>
                    <div className="mt-6 md:mt-8">
                      <span className={`inline-block px-4 py-1.5 text-xs font-medium rounded-full ${feature.badgeColor}`}>
                        {feature.badge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Who It's For Section */}
        <section className="bg-[#112920] py-12 md:py-16 px-4 sm:px-8 md:px-20 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center text-center mb-12 md:mb-16">
              <span className="text-[#1F8A8A] text-base md:text-[17px] font-semibold tracking-wide">Who it's for</span>
              <h2 className="text-[#E6F6F6] mt-3 text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Designed for every role
              </h2>
              <p className="text-[#9CA3AF] text-sm md:text-base mt-4 md:mt-6 max-w-2xl">
                TalentFlow serves three distinct users, each with a dashboard built
                around their specific needs and workflows.
              </p>
            </div>

            {/* Role Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mb-14 md:mb-20">
              {[
                {
                  initials: "AV",
                  name: "Sharon Opeyemi",
                  role: "INTERN • LEARNER",
                  roleColor: "text-emerald-400",
                  bgColor: "bg-emerald-500/20",
                  textColor: "text-emerald-400",
                  dotColor: "text-emerald-500",
                  items: ["Self-paced learning", "Track progress and test performance", "Get feedback from mentors", "View schedules and guidelines"],
                },
                {
                  initials: "ML",
                  name: "Tobi Adebola",
                  role: "MENTOR • LEARNING PROFESSIONAL",
                  roleColor: "text-yellow-400",
                  bgColor: "bg-yellow-500/20",
                  textColor: "text-yellow-400",
                  dotColor: "text-yellow-500",
                  items: ["Review submissions and provide feedback", "Track mentor progress of each learner", "Provide structured, meaningful feedback", "Monitor cohort performance"],
                },
                {
                  initials: "EX",
                  name: "Elina Korhonen, 45",
                  role: "EXECUTIVE • PROGRAM MANAGER",
                  roleColor: "text-teal-400",
                  bgColor: "bg-teal-500/20",
                  textColor: "text-teal-400",
                  dotColor: "text-teal-500",
                  items: ["Manage users and programs", "Oversee internship reporting", "Track platform-wide outcomes", "Automate repetitive processes"],
                },
              ].map((card, i) => (
                <div key={i} className="bg-[#1A3C32] rounded-3xl p-6 md:p-8 border border-[#2A5C4A] sm:col-span-1">
                  <div className={`w-10 h-10 ${card.bgColor} ${card.textColor} rounded-2xl flex items-center justify-center text-lg md:text-xl font-bold mb-5 md:mb-6`}>
                    {card.initials}
                  </div>
                  <h3 className="text-white text-lg md:text-xl font-semibold mb-1">{card.name}</h3>
                  <p className={`${card.roleColor} text-xs md:text-sm mb-5 md:mb-6`}>{card.role}</p>
                  <ul className="space-y-3 text-[#A3B8B0] text-sm">
                    {card.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <span className={`${card.dotColor} mt-1 shrink-0`}>•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white">50+</div>
                <div className="text-[#9CA3AF] text-xs md:text-sm mt-2">Active interns</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white">6</div>
                <div className="text-[#9CA3AF] text-xs md:text-sm mt-2">Learning modules per cohort</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white">4.8 <span className="text-xl md:text-2xl">★</span></div>
                <div className="text-[#9CA3AF] text-xs md:text-sm mt-2">Learner satisfaction</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white">100%</div>
                <div className="text-[#9CA3AF] text-xs md:text-sm mt-2">Certificate completion</div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Modules Section */}
        <section className="bg-white py-14 md:py-20 px-4 sm:px-8 md:px-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-start gap-12 lg:gap-8">

              {/* Left Content */}
              <div className="lg:col-span-5">
                <span className="text-[#10B981] font-medium text-sm md:text-base">Core modules</span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mt-3 leading-tight">
                  Six modules,<br />
                  one cohesive experience
                </h2>
                <p className="text-gray-600 mt-4 md:mt-6 text-base md:text-lg leading-relaxed max-w-md">
                  Every module is purpose-built with video content,
                  assignments, live sessions, and mentor feedback built in.
                </p>

                {/* Modules List */}
                <div className="mt-8 md:mt-10 space-y-3 md:space-y-4">
                  {[
                    { icon: "📊", title: "Dashboard", desc: "Progress, upcoming sessions, recent activity", badge: "Core", badgeColor: "bg-emerald-100 text-emerald-700" },
                    { icon: "📚", title: "Course Overview", desc: "Modules, video thumbnails, resources, assignments", badge: "Core", badgeColor: "bg-emerald-100 text-emerald-700" },
                    { icon: "✍️", title: "Assignments", desc: "Submit, track, view grades & mentor feedback", badge: "Core", badgeColor: "bg-emerald-100 text-emerald-700" },
                    { icon: "💬", title: "Discussion", desc: "Private mentor chat & group team channels", badge: "New", badgeColor: "bg-purple-100 text-purple-700" },
                    { icon: "🎥", title: "Live Sessions", desc: "Zoom-integrated, scheduled with reminders", badge: "Live", badgeColor: "bg-rose-100 text-rose-700" },
                    { icon: "📈", title: "Analytics", desc: "Study time, grades, module completion metrics", badge: "New", badgeColor: "bg-purple-100 text-purple-700" },
                  ].map((module, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5 flex items-center gap-4 md:gap-5 hover:border-gray-300 transition-colors group"
                    >
                      <div className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center text-xl md:text-2xl bg-gray-100 rounded-xl group-hover:bg-gray-200 transition-colors shrink-0">
                        {module.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm md:text-base">{module.title}</h4>
                        <p className="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-1">{module.desc}</p>
                      </div>
                      <span className={`text-xs font-medium px-3 md:px-4 py-1.5 rounded-full shrink-0 ${module.badgeColor}`}>
                        {module.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side - Dashboard Preview */}
              <div className="lg:col-span-7 flex justify-center lg:justify-end">
                <div className="w-full max-w-sm sm:max-w-md lg:max-w-[420px] bg-[#0F2A1F] rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
                  {/* Browser Top Bar */}
                  <div className="bg-[#1A3C32] px-4 py-3 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>

                  {/* Dashboard Content */}
                  <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                    <div className="bg-[#1A3C32] rounded-2xl p-4 md:p-5">
                      <p className="text-white text-base md:text-lg font-medium">Good morning, Adaeeze 👋</p>
                      <p className="text-emerald-400 text-xs md:text-sm mt-1">
                        You're 68% through your program • 2 assignments due
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      {[
                        { value: "4", label: "Courses enrolled", width: "w-3/4" },
                        { value: "68%", label: "Overall progress", width: "w-[68%]" },
                        { value: "12", label: "Assignments", width: "w-1/2" },
                        { value: "1", label: "Certificates", width: "w-full" },
                      ].map((stat, i) => (
                        <div key={i} className="bg-[#1A3C32] rounded-2xl p-4 md:p-5">
                          <div className="text-2xl md:text-4xl font-bold text-white">{stat.value}</div>
                          <div className="text-emerald-400 text-xs md:text-sm mt-1">{stat.label}</div>
                          <div className="h-1.5 bg-emerald-900 rounded-full mt-3 md:mt-4 overflow-hidden">
                            <div className={`h-1.5 ${stat.width} bg-emerald-500 rounded-full`}></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm mb-3 md:mb-4">My Courses</p>
                      <div className="space-y-2 md:space-y-3">
                        {[
                          { icon: "📐", color: "bg-blue-500/20 text-blue-400", title: "Product Design Fundamentals", progress: "82%" },
                          { icon: "📊", color: "bg-amber-500/20 text-amber-400", title: "Product Management", progress: "55%" },
                          { icon: "🔍", color: "bg-purple-500/20 text-purple-400", title: "User Research Methods", progress: "40%" },
                        ].map((course, i) => (
                          <div key={i} className="bg-[#1A3C32] rounded-2xl p-3 md:p-4 flex justify-between items-center gap-3">
                            <div className="flex items-center gap-2 md:gap-3 min-w-0">
                              <div className={`w-7 h-7 md:w-8 md:h-8 ${course.color} rounded-lg flex items-center justify-center shrink-0`}>
                                {course.icon}
                              </div>
                              <p className="text-white text-xs md:text-sm font-medium truncate">{course.title}</p>
                            </div>
                            <div className="text-emerald-400 text-xs md:text-sm font-medium shrink-0">{course.progress}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>

      {/* Testimonials Section */}
      <section className="bg-white py-14 md:py-20 px-4 sm:px-8 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <span className="text-[#48A77A] font-medium text-xs md:text-sm tracking-widest">Intern stories</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#112B1E] my-4 md:my-5">
              What our cohort says
            </h2>
            <p className="text-gray-500 text-xs md:text-sm mt-2">
              Real feedback from Trueminds interns after their first cohort on TalentFlow.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-0 md:px-10">
            {[
              {
                stars: "★★★★☆",
                quote: "Finally a platform where I can see exactly what to do next. The progress bars and certificate milestones keep me motivated every single day.",
                initials: "AO",
                bg: "bg-emerald-700",
                name: "Adaeze Obi",
                role: "Product Design Intern",
              },
              {
                stars: "★★★★★",
                quote: "The assignment feedback panel is a game changer. I can see my rubric breakdown, the mentor's comments, and exactly what to improve — all in one view.",
                initials: "KA",
                bg: "bg-amber-500",
                name: "Kola Adeyinka",
                role: "Frontend Dev Intern",
              },
              {
                stars: "★★★★☆",
                quote: "Having my whole team in one place — shared courses, group discussions, and the same dashboard — made collaboration feel natural from day one.",
                initials: "NE",
                bg: "bg-emerald-800",
                name: "Ngozi Eze",
                role: "Product Management Intern",
              },
            ].map((t, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all">
                <div className="flex gap-1 text-amber-400 mb-5 md:mb-6 text-sm md:text-base">{t.stars}</div>
                <p className="text-gray-700 leading-relaxed text-sm md:text-[15.5px]">"{t.quote}"</p>
                <div className="flex items-center gap-3 md:gap-4 mt-8 md:mt-10">
                  <div className={`w-10 h-10 md:w-11 md:h-11 ${t.bg} text-white rounded-2xl flex items-center justify-center font-bold text-base md:text-lg`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm md:text-base">{t.name}</p>
                    <p className="text-xs md:text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A2F23] text-white">
        {/* Join Cohort CTA */}
        <div className="bg-[#2B6851] py-12 md:py-16 px-4 md:px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              Join the TalentFlow cohort
            </h2>
            <p className="mt-4 text-base md:text-lg text-gray-300">
              One platform. Real projects. Real feedback. Real growth. Apply for the next
              Trueminds Innovations internship cohort.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mt-8 md:mt-10">
              <button className="bg-[#E9BD55] hover:bg-[#E8B943] text-black font-medium px-6 md:px-8 py-3.5 rounded-2xl transition-colors text-sm md:text-base w-full sm:w-auto">
                Apply for the cohort
              </button>
              <button className="bg-[#112920] hover:bg-[#254A3F] border border-gray-600 font-medium px-6 md:px-8 py-3.5 rounded-2xl transition-colors text-sm md:text-base w-full sm:w-auto">
                Learn more about Trueminds
              </button>
            </div>
          </div>
        </div>

        {/* Main Footer */}
        <div className="px-4 sm:px-8 md:px-6 pt-12 md:pt-16 pb-10 md:pb-12">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-y-12">

            {/* Brand Column */}
            <div className="col-span-2 md:col-span-5">
              <h3 className="text-xl md:text-2xl font-semibold">TalentFlow</h3>
              <p className="mt-3 md:mt-4 text-gray-400 max-w-md text-sm md:text-base">
                A unified learning platform for the Trueminds Innovations
                intern program. One place to learn, collaborate, and grow.
              </p>
              <div className="flex gap-4 md:gap-5 mt-6 md:mt-8">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  {/* <Twitter size={22} strokeWidth={2} /> */}
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-xl">□</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-xl">📷</a>
              </div>
            </div>

            {/* Platform Links */}
            <div className="col-span-1 md:col-span-2">
              <h4 className="font-semibold mb-4 md:mb-5 text-gray-300 text-sm md:text-base">Platform</h4>
              <ul className="space-y-2 md:space-y-3 text-gray-400 text-sm">
                {["Dashboard", "Courses", "Assignments", "Discussions", "Analytics"].map((link) => (
                  <li key={link}><a href="#" className="hover:text-white transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div className="col-span-1 md:col-span-2">
              <h4 className="font-semibold mb-4 md:mb-5 text-gray-300 text-sm md:text-base">Company</h4>
              <ul className="space-y-2 md:space-y-3 text-gray-400 text-sm">
                {["About Trueminds", "Internship program", "Mentors", "Careers"].map((link) => (
                  <li key={link}><a href="#" className="hover:text-white transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div className="col-span-2 md:col-span-3">
              <h4 className="font-semibold mb-4 md:mb-5 text-gray-300 text-sm md:text-base">Support</h4>
              <ul className="space-y-2 md:space-y-3 text-gray-400 text-sm">
                {["Help centre", "Contact us", "Privacy policy", "Terms of use"].map((link) => (
                  <li key={link}><a href="#" className="hover:text-white transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="max-w-7xl mx-auto mt-14 md:mt-20 pt-6 md:pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-xs md:text-sm text-gray-500 gap-4 md:gap-0">
            <p>© 2026 Trueminds Innovations Ltd. All rights reserved.</p>
            <div className="flex gap-4 md:gap-6">
              {["Privacy", "Terms", "Cookies"].map((link) => (
                <a key={link} href="#" className="hover:text-gray-300 transition-colors">{link}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}