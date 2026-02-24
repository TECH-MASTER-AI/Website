import { Code2, Swords, BookOpen, Trophy } from 'lucide-react';
import { lazy, Suspense, memo } from 'react';

const FloatingLines = lazy(() => import('./FloatingLines'));

const FeaturesSection = memo(() => {
  const features = [
    {
      id: '01',
      title: 'Live Coding',
      description: 'Collaborate in real time. Write, debug, and build together on the same codebase, as if your team shares one keyboard. Faster decisions, fewer silos, real momentum.',
      icon: <Code2 className="w-6 h-6 sm:w-8 sm:h-8" />,
    },
    {
      id: '02',
      title: '1v1 CodeArena',
      description: 'Step into the arena. Challenge your peers in head-to-head coding battles where logic meets speed and precision decides the winner.',
      icon: <Swords className="w-6 h-6 sm:w-8 sm:h-8" />,
    },
    {
      id: '03',
      title: 'Practice DSA',
      description: 'Train your problem-solving instincts with 5,000+ high-quality DSA questions. From fundamentals to interview-grade challenges, sharpen your thinking one problem at a time.',
      icon: <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" />,
    },
    {
      id: '04',
      title: 'Leaderboards & Rewards',
      description: 'Every line of code leaves a mark. Climb the leaderboard, earn your rank, and turn consistency into recognition. Progress isn\'t just tracked — it\'s celebrated.',
      icon: <Trophy className="w-6 h-6 sm:w-8 sm:h-8" />,
    },
  ];

  return (
    <section className="features-section relative py-16 sm:py-20 md:py-24 px-4 sm:px-6 overflow-hidden">
      {/* Floating Lines Background Animation - Opposite Direction, hidden on mobile */}
      <Suspense fallback={null}>
        <FloatingLines
          enabledWaves={['top', 'middle', 'bottom']}
          lineCount={5}
          lineDistance={5}
          reverseDirection={true}
        />
      </Suspense>

      {/* Background Grid - Same as Hero */}
      <div className="absolute inset-0 cyber-grid" style={{ zIndex: 1 }} />
      
      {/* Content Container */}
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 px-4">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold theme-text-primary mb-3 sm:mb-4">
            Built for Developers
          </h2>
          <p className="theme-text-secondary font-body text-base sm:text-lg md:text-xl max-w-2xl mx-auto">
            Everything you need to compete, collaborate, and grow as a developer
          </p>
        </div>

        {/* Feature Cards Grid - Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card theme-card rounded-xl sm:rounded-2xl p-6 sm:p-8 relative group cursor-pointer"
            >
              {/* Card Number Badge - Bottom Right, Background Watermark */}
              <div 
                className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 font-heading text-6xl sm:text-7xl md:text-8xl font-bold opacity-5 theme-text-primary select-none pointer-events-none"
                style={{ lineHeight: 1, zIndex: 0 }}
              >
                {feature.id}
              </div>

              {/* Icon Container */}
              <div 
                className="feature-icon-container w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-6 relative z-10"
                style={{
                  background: 'var(--theme-card-hover-bg)',
                  border: '1px solid var(--theme-border-primary)',
                  color: 'var(--theme-accent)',
                }}
              >
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="font-heading text-xl sm:text-2xl font-bold theme-text-primary mb-2 sm:mb-3 relative z-10">
                {feature.title}
              </h3>
              <p className="theme-text-secondary font-body text-sm sm:text-base leading-relaxed relative z-10">
                {feature.description}
              </p>

              {/* Hover Glow Effect */}
              <div 
                className="feature-card-glow absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at center, var(--theme-glow-tertiary) 0%, transparent 70%)',
                  zIndex: 0,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

FeaturesSection.displayName = 'FeaturesSection';

export default FeaturesSection;
