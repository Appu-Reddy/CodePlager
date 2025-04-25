"use client"

import React, { useState, useCallback, useEffect } from 'react';
import { Upload, FileText, AlertCircle, X, Loader2, BarChart2, Sun, Moon } from 'lucide-react';

// Define proper TypeScript types
type ComparisonResult = {
  ast_similarity: number;
  token_similarity: number;
  final_similarity: number;
  copied_sections?: string[];
};

const TwoCode = () => {
  const [leftFile, setLeftFile] = useState<File | null>(null);
  const [rightFile, setRightFile] = useState<File | null>(null);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('darkMode');
    
    if (savedTheme !== null) {
      setDarkMode(savedTheme === 'true');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // If no localStorage value, check system preference
      setDarkMode(true);
    }
  }, []);

  // Apply theme changes to document
  useEffect(() => {
    // Apply dark mode classes to document
    if (darkMode) {
      document.documentElement.classList.add('dark-theme');
      document.body.style.backgroundColor = '#111827'; // dark gray
      document.body.style.color = '#f3f4f6'; // light gray
    } else {
      document.documentElement.classList.remove('dark-theme');
      document.body.style.backgroundColor = '#f3f4f6'; // light gray
      document.body.style.color = '#1f2937'; // dark gray
    }
    
    // Save preference to localStorage
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  // File handling with drag and drop support
  const handleDragEnter = useCallback((side: string) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(side);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((side: 'left' | 'right') => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (side === 'left') {
        setLeftFile(file);
      } else {
        setRightFile(file);
      }
    }
  }, []);

  const handleFileChange = useCallback((side: 'left' | 'right') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (side === 'left') {
        setLeftFile(files[0]);
      } else {
        setRightFile(files[0]);
      }
    }
  }, []);

  const clearFile = useCallback((side: 'left' | 'right') => {
    if (side === 'left') {
      setLeftFile(null);
    } else {
      setRightFile(null);
    }
    // Clear results when files change
    setResult(null);
  }, []);

  const getSimilarityColor = (value: number) => {
    if (darkMode) {
      if (value >= 80) return "text-red-400";
      if (value >= 50) return "text-amber-400";
      return "text-green-400";
    } else {
      if (value >= 80) return "text-red-600";
      if (value >= 50) return "text-amber-600";
      return "text-green-600";
    }
  };

  const handleCompare = async () => {
    if (!leftFile || !rightFile) {
      setError("Please upload both files first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file1", leftFile);
    formData.append("file2", rightFile);

    try {
      const res = await fetch("http://127.0.0.1:5000/compare", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
      }

      const data: ComparisonResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(`Failed to analyze files: ${err instanceof Error ? err.message : "Unknown error"}. Make sure the backend is running.`);
    } finally {
      setLoading(false);
    }
  };

  // File dropzone component to reduce duplication
  const FileDropzone = ({ side, file, onFileChange, onDragEnter, onDrop, onClear }: {
    side: 'left' | 'right';
    file: File | null;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDragEnter: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onClear: () => void;
  }) => {
    const isDragging = dragActive === side;
    const color = side === 'left' ? 'blue' : 'green';
    
    return (
      <div className={`flex-1 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-md p-6 border`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            {side === 'left' ? 'File One' : 'File Two'}
          </h2>
          <FileText className={`text-${color}-500`} size={24} />
        </div>
        <div 
          className={`relative border-2 ${isDragging 
            ? `border-${color}-500` 
            : `border-dashed ${darkMode ? 'border-gray-600' : 'border-gray-300'}`} 
            rounded-lg p-8 flex flex-col items-center justify-center 
            ${darkMode 
              ? (file ? 'bg-gray-700' : 'bg-gray-700 hover:bg-gray-600')
              : (file ? 'bg-gray-50' : 'bg-gray-50 hover:bg-gray-100')} 
            transition-colors`}
          onDragEnter={onDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={onDrop}
        >
          {file && (
            <button 
              onClick={onClear}
              className={`absolute top-2 right-2 p-1 rounded-full ${
                darkMode 
                  ? 'bg-gray-600 hover:bg-gray-500' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              aria-label="Clear file"
            >
              <X size={16} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
            </button>
          )}
          
          <input 
            type="file" 
            id={`${side}File`} 
            className="hidden" 
            onChange={onFileChange}
            accept=".txt,.js,.py,.java,.html,.css,.c,.cpp,.cs,.rb,.php,.json,.xml"
          />
          <label htmlFor={`${side}File`} className="cursor-pointer w-full h-full flex flex-col items-center">
            <Upload className={`text-${color}-500 mb-3`} size={36} />
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-center mb-2`}>
              {file ? file.name : "Drop your file here or click to browse"}
            </p>
            <p className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} text-sm text-center`}>
              {file 
                ? `${(file.size / 1024).toFixed(2)} KB` 
                : "Supports: .txt, .js, .py, .java, .html, .css and more"}
            </p>
          </label>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} p-4 md:p-8 flex flex-col items-center transition-colors duration-200`}>
      <div className="w-full max-w-6xl flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Code Comparison Tool</h1>
        
        <button 
          onClick={toggleTheme}
          className={`p-2 rounded-full ${
            darkMode 
              ? 'bg-gray-700 hover:bg-gray-600' 
              : 'bg-gray-200 hover:bg-gray-300'
          } transition-colors`}
          aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
        >
          {darkMode ? (
            <Sun className="text-yellow-400" size={20} />
          ) : (
            <Moon className="text-gray-700" size={20} />
          )}
        </button>
      </div>

      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6 mb-8">
        <FileDropzone 
          side="left"
          file={leftFile}
          onFileChange={handleFileChange('left')}
          onDragEnter={handleDragEnter('left')}
          onDrop={handleDrop('left')}
          onClear={() => clearFile('left')}
        />

        <FileDropzone 
          side="right"
          file={rightFile}
          onFileChange={handleFileChange('right')}
          onDragEnter={handleDragEnter('right')}
          onDrop={handleDrop('right')}
          onClear={() => clearFile('right')}
        />
      </div>

      <button 
        onClick={handleCompare} 
        className={`px-8 py-3 ${
          loading 
            ? (darkMode ? 'bg-indigo-500' : 'bg-indigo-400') 
            : (darkMode ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-indigo-600 hover:bg-indigo-700')
        } text-white font-medium rounded-lg shadow-md flex items-center justify-center 
        transition-colors mb-8 w-64`}
        disabled={loading || !leftFile || !rightFile}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin mr-2" size={20} />
            Analyzing...
          </>
        ) : (
          <>
            <BarChart2 className="mr-2" size={20} />
            Compare Files
          </>
        )}
      </button>

      <div className={`w-full max-w-6xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-md p-6 border`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Comparison Results</h2>
          {(!leftFile || !rightFile) && (
            <div className="flex items-center text-amber-600 dark:text-amber-400">
              <AlertCircle size={18} className="mr-1" />
              <span className="text-sm">Upload both files to see comparison</span>
            </div>
          )}
        </div>

        {error && (
          <div className={`border rounded-lg p-4 flex items-start ${
            darkMode 
              ? 'border-red-900 bg-red-900/30' 
              : 'border-red-200 bg-red-50'
          }`}>
            <AlertCircle className={`${darkMode ? 'text-red-400' : 'text-red-600'} mr-2 mt-0.5 flex-shrink-0`} size={18} />
            <p className={darkMode ? 'text-red-400' : 'text-red-600'}>{error}</p>
          </div>
        )}

        {!error && (
          <div className={`border rounded-lg p-4 min-h-32 ${
            darkMode 
              ? 'border-gray-700 bg-gray-700' 
              : 'border-gray-200 bg-gray-50'
          }`}>
            {result ? (
              <div className={`space-y-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className={`rounded-lg p-4 shadow-sm border ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <div className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>AST Similarity</div>
                    <div className="flex justify-between items-center">
                      <div className={`text-2xl font-semibold ${getSimilarityColor(result.ast_similarity)}`}>
                        {result.ast_similarity}%
                      </div>
                      <div className={`h-2 w-24 rounded-full overflow-hidden ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                        <div 
                          className={`h-full ${
                            result.ast_similarity >= 80 
                              ? (darkMode ? 'bg-red-400' : 'bg-red-500')
                              : result.ast_similarity >= 50 
                                ? (darkMode ? 'bg-amber-400' : 'bg-amber-500')
                                : (darkMode ? 'bg-green-400' : 'bg-green-500')
                          }`}
                          style={{ width: `${result.ast_similarity}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`rounded-lg p-4 shadow-sm border ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <div className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Token Similarity</div>
                    <div className="flex justify-between items-center">
                      <div className={`text-2xl font-semibold ${getSimilarityColor(result.token_similarity)}`}>
                        {result.token_similarity}%
                      </div>
                      <div className={`h-2 w-24 rounded-full overflow-hidden ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                        <div 
                          className={`h-full ${
                            result.token_similarity >= 80 
                              ? (darkMode ? 'bg-red-400' : 'bg-red-500')
                              : result.token_similarity >= 50 
                                ? (darkMode ? 'bg-amber-400' : 'bg-amber-500')
                                : (darkMode ? 'bg-green-400' : 'bg-green-500')
                          }`}
                          style={{ width: `${result.token_similarity}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`rounded-lg p-4 shadow-sm border ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <div className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Final Similarity</div>
                    <div className="flex justify-between items-center">
                      <div className={`text-2xl font-semibold ${getSimilarityColor(result.final_similarity)}`}>
                        {result.final_similarity}%
                      </div>
                      <div className={`h-2 w-24 rounded-full overflow-hidden ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                        <div 
                          className={`h-full ${
                            result.final_similarity >= 80 
                              ? (darkMode ? 'bg-red-400' : 'bg-red-500')
                              : result.final_similarity >= 50 
                                ? (darkMode ? 'bg-amber-400' : 'bg-amber-500')
                                : (darkMode ? 'bg-green-400' : 'bg-green-500')
                          }`}
                          style={{ width: `${result.final_similarity}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className={`rounded-lg p-4 shadow-sm border ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}>
                  <span className="block font-medium mb-2">Copied Sections:</span>
                  {result.copied_sections && result.copied_sections.length > 0 ? (
                    <div className="max-h-64 overflow-y-auto">
                      <ul className={`list-disc ml-5 text-sm space-y-2 ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {result.copied_sections.map((section, idx) => (
                          <li key={idx} className={`pb-2 border-b last:border-0 ${
                            darkMode ? 'border-gray-700' : 'border-gray-100'
                          }`}>
                            <code className={`p-1 rounded text-sm font-mono ${
                              darkMode ? 'bg-gray-700' : 'bg-gray-100'
                            }`}>{section}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No significant copied sections found.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className={`flex flex-col items-center justify-center py-8 ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                <BarChart2 size={36} className="mb-2" />
                <p>Results will appear here after analysis.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className={`mt-8 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <p>Upload code files to compare their similarity and detect potential plagiarism.</p>
      </footer>
    </div>
  );
};

export default TwoCode;