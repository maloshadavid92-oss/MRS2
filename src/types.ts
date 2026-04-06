export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface Student {
  id: string;
  name: string;
  regNumber: string;
  form: string; // e.g., 'Form 1', 'Form 2'
  stream: string; // e.g., 'A', 'B'
}

export interface Result {
  studentId: string;
  subjectId: string;
  score: number;
  term: string; // e.g., 'Term 1', 'Term 2'
  year: number;
}

export interface StudentPerformance {
  student: Student;
  results: {
    subjectName: string;
    score: number;
    grade: Grade;
  }[];
  average: number;
  totalMarks: number;
  division: string;
  rank?: number;
}

export const SUBJECTS: Subject[] = [
  { id: '1', name: 'Mathematics', code: 'MATH' },
  { id: '2', name: 'English', code: 'ENGL' },
  { id: '3', name: 'Kiswahili', code: 'KISW' },
  { id: '4', name: 'Biology', code: 'BIOL' },
  { id: '5', name: 'Chemistry', code: 'CHEM' },
  { id: '6', name: 'Physics', code: 'PHYS' },
  { id: '7', name: 'History', code: 'HIST' },
  { id: '8', name: 'Geography', code: 'GEOG' },
  { id: '9', name: 'Civics', code: 'CIVI' },
];

export const calculateGrade = (score: number): Grade => {
  if (score >= 75) return 'A';
  if (score >= 65) return 'B';
  if (score >= 45) return 'C';
  if (score >= 30) return 'D';
  return 'F';
};

export const calculatePoints = (grade: Grade): number => {
  switch (grade) {
    case 'A': return 1;
    case 'B': return 2;
    case 'C': return 3;
    case 'D': return 4;
    case 'F': return 5;
    default: return 5;
  }
};
