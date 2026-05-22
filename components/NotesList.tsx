'use client';

import { format } from 'date-fns';

interface Note {
  id: string;
  note: string;
  created_at: string;
}

export function NotesList({ notes }: { notes: Note[] }) {
  if (notes.length === 0) {
    return <p className="text-sm text-slate-500 italic py-2">No notes yet. Add your first call note below.</p>;
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <div key={note.id} className="bg-slate-800 rounded-lg p-3">
          <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{note.note}</p>
          <p className="text-xs text-slate-500 mt-1.5">
            {format(new Date(note.created_at), 'MMM d, yyyy · h:mm a')}
          </p>
        </div>
      ))}
    </div>
  );
}
