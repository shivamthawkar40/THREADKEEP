const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GEMINI_API_KEY } = require('../config/env');

let genAI = null;
if (GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    console.log('✓ Gemini API initialized successfully.');
  } catch (err) {
    console.warn('⚠️ Could not initialize GoogleGenerativeAI:', err.message);
  }
}

/**
 * Generate structured response using Gemini if configured
 * @param {string} prompt
 * @param {string} systemInstruction
 * @returns {Promise<any | null>}
 */
const generateStructuredAI = async (prompt, systemInstruction = '') => {
  if (!genAI || !GEMINI_API_KEY) {
    return null; // Signals fallback to deterministic intelligence engine
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
      systemInstruction: systemInstruction || undefined,
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);
    return parsed;
  } catch (err) {
    console.warn('Gemini API call failed, falling back to Intelligence Engine:', err.message);
    return null;
  }
};

module.exports = {
  isGeminiConfigured: () => Boolean(GEMINI_API_KEY && genAI),
  generateStructuredAI,
};
