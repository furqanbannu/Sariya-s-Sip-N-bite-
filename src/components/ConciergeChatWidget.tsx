import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  Compass,
  Mountain,
  ChevronDown,
  RefreshCw,
  Utensils,
  CloudFog,
  Hotel,
  Calendar,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'concierge';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  {
    icon: Utensils,
    label: 'Signature Dishes',
    prompt: 'What are the chef’s top signature dishes and prices at Sariya’s Sip N Bite?',
  },
  {
    icon: CloudFog,
    label: 'Murree Weather',
    prompt: 'What is the current mountain weather in Murree and which dishes pair best with it?',
  },
  {
    icon: Hotel,
    label: 'Hotel & Hours',
    prompt: 'Tell me about dining hours and room service at Lucky Kabana Hotel on Mall Road.',
  },
  {
    icon: Calendar,
    label: 'Seating & Booking',
    prompt: 'How can I reserve a table with a Terrace View or by the Fireplace Hearth?',
  },
];

export const ConciergeChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'concierge',
      text: "Greetings and welcome to Sariya's Sip N Bite inside Lucky Kabana Hotel on Mall Road, Murree (2,291m). I am your AI Concierge, ready to guide you through our gastronomic menu, table reservations, and high-altitude weather pairings. How may I be of service today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      // Build conversation history for the backend
      const historyPayload = messages.slice(-5).map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        text: m.text,
      }));

      const res = await fetch('/api/concierge-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
        }),
      });

      if (!res.ok) {
        throw new Error('Concierge service responded with error status');
      }

      const data = await res.json();
      const replyText =
        data.reply ||
        "I am at your service at Sariya's Sip N Bite on Mall Road. Please let me know how I can assist your visit or dining experience!";

      const conciergeMessage: ChatMessage = {
        id: `concierge-${Date.now()}`,
        sender: 'concierge',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, conciergeMessage]);
      if (!isOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Failed to communicate with concierge:', err);
      // Graceful fallback
      const fallbackMessage: ChatMessage = {
        id: `concierge-err-${Date.now()}`,
        sender: 'concierge',
        text: "Our mountain kitchen on Mall Road (2,291m) features our signature Italian Chicken Steak (Rs 950), Malai Boti Pizza (Rs 890), and hot Kashmiri Noon Chai (Rs 240). You can also reserve tables with our interactive seating map above!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-40 select-none">
      {/* Expanded Concierge Chat Window */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2rem)] sm:w-[410px] max-w-[420px] h-[540px] max-h-[82vh] bg-[#12141a] border border-[#2b2e3b] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#171a24] via-[#151720] to-[#101218] border-b border-[#242836] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-[#1c202d] border border-[#c5a880]/60 flex items-center justify-center text-[#c5a880] shadow-md shrink-0">
                <Sparkles className="w-5 h-5 text-[#c5a880]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-display text-base font-semibold text-[#f3ede4] leading-tight">
                    Murree AI Concierge
                  </h4>
                  <span className="w-2 h-2 rounded-full bg-[#7fb385] animate-ping" />
                </div>
                <p className="text-[11px] text-[#9a9488] flex items-center gap-1.5 mt-0.5">
                  <span>Lucky Kabana Hotel</span>
                  <span className="text-[#59554d]">·</span>
                  <span className="font-mono text-[#c5a880]">2,291m Mall Rd</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-[#8a857b] hover:text-[#ede8e1] transition-colors"
                aria-label="Close Concierge Chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Info Ribbon */}
          <div className="px-3.5 py-1.5 bg-[#0e1017] border-b border-[#1f222d] text-[10px] text-[#8a857b] flex items-center justify-between font-mono">
            <span className="flex items-center gap-1 text-[#c5a880]">
              <Compass className="w-3 h-3" />
              <span>Gemini AI Assistant</span>
            </span>
            <span>Murree Kitchen Active</span>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 leading-relaxed ${
                      isUser
                        ? 'bg-[#c5a880] text-[#0e0f12] font-medium shadow-md'
                        : 'bg-[#181b25] border border-[#272b3a] text-[#ede8e1] shadow-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <span className="text-[9px] font-mono text-[#6e6a62] mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-[#8a857b] p-2 bg-[#141620] border border-[#232734] w-fit">
                <RefreshCw className="w-3.5 h-3.5 text-[#c5a880] animate-spin" />
                <span className="font-mono text-[11px] text-[#c5a880]">
                  Concierge is composing advice...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 pt-2 pb-1 border-t border-[#1f222e] bg-[#0f1118]">
            <span className="text-[10px] uppercase tracking-wider text-[#78746c] font-mono block mb-1.5">
              Suggested Topics:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
              {QUICK_PROMPTS.map((qp, idx) => {
                const IconComponent = qp.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(qp.prompt)}
                    disabled={isLoading}
                    className="px-2.5 py-1 text-[11px] bg-[#161922] hover:bg-[#c5a880] text-[#a8a396] hover:text-[#0e0f12] border border-[#262a38] transition-colors whitespace-nowrap flex items-center gap-1 shrink-0"
                  >
                    <IconComponent className="w-3 h-3 text-[#c5a880] group-hover:text-[#0e0f12]" />
                    <span>{qp.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input Box */}
          <div className="p-3 bg-[#13151d] border-t border-[#242836] flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Ask about menu, hotel, or Murree weather..."
              className="flex-1 px-3 py-2 bg-[#0e1016] border border-[#262b3a] text-xs text-[#ede8e1] placeholder-[#6e6a62] focus:border-[#c5a880] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputPrompt.trim() || isLoading}
              className="p-2 bg-[#c5a880] text-[#0e0f12] hover:bg-[#d8ba91] disabled:opacity-40 disabled:hover:bg-[#c5a880] transition-colors shrink-0"
              aria-label="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Toggle Icon (Bottom-Right) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group relative flex items-center gap-2.5 px-4 py-3 bg-[#12141b] hover:bg-[#181b24] border-2 border-[#c5a880] text-[#f3ede4] shadow-2xl transition-all duration-300 hover:scale-105"
        aria-label="Open Hotel & Dining Concierge"
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 text-[#c5a880] group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#7fb385] animate-pulse" />
        </div>

        <div className="text-left hidden sm:block">
          <span className="text-xs font-semibold text-[#f3ede4] block leading-none">
            Concierge Chat
          </span>
          <span className="text-[10px] text-[#c5a880] font-mono leading-none mt-1 block">
            Gemini AI · Murree
          </span>
        </div>

        {unreadCount > 0 && (
          <span className="w-5 h-5 bg-[#c5a880] text-[#0e0f12] text-[10px] font-bold rounded-full flex items-center justify-center font-mono">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};
