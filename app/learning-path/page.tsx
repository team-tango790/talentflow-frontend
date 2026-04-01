"use client";

import SideBar from "@/components/sidebar";
import Modules from "@/components/modules";
import { ArrowUpRight } from "lucide-react";
import Navbar from "@/components/navbar";

const course_details = [
    {
        title: "Product Design",
        course: "Introduction to UI/UX design",
        total_modules: "12",
        total_time: "20",
        modules: "10",
        remaining: "2",
        time: "18",
        grade: "A",
        progress: "80%",
    },
];

export default function Learning(){
    return(
        <div>
            <main className="w-fill flex">
            {/* sidebar */}
            <SideBar/>
                <section className="w-full min-h-screen bg-white">
                    {/* navbar */}
                    <Navbar/>
                    <div className="px-15 mx-auto max-w-6xl py-8">

                        {/* course details card */}
                        {course_details.map((detail) => (
                            <div className="bg-[#112920] p-5 rounded-lg" key={detail.title}>
                                <div className="grid lg:grid-cols-[3fr_1fr]">
                                    {/* left side */}
                                    <div>
                                        <a href="#" className="text-xs">
                                            <div className=" flex items-center gap-1.5 text-[#E9BD55]/90">
                                                Currently enrolled
                                                <ArrowUpRight size={20} />
                                            </div>
                                        </a>
                                        <p className="text-xl font-semibold pt-2">{detail.title}</p>
                                        <div className=" flex items-center space-x-3 pt-2 text-xs text-[#E9BD55]/90">
                                            <p>{detail.total_modules} modules</p>
                                            <p>{detail.course}</p>
                                            <p>{detail.total_time}hr</p>
                                        </div>
                                        <div className="pt-6 text-xl font-semibold">
                                            <p>{detail.progress}</p>
                                        </div>
                                        <div className="pt-2 text-xs text-[#E9BD55]/90">
                                            <p>Overall completion</p>
                                        </div>
                                        {/* progress bar */}
                                        <div className="bg-gray-300 rounded-full h-2 mt-2 max-w-100">
                                            <div
                                                className="bg-[#E9BD55] h-2 rounded-full transition-all duration-500 ease-out"
                                                style={{ width: `${detail.progress}` }}
                                            />
                                        </div>
                                    </div>
                                    {/* right side */}
                                    <div className="grid grid-cols-2 gap-2 lg:mt-0 mt-5">
                                        <div className="text-center px-2 py-5 rounded-2xl bg-[#1E4A39] space-y-2">
                                            <div className="text-xl font-bold">{detail.modules}</div>
                                            <p className="text-xs">Modules done</p>
                                        </div>
                                        <div className="text-center px-2 py-5 rounded-2xl bg-[#1E4A39] space-y-2">
                                            <div className="text-xl font-bold">{detail.remaining}</div>
                                            <p className="text-xs">Remaining</p>
                                        </div>
                                        <div className="text-center px-2 py-5 rounded-2xl bg-[#1E4A39] space-y-2">
                                            <div className="text-xl font-bold">{detail.time}h</div>
                                            <p className="text-xs">Time logged</p>
                                        </div>
                                        <div className="text-center px-2 py-5 rounded-2xl bg-[#1E4A39] space-y-2">
                                            <div className="text-xl font-bold text-[#E9BD55]">{detail.grade}</div>
                                            <p className="text-xs">Current grade</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* second section */}
                        <Modules/>
                    </div>
                </section>
            </main>
        </div>
    )
}