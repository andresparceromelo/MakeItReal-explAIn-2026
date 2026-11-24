'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { formatRoleQuestion } from '@/data/lessons';
import { EvaluationResult, LessonConfig, UserProfile } from '@/types';

interface StepDiagnosticProps {
  lesson: LessonConfig;
  profile: UserProfile;
  role: string;
  onComplete: (answer: string, evaluation: EvaluationResult) => void;
  onNext: () => void;
}

const MIN_CHARS = 30;
const MAX_CHARS = 2000;

export function StepDiagnostic({
  lesson,
  profile,
  role,
  onComplete,
  onNext,
}: StepDiagnosticProps) {
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const question = formatRoleQuestion(lesson.diagnosticQuestionTemplate, role);
  const trimmedLength = answer.trim().length;
  const canSubmit = trimmedLength >= MIN_CHARS && trimmedLength <= MAX_CHARS && !isLoading;

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
          stepType: 'diagnostic',
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

      onComplete(answer.trim(), data as EvaluationResult);
      setSaved(true);
    } catch {
      setError(
        'No pudimos conectar con el orientador IA. Intenta de nuevo en unos segundos.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="animate-fade-slide space-y-6">
      <div>
        <span className="inline-flex items-center rounded-full bg-[#F0FAF5] px-3 py-1 text-xs font-bold text-[#046C4E]">
          Paso 1 · Punto de partida
        </span>
        <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#10231C]">
          ¿Cómo responderías hoy?
        </h1>
      </div>

      {/* Speech bubble question */}
      <div className="rounded-3xl border border-[#DDEAE4] bg-[#F0FAF5] p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-[#046C4E]">
          Pregunta de entrevista
        </p>
        <p className="mt-2 text-base sm:text-lg font-semibold leading-relaxed text-[#10231C]">
          {question}
        </p>
      </div>

      {!saved ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="diagnostic-answer" className="sr-only">
              Tu respuesta inicial
            </label>
            <textarea
              id="diagnostic-answer"
              rows={5}
              maxLength={MAX_CHARS}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={isLoading}
              placeholder="Escribe aquí lo que dirías en voz alta..."
              className="w-full rounded-2xl border border-[#DDEAE4] bg-[#FFFFFF] p-4 text-base leading-relaxed text-[#10231C] placeholder:text-[#5B6B65]/70 focus:border-[#0E9F6E] focus:outline-none focus:ring-4 focus:ring-[#A7F3D0]/40 disabled:opacity-60 transition-all"
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-[#5B6B65]">
              <span>
                Responde como lo harías hoy en una entrevista real. No hay
                calificaciones malas aquí.
              </span>
              <span
                className={`font-semibold ${
                  trimmedLength > 0 && trimmedLength < MIN_CHARS
                    ? 'text-[#046C4E]'
                    : 'text-[#5B6B65]'
                }`}
              >
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
                className="inline-flex items-center gap-2 rounded-xl bg-[#DC2626] px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                Intentar de nuevo
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center gap-3 rounded-2xl border border-[#DDEAE4] bg-[#F0FAF5] p-4 text-sm font-semibold text-[#046C4E] animate-pulse">
              <Loader2 className="h-5 w-5 animate-spin text-[#0E9F6E]" />
              <span>Guardando tu punto de partida con el orientador IA...</span>
            </div>
          ) : (
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0E9F6E] px-6 py-3.5 text-base font-semibold text-white shadow-[0_6px_20px_rgb(14,159,110,0.2)] hover:bg-[#046C4E] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 transition-all duration-200 cursor-pointer"
            >
              <span>Guardar mi punto de partida</span>
              <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
            </button>
          )}
        </form>
      ) : (
        <div className="animate-fade-slide rounded-3xl border border-[#A7F3D0] bg-[#F0FAF5] p-6 space-y-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#A7F3D0] text-[#046C4E]">
              <CheckCircle2 className="h-6 w-6" strokeWidth={2.4} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#10231C]">
                ¡Listo! Guardamos tu punto de partida.
              </h2>
              <p className="mt-1 text-sm sm:text-base leading-relaxed text-[#5B6B65]">
                Ahora veamos una fórmula sencilla para potenciarlo. Al final
                compararemos tu avance real.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onNext}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0E9F6E] px-6 py-3.5 text-base font-semibold text-white shadow-[0_6px_20px_rgb(14,159,110,0.2)] hover:bg-[#046C4E] active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <span>Ver la fórmula</span>
            <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
          </button>
        </div>
      )}
    </div>
  );
}
