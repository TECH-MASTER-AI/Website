import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollVelocityProps {
  texts: string[];
  baseVelocity?: number;
  className?: string;
  numCopies?: number;
  style?: React.CSSProperties;
}

const ScrollVelocity = ({ 
  texts, 
  baseVelocity = 1, 
  className = '',
  numCopies = 4,
  style = {}
}: ScrollVelocityProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    const content = contentRef.current;
    const container = containerRef.current;

    // Get the width of one copy
    const firstSpan = content.querySelector('span');
    if (!firstSpan) return;
    
    const spanWidth = firstSpan.offsetWidth + 32; // 32px for margin-right (mr-8)
    
    // Set initial position
    gsap.set(content, { x: 0 });

    // Create the infinite loop animation
    const tl = gsap.timeline({
      repeat: -1,
      defaults: { ease: 'none' }
    });

    tl.to(content, {
      x: -spanWidth,
      duration: spanWidth / (baseVelocity * 50), // Adjust speed based on baseVelocity
      ease: 'none',
      modifiers: {
        x: gsap.utils.unitize(x => parseFloat(x) % spanWidth)
      }
    });

    // Add scroll velocity effect
    let scrollVelocity = 0;
    let lastScrollY = window.scrollY;

    const updateVelocity = () => {
      const currentScrollY = window.scrollY;
      scrollVelocity = (currentScrollY - lastScrollY) * 0.05;
      lastScrollY = currentScrollY;

      // Apply velocity to timeline
      const timeScale = 1 + Math.abs(scrollVelocity) * 0.5;
      gsap.to(tl, {
        timeScale: timeScale,
        duration: 0.3,
        ease: 'power2.out'
      });

      // Dampen velocity
      scrollVelocity *= 0.9;
    };

    // Update on scroll
    const scrollHandler = () => {
      requestAnimationFrame(updateVelocity);
    };

    window.addEventListener('scroll', scrollHandler, { passive: true });

    return () => {
      window.removeEventListener('scroll', scrollHandler);
      tl.kill();
    };
  }, [baseVelocity, numCopies]);

  return (
    <div 
      ref={containerRef}
      className={`overflow-hidden whitespace-nowrap flex ${className}`} 
      style={style}
    >
      <div ref={contentRef} className="flex whitespace-nowrap">
        {Array.from({ length: numCopies }).map((_, i) => (
          <span key={i} className="block mr-8">
            {texts[0]}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ScrollVelocity;

