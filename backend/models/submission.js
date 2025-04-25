// models/Submission.js
const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    default: '',
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
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  grade: {
    score: {
      type: Number,
      default: null,
    },
    feedback: {
      type: String,
      default: '',
    },
    gradedAt: {
      type: Date,
      default: null,
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    }
  },
  status: {
    type: String,
    enum: ['submitted', 'late', 'graded', 'returned'],
    default: 'submitted',
  }
}, { timestamps: true });

// Middleware to update Assignment's studentSubmissions array when a submission is created or updated
SubmissionSchema.post('save', async function(doc) {
  try {
    const Assignment = mongoose.model('Assignment');
    const assignment = await Assignment.findById(doc.assignmentId);
    
    if (!assignment) return;
    
    // Check if this student already has a submission entry
    const existingSubmissionIndex = assignment.studentSubmissions.findIndex(
      sub => sub.studentId.toString() === doc.studentId.toString()
    );
    
    const submissionData = {
      studentId: doc.studentId,
      submissionId: doc._id,
      submittedAt: doc.submittedAt,
      status: doc.status,
      isGraded: doc.grade.score !== null,
      grade: doc.grade.score
    };
    
    if (existingSubmissionIndex >= 0) {
      // Update existing submission entry
      assignment.studentSubmissions[existingSubmissionIndex] = submissionData;
    } else {
      // Add new submission entry
      assignment.studentSubmissions.push(submissionData);
    }
    
    await assignment.save();
  } catch (error) {
    console.error('Error updating assignment with submission:', error);
  }
});

module.exports = mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);