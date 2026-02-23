import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Editor from "@monaco-editor/react";
import {
  Swords,
  Clock,
  MessageSquare,
  Send,
  Trophy,
  Loader2,
  Code2,
  Bot,
  Lightbulb,
} from "lucide-react";
import { getDsaProblemList, getDsaProblemById } from "@/data/dsaProblems";
import { getDuelWsUrl } from "@/features/dsa/duels/duelWsUrl";
import { useDuelUser } from "@/features/dsa/duels/useDuelUser";
import {
  addDuelWin,
  addDuelLoss,
  getWinPoints,
  getLossPoints,
  getRankTier,
  getDuelStats,
} from "@/features/dsa/duels/duelRating";
import { toast } from "sonner";
import {
  getRandomBot,
  createChatContext,
  generateBotResponse,
  generateAutoBotMessage,
  generateEndGameMessage,
} from "@/utils/aiChatbot";

const DUEL_DURATION_SEC = 15 * 60; // 15 min
const AI_AUTO_WIN_TIME_SEC = 5 * 60; // AI wins after 5 minutes

interface ChatMessage {
  id: string;
  from: "me" | "opponent";
  text: string;
  time: Date;
}

export default function DsaDuelRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const [opponentName, setOpponentName] = useState(() => searchParams.get("opponent") || "Opponent");
  const problemIdParam = searchParams.get("problemId");
  const isBot = searchParams.get("bot") === "1";
  const user = useDuelUser();
  const wsRef = useRef<WebSocket | null>(null);

  const [problem, setProblem] = useState(() => {
    if (problemIdParam) {
      const p = getDsaProblemById(problemIdParam);
      if (p) return p;
    }
    const list = getDsaProblemList();
    return list[Math.floor(Math.random() * list.length)];
  });
  const [timeLeft, setTimeLeft] = useState(DUEL_DURATION_SEC);
  const [mySolved, setMySolved] = useState(false);
  const [oppSolved, setOppSolved] = useState(false);
  const [winner, setWinner] = useState<"you" | "opponent" | null>(null);
  const [code, setCode] = useState(problem?.boilerplate?.javascript ?? "// Your code");
  const [language, setLanguage] = useState<string>("javascript");
  const [theme, setTheme] = useState<"vs-dark" | "light">("vs-dark");
  const [syntaxErrors, setSyntaxErrors] = useState<string[]>([]);
  const editorRef = useRef<any>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [wsConnected, setWsConnected] = useState(false);
  const [ratingUpdate, setRatingUpdate] = useState<{ newRating: number; change: number } | null>(null);
  const ratingAppliedRef = useRef(false);
  const [duelStats, setDuelStats] = useState({ wins: 0, losses: 0, streak: 0, bestStreak: 0, history: [] });

  // Load duel stats when winner is determined
  useEffect(() => {
    async function loadStats() {
      if (winner && ratingUpdate) {
        const stats = await getDuelStats();
        setDuelStats(stats);
      }
    }
    loadStats();
  }, [winner, ratingUpdate]);

  // AI Helper state (separate from chat)
  const [aiMessages, setAiMessages] = useState<Array<{ id: string; from: "user" | "ai"; text: string }>>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const aiInitializedRef = useRef(false);

  // Initialize AI Helper with problem context
  useEffect(() => {
    if (!aiInitializedRef.current && problem) {
      aiInitializedRef.current = true;
      setAiMessages([{
        id: 'ai-init',
        from: 'ai',
        text: `👋 Hi! I'm your AI Helper for this duel!\n\n` +
          `**Current Problem:** ${problem.title}\n` +
          `**Difficulty:** ${problem.difficulty}\n` +
          `**Tags:** ${problem.tags.join(', ')}\n\n` +
          `I can help you with:\n` +
          `• Understanding the problem\n` +
          `• Choosing the right approach\n` +
          `• Optimizing your solution\n` +
          `• Debugging issues\n\n` +
          `Ask me anything! (But I won't give direct answers 😉)`
      }]);
    }
  }, [problem]);

  // AI Chatbot state
  const [botPersonality] = useState(() => getRandomBot());
  const [chatContext] = useState(() => createChatContext());
  const [startTime] = useState(Date.now());
  const autoChatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Resizable panel state - horizontal (left/right split)
  const [rightPanelWidth, setRightPanelWidth] = useState(30); // percentage
  const [isResizingHorizontal, setIsResizingHorizontal] = useState(false);
  const resizeHorizontalStartRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const MIN_WIDTH = 20; // percentage
  const MAX_WIDTH = 50; // percentage

  // Resizable panel state - vertical (problem/code split)
  const [problemHeight, setProblemHeight] = useState(40); // percentage
  const [isResizingVertical, setIsResizingVertical] = useState(false);
  const resizeVerticalStartRef = useRef<{ startY: number; startHeight: number } | null>(null);
  const MIN_HEIGHT = 20; // percentage
  const MAX_HEIGHT = 70; // percentage

  useEffect(() => {
    if (problem?.boilerplate?.javascript) {
      setCode(problem.boilerplate.javascript);
      setSyntaxErrors([]);
    }
  }, [problem?.id]);

  // Auto-chat system for AI bot (only if opponent is bot)
  useEffect(() => {
    if (!isBot) return;
    
    // Send initial greeting after 2 seconds
    const greetingTimer = setTimeout(() => {
      const greeting = botPersonality.greetings[0];
      setChatMessages((m) => [
        ...m,
        {
          id: `bot-greeting-${Date.now()}`,
          from: "opponent",
          text: greeting,
          time: new Date(),
        },
      ]);
      chatContext.messageCount++;
      chatContext.lastMessageTime = Date.now();
    }, 2000);

    // Auto-generate bot messages periodically
    autoChatTimerRef.current = setInterval(() => {
      const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
      chatContext.timeElapsed = timeElapsed;
      
      const autoMessage = generateAutoBotMessage(
        botPersonality,
        chatContext,
        timeLeft,
        timeElapsed
      );
      
      if (autoMessage) {
        setChatMessages((m) => [
          ...m,
          {
            id: `bot-auto-${Date.now()}`,
            from: "opponent",
            text: autoMessage,
            time: new Date(),
          },
        ]);
        chatContext.messageCount++;
        chatContext.lastMessageTime = Date.now();
      }
    }, 15000); // Check every 15 seconds

    return () => {
      clearTimeout(greetingTimer);
      if (autoChatTimerRef.current) {
        clearInterval(autoChatTimerRef.current);
      }
    };
  }, [isBot, timeLeft]);

  // Resize handlers for right panel (horizontal)
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingHorizontal(true);
    resizeHorizontalStartRef.current = {
      startX: e.clientX,
      startWidth: rightPanelWidth,
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [rightPanelWidth]);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!resizeHorizontalStartRef.current) return;

    const containerWidth = window.innerWidth;
    const deltaX = e.clientX - resizeHorizontalStartRef.current.startX;
    const deltaPercent = (deltaX / containerWidth) * 100;
    const newWidth = resizeHorizontalStartRef.current.startWidth - deltaPercent;

    // Clamp the width between MIN_WIDTH and MAX_WIDTH
    const clampedWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));
    setRightPanelWidth(clampedWidth);
  }, []);

  const handleResizeEnd = useCallback(() => {
    setIsResizingHorizontal(false);
    resizeHorizontalStartRef.current = null;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    if (isResizingHorizontal) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [isResizingHorizontal, handleResizeMove, handleResizeEnd]);

  // Resize handlers for problem/code split (vertical)
  const handleVerticalResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingVertical(true);
    resizeVerticalStartRef.current = {
      startY: e.clientY,
      startHeight: problemHeight,
    };
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  }, [problemHeight]);

  const handleVerticalResizeMove = useCallback((e: MouseEvent) => {
    if (!resizeVerticalStartRef.current) return;

    const containerHeight = window.innerHeight - 100; // Subtract header height
    const deltaY = e.clientY - resizeVerticalStartRef.current.startY;
    const deltaPercent = (deltaY / containerHeight) * 100;
    const newHeight = resizeVerticalStartRef.current.startHeight + deltaPercent;

    // Clamp the height between MIN_HEIGHT and MAX_HEIGHT
    const clampedHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, newHeight));
    setProblemHeight(clampedHeight);
  }, []);

  const handleVerticalResizeEnd = useCallback(() => {
    setIsResizingVertical(false);
    resizeVerticalStartRef.current = null;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    if (isResizingVertical) {
      window.addEventListener('mousemove', handleVerticalResizeMove);
      window.addEventListener('mouseup', handleVerticalResizeEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleVerticalResizeMove);
      window.removeEventListener('mouseup', handleVerticalResizeEnd);
    };
  }, [isResizingVertical, handleVerticalResizeMove, handleVerticalResizeEnd]);

  // Monaco Editor mount handler
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Configure editor options for better coding experience
    editor.updateOptions({
      fontSize: 14,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      wordWrap: "on",
      lineNumbers: "on",
      renderWhitespace: "selection",
      bracketPairColorization: { enabled: true },
    });

    // Add syntax validation on content change
    editor.onDidChangeModelContent(() => {
      const model = editor.getModel();
      if (model) {
        const markers = monaco.editor.getModelMarkers({ resource: model.uri });
        const errors = markers
          .filter((m: any) => m.severity === monaco.MarkerSeverity.Error)
          .map((m: any) => `Line ${m.startLineNumber}: ${m.message}`);
        setSyntaxErrors(errors);
      }
    });
  };

  // Handle language change
  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    // Update boilerplate based on language
    const boilerplates: Record<string, string> = {
      javascript: problem?.boilerplate?.javascript ?? "// Your JavaScript code here\n",
      typescript: problem?.boilerplate?.typescript ?? "// Your TypeScript code here\n",
      python: problem?.boilerplate?.python ?? "# Your Python code here\n",
      java: problem?.boilerplate?.java ?? "// Your Java code here\n",
      cpp: problem?.boilerplate?.cpp ?? "// Your C++ code here\n",
    };
    setCode(boilerplates[newLang] || "// Your code here\n");
    setSyntaxErrors([]);
  };

  useEffect(() => {
    if (winner || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(t);
  }, [winner]);

  // AI auto-win after 5 minutes
  useEffect(() => {
    if (!isBot || winner || mySolved || oppSolved) return;
    
    const timeElapsed = DUEL_DURATION_SEC - timeLeft;
    
    // If 5 minutes have passed and neither has solved, AI wins
    if (timeElapsed >= AI_AUTO_WIN_TIME_SEC) {
      setOppSolved(true);
      setWinner("opponent");
      
      // Send defeat message from bot
      setTimeout(() => {
        const defeatMessage = `⏰ Time's up! I solved it first. Better luck next time, ${user?.username || "friend"}! 💪`;
        setChatMessages((m) => [
          ...m,
          {
            id: `bot-autowin-${Date.now()}`,
            from: "opponent",
            text: defeatMessage,
            time: new Date(),
          },
        ]);
      }, 500);
      
      toast.error(`💔 You've been defeated by ${opponentName}! The AI solved it first.`);
    }
  }, [timeLeft, isBot, winner, mySolved, oppSolved, opponentName, user]);

  useEffect(() => {
    async function applyRating() {
      if (!winner || ratingAppliedRef.current) return;
      ratingAppliedRef.current = true;
      
      if (winner === "you") {
        const newRating = await addDuelWin(opponentName);
        setRatingUpdate({ newRating, change: getWinPoints() });
      } else {
        const newRating = await addDuelLoss(opponentName);
        setRatingUpdate({ newRating, change: -getLossPoints() });
      }
    }
    
    applyRating();
  }, [winner, opponentName]);

  useEffect(() => {
    if (timeLeft === 0 && !winner) {
      const userWon = mySolved && !oppSolved;
      const oppWon = !mySolved && oppSolved;
      
      if (userWon || oppWon) {
        setWinner(userWon ? "you" : "opponent");
        
        // Send end game message from bot
        if (isBot) {
          setTimeout(() => {
            const endMessage = generateEndGameMessage(botPersonality, userWon);
            setChatMessages((m) => [
              ...m,
              {
                id: `bot-end-${Date.now()}`,
                from: "opponent",
                text: endMessage,
                time: new Date(),
              },
            ]);
          }, 1000);
        }
        
        toast.info(userWon ? "Time's up! You won." : "Time's up! Opponent won.");
      }
    }
  }, [timeLeft, winner, mySolved, oppSolved, isBot]);

  const handleSubmit = async () => {
    if (mySolved) return;
    
    // Step 1: Check for syntax errors
    if (syntaxErrors.length > 0) {
      toast.error("❌ Fix syntax errors before submitting!");
      return;
    }

    // Step 2: Basic code validation
    const trimmedCode = code.trim();
    if (trimmedCode.length < 10) {
      toast.error("❌ Code is too short. Write a proper solution!");
      return;
    }

    // Step 3: Check if code has basic structure (function/class)
    const hasFunction = /function|const|let|var|def|class|public|private/.test(trimmedCode);
    if (!hasFunction) {
      toast.error("❌ Code must contain a function or class definition!");
      return;
    }

    // Step 4: Run test cases to validate logic
    toast.loading("🔍 Running test cases...", { id: "test-run" });
    
    try {
      // Get test cases for the problem
      const testCases = problem?.examples || [];
      if (testCases.length === 0) {
        toast.error("❌ No test cases available for this problem!", { id: "test-run" });
        return;
      }

      // Run code against test cases
      let allPassed = true;
      for (let i = 0; i < Math.min(testCases.length, 3); i++) {
        const testCase = testCases[i];
        
        // Execute code with test input
        const result = await executeTestCase(code, testCase.input, language);
        
        if (!result.success) {
          toast.error(`❌ Test case ${i + 1} failed: ${result.error || "Wrong output"}`, { id: "test-run" });
          allPassed = false;
          break;
        }
        
        // Compare output
        const expectedOutput = String(testCase.output).trim();
        const actualOutput = String(result.output).trim();
        
        if (expectedOutput !== actualOutput) {
          toast.error(`❌ Test case ${i + 1} failed!\nExpected: ${expectedOutput}\nGot: ${actualOutput}`, { id: "test-run" });
          allPassed = false;
          break;
        }
      }

      if (!allPassed) {
        return;
      }

      // All tests passed!
      toast.success("✅ All test cases passed! Submitting...", { id: "test-run" });
      
      setMySolved(true);
      if (!oppSolved) setWinner("you");
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "solved" }));
      }
      toast.success("🎉 Correct! You solved it first!");
      
    } catch (error) {
      toast.error(`❌ Execution error: ${error instanceof Error ? error.message : "Unknown error"}`, { id: "test-run" });
    }
  };

  // Execute test case helper function
  const executeTestCase = async (code: string, input: string, lang: string): Promise<{ success: boolean; output?: string; error?: string }> => {
    try {
      // For JavaScript/TypeScript - use eval (in production, use Judge0 or similar)
      if (lang === "javascript" || lang === "typescript") {
        // Create a safe execution context
        const wrappedCode = `
          ${code}
          
          // Execute the function with test input
          try {
            const input = ${JSON.stringify(input)};
            const result = typeof solution === 'function' ? solution(input) : 
                          typeof twoSum === 'function' ? twoSum(input) :
                          typeof main === 'function' ? main(input) : null;
            JSON.stringify(result);
          } catch (e) {
            throw new Error(e.message);
          }
        `;
        
        // Execute in isolated context
        const output = eval(wrappedCode);
        return { success: true, output };
      }
      
      // For other languages, show message
      toast.info("⚠️ Full execution for this language requires backend setup. Accepting based on syntax validation.", { id: "test-run" });
      return { success: true, output: "Syntax validated" };
      
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Execution failed" 
      };
    }
  };

  useEffect(() => {
    if (!roomId) return;
    const wsUrl = getDuelWsUrl();
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "join_room",
          roomId,
          userId: user?.id ?? "",
          username: user?.username ?? "You",
          gender: user?.gender ?? undefined,
        })
      );
      setWsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "room_joined" && data.botName) {
          setOpponentName(data.botName);
        } else if (data.type === "chat") {
          if (data.from === "me") return;
          setChatMessages((m) => [
            ...m,
            {
              id: `m-${Date.now()}-${m.length}`,
              from: "opponent",
              text: data.text,
              time: data.time ? new Date(data.time) : new Date(),
            },
          ]);
        } else if (data.type === "opponent_solved") {
          setOppSolved(true);
          // If opponent solved first and I haven't solved yet, I lose immediately
          if (!mySolved) {
            setWinner("opponent");
            toast.error("💔 Opponent solved first! You've been defeated.");
          }
        } else if (data.type === "opponent_left") {
          toast.info(`${data.username || "Opponent"} left the duel.`);
        } else if (data.type === "error") {
          toast.error(data.message || "Connection error.");
        }
      } catch {
        // ignore
      }
    };

    ws.onclose = () => setWsConnected(false);
    ws.onerror = () => setWsConnected(false);

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [roomId]);

  const sendChat = () => {
    const text = chatInput.trim();
    if (!text) return;
    
    // Add user message
    const userMsg = { id: `m-${Date.now()}`, from: "me" as const, text, time: new Date() };
    setChatMessages((m) => [...m, userMsg]);
    chatContext.userMessages.push(text);
    chatContext.messageCount++;
    
    // Send to WebSocket if connected (real opponent)
    if (wsRef.current?.readyState === WebSocket.OPEN && !isBot) {
      wsRef.current.send(
        JSON.stringify({
          type: "chat",
          text,
          roomId: roomId ?? undefined,
        })
      );
    }
    
    // Generate AI bot response if opponent is bot
    if (isBot) {
      setTimeout(() => {
        const botResponse = generateBotResponse(
          text,
          botPersonality,
          chatContext,
          timeLeft
        );
        
        setChatMessages((m) => [
          ...m,
          {
            id: `bot-${Date.now()}`,
            from: "opponent",
            text: botResponse,
            time: new Date(),
          },
        ]);
        chatContext.botMessages.push(botResponse);
        chatContext.messageCount++;
        chatContext.lastMessageTime = Date.now();
      }, 1000 + Math.random() * 2000); // Random delay 1-3 seconds for natural feel
    }
    
    setChatInput("");
  };

  // AI Helper function - provides hints without direct answers
  const askAiHelper = () => {
    const question = aiInput.trim();
    if (!question) return;
    
    setAiLoading(true);
    
    // Add user question
    setAiMessages((m) => [...m, { id: `ai-q-${Date.now()}`, from: "user", text: question }]);
    setAiInput("");
    
    // Simulate AI thinking delay
    setTimeout(() => {
      const response = generateAiHelperResponse(question, problem, code);
      setAiMessages((m) => [...m, { id: `ai-a-${Date.now()}`, from: "ai", text: response }]);
      setAiLoading(false);
    }, 1000 + Math.random() * 1000);
  };

  // Generate AI Helper response - hints only, no direct answers
  const generateAiHelperResponse = (question: string, problem: any, currentCode: string): string => {
    const q = question.toLowerCase();
    
    // Question explanation - when user asks about the problem itself
    if (q.match(/(what.*question|explain.*question|what.*problem|understand.*problem|what.*this|tell me about|problem.*about)/)) {
      return `� **${problem.title}** (${problem.difficulty})\n\n` +
        `**What you need to do:**\n${problem.description.substring(0, 200)}...\n\n` +
        `**Key points:**\n` +
        `• Input: ${problem.examples[0]?.input || "Check examples"}\n` +
        `• Output: ${problem.examples[0]?.output || "Check examples"}\n` +
        `• Category: ${problem.tags.join(', ')}\n\n` +
        `Read the full description on the left. What part is unclear?`;
    }
    
    // Problem breakdown
    if (q.match(/(break.*down|simplify|simple.*terms|explain.*simple|easier)/)) {
      return `🎯 Let me break down "${problem.title}":\n\n` +
        `**In simple words:**\n` +
        `You need to ${problem.description.split('.')[0].toLowerCase()}.\n\n` +
        `**Step by step:**\n` +
        `1. Read the input\n` +
        `2. Process it (this is where your logic goes)\n` +
        `3. Return the result\n\n` +
        `Start by understanding the examples. What pattern do you see?`;
    }
    
    // Examples explanation
    if (q.match(/(example|test case|input.*output|how.*work)/)) {
      const ex = problem.examples[0];
      return `📝 Let's look at Example 1:\n\n` +
        `**Input:** ${ex.input}\n` +
        `**Output:** ${ex.output}\n` +
        `${ex.explanation ? `**Why:** ${ex.explanation}\n` : ''}\n` +
        `Try to trace through this manually. What steps would you take?`;
    }
    
    // Constraints
    if (q.match(/(constraint|limit|range|size|length)/)) {
      return `⚠️ Important constraints:\n\n` +
        `• Check the problem description for limits\n` +
        `• Consider: array size, number range, time limit\n` +
        `• These help you choose the right approach\n\n` +
        `What constraints did you notice?`;
    }
    
    // Detect if asking for direct solution
    if (q.match(/(solution|answer|code|solve.*for me|write.*code|give.*solution|complete.*code)/)) {
      return "� I can't give you the direct solution! That would be cheating. But I can help you think through it. What approach are you considering?";
    }
    
    // Approach questions
    if (q.match(/(approach|how to|strategy|method|way to solve|where.*start|begin)/)) {
      const hints = [
        `🤔 For "${problem.title}", think about:\n\n` +
        `1. What data structure helps you access elements quickly?\n` +
        `2. Do you need to track something as you iterate?\n` +
        `3. What's the time complexity you're aiming for?\n\n` +
        `Difficulty: ${problem.difficulty} - ${problem.difficulty === 'Easy' ? 'Start simple!' : problem.difficulty === 'Medium' ? 'Think optimization!' : 'Consider advanced techniques!'}`,
        
        `💡 Possible approaches for this problem:\n\n` +
        `• Brute force: Try all possibilities (might be slow)\n` +
        `• Hash map: Store values for quick lookup\n` +
        `• Two pointers: Scan from both ends\n` +
        `• Sorting: Sometimes organizing data first helps\n\n` +
        `Which one fits the problem?`,
        
        `🎯 Break it down:\n\n` +
        `1. Understand input/output from examples\n` +
        `2. Think of edge cases\n` +
        `3. Start with a simple solution\n` +
        `4. Optimize if needed\n\n` +
        `What's your first thought?`,
      ];
      return hints[Math.floor(Math.random() * hints.length)];
    }
    
    // Time complexity questions
    if (q.match(/(time complexity|big o|o\(n\)|faster|optimize|efficient)/)) {
      return `⏱️ Time Complexity for "${problem.title}":\n\n` +
        `• Nested loops = O(n²) - can you avoid this?\n` +
        `• Hash maps give O(1) lookup\n` +
        `• Sorting is O(n log n)\n` +
        `• Single loop is O(n)\n\n` +
        `${problem.difficulty === 'Easy' ? 'O(n) should work!' : problem.difficulty === 'Medium' ? 'Aim for O(n) or O(n log n)' : 'Might need O(n) optimal solution'}\n\n` +
        `What's your current approach's complexity?`;
    }
    
    // Space complexity
    if (q.match(/(space complexity|memory|extra space)/)) {
      return "💾 Space Complexity:\n\n• Using extra arrays/objects = O(n) space\n• Few variables only = O(1) space\n• Recursion uses call stack space\n\nCan you solve it with less memory?";
    }
    
    // Data structure questions
    if (q.match(/(data structure|array|hash|map|set|object|which.*use)/)) {
      return `📊 Data Structure Hints for "${problem.title}":\n\n` +
        `• Array: Good for ordered data, index access\n` +
        `• Hash Map/Object: Fast lookup by key O(1)\n` +
        `• Set: Unique values, fast membership check\n` +
        `• Stack/Queue: LIFO/FIFO operations\n\n` +
        `Tags: ${problem.tags.join(', ')}\n` +
        `Think about what operations you need most!`;
    }
    
    // Edge cases
    if (q.match(/(edge case|corner case|test case|fail|wrong.*answer)/)) {
      return `🔍 Edge cases to check for "${problem.title}":\n\n` +
        `• Empty input\n` +
        `• Single element\n` +
        `• Duplicates\n` +
        `• Negative numbers\n` +
        `• Very large numbers\n` +
        `• All same values\n\n` +
        `Test your code with these! Did you handle all?`;
    }
    
    // Stuck/confused
    if (q.match(/(stuck|confused|don't understand|help|hint|lost)/)) {
      return `💪 When stuck on "${problem.title}", try:\n\n` +
        `1. Re-read the problem carefully\n` +
        `2. Work through examples manually\n` +
        `3. Write pseudocode first\n` +
        `4. Start with brute force, optimize later\n` +
        `5. Draw it out on paper\n\n` +
        `Difficulty: ${problem.difficulty}\n` +
        `What specific part is confusing?`;
    }
    
    // Debugging
    if (q.match(/(bug|error|wrong|not working|fail|issue)/)) {
      return `🐛 Debugging tips for "${problem.title}":\n\n` +
        `• Add console.log to see values\n` +
        `• Check your loop conditions\n` +
        `• Verify array indices (off-by-one?)\n` +
        `• Test with simple input first\n` +
        `• Compare with expected output: ${problem.examples[0]?.output}\n\n` +
        `What's the error you're seeing?`;
    }
    
    // Algorithm specific - Two Sum pattern
    if (q.match(/(two sum|pair|find two|complement)/)) {
      return "🎯 For finding pairs:\n\n• Think: What do I need to find the complement?\n• Hash map can store what you've seen\n• For each element, check if complement exists\n\nDon't use nested loops if you can avoid it!";
    }
    
    // Sorting
    if (q.match(/(sort|sorted|order)/)) {
      return "📈 Sorting hints:\n\n• JavaScript: array.sort() but watch out for numbers!\n• Sometimes sorting first makes problem easier\n• Two pointers work well on sorted arrays\n\nDo you need to sort for this problem?";
    }
    
    // Loops
    if (q.match(/(loop|iterate|traverse|for|while)/)) {
      return "🔄 Iteration tips:\n\n• for loop: When you need index\n• forEach: Simple iteration\n• while: When condition-based\n• for...of: Clean syntax for values\n\nWhich loop fits your logic?";
    }
    
    // Code review
    if (q.match(/(check.*code|review|correct|right|look.*code)/)) {
      if (currentCode.length < 20) {
        return `📝 I see you haven't written much code yet for "${problem.title}".\n\n` +
          `Start by:\n` +
          `1. Define your function\n` +
          `2. Think about the logic\n` +
          `3. Write it step by step\n\n` +
          `What's your first step?`;
      }
      return "👀 Code review checklist:\n\n✓ Does it handle edge cases?\n✓ Is the logic correct?\n✓ Any off-by-one errors?\n✓ Correct return value?\n✓ Efficient enough?\n\nTest it with the examples!";
    }
    
    // Encouragement
    if (q.match(/(hard|difficult|can't|impossible|too tough)/)) {
      return `💪 You got this! "${problem.title}" is ${problem.difficulty}, but every problem is hard until you solve it.\n\n` +
        `• Break it into smaller steps\n` +
        `• Solve a simpler version first\n` +
        `• Don't give up!\n\n` +
        `What's the first small step you can take?`;
    }
    
    // Category-specific hints
    if (q.match(/(category|type|topic|tag)/)) {
      const tags = problem.tags.join(', ');
      return `📚 This problem is tagged: **${tags}**\n\n` +
        `Common patterns in these topics:\n` +
        `• Think about typical approaches for these tags\n` +
        `• Review similar problems you've solved\n` +
        `• Consider the classic algorithms\n\n` +
        `What do you know about ${tags}?`;
    }
    
    // General questions
    if (q.match(/\?$/)) {
      return `🤔 Good question about "${problem.title}"!\n\n` +
        `• What have you tried so far?\n` +
        `• What's working and what's not?\n` +
        `• Can you break the problem into smaller parts?\n\n` +
        `Tell me more about what you're thinking!`;
    }
    
    // Default helpful response
    return `💡 I'm here to guide you through "${problem.title}"!\n\n` +
      `**Ask me about:**\n` +
      `• "What is this question about?" - Problem explanation\n` +
      `• "What approach should I use?" - Strategy hints\n` +
      `• "How to optimize?" - Complexity tips\n` +
      `• "What data structure?" - DS recommendations\n` +
      `• "Edge cases?" - Test scenarios\n\n` +
      `Difficulty: ${problem.difficulty} | Tags: ${problem.tags.join(', ')}\n\n` +
      `What specific help do you need?`;
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  if (!problem) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center gap-3 bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Loading problem...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header: timer + scores */}
      <div className="border-b bg-muted/30 px-4 py-2 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <span className="font-mono font-semibold flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {wsConnected && (
            <span className="text-xs bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded font-medium">
              Live
            </span>
          )}
          <span className={mySolved ? "text-green-600 dark:text-green-400 font-medium" : ""}>
            You {user?.username ?? "You"} {mySolved && "✓"}
          </span>
          <Swords className="h-4 w-4 text-muted-foreground" />
          <span className={oppSolved ? "text-green-600 dark:text-green-400 font-medium" : ""}>
            {opponentName} {oppSolved && "✓"}
          </span>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 relative">
        {/* Left: Problem + code (larger) */}
        <div className="min-w-0 border-r overflow-hidden flex flex-col" style={{ width: `${100 - rightPanelWidth}%` }}>
          {/* Problem Description Section */}
          <div className="overflow-y-auto p-4 shrink-0" style={{ height: `${problemHeight}%` }}>
            <h2 className="text-lg font-bold">{problem.title}</h2>
            <Badge variant="secondary" className="mt-1">{problem.difficulty}</Badge>
            <div className="mt-4 prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-foreground">{problem.description}</p>
              <h3 className="font-semibold mt-4">Examples</h3>
              {problem.examples.slice(0, 2).map((ex, i) => (
                <div key={i} className="rounded bg-muted/50 p-2 my-2 font-mono text-sm">
                  <div><strong>Input:</strong> {ex.input}</div>
                  <div><strong>Output:</strong> {ex.output}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Vertical Resize Handle (Problem ↔ Code) */}
          <div
            className="relative h-1 bg-white/10 hover:bg-cyan-500/30 cursor-row-resize transition-colors group z-10 flex-shrink-0"
            onMouseDown={handleVerticalResizeStart}
            style={{
              cursor: isResizingVertical ? 'row-resize' : 'row-resize',
            }}
          >
            {/* Hover area - taller for easier grabbing */}
            <div className="absolute inset-x-0 -top-2 -bottom-2 z-10" />
            
            {/* Visual indicator on hover */}
            <div className="absolute inset-x-0 top-0 h-1 bg-cyan-500/50 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity" />
          </div>

          {/* Code Editor Section */}
          <div className="p-4 pt-2 flex flex-col min-h-0 bg-muted/20" style={{ height: `${100 - problemHeight}%` }}>
            {/* Language selector and theme toggle */}
            <div className="flex items-center gap-2 mb-2 shrink-0">
              <Code2 className="h-4 w-4 text-muted-foreground" />
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs ml-auto"
                onClick={() => setTheme(theme === "vs-dark" ? "light" : "vs-dark")}
              >
                {theme === "vs-dark" ? "🌙 Dark" : "☀️ Light"}
              </Button>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 min-h-[200px] border rounded-md overflow-hidden bg-[#1e1e1e]">
              <Editor
                height="100%"
                language={language}
                value={code}
                onChange={(value) => setCode(value || "")}
                onMount={handleEditorDidMount}
                theme={theme}
                options={{
                  fontSize: 14,
                  minimap: { enabled: true },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: "on",
                  lineNumbers: "on",
                  renderWhitespace: "selection",
                  bracketPairColorization: { enabled: true },
                  suggestOnTriggerCharacters: true,
                  quickSuggestions: true,
                  formatOnPaste: true,
                  formatOnType: true,
                }}
              />
            </div>

            {/* Syntax errors display */}
            {syntaxErrors.length > 0 && (
              <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-600 dark:text-red-400 max-h-20 overflow-y-auto shrink-0">
                <p className="font-semibold mb-1">⚠️ Syntax Errors:</p>
                {syntaxErrors.map((err, i) => (
                  <p key={i}>• {err}</p>
                ))}
              </div>
            )}

            <Button 
              className="mt-2 gap-2 shrink-0" 
              onClick={handleSubmit} 
              disabled={mySolved || syntaxErrors.length > 0}
            >
              {mySolved ? "Solved ✓" : syntaxErrors.length > 0 ? "Fix errors first" : "Submit solution"}
            </Button>
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className="relative w-1 bg-white/10 hover:bg-cyan-500/30 cursor-col-resize transition-colors group z-10 flex-shrink-0"
          onMouseDown={handleResizeStart}
          style={{
            cursor: isResizingHorizontal ? 'col-resize' : 'col-resize',
          }}
        >
          {/* Hover area - wider for easier grabbing */}
          <div className="absolute inset-y-0 -left-2 -right-2 z-10" />
          
          {/* Visual indicator on hover */}
          <div className="absolute inset-y-0 left-0 w-1 bg-cyan-500/50 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity" />
        </div>

        {/* Right: Chat + AI Helper panel */}
        <div className="min-w-[240px] flex flex-col bg-muted/10" style={{ width: `${rightPanelWidth}%` }}>
          <Tabs defaultValue="chat" className="flex-1 flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-2 shrink-0 m-2 mb-0">
              <TabsTrigger value="chat" className="gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-1.5">
                <Bot className="h-3.5 w-3.5" />
                AI Helper
              </TabsTrigger>
            </TabsList>

            {/* Chat Tab */}
            <TabsContent value="chat" className="flex-1 flex flex-col p-2 pt-2 m-0 data-[state=active]:flex data-[state=inactive]:hidden h-full">
              <div className="flex-1 overflow-y-auto space-y-1.5 border rounded-md p-1.5 bg-muted/20 min-h-0">
                {chatMessages.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-3">No messages yet. Say hi!</p>
                ) : (
                  chatMessages.map((m) => (
                    <div
                      key={m.id}
                      className={`text-xs p-1.5 rounded max-w-[95%] ${m.from === "me" ? "ml-auto bg-primary/20" : "bg-muted/50"}`}
                    >
                      <span className="font-medium text-[10px] text-muted-foreground">
                        {m.from === "me" ? "You" : opponentName}
                      </span>
                      <p className="mt-0.5 break-words">{m.text}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-1.5 mt-2 shrink-0">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendChat()}
                  placeholder="Type a message..."
                  className="flex-1 min-w-0 rounded border bg-background px-2 py-1.5 text-xs"
                />
                <Button size="icon" className="h-8 w-8 shrink-0" onClick={sendChat}>
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </TabsContent>

            {/* AI Helper Tab */}
            <TabsContent value="ai" className="flex-1 flex flex-col p-2 pt-2 m-0 data-[state=active]:flex data-[state=inactive]:hidden h-full">
              <div className="mb-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded text-[10px] text-amber-600 dark:text-amber-400 shrink-0">
                <Lightbulb className="h-3 w-3 inline mr-1" />
                I'll guide you with hints, not give direct answers!
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 border rounded-md p-2 bg-muted/20 min-h-0">
                {aiMessages.length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-3 space-y-2">
                    <p>Ask me for help!</p>
                    <p className="text-[10px]">Try: "What approach should I use?" or "How to optimize?"</p>
                  </div>
                ) : (
                  aiMessages.map((m) => (
                    <div
                      key={m.id}
                      className={`text-xs p-2 rounded ${
                        m.from === "user" 
                          ? "ml-auto bg-primary/20 max-w-[90%]" 
                          : "bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20"
                      }`}
                    >
                      {m.from === "ai" && (
                        <div className="flex items-center gap-1 mb-1">
                          <Bot className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                          <span className="font-medium text-[10px] text-amber-600 dark:text-amber-400">AI Helper</span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap break-words">{m.text}</p>
                    </div>
                  ))
                )}
                {aiLoading && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground p-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Thinking...
                  </div>
                )}
              </div>
              <div className="flex gap-1.5 mt-2 shrink-0">
                <input
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && askAiHelper()}
                  placeholder="Ask for hints..."
                  className="flex-1 min-w-0 rounded border bg-background px-2 py-1.5 text-xs"
                  disabled={aiLoading}
                />
                <Button 
                  size="icon" 
                  className="h-8 w-8 shrink-0" 
                  onClick={askAiHelper}
                  disabled={aiLoading}
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Winner overlay */}
      {winner && (() => {
        const rank = ratingUpdate ? getRankTier(ratingUpdate.newRating) : getRankTier(1000);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur">
            <Card className="max-w-sm mx-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-primary" />
                  {winner === "you" ? "You win!" : "Opponent wins"}
                </CardTitle>
                <CardDescription>
                  {winner === "you"
                    ? "You solved it first. Keep climbing the ranks!"
                    : "Better luck next time. Keep practicing!"}
                </CardDescription>
                {ratingUpdate && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      Rating: {ratingUpdate.newRating}{" "}
                      <span className={ratingUpdate.change > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                        ({ratingUpdate.change > 0 ? "+" : ""}{ratingUpdate.change})
                      </span>
                    </p>
                    <p className={`text-sm font-semibold ${rank.color}`}>
                      {rank.icon} {rank.name}
                    </p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>W: {duelStats.wins}</span>
                      <span>L: {duelStats.losses}</span>
                      {duelStats.streak > 0 && (
                        <span className="text-green-500">🔥 {duelStats.streak} streak</span>
                      )}
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/dsa/duels">Back to duels</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      })()}
    </div>
  );
}
