import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Lightbulb,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AiCoachMessage } from '../../types';
import { MarkdownText } from '../MarkdownText';

interface AiCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

export const AiCoachModal: React.FC<AiCoachModalProps> = ({
  isOpen,
  onClose,
  initialPrompt,
}) => {
  const { activeBusiness, activeBusinessMetrics, askAiCoach, isAiCoachLoading } = useApp();

  const [messages, setMessages] = useState<AiCoachMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: `Kumusta, student founder! I'm Peanut the Sprout Owl 🦉, your AI business advisor.\n\nI’ve analyzed ${activeBusiness.name}’s live data: You currently have a **${activeBusinessMetrics.profitMargin}% profit margin** and a **Business Health Score of ${activeBusinessMetrics.healthScore}/100**.\n\nWhat can I help you optimize today?`,
      timestamp: new Date().toISOString(),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiCoachLoading]);

  if (!isOpen) return null;

  const quickPrompts = [
    'How do I lower our packaging expenses without looking cheap?',
    'Are our current prices competitive yet sustainable for a student?',
    'Give me a pre-order drop strategy for campus midterms week.',
    'How do I calculate labor cost for handmade crafts?',
  ];

  const handleSendMessage = async (promptToSend?: string) => {
    const text = promptToSend || inputPrompt;
    if (!text.trim() || isAiCoachLoading) return;

    const userMsg: AiCoachMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');

    // Reuses the same askAiCoach action IosAiCoachTab uses (which manages
    // its own isAiCoachLoading flag), rather than a separate fetch call —
    // this modal used to POST a differently-shaped body
    // ({ prompt, businessData }) than the server expects and read a `reply`
    // field the server never returns, so it always silently fell through to
    // its own generic hardcoded line regardless of the question or the
    // business's actual data.
    const { advice } = await askAiCoach(text);

    const aiReply: AiCoachMessage = {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: advice,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, aiReply]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A231E]/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-[#EDE4D8] shadow-2xl max-w-2xl w-full h-[85vh] flex flex-col justify-between overflow-hidden relative animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#EDE4D8] flex items-center justify-between bg-[#FFF9E6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFD3BA] text-[#7A341A] flex items-center justify-center text-xl shadow-xs border border-[#F8BA9E]">
              🦉
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-[#3B2F27] font-['Nunito',sans-serif]">
                  Peanut the Sprout Owl
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#B8E6D5] text-[#194E3B]">
                  AI Business Advisor
                </span>
              </div>
              <p className="text-[11px] text-[#6B5B4F]">
                Grounded in Philippine student entrepreneurship & your live metrics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#6B5B4F] hover:bg-[#FAF3DE] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Message History */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#FFD3BA] text-[#7A2E1E] flex items-center justify-center text-sm shrink-0 mt-1">
                    🦉
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-[#B8E6D5] text-[#194E3B] font-medium rounded-tr-none'
                      : 'bg-[#FAF7F2] text-[#3B2F27] border border-[#EDE4D8] rounded-tl-none whitespace-pre-line'
                  }`}
                >
                  {isUser ? msg.text : <MarkdownText text={msg.text} />}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#B8E6D5] text-[#194E3B] flex items-center justify-center text-xs font-bold shrink-0 mt-1">
                    You
                  </div>
                )}
              </div>
            );
          })}

          {isAiCoachLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-[#FFD3BA] text-[#7A2E1E] flex items-center justify-center text-sm">
                🦉
              </div>
              <div className="bg-[#FAF7F2] border border-[#EDE4D8] rounded-2xl px-4 py-3 text-xs text-[#7A6B5F] flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin text-[#E07A5F]" />
                <span>Peanut is crunching your numbers & formulating strategy...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-[#F0E9DF] bg-[#FFFDF7] overflow-x-auto flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#8A796D] uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-[#E07A5F]" /> Quick Ask:
          </span>
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 bg-white hover:bg-[#F5EFEB] border border-[#E5DACD] text-[#54453C] text-[11px] font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Input Box */}
        <div className="p-4 border-t border-[#F0E9DF] bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask Peanut about pricing, campus marketing, or cutting expenses..."
              className="flex-1 px-4 py-3 bg-[#FAF7F2] border border-[#E5DACD] rounded-2xl text-xs sm:text-sm text-[#3B2F27] placeholder:text-[#9C8C7E] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
            />

            <button
              type="submit"
              disabled={!inputPrompt.trim() || isAiCoachLoading}
              className="p-3 bg-[#B8E6D5] hover:bg-[#A3DEC9] text-[#194E3B] font-bold rounded-2xl transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
