"use client"
import { useState, useEffect } from 'react';
// import Link from 'next/link';

export default function TeacherDashboard() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch teachers data when component mounts
    const fetchTeachers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/getTeacher');
        
        if (!response.ok) {
          throw new Error('Failed to fetch teachers data');
        }
        
        const data = await response.json();
        setTeachers(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
          console.error('Error fetching teachers:', err.message);
        } else {
          setError('An error occurred while fetching teachers');
          console.error('Unknown error fetching teachers:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation bar */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-lg font-bold text-green-600">School Portal</span>
            </div>
            <div className="flex items-center">
              <button 
                onClick={() => {
                  // Simple logout functionality
                  // In a real app, you would clear authentication tokens/cookies here
                  window.location.href = '/teacher-login';
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900">Teacher Dashboard</h1>
          
          <div className="mt-6">
            <h2 className="text-xl font-medium text-gray-900">All Teachers</h2>
            
            {loading && (
              <div className="mt-4 text-gray-600">Loading teachers data...</div>
            )}
            
            {error && (
              <div className="mt-4 text-red-500">{error}</div>
            )}
            
            {!loading && !error && teachers.length === 0 && (
              <div className="mt-4 text-gray-600">No teachers found.</div>
            )}
            
            {!loading && !error && teachers.length > 0 && (
              <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Roll Number
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                    </tr>
                  </thead>
                  {/* <tbody className="bg-white divide-y divide-gray-200">
                    {teachers.map((teacher) => (
                      <tr key={teacher._id || teacher.rollNo}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {teacher.rollNo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {teacher.name}
                        </td>
                      </tr>
                    ))}
                  </tbody> */}
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}