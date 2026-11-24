import { GoogleGenAI, Schema, ThinkingLevel, Type } from '@google/genai';
import {
  buildSystemInstruction,
  buildUserPrompt,
  parseJsonObject,
} from '../prompts';
import {
  AIProviderAdapter,
  AIProviderError,
  EvaluatorInput,
  RawProviderResponse,
} from '../types';

const PER_ATTEMPT_TIMEOUT_MS = 7000;

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

interface GeminiModelCandidate {
  model: string;
  thinkingLevel?: ThinkingLevel;
}

const DEFAULT_MODEL_CHAIN: GeminiModelCandidate[] = [
  { model: 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel.MINIMAL },
  { model: 'gemini-3.5-flash-lite', thinkingLevel: ThinkingLevel.LOW },
  { model: 'gemini-3.5-flash', thinkingLevel: ThinkingLevel.MINIMAL },
  { model: 'gemini-3.6-flash', thinkingLevel: ThinkingLevel.LOW },
  { model: 'gemini-3.8-flash', thinkingLevel: ThinkingLevel.LOW },
];

function isRetryableGeminiError(err: unknown): boolean {
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

export const geminiAdapter: AIProviderAdapter = {
  id: 'gemini',
  name: 'Google Gemini',

  isConfigured(): boolean {
    return Boolean(process.env.GEMINI_API_KEY?.trim());
  },

  async evaluate(input: EvaluatorInput): Promise<RawProviderResponse> {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      throw new AIProviderError('gemini', 'GEMINI_API_KEY missing', {
        retryable: true,
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const configured = process.env.GEMINI_MODEL?.trim();
    const candidates: GeminiModelCandidate[] = configured
      ? [
          { model: configured },
          ...DEFAULT_MODEL_CHAIN.filter((c) => c.model !== configured),
        ]
      : DEFAULT_MODEL_CHAIN;

    const schema =
      input.stepType === 'diagnostic'
        ? diagnosticResponseSchema
        : evaluationResponseSchema;

    const systemInstruction = buildSystemInstruction(
      input.lessonId,
      input.stepType,
      false
    );
    const userPrompt = buildUserPrompt(input);
    const maxOutputTokens = input.stepType === 'diagnostic' ? 280 : 560;

    let lastError: unknown;
    for (const candidate of candidates) {
      try {
        const response = await ai.models.generateContent({
          model: candidate.model,
          contents: userPrompt,
          config: {
            systemInstruction,
            temperature: 0.1,
            maxOutputTokens,
            ...(candidate.thinkingLevel
              ? { thinkingConfig: { thinkingLevel: candidate.thinkingLevel } }
              : {}),
            abortSignal: AbortSignal.timeout(PER_ATTEMPT_TIMEOUT_MS),
            responseMimeType: 'application/json',
            responseSchema: schema,
          },
        });

        const rawText = response.text;
        if (!rawText) {
          throw new Error('Empty response from Gemini');
        }
        return {
          payload: parseJsonObject(rawText),
          model: candidate.model,
          usage: response.usageMetadata
            ? {
                promptTokens: response.usageMetadata.promptTokenCount,
                completionTokens: response.usageMetadata.candidatesTokenCount,
                totalTokens: response.usageMetadata.totalTokenCount,
              }
            : undefined,
        };
      } catch (err) {
        lastError = err;
        if (!isRetryableGeminiError(err)) {
          throw new AIProviderError(
            'gemini',
            err instanceof Error ? err.message : 'Gemini request failed',
            {
              status: (err as { status?: number })?.status,
              retryable: false,
              cause: err,
            }
          );
        }
      }
    }

    throw new AIProviderError(
      'gemini',
      lastError instanceof Error ? lastError.message : 'Gemini failed',
      {
        status: (lastError as { status?: number })?.status,
        retryable: true,
        cause: lastError,
      }
    );
  },
};
