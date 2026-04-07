type course = {
    body: string;
};

type CourseDescription = {
    course: course;
};

export default function CourseDescription({ course }: CourseDescription) {
    return (
        <div className="p-4 bg-white">
            <p className="text-gray-700 text-sm" style={{ whiteSpace: "pre-line" }}>
                {course.body}
            </p>
            <div className="text-black font-bold pt-5">
                <h3>What you'll learn</h3>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-3">
                <div className="bg-[#FDF0EE] text-[#DD6353] text-xs px-3 py-1 rounded-full whitespace-nowrap">
                    Empathy mapping
                </div>
                <div className="bg-[#E6F6F6] text-[#1F8A8A] text-xs px-3 py-1 rounded-full whitespace-nowrap">
                    Design thinking
                </div>
                <div className="bg-[#E6F6F6] text-[#1F8A8A] text-xs px-3 py-1 rounded-full whitespace-nowrap">
                    Prototyping
                </div>
                <div className="bg-[#F8E9C7] text-[#E4AE2F] text-xs px-3 py-1 rounded-full whitespace-nowrap">
                    User journey mapping
                </div>
                <div className="bg-[#F8E9C7] text-[#E4AE2F] text-xs px-3 py-1 rounded-full whitespace-nowrap">
                    Design iteration
                </div>
            </div>
        </div>
    );
}
