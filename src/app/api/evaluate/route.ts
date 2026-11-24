import { NextRequest, NextResponse } from 'next/server';
import { evaluateInterviewAnswer } from '@/lib/ai/evaluator';
import {
  checkRateLimit,
  deriveCanonicalQuestion,
  sanitizeStage,
  sanitizeTargetRole,
  validateLinguisticQuality,
} from '@/lib/ai/guardrails';
import { NoAIProviderConfiguredError } from '@/lib/ai/types';
import { EvaluateRequest, LessonId, StepType } from '@/types';

const VALID_LESSON_IDS: LessonId[] = ['leccion-1', 'leccion-2'];
const VALID_STEP_TYPES: StepType[] = ['diagnostic', 'practice', 'final'];
const MAX_ANSWER_LENGTH = 2000;
const GENERIC_ERROR_MESSAGE =
  'No pudimos conectar con el orientador IA. Intenta de nuevo en unos segundos.';

function extractClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip')?.trim() || 'local';
}

export async function POST(request: NextRequest) {
  const clientIp = extractClientIp(request);
  if (!checkRateLimit(clientIp)) {
    return NextResponse.json(
      {
        error:
          'Estás enviando muchas solicitudes seguidas. Espera unos segundos e intenta de nuevo.',
      },
      { status: 429 }
    );
  }

  let body: Partial<EvaluateRequest>;

  try {
    body = (await request.json()) as Partial<EvaluateRequest>;
  } catch {
    return NextResponse.json(
      { error: 'La solicitud no tiene un formato JSON válido.' },
      { status: 400 }
    );
  }

  const { lessonId, stepType, targetRole, stage, userAnswer, attemptNumber } =
    body;

  if (!lessonId || !VALID_LESSON_IDS.includes(lessonId)) {
    return NextResponse.json(
      { error: 'Lección no válida.' },
      { status: 400 }
    );
  }

  if (!stepType || !VALID_STEP_TYPES.includes(stepType)) {
    return NextResponse.json(
      { error: 'Tipo de paso no válido.' },
      { status: 400 }
    );
  }

  if (typeof userAnswer !== 'string' || userAnswer.trim().length === 0) {
    return NextResponse.json(
      { error: 'Por favor escribe tu respuesta antes de enviarla.' },
      { status: 400 }
    );
  }

  const trimmedAnswer = userAnswer.trim();
  if (trimmedAnswer.length > MAX_ANSWER_LENGTH) {
    return NextResponse.json(
      {
        error: `Tu respuesta supera el máximo de ${MAX_ANSWER_LENGTH} caracteres.`,
      },
      { status: 400 }
    );
  }

  const safeStage = sanitizeStage(stage);
  const safeRole = sanitizeTargetRole(targetRole);
  const canonicalQuestion = deriveCanonicalQuestion(
    lessonId,
    stepType,
    safeRole
  );

  const linguisticError = validateLinguisticQuality(
    trimmedAnswer,
    canonicalQuestion
  );
  if (linguisticError) {
    return NextResponse.json({ error: linguisticError }, { status: 400 });
  }

  const safeAttempt =
    typeof attemptNumber === 'number' && attemptNumber > 0
      ? Math.min(3, Math.floor(attemptNumber))
      : 1;

  try {
    const { result, provider, cached, model, usage } =
      await evaluateInterviewAnswer({
        lessonId,
        stepType,
        targetRole: safeRole,
        stage: safeStage,
        question: canonicalQuestion,
        userAnswer: trimmedAnswer,
        attemptNumber: safeAttempt,
      });

    const headers: Record<string, string> = {
      'X-AI-Provider': provider,
      'X-AI-Cache': cached ? 'HIT' : 'MISS',
    };
    if (model) headers['X-AI-Model'] = model;
    if (typeof usage?.totalTokens === 'number') {
      headers['X-AI-Tokens'] = String(usage.totalTokens);
    }

    return NextResponse.json(result, { headers });
  } catch (err) {
    if (err instanceof NoAIProviderConfiguredError) {
      console.error('AI evaluation failed: no provider configured');
    } else {
      console.error('AI evaluation error:', err);
    }
    return NextResponse.json(
      { error: GENERIC_ERROR_MESSAGE },
      { status: 500 }
    );
  }
}
