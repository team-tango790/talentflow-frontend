"use client";

import { useEffect, useState } from "react";
import SideBar from "@/components/sidebar";
import Modules from "@/components/modules";
import { ArrowUpRight } from "lucide-react";
import Navbar from "@/components/navbar";

const API_BASE_URL = "https://talentflow-backend-production.up.railway.app";

type OverviewModule = {
    id: string;
    title: string;
    completedCount: number;
    totalCount: number;
};

type CourseProgress = {
    status?: string;
    overallProgress?: number;
    completedAt?: string | null;
};

type CourseOverviewApiResponse = {
    success: boolean;
    data: {
        id: string;
        title: string;
        description: string;
        duration: number;
        modules: OverviewModule[];
        _count: {
        enrollments: number;
        };
        learnerEnrollment: {
        enrollmentId: string;
        progress: number;
        status: string;
        completedAt: string | null;
        };
    };
};

type ProgressModule = {
    moduleId: string;
    title: string;
    order: number;
    isLocked: boolean;
    completedLessons: number;
    totalLessons: number;
    progress: number;
};

type CourseProgressApiResponse = {
    success: boolean;
    data: {
        courseId: string;
        courseTitle: string;
        overallProgress: number;
        status: string;
        averageGrade: number | null;
        completedAt: string | null;
        modules: ProgressModule[];
    };
};

type CourseDetail = {
    title: string;
    course: string;
    total_modules: string;
    total_time: string;
    modules: string;
    remaining: string;
    time: string;
    grade: string;
    progress: string;
};

async function apiFetch<T>(endpoint: string): Promise<T> {
    const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "GET",
        headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(
        data?.message || `Request failed with status ${response.status}`,
        );
    }

    return data;
}

async function getCourseOverview(courseId: string) {
    return apiFetch<CourseOverviewApiResponse>(
        `/api/courses/${courseId}/overview`,
    );
}

async function getCourseProgress(courseId: string) {
    return apiFetch<CourseProgressApiResponse>(
        `/api/courses/${courseId}/progress`,
    );
}

export default function Learning() {
    const [courseDetails, setCourseDetails] = useState<CourseDetail[]>([]);
    const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(
        null,
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // This is the course id currently used in Postman for both endpoints
    const courseId = "3dbcbb6e-779e-4ac5-a240-82ec1075e386";

    const enrollmentLabelMap: Record<string, string> = {
        NOT_STARTED: "Not started",
        IN_PROGRESS: "Currently enrolled",
        COMPLETED: "Completed",
        DROPPED: "Enrollment ended",
    };

    const enrollmentLabel =
        enrollmentLabelMap[courseProgress?.status ?? ""] ?? "Currently enrolled";

    useEffect(() => {
        async function loadCourseData() {
        try {
            setLoading(true);
            setError("");

            const [overviewRes, progressRes] = await Promise.all([
            getCourseOverview(courseId),
            getCourseProgress(courseId),
            ]);

            const overview = overviewRes.data;
            const progress = progressRes.data;

            const totalModules = overview.modules.length;

            const completedModules = progress.modules.filter(
            (module) => module.progress === 100,
            ).length;

            const remainingModules = totalModules - completedModules;

            const totalLessonsCompleted = progress.modules.reduce(
            (sum, module) => sum + module.completedLessons,
            0,
            );

            const totalLessons = progress.modules.reduce(
            (sum, module) => sum + module.totalLessons,
            0,
            );

            const averageGrade = progress.averageGrade ?? 0;

            const mappedData: CourseDetail[] = [
            {
                title: overview.title,
                course: overview.description,
                total_modules: String(totalModules),
                total_time: String(overview.duration),
                modules: String(totalLessonsCompleted),
                remaining: String(remainingModules),
                time: String(overview.duration),
                grade: averageGrade ? `${averageGrade}%` : "N/A",
                progress: `${progress.overallProgress}%`,
            },
            ];

            setCourseProgress({
            status: progress.status,
            overallProgress: progress.overallProgress,
            completedAt: progress.completedAt,
            });

            setCourseDetails(mappedData);
        } catch (err: any) {
            setError(err.message || "Failed to load course data");
        } finally {
            setLoading(false);
        }
        }

        loadCourseData();
    }, []);

    return (
        <div>
        <main className="w-fill flex">
            <SideBar />

            <section className="w-full min-h-screen bg-white">
            <Navbar />

            <div className="px-15 mx-auto max-w-6xl py-8">
                {loading && (
                <div className="rounded-lg bg-gray-100 p-4 text-sm text-gray-600">
                    Loading course details...
                </div>
                )}

                {error && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
                    {error}
                </div>
                )}

                {!loading &&
                !error &&
                courseDetails.map((detail) => (
                    <div className="bg-[#1E4A39] p-5 rounded-lg" key={detail.title}>
                    <div className="grid lg:grid-cols-[2fr_1fr]">
                        <div>
                        <a href="#" className="text-xs">
                            <div className="flex items-center gap-1.5 text-[#E9BD55]/90 group">
                            {enrollmentLabel}
                            <ArrowUpRight
                                size={20}
                                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                            />
                            </div>
                        </a>

                        <p className="text-xl font-semibold pt-2">
                            {detail.title}
                        </p>

                        <div className="flex items-center space-x-3 pt-2 text-xs text-[#E9BD55]/90">
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

                        <div className="bg-gray-400 rounded-full h-2 mt-2 max-w-100">
                            <div
                            className="bg-[#E9BD55] h-2 rounded-full transition-all duration-500 ease-out"
                            style={{ width: detail.progress }}
                            />
                        </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 lg:mt-0 mt-5">
                        <div className="text-center px-2 py-4 rounded-2xl border border-[#C97A1A] bg-[#FEF5E6] text-[#C97A1A] space-y-1 flex items-center justify-center min-h-[80]">
                            <div>
                            <div className="text-xl font-bold">
                                {detail.modules}
                            </div>
                            <p className="text-xs">Modules completed</p>
                            </div>
                        </div>

                        <div className="text-center px-2 py-4 rounded-2xl bg-[#FEF5E6] text-[#C97A1A] space-y-1 flex items-center justify-center min-h-[80]">
                            <div>
                            <div className="text-xl font-bold">
                                {detail.time}hr
                            </div>
                            <p className="text-xs">Course duration</p>
                            </div>
                        </div>

                        <div className="text-center px-2 py-4 rounded-2xl bg-[#FEF5E6] text-[#C97A1A] space-y-1 flex items-center justify-center min-h-[80]">
                            <div>
                            <div className="text-xl font-bold">
                                {detail.grade}
                            </div>
                            <p className="text-xs">Average grade</p>
                            </div>
                        </div>

                        <div className="text-center px-2 py-4 rounded-2xl bg-[#FEF5E6] text-[#C97A1A] space-y-1 flex items-center justify-center min-h-[80]">
                            <div>
                            <div className="text-xl font-bold">
                                {detail.remaining}
                            </div>
                            <p className="text-xs">Modules uncompleted</p>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                ))}

                <Modules />
            </div>
            </section>
        </main>
        </div>
    );
}
