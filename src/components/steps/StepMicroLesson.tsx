'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  XCircle,
} from 'lucide-react';
import { LessonConfig } from '@/types';

interface StepMicroLessonProps {
  lesson: LessonConfig;
  stepNumber?: number;
  onNext: () => void;
}

export function StepMicroLesson({
  lesson,
  stepNumber = 2,
  onNext,
}: StepMicroLessonProps) {
  const [cardIndex, setCardIndex] = useState(0);
  const totalCards = 4; // 3 formula parts + 1 comparison card

  const isComparisonCard = cardIndex === 3;
  const currentPart = !isComparisonCard ? lesson.formulaParts[cardIndex] : null;

  return (
    <div className="animate-fade-slide space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center rounded-full bg-[#F0FAF5] px-3 py-1 text-xs font-bold text-[#046C4E]">
          Paso {stepNumber} · Micro-lección
        </span>
        <span className="text-xs font-semibold text-[#5B6B65]">
          {lesson.formulaName}
        </span>
      </div>

      {/* Dot indicator */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2" aria-label="Tarjetas de la fórmula">
          {[0, 1, 2, 3].map((idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCardIndex(idx)}
              aria-label={`Ir a tarjeta ${idx + 1} de ${totalCards}`}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                idx === cardIndex
                  ? 'w-8 bg-[#0E9F6E]'
                  : idx < cardIndex
                    ? 'w-2.5 bg-[#A7F3D0]'
                    : 'w-2.5 bg-[#DDEAE4]'
              }`}
            />
          ))}
        </div>
        <span className="text-xs font-bold text-[#5B6B65]">
          {cardIndex + 1} / {totalCards}
        </span>
      </div>

      {/* Active Card */}
      {currentPart && (
        <article
          key={currentPart.id}
          className="animate-fade-slide rounded-3xl border border-[#DDEAE4] bg-[#FFFFFF] p-5 sm:p-7 lg:p-8 shadow-[0_8px_30px_rgb(16,35,28,0.06)] space-y-5"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-[#F0FAF5] px-3 py-1 text-xs font-bold text-[#046C4E]">
            <span>Parte {cardIndex + 1} de 3</span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#046C4E]">
              {currentPart.title}
            </h2>
            <p className="mt-3 text-base sm:text-lg leading-relaxed text-[#10231C]">
              {currentPart.subtitle}
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-[#DDEAE4] bg-[#F0FAF5] p-4 sm:p-5">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FBBF24]/25 text-[#10231C]">
              <Lightbulb className="h-4 w-4 text-[#FBBF24]" strokeWidth={2.4} />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-[#046C4E]">
                Tip práctico
              </p>
              <p className="mt-0.5 text-sm sm:text-base leading-relaxed text-[#10231C]">
                {currentPart.tip}
              </p>
            </div>
          </div>
        </article>
      )}

      {isComparisonCard && (
        <article
          key="comparison-card"
          className="animate-fade-slide space-y-4"
        >
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#10231C]">
            Mira la diferencia en acción
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 items-stretch">
            {/* Evita esto */}
            <div className="flex flex-col justify-between rounded-3xl border border-[#DC2626]/30 bg-[#FFFFFF] p-4 sm:p-6 shadow-[0_4px_18px_rgb(16,35,28,0.04)] space-y-3">
              <div className="space-y-2.5">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#DC2626]/10 px-3 py-1 text-xs font-bold text-[#DC2626]">
                  <XCircle className="h-4 w-4" strokeWidth={2.3} />
                  <span>Evita esto</span>
                </div>
                <p className="text-sm sm:text-base italic leading-relaxed text-[#10231C]">
                  &ldquo;{lesson.weakExample.text}&rdquo;
                </p>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-[#5B6B65] pt-1 border-t border-[#DDEAE4]/60">
                <strong className="text-[#DC2626]">Por qué no convence:</strong>{' '}
                {lesson.weakExample.whyWeak}
              </p>
            </div>

            {/* Hazlo así */}
            <div className="flex flex-col rounded-3xl border border-[#A7F3D0] bg-[#F0FAF5] p-4 sm:p-6 shadow-[0_8px_30px_rgb(16,35,28,0.05)] space-y-3.5">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#A7F3D0] px-3 py-1 text-xs font-bold text-[#046C4E]">
                <CheckCircle2 className="h-4 w-4" strokeWidth={2.4} />
                <span>Hazlo así</span>
              </div>
              <p className="text-sm sm:text-base font-medium leading-relaxed text-[#10231C]">
                &ldquo;{lesson.strongExample.text}&rdquo;
              </p>
              <ul className="space-y-2 pt-1">
                {lesson.strongExample.breakdown.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs sm:text-sm leading-relaxed text-[#046C4E]"
                  >
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#0E9F6E]"
                      strokeWidth={2.4}
                    />
                    <span className="text-[#10231C]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center gap-3 pt-1">
        {cardIndex > 0 && (
          <button
            type="button"
            onClick={() => setCardIndex((prev) => prev - 1)}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-[#DDEAE4] bg-[#FFFFFF] px-4 sm:px-5 py-3.5 text-sm sm:text-base font-semibold text-[#5B6B65] hover:bg-[#F0FAF5] hover:text-[#10231C] transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Anterior</span>
          </button>
        )}

        {!isComparisonCard ? (
          <button
            type="button"
            onClick={() => setCardIndex((prev) => prev + 1)}
            className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0E9F6E] px-5 sm:px-6 py-3.5 text-base font-semibold text-white shadow-[0_6px_20px_rgb(14,159,110,0.2)] hover:bg-[#046C4E] active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <span>Siguiente</span>
            <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0E9F6E] px-4 sm:px-6 py-3.5 text-sm sm:text-base font-semibold text-white shadow-[0_6px_20px_rgb(14,159,110,0.2)] hover:bg-[#046C4E] active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <span>Practicar detectando errores</span>
            <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2.4} />
          </button>
        )}
      </div>
    </div>
  );
}
