"use client"
import { useState, useRef } from 'react';
import Link from 'next/link';

export default function Main() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const featuresRef = useRef(null);

  const scrollToFeatures = (e) => {
    e.preventDefault();
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <nav className="bg-gray-900 shadow-lg border-b border-green-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <span className="text-3xl p-1 font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">CodePlager</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="px-4 py-2 text-green-300 font-medium text-lg hover:text-white transition-colors">Home</Link>
              <a href="#features" onClick={scrollToFeatures} className="px-4 py-2 text-gray-300 hover:text-green-300 font-medium text-lg transition-colors">Features</a>
              <Link href="/pricing" className="px-4 py-2 text-gray-300 hover:text-green-300 font-medium text-lg transition-colors">Pricing</Link>
              <Link href="/about" className="px-4 py-2 text-gray-300 hover:text-green-300 font-medium text-lg transition-colors">About</Link>
              <Link href="/contact" className="px-4 py-2 text-gray-300 hover:text-green-300 font-medium text-lg transition-colors">Contact</Link>
              <Link href="/student-login" className="ml-4 px-5 py-3 bg-gradient-to-r from-green-600 to-green-800 text-white rounded-lg hover:from-green-700 hover:to-green-900 text-lg font-medium shadow-md hover:shadow-lg transition-all">Login</Link>
            </div>
            
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-green-400 hover:bg-gray-800 focus:outline-none transition-colors"
              >
                <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black rounded-b-lg shadow-lg">
              <Link href="/" className="block px-4 py-2 text-green-300 font-medium text-lg rounded hover:bg-gray-700 transition-colors">Home</Link>
              <a href="#features" onClick={scrollToFeatures} className="block px-4 py-2 text-gray-300 hover:text-green-300 font-medium text-lg rounded hover:bg-gray-700 transition-colors">Features</a>
              <Link href="/pricing" className="block px-4 py-2 text-gray-300 hover:text-green-300 font-medium text-lg rounded hover:bg-gray-700 transition-colors">Pricing</Link>
              <Link href="/about" className="block px-4 py-2 text-gray-300 hover:text-green-300 font-medium text-lg rounded hover:bg-gray-700 transition-colors">About</Link>
              <Link href="/contact" className="block px-4 py-2 text-gray-300 hover:text-green-300 font-medium text-lg rounded hover:bg-gray-700 transition-colors">Contact</Link>
              <Link href="/login" className="block mt-4 px-5 py-3 bg-gradient-to-r from-green-600 to-green-800 text-white rounded-lg text-center text-lg font-medium shadow-md">Login</Link>
            </div>
          </div>
        )}
      </nav>
      
      <div className="relative pt-16 pb-24 overflow-hidden mb-10 bg-black">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute left-0 top-0 transform -translate-x-1/3">
            <div className="w-96 h-96 rounded-full bg-green-600 filter blur-3xl"></div>
          </div>
          <div className="absolute right-0 bottom-0 transform translate-x-1/3">
            <div className="w-96 h-96 rounded-full bg-emerald-600 filter blur-3xl"></div>
          </div>
        </div>
        
        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mx-auto max-w-3xl">
              <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                <span className="block">Promote Academic</span>
                <span className="block pb-3 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">Integrity in Coding</span>
              </h1>
              <p className="mt-6 text-xl text-gray-300 sm:max-w-3xl mx-auto">
                Advanced code plagiarism detection for educational institutions, coding bootcamps, and online learning platforms.
              </p>
              <div className="mt-8 flex justify-center space-x-4">
                <Link href="/signup" className="px-8 py-3 text-base font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 md:py-4 md:text-lg md:px-10 shadow-md hover:shadow-lg transition-all">
                  Get Started
                </Link>
                <Link href="/demo" className="px-8 py-3 border border-green-400 text-base font-medium rounded-lg text-green-400 bg-transparent hover:bg-gray-800 md:py-4 md:text-lg md:px-10 transition-colors">
                  Live Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div id="features" ref={featuresRef} className="py-6 bg-black mb-10 pb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center pb-10">
            <h2 className="text-base text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
              Advanced Plagiarism Detection
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-300 mx-auto">
              Our platform doesn't just give a number; it provides detailed insights into code similarities.
            </p>
          </div>
          
          <div className="mt-14">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-12 md:gap-y-16">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-green-700 text-white shadow-lg">
                    <svg className="h-9 w-9" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-xl leading-6 font-medium text-white">Batch Comparison</h3>
                  <p className="mt-2 text-lg text-gray-300">
                    Upload multiple code files or entire folders for comparison, ideal for educators evaluating class submissions.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-green-700 text-white shadow-lg">
                    <svg className="h-9 w-9" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-xl leading-6 font-medium text-white">Abstract Syntax Tree Analysis</h3>
                  <p className="mt-2 text-lg text-gray-300">
                    Look beyond surface-level similarities with advanced AST-based structural code analysis.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-green-700 text-white shadow-lg">
                    <svg className="h-9 w-9" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-xl leading-6 font-medium text-white">Secure & Private</h3>
                  <p className="mt-2 text-lg text-gray-300">
                    All uploaded files are stored securely and automatically deleted after processing to ensure privacy.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-green-700 text-white shadow-lg">
                    <svg className="h-9 w-9" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-xl leading-6 font-medium text-white">AI-Driven Semantic Matching</h3>
                  <p className="mt-2 text-lg text-gray-300">
                    Detect plagiarism beyond syntax with advanced semantic analysis powered by AI.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-green-900 to-emerald-900 rounded-lg mx-4 lg:mx-16 shadow-xl">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Making a Difference in Academic Integrity
            </h2>
            <p className="mt-3 text-xl text-green-100 sm:mt-4">
              Our platform helps reduce code plagiarism by 30-40% in educational settings.
            </p>
          </div>
          <dl className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-3 sm:gap-8">
            <div className="flex flex-col">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-green-200">
                of students copy code
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">
                50-60%
              </dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-green-200">
                reduction with our tool
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">
                30-40%
              </dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-green-200">
                satisfied institutions
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">
                200+
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      <div className="bg-black py-12 mt-12">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to promote academic integrity?</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">Start using our platform today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0 space-x-4">
            <div className="inline-flex rounded-md shadow">
              <Link href="/signup" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 shadow-md hover:shadow-lg transition-all">
                Get started
              </Link>
            </div>
            <div className="inline-flex rounded-md shadow">
              <Link href="/contact" className="inline-flex items-center justify-center px-5 py-3 border border-green-400 text-base font-medium rounded-lg text-green-400 bg-transparent hover:bg-gray-800 transition-colors">
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="bg-gray-900 mt-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <nav className="flex flex-wrap justify-center -mx-5 -my-2">
            <div className="px-5 py-2">
              <Link href="/about" className="text-base text-gray-400 hover:text-green-400 transition-colors">
                About
              </Link>
            </div>
            <div className="px-5 py-2">
              <a href="#features" onClick={scrollToFeatures} className="text-base text-gray-400 hover:text-green-400 transition-colors">
                Features
              </a>
            </div>
            <div className="px-5 py-2">
              <Link href="/pricing" className="text-base text-gray-400 hover:text-green-400 transition-colors">
                Pricing
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link href="/faq" className="text-base text-gray-400 hover:text-green-400 transition-colors">
                FAQ
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link href="/contact" className="text-base text-gray-400 hover:text-green-400 transition-colors">
                Contact
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link href="/privacy" className="text-base text-gray-400 hover:text-green-400 transition-colors">
                Privacy
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link href="/terms" className="text-base text-gray-400 hover:text-green-400 transition-colors">
                Terms
              </Link>
            </div>
          </nav>
          <div className="mt-8 flex justify-center space-x-6">
            <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
              <span className="sr-only">Twitter</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
              <span className="sr-only">GitHub</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
              <span className="sr-only">LinkedIn</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </div>
          <p className="mt-8 text-center text-base text-gray-400">
            &copy; 2025 CodePlager. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}