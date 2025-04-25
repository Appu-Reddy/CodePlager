"use client"
import { FormEvent, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Moon, Sun } from 'lucide-react';

export default function TeacherRegisterPage() {
  const [rollNo, setRollNo] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode
  const router = useRouter();

  // Check for user's preferred color scheme on initial load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if user has a saved preference
      const savedDarkMode = localStorage.getItem('darkMode');
      if (savedDarkMode) {
        setDarkMode(savedDarkMode === 'true');
      } else {
        // Default to dark mode for black & green theme
        setDarkMode(true);
      }
    }
  }, []);

  // Update document class and localStorage when darkMode changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('darkMode', darkMode.toString());
    }
  }, [darkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Form validation
    if (!rollNo || !name || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/addTeacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rollNo,
          name,
          pass: password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to register');
      }

      setSuccess('Registration successful! Redirecting to login page...');

      // Clear form
      setRollNo('');
      setName('');
      setPassword('');
      setConfirmPassword('');

      // Redirect to login page after short delay
      setTimeout(() => {
        router.push('/teacher-login');
      }, 2000);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        console.error('Registration error:', err.message);
      } else {
        setError('An error occurred during registration');
        console.error('Unknown registration error:', err);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-black' : 'bg-gray-100'}`}>
      {/* Navigation bar */}
      <nav className={`shadow w-full transition-colors duration-300 ${darkMode ? 'bg-black border-b border-green-600' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className={`text-lg font-bold transition-colors duration-300 ${darkMode ? 'text-green-500' : 'text-green-600'}`}>
                CodePlager
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {/* Dark mode toggle button */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full transition-colors duration-300 ${darkMode ? 'bg-green-900 text-green-300 hover:bg-green-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <Link href="/teacher-login" className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors duration-300 ${darkMode ? 'bg-green-600 hover:bg-green-500 border border-green-400' : 'bg-green-600 hover:bg-green-700'}`}>
                Teacher Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Teacher registration form */}
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className={`max-w-md w-full space-y-8 p-8 rounded-lg shadow-lg transition-colors duration-300 ${darkMode ? 'bg-gray-900 border border-green-700' : 'bg-white'}`}>
          <div>
            <h2 className={`mt-2 text-center text-3xl font-extrabold transition-colors duration-300 ${darkMode ? 'text-green-400' : 'text-gray-900'}`}>
              Teacher Registration
            </h2>
            <p className={`mt-2 text-center text-sm transition-colors duration-300 ${darkMode ? 'text-green-200' : 'text-gray-600'}`}>
              Create your teacher account
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md space-y-4">
              <div>
                <label htmlFor="roll-number" className={`block text-sm font-medium transition-colors duration-300 ${darkMode ? 'text-green-300' : 'text-gray-700'}`}>Roll Number</label>
                <input
                  id="roll-number"
                  name="rollNo"
                  type="text"
                  required
                  className={`mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border transition-colors duration-300 ${darkMode ? 'bg-black border-green-700 placeholder-green-700 text-green-100 focus:ring-green-500 focus:border-green-500' : 'border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-green-500 focus:border-green-500'}`}
                  placeholder="Enter your roll number"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="name" className={`block text-sm font-medium transition-colors duration-300 ${darkMode ? 'text-green-300' : 'text-gray-700'}`}>Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className={`mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border transition-colors duration-300 ${darkMode ? 'bg-black border-green-700 placeholder-green-700 text-green-100 focus:ring-green-500 focus:border-green-500' : 'border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-green-500 focus:border-green-500'}`}
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className={`block text-sm font-medium transition-colors duration-300 ${darkMode ? 'text-green-300' : 'text-gray-700'}`}>Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className={`mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border transition-colors duration-300 ${darkMode ? 'bg-black border-green-700 placeholder-green-700 text-green-100 focus:ring-green-500 focus:border-green-500' : 'border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-green-500 focus:border-green-500'}`}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className={`block text-sm font-medium transition-colors duration-300 ${darkMode ? 'text-green-300' : 'text-gray-700'}`}>Confirm Password</label>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  required
                  className={`mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border transition-colors duration-300 ${darkMode ? 'bg-black border-green-700 placeholder-green-700 text-green-100 focus:ring-green-500 focus:border-green-500' : 'border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-green-500 focus:border-green-500'}`}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            {success && (
              <div className="text-green-400 text-sm">{success}</div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-black transition-all duration-300 ${loading 
                  ? 'bg-green-400 cursor-not-allowed' 
                  : darkMode 
                    ? 'bg-green-500 hover:bg-green-400 border border-green-300' 
                    : 'bg-green-600 hover:bg-green-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>

            <div className="text-center">
              <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-green-200' : 'text-gray-600'}`}>
                Already have an account?{' '}
                <Link href="/teacher-login" className={`font-medium transition-colors duration-300 ${darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-500'}`}>
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}