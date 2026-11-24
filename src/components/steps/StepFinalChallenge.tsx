'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Award,
  Check,
  Copy,
  Lightbulb,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { RubricChecklist } from '@/components/RubricChecklist';
import { formatRoleQuestion } from '@/data/lessons';
import { EvaluationResult, LessonConfig, UserProfile } from '@/types';

interface StepFinalChallengeProps {
  lesson: LessonConfig;
  profile: UserProfile;
  role: string;
  diagnosticEval?: EvaluationResult;
  onComplete: (answer: string, evaluation: EvaluationResult) => void;
}

const MIN_CHARS = 30;
const MAX_CHARS = 2000;

export function StepFinalChallenge({
  lesson,
  profile,
  role,
  diagnosticEval,
  onComplete,
}: StepFinalChallengeProps) {
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finalEval, setFinalEval] = useState<EvaluationResult | null>(null);
  const [copied, setCopied] = useState(false);

  const question = formatRoleQuestion(lesson.finalQuestionTemplate, role);
  const trimmedLength = answer.trim().length;
  const canSubmit =
    trimmedLength >= MIN_CHARS && trimmedLength <= MAX_CHARS && !isLoading;

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: lesson.id,
          stepType: 'final',
          targetRole: role,
          stage: profile.stage,
          question,
          userAnswer: answer.trim(),
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

      const result = data as EvaluationResult;
      setFinalEval(result);
      onComplete(answer.trim(), result);
    } catch {
      setError(
        'No pudimos conectar con el orientador IA. Intenta de nuevo en unos segundos.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopyAnswer() {
    try {
      await navigator.clipboard.writeText(answer.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be blocked in some contexts; ignore gracefully
    }
  }

  function getProgressSummary(before: number | undefined, after: number) {
    if (after === 3 && typeof before === 'number' && after > before) {
      return `¡Avance demostrado! Pasaste de ${before}/3 en tu diagnóstico inicial a 3/3 en el reto final sin ayudas.`;
    }
    if (after === 3) {
      return `¡Dominaste las 3 partes de la estructura incluso sin ayudas (${after}/3)!`;
    }
    if (typeof before === 'number' && after > before) {
      return `¡Buen progreso! Subiste de ${before}/3 a ${after}/3. Aún queda una parte por reforzar para completar el 3/3.`;
    }
    return `Obtuviste ${after}/3 en esta prueba final${
      typeof before === 'number' ? ` (antes ${before}/3)` : ''
    }. Revisa las partes marcadas por fortalecer y vuelve a intentarlo cuando quieras.`;
  }

  const beforeScore = diagnosticEval?.score;

  return (
    <div className="animate-fade-slide space-y-6">
      <div>
        <span className="inline-flex items-center rounded-full bg-[#FB7185]/15 px-3 py-1 text-xs font-bold text-[#FB7185]">
          Reto final · Sin ayudas
        </span>
        <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#10231C]">
          {finalEval
            ? 'Comprobación de tu aprendizaje'
            : 'Demuestra lo que aprendiste'}
        </h1>
      </div>

      {!finalEval ? (
        <>
          <div className="rounded-3xl border border-[#DDEAE4] bg-[#F0FAF5] p-4 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-wide text-[#046C4E]">
              Nueva situación real
            </p>
            <p className="mt-2 text-base sm:text-lg font-semibold leading-relaxed text-[#10231C]">
              {question}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="final-answer" className="sr-only">
                Tu respuesta del reto final
              </label>
              <textarea
                id="final-answer"
                rows={5}
                maxLength={MAX_CHARS}
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isLoading}
                placeholder="Escribe tu respuesta completa sin ayudas..."
                className="min-h-[132px] sm:min-h-[160px] w-full rounded-2xl border border-[#DDEAE4] bg-[#FFFFFF] p-4 text-base leading-relaxed text-[#10231C] placeholder:text-[#5B6B65]/70 focus:border-[#0E9F6E] focus:outline-none focus:ring-4 focus:ring-[#A7F3D0]/40 disabled:opacity-60 transition-all"
              />
              <div className="mt-2 flex flex-col min-[420px]:flex-row min-[420px]:items-center justify-between gap-1 text-xs sm:text-sm text-[#5B6B65]">
                <span>Responde como en una llamada o entrevista real.</span>
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
                  onClick={() => handleSubmit()}
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-[#DC2626] px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" />
                  Intentar de nuevo
                </button>
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center gap-3 rounded-2xl border border-[#DDEAE4] bg-[#F0FAF5] p-4 text-sm font-semibold text-[#046C4E] animate-pulse">
                <Loader2 className="h-5 w-5 animate-spin text-[#0E9F6E]" />
                <span>Evaluando tu reto final...</span>
              </div>
            ) : (
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-[#0E9F6E] px-6 py-3.5 text-base font-semibold text-white shadow-[0_6px_20px_rgb(14,159,110,0.2)] hover:bg-[#046C4E] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 transition-all duration-200 cursor-pointer"
              >
                <span>Comprobar mi aprendizaje</span>
                <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
              </button>
            )}
          </form>
        </>
      ) : (
        <div className="animate-fade-slide space-y-6">
          {/* Honest Progress Summary Banner */}
          <div
            className={`rounded-3xl border p-4 sm:p-6 space-y-2 ${
              finalEval.score === 3
                ? 'border-[#A7F3D0] bg-[#F0FAF5]'
                : 'border-[#FBBF24]/50 bg-[#FBBF24]/10'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Award
                className={`h-6 w-6 shrink-0 ${
                  finalEval.score === 3 ? 'text-[#0E9F6E]' : 'text-[#FBBF24]'
                }`}
                strokeWidth={2.3}
              />
              <h2 className="text-lg font-extrabold text-[#10231C]">
                {finalEval.score === 3
                  ? '¡Competencia demostrada!'
                  : 'Resumen honesto de tu avance'}
              </h2>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-[#10231C]">
              {getProgressSummary(beforeScore, finalEval.score)}
            </p>
          </div>

          {/* 2-Card Before vs After Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
            <div className="rounded-3xl border border-[#DDEAE4] bg-[#FFFFFF] p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wide text-[#5B6B65]">
                  Antes (Paso 1)
                </span>
                <span className="rounded-full bg-[#F0FAF5] px-2.5 py-0.5 text-xs font-bold text-[#10231C]">
                  {typeof beforeScore === 'number' ? `${beforeScore}/3` : '—'}
                </span>
              </div>
              {diagnosticEval ? (
                <RubricChecklist evaluation={diagnosticEval} compact />
              ) : (
                <p className="text-xs text-[#5B6B65]">
                  No se registró diagnóstico previo en esta sesión.
                </p>
              )}
            </div>

            <div className="rounded-3xl border border-[#0E9F6E]/40 bg-[#FFFFFF] p-4 sm:p-5 shadow-[0_8px_24px_rgb(14,159,110,0.08)] space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wide text-[#046C4E]">
                  Después (Reto final)
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
                    finalEval.score === 3
                      ? 'bg-[#A7F3D0] text-[#046C4E]'
                      : 'bg-[#FBBF24]/25 text-[#10231C]'
                  }`}
                >
                  {finalEval.score}/3
                </span>
              </div>
              <RubricChecklist evaluation={finalEval} compact />
            </div>
          </div>

          {/* Coaching note */}
          <div className="rounded-3xl border border-[#DDEAE4] bg-[#FFFFFF] p-4 sm:p-5 space-y-3">
            <p className="text-sm sm:text-base leading-relaxed text-[#10231C]">
              {finalEval.feedback}
            </p>
            {finalEval.score < 3 && finalEval.retryHint && (
              <div className="flex items-start gap-2.5 rounded-2xl bg-[#F0FAF5] p-3.5 text-sm text-[#10231C]">
                <Lightbulb
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#FBBF24]"
                  strokeWidth={2.3}
                />
                <span>
                  <strong className="text-[#046C4E]">Para seguir puliendo:</strong>{' '}
                  {finalEval.retryHint}
                </span>
              </div>
            )}
          </div>

          {/* Copyable final answer */}
          <div className="rounded-3xl border border-[#DDEAE4] bg-[#F0FAF5] p-4 sm:p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-extrabold uppercase tracking-wide text-[#046C4E]">
                Tu respuesta final
              </p>
              <button
                type="button"
                onClick={handleCopyAnswer}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-[#DDEAE4] bg-[#FFFFFF] px-3 py-1.5 text-xs font-semibold text-[#046C4E] hover:bg-[#A7F3D0]/30 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#0E9F6E]" />
                    <span>Copiada</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copiar mi respuesta</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-[#10231C]">
              {answer.trim()}
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-[#0E9F6E] px-6 py-3.5 text-base font-semibold text-white shadow-[0_6px_20px_rgb(14,159,110,0.2)] hover:bg-[#046C4E] active:scale-[0.98] transition-all duration-200"
          >
            <span>Volver a mis lecciones</span>
            <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
          </Link>
        </div>
      )}
    </div>
  );
}
