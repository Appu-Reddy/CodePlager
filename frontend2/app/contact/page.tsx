'use client'

import { useState } from 'react';
import Head from 'next/head';

const ContactPage = () => {
  const [email, setEmail] = useState('');
  const [issue, setIssue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setError('');

    // Simple validation
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    if (issue.length < 10) {
      setError('Please describe your issue in at least 10 characters');
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setMessage('Your issue has been submitted successfully!');
      setEmail('');
      setIssue('');
    } catch (err) {
      setError('An error occurred while submitting your form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Contact Us | Your Company</title>
        <meta name="description" content="Contact us for any questions or issues" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl mb-4">
              Contact Us
            </h1>
            <p className="text-xl text-gray-300">
              Have questions? We're here to help.
            </p>
          </div>

          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl shadow-xl p-8 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-lg font-medium text-gray-200 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-3 text-gray-900 bg-gray-100 border border-transparent rounded-lg focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="issue" className="block text-lg font-medium text-gray-200 mb-2">
                  Your Message
                </label>
                <textarea
                  id="issue"
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  className="w-full px-5 py-3 text-gray-900 bg-gray-100 border border-transparent rounded-lg focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition"
                  rows={5}
                  placeholder="Describe your issue or question..."
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full px-6 py-3 rounded-lg font-semibold text-white transition ${isSubmitting 
                    ? 'bg-blue-700 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30'}`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : 'Send Message'}
                </button>
              </div>

              {error && (
                <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                  <p>{error}</p>
                </div>
              )}

              {message && (
                <div className="p-4 bg-green-100 border-l-4 border-green-500 text-green-700">
                  <p>{message}</p>
                </div>
              )}
            </form>
          </div>

          <div className="mt-12 text-center text-gray-400">
            <p>Alternatively, you can email us directly at:</p>
            <a href="mailto:support@yourcompany.com" className="text-blue-400 hover:text-blue-300">
              support@yourcompany.com
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;