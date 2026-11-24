'use client';

import { useRef, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Loader2,
  RefreshCw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { RubricChecklist } from '@/components/RubricChecklist';
import { formatRoleQuestion } from '@/data/lessons';
import { EvaluationResult, LessonConfig, UserProfile } from '@/types';

interface StepPracticeProps {
  lesson: LessonConfig;
  profile: UserProfile;
  role: string;
  onNext: () => void;
}

const MIN_CHARS = 30;
const MAX_CHARS = 2000;
const MAX_ATTEMPTS = 3;

export function StepPractice({
  lesson,
  profile,
  role,
  onNext,
}: StepPracticeProps) {
  const [answer, setAnswer] = useState('');
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [showFormula, setShowFormula] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [evaluatedAttempt, setEvaluatedAttempt] = useState<number>(0);
  const [lastEvaluatedText, setLastEvaluatedText] = useState<string>('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const question = formatRoleQuestion(lesson.practiceQuestionTemplate, role);
  const trimmedLength = answer.trim().length;
  const normalizedDraft = answer.trim().replace(/\s+/g, ' ').toLowerCase();
  const canSubmit =
    trimmedLength >= MIN_CHARS && trimmedLength <= MAX_CHARS && !isLoading;

  const isCurrentAttemptEvaluated =
    evaluation !== null && evaluatedAttempt === attemptNumber;
  const passedAll = evaluation?.score === 3;
  const reachedLimit = evaluatedAttempt >= MAX_ATTEMPTS;

  async function evaluateAnswer(targetAttempt: number) {
    if (!canSubmit) return;

    if (lastEvaluatedText && normalizedDraft === lastEvaluatedText) {
      setError(
        'Edita tu respuesta usando la pista antes de volver a evaluarla.'
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: lesson.id,
          stepType: 'practice',
          targetRole: role,
          stage: profile.stage,
          question,
          userAnswer: answer.trim(),
          attemptNumber: targetAttempt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data?.error ||
            'No pudimos conectar con el orientador IA. Intenta de nuevo en unos segundos.'
        );
        return;
      }

      setEvaluation(data as EvaluationResult);
      setEvaluatedAttempt(targetAttempt);
      setLastEvaluatedText(normalizedDraft);
    } catch {
      setError(
        'No pudimos conectar con el orientador IA. Intenta de nuevo en unos segundos.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    evaluateAnswer(attemptNumber);
  }

  function handleRetryFocus() {
    if (attemptNumber < MAX_ATTEMPTS) {
      setAttemptNumber((prev) => prev + 1);
    }
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  }

  return (
    <div className="animate-fade-slide space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center rounded-full bg-[#F0FAF5] px-3 py-1 text-xs font-bold text-[#046C4E]">
          Paso 4 · Práctica guiada con IA
        </span>
        <span className="rounded-full bg-[#F0FAF5] px-3 py-1 text-xs font-bold text-[#5B6B65]">
          Intento {attemptNumber} de {MAX_ATTEMPTS}
        </span>
      </div>

      {/* Practice Question */}
      <div className="rounded-3xl border border-[#DDEAE4] bg-[#F0FAF5] p-4 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-[#046C4E]">
          Tu turno de practicar
        </p>
        <p className="mt-2 text-base sm:text-lg font-semibold leading-relaxed text-[#10231C]">
          {question}
        </p>
      </div>

      {/* Compact expandable 3-part formula reminder */}
      <div className="rounded-2xl border border-[#DDEAE4] bg-[#F0FAF5] p-3.5 sm:p-4">
        <button
          type="button"
          onClick={() => setShowFormula((prev) => !prev)}
          aria-expanded={showFormula}
          className="flex min-h-[36px] w-full items-center justify-between gap-2 text-left text-xs sm:text-sm font-bold text-[#046C4E] cursor-pointer"
        >
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-[#0E9F6E]" strokeWidth={2.2} />
            <span>
              Recordatorio:{' '}
              {lesson.formulaParts.map((p) => p.title).join(' → ')}
            </span>
          </span>
          {showFormula ? (
            <ChevronUp className="h-4 w-4 shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0" />
          )}
        </button>

        {showFormula && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2.5 border-t border-[#DDEAE4] pt-3 animate-fade-slide">
            {lesson.formulaParts.map((part, idx) => (
              <div
                key={part.id}
                className="rounded-xl bg-[#FFFFFF] px-3 py-2.5 text-xs sm:text-sm text-[#10231C]"
              >
                <span className="font-bold text-[#046C4E]">
                  {idx + 1}. {part.title}:
                </span>{' '}
                <span className="text-[#5B6B65]">{part.tip}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input form */}
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div>
          <label htmlFor="practice-answer" className="sr-only">
            Escribe tu respuesta de práctica
          </label>
          <textarea
            ref={textareaRef}
            id="practice-answer"
            rows={5}
            maxLength={MAX_CHARS}
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              if (error) setError(null);
            }}
            disabled={isLoading || (isCurrentAttemptEvaluated && (passedAll || reachedLimit))}
            placeholder="Escribe aquí tu respuesta aplicando las 3 partes de la fórmula..."
            className="min-h-[132px] sm:min-h-[160px] w-full rounded-2xl border border-[#DDEAE4] bg-[#FFFFFF] p-4 text-base leading-relaxed text-[#10231C] placeholder:text-[#5B6B65]/70 focus:border-[#0E9F6E] focus:outline-none focus:ring-4 focus:ring-[#A7F3D0]/40 disabled:bg-[#F0FAF5]/50 disabled:opacity-80 transition-all"
          />
          <div className="mt-2 flex flex-col min-[420px]:flex-row min-[420px]:items-center justify-between gap-1 text-xs sm:text-sm text-[#5B6B65]">
            <span>Tu orientador IA revisará si incluiste las 3 partes.</span>
            <span className="shrink-0 font-semibold">
              {trimmedLength < MIN_CHARS
                ? `Mínimo ${MIN_CHARS} caracteres (${trimmedLength}/${MIN_CHARS})`
                : `${trimmedLength}/${MAX_CHARS}`}
            </span>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-[#DC2626]/30 bg-[#DC2626]/5 p-4 space-y-3"
          >
            <p className="text-sm font-medium text-[#DC2626]">{error}</p>
            <button
              type="button"
              onClick={() => evaluateAnswer(attemptNumber)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#DC2626] px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              Intentar de nuevo
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center gap-3 rounded-2xl border border-[#DDEAE4] bg-[#F0FAF5] p-4 text-sm font-semibold text-[#046C4E] animate-pulse">
            <Loader2 className="h-5 w-5 animate-spin text-[#0E9F6E]" />
            <span>
              Tu orientador IA está revisando la estructura de tu respuesta...
            </span>
          </div>
        )}

        {!isLoading && !isCurrentAttemptEvaluated && (
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-[#0E9F6E] px-6 py-3.5 text-base font-semibold text-white shadow-[0_6px_20px_rgb(14,159,110,0.2)] hover:bg-[#046C4E] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 transition-all duration-200 cursor-pointer"
          >
            <span>Evaluar mi respuesta</span>
            <Sparkles className="h-4 w-4" strokeWidth={2.2} />
          </button>
        )}
      </form>

      {/* AI Coaching Evaluation Result */}
      {evaluation && (
        <section
          aria-live="polite"
          className="animate-fade-slide rounded-3xl border border-[#DDEAE4] bg-[#FFFFFF] p-4 sm:p-6 shadow-[0_8px_30px_rgb(16,35,28,0.06)] space-y-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-extrabold text-[#10231C]">
              Resultado de tu práctica (Intento {evaluatedAttempt})
            </h2>
            <span
              className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                passedAll
                  ? 'bg-[#A7F3D0] text-[#046C4E]'
                  : 'bg-[#FBBF24]/25 text-[#10231C]'
              }`}
            >
              {evaluation.score} / 3 criterios
            </span>
          </div>

          <RubricChecklist evaluation={evaluation} />

          <div className="space-y-3">
            <p className="text-sm sm:text-base leading-relaxed text-[#10231C]">
              {evaluation.feedback}
            </p>

            {!passedAll && evaluation.retryHint.trim().length > 0 && (
              <div className="flex items-start gap-3 rounded-2xl bg-[#F0FAF5] border border-[#DDEAE4] p-4">
                <Lightbulb
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#FBBF24]"
                  strokeWidth={2.3}
                />
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wide text-[#046C4E]">
                    Pista para fortalecer tu respuesta
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[#10231C]">
                    {evaluation.retryHint}
                  </p>
                </div>
              </div>
            )}
          </div>

          {isCurrentAttemptEvaluated && (
            <div className="space-y-3 pt-1">
              {!passedAll && !reachedLimit ? (
                <>
                  <button
                    type="button"
                    onClick={handleRetryFocus}
                    className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-[#0E9F6E] px-6 py-3.5 text-base font-semibold text-white shadow-[0_6px_20px_rgb(14,159,110,0.2)] hover:bg-[#046C4E] active:scale-[0.98] transition-all duration-200 cursor-pointer"
                  >
                    <span>
                      Mejorar mi respuesta (Intento {attemptNumber + 1} de{' '}
                      {MAX_ATTEMPTS})
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={onNext}
                    className="min-h-[44px] w-full py-2 text-center text-sm font-semibold text-[#5B6B65] hover:text-[#046C4E] transition-colors cursor-pointer"
                  >
                    Ir al reto final
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2.5 rounded-2xl bg-[#FBBF24]/20 px-4 py-3 text-sm font-bold text-[#10231C]">
                    <Trophy
                      className="h-5 w-5 shrink-0 text-[#FBBF24]"
                      strokeWidth={2.3}
                    />
                    <span>
                      {passedAll
                        ? '¡Lograste las 3 partes de la fórmula! Ahora demuéstralo sin ayudas.'
                        : 'Completaste tus 3 intentos de práctica. ¡Veamos cómo te va en el reto final sin ayudas!'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onNext}
                    className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-[#0E9F6E] px-6 py-3.5 text-base font-semibold text-white shadow-[0_6px_20px_rgb(14,159,110,0.2)] hover:bg-[#046C4E] active:scale-[0.98] transition-all duration-200 cursor-pointer"
                  >
                    <span>Ir al reto final sin ayudas</span>
                    <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
                  </button>
                </>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
