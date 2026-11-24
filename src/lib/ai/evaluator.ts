import { EvaluationResult } from '@/types';
import {
  buildCacheKey,
  enforceCoachingGuardrails,
  getCachedEvaluation,
  setCachedEvaluation,
} from './guardrails';
import { normalizeEvaluationResult } from './prompts';
import {
  customAdapter,
  groqAdapter,
  openaiAdapter,
  openrouterAdapter,
} from './providers/compatible';
import { geminiAdapter } from './providers/gemini';
import {
  AIProviderAdapter,
  AIProviderError,
  AIProviderId,
  EvaluatorInput,
  NoAIProviderConfiguredError,
  TokenUsage,
} from './types';

const ADAPTERS: Record<AIProviderId, AIProviderAdapter> = {
  groq: groqAdapter,
  gemini: geminiAdapter,
  openrouter: openrouterAdapter,
  openai: openaiAdapter,
  custom: customAdapter,
};

const DEFAULT_PROVIDER_ORDER: AIProviderId[] = [
  'groq',
  'gemini',
  'openrouter',
  'openai',
  'custom',
];

function isValidProviderId(value: string): value is AIProviderId {
  return value in ADAPTERS;
}

export function resolveProviderChain(): AIProviderAdapter[] {
  const explicitOrder = process.env.AI_FALLBACK_ORDER?.split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(isValidProviderId);

  const primary = process.env.AI_PROVIDER?.trim().toLowerCase();
  const baseOrder =
    explicitOrder && explicitOrder.length > 0
      ? explicitOrder
      : DEFAULT_PROVIDER_ORDER;

  const orderedIds =
    primary && isValidProviderId(primary)
      ? [primary, ...baseOrder.filter((id) => id !== primary)]
      : baseOrder;

  const uniqueIds = Array.from(new Set(orderedIds));
  const configured = uniqueIds
    .map((id) => ADAPTERS[id])
    .filter((adapter) => adapter.isConfigured());

  if (process.env.AI_DISABLE_FALLBACK === 'true' && configured.length > 1) {
    return [configured[0]];
  }

  return configured;
}

export interface EvaluateOutput {
  result: EvaluationResult;
  provider: string;
  cached: boolean;
  model?: string;
  usage?: TokenUsage;
}

export async function evaluateInterviewAnswer(
  input: EvaluatorInput
): Promise<EvaluateOutput> {
  const cacheKey = buildCacheKey({
    lessonId: input.lessonId,
    stepType: input.stepType,
    targetRole: input.targetRole,
    stage: input.stage,
    userAnswer: input.userAnswer,
    attemptNumber: input.attemptNumber,
  });

  const cached = getCachedEvaluation(cacheKey);
  if (cached) {
    return {
      result: cached.result,
      provider: cached.provider,
      cached: true,
    };
  }

  const chain = resolveProviderChain();
  if (chain.length === 0) {
    throw new NoAIProviderConfiguredError();
  }

  let lastError: unknown;

  for (const adapter of chain) {
    try {
      const response = await adapter.evaluate(input);
      const normalized = normalizeEvaluationResult(
        input.lessonId,
        response.payload
      );
      const guarded = enforceCoachingGuardrails(
        input.lessonId,
        input.stepType,
        normalized
      );

      setCachedEvaluation(cacheKey, {
        result: guarded,
        provider: adapter.id,
      });

      return {
        result: guarded,
        provider: adapter.id,
        cached: false,
        model: response.model,
        usage: response.usage,
      };
    } catch (err) {
      lastError = err;
      console.warn(
        `AI provider "${adapter.id}" failed:`,
        err instanceof Error ? err.message : err
      );
      if (err instanceof AIProviderError && !err.retryable) {
        continue;
      }
    }
  }

  throw lastError;
}
