"use client"

import React, { useState } from 'react';
import { Calendar, Clock, BookOpen, ChevronRight, CheckCircle, AlertCircle, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';

const StudentAssignmentsPage = () => {
  const router = useRouter();
  
  const [assignments, setAssignments] = useState([
    {
      id: "asg-001",
      name: "Advanced Algorithms - Final Project",
      course: "CS 410 - Advanced Algorithms",
      dueDate: "2025-05-15T23:59:59",
      status: "pending", // pending, submitted, graded, late
      submissionDate: null,
      grade: null
    },
    {
      id: "asg-002",
      name: "Database Systems - SQL Implementation",
      course: "CS 315 - Database Systems",
      dueDate: "2025-05-08T23:59:59", 
      status: "submitted",
      submissionDate: "2025-04-20T14:32:10",
      grade: null
    },
    {
      id: "asg-003",
      name: "Machine Learning - Classification Models",
      course: "CS 512 - Machine Learning",
      dueDate: "2025-04-30T23:59:59",
      status: "graded",
      submissionDate: "2025-04-15T09:12:45",
      grade: 92
    },
    {
      id: "asg-004",
      name: "Web Development - Final Project",
      course: "CS 290 - Web Development",
      dueDate: "2025-05-20T23:59:59",
      status: "pending",
      submissionDate: null,
      grade: null
    },
    {
      id: "asg-005",
      name: "Operating Systems - Memory Management",
      course: "CS 344 - Operating Systems",
      dueDate: "2025-04-22T23:59:59",
      status: "late",
      submissionDate: null,
      grade: null
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
  const getStatusInfo = (assignment: {
          id: string; name: string; course: string; dueDate: string; status: string;
          submissionDate: null; grade: null;
      } | { id: string; name: string; course: string; dueDate: string; status: string; submissionDate: string; grade: null; } | { id: string; name: string; course: string; dueDate: string; status: string; submissionDate: string; grade: number; }) => {
    switch(assignment.status) {
      case 'submitted':
        return { 
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20',
          icon: <CheckCircle size={18} />,
          text: 'Submitted'
        };
      case 'graded':
        return { 
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          icon: <Award size={18} />,
          text: `Graded: ${assignment.grade}/100`
        };
      case 'late':
        return { 
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          icon: <AlertCircle size={18} />,
          text: 'Past Due'
        };
      default:
        return { 
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/20',
          icon: <Clock size={18} />,
          text: getTimeRemaining(assignment.dueDate)
        };
    }
  };
  
  const handleAssignmentClick = (assignment) => {
    router.push(`/assignment/submit?id=${assignment.id}&name=${encodeURIComponent(assignment.name)}`);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-gray-100 p-8">
      <div className="w-full bg-black/60 backdrop-blur-sm rounded-xl p-8 shadow-xl border-l-4 border-blue-500 mb-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BookOpen size={32} className="text-blue-400 mr-4" />
            <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text">
              My Assignments
            </h1>
          </div>
          <div className="flex items-center">
            <Calendar size={20} className="text-blue-400 mr-2" />
            <span className="text-gray-400">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assignments.map((assignment) => {
          const statusInfo = getStatusInfo(assignment);
          
          return (
            <div 
              key={assignment.id} 
              className="bg-black/40 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-800 shadow-lg hover:border-blue-600/50 transition-all duration-300 cursor-pointer"
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
                  
                  {assignment.submissionDate && (
                    <div className="flex items-center text-gray-300">
                      <CheckCircle size={16} className="mr-2 text-blue-400" />
                      <span>Submitted: {formatDate(assignment.submissionDate)}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex justify-between items-center">
                  <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full ${
                        assignment.status === 'graded' ? 'bg-green-500' : 
                        assignment.status === 'submitted' ? 'bg-blue-500' :
                        assignment.status === 'late' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}
                      style={{ 
                        width: assignment.status === 'graded' ? '100%' : 
                              assignment.status === 'submitted' ? '66%' : 
                              assignment.status === 'pending' ? '33%' : '0%' 
                      }}
                    />
                  </div>
                  <ChevronRight size={20} className="text-blue-400 ml-4" />
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
            <p className="text-gray-400 text-sm mb-1">Submitted</p>
            <p className="text-2xl font-bold text-blue-400">
              {assignments.filter(a => a.status === 'submitted' || a.status === 'graded').length}
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-black/60">
            <p className="text-gray-400 text-sm mb-1">Graded</p>
            <p className="text-2xl font-bold text-green-400">
              {assignments.filter(a => a.status === 'graded').length}
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-black/60">
            <p className="text-gray-400 text-sm mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">
              {assignments.filter(a => a.status === 'pending').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAssignmentsPage;