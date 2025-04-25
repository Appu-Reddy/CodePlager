// models/Student.js
const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
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

const Teacher = mongoose.model('Teacher', teacherSchema);
module.exports = Teacher;
