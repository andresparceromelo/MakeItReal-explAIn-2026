import { AlertCircle, Check } from 'lucide-react';
import { EvaluationResult } from '@/types';

interface RubricChecklistProps {
  evaluation: EvaluationResult;
  compact?: boolean;
}

export function RubricChecklist({
  evaluation,
  compact = false,
}: RubricChecklistProps) {
  const criteria = [evaluation.part1, evaluation.part2, evaluation.part3];

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      {criteria.map((criterion, index) => (
        <div
          key={`${criterion.label}-${index}`}
          className={`flex items-start gap-3 rounded-2xl border transition-colors ${
            compact ? 'p-3' : 'p-3.5 sm:p-4'
          } ${
            criterion.passed
              ? 'border-[#A7F3D0] bg-[#F0FAF5]'
              : 'border-[#FBBF24]/50 bg-[#FFFFFF]'
          }`}
        >
          <div
            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
              criterion.passed
                ? 'bg-[#A7F3D0] text-[#046C4E]'
                : 'bg-[#FBBF24]/25 text-[#10231C]'
            }`}
            aria-label={criterion.passed ? 'Cumplido' : 'Por mejorar'}
          >
            {criterion.passed ? (
              <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
            ) : (
              <AlertCircle className="h-3.5 w-3.5" strokeWidth={2.4} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <p className="text-sm font-bold text-[#10231C]">{criterion.label}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  criterion.passed
                    ? 'bg-[#A7F3D0]/70 text-[#046C4E]'
                    : 'bg-[#FBBF24]/25 text-[#10231C]'
                }`}
              >
                {criterion.passed ? 'Logrado' : 'Por fortalecer'}
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[#5B6B65]">
              {criterion.comment}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
