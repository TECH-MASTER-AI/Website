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

export default function TypeForgeFun() {
  const [difficulty, setDifficulty] = useState<FunDifficulty>("newbie");
  const [activeGame, setActiveGame] = useState<GameKind>(null);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-medium text-foreground">Type Forge</h1>
        <p className="text-sm text-muted-foreground">Test your typing skills and practice here.</p>
      </div>
      <div className="h-px bg-border" />

      <div>
        <h2 className="text-lg font-medium text-primary mb-1">Fun</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Typing-driven games. Select a difficulty, then pick a game.
        </p>
        <div className="inline-flex h-10 p-0.5 rounded-lg bg-muted/50 border border-border gap-0 mb-6">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setDifficulty(id)}
              className={cn(
                "px-4 py-2 text-sm font-semibold rounded-md transition-all duration-150",
                difficulty === id && "bg-primary/20 text-primary border-b-2 border-primary",
                difficulty !== id && "text-muted-foreground hover:text-foreground"
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
              className="rounded-xl border border-border bg-card p-6 text-left hover:border-primary/40 hover:bg-primary/5 transition-all duration-150"
            >
              <h3 className="text-lg font-semibold text-primary mb-1">Bridge Jump</h3>
              <p className="text-muted-foreground text-sm">
                Type letters or words on platforms to jump. Wrong input = stumble; miss = fall.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setActiveGame("astro")}
              className="rounded-xl border border-border bg-card p-6 text-left hover:border-primary/40 hover:bg-primary/5 transition-all duration-150"
            >
              <h3 className="text-lg font-semibold text-primary mb-1">Astro Type</h3>
              <p className="text-muted-foreground text-sm">
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
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-2 border-b border-border flex justify-end">
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground text-sm"
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
