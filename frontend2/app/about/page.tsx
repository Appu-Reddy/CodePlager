import React from 'react';

const About = () => {
  const creators = [
    { name: 'Apuroop', role: 'Full Stack Developer' },
    { name: 'Vivek', role: 'Full Stack Developer' },
    { name: 'Sushanth', role: 'Machine Learning Engineer' },
    { name: 'Rishith', role: 'Machine Learning Engineer' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 py-16 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto space-y-20">

        {/* Header Section */}
        <section className="text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800">
            About Our Project
          </h1>
          <div className="w-20 h-1 bg-blue-500 mx-auto"></div>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Our advanced plagiarism detection platform helps educators, students, and content creators 
            maintain academic integrity through cutting-edge text analysis technology.
          </p>
        </section>

        {/* Team Section */}
        <section>
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {creators.map((creator, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-8 flex flex-col items-center"
              >
                <div className="w-20 h-20 mb-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold">
                  {creator.name.charAt(0)}
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{creator.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{creator.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Mission & Features Section */}
        <section className="bg-white rounded-2xl shadow p-10 border border-gray-200">
          <div className="space-y-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                We're committed to developing reliable plagiarism detection tools that empower 
                users to ensure content originality. Our system employs sophisticated NLP 
                algorithms to analyze text against multiple sources, providing comprehensive 
                similarity reports with academic-level accuracy.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Key Features</h2>
              <ul className="space-y-4">
                {[
                  "Multi-source database comparison with academic papers and web content",
                  "Real-time scanning with detailed similarity analysis",
                  "Interactive reports with highlighted matches",
                  "Intuitive dashboard with user-friendly controls"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <div className="bg-green-100 p-1.5 rounded-full mr-3 mt-0.5">
                      <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default About;
