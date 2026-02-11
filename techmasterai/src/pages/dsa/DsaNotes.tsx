import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Save, 
  Download, 
  Plus, 
  Trash2, 
  Edit3, 
  FileText,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";

// Simplified data structure as requested
type NotesData = Record<string, string>;

export default function DsaNotes() {
  console.log("🔥 DsaNotes component loaded successfully!");
  const { theme } = useTheme();
  const [notes, setNotes] = useState<NotesData>({});
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('simple_notes');
    const savedSelectedTitle = localStorage.getItem('selected_note_title');
    
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes);
        setNotes(parsedNotes);
        
        // Restore selected note if it still exists
        if (savedSelectedTitle && parsedNotes[savedSelectedTitle] !== undefined) {
          setSelectedTitle(savedSelectedTitle);
        } else if (Object.keys(parsedNotes).length > 0) {
          // Select first note if saved selection doesn't exist
          setSelectedTitle(Object.keys(parsedNotes)[0]);
        }
      } catch (error) {
        console.error('Error loading notes:', error);
      }
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    if (Object.keys(notes).length > 0) {
      localStorage.setItem('simple_notes', JSON.stringify(notes));
    }
  }, [notes]);

  // Save selected title to localStorage
  useEffect(() => {
    if (selectedTitle) {
      localStorage.setItem('selected_note_title', selectedTitle);
    }
  }, [selectedTitle]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [notes[selectedTitle || '']]);

  // Auto-save functionality
  const autoSave = useCallback((title: string, content: string) => {
    setIsAutoSaving(true);
    
    setNotes(prev => ({
      ...prev,
      [title]: content
    }));
    
    setLastSaved(new Date());
    
    // Show auto-save indicator briefly
    setTimeout(() => {
      setIsAutoSaving(false);
    }, 500);
  }, []);

  // Trigger auto-save when content changes
  const handleContentChange = (content: string) => {
    if (!selectedTitle) return;

    // Clear previous timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    // Update notes immediately for UI responsiveness
    setNotes(prev => ({
      ...prev,
      [selectedTitle]: content
    }));

    // Set new auto-save timeout
    const timeout = setTimeout(() => {
      autoSave(selectedTitle, content);
    }, 500); // Auto-save after 500ms of inactivity
    
    setAutoSaveTimeout(timeout);
  };

  // Create new note
  const createNewNote = () => {
    const existingTitles = Object.keys(notes);
    let counter = 1;
    let newTitle = `Untitled Note ${counter}`;
    
    // Find next available title
    while (existingTitles.includes(newTitle)) {
      counter++;
      newTitle = `Untitled Note ${counter}`;
    }

    setNotes(prev => ({
      ...prev,
      [newTitle]: ""
    }));
    
    setSelectedTitle(newTitle);
    toast.success("New note created!");
    
    // Focus textarea after creation
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  // Delete note with confirmation
  const deleteNote = (title: string) => {
    // Add confirmation dialog
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }
    
    try {
      const newNotes = { ...notes };
      delete newNotes[title];
      setNotes(newNotes);
      
      // Update localStorage immediately
      if (Object.keys(newNotes).length > 0) {
        localStorage.setItem('simple_notes', JSON.stringify(newNotes));
      } else {
        // Remove from localStorage if no notes left
        localStorage.removeItem('simple_notes');
        localStorage.removeItem('selected_note_title');
      }
      
      // Select another note if the deleted one was selected
      if (selectedTitle === title) {
        const remainingTitles = Object.keys(newNotes);
        const newSelectedTitle = remainingTitles.length > 0 ? remainingTitles[0] : null;
        setSelectedTitle(newSelectedTitle);
        
        // Update localStorage for selected title
        if (newSelectedTitle) {
          localStorage.setItem('selected_note_title', newSelectedTitle);
        } else {
          localStorage.removeItem('selected_note_title');
        }
      }
      
      toast.success("Note deleted!");
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error("Failed to delete note. Please try again.");
    }
  };

  // Start editing title
  const startEditingTitle = (title: string) => {
    setIsEditingTitle(title);
    setEditTitleValue(title);
  };

  // Save title edit
  const saveTitle = () => {
    if (!isEditingTitle || !editTitleValue.trim()) {
      setIsEditingTitle(null);
      return;
    }

    const newTitle = editTitleValue.trim();
    
    // Check if title already exists
    if (newTitle !== isEditingTitle && notes[newTitle] !== undefined) {
      toast.error("A note with this title already exists!");
      return;
    }

    // Update notes with new title
    const newNotes = { ...notes };
    const content = newNotes[isEditingTitle];
    delete newNotes[isEditingTitle];
    newNotes[newTitle] = content;
    
    setNotes(newNotes);
    
    // Update selected title if it was the one being edited
    if (selectedTitle === isEditingTitle) {
      setSelectedTitle(newTitle);
    }
    
    setIsEditingTitle(null);
    setEditTitleValue("");
    toast.success("Title updated!");
  };

  // Cancel title edit
  const cancelTitleEdit = () => {
    setIsEditingTitle(null);
    setEditTitleValue("");
  };

  // Export current note as PDF
  const exportToPDF = async () => {
    if (!selectedTitle) {
      toast.error("Please select a note to export");
      return;
    }

    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error("Please allow popups to export PDF");
        return;
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${selectedTitle}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            h1 {
              color: #2563eb;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 10px;
            }
            .content {
              white-space: pre-wrap;
              line-height: 1.8;
              font-size: 14px;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <h1>${selectedTitle}</h1>
          <div class="content">${notes[selectedTitle].replace(/\n/g, '<br>')}</div>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);

      toast.success("PDF export initiated!");
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Failed to export PDF");
    }
  };

  // Filter notes based on search
  const filteredTitles = Object.keys(notes).filter(title =>
    title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notes[title].toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N to create new note
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        createNewNote();
      }
      
      // Escape to cancel title editing
      if (e.key === 'Escape' && isEditingTitle) {
        cancelTitleEdit();
      }
      
      // Enter to save title
      if (e.key === 'Enter' && isEditingTitle) {
        saveTitle();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isEditingTitle]);

  return (
    <div className={cn(
      "h-full flex transition-colors duration-300",
      theme === 'pastel' ? "bg-gradient-to-br from-rose-50 to-purple-50" : "bg-slate-50 dark:bg-[#0B0F19]"
    )}>
      {/* Left Sidebar - Note Titles */}
      <div className={cn(
        "w-80 border-r flex flex-col transition-colors duration-300",
        theme === 'pastel' ? "bg-white/60 border-rose-100" : "bg-white dark:bg-[#111625] border-slate-200 dark:border-white/10"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-inherit">
          <div className="flex items-center gap-2 mb-4">
            <FileText className={cn("h-5 w-5", theme === 'pastel' ? "text-rose-600" : "text-cyan-500")} />
            <h1 className={cn(
              "text-lg font-semibold",
              theme === 'pastel' ? "text-slate-800" : "text-slate-900 dark:text-white"
            )}>
              📝 My Notes App
            </h1>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "pl-9",
                theme === 'pastel' 
                  ? "bg-white border-rose-200 focus-visible:ring-rose-400/50" 
                  : "bg-white dark:bg-[#0B0F19] border-slate-200 dark:border-white/20 focus-visible:ring-cyan-500/50"
              )}
            />
          </div>

          {/* New Note Button */}
          <Button 
            onClick={createNewNote}
            className={cn(
              "w-full",
              theme === 'pastel' 
                ? "bg-rose-500 hover:bg-rose-600" 
                : "bg-cyan-500 hover:bg-cyan-600"
            )}
            title="Create new note (Ctrl+N)"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto">
          {filteredTitles.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "No notes found" : "No notes yet. Create your first note!"}
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredTitles.map((title) => (
                <div
                  key={title}
                  className={cn(
                    "group relative p-3 rounded-lg cursor-pointer transition-all duration-200 border",
                    selectedTitle === title 
                      ? theme === 'pastel' 
                        ? "border-rose-300 bg-rose-50" 
                        : "border-cyan-300 bg-cyan-50 dark:bg-cyan-500/10 dark:border-cyan-500/30"
                      : theme === 'pastel'
                        ? "border-rose-100 hover:border-rose-200 bg-white hover:bg-rose-50"
                        : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-[#0B0F19] hover:bg-slate-50 dark:hover:bg-white/5"
                  )}
                  onClick={() => setSelectedTitle(title)}
                >
                  {/* Title */}
                  {isEditingTitle === title ? (
                    <Input
                      value={editTitleValue}
                      onChange={(e) => setEditTitleValue(e.target.value)}
                      onBlur={saveTitle}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveTitle();
                        if (e.key === 'Escape') cancelTitleEdit();
                      }}
                      className={cn(
                        "text-sm font-medium border-none p-0 h-auto bg-transparent focus-visible:ring-0",
                        theme === 'pastel' ? "text-slate-800" : "text-slate-900 dark:text-white"
                      )}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <h3 
                      className={cn(
                        "text-sm font-medium truncate pr-16",
                        theme === 'pastel' ? "text-slate-800" : "text-slate-900 dark:text-white"
                      )}
                      onDoubleClick={() => startEditingTitle(title)}
                    >
                      {title}
                    </h3>
                  )}

                  {/* Content Preview */}
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {notes[title] || "No content"}
                  </p>

                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditingTitle(title);
                      }}
                      className="h-6 w-6 p-0 hover:text-blue-500"
                      title="Edit title"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(title);
                      }}
                      className="h-6 w-6 p-0 hover:text-red-500"
                      title="Delete note"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Note Editor */}
      <div className="flex-1 flex flex-col">
        {selectedTitle ? (
          <>
            {/* Editor Header */}
            <div className={cn(
              "p-4 border-b flex items-center justify-between",
              theme === 'pastel' ? "bg-white/60 border-rose-100" : "bg-white dark:bg-[#111625] border-slate-200 dark:border-white/10"
            )}>
              <div className="flex items-center gap-3">
                <h2 className={cn(
                  "text-lg font-semibold",
                  theme === 'pastel' ? "text-slate-800" : "text-slate-900 dark:text-white"
                )}>
                  {selectedTitle}
                </h2>
                
                {/* Auto-save indicator */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {isAutoSaving ? (
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                      Saving...
                    </span>
                  ) : lastSaved ? (
                    <span>Saved {lastSaved.toLocaleTimeString()}</span>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToPDF}
                  className={cn(
                    theme === 'pastel' 
                      ? "border-rose-200 text-rose-700 hover:bg-rose-50" 
                      : "border-slate-200 dark:border-white/20"
                  )}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>

            {/* Note Content Editor */}
            <div className="flex-1 p-4">
              <Textarea
                ref={textareaRef}
                value={notes[selectedTitle] || ""}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Start writing your note here..."
                className={cn(
                  "w-full h-full min-h-[400px] resize-none border-none focus-visible:ring-0 text-sm leading-relaxed",
                  theme === 'pastel' 
                    ? "bg-transparent text-slate-800 placeholder:text-slate-400" 
                    : "bg-transparent text-slate-900 dark:text-white placeholder:text-slate-500"
                )}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
              <h3 className={cn(
                "text-lg font-medium mb-2",
                theme === 'pastel' ? "text-slate-800" : "text-slate-900 dark:text-white"
              )}>
                Select a note to start writing
              </h3>
              <p className="text-muted-foreground mb-6">
                Choose a note from the sidebar or create a new one to get started.
              </p>
              
              {/* Keyboard shortcuts help */}
              <div className={cn(
                "text-xs text-muted-foreground space-y-1 p-4 rounded-lg border",
                theme === 'pastel' ? "bg-rose-50 border-rose-100" : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10"
              )}>
                <p className="font-medium mb-2">Keyboard Shortcuts:</p>
                <p><kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs">Ctrl+N</kbd> New note</p>
                <p><kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs">Double-click</kbd> Edit title</p>
                <p><kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs">Enter</kbd> Save title</p>
                <p><kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs">Esc</kbd> Cancel edit</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}