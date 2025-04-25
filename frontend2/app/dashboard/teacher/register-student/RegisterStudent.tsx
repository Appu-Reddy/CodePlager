"use client"
import { useState } from 'react';

export default function StudentRegistrationForm() {
  const [students, setStudents] = useState([
    { rollNo: '', name: '', pass: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleStudentChange = (index, field, value) => {
    const updatedStudents = [...students];
    updatedStudents[index] = {
      ...updatedStudents[index],
      [field]: value
    };
    setStudents(updatedStudents);
  };

  const addStudentField = () => {
    setStudents([...students, { rollNo: '', name: '', pass: '' }]);
  };

  const removeStudentField = (index) => {
    if (students.length > 1) {
      const updatedStudents = students.filter((_, i) => i !== index);
      setStudents(updatedStudents);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Validate all fields are filled
    const isValid = students.every(student => 
      student.rollNo.trim() !== '' && 
      student.name.trim() !== '' && 
      student.pass.trim() !== ''
    );

    if (!isValid) {
      setError('Please fill all fields for all students');
      setLoading(false);
      return;
    }

    try {
      // Option 1: Register students one by one
      const results = await Promise.all(
        students.map(async (student) => {
          const response = await fetch('http://localhost:5000/api/addStudent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(student),
          });
          
          return {
            rollNo: student.rollNo,
            success: response.ok,
            data: await response.json()
          };
        })
      );

      const failures = results.filter(result => !result.success);
      
      if (failures.length > 0) {
        setError(`Failed to register ${failures.length} out of ${students.length} students`);
      } else {
        setSuccess(`All ${students.length} students registered successfully!`);
        setStudents([{ rollNo: '', name: '', pass: '' }]);
      }
    } catch (err) {
      setError(err.message || 'An error occurred while registering students');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Register Students</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {students.map((student, index) => (
          <div key={index} className="mb-6 p-4 border border-gray-200 rounded-md">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">Student {index + 1}</h3>
              {students.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => removeStudentField(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor={`rollNo-${index}`} className="block text-gray-700 font-medium mb-2">
                  Roll Number
                </label>
                <input
                  type="text"
                  id={`rollNo-${index}`}
                  value={student.rollNo}
                  onChange={(e) => handleStudentChange(index, 'rollNo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor={`name-${index}`} className="block text-gray-700 font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id={`name-${index}`}
                  value={student.name}
                  onChange={(e) => handleStudentChange(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor={`pass-${index}`} className="block text-gray-700 font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id={`pass-${index}`}
                  value={student.pass}
                  onChange={(e) => handleStudentChange(index, 'pass', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>
        ))}
        
        <div className="flex justify-center mb-6">
          <button
            type="button"
            onClick={addStudentField}
            className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            + Add Another Student
          </button>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
        >
          {loading ? 'Registering Students...' : `Register ${students.length} Student${students.length > 1 ? 's' : ''}`}
        </button>
      </form>
    </div>
  );
}