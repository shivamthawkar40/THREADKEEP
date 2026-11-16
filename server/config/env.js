const path = require('path');
const dotenv = require('dotenv');

dotenv.config({
  path: path.resolve(__dirname, '../../.env')
});

// Required environment variables
if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is missing in .env file');
}

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is missing in .env file');
}

module.exports = {
  PORT: process.env.PORT || 5000,

  MONGODB_URI: process.env.MONGODB_URI,

  JWT_SECRET: process.env.JWT_SECRET,

  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  AI_PROVIDER: (process.env.AI_PROVIDER || 'groq').toLowerCase(),

  GROQ_API_KEY: process.env.GROQ_API_KEY || '',

  GROQ_MODEL: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',

  GEMINI_API_KEY:
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    '',

  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-3.8-flash',

  UPLOAD_DIR: path.resolve(__dirname, '../uploads'),

  SAMPLE_FILES_DIR: path.resolve(__dirname, '../sample_files'),
};
