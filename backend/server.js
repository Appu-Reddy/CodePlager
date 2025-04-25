const mongoose = require("mongoose")
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
const Student = require("./models/student")
const Teacher=require("./models/teacher")

mongoose.connect("mongodb+srv://Vivek:Vivek2006@cluster0.fqmud7r.mongodb.net/");

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'error connecting mongodb'));
db.once('open', () => {
    console.log('Connected to mongodb');
});

app.get('/api/hello', (req, res) => {
    res.json({ message: 'hello from h-1' });
});

app.post('/api/addStudent', async (req, res) => {
    try {
        const { rollNo, name, pass } = req.body;

        const existingStudent = await Student.findOne({ rollNo });
        if (existingStudent) {
            return res.status(409).json({ message: 'Student with this roll number already exists' });
        }
        const hashedPassword = await bcrypt.hash(pass, 10);
        const newStudent = new Student({ rollNo, name, pass: hashedPassword });

        await newStudent.save();
        res.status(201).json({ message: 'Student created successfully', student: newStudent });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/api/getStudents', async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/student-login', async (req, res) => {
    const { rollNo, pass } = req.body;

    const student = await Student.findOne({ rollNo });
    if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }

    const isMatch = await bcrypt.compare(pass, student.pass); // <--- password check here
    if (!isMatch) {
        return res.status(401).json({ message: "Incorrect password" });
    }

    res.status(200).json({ message: "Login successful", rollNo: student.rollNo });
});

app.post('/api/addTeacher', async (req, res) => {
    try {
        const { rollNo, name, pass } = req.body;

        const existingStudent = await Student.findOne({ rollNo });
        if (existingStudent) {
            return res.status(409).json({ message: 'Student with this roll number exists' });
        }
        const existingTeacher = await Teacher.findOne({ rollNo });
        if (existingTeacher) {
            return res.status(409).json({ message: 'Teacher with this roll number already exists' });
        }
        const hashedPassword = await bcrypt.hash(pass, 10);
        const newTeacher = new Teacher({ rollNo, name, pass: hashedPassword });

        await newTeacher.save();
        res.status(201).json({ message: 'Teacher created successfully', Teacher: newTeacher });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/api/getTeacher', async (req, res) => {
    try {
        const teachers = await Teacher.find();
        res.json(teachers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/teacher-login', async (req, res) => {
    const { rollNo, pass } = req.body;

    const teacher = await Teacher.findOne({ rollNo });
    if (!teacher) {
        return res.status(404).json({ message: "Student not found" });
    }

    const isMatch = await bcrypt.compare(pass, teacher.pass); 
    if (!isMatch) {
        return res.status(401).json({ message: "Incorrect password" });
    }

    res.status(200).json({ message: "Login successful", rollNo: teacher.rollNo });
});


app.listen(port, () => {
    console.log(`Backend running at ${port}`);
});
