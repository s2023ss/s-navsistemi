export interface Profile {
  id: string;
  full_name: string | null;
  role: 'user' | 'admin';
  created_at: string;
}

// New hierarchy types
export interface Class {
  id: number;
  name: string;
  created_at: string;
  courses: Course[];
}


export interface Course {
  id: number;
  class_id: number;
  name: string;
  created_at: string;
  units: Unit[];
}

export interface Unit {
  id: number;
  course_id: number;
  name: string;
  created_at: string;
  topics: Topic[];
}

export interface Topic {
  id: number;
  unit_id: number;
  name: string;
  description: string | null;
  created_at: string;
  tests: Test[];
}

export interface Test {
  id: number;
  topic_id: number;
  name: string;
  description: string | null;
  created_at: string;
  questions: Question[]; // Questions are nested within tests now
}

export interface Tag {
  id: number;
  name: string;
}


// Modified types
export interface Option {
  id: number;
  question_id: number;
  option_text: string;
  is_correct: boolean;
}

export interface Question {
  id: number;
  // test_id is removed as questions are now in a central bank
  question_text: string;
  created_at: string;
  options: Option[];
}

export interface TestAttempt {
  id: number;
  user_id: string;
  test_id: number; // Was subject_id
  score: number;
  created_at: string;
  tests: { // Was subjects
    name: string;
  };
}

export interface UserAnswer {
  id: number;
  attempt_id: number;
  question_id: number;
  selected_option_id: number;
  is_correct: boolean;
}

export interface ResultDetail {
  question: Question;
  userAnswer: UserAnswer;
}