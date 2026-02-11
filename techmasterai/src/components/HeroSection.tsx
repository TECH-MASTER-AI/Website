import { lazy, Suspense, memo } from 'react';

// Lazy load heavy components
const SplitText = lazy(() => import('./SplitText'));
const ScrollVelocity = lazy(() => import('./ScrollVelocity'));
const TypingEffect = lazy(() => import('./TypingEffect'));

const HeroSection = () => {
  return (
    <section className="hero-section relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-16 sm:py-20 overflow-hidden">
      {/* Subtle Background Grid */}
      <div className="absolute inset-0 cyber-grid" style={{ zIndex: 1 }} />
      
      {/* Watermark Logo - Theme-aware, centered, large, transparent */}
      <div className="hero-watermark-logo" />
      
      {/* Main Hero Content - Grouped */}
      <div className="relative text-center max-w-6xl mx-auto w-full" style={{ zIndex: 10 }}>
        {/* Main Headline with SplitText Effect */}
        <Suspense fallback={
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 tracking-tight leading-tight" style={{ color: '#00C2FF' }}>
            TechMasterAI
          </h1>
        }>
          <SplitText
            text="TechMasterAI"
            className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 tracking-tight leading-tight"
            tag="h1"
            delay={50}
            duration={1.25}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
          />
        </Suspense>

        {/* Subheadline with Typing Effect */}
        <h2 className="hero-tagline font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold mb-6 sm:mb-8 tracking-tight px-4">
          <Suspense fallback={<span>Master Code. Win Competitions.</span>}>
            <TypingEffect 
              text="Master Code. Win Competitions."
              typingSpeed={30}
              startDelay={80}
              showCursor={true}
            />
          </Suspense>
        </h2>

        {/* Description - Simplified for mobile */}
        <div className="mb-8 sm:mb-10 max-w-5xl mx-auto px-4">
          <Suspense fallback={
            <p className="font-body text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed" style={{ color: '#9AA4B2' }}>
              The premier platform where developers showcase their skills, compete in real-world challenges, and unlock career opportunities.
            </p>
          }>
            <ScrollVelocity
              texts={[
                "The premier platform where developers showcase their skills, compete in real-world challenges, and unlock career opportunities."
              ]}
              baseVelocity={0.5}
              numCopies={3}
              className="font-body text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed"
              style={{ color: '#9AA4B2' }}
            />
          </Suspense>
        </div>

        {/* Trust micro-copy */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm px-4 mb-4" style={{ color: '#6B7280' }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00C2FF' }} />
            <span className="text-center">Join 500+ developers on the platform</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(HeroSection);
