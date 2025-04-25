"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Upload,
  FileText,
  Edit,
  Send,
  Check,
  X,
  Clock,
  Award,
  BookOpen,
  Calendar,
} from "lucide-react";
import axios from "axios";

const StudentSubmit = () => {
  const searchParams = useSearchParams();
  const assignmentName = searchParams.get("name") || "Assignment";
  const assignmentId = searchParams.get("id");
  const courseId = searchParams.get("course");

  // Assuming you have the student's ID available from your auth context or localStorage
  const studentId = typeof window !== "undefined" ? localStorage.getItem("Roll") : "";
  
  useEffect(() => {
    console.log(assignmentId);
  }, []);

  const [assignment, setAssignment] = useState({
    id: assignmentId,
    name: assignmentName,
    course: courseId || "",
    dueDate: null,
    submitted: false,
    status: "pending",
    grade: null,
    lastSubmission: null,
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [showUploadSection, setShowUploadSection] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isPastDue, setIsPastDue] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [studentName, setStudentName] = useState<string | null>(null);

  
  useEffect(() => {
    console.log(assignmentId);
  }, [assignmentId]);

  useEffect(() => {
    if (studentId) {
      axios.get(`http://localhost:5000/api/getStudent/${studentId}`)
        .then((res) => {
          setStudentName(res.data.name);
        })
        .catch(() => {
          setStudentName("Unknown Student");
        });
    }
  }, [studentId]);

  // Fetch assignment data on component mount if we have an assignment ID
  useEffect(() => {
    if (assignmentId && studentId) {
      fetchAssignmentData();
    }
  }, [assignmentId, studentId]);

  const fetchAssignmentData = async () => {
    try {
      // Updated to match the backend API endpoint
      const response = await axios.get(
        `http://localhost:5000/api/assignments/${assignmentId}?studentId=${studentId}`
      );
      
      if (response.data) {
        const assignmentData = response.data.assignment;
        const submissionData = response.data.studentSubmission;
        const submissionStatus = response.data.status;
        
        // Check if the assignment is past due
        const isDueDatePassed = assignmentData.dueDate && new Date() > new Date(assignmentData.dueDate);
        setIsPastDue(assignmentData.status === 'closed' || isDueDatePassed);
        
        // Check if already submitted
        const isSubmitted = submissionStatus === 'submitted' || submissionStatus === 'graded';
        setAlreadySubmitted(isSubmitted);

        setAssignment({
          id: assignmentData._id,
          name: assignmentData.title || assignmentName,
          course: assignmentData.courseId || courseId,
          dueDate: assignmentData.dueDate,
          submitted: isSubmitted,
          status: submissionStatus,
          grade: submissionData?.grade || null,
          lastSubmission: submissionData?.submittedAt 
            ? new Date(submissionData.submittedAt).toLocaleString() 
            : null,
        });

        // Don't show upload section if already submitted and graded or past due
        if (submissionStatus === "graded" || isDueDatePassed) {
          setShowUploadSection(false);
        }
      }
    } catch (error) {
      console.error("Error fetching assignment:", error);
      setSubmitError("Failed to load assignment details. Please try again.");
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setSubmitError(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !studentId || !assignmentId) {
      setSubmitError("Please select a file to upload");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Create form data for the file upload
      const formData = new FormData();
      formData.append('submissionFile', selectedFile);
      formData.append('assignmentId', assignmentId);
      formData.append('studentRollNo', studentId);
      formData.append('status', 'submitted');
      console.log(studentName)
      formData.append('student_name',studentName || "Uknown Student")

      // Updated to match the backend API endpoint
      const response = await axios.post('http://localhost:5000/submitAssignment', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        // Update local state to reflect submission
        setAssignment((prev) => ({
          ...prev,
          submitted: true,
          status: 'submitted',
          lastSubmission: new Date().toLocaleString(),
        }));

        setSelectedFile(null);
        setShowUploadSection(false);
        setAlreadySubmitted(true);
      } else {
        throw new Error("Failed to submit assignment");
      }
    } catch (error) {
      console.error("Error submitting assignment:", error);
      // Handle specific error responses from the backend
      if (error.response) {
        if (error.response.status === 400) {
          setSubmitError(error.response.data.error || "Failed to submit assignment. Please try again.");
        } else if (error.response.status === 404) {
          setSubmitError("Assignment not found. Please refresh and try again.");
        } else {
          setSubmitError("Server error occurred. Please try again later.");
        }
      } else {
        setSubmitError("Failed to submit assignment. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => {
    // Only allow edit if not past due
    if (!isPastDue) {
      setShowUploadSection(true);
      setSubmitError(null);
    } else {
      setSubmitError("This assignment is no longer accepting submissions as it has passed the due date.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-gray-100 p-8 flex flex-col space-y-8">
      <div className="w-full bg-black/60 backdrop-blur-sm rounded-xl p-8 shadow-xl border-l-4 border-blue-500 mb-10">
        <div className="flex items-center">
          <BookOpen size={32} className="text-blue-400 mr-4" />
          <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text">
            {assignment.name}
          </h1>
        </div>
      </div>

      <div className="w-full bg-black backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-gray-800 mb-5">
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Calendar size={20} className="mr-2 text-blue-400" />
            Assignment Status
          </h2>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row items-stretch">
            <div className="flex-1 relative">
              <div className="h-full flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    assignment.submitted ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {assignment.submitted ? <Check size={24} /> : <X size={24} />}
                </div>
                <div className="mt-3 text-center">
                  <h3 className="font-semibold text-gray-300">Submission</h3>
                  <p className={`text-lg font-bold ${
                    assignment.submitted ? "text-green-400" : "text-red-400"
                  }`}>
                    {assignment.submitted ? "Submitted" : "Not Submitted"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 relative mt-6 md:mt-0">
              <div className="h-full flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center">
                  <Award size={24} />
                </div>
                <div className="mt-3 text-center">
                  <h3 className="font-semibold text-gray-300">Grade</h3>
                  <p className="text-lg font-bold text-yellow-300">
                    {assignment.grade ? `${assignment.grade}/100` : "Not Yet Graded"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 mt-6 md:mt-0">
              <div className="h-full flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Clock size={24} />
                </div>
                <div className="mt-3 text-center">
                  <h3 className="font-semibold text-gray-300">Last Submission</h3>
                  <div className="flex items-center justify-center">
                    <p className="text-lg font-bold text-blue-300">{assignment.lastSubmission || "None"}</p>
                    {assignment.submitted && !isPastDue && (
                      <button
                        className="ml-2 p-2 bg-blue-500/20 rounded-full hover:bg-blue-500/30 transition-colors"
                        onClick={handleEdit}
                      >
                        <Edit size={16} className="text-blue-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {assignment.dueDate && (
          <div className="px-6 pb-2">
            <p className={`text-sm ${isPastDue ? "text-red-400" : "text-gray-400"}`}>
              Due Date: {new Date(assignment.dueDate).toLocaleString()}
              {isPastDue && " (Past Due)"}
            </p>
          </div>
        )}

        <div className="px-6 pb-6">
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500"
              style={{ width: assignment.submitted ? (assignment.grade ? "100%" : "66%") : "33%" }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Submission</span>
            <span>Grading</span>
            <span>Completed</span>
          </div>
        </div>
      </div>

      {showUploadSection && (
        <div className="mx-auto w-full max-w-3xl bg-black/40 backdrop-blur-sm rounded-xl p-8 shadow-xl border border-gray-800 animate-fadeIn">
          {isPastDue ? (
            <div className="text-center p-6 bg-red-500/20 rounded-xl">
              <X size={40} className="mx-auto text-red-400 mb-4" />
              <h3 className="text-xl font-bold text-red-400">Submission Closed</h3>
              <p className="mt-2 text-gray-300">
                This assignment is no longer accepting submissions as it has passed the due date.
              </p>
            </div>
          ) : alreadySubmitted ? (
            <div className="text-center p-6 bg-yellow-500/20 rounded-xl">
              <Check size={40} className="mx-auto text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold text-yellow-400">Already Submitted</h3>
              <p className="mt-2 text-gray-300">
                You have already submitted this assignment. You can upload a new version if needed.
              </p>
            </div>
          ) : (
            <div className="border-2 border-gray-700 rounded-xl p-8 bg-gradient-to-b from-gray-900/50 to-black hover:border-blue-600/50 transition-all duration-500">
              <div className="text-center mb-6">
                <div className="inline-flex p-4 rounded-full bg-blue-500/10 mb-4">
                  <Upload size={40} className="text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {assignment.name}
                </h3>
                <p className="mt-3 text-lg font-medium text-gray-400">
                  {assignment.dueDate ? `Due on ${new Date(assignment.dueDate).toLocaleString()}` : "No due date set"}
                </p>
              </div>
              <div>
                <input
                  type="file"
                  accept=".pdf,.docx,.jpg,.png,.jpeg"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-input"
                />
                <label
                  htmlFor="file-input"
                  className="block text-center cursor-pointer bg-blue-500 hover:bg-blue-400 rounded-xl py-3 px-6 text-white font-semibold"
                >
                  {selectedFile ? `Selected: ${selectedFile.name}` : "Choose File to Upload"}
                </label>
                {submitError && <p className="text-red-500 text-sm mt-2">{submitError}</p>}
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedFile}
                className="mt-4 w-full bg-blue-500 hover:bg-blue-400 py-3 rounded-xl text-white font-semibold disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Assignment"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentSubmit;