import { createOpenAICompatibleAdapter } from './openai-compatible';

export const groqAdapter = createOpenAICompatibleAdapter({
  id: 'groq',
  name: 'Groq',
  getApiKey: () => process.env.GROQ_API_KEY,
  getBaseUrl: () => process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
  getConfiguredModel: () => process.env.GROQ_MODEL,
  defaultModels: [
    {
      model: 'openai/gpt-oss-120b',
      extraBody: { reasoning_effort: 'low' },
    },
    {
      model: 'openai/gpt-oss-20b',
      extraBody: { reasoning_effort: 'low' },
    },
    {
      model: 'qwen/qwen3.8-27b',
      extraBody: { reasoning_effort: 'none' },
    },
  ],
  timeoutMs: 6000,
});

export const openaiAdapter = createOpenAICompatibleAdapter({
  id: 'openai',
  name: 'OpenAI',
  getApiKey: () => process.env.OPENAI_API_KEY,
  getBaseUrl: () => process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  getConfiguredModel: () => process.env.OPENAI_MODEL,
  defaultModels: [{ model: 'gpt-4o-mini' }, { model: 'gpt-4.1-mini' }],
});

export const openrouterAdapter = createOpenAICompatibleAdapter({
  id: 'openrouter',
  name: 'OpenRouter',
  getApiKey: () => process.env.OPENROUTER_API_KEY,
  getBaseUrl: () =>
    process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  getConfiguredModel: () => process.env.OPENROUTER_MODEL,
  defaultModels: [
    { model: 'meta-llama/llama-3.3-70b-instruct:free' },
    { model: 'openai/gpt-4o-mini' },
  ],
  extraHeaders: () => ({
    'X-Title': 'MakeItReal (hacelo real)',
  }),
});

export const customAdapter = createOpenAICompatibleAdapter({
  id: 'custom',
  name: 'Custom OpenAI-Compatible Provider',
  getApiKey: () => process.env.AI_API_KEY,
  getBaseUrl: () => process.env.AI_BASE_URL,
  getConfiguredModel: () => process.env.AI_MODEL,
  defaultModels: [],
});
