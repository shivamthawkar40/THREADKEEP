const Review = require('../models/Review');
const ExtractedKnowledge = require('../models/ExtractedKnowledge');
const ActivityLog = require('../models/ActivityLog');

// @desc    Submit a human review decision (approve, reject, edit)
// @route   POST /api/reviews
const createReview = async (req, res, next) => {
  try {
    const { projectId, itemType, itemId, action, previousValue, newValue, comment } = req.body;

    if (!projectId || !itemType || !itemId || !action) {
      return res.status(400).json({ success: false, message: 'Missing required review fields' });
    }

    const review = await Review.create({
      project: projectId,
      itemType,
      itemId,
      action,
      previousValue,
      newValue,
      comment: comment || '',
      reviewer: req.user._id,
      reviewerName: req.user.name,
    });

    // If an item in ExtractedKnowledge is approved or edited, update it
    const knowledge = await ExtractedKnowledge.findOne({ project: projectId }).sort({ version: -1 });
    if (knowledge) {
      // Check objectives
      const obj = knowledge.objectives.find(o => o.id === itemId);
      if (obj) {
        obj.reviewStatus = action;
        if (action === 'edited' && newValue?.title) obj.title = newValue.title;
        if (comment) obj.reviewNotes = comment;
      }

      // Check tasks
      const taskC = knowledge.completedTasks.find(t => t.id === itemId);
      if (taskC) {
        taskC.reviewStatus = action;
        if (action === 'edited' && newValue?.title) taskC.title = newValue.title;
        if (comment) taskC.reviewNotes = comment;
      }

      const taskP = knowledge.pendingTasks.find(t => t.id === itemId);
      if (taskP) {
        taskP.reviewStatus = action;
        if (action === 'edited' && newValue?.title) taskP.title = newValue.title;
        if (comment) taskP.reviewNotes = comment;
      }

      await knowledge.save();
    }

    await ActivityLog.create({
      project: projectId,
      user: req.user._id,
      userName: req.user.name,
      action: action === 'approved' ? 'finding_approved' : action === 'rejected' ? 'finding_rejected' : 'finding_edited',
      entityType: 'review',
      entityId: review._id,
      title: `Finding [${itemType} / ${itemId}] marked ${action}`,
      details: comment || `Action ratified by reviewer ${req.user.name}`,
      severity: action === 'approved' ? 'success' : 'warning',
    });

    res.status(201).json({ success: true, review });
  } catch (err) {
    next(err);
  }
};

// @desc    Get review audit trail for a project
// @route   GET /api/reviews/project/:projectId
const getReviews = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const reviews = await Review.find({ project: projectId }).sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    next(err);
  }
};

module.exports = { createReview, getReviews };
