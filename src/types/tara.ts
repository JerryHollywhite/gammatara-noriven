export interface Program {
    id: string; // e.g., "TK", "SD"
    name: string;
    description: string;
    active: boolean;
}

export interface Subject {
    id: string; // e.g., "SD_MATH"
    programId: string; // FK to Program.id
    name: string;
    description: string;
    imageUrl?: string;
}

export interface Lesson {
    id: string; // e.g., "L_001"
    subjectId: string; // FK to Subject.id
    title: string;
    description: string;
    videoDriveId?: string; // Optional: Some lessons might only be text/pdf
    pdfDriveId?: string;
    order: number;
}

export interface QuizQuestion {
    id: string; // e.g., "Q_001"
    lessonId: string; // FK to Lesson.id
    questionType: 'MCQ' | 'TRUE_FALSE' | 'TEXT';
    questionText: string;
    options?: {
        A: string;
        B: string;
        C?: string;
        D?: string;
    };
    correctAnswer: string; // "A", "True", etc.
    explanation?: string;
}

// Composite type for a full Course view (Subject + Lessons)
export interface CourseDetail extends Subject {
    lessons: Lesson[];
}
