import { CAREER_STAGES, LESSONS, formatRoleQuestion } from '@/data/lessons';
import { CareerStage, EvaluationResult, LessonId, StepType } from '@/types';

const MIN_WORDS = 8;
const MAX_WORDS_IN_COMMENT = 18;
const CACHE_TTL_MS = 15 * 60 * 1000;
const CACHE_MAX_ENTRIES = 200;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 20;

const REWRITE_TRIGGER_PATTERNS = [
  /podr[ií]as\s+decir\s*[:\-]?/i,
  /intenta\s+decir\s*[:\-]?/i,
  /di\s+algo\s+como\s*[:\-]?/i,
  /una\s+opci[oó]n\s+ser[ií]a\s*[:\-]?/i,
  /ejemplo\s+de\s+respuesta\s*[:\-]?/i,
  /puedes\s+responder\s*[:\-]?/i,
  /por\s+ejemplo\s*:\s*["“]/i,
];

const LONG_QUOTED_TEMPLATE_REGEX = /["“][^"”]{35,}["”]/;

const FALLBACK_QUESTIONS: Record<
  LessonId,
  { part1: string; part2: string; part3: string }
> = {
  'leccion-1': {
    part1:
      '¿Cómo describirías en una frase tu formación, oficio o experiencia actual para empezar?',
    part2:
      '¿Qué logro o tarea concreta hiciste bien en tus estudios, negocio familiar o trabajo anterior?',
    part3:
      '¿Cómo conectarías lo que sabes hacer con lo que necesita este puesto específico?',
  },
  'leccion-2': {
    part1:
      '¿Cómo explicarías con tranquilidad que aún no tienes contrato formal en este cargo sin disculparte?',
    part2:
      '¿Qué habilidad práctica tuya (trato al público, orden o herramientas) aplica directo a este puesto?',
    part3:
      '¿En qué situación real de tu vida (estudio, hogar o ventas propias) demostraste esa habilidad?',
  },
};

function normalizeComparableText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function sanitizeSingleLineText(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u001F\u007F<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

export function sanitizeStage(stage: unknown): CareerStage {
  if (typeof stage === 'string') {
    const matched = CAREER_STAGES.find((item) => item === stage.trim());
    if (matched) return matched;
  }
  return CAREER_STAGES[0];
}

export function sanitizeTargetRole(targetRole: unknown): string {
  const cleaned = sanitizeSingleLineText(targetRole, 60);
  return cleaned || 'el puesto objetivo';
}

export function deriveCanonicalQuestion(
  lessonId: LessonId,
  stepType: StepType,
  safeRole: string
): string {
  const lesson = LESSONS[lessonId];
  const template =
    stepType === 'diagnostic'
      ? lesson.diagnosticQuestionTemplate
      : stepType === 'practice'
        ? lesson.practiceQuestionTemplate
        : lesson.finalQuestionTemplate;
  return formatRoleQuestion(template, safeRole);
}

export function escapeXmlText(text: string): string {
  return text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim();
}

function isGibberishWord(word: string): boolean {
  if (/(.)\1{3,}/i.test(word)) return true;
  if (/[bcdfghjklmnpqrstvwxyz]{6,}/i.test(word)) return true;
  if (word.length >= 4 && !/[aeiouáéíóúü]/i.test(word)) return true;
  return false;
}

export function validateLinguisticQuality(
  userAnswer: string,
  canonicalQuestion: string
): string | null {
  const cleaned = userAnswer.replace(/\s+/g, ' ').trim();
  if (cleaned.length < 20) {
    return 'Tu respuesta es muy corta. Escribe al menos unas 8 palabras con tus propias ideas.';
  }

  const words = cleaned.match(/\p{L}{2,}/gu) ?? [];
  if (words.length < MIN_WORDS) {
    return 'Escribe una respuesta más completa (al menos unas 8 palabras reales) para que el orientador pueda evaluarla.';
  }

  const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
  if (uniqueWords.size < 5 || uniqueWords.size / words.length < 0.35) {
    return 'Parece que se repiten las mismas palabras. Escribe una respuesta natural con tus propias ideas.';
  }

  const gibberishCount = words.filter(isGibberishWord).length;
  if (gibberishCount / words.length > 0.35) {
    return 'El texto contiene caracteres sin sentido. Escribe una respuesta clara en español para poder evaluarla.';
  }

  const normalizedAnswer = normalizeComparableText(cleaned);
  const normalizedQuestion = normalizeComparableText(canonicalQuestion);
  if (normalizedQuestion && normalizedAnswer.includes(normalizedQuestion)) {
    const remainder = normalizedAnswer
      .replace(normalizedQuestion, '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (remainder.length < 6) {
      return 'Copiaste la pregunta de la entrevista. Escribe con tus propias palabras cómo responderías tú.';
    }
  }

  return null;
}

function clampWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();
  return `${words.slice(0, maxWords).join(' ').replace(/[,;:.]+$/, '')}.`;
}

function containsRewriteLeak(text: string): boolean {
  if (LONG_QUOTED_TEMPLATE_REGEX.test(text)) return true;
  return REWRITE_TRIGGER_PATTERNS.some((pattern) => pattern.test(text));
}

function stripRewriteSentences(text: string): string {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const safeSentences = sentences.filter(
    (sentence) => !containsRewriteLeak(sentence)
  );
  return safeSentences.slice(0, 3).join(' ').trim();
}

export function enforceCoachingGuardrails(
  lessonId: LessonId,
  stepType: StepType,
  result: EvaluationResult
): EvaluationResult {
  const part1Passed = Boolean(result.part1.passed);
  const part2Passed = Boolean(result.part2.passed);
  const part3Passed = Boolean(result.part3.passed);
  const score = [part1Passed, part2Passed, part3Passed].filter(Boolean).length;

  const part1Comment = clampWords(result.part1.comment, MAX_WORDS_IN_COMMENT);
  const part2Comment = clampWords(result.part2.comment, MAX_WORDS_IN_COMMENT);
  const part3Comment = clampWords(result.part3.comment, MAX_WORDS_IN_COMMENT);

  if (stepType === 'diagnostic') {
    return {
      part1: { ...result.part1, comment: part1Comment },
      part2: { ...result.part2, comment: part2Comment },
      part3: { ...result.part3, comment: part3Comment },
      score,
      feedback:
        'Guardamos tu punto de partida para compararlo al final de la lección.',
      retryHint: '',
    };
  }

  let safeFeedback = stripRewriteSentences(result.feedback);
  if (!safeFeedback) {
    safeFeedback =
      score === 3
        ? '¡Muy buen trabajo! Tu respuesta cubre con claridad las tres partes de la estructura.'
        : 'Tu respuesta tiene una base útil, pero todavía faltan elementos clave de la fórmula. Revisa los puntos por fortalecer arriba e inténtalo de nuevo.';
  }

  let safeRetryHint = '';
  if (score < 3) {
    const candidateHint = result.retryHint.trim();
    const isValidQuestion =
      candidateHint.length > 8 &&
      candidateHint.includes('?') &&
      !containsRewriteLeak(candidateHint);

    if (isValidQuestion) {
      safeRetryHint = candidateHint;
    } else {
      const fallbacks = FALLBACK_QUESTIONS[lessonId];
      if (!part1Passed) safeRetryHint = fallbacks.part1;
      else if (!part2Passed) safeRetryHint = fallbacks.part2;
      else safeRetryHint = fallbacks.part3;
    }
  }

  return {
    part1: { ...result.part1, comment: part1Comment },
    part2: { ...result.part2, comment: part2Comment },
    part3: { ...result.part3, comment: part3Comment },
    score,
    feedback: safeFeedback,
    retryHint: safeRetryHint,
  };
}

interface CacheEntry {
  value: { result: EvaluationResult; provider: string };
  expiresAt: number;
}

const evaluationCache = new Map<string, CacheEntry>();

export function buildCacheKey(params: {
  lessonId: LessonId;
  stepType: StepType;
  targetRole: string;
  stage: string;
  userAnswer: string;
  attemptNumber: number;
}): string {
  const normalizedAnswer = params.userAnswer
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
  const attemptBucket =
    params.stepType === 'practice' ? String(params.attemptNumber) : '1';
  return `${params.lessonId}|${params.stepType}|${params.stage}|${params.targetRole.toLowerCase()}|${attemptBucket}|${normalizedAnswer}`;
}

export function getCachedEvaluation(
  key: string
): { result: EvaluationResult; provider: string } | null {
  const entry = evaluationCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    evaluationCache.delete(key);
    return null;
  }
  // Refresh LRU order
  evaluationCache.delete(key);
  evaluationCache.set(key, entry);
  return entry.value;
}

export function setCachedEvaluation(
  key: string,
  value: { result: EvaluationResult; provider: string }
): void {
  if (evaluationCache.size >= CACHE_MAX_ENTRIES) {
    const oldestKey = evaluationCache.keys().next().value;
    if (oldestKey) evaluationCache.delete(oldestKey);
  }
  evaluationCache.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

const rateBuckets = new Map<string, number[]>();

export function checkRateLimit(clientKey: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  if (rateBuckets.size > 500) {
    for (const [k, timestamps] of rateBuckets.entries()) {
      const fresh = timestamps.filter((t) => t > windowStart);
      if (fresh.length === 0) rateBuckets.delete(k);
      else rateBuckets.set(k, fresh);
    }
  }

  const timestamps = (rateBuckets.get(clientKey) ?? []).filter(
    (t) => t > windowStart
  );
  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateBuckets.set(clientKey, timestamps);
    return false;
  }

  timestamps.push(now);
  rateBuckets.set(clientKey, timestamps);
  return true;
}
