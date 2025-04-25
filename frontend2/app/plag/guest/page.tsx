'use client';

import { useRouter } from 'next/navigation';
import Head from 'next/head';

export default function GuestLanding() {
  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-all">
      <Head>
        <title>Guest Access | Code Analyzer</title>
        <meta name="description" content="Guest portal for analyzing code using AI detection" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="absolute top-0 left-0 w-full p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md text-center">
        <h1 className="text-2xl font-bold">Welcome to Code Analyzer</h1>
      </header>

      <main className="flex flex-col items-center justify-center px-6 py-20 space-y-10 text-center">
        <h2 className="text-3xl font-semibold">Guest Portal</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-xl">
          Choose how you want to analyze your code — single file or Double File 
        </p>

        <div className="flex flex-col sm:flex-row gap-6 mt-8">
          <button
            onClick={() => navigateTo('/plag/1code')}
            className="px-8 py-4 text-lg rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition shadow-md"
          >
            Analyze Single Code File
          </button>

          <button
            onClick={() => navigateTo('/plag/2code')}
            className="px-8 py-4 text-lg rounded-lg bg-green-600 hover:bg-green-700 text-white transition shadow-md"
          >
            Analyze Two Codes
          </button>
        </div>
      </main>

      <footer className="w-full text-center text-sm text-gray-600 dark:text-gray-400 py-6 border-t dark:border-gray-700">
        Code Analyzer · Guest Portal &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
