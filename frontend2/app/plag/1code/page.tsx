'use client'
import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  // State management
  const [code, setCode] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [inputMethod, setInputMethod] = useState('code'); // 'code' or 'file'

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file size
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size exceeds 5MB limit');
        return;
      }
      
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setInputMethod('file');
      setError(null); // Clear any previous errors
    }
  };

  const setCodeInputMethod = () => {
    setFile(null);
    setFileName('');
    setInputMethod('code');
  };

  const setFileInputMethod = () => {
    document.getElementById('file-upload').click();
  };

  const clearForm = () => {
    setCode('');
    setFile(null);
    setFileName('');
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      let response;
      
      if (inputMethod === 'file' && file) {
        // File upload mode
        const formData = new FormData();
        formData.append('file', file);
        
        response = await fetch('http://127.0.0.1:1234/detect', {
          method: 'POST',
          body: formData
        });
      } else if (inputMethod === 'code' && code.trim()) {
        // Direct code input mode
        response = await fetch('http://127.0.0.1:1234/detect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code })
        });
      } else {
        throw new Error('Please provide code or upload a file');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `Server error: ${response.status}` }));
        throw new Error(errorData.error || `Request failed with status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
      console.error('Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getResultClass = (result) => {
    if (!result) return '';
    
    const isAI = result.detection_result.is_ai_generated;
    const confidence = result.confidence;
    
    if (isAI) {
      return confidence > 0.8 ? 'text-red-600 dark:text-red-400' : 'text-orange-500';
    } else {
      return confidence > 0.8 ? 'text-green-600 dark:text-green-400' : 'text-blue-500';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-black text-gray-900 dark:text-white">
      <Head>
        <title>Code Analyzer</title>
        <meta name="description" content="Analyze your code for AI-generated content" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="border-b dark:border-gray-700 bg-white dark:bg-gray-950 shadow">
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold">Code Analyzer</h1>
        </div>
      </header>

      <main className="container mx-auto p-4 flex-1">
        <div className="max-w-3xl mx-auto">
          {/* Analysis form */}
          <div className="bg-white dark:bg-gray-950 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Submit Code for Analysis</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Input Method
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    className={`px-4 py-2 rounded transition duration-300 hover:scale-105 cursor-pointer ${inputMethod === 'code' ? 'bg-blue-700 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                    onClick={setCodeInputMethod}
                  >
                    Paste Code
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded transition duration-300 hover:scale-105 cursor-pointer ${inputMethod === 'file' ? 'bg-blue-700 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                    onClick={setFileInputMethod}
                  >
                    Upload File
                  </button>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".py,.java,.js,.jsx,.ts,.tsx,.cpp,.c,.go,.rs"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              {inputMethod === 'code' && (
                <div className="mb-4">
                  <label htmlFor="code" className="block text-sm font-medium mb-2">
                    Code
                  </label>
                  <textarea
                    id="code"
                    className="w-full h-64 p-3 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Paste your code here..."
                  />
                </div>
              )}

              {fileName && (
                <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-between">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>{fileName}</span>
                  </div>
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700"
                    onClick={setCodeInputMethod}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={isLoading || (inputMethod === 'code' && !code.trim()) || (inputMethod === 'file' && !file)}
                  className={`flex-1 py-2 px-4 rounded font-medium transition-colors cursor-pointer ${
                    isLoading || (inputMethod === 'code' && !code.trim()) || (inputMethod === 'file' && !file)
                      ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                      : 'bg-blue-700 hover:bg-blue-600 text-white'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </span>
                  ) : 'Analyze Code'}
                </button>
                <button
                  type="button"
                  onClick={clearForm}
                  className="py-2 px-4 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-lg mb-6 animate-fadeIn">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="font-medium">Error</p>
              </div>
              <p className="mt-2">{error}</p>
            </div>
          )}

          {/* Analysis results */}
          {result && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 animate-fadeIn">
              <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
              
              <div className="mb-6">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Verdict</div>
                <div className={`text-2xl font-bold ${getResultClass(result)}`}>
                  {result.verdict}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">AI Probability</div>
                  <div className="text-xl font-bold">{(result.detection_result.ai_prob * 100).toFixed(2)}%</div>
                </div>
                
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Human Probability</div>
                  <div className="text-xl font-bold">{(result.detection_result.human_prob * 100).toFixed(2)}%</div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Confidence</div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <div 
                    className={`h-4 rounded-full transition-all duration-500 ${
                      result.detection_result.is_ai_generated 
                        ? 'bg-red-500' 
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${result.confidence * 100}%` }}
                  ></div>
                </div>
                <div className="text-right text-sm mt-1">{(result.confidence * 100).toFixed(2)}%</div>
              </div>
              
              {result.filename && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Analyzed file</div>
                  <div className="font-medium">{result.filename}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t dark:border-gray-700 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
        <div className="container mx-auto">
          Code Analyzer &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}