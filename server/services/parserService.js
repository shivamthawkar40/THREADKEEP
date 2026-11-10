const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const csvParser = require('csv-parser');

/**
 * Parse any supported document file into rawText and structured sections
 * @param {string} filePath
 * @param {string} originalName
 * @returns {Promise<{rawText: string, wordCount: number, pageCount: number, sections: Array, fileType: string}>}
 */
const parseDocument = async (filePath, originalName) => {
  const ext = path.extname(originalName).toLowerCase().replace('.', '');
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  let rawText = '';
  let pageCount = 1;
  let sections = [];

  switch (ext) {
    case 'pdf': {
      const dataBuffer = fs.readFileSync(filePath);
      const parsed = await pdfParse(dataBuffer);
      rawText = parsed.text || '';
      pageCount = parsed.numpages || 1;
      
      // Split by pages or double line breaks to build section references
      const pages = rawText.split(/\f|\n{3,}/g);
      sections = pages.map((pageContent, idx) => {
        const lines = pageContent.trim().split('\n');
        const firstLine = lines[0] ? lines[0].substring(0, 80).trim() : `Section ${idx + 1}`;
        return {
          sectionNumber: idx + 1,
          title: firstLine,
          page: idx + 1,
          lineStart: 1,
          content: pageContent.trim(),
        };
      }).filter(s => s.content.length > 0);

      if (sections.length === 0) {
        sections.push({
          sectionNumber: 1,
          title: 'Document Content',
          page: 1,
          lineStart: 1,
          content: rawText.trim(),
        });
      }
      break;
    }

    case 'docx': {
      const result = await mammoth.extractRawText({ path: filePath });
      rawText = result.value || '';
      
      const paragraphs = rawText.split(/\n\s*\n/g).filter(p => p.trim().length > 0);
      let approxPage = 1;
      sections = paragraphs.map((para, idx) => {
        approxPage = Math.floor(idx / 5) + 1;
        const lines = para.trim().split('\n');
        return {
          sectionNumber: idx + 1,
          title: lines[0] ? lines[0].substring(0, 80).trim() : `Paragraph ${idx + 1}`,
          page: approxPage,
          lineStart: idx * 6 + 1,
          content: para.trim(),
        };
      });
      pageCount = approxPage;
      break;
    }

    case 'csv': {
      const rows = [];
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csvParser())
          .on('data', (data) => rows.push(data))
          .on('end', resolve)
          .on('error', reject);
      });

      const formattedRows = rows.map((r, i) => `Row ${i + 1}: ` + Object.entries(r).map(([k, v]) => `${k}=${v}`).join(' | '));
      rawText = formattedRows.join('\n');
      pageCount = Math.max(1, Math.ceil(rows.length / 25));

      sections = rows.map((r, i) => ({
        sectionNumber: i + 1,
        title: `Record #${i + 1} (${Object.keys(r)[0] || 'Entry'}: ${Object.values(r)[0] || ''})`,
        page: Math.floor(i / 25) + 1,
        lineStart: i + 1,
        content: Object.entries(r).map(([k, v]) => `${k}: ${v}`).join('\n'),
      }));
      break;
    }

    case 'txt':
    case 'md':
    default: {
      rawText = fs.readFileSync(filePath, 'utf-8');
      const paragraphs = rawText.split(/\n\s*\n/g).filter(p => p.trim().length > 0);
      pageCount = Math.max(1, Math.ceil(paragraphs.length / 4));

      sections = paragraphs.map((para, idx) => {
        const lines = para.trim().split('\n');
        return {
          sectionNumber: idx + 1,
          title: lines[0] ? lines[0].substring(0, 80).trim() : `Section ${idx + 1}`,
          page: Math.floor(idx / 4) + 1,
          lineStart: idx * 5 + 1,
          content: para.trim(),
        };
      });
      break;
    }
  }

  const wordCount = rawText ? rawText.trim().split(/\s+/).filter(Boolean).length : 0;

  return {
    rawText,
    wordCount,
    pageCount,
    sections,
    fileType: ext === 'md' ? 'txt' : ext,
  };
};

module.exports = { parseDocument };
