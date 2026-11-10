const mods = [
  'express',
  'cors',
  'dotenv',
  'mongoose',
  'jsonwebtoken',
  'bcryptjs',
  'multer',
  'pdf-parse',
  'mammoth',
  'csv-parser',
  '@google/generative-ai',
  'pdfkit'
];

const results = {};
for (const m of mods) {
  try {
    require(m);
    results[m] = 'OK';
  } catch (err) {
    results[m] = err.message;
  }
}
console.log('Dependencies Status:\n', JSON.stringify(results, null, 2));
