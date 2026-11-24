import { LessonId, StepType } from '@/types';

export type AIProviderId =
  | 'groq'
  | 'gemini'
  | 'openai'
  | 'openrouter'
  | 'custom';

export interface EvaluatorInput {
  lessonId: LessonId;
  stepType: StepType;
  targetRole: string;
  stage: string;
  question: string;
  userAnswer: string;
  attemptNumber: number;
}

export interface RawCriterionPayload {
  passed?: unknown;
  comment?: unknown;
}

export interface RawEvaluationPayload {
  part1?: RawCriterionPayload;
  part2?: RawCriterionPayload;
  part3?: RawCriterionPayload;
  feedback?: unknown;
  retryHint?: unknown;
}

export interface TokenUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface RawProviderResponse {
  payload: RawEvaluationPayload;
  model?: string;
  usage?: TokenUsage;
}

export interface AIProviderAdapter {
  readonly id: AIProviderId;
  readonly name: string;
  isConfigured(): boolean;
  evaluate(input: EvaluatorInput): Promise<RawProviderResponse>;
}

export class AIProviderError extends Error {
  readonly providerId: AIProviderId;
  readonly status?: number;
  readonly retryable: boolean;

  constructor(
    providerId: AIProviderId,
    message: string,
    options?: { status?: number; retryable?: boolean; cause?: unknown }
  ) {
    super(message);
    this.name = 'AIProviderError';
    this.providerId = providerId;
    this.status = options?.status;
    this.retryable = options?.retryable ?? true;
    if (options?.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

export class NoAIProviderConfiguredError extends Error {
  constructor() {
    super('No AI provider credentials configured.');
    this.name = 'NoAIProviderConfiguredError';
  }
}
