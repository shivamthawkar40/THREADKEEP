const mongoose = require('mongoose');
const Conflict = require('../models/Conflict');
const ActivityLog = require('../models/ActivityLog');
const Project = require('../models/Project');

const VALID_STATUSES = ['unresolved', 'confirmed', 'rejected', 'superseded'];
const VALID_CHOICES = ['A', 'B', 'custom', 'none'];

// @desc Get all conflicts for an owned project
// @route GET /api/conflicts/project/:projectId
const getConflicts = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { status, severity } = req.query;

    if (!mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({ success: false, message: 'Invalid project ID.' });
    }

    const project = await Project.findOne({ _id: projectId, owner: req.user._id }).select('_id');
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found or access denied.' });
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid conflict status filter.' });
    }

    if (severity && !['critical', 'high', 'medium', 'low'].includes(severity)) {
      return res.status(400).json({ success: false, message: 'Invalid severity filter.' });
    }

    const filter = { project: projectId };
    if (status) filter.status = status;
    if (severity) filter.severity = severity;

    const conflicts = await Conflict.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: conflicts.length, conflicts });
  } catch (err) {
    next(err);
  }
};

// @desc Resolve or update a conflict
// @route PUT /api/conflicts/:id/resolve
const resolveConflict = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, chosenStatement, resolutionNotes } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid conflict ID.' });
    }

    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid conflict status.' });
    }

    if (chosenStatement !== undefined && !VALID_CHOICES.includes(chosenStatement)) {
      return res.status(400).json({ success: false, message: 'Invalid chosen statement.' });
    }

    if (resolutionNotes !== undefined && typeof resolutionNotes !== 'string') {
      return res.status(400).json({ success: false, message: 'Resolution notes must be text.' });
    }

    const conflict = await Conflict.findById(id);
    if (!conflict) {
      return res.status(404).json({ success: false, message: 'Conflict record not found.' });
    }

    const project = await Project.findOne({
      _id: conflict.project,
      owner: req.user._id,
    }).select('_id');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Conflict not found or access denied.' });
    }

    const previousStatus = conflict.status;
    const nextStatus = status !== undefined ? status : previousStatus;
    const nextChoice = chosenStatement !== undefined ? chosenStatement : conflict.chosenStatement;
    const nextNotes = resolutionNotes !== undefined
      ? resolutionNotes.trim()
      : conflict.resolutionNotes;

    if (nextStatus !== 'unresolved' && !nextNotes) {
      return res.status(400).json({
        success: false,
        message: 'Resolution notes are required before saving a decision.',
      });
    }

    if (nextStatus === 'confirmed' && !['A', 'B', 'custom'].includes(nextChoice)) {
      return res.status(400).json({
        success: false,
        message: 'Choose Statement A, Statement B, or a custom decision.',
      });
    }

    conflict.status = nextStatus;
    conflict.chosenStatement = nextChoice;
    conflict.resolutionNotes = nextNotes;

    if (nextStatus === 'unresolved') {
      conflict.resolvedBy = undefined;
      conflict.resolvedAt = undefined;
    } else {
      conflict.resolvedBy = req.user._id;
      conflict.resolvedAt = new Date();
    }

    await conflict.save();

    const unresolvedCount = await Conflict.countDocuments({
      project: conflict.project,
      status: 'unresolved',
    });

    await Project.updateOne(
      { _id: conflict.project },
      { $set: { 'stats.unresolvedConflicts': unresolvedCount } }
    );

    if (previousStatus !== conflict.status) {
      const isResolved = conflict.status !== 'unresolved';

      await ActivityLog.create({
        project: conflict.project,
        user: req.user._id,
        userName: req.user.name,
        action: isResolved ? 'conflict_resolved' : 'conflict_detected',
        entityType: 'conflict',
        entityId: conflict._id.toString(),
        title: `Conflict on "${conflict.topic}" updated to ${conflict.status}`,
        details: conflict.resolutionNotes || `Status changed from ${previousStatus} to ${conflict.status}.`,
        severity: isResolved ? 'success' : 'info',
      });
    }

    res.json({ success: true, conflict });
  } catch (err) {
    next(err);
  }
};

module.exports = { getConflicts, resolveConflict };
