const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide an assignment name'],
    trim: true,
  },
  course: {
    type: String,
    required: [true, 'Please provide a course name'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  dueDate: {
    type: Date,
    required: [true, 'Please provide a due date'],
  },
  status: {
    type: String,
    enum: ['active', 'draft', 'closed'],
    default: 'draft',
  },
  maxScore: {
    type: Number,
    default: 100,
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    uploadDate: {
      type: Date,
      default: Date.now,
    }
  }],
  // Track students who have submitted this assignment
  studentSubmissions: [{
    studentRollNo: {
      type: String, // Changed from ObjectId
      required: true,
    },
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
    },
    submittedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['submitted', 'late', 'graded', 'returned'],
    },
    isGraded: {
      type: Boolean,
      default: false,
    },
    grade: {
      type: Number,
      default: null,
    },
  }],
  teacherRollNo: {
    type: String, // Changed from ObjectId
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

// Virtual for submission stats (not stored in DB but calculated when requested)
AssignmentSchema.virtual('submissionStats').get(function () {
  return {
    submissionCount: this.studentSubmissions.length,
    gradedCount: this.studentSubmissions.filter(sub => sub.isGraded).length,
    submissionPercentage: this.studentSubmissions.length > 0
      ? (this.studentSubmissions.length / this.studentSubmissions.length) * 100
      : 0
  };
});

module.exports = mongoose.models.Assignment || mongoose.model('Assignment', AssignmentSchema);
