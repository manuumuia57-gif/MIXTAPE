import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers,
  Plus,
  RotateCcw,
  Shuffle,
  Trash2,
  XCircle,
} from 'lucide-react';
import { Flashcard, Quiz } from '../types/campus';

interface FlashcardsQuizSectionProps {
  flashcards: Flashcard[];
  quizzes: Quiz[];
  onAddFlashcard: (subject: string, front: string, back: string) => void;
  onToggleMastered: (id: string) => void;
  onDeleteFlashcard: (id: string) => void;
  onQuizComplete: (scorePct: number) => void;
  onNotify: (text: string, tone?: 'info' | 'success' | 'warning') => void;
}

export function FlashcardsQuizSection({
  flashcards,
  quizzes,
  onAddFlashcard,
  onToggleMastered,
  onDeleteFlashcard,
  onQuizComplete,
  onNotify,
}: FlashcardsQuizSectionProps) {
  const [mode, setMode] = useState<'flashcards' | 'quizzes'>('flashcards');

  // Flashcard state
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [shuffledOrder, setShuffledOrder] = useState<string[] | null>(null);

  const [newSubject, setNewSubject] = useState('');
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');

  // Quiz state
  const [selectedQuizId, setSelectedQuizId] = useState<string>(quizzes[0]?.id || '');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);

  const subjects = ['All', ...Array.from(new Set(flashcards.map((c) => c.subject)))];
  const filteredCardsBase = flashcards.filter(
    (c) => subjectFilter === 'All' || c.subject === subjectFilter
  );

  const deck = shuffledOrder
    ? shuffledOrder
        .map((id) => filteredCardsBase.find((c) => c.id === id))
        .filter((c): c is Flashcard => Boolean(c))
    : filteredCardsBase;

  const safeIndex = deck.length > 0 ? cardIndex % deck.length : 0;
  const activeCard = deck[safeIndex] || null;
  const masteredCount = flashcards.filter((c) => c.mastered).length;

  const handleShuffle = () => {
    const ids = [...filteredCardsBase.map((c) => c.id)].sort(() => Math.random() - 0.5);
    setShuffledOrder(ids);
    setCardIndex(0);
    setFlipped(false);
    onNotify('Deck shuffled for randomized active recall.', 'info');
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;
    onAddFlashcard(newSubject || 'General', newFront, newBack);
    setNewFront('');
    setNewBack('');
    onNotify('Flashcard added to deck.', 'success');
  };

  const activeQuiz = quizzes.find((q) => q.id === selectedQuizId) || quizzes[0];

  const handleQuizSubmit = () => {
    if (!activeQuiz) return;
    const correctCount = activeQuiz.questions.filter(
      (q) => answers[q.id] === q.correctIndex
    ).length;
    const scorePct = Math.round((correctCount / activeQuiz.questions.length) * 100);
    setSubmittedQuiz(true);
    onQuizComplete(scorePct);
    onNotify(`Quiz completed: ${scorePct}% accuracy.`, scorePct >= 80 ? 'success' : 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header & Mode Tabs */}
      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A] sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-xl font-bold text-[#101B35] dark:text-white">
            Flashcards &amp; Active Recall Quizzes
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Practice spaced retrieval across {flashcards.length} flashcards and {quizzes.length} subject quizzes.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 self-start dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setMode('flashcards')}
            className={`rounded-md px-4 py-2 text-xs font-semibold transition-colors ${
              mode === 'flashcards'
                ? 'bg-white text-[#101B35] shadow-xs dark:bg-[#0F172A] dark:text-white'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Flashcards ({masteredCount}/{flashcards.length} mastered)
          </button>
          <button
            type="button"
            onClick={() => setMode('quizzes')}
            className={`rounded-md px-4 py-2 text-xs font-semibold transition-colors ${
              mode === 'quizzes'
                ? 'bg-white text-[#101B35] shadow-xs dark:bg-[#0F172A] dark:text-white'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Quizzes ({quizzes.length})
          </button>
        </div>
      </section>

      {mode === 'flashcards' ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Practice Stage */}
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A] lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <select
                value={subjectFilter}
                onChange={(e) => {
                  setSubjectFilter(e.target.value);
                  setShuffledOrder(null);
                  setCardIndex(0);
                  setFlipped(false);
                }}
                aria-label="Filter flashcards by subject"
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                {subjects.map((s) => (
                  <option key={s} value={s}>{s === 'All' ? 'All Subjects' : s}</option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShuffle}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Shuffle className="h-3.5 w-3.5" />
                  <span>Shuffle</span>
                </button>
                <span className="font-mono text-xs text-slate-500 tabular-nums">
                  {deck.length > 0 ? `${safeIndex + 1} / ${deck.length}` : '0 / 0'}
                </span>
              </div>
            </div>

            {activeCard ? (
              <>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setFlipped((f) => !f)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setFlipped((f) => !f);
                    }
                  }}
                  aria-label="Flip flashcard"
                  className="perspective-1000 cursor-pointer"
                >
                  <div
                    className={`relative min-h-[240px] w-full rounded-2xl transition-transform duration-500 transform-style-3d ${
                      flipped ? 'rotate-y-180' : ''
                    }`}
                  >
                    {/* Front */}
                    <div className="backface-hidden absolute inset-0 flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-[#101B35]">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{activeCard.subject} · Question</span>
                        <span>Click card to flip</span>
                      </div>
                      <p className="font-display text-lg font-semibold text-[#101B35] dark:text-white sm:text-xl">
                        {activeCard.front}
                      </p>
                      <span className={`text-xs font-semibold ${activeCard.mastered ? 'text-[#22C55E]' : 'text-slate-400'}`}>
                        {activeCard.mastered ? 'Mastered' : 'Learning'}
                      </span>
                    </div>

                    {/* Back */}
                    <div className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col justify-between rounded-2xl border border-[#3867F4]/40 bg-[#3867F4]/5 p-6 dark:bg-[#3867F4]/15">
                      <div className="flex items-center justify-between text-xs text-[#3867F4] dark:text-indigo-300">
                        <span>{activeCard.subject} · Answer</span>
                        <span>Click card to flip back</span>
                      </div>
                      <p className="text-base leading-relaxed text-slate-800 dark:text-slate-100">
                        {activeCard.back}
                      </p>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Mark mastered below if recalled cleanly
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFlipped(false);
                        setCardIndex((i) => (i - 1 + deck.length) % deck.length);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Previous</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFlipped(false);
                        setCardIndex((i) => (i + 1) % deck.length);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleMastered(activeCard.id)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                        activeCard.mastered
                          ? 'bg-[#22C55E] text-white'
                          : 'border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{activeCard.mastered ? 'Mastered' : 'Mark Mastered'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteFlashcard(activeCard.id);
                        setCardIndex(0);
                        setFlipped(false);
                      }}
                      aria-label="Delete flashcard"
                      className="rounded-lg border border-slate-200 p-2 text-red-600 hover:bg-red-50 dark:border-slate-700 dark:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-12 text-center">
                <Layers className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm text-slate-500">No flashcards in this subject.</p>
              </div>
            )}
          </section>

          {/* Create New Flashcard */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A] lg:col-span-5">
            <h2 className="font-display text-base font-bold text-[#101B35] dark:text-white">
              Create Flashcard
            </h2>
            <form onSubmit={handleCreateCard} className="mt-4 space-y-3">
              <div>
                <label htmlFor="fc-sub" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Subject
                </label>
                <input
                  id="fc-sub"
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g., Computer Science"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="fc-front" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Front (Prompt / Question)
                </label>
                <textarea
                  id="fc-front"
                  rows={2}
                  required
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  placeholder="What is the time complexity of..."
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="fc-back" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Back (Answer / Explanation)
                </label>
                <textarea
                  id="fc-back"
                  rows={3}
                  required
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  placeholder="Concise definition or derivation..."
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#3867F4] py-2.5 text-sm font-semibold text-white hover:bg-[#2952d6]"
              >
                <Plus className="h-4 w-4" />
                <span>Add to Deck</span>
              </button>
            </form>
          </section>
        </div>
      ) : (
        /* Interactive Quizzes */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <aside className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#0F172A] lg:col-span-4">
            <h2 className="px-2 font-display text-sm font-bold text-[#101B35] dark:text-white">
              Select Practice Quiz
            </h2>
            {quizzes.map((qz) => (
              <button
                key={qz.id}
                type="button"
                onClick={() => {
                  setSelectedQuizId(qz.id);
                  setAnswers({});
                  setSubmittedQuiz(false);
                }}
                className={`w-full rounded-xl border p-3.5 text-left transition-colors ${
                  activeQuiz?.id === qz.id
                    ? 'border-[#3867F4] bg-[#3867F4]/8 dark:bg-[#3867F4]/15'
                    : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60'
                }`}
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{qz.title}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {qz.subject} · {qz.difficulty} · {qz.questions.length} questions
                </p>
              </button>
            ))}
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A] lg:col-span-8">
            {activeQuiz && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div>
                    <h2 className="font-display text-lg font-bold text-[#101B35] dark:text-white">
                      {activeQuiz.title}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {activeQuiz.subject} · {activeQuiz.difficulty}
                    </p>
                  </div>
                  {submittedQuiz && (
                    <div className="text-right">
                      <p className="font-mono text-lg font-bold text-[#3867F4] tabular-nums">
                        Score:{' '}
                        {
                          activeQuiz.questions.filter((q) => answers[q.id] === q.correctIndex)
                            .length
                        }{' '}
                        / {activeQuiz.questions.length}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {activeQuiz.questions.map((q, qIdx) => {
                    const chosen = answers[q.id];
                    const isCorrect = chosen === q.correctIndex;
                    return (
                      <div key={q.id} className="space-y-2.5">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {qIdx + 1}. {q.question}
                        </p>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {q.options.map((opt, optIdx) => {
                            const selected = chosen === optIdx;
                            let borderCls = 'border-slate-200 dark:border-slate-700';
                            if (submittedQuiz) {
                              if (optIdx === q.correctIndex) {
                                borderCls = 'border-[#22C55E] bg-[#22C55E]/10';
                              } else if (selected && !isCorrect) {
                                borderCls = 'border-red-500 bg-red-50 dark:bg-red-950/30';
                              }
                            } else if (selected) {
                              borderCls = 'border-[#3867F4] bg-[#3867F4]/10';
                            }

                            return (
                              <button
                                key={opt}
                                type="button"
                                disabled={submittedQuiz}
                                onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                                className={`rounded-xl border px-3.5 py-2.5 text-left text-xs font-medium transition-colors ${borderCls}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {submittedQuiz && (
                          <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs dark:bg-[#101B35]">
                            {isCorrect ? (
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#22C55E]" />
                            ) : (
                              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                            )}
                            <p className="text-slate-700 dark:text-slate-300">
                              <span className="font-semibold">Explanation: </span>
                              {q.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                  {!submittedQuiz ? (
                    <button
                      type="button"
                      onClick={handleQuizSubmit}
                      className="rounded-xl bg-[#3867F4] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2952d6]"
                    >
                      Submit &amp; Calculate Score
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setAnswers({});
                        setSubmittedQuiz(false);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold dark:border-slate-700"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Retake Quiz</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
