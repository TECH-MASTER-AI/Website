import { Lock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type TabType = "spells" | "code" | "fun";

interface TypeForgeTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function TypeForgeTabs({ activeTab, onTabChange }: TypeForgeTabsProps) {
  const tabs = [
    {
      id: "spells" as const,
      label: "English Typing",
      description: "Spells mode",
      locked: false,
    },
    {
      id: "code" as const,
      label: "Code Typing", 
      description: "Code mode with syntax highlighting",
      locked: false,
    },
    {
      id: "fun" as const,
      label: "Game Mode",
      description: "Asteroid Typing",
      locked: false, // Can be set to true for progressive unlock
    },
  ];

  return (
    <div className="flex justify-center border-b border-white/10 mb-10">
      <div className="flex overflow-x-auto">
        {tabs.map((tab) => (
          <TooltipProvider key={tab.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    if (!tab.locked) {
                      onTabChange(tab.id);
                    }
                  }}
                  className={`
                    px-8 sm:px-12 py-3 text-sm font-medium transition-all relative whitespace-nowrap
                    ${tab.locked 
                      ? "opacity-50 cursor-not-allowed text-slate-400" 
                      : activeTab === tab.id
                        ? "text-cyan-400"
                        : "text-slate-400 hover:text-white"
                    }
                  `}
                >
                  {tab.locked && (
                    <Lock className="h-3.5 w-3.5 inline mr-1.5" />
                  )}
                  {tab.label}
                  
                  {/* Active Indicator */}
                  {activeTab === tab.id && !tab.locked && (
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"
                      style={{
                        boxShadow: "0 0 10px rgba(34, 211, 238, 0.5)"
                      }}
                    />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {tab.locked ? "Complete previous level to unlock" : tab.description}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
}