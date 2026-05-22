'use client';

import { format } from 'date-fns';

interface Note { id: string; note: string; created_at: string; }

export function NotesList({ notes }: { notes: Note[] }) {
  if (notes.length === 0) {
    return (
      <div className="py-5 px-4 text-center border border-dashed border-white/40 rounded-2xl bg-white/20">
        <p className="text-sm text-slate-400 italic">No notes yet — add your first call note below</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {notes.map((note) => (
        <div key={note.id} className="glass rounded-2xl p-4">
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{note.note}</p>
          <p className="text-xs text-slate-400 mt-2 font-light">
            {format(new Date(note.created_at), 'MMM d, yyyy · h:mm a')}
          </p>
        </div>
      ))}
    </div>
  );
}
