// models/Student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  rollNo: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type:String,
    required:true
  },
  pass: {
    type: String,
    required: true
  }
});

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
