/**
 * STABLE HYBRID CHATBOT COMPONENT
 * - NEVER shows "Service Down" messages
 * - Always calls Netlify function for every message
 * - Clean error handling with no red console errors
 * - Mobile-responsive design
 */

import { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';

// Message interface
interface Message {
  from: 'user' | 'bot';
  text: string;
  source?: 'knowledge' | 'api' | 'fallback';
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { from: 'bot', text: "Hey there! 👋 I'm Nova, your TechMasterAI assistant!" },
    { from: 'bot', text: "I know everything about TechMasterAI - our team, features, and mission. Ask me anything! 🚀" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastRequestTimeRef = useRef<number>(0);

  // Open when AI button is clicked from header or coding places
  useEffect(() => {
    const open = () => setIsOpen(true);
    window.addEventListener('open-chatbot', open);
    return () => window.removeEventListener('open-chatbot', open);
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Debounce function to prevent rapid requests
  const debounce = (func: (...args: unknown[]) => void, delay: number) => {
    return (...args: unknown[]) => {
      const now = Date.now();
      if (now - lastRequestTimeRef.current >= delay) {
        lastRequestTimeRef.current = now;
        func(...args);
      }
    };
  };

  // Handle sending message - ALWAYS calls Netlify function
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { from: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare conversation history (last 5 messages)
      const conversationHistory = messages.slice(-5);

      // Call Netlify function for EVERY message
      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sessionId,
          conversationHistory,
        }),
      });

      const data = await response.json();

      // Handle response - always successful due to function design
      if (response.ok && data.response) {
        setMessages(prev => [...prev, { 
          from: 'bot', 
          text: data.response,
          source: data.source || 'api'
        }]);
      } else {
        // Fallback response if something goes wrong
        setMessages(prev => [...prev, {
          from: 'bot',
          text: "I'm here to help! Try asking me about TechMasterAI, our features, team, or how to get started. What would you like to know? 🚀",
          source: 'fallback'
        }]);
      }
    } catch (error) {
      // Network error - provide helpful fallback
      setMessages(prev => [...prev, {
        from: 'bot',
        text: "I'm Nova from TechMasterAI! 🤖 I'm having trouble connecting right now, but I'd love to help you learn about our competitive programming platform. Try asking me about our features or team!",
        source: 'fallback'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced send handler
  const debouncedSend = debounce(handleSend, 500);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      debouncedSend();
    }
  };

  // Get source label for messages
  const getSourceLabel = (source?: string) => {
    switch (source) {
      case 'knowledge': return '📚 Knowledge Base';
      case 'api': return '🤖 AI Assistant';
      case 'fallback': return '💬 Assistant';
      default: return '🤖 AI Assistant';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-80 h-96 glass-panel rounded-lg flex flex-col neon-border shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-primary/30 bg-gradient-to-r from-primary/10 to-secondary/10">
            <span className="font-orbitron text-sm neon-text">Nova</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-primary transition-colors hover:bg-primary/10 rounded p-1"
              style={{ color: '#9CA3AF' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="px-3 py-2 border-b border-primary/30">
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setInput("What is TechMasterAI?")}
                className="text-xs px-2 py-1 bg-primary/10 border border-primary/30 rounded text-primary hover:bg-primary/20 transition-colors"
              >
                About Us
              </button>
              <button
                onClick={() => setInput("Who is the founder?")}
                className="text-xs px-2 py-1 bg-primary/10 border border-primary/30 rounded text-primary hover:bg-primary/20 transition-colors"
              >
                Founder
              </button>
              <button
                onClick={() => setInput("What features do you offer?")}
                className="text-xs px-2 py-1 bg-primary/10 border border-primary/30 rounded text-primary hover:bg-primary/20 transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => setInput("How can I join?")}
                className="text-xs px-2 py-1 bg-primary/10 border border-primary/30 rounded text-primary hover:bg-primary/20 transition-colors"
              >
                Join Us
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg text-sm break-words ${
                    msg.from === 'user'
                      ? 'bg-primary/20 border border-primary/50 text-primary'
                      : 'bg-secondary/20 border border-secondary/50 text-secondary'
                  }`}
                >
                  {msg.text}
                  {/* Non-intrusive source indicator */}
                  {msg.from === 'bot' && msg.source && (
                    <div className="text-xs opacity-40 mt-1">
                      {getSourceLabel(msg.source)}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-secondary/20 border border-secondary/50 px-3 py-2 rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <img 
                      src="/loading.gif"
                      alt="Loading..." 
                      className="w-8 h-6"
                      style={{ 
                        imageRendering: 'auto',
                        objectFit: 'contain'
                      }}
                      onError={(e) => {
                        // Fallback to CSS animation if GIF fails
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    {/* CSS fallback animation */}
                    <div className="hidden gap-1">
                      <div className="w-2 h-2 bg-secondary rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-secondary rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-secondary rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                    </div>
                    <span className="text-secondary text-xs">Nova is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-primary/30 bg-gradient-to-r from-primary/5 to-secondary/5">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="flex-1 cyber-input px-3 py-2 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-foreground/5 border border-primary/30 focus:border-primary/60 focus:outline-none transition-colors"
              />
              <button
                onClick={debouncedSend}
                disabled={isLoading || !input.trim()}
                className="p-2 bg-primary/20 border border-primary rounded hover:bg-primary/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} className="text-primary" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative animate-float-gentle">
          {/* Outer glowing ring */}
          <div className="absolute -inset-2 w-24 h-24 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse-glow blur-md"></div>
          
          {/* Middle glowing ring */}
          <div className="absolute -inset-1 w-22 h-22 rounded-full bg-gradient-to-r from-primary/30 to-secondary/30 animate-pulse blur-sm"></div>
          
          {/* Main button */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary/50 via-primary/40 to-secondary/50 border-2 border-primary/70 flex items-center justify-center hover:scale-110 hover:border-primary transition-all duration-300 p-2 shadow-2xl backdrop-blur-sm animate-chatbot-glow"
            style={{ 
              background: 'radial-gradient(circle at 30% 30%, rgba(0, 194, 255, 0.6), rgba(0, 194, 255, 0.3), rgba(63, 188, 229, 0.4))',
              boxShadow: '0 0 30px rgba(0, 194, 255, 0.5), 0 0 60px rgba(0, 194, 255, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 shadow-inner">
              <img 
                src="/loading.gif" 
                alt="Open Chat" 
                className="w-full h-full object-cover"
                style={{ 
                  imageRendering: 'auto',
                  objectFit: 'cover',
                  filter: 'brightness(1.1) contrast(1.1) saturate(1.1)'
                }}
                onError={(e) => {
                  // Fallback to chat icon if GIF fails
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-full h-full rounded-full bg-primary/30 border-2 border-primary/60 flex items-center justify-center">
                        <svg class="text-white" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                      </div>
                    `;
                  }
                }}
              />
            </div>
          </button>
          
          {/* Floating notification dot */}
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-green-500 rounded-full border-2 border-white flex items-center justify-center animate-bounce shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;