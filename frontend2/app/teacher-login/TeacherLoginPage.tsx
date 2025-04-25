"use client"
import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { User, CheckCircle,AlertCircle,Eye,EyeOff,Loader,LogOut,ChevronRight,Moon,Lock } from "lucide-react";
import { useRouter } from 'next/navigation';

export default function TeacherLoginPage() {
  const [rollNo, setRollNo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userStatus, setUserStatus] = useState<'none' | 'student' | 'teacher'>('none');
  const [darkMode, setDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [animateForm, setAnimateForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check user login status
    const teacherId = localStorage.getItem("teacherid");
    const studentRoll = localStorage.getItem("Roll");

    if (teacherId) {
      setUserStatus('teacher');
    } else if (studentRoll) {
      setUserStatus('student');
    } else {
      setUserStatus('none');
    }

    // Check theme preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    // Trigger form animation after a brief delay
    setTimeout(() => {
      setAnimateForm(true);
    }, 100);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem("theme", "light");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!rollNo || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/teacher-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rollNo, pass: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to login');
      }

      localStorage.setItem('teacherid', rollNo);
      router.push('/dashboard/teacher');
    }
    catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        console.error('Login error:', err.message);
      } else {
        setError('An error occurred during login');
        console.error('Unknown login error:', err);
      }
    }
    finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    if (userStatus === 'teacher') {
      localStorage.removeItem("teacherid");
    }
    else if (userStatus === 'student') {
      localStorage.removeItem("Roll");
      localStorage.removeItem("StudentInfo");
    }
    setUserStatus('none');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} flex flex-col transition-all duration-300`}>
      {/* Background gradient effect */}
      <div className={`absolute inset-0 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black' : 'bg-gradient-to-br from-gray-50 via-gray-100 to-white'} pointer-events-none transition-all duration-500`}></div>

      {/* Nav bar with glass effect */}
      <nav className={`relative z-10 ${darkMode ? 'bg-gray-800/80 backdrop-blur-md' : 'bg-white/80 backdrop-blur-md'} shadow-lg w-full transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className={`text-xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'} transition-colors duration-300`}>
                <span className="inline-block mr-2">💻</span>
                Code Plager
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${darkMode
                  ? 'bg-gray-700 text-green-400 hover:bg-gray-600'
                  : 'bg-gray-200 text-green-700 hover:bg-gray-300'} 
                  transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500`}
                aria-label="Toggle dark mode"
              >
                {/* {darkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )} */}
              </button>

              {userStatus === 'none' && (
                <>
                  <Link href="/student-login" className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${darkMode ? 'bg-green-600 hover:bg-green-500' : 'bg-green-600 hover:bg-green-700'} transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}>
                    Student Login
                  </Link>
                  <Link href="/teacher-register" className={`inline-flex items-center px-4 py-2 border ${darkMode ? 'border-green-500 text-green-400 hover:bg-green-900/30' : 'border-green-600 text-green-600 hover:bg-green-50'} text-sm font-medium rounded-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}>
                    Register as Teacher
                  </Link>
                </>
              )}
              {userStatus === 'teacher' && (
                <Link href="/dashboard/teacher" className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${darkMode ? 'bg-green-600 hover:bg-green-500' : 'bg-green-600 hover:bg-green-700'} transition-all duration-300 transform hover:scale-105`}>
                  Teacher Dashboard
                </Link>
              )}
              {userStatus === 'student' && (
                <Link href="/dashboard/student" className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${darkMode ? 'bg-green-600 hover:bg-green-500' : 'bg-green-600 hover:bg-green-700'} transition-all duration-300 transform hover:scale-105`}>
                  Student Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className={`max-w-md w-full ${animateForm ? 'transform-none opacity-100' : 'translate-y-4 opacity-0'} transition-all duration-500 ease-out`}>
          <div className={`${darkMode ? 'bg-gray-800/90 border border-gray-700' : 'bg-white'} rounded-2xl shadow-2xl overflow-hidden p-8`}>
            <div className="text-center">
              <div className={`inline-flex items-center justify-center h-16 w-16 rounded-full ${darkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-600'} mb-4`}>
                <User className="h-8 w-8" />
              </div>
              <h2 className={`text-center text-3xl font-extrabold ${darkMode ? 'text-green-400' : 'text-gray-900'}`}>
                Teacher Login
              </h2>
              <p className={`mt-2 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Sign in to access your teacher dashboard
              </p>
            </div>

            {userStatus !== 'none' && (
              <div className={`mt-8 text-center py-8 ${darkMode ? 'bg-gray-700/50' : 'bg-green-50'} rounded-xl p-6`}>
                <div className={`inline-flex items-center justify-center h-12 w-12 rounded-full ${darkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-600'} mb-4`}>
                  <CheckCircle className="h-6 w-6" />

                </div>
                <p className={`text-lg font-medium mb-4 ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                  You are logged in as a {userStatus}.
                </p>
                <div className="flex justify-center space-x-4">
                  <Link
                    href={`/dashboard/${userStatus}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-500 transition-all duration-300 transform hover:scale-105"
                  >
                    <ChevronRight className="h-4 w-4 mr-2" />

                    Go to Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-500 transition-all duration-300 transform hover:scale-105"
                  >
                    <LogOut className="h-4 w-4 mr-2" />

                    Logout
                  </button>
                </div>
              </div>
            )}

            {userStatus === 'none' && (
              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="roll-number" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Roll Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User
                          className={`h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
                        />
                      </div>
                      <input
                        id="roll-number"
                        name="rollNo"
                        type="text"
                        autoComplete="username"
                        required
                        className={`pl-10 appearance-none rounded-lg relative block w-full px-3 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-300`}
                        placeholder="Enter your roll number"
                        value={rollNo}
                        onChange={(e) => setRollNo(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock
                          className={`h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
                        />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        className={`pl-10 appearance-none rounded-lg relative block w-full px-3 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-300`}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="focus:outline-none"
                        >
                          {showPassword ? (
                            <EyeOff className={`h-5 w-5 ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`} />
                          ) : (
                            <Eye className={`h-5 w-5 ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className={`${darkMode ? 'bg-red-900/30 border border-red-800' : 'bg-red-50 border border-red-200'} text-sm rounded-md p-3 flex items-center space-x-2 transition-all duration-300`}>
                    <AlertCircle className={`h-5 w-5 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />

                    <span className={`${darkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className={`ml-2 block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      Remember me
                    </label>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${loading
                      ? `${darkMode ? 'bg-green-700' : 'bg-green-400'} cursor-not-allowed`
                      : `${darkMode ? 'bg-green-600 hover:bg-green-500' : 'bg-green-600 hover:bg-green-700'} transition-all duration-300 transform hover:translate-y-px`
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-md`}
                  >
                    {loading ? (
                      <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                        <Loader className="h-5 w-5 text-green-300 animate-spin" />

                      </span>
                    ) : (
                      <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                        <User className="h-5 w-5 text-green-300" />
                      </span>
                    )}
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>
                </div>

                <div className={`mt-6 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Not registered yet?{' '}
                  <Link href="/teacher-register" className={`font-medium ${darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-500'} transition-colors duration-300`}>
                    Create an account
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer with glass effect */}
      <footer className={`relative z-10 ${darkMode ? 'bg-gray-800/80 text-gray-300' : 'bg-white/80 text-gray-600'} py-6 backdrop-blur-md transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center text-sm">
            <p className="mb-2">
              &copy; {new Date().getFullYear()} Code Plager. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <a href="#" className={`${darkMode ? 'hover:text-green-400' : 'hover:text-green-600'} transition-colors duration-300`}>Privacy Policy</a>
              <a href="#" className={`${darkMode ? 'hover:text-green-400' : 'hover:text-green-600'} transition-colors duration-300`}>Terms of Service</a>
              <a href="#" className={`${darkMode ? 'hover:text-green-400' : 'hover:text-green-600'} transition-colors duration-300`}>Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}