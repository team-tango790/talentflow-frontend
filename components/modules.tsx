import { ArrowRight, BookMarkedIcon, BookTextIcon, CheckIcon, Videotape } from "lucide-react";

const modules = [
    "Module 1: Introduction to product thinking",
    "Module 2: Market Research Methods",
    "Module 3: Defining User Needs",
    "Module 4: Competitive Analysis",
    "Module 5: Lessons & Brainstorming",
    "Module 6: Prototyping Basics",
    "Module 7: User Testing Fundamentals",
    "Module 8: Metrics & KPIs",
    "Module 9: Go to Market Strategy",
    "Module 10: Product Roadmap Planning",
    "Module 11: Stakeholders Presentation",
    "Module 12: Final Capstone Project",
];

const resources = [
    { 
        icon: BookTextIcon,
        title: "Stakeholder Presentation",
        meta: "PDF", 
        tag: "2.4MB", 
        action: "Download", 
    },
    { 
        icon: BookTextIcon,
        title: "Lecture: Presentation to Executives", 
        meta: "Video", 
        tag: "24 minutes", 
        action: "Download", 
    },
    { 
        icon: BookTextIcon,
        title: "Reading: Storytelling with Data", 
        meta: "Article", 
        tag: "12 minutes", 
        action: "Download", 
    },
];

const sessions = [
    {
        time: "Today - 4:00 PM WAT",
        title: "Module 11 Office Hours",
        meta: "Dr. Femi Adeboye • Zoom • 45mins",
    },
    {
        time: "Mar 25 - 3:00 PM WAT",
        title: "Capstone Project Kickoff",
        meta: "Full cohort • Zoom • 90mins",
    },
];

export default function Modules() {
    return (
        <div className="mt-10">
            <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
                {/* Left panel */}
                <div className="rounded-2xl border border-[#1F8A8A] py-4 bg-white shadow-sm h-fit">
                    <h2 className="pb-4 border-b border-[#1F8A8A] px-5 text-lg font-semibold flex items-center gap-2 text-gray-800">
                        <div className="p-1.5 me-1 rounded-full bg-[#112920]" />
                        Modules
                    </h2>

                    <div>
                        {modules.map((item, index) => {
                        const active = index === 10;
                        const locked = index === 11;

                        return (
                            <div
                            key={item}
                            className={`flex items-center justify-between border px-5 py-3 ${
                                active
                                ? "border-[#1F8A8A] border-l-0 border-r-0 bg-[#FEF5E6]"
                                : "border-[#1F8A8A] border-l-0 border-r-0 bg-white"
                            }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`rounded-full text-[#112920] w-10 h-10 flex items-center justify-center p-2 ${
                                        active
                                        ? "bg-[#C97A1A] text-white"
                                        : locked
                                        ? "bg-[#D2ECE3] text-[#112920]"
                                        : "bg-[#E6F6F6]"
                                    }`}>
                                        {
                                            active
                                            ? <p>{index + 1}</p>
                                            : locked
                                            ? <p>{index + 1}</p>
                                            : <CheckIcon size={18} className="text-[#112920]" />
                                        }
                                    </div>
                                    <div>
                                        <p className={`text-sm font-medium ${locked ? "text-[#A6C3B3]" : active ? "text-[#C97A1A]" : "text-gray-800"}`}>{item}</p>
                                        <p className={`text-xs ${locked ? "text-[#96D3BC]" : active ? "text-[#C97A1A]" : "text-gray-700"}`}>
                                            {locked ? "Locked" : index < 10 ? "Completed" : "In progress"}
                                        </p>
                                    </div>
                                </div>

                                <span
                                    className={`rounded-lg px-3 py-1 text-xs font-medium ${
                                    locked
                                        ? "bg-[#B4E0CF] text-[#D2ECE3]"
                                        : active
                                        ? "bg-[#F8E9C7] text-[#C97A1A]"
                                        : "bg-emerald-100 text-emerald-700"
                                    }`}
                                >
                                    {locked ? "Locked" : active ? "In progress" : "Completed"}
                                </span>
                            </div>
                        );
                        })}
                    </div>
                </div>

                {/* Right panel */}
                <div className="space-y-6">
                    {/* Resources */}
                    <div className="rounded-2xl border border-[#1F8A8A] bg-white shadow-sm">
                        <h2 className="py-4 border-b border-[#1F8A8A] px-5 text-lg font-semibold flex items-center gap-2 text-gray-800">
                            <div className="p-1.5 me-1 rounded-full bg-[#E4AE2F]" />
                            Current Lesson Resources
                        </h2>

                        <div>
                        {resources.map((item) => (
                            <div
                            key={item.title}
                            className="flex items-center justify-between rounded-xl border border-[#1F8A8A] bg-white py-3 px-5 my-4 mx-5 space-x-2"
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon size={24} className="text-[#112920]" />
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-medium text-gray-800">{item.title}</p>
                                        <div className="flex items-center gap-3 text-[#E4AE2F]">
                                            <p className="text-xs">{item.tag}</p>
                                            <p className="text-xs">{item.meta}</p>
                                        </div>
                                    </div>
                                </div>
                                <button className="text-sm bg-[#1E4A39] px-4 py-2 min-w-20 rounded-lg cursor-pointer hover:scale-105 transition-all duration-200">
                                    {item.action}
                                </button>
                            </div>
                        ))}
                        </div>
                    </div>

                    {/* Sessions */}
                    <div className="rounded-2xl border border-[#1F8A8A] bg-white shadow-sm">
                        <div className="py-4 border-b border-[#1F8A8A] px-5 text-lg font-semibold flex items-center justify-between gap-2 text-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-full bg-emerald-600" />
                                <h2>Live sessions</h2>
                            </div>
                            <button className="text-sm flex items-center gap-1 font-light text-emerald-700 hover:underline cursor-pointer">
                                View schedule <ArrowRight size={16} />
                            </button>
                        </div>

                        <div className="p-4">
                            <div className="space-y-3">
                            {sessions.map((item) => (
                                <div
                                key={item.title}
                                className="rounded-2xl p-4 bg-white border border-[#1F8A8A] space-y-1.5"
                                >
                                    <p className="text-md text-emerald-700">{item.time}</p>
                                    <h3 className="mt-1 text-lg font-semibold text-gray-800">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-emerald-600">{item.meta}</p>

                                    <div className="flex items-center gap-3">
                                        <button className="mt-4 rounded-lg bg-emerald-900 px-4 py-2 text-sm text-white hover:scale-105 cursor-pointer transition-all duration-200">
                                            Join session
                                        </button>
                                        <button className="mt-4 rounded-lg bg-white px-4 py-2 font-bold border border-[#1F8A8A] text-sm hover:bg-gray-200 text-[#1E4A39] cursor-pointer transition-all duration-200">
                                            Add to calendar
                                        </button>
                                    </div>
                                </div>
                            ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}