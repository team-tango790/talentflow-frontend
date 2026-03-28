import { CheckIcon, Circle } from "lucide-react";

const modules = [
    "Module 1: Introduction to product thinking",
    "Module 2: Introduction to product thinking",
    "Module 3: Introduction to product thinking",
];

const resources = [
    { title: "Stakeholder Presentation", meta: "PDF • 2.4MB", action: "Download" },
    { title: "Lecture: Presentation to Executives", meta: "Video • 24 mins", action: "Watch" },
    { title: "Reading: Storytelling with Data", meta: "Article • 12 min read", action: "Read" },
];

const sessions = [
    {
        time: "Today • 4:00 PM WAT",
        title: "Module 11 Office Hours",
        meta: "Dr. Femi Adeboye • Zoom • 45mins",
        active: true,
    },
    {
        time: "Mar 25 • 3:00 PM WAT",
        title: "Capstone Project Kickoff",
        meta: "Full cohort • Zoom • 90mins",
        active: false,
    },
];

export default function Modules() {
    return (
        <div className="mt-10">
            <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
                {/* Left panel */}
                <div className="rounded-2xl border border-[#1F8A8A] bg-white py-4 shadow-sm h-fit">
                    <h2 className="pb-4 border-b border-[#1F8A8A] px-5 text-lg font-semibold flex items-center gap-2 text-gray-800">
                        <Circle size={15} className="fill-[#112920]" />
                        Modules
                    </h2>

                    <div>
                        {modules.map((item, index) => {
                        const active = index === 1;
                        const locked = index === 2;

                        return (
                            <div
                            key={item}
                            className={`flex items-center justify-between border-b px-5 py-3 ${
                                active
                                ? "border-emerald-300 bg-[#B4E0CF]"
                                : "border-gray-200 bg-white"
                            }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-[#E6F6F6] p-1 w-fit">
                                        <CheckIcon size={18} className="text-[#112920]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-black">{item}</p>
                                        <p className="text-xs text-gray-700">
                                            {locked ? "Locked" : index < 10 ? "Completed" : "In progress"}
                                        </p>
                                    </div>
                                </div>

                                <span
                                    className={`rounded-md px-3 py-1 text-xs font-medium ${
                                    locked
                                        ? "bg-gray-100 text-gray-500"
                                        : active
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-emerald-100 text-emerald-700"
                                    }`}
                                >
                                    {locked ? "Locked" : active ? "Active" : "Done"}
                                </span>
                            </div>
                        );
                        })}
                    </div>
                </div>

                {/* Right panel */}
                <div className="space-y-6">
                {/* Resources */}
                <div className="rounded-2xl border border-[#1F8A8A] bg-white p-4 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-gray-800">
                    Current Lesson Resources
                    </h2>

                    <div className="space-y-3">
                    {resources.map((item) => (
                        <div
                        key={item.title}
                        className="flex items-center justify-between rounded-xl bg-gray-50 p-3"
                        >
                        <div>
                            <p className="text-sm font-medium text-gray-800">{item.title}</p>
                            <p className="text-xs text-gray-500">{item.meta}</p>
                        </div>
                        <button className="text-sm text-emerald-700 hover:underline">
                            {item.action}
                        </button>
                        </div>
                    ))}
                    </div>
                </div>

                {/* Sessions */}
                <div className="rounded-2xl border border-[#1F8A8A] bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">Live sessions</h2>
                    <button className="text-sm text-emerald-700 hover:underline">
                        View schedule
                    </button>
                    </div>

                    <div className="space-y-3">
                    {sessions.map((item) => (
                        <div
                        key={item.title}
                        className={`rounded-2xl p-4 ${
                            item.active ? "bg-emerald-100" : "bg-amber-50"
                        }`}
                        >
                        <p className="text-xs text-gray-600">{item.time}</p>
                        <h3 className="mt-1 text-base font-semibold text-gray-800">
                            {item.title}
                        </h3>
                        <p className="text-sm text-gray-600">{item.meta}</p>

                        {item.active && (
                            <button className="mt-4 rounded-lg bg-emerald-900 px-4 py-2 text-sm text-white">
                            Join session
                            </button>
                        )}
                        </div>
                    ))}
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
}