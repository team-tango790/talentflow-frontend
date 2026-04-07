import { BookOpen, PlaySquareIcon } from "lucide-react";

type Module = {
    title: string;
    tag1: string;
    tag2: string;
};

type ModuleCardProps = {
    module: Module;
};

export default function ModuleCard({ module }: ModuleCardProps) {
    return (
        <div className="flex justify-between items-center p-4 border-b border-[#1F8A8A] last:border-b-0 bg-white">
        <div>
            <p className="text-sm text-gray-500">Module 1</p>
            <h3 className="font-semibold text-gray-800">{module.title}</h3>

            <div className="flex gap-2 mt-2">
            <span className="bg-[#F8E9C7] text-[#E4AE2F] text-xs px-3 py-1 rounded-full flex items-center gap-1">
                <PlaySquareIcon size={16} /> {module.tag1}
            </span>
            <span className="bg-[#E6F6F6] text-[#51A5A5] text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <BookOpen size={16} /> {module.tag2}
            </span>
            </div>
        </div>

        <button className="rounded-lg bg-emerald-900 px-4 py-2 text-sm text-white hover:scale-105 cursor-pointer transition-all duration-200">
            Start learning
        </button>
        </div>
    );
}