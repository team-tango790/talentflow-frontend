export type Lesson = {
    id: string;
    title: string;
    content: string | null;
    videoUrl: string | null;
    moduleId: string;
    order: number;
    type: "VIDEO" | "ARTICLE" | string;
    duration: number;
    isCompleted?: boolean;
};

export type Module = {
    id: string;
    title: string;
    courseId: string;
    order: number;
    isLocked: boolean;
    lessons: Lesson[];
    completedCount: number;
    totalCount: number;
};

export type Resource = {
    id: string;
    title: string;
    url: string;
    type: string;
};