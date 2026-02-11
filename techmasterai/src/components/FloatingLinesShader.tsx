import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface FloatingLinesShaderProps {
  linesGradient?: string[];
}

const FloatingLinesShader = ({ linesGradient = ['#00C2FF', '#00F0FF', '#00C2FF'] }: FloatingLinesShaderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const linesRef = useRef<THREE.Line[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const scrollRef = useRef(0);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create gradient colors
    const colors = linesGradient.map(hex => new THREE.Color(hex));

    // Create floating lines
    const lineCount = 8;
    const lines: THREE.Line[] = [];

    for (let i = 0; i < lineCount; i++) {
      const points: THREE.Vector3[] = [];
      const segments = 100;
      
      for (let j = 0; j <= segments; j++) {
        const x = (j / segments) * 20 - 10;
        const y = (i - lineCount / 2) * 0.8;
        const z = 0;
        points.push(new THREE.Vector3(x, y, z));
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      
      // Interpolate color based on line index
      const t = i / (lineCount - 1);
      const colorIndex = Math.floor(t * (colors.length - 1));
      const colorT = (t * (colors.length - 1)) % 1;
      const color = new THREE.Color().lerpColors(
        colors[colorIndex],
        colors[Math.min(colorIndex + 1, colors.length - 1)],
        colorT
      );

      const material = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.3 - (Math.abs(i - lineCount / 2) / lineCount) * 0.15,
        linewidth: 2,
      });

      const line = new THREE.Line(geometry, material);
      line.userData = {
        originalY: y,
        speed: 0.0005 + (i * 0.0002),
        amplitude: 0.3 + (i * 0.05),
        frequency: 0.5 + (i * 0.1),
        phase: Math.random() * Math.PI * 2,
      };

      scene.add(line);
      lines.push(line);
    }

    linesRef.current = lines;

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };

    // Scroll handler
    const handleScroll = () => {
      scrollRef.current = window.scrollY;
    };

    // Resize handler
    const handleResize = () => {
      if (!camera || !renderer) return;
      
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = (time: number) => {
      lines.forEach((line) => {
        const geometry = line.geometry as THREE.BufferGeometry;
        const positions = geometry.attributes.position.array as Float32Array;
        const { originalY, speed, amplitude, frequency, phase } = line.userData;

        for (let i = 0; i < positions.length; i += 3) {
          const x = positions[i];
          const index = i / 3;
          
          // Wave motion
          const wave = Math.sin(x * frequency + time * speed + phase) * amplitude;
          
          // Parallax effect
          const parallax = (scrollRef.current * 0.0001) * (speed * 100);
          
          // Mouse interaction
          const dx = x / 10 - mouseRef.current.x;
          const dy = originalY - mouseRef.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = 2;
          const influence = distance < maxDistance 
            ? (1 - distance / maxDistance) * 0.3 
            : 0;

          positions[i + 1] = originalY + wave + parallax + influence;
        }

        geometry.attributes.position.needsUpdate = true;
      });

      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate(0);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      lines.forEach(line => {
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
        scene.remove(line);
      });

      if (renderer) {
        renderer.dispose();
        if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
          containerRef.current.removeChild(renderer.domElement);
        }
      }
    };
  }, [linesGradient]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default FloatingLinesShader;
