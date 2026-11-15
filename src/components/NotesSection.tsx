import React, { useState } from 'react';
import { BookOpen, Check, Copy, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { LectureNote } from '../types/campus';

interface NotesSectionProps {
  notes: LectureNote[];
  onAddNote: (title: string, content: string) => void;
  onUpdateNote: (id: string, title: string, content: string) => void;
  onDeleteNote: (id: string) => void;
  onNotify: (text: string, tone?: 'info' | 'success' | 'warning') => void;
}

export function NotesSection({
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onNotify,
}: NotesSectionProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErrorMsg('Please enter both a note title and lecture content.');
      return;
    }
    setErrorMsg('');
    onAddNote(title, content);
    setTitle('');
    setContent('');
    onNotify('Lecture note saved.', 'success');
  };

  const startEditing = (note: LectureNote) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const saveEdit = (id: string) => {
    if (!editTitle.trim() || !editContent.trim()) return;
    onUpdateNote(id, editTitle, editContent);
    setEditingId(null);
    onNotify('Note updated.', 'success');
  };

  const handleCopy = async (note: LectureNote) => {
    try {
      await navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
      setCopiedId(note.id);
      setTimeout(() => setCopiedId((prev) => (prev === note.id ? null : prev)), 1500);
    } catch {
      onNotify('Unable to copy to clipboard.', 'warning');
    }
  };

  const filteredNotes = notes.filter((note) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      note.title.toLowerCase().includes(q) ||
      note.content.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Quick Lecture Notes</h1>
            <p className="mt-1 text-sm text-slate-500">
              Capture class summaries, key formulas, and reading takeaways.
            </p>
          </div>
          <p className="font-mono text-xs text-slate-500 tabular-nums">
            {notes.length} saved {notes.length === 1 ? 'note' : 'notes'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <div>
            <label htmlFor="noteTitle" className="block text-xs font-medium text-slate-600">
              Note title
            </label>
            <input
              id="noteTitle"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="e.g., Lecture 7 — Macroeconomics Policy"
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="noteInput" className="block text-xs font-medium text-slate-600">
              Lecture notes
            </label>
            <textarea
              id="noteInput"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              rows={5}
              placeholder="Write your lecture notes here..."
              className="mt-1.5 w-full resize-y rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            {errorMsg ? (
              <p className="text-xs font-medium text-red-600" role="alert">
                {errorMsg}
              </p>
            ) : (
              <span />
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-indigo-600"
            >
              <Plus className="h-4 w-4" />
              <span>Save Note</span>
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
          <h2 className="text-base font-semibold text-slate-900">Saved Notes</h2>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              aria-label="Search lecture notes"
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none sm:w-64"
            />
          </div>
        </div>

        {filteredNotes.length === 0 ? (
          <div className="py-12 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-700">
              {notes.length === 0 ? 'No lecture notes saved yet' : 'No matching notes found'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {notes.length === 0
                ? 'Write a title and notes above to store study references locally.'
                : 'Try adjusting your search keywords.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredNotes.map((note) => {
              const isEditing = editingId === note.id;
              const isConfirmingDelete = confirmDeleteId === note.id;

              return (
                <article key={note.id} className="py-5 first:pt-4 last:pb-1">
                  {isEditing ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        aria-label="Edit note title"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 focus:border-indigo-600 focus:outline-none"
                      />
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={4}
                        aria-label="Edit note content"
                        className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-none"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => saveEdit(note.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 whitespace-nowrap"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Save Changes</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 whitespace-nowrap"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                        <div>
                          <h3 className="text-base font-semibold text-slate-900 break-words">
                            {note.title}
                          </h3>
                          <p className="mt-0.5 font-mono text-xs text-slate-400 tabular-nums">
                            {note.date}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopy(note)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 whitespace-nowrap"
                          >
                            {copiedId === note.id ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                                <span className="text-emerald-700">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => startEditing(note)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 whitespace-nowrap"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </button>

                          {isConfirmingDelete ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteNote(note.id);
                                  setConfirmDeleteId(null);
                                  onNotify('Lecture note deleted.', 'info');
                                }}
                                className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 whitespace-nowrap"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 whitespace-nowrap"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(note.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:border-red-200 hover:bg-red-50 whitespace-nowrap"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">
                        {note.content}
                      </p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
