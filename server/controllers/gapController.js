const mongoose = require('mongoose');
const KnowledgeGap = require('../models/KnowledgeGap');
const ActivityLog = require('../models/ActivityLog');
const Project = require('../models/Project');

const VALID_STATUSES = ['open', 'resolved', 'reopened', 'not_applicable'];
const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

// @desc Get all knowledge gaps for an owned project
// @route GET /api/gaps/project/:projectId
const getGaps = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { severity, status } = req.query;

    if (!mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({ success: false, message: 'Invalid project ID.' });
    }

    const project = await Project.findOne({ _id: projectId, owner: req.user._id }).select('_id');
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found or access denied.' });
    }

    if (severity && !['critical', 'high', 'medium', 'low'].includes(severity)) {
      return res.status(400).json({ success: false, message: 'Invalid severity filter.' });
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status filter.' });
    }

    const filter = { project: projectId };
    if (severity) filter.severity = severity;
    if (status) filter.status = status;

    const gaps = await KnowledgeGap.find(filter).lean();

    gaps.sort((a, b) =>
      SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] ||
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json({ success: true, count: gaps.length, gaps });
  } catch (err) {
    next(err);
  }
};

// @desc Update knowledge gap status and reviewer notes
// @route PUT /api/gaps/:id/status
const updateGapStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reviewerComment } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid knowledge gap ID.' });
    }

    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid knowledge gap status.' });
    }

    if (reviewerComment !== undefined && typeof reviewerComment !== 'string') {
      return res.status(400).json({ success: false, message: 'Reviewer comment must be text.' });
    }

    const gap = await KnowledgeGap.findById(id);
    if (!gap) {
      return res.status(404).json({ success: false, message: 'Knowledge gap not found.' });
    }

    const project = await Project.findOne({ _id: gap.project, owner: req.user._id }).select('_id');
    if (!project) {
      return res.status(404).json({ success: false, message: 'Knowledge gap not found or access denied.' });
    }

    const previousStatus = gap.status;
    const statusChanged = status !== undefined && status !== previousStatus;

    if (statusChanged) {
      gap.status = status;

      if (status === 'resolved') {
        gap.resolvedBy = req.user._id;
        gap.resolvedAt = new Date();
      } else {
        gap.resolvedBy = undefined;
        gap.resolvedAt = undefined;
      }
    }

    if (reviewerComment !== undefined) {
      gap.reviewerComment = reviewerComment.trim();
    }

    await gap.save();

    if (statusChanged) {
      const openGapsCount = await KnowledgeGap.countDocuments({
        project: gap.project,
        status: { $in: ['open', 'reopened'] },
      });

      await Project.updateOne(
        { _id: gap.project },
        { $set: { 'stats.openGaps': openGapsCount } }
      );

      const action = status === 'resolved' ? 'gap_resolved' :
        status === 'reopened' || status === 'open' ? 'gap_reopened' : null;

      if (action) {
        await ActivityLog.create({
          project: gap.project,
          user: req.user._id,
          userName: req.user.name,
          action,
          entityType: 'gap',
          entityId: gap._id.toString(),
          title: `Knowledge Gap "${gap.title}" marked as ${gap.status}`,
          details: gap.reviewerComment
            ? `Reviewer Note: ${gap.reviewerComment}`
            : `Status transitioned from ${previousStatus} to ${gap.status}.`,
          severity: status === 'resolved' ? 'success' : 'info',
        });
      }
    }

    res.json({ success: true, gap });
  } catch (err) {
    next(err);
  }
};

module.exports = { getGaps, updateGapStatus };

