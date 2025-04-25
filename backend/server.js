const mongoose = require("mongoose")
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
const Student = require("./models/student")
const Teacher = require("./models/teacher")
// const Course=reuire("./models/course");
const Assignment = require("./models/assignment")
const Submission = require("./models/submission")

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

const uploadDir = path.join(__dirname, 'uploads', 'assignments');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);  // use the ensured directory
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Save file with timestamp
    },
});

const upload = multer({ storage });

app.post('/api/createAssignment', upload.single('file'), async (req, res) => {
    try {
        const {
            name, course, description, dueDate, status, maxScore,
            teacherRollNo, courseId
        } = req.body;

        // Check if teacher exists using roll number
        const teacher = await Teacher.findOne({ rollNo: teacherRollNo });
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found with this roll number' });
        }

        // Create the new assignment
        const newAssignment = new Assignment({
            name,
            course,
            description,
            dueDate,
            status,
            maxScore,
            teacherRollNo: teacher.rollNo,  // Use rollNo, not ObjectId
            courseId,
            attachments: req.file ? [{
                fileName: req.file.originalname,
                fileUrl: `/uploads/assignments/${req.file.filename}`,
                fileType: path.extname(req.file.originalname),
            }] : []
        });

        await newAssignment.save();
        console.log("Assignment created");

        res.status(201).json({ message: 'Assignment created', assignment: newAssignment });
    } catch (err) {
        console.error('Error creating assignment:', err);
        res.status(500).json({ error: 'Failed to create assignment' });
    }
});

app.get('/assignments/student/:rollNo', async (req, res) => {
    const { rollNo } = req.params;

    try {
        const assignments = await Assignment.find().sort({ createdAt: -1 });

        const assignmentWithStatus = assignments.map(assign => {
            // Find the student's submission in the assignment's studentSubmissions array
            const submission = assign.studentSubmissions?.find(sub => sub.studentRollNo === rollNo);

            let status = 'pending';
            let grade = null;
            let submissionDate = null;

            if (submission) {
                submissionDate = submission.submittedAt;

                if (submission.grade !== undefined && submission.grade !== null) {
                    status = 'graded';
                    grade = submission.grade;
                } else {
                    status = new Date(assign.dueDate) < new Date(submission.submittedAt) ? 'late' : 'submitted';
                }
            } else if (new Date(assign.dueDate) < new Date()) {
                status = 'late';
            }

            return {
                _id: assign._id,
                name: assign.name,
                course: assign.course,
                dueDate: assign.dueDate,
                createdAt: assign.createdAt,
                status,
                grade,
                submissionDate,
            };
        });

        res.json(assignmentWithStatus);
    } catch (err) {
        console.error("Error fetching student assignments:", err);
        res.status(500).json({ error: 'Failed to fetch student assignments' });
    }
});

app.get('/assignments/teacher/:rollNo', async (req, res) => {
    const { rollNo } = req.params;

    try {
        const assignments = await Assignment.find({ teacherRollNo: rollNo }).sort({ createdAt: -1 });

        res.status(200).json(assignments);
    } catch (err) {
        console.error("Error fetching assignments by teacher:", err);
        res.status(500).json({ error: 'Failed to fetch teacher assignments' });
    }
});


app.delete('/api/deleteAssignment/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Assignment.findByIdAndDelete(id);
        res.json({ message: 'Assignment deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete assignment' });
    }
});

app.post('/submitAssignment', upload.single('submissionFile'), async (req, res) => {
    const { assignmentId, studentRollNo, status = 'submitted' } = req.body;

    // Validate if assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
    }

    // Validate that the assignment is not closed and the due date has not passed
    if (assignment.status === 'closed' || new Date() > new Date(assignment.dueDate)) {
        return res.status(400).json({ error: 'This assignment is no longer accepting submissions.' });
    }

    // Check if the student has already submitted the assignment
    const existingSubmission = assignment.studentSubmissions.find(
        (sub) => sub.studentRollNo === studentRollNo
    );

    // If the student has already submitted, we can either update or reject the new submission
    if (existingSubmission && existingSubmission.status === 'submitted') {
        return res.status(400).json({ error: 'You have already submitted this assignment.' });
    }

    const submission = {
        studentRollNo,
        status,
        submittedAt: new Date(),
    };

    // If a file is uploaded, add it to the submission object
    if (req.file) {
        submission.submissionId = new mongoose.Types.ObjectId();
        submission.fileName = req.file.filename;
        submission.fileUrl = `/uploads/${req.file.filename}`; // Adjust to match your file serving logic
        submission.fileType = req.file.mimetype;
    }

    // Update the studentSubmissions array with the new submission or modify existing one
    assignment.studentSubmissions.push(submission);

    try {
        // Save the assignment with the new submission
        await assignment.save();
        res.status(200).json({ message: 'Assignment submitted successfully', submission });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong while submitting the assignment' });
    }
});

app.get('/api/assignments/:assignmentId', async (req, res) => {
    const { assignmentId } = req.params;
    const { studentId } = req.query;  // studentId here is the student roll number

    if (!studentId) {
        return res.status(400).json({ error: 'Student ID (Roll No) is required' });
    }

    try {
        // First, validate the student's roll number
        const student = await Student.findOne({ rollNo: studentId });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Find the assignment by ID
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        // Find the student's submission using the roll number
        const studentSubmission = assignment.studentSubmissions.find(
            (sub) => sub.studentRollNo === studentId
        );

        // Include the student's submission data if found
        if (studentSubmission) {
            return res.status(200).json({
                assignment,
                studentSubmission,
                submissionDate: studentSubmission.submittedAt,
                status: studentSubmission.status,
            });
        }

        // If no submission found, return status 'not submitted'
        return res.status(200).json({
            assignment,
            studentSubmission: null,
            status: 'not submitted',
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error fetching assignment data' });
    }
});


app.listen(port, () => {
    console.log(`Backend running at ${port}`);
});



































// const uploadDir = path.join(__dirname, 'uploads');
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// // Configure multer storage
// const storage = multer.diskStorage({
//   destination: function(req, file, cb) {
//     cb(null, 'uploads/');
//   },
//   filename: function(req, file, cb) {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//   }q
// });

// // File filter to only accept certain file types
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = ['.pdf', '.docx', '.zip'];
//   const ext = path.extname(file.originalname).toLowerCase();

//   if (allowedTypes.includes(ext)) {
//     cb(null, true);
//   } else {
//     cb(new Error('Invalid file type. Only PDF, DOCX, and ZIP files are allowed.'), false);
//   }
// };

// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: { fileSize: 10 * 1024 * 1024 } // 10MB file size limit
// });

// // Route to handle assignment upload with file
// app.post("/api/uploadAssignment", upload.single('file'), async (req, res) => {
//     try {
//         const {
//             id,
//             name,
//             course,
//             dueDate,
//             status,
//             submissionDate,
//             grade,
//             studentId
//         } = req.body;

//         if (!id || !name || !course || !studentId) {
//             return res.status(400).json({ error: "Missing required fields" });
//         }

//         const studentExists = await Student.findOne({ rollNo: studentId });

//         if (!studentExists) {
//             return res.status(404).json({ error: "Student not found" });
//         }

//         // Check if assignment already exists for this student (for updating)
//         const existingAssignment = await Assignment.findOne({
//             id: id,
//             studentId: studentId
//         });

//         // If assignment exists, update it
//         if (existingAssignment) {
//             // If there's a previous file and we're uploading a new one, delete the old file
//             if (existingAssignment.filePath && req.file) {
//                 try {
//                     fs.unlinkSync(existingAssignment.filePath);
//                 } catch (err) {
//                     console.error("Error deleting previous file:", err);
//                     // Continue with the update even if file deletion fails
//                 }
//             }

//             const updated = await Assignment.findByIdAndUpdate(
//                 existingAssignment._id,
//                 {
//                     name,
//                     course,
//                     dueDate: dueDate || Date.now(),
//                     status,
//                     submissionDate,
//                     grade,
//                     filePath: req.file ? req.file.path : existingAssignment.filePath
//                 },
//                 { new: true }
//             );

//             return res.status(200).json(updated);
//         }

//         // Create new assignment if it doesn't exist
//         const newAssignment = new Assignment({
//             id,
//             name,
//             course,
//             dueDate: dueDate || Date.now(),
//             status,
//             submissionDate,
//             grade,
//             studentId,
//             filePath: req.file ? req.file.path : null
//         });

//         const saved = await newAssignment.save();
//         res.status(201).json(saved);
//     } catch (error) {
//         console.error("Error handling assignment:", error.message);
//         res.status(500).json({ error: "Failed to process assignment" });
//     }
// });

// // Get specific assignment for a student
// app.get('/api/assignments/:id', async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { studentId } = req.query;

//         // Validate required parameters
//         if (!id || !studentId) {
//             return res.status(400).json({ error: 'Assignment ID and student ID are required' });
//         }

//         // Find assignment by ID and studentId
//         const assignment = await Assignment.findOne({
//             id: id,
//             studentId: studentId
//         });

//         if (!assignment) {
//             return res.status(404).json({ error: 'Assignment not found' });
//         }

//         // Return the assignment data
//         res.status(200).json({
//             id: assignment.id,
//             name: assignment.name,
//             course: assignment.course,
//             dueDate: assignment.dueDate,
//             status: assignment.status,
//             submissionDate: assignment.submissionDate,
//             grade: assignment.grade,
//             studentId: assignment.studentId,
//             filePath: assignment.filePath
//         });

//     } catch (error) {
//         console.error('Error fetching assignment details:', error);
//         res.status(500).json({ error: 'Server error when fetching assignment details' });
//     }
// });

// // Get all assignments for a student
// app.get("/api/assignments/student/:rollNo", async (req, res) => {
//     try {
//         const { rollNo } = req.params;

//         const studentExists = await Student.findOne({ rollNo });

//         if (!studentExists) {
//             return res.status(404).json({ error: "Student not found" });
//         }

//         const assignments = await Assignment.find({ studentId: rollNo });

//         res.status(200).json(assignments);
//     } catch (error) {
//         console.error("Error fetching assignments:", error.message);
//         res.status(500).json({ error: "Failed to retrieve assignments" });
//     }
// });

// // Serve static files from uploads directory (optional - for viewing uploaded files)
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// // Update this route to include /api prefix for consistency
// // app.get("/api/assignments/student/:rollNo", async (req, res) => {
// //     try {
// //         const { rollNo } = req.params;

// //         const studentExists = await Student.findOne({ rollNo });

// //         if (!studentExists) {
// //             return res.status(404).json({ error: "Student not found" });
// //         }

// //         const assignments = await Assignment.find({ studentId: rollNo });

// //         res.status(200).json(assignments);
// //     } catch (error) {
// //         console.error("Error fetching assignments:", error.message);
// //         res.status(500).json({ error: "Failed to retrieve assignments" });
// //     }
// });