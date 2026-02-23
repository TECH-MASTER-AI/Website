import { useState } from "react";
import { BridgeJump } from "@/components/typeforge/BridgeJump";
import { AstroType } from "@/components/AstroType";
import { cn } from "@/lib/utils";

type FunDifficulty = "newbie" | "mid" | "pro";

const TABS: { id: FunDifficulty; label: string }[] = [
  { id: "newbie", label: "Newbie" },
  { id: "mid", label: "Mid" },
  { id: "pro", label: "Pro" },
];

type GameKind = "bridge" | "astro" | null;

function TypeForgeFun() {
  const [difficulty, setDifficulty] = useState<FunDifficulty>("newbie");
  const [activeGame, setActiveGame] = useState<GameKind>(null);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-medium text-white">Type Forge</h1>
        <p className="text-sm text-slate-400">Test your typing skills and practice here.</p>
      </div>
      <div className="h-px bg-white/10" />

      <div>
        <h2 className="text-lg font-medium text-cyan-400 mb-1">Fun</h2>
        <p className="text-sm text-slate-400 mb-4">
          Typing-driven games. Select a difficulty, then pick a game.
        </p>
        <div className="inline-flex h-10 p-0.5 rounded-lg bg-white/5 border border-white/10 gap-0 mb-6">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setDifficulty(id)}
              className={cn(
                "px-4 py-2 text-sm font-semibold rounded-md transition-all duration-150",
                difficulty === id && "bg-cyan-500/20 text-cyan-400 border-b-2 border-cyan-400",
                difficulty !== id && "text-slate-400 hover:text-white"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {activeGame === null && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <button
              type="button"
              onClick={() => setActiveGame("bridge")}
              className="rounded-xl border border-white/10 bg-[#1E2026] p-6 text-left hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all duration-150"
            >
              <h3 className="text-lg font-semibold text-cyan-400 mb-1">Bridge Jump</h3>
              <p className="text-slate-400 text-sm">
                Type letters or words on platforms to jump. Wrong input = stumble; miss = fall.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setActiveGame("astro")}
              className="rounded-xl border border-white/10 bg-[#1E2026] p-6 text-left hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all duration-150"
            >
              <h3 className="text-lg font-semibold text-cyan-400 mb-1">Astro Type</h3>
              <p className="text-slate-400 text-sm">
                Type the word on each asteroid to shoot it. Speed increases with difficulty.
              </p>
            </button>
          </div>
        )}

        {activeGame === "bridge" && (
          <div className="flex flex-col items-start gap-2">
            <BridgeJump
              difficulty={difficulty}
              onClose={() => setActiveGame(null)}
            />
          </div>
        )}

        {activeGame === "astro" && (
          <div className="rounded-xl border border-white/10 bg-[#0B0F14] overflow-hidden">
            <div className="p-2 border-b border-white/10 flex justify-end">
              <button
                type="button"
                className="text-slate-400 hover:text-white text-sm"
                onClick={() => setActiveGame(null)}
              >
                Close
              </button>
            </div>
            <div className="min-h-[400px]">
              <AstroType difficulty={difficulty} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default TypeForgeFun;