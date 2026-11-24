import {
  buildSystemInstruction,
  buildUserPrompt,
  parseJsonObject,
} from '../prompts';
import {
  AIProviderAdapter,
  AIProviderError,
  AIProviderId,
  EvaluatorInput,
  RawEvaluationPayload,
} from '../types';

export interface OpenAICompatibleModelOption {
  model: string;
  extraBody?: Record<string, unknown>;
}

export interface OpenAICompatibleConfig {
  id: AIProviderId;
  name: string;
  getApiKey: () => string | undefined;
  getBaseUrl: () => string | undefined;
  getConfiguredModel?: () => string | undefined;
  defaultModels: OpenAICompatibleModelOption[];
  extraHeaders?: () => Record<string, string>;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 7000;

function isRetryableStatus(status: number): boolean {
  return (
    status === 404 ||
    status === 408 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
}

export function createOpenAICompatibleAdapter(
  config: OpenAICompatibleConfig
): AIProviderAdapter {
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  return {
    id: config.id,
    name: config.name,

    isConfigured(): boolean {
      return Boolean(config.getApiKey()?.trim() && config.getBaseUrl()?.trim());
    },

    async evaluate(input: EvaluatorInput): Promise<RawEvaluationPayload> {
      const apiKey = config.getApiKey()?.trim();
      const rawBaseUrl = config.getBaseUrl()?.trim();
      if (!apiKey || !rawBaseUrl) {
        throw new AIProviderError(config.id, `${config.name} not configured`, {
          retryable: true,
        });
      }

      const endpoint = `${rawBaseUrl.replace(/\/+$/, '')}/chat/completions`;
      const configuredModel = config.getConfiguredModel?.()?.trim();
      const matchedDefault = configuredModel
        ? config.defaultModels.find((m) => m.model === configuredModel)
        : undefined;
      const candidates: OpenAICompatibleModelOption[] = configuredModel
        ? [
            matchedDefault ?? { model: configuredModel },
            ...config.defaultModels.filter((m) => m.model !== configuredModel),
          ]
        : config.defaultModels;

      const systemPrompt = buildSystemInstruction(
        input.lessonId,
        input.stepType,
        true
      );
      const userPrompt = buildUserPrompt(input);
      const maxTokens = input.stepType === 'diagnostic' ? 450 : 750;

      let lastError: AIProviderError | undefined;

      for (const candidate of candidates) {
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              ...(config.extraHeaders ? config.extraHeaders() : {}),
            },
            body: JSON.stringify({
              model: candidate.model,
              temperature: 0.15,
              max_tokens: maxTokens,
              response_format: { type: 'json_object' },
              ...(candidate.extraBody ?? {}),
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
              ],
            }),
            signal: AbortSignal.timeout(timeoutMs),
          });

          if (!response.ok) {
            const errorBody = await response.text().catch(() => '');
            const retryable = isRetryableStatus(response.status);
            lastError = new AIProviderError(
              config.id,
              `${config.name} (${candidate.model}) HTTP ${response.status}: ${errorBody.slice(0, 200)}`,
              { status: response.status, retryable }
            );
            if (!retryable) {
              throw lastError;
            }
            continue;
          }

          const data = (await response.json()) as {
            choices?: Array<{ message?: { content?: string | null } }>;
          };
          const rawText = data.choices?.[0]?.message?.content;
          if (!rawText || typeof rawText !== 'string') {
            lastError = new AIProviderError(
              config.id,
              `${config.name} (${candidate.model}) returned empty content`,
              { retryable: true }
            );
            continue;
          }

          return parseJsonObject(rawText);
        } catch (err) {
          if (err instanceof AIProviderError) {
            lastError = err;
            if (!err.retryable) {
              throw err;
            }
            continue;
          }
          lastError = new AIProviderError(
            config.id,
            `${config.name} (${candidate.model}) request failed: ${
              err instanceof Error ? err.message : 'Unknown error'
            }`,
            { retryable: true, cause: err }
          );
        }
      }

      throw (
        lastError ??
        new AIProviderError(config.id, `${config.name} failed`, {
          retryable: true,
        })
      );
    },
  };
}
