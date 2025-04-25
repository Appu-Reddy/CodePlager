"use client"

import React, { useState } from 'react';
import { Calendar, Clock, BookOpen, CheckCircle, Plus, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const TeacherAssignmentsPage = () => {
  const router = useRouter();
  
  const [assignments, setAssignments] = useState([
    {
      id: "asg-001",
      name: "Advanced Algorithms - Final Project",
      course: "CS 410 - Advanced Algorithms",
      dueDate: "2025-05-15T23:59:59",
      status: "active", // active, draft, closed
      submissionCount: 24,
      gradedCount: 10
    },
    {
      id: "asg-002",
      name: "Database Systems - SQL Implementation",
      course: "CS 315 - Database Systems",
      dueDate: "2025-05-08T23:59:59", 
      status: "active",
      submissionCount: 18,
      gradedCount: 5
    },
    {
      id: "asg-003",
      name: "Machine Learning - Classification Models",
      course: "CS 512 - Machine Learning",
      dueDate: "2025-04-30T23:59:59",
      status: "closed",
      submissionCount: 30,
      gradedCount: 30
    },
    {
      id: "asg-004",
      name: "Web Development - Final Project",
      course: "CS 290 - Web Development",
      dueDate: "2025-05-20T23:59:59",
      status: "active",
      submissionCount: 12,
      gradedCount: 0
    },
    {
      id: "asg-005",
      name: "Operating Systems - Memory Management",
      course: "CS 344 - Operating Systems",
      dueDate: "2025-04-22T23:59:59",
      status: "draft",
      submissionCount: 0,
      gradedCount: 0
    }
  ]);
  

  const formatDate = (dateString: string | number | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  

  const getTimeRemaining = (dueDate: string | number | Date) => {
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
  
  // Get status color and icon
  const getStatusInfo = (assignment) => {
    switch(assignment.status) {
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
  
  const handleAssignmentClick = (assignment) => {
    router.push(`/assignment/view?id=${assignment.id}&name=${encodeURIComponent(assignment.name)}`);
  };
  
  const handleCreateAssignment = () => {
    router.push('/dashboard/teacher/create-assignment');
  };
  
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
      
      <div className="flex justify-end mb-6">
        <button 
          onClick={handleCreateAssignment}
          className="flex items-center bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-all duration-300"
        >
          <Plus size={20} className="mr-2" />
          Create Assignment
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assignments.map((assignment) => {
          const statusInfo = getStatusInfo(assignment);
          
          return (
            <div 
              key={assignment.id} 
              className="bg-black/40 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-800 shadow-lg hover:border-green-600/50 transition-all duration-300 cursor-pointer"
              onClick={() => handleAssignmentClick(assignment)}
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{assignment.name}</h3>
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
                      <p className="text-lg font-bold text-white">{assignment.submissionCount}</p>
                    </div>
                    <div className="bg-black/30 p-3 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Graded</p>
                      <p className="text-lg font-bold text-green-400">{assignment.gradedCount}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-between items-center">
                  <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full ${
                        assignment.status === 'closed' ? 'bg-purple-500' : 
                        assignment.status === 'draft' ? 'bg-gray-500' : 'bg-green-500'
                      }`}
                      style={{ 
                        width: assignment.submissionCount === 0 ? '0%' : 
                        `${Math.round((assignment.gradedCount / assignment.submissionCount) * 100)}%` 
                      }}
                    />
                  </div>
                  <div className="flex ml-4">
                    <Edit size={18} className="text-gray-400 hover:text-white mr-2" />
                    <Trash2 size={18} className="text-gray-400 hover:text-red-400" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
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