import { useState, useRef, useCallback, useEffect } from "react";
import { GripHorizontal, Minimize2, Maximize2 } from "lucide-react";

interface DraggableAiPopupProps {
  children: React.ReactNode;
  storageKey?: string;
  onClose: () => void;
}

interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

const DEFAULT_POS: Position = {
  x: window.innerWidth - 420,
  y: 100,
  width: 380,
  height: 520,
};

const MIN_WIDTH = 320;
const MIN_HEIGHT = 400;
const MAX_WIDTH = 600;
const MAX_HEIGHT = 800;

export function DraggableAiPopup({ children, storageKey = 'dsa_ai_popup_pos', onClose }: DraggableAiPopupProps) {
  const [position, setPosition] = useState<Position>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Validate bounds
        return {
          x: Math.max(0, Math.min(parsed.x, window.innerWidth - 200)),
          y: Math.max(0, Math.min(parsed.y, window.innerHeight - 200)),
          width: Math.max(MIN_WIDTH, Math.min(parsed.width || DEFAULT_POS.width, MAX_WIDTH)),
          height: Math.max(MIN_HEIGHT, Math.min(parsed.height || DEFAULT_POS.height, MAX_HEIGHT)),
        };
      } catch { /* fall through */ }
    }
    return DEFAULT_POS;
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number } | null>(null);
  const resizeStartRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Persist position
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(position));
  }, [position, storageKey]);

  // Clamp to viewport
  const clampToViewport = useCallback((pos: Position): Position => {
    return {
      x: Math.max(0, Math.min(pos.x, window.innerWidth - 100)),
      y: Math.max(0, Math.min(pos.y, window.innerHeight - 60)),
      width: pos.width,
      height: pos.height,
    };
  }, []);

  // Drag handlers
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  }, [position.x, position.y]);

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPosition(prev => clampToViewport({
      ...prev,
      x: dragStartRef.current!.posX + dx,
      y: dragStartRef.current!.posY + dy,
    }));
  }, [clampToViewport]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  // Resize handlers
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: position.width,
      height: position.height,
    };
    document.body.style.cursor = 'nwse-resize';
    document.body.style.userSelect = 'none';
  }, [position.width, position.height]);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!resizeStartRef.current) return;
    const dx = e.clientX - resizeStartRef.current.x;
    const dy = e.clientY - resizeStartRef.current.y;
    setPosition(prev => ({
      ...prev,
      width: Math.max(MIN_WIDTH, Math.min(resizeStartRef.current!.width + dx, MAX_WIDTH)),
      height: Math.max(MIN_HEIGHT, Math.min(resizeStartRef.current!.height + dy, MAX_HEIGHT)),
    }));
  }, []);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    resizeStartRef.current = null;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  // Mouse event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  // Window resize handler
  useEffect(() => {
    const handleWindowResize = () => {
      setPosition(prev => clampToViewport(prev));
    };
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [clampToViewport]);

  return (
    <div
      ref={containerRef}
      className={`fixed z-50 bg-[#1a1f2e] rounded-2xl shadow-2xl shadow-black/40 border border-white/10 flex flex-col overflow-hidden transition-shadow ${
        isDragging ? 'shadow-cyan-500/20' : ''
      }`}
      style={{
        left: position.x,
        top: position.y,
        width: position.width,
        height: isMinimized ? 48 : position.height,
      }}
    >
      {/* Drag Handle Header */}
      <div
        onMouseDown={handleDragStart}
        className="h-10 flex items-center justify-between px-3 border-b border-white/10 cursor-grab active:cursor-grabbing bg-[#151a29] shrink-0 select-none"
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="h-4 w-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-400">AI Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-6 w-6 rounded flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            {isMinimized ? (
              <Maximize2 className="h-3 w-3 text-slate-400" />
            ) : (
              <Minimize2 className="h-3 w-3 text-slate-400" />
            )}
          </button>
          <button
            onClick={onClose}
            className="h-6 w-6 rounded flex items-center justify-center hover:bg-red-500/20 transition-colors text-slate-400 hover:text-red-400"
          >
            <span className="text-sm font-bold">&times;</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="flex-1 overflow-hidden relative">
          {children}

          {/* Resize Handle */}
          <div
            onMouseDown={handleResizeStart}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize group"
          >
            <svg
              className="w-3 h-3 absolute bottom-1 right-1 text-slate-600 group-hover:text-cyan-400 transition-colors"
              viewBox="0 0 12 12"
            >
              <path d="M11 1L1 11M11 5L5 11M11 9L9 11" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
