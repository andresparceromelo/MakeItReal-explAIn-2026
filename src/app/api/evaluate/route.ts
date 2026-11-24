import { GoogleGenAI, Schema, ThinkingLevel, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { LESSONS } from '@/data/lessons';
import { EvaluateRequest, EvaluationResult, LessonId, StepType } from '@/types';

const VALID_LESSON_IDS: LessonId[] = ['leccion-1', 'leccion-2'];
const VALID_STEP_TYPES: StepType[] = ['diagnostic', 'practice', 'final'];
const MAX_ANSWER_LENGTH = 2000;
const PER_ATTEMPT_TIMEOUT_MS = 7000;
const GENERIC_ERROR_MESSAGE =
  'No pudimos conectar con el orientador IA. Intenta de nuevo en unos segundos.';

const criterionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    passed: { type: Type.BOOLEAN },
    comment: { type: Type.STRING },
  },
  required: ['passed', 'comment'],
};

const diagnosticResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    part1: criterionSchema,
    part2: criterionSchema,
    part3: criterionSchema,
  },
  required: ['part1', 'part2', 'part3'],
};

const evaluationResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    part1: criterionSchema,
    part2: criterionSchema,
    part3: criterionSchema,
    feedback: { type: Type.STRING },
    retryHint: { type: Type.STRING },
  },
  required: ['part1', 'part2', 'part3', 'feedback', 'retryHint'],
};

function buildCriteriaInstructions(lessonId: LessonId): string {
  if (lessonId === 'leccion-1') {
    return `
Criterios de evaluación estrictos para la Lección 1 ("Cuéntame sobre ti" en 60 segundos - Fórmula Q-L-E):
1. part1 ("Quién soy"):
   - Cumple (passed: true) SOLO si presenta con claridad su perfil actual, formación o área laboral en 1 o 2 frases enfocadas en el trabajo.
   - NO cumple si solo da nombre/edad/barrio o frases vacías como "soy trabajador", "necesito empleo" o "tengo ganas de trabajar en lo que salga".
2. part2 ("Un logro concreto"):
   - Cumple (passed: true) SOLO si incluye un ejemplo real, acción específica o resultado verificable (en trabajo, negocio familiar, estudio, proyecto o actividad).
   - NO cumple si solo menciona adjetivos genéricos ("soy responsable, honesto, aprendo rápido") sin hechos concretos.
3. part3 ("Por qué encajo en este puesto"):
   - Cumple (passed: true) SOLO si conecta explícitamente sus capacidades o experiencia con lo que necesita el puesto objetivo.
   - NO cumple si termina sin explicar qué valor le aportaría a este cargo específico.`;
  }

  return `
Criterios de evaluación estrictos para la Lección 2 (Responder cuando "no tienes experiencia" - Fórmula C-H-P):
1. part1 ("Contexto honesto"):
   - Cumple (passed: true) SOLO si reconoce con serenidad y honestidad que no tiene experiencia formal previa en ese cargo (sin disculparse en exceso, ponerse a la defensiva ni inventar contratos falsos).
   - NO cumple si evade el tema por completo o responde con tono defensivo ("nadie me da la oportunidad").
2. part2 ("Habilidad transferible"):
   - Cumple (passed: true) SOLO si nombra explícitamente al menos una habilidad práctica relevante para el puesto objetivo (ej: trato al cliente, orden, manejo de herramientas, solución de problemas, puntualidad demostrada).
   - NO cumple si solo promete "aprender rápido" o "ponerle actitud" sin nombrar una capacidad concreta.
3. part3 ("Prueba concreta"):
   - Cumple (passed: true) SOLO si respalda esa habilidad con un hecho real (estudio, negocio familiar, voluntariado, ventas propias, deporte o proyecto personal).
   - NO cumple si no aporta ninguna situación o ejemplo real donde haya aplicado la habilidad.`;
}

function buildSystemInstruction(
  lessonId: LessonId,
  stepType: StepType
): string {
  const baseRules = `Eres un orientador laboral cálido, cercano y práctico en Antioquia, Colombia.
Tu misión es enseñar a personas que buscan empleo cómo responder entrevistas laborales con estructura, NUNCA hacer la tarea por ellas.

Reglas pedagógicas OBLIGATORIAS:
1. Habla siempre de "tú", en español claro, respetuoso y cotidiano de Colombia, sin tecnicismos ni jerga corporativa.
2. Evalúa de forma justa pero honesta y estricta:
   - NO marques un criterio como passed: true si la respuesta es vaga, genérica (como "soy muy trabajador y aprendo rápido" sin hechos) o fuera de tema.
   - Si el usuario escribe texto sin sentido, caracteres aleatorios o menos de 10 palabras con sentido real, marca los 3 criterios (part1, part2, part3) como passed: false.
3. Mantén cada "comment" en máximo 15 palabras (1 oración corta y directa).`;

  const coachingRules =
    stepType === 'diagnostic'
      ? ''
      : `
4. REGLA CRÍTICA DE NO REESCRITURA:
   - NUNCA escribas, reescribas ni entregues un párrafo o frase de reemplazo lista para copiar (por ejemplo, NO digas "Podrías decir: 'Soy técnico...'").
   - Limítate a diagnosticar qué funcionó y explicar qué falta en "feedback" (2 a 3 oraciones claras).
   - En "retryHint", escribe EXACTAMENTE UNA pregunta concreta en segunda persona (tú), terminada en signo de interrogación (?), para ayudar al usuario a mejorar su propio texto.`;

  return `${baseRules}${coachingRules}

${buildCriteriaInstructions(lessonId)}`;
}

interface ModelCandidate {
  model: string;
  thinkingLevel?: ThinkingLevel;
}

const DEFAULT_MODEL_CHAIN: ModelCandidate[] = [
  { model: 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel.MINIMAL },
  { model: 'gemini-3.5-flash-lite', thinkingLevel: ThinkingLevel.LOW },
  { model: 'gemini-3.5-flash', thinkingLevel: ThinkingLevel.MINIMAL },
  { model: 'gemini-3.6-flash', thinkingLevel: ThinkingLevel.LOW },
  { model: 'gemini-3.8-flash', thinkingLevel: ThinkingLevel.LOW },
];

function isRetryableModelError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const maybeErr = err as { status?: number; name?: string; message?: string };
  if (
    maybeErr.name === 'AbortError' ||
    maybeErr.name === 'TimeoutError' ||
    maybeErr.message?.toLowerCase().includes('abort')
  ) {
    return true;
  }
  if (
    maybeErr.status === 400 &&
    maybeErr.message?.toLowerCase().includes('thinking')
  ) {
    return true;
  }
  return (
    maybeErr.status === 404 ||
    maybeErr.status === 429 ||
    maybeErr.status === 500 ||
    maybeErr.status === 503
  );
}

async function generateEvaluationWithFallback(
  ai: GoogleGenAI,
  lessonId: LessonId,
  stepType: StepType,
  userPrompt: string
) {
  const configured = process.env.GEMINI_MODEL?.trim();
  const candidates: ModelCandidate[] = configured
    ? [
        { model: configured },
        ...DEFAULT_MODEL_CHAIN.filter((c) => c.model !== configured),
      ]
    : DEFAULT_MODEL_CHAIN;

  const schema =
    stepType === 'diagnostic'
      ? diagnosticResponseSchema
      : evaluationResponseSchema;

  let lastError: unknown;
  for (const candidate of candidates) {
    try {
      return await ai.models.generateContent({
        model: candidate.model,
        contents: userPrompt,
        config: {
          systemInstruction: buildSystemInstruction(lessonId, stepType),
          temperature: 0.15,
          ...(candidate.thinkingLevel
            ? { thinkingConfig: { thinkingLevel: candidate.thinkingLevel } }
            : {}),
          abortSignal: AbortSignal.timeout(PER_ATTEMPT_TIMEOUT_MS),
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      });
    } catch (err) {
      lastError = err;
      if (!isRetryableModelError(err)) {
        throw err;
      }
    }
  }
  throw lastError;
}

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

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: GENERIC_ERROR_MESSAGE },
      { status: 500 }
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

  const userPrompt = `Contexto: etapa=${safeStage}; puesto=${safeRole}; paso=${stepType}; intento=${safeAttempt}.
Pregunta: "${safeQuestion}"
Respuesta del usuario:
"""
${trimmedAnswer}
"""`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await generateEvaluationWithFallback(
      ai,
      lessonId,
      stepType,
      userPrompt
    );

    const rawText = response.text;
    if (!rawText) {
      throw new Error('Empty response from Gemini');
    }

    const parsed = JSON.parse(rawText) as Partial<EvaluationResult>;

    const part1Passed = Boolean(parsed.part1?.passed);
    const part2Passed = Boolean(parsed.part2?.passed);
    const part3Passed = Boolean(parsed.part3?.passed);

    const normalized: EvaluationResult = {
      part1: {
        passed: part1Passed,
        label: lesson.formulaParts[0].title,
        comment:
          typeof parsed.part1?.comment === 'string' && parsed.part1.comment.trim()
            ? parsed.part1.comment.trim()
            : part1Passed
              ? 'Criterio cumplido con claridad.'
              : 'Falta desarrollar este punto con mayor claridad.',
      },
      part2: {
        passed: part2Passed,
        label: lesson.formulaParts[1].title,
        comment:
          typeof parsed.part2?.comment === 'string' && parsed.part2.comment.trim()
            ? parsed.part2.comment.trim()
            : part2Passed
              ? 'Criterio cumplido con claridad.'
              : 'Falta incluir este elemento de forma concreta.',
      },
      part3: {
        passed: part3Passed,
        label: lesson.formulaParts[2].title,
        comment:
          typeof parsed.part3?.comment === 'string' && parsed.part3.comment.trim()
            ? parsed.part3.comment.trim()
            : part3Passed
              ? 'Criterio cumplido con claridad.'
              : 'Falta reforzar este punto en tu respuesta.',
      },
      score: [part1Passed, part2Passed, part3Passed].filter(Boolean).length,
      feedback:
        typeof parsed.feedback === 'string' && parsed.feedback.trim()
          ? parsed.feedback.trim()
          : 'Guardamos tu punto de partida para compararlo al final de la lección.',
      retryHint:
        typeof parsed.retryHint === 'string' && parsed.retryHint.trim()
          ? parsed.retryHint.trim()
          : '¿Qué detalle concreto de tu experiencia podrías sumar para completar la fórmula?',
    };

    return NextResponse.json(normalized);
  } catch (err) {
    console.error('Gemini evaluation error:', err);
    return NextResponse.json(
      { error: GENERIC_ERROR_MESSAGE },
      { status: 500 }
    );
  }
}
