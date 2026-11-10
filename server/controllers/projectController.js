const Project = require('../models/Project');
const Document = require('../models/Document');
const ExtractedKnowledge = require('../models/ExtractedKnowledge');
const KnowledgeGap = require('../models/KnowledgeGap');
const Conflict = require('../models/Conflict');
const Review = require('../models/Review');
const Handover = require('../models/Handover');
const ActivityLog = require('../models/ActivityLog');

// @desc    Create new project
// @route   POST /api/projects
const createProject = async (req, res, next) => {
  try {
    const { name, key, description, category, targetDomain } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Project name is required' });
    }

    const project = await Project.create({
      name,
      key: key || name.split(' ').map(w => w[0]).join('').substring(0, 5).toUpperCase(),
      description,
      category: category || 'Software Development',
      targetDomain: targetDomain || 'Fintech / Enterprise',
      owner: req.user._id,
      healthScore: 0,
    });

    await ActivityLog.create({
      project: project._id,
      user: req.user._id,
      userName: req.user.name,
      action: 'project_created',
      entityType: 'project',
      entityId: project._id,
      title: `Project "${project.name}" initialized`,
      details: `Project registered under domain ${project.targetDomain}. Ready for document ingestion.`,
      severity: 'info',
    });

    res.status(201).json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all projects for current user
// @route   GET /api/projects
const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ owner: req.user._id }).sort({ updatedAt: -1 });
    res.json({ success: true, count: projects.length, projects });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single project details by ID with live stats
// @route   GET /api/projects/:id
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found or unauthorized' });
    }

    // Refresh live stats from database
    const docCount = await Document.countDocuments({ project: project._id });
    const openGapsCount = await KnowledgeGap.countDocuments({ project: project._id, status: 'open' });
    const unresolvedConflictsCount = await Conflict.countDocuments({ project: project._id, status: 'unresolved' });
    const pendingReviewsCount = await Review.countDocuments({ project: project._id, action: { $ne: 'approved' } });

    project.stats.totalDocuments = docCount;
    project.stats.openGaps = openGapsCount;
    project.stats.unresolvedConflicts = unresolvedConflictsCount;
    await project.save();

    const recentActivities = await ActivityLog.find({ project: project._id }).sort({ timestamp: -1 }).limit(10);

    res.json({
      success: true,
      project,
      recentActivities,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
const updateProject = async (req, res, next) => {
  try {
    const { name, description, category, targetDomain, status } = req.body;
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (category) project.category = category;
    if (targetDomain) project.targetDomain = targetDomain;
    if (status) project.status = status;

    await project.save();
    res.json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete project and all associated data
// @route   DELETE /api/projects/:id
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const projectId = project._id;
    await Promise.all([
      Project.deleteOne({ _id: projectId }),
      Document.deleteMany({ project: projectId }),
      ExtractedKnowledge.deleteMany({ project: projectId }),
      KnowledgeGap.deleteMany({ project: projectId }),
      Conflict.deleteMany({ project: projectId }),
      Review.deleteMany({ project: projectId }),
      Handover.deleteMany({ project: projectId }),
      ActivityLog.deleteMany({ project: projectId }),
    ]);

    res.json({ success: true, message: 'Project and all associated records deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get dashboard metrics aggregated from all user projects
// @route   GET /api/projects/metrics/overview
const getDashboardMetrics = async (req, res, next) => {
  try {
    const userProjects = await Project.find({ owner: req.user._id });
    const projectIds = userProjects.map(p => p._id);

    const [totalDocs, totalGaps, totalConflicts, totalReviews, recentActivities] = await Promise.all([
      Document.countDocuments({ project: { $in: projectIds } }),
      KnowledgeGap.countDocuments({ project: { $in: projectIds }, status: 'open' }),
      Conflict.countDocuments({ project: { $in: projectIds }, status: 'unresolved' }),
      Review.countDocuments({ project: { $in: projectIds } }),
      ActivityLog.find({ project: { $in: projectIds } }).sort({ timestamp: -1 }).limit(8),
    ]);

    // Average health score across active projects
    const avgHealth = userProjects.length > 0 
      ? Math.round(userProjects.reduce((acc, p) => acc + (p.healthScore || 0), 0) / userProjects.length)
      : 0;

    res.json({
      success: true,
      stats: {
        totalProjects: userProjects.length,
        totalDocuments: totalDocs,
        openGaps: totalGaps,
        unresolvedConflicts: totalConflicts,
        totalReviews,
        averageHealthScore: avgHealth,
      },
      recentProjects: userProjects.slice(0, 5),
      recentActivities,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getDashboardMetrics,
};
