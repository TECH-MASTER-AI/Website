import { useEffect, useRef, memo } from 'react';

interface FloatingLinesProps {
  enabledWaves?: ('top' | 'middle' | 'bottom')[];
  lineCount?: number;
  lineDistance?: number;
  bendRadius?: number;
  bendStrength?: number;
  interactive?: boolean;
  parallax?: boolean;
  reverseDirection?: boolean;
}

const FloatingLines = memo(({
  enabledWaves = ['top', 'middle', 'bottom'],
  reverseDirection = false,
}: FloatingLinesProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const resizeTimeoutRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = canvas.getContext('2d', { 
      alpha: true,
      desynchronized: true,
      willReadFrequently: false
    });
    if (!ctx) return;

    let waveSets: WaveSet[] = [];
    let currentWidth = 0;
    let currentHeight = 0;

    // NORMALIZED COORDINATE SYSTEM - Resolution Independent
    const setCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Set canvas buffer size (actual pixels)
      canvas.width = viewportWidth * dpr;
      canvas.height = viewportHeight * dpr;
      
      // Set canvas display size (CSS pixels)
      canvas.style.width = `${viewportWidth}px`;
      canvas.style.height = `${viewportHeight}px`;
      
      // Scale context to match DPR
      ctx.scale(dpr, dpr);
      
      // Store current dimensions for normalized calculations
      currentWidth = viewportWidth;
      currentHeight = viewportHeight;
      
      // Recreate wave sets with new dimensions
      initializeWaveSets();
    };

    // Wave Set class - THREE DISTINCT MATHEMATICAL WAVES
    class WaveSet {
      type: 'sine' | 'cosine' | 'phase-shifted';
      yNormalized: number; // Normalized Y position (0-1)
      amplitudeNormalized: number; // Normalized amplitude
      wavelengthNormalized: number; // Normalized wavelength
      speed: number; // Animation speed
      phaseShift: number; // Phase shift in radians
      color: string;
      lineWidth: number;

      constructor(type: 'sine' | 'cosine' | 'phase-shifted', position: 'top' | 'middle' | 'bottom') {
        this.type = type;
        
        // Vertical position based on section
        const baseYNormalized = position === 'top' ? 0.25 : position === 'middle' ? 0.5 : 0.75;
        
        // WAVE SET 1: SINE WAVE - Base wave (reduced intensity)
        if (type === 'sine') {
          this.yNormalized = baseYNormalized;
          this.amplitudeNormalized = 0.08; // 8% of viewport height
          this.wavelengthNormalized = 2.0; // 2 full wavelengths across viewport
          this.speed = reverseDirection ? -0.0008 : 0.0008;
          this.phaseShift = 0; // No phase shift
          this.color = 'rgba(0, 194, 255, 0.25)'; // Reduced from 0.6 to 0.25 (58% reduction)
          this.lineWidth = 2;
        }
        // WAVE SET 2: COSINE WAVE - Phase-shifted by π/2 (reduced intensity)
        else if (type === 'cosine') {
          this.yNormalized = baseYNormalized - 0.05; // Slightly offset vertically
          this.amplitudeNormalized = 0.08; // Same amplitude as sine
          this.wavelengthNormalized = 2.0; // Same wavelength as sine
          this.speed = reverseDirection ? -0.001 : 0.001; // Slightly faster
          this.phaseShift = Math.PI / 2; // π/2 phase shift (cosine)
          this.color = 'rgba(0, 230, 255, 0.20)'; // Reduced from 0.5 to 0.20 (60% reduction)
          this.lineWidth = 1.8;
        }
        // WAVE SET 3: PHASE-SHIFTED SINE - Custom phase with parallax (reduced intensity)
        else {
          this.yNormalized = baseYNormalized + 0.05; // Offset in opposite direction
          this.amplitudeNormalized = 0.10; // Slightly higher amplitude for depth
          this.wavelengthNormalized = 2.5; // Longer wavelength
          this.speed = reverseDirection ? -0.0006 : 0.0006; // Slower for parallax
          this.phaseShift = Math.PI * 0.75; // 3π/4 phase shift
          this.color = 'rgba(0, 180, 255, 0.15)'; // Reduced from 0.4 to 0.15 (62% reduction)
          this.lineWidth = 1.5;
        }
      }

      draw(time: number, width: number, height: number) {
        if (!ctx) return;

        // Get theme-aware adjustments
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        
        // Adjust color opacity for theme (further reduced for subtlety)
        const opacity = isDarkMode ? 0.7 : 0.5; // Reduced from 1.0/0.8 to 0.7/0.5
        const adjustedColor = this.color.replace(/[\d.]+\)$/, `${parseFloat(this.color.match(/[\d.]+\)$/)?.[0] || '0.5') * opacity})`);

        // Calculate actual pixel values from normalized coordinates
        const actualY = this.yNormalized * height;
        const actualAmplitude = this.amplitudeNormalized * height;
        const actualWavelength = this.wavelengthNormalized * width;

        const segments = 300; // High resolution for ultra-smooth curves
        const points: { x: number; y: number }[] = [];

        // Generate wave points using PURE TRIGONOMETRIC FUNCTIONS
        for (let i = 0; i <= segments; i++) {
          const normalizedX = i / segments; // 0 to 1
          const x = normalizedX * width;
          
          // Calculate angle in radians
          // θ = (2π / wavelength) * x + time * speed + phaseShift
          const theta = (2 * Math.PI / actualWavelength) * x + time * this.speed + this.phaseShift;
          
          // PURE SINE WAVE CALCULATION
          // y = y₀ + A * sin(θ)
          const y = actualY + actualAmplitude * Math.sin(theta);
          
          points.push({ x, y });
        }

        // LAYERED HAZE RENDERING - Subtle atmospheric glow (reduced intensity)
        // Layer 3: Outer haze (widest, most diffuse) - softer and less visible
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = adjustedColor.replace(/[\d.]+\)$/, `${parseFloat(adjustedColor.match(/[\d.]+\)$/)?.[0] || '0.5') * 0.08})`); // Reduced from 0.12
        ctx.lineWidth = this.lineWidth * 6; // Reduced from 8
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = adjustedColor;
        ctx.shadowBlur = 24; // Reduced from 32 for softer blur
        this.drawCurve(points);
        ctx.stroke();
        ctx.restore();

        // Layer 2: Mid haze (medium diffusion) - more subtle
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = adjustedColor.replace(/[\d.]+\)$/, `${parseFloat(adjustedColor.match(/[\d.]+\)$/)?.[0] || '0.5') * 0.18})`); // Reduced from 0.25
        ctx.lineWidth = this.lineWidth * 3; // Reduced from 4
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = adjustedColor;
        ctx.shadowBlur = 12; // Reduced from 16
        this.drawCurve(points);
        ctx.stroke();
        ctx.restore();

        // Layer 1: Core wave (soft center, not crisp) - reduced brightness
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = adjustedColor.replace(/[\d.]+\)$/, `${parseFloat(adjustedColor.match(/[\d.]+\)$/)?.[0] || '0.5') * 0.85})`); // 15% reduction
        ctx.lineWidth = this.lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = adjustedColor;
        ctx.shadowBlur = 4; // Reduced from 6 for softer appearance
        this.drawCurve(points);
        ctx.stroke();
        ctx.restore();
      }

      // Helper method to draw smooth bezier curve
      drawCurve(points: { x: number; y: number }[]) {
        if (points.length === 0) return;
        
        ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length - 2; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2;
          const yc = (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        
        // Draw last segment
        if (points.length >= 2) {
          const lastIdx = points.length - 1;
          ctx.quadraticCurveTo(
            points[lastIdx - 1].x, 
            points[lastIdx - 1].y, 
            points[lastIdx].x, 
            points[lastIdx].y
          );
        }
      }
    }

    // Initialize three wave sets for each enabled position
    const initializeWaveSets = () => {
      waveSets = [];
      
      enabledWaves.forEach((position) => {
        // Create three mathematically distinct waves per position
        waveSets.push(new WaveSet('sine', position));
        waveSets.push(new WaveSet('cosine', position));
        waveSets.push(new WaveSet('phase-shifted', position));
      });
    };

    // Initial setup
    setCanvasSize();

    // Animation loop - PURE MATHEMATICAL MOTION
    let startTime = Date.now();
    
    const animate = () => {
      const time = Date.now() - startTime;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw all wave sets
      waveSets.forEach((waveSet) => {
        waveSet.draw(time, currentWidth, currentHeight);
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Throttled resize handler (50ms for responsive feel)
    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      resizeTimeoutRef.current = window.setTimeout(() => {
        setCanvasSize();
      }, 50) as unknown as number;
    };

    // Listen for resize and orientation changes
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [enabledWaves, reverseDirection]);

  return (
    <canvas
      ref={canvasRef}
      className="floating-lines-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
});

FloatingLines.displayName = 'FloatingLines';

export default FloatingLines;
