import React, { useEffect, useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { ChatMessage, Task } from '../types/campus';

interface AIAssistantSectionProps {
  tasks: Task[];
  courseName: string;
}

const QUICK_PROMPTS = [
  'Generate a 4-day study plan for my upcoming midterm',
  'Explain Raft leader election clearly with an example',
  'Create active recall revision questions & flashcards',
  'Summarize my pending academic tasks into a daily priority order',
  'Suggest time management techniques for exam week',
];

export function AIAssistantSection({ tasks, courseName }: AIAssistantSectionProps) {
  const [aiMode, setAiMode] = useState<'live' | 'demo'>('demo');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'ai-welcome',
      role: 'assistant',
      mode: 'demo',
      timestamp: 'Now',
      content:
        'Hello! I am your FocusCampus Study Assistant. Ask me to generate a study plan, explain a difficult concept, create revision flashcards, or prioritize your deadlines.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => {
        if (data?.aiMode === 'live') {
          setAiMode('live');
        }
      })
      .catch(() => {
        // remain in demo mode
      });
  }, []);

  const sendPrompt = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const pendingSummary = tasks
      .filter((t) => !t.completed)
      .slice(0, 5)
      .map((t) => `${t.title} (${t.priority}, due ${t.date || 'unscheduled'})`)
      .join('; ');

    try {
      const res = await fetch('/api/ai/study-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: trimmed,
          contextSummary: `Course: ${courseName}. Pending tasks: ${pendingSummary || 'None'}`,
        }),
      });
      const data = await res.json();
      const responseMode: 'live' | 'demo' = data.mode === 'live' ? 'live' : 'demo';
      setAiMode(responseMode);

      const botMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        mode: responseMode,
        content: data.reply || 'Unable to generate a response right now.',
        timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          mode: 'demo',
          content: 'Unable to reach the server right now. Please try again in a moment.',
          timestamp: 'Now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendPrompt(input);
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A] sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-xl font-bold text-[#101B35] dark:text-white">
            AI Study Assistant
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Generate study schedules, summarize concepts, and build revision questions via the backend API.
          </p>
        </div>

        <div className="text-right">
          <p
            className={`text-xs font-semibold ${
              aiMode === 'live'
                ? 'text-[#22C55E]'
                : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            {aiMode === 'live'
              ? 'Live Server Gemini API Connected'
              : 'Demo Mode (Structured Sample Responses)'}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {aiMode === 'live'
              ? 'Powered by server-side @google/genai'
              : 'Set GEMINI_API_KEY in server environment to enable live AI'}
          </p>
        </div>
      </section>

      <section className="flex h-[560px] flex-col rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0F172A]">
        {/* Quick Prompt Suggestions */}
        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-4 dark:border-slate-800">
          {QUICK_PROMPTS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => void sendPrompt(q)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-[#3867F4] hover:text-[#3867F4] dark:border-slate-700 dark:bg-[#101B35] dark:text-slate-300"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#3867F4] text-white'
                    : 'border border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-[#101B35] dark:text-slate-200'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#7856FF] dark:text-indigo-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>
                      FocusCampus Assistant · {msg.mode === 'live' ? 'Live Gemini' : 'Demo Mode'}
                    </span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p
                  className={`mt-1.5 font-mono text-[10px] ${
                    msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-[#101B35]">
                Preparing study guidance...
              </div>
            </div>
          )}
        </div>

        {/* Composer */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t border-slate-100 p-4 dark:border-slate-800"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for a study plan, note summary, or revision quiz..."
            aria-label="Message AI Study Assistant"
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-[#3867F4] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#3867F4] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2952d6] disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            <span>Send</span>
          </button>
        </form>
      </section>
    </div>
  );
}
