'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopNavbar } from '@/components/TopNavbar';
import { StepDiagnostic } from '@/components/steps/StepDiagnostic';
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

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [sessionDiagnosticEval, setSessionDiagnosticEval] = useState<
    EvaluationResult | undefined
  >(undefined);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

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
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col">
      <TopNavbar
        mode="lesson"
        currentStep={step}
        totalSteps={5}
        onExitLesson={() => router.push('/')}
      />

      <main className="flex-1 mx-auto w-full max-w-xl px-4 py-6 sm:py-10">
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

            {step === 1 && (
              <StepDiagnostic
                lesson={lesson}
                profile={activeProfile}
                role={role}
                onComplete={handleDiagnosticComplete}
                onNext={() => setStep(2)}
              />
            )}

            {step === 2 && (
              <StepMicroLesson lesson={lesson} onNext={() => setStep(3)} />
            )}

            {step === 3 && (
              <StepDrills lesson={lesson} onNext={() => setStep(4)} />
            )}

            {step === 4 && (
              <StepPractice
                lesson={lesson}
                profile={activeProfile}
                role={role}
                onNext={() => setStep(5)}
              />
            )}

            {step === 5 && (
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
