const OpenAI = require('openai');
const { GoogleGenAI } = require('@google/genai');

const {
  AI_PROVIDER,
  GROQ_API_KEY,
  GROQ_MODEL,
  GEMINI_API_KEY,
  GEMINI_MODEL,
} = require('../config/env');

const primaryProvider = AI_PROVIDER === 'gemini' ? 'gemini' : 'groq';

let groqClient = null;
let geminiClient = null;

if (GROQ_API_KEY) {
  groqClient = new OpenAI({
    apiKey: GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
  });
}

if (GEMINI_API_KEY) {
  try {
    geminiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  } catch (error) {
    console.error('Gemini initialization failed:', error.message);
  }
}

const parseAIJSON = (responseText) => {
  if (!responseText || typeof responseText !== 'string') {
    throw new Error('AI provider returned an empty response.');
  }

  const cleanedText = responseText
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let parsed;

  try {
    parsed = JSON.parse(cleanedText);
  } catch (error) {
    throw new Error(`Invalid JSON returned by AI provider: ${error.message}`);
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('AI response must be a JSON object.');
  }

  return parsed;
};

const generateWithGroq = async (prompt, systemInstruction) => {
  if (!groqClient) {
    throw new Error('Groq API is not configured.');
  }

  const systemMessage = `${systemInstruction || 'You are a helpful project knowledge analysis assistant.'}
Return exactly one valid JSON object. Do not include markdown fences or explanatory text.`;

  const messages = [
    { role: 'system', content: systemMessage },
    { role: 'user', content: prompt },
  ];

  let response;

  try {
    response = await groqClient.chat.completions.create({
      model: GROQ_MODEL,
      include_reasoning: false,
      messages,
      temperature: 0.2,
      max_completion_tokens: 8192,
      reasoning_effort: 'low',
      include_reasoning: false,
      response_format: { type: 'json_object' },
    });
  } catch (error) {
    const status = Number(error.status || error.statusCode);
    const isJSONValidationError =
      status === 400 &&
      /validate JSON|failed_generation/i.test(error.message || '');

    if (!isJSONValidationError) {
      throw error;
    }

    console.warn(
      'Groq JSON-mode validation failed. Retrying once without forced JSON mode.'
    );

    response = await groqClient.chat.completions.create({
      model: GROQ_MODEL,
      include_reasoning: false,
      messages: [
        {
          role: 'system',
          content: `${systemMessage}
Your entire response must be parseable JSON. Ensure all strings are escaped correctly and all objects and arrays are closed.`,
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
      max_completion_tokens: 8192,
      reasoning_effort: 'low',
      include_reasoning: false,
    });
  }

  const choice = response.choices?.[0];
  const message = choice?.message;
  const rawContent = message?.content;

  const responseText = typeof rawContent === 'string'
    ? rawContent
    : Array.isArray(rawContent)
      ? rawContent.map(part => typeof part === 'string' ? part : part?.text || '').join('')
      : '';

  if (!responseText.trim()) {
    console.error('GROQ EMPTY RESPONSE DIAGNOSTIC:', {
      model: GROQ_MODEL,
      finishReason: choice?.finish_reason || null,
      messageKeys: message ? Object.keys(message) : [],
      contentType: typeof rawContent,
      reasoningPresent: Boolean(message?.reasoning),
      reasoningLength: typeof message?.reasoning === 'string'
        ? message.reasoning.length
        : 0,
      refusalPresent: Boolean(message?.refusal),
      usage: response.usage || null,
    });

    throw new Error(
      'Groq returned no final content. Check GROQ EMPTY RESPONSE DIAGNOSTIC.'
    );
  }

  return parseAIJSON(responseText);
};

const generateWithGemini = async (prompt, systemInstruction) => {
  if (!geminiClient) {
    throw new Error('Gemini API is not configured.');
  }

  let response;
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      response = await geminiClient.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: systemInstruction || undefined,
          temperature: 0.2,
        },
      });
      break;
    } catch (error) {
      const status = Number(error.status || error.code);
      const retryable = [500, 502, 503, 504].includes(status);

      if (!retryable || attempt === maxAttempts) {
        throw error;
      }

      const delay = 1500 * (2 ** (attempt - 1));
      console.warn(`Gemini temporary error ${status}. Retry ${attempt + 1}/${maxAttempts}.`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  const responseText =
    typeof response.text === 'function' ? response.text() : response.text;

  return parseAIJSON(responseText);
};

const generateStructuredAI = async (prompt, systemInstruction = '') => {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('A valid prompt is required.');
  }

  const providers = primaryProvider === 'gemini'
    ? [
        { name: 'Gemini', configured: Boolean(geminiClient), run: generateWithGemini },
        { name: 'Groq', configured: Boolean(groqClient), run: generateWithGroq },
      ]
    : [
        { name: 'Groq', configured: Boolean(groqClient), run: generateWithGroq },
        { name: 'Gemini', configured: Boolean(geminiClient), run: generateWithGemini },
      ];

  const availableProviders = providers.filter(provider => provider.configured);

  if (!availableProviders.length) {
    throw new Error('No AI provider is configured. Add GROQ_API_KEY or GEMINI_API_KEY to the root .env file.');
  }

  let lastError;

  for (const provider of availableProviders) {
    try {
      console.log(`Running AI request with ${provider.name}...`);
      const result = await provider.run(prompt, systemInstruction);
      console.log(`${provider.name} structured response generated successfully.`);
      return result;
    } catch (error) {
      lastError = error;
      console.error(`${provider.name} request failed:`, {
        message: error.message,
        status: error.status || error.code || 'Unknown',
      });

      if (provider !== availableProviders[availableProviders.length - 1]) {
        console.warn(`Trying the fallback AI provider after ${provider.name} failure.`);
      }
    }
  }

  throw new Error(`All configured AI providers failed. Last error: ${lastError?.message || 'Unknown error'}`);
};

const generateTextWithGroq = async (prompt, systemInstruction) => {
  if (!groqClient) throw new Error('Groq API is not configured.');

  const response = await groqClient.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: systemInstruction || 'You are THREADKEEP AI Project Companion. Answer only from the supplied project context. Clearly say when information is unavailable.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
  });

  return response.choices?.[0]?.message?.content?.trim() || '';
};

const generateTextWithGemini = async (prompt, systemInstruction) => {
  if (!geminiClient) throw new Error('Gemini API is not configured.');

  const response = await geminiClient.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      systemInstruction: systemInstruction || 'You are THREADKEEP AI Project Companion. Answer only from the supplied project context. Clearly say when information is unavailable.',
      temperature: 0.3,
    },
  });

  return (typeof response.text === 'function' ? response.text() : response.text || '').trim();
};

const generateTextAI = async (prompt, systemInstruction = '') => {
  if (!prompt || typeof prompt !== 'string') throw new Error('A valid prompt is required.');

  const providers = primaryProvider === 'gemini'
    ? [
        { configured: Boolean(geminiClient), run: generateTextWithGemini },
        { configured: Boolean(groqClient), run: generateTextWithGroq },
      ]
    : [
        { configured: Boolean(groqClient), run: generateTextWithGroq },
        { configured: Boolean(geminiClient), run: generateTextWithGemini },
      ];

  const available = providers.filter(provider => provider.configured);
  if (!available.length) throw new Error('No AI provider is configured.');

  let lastError;
  for (const provider of available) {
    try {
      const answer = await provider.run(prompt, systemInstruction);
      if (!answer) throw new Error('AI provider returned an empty response.');
      return answer;
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(`All configured AI providers failed. ${lastError?.message || ''}`);
};

module.exports = {
  isGeminiConfigured: () => Boolean(geminiClient),
  isAIConfigured: () => Boolean(groqClient || geminiClient),
  generateStructuredAI,
  generateTextAI,
  GEMINI_MODEL,
  GROQ_MODEL,
};
