import Header from "@/components/header";
import { ArrowRight, Zap, TrendingUp, CheckSquare } from "lucide-react";
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

      <section className="flex flex-col items-center justify-center px-4 pt-16 pb-10 md:pt-24 md:pb-16 text-center">
        <div className="flex items-center gap-2 bg-[#1f3320] border border-[#2e4a2e] rounded-full px-4 py-2 mb-10 md:mb-14">
          <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
          <span className="text-sm text-gray-300 tracking-wide">
            Trueminds Innovations · Intern Cohort Platform
          </span>
        </div>

        <h1 className="text-white font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight max-w-4xl">
          Where interns learn,
          <br />
          build and,{" "}
          <span className="text-[#e8a020] relative inline-block">
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

        <p className="mt-10 text-gray-400 text-base sm:text-lg max-w-xl leading-relaxed">
          TalentFlow is Trueminds Innovations' unified LMS, a single platform
          replacing fragmented tools so every intern experiences real-world
          product development.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row gap-4 items-center">
          <button className="flex items-center gap-2 bg-[#2e4a2e] hover:bg-[#3a5c3a] text-white font-semibold px-6 py-3.5 rounded-xl transition-colors duration-200 w-full sm:w-auto justify-center">
            Start learning
            <ArrowRight size={18} />
          </button>

          <button className="flex items-center gap-2 bg-[#e8a020] hover:bg-[#d4911a] text-[#1a1a1a] font-semibold px-6 py-3.5 rounded-xl transition-colors duration-200 w-full sm:w-auto justify-center">
            <Zap size={18} />
            View courses
          </button>

          <button className="flex items-center gap-2 border border-[#4a6a4a] hover:border-[#6a8a6a] text-white font-semibold px-6 py-3.5 rounded-xl transition-colors duration-200 w-full sm:w-auto justify-center bg-transparent">
            See how it works
          </button>
        </div>
      </section>

      <section className="px-4 pb-16 md:pb-24 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-[#1f3320] rounded-2xl p-6 border border-[#2e4a2e]">
            <div className="w-10 h-10 rounded-xl bg-[#2e4a2e] flex items-center justify-center mb-5">
              <TrendingUp size={20} className="text-green-400" />
            </div>
            <p className="text-white text-4xl font-extrabold mb-1">68%</p>
            <p className="text-gray-400 text-sm mb-4">Avg. program progress</p>
            <div className="w-full h-1.5 bg-[#2e4a2e] rounded-full">
              <div
                className="h-1.5 rounded-full bg-green-400"
                style={{ width: "68%" }}
              />
            </div>
            <div className="mt-4 inline-flex items-center gap-1.5 bg-[#2e4a2e] text-green-400 text-xs font-medium px-3 py-1.5 rounded-full">
              <TrendingUp size={12} />
              On track
            </div>
          </div>

          <div className="bg-[#2a2040] rounded-2xl p-6 border border-[#3a3055]">
            <div className="w-10 h-10 rounded-xl bg-[#3a3055] flex items-center justify-center mb-5">
              <Zap size={20} className="text-purple-400" />
            </div>
            <p className="text-white text-4xl font-extrabold mb-1">50+</p>
            <p className="text-gray-400 text-sm mb-4">Active interns</p>
            <div className="w-full h-1.5 bg-[#3a3055] rounded-full">
              <div
                className="h-1.5 rounded-full bg-green-400"
                style={{ width: "72%" }}
              />
            </div>
            <div className="mt-4 inline-flex items-center gap-1.5 bg-[#3a3055] text-yellow-400 text-xs font-medium px-3 py-1.5 rounded-full">
              <Zap size={12} />
              Cross-functional
            </div>
          </div>

          <div className="bg-[#1f2e38] rounded-2xl p-6 border border-[#2e4050] sm:col-span-2 lg:col-span-1">
            <div className="w-10 h-10 rounded-xl bg-[#2e4050] flex items-center justify-center mb-5">
              <CheckSquare size={20} className="text-teal-400" />
            </div>
            <p className="text-white text-4xl font-extrabold mb-1">4.8</p>
            <p className="text-gray-400 text-sm mb-4">Learner satisfaction</p>
            <div className="w-full h-1.5 bg-[#2e4050] rounded-full">
              <div
                className="h-1.5 rounded-full bg-green-400"
                style={{ width: "96%" }}
              />
            </div>
            <div className="mt-4 inline-flex items-center gap-1.5 bg-[#2e4050] text-teal-400 text-xs font-medium px-3 py-1.5 rounded-full">
              <CheckSquare size={12} />
              Excellent
            </div>
          </div>
        </div>
      </section>

      

      <nav className="w-full min-h-12 bg-[#1E4A39] flex justify-between items-center text-sm text-[#D1D5DB] px-6">
        {courses.map((course, index) => (
          <p key={index} className="flex items-center gap-1.5">
            {index !== 0 && <span className="text-[#E8B943]"><strong> • </strong></span>}
            {course}
          </p>
        ))}
      </nav>

      <section className="bg-[#D9D9D9] pt-20">
        <nav className="flex flex-col items-center justify-center">
          <span className="text-[#1F8A8A] text-[20px] font-semibold">How it works</span>
          <h1 className="mt-5 text-[40px] w-xl mb-8 text-center text-[#112B1E] font-bold text-center">From sign-up to certificate in one unified flow</h1>
          <p className="text-[#6B7280] text-[16px] w-130 leading-7 text-center">Eight clear steps from your first login to your final achievement no fragmented tools, no confusion.</p>
          <div className="text-white py-16 px-10">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                
                <div className="group">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-5xl font-bold text-[#1F8A8A]">01</span>
                    <div className="h-px w-20 h-5 bg-[#1F8A8A]"></div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-[#112B1E]">Register & choose your role</h3>
                  <p className="text-[#6B7280] text-[15px] leading-relaxed">
                    Sign up as a Learner, Mentor, or Admin.<br />
                    Verify your email and get a personalised<br />
                    learner card with your unique identifier.
                  </p>
                </div>

                <div className="group">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-5xl font-bold text-[#1F8A8A]">02</span>
                    <div className="h-px w-20 bg-[#1F8A8A]"></div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-[#112B1E]">Pick your learning track</h3>
                  <p className="text-[#6B7280] text-[15px] leading-relaxed">
                    Choose your discipline — Product Design,<br />
                    Frontend Dev, UX Research, Product<br />
                    Management, and more — and get<br />
                    allocated to a cross-functional team.
                  </p>
                </div>

                <div className="group">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-5xl font-bold text-[#1F8A8A]">03</span>
                    <div className="h-px w-20 bg-[#1F8A8A]"></div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-[#112B1E]">Access your dashboard</h3>
                  <p className="text-[#6B7280] text-[15px] leading-relaxed">
                    Your personal hub shows live progress,<br />
                    upcoming sessions, pending assignments,<br />
                    recent mentor feedback, and team activity<br />
                    at a glance.
                  </p>
                </div>

                <div className="group">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-5xl font-bold text-[#1F8A8A]">04</span>
                    <div className="h-px w-20 bg-[#1F8A8A]"></div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-[#112B1E]">Learn through structured modules</h3>
                  <p className="text-[#6B7280] text-[15px] leading-relaxed">
                    Watch videos, read materials, and complete<br />
                    interactive modules. Resources include<br />
                    YouTube links, articles, and live session<br />
                    recordings.
                  </p>
                </div>

                <div className="group">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-5xl font-bold text-[#1F8A8A]">05</span>
                    <div className="h-px w-20 bg-[#1F8A8A]"></div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-[#112B1E]">Submit assignments</h3>
                  <p className="text-[#6B7280] text-[15px] leading-relaxed">
                    Upload PDFs, DOCX files, or share<br />
                    Figma/Notion links. Add context notes for<br />
                    your mentor and track every submission in<br />
                    one place.
                  </p>
                </div>

                <div className="group">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-5xl font-bold text-[#1F8A8A]">06</span>
                    <div className="h-px w-20 bg-[#1F8A8A]"></div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-[#112B1E]">Collaborate & get feedback</h3>
                  <p className="text-[#6B7280] text-[15px] leading-relaxed">
                    Chat privately with mentors, discuss in<br />
                    group channels, and receive structured<br />
                    grade breakdowns with rubric scores and<br />
                    improvement notes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <span className="text-[#1F8A8A] mt-50 font-semibold text-[20px]">Platform features</span>
          <h1 className="my-4 font-bold text-[40px] text-[#112B1E]">Everything in one place </h1>
          <p className="text-[15px] text-[#6B7280] w-120 leading-7 text-center">Built around real intern pain points, clarity, feedback, progress visibility, and cross-team collaboration</p>
        
          <div className="py-16 px-10">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-3xl p-8 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-2xl text-3xl mb-6">
                      {feature.icon}
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {feature.title}
                    </h3>

                    <p className="text-gray-600 leading-relaxed flex-1">
                      {feature.description}
                    </p>

                    <div className="mt-8">
                      <span
                        className={`inline-block px-4 py-1.5 text-xs font-medium rounded-full ${feature.badgeColor}`}
                      >
                        {feature.badge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </nav>

        <section className="flex flex-col items-center w-full min-h-70 bg-[#112920] py-10">
          <span className="text-center text-[17px] font-semibold text-[#1F8A8A]">Who it’s for</span>
          <h2 className="text-[#E6F6F6] mt-3 text-[40px] font-bold">Designed for every role</h2>
          <p className="text-[#9CA3AF] text-sm text-center mt-5 w-120">TalentFlow serves three distinct users, each with a dashboard built around their specific needs and workflows.</p>
        </section>
      </section>
    </div>
  );
}