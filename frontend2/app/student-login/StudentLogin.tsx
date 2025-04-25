"use client"
import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sun, Moon, LogIn, User, Key, BookOpen, AlertCircle, Loader2 } from 'lucide-react';

export default function StudentLoginPage() {
  const [rollNo, setRollNo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userStatus, setUserStatus] = useState<'none' | 'student' | 'teacher'>('none');
  const [darkMode, setDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [animateTheme, setAnimateTheme] = useState(false);
  const router = useRouter();

  // Theme configuration
  const themes = {
    light: {
      primary: 'bg-green-600 hover:bg-green-700',
      primaryText: 'text-green-600',
      background: 'bg-gray-50',
      cardBg: 'bg-white',
      navBg: 'bg-white',
      inputBg: 'bg-white',
      border: 'border-gray-300',
      text: 'text-gray-900',
      secondaryText: 'text-gray-600',
      shadow: 'shadow-md',
      buttonText: 'text-white',
      focusRing: 'focus:ring-green-500 focus:border-green-500',
      toggleBg: 'bg-gray-200 hover:bg-gray-300',
    },
    dark: {
      primary: 'bg-green-500 hover:bg-green-600',
      primaryText: 'text-green-400',
      background: 'bg-gray-900',
      cardBg: 'bg-gray-800',
      navBg: 'bg-gray-800 border-b border-gray-700',
      inputBg: 'bg-gray-700',
      border: 'border-gray-600',
      text: 'text-gray-100',
      secondaryText: 'text-gray-400',
      shadow: 'shadow-lg shadow-gray-900/50',
      buttonText: 'text-white',
      focusRing: 'focus:ring-green-400 focus:border-green-400',
      toggleBg: 'bg-gray-700 hover:bg-gray-600',
    }
  };

  useEffect(() => {
    // Check if user is already logged in
    const studentRoll = localStorage.getItem("Roll");
    const teacherId = localStorage.getItem("teacherid");
    
    if (studentRoll) {
      setUserStatus('student');
    } else if (teacherId) {
      setUserStatus('teacher');
    } else {
      setUserStatus('none');
    }

    // Check for stored theme preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // Apply initial animation class
    setTimeout(() => {
      setAnimateTheme(true);
    }, 100);
  }, []);

  const toggleTheme = () => {
    setAnimateTheme(false);
    
    // Small delay to reset animation state
    setTimeout(() => {
      const newDarkMode = !darkMode;
      setDarkMode(newDarkMode);
      
      if (newDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem("theme", "light");
      }
      
      // Re-trigger animation
      setTimeout(() => {
        setAnimateTheme(true);
      }, 50);
    }, 100);
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

  const currentTheme = darkMode ? themes.dark : themes.light;

  return (
    <div className={`min-h-screen transition-all duration-500 ${currentTheme.background} ${currentTheme.text}`}>
      {/* Background pattern - visible in light mode, subtle in dark mode */}
      <div className="fixed inset-0 z-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-repeat" style={{ backgroundImage: darkMode ? 'radial-gradient(circle, #22c55e 1px, transparent 1px)' : 'radial-gradient(circle, #15803d 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      </div>

      <nav className={`${currentTheme.navBg} shadow-lg sticky top-0 z-10 transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className={`text-xl font-bold flex items-center ${darkMode ? 'text-green-400' : 'text-green-600'} transition-all duration-300 ${animateTheme ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <BookOpen className="mr-2" size={24} />
                <span className="font-mono">Code Plager</span>
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {/* <button
                onClick={toggleTheme}
                className={`p-2 rounded-full ${currentTheme.toggleBg} transition-all duration-300 transform hover:scale-110`}
                aria-label="Toggle theme"
              >
                {darkMode ? 
                  <Sun size={20} className="text-yellow-300 animate-spin-slow" /> : 
                  <Moon size={20} className="text-gray-700" />
                }
              </button> */}
              
              {userStatus === 'none' && (
                <Link href="/teacher-login" className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${currentTheme.buttonText} ${currentTheme.primary} transform hover:scale-105 transition-all duration-300`}>
                  <User className="mr-1" size={16} />
                  Teacher Login
                </Link>
              )}
              {userStatus === 'student' && (
                <Link href="/dashboard/student" className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${currentTheme.buttonText} ${currentTheme.primary} transform hover:scale-105 transition-all duration-300`}>
                  Student Dashboard
                </Link>
              )}
              {userStatus === 'teacher' && (
                <Link href="/dashboard/teacher" className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${currentTheme.buttonText} ${currentTheme.primary} transform hover:scale-105 transition-all duration-300`}>
                  Teacher Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className={`max-w-md w-full ${currentTheme.cardBg} rounded-xl ${currentTheme.shadow} p-8 space-y-8 transition-all duration-300 transform ${animateTheme ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div>
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg">
              <LogIn className="h-8 w-8 text-white" />
            </div>
            <h2 className={`mt-6 text-center text-3xl font-extrabold ${currentTheme.text}`}>
              Student Login
            </h2>
            <p className={`mt-2 text-center text-sm ${currentTheme.secondaryText}`}>
              Sign in to access your student dashboard
            </p>
          </div>
          
          {userStatus !== 'none' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center p-2 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                <User className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <p className={`${darkMode ? 'text-green-400' : 'text-green-600'} text-lg font-medium mb-4`}>
                You are logged in as a {userStatus}.
              </p>
              <div className="flex justify-center space-x-4">
                <Link 
                  href={`/dashboard/${userStatus}`} 
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${currentTheme.buttonText} ${currentTheme.primary} transform hover:scale-105 transition-all duration-300`}
                >
                  Go to Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transform hover:scale-105 transition-all duration-300"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
          
          {userStatus === 'none' && (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="rounded-md shadow-sm space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                  </div>
                  <input
                    id="roll-number"
                    name="rollNo"
                    type="text"
                    autoComplete="username"
                    required
                    className={`appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 ${currentTheme.inputBg} ${currentTheme.border} placeholder:${currentTheme.secondaryText} ${currentTheme.text} focus:outline-none focus:ring-2 ${currentTheme.focusRing} transition-all duration-300`}
                    placeholder="Roll Number"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className={`appearance-none rounded-lg relative block w-full pl-10 pr-12 px-3 py-3 ${currentTheme.inputBg} ${currentTheme.border} placeholder:${currentTheme.secondaryText} ${currentTheme.text} focus:outline-none focus:ring-2 ${currentTheme.focusRing} transition-all duration-300`}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} focus:outline-none`}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm bg-red-100 dark:bg-red-900/30 p-3 rounded-md flex items-start">
                  <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className={`h-4 w-4 text-green-600 focus:ring-green-500 ${currentTheme.border} rounded transition-all duration-300`}
                  />
                  <label htmlFor="remember-me" className={`ml-2 block text-sm ${currentTheme.text}`}>
                    Remember me
                  </label>
                </div>
                {/* <div className="text-sm">
                  <a href="#" className={`font-medium ${darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-500'}`}>
                    Forgot password?
                  </a>
                </div> */}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg ${currentTheme.buttonText} ${
                    loading 
                      ? (darkMode ? 'bg-green-500/60' : 'bg-green-400') 
                      : `${currentTheme.primary}`
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transform hover:scale-[1.02] transition-all duration-300`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <LogIn size={16} className="mr-2" />
                      Sign in
                    </span>
                  )}
                </button>
              </div>
              
              <div className="mt-4 text-center text-sm">
                <span className={currentTheme.secondaryText}>New student? </span>
                <a href="#" className={`font-medium ${darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-500'}`}>
                  Contact your teacher for credentials
                </a>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className={`w-full py-4 mt-8 ${currentTheme.navBg} border-t ${currentTheme.border}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
          <div className={`text-sm ${currentTheme.secondaryText}`}>
            © {new Date().getFullYear()} Code Plager. All rights reserved.
          </div>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <a href="#" className={`text-sm ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}>Privacy Policy</a>
            <a href="#" className={`text-sm ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}>Terms of Service</a>
            <a href="#" className={`text-sm ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}>Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}