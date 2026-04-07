import ModuleCard from "@/components/ModuleCard";
import CourseDescription from "@/components/CourseDescription";
import { ArrowRight, TimerIcon, BookOpen, PlaySquareIcon } from "lucide-react";
import { useState } from "react";

const modules = Array(5).fill({
    title: "UX Audit of an Existing Product",
    tag1: "Includes videos",
    tag2: "Includes videos",
});

const description = [
    {
        body: "This course aims to understand the importance of user interface and user experience, along with their strategies and responsibilities. We delve into the distinction between UI and UX and their collaborative dynamics. Then, we explore the history of UI and UX, discuss different types of wireframe tools, and highlight the benefits of wireframe. In addition, we examine the characteristics of an effective prototype and the various stages of transforming concepts into reality. \n\n The course then explains the practical application of information architecture and explore the significance of site mapping and information hierarchy. Next, we discover the differences and importance of IAs and sitemaps. Further, we explore the advantages of high-fidelity wireframes over sketching and low-fidelity wireframes in UX designs. Additionally, we highlight Adobe XD, Figma, and Sketch as notable tools for UI and UX designs, and with a comparison."
    },
];

const resources = [
    { 
        title: "Recorded demos",
        meta: "Video", 
        tag: "24 minutes", 
        action: "Download", 
    },
    { 
        title: "Reading materials", 
        meta: "PDF", 
        tag: "2.4MB", 
        action: "Download", 
    },
    { 
        title: "Reading: Strorytelling with data", 
        meta: "Article", 
        tag: "12 minutes", 
        action: "Download", 
    },
];

const sessions = [
    {
        date: "Today- 4:00PM WAT",
        title: "Laws of design",
        meta: "YouTube • 45mins",
    },
    {
        date: "April 26th 2026",
        title: "Laws of design",
        meta: "YouTube • 45mins",
    },
];

export default function Modules() {
    const [activeTab, setActiveTab] = useState<"modules" | "description">("modules");

    return (
        <div className="mt-10">
            <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[3fr_2fr]">
                {/* Left panel */}
                <div className="rounded-xl border border-[#1F8A8A] bg-white shadow-sm">
                    <div className="p-5">
                        <video
                            src="https://www.w3schools.com/html/mov_bbb.mp4"
                            controls
                            autoPlay
                            muted
                            loop
                            className="w-full rounded-lg"
                        />
                        <div className="">
                            <div className="max-w-4xl mx-auto pt-5">
                                {/* Header */}
                                <h1 className="text-3xl font-semibold text-gray-800 mb-2">UI/UX Design</h1>

                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                                    <span className="flex items-center gap-1">
                                        <div className="bg-[#E6F6F6] rounded-sm p-1.5 flex items-center justify-center">
                                            <TimerIcon size={18} className="text-[#83C0C0]" /> 
                                        </div>
                                        3–7hrs average hours
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <div className="bg-[#FEF5E6] rounded-sm p-1.5 flex items-center justify-center">
                                            <BookOpen size={18} className="text-[#D08933]" /> 
                                        </div>
                                        12 modules
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <div className="bg-[#F8E9C7] rounded-sm p-1.5 flex items-center justify-center">
                                            <PlaySquareIcon size={18} className="text-[#E9BC55]" /> 
                                        </div>
                                        Contains videos
                                    </span> 
                                    <span className="flex items-center gap-1">
                                        <div className="bg-[#F8E9C7] rounded-sm p-1.5 flex items-center justify-center">
                                            <PlaySquareIcon size={18} className="text-[#E9BC55]" /> 
                                        </div>
                                        Contains documents
                                    </span>
                                </div>

                                <button className="mb-8 rounded-lg bg-emerald-900 px-4 py-2 text-sm text-white hover:scale-105 cursor-pointer transition-all duration-200">
                                    Start learning
                                </button>
                                    <div className="flex gap-6 mb-4">
                                        <button 
                                            onClick={() => setActiveTab("modules")}
                                            className={`pb-1 font-medium cursor-pointer ${activeTab === "modules" ? "border-b-4 border-[#1F8A8A] text-gray-800" : "text-gray-500"}`}
                                        >
                                            Modules
                                        </button>
                                        <button 
                                            onClick={() => setActiveTab("description")}
                                            className={`pb-1 font-medium cursor-pointer ${activeTab === "description" ? "border-b-4 border-[#1F8A8A] text-gray-800" : "text-gray-500"}`}
                                        >
                                            Course description
                                        </button>
                                    </div>

                                    {/* Module List */}
                                    {activeTab === "modules" && (
                                        <div className="border border-[#1F8A8A] rounded-lg overflow-hidden">
                                            {modules.map((module, index) => (
                                                    <ModuleCard key={index} module={module} />
                                            ))}
                                        </div>
                                    )}

                                    {/* Course Description */}
                                    {activeTab === "description" && (
                                        <div className="border border-[#1F8A8A] rounded-lg overflow-hidden mt-5">
                                            {description.map((course) => (
                                                    <CourseDescription key={course.body} course={course} />
                                            ))}
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right panel */}
                <div className="space-y-6">
                    {/* Resources */}
                    <div className="rounded-xl border border-[#1F8A8A] bg-white shadow-sm">
                        <h2 className="py-4 border-b border-[#1F8A8A] px-5 text-lg font-semibold flex items-center gap-2 text-gray-800">
                            <div className="p-1.5 me-1 rounded-full bg-[#E4AE2F]" />
                            Learning Resources
                        </h2>

                        <div>
                        {resources.map((item) => (
                            <div
                            key={item.title}
                            className="flex items-center justify-between rounded-xl border border-[#1F8A8A] bg-white py-3 px-5 my-4 mx-4 space-x-2"
                            >
                                <div className="flex items-center gap-3">
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
                    <div className="rounded-xl border border-[#1F8A8A] bg-white shadow-sm">
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
                            {sessions.map((item, index) => {
                                const today = index == 0;

                                return (
                                    <div
                                    key={item.title}
                                    className="rounded-2xl p-4 bg-[#F1F9F6] border border-[#1F8A8A] space-y-1.5"
                                    >
                                        <div className={`text-xs rounded-full w-fit py-1 px-2 ${
                                            today
                                            ? "bg-[#FDF0EE] text-[#D94F3D]"
                                            : "bg-[#FEF5E6] text-[#C97A1A]"
                                        }`}>
                                            <p>{item.date}</p>
                                        </div>
                                        <h3 className="mt-1 text-lg text-gray-800">
                                            Live class: <span className="font-semibold">{item.title}</span>
                                        </h3>
                                        <p className="text-sm text-gray-500">{item.meta}</p>

                                        <div className="flex items-center gap-3">
                                            <button className="mt-4 rounded-lg bg-emerald-900 px-4 py-2 text-sm text-white hover:scale-105 cursor-pointer transition-all duration-200">
                                                Join session
                                            </button>
                                            <button className="mt-4 rounded-lg bg-white px-4 py-2 border border-[#1F8A8A] text-sm hover:bg-gray-200 text-[#1E4A39] cursor-pointer transition-all duration-200">
                                                Add to calendar
                                            </button>
                                        </div>
                                    </div>
                                )})}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}