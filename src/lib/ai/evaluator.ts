import { EvaluationResult } from '@/types';
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
  provider: AIProviderId;
}

export async function evaluateInterviewAnswer(
  input: EvaluatorInput
): Promise<EvaluateOutput> {
  const chain = resolveProviderChain();
  if (chain.length === 0) {
    throw new NoAIProviderConfiguredError();
  }

  let lastError: unknown;

  for (const adapter of chain) {
    try {
      const raw = await adapter.evaluate(input);
      return {
        result: normalizeEvaluationResult(input.lessonId, raw),
        provider: adapter.id,
      };
    } catch (err) {
      lastError = err;
      console.warn(
        `AI provider "${adapter.id}" failed:`,
        err instanceof Error ? err.message : err
      );
      if (err instanceof AIProviderError && !err.retryable) {
        // Non-retryable auth/payload error on one provider should still allow fallback
        // to another configured provider unless fallback is disabled.
        continue;
      }
    }
  }

  throw lastError;
}
