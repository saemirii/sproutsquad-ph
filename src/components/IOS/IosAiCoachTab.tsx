import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, RefreshCw, Bot, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatPHP } from '../../utils/analytics';
import { playIosTap, playIosSuccess } from '../../utils/haptics';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const IosAiCoachTab: React.FC = () => {
  const { activeBusiness, activeBusinessMetrics, askAiCoach, isAiCoachLoading } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Kamusta, student maker! 🦉 I'm **Peanut the Sprout Owl**, your business co-pilot for **${activeBusiness.name}**.\n\nI analyze your live orders, profit margins, and recorded costs to give you high-impact advice tailored for Philippine campus life. What would you like to level up today?`,
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiCoachLoading]);

  const quickPrompts = [
    '📊 Audit my current profit margins',
    '💡 How should I price my next batch?',
    '📦 Tips to reduce campus packaging cost',
    '🎒 How to get more orders for Friday drops?',
  ];

  const handleSendMessage = async (promptToSend?: string) => {
    const text = promptToSend || inputText;
    if (!text.trim() || isAiCoachLoading) return;

    playIosTap();
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    const res = await askAiCoach(text.trim());
    playIosSuccess();

    const aiMsg: Message = {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: res.advice,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, aiMsg]);
  };

  return (
    <div className="flex flex-col h-full bg-[#FFF9E6]">
      {/* iOS Navigation Header */}
      <div className="sticky top-0 z-20 bg-[#FFF9E6]/95 backdrop-blur-md border-b border-[#EDE4D8] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFD3BA] border border-[#F8BA9E] flex items-center justify-center text-xl shadow-xs">
              🦉
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-sm text-[#3B2F27] font-['Nunito',sans-serif]">
                  Peanut AI Coach
                </h1>
                <span className="w-2 h-2 rounded-full bg-[#194E3B] animate-pulse" />
              </div>
              <p className="text-[11px] text-[#6B5B4F] truncate max-w-[200px]">
                Advising {activeBusiness.name}
              </p>
            </div>
          </div>

          {/* Health Pill Indicator */}
          <div className="flex flex-col items-end">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-[#B8E6D5] text-[#194E3B] border border-[#9FD9C3]">
              {activeBusinessMetrics.healthScore} HP • {activeBusinessMetrics.healthStatus.split(' ')[0]}
            </span>
            <span className="text-[9px] text-[#8C7A6D] mt-0.5">
              {activeBusinessMetrics.profitMargin}% Margin
            </span>
          </div>
        </div>

        {/* Live Business Quick Metrics Strip */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-[#EDE4D8]">
          <div className="bg-white p-2 rounded-xl border border-[#EDE4D8] text-center">
            <span className="text-[9px] text-[#8C7A6D] uppercase font-bold block">Revenue</span>
            <span className="text-xs font-black text-[#194E3B]">
              {formatPHP(activeBusinessMetrics.revenue)}
            </span>
          </div>
          <div className="bg-white p-2 rounded-xl border border-[#EDE4D8] text-center">
            <span className="text-[9px] text-[#8C7A6D] uppercase font-bold block">Profit</span>
            <span className="text-xs font-black text-[#7A341A]">
              {formatPHP(activeBusinessMetrics.profit)}
            </span>
          </div>
          <div className="bg-white p-2 rounded-xl border border-[#EDE4D8] text-center">
            <span className="text-[9px] text-[#8C7A6D] uppercase font-bold block">Orders</span>
            <span className="text-xs font-black text-[#3B2F27]">
              {activeBusinessMetrics.orderCount} drops
            </span>
          </div>
        </div>
      </div>

      {/* Messages List Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 scrollbar-none">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-[#194E3B] text-white rounded-br-xs font-medium'
                  : 'bg-white text-[#3B2F27] border border-[#EDE4D8] rounded-bl-xs'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
            <span className="text-[9px] text-[#A39284] mt-1 px-1">
              {msg.timestamp}
            </span>
          </div>
        ))}

        {isAiCoachLoading && (
          <div className="flex items-start gap-2">
            <div className="bg-white border border-[#EDE4D8] rounded-2xl rounded-bl-xs p-3 flex items-center gap-2 shadow-xs">
              <span className="text-base animate-bounce">🦉</span>
                  <span className="text-xs font-bold text-[#6B5B4F]">Peanut is analyzing your metrics...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompt Pills */}
      <div className="px-3 py-1.5 overflow-x-auto scrollbar-none flex items-center gap-1.5 bg-[#FFF9E6] border-t border-[#EDE4D8]">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            disabled={isAiCoachLoading}
            onClick={() => handleSendMessage(prompt)}
            className="px-2.5 py-1 rounded-xl bg-white border border-[#EDE4D8] text-[11px] font-bold text-[#6B5B4F] hover:bg-[#FAF3DE] shrink-0 active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* iOS Style Message Input Bar */}
      <div className="p-3 bg-white border-t border-[#EDE4D8]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 bg-[#FAF3DE] border border-[#EDE4D8] rounded-2xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-[#B8E6D5]"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask Peanut about pricing, expenses, drops..."
            className="flex-1 bg-transparent border-none text-xs sm:text-sm text-[#3B2F27] placeholder:text-[#8C7A6D] focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isAiCoachLoading}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              inputText.trim() && !isAiCoachLoading
                ? 'bg-[#B8E6D5] text-[#194E3B] active:scale-95 shadow-xs'
                : 'bg-[#EDE4D8] text-[#8C7A6D] cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
