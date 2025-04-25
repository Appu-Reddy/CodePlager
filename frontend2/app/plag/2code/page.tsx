"use client"

import React, { useState } from 'react';
import { Upload, Copy, FileText, AlertCircle } from 'lucide-react';

const TwoCode = () => {
  const [leftFile, setLeftFile] = useState<File | null>(null);
  const [rightFile, setRightFile] = useState<File | null>(null);

  const handleLeftFileChange = (e) => {
    if (e.target.files.length > 0) {
      setLeftFile(e.target.files[0]);
    }
  };

  const handleRightFileChange = (e) => {
    if (e.target.files.length > 0) {
      setRightFile(e.target.files[0]);
    }
  };

  const handleCopyStatus = () => {
    alert("Button clicked");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">File Comparison Tool</h1>
      
      <div className="w-full flex flex-col md:flex-row gap-6 mb-8">
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
          
          {leftFile && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
              <div className="flex items-center">
                <FileText className="text-blue-500 mr-2" size={16} />
                <p className="text-blue-700 font-medium truncate">{leftFile.name}</p>
              </div>
            </div>
          )}
        </div>
        

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
          
          {rightFile && (
            <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-md">
              <div className="flex items-center">
                <FileText className="text-green-500 mr-2" size={16} />
                <p className="text-green-700 font-medium truncate">{rightFile.name}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <button 
        onClick={handleCopyStatus} 
        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-800 text-white font-medium rounded-lg shadow-md flex items-center justify-center transition-colors mb-8"
      >Copy Status
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
        
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-32 flex items-center justify-center">
          {leftFile && rightFile ? (
            <div className="w-full">
              <div className="flex justify-between text-gray-600 mb-2 pb-2 border-b border-gray-200">
                <span>Similarity Score</span>
                <span>Pending Analysis</span>
              </div>
              <div className="flex justify-between text-gray-600 mb-2 pb-2 border-b border-gray-200">
                <span>Differences Found</span>
                <span>Pending Analysis</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Processing Status</span>
                <span className="text-amber-600">Ready to analyze</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Results will appear here after uploading both files</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwoCode;