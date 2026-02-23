import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RotateCcw, Clock, Zap, Target, Code, Type, Sparkles, Rocket, ArrowLeft, Trophy } from "lucide-react";
import { CodingClock } from "@/components/CodingClock";
import { AstroType } from "@/components/AstroType";
import { getRandomPassage, type PassageLength } from "@/data/typingPassages";
import {
  getRandomCodeSnippet,
  getSyntaxClasses,
  type CodeLanguage,
} from "@/data/typingCodeSnippets";

/** Code Typing Challenge languages: JS, Python, SQL (differentiator for engineers/bootcamp) */
const CHALLENGE_LANGUAGES: CodeLanguage[] = ["javascript", "python", "sql"];

type Mode = "text" | "code" | "astrotype" | "challenge";

export default function TypingTest() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("code");
  const [passageLength, setPassageLength] = useState<PassageLength>("medium");
  const [codeLanguage, setCodeLanguage] = useState<CodeLanguage>("javascript");
  const [challengeLanguage, setChallengeLanguage] = useState<CodeLanguage>("javascript");
  const [passage, setPassage] = useState("");
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [completionTime, setCompletionTime] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  /** Track indices where user made an error (for Challenge error heatmap) */
  const [errorIndices, setErrorIndices] = useState<Set<number>>(new Set());
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const loadTextPassage = useCallback(() => {
    setPassage(getRandomPassage(passageLength));
    setInput("");
    setStartTime(null);
    setCompletionTime(null);
    setIsComplete(false);
    setErrorIndices(new Set());
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [passageLength]);

  const loadCodeSnippet = useCallback(() => {
    const lang = mode === "challenge" ? challengeLanguage : codeLanguage;
    setPassage(getRandomCodeSnippet(lang));
    setInput("");
    setStartTime(null);
    setCompletionTime(null);
    setIsComplete(false);
    setErrorIndices(new Set());
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [codeLanguage, mode, challengeLanguage]);

  useEffect(() => {
    if (mode === "text") loadTextPassage();
    else if (mode === "code" || mode === "challenge") loadCodeSnippet();
  }, [mode, passageLength, codeLanguage, challengeLanguage]);

  useEffect(() => {
    if (!passage || passage.length === 0) return;
    if (input.length === 1 && !startTime) setStartTime(Date.now());
    setErrorIndices((prev) => {
      const next = new Set(prev);
      const i = input.length - 1;
      if (i >= 0 && i < passage.length) {
        if (input[i] !== passage[i]) next.add(i);
        else next.delete(i);
      }
      return next;
    });
    if (input.length >= passage.length && passage.length > 0) {
      setIsComplete(true);
      setCompletionTime(Date.now());
    }
  }, [input, passage]);

  const elapsedSeconds = startTime ? (Date.now() - startTime) / 1000 : 0;
  const elapsedMinutes = elapsedSeconds / 60;
  const correctChars = passage
    .slice(0, input.length)
    .split("")
    .filter((c, i) => c === input[i]).length;
  const totalTyped = input.length;
  const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;
  const wpm =
    elapsedMinutes > 0 ? Math.round((correctChars / 5) / elapsedMinutes) : 0;

  const effectiveCodeMode = mode === "code" || mode === "challenge";
  const effectiveLang = mode === "challenge" ? challengeLanguage : codeLanguage;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart ?? 0;
      const end = ta.selectionEnd ?? start;
      const newInput = input.slice(0, start) + "  " + input.slice(end);
      setInput(newInput);
      setTimeout(() => ta.setSelectionRange(start + 2, start + 2), 0);
    }
  };

  const syntaxClasses = effectiveCodeMode && passage ? getSyntaxClasses(passage, effectiveLang) : [];

  /** For Challenge: error heatmap buckets (divide passage into segments, count errors per segment) */
  const heatmapBuckets = useMemo(() => {
    if (!passage.length || mode !== "challenge") return [];
    const segmentSize = Math.max(1, Math.ceil(passage.length / 20));
    const buckets: number[] = new Array(20).fill(0);
    errorIndices.forEach((i) => {
      const bucket = Math.min(19, Math.floor(i / segmentSize));
      buckets[bucket]++;
    });
    return buckets;
  }, [passage.length, errorIndices, mode]);

  const maxHeat = Math.max(1, ...heatmapBuckets);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      {mode === "astrotype" ? (
        <main className="flex-1 pt-16">
          <AstroType />
        </main>
      ) : (
        <main className="flex-1 container max-w-4xl mx-auto px-4 py-8 pt-24">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => navigate(-1)}
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1 min-w-0">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight">Type Forge</h1>
                  <p className="text-muted-foreground text-sm">
                    {mode === "challenge"
                      ? "Code Typing Challenge: syntax accuracy, time-to-complete, error heatmap. For engineers & bootcamp learners."
                      : mode === "code"
                        ? "Practice typing code with syntax highlighting. Timer starts on first keypress."
                        : "Type the passage below. WPM is based on correct characters."}
                  </p>
                </div>
              </div>
              <div className="w-10 shrink-0" aria-hidden />
            </div>

            <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
              <TabsList className="grid w-full max-w-lg grid-cols-4 mx-auto">
                <TabsTrigger value="code" className="gap-2">
                  <Code className="h-4 w-4" />
                  Code
                </TabsTrigger>
                <TabsTrigger value="challenge" className="gap-2">
                  <Trophy className="h-4 w-4" />
                  Challenge
                </TabsTrigger>
                <TabsTrigger value="text" className="gap-2">
                  <Type className="h-4 w-4" />
                  Text
                </TabsTrigger>
                <TabsTrigger value="astrotype" className="gap-2">
                  <Rocket className="h-4 w-4" />
                  AstroType
                </TabsTrigger>
              </TabsList>
            </Tabs>

          <div className="flex flex-wrap items-center gap-4">
            {(mode === "code" || mode === "challenge") && (
              <>
                <CodingClock />
                {mode === "code" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))}
                    className="gap-2"
                    aria-label="Open AI assistant"
                  >
                    <Sparkles className="h-4 w-4 text-primary" />
                    AI
                  </Button>
                )}
              </>
            )}
            {mode === "challenge" ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Language:</span>
                <Select
                  value={challengeLanguage}
                  onValueChange={(v) => setChallengeLanguage(v as CodeLanguage)}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHALLENGE_LANGUAGES.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang === "javascript" ? "JavaScript" : lang === "python" ? "Python" : "SQL"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : mode === "code" ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Language:</span>
                <Select
                  value={codeLanguage}
                  onValueChange={(v) => setCodeLanguage(v as CodeLanguage)}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="sql">SQL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Length:</span>
                <Select
                  value={passageLength}
                  onValueChange={(v) => setPassageLength(v as PassageLength)}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="long">Long</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={effectiveCodeMode ? loadCodeSnippet : loadTextPassage}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              New {mode === "challenge" ? "challenge" : effectiveCodeMode ? "snippet" : "passage"}
            </Button>
          </div>

          <Card className={effectiveCodeMode ? "overflow-hidden border-0 bg-transparent shadow-none max-w-full" : "max-w-full overflow-hidden"}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between flex-wrap gap-2">
                <span>Stats</span>
                <div className="flex items-center gap-4 text-sm font-normal text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {startTime
                      ? `${Math.floor(elapsedSeconds / 60)}:${String(Math.floor(elapsedSeconds % 60)).padStart(2, "0")}`
                      : "0:00"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="h-4 w-4" />
                    {wpm} WPM
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    {accuracy}% accuracy
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {effectiveCodeMode ? (
                <div
                  className="relative ty-code-panel min-h-[220px] max-w-full p-4 font-mono text-sm leading-[1.7] overflow-auto cursor-text whitespace-pre-wrap break-words overflow-x-auto"
                  onClick={() => inputRef.current?.focus()}
                >
                  <div className="select-none break-words max-w-full min-w-0" aria-hidden style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
                    {passage.split("").map((char, i) => {
                      const typed = input[i];
                      const isCorrect = typed !== undefined ? typed === char : null;
                      const isCurrent = i === input.length;
                      let cls: string;
                      if (isCurrent) cls = "ty-syntax-cursor";
                      else if (isCorrect === true) cls = "ty-syntax-correct";
                      else if (isCorrect === false) cls = "ty-syntax-wrong";
                      else cls = syntaxClasses[i] ?? "ty-syntax-default";
                      return (
                        <span key={i} className={cls}>
                          {char === " " ? "\u00A0" : char}
                        </span>
                      );
                    })}
                  </div>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="absolute inset-0 w-full h-full min-w-0 resize-none bg-transparent text-transparent caret-primary font-mono text-sm leading-[1.7] p-4 focus:outline-none break-words"
                    style={{ wordBreak: "break-word", overflowWrap: "anywhere", zIndex: 1 }}
                    spellCheck={false}
                    autoFocus
                    readOnly={isComplete}
                    placeholder=""
                    aria-label="Type the code above"
                  />
                </div>
              ) : (
                <>
                  <div
                    className="min-h-[120px] max-w-full rounded-lg border bg-muted/30 p-4 font-mono text-lg leading-relaxed cursor-text overflow-hidden break-words"
                    style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
                    onClick={() => inputRef.current?.focus()}
                  >
                    {passage.split("").map((char, i) => {
                      const typed = input[i];
                      const isCorrect = typed !== undefined ? typed === char : null;
                      const isCurrent = i === input.length;
                      return (
                        <span
                          key={i}
                          className={
                            isCurrent
                              ? "bg-primary/30 text-primary border-b-2 border-primary animate-pulse"
                              : isCorrect === true
                                ? "text-green-600 dark:text-green-400"
                                : isCorrect === false
                                  ? "text-red-600 dark:text-red-400 bg-red-500/10"
                                  : "text-muted-foreground"
                          }
                        >
                          {char === " " ? "\u00A0" : char}
                        </span>
                      );
                    })}
                  </div>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Start typing here..."
                    className="w-full min-h-[100px] max-w-full min-w-0 rounded-lg border bg-background px-4 py-3 font-mono text-lg leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 box-border"
                    spellCheck={false}
                    autoFocus
                    readOnly={isComplete}
                  />
                </>
              )}

              {isComplete && mode === "challenge" && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 space-y-4">
                  <p className="font-semibold text-primary text-center">Code Typing Challenge — Results</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                    <div className="rounded-md bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Syntax accuracy</p>
                      <p className="text-2xl font-bold text-primary">{accuracy}%</p>
                    </div>
                    <div className="rounded-md bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Time to complete</p>
                      <p className="text-2xl font-bold text-primary">
                        {startTime && completionTime
                          ? `${((completionTime - startTime) / 1000).toFixed(1)}s`
                          : "—"}
                      </p>
                    </div>
                    <div className="rounded-md bg-muted/50 p-3 sm:col-span-2 sm:col-start-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">WPM</p>
                      <p className="text-2xl font-bold text-primary">{wpm}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Error heatmap</p>
                    <div className="flex gap-0.5 h-8 rounded overflow-hidden bg-muted/30">
                      {heatmapBuckets.map((count, i) => (
                        <div
                          key={i}
                          className="flex-1 min-w-[4px] transition-colors"
                          style={{
                            backgroundColor: count === 0
                              ? "hsl(var(--muted))"
                              : `hsl(var(--destructive))`,
                            opacity: count === 0 ? 0.5 : 0.3 + (count / maxHeat) * 0.7,
                          }}
                          title={`Segment ${i + 1}: ${count} error(s)`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Red = more errors in that part of the snippet. Hover for count.
                    </p>
                  </div>
                  <Button className="w-full" onClick={loadCodeSnippet}>
                    Next challenge
                  </Button>
                </div>
              )}
              {isComplete && mode !== "challenge" && (
                <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 text-center">
                  <p className="font-semibold text-primary">Done!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {wpm} WPM · {accuracy}% accuracy
                  </p>
                  <Button className="mt-3" onClick={effectiveCodeMode ? loadCodeSnippet : loadTextPassage}>
                    Try again
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      )}
      <Footer />
    </div>
  );
}
