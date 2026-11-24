'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopNavbar } from '@/components/TopNavbar';
import { StepDiagnostic } from '@/components/steps/StepDiagnostic';
import { StepVideo } from '@/components/steps/StepVideo';
import { StepMicroLesson } from '@/components/steps/StepMicroLesson';
import { StepDrills } from '@/components/steps/StepDrills';
import { StepPractice } from '@/components/steps/StepPractice';
import { StepFinalChallenge } from '@/components/steps/StepFinalChallenge';
import { LESSONS } from '@/data/lessons';
import {
  getDisplayRole,
  saveLessonProgress,
  useAllLessonProgress,
  useIsClient,
  useUserProfile,
} from '@/lib/storage';
import { EvaluationResult, LessonId, UserProfile } from '@/types';

interface LessonEngineProps {
  lessonId: LessonId;
}

type LessonStepType =
  | 'diagnostic'
  | 'video'
  | 'micro'
  | 'drills'
  | 'practice'
  | 'final';

const DEFAULT_FALLBACK_PROFILE: UserProfile = {
  nickname: 'Participante',
  stage: '18-24 Primer empleo',
  targetRole: 'Atención al cliente',
};

export function LessonEngine({ lessonId }: LessonEngineProps) {
  const router = useRouter();
  const lesson = LESSONS[lessonId];

  const isClient = useIsClient();
  const savedProfile = useUserProfile();
  const progressMap = useAllLessonProgress();
  const progress = progressMap[lessonId];

  const stepSequence: LessonStepType[] = lesson.video
    ? ['diagnostic', 'video', 'micro', 'drills', 'practice', 'final']
    : ['diagnostic', 'micro', 'drills', 'practice', 'final'];

  const [stepIndex, setStepIndex] = useState(0);
  const [sessionDiagnosticEval, setSessionDiagnosticEval] = useState<
    EvaluationResult | undefined
  >(undefined);

  const activeStep = stepSequence[stepIndex] ?? 'diagnostic';
  const currentStepNumber = stepIndex + 1;
  const totalSteps = stepSequence.length;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [stepIndex]);

  function advanceStep() {
    setStepIndex((prev) => Math.min(stepSequence.length - 1, prev + 1));
  }

  function handleDiagnosticComplete(
    answer: string,
    evaluation: EvaluationResult
  ) {
    setSessionDiagnosticEval(evaluation);
    saveLessonProgress(lessonId, {
      diagnosticAnswer: answer,
      diagnosticEval: evaluation,
    });
  }

  function handleFinalComplete(answer: string, evaluation: EvaluationResult) {
    saveLessonProgress(lessonId, {
      completed: true,
      finalAnswer: answer,
      finalEval: evaluation,
      completedAt: new Date().toISOString(),
    });
  }

  const activeProfile = savedProfile ?? DEFAULT_FALLBACK_PROFILE;
  const role = getDisplayRole(activeProfile);

  return (
    <div className="min-h-dvh bg-[#FFFFFF] flex flex-col">
      <TopNavbar
        mode="lesson"
        currentStep={currentStepNumber}
        totalSteps={totalSteps}
        onExitLesson={() => router.push('/')}
      />

      <main className="flex-1 mx-auto w-full max-w-2xl lg:max-w-3xl px-4 sm:px-6 py-5 sm:py-8 lg:py-10 safe-pb">
        {!isClient ? (
          <div className="space-y-4 py-6 animate-pulse">
            <div className="h-6 w-36 rounded-full bg-[#F0FAF5]" />
            <div className="h-10 w-3/4 rounded-2xl bg-[#F0FAF5]" />
            <div className="h-32 w-full rounded-3xl bg-[#F0FAF5]" />
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-[#5B6B65]">
              <span>Lección {lesson.number}:</span>
              <span className="truncate text-[#10231C]">{lesson.title}</span>
            </div>

            {activeStep === 'diagnostic' && (
              <StepDiagnostic
                lesson={lesson}
                profile={activeProfile}
                role={role}
                nextLabel={lesson.video ? 'Ver video guía' : 'Ver la fórmula'}
                nextHint={
                  lesson.video
                    ? 'Ahora mira un video corto para potenciarlo antes de revisar la fórmula y practicar.'
                    : 'Ahora veamos una fórmula sencilla para potenciarlo. Al final compararemos tu avance real.'
                }
                onComplete={handleDiagnosticComplete}
                onNext={advanceStep}
              />
            )}

            {activeStep === 'video' && lesson.video && (
              <StepVideo
                video={lesson.video}
                stepNumber={currentStepNumber}
                alreadyCompletedBefore={Boolean(progress.completed)}
                onNext={advanceStep}
              />
            )}

            {activeStep === 'micro' && (
              <StepMicroLesson
                lesson={lesson}
                stepNumber={currentStepNumber}
                onNext={advanceStep}
              />
            )}

            {activeStep === 'drills' && (
              <StepDrills
                lesson={lesson}
                stepNumber={currentStepNumber}
                onNext={advanceStep}
              />
            )}

            {activeStep === 'practice' && (
              <StepPractice
                lesson={lesson}
                profile={activeProfile}
                role={role}
                stepNumber={currentStepNumber}
                onNext={advanceStep}
              />
            )}

            {activeStep === 'final' && (
              <StepFinalChallenge
                lesson={lesson}
                profile={activeProfile}
                role={role}
                diagnosticEval={sessionDiagnosticEval ?? progress.diagnosticEval}
                onComplete={handleFinalComplete}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
