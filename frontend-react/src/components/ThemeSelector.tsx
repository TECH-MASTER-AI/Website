import { Sun, Moon, Heart } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import type { Theme } from "@/contexts/ThemeContext";

const themes: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
  { value: "pastel", label: "Pastel", icon: Heart },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/50 p-1.5 backdrop-blur-sm">
      {themes.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            "h-9 w-9 rounded-full flex items-center justify-center transition-all duration-300",
            theme === value 
              ? "bg-cyan-400 text-slate-900 shadow-[0_0_15px_rgba(34,211,238,0.5)]" 
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          )}
          aria-label={`${label} theme`}
          title={label}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
