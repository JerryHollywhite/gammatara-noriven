// Helper function to group lessons by subject
export const groupLessonsBySubject = (lessons: any[]) => {
    const grouped: { [key: string]: any[] } = {};

    lessons.forEach((lesson) => {
        const subjectName = lesson.subjectName || 'General';
        if (!grouped[subjectName]) {
            grouped[subjectName] = [];
        }
        grouped[subjectName].push(lesson);
    });

    return grouped;
};
