"use client"
import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function StudentLoginPage() {
  const [rollNo, setRollNo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userStatus, setUserStatus] = useState<'none' | 'student' | 'teacher'>('none');
  const router = useRouter();

  useEffect(() => {
    const studentRoll = localStorage.getItem("Roll");
    const teacherId = localStorage.getItem("teacherid");
    
    if (studentRoll) {
      setUserStatus('student');
    } else if (teacherId) {
      setUserStatus('teacher');
    } else {
      setUserStatus('none');
    }
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!rollNo || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch("http://localhost:5000/api/student-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          rollNo: rollNo,
          pass: password
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to login');
      }
      
      if (data.message === "Login successful") {
        localStorage.setItem("Roll", rollNo);
        
        if (data.student) {
          localStorage.setItem("StudentInfo", JSON.stringify(data.student));
        }
        
        router.push("/dashboard/student");
      } else {
        setError('Invalid credentials');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        console.error('Login error:', err.message);
      } else {
        setError('An unexpected error occurred during login');
        console.error('Unexpected login error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (userStatus === 'teacher') {
      localStorage.removeItem("teacherid");
    } else if (userStatus === 'student') {
      localStorage.removeItem("Roll");
      localStorage.removeItem("StudentInfo");
    }
    setUserStatus('none');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="bg-white shadow w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-lg font-bold text-blue-600">Code Plager</span>
            </div>
            <div className="flex items-center space-x-4">
              {userStatus === 'none' && (
                <Link href="/teacher-login" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  Teacher Login
                </Link>
              )}
              {userStatus === 'student' && (
                <Link href="/dashboard/student" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  Student Dashboard
                </Link>
              )}
              {userStatus === 'teacher' && (
                <Link href="/dashboard/teacher" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  Teacher Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Student Login
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Sign in to access your student dashboard
            </p>
          </div>
          
          {userStatus !== 'none' && (
            <div className="text-center py-8">
              <p className="text-green-600 text-lg font-medium mb-4">
                You are logged in as a {userStatus}.
              </p>
              <div className="flex justify-center space-x-4">
                <Link href={`/dashboard/${userStatus}`} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  Go to Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
          
          {userStatus === 'none' && (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="rounded-md shadow-sm space-y-4">
                <div>
                  <label htmlFor="roll-number" className="sr-only">Roll Number</label>
                  <input
                    id="roll-number"
                    name="rollNo"
                    type="text"
                    autoComplete="username"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Roll Number"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}

              <div className="flex items-center justify-end">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}