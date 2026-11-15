import React, { useEffect, useRef, useState } from 'react';
import {
  Archive,
  Bold,
  BookOpen,
  CheckSquare,
  Eye,
  Heading2,
  Highlighter,
  Link2,
  List,
  ListOrdered,
  Pencil,
  Pin,
  Plus,
  Search,
  Star,
  Table,
  Trash2,
} from 'lucide-react';
import { LectureNote, NoteSubject } from '../types/campus';

interface NotesSectionProps {
  notes: LectureNote[];
  onAddNote: (input: {
    title: string;
    content: string;
    subject: NoteSubject;
    tags: string[];
  }) => string;
  onUpdateNote: (id: string, patch: Partial<LectureNote>) => void;
  onDeleteNote: (id: string) => void;
  onNotify: (text: string, tone?: 'info' | 'success' | 'warning') => void;
}

const SUBJECTS = Object.values(NoteSubject);
type NoteFilterTab = 'active' | 'pinned' | 'favorites' | 'archived';

function renderFormattedLine(line: string, idx: number) {
  if (line.startsWith('# ')) {
    return (
      <h2 key={idx} className="mt-4 mb-2 font-display text-lg font-bold text-[#101B35] dark:text-white">
        {line.slice(2)}
      </h2>
    );
  }
  if (line.startsWith('## ')) {
    return (
      <h3 key={idx} className="mt-3 mb-1.5 font-display text-base font-semibold text-[#3867F4] dark:text-indigo-300">
        {line.slice(3)}
      </h3>
    );
  }
  if (line.startsWith('- [x] ') || line.startsWith('- [ ] ')) {
    const checked = line.startsWith('- [x] ');
    return (
      <div key={idx} className="flex items-center gap-2 py-0.5 text-sm">
        <input type="checkbox" checked={checked} readOnly className="rounded border-slate-300" />
        <span className={checked ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}>
          {line.slice(6)}
        </span>
      </div>
    );
  }
  if (line.startsWith('|')) {
    const cells = line
      .split('|')
      .map((c) => c.trim())
      .filter(Boolean);
    if (cells.every((c) => /^-+$/.test(c))) return null;
    return (
      <div key={idx} className="grid grid-cols-3 gap-2 border-b border-slate-200 py-1.5 text-xs dark:border-slate-700">
        {cells.map((cell, cIdx) => (
          <span key={cIdx} className="font-medium text-slate-700 dark:text-slate-300">
            {cell}
          </span>
        ))}
      </div>
    );
  }

  // Highlight ==text== and bold **text**
  const parts = line.split(/(==.*?==|\*\*.*?\*\*)/g);
  return (
    <p key={idx} className="py-0.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
      {parts.map((part, pIdx) => {
        if (part.startsWith('==') && part.endsWith('==')) {
          return (
            <mark key={pIdx} className="rounded bg-amber-200/80 px-1 text-slate-900 dark:bg-amber-400/30 dark:text-amber-100">
              {part.slice(2, -2)}
            </mark>
          );
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-semibold text-slate-900 dark:text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <React.Fragment key={pIdx}>{part}</React.Fragment>;
      })}
    </p>
  );
}

export function NotesSection({
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onNotify,
}: NotesSectionProps) {
  const [selectedId, setSelectedId] = useState<string>(notes[0]?.id || '');
  const [subjectFilter, setSubjectFilter] = useState<'All' | NoteSubject>('All');
  const [filterTab, setFilterTab] = useState<NoteFilterTab>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  const [newTagInput, setNewTagInput] = useState('');
  const [autosaveStatus, setAutosaveStatus] = useState('All changes saved');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const activeNote = notes.find((n) => n.id === selectedId) || notes[0] || null;

  useEffect(() => {
    if (!activeNote && notes.length > 0) {
      setSelectedId(notes[0].id);
    }
  }, [activeNote, notes]);

  const handleCreateBlankNote = () => {
    const chosenSubject = subjectFilter === 'All' ? NoteSubject.ComputerScience : subjectFilter;
    const id = onAddNote({
      title: 'Untitled Lecture Note',
      content: '# Lecture Summary\n\n- Key takeaway 1\n- [ ] Review follow-up reading',
      subject: chosenSubject,
      tags: ['lecture'],
    });
    setSelectedId(id);
    setPreviewMode(false);
    onNotify('Created new lecture note.', 'success');
  };

  const applySnippet = (snippet: string) => {
    if (!activeNote) return;
    const el = textareaRef.current;
    const start = el ? el.selectionStart : activeNote.content.length;
    const end = el ? el.selectionEnd : activeNote.content.length;
    const nextContent =
      activeNote.content.slice(0, start) + snippet + activeNote.content.slice(end);
    setAutosaveStatus('Autosaving...');
    onUpdateNote(activeNote.id, { content: nextContent });
    setTimeout(() => setAutosaveStatus('Autosaved locally'), 350);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNote || !newTagInput.trim()) return;
    const clean = newTagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (!activeNote.tags.includes(clean)) {
      onUpdateNote(activeNote.id, { tags: [...activeNote.tags, clean] });
    }
    setNewTagInput('');
  };

  const filteredNotes = notes
    .filter((n) => {
      if (filterTab === 'archived') return n.archived;
      if (n.archived) return false;
      if (filterTab === 'pinned' && !n.pinned) return false;
      if (filterTab === 'favorites' && !n.favorite) return false;
      return true;
    })
    .filter((n) => subjectFilter === 'All' || n.subject === subjectFilter)
    .filter((n) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.trim().toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some((t) => t.includes(q))
      );
    })
    .sort((a, b) => Number(b.pinned) - Number(a.pinned));

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A] sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-xl font-bold text-[#101B35] dark:text-white">
            Digital Notes &amp; Knowledge Hub
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Organize lecture notes across 8 academic subject folders with rich formatting &amp; instant autosave.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateBlankNote}
          className="inline-flex items-center gap-1.5 self-start rounded-xl bg-[#3867F4] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2952d6] transition-colors whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          <span>New Note</span>
        </button>
      </section>

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Folders & Note List */}
        <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#0F172A] lg:col-span-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes or tags..."
              aria-label="Search notes"
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            {(['active', 'pinned', 'favorites', 'archived'] as NoteFilterTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterTab(tab)}
                className={`flex-1 rounded-md py-1.5 text-[11px] font-semibold capitalize ${
                  filterTab === tab
                    ? 'bg-white text-[#101B35] shadow-xs dark:bg-[#0F172A] dark:text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value as 'All' | NoteSubject)}
            aria-label="Filter notes by subject folder"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="All">All Subject Folders</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <div className="max-h-[460px] divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
            {filteredNotes.length === 0 ? (
              <div className="py-10 text-center">
                <BookOpen className="mx-auto h-7 w-7 text-slate-300" />
                <p className="mt-2 text-xs text-slate-500">No notes in this folder view.</p>
              </div>
            ) : (
              filteredNotes.map((note) => {
                const selected = activeNote?.id === note.id;
                return (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => setSelectedId(note.id)}
                    className={`w-full py-3 px-2.5 text-left transition-colors rounded-lg ${
                      selected
                        ? 'bg-[#3867F4]/10 dark:bg-[#3867F4]/20'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {note.title}
                      </p>
                      <div className="flex items-center gap-1 shrink-0">
                        {note.pinned && <Pin className="h-3.5 w-3.5 text-[#3867F4]" />}
                        {note.favorite && <Star className="h-3.5 w-3.5 text-amber-500" />}
                      </div>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      {note.subject} · {note.updatedAt}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Right: Rich Note Editor */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A] lg:col-span-8">
          {!activeNote ? (
            <div className="flex h-full min-h-[360px] flex-col items-center justify-center text-center">
              <BookOpen className="h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Select or create a lecture note
              </p>
              <button
                type="button"
                onClick={handleCreateBlankNote}
                className="mt-4 rounded-lg bg-[#3867F4] px-4 py-2 text-xs font-semibold text-white"
              >
                Create First Note
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <select
                    value={activeNote.subject}
                    onChange={(e) =>
                      onUpdateNote(activeNote.id, { subject: e.target.value as NoteSubject })
                    }
                    aria-label="Note subject folder"
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <span className="font-mono text-[11px] text-slate-400">{autosaveStatus}</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPreviewMode((p) => !p)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    {previewMode ? <Pencil className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    <span>{previewMode ? 'Edit' : 'Preview'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateNote(activeNote.id, { pinned: !activeNote.pinned })}
                    className={`rounded-lg border p-1.5 ${
                      activeNote.pinned
                        ? 'border-[#3867F4] bg-[#3867F4]/10 text-[#3867F4]'
                        : 'border-slate-200 text-slate-500 dark:border-slate-700'
                    }`}
                    aria-label="Pin note"
                  >
                    <Pin className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateNote(activeNote.id, { favorite: !activeNote.favorite })}
                    className={`rounded-lg border p-1.5 ${
                      activeNote.favorite
                        ? 'border-amber-400 bg-amber-50 text-amber-600 dark:bg-amber-900/30'
                        : 'border-slate-200 text-slate-500 dark:border-slate-700'
                    }`}
                    aria-label="Favorite note"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onUpdateNote(activeNote.id, { archived: !activeNote.archived });
                      onNotify(activeNote.archived ? 'Note restored.' : 'Note archived.', 'info');
                    }}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    aria-label="Archive note"
                  >
                    <Archive className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onDeleteNote(activeNote.id);
                      onNotify('Note deleted.', 'info');
                    }}
                    className="rounded-lg border border-slate-200 p-1.5 text-red-600 hover:bg-red-50 dark:border-slate-700 dark:text-red-400"
                    aria-label="Delete note"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => {
                  setAutosaveStatus('Autosaving...');
                  onUpdateNote(activeNote.id, { title: e.target.value });
                  setTimeout(() => setAutosaveStatus('Autosaved locally'), 350);
                }}
                aria-label="Note title"
                className="w-full font-display text-xl font-bold text-[#101B35] bg-transparent focus:outline-none dark:text-white"
              />

              {/* Rich Formatting Toolbar */}
              {!previewMode && (
                <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1.5 dark:border-slate-800 dark:bg-[#101B35]">
                  {[
                    { icon: Heading2, label: 'Heading', snippet: '\n## Section Heading\n' },
                    { icon: Bold, label: 'Bold', snippet: '**important concept**' },
                    { icon: List, label: 'Bullets', snippet: '\n- Bullet point\n' },
                    { icon: ListOrdered, label: 'Numbered', snippet: '\n1. First step\n' },
                    { icon: CheckSquare, label: 'Checklist', snippet: '\n- [ ] Action item\n' },
                    { icon: Highlighter, label: 'Highlight', snippet: '==key formula==' },
                    { icon: Table, label: 'Table', snippet: '\n| Term | Definition | Example |\n| --- | --- | --- |\n| Concept | Summary | Case |\n' },
                    { icon: Link2, label: 'Link', snippet: '[Reference](https://example.edu)' },
                  ].map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <button
                        key={tool.label}
                        type="button"
                        onClick={() => applySnippet(tool.snippet)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-700 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{tool.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {previewMode ? (
                <div className="min-h-[300px] rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-[#101B35]">
                  {activeNote.content.split('\n').map(renderFormattedLine)}
                </div>
              ) : (
                <textarea
                  ref={textareaRef}
                  rows={13}
                  value={activeNote.content}
                  onChange={(e) => {
                    setAutosaveStatus('Autosaving...');
                    onUpdateNote(activeNote.id, { content: e.target.value });
                    setTimeout(() => setAutosaveStatus('Autosaved locally'), 350);
                  }}
                  aria-label="Note content editor"
                  className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-800 focus:border-[#3867F4] focus:outline-none dark:border-slate-800 dark:bg-[#101B35] dark:text-slate-200"
                />
              )}

              {/* Tags */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold">Tags:</span>
                  {activeNote.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() =>
                        onUpdateNote(activeNote.id, {
                          tags: activeNote.tags.filter((t) => t !== tag),
                        })
                      }
                      className="hover:text-red-500"
                      title="Click to remove tag"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
                <form onSubmit={handleAddTag} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="Add tag..."
                    className="w-28 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    Add
                  </button>
                </form>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
