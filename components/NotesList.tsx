'use client';

import { format } from 'date-fns';

interface Note {
  id: string;
  note: string;
  created_at: string;
}

export function NotesList({ notes }: { notes: Note[] }) {
  if (notes.length === 0) {
    return (
      <p className="text-sm text-[#9CA3AF] italic py-3 text-center border border-dashed border-[#E2E4DE] rounded-xl">
        No notes yet — add your first call note below
      </p>
    );
  }

  return (
    <div className="space-y-2.5">
      {notes.map((note) => (
        <div key={note.id} className="bg-[#F8F9F6] rounded-xl p-3.5 border border-[#E8EAE4]">
          <p className="text-sm text-[#121721] leading-relaxed whitespace-pre-wrap">{note.note}</p>
          <p className="text-xs text-[#9CA3AF] mt-2">
            {format(new Date(note.created_at), 'MMM d, yyyy · h:mm a')}
          </p>
        </div>
      ))}
    </div>
  );
}
