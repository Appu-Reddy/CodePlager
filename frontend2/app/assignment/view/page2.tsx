"use client"

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Clock, Award, Code, User, Percent, RefreshCw } from 'lucide-react';

const TeacherDashboard = () => {
  const [searchtxt, setsearchtxt] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('percentage');
  interface Student {
    id: string;
    name: string;
    percentage: number;
    submittime: string;
    code: string;
  }

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  interface CompareResults {
    matches: { student_1: string; student_2: string; similarity_percent: number }[];
  }
  const [compareResults, setCompareResults] = useState<CompareResults | null>(null);
  const [showCompareResults, setShowCompareResults] = useState(false);

  const searchParams = useSearchParams();
  const assignmentName = searchParams.get('name') || 'Assignment';

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4321/api/codes');
      const data = await response.json();
      
      const formattedStudents = data.map((submission: { id: unknown; name: unknown; filename: unknown; }) => {
        return {
          id: submission.id,
          name: submission.name,
          percentage: Math.floor(Math.random() * 20),
          submittime: new Date().toISOString(),
          code: submission.filename
        };
      });
      
      setStudents(formattedStudents);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const runPlagiarismCheck = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4321/api/run', {
        method: 'POST',
      });
      const data = await response.json();
      setCompareResults(data);
      setShowCompareResults(true);
    } catch (error) {
      console.error('Error running plagiarism check:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentClick = async (code: string, studentName: string, studentId: string) => {
    try {
      // Construct the filename pattern
      const fileName = `${studentName}_${studentId}_${code}`;
      console.log("file name: ",fileName)
      
      // Make a request to download the file
      const response = await fetch(`http://localhost:4321/api/download?file=${encodeURIComponent(fileName)}`);
      
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      
      // Get file content as blob
      const blob = await response.blob();
      
      // Create a download link and trigger download
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = code; // Use original filename for download
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Clean up the URL object
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert(`Error downloading file: ${error.message}`);
    }
  };

  const filteredStudents = students
    .filter(student => {
      if (filterStatus === 'low') return student.percentage < 10;
      if (filterStatus === 'high') return student.percentage >= 10;
      return true;
    })
    .filter(student => 
      student.name.toLowerCase().includes(searchtxt.toLowerCase()) || 
      student.id.toLowerCase().includes(searchtxt.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'percentage') return a.percentage - b.percentage;
      if (sortBy === 'time') {
        return new Date(a.submittime).getTime() - new Date(b.submittime).getTime();
      }
      return 0;
    });

  const leaderboardStudents = [...students]
    .sort((a, b) => {
      if (a.percentage !== b.percentage) return a.percentage - b.percentage;
      return new Date(a.submittime).getTime() - new Date(b.submittime).getTime();
    })
    .slice(0, 5);

  const formatTime = (dateTimeStr: string | number | Date) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 p-10 mx-auto transition duration-500">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-3/4 space-y-6">

          <div className="bg-black rounded-xl p-6 shadow-lg">
            <h2 className="text-3xl font-bold mb-8">{assignmentName}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black p-4 rounded-lg flex flex-col items-center justify-center">
                <div className="bg-blue-500 p-3 rounded-full mb-4">
                  <User size={24} />
                </div>
                <span className="text-2xl font-bold">{students.length}</span>
                <span className="text-gray-400 mt-2">Total Students</span>
              </div>
              
              <div className="bg-black p-4 rounded-lg flex flex-col items-center justify-center">
                <div className="bg-green-500 p-3 rounded-full mb-3">
                  <Percent size={24} />
                </div>
                <span className="text-2xl font-bold">
                  {students.length > 0 
                    ? Math.round(students.reduce((acc, student) => acc + student.percentage, 0) / students.length)
                    : 0}%
                </span>
                <span className="text-gray-400 mt-2">Avg Copy Percentage</span>
              </div>
              
              <div className="bg-black p-4 rounded-lg flex flex-col items-center justify-center">
                <div className="bg-purple-500 p-3 rounded-full mb-3">
                  <Code size={24} />
                </div>
                <span className="text-2xl font-bold">{students.filter(s => s.percentage < 5).length}</span>
                <span className="text-gray-400 mt-2">Original Submissions</span>
              </div>
            </div>
          </div>

          <div className="bg-black rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-8">Student Submissions</h2>

            <div className="mb-6 flex items-center">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search students by name or ID..."
                  className="w-full bg-black rounded-lg py-3 px-12 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={searchtxt}
                  onChange={(e) => setsearchtxt(e.target.value)}
                />
                <Search className="absolute left-4 top-3" size={20} />
              </div>
              <button 
                className="ml-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center"
                onClick={runPlagiarismCheck}
              >
                <RefreshCw size={20} className="mr-2" />
                Compare Submissions
              </button>
            </div>

            {showCompareResults && compareResults && (
              <div className="mb-6 bg-gray-800 p-4 rounded-lg">
                <h3 className="text-xl font-bold mb-4">Plagiarism Report</h3>
                
                <div className="mb-4">
                  <h4 className="text-lg font-medium mb-2">Matches ({compareResults.matches.length})</h4>
                  {compareResults.matches.length === 0 ? (
                    <p className="text-gray-400">No plagiarism matches found</p>
                  ) : (
                    compareResults.matches.map((match, idx) => (
                      <div key={idx} className="bg-gray-700 p-3 rounded mb-2 flex justify-between">
                        <div>
                          <span className="font-medium">{match.student_1}</span> and <span className="font-medium">{match.student_2}</span>
                        </div>
                        <div className="text-red-400 font-bold">{match.similarity_percent}% similar</div>
                      </div>
                    ))
                  )}
                </div>
                
                <button 
                  className="text-blue-400 hover:text-blue-300 font-medium"
                  onClick={() => setShowCompareResults(false)}
                >
                  Hide Report
                </button>
              </div>
            )}

            <div className="overflow-x-auto">
            <p className='text-yellow-600 ' >Click the student name to download the copy of the student response</p>
              <table className="w-full">
                <thead className="text-left bg-black">
                  <tr className='text-[19px]'>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Student ID</th>
                    <th className="p-3">Copy %</th>
                    <th className="p-3">Submitted Time</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="text-center p-6">Loading submissions...</td>
                    </tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center p-6">No submissions found</td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, index) => (
                      <tr 
                        key={student.id} 
                        className={` transition duration-500 cursor-pointer ${index % 2 === 0 ? 'bg-gray-750' : 'bg-black'}`}
                        onClick={() => handleStudentClick(student.code, student.name, student.id)}
                      >
                        <td className="p-3 transition duration-300 hover:text-[105%] hover:underline hover:text-blue-600 ">{student.name}</td>
                        <td className="p-3 transition duration-300 ">{student.id}</td>
                        <td className="p-3">
                          <span className={`inline-block px-2 py-1 rounded ${
                            student.percentage < 5 ? 'bg-green-900 text-green-300' : 
                            student.percentage < 10 ? 'bg-yellow-900 text-yellow-300' : 
                            'bg-red-900 text-red-300'
                          }`}>
                            {student.percentage}%
                          </span>
                        </td>
                        <td className="p-3">{formatTime(student.submittime)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:w-1/4">
          <div className="bg-black rounded-xl shadow-lg h-full flex flex-col">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Filters</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 mb-2">Copy Percentage :</label>
                  <div className="flex space-x-2">
                    <button 
                      className={`px-4 py-2 rounded ${filterStatus === 'all' ? 'bg-blue-600' : 'bg-black'}`}
                      onClick={() => setFilterStatus('all')}
                    >All
                    </button>
                    <button 
                      className={`px-4 py-2 rounded ${filterStatus === 'low' ? 'bg-blue-600' : 'bg-black'}`}
                      onClick={() => setFilterStatus('low')}
                    >Low (&lt;10%)
                    </button>
                    <button 
                      className={`px-4 py-2 rounded ${filterStatus === 'high' ? 'bg-blue-600' : 'bg-black'}`}
                      onClick={() => setFilterStatus('high')}
                    >High (≥10%)
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-400 mb-2">Sort By : </label>
                  <div className="flex space-x-2">
                    <button 
                      className={`px-4 py-2 rounded flex items-center ${sortBy === 'percentage' ? 'bg-blue-600' : 'bg-black'}`}
                      onClick={() => setSortBy('percentage')}
                    ><Percent size={16} className="mr-1" />
                      Percentage
                    </button>
                    <button 
                      className={`px-4 py-2 rounded flex items-center ${sortBy === 'time' ? 'bg-blue-600' : 'bg-black'}`}
                      onClick={() => setSortBy('time')}
                    ><Clock size={16} className="mr-1" />
                      Time
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 flex-1">
              <div className="flex items-center mb-4">
                <Award className="text-yellow-500 mr-2" size={24} />
                <h2 className="text-xl font-bold">Leaderboard</h2>
              </div>
              <p className="text-gray-400 text-sm mb-4">Top students with lowest copy percentage and fastest submissions</p>
              
              <div className="space-y-3">
                {leaderboardStudents.map((student, index) => (
                  <div 
                    key={student.id}
                    className="bg-black rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition"
                    onClick={() => handleStudentClick(student.code, student.name, student.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-black h-8 w-8 rounded-full flex items-center justify-center mr-3">
                          <span className="font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-medium">{student.name}</h3>
                          <div className="text-gray-400 text-sm">{student.id}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${
                          student.percentage < 5 ? 'text-green-400' : 
                          student.percentage < 10 ? 'text-yellow-400' : 
                          'text-red-400'
                        }`}>
                          {student.percentage}%
                        </div>
                        <div className="text-gray-400 text-sm">{formatTime(student.submittime)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;



























// "use client"

// import React, { useState, useEffect } from 'react';
// import { useSearchParams } from 'next/navigation';
// import { Search, Clock, Award, Code, User, Percent, RefreshCw } from 'lucide-react';

// const TeacherDashboard = () => {
//   const [searchtxt, setsearchtxt] = useState('');
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [sortBy, setSortBy] = useState('percentage');
//   interface Student {
//     id: string;
//     name: string;
//     percentage: number;
//     submittime: string;
//     code: string;
//   }

//   const [students, setStudents] = useState<Student[]>([]);
//   const [loading, setLoading] = useState(true);
//   interface CompareResults {
//     matches: { student_1: string; student_2: string; similarity_percent: number }[];
//   }
//   const [compareResults, setCompareResults] = useState<CompareResults | null>(null);
//   const [showCompareResults, setShowCompareResults] = useState(false);

//   const searchParams = useSearchParams();
//   const assignmentName = searchParams.get('name') || 'Assignment';

//   useEffect(() => {
//     fetchSubmissions();
//   }, []);

//   const fetchSubmissions = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch('http://localhost:4321/api/codes');
//       const data = await response.json();
      
//       const formattedStudents = data.map((submission: { id: unknown; name: unknown; filename: unknown; }) => {
//         return {
//           id: submission.id,
//           name: submission.name,
//           percentage: Math.floor(Math.random() * 20),
//           submittime: new Date().toISOString(),
//           code: submission.filename
//         };
//       });
      
//       setStudents(formattedStudents);
//     } catch (error) {
//       console.error('Error fetching submissions:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const runPlagiarismCheck = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch('http://localhost:4321/api/run', {
//         method: 'POST',
//       });
//       const data = await response.json();
//       setCompareResults(data);
//       setShowCompareResults(true);
//     } catch (error) {
//       console.error('Error running plagiarism check:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredStudents = students
//     .filter(student => {
//       if (filterStatus === 'low') return student.percentage < 10;
//       if (filterStatus === 'high') return student.percentage >= 10;
//       return true;
//     })
//     .filter(student => 
//       student.name.toLowerCase().includes(searchtxt.toLowerCase()) || 
//       student.id.toLowerCase().includes(searchtxt.toLowerCase())
//     )
//     .sort((a, b) => {
//       if (sortBy === 'percentage') return a.percentage - b.percentage;
//       if (sortBy === 'time') {
//         return new Date(a.submittime).getTime() - new Date(b.submittime).getTime();
//       }
//       return 0;
//     });

//   const leaderboardStudents = [...students]
//     .sort((a, b) => {
//       if (a.percentage !== b.percentage) return a.percentage - b.percentage;
//       return new Date(a.submittime).getTime() - new Date(b.submittime).getTime();
//     })
//     .slice(0, 5);

//   const formatTime = (dateTimeStr: string | number | Date) => {
//     const date = new Date(dateTimeStr);
//     return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   const handleStudentClick = (code: string) => {
//     alert(`Navigating to student code: ${code}`);
//   };

//   return (
//     <div className="min-h-screen bg-black text-gray-100 p-10 mx-auto transition duration-500">
//       <div className="flex flex-col lg:flex-row gap-6">
//         <div className="lg:w-3/4 space-y-6">

//           <div className="bg-black rounded-xl p-6 shadow-lg">
//             <h2 className="text-3xl font-bold mb-8">{assignmentName}</h2>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div className="bg-black p-4 rounded-lg flex flex-col items-center justify-center">
//                 <div className="bg-blue-500 p-3 rounded-full mb-4">
//                   <User size={24} />
//                 </div>
//                 <span className="text-2xl font-bold">{students.length}</span>
//                 <span className="text-gray-400 mt-2">Total Students</span>
//               </div>
              
//               <div className="bg-black p-4 rounded-lg flex flex-col items-center justify-center">
//                 <div className="bg-green-500 p-3 rounded-full mb-3">
//                   <Percent size={24} />
//                 </div>
//                 <span className="text-2xl font-bold">
//                   {students.length > 0 
//                     ? Math.round(students.reduce((acc, student) => acc + student.percentage, 0) / students.length)
//                     : 0}%
//                 </span>
//                 <span className="text-gray-400 mt-2">Avg Copy Percentage</span>
//               </div>
              
//               <div className="bg-black p-4 rounded-lg flex flex-col items-center justify-center">
//                 <div className="bg-purple-500 p-3 rounded-full mb-3">
//                   <Code size={24} />
//                 </div>
//                 <span className="text-2xl font-bold">{students.filter(s => s.percentage < 5).length}</span>
//                 <span className="text-gray-400 mt-2">Original Submissions</span>
//               </div>
//             </div>
//           </div>

//           <div className="bg-black rounded-xl p-6 shadow-lg">
//             <h2 className="text-2xl font-bold mb-8">Student Submissions</h2>

//             <div className="mb-6 flex items-center">
//               <div className="relative flex-grow">
//                 <input
//                   type="text"
//                   placeholder="Search students by name or ID..."
//                   className="w-full bg-black rounded-lg py-3 px-12 focus:outline-none focus:ring-2 focus:ring-blue-400"
//                   value={searchtxt}
//                   onChange={(e) => setsearchtxt(e.target.value)}
//                 />
//                 <Search className="absolute left-4 top-3" size={20} />
//               </div>
//               <button 
//                 className="ml-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center"
//                 onClick={runPlagiarismCheck}
//               >
//                 <RefreshCw size={20} className="mr-2" />
//                 Compare Submissions
//               </button>
//             </div>

//             {showCompareResults && compareResults && (
//               <div className="mb-6 bg-gray-800 p-4 rounded-lg">
//                 <h3 className="text-xl font-bold mb-4">Plagiarism Report</h3>
                
//                 <div className="mb-4">
//                   <h4 className="text-lg font-medium mb-2">Matches ({compareResults.matches.length})</h4>
//                   {compareResults.matches.length === 0 ? (
//                     <p className="text-gray-400">No plagiarism matches found</p>
//                   ) : (
//                     compareResults.matches.map((match, idx) => (
//                       <div key={idx} className="bg-gray-700 p-3 rounded mb-2 flex justify-between">
//                         <div>
//                           <span className="font-medium">{match.student_1}</span> and <span className="font-medium">{match.student_2}</span>
//                         </div>
//                         <div className="text-red-400 font-bold">{match.similarity_percent}% similar</div>
//                       </div>
//                     ))
//                   )}
//                 </div>
                
//                 <button 
//                   className="text-blue-400 hover:text-blue-300 font-medium"
//                   onClick={() => setShowCompareResults(false)}
//                 >
//                   Hide Report
//                 </button>
//               </div>
//             )}

//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="text-left bg-black">
//                   <tr className='text-[19px]'>
//                     <th className="p-3">Student Name</th>
//                     <th className="p-3">Student ID</th>
//                     <th className="p-3">Copy %</th>
//                     {/* <th className="p-3">AI %</th> */}
//                     <th className="p-3">Submitted Time</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {loading ? (
//                     <tr>
//                       <td colSpan={4} className="text-center p-6">Loading submissions...</td>
//                     </tr>
//                   ) : filteredStudents.length === 0 ? (
//                     <tr>
//                       <td colSpan={4} className="text-center p-6">No submissions found</td>
//                     </tr>
//                   ) : (
//                     filteredStudents.map((student, index) => (
//                       <tr 
//                         key={student.id} 
//                         className={`hover:text-[17px] transition duration-500 cursor-pointer ${index % 2 === 0 ? 'bg-gray-750' : 'bg-black'}`}
//                         onClick={() => handleStudentClick(student.code)}
//                       >
//                         <td className="p-3">{student.name}</td>
//                         <td className="p-3">{student.id}</td>
//                         <td className="p-3">
//                           <span className={`inline-block px-2 py-1 rounded ${
//                             student.percentage < 5 ? 'bg-green-900 text-green-300' : 
//                             student.percentage < 10 ? 'bg-yellow-900 text-yellow-300' : 
//                             'bg-red-900 text-red-300'
//                           }`}>
//                             {student.percentage}%
//                           </span>
//                         </td>
//                         <td className="p-3">{formatTime(student.submittime)}</td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>

//         <div className="lg:w-1/4">
//           <div className="bg-black rounded-xl shadow-lg h-full flex flex-col">
//             <div className="p-6">
//               <h2 className="text-2xl font-bold mb-4">Filters</h2>
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-gray-400 mb-2">Copy Percentage :</label>
//                   <div className="flex space-x-2">
//                     <button 
//                       className={`px-4 py-2 rounded ${filterStatus === 'all' ? 'bg-blue-600' : 'bg-black'}`}
//                       onClick={() => setFilterStatus('all')}
//                     >All
//                     </button>
//                     <button 
//                       className={`px-4 py-2 rounded ${filterStatus === 'low' ? 'bg-blue-600' : 'bg-black'}`}
//                       onClick={() => setFilterStatus('low')}
//                     >Low (&lt;10%)
//                     </button>
//                     <button 
//                       className={`px-4 py-2 rounded ${filterStatus === 'high' ? 'bg-blue-600' : 'bg-black'}`}
//                       onClick={() => setFilterStatus('high')}
//                     >High (≥10%)
//                     </button>
//                   </div>
//                 </div>
                
//                 <div>
//                   <label className="block text-gray-400 mb-2">Sort By : </label>
//                   <div className="flex space-x-2">
//                     <button 
//                       className={`px-4 py-2 rounded flex items-center ${sortBy === 'percentage' ? 'bg-blue-600' : 'bg-black'}`}
//                       onClick={() => setSortBy('percentage')}
//                     ><Percent size={16} className="mr-1" />
//                       Percentage
//                     </button>
//                     <button 
//                       className={`px-4 py-2 rounded flex items-center ${sortBy === 'time' ? 'bg-blue-600' : 'bg-black'}`}
//                       onClick={() => setSortBy('time')}
//                     ><Clock size={16} className="mr-1" />
//                       Time
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="p-6 flex-1">
//               <div className="flex items-center mb-4">
//                 <Award className="text-yellow-500 mr-2" size={24} />
//                 <h2 className="text-xl font-bold">Leaderboard</h2>
//               </div>
//               <p className="text-gray-400 text-sm mb-4">Top students with lowest copy percentage and fastest submissions</p>
              
//               <div className="space-y-3">
//                 {leaderboardStudents.map((student, index) => (
//                   <div 
//                     key={student.id}
//                     className="bg-black rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition"
//                     onClick={() => handleStudentClick(student.code)}
//                   >
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center">
//                         <div className="bg-black h-8 w-8 rounded-full flex items-center justify-center mr-3">
//                           <span className="font-bold">{index + 1}</span>
//                         </div>
//                         <div>
//                           <h3 className="font-medium">{student.name}</h3>
//                           <div className="text-gray-400 text-sm">{student.id}</div>
//                         </div>
//                       </div>
//                       <div className="text-right">
//                         <div className={`font-bold ${
//                           student.percentage < 5 ? 'text-green-400' : 
//                           student.percentage < 10 ? 'text-yellow-400' : 
//                           'text-red-400'
//                         }`}>
//                           {student.percentage}%
//                         </div>
//                         <div className="text-gray-400 text-sm">{formatTime(student.submittime)}</div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TeacherDashboard;







