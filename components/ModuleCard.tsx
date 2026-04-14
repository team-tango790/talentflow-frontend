import { BookOpen, PlaySquareIcon, Lock } from "lucide-react";

type Lesson = {
    id: string;
    type: "VIDEO" | "ARTICLE" | string;
};

type ModuleCardProps = {
    module: {
        id: string;
        title: string;
        order: number;
        isLocked: boolean;
        lessons: Lesson[];
        totalCount: number;
    };
};

export default function ModuleCard({ module }: ModuleCardProps) {
    const videoCount = module.lessons?.filter((l) => l.type === "VIDEO").length ?? 0;
    const articleCount = module.lessons?.filter((l) => l.type === "ARTICLE").length ?? 0;
    const totalLessons = module.totalCount ?? module.lessons?.length ?? 0;

    return (
        <div className="flex justify-between items-center p-4 border-b border-[#1F8A8A] last:border-b-0 bg-white">
            <div>
                <p className="text-sm text-gray-500">Module {module.order}</p>
                <h3 className="font-semibold text-gray-800">{module.title}</h3>

                <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="bg-[#F8E9C7] text-[#E4AE2F] text-xs px-3 py-1 rounded-full flex items-center gap-1">
                        <PlaySquareIcon size={16} />
                        {videoCount} videos
                    </span>

                    <span className="bg-[#E6F6F6] text-[#51A5A5] text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <BookOpen size={16} />
                        {articleCount} articles
                    </span>

                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                        {totalLessons} lessons
                    </span>

                    {module.isLocked && (
                        <span className="bg-red-50 text-red-600 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <Lock size={14} />
                            Locked
                        </span>
                    )}
                </div>
            </div>

            <button
                disabled={module.isLocked}
                className={`rounded-lg px-4 py-2 text-sm text-white transition-all duration-200 ${
                    module.isLocked
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-emerald-900 hover:scale-105 cursor-pointer"
                }`}
            >
                {module.isLocked ? "Locked" : "Start learning"}
            </button>
        </div>
    );
}