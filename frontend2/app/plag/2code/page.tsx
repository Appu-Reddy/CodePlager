"use client"

import React, { useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';

const TwoCode = () => {
  const [leftFile, setLeftFile] = useState<File | null>(null);
  const [rightFile, setRightFile] = useState<File | null>(null);
  const [result, setResult] = useState<null | {
    ast_similarity: number;
    token_similarity: number;
    final_similarity: number;
    copied_sections?: string[];  // Make this optional with ?
  }>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLeftFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setLeftFile(files[0]);
    }
  };
  
  const handleRightFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setRightFile(files[0]);
    }
  };
  
  const handleCopyStatus = async () => {
    if (!leftFile || !rightFile) {
      alert("Please upload both files first.");
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
        throw new Error("API request failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Failed to analyze files. Make sure the backend is running."+ err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">File Comparison Tool</h1>

      <div className="w-full flex flex-col md:flex-row gap-6 mb-8">
        {/* File One Upload */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-700">File One</h2>
            <FileText className="text-blue-500" size={24} />
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
            <input 
              type="file" 
              id="leftFile" 
              className="hidden" 
              onChange={handleLeftFileChange}
            />
            <label htmlFor="leftFile" className="cursor-pointer w-full h-full flex flex-col items-center">
              <Upload className="text-blue-500 mb-3" size={36} />
              <p className="text-gray-600 text-center mb-2">
                {leftFile ? leftFile.name : "Drop your file here or click to browse"}
              </p>
              <p className="text-gray-400 text-sm text-center">
                {leftFile ? `${(leftFile.size / 1024).toFixed(2)} KB` : "Supports: .txt, .js, .py, .java"}
              </p>
            </label>
          </div>
        </div>

        {/* File Two Upload */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-700">File Two</h2>
            <FileText className="text-green-500" size={24} />
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
            <input 
              type="file" 
              id="rightFile" 
              className="hidden" 
              onChange={handleRightFileChange}
            />
            <label htmlFor="rightFile" className="cursor-pointer w-full h-full flex flex-col items-center">
              <Upload className="text-green-500 mb-3" size={36} />
              <p className="text-gray-600 text-center mb-2">
                {rightFile ? rightFile.name : "Drop your file here or click to browse"}
              </p>
              <p className="text-gray-400 text-sm text-center">
                {rightFile ? `${(rightFile.size / 1024).toFixed(2)} KB` : "Supports: .txt, .js, .py, .java"}
              </p>
            </label>
          </div>
        </div>
      </div>

      <button 
        onClick={handleCopyStatus} 
        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-800 text-white font-medium rounded-lg shadow-md flex items-center justify-center transition-colors mb-8"
        disabled={loading}
      >
        {loading ? "Analyzing..." : "Copy Status"}
      </button>

      <div className="w-full bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Comparison Results</h2>
          {(!leftFile || !rightFile) && (
            <div className="flex items-center text-amber-600">
              <AlertCircle size={18} className="mr-1" />
              <span className="text-sm">Upload both files to see comparison</span>
            </div>
          )}
        </div>

        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-32">
          {error && <p className="text-red-500">{error}</p>}

          {result ? (
            <div className="space-y-3 text-gray-700">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span>AST Similarity</span>
                <span>{result.ast_similarity}%</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span>Token Similarity</span>
                <span>{result.token_similarity}%</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span>Final Similarity</span>
                <span className="font-semibold">{result.final_similarity}%</span>
              </div>
              <div>
                <span className="block font-medium mt-4 mb-2">Copied Sections:</span>
                {result.copied_sections && result.copied_sections.length > 0 ? (
                  <ul className="list-disc ml-5 text-sm text-gray-600 space-y-1 max-h-40 overflow-y-auto">
                    {result.copied_sections.map((section, idx) => (
                      <li key={idx}><code>{section}</code></li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No significant copied sections found.</p>
                )}
              </div>
            </div>
          ) : (
            !error && <p className="text-gray-400">Results will appear here after analysis.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwoCode;