import { LESSONS } from '@/data/lessons';
import { EvaluationResult, LessonId, StepType } from '@/types';
import { EvaluatorInput, RawEvaluationPayload } from './types';

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

export function buildSystemInstruction(
  lessonId: LessonId,
  stepType: StepType,
  includeJsonShapeInstruction = false
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

  const jsonShapeRule = includeJsonShapeInstruction
    ? stepType === 'diagnostic'
      ? `
Responde ÚNICAMENTE con un objeto JSON válido con esta estructura exacta (sin texto adicional ni bloques markdown):
{"part1":{"passed":boolean,"comment":string},"part2":{"passed":boolean,"comment":string},"part3":{"passed":boolean,"comment":string}}`
      : `
Responde ÚNICAMENTE con un objeto JSON válido con esta estructura exacta (sin texto adicional ni bloques markdown):
{"part1":{"passed":boolean,"comment":string},"part2":{"passed":boolean,"comment":string},"part3":{"passed":boolean,"comment":string},"feedback":string,"retryHint":string}`
    : '';

  return `${baseRules}${coachingRules}

${buildCriteriaInstructions(lessonId)}${jsonShapeRule}`;
}

export function buildUserPrompt(input: EvaluatorInput): string {
  return `Contexto: etapa=${input.stage}; puesto=${input.targetRole}; paso=${input.stepType}; intento=${input.attemptNumber}.
Pregunta: "${input.question}"
Respuesta del usuario:
"""
${input.userAnswer}
"""`;
}

export function parseJsonObject(rawText: string): RawEvaluationPayload {
  const trimmed = rawText.trim();
  try {
    return JSON.parse(trimmed) as RawEvaluationPayload;
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start !== -1 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1)) as RawEvaluationPayload;
    }
    throw new Error('Provider returned invalid JSON');
  }
}

export function normalizeEvaluationResult(
  lessonId: LessonId,
  raw: RawEvaluationPayload
): EvaluationResult {
  const lesson = LESSONS[lessonId];
  const part1Passed = Boolean(raw.part1?.passed);
  const part2Passed = Boolean(raw.part2?.passed);
  const part3Passed = Boolean(raw.part3?.passed);

  return {
    part1: {
      passed: part1Passed,
      label: lesson.formulaParts[0].title,
      comment:
        typeof raw.part1?.comment === 'string' && raw.part1.comment.trim()
          ? raw.part1.comment.trim()
          : part1Passed
            ? 'Criterio cumplido con claridad.'
            : 'Falta desarrollar este punto con mayor claridad.',
    },
    part2: {
      passed: part2Passed,
      label: lesson.formulaParts[1].title,
      comment:
        typeof raw.part2?.comment === 'string' && raw.part2.comment.trim()
          ? raw.part2.comment.trim()
          : part2Passed
            ? 'Criterio cumplido con claridad.'
            : 'Falta incluir este elemento de forma concreta.',
    },
    part3: {
      passed: part3Passed,
      label: lesson.formulaParts[2].title,
      comment:
        typeof raw.part3?.comment === 'string' && raw.part3.comment.trim()
          ? raw.part3.comment.trim()
          : part3Passed
            ? 'Criterio cumplido con claridad.'
            : 'Falta reforzar este punto en tu respuesta.',
    },
    score: [part1Passed, part2Passed, part3Passed].filter(Boolean).length,
    feedback:
      typeof raw.feedback === 'string' && raw.feedback.trim()
        ? raw.feedback.trim()
        : 'Guardamos tu punto de partida para compararlo al final de la lección.',
    retryHint:
      typeof raw.retryHint === 'string' && raw.retryHint.trim()
        ? raw.retryHint.trim()
        : '¿Qué detalle concreto de tu experiencia podrías sumar para completar la fórmula?',
  };
}
