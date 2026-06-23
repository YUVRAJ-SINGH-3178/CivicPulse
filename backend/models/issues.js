const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['Road & Infrastructure', 'Water & Sanitation', 'Electricity', 'Public Safety', 'Waste Management', 'Parks & Recreation', 'Noise Pollution', 'Other'],
    default: 'Other'
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'In Progress', 'Resolved', 'Rejected'],
    default: 'Pending'
  },
  location: { type: String, default: '' },
  latitude: { type: Number },
  longitude: { type: Number },
  fileUrl: { type: String, default: null },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  department: { type: String, default: '' },
  responseTime: { type: String, default: '' },
  confidence: { type: Number },
  summary: { type: String, default: '' },
  notifyByEmail: { type: Boolean, default: false },
  // The Clerk User ID of the person who filed the complaint
  clerkUserId: { type: String, required: true },
  upvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: String }], // Array of Clerk User IDs
}, { timestamps: true });

module.exports = mongoose.model('Issue', issueSchema);
