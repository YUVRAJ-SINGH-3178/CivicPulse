const Issue = require('../models/issues');
const path = require('path');
const { analyzeIssueWithAI } = require('../utils/geminiService');

// Create a new issue
exports.createIssue = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      severity,
      location,
      latitude,
      longitude,
      clerkUserId,
      email,
      phone,
      department,
      responseTime,
      confidence,
      summary,
      notifyByEmail
    } = req.body;

    if (!title || !description || !clerkUserId) {
      return res.status(400).json({ error: 'Title, description and user ID are required.' });
    }

    const fileUrl = req.file
      ? `/uploads/${req.file.filename}`
      : null;

    let aiData = null;
    try {
      aiData = await analyzeIssueWithAI(title, description);
    } catch (e) {
      console.log("AI analysis failed or unavailable, falling back to defaults.");
    }

    const issue = new Issue({
      title,
      description,
      category: aiData?.category || category || 'Other',
      severity: aiData?.severity || severity || 'Medium',
      location: location || '',
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      email: email || '',
      phone: phone || '',
      department: aiData?.department || department || '',
      responseTime: responseTime || '',
      confidence: aiData?.confidence || (confidence ? parseFloat(confidence) : undefined),
      summary: aiData?.summary || summary || '',
      notifyByEmail: notifyByEmail === 'true' || notifyByEmail === true,
      fileUrl,
      clerkUserId,
      status: 'Pending',
      upvotes: 0,
      upvotedBy: []
    });

    await issue.save();
    res.status(201).json({ message: 'Issue reported successfully!', issue });
  } catch (err) {
    console.error('createIssue error:', err);
    res.status(500).json({ error: 'Failed to create issue', details: err.message });
  }
};

// Get all issues (for community feed and map)
exports.getAllIssues = async (req, res) => {
  try {
    const { clerkUserId, status, category } = req.query;
    const filter = {};

    if (clerkUserId) filter.clerkUserId = clerkUserId;
    if (status) filter.status = status;
    if (category) filter.category = category;

    const issues = await Issue.find(filter).sort({ createdAt: -1 });
    res.status(200).json(issues);
  } catch (err) {
    console.error('getAllIssues error:', err);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
};

// Get single issue by ID
exports.getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    res.status(200).json(issue);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch issue' });
  }
};

// Update issue status (admin only)
exports.updateIssueStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['Pending', 'Under Review', 'In Progress', 'Resolved', 'Rejected'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    res.status(200).json({ message: 'Status updated', issue });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
};

// Upvote / Verify an issue
exports.upvoteIssue = async (req, res) => {
  try {
    const { clerkUserId } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    if (!clerkUserId) return res.status(400).json({ error: 'User ID required' });

    if (issue.upvotedBy.includes(clerkUserId)) {
      return res.status(400).json({ error: 'You have already verified this issue' });
    }

    // Cannot verify your own issue
    if (issue.clerkUserId === clerkUserId) {
      return res.status(400).json({ error: 'You cannot verify your own issue' });
    }

    issue.upvotes += 1;
    issue.upvotedBy.push(clerkUserId);
    await issue.save();

    res.status(200).json({ message: 'Issue verified! +10 Community Points', issue });
  } catch (err) {
    console.error('upvoteIssue error:', err);
    res.status(500).json({ error: 'Failed to upvote issue' });
  }
};

// Delete an issue (admin)
exports.deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    res.status(200).json({ message: 'Issue deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete issue' });
  }
};

// Update issue (user who filed it)
exports.updateIssue = async (req, res) => {
  try {
    const { title, description, category, severity } = req.body;
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { title, description, category, severity },
      { new: true }
    );
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    res.status(200).json({ message: 'Issue updated', issue });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update issue' });
  }
};
