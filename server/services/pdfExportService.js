const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { UPLOAD_DIR } = require('../config/env');

/**
 * Generate a professional THREADKEEP Handover PDF.
 * @param {object} handover
 * @param {object} project
 * @returns {Promise<string>} Absolute filesystem path of generated PDF
 */
const generateHandoverPDF = async (handover, project) => {
  return new Promise((resolve, reject) => {
    let doc;
    let writeStream;
    let settled = false;

    const fail = (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    };

    try {
      if (!UPLOAD_DIR) {
        throw new Error('UPLOAD_DIR is not configured.');
      }

      if (!handover || !project) {
        throw new Error('Handover or project data is missing.');
      }

      // Ensure uploads directory exists
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });

      const fileName = `handover-${project.key || 'PROJ'}-${Date.now()}.pdf`;
      const filePath = path.resolve(UPLOAD_DIR, fileName);

      doc = new PDFDocument({
        margin: 50,
        size: 'A4',
        bufferPages: true,
        info: {
          Title: `THREADKEEP Handover: ${project.name || 'Project'}`,
          Author: 'THREADKEEP Platform',
          Subject: 'Executive Project Knowledge Handover',
        },
      });

      writeStream = fs.createWriteStream(filePath);

      writeStream.on('error', (error) => {
        console.error('PDF Write Error:', error);
        fail(error);
      });

      doc.on('error', (error) => {
        console.error('PDF Generation Error:', error);
        fail(error);
      });

      writeStream.on('finish', () => {
        if (settled) return;

        try {
          const stats = fs.statSync(filePath);

          if (stats.size < 100) {
            throw new Error('Generated PDF file is empty or incomplete.');
          }

          const fd = fs.openSync(filePath, 'r');
          const header = Buffer.alloc(5);

          try {
            fs.readSync(fd, header, 0, 5, 0);
          } finally {
            fs.closeSync(fd);
          }

          if (header.toString() !== '%PDF-') {
            throw new Error('Generated file is not a valid PDF.');
          }

          settled = true;

          console.log('PDF generated successfully:', filePath);
          console.log('PDF file size:', stats.size, 'bytes');

          resolve(filePath);
        } catch (error) {
          fail(error);
        }
      });

      doc.pipe(writeStream);

      // THREADKEEP palette
      const teal = '#285B55';
      const charcoal = '#303B39';
      const sage = '#A8C5B0';
      const coral = '#D87A6B';
      const lightBg = '#EEF9F5';
      const muted = '#666666';

      let y = 50;

      const checkPage = (requiredSpace = 50) => {
        if (y + requiredSpace > 750) {
          doc.addPage();
          y = 50;
        }
      };

      const addSectionTitle = (title) => {
        checkPage(45);

        doc.rect(50, y, 495, 22).fill(lightBg);

        doc
          .font('Helvetica-Bold')
          .fontSize(11)
          .fillColor(teal)
          .text(title, 60, y + 5);

        y += 32;
      };

      const addParagraph = (text, options = {}) => {
        const content = String(text || 'Not documented.');

        checkPage(40);

        doc
          .font(options.bold ? 'Helvetica-Bold' : 'Helvetica')
          .fontSize(options.fontSize || 9)
          .fillColor(options.color || charcoal)
          .text(content, options.x || 60, y, {
            width: options.width || 470,
            align: options.align || 'left',
            lineGap: 2,
          });

        y = doc.y + (options.spacing ?? 8);
      };

      const addBullet = (text) => {
        addParagraph(`• ${text}`, { x: 65, width: 465, spacing: 6 });
      };

      const safeArray = (value) => Array.isArray(value) ? value : [];

      // =====================================
      // HEADER
      // =====================================

      doc.rect(50, y, 495, 8).fill(teal);
      y += 28;

      doc
        .font('Helvetica-Bold')
        .fontSize(24)
        .fillColor(teal)
        .text('THREADKEEP', 50, y);

      y += 32;

      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor(charcoal)
        .text("A Project's Memory, Reconnected", 50, y);

      y += 25;

      doc
        .font('Helvetica-Bold')
        .fontSize(17)
        .fillColor(charcoal)
        .text('EXECUTIVE HANDOVER REPORT', 50, y);

      y += 35;

      // =====================================
      // PROJECT INFORMATION
      // =====================================

      doc
        .roundedRect(50, y, 495, 85, 6)
        .lineWidth(1)
        .strokeColor(sage)
        .stroke();

      doc
        .font('Helvetica-Bold')
        .fontSize(14)
        .fillColor(teal)
        .text(project.name || 'Untitled Project', 65, y + 12, {
          width: 465,
        });

      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor(charcoal)
        .text(
          `Version: ${handover.version || '1.0.0'}  |  Status: ${handover.status || 'Draft'}`,
          65,
          y + 36
        );

      doc
        .fontSize(9)
        .text(
          `Generated: ${new Date().toLocaleDateString()}`,
          65,
          y + 53
        );

      y += 105;

      // =====================================
      // 1. EXECUTIVE SUMMARY
      // =====================================

      addSectionTitle('1. Executive Summary');

      addParagraph(
        handover.sections?.projectOverview ||
        handover.summary ||
        'Comprehensive project handover generated by THREADKEEP Intelligence.'
      );

      // =====================================
      // 2. PROJECT OBJECTIVES
      // =====================================

      addSectionTitle('2. Project Objectives');

      const objectives = safeArray(handover.sections?.projectObjectives);

      if (objectives.length) {
        objectives.forEach((obj, index) => {
          addParagraph(
            `${index + 1}. ${obj.title || obj}`,
            { bold: true }
          );

          if (obj.description) {
            addParagraph(obj.description, {
              x: 75,
              width: 450,
              color: muted,
            });
          }
        });
      } else {
        addParagraph('No explicit objectives recorded.');
      }

      // =====================================
      // 3. TECHNICAL ARCHITECTURE
      // =====================================

      addSectionTitle('3. Technical Architecture');

      addParagraph(
        handover.sections?.technicalArchitecture?.overview ||
        'Technical architecture details are not documented.'
      );

      // =====================================
      // 4. TECHNOLOGY STACK
      // =====================================

      addSectionTitle('4. Technology Stack');

      const techStack = safeArray(handover.sections?.technologyStack);

      if (techStack.length) {
        techStack.forEach((item) => {
          addBullet(
            `${item.category || 'Core'}: ${item.technology || item} | Version: ${item.version || 'Latest'} | Status: ${item.status || 'Verified'}`
          );
        });
      } else {
        addParagraph('No technology stack details recorded.');
      }

      // =====================================
      // 5. IMPORTANT DECISIONS
      // =====================================

      addSectionTitle('5. Key Decisions & Rationale');

      const decisions = safeArray(handover.sections?.importantDecisions);

      if (decisions.length) {
        decisions.forEach((item, index) => {
          addParagraph(
            `${index + 1}. Decision: ${item.decision || 'Not specified'}`,
            { bold: true }
          );

          addParagraph(
            `Rationale: ${item.rationale || 'Not documented.'}`,
            { x: 75, width: 450 }
          );
        });
      } else {
        addParagraph('No important decisions recorded.');
      }

      // =====================================
      // 6. KNOWLEDGE GAPS
      // =====================================

      addSectionTitle('6. Knowledge Gap Radar');

      const gaps = safeArray(handover.sections?.knowledgeGaps);

      if (gaps.length) {
        gaps.forEach((gap) => {
          checkPage(45);

          addParagraph(
            `[${String(gap.severity || 'Medium').toUpperCase()}] ${gap.title || 'Untitled Gap'}`,
            { bold: true, color: coral }
          );

          addParagraph(
            `Recommended Action: ${gap.recommendation || gap.recommendedAction || 'Review documented workstreams.'}`,
            { x: 75, width: 450 }
          );
        });
      } else {
        addParagraph('No unresolved knowledge gaps recorded.', {
          color: teal,
        });
      }

      // =====================================
      // 7. UNRESOLVED CONFLICTS
      // =====================================

      addSectionTitle('7. Cross-Document Conflicts');

      const conflicts = safeArray(handover.sections?.unresolvedConflicts);

      if (conflicts.length) {
        conflicts.forEach((conflict) => {
          addParagraph(
            `Topic: ${conflict.topic || 'Not specified'} | Severity: ${conflict.severity || 'High'}`,
            { bold: true, color: coral }
          );

          addParagraph(
            `Statement A: ${conflict.statementA || conflict.claimA || 'Not documented.'}`,
            { x: 75, width: 450 }
          );

          addParagraph(
            `Statement B: ${conflict.statementB || conflict.claimB || 'Not documented.'}`,
            { x: 75, width: 450 }
          );
        });
      } else {
        addParagraph('No unresolved conflicts recorded.', {
          color: teal,
        });
      }

      // =====================================
      // 8. RECOMMENDED NEXT ACTIONS
      // =====================================

      addSectionTitle('8. Recommended Next Actions');

      const nextActions = safeArray(
        handover.sections?.recommendedNextActions
      );

      if (nextActions.length) {
        nextActions.forEach((action, index) => {
          addParagraph(`${index + 1}. ${action}`);
        });
      } else {
        addParagraph('No recommended next actions recorded.');
      }

      // =====================================
      // 9. SIGN-OFF
      // =====================================

      checkPage(100);

      y += 15;

      doc
        .roundedRect(50, y, 495, 75, 6)
        .lineWidth(1)
        .strokeColor(sage)
        .stroke();

      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(teal)
        .text('HANDOVER SIGN-OFF & VERIFICATION', 65, y + 10);

      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor(charcoal)
        .text(
          'Outgoing Lead: __________________________   Date: ____________',
          65,
          y + 32
        );

      doc.text(
        'Incoming Lead: __________________________   Date: ____________',
        65,
        y + 49
      );

      // =====================================
      // FOOTER ON EVERY PAGE
      // =====================================

      const pageRange = doc.bufferedPageRange();

      for (
        let page = pageRange.start;
        page < pageRange.start + pageRange.count;
        page++
      ) {
        doc.switchToPage(page);

        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor(muted)
          .text(
            'THREADKEEP | Executive Project Knowledge Handover',
            50,
            765,
            {
              width: 495,
              align: 'center',
              lineBreak: false,
            }
          );
      }

      // Finish writing PDF
      doc.end();

    } catch (error) {
      console.error('PDF Service Error:', error);

      if (doc && !doc.destroyed) {
        doc.destroy();
      }

      if (writeStream && !writeStream.destroyed) {
        writeStream.destroy();
      }

      fail(error);
    }
  });
};

module.exports = {
  generateHandoverPDF,
};