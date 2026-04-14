import { Module } from "@/types/course";

type CourseDescriptionProps = {
    description?: string | null;
    modules?: Module[];
};

const chipStyles = [
    "bg-[#FDF0EE] text-[#DD6353]",
    "bg-[#E6F6F6] text-[#1F8A8A]",
    "bg-[#E6F6F6] text-[#1F8A8A]",
    "bg-[#F8E9C7] text-[#E4AE2F]",
    "bg-[#F8E9C7] text-[#E4AE2F]",
];

export default function CourseDescription({
    description,
    modules = [],
    }: CourseDescriptionProps) {
    const learningPoints = Array.from(
        new Set([
        ...modules.map((module) => module.title).filter(Boolean),
        ...modules.flatMap((module) =>
            (module.lessons || []).map((lesson) => lesson.title).filter(Boolean)
        ),
        ])
    ).slice(0, 5);

    return (
        <div className="p-4 bg-white">
        <p className="text-gray-700 text-sm" style={{ whiteSpace: "pre-line" }}>
            {description || "No course description available."}
        </p>

        <div className="text-black font-bold pt-5">
            <h3>What you'll learn</h3>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-3">
            {learningPoints.length > 0 ? (
            learningPoints.map((item, index) => (
                <div
                key={`${item}-${index}`}
                className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${
                    chipStyles[index % chipStyles.length]
                }`}
                >
                {item}
                </div>
            ))
            ) : (
            <div className="text-sm text-gray-500">
                No learning points available yet.
            </div>
            )}
        </div>
        </div>
    );
}