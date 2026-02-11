import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type GameMode = "classic" | "accuracy" | "speed";
type GameState = "menu" | "playing" | "paused" | "gameover";

interface Asteroid {
  id: number;
  word: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  progress: number;
  shaking: boolean;
  crackLevel: number;
  isActive: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

interface Shot {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  progress: number;
  color: string;
}

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
}

const EASY_WORDS = [
  "code", "type", "fast", "key", "run", "test", "bug", "fix", "app", "web",
  "dev", "api", "css", "html", "json", "loop", "func", "var", "let", "const"
];

const MEDIUM_WORDS = [
  "function", "variable", "constant", "boolean", "string", "number", "object",
  "array", "method", "class", "import", "export", "return", "async", "await",
  "promise", "callback", "closure", "scope", "module"
];

const HARD_WORDS = [
  "algorithm", "recursion", "iteration", "polymorphism", "encapsulation",
  "inheritance", "abstraction", "interface", "implementation", "optimization",
  "refactoring", "debugging", "deployment", "architecture", "framework"
];

interface AstroTypeProps {
  difficulty?: "newbie" | "mid" | "pro";
}

export function AstroType({ difficulty: propDifficulty }: AstroTypeProps = {}) {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>("menu");
  const [gameMode, setGameMode] = useState<GameMode>("classic");
  const [score, setScore] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [wordsDestroyed, setWordsDestroyed] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [health, setHealth] = useState(100);
  const [currentInput, setCurrentInput] = useState("");

  const asteroidsRef = useRef<Asteroid[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const shotsRef = useRef<Shot[]>([]);
  const starsRef = useRef<Star[]>([]);
  const animationFrameRef = useRef<number>();
  const gameStartTimeRef = useRef<number>(0);
  const lastSpawnTimeRef = useRef<number>(0);
  const difficultyRef = useRef<number>(1);
  const totalKeysRef = useRef<number>(0);
  const correctKeysRef = useRef<number>(0);
  const nextAsteroidIdRef = useRef<number>(0);
  const nextShotIdRef = useRef<number>(0);
  const playerFlashRef = useRef<boolean>(false);
  const playBoxRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    if (starsRef.current.length === 0) {
      for (let i = 0; i < 100; i++) {
        starsRef.current.push({
          x: Math.random() * 2000,
          y: Math.random() * 1000,
          size: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.5 + 0.2,
        });
      }
    }
  }, []);

  const getRandomWord = useCallback(() => {
    const difficulty = difficultyRef.current;
    let wordList = EASY_WORDS;
    if (propDifficulty === "pro" || difficulty > 10) {
      wordList = [...EASY_WORDS, ...MEDIUM_WORDS, ...HARD_WORDS];
    } else if (propDifficulty === "mid" || difficulty > 5) {
      wordList = [...EASY_WORDS, ...MEDIUM_WORDS];
    }
    return wordList[Math.floor(Math.random() * wordList.length)];
  }, [propDifficulty]);

  const createParticles = useCallback((x: number, y: number, count: number, color: string) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = Math.random() * 3 + 2;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 1,
        color,
      });
    }
  }, []);

  const createShot = useCallback((targetX: number, targetY: number) => {
    const playBox = playBoxRef.current;
    const playerX = playBox.x + playBox.width / 2;
    const playerY = playBox.y + playBox.height - 40;
    shotsRef.current.push({
      id: nextShotIdRef.current++,
      x: playerX,
      y: playerY,
      targetX,
      targetY,
      progress: 0,
      color: "#00C2FF",
    });
  }, []);

  const spawnAsteroid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const playBox = playBoxRef.current;
    const word = getRandomWord();
    const size = 40 + word.length * 5;
    const x = playBox.x + size + Math.random() * (playBox.width - size * 2);
    const baseSpeed = 0.3 + difficultyRef.current * 0.05;
    const speedMultiplier = gameMode === "speed" ? 1.5 : 1;

    const newAsteroid: Asteroid = {
      id: nextAsteroidIdRef.current++,
      word,
      x,
      y: playBox.y + size,
      vx: (Math.random() - 0.5) * 0.5,
      vy: baseSpeed * speedMultiplier,
      size,
      progress: 0,
      shaking: false,
      crackLevel: 0,
      isActive: false,
    };

    asteroidsRef.current.push(newAsteroid);

    if (!asteroidsRef.current.some(a => a.isActive)) {
      newAsteroid.isActive = true;
    }
  }, [gameMode, getRandomWord]);

  const destroyAsteroid = useCallback((asteroid: Asteroid) => {
    createParticles(asteroid.x, asteroid.y, 12, "#00C2FF");
    setScore((s) => s + asteroid.word.length * 10);
    setWordsDestroyed((w) => w + 1);
    asteroidsRef.current = asteroidsRef.current.filter((a) => a.id !== asteroid.id);

    if (asteroidsRef.current.length > 0) {
      const playBox = playBoxRef.current;
      const playerY = playBox.y + playBox.height - 40;
      let closest = asteroidsRef.current[0];
      let minDist = Math.abs(closest.y - playerY);

      for (const a of asteroidsRef.current) {
        const dist = Math.abs(a.y - playerY);
        if (dist < minDist) {
          minDist = dist;
          closest = a;
        }
      }
      closest.isActive = true;
    }
  }, [createParticles]);

  const handleKeyPress = useCallback((key: string) => {
    if (gameState !== "playing") return;

    totalKeysRef.current++;
    const newInput = currentInput + key;
    setCurrentInput(newInput);

    const activeAsteroid = asteroidsRef.current.find(a => a.isActive);

    if (activeAsteroid && activeAsteroid.word.startsWith(newInput)) {
      correctKeysRef.current++;
      activeAsteroid.progress = newInput.length;
      activeAsteroid.crackLevel = newInput.length;
      createShot(activeAsteroid.x, activeAsteroid.y);

      if (newInput === activeAsteroid.word) {
        destroyAsteroid(activeAsteroid);
        setCurrentInput("");
      }
    } else {
      playerFlashRef.current = true;
      setTimeout(() => (playerFlashRef.current = false), 200);

      if (activeAsteroid) {
        activeAsteroid.shaking = true;
        setTimeout(() => (activeAsteroid.shaking = false), 200);
      }

      if (gameMode === "accuracy") {
        setHealth((h) => Math.max(0, h - 10));
      }
      setCurrentInput("");
    }

    const acc = totalKeysRef.current > 0 
      ? Math.round((correctKeysRef.current / totalKeysRef.current) * 100) 
      : 100;
    setAccuracy(acc);
  }, [gameState, currentInput, gameMode, destroyAsteroid, createShot]);

  const startGame = useCallback(() => {
    setGameState("playing");
    setScore(0);
    setWpm(0);
    setAccuracy(100);
    setWordsDestroyed(0);
    setTimeElapsed(0);
    setHealth(100);
    setCurrentInput("");
    asteroidsRef.current = [];
    particlesRef.current = [];
    shotsRef.current = [];
    gameStartTimeRef.current = Date.now();
    lastSpawnTimeRef.current = Date.now();
    difficultyRef.current = propDifficulty === "pro" ? 8 : propDifficulty === "mid" ? 4 : 1;
    totalKeysRef.current = 0;
    correctKeysRef.current = 0;
    nextAsteroidIdRef.current = 0;
    nextShotIdRef.current = 0;
    playerFlashRef.current = false;
  }, []);

  const endGame = useCallback(() => {
    setGameState("gameover");
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === "menu" && e.key === "Enter") {
        startGame();
        return;
      }

      if (gameState === "playing") {
        if (e.key === "Escape") {
          setGameState("paused");
          return;
        }
        if (e.key.length === 1 && /[a-z]/i.test(e.key)) {
          handleKeyPress(e.key.toLowerCase());
        }
      }

      if (gameState === "paused" && e.key === "Escape") {
        setGameState("playing");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, handleKeyPress, startGame]);

  useEffect(() => {
    if (gameState !== "playing") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      const padding = 40;
      const maxWidth = Math.min(rect.width - padding * 2, (rect.height - padding * 2) * 0.5625);
      const boxWidth = maxWidth;
      const boxHeight = rect.height - padding * 2;
      const boxX = (rect.width - boxWidth) / 2;
      const boxY = padding;

      playBoxRef.current = { x: boxX, y: boxY, width: boxWidth, height: boxHeight };
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    const gameLoop = () => {
      const currentTime = Date.now();
      const elapsed = Math.floor((currentTime - gameStartTimeRef.current) / 1000);
      setTimeElapsed(elapsed);

      if (elapsed > 0) {
        const minutes = elapsed / 60;
        const calculatedWpm = Math.round(wordsDestroyed / minutes);
        setWpm(calculatedWpm);
      }

      difficultyRef.current = 1 + Math.floor(elapsed / 10);
      const spawnInterval = Math.max(2000 - difficultyRef.current * 100, 800);

      if (currentTime - lastSpawnTimeRef.current > spawnInterval) {
        const maxAsteroids = gameMode === "speed" ? 5 : 3;
        if (asteroidsRef.current.length < maxAsteroids) {
          spawnAsteroid();
          lastSpawnTimeRef.current = currentTime;
        }
      }

      const playBox = playBoxRef.current;

      asteroidsRef.current.forEach((asteroid) => {
        asteroid.x += asteroid.vx;
        asteroid.y += asteroid.vy;

        if (asteroid.x - asteroid.size < playBox.x) {
          asteroid.x = playBox.x + asteroid.size;
          asteroid.vx = Math.abs(asteroid.vx) * 0.8;
        }
        if (asteroid.x + asteroid.size > playBox.x + playBox.width) {
          asteroid.x = playBox.x + playBox.width - asteroid.size;
          asteroid.vx = -Math.abs(asteroid.vx) * 0.8;
        }

        if (asteroid.y + asteroid.size > playBox.y + playBox.height) {
          setHealth((h) => {
            const newHealth = Math.max(0, h - 20);
            if (newHealth === 0) {
              endGame();
            }
            return newHealth;
          });
          asteroidsRef.current = asteroidsRef.current.filter((a) => a.id !== asteroid.id);
          setCurrentInput("");
          if (asteroidsRef.current.length > 0 && asteroid.isActive) {
            asteroidsRef.current[0].isActive = true;
          }
        }
      });

      shotsRef.current = shotsRef.current.filter((shot) => {
        shot.progress += 0.15;
        return shot.progress < 1;
      });

      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        return p.life > 0;
      });

      // Render
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      ctx.fillStyle = "#0B0F14";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Play box
      ctx.strokeStyle = "#00C2FF";
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#00C2FF";
      ctx.strokeRect(playBox.x, playBox.y, playBox.width, playBox.height);
      ctx.shadowBlur = 0;

      // Darken outside area
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, canvas.width, playBox.y);
      ctx.fillRect(0, playBox.y, playBox.x, playBox.height);
      ctx.fillRect(playBox.x + playBox.width, playBox.y, canvas.width - playBox.x - playBox.width, playBox.height);
      ctx.fillRect(0, playBox.y + playBox.height, canvas.width, canvas.height - playBox.y - playBox.height);

      // Grid
      ctx.strokeStyle = "rgba(0, 194, 255, 0.1)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = playBox.x; x < playBox.x + playBox.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, playBox.y);
        ctx.lineTo(x, playBox.y + playBox.height);
        ctx.stroke();
      }
      for (let y = playBox.y; y < playBox.y + playBox.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(playBox.x, y);
        ctx.lineTo(playBox.x + playBox.width, y);
        ctx.stroke();
      }

      // Stars
      starsRef.current.forEach((star) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fillRect(star.x % canvas.width, star.y % canvas.height, star.size, star.size);
      });

      // Asteroids
      asteroidsRef.current.forEach((asteroid) => {
        const shake = asteroid.shaking ? (Math.random() - 0.5) * 4 : 0;
        const x = asteroid.x + shake;
        const y = asteroid.y + shake;

        // Asteroid body
        ctx.fillStyle = asteroid.isActive ? "#00C2FF" : "#444";
        ctx.beginPath();
        ctx.arc(x, y, asteroid.size, 0, Math.PI * 2);
        ctx.fill();

        // Cracks
        if (asteroid.crackLevel > 0) {
          ctx.strokeStyle = "#00C2FF";
          ctx.lineWidth = 2;
          for (let i = 0; i < asteroid.crackLevel; i++) {
            const angle = (Math.PI * 2 * i) / asteroid.word.length;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(
              x + Math.cos(angle) * asteroid.size,
              y + Math.sin(angle) * asteroid.size
            );
            ctx.stroke();
          }
        }

        // Word
        ctx.fillStyle = "#fff";
        ctx.font = "16px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const typedPart = asteroid.word.substring(0, asteroid.progress);
        const remainingPart = asteroid.word.substring(asteroid.progress);

        ctx.fillStyle = "#00C2FF";
        ctx.fillText(typedPart, x - (remainingPart.length * 4.5), y);
        ctx.fillStyle = "#fff";
        ctx.fillText(remainingPart, x + (typedPart.length * 4.5), y);
      });

      // Shots
      shotsRef.current.forEach((shot) => {
        const x = shot.x + (shot.targetX - shot.x) * shot.progress;
        const y = shot.y + (shot.targetY - shot.y) * shot.progress;

        ctx.strokeStyle = shot.color;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 10;
        ctx.shadowColor = shot.color;
        ctx.beginPath();
        ctx.moveTo(shot.x, shot.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = shot.color;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Player ship
      const playerX = playBox.x + playBox.width / 2;
      const playerY = playBox.y + playBox.height - 40;

      ctx.fillStyle = playerFlashRef.current ? "#FF0000" : "#00C2FF";
      ctx.shadowBlur = 15;
      ctx.shadowColor = playerFlashRef.current ? "#FF0000" : "#00C2FF";
      ctx.beginPath();
      ctx.moveTo(playerX, playerY - 15);
      ctx.lineTo(playerX - 12, playerY + 10);
      ctx.lineTo(playerX + 12, playerY + 10);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Particles
      particlesRef.current.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("resize", updateSize);
    };
  }, [gameState, gameMode, wordsDestroyed, spawnAsteroid, endGame]);

  return (
    <div className="relative w-full h-full min-h-[600px] bg-[#0B0F14] flex flex-col items-center justify-center p-4">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 z-20 text-gray-400 hover:text-[#00C2FF] hover:bg-[#00C2FF]/10"
        onClick={() => navigate(-1)}
        aria-label="Go back"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      {gameState === "menu" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#0B0F14]/95">
          <h1 className="text-5xl font-bold text-[#00C2FF] mb-4">AstroType</h1>
          <p className="text-gray-400 mb-8 text-center max-w-md">
            Type words to destroy asteroids. Only the active asteroid (cyan) responds to your input.
          </p>
          <div className="mb-8">
            <label className="text-gray-400 mb-2 block">Game Mode</label>
            <Select value={gameMode} onValueChange={(v) => setGameMode(v as GameMode)}>
              <SelectTrigger className="w-[200px] bg-[#1a1f2e] border-[#00C2FF]/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="classic">Classic</SelectItem>
                <SelectItem value="accuracy">Accuracy Mode</SelectItem>
                <SelectItem value="speed">Speed Mode</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={startGame}
            className="bg-[#00C2FF] hover:bg-[#00A8DD] text-black font-semibold px-8 py-6 text-lg"
          >
            Start Game (Press Enter)
          </Button>
          <div className="mt-8 text-sm text-gray-500 text-center max-w-md">
            <p>• Type the word shown on the active (cyan) asteroid</p>
            <p>• Press ESC to pause</p>
            <p>• Difficulty increases over time</p>
          </div>
        </div>
      )}

      {gameState === "paused" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#0B0F14]/95">
          <h2 className="text-4xl font-bold text-[#00C2FF] mb-4">Paused</h2>
          <p className="text-gray-400 mb-8">Press ESC to resume</p>
          <Button
            onClick={() => setGameState("playing")}
            className="bg-[#00C2FF] hover:bg-[#00A8DD] text-black font-semibold px-8 py-4"
          >
            Resume
          </Button>
          <Button
            onClick={() => setGameState("menu")}
            variant="outline"
            className="mt-4 border-[#00C2FF]/30 text-[#00C2FF] hover:bg-[#00C2FF]/10"
          >
            Main Menu
          </Button>
        </div>
      )}

      {gameState === "gameover" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#0B0F14]/95">
          <h2 className="text-4xl font-bold text-[#00C2FF] mb-4">Game Over</h2>
          <div className="bg-[#1a1f2e] border border-[#00C2FF]/30 rounded-lg p-6 mb-8 min-w-[300px]">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-gray-400 text-sm">Score</div>
                <div className="text-2xl font-bold text-[#00C2FF]">{score}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">WPM</div>
                <div className="text-2xl font-bold text-[#00C2FF]">{wpm}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Accuracy</div>
                <div className="text-2xl font-bold text-[#00C2FF]">{accuracy}%</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Words</div>
                <div className="text-2xl font-bold text-[#00C2FF]">{wordsDestroyed}</div>
              </div>
            </div>
          </div>
          <Button
            onClick={startGame}
            className="bg-[#00C2FF] hover:bg-[#00A8DD] text-black font-semibold px-8 py-4 mb-4"
          >
            Play Again
          </Button>
          <Button
            onClick={() => setGameState("menu")}
            variant="outline"
            className="border-[#00C2FF]/30 text-[#00C2FF] hover:bg-[#00C2FF]/10"
          >
            Main Menu
          </Button>
        </div>
      )}

      {gameState === "playing" && (
        <div className="absolute top-4 left-14 right-4 flex justify-between items-start z-10 pointer-events-none">
          <div className="bg-[#1a1f2e]/90 border border-[#00C2FF]/30 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Mode</div>
            <div className="text-sm font-semibold text-[#00C2FF] capitalize">{gameMode}</div>
          </div>
          <div className="bg-[#1a1f2e]/90 border border-[#00C2FF]/30 rounded-lg p-3 text-right">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div className="text-gray-400">Score:</div>
              <div className="text-[#00C2FF] font-semibold">{score}</div>
              <div className="text-gray-400">WPM:</div>
              <div className="text-[#00C2FF] font-semibold">{wpm}</div>
              <div className="text-gray-400">Accuracy:</div>
              <div className="text-[#00C2FF] font-semibold">{accuracy}%</div>
              <div className="text-gray-400">Words:</div>
              <div className="text-[#00C2FF] font-semibold">{wordsDestroyed}</div>
            </div>
          </div>
        </div>
      )}

      {gameState === "playing" && (
        <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none">
          <div className="bg-[#1a1f2e]/90 border border-[#00C2FF]/30 rounded-lg p-3 mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Health</span>
              <span className="text-xs text-[#00C2FF] font-semibold">{health}%</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00C2FF] to-[#00FFB3] transition-all duration-300"
                style={{ width: `${health}%` }}
              />
            </div>
          </div>
          {currentInput && (
            <div className="bg-[#1a1f2e]/90 border border-[#00C2FF]/30 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">Current Input</div>
              <div className="text-lg font-mono text-[#00C2FF] font-semibold">{currentInput}</div>
            </div>
          )}
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-lg"
        style={{ maxHeight: "calc(100vh - 200px)" }}
      />
    </div>
  );
}
