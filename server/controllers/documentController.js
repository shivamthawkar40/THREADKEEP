const fs = require('fs');
const Document = require('../models/Document');
const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');
const { parseDocument } = require('../services/parserService');
const cloudinary = require('../config/cloudinary');

const removeTempFile = (filePath) => {
  if (!filePath) return;

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.warn('Temporary file cleanup failed:', err.message);
  }
};

const getOwnedProject = async (projectId, userId) => {
  return Project.findOne({
    _id: projectId,
    owner: userId,
  });
};

// Upload and process documents
const uploadDocuments = async (req, res, next) => {
  const { projectId } = req.params;

  try {
    const project = await getOwnedProject(projectId, req.user._id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (!req.files?.length) {
      return res.status(400).json({
        success: false,
        message: 'No documents provided for upload',
      });
    }

    const processedDocs = [];

    for (const file of req.files) {
      let cloudResult = null;

      try {
        // Parse before removing the temporary file
        const parsedData = await parseDocument(
          file.path,
          file.originalname
        );

        // Upload original file to Cloudinary
        cloudResult = await cloudinary.uploader.upload(file.path, {
          resource_type: 'raw',
          folder: 'threadkeep/documents',
          use_filename: true,
          unique_filename: true,
          overwrite: false,
        });

        // Save metadata in MongoDB
        const docRecord = await Document.create({
          project: project._id,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          filePath: '',
          storageProvider: 'cloudinary',
          fileUrl: cloudResult.secure_url,
          cloudinaryPublicId: cloudResult.public_id,
          cloudinaryResourceType: 'raw',
          fileType: parsedData.fileType,
          status: 'processed',
          rawText: parsedData.rawText,
          wordCount: parsedData.wordCount,
          pageCount: parsedData.pageCount,
          sections: parsedData.sections,
          uploadedBy: req.user._id,
        });

        processedDocs.push(docRecord);

        await ActivityLog.create({
          project: project._id,
          user: req.user._id,
          userName: req.user.name,
          action: 'document_uploaded',
          entityType: 'document',
          entityId: docRecord._id,
          title: `Document "${file.originalname}" processed`,
          details: `Extracted ${parsedData.wordCount} words across ${parsedData.pageCount} pages/sections.`,
          severity: 'info',
        });

      } catch (docErr) {
        console.error(
          `Document processing failed: ${file.originalname}`,
          docErr.message
        );

        if (cloudResult?.public_id) {
          try {
            await cloudinary.uploader.destroy(cloudResult.public_id, {
              resource_type: 'raw',
              invalidate: true,
            });
          } catch (cleanupErr) {
            console.error('Cloudinary cleanup failed:', cleanupErr.message);
          }
        }

        const errorRecord = await Document.create({
          project: project._id,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          filePath: '',
          storageProvider: 'local',
          fileType: 'txt',
          status: 'error',
          errorMessage: docErr.message,
          uploadedBy: req.user._id,
        });

        processedDocs.push(errorRecord);

      } finally {
        removeTempFile(file.path);
      }
    }

    const totalDocs = await Document.countDocuments({
      project: project._id,
    });

    project.stats.totalDocuments = totalDocs;
    await project.save();

    return res.status(201).json({
      success: true,
      message: `Processed ${processedDocs.length} documents.`,
      documents: processedDocs,
    });

  } catch (err) {
    if (req.files) {
      req.files.forEach(file => removeTempFile(file.path));
    }

    next(err);
  }
};

// Get project documents
const getProjectDocuments = async (req, res, next) => {
  try {
    const project = await getOwnedProject(
      req.params.projectId,
      req.user._id
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const documents = await Document.find({
      project: project._id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: documents.length,
      documents,
    });

  } catch (err) {
    next(err);
  }
};

// Get document details
const getDocumentById = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    const project = await getOwnedProject(
      document.project,
      req.user._id
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    res.json({
      success: true,
      document,
    });

  } catch (err) {
    next(err);
  }
};

// Delete document
const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    const project = await getOwnedProject(
      document.project,
      req.user._id
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Delete Cloudinary asset first
    if (
      document.storageProvider === 'cloudinary' &&
      document.cloudinaryPublicId
    ) {
      await cloudinary.uploader.destroy(
        document.cloudinaryPublicId,
        {
          resource_type: document.cloudinaryResourceType || 'raw',
          invalidate: true,
        }
      );
    }

    // Remove legacy local file
    if (document.filePath) {
      removeTempFile(document.filePath);
    }

    await Document.deleteOne({
      _id: document._id,
    });

    const totalDocs = await Document.countDocuments({
      project: project._id,
    });

    project.stats.totalDocuments = totalDocs;
    await project.save();

    await ActivityLog.create({
      project: project._id,
      user: req.user._id,
      userName: req.user.name,
      action: 'document_deleted',
      entityType: 'document',
      entityId: document._id,
      title: `Document "${document.originalName}" removed`,
      severity: 'warning',
    });

    res.json({
      success: true,
      message: 'Document deleted successfully',
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadDocuments,
  getProjectDocuments,
  getDocumentById,
  deleteDocument,
};