import { Mail, Linkedin, Twitter, ChevronDown } from 'lucide-react';
import { useState, lazy, Suspense, memo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const GlareHover = lazy(() => import('./GlareHover'));
const TeamAvatar = lazy(() => import('./TeamAvatar'));

const Footer = memo(() => {
  const [isLeadershipExpanded, setIsLeadershipExpanded] = useState(true);
  const { theme } = useTheme();

  const teamMembers = [
    { 
      name: 'Adarsh Kumar', 
      role: 'Founder/CFO', 
      initial: 'AK',
      photo: '/adarsh.jpeg',
      linkedin: 'https://www.linkedin.com/in/adarsh-kumar-300061331/',
      email: 'adarshcollab09@gmail.com',
      isFounder: true
    },
    { 
      name: 'Akshat Singh', 
      role: 'Co-Founder/CEO', 
      initial: 'AS',
      photo: '/akshat.png',
      linkedin: 'https://www.linkedin.com/in/akshat-singh-1103a0370/',
      email: 'akshatthakur823@gmail.com',
      isFounder: false
    },
    { 
      name: 'Kartavya Rana', 
      role: 'Managing Director', 
      initial: 'KR',
      photo: '/kartavya.jpeg',
      linkedin: 'https://www.linkedin.com/in/kartavya-rana-970945280/',
      email: 'kartavyarana2004@gmail.com',
      isFounder: false
    },
    { 
      name: 'Divyam', 
      role: 'Chief Marketing Officer', 
      initial: 'D',
      photo: '/divyam.png',
      linkedin: 'https://www.linkedin.com/in/divyam-1a683430a/',
      email: 'divyam11nov@gmail.com',
      isFounder: false
    },
    { 
      name: 'Amey Rathore', 
      role: 'Chief Operating Officer', 
      initial: 'AR',
      photo: '/amey.png',
      linkedin: 'https://www.linkedin.com/in/amey-rathore-92146535a/',
      email: 'ameycollab069@gmail.com',
      isFounder: false
    },
    { 
      name: 'Jyoti Rana', 
      role: 'Human Resources Manager', 
      initial: 'JR',
      photo: '/jyoti.jpeg',
      linkedin: 'https://www.linkedin.com/in/jyoti-rana-081050319/',
      email: 'jyoti@techmaster.ai',
      isFounder: false
    },
  ];

  const footerLinks = {
    Product: ['Features', 'Pricing', 'Roadmap', 'Changelog'],
    Community: ['Discord', 'Twitter', 'GitHub', 'Blog'],
    Company: ['About', 'Careers', 'Contact', 'Press Kit'],
    Legal: ['Privacy', 'Terms', 'Security', 'Cookies'],
  };

  return (
    <>
      {/* Leadership Section - Collapsible */}
      <section id="leadership" className="footer-section relative">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8">
          {/* Collapsible Header */}
          <button
            onClick={() => setIsLeadershipExpanded(!isLeadershipExpanded)}
            className="w-full flex items-center justify-center gap-2 sm:gap-3 mb-0 transition-all duration-300 hover:opacity-80 touch-manipulation"
            style={{ cursor: 'pointer' }}
          >
            <h3 className="footer-heading font-heading text-2xl sm:text-3xl md:text-4xl font-bold">
              Leadership Team
            </h3>
            <ChevronDown 
              className="chevron-icon w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
              style={{ 
                transform: isLeadershipExpanded ? 'rotate(0deg)' : 'rotate(-90deg)'
              }}
            />
          </button>

          {/* Collapsible Content */}
          <div
            className="transition-all duration-300"
            style={{
              height: isLeadershipExpanded ? 'auto' : '0px',
              opacity: isLeadershipExpanded ? 1 : 0,
              overflow: isLeadershipExpanded ? 'visible' : 'hidden',
              pointerEvents: isLeadershipExpanded ? 'auto' : 'none',
            }}
          >
            {/* Container with consistent padding */}
            <div className="pt-8 sm:pt-10 md:pt-12 px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8">
              <p className="footer-text font-body text-sm sm:text-base mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto text-center">
                Meet the innovators building the future of competitive coding
              </p>
              
              {/* Leadership Grid - Responsive: 1 col mobile, 2 cols tablet, 3 cols desktop for 6 members */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-[1400px] mx-auto">
                {/* Reorder team members: 2 before founder, founder in center of first row, then 3 in second row */}
                {(() => {
                  const founder = teamMembers.find(m => m.isFounder);
                  const others = teamMembers.filter(m => !m.isFounder);
                  const orderedMembers = [
                    others[0], // Akshat
                    founder,   // Adarsh (CENTER of first row)
                    others[1], // Kartavya
                    others[2], // Divyam
                    others[3], // Amey
                    others[4], // Jyoti
                  ];

                  return orderedMembers.map((member, index) => {
                    const isFounder = member?.isFounder;
                    const isCenterFirstRow = index === 1; // Founder in center of first row

                    return (
                      <Suspense key={member?.name} fallback={
                        <div className="team-card rounded-xl sm:rounded-2xl p-6 sm:p-8 flex flex-col h-full min-h-[280px]" />
                      }>
                        <GlareHover
                          width="100%"
                          height="100%"
                          background="transparent"
                          borderRadius="1rem"
                          borderColor={isFounder ? "rgba(0, 194, 255, 0.4)" : "#1F2937"}
                          glareColor="#00C2FF"
                          glareOpacity={isFounder ? 0.35 : 0.25}
                          glareAngle={-45}
                          glareSize={180}
                          transitionDuration={800}
                          className={`team-card group relative rounded-xl sm:rounded-2xl p-6 sm:p-8 flex flex-col h-full ${isFounder ? 'founder-card' : ''}`}
                        >
                          <div className="flex flex-col items-center flex-1">
                            {/* Avatar - centered with consistent spacing */}
                            <div className="mb-4 sm:mb-6 flex items-center justify-center">
                              <Suspense fallback={<div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-700" />}>
                                <TeamAvatar
                                  photo={member?.photo || ''}
                                  initial={member?.initial || ''}
                                  name={member?.name || ''}
                                  size="small"
                                />
                              </Suspense>
                            </div>
                            
                            {/* Name - centered with 8pt spacing */}
                            <h4 className="team-card-name font-heading text-lg sm:text-xl font-bold tracking-tight text-center mb-2 sm:mb-3 leading-tight">
                              {member?.name}
                            </h4>
                            
                            {/* Role - centered with controlled height */}
                            <p className="team-card-role text-xs sm:text-sm font-medium text-center mb-6 sm:mb-8 leading-relaxed min-h-[2.5rem] sm:min-h-[3rem] flex items-center justify-center px-2">
                              {member?.role}
                            </p>
                            
                            {/* Social Icons - bottom aligned with consistent spacing */}
                            <div className="flex items-center justify-center gap-3 sm:gap-4 mt-auto">
                              <a
                                href={member?.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="team-card-icon-button w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 touch-manipulation"
                                aria-label={`${member?.name} LinkedIn`}
                              >
                                <Linkedin className="w-4 h-4" />
                              </a>
                              <a
                                href={`mailto:${member?.email}`}
                                className="team-card-icon-button w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 touch-manipulation"
                                aria-label={`Email ${member?.name}`}
                              >
                                <Mail className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        </GlareHover>
                      </Suspense>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section - Compressed */}
      <footer className="footer-container relative">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 md:py-12">

        {/* Footer Links - Compressed Spacing, Responsive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-10 max-w-5xl mx-auto">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="footer-heading font-heading font-semibold mb-2 sm:mb-3 text-xs sm:text-sm">{category}</h4>
              <ul className="space-y-1.5 sm:space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="footer-link font-body text-xs sm:text-sm transition-colors hover:text-primary leading-tight"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="footer-divider w-full h-px mb-4 sm:mb-6" />

        {/* Bottom Section - Compressed, Responsive Stack */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2">
              <img 
                src={theme === 'dark' ? '/tmai-logo.png' : '/tmai-logo-dark.png'}
                alt="TechMasterAI" 
                className="footer-brand-logo w-7 h-7 sm:w-8 sm:h-8 rounded"
                style={{
                  objectFit: 'contain',
                  filter: theme === 'dark' ? 'brightness(1.1)' : 'brightness(1)',
                }}
                onError={(e) => {
                  // Fallback to default logo if theme-specific logo fails to load
                  e.currentTarget.src = '/tmai-logo.png';
                }}
              />
              <span className="footer-brand-text font-heading font-bold text-xs sm:text-sm">
                TECHMASTER<span className="footer-brand-accent">AI</span>
              </span>
            </div>
            <p className="footer-text font-body text-[10px] sm:text-xs leading-tight text-center md:text-left">
              Empowering developers to compete and grow
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="#"
              className="footer-icon-button w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center hover:scale-110 touch-manipulation"
              aria-label="Twitter"
            >
              <Twitter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </a>
            <a
              href="#"
              className="footer-icon-button w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center hover:scale-110 touch-manipulation"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </a>
            <a
              href="mailto:techmaster.hub@gmail.com"
              className="footer-icon-button w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center hover:scale-110 touch-manipulation"
              aria-label="Email"
            >
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </a>
          </div>

          <p className="footer-text font-body text-[10px] sm:text-xs text-center md:text-right">
            © 2026 TechMasterAI. All rights reserved.
          </p>
        </div>
        </div>
      </footer>
    </>
  );
});

Footer.displayName = 'Footer';

export default Footer;
