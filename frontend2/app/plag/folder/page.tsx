'use client'
import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [zipFile, setZipFile] = useState(null);
  const [zipFileName, setZipFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.zip')) {
        setError('Please upload a zip file');
        return;
      }

      if (selectedFile.size > 350 * 1024 * 1024) { // ✅ Updated to 350MB
        setError('File size exceeds 350MB limit');
        return;
      }

      setZipFile(selectedFile);
      setZipFileName(selectedFile.name);
      setError(null);
    }
  };

  const clearForm = () => {
    setZipFile(null);
    setZipFileName('');
    setResult(null);
    setError(null);
    setAnalysisProgress(0);
  };

  const handleUpload = () => {
    document.getElementById('zip-upload').click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!zipFile) {
      setError('Please upload a zip file');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setAnalysisProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', zipFile);

      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 500);

      const response = await fetch('http://127.0.0.1:1234/detect-zip', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setAnalysisProgress(100);

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
          <div className="bg-white dark:bg-gray-950 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Upload ZIP File for Analysis</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                {!zipFileName ? (
                  <div 
                    onClick={handleUpload}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                  >
                    <input
                      id="zip-upload"
                      type="file"
                      accept=".zip"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Click to upload a ZIP file</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      Maximum file size: 350MB
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-between">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      <span>{zipFileName}</span>
                    </div>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700"
                      onClick={clearForm}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={isLoading || !zipFile}
                  className={`flex-1 py-2 px-4 rounded font-medium transition-colors ${
                    isLoading || !zipFile
                      ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
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
                  ) : 'Analyze ZIP'}
                </button>
                {zipFile && (
                  <button
                    type="button"
                    onClick={clearForm}
                    className="py-2 px-4 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              {isLoading && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>Analysis Progress</span>
                    <span>{Math.round(analysisProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-blue-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${analysisProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-lg mb-6 animate-fadeIn">
              <p className="font-medium">Error</p>
              <p className="mt-2">{error}</p>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 animate-fadeIn">
              <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>

              <div className="text-2xl font-bold mb-4">
                Verdict: <span className={getResultClass(result)}>{result.verdict}</span>
              </div>

              <div className="mb-4">AI Probability: {(result.detection_result.ai_prob * 100).toFixed(2)}%</div>
              <div className="mb-4">Human Probability: {(result.detection_result.human_prob * 100).toFixed(2)}%</div>
              <div className="mb-4">Confidence: {(result.confidence * 100).toFixed(2)}%</div>

              {result.files_analyzed && <p>Files analyzed: {result.files_analyzed}</p>}
              {result.file_results && result.file_results.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Per File Results</h3>
                  <ul className="list-disc ml-6">
                    {result.file_results.map((file, index) => (
                      <li key={index}>
                        {file.filename}: {file.is_ai_generated ? 'AI-generated' : 'Human'} ({(file.ai_prob * 100).toFixed(1)}%)
                      </li>
                    ))}
                  </ul>
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
