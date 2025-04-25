"use client"

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Upload, FileText, Edit, Send, Check, X, Clock, Award, BookOpen, Calendar } from 'lucide-react';
import axios from 'axios';

const StudentSubmit = () => {
  const searchParams = useSearchParams();
  const assignmentName = searchParams.get('name') || 'Assignment';
  const assignmentId = searchParams.get('id');
  const courseId = searchParams.get('course');
  
  // Assuming you have the student's ID available from your auth context or localStorage
  // This would come from your authentication system
  const studentId = typeof window !== 'undefined' ? localStorage.getItem('Roll') : '';

  const [assignment, setAssignment] = useState({
    id: assignmentId,
    name: assignmentName,
    course: courseId || '',
    dueDate: null,
    submitted: false,
    status: 'pending',
    grade: null,
    lastSubmission: null as string | null,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showUploadSection, setShowUploadSection] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch assignment data on component mount if we have an assignment ID
  useEffect(() => {
    if (assignmentId) {
      fetchAssignmentData();
    }
  }, [assignmentId]);

  const fetchAssignmentData = async () => {
    try {
      // This endpoint would need to be implemented on your backend
      const response = await axios.get(`http://localhost:5000/api/assignments/${assignmentId}?studentId=${studentId}`);
      
      if (response.data) {
        setAssignment({
          ...response.data,
          submitted: response.data.status === 'submitted' || response.data.status === 'graded',
          lastSubmission: response.data.submissionDate ? new Date(response.data.submissionDate).toLocaleString() : null
        });
        
        // Don't show upload section if already submitted and graded
        if (response.data.status === 'graded') {
          setShowUploadSection(false);
        }
      }
    } catch (error) {
      console.error('Error fetching assignment:', error);
      // Handle error - could show a notification
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setSubmitError(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !studentId) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    // In a real implementation, you would upload the file to a storage service
    // and get back a URL or reference, which you would include in the assignment data
    
    try {
      const now = new Date();
      
      const assignmentData = {
        id: assignment.id,
        name: assignment.name,
        course: assignment.course,
        dueDate: assignment.dueDate || now, // You should have a proper due date
        status: 'submitted',
        submissionDate: now.toISOString(),
        grade: null,
        studentId: studentId
      };
      
      // Call your API to save the assignment
      const response = await axios.post('http://localhost:5000/api/uploadAssignment', assignmentData);
      
      if (response.status >= 200 && response.status < 300) {
        // Update local state to reflect submission
        setAssignment(prev => ({
          ...prev,
          submitted: true,
          status: 'submitted',
          lastSubmission: now.toLocaleString(),
        }));
        
        setSelectedFile(null);
        setShowUploadSection(false);
      } else {
        throw new Error('Failed to submit assignment');
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      setSubmitError('Failed to submit assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => {
    setShowUploadSection(true);
    setSubmitError(null);
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
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  assignment.submitted ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {assignment.submitted ? <Check size={24} /> : <X size={24} />}
                </div>
                <div className="mt-3 text-center">
                  <h3 className="font-semibold text-gray-300">Submission</h3>
                  <p className={`text-lg font-bold ${
                    assignment.submitted ? 'text-green-400' : 'text-red-400'
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
                    <p className="text-lg font-bold text-blue-300">
                      {assignment.lastSubmission || "None"}
                    </p>
                    {assignment.submitted && (
                      <button 
                        className="ml-2 p-2 bg-blue-500/20 rounded-full hover:bg-blue-500/30 transition-colors"
                        onClick={handleEdit}
                      ><Edit size={16} className="text-blue-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500" 
              style={{ width: assignment.submitted ? (assignment.grade ? '100%' : '66%') : '33%' }}
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
          <div className="border-2 border-gray-700 rounded-xl p-8 bg-gradient-to-b from-gray-900/50 to-black hover:border-blue-600/50 transition-all duration-500">
            <div className="text-center mb-6">
              <div className="inline-flex p-4 rounded-full bg-blue-500/10 mb-4">
                <Upload size={40} className="text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {assignment.submitted ? "Edit Assignment Submission" : "Upload Assignment"}
              </h3>
            </div>

            <div className="w-full max-w-md mx-auto">
              <label className="block w-full cursor-pointer">
                <div className="group bg-gray-800/80 hover:bg-gray-700/80 text-center py-6 px-6 rounded-lg border border-dashed border-gray-600 hover:border-blue-500 transition duration-300">
                  <FileText className="mx-auto mb-3 text-gray-400 group-hover:text-blue-400 transition-colors" size={28} />
                  <span className="text-gray-300 group-hover:text-white transition-colors">
                    {selectedFile ? selectedFile.name : "Choose file or drag & drop here"}
                  </span>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileSelect}
                  accept=".pdf,.docx,.zip"
                />
              </label>
            </div>

            {selectedFile && (
              <div className="flex items-center justify-center space-x-2 text-gray-300 mt-4 p-3 bg-gray-800/50 rounded-lg">
                <FileText size={16} className="text-blue-400" />
                <span className="truncate max-w-xs">{selectedFile.name}</span>
                <button 
                  className="p-1 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400" 
                  onClick={() => setSelectedFile(null)}
                ><X size={16} />
                </button>
              </div>
            )}

            {submitError && (
              <div className="mt-4 p-3 bg-red-500/20 text-red-400 rounded-lg text-center">
                {submitError}
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <button 
                className={`flex items-center justify-center space-x-2 py-3 px-8 rounded-lg text-lg font-medium transition-all duration-300 shadow-lg ${
                  selectedFile && !isSubmitting
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-blue-500/20' 
                    : 'bg-gray-800 text-gray-400 cursor-not-allowed'
                }`}
                onClick={handleSubmit}
                disabled={!selectedFile || isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  <>
                    <Send size={18} />
                    <span>{assignment.submitted ? "Update Submission" : "Submit Assignment"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {!showUploadSection && assignment.submitted && (
        <div className="mx-auto w-full max-w-3xl bg-black/40 backdrop-blur-sm rounded-xl p-8 text-center shadow-lg border border-gray-800 animate-fadeIn">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-4">
              <Check size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Assignment Submitted Successfully</h3>
            <p className="text-gray-400 mb-6">Your submission has been received and is being processed.</p>
            <button
              onClick={handleEdit}
              className="flex items-center justify-center space-x-2 py-2 px-6 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 transition-colors"
            >
              <Edit size={16} />
              <span>Edit Submission</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSubmit;