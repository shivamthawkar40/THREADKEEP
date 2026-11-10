const Conflict = require('../models/Conflict');
const ActivityLog = require('../models/ActivityLog');
const Project = require('../models/Project');

// @desc    Get all conflicts for a project
// @route   GET /api/conflicts/project/:projectId
const getConflicts = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { status, severity } = req.query;

    const filter = { project: projectId };
    if (status) filter.status = status;
    if (severity) filter.severity = severity;

    const conflicts = await Conflict.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: conflicts.length, conflicts });
  } catch (err) {
    next(err);
  }
};

// @desc    Resolve or update a conflict
// @route   PUT /api/conflicts/:id/resolve
const resolveConflict = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, chosenStatement, resolutionNotes } = req.body;

    const conflict = await Conflict.findById(id);
    if (!conflict) {
      return res.status(404).json({ success: false, message: 'Conflict record not found' });
    }

    if (status) conflict.status = status;
    if (chosenStatement) conflict.chosenStatement = chosenStatement;
    if (resolutionNotes !== undefined) conflict.resolutionNotes = resolutionNotes;

    conflict.resolvedBy = req.user._id;
    conflict.resolvedAt = new Date();

    await conflict.save();

    // Update project stats
    const unresolvedCount = await Conflict.countDocuments({ project: conflict.project, status: 'unresolved' });
    await Project.updateOne({ _id: conflict.project }, { 'stats.unresolvedConflicts': unresolvedCount });

    await ActivityLog.create({
      project: conflict.project,
      user: req.user._id,
      userName: req.user.name,
      action: 'conflict_resolved',
      entityType: 'conflict',
      entityId: conflict._id,
      title: `Conflict on "${conflict.topic}" resolved as ${conflict.status}`,
      details: `Resolution: ${resolutionNotes || 'Decision ratified by human reviewer.'} (Chosen: ${chosenStatement})`,
      severity: 'success',
    });

    res.json({ success: true, conflict });
  } catch (err) {
    next(err);
  }
};

module.exports = { getConflicts, resolveConflict };
