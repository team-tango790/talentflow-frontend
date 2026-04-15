"use client";

import { useEffect, useState } from "react";
import SideBar from "@/components/sidebar";
import Modules from "@/components/modules";
import { ArrowUpRight } from "lucide-react";
import Navbar from "@/components/navbar";
import { BASE_URL, getHeaders } from "@/lib/api";

/* ════════════════════════════════════
   TYPES
════════════════════════════════════ */
interface Enrollment {
    courseId: string;
    status: string;
    progress: number;
    completedAt: string | null;
    averageGrade: number | null;
    course: {
        id: string;
        title: string;
        description: string;
        duration: number;
        level: string;
        track: string;
        modules: { id: string; title: string; order: number }[];
    };
}

interface CourseProgress {
    status: string;
    overallProgress: number;
    completedAt: string | null;
    averageGrade: number | null;
    modules: {
        moduleId: string;
        title: string;
        completedLessons: number;
        totalLessons: number;
        progress: number;
    }[];
}

const ENROLLMENT_STATUS_LABEL: Record<string, string> = {
    NOT_STARTED: "Not started",
    IN_PROGRESS: "Currently enrolled",
    COMPLETED: "Completed",
    DROPPED: "Enrollment ended",
};

/* ════════════════════════════════════
   MAIN PAGE
════════════════════════════════════ */
export default function Learning() {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);
    const [loading, setLoading] = useState(true);
    const [progressLoading, setProgressLoading] = useState(false);
    const [error, setError] = useState("");

    // ── 1. Load all enrollments ──
    useEffect(() => {
        async function loadEnrollments() {
            try {
                setLoading(true);
                const res = await fetch(`${BASE_URL}/api/enrollments`, { headers: getHeaders() });
                if (!res.ok) throw new Error(`Failed to load enrollments (${res.status})`);
                const json = await res.json();
                const data: Enrollment[] = json?.data ?? json ?? [];
                setEnrollments(data);

                // Auto-select the active IN_PROGRESS course, or first enrollment
                const active = data.find(e => e.status === "IN_PROGRESS") ?? data[0];
                if (active) setSelectedCourseId(active.courseId);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Failed to load courses");
            } finally {
                setLoading(false);
            }
        }
        loadEnrollments();
    }, []);

    // ── 2. Load progress for selected course ──
    useEffect(() => {
        if (!selectedCourseId) return;
        async function loadProgress() {
            setProgressLoading(true);
            try {
                const res = await fetch(
                    `${BASE_URL}/api/courses/${selectedCourseId}/progress`,
                    { headers: getHeaders() }
                );
                if (!res.ok) return;
                const json = await res.json();
                setCourseProgress(json?.data ?? null);
            } catch {
                // progress is optional — fail silently
            } finally {
                setProgressLoading(false);
            }
        }
        loadProgress();
    }, [selectedCourseId]);

    const selectedEnrollment = enrollments.find(e => e.courseId === selectedCourseId);
    const course = selectedEnrollment?.course;
    const progress = courseProgress?.overallProgress ?? selectedEnrollment?.progress ?? 0;
    const totalModules = course?.modules?.length ?? 0;
    const completedModules = courseProgress?.modules?.filter(m => m.progress === 100).length ?? 0;
    const completedLessons = courseProgress?.modules?.reduce((s, m) => s + m.completedLessons, 0) ?? 0;
    const totalLessons = courseProgress?.modules?.reduce((s, m) => s + m.totalLessons, 0) ?? 0;
    const averageGrade = courseProgress?.averageGrade ?? selectedEnrollment?.averageGrade;
    const enrollmentLabel = ENROLLMENT_STATUS_LABEL[selectedEnrollment?.status ?? ""] ?? "Currently enrolled";

    return (
        <div>
            <main className="w-fill flex">
                <SideBar />

                <section className="w-full min-h-screen bg-white">
                    <Navbar />

                    <div className="px-15 mx-auto max-w-6xl py-8">

                        {/* ── Loading ── */}
                        {loading && (
                            <div className="rounded-lg bg-gray-100 p-4 text-sm text-gray-600 animate-pulse">
                                Loading your courses...
                            </div>
                        )}

                        {/* ── Error ── */}
                        {error && (
                            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>
                        )}

                        {/* ── Course selector — only show if more than 1 enrollment ── */}
                        {!loading && enrollments.length > 1 && (
                            <div className="mb-6">
                                <p className="text-sm text-gray-500 mb-2 font-medium">Your enrolled courses</p>
                                <div className="flex flex-wrap gap-3">
                                    {enrollments.map(enrollment => (
                                        <button
                                            key={enrollment.courseId}
                                            onClick={() => setSelectedCourseId(enrollment.courseId)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${selectedCourseId === enrollment.courseId
                                                    ? "bg-[#1E4A39] text-white border-[#1E4A39]"
                                                    : "bg-white text-gray-700 border-gray-200 hover:border-[#1E4A39]"
                                                }`}
                                        >
                                            {enrollment.course.title}
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${enrollment.status === "COMPLETED"
                                                    ? "bg-green-100 text-green-700"
                                                    : enrollment.status === "IN_PROGRESS"
                                                        ? "bg-amber-100 text-amber-700"
                                                        : "bg-gray-100 text-gray-500"
                                                }`}>
                                                {enrollment.progress}%
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── No enrollments ── */}
                        {!loading && !error && enrollments.length === 0 && (
                            <div className="text-center py-20">
                                <div className="text-5xl mb-4">📚</div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">No courses yet</h3>
                                <p className="text-gray-500 text-sm">You haven&apos;t been enrolled in any course yet. Contact your admin.</p>
                            </div>
                        )}

                        {/* ── Course overview card ── */}
                        {!loading && !error && selectedEnrollment && course && (
                            <div className="bg-[#1E4A39] p-5 rounded-lg mb-0">
                                <div className="grid lg:grid-cols-[2fr_1fr]">
                                    <div>
                                        <a href="#" className="text-xs">
                                            <div className="flex items-center gap-1.5 text-[#E9BD55]/90 group">
                                                {enrollmentLabel}
                                                <ArrowUpRight size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                            </div>
                                        </a>

                                        <p className="text-xl font-semibold pt-2 text-white">{course.title}</p>

                                        <div className="flex items-center space-x-3 pt-2 text-xs text-[#E9BD55]/90">
                                            <p>{totalModules} modules</p>
                                            <p>{course.description?.slice(0, 60)}{course.description?.length > 60 ? "…" : ""}</p>
                                            <p>{course.duration}hr</p>
                                        </div>

                                        <div className="pt-6 text-xl font-semibold text-white">
                                            <p>{progressLoading ? "—" : `${progress}%`}</p>
                                        </div>

                                        <div className="pt-2 text-xs text-[#E9BD55]/90">
                                            <p>Overall completion</p>
                                        </div>

                                        <div className="bg-gray-400 rounded-full h-2 mt-2 max-w-100">
                                            <div
                                                className="bg-[#E9BD55] h-2 rounded-full transition-all duration-500 ease-out"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Stats grid */}
                                    <div className="grid grid-cols-2 gap-2 lg:mt-0 mt-5">
                                        <div className="text-center px-2 py-4 rounded-2xl border border-[#C97A1A] bg-[#FEF5E6] text-[#C97A1A] space-y-1 flex items-center justify-center min-h-[80px]">
                                            <div>
                                                <div className="text-xl font-bold">{completedLessons}</div>
                                                <p className="text-xs">Lessons completed</p>
                                            </div>
                                        </div>

                                        <div className="text-center px-2 py-4 rounded-2xl bg-[#FEF5E6] text-[#C97A1A] space-y-1 flex items-center justify-center min-h-[80px]">
                                            <div>
                                                <div className="text-xl font-bold">{course.duration}hr</div>
                                                <p className="text-xs">Course duration</p>
                                            </div>
                                        </div>

                                        <div className="text-center px-2 py-4 rounded-2xl bg-[#FEF5E6] text-[#C97A1A] space-y-1 flex items-center justify-center min-h-[80px]">
                                            <div>
                                                <div className="text-xl font-bold">
                                                    {averageGrade != null ? `${averageGrade}%` : "N/A"}
                                                </div>
                                                <p className="text-xs">Average grade</p>
                                            </div>
                                        </div>

                                        <div className="text-center px-2 py-4 rounded-2xl bg-[#FEF5E6] text-[#C97A1A] space-y-1 flex items-center justify-center min-h-[80px]">
                                            <div>
                                                <div className="text-xl font-bold">{totalModules - completedModules}</div>
                                                <p className="text-xs">Modules remaining</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Modules panel — passes courseId down ── */}
                        {!loading && selectedCourseId && (
                            <Modules courseId={selectedCourseId} />
                        )}

                    </div>
                </section>
            </main>
        </div>
    );
}