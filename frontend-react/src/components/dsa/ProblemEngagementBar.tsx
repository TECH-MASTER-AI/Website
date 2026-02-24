import { MessageSquare, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProblemEngagementBarProps {
  commentCount: number;
  isFavorited?: boolean;
  onComment: () => void;
  onFavorite: () => void;
}

export function ProblemEngagementBar({
  commentCount,
  isFavorited = false,
  onComment,
  onFavorite,
}: ProblemEngagementBarProps) {
  const handleFavorite = () => {
    onFavorite();
  };

  return (
    <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-t border-white/10 bg-[#1a1f2e]">
      {/* Reactions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onComment}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
          title="Comments"
        >
          <MessageSquare className="h-4 w-4" />
          <span className="text-xs font-medium">{commentCount}</span>
        </button>
        
        <button
          onClick={handleFavorite}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-200",
            isFavorited
              ? "bg-amber-500/15 text-amber-400"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          )}
          title={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Star className={cn("h-4 w-4", isFavorited && "fill-current")} />
        </button>
      </div>
    </div>
  );
}
