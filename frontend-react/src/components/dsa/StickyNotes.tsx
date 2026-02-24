import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { StickyNote, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "dsa_sticky_notes";

export interface StickyNoteItem {
  id: string;
  title: string;
  content: string;
  color: string;
  createdAt: number;
}

const COLORS = [
  "bg-yellow-100 dark:bg-yellow-500/20 border-yellow-300 dark:border-yellow-500/40",
  "bg-cyan-100 dark:bg-cyan-500/20 border-cyan-300 dark:border-cyan-500/40",
  "bg-pink-100 dark:bg-pink-500/20 border-pink-300 dark:border-pink-500/40",
  "bg-green-100 dark:bg-green-500/20 border-green-300 dark:border-green-500/40",
  "bg-amber-100 dark:bg-amber-500/20 border-amber-300 dark:border-amber-500/40",
];

function loadNotes(): StickyNoteItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveNotes(notes: StickyNoteItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function StickyNotes() {
  const [notes, setNotes] = useState<StickyNoteItem[]>(() => loadNotes());
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  const addNote = useCallback(() => {
    if (!newTitle.trim() && !newContent.trim()) return;
    setNotes((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: newTitle.trim() || "Note",
        content: newContent.trim(),
        color: COLORS[prev.length % COLORS.length],
        createdAt: Date.now(),
      },
    ]);
    setNewTitle("");
    setNewContent("");
    setAdding(false);
  }, [newTitle, newContent]);

  const removeNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<StickyNoteItem>) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates } : n))
    );
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <StickyNote className="h-5 w-5 text-amber-500" />
          Sticky Notes
        </h3>
        {!adding ? (
          <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add note
          </Button>
        ) : null}
      </div>

      {adding && (
        <div className="rounded-lg border bg-card p-4 space-y-2">
          <Input
            placeholder="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="font-medium"
          />
          <Textarea
            placeholder="Write your note..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={addNote}>
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <div
            key={note.id}
            className={cn(
              "rounded-lg border p-4 shadow-sm min-h-[120px] flex flex-col",
              note.color
            )}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <input
                className="font-semibold bg-transparent border-none outline-none w-full text-sm"
                value={note.title}
                onChange={(e) => updateNote(note.id, { title: e.target.value })}
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeNote(note.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Textarea
              className="flex-1 min-h-[80px] resize-none bg-transparent border-none shadow-none p-0 text-sm focus-visible:ring-0"
              value={note.content}
              onChange={(e) => updateNote(note.id, { content: e.target.value })}
              placeholder="Note content..."
            />
          </div>
        ))}
      </div>
      {notes.length === 0 && !adding && (
        <p className="text-sm text-muted-foreground">No sticky notes yet. Add one to get started.</p>
      )}
    </div>
  );
}
