import { NextRequest, NextResponse } from 'next/server';
import { LESSONS } from '@/data/lessons';
import { evaluateInterviewAnswer } from '@/lib/ai/evaluator';
import { NoAIProviderConfiguredError } from '@/lib/ai/types';
import { EvaluateRequest, LessonId, StepType } from '@/types';

const VALID_LESSON_IDS: LessonId[] = ['leccion-1', 'leccion-2'];
const VALID_STEP_TYPES: StepType[] = ['diagnostic', 'practice', 'final'];
const MAX_ANSWER_LENGTH = 2000;
const GENERIC_ERROR_MESSAGE =
  'No pudimos conectar con el orientador IA. Intenta de nuevo en unos segundos.';

export async function POST(request: NextRequest) {
  let body: Partial<EvaluateRequest>;

  try {
    body = (await request.json()) as Partial<EvaluateRequest>;
  } catch {
    return NextResponse.json(
      { error: 'La solicitud no tiene un formato JSON válido.' },
      { status: 400 }
    );
  }

  const {
    lessonId,
    stepType,
    targetRole,
    stage,
    question,
    userAnswer,
    attemptNumber,
  } = body;

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

  const lesson = LESSONS[lessonId];
  const safeRole =
    typeof targetRole === 'string' && targetRole.trim()
      ? targetRole.trim().slice(0, 100)
      : 'el puesto objetivo';
  const safeStage =
    typeof stage === 'string' && stage.trim()
      ? stage.trim().slice(0, 100)
      : 'Búsqueda laboral';
  const safeQuestion =
    typeof question === 'string' && question.trim()
      ? question.trim().slice(0, 500)
      : lesson.title;
  const safeAttempt =
    typeof attemptNumber === 'number' && attemptNumber > 0 ? attemptNumber : 1;

  try {
    const { result, provider } = await evaluateInterviewAnswer({
      lessonId,
      stepType,
      targetRole: safeRole,
      stage: safeStage,
      question: safeQuestion,
      userAnswer: trimmedAnswer,
      attemptNumber: safeAttempt,
    });

    return NextResponse.json(result, {
      headers: {
        'X-AI-Provider': provider,
      },
    });
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
