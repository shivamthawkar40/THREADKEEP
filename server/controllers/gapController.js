const KnowledgeGap = require('../models/KnowledgeGap');
const ActivityLog = require('../models/ActivityLog');
const Project = require('../models/Project');

// @desc    Get all knowledge gaps for a project
// @route   GET /api/gaps/project/:projectId
const getGaps = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { severity, status } = req.query;

    const filter = { project: projectId };
    if (severity) filter.severity = severity;
    if (status) filter.status = status;

    const gaps = await KnowledgeGap.find(filter).sort({
      // Critical first, then High, Medium, Low
      severity: 1,
      createdAt: -1,
    });

    res.json({ success: true, count: gaps.length, gaps });
  } catch (err) {
    next(err);
  }
};

// @desc    Update knowledge gap status and reviewer notes
// @route   PUT /api/gaps/:id/status
const updateGapStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reviewerComment } = req.body;

    const gap = await KnowledgeGap.findById(id);
    if (!gap) {
      return res.status(404).json({ success: false, message: 'Knowledge gap not found' });
    }

    const previousStatus = gap.status;
    if (status) {
      gap.status = status;
      if (status === 'resolved') {
        gap.resolvedBy = req.user._id;
        gap.resolvedAt = new Date();
      }
    }
    if (reviewerComment !== undefined) {
      gap.reviewerComment = reviewerComment;
    }

    await gap.save();

    // Update project stats
    const openGapsCount = await KnowledgeGap.countDocuments({ project: gap.project, status: 'open' });
    await Project.updateOne({ _id: gap.project }, { 'stats.openGaps': openGapsCount });

    await ActivityLog.create({
      project: gap.project,
      user: req.user._id,
      userName: req.user.name,
      action: status === 'resolved' ? 'gap_resolved' : 'gap_reopened',
      entityType: 'gap',
      entityId: gap._id,
      title: `Knowledge Gap "${gap.title}" marked as ${gap.status}`,
      details: reviewerComment ? `Reviewer Note: ${reviewerComment}` : `Status transitioned from ${previousStatus} to ${gap.status}.`,
      severity: status === 'resolved' ? 'success' : 'info',
    });

    res.json({ success: true, gap });
  } catch (err) {
    next(err);
  }
};

module.exports = { getGaps, updateGapStatus };
