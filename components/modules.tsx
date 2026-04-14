"use client";

import { useEffect, useState } from "react";
import ModuleCard from "@/components/ModuleCard";
import CourseDescription from "@/components/CourseDescription";
import { ArrowRight, TimerIcon, BookOpen, PlaySquareIcon } from "lucide-react";
import { Module, Resource } from "@/types/course";

const API_BASE_URL = "https://talentflow-backend-production.up.railway.app";
const COURSE_ID = "3dbcbb6e-779e-4ac5-a240-82ec1075e386";

export default function Modules() {
    const [modules, setModules] = useState<Module[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<"modules" | "description">("modules");
    const [description, setDescription] = useState("");
    const [courseTitle, setCourseTitle] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");

        const headers: HeadersInit = {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        async function fetchData() {
            try {
                setLoading(true);
                setError("");

                const [modulesRes, overviewRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/courses/${COURSE_ID}/modules`, { headers }),
                    fetch(`${API_BASE_URL}/api/courses/${COURSE_ID}/overview`, { headers }),
                ]);

                if (!modulesRes.ok) throw new Error("Failed to fetch modules");
                if (!overviewRes.ok) throw new Error("Failed to fetch course overview");

                const modulesJson = await modulesRes.json();
                const overviewJson = await overviewRes.json();

                setModules(modulesJson?.data ?? []);
                setResources(overviewJson?.data?.resources ?? []);
                setDescription(overviewJson?.data?.description ?? "");
                setCourseTitle(overviewJson?.data?.title ?? "");
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Failed to load data");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const toYouTubeEmbedUrl = (url?: string | null) => {
        if (!url) return null;

        const regExp = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
        const match = url.match(regExp);

        return match ? `https://www.youtube.com/embed/${match[1]}` : null;
    };

    const isDirectVideoFile = (url?: string | null) => {
        if (!url) return false;
        return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
    };

    // --- Derived values ---
    const firstVideoLesson = modules
        .flatMap((m) => m.lessons ?? [])
        .find((l) => l.type === "VIDEO" && l.videoUrl);

    const embedUrl = toYouTubeEmbedUrl(firstVideoLesson?.videoUrl);
    const directVideoUrl = isDirectVideoFile(firstVideoLesson?.videoUrl)
        ? firstVideoLesson?.videoUrl
        : null;

    const totalDurationMinutes = modules
        .flatMap((m) => m.lessons ?? [])
        .reduce((sum, l) => sum + (l.duration ?? 0), 0);

    const hasVideos = modules.some((m) => m.lessons?.some((l) => l.type === "VIDEO"));
    const hasDocuments = modules.some((m) => m.lessons?.some((l) => l.type === "ARTICLE"));

    return (
        <div className="mt-10">
            <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[3fr_2fr]">
                {/* Left panel */}
                <div className="rounded-xl border border-[#1F8A8A] bg-white shadow-sm">
                    <div className="p-5">
                        {/* Video player */}
                        {embedUrl ? (
                            <iframe
                                src={embedUrl}
                                title={firstVideoLesson?.title || "Course video"}
                                className="w-full rounded-lg aspect-video"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : directVideoUrl ? (
                            <video
                                src={directVideoUrl}
                                controls
                                autoPlay
                                muted
                                loop
                                className="w-full rounded-lg"
                            />
                        ) : (
                            <div className="w-full aspect-video rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                                No video available
                            </div>
                        )}

                        {/* Course meta */}
                        <div className="max-w-4xl mx-auto pt-5">
                            <h1 className="text-3xl font-semibold text-gray-800 py-4">
                                {courseTitle}
                            </h1>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                                <span className="flex items-center gap-1">
                                    <div className="bg-[#E6F6F6] rounded-sm p-1.5 flex items-center justify-center">
                                        <TimerIcon size={18} className="text-[#83C0C0]" />
                                    </div>
                                    {totalDurationMinutes} mins total
                                </span>
                                <span className="flex items-center gap-1">
                                    <div className="bg-[#FEF5E6] rounded-sm p-1.5 flex items-center justify-center">
                                        <BookOpen size={18} className="text-[#D08933]" />
                                    </div>
                                    {modules.length} modules
                                </span>
                                <span className="flex items-center gap-1">
                                    <div className="bg-[#F8E9C7] rounded-sm p-1.5 flex items-center justify-center">
                                        <PlaySquareIcon size={18} className="text-[#E9BC55]" />
                                    </div>
                                    {hasVideos ? "Contains videos" : "No videos"}
                                </span>
                                <span className="flex items-center gap-1">
                                    <div className="bg-[#F8E9C7] rounded-sm p-1.5 flex items-center justify-center">
                                        <PlaySquareIcon size={18} className="text-[#E9BC55]" />
                                    </div>
                                    {hasDocuments ? "Contains documents" : "No documents"}
                                </span>
                            </div>

                            <button className="mb-8 rounded-lg bg-emerald-900 px-4 py-2 text-sm text-white hover:scale-105 cursor-pointer transition-all duration-200">
                                Start learning
                            </button>
                        </div>

                        {/* Tabs */}
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

                        {/* Modules tab */}
                        {activeTab === "modules" && (
                            <>
                                {loading && <p className="p-4 text-sm text-gray-500">Loading modules...</p>}
                                {error && <p className="p-4 text-sm text-red-500">{error}</p>}
                                {!loading && !error && modules.length === 0 && (
                                    <p className="p-4 text-sm text-gray-500">No modules found.</p>
                                )}
                                {!loading && !error && modules.map((module) => (
                                    <ModuleCard key={module.id} module={module} />
                                ))}
                            </>
                        )}

                        {/* Description tab */}
                        {activeTab === "description" && (
                            <div className="border border-[#1F8A8A] rounded-lg overflow-hidden mt-5">
                                {description
                                    ? <CourseDescription description={description} />
                                    : <p className="p-4 text-sm text-gray-500">No description available.</p>
                                }
                            </div>
                        )}
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
                            {loading && <p className="p-4 text-sm text-gray-500">Loading resources...</p>}
                            {!loading && resources.length === 0 && (
                                <p className="p-4 text-sm text-gray-500">No resources available.</p>
                            )}
                            {resources.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between rounded-xl border border-[#1F8A8A] bg-white py-3 px-5 my-4 mx-4 space-x-2"
                                >
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-medium text-gray-800">{item.title}</p>
                                        <p className="text-xs text-[#E4AE2F]">{item.type}</p>
                                    </div>
                                    
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm bg-[#1E4A39] text-white px-4 py-2 min-w-20 rounded-lg cursor-pointer hover:scale-105 transition-all duration-200 text-center"
                                    >
                                        Open
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Live sessions */}
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
                            <p className="text-sm text-gray-500">No upcoming sessions.</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}