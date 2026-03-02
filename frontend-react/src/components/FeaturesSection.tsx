import { Code2, Swords, BookOpen, Flame } from 'lucide-react';
import { memo } from 'react';
import { useNavigate } from 'react-router-dom';

const FeaturesSection = memo(() => {
  const navigate = useNavigate();
  
  const features = [
    {
      id: '01',
      title: 'Code Royale',
      description: 'Enter the arena where logic clashes with speed. Every keystroke is a move, every solution a victory. Precision under pressure. Skill proven in battle.',
      icon: <Swords className="w-6 h-6 sm:w-8 sm:h-8" />,
      path: '/dsa/duels',
    },
    {
      id: '02',
      title: 'DSA',
      description: 'Where thought aligns with execution. Solve without friction, progress without resistance. Enter deep focus, master complexity, emerge sharper.',
      icon: <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" />,
      path: '/dsa/problems',
    },
    {
      id: '03',
      title: 'Type Forge',
      description: 'Forge muscle to memory into instinct. Sharpen reflexes until keystrokes flow like thought. Speed meets accuracy. Precision becomes second nature.',
      icon: <Flame className="w-6 h-6 sm:w-8 sm:h-8" />,
      path: '/typeforge',
    },
    {
      id: '04',
      title: 'Live Coding',
      description: 'Real-time collaboration, shared thinking space. Write code together as if sharing one keyboard. The future of building, together.',
      icon: <Code2 className="w-6 h-6 sm:w-8 sm:h-8" />,
      path: '/coming-soon',
    },
  ];

  return (
    <section className="features-section relative py-20 sm:py-24 md:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Grid - Same as Hero */}
      <div className="absolute inset-0 cyber-grid" style={{ zIndex: 1 }} />
      
      {/* Content Container */}
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Section Header - Improved Spacing */}
        <div className="text-center mb-16 sm:mb-20 lg:mb-24 px-4">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold theme-text-primary mb-4 sm:mb-5 lg:mb-6">
            Built for Developers
          </h2>
          <p className="theme-text-secondary font-body text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
            Everything you need to compete, collaborate, and grow as a developer
          </p>
        </div>

        {/* Feature Cards Grid - Refined Layout with Better Balance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 max-w-6xl mx-auto px-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card-wrapper group cursor-pointer"
              onClick={() => navigate(feature.path)}
            >
              {/* Main Card Container */}
              <div className="feature-card theme-card rounded-2xl p-6 sm:p-8 lg:p-10 relative cursor-pointer h-full flex flex-col">
                {/* Card Number Badge - Bottom Right, Background Watermark */}
                <div 
                  className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 font-heading text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] font-bold opacity-[0.03] theme-text-primary select-none pointer-events-none"
                  style={{ lineHeight: 1, zIndex: 0 }}
                >
                  {feature.id}
                </div>

                {/* Icon Container - Refined Size and Positioning */}
                <div 
                  className="feature-icon-container w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl flex items-center justify-center mb-5 sm:mb-6 lg:mb-7 relative z-10 flex-shrink-0"
                  style={{
                    background: 'var(--theme-card-hover-bg)',
                    border: '1px solid var(--theme-border-primary)',
                    color: 'var(--theme-accent)',
                  }}
                >
                  {feature.icon}
                </div>

                {/* Content - Improved Spacing and Alignment */}
                <div className="flex-grow flex flex-col relative z-10">
                  <h3 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold theme-text-primary mb-3 sm:mb-4 relative z-10 leading-tight tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="theme-text-secondary font-body text-sm sm:text-base lg:text-lg leading-relaxed relative z-10 flex-grow">
                    {feature.description}
                  </p>
                </div>

                {/* Hover Glow Effect */}
                <div 
                  className="feature-card-glow absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle at center, var(--theme-glow-tertiary) 0%, transparent 70%)',
                    zIndex: 0,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

FeaturesSection.displayName = 'FeaturesSection';

export default FeaturesSection;
