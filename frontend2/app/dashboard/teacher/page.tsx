"use client"

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, CheckCircle, Plus, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Assignment {
  _id: string;
  name: string;
  course: string;
  description: string;
  dueDate: string;
  status: 'active' | 'draft' | 'closed';
  maxScore: number;
  studentSubmissions: {
    isGraded: boolean;
    // other submission properties
  }[];
  // other properties
}

const TeacherAssignmentsPage = () => {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Replace with your actual teacher roll number or get it from auth context/session
  const teacherRollNo = localStorage.getItem("teacherid");

  useEffect(() => {
    // Only run on client-side where localStorage is available
    if (typeof window !== 'undefined') {
      fetchAssignments();
    }
  }, []);

  const fetchAssignments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const teacherId = localStorage.getItem("teacherid");
      if (!teacherId) {
        throw new Error('Teacher ID not found in localStorage');
      }
      
      console.log("Fetching assignments for teacher:", teacherId);
      const response = await fetch(`http://localhost:5000/assignments/teacher/${teacherId}`);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch assignments');
      }
      
      setAssignments(data);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError('Failed to load assignments. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/deleteAssignment/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete assignment');
      }

      // Remove from UI state after successful API call
      setAssignments(assignments.filter(a => a._id !== id));
    } catch (err) {
      console.error('Failed to delete assignment:', err);
      alert('Failed to delete assignment. Please try again.');
    }
  };

  const handleCreateAssignment = () => {
    router.push('/dashboard/teacher/create-assignment');
  };

  const handleRegisterStudent = () => {
    router.push('/dashboard/teacher/register-student');
  };

  const handleAssignmentClick = (assignment: Assignment) => {
    router.push(`/assignment/view?id=${assignment._id}&name=${encodeURIComponent(assignment.name)}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due.getTime() - now.getTime();

    if (diffMs < 0) return "Past due";

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} remaining`;
    } else {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} remaining`;
    }
  };

  const getStatusInfo = (assignment: Assignment) => {
    switch (assignment.status) {
      case 'closed':
        return {
          color: 'text-purple-400',
          bgColor: 'bg-purple-500/20',
          icon: <CheckCircle size={18} />,
          text: 'Closed'
        };
      case 'draft':
        return {
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/20',
          icon: <Edit size={18} />,
          text: 'Draft'
        };
      default:
        return {
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          icon: <Clock size={18} />,
          text: getTimeRemaining(assignment.dueDate)
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading assignments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-gray-100 p-8 flex items-center justify-center">
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-8 border border-red-900 max-w-md w-full">
          <h2 className="text-xl font-bold text-red-400 mb-4">Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={fetchAssignments}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-gray-100 p-8">
      <div className="w-full bg-black/60 backdrop-blur-sm rounded-xl p-8 shadow-xl border-l-4 border-green-500 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BookOpen size={32} className="text-green-400 mr-4" />
            <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-green-400 via-teal-400 to-green-400 bg-clip-text">
              Manage Assignments
            </h1>
          </div>
          <div className="flex items-center">
            <Calendar size={20} className="text-green-400 mr-2" />
            <span className="text-gray-400">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-6 gap-3">
        <button
          onClick={handleCreateAssignment}
          className="flex items-center bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-all duration-300"
        >
          <Plus size={20} className="mr-2" />
          Create Assignment
        </button>
        <button
          onClick={handleRegisterStudent}
          className="flex items-center bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-all duration-300"
        >
          <Plus size={20} className="mr-2" />
          Register Student
        </button>
      </div>

      {assignments.length === 0 ? (
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-12 text-center border border-gray-800">
          <h3 className="text-xl font-medium text-gray-400 mb-4">No assignments found</h3>
          <button
            onClick={handleCreateAssignment}
            className="flex items-center bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-all duration-300 mx-auto"
          >
            <Plus size={20} className="mr-2" />
            Create Your First Assignment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {assignments.map((assignment) => {
            const statusInfo = getStatusInfo(assignment);
            const submissionCount = assignment.studentSubmissions.length;
            const gradedCount = assignment.studentSubmissions.filter(sub => sub.isGraded).length;
            const percent = submissionCount > 0
              ? Math.round((gradedCount / submissionCount) * 100)
              : 0;

            return (
              <div
                key={assignment._id}
                className="bg-black/40 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-800 shadow-lg hover:border-green-600/50 transition-all duration-300"
              >
                <div className="p-6 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3
                        onClick={() => handleAssignmentClick(assignment)}
                        className="text-xl font-bold text-white mb-1 cursor-pointer hover:underline"
                      >
                        {assignment.name}
                      </h3>
                      <p className="text-gray-400">{assignment.course}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.color} flex items-center`}>
                      {statusInfo.icon}
                      <span className="ml-1 text-sm font-medium">{statusInfo.text}</span>
                    </div>
                  </div>

                  <div className="flex-grow">
                    <div className="flex items-center text-gray-300 mb-2">
                      <Clock size={16} className="mr-2 text-gray-400" />
                      <span>Due: {formatDate(assignment.dueDate)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div className="bg-black/30 p-3 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Submissions</p>
                        <p className="text-lg font-bold text-white">{submissionCount}</p>
                      </div>
                      <div className="bg-black/30 p-3 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Graded</p>
                        <p className="text-lg font-bold text-green-400">{gradedCount}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between items-center">
                    <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full ${assignment.status === 'closed' ? 'bg-purple-500' : assignment.status === 'draft' ? 'bg-gray-500' : 'bg-green-500'}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex ml-4">
                      <Edit
                        size={18}
                        onClick={() => router.push(`/dashboard/teacher/edit-assignment/${assignment._id}`)}
                        className="text-gray-400 hover:text-white mr-2 cursor-pointer"
                      />
                      <Trash2
                        size={18}
                        onClick={() => handleDelete(assignment._id)}
                        className="text-gray-400 hover:text-red-400 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800 shadow-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-black/60">
            <p className="text-gray-400 text-sm mb-1">Total Assignments</p>
            <p className="text-2xl font-bold text-white">{assignments.length}</p>
          </div>

          <div className="p-4 rounded-lg bg-black/60">
            <p className="text-gray-400 text-sm mb-1">Active</p>
            <p className="text-2xl font-bold text-green-400">
              {assignments.filter(a => a.status === 'active').length}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-black/60">
            <p className="text-gray-400 text-sm mb-1">Drafts</p>
            <p className="text-2xl font-bold text-gray-400">
              {assignments.filter(a => a.status === 'draft').length}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-black/60">
            <p className="text-gray-400 text-sm mb-1">Closed</p>
            <p className="text-2xl font-bold text-purple-400">
              {assignments.filter(a => a.status === 'closed').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAssignmentsPage;