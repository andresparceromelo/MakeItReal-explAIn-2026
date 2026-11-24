import {
  DIAGNOSTIC_JSON_SCHEMA,
  EVALUATION_JSON_SCHEMA,
  buildSystemInstruction,
  buildUserPrompt,
  parseJsonObject,
} from '../prompts';
import {
  AIProviderAdapter,
  AIProviderError,
  AIProviderId,
  EvaluatorInput,
  RawProviderResponse,
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
  selectModels?: (input: EvaluatorInput) => OpenAICompatibleModelOption[];
  supportsJsonSchema?: boolean;
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

function isJsonSchemaRejection(status: number, body: string): boolean {
  if (status !== 400) return false;
  const lower = body.toLowerCase();
  return (
    lower.includes('json_schema') ||
    lower.includes('response_format') ||
    lower.includes('structured')
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

    async evaluate(input: EvaluatorInput): Promise<RawProviderResponse> {
      const apiKey = config.getApiKey()?.trim();
      const rawBaseUrl = config.getBaseUrl()?.trim();
      if (!apiKey || !rawBaseUrl) {
        throw new AIProviderError(config.id, `${config.name} not configured`, {
          retryable: true,
        });
      }

      const endpoint = `${rawBaseUrl.replace(/\/+$/, '')}/chat/completions`;
      const baseModels = config.selectModels
        ? config.selectModels(input)
        : config.defaultModels;

      const configuredModel = config.getConfiguredModel?.()?.trim();
      const matchedDefault = configuredModel
        ? baseModels.find((m) => m.model === configuredModel)
        : undefined;
      const candidates: OpenAICompatibleModelOption[] = configuredModel
        ? [
            matchedDefault ?? { model: configuredModel },
            ...baseModels.filter((m) => m.model !== configuredModel),
          ]
        : baseModels;

      const useStrictSchema = Boolean(config.supportsJsonSchema);
      const systemPrompt = buildSystemInstruction(
        input.lessonId,
        input.stepType,
        true
      );
      const userPrompt = buildUserPrompt(input);
      const maxTokens = input.stepType === 'diagnostic' ? 280 : 560;
      const jsonSchema =
        input.stepType === 'diagnostic'
          ? DIAGNOSTIC_JSON_SCHEMA
          : EVALUATION_JSON_SCHEMA;

      let lastError: AIProviderError | undefined;

      for (const candidate of candidates) {
        const formatModes: Array<'json_schema' | 'json_object'> =
          useStrictSchema ? ['json_schema', 'json_object'] : ['json_object'];

        for (const mode of formatModes) {
          try {
            const responseFormat =
              mode === 'json_schema'
                ? { type: 'json_schema', json_schema: jsonSchema }
                : { type: 'json_object' };

            const response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                ...(config.extraHeaders ? config.extraHeaders() : {}),
              },
              body: JSON.stringify({
                model: candidate.model,
                temperature: 0.1,
                max_tokens: maxTokens,
                response_format: responseFormat,
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
              if (
                mode === 'json_schema' &&
                isJsonSchemaRejection(response.status, errorBody)
              ) {
                continue;
              }
              const retryable = isRetryableStatus(response.status);
              lastError = new AIProviderError(
                config.id,
                `${config.name} (${candidate.model}) HTTP ${response.status}: ${errorBody.slice(0, 200)}`,
                { status: response.status, retryable }
              );
              if (!retryable) {
                throw lastError;
              }
              break;
            }

            const data = (await response.json()) as {
              choices?: Array<{ message?: { content?: string | null } }>;
              usage?: {
                prompt_tokens?: number;
                completion_tokens?: number;
                total_tokens?: number;
              };
            };
            const rawText = data.choices?.[0]?.message?.content;
            if (!rawText || typeof rawText !== 'string') {
              lastError = new AIProviderError(
                config.id,
                `${config.name} (${candidate.model}) returned empty content`,
                { retryable: true }
              );
              break;
            }

            return {
              payload: parseJsonObject(rawText),
              model: candidate.model,
              usage: data.usage
                ? {
                    promptTokens: data.usage.prompt_tokens,
                    completionTokens: data.usage.completion_tokens,
                    totalTokens: data.usage.total_tokens,
                  }
                : undefined,
            };
          } catch (err) {
            if (err instanceof AIProviderError) {
              lastError = err;
              if (!err.retryable) {
                throw err;
              }
              break;
            }
            lastError = new AIProviderError(
              config.id,
              `${config.name} (${candidate.model}) request failed: ${
                err instanceof Error ? err.message : 'Unknown error'
              }`,
              { retryable: true, cause: err }
            );
            break;
          }
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
