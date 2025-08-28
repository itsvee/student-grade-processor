export interface StudentData {
  rank: number;
  studentId: string;
  fullName: string;
  scores: number[];
  subjects: { [subjectCode: string]: boolean };
}

export interface SubjectData {
  subjectCode: string;
  students: {
    studentId: string;
    fullName: string;
  }[];
}

export interface ProcessingProgress {
  currentStep: string;
  completedSteps: number;
  totalSteps: number;
  progress: number;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}