export type CareerStage =
  | '18-24 Primer empleo'
  | '25-39 Cambio de área'
  | '40+ Reinserción laboral';

export type TargetRole =
  | 'Atención al cliente'
  | 'Ventas y comercio'
  | 'Auxiliar administrativo'
  | 'Logística y bodega'
  | 'Tecnología y soporte'
  | 'Otro';

export type LessonId = 'leccion-1' | 'leccion-2';
export type StepType = 'diagnostic' | 'practice' | 'final';

export interface UserProfile {
  nickname: string; // Optional; default to "Participante" if blank
  stage: CareerStage;
  targetRole: TargetRole;
  customRole?: string; // Used when targetRole === 'Otro'
}

export interface CriterionEvaluation {
  passed: boolean;
  label: string;
  comment: string; // Max 1 short sentence explaining why it passed or what is missing
}

export interface EvaluationResult {
  part1: CriterionEvaluation;
  part2: CriterionEvaluation;
  part3: CriterionEvaluation;
  score: number; // 0, 1, 2, or 3 (exact count of passed criteria)
  feedback: string; // Warm, direct 2-3 sentence coaching feedback (NEVER rewrites the answer)
  retryHint: string; // 1 concrete question or prompt to help the user improve on retry
}

export interface LessonProgress {
  lessonId: LessonId;
  completed: boolean;
  diagnosticAnswer?: string;
  diagnosticEval?: EvaluationResult;
  finalAnswer?: string;
  finalEval?: EvaluationResult;
  completedAt?: string;
}

export interface FormulaPart {
  id: 'part1' | 'part2' | 'part3';
  title: string;
  subtitle: string;
  tip: string;
}

export interface DrillQuestion {
  id: string;
  candidateResponse: string;
  missingPart: 'part1' | 'part2' | 'part3';
  explanation: string;
}

export interface LessonVideo {
  src: string;
  title: string;
  subtitle: string;
  durationLabel?: string;
}

export interface LessonConfig {
  id: LessonId;
  number: 1 | 2;
  accentColor: 'emerald' | 'coral';
  title: string;
  shortSubtitle: string;
  competence: string;
  estimatedMinutes: string;
  formulaName: string;
  video?: LessonVideo;
  formulaParts: [FormulaPart, FormulaPart, FormulaPart];
  weakExample: { text: string; whyWeak: string };
  strongExample: { text: string; breakdown: [string, string, string] };
  drills: [DrillQuestion, DrillQuestion, DrillQuestion];
  diagnosticQuestionTemplate: string;
  practiceQuestionTemplate: string;
  finalQuestionTemplate: string;
}

export interface EvaluateRequest {
  lessonId: LessonId;
  stepType: StepType;
  targetRole: string;
  stage: string;
  question: string;
  userAnswer: string;
  attemptNumber?: number;
}
