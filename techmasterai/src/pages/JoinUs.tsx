/**
 * Internship Opportunities Page - Native TechMasterAI Integration
 * Seamlessly integrated with existing theme system and design tokens
 */

import { MapPin } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Internship data - exact order as specified
const internships = [
  {
    title: "Full Stack Development",
    description: "Build complete web applications using modern frontend and backend technologies.",
  },
  {
    title: "Python Development", 
    description: "Work on real-world Python projects involving automation, logic, and backend systems.",
  },
  {
    title: "Website Development",
    description: "Design and develop responsive, high-performance websites from scratch.",
  },
  {
    title: "UI/UX Development",
    description: "Craft intuitive interfaces and seamless user experiences with modern design tools.",
  },
  {
    title: "PR and Outreach",
    description: "Drive brand visibility through partnerships, outreach campaigns, and communication strategies.",
  },
  {
    title: "Game Developer (iOS & Android)",
    description: "Create engaging mobile games with interactive mechanics and smooth performance.",
  },
];

const GOOGLE_FORM_URL = "https://forms.gle/Jxp7K4L4MsDGqNTe6";

const JoinUs = () => {
  const handleCardClick = () => {
    window.open(GOOGLE_FORM_URL, '_blank');
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--theme-bg-primary)' }}>
      <Header />
      
      {/* Main Content */}
      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Location Line */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <MapPin className="w-4 h-4" style={{ color: 'var(--theme-accent)' }} />
              <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                Bhopal, Madhya Pradesh
              </span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Internship Opportunities
            </h1>
            
            {/* Subheading */}
            <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ color: 'var(--theme-text-secondary)' }}>
              Join us in building future-ready tech talent
            </p>
          </div>
        </section>
        {/* Internship Cards Section */}
        <section className="mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 internship-grid">
              {internships.map((internship, index) => (
                <div
                  key={index}
                  onClick={handleCardClick}
                  className="group cursor-pointer internship-card glare-effect rounded-xl p-6 transition-all duration-300"
                  style={{
                    background: 'var(--theme-card-bg)',
                    border: '1px solid var(--theme-border-primary)',
                    boxShadow: '0 4px 6px var(--theme-shadow-secondary)',
                  }}
                >
                  {/* Card Content */}
                  <div className="space-y-4">
                    <h3 
                      className="text-xl font-semibold transition-colors internship-title"
                      style={{ color: 'var(--theme-text-primary)' }}
                    >
                      {internship.title}
                    </h3>
                    
                    <p 
                      className="leading-relaxed internship-description"
                      style={{ color: 'var(--theme-text-secondary)' }}
                    >
                      {internship.description}
                    </p>
                    
                    {/* Apply Now Button */}
                    <button 
                      className="w-full font-medium py-3 px-6 rounded-lg transition-all duration-200 internship-button join-us-button"
                      style={{
                        background: 'var(--theme-accent)',
                        color: 'var(--theme-bg-primary)',
                        border: 'none',
                      }}
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default JoinUs;