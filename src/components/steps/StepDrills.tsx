'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { LessonConfig } from '@/types';

interface StepDrillsProps {
  lesson: LessonConfig;
  onNext: () => void;
}

export function StepDrills({ lesson, onNext }: StepDrillsProps) {
  const [drillIndex, setDrillIndex] = useState(0);
  const [selectedPart, setSelectedPart] = useState<
    'part1' | 'part2' | 'part3' | null
  >(null);

  const drills = lesson.drills;
  const currentDrill = drills[drillIndex];
  const isLastDrill = drillIndex === drills.length - 1;
  const isAnswered = selectedPart !== null;
  const isCorrect = selectedPart === currentDrill.missingPart;

  function handleSelect(partId: 'part1' | 'part2' | 'part3') {
    if (isAnswered) return;
    setSelectedPart(partId);
  }

  function handleContinue() {
    if (isLastDrill) {
      onNext();
      return;
    }
    setSelectedPart(null);
    setDrillIndex((prev) => prev + 1);
  }

  return (
    <div className="animate-fade-slide space-y-6">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center rounded-full bg-[#F0FAF5] px-3 py-1 text-xs font-bold text-[#046C4E]">
          Paso 3 · Detecta el error
        </span>
        <span className="text-xs font-bold text-[#5B6B65]">
          Ejercicio {drillIndex + 1} de {drills.length}
        </span>
      </div>

      {/* Candidate sample quote */}
      <div
        key={currentDrill.id}
        className="animate-fade-slide rounded-3xl border border-[#DDEAE4] bg-[#F0FAF5] p-5 sm:p-6 space-y-2"
      >
        <p className="text-xs font-bold uppercase tracking-wide text-[#046C4E]">
          Respuesta de ejemplo
        </p>
        <p className="text-base sm:text-lg leading-relaxed text-[#10231C]">
          &ldquo;{currentDrill.candidateResponse}&rdquo;
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg sm:text-xl font-extrabold text-[#10231C]">
          ¿Qué parte de la fórmula le falta a esta respuesta?
        </h2>

        <div className="space-y-2.5">
          {lesson.formulaParts.map((part, idx) => {
            const isSelected = selectedPart === part.id;
            const isRightOption = currentDrill.missingPart === part.id;

            let buttonStyle =
              'border-[#DDEAE4] bg-[#FFFFFF] text-[#10231C] hover:border-[#0E9F6E] hover:bg-[#F0FAF5]/50';

            if (isAnswered) {
              if (isRightOption) {
                buttonStyle =
                  'border-[#0E9F6E] bg-[#A7F3D0]/35 text-[#046C4E]';
              } else if (isSelected && !isRightOption) {
                buttonStyle =
                  'border-[#DC2626] bg-[#DC2626]/10 text-[#DC2626]';
              } else {
                buttonStyle =
                  'border-[#DDEAE4] bg-[#FFFFFF] text-[#5B6B65] opacity-60';
              }
            }

            return (
              <button
                key={part.id}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelect(part.id)}
                className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left font-semibold transition-all duration-150 ${
                  !isAnswered ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'
                } ${buttonStyle}`}
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current/25 text-xs font-extrabold">
                    {idx + 1}
                  </span>
                  <span className="text-sm sm:text-base">{part.title}</span>
                </span>

                {isAnswered && isRightOption && (
                  <CheckCircle2
                    className="h-5 w-5 shrink-0 text-[#046C4E]"
                    strokeWidth={2.4}
                  />
                )}
                {isAnswered && isSelected && !isRightOption && (
                  <XCircle
                    className="h-5 w-5 shrink-0 text-[#DC2626]"
                    strokeWidth={2.4}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Instant Feedback Card */}
      {isAnswered && (
        <div
          className={`animate-fade-slide rounded-3xl border p-5 space-y-4 ${
            isCorrect
              ? 'border-[#A7F3D0] bg-[#A7F3D0]/40'
              : 'border-[#DC2626]/30 bg-[#DC2626]/10'
          }`}
        >
          <div className="flex items-start gap-3">
            {isCorrect ? (
              <CheckCircle2
                className="mt-0.5 h-5 w-5 shrink-0 text-[#046C4E]"
                strokeWidth={2.4}
              />
            ) : (
              <XCircle
                className="mt-0.5 h-5 w-5 shrink-0 text-[#DC2626]"
                strokeWidth={2.4}
              />
            )}
            <div>
              <p
                className={`text-sm sm:text-base font-extrabold ${
                  isCorrect ? 'text-[#046C4E]' : 'text-[#DC2626]'
                }`}
              >
                {isCorrect ? '¡Exacto! Buen ojo.' : 'Casi. Revisa este detalle:'}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[#10231C]">
                {currentDrill.explanation}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleContinue}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0E9F6E] px-6 py-3.5 text-base font-semibold text-white shadow-[0_6px_20px_rgb(14,159,110,0.2)] hover:bg-[#046C4E] active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <span>
              {isLastDrill ? 'Practicar con mi propia respuesta' : 'Siguiente'}
            </span>
            <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
          </button>
        </div>
      )}
    </div>
  );
}
